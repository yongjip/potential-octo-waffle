#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-session-playbook.md");
const OUT_CSV = path.join(OUT_DIR, "research-session-playbook.csv");
const OUT_JSON = path.join(OUT_DIR, "research-session-playbook.json");

const INPUTS = {
  personalHome: "analysis/personal-research-home.json",
  focusDecisionMemo: "analysis/focus-area-decision-memo.json",
  dueDiligenceBoard: "analysis/project-due-diligence-board.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
  officialRunbookChecklist: "analysis/official-update-runbook-checklist.json",
  officialChangeBoard: "analysis/official-change-detection-board.json",
  officialUpdateIntakeBoard: "analysis/official-update-intake-board.json",
  expansionIntakeSeedBoard: "analysis/expansion-zone-intake-seed-board.json",
  pairComparisonBoard: "analysis/focus-project-pair-comparison-board.json",
};

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))];
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function compact(items, limit = 5) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function firstCommand(checklistRows, runbookId, status = "") {
  const rows = checklistRows.filter((row) => row.runbook_id === runbookId);
  const selected = rows.find((row) => (status ? row.status === status : row.phase === "remote_collection")) || rows[0];
  return selected?.command || "";
}

function outputsFor(checklistRows, runbookId) {
  return compact(checklistRows.filter((row) => row.runbook_id === runbookId).map((row) => row.first_outputs_to_read), 3);
}

function decisionRuleFor(checklistRows, runbookId) {
  return checklistRows.find((row) => row.runbook_id === runbookId)?.decision_rule || "";
}

function runbookSequence(runbookChecklist, runbookId) {
  const selected = (runbookChecklist.selectedRunbooks || []).find((row) => row.runbook_id === runbookId);
  if (!selected) return "";
  return compact([selected.command_sequence, selected.followup_local_command], 2);
}

