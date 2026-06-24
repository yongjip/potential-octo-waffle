#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-source-escalation-packet.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-source-escalation-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-source-escalation-packet.json");

const RESIDUAL_INPUT = "analysis/residual-gap-interpretation-audit.json";
const STATUS_INPUT = "analysis/research-status-dashboard.json";
const SEARCH_LOG_INPUT = "data/review/high-blocking-public-search-log.json";

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

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "(blank)";
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

function targetChannel(project) {
  if (project.district === "송파구") {
    return "송파구 주택사업과/정비사업 담당, 정비사업 정보몽땅 공개항목, 필요 시 정보공개청구";
  }
  if (project.district === "광진구") {
    return "광진구 주거사업과/정비사업 담당, 정비사업 정보몽땅 담당 창구, 필요 시 정보공개청구";
  }
  return `${project.district || "관할 자치구"} 정비사업 담당부서, 정비사업 정보몽땅 담당 창구, 필요 시 정보공개청구`;
}

function requestType(project) {
  if (project.current_stage === "관리처분인가") {
    return "관리처분계획인가 별첨/공개항목 확인";
  }
  if (project.current_stage === "조합설립인가") {
    return "조합설립인가 고시번호·고시일·원문 URL 확인";
  }
  return "정비사업 인가·고시 원문 확인";
}

function requestedDocument(project) {
  if (project.current_stage === "관리처분인가") {
    return "관리처분계획인가 고시문, 관리처분계획 별첨 또는 공개 가능한 총 공사비·정비사업비 추산액 자료";
  }
  if (project.current_stage === "조합설립인가") {
    return "조합설립인가 고시문 또는 인가 관련 공고문, 고시번호, 고시일, 원문/첨부 URL";
  }
  return "해당 단계 인가·고시 원문, 고시번호, 고시일, 원문/첨부 URL";
}

function decisionUpdate(project) {
  if (project.current_stage === "관리처분인가") {
    return "관리처분 공사비가 확인되면 S4-0002 및 management-stage-value-resolution에 총 공사비·정비사업비 기준과 출처를 기록";
  }
  return "고시번호·고시일·원문 URL이 확인되면 S2 클로저 항목을 confirmed로 바꾸고 core-value-confirmation-ledger의 source_link_required/no_source_text 필드를 재생성";
}

function compactSources(rows) {
  return unique(
    rows
      .flatMap((row) => String(row.source_to_open || "").split(";").map((item) => item.trim()))
      .concat(rows.map((row) => row.project_note)),
  ).join("; ");
}

function normalizeStatusRows(statusData) {
  if (Array.isArray(statusData)) return statusData;
  return statusData.projectRows || statusData.rows || [];
}

function normalizeSearchRows(searchLogData) {
  if (Array.isArray(searchLogData)) return searchLogData;
  return searchLogData.rows || [];
}

function officialSearchSummary(searchLog) {
  return searchLog?.official_channel_search_summary || "";
}

function buildInquiryBody(project, rows, searchLog) {
  const fields = rows.map((row) => `- ${row.field_label}${row.current_value ? `: 현재 구조화값 ${row.current_value}` : ""}`).join("\n");
  const sources = compactSources(rows);
  const searchSummary = officialSearchSummary(searchLog);
  const publicSearchText = searchSummary
    ? `\n\n참고로 비회원 공개 경로 재검색에서는 다음까지 확인했습니다.\n${searchSummary}\n`
    : "";
  return `안녕하세요. ${project.project_name} 관련 정비사업 원문 확인을 위해 문의드립니다.

확인하려는 자료는 ${requestedDocument(project)}입니다.

현재 리서치 장부에서 아래 항목은 구조화 보조근거 또는 공개 요약값은 있으나, 본고시 원문/첨부 또는 담당부서 확인 전에는 확정값으로 쓰지 않고 있습니다.

${fields}

확인 부탁드리는 사항은 다음과 같습니다.
1. 해당 사업의 ${project.current_stage} 관련 고시번호와 고시일
2. 원문 고시문 또는 첨부 파일을 열람할 수 있는 공식 URL
3. 위 필드값이 포함된 원문/별첨 명칭과 기준일
4. 공개 URL이 없을 경우 정보공개청구 또는 방문 열람으로 확인해야 하는 자료명

참고로 현재 확인한 내부 근거 경로는 다음과 같습니다: ${sources || "없음"}
${publicSearchText}

회신 내용은 공식 원문 기반 비교표의 출처 보강과 보류 항목 해소에만 사용하겠습니다.`;
}

