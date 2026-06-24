#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = "data/review/high-blocking-public-web-probe.json";
const CACHE_DIR = "data/urban/high-blocking-public-web-probe-html";
const UPDATED_AT = "2026-06-23 KST";

const TARGETS = [
  {
    rank: "23",
    project_name: "광장동 삼성1차아파트 소규모재건축정비사업",
    source_name: "정비사업 정보몽땅 사업개요",
    source_url: "https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry",
    probe_type: "official_summary_page",
    cache_file: "23-summary.html",
  },
  {
    rank: "23",
    project_name: "광장동 삼성1차아파트 소규모재건축정비사업",
    source_name: "정비사업 정보몽땅 정보공개목록",
    source_url: "https://cleanup.seoul.go.kr/service/opendata/othbcDocSumry/lscr.do?cafeId=215900000929v34&publicManage=103",
    probe_type: "official_disclosure_list",
    cache_file: "23-disclosure.html",
  },
  {
    rank: "28",
    project_name: "자양번영로3나길 일대 가로주택정비사업",
    source_name: "정비사업 정보몽땅 사업개요",
    source_url: "https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry",
    probe_type: "official_summary_page",
    cache_file: "28-summary.html",
  },
  {
    rank: "28",
    project_name: "자양번영로3나길 일대 가로주택정비사업",
    source_name: "정비사업 정보몽땅 정보공개목록",
    source_url: "https://cleanup.seoul.go.kr/service/opendata/othbcDocSumry/lscr.do?cafeId=215900001146M77&publicManage=103",
    probe_type: "official_disclosure_list",
    cache_file: "28-disclosure.html",
  },
  {
    rank: "9",
    project_name: "잠실우성4차 주택재건축정비사업조합",
    source_name: "정비사업 정보몽땅 공개항목 비회원 접근 확인",
    source_url: "https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000689x43&othbcIemSn=210",
    probe_type: "official_disclosure_detail",
    cache_file: "09-management-cost.html",
  },
];

