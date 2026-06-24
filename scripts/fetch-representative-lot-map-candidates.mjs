#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/priority-redevelopment-candidates.csv";
const OUT_DIR = "data/urban";
const OUT_JSON = "representative-lot-map-candidates.json";
const OUT_CSV = "representative-lot-map-candidates.csv";
const BASE = "https://urban.seoul.go.kr";
const ARCGIS_BASE = "http://98.33.2.225:6080/arcgis/rest/services/UPIS/20200526_WFS/MapServer";
const TARGET_LAYERS = ["UPIS_C_UQ181", "UPIS_C_UQ161", "UPIS_C_UQ120"];
const COMMON_TOKENS = new Set([
  "아파트",
  "재건축",
  "재개발",
  "정비사업",
  "주택재건축",
  "주택재개발",
  "소규모재건축",
  "가로주택정비사업",
  "조합",
  "조합설립추진위원회",
  "추진위원회",
  "특별계획구역",
  "사업",
  "일대",
  "구역",
]);

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

function parseLot(representativeLot) {
  const text = String(representativeLot ?? "").trim();
  const match = text.match(/^(\S+)\s+(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  return {
    dong: match[1],
    main: match[2],
    sub: match[3] || "0",
  };
}

function pnuFor(lot, emdCode) {
  return `${emdCode}00${"1"}${lot.main.padStart(4, "0")}${lot.sub.padStart(4, "0")}`;
}

function proxyUrl(target, params) {
  return `${BASE}/proxy/proxy.jsp?${target}?${new URLSearchParams(params)}`;
}

async function proxyJson(target, params) {
  const response = await fetch(proxyUrl(target, params), {
    method: "POST",
    headers: { "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${target}`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON ArcGIS response for ${target}: ${text.slice(0, 120)}`);
  }
}

async function postJson(url, body) {
  const response = await fetch(`${BASE}/${url}`, {
    method: "POST",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: new URLSearchParams(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.json();
}

async function emdCodeMap() {
  const sggRows = await postJson("api/map/sgg/getList.json", { sidoCd: "11" });
  const targetSgg = new Map(sggRows.map((row) => [row.sggNm, row.sggCd]));
  const rows = [];
  for (const [district, sggCd] of targetSgg.entries()) {
    if (!["강남구", "송파구", "광진구"].includes(district)) continue;
    const emdRows = await postJson("api/map/emd/getList.json", { sggCd });
    for (const emd of emdRows) {
      rows.push({ district, sggCd, dong: emd.emdNm, emdCode: emd.emdCd });
    }
  }
  return new Map(rows.map((row) => [`${row.district}:${row.dong}`, row]));
}

async function layerMap() {
  const service = await proxyJson(ARCGIS_BASE, { f: "json" });
  return new Map(service.layers.map((layer) => [layer.name, layer]));
}

async function parcelGeometry(pnu) {
  const parcel = await proxyJson(`${ARCGIS_BASE}/1/query`, {
    f: "json",
    where: `PNU='${pnu}'`,
    outFields: "*",
    returnGeometry: "true",
    outSR: "5174",
  });
  return parcel.features?.[0] ?? null;
}

async function queryLayer(layer, geometry) {
  const response = await proxyJson(`${ARCGIS_BASE}/${layer.id}/query`, {
    f: "json",
    where: "1=1",
    outFields: "*",
    returnGeometry: "false",
    geometry: JSON.stringify(geometry),
    geometryType: "esriGeometryPolygon",
    inSR: "5174",
    spatialRel: "esriSpatialRelIntersects",
    outSR: "5174",
  });
  return response.features ?? [];
}

function normalize(value) {
  return String(value ?? "")
    .replace(/[①②③④⑤⑥⑦⑧⑨]/g, (char) => String("①②③④⑤⑥⑦⑧⑨".indexOf(char) + 1))
    .replace(/[^0-9A-Za-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function projectTokens(projectName) {
  return normalize(projectName)
    .split(" ")
    .flatMap((token) => token.split(/(?=아파트|재건축|정비|조합|구역)/))
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !COMMON_TOKENS.has(token));
}

function scoreCandidate(row, candidate) {
  let score = 0;
  const recordCode = candidate.record_code || "";
  const zone = normalize(candidate.zone_name);
  const project = normalize(row.project_name);
  const tokens = projectTokens(row.project_name);

  if (recordCode.includes("AGZ")) score += 80;
  else if (recordCode.includes("UTZ")) score += 60;
  else if (recordCode.includes("URZ")) score += 25;
  else if (recordCode) score += 10;

  if (candidate.layer_name === "UPIS_C_UQ181") score += 25;
  if (candidate.layer_name === "UPIS_C_UQ161") score += 12;

  let tokenHits = 0;
  for (const token of tokens) {
    if (zone.includes(token) || project.includes(zone)) tokenHits += 1;
  }
  candidate.matched_token_count = tokenHits;
  score += Math.min(tokenHits * 8, 32);

  const lot = parseLot(row.representative_lot);
  if (lot && zone.includes(lot.dong.replace("동", ""))) score += 5;
  candidate.generic_zone = /아파트지구|토지구획정리사업|재정비\s*촉진지구/.test(zone) ? "Y" : "";
  if (candidate.generic_zone && tokenHits === 0) score -= 90;
  if (/토지구획정리사업|환지/.test(zone) && tokenHits === 0) score -= 80;
  if (/토지거래|허가구역/.test(zone)) score -= 60;
  if (!recordCode) score -= 40;
  return score;
}

function confidence(candidate) {
  const score = Number(candidate.layer_score);
  const tokenHits = Number(candidate.matched_token_count || 0);
  if (candidate.generic_zone === "Y" && tokenHits === 0) return "none";
  if (candidate.record_code && score >= 95 && tokenHits >= 1 && candidate.generic_zone !== "Y") return "high";
  if (candidate.record_code && score >= 70 && tokenHits >= 1) return "medium";
  if (score >= 40) return "low";
  return "none";
}

async function main() {
  const rows = parseCsv(await readFile(INPUT, "utf8"));
  const missing = rows.filter((row) => !row.official_map_url);
  const emds = await emdCodeMap();
  const layers = await layerMap();
  const output = [];

  for (const row of missing) {
    const lot = parseLot(row.representative_lot);
    const emd = lot ? emds.get(`${row.district}:${lot.dong}`) : null;
    const base = {
      rank: row.rank,
      focus_area: row.focus_area,
      district: row.district,
      dong: row.dong,
      project_name: row.project_name,
      cafe_id: row.cafe_id,
      representative_lot: row.representative_lot,
      current_stage: row.current_stage,
      pnu: "",
      parcel_jibun: "",
      parcel_area_sqm: "",
      candidate_status: "",
      layer_name: "",
      record_code: "",
      notice_code: "",
      zone_name: "",
      matched_token_count: "",
      generic_zone: "",
      layer_score: "",
      recommendation_rank: "",
      confidence: "",
      recommended_map_url: "",
    };

    if (!lot || !emd) {
      output.push({ ...base, candidate_status: "pnu_parse_failed" });
      continue;
    }

    const pnu = pnuFor(lot, emd.emdCode);
    const parcel = await parcelGeometry(pnu);
    if (!parcel) {
      output.push({ ...base, pnu, candidate_status: "parcel_not_found" });
      continue;
    }

    const candidates = [];
    for (const layerName of TARGET_LAYERS) {
      const layer = layers.get(layerName);
      if (!layer) continue;
      const features = await queryLayer(layer, parcel.geometry);
      for (const feature of features) {
        const attrs = feature.attributes ?? {};
        const candidate = {
          ...base,
          pnu,
          parcel_jibun: parcel.attributes?.JIBUN ?? "",
          parcel_area_sqm: parcel.attributes?.["SHAPE.AREA"] ?? "",
          candidate_status: "candidate",
          layer_name: layerName,
          record_code: attrs.WTNNC_SN || "",
          notice_code: attrs.NTFC_SN || "",
          zone_name: attrs.DGM_NM || "",
          matched_token_count: "",
          generic_zone: "",
        };
        candidate.layer_score = scoreCandidate(row, candidate);
        candidates.push(candidate);
      }
    }

    candidates.sort((a, b) => Number(b.layer_score) - Number(a.layer_score));
    if (candidates.length === 0) {
      output.push({ ...base, pnu, parcel_jibun: parcel.attributes?.JIBUN ?? "", candidate_status: "no_layer_candidate" });
      continue;
    }

    for (const [index, candidate] of candidates.entries()) {
      const candidateConfidence = index === 0 && candidate.record_code ? confidence(candidate) : "";
      const isRecommended = index === 0 && candidate.record_code && candidateConfidence !== "none";
      output.push({
        ...candidate,
        recommendation_rank: index + 1,
        confidence: candidateConfidence,
        recommended_map_url: isRecommended
          ? `${BASE}/view/map/mapPopup.html?recordCode=${encodeURIComponent(candidate.record_code)}`
          : "",
      });
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), JSON.stringify(output, null, 2));
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(output));

  const recommended = output.filter((row) => row.recommendation_rank === 1 && row.recommended_map_url);
  console.log(
    JSON.stringify(
      {
        missingInputRows: missing.length,
        candidateRows: output.length,
        recommended: recommended.length,
        highConfidence: recommended.filter((row) => row.confidence === "high").length,
        mediumConfidence: recommended.filter((row) => row.confidence === "medium").length,
        lowConfidence: recommended.filter((row) => row.confidence === "low").length,
      },
      null,
      2,
    ),
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) {
    lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
