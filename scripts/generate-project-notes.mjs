#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/priority-redevelopment-candidates.csv";
const PROJECT_COMPARISON_MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const PROJECT_SUMMARIES_INPUT = "data/cleanup/project-summaries-priority-candidates.json";
const URBAN_DETAILS_INPUT = "data/urban/urban-map-details-priority-candidates.json";
const URBAN_NOTICE_DETAILS_INPUT = "data/urban/urban-notice-details-priority-candidates.json";
const URBAN_NOTICE_ATTACHMENTS_INPUT = "data/urban/urban-notice-attachments-priority-candidates.csv";
const BUSINESS_NOTICE_CANDIDATES_INPUT = "data/urban/business-layer-notice-candidates.json";
const BUSINESS_NOTICE_ATTACHMENTS_INPUT = "data/urban/business-layer-notice-attachments.csv";
const ORIGINAL_NOTICE_PROBES_INPUT = "data/urban/original-notice-file-probes.csv";
const GWANGJIN_GU_NOTICE_INPUT = "data/urban/gwangjin-gu-notice-candidates.json";
const GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT = "data/urban/gwangjin-gu-notice-attachments.csv";
const URBAN_NOTICE_TEXT_MANIFEST_INPUT = "data/urban/text/notice-text-manifest.csv";
const URBAN_NOTICE_KEY_FIELDS_INPUT = "data/urban/text/notice-key-fields.csv";
const GWANGJIN_GU_TEXT_MANIFEST_INPUT = "data/urban/text/gwangjin-gu-notice-text-manifest.csv";
const GWANGJIN_GU_KEY_FIELDS_INPUT = "data/urban/text/gwangjin-gu-notice-key-fields.csv";
const MARKET_AREAS_INPUT = "data/market/project-market-areas.json";
const TRANSPORT_CONTEXT_INPUT = "analysis/transport-location-context.json";
const PROJECT_RISK_SIGNAL_INPUT = "analysis/project-risk-signal-summary.json";
const CLEANUP_BOARD_REVIEW_QUEUE_INPUT = "analysis/cleanup-board-review-queue.json";
const BUSINESS_LAYER_INPUT = "data/urban/map-missing-business-layer-details.json";
const MANAGEMENT_DOCS_INPUT = "data/cleanup/management-stage-doc-links.json";
const MANAGEMENT_VALUE_RESOLUTION_INPUT = "analysis/management-stage-value-resolution.json";
const GWANGJIN_STAGE_DOCS_INPUT = "data/cleanup/gwangjin-stage-public-docs.json";
const HANYANGGARO_GWANGJIN_SOURCE_PAGES_INPUT = "data/urban/gwangjin-gu-hanyanggaro-source-pages.json";
const SEOUL_SIBO_ORIGINAL_NOTICE_INPUT = "data/urban/seoul-sibo-original-notice-sources.json";
const OCR_IMAGE_REVIEW_DECISIONS_INPUT = "data/review/ocr-image-review-decisions.json";
const SOURCE_VALUE_UPDATE_CANDIDATES_INPUT = "analysis/source-value-update-candidates.json";
const FOCUS_DEEP_DIVE_QUEUE_INPUT = "analysis/focus-deep-dive-queue.json";
const PUBLIC_CATALYST_MAP_INPUT = "analysis/public-development-catalyst-map.json";
const VALUE_OVERRIDES_INPUT = "data/review/project-comparison-value-overrides.json";
const STAGE_DATE_OVERRIDES_INPUT = "data/review/stage-date-overrides.json";
const OUT_DIR = "project-notes";

const NEXT_STAGE = new Map([
  ["정비계획 수립", "정비구역지정"],
  ["안전진단", "정비계획 수립 또는 정비구역지정"],
  ["안전진단(1차)", "안전진단 통과 여부"],
  ["정비구역지정", "추진위원회승인 또는 조합설립인가"],
  ["추진위원회승인", "조합설립인가"],
  ["조합설립인가", "사업시행인가"],
  ["사업시행인가", "관리처분인가"],
  ["관리처분인가", "이주·철거·착공"],
  ["착공", "분양·준공"],
  ["분양", "준공인가"],
  ["도시계획심의", "심의 결과와 인허가 후속 단계"],
  ["지구단위계획수립/건축심의/교통심의", "심의 결과와 사업계획 확정"],
]);

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

function slugify(value) {
  return String(value || "project")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

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

function nextStageFor(stage) {
  return NEXT_STAGE.get(stage) ?? "공식 사업장 문서에서 다음 행정 절차 확인";
}

function primaryTextPath(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .find(Boolean) || "";
}

function normalizeCompactNoticeNo(value) {
  const text = String(value || "").replace(/\s+/g, "");
  const match = text.match(/(\d{4})-(\d+)/);
  return match ? `${match[1]}-${match[2]}` : "";
}

function looksLikeOfficialNoticeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  return /UpisArchive\/DATA\/PM\/pdf\/|view\/ntfc\/mapForm\.pop\?noticeCode=|\/bbs\/B\d+\/view\.do\?nttId=|selectGosi/i.test(text);
}

function hanyanggaroSourceNoticeNo(row) {
  const byId = {
    "6031295": "2023-4",
    "6171163": "2023-1215",
    "6186353": "2023-115",
    "6209808": "2024-372",
    "6213254": "2024-449",
  };
  return byId[String(row?.id || "")] || normalizeCompactNoticeNo(row?.notice_no);
}

function fallbackGwangjinSourceRows(rows) {
  return rows
    .filter((row) => row.text_path)
    .map((row) => ({
      rank: "25",
      search_status: "candidate",
      match_confidence: "high",
      board_id: "B0000003",
      board_notice_id: String(row.id || ""),
      notice_title: row.label || row.title || "",
      notice_no: hanyanggaroSourceNoticeNo(row),
      notice_date: String(row.notice_date || "").trim(),
      attachment_count: hanyanggaroSourceNoticeNo(row) === "2023-115" ? 1 : 0,
      official_url: row.url || "",
      local_html_path: row.html_path || "",
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
      page_count: "",
      text_char_count: Number(row.text_char_count || 0),
      extraction_status: "extracted",
      extraction_error: "",
    }));
}

function primaryHanyanggaroSourceRow(rows, row = {}) {
  const normalizedNoticeNo = normalizeCompactNoticeNo(row.notice_no);
  return (
    rows.find((item) => hanyanggaroSourceNoticeNo(item) === normalizedNoticeNo) ||
    rows.find((item) => String(item.id || "") === "6186353") ||
    rows.find((item) => item.text_path) ||
    null
  );
}

function fallbackNoticeDetail(row, sourceRows) {
  if (row.has_notice_detail !== "Y") return null;
  const noticeFileName = row.local_notice_file ? path.basename(row.local_notice_file) : "";
  const overrideNoticeUrl = looksLikeOfficialNoticeUrl(row.stage_date_override_url)
    ? row.stage_date_override_url
    : looksLikeOfficialNoticeUrl(row.value_override_source_url)
      ? row.value_override_source_url
      : "";
  const baseDetail = {
    notice_no: row.notice_no || "",
    notice_date: row.notice_date || "",
    notice_title: row.notice_title || "",
    notice_dept_name: "",
    notice_file_name: noticeFileName,
    notice_file_url: overrideNoticeUrl,
    attachment_count: row.gwangjin_gu_notice_attachment_count || "",
    drawing_image_count: "",
    map_form_url: overrideNoticeUrl,
  };

  if (String(row.rank) !== "25") {
    if (!baseDetail.notice_no && !baseDetail.notice_date && !baseDetail.notice_title && !baseDetail.notice_file_name) return null;
    return baseDetail;
  }

  const sourceRow = primaryHanyanggaroSourceRow(sourceRows, row);
  if (!sourceRow && !baseDetail.notice_no && !baseDetail.notice_title && !baseDetail.notice_file_name) return null;
  return {
    ...baseDetail,
    notice_no: baseDetail.notice_no || hanyanggaroSourceNoticeNo(sourceRow) || "",
    notice_date: baseDetail.notice_date || sourceRow?.notice_date || "",
    notice_title: baseDetail.notice_title || sourceRow?.label || sourceRow?.title || "",
    notice_dept_name: sourceRow ? "광진구 주거사업과" : "",
    notice_file_url: baseDetail.notice_file_url || sourceRow?.url || "",
    map_form_url: baseDetail.map_form_url || sourceRow?.url || "",
  };
}

function fallbackNoticeAttachments(row) {
  if (!row.local_notice_file) return [];
  return [
    {
      attachment_type: "notice_file",
      local_path: row.local_notice_file,
      sha256: "",
      download_status: "already_exists",
    },
  ];
}

function numericTextCharCount(row) {
  return Number.parseInt(String(row?.text_char_count || "0").replace(/[^0-9-]/g, ""), 10) || 0;
}

function selectTextManifestForRow(rows, row) {
  const textPath = primaryTextPath(row.text_path);
  if (textPath) return rows.find((item) => item.text_path === textPath) || null;
  if (row.local_notice_file) return rows.find((item) => item.source_file === row.local_notice_file) || null;
  const rankRows = rows.filter((item) => String(item.rank || "") === String(row.rank || "") && (item.source_file || item.text_path));
  if (!rankRows.length) return null;
  for (const noticeCode of [row.business_notice_code, row.notice_code].filter(Boolean)) {
    const matched = rankRows.find((item) => item.notice_code === noticeCode);
    if (matched) return matched;
  }
  return (
    [...rankRows].sort((a, b) => {
      const extractionDelta = numericTextCharCount(b) - numericTextCharCount(a);
      if (extractionDelta !== 0) return extractionDelta;
      return String(b.notice_date || "").localeCompare(String(a.notice_date || ""));
    })[0] || null
  );
}

