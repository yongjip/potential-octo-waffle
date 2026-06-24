#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ANALYSIS_DIR = "analysis";
const REVIEW_DIR = "data/review";
const OUT_MD = path.join(ANALYSIS_DIR, "high-blocking-response-intake-guide.md");
const OUT_JSON = path.join(ANALYSIS_DIR, "high-blocking-response-intake-guide.json");
const OUT_EXAMPLES = path.join(REVIEW_DIR, "high-blocking-response-intake-examples.json");

const PACKET_INPUT = "analysis/high-blocking-info-disclosure-packet.json";
const INTAKE_INPUT = "data/review/high-blocking-source-response-intake.json";
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function isManagement(row) {
  return row.current_stage === "관리처분인가" || /관리처분/.test(`${row.requested_document} ${row.remaining_gap}`);
}

function statusRows() {
  return [
    {
      response_status: "no_response",
      use_when: "아직 회신이 없고 접수도 하지 않았거나, 접수 전 준비 상태",
      minimum_fields: "rank, project_name, response_status",
      decision_result: "waiting_for_response",
    },
    {
      response_status: "confirmed",
      use_when: "고시번호·고시일·원문 URL·자료명 또는 관리처분 비용 자료명이 회신으로 확인됨",
      minimum_fields: "response_received_at, responder, official_notice_no/date/url 또는 attachment_name, evidence_files 또는 official_url",
      decision_result: "ready_to_append 가능",
    },
    {
      response_status: "partial",
      use_when: "일부 식별자나 자료명은 확인됐지만 모든 값이 확정되지는 않음",
      minimum_fields: "response_received_at, responder, 확인된 식별자 1개 이상, evidence_files 또는 official_url",
      decision_result: "pending decision 초안",
    },
    {
      response_status: "unavailable",
      use_when: "기관이 해당 자료를 보유하지 않거나 공개 가능한 원문이 없다고 회신",
      minimum_fields: "response_received_at, responder, response_note",
      decision_result: "deferred decision 초안",
    },
    {
      response_status: "info_disclosure_required",
      use_when: "일반 문의로는 불가하고 정보공개청구/방문열람/부분공개 절차가 필요하다는 회신",
      minimum_fields: "response_received_at, responder, response_note",
      decision_result: "deferred decision 초안",
    },
  ];
}

function baseExample(row) {
  return {
    rank: row.rank,
    project_name: row.project_name,
    response_status: "no_response",
    response_received_at: "",
    responder: "",
    official_notice_no: "",
    official_notice_date: "",
    official_url: "",
    attachment_name: "",
    confirmed_values: isManagement(row)
      ? {
          management_construction_cost: "",
          management_total_project_cost: "",
          management_cost_basis_date: "",
        }
      : {
          district_area_sqm: "",
          floor_area_ratio_pct: "",
          building_coverage_ratio_pct: "",
          floors: "",
          max_height_m: "",
          total_households: "",
          stage_consent_rate_pct: "",
          union_approval_date: "",
          promotion_committee_approval_date: "",
        },
    evidence_files: "",
    response_note: "",
    follow_up_action: "",
    filing_status: "ready_to_file",
    filed_at: "",
    filing_channel: row.primary_channel,
    filing_url: row.primary_channel_url,
    filing_receipt_no: "",
    filing_note: "",
  };
}

function confirmedExample(row) {
  const example = baseExample(row);
  example.response_status = "confirmed";
  example.response_received_at = "YYYY-MM-DD";
  example.responder = `${row.district} 담당부서`;
  example.evidence_files = "data/review/evidence/example-response.pdf 또는 https://...";
  example.response_note = "회신에서 확인된 자료명·보유부서·공개 범위를 개인정보 없이 요약";
  example.follow_up_action = "node scripts/process-high-blocking-response-workflow.mjs";
  if (isManagement(row)) {
    example.attachment_name = "관리처분계획인가 별첨 또는 공사비 기준자료명";
    example.confirmed_values.management_construction_cost = "숫자와 단위";
    example.confirmed_values.management_cost_basis_date = "YYYY-MM-DD 또는 자료 기준일";
  } else {
    example.official_notice_no = "예: 광진구 고시 제YYYY-N호";
    example.official_notice_date = "YYYY-MM-DD";
    example.official_url = "https://...";
    example.attachment_name = "조합설립인가 고시문 또는 인가 관련 공고문";
    example.confirmed_values.union_approval_date = "YYYY-MM-DD";
  }
  return example;
}

function partialExample(row) {
  const example = confirmedExample(row);
  example.response_status = "partial";
  example.response_note = "일부 식별자만 확인됨. 미확인 값과 추가 요청 경로를 구분해 기록";
  if (isManagement(row)) {
    example.confirmed_values.management_construction_cost = "";
    example.attachment_name = "자료명만 확인됐고 금액은 비공개/열람 필요";
  } else {
    example.official_url = "";
    example.attachment_name = "자료명 또는 고시번호만 확인됨";
  }
  return example;
}

function unavailableExample(row) {
  const example = baseExample(row);
  example.response_status = "unavailable";
  example.response_received_at = "YYYY-MM-DD";
  example.responder = `${row.district} 담당부서`;
  example.response_note = "자료 미보유, 공개 원문 없음, 보존기간 경과 등 기관 회신 내용을 그대로 요약";
  example.follow_up_action = "deferred decision으로 남기고 비교표에는 원문 미확인 주석 유지";
  return example;
}

