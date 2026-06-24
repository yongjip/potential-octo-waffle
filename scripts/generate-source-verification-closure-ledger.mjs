#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-verification-closure-ledger.md");
const OUT_CSV = path.join(OUT_DIR, "source-verification-closure-ledger.csv");
const OUT_JSON = path.join(OUT_DIR, "source-verification-closure-ledger.json");

const INPUTS = {
  s1Review: "analysis/s1-evidence-review-board.json",
  s2Closure: "analysis/s2-source-link-closure-workbook.json",
  s3Ocr: "analysis/s3-ocr-image-verification-workbook.json",
  s4Stage: "analysis/s4-stage-conflict-resolution-workbook.json",
  s5Gap: "analysis/s5-core-gap-fill-workbook.json",
  expansionMetadata: "data/review/expansion-source-metadata-closure-seeds.json",
  closureDecisions: "data/review/source-verification-closure-decisions.json",
};

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

function compact(value, limit = 360) {
  const text = Array.isArray(value) ? value.filter(Boolean).join("; ") : String(value ?? "");
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1)}...`;
}

function firstArrayValue(value, field) {
  if (!Array.isArray(value)) return compact(value);
  if (!Array.isArray(value) || !value.length) return "";
  const item = value[0];
  return compact(field ? item?.[field] : item);
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "(blank)");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function validDecisionStatus(value) {
  return ["confirmed", "pending", "conflict", "deferred"].includes(value);
}

function normalizeMatchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[()[\]{}'"`~!@#$%^&*+=?:;,.\/\\|-]/g, "")
    .replace(/\s+/g, "");
}

function contextKey({ sprint_id, project_name, field_label }) {
  return [String(sprint_id || ""), normalizeMatchText(project_name), normalizeMatchText(field_label)].join("|");
}

function fieldIdSignature(value) {
  return normalizeMatchText(String(value ?? "").slice(0, 240));
}

function pushMapValue(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function decisionIndexes(decisions) {
  const valid = decisions
    .filter((decision) => decision.closure_id && validDecisionStatus(decision.decision_status))
    .map((decision, index) => ({
      ...decision,
      _order: index,
      _context_key: contextKey(decision),
      _field_id_signature: fieldIdSignature(decision.field_id),
    }));

  const byClosureId = new Map();
  const byContextKey = new Map();
  for (const decision of valid) {
    pushMapValue(byClosureId, decision.closure_id, decision);
    pushMapValue(byContextKey, decision._context_key, decision);
  }
  return { byClosureId, byContextKey };
}

function pickLatest(candidates) {
  if (!candidates.length) return null;
  return candidates.slice().sort((a, b) => Number(a._order || 0) - Number(b._order || 0)).at(-1);
}

function chooseDecisionForRow(row, indexes) {
  const rowContextKey = contextKey(row);
  const rowFieldSignature = fieldIdSignature(row.field_id);
  const closureCandidates = indexes.byClosureId.get(row.closure_id) || [];
  const closureContextMatches = closureCandidates.filter((decision) => decision._context_key === rowContextKey);
  if (closureContextMatches.length) {
    return {
      decision: pickLatest(closureContextMatches),
      decision_match_mode: "closure_context_exact",
      decision_context_status: "matched",
      decision_candidate_count: closureContextMatches.length,
    };
  }

  const allowLooseContextMatch = row.sprint_id === "S1" || row.work_item_type === "evidence_review_group";
  const contextCandidates = (indexes.byContextKey.get(rowContextKey) || []).filter((decision) => {
    if (allowLooseContextMatch) return true;
    if (!rowFieldSignature || !decision._field_id_signature) return true;
    return decision._field_id_signature === rowFieldSignature || decision._field_id_signature.includes(rowFieldSignature) || rowFieldSignature.includes(decision._field_id_signature);
  });

  if (contextCandidates.length) {
    return {
      decision: pickLatest(contextCandidates),
      decision_match_mode: "context_fallback",
      decision_context_status: closureCandidates.length ? "closure_id_mismatch_recovered" : "closure_id_missing_recovered",
      decision_candidate_count: contextCandidates.length,
    };
  }

  if (closureCandidates.length) {
    return {
      decision: null,
      decision_match_mode: "none",
      decision_context_status: "closure_id_mismatch_unresolved",
      decision_candidate_count: closureCandidates.length,
    };
  }

  return {
    decision: null,
    decision_match_mode: "none",
    decision_context_status: "no_decision",
    decision_candidate_count: 0,
  };
}

function countText(counts, limit = 8) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function sprintCounts(rows) {
  return Object.entries(countBy(rows, "sprint_id"))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sprint_id, count]) => ({ sprint_id, count }));
}