function selectKeyFields(rows, textPath) {
  if (!textPath) return {};
  return rows.find((row) => row.text_path === textPath) || {};
}

function textManifestFromRow(row) {
  const textPath = primaryTextPath(row.text_path);
  if (!textPath && !row.notice_text_extraction_status) return null;
  return {
    extraction_status: row.notice_text_extraction_status || "",
    text_path: textPath,
    page_count: "",
    text_char_count: row.text_char_count || row.gwangjin_gu_notice_text_char_count || "",
    extraction_error: "",
  };
}

function sourceStatus(row, urbanDetail, noticeDetail, noticeAttachments, marketArea) {
  const status = [];
  const effectiveMapUrl = row.official_map_url || urbanDetail?.official_map_url || "";
  const downloadedAttachments = noticeAttachments.filter((attachment) => attachment.local_path).length;
  status.push(row.official_project_url ? "정비사업 정보몽땅 사업장 URL 확보" : "정비사업 정보몽땅 사업장 URL 미확인");
  status.push(effectiveMapUrl ? "서울도시공간포털 지도 URL 확보" : "지도 URL 미확인, 대표지번 검색 필요");
  status.push(urbanDetail?.urban_notice_url ? "서울도시공간포털 고시 URL 확보" : "고시 URL 미확인");
  status.push(noticeDetail?.notice_file_url ? "서울도시공간포털 고시 원문 파일 URL 확보" : "고시 원문 파일 URL 미확인");
  status.push(downloadedAttachments > 0 ? `서울도시공간포털 첨부 로컬 저장 완료 ${downloadedAttachments}건` : "서울도시공간포털 첨부 로컬 저장 미완료");
  status.push(marketArea?.market_data_status === "ready_for_api_key" ? "실거래/R-ONE 공식 원자료 수집·정규화 완료, 사업장 매칭 검수 필요" : "실거래/R-ONE 지표 미연결");
  return status;
}

function selectedMenuLinks(links) {
  const preferred = [
    "사업개요",
    "추진경과",
    "정비계획 수립 및 구역지정",
    "구역지정 결정 및 변경 결정에 따른 기본도면",
    "신속통합기획",
    "설계지침",
    "조합설립인가",
    "사업시행계획서(인가)",
    "관리처분계획서(인가)",
    "확정된 사업비 및 분담금 목록",
    "공지사항",
    "조합입찰공고",
  ];
  const byLabel = new Map();
  for (const link of links) {
    if (link.url && !byLabel.has(link.label)) byLabel.set(link.label, link.url);
  }
  return preferred.filter((label) => byLabel.has(label)).map((label) => ({ label, url: byLabel.get(label) }));
}

function menuLinksSection(links) {
  const selected = selectedMenuLinks(links);
  if (selected.length === 0) {
    return "## 사업장 내부 메뉴\n\n- 내부 메뉴 링크: 미수집\n\n";
  }
  return `## 사업장 내부 메뉴\n\n${selected.map((link) => `- ${link.label}: ${link.url}`).join("\n")}\n\n`;
}

function urbanDetailSection(urbanDetail) {
  if (!urbanDetail) {
    return "## 서울도시공간포털 매칭\n\n- 매칭 상태: 미수집\n\n";
  }
  if (urbanDetail.match_status === "missing_map_url") {
    return "## 서울도시공간포털 매칭\n\n- 매칭 상태: 지도 URL 없음, 대표지번 검색 필요\n\n";
  }
  if (urbanDetail.match_status !== "matched") {
    return `## 서울도시공간포털 매칭\n\n- 매칭 상태: ${urbanDetail.match_status || "미확인"}\n\n`;
  }
  return `## 서울도시공간포털 매칭

| 항목 | 값 |
| --- | --- |
| 매칭 그룹 | ${valueOrUnknown(urbanDetail.urban_group)} |
| 구역명 | ${valueOrUnknown(urbanDetail.urban_zone_name)} |
| 위치 | ${valueOrUnknown(urbanDetail.urban_location_name)} |
| 기록 유형 | ${valueOrUnknown(urbanDetail.urban_record_type_name)} |
| 최초 고시 정보 | ${valueOrUnknown(urbanDetail.urban_first_date_info)} |
| 고시 제목 | ${valueOrUnknown(urbanDetail.urban_notice_title)} |
| 고시 코드 | ${valueOrUnknown(urbanDetail.urban_notice_code)} |
| 고시 URL | ${valueOrUnknown(urbanDetail.urban_notice_url)} |
| 지도 URL 출처 | ${valueOrUnknown(urbanDetail.official_map_url_source)} |
| 대표지번 매칭 신뢰도 | ${valueOrUnknown(urbanDetail.representative_lot_map_confidence)} |
| 대표지번 매칭 구역명 | ${valueOrUnknown(urbanDetail.representative_lot_zone_name)} |
| 면적 변경 전 | ${valueOrUnknown(urbanDetail.urban_area_prev)} |
| 면적 변경 | ${valueOrUnknown(urbanDetail.urban_area_change)} |
| 면적 변경 후 | ${valueOrUnknown(urbanDetail.urban_area_after)} |
| 설명 | ${valueOrUnknown(urbanDetail.urban_description)} |

`;
}

function urbanNoticeSection(noticeDetail, noticeAttachments) {
  if (!noticeDetail) {
    return "## 고시 상세 원문\n\n- 수집 상태: 미수집\n\n";
  }
  const localNoticeFile = noticeAttachments.find((attachment) => attachment.attachment_type === "notice_file" && attachment.local_path);
  const downloadedCount = noticeAttachments.filter((attachment) => attachment.local_path).length;
  const failedCount = noticeAttachments.filter((attachment) => attachment.download_status === "failed").length;

  return `## 고시 상세 원문

| 항목 | 값 |
| --- | --- |
| 고시번호 | ${valueOrUnknown(noticeDetail.notice_no)} |
| 고시일 | ${valueOrUnknown(noticeDetail.notice_date)} |
| 고시유형 | ${valueOrUnknown(noticeDetail.notice_classify)} |
| 고시 제목 | ${valueOrUnknown(noticeDetail.notice_title)} |
| 소관 | ${valueOrUnknown(noticeDetail.notice_dept_name || noticeDetail.notice_organ_name)} |
| 계획안 위치 | ${valueOrUnknown(noticeDetail.plan_location)} |
| 계획안 결정일 | ${valueOrUnknown(noticeDetail.plan_decision_date)} |
| 원문 파일명 | ${valueOrUnknown(noticeDetail.notice_file_name)} |
| 고시 원문 파일 | ${valueOrUnknown(noticeDetail.notice_file_url)} |
| 로컬 고시 원문 | ${valueOrUnknown(localNoticeFile?.local_path)} |
| 로컬 고시 원문 SHA-256 | ${valueOrUnknown(localNoticeFile?.sha256)} |
| 첨부 파일 수 | ${valueOrUnknown(noticeDetail.attachment_count)} |
| 결정도 이미지 수 | ${valueOrUnknown(noticeDetail.drawing_image_count)} |
| 로컬 저장 첨부 수 | ${downloadedCount} |
| 다운로드 실패 수 | ${failedCount} |
| 고시 열람 팝업 | ${valueOrUnknown(noticeDetail.map_form_url)} |

첨부 파일 전체 목록은 \`data/urban/urban-notice-attachments-priority-candidates.csv\`와 \`data/urban/business-layer-notice-attachments.csv\`에서 확인한다.

`;
}

