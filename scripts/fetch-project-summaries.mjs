#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const OUT_DIR = "data/cleanup";
const OUT_JSON = "project-summaries-priority-candidates.json";
const OUT_CSV = "project-summaries-priority-candidates.csv";

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

function extractTables(html) {
  const tables = [];
  const regex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const tableHtml = match[1];
    const caption = stripTags(tableHtml.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i)?.[1] ?? "");
    const rows = [];
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableHtml))) {
      const cells = [];
      const cellRegex = /<(t[hd])\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
        const value = stripTags(cellMatch[2]);
        if (value) cells.push(value);
      }
      if (cells.length > 0) rows.push(cells);
    }
    tables.push({ caption, rows });
  }
  return tables;
}

function tableByCaption(tables, caption) {
  return tables.find((table) => table.caption.replace(/\s+/g, " ").trim() === caption);
}

function assignPairs(row, target) {
  for (let index = 0; index < row.length - 1; index += 2) {
    target[row[index]] = row[index + 1];
  }
}

function parseBasic(table) {
  const fields = {};
  if (!table) return fields;
  for (const row of table.rows) assignPairs(row, fields);
  return fields;
}

function parseSingleRowTable(table, headers) {
  if (!table) return {};
  const dataRow = [...table.rows]
    .reverse()
    .find((row) => row.length >= headers.length && !row.some((cell) => ["대지면적(㎡)", "건축면적(㎡)", "용적률(%)", "최고높이(m)", "층수"].includes(cell)));
  if (!dataRow) return {};
  return Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""]));
}

function sumNumbers(values) {
  const nums = values
    .map((value) => String(value ?? "").trim())
    .filter((value) => value.length > 0)
    .map((value) => Number(value.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));
  if (nums.length === 0) return "";
  return nums.reduce((sum, value) => sum + value, 0).toLocaleString("en-US");
}

function parseSupply(table, type) {
  if (!table) return {};
  const rows = table.rows;
  const dataRow = [...rows]
    .reverse()
    .find((row) => row.length >= 7 && !row.some((cell) => ["대지면적(㎡)", "건축면적(㎡)", "연면적(㎡)", "전용면적별 세대수"].includes(cell)));
  if (!dataRow) return {};
  const hasExplicitTotal = dataRow.length >= 9;
  const unitStart = hasExplicitTotal ? 5 : 4;
  const unitFields = dataRow.slice(unitStart, unitStart + 3);
  const total = hasExplicitTotal ? dataRow[4] || sumNumbers(unitFields) : sumNumbers(unitFields);
  const prefix = type === "sale" ? "sale" : "rental";
  return {
    [`${prefix}_land_area_sqm`]: dataRow[0] ?? "",
    [`${prefix}_building_area_sqm`]: dataRow[1] ?? "",
    [`${prefix}_gross_floor_area_sqm`]: dataRow[2] ?? "",
    [`${prefix}_building_count`]: dataRow[3] ?? "",
    [`${prefix}_household_total`]: total,
    [`${prefix}_household_small`]: dataRow[unitStart] ?? "",
    [`${prefix}_household_mid`]: dataRow[unitStart + 1] ?? "",
    [`${prefix}_household_large`]: dataRow[unitStart + 2] ?? "",
    [`${prefix}_note`]: dataRow[unitStart + 3] ?? "",
  };
}

function parseSummary(html) {
  const tables = extractTables(html);
  const basic = parseBasic(tableByCaption(tables, "정비사업개요"));
  const planning = parseBasic(tableByCaption(tables, "도시계획 사항"));
  const building = parseSingleRowTable(tableByCaption(tables, "건축계획"), [
    "main_use",
    "site_area_sqm",
    "building_area_sqm",
    "gross_floor_area_sqm",
    "building_coverage_ratio_pct",
    "floor_area_ratio_pct",
    "max_height_m",
    "floors",
  ]);
  const sale = parseSupply(tableByCaption(tables, "주택공급계획 분양"), "sale");
  const rental = parseSupply(tableByCaption(tables, "주택공급계획 임대"), "rental");
  const totalHouseholds = sumNumbers([sale.sale_household_total, rental.rental_household_total]);

  return {
    district_name: basic["정비구역 명칭"] ?? "",
    business_type_code: basic["사업유형"] ?? "",
    business_type: basic["사업구분"] ?? "",
    location: basic["정비구역 위치"] ?? "",
    public_support: basic["공공지원 대상여부"] ?? "",
    district_area_sqm: basic["정비구역 면적(㎡)"] ?? "",
    union_member_count: basic["조합원 수"] ?? "",
    landowner_count: basic["토지등 소유자 수"] ?? "",
    tenant_count: basic["세입자 수"] ?? "",
    zoning_area: planning["용도지역"] ?? "",
    zoning_district: planning["용도지구"] ?? "",
    ...building,
    ...sale,
    ...rental,
    total_households: totalHouseholds,
  };
}

async function fetchSummary(menuRow) {
  const response = await fetch(menuRow.url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${menuRow.rank} ${menuRow.project_name}`);
  const html = await response.text();
  return {
    rank: menuRow.rank,
    focus_area: menuRow.focus_area,
    district: menuRow.district,
    project_name: menuRow.project_name,
    cafe_id: menuRow.cafe_id,
    cafe_internal_id: menuRow.cafe_internal_id,
    bsns_pk: menuRow.bsns_pk,
    summary_url: menuRow.url,
    ...parseSummary(html),
  };
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
    "district_name",
    "business_type",
    "location",
    "district_area_sqm",
    "union_member_count",
    "landowner_count",
    "tenant_count",
    "zoning_area",
    "zoning_district",
    "main_use",
    "site_area_sqm",
    "building_area_sqm",
    "gross_floor_area_sqm",
    "building_coverage_ratio_pct",
    "floor_area_ratio_pct",
    "max_height_m",
    "floors",
    "sale_household_total",
    "rental_household_total",
    "total_households",
    "summary_url",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

async function main() {
  const menuRows = JSON.parse(await readFile(MENU_LINKS_INPUT, "utf8"));
  const summaryLinks = menuRows
    .filter((row) => row.label === "사업개요" && row.url)
    .sort((a, b) => Number(a.rank) - Number(b.rank));
  const rows = [];
  for (const link of summaryLinks) rows.push(await fetchSummary(link));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), JSON.stringify(rows, null, 2));
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));

  const completeRows = rows.filter((row) => row.district_area_sqm || row.total_households || row.floor_area_ratio_pct).length;
  console.log(JSON.stringify({ projects: rows.length, completeRows }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
