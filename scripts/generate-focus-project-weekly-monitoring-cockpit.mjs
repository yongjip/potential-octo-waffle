#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-project-weekly-monitoring-cockpit.md");
const OUT_CSV = path.join(OUT_DIR, "focus-project-weekly-monitoring-cockpit.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-project-weekly-monitoring-cockpit.json");

const INPUTS = {
  focusBoard: "analysis/focus-project-monitoring-board.json",
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  runbooks: "analysis/official-update-runbook-checklist.json",
  snapshot: "analysis/current-research-snapshot.json",
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
const PROJECT_ALIASES = {
  "5": ["장미1,2,3차"],
  "9": ["잠실우성4차"],
  "10": ["압구정3"],
  "25": ["한양연립"],
};

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

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("①", "1")
    .replaceAll("②", "2")
    .replaceAll("③", "3")
    .replaceAll("④", "4")
    .replaceAll("⑤", "5")
    .replace(/\s+/g, "")
    .replace(/[()·,./\-_[\]{}]/g, "")
    .replace(/주택재건축정비사업조합|주택재건축정비사업|재건축정비사업조합|재건축정비사업|가로주택정비사업|조합설립인가|사업시행인가|조합/g, "");
}

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank), row]));
}

function weeklyLane(row, filing) {
  if (filing?.filing_status === "filed_waiting_response") return "외부 회신 대기";
  if (/원문 검증/.test(row.monitoring_track || "")) return "원문/고시 확인";
  if (/비용\/기반시설/.test(row.monitoring_track || "")) return "비용/기반시설 확인";
  return "주간 공식 업데이트 확인";
}

function laneBoost(lane) {
  if (lane === "외부 회신 대기") return 80;
  if (lane === "원문/고시 확인") return 35;
  if (lane === "비용/기반시설 확인") return 28;
  return 20;
}

function baselineLine(snapshotProject) {
  if (!snapshotProject) return "";
  return compact([snapshotProject.stage, snapshotProject.current_read, snapshotProject.main_gap], 3);
}

function matchSnapshotProject(projectRow, snapshotProjects) {
  const candidates = [projectRow.project_name, ...(PROJECT_ALIASES[String(projectRow.rank)] || [])].map((item) => normalize(item)).filter(Boolean);
  return (snapshotProjects || []).find((row) => {
    const value = normalize(row.name);
    return value && candidates.some((candidate) => value.includes(candidate) || candidate.includes(value));
  });
}

function firstCheckAction(row, filing) {
  if (filing?.filing_status === "filed_waiting_response") {
    return `접수번호 ${filing.filing_receipt_no || "미기록"} 유지, 회신 도착 여부 확인 후 intake 입력`;
  }
  if (/원문 검증/.test(row.monitoring_track || "")) {
    return "추진경과와 자치구 고시공고를 먼저 비교해 단계 선행 여부 확인";
  }
  if (/비용\/기반시설/.test(row.monitoring_track || "")) {
    return "추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인";
  }
  return "추진경과와 공식 사업별 페이지의 단계일자/첨부 변화 확인";
}

function outputRoute(row, filing) {
  if (filing?.filing_status === "filed_waiting_response") {
    return "회신 없음: high-blocking-filing-tracker -> 회신 도착: response-intake -> decision draft -> 전체 재생성";
  }
  return "변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist";
}

function buildRows({ focusRows, filingRows, weeklyRunbook, snapshotProjects }) {
  const filingByRank = byRank(filingRows);

  return focusRows
    .map((row) => {
      const filing = filingByRank.get(String(row.rank)) || null;
      const snapshotProject = matchSnapshotProject(row, snapshotProjects);
      const lane = weeklyLane(row, filing);
      const weeklyPriorityScore = Math.round((Number(row.monitoring_score || 0) + laneBoost(lane)) * 10) / 10;
      return {
        weekly_priority_score: weeklyPriorityScore,
        lane,
        rank: row.rank,
        project_name: row.project_name,
        life_area: row.life_area,
        stage: row.stage,
        baseline_status: baselineLine(snapshotProject),
        external_wait_status: filing
          ? compact(
              [
                filing.filing_status,
                filing.wait_timing_status || "",
                filing.expected_response_by ? `due ${filing.expected_response_by}` : "",
                `receipt ${filing.filing_receipt_no || "미기록"}`,
              ],
              4,
            )
          : row.external_wait_status,
        first_check_action: firstCheckAction(row, filing),
        first_official_urls: row.first_official_urls,
        weekly_question: row.key_question,
        weekly_change_signals: row.change_signals,
        update_targets: row.update_targets,
        output_route: outputRoute(row, filing),
        first_outputs_to_read:
          filing?.filing_status === "filed_waiting_response"
            ? "analysis/high-blocking-filing-tracker.md; analysis/high-blocking-filing-checklist.md; data/review/high-blocking-source-response-intake.json"
            : weeklyRunbook?.first_outputs_to_read || "",
      };
    })
    .sort((a, b) => Number(b.weekly_priority_score || 0) - Number(a.weekly_priority_score || 0) || Number(a.rank) - Number(b.rank));
}

