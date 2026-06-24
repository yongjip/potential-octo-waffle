#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-verification-decision-context-audit.md");
const OUT_CSV = path.join(OUT_DIR, "source-verification-decision-context-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "source-verification-decision-context-audit.json");

const INPUTS = {
  closureLedger: "analysis/source-verification-closure-ledger.json",
  closureDecisions: "data/review/source-verification-closure-decisions.json",
};

function kstDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const UPDATED_AT = `${kstDate()} KST`;

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    if (fallback !== null) return fallback;
    throw new Error(`Cannot read JSON: ${file}`);
  }
}

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  return value.rows || [];
}

function validDecisionStatus(value) {
  return ["confirmed", "pending", "conflict", "deferred"].includes(value);
}

function normalizeMatchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[()[\]{}'"`~!@#$%^&*+=?:;,.\/\\|-]/g, "")
    .replace(/\s+/g, "");
}

function contextKey({ sprint_id, project_name, field_label }) {
  return [String(sprint_id || ""), normalizeMatchText(project_name), normalizeMatchText(field_label)].join("|");
}

function compact(items, limit = 6) {
  return [...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function pushMapValue(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function buildIndexes(decisions) {
  const valid = decisions
    .filter((decision) => decision.closure_id && validDecisionStatus(decision.decision_status))
    .map((decision, index) => ({ ...decision, _order: index, _context_key: contextKey(decision) }));

  const byClosure = new Map();
  const byContext = new Map();
  for (const decision of valid) {
    pushMapValue(byClosure, decision.closure_id, decision);
    pushMapValue(byContext, decision._context_key, decision);
  }
  return { byClosure, byContext, valid };
}

function suggestedRepair(row) {
  if (row.decision_context_status === "closure_id_mismatch_recovered") {
    return "closure_id를 context fallback decision 쪽으로 재정렬하거나 stale decision을 별도 archive";
  }
  if (row.decision_context_status === "closure_id_missing_recovered") {
    return "현재 장부 closure_id에 맞는 decision 재기록 또는 old closure_id -> current closure_id 매핑표 작성";
  }
  if (row.decision_context_status === "closure_id_mismatch_unresolved") {
    return "같은 closure_id decision이 현재 프로젝트/필드와 맞지 않으므로 수동 정리 전까지 장부 확정값으로 쓰지 않음";
  }
  if (row.decision_context_status === "no_decision") {
    return "아직 decision 로그가 없으므로 open 상태 유지";
  }
  return "";
}

function buildAuditRows(ledgerRows, decisions) {
  const indexes = buildIndexes(decisions);
  return ledgerRows
    .map((row) => {
      const sameClosure = indexes.byClosure.get(row.closure_id) || [];
      const sameContext = indexes.byContext.get(contextKey(row)) || [];
      return {
        closure_id: row.closure_id,
        sprint_id: row.sprint_id,
        priority: row.priority,
        rank: row.rank,
        project_name: row.project_name,
        field_label: row.field_label,
        closure_status: row.closure_status,
        decision_id: row.decision_id || "",
        decision_match_mode: row.decision_match_mode || "none",
        decision_context_status: row.decision_context_status || "unknown",
        same_closure_decision_count: sameClosure.length,
        same_closure_decision_ids: compact(sameClosure.map((decision) => decision.decision_id), 8),
        same_closure_projects: compact(sameClosure.map((decision) => decision.project_name), 4),
        same_closure_fields: compact(sameClosure.map((decision) => decision.field_label), 4),
        same_context_decision_count: sameContext.length,
        same_context_decision_ids: compact(sameContext.map((decision) => decision.decision_id), 8),
        same_context_closure_ids: compact(sameContext.map((decision) => decision.closure_id), 8),
        same_context_statuses: compact(sameContext.map((decision) => decision.decision_status), 4),
        suggested_repair: suggestedRepair(row),
      };
    })
    .filter((row) => row.decision_context_status !== "matched");
}

function buildSummary(auditRows, decisions) {
  const validDecisions = decisions.filter((decision) => decision.closure_id && validDecisionStatus(decision.decision_status));
  const duplicateClosureIds = new Map();
  for (const decision of validDecisions) {
    duplicateClosureIds.set(decision.closure_id, (duplicateClosureIds.get(decision.closure_id) || 0) + 1);
  }

  return {
    generated_at: UPDATED_AT,
    audit_row_count: auditRows.length,
    recovered_count: auditRows.filter((row) => /recovered/.test(row.decision_context_status)).length,
    unresolved_mismatch_count: auditRows.filter((row) => row.decision_context_status === "closure_id_mismatch_unresolved").length,
    no_decision_count: auditRows.filter((row) => row.decision_context_status === "no_decision").length,
    duplicate_closure_id_count: [...duplicateClosureIds.values()].filter((count) => count > 1).length,
    decision_context_status_mix: countBy(auditRows, "decision_context_status"),
    decision_match_mode_mix: countBy(auditRows, "decision_match_mode"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, auditRows) {
  const topRows = auditRows.slice().sort((a, b) => a.closure_id.localeCompare(b.closure_id)).slice(0, 120);
  return `# Source Verification Decision Context Audit

작성 기준: ${UPDATED_AT}

이 문서는 \`source-verification-closure-ledger\`에 붙은 decision이 현재 장부 문맥과 맞는지 점검한다. 핵심 목적은 closure_id 재배열이나 중복 decision 누적으로 생긴 오염을 분리하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 감사 행 | ${summary.audit_row_count} |
| context fallback 복구 | ${summary.recovered_count} |
| unresolved mismatch | ${summary.unresolved_mismatch_count} |
| no decision | ${summary.no_decision_count} |
| duplicate closure_id | ${summary.duplicate_closure_id_count} |

| 구분 | 값 |
| --- | --- |
| decision_context_status | ${summary.decision_context_status_mix || "입력 없음"} |
| decision_match_mode | ${summary.decision_match_mode_mix || "입력 없음"} |

## 우선 확인 상위 120건

${mdTable(topRows, [
    { key: "closure_id", label: "closure_id" },
    { key: "sprint_id", label: "S" },
    { key: "priority", label: "우선" },
    { key: "project_name", label: "사업" },
    { key: "field_label", label: "필드" },
    { key: "closure_status", label: "장부 상태" },
    { key: "decision_context_status", label: "문맥 상태" },
    { key: "decision_match_mode", label: "매칭 방식" },
    { key: "decision_id", label: "적용 decision" },
    { key: "same_closure_decision_ids", label: "같은 closure_id" },
    { key: "same_context_decision_ids", label: "같은 문맥" },
    { key: "suggested_repair", label: "권장 조치" },
  ])}

## 해석 원칙

- \`closure_id_mismatch_recovered\`: 같은 프로젝트/필드 문맥 decision은 찾았지만 현재 closure_id가 옛 decision과 어긋남.
- \`closure_id_mismatch_unresolved\`: 같은 closure_id decision은 있으나 현재 프로젝트/필드와 맞는 decision을 못 찾음.
- \`closure_id_missing_recovered\`: 현재 closure_id에는 decision이 없지만 같은 문맥 decision을 찾아 복구함.
- \`no_decision\`: decision 로그 자체가 아직 없음.
`;
}

async function main() {
  const [closureLedger, closureDecisions] = await Promise.all([
    readJson(INPUTS.closureLedger),
    readJson(INPUTS.closureDecisions, []),
  ]);

  const auditRows = buildAuditRows(rowsFrom(closureLedger), rowsFrom(closureDecisions));
  const summary = buildSummary(auditRows, rowsFrom(closureDecisions));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(auditRows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows: auditRows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, auditRows));

  console.log(
    JSON.stringify(
      {
        auditRows: auditRows.length,
        unresolved: summary.unresolved_mismatch_count,
        recovered: summary.recovered_count,
        output: [OUT_MD, OUT_CSV, OUT_JSON],
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
