#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const REVIEW_DIR = "data/review";
const OUT_MD = path.join(OUT_DIR, "official-update-intake-board.md");
const OUT_CSV = path.join(OUT_DIR, "official-update-intake-board.csv");
const OUT_JSON = path.join(OUT_DIR, "official-update-intake-board.json");
const OUT_README = path.join(REVIEW_DIR, "official-update-intake.README.md");
const OUT_EXAMPLES = path.join(REVIEW_DIR, "official-update-intake-examples.json");

const INPUTS = {
  intake: "data/review/official-update-intake.json",
  registry: "analysis/official-update-registry.json",
  changeBoard: "analysis/official-change-detection-board.json",
  projectMatrix: "analysis/project-comparison-matrix.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
  sourceVerificationBridge: "analysis/official-update-source-verification-bridge.json",
};

const EXPANSION_SOURCE_CONFIG = {
  gangdong_district_notice: {
    trigger_type: "district_notice",
    evidence_status: "unverified",
    route: "expansion_zone_latest_check",
    target:
      "analysis/expansion-gangdong-stage-watch-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json",
    next_action:
      "강동구 고시공고 결과를 강동권 보드에 먼저 적고, 천호3구역·신동아1·2차·성내미주 direct 후보의 최신 단계 공개 여부를 같은 날짜 기준으로 닫는다.",
    example_title: "강동구 고시공고에서 확장 관심권 최신 단계 후보를 발견",
    example_project_name: "천호3구역 / 신동아1·2차 / 성내미주",
    observed_change: "강동권 확장 관심권 3개 direct 후보의 최신 단계·원문 공개 여부 재확인",
  },
  jung_district_notice: {
    trigger_type: "district_notice",
    evidence_status: "unverified",
    route: "expansion_zone_latest_check",
    target:
      "analysis/expansion-yaksu-ocr-recheck-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json",
    next_action:
      "중구 고시공고 결과를 약수권 보드에 먼저 적고, 약수역 direct hit 여부와 신당·금호 인접 대조군 변화를 같은 날짜 기준으로 닫는다.",
    example_title: "중구 고시공고에서 약수권 direct hit 또는 인접 대조군 변화를 발견",
    example_project_name: "신당 제8구역 / 신당 제9구역 / 금호 제14-1",
    observed_change: "약수권 direct hit 여부와 신당·금호 인접 대조군의 원문·단계 변화 재확인",
  },
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

const VALID_TRIGGER_TYPES = new Set([
  "official_notice",
  "cleanup_stage",
  "cleanup_board",
  "district_notice",
  "policy_context",
  "transport_context",
  "market_data",
  "official_response",
  "fieldwork_related",
]);

const VALID_EVIDENCE_STATUSES = new Set([
  "unverified",
  "verified_original",
  "context_only",
  "needs_text_extraction",
  "needs_department_response",
  "rejected",
]);

const VALID_DECISION_STATUSES = new Set(["inbox", "triaged", "applied", "deferred", "rejected"]);

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

function normalizeRows(value) {
  if (Array.isArray(value)) return value;
  return value.rows || [];
}

function completionRanks(rows) {
  const ranks = new Set();
  for (const row of rows) {
    const match = String(row.task_id || "").match(/SRC-P(\d+)/);
    if (match) ranks.add(String(Number(match[1])));
  }
  return ranks;
}

function inferRoute(row, source, changeRow, completionRankSet) {
  const sourceId = row.source_id || "";
  const triggerType = row.trigger_type || "";
  const rank = String(row.project_rank || row.rank || "").trim();
  const isCompletionRank = rank && completionRankSet.has(String(Number(rank)));

  if (EXPANSION_SOURCE_CONFIG[sourceId]) {
    return {
      route: EXPANSION_SOURCE_CONFIG[sourceId].route,
      target: EXPANSION_SOURCE_CONFIG[sourceId].target,
      next_action: EXPANSION_SOURCE_CONFIG[sourceId].next_action,
    };
  }
  if (triggerType === "official_response" || isCompletionRank || row.evidence_status === "needs_department_response") {
    return {
      route: "high_blocking_response_intake",
      target: "data/review/high-blocking-source-response-intake.json",
      next_action: "회신값, 고시번호, 고시일, 원문 URL, 첨부명을 입력한 뒤 process-high-blocking-response-workflow dry-run",
    };
  }
  if (["seoul_urban_notice", "district_notice", "seoul_sibo"].includes(sourceId) || ["official_notice", "district_notice"].includes(triggerType)) {
    return {
      route: "source_verification_decision",
      target: "data/review/source-verification-closure-decisions.json",
      next_action: "analysis/official-update-source-verification-bridge.md에서 candidate closure_id와 권장 상태를 확인한 뒤 source verification decision 또는 applied로 반영",
    };
  }
  if (["cleanup_project_status", "cleanup_notice"].includes(sourceId) || ["cleanup_stage", "cleanup_board"].includes(triggerType)) {
    return {
      route: "project_note_and_risk_review",
      target: "project-notes/*.md; analysis/project-risk-signal-summary.md",
      next_action: "단계·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영",
    };
  }
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId) || ["policy_context", "transport_context"].includes(triggerType)) {
    return {
      route: "official_context_source",
      target: "analysis/official-context-sources.csv",
      next_action: "context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류",
    };
  }
  if (["seoul_open_data", "molit_data_go_kr", "r_one"].includes(sourceId) || triggerType === "market_data") {
    return {
      route: "market_manual_or_api_intake",
      target: "data/market/manual-import/manifest.json; data/market/manual-import/download-intake.json",
      next_action: "원자료 파일을 보존하고 normalization audit 재생성 후 시장 반응 보조 신호로만 사용",
    };
  }
  return {
    route: changeRow?.primary_runbook || source?.automation_status || "manual_triage",
    target: changeRow?.intake_target || "analysis/official-update-intake-board.md",
    next_action: changeRow?.decision_gate || "출처와 증거 상태를 보완한 뒤 다시 triage",
  };
}

