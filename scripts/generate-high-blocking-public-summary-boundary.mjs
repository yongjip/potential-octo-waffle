#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-public-summary-boundary.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-public-summary-boundary.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-public-summary-boundary.json");

const INPUTS = {
  highBlocking: "analysis/high-blocking-source-escalation-packet.json",
  sourceCandidates: "analysis/source-link-repair-candidates.json",
  mapLayer: "data/urban/map-missing-business-layer-details.csv",
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body
    .filter((item) => item.some((cell) => cell !== ""))
    .map((item) => Object.fromEntries(header.map((field, index) => [field, item[index] ?? ""])));
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "(blank)";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function normalize(value) {
  return String(value ?? "")
    .replaceAll(",", "")
    .replaceAll("㎡", "")
    .replaceAll("%", "")
    .replace(/\s+/g, "")
    .trim();
}

function comparableEqual(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return Math.abs(na - nb) < 0.01;
  return a === b;
}

function mapLayerValue(row, fieldId) {
  if (!row) return "";
  if (fieldId === "district_area_sqm") return row.urban_business_area_sqm || row.layer_area_sqm || "";
  if (fieldId === "floor_area_ratio_pct") return row.building_far_pct || "";
  if (fieldId === "building_coverage_ratio_pct") return row.building_coverage_pct || "";
  if (fieldId === "floors") return row.building_floor || "";
  if (fieldId === "total_households") return row.building_households || row.supply_households || "";
  if (fieldId === "union_approval_date") return row.propel_history || "";
  return "";
}

function mapLayerStatus(row, field) {
  const value = mapLayerValue(row, field.field_id);
  if (!row) return { value: "", status: "not_checked" };
  if (!value) return { value: "", status: "not_available" };
  if (field.field_id === "union_approval_date") {
    return {
      value,
      status: value.includes(String(field.current_value || "").replaceAll("-", ".")) || value.includes(String(field.current_value || "")) ? "same_stage_history" : "stage_history_differs",
    };
  }
  if (comparableEqual(field.current_value, value)) return { value, status: "matches_current_value" };
  return { value, status: "differs_from_current_value" };
}

function candidateIndex(rows) {
  const map = new Map();
  for (const row of rows) {
    map.set(`${row.rank}|${row.field_id}`, row);
    map.set(`${row.rank}|${row.field_label}`, row);
  }
  return map;
}

function classifyBoundary(field, candidate, mapStatus) {
  if (field.field_id === "notice_no" || field.field_id === "notice_date") {
    return "needs_notice_identifier";
  }
  if (field.field_id === "management_construction_cost") {
    return "needs_management_attachment";
  }
  if (!String(field.current_value || "").trim() && mapStatus.value) {
    return "official_layer_candidate_keep_deferred";
  }
  if (mapStatus.status === "differs_from_current_value" || mapStatus.status === "stage_history_differs") {
    return "official_sources_conflict_keep_deferred";
  }
  if (candidate?.candidate_status === "direct_value_match") {
    return "official_summary_supports_value_but_not_notice";
  }
  return "no_public_summary_support_keep_deferred";
}

function buildRows({ highBlocking, sourceCandidates, mapRows }) {
  const candidates = candidateIndex(sourceCandidates);
  const mapByRank = new Map(mapRows.map((row) => [String(row.rank), row]));
  return highBlocking.fieldRows.map((field) => {
    const candidate = candidates.get(`${field.rank}|${field.field_id}`) || candidates.get(`${field.rank}|${field.field_label}`) || null;
    const mapStatus = mapLayerStatus(mapByRank.get(String(field.rank)), field);
    const boundary = classifyBoundary(field, candidate, mapStatus);
    return {
      rank: field.rank,
      focus_area: field.focus_area,
      district: field.district,
      project_name: field.project_name,
      current_stage: field.current_stage,
      field_id: field.field_id,
      field_label: field.field_label,
      current_value: field.current_value,
      blocking_level: field.blocking_level,
      candidate_source: candidate?.candidate_source_label || "",
      candidate_value: candidate?.candidate_value || "",
      candidate_match: candidate?.candidate_match_level || "",
      candidate_url: candidate?.candidate_source_url || "",
      map_layer_value: mapStatus.value,
      map_layer_status: mapStatus.status,
      boundary_status: boundary,
      comparison_use_rule:
        boundary === "official_summary_supports_value_but_not_notice"
          ? "비교표 참고값으로는 사용 가능하지만 본고시/인가 고시번호·첨부 URL 확인 전 confirmed 승격 금지"
          : boundary === "official_sources_conflict_keep_deferred"
            ? "공식 요약 출처 간 값 또는 이력 차이가 있어 단일 대표값 병합 금지"
            : boundary === "official_layer_candidate_keep_deferred"
              ? "도시공간포털 레이어 후보값은 있으나 정보몽땅/인가 원문 대조 전까지 공란 보강 금지"
              : "공개 요약만으로 닫을 수 없으며 담당부서·정보몽땅·정보공개 확인 필요",
      next_action:
        boundary === "needs_management_attachment"
          ? "관리처분계획인가 별첨 또는 공개 가능한 총 공사비/정비사업비 추산액 확인"
          : boundary === "needs_notice_identifier"
            ? "조합설립인가 고시번호·고시일·원문/첨부 URL 확인"
            : boundary === "official_layer_candidate_keep_deferred"
              ? "도시공간포털 레이어 후보값을 정보몽땅 사업개요·조합설립인가 원문과 대조"
              : field.deferred_followups || field.expected_decision_update,
      closure_ids: field.closure_ids,
      source_to_open: field.source_to_open,
    };
  });
}

function buildProjectRows(rows) {
  return Object.values(
    rows.reduce((acc, row) => {
      const rank = String(row.rank);
      if (!acc[rank]) {
        acc[rank] = {
          rank: row.rank,
          focus_area: row.focus_area,
          district: row.district,
          project_name: row.project_name,
          current_stage: row.current_stage,
          fields: 0,
          high_blocking: 0,
          summary_supported: 0,
          official_conflict: 0,
          layer_candidate: 0,
          notice_identifier_needed: 0,
          management_attachment_needed: 0,
          status_mix: {},
        };
      }
      const target = acc[rank];
      target.fields += 1;
      if (row.blocking_level === "high") target.high_blocking += 1;
      if (row.boundary_status === "official_summary_supports_value_but_not_notice") target.summary_supported += 1;
      if (row.boundary_status === "official_sources_conflict_keep_deferred") target.official_conflict += 1;
      if (row.boundary_status === "official_layer_candidate_keep_deferred") target.layer_candidate += 1;
      if (row.boundary_status === "needs_notice_identifier") target.notice_identifier_needed += 1;
      if (row.boundary_status === "needs_management_attachment") target.management_attachment_needed += 1;
      target.status_mix[row.boundary_status] = (target.status_mix[row.boundary_status] || 0) + 1;
      return acc;
    }, {}),
  )
    .map((row) => ({ ...row, status_summary: countText(row.status_mix) }))
    .sort((a, b) => b.high_blocking - a.high_blocking || Number(a.rank) - Number(b.rank));
}

function markdown({ summary, projectRows, rows }) {
  return `# High Blocking 공식 요약값 사용 경계

작성 기준: ${UPDATED_AT}

이 문서는 high blocking 잔여 필드 중 정보몽땅 사업개요·서울도시공간포털 사업구역 레이어 같은 공식 요약값으로 참고 가능한 항목과, 본고시/인가 고시번호·첨부 URL 없이는 확정값으로 승격하면 안 되는 항목을 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 필드 | ${summary.field_count} |
| high blocking | ${summary.high_blocking_count} |
| 공식 요약값 일치 | ${summary.summary_supported_count} |
| 공식 출처 간 충돌/시점차 | ${summary.official_conflict_count} |
| 레이어 후보값 보류 | ${summary.layer_candidate_count} |
| 고시번호·고시일 필요 | ${summary.notice_identifier_needed_count} |
| 관리처분 별첨 필요 | ${summary.management_attachment_needed_count} |
| 상태 분포 | ${summary.boundary_status_counts} |

## 사업별 경계

${mdTable(projectRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "current_stage", label: "단계" },
  { key: "fields", label: "필드" },
  { key: "summary_supported", label: "요약값 일치" },
  { key: "official_conflict", label: "공식 충돌" },
  { key: "layer_candidate", label: "레이어 후보" },
  { key: "notice_identifier_needed", label: "고시번호 필요" },
  { key: "management_attachment_needed", label: "별첨 필요" },
  { key: "status_summary", label: "상태" },
])}

## 필드별 판정

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재값" },
  { key: "candidate_value", label: "정보몽땅 후보" },
  { key: "candidate_match", label: "후보 일치" },
  { key: "map_layer_value", label: "도시공간포털 값" },
  { key: "map_layer_status", label: "레이어 상태" },
  { key: "boundary_status", label: "경계 판정" },
  { key: "comparison_use_rule", label: "사용 규칙" },
])}

## 운영 규칙

1. \`official_summary_supports_value_but_not_notice\`는 비교표의 참고값으로는 쓸 수 있지만, 본고시/인가 고시번호·첨부 URL 확인 전에는 confirmed로 승격하지 않는다.
2. \`official_sources_conflict_keep_deferred\`는 정보몽땅 사업개요와 서울도시공간포털 레이어가 서로 다른 값 또는 이력을 보이는 경우다. 단일 대표값으로 병합하지 않는다.
3. \`official_layer_candidate_keep_deferred\`는 도시공간포털 레이어 후보값이 있지만 정보몽땅/인가 원문 대조가 아직 부족한 경우다. 후보값을 바로 공란 보강에 쓰지 않는다.
4. \`needs_notice_identifier\`는 고시번호·고시일·원문 URL 자체가 비어 있는 병목이다. 값 후보가 있어도 담당부서 또는 정보공개 확인 전까지 high blocking으로 유지한다.
5. \`needs_management_attachment\`는 관리처분계획인가 별첨 또는 공개 가능한 총 공사비/정비사업비 추산액이 필요하다.
`;
}

async function main() {
  const highBlocking = JSON.parse(await readFile(INPUTS.highBlocking, "utf8"));
  const sourceCandidates = JSON.parse(await readFile(INPUTS.sourceCandidates, "utf8"));
  const mapRows = parseCsv(await readFile(INPUTS.mapLayer, "utf8"));
  const rows = buildRows({ highBlocking, sourceCandidates, mapRows });
  const projectRows = buildProjectRows(rows);
  const summary = {
    generated_at: UPDATED_AT,
    field_count: rows.length,
    high_blocking_count: rows.filter((row) => row.blocking_level === "high").length,
    summary_supported_count: rows.filter((row) => row.boundary_status === "official_summary_supports_value_but_not_notice").length,
    official_conflict_count: rows.filter((row) => row.boundary_status === "official_sources_conflict_keep_deferred").length,
    layer_candidate_count: rows.filter((row) => row.boundary_status === "official_layer_candidate_keep_deferred").length,
    notice_identifier_needed_count: rows.filter((row) => row.boundary_status === "needs_notice_identifier").length,
    management_attachment_needed_count: rows.filter((row) => row.boundary_status === "needs_management_attachment").length,
    boundary_status_counts: countText(countBy(rows, "boundary_status")),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown({ summary, projectRows, rows }), "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_JSON, JSON.stringify({ generated_at: UPDATED_AT, summary, projectRows, rows, inputs: INPUTS }, null, 2), "utf8");
  console.log(JSON.stringify({ fields: rows.length, projects: projectRows.length, output: "analysis/high-blocking-public-summary-boundary.{md,csv,json}", summary }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
