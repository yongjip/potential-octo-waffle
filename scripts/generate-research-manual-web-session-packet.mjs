#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-manual-web-session-packet.md");
const OUT_CSV = path.join(OUT_DIR, "research-manual-web-session-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "research-manual-web-session-packet.json");

const INPUTS = {
  researchNowActionBoard: "analysis/research-now-action-board.json",
  focusWeeklyCockpit: "analysis/focus-project-weekly-monitoring-cockpit.json",
  expansionWeeklyCockpit: "analysis/expansion-zone-weekly-monitoring-cockpit.json",
  highBlockingNextCheck: "analysis/high-blocking-next-check-session-packet.json",
  fallbackEdgePacket: "analysis/representative-lot-fallback-edge-session-packet.json",
  fallbackFindingBoard: "analysis/representative-lot-fallback-finding-board.json",
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

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function webLink(label, url) {
  return `[${label}](${url})`;
}

function splitSemi(text) {
  return String(text || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function inferUrlLabel(url) {
  if (url.includes("cleanup.seoul.go.kr")) return "정비사업 정보몽땅";
  if (url.includes("urban.seoul.go.kr")) return "서울도시공간포털";
  if (url.includes("songpa.eminwon.seoul.kr")) return "송파구 새올전자민원창구";
  if (url.includes("open.go.kr")) return "대한민국정보공개포털";
  if (url.includes("gangdong.go.kr")) return "강동구";
  if (url.includes("junggu.seoul.kr")) return "중구";
  return url;
}

function linkifyUrlToken(token) {
  const labelled = /^([^:]+):\s*(https?:\/\/\S+)$/.exec(token);
  if (labelled) return webLink(labelled[1].trim(), labelled[2].trim());
  const plain = /^(https?:\/\/\S+)$/.exec(token);
  if (plain) return webLink(inferUrlLabel(plain[1].trim()), plain[1].trim());
  return token;
}

function renderUrlList(text) {
  const items = splitSemi(text);
  if (!items.length) return "- 없음";
  return items.map((item) => `- ${linkifyUrlToken(item)}`).join("\n");
}

function renderFileList(text, limit = 4) {
  const items = splitSemi(text).slice(0, limit);
  if (!items.length) return "- 없음";
  return items.map((item) => `- ${item.startsWith("analysis/") || item.startsWith("project-notes/") || item.startsWith("data/") ? fileLink(item) : item}`).join("\n");
}

function buildReadyRows(focusWeekly, expansionWeekly) {
  const focusRows = (focusWeekly.rows || [])
    .filter((row) => String(row.external_wait_status || "none") === "none")
    .map((row) => ({
      section: "ready_now",
      category: "핵심 사업",
      priority_score: Number(row.weekly_priority_score || 0),
      target: `${row.rank}. ${row.project_name}`,
      area_or_lane: `${row.life_area} / ${row.lane}`,
      status: `${row.stage}; ${row.baseline_status}`,
      open_file: "analysis/focus-project-latest-check-guide.md",
      first_action: row.first_check_action,
      official_urls: row.first_official_urls,
      change_signals: row.weekly_change_signals,
      output_route: row.output_route,
      first_outputs_to_read: row.first_outputs_to_read,
      helper_or_next: "analysis/focus-project-weekly-monitoring-cockpit.md -> analysis/focus-project-latest-check-guide.md",
    }));

  const expansionRows = (expansionWeekly.rows || []).map((row) => ({
    section: "ready_now",
    category: "확장 관심권",
    priority_score: Number(row.weekly_priority_score || 0),
    target: row.zone_name,
    area_or_lane: `${row.core_reference} / ${row.lane}`,
    status: `${row.current_state}; ${row.next_check_status}; 기준 ${row.next_check_at}`,
    open_file: "analysis/expansion-zone-latest-check-guide.md",
    first_action: row.first_check_action,
    official_urls: row.first_sources,
    change_signals: `${row.open_gap}; ${row.weekly_note}`,
    output_route: row.output_route,
    first_outputs_to_read: row.first_outputs_to_read,
    helper_or_next: "analysis/expansion-zone-weekly-monitoring-cockpit.md -> analysis/expansion-zone-latest-check-guide.md",
  }));

  return [...focusRows, ...expansionRows].sort(
    (a, b) => Number(b.priority_score || 0) - Number(a.priority_score || 0) || a.target.localeCompare(b.target, "ko"),
  );
}

function buildScheduledRows(nextCheckPacket) {
  const batchCommand = nextCheckPacket.summary?.batch_touch_command || "";
  return (nextCheckPacket.rows || []).map((row) => ({
    section: "wait_until_date",
    category: "외부 회신",
    priority_score: Number(row.priority_score || 0),
    target: `${row.rank}. ${row.project_name}`,
    area_or_lane: `${row.district} / ${row.current_stage}`,
    status: `${row.response_status}; 다음 점검 ${row.next_check_date}`,
    open_file: "analysis/high-blocking-next-check-session-packet.md",
    first_action: row.next_check_note,
    official_urls: `${row.filing_channel}: ${row.filing_url}`,
    change_signals: row.remaining_gap,
    output_route: batchCommand
      ? `${batchCommand} -> 필요 시 ${row.touch_followup_command} -> ${row.workflow_dry_run}`
      : `${row.touch_followup_command} -> ${row.workflow_dry_run}`,
    first_outputs_to_read: "analysis/high-blocking-next-check-session-packet.md; analysis/high-blocking-filing-tracker.md; analysis/high-blocking-response-followup-cockpit.md",
    helper_or_next: row.response_capture_command,
    filing_receipt_no: row.filing_receipt_no,
    next_check_date: row.next_check_date,
  }));
}

function buildFallbackRows(fallbackEdgePacket, fallbackFindingBoard) {
  const pendingRanks = new Set(
    (fallbackFindingBoard.rows || [])
      .filter((row) => row.board_status !== "applied")
      .map((row) => String(row.rank || "")),
  );
  return (fallbackEdgePacket.rows || [])
    .filter((row) => pendingRanks.has(String(row.target || "").match(/^(\d+)\./)?.[1] || ""))
    .map((row) => ({
    section: "ready_now",
    category: row.category,
    priority_score: Number(row.priority_score || 0),
    target: row.target,
    area_or_lane: row.area_or_lane,
    status: row.status,
    open_file: row.open_file,
    first_action: row.first_action,
    official_urls: row.official_urls,
    change_signals: row.change_signals,
    output_route: row.output_route,
    first_outputs_to_read: row.first_outputs_to_read,
    helper_or_next: row.helper_or_next,
    }));
}

function summarize(researchNowActionBoard, readyRows, scheduledRows) {
  const nextExternal = unique(scheduledRows.map((row) => row.next_check_date))[0] || "";
  return {
    generated_at: `${kstDate()} KST`,
    ready_now_count: readyRows.length,
    ready_focus_count: readyRows.filter((row) => row.category === "핵심 사업").length,
    ready_expansion_count: readyRows.filter((row) => row.category === "확장 관심권").length,
    ready_fallback_count: readyRows.filter((row) => row.category === "presentSn 클로저").length,
    wait_until_date_count: scheduledRows.length,
    next_external_check_date: nextExternal,
    action_board_manual_web_ready_count: researchNowActionBoard.summary?.manual_web_ready_count ?? "",
    action_board_wait_until_date_count: researchNowActionBoard.summary?.wait_until_date_count ?? "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, readyRows, scheduledRows) {
  return `# 리서치 수동 웹 세션 패킷

작성 기준: ${summary.generated_at}

이 문서는 지금 당장 브라우저에서 열어볼 것과 날짜가 도래한 뒤 다시 열 포털 점검을 한 장으로 묶는다. 핵심 사업 3건, 확장 관심권 2권역, 대표지번 fallback ${summary.ready_fallback_count > 0 ? `${summary.ready_fallback_count}건` : "클로저 완료 상태"}, 외부 회신 3건을 따로 찾지 않고 바로 세션을 시작하는 용도다.

## 세션 분기

- 오늘 바로 열 수 있는 수동 웹 루프: ${summary.ready_now_count}건
- 핵심 사업 즉시 확인: ${summary.ready_focus_count}건
- 확장 관심권 즉시 확인: ${summary.ready_expansion_count}건
- presentSn 클로저 즉시 확인: ${summary.ready_fallback_count}건
- 날짜 대기 외부 회신: ${summary.wait_until_date_count}건
- 다음 외부 회신 점검일: ${summary.next_external_check_date || "미정"}

## 먼저 열 파일

1. ${fileLink("analysis/research-now-action-board.md")}: 오늘 바로 할 일과 날짜 대기선을 먼저 분리
2. ${fileLink("analysis/focus-project-latest-check-guide.md")}: 핵심 사업 직접 URL과 변화 판정 기준
3. ${fileLink("analysis/official-web-query-registry.md")}: 포털별 검색어, 기록 필드, 판정 gate를 한 행으로 보는 레지스트리
4. ${fileLink("analysis/expansion-zone-latest-check-guide.md")}: 강동권 latest stage와 약수권 direct hit 루프
5. ${fileLink("analysis/representative-lot-fallback-api-probe.md")}: fallback 6건의 API strong candidate/hold를 먼저 보는 보드
6. ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")}: Edge에서 fallback 6건의 presentSn를 직접 확인하는 순서
7. ${fileLink("analysis/representative-lot-fallback-finding-board.md")}: fallback 6건의 확인 결과를 intake로 남긴 뒤 승격/보류 상태를 보는 보드
8. ${fileLink("analysis/high-blocking-next-check-session-packet.md")}: 외부 회신 점검일에 그대로 쓰는 조회 URL과 helper
9. ${fileLink("analysis/current-research-operating-guide.md")}: 현재 전체 운영 상태와 반영 순서

## 지금 바로 열 수 있는 수동 웹 루프

${mdTable(readyRows, [
    { key: "category", label: "구분" },
    { key: "target", label: "대상" },
    { key: "area_or_lane", label: "생활권/레인" },
    { key: "status", label: "현재 상태" },
    { key: "first_action", label: "첫 확인" },
    { key: "open_file", label: "먼저 열 파일" },
  ])}

${readyRows
    .map(
      (row, index) => `### 즉시 확인 ${index + 1}. ${row.target}

- 구분: ${row.category}
- 상태: ${row.status}
- 먼저 열 파일: ${fileLink(row.open_file)}
- 공식 URL
${renderUrlList(row.official_urls)}
- 이번 확인
  ${row.first_action}
- 변화로 인정할 신호
  ${row.change_signals}
- 반영 경로
  ${row.output_route}
- 같이 열 산출물
${renderFileList(row.first_outputs_to_read)}
- 결과 기록 helper
  ${row.category === "presentSn 클로저"
    ? `${String(row.status || "").includes("same_stage_candidate") ? "confirmed_current_business면 " : ""}node scripts/record-representative-lot-fallback-finding.mjs --rank=${row.target.match(/^(\d+)\./)?.[1] || "NN"} --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied${String(row.status || "").includes("same_stage_candidate") ? " -> auto-mark가 닫히지 않으면 node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=" + (row.target.match(/^(\d+)\./)?.[1] || "NN") + " --checked-at=YYYY-MM-DD --write --refresh" : ""}`
    : "필요 시 관련 intake/helper 사용"}
`,
    )
    .join("\n")}

## 날짜 도래 후 다시 열 포털 점검

${mdTable(scheduledRows, [
    { key: "target", label: "대상" },
    { key: "filing_receipt_no", label: "접수번호" },
    { key: "next_check_date", label: "다음 점검일" },
    { key: "first_action", label: "이번 확인 포인트" },
    { key: "open_file", label: "먼저 열 파일" },
  ])}

${scheduledRows
    .map(
      (row, index) => `### 대기 점검 ${index + 1}. ${row.target}

- 상태: ${row.status}
- 조회 URL
${renderUrlList(row.official_urls)}
- 이번 점검
  ${row.first_action}
- 남은 공백
  ${row.change_signals}
- 회신 없을 때 반영
  ${row.output_route}
- 회신 도착 시 helper
  ${row.helper_or_next}
- 같이 열 산출물
${renderFileList(row.first_outputs_to_read)}
`,
    )
    .join("\n")}

## 운영 원칙

- 공식 원문, 고시번호, 고시일, 원문 URL, 첨부명, 기준일 없는 값은 확정값으로 올리지 않는다.
- 강동권은 값 confirmed와 최신 단계 판정을 분리하고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로 유지한다.
- 잠실우성4차, 광장동 삼성1차, 자양번영로3나길은 ${summary.next_external_check_date || "다음 점검일"} 전에는 새 회신이 없으면 추가 제출보다 상태 추적이 우선이다.
- 수동 웹 세션 후에는 관련 intake나 보드를 먼저 갱신하고 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
`;
}

async function main() {
  const [researchNowActionBoard, focusWeeklyCockpit, expansionWeeklyCockpit, highBlockingNextCheck, fallbackEdgePacket, fallbackFindingBoard] = await Promise.all([
    readJson(INPUTS.researchNowActionBoard),
    readJson(INPUTS.focusWeeklyCockpit),
    readJson(INPUTS.expansionWeeklyCockpit),
    readJson(INPUTS.highBlockingNextCheck),
    readJson(INPUTS.fallbackEdgePacket),
    readJson(INPUTS.fallbackFindingBoard),
  ]);

  const readyRows = [
    ...buildFallbackRows(fallbackEdgePacket, fallbackFindingBoard),
    ...buildReadyRows(focusWeeklyCockpit, expansionWeeklyCockpit),
  ].sort((a, b) => Number(b.priority_score || 0) - Number(a.priority_score || 0) || a.target.localeCompare(b.target, "ko"));
  const scheduledRows = buildScheduledRows(highBlockingNextCheck);
  const summary = summarize(researchNowActionBoard, readyRows, scheduledRows);
  const payload = { summary, ready_now_rows: readyRows, scheduled_rows: scheduledRows };
  const csvRows = [...readyRows, ...scheduledRows];

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_MD, `${markdown(summary, readyRows, scheduledRows)}\n`);

  console.log(
    JSON.stringify(
      {
        ready_now_count: summary.ready_now_count,
        wait_until_date_count: summary.wait_until_date_count,
        next_external_check_date: summary.next_external_check_date,
        output: "analysis/research-manual-web-session-packet.{md,csv,json}",
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
