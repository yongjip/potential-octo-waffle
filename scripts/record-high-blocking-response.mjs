#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const INPUT = "data/review/high-blocking-source-response-intake.json";
const ALLOWED_STATUSES = new Set(["confirmed", "partial", "unavailable", "info_disclosure_required"]);

function parseArgs(argv) {
  const args = {
    rank: "",
    status: "",
    receivedAt: "",
    responder: "",
    noticeNo: undefined,
    noticeDate: undefined,
    officialUrl: undefined,
    attachmentName: undefined,
    evidenceFiles: undefined,
    evidenceEntries: [],
    responseNote: undefined,
    followUpAction: undefined,
    values: [],
    replace: false,
    write: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--replace") {
      args.replace = true;
      continue;
    }
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
    if (arg.startsWith("--status=")) {
      args.status = arg.slice("--status=".length).trim();
      continue;
    }
    if (arg.startsWith("--received-at=")) {
      args.receivedAt = arg.slice("--received-at=".length).trim();
      continue;
    }
    if (arg.startsWith("--responder=")) {
      args.responder = arg.slice("--responder=".length).trim();
      continue;
    }
    if (arg.startsWith("--notice-no=")) {
      args.noticeNo = arg.slice("--notice-no=".length).trim();
      continue;
    }
    if (arg.startsWith("--notice-date=")) {
      args.noticeDate = arg.slice("--notice-date=".length).trim();
      continue;
    }
    if (arg.startsWith("--official-url=")) {
      args.officialUrl = arg.slice("--official-url=".length).trim();
      continue;
    }
    if (arg.startsWith("--attachment-name=")) {
      args.attachmentName = arg.slice("--attachment-name=".length).trim();
      continue;
    }
    if (arg.startsWith("--evidence-files=")) {
      args.evidenceFiles = arg.slice("--evidence-files=".length).trim();
      continue;
    }
    if (arg.startsWith("--evidence=")) {
      args.evidenceEntries.push(arg.slice("--evidence=".length).trim());
      continue;
    }
    if (arg.startsWith("--response-note=")) {
      args.responseNote = arg.slice("--response-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--follow-up-action=")) {
      args.followUpAction = arg.slice("--follow-up-action=".length).trim();
      continue;
    }
    if (arg.startsWith("--value=")) {
      args.values.push(arg.slice("--value=".length));
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/record-high-blocking-response.mjs --rank=23 --status=partial --received-at=YYYY-MM-DD --responder='광진구 담당부서' [options] [--write]

Required:
  --rank=23
  --status=confirmed|partial|unavailable|info_disclosure_required
  --received-at=YYYY-MM-DD
  --responder='기관/부서명'

Common options:
  --notice-no='광진구 고시 제YYYY-N호'
  --notice-date=YYYY-MM-DD
  --official-url=https://...
  --attachment-name='자료명'
  --evidence=https://...                 (repeatable)
  --evidence-files='path1; path2'
  --response-note='회신 요약'
  --value=union_approval_date=YYYY-MM-DD
  --value=management_construction_cost=123456
  --follow-up-action='메모'
  --replace                              existing recorded response overwrite
  --write                                persist changes

Behavior:
  - default mode is dry-run
  - writing a response sets filing_status=response_received_validate
  - if a response already exists, --replace is required to overwrite it
  - confirmed/partial need at least one identifier plus official_url or evidence
  - unavailable/info_disclosure_required need response_note`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function validateDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
}

function validateUrl(value, label) {
  if (value && !/^https?:\/\//i.test(value)) {
    throw new Error(`${label} must start with http:// or https://`);
  }
}

function emptyConfirmedValues(values) {
  return Object.fromEntries(Object.keys(values || {}).map((key) => [key, ""]));
}

function cloneRow(row) {
  return JSON.parse(JSON.stringify(row));
}

function clearResponseFields(row) {
  return {
    ...row,
    response_status: "no_response",
    response_received_at: "",
    responder: "",
    official_notice_no: "",
    official_notice_date: "",
    official_url: "",
    attachment_name: "",
    confirmed_values: emptyConfirmedValues(row.confirmed_values || {}),
    evidence_files: "",
    response_note: "",
    follow_up_action: "",
  };
}

function nextValue(provided, current) {
  return provided === undefined ? current : provided;
}

