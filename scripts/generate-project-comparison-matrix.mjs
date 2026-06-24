#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CANDIDATES_INPUT = "analysis/priority-redevelopment-candidates.csv";
const SUMMARIES_INPUT = "data/cleanup/project-summaries-priority-candidates.json";
const URBAN_DETAILS_INPUT = "data/urban/urban-map-details-priority-candidates.json";
const NOTICE_DETAILS_INPUT = "data/urban/urban-notice-details-priority-candidates.json";
const NOTICE_ATTACHMENTS_INPUT = "data/urban/urban-notice-attachments-priority-candidates.csv";
const TEXT_MANIFEST_INPUT = "data/urban/text/notice-text-manifest.csv";
const KEY_FIELDS_INPUT = "data/urban/text/notice-key-fields.csv";
const MARKET_INPUT = "data/market/project-market-areas.json";
const REPRESENTATIVE_LOT_INPUT = "data/urban/representative-lot-map-candidates.csv";
const BUSINESS_LAYER_INPUT = "data/urban/map-missing-business-layer-details.json";
const BUSINESS_NOTICE_INPUT = "data/urban/business-layer-notice-candidates.json";
const BUSINESS_NOTICE_ATTACHMENTS_INPUT = "data/urban/business-layer-notice-attachments.csv";
const MANAGEMENT_STAGE_DOCS_INPUT = "data/cleanup/management-stage-doc-links.json";
const GWANGJIN_STAGE_DOCS_INPUT = "data/cleanup/gwangjin-stage-public-docs.json";
const GWANGJIN_GU_NOTICE_INPUT = "data/urban/gwangjin-gu-notice-candidates.json";
const GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT = "data/urban/gwangjin-gu-notice-attachments.csv";
const GWANGJIN_GU_TEXT_MANIFEST_INPUT = "data/urban/text/gwangjin-gu-notice-text-manifest.csv";
const GWANGJIN_GU_KEY_FIELDS_INPUT = "data/urban/text/gwangjin-gu-notice-key-fields.csv";
const HANYANGGARO_GWANGJIN_SOURCE_PAGES_INPUT = "data/urban/gwangjin-gu-hanyanggaro-source-pages.json";
const GANGNAM_SONGPA_NOTICE_INPUT = "data/urban/gangnam-songpa-notice-candidates.json";
const GANGNAM_SONGPA_NOTICE_ATTACHMENTS_INPUT = "data/urban/gangnam-songpa-notice-attachments.csv";
const SEOUL_SIBO_ORIGINAL_NOTICE_INPUT = "data/urban/seoul-sibo-original-notice-sources.json";
const OCR_IMAGE_REVIEW_DECISIONS_INPUT = "data/review/ocr-image-review-decisions.json";
const SOURCE_VALUE_UPDATE_CANDIDATES_INPUT = "analysis/source-value-update-candidates.json";
const VALUE_OVERRIDES_INPUT = "data/review/project-comparison-value-overrides.json";
const STAGE_DATE_OVERRIDES_INPUT = "data/review/stage-date-overrides.json";
const REPRESENTATIVE_LOT_FALLBACK_FINDINGS_INPUT = "data/review/representative-lot-fallback-browser-findings.json";
const OUT_DIR = "analysis";

const STAGE_ORDER = {
  "정비계획 수립": 1,
  안전진단: 1,
  "정비구역지정": 2,
  추진위원회승인: 3,
  조합설립인가: 4,
  사업시행인가: 5,
  관리처분인가: 6,
  착공: 7,
  분양: 8,
};

const STAGE_BUCKET = {
  1: "계획/구역 전",
  2: "구역 확정",
  3: "조합 전",
  4: "조합 이후",
  5: "사업시행 이후",
  6: "이주/관리처분",
  7: "시공",
  8: "공급",
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank), row]));
}

function attachmentsByRank(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
}

function rowsByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function latestRowsByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    const current = acc[rank];
    if (!current || String(row.checked_at || "").localeCompare(String(current.checked_at || "")) >= 0) {
      acc[rank] = row;
    }
    return acc;
  }, {});
}

function bestRepresentativeBusinessLayerCandidate(rows) {
  return [...rows]
    .filter(
      (row) =>
        row.layer_name === "UPIS_C_UQ120" &&
        String(row.generic_zone || "").toUpperCase() !== "Y" &&
        Number(row.matched_token_count || 0) > 0,
    )
    .sort((left, right) => {
      const leftRank = Number(left.recommendation_rank || 9999);
      const rightRank = Number(right.recommendation_rank || 9999);
      if (leftRank !== rightRank) return leftRank - rightRank;
      return Number(right.layer_score || 0) - Number(left.layer_score || 0);
    })[0];
}

function representativeLotBusinessLayerFallback(rows, candidate) {
  const selected = bestRepresentativeBusinessLayerCandidate(rows);
  if (!selected) return null;
  return {
    match_status: "representative_lot_business_layer_fallback",
    match_confidence: selected.confidence || (Number(selected.matched_token_count || 0) >= 2 ? "medium" : "low"),
    present_sn: "",
    layer_zone_name: selected.zone_name || "",
    layer_area_sqm: "",
    urban_propel_name: selected.current_stage || candidate.current_stage || "",
    urban_business_type: candidate.project_type || "",
    urban_data_reference_date: "",
    cleanup_site_url: "",
    representative_record_code: selected.record_code || "",
    representative_notice_code: selected.notice_code || "",
    representative_map_url: selected.recommended_map_url || "",
    representative_layer_name: selected.layer_name || "",
  };
}

function manualConfirmedRepresentativeLotBusinessLayer(finding, candidate, representativeLotCandidates) {
  if (!finding?.checked_at || finding.check_status !== "confirmed_current_business") return null;
  const selected = bestRepresentativeBusinessLayerCandidate(representativeLotCandidates);
  const decisionNote = String(finding.decision_note || "").trim();
  const evidenceUrl = String(finding.evidence_url || "").trim();
  return {
    match_status: "manual_confirmed_current_business",
    match_confidence: "manual_verified",
    present_sn: finding.present_sn || "",
    layer_zone_name: finding.verified_zone_name || selected?.zone_name || candidate.project_name || "",
    layer_area_sqm: "",
    urban_business_name: finding.verified_zone_name || selected?.zone_name || candidate.project_name || "",
    urban_business_type_group: "정비사업",
    urban_propel_name: candidate.current_stage || "",
    urban_business_type: finding.urban_business_type || candidate.project_type || "",
    urban_data_reference_date: finding.urban_data_reference_date || "",
    cleanup_site_url: finding.cleanup_site_url || "",
    representative_record_code: selected?.record_code || "",
    representative_notice_code: selected?.notice_code || "",
    representative_map_url: selected?.recommended_map_url || "",
    representative_layer_name: selected?.layer_name || "UPIS_C_UQ120",
    review_note: [
      `${finding.checked_at} Edge/UQ120 수동 확인`,
      decisionNote,
      evidenceUrl ? `근거 URL ${evidenceUrl}` : "",
    ]
      .filter(Boolean)
      .join(" / "),
    next_action: "current business presentSn는 반영했고, direct 고시·recordCode 원문 보강은 계속 유지",
  };
}

function normalizeCompactNoticeNo(value) {
  const text = String(value || "").replace(/\s+/g, "");
  const match = text.match(/(\d{4})-(\d+)/);
  return match ? `${match[1]}-${match[2]}` : "";
}

function hanyanggaroSourceNoticeNo(row) {
  const byId = {
    "6031295": "2023-4",
    "6171163": "2023-1215",
    "6186353": "2023-115",
    "6209808": "2024-372",
    "6213254": "2024-449",
  };
  return byId[String(row.id || "")] || normalizeCompactNoticeNo(row.notice_no);
}

function fallbackGwangjinSourceRows(rows) {
  return rows
    .filter((row) => row.text_path)
    .map((row) => ({
      rank: "25",
      search_status: "candidate",
      match_confidence: "high",
      notice_title: row.label || row.title || "",
      notice_no: hanyanggaroSourceNoticeNo(row),
      notice_date: String(row.notice_date || "").trim(),
      local_html_path: row.html_path || "",
      official_url: row.url || "",
    }));
}

function fallbackGwangjinTextManifestRows(rows) {
  return rows
    .filter((row) => row.text_path)
    .map((row) => ({
      rank: "25",
      source_file: row.html_path || "",
      source_ext: "html",
      text_path: row.text_path,
      text_char_count: Number(row.text_char_count || 0),
      extraction_status: "extracted",
    }));
}

function summarizeManualOcrDecisions(rows) {
  if (!rows.length) {
    return {
      count: 0,
      statuses: "",
      fields: "",
      sourceValues: "",
      recommendedActions: "",
    };
  }
  return {
    count: rows.length,
    statuses: [...new Set(rows.map((row) => row.manual_review_status).filter(Boolean))].join("; "),
    fields: rows.map((row) => `${row.field_label || row.field_id}: ${row.current_value || ""} -> ${row.source_value || ""}`).join("; "),
    sourceValues: rows.map((row) => `${row.field_label || row.field_id}=${row.source_value || ""}`).join("; "),
    recommendedActions: rows.map((row) => row.recommended_value_action).filter(Boolean).join("; "),
  };
}

