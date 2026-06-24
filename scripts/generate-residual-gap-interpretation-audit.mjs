#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "residual-gap-interpretation-audit.md");
const OUT_CSV = path.join(OUT_DIR, "residual-gap-interpretation-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "residual-gap-interpretation-audit.json");

const CORE_LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";
const CLOSURE_LEDGER_INPUT = "analysis/source-verification-closure-ledger.json";
const STATUS_INPUT = "analysis/research-status-dashboard.json";

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

const RESIDUAL_STATUSES = new Set([
  "value_missing",
  "not_yet_applicable",
  "structured_value_needs_manual_confirmation",
  "snippet_candidate_needs_manual_confirmation",
  "source_link_required",
  "no_source_text",
  "ocr_review_required",
  "ocr_partial_confirmation_pending",
  "ocr_source_value_update_required",
  "source_value_fill_missing_required",
  "source_date_split_required",
  "source_definition_split_required",
  "management_stage_followup_needed",
  "partial_original_notice_confirmation",
  "auxiliary_notice_context_only",
]);

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

function countBy(rows, getter) {
  return rows.reduce((acc, row) => {
    const key = typeof getter === "function" ? getter(row) : row[getter];
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts, limit = 8) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function normalizeFieldKey(row) {
  return `${row.rank || ""}|${row.field_id || ""}|${row.field_label || ""}`;
}

function closureIndex(closureRows) {
  const byRankField = new Map();
  const deferredByRank = new Map();
  for (const row of closureRows) {
    const rank = String(row.rank || "");
    if (!rank) continue;
    if (row.field_id || row.field_label) {
      const key = normalizeFieldKey(row);
      if (!byRankField.has(key)) byRankField.set(key, []);
      byRankField.get(key).push(row);
    }
    if (row.closure_status === "deferred") {
      if (!deferredByRank.has(rank)) deferredByRank.set(rank, []);
      deferredByRank.get(rank).push(row);
    }
  }
  return { byRankField, deferredByRank };
}

function classifyCoreRow(row, relatedClosures = []) {
  const status = row.verification_status || "";
  const priority = row.related_task_priority || "";
  const hasSource = Boolean(row.source_to_open || row.source_link_candidate_url || row.source_link_candidate_path);
  const deferredClosures = relatedClosures.filter((item) => item.closure_status === "deferred");
  const recommended = `${row.next_value_action || ""} ${row.source_link_candidate_note || ""} ${deferredClosures
    .map((item) => `${item.recommended_closure || ""} ${item.decision_basis || ""} ${item.follow_up_action || ""}`)
    .join(" ")}`;

  if (status === "not_yet_applicable" || /defer_stage_not_applicable/.test(recommended)) {
    return {
      interpretation_class: "stage_not_applicable",
      use_rule: "현재 단계에서는 해당 필드를 비교·점수화하지 않고, 사업시행/관리처분 등 다음 단계 공개 시 다시 연다.",
      trigger: "단계 변경, 공개항목 추가, 신규 인가고시",
      blocking_level: "not_blocking",
    };
  }
  if (/manual_escalation_required|담당|정보공개|수동 확인/.test(recommended)) {
    return {
      interpretation_class: "manual_source_escalation",
      use_rule: "구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다.",
      trigger: "자치구/정보몽땅 담당 창구 확인, 신규 고시 게시",
      blocking_level: priority === "P0" ? "high" : "medium",
    };
  }
  if (status === "value_missing" && !hasSource) {
    return {
      interpretation_class: "missing_no_public_source",
      use_rule: "현재 공개 원문에서 값을 찾지 못한 공란이다. 비교표에서는 공란으로 유지하고 추정·대체 입력을 금지한다.",
      trigger: "신규 고시, 사업시행계획서, 공개항목 첨부, 정보공개",
      blocking_level: priority === "P0" ? "high" : "medium",
    };
  }
  if (status === "value_missing" && hasSource) {
    return {
      interpretation_class: "source_available_extract_later",
      use_rule: "원문 또는 후보 파일은 있으나 필드값을 확정하지 못했다. 공란으로 유지하되 다음 OCR/수동 판독 때 보강한다.",
      trigger: "원문 이미지 확대 판독, 키워드 스니펫 재추출, 후속 공개항목",
      blocking_level: priority === "P0" ? "medium" : "low",
    };
  }
  if (["source_date_split_required", "source_definition_split_required", "management_stage_followup_needed"].includes(status)) {
    return {
      interpretation_class: "source_basis_split",
      use_rule: "단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다.",
      trigger: "같은 기준의 후속 원문 확보, 관리처분 별첨 확보",
      blocking_level: "medium",
    };
  }
  if (["ocr_partial_confirmation_pending", "ocr_source_value_update_required", "source_value_fill_missing_required", "ocr_review_required"].includes(status)) {
    return {
      interpretation_class: "ocr_or_precision_review",
      use_rule: "OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다.",
      trigger: "원문 이미지 수동 판독, 재OCR, 2차 원문 확인",
      blocking_level: priority === "P0" ? "medium" : "low",
    };
  }
  if (["structured_value_needs_manual_confirmation", "snippet_candidate_needs_manual_confirmation", "source_link_required", "no_source_text"].includes(status)) {
    return {
      interpretation_class: "usable_with_source_caveat",
      use_rule: "정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다.",
      trigger: "recordCode·noticeCode 연결, 본고시 원문 URL 보강",
      blocking_level: priority === "P0" ? "medium" : "low",
    };
  }
  if (["partial_original_notice_confirmation", "auxiliary_notice_context_only"].includes(status)) {
    return {
      interpretation_class: "context_only",
      use_rule: "상위계획·보조공고 문맥으로만 사용하고 직접 사업 수치 확정에는 사용하지 않는다.",
      trigger: "직접 정비계획/사업시행/건축심의 원문 확보",
      blocking_level: "low",
    };
  }
  return {
    interpretation_class: "review_with_caveat",
    use_rule: "비교표 사용 전 원문 장부 상태와 사업별 메모를 함께 확인한다.",
    trigger: "상태별 후속 원문 또는 수동 검토",
    blocking_level: priority === "P0" ? "medium" : "low",
  };
}

function buildRows(coreRows, closureRows) {
  const indexes = closureIndex(closureRows);
  return coreRows
    .filter((row) => RESIDUAL_STATUSES.has(row.verification_status))
    .map((row) => {
      const key = normalizeFieldKey(row);
      const relatedClosures = indexes.byRankField.get(key) || indexes.deferredByRank.get(String(row.rank || "")) || [];
      const classification = classifyCoreRow(row, relatedClosures);
      const deferredClosures = relatedClosures.filter((item) => item.closure_status === "deferred");
      return {
        rank: row.rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        current_stage: row.current_stage,
        risk_signal_level: row.risk_signal_level,
        evidence_grade: row.evidence_grade,
        field_id: row.field_id,
        field_label: row.field_label,
        current_value: row.current_value,
        verification_status: row.verification_status,
        related_task_priority: row.related_task_priority,
        interpretation_class: classification.interpretation_class,
        blocking_level: classification.blocking_level,
        use_rule: classification.use_rule,
        trigger: classification.trigger,
        has_source_to_open: row.source_to_open ? "Y" : "N",
        source_to_open: row.source_to_open,
        next_value_action: row.next_value_action,
        related_deferred_closures: deferredClosures.map((item) => item.closure_id).join("; "),
        deferred_reasons: deferredClosures.map((item) => item.recommended_closure).filter(Boolean).join("; "),
        deferred_followups: deferredClosures.map((item) => item.follow_up_action || item.next_action).filter(Boolean).join("; "),
        project_note: row.project_note,
      };
    });
}

function buildProjectRows(rows, statusRows) {
  const statusByRank = Object.fromEntries(statusRows.map((row) => [String(row.rank), row]));
  return Object.values(
    rows.reduce((acc, row) => {
      const key = String(row.rank);
      if (!acc[key]) {
        acc[key] = {
          rank: row.rank,
          focus_area: row.focus_area,
          project_name: row.project_name,
          current_stage: row.current_stage,
          readiness: statusByRank[key]?.readiness || "",
          residual_fields: 0,
          high_blocking: 0,
          medium_blocking: 0,
          not_blocking: 0,
          interpretation_mix: {},
          priority_mix: {},
          project_note: row.project_note,
        };
      }
      acc[key].residual_fields += 1;
      if (row.blocking_level === "high") acc[key].high_blocking += 1;
      if (row.blocking_level === "medium") acc[key].medium_blocking += 1;
      if (row.blocking_level === "not_blocking" || row.blocking_level === "low") acc[key].not_blocking += 1;
      acc[key].interpretation_mix[row.interpretation_class] = (acc[key].interpretation_mix[row.interpretation_class] || 0) + 1;
      if (row.related_task_priority) acc[key].priority_mix[row.related_task_priority] = (acc[key].priority_mix[row.related_task_priority] || 0) + 1;
      return acc;
    }, {}),
  )
    .map((row) => ({
      ...row,
      interpretation_summary: countText(row.interpretation_mix, 5),
      priority_summary: countText(row.priority_mix, 5),
    }))
    .sort((a, b) => b.high_blocking - a.high_blocking || b.medium_blocking - a.medium_blocking || Number(a.rank) - Number(b.rank));
}

function markdown({ summary, classRows, projectRows, topRows }) {
  return `# 잔여 공란·보류 해석 감사

작성 기준: ${UPDATED_AT}

이 문서는 핵심 수치 장부에 남은 공란·보류·부분확정 항목을 비교표에서 어떻게 해석할지 정한다. 목적은 값을 새로 확정하는 것이 아니라, 어떤 항목이 정상 보류이고 어떤 항목이 신규 원문이 나오면 다시 열릴 트리거인지 분리하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 잔여 필드 | ${summary.residual_field_count} |
| 대상 사업장 | ${summary.project_count} |
| 높은 차단 | ${summary.high_blocking_count} |
| 중간 차단 | ${summary.medium_blocking_count} |
| 낮음/비차단 | ${summary.low_or_not_blocking_count} |
| 해석 분포 | ${summary.interpretation_summary} |

## 해석 클래스

${mdTable(classRows, [
  { key: "interpretation_class", label: "해석 클래스" },
  { key: "field_count", label: "필드" },
  { key: "high_blocking", label: "높은 차단" },
  { key: "medium_blocking", label: "중간 차단" },
  { key: "use_rule", label: "비교표 사용 규칙" },
  { key: "trigger", label: "재개 트리거" },
])}

## 사업별 잔여 해석

${mdTable(projectRows.slice(0, 30), [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "readiness", label: "상태" },
  { key: "residual_fields", label: "잔여" },
  { key: "high_blocking", label: "높은 차단" },
  { key: "medium_blocking", label: "중간 차단" },
  { key: "interpretation_summary", label: "해석 요약" },
  { key: "project_note", label: "메모" },
])}

## 우선 확인 필드

${mdTable(topRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "verification_status", label: "장부 상태" },
  { key: "interpretation_class", label: "해석" },
  { key: "blocking_level", label: "차단" },
  { key: "use_rule", label: "사용 규칙" },
  { key: "trigger", label: "재개 트리거" },
])}

## 운영 규칙

1. \`stage_not_applicable\`은 현재 단계 비교에서 제외하고, 단계 변경 시 다시 연다.
2. \`source_basis_split\`은 하나의 대표값으로 병합하지 않고 기준 시점별로 병기한다.
3. \`usable_with_source_caveat\`은 비교에는 사용할 수 있지만 본고시 URL·recordCode 보강 상태를 함께 표시한다.
4. \`manual_source_escalation\`과 \`missing_no_public_source\`는 신규 고시, 담당부서 확인, 정보공개 등 외부 신호가 있어야 확정값으로 승격한다.
5. \`ocr_or_precision_review\`는 원문 이미지 판독 로그 없이 자동 보정하지 않는다.
`;
}

async function main() {
  const [coreRows, closureLedger, statusRows] = await Promise.all([
    readJson(CORE_LEDGER_INPUT),
    readJson(CLOSURE_LEDGER_INPUT),
    readJson(STATUS_INPUT),
  ]);
  const rows = buildRows(coreRows, closureLedger.rows || []);
  const projectRows = buildProjectRows(rows, statusRows);
  const classRows = Object.entries(
    rows.reduce((acc, row) => {
      if (!acc[row.interpretation_class]) {
        acc[row.interpretation_class] = {
          interpretation_class: row.interpretation_class,
          field_count: 0,
          high_blocking: 0,
          medium_blocking: 0,
          use_rule: row.use_rule,
          trigger: row.trigger,
        };
      }
      acc[row.interpretation_class].field_count += 1;
      if (row.blocking_level === "high") acc[row.interpretation_class].high_blocking += 1;
      if (row.blocking_level === "medium") acc[row.interpretation_class].medium_blocking += 1;
      return acc;
    }, {}),
  )
    .map(([, row]) => row)
    .sort((a, b) => b.high_blocking - a.high_blocking || b.medium_blocking - a.medium_blocking || b.field_count - a.field_count);
  const topRows = rows
    .filter((row) => row.blocking_level === "high" || row.blocking_level === "medium")
    .sort((a, b) => {
      const blockOrder = { high: 0, medium: 1, low: 2, not_blocking: 3 };
      return (
        (blockOrder[a.blocking_level] ?? 9) - (blockOrder[b.blocking_level] ?? 9) ||
        (a.related_task_priority || "Z").localeCompare(b.related_task_priority || "Z") ||
        Number(a.rank) - Number(b.rank)
      );
    })
    .slice(0, 80);
  const summary = {
    generated_at: UPDATED_AT,
    residual_field_count: rows.length,
    project_count: projectRows.length,
    high_blocking_count: rows.filter((row) => row.blocking_level === "high").length,
    medium_blocking_count: rows.filter((row) => row.blocking_level === "medium").length,
    low_or_not_blocking_count: rows.filter((row) => row.blocking_level === "low" || row.blocking_level === "not_blocking").length,
    interpretation_counts: countBy(rows, "interpretation_class"),
    interpretation_summary: countText(countBy(rows, "interpretation_class"), 8),
    status_counts: countBy(rows, "verification_status"),
    blocking_counts: countBy(rows, "blocking_level"),
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, classRows, projectRows, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown({ summary, classRows, projectRows, topRows }));
  console.log(
    JSON.stringify(
      {
        residualFields: summary.residual_field_count,
        projects: summary.project_count,
        highBlocking: summary.high_blocking_count,
        mediumBlocking: summary.medium_blocking_count,
        output: "analysis/residual-gap-interpretation-audit.{md,csv,json}",
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
