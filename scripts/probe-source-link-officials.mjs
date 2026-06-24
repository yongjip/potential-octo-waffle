#!/usr/bin/env node

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-link-official-probe.md");
const OUT_CSV = path.join(OUT_DIR, "source-link-official-probe.csv");
const OUT_JSON = path.join(OUT_DIR, "source-link-official-probe.json");

const REPAIR_CANDIDATES_INPUT = "analysis/source-link-repair-candidates.json";
const SOURCE_VALUE_QUEUE_INPUT = "analysis/source-value-verification-queue.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const SUMMARIES_INPUT = "data/cleanup/project-summaries-priority-candidates.json";

const URBAN_BASE = "https://urban.seoul.go.kr";
const GWANGJIN_BASE = "https://www.gwangjin.go.kr";
const UPDATED_AT = "2026-06-23 KST";

const GWANGJIN_BOARDS = [
  {
    board_id: "B0000003",
    board_label: "광진구청 고시공고(2025.9.이전)",
    menu_no: "201848",
    method: "GET",
    search_cnd: "3",
    dept_id: "101591",
  },
  {
    board_id: "B0000378",
    board_label: "광진구청 고시공고/입법예고",
    menu_no: "200192",
    method: "POST",
    search_cnd: "",
    dept_id: "",
  },
];

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

