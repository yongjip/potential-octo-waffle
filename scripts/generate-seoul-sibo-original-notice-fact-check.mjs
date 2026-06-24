#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const OUT_DIR = "analysis";
const SOURCE_OUT_JSON = "data/urban/seoul-sibo-original-notice-sources.json";
const SOURCE_OUT_CSV = "data/urban/seoul-sibo-original-notice-sources.csv";
const GENERATED_AT_DATE = kstDate();
const UPDATED_AT = `${GENERATED_AT_DATE} KST`;

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

const SOURCE = {
  source_id: "seoul-sibo-4146-20260430-2026-249",
  source_name: "서울시보 제4146호",
  issue_no: "4146",
  issue_date: "2026-04-30",
  notice_no: "2026-249",
  project_rank: "27",
  project_name: "광장극동아파트 재건축사업",
  official_url: "https://www.seoul.go.kr/func/seoulsibo/fileDownload.do?fileName=seoulsibo_20260429165724_02427.pdf",
  official_list_url: "https://www.seoul.go.kr/func/seoulsibo/list.do",
  local_pdf: "data/urban/files/27-seoul-sibo-4146-20260430.pdf",
  extracted_text: "data/urban/text/seoul-sibo-4146-20260430.txt",
  ocr_text: "data/urban/text/seoul-sibo/ocr/files/27-seoul-sibo-4146-20260430-2026-249.txt",
  ocr_manifest: "data/urban/text/seoul-sibo/ocr/ocr-page-range-manifest.json",
  pdf_pages_ocr: "266-302",
  extraction_status: "pdf_text_plus_page_ocr",
  note: "PDF 본문 첫 페이지는 텍스트 추출, 결정조서·표 구간은 페이지 이미지 OCR로 보완.",
};

