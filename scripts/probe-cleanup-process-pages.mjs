#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const OUT_DATA_DIR = "data/cleanup";
const OUT_ANALYSIS_DIR = "analysis";
const HTML_DIR = path.join(OUT_DATA_DIR, "process-page-html");
const OUT_JSON = path.join(OUT_DATA_DIR, "cleanup-process-page-probes.json");
const OUT_CSV = path.join(OUT_DATA_DIR, "cleanup-process-page-probes.csv");
const OUT_MD = path.join(OUT_ANALYSIS_DIR, "cleanup-process-page-probes.md");
const BASE = "https://cleanup.seoul.go.kr";
const UPDATED_AT = "2026-06-23 KST";

const DEFAULT_TARGET_RANKS = ["23", "28"];
const KEYWORDS = ["고시", "공고", "인가", "승인", "정비구역", "구역지정", "면적", "용적률", "건폐율", "층", "세대", "도면", "첨부", "별첨"];
const USE_CACHE = process.argv.includes("--use-cache");

function targetRanks() {
  const arg = process.argv.find((item) => item.startsWith("--ranks="));
  return new Set((arg ? arg.slice("--ranks=".length).split(",") : DEFAULT_TARGET_RANKS).map((item) => item.trim()).filter(Boolean));
}

function decodeHtml(value) {
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
  return decodeHtml(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  );
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

function sanitize(value) {
  return String(value || "item")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function absoluteUrl(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("/")) return `${BASE}${href}`;
  return `${BASE}/${href}`;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.text();
}

async function fetchPage(url) {
  try {
    return { ok: true, html: await fetchText(url), error: "" };
  } catch (error) {
    return { ok: false, html: "", error: error.message || String(error) };
  }
}

function extractTitle(html) {
  return (
    stripTags(html.match(/<h[1234]\b[^>]*>([\s\S]*?)<\/h[1234]>/i)?.[1] || "") ||
    stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
  );
}

function extractTables(html) {
  const pairs = [];
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const key = stripTags(row.match(/<th\b[^>]*>([\s\S]*?)<\/th>/i)?.[1] || "");
    const value = stripTags(row.match(/<td\b[^>]*>([\s\S]*?)<\/td>/i)?.[1] || "");
    if (key && value) pairs.push(`${key}=${value}`);
  }
  return pairs;
}

function extractAttachments(html) {
  const rows = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].replaceAll("&amp;", "&");
    const label = stripTags(match[2]);
    if (!/file|download|atch|첨부|\.pdf|\.hwp|\.hwpx|\.zip|\.jpg|\.png/i.test(`${href} ${label}`)) continue;
    rows.push(`${label || href} <${absoluteUrl(href)}>`);
  }
  return [...new Set(rows)];
}

function snippetFor(text, keyword, radius = 80) {
  const index = text.indexOf(keyword);
  if (index < 0) return "";
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + keyword.length + radius)).trim();
}

function keywordSnippets(text) {
  return KEYWORDS.map((keyword) => snippetFor(text, keyword)).filter(Boolean).slice(0, 8);
}

function projectTokens(projectName) {
  const text = String(projectName || "");
  const tokens = [text];
  if (text.includes("삼성1차")) tokens.push("삼성1차", "광장동 561");
  if (text.includes("자양번영로3나길")) tokens.push("자양번영로3나길", "자양동 588-22", "588-22");
  return tokens.filter(Boolean);
}

function accessStatus(html, tablePairs, attachments, snippets, menuRow) {
  const text = stripTags(html);
  const projectSpecific = projectTokens(menuRow.project_name).some((token) => text.includes(token));
  if (/로그인|권한이 없습니다|접근 권한/.test(text)) return "login_or_permission";
  if (!projectSpecific && !tablePairs.length && !attachments.length && snippets.length) return "generic_process_template";
  if (tablePairs.length || attachments.length || snippets.length) return "content_detected";
  if (/등록된 자료가 없습니다|자료가 없습니다|등록된 내용이 없습니다|준비중/.test(text)) return "no_public_content";
  return "html_fetched_no_signal";
}

function procViewFromUrl(url) {
  return new URL(url).searchParams.get("procView") || "";
}

function selectRows(menuRows, ranks) {
  return menuRows
    .filter((row) => ranks.has(String(row.rank)) && String(row.url || "").includes("/cafe/procview/execute.do"))
    .sort((a, b) => Number(a.rank) - Number(b.rank) || String(a.label).localeCompare(String(b.label), "ko"));
}

