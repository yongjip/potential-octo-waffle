#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s2-source-link-closure-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "s2-source-link-closure-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "s2-source-link-closure-workbook.json");

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

const INPUTS = {
  sprintPlan: "analysis/source-verification-sprint-plan.json",
  closureBoard: "analysis/source-link-closure-board.json",
  repairCandidates: "analysis/source-link-repair-candidates.json",
  comparison: "analysis/project-comparison-matrix.json",
};

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "queue_rank",
    "priority",
    "focus_area",
    "rank",
    "project_name",
    "current_stage",
    "closure_field_count",
    "closure_ready_count",
    "partial_count",
    "closure_status_summary",
    "field_values_to_close",
    "existing_notice_no",
    "existing_notice_date",
    "local_notice_text_paths",
    "official_summary_urls",
    "candidate_original_notice_paths",
    "recordcode_closure_status",
    "next_lookup_target",
    "next_review_action",
    "project_note",
  ];
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

function groupBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(row);
    return acc;
  }, new Map());
}

function compact(values, limit = 8) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))].slice(0, limit);
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts, limit = 8) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function splitList(value) {
  return String(value || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function chooseClosureStatus(task, closureRows, comparison) {
  const hasOriginalUrl = closureRows.some((row) => row.closure_status === "original_notice_url_available");
  const hasSummaryPending = closureRows.some((row) => row.closure_status === "official_summary_value_match_original_notice_pending");
  if (hasOriginalUrl && hasSummaryPending) return "mixed_original_notice_url_and_summary_pending";
  if (hasOriginalUrl) return "original_notice_url_available";
  if (closureRows.some((row) => row.closure_status === "local_original_notice_text_url_pending")) return "local_original_notice_text_url_pending";
  if (closureRows.some((row) => row.closure_status === "official_summary_value_match_original_notice_pending")) {
    return "official_summary_value_match_original_notice_pending";
  }
  if (comparison.business_notice_code || comparison.business_notice_no) return "business_notice_candidate_present";
  if (comparison.text_path || comparison.gwangjin_gu_notice_text_paths || comparison.gangnam_songpa_notice_text_paths) return "local_text_available_no_closure_rows";
  if (task.source_link_pending_count > 0) return "pending_without_candidate_rows";
  return "needs_manual_recordcode_lookup";
}

function nextLookupTarget(status, comparison) {
  if (status === "mixed_original_notice_url_and_summary_pending") return "확보된 원문 URL로 고시번호/고시일은 닫고, 사업개요 보조값 필드는 같은 원문 내 직접 근거를 추가 확인";
  if (status === "original_notice_url_available") return "원문 URL을 장부/사업별 메모에 확정 근거로 연결";
  if (status === "local_original_notice_text_url_pending") return "로컬 본고시 텍스트의 notice_no/date로 서울도시공간포털 recordCode 또는 다운로드 URL 검색";
  if (status === "official_summary_value_match_original_notice_pending") return "정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색";
  if (status === "business_notice_candidate_present") return "사업구역 레이어 noticeCode/business_notice_code 후보를 원문 URL과 대조";
  if (status === "local_text_available_no_closure_rows") return "확보된 로컬 텍스트의 고시번호·고시일을 추출해 recordCode 검색 키로 사용";
  return "서울도시공간포털 지도, 자치구 고시공고, 서울시보를 사업명·주소·고시번호 순서로 검색";
}

function nextReviewAction(status) {
  if (status === "mixed_original_notice_url_and_summary_pending") return "원문 URL 확보 필드와 사업개요 보조값 필드를 분리해 일부 confirmed, 일부 pending으로 기록";
  if (status === "original_notice_url_available") return "closure_ready=Y로 연결 가능한지 장부 필드와 사업별 메모에 반영";
  if (status === "local_original_notice_text_url_pending") return "URL/recordCode만 보강하면 partial을 Y 후보로 승격";
  if (status === "official_summary_value_match_original_notice_pending") return "값 일치는 유지하되 본고시 원문 미확보 상태를 pending으로 남김";
  if (status === "business_notice_candidate_present") return "business_notice_code가 실제 원문 다운로드로 열리는지 확인";
  if (status === "local_text_available_no_closure_rows") return "로컬 원문 텍스트는 있으나 필드별 클로저가 없으므로 고시번호/일자 중심으로 후보행 생성";
  return "수동 검색 결과가 나오기 전까지 source_link_required 유지";
}

function buildRows({ sprintPlan, closureBoard, repairCandidates, comparison }) {
  const s2Tasks = sprintPlan.taskRows.filter((row) => row.sprint_id === "S2");
  const closureByRank = groupBy(closureBoard, (row) => String(row.rank));
  const candidateByRank = groupBy(repairCandidates, (row) => String(row.rank));
  const comparisonByRank = Object.fromEntries(comparison.map((row) => [String(row.rank), row]));

  return s2Tasks.map((task) => {
    const rank = String(task.rank);
    const comparisonRow = comparisonByRank[rank] || {};
    const closureRows = closureByRank.get(rank) || [];
    const candidateRows = candidateByRank.get(rank) || [];
    const status = chooseClosureStatus(task, closureRows, comparisonRow);
    const localTextPaths = compact([
      comparisonRow.text_path,
      comparisonRow.gwangjin_gu_notice_text_paths,
      comparisonRow.gangnam_songpa_notice_text_paths,
      ...closureRows.flatMap((row) => splitList(row.current_source_to_open).filter((item) => item.endsWith(".txt"))),
      ...candidateRows.map((row) => row.candidate_source_path).filter((item) => String(item).endsWith(".txt")),
    ].flatMap((value) => splitList(value)), 10);
    const officialSummaryUrls = compact(closureRows.map((row) => row.candidate_source_url).filter((url) => /cleanup\.seoul\.go\.kr/.test(String(url))), 5);
    const originalNoticePaths = compact([
      comparisonRow.local_notice_file,
      ...candidateRows.map((row) => row.candidate_source_path),
      ...closureRows.map((row) => row.candidate_source_path),
    ].filter(Boolean), 8);
    return {
      queue_rank: task.queue_rank,
      priority: task.priority,
      focus_area: task.focus_area,
      district: task.district,
      rank,
      project_name: task.project_name,
      current_stage: task.current_stage,
      closure_field_count: closureRows.length,
      closure_ready_count: closureRows.filter((row) => row.closure_ready === "Y").length,
      partial_count: closureRows.filter((row) => row.closure_ready === "partial").length,
      closure_status_summary: countText(countBy(closureRows, "closure_status")),
      field_values_to_close: closureRows.map((row) => `${row.field_label}:${row.current_value}(${row.closure_status})`).join("; "),
      existing_notice_no: comparisonRow.notice_no || comparisonRow.business_notice_no || "",
      existing_notice_date: comparisonRow.notice_date || comparisonRow.business_notice_date || "",
      existing_notice_title: comparisonRow.notice_title || comparisonRow.business_notice_title || "",
      local_notice_text_paths: localTextPaths.join("; "),
      official_summary_urls: officialSummaryUrls.join("; "),
      candidate_original_notice_paths: originalNoticePaths.join("; "),
      has_business_notice_candidate: comparisonRow.has_business_notice_candidate || "",
      business_notice_code: comparisonRow.business_notice_code || "",
      recordcode_closure_status: status,
      next_lookup_target: nextLookupTarget(status, comparisonRow),
      next_review_action: nextReviewAction(status),
      related_public_items: task.related_public_items,
      project_note: task.project_note,
    };
  });
}

function buildSummary(rows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    p0_project_count: rows.filter((row) => row.priority === "P0").length,
    p1_project_count: rows.filter((row) => row.priority === "P1").length,
    closure_field_count: rows.reduce((sum, row) => sum + Number(row.closure_field_count || 0), 0),
    closure_ready_count: rows.reduce((sum, row) => sum + Number(row.closure_ready_count || 0), 0),
    partial_count: rows.reduce((sum, row) => sum + Number(row.partial_count || 0), 0),
    status_counts: countBy(rows, "recordcode_closure_status"),
    focus_area_counts: countBy(rows, "focus_area"),
  };
}

function markdown(rows, summary) {
  return `# S2 원문 링크 클로저 워크북

작성 기준: ${UPDATED_AT}

이 문서는 source-verification-sprint-plan의 S2 recordCode·원문 URL 닫기 태스크를 사업장 단위로 펼친 워크북이다. 필드별 값 일치가 있더라도 본고시 원문 URL 또는 recordCode가 없으면 완료로 보지 않고, 로컬 텍스트·사업개요 보조근거·서울도시공간포털 후보를 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S2 대상 사업장 | ${summary.project_count} |
| P0 사업장 | ${summary.p0_project_count} |
| P1 사업장 | ${summary.p1_project_count} |
| 연결 대상 필드 | ${summary.closure_field_count} |
| URL까지 닫힌 필드 | ${summary.closure_ready_count} |
| partial 필드 | ${summary.partial_count} |
| 상태 분포 | ${countText(summary.status_counts)} |
| 생활권 분포 | ${countText(summary.focus_area_counts)} |

## 사업장별 클로저

${mdTable(rows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "closure_field_count", label: "필드" },
  { key: "partial_count", label: "partial" },
  { key: "recordcode_closure_status", label: "상태" },
  { key: "existing_notice_no", label: "고시번호" },
  { key: "next_lookup_target", label: "검색/확인 대상" },
  { key: "next_review_action", label: "다음 행동" },
])}

## 상세

${rows
  .map(
    (row) => `### ${row.queue_rank}. ${row.project_name}

- 상태: ${row.recordcode_closure_status}
- 닫을 필드: ${row.field_values_to_close || "필드별 클로저 행 없음"}
- 기존 고시: ${row.existing_notice_no || "없음"} ${row.existing_notice_date || ""}
- 로컬 텍스트: ${row.local_notice_text_paths || "없음"}
- 공식 사업개요 URL: ${row.official_summary_urls || "없음"}
- 원문/후보 경로: ${row.candidate_original_notice_paths || "없음"}
- 다음 확인: ${row.next_lookup_target}
- 메모: ${row.project_note}
`,
  )
  .join("\n")}

## 사용법

1. partial 필드가 있는 사업장은 값 일치 근거와 본고시 원문 URL을 분리해 확인한다.
2. local_original_notice_text_url_pending은 로컬 텍스트의 고시번호/고시일로 서울도시공간포털 recordCode 또는 서울시보 URL을 찾는다.
3. official_summary_value_match_original_notice_pending은 정보몽땅 사업개요를 보조근거로 유지하되 본고시 원문 확보 전까지 confirmed로 닫지 않는다.
`;
}

async function main() {
  const data = Object.fromEntries(await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])));
  const rows = buildRows(data);
  const summary = buildSummary(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        closureFields: summary.closure_field_count,
        partial: summary.partial_count,
        statuses: summary.status_counts,
        output: "analysis/s2-source-link-closure-workbook.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
