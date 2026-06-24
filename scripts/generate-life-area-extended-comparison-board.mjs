#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  snapshot: "analysis/current-research-snapshot.json",
  comparisonBrief: "analysis/focus-area-comparison-brief.json",
  decisionMemo: "analysis/focus-area-decision-memo.json",
  evidenceHeatmap: "analysis/focus-area-evidence-risk-heatmap.json",
  coreExpansionSpine: "analysis/core-expansion-research-spine.json",
  expansionBrief: "analysis/expansion-interest-zone-brief.json",
  monitoringBoard: "analysis/life-area-monitoring-board.json",
  marketSummary: "analysis/market-transaction-signal-summary.json",
  expansionSignalSummary: "analysis/expansion-market-signal-summary.json",
};

const OUT_MD = "analysis/life-area-extended-comparison-board.md";
const OUT_JSON = "analysis/life-area-extended-comparison-board.json";
const OUT_CSV = "analysis/life-area-extended-comparison-board.csv";

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

function compact(values, limit = 2) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function parsePotential(text) {
  const match = String(text || "").match(/잠재\s*([0-9.]+)/);
  return match ? Number(match[1]) : null;
}

function parseConfidence(text) {
  const match = String(text || "").match(/확신\s*([0-9.]+)/);
  return match ? Number(match[1]) : null;
}

