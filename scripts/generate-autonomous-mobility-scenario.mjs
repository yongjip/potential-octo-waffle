#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "autonomous-mobility-scenario.md");
const OUT_CSV = path.join(OUT_DIR, "autonomous-mobility-scenario.csv");
const OUT_JSON = path.join(OUT_DIR, "autonomous-mobility-scenario.json");

const TRANSPORT_INPUT = "analysis/transport-location-context.json";
const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";
const FIELDWORK_INPUT = "analysis/fieldwork-route-planner.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";

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

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function splitList(text) {
  return String(text || "")
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function scorePatterns(text, patterns) {
  return patterns.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0);
}

function lineCount(row) {
  return Number(row.line_or_mode_count || splitList(row.primary_lines).length || 0);
}

function stationDependency(row) {
  const text = `${row.mobility_axis || ""} ${row.primary_lines || ""} ${row.estimated_station_area || ""}`;
  let score = Math.min(5, lineCount(row) * 1.5);
  score += scorePatterns(text, [/환승/, /잠실역/, /강변역/, /건대입구/, /압구정/, /대치/, /석촌/, /종합운동장/]) * 0.8;
  score += scorePatterns(text, [/2호선/, /3호선/, /7호선/, /8호선/, /9호선/, /수인분당선/]) * 0.25;
  return clamp(round(score));
}

function roadAccessSensitivity(row) {
  const text = `${row.mobility_axis || ""} ${row.mobility_risks || ""} ${row.autonomous_vehicle_sensitivity || ""} ${row.fieldwork_checks || ""}`;
  let score = 2;
  score += scorePatterns(text, [/간선도로/, /강변북로/, /올림픽대로/, /큰 도로/, /도로 접근/, /양재대로/, /송파대로/]) * 1.4;
  score += scorePatterns(text, [/동서울터미널/, /광역교통/, /터미널/, /강변역/]) * 1.3;
  score += scorePatterns(text, [/외곽 접근성/, /업무지구 배후/, /강남 남부/]) * 0.8;
  score -= scorePatterns(text, [/자율주행 효과는 제한적/, /차량 접근성 개선보다/]) * 1.5;
  return clamp(round(score));
}

function hubPremiumResilience(row) {
  const text = `${row.mobility_axis || ""} ${row.urban_change_drivers || ""} ${row.long_term_thesis || ""}`;
  let score = stationDependency(row) * 0.45;
  score += scorePatterns(text, [/MICE/, /국제교류복합지구/, /종합운동장/, /업무지구/, /상급 주거지/, /건대입구 상권/, /동서울터미널/]) * 1.1;
  score += scorePatterns(text, [/한강변/, /학군/, /대치/]) * 0.7;
  return clamp(round(score));
}

function pedestrianBarrierRisk(row) {
  const text = `${row.mobility_risks || ""} ${row.fieldwork_checks || ""}`;
  let score = 1;
  score += scorePatterns(text, [/단절/, /횡단/, /대형도로/, /한강\/탄천/, /올림픽대로/, /강변북로/, /도로폭/, /경사/]) * 1.3;
  score += scorePatterns(text, [/혼잡/, /행사/, /상권/, /터미널/]) * 0.8;
  return clamp(round(score));
}

function avUpsideScore(row) {
  const road = roadAccessSensitivity(row);
  const hub = hubPremiumResilience(row);
  const barrier = pedestrianBarrierRisk(row);
  const transit = stationDependency(row);
  return clamp(round(road * 0.45 + hub * 0.25 + barrier * 0.2 - transit * 0.1 + 2));
}

function transitDurabilityScore(row) {
  const transit = stationDependency(row);
  const hub = hubPremiumResilience(row);
  const road = roadAccessSensitivity(row);
  return clamp(round(transit * 0.55 + hub * 0.35 - road * 0.08 + 1.2));
}

function scenarioLabel(row, scores) {
  if (scores.transit_durability_score >= 7 && scores.hub_premium_resilience >= 6) return "역세권 프리미엄 유지형";
  if (scores.av_upside_score >= 6.5 && scores.road_access_sensitivity >= 6.5) return "도로접근 보완 수혜형";
  if (scores.pedestrian_barrier_risk >= 6) return "보행단절 검증형";
  if (/동서울터미널|MICE|국제교류복합지구|한강변관리/.test(row.urban_change_drivers || "")) return "공공계획 민감형";
  return "기본 추적형";
}

