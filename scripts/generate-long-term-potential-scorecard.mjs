#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const TRANSPORT_INPUT = "analysis/transport-location-context.json";
const STATUS_INPUT = "analysis/research-status-dashboard.json";
const OUT_DIR = "analysis";
const OUT_MD = "long-term-potential-scorecard.md";
const OUT_CSV = "long-term-potential-scorecard.csv";
const OUT_JSON = "long-term-potential-scorecard.json";
const UPDATED_AT = `${kstDate()} KST`;

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

function numberValue(value) {
  const match = String(value ?? "").replaceAll(",", "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function normalized(value, values) {
  const usable = values.filter((item) => item > 0);
  if (!value || usable.length === 0) return 0;
  const min = Math.min(...usable);
  const max = Math.max(...usable);
  if (max === min) return 7;
  return round(((value - min) / (max - min)) * 9 + 1);
}

function stageScore(row) {
  return round((Number(row.stage_order || 0) / 6) * 10);
}

function externalDriverScore(transport) {
  const text = `${transport.urban_change_drivers || ""} ${transport.long_term_thesis || ""}`;
  let score = 4;
  if (/MICE|국제교류복합지구|종합운동장/.test(text)) score += 2.5;
  if (/한강|한강변|조망/.test(text)) score += 2;
  if (/동서울터미널|강변역|광역교통/.test(text)) score += 2;
  if (/학군|대치/.test(text)) score += 1.5;
  if (/업무지구|문정|법조/.test(text)) score += 1;
  if (/재정비촉진|재개발/.test(text)) score += 0.5;
  return clamp(round(score));
}

function evidenceScore(matrix, status) {
  const coverage = Number(matrix.source_coverage_score || status.source_coverage_score || 0);
  const gradeBonus = { A: 2, B: 1, C: 0, D: -1.5, E: -3 }[status.evidence_grade] ?? 0;
  return clamp(round((coverage / 7) * 8 + gradeBonus));
}

function confidenceScore(matrix, status) {
  let score = evidenceScore(matrix, status);
  score -= Number(status.p0_tasks || 0) * 0.6;
  score -= Number(status.source_link_items || 0) * 0.25;
  if (matrix.fact_check_priority === "notice_record_needed") score -= 1.2;
  if (matrix.text_coverage === "no_notice_text") score -= 1;
  return clamp(round(score));
}

function riskSignal(status) {
  if (status.risk_signal_level === "very_high") return 10;
  if (status.risk_signal_level === "high") return 8;
  if (status.risk_signal_level === "medium") return 6;
  return 4;
}

function scaleSignal(row, areaScore, householdScore) {
  if (householdScore && areaScore) return round(areaScore * 0.55 + householdScore * 0.45);
  if (areaScore) return areaScore;
  if (householdScore) return householdScore;
  return 3;
}

function upsideWatch(row, transport) {
  const text = `${transport.urban_change_drivers || ""} ${row.project_name || ""}`;
  const items = [];
  if (/MICE|국제교류복합지구|종합운동장/.test(text)) items.push("잠실 MICE·국제교류복합지구 일정과 정비사업 단계 동조");
  if (/한강|압구정|광장|자양/.test(text)) items.push("한강 접근·경관·보행축 원문과 현장 동선 개선");
  if (/동서울터미널|강변역|구의·강변/.test(text)) items.push("동서울터미널/강변역 도시계획·사전협상 구체화");
  if (/학군|대치|은마|쌍용|우성/.test(text)) items.push("대치 학군 수요와 사업시행 이후 비용 안정");
  if (/관리처분|이주|착공/.test(`${row.current_stage} ${row.risk_notes || ""}`)) items.push("관리처분 이후 이주·착공 전환");
  if (!items.length) items.push("공식 단계 상승과 공개자료 증가");
  return [...new Set(items)].slice(0, 3).join("; ");
}

function downsideWatch(matrix, status, transport) {
  const items = [];
  if (Number(status.p0_tasks || 0) > 0) items.push(`P0 원문 검증 ${status.p0_tasks}건`);
  if (matrix.fact_check_priority === "notice_record_needed") items.push("고시/인가 원문 미연결");
  if (Number(status.missing_value_items || 0) > 0) items.push(`핵심 수치 공란 ${status.missing_value_items}건`);
  if (/혼잡|단절|도로/.test(transport.mobility_risks || "")) items.push(transport.mobility_risks);
  if (!items.length) items.push("공사비·분담금·일정 지연 신호");
  return items.slice(0, 3).join("; ");
}

function revisitTrigger(matrix, status, transport) {
  if (matrix.fact_check_priority === "notice_record_needed") return "고시번호, 인가일, 결정조서 원문이 확보되면 즉시 재평가";
  if (Number(status.p0_tasks || 0) > 0) return "P0 원문 검증 태스크가 confirmed/conflict로 정리되면 재평가";
  if ((transport.urban_change_drivers || "").includes("MICE")) return "잠실 MICE/국제교류복합지구 일정 또는 고시 변경 시 재평가";
  if (/동서울터미널|강변역/.test(transport.urban_change_drivers || "")) return "동서울터미널 관련 도시계획·사전협상 문서 갱신 시 재평가";
  if ((transport.urban_change_drivers || "").includes("한강")) return "한강변관리·경관·공공기여 조건 변경 시 재평가";
  return "단계 변경, 공개자료 수 증가, 사업개요 수치 변경 시 재평가";
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

function focusSummary(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.focus_area]) acc[row.focus_area] = [];
    acc[row.focus_area].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([focus_area, items]) => {
    const top = [...items].sort((a, b) => b.long_term_potential_score - a.long_term_potential_score)[0];
    return {
      focus_area,
      project_count: items.length,
      avg_potential: round(items.reduce((sum, row) => sum + row.long_term_potential_score, 0) / items.length),
      avg_confidence: round(items.reduce((sum, row) => sum + row.confidence_score, 0) / items.length),
      avg_location: round(items.reduce((sum, row) => sum + row.location_score, 0) / items.length),
      top_project: `${top.rank}. ${top.project_name}`,
      main_watch: top.upside_watch,
    };
  });
}

