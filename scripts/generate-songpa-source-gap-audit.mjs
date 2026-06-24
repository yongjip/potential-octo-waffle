#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const EVIDENCE_INPUT = "analysis/source-evidence-audit.json";
const REPAIR_CANDIDATES_INPUT = "analysis/source-link-repair-candidates.json";
const DISTRICT_NOTICE_INPUT = "data/urban/gangnam-songpa-notice-candidates.json";
const SUMMARY_INPUT = "data/cleanup/project-summaries-priority-candidates.json";
const MANAGEMENT_STAGE_DOCS_INPUT = "data/cleanup/management-stage-doc-links.json";
const OUT_JSON = path.join(OUT_DIR, "songpa-source-gap-audit.json");
const OUT_CSV = path.join(OUT_DIR, "songpa-source-gap-audit.csv");
const OUT_MD = path.join(OUT_DIR, "songpa-source-gap-audit.md");
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

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank), row]));
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
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function districtProbeSummary(rows) {
  const candidates = rows.filter((row) => row.search_status === "candidate");
  const high = candidates.filter((row) => row.match_confidence === "high");
  const medium = candidates.filter((row) => row.match_confidence === "medium");
  const noCandidate = rows.some((row) => row.search_status === "no_candidate");
  return {
    status: high.length ? "high_candidate" : medium.length ? "medium_only" : noCandidate ? "no_candidate" : "not_run",
    high_count: high.length,
    medium_count: medium.length,
    titles: unique([...high, ...medium].map((row) => row.notice_title)).slice(0, 3).join("; "),
    keywords: unique(rows.map((row) => row.search_keyword)).slice(0, 5).join("; "),
  };
}

function repairSummary(rows) {
  const direct = rows.filter((row) => row.candidate_status === "direct_value_match");
  return {
    count: rows.length,
    direct_count: direct.length,
    fields: unique(rows.map((row) => row.field_label)).join("; "),
    direct_sources: unique(direct.map((row) => row.candidate_source_label)).join("; "),
    issue_types: unique(rows.map((row) => row.issue_type)).join("; "),
    urls: unique(rows.map((row) => row.candidate_source_url)).slice(0, 3).join("; "),
  };
}

function stageDocSummary(rows) {
  const publicRows = rows.filter((row) => row.access_status === "public_table_extracted");
  return {
    public_count: publicRows.length,
    labels: unique(publicRows.map((row) => `${row.item_label}${row.approval_date ? `(${row.approval_date})` : ""}`)).join("; "),
  };
}

function searchTerms(matrix, summary) {
  return unique([
    matrix.project_name,
    summary?.district_name,
    summary?.location,
    matrix.notice_no ? `서울특별시고시 제${matrix.notice_no}호` : "",
  ]).join("; ");
}

function mainGap(row, repair, stageDocs, districtProbe) {
  if (row.text_coverage === "text_extracted" && ["관리처분인가", "사업시행인가"].includes(row.current_stage)) return "stage_value_reconciliation";
  if (row.text_coverage === "text_extracted") return "official_notice_text_ready";
  if (districtProbe.status === "no_candidate" && repair.direct_count > 0) return "cleanup_summary_only_recordcode_missing";
  if (row.has_urban_map === "N" && repair.direct_count > 0) return "cleanup_summary_only_recordcode_missing";
  if (stageDocs.public_count > 0) return "stage_public_docs_without_notice_text";
  if (row.has_urban_map === "N") return "recordcode_and_notice_missing";
  return "manual_review";
}

function nextAction(gap, row, repair, stageDocs) {
  if (gap === "stage_value_reconciliation") return "관리처분/사업시행 공개항목과 기존 고시문 수치의 시점 차이를 analysis/management-stage-value-resolution.md에서 확정";
  if (gap === "official_notice_text_ready") return "notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다";
  if (gap === "cleanup_summary_only_recordcode_missing") return "정보몽땅 사업개요 값은 보조 근거로 유지하고, 서울도시공간포털 recordCode 또는 서울시보 본고시를 사업명/위치 키워드로 재검색";
  if (gap === "stage_public_docs_without_notice_text") return "정보몽땅 공개항목의 인가일·동의율을 단계 근거로 쓰고, 고시번호/첨부 원문은 서울시보·서울도시공간포털에서 별도 검색";
  if (gap === "recordcode_and_notice_missing") return "서울도시공간포털 지도 검색, 서울시보 권호 검색, 송파구 고시공고 키워드 변형 검색 순서로 원문 후보 재탐색";
  return row.next_evidence_action || "공식 원문 후보 수동 검토";
}

