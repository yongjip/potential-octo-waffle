#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const UPDATED_AT = "2026-06-23 KST";
const TASK_ID = "r-one-statistics-01";
const OUT_FILE = "data/market/manual-import/files/r-one-statistics_서울-권역-자치구_2024-01_2026-06.csv";
const SOURCE_CACHE = "data/market/manual-import/files/_source-cache/r-one-statistics_official_api_rows.json";
const INTAKE_FILE = "data/market/manual-import/download-intake.json";
const API_BASE = "https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do";
const OFFICIAL_PAGE = "https://www.reb.or.kr/r-one/main.do";

const MONTHS = monthRange("202401", "202606");

const TARGETS = [
  {
    statblId: "A_2024_00045",
    statisticBase: "전국주택가격동향_아파트매매가격지수",
    regions: [
      ["서울", "500008"],
      ["서울 동북권", "520011"],
      ["서울 동남권", "520015"],
      ["서울 광진구", "530016"],
      ["서울 강남구", "530038"],
      ["서울 송파구", "530039"],
    ],
    itemIds: ["100001"],
  },
  {
    statblId: "A_2024_00050",
    statisticBase: "전국주택가격동향_아파트전세가격지수",
    regions: [
      ["서울", "500008"],
      ["서울 동북권", "520011"],
      ["서울 동남권", "520015"],
      ["서울 광진구", "530016"],
      ["서울 강남구", "530038"],
      ["서울 송파구", "530039"],
    ],
    itemIds: ["100001"],
  },
  {
    statblId: "A_2024_00176",
    statisticBase: "공동주택실거래가격지수_공동주택통합_매매지수",
    regions: [["서울", "500007"]],
    itemIds: ["100001"],
  },
  {
    statblId: "A_2024_00546",
    statisticBase: "부동산거래현황_행정구역별주택거래현황",
    regions: [
      ["서울", "500002"],
      ["서울 광진구", "510007"],
      ["서울 강남구", "510025"],
      ["서울 송파구", "510026"],
    ],
    itemIds: ["100001", "100002"],
  },
  {
    statblId: "A_2024_00903",
    statisticBase: "전국지가변동률조사_지역별지가변동률",
    regions: [
      ["서울", "500007"],
      ["서울 광진구", "510012"],
      ["서울 강남구", "510030"],
      ["서울 송파구", "510031"],
    ],
    itemIds: ["100001", "100002"],
  },
];

function monthRange(from, to) {
  const out = [];
  let y = Number(from.slice(0, 4));
  let m = Number(from.slice(4, 6));
  const end = Number(to);
  while (Number(`${y}${String(m).padStart(2, "0")}`) <= end) {
    out.push(`${y}${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      y += 1;
      m = 1;
    }
  }
  return out;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "region",
    "statistic_name",
    "reference_month",
    "metric_value",
    "unit",
    "change_rate",
    "statbl_id",
    "statbl_name",
    "dtacycle_cd",
    "cls_id",
    "cls_name",
    "cls_fullnm",
    "itm_id",
    "itm_name",
    "itm_fullnm",
    "wrttime_desc",
  ];
  return [
    fields.join(","),
    ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(",")),
  ].join("\n") + "\n";
}

function parseRows(payload) {
  const blocks = payload?.SttsApiTblData || [];
  return blocks.find((block) => Array.isArray(block.row))?.row || [];
}

async function fetchApiRows(target, region, month) {
  const params = new URLSearchParams({
    STATBL_ID: target.statblId,
    DTACYCLE_CD: "MM",
    WRTTIME_IDTFR_ID: month,
    CLS_ID: region[1],
    Type: "json",
    pSize: "1000",
  });
  const url = `${API_BASE}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Codex research bot",
      "Accept": "application/json,text/plain,*/*",
      "Referer": "https://www.reb.or.kr/r-one/portal/openapi/openApiDevPage.do",
    },
  });
  if (!response.ok) {
    throw new Error(`R-ONE request failed ${response.status}: ${url}`);
  }
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    throw new Error(`R-ONE returned non-JSON for ${url}: ${text.slice(0, 200)}`);
  }
  return parseRows(payload)
    .filter((row) => !target.itemIds || target.itemIds.includes(String(row.ITM_ID)))
    .map((row) => ({
      ...row,
      requested_region: region[0],
      requested_month: month,
      request_url: url,
    }));
}

