#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-api-probe.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-api-probe.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-api-probe.json");

const INPUTS = {
  rawProbe: "data/urban/representative-lot-fallback-api-probe.json",
  fallbackWorkbook: "analysis/representative-lot-fallback-identifier-closure-workbook.json",
};

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

function compact(values, limit = 5) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit);
}

function buildRows(raw, fallbackWorkbook) {
  const projectRows = raw.project_rows || [];
  const candidateRows = raw.candidate_rows || [];
  const candidateByRank = candidateRows.reduce((acc, row) => {
    const key = String(row.rank || "");
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(row);
    return acc;
  }, new Map());
  const workbookByRank = Object.fromEntries((fallbackWorkbook.rows || []).map((row) => [String(row.rank), row]));

  return projectRows
    .map((row) => {
      const candidates = (candidateByRank.get(String(row.rank || "")) || []).slice(0, 3);
      const workbook = workbookByRank[String(row.rank || "")] || {};
      return {
        rank: row.rank,
        project_name: row.project_name,
        focus_area: row.focus_area,
        current_stage: row.current_stage,
        probe_relation: row.probe_relation,
        api_verdict: row.top_verdict,
        top_candidate_name: row.top_candidate_name,
        top_present_sn: row.top_present_sn,
        top_propel_name: row.top_propel_name,
        top_data_reference_date: row.top_data_reference_date,
        top_business_type: row.top_business_type,
        top_cleanup_site_url: row.top_cleanup_site_url,
        next_action: row.next_action,
        note: row.note,
        browser_probe_key: workbook.browser_probe_key || "",
        browser_sequence: workbook.browser_sequence || "",
        top_candidates_preview: compact(
          candidates.map(
            (candidate) =>
              `${candidate.candidate_name || "-"} / ${candidate.candidate_propel_name || "-"} / ${candidate.candidate_present_sn || "presentSn 없음"} / ${candidate.verdict || "-"}`,
          ),
          3,
        ).join("; "),
      };
    })
    .sort((left, right) => Number(left.rank || 9999) - Number(right.rank || 9999));
}

function buildSummary(raw, rows) {
  return {
    generated_at: `${kstDate()} KST`,
    raw_generated_at: raw.generated_at || "",
    project_count: rows.length,
    strong_same_stage_candidate_count: rows.filter((row) => row.api_verdict === "strong_same_stage_candidate").length,
    stage_gap_hold_count: rows.filter((row) => row.api_verdict === "stage_gap_hold").length,
    planning_hold_count: rows.filter((row) => row.api_verdict === "planning_hold").length,
    needs_manual_confirmation_count: rows.filter((row) => row.api_verdict === "needs_manual_confirmation").length,
    feature_without_present_sn_count: rows.filter((row) => row.api_verdict === "feature_without_present_sn").length,
    weak_candidate_count: rows.filter((row) => row.api_verdict === "weak_candidate").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# Representative Lot Fallback API Probe

작성 기준: ${summary.generated_at}

이 문서는 fallback 6건에 대해 Edge 수동 확인 전에 API 기준으로 \`presentSn\`, \`데이터 기준일\`, \`사업유형\`, \`진행단계\`가 잡히는지 먼저 본다. 여기서 strong 후보가 잡혀도 비교표에 바로 반영하지는 않고, Edge 또는 공식 화면 대조 후 \`record-representative-lot-fallback-finding\`으로 기록한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| strong same-stage 후보 | ${summary.strong_same_stage_candidate_count} |
| stage-gap hold | ${summary.stage_gap_hold_count} |
| planning hold | ${summary.planning_hold_count} |
| manual confirm 필요 | ${summary.needs_manual_confirmation_count} |
| presentSn 없는 feature | ${summary.feature_without_present_sn_count} |
| weak candidate | ${summary.weak_candidate_count} |

## 먼저 열 파일

1. ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")}
2. ${fileLink("analysis/representative-lot-fallback-identifier-closure-workbook.md")}
3. ${fileLink("analysis/representative-lot-fallback-finding-board.md")}
4. ${fileLink("analysis/representative-lot-fallback-apply-audit.md")}

## 운영 규칙

1. \`strong_same_stage_candidate\`면 Edge에서 값만 대조하고 \`confirmed_current_business\` 입력 후보로 본다.
2. \`stage_gap_hold\`면 direct notice보다 단계가 앞선 후보이므로 current business로 올리지 않는다.
3. \`planning_hold\`면 planning 레이어만 보이는 것으로 보고 채택 금지를 유지한다.
4. \`feature_without_present_sn\` 또는 \`needs_manual_confirmation\`이면 브라우저 확인이 여전히 필요하다.

## 한눈표

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "probe_relation", label: "관계" },
    { key: "api_verdict", label: "API 판정" },
    { key: "top_candidate_name", label: "상위 후보" },
    { key: "top_present_sn", label: "presentSn" },
    { key: "top_propel_name", label: "진행단계" },
    { key: "top_data_reference_date", label: "기준일" },
  ])}

${rows
    .map(
      (row) => `## ${row.rank}. ${row.project_name}

- API 판정: ${row.api_verdict}
- 대표지번/프로브 키: ${row.browser_probe_key || "-"}
- 브라우저 순서: ${row.browser_sequence || "-"}
- 상위 후보: ${row.top_candidate_name || "-"}
- presentSn: ${row.top_present_sn || "-"}
- 단계: ${row.top_propel_name || "-"}
- 사업유형: ${row.top_business_type || "-"}
- 데이터 기준일: ${row.top_data_reference_date || "-"}
- 정보몽땅/공개 링크: ${row.top_cleanup_site_url || "-"}
- 후보 미리보기: ${row.top_candidates_preview || "-"}
- 해석: ${row.note || "-"}
- 다음 액션: ${row.next_action || "-"}
- 기록 helper:
  \`node scripts/record-representative-lot-fallback-finding.mjs --rank=${row.rank} --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh\`
`,
    )
    .join("\n")}
`;
}

async function main() {
  const raw = await readJson(INPUTS.rawProbe, { generated_at: "", project_rows: [], candidate_rows: [] });
  const fallbackWorkbook = await readJson(INPUTS.fallbackWorkbook, { rows: [] });
  const rows = buildRows(raw, fallbackWorkbook);
  const summary = buildSummary(raw, rows);
  const payload = { generated_at: summary.generated_at, summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows));

  console.log(JSON.stringify({ generated_at: summary.generated_at, rows: rows.length, output: OUT_JSON }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
