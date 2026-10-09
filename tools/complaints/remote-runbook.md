# Account storage and connected-Mac complaint runs

Canonical language: English. Follow the latest destination-specific account instruction. The user created the original four accounts and entered their credentials. On 2026-10-09 the user separately authorised the agent to create a council account and generate and store its initial pair. Apply the current tool's confirmation rules to the actual authentication and agreement steps.

## Private storage

1. Use a stable private data directory on the execution Mac. The main checkout's `data/complaints/` is the default. Temporary Git worktrees have a different default; pass the absolute main data directory when using a worktree.
2. Initialize with `accounts.mjs init --host=<actual-execution-hostname>`. Keep `auth/.env` and `auth/runtime.json` at mode 600 and their directories at mode 700. Never commit either file or copy real values into examples.
   Initialization upgrades earlier three- or four-portal storage by preserving its credential bytes and adding missing lawmaking or council keys. It keeps the configured host. Current storage supports epeople, open_go_kr, seoul_eungdapso, lawmaking and seoul_council. Council membership is separate from Seoul city membership.
3. The user runs `accounts.mjs store --portal=all` in their own terminal. Both values are hidden. Never request credentials in chat, command arguments, screenshots, handoffs or environment dumps.
   Use `accounts.mjs store --portal=lawmaking` to enter only the Citizen Participation Legislation Center account. Its keys are `COMPLAINTS_LAWMAKING_ID` and `COMPLAINTS_LAWMAKING_PASSWORD`.
   Use `accounts.mjs store --portal=seoul_council` for council credentials. Its keys are `COMPLAINTS_SEOUL_COUNCIL_ID` and `COMPLAINTS_SEOUL_COUNCIL_PASSWORD`. The user explicitly authorised generating and storing a new council pair on 2026-10-09. Keep candidate storage, actual registration acceptance and successful login separate. Existing credentials must not be reused for another destination.
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

## Password login checks

Read [lessons-learned.md](lessons-learned.md) before repeating account verification. The four stored pairs passed password login on 2026-10-08. That observation does not establish future session validity or access to any individual case.

1. Check redacted local storage status and host match. Keep `browser_session=not_verified` and the runtime schema unchanged; the account CLI does not observe the browser.
2. Observe the official origin, account and current login form. For a password-verification task, distinguish an existing session from a fresh credential login. End an existing session only within the requested check and after preserving unfinished work. For a case query, reuse a suitable authorized session.
3. Load only the selected pair into private local variables. Fill the observed ID and password controls through supported computer-use APIs. Redact both values before emitting diagnostic state. Do not enable ID saving, password saving or persistent login without the applicable authorization.
4. If a CAPTCHA is present, apply the current tool's action-time policy. A direct user instruction to enter the currently pending security characters is confirmation for that step. The agent may read and enter them through supported tools; do not ask again for the same pending step. Do not reuse an expired image or record the characters in a public document.
5. Submit once and observe the authenticated result. Record the submitted-attempt count separately from observation or navigation failures. A capture error before submission is not a rejected password.
   If the portal explicitly rejects a CAPTCHA or ID/PW, record that message and inspect the current form before a justified retry. Do not treat a redacted password-value comparison as a failed credential check. The 2026-10-08 disclosure session authenticated after native password input with the same saved pair that had been rejected after DOM filling. The underlying cause is unknown; use supported input and the observed result, not an assumed password change.
   When a stale tab or obstructing autofill popover prevents observation, use the matched current native page through documented controls. Direct native field entry and native password paste completed Seoul authentication on 2026-10-09. The first post-submit observation still showed the password page; the next current observation showed authentication. That was one password submission, not a reason to submit again. Preserve the outcome and the unresolved observation cause.
6. For Seoul integrated membership, verify return to `eungdapso.seoul.go.kr` and an authenticated Eungdapso signal. Membership login alone does not complete the requested portal check.
7. Save original evidence privately under `auth/login-checks/<run>/`. Record portal, origin, observation time, fresh-login method, result, visible signals, attempt count, evidence path and SHA-256. Append the completed observation without deleting earlier pending diagnostics. Clear local credential variables when finished.

Observed signals on 2026-10-08 were 국민신문고 `나의 신문고` and `로그아웃`, 정보공개포털 `마이페이지` and `로그아웃`, 응답소 `로그아웃` and `내정보 변경`, and 국민참여입법센터 `마이페이지` and `로그아웃`. Re-observe live controls instead of treating these labels as permanent selectors. Stop once an authoritative result is visible and its evidence is saved.

Do not promote this check into a case query, filing acceptance or support for legislative opinions in the complaint tracker. Storage, browser verification and accepted procedure records remain separate.

Local module support differs between adapters. In the 2026-10-08 computer-use REPL, the account module worked, but importing the tracker failed because `process` was unavailable. Run tracker operations through its normal CLI or Node environment. Keep browser actions in `cua_repl`; do not change tracker code merely to work around that adapter limitation.

