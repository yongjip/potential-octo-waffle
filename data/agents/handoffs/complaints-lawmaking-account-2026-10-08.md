# Handoff: Add legislation-center account storage

- agent: codex-complaints-lawmaking
- task: complaints-lawmaking-account-2026-10-08
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; data/complaints/auth (primary checkout only); data/agents/handoffs/complaints-lawmaking-account-2026-10-08.md; global:git

## Changed files

- tools/complaints/accounts.mjs: add lawmaking credentials, hidden-input selection and controlled initialization upgrade from the earlier three-portal store.
- tools/complaints/.env.example: blank COMPLAINTS_LAWMAKING_ID and COMPLAINTS_LAWMAKING_PASSWORD.
- tools/complaints/accounts.test.mjs: regression coverage for preserving legacy credential bytes, adding/storing the fourth account, idempotent initialization, safe diagnostics and refusing incomplete legacy stores before mutations.
- tools/complaints/accounts-and-remote.md, remote-runbook.md and README.md: four-account mapping and the single-account input command.
- tools/complaints/portals.json: official public legislation-center entry metadata. Authenticated routes and tracker support remain unverified or unsupported.
- Private ignored data/complaints/auth: initialize the updated store through the local account module to add empty variables and update supported portals. Never copy these files to the worktree or commit them.

## Commands and checks

- Read repository instructions and current account contracts before edits.
- Read the official public Citizen Participation Legislation Center homepage and membership entry. No website login or signup was performed.
- Primary checkout: node --test tools/complaints/accounts.test.mjs passed all 10 account tests with synthetic credentials before updating the private store.
- Private initialization succeeded, upgraded the earlier storage and reported both lawmaking variables present, credential file mode 600 and Git exclusion. No credential values were emitted.
- Primary checkout: tracker.mjs check passed with 7 cases and 4 events. Instruction and KB validators passed with zero warnings/errors. Project doctor passed with zero errors and the existing 28 missing review-data link warnings.
- Managed worktree: node --test tools/complaints/accounts.test.mjs tools/complaints/tracker.test.mjs passed all 19 tests. Instruction and KB validators passed with zero warnings/errors. Project doctor passed with zero errors and the same 28 existing warnings. git diff --check passed.
- Restored the existing managed civic worktree and selected codex/complaint-strategy-2026-10-08. Copied only the eight public code, example, document and handoff files. Private authentication and complaint data remain in the primary checkout.

## Decisions

- Interpret the requested legislation center as opinion.lawmaking.go.kr, consistent with the earlier legislative opinion work. It has a separate account pair and does not reuse 국민신문고 values implicitly.
- Strict normal reads require the complete current schema. Only initialization accepts the exact earlier portal/key set for upgrade; arbitrary missing or partially added keys remain errors.
- Upgrade preserves existing credential bytes and configured host. Reinitialization preserves already stored legislation-center values.
- The protected module handles private data internally and emits only preparation metadata; credential values are never returned to the conversation, logged or exposed in error messages.
- Four-account storage does not add authenticated login automation or extend the three-portal complaint tracker. No credential was entered by the agent and no external filing, message or scheduler was created.

## Deferred items

- The user enters the account in their interactive terminal. Actual account existence, login and legislative opinion acceptance remain unverified.
- Extend tracker procedure/portal contracts separately when the task requires actual legislation-center tracking.

## Next agent should

1. Use store --portal=lawmaking for the user's hidden entry. Use init to upgrade earlier stores on their configured host.
2. Load only the selected pair through the supported adapter, never print or serialize the return value.
3. Preserve the distinction between local storage readiness, authenticated UI state and accepted submissions.
