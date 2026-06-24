#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const URBAN_BASE = "https://urban.seoul.go.kr";
const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "macheon-original-notice-candidates.json");
const OUT_CSV = path.join(OUT_DIR, "macheon-original-notice-candidates.csv");
const OUT_MD = path.join(OUT_DIR, "macheon-original-notice-candidates.md");
const UPDATED_AT = "2026-06-23 KST";

const KEYWORDS = [
  "마천1",
  "마천1재정비촉진구역",
  "마천1주택재개발",
  "마천 재정비촉진",
  "거여마천 재정비촉진",
  "거여 마천 재정비촉진",
  "마천동 194",
  "송파구 마천",
  "재정비촉진계획 마천",
  "재정비촉진구역 마천",
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
    .replace(/[^0-9A-Za-z가-힣]+/g, " ")
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

function scoreCandidate(detail, keyword, searchType) {
  const title = normalize(detail.title || "");
  const content = normalize(`${detail.content || ""} ${detail.subject || ""} ${detail.noticeNo || ""}`);
  const haystack = `${title} ${content}`;
  let score = 0;

  if (title.includes("마천1") || haystack.includes("마천1")) score += 80;
  if (title.includes("마천") || haystack.includes("마천")) score += 25;
  if (title.includes("거여마천") || haystack.includes("거여마천")) score += 25;
  if (title.includes("재정비촉진") || haystack.includes("재정비촉진")) score += 30;
  if (title.includes("촉진계획") || haystack.includes("촉진계획")) score += 25;
  if (title.includes("주택재개발") || haystack.includes("주택재개발")) score += 15;
  if (title.includes("정비계획") || haystack.includes("정비계획")) score += 15;
  if (title.includes("송파") || haystack.includes("송파")) score += 10;
  if (/변경|결정|지형도면|고시/.test(detail.title || "")) score += 15;
  if (keyword.includes("마천1") && haystack.includes("마천1")) score += 20;
  if (searchType === "content" && score > 0) score -= 5;

  if (String(detail.noticeDate || "").startsWith("1973")) score -= 50;
  if (String(detail.noticeNo || "").includes("1973-470")) score -= 40;
  return Math.max(0, score);
}

function confidence(score) {
  if (score >= 100) return "high";
  if (score >= 60) return "medium";
  if (score > 0) return "low";
  return "none";
}

async function searchUrban(keyword, searchType) {
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
    const score = scoreCandidate(detail, keyword, searchType);
    rows.push({
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
      review_note: score >= 100 ? "마천1 또는 거여마천 재정비촉진계획 후보로 원문 대조 필요" : "키워드 후보이나 사업범위 직접성 수동 확인 필요",
    });
  }
  return rows;
}

function markdown(rows) {
  const candidateRows = rows.filter((row) => row.match_confidence !== "none");
  const highRows = candidateRows.filter((row) => row.match_confidence === "high");
  const mediumRows = candidateRows.filter((row) => row.match_confidence === "medium");
  return `# 마천1 현행 정비계획 원문 후보 프로브

작성 기준: ${UPDATED_AT}

서울도시공간포털 고시 API에서 마천1/거여마천/재정비촉진계획 키워드를 넓게 검색한 결과다. 이 산출물은 원격 조회 결과이므로 전체 로컬 재생성 체인에는 포함하지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 검색 키워드 | ${KEYWORDS.length} |
| 검색 유형 | ${SEARCH_TYPES.join(", ")} |
| 후보 행 | ${candidateRows.length} |
| high confidence | ${highRows.length} |
| medium confidence | ${mediumRows.length} |

## 고신뢰 후보

${mdTable(highRows, [
  { key: "search_keyword", label: "검색어" },
  { key: "search_type", label: "검색유형" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "일자" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "URL" },
  { key: "attachment_name", label: "첨부" },
])}

## 중간 후보

${mdTable(mediumRows, [
  { key: "search_keyword", label: "검색어" },
  { key: "search_type", label: "검색유형" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "일자" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "URL" },
  { key: "attachment_name", label: "첨부" },
])}
`;
}

async function main() {
  const rows = [];
  const seen = new Set();
  for (const keyword of KEYWORDS) {
    for (const searchType of SEARCH_TYPES) {
      for (const row of await searchUrban(keyword, searchType)) {
        const key = row.notice_code;
        if (seen.has(key)) continue;
        seen.add(key);
        if (row.match_score <= 0) continue;
        rows.push(row);
      }
    }
  }
  rows.sort((a, b) => b.match_score - a.match_score || String(b.notice_date).localeCompare(String(a.notice_date)));
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
        output: "analysis/macheon-original-notice-candidates.{md,csv,json}",
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
