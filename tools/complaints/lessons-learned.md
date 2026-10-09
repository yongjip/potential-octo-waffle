# Lessons from complaint research tracking and login verification

Basis date: 2026-10-09 KST. Canonical language: English.

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

## Lessons from Seoul login and proposal preparation on 2026-10-09

The user's current login-CAPTCHA delegation completed the pending Seoul challenge. One password submission reached the authenticated member page, then the authenticated Eungdapso origin. The first post-submit native observation still showed the password page. A subsequent current observation showed authentication. Observation, input and navigation errors before that submission were not additional login attempts. Append the completed result so that the old pending-login question does not remain the current task.

Both retained and fresh tab controls produced stale page states, detached-command failures or unsuitable screenshots. Asset bundling did not recover the challenge. A media-download call timed out, but the browser showed a related downloaded file; timeout did not prove absence of a side effect. Native tab capture exposed the actual identifier page despite stale password-page metadata. Match the current visible page before any input. The cause of these inconsistent observations remains unknown. A temporary viewport override was reset after recovery; browser security and extension permissions were not changed.

The native browser name or bundle identifier matched the installed app and updater copies. The canonical application path selected the intended Edge window. A direct native setter filled the observed identifier field after earlier typing had not left a verified value. Native password paste and a direct CAPTCHA setter then succeeded. An iCloud autofill popover obscured the challenge until it was dismissed with the supported `Escape` key. Do not substitute the unsupported `ESC` spelling, assume a changed password, or use coordinates from an unsuitable screenshot.

A failed REPL initializer did not establish a usable variable. In a later script, earlier UI actions could finish before a reference error stopped the script. Use an existing verified binding or a new declaration, then inspect the reached page after an error. Build diagnostics from an explicit safe field list; app inventories and broad text filters can include unrelated tabs, downloads or private field values. Keep those observations private and exclude them from public records.

The prospective suggestion reached Seoul's actual 시정일반 건의ㆍ질의 form. Its complete entered body matched the frozen packet, including newlines. The observed title and body limits were sufficient even though the visible character counters still showed zero after native setters. Verify the complete field value rather than using the counter alone. 본청(서울시) was an actual region option; the eventual department was not yet assigned. The suggestion's policy purpose does not prove registration through a different formal proposal procedure.

The form already populated the member's name, email and mobile number. Required collection/use and third-party provision displayed ten-year retention and specific recipient categories. Optional collection could be refused. The agent prepared the exact body, preserved private case visibility, refused optional collection and left the required consents unselected. A concrete confirmation named the data, recipient categories, purpose, retention and specific filing. The current login delegation did not supply that new consent. Preserve any pending answer; elapsed time does not authorize submission.

The earlier information-disclosure form had returned to its homepage. Its frozen packet and historical form evidence remained intact, but the live form was no longer ready. Record expiration separately from acceptance and restore the actual form before any attempt. The ledger still held nine historical filings and two prepared cases. Form preparation and session recovery created no new receipt.

Proof originals and display crops were kept separate under private evidence. The native capture bytes used a JPEG format despite a `.png` filename. The local Python interpreter lacked Pillow; the installed image utility explicitly converted the display copies to PNG. Verify format and source dimensions before cropping, inspect the produced file even when an auxiliary warning appears, and exclude contact fields and unrelated browser tabs from user-facing proof. Do not install a dependency or alter the computer merely to crop existing evidence.

Sources: private dated login/form evidence; [browser recovery and filing procedure](computer-use.md); [password checks](remote-runbook.md); [dated login handoff](../../data/agents/handoffs/complaints-login-2026-10-09.md).

## Lessons from substantive policy revision on 2026-10-09

The user replaced the earlier broad policy-comparison priority with an explicit requested change. Make that change the first request and the substantive completion criterion. Preserve funding analysis, distributional effects and implementation questions as supporting work. A request to change policy is a user decision; it is not evidence that the rule has changed or that the institution already has power to implement it.

The published national rule distinguishes income-setting authority at 85 square metres, while Seoul's programme information displays income bands at 60 square metres. These boundaries serve different purposes. Read the exact applied rule and special programme criteria instead of substituting one threshold for the other. The current rule alone does not prove that Seoul may abolish every initial-admission criterion. A historical childbirth-related renewal exception also does not remove an initial-admission restriction. Sources: [current rule, Article 18](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=141321), [Seoul programme information](https://news.seoul.go.kr/citybuild/archives/525640), [historical renewal explanation](https://mediahub.seoul.go.kr/archives/2011674).

