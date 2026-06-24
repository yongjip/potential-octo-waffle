#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "weekly-monitoring-history.md");
const OUT_CSV = path.join(OUT_DIR, "weekly-monitoring-history.csv");
const OUT_JSON = path.join(OUT_DIR, "weekly-monitoring-history.json");
const LOG_PREFIX = "weekly-monitoring-log-";
const LOG_SUFFIX = ".md";

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

function compact(value, limit = 180) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function unique(items) {
  return [...new Set(items.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

async function readLogs() {
  const files = (await readdir(OUT_DIR))
    .filter((file) => file.startsWith(LOG_PREFIX) && file.endsWith(LOG_SUFFIX))
    .sort();
  const logs = [];
  for (const file of files) {
    const fullPath = path.join(OUT_DIR, file);
    const body = await readFile(fullPath, "utf8");
    logs.push({
      file: fullPath,
      date: file.slice(LOG_PREFIX.length, -LOG_SUFFIX.length),
      body,
    });
  }
  return logs;
}

function splitSections(markdown) {
  const lines = String(markdown || "").split("\n");
  const sections = new Map();
  let current = "__root__";
  sections.set(current, []);
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1].trim();
      if (!sections.has(current)) sections.set(current, []);
      continue;
    }
    sections.get(current).push(line);
  }
  return sections;
}

function sectionBody(sections, titles) {
  for (const title of titles) {
    if (sections.has(title)) return sections.get(title).join("\n").trim();
  }
  return "";
}

