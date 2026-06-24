#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "source-value-verification-queue.md");
const OUT_CSV = path.join(OUT_DIR, "source-value-verification-queue.csv");
const OUT_JSON = path.join(OUT_DIR, "source-value-verification-queue.json");

const RISK_INPUT = "analysis/project-risk-signal-summary.json";
const EVIDENCE_INPUT = "analysis/source-evidence-audit.json";
const TEXT_AUDIT_INPUT = "analysis/source-text-extraction-audit.json";
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const BOARD_QUEUE_INPUT = "analysis/cleanup-board-review-queue.json";

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const PRIORITY_WEIGHT = {
  P0: 400,
  P1: 300,
  P2: 200,
  P3: 100,
};

const RISK_WEIGHT = {
  very_high: 60,
  high: 40,
  medium: 20,
  watch: 0,
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
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function byRank(rows, rankField = "rank") {
  return Object.fromEntries(rows.map((row) => [String(row[rankField] || ""), row]).filter(([rank]) => rank));
}

function groupByRank(rows, rankField = "rank") {
  return rows.reduce((acc, row) => {
    const rank = String(row[rankField] || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function hasFlag(text, pattern) {
  return String(text || "").includes(pattern);
}

function riskPriority(riskLevel, basePriority) {
  if (basePriority === "P0") return "P0";
  if (riskLevel === "very_high" && basePriority === "P1") return "P0";
  if (riskLevel === "very_high" && basePriority === "P2") return "P1";
  if (riskLevel === "high" && basePriority === "P2") return "P1";
  return basePriority;
}

function missingOfficialFields(matrixRow) {
  const fields = [
    ["district_area", matrixRow?.district_area_sqm_official],
    ["total_households", matrixRow?.total_households_official],
    ["floor_area_ratio", matrixRow?.floor_area_ratio_pct_official],
    ["building_coverage_ratio", matrixRow?.building_coverage_ratio_pct_official],
    ["max_height", matrixRow?.max_height_m_official],
    ["floors", matrixRow?.floors_official],
  ];
  return fields.filter(([, value]) => !String(value || "").trim()).map(([name]) => name);
}

function snippetCoverage(matrixRow) {
  const checks = [
    ["area", matrixRow?.has_area_snippet],
    ["far", matrixRow?.has_far_snippet],
    ["households", matrixRow?.has_household_snippet],
    ["infrastructure", matrixRow?.has_infrastructure_snippet],
    ["public_contribution", matrixRow?.has_public_contribution_snippet],
  ];
  const present = checks.filter(([, value]) => value === "Y").map(([name]) => name);
  const missing = checks.filter(([, value]) => value !== "Y").map(([name]) => name);
  return { present, missing };
}

function topBoardItems(boardRows, limit = 3) {
  return boardRows
    .slice()
    .sort((a, b) => String(a.review_priority || "").localeCompare(String(b.review_priority || "")) || Number(b.signal_score || 0) - Number(a.signal_score || 0))
    .slice(0, limit)
    .map((row) => `${row.review_priority} ${row.item_date || ""} ${row.title}`.replace(/\s+/g, " ").trim())
    .join(" / ");
}

function manualOcrReviewClosed(matrixRow) {
  const reviewCount = Number(matrixRow?.manual_ocr_review_count || 0);
  const pendingUpdateCount = Number(matrixRow?.source_value_update_candidate_count || 0);
  const statuses = String(matrixRow?.manual_ocr_review_statuses || "");
  if (!reviewCount || pendingUpdateCount > 0) return false;
  return !/(partial_confirmation|basis_mismatch|not_suitable|fills_missing|manual_review_record_only)/.test(statuses);
}

function localOfficialNoticeContextReady(matrixRow) {
  return (
    String(matrixRow?.text_coverage || "") === "text_extracted" &&
    !!String(matrixRow?.text_path || "").trim() &&
    !!String(matrixRow?.notice_no || "").trim() &&
    !!String(matrixRow?.notice_date || "").trim()
  );
}

function addTask(tasks, row) {
  tasks.push({
    task_id: `${String(row.rank).padStart(2, "0")}-${row.task_type}`,
    rank: String(row.rank),
    focus_area: row.focus_area,
    district: row.district,
    project_name: row.project_name,
    current_stage: row.current_stage,
    risk_signal_level: row.risk_signal_level,
    evidence_grade: row.evidence_grade,
    priority: row.priority,
    task_type: row.task_type,
    task_title: row.task_title,
    why_now: row.why_now,
    source_to_open: row.source_to_open || "",
    fields_to_verify: row.fields_to_verify || "",
    expected_output: row.expected_output,
    related_public_items: row.related_public_items || "",
    project_note: row.project_note || "",
    sort_score: row.sort_score,
  });
}

function buildTasks({ riskRows, evidenceRowsByRank, textRowsByRank, matrixRowsByRank, boardRowsByRank }) {
  const tasks = [];

  for (const risk of riskRows) {
    const rank = String(risk.rank);
    const evidence = evidenceRowsByRank[rank] || {};
    const textRows = textRowsByRank[rank] || [];
    const matrix = matrixRowsByRank[rank] || {};
    const boardRows = boardRowsByRank[rank] || [];
    const riskLevel = risk.risk_signal_level || "watch";
    const common = {
      rank,
      focus_area: risk.focus_area,
      district: risk.district,
      project_name: risk.project_name,
      current_stage: risk.current_stage,
      risk_signal_level: riskLevel,
      evidence_grade: evidence.evidence_grade || "",
      project_note: risk.project_note,
      related_public_items: topBoardItems(boardRows),
    };
    const riskBoost = RISK_WEIGHT[riskLevel] || 0;
    const flags = evidence.risk_flags || "";
    const snippets = snippetCoverage(matrix);
    const missingFields = missingOfficialFields(matrix);
    const textPriorities = new Set(textRows.map((row) => row.review_priority));
    const ocrRows = textRows.filter((row) => row.review_priority === "P1_ocr_verify");
    const ocrAlreadyClosed = manualOcrReviewClosed(matrix);

    if (hasFlag(flags, "수치 시점차/충돌")) {
      const priority = riskPriority(riskLevel, "P0");
      addTask(tasks, {
        ...common,
        priority,
        task_type: "resolve_stage_value_conflict",
        task_title: "사업시행/관리처분 수치 시점차 확정",
        why_now: "관리처분·사업시행 단계 수치가 사업개요와 고시/공개항목 사이에서 달라 비교표 해석이 흔들림",
        source_to_open: "analysis/management-stage-fact-check.md; project-notes",
        fields_to_verify: "사업시행인가일; 관리처분인가일; 총세대수; 용적률; 공사비/분담금 관련 공개항목",
        expected_output: "비교 매트릭스의 시점별 수치 주석과 사업별 메모 보강",
        sort_score: PRIORITY_WEIGHT[priority] + riskBoost + 30,
      });
    }

    if (!ocrAlreadyClosed && (ocrRows.length || hasFlag(flags, "OCR 텍스트") || hasFlag(flags, "HWP 이미지 OCR 텍스트"))) {
      const priority = riskPriority(riskLevel, "P1");
      addTask(tasks, {
        ...common,
        priority,
        task_type: "verify_ocr_numbers",
        task_title: "OCR 원문 수치 대조",
        why_now: "OCR 텍스트는 숫자·단위 오류 가능성이 있어 확정 수치로 쓰기 전 원문 이미지 대조가 필요함",
        source_to_open: ocrRows.map((row) => row.text_path).filter(Boolean).join("; ") || "analysis/source-text-extraction-audit.md",
        fields_to_verify: snippets.present.length ? snippets.present.join("; ") : "면적; 세대수; 용적률; 기반시설; 공공기여",
        expected_output: "OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시",
        sort_score: PRIORITY_WEIGHT[priority] + riskBoost + 25,
      });
    }

    if (
      (["C", "D", "E"].includes(evidence.evidence_grade) || hasFlag(flags, "고시 상세 미확보") || hasFlag(flags, "recordCode 미확보")) &&
      !localOfficialNoticeContextReady(matrix)
    ) {
      const priority = riskPriority(riskLevel, ["D", "E"].includes(evidence.evidence_grade) ? "P0" : "P1");
      addTask(tasks, {
        ...common,
        priority,
        task_type: "connect_recordcode_original_notice",
        task_title: "recordCode·고시 원문 연결",
        why_now: "지도/사업구역 레이어와 고시 원문 연결이 약하면 진행단계와 수치의 공식 근거가 불안정함",
        source_to_open: "서울도시공간포털 지도; 자치구 고시공고; analysis/source-evidence-audit.md",
        fields_to_verify: "recordCode; noticeCode; 고시번호; 고시일; 구역명; 면적",
        expected_output: "고시 원문 또는 자치구 원문 URL/로컬 파일 연결",
        sort_score: PRIORITY_WEIGHT[priority] + riskBoost + 20,
      });
    }

    if ((Number(risk.p0_count || 0) > 0 || Number(risk.p1_count || 0) > 0) && /비용·분담금|기반시설/.test(risk.signal_groups || "")) {
      const priority = riskPriority(riskLevel, "P1");
      addTask(tasks, {
        ...common,
        priority,
        task_type: "crosscheck_cost_infrastructure",
        task_title: "비용·기반시설 공개항목 원문 대조",
        why_now: "비용·분담금 또는 기반시설 신호는 장기 가능성과 조합원 부담 리스크를 동시에 바꾸는 핵심 변수임",
        source_to_open: "analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서",
        fields_to_verify: "공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액",
        expected_output: "사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결",
        sort_score: PRIORITY_WEIGHT[priority] + riskBoost + Number(risk.p0_count || 0) * 5 + Number(risk.p1_count || 0) * 3,
      });
    }

    if (evidence.next_evidence_action?.includes("원문 스니펫") || (riskLevel === "very_high" && snippets.present.length >= 3)) {
      const priority = riskPriority(riskLevel, "P2");
      addTask(tasks, {
        ...common,
        priority,
        task_type: "promote_snippets_to_confirmed_values",
        task_title: "원문 스니펫 확정 수치 승격",
        why_now: "비교표에 이미 자동 추출 수치가 있으나 최종 비교 기준으로 쓰려면 원문 문맥 확인이 필요함",
        source_to_open: matrix.text_path || "data/urban/text/notice-key-fields.csv",
        fields_to_verify: snippets.present.join("; ") || "면적; 세대수; 용적률; 기반시설; 공공기여",
        expected_output: "구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시",
        sort_score: PRIORITY_WEIGHT[priority] + riskBoost + snippets.present.length * 3,
      });
    }

    if (missingFields.length || snippets.missing.includes("households")) {
      const priority = riskPriority(riskLevel, riskLevel === "very_high" ? "P2" : "P3");
      addTask(tasks, {
        ...common,
        priority,
        task_type: "fill_missing_core_fields",
        task_title: "비교 핵심 수치 공란 보강",
        why_now: "세대수·용적률·층수 등 핵심 필드가 비어 있으면 사업장 간 비교가 약해짐",
        source_to_open: "project-notes; data/urban/text/notice-key-fields.csv; 정비사업 정보몽땅 사업개요",
        fields_to_verify: [...new Set([...missingFields, ...snippets.missing])].join("; "),
        expected_output: "공란 수치의 원문 기반 보강 또는 미공개 사유 기록",
        sort_score: PRIORITY_WEIGHT[priority] + riskBoost + missingFields.length * 3,
      });
    }
  }

  return tasks
    .sort((a, b) => b.sort_score - a.sort_score || Number(a.rank) - Number(b.rank) || a.task_type.localeCompare(b.task_type))
    .map((task, index) => ({ queue_rank: index + 1, ...task }));
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

function markdown(rows) {
  const p0p1 = rows.filter((row) => ["P0", "P1"].includes(row.priority));
  const topRows = rows.slice(0, 30);
  return `# 원문 수치 검증 큐

작성 기준: ${kstDate()} KST

이 문서는 사업장별 리스크 신호, 공식 근거 품질, 원문 텍스트 추출 상태를 결합해 어느 수치를 먼저 원문으로 확정할지 정한 작업 큐다. 투자 판단이 아니라 비교표와 사업별 메모의 근거 품질을 올리기 위한 운영표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 전체 검증 태스크 | ${rows.length} |
| P0/P1 태스크 | ${p0p1.length} |
| 대상 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| very_high 관련 태스크 | ${rows.filter((row) => row.risk_signal_level === "very_high").length} |

## 우선순위별

${mdTable(countBy(rows, "priority"), [
  { key: "name", label: "우선순위" },
  { key: "count", label: "건수" },
])}

## 작업 유형별

${mdTable(countBy(rows, "task_type"), [
  { key: "name", label: "작업 유형" },
  { key: "count", label: "건수" },
])}

## 상위 작업 큐

${mdTable(topRows, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선순위" },
  { key: "risk_signal_level", label: "리스크" },
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "task_title", label: "작업" },
  { key: "fields_to_verify", label: "확인 필드" },
  { key: "expected_output", label: "산출물" },
])}

## P0/P1 상세

${mdTable(p0p1, [
  { key: "queue_rank", label: "큐" },
  { key: "priority", label: "우선순위" },
  { key: "task_type", label: "작업 유형" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "why_now", label: "이유" },
  { key: "source_to_open", label: "열어볼 원문/파일" },
  { key: "related_public_items", label: "관련 공개항목" },
])}

## 사용법

1. 큐 번호 순으로 사업별 메모를 열고 \`source_to_open\`의 원문 또는 분석표를 확인한다.
2. OCR 또는 HWP 이미지 OCR 항목은 원문 이미지와 숫자/단위를 대조한 뒤 \`confirmed\`, \`conflict\`, \`pending\` 중 하나로 메모한다.
3. 비용·기반시설 항목은 정보몽땅 공개항목 제목만으로 확정하지 않고 고시 결정조서, 첨부파일, 조합 공개표를 함께 본다.
4. recordCode·고시 원문 연결 태스크는 수치 해석보다 먼저 처리한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [riskRows, evidenceRows, textRows, matrixRows, boardRows] = await Promise.all([
    readJson(RISK_INPUT),
    readJson(EVIDENCE_INPUT),
    readJson(TEXT_AUDIT_INPUT),
    readJson(MATRIX_INPUT),
    readJson(BOARD_QUEUE_INPUT),
  ]);
  const rows = buildTasks({
    riskRows,
    evidenceRowsByRank: byRank(evidenceRows),
    textRowsByRank: groupByRank(textRows),
    matrixRowsByRank: byRank(matrixRows),
    boardRowsByRank: groupByRank(boardRows),
  });
  const publicRows = rows.map(({ sort_score, ...row }) => row);
  await writeFile(OUT_JSON, `${JSON.stringify(publicRows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(publicRows), "utf8");
  await writeFile(OUT_MD, markdown(publicRows), "utf8");
  console.log(JSON.stringify({
    rows: publicRows.length,
    p0: publicRows.filter((row) => row.priority === "P0").length,
    p1: publicRows.filter((row) => row.priority === "P1").length,
    projects: new Set(publicRows.map((row) => row.rank)).size,
    output: "analysis/source-value-verification-queue.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
