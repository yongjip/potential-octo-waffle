#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-verification-sprint-plan.md");
const OUT_CSV = path.join(OUT_DIR, "source-verification-sprint-plan.csv");
const OUT_JSON = path.join(OUT_DIR, "source-verification-sprint-plan.json");

const QUEUE_INPUT = "analysis/source-value-verification-queue.json";
const LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";
const CLOSURE_INPUT = "analysis/source-link-closure-board.json";
const STATUS_INPUT = "analysis/research-status-dashboard.json";

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const WORKSTREAMS = {
  crosscheck_cost_infrastructure: {
    sprint_id: "S1",
    sprint_name: "비용·기반시설 원문 대조",
    why: "공공기여, 기반시설, HUG/이주비, 추정분담금 신호는 장기 가능성과 부담 리스크를 동시에 바꾼다.",
    done: "공개항목 제목만 남기지 않고 원문/첨부/고시 결정조서 근거를 사업별 메모에 confirmed, pending, conflict로 표시",
  },
  connect_recordcode_original_notice: {
    sprint_id: "S2",
    sprint_name: "recordCode·원문 URL 닫기",
    why: "값 후보는 붙었지만 본고시 URL 또는 recordCode가 없으면 공식 근거 체계가 완전히 닫히지 않는다.",
    done: "source-link-closure-board의 closure_ready가 Y이거나 원문 URL/recordCode 미확보 사유가 명확히 기록됨",
  },
  verify_ocr_numbers: {
    sprint_id: "S3",
    sprint_name: "OCR·이미지 수치 검증",
    why: "OCR 텍스트는 숫자·단위 오류 가능성이 있어 확정 비교값으로 쓰기 전 이미지/본문 대조가 필요하다.",
    done: "OCR 관련 장부 상태가 confirmed_from_ocr_image, ocr_source_value_update_required, ocr_partial_confirmation_pending 중 하나로 분리됨",
  },
  resolve_stage_value_conflict: {
    sprint_id: "S4",
    sprint_name: "사업시행·관리처분 시점 충돌 해소",
    why: "관리처분 단계 사업은 고시 시점과 최신 사업개요/공개항목 값이 달라 비교표 해석이 흔들린다.",
    done: "고시 시점 값, 사업시행 공개항목, 관리처분 공개항목을 별도 값으로 유지하거나 최신 적용값을 명시",
  },
  fill_missing_core_fields: {
    sprint_id: "S5",
    sprint_name: "핵심 공란 보강",
    why: "세대수, 용적률, 층수 같은 공란은 사업장 간 비교력을 낮춘다.",
    done: "공란 필드가 원문값, 공식 보조값, 단계상 미적용, 미공개 중 하나로 분류됨",
  },
  promote_snippets_to_confirmed_values: {
    sprint_id: "S5",
    sprint_name: "핵심 공란 보강",
    why: "자동 추출 스니펫은 문맥 확인 전까지 확정값으로 쓰기 어렵다.",
    done: "스니펫 기반 값이 confirmed, pending, conflict로 사업별 메모와 장부에 반영됨",
  },
};

const SPRINT_ORDER = ["S1", "S2", "S3", "S4", "S5"];

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

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts, limit = 5) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean))].slice(0, limit).join("; ");
}

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function taskWeight(task) {
  const priorityWeight = { P0: 1000, P1: 500, P2: 100, P3: 0 };
  const riskWeight = { very_high: 100, high: 50, medium: 20 };
  return (priorityWeight[task.priority] || 0) + (riskWeight[task.risk_signal_level] || 0) - Number(task.queue_rank || 999);
}

function buildTaskRows(queueRows, ledgerByRank, closureByRank, statusByRank) {
  return queueRows
    .filter((task) => ["P0", "P1"].includes(task.priority))
    .map((task) => {
      const stream = WORKSTREAMS[task.task_type] || {
        sprint_id: "S9",
        sprint_name: "기타 원문 검증",
        why: task.why_now || "",
        done: task.expected_output || "",
      };
      const rank = String(task.rank || "");
      const ledgerRows = ledgerByRank[rank] || [];
      const closureRows = closureByRank[rank] || [];
      const status = statusByRank[rank] || {};
      const statusCounts = countBy(ledgerRows, "verification_status");
      const closureCounts = countBy(closureRows, "closure_status");
      return {
        sprint_id: stream.sprint_id,
        sprint_name: stream.sprint_name,
        queue_rank: task.queue_rank,
        priority: task.priority,
        task_type: task.task_type,
        risk_signal_level: task.risk_signal_level,
        rank,
        focus_area: task.focus_area,
        district: task.district,
        project_name: task.project_name,
        current_stage: task.current_stage,
        task_title: task.task_title,
        fields_to_verify: task.fields_to_verify,
        first_source_to_open: task.source_to_open || status.first_source_to_open || "",
        expected_output: task.expected_output,
        related_public_items: task.related_public_items || "",
        project_note: task.project_note,
        ledger_status_summary: countText(statusCounts, 6),
        closure_status_summary: countText(closureCounts, 4),
        source_link_pending_count: closureRows.filter((row) => row.closure_ready !== "Y").length,
        weight: taskWeight(task),
      };
    })
    .sort((a, b) => b.weight - a.weight || Number(a.queue_rank) - Number(b.queue_rank))
    .map(({ weight, ...row }) => row);
}

