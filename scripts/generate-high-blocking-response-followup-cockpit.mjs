#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-response-followup-cockpit.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-response-followup-cockpit.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-response-followup-cockpit.json");

const INPUTS = {
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  filingChecklist: "analysis/high-blocking-filing-checklist.json",
  responseGuide: "analysis/high-blocking-response-intake-guide.json",
  decisionDrafts: "analysis/high-blocking-response-decision-drafts.json",
  workflowRun: "analysis/high-blocking-response-workflow-run.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
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

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank), row]));
}

function recordCommand(row) {
  if (String(row.rank) === "9") {
    return `node scripts/record-high-blocking-response.mjs --rank=${row.rank} --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='송파구 담당부서' --attachment-name='자료명' --evidence=https://... --response-note='회신 요약' --write`;
  }
  return `node scripts/record-high-blocking-response.mjs --rank=${row.rank} --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write`;
}

function dueBucket(row) {
  const days = Number(row.next_check_in_days);
  if (Number.isNaN(days)) return "date_missing";
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 3) return "next_3_days";
  if (days <= 7) return "next_7_days";
  return "later";
}

function priorityScore(row) {
  const days = Number(row.next_check_in_days);
  const due = Number.isNaN(days) ? 0 : Math.max(0, 10 - days);
  const overdue = !Number.isNaN(days) && days < 0 ? 15 : 0;
  const rankBoost = String(row.rank) === "9" ? 4 : 0;
  return 100 + overdue + due + rankBoost;
}

function buildRows({ filingRows, checklistRows, guideRows }) {
  const checklistByRank = byRank(checklistRows);
  const guideByRank = byRank(guideRows);
  return (filingRows || [])
    .map((row) => {
      const checklist = checklistByRank.get(String(row.rank)) || {};
      const guide = guideByRank.get(String(row.rank)) || {};
      return {
        followup_priority_score: priorityScore(row),
        due_bucket: dueBucket(row),
        rank: row.rank,
        project_name: row.project_name,
        filing_channel: row.filing_channel,
        filing_receipt_no: row.filing_receipt_no,
        next_check_date: row.next_check_date,
        next_check_in_days: row.next_check_in_days,
        next_check_note: row.next_check_note,
        remaining_gap: row.remaining_gap,
        response_status: row.response_status,
        draft_status: row.draft_status,
        promotion_rule: row.promotion_rule,
        filing_url: row.filing_url,
        response_record_fields: checklist.response_record_fields || "",
        response_capture_command: recordCommand(row),
        workflow_dry_run: checklist.dry_run_command || "node scripts/process-high-blocking-response-workflow.mjs",
        workflow_write: checklist.write_command || "node scripts/process-high-blocking-response-workflow.mjs --write",
        final_regeneration: checklist.final_regeneration_command || "node scripts/regenerate-research-artifacts.mjs",
        intake_status_rule: guide.input_rule || guide.input_criteria || "",
        next_action: row.next_action,
      };
    })
    .sort((a, b) => Number(b.followup_priority_score || 0) - Number(a.followup_priority_score || 0) || Number(a.rank) - Number(b.rank));
}

function summarize(rows, decisionDrafts, workflowRun, completionCockpit) {
  const waiting = rows.filter((row) => row.response_status === "no_response").length;
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    waiting_response_count: waiting,
    due_within_7_days_count: rows.filter((row) => ["today", "next_3_days", "next_7_days"].includes(row.due_bucket)).length,
    overdue_count: rows.filter((row) => row.due_bucket === "overdue").length,
    ready_to_append_count: Number(decisionDrafts.summary?.ready_to_append || 0),
    workflow_status: workflowRun.status || "",
    workflow_appendable: Number(workflowRun.appendable_decisions || 0),
    completion_p0_count: Number(completionCockpit.summary?.p0_count || 0),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# High Blocking 회신 후속 콕핏

작성 기준: ${summary.generated_at}

이 문서는 외부 회신 대기 3건을 다음 점검일 기준으로 다시 여는 실행판이다. 어디를 먼저 확인할지, 회신이 오면 어떤 helper와 workflow를 바로 돌릴지 한 화면에 묶는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 회신 대기 사업장 | ${summary.project_count} |
| 아직 no_response | ${summary.waiting_response_count} |
| 7일 내 점검 | ${summary.due_within_7_days_count} |
| 점검일 경과 | ${summary.overdue_count} |
| append 가능 decision | ${summary.ready_to_append_count} |
| workflow 상태 | ${summary.workflow_status || "미실행"} |
| workflow appendable | ${summary.workflow_appendable} |
| completion cockpit P0 | ${summary.completion_p0_count} |

## 이번 점검 순서

${mdTable(rows, [
    { key: "followup_priority_score", label: "우선점수" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "next_check_date", label: "다음 점검일" },
    { key: "next_check_note", label: "점검 포인트" },
    { key: "remaining_gap", label: "남은 공백" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 회신 도착 시 바로 실행

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "response_capture_command", label: "회신 기록 helper" },
    { key: "workflow_dry_run", label: "dry-run" },
    { key: "workflow_write", label: "write" },
    { key: "final_regeneration", label: "최종 재생성" },
  ])}

## 채널별 확인 위치

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "filing_channel", label: "접수 채널" },
    { key: "filing_receipt_no", label: "접수번호" },
    { key: "filing_url", label: "조회 URL" },
    { key: "response_record_fields", label: "회신 후 필드" },
  ])}

## 운영 메모

- 회신이 와도 확인된 범위만 기록한다. 고시번호, 고시일, 원문 URL, 첨부명, 자료명, 기준일 없는 값은 확정으로 올리지 않는다.
- 회신 기록 후에는 항상 \`node scripts/process-high-blocking-response-workflow.mjs\` dry-run을 먼저 본다.
- \`ready_to_append\`가 떠도 decision 내용이 맞는지 보고 \`--write\`를 실행한다.
`;
}

async function main() {
  const [filingTracker, filingChecklist, responseGuide, decisionDrafts, workflowRun, completionCockpit] = await Promise.all([
    readJson(INPUTS.filingTracker),
    readJson(INPUTS.filingChecklist),
    readJson(INPUTS.responseGuide),
    readJson(INPUTS.decisionDrafts),
    readJson(INPUTS.workflowRun),
    readJson(INPUTS.completionCockpit),
  ]);

  const rows = buildRows({
    filingRows: filingTracker.rows || [],
    checklistRows: filingChecklist.rows || [],
    guideRows: responseGuide.rows || [],
  });
  const summary = summarize(rows, decisionDrafts, workflowRun, completionCockpit);
  const payload = { summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);
  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