function businessLayerSection(row, businessLayer, businessNotice, seoulSiboOriginalNotices = []) {
  const fallbackOnly =
    !businessLayer && ["representative_lot_fallback", "manual_fallback_confirmation"].includes(row?.business_layer_source_basis || "");
  if (!businessLayer && !fallbackOnly) {
    return "";
  }
  const hasSeoulSiboOriginal = seoulSiboOriginalNotices.some((row) => row.local_pdf);
  const nextAction =
    hasSeoulSiboOriginal
      ? "서울시보 본고시 fact-check 기준으로 구역면적·세대수·용적률·기반시설 수치 대조"
      : row.business_layer_alignment_status === "planning_layer_possible"
        ? "현재 presentSn가 신속통합기획/계획 레이어인지 먼저 확인하고, 재건축 current business presentSn 또는 direct 고시를 별도로 찾는다"
      : row.business_layer_alignment_status === "representative_lot_fallback_only"
        ? "대표지번 매칭 후보만 확인됐고 current business presentSn는 비어 있으므로 UQ120 상세 레이어 기준일·식별자를 별도 확인한다"
      : row.business_layer_alignment_status === "type_mismatch" || row.business_layer_alignment_status === "stage_mismatch"
        ? "사업 레이어 유형·단계와 현재 사업 단계가 왜 다른지 확인하고 current business presentSn인지 재판정"
      : row.business_layer_alignment_status === "stage_ahead_of_matrix"
        ? "사업 레이어 단계 선행이 최신 공식 단계 반영인지, 비교표 단계가 늦은지 추가 확인"
      : row.business_layer_alignment_status === "aligned_but_low_confidence"
        ? "presentSn 후보는 보조 식별자로 두고, direct 고시·정보몽땅 연결 또는 추가 공식 링크로 current business 여부 확인"
      : businessNotice?.notice_file_name?.includes("정정")
      ? "정정고시 확인됨, 본고시 원문/recordCode 확보 후 수치 대조"
      : businessNotice
        ? "보강 고시 원문 텍스트 대조 후 recordCode 확정/승격"
        : row.business_layer_next_action || businessLayer?.next_action;
  const sourceBusinessLayer = businessLayer || {
    match_status:
      row.business_layer_source_basis === "manual_fallback_confirmation"
        ? "manual_confirmed_current_business"
        : "representative_lot_business_layer_fallback",
    match_confidence: row.business_layer_match_confidence,
    present_sn: row.business_present_sn,
    layer_zone_name: row.business_layer_zone_name,
    layer_area_sqm: row.business_layer_area_sqm,
    urban_business_name: row.business_layer_zone_name,
    urban_business_type_group:
      row.business_layer_type_group || (row.business_layer_source_basis === "manual_fallback_confirmation" ? "정비사업" : "대표지번 후보"),
    urban_business_type: row.business_layer_type,
    urban_propel_name: row.business_layer_stage,
    urban_data_reference_date: row.business_layer_data_reference_date,
    cleanup_site_url: row.business_layer_cleanup_url,
    building_far_pct: "",
    building_coverage_pct: "",
    building_floor: "",
    supply_households: "",
    rental_households: "",
    propel_history: "",
    review_note:
      row.business_layer_review_note ||
      (row.business_layer_map_url_candidate ? `대표지번 map 후보 URL: ${row.business_layer_map_url_candidate}` : "대표지번 매칭 후보만 확인됨"),
  };
  return `## 서울도시공간포털 사업구역 레이어 보강

| 항목 | 값 |
| --- | --- |
| 매칭 상태 | ${valueOrUnknown(sourceBusinessLayer.match_status)} |
| 매칭 신뢰도 | ${valueOrUnknown(sourceBusinessLayer.match_confidence)} |
| presentSn | ${valueOrUnknown(sourceBusinessLayer.present_sn)} |
| 레이어 구역명 | ${valueOrUnknown(sourceBusinessLayer.layer_zone_name)} |
| 레이어 면적 | ${valueOrUnknown(sourceBusinessLayer.layer_area_sqm)}㎡ |
| 포털 사업명 | ${valueOrUnknown(sourceBusinessLayer.urban_business_name)} |
| 포털 사업유형 | ${valueOrUnknown(sourceBusinessLayer.urban_business_type_group)} / ${valueOrUnknown(sourceBusinessLayer.urban_business_type)} |
| 포털 단계 | ${valueOrUnknown(sourceBusinessLayer.urban_propel_name)} |
| 데이터 기준일 | ${valueOrUnknown(sourceBusinessLayer.urban_data_reference_date)} |
| 정보몽땅 연결 | ${valueOrUnknown(sourceBusinessLayer.cleanup_site_url)} |
| 대표지번 map recordCode | ${valueOrUnknown(row.business_layer_record_code_candidate)} |
| 대표지번 map URL | ${valueOrUnknown(row.business_layer_map_url_candidate)} |
| 정합성 상태 | ${valueOrUnknown(row.business_layer_alignment_status)} |
| 정합성 메모 | ${valueOrUnknown(row.business_layer_alignment_note)} |
| 수동 확인일 | ${valueOrUnknown(row.business_layer_manual_review_date)} |
| 수동 확인상태 | ${valueOrUnknown(row.business_layer_manual_review_status)} |
| 수동 확인 근거 URL | ${valueOrUnknown(row.business_layer_manual_evidence_url)} |
| 수동 확인 메모 | ${valueOrUnknown(row.business_layer_manual_decision_note)} |
| 공급 세대수 | ${valueOrUnknown(sourceBusinessLayer.supply_households)} |
| 임대 세대수 | ${valueOrUnknown(sourceBusinessLayer.rental_households)} |
| 용적률/건폐율 | ${valueOrUnknown(sourceBusinessLayer.building_far_pct)}% / ${valueOrUnknown(sourceBusinessLayer.building_coverage_pct)}% |
| 층수 | ${valueOrUnknown(sourceBusinessLayer.building_floor)} |
| 추진 이력 | ${valueOrUnknown(sourceBusinessLayer.propel_history)} |
| 판정 메모 | ${valueOrUnknown(sourceBusinessLayer.review_note)} |
| 다음 작업 | ${valueOrUnknown(nextAction)} |

주의: 이 섹션은 서울도시공간포털 사업구역 레이어 기반 보강이다. \`WTNNC_SN/NTFC_SN\`이 없는 사업은 결정고시 recordCode와 고시 원문을 별도로 확인해야 한다.

`;
}

function originalNoticeProbeSection(probeRows, seoulSiboOriginalNotices = []) {
  if (!probeRows.length && !seoulSiboOriginalNotices.length) {
    return "";
  }
  const found = probeRows.filter((row) => row.looks_like_pdf === "Y");
  const siboFound = seoulSiboOriginalNotices.filter((row) => row.local_pdf);
  const statusSummary = siboFound.length
    ? "서울시보 본고시 원문 확보"
    : found.length > 0
      ? `PDF 후보 ${found.length}건 확인`
      : "현재 파일명 후보에서는 PDF 원문 미확인";
  return `## 본고시 원문 탐색 로그

| 항목 | 값 |
| --- | --- |
| 탐색 상태 | ${statusSummary} |
| probe 수 | ${probeRows.length} |
| 결과 파일 | data/urban/original-notice-file-probes.csv |
| 서울시보 원문 | ${siboFound.map((row) => row.local_pdf).join("; ") || "미확인"} |
| 서울시보 OCR 텍스트 | ${siboFound.map((row) => row.ocr_text).join("; ") || "미확인"} |

${
  siboFound.length
    ? "`analysis/seoul-sibo-original-notice-fact-check.md`에서 본고시 수치 대조 결과를 확인한다."
    : found.length > 0
      ? "PDF로 확인된 후보가 있으므로 내려받아 본고시 수치와 정정고시 수치를 대조한다."
      : "서울도시공간포털 상세 API와 같은 첨부 폴더의 일반 파일명 후보에서는 본고시 PDF가 아직 확인되지 않았다. 서울시보 원문, 토지이용규제정보서비스, 정보몽땅 공개자료를 다음 확인 경로로 둔다."
}

`;
}

function textExtractionSection(textManifest, keyFields) {
  if (!textManifest) {
    return "## 원문 텍스트 추출\n\n- 추출 상태: 미수집\n\n";
  }

  return `## 원문 텍스트 추출

| 항목 | 값 |
| --- | --- |
| 추출 상태 | ${valueOrUnknown(textManifest.extraction_status)} |
| 텍스트 파일 | ${valueOrUnknown(textManifest.text_path)} |
| 페이지 수 | ${valueOrUnknown(textManifest.page_count)} |
| 텍스트 글자 수 | ${valueOrUnknown(textManifest.text_char_count)} |
| 추출 오류 | ${valueOrUnknown(textManifest.extraction_error)} |
| 키워드 추출 테이블 | data/urban/text/notice-key-fields.csv |

### 1차 키워드 값

| 항목 | 값 |
| --- | --- |
| 정비구역/면적 관련 | ${valueOrUnknown(keyFields?.district_area_values)} |
| 용적률 관련 | ${valueOrUnknown(keyFields?.floor_area_ratio_values)} |
| 건폐율 관련 | ${valueOrUnknown(keyFields?.building_coverage_ratio_values)} |
| 세대수 관련 | ${valueOrUnknown(keyFields?.households_values)} |
| 권리산정기준일 관련 | ${valueOrUnknown(keyFields?.right_calculation_date_values)} |
| 층수/높이 관련 | ${valueOrUnknown(keyFields?.height_floors_values)} |
| 기반시설 관련 | ${valueOrUnknown(keyFields?.infrastructure_values)} |
| 공공기여 관련 | ${valueOrUnknown(keyFields?.public_contribution_values)} |

주의: 위 값은 원문 주변 문맥에서 숫자를 자동 추출한 1차 후보이므로 최종 수치로 쓰기 전에 원문과 스니펫을 대조한다.

`;
}

function marketDataSection(marketArea) {
  if (!marketArea) {
    return "## 시장 데이터 연결\n\n- 연결 상태: 미수집\n\n";
  }

  return `## 시장 데이터 연결

| 항목 | 값 |
| --- | --- |
| 법정동 코드 | ${valueOrUnknown(marketArea.emd_cd)} |
| 실거래 지역코드 | ${valueOrUnknown(marketArea.lawd_cd)} |
| 거래 추적 단위 | ${valueOrUnknown(marketArea.transaction_scope)} |
| 우선 자산유형 | ${valueOrUnknown(marketArea.preferred_asset_types)} |
| 대상 단지/구역 키워드 | ${valueOrUnknown(marketArea.target_complex_keywords)} |
| 비교 생활권 키워드 | ${valueOrUnknown(marketArea.peer_area_keywords)} |
| 서울 열린데이터 필터 | ${valueOrUnknown(marketArea.seoul_open_data_filter)} |
| 국토부 실거래 조회 키 | ${valueOrUnknown(marketArea.molit_rtms_query_keys)} |
| R-ONE 지역 | ${valueOrUnknown(marketArea.r_one_regions)} |
| R-ONE 지표 | ${valueOrUnknown(marketArea.r_one_indicators)} |
| 원자료 수집 계획 | \`data/market/market-fetch-plan.csv\`에서 rank=${valueOrUnknown(marketArea.rank)} 필터 |
| 시장 데이터 상태 | ${valueOrUnknown(marketArea.market_data_status)} |

첫 질문: ${valueOrUnknown(marketArea.first_market_questions)}

`;
}

