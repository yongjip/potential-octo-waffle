#!/usr/bin/env node

// The scheduled agent performs browser queries. This helper never signs in,
// fetches a portal, files a petition, or sends a message.
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { appendFile, mkdir, open, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { applyEvent, loadStore, recordEvent } from "./tracker.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ACTIVE = new Set(["submission_unknown", "submitted", "waiting"]);
const FIELDS = new Set(["status", "status_raw", "agency", "portal_due_on", "received_on", "response_on"]);
const HOSTS = { epeople: ["www.epeople.go.kr", "epeople.go.kr"], open_go_kr: ["www.open.go.kr", "open.go.kr"], seoul_eungdapso: ["eungdapso.seoul.go.kr"], seoul_council: ["www.smc.seoul.kr", "smc.seoul.kr"] };
const DAY = 86400000;
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const digest = content => createHash("sha256").update(content).digest("hex");
const dayAt = timestamp => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(timestamp));
const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function identityFor(record) {
  return record.portal === "seoul_council" ? { type: "portal_record_id", value: record.portal_record_id } : { type: "receipt_number", value: record.receipt_number };
}

export function planChecks(cases, asOf) {
  requireValue(validDay(asOf), "as_of must be a real YYYY-MM-DD date");
  const checks = [...cases.values()].filter(r => ACTIVE.has(r.status)).map(r => ({ case_id: r.case_id, portal: r.portal, title: r.title, agency: r.agency, identity: identityFor(r), source_url: r.source.url ?? null, status: r.status, status_raw: r.status_raw ?? null, portal_due_on: r.portal_due_on ?? null, next_check_on: r.next_check_on ?? null }));
  checks.sort((a, b) => (a.portal_due_on ?? "9999").localeCompare(b.portal_due_on ?? "9999") || a.portal.localeCompare(b.portal) || a.case_id.localeCompare(b.case_id));
  return { as_of: asOf, checks, review_queue: [...cases.values()].filter(r => r.status === "response_received" && r.resolution_status !== "resolved").map(r => ({ case_id: r.case_id, next_action: r.next_action, unanswered: r.questions.filter(q => ["unanswered", "partial"].includes(q.answer_status)).map(q => q.id) })) };
}

