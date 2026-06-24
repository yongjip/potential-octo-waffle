#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-link-repair-candidates.md");
const OUT_CSV = path.join(OUT_DIR, "source-link-repair-candidates.csv");
const OUT_JSON = path.join(OUT_DIR, "source-link-repair-candidates.json");

const QUEUE_INPUT = "analysis/source-link-repair-queue.json";
const CLEANUP_SUMMARIES_INPUT = "data/cleanup/project-summaries-priority-candidates.json";
const GWANGJIN_STAGE_DOCS_INPUT = "data/cleanup/gwangjin-stage-public-docs.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const BUSINESS_NOTICE_INPUT = "data/urban/business-layer-notice-candidates.json";
const SEOUL_SIBO_FACT_CHECK_INPUT = "analysis/seoul-sibo-original-notice-fact-check.json";

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

const FIELD_SOURCE_MAP = {
  district_area_sqm: ["district_area_sqm", "site_area_sqm"],
  floor_area_ratio_pct: ["floor_area_ratio_pct"],
  building_coverage_ratio_pct: ["building_coverage_ratio_pct"],
  max_height_m: ["max_height_m"],
  floors: ["floors"],
  total_households: ["total_households", "sale_household_total"],
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

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function groupBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "(blank)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function normalizeValue(value) {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .replace(/㎡|m2|%|세대|명/g, "")
    .replace(/^지상:/, "지상")
    .trim();
}

function valueMatch(queueValue, candidateValue) {
  const left = normalizeValue(queueValue);
  const right = normalizeValue(candidateValue);
  if (!left || !right) return "not_comparable";
  if (left === right) return "exact";
  if (left.replace(/\.0$/, "") === right.replace(/\.0$/, "")) return "exact";
  if (left.includes(right) || right.includes(left)) return "partial";
  return "mismatch";
}

function cleanupCandidate(row, summary) {
  const fields = FIELD_SOURCE_MAP[row.field_id] || [];
  for (const field of fields) {
    const value = summary?.[field];
    if (!value) continue;
    const match = valueMatch(row.current_value, value);
    return {
      candidate_status: match === "mismatch" ? "candidate_value_mismatch" : "direct_value_match",
      candidate_source_type: "cleanup_project_summary",
      candidate_source_label: "정보몽땅 사업개요",
      candidate_source_url: summary.summary_url || summary.official_project_url || "",
      candidate_source_path: "data/cleanup/project-summaries-priority-candidates.json",
      candidate_field: field,
      candidate_value: value,
      candidate_match_level: match,
      candidate_note:
        match === "exact"
          ? "정보몽땅 사업개요의 구조화 값이 현재값과 일치한다."
          : match === "partial"
            ? "정보몽땅 사업개요 값과 현재값이 부분 일치한다. 표시 형식/정밀도 확인 필요."
            : "정보몽땅 사업개요 값이 현재값과 다르다. 기준일 또는 필드 정의 확인 필요.",
    };
  }
  return null;
}

function stageCandidate(row, stageRows) {
  const stage = stageRows.find((item) => item.access_status === "public_table_extracted");
  if (!stage) return null;
  if (row.field_id === "union_approval_date") {
    return {
      candidate_status: "direct_value_match",
      candidate_source_type: "cleanup_stage_public_doc",
      candidate_source_label: "정보몽땅 조합설립 공개항목",
      candidate_source_url: stage.official_url || "",
      candidate_source_path: stage.local_html_path || "data/cleanup/gwangjin-stage-public-docs.json",
      candidate_field: "approval_date",
      candidate_value: stage.approval_date || "",
      candidate_match_level: valueMatch(row.current_value, stage.approval_date),
      candidate_note: "정보몽땅 공개 HTML 표에서 인가일을 추출했다.",
    };
  }
  return null;
}