The requested expensive-deposit boundary had no user-selected amount or verified funding criterion. The revised packet asks the institution for the amount, evidence, target supply and implementation date. Do not invent a round monetary number merely to make a request look concrete. State the desired policy change firmly and keep its unresolved implementation inputs explicit.

The earlier packet, live-form comparison and pending submission question covered the old body. Preserve those as history, freeze a new body and hash, append a revision event to the unsubmitted case, and mark the old live form for replacement. Keep original question IDs and add the new policy requests separately. Do not create a second accepted case, reuse the old body confirmation or ask a new hypothetical approval before the revised actual form is ready. No browser action or filing was performed during this local revision.

Current plan summaries had retained old login blockers inside nested progress and packet fields after a later execution update. The public strategy also described initial intake counts as current. Synchronize the current fields, preserve the earlier snapshots and label the initial table as historical. The initial eleven intake records and the later eleven ledger cases have different membership; nine verified historical filings and two prepared cases do not establish lifetime account coverage.

A broad numeric-length privacy scan flagged public legal-source URL identifiers as suspected private receipts. Check the actual known private identifiers across the entire public file, review numeric prose separately, and retain verified official-source links. A long digit sequence alone does not establish private data. The focused check passed without exposing the private values.

Sources: private dated decision/source record and revision history; [packet revision procedure](computer-use.md); [current strategy and historical intake](strategy.md); [revision handoff](../../data/agents/handoffs/complaints-income-ceiling-2026-10-09.md).

## Lessons from eligibility and transition research on 2026-10-09

