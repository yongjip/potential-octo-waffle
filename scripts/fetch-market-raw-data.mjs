#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MARKET_INPUT = "data/market/project-market-areas.json";
const OUT_DIR = "data/market";
const RAW_DIR = path.join(OUT_DIR, "raw");
const NORMALIZED_DIR = path.join(OUT_DIR, "transactions");
const DIAGNOSTICS_JSON = path.join(OUT_DIR, "market-fetch-diagnostics.json");
const DIAGNOSTICS_MD = path.join(OUT_DIR, "market-fetch-diagnostics.md");
const DEFAULT_PAGE_SIZE = 1000;

const MOLIT_SOURCES = {
  "molit-apt-trade": {
    label: "국토교통부 아파트 매매 실거래자료",
    endpointEnv: "MOLIT_APT_TRADE_ENDPOINT",
    defaultEndpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev",
    requiredAsset: "apartment",
    recordType: "apartment_trade",
  },
  "molit-apt-rent": {
    label: "국토교통부 아파트 전월세 실거래자료",
    endpointEnv: "MOLIT_APT_RENT_ENDPOINT",
    defaultEndpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent",
    requiredAsset: "apt_rent",
    recordType: "apartment_rent",
  },
  "molit-rowhouse-trade": {
    label: "국토교통부 연립/다세대 매매 실거래자료",
    endpointEnv: "MOLIT_ROWHOUSE_TRADE_ENDPOINT",
    defaultEndpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade",
    requiredAsset: "rowhouse_multifamily",
    recordType: "rowhouse_trade",
  },
  "molit-rowhouse-rent": {
    label: "국토교통부 연립/다세대 전월세 실거래자료",
    endpointEnv: "MOLIT_ROWHOUSE_RENT_ENDPOINT",
    defaultEndpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent",
    requiredAsset: "rowhouse_multifamily",
    recordType: "rowhouse_rent",
  },
};

const SEOUL_SOURCE = {
  source: "seoul-open-data",
  label: "서울시 부동산 실거래가 정보",
  serviceEnv: "SEOUL_REAL_ESTATE_SERVICE",
  defaultService: "tbLnOpendataRtmsV",
  keyEnv: "SEOUL_OPEN_DATA_KEY",
  baseUrlEnv: "SEOUL_OPEN_DATA_BASE_URL",
  defaultBaseUrl: "http://openapi.seoul.go.kr:8088",
};

