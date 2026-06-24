#!/usr/bin/env node

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_NODE_MODULES = "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const DEFAULT_PDFTOPPM = "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pdftoppm";
const NODE_MODULES = process.env.NODE_PATH || process.env.TESSERACT_NODE_MODULES || DEFAULT_NODE_MODULES;
const PDFTOPPM = process.env.PDFTOPPM || DEFAULT_PDFTOPPM;
const TESSDATA_CACHE = process.env.TESSDATA_CACHE || "data/urban/text/ocr/tessdata-cache";
const OCR_DIR = "data/urban/text/seoul-sibo/ocr";
const OCR_IMAGE_DIR = path.join(OCR_DIR, "images");
const OCR_TEXT_DIR = path.join(OCR_DIR, "files");
const OUT_JSON = path.join(OCR_DIR, "ocr-page-range-manifest.json");
const OUT_CSV = path.join(OCR_DIR, "ocr-page-range-manifest.csv");

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

function safeStem(value) {
  return String(value || "seoul-sibo-range")
    .replace(/[^\w가-힣._-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
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

async function renderRange(pdfPath, imageDir, startPage, endPage, dpi, force) {
  await mkdir(imageDir, { recursive: true });
  const existing = (await exists(imageDir) ? await readdir(imageDir) : [])
    .filter((name) => /^page-\d+\.png$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0));
  if (!force && existing.length >= endPage - startPage + 1) {
    return existing.map((name) => path.join(imageDir, name));
  }
  await run(PDFTOPPM, ["-f", String(startPage), "-l", String(endPage), "-png", "-r", String(dpi), pdfPath, path.join(imageDir, "page")]);
  return (await readdir(imageDir))
    .filter((name) => /^page-\d+\.png$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0))
    .map((name) => path.join(imageDir, name));
}

async function main() {
  const args = parseArgs();
  const pdf = args.get("pdf");
  const startPage = Number(args.get("start"));
  const endPage = Number(args.get("end"));
  const key = safeStem(args.get("key") || `${path.basename(pdf || "pdf", ".pdf")}-${startPage}-${endPage}`);
  const dpi = Number(args.get("dpi") || 220);
  const force = args.has("force");

  if (!pdf || !Number.isInteger(startPage) || !Number.isInteger(endPage) || startPage < 1 || endPage < startPage) {
    throw new Error("Usage: node scripts/ocr-seoul-sibo-page-range.mjs --pdf=<path> --start=<page> --end=<page> [--key=<name>] [--dpi=220] [--force]");
  }

  const pdfPath = path.join(ROOT, pdf);
  const imageDir = path.join(ROOT, OCR_IMAGE_DIR, key);
  const outTextPath = path.join(ROOT, OCR_TEXT_DIR, `${key}.txt`);
  await mkdir(path.join(ROOT, OCR_TEXT_DIR), { recursive: true });
  await mkdir(path.join(ROOT, OCR_DIR), { recursive: true });

  const images = await renderRange(pdfPath, imageDir, startPage, endPage, dpi, force);
  const require = createRequire(import.meta.url);
  const { createWorker } = require(path.join(NODE_MODULES, "tesseract.js"));
  const worker = await createWorker("kor+eng", undefined, {
    cachePath: path.join(ROOT, TESSDATA_CACHE),
    logger: (message) => {
      if (message.status === "recognizing text") {
        const pct = Math.round((message.progress || 0) * 100);
        if (pct % 25 === 0) process.stderr.write(`recognizing ${pct}%\n`);
      }
    },
  });

  const rows = [];
  const pageTexts = [];
  try {
    for (const image of images) {
      const match = path.basename(image).match(/(\d+)/);
      const pdfPage = Number(match?.[1] || startPage + rows.length);
      process.stderr.write(`OCR Seoul Sibo page ${pdfPage} (${rows.length + 1}/${images.length})\n`);
      let text = "";
      let error = "";
      try {
        const result = await worker.recognize(image);
        text = result.data.text || "";
      } catch (err) {
        error = err.message;
      }
      pageTexts.push(`\n\n===== OCR PDF PAGE ${pdfPage} =====\n${text.trim()}\n`);
      rows.push({
        key,
        pdf,
        start_page: startPage,
        end_page: endPage,
        pdf_page: pdfPage,
        image_path: path.relative(ROOT, image),
        ocr_text_path: path.relative(ROOT, outTextPath),
        ocr_char_count: text.length,
        ocr_status: text.length > 0 && !error ? "ocr_extracted" : text.length > 0 ? "ocr_partial" : "ocr_failed",
        ocr_error: error,
      });
    }
  } finally {
    await worker.terminate();
  }

  await writeFile(outTextPath, `${pageTexts.join("\n").trim()}\n`, "utf8");
  await writeFile(path.join(ROOT, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(ROOT, OUT_CSV), toCsv(rows));
  console.log(
    JSON.stringify(
      {
        key,
        pages: rows.length,
        ocrExtracted: rows.filter((row) => row.ocr_status === "ocr_extracted").length,
        ocrPartial: rows.filter((row) => row.ocr_status === "ocr_partial").length,
        ocrFailed: rows.filter((row) => row.ocr_status === "ocr_failed").length,
        text: path.relative(ROOT, outTextPath),
        manifest: "data/urban/text/seoul-sibo/ocr/ocr-page-range-manifest.{csv,json}",
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
