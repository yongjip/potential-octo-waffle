# Lessons from complaint research tracking and login verification

Basis date: 2026-10-08 KST. Canonical language: English.

This record covers account preparation, four-portal login verification, complaint tracking, telephone follow-up, issue discovery and legislative review. Keep storage, authentication, accepted filing, official response and actual improvement as separate results. Apply each lesson in the relevant runbook so that the next task starts from the corrected procedure.

The login observations came from authenticated official portal screens. Detailed evidence is private under `data/complaints/auth/login-checks/<run>/`. The other lessons preserve the decisions and corrections in the linked workflow documents and dated handoffs. Portal observations apply to the stated date; they are not permanent UI contracts.

## Account ownership and storage

The user creates the accounts and enters their existing credentials. Preparing an env file does not authorize the agent to resume signup, enter a new password or accept signup terms. Continue with existing-account login when requested. The clarified task replaces an earlier mistaken signup plan.

Each portal has its own credential pair. `COMPLAINTS_EPEOPLE_ID` belongs to 국민신문고. 서울시 응답소 uses 서울시 통합회원. 국민참여입법센터 uses the separate `COMPLAINTS_LAWMAKING_ID` pair. Do not reuse credentials across portals by assumption.

The private env file stores literal strings. Never execute it with `source`, put values in shell arguments, or print it for debugging. Load only the selected pair through `loadPortalCredentials` in the supported local computer-use session. Redact both ID and password before outputting a filled form's diagnostic state.

Mode `600` limits file access; it does not encrypt the file. Auth directories use `700`. Real values, runtime configuration and complaint evidence stay in ignored storage. Only blank variables, code and reusable instructions belong in public commits. Git exclusion does not provide a backup or transfer the data to another Mac.

Adding a portal must preserve existing credential bytes and the execution-host setting. The controlled legacy upgrade accepts the exact earlier store; it does not repair arbitrary missing keys silently. Synthetic tests verify literal special characters and migration without using real credentials. Use a writer lock and atomic replacement for credential updates.

Sources: [account guide](accounts-and-remote.md), [account module](accounts.mjs), [account storage handoff](../../data/agents/handoffs/complaints-accounts-2026-10-08.md), [legislation account handoff](../../data/agents/handoffs/complaints-lawmaking-account-2026-10-08.md).

## Login verification and completion states

All four saved credential pairs completed a password login on 2026-10-08. Each portal had one submitted password attempt. Information disclosure and Seoul required a CAPTCHA in the observed flow. The agent completed both after the user directly instructed it to enter the current security characters. The Seoul flow returned from integrated membership to Eungdapso.

| Portal | Authenticated signal observed | Additional verification |
| --- | --- | --- |
| 국민신문고 | 나의 신문고 and 로그아웃 | Fresh login with the stored pair |
| 정보공개포털 | 마이페이지 and 로그아웃 | CAPTCHA entered in the current form |
| 서울시 응답소 | 로그아웃 and 내정보 변경 | Password login and return to Eungdapso |
| 국민참여입법센터 | 마이페이지 and 로그아웃 | Existing session ended before the stored pair was tested |

An existing signed-in session proves access at that time. It does not prove that the saved password works. For a credential-check task, use a fresh password login after checking the account and preserving unfinished work. For an ordinary case query, reuse a suitable authorized session instead of forcing another login.

The account CLI checks local storage, permissions, schema and host. Its `browser_session=not_verified` value is not a live browser diagnosis. Keep that contract unchanged and store dated browser results separately. Do not turn local storage success into login success.

Seoul membership success is an intermediate state. Verify the return to the requested Eungdapso origin and an authenticated portal signal. A visible logout or account control is sufficient once the result is clear. Do not keep exploring after the requested result is verified.

Login success does not verify historical guest-case access, an individual complaint, a filing form, legislative opinion tracking or accepted submission. The four-account store and the current three-portal complaint tracker have different support scopes. Record only the completed stage.

Source: private login evidence and [remote execution runbook](remote-runbook.md).

## Execution host and browser recovery

Check the actual shell host, configured host and computer-use host before loading credentials. A listed host does not establish that it has the intended repository, private data or browser. Use an absolute stable data path from a temporary worktree. Git worktrees do not copy private credentials or the ledger.

Keep the selected browser binding across turns. A stale tab or empty tab list does not require a new browser selection. After context compaction, refresh the tool documentation before continuing. If a local account module changed while the REPL stayed alive, refresh that module deliberately; do not reload it on every task.

During this login check, older retained tabs produced stale accessibility captures, detached-element errors and unsuitable screenshots. These were observation failures. No password had been submitted from those tabs. A fresh tab in the same selected browser restored usable observation and input. The underlying cause was not established.