function businessNoticeCandidate(row, noticeRows) {
  if (!["notice_no", "notice_date"].includes(row.field_id)) return null;
  const notice = noticeRows.find((item) => item.search_status === "candidate" && item.match_confidence === "high" && item.notice_no);
  if (!notice) return null;
  const field = row.field_id === "notice_no" ? "notice_no" : "notice_date";
  const value = notice[field] || "";
  if (!value) return null;
  const match = valueMatch(row.current_value, value);
  return {
    candidate_status: match === "mismatch" ? "candidate_value_mismatch" : "direct_value_match",
    candidate_source_type: "seoul_urban_business_notice",
    candidate_source_label: "서울도시공간포털 사업구역 기반 고시",
    candidate_source_url: notice.map_form_url || notice.notice_file_url || "",
    candidate_source_path: "data/urban/business-layer-notice-candidates.json",
    candidate_field: field,
    candidate_value: value,
    candidate_match_level: match,
    candidate_note:
      match === "exact"
        ? "사업구역 기반 고시 후보의 고시번호/고시일이 현재값과 일치한다."
        : "사업구역 기반 고시 후보와 현재값이 다르다. 본고시/정정고시 관계와 기준일 확인 필요.",
  };
}

function seoulSiboCandidate(row, factRows) {
  if (!["notice_no", "notice_date"].includes(row.field_id)) return null;
  const fact = factRows.find((item) => item.category === "원문확인" && item.status === "match");
  if (!fact) return null;
  const value = row.field_id === "notice_no"
    ? String(fact.official_value || "").match(/제\s*(\d{4}-\d+)호/)?.[1] || ""
    : String(fact.official_value || "").match(/\d{4}-\d{2}-\d{2}/)?.[0] || "";
  if (!value) return null;
  const match = valueMatch(row.current_value, value);
  return {
    candidate_status: match === "mismatch" ? "candidate_value_mismatch" : "direct_value_match",
    candidate_source_type: "seoul_sibo_original_notice",
    candidate_source_label: "서울시보 본고시 원문",
    candidate_source_url: fact.official_url || "",
    candidate_source_path: fact.source_ocr_text || fact.source_text || fact.source_pdf || "analysis/seoul-sibo-original-notice-fact-check.json",
    candidate_field: row.field_id,
    candidate_value: value,
    candidate_match_level: match,
    candidate_note:
      match === "exact"
        ? "서울시보 본고시 원문확인 행에서 고시번호/고시일이 현재값과 일치한다."
        : "서울시보 본고시 원문값과 현재값이 다르다. 매트릭스 기준값 정정 필요.",
  };
}

function dateVariants(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return [String(value || "")].filter(Boolean);
  const [, year, month, day] = match;
  return [
    `${year}-${month}-${day}`,
    `${year}.${Number(month)}.${Number(day)}`,
    `${year}. ${Number(month)}. ${Number(day)}`,
    `${year}년 ${Number(month)}월 ${Number(day)}일`,
  ];
}

function noticeNoVariants(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  return [text, `제${text}호`, `제${text} 호`, `제 ${text}호`, `제 ${text} 호`];
}

function localNoticeTextCandidate(row, localNotice) {
  if (!localNotice || !["notice_no", "notice_date"].includes(row.field_id)) return null;
  const haystack = `${localNotice.path || ""}\n${localNotice.text || ""}`;
  const variants = row.field_id === "notice_no" ? noticeNoVariants(row.current_value) : dateVariants(row.current_value);
  const matched = variants.find((variant) => variant && haystack.includes(variant));
  if (!matched) return null;
  return {
    candidate_status: "direct_value_match",
    candidate_source_type: "local_official_notice_text",
    candidate_source_label: "로컬 고시 텍스트",
    candidate_source_url: "",
    candidate_source_path: localNotice.path || "",
    candidate_field: row.field_id,
    candidate_value: row.current_value,
    candidate_match_level: "exact",
    candidate_note:
      "현재 큐에 연결된 로컬 고시 텍스트의 파일명 또는 본문에서 고시번호/고시일이 현재값과 일치한다. recordCode 또는 원문 URL 보강은 계속 필요하다.",
  };
}

function invalidRepresentativeLotNotice(row, matrix) {
  if (!["notice_no", "notice_date"].includes(row.field_id)) return null;
  const sourceText = `${matrix.urban_map_source || ""} ${matrix.notice_title || ""}`;
  if (!sourceText.includes("representative_lot")) return null;
  if (!/환지|토지구획정리/.test(sourceText)) return null;
  return {
    candidate_status: "invalid_current_notice_source",
    candidate_source_type: "representative_lot_map_notice",
    candidate_source_label: "대표지번 fallback 지도 고시",
    candidate_source_url: matrix.official_map_url || "",
    candidate_source_path: "data/urban/urban-map-details-priority-candidates.json",
    candidate_field: row.field_id,
    candidate_value: row.current_value,
    candidate_match_level: "invalid_basis",
    candidate_note: "현재 고시번호/고시일은 대표지번으로 잡힌 환지·토지구획정리 공고로, 현 정비사업의 직접 원문 근거에서 제외해야 한다.",
  };
}