function summarizeSourceValueUpdates(rows) {
  if (!rows.length) {
    return {
      count: 0,
      statuses: "",
      fields: "",
      values: "",
      actions: "",
    };
  }
  return {
    count: rows.length,
    statuses: [...new Set(rows.map((row) => row.update_candidate_status).filter(Boolean))].join("; "),
    fields: rows.map((row) => `${row.field_label || row.field_id}: ${row.matrix_current_value || ""} -> ${row.recommended_display_value || ""}`).join("; "),
    values: rows.map((row) => `${row.field_label || row.field_id}=${row.recommended_structured_value || row.recommended_display_value || ""}`).join("; "),
    actions: rows.map((row) => row.update_action_type).filter(Boolean).join("; "),
  };
}

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function findStageDoc(rows, itemNo) {
  return rows.find((row) => String(row.item_no) === String(itemNo) && row.access_status === "public_table_extracted") || {};
}

function numberOrBlank(value) {
  const text = String(value ?? "").replaceAll(",", "").trim();
  if (!text) return "";
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

function stageOrder(stage) {
  return STAGE_ORDER[stage] || 0;
}

function stageBucket(stage) {
  return STAGE_BUCKET[stageOrder(stage)] || "미분류";
}

function normalizeProjectType(value) {
  const text = String(value || "");
  if (/신속통합기획/.test(text)) return "planning";
  if (/가로주택/.test(text)) return "street_housing";
  if (/소규모재건축/.test(text)) return "small_reconstruction";
  if (/재개발/.test(text)) return "redevelopment";
  if (/재건축/.test(text)) return "reconstruction";
  return text.trim().toLowerCase();
}

function normalizeStageFamily(value) {
  const text = String(value || "");
  if (/정비계획 수립/.test(text)) return "planning";
  if (/정비구역지정|구역지정/.test(text)) return "district_designation";
  if (/추진위원회승인|추진위구성/.test(text)) return "promotion_committee";
  if (/조합설립인가/.test(text)) return "union_approval";
  if (/사업시행인가/.test(text)) return "project_approval";
  if (/관리처분인가/.test(text)) return "management_approval";
  if (/착공/.test(text)) return "construction";
  if (/분양/.test(text)) return "sale";
  if (/기획완료/.test(text)) return "planning_complete";
  return text.trim().toLowerCase();
}

function businessLayerAlignment(candidate, businessLayer) {
  if (!businessLayer?.match_status) {
    return {
      status: "",
      note: "",
    };
  }

  if (businessLayer.match_status === "manual_confirmed_current_business") {
    const presentSnText = businessLayer.present_sn ? `presentSn ${businessLayer.present_sn}` : "presentSn";
    const referenceDateText = businessLayer.urban_data_reference_date
      ? `데이터 기준일 ${businessLayer.urban_data_reference_date}`
      : "데이터 기준일 미기록";
    return {
      status: "aligned_current_project",
      note: `Edge/UQ120 수동 확인으로 ${presentSnText}와 ${referenceDateText}을 current business 기준으로 확인했다. direct 고시/recordCode 보강은 별도 유지한다.`,
    };
  }

  if (businessLayer.match_status === "representative_lot_business_layer_fallback") {
    const stageText = businessLayer.urban_propel_name ? `후보 단계는 ${businessLayer.urban_propel_name}` : "후보 단계는 미확인";
    const layerText = businessLayer.representative_layer_name || "UPIS_C_UQ120";
    return {
      status: "representative_lot_fallback_only",
      note: `대표지번 매칭으로 같은 이름의 사업구역 후보는 보이지만 ${layerText} 후보에 presentSn·데이터 기준일이 없어 현재 사업 레이어로 확정할 수 없다. ${stageText}. direct notice를 현재 단계 기준으로 유지한다.`,
    };
  }

  const projectType = normalizeProjectType(candidate.project_type);
  const businessType = normalizeProjectType(businessLayer.urban_business_type);
  const currentStageFamily = normalizeStageFamily(candidate.current_stage);
  const businessStageFamily = normalizeStageFamily(businessLayer.urban_propel_name);
  const confidence = String(businessLayer.match_confidence || "");
  const hasCleanupUrl = Boolean(businessLayer.cleanup_site_url);

  if (businessType === "planning" && projectType !== "planning") {
    return {
      status: "planning_layer_possible",
      note: `사업 레이어 유형이 ${businessLayer.urban_business_type || "미확인"}, 단계가 ${businessLayer.urban_propel_name || "미확인"}로 현재 ${candidate.project_type || "사업"} ${candidate.current_stage || ""}와 다르다. 현재 사업이 아니라 신속통합기획/계획 레이어일 가능성을 먼저 확인한다.`,
    };
  }

  if (projectType && businessType && projectType !== businessType) {
    return {
      status: "type_mismatch",
      note: `사업 유형 ${candidate.project_type || "미확인"}와 사업 레이어 유형 ${businessLayer.urban_business_type || "미확인"}가 다르다. current business presentSn인지 다른 사업 레코드인지 재확인한다.`,
    };
  }

  if (currentStageFamily && businessStageFamily && currentStageFamily !== businessStageFamily) {
    const currentOrder = stageOrder(candidate.current_stage);
    const businessOrder = stageOrder(businessLayer.urban_propel_name);
    if (businessOrder > currentOrder) {
      return {
        status: "stage_ahead_of_matrix",
        note: `사업 레이어 단계(${businessLayer.urban_propel_name || "미확인"})가 비교표 현재 단계(${candidate.current_stage || "미확인"})보다 앞선다. 최신 공식 단계 반영인지, 현재 비교표가 늦은지 추가 확인이 필요하다.`,
      };
    }
    return {
      status: "stage_mismatch",
      note: `사업 레이어 단계(${businessLayer.urban_propel_name || "미확인"})와 비교표 현재 단계(${candidate.current_stage || "미확인"})가 다르다. 현재 사업 presentSn인지 단계 갱신 지연인지 확인한다.`,
    };
  }

  if (confidence === "low" && !hasCleanupUrl) {
    return {
      status: "aligned_but_low_confidence",
      note: "사업 유형과 단계는 맞지만 매칭 신뢰도가 낮고 정보몽땅 연결 URL이 없어 현재 사업 식별자로 쓰기 전에 추가 확인이 필요하다.",
    };
  }

  if (confidence === "medium" && !hasCleanupUrl) {
    return {
      status: "aligned_with_medium_confidence",
      note: "사업 유형과 단계는 맞지만 매칭 신뢰도가 medium이고 정보몽땅 연결 URL이 없다. current business presentSn으로는 유력하지만 direct 고시 또는 추가 공식 링크로 보강하는 편이 낫다.",
    };
  }

  return {
    status: "aligned_current_project",
    note: hasCleanupUrl
      ? "사업 유형·단계가 현재 사업과 맞고 정보몽땅 연결도 확인된다. direct 고시/recordCode가 없어도 현재 사업 식별자로는 사용 가능하다."
      : "사업 유형·단계는 현재 사업과 맞는다. direct 고시/recordCode 보강 전까지는 현재 사업 식별자로 보조 사용한다.",
  };
}

function applyManualFallbackReview(review, finding) {
  if (!finding?.checked_at) return review;
  const decisionNote = String(finding.decision_note || "").trim();
  const suffix = decisionNote ? ` ${decisionNote}` : "";

  if (finding.check_status === "confirmed_current_business") {
    return {
      status: "aligned_current_project",
      note: `${finding.checked_at} 수동 확인에서 current business presentSn를 확인했다.${suffix}`.trim(),
    };
  }
  if (finding.check_status === "stage_gap_hold") {
    return {
      status: "stage_ahead_of_matrix",
      note: `${finding.checked_at} 수동 확인: direct notice보다 앞 단계라 current business 식별자로 보류.${suffix}`.trim(),
    };
  }
  if (finding.check_status === "planning_layer_only") {
    return {
      status: "planning_layer_possible",
      note: `${finding.checked_at} 수동 확인: planning 계열 레이어만 보여 current business 식별자로 채택하지 않았다.${suffix}`.trim(),
    };
  }
  if (finding.check_status === "no_present_sn_found") {
    return {
      status: "representative_lot_fallback_only",
      note: `${finding.checked_at} 수동 확인에서 current business presentSn를 찾지 못했다.${suffix}`.trim(),
    };
  }
  if (finding.check_status === "ambiguous_candidate") {
    return {
      status: "representative_lot_fallback_only",
      note: `${finding.checked_at} 수동 확인 결과 후보가 복수이거나 모호해 current business 식별자로 확정하지 않았다.${suffix}`.trim(),
    };
  }
  if (finding.check_status === "candidate_rejected") {
    return {
      status: "representative_lot_fallback_only",
      note: `${finding.checked_at} 수동 확인 결과 대표지번 후보를 current business 식별자로 채택하지 않았다.${suffix}`.trim(),
    };
  }
  return review;
}

function textCoverage(status) {
  if (status === "extracted") return "text_extracted";
  if (status === "ocr_extracted") return "text_extracted";
  if (status === "hwp_ocr_extracted") return "text_extracted";
  if (status === "scanned_pdf_or_image_only") return "ocr_needed";
  if (status === "hwp_text_low_confidence") return "hwp_or_ocr_needed";
  if (status === "hwp_pending_external_conversion") return "hwp_conversion_needed";
  if (status) return status;
  return "no_notice_text";
}

function effectiveTextCoverage(primaryStatus, ...secondaryCoverages) {
  const primaryCoverage = textCoverage(primaryStatus);
  if (primaryCoverage === "no_notice_text" && secondaryCoverages.includes("text_extracted")) return "text_extracted";
  return primaryCoverage;
}

function guTextSummary(rows) {
  const extractedRows = rows.filter((row) => ["extracted", "ocr_extracted"].includes(row.extraction_status));
  return {
    hasText: extractedRows.length > 0,
    coverage: extractedRows.length > 0 ? "text_extracted" : rows.length ? "text_pending" : "no_gu_notice_text",
    textCount: extractedRows.length,
    ocrCount: extractedRows.filter((row) => row.extraction_status === "ocr_extracted").length,
    charCount: extractedRows.reduce((sum, row) => sum + Number(row.text_char_count || 0), 0),
    statuses: [...new Set(rows.map((row) => row.extraction_status).filter(Boolean))].join("; "),
    paths: extractedRows.map((row) => row.text_path).filter(Boolean).join("; "),
  };
}

function anySnippet(rows, field) {
  return rows.some((row) => row[field]);
}

function numericTextCharCount(row) {
  return Number.parseInt(String(row?.text_char_count || "0").replace(/[^0-9-]/g, ""), 10) || 0;
}

function selectTextManifest(rows, sourceFile, rank, preferredNoticeCodes = []) {
  if (sourceFile) return rows.find((row) => row.source_file === sourceFile) || {};
  const rankRows = rows.filter((row) => String(row.rank || "") === String(rank || "") && (row.source_file || row.text_path));
  if (!rankRows.length) return {};
  for (const noticeCode of preferredNoticeCodes.filter(Boolean)) {
    const matched = rankRows.find((row) => row.notice_code === noticeCode);
    if (matched) return matched;
  }
  return (
    [...rankRows].sort((a, b) => {
      const extractionDelta = numericTextCharCount(b) - numericTextCharCount(a);
      if (extractionDelta !== 0) return extractionDelta;
      return String(b.notice_date || "").localeCompare(String(a.notice_date || ""));
    })[0] || {}
  );
}

function selectKeyFields(rows, textPath) {
  if (!textPath) return {};
  return rows.find((row) => row.text_path === textPath) || {};
}

function booleanText(value) {
  return value ? "Y" : "N";
}

function summarizeOverride(override) {
  if (!override?.values) {
    return {
      status: "",
      fields: "",
      source: "",
      note: "",
    };
  }
  return {
    status: override.applied_status || "applied",
    fields: Object.entries(override.values)
      .map(([field, value]) => `${field}=${value}`)
      .join("; "),
    source: [override.source_notice_no, override.source_notice_date, override.source_notice_title].filter(Boolean).join(" / "),
    note: override.reason || override.notes || "",
  };
}

function applyValueOverride(row, override, textManifestRows) {
  if (!override?.values) return row;
  const textManifest =
    textManifestRows.find((item) => item.text_path === override.source_text) ||
    textManifestRows.find((item) => item.source_file === override.source_file) ||
    {};

  for (const [field, value] of Object.entries(override.values)) {
    if (field in row) row[field] = value;
  }

  if (!override.preserve_notice_identity) {
    row.notice_no = override.source_notice_no || row.notice_no;
    row.notice_date = override.source_notice_date || row.notice_date;
    row.notice_title = override.source_notice_title || row.notice_title;
  }
  row.has_notice_detail = "Y";
  row.has_local_notice_file = "Y";
  row.local_notice_file = override.source_file || row.local_notice_file;
  row.notice_text_extraction_status = textManifest.extraction_status || row.notice_text_extraction_status || "extracted";
  row.text_coverage = "text_extracted";
  row.text_path = override.source_text || row.text_path;
  row.text_char_count = textManifest.text_char_count || row.text_char_count;
  row.has_area_snippet = "Y";
  row.has_far_snippet = "Y";
  row.has_household_snippet = "Y";
  row.value_override_id = override.override_id || "";
  row.value_override_status = override.applied_status || "applied";
  row.value_override_source_notice_no = override.source_notice_no || "";
  row.value_override_source_notice_date = override.source_notice_date || "";
  row.value_override_source_text = override.source_text || "";
  row.value_override_review = override.source_review || "";
  row.value_override_fields = Object.entries(override.values)
    .map(([field, value]) => `${field}=${value}`)
    .join("; ");
  row.value_override_display_values = Object.entries(override.display_values || {})
    .map(([field, value]) => `${field}=${value}`)
    .join("; ");
  row.value_override_previous_values = Object.entries(override.previous_values || {})
    .map(([field, value]) => `${field}=${value}`)
    .join("; ");
  row.value_override_note = override.reason || override.notes || "";
  return row;
}

function applyStageDateOverride(row, override) {
  if (!override?.values) return row;
  for (const [field, value] of Object.entries(override.values)) {
    if (field in row) row[field] = value;
  }
  row.stage_date_override_id = override.override_id || "";
  row.stage_date_override_status = override.applied_status || "applied";
  row.stage_date_override_source = override.source_name || "";
  row.stage_date_override_url = override.source_url || "";
  row.stage_date_override_review = override.source_review || "";
  row.stage_date_override_fields = Object.entries(override.values)
    .map(([field, value]) => `${field}=${value}`)
    .join("; ");
  row.stage_date_override_note = override.reason || override.notes || "";
  return row;
}

function sourceCoverage(row) {
  const checks = [
    row.has_cleanup_url === "Y",
    row.has_urban_map === "Y" || row.has_business_layer_match === "Y",
    row.has_notice_detail === "Y" ||
      row.has_business_notice_candidate === "Y" ||
      row.has_gwangjin_gu_notice_candidate === "Y" ||
      row.has_gangnam_songpa_notice_candidate === "Y" ||
      row.has_seoul_sibo_original_notice === "Y",
    row.has_local_notice_file === "Y" ||
      row.has_gwangjin_gu_local_notice_file === "Y" ||
      row.has_gangnam_songpa_local_notice_file === "Y" ||
      row.has_seoul_sibo_original_notice === "Y",
    row.text_coverage === "text_extracted" ||
      row.gwangjin_gu_notice_text_coverage === "text_extracted" ||
      row.gangnam_songpa_notice_text_coverage === "text_extracted" ||
      row.has_seoul_sibo_original_ocr_text === "Y",
    row.has_stage_public_docs === "Y",
    row.market_data_status === "ready_for_api_key",
  ];
  return checks.filter(Boolean).length;
}

function representativeLotNoticeIsUnrelated(candidate, urban, notice, market) {
  const source = `${urban?.official_map_url_source || market?.official_map_url_source || candidate.official_map_url_source || ""} ${candidate.official_map_url || market?.official_map_url || ""}`;
  const projectText = `${candidate.project_name || ""} ${candidate.project_type || ""}`;
  const text = `${notice?.notice_title || ""} ${notice?.notice_content || ""} ${urban?.urban_notice_title || ""} ${market?.notice_title || ""} ${urban?.representative_lot_zone_name || ""} ${urban?.urban_zone_name || ""} ${urban?.urban_description || ""}`;
  const landReadjustmentNotice = /환지|토지구획정리/.test(text) && !/환지|토지구획정리/.test(projectText);
  return landReadjustmentNotice || (source.includes("representative_lot") && /환지|토지구획정리/.test(text));
}

function factCheckPriority(row) {
  if (row.has_seoul_sibo_original_notice === "Y") return "original_notice_fact_checked";
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y" && row.has_business_notice_candidate === "Y") return "notice_candidate_review";
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y" && row.has_gwangjin_gu_notice_candidate === "Y" && row.gwangjin_gu_notice_text_coverage === "text_extracted") {
    return "gu_text_review";
  }
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y" && row.has_gwangjin_gu_notice_candidate === "Y") return "gu_notice_review";
  if (row.has_gangnam_songpa_notice_candidate === "Y" && row.gangnam_songpa_notice_text_coverage === "text_extracted") return "district_text_review";
  if (row.has_gangnam_songpa_notice_candidate === "Y") return "district_notice_review";
  if (row.text_coverage === "text_extracted" && row.current_stage === "관리처분인가") return "very_high";
  if (row.text_coverage === "text_extracted" && ["사업시행인가", "조합설립인가"].includes(row.current_stage)) return "high";
  if (["ocr_needed", "hwp_conversion_needed", "hwp_or_ocr_needed"].includes(row.text_coverage)) return "convert_first";
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y") return "notice_record_needed";
  if (row.has_urban_map === "N") return "map_match_first";
  return "normal";
}

