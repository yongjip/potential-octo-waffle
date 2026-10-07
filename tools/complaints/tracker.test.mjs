import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { applyEvent, loadStore, recordEvent, renderBoard, validateCase } from "./tracker.mjs";

const example = JSON.parse(await readFile(new URL("./case.example.json", import.meta.url), "utf8"));
function waitingCase(id = "first", receipt = "receipt-one") {
  return { ...structuredClone(example), case_id: id, status: "waiting", receipt_number: receipt };
}
function observation(changes, eventId = "observation-one") {
  return { event_id: eventId, case_id: "first", observed_at: "2026-10-07T18:00:00+09:00", source: { kind: "shared_user_quote", observed_on: "2026-10-07", evidence_path: null }, changes };
}

test("conversation imports cannot become confirmed evidence", () => {
  assert.throws(() => validateCase({ ...waitingCase(), evidence_status: "confirmed" }), /primary evidence/);
});

test("agency receipt is not sufficient for a confirmed filing", () => {
  const record = { ...waitingCase(), receipt_number: null, agency_receipt_number: "agency-one", evidence_status: "confirmed", source: { kind: "portal_observation", observed_on: "2026-10-07", evidence_path: "receipt.png" } };
  assert.throws(() => validateCase(record), /portal receipt/);
});

test("a reply does not imply resolution and cannot revert to submission preparation", () => {
  const records = new Map([["first", waitingCase()]]);
  const received = applyEvent(records, observation({ status: "response_received", response_on: "2026-10-07" }));
  assert.equal(received.get("first").resolution_status, "unknown");
  assert.throws(() => applyEvent(received, observation({ status: "prepared" })), /Invalid status transition/);
});

test("duplicate portal receipts are rejected", () => {
  const records = new Map([["first", waitingCase()], ["second", { ...waitingCase("second", "receipt-two"), parent_case_id: "first" }]]);
  assert.throws(() => applyEvent(records, observation({ receipt_number: "receipt-two" })), /Duplicate portal receipt/);
});

test("a local next-action decision retains the prior official status provenance", () => {
  const record = { ...waitingCase(), evidence_status: "confirmed", source: { kind: "portal_observation", observed_on: "2026-10-07", evidence_path: "receipt.png" } };
  const event = { ...observation({ next_action: "Read the reply" }), source: { kind: "local_decision", observed_on: "2026-10-07" } };
  const next = applyEvent(new Map([["first", record]]), event);
  assert.equal(next.get("first").source.kind, "portal_observation");
});

test("holding a filed case cannot enable resubmission", () => {
  const records = new Map([["first", waitingCase()]]);
  const held = applyEvent(records, observation({ status: "hold" }));
  assert.throws(() => applyEvent(held, observation({ status: "prepared" })), /cannot be prepared for resubmission/);
});

test("circular parent relationships are rejected when loading", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "complaints-cycle-"));
  try {
    const first = { ...waitingCase(), parent_case_id: "second" };
    const second = { ...waitingCase("second", "receipt-two"), parent_case_id: "first" };
    await writeFile(path.join(dir, "cases.jsonl"), [first, second].map(row => JSON.stringify(row)).join("\n") + "\n");
    await assert.rejects(loadStore(dir), /Circular case relationship/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("receipt events are idempotent and preserve old deadlines on disk", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "complaints-test-"));
  try {
    await writeFile(path.join(dir, "cases.jsonl"), `${JSON.stringify(waitingCase())}\n`);
    const first = observation({ portal_due_on: "2026-10-15" });
    assert.equal(await recordEvent(dir, first), "recorded");
    assert.equal(await recordEvent(dir, first), "already_recorded");
    await assert.rejects(recordEvent(dir, { ...first, note: "changed" }), /different content/);
    await recordEvent(dir, observation({ portal_due_on: "2026-10-22" }, "extension-one"));
    const store = await loadStore(dir);
    assert.equal(store.events.length, 2);
    assert.equal(store.events[0].changes.portal_due_on, "2026-10-15");
    assert.equal(store.cases.get("first").portal_due_on, "2026-10-22");
    await assert.rejects(recordEvent(dir, { ...observation({ evidence_status: "confirmed" }, "primary-one"), source: { kind: "portal_observation", observed_on: "2026-10-07", evidence_path: "missing.png" } }), /ENOENT/);
    assert.equal((await loadStore(dir)).events.length, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the board does not invent legal deadlines and marks imported dates as pending", () => {
  const records = new Map([["first", { ...waitingCase(), portal_due_on: "2026-10-01", next_check_on: "2026-10-07" }]]);
  const board = renderBoard(records, "2026-10-07");
  assert.match(board, /포털 원문 대조 필요/);
  assert.doesNotMatch(board, /표시 예정일 경과 확인/);
  assert.match(board, /점검일 도래/);
  assert.throws(() => renderBoard(records, "2026-02-30"), /valid YYYY-MM-DD/);
});
