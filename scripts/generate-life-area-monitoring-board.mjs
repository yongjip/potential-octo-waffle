#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "life-area-monitoring-board.md");
const OUT_CSV = path.join(OUT_DIR, "life-area-monitoring-board.csv");
const OUT_JSON = path.join(OUT_DIR, "life-area-monitoring-board.json");

const INPUTS = {
  snapshot: "analysis/current-research-snapshot.json",
  comparisonBrief: "analysis/focus-area-comparison-brief.json",
  decisionMemo: "analysis/focus-area-decision-memo.json",
  evidenceHeatmap: "analysis/focus-area-evidence-risk-heatmap.json",
  weeklyComparisonBoard: "analysis/weekly-monitoring-comparison-board.json",
  weeklyHistory: "analysis/weekly-monitoring-history.json",
  coreExpansionSpine: "analysis/core-expansion-research-spine.json",
  gangdongStageWatch: "analysis/expansion-gangdong-stage-watch-board.json",
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

function unique(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function findBy(rows, key, value) {
  return (rows || []).find((row) => String(row[key] || "").trim() === String(value || "").trim()) || {};
}

function statusPriority(status) {
  if (status === "fresh_remote_week") return 4;
  if (status === "local_refresh_only") return 3;
  if (status === "logged_no_remote_refresh") return 2;
  if (status === "baseline_only") return 1;
  return 0;
}

function groupWeeklyStatus(rows) {
  const uniqueStatuses = unique(rows.map((row) => row.weekly_status));
  if (!uniqueStatuses.length) return "no_weekly_log";
  return uniqueStatuses.sort((a, b) => statusPriority(b) - statusPriority(a))[0];
}

function statusLabel(status) {
  if (status === "fresh_remote_week") return "원격 점검 반영";
  if (status === "local_refresh_only") return "로컬 재생성만 반영";
  if (status === "logged_no_remote_refresh") return "로그만 기록";
  if (status === "baseline_only") return "기준선만 있음";
  return "주간 로그 없음";
}

function topBlocker(areaRows, decisionRow) {
  if (areaRows.some((row) => row.blocker_label === "외부 회신 대기")) return "외부 회신 대기";
  if (areaRows.some((row) => row.blocker_label === "현장 관찰 미입력")) return "현장 관찰 미입력";
  if ((decisionRow.high_blocking_projects || "").trim()) return "원문 병목 우선";
  return "주간 공식 점검";
}

function nextAction(areaRows, snapshotRow, decisionRow, comparisonRow, weeklyStatus) {
  const externalWaitRow = areaRows.find((row) => row.blocker_label === "외부 회신 대기");
  if (externalWaitRow) return externalWaitRow.next_best_action;

  const fieldworkRow = areaRows.find((row) => row.observation_status === "ready_to_visit");
  if (fieldworkRow) return fieldworkRow.next_best_action;

  if (weeklyStatus === "baseline_only" || weeklyStatus === "no_weekly_log") {
    return "weekly_primary_refresh 실행 후 create-weekly-monitoring-log --write --refresh";
  }

  return (
    snapshotRow.next_action ||
    comparisonRow.immediate_decision ||
    decisionRow.immediate_decision ||
    ""
  );
}

function buildRows({ snapshot, comparisonBrief, decisionMemo, evidenceHeatmap, weeklyComparisonBoard, weeklyHistory }) {
  const snapshotLifeAreas = snapshot.life_areas || [];
  const comparisonRows = comparisonBrief.rows || [];
  const decisionRows = decisionMemo.focusRows || [];
  const heatRows = evidenceHeatmap.focus_rows || [];
  const weeklyRows = weeklyComparisonBoard.rows || [];
  const historyLifeRows = weeklyHistory.latest_life_area_rows || [];

  return snapshotLifeAreas.map((snapshotRow) => {
    const lifeArea = snapshotRow.name;
    const comparisonRow = findBy(comparisonRows, "focus_area", lifeArea);
    const decisionRow = findBy(decisionRows, "focus_area", lifeArea);
    const heatRow = findBy(heatRows, "focus_area", lifeArea);
    const historyRow = findBy(historyLifeRows, "life_area", lifeArea);
    const areaWeeklyRows = weeklyRows.filter((row) => row.life_area === lifeArea);
    const weeklyStatus = groupWeeklyStatus(areaWeeklyRows);
    const externalWaitCount = areaWeeklyRows.filter((row) => row.blocker_label === "외부 회신 대기").length;
    const fieldworkPendingCount = areaWeeklyRows.filter((row) => row.observation_status === "ready_to_visit").length;
    const blocker = topBlocker(areaWeeklyRows, decisionRow);
    const actionPriority =
      Number(comparisonRow.comparison_score || 0) +
      Number(heatRow.avg_heat_score || 0) / 10 +
      externalWaitCount * 20 +
      fieldworkPendingCount * 8 +
      (weeklyStatus === "baseline_only" ? 12 : 0);

    return {
      focus_area: lifeArea,
      weekly_status: weeklyStatus,
      weekly_status_label: statusLabel(weeklyStatus),
      action_priority_score: Math.round(actionPriority * 10) / 10,
      current_stance: snapshotRow.current_stance || comparisonRow.current_stance || "",
      provisional_stance: decisionRow.provisional_stance || "",
      comparison_score: comparisonRow.comparison_score || "",
      avg_potential: comparisonRow.avg_potential || "",
      avg_confidence: comparisonRow.avg_confidence || "",
      avg_heat_score: heatRow.avg_heat_score || "",
      external_dependency: snapshotRow.external_dependency || "",
      external_wait_count: externalWaitCount,
      fieldwork_pending_count: fieldworkPendingCount,
      top_blocker: blocker,
      weekly_note: compact([historyRow.weekly_change, historyRow.interpretation], 2),
      first_action_project: comparisonRow.first_action_project || decisionRow.first_action_project || "",
      first_action_track: comparisonRow.first_action_track || decisionRow.first_action_track || "",
      fieldwork_route: snapshotRow.fieldwork_route || comparisonRow.top_fieldwork_route || "",
      high_blocking_projects: decisionRow.high_blocking_projects || "",
      immediate_decision: comparisonRow.immediate_decision || decisionRow.immediate_decision || "",
      next_best_action: nextAction(areaWeeklyRows, snapshotRow, decisionRow, comparisonRow, weeklyStatus),
      market_signal: decisionRow.market_signal || "",
      decision_question: snapshotRow.key_question || comparisonRow.decision_question || decisionRow.decision_question || "",
      one_line_conclusion: snapshotRow.one_line_conclusion || "",
    };
  }).sort((a, b) => Number(b.action_priority_score || 0) - Number(a.action_priority_score || 0));
}

function buildExpansionZoneRows(coreExpansionSpine, gangdongStageWatch, weeklyHistory) {
  const expansionRows = coreExpansionSpine.expansion_rows || coreExpansionSpine.rows?.filter((row) => row.scope === "expansion_watch") || [];
  const gangdongStageRows = gangdongStageWatch.rows || [];
  const historyExpansionRows = weeklyHistory.latest_expansion_zone_rows || [];
  const zoneMap = new Map();
  for (const row of expansionRows) {
    const key = row.area_group || "미분류";
    if (!zoneMap.has(key)) zoneMap.set(key, []);
    zoneMap.get(key).push(row);
  }

  return [...zoneMap.entries()].map(([zoneName, zoneRows]) => {
    const confirmedCount = zoneRows.filter((row) => row.verification_state === "confirmed_snapshot").length;
    const zoneStageRows = zoneName === "강동권" ? gangdongStageRows : [];
    const historyRow = findBy(historyExpansionRows, "zone_name", zoneName);
    const latestStageGapCount = zoneStageRows.filter((row) => row.latest_stage_status === "latest_stage_gap").length;
    const staleNoticeCount = zoneStageRows.filter((row) => row.latest_stage_status === "stale_notice_only").length;
    const contextOnlyCount = zoneStageRows.filter((row) => row.latest_stage_status === "context_only").length;

    return {
      zone_name: zoneName,
      current_state: zoneName === "강동권"
        ? (latestStageGapCount > 0 ? "값 confirmed / 단계 재확인 필요" : "confirmed 비교 가능")
        : (zoneRows.every((row) => row.verification_state === "confirmed_snapshot") ? "confirmed 비교 가능" : "보류값 포함"),
      core_reference: compact(zoneRows.map((row) => row.closest_core_reference), 2),
      watch_count: zoneRows.length,
      confirmed_count: confirmedCount,
      weekly_note: compact([historyRow.weekly_change, historyRow.interpretation], 2),
      stage_state: zoneName === "강동권"
        ? `latest_stage_gap ${latestStageGapCount}; stale ${staleNoticeCount}; context ${contextOnlyCount}`
        : "원문+이미지 재대조 완료",
      anchor_projects: compact(zoneRows.map((row) => row.project_name), 3),
      key_caution: zoneName === "강동권"
        ? compact([...zoneStageRows.map((row) => row.caution), ...zoneRows.map((row) => row.risk_or_caution)], 2)
        : compact(zoneRows.map((row) => row.risk_or_caution), 2),
      next_action: compact(zoneRows.map((row) => row.next_action), 2),
      priority_action: zoneName === "강동권"
        ? compact(zoneStageRows.filter((row) => row.stage_watch_priority === "high").map((row) => row.next_stage_refresh_action), 2)
        : compact(zoneRows.map((row) => row.next_action), 2),
    };
  });
}

function summarize(rows, expansionZoneRows, weeklyHistory) {
  return {
    generated_at: weeklyHistory.summary?.generated_at || "",
    life_area_count: rows.length,
    expansion_zone_count: expansionZoneRows.length,
    value_confirmed_expansion_zone_count: expansionZoneRows.filter((row) => Number(row.watch_count || 0) > 0 && Number(row.watch_count || 0) === Number(row.confirmed_count || 0)).length,
    stage_recheck_expansion_zone_count: expansionZoneRows.filter((row) => String(row.current_state || "").includes("단계 재확인 필요")).length,
    baseline_only_area_count: rows.filter((row) => row.weekly_status === "baseline_only").length,
    external_wait_area_count: rows.filter((row) => Number(row.external_wait_count || 0) > 0).length,
    fieldwork_pending_area_count: rows.filter((row) => Number(row.fieldwork_pending_count || 0) > 0).length,
    top_focus_area: rows[0]?.focus_area || "",
    latest_log_date: weeklyHistory.summary?.latest_log_date || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows, expansionZoneRows) {
  return `# 생활권 모니터링 보드

작성 기준: ${summary.generated_at || "미기록"}

이 문서는 강남·잠실/송파·구의/광진 세 생활권을 한 줄씩 비교하는 실행판이다. 현재 입장, 최근 주간 로그 상태, 외부 회신 병목, 현장 답사 병목을 같이 보고 어디에 시간을 먼저 써야 하는지 정한다. 강동권과 약수동 주변은 별도 확장 관심권으로 마지막 섹션에서 같이 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 생활권 | ${summary.life_area_count} |
| 확장 관심권 | ${summary.expansion_zone_count} |
| 값 confirmed 확장권 | ${summary.value_confirmed_expansion_zone_count} |
| 단계 재확인 필요 확장권 | ${summary.stage_recheck_expansion_zone_count} |
| 기준선만 있는 생활권 | ${summary.baseline_only_area_count} |
| 외부 회신 병목 생활권 | ${summary.external_wait_area_count} |
| 현장 답사 대기 생활권 | ${summary.fieldwork_pending_area_count} |

| 항목 | 값 |
| --- | --- |
| 최우선 생활권 | ${summary.top_focus_area || "_없음_"} |
| 최신 로그일 | ${summary.latest_log_date || "_없음_"} |
| 기본 주간 명령 | node scripts/create-weekly-monitoring-log.mjs --date=YYYY-MM-DD --remote-run=Y --regenerated=Y --write --refresh |

## 생활권 비교

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "weekly_status_label", label: "주간상태" },
    { key: "action_priority_score", label: "행동점수" },
    { key: "current_stance", label: "현재 입장" },
    { key: "top_blocker", label: "핵심 병목" },
    { key: "external_wait_count", label: "외부회신" },
    { key: "fieldwork_pending_count", label: "현장대기" },
    { key: "next_best_action", label: "다음 행동" },
  ])}

## 세부 비교

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "provisional_stance", label: "잠정 stance" },
    { key: "weekly_note", label: "최신 주간 메모" },
    { key: "first_action_project", label: "먼저 볼 사업" },
    { key: "first_action_track", label: "트랙" },
    { key: "fieldwork_route", label: "답사 루트" },
    { key: "high_blocking_projects", label: "외부병목 사업" },
  ])}

## 판단 질문

${mdTable(rows, [
    { key: "focus_area", label: "생활권" },
    { key: "decision_question", label: "판단 질문" },
    { key: "immediate_decision", label: "현재 결론" },
    { key: "one_line_conclusion", label: "한 줄 결론" },
  { key: "market_signal", label: "시장 메모" },
])}

## 확장 관심권 현황

${mdTable(expansionZoneRows, [
    { key: "zone_name", label: "확장권" },
    { key: "current_state", label: "현재 상태" },
    { key: "core_reference", label: "비교 기준" },
    { key: "watch_count", label: "watch" },
    { key: "confirmed_count", label: "confirmed" },
    { key: "weekly_note", label: "최신 주간 메모" },
    { key: "stage_state", label: "단계 상태" },
    { key: "anchor_projects", label: "대표 사업" },
    { key: "key_caution", label: "주의" },
    { key: "priority_action", label: "우선 액션" },
  ])}

## 운영 메모

- 생활권 점수는 투자 점수가 아니라 현재 시점의 리서치 실행 우선도다.
- 외부 회신 병목이 있는 생활권은 값 확정 전까지 비교 확신도를 올리지 않는다.
- \`baseline_only\`가 남아 있으면 실제 원격 주간 점검을 한 번도 기록하지 않은 상태다.
- 강동권은 잠실/송파 동측 연장축 비교용 확장권이지만, 값 confirmed와 최신 단계 재확인을 분리해서 읽는다.
- 약수동 주변은 별도 도심근접형 대조군으로 유지하고, 현재 3건 confirmed snapshot은 이미지 재대조까지 마친 기준선으로 본다.
`;
}

async function main() {
  const [snapshot, comparisonBrief, decisionMemo, evidenceHeatmap, weeklyComparisonBoard, weeklyHistory, coreExpansionSpine, gangdongStageWatch] = await Promise.all([
    readJson(INPUTS.snapshot),
    readJson(INPUTS.comparisonBrief),
    readJson(INPUTS.decisionMemo),
    readJson(INPUTS.evidenceHeatmap),
    readJson(INPUTS.weeklyComparisonBoard),
    readJson(INPUTS.weeklyHistory),
    readJson(INPUTS.coreExpansionSpine),
    readJson(INPUTS.gangdongStageWatch),
  ]);

  const rows = buildRows({ snapshot, comparisonBrief, decisionMemo, evidenceHeatmap, weeklyComparisonBoard, weeklyHistory });
  const expansionZoneRows = buildExpansionZoneRows(coreExpansionSpine, gangdongStageWatch, weeklyHistory);
  const summary = summarize(rows, expansionZoneRows, weeklyHistory);
  const payload = { summary, rows, expansion_zone_rows: expansionZoneRows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows, expansionZoneRows));

  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