function infoDisclosureExample(row) {
  const example = baseExample(row);
  example.response_status = "info_disclosure_required";
  example.response_received_at = "YYYY-MM-DD";
  example.responder = `${row.district} 담당부서`;
  example.response_note = "정보공개청구, 방문열람, 부분공개 절차 필요. 접수 경로와 보유부서 기록";
  example.follow_up_action = "outbox 파일로 정보공개청구 접수 후 filing_status=filed_waiting_response 기록";
  return example;
}

function buildRows(packetRows) {
  return packetRows.map((row) => ({
    rank: row.rank,
    project_name: row.project_name,
    district: row.district,
    current_stage: row.current_stage,
    remaining_gap: row.remaining_gap,
    primary_channel: row.primary_channel,
    response_status_to_use: isManagement(row)
      ? "confirmed/partial는 관리처분 공사비·총사업비·기준일·자료명 중 확인된 범위로만 사용"
      : "confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용",
    required_after_response: row.intake_fields_to_fill,
  }));
}

function buildExamples(packetRows) {
  return packetRows.map((row) => ({
    rank: row.rank,
    project_name: row.project_name,
    no_response: baseExample(row),
    confirmed: confirmedExample(row),
    partial: partialExample(row),
    unavailable: unavailableExample(row),
    info_disclosure_required: infoDisclosureExample(row),
  }));
}

function commandExamples(packetRows) {
  const standard = packetRows.find((row) => !isManagement(row)) || packetRows[0];
  const management = packetRows.find((row) => isManagement(row)) || packetRows[0];
  return [
    {
      scenario: "조합설립인가형 confirmed (23/28)",
      command: `node scripts/record-high-blocking-response.mjs --rank=${standard?.rank || "23"} --status=confirmed --received-at=YYYY-MM-DD --responder='${standard?.district || "광진구"} 담당부서' --notice-no='광진구 고시 제YYYY-N호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --value=union_approval_date=YYYY-MM-DD --write`,
    },
    {
      scenario: "조합설립인가형 partial (23/28)",
      command: `node scripts/record-high-blocking-response.mjs --rank=${standard?.rank || "23"} --status=partial --received-at=YYYY-MM-DD --responder='${standard?.district || "광진구"} 담당부서' --attachment-name='자료명 또는 고시번호만 확인됨' --evidence=https://... --response-note='일부 식별자만 확인됨' --value=union_approval_date=YYYY-MM-DD --write`,
    },
    {
      scenario: "관리처분형 confirmed (9)",
      command: `node scripts/record-high-blocking-response.mjs --rank=${management?.rank || "9"} --status=confirmed --received-at=YYYY-MM-DD --responder='${management?.district || "송파구"} 담당부서' --attachment-name='관리처분계획인가 별첨 또는 공사비 기준자료명' --evidence=https://... --value=management_construction_cost=숫자와단위 --value=management_cost_basis_date=YYYY-MM-DD --write`,
    },
    {
      scenario: "자료 미보유 또는 정보공개청구 필요",
      command: `node scripts/record-high-blocking-response.mjs --rank=${standard?.rank || "23"} --status=info_disclosure_required --received-at=YYYY-MM-DD --responder='담당부서' --response-note='정보공개청구 또는 방문열람 필요' --write`,
    },
  ];
}

function markdown(summary, rows, examples, commands) {
  return `# High Blocking Response Intake Guide

작성 기준: ${UPDATED_AT}

이 문서는 담당부서/정보몽땅/정보공개청구 회신을 \`data/review/high-blocking-source-response-intake.json\`에 입력할 때 쓰는 상태값과 예시를 정리한다. 가능하면 \`node scripts/record-high-blocking-response.mjs\` helper를 사용하고, 실제 intake 파일은 예시를 복사해 덮어쓰지 말고 해당 사업장 행의 확인된 필드만 수정한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 현재 intake 행 | ${summary.current_intake_rows} |
| intake 오류 | ${summary.validation_error_count} |
| intake 경고 | ${summary.validation_warning_count} |

## Response Status 선택 기준

${mdTable(statusRows(), [
  { key: "response_status", label: "상태" },
  { key: "use_when", label: "사용 조건" },
  { key: "minimum_fields", label: "최소 필드" },
  { key: "decision_result", label: "decision 결과" },
])}

## 사업장별 입력 기준

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "response_status_to_use", label: "입력 기준" },
])}

## Helper 명령 예시

${mdTable(commands, [
  { key: "scenario", label: "시나리오" },
  { key: "command", label: "명령" },
])}

## 예시 JSON

\`\`\`json
${JSON.stringify(examples, null, 2)}
\`\`\`
`;
}

async function main() {
  const packet = await readJson(PACKET_INPUT);
  const intake = await readJson(INTAKE_INPUT);
  const validation = await readJson(VALIDATION_INPUT);
  const packetRows = packet.rows || [];
  const rows = buildRows(packetRows);
  const examples = buildExamples(packetRows);
  const commands = commandExamples(packetRows);
  const summary = {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    current_intake_rows: intake.length,
    validation_error_count: Number(validation.summary?.error_count || 0),
    validation_warning_count: Number(validation.summary?.warning_count || 0),
    inputs: [PACKET_INPUT, INTAKE_INPUT, VALIDATION_INPUT],
    outputs: [OUT_MD, OUT_JSON, OUT_EXAMPLES],
  };

  await mkdir(ANALYSIS_DIR, { recursive: true });
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows, statuses: statusRows(), examples }, null, 2)}\n`);
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(examples, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, examples, commands));
  console.log(JSON.stringify({ rows: rows.length, examples: examples.length, output: "analysis/high-blocking-response-intake-guide.{md,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
