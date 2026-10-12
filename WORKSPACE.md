# Workspace map

Use this map to select a small context for a task. [INSTRUCTIONS.md](INSTRUCTIONS.md) defines the evidence and editing rules. The main [README](README.md) retains the detailed research catalog; it is not a current task queue.

## Select the task

| User request | Start here | State and evidence |
| --- | --- | --- |
| Complaint status, reply review or submission | [Complaint workflow](tools/complaints/workflow.md) | `npm run complaints:status`; private `data/complaints/current.json` and ledger |
| Policy argument or new complaint candidate | [Policy writing context](tools/complaints/context-yongjip-kim-policy-evaluation/SKILL.md), then [campaign](tools/complaints/official-campaign.md) or [discovery](tools/complaints/discovery-runbook.md) | Private candidate or accepted packet named by the current pointer |
| SH notice, eligibility or financing comparison | Complaint workflow's source-verification route | Private census source manifest, original PDFs and dated verification record |
| Real-estate project research | [Domain prompt](instructions/domain-prompts/korea-real-estate.md), then [research guide](analysis/llm-research-handoff-guide.md) | Relevant `project-notes/` record and source intake |
| Korea or US stocks | Matching prompt in `instructions/domain-prompts/` and domain README in `knowledge/domains/` | Matching source/assertion records; keep personal decisions private |
| Home layout | Local `tools/home-layout/README.md`, when that component is present | Its input/measurement records and scene; do not run research regeneration |
| Repository structure or validation | [Agent workflow](instructions/agent-workflow.md), `PROJECT_MANAGEMENT.md` | Existing validators and affected schemas |

Some local components and private records are intentionally absent from a public branch or fresh clone. A missing file does not mean that there are no cases, replies or prior work. Report the missing local dependency before recreating data.

## File roles

| Location | Role | Update rule |
| --- | --- | --- |
| `AGENTS.md`, `INSTRUCTIONS.md`, `instructions/` | Agent entry point and shared rules | Keep short entry points; link task-specific procedures |
| `tools/<component>/` | Reusable code, runbooks, examples and tests | Update the applicable runbook; keep examples anonymous |
| `knowledge/` | Schemas, domain definitions and migration maps | Preserve source/observation/assertion/analysis/decision separation |
| `data/complaints/` | Private ledger, accepted operations, source files and working reports | Append observations; preserve accepted bodies and attachments |
| `data/agents/handoffs/` | Dated task history | Read the relevant current pointer; do not scan all handoffs |
| `analysis/` | Derived research and local decision documents | Read inputs before changing results; use the relevant generator |
| `project-notes/` | Legacy project records | Keep paths stable unless a concrete migration is requested |
| `scripts/` | Shared collection, validation and regeneration | Run only the script that belongs to the task |
| `tmp/`, `.agent-tmp/` | Reproducible temporary output | Never use as the only copy of accepted evidence |

## Current versus historical

For complaint work, use this order:

1. Replay `cases.jsonl` and `events.jsonl` through the tracker.
2. Read the current private pointer and accepted execution manifest.
3. Check saved-body and received-attachment evidence for delivery questions.
4. Read the current working analysis for a revision task.
5. Consult an older handoff or preparation manifest only for the relevant history.

Acceptance, substantive reply and policy implementation are separate outcomes. A survey answer request stays attached to its original case. An optional candidate is not a missed authorized filing.

## Common commands

```bash
npm run agent:status
npm run complaints:status
node tools/complaints/monitor.mjs plan
node tools/complaints/tracker.mjs check
npm run complaints:test
npm run instructions:doctor
npm run kb:doctor
npm run doctor
```

The status commands read local records. They do not sign in, query a portal or send a complaint. The existing weekly agent performs actual portal checks using `status-monitoring.md`.

## Publishing from a mixed checkout

Check the actual branch, remote head and unrelated changes before creating a commit. Complaint work may be published on `codex/complaint-strategy-2026-10-08` while the user's local checkout remains on `main`. Do not switch or reset that checkout merely to publish selected files.

Use an explicit reviewed file list and a commit based on the intended remote branch. Validate the resulting commit tree as well as local files. Exclude private records and new personal handoffs. A successful local commit is not a successful push; verify the remote commit after publication. Preserve unrelated local changes.
