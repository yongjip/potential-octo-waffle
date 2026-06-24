#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "ocr-source-review-triage.md");
const OUT_CSV = path.join(OUT_DIR, "ocr-source-review-triage.csv");
const OUT_JSON = path.join(OUT_DIR, "ocr-source-review-triage.json");

const OCR_PACKET_INPUT = "analysis/ocr-source-verification-packet.json";
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

const FIELD_NUMBER_UNITS = {
  district_area_sqm: ["㎡", "m2", "고"],
  total_households: ["세대", "호"],
  floor_area_ratio_pct: ["%", "퍼센트"],
  building_coverage_ratio_pct: ["%", "퍼센트"],
  max_height_m: ["m", "미터"],
  floors: ["층"],
};

const FIELD_KEYWORDS = {
  district_area_sqm: ["구역면적", "면 적", "면적", "정비구역"],
  total_households: ["세대수", "세대", "공동주택"],
  floor_area_ratio_pct: ["용적률", "상한용적률", "허용용적률"],
  building_coverage_ratio_pct: ["건폐율"],
  max_height_m: ["최고높이", "높이계획", "높이"],
  floors: ["최고층수", "층수", "최고"],
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

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function numberTokens(value) {
  return [...new Set(String(value ?? "").match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/g) || [])];
}

function numericVariants(token) {
  const variants = new Set([token]);
  const noComma = token.replaceAll(",", "");
  variants.add(noComma);
  if (/^\d+(?:\.0+)?$/.test(noComma)) variants.add(String(Number(noComma)));
  return [...variants].filter(Boolean);
}

function valueMatchLevel(row) {
  const tokens = numberTokens(row.current_value);
  if (!tokens.length) return "none";
  const text = row.ocr_snippet || "";
  const matched = tokens.filter((token) => numericVariants(token).some((variant) => text.includes(variant)));
  if (matched.length === tokens.length) return "all";
  if (matched.length > 0) return "partial";
  return "none";
}

function snippetNumbers(row) {
  const units = FIELD_NUMBER_UNITS[row.field_id] || [];
  const text = row.ocr_snippet || "";
  const keywords = FIELD_KEYWORDS[row.field_id] || [row.field_label];
  const windows = [];
  for (const keyword of keywords) {
    let startIndex = text.indexOf(keyword);
    while (startIndex >= 0) {
      windows.push(text.slice(Math.max(0, startIndex - 35), Math.min(text.length, startIndex + 180)));
      startIndex = text.indexOf(keyword, startIndex + keyword.length);
    }
  }
  if (!windows.length) return "";
  const currentVariants = new Set(numberTokens(row.current_value).flatMap(numericVariants));
  const values = [];
  for (const window of windows) {
    const matches = [...window.matchAll(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*([가-힣㎡%a-zA-Z0-9.]*)/g)];
    for (const match of matches) {
      const number = match[1];
      const unit = match[2] || "";
      const normalized = number.replaceAll(",", "");
      const numeric = Number(normalized);
      const unitLooksRelevant = units.length === 0 || !unit || units.some((item) => unit.includes(item));
      if (!Number.isFinite(numeric) || !unitLooksRelevant) continue;
      if (!candidateInFieldRange(row.field_id, numeric)) continue;
      if (!currentVariants.has(number) && !currentVariants.has(normalized)) {
        values.push(`${number}${unit}`);
      }
      if (values.length >= 8) break;
    }
    if (values.length >= 8) break;
  }
  return [...new Set(values)].join("; ");
}

function candidateInFieldRange(fieldId, numeric) {
  if (fieldId === "district_area_sqm") return numeric >= 1000;
  if (fieldId === "total_households") return numeric >= 20 && numeric <= 10000;
  if (fieldId === "floor_area_ratio_pct") return numeric >= 50 && numeric <= 800;
  if (fieldId === "building_coverage_ratio_pct") return numeric >= 1 && numeric <= 100;
  if (fieldId === "max_height_m") return numeric >= 10 && numeric <= 300;
  if (fieldId === "floors") return numeric >= 1 && numeric <= 100;
  return true;
}

function confidenceBucket(score) {
  if (score >= 16) return "strong";
  if (score >= 12) return "good";
  if (score >= 8) return "context_only";
  if (score > 0) return "weak";
  return "poor_ocr";
}

function reviewStatus(row, matchLevel, alternateNumbers) {
  const score = Number(row.match_score || 0);
  if (score === 0) return "poor_ocr_direct_image_required";
  if (matchLevel === "none" && alternateNumbers) return "ocr_snippet_value_mismatch";
  if (matchLevel === "all" && score >= 12) return "ready_for_image_confirmation";
  if (matchLevel !== "none" && score >= 8) return "image_confirmation_candidate";
  return "manual_image_review_required";
}

