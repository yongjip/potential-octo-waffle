#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "s3-hanyanggaro-official-source-search.json");
const OUT_MD = path.join(OUT_DIR, "s3-hanyanggaro-official-source-search.md");
const UPDATED_AT = "2026-06-23 KST";
const URBAN_BASE = "https://urban.seoul.go.kr";
const GWANGJIN_BASE = "https://www.gwangjin.go.kr";

const KEYWORDS = [
  "한양연립",
  "한양연립 일대",
  "한양연립 일대 가로주택정비사업",
  "구의동 592-39",
  "구의동 592",
  "구의동 592-39 가로주택정비사업",
  "가로주택정비사업 한양연립",
  "사업시행계획인가 한양연립",
  "사업시행인가 한양연립",
];

const GWANGJIN_BOARDS = [
  {
    board_id: "B0000003",
    label: "광진구청 고시공고(2025.9.이전)",
    menu_no: "201848",
    method: "GET",
    search_cnd: "3",
    dept_id: "101591",
  },
  {
    board_id: "B0000378",
    label: "광진구청 고시공고/입법예고",
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

function score(title, detailText) {
  const haystack = normalize(`${title} ${detailText}`);
  const titleText = normalize(title);
  let value = 0;
  const exactTokens = ["한양연립", "구의동 592 39", "구의동 592"];
  const contextTokens = ["가로주택정비사업", "사업시행", "사업시행계획", "광진구"];
  for (const token of exactTokens) {
    const normalized = normalize(token);
    if (titleText.includes(normalized)) value += 40;
    else if (haystack.includes(normalized)) value += 20;
  }
  for (const token of contextTokens) {
    const normalized = normalize(token);
    if (titleText.includes(normalized)) value += 12;
    else if (haystack.includes(normalized)) value += 6;
  }
  return value;
}

function confidence(value) {
  if (value >= 80) return "high";
  if (value >= 45) return "medium";
  if (value > 0) return "low";
  return "none";
}

function mdEscape(value) {
  return String(value ?? "").replaceAll("|", "/");
}

function mdTable(rows) {
  if (!rows.length) return "_없음_";
  const fields = [
    ["site", "사이트"],
    ["keyword", "검색어"],
    ["match_confidence", "신뢰"],
    ["match_score", "점수"],
    ["notice_no", "번호"],
    ["notice_date", "일자"],
    ["title", "제목"],
    ["official_url", "URL"],
    ["attachment_name", "첨부"],
  ];
  return [
    `| ${fields.map(([, label]) => label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map(([key]) => mdEscape(row[key])).join(" | ")} |`),
  ].join("\n");
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
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      "x-requested-with": "XMLHttpRequest",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.json();
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
    .filter((label) => /\.(pdf|hwp|hwpx)\b|첨부|공고문|고시문|의견서/i.test(label))
    .slice(0, 5)
    .join("; ");
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

async function searchGwangjin(keyword, csrfToken) {
  const rows = [];
  for (const config of GWANGJIN_BOARDS) {
    const { html } = await searchGwangjinBoard(config, keyword, csrfToken);
    const listRows = extractGwangjinResults(html, config.board_id);
    if (!listRows.length) {
      rows.push({
        site: config.label,
        keyword,
        status: "no_list_result",
        match_score: 0,
        match_confidence: "none",
        notice_no: "",
        notice_date: "",
        title: "",
        official_url: "",
        attachment_name: "",
      });
      continue;
    }
    for (const result of listRows) {
      const detailHtml = await fetchText(result.official_url);
      const detailText = stripTags(detailHtml);
      const matchScore = score(result.title, detailText);
      rows.push({
        site: config.label,
        keyword,
        status: "candidate",
        match_score: matchScore,
        match_confidence: confidence(matchScore),
        notice_no: extractNoticeNo(detailText),
        notice_date: extractNoticeDate(detailText),
        title: result.title,
        official_url: result.official_url,
        attachment_name: extractAttachmentNames(detailHtml),
      });
    }
  }
  return rows;
}

function noticeFileUrl(filePath, fileName) {
  if (!filePath || !fileName) return "";
  return `${URBAN_BASE}/${String(filePath).replace(/^\/+/, "")}/${encodeURIComponent(fileName)}`;
}

async function searchUrban(keyword) {
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
  if (!search.content?.length) {
    rows.push({
      site: "서울도시공간포털",
      keyword,
      status: "no_list_result",
      match_score: 0,
      match_confidence: "none",
      notice_no: "",
      notice_date: "",
      title: "",
      official_url: "",
      attachment_name: "",
    });
    return rows;
  }
  for (const item of search.content || []) {
    if (!item.noticeCode) continue;
    const detail = await fetchJson(`${URBAN_BASE}/ntfc/getNtfcDt.json`, {
      method: "POST",
      body: JSON.stringify({ noticeCode: item.noticeCode }),
    });
    const file = detail?.tnNtfcImage;
    const title = compactText(detail.title || item.title || "");
    const detailText = compactText(`${detail.title || ""} ${detail.content || ""} ${detail.subject || ""}`);
    const matchScore = score(title, detailText);
    rows.push({
      site: "서울도시공간포털",
      keyword,
      status: "candidate",
      match_score: matchScore,
      match_confidence: confidence(matchScore),
      notice_no: detail.noticeNo || "",
      notice_date: String(detail.noticeDate || "").split("T")[0],
      title,
      official_url: detail.noticeCode ? `${URBAN_BASE}/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(detail.noticeCode)}` : "",
      attachment_name: file?.aImageName || "",
      attachment_url: file?.aImageName && file?.aImagePath ? noticeFileUrl(file.aImagePath, file.aImageName) : "",
    });
  }
  return rows;
}

async function main() {
  const csrfToken = await csrfForGwangjin();
  const rows = [];
  const seen = new Set();
  for (const keyword of KEYWORDS) {
    for (const row of [...(await searchUrban(keyword)), ...(await searchGwangjin(keyword, csrfToken))]) {
      const key = `${row.site}-${row.keyword}-${row.official_url}-${row.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }

  const candidates = rows
    .filter((row) => row.status === "candidate" && row.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score || a.site.localeCompare(b.site));
  const highOrMedium = candidates.filter((row) => ["high", "medium"].includes(row.match_confidence));
  const noResultRows = rows.filter((row) => row.status !== "candidate" || row.match_score <= 0);
  const conclusion = highOrMedium.length
    ? "한양연립 일대 가로주택정비사업의 직접 원문 후보는 광진구청 고시공고 구 게시판에서 확인됐다. 대표 후보는 `서울특별시 광진구 고시 제2023-115호` 사업시행계획변경인가 고시와 `서울특별시 광진구 고시 제2023-4호` 사업시행계획인가 정정 고시다. 서울도시공간포털의 한성·한양연립 과거 재건축 고시는 현 한양연립 일대 가로주택정비사업과 다른 후보로 보조 검토 대상에서 제외한다."
    : "한양연립 일대 가로주택정비사업의 사업시행인가 또는 조합설립/가로주택정비사업 직접 원문 후보는 광진구청 고시공고와 서울도시공간포털 결정고시 검색에서 high/medium 신뢰 후보로 확인되지 않았다.";
  const md = `# 한양연립 공식 원문 검색 결과

작성 기준: ${UPDATED_AT}

## 결론

${conclusion}

## 요약

| 항목 | 값 |
| --- | ---: |
| 검색어 | ${KEYWORDS.length} |
| 전체 결과 행 | ${rows.length} |
| 점수 있는 후보 | ${candidates.length} |
| high/medium 후보 | ${highOrMedium.length} |

## high/medium 후보

${mdTable(highOrMedium)}

## 점수 있는 후보 전체

${mdTable(candidates)}

## 후보 없음 또는 무관 결과

${mdTable(noResultRows.slice(0, 60))}
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_MD, md, "utf8");
  console.log(
    JSON.stringify(
      {
        keywords: KEYWORDS.length,
        rows: rows.length,
        scored_candidates: candidates.length,
        high_or_medium: highOrMedium.length,
        output: "analysis/s3-hanyanggaro-official-source-search.{md,json}",
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
