#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-filing-checklist.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-filing-checklist.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-filing-checklist.json");

const TRACKER_INPUT = "analysis/high-blocking-filing-tracker.json";
const VALIDATION_INPUT = "analysis/high-blocking-intake-validation.json";
const OUTBOX_INPUT = "data/review/high-blocking-filing-outbox/manifest.json";
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
  return new Map((rows || []).map((row) => [String(row.rank), row]));
}

function checklistFor(row, outboxRow) {
  const file = outboxRow?.file || "";
  const packetPath = file ? `data/review/high-blocking-filing-outbox/${file}` : "";
  const isReady = ["ready_to_file", "ready_to_file_or_mark_filed"].includes(row.filing_status);
  const isFiled = row.filing_status === "filed_waiting_response";
  const needsResponseValidation = ["response_received_validate", "response_needs_intake_fix"].includes(row.filing_status);
  const readyToAppend = row.filing_status === "response_ready_to_append";

  let checklist_status = "ready_to_submit";
  if (readyToAppend) checklist_status = "decision_append_review";
  else if (needsResponseValidation) checklist_status = "response_intake_review";
  else if (isFiled) checklist_status = "waiting_for_response";
  else if (!isReady) checklist_status = "check_tracker_status";

  const markFiledCommand = isReady
    ? `node scripts/mark-high-blocking-filed.mjs --rank=${row.rank} --filed-at=YYYY-MM-DD --receipt=접수번호 --write`
    : "";

  let next_step = "outbox 본문으로 담당부서 문의 또는 정보공개청구 접수 후 mark-high-blocking-filed helper로 intake 기록";
  if (readyToAppend) next_step = "decision 초안 검수 후 workflow --write 반영";
  else if (needsResponseValidation) next_step = "회신 증거 URL/파일·자료명·확인값을 intake에 보완";
  else if (isFiled) next_step = "회신 도착 시 response_status와 증거값 입력";

  return {
    rank: row.rank,
    project_name: row.project_name,
    district: row.district,
    current_stage: row.current_stage,
    checklist_status,
    filing_status: row.filing_status,
    response_status: row.response_status,
    primary_channel: row.filing_channel,
    filing_url: row.filing_url,
    outbox_file: packetPath,
    remaining_gap: row.remaining_gap,
    pre_submit_check: "사업명·단계·요청자료·비공개/부분공개 요청문구 확인",
    submit_record_fields: "filing_status=filed_waiting_response; filed_at; filing_channel; filing_url; filing_receipt_no; filing_note",
    mark_filed_command: markFiledCommand,
    response_record_fields: row.intake_fields_to_fill || "response_status; response_received_at; responder; evidence_files; response_note",
    promotion_rule: row.promotion_rule,
    dry_run_command: "node scripts/process-high-blocking-response-workflow.mjs",
    write_command: "node scripts/process-high-blocking-response-workflow.mjs --write",
    final_regeneration_command: "node scripts/regenerate-research-artifacts.mjs",
    next_step,
  };
}

function markdown(summary, rows) {
  return `# High Blocking Filing Checklist

작성 기준: ${UPDATED_AT}

이 문서는 high blocking 3개 사업장을 실제 접수 전후에 닫기 위한 체크리스트다. 외부 제출은 자동으로 하지 않으며, 접수·회신 결과는 \`${INTAKE_INPUT}\`에 기록한 뒤 dry-run으로 검증한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 접수 준비 | ${summary.ready_to_submit_count} |
| 회신 대기 | ${summary.waiting_for_response_count} |
| 회신 검증 필요 | ${summary.response_review_count} |
| decision 검수 가능 | ${summary.decision_review_count} |
| intake 오류 | ${summary.validation_error_count} |
| intake 경고 | ${summary.validation_warning_count} |

## 실행 순서

1. 아래 표에서 \`checklist_status=ready_to_submit\` 사업장을 고른다.
2. \`outbox_file\`의 제목·본문을 열고 사업명, 단계, 요청자료, 부분공개/비공개 요청 문구를 확인한다.
3. 담당부서 문의 또는 정보공개청구를 접수한다. 이 작업은 자동화하지 않는다.
4. 접수 직후 \`node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write\` 또는 접수번호가 없으면 \`--note=...\`로 \`${INTAKE_INPUT}\`를 갱신한다.
5. 회신이 오면 가능하면 \`node scripts/record-high-blocking-response.mjs\`로 \`response_status\`, 증거 URL/파일, 확인값, 자료명, 보유부서, 부분공개/비공개 사유를 기록한다.
6. \`node scripts/process-high-blocking-response-workflow.mjs\`로 dry-run한다.
7. append 가능한 decision이 의도와 맞을 때만 \`node scripts/process-high-blocking-response-workflow.mjs --write\`를 실행한다.

## 사업장별 체크리스트

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "checklist_status", label: "체크상태" },
  { key: "primary_channel", label: "우선채널" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "outbox_file", label: "제출 파일" },
  { key: "next_step", label: "다음 단계" },
])}

## 접수 직후 기록 명령 예시

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "mark_filed_command", label: "기록 명령" },
])}

## Intake 기록 필드

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "submit_record_fields", label: "접수 직후 필드" },
  { key: "response_record_fields", label: "회신 후 필드" },
  { key: "promotion_rule", label: "승격 규칙" },
])}

주의: 공식 요약값이나 전화 메모만으로 비교표 확정값을 덮어쓰지 않는다. 고시번호·고시일·원문 URL·자료명·기준일·증거파일 중 확인된 범위에 맞춰 confirmed, partial, unavailable, info_disclosure_required 중 하나로만 판정한다.
`;
}

async function main() {
  const tracker = await readJson(TRACKER_INPUT);
  const validation = await readJson(VALIDATION_INPUT);
  const outbox = await readJson(OUTBOX_INPUT);
  const outboxByRank = byRank(outbox.rows || []);
  const rows = (tracker.rows || []).map((row) => checklistFor(row, outboxByRank.get(String(row.rank))));
  const summary = {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    ready_to_submit_count: rows.filter((row) => row.checklist_status === "ready_to_submit").length,
    waiting_for_response_count: rows.filter((row) => row.checklist_status === "waiting_for_response").length,
    response_review_count: rows.filter((row) => row.checklist_status === "response_intake_review").length,
    decision_review_count: rows.filter((row) => row.checklist_status === "decision_append_review").length,
    validation_error_count: Number(validation.summary?.error_count || 0),
    validation_warning_count: Number(validation.summary?.warning_count || 0),
    inputs: [TRACKER_INPUT, VALIDATION_INPUT, OUTBOX_INPUT, INTAKE_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ rows: rows.length, readyToSubmit: summary.ready_to_submit_count, output: "analysis/high-blocking-filing-checklist.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
