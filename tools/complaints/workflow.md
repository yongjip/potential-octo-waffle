# Complaint task entry point

Read this file before a complaint task. Use [the workspace map](../../WORKSPACE.md) for other components and the [policy writing context](context-yongjip-kim-policy-evaluation/SKILL.md) when drafting or evaluating a proposal.

## Recover only the relevant state

Run `npm run complaints:status`. It replays the private ledger and shows counts, the last successful observation range, pending aftercare and current file pointers. It does not query portals. A missing private store must not be reported as zero cases.

Read `data/complaints/current.json` next. Its paths select the current working analysis, accepted execution evidence, latest substantive operation and current handoff. The pointer is a navigation aid; the linked original evidence establishes acceptance or facts. Update it after a completed operation or a working-document revision. Preserve historical manifests and handoffs.

Use `node tools/complaints/monitor.mjs plan` only when you need the individual cases, receipt identities or unanswered-question queue. Read the matching case evidence rather than the entire ledger or source cache. Never open credential files for a status or research task.

## Route the request

| Task | Read | Complete when |
| --- | --- | --- |
| Weekly/user-requested portal check | [Status monitoring](status-monitoring.md), relevant [remote instructions](remote-runbook.md) | Fresh receipt-matched observation ingested; meaningful changes reported |
| Review an answer | [Reply review](reply-review.md), accepted body, full new reply and private `filing.reply_review_plan` when present; [phone follow-up](phone-followup.md) if relevant | Delivered questions classified against the reply, related disclosure decisions and applicable precedents; next action recorded |
| Submit or amend a case | [Submission procedure](submission-rehearsal.md), then relevant [portal procedure](computer-use.md) | Exact saved body and accepted attachments verified; ledger event added |
| Verify SH sources and financing | [Housing source verification](housing-source-verification.md) and current analysis/source manifest | Official scope, corrections, product terms and unresolved joint conditions recorded |
| Draft policy correction | Policy writing context and [campaign procedure](official-campaign.md) | Same scope in body, tables and attachment; assumptions beside consequential values |
| Find new issues | [Discovery procedure](discovery-runbook.md) and [early warning](early-warning.md) | Source-backed candidate and concrete next check; no automatic filing |
| Maintain accounts | [Account instructions](accounts-and-remote.md) and remote instructions | Local storage, login and filing readiness recorded separately |

## Delivery and reply rules

- `filings/.../execution-manifest.json` with a verified saved operation outranks a prior preparation manifest for delivery status.
- Keep the accepted body/PDF unchanged when preparing a later version. Place verification reports and working revisions outside the accepted filing folder.
- A saved satisfaction opinion with answer request is aftercare under the existing receipt. Keep the parent final reply and track the additional answer separately. Do not invent a new receipt, assignment or deadline.
- Keep actual reply review separate from future conditional action. An information-disclosure result is available only after its complete decision/document has been acquired.
- Reuse current verified arithmetic when new sources confirm unchanged inputs. Do not regenerate every packet just to change provenance metadata.

## Compact context and finish

Read only this entry point, the relevant route, the current pointer and the targeted evidence. Search headings in [lessons](lessons-learned.md) for the encountered issue rather than reading the entire history. Current runbooks incorporate the applicable prevention rules.

Claim changed paths, save private evidence, update the applicable runbook and lessons, validate the affected code/calculations/rendered output, update the pointer, then release scopes. Publish only reviewed reusable files when authorized. The existing weekly schedule stays quiet for unchanged states; the early-warning schedule remains separate from that monitor.
