#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-apply-audit.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-apply-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-apply-audit.json");

const EDGE_PACKET_INPUT = "analysis/representative-lot-fallback-edge-session-packet.json";
const FINDINGS_INPUT = "data/review/representative-lot-fallback-browser-findings.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";

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
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function byRankMulti(rows) {
  return (rows || []).reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function latestFinding(rows) {
  return [...rows].sort((left, right) => String(right.checked_at || "").localeCompare(String(left.checked_at || "")))[0] || {};
}

async function readText(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

function verifyReflection(finding, matrixRow, noteText) {
  const basisMatch = matrixRow.business_layer_source_basis === "manual_fallback_confirmation";
  const presentSnMatch = String(matrixRow.business_present_sn || "") === String(finding.present_sn || "");
  const dataReferenceDateMatch =
    String(matrixRow.business_layer_data_reference_date || "") === String(finding.urban_data_reference_date || "");
  const reviewDateMatch = String(matrixRow.business_layer_manual_review_date || "") === String(finding.checked_at || "");
  const reviewStatusMatch = String(matrixRow.business_layer_manual_review_status || "") === "confirmed_current_business";
  const notePresentSnMatch = Boolean(finding.present_sn) && noteText.includes(String(finding.present_sn || ""));
  const noteReviewDateMatch = Boolean(finding.checked_at) && noteText.includes(String(finding.checked_at || ""));
  const noteSourceBasisMatch = noteText.includes("manual_confirmed_current_business") || noteText.includes("수동 확인일");

  return {
    basisMatch,
    presentSnMatch,
    dataReferenceDateMatch,
    reviewDateMatch,
    reviewStatusMatch,
    notePresentSnMatch,
    noteReviewDateMatch,
    noteSourceBasisMatch,
    fullyReflected:
      basisMatch &&
      presentSnMatch &&
      dataReferenceDateMatch &&
      reviewDateMatch &&
      reviewStatusMatch &&
      notePresentSnMatch &&
      noteReviewDateMatch &&
      noteSourceBasisMatch,
  };
}

function auditStatus(finding, checks) {
  if (!finding.checked_at) return "unreviewed";
  if (finding.check_status !== "confirmed_current_business") return "not_applicable_hold";
  if (finding.apply_status === "applied") return checks.fullyReflected ? "applied_verified" : "applied_mismatch";
  return checks.fullyReflected ? "ready_to_mark_applied" : "pending_apply_verification_needed";
}

function nextAction(status, finding, matrixRow) {
  if (status === "unreviewed") return "Edge/UQ120 확인값을 먼저 기록";
  if (status === "not_applicable_hold") return "보류 사유 유지, direct notice 단계 기준으로 추적";
  if (status === "pending_apply_verification_needed") {
    return "node scripts/generate-project-comparison-matrix.mjs -> node scripts/generate-project-notes.mjs -> node scripts/generate-representative-lot-fallback-apply-audit.mjs";
  }
  if (status === "ready_to_mark_applied") {
    return `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=${finding.rank} --checked-at=${finding.checked_at} --write --refresh`;
  }
  if (status === "applied_mismatch") {
    return `finding intake 또는 matrix/project-note 불일치 수정 후 node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=${finding.rank} --checked-at=${finding.checked_at}`;
  }
  if (status === "applied_verified") {
    return matrixRow.project_note || "적용 완료";
  }
  return "";
}

async function buildRows(packetRows, findingRows, matrixRows) {
  const findingsByRank = byRankMulti(findingRows);
  const matrixByRank = byRank(matrixRows);

  return Promise.all(
    (packetRows || []).map(async (packetRow) => {
      const rank = String(packetRow.target || "").match(/^(\d+)\./)?.[1] || "";
      const finding = latestFinding(findingsByRank[rank] || []);
      const matrixRow = matrixByRank.get(rank) || {};
      const notePath = String(matrixRow.project_note || "");
      const noteText = notePath ? await readText(notePath) : "";
      const checks = verifyReflection(finding, matrixRow, noteText);
      const status = auditStatus(finding, checks);

      return {
        rank,
        project_name: String(packetRow.target || "").replace(/^\d+\.\s*/, ""),
        checked_at: finding.checked_at || "",
        check_status: finding.check_status || "",
        apply_status: finding.apply_status || "",
        audit_status: status,
        present_sn: finding.present_sn || "",
        urban_data_reference_date: finding.urban_data_reference_date || "",
        matrix_source_basis: matrixRow.business_layer_source_basis || "",
        matrix_present_sn: matrixRow.business_present_sn || "",
        matrix_data_reference_date: matrixRow.business_layer_data_reference_date || "",
        matrix_manual_review_date: matrixRow.business_layer_manual_review_date || "",
        note_path: notePath,
        note_present_sn_match: checks.notePresentSnMatch ? "Y" : "N",
        note_review_date_match: checks.noteReviewDateMatch ? "Y" : "N",
        basis_match: checks.basisMatch ? "Y" : "N",
        present_sn_match: checks.presentSnMatch ? "Y" : "N",
        data_reference_date_match: checks.dataReferenceDateMatch ? "Y" : "N",
        review_date_match: checks.reviewDateMatch ? "Y" : "N",
        next_action: nextAction(status, finding, matrixRow),
      };
    }),
  );
}

function summarize(rows) {
  return {
    generated_at: `${kstDate()} KST`,
    project_count: rows.length,
    reviewable_count: rows.filter((row) => row.check_status === "confirmed_current_business").length,
    unreviewed_count: rows.filter((row) => row.audit_status === "unreviewed").length,
    ready_to_mark_applied_count: rows.filter((row) => row.audit_status === "ready_to_mark_applied").length,
    pending_apply_verification_needed_count: rows.filter((row) => row.audit_status === "pending_apply_verification_needed").length,
    applied_verified_count: rows.filter((row) => row.audit_status === "applied_verified").length,
    applied_mismatch_count: rows.filter((row) => row.audit_status === "applied_mismatch").length,
    hold_count: rows.filter((row) => row.audit_status === "not_applicable_hold").length,
    inputs: [EDGE_PACKET_INPUT, FINDINGS_INPUT, MATRIX_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const readyRows = rows.filter((row) => row.audit_status === "ready_to_mark_applied");
  const blockedRows = rows.filter((row) => ["pending_apply_verification_needed", "applied_mismatch"].includes(row.audit_status));
  return `# Representative Lot Fallback Apply Audit

작성 기준: ${summary.generated_at}

이 문서는 fallback 확인값이 비교 매트릭스와 사업 메모에 실제 반영됐는지 점검하고, \`pending_apply -> applied\` 승격 가능 상태를 가르는 보드다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| confirmed_current_business | ${summary.reviewable_count} |
| 미확인 | ${summary.unreviewed_count} |
| applied 승격 가능 | ${summary.ready_to_mark_applied_count} |
| 반영 재검증 필요 | ${summary.pending_apply_verification_needed_count} |
| applied 검증 완료 | ${summary.applied_verified_count} |
| applied 불일치 | ${summary.applied_mismatch_count} |
| 보류/비대상 | ${summary.hold_count} |

## 현재 상태

${mdTable(rows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "audit_status", label: "감사 상태" },
    { key: "checked_at", label: "확인일" },
    { key: "apply_status", label: "apply" },
    { key: "present_sn", label: "presentSn" },
    { key: "matrix_present_sn", label: "matrix presentSn" },
    { key: "next_action", label: "다음 액션" },
  ])}

## applied 승격 가능

${mdTable(readyRows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "checked_at", label: "확인일" },
    { key: "present_sn", label: "presentSn" },
    { key: "urban_data_reference_date", label: "기준일" },
    { key: "next_action", label: "승격 명령" },
  ])}

## 반영 재검증 필요

${mdTable(blockedRows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "audit_status", label: "감사 상태" },
    { key: "basis_match", label: "basis" },
    { key: "present_sn_match", label: "presentSn" },
    { key: "data_reference_date_match", label: "기준일" },
    { key: "review_date_match", label: "확인일" },
    { key: "note_present_sn_match", label: "note presentSn" },
    { key: "note_review_date_match", label: "note 확인일" },
  ])}
`;
}

async function main() {
  const [packet, findings, matrixRows] = await Promise.all([
    readJson(EDGE_PACKET_INPUT, { rows: [] }),
    readJson(FINDINGS_INPUT, []),
    readJson(MATRIX_INPUT, []),
  ]);
  const rows = await buildRows(packet.rows || [], findings, matrixRows);
  const summary = summarize(rows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: summary.generated_at, summary, rows }, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        project_count: summary.project_count,
        ready_to_mark_applied_count: summary.ready_to_mark_applied_count,
        applied_verified_count: summary.applied_verified_count,
        output: "analysis/representative-lot-fallback-apply-audit.{md,csv,json}",
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
