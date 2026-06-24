#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "weekly-monitoring-comparison-board.md");
const OUT_CSV = path.join(OUT_DIR, "weekly-monitoring-comparison-board.csv");
const OUT_JSON = path.join(OUT_DIR, "weekly-monitoring-comparison-board.json");

const INPUTS = {
  weeklyHistory: "analysis/weekly-monitoring-history.json",
  weeklyCockpit: "analysis/focus-project-weekly-monitoring-cockpit.json",
  fieldworkCockpit: "analysis/focus-project-fieldwork-cockpit.json",
  snapshot: "analysis/current-research-snapshot.json",
};

const PROJECT_ALIASES = {
  "5": ["장미1,2,3차"],
  "9": ["잠실우성4차"],
  "10": ["압구정3"],
  "25": ["한양연립"],
};

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

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("①", "1")
    .replaceAll("②", "2")
    .replaceAll("③", "3")
    .replaceAll("④", "4")
    .replaceAll("⑤", "5")
    .replace(/\s+/g, "")
    .replace(/[()·,./\-_[\]{}]/g, "")
    .replace(/주택재건축정비사업조합|주택재건축정비사업|재건축정비사업조합|재건축정비사업|가로주택정비사업|일대|조합설립인가|사업시행인가|조합/g, "");
}

function matchByAliases(name, aliases, rows, field) {
  const candidates = [name, ...(aliases || [])].map(normalize).filter(Boolean);
  return (rows || []).find((row) => {
    const value = normalize(row[field]);
    return value && candidates.some((candidate) => value.includes(candidate) || candidate.includes(value));
  });
}

function statusLabel(historySummary, latestHistoryRow) {
  if (!latestHistoryRow) return "no_weekly_log";
  if (historySummary.log_count === 1 && latestHistoryRow.baseline_log === "Y") return "baseline_only";
  if (latestHistoryRow.remote_run === "Y") return "fresh_remote_week";
  if (latestHistoryRow.regenerated === "Y") return "local_refresh_only";
  return "logged_no_remote_refresh";
}

function statusMeaning(status) {
  if (status === "baseline_only") return "기준선만 있음";
  if (status === "fresh_remote_week") return "원격 점검 주 반영";
  if (status === "local_refresh_only") return "로컬 재생성만 기록";
  if (status === "logged_no_remote_refresh") return "로그는 있으나 원격점검 없음";
  return "주간 로그 없음";
}

function blockerLabel({ externalWaitStatus, observationStatus, weeklyStatus }) {
  if (String(externalWaitStatus || "").includes("filed_waiting_response")) return "외부 회신 대기";
  if (observationStatus === "ready_to_visit") return "현장 관찰 미입력";
  if (weeklyStatus === "baseline_only" || weeklyStatus === "no_weekly_log") return "실제 주간 점검 미실행";
  return "공식 변화 확인";
}

function nextActionRow(row) {
  if (row.blocker_label === "외부 회신 대기") {
    return `회신 확인 후 intake 입력: ${row.external_wait_status}`;
  }
  if (row.blocker_label === "현장 관찰 미입력") {
    return `${row.route_name} 답사 후 record-fieldwork-observation helper 입력`;
  }
  if (row.blocker_label === "실제 주간 점검 미실행") {
    return "weekly_primary_refresh 실행 후 create-weekly-monitoring-log --write --refresh";
  }
  return row.first_check_action || row.snapshot_next_action || "";
}

function buildRows({ weeklyHistory, weeklyCockpit, fieldworkCockpit, snapshot }) {
  const latestHistoryRow = (weeklyHistory.rows || [])[0] || null;
  const historySummary = weeklyHistory.summary || {};
  const weeklyStatus = statusLabel(historySummary, latestHistoryRow);
  const lifeHistoryRows = weeklyHistory.latest_life_area_rows || [];
  const externalHistoryRows = weeklyHistory.external_wait_rows || [];
  const fieldworkRows = fieldworkCockpit.rows || [];
  const snapshotProjects = snapshot.core_projects || [];
  const snapshotLifeAreas = snapshot.life_areas || [];

  return (weeklyCockpit.rows || []).map((row) => {
    const aliases = PROJECT_ALIASES[String(row.rank)] || [];
    const fieldworkRow = matchByAliases(row.project_name, aliases, fieldworkRows, "project_name") || {};
    const snapshotProject = matchByAliases(row.project_name, aliases, snapshotProjects, "name") || {};
    const snapshotLife = matchByAliases(row.life_area, [], snapshotLifeAreas, "name") || {};
    const lifeHistory = matchByAliases(row.life_area, [], lifeHistoryRows, "life_area") || {};
    const externalHistory = matchByAliases(row.project_name, aliases, externalHistoryRows, "project_name") || {};

    const nextAction = nextActionRow({
      blocker_label: blockerLabel({
        externalWaitStatus: row.external_wait_status,
        observationStatus: fieldworkRow.observation_status || "",
        weeklyStatus,
      }),
      external_wait_status: row.external_wait_status,
      route_name: fieldworkRow.route_name || snapshotLife.fieldwork_route || row.life_area,
      first_check_action: row.first_check_action,
      snapshot_next_action: snapshotProject.next_action || snapshotLife.next_action || "",
    });

    return {
      weekly_status: weeklyStatus,
      weekly_status_label: statusMeaning(weeklyStatus),
      latest_log_date: weeklyHistory.summary?.latest_log_date || "",
      rank: row.rank,
      project_name: row.project_name,
      life_area: row.life_area,
      stage: row.stage,
      blocker_label: blockerLabel({
        externalWaitStatus: row.external_wait_status,
        observationStatus: fieldworkRow.observation_status || "",
        weeklyStatus,
      }),
      baseline_status: row.baseline_status,
      life_area_note: compact([lifeHistory.weekly_change, lifeHistory.interpretation], 2),
      external_wait_status: row.external_wait_status,
      external_wait_action: externalHistory.action || "",
      observation_status: fieldworkRow.observation_status || "",
      route_name: fieldworkRow.route_name || "",
      fieldwork_question: fieldworkRow.fieldwork_question || "",
      official_question: row.weekly_question,
      snapshot_next_action: snapshotProject.next_action || snapshotLife.next_action || "",
      next_best_action: nextAction,
      update_targets: row.update_targets,
      output_route: row.output_route,
    };
  });
}

