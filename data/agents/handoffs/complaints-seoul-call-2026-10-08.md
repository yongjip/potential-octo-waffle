# Handoff: Complaint telephone explanation and written follow-up

- agent: codex-complaints-call
- task: complaints-seoul-call-2026-10-08
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; data/complaints (primary checkout only); data/agents/handoffs/complaints-seoul-call-2026-10-08.md; global:regenerate; global:git

## Changed files

- tools/complaints/phone-followup.md: reusable Korean guidance for preserving telephone explanations, identifying partial answers, requesting written confirmation and distinguishing existing records from new analysis.
- tools/complaints/README.md: link to the telephone follow-up guidance.
- Private, ignored data/complaints/evidence: selected user-provided transcript passages, interpretation, two event input files and a hash manifest. The supplied audio was not available; selected passages are explicitly labelled as excerpts.
- Private, ignored data/complaints/drafts: a written-confirmation request and a narrowly scoped existing-records request. Both remain unsubmitted.
- Private, ignored data/complaints/events.jsonl: two append-only observations linked by topic to existing cases. The precise portal case associated with the call remains unverified.
- Private, ignored data/complaints/housing-policy-history.md and regenerated board.md: connect the telephone intake and next checks.

## Commands and checks

- Read repository instructions, evidence policy, workflow, correction policy, real-estate domain guidance and open-data governance.
- Pre-write instructions:doctor and kb:doctor passed; doctor had zero errors and 28 pre-existing review-gated data-link warnings.
- Inspected current tracker contracts. No runtime code, account settings or credential files were changed or read.
- Read the official text of the complaint-result notification provisions, including statutory exceptions, before writing the general legal guidance.
- Claimed scoped writes and global Git/regeneration ownership. Restored the existing managed civic worktree and switched to codex/complaint-strategy-2026-10-08.
- Recorded two events through recordEvent, then regenerated only the complaint board with tracker.mjs board --as-of=2026-10-08 --write.
- Primary-checkout tracker validation passed: seven cases and two events. Focused verification passed for preserved filing and official-evidence states, three partial telephone answers, six private hashes and file modes, and eight local links.
- Primary-checkout final instructions:doctor and kb:doctor passed; doctor had zero errors and the same 28 existing warnings.
- Public integration must contain only this handoff, phone-followup.md and the README link. Do not copy private complaint records or account files to the managed worktree or stage them.
- Documentation-only change; no new tests were added.

## Decisions

- Treat the user-provided automatic transcription as shared_user_quote with pending evidence. It is not an official written response or a verified audio extraction.
- Keep historical response dates, portal status, last_checked_on and evidence_status unchanged. A telephone explanation does not itself establish portal closure, a new written response or a resolved issue.
- Preserve the difference between no prior analysis, no currently retained records, inadequate analysis and a newly planned calculation. Do not promote an answer about one analysis into absence of all agency research.
- Preserve conflicting numeric transcription values without choosing one. Verify the applicable recruitment notice, asset definition/timing, debt treatment, loan conditions and installment conditions before estimating affordability.
- A written response is the statutory default for a completed, accepted complaint, with exceptions. Actual procedure, classification and notification must be checked before assessing a violation.
- Existing pending follow-up or supplementary-answer functionality is the preferred route. Verify the case and original text before a further filing; avoid duplicate submissions.
- An internal next-check date is not a legal deadline, scheduler or notification task.
- No complaint, information request, email or public message was submitted. No recurring automation was created.

## Deferred items

- Verify which existing portal case the call concerned and obtain the official status and final written answer.
- Obtain the original audio if it becomes available and compare sensitive or ambiguous transcript passages.
- Determine whether the older policy decision involved the requested integrated analysis and identify existing reports or calculation records.
- Track an actual policy or procedure change separately from receipt of an explanation.

## Next agent should

1. Read the private call note and drafts in the primary checkout, then inspect the relevant portal case when authorized by the continuing task.
2. Compare each written answer with the existing questions and preserve prior observations.
3. Use the existing-records request only for the remaining document question. It must not ask an information-disclosure procedure to create new analysis.
4. Keep user and official contact details, receipts and transcript excerpts out of public Git commits.
