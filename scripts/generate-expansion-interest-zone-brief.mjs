#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/research/expansion-interest-zones.json";
const CANDIDATE_INPUT = "data/research/expansion-interest-zone-candidates.json";
const SHORTLIST_INPUT = "analysis/expansion-interest-zone-shortlist.json";
const REVIEW_BOARD_INPUT = "analysis/expansion-urban-notice-review-board.json";
const GANGDONG_STAGE_INPUT = "analysis/expansion-gangdong-stage-watch-board.json";
const YAKSU_RECHECK_INPUT = "analysis/expansion-yaksu-ocr-recheck-board.json";
const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "expansion-interest-zone-brief.json");
const OUT_CSV = path.join(OUT_DIR, "expansion-interest-zone-brief.csv");
const OUT_MD = path.join(OUT_DIR, "expansion-interest-zone-brief.md");

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

async function main() {
  const zones = JSON.parse(await readFile(INPUT, "utf8"));
  const candidates = JSON.parse(await readFile(CANDIDATE_INPUT, "utf8"));
  const shortlistDoc = JSON.parse(await readFile(SHORTLIST_INPUT, "utf8"));
  const reviewBoard = JSON.parse(await readFile(REVIEW_BOARD_INPUT, "utf8"));
  const gangdongStageBoard = JSON.parse(await readFile(GANGDONG_STAGE_INPUT, "utf8"));
  const yaksuRecheckBoard = JSON.parse(await readFile(YAKSU_RECHECK_INPUT, "utf8"));
  const shortlistRows = shortlistDoc.rows || [];
  const reviewRows = reviewBoard.rows || [];
  const gangdongStageRows = gangdongStageBoard.rows || [];
  const yaksuRecheckRows = yaksuRecheckBoard.rows || [];

  const rows = zones.map((zone) => {
    const zoneShortlistRows = shortlistRows.filter((row) => row.zone_name === zone.zone_name);
    const zoneReviewRows = reviewRows.filter((row) => row.zone_name === zone.zone_name);
    const zoneConfirmedCount = zoneReviewRows.filter((row) => row.verification_state === "confirmed_snapshot").length;
    const zoneStageGapCount = zone.zone_name === "강동권"
      ? gangdongStageRows.filter((row) => row.latest_stage_status === "latest_stage_gap").length
      : 0;
    const zoneStageVerifiedCount = zone.zone_name === "강동권"
      ? gangdongStageRows.filter((row) => row.latest_stage_status === "stage_signal_verified").length
      : 0;
    const zoneContextOnlyCount = zone.zone_name === "강동권"
      ? gangdongStageRows.filter((row) => row.latest_stage_status === "context_only").length
      : 0;
    const zoneYaksuRecheckedCount = zone.zone_name === "약수동 주변"
      ? yaksuRecheckRows.filter((row) => row.verification_state === "confirmed_snapshot").length
      : 0;
    const currentSystemStatus = zone.zone_name === "강동권"
      ? (zoneStageGapCount > 0 ? "원문 비교값 운영 가능, 최신 단계 재확인 수동" : "원문 비교값 운영 가능, 단계 신호 확인")
      : "원문 비교값 운영 가능, 이미지 재대조까지 완료";
    const operationalState = zone.zone_name === "강동권"
      ? `shortlist ${zoneShortlistRows.length}건, confirmed snapshot ${zoneConfirmedCount}건, stage verified ${zoneStageVerifiedCount}건, context ${zoneContextOnlyCount}건`
      : `adjacent ${zoneShortlistRows.length}건, confirmed snapshot ${zoneConfirmedCount}건, 이미지 재대조 완료 ${zoneYaksuRecheckedCount}건`;
    const nextSystemMove = zone.zone_name === "강동권"
      ? (zoneStageGapCount > 0
          ? "천호3구역·신동아1·2차를 강동구 고시공고·정보몽땅으로 같은 날짜 기준 재확인"
          : "정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인")
      : "약수역 direct hit를 추가 발굴하고 현재 3건은 도심 경사 대조군 기준선으로 유지";

    return {
    zone_id: zone.zone_id,
    zone_name: zone.zone_name,
    zone_role: zone.zone_role,
    coverage_note: zone.coverage_note,
    relationship_to_core: zone.relationship_to_core,
    anchor_corridors: zone.anchor_corridors,
    key_hypothesis: zone.key_hypothesis,
    first_comparison_axes: zone.first_comparison_axes,
    ready_official_sources: zone.ready_official_sources,
    activation_gap: zone.activation_gap,
    first_manual_runbook: zone.first_manual_runbook,
    entry_condition: zone.entry_condition,
    caution: zone.caution,
      shortlist_count: zoneShortlistRows.length,
      confirmed_snapshot_count: zoneConfirmedCount,
      current_system_status: currentSystemStatus,
      operational_state: operationalState,
      next_system_move: nextSystemMove,
    };
  });

  const summary = {
    generated_at: `${kstDate()} KST`,
    zones: rows.length,
    candidate_seeds: candidates.length,
    roles: [...new Set(rows.map((row) => row.zone_role))].join("; "),
    shortlist_count: rows.reduce((sum, row) => sum + Number(row.shortlist_count || 0), 0),
    confirmed_snapshot_count: rows.reduce((sum, row) => sum + Number(row.confirmed_snapshot_count || 0), 0),
    ready_source_coverage: rows.map((row) => `${row.zone_name}: ${row.ready_official_sources}`).join(" / "),
  };
  const gangdongRow = rows.find((row) => row.zone_name === "강동권");
  const gangdongStageGapCount = gangdongStageRows.filter((row) => row.latest_stage_status === "latest_stage_gap").length;

  const md = `# 확장 관심권 브리프

작성 기준: ${summary.generated_at}

현재 핵심 생활권(강남·잠실/송파·구의/광진) 밖에서 다음으로 붙일 확장 관심권을 정의한다. 이 문서는 확장권이 현재 어느 정도까지 운영 체계에 들어왔는지와, 어디서부터 다시 수동 재확인이 필요한지를 같이 보여준다.

## 요약

- 구역 수: ${summary.zones}
- 후보 seed: ${summary.candidate_seeds}
- shortlist: ${summary.shortlist_count}
- confirmed snapshot: ${summary.confirmed_snapshot_count}
- 역할: ${summary.roles}
- 현재 즉시 쓸 수 있는 공식 출처: 서울도시공간포털, 정비사업 정보몽땅, 서울시 주택·도시계획 분야, 서울시 교통 분야, 서울 정보소통광장

## 권역 표

${mdTable(rows, [
  { key: "zone_name", label: "권역" },
  { key: "relationship_to_core", label: "핵심 생활권과의 관계" },
  { key: "anchor_corridors", label: "우선 볼 축" },
  { key: "key_hypothesis", label: "핵심 가설" },
  { key: "current_system_status", label: "현재 체계 상태" },
  { key: "operational_state", label: "운영 상태" },
  { key: "activation_gap", label: "남은 공백" },
  { key: "next_system_move", label: "다음 시스템 액션" },
])}

## 다음 단계

1. 강동권은 ${gangdongStageGapCount > 0 ? "값 비교가 아니라 최신 단계 재확인 루프를 붙이는 것" : "단계 신호를 확인한 뒤 사업장 상세 공개자료와 강동구 고시공고 최신 문서일을 맞추는 것"}이 남은 핵심 작업이다.
2. 약수동 주변은 현재 3건 confirmed snapshot을 도심 경사 대조군으로 유지하되, 약수역 direct hit를 별도로 찾는다.
3. 각 권역의 후보 seed는 \`analysis/expansion-interest-zone-candidate-brief.md\`에서 관리하고, 공식 사업명/고시번호가 확인되면 서울도시공간포털/정비사업 정보몽땅 원문 루프에 넣는다.
4. 자치구 고시공고와 정보몽땅 최신 단계 재확인 루프가 weekly 체계에 붙기 전까지는 확장권 단계 해석을 과대확정하지 않는다.
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(
    JSON.stringify(
      {
        zones: rows.length,
        candidateSeeds: candidates.length,
        output: "analysis/expansion-interest-zone-brief.{md,csv,json}",
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