function scenarioThesis(row, scores, potential) {
  const label = scenarioLabel(row, scores);
  if (label === "역세권 프리미엄 유지형") {
    return "자율주행이 보편화되어도 대형 환승역, 업무·상업 거점, 생활권 중심성은 쉽게 대체되지 않는다.";
  }
  if (label === "도로접근 보완 수혜형") {
    return "차량 호출·자율주행 접근성이 좋아질 경우 역세권 약점보다 간선도로·터미널·광역 접근성이 더 부각될 수 있다.";
  }
  if (label === "보행단절 검증형") {
    return "차량 접근성 개선만으로는 한강·간선도로·하천 단절이 해소되지 않으므로 실제 보행 동선을 따로 확인해야 한다.";
  }
  if (label === "공공계획 민감형") {
    return "자율주행 자체보다 MICE, 동서울터미널, 한강변관리, 경관·공공기여 같은 공식 계획 구체화가 더 큰 재평가 트리거다.";
  }
  if (Number(potential.long_term_potential_score || 0) >= 7) {
    return "장기 가능성은 있으나 자율주행 시나리오보다 단계 변경과 공식 원문 업데이트가 먼저다.";
  }
  return "현재는 자율주행 시나리오보다 사업단계, 공식 원문, 현장 생활권 기본체력 확인이 우선이다.";
}

function observationFocus(row, scores) {
  const checks = splitList(row.fieldwork_checks);
  const items = [];
  if (scores.pedestrian_barrier_risk >= 6) items.push("역 출구에서 단지 경계까지 끊기는 지점");
  if (scores.road_access_sensitivity >= 6) items.push("간선도로·터미널·주요 교차로 접속 방식");
  if (scores.transit_durability_score >= 7) items.push("환승역까지 실제 보행/버스 시간");
  if (/한강/.test(`${row.urban_change_drivers} ${row.mobility_risks}`)) items.push("한강 접근부의 도로/제방 단절");
  return [...new Set([...items, ...checks])].slice(0, 5).join("; ");
}

function buildRows({ transportRows, potentialByRank, fieldworkByRank, matrixByRank }) {
  return transportRows.map((row) => {
    const rank = String(row.rank);
    const potential = potentialByRank.get(rank) || {};
    const fieldwork = fieldworkByRank.get(rank) || {};
    const matrix = matrixByRank.get(rank) || {};
    const scores = {
      station_dependency_score: stationDependency(row),
      road_access_sensitivity: roadAccessSensitivity(row),
      hub_premium_resilience: hubPremiumResilience(row),
      pedestrian_barrier_risk: pedestrianBarrierRisk(row),
      av_upside_score: avUpsideScore(row),
      transit_durability_score: transitDurabilityScore(row),
    };
    return {
      rank,
      focus_area: row.focus_area,
      district: row.district,
      dong: row.dong,
      project_name: row.project_name,
      current_stage: row.current_stage,
      estimated_station_area: row.estimated_station_area,
      mobility_axis: row.mobility_axis,
      primary_lines: row.primary_lines,
      scenario_label: scenarioLabel(row, scores),
      ...scores,
      long_term_potential_score: potential.long_term_potential_score || "",
      confidence_score: potential.confidence_score || "",
      source_blockers: matrix.source_blockers || fieldwork.source_blockers || 0,
      scenario_thesis: scenarioThesis(row, scores, potential),
      observation_focus: observationFocus(row, scores),
      official_sources_to_check: row.official_sources_to_check,
      revisit_trigger: potential.revisit_trigger || "",
      project_note: potential.project_note || row.project_note || "",
    };
  });
}

function focusSummary(rows) {
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row.focus_area) || [];
    group.push(row);
    groups.set(row.focus_area, group);
  }
  return [...groups.entries()]
    .map(([focus_area, items]) => {
      const avg = (field) => round(items.reduce((sum, item) => sum + Number(item[field] || 0), 0) / items.length);
      const topAv = [...items].sort((a, b) => b.av_upside_score - a.av_upside_score)[0];
      const topTransit = [...items].sort((a, b) => b.transit_durability_score - a.transit_durability_score)[0];
      const labels = items.reduce((acc, item) => {
        acc[item.scenario_label] = (acc[item.scenario_label] || 0) + 1;
        return acc;
      }, {});
      return {
        focus_area,
        project_count: items.length,
        avg_av_upside_score: avg("av_upside_score"),
        avg_transit_durability_score: avg("transit_durability_score"),
        avg_pedestrian_barrier_risk: avg("pedestrian_barrier_risk"),
        top_av_upside_project: `${topAv.rank}. ${topAv.project_name}`,
        top_transit_durability_project: `${topTransit.rank}. ${topTransit.project_name}`,
        scenario_mix: Object.entries(labels)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => `${label} ${count}`)
          .join("; "),
      };
    })
    .sort((a, b) => b.avg_av_upside_score - a.avg_av_upside_score);
}