function buildSessionRows({
  personalHome,
  focusDecisionMemo,
  dueDiligenceBoard,
  completionCockpit,
  runbookChecklist,
  changeBoard,
  intakeBoard,
  expansionIntakeSeedBoard,
  pairComparisonBoard,
}) {
  const todayRows = personalHome.todayRows || [];
  const p0Rows = personalHome.p0Rows || [];
  const focusRows = focusDecisionMemo.focusRows || [];
  const dueRows = rowsFrom(dueDiligenceBoard);
  const completionRows = rowsFrom(completionCockpit);
  const checklistRows = runbookChecklist.checklistRows || [];
  const changeRows = rowsFrom(changeBoard);
  const intakeSummary = intakeBoard.summary || {};
  const expansionSeedSummary = expansionIntakeSeedBoard.summary || {};
  const pairSummary = pairComparisonBoard.summary || {};
  const firstFieldwork = todayRows.find((row) => /현장/.test(row.track || "")) || todayRows[0] || {};
  const firstSource = todayRows.find((row) => /원문/.test(row.track || "")) || todayRows[1] || {};
  const firstHighBlocking = completionRows.find((row) => row.priority === "P0") || p0Rows[0] || {};
  const primaryChange = changeRows.find((row) => row.source_id === "seoul_urban_notice") || changeRows[0] || {};
  const contextChange = changeRows.find((row) => row.source_id === "seoul_citybuild_news") || changeRows.find((row) => row.primary_runbook === "monthly_context_scan") || {};

  return [
    {
      session_id: "S-15M-TRIAGE",
      cadence: "anytime",
      duration: "15분",
      trigger: "오늘 무엇을 열지 정할 때",
      objective: "생활권 잠정 입장과 오늘 열 사업을 확인하고 한 가지 작업만 고른다.",
      first_files: "analysis/personal-research-home.md; analysis/focus-area-decision-memo.md; analysis/research-next-moves.md",
      commands: "node scripts/generate-research-session-playbook.mjs",
      network_required: "N",
      decision_gate: "새 공식 증거가 없으면 점수나 가설을 바꾸지 않고 작업 대상을 하나만 고른다.",
      stop_condition: `첫 후보: ${firstFieldwork.rank || ""}. ${firstFieldwork.project_name || ""} / ${firstFieldwork.track || ""}`,
      output_to_update: firstFieldwork.open_file || "",
    },
    {
      session_id: "S-P0-FILING",
      cadence: "ad_hoc",
      duration: "30-45분",
      trigger: "P0 완료 병목 3건을 닫거나 정보공개 접수 준비를 할 때",
      objective: "잠실우성4차, 광장동 삼성1차, 자양번영로3나길 회신/정보공개 상태를 갱신한다.",
      first_files:
        "analysis/high-blocking-next-check-session-packet.md; analysis/high-blocking-next-check-command-audit.md; analysis/high-blocking-followup-history.md; data/review/high-blocking-source-response-intake.README.md; analysis/high-blocking-filing-checklist.md; analysis/research-completion-cockpit.md; data/review/high-blocking-filing-outbox/README.md",
      commands:
        "상태 재확인: node scripts/touch-high-blocking-followup.mjs --session-anchor-date=YYYY-MM-DD --checked-at=YYYY-MM-DD --write --refresh 또는 node scripts/record-high-blocking-followup-check.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=no_change --observed-note='...' --next-check-date=YYYY-MM-DD --next-check-note='...' --write -> 회신 후: node scripts/record-high-blocking-response.mjs --rank=NN --status=... --received-at=YYYY-MM-DD --responder='담당부서' --write -> node scripts/process-high-blocking-response-workflow.mjs",
      network_required: "N",
      decision_gate: firstHighBlocking.completion_gate || "회신에 고시번호·고시일·원문 URL·첨부명·자료 기준일이 있을 때만 decision 초안으로 승격",
      stop_condition: "dry-run에서 intake error 0건과 ready_to_append 또는 명확한 보류 사유 확인",
      output_to_update: "data/review/high-blocking-source-response-intake.json",
    },
    {
      session_id: "S-WEEKLY-OFFICIAL",
      cadence: "weekly",
      duration: "45-90분",
      trigger: "정기 점검일 또는 관심구 고시/공고 알림 수신",
      objective: "정보몽땅, 서울도시공간포털, 자치구 공고 변화를 수집하고 영향 사업장을 판정한다.",
      first_files:
        `${outputsFor(checklistRows, "weekly_primary_refresh") || primaryChange.first_outputs_to_read}; analysis/weekly-monitoring-comparison-board.md`,
      commands:
        `${runbookSequence(runbookChecklist, "weekly_primary_refresh") || primaryChange.first_command_or_action} -> node scripts/create-weekly-monitoring-log.mjs --date=YYYY-MM-DD --remote-run=Y --regenerated=Y --write --refresh`,
      network_required: "Y",
      decision_gate: decisionRuleFor(checklistRows, "weekly_primary_refresh") || primaryChange.decision_gate,
      stop_condition: "official-refresh-summary와 cleanup-snapshot-diff에서 단계 변경·새 고시·새 첨부 여부 확인",
      output_to_update: "data/review/official-update-intake.json 또는 data/review/source-verification-closure-decisions.json",
    },
    {
      session_id: "S-EXPANSION-LATEST",
      cadence: "weekly_or_on_signal",
      duration: "20-45분",
      trigger: "강동권·약수동 주변까지 같이 보거나 강동/중구 고시공고 변화가 보일 때",
      objective: "강동권 최신 단계 공백과 약수권 direct hit/adjacent baseline 변화를 분리해 기록하고 intake create/reuse를 결정한다.",
      first_files:
        "analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md",
      commands:
        "수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 -> node scripts/generate-expansion-zone-intake-seed-board.mjs -> node scripts/generate-official-update-intake-board.mjs",
      network_required: "Y/manual",
      decision_gate:
        "강동권은 gangdong_district_notice 새 row를 만들고, 약수권은 신당8·신당9는 기존 seoul_urban_notice row를 재사용한다. 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수 direct hit가 없으면 jung_district_notice row는 만들지 않는다.",
      stop_condition: `create seed ${expansionSeedSummary.create_row_count || 0}건 / reuse ${expansionSeedSummary.reuse_row_count || 0}건 기준으로 source_id와 update_id 재사용 여부가 정리됨`,
      output_to_update: "data/review/official-update-intake.json 또는 data/review/official-source-activation-intake.json",
    },
    {
      session_id: "S-FALLBACK-ID",
      cadence: "ad_hoc",
      duration: "30-60분",
      trigger: "대표지번 fallback only 6건에서 current business presentSn를 직접 확인할 때",
      objective: "recordCode 기준 현재 단계는 유지한 채 UQ120 current business 식별자와 데이터 기준일을 확인한다.",
      first_files:
        "analysis/representative-lot-fallback-command-packet.md; analysis/representative-lot-fallback-api-probe.md; analysis/representative-lot-fallback-edge-session-packet.md; analysis/representative-lot-fallback-finding-board.md; analysis/representative-lot-fallback-apply-audit.md; analysis/representative-lot-fallback-identifier-closure-workbook.md; analysis/representative-lot-fallback-workbook.md; analysis/project-comparison-matrix.md",
      commands:
        "API 선행 확인: node scripts/fetch-representative-lot-fallback-api-probe.mjs -> node scripts/generate-representative-lot-fallback-api-probe.mjs -> unresolved면 Edge 수동 확인: recordCode popup -> 대표지번/PNU -> UQ120 후보 비교 -> node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied -> auto-mark가 닫히지 않은 confirmed_current_business만 node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh",
      network_required: "Y/manual",
      decision_gate:
        "same-stage UQ120 응답에서 presentSn, 데이터 기준일, 사업유형이 같이 보일 때만 current business 후보로 승격한다. stage-gap이면 보류를 유지한다.",
      stop_condition: "각 세션에서 최소 1건에 대해 presentSn 확정 또는 보류 사유 재확인을 남긴다.",
      output_to_update: "analysis/representative-lot-fallback-finding-board.md",
    },
    {
      session_id: "S-FIELDWORK",
      cadence: "weekly_or_before_visit",
      duration: "60-120분",
      trigger: "지하철 답사 전후",
      objective: "현장 동선, 환승, 한강·간선도로 단절, 실제 보행시간을 같은 형식으로 기록한다.",
      first_files: "analysis/fieldwork-route-planner.md; analysis/fieldwork-observation-notebook.md; data/review/fieldwork-observations.README.md",
      commands:
        "현장 관찰 후 node scripts/record-fieldwork-observation.mjs --rank=NN --visited-at=YYYY-MM-DD --station-exit='역명 N번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat --write --refresh 또는 수동 입력 -> node scripts/generate-fieldwork-observation-notebook.mjs",
      network_required: "N",
      decision_gate: "사진/시간/동선 메모가 특정 사업장 rank와 연결될 때만 가설 확신도 변화 후보로 둔다.",
      stop_condition: `우선 루트: ${firstFieldwork.next_step || firstFieldwork.first_source || ""}`,
      output_to_update: "data/review/fieldwork-observations.json",
    },
    {
      session_id: "S-PAIR-COMPARE",
      cadence: "same_day_after_fieldwork",
      duration: "15-30분",
      trigger: "같은 날 핵심 사업 2건 이상을 걸은 직후",
      objective: "현장 관찰 2건을 생활권 판단에 쓰기 전에 같은 날 비교 메모로 구조화한다.",
      first_files:
        "analysis/focus-project-pair-comparison-board.md; analysis/focus-project-pair-comparison-starter.md; analysis/life-area-comparison-worksheet.md",
      commands:
        "node scripts/record-focus-project-pair-comparison.mjs --pair-id=... --visited-at=YYYY-MM-DD --status=draft --fieldwork-delta='...' --judgment-shift='...' --not-closed-reason='...' --write --refresh",
      network_required: "N",
      decision_gate:
        "같은 날 두 사업 관찰이 모두 fieldwork-observations에 있어야 하며, pair-comparison은 단계·수치 확정이 아니라 생활권 판단 보정으로만 사용한다.",
      stop_condition: `현재 ready_to_compare ${pairSummary.ready_to_compare_count || 0}건 / recorded ${pairSummary.recorded_comparison_count || 0}건`,
      output_to_update: "data/review/focus-project-pair-comparisons.json",
    },
    {
      session_id: "S-NEW-UPDATE",
      cadence: "on_signal",
      duration: "20-40분",
      trigger: "새 고시, 기사, 보도자료, 알림, 공고를 발견했을 때",
      objective: "새 업데이트를 공통 inbox에 넣고 source verification/context/market/high-blocking 중 어디로 보낼지 판정한다.",
      first_files: "data/review/official-update-intake.README.md; analysis/official-update-intake-board.md; analysis/official-change-detection-board.md",
      commands: "node scripts/generate-official-update-intake-board.mjs",
      network_required: "N",
      decision_gate: `intake needs_fix ${intakeSummary.needs_fix_count || 0}건. applied는 verified_original 증거와 URL/첨부/로컬 텍스트 중 하나가 있을 때만 사용`,
      stop_condition: "route와 target_file이 정해지고 source_id/rank/evidence_status 오류가 0건",
      output_to_update: "data/review/official-update-intake.json",
    },
    {
      session_id: "S-SOURCE-DEEPDIVE",
      cadence: "ad_hoc",
      duration: "60-120분",
      trigger: "원문 확정 트랙 사업을 처리할 때",
      objective: "고시번호, 고시일, 원문 URL, 핵심 수치의 confirmed/pending/conflict 상태를 닫는다.",
      first_files: compact(
        [
          firstSource.open_file,
          "analysis/project-evidence-binder.md",
          "analysis/representative-lot-fallback-workbook.md",
          "analysis/representative-lot-fallback-identifier-closure-workbook.md",
          "analysis/source-verification-closure-ledger.md",
          "analysis/source-link-repair-candidates.md",
        ],
        5,
      ),
      commands: "node scripts/generate-source-verification-action-queue.mjs -> node scripts/regenerate-research-artifacts.mjs",
      network_required: "N",
      decision_gate: "공식 원문 텍스트나 공식 회신 근거가 없으면 pending으로 유지한다.",
      stop_condition: `우선 원문 후보: ${firstSource.rank || ""}. ${firstSource.project_name || ""} / ${firstSource.first_source || ""}`,
      output_to_update: "data/review/source-verification-closure-decisions.json",
    },
    {
      session_id: "S-MONTHLY-CONTEXT",
      cadence: "monthly",
      duration: "45-90분",
      trigger: "서울시 도시계획·교통 정책 발표 또는 월간 점검",
      objective: "잠실 MICE, 압구정 한강변, 동서울터미널, 교통계획 context를 고시·계획 원문과 분리해 관리한다.",
      first_files: "analysis/official-context-sources.csv; analysis/public-development-catalyst-map.md; analysis/catalyst-trigger-matrix.md",
      commands: firstCommand(checklistRows, "monthly_context_scan") || contextChange.first_command_or_action || "수동 검색: 서울시 주택·도시계획 분야, 서울시 교통 분야, 서울 정보소통광장",
      network_required: "Y/manual",
      decision_gate: decisionRuleFor(checklistRows, "monthly_context_scan") || contextChange.decision_gate,
      stop_condition: "보도자료는 context_only로 남기고 고시·계획·교통대책 원문 연결 여부 기록",
      output_to_update: "analysis/official-context-sources.csv 또는 data/review/official-update-intake.json",
    },
    {
      session_id: "S-MONTHLY-MARKET",
      cadence: "monthly",
      duration: "45-90분",
      trigger: "실거래 최신월 또는 R-ONE 지표 갱신",
      objective: "시장 데이터는 사업단계 판단이 아니라 고시·인가 전후 반응 보조지표로만 갱신한다.",
      first_files: "analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; analysis/market-transaction-signal-summary.md",
      commands: firstCommand(checklistRows, "monthly_market_data_refresh") || "python3 scripts/normalize-market-manual-import.py",
      network_required: "Y/API_or_manual",
      decision_gate: decisionRuleFor(checklistRows, "monthly_market_data_refresh"),
      stop_condition: "normalizedTransactions와 latest_deal_ymd가 갱신되고 사업장 비교표가 재생성됨",
      output_to_update: "data/market/manual-import/files/ 또는 data/market/manual-import/download-intake.json",
    },
  ];
}

