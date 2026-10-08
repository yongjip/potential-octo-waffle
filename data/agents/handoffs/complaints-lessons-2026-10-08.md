# Handoff Document complaint workflow lessons

- agent: codex-complaints-lessons
- task: complaints-lessons-2026-10-08
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; instructions/agent-workflow.md; instructions/self-correction.md; data/agents/handoffs/complaints-lessons-2026-10-08.md; global:git
- integration target: codex/complaint-strategy-2026-10-08

## Changed files

- tools/complaints/lessons-learned.md: consolidate lessons from account storage, real password login, browser recovery, action authorization, private proof, telephone follow-up, complaint records, discovery and legislative review.
- tools/complaints/README.md: add the lesson entry point and dated four-portal login outcome.
- tools/complaints/accounts-and-remote.md: replace outdated login-pending wording, record the observed authenticated signals and distinguish CLI storage status from UI evidence.
- tools/complaints/remote-runbook.md: add fresh-password verification, current CAPTCHA handling, Seoul return verification, attempt counting and private observation storage.
- tools/complaints/computer-use.md: add stale-tab recovery, browser binding preservation, native-window matching, safe display evidence and completion cleanup.
- instructions/agent-workflow.md and instructions/self-correction.md: require documenting every newly learned lesson, updating the applicable runbook and retaining evidence and uncertainty before task completion.
- This handoff: preserve context and the remaining verification scope without credentials or case identifiers.

## Commands and checks

- Read repository instructions, applicable complaint guides, correction records and dated handoffs. Applied the pages:write-page skill to the standalone repository lesson document; no cloud Page was created.
- Initial instructions:doctor and kb:doctor passed with zero errors or warnings. Initial doctor passed with zero errors and 28 existing missing review-data link warnings.
- Read only selected nonsecret fields from the private login result: four verified credential logins, one submitted password attempt per portal and authenticated UI signals. No credential values were loaded or printed during this documentation task.
- Read the account module contract: runtime session_state and the CLI browser_session remain not_verified because storage diagnostics do not inspect the browser.
- Checked that current reusable documents no longer describe the completed login checks as pending. Historical handoffs remain unchanged.
- A combined patch was rejected because its context did not match. Verified that the proposed new file had not been created, then applied the corrected patches. The lesson record includes this recovery.
- Restored the existing managed civic worktree at the published branch head, verified it was clean, and selected the existing complaint branch. Unrelated main-checkout changes remain outside the integration.
- Final instructions:doctor and kb:doctor passed with zero errors or warnings in the primary checkout and managed worktree. Final doctor passed in both with zero errors and the same 28 existing missing review-data link warnings.
- Focused documentation verification read back all eight changed files, checked 55 local links and Markdown anchors in the primary checkout, and found no literal credential assignments. Reviewed the public diff and complete lesson document in the managed worktree. Primary git diff --check passed.
- No runtime tests were added or rerun because no executable implementation changed. No private authentication or case files were changed or copied.

## Decisions

- The user's request applies to all lessons from the complaint workflow and to future work. Add both a consolidated record and a persistent completion rule; do not leave the lessons only in chat.
- The user creates accounts and enters credentials. The agent uses the existing saved pair when login is requested. Do not resume signup or duplicate the Seoul account.
- All four password logins passed on 2026-10-08. This completes the account-authentication deferrals in earlier handoffs. Those handoffs describe earlier stages and must not override the current dated result.
- The user's direct instruction covered the current pending CAPTCHA steps. Do not ask again for the same steps or describe CAPTCHA as an automatic personal-typing handoff. Future action-time requirements remain governed by current tool policy.
- Old-tab capture failures were observation failures before password submission. Fresh tabs in the same browser restored observation. The underlying technical cause remains unproven.
- Record local storage readiness, authenticated session, individual case query and accepted filing separately. Keep the runtime profile unchanged and keep real login evidence in ignored private storage.
- Preserve the earlier Seoul follow-up route correction, telephone-transcription limits, separate document requests and proposals, source/version coverage limits and implemented-improvement criteria.
- Publish reusable instructions and anonymous observations only. Do not copy env files, login result files, screenshots, case receipts, transcripts or private plans into the managed worktree.
- Documentation-only change. No runtime code, credential schema, complaint state, schedule or external filing is changed.

## Deferred items

- Individual case matching, historical guest-case access, current case status, due dates and written answers remain separate tasks.
- Filing forms and actual acceptance have not been verified by the login task. Legislation-center login does not extend tracker procedure support.
- Fully unattended operation and a separately initiated remote query are not established by stored credentials or a dated successful login.
- The exact cause of stale capture failures remains unknown. Reassess only if the failure recurs; do not invent a permanent diagnosis.

## Next agent should

1. Read lessons-learned.md and the updated runbooks before repeating the workflow.
2. Treat account storage and the dated four-portal password checks as completed. Check current sessions when an actual query needs them.
3. Preserve specific authorization, check only concrete new policy requirements, and prepare the full local packet before any missing filing approval.
4. Keep new observations private where necessary, add every new lesson to the current guide, and validate the resulting documentation.
