#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-source-activation-validation.md");
const OUT_CSV = path.join(OUT_DIR, "official-source-activation-validation.csv");
const OUT_JSON = path.join(OUT_DIR, "official-source-activation-validation.json");

const INPUTS = {
  checklist: "analysis/official-source-activation-checklist.json",
  intake: "data/review/official-source-activation-intake.json",
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
const NOW = new Date();
const VALID_ACTIVATION_STATUSES = new Set(["planned", "submitted", "active", "blocked", "retired"]);

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

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function compact(items, limit = 5) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function isIsoLikeDate(value) {
  return /^\d{4}-\d{2}-\d{2}(?:\s+[A-Z]{2,4})?$/.test(String(value || "").trim());
}

function parseDate(value) {
  const match = String(value || "").trim().match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  const parsed = new Date(`${match[1]}T00:00:00+09:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addIssue(issues, severity, field, message, action) {
  issues.push({ severity, field, message, action });
}

function requiredFieldText(type, status) {
  if (status === "untracked") return "source_id, activation_status, next_check_at";
  if (type === "manual_subscription") return "activation_channel, coverage, next_check_at, credential_or_subscription_note";
  if (type === "api_key") return "activation_channel, next_check_at, credential_or_subscription_note";
  if (type === "manual_market_monitoring") return "coverage, next_check_at, credential_or_subscription_note";
  if (type === "manual_monitoring") return "coverage, next_check_at, credential_or_subscription_note";
  return "notes";
}

function validateTrackedRow(targetRow, intakeRow, seen) {
  const issues = [];
  const status = intakeRow.activation_status || "";
  const type = targetRow.activation_type;

  if (!intakeRow.source_id) addIssue(issues, "error", "source_id", "source_id 누락", "활성화 대상 source_id를 그대로 입력");
  if (seen.has(intakeRow.source_id)) addIssue(issues, "error", "source_id", `중복 source_id: ${intakeRow.source_id}`, "source_id별 intake 행은 하나만 유지");
  seen.add(intakeRow.source_id);

  if (!VALID_ACTIVATION_STATUSES.has(status)) {
    addIssue(issues, "error", "activation_status", `허용되지 않는 activation_status: ${status}`, [...VALID_ACTIVATION_STATUSES].join(", "));
  }

  for (const field of ["activated_at", "next_check_at"]) {
    const value = intakeRow[field];
    if (value && !isIsoLikeDate(value)) {
      addIssue(issues, "error", field, `${field} 형식이 YYYY-MM-DD 또는 YYYY-MM-DD KST가 아님`, "날짜 형식을 맞춰 입력");
    }
  }

  if (["submitted", "active", "blocked"].includes(status) && !intakeRow.next_check_at) {
    addIssue(issues, "warning", "next_check_at", "다음 확인일 누락", "다음 점검일을 YYYY-MM-DD KST 형식으로 입력");
  }

  const nextCheckDate = parseDate(intakeRow.next_check_at);
  if (nextCheckDate && nextCheckDate.getTime() < NOW.getTime() && ["submitted", "active", "blocked"].includes(status)) {
    addIssue(issues, "warning", "next_check_at", "다음 확인일이 현재 기준 과거", "다음 점검일을 갱신");
  }

  if (["submitted", "active", "blocked"].includes(status) && !String(intakeRow.activation_channel || "").trim()) {
    addIssue(issues, "warning", "activation_channel", "활성화 채널 누락", "신청/운영 채널명을 기록");
  }

  if (status === "active" && !intakeRow.activated_at) {
    addIssue(issues, "error", "activated_at", "active 상태인데 activated_at 누락", "실제 활성화일을 YYYY-MM-DD KST 형식으로 입력");
  }

  if (["blocked", "retired"].includes(status) && !String(intakeRow.notes || "").trim()) {
    addIssue(issues, "warning", "notes", "blocked/retired 상태인데 사유 메모 누락", "제약 또는 종료 사유를 notes에 입력");
  }

  if (type === "manual_subscription" && ["submitted", "active"].includes(status)) {
    if (!String(intakeRow.coverage || "").trim()) addIssue(issues, "warning", "coverage", "알림 대상 구 범위 누락", "관심 자치구를 세미콜론으로 기록");
    if (!String(intakeRow.credential_or_subscription_note || "").trim()) {
      addIssue(issues, "warning", "credential_or_subscription_note", "신청 완료 메모 누락", "신청 경로와 완료 메모만 기록");
    }
  }

  if (type === "api_key" && ["submitted", "active"].includes(status)) {
    if (!String(intakeRow.credential_or_subscription_note || "").trim()) {
      addIssue(issues, "warning", "credential_or_subscription_note", "키 상태 메모 누락", "환경변수명, 승인 상태, 호출 범위만 기록");
    }
  }

  if (type === "manual_market_monitoring" && ["submitted", "active"].includes(status)) {
    if (!String(intakeRow.coverage || "").trim()) addIssue(issues, "warning", "coverage", "지표 범위 누락", "지역 범위와 지표 범주를 기록");
    if (!String(intakeRow.credential_or_subscription_note || "").trim()) {
      addIssue(issues, "warning", "credential_or_subscription_note", "다운로드/지표 코드 메모 누락", "지표 코드, 다운로드 URL/파일명을 기록");
    }
  }

  if (type === "manual_monitoring" && ["submitted", "active"].includes(status)) {
    if (!String(intakeRow.coverage || "").trim()) addIssue(issues, "warning", "coverage", "검색 범위 누락", "키워드 또는 대상 페이지 범위를 기록");
    if (!String(intakeRow.credential_or_subscription_note || "").trim()) {
      addIssue(issues, "warning", "credential_or_subscription_note", "검색 루틴 메모 누락", "검색 키워드, URL, 점검 주기를 기록");
    }
  }

  return issues;
}

function buildRows(targetRows, intakeRows) {
  const targetBySource = new Map(targetRows.map((row) => [row.source_id, row]));
  const intakeBySource = new Map(intakeRows.map((row) => [row.source_id, row]));
  const seen = new Set();
  const issues = [];
  const rows = [];

  for (const intakeRow of intakeRows) {
    const targetRow = targetBySource.get(intakeRow.source_id);
    if (!targetRow) {
      const orphanIssues = [];
      addIssue(orphanIssues, "error", "source_id", `활성화 대상이 아닌 source_id: ${intakeRow.source_id || "(blank)"}`, "활성화 대상 7개 출처 중 하나만 유지");
      rows.push({
        activation_priority: 0,
        source_id: intakeRow.source_id || "",
        source_name: intakeRow.activation_channel || "",
        activation_type: "",
        intake_status: intakeRow.activation_status || "",
        tracked: "orphan",
        next_check_at: intakeRow.next_check_at || "",
        issue_count: orphanIssues.length,
        issues: compact(orphanIssues.map((issue) => `${issue.severity}:${issue.field}:${issue.message}`), 8),
        required_fields: "",
        next_action: "source_id를 활성화 대상 출처 중 하나로 수정하거나 행 삭제",
      });
      issues.push(
        ...orphanIssues.map((issue) => ({
          source_id: intakeRow.source_id || "",
          source_name: intakeRow.activation_channel || "",
          ...issue,
        })),
      );
      continue;
    }
    const rowIssues = validateTrackedRow(targetRow, intakeRow, seen);
    rows.push({
      activation_priority: targetRow.activation_priority,
      source_id: targetRow.source_id,
      source_name: targetRow.source_name,
      activation_type: targetRow.activation_type,
      intake_status: intakeRow.activation_status || "",
      tracked: "yes",
      next_check_at: intakeRow.next_check_at || "",
      issue_count: rowIssues.length,
      issues: compact(rowIssues.map((issue) => `${issue.severity}:${issue.field}:${issue.message}`), 8),
      required_fields: requiredFieldText(targetRow.activation_type, intakeRow.activation_status || ""),
      next_action: targetRow.first_action,
    });
    issues.push(
      ...rowIssues.map((issue) => ({
        source_id: targetRow.source_id,
        source_name: targetRow.source_name,
        ...issue,
      })),
    );
  }

  for (const targetRow of targetRows) {
    if (intakeBySource.has(targetRow.source_id)) continue;
    rows.push({
      activation_priority: targetRow.activation_priority,
      source_id: targetRow.source_id,
      source_name: targetRow.source_name,
      activation_type: targetRow.activation_type,
      intake_status: "untracked",
      tracked: "no",
      next_check_at: "",
      issue_count: 0,
      issues: "",
      required_fields: requiredFieldText(targetRow.activation_type, "untracked"),
      next_action: "examples JSON에서 해당 출처 예시를 복사해 intake에 추가",
    });
  }

  return {
    rows: rows.sort((a, b) => b.activation_priority - a.activation_priority || a.source_id.localeCompare(b.source_id)),
    issues: issues.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity) || a.source_id.localeCompare(b.source_id)),
  };
}

function severityOrder(severity) {
  return { error: 1, warning: 2 }[severity] || 9;
}

function summarize(rows, issues, targetCount) {
  return {
    generated_at: UPDATED_AT,
    target_source_count: targetCount,
    intake_row_count: rows.filter((row) => row.tracked === "yes" || row.tracked === "orphan").length,
    tracked_count: rows.filter((row) => row.tracked === "yes").length,
    untracked_count: rows.filter((row) => row.tracked === "no").length,
    orphan_count: rows.filter((row) => row.tracked === "orphan").length,
    error_count: issues.filter((issue) => issue.severity === "error").length,
    warning_count: issues.filter((issue) => issue.severity === "warning").length,
    active_count: rows.filter((row) => row.intake_status === "active").length,
    submitted_count: rows.filter((row) => row.intake_status === "submitted").length,
    blocked_count: rows.filter((row) => row.intake_status === "blocked").length,
    overdue_check_count: issues.filter((issue) => issue.field === "next_check_at" && /과거/.test(issue.message)).length,
    status_mix: countBy(rows, "intake_status"),
    type_mix: countBy(rows, "activation_type"),
    tracked_mix: countBy(rows, "tracked"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows, issues) {
  return `# 공식 출처 활성화 검증 보드

작성 기준: ${UPDATED_AT}

이 문서는 \`data/review/official-source-activation-intake.json\`의 수동 입력값을 검증한다. 활성화 자체가 안 된 출처와, 입력은 했지만 상태/날짜/메모가 부족한 출처를 분리해 보여준다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 활성화 대상 출처 | ${summary.target_source_count} |
| intake 행 | ${summary.intake_row_count} |
| 추적 중 | ${summary.tracked_count} |
| 미기록 | ${summary.untracked_count} |
| orphan | ${summary.orphan_count} |
| 오류 | ${summary.error_count} |
| 경고 | ${summary.warning_count} |
| active/submitted/blocked | ${summary.active_count}/${summary.submitted_count}/${summary.blocked_count} |

| 구분 | 값 |
| --- | --- |
| 상태 | ${summary.status_mix || "입력 없음"} |
| 유형 | ${summary.type_mix || "입력 없음"} |
| 추적 | ${summary.tracked_mix || "입력 없음"} |

## 현재 상태

${mdTable(rows, [
    { key: "activation_priority", label: "우선" },
    { key: "source_id", label: "출처" },
    { key: "activation_type", label: "유형" },
    { key: "intake_status", label: "상태" },
    { key: "tracked", label: "추적" },
    { key: "next_check_at", label: "다음 확인일" },
    { key: "issue_count", label: "이슈수" },
    { key: "required_fields", label: "권장 필드" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 검증 이슈

${mdTable(issues, [
    { key: "severity", label: "등급" },
    { key: "source_id", label: "출처" },
    { key: "field", label: "필드" },
    { key: "message", label: "메시지" },
    { key: "action", label: "조치" },
  ])}

## 판정 규칙

- \`untracked\`는 오류가 아니다. 아직 intake에 기록하지 않은 상태다.
- \`active\`는 \`activated_at\`이 있어야 한다.
- \`submitted\`와 \`active\`는 보통 \`next_check_at\`과 \`activation_channel\`을 함께 남긴다.
- 시장 데이터/API 항목은 키 값이 아니라 환경변수명, 승인 상태, 호출 범위만 기록한다.
`;
}

async function main() {
  const [checklist, intake] = await Promise.all([readJson(INPUTS.checklist), readJson(INPUTS.intake, [])]);
  const targetRows = rowsFrom(checklist);
  const intakeRows = rowsFrom(intake);
  const { rows, issues } = buildRows(targetRows, intakeRows);
  const summary = summarize(rows, issues, targetRows.length);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows, issues }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, issues));
  console.log(JSON.stringify({ targets: targetRows.length, intakeRows: intakeRows.length, errors: summary.error_count, warnings: summary.warning_count, output: "analysis/official-source-activation-validation.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
