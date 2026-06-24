#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "project-evidence-binder.md");
const OUT_CSV = path.join(OUT_DIR, "project-evidence-binder.csv");
const OUT_JSON = path.join(OUT_DIR, "project-evidence-binder.json");

const INPUTS = {
  matrix: "analysis/project-comparison-matrix.json",
  evidence: "analysis/source-evidence-audit.json",
  textAudit: "analysis/source-text-extraction-audit.json",
  coreLedger: "analysis/core-value-confirmation-ledger.json",
  sourceLinkClosure: "analysis/source-link-closure-board.json",
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
};

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

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function groupByRank(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const rank = String(row.rank || "");
    if (!rank) continue;
    const list = grouped.get(rank) || [];
    list.push(row);
    grouped.set(rank, list);
  }
  return grouped;
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function completionByRank(rows) {
  const map = new Map();
  for (const row of rows) {
    const match = String(row.task_id || "").match(/SRC-P(\d+)/);
    if (!match) continue;
    map.set(String(Number(match[1])), row);
  }
  return map;
}

function officialSourceStack(matrix, evidence) {
  const items = [];
  if (matrix.notice_no || matrix.notice_title) items.push(`서울도시공간포털 ${matrix.notice_no || ""} ${matrix.notice_date || ""}`.trim());
  if (matrix.has_cleanup_url === "Y" || evidence.has_cleanup_url === "Y") items.push("정비사업 정보몽땅 사업장");
  if (matrix.has_business_layer_match === "Y") items.push("서울도시공간포털 사업구역 레이어");
  if (matrix.has_seoul_sibo_original_notice === "Y") items.push(`서울시보 ${matrix.seoul_sibo_original_notice_no || ""}`.trim());
  if (matrix.has_gwangjin_gu_notice_candidate === "Y" || evidence.has_gwangjin_gu_notice_text === "Y") items.push("광진구청 고시공고 첨부");
  if (matrix.has_gangnam_songpa_notice_candidate === "Y" || evidence.has_gangnam_songpa_notice_text === "Y") items.push("강남·송파구청 고시공고 첨부");
  if (matrix.stage_public_doc_status || matrix.stage_public_approval_date) items.push("정보몽땅 단계 공개항목");
  return compact(items, 6);
}

function binderStatus({ evidence, textRows, closureRows, coreRows, completionTask }) {
  if (completionTask) return "official_response_needed";
  if (evidence.evidence_grade === "D" || evidence.evidence_grade === "E") return "source_link_bottleneck";
  if (closureRows.some((row) => row.closure_layer === "blocked" || row.closure_ready === "N")) return "source_link_bottleneck";
  if (coreRows.some((row) => /ocr|image|partial/.test(`${row.verification_status} ${row.ocr_review_status} ${row.manual_ocr_review_status}`))) return "ocr_or_partial_value_review";
  if (textRows.some((row) => row.review_priority === "P1_ocr_verify")) return "ocr_or_partial_value_review";
  if (evidence.evidence_grade === "A" || evidence.evidence_grade === "B") return "primary_original_ready";
  return "needs_manual_review";
}

function binderStatusLabel(status) {
  return {
    primary_original_ready: "원문 기반 검토 가능",
    ocr_or_partial_value_review: "OCR/부분확정 검토",
    source_link_bottleneck: "원문 링크 병목",
    official_response_needed: "공식 회신 필요",
    needs_manual_review: "수동 검토 필요",
  }[status] || status;
}

function nextOpenFiles({ matrix, evidence, textRows, closureRows, coreRows, hypothesis, completionTask }) {
  const files = [];
  if (matrix.project_note === "project-notes/25-hanyanggaro.md") {
    files.push(
      "data/urban/text/gwangjin-hanyanggaro/25-B0000003-6209808-gwangjin-gu-hanyanggaro-schedule.txt",
      "data/urban/text/gwangjin-hanyanggaro/25-B0000003-6213254-gwangjin-gu-hanyanggaro-safety-result.txt",
    );
  }
  if (completionTask) files.push(completionTask.source_file, completionTask.update_file);
  files.push(hypothesis.first_source_to_open, evidence.next_evidence_action, evidence.project_note);
  files.push(...closureRows.map((row) => row.current_source_to_open));
  files.push(...coreRows.filter((row) => row.related_task_priority === "P0").map((row) => row.source_to_open));
  files.push(...textRows.filter((row) => row.review_priority === "P1_ocr_verify").map((row) => row.text_path));
  files.push(...textRows.map((row) => row.text_path));
  return compact(files.flatMap((item) => String(item || "").split(";").map((part) => part.trim())), 10);
}