function deepDiveQueueSection(deepDive, catalystRows = []) {
  if (!deepDive) {
    return "## 딥다이브 판단 큐\n\n- 연결 상태: `analysis/focus-deep-dive-queue.csv` 생성 후 확인\n\n";
  }
  const catalystTableRows = catalystRows.length
    ? catalystRows
        .slice()
        .sort((a, b) => Number(b.catalyst_priority_score || 0) - Number(a.catalyst_priority_score || 0))
        .map(
          (row) =>
            `| ${valueOrUnknown(row.catalyst_name)} | ${valueOrUnknown(row.catalyst_priority_score)} | ${valueOrUnknown(row.official_documents_to_check)} | ${valueOrUnknown(row.official_sources)} | ${valueOrUnknown(row.interpretation_rule)} |`,
        )
        .join("\n")
    : "| 미확인 | 미확인 | 미확인 | 미확인 | 미확인 |";

  return `## 딥다이브 판단 큐

| 항목 | 값 |
| --- | --- |
| 딥다이브 트랙 | ${valueOrUnknown(deepDive.deep_dive_track)} |
| 딥다이브 우선점수 | ${valueOrUnknown(deepDive.deep_dive_priority_score)} |
| 핵심 질문 | ${valueOrUnknown(deepDive.deep_dive_question)} |
| 장기 가능성 / 확신도 | ${valueOrUnknown(deepDive.long_term_potential_score)} / ${valueOrUnknown(deepDive.confidence_score)} |
| 리스크 레벨 | ${valueOrUnknown(deepDive.risk_signal_level)} |
| 원문 병목 | ${valueOrUnknown(deepDive.source_blockers)} |
| 이번 액션 | ${valueOrUnknown(deepDive.recommended_move)} |
| 먼저 열 자료 | ${valueOrUnknown(deepDive.first_source_to_open)} |
| 재평가 트리거 | ${valueOrUnknown(deepDive.revisit_trigger)} |
| 딥다이브 큐 | analysis/focus-deep-dive-queue.csv에서 rank=${valueOrUnknown(deepDive.rank)} 필터 |

### 시장·교통·공공 촉매

| 항목 | 값 |
| --- | --- |
| 시장 거래 표본 | ${valueOrUnknown(deepDive.market_unique_transactions)}건 |
| 매매/전월세 표본 | ${valueOrUnknown(deepDive.market_trade_transactions)} / ${valueOrUnknown(deepDive.market_rent_transactions)} |
| 최신 거래일 | ${valueOrUnknown(deepDive.market_latest_deal_ymd)} |
| 중위 매매가 | ${valueOrUnknown(deepDive.median_trade_amount_manwon)}만원 |
| 중위 ㎡당 매매가 | ${valueOrUnknown(deepDive.median_trade_price_per_sqm_manwon)}만원 |
| 중위 전세보증금 | ${valueOrUnknown(deepDive.median_rent_deposit_manwon)}만원 |
| 시장 표본 주의 | ${valueOrUnknown(deepDive.market_review_note)} |
| 자율주행/교통 시나리오 | ${valueOrUnknown(deepDive.av_scenario)} |
| 현장·교통 확인 | ${valueOrUnknown(deepDive.av_observation_focus)} |
| 공공 촉매 | ${valueOrUnknown(deepDive.catalysts)} |
| 촉매 확인 원문 | ${valueOrUnknown(deepDive.catalyst_documents)} |

### 공공 촉매별 확인 원문

| 공공 촉매 | 점수 | 확인 원문 | 공식 출처 | 해석 규칙 |
| --- | ---: | --- | --- | --- |
${catalystTableRows}

주의: 시장 신호는 법정동·키워드 기반 비교군이며 개별 단지 확정값이 아니다. 공공 촉매는 보도자료가 아니라 고시·계획·교통대책·심의/결재 원문으로 확인될 때만 판단을 바꾼다.

`;
}

function managementDocsSection(rows) {
  if (!rows?.length) {
    return "";
  }
  const publicRows = rows.filter((row) => row.access_status === "public_table_extracted");
  const wctRows = rows.filter((row) => row.source_type === "정보몽땅_분담금목록");
  const itemRows = publicRows.map((row) => {
    const dateBits = [
      row.application_date ? `신청 ${row.application_date}` : "",
      row.approval_date ? `인가 ${row.approval_date}` : "",
      row.notice_date ? `고시 ${row.notice_date}` : "",
      row.business_enforcement_date ? `사업시행 ${row.business_enforcement_date}` : "",
    ].filter(Boolean).join("; ");
    const valueBits = [
      row.total_units ? `총 ${row.total_units}` : "",
      row.sale_units ? `분양 ${row.sale_units}` : "",
      row.rental_units ? `임대 ${row.rental_units}` : "",
      row.floor_area_ratio ? `용적률 ${row.floor_area_ratio}` : "",
      row.construction_cost ? `공사비 ${row.construction_cost}원` : "",
    ].filter(Boolean).join("; ");
    return `| ${row.item_no} | ${row.category_group} | ${row.document_title || row.item_label} | ${dateBits || "미확인"} | ${valueBits || "미확인"} |`;
  });
  const placeholderCount = rows.filter((row) => row.access_status === "no_public_table_placeholder").length;
  const wctList = wctRows.length
    ? wctRows.map((row) => `- ${row.document_title}: ${row.notice_date}`).join("\n")
    : "- 분담금 목록 공개항목: 미확인";
  return `## 사업시행·관리처분 공개항목

| 항목번호 | 분류 | 문서명 | 주요 일자 | 주요 수치 |
| --- | --- | --- | --- | --- |
${itemRows.length ? itemRows.join("\n") : "| 미확인 | 미확인 | 공개표 미확인 | 미확인 | 미확인 |"}

- 공개표 추출 항목: ${publicRows.length}건
- 공개표 미확인/자리표시 항목: ${placeholderCount}건
- 원본 HTML 스냅샷: \`data/cleanup/management-stage-html/\`

### 분담금 목록

${wctList}

주의: 분담금 목록은 공개된 목록명과 일자만 저장했다. 개인별 조회나 권리자별 상세자료는 수집하지 않는다.

`;
}

function managementValueResolutionSection(rows) {
  if (!rows?.length) {
    return "";
  }
  const itemRows = rows.map((row) => {
    return `| ${row.field_label} | ${valueOrUnknown(row.current_summary_value)} | ${valueOrUnknown(row.notice_value)} | ${valueOrUnknown(row.public_stage_value)} | ${row.resolution_status} | ${row.recommended_recording} |`;
  });
  return `## 관리처분 단계 수치 시점 해소

| 필드 | 사업개요/현재값 | 고시문 값 | 공개항목 값 | 해석 상태 | 기록 방식 |
| --- | --- | --- | --- | --- | --- |
${itemRows.join("\n")}

- 구조화 장부: \`analysis/management-stage-value-resolution.csv\`에서 rank=${valueOrUnknown(rows[0]?.rank)} 필터
- 원문 대조 근거: \`analysis/management-stage-fact-check.md\`

주의: 시점차가 있는 수치는 하나로 덮어쓰지 않고 고시 시점, 사업시행 공개항목, 관리처분 공개항목을 분리해 기록한다.

`;
}

function gwangjinStageDocsSection(rows) {
  if (!rows?.length) {
    return "";
  }
  const itemRows = rows.map((row) => {
    const dateBits = [
      row.application_date ? `신청 ${row.application_date}` : "",
      row.approval_date ? `인가/승인 ${row.approval_date}` : "",
    ].filter(Boolean).join("; ");
    const valueBits = [
      row.landowner_count ? `토지등소유자 ${row.landowner_count}` : "",
      row.union_member_count ? `조합원 ${row.union_member_count}` : "",
      row.consenter_count ? `동의자 ${row.consenter_count}` : "",
      row.consent_rate_pct ? `동의율 ${row.consent_rate_pct}` : "",
    ].filter(Boolean).join("; ");
    return `| ${row.item_no} | ${row.category_group} | ${row.document_title || row.item_label} | ${dateBits || "미확인"} | ${valueBits || "미확인"} |`;
  });
  return `## 조합설립·추진위 공개항목

| 항목번호 | 분류 | 문서명 | 주요 일자 | 동의/구성 수치 |
| --- | --- | --- | --- | --- |
${itemRows.join("\n")}

- 원본 HTML 스냅샷: \`data/cleanup/gwangjin-stage-html/\`
- 구조화 데이터: \`data/cleanup/gwangjin-stage-public-docs.csv\`

주의: 공개항목 원본 HTML에는 운영자명이나 사무소 소재지 같은 운영 정보가 포함될 수 있으나, 이 메모에는 단계·동의율 필드만 반영한다.

`;
}

