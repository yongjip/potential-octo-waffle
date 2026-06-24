#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-project-fieldwork-cockpit.md");
const OUT_CSV = path.join(OUT_DIR, "focus-project-fieldwork-cockpit.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-project-fieldwork-cockpit.json");

const INPUTS = {
  focusBoard: "analysis/focus-project-monitoring-board.json",
  fieldworkNotebook: "analysis/fieldwork-observation-notebook.json",
  snapshot: "analysis/current-research-snapshot.json",
  starter: "data/review/fieldwork-observations-core-routes-starter.json",
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
const PROJECT_ALIASES = {
  "5": ["장미1,2,3차"],
  "9": ["잠실우성4차"],
  "10": ["압구정3"],
  "25": ["한양연립"],
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("①", "1")
    .replaceAll("②", "2")
    .replaceAll("③", "3")
    .replaceAll("④", "4")
    .replaceAll("⑤", "5")
    .replace(/\s+/g, "")
    .replace(/[()·,./\-_[\]{}]/g, "")
    .replace(/주택재건축정비사업조합|주택재건축정비사업|재건축정비사업조합|재건축정비사업|가로주택정비사업|조합설립인가|사업시행인가|조합/g, "");
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function compactParts(items, limit = 5) {
  return compact(
    items.flatMap((item) =>
      String(item || "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
    limit,
  );
}

function byRank(rows) {
  return new Map((rows || []).map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function matchSnapshotProject(projectRow, snapshotProjects) {
  const candidates = [projectRow.project_name, ...(PROJECT_ALIASES[String(projectRow.rank)] || [])].map((item) => normalize(item)).filter(Boolean);
  return (snapshotProjects || []).find((row) => {
    const value = normalize(row.name);
    return value && candidates.some((candidate) => value.includes(candidate) || candidate.includes(value));
  });
}

function routeLane(routeName) {
  if (/잠실/.test(routeName || "")) return "잠실/송파 답사";
  if (/압구정/.test(routeName || "")) return "강남 답사";
  if (/강변|광나루/.test(routeName || "")) return "구의/광진 답사";
  return "현장 답사";
}

function statusWeight(status) {
  if (status === "observed_followup_ready") return 70;
  if (status === "observed_needs_interpretation") return 45;
  return 20;
}

function buildRows({ focusRows, fieldworkRows, starterRows, snapshotProjects }) {
  const fieldworkByRank = byRank(fieldworkRows);
  const starterByRank = byRank(starterRows);

  return focusRows
    .map((row) => {
      const fieldwork = fieldworkByRank.get(String(row.rank)) || {};
      const starter = starterByRank.get(String(row.rank)) || {};
      const snapshotProject = matchSnapshotProject(row, snapshotProjects) || {};
      const fieldworkPriorityScore =
        Number(row.monitoring_score || 0) +
        Number(fieldwork.fieldwork_priority || 0) * 0.2 +
        statusWeight(fieldwork.observation_status) +
        (fieldwork.observation_count ? 25 : 0);

      return {
        fieldwork_priority_score: Math.round(fieldworkPriorityScore * 10) / 10,
        lane: routeLane(fieldwork.route_name),
        rank: row.rank,
        project_name: row.project_name,
        life_area: row.life_area,
        route_name: fieldwork.route_name || starter.route_name || "",
        route_segment: starter.route_segment || fieldwork.latest_route_segment || "",
        station_exit_hint: starter.station_exit || "",
        observation_status: fieldwork.observation_status || "ready_to_visit",
        current_stage: row.stage,
        current_read: row.current_read,
        fieldwork_question: snapshotProject.key_question || row.key_question,
        hypothesis_to_test: fieldwork.hypothesis_to_test || "",
        onsite_checks: fieldwork.onsite_checks || "",
        official_before_visit: fieldwork.official_before_visit || "",
        evidence_to_collect: fieldwork.evidence_to_collect || "",
        starter_boundary_condition: starter.boundary_condition || "",
        starter_observed_signal: starter.observed_signal || "",
        latest_observed_signal: fieldwork.latest_observed_signal || "",
        latest_interpretation: fieldwork.latest_interpretation || "",
        latest_confidence_change: fieldwork.latest_confidence_change || "",
        intake_file: fieldwork.intake_file || "data/review/fieldwork-observations.json",
        follow_up_targets: compactParts([starter.follow_up_action, fieldwork.latest_follow_up_action, row.update_targets], 6),
        project_note: fieldwork.project_note || "",
      };
    })
    .sort((a, b) => Number(b.fieldwork_priority_score || 0) - Number(a.fieldwork_priority_score || 0) || Number(a.rank) - Number(b.rank));
}

function summarize(rows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    route_count: new Set(rows.map((row) => row.route_name).filter(Boolean)).size,
    ready_to_visit_count: rows.filter((row) => row.observation_status === "ready_to_visit").length,
    observed_followup_ready_count: rows.filter((row) => row.observation_status === "observed_followup_ready").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# 핵심 4개 사업 현장조사 콕핏

작성 기준: ${summary.generated_at}

이 문서는 강남·잠실/송파·구의/광진 핵심 4개 사업의 현장 답사를 바로 실행하기 위한 보드다. 어떤 루트를 걸을지, 방문 전 어떤 공식자료를 먼저 열지, 현장에서 어떤 질문을 검증할지, 답사 후 어느 파일을 고칠지를 한 화면에 묶는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 핵심 사업 | ${summary.project_count} |
| 핵심 루트 | ${summary.route_count} |
| 방문 대기 | ${summary.ready_to_visit_count} |
| 관찰 후 후속 반영 가능 | ${summary.observed_followup_ready_count} |

## 오늘 걸을 순서

${mdTable(rows, [
    { key: "fieldwork_priority_score", label: "답사점수" },
    { key: "lane", label: "레인" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "route_name", label: "루트" },
    { key: "observation_status", label: "상태" },
    { key: "route_segment", label: "권장 구간" },
  ])}

## 답사 전 체크

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "current_read", label: "현재 해석" },
    { key: "fieldwork_question", label: "생활권 질문" },
    { key: "hypothesis_to_test", label: "현장 가설" },
    { key: "official_before_visit", label: "방문 전 원문" },
  ])}

## 현장 기록 포인트

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "onsite_checks", label: "현장 체크" },
    { key: "evidence_to_collect", label: "수집 근거" },
    { key: "starter_boundary_condition", label: "기본 단절 메모" },
    { key: "starter_observed_signal", label: "기본 관찰 신호" },
  ])}

