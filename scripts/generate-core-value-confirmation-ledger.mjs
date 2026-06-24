#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "core-value-confirmation-ledger.md");
const OUT_CSV = path.join(OUT_DIR, "core-value-confirmation-ledger.csv");
const OUT_JSON = path.join(OUT_DIR, "core-value-confirmation-ledger.json");

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const EVIDENCE_INPUT = "analysis/source-evidence-audit.json";
const TEXT_AUDIT_INPUT = "analysis/source-text-extraction-audit.json";
const RISK_INPUT = "analysis/project-risk-signal-summary.json";
const VALUE_QUEUE_INPUT = "analysis/source-value-verification-queue.json";
const MANAGEMENT_VALUE_RESOLUTION_INPUT = "analysis/management-stage-value-resolution.json";
const OCR_REVIEW_TRIAGE_INPUT = "analysis/ocr-source-review-triage.json";
const OCR_IMAGE_REVIEW_DECISIONS_INPUT = "data/review/ocr-image-review-decisions.json";
const SONGPA_NOTICE_VALUE_CORROBORATION_INPUT = "analysis/songpa-notice-value-corroboration.json";
const SOURCE_LINK_REPAIR_CANDIDATES_INPUT = "analysis/source-link-repair-candidates.json";

const VALUE_OVERRIDE_LEDGER_RULES = {
  apply_latest_gangnam_minor_change_notice_values: {
    notice_no: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 대표 고시번호로 이미 보정했으므로 최초 지정 고시는 역사값으로만 유지",
    },
    notice_date: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 대표 고시일로 이미 보정했으므로 최초 지정 고시일은 역사값으로만 유지",
    },
    district_area_sqm_official: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 변경고시의 정비구역 지정 조서 기준 대표값으로 유지",
    },
    total_households_official: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 변경고시의 주택공급계획 기준 대표값으로 유지",
    },
    floor_area_ratio_pct_official: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 변경고시의 대표 용적률 기준으로 유지하고 보조값은 display note에만 남긴다",
    },
    building_coverage_ratio_pct_official: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 변경고시의 건폐율 기준 대표값으로 유지",
    },
    max_height_m_official: {
      verification_status: "confirmed_from_original_notice",
      next_value_action: "최신 변경고시의 최고높이 기준 대표값으로 유지",
    },
    floors_official: {
      verification_status: "partial_original_notice_confirmation",
      next_value_action: "지상층은 최신 변경고시, 지하층은 정보몽땅 사업개요 보조값으로 병기한 대표값으로 유지",
    },
  },
};

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const CORE_FIELDS = [
  {
    field_id: "notice_no",
    label: "고시번호",
    valueField: "notice_no",
    sourceHint: "서울도시공간포털 고시 상세",
    evidenceField: "notice_no",
    textDependent: false,
  },
  {
    field_id: "notice_date",
    label: "고시일",
    valueField: "notice_date",
    sourceHint: "서울도시공간포털 고시 상세",
    evidenceField: "notice_date",
    textDependent: false,
  },
  {
    field_id: "district_area_sqm",
    label: "정비구역 면적",
    valueField: "district_area_sqm_official",
    sourceHint: "고시문/사업개요/사업구역 레이어",
    snippetFlag: "has_area_snippet",
    textDependent: true,
  },
  {
    field_id: "total_households",
    label: "총 세대수",
    valueField: "total_households_official",
    sourceHint: "고시문 주택공급계획/사업개요",
    snippetFlag: "has_household_snippet",
    publicField: "project_stage_total_units_public",
    textDependent: true,
  },
  {
    field_id: "floor_area_ratio_pct",
    label: "용적률",
    valueField: "floor_area_ratio_pct_official",
    sourceHint: "고시문 건축계획/사업개요",
    snippetFlag: "has_far_snippet",
    publicField: "project_stage_floor_area_ratio_pct_public",
    textDependent: true,
  },
  {
    field_id: "building_coverage_ratio_pct",
    label: "건폐율",
    valueField: "building_coverage_ratio_pct_official",
    sourceHint: "고시문 건축계획/사업개요",
    textDependent: true,
  },
  {
    field_id: "max_height_m",
    label: "최고높이",
    valueField: "max_height_m_official",
    sourceHint: "고시문 높이/층수 계획",
    textDependent: true,
  },
  {
    field_id: "floors",
    label: "층수",
    valueField: "floors_official",
    sourceHint: "고시문 높이/층수 계획",
    textDependent: true,
  },
  {
    field_id: "project_approval_date",
    label: "사업시행인가일",
    valueField: "project_approval_date_public",
    sourceHint: "정보몽땅 사업시행계획서 공개항목",
    textDependent: false,
    minStageOrder: 5,
  },
  {
    field_id: "management_approval_date",
    label: "관리처분인가일",
    valueField: "management_approval_date_public",
    sourceHint: "정보몽땅 관리처분계획서 공개항목",
    textDependent: false,
    minStageOrder: 6,
  },
  {
    field_id: "union_approval_date",
    label: "조합설립인가일",
    valueField: "union_approval_date_public",
    sourceHint: "정보몽땅 조합설립인가 공개항목",
    textDependent: false,
    minStageOrder: 4,
  },
  {
    field_id: "promotion_committee_approval_date",
    label: "추진위원회 승인일",
    valueField: "promotion_committee_approval_date_public",
    sourceHint: "정보몽땅 추진위원회 승인 공개항목",
    textDependent: false,
    minStageOrder: 3,
  },
  {
    field_id: "management_construction_cost",
    label: "관리처분 공사비",
    valueField: "management_construction_cost_public",
    sourceHint: "정보몽땅 관리처분 공개항목",
    textDependent: false,
    minStageOrder: 6,
  },
  {
    field_id: "stage_consent_rate_pct",
    label: "단계 공개 동의율",
    valueField: "stage_consent_rate_pct_public",
    sourceHint: "정보몽땅 조합설립/추진위 공개항목",
    textDependent: false,
    minStageOrder: 3,
  },
];

