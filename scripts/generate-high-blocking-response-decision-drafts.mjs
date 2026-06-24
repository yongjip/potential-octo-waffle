#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-response-decision-drafts.md");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-response-decision-drafts.json");

const PACKET_INPUT = "analysis/high-blocking-source-escalation-packet.json";
const INTAKE_INPUT = "data/review/high-blocking-source-response-intake.json";
const DECISIONS_INPUT = "data/review/source-verification-closure-decisions.json";

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
const VALID_STATUSES = new Set(["no_response", "confirmed", "partial", "unavailable", "info_disclosure_required"]);

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

function compact(value, limit = 1000) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function nextDecisionNumber(decisions) {
  const max = decisions.reduce((highest, row) => {
    const match = String(row.decision_id || "").match(/^svc-\d{8}-(\d{4})$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return max + 1;
}

function decisionId(number) {
  return `svc-20260623-${String(number).padStart(4, "0")}`;
}

function intakeByRank(intakeRows) {
  return new Map(intakeRows.map((row) => [String(row.rank), row]));
}

function validateIntake(project, intake) {
  const issues = [];
  if (!intake) return ["intake row missing"];
  if (!VALID_STATUSES.has(intake.response_status)) issues.push(`invalid response_status: ${intake.response_status}`);
  if (intake.response_status === "no_response") return issues;
  if (!intake.response_received_at) issues.push("response_received_at missing");
  if (!intake.responder) issues.push("responder missing");
  if (["confirmed", "partial"].includes(intake.response_status)) {
    if (!intake.official_notice_no && !intake.official_notice_date && !intake.official_url && !intake.attachment_name) {
      issues.push("confirmed/partial response needs notice_no, notice_date, official_url, or attachment_name");
    }
    if (!intake.evidence_files && !intake.official_url) issues.push("confirmed/partial response needs evidence_files or official_url");
  }
  if (["unavailable", "info_disclosure_required"].includes(intake.response_status) && !intake.response_note) {
    issues.push("unavailable/info_disclosure_required response needs response_note");
  }
  if (project.request_type.includes("관리처분") && ["confirmed", "partial"].includes(intake.response_status)) {
    const values = intake.confirmed_values || {};
    if (!values.management_construction_cost && !values.management_total_project_cost && !intake.attachment_name && !intake.official_url) {
      issues.push("management response needs construction/project cost value, attachment_name, or official_url");
    }
  }
  return issues;
}

function resolvedValue(project, intake) {
  const values = intake.confirmed_values || {};
  if (project.request_type.includes("관리처분")) {
    return values.management_construction_cost || values.management_total_project_cost || "";
  }
  return unique([intake.official_notice_no, intake.official_notice_date, intake.official_url]).join(" / ");
}

function decisionStatus(intake) {
  if (intake.response_status === "confirmed") return "confirmed";
  if (intake.response_status === "partial") return "pending";
  if (["unavailable", "info_disclosure_required"].includes(intake.response_status)) return "deferred";
  return "";
}

function decisionBasis(project, intake) {
  if (intake.response_status === "confirmed") {
    return project.request_type.includes("관리처분")
      ? "official_response_management_cost_source_confirmed"
      : "official_response_original_notice_key_confirmed";
  }
  if (intake.response_status === "partial") return "official_response_partial_source_available";
  if (intake.response_status === "info_disclosure_required") return "official_response_info_disclosure_or_visit_required";
  if (intake.response_status === "unavailable") return "official_response_public_source_unavailable";
  return "";
}

function recommendedClosure(project, intake) {
  if (intake.response_status === "confirmed") {
    return project.request_type.includes("관리처분") ? "management_cost_source_confirmed" : "original_notice_key_confirmed";
  }
  if (intake.response_status === "partial") return "pending_secondary_source_after_official_response";
  if (intake.response_status === "info_disclosure_required") return "defer_info_disclosure_or_visit_required";
  if (intake.response_status === "unavailable") return "defer_no_public_source_after_official_response";
  return "";
}

function fieldLabel(project) {
  if (project.request_type.includes("관리처분")) return "관리처분 공사비";
  return `${project.high_blocking_fields} high fields`;
}

function fieldId(project) {
  if (project.request_type.includes("관리처분")) return "management_construction_cost";
  return "source_link_closure";
}

function buildDecision(project, intake, nextNumber) {
  return {
    decision_id: decisionId(nextNumber),
    decided_at: intake.response_received_at || UPDATED_AT,
    reviewer: "external_official_response_intake",
    closure_id: project.closure_ids,
    sprint_id: project.closure_ids?.startsWith("S4") ? "S4" : "S2",
    priority: "P0",
    project_name: project.project_name,
    field_id: fieldId(project),
    field_label: fieldLabel(project),
    recommended_closure: recommendedClosure(project, intake),
    decision_status: decisionStatus(intake),
    decision_basis: decisionBasis(project, intake),
    resolved_value: resolvedValue(project, intake),
    evidence_files: unique([intake.official_url, intake.evidence_files, project.evidence_to_attach]).join("; "),
    decision_note: compact(
      [
        intake.response_note,
        intake.official_notice_no ? `고시번호: ${intake.official_notice_no}` : "",
        intake.official_notice_date ? `고시일: ${intake.official_notice_date}` : "",
        intake.attachment_name ? `첨부/자료명: ${intake.attachment_name}` : "",
        Object.entries(intake.confirmed_values || {})
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}=${value}`)
          .join("; "),
      ]
        .filter(Boolean)
        .join(" / "),
      1200,
    ),
    follow_up_action:
      intake.follow_up_action ||
      (intake.response_status === "confirmed"
        ? "decision을 source-verification-closure-decisions에 append한 뒤 node scripts/regenerate-research-artifacts.mjs 실행"
        : "공개 URL, 정보공개청구 결과, 방문열람 자료명 등 후속 근거를 intake에 보강"),
  };
}

function buildRows(packet, intakeRows, decisions) {
  const byRank = intakeByRank(intakeRows);
  let nextNumber = nextDecisionNumber(decisions);
  const rows = [];
  const drafts = [];
  for (const project of packet.projectPackets) {
    const intake = byRank.get(String(project.rank));
    const issues = validateIntake(project, intake);
    const status = intake?.response_status || "missing";
    const ready = intake && status !== "no_response" && issues.length === 0;
    let draft = null;
    if (ready) {
      draft = buildDecision(project, intake, nextNumber);
      drafts.push(draft);
      nextNumber += 1;
    }
    rows.push({
      rank: project.rank,
      project_name: project.project_name,
      closure_ids: project.closure_ids,
      request_type: project.request_type,
      response_status: status,
      draft_status: ready ? "ready_to_append" : status === "no_response" ? "waiting_for_response" : "needs_intake_fix",
      validation_issues: issues.join("; "),
      draft_decision_id: draft?.decision_id || "",
      target_decision_status: draft?.decision_status || "",
      resolved_value: draft?.resolved_value || "",
      evidence_files: draft?.evidence_files || "",
    });
  }
  return { rows, drafts };
}

function markdown(rows, drafts) {
  return `# High Blocking 회신 Decision 초안

작성 기준: ${UPDATED_AT}

이 문서는 \`data/review/high-blocking-source-response-intake.json\`에 입력한 담당부서/정보몽땅 회신을 \`source-verification-closure-decisions.json\`에 append 가능한 decision 초안으로 바꾸는 검증 결과다. 이 스크립트는 원본 decision 파일을 직접 수정하지 않는다.

## 사용 절차

1. \`analysis/high-blocking-source-escalation-packet.md\`의 문의 패킷으로 회신을 받는다.
2. 회신 내용을 가능하면 \`node scripts/record-high-blocking-response.mjs\`로, 필요하면 \`data/review/high-blocking-source-response-intake.json\`에 직접 입력한다.
3. \`node scripts/generate-high-blocking-response-decision-drafts.mjs\`를 실행한다.
4. 아래 상태가 \`ready_to_append\`인 초안만 \`data/review/source-verification-closure-decisions.json\` 뒤에 추가한다.
5. \`node scripts/regenerate-research-artifacts.mjs\`를 실행해 장부와 readiness audit을 갱신한다.

## Intake 상태

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "closure_ids", label: "클로저" },
  { key: "response_status", label: "회신 상태" },
  { key: "draft_status", label: "초안 상태" },
  { key: "validation_issues", label: "보완 필요" },
  { key: "draft_decision_id", label: "초안 ID" },
])}

## Append 가능한 Decision 초안

\`\`\`json
${JSON.stringify(drafts, null, 2)}
\`\`\`
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const packet = await readJson(PACKET_INPUT);
  const intakeRows = await readJson(INTAKE_INPUT);
  const decisions = await readJson(DECISIONS_INPUT);
  const { rows, drafts } = buildRows(packet, intakeRows, decisions);
  const summary = {
    generated_at: UPDATED_AT,
    intake_rows: intakeRows.length,
    packet_projects: packet.projectPackets.length,
    ready_to_append: drafts.length,
    waiting_for_response: rows.filter((row) => row.draft_status === "waiting_for_response").length,
    needs_intake_fix: rows.filter((row) => row.draft_status === "needs_intake_fix").length,
    outputs: [OUT_MD, OUT_JSON],
  };
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows, drafts }, null, 2)}\n`, "utf8");
  await writeFile(OUT_MD, markdown(rows, drafts), "utf8");
  console.log(
    JSON.stringify(
      {
        ready_to_append: summary.ready_to_append,
        waiting_for_response: summary.waiting_for_response,
        needs_intake_fix: summary.needs_intake_fix,
        output: "analysis/high-blocking-response-decision-drafts.{md,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
