#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "personal-research-home.md");
const OUT_CSV = path.join(OUT_DIR, "personal-research-home.csv");
const OUT_JSON = path.join(OUT_DIR, "personal-research-home.json");

const INPUTS = {
  strategicBrief: "analysis/strategic-research-brief.json",
  focusComparisonBrief: "analysis/focus-area-comparison-brief.json",
  focusEvidenceRiskHeatmap: "analysis/focus-area-evidence-risk-heatmap.json",
  focusAreaDecisionMemo: "analysis/focus-area-decision-memo.json",
  focusProjectMonitoringBoard: "analysis/focus-project-monitoring-board.json",
  focusProjectWeeklyMonitoringCockpit: "analysis/focus-project-weekly-monitoring-cockpit.json",
  expansionZoneWeeklyMonitoringCockpit: "analysis/expansion-zone-weekly-monitoring-cockpit.json",
  focusProjectFieldworkCockpit: "analysis/focus-project-fieldwork-cockpit.json",
  focusProjectPairComparisonBoard: "analysis/focus-project-pair-comparison-board.json",
  weeklyMonitoringHistory: "analysis/weekly-monitoring-history.json",
  weeklyMonitoringComparisonBoard: "analysis/weekly-monitoring-comparison-board.json",
  lifeAreaMonitoringBoard: "analysis/life-area-monitoring-board.json",
  nextMoves: "analysis/research-next-moves.json",
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
  projectEvidenceBinder: "analysis/project-evidence-binder.json",
  projectDueDiligenceBoard: "analysis/project-due-diligence-board.json",
  artifactDependencyMap: "analysis/research-artifact-dependency-map.json",
  updateImpactLedger: "analysis/update-impact-ledger.json",
  catalystTriggerMatrix: "analysis/catalyst-trigger-matrix.json",
  officialContextSearchQueue: "analysis/official-context-search-queue.json",
  officialContextSearchResultsBoard: "analysis/official-context-search-results-board.json",
  officialContextImpactBoard: "analysis/official-context-impact-board.json",
  officialChangeDetectionBoard: "analysis/official-change-detection-board.json",
  officialUpdateIntakeBoard: "analysis/official-update-intake-board.json",
  officialUpdateSourceVerificationBridge: "analysis/official-update-source-verification-bridge.json",
  officialUpdateScenarioPlaybook: "analysis/official-update-scenario-playbook.json",
  coreExpansionResearchSpine: "analysis/core-expansion-research-spine.json",
  expansionInterestZoneBrief: "analysis/expansion-interest-zone-brief.json",
  expansionInterestZoneCandidateBrief: "analysis/expansion-interest-zone-candidate-brief.json",
  expansionInterestZoneShortlist: "analysis/expansion-interest-zone-shortlist.json",
  expansionUrbanNoticeCollectionQueue: "analysis/expansion-urban-notice-collection-queue.json",
  expansionLatestCheckAudit: "analysis/expansion-official-latest-check-audit.json",
  representativeLotFallbackFindingBoard: "analysis/representative-lot-fallback-finding-board.json",
  representativeLotFallbackEdgeSessionPacket: "analysis/representative-lot-fallback-edge-session-packet.json",
  researchSessionPlaybook: "analysis/research-session-playbook.json",
  sourceFreshnessLedger: "analysis/official-source-freshness-ledger.json",
  sourceActivationChecklist: "analysis/official-source-activation-checklist.json",
  deepDiveQueue: "analysis/focus-deep-dive-queue.json",
  fieldworkRoutes: "analysis/fieldwork-route-planner.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
  filingChecklist: "analysis/high-blocking-filing-checklist.json",
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  submissionApprovalBoard: "analysis/high-blocking-submission-approval-board.json",
  updateRunbookChecklist: "analysis/official-update-runbook-checklist.json",
  goalAudit: "analysis/research-goal-completion-audit.json",
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

function topBy(rows, field, limit) {
  return [...rows].sort((a, b) => Number(b[field] || 0) - Number(a[field] || 0)).slice(0, limit);
}

function firstByGroup(rows, groupField, sortField) {
  const groups = new Map();
  for (const row of [...rows].sort((a, b) => Number(b[sortField] || 0) - Number(a[sortField] || 0))) {
    const key = row[groupField] || "미분류";
    if (!groups.has(key)) groups.set(key, row);
  }
  return [...groups.values()];
}

function compact(value, limit = 180) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function earliestDate(values) {
  const filtered = values.map((value) => String(value || "").trim()).filter(Boolean).sort();
  return filtered[0] || "";
}

function fallbackStatusRank(row) {
  if (row.board_status === "ready_to_promote") return 7;
  if (row.board_status === "unreviewed" && row.candidate_relation === "same_stage_candidate") return 6;
  if (row.board_status === "candidate_review_needed") return 5;
  if (row.board_status === "retry_needed") return 4;
  if (row.board_status === "unreviewed") return 3;
  if (row.board_status === "hold_by_stage_gap") return 2;
  if (row.board_status === "hold_planning_layer") return 1;
  if (row.board_status === "candidate_rejected") return 0;
  if (row.board_status === "applied") return -1;
  return 0;
}

function uniqueTodayRows(rows, limit = 12) {
  const seen = new Set();
  const unique = [];
  for (const row of rows) {
    const key = `${row.rank}:${row.project_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
    if (unique.length >= limit) break;
  }
  return unique;
}

function buildHome({
  strategicBrief,
  nextMoves,
  deepDiveQueue,
  fieldworkRoutes,
  completionCockpit,
  filingChecklist,
  filingTracker,
  updateRunbookChecklist,
  goalAudit,
  focusProjectPairComparisonBoard,
  coreExpansionResearchSpine,
  expansionInterestZoneBrief,
  expansionInterestZoneCandidateBrief,
  expansionInterestZoneShortlist,
  expansionUrbanNoticeCollectionQueue,
  expansionZoneWeeklyMonitoringCockpit,
  expansionLatestCheckAudit,
  representativeLotFallbackFindingBoard,
  representativeLotFallbackEdgeSessionPacket,
}) {
  const focusRows = strategicBrief.focus_rows || [];
  const nextMoveRows = Array.isArray(nextMoves) ? nextMoves : [];
  const deepDiveRows = deepDiveQueue.rows || [];
  const fieldworkRows = Array.isArray(fieldworkRoutes) ? fieldworkRoutes : [];
  const completionRows = completionCockpit.rows || [];
  const filingRows = filingChecklist.rows || [];
  const filingTrackerRows = filingTracker.rows || [];
  const runbooks = updateRunbookChecklist.selectedRunbooks || [];
  const pairBoardSummary = focusProjectPairComparisonBoard.summary || {};
  const topActions = (strategicBrief.top_actions || []).slice(0, 8);
  const topPotential = (strategicBrief.top_projects || []).slice(0, 8);
  const expansionZoneRows = expansionInterestZoneBrief.rows || [];
  const expansionCandidateRows = expansionInterestZoneCandidateBrief.rows || [];
  const expansionShortlistRows = expansionInterestZoneShortlist.rows || [];
  const expansionNoticeQueueSummary = expansionUrbanNoticeCollectionQueue.summary || {};
  const expansionWeeklySummary = expansionZoneWeeklyMonitoringCockpit.summary || {};
  const expansionLatestCheckSummary = expansionLatestCheckAudit.summary || {};
  const coreExpansionSpineRows = coreExpansionResearchSpine.rows || [];
  const fallbackFindingSummary = representativeLotFallbackFindingBoard.summary || {};
  const fallbackFindingRows = representativeLotFallbackFindingBoard.rows || [];
  const fallbackEdgeRowsByRank = new Map(
    (representativeLotFallbackEdgeSessionPacket.rows || []).map((row) => [String(row.target || "").match(/^(\d+)\./)?.[1] || "", row]),
  );
  const fallbackTodayRows = fallbackFindingRows
    .filter((row) => row.board_status !== "applied")
    .sort((left, right) => {
      const leftPacket = fallbackEdgeRowsByRank.get(String(left.rank || "")) || {};
      const rightPacket = fallbackEdgeRowsByRank.get(String(right.rank || "")) || {};
      const statusDelta = fallbackStatusRank(right) - fallbackStatusRank(left);
      if (statusDelta !== 0) return statusDelta;
      const packetDelta = Number(rightPacket.priority_score || 0) - Number(leftPacket.priority_score || 0);
      if (packetDelta !== 0) return packetDelta;
      return Number(left.rank || 9999) - Number(right.rank || 9999);
    })
    .slice(0, 4)
    .map((row) => {
      const packetRow = fallbackEdgeRowsByRank.get(String(row.rank || "")) || {};
      return {
        lane: "presentSn 클로저",
        focus_area: row.focus_area,
        rank: row.rank,
        project_name: row.project_name,
        track: row.board_status === "ready_to_promote" ? "승격 대기" : "current business 식별자",
        score: Number(packetRow.priority_score || 0) || 900,
        open_file: "analysis/representative-lot-fallback-edge-session-packet.md",
        first_source: packetRow.first_action || row.probe_key || "recordCode popup -> 대표지번/PNU -> UQ120 후보 비교",
        next_step:
          row.board_status === "ready_to_promote"
            ? "확인된 presentSn와 데이터 기준일이 비교표/사업노트에 반영됐는지 확인하고 applied로 승격"
            : packetRow.change_signals || "presentSn, 데이터 기준일, 사업유형, 정보몽땅 연결 URL을 한 번에 확인",
      };
    });

  const focusHomeRows = focusRows.map((row) => ({
    focus_area: row.focus_area,
    thesis: row.strategic_thesis,
    decision_question: row.decision_question,
    first_action_project: row.first_action_project,
    first_action_track: row.first_action_track,
    first_action: row.first_action,
    first_route: row.first_fieldwork_route,
    update_runbook: row.update_runbook,
    source_blockers: row.source_blockers,
    risk_mix: row.risk_mix,
  }));

  const todayRows = uniqueTodayRows([
    ...fallbackTodayRows,
    ...topBy(nextMoveRows, "move_score", 6).map((row) => ({
      lane: "이번 액션",
      focus_area: row.focus_area,
      rank: row.rank,
      project_name: row.project_name,
      track: row.track,
      score: row.move_score,
      open_file: row.project_note,
      first_source: row.first_source_to_open,
      next_step: row.recommended_move,
    })),
    ...topBy(deepDiveRows, "deep_dive_priority_score", 6).map((row) => ({
      lane: "딥다이브",
      focus_area: row.focus_area,
      rank: row.rank,
      project_name: row.project_name,
      track: row.deep_dive_track,
      score: row.deep_dive_priority_score,
      open_file: row.project_note,
      first_source: row.first_source_to_open,
      next_step: row.deep_dive_question,
    })),
  ]);

  const routeRows = firstByGroup(fieldworkRows, "route_id", "fieldwork_priority")
    .sort((a, b) => Number(b.fieldwork_priority || 0) - Number(a.fieldwork_priority || 0))
    .slice(0, 6)
    .map((row) => ({
      route_name: row.route_name,
      focus_area: row.focus_area,
      first_project: `${row.rank}. ${row.project_name}`,
      fieldwork_priority: row.fieldwork_priority,
      onsite_checks: row.onsite_checks,
      official_before_visit: row.official_before_visit,
      project_note: row.project_note,
    }));

  const p0Rows = completionRows
    .filter((row) => row.priority === "P0")
    .map((row) => ({
      task_id: row.task_id,
      status: row.status,
      source_file: row.source_file,
      update_file: row.update_file,
      required_evidence: row.required_evidence,
      next_action: row.next_action,
    }));

  const filingHomeRows = filingRows.map((row) => ({
    rank: row.rank,
    project_name: row.project_name,
    checklist_status: row.checklist_status,
    remaining_gap: row.remaining_gap,
    outbox_file: row.outbox_file,
    mark_filed_command: row.mark_filed_command,
    next_step: row.next_step,
  }));

  const runbookRows = runbooks
    .filter((row) =>
      [
        "weekly_primary_refresh",
        "expansion_zone_latest_check",
        "high_blocking_filing_submission",
        "high_blocking_contact_escalation",
        "monthly_context_scan",
        "monthly_market_data_refresh",
      ].includes(row.runbook_id),
    )
    .map((row) => ({
      runbook_id: row.runbook_id,
      cadence: row.cadence,
      trigger: row.trigger,
      network_required: row.network_required,
      first_outputs_to_read: row.first_outputs_to_read,
      decision_rule: row.decision_rule,
    }));

  const csvRows = [
    ...focusHomeRows.map((row) => ({ section: "focus_area", item: row.focus_area, priority: "", file: "analysis/strategic-research-brief.md", action: row.first_action, note: row.decision_question })),
    ...todayRows.map((row) => ({ section: row.lane, item: `${row.rank}. ${row.project_name}`, priority: row.score, file: row.open_file, action: row.next_step, note: row.first_source })),
    ...p0Rows.map((row) => ({ section: "completion_p0", item: row.task_id, priority: "P0", file: row.source_file, action: row.next_action, note: row.required_evidence })),
    ...filingHomeRows.map((row) => ({ section: "filing", item: `${row.rank}. ${row.project_name}`, priority: row.checklist_status, file: row.outbox_file, action: row.next_step, note: row.remaining_gap })),
    ...routeRows.map((row) => ({ section: "fieldwork_route", item: row.route_name, priority: row.fieldwork_priority, file: row.project_note, action: row.onsite_checks, note: row.official_before_visit })),
    ...runbookRows.map((row) => ({ section: "runbook", item: row.runbook_id, priority: row.cadence, file: row.first_outputs_to_read, action: row.trigger, note: row.decision_rule })),
  ];

  const summary = {
    generated_at: `${kstDate()} KST`,
    final_verdict: goalAudit.summary?.final_verdict || "",
    focus_area_count: focusHomeRows.length,
    expansion_zone_count: expansionZoneRows.length,
    expansion_candidate_count: expansionCandidateRows.length,
    expansion_shortlist_count: expansionShortlistRows.length,
    expansion_notice_fetch_ready_count: expansionNoticeQueueSummary.fetch_ready_count || 0,
    expansion_notice_detail_count: expansionNoticeQueueSummary.detail_fetched_count || 0,
    expansion_due_this_week_count: expansionWeeklySummary.due_this_week_count || 0,
    expansion_latest_stage_gap_count: expansionWeeklySummary.latest_stage_gap_project_count || 0,
    expansion_verified_result_count: expansionLatestCheckSummary.verified_result_count || 0,
    expansion_verified_no_result_count: expansionLatestCheckSummary.verified_no_result_count || 0,
    expansion_blocked_popup_count: expansionLatestCheckSummary.blocked_direct_popup_count || 0,
    fallback_project_count: fallbackFindingSummary.project_count || 0,
    fallback_unreviewed_count: fallbackFindingSummary.unreviewed_count || 0,
    fallback_ready_to_promote_count: fallbackFindingSummary.ready_to_promote_count || 0,
    core_expansion_spine_count: coreExpansionSpineRows.length,
    top_action_count: topActions.length,
    top_potential_count: topPotential.length,
    today_row_count: todayRows.length,
    p0_count: p0Rows.length,
    filing_ready_count: filingRows.filter((row) => row.checklist_status === "ready_to_submit").length,
    external_waiting_count: filingTracker.summary?.filed_waiting_count || 0,
    external_wait_next_check_date: earliestDate(filingTrackerRows.map((row) => row.next_check_date)),
    route_count: routeRows.length,
    pair_ready_count: pairBoardSummary.ready_to_compare_count || 0,
    pair_recorded_count: pairBoardSummary.recorded_comparison_count || 0,
    runbook_count: runbookRows.length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  return {
    summary,
    focusHomeRows,
    todayRows,
    topPotential,
    p0Rows,
    filingHomeRows,
    routeRows,
    runbookRows,
    csvRows,
  };
}

function markdown(data) {
  const { summary, focusHomeRows, todayRows, topPotential, p0Rows, filingHomeRows, routeRows, runbookRows } = data;
  return `# 개인 리서치 홈

작성 기준: ${kstDate()} KST

이 문서는 강남·잠실/송파·구의/광진 재개발·재건축 리서치를 시작할 때 가장 먼저 여는 홈 화면이다. 투자 추천이 아니라, 공식 원문·현장 답사·시장 신호·업데이트 감시를 어떤 순서로 볼지 정리한다.

## 현재 판정

| 항목 | 값 |
| --- | ---: |
| goal 완료 판정 | ${summary.final_verdict || "미확인"} |
| 생활권 | ${summary.focus_area_count} |
| 확장 관심권 | ${summary.expansion_zone_count} |
| 확장 후보 seed | ${summary.expansion_candidate_count} |
| 확장 shortlist | ${summary.expansion_shortlist_count} |
| 확장 원문 fetch 대기 | ${summary.expansion_notice_fetch_ready_count} |
| 확장 원문 detail 확보 | ${summary.expansion_notice_detail_count} |
| 확장 이번 주 점검 | ${summary.expansion_due_this_week_count} |
| 강동 latest_stage_gap | ${summary.expansion_latest_stage_gap_count} |
| 확장 direct hit 확인 | ${summary.expansion_verified_result_count} |
| 확장 direct hit 미확인 | ${summary.expansion_verified_no_result_count} |
| popup 직접 접근 차단 | ${summary.expansion_blocked_popup_count} |
| 대표지번 fallback only | ${summary.fallback_project_count} |
| fallback 미확인 | ${summary.fallback_unreviewed_count} |
| fallback 승격 대기 | ${summary.fallback_ready_to_promote_count} |
| 통합 비교 spine | ${summary.core_expansion_spine_count} |
| 오늘 열 항목 | ${summary.today_row_count} |
| P0 완료 병목 | ${summary.p0_count} |
| 정보공개/공식 민원 접수 준비 | ${summary.filing_ready_count} |
| 외부 회신 대기 | ${summary.external_waiting_count} |
| 외부 회신 다음 점검일 | ${summary.external_wait_next_check_date || "미정"} |
| 우선 답사 루트 | ${summary.route_count} |
| 같은 날 비교 준비 | ${summary.pair_ready_count} |
| 기록된 비교 메모 | ${summary.pair_recorded_count} |

현재 운영 판단은 단순하다. 외부 회신 3건은 이미 접수돼 있으므로 ${summary.external_wait_next_check_date || "다음 점검일"} 전에는 새 응답이 오지 않는 한 추가 제출보다 대기 관리가 우선이다. 대신 바로 움직일 수 있는 일은 확장 관심권 최신 단계 재확인, 핵심 생활권 비교${summary.fallback_unreviewed_count + summary.fallback_ready_to_promote_count > 0 ? ", 대표지번 fallback current business presentSn 클로저" : ""}, 현장 답사 메모 보강이다. 브라우저를 열고 바로 움직일 때는 \`analysis/research-manual-web-session-packet.md\`, \`analysis/representative-lot-fallback-edge-session-packet.md\`, \`analysis/representative-lot-fallback-finding-board.md\`, \`analysis/official-web-query-registry.md\`를 같이 보면 된다. 확장권 시장 범위를 분리 운영하려면 \`analysis/expansion-market-scope-workbook.md\`, 정규화 커버 상태를 보려면 \`analysis/expansion-market-normalized-summary.md\`, 실제 가격·전월세 시그널을 읽으려면 \`analysis/expansion-market-signal-summary.md\`, 핵심/확장 5축을 한 표로 비교하려면 \`analysis/life-area-market-baseline-board.md\`, 실제 수집 순서를 보려면 \`analysis/expansion-market-first-download-packet.md\`, 첫 세션 10개만 바로 닫으려면 \`analysis/expansion-market-quickstart-packet.md\`, 세션 단위로 전체 latest-window를 받으려면 \`analysis/expansion-market-download-session-packet.md\`를 먼저 연다.

## 먼저 열 파일

1. \`analysis/current-research-operating-guide.md\`: 지금 시점 기준 운영 상태, 시작 순서, 생활권별 해석, 외부 회신 대기 항목
2. \`analysis/research-now-action-board.md\`: 오늘 바로 할 일, 수동 웹 확인, 날짜 대기선을 분리한 한 장짜리 실행 보드
3. \`analysis/representative-lot-fallback-edge-session-packet.md\`: fallback 6건의 recordCode popup -> 대표지번/PNU -> UQ120 후보 확인 순서를 바로 여는 세션 패킷
4. \`analysis/representative-lot-fallback-finding-board.md\`: fallback 6건의 확인 결과를 승격/보류 상태로 보는 보드
5. \`analysis/life-area-core-project-one-page.md\`: 장미1,2,3차·압구정3·잠실우성4차·한양연립을 한 장으로 비교
6. \`analysis/current-research-snapshot.md\`: 핵심 3생활권, 확장 2권역, 핵심 사업 4개의 현재 판단을 한 번에 보는 스냅샷
5. \`analysis/core-expansion-research-spine.md\`: 핵심 생활권 anchor와 확장 관심권 7건을 한 판에서 비교하는 spine
6. \`analysis/life-area-extended-comparison-board.md\`: 핵심 3생활권과 확장 2권역을 같은 문장 구조로 비교하는 상위 보드
7. \`analysis/life-area-market-reaction-brief.md\`: 핵심 3생활권 시장 신호와 확장권 baseline 커버를 같은 규칙으로 읽는 generated 브리프
8. \`analysis/expansion-zone-weekly-monitoring-cockpit.md\`: 강동권 단계 신호 확인과 약수권 direct hit 루프를 한 장으로 보는 확장 주간 실행판
9. \`analysis/expansion-official-latest-check-audit.md\`: 서울도시공간포털 정비사업구역계 진입 페이지 검색 결과와 popup 직접 접근 차단 여부를 먼저 확인하는 감사표
10. \`analysis/expansion-zone-latest-check-guide.md\`: 강동권은 단계 공백, 약수권은 confirmed 기준값 유지 관점에서 보는 실전 최신 확인 가이드
11. \`analysis/expansion-zone-monitoring-checklist.md\`: 강동권/약수권 주간 최신 점검을 그대로 따라가는 실행 체크리스트
12. \`analysis/expansion-zone-intake-seed-board.md\`: 강동권 새 row 생성 seed와 약수권 기존 row 재사용 기준을 바로 복붙하는 intake 출발 보드
13. \`analysis/expansion-market-scope-workbook.md\`: 강동권·약수동 주변의 시장 법정동 scope, source/window 구조, 분리 운영 원칙
14. \`analysis/expansion-market-normalized-summary.md\`: 확장 6개 scope에 latest-window 정규화 거래가 모두 들어왔는지 보는 행·source 요약
15. \`analysis/expansion-market-signal-summary.md\`: 강동권·약수권 2권역과 6개 법정동의 매매·전월세 중위값과 최근성을 읽는 시그널 요약
16. \`analysis/life-area-market-baseline-board.md\`: 핵심 3생활권 full-chain과 확장 2권역 latest-window baseline을 같은 표에서 읽는 시장 기준 비교 보드
17. \`analysis/expansion-market-first-download-packet.md\`: 확장권 시장 90개 raw task를 최신 window 우선 묶음으로 압축한 실행 패킷
18. \`analysis/expansion-market-quickstart-packet.md\`: 천호동·길동 10개 task부터 바로 닫는 first-session 패킷
19. \`analysis/expansion-market-download-session-packet.md\`: 확장권 latest-window 30개를 세션 단위로 바로 처리하는 다운로드 패킷
20. \`analysis/expansion-market-download-status.md\`: 확장권 latest-window 30개 파일 존재와 intake 기록 상태
21. \`data/market/manual-import/expansion-download-intake.json\`: 확장권 latest-window 30개 task의 copy-ready intake 템플릿
22. \`analysis/expansion-interest-zone-brief.md\`: 강동권·약수동 주변의 공식 채널, 비교축, 편입 조건
23. \`analysis/expansion-interest-zone-candidate-brief.md\`: 강동권·약수동 주변 검색 seed, 공식 채널, 승격 gate
24. \`analysis/expansion-interest-zone-shortlist.md\`: 공식 카드에서 사업명·고시번호·고시일이 확인된 확장 관심권 shortlist
25. \`analysis/expansion-urban-notice-collection-queue.md\`: 확장 shortlist를 서울도시공간포털 원문 수집기로 바로 태우는 실행 큐
26. \`analysis/expansion-urban-notice-review-board.md\`: 강동권 4건과 약수권 3건을 모두 confirmed snapshot 기준으로 묶은 원문 리뷰 보드
27. \`analysis/expansion-yaksu-ocr-recheck-board.md\`: 약수권 3건의 OCR 잠정값을 원문 이미지 기준으로 닫은 재대조 근거 보드
28. \`analysis/expansion-gangdong-stage-watch-board.md\`: 강동권 4건의 최신 공개 단계 신호와 재확인 우선순위를 묶은 추적 보드
29. \`analysis/focus-project-monitoring-board.md\`: 핵심 4개 사업의 점검 우선순위, 외부 회신 대기, 먼저 열 URL
30. \`analysis/focus-project-weekly-monitoring-cockpit.md\`: 핵심 4개 사업의 주간 점검 순서, 외부 회신 대기, 주간 런북 연결
31. \`analysis/focus-project-fieldwork-cockpit.md\`: 핵심 4개 사업의 답사 순서, 방문 전 원문, 현장 체크, 후속 반영 파일
32. \`analysis/focus-project-latest-check-guide.md\`: 핵심 4개 사업의 직접 공식 URL, 변화 판정 기준, 반영 파일
33. \`analysis/focus-project-monitoring-registry.json\`: 핵심 4개 사업 직접 URL, 변화 신호, 반영 파일의 구조화 레지스트리
34. \`analysis/life-area-fieldwork-checklist.md\`: 강남·잠실/송파·구의/광진 핵심 답사 루트별 바로 쓰는 체크리스트
35. \`analysis/fieldwork-quick-capture-template.md\`: 현장에서 바로 복붙할 핵심 4개 사업 JSON 입력 초안
36. \`analysis/focus-project-pair-comparison-board.md\`: 같은 날 두 사업 관찰이 비교 메모로 이어질 준비가 됐는지와 기록된 비교 메모를 확인하는 보드
37. \`data/review/focus-project-pair-comparisons.README.md\`: 같은 날 사업 쌍 비교 메모 입력 규칙
38. \`analysis/life-area-comparison-worksheet.md\`: 강남·잠실/송파·구의/광진을 같은 질문으로 비교하는 작업면
39. \`analysis/weekly-monitoring-execution-log.md\`: 주간 공식 업데이트 점검을 실제 로그 형식으로 기록
40. \`analysis/weekly-monitoring-history.md\`: 누적 주간 로그 타임라인, 최근 변화, 외부 회신 대기 추적
41. \`analysis/weekly-monitoring-comparison-board.md\`: 핵심 4개 사업 기준선, 최근 주간 로그 상태, 외부 회신/현장 병목 비교
42. \`analysis/life-area-monitoring-board.md\`: 핵심 3생활권의 현재 입장과 함께 강동권·약수동 주변 확장 관심권 상태까지 같이 보는 실행 보드
43. \`analysis/weekly-monitoring-log-2026-06-24.md\`: 현재 기준선 주간 로그
44. \`analysis/strategic-research-brief.md\`: 생활권별 큰 그림과 첫 액션
45. \`analysis/focus-area-comparison-brief.md\`: 강남·잠실/송파·구의/광진 상대 비교
46. \`analysis/focus-area-evidence-risk-heatmap.md\`: 생활권별 공식 근거 품질·원문 병목·리스크를 같은 행에서 비교
47. \`analysis/focus-area-decision-memo.md\`: 생활권별 잠정 결론, 승격 조건, 반증 조건, 다음 증거
48. \`analysis/research-session-playbook.md\`: 15분/주간/현장답사/새 업데이트/월간 세션별 실행 순서
49. \`analysis/research-hypothesis-ledger.md\`: 사업별 가설, 승격 조건, 반증 조건
50. \`analysis/project-evidence-binder.md\`: 사업장별 공식 원천, 로컬 원문, 텍스트 추출, 먼저 열 파일
51. \`analysis/project-due-diligence-board.md\`: 사업별 원문·현장·시장·공공촉매를 한 행으로 묶은 실사 순서표
52. \`analysis/catalyst-trigger-matrix.md\`: 공공 개발·교통 촉매 업데이트가 가설을 올릴지 낮출지 판정
53. \`analysis/official-change-detection-board.md\`: 공식 출처 변경 신호가 어느 사업장·가설·산출물에 영향을 주는지 출처 기준으로 확인
54. \`analysis/official-update-intake-board.md\`: 새 공식 업데이트를 수동 inbox에 넣었을 때 어느 decision/intake 파일로 보낼지 검증
55. \`analysis/official-update-source-verification-bridge.md\`: source verification 경로 update가 어떤 closure_id와 연관되고 applied 승격 가능한지 확인
56. \`analysis/official-update-scenario-playbook.md\`: 새 고시·공고·보도자료·시장자료 발견 시 intake JSON 예시와 라우팅 gate 확인
57. \`analysis/update-impact-ledger.md\`: 새 원문·현장 관찰·공공계획 업데이트가 어느 산출물에 영향을 주는지 확인
58. \`analysis/research-artifact-dependency-map.md\`: 입력 파일과 생성 산출물의 의존 관계 확인
59. \`analysis/fixed-date-hardcode-audit.md\`: 생성 문서 날짜 고정이 남은 스크립트와 stale 출력 우선순위 확인
60. \`analysis/official-source-freshness-ledger.md\`: 공식 출처별 로컬 신선도와 다음 갱신 런북
61. \`analysis/official-source-activation-checklist.md\`: 수동 알림 신청, 수동 월간 검색, API 키 연결 상태와 완료 gate
62. \`analysis/official-source-activation-validation.md\`: 공식 출처 활성화 입력 검증과 미기록 출처 확인
63. \`data/review/official-source-activation-intake.README.md\`: 공식 출처 활성화 상태 입력 규칙
64. \`data/review/official-source-activation-intake-examples.json\`: 공식 출처 활성화 상태 복사용 예시
65. \`analysis/official-context-search-queue.md\`: 월간 context scan 때 촉매별로 검색할 공식 출처·검색어·기록 위치
66. \`analysis/official-context-search-results-board.md\`: 월간 context 검색 결과를 not_found/context_only/원문 후보로 검증
67. \`data/review/official-context-search-results-intake.README.md\`: 공식 context 검색 결과 입력 규칙, 허용 상태, 증거 조건
68. \`data/review/official-context-search-results-intake-examples.json\`: context 검색 결과 복사용 예시 행
69. \`analysis/official-context-impact-board.md\`: context_only 결과가 어느 사업장에 연결되는지와 승격 금지 gate 확인
70. \`analysis/research-next-moves.md\`: 이번 액션 후보 전체 목록
71. \`analysis/research-completion-cockpit.md\`: goal 완료를 막는 P0/P1 병목
72. \`project-notes/README.md\`: 사업별 1페이지 메모 색인
73. \`analysis/fieldwork-observation-notebook.md\`: 지하철 답사 관찰값 기록 양식
74. \`data/review/fieldwork-observations.README.md\`: 현장 관찰값 입력 규칙과 루트별 복사용 예시
75. \`analysis/high-blocking-submission-approval-board.md\`: 외부 제출 전 승인 질문, 제출 본문, 접수 후 기록 필드 확인
76. \`analysis/high-blocking-filing-checklist.md\`: 공식 회신/정보공개가 필요한 3건 접수 전후 체크
77. \`analysis/high-blocking-response-followup-cockpit.md\`: 회신 대기 3건의 다음 점검일, helper, dry-run, write 순서를 한 장으로 묶은 실행판
78. \`analysis/high-blocking-next-check-session-packet.md\`: 다음 점검일에 3건 조회 URL, no response 기록 helper, 회신 반영 helper를 그대로 쓰는 세션 패킷
79. \`analysis/high-blocking-next-check-command-audit.md\`: 세션 패킷 helper의 checked-at/next-check-date가 실제로 앞으로 가는지 감사
80. \`analysis/high-blocking-followup-history.md\`: 외부 회신 대기 3건의 실제 점검 이력과 최신 포털 상태
81. \`data/review/high-blocking-source-response-intake.README.md\`: high blocking intake 원본의 상태값, helper, 운영 규칙
82. \`analysis/research-manual-web-session-packet.md\`: 핵심·확장·외부 회신 수동 웹 세션을 한 장으로 묶은 즉시 실행 패킷
83. \`analysis/official-web-query-registry.md\`: 포털별 검색어, 기록 필드, 판정 gate를 한 행으로 묶은 공식 웹 검색 레지스트리

## 생활권별 시작점

${mdTable(focusHomeRows, [
  { key: "focus_area", label: "생활권" },
  { key: "decision_question", label: "판단 질문" },
  { key: "first_action_project", label: "먼저 볼 사업" },
  { key: "first_action_track", label: "트랙" },
  { key: "first_route", label: "답사 루트" },
  { key: "update_runbook", label: "업데이트 런북" },
])}

## 오늘 열 ${todayRows.length}개

${mdTable(todayRows, [
  { key: "lane", label: "구분" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "track", label: "트랙" },
  { key: "score", label: "점수" },
  { key: "open_file", label: "열 파일" },
  { key: "first_source", label: "먼저 열 공식자료" },
])}

## 장기 관찰 상위

${mdTable(topPotential.map((row) => ({
    rank: row.rank,
    focus_area: row.focus_area,
    project_name: row.project_name,
    current_stage: row.current_stage,
    potential: row.long_term_potential_score,
    confidence: row.confidence_score,
    upside: compact(row.upside_watch || row.external_driver_summary, 160),
    risk: compact(row.risk_hypothesis || row.downside_watch, 160),
  })), [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "potential", label: "잠재" },
  { key: "confidence", label: "확신" },
  { key: "upside", label: "상방 신호" },
  { key: "risk", label: "리스크" },
])}

## P0 완료 병목

${mdTable(p0Rows, [
  { key: "task_id", label: "ID" },
  { key: "status", label: "상태" },
  { key: "source_file", label: "열 파일" },
  { key: "update_file", label: "입력" },
  { key: "required_evidence", label: "필요 증거" },
  { key: "next_action", label: "다음 행동" },
])}

## 정보공개/공식 민원 접수 준비

${mdTable(filingHomeRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "checklist_status", label: "상태" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "outbox_file", label: "제출 파일" },
  { key: "mark_filed_command", label: "접수 명령" },
  { key: "next_step", label: "다음 단계" },
])}

## 답사 루트

${mdTable(routeRows, [
  { key: "route_name", label: "루트" },
  { key: "focus_area", label: "생활권" },
  { key: "first_project", label: "첫 사업" },
  { key: "fieldwork_priority", label: "우선" },
  { key: "onsite_checks", label: "현장 체크" },
  { key: "official_before_visit", label: "방문 전 공식자료" },
])}

## 업데이트 런북

${mdTable(runbookRows, [
  { key: "runbook_id", label: "런북" },
  { key: "cadence", label: "주기" },
  { key: "network_required", label: "원격" },
  { key: "trigger", label: "트리거" },
  { key: "first_outputs_to_read", label: "먼저 읽을 산출물" },
  { key: "decision_rule", label: "판정 규칙" },
])}

## 운영 원칙

- 공식 원문, 고시번호, 고시일, 원문 URL, 자료명, 기준일이 확인되기 전에는 확정값으로 승격하지 않는다.
- 시장 신호는 사업 단계 판정 근거가 아니라 반응 확인용 비교군으로만 쓴다.
- 현장 답사는 역 출구, 단지 경계, 한강·간선도로 단절, 버스 환승, 실제 보행시간을 같은 형식으로 기록한다.
- 새 회신이나 원문이 들어오면 가능하면 \`node scripts/record-high-blocking-response.mjs\` 또는 \`node scripts/mark-high-blocking-filed.mjs\`로 반영한 뒤 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
`;
}

async function main() {
  const loaded = Object.fromEntries(
    await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])),
  );
  const home = buildHome(loaded);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    OUT_JSON,
    `${JSON.stringify(
      {
        generated_at: `${kstDate()} KST`,
        summary: home.summary,
        focusHomeRows: home.focusHomeRows,
        todayRows: home.todayRows,
        topPotential: home.topPotential,
        p0Rows: home.p0Rows,
        filingHomeRows: home.filingHomeRows,
        routeRows: home.routeRows,
        runbookRows: home.runbookRows,
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(OUT_CSV, toCsv(home.csvRows));
  await writeFile(OUT_MD, markdown(home));
  console.log(JSON.stringify({ todayRows: home.summary.today_row_count, p0: home.summary.p0_count, output: "analysis/personal-research-home.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
