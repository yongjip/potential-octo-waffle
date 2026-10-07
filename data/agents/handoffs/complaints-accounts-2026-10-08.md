# Handoff: User-entered complaint accounts and remote preparation

- agent: complaints
- task: accounts-remote-2026-10-08
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; data/complaints (primary checkout only); data/agents/handoffs/complaints-accounts-2026-10-08.md; global:git

## Changed files

- tools/complaints/accounts.mjs: private credential initialization, hidden terminal input, selected-portal loader and redacted status/doctor commands.
- tools/complaints/accounts.test.mjs: meaningful checks for privacy, literal string handling, host mismatch, unsafe links/permissions, concurrent writers and Git boundaries.
- tools/complaints/.env.example: six empty variables for the three supported account systems.
- tools/complaints/accounts-and-remote.md: Korean user signup/input instructions and connected-Mac limitations.
- tools/complaints/remote-runbook.md: English agent workflow, private loading pattern, runtime checks and completion distinctions.
- tools/complaints/computer-use.md and README.md: connect the account preparation to existing complaint tracking.
- Private, ignored primary-checkout data/complaints/auth/.env and runtime.json: empty values and current-host profile. Do not copy these into the feature worktree or stage them.

## Commands and checks

- Read the repository instruction layer; no matching civic domain prompt exists.
- agent:status showed no existing locks; claimed scopes in the primary checkout and restored feature worktree.
- Pre-write instructions:doctor and kb:doctor passed with zero warnings/errors. doctor had zero errors and 28 pre-existing review-gated data-link warnings.
- Restored the civic-complaints managed worktree and switched to codex/complaint-strategy-2026-10-08; this excludes unrelated dirty primary-checkout work and main-branch commits.
- Used supported read-only computer use to inspect the three public membership routes and official web sources for remote operation and terms. No personal fields were entered and no agreements were accepted.
- node --test tools/complaints/accounts.test.mjs tools/complaints/tracker.test.mjs: 17 tests passed.
- Executed store in a real PTY using disposable fake credentials. Verified that neither value was echoed and special characters survived a private read-back. Removed the disposable fixture.
- Initialized empty private storage; accountStatus confirmed matching current host, private permissions, Git exclusion and all three credential pairs absent.
- The initial computer-use module import exposed a process-global compatibility issue. Replaced the top-level process UID access with os.userInfo and guarded the CLI entry point. Tests passed again. A fresh versioned import in the current computer-use REPL succeeded and returned only redacted absence flags.
- Final validation in both checkouts: instructions:doctor and kb:doctor had zero warnings/errors; doctor had zero errors and the same 28 pre-existing warnings. The feature worktree passed all 17 tests, 31 reusable local-document links, six empty example values and git diff --check. The private account doctor returned expected exit code 2 because the user has not entered credentials; the existing private tracker remained valid with seven cases and zero events.

## Decisions

- The user selected 국민신문고, 정보공개포털 and 서울시 응답소, with a connected-Mac remote session.
- The user clarified that they will sign up and enter their own ID/password; the agent prepares storage only. Do not resume automatic signup, ask for credentials in chat or accept terms on their behalf.
- The currently executing Mac is used for the empty local setup. The separate Mac choice question was not answered. No credentials or private ledger were transferred to another host, and that host was not configured.
- Seoul Eungdapso uses Seoul integrated membership; do not create a duplicate Eungdapso-only account.
- Real credentials remain in ignored storage. Public commits contain only code, empty examples and instructions. Plaintext env storage is documented accurately; file mode 600 is access control, not encryption.
- Keep username/password strings literal; do not source the file. Reject unsafe storage and host mismatch before loading a credential pair. Use a writer lock and atomic replacement for credential updates.
- The user directed that observed portal-terms passages must not become an operator-permission gate. None was implemented. Preserve factual observations and apply concrete computer-use requirements separately.
- Storage, authenticated session, remote query and accepted filing are separate states. No real account was created, connected or used to submit a complaint in this task.

## Deferred items

- User signup and private credential entry.
- Verify actual authentication and historical-account/guest receipt access for each portal.
- Verify a remote-initiated query on the Mac that holds the private data. Existing host listing alone does not prove remote browser or data availability.
- Verify a specifically authorized filing and persist its accepted receipt. Fully unattended submission is not established.
- Recurring schedules and separate-host secret synchronization remain unrequested and unconfigured.

## Next agent should

1. Read accounts-and-remote.md, remote-runbook.md and computer-use.md. Treat preparation as completed; user signup and value entry are future user steps.
2. Run redacted account status in the stable primary data directory. Use explicit --data-dir from a temporary worktree.
3. Use the tested local module import pattern inside computer use; keep credentials in local variables without printing. If the module changes during the same REPL lifetime, use a fresh import version to avoid cached old code.
4. Verify the actual login form, origin, account and execution host before accessing receipts. Follow tool requirements for concrete authentication steps.
5. Update existing cases only from primary observed evidence and never treat stored credentials as a successful login or filing.
