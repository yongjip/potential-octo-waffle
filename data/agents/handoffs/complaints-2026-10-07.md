# Complaint automation documentation handoff

- Agent: complaints
- Task: document-complaint-automation
- Claimed scopes: tools/complaints; data/complaints; data/agents/handoffs/complaints-2026-10-07.md

## Changed files

Reusable files:

- tools/complaints/README.md
- tools/complaints/computer-use.md
- tools/complaints/portals.json
- tools/complaints/case.example.json
- tools/complaints/event.example.json
- tools/complaints/tracker.mjs
- tools/complaints/tracker.test.mjs

Local private files, excluded by the repository's existing data ignore rule:

- data/complaints/housing-policy-history.md
- data/complaints/cases.jsonl
- data/complaints/events.jsonl
- data/complaints/board.md

No existing research outputs or user changes were edited. No stage, commit, push, recurring schedule, or external filing was performed.

## Commands run

- npm run agent:status
- npm run agent:claim -- --agent=complaints --task=document-complaint-automation --scope=tools/complaints --scope=data/complaints --scope=data/agents/handoffs/complaints-2026-10-07.md
- npm run instructions:doctor
- npm run kb:doctor
- npm run doctor
- node --test tools/complaints/tracker.test.mjs
- node tools/complaints/tracker.mjs check
- node tools/complaints/tracker.mjs board --as-of=2026-10-07 --write
- Local Markdown link and JSON configuration validation
- git check-ignore for all four private files

Validation: nine tracker tests passed. Seven seeded cases and zero update events validated. Seven local Markdown links and three JSON example/configuration files validated. Instruction and KB doctors passed without warnings. Project doctor passed with zero errors and the same 28 pre-existing warnings about absent review-gated data links.

## Decisions

The shared conversation was read through the browser after web retrieval failed. Textual user quotations and earlier AI summaries were distinguished. Shared attachments were displayed as uploaded-image placeholders, so their contents were not treated as inspected originals.

All seven imported case states remain pending primary evidence. The agency's internal receipt is distinct from the applicant's portal receipt. A response-received state does not mark an issue resolved. The tracker preserves changes in append-only events, checks duplicate receipts, and refuses preparation of a case that already has filing identifiers or dates.

Public query and filing menu entry points were inspected on the information disclosure portal, epeople and Seoul eungdapso. Authenticated case lists and forms were not inspected. The runbook defines recovery for uncertain submissions, concrete filing authorization, and primary evidence capture. It does not assume blanket approval for new complaints or use earlier AI recommendations as execution permission.

Legal period descriptions were checked against official Information Disclosure Act Articles 11 and 18 and an official processing guide. The tracker does not compute legal deadlines. Portal due dates and internal check dates remain separate.

## Deferred items

- Match the imported cases against authenticated portal originals.
- Recover missing applicant receipt numbers and the Seoul supplementary filing details.
- Archive actual request bodies, receipts, extensions, transfers and replies.
- Execute an authorized query workflow, then connect form entry for a concrete new filing.
- Configure recurring monitoring only when the user asks for it.

## Next agent should

Read tools/complaints/README.md and tools/complaints/computer-use.md. Claim the appropriate private-data scope. Use the user's authorized browser session for the initial query task. Append observations only after verifying source evidence. Preserve the private local files and their source limitations. Do not regenerate legacy research outputs or duplicate already reported filings.
