#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const LOG_INPUT = "data/review/high-blocking-followup-check-log.json";
const INTAKE_INPUT = "data/review/high-blocking-source-response-intake.json";
const VALID_CHECK_STATUSES = new Set([
  "no_change",
  "response_posted",
  "supplement_requested",
  "deadline_changed",
  "portal_issue",
]);

function parseArgs(argv) {
  const args = {
    rank: "",
    checkedAt: "",
    checkStatus: "",
    observedNote: "",
    portalStatus: undefined,
    responseUrl: undefined,
    nextCheckDate: undefined,
    nextCheckNote: undefined,
    expectedResponseBy: undefined,
    filingNote: undefined,
    appendFilingNote: false,
    followUpAction: undefined,
    replace: false,
    write: false,
    refresh: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--append-filing-note") {
      args.appendFilingNote = true;
      continue;
    }
    if (arg === "--replace") {
      args.replace = true;
      continue;
    }
    if (arg === "--write") {
      args.write = true;
      continue;
    }
    if (arg === "--refresh") {
      args.refresh = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg.startsWith("--rank=")) {
      args.rank = arg.slice("--rank=".length).trim();
      continue;
    }
    if (arg.startsWith("--checked-at=")) {
      args.checkedAt = arg.slice("--checked-at=".length).trim();
      continue;
    }
    if (arg.startsWith("--check-status=")) {
      args.checkStatus = arg.slice("--check-status=".length).trim();
      continue;
    }
    if (arg.startsWith("--observed-note=")) {
      args.observedNote = arg.slice("--observed-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--portal-status=")) {
      args.portalStatus = arg.slice("--portal-status=".length).trim();
      continue;
    }
    if (arg.startsWith("--response-url=")) {
      args.responseUrl = arg.slice("--response-url=".length).trim();
      continue;
    }
    if (arg.startsWith("--next-check-date=")) {
      args.nextCheckDate = arg.slice("--next-check-date=".length).trim();
      continue;
    }
    if (arg.startsWith("--next-check-note=")) {
      args.nextCheckNote = arg.slice("--next-check-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--expected-response-by=")) {
      args.expectedResponseBy = arg.slice("--expected-response-by=".length).trim();
      continue;
    }
    if (arg.startsWith("--filing-note=")) {
      args.filingNote = arg.slice("--filing-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--follow-up-action=")) {
      args.followUpAction = arg.slice("--follow-up-action=".length).trim();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/record-high-blocking-followup-check.mjs --rank=23 --checked-at=YYYY-MM-DD --check-status=no_change --observed-note='처리상태 변화 없음' [options] [--write] [--refresh]

Required:
  --rank=23
  --checked-at=YYYY-MM-DD
  --check-status=no_change|response_posted|supplement_requested|deadline_changed|portal_issue
  --observed-note='이번 확인 요약'

Common options:
  --portal-status='접수/처리중/답변완료/보완요구'
  --response-url=https://...
  --next-check-date=YYYY-MM-DD
  --next-check-note='다음 점검 포인트'
  --expected-response-by=YYYY-MM-DD
  --filing-note='처리기한 변경 또는 보완요구 메모'
  --append-filing-note
  --follow-up-action='record-high-blocking-response helper 실행'
  --replace
  --write
  --refresh

Behavior:
  - default mode is dry-run
  - updates intake last_checked_at plus optional next_check_date/note/expected_response_by
  - appends one row to data/review/high-blocking-followup-check-log.json
  - --refresh regenerates high-blocking follow-up artifacts after write`);
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function validateDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
}

function validateUrl(value, label) {
  if (value && !/^https?:\/\//i.test(value)) {
    throw new Error(`${label} must start with http:// or https://`);
  }
}

function mergeFilingNote(current, incoming, append) {
  if (incoming === undefined) return current;
  if (!append || !String(current || "").trim()) return incoming;
  return `${String(current).trim()} ${String(incoming).trim()}`.trim();
}

