#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-identifier-closure-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-identifier-closure-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-identifier-closure-workbook.json");

const INPUTS = {
  fallbackWorkbook: "analysis/representative-lot-fallback-workbook.json",
  representativeLotCandidates: "data/urban/representative-lot-map-candidates.csv",
};

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

const UPDATED_AT = `${kstDate()} KST`;
const HELPER_SCRIPT = "scripts/fetch-map-missing-business-layer-details.mjs";

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

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

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

function compact(values, limit = 5) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit);
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function groupBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(row);
    return acc;
  }, new Map());
}

function numeric(value, fallback = 9999) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function chooseParcelReference(rows) {
  return [...rows].sort((left, right) => numeric(left.recommendation_rank) - numeric(right.recommendation_rank))[0] || {};
}

function uq120Candidates(rows) {
  return rows
    .filter((row) => row.layer_name === "UPIS_C_UQ120")
    .sort((left, right) => {
      const rankDelta = numeric(left.recommendation_rank) - numeric(right.recommendation_rank);
      if (rankDelta !== 0) return rankDelta;
      return numeric(right.layer_score, -9999) - numeric(left.layer_score, -9999);
    });
}

function probeRelation(currentStage, primaryStage) {
  if (!primaryStage) return "candidate_stage_missing";
  if (currentStage === primaryStage) return "same_stage_candidate";
  return "stage_gap_candidate";
}

function closureGate(relation) {
  if (relation === "same_stage_candidate") {
    return "same-stage UQ120 응답에서 presentSn와 데이터 기준일이 같이 나오고 사업유형이 planning이 아니면 current business로 채택";
  }
  if (relation === "stage_gap_candidate") {
    return "presentSn가 보여도 direct notice보다 앞 단계면 현재 사업 식별자 후보로만 두고 공식 단계 업데이트 전까지 채택하지 않음";
  }
  return "presentSn, 데이터 기준일, 사업유형이 모두 확인되기 전까지 current business로 채택하지 않음";
}

function rejectGate(relation) {
  if (relation === "same_stage_candidate") {
    return "기획완료·신속통합기획·다른 특별계획구역 이름이면 제외";
  }
  if (relation === "stage_gap_candidate") {
    return "정비계획 수립처럼 direct notice보다 앞선 단계만 보이면 현재 사업 식별자로 확정하지 않음";
  }
  return "대표지번만 맞고 사업명/단계가 흐리면 제외";
}

function buildRows(fallbackRows, representativeLotCandidates) {
  const candidateByRank = groupBy(representativeLotCandidates, (row) => String(row.rank || ""));

  return fallbackRows.map((row) => {
    const rank = String(row.rank || "");
    const candidates = candidateByRank.get(rank) || [];
    const parcelRef = chooseParcelReference(candidates);
    const uq120 = uq120Candidates(candidates);
    const primary = uq120[0] || {};
    const alternateNames = compact(uq120.slice(1).map((candidate) => candidate.zone_name));
    const relation = probeRelation(row.current_stage, primary.current_stage || row.uq120_candidate_stage);
    const probeKey = compact([
      parcelRef.representative_lot,
      parcelRef.pnu,
      primary.zone_name || row.uq120_zone_name,
      row.urban_record_code,
    ]).join(" / ");
    const browserSequence = compact([
      `recordCode popup ${row.urban_record_code || "-"}`,
      `대표지번 ${parcelRef.representative_lot || "-"}`,
      `UQ120 ${primary.zone_name || row.uq120_zone_name || "-"}`,
    ]).join(" -> ");
    const sourcesToOpen = compact([
      row.project_note,
      row.urban_map_url,
      HELPER_SCRIPT,
      row.sources_to_open,
    ]).join("; ");

    return {
      watch_rank: row.watch_rank,
      rank,
      focus_area: row.focus_area,
      district: row.district,
      project_name: row.project_name,
      current_stage: row.current_stage,
      direct_notice_no: row.direct_notice_no,
      direct_notice_date: row.direct_notice_date,
      representative_lot: parcelRef.representative_lot || "",
      pnu: parcelRef.pnu || "",
      urban_record_code: row.urban_record_code,
      urban_notice_code: row.urban_notice_code,
      urban_map_url: row.urban_map_url,
      primary_uq120_zone_name: primary.zone_name || row.uq120_zone_name,
      primary_uq120_stage: primary.current_stage || row.uq120_candidate_stage,
      alternate_uq120_zone_names: alternateNames.join("; "),
      uq120_candidate_count: String(uq120.length),
      probe_relation: relation,
      closure_gate: closureGate(relation),
      reject_gate: rejectGate(relation),
      browser_probe_key: probeKey,
      browser_sequence: browserSequence,
      helper_script: HELPER_SCRIPT,
      next_update_files: compact([
        "analysis/project-comparison-matrix.md",
        row.project_note,
        "analysis/representative-lot-fallback-workbook.md",
      ]).join("; "),
      sources_to_open: sourcesToOpen,
    };
  }).sort((left, right) => numeric(left.watch_rank) - numeric(right.watch_rank) || numeric(left.rank) - numeric(right.rank));
}

