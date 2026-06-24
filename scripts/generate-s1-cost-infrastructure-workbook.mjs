#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s1-cost-infrastructure-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "s1-cost-infrastructure-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "s1-cost-infrastructure-workbook.json");

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

const INPUTS = {
  sprintPlan: "analysis/source-verification-sprint-plan.json",
  cleanupReview: "analysis/cleanup-board-review-queue.json",
  comparison: "analysis/project-comparison-matrix.json",
  ledger: "analysis/core-value-confirmation-ledger.json",
  evidence: "analysis/source-evidence-audit.json",
};

const S1_KEYWORDS = [
  "정비기반시설",
  "기반시설",
  "공공기여",
  "공공시설",
  "도로",
  "공원",
  "녹지",
  "지하차도",
  "통신구",
  "환기구",
  "전력",
  "저류",
  "방류",
  "국공유지",
  "무상양도",
  "임대주택",
  "매각금액",
  "분담금",
  "부담금",
  "사업비",
  "공사비",
];

const LEDGER_STATUS_ORDER = [
  "structured_value_needs_manual_confirmation",
  "snippet_candidate_needs_manual_confirmation",
  "value_missing",
  "source_link_required",
  "source_date_split_required",
  "source_definition_split_required",
  "ocr_partial_confirmation_pending",
  "ocr_source_value_update_required",
  "not_yet_applicable",
];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "queue_rank",
    "priority",
    "focus_area",
    "rank",
    "project_name",
    "current_stage",
    "public_item_count",
    "p0_public_item_count",
    "cost_item_count",
    "infrastructure_item_count",
    "top_public_items",
    "ledger_check_count",
    "ledger_fields_to_close",
    "notice_source_to_open",
    "notice_snippet_count",
    "first_notice_snippet",
    "recommended_execution_order",
    "completion_check",
    "project_note",
  ];
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

async function readTextIfExists(file) {
  if (!file) return "";
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

function countBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts, limit = 6) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function compact(values, limit = 5) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

function includesAny(text, keywords) {
  const target = String(text ?? "").toLowerCase();
  return keywords.some((keyword) => target.includes(keyword.toLowerCase()));
}

function publicItemScope(item) {
  const text = `${item.signal_tags} ${item.signal_group} ${item.title}`;
  const scopes = [];
  if (includesAny(text, ["cost_pressure", "비용", "분담금", "공사비", "사업비", "부담금", "매각금액"])) scopes.push("cost");
  if (includesAny(text, ["infrastructure", "기반시설", "도로", "공원", "지하차도", "전력", "통신구", "환기구", "공공디자인"])) scopes.push("infrastructure");
  if (includesAny(text, ["design_review", "설계", "심의", "영향평가"])) scopes.push("design_review");
  if (includesAny(text, ["execution_procurement", "입찰", "용역", "업체 선정"])) scopes.push("procurement");
  return scopes.join("; ") || "related_public_item";
}

