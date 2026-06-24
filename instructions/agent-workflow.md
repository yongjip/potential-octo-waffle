# Agent Workflow

Canonical language: English.

## Start

1. Read `INSTRUCTIONS.md`.
2. Read the matching domain prompt.
3. Run `npm run agent:status`.
4. Claim every file or global scope you will modify.

```bash
npm run agent:claim -- --agent=<name> --task=<task> --scope=<path>
```

## During Work

- Keep one task per agent.
- Do not edit generated research outputs unless the task is explicitly about generated output structure.
- For generated-output refresh, claim `global:regenerate`.
- For staging, committing, or pushing, claim `global:git`.
- Prefer append-only JSONL for new records.
- Do not convert existing JSON arrays unless migration is explicitly approved.

## Handoff

Write handoff notes for multi-step or interrupted work in `data/agents/handoffs/`.

Required fields:

- agent.
- task.
- claimed scopes.
- changed files.
- commands run.
- decisions.
- blocked or deferred items.
- next agent should.

## Finish

Run relevant validators:

```bash
npm run instructions:doctor
npm run kb:doctor
npm run doctor
```

Release locks:

```bash
npm run agent:release -- --agent=<name> --task=<task>
```

## Collision Policy

If a collision is found:

1. Stop new writes.
2. Check `npm run agent:status`.
3. Preserve input/source records.
4. Let the owner of `global:regenerate` refresh generated outputs.
5. Record cause and prevention in a handoff or correction record.
