#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const URBAN_BASE = "https://urban.seoul.go.kr";
const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "gwangjin-original-notice-candidates.json");
const OUT_CSV = path.join(OUT_DIR, "gwangjin-original-notice-candidates.csv");
const OUT_MD = path.join(OUT_DIR, "gwangjin-original-notice-candidates.md");
const UPDATED_AT = "2026-06-23 KST";

const PROJECTS = [
  {
    id: "23-j15171517",
    rank: 23,
    name: "광장동 삼성1차아파트 소규모재건축정비사업",
    shortName: "광장동 삼성1차",
    keywords: [
      "광장동 삼성1차",
      "삼성1차아파트",
      "광장동 삼성1차아파트",
      "광장동 561",
      "광진구 광장동 561",
      "광장동 삼성",
      "삼성1차 소규모재건축",
      "광장동 소규모재건축",
      "광장동 삼성1차 소규모재건축사업",
    ],
    positive: [
      ["광장동", 25],
      ["삼성1차", 80],
      ["삼성", 25],
      ["561", 20],
      ["소규모재건축", 50],
      ["소규모 재건축", 50],
      ["정비사업", 15],
      ["사업시행", 15],
      ["조합설립", 10],
      ["광진구", 10],
    ],
  },
  {
    id: "28-jayang588-22",
    rank: 28,
    name: "자양번영로3나길 일대 가로주택정비사업",
    shortName: "자양번영로3나길",
    keywords: [
      "자양번영로3나길",
      "자양 번영로3나길",
      "자양동 588-22",
      "자양588-22",
      "자양번영로3나길 가로주택정비사업",
      "자양동 가로주택정비사업 588",
      "광진구 자양동 588-22",
      "자양번영로 가로주택",
      "자양동 588 가로주택",
    ],
    positive: [
      ["자양번영로3나길", 90],
      ["자양 번영로3나길", 90],
      ["588-22", 45],
      ["588", 18],
      ["자양동", 25],
      ["가로주택", 50],
      ["정비사업", 15],
      ["사업시행", 15],
      ["조합설립", 10],
      ["광진구", 10],
    ],
  },
];

const SEARCH_TYPES = ["title", "content"];

function compactText(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#034;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return String(value || "")
    .replace(/[－–—]/g, "-")
    .replace(/[^0-9A-Za-z가-힣-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.json();
}

function noticeFileUrl(filePath, fileName) {
  if (!filePath || !fileName) return "";
  return `${URBAN_BASE}/${String(filePath).replace(/^\/+/, "")}/${encodeURIComponent(fileName)}`;
}

function scoreProjectCandidate(project, detail, keyword, searchType) {
  const title = normalize(detail.title || "");
  const content = normalize(`${detail.content || ""} ${detail.subject || ""} ${detail.noticeNo || ""}`);
  const haystack = `${title} ${content}`;
  let score = 0;

  for (const [needle, points] of project.positive) {
    if (haystack.includes(normalize(needle))) score += points;
    if (title.includes(normalize(needle))) score += Math.round(points * 0.3);
  }
  if (/결정|변경|지형도면|고시|인가|공고/.test(detail.title || "")) score += 10;
  if (keyword && haystack.includes(normalize(keyword))) score += 20;
  if (searchType === "content" && score > 0) score -= 5;

  return Math.max(0, score);
}

function confidence(score) {
  if (score >= 110) return "high";
  if (score >= 65) return "medium";
  if (score > 0) return "low";
  return "none";
}

async function searchUrban(project, keyword, searchType) {
  const search = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcList.json`, {
    method: "POST",
    body: JSON.stringify({
      pageNo: 1,
      pageSize: 30,
      keywordList: [keyword],
      pubSiteCode: "",
      organCode: "",
      bgnDate: "",
      endDate: "",
      srchType: searchType,
      noticeCode: "",
    }),
  });
  const rows = [];
  for (const item of search.content || []) {
    if (!item.noticeCode) continue;
    const detail = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcDt.json`, {
      method: "POST",
      body: JSON.stringify({ noticeCode: item.noticeCode }),
    });
    const file = detail?.tnNtfcImage || {};
    const score = scoreProjectCandidate(project, detail, keyword, searchType);
    rows.push({
      project_id: project.id,
      project_rank: project.rank,
      project_name: project.name,
      search_keyword: keyword,
      search_type: searchType,
      notice_code: detail.noticeCode || item.noticeCode || "",
      match_score: score,
      match_confidence: confidence(score),
      notice_no: detail.noticeNo || "",
      notice_date: String(detail.noticeDate || "").split("T")[0],
      title: compactText(detail.title || item.title || ""),
      subject: compactText(detail.subject || ""),
      content_snippet: compactText(detail.content || "").slice(0, 220),
      official_url: detail.noticeCode ? `${URBAN_BASE}/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(detail.noticeCode)}` : "",
      attachment_name: file.aImageName || "",
      attachment_url: file.aImageName && file.aImagePath ? noticeFileUrl(file.aImagePath, file.aImageName) : "",
      review_note: score >= 110 ? "사업명/주소/유형이 직접 일치하는 본고시 후보" : "키워드 후보이나 사업범위 직접성 수동 확인 필요",
    });
  }
  return rows;
}