function validateRow(row, sourceIds, projectRanks) {
  const issues = [];
  const sourceId = row.source_id || "";
  const projectRank = String(row.project_rank || row.rank || "").trim();
  const evidenceStatus = row.evidence_status || "unverified";
  const decisionStatus = row.decision_status || "inbox";
  const triggerType = row.trigger_type || "";

  if (!row.update_id) issues.push("missing_update_id");
  if (!row.discovered_at) issues.push("missing_discovered_at");
  if (!sourceId) issues.push("missing_source_id");
  else if (!sourceIds.has(sourceId)) issues.push("unknown_source_id");
  if (triggerType && !VALID_TRIGGER_TYPES.has(triggerType)) issues.push("unknown_trigger_type");
  if (!VALID_EVIDENCE_STATUSES.has(evidenceStatus)) issues.push("unknown_evidence_status");
  if (!VALID_DECISION_STATUSES.has(decisionStatus)) issues.push("unknown_decision_status");
  if (projectRank && !projectRanks.has(String(Number(projectRank)))) issues.push("unknown_project_rank");
  if (decisionStatus === "applied" && evidenceStatus !== "verified_original") issues.push("applied_without_verified_original");
  if (evidenceStatus === "verified_original" && !row.official_url && !row.attachment_paths && !row.local_text_paths) issues.push("verified_without_evidence_path");

  return issues;
}

function buildTemplateRows(changeRows) {
  return changeRows.map((row) => ({
    source_id: row.source_id,
    source_name: row.source_name,
    suggested_update_id: `upd-YYYYMMDD-${row.source_id}`,
    trigger_type: triggerTypeForSource(row.source_id),
    minimum_fields: "update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status",
    first_route: row.intake_target,
    first_action: row.first_command_or_action || row.next_action,
    decision_gate: row.decision_gate,
  }));
}

