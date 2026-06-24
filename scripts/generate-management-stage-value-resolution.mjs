#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/management-stage-fact-check.json";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "management-stage-value-resolution.md");
const OUT_CSV = path.join(OUT_DIR, "management-stage-value-resolution.csv");
const OUT_JSON = path.join(OUT_DIR, "management-stage-value-resolution.json");
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
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function valueOrBlank(value) {
  return compact(value);
}

function resolutionForComparison(status) {
  if (status === "confirmed_match") return "confirmed_match";
  if (status === "source_time_diff_or_conflict") return "keep_values_by_source_date";
  return "manual_review_needed";
}

function addRow(rows, base, item) {
  rows.push({
    rank: base.rank,
    focus_area: base.focus_area,
    project_name: base.project_name,
    current_stage: base.current_stage,
    field_id: item.field_id,
    field_label: item.field_label,
    current_summary_value: valueOrBlank(item.current_summary_value),
    notice_value: valueOrBlank(item.notice_value),
    public_stage_value: valueOrBlank(item.public_stage_value),
    source_date_basis: valueOrBlank(item.source_date_basis),
    resolution_status: item.resolution_status,
    recommended_recording: item.recommended_recording,
    next_source_to_check: base.next_source_to_check,
    project_note: base.project_note,
    fact_check_source: "analysis/management-stage-fact-check.md",
  });
}

