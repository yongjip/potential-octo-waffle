#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const REVIEW_DIR = "data/review";
const OUT_MD = path.join(OUT_DIR, "fieldwork-observation-notebook.md");
const OUT_CSV = path.join(OUT_DIR, "fieldwork-observation-notebook.csv");
const OUT_JSON = path.join(OUT_DIR, "fieldwork-observation-notebook.json");
const OUT_README = path.join(REVIEW_DIR, "fieldwork-observations.README.md");
const OUT_EXAMPLES = path.join(REVIEW_DIR, "fieldwork-observation-examples.json");

const FIELDWORK_INPUT = "analysis/fieldwork-route-planner.json";
const OBSERVATIONS_INPUT = "data/review/fieldwork-observations.json";
const VALID_BARRIER_LEVELS = new Set(["", "low", "medium", "high"]);
const VALID_CONFIDENCE_CHANGES = new Set(["", "up", "flat", "down"]);

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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function byRankMulti(rows) {
  return rows.reduce((acc, row) => {
    const key = String(row.rank || "");
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function addIssue(issues, row, severity, field, message, action) {
  issues.push({
    rank: row?.rank || "",
    project_name: row?.project_name || "",
    visited_at: row?.visited_at || "",
    severity,
    field,
    message,
    action,
  });
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isBlankOrNumber(value) {
  const text = String(value ?? "").trim();
  return text === "" || Number.isFinite(Number(text));
}

function validateObservations(observationRows, fieldworkRows) {
  const issues = [];
  const fieldworkByRank = byRank(fieldworkRows);
  for (const row of observationRows) {
    const rank = String(row.rank || "");
    const project = fieldworkByRank.get(rank);
    if (!rank) addIssue(issues, row, "error", "rank", "rank 누락", "fieldwork-route-planner의 rank 입력");
    else if (!project) addIssue(issues, row, "error", "rank", `알 수 없는 rank: ${rank}`, "우선검토 후보 30개 중 하나로 수정");
    if (project && row.project_name && row.project_name !== project.project_name) {
      addIssue(issues, row, "warning", "project_name", "rank와 project_name이 route planner와 다름", "rank 기준 사업명으로 맞춤");
    }
    if (!isDate(row.visited_at)) addIssue(issues, row, "error", "visited_at", "visited_at이 YYYY-MM-DD 형식이 아님", "방문일을 YYYY-MM-DD로 입력");
    if (!String(row.station_exit || "").trim()) addIssue(issues, row, "warning", "station_exit", "출발 역/출구 누락", "역명과 출구 번호 또는 출발 지점을 입력");
    if (!isBlankOrNumber(row.walk_minutes)) addIssue(issues, row, "warning", "walk_minutes", "walk_minutes가 숫자가 아님", "분 단위 숫자만 입력");
    if (!isBlankOrNumber(row.crossing_wait_minutes)) {
      addIssue(issues, row, "warning", "crossing_wait_minutes", "crossing_wait_minutes가 숫자가 아님", "분 단위 숫자만 입력");
    }
    if (!VALID_BARRIER_LEVELS.has(String(row.barrier_level || ""))) {
      addIssue(issues, row, "warning", "barrier_level", `허용되지 않는 barrier_level: ${row.barrier_level}`, "low, medium, high 중 하나로 입력");
    }
    if (!VALID_CONFIDENCE_CHANGES.has(String(row.confidence_change || ""))) {
      addIssue(issues, row, "warning", "confidence_change", `허용되지 않는 confidence_change: ${row.confidence_change}`, "up, flat, down 중 하나로 입력");
    }
    if (!String(row.observed_signal || "").trim()) addIssue(issues, row, "warning", "observed_signal", "관찰 신호 누락", "공식 원문 가설과 비교한 현장 신호 입력");
    if (!String(row.interpretation || "").trim()) addIssue(issues, row, "warning", "interpretation", "해석 누락", "장기 가능성/리스크/교통입지 가설에 미치는 해석 입력");
    if (/[|]/.test(String(row.photo_refs || ""))) {
      addIssue(issues, row, "warning", "photo_refs", "photo_refs에 표 구분자 문자가 있음", "세미콜론으로 여러 경로를 구분");
    }
  }
  return issues;
}

function statusFor(row, observations) {
  if (!observations.length) return "ready_to_visit";
  if (observations.some((item) => item.follow_up_action)) return "observed_followup_ready";
  return "observed_needs_interpretation";
}

function latestObservation(observations) {
  return [...observations].sort((a, b) => String(b.visited_at || "").localeCompare(String(a.visited_at || "")))[0] || {};
}

function buildRows(fieldworkRows, observationRows) {
  const observationsByRank = byRankMulti(observationRows);
  return fieldworkRows
    .map((row) => {
      const observations = observationsByRank[String(row.rank)] || [];
      const latest = latestObservation(observations);
      return {
        rank: row.rank,
        focus_area: row.focus_area,
        route_id: row.route_id,
        route_name: row.route_name,
        stop_order: row.stop_order,
        project_name: row.project_name,
        current_stage: row.current_stage,
        estimated_station_area: row.estimated_station_area,
        primary_lines: row.primary_lines,
        fieldwork_priority: row.fieldwork_priority,
        next_move_track: row.next_move_track,
        source_blockers: row.source_blockers,
        hypothesis_to_test: row.route_question,
        onsite_checks: row.onsite_checks,
        official_before_visit: row.official_before_visit,
        evidence_to_collect: row.evidence_to_collect,
        project_note: row.project_note,
        observation_status: statusFor(row, observations),
        observation_count: observations.length,
        latest_visited_at: latest.visited_at || "",
        latest_route_segment: latest.route_segment || "",
        latest_walk_minutes: latest.walk_minutes || "",
        latest_crossing_wait_minutes: latest.crossing_wait_minutes || "",
        latest_barrier_level: latest.barrier_level || "",
        latest_boundary_condition: latest.boundary_condition || "",
        latest_observed_signal: latest.observed_signal || "",
        latest_interpretation: latest.interpretation || "",
        latest_confidence_change: latest.confidence_change || "",
        latest_follow_up_action: latest.follow_up_action || "",
        intake_file: OBSERVATIONS_INPUT,
      };
    })
    .sort((a, b) => Number(b.fieldwork_priority || 0) - Number(a.fieldwork_priority || 0));
}

function summarize(rows, observations, issues) {
  const routeIds = new Set(rows.map((row) => row.route_id).filter(Boolean));
  const focusAreas = new Set(rows.map((row) => row.focus_area).filter(Boolean));
  return {
    generated_at: `${kstDate()} KST`,
    route_count: routeIds.size,
    focus_area_count: focusAreas.size,
    project_count: rows.length,
    observation_count: observations.length,
    observation_error_count: issues.filter((row) => row.severity === "error").length,
    observation_warning_count: issues.filter((row) => row.severity === "warning").length,
    ready_to_visit_count: rows.filter((row) => row.observation_status === "ready_to_visit").length,
    observed_followup_ready_count: rows.filter((row) => row.observation_status === "observed_followup_ready").length,
    inputs: [FIELDWORK_INPUT, OBSERVATIONS_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON, OUT_README, OUT_EXAMPLES],
  };
}

function routeSummary(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.route_id || row.route_name;
    if (!groups.has(key)) {
      groups.set(key, {
        route_id: row.route_id,
        route_name: row.route_name,
        focus_area: row.focus_area,
        project_count: 0,
        top_project: "",
        top_priority: 0,
        observed: 0,
        first_official_before_visit: row.official_before_visit,
      });
    }
    const group = groups.get(key);
    group.project_count += 1;
    if (Number(row.fieldwork_priority || 0) > Number(group.top_priority || 0)) {
      group.top_priority = row.fieldwork_priority;
      group.top_project = `${row.rank}. ${row.project_name}`;
    }
    if (row.observation_count > 0) group.observed += 1;
  }
  return [...groups.values()].sort((a, b) => Number(b.top_priority || 0) - Number(a.top_priority || 0));
}

function firstRowsByRoute(rows) {
  const routeRows = new Map();
  for (const row of [...rows].sort((a, b) => Number(b.fieldwork_priority || 0) - Number(a.fieldwork_priority || 0))) {
    if (!routeRows.has(row.route_id)) routeRows.set(row.route_id, row);
  }
  return [...routeRows.values()];
}

function exampleForRow(row) {
  return {
    rank: String(row.rank),
    project_name: row.project_name,
    visited_at: "YYYY-MM-DD",
    route_id: row.route_id,
    route_name: row.route_name,
    route_segment: `${row.estimated_station_area || "역"} -> ${row.project_name} 경계`,
    station_exit: "역명 N번 출구",
    walk_minutes: "",
    crossing_wait_minutes: "",
    barrier_level: "low|medium|high",
    bus_transfer_note: "버스/환승 보완 가능성 메모",
    boundary_condition: "대형도로, 하천, 한강, 단지 담장, 상가 경계 등 관찰",
    photo_refs: "data/fieldwork/photos/YYYYMMDD-example.jpg",
    observed_signal: "방문 전 가설과 비교해 현장에서 확인한 신호",
    interpretation: "장기 가능성, 리스크, 교통입지 가설에 미치는 해석",
    confidence_change: "up|flat|down",
    follow_up_action: `project-notes/${String(row.project_note || "").split("/").pop() || "README.md"} 또는 analysis/transport-location-context.md 갱신`,
  };
}

function markdown(summary, rows, issues) {
  const routeRows = routeSummary(rows);
  const priorityRows = rows.slice(0, 15);
  const observedRows = rows.filter((row) => row.observation_count > 0);
  return `# 현장조사 Observation Notebook

작성 기준: ${summary.generated_at}

이 문서는 지하철 답사에서 무엇을 보고 어떤 형식으로 기록할지 정하는 노트북이다. 공식 원문으로 세운 교통·입지 가설을 현장에서 확인하고, 관찰값은 \`${OBSERVATIONS_INPUT}\`에 누적한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 생활권 | ${summary.focus_area_count} |
| 답사 루트 | ${summary.route_count} |
| 사업장 | ${summary.project_count} |
| 입력된 관찰 | ${summary.observation_count} |
| 관찰 입력 오류 | ${summary.observation_error_count} |
| 관찰 입력 경고 | ${summary.observation_warning_count} |
| 방문 대기 | ${summary.ready_to_visit_count} |
| 후속 반영 가능 | ${summary.observed_followup_ready_count} |

## 기록 순서

1. 방문 전 \`official_before_visit\`의 공식자료를 열어 구역계, 단계, 비용·기반시설 쟁점을 확인한다.
2. 현장에서는 역 출구부터 단지 경계까지 실제 보행시간, 횡단 대기, 대형도로/한강/하천 단절, 버스 환승, 출입구 위치를 같은 순서로 기록한다.
3. 가능하면 \`node scripts/record-fieldwork-observation.mjs --rank=NN --visited-at=YYYY-MM-DD --station-exit='역명 N번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat --write --refresh\`로 기록한다.
4. 수동 편집을 썼다면 관찰값을 \`${OBSERVATIONS_INPUT}\`에 추가한 뒤 이 노트북과 관련 실행 보드를 재생성해 \`observed_followup_ready\` 항목을 확인한다.
5. 같은 날 비교할 사업이 2건 이상이면 \`analysis/focus-project-pair-comparison-board.md\`와 \`analysis/focus-project-pair-comparison-starter.md\`를 열어 pair-comparison 메모를 남긴다.
6. 해석이 바뀐 경우 사업별 메모와 \`analysis/transport-location-context.md\`를 갱신한다.

## 루트별 방문 계획

${mdTable(routeRows, [
  { key: "focus_area", label: "생활권" },
  { key: "route_name", label: "루트" },
  { key: "project_count", label: "사업장" },
  { key: "top_project", label: "첫 사업" },
  { key: "top_priority", label: "우선" },
  { key: "observed", label: "기록됨" },
  { key: "first_official_before_visit", label: "방문 전 공식자료" },
])}

## 우선 기록 대상

${mdTable(priorityRows, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "route_name", label: "루트" },
  { key: "project_name", label: "사업" },
  { key: "fieldwork_priority", label: "우선" },
  { key: "observation_status", label: "상태" },
  { key: "onsite_checks", label: "현장 체크" },
  { key: "project_note", label: "메모" },
])}

## 관찰 반영 대기

${mdTable(observedRows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "latest_visited_at", label: "방문일" },
  { key: "latest_observed_signal", label: "관찰 신호" },
  { key: "latest_interpretation", label: "해석" },
  { key: "latest_confidence_change", label: "확신 변화" },
  { key: "latest_follow_up_action", label: "후속" },
])}

## 관찰 입력 검증

${mdTable(issues, [
  { key: "severity", label: "등급" },
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "visited_at", label: "방문일" },
  { key: "field", label: "필드" },
  { key: "message", label: "내용" },
  { key: "action", label: "조치" },
])}

## 같은 날 쌍 비교 후속

- 같은 날 두 사업 관찰이 들어왔는지는 [analysis/focus-project-pair-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-board.md)에서 먼저 확인한다.
- 잠실역-잠실나루 한강축에서 \`잠실우성4차\`와 \`장미1,2,3차\`를 같은 날 걸었으면 \`단계 선행\`과 \`보행/한강 체감\`을 분리해 적는다.
- 압구정 한강변 특별계획구역과 강변-광나루 동서울터미널축을 같은 날 걸었으면 \`상급지 희소성\`과 \`강변 접근 실용성\`을 분리해 적는다.
- pair-comparison 메모는 [analysis/focus-project-pair-comparison-starter.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-starter.md)에서 짧게 적고, 필요하면 \`record-focus-project-pair-comparison\` helper로 intake에 남긴다.

## Intake 필드

| 필드 | 의미 |
| --- | --- |
| rank | 우선검토 후보 순위 |
| visited_at | 방문일 |
| route_segment | 실제 이동 구간 |
| station_exit | 출발 역/출구 |
| walk_minutes | 역 출구에서 단지 경계까지 체감/측정 보행 시간 |
| crossing_wait_minutes | 주요 횡단·신호 대기 시간 |
| barrier_level | low, medium, high 중 하나 |
| bus_transfer_note | 버스/환승 보완 가능성 |
| boundary_condition | 단지 경계, 도로, 하천, 한강 접근 단절 |
| photo_refs | 로컬 사진 경로 또는 파일명 |
| observed_signal | 원문 가설과 비교한 관찰 신호 |
| interpretation | 사업별 장기 가설에 미치는 해석 |
| confidence_change | up, flat, down 중 하나 |
| follow_up_action | 수정할 사업별 메모나 분석 파일 |

주의: 현장 사진과 메모에는 얼굴, 차량번호, 연락처 등 직접 식별 가능한 정보는 남기지 않는다.
`;
}

function readme(summary, examples) {
  return `# Fieldwork Observations Intake

작성 기준: ${summary.generated_at}

\`data/review/fieldwork-observations.json\`은 지하철 답사에서 확인한 보행시간, 횡단 대기, 단절 조건, 현장 신호를 누적하는 수동 입력 파일이다. 생성 스크립트는 실제 observations JSON을 덮어쓰지 않고 읽기만 한다. 이 README와 예시 파일은 \`node scripts/generate-fieldwork-observation-notebook.mjs\` 실행 시 현재 루트 플래너 기준으로 갱신된다.

## 최소 입력 예시

\`\`\`json
${JSON.stringify([examples[0]], null, 2)}
\`\`\`

## 루트별 예시 파일

- \`data/review/fieldwork-observation-examples.json\`: 현재 답사 루트 ${summary.route_count}개에 대한 복사용 예시 행
- \`analysis/fieldwork-observation-notebook.md\`: 입력 후 사업장별 관찰 상태와 후속 반영 대상을 확인하는 노트북
- \`analysis/focus-project-pair-comparison-board.md\`: 같은 날 사업 쌍 비교 준비 상태와 기록된 비교 메모를 보는 보드

## 입력 절차

1. 방문 전 \`analysis/fieldwork-route-planner.md\`에서 루트와 \`방문 전 원문\`을 확인한다.
2. \`data/review/fieldwork-observation-examples.json\`에서 같은 루트 예시를 복사하거나 \`node scripts/record-fieldwork-observation.mjs --help\`로 helper 인자를 확인한다.
3. 가능하면 \`node scripts/record-fieldwork-observation.mjs --rank=NN --visited-at=YYYY-MM-DD --station-exit='역명 N번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat --write --refresh\`로 기록한다.
4. 수동 편집을 썼다면 \`data/review/fieldwork-observations.json\` 배열에 붙이고 \`visited_at\`, \`station_exit\`, \`walk_minutes\`, \`crossing_wait_minutes\`, \`barrier_level\`, \`observed_signal\`, \`interpretation\`을 실제 값으로 바꾼다.
5. 같은 날 두 사업 관찰이 들어왔다면 \`analysis/focus-project-pair-comparison-starter.md\`를 먼저 열고, 필요하면 \`node scripts/record-focus-project-pair-comparison.mjs --pair-id=... --visited-at=YYYY-MM-DD --status=draft --fieldwork-delta='...' --judgment-shift='...' --not-closed-reason='...' --write --refresh\`로 pair-comparison을 기록한다.
6. \`node scripts/generate-fieldwork-observation-notebook.mjs\`, \`node scripts/generate-focus-project-fieldwork-cockpit.mjs\`, \`node scripts/generate-focus-project-pair-comparison-board.mjs\`, \`node scripts/generate-weekly-monitoring-comparison-board.mjs\`, \`node scripts/generate-life-area-monitoring-board.mjs\`를 실행해 \`관찰 입력 검증\`과 후속 실행 보드를 확인한다.
7. 해석이 바뀐 경우 보드의 \`follow_up_action\`에 있는 사업별 메모나 \`analysis/transport-location-context.md\`를 갱신한다.

## 권장 값

- \`barrier_level\`: \`low\`, \`medium\`, \`high\`
- \`confidence_change\`: \`up\`, \`flat\`, \`down\`
- \`photo_refs\`: 얼굴, 차량번호, 연락처 등 직접 식별 가능한 정보가 없는 로컬 파일 경로만 기록한다.
- \`interpretation\`: 투자 결론이 아니라 기존 공식 원문 가설을 유지/보류/재검토할 이유를 적는다.

## 운영 규칙

- 현장 관찰은 공식 고시·인가 원문을 대체하지 않는다.
- 보행시간·횡단 대기·단절 조건은 교통입지 가설과 답사 우선순위를 보정하는 보조 신호다.
- 개인정보가 담긴 사진이나 메모는 intake에 남기지 않는다.
`;
}

async function main() {
  const fieldworkRows = await readJson(FIELDWORK_INPUT, []);
  const observationRows = await readJson(OBSERVATIONS_INPUT, []);
  const rows = buildRows(fieldworkRows, observationRows);
  const issues = validateObservations(observationRows, fieldworkRows);
  const summary = summarize(rows, observationRows, issues);
  const examples = firstRowsByRoute(rows).map(exampleForRow);

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: summary.generated_at, summary, rows, issues, exampleRows: examples }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows, issues));
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(examples, null, 2)}\n`);
  await writeFile(OUT_README, readme(summary, examples));
  console.log(JSON.stringify({ rows: rows.length, observations: observationRows.length, output: "analysis/fieldwork-observation-notebook.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
