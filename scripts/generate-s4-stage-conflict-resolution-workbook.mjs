#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s4-stage-conflict-resolution-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "s4-stage-conflict-resolution-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "s4-stage-conflict-resolution-workbook.json");

const INPUTS = {
  sprintPlan: "analysis/source-verification-sprint-plan.json",
  managementFactCheck: "analysis/management-stage-fact-check.json",
  managementResolution: "analysis/management-stage-value-resolution.json",
  coreLedger: "analysis/core-value-confirmation-ledger.json",
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

const RESOLVED_STATUSES = new Set([
  "confirmed_match",
  "public_stage_date_confirmed",
  "public_stage_value_available",
]);

const FOLLOWUP_STATUSES = new Set([
  "keep_values_by_source_date",
  "manual_review_needed",
  "public_stage_value_missing",
  "public_stage_date_missing",
  "management_stage_followup_needed",
  "source_date_split_required",
  "value_missing",
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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

function keyFor(row) {
  return `${String(row.rank)}:${row.field_id}`;
}

function actionGroup(row) {
  if (row.resolution_status === "public_stage_value_missing" || row.verification_status === "management_stage_followup_needed") {
    return "fetch_management_attachment";
  }
  if (row.resolution_status === "value_missing" || row.verification_status === "value_missing") {
    return "fill_missing_stage_date";
  }
  if (row.resolution_status === "keep_values_by_source_date" || row.verification_status === "source_date_split_required") {
    return "record_values_by_source_date";
  }
  if (RESOLVED_STATUSES.has(row.resolution_status) || row.verification_status === "resolved_by_management_stage_report") {
    return "record_resolved_value";
  }
  return "manual_stage_review";
}

function nextActionForGroup(group) {
  const actions = {
    fetch_management_attachment: "정보몽땅 관리처분 별첨 또는 관리처분 인가 고시 원문에서 공사비/분담금 값을 보강",
    fill_missing_stage_date: "조합설립인가일 등 공란 단계일자를 공식 원문 또는 정보몽땅 공개항목으로 보강",
    record_values_by_source_date: "고시·사업시행·관리처분 값을 같은 필드에 덮어쓰지 말고 시점별 열로 분리 기록",
    record_resolved_value: "공개항목 또는 고시 원문 기준으로 사업별 메모와 비교표에 확정/보조값을 반영",
    manual_stage_review: "관리처분 대조표와 장부를 다시 열어 confirmed/pending/conflict 중 하나로 판정",
  };
  return actions[group] || actions.manual_stage_review;
}

function normalizeResolutionRow(row, sprintRow, ledgerByKey, factByRank) {
  const ledger = ledgerByKey.get(keyFor(row)) || {};
  const fact = factByRank.get(String(row.rank)) || {};
  const normalized = {
    queue_rank: sprintRow?.queue_rank || ledger.related_queue_rank || "",
    priority: sprintRow?.priority || ledger.related_task_priority || "",
    rank: row.rank,
    focus_area: row.focus_area,
    district: sprintRow?.district || ledger.district || "",
    project_name: row.project_name,
    current_stage: row.current_stage,
    field_id: row.field_id,
    field_label: row.field_label,
    current_summary_value: row.current_summary_value,
    notice_value: row.notice_value,
    public_stage_value: row.public_stage_value,
    ledger_current_value: ledger.current_value || "",
    source_date_basis: row.source_date_basis,
    resolution_status: row.resolution_status,
    verification_status: ledger.verification_status || "",
    management_resolution_status: ledger.management_resolution_status || row.resolution_status,
    recommended_recording: row.recommended_recording || ledger.management_recommended_recording || "",
    next_source_to_check: row.next_source_to_check || ledger.management_next_source_to_check || ledger.next_value_action || "",
    fact_check_source: row.fact_check_source,
    notice_no: fact.notice_no || "",
    notice_date: fact.notice_date || "",
    project_approval_date: fact.project_approval_date || "",
    management_approval_date: fact.management_approval_date || "",
    management_construction_cost: fact.management_construction_cost || "",
    related_public_items: sprintRow?.related_public_items || "",
    project_note: row.project_note || ledger.project_note || sprintRow?.project_note || "",
  };
  const group = actionGroup(normalized);
  return { ...normalized, action_group: group, next_action: nextActionForGroup(group) };
}

function normalizeLedgerOnlyRow(ledger, sprintRow) {
  const normalized = {
    queue_rank: sprintRow?.queue_rank || ledger.related_queue_rank || "",
    priority: sprintRow?.priority || ledger.related_task_priority || "",
    rank: ledger.rank,
    focus_area: ledger.focus_area,
    district: ledger.district,
    project_name: ledger.project_name,
    current_stage: ledger.current_stage,
    field_id: ledger.field_id,
    field_label: ledger.field_label,
    current_summary_value: "",
    notice_value: "",
    public_stage_value: "",
    ledger_current_value: ledger.current_value,
    source_date_basis: "핵심 수치 장부의 S4 관련 공란/후속 확인 필드",
    resolution_status: ledger.management_resolution_status || ledger.verification_status,
    verification_status: ledger.verification_status,
    management_resolution_status: ledger.management_resolution_status,
    recommended_recording: ledger.management_recommended_recording || ledger.next_value_action,
    next_source_to_check: ledger.management_next_source_to_check || ledger.next_value_action,
    fact_check_source: "",
    notice_no: "",
    notice_date: "",
    project_approval_date: "",
    management_approval_date: "",
    management_construction_cost: "",
    related_public_items: sprintRow?.related_public_items || "",
    project_note: ledger.project_note || sprintRow?.project_note || "",
  };
  const group = actionGroup(normalized);
  return { ...normalized, action_group: group, next_action: nextActionForGroup(group) };
}

function projectStatus(row) {
  if (row.fetch_management_attachment_count > 0) return "management_attachment_needed";
  if (row.fill_missing_stage_date_count > 0) return "stage_date_gap_needed";
  if (row.record_values_by_source_date_count > 0) return "recordable_with_source_date_split";
  if (row.record_resolved_value_count > 0) return "ready_to_record_resolved_values";
  return "manual_stage_review_needed";
}

function projectNextAction(status) {
  const actions = {
    management_attachment_needed: "관리처분 별첨/인가 고시에서 누락 공사비·분담금 값을 먼저 확인",
    stage_date_gap_needed: "조합설립인가일 등 공란 단계일자를 먼저 보강",
    recordable_with_source_date_split: "사업개요·고시·사업시행·관리처분 값을 시점별 열로 분리해 기록",
    ready_to_record_resolved_values: "이미 해소된 공개항목 기준값을 사업별 메모와 비교표에 반영",
    manual_stage_review_needed: "관리처분 대조표를 다시 열어 상태를 확정",
  };
  return actions[status] || actions.manual_stage_review_needed;
}

function markdown({ summary, projectRows, fieldRows }) {
  return `# S4 사업시행·관리처분 시점 충돌 해소 워크북

작성 기준: ${UPDATED_AT}

\`source-verification-sprint-plan\`의 S4 대상 사업장을 관리처분 대조표, 시점 해소표, 핵심 수치 장부와 연결한 실행 보드다. 이 문서는 관리처분인가 단계의 수치 차이를 오류로 바로 덮어쓰지 않고, 고시 시점·사업시행 공개항목·관리처분 공개항목으로 분리해 기록하기 위한 작업표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S4 사업장 | ${summary.project_count} |
| S4 필드 | ${summary.field_count} |
| 해소/반영 가능 필드 | ${summary.record_resolved_value_count} |
| 시점별 분리 기록 필요 | ${summary.record_values_by_source_date_count} |
| 관리처분 별첨/인가고시 보강 필요 | ${summary.fetch_management_attachment_count} |
| 단계일자 공란 보강 필요 | ${summary.fill_missing_stage_date_count} |
| 관리처분 대조 원문 | ${summary.fact_check_project_count} |

## 액션별

${mdTable(summary.action_group_counts, [
  { key: "name", label: "액션" },
  { key: "count", label: "필드" },
])}

## 사업장 실행 보드

${mdTable(projectRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_count", label: "필드" },
  { key: "record_resolved_value_count", label: "반영" },
  { key: "record_values_by_source_date_count", label: "시점분리" },
  { key: "fetch_management_attachment_count", label: "별첨보강" },
  { key: "fill_missing_stage_date_count", label: "일자보강" },
  { key: "s4_status", label: "S4 상태" },
  { key: "next_action", label: "다음 행동" },
])}

## 필드별 해소 행

${mdTable(fieldRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_summary_value", label: "사업개요값" },
  { key: "notice_value", label: "고시값" },
  { key: "public_stage_value", label: "공개항목값" },
  { key: "verification_status", label: "장부 상태" },
  { key: "action_group", label: "액션" },
  { key: "recommended_recording", label: "기록 방식" },
])}

## 사용법

1. \`record_values_by_source_date\`는 비교표에서 단일 공식값으로 덮어쓰지 말고 고시·사업시행·관리처분 기준 열을 분리한다.
2. \`record_resolved_value\`는 이미 공개항목 또는 고시값으로 해소된 항목이므로 사업별 메모와 비교표 주석에 반영한다.
3. \`fetch_management_attachment\`와 \`fill_missing_stage_date\`는 S4 완료 전 남은 원문 확인 작업으로 둔다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [sprintPlan, factRows, resolutionRows, ledgerRows] = await Promise.all([
    readJson(INPUTS.sprintPlan),
    readJson(INPUTS.managementFactCheck),
    readJson(INPUTS.managementResolution),
    readJson(INPUTS.coreLedger),
  ]);

  const s4Rows = sprintPlan.taskRows.filter((row) => row.sprint_id === "S4");
  const s4Ranks = new Set(s4Rows.map((row) => String(row.rank)));
  const sprintByRank = new Map(s4Rows.map((row) => [String(row.rank), row]));
  const factByRank = new Map(factRows.map((row) => [String(row.rank), row]));
  const ledgerByKey = new Map(ledgerRows.map((row) => [keyFor(row), row]));

  const fieldRows = resolutionRows
    .filter((row) => s4Ranks.has(String(row.rank)))
    .map((row) => normalizeResolutionRow(row, sprintByRank.get(String(row.rank)), ledgerByKey, factByRank));

  const existingKeys = new Set(fieldRows.map(keyFor));
  for (const ledger of ledgerRows.filter(
    (row) =>
      s4Ranks.has(String(row.rank)) &&
      (row.related_task_type === "resolve_stage_value_conflict" || row.management_resolution_status) &&
      !existingKeys.has(keyFor(row)),
  )) {
    fieldRows.push(normalizeLedgerOnlyRow(ledger, sprintByRank.get(String(ledger.rank))));
  }

  fieldRows.sort((a, b) => Number(a.queue_rank || 999) - Number(b.queue_rank || 999) || Number(a.rank) - Number(b.rank) || a.field_label.localeCompare(b.field_label));

  const rowsByRank = new Map();
  for (const row of fieldRows) {
    rowsByRank.set(String(row.rank), [...(rowsByRank.get(String(row.rank)) || []), row]);
  }

  const projectRows = s4Rows.map((sprintRow) => {
    const rows = rowsByRank.get(String(sprintRow.rank)) || [];
    const base = {
      queue_rank: sprintRow.queue_rank,
      priority: sprintRow.priority,
      focus_area: sprintRow.focus_area,
      district: sprintRow.district,
      rank: sprintRow.rank,
      project_name: sprintRow.project_name,
      current_stage: sprintRow.current_stage,
      field_count: rows.length,
      record_resolved_value_count: rows.filter((row) => row.action_group === "record_resolved_value").length,
      record_values_by_source_date_count: rows.filter((row) => row.action_group === "record_values_by_source_date").length,
      fetch_management_attachment_count: rows.filter((row) => row.action_group === "fetch_management_attachment").length,
      fill_missing_stage_date_count: rows.filter((row) => row.action_group === "fill_missing_stage_date").length,
      manual_stage_review_count: rows.filter((row) => row.action_group === "manual_stage_review").length,
      related_public_items: sprintRow.related_public_items,
      project_note: sprintRow.project_note,
    };
    const status = projectStatus(base);
    return { ...base, s4_status: status, next_action: projectNextAction(status) };
  });

  const summary = {
    generated_at: UPDATED_AT,
    project_count: projectRows.length,
    field_count: fieldRows.length,
    record_resolved_value_count: fieldRows.filter((row) => row.action_group === "record_resolved_value").length,
    record_values_by_source_date_count: fieldRows.filter((row) => row.action_group === "record_values_by_source_date").length,
    fetch_management_attachment_count: fieldRows.filter((row) => row.action_group === "fetch_management_attachment").length,
    fill_missing_stage_date_count: fieldRows.filter((row) => row.action_group === "fill_missing_stage_date").length,
    fact_check_project_count: factRows.filter((row) => s4Ranks.has(String(row.rank))).length,
    action_group_counts: countBy(fieldRows, "action_group"),
    resolution_status_counts: countBy(fieldRows, "resolution_status"),
    verification_status_counts: countBy(fieldRows, "verification_status"),
    project_status_counts: countBy(projectRows, "s4_status"),
  };

  const workbook = {
    summary,
    projectRows,
    fieldRows,
    inputs: INPUTS,
    notes: [
      "S4 워크북은 source-verification-sprint-plan의 S4 태스크만 포함한다.",
      "고시값과 공개항목값이 서로 다르면 충돌로 단정하지 않고 source_date_basis에 따라 분리 기록한다.",
      "ledger-only 행은 management-stage-value-resolution에 없는 장부상 S4 공란/후속 확인 필드를 보강한 것이다.",
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
        actions: countText(fieldRows, "action_group"),
        output: "analysis/s4-stage-conflict-resolution-workbook.{md,csv,json}",
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
