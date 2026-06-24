#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DECISIONS_INPUT = "analysis/ocr-image-review-decisions.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-value-update-candidates.md");
const OUT_CSV = path.join(OUT_DIR, "source-value-update-candidates.csv");
const OUT_JSON = path.join(OUT_DIR, "source-value-update-candidates.json");

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

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "(blank)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function matrixFieldFor(fieldId) {
  const map = {
    max_height_m: "max_height_m_official",
    floors: "floors_official",
    district_area_sqm: "district_area_sqm_official",
    total_households: "total_households_official",
    floor_area_ratio_pct: "floor_area_ratio_pct_official",
    building_coverage_ratio_pct: "building_coverage_ratio_pct_official",
  };
  return map[fieldId] || "";
}

function extractFirstNumber(value) {
  return String(value || "").match(/(\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)/)?.[1]?.replaceAll(",", "") || "";
}

function extractNumbers(value) {
  return [...String(value || "").matchAll(/(\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)/g)]
    .map((match) => match[1].replaceAll(",", ""))
    .filter(Boolean);
}

function extractClosestNumber(sourceValue, currentValue) {
  const numbers = extractNumbers(sourceValue);
  const current = Number(String(currentValue || "").replaceAll(",", ""));
  if (!numbers.length) return "";
  if (!Number.isFinite(current)) return numbers[0];
  return numbers
    .map((value) => ({ value, distance: Math.abs(Number(value) - current) }))
    .filter((candidate) => Number.isFinite(candidate.distance))
    .sort((a, b) => a.distance - b.distance || b.value.length - a.value.length)[0]?.value || numbers[0];
}

function normalizeComparableValue(value) {
  return String(value || "").replaceAll(",", "").trim();
}

function normalizeCandidate(decision) {
  if (decision.manual_review_status === "source_value_precision_mismatch") {
    if (decision.field_id === "floor_area_ratio_pct") {
      const preciseFar = extractClosestNumber(decision.source_value, decision.current_value);
      return {
        update_candidate_status: "source_value_update_recommended",
        recommended_structured_value: preciseFar,
        recommended_display_value: preciseFar ? `${preciseFar}% 이하` : decision.source_value || "",
        update_action_type: "replace_with_more_precise_source_value",
        update_rationale: "장부 현재값이 원문 이미지의 소수점 정밀도를 잃었으므로 비교표에는 원문 판독값을 별도 반영한다.",
      };
    }

    if (decision.field_id !== "max_height_m") {
      const preciseValue = extractFirstNumber(decision.source_value);
      return {
        update_candidate_status: "source_value_update_recommended",
        recommended_structured_value: preciseValue,
        recommended_display_value: decision.source_value || preciseValue,
        update_action_type: "replace_with_more_precise_source_value",
        update_rationale: "장부 현재값과 원문 이미지 판독값 사이에 정밀도 차이가 있어 원문 판독값을 별도 반영한다.",
      };
    }

    const heightMatch = String(decision.source_value || "").match(/(\d+(?:\.\d+)?)\s*m/);
    const floorMatch = String(decision.source_value || "").match(/최고\s*(\d+)\s*층/);
    const preciseHeight = heightMatch?.[1] || "";
    const maxFloor = floorMatch?.[1] || "";
    return {
      update_candidate_status: "source_value_update_recommended",
      recommended_structured_value: preciseHeight,
      recommended_display_value: [preciseHeight ? `${preciseHeight}m 이하` : "", maxFloor ? `최고${maxFloor}층 이하` : ""]
        .filter(Boolean)
        .join(" / "),
      update_action_type: "replace_with_more_precise_source_value",
      update_rationale: "장부 현재값이 원문 이미지의 소수점 정밀도를 잃었으므로 비교표에는 원문 판독값을 별도 반영한다.",
    };
  }

  if (decision.field_id === "floors" && decision.manual_review_status === "partial_confirmation_needs_secondary_source") {
    const floorMatch = String(decision.source_value || "").match(/(?:최고\s*)?(\d+)\s*층/);
    const heightMatch = String(decision.source_value || "").match(/(\d+(?:\.\d+)?)\s*m/);
    const maxFloor = floorMatch?.[1] || "";
    const height = heightMatch?.[1] || "";
    return {
      update_candidate_status: "partial_source_confirmation",
      recommended_structured_value: maxFloor ? `지상:${maxFloor}/지하:미확인` : "지상:미확인/지하:미확인",
      recommended_display_value: [maxFloor ? `지상 최고${maxFloor}층 확인` : "", height ? `${height}m 이하 확인` : "", "지하층 2차 확인 필요"]
        .filter(Boolean)
        .join(" / "),
      update_action_type: "split_confirmed_and_unconfirmed_components",
      update_rationale: "원문 이미지는 지상 최고층과 높이를 확인하지만 현재값의 지하층 수는 같은 이미지에서 확인되지 않는다.",
    };
  }

  if (decision.manual_review_status === "source_value_fills_missing_matrix_value") {
    const value = extractFirstNumber(decision.source_value);
    return {
      update_candidate_status: "fill_missing_from_source_image",
      recommended_structured_value: value || decision.source_value || "",
      recommended_display_value: decision.source_value || value,
      update_action_type: "fill_missing_official_value_after_secondary_check",
      update_rationale: "비교 매트릭스의 공란 필드를 원문 이미지에서 판독한 값으로 보강할 수 있다.",
    };
  }

  if (decision.manual_review_status === "source_value_basis_mismatch_needs_secondary_source") {
    return {
      update_candidate_status: "partial_source_confirmation",
      recommended_structured_value: "",
      recommended_display_value: decision.source_value || "",
      update_action_type: "split_source_basis_before_update",
      update_rationale: "원문 이미지 값과 장부 현재값의 기준이 달라 같은 필드로 바로 대체하지 않고 기준을 분리해야 한다.",
    };
  }

  return {
    update_candidate_status: "manual_review_record_only",
    recommended_structured_value: "",
    recommended_display_value: decision.source_value || "",
    update_action_type: "manual_followup",
    update_rationale: decision.decision_note || "",
  };
}

