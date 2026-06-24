#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const REVIEW_DIR = "data/review";
const OUT_MD = path.join(OUT_DIR, "official-source-activation-checklist.md");
const OUT_CSV = path.join(OUT_DIR, "official-source-activation-checklist.csv");
const OUT_JSON = path.join(OUT_DIR, "official-source-activation-checklist.json");
const OUT_README = path.join(REVIEW_DIR, "official-source-activation-intake.README.md");
const OUT_EXAMPLES = path.join(REVIEW_DIR, "official-source-activation-intake-examples.json");

const INPUTS = {
  freshnessLedger: "analysis/official-source-freshness-ledger.json",
  runbookChecklist: "analysis/official-update-runbook-checklist.json",
  changeDetectionBoard: "analysis/official-change-detection-board.json",
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

function activationType(row) {
  if (row.freshness_status === "manual_subscription_needed") return "manual_subscription";
  if (row.freshness_status === "api_key_needed") return "api_key";
  if (row.tier === "data" && /manual/.test(row.freshness_status || row.automation_status || "")) return "manual_market_monitoring";
  if (/manual/.test(row.freshness_status || row.automation_status || "")) return "manual_monitoring";
  return "local_ready";
}

function priorityScore(row, changeRow = {}) {
  const type = activationType(row);
  const tierWeight = row.tier === "primary" ? 60 : row.tier === "primary_backstop" ? 45 : row.tier === "context_backstop" ? 30 : row.tier === "context" ? 25 : 20;
  const typeWeight =
    type === "manual_subscription"
      ? 50
      : type === "api_key"
        ? 30
        : type === "manual_market_monitoring"
          ? 25
          : type === "manual_monitoring"
            ? 35
            : 5;
  const highBlockingWeight = Number(changeRow.high_blocking_project_count || 0) * 15;
  const impactedWeight = Math.min(Number(changeRow.impacted_project_count || 0), 30);
  const catalystWeight = Math.min(Number(changeRow.catalyst_trigger_count || 0), 36) / 3;
  return Math.round(tierWeight + typeWeight + highBlockingWeight + impactedWeight + catalystWeight);
}

function requiredSetup(row) {
  const type = activationType(row);
  if (["gangdong_district_notice", "jung_district_notice"].includes(row.source_id)) {
    return "확장 관심권 최신 점검 결과와 direct hit/단계 재확인 메모를 activation intake에 기록";
  }
  if (type === "manual_subscription") {
    return "강남구·송파구·광진구 알림 신청 후 수신 noticeCode/고시번호를 official-update-intake에 기록";
  }
  if (type === "api_key") {
    if (row.source_id === "molit_data_go_kr") return "DATA_GO_KR_SERVICE_KEY를 환경변수로 연결하고 plan-only 뒤 실제 수집 실행";
    return "API 키 또는 파일 다운로드 경로를 확보하고 원자료 파일을 data/market/manual-import에 보존";
  }
  if (type === "manual_market_monitoring") {
    return "지표 코드, 지역 범위, 수동 다운로드 경로를 activation intake에 기록하고 market refresh에 연결";
  }
  if (type === "manual_monitoring") {
    return "월간 검색 키워드와 공식 URL을 official-context-sources 또는 official-update-intake에 기록";
  }
  return "정기 런북 유지";
}

function successGate(row) {
  const type = activationType(row);
  if (["gangdong_district_notice", "jung_district_notice"].includes(row.source_id)) {
    return "자치구 고시공고 최신 점검 메모가 intake에 남아 있고, 강동권은 최신 단계 재확인 여부, 약수권은 direct hit 발생 여부가 구분되어 있다.";
  }
  if (type === "manual_subscription") return "첫 알림을 수신했거나 신청 완료 화면/메모가 intake에 남아 있고, 알림 내용은 원문 확인 전까지 확정 근거로 쓰지 않음";
  if (type === "api_key") return "원자료 파일 또는 API 응답이 로컬에 보존되고 market normalization audit이 blockedSources 0으로 재생성됨";
  if (type === "manual_market_monitoring") {
    return "지표 코드·지역 범위·다운로드 경로가 intake에 남아 있고, 첫 원자료 또는 수동 다운로드 작업이 market refresh 산출물에 반영됨";
  }
  if (type === "manual_monitoring") return "검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음";
  return "weekly/monthly 런북 재생성 성공";
}

function primaryStep(type, row, checklistRows) {
  if (type === "manual_subscription") return row.next_action || row.source_name;
  if (type === "api_key") {
    if (row.source_id !== "molit_data_go_kr") return row.next_action || "";
    return checklistRows.find((item) => item.status === "api_key_required")?.command || row.next_action || "";
  }
  if (type === "manual_market_monitoring") return row.next_action || "";
  return (
    checklistRows.find((item) => item.status === "manual")?.command ||
    checklistRows.find((item) => item.status === "network_required")?.command ||
    checklistRows[0]?.command ||
    row.next_action ||
    ""
  );
}

function buildRows({ freshnessRows, runbookChecklist, changeRows, intakeRows }) {
  const intakeBySource = new Map(intakeRows.map((row) => [row.source_id, row]));
  const changeBySource = new Map(changeRows.map((row) => [row.source_id, row]));
  const checklistByRunbook = new Map();
  for (const row of runbookChecklist.checklistRows || []) {
    if (!checklistByRunbook.has(row.runbook_id)) checklistByRunbook.set(row.runbook_id, []);
    checklistByRunbook.get(row.runbook_id).push(row);
  }

  return freshnessRows
    .filter((row) => !["local_ready", "implemented_for_30_candidates"].includes(row.freshness_status) && !/로컬 분석 가능/.test(row.freshness_status_label || ""))
    .map((row) => {
      const intake = intakeBySource.get(row.source_id) || {};
      const change = changeBySource.get(row.source_id) || {};
      const type = activationType(row);
      const checklistRows = checklistByRunbook.get(row.recommended_runbook) || [];
      const firstManualOrRemote = checklistRows.find((item) => ["manual", "api_key_required", "network_required"].includes(item.status)) || checklistRows[0] || {};
      const activationStatus = intake.activation_status || "planned";
      const issues = [];
      if (!VALID_ACTIVATION_STATUSES.has(activationStatus)) issues.push("unknown_activation_status");
      if (activationStatus === "active" && !intake.activated_at) issues.push("active_without_activated_at");
      if (activationStatus === "active" && type === "api_key" && !/manual-import|market|API|api/i.test(`${intake.notes || ""} ${intake.activation_channel || ""}`)) {
        issues.push("active_api_without_market_note");
      }
      return {
        activation_priority: priorityScore(row, change),
        source_id: row.source_id,
        source_name: row.source_name,
        tier: row.tier,
        activation_type: type,
        freshness_status: row.freshness_status_label || row.freshness_status,
        activation_status: activationStatus,
        issue_count: issues.length,
        issues: issues.join("; "),
        recommended_runbook: row.recommended_runbook,
        first_action: intake.next_action || requiredSetup(row),
        first_command_or_manual_step: primaryStep(type, row, checklistRows) || firstManualOrRemote.command || row.next_action,
        first_files: row.first_outputs_to_read || firstManualOrRemote.first_outputs_to_read || "",
        coverage_to_record: intake.coverage || row.area_scope || "",
        impacted_project_count: Number(change.impacted_project_count || 0),
        high_blocking_project_count: Number(change.high_blocking_project_count || 0),
        catalyst_trigger_count: Number(change.catalyst_trigger_count || 0),
        source_relevance_score: Number(change.source_relevance_score || 0),
        top_impacted_projects: change.top_impacted_projects || "",
        top_catalysts: change.top_catalysts || "",
        activation_channel: intake.activation_channel || row.source_name,
        activated_at: intake.activated_at || "",
        next_check_at: intake.next_check_at || "",
        success_gate: successGate(row),
        update_signal: row.update_signal,
        monitor_unit: row.monitor_unit,
        notes: intake.notes || row.next_action || "",
      };
    })
    .sort((a, b) => b.activation_priority - a.activation_priority || a.source_id.localeCompare(b.source_id));
}

function exampleForRow(row) {
  const base = {
    source_id: row.source_id,
    activation_status: row.activation_type === "manual_subscription" ? "submitted" : "planned",
    activated_at: row.activation_type === "manual_subscription" ? "YYYY-MM-DD KST" : "",
    activation_channel: row.activation_channel,
    coverage: row.coverage_to_record,
    next_check_at: "YYYY-MM-DD KST",
    notes: row.first_action,
  };

  if (row.activation_type === "api_key") {
    base.activation_status = "submitted";
    base.activated_at = "YYYY-MM-DD KST";
    base.credential_or_subscription_note = "키 값 대신 환경변수명, 승인 상태, 호출 범위만 기록";
  } else if (row.activation_type === "manual_market_monitoring") {
    base.credential_or_subscription_note = "지표 코드, 지역 범위, 수동 다운로드 URL/파일명만 기록";
  } else if (row.activation_type === "manual_monitoring") {
    base.credential_or_subscription_note = "검색 키워드, 검색 URL, 월간 점검 주기만 기록";
  } else {
    base.credential_or_subscription_note = "알림 신청 경로와 신청 완료 메모만 기록";
  }

  return base;
}

function summarize(rows, intakeRows) {
  return {
    generated_at: UPDATED_AT,
    activation_source_count: rows.length,
    planned_count: rows.filter((row) => row.activation_status === "planned").length,
    active_count: rows.filter((row) => row.activation_status === "active").length,
    needs_fix_count: rows.filter((row) => row.issue_count > 0).length,
    high_blocking_sensitive_count: rows.filter((row) => row.high_blocking_project_count > 0).length,
    impacted_project_source_count: rows.filter((row) => row.impacted_project_count > 0).length,
    intake_row_count: intakeRows.length,
    type_mix: countBy(rows, "activation_type"),
    status_mix: countBy(rows, "activation_status"),
    freshness_mix: countBy(rows, "freshness_status"),
    impact_mix: countBy(
      rows.map((row) => ({
        impact_bucket:
          row.high_blocking_project_count > 0
            ? "P0 병목 직결"
            : row.impacted_project_count >= 30
              ? "전체 사업장 영향"
              : row.impacted_project_count > 0
                ? "일부 사업장 영향"
                : "시장/운영 보조",
      })),
      "impact_bucket",
    ),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON, OUT_README, OUT_EXAMPLES],
  };
}

