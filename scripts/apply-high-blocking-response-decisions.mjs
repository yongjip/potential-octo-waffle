#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const DRAFT_INPUT = "analysis/high-blocking-response-decision-drafts.json";
const DECISIONS_INPUT = "data/review/source-verification-closure-decisions.json";

function parseArgs(argv) {
  return {
    write: argv.includes("--write"),
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function decisionKey(row) {
  return [
    row.closure_id || "",
    row.project_name || "",
    row.field_id || "",
    row.decision_basis || "",
    row.resolved_value || "",
  ].join("|");
}

function existingKeys(decisions) {
  return new Set(decisions.map(decisionKey));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const draftPayload = await readJson(DRAFT_INPUT);
  const existing = await readJson(DECISIONS_INPUT);
  const keys = existingKeys(existing);
  const readyDrafts = draftPayload.drafts || [];
  const appendable = readyDrafts.filter((draft) => !keys.has(decisionKey(draft)));
  const duplicates = readyDrafts.filter((draft) => keys.has(decisionKey(draft)));

  if (args.write && appendable.length) {
    await writeFile(DECISIONS_INPUT, `${JSON.stringify([...existing, ...appendable], null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        readyDrafts: readyDrafts.length,
        appendable: appendable.length,
        duplicates: duplicates.length,
        decisionsBefore: existing.length,
        decisionsAfter: args.write ? existing.length + appendable.length : existing.length,
        wrote: args.write && appendable.length > 0,
        draftInput: DRAFT_INPUT,
        decisionsInput: DECISIONS_INPUT,
        nextCommand:
          args.write && appendable.length
            ? "node scripts/regenerate-research-artifacts.mjs"
            : "입력 회신을 data/review/high-blocking-source-response-intake.json에 보강한 뒤 node scripts/generate-high-blocking-response-decision-drafts.mjs 실행",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
