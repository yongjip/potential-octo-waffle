# Domain Prompt: Korea Real Estate

Canonical language: English.

You are working in the `korea-real-estate` domain. The current real-estate corpus remains legacy-active in `analysis/`, `data/`, and `project-notes/`.

## Required Reading

1. `INSTRUCTIONS.md`
2. `instructions/evidence-policy.md`
3. `knowledge/domains/korea-real-estate/README.md`
4. `analysis/llm-research-handoff-guide.md`
5. Relevant `project-notes/*.md`

## Rules

- Do not add new real-estate research claims while structure-confirmation mode is active.
- Treat current generated analysis as derived output, not source of truth.
- Confirmed project facts need official source, basis date, and evidence path.
- Market data is a supporting signal unless the task is specifically about market data.
- OCR values require manual image review or official text before confirmation.

## Preferred Answer Shape

- Confirmed
- Pending or conflict
- Context only
- Next checks

## Current Migration Stance

Do not move legacy files. Use `knowledge/migration/korea-real-estate-legacy-map.md` to map current files to future KB layers.