function parseArgs(argv) {
  const args = {
    fetch: false,
    diagnose: false,
    from: "",
    to: "",
    ranks: new Set(),
    focus: "",
    sources: new Set([...Object.keys(MOLIT_SOURCES), SEOUL_SOURCE.source]),
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: 20,
  };

  for (const arg of argv) {
    if (arg === "--fetch") args.fetch = true;
    else if (arg === "--diagnose") args.diagnose = true;
    else if (arg === "--plan-only") args.fetch = false;
    else if (arg.startsWith("--from=")) args.from = arg.slice("--from=".length);
    else if (arg.startsWith("--to=")) args.to = arg.slice("--to=".length);
    else if (arg.startsWith("--focus=")) args.focus = arg.slice("--focus=".length);
    else if (arg.startsWith("--ranks=")) {
      args.ranks = new Set(arg.slice("--ranks=".length).split(",").map((value) => value.trim()).filter(Boolean));
    } else if (arg.startsWith("--sources=")) {
      args.sources = new Set(arg.slice("--sources=".length).split(",").map((value) => value.trim()).filter(Boolean));
    } else if (arg.startsWith("--page-size=")) {
      args.pageSize = Number(arg.slice("--page-size=".length));
    } else if (arg.startsWith("--max-pages=")) {
      args.maxPages = Number(arg.slice("--max-pages=".length));
    } else if (arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606
  node scripts/fetch-market-raw-data.mjs --diagnose --from=202401 --to=202606
  DATA_GO_KR_SERVICE_KEY=... node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade,molit-apt-rent --from=202401 --to=202606
  SEOUL_OPEN_DATA_KEY=... node scripts/fetch-market-raw-data.mjs --fetch --sources=seoul-open-data --from=202601 --to=202606 --max-pages=5

Options:
  --fetch                 Fetch remote data. Without this, only a query plan is written.
  --diagnose              Write key/readiness diagnostics and smoke-test commands without remote calls.
  --plan-only             Write the query plan only.
  --from=YYYYMM           First deal month. Default: 18 months before --to.
  --to=YYYYMM             Last deal month. Default: current month.
  --focus=강남            Filter by focus area text.
  --ranks=1,2,3           Filter by candidate ranks.
  --sources=a,b           Source list. Includes molit-* and seoul-open-data.
  --page-size=1000        API page size.
  --max-pages=20          Safety cap per query.
`);
}

function yyyymm(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(ym, delta) {
  const year = Number(ym.slice(0, 4));
  const month = Number(ym.slice(4, 6));
  const date = new Date(year, month - 1 + delta, 1);
  return yyyymm(date);
}

function monthRange(from, to) {
  const months = [];
  let cursor = from;
  while (cursor <= to) {
    months.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  return months;
}

function parseKeywords(value) {
  return String(value || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function countBy(rows, getter) {
  return rows.reduce((acc, row) => {
    const key = typeof getter === "function" ? getter(row) : row[getter];
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

function selectedProjects(rows, args) {
  return rows.filter((row) => {
    if (args.ranks.size > 0 && !args.ranks.has(String(row.rank))) return false;
    if (args.focus && !String(row.focus_area).includes(args.focus)) return false;
    return row.market_data_status === "ready_for_api_key";
  });
}

function buildFetchPlan(projectRows, months, args) {
  const plan = [];
  const seen = new Set();

  for (const row of projectRows) {
    for (const source of args.sources) {
      if (source === SEOUL_SOURCE.source) {
        for (const month of months) {
          const key = [source, row.district, row.dong, month].join("|");
          if (seen.has(key)) continue;
          seen.add(key);
          plan.push({
            source,
            source_label: SEOUL_SOURCE.label,
            query_scope: "local_filter_after_api_page_scan",
            lawd_cd: row.lawd_cd,
            district: row.district,
            dong: row.dong,
            deal_ymd: month,
            ranks: projectRows
              .filter((candidate) => candidate.district === row.district && candidate.dong === row.dong)
              .map((candidate) => candidate.rank)
              .join(";"),
            status: process.env[SEOUL_SOURCE.keyEnv] ? "fetchable" : `missing_env:${SEOUL_SOURCE.keyEnv}`,
          });
        }
        continue;
      }

      const sourceConfig = MOLIT_SOURCES[source];
      if (!sourceConfig) throw new Error(`Unknown source: ${source}`);
      if (!String(row.preferred_asset_types).includes(sourceConfig.requiredAsset)) continue;

      for (const month of months) {
        const key = [source, row.lawd_cd, month].join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        plan.push({
          source,
          source_label: sourceConfig.label,
          query_scope: "district_month",
          lawd_cd: row.lawd_cd,
          district: row.district,
          dong: "",
          deal_ymd: month,
          ranks: projectRows
            .filter((candidate) => candidate.lawd_cd === row.lawd_cd && String(candidate.preferred_asset_types).includes(sourceConfig.requiredAsset))
            .map((candidate) => candidate.rank)
            .join(";"),
          status: process.env.DATA_GO_KR_SERVICE_KEY ? "fetchable" : "missing_env:DATA_GO_KR_SERVICE_KEY",
        });
      }
    }
  }

  return plan.sort((a, b) => [a.source, a.lawd_cd, a.dong, a.deal_ymd].join("|").localeCompare([b.source, b.lawd_cd, b.dong, b.deal_ymd].join("|")));
}

function buildDiagnostics({ projects, months, plan, args }) {
  const env = {
    DATA_GO_KR_SERVICE_KEY: process.env.DATA_GO_KR_SERVICE_KEY ? "present" : "missing",
    SEOUL_OPEN_DATA_KEY: process.env.SEOUL_OPEN_DATA_KEY ? "present" : "missing",
    SEOUL_REAL_ESTATE_SERVICE: process.env.SEOUL_REAL_ESTATE_SERVICE || SEOUL_SOURCE.defaultService,
    SEOUL_OPEN_DATA_BASE_URL: process.env.SEOUL_OPEN_DATA_BASE_URL || SEOUL_SOURCE.defaultBaseUrl,
    MOLIT_APT_TRADE_ENDPOINT: process.env.MOLIT_APT_TRADE_ENDPOINT || MOLIT_SOURCES["molit-apt-trade"].defaultEndpoint,
    MOLIT_APT_RENT_ENDPOINT: process.env.MOLIT_APT_RENT_ENDPOINT || MOLIT_SOURCES["molit-apt-rent"].defaultEndpoint,
    MOLIT_ROWHOUSE_TRADE_ENDPOINT: process.env.MOLIT_ROWHOUSE_TRADE_ENDPOINT || MOLIT_SOURCES["molit-rowhouse-trade"].defaultEndpoint,
    MOLIT_ROWHOUSE_RENT_ENDPOINT: process.env.MOLIT_ROWHOUSE_RENT_ENDPOINT || MOLIT_SOURCES["molit-rowhouse-rent"].defaultEndpoint,
  };
  const sourceRows = Object.entries(countBy(plan, "source")).map(([source, count]) => {
    const rows = plan.filter((row) => row.source === source);
    return {
      source,
      plan_count: count,
      status_mix: countText(countBy(rows, "status")),
      first_month: rows[0]?.deal_ymd || "",
      last_month: rows.at(-1)?.deal_ymd || "",
      sample_scope: `${rows[0]?.district || ""} ${rows[0]?.dong || ""}`.trim(),
    };
  });
  const focusRows = Object.entries(countBy(projects, "focus_area")).map(([focus_area, project_count]) => {
    const ranks = new Set(projects.filter((row) => row.focus_area === focus_area).map((row) => String(row.rank)));
    const rows = plan.filter((row) => String(row.ranks || "").split(";").some((rank) => ranks.has(rank)));
    return {
      focus_area,
      project_count,
      plan_count: rows.length,
      sources: countText(countBy(rows, "source")),
      statuses: countText(countBy(rows, "status")),
      smoke_ranks: projects
        .filter((row) => row.focus_area === focus_area)
        .slice(0, 2)
        .map((row) => row.rank)
        .join(","),
    };
  });
  const to = args.to || months.at(-1);
  const smokeMonth = to;
  const smokeCommands = [
    {
      label: "국토부 아파트 매매 1개월 스모크",
      command: `DATA_GO_KR_SERVICE_KEY=\"...\" node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade --ranks=1 --from=${smokeMonth} --to=${smokeMonth} --max-pages=1`,
    },
    {
      label: "국토부 연립/다세대 1개월 스모크",
      command: `DATA_GO_KR_SERVICE_KEY=\"...\" node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-rowhouse-trade,molit-rowhouse-rent --ranks=25,28 --from=${smokeMonth} --to=${smokeMonth} --max-pages=1`,
    },
    {
      label: "서울 열린데이터 1개월 스모크",
      command: `SEOUL_OPEN_DATA_KEY=\"...\" node scripts/fetch-market-raw-data.mjs --fetch --sources=seoul-open-data --ranks=1 --from=${smokeMonth} --to=${smokeMonth} --max-pages=1`,
    },
    {
      label: "전체 계획 갱신",
      command: `node scripts/fetch-market-raw-data.mjs --plan-only --from=${months[0]} --to=${to}`,
    },
  ];
  return {
    generated_at: new Date().toISOString(),
    mode: "diagnose",
    selected_projects: projects.length,
    months: months.length,
    plan_rows: plan.length,
    fetchable_plan_rows: plan.filter((row) => row.status === "fetchable").length,
    blocked_plan_rows: plan.filter((row) => String(row.status || "").startsWith("missing_env:")).length,
    environment: env,
    source_rows: sourceRows,
    focus_rows: focusRows,
    smoke_commands: smokeCommands,
    sample_plan_rows: plan.slice(0, 20),
  };
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function diagnosticsMarkdown(diagnostics) {
  return `# 시장 원자료 수집 진단

작성 기준: ${diagnostics.generated_at}

이 문서는 API 키를 넣기 전후에 시장 원자료 수집기가 어떤 상태인지 확인하기 위한 실행 진단이다. 인증키 값은 저장하지 않고 존재 여부만 기록한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 선택 사업장 | ${diagnostics.selected_projects} |
| 조회 월 | ${diagnostics.months} |
| API 계획 | ${diagnostics.plan_rows} |
| 수집 가능 계획 | ${diagnostics.fetchable_plan_rows} |
| 키 누락 계획 | ${diagnostics.blocked_plan_rows} |

## 환경변수

${mdTable(
  Object.entries(diagnostics.environment).map(([name, value]) => ({ name, value })),
  [
    { key: "name", label: "항목" },
    { key: "value", label: "현재값" },
  ],
)}

## 출처별 상태

${mdTable(diagnostics.source_rows, [
  { key: "source", label: "출처" },
  { key: "plan_count", label: "계획" },
  { key: "status_mix", label: "상태" },
  { key: "first_month", label: "시작월" },
  { key: "last_month", label: "종료월" },
  { key: "sample_scope", label: "예시 범위" },
])}

## 생활권별 축소 실행

${mdTable(diagnostics.focus_rows, [
  { key: "focus_area", label: "생활권" },
  { key: "project_count", label: "사업장" },
  { key: "plan_count", label: "계획" },
  { key: "sources", label: "출처" },
  { key: "statuses", label: "상태" },
  { key: "smoke_ranks", label: "스모크 후보" },
])}

## 추천 스모크 테스트

${diagnostics.smoke_commands.map((row) => `### ${row.label}\n\n\`\`\`bash\n${row.command}\n\`\`\``).join("\n\n")}

## 판정

- \`DATA_GO_KR_SERVICE_KEY\`가 present이면 국토부 실거래 스모크부터 실행한다.
- \`SEOUL_OPEN_DATA_KEY\`가 present이면 서울 열린데이터 스모크를 \`--max-pages=1\`로 먼저 실행한다.
- 스모크가 성공하면 기간을 3개월, 12개월, 전체 계획 순서로 넓힌다.
`;
}

async function fetchMolit(planRow, sourceConfig, args) {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) throw new Error("DATA_GO_KR_SERVICE_KEY is required for MOLIT sources.");

  const endpoint = process.env[sourceConfig.endpointEnv] || sourceConfig.defaultEndpoint;
  const rawRows = [];
  const normalizedRows = [];
  let totalCount = null;

  for (let pageNo = 1; pageNo <= args.maxPages; pageNo += 1) {
    const url = new URL(endpoint);
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("LAWD_CD", planRow.lawd_cd);
    url.searchParams.set("DEAL_YMD", planRow.deal_ymd);
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("numOfRows", String(args.pageSize));

    const response = await fetch(url);
    const text = await response.text();
    const rawFile = path.join(RAW_DIR, planRow.source, `${planRow.lawd_cd}-${planRow.deal_ymd}-p${pageNo}.txt`);
    await mkdir(path.dirname(rawFile), { recursive: true });
    await writeFile(rawFile, text);

    if (!response.ok) throw new Error(`${planRow.source} ${planRow.lawd_cd} ${planRow.deal_ymd} failed: HTTP ${response.status}`);

    const parsed = parseApiPayload(text);
    if (totalCount === null) totalCount = parsed.totalCount;
    const items = parsed.items.map((item) => ({
      ...item,
      source: planRow.source,
      source_label: sourceConfig.label,
      record_type: sourceConfig.recordType,
      lawd_cd: planRow.lawd_cd,
      deal_ymd: planRow.deal_ymd,
      raw_file: rawFile,
    }));
    rawRows.push(...items);
    normalizedRows.push(...items.map(normalizeTransactionRecord));

    if (items.length < args.pageSize) break;
    if (totalCount !== null && rawRows.length >= totalCount) break;
  }

  return normalizedRows;
}

