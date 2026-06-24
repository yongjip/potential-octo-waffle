#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const FACT_CHECK_INPUT = "analysis/management-stage-fact-check.json";
const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const OUT_DIR = "data/cleanup";
const HTML_DIR = "management-stage-html";
const OUT_JSON = "management-stage-doc-links.json";
const OUT_CSV = "management-stage-doc-links.csv";
const BASE = "https://cleanup.seoul.go.kr";

const PUBLIC_ITEMS = [
  { item_no: "202", item_label: "사업(시행ㆍ변경ㆍ중지ㆍ폐지)인가서", category_group: "사업시행계획서(인가)" },
  { item_no: "203", item_label: "건축시설계획-사업개요", category_group: "사업시행계획서(인가)" },
  { item_no: "210", item_label: "정비사업비 추산액 및 조합원 부담규모 및 시기", category_group: "관리처분계획서(인가)" },
  { item_no: "213", item_label: "관리처분계획인가(변경ㆍ중지ㆍ폐지인가)서", category_group: "관리처분계획서(인가)" },
  { item_no: "379", item_label: "정비사업 정보공개서", category_group: "관리처분계획서(인가)" },
];

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return decodeHtml(String(value ?? "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " "));
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
    "source_type",
    "category_group",
    "item_no",
    "item_label",
    "official_url",
    "local_html_path",
    "access_status",
    "document_title",
    "application_date",
    "approval_date",
    "notice_date",
    "business_enforcement_date",
    "land_area",
    "building_coverage_ratio",
    "floor_area_ratio",
    "gross_floor_area",
    "total_units",
    "sale_units",
    "rental_units",
    "construction_cost",
    "has_attachment_reference",
    "field_count",
    "summary_note",
    "captured_at",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank), row]));
}

function selectedProjects(factRows, menuRows) {
  const menuByRank = {};
  for (const row of menuRows) {
    if (!row.cafe_internal_id) continue;
    menuByRank[String(row.rank)] = row;
  }
  return factRows.map((row) => {
    const menu = menuByRank[String(row.rank)] || {};
    return {
      rank: String(row.rank),
      focus_area: row.focus_area || menu.focus_area || "",
      district: menu.district || "",
      project_name: row.project_name || menu.project_name || "",
      cafe_id: menu.cafe_internal_id || "",
    };
  }).filter((row) => row.cafe_id);
}

function itemUrl(cafeId, itemNo) {
  return `${BASE}/service/opendata/cafeOthbc/vscrCafe.do?cafeId=${encodeURIComponent(cafeId)}&othbcIemSn=${encodeURIComponent(itemNo)}`;
}

function wctListUrl(cafeId) {
  return `${BASE}/assc/bbs-use/lscrWctList.do?cafeId=${encodeURIComponent(cafeId)}`;
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
  const title = extractTitle(html);
  const fields = extractTableFields(html);
  const status = normalizeStatus(title, fields, html);
  const hasAttachmentReference = /별첨|첨부|참조/.test(stripTags(html));
  const officialUrl = itemUrl(project.cafe_id, item.item_no);
  return {
    rank: project.rank,
    focus_area: project.focus_area,
    district: project.district,
    project_name: project.project_name,
    source_type: "정보몽땅_공개항목",
    category_group: item.category_group,
    item_no: item.item_no,
    item_label: item.item_label,
    official_url: officialUrl,
    local_html_path: localPath,
    access_status: status,
    document_title: title,
    application_date: field(fields, ["(변경)인가신청일자"]),
    approval_date: field(fields, ["인가(변경)일자", "관리처분인가(변경)일자"]),
    notice_date: field(fields, ["인가(변경)고시일자"]),
    business_enforcement_date: field(fields, ["사업시행인가(변경)일자"]),
    land_area: field(fields, ["토지면적", "대지면적"]),
    building_coverage_ratio: field(fields, ["건폐율 (%)"]),
    floor_area_ratio: field(fields, ["용적률 (%)"]),
    gross_floor_area: field(fields, ["연면적 (㎡)"]),
    total_units: field(fields, ["건설세대수(총)"]),
    sale_units: field(fields, ["건설세대수(분양)"]),
    rental_units: field(fields, ["건설세대수(임대)"]),
    construction_cost: field(fields, ["공사비 (원)"]),
    has_attachment_reference: hasAttachmentReference ? "yes" : "no",
    field_count: String(Object.keys(fields).length),
    fields,
    summary_note: status === "public_table_extracted" ? "공개 HTML 표에서 추출" : "공개 HTML에서 상세 표 미확인",
    captured_at: new Date().toISOString(),
  };
}

