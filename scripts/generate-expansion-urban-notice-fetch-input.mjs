#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/expansion-interest-zone-shortlist.json";
const OUT_JSON = "data/urban/urban-notice-fetch-input-expansion-shortlist.json";
const OUT_CSV = "data/urban/urban-notice-fetch-input-expansion-shortlist.csv";
const MAP_FORM_BASE = "https://urban.seoul.go.kr/view/ntfc/mapForm.pop?noticeCode=";

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

async function main() {
  const shortlistDoc = JSON.parse(await readFile(INPUT, "utf8"));
  const shortlist = Array.isArray(shortlistDoc?.rows) ? shortlistDoc.rows : Array.isArray(shortlistDoc) ? shortlistDoc : [];
  const rows = shortlist
    .map((row, index) => ({
      input_order: index + 1,
      shortlist_id: row.shortlist_id,
      rank: "",
      focus_area: row.zone_name,
      district: row.notice_org || "",
      project_name: row.project_name,
      cafe_id: "",
      current_stage: "",
      candidate_type: row.candidate_type,
      shortlist_priority: row.shortlist_priority,
      location: row.location,
      tracked_update_id: row.tracked_update_id || "",
      official_channel: row.official_channel,
      official_url: row.official_url,
      match_status: row.urban_notice_code ? "matched" : "pending_notice_code",
      urban_group: "정비사업",
      urban_record_code: "",
      urban_notice_code: row.urban_notice_code,
      urban_notice_title: row.urban_notice_title || row.project_name,
      urban_notice_url: row.urban_notice_code ? `${MAP_FORM_BASE}${encodeURIComponent(row.urban_notice_code)}` : "",
      notice_no: row.notice_no,
      notice_date: row.notice_date,
    }));

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  console.log(JSON.stringify({ rows: rows.length, output: [OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