function normalizePriority(priority) {
  return priority || "P1";
}

function normalizeQueueRank(row, fallback) {
  return Number(row.queue_rank || row.review_rank || row.ledger_rank || row.rank || fallback);
}

function s2RecommendedClosure(status) {
  if (/original_notice_url_available|mixed_original_notice_url/.test(status)) return "partial_confirm_after_url_review";
  if (/local_original_notice_text_url_pending/.test(status)) return "pending_recordcode_url_lookup";
  if (/official_summary_value_match_original_notice_pending/.test(status)) return "pending_original_notice_source";
  if (/local_text_available_no_closure_rows/.test(status)) return "pending_map_local_text_to_fields";
  return "pending_source_link_review";
}

function s3RecommendedClosure(row) {
  const text = `${row.verification_status || ""} ${row.manual_ocr_review_status || ""} ${row.recommended_value_action || ""}`;
  if (/confirmed_from_ocr_image|source_value_confirmed_from_image/.test(text)) return "confirm";
  if (/update_required|precision_mismatch|source_value_update/.test(text)) return "conflict_or_update";
  if (/relink_required|source_image_not_suitable|source_link_required/.test(text)) return "pending_source_relink";
  if (/partial|basis|secondary/.test(text)) return "pending_secondary_source";
  return "pending_ocr_image_review";
}

function s4RecommendedClosure(row) {
  const action = row.action_group || row.resolution_status || "";
  if (action === "record_resolved_value") return "confirm";
  if (action === "record_values_by_source_date") return "source_date_split";
  if (["fetch_management_attachment", "fill_missing_stage_date"].includes(action)) return "pending_more_source";
  return "pending_stage_conflict_review";
}

function s5RecommendedClosure(row) {
  const action = row.action_group || row.next_value_action || "";
  if (action === "defer_stage_not_applicable") return "defer";
  if (action === "already_resolved") return "confirm";
  if (action === "record_by_source_date") return "source_date_split";
  if (["fill_from_candidate_source", "apply_fill_candidate_after_second_check", "promote_notice_snippet", "confirm_structured_value"].includes(action)) {
    return "confirm_or_pending_after_review";
  }
  if (action === "missing_no_candidate") return "pending_search";
  return "pending_gap_review";
}

function workItem({
  closure_id,
  sprint_id,
  queue_rank,
  priority,
  focus_area,
  district,
  rank,
  project_name,
  current_stage,
  work_item_type,
  field_id = "",
  field_label = "",
  category = "",
  current_value = "",
  candidate_value = "",
  candidate_source = "",
  source_to_open = "",
  source_path_or_url = "",
  evidence_snippet = "",
  action_group = "",
  recommended_closure,
  next_action = "",
  project_note = "",
}) {
  return {
    closure_id,
    sprint_id,
    queue_rank,
    priority: normalizePriority(priority),
    focus_area: compact(focus_area, 120),
    district: compact(district, 80),
    rank,
    project_name: compact(project_name, 160),
    current_stage: compact(current_stage, 120),
    work_item_type,
    field_id: compact(field_id, 120),
    field_label: compact(field_label, 160),
    category: compact(category, 120),
    current_value: compact(current_value, 180),
    candidate_value: compact(candidate_value, 220),
    candidate_source: compact(candidate_source, 180),
    source_to_open: compact(source_to_open, 260),
    source_path_or_url: compact(source_path_or_url, 320),
    evidence_snippet: compact(evidence_snippet, 360),
    action_group: compact(action_group, 160),
    closure_status: "open",
    recommended_closure,
    decision_id: "",
    decided_at: "",
    decision_reviewer: "",
    decision_match_mode: "none",
    decision_context_status: "no_decision",
    decision_candidate_count: 0,
    decision_basis: "",
    decision_note: "",
    follow_up_action: "",
    next_action: compact(next_action, 300),
    project_note: compact(project_note, 260),
  };
}

