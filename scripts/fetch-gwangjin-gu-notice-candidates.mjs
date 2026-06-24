#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/urban/map-missing-business-layer-details.json";
const OUT_DIR = "data/urban";
const HTML_DIR = "gwangjin-gu-notice-html";
const FILE_DIR = "data/urban/files";
const OUT_JSON = "gwangjin-gu-notice-candidates.json";
const OUT_CSV = "gwangjin-gu-notice-candidates.csv";
const OUT_ATTACHMENTS_CSV = "gwangjin-gu-notice-attachments.csv";
const BASE = "https://www.gwangjin.go.kr";
const SHOULD_DOWNLOAD = process.argv.includes("--download");

const TARGET_RANKS = new Set(["23", "24", "25", "27", "28", "29"]);
const BOARD_CONFIGS = [
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

function absoluteUrl(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("/")) return `${BASE}${href}`;
  return `${BASE}/${href}`;
}

function unique(values) {
  return [...new Set(values.map(compactText).filter(Boolean))];
}

function searchKeywords(row) {
  const text = `${row.project_name || ""} ${row.layer_zone_name || ""} ${row.urban_business_name || ""}`;
  const keywords = [row.layer_zone_name, row.urban_business_name, row.project_name];
  if (text.includes("삼성1차")) keywords.push("삼성1차", "광장동 삼성1차", "광장동 561", "소규모재건축");
  if (text.includes("워커힐")) keywords.push("워커힐", "워커힐아파트", "워커힐아파트 일대", "광장동 145");
  if (text.includes("광장극동")) keywords.push("광장극동", "광장극동아파트", "광장동 218-1");
  if (text.includes("자양번영로3나길")) keywords.push("자양번영로3나길", "자양번영로", "자양동 588-22", "가로주택정비사업");
  if (text.includes("자양1의4")) keywords.push("자양1의4", "자양1의 4", "자양4동 249-2");
  return unique(keywords);
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

async function csrfForNewBoard() {
  const html = await fetchText(`${BASE}/portal/bbs/B0000378/list.do?menuNo=200192`);
  return html.match(/name=["']csrfToken["'][^>]*value=["']([^"']+)/i)?.[1] || "";
}

async function searchBoard(config, keyword, csrfToken) {
  if (config.method === "GET") {
    const params = new URLSearchParams({
      menuNo: config.menu_no,
      pageIndex: "1",
      searchCnd: config.search_cnd,
      searchWrd: keyword,
    });
    if (config.dept_id) params.set("deptId", config.dept_id);
    const url = `${BASE}/portal/bbs/${config.board_id}/list.do?${params}`;
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
  const url = `${BASE}/portal/bbs/${config.board_id}/list.do?menuNo=${config.menu_no}`;
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

function extractSearchResults(html, boardId) {
  const rows = [];
  const viewPattern = new RegExp(`<a\\b[^>]*href=["']([^"']*\\/portal\\/bbs\\/${boardId}\\/view\\.do[^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>`, "gi");
  for (const match of html.matchAll(viewPattern)) {
    const title = stripTags(match[2]);
    const href = match[1].replaceAll("&amp;", "&");
    if (!title || !href.includes("/view.do")) continue;
    const id = href.match(/(?:nttId|notAncmtMgtNo)=([^&]+)/)?.[1] || href;
    rows.push({
      board_notice_id: id,
      title,
      detail_url: absoluteUrl(href),
    });
  }
  return rows;
}

function scoreCandidate(row, title, detailText) {
  const haystack = normalize(`${title} ${detailText}`);
  const exactNames = unique([row.layer_zone_name, row.urban_business_name, row.project_name]);
  let score = 0;
  for (const name of exactNames) {
    const normalized = normalize(name);
    if (!normalized) continue;
    if (normalize(title).includes(normalized)) score += 80;
    else if (haystack.includes(normalized)) score += 35;
  }
  const text = `${row.project_name || ""} ${row.layer_zone_name || ""} ${row.urban_business_name || ""}`;
  const tokens = [];
  if (text.includes("삼성1차")) tokens.push("삼성1차", "광장동 561");
  if (text.includes("워커힐")) tokens.push("워커힐", "광장동 145");
  if (text.includes("광장극동")) tokens.push("광장극동", "광장동 218");
  if (text.includes("자양번영로3나길")) tokens.push("자양번영로3나길", "자양번영로", "자양동 588");
  if (text.includes("자양1의4")) tokens.push("자양1의4", "자양4동 249");
  for (const token of tokens) {
    const normalized = normalize(token);
    if (normalize(title).includes(normalized)) score += 40;
    else if (haystack.includes(normalized)) score += 12;
  }
  if (/조합설립|추진위원회|도시관리계획|지구단위계획|공람|인가|고시|공고/.test(title)) score += 10;
  return score;
}

function confidence(score) {
  if (score >= 80) return "high";
  if (score >= 45) return "medium";
  if (score > 0) return "low";
  return "none";
}

function extractNoticeNo(text) {
  return compactText(text.match(/(?:서울특별시\s*)?광진구\s*(?:공고|고시)\s*제\s*\d{4}\s*-\s*\d+\s*호/)?.[0] || text.match(/(?:공고|고시)\s*제\s*\d{4}\s*-\s*\d+\s*호/)?.[0] || "");
}

function extractNoticeDate(text) {
  return compactText(text.match(/등록일\s*(\d{4}-\d{2}-\d{2})/)?.[1] || text.match(/공고시작일\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "");
}

function extractDepartment(text) {
  return compactText(text.match(/(?:담당부서|부서)\s*([가-힣A-Za-z0-9]+과)/)?.[1] || "");
}

function extractAttachments(html) {
  const attachments = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].replaceAll("&amp;", "&");
    const label = stripTags(match[2]);
    if (!/file|File|download|atch|Atch|첨부|\.pdf|\.hwp|\.hwpx|\.zip/i.test(`${href} ${label}`)) continue;
    attachments.push({
      attachment_name: label.replace(/\s*\([^)]*\)\s*$/, ""),
      attachment_url: absoluteUrl(href),
    });
  }
  return attachments;
}

function sanitizeFileName(value) {
  return String(value || "file")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function attachmentLocalPath(row, candidate, attachment, index) {
  const compactName = attachment.attachment_name.replace(/\s+/g, "");
  const ext = /hwpx/i.test(compactName)
    ? ".hwpx"
    : /hwp/i.test(compactName)
      ? ".hwp"
      : /pdf/i.test(compactName)
        ? ".pdf"
        : /zip/i.test(compactName)
          ? ".zip"
          : /jpe?g/i.test(compactName)
            ? ".jpg"
            : /png/i.test(compactName)
              ? ".png"
              : "";
  const rank = String(row.rank).padStart(2, "0");
  const id = sanitizeFileName(candidate.board_notice_id);
  const base = sanitizeFileName(path.basename(attachment.attachment_name, path.extname(attachment.attachment_name)) || `attachment-${index}`);
  return path.join(FILE_DIR, `${rank}-${candidate.board_id}-${id}-gwangjin-gu-${index}-${base}${ext}`);
}

async function downloadAttachment(row, candidate, attachment, index) {
  const localPath = attachmentLocalPath(row, candidate, attachment, index);
  try {
    const existing = await stat(localPath);
    const buffer = await readFile(localPath);
    return {
      local_path: localPath,
      byte_size: existing.size,
      sha256: createHash("sha256").update(buffer).digest("hex"),
      download_status: "already_exists",
      download_error: "",
    };
  } catch {
    // Download below.
  }
  const response = await fetch(attachment.attachment_url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)" },
  });
  if (!response.ok) {
    return {
      local_path: "",
      byte_size: "",
      sha256: "",
      download_status: "failed",
      download_error: `HTTP ${response.status}`,
    };
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, buffer);
  return {
    local_path: localPath,
    byte_size: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    download_status: "downloaded",
    download_error: "",
  };
}

function candidateRow(baseRow, config, keyword, listUrl, result, html, localHtmlPath) {
  const detailText = stripTags(html);
  const score = scoreCandidate(baseRow, result.title, detailText);
  const attachments = extractAttachments(html);
  return {
    rank: baseRow.rank,
    focus_area: baseRow.focus_area,
    district: baseRow.district,
    dong: baseRow.dong,
    project_name: baseRow.project_name,
    current_stage: baseRow.current_stage,
    present_sn: baseRow.present_sn,
    layer_zone_name: baseRow.layer_zone_name,
    urban_business_name: baseRow.urban_business_name,
    source_site: "광진구청",
    board_id: config.board_id,
    board_label: config.board_label,
    board_notice_id: result.board_notice_id,
    search_keyword: keyword,
    search_list_url: listUrl,
    official_url: result.detail_url,
    local_html_path: localHtmlPath,
    search_status: "candidate",
    match_score: score,
    match_confidence: confidence(score),
    notice_title: result.title,
    notice_no: extractNoticeNo(detailText),
    notice_date: extractNoticeDate(detailText),
    department: extractDepartment(detailText),
    attachment_count: attachments.length,
    attachment_names: attachments.map((item) => item.attachment_name).join("; "),
    review_note:
      score >= 80
        ? "사업명/위치 토큰이 광진구청 고시공고 제목 또는 본문과 강하게 일치"
        : "공식 광진구청 검색 후보이므로 첨부 원문 대조 필요",
  };
}

function emptyRow(row, keywords) {
  return {
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    dong: row.dong,
    project_name: row.project_name,
    current_stage: row.current_stage,
    present_sn: row.present_sn,
    layer_zone_name: row.layer_zone_name,
    urban_business_name: row.urban_business_name,
    source_site: "광진구청",
    board_id: "",
    board_label: "",
    board_notice_id: "",
    search_keyword: keywords.join("; "),
    search_list_url: "",
    official_url: "",
    local_html_path: "",
    search_status: "no_candidate",
    match_score: 0,
    match_confidence: "none",
    notice_title: "",
    notice_no: "",
    notice_date: "",
    department: "",
    attachment_count: 0,
    attachment_names: "",
    review_note: "광진구청 신/구 고시공고 검색에서 직접 후보를 찾지 못함",
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  return `${lines.join("\n")}\n`;
}

async function main() {
  const inputRows = JSON.parse(await readFile(INPUT, "utf8")).filter((row) => TARGET_RANKS.has(String(row.rank)));
  const csrfToken = await csrfForNewBoard();
  await mkdir(path.join(OUT_DIR, HTML_DIR), { recursive: true });
  await mkdir(FILE_DIR, { recursive: true });

  const rows = [];
  const attachmentRows = [];
  const seen = new Set();

  for (const inputRow of inputRows) {
    const keywords = searchKeywords(inputRow);
    const candidates = [];
    for (const keyword of keywords) {
      for (const config of BOARD_CONFIGS) {
        const { url: listUrl, html: listHtml } = await searchBoard(config, keyword, csrfToken);
        for (const result of extractSearchResults(listHtml, config.board_id)) {
          const key = `${inputRow.rank}-${config.board_id}-${result.board_notice_id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const detailHtml = await fetchText(result.detail_url);
          const localHtmlPath = path.join(OUT_DIR, HTML_DIR, `${String(inputRow.rank).padStart(2, "0")}-${config.board_id}-${sanitizeFileName(result.board_notice_id)}.html`);
          await writeFile(localHtmlPath, detailHtml);
          const row = candidateRow(inputRow, config, keyword, listUrl, result, detailHtml, localHtmlPath);
          if (row.match_score > 0) candidates.push({ row, html: detailHtml });
        }
      }
    }
    candidates.sort((a, b) => b.row.match_score - a.row.match_score || a.row.notice_title.localeCompare(b.row.notice_title, "ko"));
    const kept = candidates.filter((item) => item.row.match_confidence === "high").slice(0, 5);
    if (!kept.length) {
      rows.push(emptyRow(inputRow, keywords));
      continue;
    }
    for (const item of kept) {
      rows.push(item.row);
      const attachments = extractAttachments(item.html);
      for (const [index, attachment] of attachments.entries()) {
        let download = { local_path: "", byte_size: "", sha256: "", download_status: SHOULD_DOWNLOAD ? "not_attempted" : "", download_error: "" };
        if (SHOULD_DOWNLOAD) download = await downloadAttachment(inputRow, item.row, attachment, index + 1);
        attachmentRows.push({
          rank: item.row.rank,
          focus_area: item.row.focus_area,
          district: item.row.district,
          project_name: item.row.project_name,
          board_id: item.row.board_id,
          board_notice_id: item.row.board_notice_id,
          notice_title: item.row.notice_title,
          attachment_index: index + 1,
          attachment_name: attachment.attachment_name,
          attachment_url: attachment.attachment_url,
          local_path: download.local_path,
          byte_size: download.byte_size,
          sha256: download.sha256,
          download_status: download.download_status,
          download_error: download.download_error,
        });
      }
    }
  }

  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  await writeFile(path.join(OUT_DIR, OUT_ATTACHMENTS_CSV), toCsv(attachmentRows));
  console.log(
    JSON.stringify(
      {
        inputRows: inputRows.length,
        candidateRows: rows.filter((row) => row.search_status === "candidate").length,
        highConfidence: rows.filter((row) => row.match_confidence === "high").length,
        noCandidate: rows.filter((row) => row.search_status === "no_candidate").length,
        attachments: attachmentRows.length,
        downloaded: SHOULD_DOWNLOAD ? attachmentRows.filter((row) => row.local_path).length : 0,
        output: `data/urban/${OUT_JSON}`,
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
