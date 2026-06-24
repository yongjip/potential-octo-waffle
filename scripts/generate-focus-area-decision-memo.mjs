#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-area-decision-memo.md");
const OUT_CSV = path.join(OUT_DIR, "focus-area-decision-memo.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-area-decision-memo.json");

const INPUTS = {
  focusComparison: "analysis/focus-area-comparison-brief.json",
  strategicBrief: "analysis/strategic-research-brief.json",
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
  dueDiligenceBoard: "analysis/project-due-diligence-board.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
  officialChangeBoard: "analysis/official-change-detection-board.json",
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
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))];
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
  return value[key] || value.rows || value.focus_rows || [];
}

function groupBy(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field] || "미분류";
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  }
  return groups;
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function projectRef(row) {
  if (!row?.project_name) return "";
  return `${row.rank}. ${row.project_name}`;
}

function topRows(rows, field, limit = 3) {
  return [...rows]
    .sort((a, b) => Number(b[field] || 0) - Number(a[field] || 0) || Number(a.rank || 999) - Number(b.rank || 999))
    .slice(0, limit);
}

function stanceFor(focus, comparison, hypotheses, dueRows) {
  const sourceBlocked = Number(comparison.source_blocked_hypotheses || 0);
  const activeWatch = Number(comparison.active_watch_hypotheses || 0);
  const officialResponse = dueRows.filter((row) => row.diligence_lane === "공식 회신 선행").length;
  if (officialResponse > 0 && activeWatch >= 6) return "관찰-회신병목분리";
  if (officialResponse > 0 || sourceBlocked >= 7) return "보류-원문확정";
  if (activeWatch >= 6 && Number(comparison.avg_confidence || 0) >= 7.5) return "적극관찰";
  if (sourceBlocked >= 4) return "조건부관찰";
  if (focus === "구의/광진") return "선원문-후가설";
  return "조건부관찰";
}

function thesisStrength(stance) {
  return {
    적극관찰: "현재 가설을 유지하되 현장·비용·공공계획 업데이트가 들어오면 즉시 재평가",
    "관찰-회신병목분리": "생활권 관찰은 유지하되 P0 회신 병목 사업은 확정 판단에서 분리",
    조건부관찰: "입지 가설은 유지하되 비용·공공기여·사업속도 증거가 먼저 필요",
    "보류-원문확정": "비교표 판단보다 고시/회신/원문 연결을 먼저 닫아야 함",
    "선원문-후가설": "생활권 변화 가능성은 인정하지만 원문 확정 전 상방 해석 보류",
  }[stance] || "정기 추적";
}

function evidenceNeeded(focus, comparison, dueRows) {
  const lanes = countBy(dueRows, "diligence_lane");
  if (dueRows.some((row) => row.diligence_lane === "공식 회신 선행")) {
    return "공식 회신/정보공개 회신의 고시번호·고시일·원문 URL·첨부명·기준일";
  }
  if (/현장/.test(comparison.first_action_track || "")) {
    return `현장 관찰값: ${comparison.fieldwork_checks || comparison.top_fieldwork_route}`;
  }
  if (/원문|비용/.test(lanes)) return "고시 원문 텍스트, 비용·기반시설 공개항목, 수치 대조 decision";
  if (focus === "구의/광진") return "자치구 고시/서울도시공간포털 recordCode와 사업구역계 원문";
  return "정책·교통 context를 고시·계획 원문으로 연결";
}

