#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/priority-redevelopment-candidates.csv";
const REPRESENTATIVE_LOT_INPUT = "data/urban/representative-lot-map-candidates.json";
const OUT_DIR = "data/urban";
const OUT_JSON = "urban-map-details-priority-candidates.json";
const OUT_CSV = "urban-map-details-priority-candidates.csv";
const BASE = "https://urban.seoul.go.kr";

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

function extractInput(html, id) {
  const match = html.match(new RegExp(`<input[^>]+id=["']${id}["'][^>]*>`, "i"));
  if (!match) return "";
  const value = match[0].match(/value=["']([^"']*)["']/i)?.[1] ?? "";
  return decodeHtml(value);
}

function recordCodeFromUrl(url) {
  if (!url) return "";
  try {
    return new URL(url).searchParams.get("recordCode") ?? "";
  } catch {
    return "";
  }
}

function dateOnly(value) {
  return String(value ?? "").split("T")[0] || "";
}

function noticeText(item) {
  const ntfc = item?.tnNtfc ?? {};
  return ntfc.ntfcSj || ntfc.sj || ntfc.title || "";
}

function noticeUrl(item) {
  const ntfc = item?.tnNtfc ?? {};
  const noticeCode = item?.dNoticeCode || item?.pNoticeCode || ntfc.noticeCode || ntfc.ntfcCode || "";
  return noticeCode ? `${BASE}/view/html/PMNU2040000000?noticeCode=${encodeURIComponent(noticeCode)}` : "";
}

function flattenGroup(groupName, groupRows, base) {
  if (!Array.isArray(groupRows) || groupRows.length === 0) return [];
  return groupRows.map((item, index) => ({
    ...base,
    match_status: "matched",
    urban_group: groupName,
    urban_group_index: index + 1,
    urban_record_code: item.recordCode ?? "",
    urban_parent_record_code: item.recordCodeP ?? "",
    urban_project_code: item.projCode ?? "",
    urban_site_code: item.siteCode ?? "",
    urban_record_type: item.recordType ?? "",
    urban_record_type_name: item.tnCmnCd?.cmnName ?? "",
    urban_zone_name: item.zoneName ?? "",
    urban_location_name: item.locationName ?? "",
    urban_area_prev: item.areaPrev ?? "",
    urban_area_change: item.areaChange ?? "",
    urban_area_after: item.areaAfter ?? "",
    urban_first_date: dateOnly(item.firstDate),
    urban_first_date_info: item.firstDateInfo ?? "",
    urban_description: item.descript ?? "",
    urban_notice_code: item.dNoticeCode || item.pNoticeCode || "",
    urban_notice_title: noticeText(item),
    urban_notice_url: noticeUrl(item),
    urban_feature_exists: item.featureExistYn ?? "",
    urban_wtnnc_code: item.wtnnccode ?? "",
  }));
}

function flattenResponse(response, base) {
  const groups = [
    ["도시계획시설", response.ubplfcWtnnc],
    ["용도지역", response.spcfWtnnc],
    ["용도지구", response.spcfcWtnnc],
    ["용도구역", response.usgarWtnnc],
    ["지구단위계획", response.dstplanWtnnc],
    ["정비사업", response.fcmtrWtnnc],
    ["기타구역", response.etczoneWtnnc],
  ];
  return groups.flatMap(([groupName, groupRows]) => flattenGroup(groupName, groupRows, base));
}

async function fetchMapParams(row) {
  const response = await fetch(row.official_map_url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} map popup for ${row.rank} ${row.project_name}`);
  const html = await response.text();
  return {
    layerCode: extractInput(html, "layerCode"),
    recordCode: extractInput(html, "recordCode") || recordCodeFromUrl(row.official_map_url),
    search: extractInput(html, "search") || "C",
  };
}

async function fetchUrbanList(recordCode) {
  const body = new URLSearchParams({
    recordCode,
    recordCodeH: "",
    presentSn: "",
    bsnsPresentSn: "",
    restrictN: "",
    dgmNmYd: "",
  });
  const response = await fetch(`${BASE}/api/map/pilji/getList.json`, {
    method: "POST",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} getList for ${recordCode}`);
  return response.json();
}

