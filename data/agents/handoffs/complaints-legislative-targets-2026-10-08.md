# Handoff: Legislative correction candidates

- agent: complaints
- task: legislative-targets-2026-10-08
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; data/complaints/discovery (primary checkout only); data/agents/handoffs/complaints-legislative-targets-2026-10-08.md; global:git

## Changed files

- tools/complaints/legislative-targets-2026-10-08.md: Korean candidate brief, current deadlines, clause-specific corrections, counterevidence and deferred targets.
- tools/complaints/legislative-targets-2026-10-08.json: dated original-source registry and two opinion-preparation targets; facts are separate from recommendations and filing state.
- tools/complaints/opinions/2026-10-08-customs-biometrics.md and 2026-10-08-ai-service-inventory.md: public drafts without applicant information.
- tools/complaints/README.md and early-warning.md: connect the brief and drafts to the discovery workflow.
- Private, ignored data/complaints/discovery: source observations, customs original PDF and candidate records. Never copy this directory into the feature worktree or stage it.

## Commands and checks

- Read the repository instruction layer, open-data governance and existing civic research workflow. No civic domain prompt exists.
- Ran agent:status and claimed scopes in the primary checkout and restored managed worktree.
- Pre-write instructions:doctor and kb:doctor passed; doctor had zero errors and the same 28 existing review-gated data-link warnings.
- Restored the civic-complaints worktree and switched to codex/complaint-strategy-2026-10-08 at 4d77463. Unrelated main changes are excluded.
- Used official web sources and supported computer use to inspect current notices and existing legal safeguards. Read the six-page customs original with pdftotext and rendered pages 3–4 with pdftoppm for visual verification.
- A direct fetch of the optional local-grant bill PDF returned HTTP 400. Its contents remain unverified and it is not promoted as a correction target.
- Retained six original/DOM source observations with hashes in ignored primary-checkout discovery storage; the original customs PDF matched its recorded SHA-256. Added two append-only local candidate records with no receipt or case ID.
- Final instructions:doctor and kb:doctor passed with zero warnings/errors in both checkouts. doctor had zero errors and the same 28 pre-existing review-gated data-link warnings.
- Focused verification passed: nine unique source records, assertion source/date/location gates, two currently open opinion windows, unspecified deadline times, unsubmitted filing state, existing draft files and 28 reusable local links. The seven selected public files matched the primary checkout; no private discovery/auth data was copied into the worktree. git diff --check passed.
- This is a documentation/metadata change; no runtime code or credential format changed and no new tests were added.

## Decisions

- Prioritize Customs Act bill 2221814 (opinion deadline 2026-10-16) and administrative notice 2026-1258 (2026-11-05). Deadline times are unknown.
- Proposed biometric safeguards supplement existing Personal Information Protection Act protections. Do not claim the bill has no safeguards, is already enacted, or proves actual indiscriminate collection.
- Annual AI publication is required by the parent law. Propose additional current online publication; do not label annual publication itself illegal. The draft excludes specified information, not expressly entire services. Make item-level separation explicit without requiring disclosure of protected information.
- The AI draft's 30-day update interval is a proposed value, not a current legal deadline. Link existing inquiry/review routes; do not create new statutory appeal rights through an administrative notice.
- The telecom re-notice closed on 2026-09-14. The prior 0.05% interpretation, boundary operator and final text remain pending; do not offer that expired notice as a currently open opinion channel.
- The infection-control re-notice remains an attachment-comparison lead. Short notice duration alone does not establish a defect. The local-grant bill was title/metadata screening only.
- Screened the first 30 of 321 ongoing Assembly entries by title in descending bill-number order. This is not exhaustive review of either those bills or national legislation.
- Public files contain original-source links/metadata and authored correction proposals only. Raw originals and UI observations remain ignored. No credentials, applicant data or receipts were read or published.
- No opinion, complaint, email or other external communication was sent. No recurring monitor was created. Existing complaint cases were not changed.

## Deferred items

- Re-observe latest text and deadline before any filing.
- Obtain records supporting biometric necessity, error testing, retention design and privacy review where available.
- Support the actual parliamentary/administrative opinion procedure in the complaint ledger before recording a receipt; existing portal enums do not support it.
- Verify telecom latest original attachment, comparison and final promulgation before resuming its numerical proposal.
- Compare infection-rule attachments and earlier notice before assessing corrections.
- User account signup, credential entry and remote receipt checks remain independent of this research task.

## Next agent should

1. Read the candidate brief, registry and two opinion drafts; do not restart account setup or confuse draft state with filing state.
2. Use existing issue IDs for follow-up and keep source/version observations append-only in ignored discovery data.
3. Verify current target, text, deadline and concrete user instructions before transmitting a final opinion. Do not add hypothetical permission gates to read-only research.
4. Follow final text and actual publication behavior to assess whether requested conditions changed. Receipt or response alone is not evidence of a resolved issue.
