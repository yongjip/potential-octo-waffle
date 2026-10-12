import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { summarizeStatus, readStatus } from "./status.mjs";

const example = JSON.parse(await readFile(new URL("./case.example.json", import.meta.url), "utf8"));

test("a completed parent's open aftercare remains separate from formal pending targets", () => {
  const formal = { ...example, case_id: "formal", portal: "epeople", status: "waiting", last_checked_on: "2026-10-11" };
  const aftercare = { ...example, case_id: "aftercare", portal: "seoul_eungdapso", status: "response_received", resolution_status: "unresolved", last_checked_on: "2026-10-12", filing: { additional_answer: { status: "submitted", requested_on: "2026-10-12", evidence_path: "opinion.txt" } } };
  const closed = { ...example, case_id: "closed", status: "closed" };
  const result = summarizeStatus(new Map([["formal", formal], ["aftercare", aftercare], ["closed", closed]]), "2026-10-12");
  assert.equal(result.tracked_cases, 3);
  assert.equal(result.query_targets, 2);
  assert.equal(result.pending_formal_targets, 1);
  assert.equal(result.pending_additional_answers, 1);
  assert.equal(result.unresolved_reply_review_cases, 1);
  assert.equal(aftercare.status, "response_received");
  aftercare.filing.additional_answer.status = "response_received";
  assert.equal(summarizeStatus(new Map([["aftercare", aftercare]]), "2026-10-12").query_targets, 0);
});

test("status summary does not disclose receipt, profile, body or credential fields", () => {
  const record = { ...example, case_id: "private", status: "waiting", receipt_number: "PRIVATE-RECEIPT", title: "PRIVATE-TITLE", profile: { phone: "PRIVATE-PHONE" }, filing: { body: "PRIVATE-BODY" }, credentials: "PRIVATE-SECRET" };
  const text = JSON.stringify(summarizeStatus(new Map([["private", record]]), "2026-10-12"));
  assert.doesNotMatch(text, /PRIVATE-/);
});

test("a missing private store fails instead of being reported as zero cases", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "complaints-status-"));
  try { await assert.rejects(readStatus(dir, "2026-10-12"), { code: "ENOENT" }); }
  finally { await rm(dir, { recursive: true, force: true }); }
});
