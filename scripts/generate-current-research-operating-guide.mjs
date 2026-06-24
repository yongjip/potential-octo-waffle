#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "current-research-operating-guide.md");
const OUT_JSON = path.join(OUT_DIR, "current-research-operating-guide.json");
const OUT_CSV = path.join(OUT_DIR, "current-research-operating-guide.csv");

const INPUTS = {
  researchStatusDashboard: "analysis/research-status-dashboard.json",
  currentSnapshot: "analysis/current-research-snapshot.json",
  focusWeeklyCockpit: "analysis/focus-project-weekly-monitoring-cockpit.json",
  expansionWeeklyCockpit: "analysis/expansion-zone-weekly-monitoring-cockpit.json",
  expansionLatestCheckAudit: "analysis/expansion-official-latest-check-audit.json",
  lifeAreaMonitoringBoard: "analysis/life-area-monitoring-board.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
  goalAudit: "analysis/research-goal-completion-audit.json",
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  representativeLotFallbackWorkbook: "analysis/representative-lot-fallback-workbook.json",
  representativeLotFallbackIdentifierClosureWorkbook:
    "analysis/representative-lot-fallback-identifier-closure-workbook.json",
  representativeLotFallbackFindingBoard: "analysis/representative-lot-fallback-finding-board.json",
  representativeLotFallbackApplyAudit: "analysis/representative-lot-fallback-apply-audit.json",
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

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
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

function compact(values, limit = 3) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function earliestDate(values) {
  const filtered = values.map((value) => String(value || "").trim()).filter(Boolean).sort();
  return filtered[0] || "";
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function buildZoneRows(snapshot, monitoringBoard) {
  const coreRows = (snapshot.life_areas || []).map((row) => ({
    group: "핵심 생활권",
    name: row.name,
    current_state: row.current_stance,
    key_question: row.key_question,
    next_action: row.next_action,
    route: row.fieldwork_route,
  }));
  const expansionRows = (snapshot.expansion_zones || []).map((row) => ({
    group: "확장 관심권",
    name: row.name,
    current_state: row.current_stance,
    key_question: row.key_question,
    next_action: row.next_action,
    route: row.fieldwork_route,
  }));
  const operationalRows = (monitoringBoard.expansion_zone_rows || []).map((row) => ({
    group: "확장 실행상태",
    name: row.zone_name,
    current_state: row.current_state,
    key_question: row.priority_action,
    next_action: row.next_action,
    route: row.core_reference,
  }));
  return [...coreRows, ...expansionRows, ...operationalRows];
}

function buildFirstFileRows() {
  return [
    { order: 1, file: "analysis/personal-research-home.md", why: "전체 진입점과 오늘 열 항목" },
    { order: 2, file: "analysis/research-now-action-board.md", why: "오늘 바로 할 일과 날짜 대기선을 한 장으로 분리한 실행 보드" },
    { order: 3, file: "analysis/research-manual-web-session-packet.md", why: "핵심·확장·외부 회신 수동 웹 확인 진입점을 한 장으로 묶은 세션 패킷" },
    { order: 4, file: "analysis/official-web-query-registry.md", why: "포털별 검색어, 기록 필드, 판정 gate를 한 행으로 묶은 검색 레지스트리" },
    { order: 5, file: "analysis/current-research-snapshot.md", why: "핵심 3생활권·확장 2권역·핵심 4개 사업 현재 판단" },
    { order: 6, file: "analysis/focus-project-weekly-monitoring-cockpit.md", why: "핵심 4개 사업의 이번 주 우선순위와 외부 회신 대기" },
    { order: 7, file: "analysis/expansion-zone-weekly-monitoring-cockpit.md", why: "강동권 단계 신호 확인과 약수권 direct hit 루프" },
    { order: 8, file: "analysis/expansion-official-latest-check-audit.md", why: "정비사업구역계 진입 페이지 검색 결과와 popup 직접 접근 차단 여부를 먼저 확인" },
    { order: 9, file: "analysis/representative-lot-fallback-workbook.md", why: "대표지번 fallback만 남은 6건의 direct notice 단계와 current business 미확정 사유를 한 장으로 보는 워크북" },
    { order: 10, file: "analysis/representative-lot-fallback-identifier-closure-workbook.md", why: "대표지번 fallback 6건의 PNU, UQ120 후보명, presentSn 채택 조건을 바로 보는 클로저 워크북" },
    { order: 11, file: "analysis/representative-lot-fallback-command-packet.md", why: "today 기준 fallback 6건 copy-ready 기록 명령 패킷" },
    { order: 12, file: "analysis/representative-lot-fallback-api-probe.md", why: "fallback 6건에 대해 API 기준 strong candidate와 hold를 먼저 보는 보드" },
    { order: 13, file: "analysis/representative-lot-fallback-edge-session-packet.md", why: "Edge 브라우저에서 fallback 6건의 presentSn를 직접 확인할 때 쓰는 세션 패킷" },
    { order: 14, file: "analysis/representative-lot-fallback-finding-board.md", why: "Edge 확인 결과를 intake로 남기고 승격/보류 상태를 보는 보드" },
    { order: 15, file: "analysis/representative-lot-fallback-apply-audit.md", why: "confirmed finding이 matrix/project-note에 반영됐는지 보고 applied로 닫는 감사표" },
    { order: 16, file: "analysis/life-area-market-reaction-brief.md", why: "핵심 3생활권 시장 신호와 확장권 baseline 커버를 같은 규칙으로 읽는 generated 브리프" },
    { order: 16, file: "analysis/expansion-market-scope-workbook.md", why: "강동권·약수권 법정동 시장 scope를 core chain과 분리해 운영하는 워크북" },
    { order: 17, file: "analysis/expansion-market-normalized-summary.md", why: "확장 6개 scope에 latest-window 정규화 거래가 모두 들어왔는지 보는 행·source 요약" },
    { order: 18, file: "analysis/expansion-market-signal-summary.md", why: "강동권·약수권 2권역과 6개 법정동의 매매·전월세 중위값과 최근성을 읽는 시그널 요약" },
    { order: 19, file: "analysis/life-area-market-baseline-board.md", why: "핵심 3생활권 full-chain과 확장 2권역 latest-window baseline을 같은 표에서 읽는 시장 기준 비교 보드" },
    { order: 20, file: "analysis/expansion-market-first-download-packet.md", why: "확장권 시장 90개 raw task를 최신 window 우선 패킷으로 압축한 실행표" },
    { order: 21, file: "analysis/expansion-market-download-session-packet.md", why: "확장권 latest-window 30개 수집을 바로 시작하는 세션 패킷" },
    { order: 22, file: "analysis/expansion-market-quickstart-packet.md", why: "천호동·길동 10개 task만 먼저 닫는 first-session quickstart 패킷" },
    { order: 23, file: "analysis/expansion-market-download-status.md", why: "확장권 latest-window 30개 파일 존재와 intake 기록 상태" },
    { order: 24, file: "analysis/life-area-monitoring-board.md", why: "핵심 생활권과 확장 관심권을 같은 판에서 비교" },
    { order: 25, file: "analysis/high-blocking-filing-tracker.md", why: "외부 회신 3건의 접수번호·다음 점검일" },
    { order: 26, file: "analysis/high-blocking-response-followup-cockpit.md", why: "회신 도착 시 helper·dry-run·write 순서를 그대로 따라가는 실행판" },
    { order: 27, file: "analysis/high-blocking-next-check-session-packet.md", why: "다음 점검일에 조회 URL과 no response/response helper를 바로 쓰는 세션 패킷" },
    { order: 28, file: "analysis/high-blocking-next-check-command-audit.md", why: "세션 패킷 helper의 checked-at/next-check-date가 실제로 앞으로 가는지 감사" },
    { order: 29, file: "analysis/high-blocking-followup-history.md", why: "실제 점검일에 무엇을 확인했고 어떤 상태 변화가 있었는지 누적 이력 확인" },
    { order: 30, file: "analysis/research-completion-cockpit.md", why: "goal 완료를 막는 P0/P1 병목" },
    { order: 31, file: "analysis/research-session-playbook.md", why: "15분/주간/현장/확장 세션별 실행 순서" },
  ].map((row) => ({ ...row, file_md: fileLink(row.file) }));
}

function buildWatchRows(focusWeekly, expansionWeekly) {
  const focusRows = (focusWeekly.rows || []).slice(0, 4).map((row) => ({
    lane: "핵심 사업",
    target: `${row.rank}. ${row.project_name}`,
    status: row.external_wait_status || row.lane,
    next_check: row.first_check_action,
    output_route: row.output_route,
  }));
  const expansionRows = (expansionWeekly.rows || []).map((row) => ({
    lane: "확장 관심권",
    target: row.zone_name,
    status: `${row.current_state} / ${row.next_check_status}`,
    next_check: row.first_check_action,
    output_route: row.output_route,
  }));
  return [...focusRows, ...expansionRows];
}

function buildExternalWaitRows(filingTracker) {
  return (filingTracker.rows || []).map((row) => ({
    rank: row.rank,
    project_name: row.project_name,
    filing_receipt_no: row.filing_receipt_no,
    next_check_date: row.next_check_date,
    next_check_note: row.next_check_note,
    remaining_gap: row.remaining_gap,
  }));
}

function buildActionLaneRows({ focusWeeklyCockpit, expansionWeeklyCockpit, filingTracker }) {
  const filingRows = filingTracker.rows || [];
  const waitRows = filingRows.filter((row) => String(row.response_status || "") === "no_response");
  const nextCheckDate = earliestDate(waitRows.map((row) => row.next_check_date));
  const nextCheckDays = waitRows.reduce((min, row) => {
    const days = Number(row.next_check_in_days);
    if (!Number.isFinite(days)) return min;
    return Math.min(min, days);
  }, Number.POSITIVE_INFINITY);
  const waitWindow = Number.isFinite(nextCheckDays) ? nextCheckDays : "";
  const activeFocus = (focusWeeklyCockpit.rows || []).filter((row) => String(row.external_wait_status || "none") === "none");
  const focusLead = activeFocus[0] || null;
  const expansionLead = (expansionWeeklyCockpit.rows || [])[0] || null;

  return [
    {
      lane: "외부 회신",
      availability: waitRows.length > 0 && waitWindow !== "" && waitWindow > 0 ? "지금은 대기 유지" : "지금 확인",
      targets: waitRows.map((row) => `${row.rank}. ${row.project_name}`).join("; "),
      current_status:
        waitRows.length === 0
          ? "회신 대기 없음"
          : waitWindow !== "" && waitWindow > 0
            ? `no_response ${waitRows.length}건 / 다음 점검 ${nextCheckDate} / D-${waitWindow}`
            : `no_response ${waitRows.length}건 / 오늘 재확인 필요`,
      today_action:
        waitRows.length > 0 && waitWindow !== "" && waitWindow > 0
          ? `새 메일이나 알림이 없으면 오늘은 추가 제출 없이 대기하고, ${nextCheckDate}에 next-check session packet으로 3건 상태를 재확인`
          : "next-check session packet과 filing tracker를 열어 접수상태, 보완요구, 답변 게시 여부를 확인",
      open_file: "analysis/high-blocking-next-check-session-packet.md",
    },
    {
      lane: "확장 관심권",
      availability: "지금 바로 가능",
      targets: expansionLead ? expansionLead.zone_name : "강동권; 약수동 주변",
      current_status: expansionLead
        ? `${expansionLead.current_state}; ${expansionLead.next_check_status}; 기준 ${expansionLead.next_check_at}`
        : "확장 주간 재확인 필요",
      today_action: expansionLead
        ? expansionLead.first_check_action
        : "강동권 latest stage와 약수권 direct hit 여부를 공식 채널 기준으로 재확인",
      open_file: "analysis/expansion-zone-weekly-monitoring-cockpit.md",
    },
    {
      lane: "핵심 생활권 비교",
      availability: "지금 바로 가능",
      targets: focusLead ? `${focusLead.rank}. ${focusLead.project_name}` : "핵심 4개 사업",
      current_status: focusLead ? `${focusLead.life_area}; ${focusLead.lane}; ${focusLead.stage}` : "핵심 사업 주간 점검 가능",
      today_action: focusLead ? focusLead.first_check_action : "핵심 4개 사업의 주간 점검 우선순위를 다시 확인",
      open_file: "analysis/focus-project-weekly-monitoring-cockpit.md",
    },
  ];
}

function buildSummary({
  researchStatusDashboard,
  focusWeeklyCockpit,
  expansionWeeklyCockpit,
  expansionLatestCheckAudit,
  completionCockpit,
  goalAudit,
  filingTracker,
  representativeLotFallbackWorkbook,
  representativeLotFallbackIdentifierClosureWorkbook,
  representativeLotFallbackFindingBoard,
  representativeLotFallbackApplyAudit,
}) {
  const dashboardRows = Array.isArray(researchStatusDashboard)
    ? researchStatusDashboard
    : researchStatusDashboard.rows || [];
  const dashboardP0 = dashboardRows.reduce((sum, row) => sum + Number(row.p0_tasks || 0), 0);
  const dashboardP1 = dashboardRows.reduce((sum, row) => sum + Number(row.p1_tasks || 0), 0);
  const coreReviewItems = dashboardRows.reduce((sum, row) => sum + Number(row.core_review_items || 0), 0);
  return {
    generated_at: `${kstDate()} KST`,
    final_verdict: goalAudit.summary?.final_verdict || "",
    dashboard_p0: dashboardP0,
    dashboard_p1: dashboardP1,
    core_review_items: coreReviewItems,
    focus_external_wait_count: focusWeeklyCockpit.summary?.external_wait_focus_count ?? "",
    expansion_due_this_week_count: expansionWeeklyCockpit.summary?.due_this_week_count ?? "",
    expansion_latest_stage_gap_count: expansionWeeklyCockpit.summary?.latest_stage_gap_project_count ?? "",
    expansion_confirmed_baseline_count: expansionWeeklyCockpit.summary?.confirmed_baseline_project_count ?? "",
    expansion_verified_result_count: expansionLatestCheckAudit.summary?.verified_result_count ?? "",
    expansion_verified_no_result_count: expansionLatestCheckAudit.summary?.verified_no_result_count ?? "",
    expansion_blocked_popup_count: expansionLatestCheckAudit.summary?.blocked_direct_popup_count ?? "",
    completion_p0_count: completionCockpit.summary?.p0_count ?? "",
    completion_p1_count: completionCockpit.summary?.p1_count ?? "",
    filed_waiting_count: filingTracker.summary?.filed_waiting_count ?? "",
    next_check_due_count: (filingTracker.rows || []).filter((row) => Number(row.next_check_in_days) <= 7).length,
    next_external_check_date: earliestDate((filingTracker.rows || []).map((row) => row.next_check_date)),
    representative_lot_fallback_count: representativeLotFallbackWorkbook.summary?.project_count ?? "",
    representative_lot_fallback_identifier_closure_count:
      representativeLotFallbackIdentifierClosureWorkbook.summary?.project_count ?? "",
    representative_lot_fallback_finding_count: representativeLotFallbackFindingBoard.summary?.finding_count ?? "",
    representative_lot_fallback_ready_to_promote_count:
      representativeLotFallbackFindingBoard.summary?.ready_to_promote_count ?? "",
    representative_lot_fallback_ready_to_apply_count:
      representativeLotFallbackApplyAudit.summary?.ready_to_mark_applied_count ?? "",
    representative_lot_fallback_applied_verified_count:
      representativeLotFallbackApplyAudit.summary?.applied_verified_count ?? "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };
}

function markdown({ summary, firstFileRows, zoneRows, watchRows, externalWaitRows, actionLaneRows }) {
  return `# 현재 리서치 운영 가이드

작성 기준: ${summary.generated_at}

이 문서는 강남·잠실/송파·구의/광진 핵심 생활권과 강동권·약수동 주변 확장 관심권을 지금 시점에서 어떻게 같이 굴릴지 정리한 현재형 운영 문서다. 투자 추천이 아니라, 공식 원문이 어디까지 정리됐는지와 다음 판단을 어떤 순서로 할지 고정한다.

## 지금 상태

| 항목 | 현재 상태 |
| --- | --- |
| goal 완료 판정 | ${summary.final_verdict || "미확인"} |
| research status dashboard P0 / P1 | ${summary.dashboard_p0} / ${summary.dashboard_p1} |
| 핵심 검토 항목 | ${summary.core_review_items} |
| 핵심 사업 외부 회신 대기 | ${summary.focus_external_wait_count} |
| 확장 관심권 이번 주 점검 | ${summary.expansion_due_this_week_count} |
| 강동 latest_stage_gap | ${summary.expansion_latest_stage_gap_count} |
| 약수 confirmed baseline | ${summary.expansion_confirmed_baseline_count} |
| 확장 direct hit 확인 | ${summary.expansion_verified_result_count} |
| 확장 direct hit 미확인 | ${summary.expansion_verified_no_result_count} |
| popup 직접 접근 차단 | ${summary.expansion_blocked_popup_count} |
| 대표지번 fallback only | ${summary.representative_lot_fallback_count} |
| fallback presentSn 클로저 | ${summary.representative_lot_fallback_identifier_closure_count} |
| fallback finding 입력 | ${summary.representative_lot_fallback_finding_count} |
| fallback 승격 준비 | ${summary.representative_lot_fallback_ready_to_promote_count} |
| fallback applied 가능 | ${summary.representative_lot_fallback_ready_to_apply_count} |
| fallback applied 검증완료 | ${summary.representative_lot_fallback_applied_verified_count} |
| completion cockpit P0 / P1 | ${summary.completion_p0_count} / ${summary.completion_p1_count} |
| 외부 회신 filed waiting | ${summary.filed_waiting_count} |
| 7일 내 다음 점검 | ${summary.next_check_due_count} |
| 외부 회신 다음 점검일 | ${summary.next_external_check_date || "미정"} |

현재 기준으로 로컬 비교 체계는 운영 가능하다. 핵심 3생활권은 공식 원문·공개항목·OCR 판독·자치구 고시공고를 묶어 읽을 수 있고, 확장 관심권도 강동권은 \`${summary.expansion_latest_stage_gap_count > 0 ? "latest_stage_gap 재확인" : "stage signal verified 후속 확인"}\`, 약수권은 \`confirmed baseline\` 관점으로 분리 운영된다.

확장 관심권의 현재형 웹 기준도 분명해졌다. 2026-06-24 KST 확인 기준으로 서울도시공간포털 정비사업구역계 진입 페이지 \`PMNU4030600001\` 검색에서 강동권 \`천호3구역\`은 \`총 1건\`, 약수권 \`약수역\`은 \`총 0건\`이었다. 따라서 강동권은 direct hit을 현재형 신호로 유지하고, 약수권은 adjacent 기준선을 유지한다. \`mapForm.pop?noticeCode=...\`는 식별자 참조만 허용하고 단독 공개 진입 URL로는 쓰지 않는다.

다만 goal 완료는 아직 아니다. 남은 P0는 외부 회신 3건과 그에 딸린 high-blocking 16개 필드다. 따라서 지금은 \`핵심 생활권 비교\`, \`확장 관심권 주간 재확인\`, \`외부 회신 점검\`을 분리해서 굴려야 한다.

같이 봐야 하는 별도 묶음도 있다. \`representative_lot_fallback_only\` ${summary.representative_lot_fallback_count}건은 직접 고시 기준 단계는 잠겼지만 current business UQ120 식별자가 안 잠긴 케이스다. 이 묶음은 ${fileLink("analysis/representative-lot-fallback-workbook.md")}에서 따로 추적한다.

직접 확인에 들어갈 때는 ${fileLink("analysis/representative-lot-fallback-identifier-closure-workbook.md")}를 같이 연다. 여기에는 각 사업의 대표지번, PNU, 1순위 UQ120 후보명, 대체 후보명, \`same-stage\` 여부와 \`presentSn\` 채택 조건이 정리돼 있다.

브라우저 세션은 ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")} 기준으로 바로 시작한다. 이 패킷은 Edge에서 열 URL, 프로브 키, 채택/제외 조건, 갱신 대상 파일까지 한 번에 묶는다.

확인 결과는 ${fileLink("analysis/representative-lot-fallback-finding-board.md")}에서 따로 관리한다. 이 보드는 \`presentSn\` 확인값을 intake로 남긴 뒤 \`ready_to_promote\`, \`hold_by_stage_gap\`, \`retry_needed\` 같은 상태로 나눠 보여준다.

\`pending_apply\`를 실제로 닫을 때는 ${fileLink("analysis/representative-lot-fallback-apply-audit.md")}를 바로 본다. 기본 경로는 \`record-representative-lot-fallback-finding.mjs --prefill-from-api --write --refresh --auto-mark-applied\`로 finding을 남기고 자동 반영까지 한 번에 시도하는 것이다. 여기서 auto-mark가 닫히지 않은 confirmed finding만 \`ready_to_mark_applied\`로 남기고, 그때만 \`mark-representative-lot-fallback-finding-applied.mjs\`로 \`applied\`로 승격한다.

## 지금 기준 레인 분리

${mdTable(actionLaneRows, [
    { key: "lane", label: "레인" },
    { key: "availability", label: "지금 상태" },
    { key: "targets", label: "대상" },
    { key: "current_status", label: "현재 요약" },
    { key: "today_action", label: "오늘 할 일" },
    { key: "open_file", label: "먼저 열 파일" },
  ])}

## 먼저 열 파일

${firstFileRows.map((row) => `${row.order}. ${row.file_md}: ${row.why}`).join("\n")}

## 권역별 현재 해석

${mdTable(zoneRows, [
    { key: "group", label: "구분" },
    { key: "name", label: "대상" },
    { key: "current_state", label: "현재 상태" },
    { key: "key_question", label: "핵심 질문/판정" },
    { key: "next_action", label: "다음 액션" },
    { key: "route", label: "답사/참조 축" },
  ])}

## 이번 주 실행 순서

${mdTable(watchRows, [
    { key: "lane", label: "레인" },
    { key: "target", label: "대상" },
    { key: "status", label: "현재 상태" },
    { key: "next_check", label: "첫 확인" },
    { key: "output_route", label: "반영 경로" },
  ])}

## 외부 회신 대기

${mdTable(externalWaitRows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업" },
    { key: "filing_receipt_no", label: "접수번호" },
    { key: "next_check_date", label: "다음 점검일" },
    { key: "next_check_note", label: "다음 점검" },
    { key: "remaining_gap", label: "남은 공백" },
  ])}

## 운영 원칙

- 공식 원문, 고시번호, 고시일, 원문 URL, 첨부명, 기준일이 없으면 확정값으로 승격하지 않는다.
- 강동권은 값 confirmed와 최신 단계 판정을 분리한다. 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로 유지한다.
- 시장 데이터와 정책 보도자료는 context다. 개별 사업 단계·권리관계·공사비 확정 근거로 쓰지 않는다.
- 새 회신이나 원문이 들어오면 intake를 먼저 남기고, 관련 보드 수정 후 \`node scripts/regenerate-research-artifacts.mjs\`로 전체 산출물을 다시 맞춘다.
`;
}

async function main() {
  const loaded = Object.fromEntries(
    await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])),
  );

  const summary = buildSummary(loaded);
  const firstFileRows = buildFirstFileRows();
  const zoneRows = buildZoneRows(loaded.currentSnapshot, loaded.lifeAreaMonitoringBoard);
  const watchRows = buildWatchRows(loaded.focusWeeklyCockpit, loaded.expansionWeeklyCockpit);
  const externalWaitRows = buildExternalWaitRows(loaded.filingTracker);
  const actionLaneRows = buildActionLaneRows(loaded);
  const payload = { summary, firstFileRows, zoneRows, watchRows, externalWaitRows, actionLaneRows };

  const csvRows = [
    ...firstFileRows.map((row) => ({ section: "first_file", item: row.file, priority: row.order, note: row.why })),
    ...actionLaneRows.map((row) => ({ section: "action_lane", item: row.lane, priority: row.availability, note: compact([row.current_status, row.today_action]) })),
    ...zoneRows.map((row) => ({ section: row.group, item: row.name, priority: "", note: compact([row.current_state, row.next_action]) })),
    ...watchRows.map((row) => ({ section: row.lane, item: row.target, priority: row.status, note: row.next_check })),
    ...externalWaitRows.map((row) => ({ section: "external_wait", item: `${row.rank}. ${row.project_name}`, priority: row.next_check_date, note: row.remaining_gap })),
  ];

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_MD, `${markdown(payload)}\n`);
  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
