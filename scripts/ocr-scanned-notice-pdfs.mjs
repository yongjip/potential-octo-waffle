#!/usr/bin/env node

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TEXT_MANIFEST_INPUT = "data/urban/text/notice-text-manifest.json";
const OCR_DIR = "data/urban/text/ocr";
const OCR_TEXT_DIR = path.join(OCR_DIR, "files");
const OCR_IMAGE_DIR = path.join(OCR_DIR, "images");
const OUT_JSON = path.join(OCR_DIR, "ocr-text-manifest.json");
const OUT_CSV = path.join(OCR_DIR, "ocr-text-manifest.csv");
const DEFAULT_NODE_MODULES = "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const DEFAULT_PDFTOPPM = "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pdftoppm";
const NODE_MODULES = process.env.NODE_PATH || process.env.TESSERACT_NODE_MODULES || DEFAULT_NODE_MODULES;
const PDFTOPPM = process.env.PDFTOPPM || DEFAULT_PDFTOPPM;

function parseArgs() {
  const args = new Map();
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
    else if (arg.startsWith("--")) args.set(arg.slice(2), "true");
  }
  return args;
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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

function safeStem(row) {
  const notice = String(row.notice_code || "notice").replace(/[^A-Za-z0-9_-]+/g, "");
  const rankValue = String(row.rank || "").trim();
  const rank = rankValue ? rankValue.padStart(2, "0") : "";
  const shortlist = String(row.shortlist_id || "").replace(/[^\w가-힣._-]+/gu, "-");
  const idPart = rank || shortlist || "00";
  const name = path.basename(row.source_file || "notice", path.extname(row.source_file || "notice")).replace(/[^\w가-힣._-]+/gu, "-");
  return `${idPart}-${notice}-${name}`;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} exited ${code}: ${stderr || stdout}`));
    });
  });
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function renderPages(row, stem, dpi, force) {
  const sourceFile = path.join(ROOT, row.source_file);
  const imageDir = path.join(ROOT, OCR_IMAGE_DIR, stem);
  await mkdir(imageDir, { recursive: true });
  const prefix = path.join(imageDir, "page");
  const existing = (await exists(imageDir) ? await readdir(imageDir) : []).filter((name) => /^page-\d+\.png$/.test(name)).sort();
  if (!force && existing.length >= Number(row.page_count || 0) && existing.length > 0) {
    return existing.map((name) => path.join(imageDir, name));
  }
  await run(PDFTOPPM, ["-png", "-r", String(dpi), sourceFile, prefix]);
  return (await readdir(imageDir))
    .filter((name) => /^page-\d+\.png$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0))
    .map((name) => path.join(imageDir, name));
}

async function main() {
  const args = parseArgs();
  const rankFilter = args.get("rank") ? new Set(String(args.get("rank")).split(",").map((item) => item.trim())) : null;
  const dpi = Number(args.get("dpi") || 200);
  const force = args.has("force");
  const require = createRequire(import.meta.url);
  const { createWorker } = require(path.join(NODE_MODULES, "tesseract.js"));
  const manifestRows = JSON.parse(await readFile(TEXT_MANIFEST_INPUT, "utf8"));
  const targets = manifestRows
    .filter((row) => row.extraction_status === "scanned_pdf_or_image_only" && row.source_ext?.toLowerCase() === "pdf")
    .filter((row) => !rankFilter || rankFilter.has(String(row.rank)));
  const rows = [];

  await mkdir(path.join(ROOT, OCR_TEXT_DIR), { recursive: true });
  await mkdir(path.join(ROOT, OCR_DIR), { recursive: true });

  if (!targets.length) {
    await writeFile(path.join(ROOT, OUT_JSON), "[]\n");
    await writeFile(path.join(ROOT, OUT_CSV), "");
    console.log(JSON.stringify({ targets: 0, output: OUT_JSON }, null, 2));
    return;
  }

  const worker = await createWorker("kor+eng", undefined, {
    cachePath: path.join(ROOT, OCR_DIR, "tessdata-cache"),
    logger: (message) => {
      if (message.status === "recognizing text") {
        const pct = Math.round((message.progress || 0) * 100);
        if (pct % 25 === 0) process.stderr.write(`recognizing ${pct}%\n`);
      }
    },
  });

  try {
    for (const row of targets) {
      const stem = safeStem(row);
      const outTextPath = path.join(ROOT, OCR_TEXT_DIR, `${stem}.txt`);
      const relativeTextPath = path.relative(ROOT, outTextPath);
      const images = await renderPages(row, stem, dpi, force);
      const pageTexts = [];
      let failedPage = "";
      for (const [index, image] of images.entries()) {
        process.stderr.write(`OCR rank ${row.rank} page ${index + 1}/${images.length}\n`);
        try {
          const result = await worker.recognize(image);
          pageTexts.push(`\n\n--- OCR page ${index + 1} ---\n\n${compactText(result.data.text)}`);
        } catch (error) {
          failedPage = `page ${index + 1}: ${error.message}`;
          pageTexts.push(`\n\n--- OCR page ${index + 1} failed ---\n\n`);
        }
      }
      const text = pageTexts.join("\n").trim();
      await writeFile(outTextPath, `${text}\n`, "utf8");
      rows.push({
        shortlist_id: row.shortlist_id,
        rank: row.rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        notice_code: row.notice_code,
        notice_no: row.notice_no,
        notice_date: row.notice_date,
        source_file: row.source_file,
        page_count: images.length,
        ocr_text_path: relativeTextPath,
        ocr_char_count: text.length,
        ocr_status: text.length > 0 && !failedPage ? "ocr_extracted" : text.length > 0 ? "ocr_partial" : "ocr_failed",
        ocr_error: failedPage,
      });
    }
  } finally {
    await worker.terminate();
  }

  await writeFile(path.join(ROOT, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(ROOT, OUT_CSV), toCsv(rows));
  console.log(
    JSON.stringify(
      {
        targets: targets.length,
        ocrExtracted: rows.filter((row) => row.ocr_status === "ocr_extracted").length,
        ocrPartial: rows.filter((row) => row.ocr_status === "ocr_partial").length,
        output: "data/urban/text/ocr/ocr-text-manifest.{csv,json}",
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
