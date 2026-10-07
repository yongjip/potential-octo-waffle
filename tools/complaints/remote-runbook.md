# Account storage and connected-Mac complaint runs

Canonical language: English. The user creates the accounts and enters credentials. The agent prepares storage and uses supported computer-use tools after setup. Account creation is not the current task.

## Private storage

1. Use a stable private data directory on the execution Mac. The main checkout's `data/complaints/` is the default. Temporary Git worktrees have a different default; pass the absolute main data directory when using a worktree.
2. Initialize with `accounts.mjs init --host=<actual-execution-hostname>`. Keep `auth/.env` and `auth/runtime.json` at mode 600 and their directories at mode 700. Never commit either file or copy real values into examples.
3. The user runs `accounts.mjs store --portal=all` in their own terminal. Both values are hidden. Never request credentials in chat, command arguments, screenshots, handoffs or environment dumps.
4. Run `accounts.mjs status` or `doctor`. Print only presence flags. Missing credentials, malformed files, wrong host, unsafe permissions, links or tracked files fail locally. Do not retarget an existing profile silently.
5. Use `loadPortalCredentials(dataDir, portal)` from `accounts.mjs` inside the supported local credential adapter. It returns only the selected pair. Do not print or serialize it. Do not source the env file.

Git does not synchronize credentials or the private complaint ledger. A listed remote host does not prove that the repository, browser or credentials are present there. This task does not create a new SSH service, HTTP credential endpoint or scheduler.

## Loading in the computer-use session

Check whether the current computer-use REPL can import the saved local module on the execution Mac. Verify access with `accountStatus` before using real values. All UI actions must still use `cua_repl` and its current documented APIs. If module access is unavailable, record the limitation and use supported browser sign-in or autofill. Never print a password to bridge a tool limitation.

```javascript
// Replace both example paths with the actual stable local paths.
let complaintAccounts = await import("file:///ABSOLUTE_REPO/tools/complaints/accounts.mjs");
let complaintLogin = await complaintAccounts.loadPortalCredentials(
  "/ABSOLUTE_REPO/data/complaints", "epeople"
);
// Keep complaintLogin private. Observe the actual login form first.
// Fill its ID and password with supported cua APIs, using the two variables.
// Never print the pair, use guessed selectors or mutate the page via evaluate.
```

This is a loading pattern, not a verified portal-login executor. The account tool does not click login or submit and cannot determine whether a password is correct.

## Connected-Mac operation

1. Select the Mac and workspace holding the private data. Verify the shell hostname against the profile. Confirm that computer use controls that Mac before loading credentials; browser and shell hosts can differ.
2. Read this file and `computer-use.md`. Identify the operation: existing-case query, draft preparation or authorized filing. Account, login and case-processing states remain separate.
3. Observe the current login UI and origin. Eungdapso uses Seoul integrated membership. Reuse an authorized session for the intended account or load only that portal's pair. Do not output entered credential values in diagnostic state.
4. Apply current computer-use rules for authentication, CAPTCHA, new-password entry, binding agreements and sensitive transmission. The user handles signup. Storage preparation does not authorize accepting terms or filing an unspecified petition.
5. Verify the authenticated account before reading or filing. Reconcile historical receipts; a new account may not include old guest filings automatically.
6. Follow the tracker lock and duplicate checks. Before filing, persist `submission_unknown`. After acceptance, save primary evidence and the receipt. Authentication failure must not overwrite case status.
7. Report only reached states: storage prepared, credentials stored, local loading supported, authenticated session verified, remote query verified, or filing accepted. Credential presence is not proof of working remote submission.

The observed terms are recorded in `accounts-and-remote.md`. The user directed that those passages must not become an operator-permission gate. Do not add that gate or invent received permission. Apply concrete tool confirmation requirements independently. Do not schedule recurring work unless the user requests it.
