#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_MANIFEST_INPUT = "data/market/manual-import/manifest.json";
const DOWNLOAD_STATUS_INPUT = "analysis/market-manual-download-status.json";
const OUT_DIR = "data/market/manual-import";
const OUT_JSON = path.join(OUT_DIR, "ingest-manifest.json");
const OUT_CSV = path.join(OUT_DIR, "ingest-manifest.csv");
const OUT_MD = "analysis/market-manual-ingest-manifest.md";
const OUT_ANALYSIS_CSV = "analysis/market-manual-ingest-manifest.csv";
const OUT_ANALYSIS_JSON = "analysis/market-manual-ingest-manifest.json";

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

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function byManualSource(rows) {
  return new Map(rows.map((row) => [row.manual_source_id, row]));
}

function fileTypeFromExt(ext) {
  if (ext === ".xlsx") return "xlsx";
  if (ext === ".json") return "json";
  if (ext === ".tsv") return "tsv";
  if (ext === ".txt") return "txt";
  return "csv";
}

function sourceLevelRows(sourceRows) {
  return sourceRows.map((row) => ({
    ingest_row_id: `source-${row.manual_source_id}`,
    ingest_scope: "source_manifest",
    task_id: "",
    manual_source_id: row.manual_source_id,
    provider: row.provider || "",
    source_name: row.source_name || "",
    download_url_or_page: row.download_url_or_page || "",
    expected_file_type: row.expected_file_type || "",
    local_path: row.local_path || "",
    coverage_from: row.coverage_from || "",
    coverage_to: row.coverage_to || "",
    lawd_cd: "",
    district: "",
    dong: "",
    geography: row.geography || "",
    project_scope: row.project_scope || "",
    required_columns_note: row.required_columns_note || "",
    downloaded_at: row.downloaded_at || "",
    filter_applied: "",
    status_note: row.status_note || "",
  }));
}

function taskRows(statusRows, sourceMap) {
  return statusRows
    .filter((row) => row.local_path && row.file_exists === "Y")
    .map((row) => {
      const source = sourceMap.get(row.manual_source_id) || {};
      return {
        ingest_row_id: `task-${row.task_id}`,
        ingest_scope: "download_task",
        task_id: row.task_id,
        manual_source_id: row.manual_source_id,
        provider: source.provider || "",
        source_name: row.source_kind || source.source_name || "",
        download_url_or_page: row.source_page_or_url || source.download_url_or_page || "",
        expected_file_type: fileTypeFromExt(row.file_ext),
        local_path: row.local_path,
        coverage_from: row.coverage_from || "",
        coverage_to: row.coverage_to || "",
        lawd_cd: row.lawd_cd || "",
        district: row.district || "",
        dong: row.dong || "",
        geography: [row.district, row.dong, row.lawd_cd].filter(Boolean).join(" / "),
        project_scope: `작업 ${row.task_id}; 대상 사업장 ${row.project_count || 0}개`,
        required_columns_note: source.required_columns_note || "",
        downloaded_at: row.downloaded_at || "",
        filter_applied: row.filter_applied || "",
        status_note:
          row.download_status === "download_date_missing"
            ? "작업별 파일은 감지됐지만 downloaded_at 기록 필요"
            : "작업별 다운로드 파일 자동 승격",
      };
    });
}

function markdown(summary, rows) {
  return `# 시장 원자료 수동 반입 manifest

작성 기준: ${UPDATED_AT}

이 문서는 4개 출처 단위 \`manifest.json\`과 70개 작업 단위 다운로드 상태를 합쳐 컬럼 감사/정규화가 실제로 읽을 반입 manifest를 만든다. 작업별 권장 파일명으로 저장된 파일이 있으면 task-level 행을 우선 사용하고, 아직 작업별 파일이 없으면 기존 source-level manifest를 그대로 유지한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 반입 행 | ${summary.ingest_row_count} |
| 작업별 파일 행 | ${summary.task_level_count} |
| 출처 manifest 행 | ${summary.source_level_count} |
| 파일 경로 설정 | ${summary.local_path_count} |
| downloaded_at 누락 | ${summary.downloaded_at_missing_count} |
| 범위 분포 | ${summary.scope_summary} |

## 반입 대상

${mdTable(rows, [
  { key: "ingest_row_id", label: "반입 ID" },
  { key: "ingest_scope", label: "범위" },
  { key: "task_id", label: "작업" },
  { key: "source_name", label: "자료" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "coverage_from", label: "시작" },
  { key: "coverage_to", label: "종료" },
  { key: "local_path", label: "파일" },
  { key: "status_note", label: "상태" },
])}

## 운영 규칙

1. \`download_task\` 행이 하나라도 있으면 컬럼 감사와 정규화는 작업별 파일을 읽는다.
2. 작업별 파일이 아직 없으면 기존 4개 출처 단위 manifest를 읽는다.
3. \`downloaded_at\` 누락은 정규화를 막지는 않지만, 최신성 추적을 위해 보완해야 한다.
`;
}

async function main() {
  const sourceRows = await readJson(SOURCE_MANIFEST_INPUT, []);
  const downloadStatus = await readJson(DOWNLOAD_STATUS_INPUT, { rows: [] });
  const sourceMap = byManualSource(sourceRows);
  const detectedTaskRows = taskRows(downloadStatus.rows || [], sourceMap);
  const rows = detectedTaskRows.length ? detectedTaskRows : sourceLevelRows(sourceRows);
  const scopeCounts = countBy(rows, "ingest_scope");
  const summary = {
    generated_at: UPDATED_AT,
    ingest_row_count: rows.length,
    task_level_count: rows.filter((row) => row.ingest_scope === "download_task").length,
    source_level_count: rows.filter((row) => row.ingest_scope === "source_manifest").length,
    local_path_count: rows.filter((row) => row.local_path).length,
    downloaded_at_missing_count: rows.filter((row) => row.local_path && !row.downloaded_at).length,
    scope_counts: scopeCounts,
    scope_summary: countText(scopeCounts),
    source_manifest_input: SOURCE_MANIFEST_INPUT,
    download_status_input: DOWNLOAD_STATUS_INPUT,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir("analysis", { recursive: true });
  const payload = { generated_at: UPDATED_AT, summary, rows };
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_ANALYSIS_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_ANALYSIS_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ rows: rows.length, taskLevel: summary.task_level_count, output: "data/market/manual-import/ingest-manifest.json" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