function stageDateReviewSection(row) {
  if (!row?.stage_date_override_note && !row?.stage_date_override_review) {
    return "";
  }
  return `## 단계일자 판정 메모

| 항목 | 값 |
| --- | --- |
| 기준 출처 | ${valueOrUnknown(row.stage_date_override_source)} |
| 확인 URL | ${valueOrUnknown(row.stage_date_override_url)} |
| 판정 메모 | ${valueOrUnknown(row.stage_date_override_note)} |
| 검토 문서 | ${valueOrUnknown(row.stage_date_override_review)} |

`;
}

function gwangjinGuNoticeSection(rows, attachmentRows) {
  const candidates = rows?.filter((row) => row.search_status === "candidate" && row.match_confidence === "high") || [];
  if (!candidates.length) {
    return "";
  }
  const attachmentCountByNotice = attachmentRows.reduce((acc, row) => {
    const key = String(row.board_notice_id || "");
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + (row.local_path ? 1 : 0);
    return acc;
  }, {});
  const tableRows = candidates.map((row) => {
    const attachmentCount = attachmentCountByNotice[String(row.board_notice_id)] || row.attachment_count || 0;
    return `| ${row.board_label || row.board_id} | ${row.notice_title} | ${row.notice_no || "미확인"} | ${row.notice_date || "미확인"} | ${attachmentCount} | ${row.official_url || "미확인"} |`;
  });
  return `## 광진구청 고시공고 후보

| 게시판 | 제목 | 번호 | 등록일 | 첨부 | URL |
| --- | --- | --- | --- | ---: | --- |
${tableRows.join("\n")}

- 구조화 데이터: \`data/urban/gwangjin-gu-notice-candidates.csv\`
- 첨부 manifest: \`data/urban/gwangjin-gu-notice-attachments.csv\`

주의: 상세 HTML에는 담당자 연락처나 운영 정보가 포함될 수 있으나, 이 메모에는 공고 식별과 첨부 확인에 필요한 필드만 반영한다.

`;
}

function transportContextSection(transportContext) {
  if (!transportContext) {
    return "## 교통입지·생활권 컨텍스트\n\n- 연결 상태: `analysis/transport-location-context.csv` 생성 후 확인\n\n";
  }

  return `## 교통입지·생활권 컨텍스트

| 항목 | 값 |
| --- | --- |
| 교통축 | ${valueOrUnknown(transportContext.mobility_axis)} |
| 노선/수단 | ${valueOrUnknown(transportContext.primary_lines)} |
| 변화 동인 | ${valueOrUnknown(transportContext.urban_change_drivers)} |
| 입지맥락 점수 | ${valueOrUnknown(transportContext.location_context_score)} |
| 장기 가설 | ${valueOrUnknown(transportContext.long_term_thesis)} |
| 교통/생활권 리스크 | ${valueOrUnknown(transportContext.mobility_risks)} |
| 자율주행 민감도 | ${valueOrUnknown(transportContext.autonomous_vehicle_sensitivity)} |
| 현장 확인 | ${valueOrUnknown(transportContext.fieldwork_checks)} |
| 공식 확인 출처 | ${valueOrUnknown(transportContext.official_sources_to_check)} |
| 다음 교통입지 확인 | ${valueOrUnknown(transportContext.next_transport_action)} |
| 비교 매트릭스 | analysis/transport-location-context.csv에서 rank=${valueOrUnknown(transportContext.rank)} 필터 |

`;
}

function projectRiskSignalSection(riskSignal, boardReviewRows) {
  if (!riskSignal) {
    return "## 사업장별 리스크 신호\n\n- 연결 상태: `analysis/project-risk-signal-summary.csv` 생성 후 확인\n\n";
  }
  const topRows = boardReviewRows
    .slice()
    .sort((a, b) => {
      const priorityCompare = String(a.review_priority || "").localeCompare(String(b.review_priority || ""));
      if (priorityCompare !== 0) return priorityCompare;
      return Number(b.signal_score || 0) - Number(a.signal_score || 0);
    })
    .slice(0, 5);
  const topItems = topRows.length
    ? topRows.map((row) => `| ${valueOrUnknown(row.review_priority)} | ${valueOrUnknown(row.item_date)} | ${valueOrUnknown(row.board_label)} | ${valueOrUnknown(row.signal_group)} | ${valueOrUnknown(row.title)} | ${valueOrUnknown(row.recommended_action)} |`).join("\n")
    : "| 미확인 | 미확인 | 미확인 | 미확인 | 최신 공개항목 검토 큐 없음 | 미확인 |";

  return `## 사업장별 리스크 신호

| 항목 | 값 |
| --- | --- |
| 리스크 레벨 | ${valueOrUnknown(riskSignal.risk_signal_level)} |
| P0/P1/P2/P3 공개항목 | ${valueOrUnknown(riskSignal.p0_count)} / ${valueOrUnknown(riskSignal.p1_count)} / ${valueOrUnknown(riskSignal.p2_count)} / ${valueOrUnknown(riskSignal.p3_count)} |
| 신호 그룹 | ${valueOrUnknown(riskSignal.signal_groups)} |
| 핵심 리스크 가설 | ${valueOrUnknown(riskSignal.key_risk_hypothesis)} |
| 다음 액션 | ${valueOrUnknown(riskSignal.next_action)} |
| 장기 입지 가설 | ${valueOrUnknown(riskSignal.long_term_thesis)} |
| 교통/생활권 리스크 | ${valueOrUnknown(riskSignal.mobility_risks)} |
| 리스크 요약표 | analysis/project-risk-signal-summary.csv에서 rank=${valueOrUnknown(riskSignal.rank)} 필터 |
| 공개항목 검토 큐 | analysis/cleanup-board-review-queue.csv에서 rank=${valueOrUnknown(riskSignal.rank)} 필터 |
| 원문 수치 검증 큐 | analysis/source-value-verification-queue.csv에서 rank=${valueOrUnknown(riskSignal.rank)} 필터 |
| 핵심 수치 확인 장부 | analysis/core-value-confirmation-ledger.csv에서 rank=${valueOrUnknown(riskSignal.rank)} 필터 |

### 우선 공개항목

| 우선순위 | 일자 | 게시판 | 신호 | 제목 | 확인 작업 |
| --- | --- | --- | --- | --- | --- |
${topItems}

주의: 공개항목 제목 기반 신호이므로, 실제 비용·일정 리스크는 첨부 원문, 고시문, 조합 공개표와 대조해 확정한다.

`;
}

function ocrImageReviewDecisionSection(rows) {
  if (!rows.length) return "";
  const tableRows = rows
    .map(
      (row) =>
        `| ${valueOrUnknown(row.field_label || row.field_id)} | ${valueOrUnknown(row.current_value)} | ${valueOrUnknown(row.source_value)} | ${valueOrUnknown(row.manual_review_status)} | ${valueOrUnknown(row.recommended_value_action)} | ${valueOrUnknown(row.image_path)} |`,
    )
    .join("\n");
  return `## OCR 이미지 수동 검수

원문 이미지를 직접 열어 OCR 트리아지 결과와 장부 현재값을 대조한 결과다. 자동 확정값이 아니라 원문 판독상 보정 또는 2차 출처 확인이 필요한 항목이다.

| 필드 | 장부 현재값 | 이미지 원문값 | 수동 상태 | 후속 액션 | 이미지 |
| --- | --- | --- | --- | --- | --- |
${tableRows}

- 결정 로그: \`analysis/ocr-image-review-decisions.md\`

`;
}

function sourceValueUpdateCandidateSection(rows) {
  if (!rows.length) return "";
  const tableRows = rows
    .map(
      (row) =>
        `| ${valueOrUnknown(row.field_label || row.field_id)} | ${valueOrUnknown(row.matrix_current_value)} | ${valueOrUnknown(row.recommended_structured_value)} | ${valueOrUnknown(row.recommended_display_value)} | ${valueOrUnknown(row.update_candidate_status)} | ${valueOrUnknown(row.update_action_type)} |`,
    )
    .join("\n");
  return `## 원문 수치 보정 후보

OCR 이미지 수동 검수 결과를 비교용 구조화 수치로 반영할 때 사용할 후보값이다. 현재 비교 매트릭스의 \`*_official\` 값을 바로 덮어쓰지 않고, 원문 판독값과 반영 방식을 별도로 둔다.

| 필드 | 매트릭스 현재값 | 권장 구조화값 | 권장 표시값 | 상태 | 반영 방식 |
| --- | --- | --- | --- | --- | --- |
${tableRows}

- 보정 후보표: \`analysis/source-value-update-candidates.md\`

`;
}

function valueOrUnknown(value) {
  return String(value ?? "").trim() || "미확인";
}

function sourceForSummary(summary) {
  return summary?.summary_url ? "정비사업 정보몽땅 사업개요" : "";
}

function managementDocValue(managementDocs, itemNo, fieldName) {
  return managementDocs?.find((doc) => String(doc.item_no) === String(itemNo) && doc[fieldName])?.[fieldName] || "";
}

function stageDocValue(stageDocs, itemNo, fieldName) {
  return stageDocs?.find((doc) => String(doc.item_no) === String(itemNo) && doc[fieldName])?.[fieldName] || "";
}

function applyValueOverride(row, override) {
  if (!override?.values) return row;
  const nextRow = {
    ...row,
    ...override.values,
    value_override_id: override.override_id || "",
    value_override_status: override.applied_status || "applied",
    value_override_source_name: [override.source_notice_no, override.source_notice_date, override.source_notice_title]
      .filter(Boolean)
      .join(" / "),
    value_override_source_url: override.source_url || "",
    value_override_review: override.source_review || "",
    value_override_fields: Object.entries(override.values)
      .map(([field, value]) => `${field}=${value}`)
      .join("; "),
    value_override_note: override.reason || override.notes || "",
  };
  for (const [field, value] of Object.entries(override.display_values || {})) {
    nextRow[`${field}_display`] = value;
  }
  return nextRow;
}