Recover by inspecting current visible state, reading the tool's troubleshooting guidance when needed, and opening the observed official entry in a fresh tab of the same browser. Re-derive locators and the current CAPTCHA. Do not repeat a password action blindly or use an old screenshot.

A native app selection can expose a different window from the controlled browser tab. App names can also match several installed paths. Prefer the known browser and tab APIs. Use native controls only after matching the intended window. Leave unrelated tabs, windows and settings alone.

Use supported accessibility or DOM APIs for input. Read-only DOM evaluation may inspect visible state; it must not mutate the page or read hidden application state. Do not replace the supported UI flow with shell automation or direct login requests.

Source: private login diagnostics, [computer-use runbook](computer-use.md), [remote execution runbook](remote-runbook.md).

## Authorization and security characters

Carry forward specific user authorization when the institution, purpose, content, data and relevant upload remain the same. Do not ask the user to approve the same action again. Preparation, read-only research and reversible documentation can continue within the existing scope.

Follow the current tool policy for each concrete action. In this flow, the user's direct instruction to enter the displayed security characters covered the pending CAPTCHA steps. The agent could read, enter and verify them through supported tools. CAPTCHA does not automatically require the user to type it personally.

That instruction applied to the pending screens. It did not disable future action-time requirements or authorize signup, password changes, binding terms, new security access or unspecified filings. Do not turn a successful dated run into permanent blanket approval.

The user directed that the previously observed portal-terms passages must not become an operator-permission gate. Preserve that instruction while applying current tool requirements independently. If a concrete approval is required, identify its actual source and action after completing reviewable preparation.

