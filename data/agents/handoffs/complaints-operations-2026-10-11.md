# Complaint tracking and monitoring operations

- Agent: root.
- Task: complaints-operations-2026-10-11.
- Basis date: 2026-10-11, Asia/Seoul.
- Result: three accepted council reports linked; daily same-chat monitoring created and verified; fourteen pending cases queried through fresh official screens. The ETF reusable method is included in the publication allowlist. A concrete municipal supplement and reviewed one-page chart attachment remain private and unsubmitted.

## Claimed scopes

`tools/complaints`, `data/complaints`, this handoff, the historical ETF-preparation handoff, `global:regenerate`, and `global:git`.

## Changed files

Reusable: tracker and tests, new monitor and tests, status-monitoring runbook, README, lessons, remote runbook, tax-petition procedure, historical ETF-preparation pointer and this handoff. Include the prior deidentified ETF-filing handoff in publication.

Private: council imports with board-ID mapping, fourteen current observation events and evidence, actual automation configuration, regenerated board, council tracking pointer, attachment inventory, and municipal supplement body/PDF/calculation validation. Preserve accepted bodies, original PDF hashes and question status.

## Commands run

- Agent status/claim; bounded instruction and source reads; official municipal notice recheck.
- `node data/complaints/monitor/import-council.mjs`; tracker plan/check and board regeneration.
- `node --test tools/complaints/tracker.test.mjs tools/complaints/monitor.test.mjs`.
- Supported computer use for fresh national/council lists and city/information-disclosure login and queries. Existing credentials only; user action-time approval covered the two displayed CAPTCHAs.
- App heartbeat create/view and saved configuration inspection. Its real ID belongs in private `data/complaints/monitor/automation.json`.
- Monitor ingest: fourteen observed, none blocked, one near-deadline alert. Exact replay returned `already_recorded`, without duplicate events or alerts.
- PDF operation marker, private ReportLab build, extraction/hash/amount checks and Poppler render. The sole page was visually inspected without clipping, overlap or broken labels.
- Repository validators; immutable remote-parent/file reads; exact allowed-file patch review and private-data scan; Git object creation and expected-head branch update. Actual commit evidence belongs in private `data/complaints/monitor/publication-result.json`.

## Decisions

The ledger now has eighteen cases: fourteen submitted/waiting and four written replies requiring substantive follow-up. Council records use `seoul_council`, `council_audit_report` and `portal_record_id`. Formal receipt fields remain null. A requested committee is not confirmed assignment. Public list evidence does not establish private reply visibility.

The daily heartbeat runs at 09:00 in the existing chat. Notify meaningful changes, new complete replies, approaching displayed deadlines, failures or required user action. Keep unchanged routine checks quiet. The local helper validates evidence and deduplicates events/alerts; it cannot authenticate, query portals, file or send external messages. Actual queries use supported computer use. The Mac and Codex must run. Current CAPTCHA/terms requirements still apply.

Use city integrated results for older cases absent from its ordinary list. Apply the information-disclosure date search explicitly. The first run verified all five displayed information-disclosure dates. Its earliest deadline was two days away. These are displayed dates, not calculated legal deadlines. First status wording establishes a baseline; failed queries preserve the last verified state. Require complete reply evidence before recording a new written answer.

The user found the municipal request vague. Prepare an exact income-ceiling replacement, existing-beneficiary treatment and matched monetary example. The proposed paid-fee rate is 100%, capped at the verified notice's current maximum; preserve existing no-home, deposit, valid-guarantee and exclusion conditions. Assessed annual income is not take-home pay. A fee reimbursement is not a guaranteed annual award; a budget illustration is not a demand estimate.

Attachment coverage is destination-specific. The three council cases and ETF case had verified accepted PDFs. The city amendment and three new executive-agency petitions were text-only. A local chart is not proof of delivery. Keep the unsubmitted municipal supplement separate from the accepted case.

## Blocked or deferred items

No current authentication blocker remains; fourteen pending records received current observations. Council private replies/committee assignment remain unverified. No new filing, existing-body amendment, consent expansion, external email/SMS or withdrawal occurred in this operations task. The municipal supplement awaits a later submission step. Policy issues remain unresolved until substantive replies and actual changes are checked.

## Next agent should

1. Read [status-monitoring.md](../../../tools/complaints/status-monitoring.md), private automation configuration and monitor history. Reuse the existing schedule.
2. Match accepted receipts/board IDs, save current evidence, ingest one batch and regenerate the board. Deliver only actionable alerts. Use exact saved prepared input for recovery.
3. Preserve complete new replies and compare requests individually before recording substantive resolution.
4. Read the private municipal supplement and attachment inventory before later authorized submission. Do not repeat accepted reports.
5. Keep private evidence outside Git and publish only the reusable allowlist to the authorized complaint branch. Preserve unrelated checkout changes; consult the private publication result for the actual SHA.

## Validation

- Tracker/monitor tests: 19 passed, zero failures. Interrupted-run recovery and exact replay passed.
- Current tracker check: valid, 18 cases and 51 events. Council import replay: three `already_added` results, no duplicate cases.
- Instructions doctor and KB doctor: zero warnings, zero errors.
- Project doctor: zero errors; the same 28 existing review-gated missing-data warnings.
- Municipal attachment: one page, amounts and reference checked; rendered page visually inspected. Draft remains unsubmitted.
- No unrelated source or generated research output is in the publication allowlist. Remote confirmation is preserved in the private publication record.
- Automatic review initially rejected the existing remote-runbook update. Immutable-parent verification established its prior publication and the two nonsensitive changes. The same blob operation then passed review; no workaround or credential publication occurred.
