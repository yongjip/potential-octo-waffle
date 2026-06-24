#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "focus-project-monitoring-board.md");
const OUT_CSV = path.join(OUT_DIR, "focus-project-monitoring-board.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-project-monitoring-board.json");

const INPUTS = {
  registry: "analysis/focus-project-monitoring-registry.json",
  snapshot: "analysis/current-research-snapshot.json",
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
  jmapt1: ["장미1,2,3차"],
  Tw2w7Iwv: ["잠실우성4차"],
  apgujeong3: ["압구정3"],
  hanyanggaro: ["한양연립"],
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
    .replaceAll("⑥", "6")
    .replaceAll("⑦", "7")
    .replaceAll("⑧", "8")
    .replaceAll("⑨", "9")
    .replaceAll("⑩", "10")
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

function firstPresentUrls(urls, limit = 3) {
  return Object.entries(urls || {})
    .filter(([, value]) => value)
    .slice(0, limit)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

function matchByName(targetNames, rows, field = "name") {
  const targets = [...new Set([targetNames].flat().map((item) => normalize(item)).filter(Boolean))];
  return rows.find((row) => {
    const value = normalize(row[field]);
    return value && targets.some((target) => value.includes(target) || target.includes(value));
  });
}

function riskWeight(level) {
  if (level === "very_high") return 35;
  if (level === "high") return 24;
  if (level === "medium") return 12;
  return 0;
}

function dependencyWeight(level) {
  if (level === "high") return 90;
  if (level === "medium") return 55;
  if (level === "low") return 20;
  return 0;
}

function trackWeight(track) {
  if (/공식 회신/.test(track || "")) return 65;
  if (/원문 검증/.test(track || "")) return 50;
  if (/비용\/기반시설/.test(track || "")) return 38;
  return 20;
}

function externalWaitLabel(waitRow) {
  if (!waitRow) return "";
  return `${waitRow.pending_item} (${waitRow.impact})`;
}

function buildRows(registryProjects, snapshot) {
  const lifeAreaMap = new Map((snapshot.life_areas || []).map((row) => [row.name, row]));

  return registryProjects
    .map((project) => {
      const candidates = [project.name, ...(PROJECT_ALIASES[project.slug] || [])];
      const snapshotProject = matchByName(candidates, snapshot.core_projects || [], "name") || {};
      const externalWait = matchByName(candidates, snapshot.external_waits || [], "project");
      const lifeArea = lifeAreaMap.get(project.life_area) || {};
      const filledUrlCount = Object.values(project.official_urls || {}).filter(Boolean).length;
      const totalUrlCount = Object.keys(project.official_urls || {}).length;
      const missingUrlCount = totalUrlCount - filledUrlCount;
      const monitoringScore =
        dependencyWeight(project.external_dependency) +
        trackWeight(project.track) +
        riskWeight(snapshotProject.risk_level) +
        Number(snapshotProject.long_term_potential || 0) * 6 +
        Number(snapshotProject.confidence || 0) * 3 +
        (externalWait ? 80 : 0) +
        Math.max(0, 30 - Number(project.rank || 30)) +
        missingUrlCount * 4;

      return {
        rank: Number(project.rank || 0),
        project_name: project.name,
        life_area: project.life_area,
        district: project.district,
        stage: project.stage,
        monitoring_track: project.track,
        monitoring_score: Math.round(monitoringScore * 10) / 10,
        long_term_potential: snapshotProject.long_term_potential ?? "",
        confidence: snapshotProject.confidence ?? "",
        risk_level: snapshotProject.risk_level || "",
        official_evidence_status: lifeArea.official_evidence_status || "",
        external_dependency: project.external_dependency,
        external_wait_status: externalWait ? "waiting" : "none",
        external_wait_item: externalWaitLabel(externalWait),
        url_coverage: `${filledUrlCount}/${totalUrlCount}`,
        first_official_urls: firstPresentUrls(project.official_urls, 3),
        current_read: snapshotProject.current_read || project.core_read,
        next_action: snapshotProject.next_action || lifeArea.next_action || "",
        key_question: lifeArea.key_question || "",
        known_gaps: compact(project.known_gaps, 4),
        change_signals: compact(project.change_signals, 3),
        noise_only_signals: compact(project.noise_only_signals, 2),
        update_targets: compact(project.update_targets, 5),
      };
    })
    .sort((a, b) => Number(b.monitoring_score || 0) - Number(a.monitoring_score || 0) || a.rank - b.rank);
}

function summarize(rows, commonRules) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    waiting_external_response_count: rows.filter((row) => row.external_wait_status === "waiting").length,
    high_dependency_count: rows.filter((row) => row.external_dependency === "high").length,
    average_confidence: rows.length ? Math.round((rows.reduce((acc, row) => acc + Number(row.confidence || 0), 0) / rows.length) * 10) / 10 : 0,
    top_project: rows[0]?.project_name || "",
    common_rules: commonRules,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const priorityFields = [
    { key: "monitoring_score", label: "점검점수" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "life_area", label: "생활권" },
    { key: "stage", label: "단계" },
    { key: "monitoring_track", label: "트랙" },
    { key: "external_wait_status", label: "외부대기" },
    { key: "known_gaps", label: "남은 공백" },
  ];

  const detailFields = [
    { key: "project_name", label: "사업장" },
    { key: "current_read", label: "현재 해석" },
    { key: "next_action", label: "다음 액션" },
    { key: "change_signals", label: "업데이트 신호" },
    { key: "update_targets", label: "반영 파일" },
  ];

  const perProject = rows
    .map(
      (row) => `### ${row.rank}. ${row.project_name}

- 생활권/구: ${row.life_area} / ${row.district}
- 단계/트랙: ${row.stage} / ${row.monitoring_track}
- 점검점수: ${row.monitoring_score}
- 장기잠재/확신/리스크: ${row.long_term_potential || "-"} / ${row.confidence || "-"} / ${row.risk_level || "-"}
- 공식 근거 상태: ${row.official_evidence_status || "-"}
- 외부 회신 대기: ${row.external_wait_item || "없음"}
- URL 커버리지: ${row.url_coverage}
- 먼저 열 URL: ${row.first_official_urls || "없음"}
- 현재 해석: ${row.current_read}
- 다음 액션: ${row.next_action}
- 변화로 볼 신호: ${row.change_signals}
- 무시할 신호: ${row.noise_only_signals || "없음"}
- 반영 파일: ${row.update_targets}
`,
    )
    .join("\n");

  return `# 핵심 4개 사업 모니터링 보드

작성 기준: ${summary.generated_at}

이 문서는 강남·잠실/송파·구의/광진 핵심 4개 사업을 매주 또는 이벤트 발생 시 어떤 순서로 다시 볼지 고정하는 보드다. 투자 추천이 아니라 공식 원문, 외부 회신, 현장 체크 우선순위를 유지하는 용도다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 사업장 | ${summary.project_count} |
| 외부 회신 대기 | ${summary.waiting_external_response_count} |
| 외부 의존 high | ${summary.high_dependency_count} |
| 평균 확신도 | ${summary.average_confidence} |

## 우선순위

${mdTable(rows, priorityFields)}

## 세부 체크

${mdTable(rows, detailFields)}

## 프로젝트별 체크카드

${perProject}
## 공통 판정 규칙

${summary.common_rules.map((rule) => `- ${rule}`).join("\n")}
`;
}

async function main() {
  const registry = await readJson(INPUTS.registry);
  const snapshot = await readJson(INPUTS.snapshot);
  const rows = buildRows(registry.projects || [], snapshot);
  const summary = summarize(rows, registry.common_rules || []);
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