function markdown(summary, rows) {
  return `# 공식 출처 활성화 체크리스트

작성 기준: ${UPDATED_AT}

이 문서는 공식 출처 중 아직 수동 알림 신청, 수동 월간 검색, API 키 연결이 필요한 항목을 따로 뽑아 운영 상태를 관리한다. 값 확정은 여전히 공식 원문·회신·로컬 원자료가 있을 때만 한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 활성화 대상 출처 | ${summary.activation_source_count} |
| planned | ${summary.planned_count} |
| active | ${summary.active_count} |
| 보완 필요 | ${summary.needs_fix_count} |
| P0 병목 직결 출처 | ${summary.high_blocking_sensitive_count} |
| 사업장 영향 출처 | ${summary.impacted_project_source_count} |
| intake 행 | ${summary.intake_row_count} |

| 구분 | 값 |
| --- | --- |
| 유형 | ${summary.type_mix} |
| 상태 | ${summary.status_mix} |
| 신선도 | ${summary.freshness_mix} |
| 영향 | ${summary.impact_mix} |

## 활성화 대상

${mdTable(rows, [
    { key: "activation_priority", label: "우선" },
    { key: "source_id", label: "출처" },
    { key: "source_name", label: "출처명" },
    { key: "activation_type", label: "유형" },
    { key: "freshness_status", label: "현재 상태" },
    { key: "activation_status", label: "활성화" },
    { key: "impacted_project_count", label: "영향사업" },
    { key: "high_blocking_project_count", label: "P0" },
    { key: "catalyst_trigger_count", label: "촉매" },
    { key: "issues", label: "이슈" },
    { key: "first_action", label: "첫 액션" },
    { key: "first_command_or_manual_step", label: "명령/수동 단계" },
    { key: "coverage_to_record", label: "기록 범위" },
    { key: "success_gate", label: "완료 gate" },
  ])}

## 영향 큰 출처

${mdTable(
    rows.filter((row) => row.impacted_project_count > 0 || row.high_blocking_project_count > 0).slice(0, 5),
    [
      { key: "activation_priority", label: "우선" },
      { key: "source_id", label: "출처" },
      { key: "source_name", label: "출처명" },
      { key: "top_impacted_projects", label: "상위 영향 사업" },
      { key: "top_catalysts", label: "연결 촉매" },
      { key: "success_gate", label: "완료 gate" },
    ],
  )}

## 입력 파일

\`data/review/official-source-activation-intake.json\`에 수동 상태를 누적한다. API 키나 비밀번호는 기록하지 않고, 신청 상태·출처·다음 확인일만 적는다.

- 복사용 예시: \`data/review/official-source-activation-intake-examples.json\`
- 입력 가이드: \`data/review/official-source-activation-intake.README.md\`
- 검증 보드: \`analysis/official-source-activation-validation.md\`

## 운영 원칙

- 알림 수신은 검색 출발점이다. 고시번호·고시일·원문 URL·첨부명 확인 전에는 확정 근거가 아니다.
- 보도자료·정보소통광장·교통 정책은 \`context_only\`로 기록하고, 고시·계획·교통대책 원문 연결 전까지 가설 승격을 보류한다.
- 시장 데이터 API는 사업 단계 판정 근거가 아니라 고시·인가 전후 시장 반응을 확인하는 보조 신호다.
- 활성화 상태를 바꾼 뒤에는 이 체크리스트와 \`node scripts/regenerate-research-artifacts.mjs\`를 다시 실행한다.
`;
}