function findBy(rows, key, value) {
  return (rows || []).find((row) => String(row[key] || "").trim() === String(value || "").trim()) || {};
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function buildCoreRows(snapshot, comparisonBrief, decisionMemo, evidenceHeatmap, coreExpansionSpine, marketSummary) {
  const comparisonRows = comparisonBrief.rows || [];
  const decisionRows = decisionMemo.focusRows || [];
  const heatRows = evidenceHeatmap.focus_rows || [];
  const coreRows = coreExpansionSpine.core_rows || [];
  const marketRows = marketSummary.focusRows || [];

  return (snapshot.life_areas || []).map((area) => {
    const lifeArea = area.name;
    const comparisonRow = findBy(comparisonRows, "focus_area", lifeArea);
    const decisionRow = findBy(decisionRows, "focus_area", lifeArea);
    const heatRow = findBy(heatRows, "focus_area", lifeArea);
    const marketRow = findBy(marketRows, "focus_area", lifeArea);
    const anchors = coreRows.filter((row) => row.area_group === lifeArea);
    const topAnchor = anchors.find((row) => String(row.anchor_role || "").includes("top_potential")) || anchors[0] || {};
    const stageAnchor = anchors.find((row) => String(row.anchor_role || "").includes("stage_anchor")) || anchors[0] || {};
    const potential = topAnchor.confidence_or_grade ? parsePotential(topAnchor.confidence_or_grade) : null;
    const confidence = topAnchor.confidence_or_grade ? parseConfidence(topAnchor.confidence_or_grade) : null;

    return {
      area_name: lifeArea,
      area_kind: "core_life_area",
      area_role: "핵심 생활권",
      current_stance: area.current_stance || comparisonRow.current_stance || "",
      representative_anchor: compact([topAnchor.project_name, stageAnchor.project_name], 2),
      stage_read: compact([
        topAnchor.current_stage_or_signal ? `${topAnchor.project_name} ${topAnchor.current_stage_or_signal}` : "",
        stageAnchor.project_name !== topAnchor.project_name && stageAnchor.current_stage_or_signal
          ? `${stageAnchor.project_name} ${stageAnchor.current_stage_or_signal}`
          : "",
      ], 2),
      transit_read: topAnchor.transit_axis || area.fieldwork_route || "",
      market_read: marketRow.focus_area
        ? `중복제거 ${marketRow.unique_transactions}; 중위 매매 ㎡당 ${marketRow.median_trade_price_per_sqm_manwon}만원; 보증금 ${marketRow.median_rent_deposit_manwon}만원; 최신 ${marketRow.latest_deal_ymd}`
        : "",
      risk_read: compact([area.main_risks?.join(", "), topAnchor.risk_or_caution], 2),
      long_term_read: topAnchor.long_term_view || area.one_line_conclusion || "",
      evidence_read: `${area.official_evidence_status || ""} / 외부의존 ${area.external_dependency || ""}`.trim(),
      comparison_score: comparisonRow.comparison_score || "",
      avg_potential: comparisonRow.avg_potential || potential || "",
      avg_confidence: comparisonRow.avg_confidence || confidence || "",
      avg_heat_score: heatRow.avg_heat_score || "",
      decision_question: area.key_question || decisionRow.decision_question || "",
      next_action: area.next_action || comparisonRow.immediate_decision || decisionRow.immediate_decision || "",
      caution: topAnchor.risk_or_caution || "",
      sort_score: Number(comparisonRow.comparison_score || 0),
    };
  });
}

function buildExpansionRows(expansionBrief, monitoringBoard, expansionSignalSummary) {
  const briefRows = expansionBrief.rows || [];
  const monitoringRows = monitoringBoard.expansion_zone_rows || [];
  const signalRows = expansionSignalSummary.zone_rows || [];

  return briefRows.map((row) => {
    const monitoringRow = findBy(monitoringRows, "zone_name", row.zone_name);
    const signalRow = findBy(signalRows, "zone_name", row.zone_name);
    return {
      area_name: row.zone_name,
      area_kind: "expansion_zone",
      area_role: "확장 관심권",
      current_stance: monitoringRow.current_state || row.current_system_status || "",
      representative_anchor: monitoringRow.anchor_projects || "",
      stage_read: compact([monitoringRow.current_state, monitoringRow.stage_state], 2),
      transit_read: row.anchor_corridors || "",
      market_read: signalRow.zone_name
        ? `중복제거 ${signalRow.unique_transactions}; 중위 매매 ㎡당 ${signalRow.median_trade_price_per_sqm_manwon}만원; 보증금 ${signalRow.median_rent_deposit_manwon}만원; 월세 ${signalRow.median_monthly_rent_manwon}만원; 최신 ${signalRow.latest_deal_ymd}`
        : "",
      risk_read: compact([row.caution, monitoringRow.key_caution], 2),
      long_term_read: row.key_hypothesis || "",
      evidence_read: `${row.current_system_status || ""} / ${row.operational_state || ""}`.trim(),
      comparison_score: "",
      avg_potential: "",
      avg_confidence: "",
      avg_heat_score: "",
      decision_question: row.key_hypothesis || "",
      next_action: monitoringRow.priority_action || row.next_system_move || "",
      caution: row.activation_gap || "",
      sort_score: row.zone_name === "강동권" ? 90 : 80,
    };
  });
}

function summarize(rows) {
  return {
    generated_at: `${kstDate()} KST`,
    total_rows: rows.length,
    core_life_area_count: rows.filter((row) => row.area_kind === "core_life_area").length,
    expansion_zone_count: rows.filter((row) => row.area_kind === "expansion_zone").length,
    stage_recheck_needed_count: rows.filter((row) => String(row.stage_read || "").includes("단계 재확인 필요")).length,
    high_external_dependency_count: rows.filter((row) => String(row.evidence_read || "").includes("외부의존 높음")).length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };
}

function markdown(summary, rows) {
  const coreRows = rows.filter((row) => row.area_kind === "core_life_area");
  const expansionRows = rows.filter((row) => row.area_kind === "expansion_zone");
  return `# 생활권 확장 통합 비교 보드

작성 기준: ${summary.generated_at}

이 문서는 핵심 3생활권과 확장 2권역을 같은 축으로 나란히 놓는 상위 비교판이다. 생활권과 사업장을 하나의 점수로 섞지 않고, 진행단계·교통입지·리스크·장기 가능성을 같은 문장 구조로 읽게 만든다.

## 요약

- 전체 비교 행: ${summary.total_rows}
- 핵심 생활권: ${summary.core_life_area_count}
- 확장 관심권: ${summary.expansion_zone_count}
- 단계 재확인 필요 행: ${summary.stage_recheck_needed_count}
- 외부의존 높음 행: ${summary.high_external_dependency_count}

## 통합 비교

${mdTable(rows, [
    { key: "area_role", label: "구분" },
    { key: "area_name", label: "권역" },
    { key: "current_stance", label: "현재 입장" },
    { key: "stage_read", label: "진행단계 읽기" },
    { key: "transit_read", label: "교통입지 읽기" },
    { key: "market_read", label: "시장신호 읽기" },
    { key: "risk_read", label: "리스크 읽기" },
    { key: "long_term_read", label: "장기 가능성 읽기" },
    { key: "evidence_read", label: "공식근거 상태" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 핵심 생활권 비교

${mdTable(coreRows, [
    { key: "area_name", label: "생활권" },
    { key: "representative_anchor", label: "대표 anchor" },
    { key: "comparison_score", label: "비교점수" },
    { key: "avg_potential", label: "평균잠재" },
    { key: "avg_confidence", label: "평균확신" },
    { key: "avg_heat_score", label: "열도점수" },
    { key: "decision_question", label: "판단 질문" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 확장 관심권 비교

${mdTable(expansionRows, [
    { key: "area_name", label: "확장권" },
    { key: "representative_anchor", label: "대표 사업" },
    { key: "stage_read", label: "진행단계 읽기" },
    { key: "transit_read", label: "교통입지 읽기" },
    { key: "market_read", label: "시장신호 읽기" },
    { key: "risk_read", label: "리스크 읽기" },
    { key: "long_term_read", label: "장기 가능성 읽기" },
    { key: "evidence_read", label: "공식근거 상태" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 읽는 규칙

1. 핵심 생활권은 비교점수·평균잠재·평균확신을 같이 보되, 생활권 결론은 대표 anchor의 단계와 리스크 문장으로 다시 확인한다.
2. 확장 관심권은 현재 점수화보다 비교축 정리와 단계 공백 관리가 목적이다. 강동권은 잠실/송파 동측 연장축, 약수동 주변은 도심 경사 대조군으로 읽는다.
3. 강동권은 값이 confirmed여도 최신 단계 재확인 전까지 핵심 3생활권과 동일한 단계 확신도로 취급하지 않는다.
4. 약수동 주변은 confirmed snapshot 3건을 그대로 쓰되, 강남·잠실의 직접 대안축으로 해석하지 않는다.
`;
}

async function main() {
  const [snapshot, comparisonBrief, decisionMemo, evidenceHeatmap, coreExpansionSpine, expansionBrief, monitoringBoard, marketSummary, expansionSignalSummary] = await Promise.all([
    readJson(INPUTS.snapshot),
    readJson(INPUTS.comparisonBrief),
    readJson(INPUTS.decisionMemo),
    readJson(INPUTS.evidenceHeatmap),
    readJson(INPUTS.coreExpansionSpine),
    readJson(INPUTS.expansionBrief),
    readJson(INPUTS.monitoringBoard),
    readJson(INPUTS.marketSummary),
    readJson(INPUTS.expansionSignalSummary),
  ]);

  const rows = [
    ...buildCoreRows(snapshot, comparisonBrief, decisionMemo, evidenceHeatmap, coreExpansionSpine, marketSummary),
    ...buildExpansionRows(expansionBrief, monitoringBoard, expansionSignalSummary),
  ].sort((a, b) => Number(b.sort_score || 0) - Number(a.sort_score || 0));

  const summary = summarize(rows);
  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows.map(({ sort_score, ...row }) => row)));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);
  console.log(JSON.stringify({ rows: rows.length, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
