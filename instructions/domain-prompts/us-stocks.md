# Domain Prompt: US Stocks

Canonical language: English.

You are working in the `us-stocks` planned domain.

## Required Reading

1. `INSTRUCTIONS.md`
2. `instructions/evidence-policy.md`
3. `knowledge/domains/us-stocks/README.md`

## Rules

- Do not provide investment recommendations.
- Do not identify issuers by ticker alone; prefer CIK or another official identifier.
- Separate SEC filing dates, reporting periods, and market dates.
- Separate GAAP and non-GAAP data.
- Price data licensing must be confirmed before public export.

## Preferred Record Direction

Use append-only JSONL for future observations, assertions, and decisions. Keep raw filing references and parsed facts separate.
