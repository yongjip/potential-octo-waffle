#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-status-dashboard.md");
const OUT_CSV = path.join(OUT_DIR, "research-status-dashboard.csv");
const OUT_JSON = path.join(OUT_DIR, "research-status-dashboard.json");

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const RISK_INPUT = "analysis/project-risk-signal-summary.json";
const EVIDENCE_INPUT = "analysis/source-evidence-audit.json";
const QUEUE_INPUT = "analysis/source-verification-action-queue.json";
const LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";
const CLOSURE_LEDGER_INPUT = "analysis/source-verification-closure-ledger.json";
const OCR_TRIAGE_INPUT = "analysis/ocr-source-review-triage.json";
const UPDATE_CANDIDATES_INPUT = "analysis/source-value-update-candidates.json";

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const PRIORITY_WEIGHT = {
  P0: 400,
  P1: 300,
  P2: 200,
  P3: 100,
};

const RISK_WEIGHT = {
  very_high: 80,
  high: 50,
  medium: 20,
  watch: 0,
};

const CORE_REVIEW_STATUSES = new Set([
  "ocr_review_required",
  "ocr_source_value_update_required",
  "ocr_partial_confirmation_pending",
  "source_value_fill_missing_required",
  "source_link_required",
  "management_stage_followup_needed",
  "source_date_split_required",
  "value_missing",
  "structured_value_needs_manual_confirmation",
  "snippet_candidate_needs_manual_confirmation",
  "no_source_text",
]);

const STATUS_LABELS = {
  closed_confirmed: "클로저 확정",
  closed_deferred: "클로저 보류",
  ocr_review_required: "OCR 대조",
  ocr_source_value_update_required: "원문값 보정",
  ocr_partial_confirmation_pending: "부분확정",
  source_value_fill_missing_required: "원문값 보강",
  source_link_required: "원문링크",
  management_stage_followup_needed: "관리처분 시점차",
  source_date_split_required: "시점분리",
  value_missing: "공란",
  structured_value_needs_manual_confirmation: "구조화값 확인",
  snippet_candidate_needs_manual_confirmation: "스니펫 확인",
  no_source_text: "원문텍스트 없음",
};