function stripTags(value) {
  return compactText(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function normalize(value) {
  return String(value || "")
    .replace(/[^0-9A-Za-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.map(compactText).filter(Boolean))];
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

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.text();
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

function searchKeywords(row, matrix, summary) {
  const project = row.project_name || matrix.project_name || "";
  const location = summary.location || "";
  const keywords = [project, project.replace(/정비사업.*/, "정비사업"), project.replace(/\s*일대.*/, ""), location];
  if (project.includes("자양번영로3나길") || location.includes("588-22")) {
    keywords.push("자양번영로3나길", "자양번영로3", "자양동 588-22", "자양 588-22", "자양동 588", "자양번영로");
  }
  if (project.includes("삼성1차") || location.includes("광장동 561")) {
    keywords.push("광장동 삼성1차", "삼성1차아파트", "삼성1차", "광장동 561", "광장 561", "소규모재건축");
  }
  if (project.includes("광장극동")) {
    keywords.push("광장극동", "광장극동아파트", "광장동 218-1");
  }
  return unique(keywords).slice(0, 12);
}

function score(row, title, detailText) {
  const haystack = normalize(`${title} ${detailText}`);
  const titleText = normalize(title);
  const project = normalize(row.project_name);
  let value = 0;
  if (project && titleText.includes(project)) value += 90;
  else if (project && haystack.includes(project)) value += 45;
  const tokens = [];
  if (row.project_name.includes("자양번영로3나길")) tokens.push("자양번영로3나길", "자양동 588 22", "588 22");
  if (row.project_name.includes("삼성1차")) tokens.push("광장동 삼성1차", "삼성1차아파트", "삼성1차", "광장동 561");
  if (row.project_name.includes("광장극동")) tokens.push("광장극동", "광장동 218 1", "정비구역 지정");
  for (const token of tokens) {
    const normalized = normalize(token);
    if (titleText.includes(normalized)) value += 35;
    else if (haystack.includes(normalized)) value += 12;
  }
  if (/고시|공고|인가|조합설립|정비구역|가로주택/.test(title)) value += 10;
  return value;
}

function confidence(value) {
  if (value >= 80) return "high";
  if (value >= 45) return "medium";
  if (value > 0) return "low";
  return "none";
}

function noticeFileUrl(filePath, fileName) {
  if (!filePath || !fileName) return "";
  return `${URBAN_BASE}/${String(filePath).replace(/^\/+/, "")}/${encodeURIComponent(fileName)}`;
}

async function searchUrban(row, keyword) {
  const body = {
    pageNo: 1,
    pageSize: 20,
    keywordList: [keyword],
    pubSiteCode: "",
    organCode: "",
    bgnDate: "",
    endDate: "",
    srchType: "title",
    noticeCode: "",
  };
  const search = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcList.json`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const rows = [];
  for (const item of search.content || []) {
    if (!item.noticeCode) continue;
    const detail = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcDt.json`, {
      method: "POST",
      body: JSON.stringify({ noticeCode: item.noticeCode }),
    });
    const file = detail?.tnNtfcImage;
    const detailText = compactText(`${detail.title || ""} ${detail.content || ""} ${detail.subject || ""}`);
    const candidateScore = score(row, detail.title || item.title || "", detailText);
    rows.push({
      rank: row.rank,
      project_name: row.project_name,
      search_site: "서울도시공간포털",
      search_keyword: keyword,
      search_status: "candidate",
      match_score: candidateScore,
      match_confidence: confidence(candidateScore),
      notice_no: detail.noticeNo || "",
      notice_date: String(detail.noticeDate || "").split("T")[0],
      title: compactText(detail.title || item.title || ""),
      official_url: detail.noticeCode ? `${URBAN_BASE}/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(detail.noticeCode)}` : "",
      attachment_name: file?.aImageName || "",
      attachment_url: file?.aImageName && file?.aImagePath ? noticeFileUrl(file.aImagePath, file.aImageName) : "",
      review_note: candidateScore >= 45 ? "사업명/위치 토큰이 공식 고시 후보와 일치한다." : "키워드 검색 후보이나 직접 관련성은 낮다.",
    });
  }
  return rows;
}

async function csrfForGwangjin() {
  const html = await fetchText(`${GWANGJIN_BASE}/portal/bbs/B0000378/list.do?menuNo=200192`);
  return html.match(/name=["']csrfToken["'][^>]*value=["']([^"']+)/i)?.[1] || "";
}

async function searchGwangjinBoard(config, keyword, csrfToken) {
  if (config.method === "GET") {
    const params = new URLSearchParams({
      menuNo: config.menu_no,
      pageIndex: "1",
      searchCnd: config.search_cnd,
      searchWrd: keyword,
    });
    if (config.dept_id) params.set("deptId", config.dept_id);
    const url = `${GWANGJIN_BASE}/portal/bbs/${config.board_id}/list.do?${params}`;
    return { url, html: await fetchText(url) };
  }

  const body = new URLSearchParams({
    csrfToken,
    pageIndex: "1",
    menuNo: config.menu_no,
    noticeType: "",
    searchCnd: config.search_cnd,
    searchWrd: keyword,
  });
  const url = `${GWANGJIN_BASE}/portal/bbs/${config.board_id}/list.do?menuNo=${config.menu_no}`;
  return {
    url,
    html: await fetchText(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        referer: url,
      },
      body,
    }),
  };
}

function absoluteGwangjinUrl(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("/")) return `${GWANGJIN_BASE}${href}`;
  return `${GWANGJIN_BASE}/${href}`;
}

function extractGwangjinResults(html, boardId) {
  const rows = [];
  const viewPattern = new RegExp(`<a\\b[^>]*href=["']([^"']*\\/portal\\/bbs\\/${boardId}\\/view\\.do[^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>`, "gi");
  for (const match of html.matchAll(viewPattern)) {
    const title = stripTags(match[2]);
    const href = match[1].replaceAll("&amp;", "&");
    if (!title || !href.includes("/view.do")) continue;
    rows.push({
      id: href.match(/(?:nttId|notAncmtMgtNo)=([^&]+)/)?.[1] || href,
      title,
      official_url: absoluteGwangjinUrl(href),
    });
  }
  return rows;
}

function extractNoticeNo(text) {
  return compactText(text.match(/(?:서울특별시\s*)?광진구\s*(?:공고|고시)\s*제\s*\d{4}\s*-\s*\d+\s*호/)?.[0] || text.match(/(?:공고|고시)\s*제\s*\d{4}\s*-\s*\d+\s*호/)?.[0] || "");
}

function extractNoticeDate(text) {
  return compactText(text.match(/등록일\s*(\d{4}-\d{2}-\d{2})/)?.[1] || text.match(/공고시작일\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "");
}

function extractAttachmentNames(html) {
  return [...html.matchAll(/<a\b[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((label) => /\.(pdf|hwp|hwpx)\b|첨부|공고문|의견서/i.test(label))
    .slice(0, 5)
    .join("; ");
}

async function searchGwangjin(row, keyword, csrfToken) {
  const rows = [];
  for (const config of GWANGJIN_BOARDS) {
    const { html } = await searchGwangjinBoard(config, keyword, csrfToken);
    for (const result of extractGwangjinResults(html, config.board_id)) {
      const detailHtml = await fetchText(result.official_url);
      const detailText = stripTags(detailHtml);
      const candidateScore = score(row, result.title, detailText);
      rows.push({
        rank: row.rank,
        project_name: row.project_name,
        search_site: config.board_label,
        search_keyword: keyword,
        search_status: "candidate",
        match_score: candidateScore,
        match_confidence: confidence(candidateScore),
        notice_no: extractNoticeNo(detailText),
        notice_date: extractNoticeDate(detailText),
        title: result.title,
        official_url: result.official_url,
        attachment_name: extractAttachmentNames(detailHtml),
        attachment_url: "",
        review_note: candidateScore >= 45 ? "사업명/위치 토큰이 광진구청 공고 후보와 일치한다." : "키워드 검색 후보이나 직접 관련성은 낮다.",
      });
    }
  }
  return rows;
}

function markdown(rows) {
  const candidateRows = rows.filter((row) => row.search_status === "candidate");
  const noCandidateRows = rows.filter((row) => row.search_status === "no_candidate");
  return `# 원문 링크 공식 검색 프로브

작성 기준: ${UPDATED_AT}

\`source-link-repair-candidates\`에서 새 원문 검색 또는 현재 고시값 무효 처리가 필요한 항목을 공식 사이트에서 직접 검색한 결과다. 이 스크립트는 원격 사이트를 호출하므로 로컬 재생성 체인에는 포함하지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 검색 대상 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 후보 행 | ${candidateRows.length} |
| 후보 없음 | ${noCandidateRows.length} |
| high confidence | ${candidateRows.filter((row) => row.match_confidence === "high").length} |
| medium confidence | ${candidateRows.filter((row) => row.match_confidence === "medium").length} |

## 후보

${mdTable(candidateRows.sort((a, b) => b.match_score - a.match_score || a.search_site.localeCompare(b.search_site)), [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "search_site", label: "사이트" },
  { key: "search_keyword", label: "검색어" },
  { key: "match_confidence", label: "신뢰" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "일자" },
  { key: "title", label: "제목" },
  { key: "official_url", label: "URL" },
  { key: "attachment_name", label: "첨부" },
])}

## 후보 없음

${mdTable(noCandidateRows, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "review_note", label: "메모" },
])}
`;
}

async function main() {
  const [repairRows, valueQueueRows, matrixRows, summaries] = await Promise.all([
    readJson(REPAIR_CANDIDATES_INPUT),
    readJson(SOURCE_VALUE_QUEUE_INPUT),
    readJson(MATRIX_INPUT),
    readJson(SUMMARIES_INPUT),
  ]);
  const matrixByRank = byRank(matrixRows);
  const summariesByRank = byRank(summaries);
  const targetRanks = [
    ...new Set(
      [
        ...repairRows
          .filter((row) => ["no_local_candidate", "invalid_current_notice_source"].includes(row.candidate_status))
          .map((row) => String(row.rank)),
        ...valueQueueRows
          .filter((row) => row.task_type === "connect_recordcode_original_notice" && row.priority === "P0")
          .map((row) => String(row.rank)),
      ],
    ),
  ];
  const targets = targetRanks.map((rank) => {
    const first = repairRows.find((row) => String(row.rank) === rank) || valueQueueRows.find((row) => String(row.rank) === rank) || matrixByRank[rank] || {};
    return {
      rank,
      project_name: first.project_name,
      focus_area: first.focus_area,
      district: first.district,
    };
  });
  const rows = [];
  const seen = new Set();
  const csrfToken = await csrfForGwangjin();

  for (const target of targets) {
    const keywords = searchKeywords(target, matrixByRank[target.rank] || {}, summariesByRank[target.rank] || {});
    for (const keyword of keywords) {
      const searchRows = [...(await searchUrban(target, keyword)), ...(await searchGwangjin(target, keyword, csrfToken))];
      for (const row of searchRows) {
        const key = `${row.rank}-${row.search_site}-${row.official_url}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (row.match_score <= 0) continue;
        rows.push(row);
      }
    }
  }

  const ranksWithRows = new Set(rows.map((row) => String(row.rank)));
  for (const target of targets) {
    if (!ranksWithRows.has(String(target.rank))) {
      rows.push({
        rank: target.rank,
        project_name: target.project_name,
        search_site: "official_probe",
        search_keyword: "",
        search_status: "no_candidate",
        match_score: 0,
        match_confidence: "none",
        notice_no: "",
        notice_date: "",
        title: "",
        official_url: "",
        attachment_name: "",
        attachment_url: "",
        review_note: "공식 검색 프로브에서 직접 후보를 찾지 못함",
      });
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        target_projects: targets.length,
        rows: rows.length,
        high_confidence: rows.filter((row) => row.match_confidence === "high").length,
        medium_confidence: rows.filter((row) => row.match_confidence === "medium").length,
        output: "analysis/source-link-official-probe.{md,csv,json}",
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