## Connected-Mac operation

1. Select the Mac and workspace holding the private data. Verify the shell hostname against the profile. Confirm that computer use controls that Mac before loading credentials; browser and shell hosts can differ.
2. Read this file and `computer-use.md`. Identify the operation: existing-case query, draft preparation or authorized filing. Account, login and case-processing states remain separate.
3. Observe the current login UI and origin. Eungdapso uses Seoul integrated membership. Reuse an authorized session for the intended account or load only that portal's pair. Do not output entered credential values in diagnostic state.
4. Apply current computer-use rules for authentication, CAPTCHA, initial credential entry, binding agreements and sensitive transmission. Complete authorised nonbinding signup preparation. Confirm actual binding terms at action time, and hand existing-password changes to the user. Storage preparation alone does not authorise accepting terms or filing an unspecified petition.
5. Verify the authenticated account before reading or filing. Reconcile historical receipts; a new account may not include old guest filings automatically.
6. Follow the tracker lock and duplicate checks. Before filing, persist `submission_unknown`. After acceptance, save primary evidence and the receipt. Authentication failure must not overwrite case status.
7. Report only reached states: storage prepared, credentials stored, local loading supported, authenticated session verified, remote query verified, or filing accepted. Credential presence is not proof of working remote submission.

The observed terms are recorded in `accounts-and-remote.md`. The user directed that those passages must not become an operator-permission gate. Do not add that gate or invent received permission. Apply concrete tool confirmation requirements independently. Do not schedule recurring work unless the user requests it.

## Council phone authentication

Start phone authentication from the actual council registration page when creating a council account. Keep its callback separate from a login-linked identity flow. Use the carrier supplied by the user. A carrier reply does not answer another portal's pending CAPTCHA confirmation.

On 2026-10-09, choosing a carrier in a held NICE window displayed a session-ended notice with generic cookie advice. A newly opened registration-linked window reached the authentication-method choices. This does not establish that cookie blocking caused the earlier failure. Save the expired state, close that window and reopen from the parent registration control. Do not weaken browser privacy protections solely because an error page suggests it.

The fresh SKT flow offered PASS, QR and SMS. Selecting QR exposed a required identity-service consent checkbox and four detail views: personal-information use, unique-identifier processing, NICE service terms and carrier terms. Inspect those actual terms and obtain the current tool's action-time confirmation before accepting them. Explain the specific data categories and recipients. QR selection is preparation; it does not establish that a QR code was displayed, a phone request was sent or authentication completed.

Keep short-lived authentication state current across turns. If a pending window expires, preserve the earlier observation and reopen the authorised registration flow. A newly opened flow can require a new action-time agreement confirmation even when the term labels are unchanged. On 2026-10-09 automatic approval review rejected applying the old agreement approval to the fresh flow. Stop that acceptance attempt, explain the stated reason and request confirmation for the displayed new-session terms. Do not bypass the rejection by changing the input mechanism. Verify the phone result, registration acceptance, fresh login and any council filing separately. Keep terms and screenshots in ignored private evidence. See the [phone-authentication lesson](lessons-learned.md#lessons-from-council-phone-authentication-on-2026-10-09).

When the user requests a phone-number notification instead of QR, switch to PASS in the same registration-linked flow. The observed PASS form asked for name, phone number and then a CAPTCHA. Use only an authorised existing own-profile phone value, or have the user enter it locally. Do not expose the value or request it in a public log. A fresh CAPTCHA still needs current-step confirmation before solving. Record the displayed notification-waiting page before saying a request was sent.

If the result button says to complete approval in the PASS app and displays an attempt counter, stop checking repeatedly. That message establishes incomplete phone approval, not a rejected name or phone number. Preserve the waiting page for the user's phone action. A permission to read an expected authentication SMS does not establish that this PASS method sent an SMS or authorise browsing unrelated messages.

In this PASS form, DOM filling changed the field value but the next control appeared only after supported keyboard input. A normal key event also advanced the phone field to the CAPTCHA. This is an observed input-path difference; its underlying cause is unproven. Redacted field reads cannot establish that a name or credential differs from the submitted value. Verify progression and the actual validation result. Do not replace a stored value based solely on a comparison with a redacted read.

A user report of phone approval does not prove that the council received the callback. After the user reports completion, check the current result control once and inspect the parent registration stage. If NICE reports session ended and the parent remains at identity verification, record those two observations separately from the user's phone-completion report. In the observed resume, about sixteen minutes had passed since the prior saved checkpoint; neither that interval nor generic cookie advice proves the expiry cause. Prioritise completing the live authentication round trip before lengthy documentation or integration. If a local REPL binding is absent after resuming, reacquire the known tab from the already selected browser; do not restart browser selection or assume the page closed.
