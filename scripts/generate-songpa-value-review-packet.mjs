#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const GAP_AUDIT_INPUT = "analysis/songpa-source-gap-audit.json";
const KEY_FIELDS_INPUT = "data/urban/text/notice-key-fields.json";
const MANAGEMENT_RESOLUTION_INPUT = "analysis/management-stage-value-resolution.json";
const OUT_JSON = path.join(OUT_DIR, "songpa-value-review-packet.json");
const OUT_CSV = path.join(OUT_DIR, "songpa-value-review-packet.csv");
const OUT_MD = path.join(OUT_DIR, "songpa-value-review-packet.md");
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

const FIELD_SPECS = [
  {
    field_id: "district_area_sqm",
    field_label: "정비구역 면적",
    matrix_field: "district_area_sqm_official",
    value_field: "district_area_values",
    snippet_field: "district_area_snippets",
  },
  {
    field_id: "total_households",
    field_label: "총 세대수",
    matrix_field: "total_households_official",
    value_field: "households_values",
    snippet_field: "households_snippets",
  },
  {
    field_id: "floor_area_ratio_pct",
    field_label: "용적률",
    matrix_field: "floor_area_ratio_pct_official",
    value_field: "floor_area_ratio_values",
    snippet_field: "floor_area_ratio_snippets",
  },
  {
    field_id: "building_coverage_ratio_pct",
    field_label: "건폐율",
    matrix_field: "building_coverage_ratio_pct_official",
    value_field: "building_coverage_ratio_values",
    snippet_field: "building_coverage_ratio_snippets",
  },
  {
    field_id: "height_floors",
    field_label: "높이/층수",
    matrix_field: "floors_official",
    value_field: "height_floors_values",
    snippet_field: "height_floors_snippets",
  },
  {
    field_id: "infrastructure",
    field_label: "정비기반시설",
    matrix_field: "",
    value_field: "infrastructure_values",
    snippet_field: "infrastructure_snippets",
  },
  {
    field_id: "public_contribution",
    field_label: "공공기여",
    matrix_field: "",
    value_field: "public_contribution_values",
    snippet_field: "public_contribution_snippets",
  },
];

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank), row]));
}

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
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

function firstSnippet(value) {
  const text = String(value || "");
  const first = text.split(" || ")[0] || text;
  return first.replace(/\s+/g, " ").trim().slice(0, 360);
}

function hasSnippet(row, spec) {
  return Boolean(row?.[spec.snippet_field]);
}

function reviewStatus(gap, keyFieldRow, spec, managementRow) {
  if (managementRow) return managementRow.resolution_status;
  if (hasSnippet(keyFieldRow, spec)) return "snippet_ready";
  if (gap?.repair_direct_match_count > 0 && ["district_area_sqm", "floor_area_ratio_pct", "building_coverage_ratio_pct", "height_floors"].includes(spec.field_id)) {
    return "cleanup_summary_fallback";
  }
  return "missing_snippet";
}

function reviewAction(status, gap, spec) {
  if (status === "snippet_ready") return "원문 스니펫과 PDF/HWP 원본을 열어 구조화값과 같은 시점의 값인지 확인";
  if (status === "confirmed_match") return "현재값 유지. 원문 기준값으로 확정 가능";
  if (status === "keep_values_by_source_date") return "고시문 값과 사업개요/공개항목 값을 시점별로 분리해 기록";
  if (status === "public_stage_value_available") return "정보몽땅 공개항목 값을 최신 인가 단계 값으로 별도 기록";
  if (status === "public_stage_date_confirmed") return "인가일은 공개항목 기준으로 기록";
  if (status === "cleanup_summary_fallback") return "정보몽땅 사업개요 값을 보조값으로 유지하고 recordCode/본고시 원문 재검색";
  if (status === "missing_snippet" && gap?.main_gap === "cleanup_summary_only_recordcode_missing") return "서울도시공간포털 recordCode 또는 서울시보 본고시 확보 후 스니펫 재생성";
  if (status === "missing_snippet") return `${spec.field_label} 원문 스니펫 미확보. 원문 파일 또는 OCR 품질 확인`;
  return "수동 검토";
}

