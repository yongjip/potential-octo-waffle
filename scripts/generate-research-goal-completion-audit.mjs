#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-goal-completion-audit.md");
const OUT_CSV = path.join(OUT_DIR, "research-goal-completion-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "research-goal-completion-audit.json");

const INPUTS = {
  readiness: "analysis/research-system-readiness-audit.json",
  completion: "analysis/research-completion-cockpit.json",
  filingOutbox: "data/review/high-blocking-filing-outbox/manifest.json",
  intakeValidation: "analysis/high-blocking-intake-validation.json",
  hwpAudit: "analysis/hwp-conversion-audit.json",
  marketNormalization: "analysis/market-manual-normalization-audit.json",
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

function relatedTasks(requirementId, completionRows) {
  if (requirementId === "source_value_verification") {
    return completionRows.filter((row) => row.blocker_area === "source_value_verification");
  }
  if (requirementId === "market_data_collection") {
    return completionRows.filter((row) => row.blocker_area === "market_data_collection");
  }
  if (requirementId === "completion_boundary") {
    return completionRows.filter((row) => row.blocker_area === "completion_boundary");
  }
  return [];
}

function gateStatus(row, tasks) {
  if (["active_verification_needed", "planned_blocked_by_api_key"].includes(row.readiness_status)) return "not_complete";
  if (tasks.some((task) => task.priority === "P0")) return "blocked_by_p0_task";
  if (tasks.length) return "complete_with_tracked_followup";
  return "evidence_sufficient_for_current_scope";
}

function proofNeeded(row, tasks) {
  if (tasks.length) {
    return tasks.map((task) => `${task.task_id}: ${task.completion_gate}`).join("; ");
  }
  if (row.readiness_status === "ready") return "현재 evidence_summary와 current_evidence_files가 요구사항 범위를 직접 커버";
  if (row.readiness_status === "substantially_ready") return "남은 저신뢰 근거가 비교표 사용을 막지 않는지 추가 확인";
  if (row.readiness_status === "ready_with_uncertainty_flags") return "불확실성/확신도 주석을 유지하고 신규 업데이트 시 재평가";
  if (row.readiness_status === "operator_ready") return "체크리스트 단계가 최신 원격 수집 범위를 계속 커버";
  return row.remaining_gap || "추가 증거 필요";
}

function buildRows(readinessRows, completionRows) {
  return readinessRows.map((row) => {
    const tasks = relatedTasks(row.requirement_id, completionRows);
    return {
      requirement_id: row.requirement_id,
      requirement: row.requirement,
      readiness_status: row.readiness_status,
      gate_status: gateStatus(row, tasks),
      priority: row.priority,
      current_evidence: row.evidence_summary,
      evidence_files: row.current_evidence_files,
      proof_needed_to_close: proofNeeded(row, tasks),
      remaining_gap: row.remaining_gap,
      related_completion_tasks: tasks.map((task) => `${task.task_id}:${task.status}`).join("; "),
      next_action: row.next_action,
    };
  });
}

function holdReasons(summary) {
  if (summary.final_verdict === "complete") return ["모든 요구사항의 completion gate가 충족됨"];
  const reasons = [];
  if (summary.high_blocking_outbox_count > 0 || summary.intake_error_count > 0) {
    reasons.push("외부 회신/정보공개 결과가 필요한 high-blocking 원문 병목이 남아 있음");
  }
  if (summary.not_complete_count > 0) {
    reasons.push("readiness audit의 active_verification_needed 요구사항이 남아 있음");
  }
  if (summary.p0_task_count > 0) {
    reasons.push("completion cockpit의 P0 task가 남아 있음");
  }
  return reasons.length ? reasons : ["완료 전 추가 검증이 필요함"];
}

function markdown({ summary, rows, p0Tasks, outboxRows }) {
  return `# Research Goal Completion Audit

작성 기준: ${UPDATED_AT}

이 문서는 active goal을 완료로 선언할 수 있는지 요구사항별로 감사한다. 목표 범위는 강남·잠실/송파·구의/광진 핵심 생활권과 강동권·약수동 주변 확장 관심권의 서울 재개발·재건축/도시계획 변화를 공식 원문 기반으로 조사하고, 진행단계·교통입지·리스크·장기 가능성을 비교할 수 있는 리서치 체계 구축이다.

## 판정

| 항목 | 값 |
| --- | --- |
| 최종 판정 | ${summary.final_verdict} |
| 요구사항 | ${summary.requirement_count} |
| 사용 가능 계열 | ${summary.ready_like_count} |
| 완료 보류 | ${summary.not_complete_count} |
| P0 completion task | ${summary.p0_task_count} |
| high-blocking 제출 준비 | ${summary.high_blocking_outbox_count} |
| intake validation error/warning | ${summary.intake_error_count} / ${summary.intake_warning_count} |

## 완료 보류 이유

${holdReasons(summary).map((reason) => `- ${reason}`).join("\n")}

## P0 Critical Path

${mdTable(p0Tasks, [
  { key: "task_id", label: "Task" },
  { key: "status", label: "상태" },
  { key: "required_evidence", label: "필수 증거" },
  { key: "source_file", label: "열 파일" },
  { key: "completion_gate", label: "완료 gate" },
])}

## 요구사항별 Gate

${mdTable(rows, [
  { key: "requirement_id", label: "ID" },
  { key: "gate_status", label: "Gate" },
  { key: "priority", label: "우선순위" },
  { key: "current_evidence", label: "현재 증거" },
  { key: "proof_needed_to_close", label: "완료 증거" },
  { key: "next_action", label: "다음 액션" },
])}

## High Blocking 제출 준비 파일

${mdTable(outboxRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "filing_status", label: "접수상태" },
  { key: "file", label: "파일" },
])}
`;
}

async function main() {
  const data = Object.fromEntries(await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])));
  const readinessSummary = data.readiness.summary || {};
  const completionSummary = data.completion.summary || {};
  const completionRows = data.completion.rows || [];
  const rows = buildRows(data.readiness.rows || [], completionRows);
  const p0Tasks = completionRows.filter((row) => row.priority === "P0");
  const outboxRows = data.filingOutbox.rows || [];
  const finalVerdict =
    Number(readinessSummary.not_complete_count || 0) === 0 && Number(completionSummary.p0_count || 0) === 0
      ? "complete"
      : "not_complete";
  const summary = {
    generated_at: UPDATED_AT,
    final_verdict: finalVerdict,
    requirement_count: rows.length,
    ready_like_count: rows.filter((row) =>
      ["evidence_sufficient_for_current_scope", "complete_with_tracked_followup"].includes(row.gate_status),
    ).length,
    not_complete_count: rows.filter((row) => row.gate_status === "not_complete" || row.gate_status === "blocked_by_p0_task").length,
    p0_task_count: Number(completionSummary.p0_count || 0),
    p1_task_count: Number(completionSummary.p1_count || 0),
    high_blocking_outbox_count: Number(data.filingOutbox.summary?.packet_count || 0),
    intake_error_count: Number(data.intakeValidation.summary?.error_count || 0),
    intake_warning_count: Number(data.intakeValidation.summary?.warning_count || 0),
    hwp_rows: Array.isArray(data.hwpAudit) ? data.hwpAudit.length : 0,
    normalized_transactions: Number(data.marketNormalization.summary?.normalized_transactions || 0),
    normalized_indicators: Number(data.marketNormalization.summary?.normalized_indicators || 0),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows, p0_tasks: p0Tasks, outbox_rows: outboxRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown({ summary, rows, p0Tasks, outboxRows }));
  console.log(JSON.stringify({ verdict: summary.final_verdict, requirements: rows.length, p0Tasks: summary.p0_task_count, output: "analysis/research-goal-completion-audit.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
