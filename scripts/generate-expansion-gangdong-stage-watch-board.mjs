#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  shortlist: "analysis/expansion-interest-zone-shortlist.json",
  collectionQueue: "analysis/expansion-urban-notice-collection-queue.json",
  reviewBoard: "analysis/expansion-urban-notice-review-board.json",
  updateIntake: "data/review/official-update-intake.json",
  stageSeeds: "data/research/expansion-gangdong-stage-watch-seeds.json",
};

const URBAN_ENTRY_URL = "https://urban.seoul.go.kr/view/html/PMNU4030600001";

const OUT_MD = "analysis/expansion-gangdong-stage-watch-board.md";
const OUT_JSON = "analysis/expansion-gangdong-stage-watch-board.json";
const OUT_CSV = "analysis/expansion-gangdong-stage-watch-board.csv";

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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function daysBetween(dateText) {
  if (!dateText) return "";
  const base = new Date(`${dateText}T00:00:00+09:00`);
  if (Number.isNaN(base.getTime())) return "";
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - base.getTime()) / 86400000));
}

function noticeAgeBand(days) {
  if (days === "") return "미확인";
  if (days <= 365) return "1년 이내";
  if (days <= 1095) return "1~3년";
  return "3년 초과";
}

function stageStatusLabel(status) {
  if (status === "latest_stage_gap") return "최신 단계 공백";
  if (status === "stale_notice_only") return "오래된 고시만 확인";
  if (status === "context_only") return "보조 비교축";
  if (status === "stage_signal_verified") return "단계 신호 확인";
  return "미분류";
}

function stageWatchPriority(row) {
  if (row.latest_stage_status === "context_only") return "low";
  if (row.latest_stage_status === "stale_notice_only") return "medium";
  if (row.latest_stage_status === "latest_stage_gap") return "high";
  if (row.latest_stage_status === "stage_signal_verified") return "medium";
  return "low";
}

function priorityScore(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  if (priority === "low") return 1;
  return 0;
}

function compact(values, limit = 2) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit).join("; ");
}

