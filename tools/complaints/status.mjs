#!/usr/bin/env node
// Read retained local state. No portal, account or filing operations.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadStore } from "./tracker.mjs";
import { planChecks } from "./monitor.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function summarizeStatus(cases, asOf) {
  const plan = planChecks(cases, asOf);
  const records = [...cases.values()];
  const checked = records.map(r => r.last_checked_on).filter(Boolean).sort();
  const aftercare = plan.checks.filter(r => r.pending_additional_answer).length;
  const byPortal = {};
  for (const item of plan.checks) byPortal[item.portal] = (byPortal[item.portal] ?? 0) + 1;
  return {
    as_of: asOf,
    basis: "retained_local_records_not_a_fresh_portal_query",
    tracked_cases: records.length,
    query_targets: plan.checks.length,
    pending_formal_targets: plan.checks.length - aftercare,
    pending_additional_answers: aftercare,
    unresolved_reply_review_cases: plan.review_queue.length,
    pending_by_portal: byPortal,
    last_checked_range: checked.length ? { oldest: checked[0], newest: checked.at(-1) } : null,
    displayed_deadlines: plan.checks.filter(r => r.portal_due_on && !r.pending_additional_answer)
      .map(r => ({ portal: r.portal, due_on: r.portal_due_on })),
  };
}

export async function readStatus(dataDir, asOf) {
  const { cases } = await loadStore(dataDir);
  let current = null;
  try { current = JSON.parse(await readFile(path.join(dataDir, "current.json"), "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  // Select navigation metadata, not arbitrary profile fields or ledger text.
  const pointers = current?.paths ?? null;
  return { ...summarizeStatus(cases, asOf), current_paths: pointers };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => a !== "--json" && !a.startsWith("--data-dir=") && !a.startsWith("--as-of=")))
    throw new Error("Usage: status.mjs [--json] [--data-dir=/absolute/path] [--as-of=YYYY-MM-DD]");
  const dataDir = path.resolve(args.find(a => a.startsWith("--data-dir="))?.slice(11) ?? path.join(ROOT, "data/complaints"));
  const asOf = args.find(a => a.startsWith("--as-of="))?.slice(8)
    ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const status = await readStatus(dataDir, asOf);
  if (args.includes("--json")) { console.log(JSON.stringify(status, null, 2)); return; }
  console.log(`Retained complaint state as of ${status.as_of}; no fresh portal query.`);
  console.log(`Cases: ${status.tracked_cases}; query targets: ${status.query_targets} (${status.pending_formal_targets} formal + ${status.pending_additional_answers} aftercare).`);
  console.log(`Unresolved reply review: ${status.unresolved_reply_review_cases}; counts overlap with query targets.`);
  console.log(`Last successful checks: ${status.last_checked_range ? `${status.last_checked_range.oldest} to ${status.last_checked_range.newest}` : "not recorded"}.`);
  console.log("Current paths:");
  if (status.current_paths) for (const [key, value] of Object.entries(status.current_paths)) console.log(`  ${key}: ${value}`);
  else console.log("  current.json is absent; inspect the relevant accepted evidence before choosing a working version.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.code === "ENOENT" ? "Private complaint records are unavailable. This is not evidence of zero cases." : error.message);
    process.exitCode = 1;
  });
}
