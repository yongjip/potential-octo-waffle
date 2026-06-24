#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const INPUTS = {
  ledger: "analysis/source-verification-closure-ledger.json",
  decisions: "data/review/source-verification-closure-decisions.json",
};

function normalizeMatchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[()[\]{}'"`~!@#$%^&*+=?:;,.\/\\|-]/g, "")
    .replace(/\s+/g, "");
}

function contextKey({ sprint_id, project_name, field_label }) {
  return [String(sprint_id || ""), normalizeMatchText(project_name), normalizeMatchText(field_label)].join("|");
}

function projectFieldKey({ project_name, field_label }) {
  return [normalizeMatchText(project_name), normalizeMatchText(field_label)].join("|");
}

function fieldIdSignature(value) {
  return normalizeMatchText(String(value ?? "").slice(0, 240));
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function buildLedgerIndex(ledgerRows) {
  const byContext = new Map();
  const byProjectField = new Map();
  for (const row of ledgerRows) {
    const key = contextKey(row);
    if (!byContext.has(key)) byContext.set(key, []);
    const item = {
      closure_id: row.closure_id,
      sprint_id: row.sprint_id,
      field_id_signature: fieldIdSignature(row.field_id),
      project_name: row.project_name,
      field_label: row.field_label,
    };
    byContext.get(key).push(item);

    const projectField = projectFieldKey(row);
    if (!byProjectField.has(projectField)) byProjectField.set(projectField, []);
    byProjectField.get(projectField).push(item);
  }
  return { byContext, byProjectField };
}

function chooseLedgerClosure(decision, contextCandidates) {
  if (!contextCandidates.length) return null;
  if (contextCandidates.length === 1) return contextCandidates[0];

  const decisionFieldSig = fieldIdSignature(decision.field_id);
  if (decisionFieldSig) {
    const exact = contextCandidates.filter((candidate) => candidate.field_id_signature === decisionFieldSig);
    if (exact.length === 1) return exact[0];

    const fuzzy = contextCandidates.filter(
      (candidate) =>
        candidate.field_id_signature.includes(decisionFieldSig) || decisionFieldSig.includes(candidate.field_id_signature),
    );
    if (fuzzy.length === 1) return fuzzy[0];
  }

  return null;
}

async function main() {
  const shouldWrite = process.argv.includes("--write");
  const ledgerDoc = await readJson(INPUTS.ledger);
  const decisions = await readJson(INPUTS.decisions);
  const ledgerRows = Array.isArray(ledgerDoc) ? ledgerDoc : ledgerDoc.rows || [];
  const indexes = buildLedgerIndex(ledgerRows);

  const updates = [];
  const unresolved = [];

  const nextRows = decisions.map((decision) => {
    const key = contextKey(decision);
    const exactMatch = chooseLedgerClosure(decision, indexes.byContext.get(key) || []);
    const fallbackMatch = exactMatch
      ? null
      : chooseLedgerClosure(decision, indexes.byProjectField.get(projectFieldKey(decision)) || []);
    const match = exactMatch || fallbackMatch;
    if (!match) {
      unresolved.push({
        decision_id: decision.decision_id || "",
        closure_id: decision.closure_id || "",
        sprint_id: decision.sprint_id || "",
        project_name: decision.project_name || "",
        field_label: decision.field_label || "",
      });
      return decision;
    }

    const shouldUpdateClosure = decision.closure_id !== match.closure_id;
    const shouldUpdateSprint = decision.sprint_id !== match.sprint_id;
    if (!shouldUpdateClosure && !shouldUpdateSprint) return decision;

    updates.push({
      decision_id: decision.decision_id || "",
      from: decision.closure_id || "",
      to: match.closure_id,
      sprint_from: decision.sprint_id || "",
      sprint_to: match.sprint_id || "",
      project_name: decision.project_name || "",
      field_label: decision.field_label || "",
      match_mode: exactMatch ? "context" : "project_field_fallback",
    });

    return { ...decision, closure_id: match.closure_id, sprint_id: match.sprint_id };
  });

  if (shouldWrite && updates.length) {
    await writeFile(INPUTS.decisions, `${JSON.stringify(nextRows, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        write: shouldWrite,
        ledger_rows: ledgerRows.length,
        decisions: decisions.length,
        updated_closure_ids: updates.length,
        unresolved_contexts: unresolved.length,
        sample_updates: updates.slice(0, 20),
        sample_unresolved: unresolved.slice(0, 20),
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
