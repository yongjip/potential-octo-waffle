#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const WORKBOOK_INPUT = "analysis/market-manual-download-workbook.json";
const INTAKE_OUTPUT = "data/market/manual-import/download-intake.json";
const UPDATED_AT = "2026-06-23 KST";

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function byTaskId(rows) {
  return new Map((rows || []).map((row) => [row.task_id, row]));
}

function templateRow(task, existing = {}) {
  return {
    task_id: task.task_id,
    suggested_output_filename: task.suggested_output_filename || "",
    local_path: existing.local_path || "",
    downloaded_at: existing.downloaded_at || "",
    source_page_or_url: existing.source_page_or_url || task.official_page || "",
    filter_applied: existing.filter_applied || task.required_filter || "",
    operator_note: existing.operator_note || "",
    source: task.source || "",
    source_kind: task.source_kind || "",
    district: task.district || "",
    dong: task.dong || "",
    coverage_from: task.coverage_from || "",
    coverage_to: task.coverage_to || "",
    project_names: task.project_names || "",
  };
}

async function main() {
  const workbook = await readJson(WORKBOOK_INPUT, { rows: [] });
  const existing = await readJson(INTAKE_OUTPUT, { rows: [] });
  const existingByTask = byTaskId(existing.rows || []);
  const rows = (workbook.rows || []).map((task) => templateRow(task, existingByTask.get(task.task_id)));
  const orphanRows = (existing.rows || []).filter((row) => row.task_id && !rows.some((item) => item.task_id === row.task_id));
  const output = {
    updated_at: UPDATED_AT,
    notes: [
      "작업별 수동 다운로드 상태를 기록하는 입력 파일이다.",
      "analysis/market-manual-download-workbook.md의 suggested_output_filename 그대로 data/market/manual-import/files/에 저장하면 local_path를 비워도 상태 생성기가 파일을 감지한다.",
      "권장 파일명과 다르게 저장했거나 다운로드 시점·원문 페이지·필터 메모를 남기고 싶을 때 task_id별로 local_path/downloaded_at/operator_note를 채운다.",
      "이 파일은 원자료 자체를 저장하지 않는다. 공식 원본 파일은 data/market/manual-import/files/ 아래에 보관한다.",
      "scripts/sync-market-manual-download-intake.mjs는 기존 local_path/downloaded_at/operator_note를 보존하고 빠진 작업 템플릿만 보강한다.",
    ],
    rows,
    orphan_rows: orphanRows,
  };
  await mkdir(path.dirname(INTAKE_OUTPUT), { recursive: true });
  await writeFile(INTAKE_OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        workbookRows: workbook.rows?.length || 0,
        intakeRows: rows.length,
        orphanRows: orphanRows.length,
        output: INTAKE_OUTPUT,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
