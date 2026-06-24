#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const INPUT = "data/review/high-blocking-source-response-intake.json";
const ALLOWED_CURRENT_STATUSES = new Set(["ready_to_file", "ready_to_file_or_mark_filed", "filed_waiting_response"]);

function parseArgs(argv) {
  const args = {
    rank: "",
    filedAt: "",
    receipt: undefined,
    channel: undefined,
    url: undefined,
    note: undefined,
    expectedResponseBy: undefined,
    nextCheckDate: undefined,
    nextCheckNote: undefined,
    lastCheckedAt: undefined,
    write: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--write") {
      args.write = true;
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
    if (arg.startsWith("--filed-at=")) {
      args.filedAt = arg.slice("--filed-at=".length).trim();
      continue;
    }
    if (arg.startsWith("--receipt=")) {
      args.receipt = arg.slice("--receipt=".length).trim();
      continue;
    }
    if (arg.startsWith("--channel=")) {
      args.channel = arg.slice("--channel=".length).trim();
      continue;
    }
    if (arg.startsWith("--url=")) {
      args.url = arg.slice("--url=".length).trim();
      continue;
    }
    if (arg.startsWith("--note=")) {
      args.note = arg.slice("--note=".length).trim();
      continue;
    }
    if (arg.startsWith("--expected-response-by=")) {
      args.expectedResponseBy = arg.slice("--expected-response-by=".length).trim();
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
    if (arg.startsWith("--last-checked-at=")) {
      args.lastCheckedAt = arg.slice("--last-checked-at=".length).trim();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/mark-high-blocking-filed.mjs --rank=23 --filed-at=YYYY-MM-DD [--receipt=번호] [--note=메모] [--channel=채널] [--url=https://...] [--expected-response-by=YYYY-MM-DD] [--next-check-date=YYYY-MM-DD] [--next-check-note=메모] [--last-checked-at=YYYY-MM-DD] [--write]

Default mode is dry-run. The command updates one row in ${INPUT} to:
  - filing_status=filed_waiting_response
  - filed_at=...
  - filing_receipt_no / filing_note when provided
  - filing_channel / filing_url override only when provided
  - expected_response_by / next_check_date / next_check_note / last_checked_at when provided

Rules:
  - --rank and --filed-at are required
  - at least one of receipt or note must exist after the update
  - rows already beyond response waiting are rejected`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function validateArgs(args) {
  if (!args.rank) throw new Error("--rank is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.filedAt)) throw new Error("--filed-at must be YYYY-MM-DD");
  if (args.expectedResponseBy !== undefined && args.expectedResponseBy && !/^\d{4}-\d{2}-\d{2}$/.test(args.expectedResponseBy)) {
    throw new Error("--expected-response-by must be YYYY-MM-DD");
  }
  if (args.nextCheckDate !== undefined && args.nextCheckDate && !/^\d{4}-\d{2}-\d{2}$/.test(args.nextCheckDate)) {
    throw new Error("--next-check-date must be YYYY-MM-DD");
  }
  if (args.lastCheckedAt !== undefined && args.lastCheckedAt && !/^\d{4}-\d{2}-\d{2}$/.test(args.lastCheckedAt)) {
    throw new Error("--last-checked-at must be YYYY-MM-DD");
  }
  if (args.url !== undefined && args.url && !/^https?:\/\//i.test(args.url)) {
    throw new Error("--url must start with http:// or https://");
  }
}

function nextValue(provided, current) {
  return provided === undefined ? current : provided;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  validateArgs(args);
  const rows = await readJson(INPUT);
  const index = rows.findIndex((row) => String(row.rank || "") === String(args.rank));
  if (index < 0) throw new Error(`rank ${args.rank} not found in ${INPUT}`);

  const current = rows[index];
  const currentStatus = String(current.filing_status || "");
  if (!ALLOWED_CURRENT_STATUSES.has(currentStatus)) {
    throw new Error(`rank ${args.rank} has unsupported current filing_status: ${currentStatus}`);
  }
  if (String(current.response_status || "no_response") !== "no_response") {
    throw new Error(`rank ${args.rank} already has response_status=${current.response_status}`);
  }

  const updated = {
    ...current,
    filed_at: args.filedAt,
    filing_channel: nextValue(args.channel, current.filing_channel),
    filing_url: nextValue(args.url, current.filing_url),
    filing_receipt_no: nextValue(args.receipt, current.filing_receipt_no),
    filing_note: nextValue(args.note, current.filing_note),
    expected_response_by: nextValue(args.expectedResponseBy, current.expected_response_by),
    next_check_date: nextValue(args.nextCheckDate, current.next_check_date),
    next_check_note: nextValue(args.nextCheckNote, current.next_check_note),
    last_checked_at: nextValue(args.lastCheckedAt, current.last_checked_at),
    filing_status: "filed_waiting_response",
  };

  if (!String(updated.filing_receipt_no || "").trim() && !String(updated.filing_note || "").trim()) {
    throw new Error("Provide --receipt or --note so the filing leaves a trace");
  }

  const nextRows = rows.map((row, rowIndex) => (rowIndex === index ? updated : row));
  if (args.write) {
    await writeFile(INPUT, `${JSON.stringify(nextRows, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        wrote: args.write,
        input: INPUT,
        rank: updated.rank,
        project_name: updated.project_name,
        filing_status: updated.filing_status,
        filed_at: updated.filed_at,
        filing_channel: updated.filing_channel,
        filing_url: updated.filing_url,
        filing_receipt_no: updated.filing_receipt_no,
        filing_note: updated.filing_note,
        expected_response_by: updated.expected_response_by,
        next_check_date: updated.next_check_date,
        next_check_note: updated.next_check_note,
        last_checked_at: updated.last_checked_at,
        next_steps: [
          "node scripts/generate-high-blocking-filing-tracker.mjs",
          "node scripts/generate-high-blocking-filing-checklist.mjs",
          "node scripts/process-high-blocking-response-workflow.mjs",
        ],
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
