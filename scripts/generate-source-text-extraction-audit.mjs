#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-text-extraction-audit.md");
const OUT_CSV = path.join(OUT_DIR, "source-text-extraction-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "source-text-extraction-audit.json");
const HANYANGGARO_SOURCE_PAGES_INPUT = "data/urban/gwangjin-gu-hanyanggaro-source-pages.json";
const YAKSU_OCR_RECHECK_INPUT = "analysis/expansion-yaksu-ocr-recheck-board.json";

const INPUTS = [
  {
    source_group: "seoul_urban_notice",
    source_label: "서울도시공간포털 고시 원문",
    manifest: "data/urban/text/notice-text-manifest.json",
    source_kind: "notice",
  },
  {
    source_group: "gwangjin_district_notice",
    source_label: "광진구청 고시공고 첨부",
    manifest: "data/urban/text/gwangjin-gu-notice-text-manifest.json",
    source_kind: "district_attachment",
  },
];

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

function extractionMethod(row) {
  const ext = (row.source_ext || "").toLowerCase();
  const status = row.extraction_status || "";
  if (ext === "hwp" && status === "hwp_ocr_extracted") return "hwp_binaries_ocr";
  if (ext === "hwp" && status === "extracted") return "hwp5_body_stream";
  if (ext === "hwpx" && status === "extracted") return "hwpx_zip_xml";
  if (ext === "pdf" && status === "ocr_extracted") return "pdf_ocr";
  if (ext === "pdf" && status === "extracted") return "pdf_text_layer";
  if (status.includes("pending") || status.includes("conversion")) return "external_conversion_pending";
  if (status.includes("low_confidence")) return "low_confidence";
  return status || "unknown";
}

function isResolved(row) {
  return Boolean(row.text_path) && Number(row.text_char_count || 0) > 0;
}

function requiresSoffice(row) {
  const status = row.extraction_status || "";
  return status === "hwp_pending_external_conversion" || status === "hwp_conversion_failed";
}

function reviewPriority(row, verifiedOcrSet) {
  if (verifiedOcrSet.has(String(row.shortlist_id || ""))) return "P3_ocr_rechecked";
  if (requiresSoffice(row)) return "P0_external_converter";
  if (!isResolved(row)) return "P0_missing_text";
  if (row.extraction_status === "hwp_ocr_extracted") return "P1_ocr_verify";
  if (row.extraction_status === "ocr_extracted") return "P1_ocr_verify";
  if (Number(row.text_char_count || 0) < 500) return "P2_short_form";
  if ((row.source_ext || "").toLowerCase() === "hwp") return "P2_hwp_direct_check";
  return "P3_text_layer";
}

function textQualityFlag(row, verifiedOcrSet) {
  if (verifiedOcrSet.has(String(row.shortlist_id || ""))) return "pdf_image_ocr_rechecked";
  if (requiresSoffice(row)) return "external_conversion_needed";
  if (!isResolved(row)) return "missing_text";
  if (row.extraction_status === "hwp_ocr_extracted") return "hwp_image_ocr_verify";
  if (row.extraction_status === "ocr_extracted") return "pdf_image_ocr_verify";
  if (Number(row.text_char_count || 0) < 500) return "short_form_or_cover_page";
  if ((row.source_ext || "").toLowerCase() === "hwp") return "hwp5_direct_body_stream";
  if ((row.source_ext || "").toLowerCase() === "hwpx") return "hwpx_xml_text";
  return "text_layer";
}

function sourceMeta(input, row) {
  const sourceFile = row.source_file || "";
  if (input.source_group === "seoul_urban_notice" && /\/\d+-gangnam-gu-|\/\d+-songpa-gu-/.test(sourceFile)) {
    return {
      source_group: "gangnam_songpa_district_notice",
      source_label: "강남·송파구청 고시공고 첨부",
    };
  }
  return {
    source_group: input.source_group,
    source_label: input.source_label,
  };
}

function normalizeRow(input, row, verifiedOcrSet) {
  const sourceTitle = row.notice_title || row.notice_no || row.attachment_name || "";
  const meta = sourceMeta(input, row);
  return {
    shortlist_id: row.shortlist_id || "",
    source_group: meta.source_group,
    source_label: meta.source_label,
    rank: row.rank || "",
    focus_area: row.focus_area || "",
    district: row.district || "",
    project_name: row.project_name || "",
    source_title: sourceTitle,
    source_file: row.source_file || "",
    source_ext: (row.source_ext || "").toLowerCase(),
    extraction_status: row.extraction_status || "",
    extraction_method: extractionMethod(row),
    text_char_count: Number(row.text_char_count || 0),
    text_path: row.text_path || "",
    resolved_text: isResolved(row) ? "Y" : "N",
    soffice_required: requiresSoffice(row) ? "Y" : "N",
    review_priority: reviewPriority(row, verifiedOcrSet),
    text_quality_flag: textQualityFlag(row, verifiedOcrSet),
    extraction_error: row.extraction_error || "",
  };
}

function normalizeHanyanggaroSourcePage(row) {
  const sourceFile = row.html_path || "";
  const textPath = row.text_path || "";
  const textChars = Number(row.text_char_count || 0);
  return {
    source_group: "gwangjin_district_notice",
    source_label: "광진구청 고시공고 첨부",
    rank: "25",
    focus_area: "구의/광진",
    district: "광진구",
    project_name: "한양연립 일대 가로주택정비사업",
    source_title: row.label || row.notice_no || row.id || "",
    source_file: sourceFile,
    source_ext: path.extname(sourceFile).replace(".", "").toLowerCase() || "html",
    extraction_status: "extracted",
    extraction_method: "html_preserved_text",
    text_char_count: textChars,
    text_path: textPath,
    resolved_text: textPath && textChars > 0 ? "Y" : "N",
    soffice_required: "N",
    review_priority: textChars > 0 && textChars < 500 ? "P2_short_form" : "P3_text_layer",
    text_quality_flag: "html_preserved_text",
    extraction_error: "",
  };
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

function groupedCounts(rows, field) {
  const groups = [
    { source_group: "seoul_urban_notice", source_label: "서울도시공간포털 고시 원문" },
    { source_group: "gangnam_songpa_district_notice", source_label: "강남·송파구청 고시공고 첨부" },
    { source_group: "gwangjin_district_notice", source_label: "광진구청 고시공고 첨부" },
  ];
  return groups.map((input) => {
    const groupRows = rows.filter((row) => row.source_group === input.source_group);
    return {
      source_group: input.source_group,
      source_label: input.source_label,
      total: groupRows.length,
      resolved: groupRows.filter((row) => row.resolved_text === "Y").length,
      unresolved: groupRows.filter((row) => row.resolved_text !== "Y").length,
      soffice_required: groupRows.filter((row) => row.soffice_required === "Y").length,
      pdf: groupRows.filter((row) => row.source_ext === "pdf").length,
      hwp: groupRows.filter((row) => row.source_ext === "hwp").length,
      hwpx: groupRows.filter((row) => row.source_ext === "hwpx").length,
      methods: countBy(groupRows, field).map((item) => `${item.name} ${item.count}`).join("; "),
    };
  });
}

function markdown(rows) {
  const totals = {
    total: rows.length,
    resolved: rows.filter((row) => row.resolved_text === "Y").length,
    unresolved: rows.filter((row) => row.resolved_text !== "Y").length,
    soffice_required: rows.filter((row) => row.soffice_required === "Y").length,
    hwp: rows.filter((row) => row.source_ext === "hwp").length,
    hwpx: rows.filter((row) => row.source_ext === "hwpx").length,
    pdf: rows.filter((row) => row.source_ext === "pdf").length,
    ocr_verify: rows.filter((row) => row.review_priority === "P1_ocr_verify").length,
    ocr_rechecked: rows.filter((row) => row.review_priority === "P3_ocr_rechecked").length,
    short_form: rows.filter((row) => row.review_priority === "P2_short_form").length,
  };
  const priorityRows = countBy(rows, "review_priority");
  const methodRows = countBy(rows, "extraction_method");
  const qualityRows = countBy(rows, "text_quality_flag");
  const unresolvedRows = rows.filter((row) => row.resolved_text !== "Y" || row.soffice_required === "Y");
  const verifiedOcrRows = rows.filter((row) => row.review_priority === "P3_ocr_rechecked");
  const reviewRows = rows
    .filter((row) => !["P3_text_layer", "P3_ocr_rechecked"].includes(row.review_priority))
    .sort((a, b) => a.review_priority.localeCompare(b.review_priority) || Number(a.rank || 999) - Number(b.rank || 999));

  return `# 원문 텍스트 추출 감사

작성 기준: ${kstDate()} KST

서울도시공간포털 고시 원문과 자치구 고시공고 첨부의 텍스트 추출 상태를 합쳐 본 감사표다. 목적은 HWP/HWPX/PDF 원문을 공식 근거로 쓸 수 있는지, 그리고 LibreOffice \`soffice\` 없이 처리 가능한 범위를 확인하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 원문/첨부 파일 | ${totals.total} |
| 텍스트 확보 | ${totals.resolved} |
| 미해결 추출 | ${totals.unresolved} |
| soffice 필요 상태 | ${totals.soffice_required} |
| PDF | ${totals.pdf} |
| HWP | ${totals.hwp} |
| HWPX | ${totals.hwpx} |
| OCR 원문 대조 필요 | ${totals.ocr_verify} |
| OCR 이미지 재대조 완료 | ${totals.ocr_rechecked} |
| 짧은 서식/표지 확인 필요 | ${totals.short_form} |

## 출처별 커버리지

${mdTable(groupedCounts(rows, "extraction_method"), [
  { key: "source_label", label: "출처" },
  { key: "total", label: "파일" },
  { key: "resolved", label: "텍스트 확보" },
  { key: "unresolved", label: "미해결" },
  { key: "soffice_required", label: "soffice 필요" },
  { key: "pdf", label: "PDF" },
  { key: "hwp", label: "HWP" },
  { key: "hwpx", label: "HWPX" },
  { key: "methods", label: "추출 방식" },
])}

## 추출 방식별

${mdTable(methodRows, [
  { key: "name", label: "추출 방식" },
  { key: "count", label: "건수" },
])}

## 검토 우선순위

${mdTable(priorityRows, [
  { key: "name", label: "우선순위" },
  { key: "count", label: "건수" },
])}

## 텍스트 품질 플래그

${mdTable(qualityRows, [
  { key: "name", label: "품질 플래그" },
  { key: "count", label: "건수" },
])}

## 미해결 항목

${unresolvedRows.length ? mdTable(unresolvedRows, [
  { key: "source_label", label: "출처" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "source_ext", label: "형식" },
  { key: "extraction_status", label: "상태" },
  { key: "extraction_error", label: "오류" },
]) : "현재 미해결 추출 항목은 없다."}

## 원문 대조 큐

${mdTable(reviewRows, [
  { key: "review_priority", label: "우선순위" },
  { key: "source_label", label: "출처" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "source_ext", label: "형식" },
  { key: "extraction_method", label: "추출 방식" },
  { key: "text_quality_flag", label: "품질" },
  { key: "text_char_count", label: "글자 수" },
  { key: "text_path", label: "텍스트 경로" },
])}

## OCR 재대조 완료

${verifiedOcrRows.length ? mdTable(verifiedOcrRows, [
  { key: "source_label", label: "출처" },
  { key: "project_name", label: "사업장" },
  { key: "source_ext", label: "형식" },
  { key: "extraction_method", label: "추출 방식" },
  { key: "text_quality_flag", label: "품질" },
  { key: "text_char_count", label: "글자 수" },
  { key: "text_path", label: "텍스트 경로" },
]) : "_없음_"}

## 해석

1. 현재 manifest 기준으로 \`soffice_required=Y\`인 항목은 없다.
2. HWP5 본문 스트림은 \`scripts/extract_hwp5_text.py\`로 직접 추출하고, 이미지형 HWP는 BinData 이미지 OCR 결과를 사용한다.
3. HWPX는 zip 내부 XML을 직접 읽어 추출한다.
4. \`P1_ocr_verify\`는 아직 이미지 대조가 남은 OCR 큐다.
5. \`P3_ocr_rechecked\`는 OCR 텍스트를 원문 이미지와 대조해 비교 매트릭스에 올릴 수 있는 상태로 닫힌 항목이다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const yaksuRecheck = await optionalJson(YAKSU_OCR_RECHECK_INPUT);
  const verifiedOcrSet = new Set(
    (Array.isArray(yaksuRecheck?.rows) ? yaksuRecheck.rows : [])
      .filter((row) => row.verification_state === "confirmed_snapshot")
      .map((row) => String(row.shortlist_id || "")),
  );
  const rows = [];
  for (const input of INPUTS) {
    const manifestRows = await readJson(input.manifest);
    rows.push(...manifestRows.map((row) => normalizeRow(input, row, verifiedOcrSet)));
  }
  const fallbackHanyanggaroRows = (await optionalJson(HANYANGGARO_SOURCE_PAGES_INPUT))
    .filter((row) => row.text_path)
    .map((row) => normalizeHanyanggaroSourcePage(row));
  for (const row of fallbackHanyanggaroRows) {
    const alreadyPresent = rows.some(
      (item) =>
        (item.text_path && item.text_path === row.text_path) ||
        (item.source_file && item.source_file === row.source_file),
    );
    if (!alreadyPresent) rows.push(row);
  }
  rows.sort((a, b) => Number(a.rank || 999) - Number(b.rank || 999) || a.source_group.localeCompare(b.source_group));
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(JSON.stringify({
    rows: rows.length,
    resolved: rows.filter((row) => row.resolved_text === "Y").length,
    unresolved: rows.filter((row) => row.resolved_text !== "Y").length,
    soffice_required: rows.filter((row) => row.soffice_required === "Y").length,
    output: "analysis/source-text-extraction-audit.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
