#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-deep-dive-queue.md");
const OUT_CSV = path.join(OUT_DIR, "focus-deep-dive-queue.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-deep-dive-queue.json");

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";
const NEXT_MOVES_INPUT = "analysis/research-next-moves.json";
const RISK_INPUT = "analysis/project-risk-signal-summary.json";
const MARKET_INPUT = "analysis/market-transaction-signal-summary.json";
const CATALYST_INPUT = "analysis/public-development-catalyst-map.json";
const AV_INPUT = "analysis/autonomous-mobility-scenario.json";

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function groupByRank(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const rank = String(row.rank || "");
    if (!rank) continue;
    const list = grouped.get(rank) || [];
    list.push(row);
    grouped.set(rank, list);
  }
  return grouped;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function numberValue(value) {
  if (value === "" || value == null) return 0;
  const cleaned = String(value).replaceAll(",", "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compact(items, limit = 3) {
  return [...new Set(items.filter(Boolean))].slice(0, limit).join("; ");
}

function depthTrack(row) {
  if (Number(row.source_blockers || 0) >= 4 || /원문 확정/.test(row.next_move_track || row.track || "")) return "원문확정 딥다이브";
  if (/비용|기반시설|분담금/.test(`${row.risk_hypothesis || ""} ${row.top_public_items || ""} ${row.downside_watch || ""}`)) return "비용·기반시설 딥다이브";
  if (/현장 동선|보행|한강|환승|단절/.test(`${row.next_move_track || row.track || ""} ${row.av_observation_focus || ""}`)) return "현장·교통 딥다이브";
  if (/정책|MICE|동서울|한강변관리|공공/.test(`${row.catalysts || ""} ${row.revisit_trigger || ""}`)) return "공공촉매 딥다이브";
  return "정기추적 딥다이브";
}

function priorityScore({ matrix, potential, nextMove, risk, market, catalysts, av }) {
  let score =
    Number(potential.long_term_potential_score || 0) * 18 +
    Number(nextMove.move_score || 0) * 0.14 +
    Number(risk.top_signal_score || 0) * 0.35 +
    Number(av.av_upside_score || 0) * 3 +
    Number(av.transit_durability_score || 0) * 2;
  score += Math.min(25, numberValue(market.trade_transactions) / 250);
  score += Math.min(20, numberValue(market.rent_transactions) / 500);
  score += catalysts.length ? 10 : 0;
  score -= Number(nextMove.source_blockers || 0) * 2.5;
  if (matrix.evidence_grade === "A" || potential.evidence_grade === "A") score += 8;
  if (risk.risk_signal_level === "very_high") score += 8;
  if (risk.risk_signal_level === "high") score += 4;
  return round(score);
}

function buildRows({ matrixRows, potentialByRank, nextByRank, riskByRank, marketByRank, catalystByRank, avByRank }) {
  const rows = matrixRows.map((matrix) => {
    const rank = String(matrix.rank);
    const potential = potentialByRank.get(rank) || {};
    const nextMove = nextByRank.get(rank) || {};
    const risk = riskByRank.get(rank) || {};
    const market = marketByRank.get(rank) || {};
    const catalysts = catalystByRank.get(rank) || [];
    const av = avByRank.get(rank) || {};
    const topCatalysts = catalysts.sort((a, b) => Number(b.catalyst_priority_score || 0) - Number(a.catalyst_priority_score || 0));
    const base = {
      rank,
      focus_area: matrix.focus_area,
      district: matrix.district,
      dong: matrix.dong,
      project_name: matrix.project_name,
      project_type: matrix.project_type,
      current_stage: matrix.current_stage,
      stage_bucket: matrix.stage_bucket,
      evidence_grade: potential.evidence_grade || risk.evidence_grade || "",
      source_blockers: nextMove.source_blockers || 0,
      long_term_potential_score: potential.long_term_potential_score || "",
      confidence_score: potential.confidence_score || "",
      risk_signal_level: risk.risk_signal_level || nextMove.risk_signal_level || "",
      risk_hypothesis: risk.key_risk_hypothesis || "",
      next_move_track: nextMove.track || "",
      recommended_move: nextMove.recommended_move || "",
      first_source_to_open: nextMove.first_source_to_open || "",
      catalysts: compact(topCatalysts.map((item) => item.catalyst_name), 3),
      catalyst_documents: compact(topCatalysts.map((item) => item.official_documents_to_check), 2),
      av_scenario: av.scenario_label || "",
      av_observation_focus: av.observation_focus || "",
      market_unique_transactions: market.unique_transactions || "",
      market_trade_transactions: market.trade_transactions || "",
      market_rent_transactions: market.rent_transactions || "",
      market_latest_deal_ymd: market.latest_deal_ymd || "",
      median_trade_amount_manwon: market.median_trade_amount_manwon || "",
      median_trade_price_per_sqm_manwon: market.median_trade_price_per_sqm_manwon || "",
      median_rent_deposit_manwon: market.median_rent_deposit_manwon || "",
      market_review_note: market.review_note || "",
      upside_watch: potential.upside_watch || nextMove.upside_watch || "",
      downside_watch: potential.downside_watch || nextMove.downside_watch || "",
      revisit_trigger: potential.revisit_trigger || nextMove.revisit_trigger || "",
      project_note: potential.project_note || nextMove.project_note || "",
    };
    const row = {
      ...base,
      deep_dive_priority_score: priorityScore({ matrix, potential, nextMove, risk, market, catalysts: topCatalysts, av }),
    };
    row.deep_dive_track = depthTrack(row);
    row.deep_dive_question = questionFor(row);
    return row;
  });
  return rows.sort((a, b) => Number(b.deep_dive_priority_score) - Number(a.deep_dive_priority_score));
}

function questionFor(row) {
  if (row.deep_dive_track === "원문확정 딥다이브") {
    return `핵심 수치/고시 원문 병목 ${row.source_blockers}건이 장기 가설의 확신도를 얼마나 낮추는가.`;
  }
  if (row.deep_dive_track === "비용·기반시설 딥다이브") {
    return "공공기여·기반시설·분담금 신호가 현재 단계와 장기 매력도를 얼마나 훼손하는가.";
  }
  if (row.deep_dive_track === "현장·교통 딥다이브") {
    return "역 접근, 한강/간선도로 단절, 환승/상권 혼잡이 입지 프리미엄을 실제로 뒷받침하는가.";
  }
  if (row.deep_dive_track === "공공촉매 딥다이브") {
    return "공공 개발 촉매가 보도자료 수준을 넘어 고시·계획·교통대책 원문으로 확인되는가.";
  }
  return "단계 변경, 공개자료 증가, 시장 신호 변화가 재평가를 요구하는가.";
}

function focusSummary(rows) {
  const groups = new Map();
  for (const row of rows) {
    const list = groups.get(row.focus_area) || [];
    list.push(row);
    groups.set(row.focus_area, list);
  }
  return [...groups.entries()]
    .map(([focus_area, items]) => {
      const top = items[0];
      const avg = (field) => round(items.reduce((sum, row) => sum + Number(row[field] || 0), 0) / items.length);
      const tracks = Object.entries(
        items.reduce((acc, row) => {
          acc[row.deep_dive_track] = (acc[row.deep_dive_track] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([track, count]) => `${track} ${count}`)
        .join("; ");
      return {
        focus_area,
        project_count: items.length,
        avg_deep_dive_priority_score: avg("deep_dive_priority_score"),
        avg_potential: avg("long_term_potential_score"),
        avg_confidence: avg("confidence_score"),
        top_project: `${top.rank}. ${top.project_name}`,
        top_track: top.deep_dive_track,
        top_question: top.deep_dive_question,
        track_mix: tracks,
      };
    })
    .sort((a, b) => Number(b.avg_deep_dive_priority_score) - Number(a.avg_deep_dive_priority_score));
}

function markdown(summary, rows, focusRows) {
  const topRows = rows.slice(0, 15);
  const fields = [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "current_stage", label: "단계" },
    { key: "deep_dive_track", label: "딥다이브" },
    { key: "deep_dive_priority_score", label: "점수" },
    { key: "long_term_potential_score", label: "잠재" },
    { key: "risk_signal_level", label: "리스크" },
    { key: "catalysts", label: "공공 촉매" },
    { key: "first_source_to_open", label: "먼저 열 자료" },
  ];
  return `# 생활권별 딥다이브 큐

작성 기준: ${kstDate()} KST

이 문서는 강남·잠실/송파·구의/광진 후보 30개를 실제 리서치 순서로 묶은 큐다. 진행단계, 장기 가능성, 리스크 신호, 시장 거래 신호, 공공 개발 촉매, 자율주행/교통 시나리오, 다음에 열 공식자료를 한 행에서 비교한다. 시장 신호는 법정동·키워드 기반 비교군이므로 개별 단지 확정값이 아니라 우선순위 참고값으로만 쓴다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 생활권 | ${summary.focus_area_count} |
| 평균 딥다이브 점수 | ${summary.avg_deep_dive_priority_score} |
| 원문확정 딥다이브 | ${summary.source_deep_dive_count} |
| 비용·기반시설 딥다이브 | ${summary.cost_deep_dive_count} |
| 현장·교통 딥다이브 | ${summary.fieldwork_deep_dive_count} |
| 시장 거래 연결 사업장 | ${summary.market_connected_count} |

## 생활권별 우선순위

${mdTable(focusRows, [
    { key: "focus_area", label: "생활권" },
    { key: "project_count", label: "사업장" },
    { key: "avg_deep_dive_priority_score", label: "평균점수" },
    { key: "avg_potential", label: "평균잠재" },
    { key: "avg_confidence", label: "평균확신" },
    { key: "top_project", label: "첫 사업" },
    { key: "top_track", label: "첫 트랙" },
    { key: "track_mix", label: "트랙 분포" },
  ])}

## 먼저 볼 15개

${mdTable(topRows, fields)}

## 딥다이브 질문

${mdTable(topRows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "deep_dive_question", label: "질문" },
    { key: "recommended_move", label: "이번 액션" },
    { key: "av_observation_focus", label: "현장/교통 확인" },
  ])}

## 시장 신호와 촉매

${mdTable(topRows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "market_unique_transactions", label: "거래표본" },
    { key: "median_trade_amount_manwon", label: "중위매매(만원)" },
    { key: "median_trade_price_per_sqm_manwon", label: "중위㎡당(만원)" },
    { key: "median_rent_deposit_manwon", label: "중위전세(만원)" },
    { key: "catalyst_documents", label: "촉매 확인 원문" },
  ])}

## 전체 큐

${mdTable(rows, fields)}
`;
}

async function main() {
  const [matrixRows, potentialRows, nextRows, riskRows, marketData, catalystData, avData] = await Promise.all([
    readJson(MATRIX_INPUT),
    readJson(POTENTIAL_INPUT),
    readJson(NEXT_MOVES_INPUT),
    readJson(RISK_INPUT),
    readJson(MARKET_INPUT),
    readJson(CATALYST_INPUT),
    readJson(AV_INPUT),
  ]);
  const rows = buildRows({
    matrixRows: rowsFrom(matrixRows),
    potentialByRank: byRank(rowsFrom(potentialRows)),
    nextByRank: byRank(rowsFrom(nextRows)),
    riskByRank: byRank(rowsFrom(riskRows)),
    marketByRank: byRank(rowsFrom(marketData, "projectRows")),
    catalystByRank: groupByRank(rowsFrom(catalystData)),
    avByRank: byRank(rowsFrom(avData)),
  });
  const focusRows = focusSummary(rows);
  const summary = {
    generated_at: `${kstDate()} KST`,
    project_count: rows.length,
    focus_area_count: focusRows.length,
    avg_deep_dive_priority_score: round(rows.reduce((sum, row) => sum + row.deep_dive_priority_score, 0) / rows.length),
    source_deep_dive_count: rows.filter((row) => row.deep_dive_track === "원문확정 딥다이브").length,
    cost_deep_dive_count: rows.filter((row) => row.deep_dive_track === "비용·기반시설 딥다이브").length,
    fieldwork_deep_dive_count: rows.filter((row) => row.deep_dive_track === "현장·교통 딥다이브").length,
    market_connected_count: rows.filter((row) => Number(row.market_unique_transactions || 0) > 0).length,
    inputs: [MATRIX_INPUT, POTENTIAL_INPUT, NEXT_MOVES_INPUT, RISK_INPUT, MARKET_INPUT, CATALYST_INPUT, AV_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, focus_rows: focusRows, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, focusRows));
  console.log(JSON.stringify({ rows: rows.length, avgScore: summary.avg_deep_dive_priority_score, output: "analysis/focus-deep-dive-queue.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
