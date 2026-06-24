#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  fallbackIdentifierWorkbook: "analysis/representative-lot-fallback-identifier-closure-workbook.json",
};

const OUT_DIR = "data/urban";
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-api-probe.json");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-api-probe.csv");

const BASE = "https://urban.seoul.go.kr";
const ARCGIS_BASE = "http://98.33.2.225:6080/arcgis/rest/services/UPIS/20200526_WFS/MapServer";
const SMALL_MAINTENANCE_LAYER_ID = 12;

function kstDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function normalize(value) {
  return String(value || "")
    .replace(/[①②③④⑤⑥⑦⑧⑨]/g, (char) => String("①②③④⑤⑥⑦⑧⑨".indexOf(char) + 1))
    .replace(/[^0-9A-Za-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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
  if (/기획완료|신속통합기획/.test(text)) return "planning_complete";
  return text.trim().toLowerCase();
}

function normalizeProjectType(value) {
  const text = String(value || "");
  if (/신속통합기획|기획완료/.test(text)) return "planning";
  if (/가로주택/.test(text)) return "street_housing";
  if (/소규모재건축/.test(text)) return "small_reconstruction";
  if (/재개발/.test(text)) return "redevelopment";
  if (/재건축/.test(text)) return "reconstruction";
  return text.trim().toLowerCase();
}

function dateOnly(value) {
  return value ? String(value).split("T")[0] : "";
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function compact(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function fileRowFields(row) {
  return {
    rank: row.rank || "",
    project_name: row.project_name || "",
    focus_area: row.focus_area || "",
    current_stage: row.current_stage || "",
    representative_lot: row.representative_lot || "",
    pnu: row.pnu || "",
    urban_record_code: row.urban_record_code || "",
    urban_notice_code: row.urban_notice_code || "",
    primary_uq120_zone_name: row.primary_uq120_zone_name || "",
    alternate_uq120_zone_names: row.alternate_uq120_zone_names || "",
    probe_relation: row.probe_relation || "",
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
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
  return JSON.parse(text);
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

function expectedNames(row) {
  return compact([row.primary_uq120_zone_name, ...String(row.alternate_uq120_zone_names || "").split(";").map((item) => item.trim())]);
}

function scoreName(expected, candidate) {
  const target = normalize(candidate);
  let score = 0;
  let label = "weak";
  for (const name of expected) {
    const normalized = normalize(name);
    if (!normalized) continue;
    if (target === normalized) {
      score = Math.max(score, 120);
      label = "exact";
    } else if (target.includes(normalized) || normalized.includes(target)) {
      score = Math.max(score, 80);
      if (label !== "exact") label = "contains";
    } else if (normalized.length >= 2 && target.includes(normalized.slice(0, Math.min(normalized.length, 4)))) {
      score = Math.max(score, 40);
      if (label === "weak") label = "partial";
    }
  }
  return { score, label };
}

function safeBusinessDetails(details) {
  const cleanup = details?.tnBsnsInfoMapCleanup || {};
  const dataStandard = details?.tnBsnsDataStnd || {};
  return {
    business_name: details?.bsnsName || "",
    business_address: details?.bsnsAddr || "",
    business_area_sqm: details?.bsnsArea || "",
    business_type_group: details?.tnBsnsCodeG?.bsnsCdNm || "",
    business_type: details?.tnBsnsCodeL?.bsnsCdNm || "",
    propel_name: details?.tnPropelCode?.propelCdNm || "",
    propel_code: details?.propelCd || "",
    data_reference_date: dateOnly(dataStandard.rfencDt),
    cleanup_site_name: cleanup.cleanupBsnsSiteNm || "",
    cleanup_site_url: normalizeUrl(cleanup.cleanupBsnsUrl),
  };
}

function candidateVerdict(row, candidate) {
  if (!candidate.candidate_present_sn) return "feature_without_present_sn";
  if (candidate.business_type_family === "planning") return "planning_hold";
  if (
    row.probe_relation === "stage_gap_candidate" &&
    candidate.stage_family === row.current_stage_family &&
    candidate.name_alignment_score >= 80 &&
    candidate.candidate_data_reference_date
  ) {
    return "needs_manual_confirmation";
  }
  if (candidate.stage_family === row.current_stage_family && candidate.name_alignment_score >= 80 && candidate.candidate_data_reference_date) {
    return "strong_same_stage_candidate";
  }
  if (row.probe_relation === "stage_gap_candidate" || (candidate.stage_family && candidate.stage_family !== row.current_stage_family)) {
    return "stage_gap_hold";
  }
  if (candidate.name_alignment_score >= 40) return "needs_manual_confirmation";
  return "weak_candidate";
}

function verdictRank(value) {
  return {
    strong_same_stage_candidate: 6,
    needs_manual_confirmation: 5,
    stage_gap_hold: 4,
    planning_hold: 3,
    feature_without_present_sn: 1,
    weak_candidate: 0,
  }[value] ?? -1;
}

function shouldPromoteRecoveredSameStage(base, candidates, top) {
  if (!top) return false;
  if (base.probe_relation !== "stage_gap_candidate") return false;
  if (top.verdict !== "needs_manual_confirmation") return false;
  if (top.stage_family !== base.current_stage_family) return false;
  if (top.name_alignment_score < 80) return false;
  if (!top.candidate_data_reference_date) return false;
  const competing = candidates.filter((candidate) => candidate !== top);
  if (!competing.length) return true;
  return competing.every(
    (candidate) =>
      candidate.verdict === "planning_hold" ||
      candidate.verdict === "weak_candidate" ||
      candidate.verdict === "feature_without_present_sn",
  );
}

async function buildProjectProbe(row) {
  const base = {
    ...fileRowFields(row),
    current_stage_family: normalizeStageFamily(row.current_stage),
    expected_names: expectedNames(row),
    candidate_count: 0,
    top_candidate_name: "",
    top_present_sn: "",
    top_propel_name: "",
    top_data_reference_date: "",
    top_business_type: "",
    top_cleanup_site_url: "",
    top_verdict: "",
    next_action: "",
    note: "",
  };

  if (!row.pnu) {
    return {
      projectRow: {
        ...base,
        top_verdict: "pnu_missing",
        next_action: "PNU 먼저 보강",
        note: "closure workbook에 PNU가 비어 있다.",
      },
      candidates: [],
    };
  }

  const parcel = await parcelGeometry(row.pnu);
  if (!parcel) {
    return {
      projectRow: {
        ...base,
        top_verdict: "parcel_not_found",
        next_action: "대표지번/PNU 직접 재확인",
        note: "ArcGIS 필지 조회에서 geometry를 찾지 못했다.",
      },
      candidates: [],
    };
  }

  const features = await smallMaintenanceFeatures(parcel.geometry);
  if (!features.length) {
    return {
      projectRow: {
        ...base,
        top_verdict: "feature_not_found",
        next_action: "recordCode popup 기준 수동 확인",
        note: "소규모정비 레이어에서 intersect feature를 찾지 못했다.",
      },
      candidates: [],
    };
  }

  const candidates = [];
  for (const feature of features) {
    const attrs = feature.attributes || {};
    const presentSn = String(attrs.PRESENT_SN || "").trim();
    const details = presentSn ? await businessLayerDetails(presentSn) : null;
    const nameBasis = attrs.DGM_NM || details?.bsnsName || "";
    const nameScore = scoreName(base.expected_names, nameBasis);
    const businessStage = details?.tnPropelCode?.propelCdNm || "";
    const stageFamily = normalizeStageFamily(businessStage || attrs.PROPEL_NM || "");
    const businessType = details?.tnBsnsCodeL?.bsnsCdNm || details?.bsnsType || "";
    const businessTypeFamily = normalizeProjectType(businessType);
    const alignmentScore =
      nameScore.score +
      (stageFamily && stageFamily === base.current_stage_family ? 70 : 0) +
      (details?.tnBsnsDataStnd?.rfencDt ? 15 : 0) +
      (details?.tnBsnsInfoMapCleanup?.cleanupBsnsUrl ? 15 : 0) +
      (businessTypeFamily === "planning" ? -60 : 0);
    const safe = safeBusinessDetails(details);
    const candidate = {
      rank: base.rank,
      project_name: base.project_name,
      representative_lot: base.representative_lot,
      probe_relation: base.probe_relation,
      candidate_name: attrs.DGM_NM || "",
      candidate_present_sn: presentSn,
      candidate_business_name: safe.business_name,
      candidate_business_address: safe.business_address,
      candidate_propel_name: safe.propel_name,
      candidate_data_reference_date: safe.data_reference_date,
      candidate_business_type: safe.business_type,
      candidate_cleanup_site_name: safe.cleanup_site_name,
      candidate_cleanup_site_url: safe.cleanup_site_url,
      name_alignment_label: nameScore.label,
      name_alignment_score: nameScore.score,
      stage_family: stageFamily,
      business_type_family: businessTypeFamily,
      total_score: alignmentScore,
    };
    candidate.verdict = candidateVerdict(base, candidate);
    candidates.push(candidate);
  }

  candidates.sort((left, right) => {
    const verdictDelta = verdictRank(right.verdict) - verdictRank(left.verdict);
    if (verdictDelta !== 0) return verdictDelta;
    return Number(right.total_score || 0) - Number(left.total_score || 0);
  });

  const top = candidates[0];
  if (shouldPromoteRecoveredSameStage(base, candidates, top)) {
    top.verdict = "strong_same_stage_candidate";
  }
  const nextAction =
    top?.verdict === "strong_same_stage_candidate"
      ? "API 값과 Edge 화면을 대조해 confirmed_current_business로 기록"
      : top?.verdict === "needs_manual_confirmation"
        ? "후보가 둘 이상 충돌하거나 static/API 판정이 엇갈리므로 Edge에서 current business를 확정"
      : top?.verdict === "stage_gap_hold"
        ? "현재 direct notice 단계와 stage gap 보류를 유지하고 Edge에서 보류 근거만 재확인"
        : top?.verdict === "planning_hold"
          ? "planning 레이어만 보이므로 current business 채택 금지"
          : "Edge에서 presentSn·기준일·사업유형을 직접 확인";
  const note =
    top?.verdict === "strong_same_stage_candidate"
      ? base.probe_relation === "stage_gap_candidate"
        ? "기존 static candidate는 stage-gap이었지만, live API에서 same-stage exact 후보가 planning 대안보다 우세해 current business 후보로 승격했다. manual confirm만 남았다."
        : "API 기준으로 same-stage 후보가 잡혔다. manual confirm만 남았다."
      : top?.verdict === "needs_manual_confirmation" && base.probe_relation === "stage_gap_candidate"
        ? "기존 static candidate는 stage-gap이었지만 live API에는 same-stage 후보도 보여 Edge 대조가 필요하다."
      : top?.verdict === "needs_manual_confirmation"
        ? "API 후보가 둘 이상이거나 current business 판정이 단순하지 않아 Edge 대조가 필요하다."
      : top?.verdict === "stage_gap_hold"
        ? "API 기준으로 후보가 있으나 direct notice보다 단계가 앞서 current business로 올릴 수 없다."
        : top?.verdict === "planning_hold"
          ? "planning 성격 후보라 채택 불가."
          : top?.verdict === "feature_without_present_sn"
            ? "교차 feature는 있으나 presentSn가 비어 있다."
            : "API만으로는 current business 확정이 부족하다.";

  return {
    projectRow: {
      ...base,
      candidate_count: candidates.length,
      top_candidate_name: top?.candidate_name || "",
      top_present_sn: top?.candidate_present_sn || "",
      top_propel_name: top?.candidate_propel_name || "",
      top_data_reference_date: top?.candidate_data_reference_date || "",
      top_business_type: top?.candidate_business_type || "",
      top_cleanup_site_url: top?.candidate_cleanup_site_url || "",
      top_verdict: top?.verdict || "weak_candidate",
      next_action: nextAction,
      note,
    },
    candidates,
  };
}

async function main() {
  const workbook = await readJson(INPUTS.fallbackIdentifierWorkbook);
  const rows = workbook.rows || [];
  const projectRows = [];
  const candidateRows = [];

  for (const row of rows) {
    const result = await buildProjectProbe(row);
    projectRows.push(result.projectRow);
    candidateRows.push(...result.candidates);
  }

  const output = {
    generated_at: `${kstDate()} KST`,
    inputs: Object.values(INPUTS),
    project_rows: projectRows,
    candidate_rows: candidateRows,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`);
  await writeFile(
    OUT_CSV,
    toCsv(
      projectRows.map((row) => ({
        rank: row.rank,
        project_name: row.project_name,
        current_stage: row.current_stage,
        top_verdict: row.top_verdict,
        top_candidate_name: row.top_candidate_name,
        top_present_sn: row.top_present_sn,
        top_propel_name: row.top_propel_name,
        top_data_reference_date: row.top_data_reference_date,
        top_business_type: row.top_business_type,
        top_cleanup_site_url: row.top_cleanup_site_url,
        next_action: row.next_action,
        note: row.note,
      })),
    ),
  );

  console.log(
    JSON.stringify(
      {
        generated_at: output.generated_at,
        project_count: projectRows.length,
        strong_same_stage_candidate_count: projectRows.filter((row) => row.top_verdict === "strong_same_stage_candidate").length,
        stage_gap_hold_count: projectRows.filter((row) => row.top_verdict === "stage_gap_hold").length,
        output_json: OUT_JSON,
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
