# Evidence Policy

Canonical language: English.

This policy defines how agents convert source material into knowledge-base records.

## Layers

| Layer | Meaning | Example | Can support confirmed factual claims |
| --- | --- | --- | --- |
| source | Origin and access metadata | official URL, filing accession, API endpoint | no, by itself |
| observation | What was seen at a specific time | page had 1 result on 2026-06-24 | no, unless elevated |
| assertion | Sourced factual claim | notice number, project stage, revenue value | yes, if evidence gate passes |
| analysis | Interpretation or calculation | risk score, market reaction summary | no |
| decision | Personal stance or action | watch, defer, review next week | no |

## Assertion Gate

An assertion may be `confirmed` only when all are present:

- official original source or official reply.
- basis date or period.
- source ID.
- source path, URL, attachment, or local evidence path.
- field and value.

If any required element is missing, use `pending`, `deferred`, or `context_only`.

## Common Status Rules

- `confirmed`: official source gate passed.
- `pending`: plausible but missing one or more gate elements.
- `conflict`: two or more credible sources disagree.
- `deferred`: not applicable until a later stage, filing, or reporting period.
- `context_only`: useful context but not direct evidence for the factual field.
- `rejected`: reviewed and excluded.

## Conflict Handling

Do not merge conflicting values. Preserve separate assertions by basis:

- notice basis.
- project overview basis.
- management/disposition basis.
- fiscal period basis.
- filing basis.

## Finance-Specific Rules

- Price data needs provider, timestamp/date, currency, adjustment flag where applicable.
- Financial statement data needs period end, filing type, consolidated/separate basis where applicable, currency, and unit.
- No investment recommendation can be encoded as an assertion.

## Real-Estate-Specific Rules

- Market transactions are context or derived data unless tied to a specific sourced factual claim.
- Project stages require official notice/reply or a domain-approved official status surface.
- OCR values are not confirmed unless a manual image review log or official text confirms them.
