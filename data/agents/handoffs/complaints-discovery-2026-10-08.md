# Issue discovery research handoff

- Agent: complaints
- Task: research-issue-discovery
- Claimed scopes in both checkouts: tools/complaints; data/agents/handoffs/complaints-discovery-2026-10-08.md; global:git

## Changed files

- tools/complaints/discovery-research.md
- tools/complaints/discovery-sources.json
- tools/complaints/discovery-runbook.md
- tools/complaints/issue-candidate.example.md
- tools/complaints/strategy.md
- tools/complaints/README.md
- data/agents/handoffs/complaints-discovery-2026-10-08.md

## Research and commands

Read the repository instructions and existing complaint strategy. Used web search, original public pages and published PDFs from the ACRC, law information center, NARS, NABO, OECD and NSW Government. Read the methods and selected source passages, retaining source dates and review limits. Restored the task's managed civic-complaints worktree and continued the already-published codex/complaint-strategy-2026-10-08 branch.

- npm run agent:status
- npm run agent:claim -- --agent=complaints --task=research-issue-discovery --scope=tools/complaints --scope=data/agents/handoffs/complaints-discovery-2026-10-08.md --scope=global:git
- npm run instructions:doctor
- npm run kb:doctor
- npm run doctor
- git switch codex/complaint-strategy-2026-10-08
- git status --short --branch
- Final instruction, KB and project validators in the publication worktree
- Local document link and external URL syntax validation
- Source-catalog ID, review-scope, access-status, date and URL validation
- git diff --check

Before research writes, the instruction and KB validators passed without warnings or errors. The project validator passed with zero errors and the same 28 pre-existing warnings for absent review-gated data links.

Final validation in the publication worktree also passed with zero errors and the same existing project warnings. Seventeen reusable local document links, 22 external URL references and nine source entries validated. Three links intentionally refer to private local data. The tracker implementation and tests were unchanged, so the nine passing tests from the previous publication were not repeated for this documentation-only follow-up.

## Decisions

The user explicitly requested research into how to discover unreasonable administration and rules. The research now connects recurring-complaint analysis, comparisons of equivalent rules and cases, and measured service journeys to a candidate-review procedure. Source material, observed facts, interpretation and action remain separate. A template captures counterevidence, current versions, comparison conditions, prior remediation and measurable outcomes.

Reviewed examples show the path from a public complaint report, a prior improvement recommendation, or a staged program evaluation to a verification question. They are methodological examples, not new filings, current violations or already-verified candidates. No private case records were modified. No portal account was queried. No complaint or external message was sent and no recurring schedule was created.

The source catalog has nine entries with explicit access and review scopes. NARS report categories were read, but individual report findings were not. The audit homepage and complaint dashboard had no readable body via web retrieval. The NSW full method guide required email entry, so no registration or download form was submitted. The public complaint-handling guide's method text was reviewed; screenshot retrieval failed, and no visual scale or chart numbers were extracted. No licensed report was reproduced in the repository.

## Deferred items

- Run the documented pilot: four complaint reports, three decisions, up to ten candidates, two comparisons and one real journey.
- Inspect dynamic public pages through supported computer-use tools when necessary.
- Check present implementation before using an existing recommendation as a new issue.
- Verify representative scope and independent evidence before generalizing individual complaints.
- Reconcile the eleven existing filing-related records as described in strategy.md.

## Next agent should

Read discovery-research.md and discovery-runbook.md. Use discovery-sources.json to locate material and recheck its current availability. Claim data/complaints before creating real candidate records. The Markdown candidate template is not tracker.mjs input. Follow computer-use.md for any specifically authorized filing and preserve the prior separation between local private data and published workflow files.