function buildProjectPackets(rows, statusRows, searchLogRows) {
  if (!rows.length) return [];
  const statusByRank = new Map(statusRows.map((row) => [String(row.rank), row]));
  const searchLogByRank = byRank(searchLogRows);
  const selectedRows = rows
    .sort((a, b) => Number(a.rank) - Number(b.rank) || a.field_label.localeCompare(b.field_label));

  const grouped = selectedRows.reduce((acc, row) => {
    const rank = String(row.rank);
    if (!acc.has(rank)) acc.set(rank, []);
    acc.get(rank).push(row);
    return acc;
  }, new Map());

  return [...grouped.entries()]
    .map(([rank, projectRows]) => {
      const first = projectRows[0];
      const highRows = projectRows.filter((row) => row.blocking_level === "high");
      const mediumRows = projectRows.filter((row) => row.blocking_level === "medium");
      const status = statusByRank.get(rank) || {};
      const searchLog = searchLogByRank.get(rank) || {};
      const project = {
        rank,
        focus_area: first.focus_area,
        district: first.district,
        project_name: first.project_name,
        current_stage: first.current_stage,
        risk_signal_level: first.risk_signal_level,
        evidence_grade: first.evidence_grade,
        readiness: status.readiness || "",
        target_channel: targetChannel(first),
        request_type: requestType(first),
        requested_document: requestedDocument(first),
        high_blocking_fields: highRows.length,
        medium_context_fields: mediumRows.length,
        requested_fields: unique(projectRows.map((row) => row.field_label)).join("; "),
        known_current_values: projectRows
          .filter((row) => row.current_value)
          .map((row) => `${row.field_label}=${row.current_value}`)
          .join("; "),
        closure_ids: unique(projectRows.flatMap((row) => String(row.related_deferred_closures || "").split(";").map((item) => item.trim()))).join("; "),
        evidence_to_attach: compactSources(projectRows),
        official_search_summary: officialSearchSummary(searchLog),
        inquiry_subject: `[정비사업 원문 확인 요청] ${first.project_name} ${requestType(first)}`,
        inquiry_body: "",
        expected_decision_update: decisionUpdate(first),
        next_local_update: "회신 또는 원문 URL 확보 후 data/review/source-verification-closure-decisions.json에 decision을 추가하고 node scripts/regenerate-research-artifacts.mjs 실행",
        project_note: first.project_note,
      };
      project.inquiry_body = buildInquiryBody(project, projectRows, searchLog);
      return { ...project, fields: projectRows };
    })
    .sort((a, b) => b.high_blocking_fields - a.high_blocking_fields || Number(a.rank) - Number(b.rank));
}

function fieldRowsFromPackets(projectPackets) {
  return projectPackets.flatMap((project) =>
    project.fields.map((row) => ({
      rank: project.rank,
      focus_area: project.focus_area,
      district: project.district,
      project_name: project.project_name,
      current_stage: project.current_stage,
      target_channel: project.target_channel,
      request_type: project.request_type,
      field_id: row.field_id,
      field_label: row.field_label,
      current_value: row.current_value,
      verification_status: row.verification_status,
      blocking_level: row.blocking_level,
      related_task_priority: row.related_task_priority,
      closure_ids: row.related_deferred_closures,
      source_to_open: row.source_to_open,
      deferred_followups: row.deferred_followups,
      expected_decision_update: project.expected_decision_update,
    })),
  );
}

