#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/urban/map-missing-business-layer-details.json";
const NOTICE_INPUT = "data/urban/business-layer-notice-candidates.json";
const ORIGINAL_NOTICE_PROBES_INPUT = "data/urban/original-notice-file-probes.csv";
const STAGE_PUBLIC_DOCS_INPUT = "data/cleanup/gwangjin-stage-public-docs.json";
const GWANGJIN_GU_NOTICE_INPUT = "data/urban/gwangjin-gu-notice-candidates.json";
const GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT = "data/urban/gwangjin-gu-notice-attachments.csv";
const GWANGJIN_GU_TEXT_MANIFEST_INPUT = "data/urban/text/gwangjin-gu-notice-text-manifest.csv";
const SEOUL_SIBO_ORIGINAL_NOTICE_INPUT = "data/urban/seoul-sibo-original-notice-sources.json";
const OUT_DIR = "analysis";

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

function mdTable(rows, fields) {
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
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

function markdown(rows, noticeRows, probeRows, stageDocRows, guNoticeRows, guAttachmentRows, guTextRows, seoulSiboRows) {
  const matched = rows.filter((row) => row.match_status === "business_layer_matched_no_notice_record");
  const noticeByRank = Object.fromEntries(noticeRows.map((row) => [row.rank, row]));
  const stageDocByRank = Object.fromEntries(stageDocRows.map((row) => [row.rank, row]));
  const guNoticeByRank = groupByRank(guNoticeRows.filter((row) => row.search_status === "candidate" && row.match_confidence === "high"));
  const guAttachmentsByRank = groupByRank(guAttachmentRows.filter((row) => row.local_path));
  const guTextByRank = groupByRank(guTextRows.filter((row) => ["extracted", "ocr_extracted"].includes(row.extraction_status)));
  const seoulSiboByRank = Object.fromEntries(seoulSiboRows.map((row) => [String(row.project_rank), row]));
  const probeSummaryByRank = probeRows.reduce((acc, row) => {
    const key = row.rank;
    if (!acc[key]) acc[key] = { probe_count: 0, pdf_found: 0 };
    acc[key].probe_count += 1;
    if (row.looks_like_pdf === "Y") acc[key].pdf_found += 1;
    return acc;
  }, {});
  const rowsWithNotice = rows.map((row) => {
    const notice = noticeByRank[row.rank] || {};
    const stageDoc = stageDocByRank[row.rank] || {};
    const guNotices = guNoticeByRank[row.rank] || [];
    const guAttachments = guAttachmentsByRank[row.rank] || [];
    const guTexts = guTextByRank[row.rank] || [];
    const probe = probeSummaryByRank[row.rank] || {};
    const seoulSibo = seoulSiboByRank[row.rank] || {};
    return {
      ...row,
      stage_public_status: stageDoc.access_status || "",
      stage_public_item: stageDoc.item_label || "",
      stage_public_approval_date: stageDoc.approval_date || "",
      stage_public_landowners: stageDoc.landowner_count || "",
      stage_public_members: stageDoc.union_member_count || "",
      stage_public_consenters: stageDoc.consenter_count || "",
      stage_public_consent_rate: stageDoc.consent_rate_pct || "",
      notice_match_status: notice.search_status === "candidate" ? "고시 후보 확보" : "후보 없음",
      notice_match_confidence: notice.match_confidence || "none",
      notice_no: notice.notice_no || "",
      notice_date: notice.notice_date || "",
      notice_title: notice.notice_title || "",
      notice_file_name: notice.notice_file_name || "",
      original_notice_probe_count: probe.probe_count || "",
      original_notice_pdf_found: probe.pdf_found ?? "",
      seoul_sibo_original_notice_status: seoulSibo.local_pdf ? "서울시보 원문 확보" : "",
      seoul_sibo_original_notice_no: seoulSibo.notice_no || "",
      seoul_sibo_original_local_pdf: seoulSibo.local_pdf || "",
      gu_notice_status: guNotices.length ? "후보 확보" : "후보 없음",
      gu_notice_count: guNotices.length,
      gu_notice_latest_date: guNotices.map((item) => item.notice_date).filter(Boolean).sort().at(-1) || "",
      gu_notice_attachment_count: guAttachments.length,
      gu_notice_text_count: guTexts.length,
      gu_notice_ocr_text_count: guTexts.filter((item) => item.extraction_status === "ocr_extracted").length,
      gu_notice_text_status: guTexts.length ? "텍스트 확보" : guAttachments.length ? "추출 필요" : "",
      gu_notice_titles: [...new Set(guNotices.map((item) => item.notice_title).filter(Boolean))].slice(0, 4).join("; "),
    };
  });
  const noticeCandidates = noticeRows.filter((row) => row.search_status === "candidate" && row.match_confidence === "high");
  const pdfFound = probeRows.filter((row) => row.looks_like_pdf === "Y");
  const seoulSiboFound = seoulSiboRows.filter((row) => row.local_pdf);
  const stageDocRanksInScope = new Set(rowsWithNotice.filter((row) => row.stage_public_status === "public_table_extracted").map((row) => row.rank));
  const guNoticeRanksInScope = new Set(rowsWithNotice.filter((row) => row.gu_notice_count > 0).map((row) => row.rank));
  const guTextRanksInScope = new Set(rowsWithNotice.filter((row) => row.gu_notice_text_count > 0).map((row) => row.rank));
  return `# 지도 recordCode 미연결 사업구역 레이어 보강

작성 기준: ${kstDate()} KST

이 문서는 \`analysis/project-comparison-matrix.csv\`에서 \`has_urban_map=N\`인 사업 중 서울도시공간포털 사업구역 레이어(\`UPIS_C_UQ120\`)로만 매칭된 건을 재확인한 결과다.

주의: 아래 사업은 사업구역 레이어에서는 매칭되지만, \`WTNNC_SN/NTFC_SN\`이 없어 기존 결정고시 지도 팝업 recordCode가 자동 연결되지는 않는다. 광진권 일부 사업은 광진구청 고시공고와 서울시보 본고시까지 이어졌고, 송파·강남권 일부 사업은 현재 레이어 식별자와 정보몽땅 연결만 확인된 상태다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업 | ${rows.length} |
| 사업구역 레이어 매칭 | ${matched.length} |
| high confidence | ${rows.filter((row) => row.match_confidence === "high").length} |
| 사업구역 기반 고시 후보 확보 | ${noticeCandidates.length} |
| 광진구청 고시공고 후보 확보 | ${guNoticeRanksInScope.size} |
| 광진구청 첨부 텍스트 확보 | ${guTextRanksInScope.size} |
| 본고시 파일명 후보 probe | ${probeRows.length} |
| probe에서 본고시 PDF 확인 | ${pdfFound.length} |
| 서울시보 본고시 원문 확인 | ${seoulSiboFound.length} |
| 정보몽땅 단계 공개표 확보 | ${stageDocRanksInScope.size} |
| 고시/인가 원문 추가 확인 필요 | ${rows.length - noticeCandidates.length - seoulSiboFound.length} |

## 대상 사업

${mdTable(rowsWithNotice, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "정보몽땅 단계" },
  { key: "layer_zone_name", label: "포털 레이어 구역명" },
  { key: "urban_propel_name", label: "포털 단계" },
  { key: "official_area_sqm", label: "사업개요 면적" },
  { key: "layer_area_sqm", label: "레이어 면적" },
  { key: "area_diff_pct", label: "면적 차이%" },
  { key: "present_sn", label: "presentSn" },
])}

## 사업구역 기반 고시 후보

${mdTable(rowsWithNotice, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "notice_match_status", label: "검색 결과" },
  { key: "notice_match_confidence", label: "신뢰도" },
  { key: "notice_no", label: "고시번호" },
  { key: "notice_date", label: "고시일" },
  { key: "notice_title", label: "고시 제목" },
  { key: "notice_file_name", label: "원문 파일" },
  { key: "original_notice_probe_count", label: "본고시 probe" },
  { key: "original_notice_pdf_found", label: "PDF 확인" },
  { key: "seoul_sibo_original_notice_status", label: "서울시보 본고시" },
])}

## 광진구청 고시공고 후보

${mdTable(rowsWithNotice, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "gu_notice_status", label: "검색 결과" },
  { key: "gu_notice_count", label: "후보" },
  { key: "gu_notice_latest_date", label: "최신 등록일" },
  { key: "gu_notice_attachment_count", label: "첨부" },
  { key: "gu_notice_text_status", label: "텍스트" },
  { key: "gu_notice_ocr_text_count", label: "OCR" },
  { key: "gu_notice_titles", label: "주요 제목" },
])}

## 포털 수치 후보

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "urban_business_type", label: "포털 사업유형" },
  { key: "urban_data_reference_date", label: "데이터 기준일" },
  { key: "supply_households", label: "공급 세대" },
  { key: "rental_households", label: "임대 세대" },
  { key: "building_far_pct", label: "용적률" },
  { key: "building_coverage_pct", label: "건폐율" },
  { key: "building_floor", label: "층수" },
  { key: "propel_history", label: "추진 이력" },
])}

## 정보몽땅 단계 공개항목

${mdTable(rowsWithNotice, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "stage_public_item", label: "공개항목" },
  { key: "stage_public_approval_date", label: "인가/승인일" },
  { key: "stage_public_landowners", label: "토지등소유자" },
  { key: "stage_public_members", label: "조합원" },
  { key: "stage_public_consenters", label: "동의자" },
  { key: "stage_public_consent_rate", label: "동의율" },
])}

주의: 공개항목 원본 HTML에는 조합장, 추진위원장, 사무소 소재지 같은 운영 정보가 포함될 수 있으나, 이 리뷰에는 리서치에 필요한 단계·동의율 필드만 반영한다.

## 다음 작업

- 정비사업 정보몽땅 공개항목에서 조합설립인가/추진위승인일과 동의율은 확보했다. 다음은 서울도시공간포털 결정고시 recordCode 또는 자치구 인가 고시 원문 연결이다.
- 광장극동은 정정고시(제2026-308호)를 확인했고, 같은 공식 첨부 폴더의 본고시 파일명 후보 ${probeRows.length}건에서는 PDF를 찾지 못했지만 서울시보 제4146호에서 본고시 제2026-249호 원문을 확보했다. \`analysis/seoul-sibo-original-notice-fact-check.md\` 기준으로 구역면적, 세대수, 용적률, 기반시설 조건을 대조한다.
- 삼성1차는 광진구청 신/구 고시공고 검색에서도 직접 후보가 확인되지 않았다. 정보몽땅 공개항목과 자치구 별도 인가문서 경로를 추가 확인한다.
- 워커힐은 추진위원회 승인서 자체는 정보몽땅 공개항목에서 확인했고, 광진구청에서는 2026년 지구단위계획·전략환경영향평가 공고 텍스트를 확보했다. \`analysis/gwangjin-gu-notice-fact-check.md\` 기준으로 추진위 승인 원문과 도시관리계획 공고를 분리해 본다.
- 자양1의4는 광진구청 조합설립(변경)인가 공고와 공람공고 원문 텍스트를 확보했다. OCR 텍스트를 원문 이미지와 대조한 뒤 정보몽땅 공개항목의 인가일·동의율과 비교한다.
- 생활권·교통 판단은 위 고시/인가 원문으로 구역계와 기반시설 조건을 확인한 뒤 진행한다.
`;
}

async function main() {
  const rows = JSON.parse(await readFile(INPUT, "utf8"));
  let noticeRows = [];
  let probeRows = [];
  let stageDocRows = [];
  let guNoticeRows = [];
  let guAttachmentRows = [];
  let guTextRows = [];
  let seoulSiboRows = [];
  try {
    noticeRows = JSON.parse(await readFile(NOTICE_INPUT, "utf8"));
  } catch {
    noticeRows = [];
  }
  try {
    probeRows = parseCsv(await readFile(ORIGINAL_NOTICE_PROBES_INPUT, "utf8"));
  } catch {
    probeRows = [];
  }
  try {
    stageDocRows = JSON.parse(await readFile(STAGE_PUBLIC_DOCS_INPUT, "utf8"));
  } catch {
    stageDocRows = [];
  }
  try {
    guNoticeRows = JSON.parse(await readFile(GWANGJIN_GU_NOTICE_INPUT, "utf8"));
  } catch {
    guNoticeRows = [];
  }
  try {
    guAttachmentRows = parseCsv(await readFile(GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT, "utf8"));
  } catch {
    guAttachmentRows = [];
  }
  try {
    guTextRows = parseCsv(await readFile(GWANGJIN_GU_TEXT_MANIFEST_INPUT, "utf8"));
  } catch {
    guTextRows = [];
  }
  try {
    seoulSiboRows = JSON.parse(await readFile(SEOUL_SIBO_ORIGINAL_NOTICE_INPUT, "utf8"));
  } catch {
    seoulSiboRows = [];
  }
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUT_DIR, "map-missing-business-layer-review.md"),
    markdown(rows, noticeRows, probeRows, stageDocRows, guNoticeRows, guAttachmentRows, guTextRows, seoulSiboRows),
  );
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        noticeCandidates: noticeRows.filter((row) => row.search_status === "candidate" && row.match_confidence === "high").length,
        originalNoticeProbes: probeRows.length,
        originalNoticePdfFound: probeRows.filter((row) => row.looks_like_pdf === "Y").length,
        seoulSiboOriginalNotice: seoulSiboRows.filter((row) => row.local_pdf).length,
        stagePublicDocs: stageDocRows.length,
        gwangjinGuNoticeCandidates: guNoticeRows.filter((row) => row.search_status === "candidate" && row.match_confidence === "high").length,
        gwangjinGuNoticeText: new Set(guTextRows.filter((row) => ["extracted", "ocr_extracted"].includes(row.extraction_status)).map((row) => row.rank)).size,
        output: "analysis/map-missing-business-layer-review.md",
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
