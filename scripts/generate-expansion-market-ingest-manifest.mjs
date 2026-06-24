#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_MANIFEST_INPUT = "data/market/manual-import/manifest.json";
const STATUS_INPUT = "analysis/expansion-market-download-status.json";
const OUT_DIR = "data/market/manual-import";
const OUT_JSON = path.join(OUT_DIR, "expansion-ingest-manifest.json");
const OUT_CSV = path.join(OUT_DIR, "expansion-ingest-manifest.csv");
const OUT_MD = "analysis/expansion-market-ingest-manifest.md";
const OUT_ANALYSIS_CSV = "analysis/expansion-market-ingest-manifest.csv";
const OUT_ANALYSIS_JSON = "analysis/expansion-market-ingest-manifest.json";

const SOURCE_TO_MANUAL = {
  "seoul-open-data": "seoul-open-data-real-estate-csv",
  "molit-apt-trade": "molit-rtms-apt-trade-rent-manual",
  "molit-apt-rent": "molit-rtms-apt-trade-rent-manual",
  "molit-rowhouse-trade": "molit-rtms-rowhouse-trade-rent-manual",
  "molit-rowhouse-rent": "molit-rtms-rowhouse-trade-rent-manual",
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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function byManualSource(rows) {
  return new Map((rows || []).map((row) => [row.manual_source_id, row]));
}

function fileTypeFromPath(file) {
  const ext = path.extname(file || "").toLowerCase();
  if (ext === ".xlsx") return "xlsx";
  if (ext === ".json") return "json";
  if (ext === ".tsv") return "tsv";
  if (ext === ".txt") return "txt";
  return "csv";
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function ingestRow(statusRow, sourceMeta = {}) {
  const manualSourceId = SOURCE_TO_MANUAL[statusRow.source] || "";
  return {
    ingest_row_id: `exp-task-${statusRow.task_id}`,
    ingest_scope: "expansion_download_task",
    task_id: statusRow.task_id,
    manual_source_id: manualSourceId,
    provider: sourceMeta.provider || "",
    source_name: sourceMeta.source_name || statusRow.source_kind || "",
    download_url_or_page: statusRow.source_page_or_url || sourceMeta.download_url_or_page || "",
    expected_file_type: fileTypeFromPath(statusRow.local_path),
    local_path: statusRow.local_path || "",
    coverage_from: statusRow.coverage_from || "",
    coverage_to: statusRow.coverage_to || "",
    lawd_cd: statusRow.lawd_cd || "",
    district: statusRow.district || "",
    dong: statusRow.dong || "",
    geography: [statusRow.district, statusRow.dong, statusRow.lawd_cd].filter(Boolean).join(" / "),
    project_scope: statusRow.project_names || `확장권 baseline task ${statusRow.task_id}`,
    required_columns_note: sourceMeta.required_columns_note || "",
    downloaded_at: statusRow.downloaded_at || "",
    filter_applied: statusRow.filter_applied || "",
    status_note: `확장권 latest-window 수동 다운로드 파일 자동 반입; packet_rank=${statusRow.packet_rank || ""}; ${statusRow.phase_label || ""}`.trim(),
  };
}

function markdown(summary, rows) {
  return `# 확장권 시장 반입 manifest

작성 기준: ${UPDATED_AT}

이 문서는 확장권 latest-window 수동 다운로드 파일을 정규화 입력으로 넘기기 위한 task-level ingest manifest다. core 70개 수동 반입 manifest와 분리해서, 현재 내려받은 확장권 raw 파일만 별도 normalize 경로로 보낸다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 반입 행 | ${summary.ingest_row_count} |
| 파일 경로 설정 | ${summary.local_path_count} |
| downloaded_at 기록 | ${summary.downloaded_at_count} |
| source 분포 | ${summary.source_summary} |
| dong 분포 | ${summary.dong_summary} |

## 반입 대상

${mdTable(rows, [
  { key: "task_id", label: "task" },
  { key: "manual_source_id", label: "source ID" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "coverage_from", label: "시작" },
  { key: "coverage_to", label: "종료" },
  { key: "local_path", label: "파일" },
  { key: "downloaded_at", label: "downloaded_at" },
  { key: "project_scope", label: "대표 기준" },
])}

## 운영 규칙

1. 이 manifest는 \`file_ready_for_review\` 상태의 확장권 파일만 반입한다.
2. core ingest-manifest와 섞지 않고 \`expansion-ingest-manifest.json\`으로 따로 보관한다.
3. 다음 단계는 expansion 전용 normalized 산출물과 scope summary를 갱신하는 것이다.
`;
}

async function main() {
  const [sourceManifest, status] = await Promise.all([
    readJson(SOURCE_MANIFEST_INPUT, []),
    readJson(STATUS_INPUT, { rows: [] }),
  ]);
  const sourceMap = byManualSource(sourceManifest);
  const rows = (status.rows || [])
    .filter((row) => row.file_exists === "Y" && row.download_status === "file_ready_for_review")
    .map((row) => ingestRow(row, sourceMap.get(SOURCE_TO_MANUAL[row.source]) || {}));

  const sourceCounts = countBy(rows, "manual_source_id");
  const dongCounts = countBy(rows, "dong");
  const summary = {
    generated_at: UPDATED_AT,
    ingest_row_count: rows.length,
    local_path_count: rows.filter((row) => row.local_path).length,
    downloaded_at_count: rows.filter((row) => row.downloaded_at).length,
    source_counts: sourceCounts,
    source_summary: countText(sourceCounts),
    dong_counts: dongCounts,
    dong_summary: countText(dongCounts),
    source_manifest_input: SOURCE_MANIFEST_INPUT,
    status_input: STATUS_INPUT,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir("analysis", { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_ANALYSIS_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_ANALYSIS_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);
  console.log(JSON.stringify({
    rows: rows.length,
    dongs: Object.keys(dongCounts).length,
    output: "data/market/manual-import/expansion-ingest-manifest.json; analysis/expansion-market-ingest-manifest.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
