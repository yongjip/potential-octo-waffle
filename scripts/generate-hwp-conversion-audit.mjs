#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "hwp-conversion-audit.md");
const OUT_CSV = path.join(OUT_DIR, "hwp-conversion-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "hwp-conversion-audit.json");

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

const MANIFESTS = [
  {
    source_group: "seoul_urban_notice",
    source_label: "서울도시공간포털 고시 원문",
    path: "data/urban/text/notice-text-manifest.json",
  },
  {
    source_group: "gwangjin_district_notice",
    source_label: "광진구청 고시공고 첨부",
    path: "data/urban/text/gwangjin-gu-notice-text-manifest.json",
  },
];

const HWP_OCR_MANIFEST = "data/urban/text/ocr/hwp-ocr-text-manifest.json";

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

function textResolved(row) {
  return Boolean(row.text_path) && Number(row.text_char_count || 0) > 0;
}

function ocrKey(row) {
  return row.source_file || "";
}

function conversionPath(row, ocrRow) {
  const ext = (row.source_ext || "").toLowerCase();
  const status = row.extraction_status || "";
  if (ext === "hwpx" && status === "extracted") return "hwpx_zip_xml_direct";
  if (ext === "hwp" && status === "extracted") return "hwp5_body_stream_direct";
  if (ext === "hwp" && status === "hwp_ocr_extracted") return "hwp_bindata_image_ocr";
  if (ext === "hwp" && ocrRow?.ocr_status === "hwp_ocr_extracted") return "hwp_bindata_image_ocr_available";
  if (ext === "hwp" && status === "hwp_text_low_confidence") return "hwp_body_low_confidence";
  if (ext === "hwp" && (status === "hwp_pending_external_conversion" || status === "hwp_conversion_failed")) {
    return "external_converter_needed";
  }
  return status || "unknown";
}

function reviewStatus(row, ocrRow) {
  const ext = (row.source_ext || "").toLowerCase();
  const status = row.extraction_status || "";
  if (!textResolved(row)) return status.includes("pending") || status.includes("failed") ? "blocked" : "needs_text";
  if (ext === "hwp" && (status === "hwp_ocr_extracted" || ocrRow?.ocr_status === "hwp_ocr_extracted")) return "ocr_image_review";
  if (Number(row.text_char_count || 0) < 500) return "short_text_review";
  return "native_text_ready";
}

function nextAction(row, rowReviewStatus) {
  if (rowReviewStatus === "blocked") return "HWP 직접 추출 실패 원인을 확인하고 BinData OCR 또는 별도 변환기를 추가한다.";
  if (rowReviewStatus === "needs_text") return "텍스트 경로가 비어 있으므로 원문 파일 존재 여부와 추출기를 재실행한다.";
  if (rowReviewStatus === "ocr_image_review") return "OCR 텍스트를 원문 이미지와 대조한 뒤 핵심 수치 장부에 반영한다.";
  if (rowReviewStatus === "short_text_review") return "짧은 서식/표지성 문서인지 확인하고 필요한 본문 첨부를 추가로 찾는다.";
  return "핵심 수치 스니펫 대조 대상으로 사용 가능하다.";
}

function normalizeRow(input, row, ocrRowsBySource) {
  const ocrRow = ocrRowsBySource.get(ocrKey(row));
  const review = reviewStatus(row, ocrRow);
  return {
    source_group: input.source_group,
    source_label: input.source_label,
    rank: row.rank || "",
    focus_area: row.focus_area || "",
    district: row.district || "",
    project_name: row.project_name || "",
    source_title: row.notice_title || row.notice_no || row.attachment_name || "",
    source_ext: (row.source_ext || "").toLowerCase(),
    source_file: row.source_file || "",
    extraction_status: row.extraction_status || "",
    conversion_path: conversionPath(row, ocrRow),
    text_path: row.text_path || "",
    text_char_count: Number(row.text_char_count || 0),
    resolved_text: textResolved(row) ? "Y" : "N",
    hwp_ocr_image_count: ocrRow?.image_count || "",
    hwp_ocr_unique_image_count: ocrRow?.unique_image_count || "",
    hwp_ocr_text_path: ocrRow?.ocr_text_path || "",
    hwp_ocr_status: ocrRow?.ocr_status || "",
    review_status: review,
    next_action: nextAction(row, review),
    extraction_error: row.extraction_error || "",
  };
}

function markdown(rows) {
  const totals = {
    total: rows.length,
    hwp: rows.filter((row) => row.source_ext === "hwp").length,
    hwpx: rows.filter((row) => row.source_ext === "hwpx").length,
    resolved: rows.filter((row) => row.resolved_text === "Y").length,
    blocked: rows.filter((row) => row.review_status === "blocked").length,
    ocrReview: rows.filter((row) => row.review_status === "ocr_image_review").length,
    nativeReady: rows.filter((row) => row.review_status === "native_text_ready").length,
  };

  const blockedRows = rows.filter((row) => row.review_status === "blocked" || row.review_status === "needs_text");
  const reviewRows = rows
    .filter((row) => row.review_status !== "native_text_ready")
    .sort((a, b) => a.review_status.localeCompare(b.review_status) || Number(a.rank || 999) - Number(b.rank || 999));

  return `# HWP/HWPX 변환 감사

작성 기준: ${UPDATED_AT}

서울도시공간포털과 광진구청에서 받은 HWP/HWPX 원문만 따로 모은 변환 감사표다. 목적은 한글 파일 처리에서 LibreOffice \`soffice\`에 막힌 항목이 있는지, 자체 추출기로 신뢰 가능한 텍스트를 확보했는지 확인하는 것이다. 새 파일 단건 진단은 \`python3 scripts/convert_hwp_document.py <파일> -o <텍스트> --diagnostics <진단.json>\`으로 처리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| HWP/HWPX 파일 | ${totals.total} |
| HWP | ${totals.hwp} |
| HWPX | ${totals.hwpx} |
| 텍스트 확보 | ${totals.resolved} |
| 자체 텍스트 준비 | ${totals.nativeReady} |
| OCR 이미지 대조 필요 | ${totals.ocrReview} |
| 변환 차단/미해결 | ${totals.blocked} |

## 변환 경로별

${mdTable(countBy(rows, "conversion_path"), [
  { key: "name", label: "변환 경로" },
  { key: "count", label: "건수" },
])}

## 검토 상태별

${mdTable(countBy(rows, "review_status"), [
  { key: "name", label: "검토 상태" },
  { key: "count", label: "건수" },
])}

## 차단/미해결 항목

${blockedRows.length ? mdTable(blockedRows, [
  { key: "source_label", label: "출처" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "source_ext", label: "형식" },
  { key: "extraction_status", label: "상태" },
  { key: "extraction_error", label: "오류" },
  { key: "next_action", label: "다음 액션" },
]) : "현재 HWP/HWPX 변환 차단 또는 미해결 항목은 없다."}

## 검토 큐

${mdTable(reviewRows, [
  { key: "review_status", label: "검토 상태" },
  { key: "source_label", label: "출처" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "source_ext", label: "형식" },
  { key: "conversion_path", label: "변환 경로" },
  { key: "text_char_count", label: "글자 수" },
  { key: "text_path", label: "텍스트 경로" },
  { key: "hwp_ocr_image_count", label: "HWP 이미지" },
  { key: "hwp_ocr_text_path", label: "OCR 텍스트" },
  { key: "next_action", label: "다음 액션" },
])}

## 전체 HWP/HWPX 파일

${mdTable(rows, [
  { key: "source_label", label: "출처" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "source_ext", label: "형식" },
  { key: "conversion_path", label: "변환 경로" },
  { key: "review_status", label: "검토 상태" },
  { key: "text_char_count", label: "글자 수" },
  { key: "source_file", label: "원문" },
  { key: "text_path", label: "텍스트" },
])}

## 해석

1. \`hwp5_body_stream_direct\`는 \`scripts/extract_hwp5_text.py\`가 HWP5 OLE/CFB 컨테이너의 \`BodyText/Section*\` 스트림을 직접 읽은 결과다.
2. \`hwp_bindata_image_ocr\`는 본문 스트림이 비어 있거나 저신뢰인 이미지형 HWP에서 \`BinData\` 이미지를 추출해 OCR한 결과다.
3. \`hwpx_zip_xml_direct\`는 HWPX zip 내부 XML 문단을 직접 읽은 결과다.
4. \`scripts/convert_hwp_document.py\`는 HWP5 본문 직접 추출, HWPX XML 직접 추출, 이미지형 HWP BinData 진단/추출을 단건으로 실행하는 로컬 변환 CLI다.
5. 이 감사표에서 변환 차단 항목이 0이면, 현재 원문 세트는 \`soffice\` 없이도 리서치용 텍스트 추출 단계가 통과된 상태로 본다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const hwpOcrRows = await readJson(HWP_OCR_MANIFEST, []);
  const ocrRowsBySource = new Map(hwpOcrRows.map((row) => [ocrKey(row), row]));
  const rows = [];

  for (const manifest of MANIFESTS) {
    const manifestRows = await readJson(manifest.path);
    rows.push(
      ...manifestRows
        .filter((row) => ["hwp", "hwpx"].includes((row.source_ext || "").toLowerCase()))
        .map((row) => normalizeRow(manifest, row, ocrRowsBySource)),
    );
  }

  rows.sort(
    (a, b) =>
      Number(a.rank || 999) - Number(b.rank || 999) ||
      a.source_label.localeCompare(b.source_label) ||
      a.source_file.localeCompare(b.source_file),
  );

  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        hwp: rows.filter((row) => row.source_ext === "hwp").length,
        hwpx: rows.filter((row) => row.source_ext === "hwpx").length,
        resolved: rows.filter((row) => row.resolved_text === "Y").length,
        blocked: rows.filter((row) => row.review_status === "blocked").length,
        ocr_image_review: rows.filter((row) => row.review_status === "ocr_image_review").length,
        output: OUT_MD,
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
