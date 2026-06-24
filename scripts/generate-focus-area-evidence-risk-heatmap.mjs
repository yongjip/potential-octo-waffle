#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-area-evidence-risk-heatmap.md");
const OUT_CSV = path.join(OUT_DIR, "focus-area-evidence-risk-heatmap.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-area-evidence-risk-heatmap.json");

const INPUTS = {
  potential: "analysis/long-term-potential-scorecard.json",
  dueDiligence: "analysis/project-due-diligence-board.json",
  sourceEvidence: "analysis/source-evidence-audit.json",
  riskSignals: "analysis/project-risk-signal-summary.json",
  hypotheses: "analysis/research-hypothesis-ledger.json",
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

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  return value.rows || [];
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function groupBy(rows, field) {
  const grouped = new Map();
  for (const row of rows) {
    const key = row[field] || "미분류";
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }
  return grouped;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function average(rows, field) {
  if (!rows.length) return 0;
  return round(rows.reduce((sum, row) => sum + Number(row[field] || 0), 0) / rows.length);
}

function countWhere(rows, predicate) {
  return rows.filter(predicate).length;
}

function countByText(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function riskScore(level) {
  if (level === "very_high") return 10;
  if (level === "high") return 8;
  if (level === "medium") return 5;
  if (level === "low") return 2;
  return 4;
}

function weakEvidence(grade) {
  return ["C", "D", "E"].includes(String(grade || "").toUpperCase());
}

function projectHeatScore({ potential, due, source, risk, hypothesis }) {
  const confidenceGap = Math.max(0, 10 - Number(potential.confidence_score || due.confidence_score || 0));
  const weakEvidenceBoost = weakEvidence(source.evidence_grade || due.evidence_grade) ? 18 : 0;
  const responseBoost = due.diligence_lane === "공식 회신 선행" ? 28 : 0;
  const sourceBlockedBoost = hypothesis.hypothesis_status === "source_blocked_hypothesis" ? 14 : 0;
  return round(
    Number(potential.long_term_potential_score || due.long_term_potential_score || 0) * 8 +
      riskScore(risk.risk_signal_level || due.risk_signal_level) * 5 +
      confidenceGap * 4 +
      weakEvidenceBoost +
      responseBoost +
      sourceBlockedBoost,
  );
}

function buildProjectRows({ potentialRows, dueRows, sourceRows, riskRows, hypothesisRows }) {
  const dueByRank = byRank(dueRows);
  const sourceByRank = byRank(sourceRows);
  const riskByRank = byRank(riskRows);
  const hypothesisByRank = byRank(hypothesisRows);

  return potentialRows
    .map((potential) => {
      const rank = String(potential.rank);
      const due = dueByRank.get(rank) || {};
      const source = sourceByRank.get(rank) || {};
      const risk = riskByRank.get(rank) || {};
      const hypothesis = hypothesisByRank.get(rank) || {};
      const evidenceGrade = source.evidence_grade || due.evidence_grade || potential.evidence_grade || "";
      return {
        rank,
        focus_area: potential.focus_area,
        project_name: potential.project_name,
        current_stage: potential.current_stage,
        heat_score: projectHeatScore({ potential, due, source, risk, hypothesis }),
        long_term_potential_score: potential.long_term_potential_score,
        confidence_score: potential.confidence_score,
        evidence_grade: evidenceGrade,
        weak_evidence: weakEvidence(evidenceGrade) ? "Y" : "N",
        diligence_lane: due.diligence_lane || "",
        risk_signal_level: risk.risk_signal_level || due.risk_signal_level || "",
        hypothesis_status: hypothesis.hypothesis_status_label || hypothesis.hypothesis_status || "",
        next_gate: due.confidence_gate || hypothesis.decision_rule || potential.revisit_trigger || "",
        first_files: due.first_files || hypothesis.first_source_to_open || potential.project_note || "",
        project_note: potential.project_note || due.project_note || "",
      };
    })
    .sort((a, b) => Number(b.heat_score) - Number(a.heat_score) || Number(a.rank) - Number(b.rank));
}

function gateForFocus(row) {
  if (row.official_response_first_count > 0) return "공식 회신/정보공개 결과가 들어오기 전에는 생활권 비교 확정도를 올리지 않는다.";
  if (row.weak_evidence_count >= 4) return "고시번호·고시일·원문 URL·핵심 수치가 약한 사업을 먼저 줄인다.";
  if (row.very_high_risk_count >= 5) return "공공기여·기반시설·분담금 공개항목을 먼저 대조한다.";
  return "현장 답사와 월간 공식 context scan으로 가설 유지 여부를 본다.";
}

function buildFocusRows(projectRows, completionSummary) {
  const groups = groupBy(projectRows, "focus_area");
  return [...groups.entries()]
    .map(([focus_area, rows]) => {
      const hot = [...rows].sort((a, b) => Number(b.heat_score) - Number(a.heat_score));
      const weak = countWhere(rows, (row) => row.weak_evidence === "Y");
      const responseFirst = countWhere(rows, (row) => row.diligence_lane === "공식 회신 선행");
      const veryHigh = countWhere(rows, (row) => row.risk_signal_level === "very_high");
      const sourceBlocked = countWhere(rows, (row) => /원문 병목|source_blocked/.test(row.hypothesis_status));
      const avgPotential = average(rows, "long_term_potential_score");
      const avgConfidence = average(rows, "confidence_score");
      const avgHeat = average(rows, "heat_score");
      const row = {
        focus_area,
        project_count: rows.length,
        avg_potential: avgPotential,
        avg_confidence: avgConfidence,
        avg_heat_score: avgHeat,
        evidence_grade_mix: countByText(rows, "evidence_grade"),
        weak_evidence_count: weak,
        official_response_first_count: responseFirst,
        very_high_risk_count: veryHigh,
        source_blocked_hypothesis_count: sourceBlocked,
        top_heat_projects: compact(hot.map((item) => `${item.rank}. ${item.project_name}`), 3),
        main_risk_lanes: countByText(rows, "diligence_lane"),
        next_gate: "",
        completion_context: `전체 P0 ${completionSummary.p0_count || 0}건; 정보공개/공식 민원 준비 ${completionSummary.status_counts?.ready_to_file_if_department_response_not_available || 0}건`,
      };
      row.next_gate = gateForFocus(row);
      return row;
    })
    .sort((a, b) => Number(b.avg_heat_score) - Number(a.avg_heat_score));
}

function markdown(summary, focusRows, projectRows) {
  const hotProjects = projectRows.slice(0, 15);
  return `# 생활권 증거·리스크 Heatmap

작성 기준: ${UPDATED_AT}

이 문서는 생활권별 장기 가능성을 바로 결론으로 읽지 않도록, 공식 근거 품질·원문 병목·공식 회신 필요·리스크 신호를 함께 묶는다. 점수는 투자 매력도가 아니라 다음 검증 순서를 정하는 리서치 열도다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 생활권 | ${summary.focus_area_count} |
| 사업장 | ${summary.project_count} |
| weak evidence 사업 | ${summary.weak_evidence_count} |
| 공식 회신 선행 사업 | ${summary.official_response_first_count} |
| very high risk 사업 | ${summary.very_high_risk_count} |
| source blocked 가설 | ${summary.source_blocked_hypothesis_count} |
| P0 완료 병목 | ${summary.p0_count} |

## 생활권 Heatmap

${mdTable(focusRows, [
  { key: "focus_area", label: "생활권" },
  { key: "project_count", label: "후보" },
  { key: "avg_potential", label: "평균 잠재" },
  { key: "avg_confidence", label: "평균 확신" },
  { key: "avg_heat_score", label: "검증 열도" },
  { key: "evidence_grade_mix", label: "근거 등급" },
  { key: "weak_evidence_count", label: "약한 근거" },
  { key: "official_response_first_count", label: "회신 선행" },
  { key: "very_high_risk_count", label: "very_high" },
  { key: "top_heat_projects", label: "먼저 볼 사업" },
  { key: "next_gate", label: "다음 gate" },
])}

## 사업장 검증 열도 상위

${mdTable(hotProjects, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "heat_score", label: "검증 열도" },
  { key: "long_term_potential_score", label: "잠재" },
  { key: "confidence_score", label: "확신" },
  { key: "evidence_grade", label: "근거" },
  { key: "diligence_lane", label: "실사 레인" },
  { key: "risk_signal_level", label: "리스크" },
  { key: "next_gate", label: "확정 gate" },
])}

## 해석 원칙

- 검증 열도가 높으면 장기 가능성이 크거나, 근거가 약하거나, 리스크/회신 병목이 커서 먼저 검증해야 한다는 뜻이다.
- \`공식 회신 선행\` 사업은 정보공개/담당부서 회신 전까지 생활권 결론을 올리는 근거로 쓰지 않는다.
- evidence grade가 낮은 사업은 시장 신호나 현장 인상보다 고시번호·고시일·원문 URL·첨부명 확인을 먼저 한다.
- very_high 리스크는 배제 신호가 아니라 비용·기반시설·공공기여 공개항목을 먼저 대조하라는 신호다.
`;
}

async function main() {
  const potentialRows = rowsFrom(await readJson(INPUTS.potential));
  const due = await readJson(INPUTS.dueDiligence);
  const sourceRows = rowsFrom(await readJson(INPUTS.sourceEvidence));
  const riskRows = rowsFrom(await readJson(INPUTS.riskSignals));
  const hypotheses = await readJson(INPUTS.hypotheses);
  const completion = await readJson(INPUTS.completionCockpit);

  const projectRows = buildProjectRows({
    potentialRows,
    dueRows: rowsFrom(due),
    sourceRows,
    riskRows,
    hypothesisRows: rowsFrom(hypotheses),
  });
  const focusRows = buildFocusRows(projectRows, completion.summary || {});
  const summary = {
    generated_at: UPDATED_AT,
    focus_area_count: focusRows.length,
    project_count: projectRows.length,
    weak_evidence_count: projectRows.filter((row) => row.weak_evidence === "Y").length,
    official_response_first_count: projectRows.filter((row) => row.diligence_lane === "공식 회신 선행").length,
    very_high_risk_count: projectRows.filter((row) => row.risk_signal_level === "very_high").length,
    source_blocked_hypothesis_count: projectRows.filter((row) => /원문 병목|source_blocked/.test(row.hypothesis_status)).length,
    p0_count: completion.summary?.p0_count || 0,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown(summary, focusRows, projectRows));
  await writeFile(OUT_CSV, toCsv(focusRows));
  await writeFile(OUT_JSON, JSON.stringify({ summary, focus_rows: focusRows, project_rows: projectRows }, null, 2));
  console.log(JSON.stringify({ focusAreas: focusRows.length, projects: projectRows.length, weakEvidence: summary.weak_evidence_count, output: "analysis/focus-area-evidence-risk-heatmap.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
