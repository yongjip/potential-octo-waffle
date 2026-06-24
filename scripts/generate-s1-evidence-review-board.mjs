#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "s1-evidence-review-board.md");
const OUT_CSV = path.join(OUT_DIR, "s1-evidence-review-board.csv");
const OUT_JSON = path.join(OUT_DIR, "s1-evidence-review-board.json");

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
  workbook: "analysis/s1-cost-infrastructure-workbook.json",
  candidates: "analysis/s1-original-evidence-candidates.json",
};

const CATEGORY_ORDER = ["cost_pressure", "infrastructure", "public_contribution", "ratio_calculation"];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "review_rank",
    "priority",
    "focus_area",
    "rank",
    "project_name",
    "category",
    "category_label",
    "candidate_count",
    "top_values",
    "top_source_lines",
    "top_snippets",
    "public_item_count",
    "p0_public_item_count",
    "top_public_items",
    "ledger_check_count",
    "ledger_status_summary",
    "ledger_fields_to_close",
    "review_status",
    "next_review_action",
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

function compact(values, limit = 5) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

function groupBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(row);
    return acc;
  }, new Map());
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

function shortSnippet(text, limit = 180) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1)}...`;
}

function reviewStatus(workbookRow, categoryRows) {
  if (!categoryRows.length) return "no_candidate";
  if (workbookRow.p0_public_item_count > 0) return "ready_with_p0_public_item";
  if (workbookRow.public_item_count > 0) return "ready_with_public_item";
  return "source_only_candidate";
}

function nextReviewAction(status, categoryLabel) {
  if (status === "ready_with_p0_public_item") return `${categoryLabel} 후보를 P0 공개항목 상세/첨부와 대조하고 장부·메모에 confirmed/pending/conflict 기록`;
  if (status === "ready_with_public_item") return `${categoryLabel} 후보를 공개항목 상세와 대조하되 후속 공고가 P0인지 재평가`;
  if (status === "source_only_candidate") return `${categoryLabel} 후보는 고시 원문 근거로 먼저 메모하고 관련 공개항목 추가 검색`;
  return `${categoryLabel} 관련 원문 후보 추가 확보`;
}

function buildRows(workbook, candidates) {
  const byProjectCategory = groupBy(candidates.rows, (row) => `${row.rank}::${row.category}`);
  const rows = [];

  for (const workbookRow of workbook.rows) {
    for (const category of CATEGORY_ORDER) {
      const categoryRows = byProjectCategory.get(`${workbookRow.rank}::${category}`) || [];
      if (!categoryRows.length) continue;
      const topRows = categoryRows.slice(0, 3);
      const status = reviewStatus(workbookRow, categoryRows);
      rows.push({
        priority: workbookRow.priority,
        focus_area: workbookRow.focus_area,
        rank: workbookRow.rank,
        project_name: workbookRow.project_name,
        current_stage: workbookRow.current_stage,
        category,
        category_label: categoryRows[0].category_label,
        candidate_count: categoryRows.length,
        top_values: compact(topRows.flatMap((row) => row.extracted_values.split(";").map((value) => value.trim())), 12).join("; "),
        top_source_lines: topRows.map((row) => `${row.source_path}:${row.source_line}`).join("; "),
        top_snippets: topRows.map((row) => shortSnippet(row.snippet)).join(" / "),
        public_item_count: workbookRow.public_item_count,
        p0_public_item_count: workbookRow.p0_public_item_count,
        top_public_items: workbookRow.top_public_items,
        ledger_check_count: workbookRow.ledger_check_count,
        ledger_status_summary: workbookRow.ledger_status_summary,
        ledger_fields_to_close: workbookRow.ledger_fields_to_close,
        review_status: status,
        next_review_action: nextReviewAction(status, categoryRows[0].category_label),
        project_note: workbookRow.project_note,
      });
    }
  }

  return rows
    .sort((a, b) => {
      const priorityScore = (row) => (row.priority === "P0" ? 0 : 1);
      const publicScore = (row) => (row.p0_public_item_count > 0 ? 0 : row.public_item_count > 0 ? 1 : 2);
      const categoryScore = (row) => CATEGORY_ORDER.indexOf(row.category);
      return (
        priorityScore(a) - priorityScore(b) ||
        publicScore(a) - publicScore(b) ||
        Number(a.rank) - Number(b.rank) ||
        categoryScore(a) - categoryScore(b)
      );
    })
    .map((row, index) => ({ review_rank: index + 1, ...row }));
}

function buildSummary(rows, workbook, candidates) {
  return {
    generated_at: UPDATED_AT,
    source_workbook_projects: workbook.summary.project_count,
    source_candidate_count: candidates.summary.candidate_count,
    review_rows: rows.length,
    p0_review_rows: rows.filter((row) => row.priority === "P0").length,
    ready_with_p0_public_item: rows.filter((row) => row.review_status === "ready_with_p0_public_item").length,
    category_counts: countBy(rows, "category_label"),
    focus_area_counts: countBy(rows, "focus_area"),
    status_counts: countBy(rows, "review_status"),
  };
}

function markdown(rows, summary) {
  const topRows = rows.slice(0, 40);
  return `# S1 원문 증거 리뷰 보드

작성 기준: ${UPDATED_AT}

이 문서는 S1 원문 수치 후보 ${summary.source_candidate_count}개를 사업장·유형별 검토 묶음으로 압축한 보드다. 후보값 자체를 확정하지 않고, 공개항목 상세/첨부와 원문 문맥을 대조해 장부 또는 사업별 메모에 confirmed, pending, conflict, not_applicable 중 하나로 남기는 것이 목적이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S1 사업장 | ${summary.source_workbook_projects} |
| 원문 수치 후보 | ${summary.source_candidate_count} |
| 리뷰 묶음 | ${summary.review_rows} |
| P0 리뷰 묶음 | ${summary.p0_review_rows} |
| P0 공개항목 연결 묶음 | ${summary.ready_with_p0_public_item} |
| 유형 분포 | ${countText(summary.category_counts)} |
| 생활권 분포 | ${countText(summary.focus_area_counts)} |
| 상태 분포 | ${countText(summary.status_counts)} |

## 우선 리뷰 묶음

${mdTable(topRows, [
  { key: "review_rank", label: "순서" },
  { key: "priority", label: "우선" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "사업" },
  { key: "project_name", label: "사업장" },
  { key: "category_label", label: "유형" },
  { key: "candidate_count", label: "후보" },
  { key: "top_values", label: "핵심 후보값" },
  { key: "p0_public_item_count", label: "P0 공개" },
  { key: "review_status", label: "상태" },
  { key: "next_review_action", label: "다음 확인" },
])}

## 확인 방법

1. P0 공개항목 연결 묶음부터 정보몽땅 상세/첨부를 연다.
2. top_source_lines의 로컬 고시 원문 줄과 공개항목 문맥이 같은 시점/같은 조건인지 확인한다.
3. 결과는 core-value-confirmation-ledger의 관련 필드 또는 project-notes에 confirmed, pending, conflict, not_applicable 중 하나로 남긴다.
`;
}

async function main() {
  const [workbook, candidates] = await Promise.all([readJson(INPUTS.workbook), readJson(INPUTS.candidates)]);
  const rows = buildRows(workbook, candidates);
  const summary = buildSummary(rows, workbook, candidates);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows, summary));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        p0: summary.p0_review_rows,
        readyWithP0PublicItem: summary.ready_with_p0_public_item,
        output: "analysis/s1-evidence-review-board.{md,csv,json}",
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
