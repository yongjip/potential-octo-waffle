#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-next-moves.md");
const OUT_CSV = path.join(OUT_DIR, "research-next-moves.csv");
const OUT_JSON = path.join(OUT_DIR, "research-next-moves.json");

const STATUS_INPUT = "analysis/research-status-dashboard.json";
const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";
const RISK_INPUT = "analysis/project-risk-signal-summary.json";
const QUEUE_INPUT = "analysis/source-verification-action-queue.json";
const LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";
const CLOSURE_LEDGER_INPUT = "analysis/source-verification-closure-ledger.json";

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const RISK_WEIGHT = {
  very_high: 80,
  high: 50,
  medium: 25,
  watch: 0,
};

const TRACK_ORDER = {
  "원문 확정": 1,
  "비용/기반시설 대조": 2,
  "현장 동선 확인": 3,
  "정책/공공개발 모니터링": 4,
  "정기 추적": 5,
};

const SOURCE_FIRST_TASKS = new Set([
  "fetch_original_notice_or_recordcode",
  "relink_original_notice",
  "fetch_secondary_source",
  "record_source_date_split",
  "apply_conflict_or_precision_update",
  "connect_recordcode_original_notice",
  "verify_ocr_numbers",
  "resolve_stage_value_conflict",
]);

const COST_INFRA_SOURCE_HINTS_BY_RANK = {
  "1": "analysis/jamsil5-s1-public-item-fact-check.md",
  "2": "analysis/apgujeong2-s1-public-item-fact-check.md",
  "3": "analysis/jamsil-woosung-s1-public-item-fact-check.md",
  "4": "analysis/eunma-s1-public-item-fact-check.md",
  "5": "analysis/jamsil-jangmi-s1-public-item-fact-check.md",
  "8": "analysis/ssang1-s1-public-item-fact-check.md",
  "10": "analysis/apgujeong3-s1-public-item-fact-check.md",
  "11": "analysis/apgujeong4-s1-public-item-fact-check.md",
  "13": "analysis/jayang7-s1-public-item-fact-check.md",
  "14": "analysis/gaepo6_7-s1-public-item-fact-check-detailed.md",
  "16": "analysis/hyundai-s1-public-item-fact-check.md; analysis/ocr-image-review-decisions.md",
  "17": "analysis/songpa2-s1-public-item-fact-check.md",
  "21": "analysis/grsamik-s1-public-item-fact-check.md",
  "26": "analysis/jyhy2024-s1-public-item-fact-check.md",
  "30": "analysis/jayangdong-s1-public-item-fact-check-detailed.md",
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || row.project_rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function readRows(input) {
  if (Array.isArray(input)) return input;
  return input?.rows || input?.actions || [];
}

function closureKey(row) {
  return `${String(row.rank || "")}:${String(row.field_id || "")}`;
}

function buildClosureByRankField(closureRows) {
  return new Map(
    closureRows
      .filter((row) => row.rank && row.field_id && ["confirmed", "deferred"].includes(row.closure_status))
      .map((row) => [closureKey(row), row]),
  );
}

function buildSourceLinkClosureByRank(closureRows) {
  return new Map(
    closureRows
      .filter((row) => row.rank && row.category === "source_link_closure" && ["confirmed", "deferred"].includes(row.closure_status))
      .map((row) => [String(row.rank), row]),
  );
}

function effectiveLedgerRows(ledgerRows, closureByRankField, sourceLinkClosureByRank) {
  return ledgerRows.map((row) => {
    const closure = closureByRankField.get(closureKey(row));
    if (closure?.closure_status === "confirmed") return { ...row, verification_status: "closed_confirmed" };
    if (closure?.closure_status === "deferred") return { ...row, verification_status: "closed_deferred" };
    const rankClosure = sourceLinkClosureByRank.get(String(row.rank || ""));
    if (rankClosure && ["source_link_required", "no_source_text"].includes(row.verification_status)) {
      if (rankClosure.closure_status === "confirmed") return { ...row, verification_status: "closed_confirmed" };
      if (rankClosure.closure_status === "deferred") return { ...row, verification_status: "closed_deferred" };
    }
    return row;
  });
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countRows(rows, predicate) {
  return rows.filter(predicate).length;
}

function topQueue(tasks) {
  return tasks
    .slice()
    .sort((a, b) => {
      const priorityScore = { P0: 4, P1: 3, P2: 2, P3: 1 };
      return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0) || Number(a.queue_rank || a.action_rank || 999) - Number(b.queue_rank || b.action_rank || 999);
    })[0] || {};
}

function compactList(items, limit = 3) {
  return items.filter(Boolean).slice(0, limit).join("; ");
}

function topLedgerFields(rows, statuses, limit = 4) {
  const statusSet = new Set(statuses);
  return rows
    .filter((row) => statusSet.has(row.verification_status))
    .sort((a, b) => Number(a.ledger_rank || 9999) - Number(b.ledger_rank || 9999))
    .slice(0, limit)
    .map((row) => `${row.field_label}:${row.verification_status}`)
    .join("; ");
}

function hasFieldWalkSignal({ potential, risk }) {
  return Number(potential.location_score || 0) >= 9 && /혼잡|단절|보행|한강|역/.test(`${risk.mobility_risks || ""} ${potential.downside_watch || ""}`);
}

function hasPolicyWatchSignal({ potential }) {
  return /MICE|국제교류|동서울터미널|강변역|한강변|경관|공공개발/.test(`${potential.upside_watch || ""} ${potential.revisit_trigger || ""}`);
}

function hasCostInfraSignal({ risk, task }) {
  const taskType = task.task_type || task.action_mode || "";
  const signalGroups = String(risk.signal_groups || "");
  const riskHypothesis = String(risk.key_risk_hypothesis || "");
  return (
    taskType === "crosscheck_cost_infrastructure" ||
    /비용|분담금|공공기여/.test(`${signalGroups} ${riskHypothesis}`) ||
    /기반시설/.test(riskHypothesis)
  );
}

function isIdentifierRepairHint(value) {
  return /presentSn 후보|current business|recordCode|direct 고시|추가 공식 링크/.test(String(value || ""));
}

function isGenericSourceHint(value) {
  return /원문 스니펫|OCR 텍스트 스니펫|고시문 주택공급계획|사업시행계획서\/관리처분계획서|기준으로 원문 사업명·위치·면적/.test(String(value || ""));
}

function firstSourceToOpen({ track, status, task, risk }) {
  const explicitSource = task.source_to_open || task.first_target || status.first_source_to_open || "";
  const costInfraHint = COST_INFRA_SOURCE_HINTS_BY_RANK[String(status.rank || "")] || "";
  if (track === "비용/기반시설 대조") {
    if (task.source_to_open || task.first_target) return task.source_to_open || task.first_target;
    if (costInfraHint && (isIdentifierRepairHint(explicitSource) || isGenericSourceHint(explicitSource) || explicitSource === status.project_note)) {
      return costInfraHint;
    }
    if (isIdentifierRepairHint(explicitSource) && (status.project_note || risk.project_note)) {
      return status.project_note || risk.project_note || "";
    }
  }
  return explicitSource || status.project_note || risk.project_note || "";
}

function isAcknowledgedConstructionSignal(status) {
  return status.stage_alignment_interpretation === "acknowledged_construction_signal";
}

function determineTrack({ status, potential, risk, task, ledgerRows }) {
  const taskType = task.task_type || task.action_mode || "";
  const hasStageAheadSignal =
    status.business_layer_alignment_status === "stage_ahead_of_matrix" && !isAcknowledgedConstructionSignal(status);
  const hasSourceLink = Number(status.source_link_items || 0) > 0;
  const hasManyMissing = Number(status.missing_value_items || 0) >= 7;
  const hasLowConfidence = Number(potential.confidence_score || 0) < 6;
  const hasSourceBlockingStatus = ledgerRows.some((row) =>
    [
      "source_link_required",
      "source_definition_split_required",
      "source_date_split_required",
      "ocr_source_value_update_required",
      "ocr_partial_confirmation_pending",
      "source_value_fill_missing_required",
      "no_source_text",
    ].includes(row.verification_status),
  );

  if (hasStageAheadSignal || SOURCE_FIRST_TASKS.has(taskType) || hasSourceLink || hasManyMissing || hasLowConfidence || hasSourceBlockingStatus) {
    return "원문 확정";
  }
  if (hasCostInfraSignal({ risk, task })) {
    return "비용/기반시설 대조";
  }
  if (Number(status.p0_tasks || 0) === 0 && hasFieldWalkSignal({ potential, risk })) {
    return "현장 동선 확인";
  }
  if (Number(status.p0_tasks || 0) === 0 && hasPolicyWatchSignal({ potential })) {
    return "정책/공공개발 모니터링";
  }
  if (hasFieldWalkSignal({ potential, risk })) {
    return "현장 동선 확인";
  }
  if (hasPolicyWatchSignal({ potential })) {
    return "정책/공공개발 모니터링";
  }
  return "정기 추적";
}

function recommendedMove({ track, status, potential, risk, task, ledgerRows }) {
  const openSource = firstSourceToOpen({ track, status, task, risk });
  if (track === "원문 확정") {
    if (isAcknowledgedConstructionSignal(status)) {
      return compactList([
        `사업시행 direct 원문과 ${status.business_layer_stage || "후속 단계"} 공개신호 병기 상태를 유지`,
        "직접 착공신고 원문·recordCode 보강은 후속 보강 항목으로 관리",
        openSource ? `열 자료: ${openSource}` : "",
      ]);
    }
    if (status.business_layer_alignment_status === "stage_ahead_of_matrix") {
      return compactList([
        `정보몽땅 추진경과의 ${status.business_layer_stage || "후속 단계"} 공개 신호와 비교표 현재 단계 ${status.current_stage || ""} 차이를 공식 원문 기준으로 재판정`,
        status.business_layer_alignment_note ? `판정 메모: ${status.business_layer_alignment_note}` : "",
        openSource ? `열 자료: ${openSource}` : "",
      ]);
    }
    const fields = topLedgerFields(ledgerRows, [
      "source_link_required",
      "source_definition_split_required",
      "source_date_split_required",
      "ocr_source_value_update_required",
      "ocr_partial_confirmation_pending",
      "source_value_fill_missing_required",
      "value_missing",
      "no_source_text",
    ]);
    const taskType = task.task_type || task.action_mode || "";
    const sourceTaskTitle = SOURCE_FIRST_TASKS.has(taskType) ? `${task.task_title || task.action_label || "원문 실행 큐"} 처리` : "원문 수치 병목 정리";
    return compactList([
      sourceTaskTitle,
      fields ? `우선 필드: ${fields}` : "",
      openSource ? `열 자료: ${openSource}` : "",
    ]);
  }
  if (track === "비용/기반시설 대조") {
    return compactList([
      status.next_action || risk.next_action || "분담금/사업비/기반시설 공개항목을 원문 수치와 연결",
      risk.top_public_items ? `공개항목: ${risk.top_public_items}` : "",
      openSource ? `열 자료: ${openSource}` : "",
    ]);
  }
  if (track === "현장 동선 확인") {
    return compactList([
      `현장축: ${potential.mobility_axis || risk.mobility_axis || ""}`,
      risk.mobility_risks ? `볼 것: ${risk.mobility_risks}` : "",
      "역 출구-단지 경계-한강/간선도로 단절을 사진과 메모로 남김",
    ]);
  }
  if (track === "정책/공공개발 모니터링") {
    return compactList([
      potential.upside_watch,
      `재평가: ${potential.revisit_trigger || "도시계획/고시 갱신 시"}`,
      "공식 업데이트 레지스트리의 주간 점검 대상에 유지",
    ]);
  }
  return compactList([
    "단계 변경, 공개자료 수 증가, 사업개요 수치 변경만 정기 확인",
    potential.revisit_trigger,
  ]);
}

function buildRows({ statusRows, potentialByRank, riskByRank, queueByRank, ledgerByRank, closureByRankField, sourceLinkClosureByRank }) {
  return statusRows
    .map((status) => {
      const rank = String(status.rank);
      const potential = potentialByRank[rank] || {};
      const risk = riskByRank[rank] || {};
      const tasks = queueByRank[rank] || [];
      const ledgerRows = effectiveLedgerRows(ledgerByRank[rank] || [], closureByRankField, sourceLinkClosureByRank);
      const task = topQueue(tasks);
      const track = determineTrack({ status, potential, risk, task, ledgerRows });
      const sourceBlockers = countRows(ledgerRows, (row) =>
        [
          "source_link_required",
          "source_definition_split_required",
          "source_date_split_required",
          "ocr_source_value_update_required",
          "ocr_partial_confirmation_pending",
          "source_value_fill_missing_required",
          "value_missing",
          "no_source_text",
        ].includes(row.verification_status),
      );
      const confirmedItems = countRows(ledgerRows, (row) =>
        [
          "closed_confirmed",
          "confirmed_from_original_notice",
          "confirmed_from_ocr_image",
          "resolved_by_management_stage_report",
          "fact_check_report_available",
        ].includes(row.verification_status),
      );
      const confidenceGap = round(Number(potential.long_term_potential_score || 0) - Number(potential.confidence_score || 0));
      const stageAheadPenalty =
        status.business_layer_alignment_status === "stage_ahead_of_matrix" && !isAcknowledgedConstructionSignal(status) ? 140 : 0;
      const moveScore = round(
        Number(potential.research_priority_score || 0) * 100 +
          Number(status.p0_tasks || 0) * 90 +
          Number(status.p1_tasks || 0) * 40 +
          sourceBlockers * 12 +
          Math.max(confidenceGap, 0) * 25 +
          (RISK_WEIGHT[status.risk_signal_level] || 0) +
          (6 - Math.min(Number(status.source_coverage_score || 0), 6)) * 15 -
          confirmedItems * 2 +
          stageAheadPenalty,
      );
      return {
        rank,
        focus_area: status.focus_area,
        district: status.district,
        project_name: status.project_name,
        current_stage: status.current_stage,
        track,
        move_score: moveScore,
        risk_signal_level: status.risk_signal_level,
        evidence_grade: status.evidence_grade,
        long_term_potential_score: potential.long_term_potential_score ?? "",
        confidence_score: potential.confidence_score ?? "",
        confidence_gap: confidenceGap,
        research_priority_score: potential.research_priority_score ?? "",
        p0_tasks: status.p0_tasks,
        p1_tasks: status.p1_tasks,
        source_blockers: sourceBlockers,
        confirmed_items: confirmedItems,
        business_layer_stage: status.business_layer_stage || "",
        business_layer_alignment_status: status.business_layer_alignment_status || "",
        business_layer_alignment_note: status.business_layer_alignment_note || "",
        next_task_priority: task.priority || status.next_task_priority || "",
        next_task_type: task.task_type || task.action_mode || status.next_task_type || "",
        next_task_title: task.task_title || task.action_label || status.next_task_title || "",
        recommended_move: recommendedMove({ track, status, potential, risk, task, ledgerRows }),
        first_source_to_open: firstSourceToOpen({ track, status, task, risk }),
        upside_watch: potential.upside_watch || "",
        downside_watch: potential.downside_watch || "",
        revisit_trigger: potential.revisit_trigger || "",
        project_note: status.project_note || potential.project_note || "",
      };
    })
    .sort((a, b) =>
      a.focus_area.localeCompare(b.focus_area) ||
      (TRACK_ORDER[a.track] || 99) - (TRACK_ORDER[b.track] || 99) ||
      b.move_score - a.move_score ||
      Number(a.rank) - Number(b.rank),
    );
}

function focusSummary(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.focus_area]) acc[row.focus_area] = [];
    acc[row.focus_area].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([focus_area, items]) => {
    const top = [...items].sort((a, b) => b.move_score - a.move_score)[0];
    const tracks = countBy(items, "track");
    return {
      focus_area,
      project_count: items.length,
      avg_move_score: round(items.reduce((sum, row) => sum + Number(row.move_score || 0), 0) / items.length),
      source_first: tracks["원문 확정"] || 0,
      cost_infra: tracks["비용/기반시설 대조"] || 0,
      field_walk: tracks["현장 동선 확인"] || 0,
      policy_watch: tracks["정책/공공개발 모니터링"] || 0,
      first_move: `${top.rank}. ${top.project_name}`,
      first_track: top.track,
    };
  });
}

