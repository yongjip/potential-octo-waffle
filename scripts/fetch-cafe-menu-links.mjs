#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/priority-redevelopment-candidates.csv";
const OUT_DIR = "data/cleanup";
const OUT_JSON = "cafe-menu-links-priority-candidates.json";
const OUT_CSV = "cafe-menu-links-priority-candidates.csv";
const BASE = "https://cleanup.seoul.go.kr";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

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
  return decodeHtml(String(value ?? "").replace(/<[^>]*>/g, " "));
}

function cleanLabel(value) {
  return decodeHtml(value)
    .replace(/html\s*\+=/g, " ")
    .replace(/[;']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function absoluteUrl(href) {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return "";
  return new URL(href, BASE).toString();
}

function internalIds(html) {
  const cafeId = html.match(/cafeId=([A-Za-z0-9_-]+)/)?.[1] ?? "";
  const bsnsPk = html.match(/bsnsPk=([0-9-]+)/)?.[1] ?? "";
  const phone = stripTags(html.match(/<span class="telnum">([\s\S]*?)<\/span>/)?.[1] ?? "");
  return { cafe_internal_id: cafeId, bsns_pk: bsnsPk, contact_phone: phone };
}

function shouldKeepLink(label, href) {
  const text = `${label} ${href}`;
  return [
    "사업개요",
    "위치도",
    "배치도",
    "단위세대",
    "추진경과",
    "신속통합기획",
    "설계지침",
    "조합입찰공고",
    "공지사항",
    "서면결의서",
    "procview",
    "cafeOthbc",
    "cleanup-prtnelapse",
    "bbs-use",
    "bidpblanc",
  ].some((needle) => text.includes(needle));
}

function extractAnchorLinks(html) {
  const links = [];
  const seen = new Set();
  const regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const attrs = match[1];
    const label = cleanLabel(stripTags(match[2]) || attr(attrs, "title"));
    const href = decodeHtml(attr(attrs, "href"));
    const url = absoluteUrl(href);
    if (!url || !shouldKeepLink(label, href)) continue;
    const key = `${label}|${url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ link_type: "anchor", label, url, action: "" });
  }
  return links;
}

function extractOpenDataActions(html) {
  const links = [];
  const seen = new Set();
  const regex = /lscrOpen\\?\('([0-9]+)'\\?\)[\s\S]{0,240}?title="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html))) {
    const itemNo = match[1];
    const label = decodeHtml(match[2]);
    const key = `${itemNo}|${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ link_type: "open_data_action", label, url: "", action: `lscrOpen(${itemNo})` });
  }
  return links;
}

async function fetchProject(row) {
  const response = await fetch(row.official_project_url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${row.rank} ${row.project_name}`);
  const html = await response.text();
  const ids = internalIds(html);
  const links = [...extractAnchorLinks(html), ...extractOpenDataActions(html)];
  return links.map((link) => ({
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    project_name: row.project_name,
    cafe_id: row.cafe_id,
    official_project_url: row.official_project_url,
    ...ids,
    ...link,
  }));
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
    "cafe_id",
    "cafe_internal_id",
    "bsns_pk",
    "contact_phone",
    "link_type",
    "label",
    "url",
    "action",
    "official_project_url",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

async function main() {
  const candidates = parseCsv(await readFile(INPUT, "utf8"));
  const rows = [];
  for (const candidate of candidates) {
    if (!candidate.official_project_url) continue;
    rows.push(...(await fetchProject(candidate)));
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), JSON.stringify(rows, null, 2));
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));

  const byProject = rows.reduce((acc, row) => {
    acc[row.rank] = (acc[row.rank] ?? 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ projects: Object.keys(byProject).length, links: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