function buildRows(matrixRows, gapRows, keyFieldRows, managementRows) {
  const matrixByRank = byRank(matrixRows);
  const keyByRank = byRank(keyFieldRows);
  const managementByRank = groupByRank(managementRows);
  return gapRows.flatMap((gap) => {
    const matrix = matrixByRank[String(gap.rank)] || {};
    const keyField = keyByRank[String(gap.rank)] || {};
    const management = managementByRank[String(gap.rank)] || [];
    return FIELD_SPECS.map((spec) => {
      const managementRow = management.find((row) => row.field_id === spec.field_id);
      const status = reviewStatus(gap, keyField, spec, managementRow);
      return {
        rank: gap.rank,
        project_name: gap.project_name,
        current_stage: gap.current_stage,
        main_gap: gap.main_gap,
        field_id: spec.field_id,
        field_label: spec.field_label,
        matrix_value: spec.matrix_field ? matrix[spec.matrix_field] || "" : "",
        key_field_values: keyField[spec.value_field] || "",
        notice_snippet: firstSnippet(keyField[spec.snippet_field]),
        management_notice_value: managementRow?.notice_value || "",
        management_public_stage_value: managementRow?.public_stage_value || "",
        source_date_basis: managementRow?.source_date_basis || "",
        review_status: status,
        review_action: reviewAction(status, gap, spec),
        source_text_path: keyField.text_path || matrix.text_path || "",
        project_note: matrix.project_note || "",
      };
    });
  });
}

function markdown(rows) {
  const statusRows = Object.entries(
    rows.reduce((acc, row) => {
      acc[row.review_status] = (acc[row.review_status] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([review_status, count]) => ({ review_status, count }))
    .sort((a, b) => b.count - a.count || a.review_status.localeCompare(b.review_status));
  const immediateRows = rows.filter((row) =>
    ["snippet_ready", "keep_values_by_source_date", "public_stage_value_available", "cleanup_summary_fallback"].includes(row.review_status),
  );

  return `# 송파권 원문 수치 검토 패킷

작성 기준: ${UPDATED_AT}

송파권 후보의 기존 고시 원문 텍스트 스니펫, 정보몽땅 사업개요 보조값, 관리처분/사업시행 공개항목 시점차를 필드 단위로 묶은 검토 패킷이다. 새 원문 검색 전후에 어떤 숫자를 확정·분리·보류할지 판단하는 데 쓴다.

## 상태 요약

${mdTable(statusRows, [
  { key: "review_status", label: "상태" },
  { key: "count", label: "건수" },
])}

## 우선 검토 항목

${mdTable(immediateRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "field_label", label: "필드" },
  { key: "matrix_value", label: "현재값" },
  { key: "key_field_values", label: "스니펫 후보값" },
  { key: "management_notice_value", label: "고시값" },
  { key: "management_public_stage_value", label: "공개항목값" },
  { key: "review_status", label: "상태" },
  { key: "review_action", label: "판정" },
])}

## 스니펫 패킷

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "main_gap", label: "병목" },
  { key: "field_label", label: "필드" },
  { key: "matrix_value", label: "현재값" },
  { key: "review_status", label: "상태" },
  { key: "notice_snippet", label: "원문 스니펫" },
  { key: "source_text_path", label: "텍스트" },
])}

## 해석

1. \`snippet_ready\`는 원문 텍스트에서 관련 문맥이 잡혔으나 자동 추출값이 표 구조 때문에 흔들릴 수 있다는 뜻이다.
2. \`keep_values_by_source_date\`는 고시 시점과 정보몽땅 현재/공개항목 시점이 달라 값을 덮어쓰지 않고 병렬 보관한다.
3. \`cleanup_summary_fallback\`은 정보몽땅 사업개요 값은 있지만 고시 원문 연결이 약해, 서울도시공간포털 recordCode 또는 서울시보 본고시가 필요하다는 뜻이다.
4. \`missing_snippet\`은 새 원문 검색 또는 OCR/텍스트 추출 품질 보강 대상이다.
`;
}

async function main() {
  const [matrixRows, gapRows, keyFieldRows, managementRows] = await Promise.all([
    readFile(MATRIX_INPUT, "utf8").then(JSON.parse),
    readFile(GAP_AUDIT_INPUT, "utf8").then(JSON.parse),
    readFile(KEY_FIELDS_INPUT, "utf8").then(JSON.parse),
    readFile(MANAGEMENT_RESOLUTION_INPUT, "utf8").then(JSON.parse),
  ]);
  const rows = buildRows(matrixRows, gapRows, keyFieldRows, managementRows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        projects: new Set(rows.map((row) => row.rank)).size,
        statuses: Object.fromEntries(rows.reduce((acc, row) => acc.set(row.review_status, (acc.get(row.review_status) || 0) + 1), new Map())),
        output: "analysis/songpa-value-review-packet.{md,csv,json}",
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
