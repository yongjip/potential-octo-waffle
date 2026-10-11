# Complaint status monitoring

The user authorized read-only portal queries, local tracking and meaningful-change notifications in the existing chat. The daily chat schedule runs at 09:00 Asia/Seoul. Its actual automation ID and configuration belong in private `data/complaints/monitor/automation.json`; the schedule is not created by a next-check date in the tracker.

## Run sequence

1. Read repository instructions, this runbook, `remote-runbook.md` and the newest complaint handoff. Check and claim the private monitor/tracker scopes and `global:regenerate` before writes. Use the existing connected Mac and Edge profile. Verify the execution host with `accounts.mjs doctor` before loading one portal's credentials.
2. Run `node tools/complaints/monitor.mjs plan`. Query every item in `checks`, grouped by portal, with the earliest displayed deadline first. The review queue is separate; do not download unchanged historical replies every day. Exclude resolved, closed and cancelled cases from routine queries.
3. Use the supported computer-use surface for the actual web query. Refresh the list or navigate through observed controls; an old detail tab is not a current query. Read-only DOM extraction is permitted. Do not query hidden APIs, cookies or application state, and do not copy stale details into a new observation.
4. Match a portal receipt or council board ID before reading a status. For council reports, the visible list-row link `goDetail_162` can expose the ID even when the title is private. Store the actual list or detail URL and the full observed text in private UTF-8 evidence. A council list URL can retain unrelated detail parameters; use the actual row link to match each case. Treat the public list as status evidence only, without claiming private reply or committee visibility.
5. Open the matching detail when assignment, deadline or reply changes, or when the list lacks those fields. A newly returned deadline and transfer are material changes. Omit fields that were not observed. Do not clear an existing deadline because a list lacks a deadline column. Receipt date, original filing date and internal check date remain separate.
6. For a new written reply, preserve the complete text, its displayed date and SHA-256 before setting `response_received`. Review the delivered questions individually and cite reply evidence for answered/partial entries. A portal completion label alone does not prove a substantive answer or resolution.
7. Prepare one run JSON and execute `node tools/complaints/monitor.mjs ingest --file=/absolute/private/run.json`. Regenerate the board with `node tools/complaints/tracker.mjs board --write`. Inspect the returned alerts and preserve the run result. The helper validates the whole observation batch before appending any tracker event. A saved prepared run supports retry after interruption; reuse its exact input.
8. Deliver a concise notice here for a meaningful status/assignment/deadline change, complete new reply, approaching displayed deadline, failure or required user action. Explain what changed and the next action. Remain quiet for an unchanged or non-actionable state. Do not send email, SMS or external messages. If the run returns `already_recorded`, its alerts are empty; do not notify it twice.
9. Record lessons from a new failure or recovery, validate tracker integrity, and release the claimed scopes. No commit is required for routine private observations.

## Authentication and failure

Routine sign-in to the requested portals can use the existing private credential store. Keep account values out of logs, screenshots sent to the user, prompts and Git. Never source the `.env` file.

The current computer-use tool requires action-time confirmation for each displayed CAPTCHA and legally binding agreement. Mark the actual page for handoff, preserve its current proof and batch the concrete pending confirmations. Do not treat the user's general delegation as a replacement for the tool's current rule. Continue the other portal queries while waiting. Record `auth_required` or `unavailable` with the observed reason and evidence; this does not update a case's status or `last_checked_on`. Repeated unchanged blockers do not generate daily duplicate notices. A successful later query resets that blocker cycle.

The local schedule needs the computer on, Codex running, the repository present and the browser connection available. An active schedule does not establish fully unattended CAPTCHA handling. Never disable security settings or create a shell cron workaround.

## Observation format

```json
{
  "run_id": "example-2026-10-11",
  "observed_at": "2026-10-11T09:00:00+09:00",
  "observations": [
    {
      "case_id": "example-case",
      "identity": { "type": "receipt_number", "value": "EXAMPLE-RECEIPT" },
      "result": "observed",
      "url": "https://www.epeople.go.kr/nep/utilHistory/mySmgPttn/mySmgPttnList.paid",
      "evidence_path": "monitor/example/status.txt",
      "values": { "status_raw": "신청" }
    }
  ]
}
```

Allowed observed fields: `status`, `status_raw`, `agency`, `portal_due_on`, `received_on`, `response_on`. Add a `reply` object containing `evidence_path` and `sha256` for a verified new reply. Council identity uses `portal_record_id`, not `receipt_number`. Blocked observations omit `values` and `reply` and include `reason`.

The first observed status spelling establishes a baseline. It does not create a false transition from a locally combined description. Known deadline/assignment changes and new replies still generate alerts. Subsequent observed status changes generate alerts. Deadline proximity is checked only after a successful current observation: within three days, one day, the displayed date, and after it. Each deadline/stage generates one notice. These are portal-displayed dates, not computed legal deadlines.

## Accepted council records

Import already accepted council records with `seoul_council` and `council_audit_report`. Preserve three separate question sets, original filing dates, current readable body evidence and accepted PDF hashes. Keep `receipt_number` and `agency_receipt_number` null. Store the board ID in `portal_record_id`; a committee requested in the text is not confirmed assignment. The board renders a separate ID column. An identical import is idempotent; a duplicate board ID or altered import under the same case ID fails.

## Supplement precision and attachments

Before a policy submission, identify the exact current eligibility condition, the requested replacement rule, concrete example amounts, existing-beneficiary treatment and implementation authority. A request to consider an unspecified basic benefit can receive a general budget response without deciding a usable design. Mark proposal amounts as proposals and substantiate current amounts with the official notice.

Keep an attachment delivery inventory by destination. A chart prepared locally is not an attachment received by an institution. Use the actual accepted file list and server bytes to confirm delivery. For a supplement, prepare only graphs relevant to its decision: initial-funding gaps for entry criteria, annual benefit comparisons for asset allocation, purchase discounts for childbirth policy, and income-boundary benefit amounts for guarantee fees. Preserve the accepted original; create a reviewed supplement before another authorized save or filing.

See [recorded lessons](lessons-learned.md) and the [operations handoff](../../data/agents/handoffs/complaints-operations-2026-10-11.md).
