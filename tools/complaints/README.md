# Complaint tracking and policy work

Start with [workflow.md](workflow.md). It routes status checks, reply review, submission, source verification and candidate research without loading the whole document history.

Run from the repository root:

```bash
npm run complaints:status
node tools/complaints/monitor.mjs plan
node tools/complaints/tracker.mjs check
```

`complaints:status` summarizes retained records and prints the current private file pointers. `monitor.mjs plan` selects individual pending cases and completed cases with an accepted pending additional-answer request. Neither command queries a portal. Counts and case status belong in the private ledger rather than this README.

## Where the current work lives

| Record | Authority |
| --- | --- |
| `data/complaints/current.json` | Navigation to the current analysis, accepted execution, substantive operation and task handoff |
| `data/complaints/cases.jsonl` and `events.jsonl` | Original cases and append-only changes, replayed by the tracker |
| `data/complaints/board.md` | Generated readable view of the ledger |
| Accepted filing execution and saved-detail evidence | Actual delivered body, attachments and acceptance |
| Working reports under private census/research folders | Current analysis and revisions; separate from accepted copies |
| Dated preparation manifests and handoffs | Historical context; not the current delivery verdict |

The pointer does not override original evidence. An accepted later operation can supersede the delivery status of an older preparation manifest. Preserve both. Do not resubmit an already accepted packet merely because the preparation record says unsubmitted.

## Procedures

| Work | Entry point |
| --- | --- |
| Portal query, new reply and alerts | [Status monitoring](status-monitoring.md) |
| Submission, amendment and exact-body checks | [Submission procedure](submission-rehearsal.md), [portal controls](computer-use.md) |
| SH official notices and financing conditions | [Housing source verification](housing-source-verification.md) |
| Account preparation and execution host | [Account instructions](accounts-and-remote.md), [remote runbook](remote-runbook.md) |
| Policy reasoning and writing | [User writing context](context-yongjip-kim-policy-evaluation/SKILL.md), [campaign procedure](official-campaign.md) |
| Phone explanation and written confirmation | [Phone follow-up](phone-followup.md) |
| Discovery and proposed legislation | [Discovery](discovery-runbook.md), [early warning](early-warning.md) |
| Simulated official review | [Roleplay procedure](official-roleplay.md) |
| Encountered failures and corrections | Search the relevant heading in [lessons](lessons-learned.md) |

Reader, public-official and legislative research files are supporting material. They do not establish actual assignment, institutional endorsement or a delivered opinion. Use them only for the specific drafting question.

## Private storage and publication

`data/complaints/` is Git-ignored. Keep accounts, profile fields, receipts, replies, actual filing bodies, PDFs and screenshots there. Git exclusion is not a backup; preserve the private data separately on the authorized execution host.

Reusable code, anonymous examples and operating instructions belong in this directory. New personal complaint handoffs remain private. Publish an explicit reviewed list; never stage the whole mixed checkout. [WORKSPACE.md](../../WORKSPACE.md) explains how to handle a different local branch and an existing published campaign branch.

## Status and aftercare

Use `issue_id` for the policy issue and `case_id` for one actual procedure. A separately issued receipt creates a new case linked with `parent_case_id`. Council board IDs use `portal_record_id`, not a fabricated receipt number.

A satisfaction opinion with an answer-request checkbox is aftercare under the existing case. Store it in `filing.additional_answer`, retain the original final reply and check its separate answer section. A pending aftercare request is not a new formal filing or a verified additional-answer deadline.

Acceptance, an institution's reply and actual policy improvement are different outcomes. Review every delivered question as answered, partial, unanswered or not applicable, with a reply location. A completion label or phone call alone does not resolve the issue.

## Monitoring

The user-selected routine is once a week, Monday at 09:00 Asia/Seoul. Query again when the user requests it after a portal email. Notify only meaningful changes, new replies, displayed deadline proximity/expiry, query failure or required user action. Do not create automatic inbox access from that preference.

The actual automation configuration belongs in private `monitor/automation.json`. The execution Mac, app and browser connection must be available. Record authentication failures without advancing the last successful observation. Follow the current computer-use confirmation rules.

Legislative and administrative early-warning collection has a documented design. It is separate from the running complaint-status monitor; do not describe the design as an active schedule.

## Write and validate

```bash
node tools/complaints/tracker.mjs add --file=/absolute/private/new-case.json
node tools/complaints/tracker.mjs record --file=/absolute/private/event.json
node tools/complaints/monitor.mjs ingest --file=/absolute/private/run.json
node tools/complaints/tracker.mjs board --write
npm run complaints:test
```

Claim the private ledger and `global:regenerate` before writes or board generation. The helper validates receipts, relationships, evidence and event idempotency. It does not submit, log in, send an email or create a schedule. Examples are templates, not real filings.

Preserve exact accepted evidence, update the current pointer and relevant runbook, document lessons and run the repository doctors before closing a task.