async function fetchSeoulOpenData(planRow, args) {
  const key = process.env[SEOUL_SOURCE.keyEnv];
  if (!key) throw new Error(`${SEOUL_SOURCE.keyEnv} is required for Seoul Open Data.`);

  const baseUrl = process.env[SEOUL_SOURCE.baseUrlEnv] || SEOUL_SOURCE.defaultBaseUrl;
  const service = process.env[SEOUL_SOURCE.serviceEnv] || SEOUL_SOURCE.defaultService;
  const normalizedRows = [];

  for (let pageNo = 1; pageNo <= args.maxPages; pageNo += 1) {
    const start = (pageNo - 1) * args.pageSize + 1;
    const end = pageNo * args.pageSize;
    const url = `${baseUrl.replace(/\/$/, "")}/${key}/json/${service}/${start}/${end}/`;
    const response = await fetch(url);
    const text = await response.text();
    const rawFile = path.join(RAW_DIR, SEOUL_SOURCE.source, `${planRow.district}-${planRow.dong}-${planRow.deal_ymd}-p${pageNo}.json`);
    await mkdir(path.dirname(rawFile), { recursive: true });
    await writeFile(rawFile, text);

    if (!response.ok) throw new Error(`${SEOUL_SOURCE.source} failed: HTTP ${response.status}`);
    const parsed = JSON.parse(text);
    const serviceObject = parsed[service] || Object.values(parsed).find((value) => value && Array.isArray(value.row));
    const rows = serviceObject?.row || [];
    const filteredRows = rows.filter((record) => {
      const district = pick(record, ["CGG_NM", "SGG_NM", "자치구", "SIGUNGU_NM"]);
      const dong = pick(record, ["STDG_NM", "BJDONG_NM", "법정동", "DONG_NM"]);
      const year = pick(record, ["RCPT_YR", "DEAL_YR", "신고년도", "계약년도"]);
      return contains(district, planRow.district.replace("구", "")) && contains(dong, planRow.dong.replace("동", "")) && (!year || String(year).startsWith(planRow.deal_ymd.slice(0, 4)));
    });

    normalizedRows.push(
      ...filteredRows.map((record) =>
        normalizeTransactionRecord({
          ...record,
          source: SEOUL_SOURCE.source,
          source_label: SEOUL_SOURCE.label,
          record_type: "seoul_real_estate_trade",
          lawd_cd: planRow.lawd_cd,
          deal_ymd: planRow.deal_ymd,
          raw_file: rawFile,
        }),
      ),
    );

    if (rows.length < args.pageSize) break;
  }

  return normalizedRows;
}

