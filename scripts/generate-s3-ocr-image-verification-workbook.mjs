#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s3-ocr-image-verification-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "s3-ocr-image-verification-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "s3-ocr-image-verification-workbook.json");

const INPUTS = {
  sprintPlan: "analysis/source-verification-sprint-plan.json",
  coreLedger: "analysis/core-value-confirmation-ledger.json",
  textAudit: "analysis/source-text-extraction-audit.json",
  ocrDecisions: "analysis/ocr-image-review-decisions.json",
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

const OCR_RELEVANT_STATUSES = new Set([
  "confirmed_from_ocr_image",
  "ocr_partial_confirmation_pending",
  "ocr_source_value_update_required",
  "source_value_fill_missing_required",
  "source_link_required",
]);

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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

async function optionalDir(file) {
  try {
    return await readdir(file);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function uniq(values) {
  return [...new Set(values.map((value) => compact(value)).filter(Boolean))];
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

function countText(rows, field, limit = 6) {
  return countBy(rows, field)
    .slice(0, limit)
    .map((row) => `${row.name} ${row.count}`)
    .join("; ");
}

function decisionKey(row) {
  return `${String(row.rank)}:${row.field_id}`;
}

function fieldIsS3Relevant(row) {
  return (
    row.related_task_type === "verify_ocr_numbers" ||
    OCR_RELEVANT_STATUSES.has(row.verification_status) ||
    Boolean(row.manual_ocr_review_status)
  );
}

function imageRootForTextRow(textRow) {
  const stem = path.basename(textRow.text_path || "", path.extname(textRow.text_path || ""));
  if (!stem) return "";
  if (textRow.extraction_method === "hwp_binaries_ocr") {
    return path.join("data/urban/text/ocr/hwp-images", stem);
  }
  if (textRow.source_group === "gwangjin_district_notice") {
    return path.join("data/urban/text/gwangjin-gu/ocr/images", stem);
  }
  return path.join("data/urban/text/ocr/images", stem);
}

async function imageCountForTextRow(textRow) {
  const root = imageRootForTextRow(textRow);
  if (!root) return 0;
  const names = await optionalDir(root);
  return names.filter((name) => /\.(png|jpe?g)$/i.test(name)).length;
}

function normalizeFieldRow({ sprintRow, ledgerRow, decisions, textRows }) {
  const decisionRows = decisions.get(decisionKey(ledgerRow)) || [];
  return {
    queue_rank: sprintRow.queue_rank,
    priority: sprintRow.priority,
    rank: ledgerRow.rank,
    focus_area: ledgerRow.focus_area,
    district: ledgerRow.district,
    project_name: ledgerRow.project_name,
    current_stage: ledgerRow.current_stage,
    ledger_rank: ledgerRow.ledger_rank,
    field_id: ledgerRow.field_id,
    field_label: ledgerRow.field_label,
    current_value: ledgerRow.current_value,
    verification_status: ledgerRow.verification_status,
    manual_ocr_review_status: ledgerRow.manual_ocr_review_status,
    manual_ocr_source_value: ledgerRow.manual_ocr_source_value,
    decision_ids: uniq(decisionRows.map((row) => row.decision_id)).join("; "),
    decision_source_values: uniq(decisionRows.map((row) => row.source_value)).join(" / "),
    decision_statuses: uniq(decisionRows.map((row) => row.manual_review_status)).join("; "),
    image_paths: uniq([...decisionRows.map((row) => row.image_path), ledgerRow.ocr_image_paths]).join("; "),
    source_contexts: uniq(decisionRows.map((row) => row.source_context)).join(" / "),
    evidence_text: uniq(decisionRows.map((row) => row.evidence_text)).join(" / "),
    recommended_value_action: ledgerRow.next_value_action || uniq(decisionRows.map((row) => row.recommended_value_action)).join(" / "),
    text_paths: uniq(textRows.map((row) => row.text_path)).join("; "),
    source_to_open: ledgerRow.source_to_open,
    project_note: ledgerRow.project_note,
  };
}

function projectStatus(row) {
  if (row.source_image_not_suitable_count > 0 || row.source_link_required_count > 0) {
    return "needs_relinked_original_notice";
  }
  if (row.source_update_required_count > 0) return "source_value_update_required";
  if (row.partial_confirmation_count > 0 || row.secondary_source_needed_count > 0) {
    return "partial_confirmation_needs_secondary_source";
  }
  if (row.confirmed_count > 0 && row.unreviewed_field_count === 0) return "ready_to_apply_confirmed_ocr";
  if (row.unreviewed_field_count > 0) return "manual_image_review_needed";
  return "ocr_context_available";
}

function nextActionFor(row) {
  const actions = {
    needs_relinked_original_notice: "현재 이미지가 장부값 기준시점과 맞지 않는 필드를 먼저 원문/recordCode로 재연결",
    source_value_update_required: "원문 이미지 판독값을 보정 후보에 반영하고 기준값/상한값 필드를 분리",
    partial_confirmation_needs_secondary_source: "이미지에서 확인된 요소와 미확인 요소를 나눠 사업시행계획·사업개요로 2차 확인",
    ready_to_apply_confirmed_ocr: "confirmed_from_ocr_image 값을 비교표와 사업별 메모에 반영",
    manual_image_review_needed: "연결된 OCR 이미지와 텍스트를 열어 수동 판정 로그를 추가",
    ocr_context_available: "OCR 텍스트와 이미지 경로를 열어 확인 상태를 결정",
  };
  return actions[row.s3_status] || "OCR 이미지 직접 확인";
}

function markdown({ summary, projectRows, fieldRows }) {
  return `# S3 OCR·이미지 수치 검증 워크북

작성 기준: ${UPDATED_AT}

\`source-verification-sprint-plan\`의 S3 OCR 대상 사업장을 장부 필드, OCR 텍스트, 원문 이미지 수동 판정 로그와 연결한 실행 보드다. 이 문서는 새 값을 자동 확정하지 않고, 이미 확인된 이미지 판독값과 아직 2차 원문이 필요한 필드를 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S3 사업장 | ${summary.project_count} |
| P0 사업장 | ${summary.p0_project_count} |
| P1 사업장 | ${summary.p1_project_count} |
| OCR 관련 장부 필드 | ${summary.field_count} |
| 수동 이미지 판정 필드 | ${summary.manual_decision_field_count} |
| 원문 이미지 확인/확정 | ${summary.confirmed_count} |
| 정밀도/값 보정 필요 | ${summary.source_update_required_count} |
| 부분확정·2차 출처 필요 | ${summary.partial_confirmation_count} |
| 원문 재연결 필요 | ${summary.relink_required_count} |
| OCR 텍스트 원문 | ${summary.ocr_text_source_count} |
| OCR 이미지 파일 | ${summary.ocr_image_file_count} |

## 상태별

${mdTable(summary.status_counts, [
  { key: "name", label: "상태" },
  { key: "count", label: "사업장" },
])}

## 사업장 실행 보드

${mdTable(projectRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_count", label: "필드" },
  { key: "confirmed_count", label: "확정" },
  { key: "source_update_required_count", label: "보정" },
  { key: "partial_confirmation_count", label: "부분/2차" },
  { key: "relink_required_count", label: "재연결" },
  { key: "ocr_text_source_count", label: "OCR 원문" },
  { key: "ocr_image_file_count", label: "이미지" },
  { key: "s3_status", label: "S3 상태" },
  { key: "next_action", label: "다음 행동" },
])}

## 필드별 검증 행

${mdTable(fieldRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "장부값" },
  { key: "verification_status", label: "장부 상태" },
  { key: "manual_ocr_review_status", label: "이미지 판정" },
  { key: "manual_ocr_source_value", label: "이미지 원문값" },
  { key: "image_paths", label: "이미지" },
  { key: "recommended_value_action", label: "권장 액션" },
])}

## 사용법

1. \`needs_relinked_original_notice\`는 OCR 이미지가 현재 장부값의 원문으로 부적합하므로 S2/S5 원문 연결 작업으로 보낸다.
2. \`source_value_update_required\`는 이미지 원문값을 구조화 보정 후보에 반영하되, 상한용적률·정비계획용적률처럼 기준이 다른 숫자는 필드를 분리한다.
3. \`partial_confirmation_needs_secondary_source\`는 이미지에서 확인된 구성요소와 미확인 구성요소를 나눠 사업시행계획서, 정보몽땅 사업개요, 후속 고시 원문으로 2차 확인한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [sprintPlan, ledgerRows, textAuditRows, decisionRows] = await Promise.all([
    readJson(INPUTS.sprintPlan),
    readJson(INPUTS.coreLedger),
    readJson(INPUTS.textAudit),
    readJson(INPUTS.ocrDecisions, []),
  ]);

  const s3Rows = sprintPlan.taskRows.filter((row) => row.sprint_id === "S3");
  const s3Ranks = new Set(s3Rows.map((row) => String(row.rank)));
  const sprintByRank = new Map(s3Rows.map((row) => [String(row.rank), row]));
  const textRowsByRank = new Map();
  for (const row of textAuditRows.filter((row) => s3Ranks.has(String(row.rank)) && String(row.review_priority).includes("ocr"))) {
    const key = String(row.rank);
    textRowsByRank.set(key, [...(textRowsByRank.get(key) || []), row]);
  }
  const decisionsByKey = new Map();
  for (const row of decisionRows.filter((row) => s3Ranks.has(String(row.rank)))) {
    const key = decisionKey(row);
    decisionsByKey.set(key, [...(decisionsByKey.get(key) || []), row]);
  }

  const imageCountsByRank = new Map();
  for (const row of textAuditRows.filter((row) => s3Ranks.has(String(row.rank)) && String(row.review_priority).includes("ocr"))) {
    const key = String(row.rank);
    imageCountsByRank.set(key, (imageCountsByRank.get(key) || 0) + (await imageCountForTextRow(row)));
  }

  const fieldRows = ledgerRows
    .filter((row) => s3Ranks.has(String(row.rank)) && fieldIsS3Relevant(row))
    .map((ledgerRow) =>
      normalizeFieldRow({
        sprintRow: sprintByRank.get(String(ledgerRow.rank)),
        ledgerRow,
        decisions: decisionsByKey,
        textRows: textRowsByRank.get(String(ledgerRow.rank)) || [],
      }),
    )
    .sort((a, b) => Number(a.queue_rank) - Number(b.queue_rank) || Number(a.ledger_rank) - Number(b.ledger_rank));

  const fieldRowsByRank = new Map();
  for (const row of fieldRows) {
    fieldRowsByRank.set(row.rank, [...(fieldRowsByRank.get(row.rank) || []), row]);
  }

  const projectRows = s3Rows.map((sprintRow) => {
    const rows = fieldRowsByRank.get(String(sprintRow.rank)) || [];
    const textRows = textRowsByRank.get(String(sprintRow.rank)) || [];
    const base = {
      queue_rank: sprintRow.queue_rank,
      priority: sprintRow.priority,
      focus_area: sprintRow.focus_area,
      district: sprintRow.district,
      rank: sprintRow.rank,
      project_name: sprintRow.project_name,
      current_stage: sprintRow.current_stage,
      fields_to_verify: sprintRow.fields_to_verify,
      first_source_to_open: sprintRow.first_source_to_open,
      field_count: rows.length,
      confirmed_count: rows.filter((row) => row.verification_status === "confirmed_from_ocr_image" || row.manual_ocr_review_status === "source_value_confirmed_from_image").length,
      source_update_required_count: rows.filter((row) => row.verification_status === "ocr_source_value_update_required" || row.manual_ocr_review_status === "source_value_precision_mismatch").length,
      partial_confirmation_count: rows.filter((row) => row.verification_status === "ocr_partial_confirmation_pending" || /partial|secondary|basis_mismatch/.test(row.manual_ocr_review_status)).length,
      source_image_not_suitable_count: rows.filter((row) => row.manual_ocr_review_status === "source_image_not_suitable_for_current_value").length,
      source_link_required_count: rows.filter((row) => row.verification_status === "source_link_required").length,
      relink_required_count: rows.filter(
        (row) =>
          row.manual_ocr_review_status === "source_image_not_suitable_for_current_value" ||
          row.verification_status === "source_link_required",
      ).length,
      secondary_source_needed_count: rows.filter((row) => /secondary|basis_mismatch/.test(row.manual_ocr_review_status)).length,
      unreviewed_field_count: rows.filter((row) => !row.manual_ocr_review_status && !row.decision_statuses).length,
      ocr_text_source_count: textRows.length,
      ocr_image_file_count: imageCountsByRank.get(String(sprintRow.rank)) || 0,
      project_note: sprintRow.project_note,
    };
    const withStatus = { ...base, s3_status: projectStatus(base) };
    return { ...withStatus, next_action: nextActionFor(withStatus) };
  });

  const summary = {
    generated_at: UPDATED_AT,
    project_count: projectRows.length,
    p0_project_count: projectRows.filter((row) => row.priority === "P0").length,
    p1_project_count: projectRows.filter((row) => row.priority === "P1").length,
    field_count: fieldRows.length,
    manual_decision_field_count: fieldRows.filter((row) => row.manual_ocr_review_status || row.decision_statuses).length,
    confirmed_count: projectRows.reduce((sum, row) => sum + row.confirmed_count, 0),
    source_update_required_count: projectRows.reduce((sum, row) => sum + row.source_update_required_count, 0),
    partial_confirmation_count: projectRows.reduce((sum, row) => sum + row.partial_confirmation_count, 0),
    relink_required_count: projectRows.reduce((sum, row) => sum + row.relink_required_count, 0),
    ocr_text_source_count: [...textRowsByRank.values()].reduce((sum, rows) => sum + rows.length, 0),
    ocr_image_file_count: [...imageCountsByRank.values()].reduce((sum, count) => sum + count, 0),
    status_counts: countBy(projectRows, "s3_status"),
    field_status_counts: countBy(fieldRows, "verification_status"),
    manual_status_counts: countBy(fieldRows, "manual_ocr_review_status"),
  };

  const workbook = {
    summary,
    projectRows,
    fieldRows,
    inputs: INPUTS,
    notes: [
      "S3 워크북은 source-verification-sprint-plan의 S3 태스크만 포함한다.",
      "confirmed_from_ocr_image는 장부 상태 또는 수동 이미지 판정이 있을 때만 집계한다.",
      "source_image_not_suitable_for_current_value와 source_link_required는 S3 내부 완료가 아니라 S2/S5 원문 재연결 병목으로 본다.",
    ],
  };

  await writeFile(OUT_JSON, `${JSON.stringify(workbook, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(fieldRows), "utf8");
  await writeFile(OUT_MD, markdown(workbook), "utf8");
  console.log(
    JSON.stringify(
      {
        projects: summary.project_count,
        fields: summary.field_count,
        manual_decisions: summary.manual_decision_field_count,
        statuses: countText(projectRows, "s3_status"),
        output: "analysis/s3-ocr-image-verification-workbook.{md,csv,json}",
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
