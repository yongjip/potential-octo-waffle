#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_TASKS_FILE = "analysis/market-manual-download-workbook.json";
const DEFAULT_TASKS_KEY = "rows";
const DEFAULT_INTAKE_FILE = "data/market/manual-import/download-intake.json";
const DEFAULT_FILE_DIR = "data/market/manual-import/files";
const BASE_URL = "https://rt.molit.go.kr";
const LANDING_URL = `${BASE_URL}/pt/xls/xls.do?mobileAt=`;
const CHECK_URL = `${BASE_URL}/pt/xls/ptXlsDownDataCheck.do`;
const CSV_URL = `${BASE_URL}/pt/xls/ptXlsCSVDown.do`;
const UPDATED_AT = "2026-06-23 KST";

const SOURCE_CONFIG = {
  "molit-apt-trade": { thing: "A", deal: "1", label: "아파트 매매" },
  "molit-apt-rent": { thing: "A", deal: "2", label: "아파트 전월세" },
  "molit-rowhouse-trade": { thing: "B", deal: "1", label: "연립다세대 매매" },
  "molit-rowhouse-rent": { thing: "B", deal: "2", label: "연립다세대 전월세" },
};

const DISTRICT = {
  "11680": "강남구",
  "11710": "송파구",
  "11215": "광진구",
  "11740": "강동구",
  "11140": "중구",
  "11200": "성동구",
};

function usage() {
  return `Usage: node scripts/fetch-rtms-manual-tasks.mjs [--sources=molit-apt-trade,...] [--years=2024,2025,2026] [--task-ids=id1,id2] [--dry-run]
  [--tasks-file=analysis/market-manual-download-workbook.json] [--tasks-key=rows]
  [--intake=data/market/manual-import/download-intake.json]
  [--file-dir=data/market/manual-import/files] [--cache-dir=data/market/manual-import/files/_source-cache]

Downloads official RTMS 자료제공 CSV files for the matching manual workbook tasks,
cleans the notice preamble, filters to target dongs, and updates download-intake.json.
`;
}

function parseArgs(argv) {
  const args = {
    sources: [],
    years: [],
    taskIds: [],
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
    else if (arg.startsWith("--sources=")) args.sources = arg.slice("--sources=".length).split(",").map((item) => item.trim()).filter(Boolean);
    else if (arg.startsWith("--years=")) args.years = arg.slice("--years=".length).split(",").map((item) => item.trim()).filter(Boolean);
    else if (arg.startsWith("--task-ids=")) args.taskIds = arg.slice("--task-ids=".length).split(",").map((item) => item.trim()).filter(Boolean);
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("--tasks-file=")) args.tasksFile = arg.slice("--tasks-file=".length).trim();
    else if (arg.startsWith("--tasks-key=")) args.tasksKey = arg.slice("--tasks-key=".length).trim();
    else if (arg.startsWith("--intake=")) args.intake = arg.slice("--intake=".length).trim();
    else if (arg.startsWith("--file-dir=")) args.fileDir = arg.slice("--file-dir=".length).trim();
    else if (arg.startsWith("--cache-dir=")) args.cacheDir = arg.slice("--cache-dir=".length).trim();
    else throw new Error(`Unknown argument: ${arg}\n${usage()}`);
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
  return [headers.map(csvEscape).join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header] ?? "")).join(","))].join("\n") + "\n";
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
  const headers = csvRows[0].map((item) => String(item || "").trim());
  return {
    headers,
    rows: csvRows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))),
  };
}

