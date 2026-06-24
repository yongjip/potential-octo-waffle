#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "fieldwork-route-planner.md");
const OUT_CSV = path.join(OUT_DIR, "fieldwork-route-planner.csv");
const OUT_JSON = path.join(OUT_DIR, "fieldwork-route-planner.json");

const TRANSPORT_INPUT = "analysis/transport-location-context.json";
const NEXT_MOVES_INPUT = "analysis/research-next-moves.json";
const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";

const ROUTES = [
  {
    route_id: "songpa-jamsil-hangang",
    focus_area: "잠실/송파",
    route_name: "잠실역-잠실나루 한강축",
    start_hint: "잠실역 -> 잠실5단지 -> 잠실우성/우성4차 -> 잠실나루/장미 -> 한강 접근부",
    axis_patterns: [/잠실역·종합운동장/, /잠실나루·잠실/],
    route_question: "잠실 MICE·국제교류복합지구 기대가 단지 경계, 한강 접근, 이주기 혼잡 리스크를 이길 수 있는지 본다.",
  },
  {
    route_id: "songpa-seokchon-garak",
    focus_area: "잠실/송파",
    route_name: "석촌-송파-가락 생활축",
    start_hint: "석촌역/송파역 -> 송파동 재건축 -> 가락삼익/가락현대 -> 올림픽공원·문정 방향",
    axis_patterns: [/송파·석촌/, /방이·올림픽공원/, /문정·장지/],
    route_question: "잠실 핵심부 밖의 8·9호선 배후 입지가 재건축 속도와 비용 리스크를 보완하는지 본다.",
  },
  {
    route_id: "songpa-macheon",
    focus_area: "잠실/송파",
    route_name: "마천·거여 재정비축",
    start_hint: "마천역 -> 마천1구역 경계 -> 거여/위례 연결부",
    axis_patterns: [/마천·거여/],
    route_question: "재개발 성격의 권리관계·도로폭·경사·생활편의가 장기 지연 리스크와 어떻게 연결되는지 본다.",
  },
  {
    route_id: "gangnam-apgujeong-hangang",
    focus_area: "강남",
    route_name: "압구정 한강변 특별계획구역",
    start_hint: "압구정역 -> 압구정로 -> 특별계획구역 2/3/4/5 -> 압구정로데오역 -> 한강 접근부",
    axis_patterns: [/압구정 한강변/],
    route_question: "한강변 희소성, 경관/높이 규제, 압구정로 혼잡, 조합별 속도 차이를 같은 루트에서 비교한다.",
  },
  {
    route_id: "gangnam-daechi-gaepo",
    focus_area: "강남",
    route_name: "대치 학군-개포 남부축",
    start_hint: "대치역/학여울역 -> 은마/우성/쌍용 -> 도곡·양재천 -> 대모산입구/개포6·7",
    axis_patterns: [/대치·학여울/, /개포·대모산입구/],
    route_question: "학군 수요, 역 접근 차이, 주변 신축 공급, 사업시행 이후 비용 리스크를 나눠 본다.",
  },
  {
    route_id: "gwangjin-guui-jayang",
    focus_area: "구의/광진",
    route_name: "구의-자양-건대입구 한강축",
    start_hint: "구의역 -> 자양동 정비사업 -> 건대입구역 -> 뚝섬유원지/한강 접근",
    axis_patterns: [/구의·건대입구/],
    route_question: "2·7호선 접근성과 한강 접근성이 소규모정비의 사업성 편차를 얼마나 보완하는지 본다.",
  },
  {
    route_id: "gwangjin-gangbyeon-gwangnaru",
    focus_area: "구의/광진",
    route_name: "강변-광나루 동서울터미널축",
    start_hint: "강변역/동서울터미널 -> 구의동 -> 광나루역 -> 광장동 한강 동부축",
    axis_patterns: [/구의·강변/, /광나루·강변/],
    route_question: "동서울터미널·강변역 변화 가능성과 한강 동부축의 도로 단절/환승 혼잡을 함께 본다.",
  },
  {
    route_id: "gwangjin-junggok",
    focus_area: "구의/광진",
    route_name: "중곡 7호선 생활권",
    start_hint: "중곡역 -> 중곡아파트 -> 내부 도로폭/생활편의 확인",
    axis_patterns: [/중곡 7호선/],
    route_question: "대형 개발 동인보다 생활권 기본 체력과 사업규모 한계를 확인한다.",
  },
];

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

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function routeFor(row) {
  return ROUTES.find((route) => route.focus_area === row.focus_area && route.axis_patterns.some((pattern) => pattern.test(row.mobility_axis || "")));
}