function fallbackCandidate(row, summary) {
  if (["notice_no", "notice_date"].includes(row.field_id)) {
    return {
      candidate_status: "no_local_candidate",
      candidate_source_type: "",
      candidate_source_label: "",
      candidate_source_url: "",
      candidate_source_path: "",
      candidate_field: "",
      candidate_value: "",
      candidate_match_level: "",
      candidate_note: "고시번호/고시일은 사업개요가 아니라 서울도시공간포털 recordCode 또는 자치구 고시공고 원문 검색이 필요하다.",
    };
  }
  if (summary?.summary_url) {
    return {
      candidate_status: "project_summary_available_but_field_missing",
      candidate_source_type: "cleanup_project_summary",
      candidate_source_label: "정보몽땅 사업개요",
      candidate_source_url: summary.summary_url,
      candidate_source_path: "data/cleanup/project-summaries-priority-candidates.json",
      candidate_field: "",
      candidate_value: "",
      candidate_match_level: "",
      candidate_note: "사업개요는 확보됐지만 이 필드의 구조화 값은 비어 있다. 별도 공고/인가 원문이 필요하다.",
    };
  }
  return {
    candidate_status: "no_local_candidate",
    candidate_source_type: "",
    candidate_source_label: "",
    candidate_source_url: "",
    candidate_source_path: "",
    candidate_field: "",
    candidate_value: "",
    candidate_match_level: "",
    candidate_note: "현재 로컬 원문 세트에서 바로 연결할 후보를 찾지 못했다.",
  };
}

