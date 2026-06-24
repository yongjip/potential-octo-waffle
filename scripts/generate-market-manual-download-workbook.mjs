#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "market-manual-download-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "market-manual-download-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "market-manual-download-workbook.json");

const MANIFEST_INPUT = "data/market/manual-import/manifest.json";
const MARKET_AREAS_INPUT = "data/market/project-market-areas.json";
const FETCH_PLAN_INPUT = "data/market/market-fetch-plan.json";

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

const SOURCE_TO_MANUAL = {
  "seoul-open-data": "seoul-open-data-real-estate-csv",
  "molit-apt-trade": "molit-rtms-apt-trade-rent-manual",
  "molit-apt-rent": "molit-rtms-apt-trade-rent-manual",
  "molit-rowhouse-trade": "molit-rtms-rowhouse-trade-rent-manual",
  "molit-rowhouse-rent": "molit-rtms-rowhouse-trade-rent-manual",
};

const SOURCE_KIND = {
  "seoul-open-data": "서울시 실거래 전체 원자료",
  "molit-apt-trade": "국토부 아파트 매매",
  "molit-apt-rent": "국토부 아파트 전월세",
  "molit-rowhouse-trade": "국토부 연립·다세대 매매",
  "molit-rowhouse-rent": "국토부 연립·다세대 전월세",
};

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
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
  return [...new Set(values.filter(Boolean))];
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

function monthRange(rows) {
  const months = unique(rows.map((row) => row.deal_ymd)).sort();
  return {
    months,
    coverage_from: months[0] || "",
    coverage_to: months[months.length - 1] || "",
    month_count: months.length,
  };
}

function yearForMonth(month) {
  return String(month || "").slice(0, 4);
}

function rowsByManualSource(manifestRows) {
  return new Map(manifestRows.map((row) => [row.manual_source_id, row]));
}

function areasForRanks(marketRows, rankText) {
  const wanted = new Set(String(rankText || "").split(";").map((item) => item.trim()).filter(Boolean));
  return marketRows.filter((row) => wanted.has(String(row.rank)));
}

function compactProjectNames(rows) {
  return unique(rows.map((row) => `${row.rank}. ${row.project_name}`)).join("; ");
}

function compactKeywords(rows) {
  return unique(rows.flatMap((row) => String(row.target_complex_keywords || "").split(";").map((item) => item.trim()))).join("; ");
}

function expectedFilename(task) {
  const parts = [
    task.source,
    task.district || "all",
    task.dong || "",
    task.coverage_from,
    task.coverage_to,
  ].filter(Boolean);
  return `${parts.join("_").replace(/[^\w가-힣-]+/g, "-")}.csv`;
}

function taskStatus(manifestRow) {
  if (!manifestRow) return "manifest_missing";
  if (!manifestRow.local_path) return "waiting_for_manual_download";
  return "manifest_file_path_set";
}

