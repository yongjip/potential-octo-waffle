#!/usr/bin/env node

import { appendFile, mkdir, open, readFile, unlink, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATUSES = new Set(["draft", "prepared", "submission_unknown", "submitted", "waiting", "response_received", "hold", "closed", "cancelled"]);
const SOURCE_KINDS = new Set(["shared_user_quote", "shared_assistant_summary", "portal_observation", "official_document", "local_decision"]);
const PRIMARY_SOURCES = new Set(["portal_observation", "official_document"]);
const DATE_FIELDS = ["submitted_on", "received_on", "response_on", "portal_due_on", "decision_notified_on", "next_check_on", "last_checked_on"];
const CHANGE_FIELDS = new Set(["status", "status_raw", "resolution_status", "evidence_status", "receipt_number", "agency_receipt_number", "agency", "title", "next_action", "questions", "filing", ...DATE_FIELDS]);
const FACT_FIELDS = new Set(["status", "status_raw", "evidence_status", "receipt_number", "agency_receipt_number", "agency", "submitted_on", "received_on", "response_on", "portal_due_on", "decision_notified_on", "last_checked_on"]);
const TRANSITIONS = {
  draft: ["draft", "prepared", "hold", "cancelled"],
  prepared: ["draft", "prepared", "submission_unknown", "submitted", "waiting", "hold", "cancelled"],
  submission_unknown: ["submission_unknown", "submitted", "waiting", "response_received", "hold", "cancelled"],
  submitted: ["submitted", "waiting", "response_received", "hold"],
  waiting: ["waiting", "response_received", "hold"],
  response_received: ["response_received", "closed", "hold"],
  hold: [...STATUSES],
  closed: ["closed"],
  cancelled: ["cancelled"],
};

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function validDay(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function validateSource(source) {
  requireValue(source && SOURCE_KINDS.has(source.kind), "A recognized source kind is required");
  requireValue(validDay(source.observed_on), "source.observed_on must be a valid YYYY-MM-DD date");
}

export function validateCase(record) {
  for (const field of ["case_id", "issue_id", "agency", "title", "next_action"]) {
    requireValue(typeof record[field] === "string" && record[field].trim().length > 0, `${field} is required`);
  }
  requireValue(/^[a-z0-9][a-z0-9-]*$/.test(record.case_id), "case_id must use lowercase letters, digits and hyphens");
  requireValue(["open_go_kr", "epeople", "seoul_eungdapso"].includes(record.portal), "Unknown portal");
  requireValue(["petition", "information_disclosure", "objection", "proposal"].includes(record.kind), "Unknown procedure kind");
  requireValue(STATUSES.has(record.status), "Unknown status");
  requireValue(["pending", "confirmed", "conflict", "context_only"].includes(record.evidence_status), "Unknown evidence_status");
  requireValue(["unknown", "unresolved", "resolved"].includes(record.resolution_status), "Unknown resolution_status");
  for (const field of DATE_FIELDS) requireValue(record[field] == null || validDay(record[field]), `Invalid date: ${field}`);
  for (const field of ["receipt_number", "agency_receipt_number"]) {
    requireValue(record[field] == null || (typeof record[field] === "string" && record[field].trim().length > 0), `${field} must be a nonempty string or null`);
  }
  validateSource(record.source);
  if (record.evidence_status === "confirmed") {
    requireValue(PRIMARY_SOURCES.has(record.source.kind) && !!record.source.evidence_path, "Confirmed status requires primary evidence and an evidence_path");
  }
  if (record.status === "response_received") requireValue(validDay(record.response_on), "Response receipt requires response_on");
  if (["draft", "prepared"].includes(record.status)) {
    requireValue(!record.receipt_number && !record.agency_receipt_number && !record.submitted_on && !record.received_on && !record.response_on, "A recorded filing cannot be prepared for resubmission; create a child case");
  }
  if (["submitted", "waiting"].includes(record.status) && record.evidence_status === "confirmed") {
    requireValue(!!record.receipt_number, "Confirmed filing requires the portal receipt number");
  }
  requireValue(Array.isArray(record.questions), "questions must be an array");
  const questionIds = new Set();
  for (const question of record.questions) {
    requireValue(question.id && !questionIds.has(question.id) && question.request, "Question IDs must be unique and requests nonempty");
    questionIds.add(question.id);
    requireValue(["answered", "partial", "unanswered", "not_applicable"].includes(question.answer_status), "Unknown answer_status");
    if (["answered", "partial"].includes(question.answer_status)) requireValue(!!question.response_evidence, "An answered question needs response_evidence");
  }
  return record;
}

function validateRelations(cases) {
  const receipts = new Set();
  for (const record of cases.values()) {
    if (record.parent_case_id) {
      requireValue(cases.has(record.parent_case_id), `Missing parent for ${record.case_id}`);
      const ancestors = new Set([record.case_id]);
      let parent = cases.get(record.parent_case_id);
      while (parent) {
        requireValue(!ancestors.has(parent.case_id), "Circular case relationship");
        ancestors.add(parent.case_id);
        parent = cases.get(parent.parent_case_id);
      }
    }
    if (record.receipt_number) {
      const key = `${record.portal}:${record.receipt_number}`;
      requireValue(!receipts.has(key), `Duplicate portal receipt: ${record.case_id}`);
      receipts.add(key);
    }
  }
}

export function applyEvent(cases, event) {
  requireValue(typeof event.event_id === "string" && event.event_id.length > 0, "event_id is required");
  requireValue(cases.has(event.case_id), `Unknown case: ${event.case_id}`);
  requireValue(typeof event.observed_at === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(event.observed_at) && !Number.isNaN(Date.parse(event.observed_at)), "observed_at must include date, time and timezone");
  validateSource(event.source);
  requireValue(event.changes && typeof event.changes === "object" && !Array.isArray(event.changes), "changes must be an object");
  for (const key of Object.keys(event.changes)) requireValue(CHANGE_FIELDS.has(key), `Unsupported change field: ${key}`);
  const before = cases.get(event.case_id);
  const after = { ...before, ...event.changes };
  requireValue(TRANSITIONS[before.status].includes(after.status), `Invalid status transition: ${before.status} -> ${after.status}`);
  if (Object.keys(event.changes).some(key => FACT_FIELDS.has(key))) after.source = event.source;
  validateCase(after);
  const next = new Map(cases);
  next.set(after.case_id, after);
  validateRelations(next);
  return next;
}

async function readLines(file, optional = false) {
  let content;
  try { content = await readFile(file, "utf8"); }
  catch (error) { if (optional && error.code === "ENOENT") return []; throw error; }
  return content.split("\n").filter(line => line.trim()).map((line, index) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`Invalid JSONL in ${path.basename(file)} at record ${index + 1}`); }
  });
}

