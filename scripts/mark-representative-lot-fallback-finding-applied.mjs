#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const FINDINGS_INPUT = "data/review/representative-lot-fallback-browser-findings.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";

function parseArgs(argv) {
  const args = {
    rank: "",
    checkedAt: "",
    write: false,
    refresh: false,
    help: false,
  };

  for (const arg of argv) {
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
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=12 [--checked-at=YYYY-MM-DD|today] [--write] [--refresh]

Behavior:
  - rank의 최신 finding 또는 지정한 checked-at finding을 찾아 applied 검증을 수행
  - 검증 항목: matrix source basis, presentSn, 데이터 기준일, 수동 확인일, project-note 반영
  - default mode is dry-run
  - --refresh requires --write`);
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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

async function readText(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

function latestFinding(rows) {
  return [...rows].sort((left, right) => String(right.checked_at || "").localeCompare(String(left.checked_at || "")))[0] || null;
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

function verify(finding, matrixRow, noteText) {
  const checks = {
    matrix_row_found: Boolean(matrixRow.rank),
    source_basis_match: String(matrixRow.business_layer_source_basis || "") === "manual_fallback_confirmation",
    present_sn_match: String(matrixRow.business_present_sn || "") === String(finding.present_sn || ""),
    data_reference_date_match:
      String(matrixRow.business_layer_data_reference_date || "") === String(finding.urban_data_reference_date || ""),
    manual_review_date_match: String(matrixRow.business_layer_manual_review_date || "") === String(finding.checked_at || ""),
    manual_review_status_match: String(matrixRow.business_layer_manual_review_status || "") === "confirmed_current_business",
    note_present_sn_match: Boolean(finding.present_sn) && noteText.includes(String(finding.present_sn || "")),
    note_checked_at_match: Boolean(finding.checked_at) && noteText.includes(String(finding.checked_at || "")),
  };
  checks.all_passed = Object.values(checks).every(Boolean);
  return checks;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.rank) throw new Error("--rank is required");
  if (args.checkedAt === "today") args.checkedAt = kstDate();
  if (args.refresh && !args.write) throw new Error("--refresh requires --write");

  const [findings, matrixRows] = await Promise.all([readJson(FINDINGS_INPUT, []), readJson(MATRIX_INPUT, [])]);
  const candidates = findings.filter((row) => String(row.rank || "") === args.rank);
  if (!candidates.length) throw new Error(`rank ${args.rank} finding not found`);

  const finding = args.checkedAt
    ? candidates.find((row) => String(row.checked_at || "") === args.checkedAt) || null
    : latestFinding(candidates);
  if (!finding) throw new Error(`rank ${args.rank} checked_at ${args.checkedAt} finding not found`);
  if (finding.check_status !== "confirmed_current_business") {
    throw new Error(`rank ${args.rank} finding is ${finding.check_status}, only confirmed_current_business can be marked applied`);
  }

  const matrixRow = matrixRows.find((row) => String(row.rank || "") === args.rank) || {};
  const noteText = matrixRow.project_note ? await readText(matrixRow.project_note) : "";
  const checks = verify(finding, matrixRow, noteText);

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        target: { rank: args.rank, checked_at: finding.checked_at, project_name: finding.project_name },
        checks,
      },
      null,
      2,
    ),
  );

  if (!checks.all_passed) {
    throw new Error("matrix/project-note reflection checks failed; fix reflected values before marking applied");
  }

  if (!args.write) return;

  const nextRows = findings.map((row) =>
    String(row.rank || "") === args.rank && String(row.checked_at || "") === String(finding.checked_at)
      ? { ...row, apply_status: "applied" }
      : row,
  );
  await writeFile(FINDINGS_INPUT, `${JSON.stringify(nextRows, null, 2)}\n`, "utf8");
  console.log(`wrote ${FINDINGS_INPUT}`);

  if (args.refresh) {
    await runCommand("node", ["scripts/generate-representative-lot-fallback-api-probe.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-command-packet.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-finding-board.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-apply-audit.mjs"]);
    await runCommand("node", ["scripts/generate-personal-research-home.mjs"]);
    await runCommand("node", ["scripts/generate-research-now-action-board.mjs"]);
    await runCommand("node", ["scripts/generate-research-manual-web-session-packet.mjs"]);
    await runCommand("node", ["scripts/generate-current-research-operating-guide.mjs"]);
    await runCommand("node", ["scripts/generate-research-session-playbook.mjs"]);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