const FACT_SPECS = [
  {
    category: "원문확인",
    field: "본고시 원문",
    official_value: "서울특별시고시 제2026-249호, 서울시보 제4146호, 2026-04-30",
    existing_field: "notice_no / notice_date",
    existing_value_from_matrix: (row) => `${row.notice_no || ""} / ${row.notice_date || ""}`,
    status: "match",
    source_page: "PDF 266",
    evidence_note: "서울시보 목차와 본문에서 고시번호·사업명이 확인됨.",
  },
  {
    category: "절차",
    field: "도시계획 심의",
    official_value: "2025년 제14차 도시계획 수권분과위원회 심의, 2025-12-24, 수정가결",
    existing_field: "",
    existing_value_from_matrix: () => "",
    status: "new_official_context",
    source_page: "PDF 266",
    evidence_note: "정비구역 지정 전 절차 맥락으로 보존.",
  },
  {
    category: "정비구역",
    field: "정비구역 면적",
    official_value: "79,417.2㎡",
    existing_field: "district_area_sqm_official",
    existing_value_from_matrix: (row) => row.district_area_sqm_official,
    status: "match",
    source_page: "PDF 266 OCR",
    evidence_note: "기존 매트릭스와 동일. 사업구역 레이어 면적 76,364㎡와는 레이어 범위 차이로 별도 관리.",
  },
  {
    category: "시행규모",
    field: "기존/증가/계획 세대수",
    official_value: "기존 1,344세대, 증가 705세대, 계획 2,049세대",
    existing_field: "total_households_official",
    existing_value_from_matrix: (row) => row.total_households_official,
    status: "fills_missing_matrix_value",
    source_page: "PDF 283 OCR",
    evidence_note: "정비사업 시행계획 표에서 확인. 기존 매트릭스의 총세대수 공란을 보완 가능.",
  },
  {
    category: "주택공급",
    field: "주택공급계획",
    official_value: "총 2,049세대, 분양 1,576세대, 공공 473세대",
    existing_field: "",
    existing_value_from_matrix: () => "",
    status: "new_official_context",
    source_page: "PDF 277 OCR",
    evidence_note: "공공주택 비중과 일반분양 분석의 기준값.",
  },
  {
    category: "건축계획",
    field: "층수/높이",
    official_value: "지하 4층/지상 49층, 높이 155.7m 이하",
    existing_field: "floors_official / max_height_m_official",
    existing_value_from_matrix: (row) => `${row.floors_official || ""} / ${row.max_height_m_official || ""}`,
    status: "match_or_rounding",
    source_page: "PDF 277 OCR",
    evidence_note: "매트릭스의 높이 156m는 소수점 반올림으로 봐도 무리 없음.",
  },
  {
    category: "개발밀도",
    field: "용적률 체계",
    official_value: "기준 210%, 허용 230%, 상한 250%, 예정 법적상한 300%, 추가완화 법적상한 339.50%",
    existing_field: "floor_area_ratio_pct_official",
    existing_value_from_matrix: (row) => row.floor_area_ratio_pct_official,
    status: "match_or_rounding",
    source_page: "PDF 277·279 OCR",
    evidence_note: "기존 매트릭스 FAR 340%는 339.50% 반올림값으로 해석 가능.",
  },
  {
    category: "공공기여",
    field: "토지 기부채납 면적",
    official_value: "합계 7,770.20㎡, 도로 1,598.40㎡, 소공원 2,017.60㎡, 철도 24.80㎡, 연결녹지 4,129.40㎡",
    existing_field: "",
    existing_value_from_matrix: () => "",
    status: "new_official_context",
    source_page: "PDF 278 OCR",
    evidence_note: "재공람공고의 도로·소공원 수치에 철도·연결녹지가 추가로 확인됨.",
  },
  {
    category: "공공기여",
    field: "순부담면적",
    official_value: "7,414.10㎡, 9.34%",
    existing_field: "",
    existing_value_from_matrix: () => "",
    status: "new_official_context",
    source_page: "PDF 278 OCR",
    evidence_note: "공공시설등 면적과 국공유지 차감 후 순부담 기준.",
  },
  {
    category: "사업성",
    field: "추정비례율/총수입/총지출",
    official_value: "추정비례율 100.94%, 총수입 약 3.729조원, 총지출 약 1.488조원",
    existing_field: "",
    existing_value_from_matrix: () => "",
    status: "new_official_context",
    source_page: "PDF 267·268 OCR",
    evidence_note: "사업시행인가·관리처분 전 추산액이므로 투자 판단에는 민감도 항목으로만 사용.",
  },
  {
    category: "일정",
    field: "사업시행 예정시기 기준",
    official_value: "정비구역 지정 고시일로부터 4년 이내 범위",
    existing_field: "current_stage",
    existing_value_from_matrix: (row) => row.current_stage,
    status: "new_official_context",
    source_page: "PDF 283 OCR",
    evidence_note: "실제 사업시행계획인가 신청일 예측이 아니라 법정 계획 기준.",
  },
];

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

