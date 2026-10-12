import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { addCase, loadStore, recordEvent } from "./tracker.mjs";
import { evaluateRun, ingestRun, planChecks } from "./monitor.mjs";

const example = JSON.parse(await readFile(new URL("./case.example.json", import.meta.url), "utf8"));
function caseRecord(id = "first", receipt = "R-123") {
  return { ...structuredClone(example), case_id: id, portal: "epeople", kind: "petition", status: "submitted", receipt_number: receipt, status_raw: "신청", evidence_status: "confirmed", source: { kind: "portal_observation", observed_on: "2026-10-11", evidence_path: "initial.txt" } };
}
function run(id = "first-run", values = { status_raw: "신청" }) {
  return { run_id: id, observed_at: "2026-10-11T21:00:00+09:00", observations: [{ case_id: "first", identity: { type: "receipt_number", value: "R-123" }, result: "observed", url: "https://www.epeople.go.kr/nep/utilHistory/mySmgPttn/mySmgPttnList.paid", evidence_path: "initial.txt", values }] };
}
async function fixture(action) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "complaints-monitor-"));
  try {
    await writeFile(path.join(dir, "initial.txt"), "R-123 R-456 신청 처리중 완료 2026-10-20 국토교통부");
    await addCase(dir, caseRecord());
    await action(dir);
  } finally { await rm(dir, { recursive: true, force: true }); }
}

test("the query plan separates pending portal work from substantive reply review", () => {
  const reply = { ...caseRecord("answered", "R-456"), status: "response_received", response_on: "2026-10-10", resolution_status: "unresolved" };
  const plan = planChecks(new Map([["first", caseRecord()], ["answered", reply]]), "2026-10-11");
  assert.deepEqual(plan.checks.map(r => r.case_id), ["first"]);
  assert.equal(plan.review_queue[0].case_id, "answered");
});

test("a pending additional answer is queried under the original receipt without reopening its final reply", () => {
  const reply = { ...caseRecord("answered", "R-456"), status: "response_received", response_on: "2026-10-10", resolution_status: "unresolved", filing: { additional_answer: { status: "submitted", requested_on: "2026-10-11", evidence_path: "aftercare.txt" } } };
  const cases = new Map([["answered", reply]]);
  const plan = planChecks(cases, "2026-10-11");
  assert.equal(plan.checks.length, 1);
  assert.deepEqual(plan.checks[0].identity, { type: "receipt_number", value: "R-456" });
  assert.equal(plan.checks[0].status, "response_received");
  assert.equal(reply.response_on, "2026-10-10");
  assert.deepEqual(plan.checks[0].pending_additional_answer, { requested_on: "2026-10-11", evidence_path: "aftercare.txt" });
  assert.equal(plan.review_queue[0].case_id, "answered");
  reply.filing.additional_answer.status = "response_received";
  assert.deepEqual(planChecks(cases, "2026-10-11").checks, []);
  reply.filing.additional_answer.status = "submitted";
  reply.resolution_status = "resolved";
  assert.deepEqual(planChecks(cases, "2026-10-11").checks, []);
  reply.resolution_status = "unresolved";
  reply.status = "closed";
  assert.deepEqual(planChecks(cases, "2026-10-11").checks, []);
});

test("unchanged observations update evidence without sending duplicate alerts", async () => fixture(async dir => {
  assert.deepEqual((await ingestRun(dir, run())).alerts, []);
  assert.deepEqual((await ingestRun(dir, run("second-run"))).alerts, []);
  const repeated = await ingestRun(dir, run("second-run"));
  assert.equal(repeated.already_recorded, true);
  assert.deepEqual(repeated.alerts, []);
  const store = await loadStore(dir);
  assert.equal(store.events.length, 2);
  assert.equal(store.cases.get("first").last_checked_on, "2026-10-11");
}));