function markdown(summary, projectPackets, fieldRows) {
  return `# High Blocking 원문 확인 패킷

작성 기준: ${UPDATED_AT}

이 문서는 \`residual-gap-interpretation-audit\`에서 high blocking으로 남은 공식 원문 병목을 담당부서/정보몽땅 확인 요청 단위로 묶은 실행 패킷이다. 목적은 추정값을 채우는 것이 아니라, 현재 비교표에서 확정값으로 쓰지 말아야 할 항목을 어떤 원문·고시번호·담당 창구로 닫을지 정하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 확인 대상 사업장 | ${summary.project_count} |
| 확인 대상 필드 | ${summary.field_count} |
| high blocking 필드 | ${summary.high_blocking_count} |
| 함께 묶은 medium 필드 | ${summary.medium_context_field_count} |
| 대상 창구 | ${summary.target_channels} |

## 실행 순서

1. 아래 사업별 \`문의 제목\`과 \`문의 본문\`으로 관할 자치구 또는 정보몽땅 담당 창구에 확인한다.
2. 회신에서 고시번호·고시일·원문 URL·첨부명·기준일을 분리해 기록한다.
3. 원문 URL 또는 회신 근거가 확보되면 \`data/review/source-verification-closure-decisions.json\`에 결정 로그를 추가한다.
4. \`node scripts/regenerate-research-artifacts.mjs\`를 실행해 비교표, 잔여 해석, readiness audit을 재생성한다.
5. 회신이 “비공개/방문열람/정보공개청구 필요”이면 이 패킷의 보류 근거로 유지하고 확정값 승격은 하지 않는다.

## 사업별 패킷

${projectPackets
  .map(
    (project) => `### ${project.rank}. ${project.project_name}

| 항목 | 내용 |
| --- | --- |
| 생활권 | ${project.focus_area} |
| 관할 | ${project.district} |
| 현재 단계 | ${project.current_stage} |
| 리스크/근거등급 | ${project.risk_signal_level} / ${project.evidence_grade} |
| 대상 창구 | ${project.target_channel} |
| 요청 유형 | ${project.request_type} |
| 요청 원문 | ${project.requested_document} |
| high/medium 필드 | ${project.high_blocking_fields} / ${project.medium_context_fields} |
| 확인 필드 | ${project.requested_fields} |
| 현재 구조화값 | ${project.known_current_values || "없음"} |
| 클로저 ID | ${project.closure_ids || "없음"} |
| 첨부/참고 근거 | ${project.evidence_to_attach || "없음"} |
| 공개 재검색 메모 | ${project.official_search_summary || "없음"} |
| 회신 후 로컬 처리 | ${project.next_local_update} |

문의 제목:

\`\`\`text
${project.inquiry_subject}
\`\`\`

문의 본문:

\`\`\`text
${project.inquiry_body}
\`\`\`
`,
  )
  .join("\n")}

## 필드별 확인표

${mdTable(fieldRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재값" },
  { key: "verification_status", label: "장부 상태" },
  { key: "blocking_level", label: "차단" },
  { key: "target_channel", label: "대상 창구" },
  { key: "closure_ids", label: "클로저" },
])}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const residual = await readJson(RESIDUAL_INPUT);
  const statusData = await readJson(STATUS_INPUT);
  const searchLogData = await readJson(SEARCH_LOG_INPUT);
  const residualRows = residual.rows || [];
  const statusRows = normalizeStatusRows(statusData);
  const searchLogRows = normalizeSearchRows(searchLogData);
  const searchRanks = new Set(searchLogRows.map((row) => String(row.rank || "")).filter(Boolean));
  const manualRows = residualRows.filter((row) => row.interpretation_class === "manual_source_escalation");
  const fallbackRows = residualRows.filter(
    (row) =>
      searchRanks.has(String(row.rank || "")) &&
      (row.blocking_level === "high" || row.field_id === "management_construction_cost"),
  );
  const sourceRows = manualRows.length ? manualRows : fallbackRows;
  const projectPackets = buildProjectPackets(sourceRows, statusRows, searchLogRows);
  const fieldRows = fieldRowsFromPackets(projectPackets);
  const summary = {
    generated_at: UPDATED_AT,
    project_count: projectPackets.length,
    field_count: fieldRows.length,
    high_blocking_count: fieldRows.filter((row) => row.blocking_level === "high").length,
    medium_context_field_count: fieldRows.filter((row) => row.blocking_level === "medium").length,
    request_type_counts: countBy(projectPackets, "request_type"),
    target_channels: countText(countBy(projectPackets, "target_channel")),
    project_names: projectPackets.map((project) => project.project_name).join("; "),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  const jsonPayload = {
    generated_at: UPDATED_AT,
    summary,
    projectPackets,
    fieldRows,
    inputs: {
      residual: RESIDUAL_INPUT,
      status: STATUS_INPUT,
      publicSearchLog: SEARCH_LOG_INPUT,
    },
  };

  await writeFile(OUT_JSON, `${JSON.stringify(jsonPayload, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(fieldRows), "utf8");
  await writeFile(OUT_MD, markdown(summary, projectPackets, fieldRows), "utf8");

  console.log(
    JSON.stringify(
      {
        projects: summary.project_count,
        fields: summary.field_count,
        high_blocking: summary.high_blocking_count,
        medium_context: summary.medium_context_field_count,
        output: "analysis/high-blocking-source-escalation-packet.{md,csv,json}",
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