function splitList(text) {
  return String(text || "")
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean))].slice(0, limit).join("; ");
}

function officialBeforeVisit(transport, nextMove) {
  const official = splitList(transport.official_sources_to_check);
  const firstSource = splitList(nextMove.first_source_to_open);
  return compact([...firstSource, ...official], 5);
}

function fieldworkPriority(transport, nextMove, potential) {
  return round(
    Number(transport.location_context_score || 0) * 80 +
      Number(nextMove.move_score || 0) * 0.3 +
      Number(potential.long_term_potential_score || 0) * 35 -
      Number(nextMove.source_blockers || 0) * 8 +
      (nextMove.track === "현장 동선 확인" ? 160 : 0) +
      (nextMove.track === "정책/공공개발 모니터링" ? 80 : 0),
  );
}

function stopOrder(row) {
  const axis = row.mobility_axis || "";
  const station = row.estimated_station_area || "";
  const text = `${axis} ${station}`;
  if (/잠실역|압구정|구의·건대입구|구의·강변/.test(text)) return 1;
  if (/잠실나루|대치|광나루/.test(text)) return 2;
  if (/송파·석촌|개포|중곡/.test(text)) return 3;
  if (/방이|문정|마천/.test(text)) return 4;
  return 5;
}

function buildRows({ transportRows, nextMoveByRank, potentialByRank }) {
  return transportRows
    .map((transport) => {
      const rank = String(transport.rank);
      const nextMove = nextMoveByRank[rank] || {};
      const potential = potentialByRank[rank] || {};
      const route = routeFor(transport);
      const mobilityRisks = splitList(transport.mobility_risks);
      const fieldChecks = splitList(transport.fieldwork_checks);
      return {
        route_id: route?.route_id || "unassigned",
        route_name: route?.route_name || "미분류",
        focus_area: transport.focus_area,
        stop_order: stopOrder(transport),
        rank,
        project_name: transport.project_name,
        current_stage: transport.current_stage,
        estimated_station_area: transport.estimated_station_area,
        mobility_axis: transport.mobility_axis,
        primary_lines: transport.primary_lines,
        fieldwork_priority: fieldworkPriority(transport, nextMove, potential),
        next_move_track: nextMove.track || "",
        source_blockers: nextMove.source_blockers ?? "",
        location_context_score: transport.location_context_score,
        long_term_potential_score: potential.long_term_potential_score ?? "",
        confidence_score: potential.confidence_score ?? "",
        route_question: route?.route_question || "",
        onsite_checks: compact([...fieldChecks, ...mobilityRisks], 6),
        official_before_visit: officialBeforeVisit(transport, nextMove),
        evidence_to_collect: "역 출구 기준 실제 보행; 단지 출입구/경계; 대형도로·한강·하천 단절; 버스 환승; 사진과 시간 메모",
        revisit_trigger: potential.revisit_trigger || "",
        project_note: transport.project_note,
      };
    })
    .sort((a, b) =>
      a.focus_area.localeCompare(b.focus_area) ||
      a.route_id.localeCompare(b.route_id) ||
      a.stop_order - b.stop_order ||
      b.fieldwork_priority - a.fieldwork_priority ||
      Number(a.rank) - Number(b.rank),
    );
}

function routeSummaries(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.route_id]) acc[row.route_id] = [];
    acc[row.route_id].push(row);
    return acc;
  }, {});
  return Object.entries(groups)
    .map(([route_id, stops]) => {
      const route = ROUTES.find((item) => item.route_id === route_id);
      const top = [...stops].sort((a, b) => b.fieldwork_priority - a.fieldwork_priority)[0];
      return {
        route_id,
        focus_area: top.focus_area,
        route_name: top.route_name,
        stop_count: stops.length,
        avg_priority: round(stops.reduce((sum, row) => sum + Number(row.fieldwork_priority || 0), 0) / stops.length),
        start_hint: route?.start_hint || "",
        first_stop: `${top.rank}. ${top.project_name}`,
        route_question: route?.route_question || top.route_question,
      };
    })
    .sort((a, b) => a.focus_area.localeCompare(b.focus_area) || b.avg_priority - a.avg_priority);
}

