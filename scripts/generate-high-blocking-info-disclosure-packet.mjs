#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-info-disclosure-packet.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-info-disclosure-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-info-disclosure-packet.json");

const ESCALATION_INPUT = "analysis/high-blocking-source-escalation-packet.json";
const CONTACT_INPUT = "analysis/high-blocking-contact-channel-registry.json";
const SEARCH_RERUN_INPUT = "analysis/high-blocking-official-search-rerun.json";
const RESPONSE_INTAKE_INPUT = "data/review/high-blocking-source-response-intake.json";

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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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

function compact(text, limit = 900) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}...`;
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function channelsForRank(contactRows, rank) {
  return contactRows
    .filter((row) => (row.project_ranks || "").split(";").map((item) => item.trim()).includes(String(rank)))
    .sort((a, b) => Number(a.route_priority || 99) - Number(b.route_priority || 99));
}

function receivingAgency(project) {
  if (project.district === "광진구") return "광진구청 주거사업과 또는 정보공개청구 접수부서";
  if (project.district === "송파구") return "송파구청 주택사업과 또는 정보공개청구 접수부서";
  return `${project.district || "관할 자치구"} 정비사업 담당부서 또는 정보공개청구 접수부서`;
}

function disclosureTitle(project) {
  if (project.request_type.includes("관리처분")) {
    return `[정보공개청구] ${project.project_name} 관리처분계획인가 고시문·별첨 및 공사비 기준자료 공개 요청`;
  }
  return `[정보공개청구] ${project.project_name} 조합설립인가 고시문 및 고시번호·고시일 공개 요청`;
}

function requestItems(project) {
  if (project.request_type.includes("관리처분")) {
    return [
      "관리처분계획인가 고시문 원문 또는 고시번호·고시일",
      "관리처분계획인가 별첨 중 총 공사비, 정비사업비, 공사비 추산액 또는 해당 금액의 기준일이 포함된 공개 가능 자료",
      "위 자료가 정보몽땅 비회원 공개화면에서 열람되지 않는 경우 공개 가능 경로, 방문열람 가능 여부, 담당 부서명",
      "전자파일 공개가 어려운 경우 자료명, 보유부서, 공개/부분공개/비공개 사유",
    ];
  }
  return [
    "조합설립인가 고시문 또는 인가 관련 공고문 원문",
    "조합설립인가 고시번호, 고시일, 인가일, 원문/첨부 URL",
    "고시문 또는 첨부에 포함된 정비구역 면적, 용적률, 건폐율, 층수, 최고높이, 총 세대수 등 사업개요 수치의 기준일",
    "전자파일 공개가 어려운 경우 자료명, 보유부서, 공개/부분공개/비공개 사유",
  ];
}

function intakeFields(project) {
  if (project.request_type.includes("관리처분")) {
    return [
      "response_status",
      "response_received_at",
      "responder",
      "official_notice_no",
      "official_notice_date",
      "official_url",
      "attachment_name",
      "confirmed_values.management_construction_cost",
      "confirmed_values.management_total_project_cost",
      "confirmed_values.management_cost_basis_date",
      "evidence_files",
      "response_note",
      "follow_up_action",
    ];
  }
  return [
    "response_status",
    "response_received_at",
    "responder",
    "official_notice_no",
    "official_notice_date",
    "official_url",
    "attachment_name",
    "confirmed_values.district_area_sqm",
    "confirmed_values.floor_area_ratio_pct",
    "confirmed_values.building_coverage_ratio_pct",
    "confirmed_values.floors",
    "confirmed_values.max_height_m",
    "confirmed_values.total_households",
    "confirmed_values.union_approval_date",
    "evidence_files",
    "response_note",
    "follow_up_action",
  ];
}

function responsePromotionRule(project) {
  if (project.request_type.includes("관리처분")) {
    return "관리처분 공사비·총사업비 금액, 기준일, 자료명 또는 원문 URL이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다.";
  }
  return "고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다.";
}

function disclosureBody(project, searchRow, channels) {
  const items = requestItems(project).map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (project.request_type.includes("관리처분")) {
    return `안녕하세요.

