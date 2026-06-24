#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-now-action-board.md");
const OUT_CSV = path.join(OUT_DIR, "research-now-action-board.csv");
const OUT_JSON = path.join(OUT_DIR, "research-now-action-board.json");

const INPUTS = {
  currentGuide: "analysis/current-research-operating-guide.json",
  personalHome: "analysis/personal-research-home.json",
  sessionPlaybook: "analysis/research-session-playbook.json",
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  nextCheckPacket: "analysis/high-blocking-next-check-session-packet.json",
  focusWeekly: "analysis/focus-project-weekly-monitoring-cockpit.json",
  expansionWeekly: "analysis/expansion-zone-weekly-monitoring-cockpit.json",
  fallbackFindingBoard: "analysis/representative-lot-fallback-finding-board.json",
  fallbackEdgePacket: "analysis/representative-lot-fallback-edge-session-packet.json",
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

function byKey(rows, key) {
  return new Map((rows || []).map((row) => [String(row[key] || ""), row]));
}

function compact(items, limit = 4) {
  return [...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function classifyNetwork(value) {
  if (String(value || "").startsWith("N")) return "local";
  if (/manual/i.test(String(value || ""))) return "manual_web";
  return "remote";
}

function sessionRow(rows, id) {
  return (rows || []).find((row) => row.session_id === id) || {};
}

function fallbackStatusRank(row) {
  if (row.board_status === "ready_to_promote") return 7;
  if (row.board_status === "unreviewed" && row.candidate_relation === "same_stage_candidate") return 6;
  if (row.board_status === "candidate_review_needed") return 5;
  if (row.board_status === "retry_needed") return 4;
  if (row.board_status === "unreviewed") return 3;
  if (row.board_status === "hold_by_stage_gap") return 2;
  if (row.board_status === "hold_planning_layer") return 1;
  if (row.board_status === "candidate_rejected") return 0;
  if (row.board_status === "applied") return -1;
  return 0;
}

function fallbackDisplayPriority(row, packetRow) {
  if (row.board_status === "ready_to_promote") return 97;
  if (row.board_status === "unreviewed" && row.candidate_relation === "same_stage_candidate") {
    return Number(packetRow.priority_score || 0) >= 995 ? 94 : 93;
  }
  if (row.board_status === "candidate_review_needed") return 91;
  if (row.board_status === "retry_needed") return 89;
  if (row.board_status === "hold_by_stage_gap") return 86;
  if (row.board_status === "hold_planning_layer") return 85;
  if (row.board_status === "candidate_rejected") return 84;
  return 88;
}

function buildRows({ currentGuide, personalHome, sessionPlaybook, filingTracker, nextCheckPacket, focusWeekly, expansionWeekly, fallbackFindingBoard, fallbackEdgePacket }) {
  const guideLaneByName = byKey(currentGuide.actionLaneRows || [], "lane");
  const nextCheckByRank = byKey(nextCheckPacket.rows || [], "rank");
  const focusRows = focusWeekly.rows || [];
  const expansionRows = expansionWeekly.rows || [];
  const sessionRows = sessionPlaybook.rows || sessionPlaybook.sessionRows || [];
  const homeTodayRows = personalHome.todayRows || [];
  const fallbackRows = (fallbackFindingBoard.rows || []).filter((row) => row.board_status !== "applied");
  const fallbackSummary = fallbackFindingBoard.summary || {};
  const fallbackPacketByRank = byKey(
    (fallbackEdgePacket.rows || []).map((row) => ({
      ...row,
      rank: String(row.target || "").match(/^(\d+)\./)?.[1] || "",
    })),
    "rank",
  );

  const waitLane = guideLaneByName.get("외부 회신") || {};
  const expansionLane = guideLaneByName.get("확장 관심권") || {};
  const coreLane = guideLaneByName.get("핵심 생활권 비교") || {};
  const waitProjects = (filingTracker.rows || []).filter((row) => String(row.response_status || "") === "no_response");
  const focusLead = focusRows.find((row) => String(row.external_wait_status || "none") === "none") || focusRows[0] || {};
  const homeSourceLead = homeTodayRows.find((row) => /원문/.test(String(row.track || ""))) || homeTodayRows[0] || {};
  const expansionLead = expansionRows[0] || {};
  const fieldworkSession = sessionRow(sessionRows, "S-FIELDWORK");
  const triageSession = sessionRow(sessionRows, "S-15M-TRIAGE");
  const expansionSession = sessionRow(sessionRows, "S-EXPANSION-LATEST");
  const sourceSession = sessionRow(sessionRows, "S-SOURCE-DEEPDIVE");
  const filingSession = sessionRow(sessionRows, "S-P0-FILING");
  const fallbackSession = sessionRow(sessionRows, "S-FALLBACK-ID");
  const fallbackLead =
    [...fallbackRows].sort((left, right) => {
      const leftPacket = fallbackPacketByRank.get(String(left.rank || "")) || {};
      const rightPacket = fallbackPacketByRank.get(String(right.rank || "")) || {};
      const statusDelta = fallbackStatusRank(right) - fallbackStatusRank(left);
      if (statusDelta !== 0) return statusDelta;
      const packetDelta = Number(rightPacket.priority_score || 0) - Number(leftPacket.priority_score || 0);
      if (packetDelta !== 0) return packetDelta;
      return Number(left.rank || 9999) - Number(right.rank || 9999);
    })[0] || {};
  const fallbackLeadPacket = fallbackPacketByRank.get(String(fallbackLead.rank || "")) || {};

  const waitDetail = waitProjects
    .map((row) => {
      const packet = nextCheckByRank.get(String(row.rank)) || {};
      return `${row.rank}. ${row.project_name} -> ${packet.touch_followup_command || row.next_check_note}`;
    })
    .join(" / ");
  const waitBatchCommand = nextCheckPacket.summary?.batch_touch_command || "";

  const rows = [
    {
      priority: 100,
      availability: "wait_until_date",
      network_mode: "none",
      lane: "외부 회신",
      target: waitLane.targets || compact(waitProjects.map((row) => `${row.rank}. ${row.project_name}`), 6),
      status: waitLane.current_status || `no_response ${waitProjects.length}건`,
      do_now: waitLane.today_action || "다음 점검일까지 대기",
      first_file: waitLane.open_file || "analysis/high-blocking-next-check-session-packet.md",
      command_or_helper: filingSession.commands || "",
      proof_or_stop: `다음 점검일 ${filingTracker.summary?.next_external_check_date || currentGuide.summary?.next_external_check_date || ""} 전에는 새 회신이 없으면 상태 유지`,
      detail: compact([waitBatchCommand, waitDetail], 2),
    },
    {
      priority: 95,
      availability: "ready_now",
      network_mode: classifyNetwork(expansionSession.network_required),
      lane: "확장 관심권",
      target: expansionLane.targets || expansionLead.zone_name || "강동권",
      status: expansionLane.current_status || `${expansionLead.current_state || ""}; ${expansionLead.next_check_status || ""}`,
      do_now: expansionLane.today_action || expansionLead.first_check_action || "",
      first_file: expansionLane.open_file || "analysis/expansion-zone-weekly-monitoring-cockpit.md",
      command_or_helper: expansionSession.commands || "",
      proof_or_stop: expansionSession.stop_condition || "",
      detail: compact([expansionLead.first_outputs_to_read, expansionLead.output_route], 3),
    },
    ...(fallbackLead.rank
      ? [
          {
            priority: fallbackDisplayPriority(fallbackLead, fallbackLeadPacket),
            availability: "ready_now",
            network_mode: classifyNetwork(fallbackSession.network_required),
            lane: "대표지번 fallback 식별자",
            target: `${fallbackLead.rank}. ${fallbackLead.project_name}`,
            status: `${fallbackLead.board_status || "unreviewed"} / ${fallbackLead.candidate_relation || ""} / 미확인 ${fallbackSummary.unreviewed_count || 0}건`,
            do_now:
              fallbackLead.board_status === "ready_to_promote"
                ? "확인된 presentSn와 데이터 기준일이 비교표/사업노트에 반영됐는지 확인하고 applied로 승격"
                : fallbackLeadPacket.first_action || fallbackSession.objective || "",
            first_file: "analysis/representative-lot-fallback-edge-session-packet.md",
            command_or_helper: fallbackSession.commands || "",
            proof_or_stop: fallbackSession.stop_condition || "",
            detail: compact(
              [
                fallbackLeadPacket.official_urls,
                fallbackLead.accept_gate,
                fallbackLead.follow_up_action || fallbackLeadPacket.output_route,
              ],
              3,
            ),
          },
        ]
      : []),
    {
      priority: 90,
      availability: "ready_now",
      network_mode: "local",
      lane: "핵심 생활권 비교",
      target: coreLane.targets || `${focusLead.rank || ""}. ${focusLead.project_name || ""}`,
      status: coreLane.current_status || `${focusLead.life_area || ""}; ${focusLead.lane || ""}; ${focusLead.stage || ""}`,
      do_now: coreLane.today_action || focusLead.first_check_action || "",
      first_file: coreLane.open_file || "analysis/focus-project-weekly-monitoring-cockpit.md",
      command_or_helper: triageSession.commands || "",
      proof_or_stop: triageSession.stop_condition || "",
      detail: compact([focusLead.first_outputs_to_read, focusLead.output_route], 3),
    },
    {
      priority: 82,
      availability: "ready_now",
      network_mode: classifyNetwork(sourceSession.network_required),
      lane: "원문 딥다이브",
      target: `${homeSourceLead.rank || ""}. ${homeSourceLead.project_name || ""}`,
      status: `${homeSourceLead.focus_area || ""}; ${homeSourceLead.track || ""}; score ${homeSourceLead.score || ""}`.trim(),
      do_now: homeSourceLead.next_step || sourceSession.objective || "",
      first_file: homeSourceLead.open_file || sourceSession.output_to_update || "analysis/project-evidence-binder.md",
      command_or_helper: sourceSession.commands || "",
      proof_or_stop: sourceSession.stop_condition || "",
      detail: compact([homeSourceLead.first_source, sourceSession.first_files], 3),
    },
    {
      priority: 70,
      availability: "ready_now_optional",
      network_mode: classifyNetwork(fieldworkSession.network_required),
      lane: "현장 답사 준비",
      target: fieldworkSession.output_to_update || "data/review/fieldwork-observations.json",
      status: "현장 나갈 때만 실행",
      do_now: fieldworkSession.objective || "",
      first_file: "analysis/fieldwork-route-planner.md",
      command_or_helper: fieldworkSession.commands || "",
      proof_or_stop: fieldworkSession.stop_condition || "",
      detail: fieldworkSession.first_files || "",
    },
  ];

  return rows;
}

function summarize(rows, filingTracker) {
  const waiting = rows.filter((row) => row.availability === "wait_until_date").length;
  const readyNow = rows.filter((row) => row.availability === "ready_now").length;
  const optional = rows.filter((row) => row.availability === "ready_now_optional").length;
  const local = rows.filter((row) => row.network_mode === "local").length;
  const manual = rows.filter((row) => row.network_mode === "manual_web").length;
  return {
    generated_at: `${kstDate()} KST`,
    row_count: rows.length,
    ready_now_count: readyNow,
    ready_now_optional_count: optional,
    wait_until_date_count: waiting,
    local_ready_count: local,
    manual_web_ready_count: manual,
    next_external_check_date: currentExternalCheckDate(filingTracker),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function currentExternalCheckDate(filingTracker) {
  const rows = filingTracker.rows || [];
  const dates = rows.map((row) => String(row.next_check_date || "").trim()).filter(Boolean).sort();
  return dates[0] || "";
}

function markdown(summary, rows) {
  const nowRows = rows.filter((row) => row.availability !== "wait_until_date");
  const waitRows = rows.filter((row) => row.availability === "wait_until_date");
  const actionableLanes = nowRows
    .filter((row) => row.availability === "ready_now")
    .map((row) => `\`${row.lane}\``)
    .join(", ");
  return `# Research Now Action Board

작성 기준: ${summary.generated_at}

이 문서는 지금 바로 진행할 수 있는 조사와 날짜까지 기다려야 하는 조사를 분리한 실행 보드다. 핵심은 대기선을 붙잡고 있지 말고, 로컬 비교·확장 재확인·원문 딥다이브 중 하나를 바로 고르는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 전체 레인 | ${summary.row_count} |
| 지금 바로 가능 | ${summary.ready_now_count} |
| 선택 실행 가능 | ${summary.ready_now_optional_count} |
| 날짜 대기 | ${summary.wait_until_date_count} |
| 로컬 우선 | ${summary.local_ready_count} |
| 수동 웹 확인 | ${summary.manual_web_ready_count} |
| 외부 회신 다음 점검일 | ${summary.next_external_check_date || "미정"} |

## 지금 바로 할 일

${mdTable(nowRows, [
    { key: "priority", label: "우선" },
    { key: "lane", label: "레인" },
    { key: "network_mode", label: "모드" },
    { key: "target", label: "대상" },
    { key: "status", label: "현재 상태" },
    { key: "do_now", label: "지금 할 일" },
    { key: "first_file", label: "먼저 열 파일" },
    { key: "proof_or_stop", label: "멈출 조건" },
  ])}

## 기다려야 하는 일

${mdTable(waitRows, [
    { key: "priority", label: "우선" },
    { key: "lane", label: "레인" },
    { key: "target", label: "대상" },
    { key: "status", label: "현재 상태" },
    { key: "do_now", label: "오늘 처리" },
    { key: "first_file", label: "먼저 열 파일" },
    { key: "detail", label: "다음 확인 힌트" },
  ])}

## 운영 메모

- 외부 회신 3건은 이미 접수 상태이므로 ${summary.next_external_check_date || "다음 점검일"} 전에는 새 회신이 없으면 상태만 유지한다.
- 오늘 조사 시간을 쓰려면 ${actionableLanes || "\`확장 관심권\`, \`핵심 생활권 비교\`, \`원문 딥다이브\`"} 중 하나만 먼저 고른다.
- 새 공식 업데이트를 발견했을 때만 weekly/manual 웹 세션을 확장하고, 값 확정은 여전히 원문/회신 gate를 통과할 때만 허용한다.
`;
}

async function main() {
  const loaded = Object.fromEntries(
    await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])),
  );

  const rows = buildRows(loaded);
  const summary = summarize(rows, loaded.filingTracker);
  const payload = { summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);

  console.log(
    JSON.stringify(
      {
        ready_now: summary.ready_now_count,
        wait_until_date: summary.wait_until_date_count,
        output: "analysis/research-now-action-board.{md,csv,json}",
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