function nextAction(row) {
  const unresolvedManualReview =
    Number(row.manual_ocr_review_count || 0) > 0 &&
    /source_image_not_suitable_for_current_value|partial_confirmation_needs_secondary_source|source_value_basis_mismatch_needs_secondary_source|manual_review_record_only/.test(
      String(row.manual_ocr_review_statuses || ""),
    );
  if (unresolvedManualReview) return "OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리";
  if (row.has_seoul_sibo_original_notice === "Y") return "analysis/seoul-sibo-original-notice-fact-check.md 기준으로 총세대수·공공기여·용적률 수치 승격";
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y" && row.has_business_notice_candidate === "Y") {
    if ((row.business_notice_file_name || "").includes("정정")) return "정정고시 확인됨, 본고시 원문/recordCode 확보 후 수치 대조";
    return "보강 고시 원문 텍스트 대조 후 recordCode 확정/승격";
  }
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y" && row.has_gwangjin_gu_notice_candidate === "Y") {
    if (row.gwangjin_gu_notice_text_coverage === "text_extracted") {
      if (String(row.rank) === "25" && row.business_layer_alignment_status === "stage_ahead_of_matrix") {
        return "광진구 공사개요·예정공정표와 정보몽땅 착공신고 공개 신호를 함께 대조해 현재단계를 재판정";
      }
      return "광진구청 첨부 텍스트의 인가·계획 수치와 정보몽땅 단계 공개항목 대조";
    }
    return "광진구청 고시공고 원문 확보, 첨부 텍스트 추출 후 인가·계획 수치 대조";
  }
  if (row.has_gangnam_songpa_notice_candidate === "Y") {
    if (row.gangnam_songpa_notice_text_coverage === "text_extracted") return "강남·송파구청 첨부 텍스트의 사업명·위치·면적을 기존 고시/사업개요와 대조";
    return "강남·송파구청 고시공고 첨부 원문 확보 후 사업명·위치·면적 대조";
  }
  if (row.business_layer_alignment_status === "planning_layer_possible") {
    return "현재 presentSn가 신속통합기획/계획 레이어인지 먼저 확인하고, 재건축 current business presentSn 또는 direct 고시를 별도로 찾는다";
  }
  if (row.business_layer_alignment_status === "representative_lot_fallback_only") {
    return "대표지번 매칭 후보만 확인됐고 current business presentSn는 비어 있으므로 UQ120 상세 레이어 기준일·식별자를 별도 확인한다";
  }
  if (row.business_layer_alignment_status === "type_mismatch" || row.business_layer_alignment_status === "stage_mismatch") {
    return "사업 레이어 유형·단계와 현재 사업 단계가 왜 다른지 확인하고 current business presentSn인지 재판정";
  }
  if (row.business_layer_alignment_status === "stage_ahead_of_matrix") {
    if (String(row.rank) === "25") {
      return "광진구 예정공정표의 착공 마일스톤과 정보몽땅 착공신고 공개 신호를 공식 원문 기준으로 재판정";
    }
    return "사업 레이어 단계 선행이 최신 공식 단계 반영인지, 비교표 단계가 늦은지 추가 확인";
  }
  if (row.business_layer_alignment_status === "aligned_but_low_confidence") {
    return "presentSn 후보는 보조 식별자로 두고, direct 고시·정보몽땅 연결 또는 추가 공식 링크로 current business 여부 확인";
  }
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y" && row.has_stage_public_docs === "Y") {
    return "단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode·인가 원문 연결";
  }
  if (row.current_stage === "관리처분인가" && row.has_stage_public_docs === "Y") {
    return "사업시행·관리처분 공개항목 수치와 고시문/원문 수치 대조";
  }
  if (row.has_urban_map === "N" && row.has_business_layer_match === "Y") return "사업구역 레이어는 매칭됨, 고시 recordCode·인가 원문 수동 확인";
  if (row.has_urban_map === "N") return "서울도시공간포털 지도 recordCode 수동 확인";
  if (row.text_coverage === "ocr_needed") return "스캔 PDF OCR 후 결정조서 수치 확인";
  if (row.text_coverage === "hwp_or_ocr_needed") return "HWP 직접 추출 저신뢰, OCR 또는 원문 수동 확인";
  if (row.text_coverage === "hwp_conversion_needed") return "HWP 외부 변환 후 결정조서 수치 확인";
  if (row.text_coverage === "text_extracted") return "notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격";
  if (row.has_notice_detail === "N") return "고시 상세 또는 첨부 원문 매칭 보강";
  return "시장 원자료 수집 또는 현장/교통 변수 보강";
}

