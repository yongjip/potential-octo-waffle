#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-filing-tracker.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-filing-tracker.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-filing-tracker.json");

const INFO_PACKET_INPUT = "analysis/high-blocking-info-disclosure-packet.json";
const RESPONSE_DRAFTS_INPUT = "analysis/high-blocking-response-decision-drafts.json";
const RESPONSE_INTAKE_INPUT = "data/review/high-blocking-source-response-intake.json";
const TODAY = kstDate();

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

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function compact(value, limit = 1000) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function diffDays(fromDate, toDate) {
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function waitingTimingStatus(intake, filingStatus) {
  if (filingStatus !== "filed_waiting_response") return "";
  const nextCheck = String(intake?.next_check_date || "");
  const expectedResponseBy = String(intake?.expected_response_by || "");

  const nextCheckDiff = diffDays(TODAY, nextCheck);
  const expectedDiff = diffDays(TODAY, expectedResponseBy);

  if (expectedDiff !== null && expectedDiff < 0) return "response_overdue";
  if (nextCheckDiff !== null && nextCheckDiff < 0) return "follow_up_due";
  if (expectedDiff !== null && expectedDiff <= 3) return "response_due_soon";
  if (nextCheckDiff !== null && nextCheckDiff <= 2) return "follow_up_soon";
  return "waiting";
}

function optionalFilingStatus(intake) {
  return intake?.filing_status || "";
}

function inferredFilingStatus(intake, draft) {
  const filingStatus = optionalFilingStatus(intake);
  if (filingStatus === "closed") return filingStatus;
  if (draft?.draft_status === "ready_to_append") return "response_ready_to_append";
  if (draft?.draft_status === "needs_intake_fix") return "response_needs_intake_fix";
  if (intake?.response_status && intake.response_status !== "no_response") return "response_received_validate";
  if (filingStatus) return filingStatus;
  if (intake?.filing_receipt_no || intake?.filed_at) return "filed_waiting_response";
  return "ready_to_file_or_mark_filed";
}

function isReadyToFileStatus(status) {
  return ["ready_to_file", "ready_to_file_or_mark_filed"].includes(status);
}

function actionFor(row, intake, draft) {
  const status = inferredFilingStatus(intake, draft);
  const waitStatus = waitingTimingStatus(intake, status);
  if (status === "response_ready_to_append") {
    return "decision 초안을 검수한 뒤 process-high-blocking-response-workflow dry-run 및 --write 반영";
  }
  if (status === "response_needs_intake_fix") {
    return "회신 intake의 validation_issues를 보완한 뒤 decision draft 재생성";
  }
  if (status === "response_received_validate") {
    return "record-high-blocking-response helper 또는 intake 보강 후 decision draft 재생성";
  }
  if (status === "filed_waiting_response") {
    if (waitStatus === "response_overdue") {
      return "처리기한 경과 여부와 회신 누락을 먼저 확인하고, 없으면 담당 채널에 상태 재확인 후 intake last_checked_at 갱신";
    }
    if (waitStatus === "follow_up_due") {
      return "나의민원조회/민원조회에서 처리상태와 보완요구 여부를 먼저 확인하고 intake last_checked_at·next_check_date를 갱신";
    }
    return "접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록";
  }
  return `${row.primary_channel || "관할 부서"} 문의 또는 정보공개청구 접수 후 mark-high-blocking-filed helper로 접수일/접수번호 기록`;
}

function buildRows({ packetRows, draftRows, intakeRows }) {
  const drafts = byRank(draftRows);
  const intakes = byRank(intakeRows);
  return packetRows.map((row) => {
    const draft = drafts.get(String(row.rank)) || {};
    const intake = intakes.get(String(row.rank)) || {};
    const filingStatus = inferredFilingStatus(intake, draft);
    const waitTimingStatus = waitingTimingStatus(intake, filingStatus);
    const filingAgeDays = diffDays(intake.filed_at, TODAY);
    const nextCheckInDays = diffDays(TODAY, intake.next_check_date);
    const responseDueInDays = diffDays(TODAY, intake.expected_response_by);
    return {
      rank: row.rank,
      project_name: row.project_name,
      district: row.district,
      current_stage: row.current_stage,
      filing_status: filingStatus,
      response_status: intake.response_status || row.response_status || "missing",
      draft_status: draft.draft_status || "",
      filing_channel: intake.filing_channel || row.primary_channel || "",
      filing_url: intake.filing_url || row.primary_channel_url || "",
      filing_channel_hint: row.primary_channel_hint || "",
      filing_channel_evidence: row.primary_channel_evidence || "",
      filed_at: intake.filed_at || "",
      filing_age_days: filingAgeDays ?? "",
      filing_receipt_no: intake.filing_receipt_no || "",
      filing_note: intake.filing_note || "",
      expected_response_by: intake.expected_response_by || "",
      response_due_in_days: responseDueInDays ?? "",
      next_check_date: intake.next_check_date || "",
      next_check_in_days: nextCheckInDays ?? "",
      next_check_note: intake.next_check_note || "",
      last_checked_at: intake.last_checked_at || "",
      wait_timing_status: waitTimingStatus,
      remaining_gap: row.remaining_gap,
      filing_title: row.disclosure_title,
      intake_fields_to_fill: row.intake_fields_to_fill,
      next_action: actionFor(row, intake, draft),
      validation_issues: draft.validation_issues || "",
      promotion_rule: row.response_promotion_rule,
      response_intake_file: RESPONSE_INTAKE_INPUT,
      disclosure_packet_file: "analysis/high-blocking-info-disclosure-packet.md",
      decision_draft_command: row.decision_draft_command || "node scripts/process-high-blocking-response-workflow.mjs",
      apply_decision_command: "node scripts/process-high-blocking-response-workflow.mjs && node scripts/process-high-blocking-response-workflow.mjs --write",
      regenerate_command: row.regenerate_command || "node scripts/regenerate-research-artifacts.mjs",
      disclosure_body: row.disclosure_body,
    };
  });
}

function markdown(summary, rows) {
  return `# High Blocking 접수/회신 Tracker

작성 기준: ${UPDATED_AT}

이 문서는 high blocking 3개 사업장의 정보공개청구/공식 민원 접수 상태와 회신 반영 절차를 추적한다. 청구 본문 원문은 \`analysis/high-blocking-info-disclosure-packet.md\`에 있고, 이 파일은 접수 여부, 회신 intake, decision 승격 가능 여부만 운영 관점으로 압축한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 접수 또는 접수표시 필요 | ${summary.ready_to_file_count} |
| 접수 후 회신 대기 | ${summary.filed_waiting_count} |
| 후속 점검 필요 | ${summary.follow_up_due_count} |
| 처리기한 임박/경과 | ${summary.response_due_attention_count} |
| 회신 검증 필요 | ${summary.response_validation_count} |
| decision append 가능 | ${summary.ready_to_append_count} |
| 상태 분포 | ${summary.status_summary} |

## 오늘 볼 순서

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "filing_status", label: "접수상태" },
  { key: "response_status", label: "회신상태" },
  { key: "filing_channel", label: "우선채널" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "next_action", label: "다음 액션" },
])}

## Intake에 추가로 적어두면 좋은 접수 필드

\`data/review/high-blocking-source-response-intake.json\`의 기존 스키마를 깨지 않고 아래 선택 필드를 행별로 추가할 수 있다.

| 필드 | 용도 |
| --- | --- |
| filing_status | ready_to_file, filed_waiting_response, response_received_validate 등 접수 운영 상태 |
| filed_at | 정보공개청구/공식 민원 접수일 |
| filing_channel | 실제 접수 또는 문의한 채널 |
| filing_url | 접수 또는 문의 URL |
| filing_receipt_no | 접수번호 |
| filing_note | 통화/문의/접수 과정 메모 |
| expected_response_by | 회신 예정일 또는 처리기한 |
| next_check_date | 다음으로 상태를 다시 확인할 날짜 |
| next_check_note | 다음 점검 때 확인할 포인트 |
| last_checked_at | 마지막으로 민원 상태를 확인한 날짜 |

## 회신 후 처리

1. 회신에서 원문 URL, 고시번호, 고시일, 자료명, 보유부서, 부분공개/비공개 사유 중 확인된 값을 가능하면 \`node scripts/record-high-blocking-response.mjs\`로 먼저 반영한다.
2. \`node scripts/process-high-blocking-response-workflow.mjs\`로 intake validation, decision draft, apply dry-run을 한 번에 확인한다.
3. \`draft_status=ready_to_append\`이고 workflow 로그가 예상과 맞을 때만 \`node scripts/process-high-blocking-response-workflow.mjs --write\`로 반영한다.
4. \`--write\` 실행은 전체 산출물 재생성까지 이어지며, 마지막에 completion audit을 확인한다.

## 접수 문안 바로가기

${rows
  .map(
    (row) => `### ${row.rank}. ${row.project_name}

| 항목 | 내용 |
| --- | --- |
| 접수상태 | ${row.filing_status} |
| 대기상태 | ${row.wait_timing_status || "n/a"} |
| 우선채널 | ${row.filing_channel} |
| URL | ${row.filing_url} |
| 접수일/번호 | ${row.filed_at || "미기록"} / ${row.filing_receipt_no || "미기록"} |
| 처리기한/다음점검 | ${row.expected_response_by || "미기록"} / ${row.next_check_date || "미기록"} |
| 회신 입력 | ${row.response_intake_file} |
| 승격 규칙 | ${row.promotion_rule} |

제목:

\`\`\`text
${row.filing_title}
\`\`\`

본문:

\`\`\`text
${row.disclosure_body}
\`\`\`
`,
  )
  .join("\n")}