function normalizeApiRow(row, target) {
  const itemName = String(row.ITM_NM || row.ITM_FULLNM || "").trim();
  const statisticName = itemName && itemName !== "지수"
    ? `${target.statisticBase}_${itemName}`
    : target.statisticBase;
  const unit = row.UI_NM || "";
  const value = row.DTA_VAL ?? "";
  return {
    region: row.requested_region || row.CLS_FULLNM || row.CLS_NM || "",
    statistic_name: statisticName,
    reference_month: row.WRTTIME_IDTFR_ID || row.requested_month || "",
    metric_value: value,
    unit,
    change_rate: /변동률/.test(statisticName) ? value : "",
    statbl_id: row.STATBL_ID || target.statblId,
    statbl_name: target.statisticBase,
    dtacycle_cd: row.DTACYCLE_CD || "MM",
    cls_id: row.CLS_ID || "",
    cls_name: row.CLS_NM || "",
    cls_fullnm: row.CLS_FULLNM || "",
    itm_id: row.ITM_ID || "",
    itm_name: row.ITM_NM || "",
    itm_fullnm: row.ITM_FULLNM || "",
    wrttime_desc: row.WRTTIME_DESC || "",
  };
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function updateIntake(rowCount, missingCount) {
  const intake = await readJson(INTAKE_FILE, { updated_at: UPDATED_AT, notes: [], rows: [] });
  let found = false;
  intake.rows = (intake.rows || []).map((row) => {
    if (row.task_id !== TASK_ID) return row;
    found = true;
    return {
      ...row,
      suggested_output_filename: path.basename(OUT_FILE),
      local_path: OUT_FILE,
      downloaded_at: new Date().toISOString(),
      source_page_or_url: OFFICIAL_PAGE,
      filter_applied: "Open API STATBL_ID=A_2024_00045,A_2024_00050,A_2024_00176,A_2024_00546,A_2024_00903; 지역=서울/동북권/동남권/광진구/강남구/송파구; 기준월=202401~202606",
      operator_note: `auto_downloaded_from_official_r_one_openapi; rows=${rowCount}; empty_requests=${missingCount}; generated_at=${UPDATED_AT}`,
      source: "r-one-statistics",
      source_kind: "R-ONE 가격지수·거래현황",
      district: "서울/권역/자치구",
      dong: "",
      coverage_from: "202401",
      coverage_to: "202606",
      project_names: "후보 30개 전체",
    };
  });
  if (!found) {
    intake.rows.push({
      task_id: TASK_ID,
      suggested_output_filename: path.basename(OUT_FILE),
      local_path: OUT_FILE,
      downloaded_at: new Date().toISOString(),
      source_page_or_url: OFFICIAL_PAGE,
      filter_applied: "Open API STATBL_ID=A_2024_00045,A_2024_00050,A_2024_00176,A_2024_00546,A_2024_00903; 지역=서울/동북권/동남권/광진구/강남구/송파구; 기준월=202401~202606",
      operator_note: `auto_downloaded_from_official_r_one_openapi; rows=${rowCount}; empty_requests=${missingCount}; generated_at=${UPDATED_AT}`,
      source: "r-one-statistics",
      source_kind: "R-ONE 가격지수·거래현황",
      district: "서울/권역/자치구",
      dong: "",
      coverage_from: "202401",
      coverage_to: "202606",
      project_names: "후보 30개 전체",
    });
  }
  intake.updated_at = UPDATED_AT;
  await writeFile(INTAKE_FILE, `${JSON.stringify(intake, null, 2)}\n`, "utf8");
}

async function main() {
  const rawRows = [];
  const missingRequests = [];
  for (const target of TARGETS) {
    for (const region of target.regions) {
      for (const month of MONTHS) {
        const rows = await fetchApiRows(target, region, month);
        if (rows.length === 0) {
          missingRequests.push({ statbl_id: target.statblId, region: region[0], cls_id: region[1], month });
          continue;
        }
        rawRows.push(...rows.map((row) => ({ ...row, target_statistic_base: target.statisticBase })));
      }
    }
  }

  const normalized = rawRows.map((row) => {
    const target = TARGETS.find((item) => item.statblId === row.STATBL_ID) || { statisticBase: row.target_statistic_base || "" };
    return normalizeApiRow(row, target);
  });

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await mkdir(path.dirname(SOURCE_CACHE), { recursive: true });
  await writeFile(OUT_FILE, toCsv(normalized), "utf8");
  await writeFile(SOURCE_CACHE, `${JSON.stringify({ generated_at: UPDATED_AT, raw_rows: rawRows, missing_requests: missingRequests }, null, 2)}\n`, "utf8");
  await updateIntake(normalized.length, missingRequests.length);

  const byStat = normalized.reduce((acc, row) => {
    acc[row.statbl_id] = (acc[row.statbl_id] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({
    output: OUT_FILE,
    rows: normalized.length,
    empty_requests: missingRequests.length,
    statbl_counts: byStat,
    source_cache: SOURCE_CACHE,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