function directStageSourceLabel(row) {
  if (row.current_stage === "사업시행인가") {
    if (/사업시행계획변경인가/.test(`${row.gwangjin_gu_notice_titles || ""} ${row.notice_title || ""}`)) {
      return "사업시행계획변경인가 직접 원문";
    }
    return "사업시행인가 직접 원문";
  }
  if (row.current_stage === "관리처분인가") return "관리처분인가 직접 원문";
  if (row.current_stage === "조합설립인가") return "조합설립인가 직접 원문";
  if (row.current_stage === "추진위원회승인") return "추진위원회승인 직접 원문";
  return row.current_stage ? `${row.current_stage} 직접 원문` : "";
}

function currentStageDisplay(row) {
  if (row.business_layer_alignment_status === "stage_ahead_of_matrix" && row.business_layer_stage) {
    const directLabel = directStageSourceLabel(row);
    return directLabel
      ? `${row.business_layer_stage} 공개신호 / ${directLabel}`
      : `${row.business_layer_stage} 공개신호 / ${row.current_stage || "직접 원문"}`;
  }
  return row.current_stage || "";
}

function toComparisonRow(
  candidate,
  summary,
  urban,
  notice,
  attachments,
  market,
  businessLayer,
  representativeLotCandidates,
  businessNotice,
  managementStageDocs,
  gwangjinStageDocs,
  gwangjinGuNoticeRows,
  gwangjinGuNoticeAttachments,
  gwangjinGuTextManifest,
  gwangjinGuKeyFields,
  hanyanggaroGwangjinSourceRows,
  gangnamSongpaNoticeRows,
  gangnamSongpaNoticeAttachments,
  textManifestRows,
  keyFieldRows,
  seoulSiboSources,
  manualOcrDecisions,
  sourceValueUpdateCandidates,
  valueOverride,
  stageDateOverride,
  allTextManifestRows,
  representativeLotFallbackFinding,
) {
  const noticeFile = attachments.find((item) => item.attachment_type === "notice_file");
  const drawingCount = attachments.filter((item) => item.attachment_type === "drawing_image").length;
  const primaryTextManifest = selectTextManifest(textManifestRows, noticeFile?.local_path, candidate.rank, [
    businessNotice?.notice_code,
    notice?.notice_code,
  ]);
  const primaryKeyFields = selectKeyFields(keyFieldRows, primaryTextManifest?.text_path);
  const stage = stageDateOverride?.values?.current_stage || candidate.current_stage || "";
  const projectApprovalDoc = findStageDoc(managementStageDocs, 202);
  const projectOverviewDoc = findStageDoc(managementStageDocs, 203);
  const managementCostDoc = findStageDoc(managementStageDocs, 210);
  const managementApprovalDoc = findStageDoc(managementStageDocs, 213);
  const unionApprovalDoc = findStageDoc(gwangjinStageDocs, 200);
  const promotionCommitteeDoc = findStageDoc(gwangjinStageDocs, 226);
  const primaryGwangjinDoc = unionApprovalDoc.item_no ? unionApprovalDoc : promotionCommitteeDoc;
  const publicDocCount = managementStageDocs.length + gwangjinStageDocs.length;
  const manualConfirmedBusinessLayer =
    !businessLayer?.match_status
      ? manualConfirmedRepresentativeLotBusinessLayer(representativeLotFallbackFinding, candidate, representativeLotCandidates)
      : null;
  const effectiveBusinessLayer =
    manualConfirmedBusinessLayer ||
    (businessLayer?.match_status ? businessLayer : representativeLotBusinessLayerFallback(representativeLotCandidates, candidate));
  const baseBusinessLayerReview =
    stage === (candidate.current_stage || "")
      ? businessLayerAlignment(candidate, effectiveBusinessLayer)
      : businessLayerAlignment({ ...candidate, current_stage: stage }, effectiveBusinessLayer);
  const businessLayerReview = applyManualFallbackReview(baseBusinessLayerReview, representativeLotFallbackFinding);
  const fallbackGuNoticeRows =
    !gwangjinGuNoticeRows.length && String(candidate.rank) === "25" ? fallbackGwangjinSourceRows(hanyanggaroGwangjinSourceRows) : [];
  const effectiveGwangjinGuNoticeRows = gwangjinGuNoticeRows.length ? gwangjinGuNoticeRows : fallbackGuNoticeRows;
  const effectiveGwangjinGuNoticeAttachments =
    gwangjinGuNoticeAttachments.length
      ? gwangjinGuNoticeAttachments
      : String(candidate.rank) === "25" && valueOverride?.source_file
        ? [{ local_path: valueOverride.source_file }]
        : [];
  const effectiveGwangjinGuTextManifest =
    gwangjinGuTextManifest.length
      ? gwangjinGuTextManifest
      : String(candidate.rank) === "25"
        ? fallbackGwangjinTextManifestRows(hanyanggaroGwangjinSourceRows)
        : [];
  const guNoticeCandidates = effectiveGwangjinGuNoticeRows.filter(
    (item) => item.search_status === "candidate" && item.match_confidence === "high",
  );
  const guNoticeTitles = [...new Set(guNoticeCandidates.map((item) => item.notice_title).filter(Boolean))];
  const guNoticeDates = guNoticeCandidates.map((item) => item.notice_date).filter(Boolean).sort();
  const guText = guTextSummary(effectiveGwangjinGuTextManifest);
  const gsNoticeCandidates = gangnamSongpaNoticeRows.filter((item) => item.search_status === "candidate" && item.match_confidence === "high");
  const gsNoticeTitles = [...new Set(gsNoticeCandidates.map((item) => item.notice_title).filter(Boolean))];
  const gsNoticeDates = gsNoticeCandidates.map((item) => item.notice_date).filter(Boolean).sort();
  const gsLocalAttachments = gangnamSongpaNoticeAttachments.filter((item) => item.local_path);
  const gsLocalPaths = new Set(gsLocalAttachments.map((item) => item.local_path));
  const gsTextManifest = textManifestRows.filter((item) => gsLocalPaths.has(item.source_file));
  const gsText = guTextSummary(gsTextManifest);
  const gsTextPaths = new Set(gsTextManifest.map((item) => item.text_path).filter(Boolean));
  const gsKeyFields = keyFieldRows.filter((item) => gsTextPaths.has(item.text_path));
  const seoulSiboSource = seoulSiboSources.find((item) => item.notice_no && item.local_pdf) || {};
  const hasSeoulSibo = Boolean(seoulSiboSource.local_pdf);
  const primaryTextCoverage = effectiveTextCoverage(primaryTextManifest?.extraction_status, guText.coverage, gsText.coverage);
  const manualOcr = summarizeManualOcrDecisions(manualOcrDecisions);
  const sourceValueUpdates = summarizeSourceValueUpdates(sourceValueUpdateCandidates);
  const valueOverrideSummary = summarizeOverride(valueOverride);
  const unrelatedRepresentativeLotNotice = representativeLotNoticeIsUnrelated(candidate, urban, notice, market);
  const effectiveNotice = unrelatedRepresentativeLotNotice ? {} : notice || {};
  const effectiveMarketNotice = unrelatedRepresentativeLotNotice ? {} : market || {};
  const hasValidUrbanMap = urban?.match_status === "matched" && !unrelatedRepresentativeLotNotice;
  const row = {
    rank: candidate.rank,
    priority_tier: candidate.priority_tier,
    score: candidate.score,
    focus_area: candidate.focus_area,
    district: candidate.district,
    dong: candidate.dong,
    estimated_station_area: candidate.estimated_station_area,
    project_name: candidate.project_name,
    project_type: candidate.project_type,
    market_type: market?.market_type || "",
    current_stage: stage,
    current_stage_display: stage,
    stage_order: stageOrder(stage),
    stage_bucket: stageBucket(stage),
    notice_no: effectiveNotice.notice_no || businessNotice?.notice_no || effectiveMarketNotice.notice_no || primaryTextManifest?.notice_no || "",
    notice_date:
      effectiveNotice.notice_date || businessNotice?.notice_date || effectiveMarketNotice.notice_date || primaryTextManifest?.notice_date || "",
    notice_title: effectiveNotice.notice_title || businessNotice?.notice_title || effectiveMarketNotice.notice_title || "",
    district_area_sqm_official: summary?.district_area_sqm || market?.district_area_sqm || "",
    urban_area_after_sqm: urban?.urban_area_after || "",
    total_households_official: summary?.total_households || market?.total_households || "",
    floor_area_ratio_pct_official: summary?.floor_area_ratio_pct || market?.floor_area_ratio_pct || "",
    building_coverage_ratio_pct_official: summary?.building_coverage_ratio_pct || "",
    max_height_m_official: summary?.max_height_m || "",
    floors_official: summary?.floors || "",
    has_cleanup_url: booleanText(candidate.official_project_url),
    has_urban_map: booleanText(hasValidUrbanMap),
    urban_map_source: hasValidUrbanMap ? urban?.official_map_url_source || "" : "",
    has_business_layer_match: booleanText(
      ["business_layer_matched_no_notice_record", "manual_confirmed_current_business"].includes(effectiveBusinessLayer?.match_status || ""),
    ),
    has_business_layer_manual_confirmation: booleanText(effectiveBusinessLayer?.match_status === "manual_confirmed_current_business"),
    has_business_layer_fallback_candidate: booleanText(effectiveBusinessLayer?.match_status === "representative_lot_business_layer_fallback"),
    business_layer_source_basis:
      effectiveBusinessLayer?.match_status === "business_layer_matched_no_notice_record"
        ? "direct_business_layer"
        : effectiveBusinessLayer?.match_status === "manual_confirmed_current_business"
          ? "manual_fallback_confirmation"
        : effectiveBusinessLayer?.match_status === "representative_lot_business_layer_fallback"
          ? "representative_lot_fallback"
          : "",
    business_layer_match_confidence: effectiveBusinessLayer?.match_confidence || "",
    business_present_sn: effectiveBusinessLayer?.present_sn || "",
    business_layer_zone_name: effectiveBusinessLayer?.layer_zone_name || "",
    business_layer_area_sqm: effectiveBusinessLayer?.layer_area_sqm || "",
    business_layer_type_group: effectiveBusinessLayer?.urban_business_type_group || "",
    business_layer_stage: effectiveBusinessLayer?.urban_propel_name || "",
    business_layer_type: effectiveBusinessLayer?.urban_business_type || "",
    business_layer_data_reference_date: effectiveBusinessLayer?.urban_data_reference_date || "",
    business_layer_cleanup_url: effectiveBusinessLayer?.cleanup_site_url || "",
    business_layer_review_note: effectiveBusinessLayer?.review_note || "",
    business_layer_next_action: effectiveBusinessLayer?.next_action || "",
    business_layer_record_code_candidate: effectiveBusinessLayer?.representative_record_code || "",
    business_layer_notice_code_candidate: effectiveBusinessLayer?.representative_notice_code || "",
    business_layer_map_url_candidate: effectiveBusinessLayer?.representative_map_url || "",
    business_layer_layer_name_candidate: effectiveBusinessLayer?.representative_layer_name || "",
    business_layer_alignment_status: businessLayerReview.status,
    business_layer_alignment_note: businessLayerReview.note,
    business_layer_manual_review_date: representativeLotFallbackFinding?.checked_at || "",
    business_layer_manual_review_status: representativeLotFallbackFinding?.check_status || "",
    business_layer_manual_apply_status: representativeLotFallbackFinding?.apply_status || "",
    business_layer_manual_verified_zone_name: representativeLotFallbackFinding?.verified_zone_name || "",
    business_layer_manual_evidence_url: representativeLotFallbackFinding?.evidence_url || "",
    business_layer_manual_evidence_note: representativeLotFallbackFinding?.evidence_note || "",
    business_layer_manual_decision_note: representativeLotFallbackFinding?.decision_note || "",
    has_business_notice_candidate: booleanText(businessNotice?.match_confidence === "high" && businessNotice?.notice_code),
    business_notice_match_confidence: businessNotice?.match_confidence || "",
    business_notice_code: businessNotice?.notice_code || "",
    business_notice_no: businessNotice?.notice_no || "",
    business_notice_date: businessNotice?.notice_date || "",
    business_notice_title: businessNotice?.notice_title || "",
    business_notice_file_name: businessNotice?.notice_file_name || "",
    business_notice_file_url: businessNotice?.notice_file_url || "",
    has_seoul_sibo_original_notice: booleanText(hasSeoulSibo),
    seoul_sibo_original_issue_no: seoulSiboSource.issue_no || "",
    seoul_sibo_original_issue_date: seoulSiboSource.issue_date || "",
    seoul_sibo_original_notice_no: seoulSiboSource.notice_no || "",
    seoul_sibo_original_pdf_pages_ocr: seoulSiboSource.pdf_pages_ocr || "",
    seoul_sibo_original_local_pdf: seoulSiboSource.local_pdf || "",
    seoul_sibo_original_ocr_text: seoulSiboSource.ocr_text || "",
    has_seoul_sibo_original_ocr_text: booleanText(seoulSiboSource.ocr_text),
    has_gwangjin_gu_notice_candidate: booleanText(guNoticeCandidates.length),
    gwangjin_gu_notice_candidate_count: guNoticeCandidates.length,
    gwangjin_gu_notice_latest_date: guNoticeDates.at(-1) || "",
    gwangjin_gu_notice_titles: guNoticeTitles.slice(0, 5).join("; "),
    has_gwangjin_gu_local_notice_file: booleanText(effectiveGwangjinGuNoticeAttachments.some((item) => item.local_path)),
    gwangjin_gu_notice_attachment_count: effectiveGwangjinGuNoticeAttachments.length,
    has_gwangjin_gu_notice_text: booleanText(guText.hasText),
    gwangjin_gu_notice_text_coverage: guText.coverage,
    gwangjin_gu_notice_text_count: guText.textCount,
    gwangjin_gu_notice_ocr_text_count: guText.ocrCount,
    gwangjin_gu_notice_text_char_count: guText.charCount || "",
    gwangjin_gu_notice_text_statuses: guText.statuses,
    gwangjin_gu_notice_text_paths: guText.paths,
    has_gangnam_songpa_notice_candidate: booleanText(gsNoticeCandidates.length),
    gangnam_songpa_notice_candidate_count: gsNoticeCandidates.length,
    gangnam_songpa_notice_latest_date: gsNoticeDates.at(-1) || "",
    gangnam_songpa_notice_titles: gsNoticeTitles.slice(0, 5).join("; "),
    has_gangnam_songpa_local_notice_file: booleanText(gsLocalAttachments.length),
    gangnam_songpa_notice_attachment_count: gangnamSongpaNoticeAttachments.length,
    has_gangnam_songpa_notice_text: booleanText(gsText.hasText),
    gangnam_songpa_notice_text_coverage: gsText.coverage,
    gangnam_songpa_notice_text_count: gsText.textCount,
    gangnam_songpa_notice_ocr_text_count: gsText.ocrCount,
    gangnam_songpa_notice_text_char_count: gsText.charCount || "",
    gangnam_songpa_notice_text_statuses: gsText.statuses,
    gangnam_songpa_notice_text_paths: gsText.paths,
    has_notice_detail: booleanText(
      (!unrelatedRepresentativeLotNotice && notice?.notice_code) ||
        (businessNotice?.match_confidence === "high" && businessNotice?.notice_code) ||
        primaryTextManifest?.notice_code ||
        gsNoticeCandidates.length ||
        hasSeoulSibo,
    ),
    has_local_notice_file: booleanText(noticeFile?.local_path || primaryTextManifest?.source_file || gsLocalAttachments.length),
    local_notice_file: noticeFile?.local_path || primaryTextManifest?.source_file || gsLocalAttachments[0]?.local_path || "",
    drawing_image_count: drawingCount,
    notice_text_extraction_status: primaryTextManifest?.extraction_status || gsText.statuses || "",
    text_coverage: primaryTextCoverage,
    text_path: primaryTextManifest?.text_path || guText.paths || gsText.paths || "",
    text_char_count: primaryTextManifest?.text_char_count || guText.charCount || gsText.charCount || "",
    has_stage_public_docs: booleanText(publicDocCount),
    stage_public_doc_count: publicDocCount,
    project_approval_application_date_public: projectApprovalDoc.application_date || "",
    project_approval_date_public: projectApprovalDoc.approval_date || "",
    project_approval_notice_date_public: projectApprovalDoc.notice_date || "",
    management_approval_application_date_public: managementApprovalDoc.application_date || "",
    management_approval_date_public: managementApprovalDoc.approval_date || "",
    management_approval_notice_date_public: managementApprovalDoc.notice_date || "",
    project_stage_total_units_public: projectOverviewDoc.total_units || "",
    project_stage_sale_units_public: projectOverviewDoc.sale_units || "",
    project_stage_rental_units_public: projectOverviewDoc.rental_units || "",
    project_stage_floor_area_ratio_pct_public: projectOverviewDoc.floor_area_ratio || "",
    management_construction_cost_public: managementCostDoc.construction_cost || "",
    union_approval_application_date_public: unionApprovalDoc.application_date || "",
    union_approval_date_public: unionApprovalDoc.approval_date || "",
    promotion_committee_application_date_public: promotionCommitteeDoc.application_date || "",
    promotion_committee_approval_date_public: promotionCommitteeDoc.approval_date || "",
    stage_landowner_count_public: primaryGwangjinDoc.landowner_count || "",
    stage_union_member_count_public: primaryGwangjinDoc.union_member_count || "",
    stage_consenter_count_public: primaryGwangjinDoc.consenter_count || "",
    stage_consent_rate_pct_public: primaryGwangjinDoc.consent_rate_pct || "",
    key_fields_path: primaryKeyFields?.text_path
      ? "data/urban/text/notice-key-fields.csv"
      : guText.hasText
        ? "data/urban/text/gwangjin-gu-notice-key-fields.csv"
        : gsText.hasText
          ? "data/urban/text/notice-key-fields.csv"
          : "",
    has_area_snippet: booleanText(
      primaryKeyFields?.district_area_snippets || anySnippet(gwangjinGuKeyFields, "district_area_snippets") || anySnippet(gsKeyFields, "district_area_snippets") || hasSeoulSibo,
    ),
    has_far_snippet: booleanText(
      primaryKeyFields?.floor_area_ratio_snippets ||
        anySnippet(gwangjinGuKeyFields, "floor_area_ratio_snippets") ||
        anySnippet(gsKeyFields, "floor_area_ratio_snippets") ||
        hasSeoulSibo,
    ),
    has_household_snippet: booleanText(
      primaryKeyFields?.households_snippets || anySnippet(gwangjinGuKeyFields, "households_snippets") || anySnippet(gsKeyFields, "households_snippets") || hasSeoulSibo,
    ),
    has_infrastructure_snippet: booleanText(
      primaryKeyFields?.infrastructure_snippets ||
        anySnippet(gwangjinGuKeyFields, "infrastructure_snippets") ||
        anySnippet(gsKeyFields, "infrastructure_snippets") ||
        hasSeoulSibo,
    ),
    has_public_contribution_snippet: booleanText(
      primaryKeyFields?.public_contribution_snippets ||
        anySnippet(gwangjinGuKeyFields, "public_contribution_snippets") ||
        anySnippet(gsKeyFields, "public_contribution_snippets") ||
        hasSeoulSibo,
    ),
    manual_ocr_review_count: manualOcr.count,
    manual_ocr_review_statuses: manualOcr.statuses,
    manual_ocr_review_fields: manualOcr.fields,
    manual_ocr_source_values: manualOcr.sourceValues,
    manual_ocr_recommended_actions: manualOcr.recommendedActions,
    manual_ocr_decisions_path: manualOcr.count ? "analysis/ocr-image-review-decisions.md" : "",
    source_value_update_candidate_count: sourceValueUpdates.count,
    source_value_update_statuses: sourceValueUpdates.statuses,
    source_value_update_fields: sourceValueUpdates.fields,
    source_value_update_values: sourceValueUpdates.values,
    source_value_update_actions: sourceValueUpdates.actions,
    source_value_update_candidates_path: sourceValueUpdates.count ? "analysis/source-value-update-candidates.md" : "",
    value_override_id: valueOverride?.override_id || "",
    value_override_status: valueOverrideSummary.status,
    value_override_source_notice_no: valueOverride?.source_notice_no || "",
    value_override_source_notice_date: valueOverride?.source_notice_date || "",
    value_override_source_text: valueOverride?.source_text || "",
    value_override_review: valueOverride?.source_review || "",
    value_override_fields: valueOverrideSummary.fields,
    value_override_display_values: valueOverride?.display_values
      ? Object.entries(valueOverride.display_values)
          .map(([field, value]) => `${field}=${value}`)
          .join("; ")
      : "",
    value_override_previous_values: valueOverride?.previous_values
      ? Object.entries(valueOverride.previous_values)
          .map(([field, value]) => `${field}=${value}`)
          .join("; ")
      : "",
    value_override_note: valueOverrideSummary.note,
    stage_date_override_id: "",
    stage_date_override_status: "",
    stage_date_override_source: "",
    stage_date_override_url: "",
    stage_date_override_review: "",
    stage_date_override_fields: "",
    stage_date_override_note: "",
    market_data_status: market?.market_data_status || "",
    transaction_scope: market?.transaction_scope || "",
    preferred_asset_types: market?.preferred_asset_types || "",
    target_complex_keywords: market?.target_complex_keywords || "",
    r_one_regions: market?.r_one_regions || "",
    strategic_tags: candidate.strategic_tags || "",
    risk_notes: candidate.risk_notes || "",
    next_research_question: candidate.next_research_question || "",
  };
  applyValueOverride(row, valueOverride, allTextManifestRows);
  applyStageDateOverride(row, stageDateOverride);
  row.stage_order = stageOrder(row.current_stage);
  row.stage_bucket = stageBucket(row.current_stage);
  row.current_stage_display = currentStageDisplay(row);
  row.source_coverage_score = sourceCoverage(row);
  row.fact_check_priority = factCheckPriority(row);
  row.next_action = nextAction(row);
  row.project_note = `project-notes/${String(row.rank).padStart(2, "0")}-${slugify(candidate.cafe_id || candidate.project_name)}.md`;
  return row;
}