function nextAction(status) {
  const actions = {
    ready_for_image_confirmation: "원문 이미지에서 같은 행의 숫자와 단위를 확인하면 confirmed_from_ocr_image로 승격",
    image_confirmation_candidate: "OCR 스니펫이 일부 맞으므로 원문 이미지에서 같은 표 행·열을 확인",
    ocr_snippet_value_mismatch: "OCR 스니펫의 대체 숫자와 장부 현재값의 기준시점·출처 차이를 비교해 conflict/source_date_split로 분리",
    manual_image_review_required: "OCR 스니펫만으로 부족하므로 원문 이미지와 인접 페이지를 직접 확인",
    poor_ocr_direct_image_required: "OCR 매칭 실패. 원문 이미지를 직접 확대 확인하거나 재OCR/원본 PDF 재처리",
  };
  return actions[status] || "원문 이미지 직접 확인";
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
  const priorityRows = rows.filter((row) => row.review_status !== "ready_for_image_confirmation");
  return `# OCR 수치 검수 트리아지

작성 기준: ${UPDATED_AT}

\`analysis/ocr-source-verification-packet.md\`의 OCR 스니펫을 수치 기준으로 한 번 더 분류한 검수표다. 여기서 \`ready_for_image_confirmation\`은 자동 확정이 아니라 원문 이미지만 확인하면 승격 가능한 후보라는 뜻이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 트리아지 행 | ${rows.length} |
| 후보 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 이미지 확인 후보 | ${rows.filter((row) => row.review_status === "ready_for_image_confirmation").length} |
| 값 불일치 후보 | ${rows.filter((row) => row.review_status === "ocr_snippet_value_mismatch").length} |
| 직접 이미지 확인 필요 | ${rows.filter((row) => row.review_status === "manual_image_review_required" || row.review_status === "poor_ocr_direct_image_required").length} |

## 상태별

${mdTable(countBy(rows, "review_status"), [
  { key: "name", label: "검수 상태" },
  { key: "count", label: "건수" },
])}

## 신뢰도별

${mdTable(countBy(rows, "confidence_bucket"), [
  { key: "name", label: "신뢰도" },
  { key: "count", label: "건수" },
])}

## 우선 확인

${mdTable(priorityRows, [
  { key: "triage_rank", label: "순번" },
  { key: "review_status", label: "상태" },
  { key: "confidence_bucket", label: "신뢰도" },
  { key: "packet_rank", label: "패킷" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "value_match_level", label: "현재값 매칭" },
  { key: "alternate_ocr_numbers", label: "대체 OCR 숫자" },
  { key: "image_path", label: "원문 이미지" },
  { key: "next_review_action", label: "다음 검수" },
])}

## 전체 트리아지

${mdTable(rows, [
  { key: "triage_rank", label: "순번" },
  { key: "review_status", label: "상태" },
  { key: "packet_rank", label: "패킷" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재 값" },
  { key: "match_score", label: "점수" },
  { key: "value_match_level", label: "현재값 매칭" },
  { key: "alternate_ocr_numbers", label: "대체 OCR 숫자" },
])}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const packetRows = await readJson(OCR_PACKET_INPUT);
  const rows = packetRows.map((row) => {
    const matchLevel = valueMatchLevel(row);
    const alternateNumbers = snippetNumbers(row);
    const status = reviewStatus(row, matchLevel, alternateNumbers);
    return {
      packet_rank: row.packet_rank,
      ledger_rank: row.ledger_rank,
      rank: row.rank,
      focus_area: row.focus_area,
      district: row.district,
      project_name: row.project_name,
      current_stage: row.current_stage,
      field_id: row.field_id,
      field_label: row.field_label,
      current_value: row.current_value,
      review_status: status,
      confidence_bucket: confidenceBucket(Number(row.match_score || 0)),
      match_score: row.match_score,
      value_match_level: matchLevel,
      alternate_ocr_numbers: alternateNumbers,
      ocr_section: row.ocr_section,
      image_path: row.image_path,
      ocr_snippet: compact(row.ocr_snippet),
      next_review_action: nextAction(status),
      project_note: row.project_note,
    };
  });
  rows.sort(
    (a, b) =>
      statusWeight(b.review_status) - statusWeight(a.review_status) ||
      Number(b.match_score || 0) - Number(a.match_score || 0) ||
      Number(a.packet_rank) - Number(b.packet_rank),
  );
  const rankedRows = rows.map((row, index) => ({ triage_rank: index + 1, ...row }));
  await writeFile(OUT_JSON, `${JSON.stringify(rankedRows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rankedRows), "utf8");
  await writeFile(OUT_MD, markdown(rankedRows), "utf8");
  console.log(JSON.stringify({
    rows: rankedRows.length,
    ready_for_image_confirmation: rankedRows.filter((row) => row.review_status === "ready_for_image_confirmation").length,
    value_mismatch: rankedRows.filter((row) => row.review_status === "ocr_snippet_value_mismatch").length,
    direct_image_required: rankedRows.filter((row) => row.review_status === "manual_image_review_required" || row.review_status === "poor_ocr_direct_image_required").length,
    output: "analysis/ocr-source-review-triage.{md,csv,json}",
  }, null, 2));
}

function statusWeight(status) {
  const weights = {
    ocr_snippet_value_mismatch: 500,
    poor_ocr_direct_image_required: 450,
    manual_image_review_required: 400,
    image_confirmation_candidate: 300,
    ready_for_image_confirmation: 200,
  };
  return weights[status] || 0;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