A policy-review timeline can exceed a household's eligibility period. Seoul's programme information assesses the seven-year marriage condition at the recruitment announcement date. Check the matching notice and actual registration date before calculating a personal deadline. A proposed extension or transition provision is a requested change; submitting a petition does not itself preserve admission eligibility. Source: [Seoul programme information, modified 2026-08-31](https://news.seoul.go.kr/citybuild/archives/525640).

Current Housing Supply Rules Article 41 permit an income-exceeding route for newlywed private housing special supply when household-owned real estate value meets the specified limit, with selection through the remaining lottery allocation. Article 43 also contains a property-based income exception for private first-home special supply and has no seven-year marriage condition. These are purchase programmes with their own household ownership, subscription and other requirements. They support comparison and a separate eligibility check; they do not grant admission to a rental programme. Keep real estate value, total assets, net assets and available deposit funds distinct. Source: [Articles 41 and 43, effective 2026-06-15](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033568573).

Integrated public rental rules include a married household with a child aged six or under as an alternative to the seven-year category. Its separate income conditions still apply. Do not assume a child exists or transfer that category to another programme. Source: [Annex 5-2, amended 2025-10-31](https://www.law.go.kr/LSW/flDownload.do?bylClsCd=110201&flSeq=159738515&gubun=).

The follow-up question requested recommendations. Additional eligibility, transition and financing demands were saved as private candidates. The existing frozen proposal, its body hash and the eleven-case/sixteen-event ledger remained unchanged. Select the additional demands before making a substantive packet revision. Verify implementation authority, affected supply, transition base date and the exact notice on the next review. Sources: private dated research note; [proposal preparation procedure](computer-use.md); [research handoff](../../data/agents/handoffs/complaints-household-demands-2026-10-09.md).

## Lessons from correcting the funding objective on 2026-10-09

The follow-up clarified that admitting an income-exceeding household does not supply the upfront deposit. The previous recommendation gave eligibility exceptions and transition provisions priority without making affordable entry the central outcome. Correct the recommendation around deposit funding and access without family support. Keep the earlier specific income-ceiling request as one policy instrument, and test whether it is sufficient alongside the actual payment terms. The earlier candidate note remains historical; the corrected focus is stored privately.

Family-supported and self-funded household scenarios can test the concern that nominally low-income applicants with external wealth have greater access. This is a hypothesis to evaluate with the matched notice, asset/transfer rules, available financing and held administrative records. Do not assert that this describes actual admitted households, that transferred funds escape assessment, or that every household can or cannot finance a particular unit. Keep user-reported prices separate from verified recruitment deposits. Do not mechanically subtract an asset ceiling from a deposit without verifying debt recognition and asset definitions.

Use one central request for affordable, fair access and a small set of answerable questions: financing without family transfers, how applicant groups compare, and which deposit/payment or income rules will change. Keep secondary deadline issues subordinate to this outcome. No frozen packet, ledger status or filing changed during this correction. Sources: private clarification/correction record; [preparation procedure](computer-use.md); [correction handoff](../../data/agents/handoffs/complaints-family-funding-correction-2026-10-09.md).

## Lessons from the simple rule and social mix clarification on 2026-10-09

The user explicitly selected a simple deposit-linked income exception after discussing funding inequality. The preceding correction made affordable entry the main outcome but could lead to a broader redesign than the selected mechanism. Keep the income-ceiling exception as the first requested change. Funding inequality, local housing costs and mixed household backgrounds support that request. Do not introduce a lifetime no-gift condition, parental-wealth screening or proof of earnings origin as new eligibility requirements from exploratory questions. The existing frozen packet already requests the selected exception; this clarification did not change its body or create a filing.

A regional income/wealth comparison is policy reasoning unless matched distribution data establishes a rank. Do not label a hypothetical household a local lower-income class without evidence. Explain instead how nationwide income bands may fail to reflect local housing access. A city-published architect's column discusses mixing housing forms, classes and participants, but does not endorse this particular exemption or establish a new legal entitlement. Source: [the author's original column, published 2023-12-07](https://mediahub.seoul.go.kr/archives/2009729). An LH overseas-study attachment surfaced relevant wording in search, but direct retrieval failed; it was retained only as an unverified research lead.

An income exception leaves other admission criteria in place. The current city summary publishes a separate asset ceiling, so a hypothetical applicant can still be excluded despite the requested income exception. Check statutory asset valuation and the matched notice before deciding whether a separate asset change is wanted. A hypothetical asset amount is neither a selected deposit threshold nor a verified personal asset balance. Historical parental-assessment repeal was not established by this review. Source: [programme summary, modified 2026-08-31](https://news.seoul.go.kr/citybuild/archives/525640).

The private current-focus note supersedes the previous recommendation priorities while preserving their history. Keep the exact expensive-deposit threshold unresolved until its amount and evidence are selected or requested from the institution. Sources: private dated clarification; [current preparation procedure](computer-use.md); [clarification handoff](../../data/agents/handoffs/complaints-simple-rule-socialmix-2026-10-09.md).

## Lessons from the deposit and income linkage review on 2026-10-09

The user explicitly authorised three subagent reviews of arithmetic, policy design and counterarguments. All identified the difference between `D <= T*s*C`, a proposed condition on an institutional ceiling, and `D <= T*s*Y`, which becomes a minimum income condition on applicants. The combined recommendation and a second critical review preserve that distinction. A seven-period, 30-percent benchmark implies a minimum net annual ceiling of `D/2.1`; 40 and 50 percent are sensitivity cases. These rates are proposed assumptions. Constant current income over seven annual periods is not a verified savings history. Positive past income growth reduces accumulated funds relative to the constant-current-income scenario.

Thirty percent produces the highest implied ceiling within the reviewed range because it assumes less saving capacity. Label the choice as a recommendation rather than an observed average or proven optimum. Define net household income before using the formula. Do not compare a gross recruitment ceiling directly to a net-income benchmark, restrict admission to employees, or require historical savings/gift proof. Independent root calculations matched the numerical reviewer results. No new runtime implementation or applicant screening was introduced.

The fully self-funded scenario can conflict with a separate asset ceiling when the accumulated deposit is assessed as an asset without debt deduction or exemption. This conditional observation does not establish universal ineligibility. Exact valuation, payment timing and the matched notice remain checks. The current rule also contains a conditional special supply route under Article 23(2), so the Article 18 area boundary alone cannot prove that only a statutory amendment is available. Its actual application to the programme remains unverified. Sources: [Articles 18 and 23, effective 2026-08-24](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=141321); [city programme summary, modified 2026-08-31](https://news.seoul.go.kr/citybuild/archives/525640).

The reviewed draft, computations, source limits and reviewer reports were saved privately. The proposed saving rate and alternatives were not silently applied to the existing frozen submission. The packet hash and eleven-case/sixteen-event ledger remained unchanged, with no new filing. Sources: private dated review evidence; [reusable review procedure](income-linkage-review.md); [review handoff](../../data/agents/handoffs/complaints-income-linkage-review-2026-10-09.md).

## Lessons from the early-career policy framing on 2026-10-09

The user clarified that the seven-period benchmark expresses a desired path from early-career earnings to accumulated housing funds. It is not a claim that all newlyweds have actually saved for seven years. The preceding answer foregrounded that empirical caveat and did not fully express the positive access objective. Lead the revised prose with practical entry for asset-forming households, then state the assumptions and limits. Preserve the earlier calculations and evidence as historical versions.

Connect the deposit and income ceiling to the institution's stated programme purpose. Separate current income from accumulated assets. A family-transfer advantage can be a plausible institutional mechanism without proving that actual entrants predominantly receive transfers. Frame it as a question to evaluate. Keep the institutional benchmark distinct from new applicant savings, employment-history or gift-history tests.

The city's 2022 social-mix explanation emphasised mixed rental/owner-occupied housing and removing discrimination. Extending access to households at different stages of asset formation is a proposal, not an established instruction to abolish income ceilings. Use the argument as support; concrete deposit/ceiling consistency remains primary. The current city programme summary describes housing for newlyweds and a low-birth-rate objective, but does not state that its marriage cutoff legally guarantees seven years of earned savings. Sources: [2022 city social-mix explanation](https://mediahub.seoul.go.kr/archives/2004325); [city programme summary](https://news.seoul.go.kr/citybuild/archives/525640); private dated user clarification and candidate prose.

The revised rationale was saved as a private candidate. The frozen filing packet, its body hash and the eleven-case/sixteen-event ledger remain unchanged. Source: [framing handoff](../../data/agents/handoffs/complaints-early-career-framing-2026-10-09.md).

## Lessons from earned-income fairness review on 2026-10-09

The user explicitly introduced a historical earned-income minimum after previously preferring no extra tests. Treat it as an intentional alternative to review, not the accidental income floor warned about in the ceiling formula. Updated the runbook to scope the warning to silent conversion and honour later user instructions. Keep the existing selected packet intact until a revision is chosen.

Separate a fairness argument from a confirmed omission or unlawful discrimination claim. The reviewed 2026-06-22 asset rule includes deposits, securities and other holdings. Gifted or investment-derived funds retained in assessed assets can therefore affect admission; an annual earnings ceiling and an asset ceiling still affect households differently. Cryptocurrency absence from an enumerated list does not establish total screening exemption. Exact recruitment and agency interpretation remain checks. Source: [asset rule](https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000280812&chrClsCd=010201).

Historical earnings do not establish current wealth, saved funds or absence of family transfers. A cumulative savings-derived floor uses total net income over a defined period, not annual income. Review short-career and interrupted-career exclusions and treatment of self-employment. A tax-history route or priority may serve a different goal from a high minimum amount. The reviewed Article 43 version uses a five-year income-tax history and includes cases with no payable amount after exemptions/credits; it is a separate programme precedent, not a wealth-origin test or authority for Mirinae. Source: [Article 43, effective 2026-06-15](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1033568573).

Private evidence and candidate prose preserve the user clarification, calculations, verified scope and unresolved asset/supply details. No frozen body, prior review manifest, ledger case/event or filing changed. Source: [fairness handoff](../../data/agents/handoffs/complaints-earned-income-fairness-2026-10-09.md).

## Lessons from matched asset and funding checks on 2026-10-09

The user asked whether gift, inheritance, investment and cryptocurrency treatment was actually undocumented. The earlier fairness answer left the clearly documented categories too far in the background. State explicit income and asset treatment first. Limit unresolved questions to occasional trading gains, cryptocurrency holdings and their actual administrative classification. An absent list item or a search without an applicable result does not prove exclusion. Securities and bank balances are assessed assets, and interest/dividends are listed income. Received family funds retained in an assessed asset form can therefore affect admission. The exact household definition also matters for parents; do not transfer an unrelated programme's parental criteria.

Read the eighth SH-authored Mirinae notice, dated 2026-08-21, from an external archive. Preserve its provenance and downloaded hash; official SH-host retrieval remained unavailable. A city notice URL returned different content from its indexed search hit, so it was not used as a stable notice identity. Secondary two-person income figures did not match the attachment and were excluded. Match the date, area, household size, child uplift and supply type before copying figures. PDF text extraction found the relevant notice tables; a browser screenshot tool returned only text references, so no visual inspection was claimed.

The KRW 1 billion deposit example separates the full deposit, today's own funds, hypothetical borrowing, permitted deferral and historical net earnings. Thirty-percent deferral still leaves KRW 700 million payable. An assumed KRW 300 million bank loan leaves KRW 400 million of own funds, requiring about KRW 190.48 million net annual household income to save from zero over seven periods at 30 percent. The matched two-person, working-couple income ceiling for at most 60 square metres is about KRW 126.71 million on a twelve-month assessment-income basis. No bank approval or gross-to-net conversion was claimed. The basic asset limit is distinct from child-related higher limits. A conditional self-funding conflict is not universal ineligibility.

Record the explicit categories, narrow open questions and independent calculations privately. Preserve the frozen proposal, selected focus and eleven-case/sixteen-event ledger. Request a standard funding table that satisfies the same notice's deposit, income, assets and actual financing conditions together. The user request did not create a new filing or change an existing packet. Sources: [reusable notice and funding checks](income-linkage-review.md#read-the-matched-notice-before-declaring-an-omission); [dated handoff](../../data/agents/handoffs/complaints-ten-eok-funding-2026-10-09.md).

## Lessons from connecting saving and borrowing costs on 2026-10-09

The user corrected the preceding answer for treating loan principal mainly as an upfront funding component and expanding the response into more demands. Earlier notes contained interest calculations, but the user-facing argument did not connect asset formation, debt service and the income ceiling as one access problem. The correction concerns synthesis and emphasis; the prior isolated saving calculations were not mathematically invalidated.

Reconstruct the conversation's selected objective before introducing new evidence. Link the purpose of access for asset-forming households, money saved from earnings, the high deposit, borrowing costs and the income ceiling. Borrowing can reduce upfront own funds while creating continuing interest costs. Review pre-entry saving and post-entry cash flow separately; do not apply future loan interest to earlier savings or assume an entry ceiling lasts unchanged forever. Keep one requested correction and use calculations as its support. Do not substitute more information requests or invented asset-origin conditions for the selected policy argument.

The user requested a Socratic form. A short hypothetical question sequence can expose whether the combined conditions serve the institution's stated purpose. It is authored prose, not a historical quotation or actual agency admission. Phrase family-support advantage as a mechanism to examine. Do not assert universal ineligibility, the prevalence of inherited funds or exempt treatment of gifts. Preserved prior evidence, the selected focus and the frozen proposal; no filing or tracker event changed. Sources: [argument review procedure](income-linkage-review.md#review-and-prepare-a-proposal); [dated handoff](../../data/agents/handoffs/complaints-coherent-income-logic-2026-10-09.md).

## Lessons from preparing a call based sharing draft on 2026-10-09

The user requested a way to share the connected policy argument and include the supplied call. Prepare a full article, a short introduction and a source note around the selected access question. Do not expand the issue into unrelated demands or publish the whole conversation. No visible Page or concrete publishing destination was supplied. The personal draft and call evidence remain in ignored storage; only reusable procedure and this lesson enter the documentation commit.

The supplied automated transcript is not an audio-checked record. Use attributed paraphrases and preserve the exact time locations privately. Include the discussed absence or insufficiency of a simulation, the separate operation of criteria, the contemplated improvement, concerns about written wording and selective quotation, and the closing response about a written reply. Do not turn these into an official admission of universal analytical absence, permanent refusal or concealment. An earlier user report of a pending reply is a dated report, not a newly checked portal status.

Public copy retains the connected saving/interest/income-ceiling argument and dated notice sources. Exact household numbers belong in the evidence note with gross/net and financing assumptions intact. Remove identifying call and portal details from the copy; do not commit raw personal evidence. Advice and draft preparation do not select a social platform, create a share link or authorise messaging journalists or officials. Sources: [sharing procedure](sharing-evidence.md); [dated handoff](../../data/agents/handoffs/complaints-sharing-call-2026-10-09.md).

## Lessons from official campaign planning on 2026-10-09

The user requested explicit delegated review of a plan for officials and an assessment of a mayor DM. Review the core argument, official channels and account provenance separately, then review the combined plan. Lead with the selected high-deposit initial income-ceiling abolition and linked-adjustment fallback. Keep the main written reply to acceptance/reasons, feasible access if retaining the rule, and authority/owner/next step. Do not add further applicant tests or turn the request into a list of loosely related demands.

Use the prepared actual procedure as the starting point. A policy proposal can be filed through general city suggestions/questions; its label does not require switching to a voting portal. A public additional-answer guide for completed results does not establish an in-progress body-append function. Read the actual case and deadline before execution. Keep held-analysis disclosure separate from policy-change requests, and do not let the former delay the latter.

Check dated opportunities before choosing to wait. The official Seoul council audit guide, checked 2026-10-09, has a 2026-10-23 cutoff and covers policy/project improvement matters. Prepare institutional questions in parallel with the agency case. Keep any internal target separate from the official cutoff. A nonpublic identity or list does not guarantee that the content will remain private during audit use. Adoption as an audit question is not guaranteed. Source: [official audit guide](https://www.smc.seoul.kr/board/BoardList.do?boardTypeId=162&menuId=001005009).

Official homepage links establish social-account provenance, not DM availability or direct official reading. Public evidence does not establish a response probability. Recommend one short supplemental routing DM after actual filing, and reserve sending for explicit user authorisation. A planning request about DM effectiveness is not sending authorisation. The formal mayor-request path has a result viewer but does not guarantee personal mayor review. Sources: [mayor homepage](https://mayor.seoul.go.kr/index.do), [official mayor request](https://eungdapso.seoul.go.kr/req/mayor_hope/mayor_hope.do).

A receipt, phone explanation, read marker and generic review statement are separate from an itemised written policy decision. A decision is separate from a changed rule and actual recruitment notice. Preserve the supplied call's improvement context and closing response as well as the disputed analysis explanation. Do not infer future refusal, deliberate concealment or universal analysis absence from an automated transcript. A condensed official memo remains a revision candidate; freeze the existing focus, packet and ledger by hash.

The reusable [official campaign procedure](official-campaign.md) holds the implementation rules. The [campaign handoff](../../data/agents/handoffs/complaints-official-campaign-2026-10-09.md) records validation and private deliverables. Verify exported helper signatures before calling them; the tracker loader requires its data directory and returns asynchronously.

## Lessons from dated action planning on 2026-10-09

When expanding an approved strategy into dates, distinguish internal targets, official cutoffs and event-triggered actions. Give every row a completion record. Set a backup filing day before the confirmed cutoff, and prepare council evidence while an agency response is pending. Do not invent an agency response deadline to fit the calendar or escalate a case only because an internal review day arrives. Review a received reply promptly and request only the remaining items.

A dated plan does not establish execution, sending authorisation or an active reminder. Leave optional DMs conditional on an actual receipt and explicit sending direction. Preserve the reviewed plan, selected focus, frozen packet and ledger; save the calendar separately. The [official campaign procedure](official-campaign.md) is the entry point. The [dated action handoff](../../data/agents/handoffs/complaints-dated-actions-2026-10-09.md) records checks and integration.

## Lessons from resuming a prepared filing on 2026-10-09

A stale form can still display an old body and signed-in header while its session-management frame and expiry notice establish logout. Save the old form, then verify authentication through the intended result or filing path. Do not treat that stale page as a live verified submission form. A fresh login challenge invokes the current tool's action-time CAPTCHA confirmation, even when a prior challenge was delegated. Ask once for the current step, show its screenshot, and continue authorised packet preparation while awaiting the answer. Do not enter the challenge, accept elapsed time as permission or mark a filing attempt from a login navigation.

An accessibility input error can report that no input was sent and supply a new tree with changed indices. Read the fresh tree and retarget the observed field. An observed DOM identifier or semantic locator can avoid a changing native index; never guess a field or count an input-preparation failure as a rejected password. Do not emit entered credentials in diagnostic state.

Inspect data shapes before deriving receipt references or replacing a current plan component. Receipt collections can be arrays; nested packet components can hold routing metadata as well as a path. Preserve the old state, update known fields without collapsing an object, and validate references. A concise reviewed body can retire earlier supporting questions through a local revision; keep IDs and history, and distinguish consolidation from an agency answer. Remove references to an attachment that is not actually included. The [computer-use procedure](computer-use.md) is the entry point; the [submission handoff](../../data/agents/handoffs/complaints-submit-policy-2026-10-09.md) records reached states.

## Lessons from authenticated filing preparation on 2026-10-09

The user confirmed the current Seoul login security-number step. On resumption, the page had returned to the ID step. Reobserve the current page, complete that authorised login flow and read its current challenge. Fresh native password input followed by the approved security-number entry reached authenticated My Seoul, then authenticated Eungdapso, with one password submission. Keep this result separate from earlier expired forms and from filing acceptance. Do not record challenge digits or credential values in reusable documentation.

The member result list again showed no filings, while the integrated result list matched two historical filings. The matched supplementary detail still showed approval processing; the original retained its earlier final reply and empty additional-answer fields. This establishes only the displayed state at that check. Preserve primary evidence and append dated events. An empty member list does not establish that a guest filing is absent, and an empty reply field does not prove that no internal work exists.

The fresh general-petition form accepted the complete frozen title and body. Required collection/use and third-party-provision consent remained unselected; optional collection was refused. The displayed required recipients and ten-year retention were included in one concrete confirmation request after the form was prepared. Login permission alone does not confirm sensitive-data transmission to the filing's stated recipients. Keep the final registration unattempted while that required response is pending. This requirement comes from the current computer-use tool, not an inferred portal-operator permission rule.

A read-only verification assumed that a displayed upload button exposed a file-input `files` property. It did not. Earlier edits and the saved state had already completed. Inspect the observed control type and resume only the missing verification. A failed variable initializer can leave that binding undefined; use a new declared binding. A temporary verification field named `casePublic` actually read the checked No radio. Rename it to `casePublicNoSelected` and derive `publicationAllowed` explicitly before recording the result. Keep publication permission separate from applicant-information visibility. Source: [computer-use procedure](computer-use.md); [authenticated preparation handoff](../../data/agents/handoffs/complaints-submit-policy-auth-2026-10-09.md). Private evidence retains the exact observations and complete body comparison.

## Lessons from completing a Seoul registration on 2026-10-09

The user's direct reply confirmed the specific pending mandatory use/provision question. Reobserved the same live form and unchanged recipient, purpose and retention terms; selected only the two required choices. The exact frozen title and raw body matched before registration. Optional collection remained refused and case publication remained disallowed. Do not repeat a fulfilled confirmation when the action, data and terms have not materially changed.

Persisted submission_unknown immediately before one registration flow. The portal opened a native confirmation dialog. A DOM role locator timed out without dismissing it. The documented dialog accept and subsequent tab observation then timed out on focus emulation. Inspected the existing Edge application inventory, resolved duplicate installation identifiers using its observed canonical application path, and matched the native window to the exact portal confirmation and wording. One native acceptance produced the success page and new receipt. No second registration-button click was made. Browser observation worked again after acceptance; the cause of the adapter failure remains unknown. Preserve the outcome without describing the failed adapter calls as repeated filings or a proven portal defect.

Saved primary success evidence and its screenshot before recording confirmed acceptance. The matched result list and detail showed the initial application state; the answer area held a pending-processing notice. Verified every rendered body paragraph against the frozen body with whitespace normalization, separately preserving the exact raw form hash. No assigned department, agency-received timestamp or individual processing deadline was displayed. Generic processing-day guidance cannot fill those missing facts. A registered request remains separate from an itemised decision or an implemented rule change.

Update the existing prepared case through append-only events; do not create a duplicate accepted case. Preserve frozen preparation artifacts and earlier evidence, then synchronize current nested plan fields and the calendar's actual execution result. Keep an internal next-check date distinct from a portal deadline or an active automation. Commit only reusable method and handoff documents; private receipts, complete submissions and raw screenshots stay ignored. Sources: [computer-use procedure](computer-use.md); [completed execution handoff](../../data/agents/handoffs/complaints-submit-policy-complete-2026-10-09.md).

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
