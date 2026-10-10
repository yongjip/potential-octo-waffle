---
name: context-yongjip-kim-policy-evaluation
description: "Use when preparing public-policy proposals or evaluating policy benefits for Yongjip Kim."
---

# Policy benefit evaluation

Apply these working conventions to Yongjip Kim's policy proposals and evaluations in this repository. Read this file through the complaint strategy or discovery runbook. It is the editable project context; it does not require a separately installed plugin.

More-specific applicable context takes precedence for working conventions; levels to the left take priority.

**Individual (this skill)** > Team > Business unit > Company > Default

## Working conventions

- Show a recipient's annual monetary benefit when a defensible calculation is possible. Use KRW per household per year. State the comparison year and period of eligibility.
- Show the additional gross wage needed to obtain an equivalent benefit when tax treatment and the comparison assumptions permit it. Compare a cost-saving benefit with take-home wages before making a gross-wage comparison.
- Also show the initial own funds, ongoing payments and other access conditions. If financing is unverified, show the entry payment required rather than calling it minimum own cash. A valuable benefit can still be inaccessible to the intended household.
- Compare the same household, service quality, location and period where possible. Keep differences visible when they cannot be held constant.
- Distinguish recipient benefit, government fiscal cost and wider social outcomes. These are separate quantities.
- Label observed values, calculated estimates and illustrative assumptions. Use ranges when the result depends materially on a rate or uncertain input.
- Do not assume that all policy support is tax-free or that a noncash benefit is as flexible as cash. Verify the relevant tax treatment. Value a service against the expenditure it actually replaces or clearly label an imputed comparison.
- Preserve safety, rights, accessibility and other outcomes that cannot be reliably priced. Do not force every policy into a single monetary score.

## Monetary comparison methods

These formulas specify comparison methods. They do not establish a programme's current rates, recipients or actual benefits.

| Comparison | Calculation and scope | Required conditions |
| --- | --- | --- |
| Annual cash benefit | Payments received during the year, less tax on those payments and incremental compulsory participation costs | Match eligibility, payment dates and tax treatment. Loan principal and refundable deposits are not gifted income. |
| Annual expense reduction | Comparable annual expenditure without support minus expenditure with support, including incremental compulsory costs | Use the same service and household. Distinguish observed savings from a hypothetical alternative. |
| Rental-deposit price advantage | `(B - D) × r` for one full year | `B`: matched private-market deposit. `D`: public deposit. `r`: explicitly chosen annual cost-of-funds comparison rate. A lower refundable deposit saves funding or opportunity cost; its full difference is not an annual payment. |
| Additional deferral advantage | `d × (r - i)` for one full year | `d`: deferred part of `D`. `i`: annual deferral rate. Use the same `r` as the deposit comparison. Do not add the full deferred principal as a yearly benefit. |
| Combined deposit advantage | `(B - D) × r + d × (r - i)` | Equivalent to `B × r - (D - d) × r - d × i`. Subtract any verified additional annual costs once. Do not count the deposit discount or deferral twice. |
| Additional gross-wage equivalent | `A ÷ (1 - m)` under a constant marginal deduction assumption | `A`: annual benefit already expressed as an after-tax equivalent. `m`: the share deducted from additional wages. Use marginal deductions, not the household's average tax rate. With changing brackets, deductions or insurance caps, solve using the household tax model. |
| Effect of crossing an income threshold | Change in take-home wages plus change in annual net policy benefit | Evaluate matched households just below and above the threshold. Annual benefit already includes incremental participation costs; do not subtract those again. |

For partial-year use, annualise only when the duration and continuing conditions support it. Do not multiply a conditional annual estimate by a maximum residence period as if receipt were guaranteed. Evaluate later rates and conditions separately. Use a stated discount rate if comparing present values over several years.

The wage-equivalent calculation describes additional wages needed to match a benefit. It is not the recipient's observed annual salary, an eligibility-income value or a recommendation for a new income test.

Before treating a funding-cost estimate as an after-tax benefit, adjust for relevant tax on alternative returns or deductions on borrowing costs where applicable. A nominal comparison rate alone does not establish a household's net saving.

## Output order

1. State the policy purpose and the household used for comparison.
2. Present annual recipient benefit, with the principal components.
3. Present the additional gross-wage equivalent, or explain why it remains unverified.
4. Present entry funds and ongoing affordability.
5. Compare recipients, public costs and measured outcomes against the policy purpose.
6. Identify the proposed change, evidence needed and next decision.

Use a compact table: `policy or amount band | annual recipient benefit | additional gross-wage equivalent | initial funds | ongoing payments | evidence and assumptions`. Omit an inapplicable column rather than inventing a number. Keep observed distributions separate from a synthetic household comparison.

## Illustrative check

If a policy actually saves a household KRW 10,000,000 a year and creates no additional tax, a hypothetical 30% deduction from additional wages gives `10,000,000 ÷ 0.70 = 14,285,714` KRW of additional gross wages. The 30% is a comparison assumption, not a verified rate for the user or all households.

For a deposit illustration, suppose `B = 625,000,000`, `D = 500,000,000`, `d = 150,000,000`, `r = 4%` and `i = 2.73%`. The annual price advantage is KRW 5,000,000. The additional deferral advantage is KRW 1,905,000. The combined advantage is KRW 6,905,000. Market value and the 4% rate are illustrative inputs, not a unit valuation or an approved bank loan.

## Source use

Verify each programme's current notice, payment conditions, rate year, household criteria and matched market comparator before publishing an actual estimate. Preserve unknown values as unknown. A public maximum, average or summary ratio does not establish the exact unit's value.

The [Seoul supply explanation](https://www.seoul.go.kr/news/news_report.do?nttNo=464286), dated 2026-08-20 and checked 2026-10-10, describes deposits at 80% or less of market, 30% deferral and a 2.73% rate. It supports those dated programme conditions, not an exact market comparator for every unit. Recheck future entry-year rates.

[Income Tax Act Article 12](https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031619511), checked 2026-10-10, gives conditions for specified tax-exempt income. That linked passage concerns childbirth and childcare pay. It does not verify this rental benefit's tax treatment or establish that all policy benefits are exempt. Seek the applicable provision or institutional explanation for a tax-sensitive claim.

Use the [campaign comparison procedure](../official-campaign.md#compare-support-and-access-across-deposit-amounts) for recipient, financing and fiscal-cost distinctions. Preserve existing source-audit limits and accepted-case records. Applying this evaluation method does not revise a frozen submission or authorise an external filing.