function isResolvedCandidate(row) {
  if (!row.recommended_structured_value) return false;
  return normalizeComparableValue(row.matrix_current_value) === normalizeComparableValue(row.recommended_structured_value);
}

function normalizeRow(decision, matrixByRank) {
  const matrixRow = matrixByRank.get(String(decision.rank)) || {};
  const normalized = normalizeCandidate(decision);
  const matrixField = matrixFieldFor(decision.field_id);
  return {
    decision_id: decision.decision_id,
    rank: decision.rank,
    focus_area: decision.focus_area,
    district: decision.district,
    project_name: decision.project_name,
    current_stage: matrixRow.current_stage || "",
    field_id: decision.field_id,
    field_label: decision.field_label,
    matrix_field: matrixField,
    matrix_current_value: matrixField ? matrixRow[matrixField] || "" : "",
    ledger_current_value: decision.current_value,
    source_image_value: decision.source_value,
    update_candidate_status: normalized.update_candidate_status,
    recommended_structured_value: normalized.recommended_structured_value,
    recommended_display_value: normalized.recommended_display_value,
    update_action_type: normalized.update_action_type,
    update_rationale: normalized.update_rationale,
    source_context: decision.source_context,
    image_path: decision.image_path,
    decision_source: "analysis/ocr-image-review-decisions.md",
    next_action: decision.recommended_value_action,
  };
}

function markdown(rows) {
  return `# 원문 수치 보정 후보

작성 기준: ${UPDATED_AT}

OCR 이미지 수동 검수 결과 중 비교 매트릭스의 구조화 수치에 반영할 후보를 정리한 표다. 이 문서는 자동 덮어쓰기 지시가 아니라, 원문 이미지 판독값과 현재 구조화값의 차이를 추적하고 다음 반영 방식을 정하기 위한 작업표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 보정 후보 | ${rows.length} |
| 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 원문값 보정 권장 | ${rows.filter((row) => row.update_candidate_status === "source_value_update_recommended").length} |
| 공란 보강 후보 | ${rows.filter((row) => row.update_candidate_status === "fill_missing_from_source_image").length} |
| 부분확정/2차 확인 | ${rows.filter((row) => row.update_candidate_status === "partial_source_confirmation").length} |

## 상태별

${mdTable(countBy(rows, "update_candidate_status"), [
  { key: "name", label: "보정 후보 상태" },
  { key: "count", label: "건수" },
])}

## 후보 목록

${mdTable(rows, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "matrix_current_value", label: "매트릭스 현재값" },
  { key: "source_image_value", label: "이미지 원문값" },
  { key: "recommended_structured_value", label: "권장 구조화값" },
  { key: "recommended_display_value", label: "권장 표시값" },
  { key: "update_candidate_status", label: "상태" },
  { key: "update_action_type", label: "반영 방식" },
])}

## 근거와 다음 액션

${mdTable(rows, [
  { key: "decision_id", label: "결정" },
  { key: "source_context", label: "원문 위치" },
  { key: "update_rationale", label: "판단" },
  { key: "next_action", label: "다음 액션" },
  { key: "image_path", label: "이미지" },
])}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [decisions, matrixRows] = await Promise.all([readJson(DECISIONS_INPUT), readJson(MATRIX_INPUT)]);
  const matrixByRank = new Map(matrixRows.map((row) => [String(row.rank), row]));
  const rows = decisions
    .map((decision) => normalizeRow(decision, matrixByRank))
    .filter((row) => row.update_candidate_status !== "manual_review_record_only")
    .filter((row) => !isResolvedCandidate(row));
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        source_value_update_recommended: rows.filter((row) => row.update_candidate_status === "source_value_update_recommended").length,
        partial_source_confirmation: rows.filter((row) => row.update_candidate_status === "partial_source_confirmation").length,
        output: OUT_MD,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
