#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-link-closure-board.md");
const OUT_CSV = path.join(OUT_DIR, "source-link-closure-board.csv");
const OUT_JSON = path.join(OUT_DIR, "source-link-closure-board.json");

const CANDIDATES_INPUT = "analysis/source-link-repair-candidates.json";
const QUEUE_INPUT = "analysis/source-link-repair-queue.json";

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

function byQueue(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.queue_rank || ""), row]).filter(([key]) => key));
}

function countBy(rows, field) {
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

function classify(candidate) {
  if (candidate.candidate_status !== "direct_value_match") {
    return {
      closure_status: "value_not_corroborated",
      closure_layer: "blocked",
      closure_ready: "N",
      next_action: "값 후보가 직접 일치하지 않으므로 원문 재검색 또는 기준일 확인",
    };
  }
  if (candidate.candidate_source_type === "seoul_sibo_original_notice" && candidate.candidate_source_url) {
    return {
      closure_status: "original_notice_url_available",
      closure_layer: "original_notice_url",
      closure_ready: "Y",
      next_action: "서울시보 원문 URL과 로컬 OCR 텍스트를 비교 매트릭스/사업별 메모의 확정 근거로 연결",
    };
  }
  if (candidate.candidate_source_type === "local_official_notice_text") {
    return {
      closure_status: "local_original_notice_text_url_pending",
      closure_layer: "original_notice_text",
      closure_ready: "partial",
      next_action: "로컬 본고시 텍스트는 값과 일치하므로 서울도시공간포털 recordCode 또는 원문 다운로드 URL을 보강",
    };
  }
  if (candidate.candidate_source_type === "cleanup_project_summary") {
    return {
      closure_status: "official_summary_value_match_original_notice_pending",
      closure_layer: "official_project_summary",
      closure_ready: "partial",
      next_action: "정보몽땅 사업개요는 공식 보조근거로 유지하되 본고시/인가 원문 recordCode를 별도 확인",
    };
  }
  return {
    closure_status: "direct_match_source_type_review",
    closure_layer: "review",
    closure_ready: "partial",
    next_action: "직접값 매칭 근거의 출처 유형을 검토하고 확정 근거로 쓸 수 있는지 판단",
  };
}

function buildRows(candidates, queueByRank) {
  return candidates.map((candidate) => {
    const queue = queueByRank[String(candidate.queue_rank)] || {};
    const closure = classify(candidate);
    return {
      queue_rank: candidate.queue_rank,
      priority: candidate.priority,
      rank: candidate.rank,
      focus_area: candidate.focus_area,
      district: candidate.district,
      project_name: candidate.project_name,
      field_id: candidate.field_id,
      field_label: candidate.field_label,
      current_value: candidate.current_value,
      issue_type: candidate.issue_type,
      candidate_source_type: candidate.candidate_source_type,
      candidate_source_label: candidate.candidate_source_label,
      candidate_value: candidate.candidate_value,
      candidate_match_level: candidate.candidate_match_level,
      candidate_source_url: candidate.candidate_source_url,
      candidate_source_path: candidate.candidate_source_path,
      closure_status: closure.closure_status,
      closure_layer: closure.closure_layer,
      closure_ready: closure.closure_ready,
      next_action: closure.next_action,
      current_source_to_open: queue.current_source_to_open || "",
    };
  });
}

function markdown(rows) {
  const originalUrlRows = rows.filter((row) => row.closure_status === "original_notice_url_available");
  const localTextRows = rows.filter((row) => row.closure_status === "local_original_notice_text_url_pending");
  const summaryRows = rows.filter((row) => row.closure_status === "official_summary_value_match_original_notice_pending");
  const blockedRows = rows.filter((row) => row.closure_ready === "N");
  return `# 원문 링크 클로저 보드

작성 기준: ${UPDATED_AT}

이 문서는 원문 링크 보정 후보 34건을 "값 확인"과 "원문 링크 닫힘"으로 나눠 관리한다. 값이 공식 보조근거와 일치하더라도 본고시 원문 URL 또는 recordCode가 없으면 완료로 보지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 원문 링크 후보 | ${rows.length} |
| 직접값 매칭 | ${rows.filter((row) => row.candidate_match_level === "exact").length} |
| 원문 URL까지 확보 | ${originalUrlRows.length} |
| 로컬 본고시 텍스트 확보/URL 보강 필요 | ${localTextRows.length} |
| 공식 사업개요 보조근거/본고시 원문 필요 | ${summaryRows.length} |
| 값 후보 미확정 | ${blockedRows.length} |

## 클로저 상태별

${mdTable(countBy(rows, "closure_status"), [
  { key: "name", label: "클로저 상태" },
  { key: "count", label: "건수" },
])}

## 원문 URL까지 닫힌 항목

${mdTable(originalUrlRows, [
  { key: "queue_rank", label: "큐" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "값" },
  { key: "candidate_source_url", label: "원문 URL" },
  { key: "candidate_source_path", label: "로컬 텍스트" },
])}

## URL/recordCode 보강 필요

${mdTable([...localTextRows, ...summaryRows].slice(0, 80), [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "current_value", label: "값" },
  { key: "candidate_source_label", label: "현재 근거" },
  { key: "closure_status", label: "클로저 상태" },
  { key: "next_action", label: "다음 행동" },
])}

## 전체 항목

${mdTable(rows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "field_label", label: "필드" },
  { key: "candidate_source_type", label: "근거 유형" },
  { key: "candidate_match_level", label: "일치" },
  { key: "closure_status", label: "클로저 상태" },
  { key: "closure_ready", label: "닫힘" },
  { key: "candidate_source_path", label: "로컬 경로" },
])}
`;
}

async function main() {
  const [candidates, queueRows] = await Promise.all([readJson(CANDIDATES_INPUT), readJson(QUEUE_INPUT)]);
  const rows = buildRows(candidates, byQueue(queueRows));
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        original_notice_url_available: rows.filter((row) => row.closure_status === "original_notice_url_available").length,
        local_original_notice_text_url_pending: rows.filter((row) => row.closure_status === "local_original_notice_text_url_pending").length,
        official_summary_value_match_original_notice_pending: rows.filter(
          (row) => row.closure_status === "official_summary_value_match_original_notice_pending",
        ).length,
        value_not_corroborated: rows.filter((row) => row.closure_status === "value_not_corroborated").length,
        output: "analysis/source-link-closure-board.{md,csv,json}",
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