function normalizeSpaces(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function extractKeywordSnippets(text, keywords, limit = 5) {
  const normalized = normalizeSpaces(text);
  if (!normalized) return [];
  const hits = [];
  const used = [];
  for (const keyword of keywords) {
    const lowerText = normalized.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    let start = lowerText.indexOf(lowerKeyword);
    while (start >= 0 && hits.length < limit * 2) {
      const from = Math.max(0, start - 90);
      const to = Math.min(normalized.length, start + keyword.length + 150);
      const snippet = normalized.slice(from, to);
      if (!used.some((range) => Math.abs(range - start) < 80)) {
        hits.push({ keyword, snippet });
        used.push(start);
      }
      start = lowerText.indexOf(lowerKeyword, start + lowerKeyword.length);
    }
    if (hits.length >= limit) break;
  }
  return hits.slice(0, limit);
}

function selectLedgerRows(rows) {
  const targetFields = new Set([
    "district_area_sqm",
    "floor_area_ratio_pct",
    "building_coverage_ratio_pct",
    "max_height_m",
    "floors",
    "total_households",
    "management_construction_cost",
    "project_stage_floor_area_ratio_pct",
  ]);
  return rows
    .filter(
      (row) =>
        row.related_task_type === "crosscheck_cost_infrastructure" ||
        targetFields.has(row.field_id) ||
        includesAny(`${row.field_label} ${row.next_value_action}`, ["기반시설", "공공기여", "공사비", "분담금", "정비구역", "용적률", "건폐율"]),
    )
    .filter((row) => row.verification_status && row.verification_status !== "confirmed_from_original_notice")
    .sort((a, b) => {
      const statusA = LEDGER_STATUS_ORDER.indexOf(a.verification_status);
      const statusB = LEDGER_STATUS_ORDER.indexOf(b.verification_status);
      return (statusA < 0 ? 99 : statusA) - (statusB < 0 ? 99 : statusB) || String(a.field_label).localeCompare(String(b.field_label));
    });
}

function completionCheck(row) {
  const checks = [
    "상위 공개항목의 첨부/상세 URL 열람 여부 기록",
    "고시 원문 스니펫과 공개항목 제목 신호의 일치/불일치 표시",
    "장부 필드를 confirmed, pending, conflict, not_applicable 중 하나로 분류",
  ];
  if (row.notice_snippet_count === 0) checks.push("로컬 고시 텍스트에서 관련 스니펫이 없으면 공개항목 첨부 원문 다운로드 필요");
  return checks.join("; ");
}

function recommendedExecutionOrder(row) {
  if (row.p0_public_item_count > 0 && row.notice_snippet_count > 0) return "1 공개항목 상세/첨부 확인 -> 2 고시 원문 스니펫 대조 -> 3 장부 필드 상태 갱신";
  if (row.p0_public_item_count > 0) return "1 공개항목 상세/첨부 확인 -> 2 첨부 원문 다운로드/텍스트화 -> 3 장부 필드 상태 갱신";
  if (row.notice_snippet_count > 0) return "1 고시 원문 스니펫 확인 -> 2 관련 공개항목 추가 검색 -> 3 장부 필드 상태 갱신";
  return "1 정보몽땅/자치구 공개항목 원문 확보 -> 2 텍스트화 -> 3 장부 필드 상태 갱신";
}

async function buildRows(data) {
  const sprintTasks = data.sprintPlan.taskRows.filter((row) => row.sprint_id === "S1");
  const comparisonByRank = Object.fromEntries(data.comparison.map((row) => [String(row.rank), row]));
  const evidenceByRank = Object.fromEntries(data.evidence.map((row) => [String(row.rank), row]));
  const cleanupByRank = Map.groupBy(data.cleanupReview, (row) => String(row.rank));
  const ledgerByRank = Map.groupBy(data.ledger, (row) => String(row.rank));

  const rows = [];
  for (const task of sprintTasks) {
    const rank = String(task.rank);
    const comparison = comparisonByRank[rank] || {};
    const evidence = evidenceByRank[rank] || {};
    const publicItems = (cleanupByRank.get(rank) || [])
      .filter((item) => includesAny(`${item.signal_tags} ${item.signal_group} ${item.title}`, ["cost_pressure", "infrastructure", "비용", "분담금", "기반시설", "도로", "공원", "공사비", "사업비", "국공유지", "전력", "지하차도", "통신구", "환기구"]))
      .sort((a, b) => Number(a.queue_rank) - Number(b.queue_rank));
    const ledgerRows = selectLedgerRows(ledgerByRank.get(rank) || []);
    const sourceCandidates = compact([
      ...ledgerRows.map((row) => row.source_to_open),
      comparison.text_path,
      evidence.notice_text_paths,
      comparison.gangnam_songpa_notice_text_paths,
      comparison.gwangjin_gu_notice_text_paths,
    ].flatMap((value) => String(value || "").split(";").map((part) => part.trim())));
    const noticeSourceToOpen = sourceCandidates[0] || "";
    const sourceText = await readTextIfExists(noticeSourceToOpen);
    const snippets = extractKeywordSnippets(sourceText, S1_KEYWORDS, 5);
    const topPublicItems = publicItems.slice(0, 6).map((item) => `${item.review_priority} ${item.item_date} ${item.title}`);
    const topUrls = publicItems.slice(0, 6).map((item) => item.detail_url);
    const fieldClosures = ledgerRows
      .slice(0, 10)
      .map((field) => `${field.field_label}:${field.current_value || "공란"}(${field.verification_status})`);
    const row = {
      queue_rank: task.queue_rank,
      priority: task.priority,
      focus_area: task.focus_area,
      district: task.district,
      rank,
      project_name: task.project_name,
      current_stage: task.current_stage,
      risk_signal_level: task.risk_signal_level,
      evidence_grade: evidence.evidence_grade || "",
      public_item_count: publicItems.length,
      p0_public_item_count: publicItems.filter((item) => item.review_priority === "P0").length,
      cost_item_count: publicItems.filter((item) => publicItemScope(item).includes("cost")).length,
      infrastructure_item_count: publicItems.filter((item) => publicItemScope(item).includes("infrastructure")).length,
      public_item_scope_summary: countText(countBy(publicItems, publicItemScope), 5),
      top_public_items: topPublicItems.join(" / "),
      top_public_item_urls: topUrls.join(" / "),
      ledger_check_count: ledgerRows.length,
      ledger_status_summary: countText(countBy(ledgerRows, (item) => item.verification_status), 6),
      ledger_fields_to_close: fieldClosures.join("; "),
      notice_source_to_open: noticeSourceToOpen,
      notice_snippet_count: snippets.length,
      notice_snippets: snippets.map((hit) => `[${hit.keyword}] ${hit.snippet}`).join(" / "),
      first_notice_snippet: snippets[0] ? `[${snippets[0].keyword}] ${snippets[0].snippet}` : "",
      recommended_execution_order: "",
      completion_check: "",
      project_note: task.project_note,
    };
    row.recommended_execution_order = recommendedExecutionOrder(row);
    row.completion_check = completionCheck(row);
    rows.push(row);
  }
  return rows;
}

function buildSummary(rows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    p0_task_count: rows.filter((row) => row.priority === "P0").length,
    p1_task_count: rows.filter((row) => row.priority === "P1").length,
    public_item_count: rows.reduce((sum, row) => sum + Number(row.public_item_count || 0), 0),
    p0_public_item_count: rows.reduce((sum, row) => sum + Number(row.p0_public_item_count || 0), 0),
    ledger_check_count: rows.reduce((sum, row) => sum + Number(row.ledger_check_count || 0), 0),
    notice_snippet_count: rows.reduce((sum, row) => sum + Number(row.notice_snippet_count || 0), 0),
    focus_area_counts: countBy(rows, (row) => row.focus_area),
  };
}