async function representativeLotFallbacks() {
  try {
    const rows = JSON.parse(await readFile(REPRESENTATIVE_LOT_INPUT, "utf8"));
    const recommended = rows.filter(
      (row) =>
        Number(row.recommendation_rank) === 1 &&
        row.recommended_map_url &&
        ["high", "medium"].includes(row.confidence),
    );
    return new Map(recommended.map((row) => [String(row.rank), row]));
  } catch {
    return new Map();
  }
}

async function main() {
  const candidates = parseCsv(await readFile(INPUT, "utf8"));
  const fallbackByRank = await representativeLotFallbacks();
  const rows = [];

  for (const candidate of candidates) {
    const fallback = fallbackByRank.get(String(candidate.rank));
    const effectiveMapUrl = candidate.official_map_url || fallback?.recommended_map_url || "";
    const base = {
      rank: candidate.rank,
      focus_area: candidate.focus_area,
      district: candidate.district,
      project_name: candidate.project_name,
      cafe_id: candidate.cafe_id,
      representative_lot: candidate.representative_lot,
      current_stage: candidate.current_stage,
      official_map_url: effectiveMapUrl,
      official_map_url_source: candidate.official_map_url ? "cleanup_list" : fallback?.recommended_map_url ? "representative_lot" : "",
      representative_lot_map_confidence: fallback?.confidence || "",
      representative_lot_record_code: fallback?.record_code || "",
      representative_lot_zone_name: fallback?.zone_name || "",
    };

    if (!effectiveMapUrl) {
      rows.push({
        ...base,
        match_status: "missing_map_url",
        urban_group: "",
        urban_group_index: "",
        urban_record_code: "",
        urban_parent_record_code: "",
        urban_project_code: "",
        urban_site_code: "",
        urban_record_type: "",
        urban_record_type_name: "",
        urban_zone_name: "",
        urban_location_name: "",
        urban_area_prev: "",
        urban_area_change: "",
        urban_area_after: "",
        urban_first_date: "",
        urban_first_date_info: "",
        urban_description: "",
        urban_notice_code: "",
        urban_notice_title: "",
        urban_notice_url: "",
        urban_feature_exists: "",
        urban_wtnnc_code: "",
        urban_layer_code: "",
        urban_search_type: "",
      });
      continue;
    }

    const params = await fetchMapParams({ ...candidate, official_map_url: effectiveMapUrl });
    const response = await fetchUrbanList(params.recordCode);
    const matched = flattenResponse(response, {
      ...base,
      urban_layer_code: params.layerCode,
      urban_search_type: params.search,
    });
    if (matched.length === 0) {
      rows.push({
        ...base,
        match_status: "no_detail_rows",
        urban_layer_code: params.layerCode,
        urban_search_type: params.search,
      });
    } else {
      rows.push(...matched);
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), JSON.stringify(rows, null, 2));
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));

  const matchedProjects = new Set(rows.filter((row) => row.match_status === "matched").map((row) => row.rank)).size;
  const missingMapProjects = new Set(rows.filter((row) => row.match_status === "missing_map_url").map((row) => row.rank)).size;
  console.log(JSON.stringify({ rows: rows.length, matchedProjects, missingMapProjects }, null, 2));
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
    "representative_lot",
    "current_stage",
    "match_status",
    "urban_group",
    "urban_group_index",
    "urban_record_code",
    "urban_parent_record_code",
    "urban_project_code",
    "urban_site_code",
    "urban_record_type",
    "urban_record_type_name",
    "urban_zone_name",
    "urban_location_name",
    "urban_area_prev",
    "urban_area_change",
    "urban_area_after",
    "urban_first_date",
    "urban_first_date_info",
    "urban_description",
    "urban_notice_code",
    "urban_notice_title",
    "urban_notice_url",
    "urban_feature_exists",
    "urban_wtnnc_code",
    "urban_layer_code",
    "urban_search_type",
    "official_map_url",
    "official_map_url_source",
    "representative_lot_map_confidence",
    "representative_lot_record_code",
    "representative_lot_zone_name",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
