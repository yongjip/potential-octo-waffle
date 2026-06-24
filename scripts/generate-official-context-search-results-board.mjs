#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-context-search-results-board.md");
const OUT_CSV = path.join(OUT_DIR, "official-context-search-results-board.csv");
const OUT_JSON = path.join(OUT_DIR, "official-context-search-results-board.json");
const OUT_REVIEW_DIR = "data/review";
const OUT_README = path.join(OUT_REVIEW_DIR, "official-context-search-results-intake.README.md");
const OUT_EXAMPLES = path.join(OUT_REVIEW_DIR, "official-context-search-results-intake-examples.json");

const INPUTS = {
  searchQueue: "analysis/official-context-search-queue.json",
  intake: "data/review/official-context-search-results-intake.json",
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
const OUTPUTS = [OUT_MD, OUT_CSV, OUT_JSON, OUT_README, OUT_EXAMPLES];

const VALID_RESULT_STATUSES = new Set(["not_found", "found_context", "found_original_candidate", "found_verified_original", "irrelevant"]);
const VALID_EVIDENCE_STATUSES = new Set(["context_only", "unverified", "needs_text_extraction", "verified_original", "rejected"]);
const VALID_DECISION_STATUSES = new Set(["inbox", "triaged", "applied", "deferred", "rejected"]);
const FOUND_RESULT_STATUSES = new Set(["found_context", "found_original_candidate", "found_verified_original"]);

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

function asText(value) {
  return String(value ?? "").trim();
}

function hasValue(value) {
  return asText(value).length > 0;
}

function hasEvidenceHandle(row) {
  return hasValue(row.official_url) || hasValue(row.attachment_paths) || hasValue(row.local_text_paths);
}

function hasAttachmentOrLocalText(row) {
  return hasValue(row.attachment_paths) || hasValue(row.local_text_paths);
}

function isHttpUrl(value) {
  const text = asText(value);
  return !text || /^https?:\/\/\S+$/i.test(text);
}

function targetRoute(queueRow, row) {
  if (row.result_status === "not_found") {
    return {
      route: "no_change_log",
      target_file: "analysis/official-context-search-results-board.md",
      next_action: "검색 결과 없음으로 유지하고 다음 월간 scan에서 같은 search_id 재사용",
    };
  }
  if (row.evidence_status === "verified_original" || row.result_status === "found_verified_original") {
    return {
      route: queueRow.source_key === "seoul_urban" ? "source_verification_decision" : "official_update_intake_original",
      target_file: queueRow.source_key === "seoul_urban" ? "data/review/source-verification-closure-decisions.json" : "data/review/official-update-intake.json",
      next_action: "원문 URL, 첨부, 로컬 텍스트를 확인한 뒤 source verification 또는 official update intake에 반영",
    };
  }
  if (row.result_status === "found_original_candidate" || row.evidence_status === "needs_text_extraction") {
    return {
      route: "official_update_intake_needs_text",
      target_file: "data/review/official-update-intake.json",
      next_action: "needs_text_extraction으로 기록하고 첨부 다운로드·텍스트 추출 뒤 재판정",
    };
  }
  if (row.evidence_status === "context_only" || row.result_status === "found_context") {
    return {
      route: "official_context_sources",
      target_file: "analysis/official-context-sources.csv 또는 data/review/official-update-intake.json",
      next_action: "context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류",
    };
  }
  return {
    route: "manual_review",
    target_file: "analysis/official-context-search-results-board.md",
    next_action: "result_status와 evidence_status를 보완한 뒤 재생성",
  };
}

function validate(row, queueById) {
  const issues = [];
  const searchId = row.search_id || "";
  const resultStatus = row.result_status || "";
  const evidenceStatus = row.evidence_status || "";
  const decisionStatus = row.decision_status || "inbox";
  const hasEvidence = hasEvidenceHandle(row);
  const hasExtractedEvidence = hasAttachmentOrLocalText(row);

  if (!row.result_id) issues.push("missing_result_id");
  if (!searchId) issues.push("missing_search_id");
  else if (!queueById.has(searchId)) issues.push("unknown_search_id");
  if (!row.searched_at) issues.push("missing_searched_at");
  if (!resultStatus) issues.push("missing_result_status");
  else if (!VALID_RESULT_STATUSES.has(resultStatus)) issues.push("unknown_result_status");
  if (!evidenceStatus) issues.push("missing_evidence_status");
  else if (!VALID_EVIDENCE_STATUSES.has(evidenceStatus)) issues.push("unknown_evidence_status");
  if (!VALID_DECISION_STATUSES.has(decisionStatus)) issues.push("unknown_decision_status");
  if (hasValue(row.official_url) && !isHttpUrl(row.official_url)) issues.push("invalid_official_url");
  if (FOUND_RESULT_STATUSES.has(resultStatus) && !hasValue(row.title)) issues.push("missing_title");
  if (FOUND_RESULT_STATUSES.has(resultStatus) && !hasValue(row.published_at)) issues.push("missing_published_at");
  if (evidenceStatus === "verified_original" && !hasEvidence) issues.push("verified_without_evidence_path");
  if (evidenceStatus === "verified_original" && !hasExtractedEvidence) issues.push("verified_without_attachment_or_local_text");
  if (decisionStatus === "applied" && evidenceStatus !== "verified_original") issues.push("applied_without_verified_original");
  if (resultStatus === "not_found" && row.official_url) issues.push("not_found_with_url");
  if (resultStatus === "found_context" && evidenceStatus !== "context_only") issues.push("context_result_not_context_only");
  if (resultStatus === "found_original_candidate" && !hasEvidence) issues.push("original_candidate_without_evidence_path");
  if (resultStatus === "found_original_candidate" && !["unverified", "needs_text_extraction"].includes(evidenceStatus)) {
    issues.push("original_candidate_invalid_evidence_status");
  }
  if (resultStatus === "found_verified_original" && evidenceStatus !== "verified_original") {
    issues.push("verified_result_not_verified_original");
  }
  if (resultStatus === "found_verified_original" && !hasEvidence) issues.push("verified_without_evidence_path");
  if (resultStatus === "found_verified_original" && !hasExtractedEvidence) {
    issues.push("verified_without_attachment_or_local_text");
  }
  return issues;
}

function buildRows({ searchRows, intakeRows }) {
  const queueById = new Map(searchRows.map((row) => [row.search_id, row]));
  return intakeRows.map((raw, index) => {
    const row = { ...raw };
    const queue = queueById.get(row.search_id) || {};
    const issues = validate(row, queueById);
    const route = targetRoute(queue, row);
    return {
      row_no: index + 1,
      result_id: row.result_id || `missing-${index + 1}`,
      search_id: row.search_id || "",
      searched_at: row.searched_at || "",
      source_key: queue.source_key || "",
      catalyst_name: queue.catalyst_name || "",
      focus_area: queue.focus_area || "",
      result_status: row.result_status || "",
      evidence_status: row.evidence_status || "",
      decision_status: row.decision_status || "inbox",
      validation_status: issues.length ? "needs_fix" : row.decision_status || "inbox",
      issue_count: issues.length,
      issues: issues.join("; "),
      title: row.title || "",
      official_url: row.official_url || "",
      published_at: row.published_at || "",
      attachment_paths: row.attachment_paths || "",
      local_text_paths: row.local_text_paths || "",
      observed_change: row.observed_change || "",
      route: route.route,
      target_file: route.target_file,
      next_action: route.next_action,
      queue_decision_gate: queue.decision_gate || "",
      affected_outputs: queue.affected_outputs || "",
      notes: row.notes || "",
    };
  });
}

function buildCoverageRows(searchRows, resultRows) {
  const resultBySearch = new Map();
  for (const row of resultRows) {
    if (!resultBySearch.has(row.search_id)) resultBySearch.set(row.search_id, []);
    resultBySearch.get(row.search_id).push(row);
  }
  return searchRows.map((row) => {
    const results = resultBySearch.get(row.search_id) || [];
    const latest =
      [...results].sort((a, b) => {
        const searchedCompare = asText(b.searched_at).localeCompare(asText(a.searched_at));
        if (searchedCompare !== 0) return searchedCompare;
        return Number(b.row_no || 0) - Number(a.row_no || 0);
      })[0] || {};
    return {
      search_id: row.search_id,
      priority: row.priority,
      source_key: row.source_key,
      catalyst_name: row.catalyst_name,
      focus_area: row.focus_area,
      searched_count: results.length,
      latest_result_status: latest.result_status || "not_searched",
      latest_evidence_status: latest.evidence_status || "",
      suggested_query: row.suggested_query,
      target_record_file: row.target_record_file,
      decision_gate: row.decision_gate,
    };
  });
}

function summarize(rows, coverageRows) {
  return {
    generated_at: UPDATED_AT,
    result_count: rows.length,
    search_count: coverageRows.length,
    searched_queue_count: coverageRows.filter((row) => row.searched_count > 0).length,
    unsearched_queue_count: coverageRows.filter((row) => row.searched_count === 0).length,
    needs_fix_count: rows.filter((row) => row.validation_status === "needs_fix").length,
    verified_original_count: rows.filter((row) => row.evidence_status === "verified_original").length,
    context_only_count: rows.filter((row) => row.evidence_status === "context_only").length,
    result_status_mix: countBy(rows, "result_status"),
    route_mix: countBy(rows, "route"),
    inputs: Object.values(INPUTS),
    outputs: OUTPUTS,
  };
}

function markdown(summary, rows, coverageRows) {
  return `# 공식 Context 검색 결과 보드

작성 기준: ${UPDATED_AT}

이 문서는 \`analysis/official-context-search-queue.md\`를 실제로 검색한 결과를 검증한다. 검색 결과가 보도자료·결재문서이면 \`context_only\`로 유지하고, 고시·계획·교통대책 원문 후보만 원문 검증 intake로 보낸다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 결과 행 | ${summary.result_count} |
| 검색 큐 | ${summary.search_count} |
| 검색 완료 큐 | ${summary.searched_queue_count} |
| 미검색 큐 | ${summary.unsearched_queue_count} |
| 보완 필요 | ${summary.needs_fix_count} |
| verified original | ${summary.verified_original_count} |
| context_only | ${summary.context_only_count} |

| 구분 | 값 |
| --- | --- |
| result_status | ${summary.result_status_mix || "입력 없음"} |
| route | ${summary.route_mix || "입력 없음"} |

## 입력 가이드

- \`${OUT_README}\`: 허용 상태값, 상태별 필수 증거, 입력 순서를 정리한 가이드
- \`${OUT_EXAMPLES}\`: \`found_context\`, \`found_original_candidate\`, \`found_verified_original\`, \`not_found\` 복사용 예시

## 현재 결과

${mdTable(rows, [
    { key: "result_id", label: "결과 ID" },
    { key: "search_id", label: "search_id" },
    { key: "source_key", label: "출처" },
    { key: "catalyst_name", label: "촉매" },
    { key: "result_status", label: "결과" },
    { key: "evidence_status", label: "증거" },
    { key: "validation_status", label: "검증" },
    { key: "issues", label: "이슈" },
    { key: "route", label: "route" },
    { key: "target_file", label: "기록 위치" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 미검색 상위 큐

${mdTable(
    coverageRows
      .filter((row) => row.searched_count === 0)
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
      .slice(0, 20),
    [
      { key: "priority", label: "우선" },
      { key: "search_id", label: "search_id" },
      { key: "source_key", label: "출처" },
      { key: "catalyst_name", label: "촉매" },
      { key: "focus_area", label: "생활권" },
      { key: "suggested_query", label: "검색어" },
      { key: "decision_gate", label: "판정 gate" },
    ],
  )}

## 운영 원칙

- \`not_found\`는 결론 변경 근거가 아니다. 다음 월간 scan에서 같은 search_id를 다시 확인한다.
- \`context_only\`는 가설 참고 신호일 뿐 사업 단계·수치 확정 근거가 아니다.
- \`verified_original\`은 원문 URL만으로 쓰지 않고, 첨부 경로 또는 로컬 텍스트 경로가 있어야 한다.
- 결과를 반영한 뒤에는 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/catalyst-trigger-matrix.md\`를 확인한다.
`;
}

function pickSearchId(searchRows, preferredId, predicate) {
  return (
    searchRows.find((row) => row.search_id === preferredId)?.search_id ||
    searchRows.find(predicate)?.search_id ||
    searchRows[0]?.search_id ||
    "replace-with-search-id"
  );
}

function buildExamples(searchRows) {
  return [
    {
      result_id: "ctx-YYYYMMDD-0001",
      search_id: pickSearchId(searchRows, "jamsil-mice-gbc-seoul_citybuild", (row) => row.source_key === "seoul_citybuild"),
      searched_at: "YYYY-MM-DD KST",
      result_status: "found_context",
      title: "잠실 스포츠·MICE 복합공간 조성 관련 공식 보도자료",
      official_url: "https://news.seoul.go.kr/citybuild/...",
      published_at: "YYYY-MM-DD",
      evidence_status: "context_only",
      decision_status: "inbox",
      observed_change: "사업 설명 자료는 확인했지만 고시번호·원문 첨부는 아직 미연결",
      notes: "context_only. 원문 후보가 나오기 전까지 사업 단계·수치 근거로 쓰지 않음.",
    },
    {
      result_id: "ctx-YYYYMMDD-0002",
      search_id: pickSearchId(searchRows, "dongseoul-terminal-gangbyeon-seoul_urban", (row) => row.source_key === "seoul_urban"),
      searched_at: "YYYY-MM-DD KST",
      result_status: "found_original_candidate",
      title: "동서울터미널 사전협상 관련 도시관리계획 결정 고시 후보",
      official_url: "https://urban.seoul.go.kr/...",
      published_at: "YYYY-MM-DD",
      attachment_paths: "data/raw/official/....pdf",
      local_text_paths: "",
      evidence_status: "needs_text_extraction",
      decision_status: "triaged",
      observed_change: "고시문 첨부는 확인했지만 OCR 또는 본문 텍스트 추출 전이라 원문 확정 보류",
      notes: "official-update-intake에는 needs_text_extraction으로 넘기고 추출 후 재판정.",
    },
    {
      result_id: "ctx-YYYYMMDD-0003",
      search_id: pickSearchId(searchRows, "apgujeong-hangang-riverfront-seoul_urban", (row) => row.source_key === "seoul_urban"),
      searched_at: "YYYY-MM-DD KST",
      result_status: "found_verified_original",
      title: "압구정 재건축 관련 도시관리계획 결정 고시",
      official_url: "https://urban.seoul.go.kr/...",
      published_at: "YYYY-MM-DD",
      attachment_paths: "data/raw/official/....pdf",
      local_text_paths: "data/processed/text/....md",
      evidence_status: "verified_original",
      decision_status: "applied",
      observed_change: "고시번호·고시일·원문 첨부·로컬 텍스트를 모두 확인해 원문 확정",
      notes: "official-update-intake 또는 source-verification-closure-decisions에 반영한 뒤 applied로 변경.",
    },
    {
      result_id: "ctx-YYYYMMDD-0004",
      search_id: pickSearchId(searchRows, "apgujeong-hangang-riverfront-seoul_traffic", (row) => row.source_key === "seoul_traffic"),
      searched_at: "YYYY-MM-DD KST",
      result_status: "not_found",
      title: "서울시 교통 분야 검색: 압구정 한강변 교통",
      official_url: "",
      published_at: "",
      evidence_status: "rejected",
      decision_status: "deferred",
      observed_change: "검색 결과를 확인했지만 현재 판독 가능한 공식 게시글이나 원문 첨부를 찾지 못함",
      notes: "결론 변경 없이 다음 월간 scan에서 같은 search_id로 재검색.",
    },
  ];
}

function readme(summary, searchRows) {
  const examples = buildExamples(searchRows);
  return `# 공식 Context 검색 결과 Intake

작성 기준: ${UPDATED_AT}

\`official-context-search-results-intake.json\`은 \`analysis/official-context-search-queue.md\`의 월간 검색 큐를 실제로 확인한 뒤 결과를 남기는 수동 입력 파일이다. 생성 스크립트는 실제 intake JSON을 덮어쓰지 않고 읽기만 한다. 이 README와 예시 파일은 \`node scripts/generate-official-context-search-results-board.mjs\` 실행 시 검색 큐 기준으로 함께 갱신된다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 결과 행 | ${summary.result_count} |
| 검색 완료 큐 | ${summary.searched_queue_count} |
| 미검색 큐 | ${summary.unsearched_queue_count} |
| 보완 필요 | ${summary.needs_fix_count} |

## 최소 입력 예시

\`\`\`json
${JSON.stringify([examples[0]], null, 2)}
\`\`\`

## 예시 파일

- \`${OUT_EXAMPLES}\`: \`found_context\`, \`found_original_candidate\`, \`found_verified_original\`, \`not_found\` 복사용 예시 행
- \`${OUT_MD}\`: 실제 입력 후 결과 검증, 라우팅, 미검색 큐를 확인하는 운영 보드

## 허용 상태

- \`result_status\`: \`not_found\`, \`found_context\`, \`found_original_candidate\`, \`found_verified_original\`, \`irrelevant\`
- \`evidence_status\`: \`context_only\`, \`unverified\`, \`needs_text_extraction\`, \`verified_original\`, \`rejected\`
- \`decision_status\`: \`inbox\`, \`triaged\`, \`applied\`, \`deferred\`, \`rejected\`

## 상태별 최소 조건

| result_status | evidence_status | 최소 조건 |
| --- | --- | --- |
| found_context | context_only | 제목, 게시일, 공식 URL이 있고 원문 고시/계획 첨부는 아직 미연결 |
| found_original_candidate | unverified 또는 needs_text_extraction | 제목, 게시일, 공식 URL 또는 첨부/로컬 텍스트 중 하나가 있고 원문 후보라고 설명 가능 |
| found_verified_original | verified_original | 제목, 게시일, 공식 URL 또는 첨부/로컬 텍스트가 있고 첨부 경로 또는 로컬 텍스트 경로가 실제로 남아 있음 |
| not_found | rejected 권장 | 공식 URL 없이 검색 결과 없음 메모만 남기고 다음 scan으로 넘김 |

## 입력 절차

1. \`${OUT_EXAMPLES}\`에서 가장 가까운 예시 행을 복사한다.
2. \`search_id\`를 \`analysis/official-context-search-queue.json\`에 있는 실제 값으로 맞추고 \`searched_at\`, \`title\`, \`official_url\`, \`published_at\`, \`observed_change\`를 채운다.
3. 원문 첨부를 확보했지만 아직 텍스트 추출 전이면 \`found_original_candidate\` + \`needs_text_extraction\`으로 둔다.
4. 원문 URL, 첨부 경로, 로컬 텍스트 경로까지 확인되면 \`found_verified_original\` + \`verified_original\`로 올리고 downstream intake에 반영한 뒤 \`decision_status\`를 \`applied\`로 바꾼다.
5. \`node scripts/generate-official-context-search-results-board.mjs\`를 실행해 \`issues\`가 생기지 않는지 확인한다.
6. 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/official-context-search-results-board.md\`, \`analysis/official-context-impact-board.md\`, \`analysis/research-goal-completion-audit.md\`를 확인한다.

## 운영 규칙

- 보도자료, 결재문서, 회의자료는 기본적으로 \`context_only\`다.
- \`found_original_candidate\`는 공식 URL만 남겨도 되지만, 실제 첨부를 받았으면 \`attachment_paths\` 또는 \`local_text_paths\`를 바로 적는다.
- \`verified_original\`은 URL만으로 쓰지 않는다. 첨부 경로 또는 로컬 텍스트 경로가 필요하다.
- \`applied\`는 downstream intake 또는 source verification 결정 로그까지 반영된 뒤에만 쓴다.
- 검색 결과가 없으면 \`not_found\`로 남기고 결론이나 가설은 바꾸지 않는다.
`;
}

async function main() {
  const [queue, intake] = await Promise.all([readJson(INPUTS.searchQueue), readJson(INPUTS.intake, [])]);
  const searchRows = rowsFrom(queue);
  const rows = buildRows({ searchRows, intakeRows: rowsFrom(intake) });
  const coverageRows = buildCoverageRows(searchRows, rows);
  const summary = summarize(rows, coverageRows);
  const examples = buildExamples(searchRows);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(OUT_REVIEW_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows, coverageRows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, coverageRows));
  await writeFile(OUT_README, readme(summary, searchRows));
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(examples, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        results: rows.length,
        unsearched: summary.unsearched_queue_count,
        needsFix: summary.needs_fix_count,
        output: OUTPUTS,
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
