#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  shortlist: "analysis/expansion-interest-zone-shortlist.json",
  collectionQueue: "analysis/expansion-urban-notice-collection-queue.json",
  reviewSeeds: "data/research/expansion-urban-notice-review-seeds.json",
};

const OUT_MD = "analysis/expansion-urban-notice-review-board.md";
const OUT_JSON = "analysis/expansion-urban-notice-review-board.json";
const OUT_CSV = "analysis/expansion-urban-notice-review-board.csv";

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

async function main() {
  const shortlistDoc = await readJson(INPUTS.shortlist);
  const collectionQueue = await readJson(INPUTS.collectionQueue);
  const reviewSeeds = await readJson(INPUTS.reviewSeeds);

  const queueById = new Map((collectionQueue.rows || []).map((row) => [row.shortlist_id, row]));
  const seedById = new Map(reviewSeeds.map((row) => [row.shortlist_id, row]));

  const rows = (shortlistDoc.rows || []).map((row) => {
    const queue = queueById.get(row.shortlist_id) || {};
    const seed = seedById.get(row.shortlist_id) || {};
    return {
      shortlist_id: row.shortlist_id,
      zone_name: row.zone_name,
      candidate_type: row.candidate_type,
      shortlist_priority: row.shortlist_priority,
      project_name: row.project_name,
      notice_no: row.notice_no,
      notice_date: row.notice_date,
      urban_notice_code: row.urban_notice_code || "",
      text_status: queue.text_status || "",
      text_char_count: queue.text_char_count || 0,
      stage_signal: seed.stage_signal || "",
      review_status: seed.review_status || "",
      verification_state: seed.verification_state || "",
      verification_note: seed.verification_note || "",
      value_snapshot: seed.value_snapshot || "",
      comparison_use: seed.comparison_use || "",
      caution: seed.caution || "",
      next_action: seed.next_action || queue.next_action || "",
      text_path: queue.text_path || "",
    };
  });

  const summary = {
    generated_at: `${kstDate()} KST`,
    row_count: rows.length,
    text_ready_count: rows.filter((row) => row.review_status === "text_ready").length,
    ocr_needed_count: rows.filter((row) => row.review_status === "ocr_needed").length,
    confirmed_snapshot_count: rows.filter((row) => row.verification_state === "confirmed_snapshot").length,
    pending_table_recheck_count: rows.filter((row) => row.verification_state === "pending_table_recheck").length,
    direct_like_count: rows.filter((row) => ["direct_project", "context_project"].includes(row.candidate_type)).length,
    adjacent_count: rows.filter((row) => row.candidate_type === "adjacent_project").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };

  const readyRows = rows.filter((row) => row.review_status === "text_ready");
  const ocrRows = rows.filter((row) => row.review_status === "ocr_needed");
  const operations = [
    "1. 이 보드의 수치 요약은 원문에서 사람이 1차 읽어 정리한 잠정 비교값 또는 confirmed snapshot이다.",
    "2. 비교 매트릭스 확정 반영 전에는 원문 표/조서 위치를 다시 대조하고 confirmed/pending/conflict로 분기한다.",
    summary.pending_table_recheck_count > 0
      ? `3. 현재 pending ${summary.pending_table_recheck_count}건은 원문 표 이미지 재대조 전까지 확정값으로 승격하지 않는다.`
      : "3. 이번 기준에서는 약수권 3건의 표 재대조를 마쳐 추가 OCR pending 없이 비교 가능 상태로 올렸다.",
  ];

  const md = `# 확장 관심권 원문 리뷰 보드

작성 기준: ${summary.generated_at}

이 문서는 확장 관심권 shortlist를 실제 비교 가능한 상태로 올리기 위해 서울도시공간포털 원문을 1차 리뷰한 보드다. 자동 추출 숫자를 확정값으로 승격하지 않고, 사람이 읽어 정리한 잠정 비교값과 OCR 병목을 분리한다.

## 요약

- 전체 행: ${summary.row_count}
- 텍스트 검토 준비: ${summary.text_ready_count}
- OCR 필요: ${summary.ocr_needed_count}
- 비교값 confirmed: ${summary.confirmed_snapshot_count}
- 표 재대조 pending: ${summary.pending_table_recheck_count}
- direct/context: ${summary.direct_like_count}
- adjacent: ${summary.adjacent_count}

## 텍스트 검토 준비

${mdTable(readyRows, [
    { key: "zone_name", label: "권역" },
    { key: "project_name", label: "사업장" },
    { key: "stage_signal", label: "고시 성격" },
    { key: "verification_state", label: "검증상태" },
    { key: "value_snapshot", label: "잠정 비교값" },
    { key: "comparison_use", label: "비교 용도" },
    { key: "caution", label: "주의" },
    { key: "verification_note", label: "검증 메모" },
    { key: "text_path", label: "텍스트 경로" },
  ])}

## OCR 필요

${mdTable(ocrRows, [
    { key: "zone_name", label: "권역" },
    { key: "project_name", label: "사업장" },
    { key: "stage_signal", label: "고시 성격" },
    { key: "text_status", label: "텍스트 상태" },
    { key: "comparison_use", label: "비교 용도" },
    { key: "caution", label: "주의" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 운영 원칙

${operations.join("\n")}
`;

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(JSON.stringify({ rows: rows.length, textReady: summary.text_ready_count, ocrNeeded: summary.ocr_needed_count, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
