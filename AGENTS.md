# Working in this repository

Read [INSTRUCTIONS.md](INSTRUCTIONS.md) first, then use [WORKSPACE.md](WORKSPACE.md) to select the task entry point. Read the required evidence policy and the matching workflow. Do not load the entire README, analysis directory or handoff history into context.

## Communication

- Use the user's language. Lead with the result and use short, concrete sentences.
- Distinguish confirmed facts, assumptions and recommendations.
- Preserve necessary quantities, conditions, identifiers and quoted text.
- Continue the work authorized by the user. Do not repeat approval questions already answered for the same action. Current tool-specific confirmation requirements still apply.

## Find the current state

- Complaint work: read `tools/complaints/workflow.md`, run `npm run complaints:status`, then read the relevant private pointers in `data/complaints/current.json`.
- Research, home-layout and other tasks: use the routing table in `WORKSPACE.md` and read only the relevant files.
- Dated handoffs are history. A newer preparation file does not supersede accepted filing evidence. Do not pick the current document by filename, modification time or version number alone.
- State derived from local records is a retained observation, not a fresh portal query. Keep its verification date.

## Change and finish

Claim changed paths before editing. Claim `global:regenerate` for generated-output refresh and `global:git` for Git mutations. Preserve unrelated working-tree changes and immutable source/submission evidence. Add an index or current pointer before moving a large collection.

Keep credentials, receipts, actual filing bodies, replies, PDFs and screenshots in ignored private storage. Publish reusable code and reviewed instructions with explicit path selection. Do not use `git add .` to publish this mixed workspace.

Run checks appropriate to the changed components. Run the instruction, KB and project doctors before completion. Document lessons in the matching workflow and update the current private pointer when the active document changes. Release task scopes.
