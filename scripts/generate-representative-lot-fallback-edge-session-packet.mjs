#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-edge-session-packet.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-edge-session-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-edge-session-packet.json");

const INPUTS = {
  identifierClosureWorkbook: "analysis/representative-lot-fallback-identifier-closure-workbook.json",
  apiProbe: "analysis/representative-lot-fallback-api-probe.json",
};

const URBAN_MAIN_URL = "https://urban.seoul.go.kr/view/new/main.html";

function kstDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function webLink(label, url) {
  return `[${label}](${url})`;
}

function splitSemi(text) {
  return String(text || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function rankValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 9999;
}

function urbanNoticeUrl(noticeCode) {
  const code = String(noticeCode || "").trim();
  return code ? `https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=${code}` : "";
}

function renderUrlList(text) {
  const items = splitSemi(text);
  if (!items.length) return "- 없음";
  return items
    .map((item) => {
      const labelled = /^([^:]+):\s*(https?:\/\/\S+)$/.exec(item);
      if (labelled) return `- ${webLink(labelled[1].trim(), labelled[2].trim())}`;
      return /^https?:\/\//.test(item) ? `- ${webLink(item, item)}` : `- ${item}`;
    })
    .join("\n");
}

function renderFileList(text, limit = 6) {
  const items = splitSemi(text).slice(0, limit);
  if (!items.length) return "- 없음";
  return items
    .map((item) => {
      if (item.startsWith("analysis/") || item.startsWith("project-notes/") || item.startsWith("data/") || item.startsWith("scripts/")) {
        return `- ${fileLink(item)}`;
      }
      return `- ${item}`;
    })
    .join("\n");
}

function buildRows(sourceRows, apiProbeRows) {
  const apiByRank = Object.fromEntries((apiProbeRows || []).map((row) => [String(row.rank || ""), row]));
  return (sourceRows || [])
    .map((row) => {
      const api = apiByRank[String(row.rank || "")] || {};
      const officialUrls = unique([
        `서울도시공간포털 메인: ${URBAN_MAIN_URL}`,
        row.urban_notice_code ? `도시공간포털 고시: ${urbanNoticeUrl(row.urban_notice_code)}` : "",
        row.urban_map_url ? `recordCode popup: ${row.urban_map_url}` : "",
      ]).join("; ");
      return {
        section: "ready_now",
        category: "presentSn 클로저",
        priority_score: 1000 - rankValue(row.watch_rank),
        target: `${row.rank}. ${row.project_name}`,
        area_or_lane: `${row.focus_area} / ${row.current_stage}`,
        status: `${row.probe_relation}; recordCode ${row.urban_record_code}`,
        open_file: "analysis/representative-lot-fallback-edge-session-packet.md",
        api_verdict: api.api_verdict || "",
        api_candidate_name: api.top_candidate_name || "",
        api_present_sn: api.top_present_sn || "",
        api_propel_name: api.top_propel_name || "",
        api_data_reference_date: api.top_data_reference_date || "",
        api_next_action: api.next_action || "",
        first_action: row.browser_sequence,
        official_urls: officialUrls,
        change_signals: "presentSn, 데이터 기준일, 사업유형, 정보몽땅 연결 URL을 한 번에 확인",
        output_route: row.next_update_files,
        first_outputs_to_read: unique([
          "analysis/representative-lot-fallback-api-probe.md",
          "analysis/representative-lot-fallback-workbook.md",
          "analysis/representative-lot-fallback-identifier-closure-workbook.md",
          ...splitSemi(row.sources_to_open),
        ]).join("; "),
        helper_or_next: `node scripts/fetch-representative-lot-fallback-api-probe.mjs -> node scripts/generate-representative-lot-fallback-api-probe.mjs -> ${row.helper_script} -> node scripts/regenerate-research-artifacts.mjs`,
        filing_receipt_no: "",
        next_check_date: "",
        probe_key: row.browser_probe_key,
        accept_gate: row.closure_gate,
        reject_gate: row.reject_gate,
        project_note: splitSemi(row.next_update_files).find((item) => item.startsWith("project-notes/")) || "",
      };
    })
    .sort((left, right) => Number(right.priority_score || 0) - Number(left.priority_score || 0) || left.target.localeCompare(right.target, "ko"));
}

function buildSummary(rows) {
  return {
    generated_at: `${kstDate()} KST`,
    project_count: rows.length,
    same_stage_count: rows.filter((row) => String(row.status).includes("same_stage_candidate")).length,
    stage_gap_count: rows.filter((row) => String(row.status).includes("stage_gap_candidate")).length,
    api_strong_same_stage_count: rows.filter((row) => row.api_verdict === "strong_same_stage_candidate").length,
    api_stage_gap_hold_count: rows.filter((row) => row.api_verdict === "stage_gap_hold").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# Representative Lot Fallback Edge Session Packet

작성 기준: ${summary.generated_at}

이 문서는 Edge 브라우저에서 \`representative_lot_fallback_only\` 6건의 \`presentSn\`를 직접 확인할 때 바로 쓰는 실행 패킷이다. 목표는 현재 단계를 다시 판정하는 것이 아니라, 같은 필지의 UQ120 후보 중 어느 항목이 current business인지 식별하는 것이다.

## 세션 요약

- 대상 사업장: ${summary.project_count}
- same-stage candidate: ${summary.same_stage_count}
- stage-gap candidate: ${summary.stage_gap_count}
- API strong same-stage: ${summary.api_strong_same_stage_count}
- API stage-gap hold: ${summary.api_stage_gap_hold_count}
- 공통 확인값: \`presentSn\`, \`데이터 기준일\`, \`사업유형\`, \`정보몽땅 연결 URL\`

## 먼저 열 파일

1. ${fileLink("analysis/representative-lot-fallback-command-packet.md")}: today 기준 copy-ready 기록 명령, confirmed_current_business면 auto-mark까지 포함
2. ${fileLink("analysis/representative-lot-fallback-api-probe.md")}: API 기준 strong candidate와 hold 후보를 먼저 확인
3. ${fileLink("analysis/representative-lot-fallback-workbook.md")}: direct notice 기준 현재 단계와 보류 사유
4. ${fileLink("analysis/representative-lot-fallback-identifier-closure-workbook.md")}: 대표지번, PNU, UQ120 후보명, 채택 규칙
5. ${fileLink("analysis/project-comparison-matrix.md")}: 현재 정합성 상태와 다음 액션
6. ${fileLink("analysis/current-research-operating-guide.md")}: 전체 운영 우선순위
7. ${fileLink("analysis/representative-lot-fallback-finding-board.md")}: 확인 결과 기록 상태와 승격/보류 보드

## 확인 순서

1. 먼저 \`node scripts/fetch-representative-lot-fallback-api-probe.mjs\`와 \`node scripts/generate-representative-lot-fallback-api-probe.mjs\`를 실행해 strong same-stage 후보가 있는지 본다.
2. \`recordCode popup\`을 열어 direct notice 기준 사업과 구역을 다시 고정한다.
3. 같은 위치에서 대표지번/PNU 기준 UQ120 후보를 찾는다.
4. \`presentSn\`, \`데이터 기준일\`, \`사업유형\`이 같이 보이면 채택 조건과 비교한다.
5. \`same-stage\`면 current business 후보로 승격 검토, \`stage-gap\`면 보류 이유를 유지한다.
6. 가능하면 \`node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied\`로 결과를 먼저 남긴다.
7. auto-mark가 닫히지 않은 confirmed_current_business만 \`node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh\`로 마무리한다.
8. 확인 후 ${fileLink("analysis/representative-lot-fallback-workbook.md")}와 각 사업 메모를 갱신하고 전체 재생성을 돌린다.

## 대상 한눈표

${mdTable(rows, [
    { key: "target", label: "대상" },
    { key: "area_or_lane", label: "생활권/단계" },
    { key: "probe_key", label: "프로브 키" },
    { key: "status", label: "현재 관계" },
    { key: "api_verdict", label: "API 판정" },
    { key: "first_action", label: "브라우저 순서" },
  ])}

${rows
    .map(
      (row, index) => `## 확인 ${index + 1}. ${row.target}

- 현재 상태: ${row.status}
- API 선행 판정: ${row.api_verdict || "-"}
- API 후보: ${row.api_candidate_name || "-"} / ${row.api_present_sn || "-"} / ${row.api_propel_name || "-"} / ${row.api_data_reference_date || "-"}
- 프로브 키: ${row.probe_key}
- 먼저 열 파일: ${fileLink(row.open_file)}
- 공식 URL
${renderUrlList(row.official_urls)}
- 브라우저 순서
  ${row.first_action}
- 채택 조건
  ${row.accept_gate}
- 제외 조건
  ${row.reject_gate}
- 확인 후 반영
  ${row.output_route}
- API 기준 다음 액션
  ${row.api_next_action || "-"}
- helper
  ${row.helper_or_next}
- 결과 기록 helper
  node scripts/record-representative-lot-fallback-finding.mjs --rank=${row.rank || row.target.match(/^(\d+)\./)?.[1] || "NN"} --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --prefill-from-api --write --refresh --auto-mark-applied
- 같이 열 산출물
${renderFileList(row.first_outputs_to_read)}
`,
    )
    .join("\n")}

## 운영 원칙

- \`presentSn\` 하나만 보여도 바로 current business로 확정하지 않는다. \`데이터 기준일\`과 \`사업유형\`을 같이 본다.
- \`stage-gap candidate\`는 같은 필지 후보라도 direct notice보다 앞 단계면 보류를 유지한다.
- 확인값이 없거나 planning 계열만 보이면 기존 \`representative_lot_fallback_only\` 상태를 그대로 둔다.
- 세션 종료 후에는 관련 보드를 먼저 갱신하고 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
`;
}

async function main() {
  const workbook = await readJson(INPUTS.identifierClosureWorkbook);
  const apiProbe = await readJson(INPUTS.apiProbe, { rows: [] });
  const rows = buildRows(workbook.rows || [], apiProbe.rows || []);
  const summary = buildSummary(rows);
  const payload = { summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        project_count: summary.project_count,
        same_stage_count: summary.same_stage_count,
        stage_gap_count: summary.stage_gap_count,
        output: "analysis/representative-lot-fallback-edge-session-packet.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