const STATUS_WEIGHT = {
  conflict_needs_resolution: 700,
  ocr_review_required: 650,
  ocr_source_value_update_required: 640,
  ocr_partial_confirmation_pending: 630,
  source_value_fill_missing_required: 625,
  source_link_required: 600,
  management_stage_followup_needed: 520,
  value_missing: 500,
  source_definition_split_required: 430,
  source_date_split_required: 420,
  confirmed_from_ocr_image: 340,
  fact_check_report_available: 350,
  resolved_by_management_stage_report: 330,
  confirmed_from_original_notice: 320,
  partial_original_notice_confirmation: 310,
  official_stage_date_confirmed: 305,
  original_notice_context_available: 270,
  auxiliary_notice_context_only: 240,
  structured_value_needs_manual_confirmation: 250,
  snippet_candidate_needs_manual_confirmation: 200,
  no_source_text: 150,
  not_yet_applicable: 20,
};

const IMMEDIATE_REVIEW_STATUSES = [
  "conflict_needs_resolution",
  "management_stage_followup_needed",
  "source_definition_split_required",
  "ocr_source_value_update_required",
  "ocr_partial_confirmation_pending",
  "source_value_fill_missing_required",
  "ocr_review_required",
  "source_link_required",
  "value_missing",
];

const RISK_WEIGHT = {
  very_high: 40,
  high: 25,
  medium: 10,
  watch: 0,
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
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function optionalJson(file) {
  try {
    return await readJson(file);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function byRank(rows, rankField = "rank") {
  return Object.fromEntries(rows.map((row) => [String(row[rankField] || ""), row]).filter(([rank]) => rank));
}

function groupByRank(rows, rankField = "rank") {
  return rows.reduce((acc, row) => {
    const rank = String(row[rankField] || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function includesAny(text, values) {
  return values.some((value) => String(text || "").includes(value));
}

function normalizedValue(value) {
  return String(value ?? "").trim();
}

function comparableOcrValue(value) {
  return normalizedValue(value)
    .replace(/[,%㎡m천원원층대세호]/g, "")
    .replace(/\s+/g, "")
    .replace(/,+/g, "");
}

function isIncompleteValue(value, field) {
  const text = normalizedValue(value);
  if (!text) return true;
  if (field.field_id === "floors" && !/\d/.test(text)) return true;
  if (["미확인", "N/A", "null", "undefined"].includes(text)) return true;
  return false;
}

function sourcePathFor(row, textRows) {
  if (row.text_path) return row.text_path;
  const firstText = textRows.find((item) => item.text_path);
  if (firstText) return firstText.text_path;
  if (row.local_notice_file) return row.local_notice_file;
  if (row.gwangjin_gu_notice_text_paths) return row.gwangjin_gu_notice_text_paths;
  return "";
}

function valueOverrideSourceLabel(row) {
  const parts = [row.value_override_source_notice_no, row.value_override_source_notice_date].filter(Boolean);
  if (parts.length) return parts.join(" / ");
  return row.value_override_status || "공식 보정값";
}

function fieldHasValueOverride(row, field) {
  if (!row?.value_override_status) return false;
  if (field.field_id === "notice_no") {
    return normalizedValue(row.notice_no) && normalizedValue(row.notice_no) === normalizedValue(row.value_override_source_notice_no);
  }
  if (field.field_id === "notice_date") {
    return normalizedValue(row.notice_date) && normalizedValue(row.notice_date) === normalizedValue(row.value_override_source_notice_date);
  }
  return String(row.value_override_fields || "").includes(`${field.valueField}=`);
}

function valueOverrideRule(row, field) {
  const rules = VALUE_OVERRIDE_LEDGER_RULES[row?.value_override_status] || null;
  if (!rules) return null;
  const key = field.field_id === "notice_no" || field.field_id === "notice_date" ? field.field_id : field.valueField;
  if (!rules[key] || !fieldHasValueOverride(row, field)) return null;
  return rules[key];
}

function applyValueOverrideStatus(status, row, field) {
  const rule = valueOverrideRule(row, field);
  if (!rule) return { ...status, value_override_applied: false };
  return {
    verification_status: rule.verification_status,
    next_value_action:
      rule.next_value_action || `${valueOverrideSourceLabel(row)} 공식 보정 근거와 대표값 판정 메모를 기준으로 현재값을 유지`,
    value_override_applied: true,
  };
}

function compactJoin(parts, delimiter = "; ") {
  return [...new Set(parts.map((part) => String(part || "").trim()).filter(Boolean))].join(delimiter);
}

function resolutionKey(rank, fieldId) {
  return `${String(rank)}:${fieldId}`;
}

function byResolutionField(rows) {
  return Object.fromEntries(rows.map((row) => [resolutionKey(row.rank, row.field_id), row]).filter(([key]) => key && !key.endsWith(":")));
}

function byOcrTriageField(rows) {
  const grouped = {};
  for (const row of rows) {
    const key = resolutionKey(row.rank, row.field_id);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }
  return Object.fromEntries(Object.entries(grouped).map(([key, items]) => [key, summarizeOcrTriage(items)]));
}

function byManualOcrDecisionField(rows) {
  return Object.fromEntries(rows.map((row) => [resolutionKey(row.rank, row.field_id), row]).filter(([key]) => key && !key.endsWith(":")));
}

function byCorroborationField(rows) {
  return Object.fromEntries(rows.map((row) => [resolutionKey(row.rank, row.field_id), row]).filter(([key]) => key && !key.endsWith(":")));
}

function byRepairCandidateField(rows) {
  return Object.fromEntries(rows.map((row) => [resolutionKey(row.rank, row.field_id), row]).filter(([key]) => key && !key.endsWith(":")));
}

function summarizeOcrTriage(items) {
  const statusWeight = {
    ocr_snippet_value_mismatch: 500,
    poor_ocr_direct_image_required: 450,
    manual_image_review_required: 400,
    image_confirmation_candidate: 300,
    ready_for_image_confirmation: 200,
  };
  const sorted = [...items].sort(
    (a, b) =>
      (statusWeight[b.review_status] || 0) - (statusWeight[a.review_status] || 0) ||
      Number(a.triage_rank || 999) - Number(b.triage_rank || 999),
  );
  const primary = sorted[0] || {};
  return {
    review_status: primary.review_status || "",
    confidence_bucket: primary.confidence_bucket || "",
    value_match_level: primary.value_match_level || "",
    packet_ranks: compactJoin(sorted.map((row) => row.packet_rank), "; "),
    triage_ranks: compactJoin(sorted.map((row) => row.triage_rank), "; "),
    alternate_ocr_numbers: compactJoin(sorted.map((row) => row.alternate_ocr_numbers), "; "),
    image_paths: compactJoin(sorted.map((row) => row.image_path), "; "),
    next_review_action: primary.next_review_action || "",
    source: "analysis/ocr-source-review-triage.md",
  };
}

function applyManagementResolutionOverride(status, resolutionRow) {
  if (!resolutionRow) return status;
  const baseAction = compactJoin([resolutionRow.recommended_recording, resolutionRow.next_source_to_check], " / ");
  if (["confirmed_match", "public_stage_date_confirmed", "public_stage_value_available"].includes(resolutionRow.resolution_status)) {
    return {
      verification_status: "resolved_by_management_stage_report",
      next_value_action: baseAction || "관리처분 단계 해소표 기준으로 확인 결과를 사업별 메모와 비교표에 유지",
    };
  }
  if (resolutionRow.resolution_status === "keep_values_by_source_date") {
    return {
      verification_status: "source_date_split_required",
      next_value_action: baseAction || "고시 시점 값과 사업시행/관리처분 값을 별도 열로 유지하고 최신 원문 확인",
    };
  }
  if (["public_stage_value_missing", "public_stage_date_missing"].includes(resolutionRow.resolution_status)) {
    return {
      verification_status: "management_stage_followup_needed",
      next_value_action: baseAction || "관리처분 별첨 또는 조합 공개표에서 값을 보강",
    };
  }
  return status;
}

function applyManualOcrDecisionOverride(status, decisionRow) {
  if (!decisionRow) return status;
  const recommended = decisionRow.recommended_verification_status || "";
  if (recommended === "confirmed_from_ocr_image" && status.verification_status === "ocr_review_required") {
    return {
      verification_status: "confirmed_from_ocr_image",
      next_value_action:
        decisionRow.recommended_value_action || "원문 이미지 수동 판독으로 장부 현재값을 확인했으므로 비교표 확정 주석에 반영",
    };
  }
  if (recommended === "ocr_source_value_update_required") {
    return {
      verification_status: "ocr_source_value_update_required",
      next_value_action:
        decisionRow.recommended_value_action || "원문 이미지 판독값과 장부 현재값의 정밀도 차이를 보정하고 재확인",
    };
  }
  if (recommended === "ocr_partial_confirmation_pending") {
    return {
      verification_status: "ocr_partial_confirmation_pending",
      next_value_action:
        decisionRow.recommended_value_action || "원문 이미지에서 확인된 구성요소와 미확인 구성요소를 나눠 2차 출처 확인",
    };
  }
  if (recommended === "source_value_fill_missing_required" && ["value_missing", "ocr_review_required"].includes(status.verification_status)) {
    return {
      verification_status: "source_value_fill_missing_required",
      next_value_action:
        decisionRow.recommended_value_action || "원문 이미지 판독값을 비교 매트릭스 보강 후보로 올리고 2차 출처 여부를 확인",
    };
  }
  if (recommended === "source_link_required" && status.verification_status === "ocr_review_required") {
    return {
      verification_status: "source_link_required",
      next_value_action:
        decisionRow.recommended_value_action || "현재 OCR 이미지가 장부값의 직접 근거가 아니므로 별도 고시/정비계획 원문을 연결",
    };
  }
  return status;
}

function closeAppliedManualOcrUpdate(status, decisionRow, currentValue) {
  if (!decisionRow) return status;
  if (status.verification_status !== "ocr_source_value_update_required") return status;
  if (decisionRow.manual_review_status !== "source_value_precision_mismatch") return status;
  if (!comparableOcrValue(decisionRow.source_value) || !comparableOcrValue(currentValue)) return status;
  if (comparableOcrValue(decisionRow.source_value) !== comparableOcrValue(currentValue)) return status;
  return {
    verification_status: "confirmed_from_ocr_image",
    next_value_action: "원문 이미지 판독값이 현재 비교표 값에 이미 반영돼 있어 confirmed 상태로 유지",
  };
}

function applyCorroborationOverride(status, corroborationRow) {
  if (!corroborationRow) return status;
  const action = corroborationRow.recommended_value_action || "송파권 원문 수치 확정성 판정표 기준으로 장부 상태를 유지";
  const reviewStatus = corroborationRow.review_status || "";
  if (["direct_original_notice_confirmed", "match_or_rounding"].includes(reviewStatus)) {
    return {
      verification_status: "confirmed_from_original_notice",
      next_value_action: action,
    };
  }
  if (reviewStatus === "fills_missing_matrix_value") {
    return {
      verification_status: "source_value_fill_missing_required",
      next_value_action: action,
    };
  }
  if (reviewStatus === "source_time_or_definition_conflict") {
    return {
      verification_status: "source_definition_split_required",
      next_value_action: action,
    };
  }
  if (reviewStatus === "partial_source_confirmation") {
    return {
      verification_status: "partial_original_notice_confirmation",
      next_value_action: action,
    };
  }
  if (reviewStatus === "direct_original_notice_context") {
    return {
      verification_status: "original_notice_context_available",
      next_value_action: action,
    };
  }
  if (reviewStatus === "ocr_context_needs_image_review") {
    return {
      verification_status: "ocr_partial_confirmation_pending",
      next_value_action: action,
    };
  }
  if (["auxiliary_plan_notice_connected", "district_plan_rule_only", "not_directly_confirmed_from_notice"].includes(reviewStatus)) {
    return {
      verification_status: "auxiliary_notice_context_only",
      next_value_action: action,
    };
  }
  return status;
}

function relatedTasksForField(tasks, field) {
  const fieldText = [field.field_id, field.label, field.sourceHint].join(" ");
  return tasks.filter((task) => {
    const target = `${task.task_type} ${task.task_title} ${task.fields_to_verify} ${task.why_now}`;
    if (task.task_type === "resolve_stage_value_conflict" && includesAny(fieldText, ["인가일", "세대수", "용적률", "공사비"])) return true;
    if (task.task_type === "verify_ocr_numbers" && field.textDependent) return true;
    if (task.task_type === "connect_recordcode_original_notice" && includesAny(fieldText, ["고시", "면적"])) return true;
    if (task.task_type === "fill_missing_core_fields" && task.fields_to_verify?.includes(field.field_id.replace(/_sqm|_pct|_m/g, ""))) return true;
    if (task.task_type === "promote_snippets_to_confirmed_values" && field.textDependent) return true;
    if (task.task_type === "crosscheck_cost_infrastructure" && includesAny(fieldText, ["면적", "용적률", "건폐율", "높이", "층수"])) return true;
    return false;
  });
}

function decideStatus({ matrixRow, evidence, risk, textRows, tasks, field, value }) {
  const riskFlags = evidence.risk_flags || "";
  const taskTypes = new Set(tasks.map((task) => task.task_type));
  const hasValue = !isIncompleteValue(value, field);
  const hasOcrText = textRows.some((row) => row.review_priority === "P1_ocr_verify");
  const hasSourceLinkTask = taskTypes.has("connect_recordcode_original_notice");
  const hasConflictTask = taskTypes.has("resolve_stage_value_conflict");
  const hasSnippet = field.snippetFlag ? matrixRow[field.snippetFlag] === "Y" : false;
  const hasStageDateOverride = matrixRow.stage_date_override_fields?.includes(`${field.valueField}=`);

  if (!hasValue) {
    if (field.minStageOrder && Number(matrixRow.stage_order || 0) < field.minStageOrder) {
      return {
        verification_status: "not_yet_applicable",
        next_value_action: "현재 진행단계에서는 아직 필수 비교값이 아니므로 단계 변경 시 재확인",
      };
    }
    return {
      verification_status: "value_missing",
      next_value_action: "공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록",
    };
  }

  if (hasStageDateOverride) {
    return {
      verification_status: "official_stage_date_confirmed",
      next_value_action: "공식 단계 출처에서 확인된 단계일자를 비교표와 사업별 메모에 반영",
    };
  }

  if (hasConflictTask && includesAny(`${field.field_id} ${field.label}`, ["approval", "인가", "households", "세대", "far", "용적률", "construction", "공사비"])) {
    return {
      verification_status: "conflict_needs_resolution",
      next_value_action: "사업시행/관리처분 공개항목과 고시문 기준시점을 나눠 값의 적용 시점을 확정",
    };
  }

  if (hasOcrText && field.textDependent) {
    return {
      verification_status: "ocr_review_required",
      next_value_action: "OCR 텍스트의 숫자·단위를 원문 이미지와 대조한 뒤 confirmed/pending/conflict 중 하나로 표시",
    };
  }

  if (hasSourceLinkTask && includesAny(`${field.field_id} ${field.label}`, ["notice", "고시", "area", "면적"])) {
    return {
      verification_status: "source_link_required",
      next_value_action: "recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정",
    };
  }

  if (matrixRow.fact_check_priority === "original_notice_fact_checked" || evidence.next_evidence_action?.includes("fact-check")) {
    return {
      verification_status: "fact_check_report_available",
      next_value_action: "기존 fact-check 문서의 원문 대조 결과를 비교표 확정 수치로 승격할지 검토",
    };
  }

  if (field.textDependent && hasSnippet) {
    return {
      verification_status: "snippet_candidate_needs_manual_confirmation",
      next_value_action: "자동 추출 스니펫 주변 문맥을 읽고 확정 수치 여부를 표시",
    };
  }

  if (field.textDependent && matrixRow.text_coverage === "no_notice_text") {
    return {
      verification_status: "no_source_text",
      next_value_action: "원문 텍스트 또는 자치구 원문 연결을 먼저 확보",
    };
  }

  return {
    verification_status: "structured_value_needs_manual_confirmation",
    next_value_action: "구조화 값의 원천과 기준일을 확인하고 사업별 메모에 확정/보류 상태를 기록",
  };
}

function pickPriorityTask(status, tasks) {
  const preferredByStatus = {
    conflict_needs_resolution: "resolve_stage_value_conflict",
    source_date_split_required: "resolve_stage_value_conflict",
    management_stage_followup_needed: "resolve_stage_value_conflict",
    ocr_review_required: "verify_ocr_numbers",
    ocr_partial_confirmation_pending: "verify_ocr_numbers",
    source_link_required: "connect_recordcode_original_notice",
    source_definition_split_required: "crosscheck_cost_infrastructure",
    value_missing: "fill_missing_core_fields",
    no_source_text: "connect_recordcode_original_notice",
    snippet_candidate_needs_manual_confirmation: "promote_snippets_to_confirmed_values",
  };
  const preferredType = preferredByStatus[status];
  if (preferredType) {
    const preferred = tasks.find((task) => task.task_type === preferredType);
    if (preferred) return preferred;
  }
  return tasks.find((task) => ["P0", "P1"].includes(task.priority)) || tasks[0];
}

function sourceBasis(row, field, textRows) {
  if (valueOverrideRule(row, field)) return `${valueOverrideSourceLabel(row)} 공식 보정값`;
  if (row.stage_date_override_fields?.includes(`${field.valueField}=`)) return row.stage_date_override_source || "공식 사업별 페이지";
  if (field.publicField && row[field.publicField]) return "정보몽땅 단계 공개항목";
  if (field.valueField?.includes("_official") && row[field.valueField]) return "비교 매트릭스 공식 수치";
  if (field.valueField?.includes("_public") && row[field.valueField]) return "정보몽땅 공개항목";
  if (field.evidenceField && row[field.valueField]) return "고시 상세 구조화 필드";
  if (textRows.length) return "원문 텍스트 추출 결과";
  return field.sourceHint;
}

function buildLedger({
  matrixRows,
  evidenceByRank,
  textByRank,
  riskByRank,
  tasksByRank,
  managementResolutionByField,
  ocrTriageByField,
  manualOcrDecisionByField,
  corroborationByField,
  repairCandidateByField,
}) {
  const rows = [];
  for (const matrixRow of matrixRows) {
    const rank = String(matrixRow.rank);
    const evidence = evidenceByRank[rank] || {};
    const textRows = textByRank[rank] || [];
    const risk = riskByRank[rank] || {};
    const projectTasks = tasksByRank[rank] || [];
    for (const field of CORE_FIELDS) {
      const value = normalizedValue(matrixRow[field.valueField]);
      const relatedTasks = relatedTasksForField(projectTasks, field);
      const resolutionRow = managementResolutionByField[resolutionKey(rank, field.field_id)];
      const ocrTriage = ocrTriageByField[resolutionKey(rank, field.field_id)];
      const manualOcrDecision = manualOcrDecisionByField[resolutionKey(rank, field.field_id)];
      const corroboration = corroborationByField[resolutionKey(rank, field.field_id)];
      const repairCandidate = repairCandidateByField[resolutionKey(rank, field.field_id)];
      const repairCandidateIsUseful =
        repairCandidate &&
        repairCandidate.candidate_status === "direct_value_match" &&
        repairCandidate.candidate_match_level === "exact";
      const statusBeforeManualOcr = applyManagementResolutionOverride(
        decideStatus({ matrixRow, evidence, risk, textRows, tasks: relatedTasks, field, value }),
        resolutionRow,
      );
      const statusBeforeValueOverride = applyManualOcrDecisionOverride(statusBeforeManualOcr, manualOcrDecision);
      const statusAfterAppliedOcr = closeAppliedManualOcrUpdate(statusBeforeValueOverride, manualOcrDecision, value);
      const valueOverrideStatus = applyValueOverrideStatus(statusAfterAppliedOcr, matrixRow, field);
      const { value_override_applied: valueOverrideApplied, ...statusBeforeCorroboration } = valueOverrideStatus;
      const status = applyCorroborationOverride(statusBeforeCorroboration, corroboration);
      const hasOcrContext =
        !valueOverrideApplied &&
        (status.verification_status === "ocr_review_required" ||
          [
            "confirmed_from_ocr_image",
            "ocr_source_value_update_required",
            "ocr_partial_confirmation_pending",
            "source_value_fill_missing_required",
            "source_link_required",
          ].includes(status.verification_status));
      const nextValueAction =
        valueOverrideApplied
          ? status.next_value_action
          : statusBeforeManualOcr.verification_status === "ocr_review_required" && manualOcrDecision?.recommended_value_action
          ? manualOcrDecision.recommended_value_action
          : status.verification_status === "ocr_review_required" && ocrTriage?.next_review_action
          ? ocrTriage.next_review_action
          : status.next_value_action;
      const priorityTask = pickPriorityTask(status.verification_status, relatedTasks);
      const sortScore =
        (STATUS_WEIGHT[status.verification_status] || 0) +
        (RISK_WEIGHT[risk.risk_signal_level] || 0) +
        (priorityTask?.priority === "P0" ? 30 : priorityTask?.priority === "P1" ? 15 : 0);

      rows.push({
        rank,
        focus_area: matrixRow.focus_area,
        district: matrixRow.district,
        project_name: matrixRow.project_name,
        current_stage: matrixRow.current_stage,
        risk_signal_level: risk.risk_signal_level || "",
        evidence_grade: evidence.evidence_grade || "",
        field_id: field.field_id,
        field_label: field.label,
        current_value: value,
        value_source_basis: sourceBasis(matrixRow, field, textRows),
        verification_status: status.verification_status,
        songpa_notice_review_status: corroboration?.review_status || "",
        songpa_notice_action_group: corroboration?.action_group || "",
        songpa_notice_source_value: corroboration?.source_value || "",
        songpa_notice_confidence: corroboration?.confidence || "",
        songpa_notice_recommended_action: corroboration?.recommended_value_action || "",
        songpa_notice_evidence_basis: corroboration?.evidence_basis || "",
        management_resolution_status: resolutionRow?.resolution_status || "",
        management_recommended_recording: resolutionRow?.recommended_recording || "",
        management_next_source_to_check: resolutionRow?.next_source_to_check || "",
        ocr_review_status: hasOcrContext ? ocrTriage?.review_status || "" : "",
        ocr_confidence_bucket: hasOcrContext ? ocrTriage?.confidence_bucket || "" : "",
        ocr_value_match_level: hasOcrContext ? ocrTriage?.value_match_level || "" : "",
        ocr_packet_ranks: hasOcrContext ? ocrTriage?.packet_ranks || "" : "",
        ocr_triage_ranks: hasOcrContext ? ocrTriage?.triage_ranks || "" : "",
        ocr_alternate_numbers: hasOcrContext ? ocrTriage?.alternate_ocr_numbers || "" : "",
        ocr_image_paths: hasOcrContext ? ocrTriage?.image_paths || "" : "",
        manual_ocr_review_status: hasOcrContext ? manualOcrDecision?.manual_review_status || "" : "",
        manual_ocr_source_value: hasOcrContext ? manualOcrDecision?.source_value || "" : "",
        manual_ocr_confirmed_components: hasOcrContext ? manualOcrDecision?.confirmed_components || "" : "",
        manual_ocr_unconfirmed_components: hasOcrContext ? manualOcrDecision?.unconfirmed_components || "" : "",
        manual_ocr_decision_note: hasOcrContext ? manualOcrDecision?.decision_note || "" : "",
        next_value_action: nextValueAction,
        related_task_priority: priorityTask?.priority || "",
        related_task_type: priorityTask?.task_type || "",
        related_queue_rank: priorityTask?.queue_rank || "",
        text_extraction_methods: textRows.map((row) => row.extraction_method).filter(Boolean).join("; "),
        source_to_open: compactJoin([
          valueOverrideApplied ? matrixRow.value_override_review : "",
          valueOverrideApplied ? matrixRow.value_override_source_text : "",
          resolutionRow ? "analysis/management-stage-value-resolution.md" : "",
          resolutionRow?.fact_check_source,
          corroboration ? "analysis/songpa-notice-value-corroboration.md" : "",
          hasOcrContext && manualOcrDecision ? "analysis/ocr-image-review-decisions.md" : "",
          hasOcrContext && ocrTriage ? ocrTriage.source : "",
          hasOcrContext ? ocrTriage?.image_paths : "",
          repairCandidateIsUseful ? "analysis/source-link-repair-candidates.md" : "",
          repairCandidateIsUseful ? repairCandidate.candidate_source_path : "",
          repairCandidateIsUseful ? repairCandidate.candidate_source_url : "",
          sourcePathFor(matrixRow, textRows),
        ]),
        source_link_candidate_status: repairCandidate?.candidate_status || "",
        source_link_candidate_source: repairCandidate?.candidate_source_label || "",
        source_link_candidate_value: repairCandidate?.candidate_value || "",
        source_link_candidate_match: repairCandidate?.candidate_match_level || "",
        source_link_candidate_url: repairCandidate?.candidate_source_url || "",
        source_link_candidate_path: repairCandidate?.candidate_source_path || "",
        source_link_candidate_note: repairCandidate?.candidate_note || "",
        interim_official_corroboration:
          repairCandidateIsUseful && ["source_link_required", "no_source_text"].includes(status.verification_status)
            ? "official_summary_exact_match_pending_original_notice"
            : "",
        project_note: matrixRow.project_note,
        sort_score: sortScore,
      });
    }
  }
  return rows
    .sort((a, b) => b.sort_score - a.sort_score || Number(a.rank) - Number(b.rank) || a.field_id.localeCompare(b.field_id))
    .map((row, index) => {
      const { sort_score, ...rest } = row;
      return { ledger_rank: index + 1, ...rest };
    });
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
  const immediateRows = rows.filter((row) => IMMEDIATE_REVIEW_STATUSES.includes(row.verification_status));
  const interimCorroboratedRows = rows.filter((row) => row.interim_official_corroboration);
  const topRows = rows.slice(0, 50);
  return `# 핵심 수치 확인 장부

작성 기준: ${kstDate()} KST

이 문서는 후보 30개의 핵심 비교 수치를 필드 단위로 펼쳐 현재 값의 확인 상태를 기록한 장부다. 값 자체를 새로 확정하지 않고, 비교 매트릭스에 들어간 수치가 원문 기준으로 어떤 검수 단계에 있는지 구분한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 필드 행 | ${rows.length} |
| 후보 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 즉시 검수 필요 | ${immediateRows.length} |
| 공란 필드 | ${rows.filter((row) => row.verification_status === "value_missing").length} |
| 단계상 아직 적용 전 | ${rows.filter((row) => row.verification_status === "not_yet_applicable").length} |
| OCR 검수 필요 | ${rows.filter((row) => row.verification_status === "ocr_review_required").length} |
| 시점 충돌 정리 필요 | ${rows.filter((row) => row.verification_status === "conflict_needs_resolution").length} |
| 관리처분 해소표로 해소 | ${rows.filter((row) => row.verification_status === "resolved_by_management_stage_report").length} |
| 시점별 값 분리 유지 | ${rows.filter((row) => row.verification_status === "source_date_split_required").length} |
| 관리처분 후속 보강 | ${rows.filter((row) => row.verification_status === "management_stage_followup_needed").length} |
| OCR 원문값 보정 필요 | ${rows.filter((row) => row.verification_status === "ocr_source_value_update_required").length} |
| OCR 부분확정/2차출처 필요 | ${rows.filter((row) => row.verification_status === "ocr_partial_confirmation_pending").length} |
| 원문 이미지 기반 공란 보강 필요 | ${rows.filter((row) => row.verification_status === "source_value_fill_missing_required").length} |
| 원문 이미지로 확인 | ${rows.filter((row) => row.verification_status === "confirmed_from_ocr_image").length} |
| 송파 원문 직접확정 | ${rows.filter((row) => row.verification_status === "confirmed_from_original_notice").length} |
| 공식 사업별 페이지 단계일자 확인 | ${rows.filter((row) => row.verification_status === "official_stage_date_confirmed").length} |
| 송파 원문 보조근거 | ${rows.filter((row) => row.verification_status === "auxiliary_notice_context_only").length} |
| 송파 원문 정의/시점 분리 필요 | ${rows.filter((row) => row.verification_status === "source_definition_split_required").length} |
| 원문 링크 병목 중 공식 보조근거 직접 일치 | ${interimCorroboratedRows.length} |
| OCR 값 불일치 후보 | ${rows.filter((row) => row.ocr_review_status === "ocr_snippet_value_mismatch").length} |
| OCR 직접 이미지 확인 | ${rows.filter((row) => ["manual_image_review_required", "poor_ocr_direct_image_required"].includes(row.ocr_review_status)).length} |
| OCR 이미지 확인 후보 | ${rows.filter((row) => ["ready_for_image_confirmation", "image_confirmation_candidate"].includes(row.ocr_review_status)).length} |

## 상태별

${mdTable(countBy(rows, "verification_status"), [
  { key: "name", label: "확인 상태" },
  { key: "count", label: "필드 수" },
])}

## 필드별

${mdTable(countBy(rows, "field_label"), [
  { key: "name", label: "필드" },
  { key: "count", label: "행 수" },
])}

## OCR 트리아지별

${mdTable(countBy(rows.filter((row) => row.ocr_review_status), "ocr_review_status"), [
  { key: "name", label: "OCR 검수 상태" },
  { key: "count", label: "필드 수" },
])}

## 원문 링크 보조근거

${mdTable(interimCorroboratedRows.slice(0, 60), [
  { key: "ledger_rank", label: "장부" },
  { key: "verification_status", label: "상태" },
  { key: "related_task_priority", label: "큐" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "source_link_candidate_source", label: "보조근거" },
  { key: "source_link_candidate_value", label: "보조근거 값" },
  { key: "source_link_candidate_match", label: "일치" },
  { key: "source_link_candidate_note", label: "메모" },
])}

## 상위 확인 대상

${mdTable(topRows, [
  { key: "ledger_rank", label: "장부" },
  { key: "verification_status", label: "상태" },
  { key: "risk_signal_level", label: "리스크" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "ocr_review_status", label: "OCR 상태" },
  { key: "ocr_alternate_numbers", label: "OCR 대체값" },
  { key: "manual_ocr_review_status", label: "수동 OCR" },
  { key: "manual_ocr_source_value", label: "이미지 원문값" },
  { key: "interim_official_corroboration", label: "보조근거" },
  { key: "next_value_action", label: "다음 확인" },
])}

## 즉시 검수 필요

${mdTable(immediateRows.slice(0, 80), [
  { key: "ledger_rank", label: "장부" },
  { key: "verification_status", label: "상태" },
  { key: "related_task_priority", label: "큐" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "ocr_review_status", label: "OCR 상태" },
  { key: "ocr_alternate_numbers", label: "OCR 대체값" },
  { key: "manual_ocr_review_status", label: "수동 OCR" },
  { key: "manual_ocr_source_value", label: "이미지 원문값" },
  { key: "interim_official_corroboration", label: "보조근거" },
  { key: "source_to_open", label: "열어볼 원문/파일" },
])}

## 사용법

1. \`conflict_needs_resolution\`, \`management_stage_followup_needed\`, \`source_definition_split_required\`, \`ocr_source_value_update_required\`, \`ocr_partial_confirmation_pending\`, \`source_value_fill_missing_required\`, \`ocr_review_required\`, \`source_link_required\`, \`value_missing\` 순으로 처리한다.
2. \`resolved_by_management_stage_report\`는 \`analysis/management-stage-value-resolution.md\`의 해소 근거를 사업별 메모와 비교표에 반영한다.
3. \`source_date_split_required\`는 고시 시점 값과 사업시행/관리처분 단계 값을 별도 열로 유지한다.
4. \`ocr_review_required\`는 \`ocr_review_status\`를 보고 \`ocr_snippet_value_mismatch\`와 직접 이미지 확인 항목을 먼저 분리한다.
5. \`confirmed_from_ocr_image\`, \`ocr_source_value_update_required\`, \`ocr_partial_confirmation_pending\`, \`source_value_fill_missing_required\`는 \`analysis/ocr-image-review-decisions.md\`의 수동 이미지 판독 결과를 반영한다.
6. \`confirmed_from_original_notice\`, \`source_definition_split_required\`, \`auxiliary_notice_context_only\`는 \`analysis/songpa-notice-value-corroboration.md\`의 사업별 원문 확정성 판정을 먼저 읽는다.
7. 처리 후 사업별 메모와 비교 매트릭스에 \`confirmed\`, \`pending\`, \`conflict\` 같은 상태 메모를 남긴다.
8. \`fact_check_report_available\`은 이미 별도 fact-check 문서가 있으므로 그 문서를 읽어 확정 수치 승격 여부를 결정한다.
9. \`official_summary_exact_match_pending_original_notice\`는 정보몽땅 사업개요 같은 공식 보조근거가 현재값과 일치한다는 뜻이다. 본고시 원문 연결이 필요한 상태 자체는 유지한다.
10. 이 장부는 자동 상태 분류이므로, 최종 확정은 원문 이미지/PDF/HWP와 문맥 대조 후 한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [
    matrixRows,
    evidenceRows,
    textRows,
    riskRows,
    queueRows,
    managementResolutionRows,
    ocrTriageRows,
    manualOcrDecisionRows,
    corroborationRows,
    repairCandidateRows,
  ] = await Promise.all([
    readJson(MATRIX_INPUT),
    readJson(EVIDENCE_INPUT),
    readJson(TEXT_AUDIT_INPUT),
    readJson(RISK_INPUT),
    readJson(VALUE_QUEUE_INPUT),
    optionalJson(MANAGEMENT_VALUE_RESOLUTION_INPUT),
    optionalJson(OCR_REVIEW_TRIAGE_INPUT),
    optionalJson(OCR_IMAGE_REVIEW_DECISIONS_INPUT),
    optionalJson(SONGPA_NOTICE_VALUE_CORROBORATION_INPUT),
    optionalJson(SOURCE_LINK_REPAIR_CANDIDATES_INPUT),
  ]);
  const rows = buildLedger({
    matrixRows,
    evidenceByRank: byRank(evidenceRows),
    textByRank: groupByRank(textRows),
    riskByRank: byRank(riskRows),
    tasksByRank: groupByRank(queueRows),
    managementResolutionByField: byResolutionField(managementResolutionRows),
    ocrTriageByField: byOcrTriageField(ocrTriageRows),
    manualOcrDecisionByField: byManualOcrDecisionField(manualOcrDecisionRows),
    corroborationByField: byCorroborationField(corroborationRows),
    repairCandidateByField: byRepairCandidateField(repairCandidateRows),
  });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(JSON.stringify({
    rows: rows.length,
    projects: new Set(rows.map((row) => row.rank)).size,
    immediate_review: rows.filter((row) => IMMEDIATE_REVIEW_STATUSES.includes(row.verification_status)).length,
    interim_official_corroboration: rows.filter((row) => row.interim_official_corroboration).length,
    output: "analysis/core-value-confirmation-ledger.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