function applyStageDateOverride(row, override) {
  if (!override?.values) return row;
  return {
    ...row,
    ...override.values,
    stage_date_override_id: override.override_id || "",
    stage_date_override_status: override.applied_status || "applied",
    stage_date_override_source: override.source_name || "",
    stage_date_override_url: override.source_url || "",
    stage_date_override_review: override.source_review || "",
    stage_date_override_fields: Object.entries(override.values)
      .map(([field, value]) => `${field}=${value}`)
      .join("; "),
    stage_date_override_note: override.reason || override.notes || "",
  };
}

function summaryNumberRows(summary, managementDocs = [], gwangjinStageDocs = [], row = {}) {
  const source = sourceForSummary(summary);
  const publicDocSource = "정비사업 정보몽땅 공개항목";
  const overrideSource = row.stage_date_override_source || "공식 사업별 페이지";
  const valueOverrideSource = row.value_override_source_name || row.value_override_source_url || "공식 보정값";
  const overrideBacked = (field) => row.stage_date_override_fields?.includes(`${field}=`);
  const valueOverrideBacked = (field) => row.value_override_fields?.includes(`${field}=`);
  const sourceValue = (summaryField, matrixField, unit = "") => {
    if (row[`${matrixField}_display`]) return [row[`${matrixField}_display`], valueOverrideSource];
    if (row[matrixField] && valueOverrideBacked(matrixField)) return [`${row[matrixField]}${unit}`, valueOverrideSource];
    if (summary?.[summaryField]) return [`${summary[summaryField]}${unit}`, source];
    return ["", ""];
  };
  const stageDateValue = (itemNo, fieldName, matrixField) =>
    stageDocValue(gwangjinStageDocs, itemNo, fieldName) || row[matrixField] || "";
  const stageDateSource = (itemNo, fieldName, matrixField) => {
    if (stageDocValue(gwangjinStageDocs, itemNo, fieldName)) return publicDocSource;
    if (row[matrixField] && overrideBacked(matrixField)) return overrideSource;
    return "";
  };
  const managementDateValue = (itemNo, fieldName, matrixField) =>
    managementDocValue(managementDocs, itemNo, fieldName) || row[matrixField] || "";
  const managementDateSource = (itemNo, fieldName, matrixField) => {
    if (managementDocValue(managementDocs, itemNo, fieldName)) return publicDocSource;
    if (row[matrixField] && overrideBacked(matrixField)) return overrideSource;
    return "";
  };
  const consentRateValue = () =>
    stageDocValue(gwangjinStageDocs, "200", "consent_rate_pct") ||
    stageDocValue(gwangjinStageDocs, "226", "consent_rate_pct") ||
    row.stage_consent_rate_pct_public ||
    "";
  const consentRateSource = () => {
    if (stageDocValue(gwangjinStageDocs, "200", "consent_rate_pct") || stageDocValue(gwangjinStageDocs, "226", "consent_rate_pct")) {
      return publicDocSource;
    }
    if (row.stage_consent_rate_pct_public && overrideBacked("stage_consent_rate_pct_public")) return overrideSource;
    return "";
  };
  const rows = [
    ["정비구역 명칭", summary?.district_name, source],
    ["정비구역 위치", summary?.location, source],
    ["정비구역 면적", ...sourceValue("district_area_sqm", "district_area_sqm_official", "㎡")],
    ["조합원 수", summary?.union_member_count, source],
    ["토지등 소유자 수", summary?.landowner_count, source],
    ["세입자 수", summary?.tenant_count, source],
    ["용도지역", summary?.zoning_area, source],
    ["용도지구", summary?.zoning_district, source],
    ["대지면적", summary?.site_area_sqm ? `${summary.site_area_sqm}㎡` : "", source],
    ["건축면적", summary?.building_area_sqm ? `${summary.building_area_sqm}㎡` : "", source],
    ["연면적", summary?.gross_floor_area_sqm ? `${summary.gross_floor_area_sqm}㎡` : "", source],
    ["건폐율", ...sourceValue("building_coverage_ratio_pct", "building_coverage_ratio_pct_official", "%")],
    ["용적률", ...sourceValue("floor_area_ratio_pct", "floor_area_ratio_pct_official", "%")],
    ["최고높이", ...sourceValue("max_height_m", "max_height_m_official", "m")],
    ["층수", ...sourceValue("floors", "floors_official")],
    ["분양 세대수", summary?.sale_household_total, source],
    ["임대 세대수", summary?.rental_household_total, source],
    ["총 세대수", ...sourceValue("total_households", "total_households_official")],
    ["사업시행인가일", managementDateValue("202", "approval_date", "project_approval_date_public"), managementDateSource("202", "approval_date", "project_approval_date_public")],
    ["사업시행인가 고시일", managementDateValue("202", "notice_date", "project_approval_notice_date_public"), managementDateSource("202", "notice_date", "project_approval_notice_date_public")],
    ["관리처분인가일", managementDateValue("213", "approval_date", "management_approval_date_public"), managementDateSource("213", "approval_date", "management_approval_date_public")],
    ["관리처분인가 고시일", managementDateValue("213", "notice_date", "management_approval_notice_date_public"), managementDateSource("213", "notice_date", "management_approval_notice_date_public")],
    ["조합설립인가일", stageDateValue("200", "approval_date", "union_approval_date_public"), stageDateSource("200", "approval_date", "union_approval_date_public")],
    ["추진위원회 승인일", stageDateValue("226", "approval_date", "promotion_committee_approval_date_public"), stageDateSource("226", "approval_date", "promotion_committee_approval_date_public")],
    ["공개항목 동의율", consentRateValue(), consentRateSource()],
  ];
  return rows.map(([label, value, rowSource]) => `| ${label} | ${valueOrUnknown(value)} | ${value ? rowSource : ""} |`).join("\n");
}

function noteBody(
  row,
  menuLinks,
  summary,
  urbanDetail,
  noticeDetail,
  noticeAttachments,
  textManifest,
  keyFields,
  marketArea,
  transportContext,
  riskSignal,
  boardReviewRows,
  businessLayer,
  businessNotice,
  originalNoticeProbes,
  gwangjinGuNotices,
  gwangjinGuNoticeAttachments,
  managementDocs,
  managementValueResolutionRows,
  gwangjinStageDocs,
  seoulSiboOriginalNotices,
  ocrImageReviewDecisions,
  sourceValueUpdateCandidates,
  focusDeepDive,
  publicCatalysts,
) {
  const title = `${row.project_name}`;
  const stage = row.current_stage_display || row.current_stage || "미확인";
  const nextStage = nextStageFor(row.current_stage || "");
  const risk = row.risk_notes || "공식 원문 확인 후 리스크 보강 필요";
  const effectiveMapUrl = row.official_map_url || urbanDetail?.official_map_url || "";
  const overrideNoticeUrl = looksLikeOfficialNoticeUrl(row.stage_date_override_url)
    ? row.stage_date_override_url
    : looksLikeOfficialNoticeUrl(row.value_override_source_url)
      ? row.value_override_source_url
      : "";
  const effectiveNoticeUrl = urbanDetail?.urban_notice_url || noticeDetail?.notice_file_url || overrideNoticeUrl || "";
  const mapLine = effectiveMapUrl ? `- 서울도시공간포털 지도: ${effectiveMapUrl}` : "- 서울도시공간포털 지도: 미확인";
  const summaryLine = summary?.summary_url ? `- 정비사업 정보몽땅 사업개요: ${summary.summary_url}` : "- 정비사업 정보몽땅 사업개요: 미수집";

  return `# ${title}

작성 기준: ${kstDate()} KST

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 우선순위 | ${row.rank} |
| 등급/점수 | ${row.priority_tier} / ${row.score} |
| 생활권 | ${row.focus_area} |
| 자치구/동 | ${row.district} ${row.dong} |
| 대표지번 | ${row.representative_lot} |
| 사업유형 | ${row.project_type} |
| 현재단계 | ${stage} |
| 다음 단계 가설 | ${nextStage} |
| 공개자료 수 | ${row.public_doc_count} |
| 추정 역세권/생활권 | ${row.estimated_station_area} |

${deepDiveQueueSection(focusDeepDive, publicCatalysts)}
## 공식 원문 링크

- 정비사업 정보몽땅 사업장: ${row.official_project_url || "미확인"}
${summaryLine}
${mapLine}
- 정비사업 정보몽땅 목록 출처: ${row.source_url}
- 고시/공고 URL: ${effectiveNoticeUrl || "미확인"}
- 서울 정보소통광장 URL: 미확인

${menuLinksSection(menuLinks)}
${urbanDetailSection(urbanDetail)}
${urbanNoticeSection(noticeDetail, noticeAttachments)}
${businessLayerSection(row, businessLayer, businessNotice, seoulSiboOriginalNotices)}
${originalNoticeProbeSection(originalNoticeProbes, seoulSiboOriginalNotices)}
${gwangjinGuNoticeSection(gwangjinGuNotices, gwangjinGuNoticeAttachments)}
${textExtractionSection(textManifest, keyFields)}
${ocrImageReviewDecisionSection(ocrImageReviewDecisions)}
${sourceValueUpdateCandidateSection(sourceValueUpdateCandidates)}
${managementDocsSection(managementDocs)}
${managementValueResolutionSection(managementValueResolutionRows)}
${gwangjinStageDocsSection(gwangjinStageDocs)}
${stageDateReviewSection(row)}
${projectRiskSignalSection(riskSignal, boardReviewRows)}
${transportContextSection(transportContext)}
${marketDataSection(marketArea)}
## 현재 해석

- 전략 태그: ${row.strategic_tags || "추가 확인 필요"}
- 다음 리서치 질문: ${row.next_research_question || "공식 원문으로 핵심 변수를 확인한다."}
- 리스크 메모: ${risk}

## 원문 확인 체크리스트

- [ ] 정비사업 정보몽땅 사업장 페이지에서 최근 공개자료, 총회 자료, 인가 문서 확인
- [ ] 서울도시공간포털에서 대표지번의 정비구역계, 지구단위계획, 결정고시 확인
- [ ] 고시번호, 고시일, 결정조서, 결정도, 시행지침 URL 기록
- [ ] 서울시 주택·도시계획 분야에서 심의 결과, 신속통합기획, 통합심의 관련 자료 확인
- [ ] 서울 정보소통광장에서 결재문서, 위원회 회의정보, 정책자료 검색
- [ ] 실거래가, 서울부동산정보광장, R-ONE에서 최근 거래·전세·가격 흐름 확인
- [ ] 현장 답사 시 역 접근, 보행 동선, 도로 단절, 상권, 학교, 한강 접근, 노후도 기록

## 보강할 수치

| 항목 | 값 | 출처 |
| --- | --- | --- |
${summaryNumberRows(summary, managementDocs, gwangjinStageDocs, row)}
| 권리산정기준일 | 미확인 |  |

## 출처 상태

${sourceStatus(row, urbanDetail, noticeDetail, noticeAttachments, marketArea).map((item) => `- ${item}`).join("\n")}
`;
}

