#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-system-readiness-audit.md");
const OUT_CSV = path.join(OUT_DIR, "research-system-readiness-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "research-system-readiness-audit.json");

const INPUTS = {
  comparison: "analysis/project-comparison-matrix.json",
  evidence: "analysis/source-evidence-audit.json",
  status: "analysis/research-status-dashboard.json",
  officialRegistry: "analysis/official-update-registry.json",
  officialRunbook: "analysis/official-update-runbook.json",
  officialRunbookChecklist: "analysis/official-update-runbook-checklist.json",
  hwpAudit: "analysis/hwp-conversion-audit.json",
  textAudit: "analysis/source-text-extraction-audit.json",
  coreLedger: "analysis/core-value-confirmation-ledger.json",
  sourceLinkCandidates: "analysis/source-link-repair-candidates.json",
  sourceLinkClosure: "analysis/source-link-closure-board.json",
  sourceVerificationSprint: "analysis/source-verification-sprint-plan.json",
  s1CostInfrastructureWorkbook: "analysis/s1-cost-infrastructure-workbook.json",
  s1OriginalEvidenceCandidates: "analysis/s1-original-evidence-candidates.json",
  s1EvidenceReviewBoard: "analysis/s1-evidence-review-board.json",
  s2SourceLinkClosureWorkbook: "analysis/s2-source-link-closure-workbook.json",
  s3OcrImageVerificationWorkbook: "analysis/s3-ocr-image-verification-workbook.json",
  s4StageConflictResolutionWorkbook: "analysis/s4-stage-conflict-resolution-workbook.json",
  s5CoreGapFillWorkbook: "analysis/s5-core-gap-fill-workbook.json",
  sourceVerificationClosureLedger: "analysis/source-verification-closure-ledger.json",
  sourceVerificationActionQueue: "analysis/source-verification-action-queue.json",
  residualGapInterpretation: "analysis/residual-gap-interpretation-audit.json",
  highBlockingSourceEscalation: "analysis/high-blocking-source-escalation-packet.json",
  highBlockingPublicSummaryBoundary: "analysis/high-blocking-public-summary-boundary.json",
  highBlockingPublicWebProbe: "analysis/high-blocking-public-web-probe.json",
  highBlockingOfficialSearchRerun: "analysis/high-blocking-official-search-rerun.json",
  highBlockingContactChannels: "analysis/high-blocking-contact-channel-registry.json",
  highBlockingInfoDisclosurePacket: "analysis/high-blocking-info-disclosure-packet.json",
  highBlockingResponseDecisionDrafts: "analysis/high-blocking-response-decision-drafts.json",
  highBlockingFilingTracker: "analysis/high-blocking-filing-tracker.json",
  highBlockingIntakeValidation: "analysis/high-blocking-intake-validation.json",
  highBlockingFilingOutbox: "data/review/high-blocking-filing-outbox/manifest.json",
  nextMoves: "analysis/research-next-moves.json",
  fieldwork: "analysis/fieldwork-route-planner.json",
  watchlist: "analysis/reassessment-watchlist.json",
  marketPlan: "data/market/market-fetch-plan.json",
  marketApiReadiness: "analysis/market-api-readiness-audit.json",
  marketManualImportReadiness: "analysis/market-manual-import-readiness.json",
  marketManualDownloadWorkbook: "analysis/market-manual-download-workbook.json",
  marketManualDownloadStatus: "analysis/market-manual-download-status.json",
  marketManualIngestManifest: "analysis/market-manual-ingest-manifest.json",
  marketManualColumnAudit: "analysis/market-manual-column-audit.json",
  marketManualNormalizationAudit: "analysis/market-manual-normalization-audit.json",
  researchCompletionCockpit: "analysis/research-completion-cockpit.json",
  cleanupProjects: "data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json",
  coreExpansionSpine: "analysis/core-expansion-research-spine.json",
  lifeAreaExtendedComparison: "analysis/life-area-extended-comparison-board.json",
  expansionZoneWeeklyMonitoring: "analysis/expansion-zone-weekly-monitoring-cockpit.json",
  lifeAreaMonitoringBoard: "analysis/life-area-monitoring-board.json",
};

const STATUS_LABELS = {
  ready: "준비됨",
  substantially_ready: "대체로 준비됨",
  ready_with_uncertainty_flags: "불확실성 표시 후 사용 가능",
  manual_ready: "수동 운영 준비됨",
  operator_ready: "체크리스트 운영 준비됨",
  active_verification_needed: "검증 작업 진행 필요",
  planned_blocked_by_api_key: "계획됨/API 키 필요",
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

async function countProjectNotes() {
  const files = await readdir("project-notes");
  return files.filter((file) => /^\d+-.+\.md$/.test(file)).length;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] ?? "");
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countWhere(rows, predicate) {
  return rows.filter(predicate).length;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function countText(counts, limit = 5) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function sourceList(files) {
  return files.join("; ");
}

function makeRow({
  requirement_id,
  requirement,
  readiness_status,
  evidence_summary,
  current_evidence_files,
  remaining_gap,
  next_action,
  priority,
}) {
  return {
    requirement_id,
    requirement,
    readiness_status,
    readiness_label: STATUS_LABELS[readiness_status] || readiness_status,
    evidence_summary,
    current_evidence_files: sourceList(current_evidence_files),
    remaining_gap,
    next_action,
    priority,
  };
}

function buildRows(data, projectNoteCount) {
  const {
    comparison,
    evidence,
    status,
    officialRegistry,
    officialRunbook,
    officialRunbookChecklist,
    hwpAudit,
    textAudit,
    coreLedger,
    sourceLinkCandidates,
    sourceLinkClosure,
    sourceVerificationSprint,
    s1CostInfrastructureWorkbook,
    s1OriginalEvidenceCandidates,
    s1EvidenceReviewBoard,
    s2SourceLinkClosureWorkbook,
    s3OcrImageVerificationWorkbook,
    s4StageConflictResolutionWorkbook,
    s5CoreGapFillWorkbook,
    sourceVerificationClosureLedger,
    sourceVerificationActionQueue,
    residualGapInterpretation,
    highBlockingSourceEscalation,
    highBlockingPublicSummaryBoundary,
    highBlockingPublicWebProbe,
    highBlockingOfficialSearchRerun,
    highBlockingContactChannels,
    highBlockingInfoDisclosurePacket,
    highBlockingResponseDecisionDrafts,
    highBlockingFilingTracker,
    highBlockingIntakeValidation,
    highBlockingFilingOutbox,
    nextMoves,
    fieldwork,
    watchlist,
    marketPlan,
    marketApiReadiness,
    marketManualImportReadiness,
    marketManualDownloadWorkbook,
    marketManualDownloadStatus,
    marketManualIngestManifest,
    marketManualColumnAudit,
    marketManualNormalizationAudit,
    researchCompletionCockpit,
    cleanupProjects,
    coreExpansionSpine,
    lifeAreaExtendedComparison,
    expansionZoneWeeklyMonitoring,
    lifeAreaMonitoringBoard,
  } = data;

  const focusCounts = countBy(comparison, "focus_area");
  const evidenceGrades = countBy(evidence, "evidence_grade");
  const readinessCounts = countBy(status, "readiness");
  const ledgerStatuses = countBy(coreLedger, "verification_status");
  const ledgerPriorities = countBy(coreLedger, "related_task_priority");
  const marketStatuses = countBy(marketPlan, "status");
  const marketSources = countBy(marketPlan, "source");
  const marketReadiness = marketApiReadiness.summary || {};
  const marketManualImportSummary = marketManualImportReadiness.summary || {};
  const marketManualDownloadSummary = marketManualDownloadWorkbook.summary || {};
  const marketManualDownloadStatusSummary = marketManualDownloadStatus.summary || {};
  const marketManualIngestSummary = marketManualIngestManifest.summary || {};
  const marketManualColumnSummary = marketManualColumnAudit.summary || {};
  const marketManualNormalizationSummary = marketManualNormalizationAudit.summary || {};
  const completionCockpitSummary = researchCompletionCockpit.summary || {};
  const coreExpansionSummary = coreExpansionSpine.summary || {};
  const lifeAreaExtendedSummary = lifeAreaExtendedComparison.summary || {};
  const expansionZoneWeeklySummary = expansionZoneWeeklyMonitoring.summary || {};
  const lifeAreaMonitoringSummary = lifeAreaMonitoringBoard.summary || {};
  const sprintSummary = sourceVerificationSprint.summary || {};
  const s1Summary = s1CostInfrastructureWorkbook.summary || {};
  const s1EvidenceSummary = s1OriginalEvidenceCandidates.summary || {};
  const s1ReviewSummary = s1EvidenceReviewBoard.summary || {};
  const s2ClosureSummary = s2SourceLinkClosureWorkbook.summary || {};
  const s3OcrSummary = s3OcrImageVerificationWorkbook.summary || {};
  const s4StageSummary = s4StageConflictResolutionWorkbook.summary || {};
  const s5GapSummary = s5CoreGapFillWorkbook.summary || {};
  const closureLedgerSummary = sourceVerificationClosureLedger.summary || {};
  const actionQueueSummary = sourceVerificationActionQueue.summary || {};
  const residualGapSummary = residualGapInterpretation.summary || {};
  const highBlockingEscalationSummary = highBlockingSourceEscalation.summary || {};
  const highBlockingBoundarySummary = highBlockingPublicSummaryBoundary.summary || {};
  const highBlockingWebProbeSummary = highBlockingPublicWebProbe.summary || {};
  const highBlockingOfficialSearchRerunSummary = highBlockingOfficialSearchRerun.summary || {};
  const highBlockingContactSummary = highBlockingContactChannels.summary || {};
  const highBlockingInfoDisclosureSummary = highBlockingInfoDisclosurePacket.summary || {};
  const highBlockingResponseDraftSummary = highBlockingResponseDecisionDrafts.summary || {};
  const highBlockingFilingTrackerSummary = highBlockingFilingTracker.summary || {};
  const highBlockingIntakeValidationSummary = highBlockingIntakeValidation.summary || {};
  const highBlockingFilingOutboxSummary = highBlockingFilingOutbox.summary || {};
  const watchLevels = countBy(watchlist, "watch_level");
  const nextTracks = countBy(nextMoves, "track");
  const hwpStatuses = countBy(hwpAudit, "extraction_status");
  const hwpReviews = countBy(hwpAudit, "review_status");
  const textStatuses = countBy(textAudit, "extraction_status");
  const textReviews = countBy(textAudit, "review_priority");
  const registryAutomation = countBy(officialRegistry, "automation_status");
  const runbookChecklistSummary = officialRunbookChecklist.summary || {};
  const runbookChecklistStatus = runbookChecklistSummary.status_counts || {};
  const marketReadyProjects = countWhere(comparison, (row) => row.market_data_status === "ready_for_api_key");
  const directSourceLinkMatches = countWhere(sourceLinkCandidates, (row) => row.candidate_status === "direct_value_match");
  const directSourceLinkP0 = countWhere(sourceLinkCandidates, (row) => row.candidate_status === "direct_value_match" && row.priority === "P0");
  const noLocalSourceLink = countWhere(sourceLinkCandidates, (row) => row.candidate_status === "no_local_candidate");
  const originalNoticeUrlClosed = countWhere(sourceLinkClosure, (row) => row.closure_status === "original_notice_url_available");
  const localOriginalTextUrlPending = countWhere(sourceLinkClosure, (row) => row.closure_status === "local_original_notice_text_url_pending");
  const officialSummaryOriginalNoticePending = countWhere(
    sourceLinkClosure,
    (row) => row.closure_status === "official_summary_value_match_original_notice_pending",
  );
  const interimOfficialCorroboration = countWhere(coreLedger, (row) => row.interim_official_corroboration);
  const sourceBlockers = sum(nextMoves, "source_blockers");
  const p0Tasks = sum(status, "p0_tasks");
  const p1Tasks = sum(status, "p1_tasks");
  const coreReviewItems = sum(status, "core_review_items");
  const openActionCount = Number(actionQueueSummary.action_count || 0);
  const openActionP0 = Number(actionQueueSummary.p0_count || 0);
  const openActionConflict = Number(actionQueueSummary.conflict_count || 0);
  const residualHighBlocking = Number(residualGapSummary.high_blocking_count || 0);
  const residualMediumBlocking = Number(residualGapSummary.medium_blocking_count || 0);
  const escalationProjectCount = Number(highBlockingEscalationSummary.project_count || 0);
  const escalationFieldCount = Number(highBlockingEscalationSummary.field_count || 0);
  const escalationHighBlockingCount = Number(highBlockingEscalationSummary.high_blocking_count || 0);
  const highBlockingReadyDrafts = Number(highBlockingResponseDraftSummary.ready_to_append || 0);
  const highBlockingWaitingResponses = Number(highBlockingResponseDraftSummary.waiting_for_response || 0);
  const highBlockingIntakeFixes = Number(highBlockingResponseDraftSummary.needs_intake_fix || 0);
  const highBlockingSummarySupported = Number(highBlockingBoundarySummary.summary_supported_count || 0);
  const highBlockingOfficialConflict = Number(highBlockingBoundarySummary.official_conflict_count || 0);
  const highBlockingLayerCandidate = Number(highBlockingBoundarySummary.layer_candidate_count || 0);
  const highBlockingNoticeIdentifierNeeded = Number(highBlockingBoundarySummary.notice_identifier_needed_count || 0);
  const highBlockingManagementAttachmentNeeded = Number(highBlockingBoundarySummary.management_attachment_needed_count || 0);
  const highBlockingWebProbeCount = Number(highBlockingWebProbeSummary.probe_count || 0);
  const highBlockingWebExternalNeeded = Number(highBlockingWebProbeSummary.external_escalation_needed_count || 0);
  const highBlockingRerunProjects = Number(highBlockingOfficialSearchRerunSummary.project_count || 0);
  const highBlockingRerunGwangjinNoCandidate = Number(highBlockingOfficialSearchRerunSummary.gwangjin_no_candidate_count || 0);
  const highBlockingRerunUrbanNoCandidate = Number(highBlockingOfficialSearchRerunSummary.urban_no_candidate_count || 0);
  const highBlockingRerunExternalResponse = Number(highBlockingOfficialSearchRerunSummary.external_response_required_count || 0);
  const highBlockingContactChannelCount = Number(highBlockingContactSummary.channel_count || 0);
  const highBlockingContactProjectCount = Number(highBlockingContactSummary.project_count || 0);
  const highBlockingInfoDisclosureProjects = Number(highBlockingInfoDisclosureSummary.project_count || 0);
  const highBlockingInfoDisclosureReady = Number(highBlockingInfoDisclosureSummary.ready_to_file_count || 0);
  const highBlockingFilingReady = Number(highBlockingFilingTrackerSummary.ready_to_file_count || 0);
  const highBlockingFilingPackets = Number(highBlockingFilingOutboxSummary.packet_count || 0);
  const highBlockingIntakeErrors = Number(highBlockingIntakeValidationSummary.error_count || 0);
  const highBlockingIntakeWarnings = Number(highBlockingIntakeValidationSummary.warning_count || 0);
  const residualInterpretationSummary = residualGapSummary.interpretation_summary || "";
  const sourceVerificationPriority = openActionCount > 0 || residualHighBlocking > 0 ? "P0" : coreReviewItems > 0 || sourceBlockers > 0 ? "P1" : "P2";
  const sourceVerificationNextAction =
    openActionCount > 0
      ? "source-verification-action-queue의 상위 항목부터 열고, 판정 결과를 source-verification-closure-decisions에 반영한 뒤 장부를 재생성"
      : residualHighBlocking > 0
        ? "high-blocking-source-escalation-packet의 사업별 문의 패킷으로 관할 자치구/정보몽땅 확인을 진행하고, 나머지 잔여 항목은 해석 클래스에 따라 비교표 주석으로 유지"
        : "실행 큐는 0건이고 잔여 공란·보류 해석 기준이 있으므로 신규 고시/단계 변경 시 클로저 장부를 다시 생성";
  const sourceVerificationQueueGap =
    openActionCount > 0
      ? `실행 큐 ${openActionCount}건(P0 ${openActionP0}, conflict ${openActionConflict})이 남아 있음`
      : "실행 큐는 0건이며 pending/conflict/open 클로저는 없음";
  const highConfidenceEvidence = countWhere(evidence, (row) => ["A", "B"].includes(row.evidence_grade));
  const lowConfidenceEvidence = countWhere(evidence, (row) => ["C", "D"].includes(row.evidence_grade));
  const textResolved = countWhere(textAudit, (row) => row.resolved_text === "Y" || row.extraction_status);
  const sofficeRequired = countWhere(textAudit, (row) => row.soffice_required === "Y");
  const hwpResolved = countWhere(hwpAudit, (row) => row.resolved_text === "Y" || row.extraction_status);
  const hwpBlocked = countWhere(hwpAudit, (row) => /blocked|error|fail/i.test(`${row.extraction_status} ${row.review_status} ${row.extraction_error}`));
  const immediateWatch = watchLevels.immediate || 0;
  const manualOrUnbuiltSources = countWhere(officialRegistry, (row) => !/implemented|local|script/i.test(`${row.automation_status}`));
  const manualDownloadTaskCount = Number(marketManualDownloadStatusSummary.task_count || 0);
  const manualDownloadFilePresent = Number(marketManualDownloadStatusSummary.file_present_count || 0);
  const manualDownloadWaiting = Number(marketManualDownloadStatusSummary.waiting_for_download_count || 0);
  const manualNormalizedTransactions = Number(marketManualNormalizationSummary.normalized_transactions || 0);
  const manualProjectMatches = Number(marketManualNormalizationSummary.project_matched_transactions || 0);
  const manualNormalizedIndicators = Number(marketManualNormalizationSummary.normalized_indicators || 0);
  const manualMarketCoverageReady = manualNormalizedTransactions > 0 && manualProjectMatches > 0;
  const marketReadinessStatus = manualMarketCoverageReady
    ? manualDownloadWaiting > 0 || manualNormalizedIndicators === 0
      ? "ready_with_uncertainty_flags"
      : "ready"
    : "planned_blocked_by_api_key";
  const marketBlocksCompletion = !manualMarketCoverageReady;
  const marketPriority = manualMarketCoverageReady ? (manualDownloadWaiting > 0 || manualNormalizedIndicators === 0 ? "P1" : "P2") : "P0";
  const marketEvidenceSummary = manualMarketCoverageReady
    ? `공식 수동 다운로드 ${manualDownloadFilePresent}/${manualDownloadTaskCount}개, 정규화 거래/전월세 ${manualNormalizedTransactions}행, 사업장 매칭 ${manualProjectMatches}행, R-ONE 지표 ${manualNormalizedIndicators}행`
    : `시장 API 계획 ${marketPlan.length}개 쿼리, 수동 다운로드 작업 ${marketManualDownloadSummary.task_count || 0}개, 출처 ${countText(marketSources)}, 후보 ${marketReadyProjects}건은 API 키 입력 대기, 원자료 파일 ${marketReadiness.raw_file_count || 0}개, 정규화 거래 파일 ${marketReadiness.normalized_transactions_exists || "N"}`;
  const marketRemainingGap = manualMarketCoverageReady
    ? `서울 열린데이터광장 OA-21275와 국토교통부 RTMS 공식 CSV는 반입·정규화됐다. 남은 공백은 R-ONE 지역 가격지수·거래현황 ${manualDownloadWaiting}개 작업과 개별 사업장 키워드 매칭 검수다. API 키 감사는 여전히 ${countText(marketStatuses, 3)}로 남지만, 현재 1차 분석은 수동 공식 원자료 ${manualDownloadFilePresent}개 파일과 정규화 거래 ${manualNormalizedTransactions}행으로 수행 가능하다. 수동 다운로드 워크북은 ${marketManualDownloadSummary.task_count || 0}개 작업(서울 열린데이터 ${marketManualDownloadSummary.seoul_open_data_task_count || 0}, 국토부 RTMS ${marketManualDownloadSummary.molit_task_count || 0}, R-ONE ${marketManualDownloadSummary.r_one_task_count || 0})이며, 작업별 상태는 ${marketManualDownloadStatusSummary.status_summary || ""}다. 반입 manifest는 ${marketManualIngestSummary.ingest_row_count || 0}개 행, 컬럼 감사는 파싱 가능 파일 ${marketManualColumnSummary.parsed_file_count || 0}개·매핑 준비 ${marketManualColumnSummary.ready_for_mapping_count || 0}개다.`
    : `공식 원자료 다운로드가 충분하지 않다. 현재 API 상태 ${countText(marketStatuses, 3)}. 감사표 기준 키 누락 계획 ${marketReadiness.blocked_plan_count || 0}개, 수집 가능 계획 ${marketReadiness.fetchable_plan_count || 0}개. 수동 다운로드 manifest는 ${marketManualImportSummary.manifest_count || 0}개 항목, 파일 존재 ${marketManualImportSummary.file_present_count || 0}개, 정규화 준비 ${marketManualImportSummary.ready_for_normalization_count || 0}개, 다운로드 대기 ${marketManualImportSummary.waiting_for_download_count || 0}개다. 수동 다운로드 워크북은 API 계획을 ${marketManualDownloadSummary.task_count || 0}개 작업(서울 열린데이터 ${marketManualDownloadSummary.seoul_open_data_task_count || 0}, 국토부 RTMS ${marketManualDownloadSummary.molit_task_count || 0}, R-ONE ${marketManualDownloadSummary.r_one_task_count || 0})으로 압축했다. 작업별 다운로드 상태는 파일 존재 ${manualDownloadFilePresent}개, 컬럼 감사 후보 ${marketManualDownloadStatusSummary.ready_or_date_needed_count || 0}개, 대기 ${manualDownloadWaiting}개이며 상태 분포는 ${marketManualDownloadStatusSummary.status_summary || ""}다. 반입 manifest는 ${marketManualIngestSummary.ingest_row_count || 0}개 행이며, 작업별 파일 행 ${marketManualIngestSummary.task_level_count || 0}개, 출처 manifest 행 ${marketManualIngestSummary.source_level_count || 0}개, 파일 경로 설정 ${marketManualIngestSummary.local_path_count || 0}개다. 컬럼 감사는 파싱 가능 파일 ${marketManualColumnSummary.parsed_file_count || 0}개, 매핑 준비 ${marketManualColumnSummary.ready_for_mapping_count || 0}개, 파일 대기 ${marketManualColumnSummary.waiting_for_file_count || 0}개다. 수동 정규화는 거래 ${manualNormalizedTransactions}행, 사업장 매칭 ${manualProjectMatches}행, 지표 ${manualNormalizedIndicators}행이며, 차단/대기 출처 ${marketManualNormalizationSummary.blocked_source_count || 0}개다`;
  const marketNextAction = manualMarketCoverageReady
    ? "analysis/market-transaction-signal-summary.md로 1차 시장 신호를 보고, R-ONE은 별도 지표 보강으로 처리한다. 개별 사업장 판단 전에는 거래 샘플의 단지명/법정동 매칭을 수동 검수한다."
    : "API 키가 있으면 fetch-market-raw-data 스모크부터 실행하고, 키가 없으면 권장 파일명으로 data/market/manual-import/files/에 저장하거나 download-intake.json에 작업별 local_path를 채운 뒤 수동 다운로드 상태, 반입 manifest, 컬럼 감사, 정규화 감사를 순서대로 갱신";
  const completionMarketGap = marketBlocksCompletion
    ? "API 키 기반 시장 원자료 수집 또는 충분한 수동 원자료 정규화"
    : "";

  return [
    makeRow({
      requirement_id: "official_source_collection",
      requirement: "공식 원천 수집 기반",
      readiness_status: "substantially_ready",
      evidence_summary: `정보몽땅 강남·송파·광진 ${cleanupProjects.length}건, 우선검토 ${comparison.length}건, 생활권 분포 ${countText(focusCounts, 3)}, 공식 근거 A/B ${highConfidenceEvidence}건`,
      current_evidence_files: [
        INPUTS.cleanupProjects,
        INPUTS.comparison,
        INPUTS.evidence,
        "analysis/cleanup-board-review-queue.md",
      ],
      remaining_gap: `근거 C/D ${lowConfidenceEvidence}건과 recordCode/고시 원문 연결 병목은 남아 있음`,
      next_action: "C/D 근거 사업장을 source-link-repair 계열 산출물로 먼저 보정",
      priority: "P0",
    }),
    makeRow({
      requirement_id: "source_text_and_hwp_pipeline",
      requirement: "PDF/HWP/HWPX 원문 텍스트화",
      readiness_status: hwpBlocked || sofficeRequired ? "active_verification_needed" : "ready",
      evidence_summary: `원문 텍스트 ${textResolved}/${textAudit.length}건, 텍스트 상태 ${countText(textStatuses)}, HWP/HWPX ${hwpResolved}/${hwpAudit.length}건, HWP 상태 ${countText(hwpStatuses)}, soffice 필요 ${sofficeRequired}건`,
      current_evidence_files: [INPUTS.textAudit, INPUTS.hwpAudit, "scripts/extract_hwp5_text.py", "scripts/extract_urban_notice_text.py"],
      remaining_gap: `OCR 이미지 확인/짧은 본문 검토 큐: ${countText(textReviews)}; HWP 검토 큐: ${countText(hwpReviews)}`,
      next_action: "OCR 기반 수치는 이미지 판독 로그로 확정하고, HWP 변환은 현재 자체 추출 경로를 유지",
      priority: hwpBlocked || sofficeRequired ? "P0" : "P1",
    }),
    makeRow({
      requirement_id: "project_comparison_surface",
      requirement: "사업장 비교 표면",
      readiness_status: "ready",
      evidence_summary: `우선검토 ${comparison.length}건, 사업별 메모 ${projectNoteCount}건, 리서치 상태 ${status.length}건, 현재 readiness ${countText(readinessCounts)}`,
      current_evidence_files: [INPUTS.comparison, INPUTS.status, "project-notes/README.md"],
      remaining_gap: "비교 표는 준비됐지만, 값 확정성이 낮은 필드는 핵심 수치 장부 상태를 같이 봐야 함",
      next_action: "project-comparison-matrix에서 후보를 고른 뒤 project-notes와 core-value-confirmation-ledger를 같이 확인",
      priority: "P1",
    }),
    makeRow({
      requirement_id: "expansion_interest_zone_comparison",
      requirement: "확장 관심권 비교·모니터링",
      readiness_status: "operator_ready",
      evidence_summary: `확장 비교 spine ${coreExpansionSummary.total_rows || 0}행(core ${coreExpansionSummary.core_anchor_count || 0}, expansion ${coreExpansionSummary.expansion_watch_count || 0}, zone ${coreExpansionSummary.expansion_zones || 0}), 생활권 확장 비교 ${lifeAreaExtendedSummary.total_rows || 0}행(core ${lifeAreaExtendedSummary.core_life_area_count || 0}, expansion ${lifeAreaExtendedSummary.expansion_zone_count || 0}), 확장 주간 cockpit zone ${expansionZoneWeeklySummary.zone_count || 0}개·due ${expansionZoneWeeklySummary.due_this_week_count || 0}개·latest stage gap ${expansionZoneWeeklySummary.latest_stage_gap_project_count || 0}개, 모니터링 보드 확장권 ${lifeAreaMonitoringSummary.expansion_zone_count || 0}개·값 confirmed ${lifeAreaMonitoringSummary.value_confirmed_expansion_zone_count || 0}개`,
      current_evidence_files: [
        INPUTS.coreExpansionSpine,
        INPUTS.lifeAreaExtendedComparison,
        INPUTS.expansionZoneWeeklyMonitoring,
        INPUTS.lifeAreaMonitoringBoard,
        "analysis/expansion-zone-latest-check-guide.md",
        "analysis/expansion-official-latest-check-audit.md",
      ],
      remaining_gap: `강동권은 latest stage gap ${expansionZoneWeeklySummary.latest_stage_gap_project_count || 0}개로 최신 단계 재확인이 아직 수동 루프에 남아 있고, 약수동 주변은 원문 비교값은 닫혔지만 direct hit 신규 탐색 자동 루프가 없다. 즉 비교 축은 운영 가능하지만, 확장권 최신 단계 승격은 공식 포털 재확인 뒤에만 허용해야 한다.`,
      next_action: "expansion-zone-weekly-monitoring-cockpit와 life-area-extended-comparison-board를 같이 열어 강동권 최신 단계 재확인, 약수권 direct hit 탐색, 비교표 반영 순서로 주간 루프를 운영",
      priority: "P2",
    }),
    makeRow({
      requirement_id: "source_value_verification",
      requirement: "핵심 수치 원문 검증",
      readiness_status: "active_verification_needed",
      evidence_summary: `핵심 필드 ${coreLedger.length}개, P0 ${ledgerPriorities.P0 || 0}개, P1 ${ledgerPriorities.P1 || 0}개, 실행 패킷 ${sprintSummary.task_count || 0}개/${sprintSummary.sprint_count || 0}스프린트(P0 ${sprintSummary.p0_count || 0}, P1 ${sprintSummary.p1_count || 0}), S1 워크북 ${s1Summary.project_count || 0}개 사업장·공개항목 ${s1Summary.public_item_count || 0}개·원문 스니펫 ${s1Summary.notice_snippet_count || 0}개, S1 원문 수치 후보 ${s1EvidenceSummary.candidate_count || 0}개·리뷰 묶음 ${s1ReviewSummary.review_rows || 0}개, S2 클로저 사업장 ${s2ClosureSummary.project_count || 0}개·필드 ${s2ClosureSummary.closure_field_count || 0}개, S3 OCR 사업장 ${s3OcrSummary.project_count || 0}개·필드 ${s3OcrSummary.field_count || 0}개·수동판정 ${s3OcrSummary.manual_decision_field_count || 0}개, S4 시점충돌 사업장 ${s4StageSummary.project_count || 0}개·필드 ${s4StageSummary.field_count || 0}개, S5 공란보강 사업장 ${s5GapSummary.project_count || 0}개·필드 ${s5GapSummary.field_count || 0}개, 통합 클로저 ${closureLedgerSummary.item_count || 0}건(open ${closureLedgerSummary.open_items || 0}, 판정 ${countText(closureLedgerSummary.closure_status_counts || {}, 6)}, 실행 큐 ${actionQueueSummary.action_count || 0}건/P0 ${actionQueueSummary.p0_count || 0}건, 추가 원문/검색 ${closureLedgerSummary.source_search_required_count || 0}, 확정 검토 ${closureLedgerSummary.ready_to_confirm_count || 0}), 공식 보조근거 직접 일치 ${interimOfficialCorroboration}개, 원문 URL 닫힘 ${originalNoticeUrlClosed}개, 상태 분포 ${countText(ledgerStatuses, 7)}`,
      current_evidence_files: [
        INPUTS.coreLedger,
        "analysis/source-value-verification-queue.json",
        INPUTS.sourceVerificationSprint,
        INPUTS.s1CostInfrastructureWorkbook,
        INPUTS.s1OriginalEvidenceCandidates,
        INPUTS.s1EvidenceReviewBoard,
        INPUTS.s2SourceLinkClosureWorkbook,
        INPUTS.s3OcrImageVerificationWorkbook,
        INPUTS.s4StageConflictResolutionWorkbook,
        INPUTS.s5CoreGapFillWorkbook,
        INPUTS.sourceVerificationClosureLedger,
        INPUTS.sourceVerificationActionQueue,
        INPUTS.residualGapInterpretation,
        INPUTS.highBlockingSourceEscalation,
        INPUTS.highBlockingPublicSummaryBoundary,
        INPUTS.highBlockingPublicWebProbe,
        INPUTS.highBlockingOfficialSearchRerun,
        INPUTS.highBlockingContactChannels,
        INPUTS.highBlockingInfoDisclosurePacket,
        INPUTS.highBlockingResponseDecisionDrafts,
        INPUTS.highBlockingFilingTracker,
        INPUTS.highBlockingIntakeValidation,
        INPUTS.highBlockingFilingOutbox,
        "analysis/source-value-update-candidates.json",
        "analysis/songpa-notice-value-corroboration.json",
        INPUTS.sourceLinkCandidates,
        INPUTS.sourceLinkClosure,
      ],
      remaining_gap: `상태판 기준 P0 ${p0Tasks}개, P1 ${p1Tasks}개, 핵심 검토 항목 ${coreReviewItems}개, 다음 액션의 원문 병목 ${sourceBlockers}개. 통합 클로저 판정은 open ${closureLedgerSummary.open_items || 0}건, confirmed ${closureLedgerSummary.confirmed_items || 0}건, pending ${closureLedgerSummary.pending_items || 0}건, conflict ${closureLedgerSummary.conflict_items || 0}건, deferred ${closureLedgerSummary.deferred_items || 0}건이다. ${sourceVerificationQueueGap}. 잔여 공란·보류 해석은 ${residualGapSummary.residual_field_count || 0}개 필드에 대해 작성됐고, high blocking ${residualHighBlocking}개, medium ${residualMediumBlocking}개다. high blocking 확인 패킷은 ${escalationProjectCount}개 사업장·${escalationFieldCount}개 필드(high ${escalationHighBlockingCount})로 준비됐다. 공식 문의 채널은 ${highBlockingContactProjectCount}개 사업장·${highBlockingContactChannelCount}개 채널로 정리했지만, 채널 자체는 값 확정 근거가 아니며 회신 intake가 필요하다. 공식 요약값 경계표는 참고 가능 요약값 ${highBlockingSummarySupported}개, 공식 출처 간 충돌/시점차 ${highBlockingOfficialConflict}개, 레이어 후보 보류 ${highBlockingLayerCandidate}개, 고시번호·고시일 필요 ${highBlockingNoticeIdentifierNeeded}개, 관리처분 별첨 필요 ${highBlockingManagementAttachmentNeeded}개로 분리한다. 공식 웹 프로브는 ${highBlockingWebProbeCount}건이며, 공개화면만으로 해결되지 않아 외부 확인 필요로 재분류한 근거 ${highBlockingWebExternalNeeded}건을 남긴다. 공식 검색 재실행 감사는 ${highBlockingRerunProjects}개 사업장을 다시 묶었고, 광진구청 no_candidate ${highBlockingRerunGwangjinNoCandidate}건, 서울도시공간포털 no_candidate ${highBlockingRerunUrbanNoCandidate}건, 외부 회신 필요 ${highBlockingRerunExternalResponse}건으로 판정한다. 정보공개청구 패킷은 ${highBlockingInfoDisclosureProjects}개 사업장 중 ${highBlockingInfoDisclosureReady}개가 담당부서 회신 불가 시 바로 접수 가능한 상태이고, 접수 tracker는 접수 필요 ${highBlockingFilingReady}건, 제출 준비 outbox는 ${highBlockingFilingPackets}개 파일이다. intake 검증은 error ${highBlockingIntakeErrors}건, warning ${highBlockingIntakeWarnings}건이다. 회신 decision 초안은 append 가능 ${highBlockingReadyDrafts}개, 회신 대기 ${highBlockingWaitingResponses}개, intake 보완 ${highBlockingIntakeFixes}개다. 해석 분포: ${residualInterpretationSummary}. 원문 링크 후보 직접값 매칭 ${directSourceLinkMatches}개(P0 ${directSourceLinkP0}개), 로컬 본고시 URL 보강 ${localOriginalTextUrlPending}개, 사업개요 보조근거의 본고시 원문 필요 ${officialSummaryOriginalNoticePending}개`,
      next_action: sourceVerificationNextAction,
      priority: sourceVerificationPriority,
    }),
    makeRow({
      requirement_id: "transport_and_fieldwork",
      requirement: "교통입지·현장 답사 체계",
      readiness_status: "ready",
      evidence_summary: `지하철 답사 대상 ${fieldwork.length}건, route_id ${Object.keys(countBy(fieldwork, "route_id")).length}개, 액션 트랙 ${countText(nextTracks)}`,
      current_evidence_files: [INPUTS.fieldwork, "analysis/transport-location-context.json", INPUTS.nextMoves],
      remaining_gap: "현장 사진/체감 동선/혼잡도 기록은 아직 별도 실측 데이터로 쌓이지 않음",
      next_action: "fieldwork-route-planner의 route_question과 onsite_checks를 현장 메모로 채우기",
      priority: "P2",
    }),
    makeRow({
      requirement_id: "risk_and_long_term_potential",
      requirement: "리스크·장기 가능성 비교",
      readiness_status: "ready_with_uncertainty_flags",
      evidence_summary: `장기 가설과 다음 액션 ${nextMoves.length}건, immediate watch ${immediateWatch}건, watch 분포 ${countText(watchLevels)}`,
      current_evidence_files: [
        "analysis/long-term-potential-scorecard.json",
        INPUTS.nextMoves,
        INPUTS.watchlist,
        "analysis/strategic-research-brief.json",
      ],
      remaining_gap: "상방 가설은 원문 확정성과 정책/교통 업데이트에 민감하므로 확신도 격차를 계속 표시해야 함",
      next_action: "strategic-research-brief의 top action과 reassessment-watchlist의 immediate 항목부터 재평가",
      priority: "P1",
    }),
    makeRow({
      requirement_id: "latest_update_monitoring",
      requirement: "최신 업데이트 확인 루틴",
      readiness_status: "operator_ready",
      evidence_summary: `공식 업데이트 출처 ${officialRegistry.length}개, 실행 런북 ${officialRunbook.length}개, 체크리스트 단계 ${runbookChecklistSummary.checklist_steps || 0}개, 체크리스트 상태 ${countText(runbookChecklistStatus, 6)}, 자동화 상태 ${countText(registryAutomation)}`,
      current_evidence_files: [INPUTS.officialRegistry, INPUTS.officialRunbook, INPUTS.officialRunbookChecklist, INPUTS.watchlist],
      remaining_gap: `상시 자동 모니터링/구독은 아직 만들지 않았지만, 원격 호출·API 키·수동 갱신 단계는 체크리스트로 분리됨. 수동 또는 스크립트 실행 대기 출처 ${manualOrUnbuiltSources}개`,
      next_action: "주간 점검 전 official-update-runbook-checklist를 열어 network_required 단계와 followup_local 단계를 순서대로 실행하고 regenerate-research-artifacts로 로컬 산출물 갱신",
      priority: "P2",
    }),
    makeRow({
      requirement_id: "market_data_collection",
      requirement: "부동산 실거래·전월세 시장 데이터",
      readiness_status: marketReadinessStatus,
      evidence_summary: marketEvidenceSummary,
      current_evidence_files: [
        INPUTS.marketPlan,
        INPUTS.marketApiReadiness,
        INPUTS.marketManualImportReadiness,
        INPUTS.marketManualDownloadWorkbook,
        INPUTS.marketManualDownloadStatus,
        INPUTS.marketManualIngestManifest,
        INPUTS.marketManualColumnAudit,
        INPUTS.marketManualNormalizationAudit,
        "data/market/API_KEYS.md",
        "data/market/project-market-areas.json",
        "data/market/manual-import/manifest.json",
        "data/market/manual-import/column-mapping.json",
        "scripts/fetch-market-raw-data.mjs",
        "scripts/generate-market-manual-import-readiness.mjs",
        "scripts/generate-market-manual-column-audit.py",
        "scripts/normalize-market-manual-import.py",
      ],
      remaining_gap: marketRemainingGap,
      next_action: marketNextAction,
      priority: marketPriority,
    }),
    makeRow({
      requirement_id: "reader_handoff_and_index",
      requirement: "읽기 시작점·재생성 체계",
      readiness_status: "ready",
      evidence_summary: `README 색인, analysis 색인, 사업별 메모 ${projectNoteCount}건, 로컬 재생성 스크립트 체인 보유`,
      current_evidence_files: ["README.md", "analysis/README.md", "scripts/regenerate-research-artifacts.mjs", "project-notes/README.md"],
      remaining_gap: "새 원격 수집과 OCR 실행은 재생성 체인 밖의 수동 단계로 남아 있음",
      next_action: "원격 수집 후에는 로컬 regenerate 명령으로 파생 산출물을 한 번에 갱신",
      priority: "P2",
    }),
    makeRow({
      requirement_id: "completion_boundary",
      requirement: "goal 완료 판정 기준",
      readiness_status: "active_verification_needed",
      evidence_summary: marketBlocksCompletion
        ? "리서치 체계는 운영 가능하지만, 시장 원자료 보강과 high blocking 잔여 원문 확인은 아직 남아 있음"
        : "리서치 체계는 운영 가능하지만, high blocking 잔여 원문 확인은 아직 남아 있음",
      current_evidence_files: [
        OUT_MD,
        INPUTS.coreLedger,
        INPUTS.sourceVerificationSprint,
        INPUTS.s1CostInfrastructureWorkbook,
        INPUTS.s1OriginalEvidenceCandidates,
        INPUTS.s1EvidenceReviewBoard,
        INPUTS.s2SourceLinkClosureWorkbook,
        INPUTS.sourceVerificationClosureLedger,
        INPUTS.sourceVerificationActionQueue,
        INPUTS.residualGapInterpretation,
        INPUTS.highBlockingSourceEscalation,
        INPUTS.highBlockingPublicSummaryBoundary,
        INPUTS.highBlockingPublicWebProbe,
        INPUTS.highBlockingContactChannels,
        INPUTS.highBlockingResponseDecisionDrafts,
        INPUTS.highBlockingFilingTracker,
        INPUTS.highBlockingIntakeValidation,
        INPUTS.highBlockingFilingOutbox,
        "data/review/source-verification-closure-decisions.json",
        INPUTS.marketPlan,
        INPUTS.marketManualDownloadWorkbook,
        INPUTS.marketManualDownloadStatus,
        INPUTS.researchCompletionCockpit,
        INPUTS.officialRegistry,
        INPUTS.officialRunbookChecklist,
      ],
      remaining_gap: `현재 상태를 goal 완료로 보려면 ${openActionCount > 0 ? "P0/P1 원문 검증 큐와 " : ""}${marketBlocksCompletion ? `${completionMarketGap} 및 ` : ""}high blocking 잔여 원문 ${residualHighBlocking}건에 대한 외부 회신 또는 정보공개/열람 보류 근거가 필요함. completion cockpit은 열린 작업 ${completionCockpitSummary.task_count || 0}개, P0 ${completionCockpitSummary.p0_count || 0}개, P1 ${completionCockpitSummary.p1_count || 0}개로 집계한다.`,
      next_action: "research-completion-cockpit의 P0 critical path를 처리한 뒤 이 감사표를 goal audit 체크리스트로 사용하고 blocked 항목이 사라질 때까지 완료 처리 보류",
      priority: "P0",
    }),
  ];
}

function buildSummary(rows) {
  const blockerRows = rows.filter((row) => ["active_verification_needed", "planned_blocked_by_api_key"].includes(row.readiness_status));
  return {
    generated_at: `${kstDate()} KST`,
    requirement_count: rows.length,
    status_counts: countBy(rows, "readiness_status"),
    p0_count: blockerRows.filter((row) => row.priority === "P0").length,
    p1_count: blockerRows.filter((row) => row.priority === "P1").length,
    p2_count: blockerRows.filter((row) => row.priority === "P2").length,
    ready_like_count: rows.filter((row) => ["ready", "substantially_ready", "ready_with_uncertainty_flags", "manual_ready", "operator_ready"].includes(row.readiness_status)).length,
    not_complete_count: blockerRows.length,
  };
}

function markdown(rows, summary) {
  const blockers = rows.filter((row) => ["P0", "P1"].includes(row.priority) && ["active_verification_needed", "planned_blocked_by_api_key", "manual_ready"].includes(row.readiness_status));
  const sourceRow = rows.find((row) => row.requirement_id === "source_value_verification");
  const marketRow = rows.find((row) => row.requirement_id === "market_data_collection");
  const sourceHasOpenQueue = /실행 큐 [1-9][0-9]*건/.test(sourceRow?.remaining_gap || "");
  const marketReason = marketRow?.readiness_status === "planned_blocked_by_api_key"
    ? "시장 데이터는 수집 계획과 지역 매핑은 준비됐지만, `DATA_GO_KR_SERVICE_KEY`와 `SEOUL_OPEN_DATA_KEY`가 없거나 충분한 수동 원자료 정규화가 없어 아직 분석 원자료로 쓰기 어렵다."
    : marketRow?.readiness_status === "active_verification_needed"
      ? "시장 데이터 정규화 또는 사업장 매칭이 아직 직접 분석에 충분하지 않다."
      : "";
  return `# 리서치 체계 준비도 감사

작성 기준: ${summary.generated_at}

이 문서는 강남·잠실/송파·구의/광진 핵심 생활권과 강동권·약수동 주변 확장 관심권을 포함한 재개발·재건축 리서치 goal을 요구사항 단위로 감사한 결과다. 기존 분석 산출물이 무엇을 충족하는지, 그리고 무엇 때문에 아직 goal을 완료로 보지 말아야 하는지 분리한다.

## 요약

| 항목 | 값 |
| --- | --- |
| 감사 요구사항 | ${summary.requirement_count}개 |
| 사용 가능 계열 | ${summary.ready_like_count}개 |
| 완료 보류 계열 | ${summary.not_complete_count}개 |
| P0 병목 | ${summary.p0_count}개 |
| P1 병목 | ${summary.p1_count}개 |
| 상태 분포 | ${countText(summary.status_counts, 10)} |

## 요구사항별 감사

${mdTable(rows, [
  { key: "requirement_id", label: "ID" },
  { key: "requirement", label: "요구사항" },
  { key: "readiness_label", label: "준비도" },
  { key: "evidence_summary", label: "현재 증거" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "next_action", label: "다음 행동" },
  { key: "priority", label: "우선순위" },
])}

## 남은 병목

${mdTable(blockers, [
  { key: "requirement", label: "영역" },
  { key: "readiness_label", label: "상태" },
  { key: "remaining_gap", label: "병목" },
  { key: "next_action", label: "처리 방법" },
])}

## 완료로 보지 않는 이유

- ${marketReason || "시장 데이터는 현재 범위의 비교 체계를 직접 막지 않는다."}
- ${
    sourceHasOpenQueue
      ? "핵심 수치 장부와 실행 큐에는 아직 원문 확인 항목이 남아 있다."
      : "원문 검증 실행 큐는 0건이지만 핵심 수치 장부에는 공란·보류·추가 원문 검색 항목이 남아 있다."
  } 비교표는 읽을 수 있지만 모든 수치를 확정값으로 간주하면 안 된다.
- HWP/HWPX 변환은 현재 차단 없이 처리되지만, OCR 이미지 기반 수치는 원문 이미지 판독 로그와 함께만 확정해야 한다.

## 먼저 열 파일

- \`analysis/strategic-research-brief.md\`: 큰 그림과 이번 액션
- \`analysis/research-status-dashboard.md\`: 사업장별 남은 검증 작업
- \`analysis/core-value-confirmation-ledger.md\`: 필드 단위 원문 확정 상태
- \`analysis/residual-gap-interpretation-audit.md\`: 잔여 공란·보류 필드의 비교표 사용 규칙
- \`analysis/reassessment-watchlist.md\`: 업데이트 발생 시 재평가할 사업장
- \`analysis/official-update-runbook-checklist.md\`: 주간/월간 업데이트 점검 실행 단계
- \`data/market/API_KEYS.md\`: 시장 데이터 API 키 준비 절차
`;
}

async function main() {
  const data = Object.fromEntries(await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])));
  const projectNoteCount = await countProjectNotes();
  const rows = buildRows(data, projectNoteCount);
  const summary = buildSummary(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: summary.generated_at, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(`Wrote ${OUT_MD}, ${OUT_CSV}, ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
