#!/usr/bin/env node

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "data/review/high-blocking-filing-outbox";
const OUT_README = path.join(OUT_DIR, "README.md");
const OUT_JSON = path.join(OUT_DIR, "manifest.json");

const TRACKER_INPUT = "analysis/high-blocking-filing-tracker.json";
const VALIDATION_INPUT = "analysis/high-blocking-intake-validation.json";

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

function safeSlug(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function fileName(row) {
  return `${String(row.rank).padStart(2, "0")}-${safeSlug(row.project_name)}.txt`;
}

function isReadyToFileStatus(status) {
  return ["ready_to_file", "ready_to_file_or_mark_filed"].includes(status);
}

function isFiledWaitingStatus(status) {
  return status === "filed_waiting_response";
}

function filedPacket(row) {
  const expectedResponse = row.expected_response_by || "미기록";
  const filingNote = row.filing_note || "미기록";
  const touchHelper = row.next_check_date
    ? `node scripts/touch-high-blocking-followup.mjs --rank=${row.rank} --checked-at=${row.next_check_date} --write --refresh`
    : `node scripts/touch-high-blocking-followup.mjs --rank=${row.rank} --checked-at=YYYY-MM-DD --write --refresh`;
  const nextCheckHelper = row.next_check_date
    ? `node scripts/record-high-blocking-followup-check.mjs --rank=${row.rank} --checked-at=${row.next_check_date} --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=YYYY-MM-DD --next-check-note='${row.next_check_note || "상태 재확인"}' --write`
    : `node scripts/record-high-blocking-followup-check.mjs --rank=${row.rank} --checked-at=YYYY-MM-DD --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=YYYY-MM-DD --next-check-note='${row.next_check_note || "상태 재확인"}' --write`;
  const responseCommandBase = `node scripts/record-high-blocking-response.mjs --rank=${row.rank} --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='담당부서'`;
  const responseHelper = row.rank === "9"
    ? `${responseCommandBase} --attachment-name='자료명' --evidence=https://... --response-note='회신 요약' --write`
    : `${responseCommandBase} --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write`;
  return `회신 대기 상태

사업장: ${row.project_name}
관할/단계: ${row.district} / ${row.current_stage}
접수상태: ${row.filing_status}
회신상태: ${row.response_status}
우선 채널: ${row.filing_channel}
조회 URL: ${row.filing_url}
접수일: ${row.filed_at || "미기록"}
접수번호: ${row.filing_receipt_no || "미기록"}
마지막 확인일: ${row.last_checked_at || "미기록"}
다음 점검일: ${row.next_check_date || "미기록"}
처리기한: ${expectedResponse}
다음 점검 포인트: ${row.next_check_note || "미기록"}
남은 공백: ${row.remaining_gap}
접수 메모: ${filingNote}

회신이 없을 때 helper:
- ${touchHelper}
- ${nextCheckHelper}

회신이 왔을 때 helper:
- ${responseHelper}

회신 후 필수 처리:
1. 가능하면 node scripts/record-high-blocking-response.mjs로 response_status를 confirmed, partial, unavailable, info_disclosure_required 중 하나로 기록
2. response_received_at, responder, official_notice_no/date/url, attachment_name, confirmed_values, evidence_files, response_note 중 확인된 값 입력
3. analysis/high-blocking-response-intake-guide.md에서 상태값 선택 기준 확인
4. ${row.decision_draft_command || "node scripts/process-high-blocking-response-workflow.mjs"}
5. analysis/high-blocking-response-workflow-run.md에서 validation_errors와 appendable_decisions 확인
6. 검수 후 node scripts/process-high-blocking-response-workflow.mjs --write
7. ${row.regenerate_command || "node scripts/regenerate-research-artifacts.mjs"}

승격 규칙
${row.promotion_rule || "미기록"}

최초 접수 제목
${row.filing_title}

최초 접수 본문
${row.disclosure_body}
`;
}

function textPacket(row) {
  if (isFiledWaitingStatus(row.filing_status)) return filedPacket(row);
  return `접수 전 확인

사업장: ${row.project_name}
관할/단계: ${row.district} / ${row.current_stage}
우선 채널: ${row.filing_channel}
접수 URL: ${row.filing_url}
접수 힌트: ${row.filing_channel_hint || "미기록"}
라우팅 근거: ${row.filing_channel_evidence || "미기록"}
남은 공백: ${row.remaining_gap}

mark-high-blocking-filed helper가 채울 수 있는 접수 필드:
- filing_status: filed_waiting_response
- filed_at: YYYY-MM-DD
- filing_channel: 실제 접수 채널
- filing_url: 실제 접수 URL
- filing_receipt_no: 접수번호
- filing_note: 접수 과정 메모

접수 직후 helper 예시:
- node scripts/mark-high-blocking-filed.mjs --rank=${row.rank} --filed-at=YYYY-MM-DD --receipt=접수번호 --write
- 접수번호가 없으면 --receipt 대신 --note='전화/이메일 접수 메모' 사용

회신 후 필수 처리:
1. 가능하면 node scripts/record-high-blocking-response.mjs로 response_status를 confirmed, partial, unavailable, info_disclosure_required 중 하나로 기록
2. response_received_at, responder, official_notice_no/date/url, attachment_name, confirmed_values, evidence_files, response_note 중 확인된 값 입력
3. analysis/high-blocking-response-intake-guide.md에서 상태값 선택 기준 확인
4. node scripts/process-high-blocking-response-workflow.mjs
5. analysis/high-blocking-response-workflow-run.md에서 validation_errors와 appendable_decisions 확인
6. 검수 후 node scripts/process-high-blocking-response-workflow.mjs --write

접수 제목
${row.filing_title}

접수 본문
${row.disclosure_body}
`;
}

function markdown(summary, manifestRows) {
  return `# High Blocking Filing Outbox

작성 기준: ${UPDATED_AT}

이 폴더는 high blocking 3개 사업장을 실제 정보공개청구/공식 민원 접수 단위로 나눈 운영 파일이다. 접수 전이면 제출 준비 파일로, 접수 후면 회신 대기 패킷으로 읽는다. 외부 제출은 자동으로 하지 않는다. 접수 직후에는 \`node scripts/mark-high-blocking-filed.mjs\`로, 회신 후에는 가능하면 \`node scripts/record-high-blocking-response.mjs\`로 intake를 갱신한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 제출 준비 파일 | ${summary.packet_count} |
| 접수 필요 | ${summary.ready_to_file_count} |
| 회신 대기 | ${summary.filed_waiting_count} |
| intake 오류 | ${summary.validation_error_count} |
| intake 경고 | ${summary.validation_warning_count} |

## 파일 목록

| 순위 | 사업장 | 접수상태 | 우선 채널 | 파일 |
| --- | --- | --- | --- | --- |
${manifestRows.map((row) => `| ${row.rank} | ${row.project_name} | ${row.filing_status} | ${row.filing_channel} | ${row.file} |`).join("\n")}

## 접수 후 명령

접수 직후 helper로 intake를 먼저 갱신한다. 접수번호가 없으면 \`--note=...\`를 사용한다.

\`\`\`bash
node scripts/mark-high-blocking-filed.mjs --rank=23 --filed-at=YYYY-MM-DD --receipt=접수번호 --write
\`\`\`

그 다음 회신은 가능하면 \`node scripts/record-high-blocking-response.mjs\`로 반영한 뒤 dry-run으로 검증한다.

\`\`\`bash
node scripts/process-high-blocking-response-workflow.mjs
\`\`\`

\`analysis/high-blocking-response-workflow-run.md\`에서 \`validation_errors\`가 0이고 append 가능한 decision이 있으면 검수 후 반영한다.

\`\`\`bash
node scripts/process-high-blocking-response-workflow.mjs --write
\`\`\`
`;
}

async function main() {
  const tracker = await readJson(TRACKER_INPUT);
  const validation = await readJson(VALIDATION_INPUT);
  const rows = tracker.rows || [];
  await mkdir(OUT_DIR, { recursive: true });
  for (const existing of await readdir(OUT_DIR)) {
    if (/^\d{2}-.+\.txt$/.test(existing)) await rm(path.join(OUT_DIR, existing));
  }

  const manifestRows = [];
  for (const row of rows) {
    const file = fileName(row);
    await writeFile(path.join(OUT_DIR, file), textPacket(row));
    manifestRows.push({
      rank: row.rank,
      project_name: row.project_name,
      district: row.district,
      current_stage: row.current_stage,
      filing_status: row.filing_status,
      response_status: row.response_status,
      filing_channel: row.filing_channel,
      filing_url: row.filing_url,
      filed_at: row.filed_at || "",
      filing_receipt_no: row.filing_receipt_no || "",
      filing_note: row.filing_note || "",
      next_check_date: row.next_check_date || "",
      next_check_note: row.next_check_note || "",
      expected_response_by: row.expected_response_by || "",
      last_checked_at: row.last_checked_at || "",
      remaining_gap: row.remaining_gap,
      promotion_rule: row.promotion_rule || "",
      decision_draft_command: row.decision_draft_command || "",
      regenerate_command: row.regenerate_command || "",
      file,
    });
  }

  const summary = {
    generated_at: UPDATED_AT,
    packet_count: manifestRows.length,
    ready_to_file_count: rows.filter((row) => isReadyToFileStatus(row.filing_status)).length,
    filed_waiting_count: rows.filter((row) => isFiledWaitingStatus(row.filing_status)).length,
    validation_error_count: Number(validation.summary?.error_count || 0),
    validation_warning_count: Number(validation.summary?.warning_count || 0),
    inputs: [TRACKER_INPUT, VALIDATION_INPUT],
    outputs: [OUT_README, OUT_JSON, ...manifestRows.map((row) => path.join(OUT_DIR, row.file))],
  };

  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows: manifestRows }, null, 2)}\n`);
  await writeFile(OUT_README, markdown(summary, manifestRows));
  console.log(JSON.stringify({ packets: manifestRows.length, output: OUT_DIR }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