function buildSprintRows(taskRows, ledgerRows, closureRows) {
  const rows = [];
  for (const sprintId of SPRINT_ORDER) {
    const tasks = taskRows.filter((task) => task.sprint_id === sprintId);
    if (!tasks.length) continue;
    const firstTask = tasks[0];
    const stream = Object.values(WORKSTREAMS).find((item) => item.sprint_id === sprintId) || {};
    const ranks = new Set(tasks.map((task) => task.rank));
    const relatedLedger = ledgerRows.filter((row) => ranks.has(String(row.rank)));
    const relatedClosure = closureRows.filter((row) => ranks.has(String(row.rank)));
    rows.push({
      sprint_id: sprintId,
      sprint_name: stream.sprint_name || firstTask.sprint_name,
      priority_mix: countText(countBy(tasks, "priority"), 3),
      task_count: tasks.length,
      p0_count: tasks.filter((task) => task.priority === "P0").length,
      p1_count: tasks.filter((task) => task.priority === "P1").length,
      project_count: ranks.size,
      focus_mix: countText(countBy(tasks, "focus_area"), 3),
      first_projects: compact(tasks.map((task) => `${task.rank}. ${task.project_name}`), 5),
      first_sources: compact(tasks.map((task) => task.first_source_to_open), 3),
      ledger_blockers: countText(countBy(relatedLedger, "verification_status"), 6),
      closure_blockers: countText(countBy(relatedClosure, "closure_status"), 4),
      why_this_sprint: stream.why || "",
      done_criteria: stream.done || "",
    });
  }
  return rows;
}

function markdown({ sprintRows, taskRows, summary }) {
  return `# 원문 검증 실행 패킷

작성 기준: ${kstDate()} KST

이 문서는 P0/P1 원문 수치 검증 큐를 실제 실행 묶음으로 압축한 작업 패킷이다. 목표는 사업별 비교표와 메모의 수치 근거를 확정/보류/충돌로 분리하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| P0/P1 태스크 | ${summary.task_count} |
| P0 | ${summary.p0_count} |
| P1 | ${summary.p1_count} |
| 대상 사업장 | ${summary.project_count} |
| 실행 스프린트 | ${summary.sprint_count} |
| 원문 URL 미완료 후보 | ${summary.source_link_pending_count} |

## 스프린트

${mdTable(sprintRows, [
  { key: "sprint_id", label: "스프린트" },
  { key: "sprint_name", label: "이름" },
  { key: "priority_mix", label: "우선순위" },
  { key: "task_count", label: "태스크" },
  { key: "project_count", label: "사업장" },
  { key: "first_projects", label: "먼저 볼 사업" },
  { key: "ledger_blockers", label: "장부 병목" },
  { key: "closure_blockers", label: "링크 병목" },
  { key: "done_criteria", label: "완료 기준" },
])}

## 먼저 처리할 20개

${mdTable(taskRows.slice(0, 20), [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "sprint_id", label: "스프린트" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "task_title", label: "작업" },
  { key: "fields_to_verify", label: "확인 필드" },
  { key: "first_source_to_open", label: "먼저 열 자료" },
])}

## 전체 P0/P1 태스크

${mdTable(taskRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "sprint_id", label: "스프린트" },
  { key: "task_type", label: "유형" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "task_title", label: "작업" },
  { key: "ledger_status_summary", label: "장부 상태" },
  { key: "closure_status_summary", label: "링크 상태" },
  { key: "expected_output", label: "산출물" },
])}

## 사용법

1. S1 비용·기반시설은 장기 리스크 가설을 가장 많이 바꾸므로 P0부터 처리한다.
2. S2 recordCode·원문 URL은 source-link-closure-board.md에서 closure_ready != Y인 항목을 닫는다.
3. S3 OCR은 이미지 판독 로그와 원문 텍스트를 대조해 확정/보정/부분확정으로만 남긴다.
4. S4 단계 충돌은 고시 시점과 사업시행/관리처분 공개항목을 같은 값으로 덮어쓰지 않는다.
5. S5 공란/스니펫은 확정값이 없으면 미공개/단계상 미적용 사유를 남긴다.
`;
}

async function main() {
  const [queueRows, ledgerRows, closureRows, statusRows] = await Promise.all([
    readJson(QUEUE_INPUT),
    readJson(LEDGER_INPUT),
    readJson(CLOSURE_INPUT),
    readJson(STATUS_INPUT),
  ]);
  const taskRows = buildTaskRows(queueRows, groupByRank(ledgerRows), groupByRank(closureRows), Object.fromEntries(statusRows.map((row) => [String(row.rank), row])));
  const sprintRows = buildSprintRows(taskRows, ledgerRows, closureRows);
  const summary = {
    generated_at: `${kstDate()} KST`,
    task_count: taskRows.length,
    p0_count: taskRows.filter((task) => task.priority === "P0").length,
    p1_count: taskRows.filter((task) => task.priority === "P1").length,
    project_count: new Set(taskRows.map((task) => task.rank)).size,
    sprint_count: sprintRows.length,
    source_link_pending_count: closureRows.filter((row) => row.closure_ready !== "Y").length,
    task_type_counts: countBy(taskRows, "task_type"),
    sprint_counts: countBy(taskRows, "sprint_id"),
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: `${kstDate()} KST`, summary, sprintRows, taskRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(taskRows));
  await writeFile(OUT_MD, markdown({ sprintRows, taskRows, summary }));
  console.log(
    JSON.stringify(
      {
        tasks: summary.task_count,
        p0: summary.p0_count,
        p1: summary.p1_count,
        sprints: summary.sprint_count,
        output: "analysis/source-verification-sprint-plan.{md,csv,json}",
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
