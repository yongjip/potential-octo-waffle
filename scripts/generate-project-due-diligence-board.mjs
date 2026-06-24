#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "project-due-diligence-board.md");
const OUT_CSV = path.join(OUT_DIR, "project-due-diligence-board.csv");
const OUT_JSON = path.join(OUT_DIR, "project-due-diligence-board.json");

const INPUTS = {
  comparison: "analysis/project-comparison-matrix.json",
  nextMoves: "analysis/research-next-moves.json",
  evidenceBinder: "analysis/project-evidence-binder.json",
  fieldwork: "analysis/fieldwork-route-planner.json",
  market: "analysis/market-transaction-signal-summary.json",
  catalystTriggers: "analysis/catalyst-trigger-matrix.json",
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

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function compactParts(items, limit = 5) {
  return compact(
    items.flatMap((item) =>
      String(item || "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
    limit,
  );
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function topTrigger(triggers) {
  return [...triggers].sort((a, b) => Number(b.trigger_priority || 0) - Number(a.trigger_priority || 0))[0] || {};
}

function diligenceLane({ nextMove, evidence, trigger }) {
  if (evidence.binder_status === "official_response_needed") return "공식 회신 선행";
  if (/원문/.test(nextMove.track || "")) return "원문 검증 우선";
  if (trigger.signal_class === "원문 보강 우선") return "원문 검증 우선";
  if (["source_link_bottleneck", "ocr_or_partial_value_review"].includes(evidence.binder_status)) return "원문 검증 우선";
  if (/비용|기반시설/.test(nextMove.track || "")) return "비용·기반시설 실사";
  if (/현장/.test(nextMove.track || "")) return "현장 동선 실사";
  if (/정책|공공/.test(nextMove.track || "") || ["가설 재평가", "리스크 재점검"].includes(trigger.signal_class)) return "정책·촉매 감시";
  return "정기 추적";
}

function diligenceQuestion({ comparison, nextMove, fieldwork, trigger }) {
  if (trigger.signal_class === "공식 회신 선행") return "공식 회신 없이 현재 장기 가설을 비교표에 어느 수준까지 쓸 수 있는가.";
  if (/원문/.test(nextMove.track || "")) return "고시번호·고시일·원문 URL·핵심 수치 중 무엇이 아직 비교표 확정성을 막는가.";
  if (/비용|기반시설/.test(nextMove.track || "")) return "공사비·분담금·기반시설·공공기여 조건이 입지 프리미엄을 훼손하는가.";
  if (/현장/.test(nextMove.track || "")) return fieldwork.route_question || "역 출구와 단지 경계 사이의 실제 보행·환승·단절이 장기 가설을 지지하는가.";
  if (trigger.catalyst_name) return `${trigger.catalyst_name} 업데이트가 이 사업장의 상향 신호인지 하향 신호인지 원문으로 확인할 수 있는가.`;
  return `${comparison.focus_area} 내 같은 단계 사업과 비교해 다음 공식 업데이트를 기다릴 가치가 있는가.`;
}

function marketCaveat(market) {
  if (!market) return "";
  return compact([
    `거래 ${market.unique_transactions || 0}건`,
    `매매 ${market.trade_transactions || 0}건`,
    market.median_trade_price_per_sqm_manwon ? `중위㎡당 ${market.median_trade_price_per_sqm_manwon}만원` : "",
    market.latest_deal_ymd ? `최신 ${market.latest_deal_ymd}` : "",
    "법정동/권역 1차 매칭",
  ], 5);
}

function confidenceGate({ evidence, nextMove, trigger }) {
  const gates = [];
  if (evidence.completion_task) {
    return compactParts([`${evidence.completion_task} 회신 intake`, evidence.completion_gate, trigger.proof_gate], 5);
  }
  if (evidence.binder_status === "source_link_bottleneck") gates.push("원문 URL/recordCode 보강");
  if (evidence.binder_status === "ocr_or_partial_value_review") gates.push("OCR 이미지/부분확정 수치 대조");
  if (/비용|기반시설/.test(nextMove.track || "")) gates.push("비용·기반시설 공개항목 원문 대조");
  if (/현장/.test(nextMove.track || "")) gates.push("현장 보행·환승·단절 관찰 기록");
  if (trigger.proof_gate) gates.push(trigger.proof_gate);
  return compactParts(gates, 5);
}

function buildRows({ comparisonRows, nextByRank, evidenceByRank, fieldworkByRank, marketByRank, triggerByRank }) {
  return comparisonRows
    .map((comparison) => {
      const rank = String(comparison.rank);
      const nextMove = nextByRank.get(rank) || {};
      const evidence = evidenceByRank.get(rank) || {};
      const fieldwork = fieldworkByRank.get(rank) || {};
      const market = marketByRank.get(rank) || {};
      const trigger = triggerByRank.get(rank) || {};
      const lane = diligenceLane({ nextMove, evidence, trigger });
      const baseScore = Number(nextMove.move_score || comparison.score || 0);
      const laneBoost = lane === "공식 회신 선행" ? 120 : lane === "원문 검증 우선" ? 80 : lane === "현장 동선 실사" ? 45 : lane === "비용·기반시설 실사" ? 40 : 25;
      const dueDiligenceScore = round(baseScore + laneBoost + Number(trigger.trigger_priority || 0) * 0.12, 1);
      return {
        rank,
        focus_area: comparison.focus_area,
        district: comparison.district,
        project_name: comparison.project_name,
        current_stage: comparison.current_stage,
        diligence_lane: lane,
        due_diligence_score: dueDiligenceScore,
        next_track: nextMove.track || "",
        evidence_status: evidence.binder_status_label || "",
        evidence_grade: evidence.evidence_grade || "",
        long_term_potential_score: nextMove.long_term_potential_score || "",
        confidence_score: nextMove.confidence_score || "",
        risk_signal_level: nextMove.risk_signal_level || "",
        route_name: fieldwork.route_name || "",
        onsite_checks: fieldwork.onsite_checks || "",
        catalyst_signal: compact([trigger.catalyst_name, trigger.signal_class], 2),
        market_signal: marketCaveat(market),
        diligence_question: diligenceQuestion({ comparison, nextMove, fieldwork, trigger }),
        confidence_gate: confidenceGate({ evidence, nextMove, trigger }),
        first_files: compactParts([evidence.first_files_to_open, nextMove.first_source_to_open, fieldwork.official_before_visit], 6),
        project_note: comparison.project_note || nextMove.project_note || "",
      };
    })
    .sort((a, b) => Number(b.due_diligence_score || 0) - Number(a.due_diligence_score || 0) || Number(a.rank) - Number(b.rank));
}

function summarize(rows, marketSummary) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    lane_mix: countBy(rows, "diligence_lane"),
    focus_mix: countBy(rows, "focus_area"),
    official_response_first_count: rows.filter((row) => row.diligence_lane === "공식 회신 선행").length,
    source_or_ocr_first_count: rows.filter((row) => row.diligence_lane === "원문 검증 우선").length,
    fieldwork_first_count: rows.filter((row) => row.diligence_lane === "현장 동선 실사").length,
    latest_market_deal_ymd: marketSummary.latest_deal_ymd || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const coreFields = [
    { key: "due_diligence_score", label: "실사점수" },
    { key: "focus_area", label: "생활권" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "diligence_lane", label: "실사 레인" },
    { key: "current_stage", label: "단계" },
    { key: "evidence_status", label: "근거" },
    { key: "risk_signal_level", label: "리스크" },
    { key: "diligence_question", label: "판단 질문" },
    { key: "confidence_gate", label: "확신도 gate" },
  ];
  const firstRows = rows.slice(0, 15);
  const laneRows = Object.values(
    rows.reduce((acc, row) => {
      const key = row.diligence_lane;
      const bucket = acc[key] || {
        diligence_lane: key,
        project_count: 0,
        top_project: "",
        top_score: 0,
        focus_mix: {},
        first_gate: "",
      };
      bucket.project_count += 1;
      bucket.focus_mix[row.focus_area] = (bucket.focus_mix[row.focus_area] || 0) + 1;
      if (Number(row.due_diligence_score || 0) > bucket.top_score) {
        bucket.top_score = row.due_diligence_score;
        bucket.top_project = `${row.rank}. ${row.project_name}`;
        bucket.first_gate = row.confidence_gate;
      }
      acc[key] = bucket;
      return acc;
    }, {}),
  )
    .map((row) => ({
      ...row,
      focus_mix: Object.entries(row.focus_mix)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => `${key} ${count}`)
        .join("; "),
    }))
    .sort((a, b) => b.top_score - a.top_score);

  return `# 사업장 실사 보드

작성 기준: ${UPDATED_AT}

이 문서는 후보 30개 사업장을 하나씩 딥다이브할 때 필요한 원문 상태, 다음 액션, 현장 루트, 공공 촉매, 시장 보조신호를 한 행으로 묶는다. 투자 추천이 아니라 어느 증거를 먼저 열어야 하는지 정하는 실사 순서표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 사업장 | ${summary.project_count} |
| 공식 회신 선행 | ${summary.official_response_first_count} |
| 원문/OCR 우선 | ${summary.source_or_ocr_first_count} |
| 현장 우선 | ${summary.fieldwork_first_count} |
| 최신 시장 계약일 | ${summary.latest_market_deal_ymd} |

## 분포

| 구분 | 값 |
| --- | --- |
| 실사 레인 | ${summary.lane_mix} |
| 생활권 | ${summary.focus_mix} |

## 레인별 시작점

${mdTable(laneRows, [
    { key: "diligence_lane", label: "실사 레인" },
    { key: "project_count", label: "사업장" },
    { key: "top_project", label: "대표 사업" },
    { key: "top_score", label: "최고점" },
    { key: "focus_mix", label: "생활권" },
    { key: "first_gate", label: "첫 gate" },
  ])}

## 먼저 볼 15개

${mdTable(firstRows, coreFields)}

## 생활권별 첫 실사

${mdTable(["강남", "잠실/송파", "구의/광진"].map((focus) => rows.find((row) => row.focus_area === focus)).filter(Boolean), [
    { key: "focus_area", label: "생활권" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "diligence_lane", label: "실사 레인" },
    { key: "route_name", label: "현장 루트" },
    { key: "market_signal", label: "시장 보조신호" },
    { key: "first_files", label: "먼저 열 파일" },
  ])}

## 전체 실사 보드

${mdTable(rows, [
    ...coreFields,
    { key: "long_term_potential_score", label: "잠재" },
    { key: "confidence_score", label: "확신" },
    { key: "route_name", label: "현장 루트" },
    { key: "catalyst_signal", label: "촉매" },
    { key: "market_signal", label: "시장 보조신호" },
    { key: "first_files", label: "먼저 열 파일" },
  ])}

## 해석 원칙

- 실사점수는 투자 매력도가 아니라 지금 리서치해야 할 순서다.
- 공식 회신 선행과 원문 검증 우선 레인은 장기 잠재보다 증거 gate를 먼저 닫는다.
- 시장 보조신호는 법정동/권역 1차 매칭이므로 사업장 가격으로 직접 해석하지 않는다.
- 현장 동선 실사는 역 출구, 단지 경계, 한강·간선도로 단절, 환승 혼잡을 같은 순서로 기록한다.
`;
}

async function main() {
  const [comparisonRows, nextRows, evidenceData, fieldworkRows, marketData, catalystData] = await Promise.all([
    readJson(INPUTS.comparison),
    readJson(INPUTS.nextMoves),
    readJson(INPUTS.evidenceBinder),
    readJson(INPUTS.fieldwork),
    readJson(INPUTS.market),
    readJson(INPUTS.catalystTriggers),
  ]);

  const triggerGroups = groupByRank(rowsFrom(catalystData));
  const triggerByRank = new Map([...triggerGroups.entries()].map(([rank, triggers]) => [rank, topTrigger(triggers)]));
  const rows = buildRows({
    comparisonRows: rowsFrom(comparisonRows),
    nextByRank: byRank(rowsFrom(nextRows)),
    evidenceByRank: byRank(rowsFrom(evidenceData)),
    fieldworkByRank: byRank(rowsFrom(fieldworkRows)),
    marketByRank: byRank(marketData.projectRows || []),
    triggerByRank,
  });
  const summary = summarize(rows, marketData.summary || {});

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown(summary, rows));
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);

  console.log(JSON.stringify({ rows: rows.length, lanes: summary.lane_mix, output: "analysis/project-due-diligence-board.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
