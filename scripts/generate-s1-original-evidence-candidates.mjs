#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s1-original-evidence-candidates.md");
const OUT_CSV = path.join(OUT_DIR, "s1-original-evidence-candidates.csv");
const OUT_JSON = path.join(OUT_DIR, "s1-original-evidence-candidates.json");

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

const INPUTS = {
  workbook: "analysis/s1-cost-infrastructure-workbook.json",
};

const CATEGORIES = [
  {
    id: "public_contribution",
    label: "공공기여·기부채납",
    keywords: ["공공기여", "공공시설부지", "공공시설등", "기부채납", "순부담", "무상양도", "임대주택"],
    valueHint: "공공기여/기부채납 면적·순부담률 후보",
  },
  {
    id: "infrastructure",
    label: "기반시설",
    keywords: ["정비기반시설", "기반시설", "도로", "공원", "녹지", "공공청사", "지하차도", "통신구", "환기구", "한강보행교", "전력", "저류", "방류"],
    valueHint: "도로·공원·공공청사·기반시설 면적 후보",
  },
  {
    id: "cost_pressure",
    label: "비용·분담금",
    keywords: ["공사비", "사업비", "분담금", "부담금", "매각금액", "이주비", "HUG", "보증"],
    valueHint: "공사비·사업비·분담금 후보",
  },
  {
    id: "ratio_calculation",
    label: "용적률·비율 산정",
    keywords: ["용적률", "순부담률", "기준용적률", "허용용적률", "상한용적률", "법적상한", "α", "β"],
    valueHint: "용적률/순부담률 산정 후보",
  },
];

const VALUE_PATTERN = /(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*(?:㎡|m²|m2|m\)|m"|m|%|원|억원|억|세대|층|호)?/g;

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "candidate_rank",
    "focus_area",
    "rank",
    "project_name",
    "category",
    "category_label",
    "keyword_hits",
    "extracted_values",
    "source_path",
    "source_line",
    "snippet",
    "candidate_status",
    "recommended_use",
    "project_note",
  ];
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

async function readTextIfExists(file) {
  if (!file) return "";
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

function normalizeSnippet(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function keywordHits(text, keywords) {
  const lower = String(text ?? "").toLowerCase();
  return keywords.filter((keyword) => lower.includes(keyword.toLowerCase()));
}

function extractValues(text) {
  const values = [];
  for (const match of String(text ?? "").matchAll(VALUE_PATTERN)) {
    const value = match[0].trim();
    if (/^\d{1,2}$/.test(value)) continue;
    values.push(value);
  }
  return [...new Set(values)].slice(0, 12);
}

function isUiArtifactLine(text) {
  const normalized = String(text ?? "");
  if (!/onclick=|lscrOpen|subLink-item|costchange|href="#n"/i.test(normalized)) return false;
  return !/(㎡|m²|m2|%|원|억원|억|세대|층|m\b)/.test(normalized);
}

function scoreLine(line, category) {
  const hits = keywordHits(line, category.keywords);
  if (!hits.length) return 0;
  const values = extractValues(line);
  let score = hits.length * 10 + values.length * 2;
  if (hits.some((hit) => ["순부담", "공공기여", "공공시설부지", "계획 정비기반시설", "분담금", "공사비", "상한용적률"].includes(hit))) score += 12;
  if (/%|㎡|억원|원|세대/.test(line)) score += 5;
  return score;
}

function buildSnippet(lines, index) {
  return normalizeSnippet(lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 2)).join(" "));
}

