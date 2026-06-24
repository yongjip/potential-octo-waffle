#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-link-repair-queue.md");
const OUT_CSV = path.join(OUT_DIR, "source-link-repair-queue.csv");
const OUT_JSON = path.join(OUT_DIR, "source-link-repair-queue.json");

const LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const EVIDENCE_INPUT = "analysis/source-evidence-audit.json";

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

const RISK_WEIGHT = {
  very_high: 80,
  high: 50,
  medium: 20,
  watch: 0,
};

const PRIORITY_WEIGHT = {
  P0: 400,
  P1: 300,
  P2: 200,
  P3: 100,
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
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

function issueType(row) {
  if (row.manual_ocr_review_status === "source_image_not_suitable_for_current_value") return "wrong_source_image";
  if (row.verification_status === "no_source_text") return "source_text_missing";
  if (row.related_task_type === "connect_recordcode_original_notice") return "recordcode_notice_link_required";
  return "source_link_required";
}

function repairAction(row) {
  const type = issueType(row);
  if (type === "wrong_source_image") {
    return "현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색";
  }
  if (type === "source_text_missing") {
    return "원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결";
  }
  if (type === "recordcode_notice_link_required") {
    return "recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결";
  }
  return row.next_value_action || "공식 원문 링크와 텍스트 경로를 다시 연결";
}

function priority(row) {
  if (row.related_task_priority === "P0") return "P0";
  if (row.risk_signal_level === "very_high") return "P0";
  if (row.related_task_priority === "P1" || row.risk_signal_level === "high") return "P1";
  if (row.verification_status === "no_source_text") return "P1";
  return "P2";
}

function sortScore(row) {
  return (
    (PRIORITY_WEIGHT[row.priority] || 0) +
    (RISK_WEIGHT[row.risk_signal_level] || 0) +
    (row.issue_type === "wrong_source_image" ? 35 : 0) +
    (row.issue_type === "recordcode_notice_link_required" ? 20 : 0)
  );
}

function normalizeRow(row, matrixByRank, evidenceByRank) {
  const rank = String(row.rank || "");
  const matrix = matrixByRank[rank] || {};
  const evidence = evidenceByRank[rank] || {};
  const normalized = {
    rank,
    focus_area: row.focus_area || matrix.focus_area || "",
    district: row.district || matrix.district || "",
    project_name: row.project_name || matrix.project_name || "",
    current_stage: row.current_stage || matrix.current_stage || "",
    risk_signal_level: row.risk_signal_level || "",
    evidence_grade: evidence.evidence_grade || "",
    field_id: row.field_id,
    field_label: row.field_label,
    current_value: row.current_value,
    verification_status: row.verification_status,
    issue_type: issueType(row),
    priority: priority(row),
    source_value: row.manual_ocr_source_value || "",
    current_source_to_open: row.source_to_open || "",
    next_action: repairAction(row),
    project_note_path: row.project_note_path || "",
    related_task_type: row.related_task_type || "",
    related_task_priority: row.related_task_priority || "",
  };
  return {
    queue_rank: 0,
    ...normalized,
    sort_score: sortScore(normalized),
  };
}

function markdown(rows) {
  return `# 원문 링크 보정 큐

작성 기준: ${UPDATED_AT}

핵심 수치 장부에서 \`source_link_required\` 또는 \`no_source_text\` 상태인 필드를 모은 작업표다. OCR 이미지 확인은 끝났지만, 원문이 다른 사업장에 연결되었거나 recordCode/고시번호/텍스트 경로가 빠져 비교표 신뢰도를 낮추는 항목을 다음 검색 대상으로 정리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 링크 보정 항목 | ${rows.length} |
| 대상 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| P0 | ${rows.filter((row) => row.priority === "P0").length} |
| P1 | ${rows.filter((row) => row.priority === "P1").length} |
| P2 | ${rows.filter((row) => row.priority === "P2").length} |

## 유형별

${mdTable(countBy(rows, "issue_type"), [
  { key: "name", label: "유형" },
  { key: "count", label: "건수" },
])}

## 사업장별

${mdTable(countBy(rows, "project_name"), [
  { key: "name", label: "사업장" },
  { key: "count", label: "건수" },
])}

## 보정 큐

${mdTable(rows, [
  { key: "queue_rank", label: "순번" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재값" },
  { key: "issue_type", label: "유형" },
  { key: "source_value", label: "현재 연결 원문값" },
  { key: "next_action", label: "다음 액션" },
  { key: "current_source_to_open", label: "현재 열 자료" },
])}

## 사용법

1. \`wrong_source_image\`는 현재 연결 원문을 비교 근거에서 제외하고 동일 사업명/위치로 원문을 다시 찾는다.
2. \`recordcode_notice_link_required\`는 서울도시공간포털 recordCode/noticeCode 또는 자치구 공고 URL을 먼저 확정한다.
3. \`source_text_missing\`은 첨부 원문 다운로드와 텍스트 추출 경로부터 복구한다.
4. 원문을 찾으면 비교 매트릭스의 출처 경로를 보강하고 \`core-value-confirmation-ledger\`를 재생성한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [ledgerRows, matrixRows, evidenceRows] = await Promise.all([readJson(LEDGER_INPUT), readJson(MATRIX_INPUT), readJson(EVIDENCE_INPUT)]);
  const matrixByRank = byRank(matrixRows);
  const evidenceByRank = byRank(evidenceRows);
  const rows = ledgerRows
    .filter((row) => row.verification_status === "source_link_required" || row.verification_status === "no_source_text")
    .map((row) => normalizeRow(row, matrixByRank, evidenceByRank))
    .sort((a, b) => b.sort_score - a.sort_score || Number(a.rank) - Number(b.rank) || a.field_id.localeCompare(b.field_id))
    .map((row, index) => ({ ...row, queue_rank: index + 1 }));

  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        projects: new Set(rows.map((row) => row.rank)).size,
        p0: rows.filter((row) => row.priority === "P0").length,
        p1: rows.filter((row) => row.priority === "P1").length,
        output: "analysis/source-link-repair-queue.{md,csv,json}",
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
