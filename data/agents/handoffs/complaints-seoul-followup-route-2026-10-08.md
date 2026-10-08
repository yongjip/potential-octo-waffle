# Handoff: Correct Seoul complaint follow-up route

- agent: codex-complaints-route
- task: complaints-seoul-followup-route-2026-10-08
- date: 2026-10-08 KST
- claimed scopes: tools/complaints; data/complaints (primary checkout only); data/agents/handoffs/complaints-seoul-followup-route-2026-10-08.md; global:regenerate; global:git

## Changed files

- tools/complaints/phone-followup.md: distinguish original-text editing from a separate follow-up message; describe the public Seoul guidance by processing stage.
- tools/complaints/README.md: require an observed portal feature before recording a request as an activity on the same case.
- Private, ignored data/complaints: preserve prior draft/note/manifest versions, correct the unsubmitted draft destination, append a correction and a next-action event, and regenerate the board. No official case status is promoted.
- This handoff supersedes the earlier handoff's assumption that an existing pending case necessarily supports supplementary messages.

## Commands run and checks

- Read the official Seoul FAQ detail in the browser and the current public complaint-process guide.
- Official FAQ: https://eungdapso.seoul.go.kr/not/faq/faq_vie.do?faqSeq=311&searchType1=&sk=&sv=&cp=1
- Official process guide: https://eungdapso.seoul.go.kr/not/guide/process_guide.do
- instructions:doctor and kb:doctor passed before and after writing. doctor returned zero errors and the same 28 pre-existing review-gated missing-link warnings in both checkouts.
- Complaint tracker validation passed with seven cases and four events. Focused checks verified unchanged official-state fields, twelve private hashes and file modes, four retained prior versions and 38 local links. No runtime code was changed or new tests added.
- Restored the existing managed civic worktree and switched to codex/complaint-strategy-2026-10-08. Public integration contains only the two reusable documents and this handoff.

## Decisions

- The FAQ confirms original-text editing only before receipt while status is application. It rules out original-text editing after receipt.
- The process guide describes additional inquiry under aftercare following completion. This is not evidence of an append function while processing.
- The logged-in case detail and its buttons were not inspected. Processing-stage message addition remains unverified, rather than conclusively unavailable.
- Preserve the original complaint. Prepare a separate supplementary complaint citing the original case and the new telephone explanation when no append route has been verified. Do not withdraw the original just to supply a follow-up request.
- A separately accepted submission becomes a linked child case only after its real filing is recorded. An unsubmitted draft is not a new accepted complaint.
- No login, credential access, complaint submission or external message was performed.

## Deferred items

- Actual buttons, case matching, current portal status, due date and extensions remain unverified.
- The private drafts remain unsubmitted. Public documentation includes no receipt numbers, caller identifiers or transcript excerpts.

## Next agent should

1. Read the corrected private follow-up draft and preserve the original complaint.
2. Use only a follow-up control observed in the actual case detail. Otherwise use a separate supplementary filing and reference the existing case.
3. Record an observed receipt, official status and written response separately from telephone explanations.