function categoryCandidates(row, text, category, limit = 3) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const scored = [];
  const seen = new Set();
  lines.forEach((line, index) => {
    if (isUiArtifactLine(line)) return;
    const score = scoreLine(line, category);
    if (!score) return;
    const snippet = buildSnippet(lines, index);
    if (isUiArtifactLine(snippet)) return;
    const values = extractValues(snippet);
    if (!values.length) return;
    const key = snippet.slice(0, 160);
    if (seen.has(key)) return;
    seen.add(key);
    scored.push({
      score,
      line_no: index + 1,
      snippet,
      hits: keywordHits(snippet, category.keywords),
      values,
    });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.line_no - b.line_no)
    .slice(0, limit)
    .map((hit) => ({
      focus_area: row.focus_area,
      rank: row.rank,
      project_name: row.project_name,
      category: category.id,
      category_label: category.label,
      keyword_hits: hit.hits.join("; "),
      extracted_values: hit.values.join("; "),
      source_path: row.notice_source_to_open,
      source_line: hit.line_no,
      snippet: hit.snippet,
      candidate_status: "source_snippet_candidate_not_confirmed",
      recommended_use: `${category.valueHint}. S1 워크북의 공개항목/장부 필드와 대조한 뒤 confirmed, pending, conflict, not_applicable 중 하나로 기록`,
      project_note: row.project_note,
      score: hit.score,
    }));
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts, limit = 8) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

async function buildRows(workbook) {
  const rows = [];
  for (const row of workbook.rows) {
    const text = await readTextIfExists(row.notice_source_to_open);
    for (const category of CATEGORIES) {
      rows.push(...categoryCandidates(row, text, category));
    }
  }
  return rows
    .sort((a, b) => Number(a.rank) - Number(b.rank) || a.category.localeCompare(b.category) || b.score - a.score)
    .map((row, index) => {
      const { score, ...rest } = row;
      return { candidate_rank: index + 1, ...rest };
    });
}

function buildSummary(rows, workbook) {
  const projectsWithCandidates = new Set(rows.map((row) => row.rank));
  return {
    generated_at: UPDATED_AT,
    source_workbook_projects: workbook.summary.project_count,
    candidate_count: rows.length,
    project_count: projectsWithCandidates.size,
    missing_project_count: workbook.summary.project_count - projectsWithCandidates.size,
    category_counts: countBy(rows, "category_label"),
    focus_area_counts: countBy(rows, "focus_area"),
  };
}

function markdown(rows, summary) {
  const topRows = rows.slice(0, 80);
  return `# S1 원문 수치 후보 추출표

작성 기준: ${UPDATED_AT}

이 문서는 S1 비용·기반시설 워크북의 로컬 원문 텍스트에서 공공기여, 기반시설, 비용·분담금, 용적률 산정 관련 수치 후보를 자동 추출한 표다. 이 값들은 확정값이 아니라 원문 대조 후보이며, 장부 반영 전 공개항목 상세/첨부와 문맥 확인이 필요하다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S1 워크북 사업장 | ${summary.source_workbook_projects} |
| 후보 추출 사업장 | ${summary.project_count} |
| 수치 후보 | ${summary.candidate_count} |
| 후보 없는 사업장 | ${summary.missing_project_count} |
| 카테고리 분포 | ${countText(summary.category_counts)} |
| 생활권 분포 | ${countText(summary.focus_area_counts)} |

## 후보 상위 목록

${mdTable(topRows, [
  { key: "candidate_rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "사업" },
  { key: "project_name", label: "사업장" },
  { key: "category_label", label: "유형" },
  { key: "keyword_hits", label: "키워드" },
  { key: "extracted_values", label: "추출값" },
  { key: "source_path", label: "원문" },
  { key: "source_line", label: "줄" },
])}

## 사용법

1. extracted_values는 자동 후보이므로 원문 문장과 표 제목을 같이 확인한다.
2. S1 비용·기반시설 워크북의 공개항목 URL을 열어 후속 용역/공고가 고시 원문 조건을 변경하는지 확인한다.
3. 확인 결과는 core-value-confirmation-ledger 또는 사업별 메모에 confirmed, pending, conflict, not_applicable로만 남긴다.
`;
}

async function main() {
  const workbook = await readJson(INPUTS.workbook);
  const rows = await buildRows(workbook);
  const summary = buildSummary(rows, workbook);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        projects: summary.project_count,
        categories: summary.category_counts,
        output: "analysis/s1-original-evidence-candidates.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