function applyDecisions(rows, decisions) {
  const indexes = decisionIndexes(decisions);
  return rows.map((row) => {
    const match = chooseDecisionForRow(row, indexes);
    if (!match.decision) {
      return {
        ...row,
        decision_match_mode: match.decision_match_mode,
        decision_context_status: match.decision_context_status,
        decision_candidate_count: match.decision_candidate_count,
      };
    }
    const decision = match.decision;
    return {
      ...row,
      closure_status: decision.decision_status,
      recommended_closure: compact(decision.recommended_closure || row.recommended_closure, 160),
      decision_id: compact(decision.decision_id, 120),
      decided_at: compact(decision.decided_at, 80),
      decision_reviewer: compact(decision.reviewer, 120),
      decision_match_mode: match.decision_match_mode,
      decision_context_status: match.decision_context_status,
      decision_candidate_count: match.decision_candidate_count,
      decision_basis: compact(decision.decision_basis, 220),
      decision_note: compact(decision.decision_note, 360),
      follow_up_action: compact(decision.follow_up_action, 300),
    };
  });
}

function s1Rows(workbook) {
  return (workbook.rows || []).map((row, index) =>
    workItem({
      closure_id: `S1-${String(index + 1).padStart(4, "0")}`,
      sprint_id: "S1",
      queue_rank: normalizeQueueRank(row, index + 1),
      priority: row.priority,
      focus_area: row.focus_area,
      district: "",
      rank: row.rank,
      project_name: row.project_name,
      current_stage: row.current_stage,
      work_item_type: "evidence_review_group",
      field_id: row.ledger_fields_to_close,
      field_label: row.category_label,
      category: row.category,
      candidate_value: row.top_values,
      candidate_source: row.top_public_items,
      source_to_open: firstArrayValue(row.top_source_lines),
      source_path_or_url: firstArrayValue(row.top_public_items, "detail_url"),
      evidence_snippet: row.top_snippets,
      action_group: row.review_status,
      recommended_closure: row.review_status === "ready_with_p0_public_item" ? "confirm_or_conflict_from_p0_public_item" : "confirm_or_conflict_from_public_item",
      next_action: row.next_review_action,
      project_note: row.project_note,
    }),
  );
}

function s2Rows(workbook) {
  return (workbook.rows || []).map((row, index) =>
    workItem({
      closure_id: `S2-${String(index + 1).padStart(4, "0")}`,
      sprint_id: "S2",
      queue_rank: normalizeQueueRank(row, index + 1),
      priority: row.priority,
      focus_area: row.focus_area,
      district: row.district,
      rank: row.rank,
      project_name: row.project_name,
      current_stage: row.current_stage,
      work_item_type: "recordcode_url_closure",
      field_id: row.field_values_to_close,
      field_label: `${row.closure_field_count || 0} fields`,
      category: "source_link_closure",
      current_value: row.existing_notice_no || row.existing_notice_date || "",
      candidate_value: row.existing_notice_title,
      candidate_source: row.closure_status_summary,
      source_to_open: row.next_lookup_target,
      source_path_or_url: compact([...(row.local_notice_text_paths || []), ...(row.official_summary_urls || []), ...(row.candidate_original_notice_paths || [])], 320),
      evidence_snippet: row.related_public_items,
      action_group: row.recordcode_closure_status,
      recommended_closure: s2RecommendedClosure(row.recordcode_closure_status || row.closure_status_summary || ""),
      next_action: row.next_review_action,
      project_note: row.project_note,
    }),
  );
}

function s3Rows(workbook) {
  return (workbook.fieldRows || []).map((row, index) =>
    workItem({
      closure_id: `S3-${String(index + 1).padStart(4, "0")}`,
      sprint_id: "S3",
      queue_rank: normalizeQueueRank(row, index + 1),
      priority: row.priority,
      focus_area: row.focus_area,
      district: row.district,
      rank: row.rank,
      project_name: row.project_name,
      current_stage: row.current_stage,
      work_item_type: "ocr_image_field",
      field_id: row.field_id,
      field_label: row.field_label,
      category: "ocr_image_value",
      current_value: row.current_value,
      candidate_value: row.manual_ocr_source_value || row.decision_source_values,
      candidate_source: row.manual_ocr_review_status || row.decision_statuses,
      source_to_open: row.source_to_open,
      source_path_or_url: row.image_paths || row.text_paths,
      evidence_snippet: row.evidence_text || row.source_contexts,
      action_group: row.recommended_value_action || row.verification_status,
      recommended_closure: s3RecommendedClosure(row),
      next_action: row.recommended_value_action || row.manual_ocr_review_status || row.verification_status,
      project_note: row.project_note,
    }),
  );
}