test("an authentication failure preserves the last real status and deduplicates the blocker", async () => fixture(async dir => {
  const blocked = run();
  blocked.observations[0] = { ...blocked.observations[0], result: "auth_required", reason: "A current login CAPTCHA is displayed" };
  delete blocked.observations[0].values;
  assert.equal((await ingestRun(dir, blocked)).alerts[0].type, "auth_required");
  assert.deepEqual((await ingestRun(dir, { ...blocked, run_id: "again" })).alerts, []);
  const store = await loadStore(dir);
  assert.equal(store.events.length, 0);
  assert.equal(store.cases.get("first").status_raw, "신청");
  assert.equal(store.cases.get("first").last_checked_on, example.last_checked_on);
}));

test("the full batch must validate before any case changes are appended", async () => fixture(async dir => {
  await addCase(dir, caseRecord("second", "R-456"));
  const input = run();
  input.observations.push({ ...input.observations[0], case_id: "second", identity: { type: "receipt_number", value: "wrong" } });
  await assert.rejects(ingestRun(dir, input), /identity does not match/);
  assert.equal((await loadStore(dir)).events.length, 0);
}));

test("an interrupted run reuses its prepared alerts and does not duplicate case events", async () => fixture(async dir => {
  await ingestRun(dir, run());
  const input = run("interrupted-run", { status_raw: "처리중" });
  const history = (await readFile(path.join(dir, "monitor/runs.jsonl"), "utf8")).trim().split("\n").map(JSON.parse);
  const result = evaluateRun((await loadStore(dir)).cases, history, input);
  await mkdir(path.join(dir, "monitor/runs"), { recursive: true });
  await writeFile(path.join(dir, "monitor/runs/interrupted-run.json"), JSON.stringify({ input, result }));
  await recordEvent(dir, result.events[0]);
  const resumed = await ingestRun(dir, input);
  assert.deepEqual(resumed.alerts, result.alerts);
  assert.equal(resumed.alerts[0].before, "신청");
  assert.equal((await loadStore(dir)).events.length, 2);
  assert.equal((await ingestRun(dir, input)).already_recorded, true);
  assert.equal((await loadStore(dir)).events.length, 2);
}));

test("new replies require complete reply evidence and never imply resolution", async () => fixture(async dir => {
  await ingestRun(dir, run());
  const replyText = "Actual written reply addressing one question.";
  await writeFile(path.join(dir, "reply.txt"), replyText);
  const input = run("reply-run", { status_raw: "완료", status: "response_received", response_on: "2026-10-11" });
  await assert.rejects(ingestRun(dir, input), /complete reply evidence/);
  input.observations[0].reply = { evidence_path: "reply.txt", sha256: createHash("sha256").update(replyText).digest("hex") };
  const result = await ingestRun(dir, input);
  assert.equal(result.alerts.filter(a => a.type === "reply").length, 1);
  const after = (await loadStore(dir)).cases.get("first");
  assert.equal(after.status, "response_received");
  assert.notEqual(after.resolution_status, "resolved");
  assert.ok(after.questions.every(q => q.answer_status !== "answered"));
}));

test("deadline notifications fire once per date and urgency stage", () => {
  const cases = new Map([["first", { ...caseRecord(), portal_due_on: "2026-10-13" }]]);
  const initial = evaluateRun(cases, [], run());
  assert.equal(initial.alerts[0].stage, "near");
  assert.deepEqual(evaluateRun(cases, [initial], run("again")).alerts, []);
  const tomorrow = { ...run("tomorrow"), observed_at: "2026-10-12T09:00:00+09:00" };
  assert.equal(evaluateRun(cases, [initial], tomorrow).alerts[0].stage, "one-day");
});

test("official identity and evidence boundaries reject a foreign destination", async () => fixture(async dir => {
  const input = run();
  input.observations[0].url = "https://example.com/portal";
  await assert.rejects(ingestRun(dir, input), /official portal/);
  input.observations[0].url = run().observations[0].url;
  input.observations[0].evidence_path = "../outside.txt";
  await assert.rejects(ingestRun(dir, input), /inside data-dir/);
}));
