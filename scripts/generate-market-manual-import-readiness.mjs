#!/usr/bin/env node

import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "market-manual-import-readiness.md");
const OUT_CSV = path.join(OUT_DIR, "market-manual-import-readiness.csv");
const OUT_JSON = path.join(OUT_DIR, "market-manual-import-readiness.json");

const MANIFEST_INPUT = "data/market/manual-import/manifest.json";
const MARKET_AREAS_INPUT = "data/market/project-market-areas.json";

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
const VALID_EXTS = new Set([".csv", ".xlsx", ".xls", ".json"]);

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

async function fileInfo(file) {
  if (!file) return { exists: "N", bytes: 0, ext: "", readable: "N" };
  try {
    await access(file);
    const info = await stat(file);
    return { exists: "Y", bytes: info.size, ext: path.extname(file).toLowerCase(), readable: "Y" };
  } catch (error) {
    if (error.code === "ENOENT") return { exists: "N", bytes: 0, ext: path.extname(file).toLowerCase(), readable: "N" };
    throw error;
  }
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "(blank)";
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

function missingMeta(row) {
  const required = ["provider", "source_name", "download_url_or_page", "coverage_from", "coverage_to", "geography", "project_scope"];
  return required.filter((field) => !String(row[field] || "").trim());
}

function readiness(row, info, metaMissing) {
  if (!row.local_path) return "waiting_for_manual_download";
  if (info.exists !== "Y") return "local_path_missing";
  if (!VALID_EXTS.has(info.ext)) return "unsupported_extension_review_needed";
  if (metaMissing.length) return "metadata_incomplete";
  if (!row.downloaded_at) return "download_date_missing";
  return "ready_for_normalization_mapping";
}

async function buildRows(manifestRows) {
  const rows = [];
  for (const row of manifestRows) {
    const info = await fileInfo(row.local_path);
    const metaMissing = missingMeta(row);
    const status = readiness(row, info, metaMissing);
    rows.push({
      manual_source_id: row.manual_source_id,
      provider: row.provider,
      source_name: row.source_name,
      expected_file_type: row.expected_file_type,
      local_path: row.local_path,
      file_exists: info.exists,
      file_bytes: info.bytes,
      file_ext: info.ext,
      coverage_from: row.coverage_from,
      coverage_to: row.coverage_to,
      geography: row.geography,
      project_scope: row.project_scope,
      downloaded_at: row.downloaded_at,
      readiness_status: status,
      missing_metadata: metaMissing.join("; "),
      next_action: nextAction(status),
      download_url_or_page: row.download_url_or_page,
      required_columns_note: row.required_columns_note,
      status_note: row.status_note,
    });
  }
  return rows;
}

function nextAction(status) {
  if (status === "waiting_for_manual_download") return "공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다.";
  if (status === "local_path_missing") return "manifest local_path가 실제 파일을 가리키는지 확인한다.";
  if (status === "unsupported_extension_review_needed") return "CSV/XLSX/XLS/JSON 중 하나로 내려받거나 별도 파서를 만든다.";
  if (status === "metadata_incomplete") return "manifest의 출처·기간·지리 범위 메타데이터를 채운다.";
  if (status === "download_date_missing") return "downloaded_at에 다운로드 날짜와 기준 시각을 기록한다.";
  return "후속 정규화 매핑에서 컬럼명을 official-transactions-normalized 스키마에 연결한다.";
}

function markdown(summary, rows) {
  return `# 시장 원자료 수동 반입 준비도

작성 기준: ${UPDATED_AT}

API 키가 없어도 공식 사이트에서 내려받은 CSV/XLSX 원자료를 추적하기 위한 manifest 감사표다. 이 문서는 파일을 정규화하지 않고, 수동 원자료가 공식 출처·기간·지역·파일 경로까지 갖춰졌는지 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | ${summary.manifest_count} |
| 파일 존재 | ${summary.file_present_count} |
| 정규화 매핑 준비 | ${summary.ready_for_normalization_count} |
| 다운로드 대기 | ${summary.waiting_for_download_count} |
| 대상 사업장 | ${summary.project_count} |
| 상태 분포 | ${summary.readiness_summary} |

## 수동 반입 체크리스트

1. 공식 페이지에서 원자료를 내려받는다.
2. \`analysis/market-manual-download-workbook.md\`에서 대상 지역·기간·키워드와 권장 파일명을 확인한다.
3. 원본 파일을 \`data/market/manual-import/files/\`에 둔다.
4. \`data/market/manual-import/manifest.json\`의 \`local_path\`, \`downloaded_at\`, \`coverage_from\`, \`coverage_to\`, \`download_url_or_page\`를 채운다.
5. 이 스크립트를 다시 실행한다.
6. \`python3 scripts/generate-market-manual-column-audit.py\`로 컬럼명과 필수 필드 매칭 후보를 확인한다.
7. 상태가 \`ready_for_normalization_mapping\`이고 컬럼 감사가 통과하면 정규화 스크립트로 넘긴다.

## 출처별 상태

${mdTable(rows, [
  { key: "manual_source_id", label: "ID" },
  { key: "provider", label: "제공기관" },
  { key: "source_name", label: "자료" },
  { key: "local_path", label: "파일" },
  { key: "file_exists", label: "존재" },
  { key: "file_ext", label: "확장자" },
  { key: "coverage_from", label: "시작" },
  { key: "coverage_to", label: "종료" },
  { key: "readiness_status", label: "상태" },
  { key: "next_action", label: "다음 액션" },
])}

## 공식 다운로드 페이지

${mdTable(rows, [
  { key: "manual_source_id", label: "ID" },
  { key: "download_url_or_page", label: "공식 페이지" },
  { key: "required_columns_note", label: "필요 컬럼" },
])}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [manifestRows, marketRows] = await Promise.all([readJson(MANIFEST_INPUT), readJson(MARKET_AREAS_INPUT)]);
  const rows = await buildRows(manifestRows);
  const statusCounts = countBy(rows, "readiness_status");
  const summary = {
    generated_at: UPDATED_AT,
    manifest_count: rows.length,
    file_present_count: rows.filter((row) => row.file_exists === "Y").length,
    ready_for_normalization_count: rows.filter((row) => row.readiness_status === "ready_for_normalization_mapping").length,
    waiting_for_download_count: rows.filter((row) => row.readiness_status === "waiting_for_manual_download").length,
    project_count: marketRows.length,
    readiness_counts: statusCounts,
    readiness_summary: countText(statusCounts),
    manifest_input: MANIFEST_INPUT,
  };
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(summary, rows), "utf8");
  console.log(
    JSON.stringify(
      {
        manifestRows: rows.length,
        filePresent: summary.file_present_count,
        readyForNormalization: summary.ready_for_normalization_count,
        waitingForDownload: summary.waiting_for_download_count,
        output: "analysis/market-manual-import-readiness.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