function markdown(rows) {
  const top = [...rows].sort((a, b) => b.research_priority_score - a.research_priority_score || Number(a.rank) - Number(b.rank)).slice(0, 15);
  return `# 장기 가능성 점수카드

작성 기준: ${UPDATED_AT}

공식 원문 기반 비교표와 교통입지 컨텍스트를 결합해 생활권·사업장별 장기 관찰 가설을 정리한 문서다. 투자 판단 점수가 아니라, 어떤 사업을 장기적으로 계속 관찰할지와 어떤 공식 신호가 나오면 가설을 바꿀지 정하는 리서치 점수카드다.

## 생활권 요약

${mdTable(focusSummary(rows), [
  { key: "focus_area", label: "생활권" },
  { key: "project_count", label: "후보" },
  { key: "avg_potential", label: "평균 잠재력" },
  { key: "avg_confidence", label: "평균 확신도" },
  { key: "avg_location", label: "평균 입지" },
  { key: "top_project", label: "상위 관찰 사업" },
  { key: "main_watch", label: "주요 관찰 신호" },
])}

## 우선 관찰 사업

${mdTable(top, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "location_score", label: "입지" },
  { key: "stage_score", label: "단계" },
  { key: "scale_score", label: "규모" },
  { key: "confidence_score", label: "확신도" },
  { key: "long_term_potential_score", label: "장기잠재" },
  { key: "research_priority_score", label: "관찰우선" },
])}

## 사업별 가설

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "mobility_axis", label: "교통축" },
  { key: "upside_watch", label: "상방 관찰 신호" },
  { key: "downside_watch", label: "리스크 관찰 신호" },
  { key: "revisit_trigger", label: "재평가 트리거" },
])}

## 해석 원칙

- 장기잠재 점수는 입지, 단계, 규모, 공공 변화 동인, 공식 근거 품질을 합친 리서치용 점수다.
- 확신도는 별도다. 원문 고시·recordCode·핵심 수치가 부족한 사업은 장기 가설이 좋아도 먼저 검증해야 한다.
- 관찰우선 점수는 잠재력과 검증 필요성을 같이 반영한다. 점수가 높다고 투자 우선이라는 뜻이 아니다.
`;
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const transportByRank = byRank(JSON.parse(await readFile(TRANSPORT_INPUT, "utf8")));
  const statusByRank = byRank(JSON.parse(await readFile(STATUS_INPUT, "utf8")));
  const areaValues = matrixRows.map((row) => numberValue(row.district_area_sqm_official || row.business_layer_area_sqm));
  const householdValues = matrixRows.map((row) => numberValue(row.total_households_official || row.project_stage_total_units_public));

  const rows = matrixRows.map((matrix) => {
    const rank = String(matrix.rank);
    const transport = transportByRank.get(rank) || {};
    const status = statusByRank.get(rank) || {};
    const areaScore = normalized(numberValue(matrix.district_area_sqm_official || matrix.business_layer_area_sqm), areaValues);
    const householdScore = normalized(numberValue(matrix.total_households_official || matrix.project_stage_total_units_public), householdValues);
    const location = Number(transport.location_context_score || 0);
    const stage = stageScore(matrix);
    const scale = scaleSignal(matrix, areaScore, householdScore);
    const driver = externalDriverScore(transport);
    const confidence = confidenceScore(matrix, status);
    const risk = riskSignal(status);
    const longTerm = round(location * 0.32 + stage * 0.18 + scale * 0.18 + driver * 0.22 + confidence * 0.1);
    const researchPriority = round(longTerm * 0.75 + (10 - confidence) * 0.15 + risk * 0.1);
    return {
      rank,
      focus_area: matrix.focus_area,
      district: matrix.district,
      dong: matrix.dong,
      project_name: matrix.project_name,
      current_stage: matrix.current_stage,
      mobility_axis: transport.mobility_axis || "",
      location_score: location,
      stage_score: stage,
      scale_score: scale,
      external_driver_score: driver,
      confidence_score: confidence,
      risk_signal_score: risk,
      long_term_potential_score: longTerm,
      research_priority_score: researchPriority,
      evidence_grade: status.evidence_grade || "",
      p0_tasks: status.p0_tasks || 0,
      source_link_items: status.source_link_items || 0,
      upside_watch: upsideWatch(matrix, transport),
      downside_watch: downsideWatch(matrix, status, transport),
      revisit_trigger: revisitTrigger(matrix, status, transport),
      long_term_thesis: transport.long_term_thesis || "",
      project_note: matrix.project_note,
    };
  });

  rows.sort((a, b) => b.long_term_potential_score - a.long_term_potential_score || Number(a.rank) - Number(b.rank));
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  await writeFile(path.join(OUT_DIR, OUT_MD), markdown(rows));
  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        focusAreas: focusSummary(rows).length,
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
