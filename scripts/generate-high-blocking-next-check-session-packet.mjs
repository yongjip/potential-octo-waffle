#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-next-check-session-packet.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-next-check-session-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-next-check-session-packet.json");

const INPUTS = {
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  filingChecklist: "analysis/high-blocking-filing-checklist.json",
  responseGuide: "analysis/high-blocking-response-intake-guide.json",
  followupCockpit: "analysis/high-blocking-response-followup-cockpit.json",
  workflowRun: "analysis/high-blocking-response-workflow-run.json",
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

const GENERATED_AT = `${kstDate()} KST`;

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

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

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank), row]));
}

function parseDateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function formatDateFromParts(parts) {
  const year = String(parts.year).padStart(4, "0");
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateText, days) {
  const parts = parseDateParts(dateText);
  if (!parts) return "";
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return formatDateFromParts({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

function earlierDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

function recordCommand(row) {
  if (String(row.rank) === "9") {
    return `node scripts/record-high-blocking-response.mjs --rank=${row.rank} --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='송파구 담당부서' --attachment-name='자료명' --evidence=https://... --response-note='회신 요약' --write`;
  }
  return `node scripts/record-high-blocking-response.mjs --rank=${row.rank} --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write`;
}

function suggestedNextCheckDate(row, anchorDate) {
  if (!anchorDate) return row.next_check_date || "";
  const baseline = addDays(anchorDate, 3);
  const dueDate = String(row.expected_response_by || "");
  if (dueDate && dueDate > anchorDate) {
    return earlierDate(baseline, dueDate);
  }
  return baseline;
}

function followupCheckCommand(row, anchorDate) {
  const checkedAt = anchorDate || "YYYY-MM-DD";
  const nextDate = suggestedNextCheckDate(row, anchorDate) || row.next_check_date || "YYYY-MM-DD";
  const note = row.next_check_note || "다음 확인 포인트";
  return `node scripts/record-high-blocking-followup-check.mjs --rank=${row.rank} --checked-at=${checkedAt} --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=${nextDate} --next-check-note='${note}' --write`;
}

function buildRows({ filingRows, checklistRows, guideRows, followupRows }) {
  const checklistByRank = byRank(checklistRows);
  const guideByRank = byRank(guideRows);
  const followupByRank = byRank(followupRows);
  const anchorDate = sessionAnchorDate(filingRows || []);
  return (filingRows || [])
    .map((row) => {
      const checklist = checklistByRank.get(String(row.rank)) || {};
      const guide = guideByRank.get(String(row.rank)) || {};
      const followup = followupByRank.get(String(row.rank)) || {};
      const suggestedNext = suggestedNextCheckDate(row, anchorDate) || row.next_check_date || "";
      const followupCommand = followupCheckCommand(row, anchorDate);
      return {
        rank: row.rank,
        project_name: row.project_name,
        district: row.district,
        current_stage: row.current_stage,
        filing_channel: row.filing_channel,
        filing_receipt_no: row.filing_receipt_no,
        filing_url: row.filing_url,
        next_check_date: row.next_check_date,
        expected_response_by: row.expected_response_by || "",
        next_check_note: row.next_check_note,
        remaining_gap: row.remaining_gap,
        response_status: row.response_status,
        session_anchor_date: anchorDate,
        suggested_next_check_date: suggestedNext,
        touch_followup_command: followupCommand,
        response_capture_command: recordCommand(row),
        workflow_dry_run: checklist.dry_run_command || "node scripts/process-high-blocking-response-workflow.mjs",
        workflow_write: checklist.write_command || "node scripts/process-high-blocking-response-workflow.mjs --write",
        final_regeneration: checklist.final_regeneration_command || "node scripts/regenerate-research-artifacts.mjs",
        response_record_fields: checklist.response_record_fields || "",
        promotion_rule: checklist.promotion_rule || row.promotion_rule || "",
        response_status_rule: guide.response_status_to_use || "",
        priority_score: Number(followup.followup_priority_score || 0),
      };
    })
    .sort((a, b) => Number(b.priority_score || 0) - Number(a.priority_score || 0) || Number(a.rank) - Number(b.rank));
}

function sessionAnchorDate(rows) {
  const values = rows.map((row) => row.next_check_date).filter(Boolean).sort();
  return values[0] || "";
}

function summary(rows, workflowRun) {
  const anchorDate = sessionAnchorDate(rows);
  return {
    generated_at: GENERATED_AT,
    session_anchor_date: anchorDate,
    packet_title: anchorDate ? `${anchorDate} 외부 회신 점검 세션` : "외부 회신 점검 세션",
    batch_touch_command: anchorDate
      ? `node scripts/touch-high-blocking-followup.mjs --session-anchor-date=${anchorDate} --checked-at=${anchorDate} --write --refresh`
      : "",
    project_count: rows.length,
    waiting_response_count: rows.filter((row) => row.response_status === "no_response").length,
    response_due_known_count: rows.filter((row) => String(row.expected_response_by || "").trim()).length,
    workflow_status: workflowRun.status || "",
    workflow_appendable: Number(workflowRun.appendable_decisions || 0),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summaryRow, rows) {
  return `# High Blocking 다음 점검 세션 패킷

작성 기준: ${summaryRow.generated_at}
세션 기준일: ${summaryRow.session_anchor_date || "미정"}

이 문서는 외부 회신 대기 3건을 다음 점검일에 실제로 다시 열 때 쓰는 운영 패킷이다. 조회 URL, 접수번호, no response 기록 helper, 회신 반영 helper, workflow 순서를 한 번에 묶는다.

## 세션 요약

| 항목 | 값 |
| --- | ---: |
| 세션 기준일 | ${summaryRow.session_anchor_date || "미정"} |
| 점검 대상 | ${summaryRow.project_count} |
| 현재 no_response | ${summaryRow.waiting_response_count} |
| 처리기한 명시 행 | ${summaryRow.response_due_known_count} |
| workflow 상태 | ${summaryRow.workflow_status || "미실행"} |
| workflow appendable | ${summaryRow.workflow_appendable} |

## 세션 단축 명령

- 전체 no_response 일괄 기록:
  \`${summaryRow.batch_touch_command || "node scripts/touch-high-blocking-followup.mjs --session-anchor-date=YYYY-MM-DD --checked-at=YYYY-MM-DD --write --refresh"}\`
- 개별 행을 더 자세히 남기려면 아래 \`record-high-blocking-followup-check\` 명령을 그대로 사용한다.

## 먼저 열 파일

1. ${fileLink("analysis/high-blocking-response-followup-cockpit.md")}: 우선순위와 helper 전체 보기
2. ${fileLink("analysis/high-blocking-filing-tracker.md")}: 접수번호, 다음 점검일, 남은 공백 확인
3. ${fileLink("analysis/high-blocking-followup-history.md")}: 이전 점검일에 무엇을 확인했는지 이력 확인
4. ${fileLink("data/review/high-blocking-followup-check-log.README.md")}: 점검 로그 helper와 check_status 규칙
5. ${fileLink("analysis/high-blocking-response-intake-guide.md")}: response_status 규칙과 필수 필드 확인
6. ${fileLink("data/review/high-blocking-source-response-intake.README.md")}: intake 원본의 상태값·입력 절차 확인
7. ${fileLink("data/review/high-blocking-source-response-intake.json")}: 실제 입력 파일

## 세션 순서

1. 아래 3개 조회 URL을 열고 접수상태, 보완요구, 답변 게시 여부를 확인한다.
2. 회신이 없으면 먼저 \`touch-high-blocking-followup\` batch helper로 공통 \`no_change\`를 한 번에 처리하고, 개별 메모가 필요하면 \`record-high-blocking-followup-check\` helper로 덮어쓴다.
3. 회신이 있으면 \`record-high-blocking-response\` helper로 확인된 식별자와 증거만 기록한다.
4. 입력 후 항상 \`process-high-blocking-response-workflow\` dry-run을 먼저 본다.
5. \`appendable\`이 1건 이상이고 draft 내용이 맞을 때만 \`--write\`와 전체 재생성을 실행한다.

## 점검 대상

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "filing_receipt_no", label: "접수번호" },
    { key: "next_check_date", label: "다음 점검일" },
    { key: "expected_response_by", label: "처리기한" },
    { key: "next_check_note", label: "이번 확인 포인트" },
    { key: "remaining_gap", label: "남은 공백" },
  ])}

## 회신 없음일 때

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "filing_url", label: "조회 URL" },
    { key: "touch_followup_command", label: "상태 재확인 기록 helper" },
  ])}

보완요구나 처리기한 변경이 보이면 \`record-high-blocking-followup-check\`에 \`--check-status=supplement_requested|deadline_changed\`, \`--expected-response-by\`, \`--filing-note\`를 같이 넣는다. 기존 메모를 살리고 덧붙이려면 \`--append-filing-note\`를 사용한다.

## 회신 도착 시

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "response_status_rule", label: "status 사용 규칙" },
    { key: "response_capture_command", label: "회신 기록 helper" },
    { key: "response_record_fields", label: "기록 필드" },
  ])}

## Workflow

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "workflow_dry_run", label: "dry-run" },
    { key: "workflow_write", label: "write" },
    { key: "final_regeneration", label: "최종 재생성" },
    { key: "promotion_rule", label: "승격 gate" },
  ])}

## 운영 메모

- 고시번호, 고시일, 원문 URL, 첨부명, 기준일 없는 값은 확정값으로 올리지 않는다.
- 잠실우성4차는 공사비·총사업비·기준일 또는 자료명 쪽이 핵심이고, 광진구 2건은 조합설립인가 고시 식별자와 원문 URL이 핵심이다.
- 이 패킷은 점검 세션용이다. 회신 근거 자체는 ${fileLink("data/review/high-blocking-source-response-intake.json")}와 ${fileLink("analysis/high-blocking-response-decision-drafts.md")}에서 최종 검증한다.
`;
}

async function main() {
  const [filingTracker, filingChecklist, responseGuide, followupCockpit, workflowRun] = await Promise.all([
    readJson(INPUTS.filingTracker),
    readJson(INPUTS.filingChecklist),
    readJson(INPUTS.responseGuide),
    readJson(INPUTS.followupCockpit),
    readJson(INPUTS.workflowRun),
  ]);

  const rows = buildRows({
    filingRows: filingTracker.rows || [],
    checklistRows: filingChecklist.rows || [],
    guideRows: responseGuide.rows || [],
    followupRows: followupCockpit.rows || [],
  });
  const summaryRow = summary(rows, workflowRun);
  const payload = { summary: summaryRow, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(summaryRow, rows)}\n`);

  console.log(
    JSON.stringify(
      {
        packet_title: summaryRow.packet_title,
        session_anchor_date: summaryRow.session_anchor_date,
        projects: rows.length,
        output: "analysis/high-blocking-next-check-session-packet.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
