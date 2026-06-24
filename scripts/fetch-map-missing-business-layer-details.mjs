#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const CANDIDATES_INPUT = "analysis/priority-redevelopment-candidates.csv";
const OUT_DIR = "data/urban";
const OUT_JSON = "map-missing-business-layer-details.json";
const OUT_CSV = "map-missing-business-layer-details.csv";
const BASE = "https://urban.seoul.go.kr";
const ARCGIS_BASE = "http://98.33.2.225:6080/arcgis/rest/services/UPIS/20200526_WFS/MapServer";
const SMALL_MAINTENANCE_LAYER_ID = 12;

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
  const match = String(representativeLot || "").trim().match(/^(\S+)\s+(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  return { dong: match[1], main: match[2], sub: match[3] || "0" };
}

function pnuFor(lot, emdCode) {
  return `${emdCode}001${lot.main.padStart(4, "0")}${lot.sub.padStart(4, "0")}`;
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
    throw new Error(`Non-JSON ArcGIS response for ${target}: ${text.slice(0, 160)}`);
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

async function emdCodeMap(districtNames) {
  const sggRows = await postJson("api/map/sgg/getList.json", { sidoCd: "11" });
  const targetSgg = sggRows
    .filter((row) => districtNames.has(row.sggNm))
    .map((row) => ({ district: row.sggNm, sggCd: row.sggCd }));
  const rows = [];
  for (const { district, sggCd } of targetSgg) {
    const emdRows = await postJson("api/map/emd/getList.json", { sggCd });
    for (const emd of emdRows) rows.push({ district, dong: emd.emdNm, emdCode: emd.emdCd });
  }
  return new Map(rows.map((row) => [`${row.district}:${row.dong}`, row.emdCode]));
}

async function parcelGeometry(pnu) {
  const parcel = await proxyJson(`${ARCGIS_BASE}/1/query`, {
    f: "json",
    where: `PNU='${pnu}'`,
    outFields: "*",
    returnGeometry: "true",
    outSR: "5174",
  });
  return parcel.features?.[0] || null;
}

async function smallMaintenanceFeatures(geometry) {
  const response = await proxyJson(`${ARCGIS_BASE}/${SMALL_MAINTENANCE_LAYER_ID}/query`, {
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
  return response.features || [];
}

async function businessLayerDetails(presentSn) {
  const response = await postJson("api/map/pilji/getList.json", {
    recordCode: "",
    recordCodeH: "",
    presentSn: "",
    bsnsPresentSn: presentSn,
    restrictN: "",
    dgmNmYd: "",
  });
  return response.bsnsList?.[0] || null;
}

function normalize(value) {
  return String(value || "")
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

function scoreFeature(row, attrs) {
  const zone = normalize(attrs.DGM_NM);
  const tokens = projectTokens(row.project_name);
  let tokenHits = 0;
  for (const token of tokens) {
    if (zone.includes(token)) tokenHits += 1;
  }
  const officialArea = Number(String(row.district_area_sqm_official || "").replaceAll(",", ""));
  const featureArea = Number(attrs.DGM_AR || attrs["SHAPE.AREA"] || 0);
  const areaDiffPct = officialArea && featureArea ? Math.abs(featureArea - officialArea) / officialArea : 1;
  let score = tokenHits * 30;
  if (areaDiffPct <= 0.01) score += 25;
  else if (areaDiffPct <= 0.05) score += 15;
  if (attrs.SIGNGU_SE === "11215") score += 5;
  return { score, tokenHits, areaDiffPct: Math.round(areaDiffPct * 10000) / 100 };
}

function normalizeProjectType(value) {
  const text = String(value || "");
  if (/신속통합기획/.test(text)) return "planning";
  if (/가로주택/.test(text)) return "street_housing";
  if (/소규모재건축/.test(text)) return "small_reconstruction";
  if (/재개발/.test(text)) return "redevelopment";
  if (/재건축/.test(text)) return "reconstruction";
  return text.trim().toLowerCase();
}

function normalizeStageFamily(value) {
  const text = String(value || "");
  if (/정비계획 수립/.test(text)) return "planning";
  if (/정비구역지정|구역지정/.test(text)) return "district_designation";
  if (/추진위원회승인|추진위구성/.test(text)) return "promotion_committee";
  if (/조합설립인가/.test(text)) return "union_approval";
  if (/사업시행인가/.test(text)) return "project_approval";
  if (/관리처분인가/.test(text)) return "management_approval";
  if (/착공/.test(text)) return "construction";
  if (/분양/.test(text)) return "sale";
  if (/기획완료/.test(text)) return "planning_complete";
  return text.trim().toLowerCase();
}

function dateOnly(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function safeBusinessDetails(details) {
  const bldn = details?.tnBsnsBldnScl || {};
  const sply = details?.tnBsnsSplyScl || {};
  const cleanup = details?.tnBsnsInfoMapCleanup || {};
  const dataStandard = details?.tnBsnsDataStnd || {};
  return {
    urban_business_name: details?.bsnsName || "",
    urban_business_address: details?.bsnsAddr || "",
    urban_business_area_sqm: details?.bsnsArea || "",
    urban_business_type_group: details?.tnBsnsCodeG?.bsnsCdNm || "",
    urban_business_type: details?.tnBsnsCodeL?.bsnsCdNm || "",
    urban_propel_code: details?.propelCd || "",
    urban_propel_name: details?.tnPropelCode?.propelCdNm || "",
    urban_status_code: details?.statusCode || "",
    urban_data_reference_date: dateOnly(dataStandard.rfencDt),
    cleanup_site_name: cleanup.cleanupBsnsSiteNm || "",
    cleanup_site_url: normalizeUrl(cleanup.cleanupBsnsUrl),
    building_gross_floor_area_sqm: bldn.area || "",
    building_far_pct: bldn.flarRt || "",
    building_coverage_pct: bldn.bldglndRt || "",
    building_floor: bldn.floor || "",
    building_households: bldn.hshld || "",
    supply_households: sply.suplyHshld || "",
    rental_households: sply.rental || "",
    rental_ratio_pct: sply.rentalRt ?? "",
    propel_history: Array.isArray(details?.tnBsnsPropels)
      ? details.tnBsnsPropels
          .map((item) => `${dateOnly(item.propelDt)} ${item.tnPropelCode?.propelCdNm || item.propelCd || ""}`.trim())
          .filter(Boolean)
          .join("; ")
      : "",
  };
}

function detailAlignmentScore(row, detail) {
  if (!detail) return 0;
  const projectType = normalizeProjectType(row.project_type);
  const businessType = normalizeProjectType(detail.tnBsnsCodeL?.bsnsCdNm || detail.bsnsType || "");
  const currentStage = normalizeStageFamily(row.current_stage);
  const businessStage = normalizeStageFamily(detail.tnPropelCode?.propelCdNm || detail.propelName || "");
  let score = 0;
  if (projectType && businessType && projectType === businessType) score += 80;
  else if (projectType && businessType && businessType === "planning" && projectType !== "planning") score -= 70;
  else if (projectType && businessType && projectType !== businessType) score -= 25;

  if (currentStage && businessStage && currentStage === businessStage) score += 70;
  else if (currentStage && businessStage && businessStage === "planning_complete" && currentStage !== "planning") score -= 60;
  else if (currentStage && businessStage && currentStage !== businessStage) score -= 15;

  if (detail.tnBsnsInfoMapCleanup?.cleanupBsnsUrl) score += 25;
  if (detail.tnBsnsSplyScl?.suplyHshld) score += 10;
  return score;
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

async function buildRow(row, candidate, emdCodes) {
  const representativeLot = row.representative_lot || candidate?.representative_lot || "";
  const lot = parseLot(representativeLot);
  const emdCode = lot ? emdCodes.get(`${row.district}:${lot.dong}`) || "" : "";
  const base = {
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    dong: row.dong,
    project_name: row.project_name,
    current_stage: row.current_stage,
    representative_lot: representativeLot,
    official_area_sqm: row.district_area_sqm_official,
    pnu: lot && emdCode ? pnuFor(lot, emdCode) : "",
    match_status: "",
    match_confidence: "",
    present_sn: "",
    layer_name: "UPIS_C_UQ120",
    layer_zone_name: "",
    layer_area_sqm: "",
    layer_shape_area_sqm: "",
    layer_propel_code: "",
    layer_business_class: "",
    matched_token_count: "",
    area_diff_pct: "",
    review_note: "",
    next_action: "",
  };

  if (!base.pnu) {
    return { ...base, match_status: "pnu_parse_failed", next_action: "대표지번/PNU 수동 확인" };
  }

  const parcel = await parcelGeometry(base.pnu);
  if (!parcel) {
    return { ...base, match_status: "parcel_not_found", next_action: "대표지번/PNU 수동 확인" };
  }

  const features = await smallMaintenanceFeatures(parcel.geometry);
  const candidates = features
    .map((feature) => {
      const attrs = feature.attributes || {};
      const scored = scoreFeature(row, attrs);
      return { attrs, ...scored };
    })
    .sort((a, b) => b.score - a.score);

  const enrichedCandidates = [];
  for (const candidateRow of candidates) {
    const details = candidateRow.attrs.PRESENT_SN ? await businessLayerDetails(candidateRow.attrs.PRESENT_SN) : null;
    const alignmentScore = detailAlignmentScore(row, details);
    enrichedCandidates.push({ ...candidateRow, details, alignmentScore, totalScore: candidateRow.score + alignmentScore });
  }

  enrichedCandidates.sort((left, right) => right.totalScore - left.totalScore);
  const selected = enrichedCandidates[0];
  if (!selected) {
    return { ...base, match_status: "no_business_layer_candidate", next_action: "서울도시공간포털/정보몽땅 수동 검색" };
  }
  const details = selected.details;
  const areaOk = selected.areaDiffPct !== "" && Number(selected.areaDiffPct) <= 5;
  const tokenOk = Number(selected.tokenHits) >= 1;
  const confidence = tokenOk && areaOk ? "high" : tokenOk ? "medium" : "low";
  const status = details ? "business_layer_matched_no_notice_record" : "business_layer_candidate_only";

  return {
    ...base,
    match_status: status,
    match_confidence: confidence,
    present_sn: selected.attrs.PRESENT_SN || "",
    layer_zone_name: selected.attrs.DGM_NM || "",
    layer_area_sqm: selected.attrs.DGM_AR || "",
    layer_shape_area_sqm: selected.attrs["SHAPE.AREA"] || "",
    layer_propel_code: selected.attrs.PROPEL_CD || "",
    layer_business_class: [selected.attrs.LCLAS_CL, selected.attrs.SCLAS_CL].filter(Boolean).join("/"),
    matched_token_count: selected.tokenHits,
    area_diff_pct: selected.areaDiffPct,
    review_note:
      "서울도시공간포털 사업구역 레이어에서는 매칭됐지만 WTNNC_SN/NTFC_SN이 없어 결정고시 recordCode와 고시 원문은 별도 확인 필요",
    next_action: "정비사업 정보몽땅/서울도시공간포털에서 고시·인가 원문 수동 확인",
    ...safeBusinessDetails(details),
  };
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const candidateRows = parseCsv(await readFile(CANDIDATES_INPUT, "utf8"));
  const candidatesByRank = new Map(candidateRows.map((row) => [String(row.rank), row]));
  const targets = matrixRows.filter((row) => row.fact_check_priority === "map_match_first" || row.has_urban_map === "N");
  const emdCodes = await emdCodeMap(new Set(targets.map((row) => row.district).filter(Boolean)));
  const rows = [];
  for (const row of targets) rows.push(await buildRow(row, candidatesByRank.get(String(row.rank)), emdCodes));
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        matched: rows.filter((row) => row.match_status === "business_layer_matched_no_notice_record").length,
        highConfidence: rows.filter((row) => row.match_confidence === "high").length,
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
