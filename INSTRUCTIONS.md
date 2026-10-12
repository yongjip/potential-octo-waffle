# Agent Instructions

Canonical language: English.

Human-facing research notes may remain Korean, but operational instructions for agents must be written in English. Every agent must read this file before domain-specific instructions.

## Current Operating Mode

Use task-scoped research and maintenance. A user-requested research task can proceed after the instruction and KB checks pass. Read `WORKSPACE.md` to select its workflow and current records. This mode does not imply that legacy migration or factual source verification is complete.

Within the authorized task:

- Add or refine instructions, schemas, validators, migration maps, and samples.
- Read relevant corpus files and official sources.
- Add sourced intake, verification and working analysis for the requested question.
- Run non-destructive validation commands.

Preserve these boundaries:

- Do not broadly move or delete `analysis/`, `data/`, or `project-notes/` to tidy the workspace. Use task routing and indexes first; a concrete migration needs a preservation and reference-update plan.
- Do not convert existing JSON arrays to JSONL without explicit user authorization for that migration.
- Do not edit generated research outputs as if they were primary sources.
- Keep new factual claims within the requested scope and apply the source/date/visibility gates below.

## Required Reading Order

1. `INSTRUCTIONS.md`
2. `instructions/evidence-policy.md`
3. `instructions/agent-workflow.md`
4. `instructions/self-correction.md`
5. Domain prompt in `instructions/domain-prompts/`
6. Domain README in `knowledge/domains/<domain>/README.md`

## Evidence Hierarchy

Use this hierarchy for factual claims:

1. Official original source: notices, filings, attachments, official APIs, official CSVs, official replies.
2. Official summary surface: project overview pages, map layers, official search results.
3. Local extraction: PDF/HWP/HWPX text, OCR text, manual image review logs.
4. Normalized or derived data: tables generated from official sources.
5. Analysis and hypothesis: scores, interpretations, scenario notes, personal decisions.

Only level 1 can directly support a `confirmed` factual assertion unless a domain rule explicitly allows a narrow exception.

## Data Layer Separation

Never mix these layers in one field:

- `source`: where data came from.
- `observation`: what was observed at a time.
- `assertion`: a sourced factual claim.
- `analysis`: interpretation or calculation.
- `decision`: personal action, watch, hold, or investment note.

## Status Values

Allowed factual statuses:

- `confirmed`
- `pending`
- `conflict`
- `deferred`
- `context_only`
- `rejected`

Allowed visibility values:

- `public_candidate`
- `private`
- `restricted`
- `unknown_license`

## Generated Files

Generated outputs are not primary sources. In this repository, many `analysis/*.md`, `analysis/*.csv`, and `analysis/*.json` files are generated or derived.

Rules:

- Prefer changing source, intake, observation, or assertion records.
- Run validators after changing structure or data.
- Run regeneration only after claiming `global:regenerate`.
- Do not hand-edit generated outputs to force a conclusion.

## Multi-Agent Workflow

Before editing, claim a scope:

```bash
npm run agent:claim -- --agent=<name> --task=<task> --scope=<path-or-scope>
```

Use these global scopes when needed:

- `global:regenerate`
- `global:git`

Release scopes when done:

```bash
npm run agent:release -- --agent=<name> --task=<task>
```

## Open Data Boundary

Private by default. Public export candidates must be separated from personal notes and must pass `knowledge/open-data-governance.md`.

Never put these into public candidate records:

- personal portfolio, allocation, buy/sell, or weighting notes.
- account IDs, API keys, private contact details.
- information-disclosure replies whose redistribution rights are unclear.
- fieldwork details that expose private movement or identifying information.
- unverified LLM claims.

## Output Expectations

For research answers, separate:

- Confirmed
- Pending or conflicting
- Context only
- Next checks

For structure work, report:

- Files changed
- Validation commands run
- Remaining migration or schema caveats