function buildRows(matrixRows, evidenceRows, repairRows, districtNoticeRows, summaryRows, stageDocRows) {
  const evidenceByRank = byRank(evidenceRows);
  const repairByRank = groupByRank(repairRows);
  const districtNoticeByRank = groupByRank(districtNoticeRows);
  const summaryByRank = byRank(summaryRows);
  const stageDocsByRank = groupByRank(stageDocRows);

  return matrixRows
    .filter((row) => row.focus_area === "잠실/송파")
    .map((row) => {
      const evidence = evidenceByRank[String(row.rank)] || {};
      const repair = repairSummary(repairByRank[String(row.rank)] || []);
      const districtProbe = districtProbeSummary(districtNoticeByRank[String(row.rank)] || []);
      const stageDocs = stageDocSummary(stageDocsByRank[String(row.rank)] || []);
      const summary = summaryByRank[String(row.rank)] || {};
      const gap = mainGap(row, repair, stageDocs, districtProbe);
      return {
        rank: row.rank,
        project_name: row.project_name,
        dong: row.dong,
        current_stage: row.current_stage,
        evidence_grade: evidence.evidence_grade || "",
        has_urban_map: row.has_urban_map,
        notice_no: row.notice_no,
        notice_date: row.notice_date,
        text_coverage: row.text_coverage,
        district_probe_status: districtProbe.status,
        district_probe_high_count: districtProbe.high_count,
        district_probe_medium_count: districtProbe.medium_count,
        district_probe_titles: districtProbe.titles,
        cleanup_summary_location: summary.location || "",
        cleanup_summary_area_sqm: summary.district_area_sqm || "",
        cleanup_summary_households: summary.total_households || "",
        repair_candidate_count: repair.count,
        repair_direct_match_count: repair.direct_count,
        repair_fields: repair.fields,
        repair_issue_types: repair.issue_types,
        stage_public_doc_count: stageDocs.public_count,
        stage_public_doc_labels: stageDocs.labels,
        main_gap: gap,
        next_cross_source_action: nextAction(gap, row, repair, stageDocs),
        next_search_terms: searchTerms(row, summary),
        source_links: unique([summary.summary_url, repair.urls].filter(Boolean)).join("; "),
      };
    })
    .sort((a, b) => {
      const order = {
        cleanup_summary_only_recordcode_missing: 0,
        recordcode_and_notice_missing: 1,
        stage_value_reconciliation: 2,
        official_notice_text_ready: 3,
        stage_public_docs_without_notice_text: 4,
        manual_review: 5,
      };
      return (order[a.main_gap] ?? 9) - (order[b.main_gap] ?? 9) || Number(a.rank) - Number(b.rank);
    });
}

function markdown(rows) {
  const gapRows = Object.entries(
    rows.reduce((acc, row) => {
      acc[row.main_gap] = (acc[row.main_gap] || 0) + 1;
      return acc;
    }, {}),
  ).map(([main_gap, count]) => ({ main_gap, count }));

  return `# 송파권 원문 연결 병목 감사

작성 기준: ${UPDATED_AT}

송파권 후보 10개를 대상으로 서울도시공간포털 원문, 송파구청 고시공고 프로브, 정보몽땅 사업개요/공개항목, 기존 원문 텍스트 상태를 한 줄로 합친 작업표다. 목적은 “송파구청에서 안 나온다”를 결론으로 두지 않고, 다음에 어디를 검색해야 하는지 고정하는 것이다.

## 병목 유형

${mdTable(gapRows, [
  { key: "main_gap", label: "병목" },
  { key: "count", label: "건수" },
])}

## 우선 처리표

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "evidence_grade", label: "근거" },
  { key: "has_urban_map", label: "도시공간" },
  { key: "text_coverage", label: "텍스트" },
  { key: "district_probe_status", label: "송파구청" },
  { key: "repair_direct_match_count", label: "정보몽땅 직접값" },
  { key: "stage_public_doc_count", label: "단계공개" },
  { key: "main_gap", label: "병목" },
  { key: "next_cross_source_action", label: "다음 교차확인" },
])}

## 검색 키워드 큐

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "next_search_terms", label: "검색어" },
  { key: "repair_fields", label: "보조값 필드" },
  { key: "cleanup_summary_location", label: "위치" },
  { key: "source_links", label: "현재 근거 링크" },
])}

## 해석

1. \`cleanup_summary_only_recordcode_missing\`은 정보몽땅 사업개요 값은 있으나 고시 recordCode 또는 본고시 원문이 아직 약한 상태다.
2. \`stage_value_reconciliation\`은 원문은 있으나 관리처분/사업시행 공개항목과 고시문 수치의 시점 차이를 풀어야 한다.
3. \`official_notice_text_ready\`는 원문 텍스트가 이미 있으므로 새 검색보다 스니펫 대조와 수치 확정이 우선이다.
4. \`recordcode_and_notice_missing\`은 서울도시공간포털 지도, 서울시보, 송파구청 키워드 변형 검색을 모두 재시도해야 한다.
`;
}

async function main() {
  const [matrixRows, evidenceRows, repairRows, districtNoticeRows, summaryRows, stageDocRows] = await Promise.all([
    readFile(MATRIX_INPUT, "utf8").then(JSON.parse),
    readFile(EVIDENCE_INPUT, "utf8").then(JSON.parse),
    readFile(REPAIR_CANDIDATES_INPUT, "utf8").then(JSON.parse),
    readFile(DISTRICT_NOTICE_INPUT, "utf8").then(JSON.parse),
    readFile(SUMMARY_INPUT, "utf8").then(JSON.parse),
    readFile(MANAGEMENT_STAGE_DOCS_INPUT, "utf8").then(JSON.parse),
  ]);
  const rows = buildRows(matrixRows, evidenceRows, repairRows, districtNoticeRows, summaryRows, stageDocRows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        gaps: Object.fromEntries(Object.entries(rows.reduce((acc, row) => {
          acc[row.main_gap] = (acc[row.main_gap] || 0) + 1;
          return acc;
        }, {}))),
        output: "analysis/songpa-source-gap-audit.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