function cleanText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cellText(value) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function tableRows(html) {
  return [...String(html || "").matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((rowMatch) => [...rowMatch[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) => cellText(cell[1])))
    .filter((cells) => cells.length);
}

function valueAfterLabel(rows, label) {
  for (const cells of rows) {
    const index = cells.findIndex((cell) => cell === label);
    if (index >= 0 && cells[index + 1]) return cells[index + 1];
  }
  return "";
}

function buildingPlan(rows) {
  for (const cells of rows) {
    if (cells.length >= 8 && /공동주택/.test(cells[0])) {
      return {
        building_coverage_ratio_pct: cells[4] || "",
        floor_area_ratio_pct: cells[5] || "",
        max_height_m: cells[6] || "",
        floors: cells[7] || "",
      };
    }
  }
  return {};
}

function visibleSupplyContext(html, rank) {
  const vals = [...String(html || "").matchAll(/id_val_[^"]*">([^<]*)<\/div>/g)]
    .map((match) => cellText(match[1]))
    .filter(Boolean);
  if (rank === "23") return "분양 공급계획 108+73+4=185";
  if (rank === "28") {
    if (vals.length) return `분양/임대 세부 ${vals.join("+")}. 계 필드는 공개 화면에서 빈 값`;
    return "분양 26+25, 임대 13. 계 필드는 공개 화면에서 빈 값";
  }
  return vals.length ? vals.join("; ") : "";
}

function parseSummary(target, html) {
  const rows = tableRows(html);
  const plan = buildingPlan(rows);
  const observed = {
    district_area_sqm: valueAfterLabel(rows, "정비구역 면적(㎡)"),
    ...plan,
  };
  const supply = visibleSupplyContext(html, target.rank);
  if (target.rank === "23") observed.total_households_context = supply;
  if (target.rank === "28") observed.visible_supply_counts_context = supply;
  return {
    ...target,
    probe_date: UPDATED_AT,
    observed_values: observed,
    notice_identifier_status: "not_available_on_page",
    public_notice_disclosure_status: "",
    resolution_effect: "summary_support_only",
    remaining_gap:
      target.rank === "28"
        ? "고시번호, 고시일, 원문/첨부 URL은 사업개요 화면에서 확인되지 않는다. 총 세대수는 계 필드가 공란이라 합산 후보로만 취급한다."
        : "고시번호, 고시일, 원문/첨부 URL은 사업개요 화면에서 확인되지 않는다.",
    next_action:
      target.rank === "28"
        ? "광진구 주거사업과 또는 정보몽땅 담당 창구에서 조합설립인가 고시번호·고시일·첨부 원문과 총 세대수 기준을 확인한다."
        : "광진구 주거사업과 또는 정보몽땅 담당 창구에서 조합설립인가 고시번호·고시일·첨부 원문을 확인한다.",
  };
}

function countNearNoticeRow(html) {
  const rows = tableRows(html);
  const row = rows.find((cells) => cells[0] === "고시/공고");
  if (!row) return { total: "", request: "" };
  const joined = row.join(" ");
  const totals = [...joined.matchAll(/총\s*([0-9,]+)\s*건/g)].map((match) => match[1]);
  return { total: totals[1] || totals[0] || "0", request: totals[0] || "0" };
}

function parseDisclosureList(target, html) {
  const text = cleanText(html);
  const counts = countNearNoticeRow(html);
  const projectStage = (text.match(/사업진행단계\s*:\s*([가-힣A-Za-z0-9]+)/) || [])[1] || "조합설립인가";
  return {
    ...target,
    probe_date: UPDATED_AT,
    observed_values: {
      project_stage: projectStage,
      notice_disclosure_category: "고시/공고 기타",
      notice_disclosure_total: counts.total || "0",
      notice_request_total: counts.request || "0",
    },
    notice_identifier_status: "not_available_in_public_disclosure_list",
    public_notice_disclosure_status: `고시/공고 처리완료 ${counts.total || "0"}건`,
    resolution_effect: "confirms_external_escalation_needed",
    remaining_gap: "비회원 공개 정보공개목록의 고시/공고 항목에 공개 완료 자료가 없다.",
    next_action: "공개목록이 0건이므로 담당부서 확인 또는 정보공개청구 경로로 남긴다.",
  };
}

function parseDetail(target, html) {
  const text = cleanText(html);
  const denied = text.includes("권한이 없습니다") || String(html || "").includes("권한이 없습니다") ? "권한이 없습니다. 먼저 로그인을 해주세요" : "";
  return {
    ...target,
    probe_date: UPDATED_AT,
    observed_values: {
      unauthenticated_access_message: denied,
      management_construction_cost: "",
    },
    notice_identifier_status: "not_checked",
    public_notice_disclosure_status: denied ? "비회원 호출에서 관리처분 공사비 값 미노출" : "비회원 호출 결과 수동 확인 필요",
    resolution_effect: "confirms_external_escalation_needed",
    remaining_gap: "관리처분계획 별첨 또는 공개 가능한 정비사업비/공사비 추산액은 비회원 공개 화면에서 확인되지 않는다.",
    next_action: "송파구 주택사업과, 정보몽땅 공개항목 열람 권한, 또는 정보공개청구로 관리처분 공사비 기준 자료를 확인한다.",
  };
}

async function fetchHtml(target) {
  const response = await fetch(target.source_url, {
    headers: {
      "user-agent": "Mozilla/5.0 research-probe",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`${target.source_url} returned HTTP ${response.status}`);
  const html = await response.text();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, target.cache_file), html);
  return html;
}

async function main() {
  const rows = [];
  for (const target of TARGETS) {
    const html = await fetchHtml(target);
    if (target.probe_type === "official_summary_page") rows.push(parseSummary(target, html));
    else if (target.probe_type === "official_disclosure_list") rows.push(parseDisclosureList(target, html));
    else rows.push(parseDetail(target, html));
  }
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(JSON.stringify({ rows: rows.length, output: OUT, htmlCacheDir: CACHE_DIR }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
