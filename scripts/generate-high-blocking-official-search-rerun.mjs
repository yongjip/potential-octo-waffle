#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-official-search-rerun.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-official-search-rerun.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-official-search-rerun.json");

const GWANGJIN_INPUT = "data/urban/gwangjin-gu-notice-candidates.json";
const BUSINESS_LAYER_INPUT = "data/urban/business-layer-notice-candidates.csv";
const PUBLIC_WEB_INPUT = "analysis/high-blocking-public-web-probe.json";
const PUBLIC_SEARCH_LOG_INPUT = "data/review/high-blocking-public-search-log.json";

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
const TARGET_RANKS = new Set(["9", "23", "28"]);

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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers = [], ...body] = rows.filter((items) => items.some((item) => item !== ""));
  return body.map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ""])));
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
  } catch {
    if (fallback !== null) return fallback;
    throw new Error(`Cannot read JSON: ${file}`);
  }
}

function rowsFromJson(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc.has(rank)) acc.set(rank, []);
    acc.get(rank).push(row);
    return acc;
  }, new Map());
}

function publicSummary(publicRows) {
  if (!publicRows.length) return "";
  return publicRows
    .map((row) => {
      const status = row.public_notice_disclosure_status || row.resolution_effect || "";
      return `${row.source_name}: ${status || row.remaining_gap}`;
    })
    .join("; ");
}

function officialChannelSummary(publicSearch) {
  return publicSearch.official_channel_search_summary || "";
}

function conclusionFor(rank, gwangjin, business, publicRows) {
  if (rank === "9") {
    return "관리처분 공사비는 비회원 공개 화면에서 미노출이라 송파구/정보몽땅 회신 또는 정보공개청구가 필요";
  }
  const officialMisses = [gwangjin?.search_status, business?.search_status].filter(Boolean).every((status) => status === "no_candidate");
  const publicDisclosureZero = publicRows.some((row) => String(row.public_notice_disclosure_status || "").includes("0건"));
  if (officialMisses && publicDisclosureZero) {
    return "공식 공개 검색은 현재 소진. 조합설립인가 고시번호·고시일·첨부 원문은 담당부서/정보공개 회신 필요";
  }
  return "공식 공개 후보 검토 필요";
}

function buildRows({ gwangjinRows, businessRows, publicRows, publicSearchRows }) {
  const gwangjinByRank = byRank(gwangjinRows);
  const businessByRank = byRank(businessRows);
  const publicByRank = groupByRank(publicRows);
  const publicSearchByRank = byRank(publicSearchRows);

  return [...TARGET_RANKS]
    .map((rank) => {
      const gwangjin = gwangjinByRank.get(rank) || {};
      const business = businessByRank.get(rank) || {};
      const publicForRank = publicByRank.get(rank) || [];
      const publicSearch = publicSearchByRank.get(rank) || {};
      const projectName = gwangjin.project_name || business.project_name || publicForRank[0]?.project_name || "";
      return {
        rank,
        project_name: projectName,
        rerun_scope:
          rank === "9"
            ? "정보몽땅 비회원 공개항목 접근 확인"
            : "광진구청 고시공고 재검색; 서울도시공간포털 결정고시 검색; 정보몽땅 사업개요/정보공개목록 확인",
        corrected_keyword_or_access:
          rank === "9"
            ? "cleanup 공개항목 vscrCafe 비회원 호출"
            : gwangjin.search_keyword || business.search_keyword || "",
        gwangjin_notice_status: gwangjin.search_status || "not_applicable",
        urban_notice_status: business.search_status || "not_applicable",
        public_web_status: publicSummary(publicForRank),
        general_web_search_status: publicSearch.official_result_status || "not_logged",
        general_web_search_queries: Array.isArray(publicSearch.queries) ? publicSearch.queries.join("; ") : "",
        general_web_search_summary: publicSearch.usable_result_summary || "",
        official_channel_search_summary: officialChannelSummary(publicSearch),
        official_probe_status: publicSearch.official_probe_status || "not_logged",
        official_probe_summary: publicSearch.official_probe_summary || "",
        official_probe_output: publicSearch.official_probe_output || "",
        official_url_found: gwangjin.official_url || business.notice_file_url || "",
        remaining_gap:
          rank === "9"
            ? "관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문"
            : "조합설립인가 고시번호, 고시일, 원문/첨부 URL",
        conclusion: conclusionFor(rank, gwangjin, business, publicForRank),
        next_action:
          rank === "9"
            ? "송파구 주택사업과 또는 정보몽땅 권한/정보공개청구로 관리처분 공사비 기준 자료 확인"
            : "광진구 주거사업과 또는 정보몽땅 담당 창구에 조합설립인가 원문 식별자 확인",
      };
    })
    .sort((a, b) => Number(a.rank) - Number(b.rank));
}

