# Complaint strategy documentation and publication handoff

- Agent: complaints
- Task: document-strategy-and-push
- Claimed scopes in the original checkout: tools/complaints; data/agents/handoffs/complaints-2026-10-08.md; global:git
- Claimed scopes in the publication worktree: README.md; tools/complaints; data/agents/handoffs; global:git

## Changed files

- tools/complaints/strategy.md: Korean strategy for finding, verifying and improving unreasonable administration and rules.
- tools/complaints/README.md: strategy entry point, the seven registered cases and four separate legacy records, current automation limits, and the next reconciliation task.
- data/agents/handoffs/complaints-2026-10-08.md: this handoff.
- README.md in the publication worktree: entry points for the complaint workflow and strategy.

The publication also includes the reusable tracker, examples, portal configuration, computer-use runbook, and 2026-10-07 handoff created earlier in this chat. Private case data, receipts, correspondence, shared-chat history and evidence remain under ignored data/complaints. The four legacy records have not been imported or checked against live portals in this documentation task.

## Commands run

- npm run agent:status
- npm run agent:claim -- --agent=complaints --task=document-strategy-and-push --scope=tools/complaints --scope=data/agents/handoffs/complaints-2026-10-08.md --scope=global:git
- git fetch origin
- npm run instructions:doctor
- npm run kb:doctor
- npm run doctor
- node --test tools/complaints/tracker.test.mjs
- node tools/complaints/tracker.mjs check
- git diff --check
- git switch -c codex/complaint-strategy-2026-10-08 in the managed civic-complaints worktree
- Instruction, KB, project and tracker validation repeated in the isolated publication worktree
- Reusable Markdown link and JSON configuration validation
- git check-ignore for all four private complaint files

The instruction and KB validators passed with zero warnings or errors. The project validator passed with zero errors and the same 28 pre-existing warnings for unavailable review-gated data links. All nine tracker tests passed. The local store validated seven cases and zero events.

The same validators and all nine tests passed in the publication worktree. Eight reusable document links and three JSON files validated. Three documentation links intentionally refer to private local data that is not part of the Git checkout. No private complaint data was copied into the publication worktree.

## Decisions

The user's goal is to find unreasonable administration and rules in South Korea and carry each issue through to verified improvement. Issue discovery, evidence review, a specific requested change, the appropriate submission route and outcome verification are now documented as one workflow. Active issues are limited to three as a working priority rule. Processing closure is separate from issue resolution.

The inventory is a dated local-record snapshot, not a complete account export or a statement of current portal states. Legacy waiting records do not establish present nonresponse or a missed legal deadline. Policy hypotheses and unconfirmed submissions remain separate from recorded filings. The current tracker does not support Songpa's Saeol portal; its identifier and runbook must be added before that record is imported.

Main already contained two unrelated, unpushed home-layout commits. Publish the complaint changes on codex/complaint-strategy-2026-10-08 from origin/main in the managed civic-complaints worktree. Include only complaint files, their handoffs and a complaint entry in the worktree's root README. Preserve the original checkout's unrelated changes and commits.

## Deferred items

- Reconcile the eleven known filing-related records and confirm actual portal receipts.
- Add Songpa's Saeol portal before importing its record.
- Import the four separate records with their original provenance and basis dates.
- Query the authenticated portals and archive requests, replies, extensions and transfers.
- Connect recurring monitoring and notifications when requested by the user.
- Execute concrete new submissions only within their authorized scope.

## Next agent should

Read tools/complaints/strategy.md, README.md and computer-use.md. Verify the published branch and repository state before integration. The original main checkout can still contain untracked copies of the complaint files because publication uses a separate worktree. Do not stage unrelated research or home-layout changes to make the checkout appear clean. Claim private-data and portal configuration scopes before continuing reconciliation. Preserve pending evidence and do not duplicate reported submissions.