function markdown(rows, summary) {
  return `# S1 비용·기반시설 원문 대조 워크북

작성 기준: ${UPDATED_AT}

이 문서는 source-verification-sprint-plan의 S1 태스크를 실제 원문 확인 순서로 펼친 워크북이다. 정보몽땅 공개항목 제목 신호, 로컬 고시 원문 스니펫, 핵심 수치 장부 필드를 한 행에 묶어 비용·기반시설 리스크를 확정/보류/충돌로 닫기 위한 자료다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S1 대상 사업장 | ${summary.project_count} |
| P0 태스크 | ${summary.p0_task_count} |
| P1 태스크 | ${summary.p1_task_count} |
| 관련 공개항목 | ${summary.public_item_count} |
| P0 공개항목 | ${summary.p0_public_item_count} |
| 닫아야 할 장부 필드 | ${summary.ledger_check_count} |
| 로컬 원문 스니펫 | ${summary.notice_snippet_count} |

## 실행 워크북

${mdTable(rows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "public_item_count", label: "공개항목" },
  { key: "p0_public_item_count", label: "P0 공개" },
  { key: "ledger_check_count", label: "장부필드" },
  { key: "notice_snippet_count", label: "스니펫" },
  { key: "recommended_execution_order", label: "처리 순서" },
])}

## 사업별 상세

${rows
  .map(
    (row) => `### ${row.queue_rank}. ${row.project_name}

- 생활권/단계: ${row.focus_area} / ${row.current_stage}
- 관련 공개항목: ${row.public_item_count}개(P0 ${row.p0_public_item_count}개), 범위 ${row.public_item_scope_summary || "없음"}
- 먼저 열 공개항목: ${row.top_public_items || "없음"}
- 공개항목 URL: ${row.top_public_item_urls || "없음"}
- 원문 텍스트: ${row.notice_source_to_open || "없음"}
- 장부 필드: ${row.ledger_fields_to_close || "없음"}
- 원문 스니펫: ${row.notice_snippets || "관련 키워드 스니펫 없음"}
- 완료 기준: ${row.completion_check}
- 메모: ${row.project_note}
`,
  )
  .join("\n")}

## 사용법

1. 공개항목 URL에서 상세/첨부를 먼저 열고 제목 신호가 실제 비용·기반시설 원문인지 확인한다.
2. 로컬 고시 원문 스니펫과 공개항목 내용을 대조해 같은 조건인지, 후속 변경인지, 단순 용역 공고인지 분리한다.
3. core-value-confirmation-ledger의 해당 필드를 confirmed, pending, conflict, not_applicable 중 하나로 업데이트할 근거를 남긴다.
`;
}

async function main() {
  const data = Object.fromEntries(await Promise.all(Object.entries(INPUTS).map(async ([key, file]) => [key, await readJson(file)])));
  const rows = await buildRows(data);
  const summary = buildSummary(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        publicItems: summary.public_item_count,
        ledgerFields: summary.ledger_check_count,
        snippets: summary.notice_snippet_count,
        output: "analysis/s1-cost-infrastructure-workbook.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
