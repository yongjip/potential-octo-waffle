#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const URBAN_BASE = "https://urban.seoul.go.kr";
const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "expansion-gangdong-notice-candidates.json");
const OUT_CSV = path.join(OUT_DIR, "expansion-gangdong-notice-candidates.csv");
const OUT_MD = path.join(OUT_DIR, "expansion-gangdong-notice-candidates.md");

const TARGETS = [
  {
    shortlist_id: "exp-short-gd-gokang1",
    rank: 1,
    project_name: "고덕강일1역세권 재개발사업",
    location: "강동구 고덕동 294 일대",
    keywords: [
      "고덕강일1역세권",
      "고덕강일1역세권 재개발사업",
      "고덕동 294",
      "고덕동 294번지",
      "강동구 고덕동 294",
    ],
    positive: [
      ["고덕강일1역세권", 90],
      ["고덕동 294", 80],
      ["고덕동 294번지", 80],
      ["고덕", 30],
      ["재개발", 40],
      ["지형도면", 20],
      ["개발행위허가", 20],
    ],
  },
  {
    shortlist_id: "exp-short-gd-gd1207",
    rank: 2,
    project_name: "고덕대우아파트 소규모재건축사업",
    location: "강동구 고덕동 470 일대",
    keywords: [
      "고덕대우아파트",
      "고덕대우아파트 소규모재건축사업",
      "고덕동 470",
      "고덕동 470 일대",
      "강동구 고덕동 대우",
    ],
    positive: [
      ["고덕대우아파트", 100],
      ["고덕동 470", 80],
      ["소규모재건축", 70],
      ["재건축", 40],
      ["고덕", 25],
    ],
  },
];

const SEARCH_TYPES = ["title", "content"];

function normalize(value) {
  return String(value || "")
    .replace(/[^0-9A-Za-z가-힣-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function confidence(score) {
  if (score >= 110) return "high";
  if (score >= 65) return "medium";
  if (score > 0) return "low";
  return "none";
}

async function fetchJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; research-bot/1.0)",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Response is not JSON: ${text.slice(0, 120)} (${url})`);
  }
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
    const token = normalize(needle);
    if (haystack.includes(token)) score += points;
    if (title.includes(token)) score += Math.round(points * 0.3);
  }
  if (haystack.includes(normalize(keyword))) score += 20;
  if (project.location && haystack.includes(normalize(project.location))) score += 15;
  if (searchType === "content") score -= 5;
  if (/결정|변경|지형도면|고시|인가|개발행위허가/.test(detail.title || "")) score += 10;

  return Math.max(0, score);
}

async function searchUrban(project, keyword, searchType) {
  const search = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcList.json`, {
    pageNo: 1,
    pageSize: 40,
    keywordList: [keyword],
    pubSiteCode: "",
    organCode: "",
    bgnDate: "",
    endDate: "",
    srchType: searchType,
    noticeCode: "",
  });

  const rows = [];
  for (const item of search.content || []) {
    const noticeCode = String(item.noticeCode || "").trim();
    if (!noticeCode) continue;
    const detail = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcDt.json`, { noticeCode });
    const score = scoreProjectCandidate(project, detail, keyword, searchType);
    if (score <= 0) continue;

    rows.push({
      shortlist_id: project.shortlist_id,
      project_name: project.project_name,
      project_rank: project.rank,
      search_keyword: keyword,
      search_type: searchType,
      notice_code: detail.noticeCode || item.noticeCode || "",
      match_score: score,
      match_confidence: confidence(score),
      notice_no: detail.noticeNo || "",
      notice_date: String(detail.noticeDate || "").split("T")[0],
      title: compactText(detail.title || item.title || ""),
      content_snippet: compactText(`${detail.content || ""} ${detail.subject || ""}`).slice(0, 260),
      official_url: detail.noticeCode ? `${URBAN_BASE}/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(detail.noticeCode)}` : "",
      attachment_name: detail?.tnNtfcImage?.aImageName || "",
      attachment_url: detail?.tnNtfcImage?.aImageName && detail?.tnNtfcImage?.aImagePath ? noticeFileUrl(detail.tnNtfcImage.aImagePath, detail.tnNtfcImage.aImageName) : "",
      review_note: score >= 110 ? "고신뢰 후보: 프로젝트명/지역/공고 키워드 정합성 높음" : "키워드 후보: 제목/본문에서 직접성 재확인 필요",
    });
  }
  return rows;
}

function markdown(rows, timestamp) {
  const usefulRows = rows.filter((row) => row.match_confidence !== "none");
  const byProject = TARGETS.map((target) => {
    const projectRows = usefulRows.filter((row) => row.shortlist_id === target.shortlist_id);
    const highRows = projectRows.filter((row) => row.match_confidence === "high");
    const mediumRows = projectRows.filter((row) => row.match_confidence === "medium");
    return `## ${target.project_name}

### 고신뢰 후보

${mdTable(highRows, [
  { key: "search_keyword", label: "검색어" },
  { key: "search_type", label: "검색영역" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "고시번호" },
  { key: "notice_date", label: "고시일" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "공식 조회 URL" },
  { key: "attachment_name", label: "첨부" },
]).trim()}

### 중간 후보

${mdTable(mediumRows, [
  { key: "search_keyword", label: "검색어" },
  { key: "search_type", label: "검색영역" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "고시번호" },
  { key: "notice_date", label: "고시일" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "공식 조회 URL" },
  { key: "attachment_name", label: "첨부" },
]).trim()}`;
  });

  return `# 확장권 강동권(고덕축) 1차 공고 후보 프로브\n\n작성 기준: ${timestamp}\n\n서울도시공간포털 고시 API (` +
    "`ntfc/getNtfcList.json`" +
    "/`getNtfcDt.json`) 기준으로 `gokang1`, `gd1207` 후보를 검색한 원격 결과다.\n\n## 요약\n\n" +
    `- 대상: ${TARGETS.length}개\n- 검색 키워드: ${TARGETS.reduce((acc, target) => acc + target.keywords.length, 0)}개\n- 검색 유형: ${SEARCH_TYPES.join(", ")}\n- 후보 행: ${usefulRows.length}개\n- high: ${usefulRows.filter((row) => row.match_confidence === "high").length}개\n- medium: ${usefulRows.filter((row) => row.match_confidence === "medium").length}개\n- low: ${usefulRows.filter((row) => row.match_confidence === "low").length}개\n\n${byProject.join("\n\n")}`;
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()) + " KST";
}

async function main() {
  const rows = [];
  const seen = new Set();

  for (const target of TARGETS) {
    for (const keyword of target.keywords) {
      for (const searchType of SEARCH_TYPES) {
        const hits = await searchUrban(target, keyword, searchType);
        for (const hit of hits) {
          const key = `${hit.shortlist_id}:${hit.notice_code}`;
          if (seen.has(key)) continue;
          seen.add(key);
          rows.push(hit);
        }
      }
    }
  }

  rows.sort((a, b) => a.project_rank - b.project_rank || b.match_score - a.match_score || String(b.notice_date).localeCompare(String(a.notice_date)));

  const timestamp = kstDate();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(rows, timestamp)}\n`);

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        generated_at: timestamp,
        high_confidence: rows.filter((row) => row.match_confidence === "high").length,
        medium_confidence: rows.filter((row) => row.match_confidence === "medium").length,
        low_confidence: rows.filter((row) => row.match_confidence === "low").length,
        output: {
          json: OUT_JSON,
          csv: OUT_CSV,
          md: OUT_MD,
        },
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
