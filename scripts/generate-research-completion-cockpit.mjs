#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-completion-cockpit.md");
const OUT_CSV = path.join(OUT_DIR, "research-completion-cockpit.csv");
const OUT_JSON = path.join(OUT_DIR, "research-completion-cockpit.json");

const INPUTS = {
  marketDownloadWorkbook: "analysis/market-manual-download-workbook.json",
  marketDownloadStatus: "analysis/market-manual-download-status.json",
  marketIngestManifest: "analysis/market-manual-ingest-manifest.json",
  marketColumnAudit: "analysis/market-manual-column-audit.json",
  marketNormalizationAudit: "analysis/market-manual-normalization-audit.json",
  marketApiReadiness: "analysis/market-api-readiness-audit.json",
  highBlockingEscalation: "analysis/high-blocking-source-escalation-packet.json",
  highBlockingInfoDisclosure: "analysis/high-blocking-info-disclosure-packet.json",
  highBlockingResponseDrafts: "analysis/high-blocking-response-decision-drafts.json",
  highBlockingFilingTracker: "analysis/high-blocking-filing-tracker.json",
  highBlockingIntakeValidation: "analysis/high-blocking-intake-validation.json",
  highBlockingFilingOutbox: "data/review/high-blocking-filing-outbox/manifest.json",
  highBlockingFilingChecklist: "analysis/high-blocking-filing-checklist.json",
  officialRunbookChecklist: "analysis/official-update-runbook-checklist.json",
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

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function pushTask(tasks, row) {
  tasks.push({
    task_id: row.task_id,
    blocker_area: row.blocker_area,
    priority: row.priority,
    status: row.status,
    required_evidence: row.required_evidence,
    next_action: row.next_action,
    source_file: row.source_file,
    update_file: row.update_file || "",
    verification_command: row.verification_command || "node scripts/regenerate-research-artifacts.mjs",
    completion_gate: row.completion_gate,
    sort_order: row.sort_order,
  });
}

function marketTasks(data) {
  const tasks = [];
  const downloadSummary = data.marketDownloadStatus.summary || {};
  const ingestSummary = data.marketIngestManifest.summary || {};
  const columnSummary = data.marketColumnAudit.summary || {};
  const normalizationSummary = data.marketNormalizationAudit.summary || {};
  const apiSummary = data.marketApiReadiness.summary || {};
  const taskCount = Number(downloadSummary.task_count || 0);
  const filePresentCount = Number(downloadSummary.file_present_count || 0);
  const waitingDownloadCount = Number(downloadSummary.waiting_for_download_count || 0);
  const normalizedTransactions = Number(normalizationSummary.normalized_transactions || 0);
  const normalizedIndicators = Number(normalizationSummary.normalized_indicators || 0);
  const projectMatchedTransactions = Number(normalizationSummary.project_matched_transactions || 0);
  const hasManualMarketCoverage = normalizedTransactions > 0 && projectMatchedTransactions > 0;

  if (filePresentCount < taskCount) {
    const onlyRoneWaiting = hasManualMarketCoverage && waitingDownloadCount === 1;
    pushTask(tasks, {
      task_id: "MKT-01",
      blocker_area: "market_data_collection",
      priority: onlyRoneWaiting ? "P1" : "P0",
      status: onlyRoneWaiting ? "r_one_indicator_waiting" : "waiting_for_download",
      required_evidence: `${taskCount}개 수동 다운로드 작업 중 파일 존재 ${filePresentCount}개, 대기 ${waitingDownloadCount}개. 정규화 거래 ${normalizedTransactions}행, 사업장 매칭 ${projectMatchedTransactions}행, 지표 ${normalizedIndicators}행`,
      next_action: onlyRoneWaiting
        ? "남은 R-ONE 지역 가격지수·거래현황 파일만 공식 통계 다운로드 또는 별도 API로 보강한다."
        : "node scripts/sync-market-manual-download-intake.mjs로 70개 intake 행을 맞춘 뒤, analysis/market-manual-download-workbook.md의 작업을 공식 사이트에서 내려받아 data/market/manual-import/files/에 저장하거나 download-intake local_path를 채운다.",
      source_file: "analysis/market-manual-download-workbook.md",
      update_file: "data/market/manual-import/files/ 또는 data/market/manual-import/download-intake.json",
      verification_command:
        "node scripts/regenerate-research-artifacts.mjs --only=market-manual-download-status,market-manual-ingest-manifest,market-manual-column-audit,market-manual-normalization-audit,research-completion-cockpit,research-system-readiness-audit",
      completion_gate: onlyRoneWaiting
        ? "R-ONE 지표가 반입되거나, 현 단계에서는 거래·전월세 원자료 분석으로 충분하다는 명시 보류 사유가 남음"
        : "market-manual-download-status file_present_count가 필요한 작업 범위를 커버하고, waiting_for_download가 0 또는 명시 보류 상태",
      sort_order: 10,
    });
  }

  if (!hasManualMarketCoverage && Number(apiSummary.fetchable_plan_count || 0) === 0 && Number(apiSummary.blocked_plan_count || 0) > 0) {
    pushTask(tasks, {
      task_id: "MKT-02",
      blocker_area: "market_data_collection",
      priority: "P0",
      status: "api_keys_missing",
      required_evidence: `API 계획 ${apiSummary.plan_count || 0}개 중 수집 가능 ${apiSummary.fetchable_plan_count || 0}개, 키 누락 ${apiSummary.blocked_plan_count || 0}개`,
      next_action: "DATA_GO_KR_SERVICE_KEY와 SEOUL_OPEN_DATA_KEY를 준비하거나, API 없이 수동 다운로드 파일로 동일 기간을 채운다.",
      source_file: "data/market/API_KEYS.md",
      update_file: "환경변수 또는 data/market/manual-import/files/",
      verification_command: "node scripts/fetch-market-raw-data.mjs --diagnose --from=202401 --to=202606",
      completion_gate: "API 스모크 수집 또는 수동 원자료 정규화가 후보 30개 분석에 충분한 기간·지역을 커버",
      sort_order: 20,
    });
  }

  if (Number(ingestSummary.local_path_count || 0) === 0) {
    pushTask(tasks, {
      task_id: "MKT-03",
      blocker_area: "market_data_collection",
      priority: "P1",
      status: "ingest_manifest_empty",
      required_evidence: `반입 manifest ${ingestSummary.ingest_row_count || 0}행, 파일 경로 설정 ${ingestSummary.local_path_count || 0}개`,
      next_action: "작업별 파일을 저장한 뒤 ingest-manifest를 재생성해 컬럼 감사 입력으로 승격한다.",
      source_file: "analysis/market-manual-ingest-manifest.md",
      update_file: "data/market/manual-import/ingest-manifest.json",
      verification_command: "node scripts/generate-market-manual-ingest-manifest.mjs",
      completion_gate: "ingest-manifest에 실제 local_path가 있고 컬럼 감사가 파일을 파싱",
      sort_order: 30,
    });
  }

  if (Number(columnSummary.ready_for_mapping_count || 0) === 0) {
    pushTask(tasks, {
      task_id: "MKT-04",
      blocker_area: "market_data_collection",
      priority: "P1",
      status: "column_mapping_not_ready",
      required_evidence: `파싱 가능 파일 ${columnSummary.parsed_file_count || 0}개, 매핑 준비 ${columnSummary.ready_for_mapping_count || 0}개, 파일 대기 ${columnSummary.waiting_for_file_count || 0}개`,
      next_action: "원자료 파일이 들어온 뒤 컬럼 감사 결과를 보고 column-mapping.json의 누락 필드를 보강한다.",
      source_file: "analysis/market-manual-column-audit.md",
      update_file: "data/market/manual-import/column-mapping.json",
      verification_command: "python3 scripts/generate-market-manual-column-audit.py",
      completion_gate: "필수 컬럼이 매핑되어 정규화 스크립트가 raw rows를 읽음",
      sort_order: 40,
    });
  }

  if (normalizedTransactions === 0 && normalizedIndicators === 0) {
    pushTask(tasks, {
      task_id: "MKT-05",
      blocker_area: "market_data_collection",
      priority: "P0",
      status: "normalized_market_rows_missing",
      required_evidence: `정규화 거래 ${normalizationSummary.normalized_transactions || 0}행, 사업장 매칭 ${normalizationSummary.project_matched_transactions || 0}행, 지표 ${normalizationSummary.normalized_indicators || 0}행`,
      next_action: "수동 원자료 또는 API 원자료를 정규화해 후보 사업장 거래/지표 매칭 결과를 생성한다.",
      source_file: "analysis/market-manual-normalization-audit.md",
      update_file: "data/market/transactions/ 또는 data/market/indicators/",
      verification_command: "python3 scripts/normalize-market-manual-import.py",
      completion_gate: "후보 30개 분석에 사용할 거래/지표 행이 생성되고 매칭 결과가 수동 검수 가능",
      sort_order: 50,
    });
  }

  return tasks;
}

function highBlockingTasks(data) {
  const tasks = [];
  const escalationSummary = data.highBlockingEscalation.summary || {};
  const infoSummary = data.highBlockingInfoDisclosure.summary || {};
  const draftSummary = data.highBlockingResponseDrafts.summary || {};
  const validationSummary = data.highBlockingIntakeValidation.summary || {};
  const outboxSummary = data.highBlockingFilingOutbox.summary || {};
  const filingChecklistSummary = data.highBlockingFilingChecklist.summary || {};
  const packetRows = data.highBlockingInfoDisclosure.rows || [];
  const draftRows = data.highBlockingResponseDrafts.rows || [];

  if (Number(draftSummary.waiting_for_response || 0) > 0) {
    pushTask(tasks, {
      task_id: "SRC-01",
      blocker_area: "source_value_verification",
      priority: "P0",
      status: "official_response_waiting",
      required_evidence: `회신 대기 ${draftSummary.waiting_for_response || 0}건, append 가능 ${draftSummary.ready_to_append || 0}건`,
      next_action: "analysis/high-blocking-source-escalation-packet.md의 담당부서/정보몽땅 문의 본문으로 3개 사업장 회신을 확보하고, node scripts/process-high-blocking-response-workflow.mjs dry-run 검토 후 --write로 반영한다.",
      source_file: "analysis/high-blocking-source-escalation-packet.md",
      update_file: "data/review/high-blocking-source-response-intake.json",
      verification_command: "node scripts/process-high-blocking-response-workflow.mjs",
      completion_gate: "회신 intake가 no_response를 벗어나고 ready_to_append 또는 정보공개/열람 보류 근거로 검증됨",
      sort_order: 100,
    });
  }

  if (Number(infoSummary.ready_to_file_count || 0) > 0) {
    pushTask(tasks, {
      task_id: "SRC-02",
      blocker_area: "source_value_verification",
      priority: "P0",
      status: "info_disclosure_ready",
      required_evidence: `정보공개청구 전환 준비 ${infoSummary.ready_to_file_count || 0}건 / 대상 ${infoSummary.project_count || 0}건, outbox ${outboxSummary.packet_count || 0}건, 접수 준비 checklist ${filingChecklistSummary.ready_to_submit_count || 0}건, intake error ${validationSummary.error_count || 0}건`,
      next_action: "담당부서 회신으로 닫히지 않으면 analysis/high-blocking-filing-checklist.md에서 접수 전 확인·접수 직후 기록 필드·회신 후 승격 규칙을 확인하고, outbox의 사업장별 제출 파일로 정보공개청구 또는 공식 민원을 접수한다.",
      source_file: "analysis/high-blocking-filing-checklist.md",
      update_file: "data/review/high-blocking-source-response-intake.json",
      verification_command: "node scripts/process-high-blocking-response-workflow.mjs",
      completion_gate: "청구 결과에서 원문 URL/자료명/보유부서/부분공개·비공개 사유가 intake에 기록됨",
      sort_order: 110,
    });
  }

  if (Number(escalationSummary.high_blocking_count || 0) > 0) {
    pushTask(tasks, {
      task_id: "SRC-03",
      blocker_area: "source_value_verification",
      priority: "P0",
      status: "high_blocking_fields_unclosed",
      required_evidence: `3개 사업장 ${escalationSummary.field_count || 0}개 필드 중 high blocking ${escalationSummary.high_blocking_count || 0}개`,
      next_action: "회신 또는 정보공개 결과를 process-high-blocking-response-workflow dry-run으로 검증하고 --write로 반영한 뒤 completion audit을 확인한다.",
      source_file: "analysis/high-blocking-source-escalation-packet.md",
      update_file: "data/review/source-verification-closure-decisions.json",
      verification_command: "node scripts/regenerate-research-artifacts.mjs",
      completion_gate: "research-system-readiness-audit에서 high blocking 외부 회신 대기가 사라지고 completion_boundary가 ready 계열로 이동",
      sort_order: 120,
    });
  }

  for (const row of packetRows) {
    pushTask(tasks, {
      task_id: `SRC-P${String(row.rank).padStart(2, "0")}`,
      blocker_area: "source_value_verification",
      priority: "P1",
      status: row.packet_status,
      required_evidence: `${row.project_name}: ${row.remaining_gap}`,
      next_action: row.packet_status === "ready_to_file_if_department_response_not_available"
        ? `우선 ${row.primary_channel}로 문의하고, 미해소 시 analysis/high-blocking-filing-checklist.md의 접수 전 확인 후 정보공개청구 본문을 접수한다.`
        : "회신 intake 상태를 확인한다.",
      source_file: "analysis/high-blocking-filing-checklist.md",
      update_file: "data/review/high-blocking-source-response-intake.json",
      verification_command: "node scripts/process-high-blocking-response-workflow.mjs",
      completion_gate: row.response_promotion_rule,
      sort_order: 130 + Number(row.rank || 0),
    });
  }

  for (const row of draftRows.filter((item) => item.draft_status === "needs_intake_fix")) {
    pushTask(tasks, {
      task_id: `SRC-FIX-${String(row.rank).padStart(2, "0")}`,
      blocker_area: "source_value_verification",
      priority: "P0",
      status: "intake_validation_failed",
      required_evidence: row.validation_issues,
      next_action: "회신 intake의 누락 필드를 보완한다.",
      source_file: "analysis/high-blocking-response-decision-drafts.md",
      update_file: "data/review/high-blocking-source-response-intake.json",
      verification_command: "node scripts/process-high-blocking-response-workflow.mjs",
      completion_gate: "draft_status가 ready_to_append 또는 waiting_for_response로 정리됨",
      sort_order: 90,
    });
  }

  return tasks;
}

function finalAuditTasks(data) {
  const checklistSummary = data.officialRunbookChecklist.summary || {};
  const tasks = [];
  pushTask(tasks, {
    task_id: "AUD-01",
    blocker_area: "completion_boundary",
    priority: "P2",
    status: "final_regeneration_current",
    required_evidence: `현재 로컬 재생성 체인은 ${checklistSummary.checklist_steps || 0}개 체크리스트 단계와 별도 regenerate 명령으로 운영됨`,
    next_action: "high-blocking 회신/정보공개 결과 같은 새 입력을 반영한 뒤 전체 재생성을 다시 실행한다.",
    source_file: "scripts/regenerate-research-artifacts.mjs",
    update_file: "analysis/research-system-readiness-audit.md",
    verification_command: "node scripts/regenerate-research-artifacts.mjs",
    completion_gate: "새 입력 반영 뒤 readiness audit의 not_complete_count가 0이고 completion_boundary가 ready로 판정",
    sort_order: 900,
  });
  return tasks;
}

function markdown({ summary, rows }) {
  const p0 = rows.filter((row) => row.priority === "P0");
  return `# 리서치 Completion Cockpit

작성 기준: ${summary.generated_at}

이 문서는 goal 완료를 막는 남은 필수 증거를 하나의 실행 보드로 묶는다. 이미 읽을 수 있는 비교표와 전략 브리프를 재정의하지 않고, 완료 판정에 필요한 원자료·회신·최종 감사 증거만 추린다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 열린 작업 | ${summary.task_count} |
| P0 | ${summary.p0_count} |
| P1 | ${summary.p1_count} |
| 시장 데이터 작업 | ${summary.market_task_count} |
| 원문 회신 작업 | ${summary.source_task_count} |
| 상태 분포 | ${summary.status_summary} |

## P0 Critical Path

${mdTable(p0, [
  { key: "task_id", label: "ID" },
  { key: "blocker_area", label: "영역" },
  { key: "status", label: "상태" },
  { key: "required_evidence", label: "필요 증거" },
  { key: "next_action", label: "다음 행동" },
  { key: "completion_gate", label: "완료 게이트" },
])}

## 전체 작업 보드

${mdTable(rows, [
  { key: "task_id", label: "ID" },
  { key: "priority", label: "우선" },
  { key: "blocker_area", label: "영역" },
  { key: "status", label: "상태" },
  { key: "source_file", label: "열 파일" },
  { key: "update_file", label: "입력/수정" },
  { key: "verification_command", label: "검증 명령" },
])}

## 완료 판정 규칙

- 시장 데이터는 원자료 파일 또는 API 수집 결과가 실제로 존재하고, 컬럼 감사·정규화·사업장 매칭이 실행된 뒤에만 완료 증거로 본다.
- high blocking 원문은 담당부서/정보몽땅 회신, 정보공개청구 결과, 방문열람 보류 사유 중 하나가 intake와 decision 장부에 남아야 완료 증거로 본다.
- 모든 입력 반영 후 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/research-system-readiness-audit.md\`에서 완료 보류 계열이 사라져야 goal complete 후보로 본다.
`;
}

async function main() {
  const data = Object.fromEntries(
    await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])),
  );
  const rows = [...marketTasks(data), ...highBlockingTasks(data), ...finalAuditTasks(data)].sort((a, b) => a.sort_order - b.sort_order);
  const statusCounts = countBy(rows, "status");
  const summary = {
    generated_at: `${kstDate()} KST`,
    task_count: rows.length,
    p0_count: rows.filter((row) => row.priority === "P0").length,
    p1_count: rows.filter((row) => row.priority === "P1").length,
    market_task_count: rows.filter((row) => row.blocker_area === "market_data_collection").length,
    source_task_count: rows.filter((row) => row.blocker_area === "source_value_verification").length,
    completion_task_count: rows.filter((row) => row.blocker_area === "completion_boundary").length,
    status_counts: statusCounts,
    status_summary: countText(statusCounts),
    inputs: Object.values(INPUTS),
  };
  const cleanRows = rows.map(({ sort_order, ...row }) => row);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: summary.generated_at, summary, rows: cleanRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(cleanRows));
  await writeFile(OUT_MD, markdown({ summary, rows: cleanRows }));
  console.log(JSON.stringify({ tasks: rows.length, p0: summary.p0_count, output: "analysis/research-completion-cockpit.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
