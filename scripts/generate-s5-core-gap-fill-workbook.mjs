#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s5-core-gap-fill-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "s5-core-gap-fill-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "s5-core-gap-fill-workbook.json");

const INPUTS = {
  sprintPlan: "analysis/source-verification-sprint-plan.json",
  coreLedger: "analysis/core-value-confirmation-ledger.json",
  comparison: "analysis/project-comparison-matrix.json",
  cleanupSummaries: "data/cleanup/project-summaries-priority-candidates.json",
  noticeKeyFields: "data/urban/text/notice-key-fields.json",
  sourceValueUpdates: "analysis/source-value-update-candidates.json",
  sourceLinkCandidates: "analysis/source-link-repair-candidates.json",
  managementDocs: "data/cleanup/management-stage-doc-links.json",
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

const S5_RELEVANT_STATUSES = new Set([
  "value_missing",
  "not_yet_applicable",
  "structured_value_needs_manual_confirmation",
  "snippet_candidate_needs_manual_confirmation",
  "source_value_fill_missing_required",
  "source_date_split_required",
  "resolved_by_management_stage_report",
]);

const FIELD_TO_SUMMARY = {
  district_area_sqm: "district_area_sqm",
  total_households: "total_households",
  floor_area_ratio_pct: "floor_area_ratio_pct",
  building_coverage_ratio_pct: "building_coverage_ratio_pct",
  max_height_m: "max_height_m",
  floors: "floors",
};

const FIELD_TO_MATRIX = {
  notice_no: "notice_no",
  notice_date: "notice_date",
  district_area_sqm: "district_area_sqm_official",
  total_households: "total_households_official",
  floor_area_ratio_pct: "floor_area_ratio_pct_official",
  building_coverage_ratio_pct: "building_coverage_ratio_pct_official",
  max_height_m: "max_height_m_official",
  floors: "floors_official",
  project_approval_date: "project_approval_date_public",
  management_approval_date: "management_approval_date_public",
  management_construction_cost: "management_construction_cost_public",
  union_approval_date: "union_approval_date_public",
  promotion_committee_approval_date: "promotion_committee_approval_date_public",
  stage_consent_rate_pct: "stage_consent_rate_pct_public",
};

const FIELD_TO_KEYFIELD = {
  district_area_sqm: ["district_area_values", "district_area_snippets"],
  total_households: ["households_values", "households_snippets"],
  floor_area_ratio_pct: ["floor_area_ratio_values", "floor_area_ratio_snippets"],
  building_coverage_ratio_pct: ["building_coverage_ratio_values", "building_coverage_ratio_snippets"],
  max_height_m: ["height_floors_values", "height_floors_snippets"],
  floors: ["height_floors_values", "height_floors_snippets"],
};

const MANAGEMENT_FIELD_BY_LEDGER = {
  project_approval_date: ["202", "approval_date"],
  management_approval_date: ["213", "approval_date"],
  management_construction_cost: ["210", "construction_cost"],
  union_approval_date: ["198", "approval_date"],
  promotion_committee_approval_date: ["160", "approval_date"],
  stage_consent_rate_pct: ["202", "fields.동의율 (%)"],
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

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
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

function countText(rows, field, limit = 8) {
  return countBy(rows, field)
    .slice(0, limit)
    .map((row) => `${row.name} ${row.count}`)
    .join("; ");
}

function getNested(row, pathText) {
  const parts = pathText.split(".");
  let current = row;
  for (const part of parts) {
    if (current == null) return "";
    current = current[part];
  }
  return compact(current);
}

function managementDocsForRank(rows, rank) {
  return rows.filter((row) => String(row.rank) === String(rank));
}

function managementCandidate(row, docs) {
  const config = MANAGEMENT_FIELD_BY_LEDGER[row.field_id];
  if (!config) return { value: "", source: "", note: "" };
  const [itemNo, fieldPath] = config;
  const doc = docs.find((item) => String(item.item_no) === itemNo && item.access_status === "public_table_extracted") || {};
  const value = getNested(doc, fieldPath);
  return {
    value,
    source: doc.official_url || "",
    note: value ? `${doc.category_group || ""} ${doc.item_label || ""} 공개항목에서 후보값 확인` : "",
  };
}

function candidateFromKeyFields(row, keyField) {
  const mapping = FIELD_TO_KEYFIELD[row.field_id];
  if (!mapping) return { value: "", snippet: "" };
  const [valueKey, snippetKey] = mapping;
  return {
    value: compact(keyField?.[valueKey]),
    snippet: compact(keyField?.[snippetKey]).slice(0, 280),
  };
}

function updateCandidate(row, updatesByKey) {
  return updatesByKey.get(`${String(row.rank)}:${row.field_id}`) || {};
}

function sourceLinkCandidate(row, sourceLinksByKey) {
  return sourceLinksByKey.get(`${String(row.rank)}:${row.field_id}`) || {};
}

function firstCandidate({ row, summary, matrix, keyField, update, sourceLink, management }) {
  if (update.recommended_display_value || update.source_image_value) {
    return {
      candidate_value: update.recommended_display_value || update.source_image_value,
      candidate_source: "ocr_image_update_candidate",
      candidate_path_or_url: update.image_path || update.decision_source || "",
      candidate_note: update.next_action || update.update_rationale || "",
    };
  }

  if (sourceLink.candidate_value) {
    return {
      candidate_value: sourceLink.candidate_value,
      candidate_source: sourceLink.candidate_source_label || sourceLink.candidate_source_type || "source_link_candidate",
      candidate_path_or_url: sourceLink.candidate_source_url || sourceLink.candidate_source_path || "",
      candidate_note: sourceLink.candidate_note || "",
    };
  }

  if (management.value) {
    return {
      candidate_value: management.value,
      candidate_source: "management_stage_public_doc",
      candidate_path_or_url: management.source,
      candidate_note: management.note,
    };
  }

  const summaryKey = FIELD_TO_SUMMARY[row.field_id];
  if (summaryKey && compact(summary?.[summaryKey])) {
    return {
      candidate_value: compact(summary[summaryKey]),
      candidate_source: "cleanup_project_summary",
      candidate_path_or_url: summary.summary_url || "",
      candidate_note: "정보몽땅 사업개요 구조화 값",
    };
  }

  const matrixKey = FIELD_TO_MATRIX[row.field_id];
  if (matrixKey && compact(matrix?.[matrixKey])) {
    return {
      candidate_value: compact(matrix[matrixKey]),
      candidate_source: "project_comparison_matrix",
      candidate_path_or_url: matrix.text_path || "",
      candidate_note: "비교 매트릭스의 현재 구조화 값",
    };
  }

  const keyCandidate = candidateFromKeyFields(row, keyField);
  if (keyCandidate.value || keyCandidate.snippet) {
    return {
      candidate_value: keyCandidate.value,
      candidate_source: "notice_key_field_snippet",
      candidate_path_or_url: keyField?.text_path || "",
      candidate_note: keyCandidate.snippet,
    };
  }

  return {
    candidate_value: "",
    candidate_source: "",
    candidate_path_or_url: "",
    candidate_note: "",
  };
}

function actionGroup(row) {
  if (row.verification_status === "not_yet_applicable") return "defer_stage_not_applicable";
  if (row.verification_status === "resolved_by_management_stage_report") return "already_resolved";
  if (row.verification_status === "source_date_split_required") return "record_by_source_date";
  if (row.verification_status === "source_value_fill_missing_required") return "apply_fill_candidate_after_second_check";
  if (row.verification_status === "snippet_candidate_needs_manual_confirmation") return "promote_notice_snippet";
  if (row.verification_status === "structured_value_needs_manual_confirmation") return "confirm_structured_value";
  if (row.verification_status === "value_missing" && row.candidate_value) return "fill_from_candidate_source";
  if (row.verification_status === "value_missing") return "missing_no_candidate";
  return "manual_gap_review";
}

function nextActionFor(row) {
  const actions = {
    defer_stage_not_applicable: "현재 단계상 아직 발생 전인 값으로 두고 단계 변경 때 재평가",
    already_resolved: "이미 관리처분/공개항목 대조로 해소된 값은 사업별 메모와 비교표 주석에 반영",
    record_by_source_date: "고시·사업시행·관리처분 기준값을 시점별 열로 분리",
    apply_fill_candidate_after_second_check: "후보값을 원문 또는 사업개요로 2차 대조한 뒤 공란 보강",
    promote_notice_snippet: "원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정",
    confirm_structured_value: "이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리",
    fill_from_candidate_source: "후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강",
    missing_no_candidate: "현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색",
    manual_gap_review: "장부 상태와 후보 출처를 다시 열어 수동 판정",
  };
  return actions[row.action_group] || actions.manual_gap_review;
}

function normalizeFieldRow({ ledgerRow, sprintRows, matrix, summary, keyField, update, sourceLink, managementDocs }) {
  const sprint = sprintRows.find((row) => row.task_type === ledgerRow.related_task_type) || sprintRows[0] || {};
  const management = managementCandidate(ledgerRow, managementDocs);
  const candidate = firstCandidate({ row: ledgerRow, summary, matrix, keyField, update, sourceLink, management });
  const normalized = {
    queue_rank: sprint.queue_rank || ledgerRow.related_queue_rank || "",
    priority: sprint.priority || ledgerRow.related_task_priority || "",
    sprint_task_type: sprint.task_type || ledgerRow.related_task_type || "",
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
    related_task_type: ledgerRow.related_task_type,
    candidate_value: candidate.candidate_value,
    candidate_source: candidate.candidate_source,
    candidate_path_or_url: candidate.candidate_path_or_url,
    candidate_note: candidate.candidate_note,
    source_to_open: ledgerRow.source_to_open || sprint.first_source_to_open || matrix?.text_path || "",
    next_value_action: ledgerRow.next_value_action,
    related_public_items: sprint.related_public_items || "",
    project_note: ledgerRow.project_note || sprint.project_note || "",
  };
  const group = actionGroup(normalized);
  return { ...normalized, action_group: group, next_action: nextActionFor({ ...normalized, action_group: group }) };
}

function projectStatus(row) {
  if (row.missing_no_candidate_count > 0) return "candidate_search_needed";
  if (row.fill_from_candidate_source_count > 0 || row.apply_fill_candidate_after_second_check_count > 0) return "candidate_fill_ready";
  if (row.promote_notice_snippet_count > 0 || row.confirm_structured_value_count > 0) return "manual_confirmation_needed";
  if (row.record_by_source_date_count > 0) return "source_date_split_needed";
  if (row.defer_stage_not_applicable_count > 0) return "stage_deferred";
  return "s5_review_ready";
}

function projectNextAction(status) {
  const actions = {
    candidate_search_needed: "후보값 없는 공란부터 공식 원문·정보몽땅 사업개요·자치구 공고에서 추가 검색",
    candidate_fill_ready: "후보 출처의 값·단위·기준시점을 확인해 공란 보강",
    manual_confirmation_needed: "구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정",
    source_date_split_needed: "고시·사업시행·관리처분 값을 시점별 열로 분리",
    stage_deferred: "현재 단계상 아직 발생 전인 값은 보류 사유로 기록",
    s5_review_ready: "S5 필드 상태를 검토하고 다음 보강 항목을 선택",
  };
  return actions[status] || actions.s5_review_ready;
}

function markdown({ summary, projectRows, fieldRows }) {
  const urgentRows = fieldRows.filter((row) =>
    ["missing_no_candidate", "fill_from_candidate_source", "apply_fill_candidate_after_second_check", "promote_notice_snippet", "confirm_structured_value"].includes(
      row.action_group,
    ),
  );
  return `# S5 핵심 공란 보강 워크북

작성 기준: ${UPDATED_AT}

\`source-verification-sprint-plan\`의 S5 대상 사업장을 핵심 수치 공란, 원문 스니펫 승격, 구조화 값 수동확인, 단계상 미적용 값으로 나눈 실행 보드다. 공란을 무조건 결측으로 보지 않고, 이미 후보 출처가 있는 항목과 추가 검색이 필요한 항목을 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S5 태스크 | ${summary.task_count} |
| S5 사업장 | ${summary.project_count} |
| S5 필드 | ${summary.field_count} |
| 후보값 있는 공란 | ${summary.fill_from_candidate_source_count + summary.apply_fill_candidate_after_second_check_count} |
| 후보 없는 공란 | ${summary.missing_no_candidate_count} |
| 원문 스니펫/구조화값 수동확인 | ${summary.promote_notice_snippet_count + summary.confirm_structured_value_count} |
| 단계상 미적용 | ${summary.defer_stage_not_applicable_count} |
| 시점별 분리 필요 | ${summary.record_by_source_date_count} |

## 액션별

${mdTable(summary.action_group_counts, [
  { key: "name", label: "액션" },
  { key: "count", label: "필드" },
])}

## 사업장 실행 보드

${mdTable(projectRows, [
  { key: "min_queue_rank", label: "첫 큐" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_count", label: "필드" },
  { key: "fill_from_candidate_source_count", label: "후보보강" },
  { key: "missing_no_candidate_count", label: "후보없음" },
  { key: "promote_notice_snippet_count", label: "스니펫" },
  { key: "confirm_structured_value_count", label: "구조확인" },
  { key: "defer_stage_not_applicable_count", label: "단계보류" },
  { key: "s5_status", label: "S5 상태" },
  { key: "next_action", label: "다음 행동" },
])}

## 우선 처리 필드

${mdTable(urgentRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "verification_status", label: "장부 상태" },
  { key: "action_group", label: "액션" },
  { key: "candidate_value", label: "후보값" },
  { key: "candidate_source", label: "후보 출처" },
  { key: "next_action", label: "다음 행동" },
])}

## 전체 필드

${mdTable(fieldRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재값" },
  { key: "verification_status", label: "장부 상태" },
  { key: "candidate_value", label: "후보값" },
  { key: "candidate_source", label: "후보 출처" },
  { key: "action_group", label: "액션" },
])}

## 사용법

1. \`fill_from_candidate_source\`는 후보 출처를 열어 값·기준시점·단위가 맞는지 확인한 뒤 장부와 비교표 공란을 보강한다.
2. \`missing_no_candidate\`는 현재 로컬 데이터만으로는 닫지 말고 공식 원문, 정보몽땅 사업개요, 자치구 공고를 추가 검색한다.
3. \`defer_stage_not_applicable\`은 결측이 아니라 단계상 아직 발생 전인 값으로 보류 사유를 기록한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [sprintPlan, ledgerRows, comparisonRows, cleanupSummaries, noticeKeyFields, sourceValueUpdates, sourceLinkCandidates, managementDocs] =
    await Promise.all([
      readJson(INPUTS.sprintPlan),
      readJson(INPUTS.coreLedger),
      readJson(INPUTS.comparison),
      readJson(INPUTS.cleanupSummaries),
      readJson(INPUTS.noticeKeyFields),
      readJson(INPUTS.sourceValueUpdates, []),
      readJson(INPUTS.sourceLinkCandidates, []),
      readJson(INPUTS.managementDocs, []),
    ]);

  const s5Tasks = sprintPlan.taskRows.filter((row) => row.sprint_id === "S5");
  const s5Ranks = new Set(s5Tasks.map((row) => String(row.rank)));
  const sprintRowsByRank = new Map();
  for (const row of s5Tasks) {
    sprintRowsByRank.set(String(row.rank), [...(sprintRowsByRank.get(String(row.rank)) || []), row]);
  }
  const comparisonByRank = byRank(comparisonRows);
  const summaryByRank = byRank(cleanupSummaries);
  const keyFieldsByRank = byRank(noticeKeyFields);
  const updatesByKey = new Map(sourceValueUpdates.map((row) => [`${String(row.rank)}:${row.field_id}`, row]));
  const sourceLinksByKey = new Map(sourceLinkCandidates.map((row) => [`${String(row.rank)}:${row.field_id}`, row]));

  const fieldRows = ledgerRows
    .filter(
      (row) =>
        s5Ranks.has(String(row.rank)) &&
        (row.related_task_type === "fill_missing_core_fields" ||
          row.related_task_type === "promote_snippets_to_confirmed_values" ||
          S5_RELEVANT_STATUSES.has(row.verification_status)),
    )
    .map((ledgerRow) =>
      normalizeFieldRow({
        ledgerRow,
        sprintRows: sprintRowsByRank.get(String(ledgerRow.rank)) || [],
        matrix: comparisonByRank.get(String(ledgerRow.rank)) || {},
        summary: summaryByRank.get(String(ledgerRow.rank)) || {},
        keyField: keyFieldsByRank.get(String(ledgerRow.rank)) || {},
        update: updateCandidate(ledgerRow, updatesByKey),
        sourceLink: sourceLinkCandidate(ledgerRow, sourceLinksByKey),
        managementDocs: managementDocsForRank(managementDocs, ledgerRow.rank),
      }),
    )
    .sort((a, b) => Number(a.queue_rank || 999) - Number(b.queue_rank || 999) || Number(a.ledger_rank) - Number(b.ledger_rank));

  const rowsByRank = new Map();
  for (const row of fieldRows) {
    rowsByRank.set(String(row.rank), [...(rowsByRank.get(String(row.rank)) || []), row]);
  }

  const projectRows = [...rowsByRank.entries()]
    .map(([rank, rows]) => {
      const first = rows[0] || {};
      const base = {
        rank,
        focus_area: first.focus_area,
        district: first.district,
        project_name: first.project_name,
        current_stage: first.current_stage,
        min_queue_rank: Math.min(...rows.map((row) => Number(row.queue_rank || 999))),
        field_count: rows.length,
        fill_from_candidate_source_count: rows.filter((row) => row.action_group === "fill_from_candidate_source").length,
        apply_fill_candidate_after_second_check_count: rows.filter((row) => row.action_group === "apply_fill_candidate_after_second_check").length,
        missing_no_candidate_count: rows.filter((row) => row.action_group === "missing_no_candidate").length,
        promote_notice_snippet_count: rows.filter((row) => row.action_group === "promote_notice_snippet").length,
        confirm_structured_value_count: rows.filter((row) => row.action_group === "confirm_structured_value").length,
        defer_stage_not_applicable_count: rows.filter((row) => row.action_group === "defer_stage_not_applicable").length,
        record_by_source_date_count: rows.filter((row) => row.action_group === "record_by_source_date").length,
        already_resolved_count: rows.filter((row) => row.action_group === "already_resolved").length,
        project_note: first.project_note,
      };
      const status = projectStatus(base);
      return { ...base, s5_status: status, next_action: projectNextAction(status) };
    })
    .sort((a, b) => Number(a.min_queue_rank) - Number(b.min_queue_rank) || Number(a.rank) - Number(b.rank));

  const summary = {
    generated_at: UPDATED_AT,
    task_count: s5Tasks.length,
    project_count: projectRows.length,
    field_count: fieldRows.length,
    fill_from_candidate_source_count: fieldRows.filter((row) => row.action_group === "fill_from_candidate_source").length,
    apply_fill_candidate_after_second_check_count: fieldRows.filter((row) => row.action_group === "apply_fill_candidate_after_second_check").length,
    missing_no_candidate_count: fieldRows.filter((row) => row.action_group === "missing_no_candidate").length,
    promote_notice_snippet_count: fieldRows.filter((row) => row.action_group === "promote_notice_snippet").length,
    confirm_structured_value_count: fieldRows.filter((row) => row.action_group === "confirm_structured_value").length,
    defer_stage_not_applicable_count: fieldRows.filter((row) => row.action_group === "defer_stage_not_applicable").length,
    record_by_source_date_count: fieldRows.filter((row) => row.action_group === "record_by_source_date").length,
    action_group_counts: countBy(fieldRows, "action_group"),
    verification_status_counts: countBy(fieldRows, "verification_status"),
    project_status_counts: countBy(projectRows, "s5_status"),
  };

  const workbook = {
    summary,
    projectRows,
    fieldRows,
    inputs: INPUTS,
    notes: [
      "S5 워크북은 source-verification-sprint-plan의 S5 태스크에 등장한 사업장만 포함한다.",
      "value_missing이라도 후보 출처가 있으면 fill_from_candidate_source로, 후보가 없으면 missing_no_candidate로 분리한다.",
      "not_yet_applicable은 결측이 아니라 단계상 아직 발생 전인 값으로 보류한다.",
    ],
  };

  await writeFile(OUT_JSON, `${JSON.stringify(workbook, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(fieldRows), "utf8");
  await writeFile(OUT_MD, markdown(workbook), "utf8");
  console.log(
    JSON.stringify(
      {
        tasks: summary.task_count,
        projects: summary.project_count,
        fields: summary.field_count,
        actions: countText(fieldRows, "action_group"),
        output: "analysis/s5-core-gap-fill-workbook.{md,csv,json}",
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