${project.project_name}의 관리처분계획인가 관련 공식 자료 확인을 요청드립니다.

사업명: ${project.project_name}
관할/단계: ${project.district} / ${project.current_stage}

확인 요청 자료
${items}

현재 공개화면에서는 관리처분 관련 인가일·고시일 일부만 확인되고, 공사비·정비사업비 수치 및 별첨 원문은 확인되지 않아 문의드립니다.

가능하면 전자파일, 공개 URL, 고시번호·고시일, 자료명, 기준일을 함께 알려주시기 바랍니다. 비공개 대상이 있으면 공개 가능한 부분, 비공개 사유, 방문열람 가능 여부를 구분해 회신 부탁드립니다.

감사합니다.`;
  }
  return `안녕하세요.

${project.project_name}의 조합설립인가 관련 공식 자료 확인을 요청드립니다.

사업명: ${project.project_name}
관할/단계: ${project.district} / ${project.current_stage}

확인 요청 자료
${items}

현재 공개화면에서는 조합설립인가 신청일·인가일 일부만 확인되고, 고시번호·고시일·원문 URL은 확인되지 않아 문의드립니다.

가능하면 전자파일, 공개 URL, 고시번호·고시일, 자료명, 기준일을 함께 알려주시기 바랍니다. 비공개 대상이 있으면 공개 가능한 부분, 비공개 사유, 방문열람 가능 여부를 구분해 회신 부탁드립니다.

감사합니다.`;
}

function buildRows({ packet, contact, searchRerun, intakeRows }) {
  const searchByRank = byRank(searchRerun.rows || []);
  const intakeByProjectRank = byRank(intakeRows);
  const contactRows = contact.flatRows || [];
  return (packet.projectPackets || []).map((project) => {
    const channels = channelsForRank(contactRows, project.rank);
    const primary = channels[0] || {};
    const searchRow = searchByRank.get(String(project.rank)) || {};
    const intake = intakeByProjectRank.get(String(project.rank)) || {};
    const filed =
      intake.filing_status === "filed_waiting_response" ||
      intake.filing_status === "response_received_validate" ||
      intake.filing_status === "response_ready_to_append" ||
      intake.filing_status === "response_needs_intake_fix" ||
      intake.filing_status === "closed" ||
      intake.filing_receipt_no ||
      intake.filed_at;
    const status =
      intake.response_status === "no_response"
        ? filed
          ? "filed_waiting_response"
          : "ready_to_file_if_department_response_not_available"
        : intake.response_status || "intake_missing";
    return {
      rank: project.rank,
      project_name: project.project_name,
      district: project.district,
      current_stage: project.current_stage,
      receiving_agency: receivingAgency(project),
      primary_channel: primary.channel_name || "",
      primary_channel_url: primary.official_url || "",
      primary_channel_hint: primary.public_contact_hint || "",
      primary_channel_evidence: primary.official_page_evidence || "",
      fallback_channels: channels
        .slice(1)
        .map((row) => row.channel_name)
        .join("; "),
      disclosure_title: disclosureTitle(project),
      requested_document: project.requested_document,
      requested_items: requestItems(project).join("; "),
      public_search_gap: searchRow.conclusion || "",
      remaining_gap: searchRow.remaining_gap || "",
      intake_fields_to_fill: intakeFields(project).join("; "),
      response_promotion_rule: responsePromotionRule(project),
      response_status: intake.response_status || "missing",
      packet_status: status,
      disclosure_body: disclosureBody(project, searchRow, channels),
      related_closure_ids: project.closure_ids,
      response_intake_file: RESPONSE_INTAKE_INPUT,
      decision_draft_command: "node scripts/generate-high-blocking-response-decision-drafts.mjs",
      regenerate_command: "node scripts/regenerate-research-artifacts.mjs",
    };
  });
}

function markdown(summary, rows) {
  return `# High Blocking 정보공개청구 패킷

