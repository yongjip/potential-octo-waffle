#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-submission-approval-board.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-submission-approval-board.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-submission-approval-board.json");

const OUTBOX_INPUT = "data/review/high-blocking-filing-outbox/manifest.json";
const CHECKLIST_INPUT = "analysis/high-blocking-filing-checklist.json";
const SEARCH_RERUN_INPUT = "analysis/high-blocking-official-search-rerun.json";
const INTAKE_INPUT = "data/review/high-blocking-source-response-intake.json";

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
  return new Map(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function approvalQuestion(row) {
  if (String(row.rank) === "9") {
    return "송파구/정보공개 경로로 관리처분계획인가 별첨 또는 공개 가능한 공사비·정비사업비 기준자료 요청을 접수해도 되는가?";
  }
  return "광진구/정보공개 경로로 조합설립인가 고시문, 고시번호, 고시일, 원문/첨부 URL 요청을 접수해도 되는가?";
}

function buildRows({ outboxRows, checklistRows, searchRows, intakeRows }) {
  const checklistByRank = byRank(checklistRows);
  const searchByRank = byRank(searchRows);
  const intakeByRank = byRank(intakeRows);

  return outboxRows
    .map((outbox) => {
      const rank = String(outbox.rank || "");
      const checklist = checklistByRank.get(rank) || {};
      const checklistStatus = String(checklist.checklist_status || "");
      if (checklistStatus && checklistStatus !== "ready_to_submit") return null;
      const search = searchByRank.get(rank) || {};
      const intake = intakeByRank.get(rank) || {};
      const outboxFile = `data/review/high-blocking-filing-outbox/${outbox.file}`;
      return {
        rank,
        project_name: outbox.project_name,
        district: outbox.district,
        current_stage: outbox.current_stage,
        approval_status: "needs_user_approval_before_external_submission",
        filing_channel: outbox.filing_channel,
        filing_url: outbox.filing_url,
        outbox_file: outboxFile,
        remaining_gap: outbox.remaining_gap || checklist.remaining_gap || search.remaining_gap || "",
        official_search_result: search.conclusion || "",
        official_probe_status: search.official_probe_status || "",
        current_intake_status: intake.filing_status || intake.response_status || "",
        approval_question: approvalQuestion(outbox),
        after_submission_record: "filed_at; filing_channel; filing_url; filing_receipt_no; filing_status=filed_waiting_response",
        after_submission_command: `node scripts/mark-high-blocking-filed.mjs --rank=${rank} --filed-at=YYYY-MM-DD --receipt=접수번호 --write`,
        response_gate: checklist.promotion_rule || checklist.value_promotion_rule || "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.rank) - Number(b.rank));
}

function markdown({ summary, rows }) {
  return `# High Blocking 제출 승인 보드

작성 기준: ${UPDATED_AT}

이 문서는 공개 검색으로 닫히지 않은 3개 high blocking 병목을 실제 담당부서 문의 또는 정보공개청구로 넘기기 전에, 사용자가 제출 범위와 접수 후 기록 방식을 한 화면에서 승인할 수 있게 만든 보드다. 이 산출물은 외부 제출을 수행하지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 승인 필요 제출 | ${summary.needs_approval_count} |
| 광진구 대상 | ${summary.gwangjin_count} |
| 송파구 대상 | ${summary.songpa_count} |
| 현재 no_response | ${summary.no_response_count} |
| 공식 공개 검색 소진 | ${summary.official_search_exhausted_count} |

## 승인 대상

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "district", label: "관할" },
  { key: "current_stage", label: "단계" },
  { key: "filing_channel", label: "우선 채널" },
  { key: "remaining_gap", label: "요청할 공백" },
  { key: "official_search_result", label: "공개 검색 판정" },
  { key: "current_intake_status", label: "현재 회신" },
  { key: "outbox_file", label: "제출 본문" },
])}

## 승인 질문

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "approval_question", label: "승인 질문" },
  { key: "approval_status", label: "상태" },
])}

## 접수 후 기록

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "after_submission_record", label: "접수 직후 intake 기록" },
  { key: "after_submission_command", label: "접수 직후 명령" },
  { key: "response_gate", label: "회신 후 승격 gate" },
])}

## 운영 원칙

1. 외부 제출은 사용자 승인 전에는 하지 않는다.
2. 제출 후 접수번호가 생기면 \`node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write\`로 접수 필드를 먼저 기록한다. 접수번호가 없으면 \`--note=...\`를 사용한다.
3. 회신이 오면 원문 URL, 고시번호, 고시일, 첨부명, 기준일, 공개/비공개 사유 중 확인된 사실만 입력한다.
4. 입력 후 \`node scripts/process-high-blocking-response-workflow.mjs\`로 dry-run하고, append 가능한 decision을 검수한 뒤에만 \`--write\`를 실행한다.
`;
}

async function main() {
  const outbox = await readJson(OUTBOX_INPUT);
  const checklist = await readJson(CHECKLIST_INPUT);
  const searchRerun = await readJson(SEARCH_RERUN_INPUT);
  const intakeRows = await readJson(INTAKE_INPUT);

  const rows = buildRows({
    outboxRows: outbox.rows || [],
    checklistRows: checklist.rows || [],
    searchRows: searchRerun.rows || [],
    intakeRows,
  });

  const summary = {
    generated_at: UPDATED_AT,
    needs_approval_count: rows.filter((row) => row.approval_status === "needs_user_approval_before_external_submission").length,
    gwangjin_count: rows.filter((row) => row.district === "광진구").length,
    songpa_count: rows.filter((row) => row.district === "송파구").length,
    no_response_count: rows.filter((row) => row.current_intake_status === "no_response").length,
    official_search_exhausted_count: rows.filter((row) => row.official_search_result.includes("회신") || row.official_search_result.includes("정보공개")).length,
    inputs: [OUTBOX_INPUT, CHECKLIST_INPUT, SEARCH_RERUN_INPUT, INTAKE_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown({ summary, rows }));
  console.log(JSON.stringify({ rows: rows.length, output: "analysis/high-blocking-submission-approval-board.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