function normalizeRow(menuRow, html, localHtmlPath) {
  const text = stripTags(html);
  const tablePairs = extractTables(html);
  const attachments = extractAttachments(html);
  const snippets = keywordSnippets(text);
  const status = accessStatus(html, tablePairs, attachments, snippets, menuRow);
  return {
    rank: String(menuRow.rank || ""),
    focus_area: menuRow.focus_area || "",
    district: menuRow.district || "",
    project_name: menuRow.project_name || "",
    cafe_id: menuRow.cafe_id || "",
    cafe_internal_id: menuRow.cafe_internal_id || "",
    bsns_pk: menuRow.bsns_pk || "",
    proc_view: procViewFromUrl(menuRow.url),
    page_label: menuRow.label || "",
    official_url: menuRow.url || "",
    local_html_path: localHtmlPath,
    access_status: status,
    page_title: extractTitle(html),
    table_field_count: tablePairs.length,
    table_fields: tablePairs.slice(0, 12).join("; "),
    attachment_count: attachments.length,
    attachments: attachments.slice(0, 8).join("; "),
    keyword_snippet_count: snippets.length,
    keyword_snippets: snippets.join(" || "),
    text_char_count: text.length,
    captured_at: new Date().toISOString(),
    fetch_error: "",
  };
}

function errorRow(menuRow, localHtmlPath, error) {
  return {
    rank: String(menuRow.rank || ""),
    focus_area: menuRow.focus_area || "",
    district: menuRow.district || "",
    project_name: menuRow.project_name || "",
    cafe_id: menuRow.cafe_id || "",
    cafe_internal_id: menuRow.cafe_internal_id || "",
    bsns_pk: menuRow.bsns_pk || "",
    proc_view: procViewFromUrl(menuRow.url),
    page_label: menuRow.label || "",
    official_url: menuRow.url || "",
    local_html_path: localHtmlPath,
    access_status: "fetch_failed",
    page_title: "",
    table_field_count: 0,
    table_fields: "",
    attachment_count: 0,
    attachments: "",
    keyword_snippet_count: 0,
    keyword_snippets: "",
    text_char_count: 0,
    captured_at: new Date().toISOString(),
    fetch_error: error,
  };
}

function markdown(rows) {
  const signalRows = rows.filter((row) => row.access_status === "content_detected");
  const genericRows = rows.filter((row) => row.access_status === "generic_process_template");
  const byStatus = Object.entries(rows.reduce((acc, row) => {
    acc[row.access_status] = (acc[row.access_status] || 0) + 1;
    return acc;
  }, {})).map(([status, count]) => ({ status, count }));
  return `# 정보몽땅 공정 페이지 프로브

작성 기준: ${UPDATED_AT}

삼성1차·자양번영로3나길처럼 도시공간포털 recordCode가 안 잡히는 소규모 사업의 정보몽땅 공정별 공개 페이지를 직접 내려받아 표, 첨부, 고시/인가 키워드 신호를 추출한 결과다. 원격 조회 산출물이므로 전체 로컬 재생성 체인에는 포함하지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 조회 페이지 | ${rows.length} |
| 신호 감지 페이지 | ${signalRows.length} |
| 공통 절차 안내 페이지 | ${genericRows.length} |
| 첨부 감지 페이지 | ${rows.filter((row) => Number(row.attachment_count) > 0).length} |
| 표 필드 감지 페이지 | ${rows.filter((row) => Number(row.table_field_count) > 0).length} |

## 상태별

${mdTable(byStatus, [
  { key: "status", label: "상태" },
  { key: "count", label: "건수" },
])}

## 신호 감지 페이지

${mdTable(signalRows, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "page_label", label: "공정" },
  { key: "table_field_count", label: "표" },
  { key: "attachment_count", label: "첨부" },
  { key: "table_fields", label: "표 필드" },
  { key: "keyword_snippets", label: "스니펫" },
  { key: "official_url", label: "URL" },
])}

## 전체 페이지

${mdTable(rows, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "page_label", label: "공정" },
  { key: "access_status", label: "상태" },
  { key: "page_title", label: "제목" },
  { key: "table_field_count", label: "표" },
  { key: "attachment_count", label: "첨부" },
  { key: "local_html_path", label: "HTML" },
])}
`;
}

async function main() {
  const ranks = targetRanks();
  const menuRows = JSON.parse(await readFile(MENU_LINKS_INPUT, "utf8"));
  const selected = selectRows(menuRows, ranks);
  await mkdir(HTML_DIR, { recursive: true });
  await mkdir(OUT_ANALYSIS_DIR, { recursive: true });

  const rows = [];
  for (const menuRow of selected) {
    const localHtmlPath = path.join(HTML_DIR, `${String(menuRow.rank).padStart(2, "0")}-${sanitize(menuRow.cafe_internal_id)}-${sanitize(menuRow.label)}-${procViewFromUrl(menuRow.url)}.html`);
    let page;
    if (USE_CACHE) {
      try {
        page = { ok: true, html: await readFile(localHtmlPath, "utf8"), error: "" };
      } catch {
        page = await fetchPage(menuRow.url);
      }
    } else {
      page = await fetchPage(menuRow.url);
    }
    if (!page.ok) {
      rows.push(errorRow(menuRow, localHtmlPath, page.error));
      continue;
    }
    await writeFile(localHtmlPath, page.html, "utf8");
    rows.push(normalizeRow(menuRow, page.html, localHtmlPath));
  }

  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        content_detected: rows.filter((row) => row.access_status === "content_detected").length,
        attachments: rows.filter((row) => Number(row.attachment_count) > 0).length,
        output: "analysis/cleanup-process-page-probes.md",
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
