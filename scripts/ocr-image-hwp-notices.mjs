#!/usr/bin/env node

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TEXT_MANIFEST_INPUT = "data/urban/text/notice-text-manifest.json";
const OCR_DIR = "data/urban/text/ocr";
const OCR_TEXT_DIR = path.join(OCR_DIR, "files");
const HWP_IMAGE_DIR = path.join(OCR_DIR, "hwp-images");
const OUT_JSON = path.join(OCR_DIR, "hwp-ocr-text-manifest.json");
const OUT_CSV = path.join(OCR_DIR, "hwp-ocr-text-manifest.csv");
const DEFAULT_NODE_MODULES = "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const DEFAULT_PYTHON = "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const NODE_MODULES = process.env.NODE_PATH || process.env.TESSERACT_NODE_MODULES || DEFAULT_NODE_MODULES;
const PYTHON = process.env.PYTHON || DEFAULT_PYTHON;

function parseArgs() {
  const args = new Map();
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args.set(match[1], match[2]);
    else if (arg.startsWith("--")) args.set(arg.slice(2), "true");
  }
  return args;
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

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function safeStem(row) {
  const notice = String(row.notice_code || "notice").replace(/[^A-Za-z0-9_-]+/g, "");
  const rank = String(row.rank || "").padStart(2, "0");
  const name = path.basename(row.source_file || "notice", path.extname(row.source_file || "notice")).replace(/[^\w가-힣._-]+/gu, "-");
  return `${rank}-${notice}-${name}`;
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

async function extractImages(row, stem, force) {
  const imageDir = path.join(ROOT, HWP_IMAGE_DIR, stem);
  const manifestPath = path.join(imageDir, "bindata-manifest.json");
  await mkdir(imageDir, { recursive: true });
  if (!force && (await exists(manifestPath))) {
    return JSON.parse(await readFile(manifestPath, "utf8"));
  }
  await run(PYTHON, [
    "scripts/extract_hwp_binaries.py",
    row.source_file,
    "--out-dir",
    imageDir,
    "--manifest",
    manifestPath,
  ]);
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

async function main() {
  const args = parseArgs();
  const force = args.has("force");
  const rankFilter = args.get("rank") ? new Set(String(args.get("rank")).split(",").map((item) => item.trim())) : null;
  const require = createRequire(import.meta.url);
  const { createWorker } = require(path.join(NODE_MODULES, "tesseract.js"));
  const manifestRows = JSON.parse(await readFile(TEXT_MANIFEST_INPUT, "utf8"));
  const targets = manifestRows
    .filter((row) => row.extraction_status === "hwp_text_low_confidence" && row.source_ext?.toLowerCase() === "hwp")
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
    logger: () => {},
  });

  try {
    for (const row of targets) {
      const stem = safeStem(row);
      const images = await extractImages(row, stem, force);
      const uniqueImages = images.filter((image) => !image.duplicate_of);
      const outTextPath = path.join(ROOT, OCR_TEXT_DIR, `${stem}.txt`);
      const pageTexts = [];
      let failedImage = "";
      for (const [index, image] of uniqueImages.entries()) {
        process.stderr.write(`OCR HWP rank ${row.rank} image ${index + 1}/${uniqueImages.length}\n`);
        try {
          const result = await worker.recognize(image.output_path);
          pageTexts.push(`\n\n--- HWP image OCR ${index + 1} ${image.stream_name} ---\n\n${compactText(result.data.text)}`);
        } catch (error) {
          failedImage = `${image.stream_name}: ${error.message}`;
          pageTexts.push(`\n\n--- HWP image OCR ${index + 1} failed ---\n\n`);
        }
      }
      const text = pageTexts.join("\n").trim();
      await writeFile(outTextPath, `${text}\n`, "utf8");
      rows.push({
        rank: row.rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        notice_code: row.notice_code,
        notice_no: row.notice_no,
        notice_date: row.notice_date,
        source_file: row.source_file,
        image_count: images.length,
        unique_image_count: uniqueImages.length,
        ocr_text_path: path.relative(ROOT, outTextPath),
        ocr_char_count: text.length,
        ocr_status: text.length > 0 && !failedImage ? "hwp_ocr_extracted" : text.length > 0 ? "hwp_ocr_partial" : "hwp_ocr_failed",
        ocr_error: failedImage,
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
        hwpOcrExtracted: rows.filter((row) => row.ocr_status === "hwp_ocr_extracted").length,
        hwpOcrPartial: rows.filter((row) => row.ocr_status === "hwp_ocr_partial").length,
        output: "data/urban/text/ocr/hwp-ocr-text-manifest.{csv,json}",
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