async function main() {
  const shortlistDoc = await readJson(INPUTS.shortlist);
  const collectionQueue = await readJson(INPUTS.collectionQueue);
  const reviewBoard = await readJson(INPUTS.reviewBoard);
  const updateIntake = await readJson(INPUTS.updateIntake);
  const stageSeeds = await readJson(INPUTS.stageSeeds);

  const shortlistRows = (shortlistDoc.rows || []).filter((row) => row.zone_name === "강동권");
  const queueById = new Map((collectionQueue.rows || []).map((row) => [row.shortlist_id, row]));
  const reviewById = new Map((reviewBoard.rows || []).map((row) => [row.shortlist_id, row]));
  const intakeById = new Map(updateIntake.map((row) => [row.update_id, row]));
  const seedById = new Map(stageSeeds.map((row) => [row.shortlist_id, row]));

  const rows = shortlistRows
    .map((row) => {
      const queue = queueById.get(row.shortlist_id) || {};
      const review = reviewById.get(row.shortlist_id) || {};
      const intake = intakeById.get(row.tracked_update_id) || {};
      const seed = seedById.get(row.shortlist_id) || {};
      const days = daysBetween(row.notice_date);
      const watchPriority = stageWatchPriority(seed);
      return {
        shortlist_id: row.shortlist_id,
        zone_name: row.zone_name,
        project_name: row.project_name,
        candidate_type: row.candidate_type,
        shortlist_priority: row.shortlist_priority,
        stage_watch_priority: watchPriority,
        notice_no: row.notice_no,
        notice_date: row.notice_date,
        notice_age_days: days,
        notice_age_band: noticeAgeBand(days),
        urban_notice_title: row.urban_notice_title,
        latest_public_signal: seed.latest_public_signal || review.stage_signal || "",
        latest_stage_status: seed.latest_stage_status || "",
        latest_stage_status_label: stageStatusLabel(seed.latest_stage_status || ""),
        latest_stage_basis: seed.latest_stage_basis || "",
        latest_public_channel: seed.latest_public_channel || "서울도시공간포털 정비사업구역계",
        latest_stage_last_checked: seed.latest_stage_last_checked || kstDate(),
        verification_state: review.verification_state || "",
        value_snapshot: review.value_snapshot || "",
        comparison_use: review.comparison_use || "",
        caution: compact([seed.caution, review.caution], 2),
        next_stage_refresh_action: seed.next_stage_refresh_action || row.next_action || "",
        tracked_update_id: row.tracked_update_id || "",
        intake_note: compact([intake.observed_change, intake.notes], 2),
        urban_notice_code: row.urban_notice_code || "",
        public_entry_url: row.official_url || URBAN_ENTRY_URL,
        noticecode_reference: row.urban_notice_code || "",
        text_path: queue.text_path || "",
      };
    })
    .sort((a, b) => priorityScore(b.stage_watch_priority) - priorityScore(a.stage_watch_priority) || priorityScore(b.shortlist_priority) - priorityScore(a.shortlist_priority));

  const summary = {
    generated_at: `${kstDate()} KST`,
    row_count: rows.length,
    high_priority_count: rows.filter((row) => row.stage_watch_priority === "high").length,
    medium_priority_count: rows.filter((row) => row.stage_watch_priority === "medium").length,
    low_priority_count: rows.filter((row) => row.stage_watch_priority === "low").length,
    latest_stage_gap_count: rows.filter((row) => row.latest_stage_status === "latest_stage_gap").length,
    stale_notice_only_count: rows.filter((row) => row.latest_stage_status === "stale_notice_only").length,
    context_only_count: rows.filter((row) => row.latest_stage_status === "context_only").length,
    confirmed_snapshot_count: rows.filter((row) => row.verification_state === "confirmed_snapshot").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };

  const md = `# 강동권 최신 단계 추적 보드

작성 기준: ${summary.generated_at}

이 문서는 강동권 확장 관심권 비교값과 별개로, 공개된 마지막 공식 단계 신호가 어디까지 닫혀 있는지 따로 보는 보드다. 여기서 말하는 최신 단계는 실제 인허가 최종 확정이 아니라, 현재 로컬에 확보된 공식 공개 신호의 마지막 위치다.

## 요약

- 전체 행: ${summary.row_count}
- high 우선 재확인: ${summary.high_priority_count}
- medium 우선 재확인: ${summary.medium_priority_count}
- low 우선 재확인: ${summary.low_priority_count}
- 최신 단계 공백: ${summary.latest_stage_gap_count}
- 오래된 고시만 확인: ${summary.stale_notice_only_count}
- 보조 비교축: ${summary.context_only_count}
- 값 스냅샷 confirmed: ${summary.confirmed_snapshot_count}

## 우선 재확인

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "stage_watch_priority", label: "추적우선" },
    { key: "latest_public_signal", label: "현재 공개 신호" },
    { key: "latest_stage_status_label", label: "상태" },
    { key: "notice_date", label: "최근 고시일" },
    { key: "notice_age_band", label: "고시 시차" },
    { key: "next_stage_refresh_action", label: "다음 액션" },
  ])}

## 세부 판정

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "candidate_type", label: "후보유형" },
    { key: "verification_state", label: "값상태" },
    { key: "comparison_use", label: "비교 용도" },
    { key: "latest_stage_basis", label: "단계 근거" },
    { key: "caution", label: "주의" },
    { key: "text_path", label: "텍스트 경로" },
  ])}

## 운영 원칙

1. 강동권 후보들은 모두 값 비교는 가능하지만, 최신 인허가 단계는 이 보드에서 따로 관리한다.
2. \`latest_stage_gap\`은 최근 공식 고시는 있으나 그 고시만으로 조합설립, 사업시행, 관리처분 같은 최신 단계를 닫지 못한 상태를 뜻한다.
3. \`stale_notice_only\`는 원문이 오래돼 장기 baseline으로는 쓸 수 있지만 현재 단계 해석은 원격 재확인이 필요한 상태를 뜻한다.
4. \`context_only\`는 사업장 식별이나 직접성 공백 때문에 보조 비교축으로만 유지하는 상태를 뜻한다.
5. 원격 재확인 전에는 이 보드의 상태를 투자판단 신호로 올리지 않고, 어디를 먼저 다시 찾을지 정하는 작업 큐로만 사용한다.
6. 사람이 읽는 공식 진입 경로는 \`${URBAN_ENTRY_URL}\`를 기준으로 두고, \`noticecode_reference\`는 재검색 식별자로만 남긴다.
`;

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(JSON.stringify({ rows: rows.length, highPriority: summary.high_priority_count, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
