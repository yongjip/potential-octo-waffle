#!/usr/bin/env node

import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "market-api-readiness-audit.md");
const OUT_CSV = path.join(OUT_DIR, "market-api-readiness-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "market-api-readiness-audit.json");

const MARKET_AREAS_INPUT = "data/market/project-market-areas.json";
const FETCH_PLAN_INPUT = "data/market/market-fetch-plan.json";
const DIAGNOSTICS_INPUT = "data/market/market-fetch-diagnostics.json";
const DIAGNOSTICS_MD = "data/market/market-fetch-diagnostics.md";
const MANUAL_IMPORT_INPUT = "analysis/market-manual-import-readiness.json";
const MANUAL_IMPORT_MD = "analysis/market-manual-import-readiness.md";
const MANUAL_COLUMN_AUDIT_INPUT = "analysis/market-manual-column-audit.json";
const MANUAL_COLUMN_AUDIT_MD = "analysis/market-manual-column-audit.md";
const MANUAL_NORMALIZATION_INPUT = "analysis/market-manual-normalization-audit.json";
const MANUAL_NORMALIZATION_MD = "analysis/market-manual-normalization-audit.md";
const SOURCES_INPUT = "data/market/official-market-data-sources.csv";
const FETCH_SUMMARY_INPUT = "data/market/market-fetch-summary.json";
const NORMALIZED_TX_CSV = "data/market/transactions/official-transactions-normalized.csv";
const MATCHED_TX_CSV = "data/market/transactions/official-transactions-project-matches.csv";
const MANUAL_NORMALIZED_TX_CSV = "data/market/transactions/manual-official-transactions-normalized.csv";
const MANUAL_MATCHED_TX_CSV = "data/market/transactions/manual-official-transactions-project-matches.csv";
const MANUAL_INDICATORS_CSV = "data/market/indicators/manual-market-indicators-normalized.csv";
const RAW_DIR = "data/market/raw";

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

const SOURCE_REQUIREMENTS = {
  "molit-apt-trade": {
    env_key: "DATA_GO_KR_SERVICE_KEY",
    command:
      'DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade --from=202401 --to=202606',
    expected_raw_dir: "data/market/raw/molit-apt-trade",
  },
  "molit-apt-rent": {
    env_key: "DATA_GO_KR_SERVICE_KEY",
    command:
      'DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-rent --from=202401 --to=202606',
    expected_raw_dir: "data/market/raw/molit-apt-rent",
  },
  "molit-rowhouse-trade": {
    env_key: "DATA_GO_KR_SERVICE_KEY",
    command:
      'DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-rowhouse-trade --from=202401 --to=202606',
    expected_raw_dir: "data/market/raw/molit-rowhouse-trade",
  },
  "molit-rowhouse-rent": {
    env_key: "DATA_GO_KR_SERVICE_KEY",
    command:
      'DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-rowhouse-rent --from=202401 --to=202606',
    expected_raw_dir: "data/market/raw/molit-rowhouse-rent",
  },
  "seoul-open-data": {
    env_key: "SEOUL_OPEN_DATA_KEY",
    command:
      'SEOUL_OPEN_DATA_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=seoul-open-data --from=202601 --to=202606 --max-pages=5',
    expected_raw_dir: "data/market/raw/seoul-open-data",
  },
};

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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function countFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    let total = 0;
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) total += await countFiles(fullPath);
      else total += 1;
    }
    return total;
  } catch (error) {
    if (error.code === "ENOENT") return 0;
    throw error;
  }
}

