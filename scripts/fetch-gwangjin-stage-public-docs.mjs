#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const OUT_DIR = "data/cleanup";
const HTML_DIR = "gwangjin-stage-html";
const OUT_JSON = "gwangjin-stage-public-docs.json";
const OUT_CSV = "gwangjin-stage-public-docs.csv";
const BASE = "https://cleanup.seoul.go.kr";

const TARGET_RANKS = new Set(["23", "24", "28", "29"]);
const STAGE_ITEMS = {
  조합설립인가: [
    { item_no: "200", item_label: "조합설립(변경)인가서/조합정관", category_group: "조합설립인가" },
  ],
  추진위원회승인: [
    { item_no: "226", item_label: "추진위원회 승인서/운영규정", category_group: "추진위원회 승인" },
  ],
};

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
  const fields = [
    "rank",
    "focus_area",
    "district",
    "project_name",
    "current_stage",
    "category_group",
    "item_no",
    "item_label",
    "official_url",
    "local_html_path",
    "access_status",
    "document_title",
    "application_date",
    "approval_date",
    "landowner_count",
    "union_member_count",
    "consenter_count",
    "consent_rate_pct",
    "has_attachment_reference",
    "field_count",
    "safe_field_keys",
    "excluded_field_keys",
    "summary_note",
    "captured_at",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function itemUrl(cafeId, itemNo) {
  return `${BASE}/service/opendata/cafeOthbc/vscrCafe.do?cafeId=${encodeURIComponent(cafeId)}&othbcIemSn=${encodeURIComponent(itemNo)}`;
}

function selectedProjects(matrixRows, menuRows) {
  const cafeByRank = {};
  for (const row of menuRows) {
    if (!row.cafe_internal_id) continue;
    cafeByRank[String(row.rank)] = row.cafe_internal_id;
  }
  return matrixRows
    .filter((row) => TARGET_RANKS.has(String(row.rank)))
    .map((row) => ({
      rank: String(row.rank),
      focus_area: row.focus_area || "",
      district: row.district || "",
      project_name: row.project_name || "",
      current_stage: row.current_stage || "",
      cafe_id: cafeByRank[String(row.rank)] || "",
      items: STAGE_ITEMS[row.current_stage] || [],
    }))
    .filter((row) => row.cafe_id && row.items.length > 0)
    .sort((a, b) => Number(a.rank) - Number(b.rank));
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

function extractTitle(html) {
  return stripTags(html.match(/<h3\s+class=["']u-tit01["'][^>]*>([\s\S]*?)<\/h3>/i)?.[1] || "");
}

function extractTableFields(html) {
  const fields = {};
  const rows = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const key = stripTags(row.match(/<th\b[^>]*>([\s\S]*?)<\/th>/i)?.[1] || "");
    const value = stripTags(row.match(/<td\b[^>]*>([\s\S]*?)<\/td>/i)?.[1] || "");
    if (key && value) fields[key] = value;
  }
  return fields;
}

function field(fields, names) {
  for (const name of names) {
    if (fields[name]) return fields[name];
  }
  return "";
}

function normalizeStatus(title, fields, html) {
  if (Object.keys(fields).length > 0) return "public_table_extracted";
  if (/로그인|권한이 없습니다/.test(stripTags(html))) return "login_or_permission_message";
  if (/<img\b[^>]+img_location\.gif/i.test(html)) return "no_public_table_placeholder";
  if (title) return "title_only";
  return "no_public_content_detected";
}

function summarizeItem(project, item, html, localPath) {
  const fields = extractTableFields(html);
  const safeKeys = [
    "사업명",
    "(변경)인가신청일자",
    "인가(변경)일자",
    "(변경)신청일자",
    "(변경)승인일자",
    "토지등소유자 수",
    "조합원 수",
    "동의자 수",
    "동의율 (%)",
  ];
  const excludedKeys = Object.keys(fields).filter((key) => !safeKeys.includes(key));
  const title = extractTitle(html);
  const status = normalizeStatus(title, fields, html);
  const htmlText = stripTags(html);
  return {
    rank: project.rank,
    focus_area: project.focus_area,
    district: project.district,
    project_name: project.project_name,
    current_stage: project.current_stage,
    category_group: item.category_group,
    item_no: item.item_no,
    item_label: item.item_label,
    official_url: itemUrl(project.cafe_id, item.item_no),
    local_html_path: localPath,
    access_status: status,
    document_title: title,
    application_date: field(fields, ["(변경)인가신청일자", "(변경)신청일자"]),
    approval_date: field(fields, ["인가(변경)일자", "(변경)승인일자"]),
    landowner_count: field(fields, ["토지등소유자 수"]),
    union_member_count: field(fields, ["조합원 수"]),
    consenter_count: field(fields, ["동의자 수"]),
    consent_rate_pct: field(fields, ["동의율 (%)"]),
    has_attachment_reference: /별첨|첨부|참조/.test(htmlText) ? "yes" : "no",
    field_count: String(Object.keys(fields).length),
    safe_field_keys: safeKeys.filter((key) => fields[key]).join("; "),
    excluded_field_keys: excludedKeys.join("; "),
    summary_note: status === "public_table_extracted" ? "공개 HTML 표에서 단계·동의율 필드 추출" : "공개 HTML에서 상세 표 미확인",
    captured_at: new Date().toISOString(),
  };
}

async function main() {
  const [matrixRows, menuRows] = await Promise.all([
    readFile(MATRIX_INPUT, "utf8").then(JSON.parse),
    readFile(MENU_LINKS_INPUT, "utf8").then(JSON.parse),
  ]);
  const projects = selectedProjects(matrixRows, menuRows);
  await mkdir(path.join(OUT_DIR, HTML_DIR), { recursive: true });

  const rows = [];
  for (const project of projects) {
    for (const item of project.items) {
      const url = itemUrl(project.cafe_id, item.item_no);
      const html = await fetchText(url);
      const localPath = path.join(OUT_DIR, HTML_DIR, `${project.rank}-${project.cafe_id}-${item.item_no}.html`);
      await writeFile(localPath, html);
      rows.push(summarizeItem(project, item, html, localPath));
    }
  }

  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  const statusCounts = rows.reduce((acc, row) => {
    acc[row.access_status] = (acc[row.access_status] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ projects: projects.length, rows: rows.length, statusCounts }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