function extractCookie(headers) {
  const cookie = headers.get("set-cookie") || "";
  return cookie
    .split(/,(?=[^;,]+=)/)
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

function mergeCookie(existing, next) {
  const map = new Map();
  for (const source of [existing, next]) {
    for (const part of String(source || "").split(";")) {
      const text = part.trim();
      if (!text || !text.includes("=")) continue;
      const [key, ...rest] = text.split("=");
      map.set(key, rest.join("="));
    }
  }
  return [...map.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

function yearFromTask(task) {
  return String(task.coverage_from || "").slice(0, 4);
}

function dateRange(task) {
  const year = yearFromTask(task);
  if (year === "2026") return { from: "2026-01-01", to: "2026-06-30" };
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function dongs(task) {
  return String(task.dong || "").split(";").map((item) => item.trim()).filter(Boolean);
}

function formForTask(task) {
  const config = SOURCE_CONFIG[task.source];
  const range = dateRange(task);
  const sggNm = DISTRICT[task.lawd_cd] || task.district || "";
  return new URLSearchParams({
    srhThingNo: config.thing,
    srhDelngSecd: config.deal,
    srhAddrGbn: "1",
    srhLfstsSecd: "1",
    sidoNm: "서울특별시",
    sggNm,
    emdNm: "전체",
    loadNm: "전체",
    areaNm: "전체",
    hsmpNm: "전체",
    mobileAt: "",
    srhFromDt: range.from,
    srhToDt: range.to,
    srhNewRonSecd: "",
    srhSidoCd: "11000",
    srhSggCd: task.lawd_cd || "",
    srhEmdCd: "",
    srhRoadNm: "",
    srhLoadCd: "",
    srhHsmpCd: "",
    srhArea: "",
    srhFromAmount: "",
    srhToAmount: "",
    srhLrArea: "",
  });
}

function decodeKoreanCsv(bytes) {
  for (const encoding of ["euc-kr", "utf-8"]) {
    try {
      return new TextDecoder(encoding).decode(bytes);
    } catch {
      // try next
    }
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function cleanRtmsCsv(text) {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.includes('"NO"') && line.includes('"시군구"'));
  if (headerIndex < 0) throw new Error("RTMS CSV header row not found.");
  return lines.slice(headerIndex).join("\n");
}

function filterByDongs(rows, task) {
  const wanted = dongs(task);
  if (!wanted.length) return rows;
  return rows.filter((row) => {
    const address = row["시군구"] || "";
    return wanted.some((dong) => address.includes(dong));
  });
}

function updateIntakeRows(intakeRows, task, localPath, downloadedAt, rowCount, sourceCount) {
  return intakeRows.map((row) => {
    if (row.task_id !== task.task_id) return row;
    return {
      ...row,
      local_path: localPath,
      downloaded_at: row.downloaded_at || downloadedAt,
      source_page_or_url: row.source_page_or_url || LANDING_URL,
      filter_applied: row.filter_applied || task.required_filter || "",
      operator_note: [row.operator_note, `auto_downloaded_from_official_rtms_csv; source_rows=${sourceCount}; filtered_rows=${rowCount}; generated_at=${UPDATED_AT}`]
        .filter(Boolean)
        .join(" | "),
    };
  });
}

async function openSession() {
  const response = await fetch(LANDING_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`RTMS landing failed: HTTP ${response.status}`);
  await response.text();
  return extractCookie(response.headers);
}

async function postText(url, body, cookie) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
      Referer: LANDING_URL,
      Cookie: cookie,
    },
    body,
  });
  const nextCookie = extractCookie(response.headers);
  const mergedCookie = mergeCookie(cookie, nextCookie);
  if (!response.ok) throw new Error(`${url} failed: HTTP ${response.status}`);
  return { response, cookie: mergedCookie };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const tasksPayload = await readTasks(args.tasksFile, args.tasksKey);
  const intake = await readJson(args.intake);
  const selectedSources = new Set(args.sources.length ? args.sources : Object.keys(SOURCE_CONFIG));
  const selectedYears = new Set(args.years);
  const selectedTaskIds = new Set(args.taskIds);
  const tasks = tasksPayload.filter((task) =>
    SOURCE_CONFIG[task.source] &&
    selectedSources.has(task.source) &&
    (!selectedYears.size || selectedYears.has(yearFromTask(task))) &&
    (!selectedTaskIds.size || selectedTaskIds.has(task.task_id)),
  );
  if (!tasks.length) throw new Error("No RTMS tasks selected.");

  const intakeRowsInitial = intake.rows || [];
  const intakeTaskIds = new Set(intakeRowsInitial.map((row) => row.task_id));
  for (const task of tasks) {
    if (!intakeTaskIds.has(task.task_id)) {
      throw new Error(`${args.intake} is missing task_id ${task.task_id}. Sync or regenerate the intake first.`);
    }
  }

  const fileDir = args.fileDir;
  const cacheDir = args.cacheDir;
  if (args.dryRun) {
    console.log(JSON.stringify({
      mode: "dry_run",
      tasks_file: args.tasksFile,
      tasks_key: args.tasksKey,
      intake_file: args.intake,
      file_dir: fileDir,
      cache_dir: cacheDir,
      sources: [...selectedSources],
      years: selectedYears.size ? [...selectedYears].sort() : [...new Set(tasks.map(yearFromTask))].sort(),
      task_count: tasks.length,
      task_ids: tasks.map((task) => task.task_id),
      outputs: tasks.map((task) => ({
        task_id: task.task_id,
        source: task.source,
        district: task.district,
        dong: task.dong,
        lawd_cd: task.lawd_cd || "",
        year: yearFromTask(task),
        output: path.join(fileDir, task.suggested_output_filename),
      })),
    }, null, 2));
    return;
  }

  await mkdir(fileDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });

  let cookie = await openSession();
  let intakeRows = intakeRowsInitial;
  const downloadedAt = new Date().toISOString();
  const outputs = [];

  for (const task of tasks) {
    const body = formForTask(task);
    const check = await postText(CHECK_URL, body, cookie);
    cookie = check.cookie;
    const checkJson = JSON.parse(await check.response.text());
    const count = Number(checkJson.cnt || 0);
    const csv = await postText(CSV_URL, body, cookie);
    cookie = csv.cookie;
    const bytes = Buffer.from(await csv.response.arrayBuffer());
    const text = decodeKoreanCsv(bytes);
    const cachePath = path.join(cacheDir, `${task.task_id}_official_rtms.csv`);
    await writeFile(cachePath, text, "utf8");
    const cleaned = cleanRtmsCsv(text);
    const parsed = rowsToObjects(parseCsv(cleaned));
    const filteredRows = filterByDongs(parsed.rows, task);
    const localPath = path.join(fileDir, task.suggested_output_filename);
    await writeFile(localPath, toCsv(filteredRows, parsed.headers), "utf8");
    intakeRows = updateIntakeRows(intakeRows, task, localPath, downloadedAt, filteredRows.length, parsed.rows.length);
    outputs.push({
      task_id: task.task_id,
      source: task.source,
      district: task.district,
      year: yearFromTask(task),
      data_check_count: count,
      source_rows: parsed.rows.length,
      filtered_rows: filteredRows.length,
      output: localPath,
    });
  }

  await writeFile(args.intake, `${JSON.stringify({ ...intake, rows: intakeRows }, null, 2)}\n`);

  console.log(JSON.stringify({
    source: "국토교통부 실거래가 공개시스템 조건별 자료제공 CSV",
    tasks_file: args.tasksFile,
    tasks_key: args.tasksKey,
    intake_file: args.intake,
    tasks: outputs.length,
    source_rows: outputs.reduce((sum, row) => sum + row.source_rows, 0),
    filtered_rows: outputs.reduce((sum, row) => sum + row.filtered_rows, 0),
    zero_row_tasks: outputs.filter((row) => row.filtered_rows === 0).length,
    outputs,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