function buildSummary(rows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    probe_relation_counts: countBy(rows, "probe_relation"),
    focus_area_counts: countBy(rows, "focus_area"),
    uq120_multi_candidate_count: rows.filter((row) => Number(row.uq120_candidate_count) >= 2).length,
    same_stage_candidate_count: rows.filter((row) => row.probe_relation === "same_stage_candidate").length,
    stage_gap_candidate_count: rows.filter((row) => row.probe_relation === "stage_gap_candidate").length,
  };
}

function markdown(rows, summary) {
  return `# Representative Lot Fallback Identifier Closure Workbook

작성 기준: ${UPDATED_AT}

이 문서는 \`representative_lot_fallback_only\` 6건에 대해 \`presentSn\`를 닫기 위한 수동/API 확인용 워크북이다. 직접 고시 기준 단계는 이미 잠겨 있으므로, 여기서는 \`대표지번 / PNU / UQ120 후보명 / 채택 조건\`만 분리해서 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| same-stage candidate | ${summary.same_stage_candidate_count} |
| stage-gap candidate | ${summary.stage_gap_candidate_count} |
| UQ120 복수 후보 | ${summary.uq120_multi_candidate_count} |
| probe relation 분포 | ${countText(summary.probe_relation_counts)} |
| 생활권 분포 | ${countText(summary.focus_area_counts)} |

## 판정 규칙

- \`presentSn\`는 \`same-stage UQ120\` 응답과 \`데이터 기준일\`이 같이 잡힐 때만 current business로 올린다.
- \`정비계획 수립\`처럼 direct notice보다 앞 단계만 보이면 후보로는 남기되 현재 사업 식별자로 확정하지 않는다.
- \`신속통합기획\`, \`기획완료\`, 다른 특별계획구역 이름이 섞이면 같은 필지라도 별도 레이어로 본다.

## 사업장별 식별자 클로저 큐

${mdTable(rows, [
    { key: "watch_rank", label: "감시순위" },
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "representative_lot", label: "대표지번" },
    { key: "pnu", label: "PNU" },
    { key: "current_stage", label: "직접 고시 단계" },
    { key: "primary_uq120_zone_name", label: "1순위 UQ120 후보" },
    { key: "primary_uq120_stage", label: "UQ120 후보 단계" },
    { key: "probe_relation", label: "관계" },
    { key: "urban_record_code", label: "recordCode" },
  ])}

## 수동/API 프로브 계획

${mdTable(rows, [
    { key: "rank", label: "후보" },
    { key: "browser_probe_key", label: "프로브 키" },
    { key: "browser_sequence", label: "브라우저 순서" },
    { key: "alternate_uq120_zone_names", label: "대체 후보명" },
    { key: "closure_gate", label: "채택 조건" },
    { key: "reject_gate", label: "제외 조건" },
  ])}

## 참고

- 로컬 helper: \`${HELPER_SCRIPT}\`
- 먼저 열 파일: \`analysis/representative-lot-fallback-workbook.md\`, \`project-notes/*.md\`, 직접 고시 \`urban_map_url\`
- 확인 후 갱신 대상: \`analysis/project-comparison-matrix.md\`, \`analysis/representative-lot-fallback-workbook.md\`, 각 \`project-note\`
`;
}

async function main() {
  const fallbackWorkbook = await readJson(INPUTS.fallbackWorkbook);
  const representativeLotCandidates = parseCsv(await readFile(INPUTS.representativeLotCandidates, "utf8"));
  const rows = buildRows(fallbackWorkbook.rows || [], representativeLotCandidates);
  const summary = buildSummary(rows);
  const json = {
    generated_at: UPDATED_AT,
    summary,
    rows,
    inputs: INPUTS,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown(rows, summary), "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_JSON, `${JSON.stringify(json, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