`;
}

async function main() {
  const infoPacket = await readJson(INFO_PACKET_INPUT);
  const responseDrafts = await readJson(RESPONSE_DRAFTS_INPUT);
  const intakeRows = await readJson(RESPONSE_INTAKE_INPUT);
  const rows = buildRows({
    packetRows: infoPacket.rows || [],
    draftRows: responseDrafts.rows || [],
    intakeRows,
  });
  const statusCounts = countBy(rows, "filing_status");
  const summary = {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    ready_to_file_count: rows.filter((row) => isReadyToFileStatus(row.filing_status)).length,
    filed_waiting_count: rows.filter((row) => row.filing_status === "filed_waiting_response").length,
    follow_up_due_count: rows.filter((row) => row.wait_timing_status === "follow_up_due").length,
    response_due_attention_count: rows.filter((row) =>
      ["response_due_soon", "response_overdue"].includes(row.wait_timing_status),
    ).length,
    response_validation_count: rows.filter((row) =>
      ["response_received_validate", "response_needs_intake_fix"].includes(row.filing_status),
    ).length,
    ready_to_append_count: rows.filter((row) => row.filing_status === "response_ready_to_append").length,
    status_counts: statusCounts,
    status_summary: countText(statusCounts),
    inputs: [INFO_PACKET_INPUT, RESPONSE_DRAFTS_INPUT, RESPONSE_INTAKE_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(
    OUT_CSV,
    toCsv(
      rows.map((row) => ({
        ...row,
        disclosure_body: compact(row.disclosure_body, 1200),
      })),
    ),
  );
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ rows: rows.length, readyToFile: summary.ready_to_file_count, output: "analysis/high-blocking-filing-tracker.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