function summarize(rows) {
  const countBy = (field) =>
    Object.entries(
      rows.reduce((acc, row) => {
        const key = row[field] || "미분류";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `${key} ${count}`)
      .join("; ");
  return {
    generated_at: `${kstDate()} KST`,
    session_count: rows.length,
    network_session_count: rows.filter((row) => row.network_required !== "N").length,
    local_session_count: rows.filter((row) => row.network_required === "N").length,
    cadence_mix: countBy("cadence"),
    network_mix: countBy("network_required"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# 리서치 세션 플레이북

작성 기준: ${summary.generated_at}

이 문서는 강남·잠실/송파·구의/광진 재개발·재건축 리서치를 실제 작업 세션으로 나누는 운영표다. 원격 수집이 필요한 세션은 명령과 판정 기준만 제시하며, 새 값은 공식 원문이나 회신 증거가 있을 때만 승격한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 세션 | ${summary.session_count} |
| 로컬 세션 | ${summary.local_session_count} |
| 원격/API/수동 검색 세션 | ${summary.network_session_count} |

| 구분 | 값 |
| --- | --- |
| 주기 | ${summary.cadence_mix} |
| 원격 여부 | ${summary.network_mix} |

## 세션별 실행표

${mdTable(rows, [
    { key: "session_id", label: "세션" },
    { key: "duration", label: "시간" },
    { key: "cadence", label: "주기" },
    { key: "trigger", label: "트리거" },
    { key: "objective", label: "목적" },
    { key: "network_required", label: "원격" },
    { key: "first_files", label: "먼저 열 파일" },
    { key: "commands", label: "명령/액션" },
    { key: "decision_gate", label: "판정 gate" },
    { key: "stop_condition", label: "멈출 조건" },
  ])}

## 빠른 선택

- 15분만 있으면 \`S-15M-TRIAGE\`로 오늘 열 사업 하나를 고른다.
- 공식 회신이나 정보공개를 처리할 때는 \`S-P0-FILING\`만 실행한다.
- 새 고시·공고·보도자료를 발견하면 먼저 \`S-NEW-UPDATE\`에 넣고, 바로 가설을 바꾸지 않는다.
- 확장 관심권 점검은 \`S-EXPANSION-LATEST\`로 따로 돌리고, create/reuse 판단은 intake seed 보드 기준으로 맞춘다.
- 현장 답사 전후에는 \`S-FIELDWORK\`로 관찰값을 같은 스키마에 남긴다.
- 주간 점검은 \`S-WEEKLY-OFFICIAL\`이고, 원격 수집 뒤에는 항상 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.

## 운영 원칙

- 원격 수집 명령은 최신 확인용이다. 결과를 바로 확정값으로 쓰지 않고 원문/회신/로컬 텍스트 gate를 통과시킨다.
- 세션 하나가 끝나면 output_to_update에 적힌 파일만 갱신하고 전체 재생성으로 downstream 변화를 확인한다.
- P0 3건은 세션 플레이북의 예외가 아니라 \`S-P0-FILING\`으로만 닫는다.
`;
}

async function main() {
  const [personalHome, focusDecisionMemo, dueDiligenceBoard, completionCockpit, runbookChecklist, changeBoard, intakeBoard, expansionIntakeSeedBoard, pairComparisonBoard] = await Promise.all(
    Object.values(INPUTS).map((file) => readJson(file)),
  );
  const rows = buildSessionRows({
    personalHome,
    focusDecisionMemo,
    dueDiligenceBoard,
    completionCockpit,
    runbookChecklist,
    changeBoard,
    intakeBoard,
    expansionIntakeSeedBoard,
    pairComparisonBoard,
  });
  const summary = summarize(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ sessions: rows.length, output: "analysis/research-session-playbook.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
