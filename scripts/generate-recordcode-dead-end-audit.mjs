#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BUSINESS_LAYER_INPUT = "data/urban/map-missing-business-layer-details.json";
const BUSINESS_NOTICE_INPUT = "data/urban/business-layer-notice-candidates.json";
const GWANGJIN_NOTICE_INPUT = "data/urban/gwangjin-gu-notice-candidates.json";
const OFFICIAL_PROBE_INPUT = "analysis/source-link-official-probe.json";
const PROCESS_PROBE_INPUT = "data/cleanup/cleanup-process-page-probes.json";
const OUT_DIR = "analysis";
const OUT_MD = "recordcode-dead-end-audit.md";
const OUT_CSV = "recordcode-dead-end-audit.csv";
const OUT_JSON = "recordcode-dead-end-audit.json";

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

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
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

function mdTable(rows, fields) {
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function byRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function highNoticeCount(rows) {
  return rows.filter((row) => row.search_status === "candidate" && row.match_confidence === "high").length;
}

function lowNoticeCount(rows) {
  return rows.filter((row) => row.search_status === "candidate" && row.match_confidence === "low").length;
}

function latestHighNotice(rows) {
  return rows
    .filter((row) => row.search_status === "candidate" && row.match_confidence === "high")
    .sort((a, b) => String(b.notice_date || "").localeCompare(String(a.notice_date || "")))[0];
}

function processSummary(rows) {
  const counts = rows.reduce((acc, row) => {
    const key = row.access_status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    process_probe_rows: rows.length,
    process_content_detected: counts.content_detected || 0,
    process_generic_templates: counts.generic_process_template || 0,
    process_fetch_failed: counts.fetch_failed || 0,
    process_attachment_count: rows.reduce((sum, row) => sum + Number(row.attachment_count || 0), 0),
  };
}

function conclusion(row) {
  if (row.seoul_notice_high_count > 0 || row.gwangjin_notice_high_count > 0 || row.official_probe_high_count > 0) {
    return "official_notice_candidate_found";
  }
  if (row.official_probe_low_count > 0 || row.gwangjin_notice_low_count > 0) {
    return "business_layer_confirmed_low_confidence_unrelated_candidates_only";
  }
  return "business_layer_confirmed_notice_not_found";
}

function nextAction(row) {
  if (row.conclusion === "official_notice_candidate_found") {
    return "고신뢰 후보 원문을 내려받아 고시번호·일자·사업명·면적 대조 후 장부 반영";
  }
  if (row.process_content_detected > 0 || row.process_attachment_count > 0) {
    return "정보몽땅 공정 페이지 표·첨부를 열어 원문값 대조";
  }
  return "서울도시공간포털/자치구 게시판 수동 검색 또는 담당부서 문의로 고시·인가 원문 확인";
}

function markdown(rows) {
  const found = rows.filter((row) => row.conclusion === "official_notice_candidate_found").length;
  const blocked = rows.filter((row) => row.conclusion !== "official_notice_candidate_found").length;
  return `# recordCode 미연결 감사

작성 기준: ${kstDate()} KST

서울도시공간포털 사업구역 레이어에서는 확인됐지만, 지도 팝업 \`recordCode\` 또는 고시 원문이 자동 연결되지 않는 사업장을 모은 감사표다. 자동 검색이 만든 저신뢰 후보는 원문으로 쓰지 않고 별도로 격리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 사업구역 레이어 확인 사업 | ${rows.length} |
| 고신뢰 원문 후보 확보 | ${found} |
| 고시/인가 원문 추가 확인 필요 | ${blocked} |
| 공정 페이지에서 사업별 콘텐츠 확인 | ${rows.filter((row) => row.process_content_detected > 0).length} |
| 공정 페이지 첨부 확인 | ${rows.filter((row) => row.process_attachment_count > 0).length} |

## 사업별 상태

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "portal_stage", label: "포털 단계" },
  { key: "business_layer_zone", label: "사업구역 레이어" },
  { key: "present_sn", label: "presentSn" },
  { key: "seoul_notice_high_count", label: "서울시 고시 high" },
  { key: "gwangjin_notice_high_count", label: "광진구 high" },
  { key: "official_probe_high_count", label: "공식 프로브 high" },
  { key: "official_probe_low_count", label: "공식 프로브 low" },
  { key: "process_content_detected", label: "공정 콘텐츠" },
  { key: "process_attachment_count", label: "공정 첨부" },
  { key: "conclusion", label: "판정" },
])}

## 다음 액션

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "latest_high_notice_date", label: "최신 후보일" },
  { key: "latest_high_notice_no", label: "후보 번호" },
  { key: "latest_high_notice_title", label: "후보 제목" },
  { key: "next_action", label: "다음 작업" },
])}
`;
}

async function main() {
  const businessRows = await readJson(BUSINESS_LAYER_INPUT);
  const businessNoticeByRank = byRank(await readJson(BUSINESS_NOTICE_INPUT));
  const gwangjinByRank = byRank(await readJson(GWANGJIN_NOTICE_INPUT));
  const officialProbeByRank = byRank(await readJson(OFFICIAL_PROBE_INPUT));
  const processByRank = byRank(await readJson(PROCESS_PROBE_INPUT));

  const rows = businessRows
    .filter((row) => row.match_status === "business_layer_matched_no_notice_record")
    .map((row) => {
      const rank = String(row.rank || "");
      const seoulNotices = businessNoticeByRank[rank] || [];
      const gwangjinNotices = gwangjinByRank[rank] || [];
      const officialProbes = officialProbeByRank[rank] || [];
      const process = processSummary(processByRank[rank] || []);
      const latestHigh = latestHighNotice([...seoulNotices, ...gwangjinNotices, ...officialProbes]) || {};
      const auditRow = {
        rank,
        focus_area: row.focus_area || "",
        district: row.district || "",
        project_name: row.project_name || "",
        portal_stage: row.urban_propel_name || "",
        business_layer_zone: row.layer_zone_name || "",
        present_sn: row.present_sn || "",
        cleanup_site_name: row.cleanup_site_name || "",
        seoul_notice_high_count: highNoticeCount(seoulNotices),
        gwangjin_notice_high_count: highNoticeCount(gwangjinNotices),
        official_probe_high_count: highNoticeCount(officialProbes),
        official_probe_low_count: lowNoticeCount(officialProbes),
        gwangjin_notice_low_count: lowNoticeCount(gwangjinNotices),
        latest_high_notice_date: latestHigh.notice_date || "",
        latest_high_notice_no: latestHigh.notice_no || "",
        latest_high_notice_title: latestHigh.notice_title || latestHigh.title || "",
        ...process,
      };
      auditRow.conclusion = conclusion(auditRow);
      auditRow.next_action = nextAction(auditRow);
      return auditRow;
    });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  await writeFile(path.join(OUT_DIR, OUT_MD), markdown(rows));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        found: rows.filter((row) => row.conclusion === "official_notice_candidate_found").length,
        blocked: rows.filter((row) => row.conclusion !== "official_notice_candidate_found").length,
        output: `analysis/${OUT_MD}`,
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