function buildSeoulTasks(fetchRows, marketRows, manifestMap) {
  const grouped = new Map();
  for (const row of fetchRows.filter((item) => item.source === "seoul-open-data")) {
    const key = `${row.district}|${row.dong}|${yearForMonth(row.deal_ymd)}`;
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"))
    .map(([key, rows], index) => {
      const [district, dong, year] = key.split("|");
      const related = areasForRanks(marketRows, rows[0].ranks);
      const manual = manifestMap.get(SOURCE_TO_MANUAL["seoul-open-data"]);
      const range = monthRange(rows);
      const task = {
        task_id: `seoul-open-data-${String(index + 1).padStart(2, "0")}`,
        manual_source_id: SOURCE_TO_MANUAL["seoul-open-data"],
        provider: manual?.provider || "서울특별시",
        source: "seoul-open-data",
        source_kind: SOURCE_KIND["seoul-open-data"],
        acquisition_mode: "official_csv_or_sheet_download_then_filter",
        district,
        dong,
        lawd_cd: rows[0].lawd_cd || "",
        coverage_from: range.coverage_from,
        coverage_to: range.coverage_to,
        month_count: range.month_count,
        api_plan_rows: rows.length,
        project_count: related.length,
        ranks: unique(rows.flatMap((row) => row.ranks.split(";").map((item) => item.trim()))).join("; "),
        project_names: compactProjectNames(related),
        target_keywords: compactKeywords(related),
        official_page: manual?.download_url_or_page || "",
        required_filter: `신고년도=${year}; 자치구=${district}; 법정동=${dong}; 건물명/단지명 키워드=${compactKeywords(related)}`,
        expected_local_filename: "",
        suggested_output_filename: "",
        manifest_status: taskStatus(manual),
        next_action: "서울 열린데이터광장 공식 페이지에서 신고년도별로 내려받은 뒤 자치구·법정동·건물명 키워드로 필터링한다.",
      };
      task.suggested_output_filename = expectedFilename(task);
      return task;
    });
}

function buildMolitTasks(fetchRows, marketRows, manifestMap) {
  const rows = fetchRows.filter((item) => item.source.startsWith("molit-"));
  const grouped = new Map();
  for (const row of rows) {
    const key = `${row.source}|${row.district}|${yearForMonth(row.deal_ymd)}`;
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }

  const sourceCounters = {};
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"))
    .map(([key, rows]) => {
      const [source, district, year] = key.split("|");
      sourceCounters[source] = (sourceCounters[source] || 0) + 1;
      const manual = manifestMap.get(SOURCE_TO_MANUAL[source]);
      const range = monthRange(rows);
      const ranks = unique(rows.flatMap((row) => row.ranks.split(";").map((item) => item.trim()))).join("; ");
      const related = areasForRanks(marketRows, ranks);
      const dongs = unique(related.map((row) => row.dong)).join("; ");
      const task = {
        task_id: `${source}-${String(sourceCounters[source]).padStart(2, "0")}`,
        manual_source_id: SOURCE_TO_MANUAL[source],
        provider: manual?.provider || "국토교통부",
        source,
        source_kind: SOURCE_KIND[source],
        acquisition_mode: "official_rtms_download_or_data_go_kr_api",
        district,
        dong: dongs,
        lawd_cd: rows[0].lawd_cd || "",
        coverage_from: range.coverage_from,
        coverage_to: range.coverage_to,
        month_count: range.month_count,
        api_plan_rows: rows.length,
        project_count: related.length,
        ranks,
        project_names: compactProjectNames(related),
        target_keywords: compactKeywords(related),
        official_page: manual?.download_url_or_page || "",
        required_filter: `계약년도=${year}; LAWD_CD=${rows[0].lawd_cd || ""}; 계약년월=${range.coverage_from}~${range.coverage_to}; 자료유형=${SOURCE_KIND[source]}`,
        expected_local_filename: "",
        suggested_output_filename: "",
        manifest_status: taskStatus(manual),
        next_action: "공식 RTMS 자료제공 화면은 시도별 계약일자 범위가 최대 1년이므로 자치구·계약년도·주택유형별 원자료를 나눠 내려받아 보존한다.",
      };
      task.suggested_output_filename = expectedFilename(task);
      return task;
    });
}

function buildROneTasks(marketRows, manifestMap) {
  const manual = manifestMap.get("r-one-price-and-volume-statistics");
  const regions = unique(marketRows.flatMap((row) => String(row.r_one_regions || "").split(";").map((item) => item.trim())));
  const indicators = unique(marketRows.flatMap((row) => String(row.r_one_indicators || "").split(";").map((item) => item.trim())));
  return [
    {
      task_id: "r-one-statistics-01",
      manual_source_id: "r-one-price-and-volume-statistics",
      provider: manual?.provider || "한국부동산원",
      source: "r-one-statistics",
      source_kind: "R-ONE 가격지수·거래현황",
      acquisition_mode: "official_statistics_download",
      district: "서울/권역/자치구",
      dong: "",
      lawd_cd: "",
      coverage_from: manual?.coverage_from || "",
      coverage_to: manual?.coverage_to || "",
      month_count: "",
      api_plan_rows: 0,
      project_count: marketRows.length,
      ranks: unique(marketRows.map((row) => row.rank)).join("; "),
      project_names: "후보 30개 전체",
      target_keywords: indicators.join("; "),
      official_page: manual?.download_url_or_page || "",
      required_filter: `지역=${regions.join("; ")}; 지표=${indicators.join("; ")}`,
      expected_local_filename: "",
      suggested_output_filename: "r-one-statistics_서울-권역-자치구_2024-01_2026-06.xlsx",
      manifest_status: taskStatus(manual),
      next_action: "R-ONE 공식 통계자료받기에서 서울·권역·자치구 가격지수와 거래현황을 내려받아 실거래 방향성 대조용으로 보존한다.",
    },
  ];
}

function buildRows({ manifestRows, marketRows, fetchRows }) {
  const manifestMap = rowsByManualSource(manifestRows);
  return [
    ...buildSeoulTasks(fetchRows, marketRows, manifestMap),
    ...buildMolitTasks(fetchRows, marketRows, manifestMap),
    ...buildROneTasks(marketRows, manifestMap),
  ];
}

function buildSummary(rows) {
  const sourceCounts = countBy(rows, "source");
  const modeCounts = countBy(rows, "acquisition_mode");
  const manifestCounts = countBy(rows, "manifest_status");
  return {
    generated_at: UPDATED_AT,
    task_count: rows.length,
    source_counts: sourceCounts,
    source_summary: countText(sourceCounts),
    acquisition_mode_counts: modeCounts,
    acquisition_mode_summary: countText(modeCounts),
    manifest_status_counts: manifestCounts,
    manifest_status_summary: countText(manifestCounts),
    district_count: unique(rows.map((row) => row.district).filter((district) => !district.includes("서울/"))).length,
    dong_task_count: rows.filter((row) => row.dong && row.source === "seoul-open-data").length,
    molit_task_count: rows.filter((row) => row.source.startsWith("molit-")).length,
    seoul_open_data_task_count: rows.filter((row) => row.source === "seoul-open-data").length,
    r_one_task_count: rows.filter((row) => row.source === "r-one-statistics").length,
  };
}

function markdown(rows, summary) {
  return `# 시장 원자료 수동 다운로드 워크북

작성 기준: ${UPDATED_AT}

API 키 없이 공식 사이트에서 원자료를 받을 때, \`market-fetch-plan\`의 월별 690개 계획을 실제 다운로드·필터 작업 단위로 압축한 워크북이다. 서울 열린데이터는 신고년도별 필터, 국토부 RTMS는 1년 이내 계약일자 범위에 맞춰 쪼갠다. 이 문서는 원자료를 생성하지 않고, 어떤 공식 페이지에서 어떤 지역·기간·키워드 묶음을 받아야 하는지 고정한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 다운로드/필터 작업 | ${summary.task_count} |
| 서울 열린데이터 법정동 필터 | ${summary.seoul_open_data_task_count} |
| 국토부 RTMS 자치구·유형 묶음 | ${summary.molit_task_count} |
| R-ONE 통계 묶음 | ${summary.r_one_task_count} |
| 법정동 필터 수 | ${summary.dong_task_count} |
| 자료 출처 분포 | ${summary.source_summary} |
| 반입 상태 | ${summary.manifest_status_summary} |

## 실행 순서

1. 아래 작업표의 \`official_page\`에서 원자료를 내려받는다.
2. 원본 파일명은 가능하면 \`suggested_output_filename\`을 따른다.
3. 원본 파일을 \`data/market/manual-import/files/\`에 보존한다.
4. \`data/market/manual-import/manifest.json\`의 해당 \`manual_source_id\`에 \`local_path\`, \`downloaded_at\`, \`coverage_from\`, \`coverage_to\`를 채운다.
5. \`node scripts/generate-market-manual-import-readiness.mjs\`와 \`python3 scripts/generate-market-manual-column-audit.py\`를 실행한다.
6. 컬럼 감사 후 \`python3 scripts/normalize-market-manual-import.py\`로 수동 원자료를 표준 거래/지표 스키마에 연결한다.

## 공식 제약 메모

- 서울 열린데이터광장 \`서울시 부동산 실거래가 정보\`는 데이터 갱신일 2026-06-22, 갱신주기 매일 1회이며, 미리보기에서 신고년도별 조회 및 내려받기를 안내한다.
- 같은 서울 열린데이터 화면은 Sheet Open API 미리보기 1,000건 한계를 안내하므로, 전체 데이터는 CSV 내려받기 후 로컬 필터링 대상으로 둔다.
- 국토교통부 실거래가 공개시스템 자료제공 화면은 시도별 계약일자 범위를 최대 1년으로 안내하므로, 2024년, 2025년, 2026년 작업으로 나눠 받는다.

## 작업표

${mdTable(rows, [
  { key: "task_id", label: "작업" },
  { key: "source_kind", label: "자료" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "coverage_from", label: "시작" },
  { key: "coverage_to", label: "종료" },
  { key: "api_plan_rows", label: "월별 계획" },
  { key: "project_count", label: "사업장" },
  { key: "required_filter", label: "필터" },
  { key: "suggested_output_filename", label: "권장 파일명" },
])}

## 공식 페이지와 상태

${mdTable(rows, [
  { key: "task_id", label: "작업" },
  { key: "manual_source_id", label: "manifest ID" },
  { key: "provider", label: "제공기관" },
  { key: "official_page", label: "공식 페이지" },
  { key: "manifest_status", label: "현재 상태" },
  { key: "next_action", label: "다음 액션" },
])}

## 사업장 연결

${mdTable(rows, [
  { key: "task_id", label: "작업" },
  { key: "ranks", label: "순위" },
  { key: "project_names", label: "사업장" },
  { key: "target_keywords", label: "키워드/지표" },
])}
`;
}

async function main() {
  const [manifestRows, marketRows, fetchRows] = await Promise.all([
    readJson(MANIFEST_INPUT),
    readJson(MARKET_AREAS_INPUT),
    readJson(FETCH_PLAN_INPUT),
  ]);
  const rows = buildRows({ manifestRows, marketRows, fetchRows });
  const summary = buildSummary(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(JSON.stringify({ tasks: rows.length, sources: summary.source_counts, output: "analysis/market-manual-download-workbook.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