function indexBody(rows) {
  const lines = [
    "# 사업별 메모",
    "",
    `작성 기준: ${kstDate()} KST`,
    "",
    "이 폴더는 우선검토 후보 30개의 1페이지 메모 초안이다. 각 파일은 정비사업 정보몽땅 공식 목록, 사업장 내부 메뉴, 사업개요 수치, 서울도시공간포털 매칭 결과, 사업구역 레이어 보강, 고시 원문 파일/로컬 첨부, 원문 텍스트 추출 상태, 딥다이브 큐, 공공 개발 촉매, 자율주행·교통 시나리오, 사업장별 리스크 신호, 교통입지·생활권 컨텍스트, 시장 데이터 연결 키를 기반으로 생성했다. 실거래/R-ONE 원자료는 공식 수집·정규화 산출물에 연결됐고, 사업장 단위 해석 전에는 키워드 매칭 샘플 검수가 필요하다.",
    "",
    "## 목록",
    "",
    "| 순위 | 생활권 | 사업명 | 단계 | 파일 |",
    "| ---: | --- | --- | --- | --- |",
  ];

  for (const row of rows) {
    const fileName = fileNameFor(row);
    lines.push(`| ${row.rank} | ${row.focus_area} | ${row.project_name} | ${row.current_stage || "미확인"} | [${fileName}](${fileName}) |`);
  }

  lines.push(
    "",
    "## 재생성",
    "",
    "루트 폴더에서 로컬 분석 산출물만 다시 만들려면 다음 명령을 실행한다. 이 명령은 원격 웹사이트를 다시 호출하거나 OCR을 새로 돌리지 않고, 이미 받은 `data/` 원천과 검수 로그를 기준으로 분석 문서와 사업별 메모를 재생성한다.",
    "",
    "```bash",
    "node scripts/regenerate-research-artifacts.mjs",
    "```",
    "",
    "실행 순서를 먼저 확인하려면 `node scripts/regenerate-research-artifacts.mjs --dry-run`, 단계 목록만 보려면 `node scripts/regenerate-research-artifacts.mjs --list`를 쓴다.",
    "",
    "원문 수집, OCR, 시장 데이터 API 호출까지 새로 할 때는 루트의 `seoul-redevelopment-research-playbook.md`에 있는 수집 명령을 먼저 실행한 뒤 위 재생성 명령을 다시 실행한다.",
    "",
    "기존 메모 파일을 같은 이름으로 덮어쓰므로, 수동 보강을 많이 한 뒤에는 필요한 내용을 별도 섹션이나 별도 파일로 백업하는 편이 낫다.",
  );

  return `${lines.join("\n")}\n`;
}

function fileNameFor(row) {
  const id = slugify(row.cafe_id || row.project_name);
  return `${String(row.rank).padStart(2, "0")}-${id}.md`;
}