const TASK_LABELS = {
  fetch_original_notice_or_recordcode: "본고시/recordCode",
  relink_original_notice: "원문 재연결",
  fetch_secondary_source: "2차 출처 확인",
  record_source_date_split: "시점값 분리",
  apply_conflict_or_precision_update: "충돌/정밀도 보정",
  review_public_item_attachment: "공개항목 첨부 대조",
  search_missing_value_source: "공란값 원문 검색",
  review_candidate_value: "후보값 대조",
  crosscheck_cost_infrastructure: "비용/기반시설",
  verify_ocr_numbers: "OCR 숫자",
  fill_missing_core_fields: "핵심수치 공란",
  promote_snippets_to_confirmed_values: "스니펫 확정",
  connect_recordcode_original_notice: "recordCode/고시",
  resolve_stage_value_conflict: "단계 수치 충돌",
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

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || row.project_rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function readRows(input) {
  if (Array.isArray(input)) return input;
  return input?.rows || input?.actions || [];
}

function normalizeQueueRows(rows) {
  return rows.map((row) => ({
    ...row,
    rank: row.rank || row.project_rank || "",
    task_type: row.task_type || row.action_mode || row.recommended_closure || "",
    task_title: row.task_title || row.action_label || "",
    expected_output: row.expected_output || row.acceptance_criteria || row.follow_up_action || "",
    source_to_open: row.source_to_open || row.first_target || "",
  }));
}

function closureKey(row) {
  return `${String(row.rank || "")}:${String(row.field_id || "")}`;
}

function buildClosureByRankField(closureRows) {
  return new Map(
    closureRows
      .filter((row) => row.rank && row.field_id && ["confirmed", "deferred"].includes(row.closure_status))
      .map((row) => [closureKey(row), row]),
  );
}

function buildSourceLinkClosureByRank(closureRows) {
  return new Map(
    closureRows
      .filter((row) => row.rank && row.category === "source_link_closure" && ["confirmed", "deferred"].includes(row.closure_status))
      .map((row) => [String(row.rank), row]),
  );
}

function countBy(rows, getter) {
  return rows.reduce((acc, row) => {
    const key = getter(row);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function formatCounts(counts, labels = {}) {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${labels[key] || key} ${count}`)
    .join("; ");
}

function topItems(rows, mapFn, limit = 3) {
  return rows
    .slice(0, limit)
    .map(mapFn)
    .filter(Boolean)
    .join(" / ");
}

function compactTexts(items, limit = 4) {
  return [...new Set(items.flat().filter(Boolean))].slice(0, limit).join("; ");
}

function extractDocRefs(text) {
  return String(text || "").match(/(?:analysis|project-notes)\/[^\s;]+\.md/g) || [];
}

function taskSortScore(task) {
  return (PRIORITY_WEIGHT[task.priority] || 0) + (RISK_WEIGHT[task.risk_signal_level] || 0) + Number(task.queue_rank || 0) * -0.01;
}

function projectSortScore(row) {
  return (
    Number(row.p0_tasks) * 1000 +
    Number(row.p1_tasks) * 500 +
    Number(row.core_review_items) * 20 +
    Number(row.ocr_review_items) * 30 +
    Number(row.source_link_items) * 40 +
    (RISK_WEIGHT[row.risk_signal_level] || 0) +
    Number(row.source_value_update_candidates) * 80
  );
}

function effectiveLedgerRow(row, closureByRankField, sourceLinkClosureByRank) {
  const closure = closureByRankField.get(closureKey(row));
  if (!closure) return row;
  if (closure.closure_status === "confirmed") {
    return { ...row, verification_status: "closed_confirmed" };
  }
  if (closure.closure_status === "deferred") {
    return { ...row, verification_status: "closed_deferred" };
  }
  return row;
}

function summarizeLedger(ledgerRows, closureByRankField, sourceLinkClosureByRank) {
  const effectiveRows = ledgerRows.map((row) => {
    const direct = effectiveLedgerRow(row, closureByRankField, sourceLinkClosureByRank);
    if (direct !== row) return direct;
    const rankClosure = sourceLinkClosureByRank.get(String(row.rank || ""));
    if (!rankClosure || !["source_link_required", "no_source_text"].includes(row.verification_status)) return row;
    if (rankClosure.closure_status === "confirmed") return { ...row, verification_status: "closed_confirmed" };
    if (rankClosure.closure_status === "deferred") return { ...row, verification_status: "closed_deferred" };
    return row;
  });
  const statusCounts = countBy(effectiveRows, (row) => row.verification_status);
  const taskPriorityCounts = countBy(ledgerRows, (row) => row.related_task_priority);
  const reviewItems = effectiveRows.filter((row) => CORE_REVIEW_STATUSES.has(row.verification_status));
  const ocrItems = effectiveRows.filter((row) => String(row.verification_status || "").startsWith("ocr_"));
  const sourceLinkItems = effectiveRows.filter((row) => row.verification_status === "source_link_required" || row.verification_status === "no_source_text");
  const missingItems = effectiveRows.filter((row) => row.verification_status === "value_missing");

  return {
    statusCounts,
    taskPriorityCounts,
    coreReviewItems: reviewItems.length,
    ocrReviewItems: ocrItems.length,
    sourceLinkItems: sourceLinkItems.length,
    missingItems: missingItems.length,
    statusSummary: formatCounts(statusCounts, STATUS_LABELS),
  };
}

function summarizeTasks(tasks) {
  const priorityCounts = countBy(tasks, (row) => row.priority);
  const typeCounts = countBy(tasks, (row) => row.task_type);
  const sorted = tasks.slice().sort((a, b) => taskSortScore(b) - taskSortScore(a));

  return {
    priorityCounts,
    typeCounts,
    p0Tasks: priorityCounts.P0 || 0,
    p1Tasks: priorityCounts.P1 || 0,
    p2Tasks: priorityCounts.P2 || 0,
    p3Tasks: priorityCounts.P3 || 0,
    openP0P1Tasks: (priorityCounts.P0 || 0) + (priorityCounts.P1 || 0),
    taskSummary: formatCounts(typeCounts, TASK_LABELS),
    firstTask: sorted[0] || {},
    firstSource: sorted.find((row) => row.source_to_open || row.first_target)?.source_to_open || sorted.find((row) => row.first_target)?.first_target || "",
    topTasks: topItems(sorted, (row) => `${row.priority} ${TASK_LABELS[row.task_type] || row.task_type}`, 3),
  };
}

function stageAlignmentInterpretation(matrix) {
  if (matrix.business_layer_alignment_status !== "stage_ahead_of_matrix") return "";
  if (
    matrix.current_stage === "사업시행인가" &&
    matrix.business_layer_stage === "착공" &&
    String(matrix.project_note || "") === "project-notes/25-hanyanggaro.md"
  ) {
    return "acknowledged_construction_signal";
  }
  return "";
}

function buildRows({ matrixRows, riskRowsByRank, evidenceRowsByRank, queueRowsByRank, ledgerRowsByRank, closureByRankField, sourceLinkClosureByRank, triageRowsByRank, updateRowsByRank }) {
  return matrixRows
    .map((matrix) => {
      const rank = String(matrix.rank);
      const risk = riskRowsByRank[rank] || {};
      const evidence = evidenceRowsByRank[rank] || {};
      const tasks = queueRowsByRank[rank] || [];
      const ledgerSummary = summarizeLedger(ledgerRowsByRank[rank] || [], closureByRankField, sourceLinkClosureByRank);
      const taskSummary = summarizeTasks(tasks);
      const triageRows = triageRowsByRank[rank] || [];
      const updateRows = updateRowsByRank[rank] || [];
      const nextTask = taskSummary.firstTask;
      const riskLevel = risk.risk_signal_level || "watch";
      const evidenceGrade = evidence.evidence_grade || "";
      const sourceCoverageScore = evidence.source_coverage_score ?? matrix.source_coverage_score ?? "";
      const locationContextScore = risk.location_context_score || "";
      const stageAlignmentStatus = matrix.business_layer_alignment_status || "";
      const stageAlignmentInterpretationLabel = stageAlignmentInterpretation(matrix);
      const hasStageAheadSignal = stageAlignmentStatus === "stage_ahead_of_matrix" && stageAlignmentInterpretationLabel !== "acknowledged_construction_signal";
      const stageMismatchAction = hasStageAheadSignal
        ? `정보몽땅 추진경과의 ${matrix.business_layer_stage || "후속 단계"} 공개 신호와 비교표 현재 단계 ${matrix.current_stage || ""} 차이를 공식 원문 기준으로 재판정`
        : stageAlignmentInterpretationLabel === "acknowledged_construction_signal"
          ? "사업시행 direct 원문과 착공 공개신호 병기 해석을 유지하고, direct 착공신고 원문·recordCode는 후속 보강 항목으로 관리"
        : "";
      const stageMismatchSources = hasStageAheadSignal
        ? compactTexts([
            matrix.project_note || "",
            matrix.project_note === "project-notes/25-hanyanggaro.md" ? "analysis/hanyanggaro-stage-source-memo.md" : "",
            matrix.project_note === "project-notes/25-hanyanggaro.md" ? "analysis/gwangjin-gu-notice-fact-check.md" : "",
            extractDocRefs(evidence.next_evidence_action),
          ])
        : stageAlignmentInterpretationLabel === "acknowledged_construction_signal"
          ? compactTexts([
              matrix.project_note || "",
              "analysis/hanyanggaro-stage-source-memo.md",
              "analysis/gwangjin-gu-notice-fact-check.md",
            ])
        : "";
      const readiness =
        taskSummary.p0Tasks > 0 || ledgerSummary.sourceLinkItems > 0
          ? "immediate_review"
          : hasStageAheadSignal || taskSummary.p1Tasks > 0 || ledgerSummary.ocrReviewItems > 0
            ? "needs_source_confirmation"
            : taskSummary.openP0P1Tasks === 0 && ledgerSummary.coreReviewItems === 0
              ? "ready_for_periodic_monitoring"
              : "watch";

      return {
        rank,
        focus_area: matrix.focus_area,
        district: matrix.district,
        project_name: matrix.project_name,
        current_stage: matrix.current_stage,
        risk_signal_level: riskLevel,
        readiness,
        evidence_grade: evidenceGrade,
        source_coverage_score: sourceCoverageScore,
        location_context_score: locationContextScore,
        p0_tasks: taskSummary.p0Tasks,
        p1_tasks: taskSummary.p1Tasks,
        p0_p1_tasks: taskSummary.openP0P1Tasks,
        all_tasks: tasks.length,
        core_review_items: ledgerSummary.coreReviewItems,
        ocr_review_items: ledgerSummary.ocrReviewItems,
        ocr_triage_items: triageRows.length,
        source_link_items: ledgerSummary.sourceLinkItems,
        missing_value_items: ledgerSummary.missingItems,
        source_value_update_candidates: updateRows.length,
        task_type_summary: taskSummary.taskSummary,
        core_status_summary: ledgerSummary.statusSummary,
        top_tasks: taskSummary.topTasks,
        business_layer_stage: matrix.business_layer_stage || "",
        business_layer_alignment_status: stageAlignmentStatus,
        stage_alignment_interpretation: stageAlignmentInterpretationLabel,
        business_layer_alignment_note: matrix.business_layer_alignment_note || "",
        next_task_priority: nextTask.priority || "",
        next_task_type: nextTask.task_type || "",
        next_task_title: nextTask.task_title || "",
        next_action: stageMismatchAction || nextTask.expected_output || risk.next_action || matrix.next_action || "",
        first_source_to_open: stageMismatchSources || nextTask.source_to_open || nextTask.first_target || taskSummary.firstSource || evidence.next_evidence_action || "",
        top_public_items: risk.top_public_items || "",
        key_risk_hypothesis: risk.key_risk_hypothesis || "",
        project_note: matrix.project_note || risk.project_note || evidence.project_note || "",
        sort_score: 0,
      };
    })
    .map((row) => ({ ...row, sort_score: projectSortScore(row) }))
    .sort((a, b) => Number(b.sort_score) - Number(a.sort_score) || Number(a.rank) - Number(b.rank));
}

function buildFocusRows(rows) {
  return Object.values(
    rows.reduce((acc, row) => {
      const key = row.focus_area;
      if (!acc[key]) {
        acc[key] = {
          focus_area: key,
          projects: 0,
          very_high: 0,
          high: 0,
          immediate_review: 0,
          p0_tasks: 0,
          p1_tasks: 0,
          core_review_items: 0,
          ocr_review_items: 0,
          source_link_items: 0,
          source_value_update_candidates: 0,
        };
      }
      const bucket = acc[key];
      bucket.projects += 1;
      if (row.risk_signal_level === "very_high") bucket.very_high += 1;
      if (row.risk_signal_level === "high") bucket.high += 1;
      if (row.readiness === "immediate_review") bucket.immediate_review += 1;
      bucket.p0_tasks += Number(row.p0_tasks);
      bucket.p1_tasks += Number(row.p1_tasks);
      bucket.core_review_items += Number(row.core_review_items);
      bucket.ocr_review_items += Number(row.ocr_review_items);
      bucket.source_link_items += Number(row.source_link_items);
      bucket.source_value_update_candidates += Number(row.source_value_update_candidates);
      return acc;
    }, {}),
  ).sort((a, b) => b.p0_tasks - a.p0_tasks || b.core_review_items - a.core_review_items || a.focus_area.localeCompare(b.focus_area));
}

function buildTaskTypeRows(queueRows) {
  const grouped = Object.values(
    queueRows.reduce((acc, row) => {
      const key = row.task_type || row.action_mode || row.recommended_closure || "";
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = {
          task_type: key,
          task_label: TASK_LABELS[key] || key,
          tasks: 0,
          p0: 0,
          p1: 0,
          projects: new Set(),
          top_projects: [],
        };
      }
      const bucket = acc[key];
      bucket.tasks += 1;
      if (row.priority === "P0") bucket.p0 += 1;
      if (row.priority === "P1") bucket.p1 += 1;
      bucket.projects.add(row.rank);
      if (bucket.top_projects.length < 4) bucket.top_projects.push(`${row.rank || row.project_rank} ${row.project_name}`);
      return acc;
    }, {}),
  );

  return grouped
    .map((row) => ({
      ...row,
      projects: row.projects.size,
      top_projects: row.top_projects.join(" / "),
    }))
    .sort((a, b) => b.p0 - a.p0 || b.p1 - a.p1 || b.tasks - a.tasks);
}

function markdown(rows, focusRows, taskTypeRows) {
  const immediate = rows.filter((row) => row.readiness === "immediate_review");
  const sourceConfirmation = rows.filter((row) => row.readiness === "needs_source_confirmation");
  const topRows = rows.slice(0, 20);

  return `# 리서치 상태판

작성 기준: ${kstDate()} KST

강남·잠실·구의 생활권 우선검토 후보 30개의 공식 근거 품질, 원문 수치 검증 큐, OCR/recordCode 병목, 사업장별 리스크 신호를 한 줄 상태로 모은 운영판이다. 투자 판단표가 아니라 다음에 어느 원문을 열어 무엇을 확정할지 정하는 작업 인덱스다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${rows.length} |
| 즉시 검토 사업장 | ${immediate.length} |
| 원문 확인 필요 사업장 | ${sourceConfirmation.length} |
| P0 태스크 | ${rows.reduce((sum, row) => sum + Number(row.p0_tasks), 0)} |
| P1 태스크 | ${rows.reduce((sum, row) => sum + Number(row.p1_tasks), 0)} |
| 핵심 수치 검토 항목 | ${rows.reduce((sum, row) => sum + Number(row.core_review_items), 0)} |
| OCR 관련 검토 항목 | ${rows.reduce((sum, row) => sum + Number(row.ocr_review_items), 0)} |
| 원문 링크/텍스트 병목 항목 | ${rows.reduce((sum, row) => sum + Number(row.source_link_items), 0)} |
| 원문 수치 보정 후보 | ${rows.reduce((sum, row) => sum + Number(row.source_value_update_candidates), 0)} |

## 생활권별 상태

${mdTable(focusRows, [
  { key: "focus_area", label: "생활권" },
  { key: "projects", label: "사업장" },
  { key: "very_high", label: "very_high" },
  { key: "high", label: "high" },
  { key: "immediate_review", label: "즉시검토" },
  { key: "p0_tasks", label: "P0" },
  { key: "p1_tasks", label: "P1" },
  { key: "core_review_items", label: "수치검토" },
  { key: "ocr_review_items", label: "OCR" },
  { key: "source_link_items", label: "원문링크" },
])}

## 병목 유형

${mdTable(taskTypeRows, [
  { key: "task_label", label: "병목" },
  { key: "tasks", label: "태스크" },
  { key: "p0", label: "P0" },
  { key: "p1", label: "P1" },
  { key: "projects", label: "사업장" },
  { key: "top_projects", label: "대표 사업장" },
])}

## 우선 처리 사업장

${mdTable(topRows, [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "current_stage", label: "단계" },
  { key: "risk_signal_level", label: "리스크" },
  { key: "readiness", label: "상태" },
  { key: "evidence_grade", label: "근거" },
  { key: "p0_tasks", label: "P0" },
  { key: "p1_tasks", label: "P1" },
  { key: "core_review_items", label: "수치검토" },
  { key: "ocr_review_items", label: "OCR" },
  { key: "source_link_items", label: "원문링크" },
  { key: "source_value_update_candidates", label: "보정" },
  { key: "top_tasks", label: "상위 작업" },
  { key: "first_source_to_open", label: "먼저 열 자료" },
])}

## 생활권별 상세

${["강남", "잠실/송파", "구의/광진"]
  .map((focusArea) => {
    const focusRowsForArea = rows.filter((row) => row.focus_area === focusArea);
    return `### ${focusArea}

${mdTable(focusRowsForArea, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "current_stage", label: "단계" },
  { key: "risk_signal_level", label: "리스크" },
  { key: "readiness", label: "상태" },
  { key: "p0_tasks", label: "P0" },
  { key: "p1_tasks", label: "P1" },
  { key: "task_type_summary", label: "작업 요약" },
  { key: "core_status_summary", label: "수치 상태" },
  { key: "project_note", label: "메모" },
])}`;
  })
  .join("\n\n")}

## 사용법

1. \`readiness=immediate_review\`와 P0가 있는 사업장을 먼저 연다.
2. \`first_source_to_open\`은 다음 작업을 시작할 때 바로 열 자료다.
3. \`core_status_summary\`에서 OCR, 원문링크, 공란이 많은 사업장은 비교 매트릭스의 수치 신뢰도가 아직 낮다.
4. 원문 수치 보정 후보는 \`analysis/source-value-update-candidates.md\`에서 판독값과 반영 방식을 확인한다.
5. 이 상태판은 \`node scripts/generate-research-status-dashboard.mjs\` 또는 전체 재생성 \`node scripts/regenerate-research-artifacts.mjs\`로 다시 만든다.
`;
}

async function main() {
  const [matrixRows, riskRows, evidenceRows, queueInput, ledgerRows, closureLedgerInput, triageRows, updateRows] = await Promise.all([
    readJson(MATRIX_INPUT),
    readJson(RISK_INPUT),
    readJson(EVIDENCE_INPUT),
    readJson(QUEUE_INPUT),
    readJson(LEDGER_INPUT),
    readJson(CLOSURE_LEDGER_INPUT),
    readJson(OCR_TRIAGE_INPUT),
    readJson(UPDATE_CANDIDATES_INPUT),
  ]);
  const queueRows = normalizeQueueRows(readRows(queueInput));
  const closureRows = readRows(closureLedgerInput);
  const closureByRankField = buildClosureByRankField(closureRows);
  const sourceLinkClosureByRank = buildSourceLinkClosureByRank(closureRows);

  const rows = buildRows({
    matrixRows,
    riskRowsByRank: byRank(riskRows),
    evidenceRowsByRank: byRank(evidenceRows),
    queueRowsByRank: groupByRank(queueRows),
    ledgerRowsByRank: groupByRank(ledgerRows),
    closureByRankField,
    sourceLinkClosureByRank,
    triageRowsByRank: groupByRank(triageRows),
    updateRowsByRank: groupByRank(updateRows),
  });
  const focusRows = buildFocusRows(rows);
  const taskTypeRows = buildTaskTypeRows(queueRows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, focusRows, taskTypeRows));

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        immediate_review: rows.filter((row) => row.readiness === "immediate_review").length,
        p0_tasks: rows.reduce((sum, row) => sum + Number(row.p0_tasks), 0),
        p1_tasks: rows.reduce((sum, row) => sum + Number(row.p1_tasks), 0),
        core_review_items: rows.reduce((sum, row) => sum + Number(row.core_review_items), 0),
        output: "analysis/research-status-dashboard.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

await main();