function parseApiPayload(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    const json = JSON.parse(trimmed);
    const body = json.response?.body || json.body || {};
    const items = body.items?.item || body.items || [];
    return {
      totalCount: Number(body.totalCount ?? items.length),
      items: Array.isArray(items) ? items : [items],
    };
  }

  return {
    totalCount: Number(firstXmlValue(trimmed, "totalCount") || 0),
    items: extractXmlItems(trimmed),
  };
}

function firstXmlValue(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function extractXmlItems(xml) {
  const items = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;
  for (const itemMatch of xml.matchAll(itemPattern)) {
    const item = {};
    const tagPattern = /<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g;
    for (const tagMatch of itemMatch[1].matchAll(tagPattern)) {
      item[tagMatch[1]] = decodeXml(tagMatch[2].trim());
    }
    items.push(item);
  }
  return items;
}

function decodeXml(value) {
  return value.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&apos;", "'");
}

function normalizeTransactionRecord(record) {
  return {
    source: record.source || "",
    source_label: record.source_label || "",
    record_type: record.record_type || "",
    lawd_cd: record.lawd_cd || "",
    deal_ymd: record.deal_ymd || dealYmdFromRecord(record),
    legal_dong: pick(record, ["umdNm", "법정동", "STDG_NM", "BJDONG_NM", "dong", "법정동명"]),
    asset_name: pick(record, ["aptNm", "mhouseNm", "단지명", "건물명", "BLDG_NM", "bldgNm"]),
    jibun: pick(record, ["jibun", "지번", "LOTNO", "bonbun"]),
    deal_amount: normalizeNumber(pick(record, ["dealAmount", "거래금액", "OBJ_AMT", "thingAmt"])),
    deposit_amount: normalizeNumber(pick(record, ["deposit", "보증금액", "rentDeposit", "RENT_GTN"])),
    monthly_rent: normalizeNumber(pick(record, ["monthlyRent", "월세금액", "RENT_FEE"])),
    area_sqm: normalizeNumber(pick(record, ["excluUseAr", "전용면적", "BLDG_AREA", "archArea"])),
    floor: normalizeNumber(pick(record, ["floor", "층", "FLOOR"])),
    build_year: pick(record, ["buildYear", "건축년도", "ARCH_YR", "buildY"]),
    deal_year: pick(record, ["dealYear", "년", "RCPT_YR"]),
    deal_month: pick(record, ["dealMonth", "월", "DEAL_MM"]),
    deal_day: pick(record, ["dealDay", "일", "DEAL_DD"]),
    cancel_date: pick(record, ["cdealDay", "해제사유발생일", "cancelDate"]),
    raw_file: record.raw_file || "",
  };
}

function dealYmdFromRecord(record) {
  const year = pick(record, ["dealYear", "년", "RCPT_YR"]);
  const month = pick(record, ["dealMonth", "월", "DEAL_MM"]);
  if (!year || !month) return "";
  return `${year}${String(month).padStart(2, "0")}`;
}

function pick(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function normalizeNumber(value) {
  const text = String(value || "").replaceAll(",", "").trim();
  if (!text) return "";
  return Number.isNaN(Number(text)) ? text : String(Number(text));
}

function contains(value, needle) {
  return String(value || "").includes(String(needle || ""));
}

function matchTransactionsToProjects(transactions, projectRows) {
  const matched = [];

  for (const transaction of transactions) {
    const candidates = projectRows.filter((project) => {
      if (project.lawd_cd !== transaction.lawd_cd) return false;
      if (transaction.legal_dong && !transaction.legal_dong.includes(project.dong.replace("동", ""))) return false;
      const keywords = parseKeywords(project.target_complex_keywords);
      if (keywords.length === 0) return true;
      const haystack = `${transaction.asset_name} ${transaction.legal_dong} ${transaction.jibun}`;
      return keywords.some((keyword) => haystack.includes(keyword));
    });

    for (const project of candidates) {
      matched.push({
        rank: project.rank,
        focus_area: project.focus_area,
        project_name: project.project_name,
        current_stage: project.current_stage,
        notice_date: project.notice_date,
        target_complex_keywords: project.target_complex_keywords,
        ...transaction,
      });
    }
  }

  return matched;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  return `${lines.join("\n")}\n`;
}

async function writeRows(basePath, rows) {
  await writeFile(`${basePath}.json`, JSON.stringify(rows, null, 2));
  await writeFile(`${basePath}.csv`, toCsv(rows));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const marketRows = JSON.parse(await readFile(MARKET_INPUT, "utf8"));
  const projects = selectedProjects(marketRows, args);
  if (projects.length === 0) throw new Error("No market rows selected.");

  const currentMonth = yyyymm(new Date());
  const to = args.to || currentMonth;
  const from = args.from || addMonths(to, -18);
  const months = monthRange(from, to);
  const plan = buildFetchPlan(projects, months, args);

  await mkdir(OUT_DIR, { recursive: true });
  await writeRows(path.join(OUT_DIR, "market-fetch-plan"), plan);

  if (args.diagnose) {
    const diagnostics = buildDiagnostics({ projects, months, plan, args });
    await writeFile(DIAGNOSTICS_JSON, `${JSON.stringify(diagnostics, null, 2)}\n`);
    await writeFile(DIAGNOSTICS_MD, diagnosticsMarkdown(diagnostics));
    console.log(
      JSON.stringify(
        {
          mode: "diagnose",
          selectedProjects: projects.length,
          months: months.length,
          planRows: plan.length,
          fetchablePlanRows: diagnostics.fetchable_plan_rows,
          blockedPlanRows: diagnostics.blocked_plan_rows,
          output: "data/market/market-fetch-diagnostics.{md,json}",
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!args.fetch) {
    console.log(
      JSON.stringify(
        {
          mode: "plan-only",
          selectedProjects: projects.length,
          months: months.length,
          planRows: plan.length,
          output: "data/market/market-fetch-plan.{csv,json}",
        },
        null,
        2,
      ),
    );
    return;
  }

  const allTransactions = [];
  for (const planRow of plan.filter((row) => row.status === "fetchable")) {
    if (MOLIT_SOURCES[planRow.source]) {
      allTransactions.push(...(await fetchMolit(planRow, MOLIT_SOURCES[planRow.source], args)));
    } else if (planRow.source === SEOUL_SOURCE.source) {
      allTransactions.push(...(await fetchSeoulOpenData(planRow, args)));
    }
  }

  await mkdir(NORMALIZED_DIR, { recursive: true });
  const matched = matchTransactionsToProjects(allTransactions, projects);
  await writeRows(path.join(NORMALIZED_DIR, "official-transactions-normalized"), allTransactions);
  await writeRows(path.join(NORMALIZED_DIR, "official-transactions-project-matches"), matched);
  await writeFile(
    path.join(OUT_DIR, "market-fetch-summary.json"),
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        selectedProjects: projects.length,
        planRows: plan.length,
        fetchablePlanRows: plan.filter((row) => row.status === "fetchable").length,
        normalizedTransactions: allTransactions.length,
        projectMatchedTransactions: matched.length,
        outputDir: NORMALIZED_DIR,
      },
      null,
      2,
    ),
  );

  console.log(
    JSON.stringify(
      {
        mode: "fetch",
        selectedProjects: projects.length,
        planRows: plan.length,
        normalizedTransactions: allTransactions.length,
        projectMatchedTransactions: matched.length,
        outputDir: NORMALIZED_DIR,
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
