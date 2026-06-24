#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-intake-validation.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-intake-validation.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-intake-validation.json");

const PACKET_INPUT = "analysis/high-blocking-info-disclosure-packet.json";
const DRAFT_INPUT = "analysis/high-blocking-response-decision-drafts.json";
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
const VALID_RESPONSE_STATUSES = new Set(["no_response", "confirmed", "partial", "unavailable", "info_disclosure_required"]);
const VALID_FILING_STATUSES = new Set([
  "",
  "ready_to_file",
  "ready_to_file_or_mark_filed",
  "filed_waiting_response",
  "response_received_validate",
  "response_ready_to_append",
  "response_needs_intake_fix",
  "closed",
]);

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

function addIssue(issues, row, severity, field, message, action) {
  issues.push({
    rank: row?.rank || "",
    project_name: row?.project_name || "",
    severity,
    field,
    message,
    action,
  });
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function splitEvidence(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasAny(row, fields) {
  return fields.some((field) => String(row?.[field] || "").trim());
}

function hasAnyValue(values, fields) {
  return fields.some((field) => String(values?.[field] || "").trim());
}

async function validateEvidenceFiles(row, issues) {
  for (const evidence of splitEvidence(row.evidence_files)) {
    if (isHttpUrl(evidence)) continue;
    if (await fileExists(evidence)) continue;
    addIssue(
      issues,
      row,
      "warning",
      "evidence_files",
      `증거 파일 경로를 찾을 수 없음: ${evidence}`,
      "로컬 파일이면 경로를 보정하고, 외부 URL이면 https://로 시작하도록 입력",
    );
  }
}

async function validateRow(row, packetRow, draftRow) {
  const issues = [];
  const status = row.response_status || "";
  const values = row.confirmed_values || {};

  if (!row.rank) addIssue(issues, row, "error", "rank", "rank 누락", "packet의 rank와 동일하게 입력");
  if (!row.project_name) addIssue(issues, row, "error", "project_name", "사업명 누락", "packet의 project_name과 동일하게 입력");
  if (!packetRow) addIssue(issues, row, "error", "rank", "packet에 없는 rank", "high-blocking-info-disclosure-packet 기준 3개 rank만 유지");
  if (packetRow && row.project_name !== packetRow.project_name) {
    addIssue(issues, row, "error", "project_name", "packet 사업명과 intake 사업명이 다름", "사업명을 packet 기준으로 맞춤");
  }
  if (!VALID_RESPONSE_STATUSES.has(status)) {
    addIssue(
      issues,
      row,
      "error",
      "response_status",
      `허용되지 않는 response_status: ${status}`,
      [...VALID_RESPONSE_STATUSES].join(", "),
    );
  }
  if (!VALID_FILING_STATUSES.has(row.filing_status || "")) {
    addIssue(
      issues,
      row,
      "warning",
      "filing_status",
      `허용 목록 밖 filing_status: ${row.filing_status}`,
      [...VALID_FILING_STATUSES].filter(Boolean).join(", "),
    );
  }
  if (row.official_url && !isHttpUrl(row.official_url)) {
    addIssue(issues, row, "warning", "official_url", "official_url이 http(s) URL 형식이 아님", "원문 URL이면 https:// 전체 주소로 입력");
  }
  const filingStatus = row.filing_status || "";
  const needsFiledAt =
    row.filing_receipt_no ||
    ["filed_waiting_response", "response_received_validate", "response_ready_to_append", "response_needs_intake_fix", "closed"].includes(
      filingStatus,
    );
  if (needsFiledAt && !row.filed_at) {
    addIssue(issues, row, "warning", "filed_at", "접수 정보가 있으나 filed_at 누락", "접수일을 YYYY-MM-DD 형식으로 입력");
  }
  if (row.filing_url && !isHttpUrl(row.filing_url)) {
    addIssue(issues, row, "warning", "filing_url", "filing_url이 http(s) URL 형식이 아님", "접수 URL이면 https:// 전체 주소로 입력");
  }

  if (status === "no_response") {
    await validateEvidenceFiles(row, issues);
    return issues;
  }

  if (!row.response_received_at) {
    addIssue(issues, row, "error", "response_received_at", "회신 상태인데 response_received_at 누락", "회신 수신일을 YYYY-MM-DD 형식으로 입력");
  }
  if (!row.responder) {
    addIssue(issues, row, "error", "responder", "회신 상태인데 responder 누락", "개인정보를 피하고 부서명/기관명 수준으로 입력");
  }
  if (["confirmed", "partial"].includes(status)) {
    if (!hasAny(row, ["official_notice_no", "official_notice_date", "official_url", "attachment_name"])) {
      addIssue(
        issues,
        row,
        "error",
        "official_notice_no",
        "confirmed/partial인데 고시번호·고시일·URL·자료명 중 하나도 없음",
        "확정 근거 식별자 중 하나 이상 입력",
      );
    }
    if (!row.evidence_files && !row.official_url) {
      addIssue(issues, row, "error", "evidence_files", "confirmed/partial인데 evidence_files 또는 official_url 누락", "회신 파일 또는 원문 URL 입력");
    }
  }
  if (["unavailable", "info_disclosure_required"].includes(status) && !row.response_note) {
    addIssue(issues, row, "error", "response_note", "비공개/정보공개 필요 상태인데 사유 메모 누락", "보유부서, 비공개 사유, 방문열람 안내를 요약");
  }
  if (packetRow?.current_stage === "관리처분인가" && ["confirmed", "partial"].includes(status)) {
    if (
      !hasAnyValue(values, ["management_construction_cost", "management_total_project_cost", "management_cost_basis_date"]) &&
      !row.attachment_name &&
      !row.official_url
    ) {
      addIssue(
        issues,
        row,
        "error",
        "confirmed_values",
        "관리처분 회신인데 공사비/총사업비/기준일/자료명/URL이 모두 없음",
        "공개 가능한 금액 또는 자료명을 입력",
      );
    }
  }
  if (draftRow?.draft_status === "needs_intake_fix" && !issues.length) {
    addIssue(issues, row, "warning", "draft_status", "decision draft는 보완 필요인데 validator issue가 없음", "decision draft의 validation_issues를 별도 확인");
  }
  await validateEvidenceFiles(row, issues);
  return issues;
}

async function buildRows(packetRows, draftRows, intakeRows) {
  const packetByRank = byRank(packetRows);
  const draftByRank = byRank(draftRows);
  const issues = [];
  const seen = new Set();

  for (const row of intakeRows) {
    const rank = String(row.rank || "");
    if (seen.has(rank)) {
      addIssue(issues, row, "error", "rank", `중복 rank: ${rank}`, "rank별 intake 행은 하나만 유지");
    }
    seen.add(rank);
    issues.push(...(await validateRow(row, packetByRank.get(rank), draftByRank.get(rank))));
  }

  for (const packetRow of packetRows) {
    if (!seen.has(String(packetRow.rank))) {
      addIssue(issues, packetRow, "error", "rank", "packet 대상 사업장의 intake 행 누락", "intake JSON에 해당 rank 행 추가");
    }
  }
  return issues;
}

function markdown(summary, issues) {
  return `# High Blocking Intake Validation

작성 기준: ${UPDATED_AT}

이 문서는 \`data/review/high-blocking-source-response-intake.json\`의 입력값을 검증한다. 실제 회신 내용을 확정값으로 승격하기 전, 상태값·증거 URL·자료명·필수 회신 필드가 decision 초안 생성 조건을 만족하는지 확인하는 용도다.

## 요약

| 항목 | 값 |
| --- | ---: |
| intake 행 | ${summary.intake_rows} |
| packet 대상 | ${summary.packet_rows} |
| 오류 | ${summary.error_count} |
| 경고 | ${summary.warning_count} |
| decision append 가능 | ${summary.ready_to_append_count} |
| 회신 대기 | ${summary.waiting_for_response_count} |

## 허용 상태값

- response_status: ${[...VALID_RESPONSE_STATUSES].join(", ")}
- filing_status: ${[...VALID_FILING_STATUSES].filter(Boolean).join(", ")}

## 검증 이슈

${mdTable(issues, [
  { key: "severity", label: "등급" },
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "field", label: "필드" },
  { key: "message", label: "내용" },
  { key: "action", label: "조치" },
])}

## 회신 반영 순서

1. 가능하면 \`node scripts/record-high-blocking-response.mjs\`로 회신을 반영한 뒤, 이 문서의 error를 먼저 0으로 만든다.
2. \`node scripts/process-high-blocking-response-workflow.mjs\`로 decision draft와 apply dry-run을 확인한다.
3. appendable이 예상과 맞을 때만 \`node scripts/process-high-blocking-response-workflow.mjs --write\`를 실행한다.
4. \`--write\` 실행 후 \`analysis/research-goal-completion-audit.md\`의 최종 판정을 확인한다.
`;
}

async function main() {
  const packet = await readJson(PACKET_INPUT);
  const drafts = await readJson(DRAFT_INPUT);
  const intakeRows = await readJson(INTAKE_INPUT);
  const packetRows = packet.rows || [];
  const draftRows = drafts.rows || [];
  const issues = await buildRows(packetRows, draftRows, intakeRows);
  const summary = {
    generated_at: UPDATED_AT,
    intake_rows: intakeRows.length,
    packet_rows: packetRows.length,
    issue_count: issues.length,
    error_count: issues.filter((row) => row.severity === "error").length,
    warning_count: issues.filter((row) => row.severity === "warning").length,
    ready_to_append_count: Number(drafts.summary?.ready_to_append || 0),
    waiting_for_response_count: Number(drafts.summary?.waiting_for_response || 0),
    inputs: [PACKET_INPUT, DRAFT_INPUT, INTAKE_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, issues }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(issues));
  await writeFile(OUT_MD, markdown(summary, issues));
  console.log(JSON.stringify({ issues: issues.length, errors: summary.error_count, warnings: summary.warning_count, output: "analysis/high-blocking-intake-validation.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