function parseTable(sectionText) {
  const lines = String(sectionText || "").split("\n");
  const start = lines.findIndex((line) => /^\|/.test(line.trim()));
  if (start < 0) return [];
  const tableLines = [];
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith("|")) break;
    tableLines.push(line);
  }
  if (tableLines.length < 2) return [];
  const parseCells = (line) => line.split("|").slice(1, -1).map((cell) => cell.trim());
  const headers = parseCells(tableLines[0]);
  const bodyLines = tableLines.slice(2).filter((line) => !/^\|\s*-/.test(line));
  return bodyLines.map((line) => {
    const cells = parseCells(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function parseKeyValueTable(rows) {
  return Object.fromEntries(rows.map((row) => [row["항목"], row["기록"]]));
}

function parseBullets(sectionText) {
  return String(sectionText || "")
    .split("\n")
    .map((line) => line.match(/^-+\s*([^:]+):\s*(.*)$/))
    .filter(Boolean)
    .map((match) => ({
      key: match[1].trim(),
      value: match[2].trim(),
    }));
}

function parseOrderedList(sectionText) {
  return String(sectionText || "")
    .split("\n")
    .map((line) => line.match(/^\d+\.\s+(.*)$/))
    .filter(Boolean)
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function parseCodeBlock(sectionText) {
  const match = String(sectionText || "").match(/```(?:bash)?\n([\s\S]*?)```/);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function splitMultiValue(value) {
  return unique(String(value || "").split(";").map((item) => item.trim()));
}

function asNumber(value, fallback = 0) {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseLog(log) {
  const sections = splitSections(log.body);
  const rootText = sectionBody(sections, ["__root__"]);
  const headerMap = parseKeyValueTable(parseTable(sectionBody(sections, ["주간 점검 헤더"])));
  const sourceRows = parseTable(sectionBody(sections, ["1차 공식 출처 점검"])).map((row) => ({
    source: row["출처"] || "",
    checked: row["확인 여부"] || "",
    changed: row["변화 유무"] || "",
    memo: row["핵심 메모"] || "",
  }));
  const changeRows = parseTable(sectionBody(sections, ["핵심 변화 로그", "이번 주 핵심 변화"])).map((row) => ({
    project_or_area: row["사업/생활권"] || "",
    change_type: row["변화 유형"] || "",
    official_source: row["공식 출처"] || "",
    confirmed_value: row["확인값"] || "",
    impact: row["영향도"] || "",
    updated_files: row["바로 수정한 파일"] || "",
  }));
  const lifeRows = parseTable(sectionBody(sections, ["생활권별 요약", "생활권별 기준 상태"])).map((row) => ({
    life_area: row["생활권"] || "",
    weekly_change: row["이번 주 변화"] || "",
    interpretation: row["해석"] || "",
    next_action: row["다음 행동"] || "",
  }));
  const expansionRows = parseTable(sectionBody(sections, ["확장 관심권 요약"])).map((row) => ({
    zone_name: row["확장권"] || "",
    weekly_change: row["이번 주 변화"] || "",
    interpretation: row["해석"] || "",
    next_action: row["다음 행동"] || "",
  }));
  const externalRows = parseTable(sectionBody(sections, ["외부 회신 대기 3건 상태"])).map((row) => ({
    project_name: row["사업"] || "",
    last_status: row["지난주 상태"] || "",
    current_status: row["이번 주 상태"] || "",
    action: row["조치"] || "",
  }));
  const conclusionBullets = Object.fromEntries(parseBullets(sectionBody(sections, ["이번 주 결론"])).map((row) => [row.key, row.value]));
  const nextPriorities = parseOrderedList(sectionBody(sections, ["다음 주 우선 확인 대상"]));
  const noteBullets = String(sectionBody(sections, ["메모"]))
    .split("\n")
    .map((line) => line.match(/^-+\s+(.*)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());
  const commandRows = parseCodeBlock(sectionBody(sections, ["실행 명령 기록"]));
  const introText = rootText.replace(/^#.*$/gm, "").trim();

  const filteredChangeRows = changeRows.filter((row) => row.project_or_area && row.project_or_area !== "이번 주 기록 없음");
  const currentStatuses = externalRows.map((row) => row.current_status);
  const waitingCount = currentStatuses.filter((value) => /waiting|no_response|filed_waiting_response/i.test(value)).length;

  return {
    log_date: log.date,
    week_label: headerMap["점검 주간"] || "",
    checked_date: headerMap["점검일"] || log.date,
    operator: headerMap["점검자"] || "",
    runbook: headerMap["실행 런북"] || "",
    remote_run: headerMap["원격 수집 실행 여부"] || "",
    regenerated: headerMap["산출물 재생성 여부"] || "",
    change_count: asNumber(headerMap["이번 주 핵심 변화 수"], filteredChangeRows.length || 0),
    source_checked_count: sourceRows.filter((row) => row.checked === "Y").length,
    source_changed_count: sourceRows.filter((row) => row.changed === "Y").length,
    life_area_count: lifeRows.length,
    updated_life_areas: unique(lifeRows.filter((row) => row.weekly_change).map((row) => row.life_area)).join("; "),
    expansion_zone_count: expansionRows.length,
    updated_expansion_zones: unique(expansionRows.filter((row) => row.weekly_change).map((row) => row.zone_name)).join("; "),
    external_wait_count: waitingCount,
    maintain: conclusionBullets["유지"] || "",
    raise: conclusionBullets["상향 검토"] || "",
    hold: conclusionBullets["보류"] || "",
    lower: conclusionBullets["하향 검토"] || "",
    next_priorities: nextPriorities.join("; "),
    command_count: commandRows.length,
    baseline_log: /기준선/.test(`${headerMap["점검 주간"] || ""} ${introText}`) ? "Y" : "N",
    intro_note: compact(introText, 240),
    file: log.file,
    _source_rows: sourceRows,
    _change_rows: filteredChangeRows,
    _life_rows: lifeRows,
    _expansion_rows: expansionRows,
    _external_rows: externalRows,
    _next_priority_rows: nextPriorities,
    _note_rows: noteBullets,
    _command_rows: commandRows,
  };
}

function buildPayload(parsedLogs) {
  const rows = [...parsedLogs].sort((a, b) => String(b.log_date).localeCompare(String(a.log_date)));
  const changeRows = [];
  const lifeRows = [];
  const expansionRows = [];
  const externalRows = [];

  for (const row of rows) {
    for (const change of row._change_rows) {
      changeRows.push({
        log_date: row.log_date,
        week_label: row.week_label,
        project_or_area: change.project_or_area,
        change_type: change.change_type,
        official_source: change.official_source,
        confirmed_value: change.confirmed_value,
        impact: change.impact,
        updated_files: change.updated_files,
      });
    }
    for (const life of row._life_rows) {
      lifeRows.push({
        log_date: row.log_date,
        week_label: row.week_label,
        life_area: life.life_area,
        weekly_change: life.weekly_change,
        interpretation: life.interpretation,
        next_action: life.next_action,
      });
    }
    for (const zone of row._expansion_rows) {
      expansionRows.push({
        log_date: row.log_date,
        week_label: row.week_label,
        zone_name: zone.zone_name,
        weekly_change: zone.weekly_change,
        interpretation: zone.interpretation,
        next_action: zone.next_action,
      });
    }
    for (const external of row._external_rows) {
      externalRows.push({
        log_date: row.log_date,
        week_label: row.week_label,
        project_name: external.project_name,
        last_status: external.last_status,
        current_status: external.current_status,
        action: external.action,
      });
    }
  }

  const latestByLifeArea = [];
  const latestByExpansionZone = [];
  for (const row of rows) {
    for (const life of row._life_rows) {
      if (!life.life_area) continue;
      if (latestByLifeArea.some((item) => item.life_area === life.life_area)) continue;
      latestByLifeArea.push({
        log_date: row.log_date,
        life_area: life.life_area,
        weekly_change: life.weekly_change,
        interpretation: life.interpretation,
        next_action: life.next_action,
      });
    }
    for (const zone of row._expansion_rows) {
      if (!zone.zone_name) continue;
      if (latestByExpansionZone.some((item) => item.zone_name === zone.zone_name)) continue;
      latestByExpansionZone.push({
        log_date: row.log_date,
        zone_name: zone.zone_name,
        weekly_change: zone.weekly_change,
        interpretation: zone.interpretation,
        next_action: zone.next_action,
      });
    }
  }

  const summary = {
    generated_at: `${kstDate()} KST`,
    log_count: rows.length,
    baseline_log_count: rows.filter((row) => row.baseline_log === "Y").length,
    remote_run_yes_count: rows.filter((row) => row.remote_run === "Y").length,
    regenerated_yes_count: rows.filter((row) => row.regenerated === "Y").length,
    weeks_with_changes_count: rows.filter((row) => Number(row.change_count || 0) > 0).length,
    total_recorded_changes: changeRows.length,
    latest_log_date: rows[0]?.log_date || "",
    life_area_coverage: unique(lifeRows.map((row) => row.life_area)).join("; "),
    expansion_zone_coverage: unique(expansionRows.map((row) => row.zone_name)).join("; "),
    external_wait_projects: unique(externalRows.map((row) => row.project_name)).join("; "),
    inputs: rows.map((row) => row.file),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  return {
    summary,
    rows: rows.map((row) => {
      const {
        _source_rows,
        _change_rows,
        _life_rows,
        _expansion_rows,
        _external_rows,
        _next_priority_rows,
        _note_rows,
        _command_rows,
        ...publicRow
      } = row;
      return publicRow;
    }),
    change_rows: changeRows,
    life_area_rows: lifeRows,
    expansion_zone_rows: expansionRows,
    external_wait_rows: externalRows,
    latest_life_area_rows: latestByLifeArea,
    latest_expansion_zone_rows: latestByExpansionZone,
  };
}

function markdown(payload) {
  const {
    summary,
    rows,
    change_rows: changeRows,
    latest_life_area_rows: latestLifeRows,
    latest_expansion_zone_rows: latestExpansionRows,
    external_wait_rows: externalRows,
  } = payload;
  const recentChangeRows = changeRows.slice(0, 12);
  const latestExternalRows = [];
  for (const row of externalRows) {
    if (!row.project_name) continue;
    if (latestExternalRows.some((item) => item.project_name === row.project_name)) continue;
    latestExternalRows.push(row);
  }

  return `# 주간 모니터링 히스토리

작성 기준: ${summary.generated_at}

이 문서는 \`analysis/weekly-monitoring-log-*.md\`를 주별 타임라인으로 다시 묶은 인덱스다. 기준선 로그와 이후 주간 점검 로그를 한 장에서 비교한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 누적 로그 | ${summary.log_count} |
| 기준선 로그 | ${summary.baseline_log_count} |
| 원격 수집 실행 주 | ${summary.remote_run_yes_count} |
| 산출물 재생성 주 | ${summary.regenerated_yes_count} |
| 변화 기록이 있는 주 | ${summary.weeks_with_changes_count} |
| 누적 핵심 변화 행 | ${summary.total_recorded_changes} |

| 항목 | 값 |
| --- | --- |
| 최신 로그일 | ${summary.latest_log_date || "_없음_"} |
| 생활권 커버리지 | ${summary.life_area_coverage || "_없음_"} |
| 확장권 커버리지 | ${summary.expansion_zone_coverage || "_없음_"} |
| 외부 회신 대기 사업 | ${summary.external_wait_projects || "_없음_"} |

## 주간 타임라인

${mdTable(rows, [
    { key: "log_date", label: "로그일" },
    { key: "week_label", label: "주간" },
    { key: "remote_run", label: "원격" },
    { key: "regenerated", label: "재생성" },
    { key: "change_count", label: "변화수" },
    { key: "source_checked_count", label: "출처확인" },
    { key: "source_changed_count", label: "출처변화" },
    { key: "external_wait_count", label: "외부대기" },
    { key: "next_priorities", label: "다음 우선" },
    { key: "file", label: "파일" },
  ])}

## 최근 핵심 변화

${mdTable(recentChangeRows, [
    { key: "log_date", label: "로그일" },
    { key: "project_or_area", label: "사업/생활권" },
    { key: "change_type", label: "변화유형" },
    { key: "official_source", label: "공식출처" },
    { key: "confirmed_value", label: "확인값" },
    { key: "impact", label: "영향도" },
  ])}

## 생활권별 최신 메모

${mdTable(latestLifeRows, [
    { key: "life_area", label: "생활권" },
    { key: "log_date", label: "최신로그" },
    { key: "weekly_change", label: "이번 주 변화" },
    { key: "interpretation", label: "해석" },
    { key: "next_action", label: "다음 행동" },
  ])}

## 확장 관심권 최신 메모

${mdTable(latestExpansionRows, [
    { key: "zone_name", label: "확장권" },
    { key: "log_date", label: "최신로그" },
    { key: "weekly_change", label: "이번 주 변화" },
    { key: "interpretation", label: "해석" },
    { key: "next_action", label: "다음 행동" },
  ])}

## 외부 회신 대기 최신 상태

${mdTable(latestExternalRows, [
    { key: "project_name", label: "사업" },
    { key: "log_date", label: "최신로그" },
    { key: "last_status", label: "지난주 상태" },
    { key: "current_status", label: "이번 주 상태" },
    { key: "action", label: "조치" },
  ])}

## 운영 메모

- 새 로그를 만들 때는 \`node scripts/create-weekly-monitoring-log.mjs --date=YYYY-MM-DD --write --refresh\`를 우선 사용한다.
- 기준선 로그와 이후 주간 로그가 섞여 있어도 제목 alias와 공통 표 구조만 맞으면 히스토리에 포함된다.
- 공식 원문 없는 변화는 이 히스토리에서도 확정 신호가 아니라 \`watch\` 또는 \`context\`로만 해석한다.
`;
}

async function main() {
  const logs = await readLogs();
  const payload = buildPayload(logs.map(parseLog));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(payload.rows));
  await writeFile(OUT_MD, markdown(payload));

  console.log(`wrote ${OUT_MD}`);
  console.log(`wrote ${OUT_CSV}`);
  console.log(`wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
