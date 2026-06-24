#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { FOCUS_PROJECT_PAIRS } from "./lib/focus-project-pairs.mjs";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "update-impact-ledger.md");
const OUT_CSV = path.join(OUT_DIR, "update-impact-ledger.csv");
const OUT_JSON = path.join(OUT_DIR, "update-impact-ledger.json");

const INPUTS = {
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
  fieldworkNotebook: "analysis/fieldwork-observation-notebook.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
  runbookChecklist: "analysis/official-update-runbook-checklist.json",
  pairComparisonBoard: "analysis/focus-project-pair-comparison-board.json",
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

const PAIR_RANKS = new Set(
  FOCUS_PROJECT_PAIRS.flatMap((row) => [String(row.rank_a || ""), String(row.rank_b || "")]).filter(Boolean),
);

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function runbookById(checklist) {
  const rows = checklist.selectedRunbooks || [];
  return new Map(rows.map((row) => [row.runbook_id, row]));
}

function completionByRank(rows) {
  const map = new Map();
  for (const row of rows) {
    const match = String(row.task_id || "").match(/SRC-P(\d+)/);
    if (!match) continue;
    map.set(String(Number(match[1])), row);
  }
  return map;
}

function riskWeight(level) {
  if (level === "very_high") return 40;
  if (level === "high") return 30;
  if (level === "medium") return 15;
  return 5;
}

function watchWeight(level) {
  if (level === "immediate") return 35;
  if (level === "high") return 25;
  if (level === "normal") return 10;
  return 5;
}

function signalTypes(row, fieldwork, completionTask) {
  const types = [];
  if (completionTask || row.hypothesis_status === "source_blocked_hypothesis") types.push("official_response_or_notice");
  if (row.source_blockers > 0) types.push("recordcode_or_source_link");
  if (["very_high", "high"].includes(row.risk_signal_level)) types.push("cost_infra_or_schedule_risk");
  if (/현장|교통|보행|한강|환승|단절/.test(`${row.deep_dive_track} ${row.deep_dive_question} ${fieldwork?.onsite_checks || ""}`)) types.push("fieldwork_observation");
  if (PAIR_RANKS.has(String(row.rank)) && /현장|교통|보행|한강|환승|단절/.test(`${row.deep_dive_track} ${row.deep_dive_question} ${fieldwork?.onsite_checks || ""}`)) {
    types.push("same_day_pair_comparison");
  }
  if (row.catalysts) types.push("public_plan_or_transport_catalyst");
  types.push("weekly_status_refresh");
  return compact(types, 6);
}

function runbookFor(row, signalType, completionTask) {
  if (completionTask) return "high_blocking_contact_escalation";
  if (signalType.includes("same_day_pair_comparison")) return "same_day_pair_compare";
  if (signalType.includes("official_response_or_notice") || signalType.includes("recordcode_or_source_link")) return "recordcode_bottleneck_probe";
  if (signalType.includes("fieldwork_observation")) return "text_extraction_and_hwp_qa";
  if (signalType.includes("public_plan_or_transport_catalyst")) return "monthly_context_scan";
  return "weekly_primary_refresh";
}

function intakeFile(row, signalType, completionTask) {
  if (completionTask) return completionTask.update_file || "data/review/high-blocking-source-response-intake.json";
  if (signalType.includes("same_day_pair_comparison")) return "data/review/focus-project-pair-comparisons.json";
  if (signalType.includes("official_response_or_notice") || signalType.includes("recordcode_or_source_link")) return "data/review/source-verification-closure-decisions.json";
  if (signalType.includes("fieldwork_observation")) return "data/review/fieldwork-observations.json";
  if (signalType.includes("public_plan_or_transport_catalyst")) return "analysis/official-context-sources.csv";
  return "원격 수집 산출물 갱신 후 파생 산출물 재생성";
}

function affectedOutputs(row, signalType, completionTask) {
  const outputs = [
    row.project_note,
    "analysis/research-hypothesis-ledger.md",
    "analysis/project-comparison-matrix.md",
    "analysis/reassessment-watchlist.md",
  ];
  if (completionTask) outputs.push("analysis/research-completion-cockpit.md", "analysis/research-goal-completion-audit.md");
  if (signalType.includes("fieldwork_observation")) outputs.push("analysis/fieldwork-observation-notebook.md", "analysis/transport-location-context.md");
  if (signalType.includes("same_day_pair_comparison")) {
    outputs.push(
      "analysis/focus-project-pair-comparison-board.md",
      "analysis/life-area-comparison-worksheet.md",
      "analysis/focus-area-decision-memo.md",
      "analysis/personal-research-home.md",
    );
  }
  if (signalType.includes("cost_infra_or_schedule_risk")) outputs.push("analysis/project-risk-signal-summary.md", "analysis/core-value-confirmation-ledger.md");
  if (signalType.includes("public_plan_or_transport_catalyst")) outputs.push("analysis/public-development-catalyst-map.md", "analysis/long-term-potential-scorecard.md");
  return compact(outputs, 8);
}

function decisionGate(row, completionTask) {
  if (completionTask) return completionTask.completion_gate;
  if (PAIR_RANKS.has(String(row.rank))) {
    return "같은 날 비교 메모는 현장 체감 차이와 판단 변화 기록용이며, 단계·수치 확정 없이 생활권 결론만 보정한다.";
  }
  if (row.hypothesis_status === "source_blocked_hypothesis") return "공식 원문·고시번호·고시일·원문 URL·자료명이 확인될 때만 가설 승격";
  if (row.risk_signal_level === "very_high" || row.risk_signal_level === "high") return "비용·기반시설·일정 리스크 원문을 확인한 뒤 장기 관찰 등급 유지/하향 결정";
  if (row.catalysts) return "공공 촉매가 계획·고시·교통대책 원문으로 연결될 때만 상방 신호로 유지";
  return "단계 변경, 공개자료 증가, 현장 관찰 변화가 없으면 정기 추적 유지";
}

function buildProjectRows({ hypotheses, fieldworkByRank, completionByRankMap, runbooks }) {
  return hypotheses
    .map((row) => {
      const rank = String(row.rank);
      const fieldwork = fieldworkByRank.get(rank);
      const completionTask = completionByRankMap.get(rank);
      const signals = signalTypes(row, fieldwork, completionTask);
      const runbookId = runbookFor(row, signals, completionTask);
      const runbook = runbooks.get(runbookId) || {};
      const updatePriorityScore =
        Number(row.source_blockers || 0) * 12 +
        riskWeight(row.risk_signal_level) +
        watchWeight(row.watch_level) +
        Number(row.long_term_potential_score || 0) * 6 +
        (completionTask ? 60 : 0);
      return {
        rank,
        focus_area: row.focus_area,
        project_name: row.project_name,
        current_stage: row.current_stage,
        hypothesis_status: row.hypothesis_status_label,
        update_priority_score: Math.round(updatePriorityScore * 10) / 10,
        signal_types: signals,
        runbook_id: runbookId,
        runbook_trigger: runbook.trigger || row.reassessment_trigger || "",
        intake_file: intakeFile(row, signals, completionTask),
        first_triage_files: compact(
          [
            "analysis/update-impact-ledger.md",
            row.first_source_to_open,
            row.project_note,
            runbook.first_outputs_to_read,
            completionTask?.source_file,
          ],
          6,
        ),
        affected_outputs: affectedOutputs(row, signals, completionTask),
        completion_task: completionTask?.task_id || "",
        decision_gate: decisionGate(row, completionTask),
        regenerate_command: "node scripts/regenerate-research-artifacts.mjs",
      };
    })
    .sort((a, b) => b.update_priority_score - a.update_priority_score || Number(a.rank) - Number(b.rank));
}

function workflowRows(runbooks) {
  return [
    {
      signal_type: "weekly_status_refresh",
      when_to_use: "정기 점검일, 정보몽땅 공개자료 수 변화, 단계 변경 후보 발견",
      runbook_id: "weekly_primary_refresh",
      intake_file: "원격 수집 산출물",
      first_outputs: runbooks.get("weekly_primary_refresh")?.first_outputs_to_read || "",
      decision_rule: runbooks.get("weekly_primary_refresh")?.decision_rule || "",
    },
    {
      signal_type: "official_response_or_notice",
      when_to_use: "담당부서 회신, 정보공개 회신, 새 고시번호·첨부 원문 확보",
      runbook_id: "high_blocking_contact_escalation",
      intake_file: "data/review/high-blocking-source-response-intake.json",
      first_outputs: runbooks.get("high_blocking_contact_escalation")?.first_outputs_to_read || "",
      decision_rule: runbooks.get("high_blocking_contact_escalation")?.decision_rule || "",
    },
    {
      signal_type: "recordcode_or_source_link",
      when_to_use: "서울도시공간포털 recordCode, 자치구 고시공고, 원문 URL 후보 발견",
      runbook_id: "recordcode_bottleneck_probe",
      intake_file: "data/review/source-verification-closure-decisions.json",
      first_outputs: runbooks.get("recordcode_bottleneck_probe")?.first_outputs_to_read || "",
      decision_rule: runbooks.get("recordcode_bottleneck_probe")?.decision_rule || "",
    },
    {
      signal_type: "fieldwork_observation",
      when_to_use: "지하철 답사 후 보행시간, 횡단 대기, 도로/한강 단절, 사진 경로를 기록",
      runbook_id: "text_extraction_and_hwp_qa",
      intake_file: "data/review/fieldwork-observations.json",
      first_outputs: "analysis/fieldwork-observation-notebook.md; analysis/transport-location-context.md; analysis/research-hypothesis-ledger.md",
      decision_rule: "현장 관찰은 공식 단계 근거가 아니며 입지·리스크·가설 확신도 보정에만 사용한다.",
    },
    {
      signal_type: "same_day_pair_comparison",
      when_to_use: "같은 날 핵심 사업 2건 이상을 걸은 뒤 생활권 체감 차이를 바로 비교할 때",
      runbook_id: "same_day_pair_compare",
      intake_file: "data/review/focus-project-pair-comparisons.json",
      first_outputs: "analysis/focus-project-pair-comparison-board.md; analysis/focus-project-pair-comparison-starter.md; analysis/life-area-comparison-worksheet.md",
      decision_rule: "pair-comparison은 현장 체감 차이와 판단 변화 기록용이며 공식 단계·수치 확정 근거로 쓰지 않는다.",
    },
    {
      signal_type: "public_plan_or_transport_catalyst",
      when_to_use: "서울시 도시계획·교통 정책, 동서울터미널, 잠실 MICE, 한강변관리 등 컨텍스트 업데이트",
      runbook_id: "monthly_context_scan",
      intake_file: "analysis/official-context-sources.csv",
      first_outputs: runbooks.get("monthly_context_scan")?.first_outputs_to_read || "",
      decision_rule: runbooks.get("monthly_context_scan")?.decision_rule || "",
    },
    {
      signal_type: "market_refresh",
      when_to_use: "실거래 최신월 공표, 수동 파일 교체, API 키 연결",
      runbook_id: "monthly_market_data_refresh",
      intake_file: "data/market/manual-import/files/",
      first_outputs: runbooks.get("monthly_market_data_refresh")?.first_outputs_to_read || "",
      decision_rule: runbooks.get("monthly_market_data_refresh")?.decision_rule || "",
    },
  ];
}

function summarize(projectRows, workflowRowsData) {
  const statusCounts = projectRows.reduce((acc, row) => {
    acc[row.hypothesis_status] = (acc[row.hypothesis_status] || 0) + 1;
    return acc;
  }, {});
  const runbookCounts = projectRows.reduce((acc, row) => {
    acc[row.runbook_id] = (acc[row.runbook_id] || 0) + 1;
    return acc;
  }, {});
  return {
    generated_at: UPDATED_AT,
    project_count: projectRows.length,
    workflow_count: workflowRowsData.length,
    high_priority_count: projectRows.filter((row) => row.update_priority_score >= 110).length,
    completion_linked_count: projectRows.filter((row) => row.completion_task).length,
    status_mix: Object.entries(statusCounts).map(([key, value]) => `${key} ${value}`).join("; "),
    runbook_mix: Object.entries(runbookCounts).map(([key, value]) => `${key} ${value}`).join("; "),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, projectRows, workflowRowsData) {
  const topRows = projectRows.slice(0, 15);
  const completionRows = projectRows.filter((row) => row.completion_task);
  const fields = [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "update_priority_score", label: "영향점수" },
    { key: "signal_types", label: "신호" },
    { key: "runbook_id", label: "런북" },
    { key: "intake_file", label: "입력" },
    { key: "decision_gate", label: "판정 gate" },
  ];
  return `# 업데이트 영향 장부

작성 기준: ${UPDATED_AT}

이 문서는 새 원문, 공개항목, 현장 관찰, 공공계획, 시장 데이터가 들어왔을 때 어느 사업별 가설과 산출물을 갱신해야 하는지 연결한다. 업데이트를 발견하면 먼저 이 장부에서 사업장을 찾고, 입력 파일을 갱신한 뒤 재생성 명령을 실행한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 업데이트 workflow | ${summary.workflow_count} |
| 고영향 사업장 | ${summary.high_priority_count} |
| completion 병목 연결 | ${summary.completion_linked_count} |

## 분포

| 구분 | 값 |
| --- | --- |
| 가설 상태 | ${summary.status_mix} |
| 추천 런북 | ${summary.runbook_mix} |

## 신호 유형별 처리법

${mdTable(workflowRowsData, [
    { key: "signal_type", label: "신호" },
    { key: "when_to_use", label: "언제 쓰나" },
    { key: "runbook_id", label: "런북" },
    { key: "intake_file", label: "입력" },
    { key: "first_outputs", label: "먼저 읽을 산출물" },
    { key: "decision_rule", label: "판정 규칙" },
  ])}

## 우선 반영 Top 15

${mdTable(topRows, fields)}

## Goal 완료 병목 연결

${mdTable(completionRows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "completion_task", label: "Task" },
    { key: "intake_file", label: "입력" },
    { key: "first_triage_files", label: "먼저 볼 파일" },
    { key: "decision_gate", label: "완료 gate" },
  ])}

## 전체 사업장 영향 장부

${mdTable(projectRows, [
    ...fields,
    { key: "first_triage_files", label: "먼저 볼 파일" },
    { key: "affected_outputs", label: "영향 산출물" },
    { key: "regenerate_command", label: "재생성" },
  ])}

## 운영 원칙

- 공식 원문 신호는 먼저 입력 파일 또는 decision 로그에 남기고, 자동으로 확정값으로 승격하지 않는다.
- 현장 관찰과 시장 데이터는 공식 단계 판정 근거가 아니라 가설·리스크·입지 확신도 보정에 쓴다.
- 업데이트 반영 후에는 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/research-goal-completion-audit.md\`의 최종 판정을 확인한다.
`;
}

async function main() {
  const [hypothesisData, fieldworkData, completionData, runbookData] = await Promise.all([
    readJson(INPUTS.hypothesisLedger),
    readJson(INPUTS.fieldworkNotebook),
    readJson(INPUTS.completionCockpit),
    readJson(INPUTS.runbookChecklist),
  ]);
  const runbooks = runbookById(runbookData);
  const workflowRowsData = workflowRows(runbooks);
  const projectRows = buildProjectRows({
    hypotheses: rowsFrom(hypothesisData),
    fieldworkByRank: byRank(rowsFrom(fieldworkData)),
    completionByRankMap: completionByRank(rowsFrom(completionData)),
    runbooks,
  });
  const summary = summarize(projectRows, workflowRowsData);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(projectRows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, workflow_rows: workflowRowsData, project_rows: projectRows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, projectRows, workflowRowsData));
  console.log(JSON.stringify({ rows: projectRows.length, workflows: workflowRowsData.length, output: "analysis/update-impact-ledger.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
