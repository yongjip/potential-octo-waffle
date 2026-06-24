#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const DECISIONS_INPUT = "data/review/songpa-notice-value-corroboration-decisions.json";
const OUT_MD = path.join(OUT_DIR, "songpa-notice-value-corroboration.md");
const OUT_CSV = path.join(OUT_DIR, "songpa-notice-value-corroboration.csv");
const OUT_JSON = path.join(OUT_DIR, "songpa-notice-value-corroboration.json");

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

const MATRIX_FIELD_MAP = {
  notice_no: "notice_no",
  notice_date: "notice_date",
  district_area_sqm: "district_area_sqm_official",
  total_households: "total_households_official",
  floor_area_ratio_pct: "floor_area_ratio_pct_official",
  building_coverage_ratio_pct: "building_coverage_ratio_pct_official",
  max_height_m: "max_height_m_official",
  floors: "floors_official",
  public_contribution: "",
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

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function statusActionGroup(status) {
  if (["direct_original_notice_confirmed", "fills_missing_matrix_value", "match_or_rounding"].includes(status)) return "promote_or_confirm";
  if (["source_time_or_definition_conflict", "partial_source_confirmation"].includes(status)) return "split_by_definition_or_stage";
  if (["auxiliary_plan_notice_connected", "district_plan_rule_only", "not_directly_confirmed_from_notice"].includes(status)) return "keep_as_auxiliary_context";
  if (status === "ocr_context_needs_image_review") return "image_review_needed";
  return "manual_review";
}

function buildRows(matrixRows, decisions) {
  const matrixByRank = byRank(matrixRows);
  return decisions.map((decision) => {
    const matrix = matrixByRank[String(decision.rank)] || {};
    const field = MATRIX_FIELD_MAP[decision.field_id] || "";
    return {
      rank: decision.rank,
      project_name: matrix.project_name || "",
      focus_area: matrix.focus_area || "",
      current_stage: matrix.current_stage || "",
      notice_no: matrix.notice_no || "",
      notice_date: matrix.notice_date || "",
      local_notice_file: matrix.local_notice_file || "",
      text_path: matrix.text_path || "",
      field_id: decision.field_id,
      field_label: decision.field_label,
      matrix_current_value: field ? matrix[field] || "" : "",
      source_value: decision.source_value || "",
      review_status: decision.review_status,
      action_group: statusActionGroup(decision.review_status),
      recommended_value_action: decision.recommended_value_action,
      evidence_basis: decision.evidence_basis,
      confidence: decision.confidence,
    };
  });
}

function markdown(rows) {
  const statusRows = Object.entries(
    rows.reduce((acc, row) => {
      acc[row.review_status] = (acc[row.review_status] || 0) + 1;
      return acc;
    }, {}),
  ).map(([review_status, count]) => ({ review_status, count }));

  const actionRows = Object.entries(
    rows.reduce((acc, row) => {
      acc[row.action_group] = (acc[row.action_group] || 0) + 1;
      return acc;
    }, {}),
  ).map(([action_group, count]) => ({ action_group, count }));

  return `# 송파권 원문 수치 확정성 판정

작성 기준: ${UPDATED_AT}

장미1,2,3차·송파한양2차·송파미성의 새로 연결된 로컬 원문을 대상으로, 비교 매트릭스에 바로 승격할 수 있는 수치와 상위계획 보조근거에만 머무는 수치를 분리한 수동 판정 로그다.

## 상태 요약

${mdTable(statusRows, [
  { key: "review_status", label: "상태" },
  { key: "count", label: "건수" },
])}

## 후속 액션

${mdTable(actionRows, [
  { key: "action_group", label: "액션 그룹" },
  { key: "count", label: "건수" },
])}

## 판정표

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "field_label", label: "필드" },
  { key: "matrix_current_value", label: "현재값" },
  { key: "source_value", label: "원문값" },
  { key: "review_status", label: "상태" },
  { key: "recommended_value_action", label: "권장 처리" },
  { key: "confidence", label: "확신도" },
])}

## 근거 메모

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "field_label", label: "필드" },
  { key: "evidence_basis", label: "근거" },
  { key: "local_notice_file", label: "원문 파일" },
])}

## 해석

1. 송파미성은 사업별 정비구역 지정고시이므로 면적, 고시번호, 고시일, 세대수, 법적상한용적률, 최고층수는 원문 기반 확정 후보로 볼 수 있다.
2. 장미1,2,3차에 연결된 원문은 잠실아파트지구 개발기본계획 변경 고시라서 사업별 정비계획 수치로 바로 승격하지 않는다.
3. 송파한양2차는 직접 사업 고시 2025-239가 연결됐지만, 면적·용적률 표는 OCR 숫자 오차가 있어 원문 이미지 대조와 단계 정의 분리가 더 필요하다.
4. 건폐율처럼 정보몽땅 현재값과 고시 기준값의 정의가 다른 필드는 덮어쓰지 않고 기준/계획/실시설계 단계 차이로 분리한다.
`;
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const decisions = JSON.parse(await readFile(DECISIONS_INPUT, "utf8"));
  const rows = buildRows(matrixRows, decisions);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(rows, null, 2));
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));

  const statusCounts = rows.reduce((acc, row) => {
    acc[row.review_status] = (acc[row.review_status] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ rows: rows.length, statuses: statusCounts, output: "analysis/songpa-notice-value-corroboration.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