function s4Rows(workbook) {
  return (workbook.fieldRows || []).map((row, index) =>
    workItem({
      closure_id: `S4-${String(index + 1).padStart(4, "0")}`,
      sprint_id: "S4",
      queue_rank: normalizeQueueRank(row, index + 1),
      priority: row.priority,
      focus_area: row.focus_area,
      district: row.district,
      rank: row.rank,
      project_name: row.project_name,
      current_stage: row.current_stage,
      work_item_type: "stage_conflict_field",
      field_id: row.field_id,
      field_label: row.field_label,
      category: "stage_conflict",
      current_value: row.current_summary_value || row.ledger_current_value,
      candidate_value: row.notice_value || row.public_stage_value,
      candidate_source: row.source_date_basis || row.fact_check_source,
      source_to_open: row.next_source_to_check,
      source_path_or_url: row.related_public_items,
      evidence_snippet: row.recommended_recording,
      action_group: row.action_group,
      recommended_closure: s4RecommendedClosure(row),
      next_action: row.next_action,
      project_note: row.project_note,
    }),
  );
}

function s5Rows(workbook) {
  return (workbook.fieldRows || []).map((row, index) =>
    workItem({
      closure_id: `S5-${String(index + 1).padStart(4, "0")}`,
      sprint_id: "S5",
      queue_rank: normalizeQueueRank(row, index + 1),
      priority: row.priority,
      focus_area: row.focus_area,
      district: row.district,
      rank: row.rank,
      project_name: row.project_name,
      current_stage: row.current_stage,
      work_item_type: "core_gap_field",
      field_id: row.field_id,
      field_label: row.field_label,
      category: row.related_task_type || row.sprint_task_type,
      current_value: row.current_value,
      candidate_value: row.candidate_value,
      candidate_source: row.candidate_source,
      source_to_open: row.source_to_open,
      source_path_or_url: row.candidate_path_or_url,
      evidence_snippet: row.candidate_note || row.related_public_items,
      action_group: row.action_group,
      recommended_closure: s5RecommendedClosure(row),
      next_action: row.next_action || row.next_value_action,
      project_note: row.project_note,
    }),
  );
}

function expansionRows(workbook) {
  return (workbook.rows || []).map((row) =>
    workItem({
      closure_id: row.closure_id,
      sprint_id: row.sprint_id || "S2",
      queue_rank: normalizeQueueRank(row, 9999),
      priority: row.priority,
      focus_area: row.focus_area,
      district: row.district,
      rank: row.rank,
      project_name: row.project_name,
      current_stage: row.current_stage,
      work_item_type: row.work_item_type || "expansion_notice_metadata",
      field_id: row.field_id,
      field_label: row.field_label,
      category: row.category || "expansion_notice_metadata",
      current_value: row.current_value,
      candidate_value: row.candidate_value,
      candidate_source: row.candidate_source,
      source_to_open: row.source_to_open,
      source_path_or_url: row.source_path_or_url,
      evidence_snippet: row.evidence_snippet,
      action_group: row.action_group || "confirm_structured_value",
      recommended_closure: row.recommended_closure || "confirm_from_notice_text",
      next_action: row.next_action,
      project_note: row.project_note,
    }),
  );
}

function prioritySort(a, b) {
  const priorityRank = { P0: 0, P1: 1, P2: 2 };
  return (
    (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) ||
    a.sprint_id.localeCompare(b.sprint_id) ||
    Number(a.queue_rank || 9999) - Number(b.queue_rank || 9999) ||
    a.closure_id.localeCompare(b.closure_id)
  );
}

function buildSummary(rows) {
  const recommended = countBy(rows, "recommended_closure");
  const closureStatuses = countBy(rows, "closure_status");
  const decisionContextStatuses = countBy(rows, "decision_context_status");
  const sourceSearchRequired = rows.filter((row) => /pending.*(search|source|recordcode|relink|lookup|more)/.test(row.recommended_closure)).length;
  return {
    generated_at: `${kstDate()} KST`,
    item_count: rows.length,
    open_items: rows.filter((row) => row.closure_status === "open").length,
    confirmed_items: rows.filter((row) => row.closure_status === "confirmed").length,
    pending_items: rows.filter((row) => row.closure_status === "pending").length,
    conflict_items: rows.filter((row) => row.closure_status === "conflict").length,
    deferred_items: rows.filter((row) => row.closure_status === "deferred").length,
    p0_count: rows.filter((row) => row.priority === "P0").length,
    p1_count: rows.filter((row) => row.priority === "P1").length,
    p2_count: rows.filter((row) => row.priority === "P2").length,
    sprint_counts: sprintCounts(rows),
    closure_status_counts: closureStatuses,
    decision_context_status_counts: decisionContextStatuses,
    recommended_closure_counts: recommended,
    action_group_counts: countBy(rows, "action_group"),
    ready_to_confirm_count: rows.filter((row) => /confirm/.test(row.recommended_closure)).length,
    source_search_required_count: sourceSearchRequired,
    deferred_candidate_count: rows.filter((row) => row.recommended_closure === "defer").length,
    source_workbooks: INPUTS,
  };
}

