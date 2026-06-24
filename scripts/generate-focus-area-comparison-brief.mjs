#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-area-comparison-brief.md");
const OUT_CSV = path.join(OUT_DIR, "focus-area-comparison-brief.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-area-comparison-brief.json");

const INPUTS = {
  strategicBrief: "analysis/strategic-research-brief.json",
  focusStrategy: "analysis/focus-area-strategy.json",
  potential: "analysis/long-term-potential-scorecard.json",
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
  fieldworkRoutes: "analysis/fieldwork-route-planner.json",
  marketSignals: "analysis/market-transaction-signal-summary.json",
  sourceFreshness: "analysis/official-source-freshness-ledger.json",
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

function byFocus(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const key = row.focus_area || "미분류";
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }
  return grouped;
}

function firstByFocus(rows) {
  return new Map(rows.map((row) => [row.focus_area, row]));
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function numberValue(value) {
  if (value === "" || value == null) return 0;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function compact(items, limit = 3) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function average(rows, field) {
  if (!rows.length) return 0;
  return round(rows.reduce((sum, row) => sum + Number(row[field] || 0), 0) / rows.length);
}

function maxRow(rows, field) {
  return [...rows].sort((a, b) => Number(b[field] || 0) - Number(a[field] || 0))[0] || {};
}

function countWhere(rows, predicate) {
  return rows.filter(predicate).length;
}

function formatProject(row) {
  if (!row?.project_name) return "";
  return `${row.rank}. ${row.project_name}`;
}

function stanceFor(row) {
  if (row.focus_area === "강남") return "상급지 방어력은 강하지만 공공기여·높이·분담금 조건을 확인하기 전에는 상방보다 리스크 검증이 우선이다.";
  if (row.focus_area === "잠실/송파") return "공공개발 촉매와 대단지 재건축의 결합은 강하지만, 이주·관리처분·혼잡 리스크를 사업별로 분리해야 한다.";
  if (row.focus_area === "구의/광진") return "가격·변화 여지는 있지만 공식 원문과 recordCode 병목이 크므로, 투자 가설보다 기초 원문 확정이 먼저다.";
  return "공식 원문과 현장 관찰이 같은 방향인지 확인한다.";
}

function bestUseCaseFor(row) {
  if (row.focus_area === "강남") return "이미 강한 입지에서 비용·규제·공공기여가 장기 가치를 훼손하는지 점검";
  if (row.focus_area === "잠실/송파") return "잠실 MICE·한강축·대단지 재건축 일정이 실제 단계와 맞물리는지 추적";
  if (row.focus_area === "구의/광진") return "동서울터미널·2/7호선·한강축 변화 가능성을 원문 확정 후 저평가 후보로 검토";
  return "";
}

function buildRows({ strategicRows, strategyRows, potentialRows, hypothesisRows, fieldworkRows, marketRows, sourceFreshness }) {
  const strategyByFocus = firstByFocus(strategyRows);
  const strategicByFocus = firstByFocus(strategicRows);
  const potentialByFocus = byFocus(potentialRows);
  const hypothesisByFocus = byFocus(hypothesisRows);
  const fieldworkByFocus = byFocus(fieldworkRows);
  const marketByFocus = firstByFocus(marketRows);
  const freshnessSummary = sourceFreshness.summary || {};

  const focusAreas = [...new Set([...strategicRows.map((row) => row.focus_area), ...strategyRows.map((row) => row.focus_area)])];
  return focusAreas
    .map((focus_area) => {
      const strategic = strategicByFocus.get(focus_area) || {};
      const strategy = strategyByFocus.get(focus_area) || {};
      const potentials = potentialByFocus.get(focus_area) || [];
      const hypotheses = hypothesisByFocus.get(focus_area) || [];
      const fieldwork = fieldworkByFocus.get(focus_area) || [];
      const market = marketByFocus.get(focus_area) || {};
      const topPotential = maxRow(potentials, "long_term_potential_score");
      const topFieldwork = maxRow(fieldwork, "fieldwork_priority");
      const sourceBlocked = countWhere(hypotheses, (row) => row.hypothesis_status === "source_blocked_hypothesis");
      const activeWatch = countWhere(hypotheses, (row) => row.hypothesis_status === "active_watch_hypothesis");
      const avgPotential = strategic.avg_potential || average(potentials, "long_term_potential_score");
      const avgConfidence = strategic.avg_confidence || average(potentials, "confidence_score");
      const comparisonScore = round(Number(avgPotential) * 12 + Number(avgConfidence) * 8 - sourceBlocked * 4 + activeWatch * 2);
      return {
        focus_area,
        comparison_score: comparisonScore,
        current_stance: stanceFor({ focus_area }),
        best_use_case: bestUseCaseFor({ focus_area }),
        decision_question: strategic.decision_question || "",
        first_principle: strategic.first_principle || "",
        candidate_count: strategic.project_count || strategy.candidate_count || potentials.length,
        avg_potential: avgPotential,
        avg_confidence: avgConfidence,
        avg_location: strategic.avg_location || "",
        risk_mix: strategic.risk_mix || "",
        stage_mix: strategy.stage_mix || "",
        source_blockers: strategic.source_blockers || hypotheses.reduce((sum, row) => sum + Number(row.source_blockers || 0), 0),
        source_blocked_hypotheses: sourceBlocked,
        active_watch_hypotheses: activeWatch,
        top_potential_project: formatProject(topPotential),
        top_potential_score: topPotential.long_term_potential_score || "",
        top_fieldwork_route: topFieldwork.route_name || strategic.first_fieldwork_route || "",
        fieldwork_question: topFieldwork.route_question || "",
        fieldwork_checks: topFieldwork.onsite_checks || strategic.fieldwork_check || "",
        first_action_project: strategic.first_action_project || strategy.first_action_project || "",
        first_action_track: strategic.first_action_track || "",
        first_action: strategic.first_action || strategy.first_action || "",
        update_runbook: strategic.update_runbook || "",
        market_unique_transactions: market.unique_transactions || "",
        market_trade_transactions: market.trade_transactions || "",
        median_trade_amount_manwon: market.median_trade_amount_manwon || "",
        median_trade_price_per_sqm_manwon: market.median_trade_price_per_sqm_manwon || "",
        market_latest_deal_ymd: market.latest_deal_ymd || "",
        market_note: market.review_note || "",
        source_freshness_summary: freshnessSummary.status_mix || "",
        immediate_decision: immediateDecision({ focus_area, sourceBlocked, avgPotential, avgConfidence }),
      };
    })
    .sort((a, b) => Number(b.comparison_score) - Number(a.comparison_score));
}

function immediateDecision({ focus_area, sourceBlocked, avgPotential, avgConfidence }) {
  if (sourceBlocked >= 7) return "원문 병목을 먼저 닫아야 생활권 간 비교 신뢰도가 올라간다.";
  if (Number(avgPotential) >= 6.7 && Number(avgConfidence) >= 7.5) return "현장 답사와 비용·기반시설 원문 대조를 병행해 장기 관찰 우선순위를 유지한다.";
  if (focus_area === "구의/광진") return "변화 가능성은 유지하되, 공식 원문 확정 전에는 상방 가설을 보수적으로 둔다.";
  return "정기 업데이트와 공공 촉매 원문 확인을 유지한다.";
}

function dimensionRows(rows) {
  const pick = (sortField, label, interpretation) => {
    const ordered = [...rows].sort((a, b) => Number(b[sortField] || 0) - Number(a[sortField] || 0));
    return {
      dimension: label,
      leading_focus_area: ordered[0]?.focus_area || "",
      runner_up: ordered[1]?.focus_area || "",
      interpretation,
      first_check: ordered[0]?.immediate_decision || "",
    };
  };
  return [
    pick("avg_potential", "장기 잠재력", "점수가 높은 생활권도 원문 병목과 비용 리스크를 분리해서 봐야 한다."),
    pick("avg_confidence", "근거 확신도", "확신도가 높을수록 비교표를 바로 읽기 쉽지만, 비용·공공기여 조건은 별도 확인한다."),
    pick("market_trade_transactions", "시장 거래 표본", "시장 표본은 반응 확인용이며 사업 단계 판정 근거가 아니다."),
    pick("comparison_score", "종합 리서치 우선도", "잠재력, 확신도, 원문 병목, 즉시 감시 가설을 합친 리서치용 우선도다."),
  ];
}

function markdown(summary, rows, dimensions) {
  return `# 생활권 비교 브리프

작성 기준: ${kstDate()} KST

이 문서는 강남·잠실/송파·구의/광진을 같은 잣대로 비교하는 브리프다. 사업장별 추천이 아니라, 어떤 생활권을 어떤 질문으로 계속 추적할지 정하는 리서치 의사결정 표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 생활권 | ${summary.focus_area_count} |
| 후보 사업장 | ${summary.project_count} |
| 원문 병목 가설 | ${summary.source_blocked_hypotheses} |
| 즉시 감시 가설 | ${summary.active_watch_hypotheses} |
| 공식 출처 상태 | ${summary.source_freshness_summary} |

## 생활권 한눈 비교

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "comparison_score", label: "비교점수" },
    { key: "avg_potential", label: "평균잠재" },
    { key: "avg_confidence", label: "평균확신" },
    { key: "risk_mix", label: "리스크" },
    { key: "source_blocked_hypotheses", label: "원문병목" },
    { key: "current_stance", label: "현재 관점" },
  ])}

## 비교 축별 선두

${mdTable(dimensions, [
    { key: "dimension", label: "비교축" },
    { key: "leading_focus_area", label: "우위 생활권" },
    { key: "runner_up", label: "다음" },
    { key: "interpretation", label: "해석" },
    { key: "first_check", label: "먼저 확인" },
  ])}

## 생활권별 판단 질문

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "decision_question", label: "판단 질문" },
    { key: "first_principle", label: "해석 원칙" },
    { key: "best_use_case", label: "가장 쓸모 있는 용도" },
    { key: "immediate_decision", label: "지금 결론" },
  ])}

## 대표 사업과 현장 확인

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "top_potential_project", label: "장기 관찰 대표" },
    { key: "top_potential_score", label: "잠재" },
    { key: "first_action_project", label: "첫 액션 사업" },
    { key: "first_action_track", label: "트랙" },
    { key: "top_fieldwork_route", label: "답사 루트" },
    { key: "fieldwork_checks", label: "현장 체크" },
  ])}

## 시장 신호는 보조지표

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "market_unique_transactions", label: "거래표본" },
    { key: "market_trade_transactions", label: "매매" },
    { key: "median_trade_amount_manwon", label: "중위매매(만원)" },
    { key: "median_trade_price_per_sqm_manwon", label: "중위㎡당(만원)" },
    { key: "market_latest_deal_ymd", label: "최신계약" },
    { key: "market_note", label: "주의" },
  ])}

## 운영 원칙

- 강남은 상급지 프리미엄을 전제로 두지 말고 공공기여·기반시설·분담금 원문으로 방어력을 검증한다.
- 잠실/송파는 MICE·한강축 기대와 이주/관리처분 리스크를 분리해서 본다.
- 구의/광진은 동서울터미널·2/7호선·한강축 변화 가능성을 보되, 원문 병목이 해소되기 전에는 확신도를 낮게 둔다.
- 시장 데이터는 생활권 반응 확인용이며, 사업 단계·권리관계·인가일 확정 근거로 쓰지 않는다.
`;
}

async function main() {
  const [strategicBrief, focusStrategy, potentialRows, hypothesisData, fieldworkRows, marketSignals, sourceFreshness] = await Promise.all([
    readJson(INPUTS.strategicBrief),
    readJson(INPUTS.focusStrategy),
    readJson(INPUTS.potential),
    readJson(INPUTS.hypothesisLedger),
    readJson(INPUTS.fieldworkRoutes),
    readJson(INPUTS.marketSignals),
    readJson(INPUTS.sourceFreshness),
  ]);
  const rows = buildRows({
    strategicRows: strategicBrief.focus_rows || [],
    strategyRows: rowsFrom(focusStrategy),
    potentialRows: rowsFrom(potentialRows),
    hypothesisRows: rowsFrom(hypothesisData),
    fieldworkRows: rowsFrom(fieldworkRows),
    marketRows: marketSignals.focusRows || [],
    sourceFreshness,
  });
  const dimensions = dimensionRows(rows);
  const summary = {
    generated_at: `${kstDate()} KST`,
    focus_area_count: rows.length,
    project_count: rows.reduce((sum, row) => sum + Number(row.candidate_count || 0), 0),
    source_blocked_hypotheses: rows.reduce((sum, row) => sum + Number(row.source_blocked_hypotheses || 0), 0),
    active_watch_hypotheses: rows.reduce((sum, row) => sum + Number(row.active_watch_hypotheses || 0), 0),
    source_freshness_summary: sourceFreshness.summary?.status_mix || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, dimensions, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, dimensions));
  console.log(JSON.stringify({ focusAreas: rows.length, output: "analysis/focus-area-comparison-brief.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