function markdown({ summary, rows }) {
  return `# High Blocking 공식 검색 재실행 감사

작성 기준: ${UPDATED_AT}

이 문서는 high blocking으로 남은 3개 사업장에 대해 공식 공개 검색을 다시 확인한 결과를 별도로 고정한다. 특히 자양번영로3나길 일대는 대표 지번 검색어를 \`자양동 588-22\`로 바로잡아 광진구청 고시공고를 재검색했지만, 비회원 공개 원문 후보는 확인되지 않았다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 광진구 재검색 대상 | ${summary.gwangjin_rerun_count} |
| 광진구 재검색 후 no_candidate | ${summary.gwangjin_no_candidate_count} |
| 서울도시공간포털 no_candidate | ${summary.urban_no_candidate_count} |
| 일반 웹 검색 no_official_original_found | ${summary.general_web_no_official_count} |
| 공식 프로브 원문 후보 미확보 | ${summary.official_probe_no_actionable_count} |
| 외부 회신 필요 | ${summary.external_response_required_count} |

## 재실행 결과

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "rerun_scope", label: "재확인 범위" },
  { key: "corrected_keyword_or_access", label: "검색어/접근" },
  { key: "gwangjin_notice_status", label: "광진구청" },
  { key: "urban_notice_status", label: "서울도시공간포털" },
  { key: "public_web_status", label: "정보몽땅 공개화면" },
  { key: "official_channel_search_summary", label: "공식 게시판 재검색" },
  { key: "general_web_search_status", label: "일반 웹 검색" },
  { key: "official_probe_status", label: "공식 프로브" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "conclusion", label: "판정" },
  { key: "next_action", label: "다음 행동" },
])}

## 공식 프로브 로그

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "official_channel_search_summary", label: "공식 게시판 재검색" },
  { key: "official_probe_status", label: "상태" },
  { key: "official_probe_summary", label: "요약" },
  { key: "official_probe_output", label: "산출물" },
])}

## 일반 웹 검색 로그

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "general_web_search_queries", label: "질의어" },
  { key: "general_web_search_summary", label: "검색 요약" },
])}

## 판정 기준

- 조합설립인가 건은 자치구 고시공고, 서울도시공간포털 결정고시, 정보몽땅 정보공개목록 중 어느 한 곳에서도 고시번호·고시일·원문 URL이 확인되어야 confirmed로 승격한다.
- 정보몽땅 사업개요의 면적·용적률·층수 등 요약값은 보조근거로만 사용하고, 고시 원문 식별자를 대신하지 않는다.
- 잠실우성4차 관리처분 공사비는 비회원 공개항목 호출에서 값이 노출되지 않으므로, 공개 URL 발견이 아니라 담당부서/권한/정보공개 회신으로 닫아야 한다.
`;
}

async function main() {
  const gwangjinRows = rowsFromJson(await readJson(GWANGJIN_INPUT));
  const businessRows = parseCsv(await readFile(BUSINESS_LAYER_INPUT, "utf8"));
  const publicPayload = await readJson(PUBLIC_WEB_INPUT);
  const publicRows = publicPayload.rows || [];
  const publicSearchRows = rowsFromJson(await readJson(PUBLIC_SEARCH_LOG_INPUT, []));
  const rows = buildRows({ gwangjinRows, businessRows, publicRows, publicSearchRows });
  const summary = {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    gwangjin_rerun_count: rows.filter((row) => row.gwangjin_notice_status !== "not_applicable").length,
    gwangjin_no_candidate_count: rows.filter((row) => row.gwangjin_notice_status === "no_candidate").length,
    urban_no_candidate_count: rows.filter((row) => row.urban_notice_status === "no_candidate").length,
    general_web_no_official_count: rows.filter((row) => row.general_web_search_status === "no_official_original_found").length,
    official_probe_no_actionable_count: rows.filter((row) =>
      ["no_actionable_candidate", "not_in_source_link_probe_scope"].includes(row.official_probe_status),
    ).length,
    external_response_required_count: rows.filter((row) => row.conclusion.includes("회신") || row.conclusion.includes("정보공개")).length,
    inputs: [GWANGJIN_INPUT, BUSINESS_LAYER_INPUT, PUBLIC_WEB_INPUT, PUBLIC_SEARCH_LOG_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown({ summary, rows }));
  console.log(JSON.stringify({ rows: rows.length, output: "analysis/high-blocking-official-search-rerun.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
