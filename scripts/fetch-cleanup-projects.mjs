#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://cleanup.seoul.go.kr/cleanup/bsnssttus/lsubBsnsSttus.do";
const PROJECT_BASE_URL = "https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=";
const MAP_BASE_URL = "https://urban.seoul.go.kr/view/map/mapPopup.html?recordCode=";
const OUT_DIR = "data/cleanup";
const SNAPSHOT_DIR = path.join(OUT_DIR, "snapshots");
const OUT_JSON = path.join(OUT_DIR, "cleanup-projects-gangnam-songpa-gwangjin.json");
const OUT_CSV = path.join(OUT_DIR, "cleanup-projects-gangnam-songpa-gwangjin.csv");

const DISTRICTS = [
  { name: "강남구", code: "11680", focusArea: "강남" },
  { name: "송파구", code: "11710", focusArea: "잠실/송파" },
  { name: "광진구", code: "11215", focusArea: "구의/광진" },
];

const DEFAULT_PARAMS = {
  bsnsSeCodeList: ["100", "101", "102", "103", "104", "105", "106", "107"],
  bsnsEfctMthdList: ["1", "2", "3", "4"],
  operSeCodeList: ["100", "101", "102", "103"],
  cafeSttusCodeList: ["100", "110"],
  pageSize: "10",
};

function appendParam(params, key, value) {
  if (Array.isArray(value)) {
    for (const item of value) params.append(key, item);
  } else {
    params.set(key, value);
  }
}

function buildUrl(districtCode, page) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(DEFAULT_PARAMS)) appendParam(params, key, value);
  params.set("scupBsnsSttus.signguCode", districtCode);
  params.set("cpage", String(page));
  return `${BASE_URL}?${params.toString()}`;
}

function decodeHtml(value) {
  return value
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
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function extractCellValues(rowHtml) {
  const cells = [];
  const cellRegex = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
  let match;
  while ((match = cellRegex.exec(rowHtml))) cells.push(stripTags(match[1]));
  return cells;
}

function extractCafeId(rowHtml) {
  const match = rowHtml.match(/cafeOpenPopup\('([^']+)'\)/);
  return match ? match[1] : "";
}

function extractMapId(rowHtml) {
  const match = rowHtml.match(/mapOpenPopup\('([^']+)'\)/);
  return match ? match[1] : "";
}

function projectUrl(cafeId) {
  return cafeId ? `${PROJECT_BASE_URL}${encodeURIComponent(cafeId)}` : "";
}

function mapUrl(mapId) {
  return mapId ? `${MAP_BASE_URL}${encodeURIComponent(mapId)}` : "";
}

function parseRows(html, district) {
  const rows = [];
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
  let match;
  while ((match = rowRegex.exec(html))) {
    const rowHtml = match[1];
    const cells = extractCellValues(rowHtml);
    if (cells.length < 9) continue;
    const [listNo, districtName, projectType, projectName, representativeLot, currentStage, publicDocCount, disclosureTimeliness, dataCompleteness] =
      cells;
    const cafeId = extractCafeId(rowHtml);
    const mapId = extractMapId(rowHtml);
    rows.push({
      focus_area: district.focusArea,
      district: districtName,
      district_code: district.code,
      list_no: listNo,
      project_type: projectType,
      project_name: projectName,
      representative_lot: representativeLot,
      current_stage: currentStage,
      public_doc_count: publicDocCount,
      disclosure_timeliness: disclosureTimeliness,
      data_completeness: dataCompleteness,
      cafe_id: cafeId,
      map_id: mapId,
      official_project_url: projectUrl(cafeId),
      official_map_url: mapUrl(mapId),
      source_url: "https://cleanup.seoul.go.kr/cleanup/bsnssttus/lscrMainIndx.do",
    });
  }
  return rows;
}

async function fetchPage(district, page) {
  const response = await fetch(buildUrl(district.code, page), {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${district.name} page ${page}`);
  const html = await response.text();
  return parseRows(html, district);
}

async function fetchDistrict(district) {
  const allRows = [];
  const seen = new Set();
  for (let page = 1; page <= 30; page += 1) {
    const rows = await fetchPage(district, page);
    const freshRows = rows.filter((row) => {
      const key = `${row.district_code}|${row.list_no}|${row.project_name}|${row.representative_lot}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    allRows.push(...freshRows);
    if (rows.length < 10 || freshRows.length === 0) break;
  }
  return allRows;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "focus_area",
    "district",
    "district_code",
    "list_no",
    "project_type",
    "project_name",
    "representative_lot",
    "current_stage",
    "public_doc_count",
    "disclosure_timeliness",
    "data_completeness",
    "cafe_id",
    "map_id",
    "official_project_url",
    "official_map_url",
    "source_url",
    "collected_at",
  ];
  const lines = [fields.join(",")];
  for (const row of rows) lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  return `${lines.join("\n")}\n`;
}

function compactTimestamp(value) {
  const text = String(value || new Date().toISOString());
  const digits = text.replace(/\D/g, "");
  return digits.length >= 14 ? digits.slice(0, 14) : new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function writeSnapshot(rows, label = "snapshot") {
  if (!rows.length) return "";
  const collectedAt = rows[0].collected_at || new Date().toISOString();
  const stamp = compactTimestamp(collectedAt);
  const jsonPath = path.join(SNAPSHOT_DIR, `cleanup-projects-gangnam-songpa-gwangjin-${stamp}.json`);
  const csvPath = path.join(SNAPSHOT_DIR, `cleanup-projects-gangnam-songpa-gwangjin-${stamp}.csv`);
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  if (await fileExists(jsonPath)) return jsonPath;
  await writeFile(jsonPath, JSON.stringify(rows, null, 2));
  await writeFile(csvPath, toCsv(rows));
  console.log(JSON.stringify({ archived: label, rows: rows.length, output: jsonPath }));
  return jsonPath;
}

async function archiveExistingCurrent() {
  try {
    const rows = JSON.parse(await readFile(OUT_JSON, "utf8"));
    if (Array.isArray(rows) && rows.length > 0) await writeSnapshot(rows, "previous_current");
  } catch {
    // No existing current file yet.
  }
}

async function main() {
  await archiveExistingCurrent();

  const collectedAt = new Date().toISOString();
  const rows = [];
  for (const district of DISTRICTS) {
    const districtRows = await fetchDistrict(district);
    rows.push(...districtRows.map((row) => ({ ...row, collected_at: collectedAt })));
  }

  rows.sort((a, b) => a.district.localeCompare(b.district, "ko") || Number(b.list_no) - Number(a.list_no));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(rows, null, 2));
  await writeFile(OUT_CSV, toCsv(rows));
  const snapshotPath = await writeSnapshot(rows, "latest_fetch");

  const counts = rows.reduce((acc, row) => {
    acc[row.district] = (acc[row.district] ?? 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ collectedAt, total: rows.length, counts, snapshotPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