function parseValueAssignments(values, allowedKeys) {
  const assignments = new Map();
  for (const raw of values) {
    const body = String(raw || "");
    const index = body.indexOf("=");
    if (index <= 0) throw new Error(`Invalid --value format: ${raw}`);
    const key = body.slice(0, index).trim();
    const value = body.slice(index + 1).trim();
    if (!allowedKeys.has(key)) throw new Error(`Unknown confirmed_values key: ${key}`);
    assignments.set(key, value);
  }
  return assignments;
}

function defaultFollowUpAction(status) {
  if (status === "info_disclosure_required") {
    return "정보공개청구 전환 여부를 확인한 뒤 node scripts/process-high-blocking-response-workflow.mjs";
  }
  return "node scripts/process-high-blocking-response-workflow.mjs";
}

function mergedEvidence(args, currentValue) {
  if (args.evidenceFiles !== undefined) return args.evidenceFiles;
  if (args.evidenceEntries.length > 0) return args.evidenceEntries.filter(Boolean).join("; ");
  return currentValue;
}

function validateUpdatedRow(row) {
  if (!ALLOWED_STATUSES.has(row.response_status)) {
    throw new Error(`Unsupported response status: ${row.response_status}`);
  }
  validateDate(row.response_received_at, "--received-at");
  if (!String(row.responder || "").trim()) throw new Error("--responder is required");
  validateUrl(row.official_url, "--official-url");

  if (["confirmed", "partial"].includes(row.response_status)) {
    const hasIdentifier = Boolean(row.official_notice_no || row.official_notice_date || row.official_url || row.attachment_name);
    if (!hasIdentifier) {
      throw new Error("confirmed/partial requires notice-no, notice-date, official-url, or attachment-name");
    }
    if (!String(row.evidence_files || "").trim() && !String(row.official_url || "").trim()) {
      throw new Error("confirmed/partial requires --official-url or --evidence/--evidence-files");
    }
  }

  if (["unavailable", "info_disclosure_required"].includes(row.response_status) && !String(row.response_note || "").trim()) {
    throw new Error("unavailable/info_disclosure_required requires --response-note");
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.rank) throw new Error("--rank is required");
  if (!ALLOWED_STATUSES.has(args.status)) throw new Error(`--status must be one of: ${[...ALLOWED_STATUSES].join(", ")}`);
  validateDate(args.receivedAt, "--received-at");
  validateUrl(args.officialUrl, "--official-url");
  for (const evidence of args.evidenceEntries) validateUrl(evidence.startsWith("http") ? evidence : "", "--evidence");

  const rows = await readJson(INPUT);
  const index = rows.findIndex((row) => String(row.rank || "") === String(args.rank));
  if (index < 0) throw new Error(`rank ${args.rank} not found in ${INPUT}`);

  const current = rows[index];
  if (String(current.response_status || "no_response") !== "no_response" && !args.replace) {
    throw new Error(`rank ${args.rank} already has response_status=${current.response_status}; use --replace to overwrite`);
  }

  const base = args.replace ? clearResponseFields(cloneRow(current)) : cloneRow(current);
  const allowedValueKeys = new Set(Object.keys(base.confirmed_values || {}));
  const valueAssignments = parseValueAssignments(args.values, allowedValueKeys);

  const updated = {
    ...base,
    response_status: args.status,
    response_received_at: args.receivedAt,
    responder: args.responder,
    official_notice_no: nextValue(args.noticeNo, base.official_notice_no),
    official_notice_date: nextValue(args.noticeDate, base.official_notice_date),
    official_url: nextValue(args.officialUrl, base.official_url),
    attachment_name: nextValue(args.attachmentName, base.attachment_name),
    evidence_files: mergedEvidence(args, base.evidence_files),
    response_note: nextValue(args.responseNote, base.response_note),
    follow_up_action: nextValue(args.followUpAction, base.follow_up_action) || defaultFollowUpAction(args.status),
    filing_status: "response_received_validate",
    confirmed_values: {
      ...(base.confirmed_values || {}),
    },
  };

  for (const [key, value] of valueAssignments) {
    updated.confirmed_values[key] = value;
  }

  validateUpdatedRow(updated);

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
        response_status: updated.response_status,
        filing_status: updated.filing_status,
        response_received_at: updated.response_received_at,
        responder: updated.responder,
        official_notice_no: updated.official_notice_no,
        official_notice_date: updated.official_notice_date,
        official_url: updated.official_url,
        attachment_name: updated.attachment_name,
        evidence_files: updated.evidence_files,
        response_note: updated.response_note,
        confirmed_values: updated.confirmed_values,
        next_steps: [
          "node scripts/process-high-blocking-response-workflow.mjs",
          "node scripts/process-high-blocking-response-workflow.mjs --write",
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