function summarize(rows, weeklyHistory) {
  return {
    generated_at: weeklyHistory.summary?.generated_at || "",
    focus_project_count: rows.length,
    baseline_only_count: rows.filter((row) => row.weekly_status === "baseline_only").length,
    fresh_remote_week_count: rows.filter((row) => row.weekly_status === "fresh_remote_week").length,
    external_wait_focus_count: rows.filter((row) => row.blocker_label === "외부 회신 대기").length,
    fieldwork_missing_count: rows.filter((row) => row.observation_status === "ready_to_visit").length,
    latest_log_date: weeklyHistory.summary?.latest_log_date || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows, weeklyHistory) {
  const lifeRows = [];
  for (const row of rows) {
    if (lifeRows.some((item) => item.life_area === row.life_area)) continue;
    lifeRows.push({
      life_area: row.life_area,
      weekly_status_label: row.weekly_status_label,
      life_area_note: row.life_area_note,
      next_best_action: row.next_best_action,
    });
  }

  return `# 주간 모니터링 비교 보드

작성 기준: ${summary.generated_at || "미기록"}

이 문서는 현재 핵심 4개 사업의 기준선 판단과 최근 주간 로그 상태를 한 화면에 비교한다. \`weekly-monitoring-history\`가 누적 타임라인이라면, 이 문서는 지금 무엇이 비어 있고 어디부터 점검할지 정하는 실행판이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 핵심 사업 | ${summary.focus_project_count} |
| 기준선만 있는 사업 | ${summary.baseline_only_count} |
| 원격 점검 반영 사업 | ${summary.fresh_remote_week_count} |
| 외부 회신 대기 focus 사업 | ${summary.external_wait_focus_count} |
| 현장 관찰 미입력 | ${summary.fieldwork_missing_count} |

| 항목 | 값 |
| --- | --- |
| 최신 로그일 | ${summary.latest_log_date || "_없음_"} |
| 히스토리 로그 수 | ${weeklyHistory.summary?.log_count || 0} |
| 다음 기본 명령 | node scripts/create-weekly-monitoring-log.mjs --date=YYYY-MM-DD --remote-run=Y --regenerated=Y --write --refresh |

## 핵심 4개 사업 비교

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "life_area", label: "생활권" },
    { key: "weekly_status_label", label: "주간상태" },
    { key: "blocker_label", label: "현재 병목" },
    { key: "external_wait_status", label: "외부대기" },
    { key: "observation_status", label: "현장상태" },
    { key: "next_best_action", label: "다음 행동" },
  ])}

## 사업별 기준선 vs 최신 메모

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "baseline_status", label: "기준선" },
    { key: "life_area_note", label: "생활권 최신 메모" },
    { key: "official_question", label: "이번 공식 질문" },
    { key: "fieldwork_question", label: "현장 질문" },
    { key: "snapshot_next_action", label: "현재 판단 다음 액션" },
  ])}

## 생활권별 바로 실행

${mdTable(lifeRows, [
    { key: "life_area", label: "생활권" },
    { key: "weekly_status_label", label: "주간상태" },
    { key: "life_area_note", label: "최신 메모" },
    { key: "next_best_action", label: "바로 할 일" },
  ])}

## 운영 메모

- \`baseline_only\`는 아직 실제 원격 주간 점검을 한 번도 기록하지 않았다는 뜻이다.
- 외부 회신 대기 사업은 회신 전까지 점검 로그를 여러 번 남겨도 값 확정으로 승격하지 않는다.
- 현장 상태가 \`ready_to_visit\`이면 공식 변화가 없어도 답사 입력으로 비교 체계의 밀도를 높일 수 있다.
`;
}

async function main() {
  const [weeklyHistory, weeklyCockpit, fieldworkCockpit, snapshot] = await Promise.all([
    readJson(INPUTS.weeklyHistory),
    readJson(INPUTS.weeklyCockpit),
    readJson(INPUTS.fieldworkCockpit),
    readJson(INPUTS.snapshot),
  ]);

  const rows = buildRows({ weeklyHistory, weeklyCockpit, fieldworkCockpit, snapshot });
  const summary = summarize(rows, weeklyHistory);
  const payload = { summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows, weeklyHistory));

  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