function evidenceStatusForSource(sourceId) {
  if (EXPANSION_SOURCE_CONFIG[sourceId]) return EXPANSION_SOURCE_CONFIG[sourceId].evidence_status;
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId)) return "context_only";
  if (["seoul_urban_notice", "district_notice", "seoul_sibo"].includes(sourceId)) return "needs_text_extraction";
  return "unverified";
}

function exampleForTemplate(row, index) {
  const sourceId = row.source_id;
  const expansionConfig = EXPANSION_SOURCE_CONFIG[sourceId];
  const isOfficialNotice = ["seoul_urban_notice", "district_notice", "seoul_sibo"].includes(sourceId);
  const isContext = ["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId);
  const isMarket = ["seoul_open_data", "molit_data_go_kr", "r_one"].includes(sourceId);
  const example = {
    update_id: `upd-YYYYMMDD-${String(index + 1).padStart(4, "0")}`,
    discovered_at: "YYYY-MM-DD KST",
    source_id: sourceId,
    update_date: "YYYY-MM-DD",
    title: expansionConfig?.example_title || (isMarket ? "공식 시장 원자료 갱신 제목" : isContext ? "공식 정책/교통 context 제목" : "공식 고시/공고 제목"),
    official_url: "https://...",
    project_rank: isMarket || sourceId === "seoul_urban_alert" || expansionConfig ? "" : "관심 사업장 순위 또는 빈값",
    project_name:
      expansionConfig?.example_project_name || (isMarket || sourceId === "seoul_urban_alert" ? "" : "관심 사업장명 또는 빈값"),
    trigger_type: row.trigger_type,
    notice_no: isOfficialNotice || expansionConfig ? "고시/공고번호 또는 빈값" : "",
    attachment_paths: isOfficialNotice && !expansionConfig ? "data/.../downloaded-original.pdf 또는 hwp" : "",
    local_text_paths: isOfficialNotice && !expansionConfig ? "data/.../extracted-text.txt" : "",
    observed_change: expansionConfig?.observed_change || (isOfficialNotice
      ? "고시번호·고시일·원문 첨부 확인 후보"
      : isContext
        ? "생활권/공공 촉매 context 변화"
        : "시장 원자료 또는 공개자료 갱신"),
    evidence_status: evidenceStatusForSource(sourceId),
    decision_status: "inbox",
    notes: "원문 확인 전에는 확정값으로 승격하지 않음",
  };
  return example;
}

function triggerTypeForSource(sourceId) {
  if (EXPANSION_SOURCE_CONFIG[sourceId]) return EXPANSION_SOURCE_CONFIG[sourceId].trigger_type;
  if (sourceId === "cleanup_project_status") return "cleanup_stage";
  if (sourceId === "cleanup_notice") return "cleanup_board";
  if (sourceId === "district_notice") return "district_notice";
  if (["seoul_citybuild_news", "opengov"].includes(sourceId)) return "policy_context";
  if (sourceId === "seoul_traffic_news") return "transport_context";
  if (["seoul_open_data", "molit_data_go_kr", "r_one"].includes(sourceId)) return "market_data";
  return "official_notice";
}

function buildRows({ intake, registry, changeBoard, projectMatrix, completionCockpit, sourceVerificationBridge }) {
  const sourceIds = new Set(registry.map((row) => row.source_id));
  const sourceById = new Map(registry.map((row) => [row.source_id, row]));
  const changeBySource = new Map((changeBoard.rows || []).map((row) => [row.source_id, row]));
  const projectRows = normalizeRows(projectMatrix);
  const projectRanks = new Set(projectRows.map((row) => String(Number(row.rank))));
  const projectByRank = new Map(projectRows.map((row) => [String(Number(row.rank)), row]));
  const completionRankSet = completionRanks(completionCockpit.rows || []);
  const bridgeRows = sourceVerificationBridge?.updateRows || [];
  const bridgeByUpdateId = new Map(bridgeRows.map((row) => [row.update_id, row]));

  return intake.map((raw, index) => {
    const row = { ...raw };
    const source = sourceById.get(row.source_id);
    const changeRow = changeBySource.get(row.source_id);
    const rank = String(row.project_rank || row.rank || "").trim();
    const project = rank ? projectByRank.get(String(Number(rank))) : null;
    const issues = validateRow(row, sourceIds, projectRanks);
    const route = inferRoute(row, source, changeRow, completionRankSet);
    const status = issues.some((issue) => /missing|unknown|without/.test(issue)) ? "needs_fix" : row.decision_status || "inbox";
    const bridge = bridgeByUpdateId.get(row.update_id) || {};

    return {
      row_no: index + 1,
      update_id: row.update_id || `missing-${index + 1}`,
      discovered_at: row.discovered_at || "",
      source_id: row.source_id || "",
      source_name: source?.source_name || row.source_name || "",
      project_rank: rank,
      project_name: row.project_name || project?.project_name || "",
      focus_area: row.focus_area || project?.focus_area || "",
      update_date: row.update_date || "",
      title: row.title || "",
      trigger_type: row.trigger_type || "",
      evidence_status: row.evidence_status || "unverified",
      decision_status: row.decision_status || "inbox",
      intake_status: status,
      bridge_status: bridge.bridge_status || "",
      bridge_candidate_closure_ids: bridge.candidate_closure_ids || "",
      bridge_suggested_status: bridge.suggested_decision_status || "",
      issue_count: issues.length,
      issues: issues.join("; "),
      route: route.route,
      target_file: route.target,
      next_action: bridge.suggested_next_action || route.next_action,
      official_url: row.official_url || "",
      notice_no: row.notice_no || "",
      notice_code: row.notice_code || row.urban_notice_code || "",
      attachment_paths: row.attachment_paths || "",
      local_text_paths: row.local_text_paths || "",
      observed_change: row.observed_change || "",
      affected_outputs: bridge.affected_outputs || changeRow?.affected_outputs || "",
      decision_gate: bridge.decision_gate || changeRow?.decision_gate || route.next_action,
      notes: row.notes || "",
    };
  });
}

function summarize(rows, templateRows) {
  return {
    generated_at: UPDATED_AT,
    intake_count: rows.length,
    template_source_count: templateRows.length,
    needs_fix_count: rows.filter((row) => row.intake_status === "needs_fix").length,
    inbox_count: rows.filter((row) => row.intake_status === "inbox").length,
    triaged_count: rows.filter((row) => row.intake_status === "triaged").length,
    applied_count: rows.filter((row) => row.intake_status === "applied").length,
    route_mix: countBy(rows, "route"),
    evidence_mix: countBy(rows, "evidence_status"),
    status_mix: countBy(rows, "intake_status"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON, OUT_README, OUT_EXAMPLES],
  };
}

function markdown(summary, rows, templateRows) {
  return `# 공식 업데이트 Intake 보드

작성 기준: ${UPDATED_AT}

이 문서는 \`data/review/official-update-intake.json\`에 수동으로 적은 새 공식 업데이트를 검증하고, 어느 decision/intake 파일로 옮겨야 하는지 라우팅한다. source verification 경로는 \`analysis/official-update-source-verification-bridge.md\`를 같이 읽어 candidate \`closure_id\`와 applied 승격 가능 여부를 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| intake 행 | ${summary.intake_count} |
| 입력 템플릿 출처 | ${summary.template_source_count} |
| 보완 필요 | ${summary.needs_fix_count} |
| inbox | ${summary.inbox_count} |
| triaged | ${summary.triaged_count} |
| applied | ${summary.applied_count} |

## 분포

| 구분 | 값 |
| --- | --- |
| route | ${summary.route_mix || "입력 없음"} |
| evidence | ${summary.evidence_mix || "입력 없음"} |
| status | ${summary.status_mix || "입력 없음"} |

## 현재 Intake

${mdTable(rows, [
    { key: "update_id", label: "ID" },
    { key: "source_id", label: "출처" },
    { key: "project_rank", label: "순위" },
    { key: "project_name", label: "사업" },
    { key: "notice_no", label: "고시번호" },
    { key: "notice_code", label: "noticeCode" },
    { key: "title", label: "제목" },
    { key: "evidence_status", label: "증거" },
    { key: "intake_status", label: "상태" },
    { key: "bridge_status", label: "bridge" },
    { key: "bridge_suggested_status", label: "권장 상태" },
    { key: "bridge_candidate_closure_ids", label: "closure_id" },
    { key: "issues", label: "이슈" },
    { key: "route", label: "route" },
    { key: "target_file", label: "기록 위치" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 입력 템플릿

${mdTable(templateRows, [
    { key: "source_id", label: "출처" },
    { key: "source_name", label: "출처명" },
    { key: "suggested_update_id", label: "ID 예시" },
    { key: "trigger_type", label: "trigger_type" },
    { key: "minimum_fields", label: "최소 필드" },
    { key: "first_route", label: "첫 기록 위치" },
    { key: "first_action", label: "첫 액션" },
    { key: "decision_gate", label: "판정 gate" },
  ])}

## 사용 순서

1. 새 업데이트를 발견하면 \`data/review/official-update-intake.json\`에 한 행을 추가한다.
2. \`node scripts/generate-official-update-intake-board.mjs\`를 실행해 source_id, rank, 증거 상태 오류를 확인한다.
3. route가 \`source_verification_decision\`이면 먼저 \`analysis/official-update-source-verification-bridge.md\`에서 candidate \`closure_id\`와 권장 상태를 확인한다.
4. route가 \`expansion_zone_latest_check\`이면 강동권/약수권 보드에 먼저 적고, 원문 또는 direct hit 확보 전까지는 source verification이나 high-blocking으로 올리지 않는다.
5. 그 외 route는 안내한 target 파일에 검증 결과를 옮기거나, bridge가 \`applied\`를 권장하면 intake 상태를 올린다.
6. \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/update-impact-ledger.md\`, \`analysis/project-due-diligence-board.md\`, \`analysis/research-goal-completion-audit.md\`를 확인한다.

## 판정 원칙

- \`context_only\`는 가설 참고 신호일 뿐 확정 근거가 아니다.
- \`applied\`는 \`verified_original\` 증거와 원문 URL, 첨부, 로컬 텍스트 중 하나가 있을 때만 쓴다.
- 완료 병목 3건과 연결되는 업데이트는 \`high_blocking_response_intake\`로 먼저 보낸다.
- \`gangdong_district_notice\`, \`jung_district_notice\`는 확장 관심권 운영 루프다. direct hit 또는 원문 확보 전까지는 \`expansion_zone_latest_check\`에 둔다.
`;
}

function intakeReadme(summary, templateRows, examples) {
  return `# Official Update Intake

작성 기준: ${UPDATED_AT}

\`data/review/official-update-intake.json\`은 공식 출처에서 새 고시, 공고, 공개자료 변화, 정책·교통 계획, 시장 원자료 갱신을 발견했을 때 처음 적어두는 수동 inbox다. 생성 스크립트는 실제 intake JSON을 덮어쓰지 않고 읽기만 한다. 이 README와 예시 파일은 \`node scripts/generate-official-update-intake-board.mjs\` 실행 시 최신 출처 레지스트리 기준으로 갱신된다.

## 최소 입력 예시

\`\`\`json
${JSON.stringify([examples[0]], null, 2)}
\`\`\`

## 출처별 예시 파일

- \`data/review/official-update-intake-examples.json\`: 현재 공식 출처 템플릿 ${summary.template_source_count}개에 대한 복사용 예시 행
- \`analysis/official-update-intake-board.md\`: 실제 입력 후 route, target file, 보완 이슈를 확인하는 검증 보드
- \`analysis/official-update-source-verification-bridge.md\`: source verification 경로 update를 candidate closure_id와 applied 승격 후보로 연결하는 보조 브리지

## 권장 값

- \`source_id\`: \`analysis/official-update-registry.json\`의 source_id 중 하나.
- \`project_rank\`: 우선검토 후보 순위. 사업장과 직접 연결되지 않는 정책·시장 업데이트는 비워둘 수 있다.
- \`trigger_type\`: ${[...VALID_TRIGGER_TYPES].join(", ")} 중 하나를 권장한다.
- \`evidence_status\`: ${[...VALID_EVIDENCE_STATUSES].join(", ")} 중 하나를 권장한다.
- \`decision_status\`: ${[...VALID_DECISION_STATUSES].join(", ")} 중 하나를 권장한다.

## 입력 절차

1. 새 업데이트를 발견하면 \`data/review/official-update-intake-examples.json\`에서 가까운 출처 예시를 복사한다.
2. \`data/review/official-update-intake.json\` 배열에 붙이고 \`update_id\`, \`discovered_at\`, \`source_id\`, \`title\`, \`official_url\`, \`evidence_status\`를 실제 값으로 바꾼다.
3. \`node scripts/generate-official-update-intake-board.mjs\`를 실행해 \`needs_fix\`를 0으로 만든다.
4. \`route=source_verification_decision\`이면 \`analysis/official-update-source-verification-bridge.md\`에서 candidate \`closure_id\`, \`bridge_status\`, \`suggested_decision_status\`를 먼저 본다.
5. \`route=expansion_zone_latest_check\`이면 강동권/약수권 보드에 먼저 적고, 원문 또는 direct hit 확보 전까지는 source verification이나 high-blocking으로 올리지 않는다.
6. 그 외 보드의 \`route\`와 \`target_file\`에 따라 source verification, high-blocking response, expansion-zone latest check, context, market intake 중 한 곳으로 옮기거나 intake 상태를 \`applied\`로 올린다.
7. 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/update-impact-ledger.md\`, \`analysis/project-due-diligence-board.md\`, \`analysis/research-goal-completion-audit.md\`를 확인한다.

## 운영 규칙

- URL만으로 값을 확정하지 않는다. 고시번호, 고시일, 첨부 파일명, 원문 텍스트 또는 공식 회신이 있어야 확정 후보가 된다.
- 보도자료와 정보소통광장 문서는 \`context_only\`로 시작한다.
- \`decision_status=applied\`는 \`evidence_status=verified_original\`이고 원문 URL, 첨부, 로컬 텍스트 중 하나가 있을 때만 쓴다.
- 완료 병목 3건과 연결되는 업데이트는 \`high_blocking_response_intake\`로 먼저 보낸다.
- \`gangdong_district_notice\`, \`jung_district_notice\`는 \`expansion_zone_latest_check\`로 먼저 보낸다. direct hit 또는 원문 확보 전에는 \`high_blocking_response_intake\`로 올리지 않는다.

## 템플릿 출처

${mdTable(templateRows, [
    { key: "source_id", label: "출처" },
    { key: "trigger_type", label: "trigger_type" },
    { key: "minimum_fields", label: "최소 필드" },
    { key: "first_route", label: "첫 기록 위치" },
    { key: "decision_gate", label: "판정 gate" },
  ])}
`;
}

async function main() {
  const [intake, registry, changeBoard, projectMatrix, completionCockpit, sourceVerificationBridge] = await Promise.all([
    readJson(INPUTS.intake, []),
    readJson(INPUTS.registry),
    readJson(INPUTS.changeBoard),
    readJson(INPUTS.projectMatrix),
    readJson(INPUTS.completionCockpit),
    readJson(INPUTS.sourceVerificationBridge, { updateRows: [] }),
  ]);
  const rows = buildRows({ intake, registry, changeBoard, projectMatrix, completionCockpit, sourceVerificationBridge });
  const templateRows = buildTemplateRows(changeBoard.rows || []);
  const examples = templateRows.map((row, index) => exampleForTemplate(row, index));
  const summary = summarize(rows, templateRows);
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows, templateRows, exampleRows: examples }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, templateRows));
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(examples, null, 2)}\n`);
  await writeFile(OUT_README, intakeReadme(summary, templateRows, examples));
  console.log(JSON.stringify({ intakeRows: rows.length, needsFix: summary.needs_fix_count, output: "analysis/official-update-intake-board.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
