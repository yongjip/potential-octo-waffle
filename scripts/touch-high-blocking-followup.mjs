#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const SESSION_PACKET_INPUT = "analysis/high-blocking-next-check-session-packet.json";

function parseArgs(argv) {
  const args = {
    rank: [],
    checkedAt: "",
    sessionAnchorDate: "",
    nextCheckDate: undefined,
    nextCheckNote: undefined,
    expectedResponseBy: undefined,
    portalStatus: undefined,
    observedNote: "답변 게시 없음",
    replace: false,
    write: false,
    refresh: false,
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
    if (arg === "--refresh") {
      args.refresh = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg.startsWith("--rank=")) {
      args.rank.push(arg.slice("--rank=".length).trim());
      continue;
    }
    if (arg.startsWith("--checked-at=")) {
      args.checkedAt = arg.slice("--checked-at=".length).trim();
      continue;
    }
    if (arg.startsWith("--session-anchor-date=")) {
      args.sessionAnchorDate = arg.slice("--session-anchor-date=".length).trim();
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
    if (arg.startsWith("--portal-status=")) {
      args.portalStatus = arg.slice("--portal-status=".length).trim();
      continue;
    }
    if (arg.startsWith("--observed-note=")) {
      args.observedNote = arg.slice("--observed-note=".length).trim();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/touch-high-blocking-followup.mjs --rank=23 --checked-at=YYYY-MM-DD|today [options]
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=YYYY-MM-DD --checked-at=YYYY-MM-DD|today [options]

Behavior:
  - convenience wrapper for record-high-blocking-followup-check.mjs
  - defaults to --check-status=no_change and --observed-note='답변 게시 없음'
  - reads analysis/high-blocking-next-check-session-packet.json to fill rank별 next_check_note / suggested_next_check_date
  - when --write --refresh are both set for multiple targets, refresh runs only on the last target

Options:
  --rank=23                       one or more specific ranks
  --session-anchor-date=2026-06-29  all rows in next-check session packet with this anchor date
  --checked-at=YYYY-MM-DD|today
  --next-check-date=YYYY-MM-DD    override suggested next check date
  --next-check-note='...'
  --expected-response-by=YYYY-MM-DD
  --portal-status='처리중'
  --observed-note='답변 게시 없음'
  --replace
  --write
  --refresh

Examples:
  node scripts/touch-high-blocking-followup.mjs --rank=9 --checked-at=today
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function validateDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
}

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

function shellEscape(value) {
  const text = String(value);
  if (!/[\s"'\\]/.test(text)) return text;
  return `'${text.replaceAll("'", `'\\''`)}'`;
}

function resolveTargets(rows, args) {
  if (args.rank.length) {
    const targets = args.rank.map((rank) => rows.find((row) => String(row.rank || "") === String(rank)) || null);
    const missing = args.rank.filter((rank, index) => !targets[index]);
    if (missing.length) throw new Error(`rank not found in ${SESSION_PACKET_INPUT}: ${missing.join(", ")}`);
    return targets;
  }

  if (args.sessionAnchorDate) {
    validateDate(args.sessionAnchorDate, "--session-anchor-date");
    const targets = rows.filter((row) => String(row.session_anchor_date || "") === args.sessionAnchorDate);
    if (!targets.length) throw new Error(`no rows found for session anchor ${args.sessionAnchorDate}`);
    return targets;
  }

  throw new Error("one of --rank or --session-anchor-date is required");
}

function commandArgsForRow(row, args, isLastTarget) {
  const nextCheckDate = args.nextCheckDate || row.suggested_next_check_date || row.next_check_date || "";
  if (nextCheckDate) validateDate(nextCheckDate, "--next-check-date");

  const commandArgs = [
    "scripts/record-high-blocking-followup-check.mjs",
    `--rank=${row.rank}`,
    `--checked-at=${args.checkedAt}`,
    "--check-status=no_change",
    `--observed-note=${args.observedNote}`,
  ];

  if (args.portalStatus !== undefined) {
    commandArgs.push(`--portal-status=${args.portalStatus}`);
  }
  if (nextCheckDate) {
    commandArgs.push(`--next-check-date=${nextCheckDate}`);
  }
  if (args.nextCheckNote !== undefined) {
    commandArgs.push(`--next-check-note=${args.nextCheckNote}`);
  } else if (row.next_check_note) {
    commandArgs.push(`--next-check-note=${row.next_check_note}`);
  }
  if (args.expectedResponseBy !== undefined) {
    commandArgs.push(`--expected-response-by=${args.expectedResponseBy}`);
  }
  if (args.replace) {
    commandArgs.push("--replace");
  }
  if (args.write) {
    commandArgs.push("--write");
    if (args.refresh && isLastTarget) {
      commandArgs.push("--refresh");
    }
  }

  return commandArgs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.checkedAt) throw new Error("--checked-at is required");
  if (args.checkedAt === "today") args.checkedAt = kstDate();
  validateDate(args.checkedAt, "--checked-at");
  if (args.expectedResponseBy !== undefined && args.expectedResponseBy !== "") {
    validateDate(args.expectedResponseBy, "--expected-response-by");
  }
  if (args.refresh && !args.write) throw new Error("--refresh requires --write");
  if (!String(args.observedNote || "").trim()) throw new Error("--observed-note must not be empty");

  const packet = await readJson(SESSION_PACKET_INPUT);
  const targets = resolveTargets(packet.rows || [], args);
  const planned = targets.map((row, index) => ({
    rank: row.rank,
    project_name: row.project_name,
    session_anchor_date: row.session_anchor_date || "",
    command: ["node", ...commandArgsForRow(row, args, index === targets.length - 1)].map(shellEscape).join(" "),
  }));

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        target_count: planned.length,
        targets: planned,
      },
      null,
      2,
    ),
  );

  if (!args.write) return;

  for (let index = 0; index < targets.length; index += 1) {
    const row = targets[index];
    await runCommand("node", commandArgsForRow(row, args, index === targets.length - 1));
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