function markdown(summary, rows, focusRows) {
  const topAv = [...rows].sort((a, b) => b.av_upside_score - a.av_upside_score).slice(0, 12);
  const topTransit = [...rows].sort((a, b) => b.transit_durability_score - a.transit_durability_score).slice(0, 12);
  const barriers = [...rows].sort((a, b) => b.pedestrian_barrier_risk - a.pedestrian_barrier_risk).slice(0, 10);

  const commonFields = [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "scenario_label", label: "시나리오" },
    { key: "av_upside_score", label: "AV수혜" },
    { key: "transit_durability_score", label: "역세권지속" },
    { key: "pedestrian_barrier_risk", label: "보행단절" },
    { key: "observation_focus", label: "현장 확인" },
  ];

  return `# 자율주행 보편화 시나리오 점검표

작성 기준: ${UPDATED_AT}

이 문서는 강남·잠실·구의/광진 후보 30개를 대상으로 자율주행 보편화가 교통입지 해석을 어떻게 바꿀 수 있는지 점검한다. 예측값이 아니라 기존 공식 원천 기반 교통 컨텍스트와 현장조사 항목을 재분류한 가설표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 평균 AV 수혜 점수 | ${summary.avg_av_upside_score} |
| 평균 역세권 지속 점수 | ${summary.avg_transit_durability_score} |
| 보행단절 고위험 | ${summary.high_barrier_count} |
| 도로접근 보완 수혜형 | ${summary.road_upside_count} |
| 역세권 프리미엄 유지형 | ${summary.transit_durable_count} |

## 해석 원칙

1. 자율주행은 역세권을 지우는 변수가 아니라 도로 접근성과 환승 부담을 일부 낮추는 변수로 둔다.
2. 잠실역, 압구정, 대치, 건대입구처럼 생활권 중심성이 강한 곳은 역세권 프리미엄이 오래 남는 쪽으로 본다.
3. 강변·동서울터미널·간선도로 접근성이 강한 곳은 차량 접근성 개선 시나리오를 따로 본다.
4. 한강, 탄천, 올림픽대로, 강변북로, 대형도로 단절은 자율주행으로 자동 해결되지 않으므로 현장 확인 항목으로 남긴다.

## 생활권 비교

${mdTable(focusRows, [
    { key: "focus_area", label: "생활권" },
    { key: "project_count", label: "후보" },
    { key: "avg_av_upside_score", label: "평균 AV수혜" },
    { key: "avg_transit_durability_score", label: "평균 역세권지속" },
    { key: "avg_pedestrian_barrier_risk", label: "평균 단절위험" },
    { key: "top_av_upside_project", label: "AV수혜 대표" },
    { key: "top_transit_durability_project", label: "역세권 대표" },
    { key: "scenario_mix", label: "유형 분포" },
  ])}

## AV 수혜 민감도 상위

${mdTable(topAv, commonFields)}

## 역세권 프리미엄 지속 상위

${mdTable(topTransit, commonFields)}

## 보행단절 현장 확인 상위

${mdTable(barriers, commonFields)}

## 전체 목록

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "current_stage", label: "단계" },
    { key: "mobility_axis", label: "교통축" },
    { key: "scenario_label", label: "시나리오" },
    { key: "road_access_sensitivity", label: "도로민감" },
    { key: "hub_premium_resilience", label: "거점지속" },
    { key: "scenario_thesis", label: "가설" },
    { key: "project_note", label: "메모" },
  ])}
`;
}

async function main() {
  const [transportRows, potentialRows, fieldworkRows, matrixRows] = await Promise.all([
    readJson(TRANSPORT_INPUT),
    readJson(POTENTIAL_INPUT),
    readJson(FIELDWORK_INPUT),
    readJson(MATRIX_INPUT),
  ]);
  const rows = buildRows({
    transportRows,
    potentialByRank: byRank(potentialRows),
    fieldworkByRank: byRank(fieldworkRows),
    matrixByRank: byRank(matrixRows),
  });
  const focusRows = focusSummary(rows);
  const summary = {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    avg_av_upside_score: round(rows.reduce((sum, row) => sum + row.av_upside_score, 0) / rows.length),
    avg_transit_durability_score: round(rows.reduce((sum, row) => sum + row.transit_durability_score, 0) / rows.length),
    high_barrier_count: rows.filter((row) => row.pedestrian_barrier_risk >= 6).length,
    road_upside_count: rows.filter((row) => row.scenario_label === "도로접근 보완 수혜형").length,
    transit_durable_count: rows.filter((row) => row.scenario_label === "역세권 프리미엄 유지형").length,
    inputs: [TRANSPORT_INPUT, POTENTIAL_INPUT, FIELDWORK_INPUT, MATRIX_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, focus_rows: focusRows, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, focusRows));
  console.log(JSON.stringify({ rows: rows.length, highBarrier: summary.high_barrier_count, output: "analysis/autonomous-mobility-scenario.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
