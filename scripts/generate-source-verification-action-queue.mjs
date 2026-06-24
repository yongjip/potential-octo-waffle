#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-verification-action-queue.md");
const OUT_CSV = path.join(OUT_DIR, "source-verification-action-queue.csv");
const OUT_JSON = path.join(OUT_DIR, "source-verification-action-queue.json");

const INPUTS = {
  closureLedger: "analysis/source-verification-closure-ledger.json",
  decisions: "data/review/source-verification-closure-decisions.json",
  songpaNoticeCorroboration: "analysis/songpa-notice-value-corroboration.json",
  matrix: "analysis/project-comparison-matrix.json",
};

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const PRIORITY_SCORE = { P0: 0, P1: 1, P2: 2 };
const STATUS_SCORE = { conflict: 0, pending: 1, open: 2, deferred: 3, confirmed: 4 };
const MODE_SCORE = {
  record_source_date_split: 0,
  apply_conflict_or_precision_update: 1,
  fetch_original_notice_or_recordcode: 2,
  relink_original_notice: 3,
  fetch_secondary_source: 4,
  review_public_item_attachment: 5,
  review_candidate_value: 6,
  search_missing_value_source: 7,
  apply_confirmed_value: 8,
  defer_until_stage_change: 9,
};

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

function compact(value, limit = 360) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "(blank)");
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

