#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "expansion-zone-weekly-monitoring-cockpit.md");
const OUT_CSV = path.join(OUT_DIR, "expansion-zone-weekly-monitoring-cockpit.csv");
const OUT_JSON = path.join(OUT_DIR, "expansion-zone-weekly-monitoring-cockpit.json");

const INPUTS = {
  latestGuide: "analysis/expansion-zone-latest-check-guide.json",
  checklist: "analysis/expansion-zone-monitoring-checklist.json",
  runbooks: "analysis/official-update-runbook-checklist.json",
  monitoringBoard: "analysis/life-area-monitoring-board.json",
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

function byZone(rows) {
  return new Map((rows || []).map((row) => [String(row.zone_name), row]));
}

function parseIsoDate(value) {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return null;
  const date = new Date(`${match[0]}T00:00:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffDays(fromDate, toDate) {
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
}

function zoneLane(zoneName) {
  if (zoneName === "강동권") return "최신 단계 재확인";
  return "direct hit 탐색";
}

function nextCheckStatus(nextCheckAt) {
  const today = parseIsoDate(kstDate());
  const nextDate = parseIsoDate(nextCheckAt);
  if (!today || !nextDate) return "미정";
  const delta = diffDays(today, nextDate);
  if (delta < 0) return `경과 D+${Math.abs(delta)}`;
  if (delta === 0) return "오늘";
  return `D-${delta}`;
}

function outputRoute(zoneName) {
  if (zoneName === "강동권") {
    return "official-update-intake -> expansion-gangdong-stage-watch-board -> expansion-zone-intake-seed-board -> regenerate-research-artifacts";
  }
  return "official-update-intake -> expansion-yaksu-ocr-recheck-board -> expansion-zone-intake-seed-board -> regenerate-research-artifacts";
}

function buildRows({ guideDoc, checklistDoc, weeklyRunbook, monitoringDoc }) {
  const checklistByZone = byZone(checklistDoc.zone_rows || []);
  const monitoringByZone = byZone(monitoringDoc.expansion_zone_rows || []);
  const detailRows = guideDoc.detail_rows || [];
  const today = parseIsoDate(kstDate());

  return (guideDoc.zones || [])
    .map((zone) => {
      const checklistZone = checklistByZone.get(zone.zone_name) || {};
      const monitoringZone = monitoringByZone.get(zone.zone_name) || {};
      const zoneDetails = detailRows.filter((row) => row.zone_name === zone.zone_name);
      const latestStageGapCount = zoneDetails.filter((row) => row.stage_status === "최신 단계 공백").length;
      const confirmedCount = zoneDetails.filter((row) => String(row.stage_status || "").includes("confirmed")).length;
      const nextDate = parseIsoDate(zone.next_check_at);
      const daysUntil = today && nextDate ? diffDays(today, nextDate) : null;

      let weeklyPriorityScore = zone.zone_name === "강동권" ? 92 : 74;
      weeklyPriorityScore += latestStageGapCount * 11;
      weeklyPriorityScore += confirmedCount * 2;
      weeklyPriorityScore += zoneDetails.length;
      if (daysUntil !== null && daysUntil <= 7) weeklyPriorityScore += 6;
      if (daysUntil !== null && daysUntil < 0) weeklyPriorityScore += 10;
      if (String(zone.activation_gap || "").includes("수동 루프")) weeklyPriorityScore += 4;
      if (String(zone.activation_gap || "").includes("direct hit")) weeklyPriorityScore += 6;

      return {
        weekly_priority_score: Math.round(weeklyPriorityScore * 10) / 10,
        lane: zoneLane(zone.zone_name),
        zone_name: zone.zone_name,
        core_reference: zone.core_reference,
        current_state: zone.current_state,
        next_check_at: zone.next_check_at,
        next_check_status: nextCheckStatus(zone.next_check_at),
        tracked_projects: compact(zoneDetails.map((row) => row.project_name), 4),
        open_gap: compact(
          [
            zone.activation_gap,
            latestStageGapCount ? `latest_stage_gap ${latestStageGapCount}` : "",
            zone.zone_name === "약수동 주변" ? "direct hit 신규 여부 확인" : "",
          ],
          3,
        ),
        first_check_action: checklistZone.first_action || zone.priority_action,
        weekly_note: checklistZone.weekly_note || monitoringZone.next_action || "",
        first_sources: checklistZone.first_sources || zone.first_urls_plain,
        first_outputs_to_read: checklistZone.first_files || weeklyRunbook.first_outputs_to_read || "",
        output_route: outputRoute(zone.zone_name),
      };
    })
    .sort((a, b) => Number(b.weekly_priority_score || 0) - Number(a.weekly_priority_score || 0) || a.zone_name.localeCompare(b.zone_name, "ko"));
}

function buildDetailRows(guideDoc) {
  return (guideDoc.detail_rows || []).map((row) => ({
    zone_name: row.zone_name,
    project_name: row.project_name,
    watch_type: row.stage_status || row.candidate_type,
    notice_no: row.notice_no,
    current_signal: row.current_signal,
    confirmed_value: row.confirmed_value,
    next_action: row.next_action,
  }));
}

function summarize(rows, detailRows, weeklyRunbook, runbookChecklist) {
  return {
    generated_at: UPDATED_AT,
    zone_count: rows.length,
    due_this_week_count: rows.filter((row) => /^D-[0-7]$/.test(String(row.next_check_status || "")) || row.next_check_status === "오늘").length,
    overdue_count: rows.filter((row) => String(row.next_check_status || "").startsWith("경과")).length,
    latest_stage_gap_project_count: detailRows.filter((row) => row.watch_type === "최신 단계 공백").length,
    confirmed_baseline_project_count: detailRows.filter((row) => String(row.watch_type || "").includes("confirmed")).length,
    weekly_remote_step_count: (runbookChecklist.checklistRows || []).filter(
      (row) => row.runbook_id === "expansion_zone_latest_check" && row.phase === "remote_collection",
    ).length,
    weekly_local_step_count: (runbookChecklist.checklistRows || []).filter(
      (row) => row.runbook_id === "expansion_zone_latest_check" && row.phase !== "remote_collection",
    ).length,
    weekly_followup_command: weeklyRunbook.followup_local_command || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows, detailRows, weeklyRunbook) {
  return `# 확장 관심권 주간 모니터링 콕핏

작성 기준: ${summary.generated_at}

이 문서는 강동권과 약수동 주변 확장 관심권을 주간 점검할 때 바로 여는 실행판이다. 강동권은 최신 단계 공백 관리, 약수권은 direct hit 탐색과 confirmed 기준값 유지를 한 화면에서 같이 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 확장 관심권 | ${summary.zone_count} |
| 이번 주 점검 예정 | ${summary.due_this_week_count} |
| 점검일 경과 | ${summary.overdue_count} |
| 강동 latest_stage_gap | ${summary.latest_stage_gap_project_count} |
| 약수 confirmed baseline | ${summary.confirmed_baseline_project_count} |

## 이번 주 먼저 볼 순서

${mdTable(rows, [
    { key: "weekly_priority_score", label: "주간점수" },
    { key: "lane", label: "레인" },
    { key: "zone_name", label: "권역" },
    { key: "current_state", label: "현재 상태" },
    { key: "next_check_status", label: "점검 상태" },
    { key: "tracked_projects", label: "대표 사업" },
    { key: "first_check_action", label: "첫 확인" },
  ])}

## 권역별 세부 감시대상

${mdTable(detailRows, [
    { key: "zone_name", label: "권역" },
    { key: "project_name", label: "사업장" },
    { key: "watch_type", label: "감시유형" },
    { key: "current_signal", label: "현재 공개신호" },
    { key: "confirmed_value", label: "지금 써도 되는 값" },
    { key: "next_action", label: "다음 재확인" },
  ])}

## 주간 실행 체인

| 항목 | 내용 |
| --- | --- |
| 원격 수집 체인 | ${weeklyRunbook.command_sequence || ""} |
| 후속 로컬 재생성 | ${summary.weekly_followup_command} |
| 먼저 읽을 산출물 | ${weeklyRunbook.first_outputs_to_read || ""} |
| 판정 규칙 | ${weeklyRunbook.decision_rule || ""} |

## 운영 메모

- 강동권 값 confirmed와 최신 단계 판정은 분리한다. 촉진계획/경미변경 고시만으로 최신 인허가 단계로 올리지 않는다.
- 약수권은 direct hit가 생기기 전까지 adjacent 기준선을 유지한다. OCR 숫자는 정식 표와 충돌하면 폐기한다.
- 변화가 확인되면 intake를 먼저 남기고, 권역별 보드를 수정한 뒤 전체 재생성으로 상위 비교판을 갱신한다.
`;
}

async function main() {
  const [guideDoc, checklistDoc, runbookChecklist, monitoringDoc] = await Promise.all([
    readJson(INPUTS.latestGuide),
    readJson(INPUTS.checklist),
    readJson(INPUTS.runbooks),
    readJson(INPUTS.monitoringBoard),
  ]);

  const weeklyRunbook = (runbookChecklist.selectedRunbooks || []).find((row) => row.runbook_id === "expansion_zone_latest_check") || {};
  const rows = buildRows({ guideDoc, checklistDoc, weeklyRunbook, monitoringDoc });
  const detailRows = buildDetailRows(guideDoc);
  const summary = summarize(rows, detailRows, weeklyRunbook, runbookChecklist);
  const payload = { summary, rows, detail_rows: detailRows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows, detailRows, weeklyRunbook));

  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