async function main() {
  const rows = parseCsv(await readFile(INPUT, "utf8"));
  let projectMatrixRows = [];
  let menuRows = [];
  let summaryRows = [];
  let urbanRows = [];
  let noticeRows = [];
  let noticeAttachmentRows = [];
  let businessNoticeRows = [];
  let businessNoticeAttachmentRows = [];
  let originalNoticeProbeRows = [];
  let gwangjinGuNoticeRows = [];
  let gwangjinGuNoticeAttachmentRows = [];
  let textManifestRows = [];
  let keyFieldRows = [];
  let gwangjinGuTextManifestRows = [];
  let gwangjinGuKeyFieldRows = [];
  let marketRows = [];
  let transportRows = [];
  let projectRiskSignalRows = [];
  let cleanupBoardReviewRows = [];
  let businessLayerRows = [];
  let managementDocRows = [];
  let managementValueResolutionRows = [];
  let gwangjinStageDocRows = [];
  let hanyanggaroGwangjinSourceRows = [];
  let seoulSiboOriginalNoticeRows = [];
  let ocrImageReviewDecisionRows = [];
  let sourceValueUpdateCandidateRows = [];
  let focusDeepDiveRows = [];
  let publicCatalystRows = [];
  try {
    projectMatrixRows = JSON.parse(await readFile(PROJECT_COMPARISON_MATRIX_INPUT, "utf8"));
  } catch {
    projectMatrixRows = [];
  }
  try {
    menuRows = JSON.parse(await readFile(MENU_LINKS_INPUT, "utf8"));
  } catch {
    menuRows = [];
  }
  try {
    summaryRows = JSON.parse(await readFile(PROJECT_SUMMARIES_INPUT, "utf8"));
  } catch {
    summaryRows = [];
  }
  try {
    urbanRows = JSON.parse(await readFile(URBAN_DETAILS_INPUT, "utf8"));
  } catch {
    urbanRows = [];
  }
  try {
    noticeRows = JSON.parse(await readFile(URBAN_NOTICE_DETAILS_INPUT, "utf8"));
  } catch {
    noticeRows = [];
  }
  try {
    noticeAttachmentRows = parseCsv(await readFile(URBAN_NOTICE_ATTACHMENTS_INPUT, "utf8"));
  } catch {
    noticeAttachmentRows = [];
  }
  try {
    businessNoticeRows = JSON.parse(await readFile(BUSINESS_NOTICE_CANDIDATES_INPUT, "utf8")).filter(
      (row) => row.search_status === "candidate" && row.match_confidence === "high",
    );
  } catch {
    businessNoticeRows = [];
  }
  try {
    businessNoticeAttachmentRows = parseCsv(await readFile(BUSINESS_NOTICE_ATTACHMENTS_INPUT, "utf8"));
  } catch {
    businessNoticeAttachmentRows = [];
  }
  try {
    originalNoticeProbeRows = parseCsv(await readFile(ORIGINAL_NOTICE_PROBES_INPUT, "utf8"));
  } catch {
    originalNoticeProbeRows = [];
  }
  try {
    gwangjinGuNoticeRows = JSON.parse(await readFile(GWANGJIN_GU_NOTICE_INPUT, "utf8"));
  } catch {
    gwangjinGuNoticeRows = [];
  }
  try {
    gwangjinGuNoticeAttachmentRows = parseCsv(await readFile(GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT, "utf8"));
  } catch {
    gwangjinGuNoticeAttachmentRows = [];
  }
  try {
    textManifestRows = parseCsv(await readFile(URBAN_NOTICE_TEXT_MANIFEST_INPUT, "utf8"));
  } catch {
    textManifestRows = [];
  }
  try {
    keyFieldRows = parseCsv(await readFile(URBAN_NOTICE_KEY_FIELDS_INPUT, "utf8"));
  } catch {
    keyFieldRows = [];
  }
  try {
    gwangjinGuTextManifestRows = parseCsv(await readFile(GWANGJIN_GU_TEXT_MANIFEST_INPUT, "utf8"));
  } catch {
    gwangjinGuTextManifestRows = [];
  }
  try {
    gwangjinGuKeyFieldRows = parseCsv(await readFile(GWANGJIN_GU_KEY_FIELDS_INPUT, "utf8"));
  } catch {
    gwangjinGuKeyFieldRows = [];
  }
  try {
    marketRows = JSON.parse(await readFile(MARKET_AREAS_INPUT, "utf8"));
  } catch {
    marketRows = [];
  }
  try {
    transportRows = JSON.parse(await readFile(TRANSPORT_CONTEXT_INPUT, "utf8"));
  } catch {
    transportRows = [];
  }
  try {
    projectRiskSignalRows = JSON.parse(await readFile(PROJECT_RISK_SIGNAL_INPUT, "utf8"));
  } catch {
    projectRiskSignalRows = [];
  }
  try {
    cleanupBoardReviewRows = JSON.parse(await readFile(CLEANUP_BOARD_REVIEW_QUEUE_INPUT, "utf8"));
  } catch {
    cleanupBoardReviewRows = [];
  }
  try {
    businessLayerRows = JSON.parse(await readFile(BUSINESS_LAYER_INPUT, "utf8"));
  } catch {
    businessLayerRows = [];
  }
  try {
    managementDocRows = JSON.parse(await readFile(MANAGEMENT_DOCS_INPUT, "utf8"));
  } catch {
    managementDocRows = [];
  }
  try {
    managementValueResolutionRows = JSON.parse(await readFile(MANAGEMENT_VALUE_RESOLUTION_INPUT, "utf8"));
  } catch {
    managementValueResolutionRows = [];
  }
  try {
    gwangjinStageDocRows = JSON.parse(await readFile(GWANGJIN_STAGE_DOCS_INPUT, "utf8"));
  } catch {
    gwangjinStageDocRows = [];
  }
  try {
    hanyanggaroGwangjinSourceRows = JSON.parse(await readFile(HANYANGGARO_GWANGJIN_SOURCE_PAGES_INPUT, "utf8"));
  } catch {
    hanyanggaroGwangjinSourceRows = [];
  }
  try {
    seoulSiboOriginalNoticeRows = JSON.parse(await readFile(SEOUL_SIBO_ORIGINAL_NOTICE_INPUT, "utf8"));
  } catch {
    seoulSiboOriginalNoticeRows = [];
  }
  try {
    ocrImageReviewDecisionRows = JSON.parse(await readFile(OCR_IMAGE_REVIEW_DECISIONS_INPUT, "utf8"));
  } catch {
    ocrImageReviewDecisionRows = [];
  }
  try {
    sourceValueUpdateCandidateRows = JSON.parse(await readFile(SOURCE_VALUE_UPDATE_CANDIDATES_INPUT, "utf8"));
  } catch {
    sourceValueUpdateCandidateRows = [];
  }
  try {
    focusDeepDiveRows = JSON.parse(await readFile(FOCUS_DEEP_DIVE_QUEUE_INPUT, "utf8")).rows || [];
  } catch {
    focusDeepDiveRows = [];
  }
  try {
    publicCatalystRows = JSON.parse(await readFile(PUBLIC_CATALYST_MAP_INPUT, "utf8")).rows || [];
  } catch {
    publicCatalystRows = [];
  }
  let stageDateOverrideRows = [];
  try {
    stageDateOverrideRows = JSON.parse(await readFile(STAGE_DATE_OVERRIDES_INPUT, "utf8"));
  } catch {
    stageDateOverrideRows = [];
  }
  let valueOverrideRows = [];
  try {
    valueOverrideRows = JSON.parse(await readFile(VALUE_OVERRIDES_INPUT, "utf8"));
  } catch {
    valueOverrideRows = [];
  }
  const menuRowsByRank = menuRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const projectMatrixRowsByRank = Object.fromEntries(projectMatrixRows.map((row) => [String(row.rank), row]));
  const summaryRowsByRank = Object.fromEntries(summaryRows.map((row) => [row.rank, row]));
  const urbanRowsByRank = Object.fromEntries(urbanRows.map((row) => [row.rank, row]));
  const businessNoticeRowsByRank = Object.fromEntries(businessNoticeRows.map((row) => [row.rank, row]));
  const noticeRowsByRank = { ...businessNoticeRowsByRank, ...Object.fromEntries(noticeRows.map((row) => [row.rank, row])) };
  const noticeAttachmentRowsByRank = [...noticeAttachmentRows, ...businessNoticeAttachmentRows].reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const originalNoticeProbeRowsByRank = originalNoticeProbeRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const gwangjinGuNoticeRowsByRank = gwangjinGuNoticeRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const gwangjinGuNoticeAttachmentRowsByRank = gwangjinGuNoticeAttachmentRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const allTextManifestRows = [
    ...textManifestRows,
    ...gwangjinGuTextManifestRows,
    ...fallbackGwangjinTextManifestRows(hanyanggaroGwangjinSourceRows),
  ];
  const allKeyFieldRows = [...keyFieldRows, ...gwangjinGuKeyFieldRows];
  const hanyanggaroFallbackNoticeRows = fallbackGwangjinSourceRows(hanyanggaroGwangjinSourceRows);
  const marketRowsByRank = Object.fromEntries(marketRows.map((row) => [row.rank, row]));
  const transportRowsByRank = Object.fromEntries(transportRows.map((row) => [row.rank, row]));
  const projectRiskSignalRowsByRank = Object.fromEntries(projectRiskSignalRows.map((row) => [row.rank, row]));
  const cleanupBoardReviewRowsByRank = cleanupBoardReviewRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const businessLayerRowsByRank = Object.fromEntries(businessLayerRows.map((row) => [row.rank, row]));
  const managementDocRowsByRank = managementDocRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const managementValueResolutionRowsByRank = managementValueResolutionRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const gwangjinStageDocRowsByRank = gwangjinStageDocRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const seoulSiboOriginalNoticeRowsByRank = seoulSiboOriginalNoticeRows.reduce((acc, row) => {
    const rank = String(row.project_rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
  const ocrImageReviewDecisionRowsByRank = ocrImageReviewDecisionRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const sourceValueUpdateCandidateRowsByRank = sourceValueUpdateCandidateRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const focusDeepDiveRowsByRank = Object.fromEntries(focusDeepDiveRows.map((row) => [row.rank, row]));
  const publicCatalystRowsByRank = publicCatalystRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const stageDateOverrideRowsByRank = stageDateOverrideRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});
  const valueOverrideRowsByRank = valueOverrideRows.reduce((acc, row) => {
    if (!acc[row.rank]) acc[row.rank] = [];
    acc[row.rank].push(row);
    return acc;
  }, {});

  await mkdir(OUT_DIR, { recursive: true });

  for (const row of rows) {
    const matrixRow = projectMatrixRowsByRank[String(row.rank)] || null;
    const mergedRow = matrixRow ? { ...row, ...matrixRow } : { ...row };
    const noteRow = applyStageDateOverride(
      applyValueOverride(mergedRow, valueOverrideRowsByRank[row.rank]?.[0]),
      stageDateOverrideRowsByRank[row.rank]?.[0],
    );
    const effectiveNoticeDetail =
      noticeRowsByRank[noteRow.rank] || fallbackNoticeDetail(noteRow, hanyanggaroGwangjinSourceRows);
    const effectiveNoticeAttachments =
      (noticeAttachmentRowsByRank[noteRow.rank] ?? []).length > 0
        ? noticeAttachmentRowsByRank[noteRow.rank] ?? []
        : fallbackNoticeAttachments(noteRow);
    const effectiveGwangjinGuNotices =
      (gwangjinGuNoticeRowsByRank[noteRow.rank] ?? []).length > 0
        ? gwangjinGuNoticeRowsByRank[noteRow.rank] ?? []
        : String(noteRow.rank) === "25"
          ? hanyanggaroFallbackNoticeRows
          : [];
    const effectiveTextManifest = selectTextManifestForRow(allTextManifestRows, noteRow) || textManifestFromRow(noteRow);
    const effectiveKeyFields = selectKeyFields(allKeyFieldRows, primaryTextPath(effectiveTextManifest?.text_path));
    await writeFile(
      path.join(OUT_DIR, fileNameFor(noteRow)),
      noteBody(
        noteRow,
        menuRowsByRank[noteRow.rank] ?? [],
        summaryRowsByRank[noteRow.rank],
        urbanRowsByRank[noteRow.rank],
        effectiveNoticeDetail,
        effectiveNoticeAttachments,
        effectiveTextManifest,
        effectiveKeyFields,
        marketRowsByRank[noteRow.rank],
        transportRowsByRank[noteRow.rank],
        projectRiskSignalRowsByRank[noteRow.rank],
        cleanupBoardReviewRowsByRank[noteRow.rank] ?? [],
        businessLayerRowsByRank[noteRow.rank],
        businessNoticeRowsByRank[noteRow.rank],
        originalNoticeProbeRowsByRank[noteRow.rank] ?? [],
        effectiveGwangjinGuNotices,
        gwangjinGuNoticeAttachmentRowsByRank[noteRow.rank] ?? [],
        managementDocRowsByRank[noteRow.rank] ?? [],
        managementValueResolutionRowsByRank[noteRow.rank] ?? [],
        gwangjinStageDocRowsByRank[noteRow.rank] ?? [],
        seoulSiboOriginalNoticeRowsByRank[noteRow.rank] ?? [],
        ocrImageReviewDecisionRowsByRank[noteRow.rank] ?? [],
        sourceValueUpdateCandidateRowsByRank[noteRow.rank] ?? [],
        focusDeepDiveRowsByRank[noteRow.rank],
        publicCatalystRowsByRank[noteRow.rank] ?? [],
      ),
    );
  }
  await writeFile(path.join(OUT_DIR, "README.md"), indexBody(rows));

  const counts = rows.reduce((acc, row) => {
    acc[row.focus_area] = (acc[row.focus_area] ?? 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ inputRows: rows.length, outputDir: OUT_DIR, counts }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