function slugify(value) {
  return String(value || "project")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  return `${lines.join("\n")}\n`;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "미확인";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortCountEntries(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
}

function mdTable(rows, fields) {
  const header = `| ${fields.map((field) => field.label).join(" | ")} |`;
  const sep = `| ${fields.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`);
  return [header, sep, ...body].join("\n");
}

function coverageLine(row) {
  const parts = [];
  if (row.has_urban_map === "N") parts.push("지도 미매칭");
  if (row.has_business_layer_match === "Y") parts.push("사업구역 레이어 매칭");
  if (row.has_stage_public_docs === "Y") parts.push("단계 공개항목");
  if (row.gwangjin_gu_notice_text_coverage === "text_extracted") parts.push("광진구청 텍스트");
  if (row.gangnam_songpa_notice_text_coverage === "text_extracted") parts.push("강남·송파구청 텍스트");
  if (row.text_coverage === "ocr_needed") parts.push("OCR 필요");
  if (row.text_coverage === "hwp_or_ocr_needed") parts.push("HWP 저신뢰/OCR 필요");
  if (row.text_coverage === "hwp_conversion_needed") parts.push("HWP 변환 필요");
  if (row.text_coverage === "text_extracted") parts.push("텍스트 추출 완료");
  if (!parts.length) parts.push(row.text_coverage);
  return parts.join(", ");
}