function buildRows(factRows) {
  const rows = [];
  for (const row of factRows) {
    const base = {
      rank: row.rank,
      focus_area: row.focus_area,
      project_name: row.project_name,
      current_stage: row.current_stage,
      next_source_to_check: row.next_source_to_check,
      project_note: row.project_note,
    };

    addRow(rows, base, {
      field_id: "district_area_sqm",
      field_label: "정비구역 면적",
      current_summary_value: row.summary_area_sqm,
      notice_value: row.urban_area_after_sqm,
      source_date_basis: `사업개요 현재값 vs ${row.notice_no} ${row.notice_date} 고시`,
      resolution_status: resolutionForComparison(row.area_status),
      recommended_recording:
        row.area_status === "confirmed_match"
          ? "구역면적은 사업개요와 고시문이 같은 값으로 취급 가능"
          : "사업개요 현재값과 정비구역 지정 고시 값을 별도 열로 유지",
    });

    addRow(rows, base, {
      field_id: "total_households",
      field_label: "총 세대수",
      current_summary_value: row.summary_total_households,
      notice_value: row.notice_total_households_candidate,
      public_stage_value: row.project_overview_total_units,
      source_date_basis: `정비구역 고시 ${row.notice_date} vs 사업시행/관리처분 공개항목`,
      resolution_status:
        row.project_overview_total_units
          ? "public_stage_value_available"
          : resolutionForComparison(row.households_status),
      recommended_recording:
        row.project_overview_total_units
          ? "정비구역 고시 세대수, 사업시행 세대수, 사업개요 세대수를 시점별로 분리"
          : "사업개요와 고시문 세대수 차이를 시점차로 두고 최신 인가 원문 확인",
    });

    addRow(rows, base, {
      field_id: "floor_area_ratio_pct",
      field_label: "용적률",
      current_summary_value: row.summary_floor_area_ratio_pct,
      notice_value: row.notice_legal_far_pct || row.notice_planned_far_pct,
      public_stage_value: row.project_overview_far_pct,
      source_date_basis: "정비계획 법적상한/계획 용적률 vs 사업시행 공개항목",
      resolution_status:
        row.project_overview_far_pct
          ? "public_stage_value_available"
          : resolutionForComparison(row.far_legal_status),
      recommended_recording:
        row.project_overview_far_pct
          ? "정비계획 법적상한과 사업시행 용적률을 구분해 기록"
          : "정비계획 법적상한은 고시문 기준값으로 유지",
    });

    addRow(rows, base, {
      field_id: "building_coverage_ratio_pct",
      field_label: "건폐율",
      current_summary_value: row.summary_building_coverage_pct,
      notice_value: row.notice_building_coverage_pct_candidate,
      public_stage_value: row.project_overview_coverage_pct,
      source_date_basis: "정비계획 고시 후보값 vs 사업시행 공개항목",
      resolution_status:
        row.project_overview_coverage_pct
          ? "public_stage_value_available"
          : resolutionForComparison(row.coverage_status),
      recommended_recording:
        row.project_overview_coverage_pct
          ? "사업시행 공개항목 건폐율을 최신 사업계획 수치로 별도 기록"
          : "고시문 후보값과 사업개요 값 차이를 시점차로 유지",
    });

    addRow(rows, base, {
      field_id: "floors",
      field_label: "층수",
      current_summary_value: row.summary_floors,
      notice_value: row.notice_max_floor_candidate,
      source_date_basis: "정비구역 고시 최고층 후보 vs 사업개요 층수",
      resolution_status: resolutionForComparison(row.floor_status),
      recommended_recording:
        row.floor_status === "confirmed_match"
          ? "층수는 고시문과 사업개요가 같은 방향으로 확인됨"
          : "최고층 후보와 사업개요 층수를 별도 기록하고 최신 사업시행 원문 확인",
    });

    addRow(rows, base, {
      field_id: "project_approval_date",
      field_label: "사업시행인가일",
      public_stage_value: row.project_approval_date,
      source_date_basis: "정보몽땅 사업시행계획서 공개항목",
      resolution_status: row.project_approval_date ? "public_stage_date_confirmed" : "public_stage_date_missing",
      recommended_recording: row.project_approval_date ? "공개항목 기준 사업시행인가일로 기록" : "공개항목 별첨 또는 자치구 고시로 보강",
    });

    addRow(rows, base, {
      field_id: "management_approval_date",
      field_label: "관리처분인가일",
      public_stage_value: row.management_approval_date,
      source_date_basis: "정보몽땅 관리처분계획서 공개항목",
      resolution_status: row.management_approval_date ? "public_stage_date_confirmed" : "public_stage_date_missing",
      recommended_recording: row.management_approval_date ? "공개항목 기준 관리처분인가일로 기록" : "관리처분 인가 고시 원문으로 보강",
    });

    addRow(rows, base, {
      field_id: "management_construction_cost",
      field_label: "관리처분 공사비",
      public_stage_value: row.management_construction_cost,
      source_date_basis: "정보몽땅 관리처분 공개항목",
      resolution_status: row.management_construction_cost ? "public_stage_value_available" : "public_stage_value_missing",
      recommended_recording: row.management_construction_cost ? "관리처분 공개항목 공사비로 기록하고 단위 원 유지" : "관리처분 별첨 또는 조합 공개표에서 공사비 보강",
    });
  }
  return rows;
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

function markdown(rows) {
  const needsFollowup = rows.filter((row) =>
    ["keep_values_by_source_date", "manual_review_needed", "public_stage_value_missing", "public_stage_date_missing"].includes(row.resolution_status),
  );
  return `# 관리처분 단계 수치 시점 해소

작성 기준: ${UPDATED_AT}

이 문서는 관리처분인가 단계 사업의 수치 차이를 오류로 단정하지 않고, 정비구역 고시 시점·사업시행 공개항목·관리처분 공개항목으로 나눠 기록하기 위한 장부다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 수치 행 | ${rows.length} |
| 후속 확인 필요 | ${needsFollowup.length} |

## 상태별

${mdTable(countBy(rows, "resolution_status"), [
  { key: "name", label: "해석 상태" },
  { key: "count", label: "건수" },
])}

## 수치별 해석

${mdTable(rows, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_summary_value", label: "사업개요/현재값" },
  { key: "notice_value", label: "고시문 값" },
  { key: "public_stage_value", label: "공개항목 값" },
  { key: "resolution_status", label: "해석 상태" },
  { key: "recommended_recording", label: "기록 방식" },
])}

## 후속 확인

${mdTable(needsFollowup, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "resolution_status", label: "상태" },
  { key: "next_source_to_check", label: "다음 원문" },
])}

## 사용법

1. \`public_stage_value_available\`과 \`public_stage_date_confirmed\`는 사업별 메모에 공개항목 기준값으로 유지한다.
2. \`keep_values_by_source_date\`는 고시 시점 값과 사업개요/사업시행/관리처분 값을 별도 열로 보존한다.
3. \`public_stage_value_missing\`은 정보몽땅 공개항목 별첨 또는 자치구 관리처분 인가 고시 원문으로 보강한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const factRows = JSON.parse(await readFile(INPUT, "utf8"));
  const rows = buildRows(factRows);
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(JSON.stringify({
    rows: rows.length,
    projects: new Set(rows.map((row) => row.rank)).size,
    followup: rows.filter((row) =>
      ["keep_values_by_source_date", "manual_review_needed", "public_stage_value_missing", "public_stage_date_missing"].includes(row.resolution_status),
    ).length,
    output: "analysis/management-stage-value-resolution.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