function buildFocusRows({ comparisonRows, strategicRows, hypothesisRows, dueRows, completionRows, changeRows }) {
  const strategicByFocus = new Map(strategicRows.map((row) => [row.focus_area, row]));
  const hypothesesByFocus = groupBy(hypothesisRows, "focus_area");
  const dueByFocus = groupBy(dueRows, "focus_area");
  const completionRanks = new Set(
    completionRows
      .map((row) => String(row.task_id || "").match(/SRC-P(\d+)/)?.[1])
      .filter(Boolean)
      .map((rank) => String(Number(rank))),
  );
  const sourceGate = compact(changeRows.filter((row) => ["primary", "primary_backstop"].includes(row.tier)).map((row) => `${row.source_id}: ${row.decision_gate}`), 3);

  return comparisonRows.map((comparison) => {
    const focus = comparison.focus_area;
    const strategic = strategicByFocus.get(focus) || {};
    const hypotheses = hypothesesByFocus.get(focus) || [];
    const focusDueRows = dueByFocus.get(focus) || [];
    const stance = stanceFor(focus, comparison, hypotheses, focusDueRows);
    const topDue = topRows(focusDueRows, "due_diligence_score", 3);
    const topHypotheses = topRows(hypotheses, "long_term_potential_score", 3);
    const highBlocking = focusDueRows.filter((row) => completionRanks.has(String(Number(row.rank))));
    const falsification = compact(topHypotheses.map((row) => row.falsification_conditions), 3);
    const promotion = compact(topHypotheses.map((row) => row.promotion_conditions), 3);
    return {
      focus_area: focus,
      provisional_stance: stance,
      thesis_strength: thesisStrength(stance),
      decision_question: comparison.decision_question || strategic.decision_question,
      current_thesis: comparison.current_stance || strategic.strategic_thesis,
      use_case: comparison.best_use_case,
      avg_potential: comparison.avg_potential,
      avg_confidence: comparison.avg_confidence,
      risk_mix: comparison.risk_mix,
      source_blocked_hypotheses: comparison.source_blocked_hypotheses,
      active_watch_hypotheses: comparison.active_watch_hypotheses,
      representative_projects: compact(topHypotheses.map(projectRef), 3),
      first_action_project: comparison.first_action_project,
      first_action_track: comparison.first_action_track,
      next_evidence_needed: evidenceNeeded(focus, comparison, focusDueRows),
      promotion_conditions: promotion,
      falsification_conditions: falsification,
      high_blocking_projects: compact(highBlocking.map(projectRef), 3),
      due_diligence_lanes: countBy(focusDueRows, "diligence_lane"),
      first_files: compact(topDue.flatMap((row) => String(row.first_files || "").split(";")), 6),
      update_runbook: comparison.update_runbook || strategic.update_runbook,
      source_gate: sourceGate,
      immediate_decision: comparison.immediate_decision,
      market_signal: `거래 ${comparison.market_unique_transactions || ""}; 매매 ${comparison.market_trade_transactions || ""}; 중위㎡당 ${comparison.median_trade_price_per_sqm_manwon || ""}만원; 최신 ${comparison.market_latest_deal_ymd || ""}`,
    };
  });
}

function buildProjectRows({ hypothesisRows, dueRows }) {
  const dueByRank = new Map(dueRows.map((row) => [String(row.rank), row]));
  return topRows(hypothesisRows, "long_term_potential_score", 12).map((row) => {
    const due = dueByRank.get(String(row.rank)) || {};
    return {
      rank: row.rank,
      focus_area: row.focus_area,
      project_name: row.project_name,
      stance: row.hypothesis_status_label,
      stage: row.current_stage,
      potential: row.long_term_potential_score,
      confidence: row.confidence_score,
      diligence_lane: due.diligence_lane || "",
      evidence_status: due.evidence_status || "",
      support: row.upside_watch,
      refute: row.falsification_conditions,
      next_gate: due.confidence_gate || row.decision_rule,
      first_file: compact([row.project_note, row.first_source_to_open, due.first_files], 4),
    };
  });
}

