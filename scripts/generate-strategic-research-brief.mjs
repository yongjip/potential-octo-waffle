#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "strategic-research-brief.md");
const OUT_CSV = path.join(OUT_DIR, "strategic-research-brief.csv");
const OUT_JSON = path.join(OUT_DIR, "strategic-research-brief.json");

const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";
const NEXT_MOVES_INPUT = "analysis/research-next-moves.json";
const FIELDWORK_INPUT = "analysis/fieldwork-route-planner.json";
const WATCHLIST_INPUT = "analysis/reassessment-watchlist.json";
const STATUS_INPUT = "analysis/research-status-dashboard.json";
const RISK_INPUT = "analysis/project-risk-signal-summary.json";

const FOCUS_PROFILES = {
  "잠실/송파": {
    thesis:
      "잠실 MICE·국제교류복합지구와 한강축 기대, 관리처분/이주 리스크, 송파 배후 재건축 속도를 분리해 보는 생활권이다.",
    decision_question:
      "잠실 핵심축의 공공개발 기대가 실제 구역계·기반시설·이주기 비용 리스크를 보상하는가.",
    first_principle:
      "잠실5·장미·잠실우성은 공공기여/기반시설과 한강·잠실역 동선을 같이 보고, 가락·송파동은 단계/비용 확정성을 먼저 본다.",
  },
  강남: {
    thesis:
      "압구정 한강변과 대치 학군권은 입지 체력이 이미 강하므로, 추가 상방보다 공공기여·높이·기반시설·분담금 조건이 판단을 가른다.",
    decision_question:
      "상급 입지 프리미엄이 조합별 속도 차이와 비용/공공기여 리스크를 이길 만큼 확실한가.",
    first_principle:
      "압구정은 한강변 조건과 기반시설 비용, 대치는 사업시행 이후 비용·이주 가능성과 학군 수요를 분리한다.",
  },
  "구의/광진": {
    thesis:
      "구의·자양·광장·중곡은 동서울터미널/강변역과 한강 접근 가능성이 있지만, 공식 고시/recordCode 매칭과 사업규모 검증이 선행되어야 한다.",
    decision_question:
      "2·7호선과 한강/터미널 변화 가능성이 소규모정비의 사업성 편차와 원문 불확실성을 보완하는가.",
    first_principle:
      "투자 가설보다 공식 원문 매칭이 먼저다. 삼성1차·자양번영로·한양연립의 고시/인가 원문과 OCR 수치를 우선 확정한다.",
  },
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function groupBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function avg(rows, field) {
  if (!rows.length) return 0;
  return round(rows.reduce((sum, row) => sum + Number(row[field] || 0), 0) / rows.length);
}

function compact(items, limit = 3) {
  return [...new Set(items.filter(Boolean))].slice(0, limit).join("; ");
}

function projectRef(row) {
  return row ? `${row.rank}. ${row.project_name}` : "";
}

function topRefs(rows, field, limit = 3) {
  return rows
    .slice()
    .sort((a, b) => Number(b[field] || 0) - Number(a[field] || 0) || Number(a.rank) - Number(b.rank))
    .slice(0, limit)
    .map(projectRef)
    .join("; ");
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countSummary(rows, field, limit = 4) {
  return Object.entries(countBy(rows, field))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => `${name} ${count}`)
    .join("; ");
}

function buildFocusRows({ potentialRows, nextRows, fieldworkRows, watchRows, statusRows, riskRows }) {
  const nextByRank = byRank(nextRows);
  const fieldByRank = byRank(fieldworkRows);
  const watchByRank = byRank(watchRows);
  const statusByRank = byRank(statusRows);
  const riskByRank = byRank(riskRows);
  const potentialByFocus = groupBy(potentialRows, "focus_area");

  return Object.entries(potentialByFocus)
    .map(([focus_area, potentials]) => {
      const next = potentials.map((row) => nextByRank[String(row.rank)]).filter(Boolean);
      const fieldwork = potentials.map((row) => fieldByRank[String(row.rank)]).filter(Boolean);
      const watch = potentials.map((row) => watchByRank[String(row.rank)]).filter(Boolean);
      const status = potentials.map((row) => statusByRank[String(row.rank)]).filter(Boolean);
      const risks = potentials.map((row) => riskByRank[String(row.rank)]).filter(Boolean);
      const profile = FOCUS_PROFILES[focus_area] || {};
      const topPotential = potentials.slice().sort((a, b) => Number(b.long_term_potential_score || 0) - Number(a.long_term_potential_score || 0))[0];
      const topAction = next.slice().sort((a, b) => Number(b.move_score || 0) - Number(a.move_score || 0))[0];
      const topField = fieldwork.slice().sort((a, b) => Number(b.fieldwork_priority || 0) - Number(a.fieldwork_priority || 0))[0];
      const topWatch = watch.slice().sort((a, b) => Number(a.watch_rank || 999) - Number(b.watch_rank || 999))[0];
      const veryHigh = status.filter((row) => row.risk_signal_level === "very_high").length;
      const high = status.filter((row) => row.risk_signal_level === "high").length;
      const p0 = status.reduce((sum, row) => sum + Number(row.p0_tasks || 0), 0);
      const p1 = status.reduce((sum, row) => sum + Number(row.p1_tasks || 0), 0);
      const blockers = next.reduce((sum, row) => sum + Number(row.source_blockers || 0), 0);
      const topSignal = risks.slice().sort((a, b) => Number(b.top_signal_score || 0) - Number(a.top_signal_score || 0))[0];
      return {
        focus_area,
        project_count: potentials.length,
        strategic_thesis: profile.thesis || "",
        decision_question: profile.decision_question || "",
        first_principle: profile.first_principle || "",
        avg_potential: avg(potentials, "long_term_potential_score"),
        avg_confidence: avg(potentials, "confidence_score"),
        avg_location: avg(potentials, "location_score"),
        risk_mix: `very_high ${veryHigh}; high ${high}`,
        p0_tasks: p0,
        p1_tasks: p1,
        source_blockers: blockers,
        top_potential_projects: topRefs(potentials, "long_term_potential_score", 3),
        first_action_project: projectRef(topAction),
        first_action_track: topAction?.track || "",
        first_action: topAction?.recommended_move || "",
        first_fieldwork_route: topField?.route_name || "",
        first_fieldwork_project: projectRef(topField),
        fieldwork_check: topField?.onsite_checks || "",
        first_watch_project: projectRef(topWatch),
        first_watch_trigger: topWatch?.trigger_type || "",
        update_runbook: topWatch?.runbook_id || "",
        dominant_action_tracks: countSummary(next, "track"),
        dominant_watch_triggers: countSummary(watch, "trigger_type"),
        strongest_public_signal: compact([topSignal?.key_risk_hypothesis, topSignal?.top_public_items], 2),
      };
    })
    .sort((a, b) => b.avg_potential - a.avg_potential || a.focus_area.localeCompare(b.focus_area));
}

function buildGlobalSummary({ potentialRows, nextRows, watchRows }) {
  const byPotential = potentialRows.slice().sort((a, b) => Number(b.long_term_potential_score || 0) - Number(a.long_term_potential_score || 0));
  const byAction = nextRows.slice().sort((a, b) => Number(b.move_score || 0) - Number(a.move_score || 0));
  const lowConfidence = nextRows
    .filter((row) => Number(row.long_term_potential_score || 0) >= 7 && Number(row.confidence_score || 0) < 6.5)
    .sort((a, b) => Number(b.confidence_gap || 0) - Number(a.confidence_gap || 0));
  return {
    top_potential: topRefs(byPotential, "long_term_potential_score", 5),
    first_actions: byAction.slice(0, 5).map((row) => `${row.rank}. ${row.project_name} (${row.track})`).join("; "),
    low_confidence_high_potential: lowConfidence.map((row) => `${row.rank}. ${row.project_name} (격차 ${row.confidence_gap})`).join("; "),
    immediate_watch_count: watchRows.filter((row) => row.watch_level === "immediate").length,
    normal_watch_count: watchRows.filter((row) => row.watch_level === "normal").length,
  };
}

function markdown({ focusRows, globalSummary, topProjects, topActions, topWatch }) {
  return `# 전략 리서치 브리프

작성 기준: ${kstDate()} KST

이 문서는 강남·잠실/송파·구의/광진 리서치의 현재 큰 그림을 한 장으로 읽기 위한 브리프다. 원문 기반 비교표, 장기 가능성 점수카드, 다음 액션 보드, 현장 루트, 재평가 감시표를 종합한다. 투자 추천이 아니라 무엇을 먼저 확인해야 판단력이 올라가는지 정리한 운영 문서다.

## 핵심 판단

- 현재 장기잠재 상위: ${globalSummary.top_potential}
- 지금 먼저 할 작업: ${globalSummary.first_actions}
- 장기 가설은 좋지만 확신도가 낮은 후보: ${globalSummary.low_confidence_high_potential || "현재 상위 격차 후보 없음"}
- 재평가 감시 레벨: immediate ${globalSummary.immediate_watch_count}, normal ${globalSummary.normal_watch_count}

## 생활권별 결론

${mdTable(focusRows, [
  { key: "focus_area", label: "생활권" },
  { key: "avg_potential", label: "평균 잠재" },
  { key: "avg_confidence", label: "평균 확신" },
  { key: "risk_mix", label: "리스크" },
  { key: "source_blockers", label: "원문병목" },
  { key: "top_potential_projects", label: "장기 관찰" },
  { key: "first_action_project", label: "첫 액션" },
  { key: "first_action_track", label: "트랙" },
  { key: "first_fieldwork_route", label: "현장 루트" },
])}

## 생활권별 해석

${focusRows
  .map(
    (row) => `### ${row.focus_area}

${row.strategic_thesis}

- 판단 질문: ${row.decision_question}
- 원칙: ${row.first_principle}
- 먼저 볼 사업: ${row.first_action_project}
- 먼저 할 일: ${row.first_action}
- 현장 확인: ${row.first_fieldwork_route} / ${row.fieldwork_check}
- 재평가 트리거: ${row.first_watch_project} / ${row.first_watch_trigger} / ${row.update_runbook}
- 공개 신호: ${row.strongest_public_signal}
`,
  )
  .join("\n")}

## 상위 장기 관찰 후보

${mdTable(topProjects, [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "long_term_potential_score", label: "장기잠재" },
  { key: "confidence_score", label: "확신도" },
  { key: "upside_watch", label: "상방 신호" },
  { key: "downside_watch", label: "리스크 신호" },
])}

## 이번 액션 후보

${mdTable(topActions, [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "track", label: "트랙" },
  { key: "move_score", label: "액션점수" },
  { key: "source_blockers", label: "원문병목" },
  { key: "recommended_move", label: "이번 액션" },
  { key: "first_source_to_open", label: "먼저 열 자료" },
])}

## 재평가 감시

${mdTable(topWatch, [
  { key: "watch_rank", label: "감시" },
  { key: "watch_level", label: "레벨" },
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "trigger_type", label: "트리거" },
  { key: "runbook_id", label: "런북" },
  { key: "reassessment_reason", label: "재평가 이유" },
])}

## 사용법

1. 큰 방향은 \`생활권별 결론\`에서 잡는다.
2. 오늘 처리할 일은 \`이번 액션 후보\`에서 고른다.
3. 답사 전에는 \`fieldwork-route-planner.md\`의 루트와 방문 전 원문을 연다.
4. 새 고시·공개항목·정책 신호가 나오면 \`reassessment-watchlist.md\`의 런북을 실행한다.
5. 판단을 바꿀 때는 사업별 메모, 핵심 수치 장부, 장기 가능성 점수카드를 같이 갱신한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [potentialRows, nextRows, fieldworkRows, watchRows, statusRows, riskRows] = await Promise.all([
    readJson(POTENTIAL_INPUT),
    readJson(NEXT_MOVES_INPUT),
    readJson(FIELDWORK_INPUT),
    readJson(WATCHLIST_INPUT),
    readJson(STATUS_INPUT),
    readJson(RISK_INPUT),
  ]);
  const focusRows = buildFocusRows({ potentialRows, nextRows, fieldworkRows, watchRows, statusRows, riskRows });
  const globalSummary = buildGlobalSummary({ potentialRows, nextRows, watchRows });
  const topProjects = potentialRows
    .slice()
    .sort((a, b) => Number(b.long_term_potential_score || 0) - Number(a.long_term_potential_score || 0) || Number(a.rank) - Number(b.rank))
    .slice(0, 10);
  const topActions = nextRows
    .slice()
    .sort((a, b) => Number(b.move_score || 0) - Number(a.move_score || 0) || Number(a.rank) - Number(b.rank))
    .slice(0, 10);
  const topWatch = watchRows.slice(0, 10);

  const output = {
    generated_at: `${kstDate()} KST`,
    global_summary: globalSummary,
    focus_rows: focusRows,
    top_projects: topProjects,
    top_actions: topActions,
    top_watch: topWatch,
  };
  await writeFile(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(focusRows), "utf8");
  await writeFile(OUT_MD, markdown({ focusRows, globalSummary, topProjects, topActions, topWatch }), "utf8");
  console.log(JSON.stringify({
    focus_areas: focusRows.length,
    top_projects: topProjects.length,
    top_actions: topActions.length,
    immediate_watch: globalSummary.immediate_watch_count,
    output: "analysis/strategic-research-brief.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