async function readHistory(dataDir) {
  try { return (await readFile(path.join(dataDir, "monitor", "runs.jsonl"), "utf8")).split("\n").filter(Boolean).map(JSON.parse); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

async function evidence(dataDir, relative) {
  requireValue(typeof relative === "string" && relative.length > 0 && !path.isAbsolute(relative), "Evidence requires a private relative path");
  const file = path.resolve(dataDir, relative);
  requireValue(file.startsWith(`${path.resolve(dataDir)}${path.sep}`), "Evidence must stay inside data-dir");
  const info = await stat(file);
  requireValue(info.isFile() && info.size > 0, "Evidence must be a nonempty file");
  return readFile(file, "utf8");
}

export async function validateRun(dataDir, run, cases) {
  requireValue(/^[a-z0-9][a-z0-9-]{0,100}$/.test(run.run_id ?? ""), "Invalid run_id");
  requireValue(typeof run.observed_at === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(run.observed_at) && !Number.isNaN(Date.parse(run.observed_at)), "observed_at needs time and timezone");
  requireValue(Array.isArray(run.observations) && run.observations.length > 0, "observations are required");
  const ids = new Set();
  for (const o of run.observations) {
    requireValue(cases.has(o.case_id) && !ids.has(o.case_id), "Unknown or duplicate case in run");
    ids.add(o.case_id);
    const r = cases.get(o.case_id);
    requireValue(isDeepStrictEqual(identityFor(r), o.identity) && !!o.identity.value, "Observation identity does not match the case");
    requireValue(["observed", "auth_required", "unavailable"].includes(o.result), "Unknown observation result");
    const url = new URL(o.url);
    const authHost = o.result !== "observed" && r.portal === "seoul_eungdapso" && ["www.seoul.go.kr", "seoul.go.kr"].includes(url.hostname);
    requireValue(url.protocol === "https:" && (HOSTS[r.portal].includes(url.hostname) || authHost), "Observation must use the case's official portal");
    const text = await evidence(dataDir, o.evidence_path);
    if (o.result !== "observed") {
      requireValue(!o.values && !o.reply, "A failed query cannot change case facts");
      requireValue(typeof o.reason === "string" && o.reason.length > 0, "A failed query needs its observed reason");
      continue;
    }
    requireValue(text.includes(o.identity.value), "Evidence must contain the observed case identifier");
    if (r.portal === "seoul_council") {
      const detail = url.pathname.endsWith("/BoardDetail.do") && url.searchParams.get("boardId") === o.identity.value;
      const list = url.pathname.endsWith("/BoardList.do") && url.searchParams.get("boardTypeId") === "162" && text.includes(`goDetail_162('${o.identity.value}'`);
      requireValue(detail || list, "Council evidence must match its detail ID or an observed list-row link");
    }
    requireValue(o.values && typeof o.values === "object" && !Array.isArray(o.values), "Observed values are required");
    for (const key of Object.keys(o.values)) requireValue(FIELDS.has(key), `Unsupported observed field: ${key}`);
    requireValue(typeof o.values.status_raw === "string" && o.values.status_raw.trim() && text.includes(o.values.status_raw), "The raw portal status must be in the saved evidence");
    if (o.values.status === "response_received" || o.reply) {
      requireValue(o.values.status === "response_received" && validDay(o.values.response_on) && o.reply, "A reply needs its displayed date and complete reply evidence");
      const replyText = await evidence(dataDir, o.reply.evidence_path);
      requireValue(digest(replyText) === o.reply.sha256, "Reply evidence hash does not match");
    }
    applyEvent(cases, makeEvent(run, o));
  }
  return run;
}

function makeEvent(run, o) {
  return { event_id: `monitor-${run.run_id}-${o.case_id}`, case_id: o.case_id, observed_at: run.observed_at, source: { kind: "portal_observation", observed_on: dayAt(run.observed_at), url: o.url, evidence_path: o.evidence_path }, changes: { ...o.values, last_checked_on: dayAt(run.observed_at) }, note: "Read-only scheduled status observation; no filing or substantive resolution inferred." };
}

export function evaluateRun(cases, history, run) {
  const previous = new Map();
  const alerted = new Set();
  for (const prior of history) {
    for (const item of prior.observations) previous.set(item.case_id, item);
    for (const alert of prior.alerts) alerted.add(alert.key);
  }
  const alerts = [];
  const failurePortals = new Set();
  const asOf = dayAt(run.observed_at);
  for (const o of run.observations) {
    const r = cases.get(o.case_id);
    const prior = previous.get(o.case_id);
    if (o.result !== "observed") {
      const portalKey = `${r.portal}:${o.result}`;
      if (prior?.result !== o.result && !failurePortals.has(portalKey)) {
        alerts.push({ key: `${run.run_id}:${portalKey}`, type: o.result, portal: r.portal, case_id: o.case_id, reason: o.reason });
        failurePortals.add(portalKey);
      }
      continue;
    }
    const baseline = [...history].reverse().flatMap(h => h.observations).find(p => p.case_id === o.case_id && p.result === "observed");
    for (const field of ["status", "status_raw", "agency", "portal_due_on"]) {
      if (!(field in o.values)) continue;
      const before = baseline?.values?.[field] ?? r[field] ?? null;
      const after = o.values[field];
      // First status spelling is a baseline, unless a complete new reply is present.
      if (!baseline && ["status", "status_raw"].includes(field)) continue;
      if (before !== after) alerts.push({ key: `${run.run_id}:${o.case_id}:${field}`, type: "changed", case_id: o.case_id, field, before, after });
    }
    if (o.reply && baseline?.reply?.sha256 !== o.reply.sha256) alerts.push({ key: `${o.case_id}:reply:${o.reply.sha256}`, type: "reply", case_id: o.case_id, evidence_path: o.reply.evidence_path });
    const due = o.values.portal_due_on === undefined ? r.portal_due_on : o.values.portal_due_on;
    const status = o.values.status ?? r.status;
    if (due && ACTIVE.has(status)) {
      const days = Math.round((Date.parse(due) - Date.parse(asOf)) / DAY);
      const stage = days < 0 ? "overdue" : days === 0 ? "today" : days === 1 ? "one-day" : days <= 3 ? "near" : null;
      if (stage) alerts.push({ key: `${o.case_id}:${due}:${stage}`, type: "due", case_id: o.case_id, portal_due_on: due, days, stage });
    }
  }
  return { run_id: run.run_id, observed_at: run.observed_at, observations: run.observations, alerts: alerts.filter(a => !alerted.has(a.key)), events: run.observations.filter(o => o.result === "observed").map(o => makeEvent(run, o)) };
}

export async function ingestRun(dataDir, run) {
  const monitorDir = path.join(dataDir, "monitor");
  await mkdir(path.join(monitorDir, "runs"), { recursive: true, mode: 0o700 });
  const lockFile = path.join(monitorDir, ".monitor.lock");
  let lock;
  try { lock = await open(lockFile, "wx", 0o600); }
  catch (error) { if (error.code === "EEXIST") throw new Error("Monitor is locked; inspect the active run before removing its lock"); throw error; }
  try {
    const { cases } = await loadStore(dataDir);
    const history = await readHistory(dataDir);
    const finished = history.find(h => h.run_id === run.run_id);
    if (finished) {
      requireValue(isDeepStrictEqual(finished.observations, run.observations) && finished.observed_at === run.observed_at, "run_id already exists with different content");
      return { run_id: run.run_id, already_recorded: true, alerts: [] };
    }
    await validateRun(dataDir, run, cases);
    const preparedPath = path.join(monitorDir, "runs", `${run.run_id}.json`);
    let prepared;
    try {
      prepared = JSON.parse(await readFile(preparedPath, "utf8"));
      requireValue(isDeepStrictEqual(prepared.input, run), "Interrupted run input changed; use the saved input");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      prepared = { input: run, result: evaluateRun(cases, history, run) };
      await writeFile(preparedPath, `${JSON.stringify(prepared, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    }
    for (const event of prepared.result.events) await recordEvent(dataDir, event);
    await appendFile(path.join(monitorDir, "runs.jsonl"), `${JSON.stringify(prepared.result)}\n`, { mode: 0o600 });
    return { run_id: run.run_id, already_recorded: false, checked: run.observations.filter(o => o.result === "observed").length, blocked: run.observations.filter(o => o.result !== "observed").length, alerts: prepared.result.alerts };
  } finally { await lock.close(); await unlink(lockFile); }
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    const match = /^--(data-dir|file|as-of)=(.+)$/.exec(arg);
    requireValue(match, `Unknown argument: ${arg}`);
    options[match[1]] = match[2];
  }
  const dataDir = path.resolve(options["data-dir"] ?? path.join(ROOT, "data/complaints"));
  if (command === "plan") console.log(JSON.stringify(planChecks((await loadStore(dataDir)).cases, options["as-of"] ?? dayAt(new Date().toISOString())), null, 2));
  else if (command === "ingest") {
    requireValue(options.file, "ingest requires --file=run.json");
    console.log(JSON.stringify(await ingestRun(dataDir, JSON.parse(await readFile(path.resolve(options.file), "utf8"))), null, 2));
  } else if (command === "help") console.log("monitor.mjs plan [--as-of=YYYY-MM-DD] | ingest --file=run.json [--data-dir=/absolute/private/path]");
  else throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main().catch(error => { console.error(error.message); process.exitCode = 1; });