작성 기준: ${UPDATED_AT}

이 문서는 공개 검색과 일반 문의만으로 닫히지 않은 high blocking 원문 병목을 정보공개청구 또는 공식 민원으로 전환하기 위한 실행 패킷이다. 목적은 추정값을 채우는 것이 아니라, 확정값 승격에 필요한 원문 식별자·자료명·공개/비공개 사유를 구조화해서 받는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 정보공개 전환 준비 | ${summary.ready_to_file_count} |
| 관할 분포 | ${summary.district_summary} |
| 단계 분포 | ${summary.stage_summary} |

## 전환 기준

1. 담당부서 또는 정보몽땅 회신으로 고시번호·고시일·원문 URL·자료명이 확인되면 정보공개청구 없이 \`node scripts/record-high-blocking-response.mjs\` 또는 \`high-blocking-source-response-intake.json\`으로 반영한다.
2. 회신이 없거나 공개 URL이 없다는 답변이면 아래 청구 본문을 사용해 정보공개청구/공식 민원으로 전환한다.
3. 회신에서 개인정보나 비공개 대상 내용이 섞여 있으면 사업 수치·자료명·고시정보만 intake에 기록한다.
4. 회신 자체는 자동 확정 근거가 아니다. \`node scripts/generate-high-blocking-response-decision-drafts.mjs\`로 검증해 \`ready_to_append\`인 경우만 decision 로그에 붙인다.

## 사업별 요약

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "receiving_agency", label: "청구/문의 대상" },
  { key: "primary_channel", label: "우선 채널" },
  { key: "public_search_gap", label: "공개 검색 결론" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "packet_status", label: "상태" },
])}

## 청구 본문

${rows
  .map(
    (row) => `### ${row.rank}. ${row.project_name}

| 항목 | 내용 |
| --- | --- |
| 접수 대상 | ${row.receiving_agency} |
| 우선 채널 | ${row.primary_channel} |
| 공식 URL | ${row.primary_channel_url} |
| 보조 채널 | ${row.fallback_channels || "없음"} |
| 클로저 | ${row.related_closure_ids} |
| 회신 입력 | ${row.response_intake_file} |
| 값 승격 규칙 | ${row.response_promotion_rule} |

청구 제목:

\`\`\`text
${row.disclosure_title}
\`\`\`

청구 내용:

\`\`\`text
${row.disclosure_body}
\`\`\`

회신 후 채울 intake 필드:

\`\`\`text
${row.intake_fields_to_fill}
\`\`\`
`,
  )
  .join("\n")}
`;
}

async function main() {
  const packet = await readJson(ESCALATION_INPUT);
  const contact = await readJson(CONTACT_INPUT);
  const searchRerun = await readJson(SEARCH_RERUN_INPUT);
  const intakeRows = await readJson(RESPONSE_INTAKE_INPUT);
  const rows = buildRows({ packet, contact, searchRerun, intakeRows });
  const districtCounts = countBy(rows, "district");
  const stageCounts = countBy(rows, "current_stage");
  const summary = {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    ready_to_file_count: rows.filter((row) => row.packet_status === "ready_to_file_if_department_response_not_available").length,
    district_counts: districtCounts,
    stage_counts: stageCounts,
    district_summary: countText(districtCounts),
    stage_summary: countText(stageCounts),
    inputs: [ESCALATION_INPUT, CONTACT_INPUT, SEARCH_RERUN_INPUT, RESPONSE_INTAKE_INPUT],
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(
    OUT_CSV,
    toCsv(rows.map((row) => ({ ...row, disclosure_body: compact(row.disclosure_body, 1200) }))),
  );
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ rows: rows.length, readyToFile: summary.ready_to_file_count, output: "analysis/high-blocking-info-disclosure-packet.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