function markdown(rows) {
  const candidateRows = rows.filter((row) => row.match_confidence !== "none");
  const projectBlocks = PROJECTS.map((project) => {
    const projectRows = candidateRows.filter((row) => row.project_id === project.id);
    const highRows = projectRows.filter((row) => row.match_confidence === "high");
    const mediumRows = projectRows.filter((row) => row.match_confidence === "medium");
    return `## ${project.shortName}

### 고신뢰 후보

${mdTable(highRows, [
  { key: "search_keyword", label: "검색어" },
  { key: "search_type", label: "유형" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "일자" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "URL" },
  { key: "attachment_name", label: "첨부" },
])}

### 중간 후보

${mdTable(mediumRows, [
  { key: "search_keyword", label: "검색어" },
  { key: "search_type", label: "유형" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "일자" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "URL" },
  { key: "attachment_name", label: "첨부" },
])}`;
  });

  return `# 광진권 소규모정비 본고시 원문 후보 프로브

작성 기준: ${UPDATED_AT}

서울도시공간포털 고시 API에서 광장동 삼성1차·자양번영로3나길 키워드를 검색한 결과다. 이 산출물은 원격 조회 결과이므로 전체 로컬 재생성 체인에는 포함하지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${PROJECTS.length} |
| 검색 키워드 | ${PROJECTS.reduce((sum, project) => sum + project.keywords.length, 0)} |
| 검색 유형 | ${SEARCH_TYPES.join(", ")} |
| 후보 행 | ${candidateRows.length} |
| high confidence | ${candidateRows.filter((row) => row.match_confidence === "high").length} |
| medium confidence | ${candidateRows.filter((row) => row.match_confidence === "medium").length} |

${projectBlocks.join("\n\n")}
`;
}

async function main() {
  const rows = [];
  const seen = new Set();
  for (const project of PROJECTS) {
    for (const keyword of project.keywords) {
      for (const searchType of SEARCH_TYPES) {
        for (const row of await searchUrban(project, keyword, searchType)) {
          const key = `${row.project_id}:${row.notice_code}`;
          if (seen.has(key)) continue;
          seen.add(key);
          if (row.match_score <= 0) continue;
          rows.push(row);
        }
      }
    }
  }
  rows.sort(
    (a, b) =>
      a.project_rank - b.project_rank ||
      b.match_score - a.match_score ||
      String(b.notice_date).localeCompare(String(a.notice_date)),
  );
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        high_confidence: rows.filter((row) => row.match_confidence === "high").length,
        medium_confidence: rows.filter((row) => row.match_confidence === "medium").length,
        output: "analysis/gwangjin-original-notice-candidates.{md,csv,json}",
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
