# US-equity ETF tax proposal preparation

- agent: root
- task: complaints-etf-tax-2026-10-11
- basis date: 2026-10-11 KST
- claimed scopes: data/complaints/etf-tax; tools/complaints/README.md; tools/complaints/lessons-learned.md; this handoff
- changed files: private ETF proposal body, README and verification record; complaint entry-point pointer and reusable lesson; this handoff
- commands run: agent:status; scoped agent:claim; bounded local reads; official web research; apply_patch; local body/calculation validation; instructions:doctor; kb:doctor; doctor; agent:release
- decisions: prepare one Ministry of Economy and Finance improvement request through e-People; separate ETF market-sale gains from distributions; request consistent annual loss aggregation and basic deduction treatment; use ordinary taxable accounts and foreign-share capital-gain-taxable US ETFs as the comparison scope
- blocked or deferred items: no new external filing; no specific pending bill or legislator selected; no account-specific tax calculation or health-insurance claim; 2026 NABO tax-book PDF and one clean ministry organisation URL could not be retrieved and are excluded from the factual basis
- next agent should: read the private packet, verify the actual receiving agency in the form, freeze the body and preserve saved-body and receipt evidence if submission is authorised; compare the response with each requested decision; do not duplicate submitted housing cases

The existing September ETF analyses are context, not a substitute for the fresh source check. Current linked Income Tax Act Articles 17 and 14 displayed commencement on 2026-07-01. Rule Article 13 displayed commencement on 2026-05-22. KRX's tax page retains some dated transaction-tax text; use only the matched ETF holding-period method, corroborated by the current rule. The ordinary-account loss illustration uses two different ETFs sold on different dates within one calendar year. Do not generalise it to same-day aggregation, one fund's internal netting or ISA/pension accounts.

Validation completed: local source-record JSON parsing and the illustrative tax calculation passed. The exact prepared body and its hash remain in the private packet. `instructions:doctor` and `kb:doctor` each returned zero warnings and zero errors. `doctor` returned zero errors and 28 existing missing review-gated-data warnings, matching the previous run. The provider comparison was located at printed page 7, table 6; a provisional table number was corrected before completion. No commit, push, receipt number or statutory response deadline is implied by preparing this packet.

This preparation record is historical. The later [review and filing handoff](complaints-etf-filing-2026-10-11.md) records the corrected final packet and actual acceptance. Follow that accepted case instead of repeating preparation or filing. The [operations handoff](complaints-operations-2026-10-11.md) records subsequent publication and monitoring setup.