function intakeReadme(summary, rows, examples) {
  return `# 공식 출처 활성화 Intake

작성 기준: ${UPDATED_AT}

\`official-source-activation-intake.json\`은 수동 알림 신청, 수동 월간 검색, API 키 연결 같은 출처 활성화 상태를 기록하는 파일이다. 생성 스크립트는 실제 intake JSON을 덮어쓰지 않고 읽기만 한다. 이 README와 예시 파일은 \`node scripts/generate-official-source-activation-checklist.mjs\` 실행 시 활성화 대상 출처 기준으로 갱신된다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 활성화 대상 출처 | ${summary.activation_source_count} |
| planned | ${summary.planned_count} |
| active | ${summary.active_count} |
| 보완 필요 | ${summary.needs_fix_count} |

## 최소 입력 예시

\`\`\`json
${JSON.stringify([examples[0]], null, 2)}
\`\`\`

## 출처별 예시 파일

- \`data/review/official-source-activation-intake-examples.json\`: 현재 활성화 대상 출처 ${summary.activation_source_count}개에 대한 복사용 예시 행
- \`analysis/official-source-activation-checklist.md\`: 실제 입력 후 우선순위, 영향 범위, 완료 gate를 확인하는 운영 보드

## 허용 상태

- \`planned\`: 해야 할 작업으로만 확인
- \`submitted\`: 알림 신청, 키 발급 신청, 월간 검색 루틴 초안을 등록
- \`active\`: 알림 수신, API 호출, 수동 검색 루틴이 실제 운영 가능
- \`blocked\`: 계정/권한/키/사이트 제한 때문에 진행 불가
- \`retired\`: 더 이상 사용하지 않는 출처

## 입력 절차

1. \`data/review/official-source-activation-intake-examples.json\`에서 가장 가까운 출처 예시를 복사한다.
2. \`data/review/official-source-activation-intake.json\` 배열에 붙이고 \`activation_status\`, \`activated_at\`, \`activation_channel\`, \`coverage\`, \`next_check_at\`을 실제 값으로 바꾼다.
3. \`node scripts/generate-official-source-activation-checklist.mjs\`를 실행해 \`issues\`가 생기지 않는지 확인한다.
4. \`node scripts/generate-official-source-activation-validation.mjs\`를 실행해 \`untracked\`, 오류, 경고를 확인한다.
5. 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/official-source-activation-checklist.md\`, \`analysis/official-source-activation-validation.md\`, \`analysis/official-context-search-queue.md\`, \`analysis/research-goal-completion-audit.md\`를 확인한다.

## 운영 규칙

- API 키나 비밀번호는 기록하지 않는다. 환경변수명, 승인 상태, 점검일만 기록한다.
- 알림 수신은 검색 출발점이다. 고시번호·고시일·원문 URL·첨부명 확인 전에는 확정 근거가 아니다.
- context 검색은 \`context_only\`와 \`verified_original\`을 분리한다.
- 시장 데이터는 사업 단계 판정 근거가 아니라 시장 반응 보조 신호다.

## 활성화 대상 요약

${mdTable(rows, [
    { key: "source_id", label: "출처" },
    { key: "activation_type", label: "유형" },
    { key: "activation_status", label: "기본 상태" },
    { key: "coverage_to_record", label: "기록 범위" },
    { key: "success_gate", label: "완료 gate" },
  ])}
`;
}

async function main() {
  const [freshnessLedger, runbookChecklist, changeDetectionBoard, intakeRows] = await Promise.all([
    readJson(INPUTS.freshnessLedger),
    readJson(INPUTS.runbookChecklist),
    readJson(INPUTS.changeDetectionBoard),
    readJson(INPUTS.intake, []),
  ]);
  const rows = buildRows({
    freshnessRows: rowsFrom(freshnessLedger),
    runbookChecklist,
    changeRows: rowsFrom(changeDetectionBoard),
    intakeRows: rowsFrom(intakeRows),
  });
  const examples = rows.map((row) => exampleForRow(row));
  const summary = summarize(rows, rowsFrom(intakeRows));
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(examples, null, 2)}\n`);
  await writeFile(OUT_README, intakeReadme(summary, rows, examples));
  console.log(JSON.stringify({ sources: rows.length, needsFix: summary.needs_fix_count, output: "analysis/official-source-activation-checklist.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
