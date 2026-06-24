#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-hypothesis-ledger.md");
const OUT_CSV = path.join(OUT_DIR, "research-hypothesis-ledger.csv");
const OUT_JSON = path.join(OUT_DIR, "research-hypothesis-ledger.json");

const INPUTS = {
  potential: "analysis/long-term-potential-scorecard.json",
  catalysts: "analysis/public-development-catalyst-map.json",
  risk: "analysis/project-risk-signal-summary.json",
  reassessment: "analysis/reassessment-watchlist.json",
  deepDive: "analysis/focus-deep-dive-queue.json",
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

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function compact(items, limit = 3) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function sourceBlockerCount(row) {
  const direct = Number(row.source_blockers || 0);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const p0 = Number(row.p0_tasks || 0);
  const sourceLinks = Number(row.source_link_items || 0);
  return p0 + sourceLinks;
}

function statusFor({ potential, risk, reassessment, deepDive }) {
  const blockers = sourceBlockerCount(deepDive) || sourceBlockerCount(reassessment) || sourceBlockerCount(potential);
  const confidence = Number(potential.confidence_score || deepDive.confidence_score || 0);
  const watch = reassessment.watch_level || "";
  const riskLevel = risk.risk_signal_level || deepDive.risk_signal_level || "";
  if (blockers >= 4 || confidence < 5 || /원문확정/.test(deepDive.deep_dive_track || "")) return "source_blocked_hypothesis";
  if (["immediate", "high"].includes(watch) || ["very_high", "high"].includes(riskLevel)) return "active_watch_hypothesis";
  if (Number(potential.long_term_potential_score || 0) >= 7.5) return "priority_tracking_hypothesis";
  return "tracking_hypothesis";
}

function statusLabel(status) {
  return {
    source_blocked_hypothesis: "원문 병목 가설",
    active_watch_hypothesis: "즉시 감시 가설",
    priority_tracking_hypothesis: "우선 추적 가설",
    tracking_hypothesis: "정기 추적 가설",
  }[status] || status;
}

function promotionCondition(row) {
  const items = [];
  if (row.source_blockers > 0 || row.hypothesis_status === "source_blocked_hypothesis") {
    items.push("고시번호·고시일·원문 URL·핵심 수치가 공식 원문 또는 공식 회신으로 확인");
  }
  if (/비용|기반시설|분담금|공공기여/.test(`${row.risk_hypothesis} ${row.downside_watch} ${row.catalyst_documents}`)) {
    items.push("공사비·분담금·기반시설·공공기여 조건이 공개항목이나 별첨 원문으로 대조");
  }
  if (/현장|교통|보행|한강|환승|단절/.test(`${row.deep_dive_track} ${row.deep_dive_question} ${row.downside_watch}`)) {
    items.push("역 접근·보행 단절·간선도로 횡단·환승 혼잡이 현장 관찰값으로 확인");
  }
  if (row.catalysts) {
    items.push("공공 개발 촉매가 보도자료가 아니라 계획·고시·교통대책 원문으로 연결");
  }
  if (!items.length) items.push("공식 단계 상승 또는 공개자료 증가가 사업별 메모와 비교표에 반영");
  return compact(items, 3);
}

function falsificationCondition(row) {
  const items = [];
  if (row.source_blockers > 0 || row.hypothesis_status === "source_blocked_hypothesis") {
    items.push("원문 확보 후 면적·세대수·인가일·고시번호가 현재 요약값과 충돌");
  }
  if (row.catalysts) {
    items.push("관련 공공계획이 지연·축소되거나 사업장 경계와 직접 연결되지 않음");
  }
  if (/비용|분담금|공사비|기반시설|공공기여/.test(`${row.risk_hypothesis} ${row.downside_watch}`)) {
    items.push("비용·분담금·기반시설 부담이 장기 잠재력보다 빠르게 악화");
  }
  if (/현장|교통|보행|한강|환승|단절/.test(`${row.deep_dive_track} ${row.deep_dive_question} ${row.downside_watch}`)) {
    items.push("현장 답사에서 역 접근성·보행환경·한강 접근 프리미엄이 약하게 확인");
  }
  if (!items.length) items.push("단계 정체, 공개자료 감소, 공식 수치 충돌이 누적");
  return compact(items, 3);
}

function decisionRule(row) {
  if (row.hypothesis_status === "source_blocked_hypothesis") {
    return "원문 또는 공식 회신 전에는 확정 가설로 승격하지 않고, 확인 후 점수·메모·클로저 장부를 함께 갱신한다.";
  }
  if (row.risk_signal_level === "very_high" || row.risk_signal_level === "high") {
    return "리스크 원문을 먼저 닫고, 비용·기반시설·일정 리스크가 해소될 때만 장기 관찰 등급을 유지한다.";
  }
  if (Number(row.long_term_potential_score || 0) >= 7.5) {
    return "공식 단계 상승, 촉매 원문, 현장 관찰 중 2개 이상이 같은 방향이면 우선 딥다이브로 유지한다.";
  }
  return "새 고시, 공개자료 증가, 시장 신호 변화가 없으면 정기 추적으로 유지한다.";
}

function hypothesisText(row) {
  const base = row.long_term_thesis || "";
  const catalysts = row.catalysts ? ` 공공 촉매는 ${row.catalysts}를 확인한다.` : "";
  const risk = row.risk_hypothesis ? ` 핵심 리스크는 ${row.risk_hypothesis}` : "";
  return `${base}${catalysts}${risk}`.trim();
}

function buildRows({ potentialRows, catalystByRank, riskByRank, reassessmentByRank, deepDiveByRank }) {
  return potentialRows
    .map((potential) => {
      const rank = String(potential.rank);
      const catalysts = [...(catalystByRank.get(rank) || [])].sort((a, b) => Number(b.catalyst_priority_score || 0) - Number(a.catalyst_priority_score || 0));
      const risk = riskByRank.get(rank) || {};
      const reassessment = reassessmentByRank.get(rank) || {};
      const deepDive = deepDiveByRank.get(rank) || {};
      const status = statusFor({ potential, risk, reassessment, deepDive });
      const row = {
        rank,
        focus_area: potential.focus_area,
        district: potential.district,
        dong: potential.dong,
        project_name: potential.project_name,
        current_stage: potential.current_stage,
        project_note: potential.project_note || deepDive.project_note || "",
        hypothesis_status: status,
        hypothesis_status_label: statusLabel(status),
        long_term_potential_score: potential.long_term_potential_score,
        confidence_score: potential.confidence_score,
        evidence_grade: potential.evidence_grade,
        source_blockers: sourceBlockerCount(deepDive) || sourceBlockerCount(reassessment) || sourceBlockerCount(potential),
        risk_signal_level: risk.risk_signal_level || deepDive.risk_signal_level || "",
        watch_level: reassessment.watch_level || "",
        trigger_type: reassessment.trigger_type || "",
        deep_dive_track: deepDive.deep_dive_track || "",
        hypothesis: "",
        upside_watch: potential.upside_watch || deepDive.upside_watch || "",
        downside_watch: potential.downside_watch || deepDive.downside_watch || "",
        risk_hypothesis: risk.key_risk_hypothesis || deepDive.risk_hypothesis || "",
        catalysts: compact(catalysts.map((item) => item.catalyst_name), 3),
        catalyst_documents: compact(catalysts.map((item) => item.official_documents_to_check), 3),
        first_source_to_open: deepDive.first_source_to_open || "",
        recommended_move: deepDive.recommended_move || reassessment.next_action || "",
        deep_dive_question: deepDive.deep_dive_question || "",
        reassessment_reason: reassessment.reassessment_reason || potential.revisit_trigger || "",
        reassessment_trigger: reassessment.runbook_trigger || potential.revisit_trigger || "",
        update_sources: reassessment.update_sources || "",
        check_cadence: reassessment.check_cadence || "",
        runbook_id: reassessment.runbook_id || "",
        promotion_conditions: "",
        falsification_conditions: "",
        decision_rule: "",
      };
      row.hypothesis = hypothesisText({ ...row, long_term_thesis: potential.long_term_thesis });
      row.promotion_conditions = promotionCondition(row);
      row.falsification_conditions = falsificationCondition(row);
      row.decision_rule = decisionRule(row);
      return row;
    })
    .sort(
      (a, b) =>
        Number(b.source_blockers || 0) - Number(a.source_blockers || 0) ||
        Number(b.long_term_potential_score || 0) - Number(a.long_term_potential_score || 0) ||
        Number(a.rank) - Number(b.rank),
    );
}

function summarize(rows) {
  const countBy = (field) =>
    Object.entries(
      rows.reduce((acc, row) => {
        const key = row[field] || "미분류";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `${key} ${count}`)
      .join("; ");
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    focus_area_count: new Set(rows.map((row) => row.focus_area)).size,
    source_blocked_count: rows.filter((row) => row.hypothesis_status === "source_blocked_hypothesis").length,
    active_watch_count: rows.filter((row) => row.hypothesis_status === "active_watch_hypothesis").length,
    priority_tracking_count: rows.filter((row) => row.hypothesis_status === "priority_tracking_hypothesis").length,
    tracking_count: rows.filter((row) => row.hypothesis_status === "tracking_hypothesis").length,
    avg_potential: round(rows.reduce((sum, row) => sum + Number(row.long_term_potential_score || 0), 0) / rows.length),
    avg_confidence: round(rows.reduce((sum, row) => sum + Number(row.confidence_score || 0), 0) / rows.length),
    status_mix: countBy("hypothesis_status_label"),
    focus_mix: countBy("focus_area"),
    watch_mix: countBy("watch_level"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function focusSummary(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const list = grouped.get(row.focus_area) || [];
    list.push(row);
    grouped.set(row.focus_area, list);
  }
  return [...grouped.entries()]
    .map(([focus_area, items]) => {
      const top = [...items].sort((a, b) => Number(b.long_term_potential_score || 0) - Number(a.long_term_potential_score || 0))[0];
      return {
        focus_area,
        project_count: items.length,
        source_blocked_count: items.filter((row) => row.hypothesis_status === "source_blocked_hypothesis").length,
        avg_potential: round(items.reduce((sum, row) => sum + Number(row.long_term_potential_score || 0), 0) / items.length),
        avg_confidence: round(items.reduce((sum, row) => sum + Number(row.confidence_score || 0), 0) / items.length),
        representative_project: `${top.rank}. ${top.project_name}`,
        representative_hypothesis: top.hypothesis,
        next_decision: top.decision_rule,
      };
    })
    .sort((a, b) => b.source_blocked_count - a.source_blocked_count || b.avg_potential - a.avg_potential);
}

function markdown(summary, focusRows, rows) {
  const topFields = [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "hypothesis_status_label", label: "상태" },
    { key: "long_term_potential_score", label: "잠재" },
    { key: "confidence_score", label: "확신" },
    { key: "source_blockers", label: "원문병목" },
    { key: "risk_signal_level", label: "리스크" },
    { key: "first_source_to_open", label: "먼저 열 원문" },
  ];
  const topRows = [...rows]
    .sort(
      (a, b) =>
        Number(b.source_blockers || 0) - Number(a.source_blockers || 0) ||
        Number(b.long_term_potential_score || 0) - Number(a.long_term_potential_score || 0),
    )
    .slice(0, 15);
  const blockedRows = rows.filter((row) => row.hypothesis_status === "source_blocked_hypothesis");

  return `# 사업별 리서치 가설 장부

작성 기준: ${UPDATED_AT}

이 문서는 강남·잠실/송파·구의/광진 후보 30개를 "가설-검증-반증" 단위로 관리한다. 장기 가능성 점수, 공공 개발 촉매, 리스크 신호, 딥다이브 질문, 재평가 런북을 한 행으로 합쳐서 어떤 자료가 들어오면 가설을 올리거나 내려야 하는지 고정한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| 생활권 | ${summary.focus_area_count} |
| 원문 병목 가설 | ${summary.source_blocked_count} |
| 즉시 감시 가설 | ${summary.active_watch_count} |
| 우선 추적 가설 | ${summary.priority_tracking_count} |
| 정기 추적 가설 | ${summary.tracking_count} |
| 평균 장기잠재 | ${summary.avg_potential} |
| 평균 확신도 | ${summary.avg_confidence} |

## 상태 분포

| 구분 | 값 |
| --- | --- |
| 가설 상태 | ${summary.status_mix} |
| 생활권 | ${summary.focus_mix} |
| 감시 강도 | ${summary.watch_mix} |

## 생활권별 대표 가설

${mdTable(focusRows, [
    { key: "focus_area", label: "생활권" },
    { key: "project_count", label: "사업장" },
    { key: "source_blocked_count", label: "원문병목" },
    { key: "avg_potential", label: "평균잠재" },
    { key: "avg_confidence", label: "평균확신" },
    { key: "representative_project", label: "대표 사업" },
    { key: "next_decision", label: "판정 규칙" },
  ])}

## 우선 검증 가설 Top 15

${mdTable(topRows, topFields)}

## 원문 병목 가설

${mdTable(blockedRows, [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "source_blockers", label: "원문병목" },
    { key: "first_source_to_open", label: "먼저 열 원문" },
    { key: "promotion_conditions", label: "승격 조건" },
    { key: "falsification_conditions", label: "반증 조건" },
  ])}

## 전체 가설 장부

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "hypothesis_status_label", label: "상태" },
    { key: "hypothesis", label: "리서치 가설" },
    { key: "promotion_conditions", label: "승격 조건" },
    { key: "falsification_conditions", label: "반증 조건" },
    { key: "reassessment_trigger", label: "재평가 트리거" },
    { key: "decision_rule", label: "판정 규칙" },
  ])}

## 해석 원칙

- 이 장부는 투자 추천이 아니라 공식 원문과 현장 확인을 연결하는 리서치 가설 관리표다.
- 원문 병목 가설은 고시번호, 고시일, 원문 URL, 별첨, 핵심 수치가 닫히기 전까지 확정 가설로 승격하지 않는다.
- 공공 개발 촉매는 보도자료만으로 승격하지 않고 도시계획, 고시, 교통대책, 정보공개 회신으로 확인한다.
- 시장 거래 신호는 반응 확인용 보조지표이며 사업 단계나 권리관계 확정 근거로 쓰지 않는다.
`;
}

async function main() {
  const [potentialData, catalystData, riskData, reassessmentData, deepDiveData] = await Promise.all([
    readJson(INPUTS.potential),
    readJson(INPUTS.catalysts),
    readJson(INPUTS.risk),
    readJson(INPUTS.reassessment),
    readJson(INPUTS.deepDive),
  ]);
  const rows = buildRows({
    potentialRows: rowsFrom(potentialData),
    catalystByRank: groupByRank(rowsFrom(catalystData)),
    riskByRank: byRank(rowsFrom(riskData)),
    reassessmentByRank: byRank(rowsFrom(reassessmentData)),
    deepDiveByRank: byRank(rowsFrom(deepDiveData)),
  });
  const summary = summarize(rows);
  const focusRows = focusSummary(rows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, focus_rows: focusRows, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, focusRows, rows));
  console.log(JSON.stringify({ rows: rows.length, sourceBlocked: summary.source_blocked_count, output: "analysis/research-hypothesis-ledger.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
