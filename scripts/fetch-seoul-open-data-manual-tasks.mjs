#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_TASKS_FILE = "analysis/market-manual-download-workbook.json";
const DEFAULT_TASKS_KEY = "rows";
const DEFAULT_INTAKE_FILE = "data/market/manual-import/download-intake.json";
const DEFAULT_FILE_DIR = "data/market/manual-import/files";
const DOWNLOAD_URL = "https://datafile.seoul.go.kr/bigfile/iot/sheet/csv/download.do";
const SOURCE_PAGE = "https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do";
const UPDATED_AT = "2026-06-23 KST";

function usage() {
  return `Usage: node scripts/fetch-seoul-open-data-manual-tasks.mjs [--years=2024,2025,2026] [--task-ids=id1,id2] [--cache-only] [--dry-run]
  [--tasks-file=analysis/market-manual-download-workbook.json] [--tasks-key=rows]
  [--intake=data/market/manual-import/download-intake.json]
  [--file-dir=data/market/manual-import/files] [--cache-dir=data/market/manual-import/files/_source-cache]

Downloads official Seoul Open Data Sheet CSVs for OA-21275 by receipt year, splits them
into the selected seoul-open-data tasks, and updates the chosen intake metadata.
`;
}

function parseArgs(argv) {
  const args = {
    years: [],
    taskIds: [],
    cacheOnly: false,
    dryRun: false,
    help: false,
    tasksFile: DEFAULT_TASKS_FILE,
    tasksKey: DEFAULT_TASKS_KEY,
    intake: DEFAULT_INTAKE_FILE,
    fileDir: DEFAULT_FILE_DIR,
    cacheDir: path.join(DEFAULT_FILE_DIR, "_source-cache"),
  };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--cache-only") args.cacheOnly = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("--years=")) {
      args.years = arg.slice("--years=".length).split(",").map((item) => item.trim()).filter(Boolean);
    } else if (arg.startsWith("--task-ids=")) {
      args.taskIds = arg.slice("--task-ids=".length).split(",").map((item) => item.trim()).filter(Boolean);
    } else if (arg.startsWith("--tasks-file=")) {
      args.tasksFile = arg.slice("--tasks-file=".length).trim();
    } else if (arg.startsWith("--tasks-key=")) {
      args.tasksKey = arg.slice("--tasks-key=".length).trim();
    } else if (arg.startsWith("--intake=")) {
      args.intake = arg.slice("--intake=".length).trim();
    } else if (arg.startsWith("--file-dir=")) {
      args.fileDir = arg.slice("--file-dir=".length).trim();
    } else if (arg.startsWith("--cache-dir=")) {
      args.cacheDir = arg.slice("--cache-dir=".length).trim();
    } else {
      throw new Error(`Unknown argument: ${arg}\n${usage()}`);
    }
  }
  return args;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readTasks(file, key) {
  const payload = await readJson(file);
  const rows = payload?.[key];
  if (!Array.isArray(rows)) {
    throw new Error(`Task payload ${file} does not contain array key "${key}".`);
  }
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows, headers) {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header] ?? "")).join(",")),
  ].join("\n") + "\n";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => String(value).trim()));
}

function rowsToObjects(csvRows) {
  if (!csvRows.length) return { headers: [], rows: [] };
  const headers = csvRows[0].map((header) => String(header || "").trim());
  return {
    headers,
    rows: csvRows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))),
  };
}

function yearFromTask(task) {
  return String(task.coverage_from || "").slice(0, 4);
}

function byTaskId(rows) {
  return new Map(rows.map((row) => [row.task_id, row]));
}

function buildBody(year) {
  return new URLSearchParams({
    srvType: "S",
    infId: "OA-21275",
    serviceKind: "0",
    pageNo: "1",
    ssUserId: "SAMPLE_VIEW",
    strWhere: "",
    strOrderby: "CTRT_DAY DESC",
    filterCol: "RCPT_YR",
    txtFilter: year,
  });
}

