# Reviewing deposit and income ceiling proposals

Use a savings scenario to compare a programme's deposit and income ceiling. Keep the user's selected policy change first. A reviewed formula is a proposal, not a current admission rule or proof of affordable entry. Store personal examples, reviewer reports and calculations in ignored complaint data.

## Define the quantities

- `D`: the full deposit, in currency units.
- `Y`: annual net household labour income, in the same currency units per year.
- `C`: the programme income ceiling converted to the same annual net household income basis.
- `T`: the number of annual saving periods assumed for the comparison.
- `s`: the assumed share of net income saved each year.

Define net income explicitly, including which taxes and compulsory insurance payments are deducted. A seven-period scenario with saving rates of 30, 40 and 50 percent gives `X = T*s` of 2.1, 2.8 and 3.5 respectively. These are proposed scenario inputs, not observed household saving rates. Constant income, no starting wealth, no transfers, no loan and no investment return are modelling assumptions. A marriage-period eligibility cutoff does not establish a household's actual work or saving history.

## Separate a programme rule from an applicant test

For the benchmark household, accumulated savings are `T*s*Y`. The income needed to save the whole deposit is `Y = D/(T*s)`.

The proposed programme design condition is `D <= T*s*C`. If the institution accepts this benchmark while retaining an income ceiling, the implied minimum ceiling is `C >= D/(T*s)`. One linkage option is `C_new = max(C_base, D/(T*s))`, which retains a higher existing ceiling. Another option is to reduce the deposit while keeping the ceiling. A deposit-linked exemption can avoid setting an extremely high new ceiling; its deposit boundary, applicable supply and legal route need explicit definition.

Do not apply `D <= T*s*Y` as a new applicant requirement. It implies `Y >= D/(T*s)` and creates an income floor. Do not require proof of seven years of savings, no past gifts or earnings origin. Labour income is the benchmark scenario; restricting admission to employees would be a separate policy choice that could exclude self-employed households.

## Interpret the saving rate and income growth

A 30-percent benchmark assumes less saving capacity and leaves more income for other expenditure than a 50-percent benchmark. It therefore produces a higher minimum income ceiling and a wider income permission range. Calling this a conservative funding assumption does not make it a conservative eligibility restriction. A 40-percent midpoint is a comparison value, not evidence of the correct saving rate. Label any recommended rate as a policy choice and show the sensitivity range.

For a backwards-looking growth scenario, define which annual periods are included. If current net income is the most recent of seven annual amounts, accumulation is `s*Y*sum((1+g)^(-k), k=0..6)`. Positive past growth lowers past income relative to current income and raises the current income required to fund the deposit. Gross salary growth is not automatically net-income growth. Keep this sensitivity outside the simple main rule unless requested.

## Check implementation and remaining constraints

Keep gross and net income ceilings separate. A gross ceiling cannot be inserted directly into this net-income formula. Require a published standard conversion by the relevant household/recruitment class, without inventing a flat tax rate. Record the calculation convention, applicable announcement and basis date.

If all of the saved deposit is included in assessed assets at the relevant date, with no debt deduction or exemption, a deposit above the asset ceiling excludes that fully self-funded scenario. This conditional result does not prove the whole eligible population is empty. Verify cash, lease-deposit, loan and instalment treatment in the matched notice. An income exception does not automatically change the asset rule or finance today's deposit.

Check ordinary rules and special supply routes together. Article 18 distinguishes income-setting rules by unit area, and Article 23(2) provides a conditional special supply route that can depart from Article 18. The existence of that route does not establish its application to the programme or authority for this specific change. Ask the institution for the actual procedure, consultation/approval basis and implementation route. Sources: [current rule, effective 2026-08-24](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=141321); [city programme summary, modified 2026-08-31](https://news.seoul.go.kr/citybuild/archives/525640).

## Review and prepare a proposal

For an authorised delegated review, give distinct reviewers arithmetic, policy design and counterargument tasks. Recompute numerical examples independently and ask for a review of the combined recommendation. Preserve differences in proposed saving rates and unresolved definitions. Do not count mathematical agreement as evidence that a policy is optimal or a legal route available.

Present the chosen rule, sensitivity examples, the prohibition on a new income floor, and the remaining asset/gross-net conditions. Keep optional growth and loan scenarios outside the core demand. Save the reviewed proposal as a candidate until a submission revision is selected. Follow [packet revision procedures](computer-use.md) and [dated lessons](lessons-learned.md#lessons-from-the-deposit-and-income-linkage-review-on-2026-10-09).
