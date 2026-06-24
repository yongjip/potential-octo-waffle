#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-next-check-command-audit.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-next-check-command-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-next-check-command-audit.json");

const INPUTS = {
  packet: "analysis/high-blocking-next-check-session-packet.json",
  filingTracker: "analysis/high-blocking-filing-tracker.json",
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

const GENERATED_AT = `${kstDate()} KST`;

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

function extractFlag(command, name) {
  const match = new RegExp(`--${name}=([^ ]+)`).exec(String(command || ""));
  return match ? match[1] : "";
}

function extractRank(command) {
  return extractFlag(command, "rank");
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function compareDate(a, b) {
  if (!isIsoDate(a) || !isIsoDate(b)) return null;
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank), row]));
}

function addIssue(issues, row, severity, field, message, action) {
  issues.push({
    rank: String(row?.rank || ""),
    project_name: row?.project_name || "",
    severity,
    field,
    message,
    action,
  });
}

function validateRow(row, trackerRow, anchorDate) {
  const issues = [];
  const command = row.touch_followup_command || "";
  const checkedAt = extractFlag(command, "checked-at");
  const nextCheckDate = extractFlag(command, "next-check-date");
  const rankInCommand = extractRank(command);

  if (!command.includes("record-high-blocking-followup-check.mjs")) {
    addIssue(issues, row, "error", "touch_followup_command", "follow-up helper가 record-high-blocking-followup-check를 사용하지 않음", "세션 패킷 helper를 표준 helper로 재생성");
  }
  if (String(rankInCommand) !== String(row.rank)) {
    addIssue(issues, row, "error", "touch_followup_command", "helper 명령의 rank가 행 rank와 다름", "helper 명령을 행 rank 기준으로 재생성");
  }
  if (!isIsoDate(anchorDate)) {
    addIssue(issues, row, "error", "session_anchor_date", "summary.session_anchor_date가 YYYY-MM-DD 형식이 아님", "세션 기준일이 잡히도록 filing tracker를 먼저 점검");
    return issues;
  }
  if (!isIsoDate(checkedAt)) {
    addIssue(issues, row, "error", "touch_followup_command", "helper 명령의 checked-at이 YYYY-MM-DD 형식이 아님", "세션 기준일을 checked-at으로 넣어 재생성");
  } else if (checkedAt !== anchorDate) {
    addIssue(issues, row, "error", "touch_followup_command", "helper 명령의 checked-at이 세션 기준일과 다름", "checked-at을 session_anchor_date와 같게 재생성");
  }
  if (!isIsoDate(nextCheckDate)) {
    addIssue(issues, row, "error", "touch_followup_command", "helper 명령의 next-check-date가 YYYY-MM-DD 형식이 아님", "다음 점검일을 명시해 재생성");
  } else if (compareDate(nextCheckDate, checkedAt) !== 1) {
    addIssue(issues, row, "error", "touch_followup_command", "helper 명령의 next-check-date가 checked-at보다 뒤가 아님", "다음 점검일을 최소 다음 확인일로 밀어 재생성");
  }
  if (trackerRow && isIsoDate(trackerRow.next_check_date) && checkedAt !== trackerRow.next_check_date) {
    addIssue(issues, row, "warning", "touch_followup_command", "helper 명령의 checked-at이 filing tracker의 현재 next_check_date와 다름", "세션 기준일과 filing tracker를 같은 날짜로 유지");
  }
  if (trackerRow && isIsoDate(trackerRow.expected_response_by) && isIsoDate(nextCheckDate)) {
    if (compareDate(nextCheckDate, trackerRow.expected_response_by) === 1) {
      addIssue(issues, row, "warning", "touch_followup_command", "helper 명령의 next-check-date가 처리기한 뒤로 밀림", "처리기한보다 늦지 않게 다음 점검일을 조정");
    }
  }

  return issues;
}

function buildStatus(issues) {
  if (issues.some((issue) => issue.severity === "error")) return "error";
  if (issues.some((issue) => issue.severity === "warning")) return "warning";
  return "ok";
}

function buildRows(packetRows, trackerRows, anchorDate) {
  const trackerByRank = byRank(trackerRows);
  return (packetRows || []).map((row) => {
    const trackerRow = trackerByRank.get(String(row.rank)) || null;
    const issues = validateRow(row, trackerRow, anchorDate);
    return {
      rank: String(row.rank || ""),
      project_name: row.project_name || "",
      current_next_check_date: row.next_check_date || "",
      expected_response_by: row.expected_response_by || "",
      command_checked_at: extractFlag(row.touch_followup_command, "checked-at"),
      command_next_check_date: extractFlag(row.touch_followup_command, "next-check-date"),
      status: buildStatus(issues),
      issue_count: issues.length,
      issues,
    };
  });
}

function summarize(rows) {
  const flatIssues = rows.flatMap((row) => row.issues || []);
  return {
    generated_at: GENERATED_AT,
    project_count: rows.length,
    ok_count: rows.filter((row) => row.status === "ok").length,
    warning_count: rows.filter((row) => row.status === "warning").length,
    error_count: rows.filter((row) => row.status === "error").length,
    issue_count: flatIssues.length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows, issues) {
  return `# High Blocking 다음 점검 명령 감사표

작성 기준: ${summary.generated_at}

이 문서는 \`high-blocking-next-check-session-packet\`의 no response helper가 실제로 세션 기준일과 다음 점검일 규칙을 지키는지 검사한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 정상 | ${summary.ok_count} |
| warning | ${summary.warning_count} |
| error | ${summary.error_count} |
| 총 이슈 | ${summary.issue_count} |

## 행별 상태

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "current_next_check_date", label: "현재 점검일" },
    { key: "command_checked_at", label: "helper checked-at" },
    { key: "command_next_check_date", label: "helper next-check-date" },
    { key: "status", label: "상태" },
    { key: "issue_count", label: "이슈" },
  ])}

## 이슈

${mdTable(issues, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "severity", label: "심각도" },
    { key: "field", label: "필드" },
    { key: "message", label: "문제" },
    { key: "action", label: "조치" },
  ])}
`;
}

async function main() {
  const [packet, filingTracker] = await Promise.all([readJson(INPUTS.packet), readJson(INPUTS.filingTracker)]);
  const anchorDate = packet.summary?.session_anchor_date || "";
  const rows = buildRows(packet.rows || [], filingTracker.rows || [], anchorDate);
  const issues = rows.flatMap((row) => row.issues || []);
  const summary = summarize(rows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    OUT_JSON,
    `${JSON.stringify({ summary, rows: rows.map((row) => ({ ...row, issues: undefined })), issues }, null, 2)}\n`,
  );
  await writeFile(OUT_CSV, toCsv(issues.length ? issues : rows.map((row) => ({ ...row, issues: undefined }))));
  await writeFile(OUT_MD, `${markdown(summary, rows, issues)}\n`);

  console.log(
    JSON.stringify(
      {
        projects: summary.project_count,
        warnings: summary.warning_count,
        errors: summary.error_count,
        output: "analysis/high-blocking-next-check-command-audit.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