function defaultFollowUpAction(status, rank) {
  if (status === "response_posted") {
    return `node scripts/record-high-blocking-response.mjs --rank=${rank} --status=... --received-at=YYYY-MM-DD --responder='담당부서' --write`;
  }
  if (status === "supplement_requested") {
    return "보완요구 내용을 filing_note에 남기고 next_check_date를 다시 설정한다.";
  }
  if (status === "deadline_changed") {
    return "expected_response_by와 next_check_date를 갱신한다.";
  }
  if (status === "portal_issue") {
    return "조회 오류 사유를 남기고 대표 채널 또는 담당부서 확인 경로를 재시도한다.";
  }
  return "next_check_date를 유지 또는 조정하고 다음 점검 세션까지 대기한다.";
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.rank) throw new Error("--rank is required");
  validateDate(args.checkedAt, "--checked-at");
  if (!VALID_CHECK_STATUSES.has(args.checkStatus)) {
    throw new Error(`--check-status must be one of: ${[...VALID_CHECK_STATUSES].join(", ")}`);
  }
  if (!String(args.observedNote || "").trim()) throw new Error("--observed-note is required");
  if (args.nextCheckDate !== undefined && args.nextCheckDate !== "") validateDate(args.nextCheckDate, "--next-check-date");
  if (args.expectedResponseBy !== undefined && args.expectedResponseBy !== "") {
    validateDate(args.expectedResponseBy, "--expected-response-by");
  }
  validateUrl(args.responseUrl, "--response-url");
  if (args.refresh && !args.write) throw new Error("--refresh requires --write");

  const [logRows, intakeRows] = await Promise.all([readJson(LOG_INPUT, []), readJson(INTAKE_INPUT)]);
  const intakeIndex = intakeRows.findIndex((row) => String(row.rank || "") === String(args.rank));
  if (intakeIndex < 0) throw new Error(`rank ${args.rank} not found in ${INTAKE_INPUT}`);
  const intakeRow = intakeRows[intakeIndex];

  const logId = `hbfc-${args.checkedAt}-${args.rank}`;
  const existingLogIndex = logRows.findIndex((row) => String(row.log_id || "") === logId);
  if (existingLogIndex >= 0 && !args.replace) {
    throw new Error(`log ${logId} already exists; use --replace to overwrite`);
  }
  if (existingLogIndex < 0 && args.replace) {
    throw new Error(`log ${logId} does not exist; remove --replace or use an existing checked-at date`);
  }

  const updatedIntakeRow = {
    ...intakeRow,
    last_checked_at: args.checkedAt,
    next_check_date: args.nextCheckDate === undefined ? intakeRow.next_check_date || "" : args.nextCheckDate,
    next_check_note: args.nextCheckNote === undefined ? intakeRow.next_check_note || "" : args.nextCheckNote,
    expected_response_by:
      args.expectedResponseBy === undefined ? intakeRow.expected_response_by || "" : args.expectedResponseBy,
    filing_note: mergeFilingNote(intakeRow.filing_note || "", args.filingNote, args.appendFilingNote),
  };

  const nextFollowUpAction = args.followUpAction || defaultFollowUpAction(args.checkStatus, args.rank);
  const nextLogRow = {
    log_id: logId,
    rank: String(intakeRow.rank),
    project_name: intakeRow.project_name,
    district: intakeRow.filing_channel?.includes("송파") ? "송파구" : "광진구",
    checked_at: args.checkedAt,
    filing_channel: intakeRow.filing_channel || "",
    filing_receipt_no: intakeRow.filing_receipt_no || "",
    check_status: args.checkStatus,
    portal_status: args.portalStatus === undefined ? "" : args.portalStatus,
    observed_note: args.observedNote,
    response_url: args.responseUrl === undefined ? "" : args.responseUrl,
    next_check_date: updatedIntakeRow.next_check_date || "",
    next_check_note: updatedIntakeRow.next_check_note || "",
    expected_response_by: updatedIntakeRow.expected_response_by || "",
    follow_up_action: nextFollowUpAction,
  };

  const nextIntakeRows = intakeRows.map((row, index) => (index === intakeIndex ? updatedIntakeRow : row));
  const nextLogRows =
    existingLogIndex >= 0
      ? logRows.map((row, index) => (index === existingLogIndex ? nextLogRow : row))
      : [...logRows, nextLogRow];

  if (args.write) {
    await writeFile(INTAKE_INPUT, `${JSON.stringify(nextIntakeRows, null, 2)}\n`);
    await writeFile(LOG_INPUT, `${JSON.stringify(nextLogRows, null, 2)}\n`);
    if (args.refresh) {
      await runCommand("node", ["scripts/generate-high-blocking-filing-tracker.mjs"]);
      await runCommand("node", ["scripts/generate-high-blocking-filing-checklist.mjs"]);
      await runCommand("node", ["scripts/generate-high-blocking-response-followup-cockpit.mjs"]);
      await runCommand("node", ["scripts/generate-high-blocking-next-check-session-packet.mjs"]);
      await runCommand("node", ["scripts/generate-high-blocking-followup-history.mjs"]);
      await runCommand("node", ["scripts/generate-research-completion-cockpit.mjs"]);
      await runCommand("node", ["scripts/generate-current-research-operating-guide.mjs"]);
      await runCommand("node", ["scripts/generate-personal-research-home.mjs"]);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        wrote: args.write,
        refreshed: args.write && args.refresh,
        log_input: LOG_INPUT,
        intake_input: INTAKE_INPUT,
        log_id: nextLogRow.log_id,
        rank: nextLogRow.rank,
        project_name: nextLogRow.project_name,
        check_status: nextLogRow.check_status,
        checked_at: nextLogRow.checked_at,
        portal_status: nextLogRow.portal_status,
        next_check_date: nextLogRow.next_check_date,
        next_check_note: nextLogRow.next_check_note,
        expected_response_by: nextLogRow.expected_response_by,
        follow_up_action: nextLogRow.follow_up_action,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
