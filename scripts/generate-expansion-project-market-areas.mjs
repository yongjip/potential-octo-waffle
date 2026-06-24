#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/market/expansion-market-areas.json";
const OUT_JSON = "data/market/expansion-project-market-areas.json";
const OUT_CSV = "data/market/expansion-project-market-areas.csv";
const OUT_MD = "analysis/expansion-project-market-areas.md";
const OUT_ANALYSIS_CSV = "analysis/expansion-project-market-areas.csv";
const OUT_ANALYSIS_JSON = "analysis/expansion-project-market-areas.json";

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

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function shortKeyword(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/주택재건축정비사업조합|주택재건축정비사업|주택재건축 정비사업|주택재건축정비구역|주택재건축 정비구역|주택재개발정비사업|주택재개발 정비사업|주택재개발정비구역|주택재개발 정비구역|가로주택정비사업|소규모재건축정비사업|아파트|정비사업|정비구역|조합/g, "");
}

function keywordSet(row) {
  const exact = String(row.representative_projects || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
  const compact = exact.map(shortKeyword).filter(Boolean);
  return unique([...exact, ...compact]).join("; ");
}

async function main() {
  const rows = await readJson(INPUT);
  const projectRows = rows.map((row, index) => ({
    rank: String(index + 1),
    focus_area: row.zone_name || "",
    district: row.district || "",
    lawd_cd: row.lawd_cd || "",
    dong: row.dong || "",
    emd_cd: row.emd_cd || "",
    representative_lot: "",
    project_name: row.representative_projects || row.candidate_name || "",
    project_type: row.market_role || "",
    market_type: row.preferred_asset_types || "",
    current_stage: row.zone_current_system_status || "",
    stage_event_focus: "expansion_baseline",
    official_project_url: "",
    official_map_url: "",
    official_map_url_source: "",
    notice_no: "",
    notice_date: "",
    notice_title: row.shortlist_notice_refs || "",
    district_area_sqm: "",
    total_households: "",
    floor_area_ratio_pct: "",
    transaction_scope: row.transaction_scope || "",
    preferred_asset_types: row.preferred_asset_types || "",
    target_complex_keywords: keywordSet(row),
    peer_area_keywords: row.candidate_search_scope || "",
    seoul_open_data_filter: row.seoul_open_data_filter || "",
    molit_rtms_query_keys: row.molit_rtms_query_keys || "",
    r_one_regions: "",
    r_one_indicators: "",
    first_market_questions: row.first_market_questions || "",
    data_quality_notes: row.data_quality_notes || "",
    market_data_status: row.market_data_status || "",
  }));

  const summary = {
    generated_at: UPDATED_AT,
    project_row_count: projectRows.length,
    direct_count: projectRows.filter((row) => String(row.project_type).includes("direct")).length,
    output: OUT_JSON,
  };

  await mkdir("data/market", { recursive: true });
  await mkdir("analysis", { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(projectRows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(projectRows));
  await writeFile(OUT_ANALYSIS_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows: projectRows }, null, 2)}\n`);
  await writeFile(OUT_ANALYSIS_CSV, toCsv(projectRows));
  await writeFile(
    OUT_MD,
    `# 확장권 project market areas\n\n작성 기준: ${UPDATED_AT}\n\n확장권 dong-level baseline을 정규화 거래와 1차 매칭하기 위한 최소 project-area 입력이다.\n\n## 대상\n\n${mdTable(projectRows, [
      { key: "rank", label: "순서" },
      { key: "focus_area", label: "권역" },
      { key: "district", label: "자치구" },
      { key: "dong", label: "법정동" },
      { key: "project_name", label: "대표 기준" },
      { key: "target_complex_keywords", label: "키워드" },
    ])}\n`,
  );
  console.log(JSON.stringify({ rows: projectRows.length, output: "data/market/expansion-project-market-areas.{json,csv}; analysis/expansion-project-market-areas.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
