#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT_LEDGER = "analysis/source-verification-closure-ledger.json";
const OUT_FILE = "data/review/source-verification-closure-decisions.json";

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

const DECIDED_AT = `${kstDate()} KST`;

function parseArgs(argv) {
  return {
    force: argv.includes("--force"),
  };
}

const NO_FALLBACK = Symbol("NO_FALLBACK");

async function readJson(file, fallback = NO_FALLBACK) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== NO_FALLBACK) return fallback;
    throw error;
  }
}

function compact(value, limit = 420) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function decisionStatus(row) {
  if (row.recommended_closure === "defer") return "deferred";
  if (row.recommended_closure === "confirm") return "confirmed";
  if (row.recommended_closure === "source_date_split" || row.recommended_closure === "conflict_or_update") return "conflict";
  return "pending";
}

function statusReason(row) {
  switch (row.recommended_closure) {
    case "confirm":
      return "기존 수동 OCR 판정 또는 관리처분 공개항목 해소표에서 현재값을 확인한 항목으로 1차 confirmed 처리";
    case "conflict_or_update":
      return "원문값과 장부 현재값의 정밀도/기준 차이가 있어 conflict로 두고 보정 또는 별도 필드 분리 필요";
    case "source_date_split":
      return "고시·사업시행·관리처분 시점값을 하나로 덮어쓰면 안 되므로 conflict로 두고 시점별 기록 필요";
    case "defer":
      return "현재 사업 단계상 아직 적용 전인 필드라 deferred로 두고 단계 전환 시 재개";
    case "confirm_or_conflict_from_p0_public_item":
    case "confirm_or_conflict_from_public_item":
      return "공개항목·원문 스니펫 후보는 있으나 상세/첨부 수동 대조 전까지 pending 유지";
    case "confirm_or_pending_after_review":
      return "후보값은 있으나 원문 줄/공식 보조근거 2차 확인 전까지 pending 유지";
    case "partial_confirm_after_url_review":
      return "일부 원문 URL은 확보됐지만 필드별 닫힘을 분리해야 하므로 pending 유지";
    default:
      return "추가 원문, recordCode, OCR 이미지, 별첨 또는 2차 공식 출처가 필요해 pending 유지";
  }
}

function followUp(row) {
  if (row.recommended_closure === "confirm") return "confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검";
  if (row.recommended_closure === "defer") return "단계 변경 감시표에서 해당 사업장 단계가 바뀌면 다시 열기";
  if (row.recommended_closure === "source_date_split") return "고시/사업시행/관리처분 시점별 값을 별도 열 또는 메모에 기록";
  if (row.recommended_closure === "conflict_or_update") return "원문값과 현재값을 나란히 기록하고 보정 후보 또는 conflict 사유를 남기기";
  return row.next_action || "원문 또는 공식 보조근거를 추가 확인";
}

function evidenceFiles(row) {
  return [row.source_to_open, row.source_path_or_url, row.project_note].filter(Boolean).join("; ");
}

function makeDecision(row, index) {
  return {
    decision_id: `svc-${DECIDED_AT.slice(0, 10).replaceAll("-", "")}-${String(index + 1).padStart(4, "0")}`,
    decided_at: DECIDED_AT,
    reviewer: "codex_closure_triage_seed",
    closure_id: row.closure_id,
    sprint_id: row.sprint_id,
    priority: row.priority,
    project_name: row.project_name,
    field_id: row.field_id,
    field_label: row.field_label,
    recommended_closure: row.recommended_closure,
    decision_status: decisionStatus(row),
    decision_basis: "derived_from_existing_s1_s5_workbooks_and_review_logs",
    evidence_files: compact(evidenceFiles(row), 700),
    decision_note: compact(statusReason(row), 500),
    follow_up_action: compact(followUp(row), 500),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const existing = await readJson(OUT_FILE, null);
  if (existing && !args.force) {
    throw new Error(`${OUT_FILE} already exists. Re-run with --force only if you intend to replace the current decision seed.`);
  }

  const ledger = await readJson(INPUT_LEDGER);
  const rows = ledger.rows || [];
  const decisions = rows.map(makeDecision);
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(decisions, null, 2)}\n`);
  const counts = decisions.reduce((acc, decision) => {
    acc[decision.decision_status] = (acc[decision.decision_status] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ output: OUT_FILE, decisions: decisions.length, counts }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
