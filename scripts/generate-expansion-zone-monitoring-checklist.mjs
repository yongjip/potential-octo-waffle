#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";

const INPUTS = {
  latestGuide: "analysis/expansion-zone-latest-check-guide.json",
  runbook: "analysis/official-update-runbook.json",
  activationIntake: "data/review/official-source-activation-intake.json",
  monitoringBoard: "analysis/life-area-monitoring-board.json",
};

const OUT_MD = "analysis/expansion-zone-monitoring-checklist.md";
const OUT_JSON = "analysis/expansion-zone-monitoring-checklist.json";
const OUT_CSV = "analysis/expansion-zone-monitoring-checklist.csv";

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

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function compact(values, limit = 4) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function splitSemi(text) {
  return String(text || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function findBy(rows, key, value) {
  return (rows || []).find((row) => String(row[key] || "").trim() === String(value || "").trim()) || {};
}

function zoneFiles(zoneName) {
  if (zoneName === "강동권") {
    return [
      "analysis/expansion-zone-weekly-monitoring-cockpit.md",
      "analysis/expansion-zone-latest-check-guide.md",
      "analysis/expansion-official-latest-check-audit.md",
      "analysis/expansion-gangdong-stage-watch-board.md",
      "analysis/expansion-interest-zone-shortlist.md",
      "analysis/life-area-monitoring-board.md",
      "analysis/life-area-extended-comparison-board.md",
    ];
  }
  return [
    "analysis/expansion-zone-weekly-monitoring-cockpit.md",
    "analysis/expansion-zone-latest-check-guide.md",
    "analysis/expansion-official-latest-check-audit.md",
    "analysis/expansion-yaksu-ocr-recheck-board.md",
    "analysis/expansion-interest-zone-shortlist.md",
    "analysis/life-area-monitoring-board.md",
    "analysis/life-area-extended-comparison-board.md",
  ];
}

function buildZoneRows(guideDoc, activationRows, monitoringDoc, runbook) {
  const monitoringRows = monitoringDoc.expansion_zone_rows || [];
  return (guideDoc.zones || []).map((zone) => {
    const intake = activationRows.find((row) => {
      if (zone.zone_name === "강동권") return row.source_id === "gangdong_district_notice";
      return row.source_id === "jung_district_notice";
    }) || {};
    const monitoring = findBy(monitoringRows, "zone_name", zone.zone_name);
    const files = zoneFiles(zone.zone_name);
    return {
      zone_name: zone.zone_name,
      current_state: zone.current_state,
      next_check_at: zone.next_check_at,
      first_sources: zone.first_urls_plain,
      trigger_focus: zone.zone_name === "강동권" ? "최신 단계 재확인" : "약수역 direct hit 탐색",
      representative_projects: zone.zone_name === "강동권" ? "천호3구역; 신동아1·2차; 성내미주" : "신당8; 신당9; 금호14-1",
      first_action: zone.priority_action,
      decision_rule: runbook.decision_rule,
      first_files: files.join("; "),
      first_files_md: files.map((file) => fileLink(file)).join("<br>"),
      weekly_note: monitoring.next_action || "",
      activation_status: intake.activation_status || "planned",
      activation_note: intake.notes || "",
    };
  });
}

function buildChecklistRows(zoneRows, runbook) {
  const commonSteps = [
    {
      step_order: 1,
      zone_name: "공통",
      step_type: "read",
      action: "확장권 상위 비교판과 최신 확인 가이드를 먼저 연다.",
      command_or_manual_step: "문서 확인",
      first_files:
        "analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/life-area-extended-comparison-board.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-official-latest-check-audit.md",
      output_target: "이번 주에 강동권 루프를 탈지, 약수권 루프를 탈지 결정",
    },
    {
      step_order: 2,
      zone_name: "공통",
      step_type: "manual_web",
      action: "official-update-runbook의 expansion_zone_latest_check 원격 단계를 따라 정비사업구역계 진입 페이지 검색까지 수동 확인한다.",
      command_or_manual_step: runbook.command_sequence,
      first_files:
        "analysis/official-update-runbook.md; analysis/official-update-runbook-checklist.md; analysis/expansion-official-latest-check-audit.md; analysis/expansion-zone-intake-seed-board.md",
      output_target: "자치구 고시공고/정보몽땅/정비사업구역계 진입 페이지 최신 결과",
    },
  ];

  const zoneSteps = zoneRows.flatMap((zone, index) => {
    const isGangdong = zone.zone_name === "강동권";
    const base = 3 + index * 3;
    return [
      {
        step_order: base,
        zone_name: zone.zone_name,
        step_type: "review",
        action: isGangdong
          ? "강동권 추적 보드에서 최신 단계 공백 2건을 먼저 본다."
          : "약수권 재대조 보드에서 confirmed 기준값 3건을 유지할지 먼저 본다.",
        command_or_manual_step: "문서 확인",
        first_files: zone.first_files,
        output_target: zone.representative_projects,
      },
      {
        step_order: base + 1,
        zone_name: zone.zone_name,
        step_type: "decision",
        action: zone.first_action,
        command_or_manual_step: "수동 판정 + intake 기록",
        first_files: isGangdong
          ? "analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-official-latest-check-audit.md; analysis/expansion-zone-intake-seed-board.md; data/review/official-source-activation-intake.json"
          : "analysis/expansion-yaksu-ocr-recheck-board.md; analysis/expansion-official-latest-check-audit.md; analysis/expansion-zone-intake-seed-board.md; data/review/official-source-activation-intake.json",
        output_target: isGangdong ? "latest_stage_gap 해소 여부" : "direct hit 발생 여부 / confirmed 유지 여부",
      },
      {
        step_order: base + 2,
        zone_name: zone.zone_name,
        step_type: "followup_local",
        action: "필요한 파일을 갱신한 뒤 재생성 체인을 돈다.",
        command_or_manual_step: runbook.followup_local_command,
        first_files: "analysis/life-area-monitoring-board.md; analysis/life-area-extended-comparison-board.md",
        output_target: "확장권 최신 변화가 상위 비교판에 반영됨",
      },
    ];
  });

  return [...commonSteps, ...zoneSteps];
}

function summarize(zoneRows, checklistRows) {
  return {
    generated_at: `${kstDate()} KST`,
    zone_count: zoneRows.length,
    checklist_step_count: checklistRows.length,
    gangdong_step_count: checklistRows.filter((row) => row.zone_name === "강동권").length,
    yaksu_step_count: checklistRows.filter((row) => row.zone_name === "약수동 주변").length,
    manual_step_count: checklistRows.filter((row) => /manual/.test(row.step_type)).length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };
}

function markdown(summary, zoneRows, checklistRows, runbook) {
  return `# 확장 관심권 모니터링 체크리스트

작성 기준: ${summary.generated_at}

이 문서는 강동권과 약수동 주변 확장 관심권을 주간 점검 루프로 실제 실행할 때 쓰는 체크리스트다. 핵심 3생활권 주간 점검과 분리해서, 강동권은 단계 공백을 줄이고 약수권은 confirmed 기준값과 direct hit 탐색을 유지하는 데 초점을 둔다.

## 요약

- 권역 수: ${summary.zone_count}
- 체크리스트 단계: ${summary.checklist_step_count}
- 강동권 단계: ${summary.gangdong_step_count}
- 약수권 단계: ${summary.yaksu_step_count}
- 수동 웹 점검 단계: ${summary.manual_step_count}

## 기준 권역

${mdTable(zoneRows, [
    { key: "zone_name", label: "권역" },
    { key: "current_state", label: "현재 상태" },
    { key: "trigger_focus", label: "이번 점검 초점" },
    { key: "representative_projects", label: "대표 사업" },
    { key: "next_check_at", label: "다음 점검일" },
    { key: "first_action", label: "가장 먼저 할 일" },
  ])}

## 실행 순서

${mdTable(checklistRows, [
    { key: "step_order", label: "순서" },
    { key: "zone_name", label: "권역" },
    { key: "step_type", label: "유형" },
    { key: "action", label: "액션" },
    { key: "command_or_manual_step", label: "명령/절차" },
    { key: "output_target", label: "확인 결과" },
  ])}

## 권역별 먼저 열 파일

${zoneRows
    .map(
      (zone) => `### ${zone.zone_name}

${zone.first_files_md}

- 이번 점검 초점: ${zone.trigger_focus}
- 이번 점검 규칙: ${runbook.decision_rule}
- activation 상태: ${zone.activation_status}
- 메모: ${zone.activation_note || "없음"}
`,
    )
    .join("\n")}

## 기록 규칙

1. 수동 검색 결과는 \`data/review/official-source-activation-intake.json\` 또는 \`official-update-intake\`에 먼저 남긴다.
2. 강동권 변화는 \`expansion-gangdong-stage-watch-board\`를 먼저 고친다.
3. 약수권 변화는 \`expansion-yaksu-ocr-recheck-board\`와 \`expansion-interest-zone-shortlist\`를 먼저 고친다.
4. 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`로 상위 비교판을 갱신한다.
`;
}

async function main() {
  const [guideDoc, runbooks, activationRows, monitoringDoc] = await Promise.all([
    readJson(INPUTS.latestGuide),
    readJson(INPUTS.runbook),
    readJson(INPUTS.activationIntake),
    readJson(INPUTS.monitoringBoard),
  ]);

  const runbook = findBy(runbooks, "runbook_id", "expansion_zone_latest_check");
  if (!runbook.runbook_id) throw new Error("expansion_zone_latest_check runbook not found");

  const zoneRows = buildZoneRows(guideDoc, activationRows, monitoringDoc, runbook);
  const checklistRows = buildChecklistRows(zoneRows, runbook);
  const summary = summarize(zoneRows, checklistRows);

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, zone_rows: zoneRows, checklist_rows: checklistRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(checklistRows));
  await writeFile(OUT_MD, `${markdown(summary, zoneRows, checklistRows, runbook)}\n`);
  console.log(JSON.stringify({ zones: zoneRows.length, steps: checklistRows.length, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