async function main() {
  const matrixRows = await readJson(MATRIX_INPUT);
  const row = matrixRows.find((item) => String(item.rank) === SOURCE.project_rank);
  if (!row) throw new Error(`Missing rank ${SOURCE.project_rank} in ${MATRIX_INPUT}`);

  const ocrManifestRows = await readJson(SOURCE.ocr_manifest);
  const sourceRows = [
    {
      ...SOURCE,
      ocr_page_count: ocrManifestRows.length,
      ocr_success_count: ocrManifestRows.filter((item) => item.ocr_status === "ocr_extracted").length,
      generated_at_kst: GENERATED_AT_DATE,
    },
  ];

  const factRows = FACT_SPECS.map((spec) => ({
    rank: SOURCE.project_rank,
    focus_area: row.focus_area,
    district: row.district,
    project_name: row.project_name,
    source_id: SOURCE.source_id,
    category: spec.category,
    field: spec.field,
    official_value: spec.official_value,
    existing_field: spec.existing_field,
    existing_value: spec.existing_value_from_matrix(row) || "",
    status: spec.status,
    source_page: spec.source_page,
    evidence_note: spec.evidence_note,
    source_pdf: SOURCE.local_pdf,
    source_text: SOURCE.extracted_text,
    source_ocr_text: SOURCE.ocr_text,
    official_url: SOURCE.official_url,
  }));

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(SOURCE_OUT_JSON), { recursive: true });

  await writeFile(SOURCE_OUT_JSON, `${JSON.stringify(sourceRows, null, 2)}\n`);
  await writeFile(SOURCE_OUT_CSV, toCsv(sourceRows));
  await writeFile(path.join(OUT_DIR, "seoul-sibo-original-notice-fact-check.json"), `${JSON.stringify(factRows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "seoul-sibo-original-notice-fact-check.csv"), toCsv(factRows));

  const statusCounts = factRows.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const md = `# 서울시보 본고시 원문 Fact Check - 광장극동

Generated: ${UPDATED_AT}

## Summary

- 서울시보 제4146호 PDF에서 rank 27 광장극동아파트 재건축사업의 본고시, 서울특별시고시 제2026-249호를 확인했다.
- PDF 본문 텍스트 추출로 고시번호와 제목을 확인했고, 결정조서 표가 이미지 기반이라 PDF 266-302쪽을 OCR로 보완했다.
- 기존 매트릭스의 정비구역 면적, 층수, 높이, 용적률은 본고시와 대체로 일치한다. 다만 총세대수는 매트릭스 공란이므로 2,049세대로 보완 가능하다.
- 공공기여는 도로·소공원 외에 철도 및 연결녹지가 포함된 토지 기부채납 합계 7,770.20㎡, 순부담면적 7,414.10㎡가 본고시에서 확인된다.

## Source

${mdTable(sourceRows, [
  { key: "source_name", label: "Source" },
  { key: "issue_date", label: "Date" },
  { key: "notice_no", label: "Notice" },
  { key: "pdf_pages_ocr", label: "OCR Pages" },
  { key: "ocr_success_count", label: "OCR Success" },
  { key: "local_pdf", label: "Local PDF" },
])}

## Fact Table

${mdTable(factRows, [
  { key: "category", label: "Category" },
  { key: "field", label: "Field" },
  { key: "official_value", label: "Official Value" },
  { key: "existing_value", label: "Existing Value" },
  { key: "status", label: "Status" },
  { key: "source_page", label: "Page" },
  { key: "evidence_note", label: "Note" },
])}

## Status Counts

${Object.entries(statusCounts)
  .map(([status, count]) => `- ${status}: ${count}`)
  .join("\n")}

## Interpretation

- 광장극동은 이제 구청 재공람/조합설립계획 공고뿐 아니라 서울시보 본고시까지 확보된 상태다.
- 투자·입지 리서치에서는 339.50%를 원문 기준 FAR로 저장하고, 화면 표시나 비교표에는 340% 반올림값을 병기하는 편이 좋다.
- 사업구역 레이어 면적 76,364㎡와 본고시 정비구역 면적 79,417.2㎡는 값이 다르다. 지도 레이어 분석에는 레이어 면적을, 고시 수치 비교에는 본고시 면적을 쓰는 식으로 구분해야 한다.
- 사업성 관련 추정비례율과 총수입·총지출은 본고시에 포함되어 있지만, 조합설립·사업시행인가·관리처분 과정에서 바뀔 수 있는 추산값으로만 취급한다.

## Reproduce

\`\`\`bash
curl -L -f 'https://www.seoul.go.kr/func/seoulsibo/fileDownload.do?fileName=seoulsibo_20260429165724_02427.pdf' -o data/urban/files/27-seoul-sibo-4146-20260430.pdf
/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_seoul_sibo_text.py
NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-seoul-sibo-page-range.mjs --pdf=data/urban/files/27-seoul-sibo-4146-20260430.pdf --start=266 --end=302 --key=27-seoul-sibo-4146-20260430-2026-249 --dpi=180
node scripts/generate-seoul-sibo-original-notice-fact-check.mjs
\`\`\`
`;

  await writeFile(path.join(OUT_DIR, "seoul-sibo-original-notice-fact-check.md"), md);
  console.log(
    JSON.stringify(
      {
        facts: factRows.length,
        source: SOURCE_OUT_JSON,
        output: "analysis/seoul-sibo-original-notice-fact-check.{md,csv,json}",
        statusCounts,
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