function focusSummaries(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.focus_area]) acc[row.focus_area] = [];
    acc[row.focus_area].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([focus_area, stops]) => {
    const routes = routeSummaries(stops);
    const top = [...stops].sort((a, b) => b.fieldwork_priority - a.fieldwork_priority)[0];
    return {
      focus_area,
      route_count: new Set(stops.map((row) => row.route_id)).size,
      stop_count: stops.length,
      avg_location: round(stops.reduce((sum, row) => sum + Number(row.location_context_score || 0), 0) / stops.length),
      first_route: routes[0]?.route_name || "",
      first_project: `${top.rank}. ${top.project_name}`,
      first_check: top.onsite_checks,
    };
  });
}

function markdown(rows) {
  const routeRows = routeSummaries(rows);
  const topStops = [...rows].sort((a, b) => b.fieldwork_priority - a.fieldwork_priority || Number(a.rank) - Number(b.rank)).slice(0, 15);
  const byRouteSections = routeRows
    .map((route) => {
      const stops = rows
        .filter((row) => row.route_id === route.route_id)
        .sort((a, b) => a.stop_order - b.stop_order || b.fieldwork_priority - a.fieldwork_priority || Number(a.rank) - Number(b.rank));
      return `### ${route.route_name}

${route.route_question}

출발/동선 힌트: ${route.start_hint}

${mdTable(stops, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업" },
  { key: "estimated_station_area", label: "역/생활권" },
  { key: "primary_lines", label: "노선/수단" },
  { key: "next_move_track", label: "현재 트랙" },
  { key: "onsite_checks", label: "현장 체크" },
  { key: "official_before_visit", label: "방문 전 원문" },
])}`;
    })
    .join("\n\n");

  return `# 지하철 현장 조사 루트 플래너

작성 기준: ${kstDate()} KST

이 문서는 강남·잠실·구의/광진 우선검토 후보를 실제 지하철 답사 루트로 묶은 작업표다. 역세권 점수표가 아니라, 공식 원문으로 세운 가설을 현장에서 확인할 질문과 방문 전 열어볼 자료를 연결한다.

## 생활권별 요약

${mdTable(focusSummaries(rows), [
  { key: "focus_area", label: "생활권" },
  { key: "route_count", label: "루트" },
  { key: "stop_count", label: "정지점" },
  { key: "avg_location", label: "평균 입지맥락" },
  { key: "first_route", label: "첫 루트" },
  { key: "first_project", label: "첫 사업" },
  { key: "first_check", label: "첫 체크" },
])}

## 루트별 요약

${mdTable(routeRows, [
  { key: "focus_area", label: "생활권" },
  { key: "route_name", label: "루트" },
  { key: "stop_count", label: "정지점" },
  { key: "avg_priority", label: "평균 현장우선" },
  { key: "start_hint", label: "출발/동선" },
  { key: "first_stop", label: "먼저 볼 사업" },
  { key: "route_question", label: "핵심 질문" },
])}

## 우선 현장 정지점

${mdTable(topStops, [
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "route_name", label: "루트" },
  { key: "project_name", label: "사업" },
  { key: "fieldwork_priority", label: "현장우선" },
  { key: "mobility_axis", label: "교통축" },
  { key: "onsite_checks", label: "현장 체크" },
  { key: "official_before_visit", label: "방문 전 원문" },
])}

## 루트 상세

${byRouteSections}

## 기록 규칙

1. 출발 전 \`방문 전 원문\`을 열어 구역계, 고시/인가 상태, 비용·기반시설 이슈를 확인한다.
2. 현장에서는 역 출구 기준 실제 보행, 횡단보도 대기, 대형도로/한강/하천 단절, 버스 환승, 단지 출입구를 같은 순서로 기록한다.
3. 사진은 단지 경계, 도로 단절, 역 출구, 공사/이주 안내, 공개 표지판 위주로 남긴다.
4. 현장 메모가 원문 가설과 다르면 사업별 메모의 \`현장 확인\` 항목과 \`analysis/transport-location-context.md\`의 가설을 갱신한다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [transportRows, nextMoveRows, potentialRows] = await Promise.all([
    readJson(TRANSPORT_INPUT),
    readJson(NEXT_MOVES_INPUT),
    readJson(POTENTIAL_INPUT),
  ]);
  const rows = buildRows({
    transportRows,
    nextMoveByRank: byRank(nextMoveRows),
    potentialByRank: byRank(potentialRows),
  });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(JSON.stringify({
    rows: rows.length,
    routes: new Set(rows.map((row) => row.route_id)).size,
    output: "analysis/fieldwork-route-planner.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