function extractWctRows(html) {
  const rows = [];
  const regex = /openWinWct\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*'([^']+)')?\s*\)[\s\S]{0,260}?>([^<>]+)<\/a>[\s\S]{0,180}?class=["']date["'][^>]*>([^<>]+)<\/p>/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html))) {
    const cafeId = match[1];
    const gubun = match[2];
    const calcOdr = match[3];
    const title = decodeHtml(match[5]);
    const date = decodeHtml(match[6]);
    const key = `${cafeId}|${gubun}|${calcOdr}|${title}|${date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ cafeId, gubun, calcOdr, title, date });
  }
  return rows;
}

function summarizeWct(project, wctRow, localPath) {
  return {
    rank: project.rank,
    focus_area: project.focus_area,
    district: project.district,
    project_name: project.project_name,
    source_type: "정보몽땅_분담금목록",
    category_group: "확정된 사업비 및 분담금 목록",
    item_no: wctRow.calcOdr,
    item_label: wctRow.title,
    official_url: `${BASE}/sures/assc/outptMber/vscrWctSumry.do?cafeId=${encodeURIComponent(project.cafe_id)}&calcOdr=${encodeURIComponent(wctRow.calcOdr)}`,
    local_html_path: localPath,
    access_status: "public_list_item",
    document_title: wctRow.title,
    application_date: "",
    approval_date: "",
    notice_date: wctRow.date,
    business_enforcement_date: "",
    land_area: "",
    building_coverage_ratio: "",
    floor_area_ratio: "",
    gross_floor_area: "",
    total_units: "",
    sale_units: "",
    rental_units: "",
    construction_cost: "",
    has_attachment_reference: "no",
    field_count: "2",
    fields: { "목록 제목": wctRow.title, "목록 일자": wctRow.date },
    summary_note: "분담금 목록의 공개 항목명과 일자만 수집, 개인별 조회 데이터는 수집하지 않음",
    captured_at: new Date().toISOString(),
  };
}

async function main() {
  const [factRows, menuRows] = await Promise.all([
    readFile(FACT_CHECK_INPUT, "utf8").then(JSON.parse),
    readFile(MENU_LINKS_INPUT, "utf8").then(JSON.parse),
  ]);
  const projects = selectedProjects(factRows, menuRows);
  const projectByRank = byRank(projects);
  await mkdir(path.join(OUT_DIR, HTML_DIR), { recursive: true });

  const rows = [];
  for (const project of projects) {
    for (const item of PUBLIC_ITEMS) {
      const url = itemUrl(project.cafe_id, item.item_no);
      const html = await fetchText(url);
      const localPath = path.join(OUT_DIR, HTML_DIR, `${project.rank}-${project.cafe_id}-${item.item_no}.html`);
      await writeFile(localPath, html);
      rows.push(summarizeItem(project, item, html, localPath));
    }

    const wctUrl = wctListUrl(project.cafe_id);
    const wctHtml = await fetchText(wctUrl);
    const wctLocalPath = path.join(OUT_DIR, HTML_DIR, `${project.rank}-${project.cafe_id}-wct-list.html`);
    await writeFile(wctLocalPath, wctHtml);
    for (const wctRow of extractWctRows(wctHtml)) {
      const rankProject = projectByRank[project.rank] || project;
      rows.push(summarizeWct(rankProject, wctRow, wctLocalPath));
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