function summarize(focusRows, projectRows) {
  return {
    generated_at: UPDATED_AT,
    focus_area_count: focusRows.length,
    project_memo_count: projectRows.length,
    stance_mix: countBy(focusRows, "provisional_stance"),
    source_blocked_hypotheses: focusRows.reduce((sum, row) => sum + Number(row.source_blocked_hypotheses || 0), 0),
    active_watch_hypotheses: focusRows.reduce((sum, row) => sum + Number(row.active_watch_hypotheses || 0), 0),
    high_blocking_focus_count: focusRows.filter((row) => row.high_blocking_projects).length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, focusRows, projectRows) {
  return `# 생활권 의사결정 메모

작성 기준: ${UPDATED_AT}

이 문서는 강남·잠실/송파·구의/광진 리서치의 잠정 결론을 고정하고, 어떤 증거가 나오면 결론을 올리거나 낮출지 정리한다. 투자 추천이 아니라 공식 원문·현장·시장 보조신호를 해석하는 판단 메모다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 생활권 | ${summary.focus_area_count} |
| 사업장 메모 | ${summary.project_memo_count} |
| 원문 병목 가설 | ${summary.source_blocked_hypotheses} |
| 즉시 감시 가설 | ${summary.active_watch_hypotheses} |
| 완료 병목 포함 생활권 | ${summary.high_blocking_focus_count} |

| 구분 | 값 |
| --- | --- |
| 잠정 입장 | ${summary.stance_mix} |

## 생활권별 잠정 결론

${mdTable(focusRows, [
    { key: "focus_area", label: "생활권" },
    { key: "provisional_stance", label: "잠정 입장" },
    { key: "thesis_strength", label: "해석" },
    { key: "decision_question", label: "판단 질문" },
    { key: "current_thesis", label: "현재 thesis" },
    { key: "next_evidence_needed", label: "다음 증거" },
    { key: "immediate_decision", label: "지금 결론" },
  ])}

## 승격·반증 조건

${mdTable(focusRows, [
    { key: "focus_area", label: "생활권" },
    { key: "representative_projects", label: "대표 사업" },
    { key: "promotion_conditions", label: "승격 조건" },
    { key: "falsification_conditions", label: "반증 조건" },
    { key: "high_blocking_projects", label: "회신 병목" },
    { key: "first_files", label: "먼저 열 파일" },
    { key: "update_runbook", label: "런북" },
  ])}

## 사업장별 메모

${mdTable(projectRows, [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업" },
    { key: "stance", label: "가설상태" },
    { key: "diligence_lane", label: "실사 레인" },
    { key: "potential", label: "잠재" },
    { key: "confidence", label: "확신" },
    { key: "support", label: "지지 신호" },
    { key: "refute", label: "반증 신호" },
    { key: "next_gate", label: "다음 gate" },
  ])}

## 해석 원칙

- 잠정 입장이 \`보류-원문확정\`이면 생활권 매력보다 고시/회신/원문 연결을 먼저 닫는다.
- \`적극관찰\`은 매수 판단이 아니라 업데이트 감시 강도를 높인다는 뜻이다.
- 시장 신호는 반응 확인용이다. 단계, 인가일, 세대수, 비용, 기반시설 조건은 공식 원문이나 회신으로만 승격한다.
- 반증 조건이 충족되면 점수를 낮추기보다 먼저 사업별 메모, 비교표, 가설 장부를 재생성해 어느 산출물이 바뀌는지 확인한다.
`;
}

async function main() {
  const [focusComparison, strategicBrief, hypothesisLedger, dueDiligenceBoard, completionCockpit, officialChangeBoard] = await Promise.all(
    Object.values(INPUTS).map((file) => readJson(file)),
  );
  const focusRows = buildFocusRows({
    comparisonRows: rowsFrom(focusComparison),
    strategicRows: rowsFrom(strategicBrief),
    hypothesisRows: rowsFrom(hypothesisLedger),
    dueRows: rowsFrom(dueDiligenceBoard),
    completionRows: rowsFrom(completionCockpit),
    changeRows: rowsFrom(officialChangeBoard),
  });
  const projectRows = buildProjectRows({
    hypothesisRows: rowsFrom(hypothesisLedger),
    dueRows: rowsFrom(dueDiligenceBoard),
  });
  const summary = summarize(focusRows, projectRows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv([...focusRows.map((row) => ({ row_type: "focus", ...row })), ...projectRows.map((row) => ({ row_type: "project", ...row }))]));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, focusRows, projectRows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, focusRows, projectRows));
  console.log(JSON.stringify({ focusAreas: focusRows.length, projectMemos: projectRows.length, output: "analysis/focus-area-decision-memo.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
