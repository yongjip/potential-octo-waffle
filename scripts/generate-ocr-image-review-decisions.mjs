#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/review/ocr-image-review-decisions.json";
const TRIAGE_INPUT = "analysis/ocr-source-review-triage.json";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "ocr-image-review-decisions.md");
const OUT_CSV = path.join(OUT_DIR, "ocr-image-review-decisions.csv");
const OUT_JSON = path.join(OUT_DIR, "ocr-image-review-decisions.json");

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

function decisionKey(row) {
  return `${String(row.rank)}:${row.field_id}`;
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

function normalizeDecision(row, triageByKey) {
  const triage = triageByKey.get(decisionKey(row)) || {};
  return {
    decision_id: row.decision_id,
    reviewed_at: row.reviewed_at,
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    project_name: row.project_name,
    field_id: row.field_id,
    field_label: row.field_label,
    current_value: row.current_value,
    source_value: row.source_value,
    manual_review_status: row.manual_review_status,
    recommended_verification_status: row.recommended_verification_status,
    triage_rank: triage.triage_rank || "",
    triage_status: triage.review_status || "",
    triage_confidence: triage.confidence_bucket || "",
    triage_value_match_level: triage.value_match_level || "",
    confirmed_components: row.confirmed_components,
    unconfirmed_components: row.unconfirmed_components,
    recommended_value_action: row.recommended_value_action,
    image_path: row.image_path,
    source_context: row.source_context,
    evidence_text: row.evidence_text,
    decision_note: row.decision_note,
  };
}

function markdown(rows) {
  return `# OCR 이미지 수동 검수 결정

작성 기준: ${UPDATED_AT}

원문 이미지를 직접 열어 OCR 트리아지 결과를 검수한 결정 기록이다. 이 문서는 자동 확정표가 아니라, 현재 장부 값과 원문 이미지 값이 같은지, 정밀도 보정이나 2차 출처 확인이 필요한지를 남기는 수동 판정 로그다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 수동 검수 결정 | ${rows.length} |
| 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 원문 이미지 확인 | ${rows.filter((row) => row.manual_review_status === "source_value_confirmed_from_image").length} |
| 정밀도 보정 필요 | ${rows.filter((row) => row.manual_review_status === "source_value_precision_mismatch").length} |
| 부분확정/2차 출처 필요 | ${rows.filter((row) => row.manual_review_status === "partial_confirmation_needs_secondary_source").length} |
| 공란 보강 후보 | ${rows.filter((row) => row.manual_review_status === "source_value_fills_missing_matrix_value").length} |
| 다른 원문 연결 필요 | ${rows.filter((row) => row.manual_review_status === "source_image_not_suitable_for_current_value").length} |

## 상태별

${mdTable(countBy(rows, "manual_review_status"), [
  { key: "name", label: "수동 검수 상태" },
  { key: "count", label: "건수" },
])}

## 결정 목록

${mdTable(rows, [
  { key: "decision_id", label: "결정" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "장부 현재값" },
  { key: "source_value", label: "이미지 원문값" },
  { key: "manual_review_status", label: "수동 상태" },
  { key: "recommended_verification_status", label: "권장 장부 상태" },
  { key: "recommended_value_action", label: "권장 액션" },
])}

## 근거

${mdTable(rows, [
  { key: "decision_id", label: "결정" },
  { key: "source_context", label: "원문 위치" },
  { key: "evidence_text", label: "이미지 판독 근거" },
  { key: "confirmed_components", label: "확인된 요소" },
  { key: "unconfirmed_components", label: "미확인/차이" },
  { key: "image_path", label: "이미지" },
  { key: "decision_note", label: "메모" },
])}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [decisions, triageRows] = await Promise.all([readJson(INPUT), readJson(TRIAGE_INPUT, [])]);
  const triageByKey = new Map(triageRows.map((row) => [decisionKey(row), row]));
  const rows = decisions.map((row) => normalizeDecision(row, triageByKey));
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        precision_update_required: rows.filter((row) => row.manual_review_status === "source_value_precision_mismatch").length,
        partial_confirmation_pending: rows.filter((row) => row.manual_review_status === "partial_confirmation_needs_secondary_source").length,
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
