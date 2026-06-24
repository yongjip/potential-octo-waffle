#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const INPUT = "data/review/fieldwork-observations.json";
const ROUTE_INPUT = "analysis/fieldwork-route-planner.json";
const STARTER_INPUT = "data/review/fieldwork-observations-core-routes-starter.json";
const VALID_BARRIER_LEVELS = new Set(["", "low", "medium", "high"]);
const VALID_CONFIDENCE_CHANGES = new Set(["up", "flat", "down"]);

function parseArgs(argv) {
  const args = {
    rank: "",
    visitedAt: "",
    stationExit: "",
    routeSegment: undefined,
    walkMinutes: undefined,
    crossingWaitMinutes: undefined,
    barrierLevel: undefined,
    busTransferNote: undefined,
    boundaryCondition: undefined,
    photoRefs: undefined,
    observedSignal: "",
    interpretation: "",
    confidenceChange: "",
    followUpAction: undefined,
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
      args.rank = arg.slice("--rank=".length).trim();
      continue;
    }
    if (arg.startsWith("--visited-at=")) {
      args.visitedAt = arg.slice("--visited-at=".length).trim();
      continue;
    }
    if (arg.startsWith("--station-exit=")) {
      args.stationExit = arg.slice("--station-exit=".length).trim();
      continue;
    }
    if (arg.startsWith("--route-segment=")) {
      args.routeSegment = arg.slice("--route-segment=".length).trim();
      continue;
    }
    if (arg.startsWith("--walk-minutes=")) {
      args.walkMinutes = arg.slice("--walk-minutes=".length).trim();
      continue;
    }
    if (arg.startsWith("--crossing-wait-minutes=")) {
      args.crossingWaitMinutes = arg.slice("--crossing-wait-minutes=".length).trim();
      continue;
    }
    if (arg.startsWith("--barrier-level=")) {
      args.barrierLevel = arg.slice("--barrier-level=".length).trim();
      continue;
    }
    if (arg.startsWith("--bus-transfer-note=")) {
      args.busTransferNote = arg.slice("--bus-transfer-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--boundary-condition=")) {
      args.boundaryCondition = arg.slice("--boundary-condition=".length).trim();
      continue;
    }
    if (arg.startsWith("--photo-refs=")) {
      args.photoRefs = arg.slice("--photo-refs=".length).trim();
      continue;
    }
    if (arg.startsWith("--observed-signal=")) {
      args.observedSignal = arg.slice("--observed-signal=".length).trim();
      continue;
    }
    if (arg.startsWith("--interpretation=")) {
      args.interpretation = arg.slice("--interpretation=".length).trim();
      continue;
    }
    if (arg.startsWith("--confidence-change=")) {
      args.confidenceChange = arg.slice("--confidence-change=".length).trim();
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
  console.log(`Usage: node scripts/record-fieldwork-observation.mjs --rank=9 --visited-at=YYYY-MM-DD --station-exit='잠실역 10번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat [options] [--write] [--refresh]

Required:
  --rank=9
  --visited-at=YYYY-MM-DD
  --station-exit='역명 N번 출구'
  --observed-signal='현장 관찰 신호'
  --interpretation='가설에 미치는 해석'
  --confidence-change=up|flat|down

Common options:
  --route-segment='잠실역 -> 잠실우성4차 경계'
  --walk-minutes=12
  --crossing-wait-minutes=3
  --barrier-level=low|medium|high
  --bus-transfer-note='버스 보완 가능성'
  --boundary-condition='간선도로, 한강 단절'
  --photo-refs='data/fieldwork/photos/...jpg'
  --follow-up-action='project-notes/09-tw2w7iwv.md; analysis/transport-location-context.md'
  --replace     same rank + visited_at row overwrite
  --write       persist changes
  --refresh     after write, regenerate fieldwork notebook + pair board + fieldwork/weekly/life-area boards + personal home

Behavior:
  - default mode is dry-run
  - project_name, route_id, route_name are filled from fieldwork-route-planner
  - route_segment and follow_up_action fall back to starter templates when omitted
  - observation facts are never guessed; only metadata defaults are filled`);
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

function validateBlankOrNumber(value, label) {
  if (value === undefined || value === "") return;
  if (!Number.isFinite(Number(value))) {
    throw new Error(`${label} must be a number when provided`);
  }
}

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function nextValue(provided, fallback) {
  return provided === undefined ? fallback : provided;
}

function sanitizeText(value) {
  return String(value || "").trim();
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
  validateDate(args.visitedAt, "--visited-at");
  if (!sanitizeText(args.stationExit)) throw new Error("--station-exit is required");
  if (!sanitizeText(args.observedSignal)) throw new Error("--observed-signal is required");
  if (!sanitizeText(args.interpretation)) throw new Error("--interpretation is required");
  if (!VALID_CONFIDENCE_CHANGES.has(args.confidenceChange)) {
    throw new Error(`--confidence-change must be one of: ${[...VALID_CONFIDENCE_CHANGES].join(", ")}`);
  }
  if (args.barrierLevel !== undefined && !VALID_BARRIER_LEVELS.has(args.barrierLevel)) {
    throw new Error(`--barrier-level must be one of: ${[...VALID_BARRIER_LEVELS].join(", ")}`);
  }
  validateBlankOrNumber(args.walkMinutes, "--walk-minutes");
  validateBlankOrNumber(args.crossingWaitMinutes, "--crossing-wait-minutes");
  if (String(args.photoRefs || "").includes("|")) {
    throw new Error("--photo-refs must not contain |");
  }
  if (args.refresh && !args.write) {
    throw new Error("--refresh requires --write");
  }

  const observationRows = await readJson(INPUT, []);
  const routeRows = await readJson(ROUTE_INPUT, []);
  const starterRows = await readJson(STARTER_INPUT, []);

  const routeByRank = byRank(routeRows);
  const starterByRank = byRank(starterRows);
  const route = routeByRank.get(String(args.rank));
  if (!route) throw new Error(`rank ${args.rank} not found in ${ROUTE_INPUT}`);
  const starter = starterByRank.get(String(args.rank)) || {};

  const existingIndex = observationRows.findIndex(
    (row) => String(row.rank || "") === String(args.rank) && String(row.visited_at || "") === String(args.visitedAt),
  );
  if (existingIndex >= 0 && !args.replace) {
    throw new Error(`rank ${args.rank} already has a ${args.visitedAt} observation; use --replace to overwrite`);
  }
  if (existingIndex < 0 && args.replace) {
    throw new Error(`rank ${args.rank} has no ${args.visitedAt} observation to replace`);
  }

  const nextRow = {
    rank: String(route.rank),
    project_name: route.project_name,
    visited_at: args.visitedAt,
    route_id: route.route_id,
    route_name: route.route_name,
    route_segment: nextValue(args.routeSegment, starter.route_segment || `${route.estimated_station_area || "역"} -> ${route.project_name} 경계`),
    station_exit: args.stationExit,
    walk_minutes: nextValue(args.walkMinutes, ""),
    crossing_wait_minutes: nextValue(args.crossingWaitMinutes, ""),
    barrier_level: nextValue(args.barrierLevel, ""),
    bus_transfer_note: nextValue(args.busTransferNote, ""),
    boundary_condition: nextValue(args.boundaryCondition, ""),
    photo_refs: nextValue(args.photoRefs, ""),
    observed_signal: args.observedSignal,
    interpretation: args.interpretation,
    confidence_change: args.confidenceChange,
    follow_up_action: nextValue(args.followUpAction, starter.follow_up_action || route.project_note || ""),
  };

  const nextRows =
    existingIndex >= 0
      ? observationRows.map((row, index) => (index === existingIndex ? nextRow : row))
      : [...observationRows, nextRow];

  if (args.write) {
    await writeFile(INPUT, `${JSON.stringify(nextRows, null, 2)}\n`);
    if (args.refresh) {
      await runCommand("node", ["scripts/generate-fieldwork-observation-notebook.mjs"]);
      await runCommand("node", ["scripts/generate-focus-project-fieldwork-cockpit.mjs"]);
      await runCommand("node", ["scripts/generate-focus-project-pair-comparison-board.mjs"]);
      await runCommand("node", ["scripts/generate-weekly-monitoring-comparison-board.mjs"]);
      await runCommand("node", ["scripts/generate-life-area-monitoring-board.mjs"]);
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
        replace: args.replace,
        rank: nextRow.rank,
        project_name: nextRow.project_name,
        route_name: nextRow.route_name,
        visited_at: nextRow.visited_at,
        station_exit: nextRow.station_exit,
        walk_minutes: nextRow.walk_minutes,
        crossing_wait_minutes: nextRow.crossing_wait_minutes,
        barrier_level: nextRow.barrier_level,
        observed_signal: nextRow.observed_signal,
        interpretation: nextRow.interpretation,
        confidence_change: nextRow.confidence_change,
        follow_up_action: nextRow.follow_up_action,
        next_steps: args.write
          ? args.refresh
            ? [
                "analysis/fieldwork-observation-notebook.md",
                "analysis/focus-project-fieldwork-cockpit.md",
                "analysis/focus-project-pair-comparison-board.md",
                "analysis/weekly-monitoring-comparison-board.md",
                "analysis/life-area-monitoring-board.md",
                "analysis/personal-research-home.md",
              ]
            : [
                "node scripts/generate-fieldwork-observation-notebook.mjs",
                "node scripts/generate-focus-project-fieldwork-cockpit.mjs",
                "node scripts/generate-focus-project-pair-comparison-board.mjs",
                "node scripts/generate-weekly-monitoring-comparison-board.mjs",
                "node scripts/generate-life-area-monitoring-board.mjs",
                "node scripts/generate-personal-research-home.mjs",
              ]
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