function sourceFileSummary(textRows) {
  const files = textRows.map((row) => row.source_file);
  const texts = textRows.map((row) => row.text_path);
  return {
    source_files: compact(files, 5),
    text_paths: compact(texts, 5),
    text_source_count: textRows.length,
    text_status_mix: countBy(textRows, "extraction_status"),
    text_method_mix: countBy(textRows, "extraction_method"),
    text_review_priority_mix: countBy(textRows, "review_priority"),
  };
}

function buildRows({ matrixRows, evidenceByRank, textByRank, coreByRank, closureByRank, hypothesisByRank, completionByRankMap }) {
  return matrixRows
    .map((matrix) => {
      const rank = String(matrix.rank);
      const evidence = evidenceByRank.get(rank) || {};
      const textRows = textByRank.get(rank) || [];
      const coreRows = coreByRank.get(rank) || [];
      const closureRows = closureByRank.get(rank) || [];
      const hypothesis = hypothesisByRank.get(rank) || {};
      const completionTask = completionByRankMap.get(rank);
      const fileSummary = sourceFileSummary(textRows);
      const status = binderStatus({ evidence, textRows, closureRows, coreRows, completionTask });
      const p0Core = coreRows.filter((row) => row.related_task_priority === "P0").length;
      const p1Core = coreRows.filter((row) => row.related_task_priority === "P1").length;
      const blockedClosure = closureRows.filter((row) => row.closure_layer === "blocked" || row.closure_ready === "N").length;
      return {
        rank,
        focus_area: matrix.focus_area,
        district: matrix.district,
        dong: matrix.dong,
        project_name: matrix.project_name,
        current_stage: matrix.current_stage,
        evidence_grade: evidence.evidence_grade || "",
        source_coverage_score: evidence.source_coverage_score || "",
        binder_status: status,
        binder_status_label: binderStatusLabel(status),
        official_source_stack: officialSourceStack(matrix, evidence),
        notice_no: matrix.notice_no || evidence.notice_no || "",
        notice_date: matrix.notice_date || evidence.notice_date || "",
        notice_title: matrix.notice_title || "",
        text_source_count: fileSummary.text_source_count,
        text_status_mix: fileSummary.text_status_mix,
        text_method_mix: fileSummary.text_method_mix,
        text_review_priority_mix: fileSummary.text_review_priority_mix,
        source_files: fileSummary.source_files,
        text_paths: fileSummary.text_paths,
        closure_blockers: blockedClosure,
        closure_status_mix: countBy(closureRows, "closure_status"),
        core_p0_items: p0Core,
        core_p1_items: p1Core,
        core_verification_mix: countBy(coreRows, "verification_status"),
        hypothesis_status: hypothesis.hypothesis_status_label || "",
        source_blockers: hypothesis.source_blockers || 0,
        completion_task: completionTask?.task_id || "",
        completion_gate: completionTask?.completion_gate || "",
        first_files_to_open: nextOpenFiles({ matrix, evidence, textRows, closureRows, coreRows, hypothesis, completionTask }),
        next_evidence_action:
          completionTask?.next_action ||
          (matrix.business_layer_alignment_status === "stage_ahead_of_matrix" ? matrix.next_action : "") ||
          evidence.next_evidence_action ||
          matrix.next_action ||
          hypothesis.recommended_move ||
          "",
        project_note: evidence.project_note || hypothesis.project_note || "",
      };
    })
    .sort((a, b) => statusOrder(a.binder_status) - statusOrder(b.binder_status) || Number(b.source_blockers || 0) - Number(a.source_blockers || 0) || Number(a.rank) - Number(b.rank));
}

function statusOrder(status) {
  return {
    official_response_needed: 1,
    source_link_bottleneck: 2,
    ocr_or_partial_value_review: 3,
    needs_manual_review: 4,
    primary_original_ready: 5,
  }[status] || 9;
}