function focusSummary(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.focus_area)) groups.set(row.focus_area, []);
    groups.get(row.focus_area).push(row);
  }
  const sections = [];
  for (const [focus, focusRows] of groups.entries()) {
    const stageCounts = sortCountEntries(countBy(focusRows, "stage_bucket"))
      .map(([name, count]) => `${name} ${count}`)
      .join(", ");
    const textCounts = sortCountEntries(countBy(focusRows, "text_coverage"))
      .map(([name, count]) => `${name} ${count}`)
      .join(", ");
    const topRows = [...focusRows].sort((a, b) => Number(a.rank) - Number(b.rank)).slice(0, 10);
    sections.push(`## ${focus}

- 후보: ${focusRows.length}개
- 단계 분포: ${stageCounts}
- 원문 텍스트 상태: ${textCounts}
- 우선 확인: ${focusRows.filter((row) => ["convert_first", "notice_candidate_review", "notice_record_needed", "map_match_first", "very_high"].includes(row.fact_check_priority)).length}개

${mdTable(topRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "current_stage_display", label: "단계" },
  { key: "district_area_sqm_official", label: "면적" },
  { key: "total_households_official", label: "세대" },
  { key: "floor_area_ratio_pct_official", label: "용적률" },
  { key: "stage_consent_rate_pct_public", label: "동의율" },
  { key: "fact_check_priority", label: "확인 우선" },
  { key: "next_action", label: "다음 작업" },
])}
`);
  }
  return sections.join("\n");
}