async function downloadYear(year) {
  const response = await fetch(DOWNLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 seoul-redevelopment-research/1.0",
      Referer: SOURCE_PAGE,
    },
    body: buildBody(year),
  });
  if (!response.ok) {
    throw new Error(`Seoul Open Data download failed for ${year}: HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const text = new TextDecoder("euc-kr").decode(bytes);
  return { bytes, text };
}

function hasErrorPage(text) {
  return /URL 오류 안내|서비스 종료 안내|오류|error/i.test(text.slice(0, 1000)) && !text.includes("접수연도");
}

function filterRows(rows, task) {
  const filterText = String(task.required_filter || "");
  const likeMatch = filterText.match(/법정동(?:명)?\s+like\s+([가-힣0-9]+)%/i);
  const dongPrefix = likeMatch ? likeMatch[1] : "";
  return rows.filter((row) => {
    if (row["자치구명"] !== task.district) return false;
    if (row["접수연도"] !== yearFromTask(task)) return false;
    const legalDong = row["법정동명"] || "";
    if (dongPrefix) return legalDong.startsWith(dongPrefix);
    return legalDong === task.dong;
  });
}

function updateIntakeRows(intakeRows, task, localPath, downloadedAt, rowCount) {
  return intakeRows.map((row) => {
    if (row.task_id !== task.task_id) return row;
    return {
      ...row,
      local_path: localPath,
      downloaded_at: row.downloaded_at || downloadedAt,
      source_page_or_url: row.source_page_or_url || SOURCE_PAGE,
      filter_applied: row.filter_applied || task.required_filter || "",
      operator_note: [row.operator_note, `auto_split_from_official_seoul_sheet_csv; rows=${rowCount}; generated_at=${UPDATED_AT}`]
        .filter(Boolean)
        .join(" | "),
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const tasks = (await readTasks(args.tasksFile, args.tasksKey)).filter((row) => row.source === "seoul-open-data");
  const intake = await readJson(args.intake);
  const wantedTaskIds = new Set(args.taskIds);
  const wantedYears = new Set(args.years.length ? args.years : [...new Set(tasks.map(yearFromTask))].sort());
  const selectedTasks = tasks.filter(
    (task) => wantedYears.has(yearFromTask(task)) && (!wantedTaskIds.size || wantedTaskIds.has(task.task_id)),
  );
  if (!selectedTasks.length) throw new Error("No seoul-open-data tasks selected.");

  const fileDir = args.fileDir;
  const cacheDir = args.cacheDir;
  const intakeRowsInitial = intake.rows || [];
  const intakeTaskIds = byTaskId(intakeRowsInitial);
  for (const task of selectedTasks) {
    if (!intakeTaskIds.has(task.task_id)) {
      throw new Error(`${args.intake} is missing task_id ${task.task_id}. Sync or regenerate the intake first.`);
    }
  }

  if (args.dryRun) {
    console.log(JSON.stringify({
      mode: "dry_run",
      tasks_file: args.tasksFile,
      tasks_key: args.tasksKey,
      intake_file: args.intake,
      file_dir: fileDir,
      cache_dir: cacheDir,
      years: [...wantedYears].sort(),
      task_count: selectedTasks.length,
      task_ids: selectedTasks.map((task) => task.task_id),
      outputs: selectedTasks.map((task) => ({
        task_id: task.task_id,
        year: yearFromTask(task),
        district: task.district,
        dong: task.dong,
        output: path.join(fileDir, task.suggested_output_filename),
      })),
      would_update_intake: !args.cacheOnly,
    }, null, 2));
    return;
  }

  await mkdir(fileDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });

  const downloadedAt = new Date().toISOString();
  const rowsByYear = new Map();
  const sourceSummaries = [];

  for (const year of [...wantedYears].sort()) {
    const { bytes, text } = await downloadYear(year);
    if (hasErrorPage(text)) throw new Error(`Seoul Open Data download returned an error-like response for ${year}`);
    const cachePath = path.join(cacheDir, `seoul-open-data_OA-21275_${year}_official.csv`);
    await writeFile(cachePath, text, "utf8");
    const parsed = rowsToObjects(parseCsv(text));
    rowsByYear.set(year, parsed);
    sourceSummaries.push({ year, bytes: bytes.length, utf8_cache_path: cachePath, row_count: parsed.rows.length });
  }

  let intakeRows = intakeRowsInitial;
  for (const task of selectedTasks) {
    const parsed = rowsByYear.get(yearFromTask(task));
    const rows = filterRows(parsed.rows, task);
    const localPath = path.join(fileDir, task.suggested_output_filename);
    if (!args.cacheOnly) {
      await writeFile(localPath, toCsv(rows, parsed.headers), "utf8");
      intakeRows = updateIntakeRows(intakeRows, task, localPath, downloadedAt, rows.length);
    }
  }

  if (!args.cacheOnly) {
    await writeFile(args.intake, `${JSON.stringify({ ...intake, rows: intakeRows }, null, 2)}\n`);
  }

  const taskOutputs = selectedTasks.map((task) => {
    const parsed = rowsByYear.get(yearFromTask(task));
    const rows = filterRows(parsed.rows, task);
    return {
      task_id: task.task_id,
      year: yearFromTask(task),
      district: task.district,
      dong: task.dong,
      rows: rows.length,
      output: args.cacheOnly ? "" : path.join(fileDir, task.suggested_output_filename),
    };
  });

  console.log(JSON.stringify({
    source: "서울 열린데이터광장 OA-21275 Sheet CSV",
    tasks_file: args.tasksFile,
    tasks_key: args.tasksKey,
    intake_file: args.intake,
    source_page: SOURCE_PAGE,
    years: [...wantedYears].sort(),
    source_files: sourceSummaries,
    task_files_written: args.cacheOnly ? 0 : taskOutputs.length,
    task_rows_total: taskOutputs.reduce((sum, row) => sum + row.rows, 0),
    zero_row_tasks: taskOutputs.filter((row) => row.rows === 0).length,
    intake_updated: !args.cacheOnly,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