function markdown(rows, summary) {
  const topRows = rows.slice().sort(prioritySort).slice(0, 120);
  return `# 원문 검증 통합 클로저 장부

작성 기준: ${kstDate()} KST

S1-S5 원문 검증 워크북을 하나의 결정 장부로 표준화했다. 이 파일은 값 자체를 확정하지 않고, 각 항목을 어떤 판정으로 닫아야 하는지(\`confirmed/pending/conflict/deferred\`) 정하기 위한 실행 목록이다. 전체 ${summary.item_count}건은 CSV/JSON에 모두 들어 있고, 아래 표는 P0/P1 우선순위 상위 120건이다.

## 요약

| 항목 | 값 |
| --- | --- |
| 클로저 항목 | ${summary.item_count}건 |
| open 항목 | ${summary.open_items}건 |
| 판정 상태 | ${countText(summary.closure_status_counts, 8)} |
| decision 문맥 | ${countText(summary.decision_context_status_counts, 8)} |
| P0/P1/P2 | ${summary.p0_count}/${summary.p1_count}/${summary.p2_count} |
| 스프린트 분포 | ${summary.sprint_counts.map((row) => `${row.sprint_id} ${row.count}`).join("; ")} |
| 권장 클로저 | ${countText(summary.recommended_closure_counts, 12)} |
| 바로 확정 검토 가능 | ${summary.ready_to_confirm_count}건 |
| 추가 원문/검색 필요 | ${summary.source_search_required_count}건 |
| 단계상 보류 후보 | ${summary.deferred_candidate_count}건 |

## 사용 방법

1. \`recommended_closure\`가 \`confirm*\`인 항목은 원문 이미지를 한 번 더 열고 \`confirmed\`로 닫을지 결정한다.
2. \`pending_*\` 항목은 원문 URL, recordCode, 별첨, OCR 이미지, 2차 공식 출처 중 무엇이 빠졌는지 먼저 채운다.
3. \`source_date_split\` 항목은 하나의 현재값으로 덮어쓰지 말고 고시/사업시행/관리처분 시점별 값을 별도 기록한다.
4. \`defer\` 항목은 현재 단계상 아직 적용 전인 필드로 두고, 다음 단계 전환 시 다시 연다.
5. \`decision_context_status\`가 \`closure_id_mismatch_*\`이면 decision 로그의 closure_id가 현재 장부 문맥과 어긋난 상태다. 이 경우 별도 감사표를 먼저 보고 정리한다.

## 우선 처리 상위 120건

${mdTable(topRows, [
  { key: "closure_id", label: "ID" },
  { key: "priority", label: "우선" },
  { key: "sprint_id", label: "S" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드/묶음" },
  { key: "closure_status", label: "상태" },
  { key: "decision_context_status", label: "decision 문맥" },
  { key: "recommended_closure", label: "권장 클로저" },
  { key: "source_to_open", label: "열 출처" },
  { key: "follow_up_action", label: "후속 행동" },
])}

## 원천 워크북

- \`${INPUTS.s1Review}\`
- \`${INPUTS.s2Closure}\`
- \`${INPUTS.s3Ocr}\`
- \`${INPUTS.s4Stage}\`
- \`${INPUTS.s5Gap}\`
- \`${INPUTS.expansionMetadata}\`
- \`${INPUTS.closureDecisions}\`
`;
}

async function main() {
  const [s1, s2, s3, s4, s5, expansionMetadata, decisions] = await Promise.all([
    readJson(INPUTS.s1Review),
    readJson(INPUTS.s2Closure),
    readJson(INPUTS.s3Ocr),
    readJson(INPUTS.s4Stage),
    readJson(INPUTS.s5Gap),
    readJson(INPUTS.expansionMetadata, { rows: [] }),
    readJson(INPUTS.closureDecisions, []),
  ]);
  const rows = applyDecisions(
    [...s1Rows(s1), ...s2Rows(s2), ...s3Rows(s3), ...s4Rows(s4), ...s5Rows(s5), ...expansionRows(expansionMetadata)],
    decisions,
  ).sort(prioritySort);
  const summary = buildSummary(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: `${kstDate()} KST`, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(`Wrote ${OUT_MD}, ${OUT_CSV}, ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