function summarize(rows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    primary_original_ready_count: rows.filter((row) => row.binder_status === "primary_original_ready").length,
    ocr_or_partial_review_count: rows.filter((row) => row.binder_status === "ocr_or_partial_value_review").length,
    source_link_bottleneck_count: rows.filter((row) => row.binder_status === "source_link_bottleneck").length,
    official_response_needed_count: rows.filter((row) => row.binder_status === "official_response_needed").length,
    status_mix: countBy(rows, "binder_status_label"),
    evidence_grade_mix: countBy(rows, "evidence_grade"),
    focus_mix: countBy(rows, "focus_area"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const actionRows = rows.filter((row) => row.binder_status !== "primary_original_ready").slice(0, 20);
  const fields = [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "evidence_grade", label: "근거" },
    { key: "binder_status_label", label: "상태" },
    { key: "official_source_stack", label: "공식 원천" },
    { key: "first_files_to_open", label: "먼저 열 파일" },
    { key: "next_evidence_action", label: "다음 확인" },
  ];
  return `# 사업장별 공식 근거 바인더

작성 기준: ${UPDATED_AT}

이 문서는 후보 30개 사업장의 공식 근거를 검증하기 위한 시작점이다. 서울도시공간포털, 정비사업 정보몽땅, 서울시보, 자치구 고시공고, 로컬 원문 파일, 텍스트 추출 상태, 원문 링크 병목, 핵심 수치 검증 상태를 한 행으로 묶는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 사업장 | ${summary.project_count} |
| 원문 기반 검토 가능 | ${summary.primary_original_ready_count} |
| OCR/부분확정 검토 | ${summary.ocr_or_partial_review_count} |
| 원문 링크 병목 | ${summary.source_link_bottleneck_count} |
| 공식 회신 필요 | ${summary.official_response_needed_count} |

## 분포

| 구분 | 값 |
| --- | --- |
| 바인더 상태 | ${summary.status_mix} |
| 근거 등급 | ${summary.evidence_grade_mix} |
| 생활권 | ${summary.focus_mix} |

## 먼저 열 근거 묶음

${mdTable(actionRows, fields)}

## Goal 완료 병목 근거

${mdTable(rows.filter((row) => row.completion_task), [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "completion_task", label: "Task" },
    { key: "first_files_to_open", label: "먼저 열 파일" },
    { key: "completion_gate", label: "완료 gate" },
  ])}

## 전체 바인더

${mdTable(rows, [
    ...fields,
    { key: "text_source_count", label: "텍스트" },
    { key: "text_method_mix", label: "추출방식" },
    { key: "core_p0_items", label: "핵심P0" },
    { key: "closure_blockers", label: "링크병목" },
    { key: "project_note", label: "메모" },
  ])}

## 해석 원칙

- 바인더 상태는 투자 판단이 아니라 공식 근거 사용 가능성을 나타낸다.
- OCR/부분확정 검토 사업은 텍스트가 있어도 원문 이미지·표 행·열을 확인하기 전에는 확정값으로 쓰지 않는다.
- 공식 회신 필요 사업은 공개화면만으로 본고시/인가 원문 또는 별첨 수치를 닫을 수 없으므로 회신 intake가 들어오기 전까지 goal 완료로 보지 않는다.
- 먼저 열 파일은 내부 작업 순서다. 원문 URL·고시번호·고시일·자료명 확인 전에는 보도자료나 시장 데이터로 단계 판정을 대체하지 않는다.
`;
}

async function main() {
  const [matrixRows, evidenceRows, textRows, coreRows, closureRows, hypothesisData, completionData] = await Promise.all([
    readJson(INPUTS.matrix),
    readJson(INPUTS.evidence),
    readJson(INPUTS.textAudit),
    readJson(INPUTS.coreLedger),
    readJson(INPUTS.sourceLinkClosure),
    readJson(INPUTS.hypothesisLedger),
    readJson(INPUTS.completionCockpit),
  ]);
  const rows = buildRows({
    matrixRows: rowsFrom(matrixRows),
    evidenceByRank: byRank(rowsFrom(evidenceRows)),
    textByRank: groupByRank(rowsFrom(textRows)),
    coreByRank: groupByRank(rowsFrom(coreRows)),
    closureByRank: groupByRank(rowsFrom(closureRows)),
    hypothesisByRank: byRank(rowsFrom(hypothesisData)),
    completionByRankMap: completionByRank(rowsFrom(completionData)),
  });
  const summary = summarize(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ rows: rows.length, officialResponseNeeded: summary.official_response_needed_count, output: "analysis/project-evidence-binder.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