Sources: [authorization procedure](computer-use.md#authorization-at-the-external-action), [account guide](accounts-and-remote.md#확인한-약관과-적용-범위), private login handoff.

## Evidence and task handoff

Capture the official page showing the reached result. Keep the original and any display crop separate. Record portal, origin, observation time, verification method, submitted-attempt count, visible signals, evidence path and SHA-256. A hash checks file integrity; it does not establish that every interpretation is correct.

Authenticated homepages can expose names, complaint titles and receipts. Keep full screenshots private. For user-facing proof, retain portal context and the authenticated signal while excluding unrelated case details and credentials. Embed the saved image in the reply when the tool requires proof of a website action.

Append a new observation when a pending login succeeds. Preserve the earlier diagnostic record, and make the current result explicit so that an old CAPTCHA handoff does not appear to remain unfinished. Do not edit `runtime.json` to invent a verified browser state.

Keep a live tab only for a requested deliverable or unfinished flow. Use a handoff mark while genuinely waiting for user action. Close obsolete waiting tabs after completion. Routine login-check tabs can close through normal cleanup. Clear local credential variables when no longer needed.

Source: private login evidence and [computer-use runbook](computer-use.md).

## Complaint records and telephone explanations

Imported conversation records are historical intake. They do not establish current portal status or complete account coverage. Match the portal receipt, institution, title and dates before updating a case. Keep portal receipts and agency receipts separate.

A telephone explanation, written answer, portal completion and resolved problem are different events. Preserve the user's transcription as a quoted source with its limits. An automatic transcription is not an official written response or an independently verified audio extraction. Keep conflicting amounts, names and dates until a primary source resolves them.

Distinguish no prior analysis, insufficient analysis, no currently held records and a calculation prepared later. Match each answer to the exact question, topic and period. A short agreement or unanswered question cannot establish an institution-wide absence of research or a person's motive.

Original-text editing is different from a supplementary-message feature. The Seoul route correction showed why a public guide cannot establish that a pending case has an append button. Inspect the actual case detail and processing stage. If no suitable addition route is verified, preserve the original and prepare a separate supplementary request referring to it.

A separately accepted follow-up has its own `case_id` and `parent_case_id`. A draft is not a submitted case. Persist `submission_unknown` immediately before a real submission. After an ambiguous result, inspect the account list before considering another attempt. Do not create duplicate filings to recover from observation failure.

Request identifiable existing records through information disclosure. Request a new calculation, survey, explanation or future policy change through the suitable petition or proposal procedure. Group overlapping questions by institution and requested result.

Keep internal check dates, portal due dates, extension notices and legal deadlines separate. Check the actual procedure and current rule before an objection or delay-related action. Telephone contact alone does not establish either an unlawful refusal or lawful completion.

An asset ceiling is not cash available for a deposit. Affordability review must include asset definition and valuation time, debt treatment, actual loan eligibility, income conditions and installment costs. Compare alternatives and distributional effects before recommending eligibility changes. Identify the blocking provision and delegated authority before choosing a legislative remedy.

Sources: [tracker guide](README.md#상태와-근거), [telephone follow-up](phone-followup.md), [follow-up plan](followup-plan.md), [route correction handoff](../../data/agents/handoffs/complaints-seoul-followup-route-2026-10-08.md), [proposal handoff](../../data/agents/handoffs/complaints-call-proposals-2026-10-08.md).

## Lessons from the case query on 2026-10-08

The signed-in Seoul member query returned no match for an existing receipt. The visible integrated-query route recovered the original and supplementary filings. One empty account surface does not establish absence or authorize resubmission. Record the route, date and matching case evidence; do not assume the difference proves a guest-account origin. Prefilled contact details and encrypted case links stay private.

The list showed 처리중 for the supplementary filing and the detail showed 결재중. The reply area contained only an approval-in-progress notice. Preserve the list and detail labels, and keep the case waiting until a final reply appears. The original had a written answer, while its additional-answer fields were empty. Separate these observations from the user's report of a later phone call. No phone-to-case mapping was explicitly displayed.

The existing supplementary body already contained the substantive questions intended for another follow-up. The corrected plan defers the overlapping petition and prepares the independent existing-records request and prospective policy proposal. A portal-completed original can remain substantively unresolved. A generic legal explanation does not answer whether integrated analysis was performed, and an omitted answer does not prove that no analysis exists.

The case links reused one popup. A fresh receipt and title in the existing tab identified the second case. Inspect the refreshed popup before looking for another tab. Save text and screenshots before optional downloads. The PDF export succeeded but took several minutes despite requested timeouts; do not make export the only path to persisting an observation. The cause of the delay remains unestablished.

A public Seoul notice for the same apartment had a different year, unit size and deposit from the complaint's cited example. Keep the exact supply round pending until date, program, area and conditions match. An official summary is a lead to the original notice, not permission to substitute a different round in calculations or filing statements.

Later browser operations timed out and reset the REPL. Browser IDs changed after that actual reset, and an earlier ID identified the app panel rather than Edge. Preserve a valid binding during ordinary tab recovery; after a real kernel reset, discover the browser again and verify its name, profile and provider before restoring tab handles. Repeated tab creation did not restore usable control. No password or new filing was submitted from those failed steps. Preserve successful evidence, record the concrete blocker, and continue independent preparation. Do not diagnose a password rejection or change portal case status from tool failure. Reassess connection and the current login challenge on resumption.

The filing runbook needs a local draft or prepared child before the submit action so that `submission_unknown` can be persisted. Receipt creation comes after observed acceptance. A plan saying to create the case only after acceptance omits the recovery state. The corrected procedure distinguishes prepared local cases from accepted filings.

Sources: private portal-query evidence; [query and preparation procedure](computer-use.md#query-procedure); [follow-up plan](followup-plan.md); [execution handoff](../../data/agents/handoffs/complaints-execution-2026-10-08.md).

## Lessons from resumed filing preparation on 2026-10-08

The user's instruction to enter the current disclosure-login CAPTCHA was applied without asking again. The first characters were rejected. A refreshed image was read from a correctly scaled crop. After an explicit ID/PW mismatch, native password input with the same saved credentials authenticated. Keep these three submitted outcomes separate. The reason DOM filling and native input differed remains unknown. Protected value observations may be redacted, so a false equality result is not evidence that the user stored the wrong password.

The authenticated disclosure account list contained the three expected housing requests and another existing request. The three filed bodies included the common electronic-file and partial-disclosure wording from the earlier draft. Verify the complete actual body before promoting its provenance. The additional request and its extension notice were added as historical intake, not counted as a new submission.

The list's default date range was one month. Its calendar inputs were read-only, and a search longer than one year produced an explicit limit notice. Record each actual date range and result. Cover a relevant longer interval with continuous ranges, and retain limits on any claim of account completeness. A loading placeholder showing zero is not a completed empty result.

A browser call could fail while its intended navigation had already occurred. Native observation confirmed the new page after an apparent click or extension-blocking failure. Inspect the reached page before repeating the action. No security setting or extension permission was changed. This does not establish that every reported failure is harmless.

The filing page had another CAPTCHA after login. The Seoul account also had a distinct pending login challenge. These require their own current-step confirmation under the tool policy. The prepared records request retained its exact body, one recipient, electronic receipt, no attachment and existing notification choices. Preparing it did not create a receipt. Keep the reviewable packet and unfinished live form while waiting; preserve the user's earlier filing purpose rather than asking a new generic permission question.

Screenshot display sizes differed from source pixel sizes. Verify saved image dimensions and page geometry before cropping. Preserve originals privately, retain separate display crops, and exclude credential and contact fields from displayed proof. A crop from thumbnail coordinates can miss the CAPTCHA. A text box's internal scroll can also hide the start of a complete entered body; compare its value with the frozen packet.

The account module imported in the computer-use adapter, but the tracker import failed because that adapter lacked `process`. Normal Node execution recorded the events successfully. Keep this as an adapter limit and use the supported CLI for local ledger changes. No executable fix was required.

The national petition list returned three historical filings in its observed three-month range. The two housing petitions and an ISA petition were archived. Their submitted and agency-received timestamps were different. The supplementary housing petition's primary receipt was recovered. All nine known historical filings now have primary evidence. The two locally prepared cases have no receipts and remain separate. This is bounded account coverage, not lifetime completeness.

The national petition page showed `상세내용 접기` even while its applicant and original-body sections were hidden. A repeated link name and a successful click were not enough to prove expansion. A fresh native control associated with the body heading exposed the full original request. It contained seven final questions; the imported summary had four. Existing question IDs were preserved, and omitted questions received their original numbers. General policy-review language was recorded as a partial answer to future-plan questions, without treating it as proof of prior analysis or a defined review project.

The ISA reply described preservation of existing government-proposal terms. It did not independently verify every requested carryover rule, the final legislative text or implementation. Keep that institutional statement, the unresolved details and the user's contribution to any change separate. The newly discovered competition disclosure request also remained waiting under an observed extension; an extension label alone does not establish unlawful delay.

A later Seoul login observation had returned to the identifier step. The authorized identifier step restored the password challenge. A background DOM wait timed out before dispatch, while selecting the matching native tab exposed the intended page. The cause of that timing difference remains unknown. Keep the unfinished page and current challenge, and do not repeat a submitted password or alter browser protections.

A broad diagnostic text filter also matched a private identifier control. Full observations belong in private evidence, and displayed diagnostics need an explicit safe field list rather than broad keyword filtering. Do not copy such values into public lessons, commits or displayed screenshots.

Sources: private resumed-run evidence; [browser recovery and filing procedure](computer-use.md); [password checks and adapter limit](remote-runbook.md); [resumed-run handoff](../../data/agents/handoffs/complaints-filing-2026-10-08.md).

## Issue discovery and legislative review

Define a concrete burden, comparison group, rule version and requested correction. Check independent evidence, counterevidence, existing safeguards and prior remediation. A complaint count is not a count of unique people or a prevalence estimate unless the source supports that unit.

A title, search snippet or attachment link is a discovery lead. Read the original text before describing a defect. Preserve failed retrieval and coverage limits. Partial list screening does not establish that all national proposals were reviewed. An access failure is not an empty result.

A bill, draft notice, planned budget or procurement plan is a proposal at a particular stage. Compare current and proposed text. Track revisions, replacement attachments, re-notices and successor bills. A closed opinion window or disposed original is not proof that the issue or successor proposal ended.

Verify the actual opinion channel and latest deadline before filing. Do not combine government, parliamentary, administrative and local procedures into one deadline rule. Keep an unknown cutoff time unknown. Extend tracker support before recording a procedure or portal outside its current contract.

Address existing protections in proposed corrections. Do not label an existing safeguard absent, annual publication unlawful or a predicted effect already observed. Distinguish a proposed numerical limit from the current rule.

Follow final text and implementation. A receipt, reply, review promise or accepted recommendation is an intermediate result. Record an implemented improvement separately from evidence that the user's submission caused it.

Sources: [discovery runbook](discovery-runbook.md), [early warning](early-warning.md), [legislative review handoff](../../data/agents/handoffs/complaints-legislative-targets-2026-10-08.md), [improvement strategy](strategy.md).

## Repository maintenance and future lessons

Preserve unrelated checkout changes. Claim file scopes and `global:git`, then use the existing complaint branch and a suitable managed worktree for public integration. Copy only intended public files. Verify the diff and private-data exclusion before committing and pushing. Archive a managed worktree when its work is complete.

Use the exact current file text as patch context. In this documentation task, a mismatched context rejected a combined patch. The new file was confirmed absent before retrying with corrected context. Reconcile the actual file state after a failed write; do not assume either completion or partial success.

Record every newly learned lesson before ending a task. Store private circumstances and diagnostics in ignored data. Put reusable conclusions in the applicable guide, and link them here. Give each new entry a date, observed trigger or earlier assumption, evidence and limits, corrected procedure, and next check if the cause remains uncertain.

When a lesson corrects an earlier statement, preserve its history through a correction record or dated handoff. Update the current instruction so that a later agent can act on the correction. Do not leave the only usable rule inside a conversation or old private handoff.

Run relevant validators after edits. Documentation changes need link and consistency checks; add runtime tests when implementation changes. Keep pre-existing warnings distinct from new errors. A document or planned date does not create a recurring monitor or promise later execution.

Sources: [agent workflow](../../instructions/agent-workflow.md), [self-correction policy](../../instructions/self-correction.md).
