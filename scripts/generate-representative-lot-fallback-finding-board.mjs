#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const REVIEW_DIR = "data/review";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-finding-board.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-finding-board.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-finding-board.json");
const OUT_README = path.join(REVIEW_DIR, "representative-lot-fallback-browser-findings.README.md");
const OUT_EXAMPLES = path.join(REVIEW_DIR, "representative-lot-fallback-browser-finding-examples.json");

const EDGE_PACKET_INPUT = "analysis/representative-lot-fallback-edge-session-packet.json";
const FINDINGS_INPUT = "data/review/representative-lot-fallback-browser-findings.json";
const API_PROBE_INPUT = "analysis/representative-lot-fallback-api-probe.json";

const VALID_CHECK_STATUSES = new Set([
  "",
  "confirmed_current_business",
  "stage_gap_hold",
  "planning_layer_only",
  "no_present_sn_found",
  "ambiguous_candidate",
  "candidate_rejected",
]);

const VALID_APPLY_STATUSES = new Set(["", "pending_apply", "applied"]);

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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function splitSemi(text) {
  return String(text || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function byRank(rows) {
  return new Map(
    rows
      .map((row) => {
        const rank = String(row.rank || row.target?.match(/^(\d+)\./)?.[1] || "");
        return [rank, row];
      })
      .filter(([rank]) => rank),
  );
}

function byRankMulti(rows) {
  return rows.reduce((acc, row) => {
    const key = String(row.rank || "");
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function latestFinding(rows) {
  return [...rows].sort((a, b) => String(b.checked_at || "").localeCompare(String(a.checked_at || "")))[0] || {};
}

function buildRecordCommand(rank, checkStatus, checkedAt = "YYYY-MM-DD") {
  const autoFlag = checkStatus === "confirmed_current_business" ? " --auto-mark-applied" : "";
  return `node scripts/record-representative-lot-fallback-finding.mjs --rank=${rank} --checked-at=${checkedAt} --check-status=${checkStatus} --prefill-from-api --write --refresh${autoFlag}`;
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function addIssue(issues, row, severity, field, message, action) {
  issues.push({
    rank: row?.rank || "",
    project_name: row?.project_name || "",
    checked_at: row?.checked_at || "",
    severity,
    field,
    message,
    action,
  });
}

function validateFindings(findingRows, packetRows) {
  const issues = [];
  const packetByRank = byRank(packetRows);

  for (const row of findingRows) {
    const rank = String(row.rank || "");
    const packet = packetByRank.get(rank);
    if (!rank) addIssue(issues, row, "error", "rank", "rank 누락", "edge session packet의 rank를 입력");
    else if (!packet) addIssue(issues, row, "error", "rank", `알 수 없는 rank: ${rank}`, "fallback 6건 중 하나의 rank로 수정");

    if (packet && row.project_name && row.project_name !== packet.target.replace(/^\d+\.\s*/, "")) {
      addIssue(issues, row, "warning", "project_name", "rank와 project_name이 edge packet과 다름", "rank 기준 사업명으로 맞춤");
    }

    if (!isDate(row.checked_at)) addIssue(issues, row, "error", "checked_at", "checked_at이 YYYY-MM-DD 형식이 아님", "확인일을 YYYY-MM-DD로 입력");
    if (!VALID_CHECK_STATUSES.has(String(row.check_status || ""))) {
      addIssue(
        issues,
        row,
        "error",
        "check_status",
        `허용되지 않는 check_status: ${row.check_status}`,
        "confirmed_current_business, stage_gap_hold, planning_layer_only, no_present_sn_found, ambiguous_candidate, candidate_rejected 중 하나로 입력",
      );
    }
    if (!VALID_APPLY_STATUSES.has(String(row.apply_status || ""))) {
      addIssue(issues, row, "warning", "apply_status", `허용되지 않는 apply_status: ${row.apply_status}`, "pending_apply 또는 applied로 입력");
    }
    if (row.evidence_url && !isHttpUrl(row.evidence_url)) {
      addIssue(issues, row, "warning", "evidence_url", "evidence_url이 http(s) URL이 아님", "공식 화면 URL 또는 근거 URL 입력");
    }
    if (row.cleanup_site_url && !isHttpUrl(row.cleanup_site_url)) {
      addIssue(issues, row, "warning", "cleanup_site_url", "cleanup_site_url이 http(s) URL이 아님", "정보몽땅 연결 URL을 그대로 입력");
    }
    if (row.urban_data_reference_date && !isDate(row.urban_data_reference_date)) {
      addIssue(issues, row, "warning", "urban_data_reference_date", "urban_data_reference_date가 YYYY-MM-DD 형식이 아님", "데이터 기준일을 YYYY-MM-DD로 입력");
    }

    if (row.check_status === "confirmed_current_business") {
      if (!String(row.present_sn || "").trim()) {
        addIssue(issues, row, "error", "present_sn", "confirmed_current_business인데 present_sn이 비어 있음", "확인된 presentSn 입력");
      }
      if (!String(row.urban_data_reference_date || "").trim()) {
        addIssue(issues, row, "error", "urban_data_reference_date", "confirmed_current_business인데 데이터 기준일이 비어 있음", "기준일 입력");
      }
      if (/planning/i.test(String(row.urban_business_type || "")) || /신속통합기획|기획완료/.test(String(row.urban_business_type || ""))) {
        addIssue(issues, row, "warning", "urban_business_type", "confirmed_current_business인데 planning 계열로 보임", "사업유형을 다시 확인하거나 hold 상태로 수정");
      }
    }

    if (
      ["stage_gap_hold", "planning_layer_only", "no_present_sn_found", "ambiguous_candidate", "candidate_rejected"].includes(
        String(row.check_status || ""),
      ) &&
      !String(row.decision_note || "").trim()
    ) {
      addIssue(issues, row, "warning", "decision_note", "보류/제외 상태인데 decision_note가 비어 있음", "왜 보류/제외했는지 한 줄 메모 입력");
    }
  }

  return issues;
}

function rowStatus(packetRow, finding) {
  if (!finding.checked_at) return "unreviewed";
  if (finding.apply_status === "applied") return "applied";
  if (finding.check_status === "confirmed_current_business") return "ready_to_promote";
  if (finding.check_status === "stage_gap_hold") return "hold_by_stage_gap";
  if (finding.check_status === "planning_layer_only") return "hold_planning_layer";
  if (finding.check_status === "no_present_sn_found") return "retry_needed";
  if (finding.check_status === "ambiguous_candidate") return "candidate_review_needed";
  if (finding.check_status === "candidate_rejected") return "candidate_rejected";
  return "review_logged";
}

function buildRows(packetRows, findingRows, apiProbeRows) {
  const findingsByRank = byRankMulti(findingRows);
  const apiByRank = byRank(apiProbeRows || []);

  return packetRows.map((packetRow) => {
    const rank = String(packetRow.target || "").match(/^(\d+)\./)?.[1] || "";
    const findings = findingsByRank[rank] || [];
    const latest = latestFinding(findings);
    const api = apiByRank.get(rank) || {};
    const defaultCheckStatus =
      api.api_verdict === "strong_same_stage_candidate"
        ? "confirmed_current_business"
        : api.api_verdict === "planning_hold"
          ? "planning_layer_only"
          : api.api_verdict === "stage_gap_hold"
            ? "stage_gap_hold"
            : api.api_verdict === "needs_manual_confirmation"
              ? "ambiguous_candidate"
              : "";
    return {
      rank,
      project_name: String(packetRow.target || "").replace(/^\d+\.\s*/, ""),
      focus_area: String(packetRow.area_or_lane || "").split(" / ")[0] || "",
      current_stage: String(packetRow.area_or_lane || "").split(" / ")[1] || "",
      candidate_relation: String(packetRow.status || "").split(";")[0] || "",
      board_status: rowStatus(packetRow, latest),
      checked_at: latest.checked_at || "",
      check_status: latest.check_status || "",
      present_sn: latest.present_sn || "",
      urban_data_reference_date: latest.urban_data_reference_date || "",
      urban_business_type: latest.urban_business_type || "",
      cleanup_site_url: latest.cleanup_site_url || "",
      verified_zone_name: latest.verified_zone_name || "",
      apply_status: latest.apply_status || "",
      evidence_url: latest.evidence_url || "",
      evidence_note: latest.evidence_note || "",
      decision_note: latest.decision_note || "",
      follow_up_action: latest.follow_up_action || packetRow.output_route || "",
      api_verdict: api.api_verdict || "",
      api_present_sn: api.top_present_sn || "",
      api_data_reference_date: api.top_data_reference_date || "",
      api_business_type: api.top_business_type || "",
      api_candidate_name: api.top_candidate_name || "",
      api_cleanup_site_url: api.top_cleanup_site_url || "",
      prefill_command:
        defaultCheckStatus && api.api_verdict
          ? buildRecordCommand(rank, defaultCheckStatus)
          : `node scripts/record-representative-lot-fallback-finding.mjs --rank=${rank} --checked-at=YYYY-MM-DD --check-status=... --write --refresh`,
      manual_apply_command:
        defaultCheckStatus === "confirmed_current_business"
          ? `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=${rank} --checked-at=YYYY-MM-DD --write --refresh`
          : "",
      probe_key: packetRow.probe_key || "",
      accept_gate: packetRow.accept_gate || "",
      reject_gate: packetRow.reject_gate || "",
      next_outputs: packetRow.output_route || "",
      helper: packetRow.helper_or_next || "",
    };
  });
}

function summarize(rows, findingRows, issues) {
  return {
    generated_at: `${kstDate()} KST`,
    project_count: rows.length,
    finding_count: findingRows.length,
    unreviewed_count: rows.filter((row) => row.board_status === "unreviewed").length,
    ready_to_promote_count: rows.filter((row) => row.board_status === "ready_to_promote").length,
    hold_count: rows.filter((row) => /^hold_/.test(row.board_status)).length,
    retry_needed_count: rows.filter((row) => row.board_status === "retry_needed").length,
    applied_count: rows.filter((row) => row.board_status === "applied").length,
    validation_error_count: issues.filter((row) => row.severity === "error").length,
    validation_warning_count: issues.filter((row) => row.severity === "warning").length,
    inputs: [EDGE_PACKET_INPUT, FINDINGS_INPUT, API_PROBE_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON, OUT_README, OUT_EXAMPLES],
  };
}

function exampleForRow(row) {
  const holdStatus =
    row.api_verdict === "planning_hold"
      ? "planning_layer_only"
      : row.candidate_relation === "stage_gap_candidate"
        ? "stage_gap_hold"
        : "ambiguous_candidate";
  return {
    rank: row.rank,
    project_name: row.project_name,
    checked_at: "YYYY-MM-DD",
    check_status: row.api_verdict === "strong_same_stage_candidate" ? "confirmed_current_business" : holdStatus,
    present_sn: row.api_verdict === "strong_same_stage_candidate" ? row.api_present_sn || "11000UQ120PS20YYYYMMDD0001" : "",
    urban_data_reference_date: row.api_verdict === "strong_same_stage_candidate" ? row.api_data_reference_date || "YYYY-MM-DD" : "",
    urban_business_type: row.api_verdict === "strong_same_stage_candidate" ? row.api_business_type || "재건축(공동)" : "",
    cleanup_site_url: row.api_cleanup_site_url || "https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=...",
    verified_zone_name: row.api_candidate_name || row.project_name,
    evidence_url: "https://urban.seoul.go.kr/view/new/main.html",
    evidence_note:
      row.api_verdict === "strong_same_stage_candidate"
        ? `API probe 기준값(${row.api_present_sn || "presentSn"}, ${row.api_data_reference_date || "기준일 미상"}, ${row.api_business_type || "사업유형 미상"})과 Edge 상세를 대조`
        : "recordCode popup과 UQ120 상세에서 확인한 핵심 값",
    decision_note:
      row.api_verdict === "planning_hold"
        ? "planning 후보가 먼저 보여 current business 채택 금지"
        : row.candidate_relation === "same_stage_candidate"
          ? "same-stage current business로 확인"
          : "direct notice보다 앞 단계라 current business 식별자로는 아직 승격하지 않음",
    apply_status: "pending_apply",
    follow_up_action: row.next_outputs,
  };
}

function markdown(summary, rows, issues) {
  const readyRows = rows.filter((row) => row.board_status === "ready_to_promote");
  const holdRows = rows.filter((row) => /^hold_/.test(row.board_status) || row.board_status === "candidate_review_needed" || row.board_status === "retry_needed");
  return `# Representative Lot Fallback Finding Board

작성 기준: ${summary.generated_at}

이 문서는 Edge 수동 확인으로 얻은 \`presentSn\` 결과를 intake로 남기고, 어떤 건이 비교 매트릭스 승격 준비 상태인지 확인하는 보드다. 공식 단계 자체는 direct notice를 기준으로 유지하고, 여기서는 current business 식별자 보강 여부만 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 입력된 finding | ${summary.finding_count} |
| 미확인 | ${summary.unreviewed_count} |
| 승격 준비 | ${summary.ready_to_promote_count} |
| 보류 | ${summary.hold_count} |
| 재확인 필요 | ${summary.retry_needed_count} |
| 적용 완료 | ${summary.applied_count} |
| 입력 오류 | ${summary.validation_error_count} |
| 입력 경고 | ${summary.validation_warning_count} |

## 기록 순서

1. ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")} 기준으로 Edge에서 \`presentSn\`, \`데이터 기준일\`, \`사업유형\`을 확인한다.
2. 가능하면 \`node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied\`로 기록한다.
2a. API strong candidate가 아니어도 \`--prefill-from-api\`는 후보 \`presentSn/기준일/사업유형\` 기본값과 보류 메모를 먼저 채우는 용도로 쓴다.
3. \`confirmed_current_business\`면 승격 준비로 두고, \`stage_gap_hold\`, \`planning_layer_only\`, \`ambiguous_candidate\`면 보류/재확인 사유를 남긴다.
4. 입력 후 이 보드에서 \`ready_to_promote\` 또는 \`hold_*\` 상태를 확인한다.
5. \`confirmed_current_business\` 결과는 \`node scripts/generate-representative-lot-fallback-apply-audit.mjs\`로 matrix/project-note 반영 여부를 점검한다.
6. \`--auto-mark-applied\`로 한 번에 닫히지 않았을 때만 \`node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh\`로 \`applied\`를 마무리한다.

## 현재 큐

${mdTable(rows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "candidate_relation", label: "후보 관계" },
    { key: "api_verdict", label: "API 판정" },
    { key: "board_status", label: "보드 상태" },
    { key: "checked_at", label: "확인일" },
    { key: "present_sn", label: "presentSn" },
    { key: "urban_data_reference_date", label: "기준일" },
  ])}

## 승격 준비

${mdTable(readyRows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "present_sn", label: "presentSn" },
    { key: "urban_data_reference_date", label: "기준일" },
    { key: "urban_business_type", label: "사업유형" },
    { key: "follow_up_action", label: "다음 반영" },
  ])}

## 보류/재확인

${mdTable(holdRows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "check_status", label: "확인 결과" },
    { key: "decision_note", label: "보류 사유" },
    { key: "probe_key", label: "프로브 키" },
  ])}

## 복붙용 helper

${mdTable(rows, [
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "api_verdict", label: "API 판정" },
    { key: "prefill_command", label: "기록 명령" },
  ])}

## 입력 검증

${mdTable(issues, [
    { key: "severity", label: "등급" },
    { key: "rank", label: "후보" },
    { key: "project_name", label: "사업장" },
    { key: "checked_at", label: "확인일" },
    { key: "field", label: "필드" },
    { key: "message", label: "내용" },
    { key: "action", label: "조치" },
  ])}
`;
}

function readme(summary, examples) {
  return `# Representative Lot Fallback Browser Findings Intake

작성 기준: ${summary.generated_at}

\`data/review/representative-lot-fallback-browser-findings.json\`은 Edge 브라우저에서 \`representative_lot_fallback_only\` 6건을 직접 확인한 뒤 결과를 누적하는 수동 입력 파일이다. 생성 스크립트는 실제 intake JSON을 덮어쓰지 않고 읽기만 한다.

## 최소 입력 예시

\`\`\`json
${JSON.stringify([examples[0]], null, 2)}
\`\`\`

## 관련 산출물

- \`${FINDINGS_INPUT}\`: 실제 확인 결과 intake
- \`data/review/representative-lot-fallback-browser-finding-examples.json\`: 복사용 예시 행
- ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")}: Edge 확인 순서
- ${fileLink("analysis/representative-lot-fallback-finding-board.md")}: 입력 검증과 승격/보류 상태 보드
- ${fileLink("analysis/representative-lot-fallback-apply-audit.md")}: matrix/project-note 반영 여부와 applied 승격 가능 상태 보드

## 입력 절차

1. ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")}에서 대상 사업장과 프로브 키를 확인한다.
2. \`data/review/representative-lot-fallback-browser-finding-examples.json\`에서 가까운 예시를 복사하거나 \`node scripts/record-representative-lot-fallback-finding.mjs --help\`로 helper 인자를 확인한다.
3. API 후보가 있으면 \`--prefill-from-api\`를 붙여 \`presentSn/기준일/사업유형\` 기본값을 먼저 채운다.
4. 가능하면 \`node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied\`로 기록한다.
5. 수동 편집을 썼다면 \`${FINDINGS_INPUT}\` 배열에 붙이고 \`present_sn\`, \`urban_data_reference_date\`, \`urban_business_type\`, \`decision_note\`를 실제 확인값으로 바꾼다.
6. \`node scripts/generate-representative-lot-fallback-finding-board.mjs\`를 실행해 \`입력 오류\`를 0으로 만든다.
7. \`confirmed_current_business\` 결과는 \`node scripts/generate-representative-lot-fallback-apply-audit.mjs\`로 matrix/project-note 반영 상태를 점검한다.
8. 가능하면 \`--auto-mark-applied\`까지 포함한 기록 명령으로 한 번에 처리하고, 남은 경우만 \`node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh\`로 \`applied\`를 닫는다.

## 권장 값

- \`check_status\`: \`confirmed_current_business\`, \`stage_gap_hold\`, \`planning_layer_only\`, \`no_present_sn_found\`, \`ambiguous_candidate\`, \`candidate_rejected\`
- \`apply_status\`: \`pending_apply\`, \`applied\`
- \`present_sn\`: 서울도시공간포털 current business 식별자
- \`urban_data_reference_date\`: 포털 상세의 데이터 기준일
- \`decision_note\`: 왜 승격/보류했는지 한 줄 설명

## 운영 규칙

- \`presentSn\` 하나만 보여도 current business로 확정하지 않는다. \`데이터 기준일\`과 \`사업유형\`을 같이 본다.
- \`stage_gap_candidate\`는 같은 필지 후보라도 direct notice보다 앞 단계면 보류를 유지한다.
- 공식 원문 단계와 current business 식별자를 섞지 않는다.
`;
}

async function main() {
  const packet = await readJson(EDGE_PACKET_INPUT, { rows: [] });
  const findingRows = await readJson(FINDINGS_INPUT, []);
  const apiProbe = await readJson(API_PROBE_INPUT, { rows: [] });
  const rows = buildRows(packet.rows || [], findingRows, apiProbe.rows || []);
  const issues = validateFindings(findingRows, packet.rows || []);
  const summary = summarize(rows, findingRows, issues);
  const examples = rows.map(exampleForRow);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: summary.generated_at, summary, rows, issues, exampleRows: examples }, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, `${markdown(summary, rows, issues)}\n`, "utf8");
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(examples, null, 2)}\n`, "utf8");
  await writeFile(OUT_README, `${readme(summary, examples)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        project_count: summary.project_count,
        finding_count: summary.finding_count,
        ready_to_promote_count: summary.ready_to_promote_count,
        output: "analysis/representative-lot-fallback-finding-board.{md,csv,json}",
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