function markdownSummary(rows) {
  const byText = sortCountEntries(countBy(rows, "text_coverage"));
  const byStage = sortCountEntries(countBy(rows, "stage_bucket"));
  const highPriorityRows = rows.filter((row) =>
    [
      "original_notice_fact_checked",
      "very_high",
      "high",
      "convert_first",
      "map_match_first",
      "notice_record_needed",
      "notice_candidate_review",
      "gu_notice_review",
      "gu_text_review",
      "district_notice_review",
      "district_text_review",
    ].includes(row.fact_check_priority),
  );
  return `# 사업장 비교 매트릭스

작성 기준: ${kstDate()} KST

이 문서는 강남·잠실·구의 생활권 우선검토 후보 30개를 같은 열로 비교하기 위한 파생 산출물이다. 정비사업 정보몽땅, 서울도시공간포털 고시, 광진구청 고시공고, 로컬 원문 파일, 텍스트 추출 상태, 시장 데이터 수집 키를 한 행에 모았다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 후보 사업장 | ${rows.length} |
| 서울도시공간포털 매칭 | ${rows.filter((row) => row.has_urban_map === "Y").length} |
| 사업구역 레이어 보강 | ${rows.filter((row) => row.has_business_layer_match === "Y").length} |
| 대표지번 fallback 수동 확정 | ${rows.filter((row) => row.has_business_layer_manual_confirmation === "Y").length} |
| 사업구역 기반 고시 후보 | ${rows.filter((row) => row.has_business_notice_candidate === "Y").length} |
| 서울시보 본고시 원문 확보 | ${rows.filter((row) => row.has_seoul_sibo_original_notice === "Y").length} |
| 광진구청 고시공고 후보 | ${rows.filter((row) => row.has_gwangjin_gu_notice_candidate === "Y").length} |
| 광진구청 첨부 텍스트 확보 | ${rows.filter((row) => row.has_gwangjin_gu_notice_text === "Y").length} |
| 강남·송파구청 고시공고 후보 | ${rows.filter((row) => row.has_gangnam_songpa_notice_candidate === "Y").length} |
| 강남·송파구청 첨부 텍스트 확보 | ${rows.filter((row) => row.has_gangnam_songpa_notice_text === "Y").length} |
| 정보몽땅 단계 공개항목 보강 | ${rows.filter((row) => row.has_stage_public_docs === "Y").length} |
| 로컬 고시 원문 보관 | ${rows.filter((row) => row.has_local_notice_file === "Y").length} |
| 원문 텍스트 추출 완료 | ${rows.filter((row) => row.text_coverage === "text_extracted").length} |
| OCR 이미지 수동 검수 | ${rows.filter((row) => Number(row.manual_ocr_review_count || 0) > 0).length} |
| 원문 수치 보정 후보 보유 사업장 | ${rows.filter((row) => Number(row.source_value_update_candidate_count || 0) > 0).length} |
| 공식 원문값 override 적용 | ${rows.filter((row) => row.value_override_status).length} |
| 시장 데이터 키 준비 | ${rows.filter((row) => row.market_data_status === "ready_for_api_key").length} |

## 단계 분포

${mdTable(byStage.map(([name, count]) => ({ name, count })), [
  { key: "name", label: "단계 묶음" },
  { key: "count", label: "건수" },
])}

## 원문 텍스트 상태

${mdTable(byText.map(([name, count]) => ({ name, count })), [
  { key: "name", label: "상태" },
  { key: "count", label: "건수" },
])}

## 확인 우선순위

${mdTable(highPriorityRows, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage_display", label: "단계" },
  { key: "text_coverage", label: "원문 상태" },
  { key: "has_stage_public_docs", label: "단계공개" },
  { key: "manual_ocr_review_statuses", label: "OCR 수동판정" },
  { key: "source_value_update_statuses", label: "수치보정" },
  { key: "value_override_status", label: "공식값 override" },
  { key: "next_action", label: "다음 작업" },
])}

${focusSummary(rows)}

## 사용 방법

- 확정 비교 수치는 \`project-comparison-matrix.csv\`의 \`*_official\` 열을 우선 사용한다.
- \`notice-key-fields.csv\`에서 온 값은 자동 스니펫 후보이므로 원문 파일과 대조하기 전에는 확정값으로 쓰지 않는다.
- \`fact_check_priority=convert_first\`는 OCR 또는 HWP 변환이 먼저 필요하다.
- \`fact_check_priority=map_match_first\`는 서울도시공간포털 recordCode 수동 확인이 먼저 필요하다.
- \`fact_check_priority=notice_record_needed\`는 사업구역 레이어는 매칭됐지만 결정고시 recordCode와 인가 원문을 별도로 찾아야 한다.
- \`has_business_layer_manual_confirmation=Y\`는 Edge/UQ120 수동 확인으로 current business presentSn와 데이터 기준일을 채운 케이스다.
- \`fact_check_priority=notice_candidate_review\`는 사업구역 기반 고시 후보와 원문 파일이 발견됐으므로 원문 수치 대조 후 확정 고시로 승격한다.
- \`fact_check_priority=gu_notice_review\`는 서울도시공간포털 recordCode는 없지만 광진구청 고시공고 원문 후보와 첨부를 확보했다는 뜻이다.
- \`fact_check_priority=gu_text_review\`는 광진구청 첨부 텍스트까지 확보했으므로 고시/인가 수치 대조가 다음 단계라는 뜻이다.
- \`fact_check_priority=district_notice_review\` 또는 \`district_text_review\`는 강남·송파 자치구 고시공고 고신뢰 후보를 원문 대조 대상으로 분리했다는 뜻이다.
- \`has_gangnam_songpa_notice_candidate=Y\`는 강남구청·송파구청 고시공고에서 고신뢰 후보를 확보했다는 뜻이며, 원문 수치 대조 전에는 기존 서울도시공간포털 값을 덮어쓰지 않는다.
- \`has_stage_public_docs=Y\`는 정보몽땅 공개항목에서 사업시행·관리처분·조합설립·추진위 관련 공개표를 별도 확보했다는 뜻이다.
- \`manual_ocr_review_count>0\`은 원문 이미지를 직접 열어 구조화값과 원문값의 차이 또는 부분확정 상태를 기록했다는 뜻이다.
- \`source_value_update_candidate_count>0\`은 수동 이미지 판독을 바탕으로 비교용 구조화 수치의 보정 후보를 만들었다는 뜻이다.
- \`value_override_status\`는 더 최신이거나 더 직접적인 공식 원문이 확인되어 비교표의 공식값 열을 재생성 시점에 보정했다는 뜻이다.
`;
}

