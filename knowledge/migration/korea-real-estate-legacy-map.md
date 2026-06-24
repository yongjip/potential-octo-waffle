# Korea Real Estate Legacy Migration Map

작성 기준: 2026-06-24 KST

This map defines how the current real-estate corpus will map into the future knowledge-base layers. It is a planning and validation artifact only. Do not move files during structure-confirmation mode.

## Current Corpus Boundary

The current real-estate corpus remains legacy-active:

- `analysis/`
- `data/`
- `project-notes/`

These files remain readable inputs and generated outputs until a later migration is approved.

## Target Layer Mapping

| Current location | Future KB layer | Notes |
| --- | --- | --- |
| `data/urban/` | sources, raw, observations | official notice files, extracted text, OCR previews, district notice probes |
| `data/cleanup/` | sources, raw, observations | Cleanup system snapshots, public item files, project status captures |
| `data/market/` | sources, raw, normalized, observations | official market CSV/API-derived data and normalized transaction/indicator data |
| `data/review/*intake*.json` | observations | manual inboxes and review intake records; future direction is append-only JSONL |
| `project-notes/*.md` | entities, analysis | project/entity summaries and human-facing notes; factual claims must be backed by assertions |
| `analysis/core-value-confirmation-ledger.*` | assertion candidates | field-level status and source confirmation candidates |
| `analysis/residual-gap-interpretation-audit.*` | assertion policy and deferred-state rationale | do not turn gaps into facts |
| `analysis/project-comparison-matrix.*` | derived analysis | generated comparison surface, not primary source |
| `analysis/long-term-potential-scorecard.*` | analysis and decisions | personal interpretation; private by default |
| `analysis/focus-area-decision-memo.*` | decisions | personal stance and next checks; private by default |
| `analysis/market-transaction-signal-summary.*` | derived analysis | market signal summary; not project-stage evidence |

## Migration Rules

- Do not move or delete current corpus files in this phase.
- Create new append-only records only after schema validation is in place.
- Every migrated factual field must point to a source or observation.
- Existing generated outputs may guide migration but cannot be the sole evidence for `confirmed` assertions.
- Keep private decisions separate from public-data candidates.

## First Smoke Migration Candidate

Use only 3-5 assertions from one well-documented project to test the schema.

Suggested candidate class:

- official source metadata.
- project entity identity.
- one confirmed assertion.
- one pending assertion.
- one context-only assertion.

Do not migrate the full project set until this smoke path is reviewed.
