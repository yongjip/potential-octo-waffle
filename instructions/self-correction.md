# Self-Correction Policy

Canonical language: English.

Use this when an agent or LLM detects a wrong claim, ambiguous evidence, stale date, OCR issue, domain mismatch, or generated-output inconsistency.

## Correction Routine

1. Freeze the claim.
2. Identify the source file and claim text.
3. Classify the evidence layer: source, observation, assertion, analysis, or decision.
4. Identify the broken gate.
5. Downgrade status if needed.
6. Write or propose a correction record.
7. Validate with the relevant doctor command.

## Broken Gates

| Gate | Failure example | Required action |
| --- | --- | --- |
| source gate | URL exists but no official original or attachment | use `pending` |
| date gate | value has no basis date or period | use `pending` |
| conflict gate | two official values disagree | use `conflict` and keep both |
| OCR gate | OCR text not manually reviewed | use `pending` or `context_only` |
| visibility gate | license or privacy unclear | use `restricted` or `unknown_license` |
| layer gate | analysis used as factual source | move to analysis and remove factual assertion |

## Correction Record

Use append-only records for future correction logs.

Minimum fields:

- `id`
- `domain_id`
- `record_type`: `correction_record`
- `status`
- `bad_claim`
- `broken_gate`
- `corrected_status`
- `source_path`
- `agent`
- `created_at`

## Answering After Correction

When answering the user, state:

- what changed.
- why it changed.
- current status.
- what evidence is still missing.

Do not hide uncertainty.

## Operational lessons

Document every lesson learned during a task, including user clarifications, corrected assumptions, failed approaches, successful recovery, verification limits and improvements to execution. Write the record before the task ends. Do not leave a reusable correction only in conversation history.

Each new lesson must identify:

- the date and task context.
- the observed trigger or earlier assumption.
- the evidence and its scope.
- the corrected procedure or prevention rule.
- remaining uncertainty and the next check, when needed.

Put reusable operational instructions in the relevant runbook and link the record from its entry point. Complaint work uses [the complaint lessons record](../tools/complaints/lessons-learned.md). Keep operational instructions in English. Preserve personal context, credentials, receipts, raw screenshots and diagnostic details in ignored private storage.

Preserve earlier evidence when a correction changes a result. Use an append-only correction record or a dated handoff, and update the current instruction so that the next agent uses the correction. Merge equivalent reusable rules without discarding distinct observations or unresolved limits.

Separate observed recovery from a proven root cause. A fresh tab restoring browser observation does not prove why an older tab failed. A user instruction for a specific pending action does not become permanent blanket authorization or override the current tool policy.

Run relevant validators after updating the instructions. Record the checks and remaining limits in the handoff.