function firstLocalTextPath(...values) {
  return values
    .flatMap((value) =>
      String(value || "")
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .find((item) => item.endsWith(".txt") && !/^https?:\/\//.test(item)) || "";
}

async function buildLocalNoticeTextByQueue(queueRows, matrixByRank) {
  const entries = await Promise.all(
    queueRows.map(async (row) => {
      const matrix = matrixByRank[String(row.rank || "")] || {};
      const sourcePath = firstLocalTextPath(
        row.current_source_to_open,
        matrix.text_path,
        matrix.gwangjin_gu_notice_text_paths,
        matrix.gangnam_songpa_notice_text_paths,
      );
      if (!sourcePath || !sourcePath.endsWith(".txt")) return [String(row.queue_rank), null];
      try {
        const text = await readFile(sourcePath, "utf8");
        return [String(row.queue_rank), { path: sourcePath, text: text.slice(0, 20000) }];
      } catch (error) {
        if (error.code === "ENOENT") return [String(row.queue_rank), { path: sourcePath, text: "" }];
        throw error;
      }
    }),
  );
  return Object.fromEntries(entries.filter(([, value]) => value));
}

function buildRows(queueRows, summariesByRank, stageByRank, matrixByRank, businessNoticeByRank, siboFactsByRank, localNoticeTextByQueue) {
  return queueRows.map((row) => {
    const rank = String(row.rank || "");
    const summary = summariesByRank[rank] || {};
    const stageRows = stageByRank[rank] || [];
    const matrix = matrixByRank[rank] || {};
    const businessNoticeRows = businessNoticeByRank[rank] || [];
    const siboFactRows = siboFactsByRank[rank] || [];
    const localNotice = localNoticeTextByQueue[String(row.queue_rank)];
    const candidate =
      cleanupCandidate(row, summary) ||
      stageCandidate(row, stageRows) ||
      seoulSiboCandidate(row, siboFactRows) ||
      businessNoticeCandidate(row, businessNoticeRows) ||
      localNoticeTextCandidate(row, localNotice) ||
      invalidRepresentativeLotNotice(row, matrix) ||
      fallbackCandidate(row, summary);
    return {
      queue_rank: row.queue_rank,
      priority: row.priority,
      rank,
      focus_area: row.focus_area,
      district: row.district,
      project_name: row.project_name,
      field_id: row.field_id,
      field_label: row.field_label,
      current_value: row.current_value,
      issue_type: row.issue_type,
      candidate_status: candidate.candidate_status,
      candidate_source_type: candidate.candidate_source_type,
      candidate_source_label: candidate.candidate_source_label,
      candidate_field: candidate.candidate_field,
      candidate_value: candidate.candidate_value,
      candidate_match_level: candidate.candidate_match_level,
      candidate_source_url: candidate.candidate_source_url,
      candidate_source_path: candidate.candidate_source_path,
      candidate_note: candidate.candidate_note,
    };
  });
}

function markdown(rows) {
  const directRows = rows.filter((row) => row.candidate_status === "direct_value_match");
  const missingRows = rows.filter((row) => row.candidate_status === "no_local_candidate");
  const invalidRows = rows.filter((row) => row.candidate_status === "invalid_current_notice_source");
  return `# 원문 링크 보정 후보

작성 기준: ${UPDATED_AT}

\`source-link-repair-queue\`의 각 항목에 대해, 이미 내려받은 공식 데이터 안에서 바로 연결할 수 있는 후보 근거를 붙인 표다. 고시 원문을 새로 찾아야 하는 항목과 정보몽땅 사업개요/공개항목으로 값 자체를 확인할 수 있는 항목을 분리하는 데 쓴다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 큐 항목 | ${rows.length} |
| 직접 값 매칭 후보 | ${directRows.length} |
| 현재 고시값 무효 후보 | ${invalidRows.length} |
| 로컬 후보 없음 | ${missingRows.length} |

## 후보 상태별

${mdTable(groupBy(rows, "candidate_status"), [
  { key: "name", label: "후보 상태" },
  { key: "count", label: "건수" },
])}

## 직접 연결 가능 후보

${mdTable(directRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재값" },
  { key: "candidate_source_label", label: "후보 출처" },
  { key: "candidate_field", label: "후보 필드" },
  { key: "candidate_value", label: "후보값" },
  { key: "candidate_match_level", label: "일치" },
  { key: "candidate_source_url", label: "URL" },
])}

## 새 원문 검색 필요

${mdTable([...invalidRows, ...missingRows], [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "현재값" },
  { key: "issue_type", label: "유형" },
  { key: "candidate_note", label: "메모" },
])}

## 전체 후보

${mdTable(rows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "candidate_status", label: "후보 상태" },
  { key: "candidate_source_type", label: "출처 유형" },
  { key: "candidate_value", label: "후보값" },
  { key: "candidate_source_path", label: "로컬 경로" },
  { key: "candidate_note", label: "메모" },
])}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [queueRows, summaries, stageDocs, matrixRows, businessNoticeRows, siboFactRows] = await Promise.all([
    readJson(QUEUE_INPUT),
    readJson(CLEANUP_SUMMARIES_INPUT, []),
    readJson(GWANGJIN_STAGE_DOCS_INPUT, []),
    readJson(MATRIX_INPUT, []),
    readJson(BUSINESS_NOTICE_INPUT, []),
    readJson(SEOUL_SIBO_FACT_CHECK_INPUT, []),
  ]);
  const stageByRank = stageDocs.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
  const groupByRank = (items) =>
    items.reduce((acc, row) => {
      const rank = String(row.rank || "");
      if (!rank) return acc;
      if (!acc[rank]) acc[rank] = [];
      acc[rank].push(row);
      return acc;
    }, {});
  const matrixByRank = byRank(matrixRows);
  const localNoticeTextByQueue = await buildLocalNoticeTextByQueue(queueRows, matrixByRank);
  const rows = buildRows(
    queueRows,
    byRank(summaries),
    stageByRank,
    matrixByRank,
    groupByRank(businessNoticeRows),
    groupByRank(siboFactRows),
    localNoticeTextByQueue,
  );

  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        direct_value_match: rows.filter((row) => row.candidate_status === "direct_value_match").length,
        invalid_current_notice_source: rows.filter((row) => row.candidate_status === "invalid_current_notice_source").length,
        no_local_candidate: rows.filter((row) => row.candidate_status === "no_local_candidate").length,
        output: "analysis/source-link-repair-candidates.{md,csv,json}",
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
