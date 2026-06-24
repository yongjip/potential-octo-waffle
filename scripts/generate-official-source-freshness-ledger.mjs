#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-source-freshness-ledger.md");
const OUT_CSV = path.join(OUT_DIR, "official-source-freshness-ledger.csv");
const OUT_JSON = path.join(OUT_DIR, "official-source-freshness-ledger.json");

const REGISTRY_INPUT = "analysis/official-update-registry.json";
const RUNBOOK_INPUT = "analysis/official-update-runbook.json";
const CHECKLIST_INPUT = "analysis/official-update-runbook-checklist.json";

function kstDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const UPDATED_AT = `${kstDate()} KST`;
const NOW = new Date();

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function splitList(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function globToRegex(pattern) {
  return new RegExp(`^${pattern.split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
}

async function statPath(file) {
  try {
    const info = await stat(file);
    return { path: file, exists: true, mtimeMs: info.mtimeMs, isDirectory: info.isDirectory() };
  } catch {
    return { path: file, exists: false, mtimeMs: 0, isDirectory: false };
  }
}

async function statPattern(pattern) {
  if (!pattern.includes("*")) return [await statPath(pattern)];
  const dir = path.dirname(pattern);
  const base = path.basename(pattern);
  let names = [];
  try {
    names = await readdir(dir);
  } catch {
    return [{ path: pattern, exists: false, mtimeMs: 0, isDirectory: false }];
  }
  const regex = globToRegex(base);
  const matches = names.filter((name) => regex.test(name)).map((name) => path.join(dir, name));
  if (!matches.length) return [{ path: pattern, exists: false, mtimeMs: 0, isDirectory: false }];
  return Promise.all(matches.map((file) => statPath(file)));
}

async function artifactStats(artifacts) {
  const stats = (await Promise.all(artifacts.map((artifact) => statPattern(artifact)))).flat();
  const present = stats.filter((item) => item.exists);
  const missing = stats.filter((item) => !item.exists);
  const latest = present.sort((a, b) => b.mtimeMs - a.mtimeMs)[0];
  return {
    present_count: present.length,
    missing_count: missing.length,
    latest_path: latest?.path || "",
    latest_mtime: latest ? formatDate(new Date(latest.mtimeMs)) : "",
    latest_age_days: latest ? ageDays(new Date(latest.mtimeMs)) : "",
    missing_examples: compact(missing.map((item) => item.path), 3),
  };
}

function formatDate(date) {
  return kstDate(date);
}

function ageDays(date) {
  return Math.max(0, Math.round((NOW.getTime() - date.getTime()) / 86400000));
}

function cadenceClass(cadence) {
  const text = String(cadence || "");
  if (/push|상시/.test(text)) return "push_or_manual";
  if (/daily/.test(text)) return "daily_candidate";
  if (/weekly/.test(text)) return "weekly";
  if (/monthly/.test(text)) return "monthly";
  if (/ad hoc/.test(text)) return "ad_hoc";
  return "manual";
}

function staleThreshold(cadence) {
  const klass = cadenceClass(cadence);
  if (klass === "daily_candidate") return 3;
  if (klass === "weekly") return 10;
  if (klass === "monthly") return 45;
  return null;
}

function runbookFor(source) {
  if (["seoul_urban_notice", "cleanup_project_status", "cleanup_notice", "district_notice", "seoul_sibo"].includes(source.source_id)) return "weekly_primary_refresh";
  if (["gangdong_district_notice", "jung_district_notice"].includes(source.source_id)) return "expansion_zone_latest_check";
  if (source.source_id === "seoul_urban_alert") return "manual_subscription";
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(source.source_id)) return "monthly_context_scan";
  if (["seoul_open_data", "molit_data_go_kr", "r_one"].includes(source.source_id)) return "monthly_market_data_refresh";
  return "";
}

function freshnessStatus(source, stats) {
  if (source.automation_status === "manual_subscription") return "manual_subscription_needed";
  if (/api_key_needed/.test(source.automation_status || "")) return "api_key_needed";
  if (!stats.present_count && !splitList(source.current_local_artifacts).length) return "manual_context_only";
  if (!stats.present_count) return "missing_local_artifact";
  const threshold = staleThreshold(source.check_cadence);
  if (threshold != null && Number(stats.latest_age_days) > threshold) return "stale_refresh_needed";
  if (/manual/.test(source.automation_status || "") && !/implemented|plan_ready/.test(source.automation_status || "")) return "manual_review_needed";
  return "fresh_enough_for_local_analysis";
}

function nextActionFor(source, status, runbook, checklistRows) {
  if (status === "manual_subscription_needed") return source.manual_step || source.next_action;
  if (status === "api_key_needed") return source.next_action;
  if (status === "missing_local_artifact") return "current_local_artifacts 경로를 확인하고 해당 원격/수동 수집부터 재실행";
  if (status === "stale_refresh_needed") return runbook.followup_local_command || "node scripts/regenerate-research-artifacts.mjs";
  if (status === "manual_review_needed") return source.next_action || source.manual_step;
  const firstNetwork = checklistRows.find((row) => row.runbook_id === runbook.runbook_id && row.status === "network_required");
  return firstNetwork ? `${firstNetwork.command} 후 ${runbook.followup_local_command}` : source.next_action;
}

function statusLabel(status) {
  return {
    fresh_enough_for_local_analysis: "로컬 분석 가능",
    stale_refresh_needed: "갱신 필요",
    missing_local_artifact: "로컬 산출물 없음",
    manual_subscription_needed: "수동 알림 신청",
    manual_context_only: "수동 컨텍스트",
    manual_review_needed: "수동 검토 필요",
    api_key_needed: "API 키 필요",
  }[status] || status;
}

async function buildRows(registry, runbooks, checklist) {
  const runbookMap = new Map(runbooks.map((row) => [row.runbook_id, row]));
  const checklistRows = checklist.checklistRows || [];
  const rows = [];
  for (const source of registry) {
    const artifacts = splitList(source.current_local_artifacts);
    const stats = await artifactStats(artifacts);
    const runbookId = runbookFor(source);
    const runbook = runbookMap.get(runbookId) || { runbook_id: runbookId };
    const status = freshnessStatus(source, stats);
    rows.push({
      source_id: source.source_id,
      tier: source.tier,
      source_name: source.source_name,
      area_scope: source.area_scope,
      check_cadence: source.check_cadence,
      cadence_class: cadenceClass(source.check_cadence),
      automation_status: source.automation_status,
      freshness_status: status,
      freshness_status_label: statusLabel(status),
      present_artifacts: stats.present_count,
      missing_artifacts: stats.missing_count,
      latest_artifact: stats.latest_path,
      latest_artifact_date: stats.latest_mtime,
      latest_age_days: stats.latest_age_days,
      missing_examples: stats.missing_examples,
      recommended_runbook: runbookId,
      first_outputs_to_read: runbook.first_outputs_to_read || source.current_local_artifacts,
      next_action: nextActionFor(source, status, runbook, checklistRows),
      update_signal: source.update_signal,
      monitor_unit: source.monitor_unit,
    });
  }
  return rows.sort((a, b) => statusOrder(a.freshness_status) - statusOrder(b.freshness_status) || tierOrder(a.tier) - tierOrder(b.tier));
}

function statusOrder(status) {
  return {
    stale_refresh_needed: 1,
    missing_local_artifact: 2,
    api_key_needed: 3,
    manual_subscription_needed: 4,
    manual_review_needed: 5,
    manual_context_only: 6,
    fresh_enough_for_local_analysis: 7,
  }[status] || 9;
}

function tierOrder(tier) {
  return { primary: 1, primary_backstop: 2, context: 3, context_backstop: 4, data: 5 }[tier] || 9;
}

function summarize(rows) {
  const countBy = (field) =>
    Object.entries(
      rows.reduce((acc, row) => {
        const key = row[field] || "미분류";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `${key} ${count}`)
      .join("; ");
  return {
    generated_at: UPDATED_AT,
    source_count: rows.length,
    local_ready_count: rows.filter((row) => row.freshness_status === "fresh_enough_for_local_analysis").length,
    refresh_needed_count: rows.filter((row) => row.freshness_status === "stale_refresh_needed").length,
    manual_or_key_needed_count: rows.filter((row) => /manual|api_key/.test(row.freshness_status)).length,
    missing_artifact_source_count: rows.filter((row) => row.freshness_status === "missing_local_artifact").length,
    status_mix: countBy("freshness_status_label"),
    tier_mix: countBy("tier"),
    runbook_mix: countBy("recommended_runbook"),
    inputs: [REGISTRY_INPUT, RUNBOOK_INPUT, CHECKLIST_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const actionRows = rows.filter((row) => row.freshness_status !== "fresh_enough_for_local_analysis");
  const primaryRows = rows.filter((row) => row.tier === "primary" || row.tier === "primary_backstop");
  const fields = [
    { key: "source_id", label: "ID" },
    { key: "tier", label: "등급" },
    { key: "source_name", label: "출처" },
    { key: "freshness_status_label", label: "상태" },
    { key: "latest_artifact_date", label: "최신 로컬" },
    { key: "latest_age_days", label: "경과일" },
    { key: "recommended_runbook", label: "런북" },
    { key: "next_action", label: "다음 액션" },
  ];
  return `# 공식 출처 신선도 장부

작성 기준: ${UPDATED_AT}

이 문서는 공식 업데이트 출처별로 현재 로컬 산출물이 존재하는지, 얼마나 최근에 갱신됐는지, 다음에 어떤 런북을 실행해야 하는지 점검한다. 원격 사이트를 직접 호출하지 않고 로컬 파일 상태와 레지스트리 기준만 사용한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 출처 | ${summary.source_count} |
| 로컬 분석 가능 | ${summary.local_ready_count} |
| 갱신 필요 | ${summary.refresh_needed_count} |
| 수동/API 키 필요 | ${summary.manual_or_key_needed_count} |
| 로컬 산출물 없음 | ${summary.missing_artifact_source_count} |

## 분포

| 구분 | 값 |
| --- | --- |
| 상태 | ${summary.status_mix} |
| 등급 | ${summary.tier_mix} |
| 런북 | ${summary.runbook_mix} |

## 먼저 처리할 출처

${mdTable(actionRows, fields)}

## 핵심 공식 출처

${mdTable(primaryRows, fields)}

## 전체 출처 신선도

${mdTable(rows, [
    ...fields,
    { key: "present_artifacts", label: "존재" },
    { key: "missing_artifacts", label: "누락" },
    { key: "latest_artifact", label: "최신 산출물" },
    { key: "first_outputs_to_read", label: "먼저 읽을 산출물" },
  ])}

## 해석 원칙

- 이 장부는 로컬 산출물 기준 신선도 점검표다. 원격 사이트의 실제 최신 공고 존재 여부는 런북 실행 또는 수동 확인으로만 확정한다.
- 보도자료·정책 페이지·정보소통광장은 context로만 사용하고, 고시번호·고시일·결정조서·원문 URL 확인 전에는 사업 단계 확정 근거로 쓰지 않는다.
- API 키 필요 출처는 goal 완료 병목이 아니라 시장 반응 보강 병목이다. 사업 단계 판정은 공식 고시·인가 원문을 우선한다.
`;
}

async function main() {
  const [registry, runbooks, checklist] = await Promise.all([readJson(REGISTRY_INPUT), readJson(RUNBOOK_INPUT), readJson(CHECKLIST_INPUT)]);
  const rows = await buildRows(registry, runbooks, checklist);
  const summary = summarize(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ sources: rows.length, localReady: summary.local_ready_count, output: "analysis/official-source-freshness-ledger.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
