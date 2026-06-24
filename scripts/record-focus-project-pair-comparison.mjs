#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

import { VALID_PAIR_COMPARISON_STATUSES, pairById } from "./lib/focus-project-pairs.mjs";

const INPUT = "data/review/focus-project-pair-comparisons.json";
const OBSERVATIONS_INPUT = "data/review/fieldwork-observations.json";

function parseArgs(argv) {
  const args = {
    pairId: "",
    visitedAt: "",
    status: "",
    sameDayRoute: undefined,
    officialStateDelta: undefined,
    fieldworkDelta: "",
    riskHeavierSide: undefined,
    strongerEdge: undefined,
    judgmentShift: "",
    notClosedReason: "",
    followUpAction: undefined,
    memoPath: undefined,
    notes: undefined,
    replace: false,
    write: false,
    refresh: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--replace") args.replace = true;
    else if (arg === "--write") args.write = true;
    else if (arg === "--refresh") args.refresh = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg.startsWith("--pair-id=")) args.pairId = arg.slice("--pair-id=".length).trim();
    else if (arg.startsWith("--visited-at=")) args.visitedAt = arg.slice("--visited-at=".length).trim();
    else if (arg.startsWith("--status=")) args.status = arg.slice("--status=".length).trim();
    else if (arg.startsWith("--same-day-route=")) args.sameDayRoute = arg.slice("--same-day-route=".length).trim();
    else if (arg.startsWith("--official-state-delta=")) args.officialStateDelta = arg.slice("--official-state-delta=".length).trim();
    else if (arg.startsWith("--fieldwork-delta=")) args.fieldworkDelta = arg.slice("--fieldwork-delta=".length).trim();
    else if (arg.startsWith("--risk-heavier-side=")) args.riskHeavierSide = arg.slice("--risk-heavier-side=".length).trim();
    else if (arg.startsWith("--stronger-edge=")) args.strongerEdge = arg.slice("--stronger-edge=".length).trim();
    else if (arg.startsWith("--judgment-shift=")) args.judgmentShift = arg.slice("--judgment-shift=".length).trim();
    else if (arg.startsWith("--not-closed-reason=")) args.notClosedReason = arg.slice("--not-closed-reason=".length).trim();
    else if (arg.startsWith("--follow-up-action=")) args.followUpAction = arg.slice("--follow-up-action=".length).trim();
    else if (arg.startsWith("--memo-path=")) args.memoPath = arg.slice("--memo-path=".length).trim();
    else if (arg.startsWith("--notes=")) args.notes = arg.slice("--notes=".length).trim();
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/record-focus-project-pair-comparison.mjs --pair-id=songpa-09-05 --visited-at=YYYY-MM-DD --status=draft --fieldwork-delta='...' --judgment-shift='...' --not-closed-reason='...' [options] [--write] [--refresh]

Required:
  --pair-id=songpa-09-05
  --visited-at=YYYY-MM-DD
  --status=draft|reviewed|applied
  --fieldwork-delta='같은 날 두 사업의 현장 차이'
  --judgment-shift='가설이 어떻게 흔들렸는지'
  --not-closed-reason='왜 아직 결론을 닫지 못하는지'

Common options:
  --same-day-route='잠실역 -> 잠실우성4차 -> 장미1,2,3차'
  --official-state-delta='원문/회신 차이'
  --risk-heavier-side='잠실우성4차::행사 혼잡'
  --stronger-edge='장미1,2,3차::한강 접근 체감'
  --follow-up-action='project-notes/...; analysis/life-area-comparison-worksheet.md'
  --memo-path='analysis/focus-project-pair-comparison-starter.md'
  --notes='추가 메모'
  --replace
  --write
  --refresh

Behavior:
  - default mode is dry-run
  - pair_id는 미리 정의된 핵심 3개 조합만 허용
  - 같은 날 두 사업 관찰이 fieldwork-observations.json에 있어야 기록 가능
  - --refresh는 pair comparison 보드와 personal home을 갱신`);
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) throw new Error(`${label} must be YYYY-MM-DD`);
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function nextValue(provided, fallback) {
  return provided === undefined ? fallback : provided;
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

  const pairs = pairById();
  const pair = pairs.get(args.pairId);
  if (!pair) throw new Error(`Unknown --pair-id: ${args.pairId}`);
  validateDate(args.visitedAt, "--visited-at");
  if (!VALID_PAIR_COMPARISON_STATUSES.has(args.status)) {
    throw new Error(`--status must be one of: ${[...VALID_PAIR_COMPARISON_STATUSES].join(", ")}`);
  }
  if (!sanitizeText(args.fieldworkDelta)) throw new Error("--fieldwork-delta is required");
  if (!sanitizeText(args.judgmentShift)) throw new Error("--judgment-shift is required");
  if (!sanitizeText(args.notClosedReason)) throw new Error("--not-closed-reason is required");
  if (args.refresh && !args.write) throw new Error("--refresh requires --write");

  const pairRows = await readJson(INPUT, []);
  const observationRows = await readJson(OBSERVATIONS_INPUT, []);
  const obsA = observationRows.find((row) => String(row.rank || "") === pair.rank_a && String(row.visited_at || "") === args.visitedAt);
  const obsB = observationRows.find((row) => String(row.rank || "") === pair.rank_b && String(row.visited_at || "") === args.visitedAt);
  if (!obsA || !obsB) {
    throw new Error(`same-day observations missing for pair ${args.pairId} on ${args.visitedAt}; record both fieldwork observations first`);
  }

  const existingIndex = pairRows.findIndex(
    (row) => String(row.pair_id || "") === pair.pair_id && String(row.visited_at || "") === args.visitedAt,
  );
  if (existingIndex >= 0 && !args.replace) throw new Error(`pair ${args.pairId} already has a ${args.visitedAt} entry; use --replace to overwrite`);
  if (existingIndex < 0 && args.replace) throw new Error(`pair ${args.pairId} has no ${args.visitedAt} entry to replace`);

  const nextRow = {
    pair_id: pair.pair_id,
    pair_name: pair.pair_name,
    visited_at: args.visitedAt,
    rank_a: pair.rank_a,
    rank_b: pair.rank_b,
    comparison_status: args.status,
    same_day_route: nextValue(args.sameDayRoute, pair.same_day_route),
    official_state_delta: nextValue(args.officialStateDelta, ""),
    fieldwork_delta: args.fieldworkDelta,
    risk_heavier_side: nextValue(args.riskHeavierSide, ""),
    stronger_edge: nextValue(args.strongerEdge, ""),
    judgment_shift: args.judgmentShift,
    not_closed_reason: args.notClosedReason,
    follow_up_action: nextValue(args.followUpAction, pair.default_follow_up_action),
    memo_path: nextValue(args.memoPath, "analysis/focus-project-pair-comparison-starter.md"),
    notes: nextValue(args.notes, ""),
  };

  const nextRows =
    existingIndex >= 0 ? pairRows.map((row, index) => (index === existingIndex ? nextRow : row)) : [...pairRows, nextRow];

  if (args.write) {
    await writeFile(INPUT, `${JSON.stringify(nextRows, null, 2)}\n`);
    if (args.refresh) {
      await runCommand("node", ["scripts/generate-focus-project-pair-comparison-board.mjs"]);
      await runCommand("node", ["scripts/generate-personal-research-home.mjs"]);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        wrote: args.write,
        refreshed: args.write && args.refresh,
        input: INPUT,
        pair_id: nextRow.pair_id,
        pair_name: nextRow.pair_name,
        visited_at: nextRow.visited_at,
        comparison_status: nextRow.comparison_status,
        fieldwork_delta: nextRow.fieldwork_delta,
        judgment_shift: nextRow.judgment_shift,
        not_closed_reason: nextRow.not_closed_reason,
        follow_up_action: nextRow.follow_up_action,
        next_steps: args.write
          ? args.refresh
            ? ["analysis/focus-project-pair-comparison-board.md", "analysis/personal-research-home.md"]
            : ["node scripts/generate-focus-project-pair-comparison-board.mjs", "node scripts/generate-personal-research-home.mjs"]
          : ["검토 후 --write 추가", "필요하면 --refresh 추가"],
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
