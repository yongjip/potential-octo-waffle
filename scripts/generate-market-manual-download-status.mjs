#!/usr/bin/env node

import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const WORKBOOK_INPUT = "analysis/market-manual-download-workbook.json";
const INTAKE_INPUT = "data/market/manual-import/download-intake.json";
const FILE_DIR = "data/market/manual-import/files";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "market-manual-download-status.md");
const OUT_CSV = path.join(OUT_DIR, "market-manual-download-status.csv");
const OUT_JSON = path.join(OUT_DIR, "market-manual-download-status.json");

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
const VALID_EXTS = new Set([".csv", ".xlsx", ".json", ".txt", ".tsv"]);

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

function rowsByTaskId(intakeRows) {
  return new Map((intakeRows || []).map((row) => [row.task_id, row]));
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

function inferredPath(task) {
  if (!task.suggested_output_filename) return "";
  return path.join(FILE_DIR, task.suggested_output_filename);
}

function statusFor({ localPath, info, intake }) {
  if (!localPath) return "waiting_for_download";
  if (info.exists !== "Y") return "local_path_missing";
  if (info.ext && !VALID_EXTS.has(info.ext)) return "unsupported_extension_review_needed";
  if (!intake?.downloaded_at) return "download_date_missing";
  return "file_ready_for_column_audit";
}

function nextAction(status) {
  if (status === "waiting_for_download") return "공식 페이지에서 원자료를 내려받아 권장 파일명으로 files/에 저장하거나 intake local_path를 채운다.";
  if (status === "local_path_missing") return "intake local_path 또는 권장 파일명이 실제 파일을 가리키는지 확인한다.";
  if (status === "unsupported_extension_review_needed") return "CSV/XLSX/JSON/TXT/TSV 중 하나로 다시 받거나 별도 변환 경로를 만든다.";
  if (status === "download_date_missing") return "download-intake.json에 downloaded_at을 기록한다.";
  return "컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다.";
}

async function buildRows(workbookRows, intakeRows) {
  const byTask = rowsByTaskId(intakeRows);
  const rows = [];
  for (const task of workbookRows) {
    const intake = byTask.get(task.task_id) || {};
    const defaultPath = inferredPath(task);
    const defaultInfo = await fileInfo(defaultPath);
    const chosenPath = intake.local_path || (defaultInfo.exists === "Y" ? defaultPath : "");
    const info = await fileInfo(chosenPath);
    const status = statusFor({ localPath: chosenPath, info, intake });
    rows.push({
      task_id: task.task_id,
      manual_source_id: task.manual_source_id,
      source: task.source,
      source_kind: task.source_kind,
      district: task.district,
      dong: task.dong,
      coverage_from: task.coverage_from,
      coverage_to: task.coverage_to,
      project_count: task.project_count,
      suggested_output_filename: task.suggested_output_filename,
      inferred_path: defaultPath,
      local_path: chosenPath,
      file_exists: info.exists,
      file_bytes: info.bytes,
      file_ext: info.ext,
      downloaded_at: intake.downloaded_at || "",
      source_page_or_url: intake.source_page_or_url || task.official_page || "",
      filter_applied: intake.filter_applied || task.required_filter || "",
      download_status: status,
      next_action: nextAction(status),
      operator_note: intake.operator_note || "",
    });
  }
  return rows;
}

function markdown(rows, summary) {
  return `# 시장 원자료 수동 다운로드 상태

작성 기준: ${UPDATED_AT}

이 문서는 \`analysis/market-manual-download-workbook.md\`의 작업별로 실제 원자료 파일이 들어왔는지 점검한다. 권장 파일명 그대로 \`data/market/manual-import/files/\`에 저장하면 자동 감지하며, 파일명이 다르면 \`data/market/manual-import/download-intake.json\`에 \`task_id\`별 \`local_path\`를 채운다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 작업 | ${summary.task_count} |
| 파일 존재 | ${summary.file_present_count} |
| 컬럼 감사 후보 | ${summary.ready_or_date_needed_count} |
| 다운로드 대기 | ${summary.waiting_for_download_count} |
| 상태 분포 | ${summary.status_summary} |

## 상태표

${mdTable(rows, [
  { key: "task_id", label: "작업" },
  { key: "source_kind", label: "자료" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "coverage_from", label: "시작" },
  { key: "coverage_to", label: "종료" },
  { key: "file_exists", label: "파일" },
  { key: "file_ext", label: "확장자" },
  { key: "download_status", label: "상태" },
  { key: "next_action", label: "다음 액션" },
])}

## 파일 경로

${mdTable(rows, [
  { key: "task_id", label: "작업" },
  { key: "suggested_output_filename", label: "권장 파일명" },
  { key: "local_path", label: "감지/입력 경로" },
  { key: "source_page_or_url", label: "공식 페이지" },
  { key: "filter_applied", label: "필터" },
])}

## 운영 규칙

1. 이 상태표는 작업별 파일 존재 확인용이다. 정규화로 넘기기 전에는 source-level \`manifest.json\` 또는 후속 task-level 반입 경로와 연결해야 한다.
2. \`download_date_missing\`은 파일은 감지했지만 다운로드 시점을 기록하지 않은 상태다.
3. 원자료 파일 내용은 이 문서에 저장하지 않는다. 파일명, 크기, 확장자, 필터 메타데이터만 기록한다.
`;
}

async function main() {
  const workbook = await readJson(WORKBOOK_INPUT, { rows: [] });
  const intake = await readJson(INTAKE_INPUT, { rows: [] });
  const rows = await buildRows(workbook.rows || [], intake.rows || []);
  const statusCounts = countBy(rows, "download_status");
  const summary = {
    generated_at: UPDATED_AT,
    task_count: rows.length,
    file_present_count: rows.filter((row) => row.file_exists === "Y").length,
    waiting_for_download_count: rows.filter((row) => row.download_status === "waiting_for_download").length,
    ready_or_date_needed_count: rows.filter((row) => ["file_ready_for_column_audit", "download_date_missing"].includes(row.download_status)).length,
    status_counts: statusCounts,
    status_summary: countText(statusCounts),
    workbook_input: WORKBOOK_INPUT,
    intake_input: INTAKE_INPUT,
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(JSON.stringify({ tasks: rows.length, filePresent: summary.file_present_count, statusCounts, output: "analysis/market-manual-download-status.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