async function verifyEvidence(record, dataDir) {
  if (record.evidence_status === "confirmed") {
    const evidence = await stat(path.resolve(dataDir, record.source.evidence_path));
    requireValue(evidence.isFile() && evidence.size > 0, "Primary evidence must be a nonempty file");
  }
}

export async function loadStore(dataDir) {
  const base = await readLines(path.join(dataDir, "cases.jsonl"));
  let cases = new Map();
  for (const record of base) {
    validateCase(record);
    requireValue(!cases.has(record.case_id), `Duplicate case_id: ${record.case_id}`);
    await verifyEvidence(record, dataDir);
    cases.set(record.case_id, record);
  }
  validateRelations(cases);
  const events = await readLines(path.join(dataDir, "events.jsonl"), true);
  const eventIds = new Set();
  for (const event of events) {
    requireValue(!eventIds.has(event.event_id), `Duplicate event_id: ${event.event_id}`);
    eventIds.add(event.event_id);
    cases = applyEvent(cases, event);
    await verifyEvidence(cases.get(event.case_id), dataDir);
  }
  return { cases, events };
}

function cell(value) {
  return String(value ?? "미확인").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function renderBoard(cases, asOf) {
  requireValue(validDay(asOf), "--as-of must be a valid YYYY-MM-DD date");
  const records = [...cases.values()];
  const waiting = records.filter(r => ["submitted", "waiting"].includes(r.status)).length;
  const rows = records.map(r => {
    let attention = "대기";
    if (r.status === "submission_unknown") attention = "접수 결과 확인 전 재시도 금지";
    else if (r.evidence_status !== "confirmed") attention = "포털 원문 대조 필요";
    else if (["submitted", "waiting"].includes(r.status) && r.portal_due_on && r.portal_due_on < asOf) attention = "표시 예정일 경과 확인";
    else if (["submitted", "waiting"].includes(r.status) && r.portal_due_on === asOf) attention = "표시 예정일 당일";
    else if (r.status === "response_received" && r.resolution_status !== "resolved") attention = "답변 내용 검토";
    if (r.next_check_on && r.next_check_on <= asOf) attention += " · 점검일 도래";
    return `| ${[r.case_id, r.title, r.agency, r.status, r.evidence_status, r.receipt_number, r.portal_due_on, r.next_check_on, attention].map(cell).join(" | ")} |`;
  });
  const details = records.map(r => [
    `## ${r.case_id}`,
    `상위 사건: ${r.parent_case_id ?? "없음"}. 해결 상태: ${r.resolution_status}. 포털 원문 상태: ${r.status_raw ?? "미확인"}.`,
    `제출일: ${r.submitted_on ?? "미확인"}. 기관 접수일: ${r.received_on ?? "미확인"}. 답변일: ${r.response_on ?? "미확인"}. 마지막 포털 확인: ${r.last_checked_on ?? "없음"}.`,
    `처리기관 접수번호: ${r.agency_receipt_number ?? "미확인"}. 근거 종류: ${r.source.kind}. 근거 관찰일: ${r.source.observed_on}.`,
    `근거: ${r.source.evidence_path ? `[저장한 원문](<${r.source.evidence_path}>)` : r.source.url ? `[출처](${r.source.url})` : "로컬 작성 기록"}.`,
    `다음 행동: ${r.next_action}`,
    ...r.questions.map(q => `- ${q.id}: ${q.request} — ${q.answer_status}${q.response_evidence ? ` (${q.response_evidence})` : ""}`),
  ].join("\n\n")).join("\n\n");
  return `# 민원 추적 장부\n\n작성 기준: ${asOf} KST. cases.jsonl과 events.jsonl에서 생성한 로컬 자료.\n\n총 ${records.length}건 · 제출 또는 대기 ${waiting}건 · 답변 수신 ${records.filter(r => r.status === "response_received").length}건 · 공식 근거 대조 전 ${records.filter(r => r.evidence_status !== "confirmed").length}건.\n\n포털 표시 예정일과 내부 점검일은 별도이며 법정기한을 자동 계산하지 않는다. pending의 상태와 날짜는 출처에 남은 기록으로 읽는다.\n\n| 사건 | 제목 | 기관 | 처리 상태 | 근거 상태 | 포털 접수번호 | 표시 예정일 | 내부 점검일 | 확인할 사항 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\n${details}\n`;
}

async function appendLine(file, value) {
  let prefix = "";
  try { const previous = await readFile(file, "utf8"); if (previous && !previous.endsWith("\n")) prefix = "\n"; }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  await appendFile(file, `${prefix}${JSON.stringify(value)}\n`, { mode: 0o600 });
}

async function withLock(dataDir, action) {
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  const lockPath = path.join(dataDir, ".tracker.lock");
  let lock;
  try { lock = await open(lockPath, "wx", 0o600); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("Tracker is locked; finish the current writer or inspect the interrupted run before removing its lock");
    throw error;
  }
  try { return await action(); }
  finally { await lock.close(); await unlink(lockPath); }
}

export async function recordEvent(dataDir, event) {
  return withLock(dataDir, async () => {
    const store = await loadStore(dataDir);
    const existing = store.events.find(item => item.event_id === event.event_id);
    if (existing) {
      requireValue(isDeepStrictEqual(existing, event), "event_id already exists with different content");
      return "already_recorded";
    }
    const next = applyEvent(store.cases, event);
    await verifyEvidence(next.get(event.case_id), dataDir);
    await appendLine(path.join(dataDir, "events.jsonl"), event);
    return "recorded";
  });
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    requireValue(match, `Unknown argument: ${arg}`);
    requireValue(["data-dir", "file", "as-of", "write"].includes(match[1]), `Unknown option: ${match[1]}`);
    options[match[1]] = match[2] ?? true;
  }
  for (const key of ["data-dir", "file", "as-of"]) if (key in options) requireValue(typeof options[key] === "string" && options[key].length > 0, `--${key} requires a value`);
  if ("write" in options) requireValue(options.write === true, "Use --write without a value");
  const dataDir = path.resolve(options["data-dir"] ?? path.join(ROOT, "data/complaints"));
  if (command === "help") {
    console.log("tracker.mjs check | board [--as-of=YYYY-MM-DD] [--write] | add --file=case.json | record --file=event.json\nOptional: --data-dir=/absolute/path");
    return;
  }
  requireValue(["check", "board", "add", "record"].includes(command), `Unknown command: ${command}`);
  if (["add", "record"].includes(command)) {
    requireValue(typeof options.file === "string", "--file is required");
    const input = JSON.parse(await readFile(path.resolve(options.file), "utf8"));
    if (command === "record") console.log(await recordEvent(dataDir, input));
    else await withLock(dataDir, async () => {
      validateCase(input);
      await verifyEvidence(input, dataDir);
      let store;
      try { store = await loadStore(dataDir); }
      catch (error) { if (error.code !== "ENOENT" || error.path !== path.join(dataDir, "cases.jsonl")) throw error; store = { cases: new Map() }; }
      requireValue(!store.cases.has(input.case_id), "case_id already exists");
      const next = new Map(store.cases);
      next.set(input.case_id, input);
      validateRelations(next);
      await appendLine(path.join(dataDir, "cases.jsonl"), input);
      console.log("added");
    });
    return;
  }
  const store = await loadStore(dataDir);
  if (command === "check") console.log(`Valid: ${store.cases.size} cases, ${store.events.length} events`);
  else {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const board = renderBoard(store.cases, options["as-of"] ?? today);
    if (options.write) await withLock(dataDir, async () => {
      const current = await loadStore(dataDir);
      const output = path.join(dataDir, "board.md");
      await writeFile(output, renderBoard(current.cases, options["as-of"] ?? today), { mode: 0o600 });
      console.log(output);
    });
    else process.stdout.write(board);
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
