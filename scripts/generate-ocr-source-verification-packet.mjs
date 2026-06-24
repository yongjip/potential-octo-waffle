#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "ocr-source-verification-packet.md");
const OUT_CSV = path.join(OUT_DIR, "ocr-source-verification-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "ocr-source-verification-packet.json");

const CORE_LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";
const TEXT_AUDIT_INPUT = "analysis/source-text-extraction-audit.json";
const OCR_MANIFEST_INPUTS = [
  "data/urban/text/ocr/ocr-text-manifest.json",
  "data/urban/text/ocr/hwp-ocr-text-manifest.json",
  "data/urban/text/gwangjin-gu/ocr/ocr-text-manifest.json",
];

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

const FIELD_KEYWORDS = {
  district_area_sqm: ["정비구역", "구역면적", "면적"],
  total_households: ["세대", "세대수", "공동주택"],
  floor_area_ratio_pct: ["용적률"],
  building_coverage_ratio_pct: ["건폐율"],
  max_height_m: ["높이", "최고높이", "이하"],
  floors: ["층수", "최고층수", "지상", "지하"],
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

async function optionalText(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

async function optionalDir(file) {
  try {
    return await readdir(file);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizedNumberTokens(value) {
  return [...new Set(String(value ?? "").match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/g) || [])].flatMap((token) => {
    const noComma = token.replaceAll(",", "");
    return token === noComma ? [token] : [token, noComma];
  });
}

function splitSections(text) {
  const marker = /---\s+(OCR page|HWP image OCR)\s+(\d+)(?:\s+([^-]+?))?\s+---/g;
  const matches = [...text.matchAll(marker)];
  if (!matches.length) return [{ section_type: "text", section_index: "", section_label: "text", text: compact(text) }];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    return {
      section_type: match[1] === "OCR page" ? "page" : "hwp_image",
      section_index: match[2],
      section_label: compact(`${match[1]} ${match[2]} ${match[3] || ""}`),
      text: compact(text.slice(start, end)),
    };
  });
}

function scoreSection(section, ledgerRow) {
  const text = section.text;
  const valueTokens = normalizedNumberTokens(ledgerRow.current_value);
  const keywords = FIELD_KEYWORDS[ledgerRow.field_id] || [ledgerRow.field_label];
  let score = 0;
  for (const token of valueTokens) {
    if (token && text.includes(token)) score += 8;
  }
  for (const keyword of keywords) {
    if (keyword && text.includes(keyword)) score += 3;
  }
  if (ledgerRow.field_id === "floors" && /지상|지하|층/.test(text)) score += 4;
  return score;
}

function snippetFor(section, ledgerRow) {
  const text = section.text;
  const terms = [...normalizedNumberTokens(ledgerRow.current_value), ...(FIELD_KEYWORDS[ledgerRow.field_id] || [ledgerRow.field_label])].filter(Boolean);
  const positions = terms.map((term) => text.indexOf(term)).filter((index) => index >= 0);
  const center = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, center - 130);
  const end = Math.min(text.length, center + 230);
  return compact(text.slice(start, end));
}

function pickSection(sections, ledgerRow) {
  return sections
    .map((section) => ({ ...section, match_score: scoreSection(section, ledgerRow) }))
    .sort((a, b) => b.match_score - a.match_score || Number(a.section_index || 999) - Number(b.section_index || 999))[0];
}

function stemFromTextPath(textPath) {
  return path.basename(textPath || "", path.extname(textPath || ""));
}

async function imagePathFor(textRow, section, ocrManifestByTextPath) {
  const manifestRow = ocrManifestByTextPath[textRow.text_path] || {};
  const stem = stemFromTextPath(textRow.text_path);
  if (!stem || !section?.section_index) return "";

  if (textRow.extraction_method === "hwp_binaries_ocr") {
    const manifestPath = path.join("data/urban/text/ocr/hwp-images", stem, "bindata-manifest.json");
    const images = (await optionalJson(manifestPath)).filter((item) => !item.duplicate_of);
    const image = images[Number(section.section_index) - 1];
    return image?.output_path ? path.relative(process.cwd(), image.output_path) : "";
  }

  const imageRoot = textRow.source_group === "gwangjin_district_notice" ? "data/urban/text/gwangjin-gu/ocr/images" : "data/urban/text/ocr/images";
  const dir = path.join(imageRoot, stem);
  const pageNo = Number(section.section_index);
  const names = (await optionalDir(dir)).filter((name) => /^page-\d+\.png$/.test(name));
  const name = names.find((item) => Number(item.match(/\d+/)?.[0] || 0) === pageNo);
  if (name) return path.join(dir, name);

  if (manifestRow.page_count === 1 && names.length === 1) return path.join(dir, names[0]);
  return "";
}

function relatedTextRows(ledgerRow, textAuditRows) {
  const sourceText = ledgerRow.source_to_open || "";
  const rankRows = textAuditRows.filter((row) => String(row.rank) === String(ledgerRow.rank) && row.review_priority === "P1_ocr_verify");
  const direct = rankRows.filter((row) => row.text_path && sourceText.includes(row.text_path));
  return direct.length ? direct : rankRows;
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
  const unmatched = rows.filter((row) => Number(row.match_score || 0) === 0 || !row.image_path);
  return `# OCR 원문 검수 패킷

작성 기준: ${UPDATED_AT}

핵심 수치 확인 장부의 \`ocr_review_required\` 필드를 OCR 텍스트 구간과 원문 이미지 경로에 연결한 검수 패킷이다. 이 문서는 수치를 확정하지 않고, 원문 이미지와 OCR 스니펫을 빠르게 대조하기 위한 작업 목록이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| OCR 검수 필드 | ${rows.length} |
| 후보 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| OCR 원문/첨부 | ${new Set(rows.map((row) => row.text_path)).size} |
| 이미지 경로 연결 | ${rows.filter((row) => row.image_path).length} |
| 스니펫 매칭 점수 0 | ${rows.filter((row) => Number(row.match_score || 0) === 0).length} |

## 출처별

${mdTable(countBy(rows, "source_label"), [
  { key: "name", label: "출처" },
  { key: "count", label: "필드 수" },
])}

## 사업장별

${mdTable(countBy(rows, "project_name"), [
  { key: "name", label: "사업장" },
  { key: "count", label: "필드 수" },
])}

## 검수 패킷

${mdTable(rows, [
  { key: "packet_rank", label: "패킷" },
  { key: "ledger_rank", label: "장부" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "ocr_section", label: "OCR 구간" },
  { key: "match_score", label: "점수" },
  { key: "image_path", label: "원문 이미지" },
  { key: "ocr_snippet", label: "OCR 스니펫" },
])}

## 추가 확인 필요

${unmatched.length ? mdTable(unmatched, [
  { key: "packet_rank", label: "패킷" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "ocr_section", label: "OCR 구간" },
  { key: "match_score", label: "점수" },
  { key: "image_path", label: "원문 이미지" },
]) : "현재 이미지 경로 또는 스니펫 매칭이 비어 있는 항목은 없다."}

## 사용법

1. \`image_path\`의 원문 이미지를 열고 \`ocr_snippet\` 주변 숫자와 단위를 대조한다.
2. 원문 이미지와 OCR 텍스트가 일치하면 핵심 수치 장부와 사업별 메모의 해당 필드를 \`confirmed_from_ocr_image\`로 승격한다.
3. OCR 스니펫 숫자가 흐리거나 누락되면 같은 원문 PDF/HWP의 인접 페이지/이미지를 직접 확인한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [ledgerRows, textAuditRows, ...ocrManifestGroups] = await Promise.all([
    readJson(CORE_LEDGER_INPUT),
    readJson(TEXT_AUDIT_INPUT),
    ...OCR_MANIFEST_INPUTS.map((file) => optionalJson(file)),
  ]);
  const ocrManifestByTextPath = Object.fromEntries(ocrManifestGroups.flat().map((row) => [row.ocr_text_path, row]));
  const rows = [];

  for (const ledgerRow of ledgerRows.filter((row) => row.verification_status === "ocr_review_required")) {
    for (const textRow of relatedTextRows(ledgerRow, textAuditRows)) {
      const text = await optionalText(textRow.text_path);
      const sections = splitSections(text);
      const section = pickSection(sections, ledgerRow);
      const imagePath = await imagePathFor(textRow, section, ocrManifestByTextPath);
      rows.push({
        ledger_rank: ledgerRow.ledger_rank,
        rank: ledgerRow.rank,
        focus_area: ledgerRow.focus_area,
        district: ledgerRow.district,
        project_name: ledgerRow.project_name,
        current_stage: ledgerRow.current_stage,
        field_id: ledgerRow.field_id,
        field_label: ledgerRow.field_label,
        current_value: ledgerRow.current_value,
        source_label: textRow.source_label,
        extraction_method: textRow.extraction_method,
        text_quality_flag: textRow.text_quality_flag,
        text_path: textRow.text_path,
        ocr_section: section?.section_label || "",
        image_path: imagePath,
        match_score: section?.match_score ?? 0,
        ocr_snippet: snippetFor(section || { text: "" }, ledgerRow),
        verification_action: "원문 이미지와 OCR 스니펫의 숫자·단위·필드 문맥을 대조해 confirmed_from_ocr_image/pending_ocr_review로 표시",
        project_note: ledgerRow.project_note,
      });
    }
  }

  rows.sort((a, b) => Number(a.ledger_rank) - Number(b.ledger_rank) || a.text_path.localeCompare(b.text_path));
  const rankedRows = rows.map((row, index) => ({ packet_rank: index + 1, ...row }));
  await writeFile(OUT_JSON, `${JSON.stringify(rankedRows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rankedRows), "utf8");
  await writeFile(OUT_MD, markdown(rankedRows), "utf8");
  console.log(JSON.stringify({
    rows: rankedRows.length,
    projects: new Set(rankedRows.map((row) => row.rank)).size,
    image_paths: rankedRows.filter((row) => row.image_path).length,
    zero_match_score: rankedRows.filter((row) => Number(row.match_score || 0) === 0).length,
    output: "analysis/ocr-source-verification-packet.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