async function main() {
  const candidates = parseCsv(await readFile(CANDIDATES_INPUT, "utf8"));
  const summaries = byRank(JSON.parse(await readFile(SUMMARIES_INPUT, "utf8")));
  const urbanDetails = byRank(JSON.parse(await readFile(URBAN_DETAILS_INPUT, "utf8")));
  const noticeDetails = byRank(JSON.parse(await readFile(NOTICE_DETAILS_INPUT, "utf8")));
  const textManifestRows = parseCsv(await readFile(TEXT_MANIFEST_INPUT, "utf8"));
  const keyFieldRows = parseCsv(await readFile(KEY_FIELDS_INPUT, "utf8"));
  const marketRows = byRank(JSON.parse(await readFile(MARKET_INPUT, "utf8")));
  let representativeLotRows = {};
  try {
    representativeLotRows = rowsByRank(parseCsv(await readFile(REPRESENTATIVE_LOT_INPUT, "utf8")));
  } catch {
    representativeLotRows = {};
  }
  let businessNoticeRows = {};
  let businessNoticeAttachments = [];
  try {
    businessNoticeRows = byRank(
      JSON.parse(await readFile(BUSINESS_NOTICE_INPUT, "utf8")).filter((row) => row.search_status === "candidate" && row.match_confidence === "high"),
    );
    businessNoticeAttachments = parseCsv(await readFile(BUSINESS_NOTICE_ATTACHMENTS_INPUT, "utf8"));
  } catch {
    businessNoticeRows = {};
    businessNoticeAttachments = [];
  }
  const noticeAttachments = attachmentsByRank([...parseCsv(await readFile(NOTICE_ATTACHMENTS_INPUT, "utf8")), ...businessNoticeAttachments]);
  let businessLayerRows = {};
  try {
    businessLayerRows = byRank(JSON.parse(await readFile(BUSINESS_LAYER_INPUT, "utf8")));
  } catch {
    businessLayerRows = {};
  }
  let managementStageDocs = {};
  try {
    managementStageDocs = groupByRank(JSON.parse(await readFile(MANAGEMENT_STAGE_DOCS_INPUT, "utf8")));
  } catch {
    managementStageDocs = {};
  }
  let gwangjinStageDocs = {};
  try {
    gwangjinStageDocs = groupByRank(JSON.parse(await readFile(GWANGJIN_STAGE_DOCS_INPUT, "utf8")));
  } catch {
    gwangjinStageDocs = {};
  }
  let gwangjinGuNoticeRows = {};
  try {
    gwangjinGuNoticeRows = rowsByRank(JSON.parse(await readFile(GWANGJIN_GU_NOTICE_INPUT, "utf8")));
  } catch {
    gwangjinGuNoticeRows = {};
  }
  let gwangjinGuNoticeAttachments = {};
  try {
    gwangjinGuNoticeAttachments = rowsByRank(parseCsv(await readFile(GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT, "utf8")));
  } catch {
    gwangjinGuNoticeAttachments = {};
  }
  let gwangjinGuTextManifest = {};
  try {
    gwangjinGuTextManifest = rowsByRank(parseCsv(await readFile(GWANGJIN_GU_TEXT_MANIFEST_INPUT, "utf8")));
  } catch {
    gwangjinGuTextManifest = {};
  }
  let gwangjinGuKeyFields = {};
  try {
    gwangjinGuKeyFields = rowsByRank(parseCsv(await readFile(GWANGJIN_GU_KEY_FIELDS_INPUT, "utf8")));
  } catch {
    gwangjinGuKeyFields = {};
  }
  let hanyanggaroGwangjinSourceRows = {};
  try {
    hanyanggaroGwangjinSourceRows = rowsByRank(
      JSON.parse(await readFile(HANYANGGARO_GWANGJIN_SOURCE_PAGES_INPUT, "utf8")).map((row) => ({ ...row, rank: "25" })),
    );
  } catch {
    hanyanggaroGwangjinSourceRows = {};
  }
  let gangnamSongpaNoticeRows = {};
  try {
    gangnamSongpaNoticeRows = rowsByRank(JSON.parse(await readFile(GANGNAM_SONGPA_NOTICE_INPUT, "utf8")));
  } catch {
    gangnamSongpaNoticeRows = {};
  }
  let gangnamSongpaNoticeAttachments = {};
  try {
    gangnamSongpaNoticeAttachments = rowsByRank(parseCsv(await readFile(GANGNAM_SONGPA_NOTICE_ATTACHMENTS_INPUT, "utf8")));
  } catch {
    gangnamSongpaNoticeAttachments = {};
  }
  let seoulSiboSources = {};
  try {
    seoulSiboSources = rowsByRank(
      JSON.parse(await readFile(SEOUL_SIBO_ORIGINAL_NOTICE_INPUT, "utf8")).map((row) => ({
        ...row,
        rank: row.project_rank,
      })),
    );
  } catch {
    seoulSiboSources = {};
  }
  let manualOcrDecisionRows = {};
  try {
    manualOcrDecisionRows = rowsByRank(JSON.parse(await readFile(OCR_IMAGE_REVIEW_DECISIONS_INPUT, "utf8")));
  } catch {
    manualOcrDecisionRows = {};
  }
  let sourceValueUpdateCandidateRows = {};
  try {
    sourceValueUpdateCandidateRows = rowsByRank(JSON.parse(await readFile(SOURCE_VALUE_UPDATE_CANDIDATES_INPUT, "utf8")));
  } catch {
    sourceValueUpdateCandidateRows = {};
  }
  let valueOverrideRows = {};
  try {
    valueOverrideRows = rowsByRank(JSON.parse(await readFile(VALUE_OVERRIDES_INPUT, "utf8")));
  } catch {
    valueOverrideRows = {};
  }
  let stageDateOverrideRows = {};
  try {
    stageDateOverrideRows = rowsByRank(JSON.parse(await readFile(STAGE_DATE_OVERRIDES_INPUT, "utf8")));
  } catch {
    stageDateOverrideRows = {};
  }
  let representativeLotFallbackFindingRows = {};
  try {
    representativeLotFallbackFindingRows = latestRowsByRank(JSON.parse(await readFile(REPRESENTATIVE_LOT_FALLBACK_FINDINGS_INPUT, "utf8")));
  } catch {
    representativeLotFallbackFindingRows = {};
  }
  const allTextManifestRows = [
    ...textManifestRows,
    ...Object.values(gwangjinGuTextManifest).flat(),
    ...fallbackGwangjinTextManifestRows(hanyanggaroGwangjinSourceRows["25"] || []),
  ];

  const rows = candidates.map((candidate) =>
    toComparisonRow(
      candidate,
      summaries[candidate.rank],
      urbanDetails[candidate.rank],
      noticeDetails[candidate.rank],
      noticeAttachments[candidate.rank] || [],
      marketRows[candidate.rank],
      businessLayerRows[candidate.rank],
      representativeLotRows[candidate.rank] || [],
      businessNoticeRows[candidate.rank],
      managementStageDocs[candidate.rank] || [],
      gwangjinStageDocs[candidate.rank] || [],
      gwangjinGuNoticeRows[candidate.rank] || [],
      gwangjinGuNoticeAttachments[candidate.rank] || [],
      gwangjinGuTextManifest[candidate.rank] || [],
      gwangjinGuKeyFields[candidate.rank] || [],
      hanyanggaroGwangjinSourceRows[candidate.rank] || [],
      gangnamSongpaNoticeRows[candidate.rank] || [],
      gangnamSongpaNoticeAttachments[candidate.rank] || [],
      textManifestRows,
      keyFieldRows,
      seoulSiboSources[candidate.rank] || [],
      manualOcrDecisionRows[candidate.rank] || [],
      sourceValueUpdateCandidateRows[candidate.rank] || [],
      valueOverrideRows[candidate.rank]?.[0] || {},
      stageDateOverrideRows[candidate.rank]?.[0] || {},
      allTextManifestRows,
      representativeLotFallbackFindingRows[candidate.rank] || {},
    ),
  );

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "project-comparison-matrix.csv"), toCsv(rows));
  await writeFile(path.join(OUT_DIR, "project-comparison-matrix.json"), JSON.stringify(rows, null, 2));
  await writeFile(path.join(OUT_DIR, "project-comparison-matrix.md"), markdownSummary(rows));

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        urbanMatched: rows.filter((row) => row.has_urban_map === "Y").length,
        businessLayerMatched: rows.filter((row) => row.has_business_layer_match === "Y").length,
        businessLayerManualConfirmed: rows.filter((row) => row.has_business_layer_manual_confirmation === "Y").length,
        businessNoticeCandidates: rows.filter((row) => row.has_business_notice_candidate === "Y").length,
        gwangjinGuNoticeCandidates: rows.filter((row) => row.has_gwangjin_gu_notice_candidate === "Y").length,
        gwangjinGuNoticeText: rows.filter((row) => row.has_gwangjin_gu_notice_text === "Y").length,
        gangnamSongpaNoticeCandidates: rows.filter((row) => row.has_gangnam_songpa_notice_candidate === "Y").length,
        gangnamSongpaNoticeText: rows.filter((row) => row.has_gangnam_songpa_notice_text === "Y").length,
        seoulSiboOriginalNotice: rows.filter((row) => row.has_seoul_sibo_original_notice === "Y").length,
        stagePublicDocs: rows.filter((row) => row.has_stage_public_docs === "Y").length,
        localNoticeFiles: rows.filter((row) => row.has_local_notice_file === "Y").length,
        textExtracted: rows.filter((row) => row.text_coverage === "text_extracted").length,
        manualOcrReview: rows.filter((row) => Number(row.manual_ocr_review_count || 0) > 0).length,
        sourceValueUpdateCandidates: rows.filter((row) => Number(row.source_value_update_candidate_count || 0) > 0).length,
        output: "analysis/project-comparison-matrix.{csv,json,md}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
