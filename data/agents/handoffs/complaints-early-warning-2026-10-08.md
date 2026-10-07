# Handoff: Pre-implementation civic issue discovery

- agent: complaints
- task: research-early-warning
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; data/agents/handoffs/complaints-early-warning-2026-10-08.md; global:git

## Changed files

- tools/complaints/early-warning.md: Korean public-source research, proposal review questions, intervention windows, version tracking and future monitoring design.
- tools/complaints/early-warning-sources.json: Twelve official-source entries with dated review scope and access limits.
- tools/complaints/README.md and strategy.md: Connect pre-implementation prevention to existing issue/case workflow.
- tools/complaints/discovery-research.md: Link prospective research to the existing discovery methodology.
- tools/complaints/discovery-runbook.md: English operational steps for proposed legislation, rules and public programs.
- tools/complaints/issue-candidate.example.md: Optional proposal identity, versions, deadlines, assumptions and outcome fields.

## Commands and checks

- Read INSTRUCTIONS.md, evidence-policy.md, agent-workflow.md and self-correction.md. No matching civic domain prompt exists.
- Ran agent:status; no prior active locks.
- Ran instructions:doctor, kb:doctor and doctor before research writes: zero errors; doctor has 28 existing review-gated data-link warnings.
- Restored the existing managed civic-complaints worktree; selected codex/complaint-strategy-2026-10-08, whose remote excludes unrelated main-checkout commits.
- Claimed identical edit/Git scopes in both checkouts.
- Used official public web sources and supported read-only computer use for the National Assembly notice and original PDF.
- Extracted the downloaded original PDF with pdftotext -layout and computed SHA-256 with shasum -a 256.
- Final instructions:doctor and kb:doctor: zero warnings and zero errors.
- Final doctor: zero errors and the same 28 pre-existing review-gated data-link warnings.
- Focused documentation checks passed: 26 reusable local links, 42 external URL references, 3 intentionally private data links and 12 unique source entries. Reviewed dates, HTTPS URLs, required metadata, hashes, opinion periods and duplicate headings.
- git diff --check passed. Tracker runtime was unchanged; its tests were not repeated for this documentation-only update.

## Decisions

- Add prevention alongside remedy, under the same issue_id. Proposed actions, predicted effects, current facts and policy judgment remain separate.
- Track current versus proposed text, institutions, object IDs, versions, deadlines and successor documents. A disposed original is not sufficient evidence that its content ended.
- Use official plan/notice/budget/procurement surfaces as signals, with counterevidence and safeguards before preparing a concrete requested change.
- Actual opinion windows govern work planning. Government, parliamentary, administrative and local procedures have different rules and exceptions.
- Keep institutional coverage gaps and failed retrieval visible. No-query success or unavailable data must not become a clean monitoring result.
- Preserve existing private complaint data and unrelated repository changes. No new receipt or completed filing was created.

## Access limits and deferred work

- Government and local notice lists have documented coverage gaps. Add institution and council sources for selected topics/regions.
- Parliamentary public detail and bill 2221814 original PDF were read; detailed review pages and meeting agendas were not. PDF extraction supports only the narrow proposed-text example; no present-harm or illegality conclusion.
- Administrative-procedure article pages show 2023-03-24; the complete accessible original PDF uses 2022-07-12, Act 18748. Preserve both dates and verify case-specific current law before a legal conclusion.
- Re-notice attachments, earlier versions, approved budget and individual procurements were not reviewed. API metadata does not prove current coverage.
- Recurring collection, content-diff execution, alert delivery, subscriptions and external submissions remain unimplemented/unexecuted. Suggested cadences are design choices, not scheduled jobs.

## Next agent should

1. Read early-warning.md and the source catalog.
2. Select a bounded topic/institution/region scope, re-observe sources and preserve dates/versions.
3. Verify candidate changes and counterevidence; choose a concrete correction and confirmed intervention window.
4. Extend case/procedure/portal support before recording opinion submissions the current tracker does not accept.
5. Implement authorized read-only monitoring with failure visibility and version/successor tracking before enabling recurrence.
