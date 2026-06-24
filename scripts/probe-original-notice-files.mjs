#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/urban/business-layer-notice-candidates.json";
const OUT_DIR = "data/urban";
const OUT_JSON = "original-notice-file-probes.json";
const OUT_CSV = "original-notice-file-probes.csv";

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

function baseUrl(row) {
  try {
    const url = new URL(row.notice_file_url);
    const parts = url.pathname.split("/");
    parts.pop();
    return `${url.origin}${parts.join("/")}/`;
  } catch {
    return "";
  }
}

function noticeNumber(row) {
  return compactText(row.notice_no).replace(/^제/, "").replace(/호$/, "");
}

function candidateFileNames(row) {
  const no = noticeNumber(row);
  if (!no) return [];
  const title = compactText(row.notice_title).replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, "_");
  return [
    `서울특별시_제${no}호_고시.pdf`,
    `서울특별시_${no}호_고시.pdf`,
    `서울특별시 제${no}호 고시.pdf`,
    `고시문(제${no}호).pdf`,
    `고시문_제${no}호.pdf`,
    `고시문(제${no}호)_260430.pdf`,
    `고시문_제${no}호_260430.pdf`,
    `${title}.pdf`,
  ];
}

async function probe(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      range: "bytes=0-64",
    },
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  const magic = buffer.subarray(0, 8).toString("latin1");
  return {
    status: response.status,
    content_type: response.headers.get("content-type") || "",
    content_length: response.headers.get("content-length") || "",
    magic,
    looks_like_pdf: magic.startsWith("%PDF") ? "Y" : "N",
  };
}

async function main() {
  const candidates = JSON.parse(await readFile(INPUT, "utf8"));
  const targetRows = candidates.filter(
    (row) => row.search_status === "candidate" && row.match_confidence === "high" && compactText(row.notice_file_name).includes("정정"),
  );
  const rows = [];

  for (const row of targetRows) {
    const base = baseUrl(row);
    for (const fileName of candidateFileNames(row)) {
      const url = `${base}${encodeURIComponent(fileName)}`;
      let result;
      try {
        result = await probe(url);
      } catch (error) {
        result = {
          status: "",
          content_type: "",
          content_length: "",
          magic: "",
          looks_like_pdf: "N",
          error: error.message,
        };
      }
      rows.push({
        rank: row.rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        notice_code: row.notice_code,
        notice_no: row.notice_no,
        notice_date: row.notice_date,
        correction_file_name: row.notice_file_name,
        probe_file_name: fileName,
        probe_url: url,
        probe_status: result.status,
        content_type: result.content_type,
        content_length: result.content_length,
        looks_like_pdf: result.looks_like_pdf,
        probe_error: result.error || "",
      });
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  console.log(
    JSON.stringify(
      {
        targetRows: targetRows.length,
        probes: rows.length,
        pdfFound: rows.filter((row) => row.looks_like_pdf === "Y").length,
        output: `data/urban/${OUT_JSON}`,
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