async function fileInfo(file) {
  try {
    const info = await stat(file);
    return { exists: "Y", bytes: info.size };
  } catch (error) {
    if (error.code === "ENOENT") return { exists: "N", bytes: 0 };
    throw error;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  if (!headers) return [];
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

async function readCsv(file) {
  try {
    return parseCsv(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts, limit = 8) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function buildSourceRows(planRows, rawCounts) {
  const grouped = Object.entries(countBy(planRows, "source")).sort((a, b) => a[0].localeCompare(b[0]));
  return grouped.map(([source, plan_count]) => {
    const requirement = SOURCE_REQUIREMENTS[source] || {};
    const envPresent = requirement.env_key && process.env[requirement.env_key] ? "Y" : "N";
    const sourceRows = planRows.filter((row) => row.source === source);
    const statusCounts = countBy(sourceRows, "status");
    const fetchableRows = sourceRows.filter((row) => row.status === "fetchable").length;
    const blockedRows = sourceRows.filter((row) => String(row.status || "").startsWith("missing_env:")).length;
    const rawFileCount = rawCounts[source] || 0;
    const readiness =
      rawFileCount > 0
        ? "raw_data_present"
        : fetchableRows > 0 || envPresent === "Y"
          ? "fetch_ready"
          : "blocked_missing_key";
    return {
      source,
      source_label: sourceRows[0]?.source_label || source,
      required_env_key: requirement.env_key || "",
      env_present: envPresent,
      plan_count,
      fetchable_plan_count: fetchableRows,
      blocked_plan_count: blockedRows,
      raw_file_count: rawFileCount,
      readiness,
      plan_status_summary: countText(statusCounts),
      expected_raw_dir: requirement.expected_raw_dir || "",
      fetch_command: requirement.command || "",
    };
  });
}

function buildFocusRows(areaRows, planRows) {
  return Object.entries(countBy(areaRows, "focus_area"))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([focus_area, project_count]) => {
      const ranks = new Set(areaRows.filter((row) => row.focus_area === focus_area).map((row) => String(row.rank)));
      const relatedPlans = planRows.filter((row) =>
        String(row.ranks || "")
          .split(";")
          .map((rank) => rank.trim())
          .some((rank) => ranks.has(rank)),
      );
      return {
        focus_area,
        project_count,
        plan_count: relatedPlans.length,
        source_mix: countText(countBy(relatedPlans, "source")),
        status_mix: countText(countBy(relatedPlans, "status")),
      };
    });
}

function diagnosticsSection(diagnostics) {
  if (!diagnostics) {
    return `## 수집 진단

\`node scripts/fetch-market-raw-data.mjs --diagnose --from=202401 --to=202606\`을 실행하면 API 키 투입 전후의 막힌 지점과 스모크 테스트 명령을 별도 파일로 남긴다.
`;
  }
  const smokeRows = (diagnostics.smoke_commands || []).map((row) => ({
    label: row.label,
    command: row.command,
  }));
  return `## 수집 진단

| 항목 | 값 |
| --- | ---: |
| 진단 생성 | ${diagnostics.generated_at || ""} |
| 선택 사업장 | ${diagnostics.selected_projects ?? ""} |
| 조회 월 | ${diagnostics.months ?? ""} |
| API 계획 | ${diagnostics.plan_rows ?? ""} |
| 수집 가능 계획 | ${diagnostics.fetchable_plan_rows ?? ""} |
| 키 누락 계획 | ${diagnostics.blocked_plan_rows ?? ""} |
| DATA_GO_KR_SERVICE_KEY | ${diagnostics.environment?.DATA_GO_KR_SERVICE_KEY || ""} |
| SEOUL_OPEN_DATA_KEY | ${diagnostics.environment?.SEOUL_OPEN_DATA_KEY || ""} |

추천 스모크 테스트:

${mdTable(smokeRows, [
  { key: "label", label: "테스트" },
  { key: "command", label: "명령" },
])}
`;
}

function manualImportSection(manualImport, manualColumnAudit, manualNormalization) {
  if (!manualImport) {
    return `## 수동 다운로드 반입 경로

\`node scripts/generate-market-manual-import-readiness.mjs\`를 실행하면 API 키 없이 공식 사이트에서 내려받은 CSV/XLSX 파일의 manifest 준비 상태를 확인할 수 있다.
`;
  }
  const rows = manualImport.rows || [];
  const columnRows = manualColumnAudit?.rows || [];
  return `## 수동 다운로드 반입 경로

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | ${manualImport.summary?.manifest_count ?? ""} |
| 파일 존재 | ${manualImport.summary?.file_present_count ?? ""} |
| 정규화 매핑 준비 | ${manualImport.summary?.ready_for_normalization_count ?? ""} |
| 다운로드 대기 | ${manualImport.summary?.waiting_for_download_count ?? ""} |
| 컬럼 감사 파싱 가능 파일 | ${manualColumnAudit?.summary?.parsed_file_count ?? ""} |
| 컬럼 감사 매핑 준비 | ${manualColumnAudit?.summary?.ready_for_mapping_count ?? ""} |
| 컬럼 감사 상태 분포 | ${manualColumnAudit?.summary?.readiness_summary || ""} |
| 수동 정규화 거래 행 | ${manualNormalization?.summary?.normalized_transactions ?? ""} |
| 수동 사업장 매칭 행 | ${manualNormalization?.summary?.project_matched_transactions ?? ""} |
| 수동 지표 행 | ${manualNormalization?.summary?.normalized_indicators ?? ""} |
| 수동 정규화 상태 분포 | ${manualNormalization?.summary?.status_summary || ""} |
| 상태 분포 | ${manualImport.summary?.readiness_summary || ""} |

${mdTable(rows, [
  { key: "manual_source_id", label: "ID" },
  { key: "provider", label: "기관" },
  { key: "source_name", label: "자료" },
  { key: "local_path", label: "파일" },
  { key: "readiness_status", label: "상태" },
  { key: "next_action", label: "다음 액션" },
])}

### 수동 원자료 컬럼 감사

${mdTable(columnRows, [
  { key: "manual_source_id", label: "ID" },
  { key: "parser", label: "파서" },
  { key: "header_count", label: "컬럼" },
  { key: "sample_row_count", label: "샘플행" },
  { key: "missing_required_fields", label: "누락 필드" },
  { key: "normalization_readiness", label: "상태" },
])}

### 수동 원자료 정규화 감사

${mdTable(manualNormalization?.sourceRows || [], [
  { key: "manual_source_id", label: "ID" },
  { key: "output_table", label: "출력" },
  { key: "raw_rows", label: "원자료 행" },
  { key: "normalized_rows", label: "정규화 행" },
  { key: "matched_rows", label: "매칭 행" },
  { key: "missing_mapping_fields", label: "누락 매핑" },
  { key: "normalization_status", label: "상태" },
])}
`;
}

function markdown({ summary, sourceRows, focusRows, outputRows, diagnostics, manualImport, manualColumnAudit, manualNormalization }) {
  return `# 시장 데이터 API 준비도 감사

작성 기준: ${UPDATED_AT}

이 문서는 강남·잠실/송파·구의/광진 후보 30개를 실거래·전월세·서울시 실거래 원자료로 연결하기 위한 API 준비 상태를 점검한다. 키가 없는 상태에서도 어떤 쿼리가 막혀 있고, 키를 넣으면 어떤 명령을 실행해야 하는지 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 시장 매핑 사업장 | ${summary.project_count} |
| API 호출 계획 | ${summary.plan_count} |
| 수집 가능 계획 | ${summary.fetchable_plan_count} |
| 키 누락 계획 | ${summary.blocked_plan_count} |
| 원자료 파일 | ${summary.raw_file_count} |
| 정규화 거래 파일 | ${summary.normalized_transactions_exists} |
| 사업장 매칭 거래 파일 | ${summary.project_matches_exists} |
| 시장 원자료 수집 완료 여부 | ${summary.market_raw_collection_ready} |

${diagnosticsSection(diagnostics)}

${manualImportSection(manualImport, manualColumnAudit, manualNormalization)}

## 출처별 준비도

${mdTable(sourceRows, [
  { key: "source", label: "출처" },
  { key: "required_env_key", label: "필요 키" },
  { key: "env_present", label: "현재 키" },
  { key: "plan_count", label: "계획" },
  { key: "fetchable_plan_count", label: "수집가능" },
  { key: "blocked_plan_count", label: "키누락" },
  { key: "raw_file_count", label: "원자료" },
  { key: "readiness", label: "상태" },
])}

## 생활권별 계획

${mdTable(focusRows, [
  { key: "focus_area", label: "생활권" },
  { key: "project_count", label: "사업장" },
  { key: "plan_count", label: "API 계획" },
  { key: "source_mix", label: "출처" },
  { key: "status_mix", label: "상태" },
])}

## 산출물 확인

${mdTable(outputRows, [
  { key: "artifact", label: "파일" },
  { key: "exists", label: "존재" },
  { key: "bytes", label: "바이트" },
  { key: "purpose", label: "용도" },
])}

## 실행 명령

키 없이 계획만 갱신:

\`\`\`bash
node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606
\`\`\`

공공데이터포털 키로 국토부 실거래 수집:

\`\`\`bash
DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade,molit-apt-rent,molit-rowhouse-trade,molit-rowhouse-rent --from=202401 --to=202606
\`\`\`

서울 열린데이터광장 키로 서울시 실거래 수집:

\`\`\`bash
SEOUL_OPEN_DATA_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=seoul-open-data --from=202601 --to=202606 --max-pages=5
\`\`\`

## 판정

- \`blocked_missing_key\`: 환경변수가 없어 실제 원자료 호출 전이다.
- \`fetch_ready\`: 현재 프로세스에 키가 있어 원격 호출 가능 상태다.
- \`raw_data_present\`: 적어도 하나 이상의 원자료 응답 파일이 존재한다.
- 시장 원자료가 생긴 뒤에는 \`official-transactions-normalized.csv\`와 \`official-transactions-project-matches.csv\`의 행 수를 보고 단지명 키워드를 보정한다.
`;
}

async function main() {
  const [areaRows, planRows, diagnostics, manualImport, manualColumnAudit, manualNormalization, sourceRowsCsv, fetchSummary] = await Promise.all([
    readJson(MARKET_AREAS_INPUT, []),
    readJson(FETCH_PLAN_INPUT, []),
    readJson(DIAGNOSTICS_INPUT, null),
    readJson(MANUAL_IMPORT_INPUT, null),
    readJson(MANUAL_COLUMN_AUDIT_INPUT, null),
    readJson(MANUAL_NORMALIZATION_INPUT, null),
    readCsv(SOURCES_INPUT),
    readJson(FETCH_SUMMARY_INPUT, null),
  ]);
  const rawCounts = {};
  for (const source of Object.keys(SOURCE_REQUIREMENTS)) rawCounts[source] = await countFiles(path.join(RAW_DIR, source));
  const sourceRows = buildSourceRows(planRows, rawCounts);
  const focusRows = buildFocusRows(areaRows, planRows);
  const normalizedInfo = await fileInfo(NORMALIZED_TX_CSV);
  const matchedInfo = await fileInfo(MATCHED_TX_CSV);
  const manualNormalizedInfo = await fileInfo(MANUAL_NORMALIZED_TX_CSV);
  const manualMatchedInfo = await fileInfo(MANUAL_MATCHED_TX_CSV);
  const manualIndicatorsInfo = await fileInfo(MANUAL_INDICATORS_CSV);
  const rawFileCount = Object.values(rawCounts).reduce((sum, count) => sum + count, 0);
  const outputRows = [
    { artifact: "data/market/market-fetch-plan.json", ...(await fileInfo(FETCH_PLAN_INPUT)), purpose: "API 호출 계획" },
    { artifact: "data/market/project-market-areas.json", ...(await fileInfo(MARKET_AREAS_INPUT)), purpose: "사업장별 시장 조회 키" },
    { artifact: "data/market/market-fetch-diagnostics.md", ...(await fileInfo(DIAGNOSTICS_MD)), purpose: "키 상태와 스모크 테스트 진단" },
    { artifact: "data/market/market-fetch-diagnostics.json", ...(await fileInfo(DIAGNOSTICS_INPUT)), purpose: "수집 진단 구조화 원본" },
    { artifact: "analysis/market-manual-import-readiness.md", ...(await fileInfo(MANUAL_IMPORT_MD)), purpose: "수동 다운로드 반입 준비도" },
    { artifact: "analysis/market-manual-column-audit.md", ...(await fileInfo(MANUAL_COLUMN_AUDIT_MD)), purpose: "수동 원자료 컬럼 감사" },
    { artifact: "analysis/market-manual-normalization-audit.md", ...(await fileInfo(MANUAL_NORMALIZATION_MD)), purpose: "수동 원자료 정규화 감사" },
    { artifact: "data/market/manual-import/manifest.json", ...(await fileInfo("data/market/manual-import/manifest.json")), purpose: "수동 원자료 manifest" },
    { artifact: "data/market/manual-import/column-mapping.json", ...(await fileInfo("data/market/manual-import/column-mapping.json")), purpose: "수동 원자료 컬럼 매핑" },
    { artifact: "data/market/transactions/official-transactions-normalized.csv", ...normalizedInfo, purpose: "정규화 거래 원자료" },
    { artifact: "data/market/transactions/official-transactions-project-matches.csv", ...matchedInfo, purpose: "사업장 키워드 매칭 거래" },
    { artifact: "data/market/transactions/manual-official-transactions-normalized.csv", ...manualNormalizedInfo, purpose: "수동 반입 거래 정규화 결과" },
    { artifact: "data/market/transactions/manual-official-transactions-project-matches.csv", ...manualMatchedInfo, purpose: "수동 반입 거래 사업장 매칭" },
    { artifact: "data/market/indicators/manual-market-indicators-normalized.csv", ...manualIndicatorsInfo, purpose: "수동 반입 지역 지표 정규화 결과" },
    { artifact: "data/market/market-fetch-summary.json", ...(await fileInfo(FETCH_SUMMARY_INPUT)), purpose: "최근 원격 수집 요약" },
  ];
  const fetchablePlanCount = planRows.filter((row) => row.status === "fetchable").length;
  const blockedPlanCount = planRows.filter((row) => String(row.status || "").startsWith("missing_env:")).length;
  const summary = {
    generated_at: UPDATED_AT,
    project_count: areaRows.length,
    source_metadata_count: sourceRowsCsv.length,
    plan_count: planRows.length,
    fetchable_plan_count: fetchablePlanCount,
    blocked_plan_count: blockedPlanCount,
    raw_file_count: rawFileCount,
    normalized_transactions_exists: normalizedInfo.exists,
    normalized_transactions_bytes: normalizedInfo.bytes,
    project_matches_exists: matchedInfo.exists,
    project_matches_bytes: matchedInfo.bytes,
    market_raw_collection_ready: rawFileCount > 0 && normalizedInfo.exists === "Y" ? "partial_or_ready" : "blocked_or_not_fetched",
    diagnostics_exists: diagnostics ? "Y" : "N",
    diagnostics_generated_at: diagnostics?.generated_at || "",
    manual_import_exists: manualImport ? "Y" : "N",
    manual_import_ready_count: manualImport?.summary?.ready_for_normalization_count || 0,
    manual_import_waiting_count: manualImport?.summary?.waiting_for_download_count || 0,
    manual_column_audit_exists: manualColumnAudit ? "Y" : "N",
    manual_column_audit_ready_count: manualColumnAudit?.summary?.ready_for_mapping_count || 0,
    manual_column_audit_waiting_count: manualColumnAudit?.summary?.waiting_for_file_count || 0,
    manual_normalization_exists: manualNormalization ? "Y" : "N",
    manual_normalized_transactions: manualNormalization?.summary?.normalized_transactions || 0,
    manual_project_matched_transactions: manualNormalization?.summary?.project_matched_transactions || 0,
    manual_normalized_indicators: manualNormalization?.summary?.normalized_indicators || 0,
    last_fetch_summary: fetchSummary || {},
    plan_status_counts: countBy(planRows, "status"),
    source_counts: countBy(planRows, "source"),
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    OUT_JSON,
    `${JSON.stringify({ generated_at: UPDATED_AT, summary, sourceRows, focusRows, outputRows, diagnostics, manualImport, manualColumnAudit, manualNormalization }, null, 2)}\n`,
  );
  await writeFile(OUT_CSV, toCsv(sourceRows));
  await writeFile(OUT_MD, markdown({ summary, sourceRows, focusRows, outputRows, diagnostics, manualImport, manualColumnAudit, manualNormalization }));
  console.log(
    JSON.stringify(
      {
        planRows: summary.plan_count,
        fetchablePlanRows: summary.fetchable_plan_count,
        blockedPlanRows: summary.blocked_plan_count,
        rawFiles: summary.raw_file_count,
        output: "analysis/market-api-readiness-audit.{md,csv,json}",
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