function summarize(rows, weeklyRunbook, weeklySteps, filingRows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    external_wait_focus_count: rows.filter((row) => row.lane === "외부 회신 대기").length,
    weekly_remote_step_count: weeklySteps.filter((row) => row.runbook_id === "weekly_primary_refresh" && row.phase === "remote_collection").length,
    weekly_local_step_count: weeklySteps.filter((row) => row.runbook_id === "weekly_primary_refresh" && row.phase !== "remote_collection").length,
    filed_waiting_response_count: (filingRows || []).filter((row) => row.filing_status === "filed_waiting_response").length,
    weekly_followup_command: weeklyRunbook?.followup_local_command || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows, weeklyRunbook, waitingRows) {
  return `# 핵심 4개 사업 주간 모니터링 콕핏

작성 기준: ${summary.generated_at}

이 문서는 주간 점검을 돌릴 때 핵심 4개 사업만 따로 떼어 보는 실행판이다. \`weekly_primary_refresh\`의 원격 수집 순서, 핵심 4개 사업의 확인 질문, 외부 회신 대기 사업의 접수 상태를 한 화면에 묶는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 핵심 사업 | ${summary.project_count} |
| 외부 회신 대기 focus 사업 | ${summary.external_wait_focus_count} |
| 주간 원격 단계 수 | ${summary.weekly_remote_step_count} |
| 접수 후 회신 대기 | ${summary.filed_waiting_response_count} |

## 이번 주 먼저 볼 순서

${mdTable(rows, [
    { key: "weekly_priority_score", label: "주간점수" },
    { key: "lane", label: "레인" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "stage", label: "단계" },
    { key: "external_wait_status", label: "외부대기" },
    { key: "first_check_action", label: "첫 확인" },
  ])}

## 사업별 체크 메모

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "baseline_status", label: "기준선" },
    { key: "weekly_question", label: "이번 주 질문" },
    { key: "weekly_change_signals", label: "볼 신호" },
    { key: "update_targets", label: "반영 파일" },
  ])}

## 외부 회신 대기 연동

${mdTable(waitingRows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "filing_status", label: "접수상태" },
    { key: "filing_receipt_no", label: "접수번호" },
    { key: "remaining_gap", label: "남은 공백" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 주간 실행 체인

| 항목 | 내용 |
| --- | --- |
| 원격 수집 체인 | ${weeklyRunbook?.command_sequence || ""} |
| 후속 로컬 재생성 | ${summary.weekly_followup_command || ""} |
| 먼저 읽을 산출물 | ${weeklyRunbook?.first_outputs_to_read || ""} |
| 판정 규칙 | ${weeklyRunbook?.decision_rule || ""} |
| 로그 기록 파일 | analysis/weekly-monitoring-execution-log.md -> analysis/weekly-monitoring-history.md -> analysis/weekly-monitoring-comparison-board.md |

## 운영 메모

- 외부 회신 대기 사업은 공개화면 재확인만으로 닫지 않는다. 회신 내용이 intake에 기록될 때만 승격한다.
- 변화가 확인되면 먼저 사업 메모를 수정하고, 그 다음 비교표와 감시표를 재생성한다.
- 현장 메모가 들어온 주에는 동일 사업의 주간 질문 아래에 \`fieldwork_related\` 메모를 같이 남긴다.
`;
}

async function main() {
  const focusBoard = await readJson(INPUTS.focusBoard);
  const filingTracker = await readJson(INPUTS.filingTracker);
  const runbooks = await readJson(INPUTS.runbooks);
  const snapshot = await readJson(INPUTS.snapshot);

  const weeklyRunbook = (runbooks.selectedRunbooks || []).find((row) => row.runbook_id === "weekly_primary_refresh") || {};
  const rows = buildRows({
    focusRows: focusBoard.rows || [],
    filingRows: filingTracker.rows || [],
    weeklyRunbook,
    snapshotProjects: snapshot.core_projects || [],
  });
  const summary = summarize(rows, weeklyRunbook, runbooks.checklistRows || [], filingTracker.rows || []);
  const payload = { summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows, weeklyRunbook, filingTracker.rows || []));

  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
