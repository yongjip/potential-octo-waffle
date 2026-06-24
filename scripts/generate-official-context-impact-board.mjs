#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-context-impact-board.md");
const OUT_CSV = path.join(OUT_DIR, "official-context-impact-board.csv");
const OUT_JSON = path.join(OUT_DIR, "official-context-impact-board.json");

const INPUTS = {
  contextResults: "analysis/official-context-search-results-board.json",
  catalystTriggers: "analysis/catalyst-trigger-matrix.json",
  publicCatalysts: "analysis/public-development-catalyst-map.json",
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
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

const UPDATED_AT = `${kstDate()} KST`;

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

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function compact(items, limit = 5) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function compactParts(items, limit = 5) {
  return compact(
    items.flatMap((item) =>
      String(item || "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
    limit,
  );
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function impactLevel(row) {
  if (row.result_status === "not_found") return "no_change";
  if (row.evidence_status === "verified_original" || row.result_status === "found_verified_original") return "promotion_review";
  if (row.result_status === "found_original_candidate" || row.evidence_status === "needs_text_extraction") return "original_candidate_review";
  if (row.evidence_status === "context_only" || row.result_status === "found_context") return "context_watch_only";
  return "manual_review";
}

function interpretationRule(row) {
  const level = impactLevel(row);
  if (level === "no_change") return "검색 결과 없음. 결론·가설·점수 변경 없음.";
  if (level === "context_watch_only") return "공식 context 신호로만 보관. 고시·계획·교통대책 원문 연결 전까지 단계·수치·가설 승격 금지.";
  if (level === "original_candidate_review") return "원문 후보로만 보관. 첨부 다운로드와 텍스트 추출 뒤 source verification gate 통과 여부를 재판정.";
  if (level === "promotion_review") return "원문/첨부/로컬 텍스트를 대조한 뒤에만 가설·비교표 승격 검토.";
  return "수동 재검토 필요.";
}

function gateStatus(row) {
  const level = impactLevel(row);
  if (level === "context_watch_only") return "hold_context_only";
  if (level === "no_change") return "hold_no_change";
  if (level === "original_candidate_review") return "needs_original_text";
  if (level === "promotion_review") return "needs_value_crosscheck";
  return "needs_triage";
}

function matchTriggers(resultRow, triggerRows) {
  return triggerRows
    .filter((trigger) => trigger.catalyst_name === resultRow.catalyst_name && (!resultRow.focus_area || trigger.focus_area === resultRow.focus_area))
    .sort((a, b) => Number(b.trigger_priority || 0) - Number(a.trigger_priority || 0));
}

function matchCatalysts(resultRow, catalystRows) {
  return catalystRows
    .filter((row) => row.catalyst_name === resultRow.catalyst_name && (!resultRow.focus_area || row.focus_area === resultRow.focus_area))
    .sort((a, b) => Number(b.catalyst_priority_score || 0) - Number(a.catalyst_priority_score || 0));
}

function buildResultRows({ resultRows, triggerRows, catalystRows }) {
  return resultRows.map((row) => {
    const triggers = matchTriggers(row, triggerRows);
    const catalysts = matchCatalysts(row, catalystRows);
    const level = impactLevel(row);
    return {
      result_id: row.result_id,
      search_id: row.search_id,
      searched_at: row.searched_at,
      source_key: row.source_key,
      catalyst_name: row.catalyst_name,
      focus_area: row.focus_area,
      title: row.title,
      official_url: row.official_url,
      published_at: row.published_at,
      result_status: row.result_status,
      evidence_status: row.evidence_status,
      impact_level: level,
      gate_status: gateStatus(row),
      linked_project_count: new Set(triggers.map((trigger) => trigger.rank)).size || new Set(catalysts.map((item) => item.rank)).size,
      top_projects: compact(triggers.map((trigger) => `${trigger.rank}. ${trigger.project_name}`), 4) || compact(catalysts.map((item) => `${item.rank}. ${item.project_name}`), 4),
      affected_outputs: compactParts([row.affected_outputs, ...triggers.map((trigger) => trigger.affected_outputs)], 6),
      interpretation_rule: interpretationRule(row),
      next_action: row.next_action,
      notes: row.notes,
    };
  });
}

function buildProjectRows({ resultRows, triggerRows, catalystRows, hypothesisByRank }) {
  const rows = [];
  for (const result of resultRows) {
    const level = impactLevel(result);
    const triggers = matchTriggers(result, triggerRows);
    const catalysts = matchCatalysts(result, catalystRows);
    const candidates = triggers.length
      ? triggers.map((trigger) => ({
          rank: trigger.rank,
          project_name: trigger.project_name,
          focus_area: trigger.focus_area,
          current_stage: trigger.current_stage,
          trigger_priority: trigger.trigger_priority,
          signal_class: trigger.signal_class,
          proof_gate: trigger.proof_gate,
          first_sources: trigger.first_sources,
          affected_outputs: trigger.affected_outputs,
        }))
      : catalysts.map((item) => ({
          rank: item.rank,
          project_name: item.project_name,
          focus_area: item.focus_area,
          current_stage: item.current_stage,
          trigger_priority: item.catalyst_priority_score,
          signal_class: "context_link",
          proof_gate: item.official_documents_to_check,
          first_sources: item.official_sources,
          affected_outputs: item.project_note,
        }));
    for (const candidate of candidates) {
      const hypothesis = hypothesisByRank.get(String(candidate.rank)) || {};
      rows.push({
        result_id: result.result_id,
        rank: candidate.rank,
        focus_area: candidate.focus_area,
        project_name: candidate.project_name,
        current_stage: candidate.current_stage,
        catalyst_name: result.catalyst_name,
        impact_level: level,
        gate_status: gateStatus(result),
        signal_class: candidate.signal_class,
        trigger_priority: candidate.trigger_priority,
        hypothesis_status: hypothesis.hypothesis_status_label || hypothesis.hypothesis_status || "",
        current_decision_rule: hypothesis.decision_rule || "",
        required_before_promotion: candidate.proof_gate,
        first_sources: candidate.first_sources,
        affected_outputs: candidate.affected_outputs,
        action_boundary: interpretationRule(result),
        project_note: hypothesis.project_note || "",
      });
    }
  }
  return rows.sort((a, b) => Number(b.trigger_priority || 0) - Number(a.trigger_priority || 0) || Number(a.rank) - Number(b.rank));
}

function summarize(resultRows, projectRows) {
  return {
    generated_at: UPDATED_AT,
    result_count: resultRows.length,
    project_link_count: projectRows.length,
    context_watch_only_count: resultRows.filter((row) => row.impact_level === "context_watch_only").length,
    no_change_count: resultRows.filter((row) => row.impact_level === "no_change").length,
    promotion_review_count: resultRows.filter((row) => row.impact_level === "promotion_review").length,
    original_candidate_review_count: resultRows.filter((row) => row.impact_level === "original_candidate_review").length,
    impacted_project_count: new Set(projectRows.map((row) => row.rank)).size,
    impact_mix: countBy(resultRows, "impact_level"),
    gate_mix: countBy(resultRows, "gate_status"),
    focus_mix: countBy(projectRows, "focus_area"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, resultRows, projectRows) {
  return `# 공식 Context 영향 보드

작성 기준: ${UPDATED_AT}

이 문서는 \`analysis/official-context-search-results-board.md\`에 들어온 공식 검색 결과가 생활권 가설과 사업장 재평가에 어떤 수준으로 연결되는지 판정한다. 보도자료·정책 페이지·교통 안내는 \`context_only\`로만 유지하고, 원문 고시·계획·교통대책·첨부 텍스트가 확인될 때만 승격 검토한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| context 결과 | ${summary.result_count} |
| 연결 사업 행 | ${summary.project_link_count} |
| 연결 사업 수 | ${summary.impacted_project_count} |
| context watch only | ${summary.context_watch_only_count} |
| no change | ${summary.no_change_count} |
| 원문 후보 검토 | ${summary.original_candidate_review_count} |
| 승격 검토 | ${summary.promotion_review_count} |

| 구분 | 값 |
| --- | --- |
| impact | ${summary.impact_mix || "입력 없음"} |
| gate | ${summary.gate_mix || "입력 없음"} |
| 생활권 | ${summary.focus_mix || "입력 없음"} |

## 결과별 영향

${mdTable(resultRows, [
  { key: "result_id", label: "결과 ID" },
  { key: "source_key", label: "출처" },
  { key: "catalyst_name", label: "촉매" },
  { key: "focus_area", label: "생활권" },
  { key: "title", label: "공식 결과" },
  { key: "result_status", label: "결과" },
  { key: "evidence_status", label: "증거" },
  { key: "impact_level", label: "영향 수준" },
  { key: "gate_status", label: "gate" },
  { key: "linked_project_count", label: "연결 사업" },
  { key: "top_projects", label: "상위 연결" },
  { key: "interpretation_rule", label: "해석 규칙" },
])}

## 사업장 연결

${mdTable(projectRows.slice(0, 40), [
  { key: "result_id", label: "결과 ID" },
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "catalyst_name", label: "촉매" },
  { key: "impact_level", label: "영향" },
  { key: "signal_class", label: "기존 신호" },
  { key: "hypothesis_status", label: "가설" },
  { key: "required_before_promotion", label: "승격 전 필요 증거" },
  { key: "action_boundary", label: "이번 결과의 한계" },
])}

## 운영 원칙

- \`context_watch_only\`는 현장답사 질문과 월간 모니터링 우선순위를 보강할 수 있지만, 사업 단계·수치·장기점수 확정 근거가 아니다.
- \`no_change\`는 검색 결과가 없다는 기록일 뿐이며, 결론을 낮추는 근거로 쓰지 않는다.
- 원문 후보 또는 승격 검토는 고시번호·고시일·원문 URL·첨부명·로컬 텍스트 중 확인 가능한 증거가 있어야 한다.
- 이 보드가 바뀌면 \`analysis/catalyst-trigger-matrix.md\`, \`analysis/research-hypothesis-ledger.md\`, 사업별 메모를 같이 확인한다.
`;
}

async function main() {
  const contextResults = await readJson(INPUTS.contextResults);
  const catalystTriggers = await readJson(INPUTS.catalystTriggers);
  const publicCatalysts = await readJson(INPUTS.publicCatalysts);
  const hypothesisLedger = await readJson(INPUTS.hypothesisLedger);

  const resultRows = buildResultRows({
    resultRows: rowsFrom(contextResults),
    triggerRows: rowsFrom(catalystTriggers),
    catalystRows: rowsFrom(publicCatalysts),
  });
  const projectRows = buildProjectRows({
    resultRows: rowsFrom(contextResults),
    triggerRows: rowsFrom(catalystTriggers),
    catalystRows: rowsFrom(publicCatalysts),
    hypothesisByRank: byRank(rowsFrom(hypothesisLedger)),
  });
  const summary = summarize(resultRows, projectRows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown(summary, resultRows, projectRows));
  await writeFile(OUT_CSV, toCsv(projectRows.length ? projectRows : resultRows));
  await writeFile(OUT_JSON, JSON.stringify({ summary, result_rows: resultRows, project_rows: projectRows }, null, 2));
  console.log(JSON.stringify({ results: resultRows.length, projectLinks: projectRows.length, contextOnly: summary.context_watch_only_count, output: "analysis/official-context-impact-board.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