function trackSummary(rows) {
  return Object.entries(countBy(rows, "track"))
    .map(([track, count]) => {
      const top = rows.filter((row) => row.track === track).sort((a, b) => b.move_score - a.move_score)[0];
      return {
        track,
        count,
        top_project: `${top.rank}. ${top.project_name}`,
        top_move: top.recommended_move,
      };
    })
    .sort((a, b) => (TRACK_ORDER[a.track] || 99) - (TRACK_ORDER[b.track] || 99));
}

function markdown(rows) {
  const topMoves = [...rows].sort((a, b) => b.move_score - a.move_score || Number(a.rank) - Number(b.rank)).slice(0, 12);
  const lowConfidenceHighPotential = [...rows]
    .filter((row) => Number(row.long_term_potential_score || 0) >= 7 && Number(row.confidence_score || 0) < 6.5)
    .sort((a, b) => b.confidence_gap - a.confidence_gap || b.move_score - a.move_score);

  return `# 다음 리서치 액션 보드

작성 기준: ${kstDate()} KST

이 문서는 장기 가능성 점수카드, 리서치 상태판, 원문 수치 장부, 원문 검증 큐를 합쳐 이번에 무엇을 먼저 볼지 정하는 실행 보드다. 투자 추천이 아니라 공식 원문 기반 리서치 순서표다.

## 한눈에 보기

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${rows.length} |
| 원문 확정 트랙 | ${rows.filter((row) => row.track === "원문 확정").length} |
| 비용/기반시설 대조 트랙 | ${rows.filter((row) => row.track === "비용/기반시설 대조").length} |
| 현장 동선 확인 트랙 | ${rows.filter((row) => row.track === "현장 동선 확인").length} |
| 정책/공공개발 모니터링 트랙 | ${rows.filter((row) => row.track === "정책/공공개발 모니터링").length} |
| 정기 추적 트랙 | ${rows.filter((row) => row.track === "정기 추적").length} |
| 장기잠재 7점 이상·확신도 6.5 미만 | ${lowConfidenceHighPotential.length} |

## 생활권별 첫 액션

${mdTable(focusSummary(rows), [
  { key: "focus_area", label: "생활권" },
  { key: "project_count", label: "후보" },
  { key: "avg_move_score", label: "평균 액션점수" },
  { key: "source_first", label: "원문확정" },
  { key: "cost_infra", label: "비용/기반시설" },
  { key: "field_walk", label: "현장동선" },
  { key: "policy_watch", label: "정책모니터" },
  { key: "first_move", label: "첫 사업" },
  { key: "first_track", label: "첫 트랙" },
])}

## 트랙별 운영

${mdTable(trackSummary(rows), [
  { key: "track", label: "트랙" },
  { key: "count", label: "사업장" },
  { key: "top_project", label: "대표 사업" },
  { key: "top_move", label: "대표 액션" },
])}

## 이번에 먼저 볼 12개

${mdTable(topMoves, [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "track", label: "트랙" },
  { key: "move_score", label: "액션점수" },
  { key: "risk_signal_level", label: "리스크" },
  { key: "long_term_potential_score", label: "장기잠재" },
  { key: "confidence_score", label: "확신도" },
  { key: "source_blockers", label: "원문병목" },
  { key: "recommended_move", label: "이번 액션" },
])}

## 장기 가설은 좋지만 확신도가 낮은 후보

${mdTable(lowConfidenceHighPotential.slice(0, 12), [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "long_term_potential_score", label: "장기잠재" },
  { key: "confidence_score", label: "확신도" },
  { key: "confidence_gap", label: "격차" },
  { key: "source_blockers", label: "원문병목" },
  { key: "recommended_move", label: "확신도 올릴 작업" },
])}

## 전체 액션 목록

${mdTable(rows, [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "track", label: "트랙" },
  { key: "move_score", label: "액션점수" },
  { key: "next_task_priority", label: "큐" },
  { key: "next_task_title", label: "큐 작업" },
  { key: "first_source_to_open", label: "먼저 열 자료" },
  { key: "project_note", label: "메모" },
])}

## 사용법

1. \`이번에 먼저 볼 12개\`에서 한 사업을 고른 뒤 \`먼저 열 자료\`와 사업별 메모를 연다.
2. \`원문 확정\` 트랙은 장기 가설보다 공식 수치 신뢰도 보강이 먼저다.
3. \`비용/기반시설 대조\` 트랙은 공개항목 제목만 보지 말고 원문 수치와 사업별 메모의 리스크 문장을 연결한다.
4. \`현장 동선 확인\`은 역 출구, 단지 경계, 한강/간선도로 단절, 버스 환승을 같은 루트로 기록한다.
5. 확인이 끝나면 원문 장부나 사업별 메모를 고친 뒤 전체 재생성을 실행한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [statusRows, potentialRows, riskRows, queueInput, ledgerRows, closureLedgerInput] = await Promise.all([
    readJson(STATUS_INPUT),
    readJson(POTENTIAL_INPUT),
    readJson(RISK_INPUT),
    readJson(QUEUE_INPUT),
    readJson(LEDGER_INPUT),
    readJson(CLOSURE_LEDGER_INPUT),
  ]);
  const queueRows = readRows(queueInput);
  const closureRows = readRows(closureLedgerInput);
  const closureByRankField = buildClosureByRankField(closureRows);
  const sourceLinkClosureByRank = buildSourceLinkClosureByRank(closureRows);
  const rows = buildRows({
    statusRows,
    potentialByRank: byRank(potentialRows),
    riskByRank: byRank(riskRows),
    queueByRank: groupByRank(queueRows),
    ledgerByRank: groupByRank(ledgerRows),
    closureByRankField,
    sourceLinkClosureByRank,
  });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(JSON.stringify({
    rows: rows.length,
    tracks: countBy(rows, "track"),
    output: "analysis/research-next-moves.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
