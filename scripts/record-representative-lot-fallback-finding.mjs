#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const INPUT = "data/review/representative-lot-fallback-browser-findings.json";
const EDGE_PACKET_INPUT = "analysis/representative-lot-fallback-edge-session-packet.json";
const API_PROBE_INPUT = "analysis/representative-lot-fallback-api-probe.json";
const VALID_CHECK_STATUSES = new Set([
  "confirmed_current_business",
  "stage_gap_hold",
  "planning_layer_only",
  "no_present_sn_found",
  "ambiguous_candidate",
  "candidate_rejected",
]);
const VALID_APPLY_STATUSES = new Set(["pending_apply", "applied"]);

function parseArgs(argv) {
  const args = {
    rank: "",
    checkedAt: "",
    checkStatus: "",
    presentSn: undefined,
    urbanDataReferenceDate: undefined,
    urbanBusinessType: undefined,
    cleanupSiteUrl: undefined,
    verifiedZoneName: undefined,
    evidenceUrl: undefined,
    evidenceNote: undefined,
    decisionNote: undefined,
    applyStatus: undefined,
    followUpAction: undefined,
    replace: false,
    prefillFromApi: false,
    autoMarkApplied: false,
    write: false,
    refresh: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--replace") {
      args.replace = true;
      continue;
    }
    if (arg === "--prefill-from-api") {
      args.prefillFromApi = true;
      continue;
    }
    if (arg === "--auto-mark-applied") {
      args.autoMarkApplied = true;
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
    if (arg.startsWith("--present-sn=")) {
      args.presentSn = arg.slice("--present-sn=".length).trim();
      continue;
    }
    if (arg.startsWith("--urban-data-reference-date=")) {
      args.urbanDataReferenceDate = arg.slice("--urban-data-reference-date=".length).trim();
      continue;
    }
    if (arg.startsWith("--urban-business-type=")) {
      args.urbanBusinessType = arg.slice("--urban-business-type=".length).trim();
      continue;
    }
    if (arg.startsWith("--cleanup-site-url=")) {
      args.cleanupSiteUrl = arg.slice("--cleanup-site-url=".length).trim();
      continue;
    }
    if (arg.startsWith("--verified-zone-name=")) {
      args.verifiedZoneName = arg.slice("--verified-zone-name=".length).trim();
      continue;
    }
    if (arg.startsWith("--evidence-url=")) {
      args.evidenceUrl = arg.slice("--evidence-url=".length).trim();
      continue;
    }
    if (arg.startsWith("--evidence-note=")) {
      args.evidenceNote = arg.slice("--evidence-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--decision-note=")) {
      args.decisionNote = arg.slice("--decision-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--apply-status=")) {
      args.applyStatus = arg.slice("--apply-status=".length).trim();
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
  console.log(`Usage: node scripts/record-representative-lot-fallback-finding.mjs --rank=12 --checked-at=YYYY-MM-DD|today --check-status=confirmed_current_business [options] [--write] [--refresh]

Required:
  --rank=12
  --checked-at=YYYY-MM-DD
  --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected

Common options:
  --present-sn='11000UQ120PS20YYYYMMDD0001'
  --urban-data-reference-date=YYYY-MM-DD
  --urban-business-type='재건축(공동)'
  --cleanup-site-url=https://...
  --verified-zone-name='압구정아파트지구특별계획구역5'
  --evidence-url=https://...
  --evidence-note='recordCode popup과 UQ120 상세에서 확인'
  --decision-note='same-stage current business로 확인'
  --apply-status=pending_apply|applied
  --follow-up-action='analysis/project-comparison-matrix.md; project-notes/...'
  --replace     same rank + checked_at row overwrite
  --prefill-from-api  when available, use analysis/representative-lot-fallback-api-probe.json values as defaults
  --auto-mark-applied  after write+refresh, try mark-representative-lot-fallback-finding-applied automatically
  --write       persist changes
  --refresh     after write, regenerate finding board + edge session packet + manual packet + operating guide + session playbook + official registry

Behavior:
  - default mode is dry-run
  - confirmed_current_business requires present-sn and urban-data-reference-date
  - hold/reject statuses should include decision-note
  - --auto-mark-applied requires --write and --refresh
  - --refresh also regenerates project-comparison-matrix, project-notes, and apply audit`);
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

function validateUrl(value, label) {
  if (value && !/^https?:\/\//i.test(value)) {
    throw new Error(`${label} must start with http:// or https://`);
  }
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

function nextValue(provided, current) {
  return provided === undefined ? current : provided;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.rank) throw new Error("--rank is required");
  if (args.checkedAt === "today") args.checkedAt = kstDate();
  validateDate(args.checkedAt, "--checked-at");
  if (!VALID_CHECK_STATUSES.has(args.checkStatus)) {
    throw new Error(`--check-status must be one of: ${[...VALID_CHECK_STATUSES].join(", ")}`);
  }
  if (args.applyStatus !== undefined && !VALID_APPLY_STATUSES.has(args.applyStatus)) {
    throw new Error(`--apply-status must be one of: ${[...VALID_APPLY_STATUSES].join(", ")}`);
  }
  validateUrl(args.cleanupSiteUrl, "--cleanup-site-url");
  validateUrl(args.evidenceUrl, "--evidence-url");
  if (args.urbanDataReferenceDate) validateDate(args.urbanDataReferenceDate, "--urban-data-reference-date");
  if (args.refresh && !args.write) throw new Error("--refresh requires --write");
  if (args.autoMarkApplied && (!args.write || !args.refresh)) {
    throw new Error("--auto-mark-applied requires --write and --refresh");
  }

  const [rows, edgePacket] = await Promise.all([readJson(INPUT, []), readJson(EDGE_PACKET_INPUT, { rows: [] })]);
  const apiProbe = args.prefillFromApi ? await readJson(API_PROBE_INPUT, { rows: [] }) : { rows: [] };
  const target = (edgePacket.rows || []).find((row) => String(row.target || "").startsWith(`${args.rank}. `));
  if (!target) throw new Error(`rank ${args.rank} not found in ${EDGE_PACKET_INPUT}`);
  const apiRow = (apiProbe.rows || []).find((row) => String(row.rank || "") === String(args.rank)) || {};

  const existingIndex = rows.findIndex(
    (row) => String(row.rank || "") === String(args.rank) && String(row.checked_at || "") === String(args.checkedAt),
  );
  if (existingIndex >= 0 && !args.replace) {
    throw new Error(`rank ${args.rank} already has a ${args.checkedAt} finding; use --replace to overwrite`);
  }
  if (existingIndex < 0 && args.replace) {
    throw new Error(`rank ${args.rank} has no ${args.checkedAt} finding to replace`);
  }

  const current = existingIndex >= 0 ? rows[existingIndex] : {};
  const apiPresentSn = args.prefillFromApi ? String(apiRow.top_present_sn || "").trim() : "";
  const apiReferenceDate = args.prefillFromApi ? String(apiRow.top_data_reference_date || "").trim() : "";
  const apiBusinessType = args.prefillFromApi ? String(apiRow.top_business_type || "").trim() : "";
  const apiCleanupUrl = args.prefillFromApi ? String(apiRow.top_cleanup_site_url || "").trim() : "";
  const apiZoneName = args.prefillFromApi ? String(apiRow.top_candidate_name || "").trim() : "";
  const apiDecisionNote =
    args.prefillFromApi && apiRow.api_verdict === "planning_hold"
      ? "API probe상 planning 후보가 우선이라 current business 채택 금지"
      : args.prefillFromApi && apiRow.api_verdict === "needs_manual_confirmation"
        ? "API probe상 후보 충돌 또는 static/API 판정 엇갈림이 있어 Edge 상세 대조가 필요"
        : args.prefillFromApi && apiRow.api_verdict === "stage_gap_hold"
          ? "API probe상 direct notice보다 앞 단계 후보라 current business 승격 보류"
      : "";
  const apiEvidenceNote =
    args.prefillFromApi && apiPresentSn
      ? `API probe와 Edge 화면 대조 기준값: presentSn ${apiPresentSn}, 기준일 ${apiReferenceDate || "-"}, 단계 ${apiRow.top_propel_name || "-"}`
      : current.evidence_note || "";
  const nextRow = {
    rank: String(args.rank),
    project_name: String(target.target || "").replace(/^\d+\.\s*/, ""),
    checked_at: args.checkedAt,
    check_status: args.checkStatus,
    present_sn: nextValue(args.presentSn, current.present_sn || apiPresentSn || ""),
    urban_data_reference_date: nextValue(args.urbanDataReferenceDate, current.urban_data_reference_date || apiReferenceDate || ""),
    urban_business_type: nextValue(args.urbanBusinessType, current.urban_business_type || apiBusinessType || ""),
    cleanup_site_url: nextValue(args.cleanupSiteUrl, current.cleanup_site_url || apiCleanupUrl || ""),
    verified_zone_name: nextValue(args.verifiedZoneName, current.verified_zone_name || apiZoneName || ""),
    evidence_url: nextValue(args.evidenceUrl, current.evidence_url || ""),
    evidence_note: nextValue(args.evidenceNote, apiEvidenceNote),
    decision_note: nextValue(args.decisionNote, current.decision_note || apiDecisionNote || ""),
    apply_status: nextValue(args.applyStatus, current.apply_status || "pending_apply"),
    follow_up_action: nextValue(args.followUpAction, current.follow_up_action || target.output_route || ""),
  };

  if (args.checkStatus === "confirmed_current_business") {
    if (!String(nextRow.present_sn || "").trim()) throw new Error("confirmed_current_business requires --present-sn");
    if (!String(nextRow.urban_data_reference_date || "").trim()) {
      throw new Error("confirmed_current_business requires --urban-data-reference-date");
    }
  }

  if (
    ["stage_gap_hold", "planning_layer_only", "no_present_sn_found", "ambiguous_candidate", "candidate_rejected"].includes(args.checkStatus) &&
    !String(nextRow.decision_note || "").trim()
  ) {
    throw new Error(`${args.checkStatus} requires --decision-note`);
  }

  const nextRows =
    existingIndex >= 0 ? rows.map((row, index) => (index === existingIndex ? nextRow : row)) : [...rows, nextRow];

  console.log(JSON.stringify({ mode: args.write ? "write" : "dry_run", entry: nextRow }, null, 2));

  if (!args.write) return;

  await writeFile(INPUT, `${JSON.stringify(nextRows, null, 2)}\n`, "utf8");
  console.log(`wrote ${INPUT}`);

  if (args.refresh) {
    await runCommand("node", ["scripts/generate-representative-lot-fallback-api-probe.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-command-packet.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-finding-board.mjs"]);
    await runCommand("node", ["scripts/generate-project-comparison-matrix.mjs"]);
    await runCommand("node", ["scripts/generate-project-notes.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-apply-audit.mjs"]);
    await runCommand("node", ["scripts/generate-personal-research-home.mjs"]);
    await runCommand("node", ["scripts/generate-research-now-action-board.mjs"]);
    await runCommand("node", ["scripts/generate-representative-lot-fallback-edge-session-packet.mjs"]);
    await runCommand("node", ["scripts/generate-research-manual-web-session-packet.mjs"]);
    await runCommand("node", ["scripts/generate-current-research-operating-guide.mjs"]);
    await runCommand("node", ["scripts/generate-research-session-playbook.mjs"]);
    await runCommand("node", ["scripts/generate-official-web-query-registry.mjs"]);
  }

  if (args.autoMarkApplied) {
    if (args.checkStatus !== "confirmed_current_business") {
      console.warn("[auto_mark_applied] skipped: confirmed_current_business일 때만 applied 승격을 시도합니다.");
      return;
    }
    try {
      await runCommand("node", [
        "scripts/mark-representative-lot-fallback-finding-applied.mjs",
        `--rank=${args.rank}`,
        `--checked-at=${args.checkedAt}`,
        "--write",
        "--refresh",
      ]);
    } catch (error) {
      console.warn(`[auto_mark_applied] skipped: ${error.message || error}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