function groupByRank(rows, rankField = "rank") {
  return rows.reduce((acc, row) => {
    const rank = String(row[rankField] || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function firstByRank(rows, rankField = "rank") {
  return rows.reduce((acc, row) => {
    const rank = String(row[rankField] || "");
    if (!rank || acc[rank]) return acc;
    acc[rank] = row;
    return acc;
  }, {});
}

function mergeSourceList(...parts) {
  const seen = new Set();
  const merged = [];
  for (const part of parts) {
    for (const item of String(part || "")
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean)) {
      if (seen.has(item)) continue;
      seen.add(item);
      merged.push(item);
    }
  }
  return merged.join("; ");
}

function firstTarget(row) {
  const source = row.source_to_open || row.source_path_or_url || "";
  if (!source) return "";
  return compact(source.split(";")[0]);
}

function targetType(target) {
  if (!target) return "missing";
  if (/^https?:\/\//.test(target)) return "url";
  if (/\.(png|jpg|jpeg|pdf|hwp|hwpx)\b/i.test(target)) return "source_file";
  if (/\.(txt|md|json|csv):?\d*/i.test(target)) return "text_or_report";
  if (/서울도시공간포털|자치구|정보몽땅|서울시보/.test(target)) return "official_search";
  return "note_or_search";
}

function actionMode(row) {
  if (row.closure_status === "confirmed") return "apply_confirmed_value";
  if (row.closure_status === "deferred") return "defer_until_stage_change";
  if (row.recommended_closure === "source_date_split") return "record_source_date_split";
  if (row.recommended_closure === "conflict_or_update") return "apply_conflict_or_precision_update";
  if (/recordcode|original_notice|source_link/.test(row.recommended_closure)) return "fetch_original_notice_or_recordcode";
  if (/relink/.test(row.recommended_closure)) return "relink_original_notice";
  if (row.sprint_id === "S2" || row.work_item_type === "recordcode_url_closure") return "fetch_original_notice_or_recordcode";
  if (/secondary|more_source|ocr_image/.test(row.recommended_closure)) return "fetch_secondary_source";
  if (/public_item/.test(row.recommended_closure)) return "review_public_item_attachment";
  if (/pending_search/.test(row.recommended_closure)) return "search_missing_value_source";
  if (/confirm_or_pending/.test(row.recommended_closure)) return "review_candidate_value";
  return "review_candidate_value";
}

function actionLabel(mode) {
  return {
    record_source_date_split: "시점별 값 분리 기록",
    apply_conflict_or_precision_update: "충돌/정밀도 보정 판단",
    fetch_original_notice_or_recordcode: "본고시 URL·recordCode 확보",
    relink_original_notice: "잘못된 원문 재연결",
    fetch_secondary_source: "2차 공식 출처 확인",
    review_public_item_attachment: "공개항목 상세/첨부 대조",
    review_candidate_value: "후보값 원문 대조",
    search_missing_value_source: "공란값 원문 검색",
    apply_confirmed_value: "확정값 반영 점검",
    defer_until_stage_change: "단계 변경까지 보류",
  }[mode] || mode;
}

function acceptanceCriteria(row, mode) {
  if (mode === "record_source_date_split") return "고시/사업시행/관리처분 기준값을 별도 열 또는 사업별 메모에 나눠 기록하고 decision_status를 conflict에서 confirmed 또는 deferred로 조정";
  if (mode === "apply_conflict_or_precision_update") return "원문값과 현재값 차이를 기록하고 보정 후보, 별도 필드, 또는 conflict 유지 중 하나로 결정";
  if (mode === "fetch_original_notice_or_recordcode") return "본고시 URL, recordCode, 고시번호, 고시일 중 빠진 키를 채우고 원문 파일/텍스트 경로를 연결";
  if (mode === "relink_original_notice") return "현재 연결 원문이 맞는지 검증하고, 맞지 않으면 새 공식 원문 경로로 교체";
  if (mode === "fetch_secondary_source") return "OCR 이미지나 요약값만으로 부족한 필드를 사업시행인가/관리처분/사업개요 등 2차 공식 출처로 대조";
  if (mode === "review_public_item_attachment") return "정보몽땅 공개항목 상세 또는 첨부에서 비용·기반시설·공공기여 문맥을 확인하고 confirmed/pending/conflict로 판정";
  if (mode === "search_missing_value_source") return "공식 원문에서 후보값을 찾거나, 미공개/단계상 부재 사유를 decision_note에 기록";
  if (mode === "apply_confirmed_value") return "확정된 값이 비교표, 핵심 장부, 사업별 메모에 반영됐는지 확인";
  if (mode === "defer_until_stage_change") return "단계상 적용 전 필드임을 유지하고 단계 변경 감시표 트리거에 연결";
  return row.follow_up_action || row.next_action || "원문 근거를 확인하고 판정 로그를 갱신";
}

function songpaAuxiliaryNoticeHint(row, corroborationRows = []) {
  if (row.sprint_id !== "S2") return null;
  if (row.action_group !== "local_text_available_no_closure_rows") return null;
  const match = corroborationRows.find((item) => {
    if (item.review_status !== "auxiliary_plan_notice_connected") return false;
    if (item.action_group !== "keep_as_auxiliary_context") return false;
    if (!row.current_value) return true;
    return String(item.notice_no || "") === String(row.current_value || "");
  });
  if (!match) return null;
  const noticeKey = [match.notice_no, match.notice_date].filter(Boolean).join(" / ") || String(match.notice_no || "보조 고시");
  return {
    first_target: `${noticeKey}는 검색 키로만 사용하고 사업 직접 고시는 별도 확보`,
    source_to_open: ["analysis/songpa-notice-value-corroboration.md", match.text_path || "", row.source_to_open].filter(Boolean).join("; "),
    decision_note: [row.decision_note, match.evidence_basis].filter(Boolean).join(" / "),
    follow_up_action: `${noticeKey}는 상위 개발기본계획 보조 고시로 유지하고, recordCode·사업 직접 고시·사업별 정비계획 원문을 별도로 찾는다`,
    acceptance_criteria: `${noticeKey}를 사업 직접 원문으로 승격하지 않고, 사업별 직접 고시 또는 recordCode를 별도로 연결`,
  };
}

function businessLayerIdentifierHint(row, matrixRow = {}) {
  if (actionMode(row) !== "fetch_original_notice_or_recordcode") return null;
  if (matrixRow.has_urban_map === "Y") return null;
  if (matrixRow.has_business_layer_match !== "Y") return null;
  if (!matrixRow.business_present_sn) return null;
  const memoPath = String(row.rank) === "5" ? "analysis/s5-jangmi-business-layer-identifier.md" : "";
  const identifierNote = `현재 사업 레이어 presentSn ${matrixRow.business_present_sn}, 단계 ${matrixRow.business_layer_stage || "미확인"}, 기준일 ${matrixRow.business_layer_data_reference_date || "미확인"} 확인`;
  return {
    first_target: `${identifierNote}; direct 고시/recordCode는 별도 확보`,
    source_to_open: mergeSourceList(
      memoPath,
      "analysis/recordcode-dead-end-audit.md",
      "analysis/map-missing-business-layer-review.md",
      row.source_to_open,
    ),
    decision_note: [row.decision_note, identifierNote].filter(Boolean).join(" / "),
    follow_up_action: `${matrixRow.business_present_sn}는 현재 사업 식별자로 유지하고, recordCode·사업 직접 고시·사업별 정비계획 원문을 별도로 찾는다`,
    acceptance_criteria: `presentSn ${matrixRow.business_present_sn}를 현재 사업 식별자로 유지하되, 사업 직접 고시 또는 recordCode를 별도로 연결`,
  };
}

function actionRows(ledgerRows, corroborationRowsByRank = {}, matrixByRank = {}) {
  return ledgerRows
    .filter((row) => ["pending", "conflict", "open"].includes(row.closure_status))
    .map((row) => {
      const mode = actionMode(row);
      const hint = songpaAuxiliaryNoticeHint(row, corroborationRowsByRank[String(row.rank)] || []);
      const businessHint = businessLayerIdentifierHint(row, matrixByRank[String(row.rank)] || {});
      const mergedHint = {
        first_target: businessHint?.first_target || hint?.first_target || "",
        source_to_open: mergeSourceList(businessHint?.source_to_open, hint?.source_to_open, row.source_to_open),
        decision_note: businessHint?.decision_note || hint?.decision_note || row.decision_note,
        follow_up_action: businessHint?.follow_up_action || hint?.follow_up_action || row.follow_up_action || row.next_action,
        acceptance_criteria: businessHint?.acceptance_criteria || hint?.acceptance_criteria || acceptanceCriteria(row, mode),
      };
      const target = mergedHint.first_target || firstTarget(row);
      return {
        action_rank: 0,
        priority: row.priority,
        focus_area: row.focus_area,
        district: row.district,
        project_rank: row.rank,
        project_name: row.project_name,
        current_stage: row.current_stage,
        closure_id: row.closure_id,
        sprint_id: row.sprint_id,
        closure_status: row.closure_status,
        recommended_closure: row.recommended_closure,
        action_mode: mode,
        action_label: actionLabel(mode),
        field_label: row.field_label,
        field_id: row.field_id,
        current_value: row.current_value,
        candidate_value: row.candidate_value,
        first_target: target,
        first_target_type: targetType(target),
        source_to_open: mergedHint.source_to_open,
        evidence_snippet: row.evidence_snippet,
        decision_note: mergedHint.decision_note,
        follow_up_action: mergedHint.follow_up_action,
        acceptance_criteria: mergedHint.acceptance_criteria,
        project_note: row.project_note,
      };
    })
    .sort((a, b) =>
      (PRIORITY_SCORE[a.priority] ?? 9) - (PRIORITY_SCORE[b.priority] ?? 9) ||
      (STATUS_SCORE[a.closure_status] ?? 9) - (STATUS_SCORE[b.closure_status] ?? 9) ||
      (MODE_SCORE[a.action_mode] ?? 99) - (MODE_SCORE[b.action_mode] ?? 99) ||
      Number(a.project_rank || 9999) - Number(b.project_rank || 9999) ||
      a.closure_id.localeCompare(b.closure_id),
    )
    .map((row, index) => ({ ...row, action_rank: index + 1 }));
}

function projectRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const key = `${row.project_rank}:${row.project_name}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        priority: row.priority,
        focus_area: row.focus_area,
        district: row.district,
        project_rank: row.project_rank,
        project_name: row.project_name,
        current_stage: row.current_stage,
        action_count: 0,
        p0_count: 0,
        conflict_count: 0,
        modes: new Set(),
        top_closure_ids: [],
        first_target: row.first_target,
        first_action: row.follow_up_action,
        project_note: row.project_note,
      });
    }
    const item = grouped.get(key);
    item.action_count += 1;
    if (row.priority === "P0") item.p0_count += 1;
    if (row.closure_status === "conflict") item.conflict_count += 1;
    item.modes.add(row.action_label);
    if (item.top_closure_ids.length < 5) item.top_closure_ids.push(row.closure_id);
  }
  return [...grouped.values()]
    .map((row) => ({
      ...row,
      modes: [...row.modes].slice(0, 5).join("; "),
      top_closure_ids: row.top_closure_ids.join("; "),
    }))
    .sort((a, b) => b.p0_count - a.p0_count || b.conflict_count - a.conflict_count || b.action_count - a.action_count || Number(a.project_rank) - Number(b.project_rank));
}

function buildSummary(rows, projects, decisions) {
  return {
    generated_at: `${kstDate()} KST`,
    action_count: rows.length,
    project_count: projects.length,
    p0_count: rows.filter((row) => row.priority === "P0").length,
    p1_count: rows.filter((row) => row.priority === "P1").length,
    pending_count: rows.filter((row) => row.closure_status === "pending").length,
    conflict_count: rows.filter((row) => row.closure_status === "conflict").length,
    open_count: rows.filter((row) => row.closure_status === "open").length,
    mode_counts: countBy(rows, "action_label"),
    focus_counts: countBy(rows, "focus_area"),
    target_type_counts: countBy(rows, "first_target_type"),
    decision_log_count: decisions.length,
    inputs: INPUTS,
  };
}

function markdown(rows, projects, summary) {
  return `# 원문 검증 실행 큐

작성 기준: ${kstDate()} KST

통합 클로저 장부에서 아직 확정값으로 쓰면 안 되는 \`pending/conflict/open\` 항목만 추린 실행 큐다. 이 문서는 오늘 어떤 원문을 열고, 어떤 기준으로 판정 로그를 갱신해야 하는지에 집중한다.

## 요약

| 항목 | 값 |
| --- | --- |
| 실행 항목 | ${summary.action_count}건 |
| 관련 사업장 | ${summary.project_count}개 |
| P0/P1 | ${summary.p0_count}/${summary.p1_count} |
| pending/conflict/open | ${summary.pending_count}/${summary.conflict_count}/${summary.open_count} |
| 액션 유형 | ${countText(summary.mode_counts, 10)} |
| 생활권 | ${countText(summary.focus_counts, 5)} |
| 첫 타깃 유형 | ${countText(summary.target_type_counts, 8)} |

## 오늘 먼저 처리할 40건

${mdTable(rows.slice(0, 40), [
  { key: "action_rank", label: "순번" },
  { key: "priority", label: "우선" },
  { key: "closure_status", label: "상태" },
  { key: "action_label", label: "액션" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "first_target", label: "먼저 열 것" },
  { key: "acceptance_criteria", label: "닫는 기준" },
])}

## 사업장 묶음

${mdTable(projects.slice(0, 30), [
  { key: "project_rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "action_count", label: "항목" },
  { key: "p0_count", label: "P0" },
  { key: "conflict_count", label: "충돌" },
  { key: "modes", label: "해야 할 일" },
  { key: "top_closure_ids", label: "대표 ID" },
  { key: "project_note", label: "메모" },
])}

## 사용법

1. \`오늘 먼저 처리할 40건\`에서 순번이 낮은 항목부터 원문을 연다.
2. 판정 결과는 \`data/review/source-verification-closure-decisions.json\`의 해당 \`closure_id\`에 반영한다.
3. confirmed로 바꾼 값은 비교표·핵심 장부·사업별 메모 반영 여부를 확인한다.
4. conflict는 값 정의나 시점을 분리해서 남기고, pending은 어떤 공식 원문이 더 필요한지 적는다.
5. 수정 후 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
`;
}

async function main() {
  const [ledger, decisions, songpaNoticeCorroboration, matrixRows] = await Promise.all([
    readJson(INPUTS.closureLedger),
    readJson(INPUTS.decisions, []),
    readJson(INPUTS.songpaNoticeCorroboration, []),
    readJson(INPUTS.matrix, []),
  ]);
  const corroborationRowsByRank = groupByRank(songpaNoticeCorroboration);
  const matrixByRank = firstByRank(matrixRows);
  const rows = actionRows(ledger.rows || [], corroborationRowsByRank, matrixByRank);
  const projects = projectRows(rows);
  const summary = buildSummary(rows, projects, decisions);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: `${kstDate()} KST`, summary, projectRows: projects, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, projects, summary));
  console.log(JSON.stringify({ output: "analysis/source-verification-action-queue.{md,csv,json}", ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