## 입력 및 후속 반영

${mdTable(rows, [
    { key: "project_name", label: "사업장" },
    { key: "intake_file", label: "입력 파일" },
    { key: "station_exit_hint", label: "출발 힌트" },
    { key: "follow_up_targets", label: "후속 반영 파일" },
    { key: "project_note", label: "사업 메모" },
  ])}

## 운영 메모

- 답사 직전에는 [analysis/fieldwork-quick-capture-template.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/fieldwork-quick-capture-template.md) 또는 \`data/review/fieldwork-observations-core-routes-starter.json\`에서 복사해 시작한다.
- 답사 직후에는 가능하면 \`node scripts/record-fieldwork-observation.mjs --rank=NN --visited-at=YYYY-MM-DD --station-exit='역명 N번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat --write --refresh\`로 기록한다.
- 현장 인상만으로 공식 단계나 수치를 바꾸지 않는다. 현장 관찰은 교통입지와 생활권 체감 해석 보정용이다.
`;
}

async function main() {
  const focusBoard = await readJson(INPUTS.focusBoard);
  const fieldworkNotebook = await readJson(INPUTS.fieldworkNotebook);
  const snapshot = await readJson(INPUTS.snapshot);
  const starter = await readJson(INPUTS.starter);

  const rows = buildRows({
    focusRows: focusBoard.rows || [],
    fieldworkRows: fieldworkNotebook.rows || [],
    starterRows: starter || [],
    snapshotProjects: snapshot.core_projects || [],
  });
  const summary = summarize(rows);
  const payload = { summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(summary, rows));

  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
