#!/usr/bin/env node

import { spawn } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const COCKPIT_INPUT = "analysis/focus-project-weekly-monitoring-cockpit.json";
const FILING_TRACKER_INPUT = "analysis/high-blocking-filing-tracker.json";
const RUNBOOK_INPUT = "analysis/official-update-runbook-checklist.json";
const EXPANSION_COCKPIT_INPUT = "analysis/expansion-zone-weekly-monitoring-cockpit.json";
const OUT_DIR = "analysis";
const VALID_YN = new Set(["Y", "N"]);
const DEFAULT_SOURCE_ROWS = [
  "서울도시공간포털 결정고시/열람공고",
  "정비사업 정보몽땅 사업장검색/사업개요",
  "정비사업 정보몽땅 고시/공고",
  "정비사업 정보몽땅 조합입찰공고",
  "자치구 고시공고",
  "서울시보",
];
const UPDATED_FILE_CHECKLIST = [
  "project-notes/*.md",
  "analysis/project-comparison-matrix.md",
  "analysis/research-status-dashboard.md",
  "analysis/reassessment-watchlist.md",
  "analysis/official-update-registry.md",
  "analysis/transport-location-context.md",
];

function parseArgs(argv) {
  const args = {
    date: "",
    weekLabel: undefined,
    operator: "Codex / user",
    remoteRun: "N",
    regenerated: "N",
    introNote: undefined,
    sourceChecks: [],
    changes: [],
    lifeSummaries: [],
    expansionSummaries: [],
    externalStatuses: [],
    updatedFiles: [],
    commands: [],
    maintain: [],
    raise: [],
    hold: [],
    lower: [],
    nextPriorities: [],
    notes: [],
    replace: false,
    write: false,
    refresh: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--replace") {
      args.replace = true;
      continue;
    }
    if (arg === "--write") {
      args.write = true;
      continue;
    }
    if (arg === "--refresh") {
      args.refresh = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg.startsWith("--date=")) {
      args.date = arg.slice("--date=".length).trim();
      continue;
    }
    if (arg.startsWith("--week-label=")) {
      args.weekLabel = arg.slice("--week-label=".length).trim();
      continue;
    }
    if (arg.startsWith("--operator=")) {
      args.operator = arg.slice("--operator=".length).trim();
      continue;
    }
    if (arg.startsWith("--remote-run=")) {
      args.remoteRun = arg.slice("--remote-run=".length).trim();
      continue;
    }
    if (arg.startsWith("--regenerated=")) {
      args.regenerated = arg.slice("--regenerated=".length).trim();
      continue;
    }
    if (arg.startsWith("--intro-note=")) {
      args.introNote = arg.slice("--intro-note=".length).trim();
      continue;
    }
    if (arg.startsWith("--source-check=")) {
      args.sourceChecks.push(arg.slice("--source-check=".length).trim());
      continue;
    }
    if (arg.startsWith("--change=")) {
      args.changes.push(arg.slice("--change=".length).trim());
      continue;
    }
    if (arg.startsWith("--life-summary=")) {
      args.lifeSummaries.push(arg.slice("--life-summary=".length).trim());
      continue;
    }
    if (arg.startsWith("--expansion-summary=")) {
      args.expansionSummaries.push(arg.slice("--expansion-summary=".length).trim());
      continue;
    }
    if (arg.startsWith("--external-status=")) {
      args.externalStatuses.push(arg.slice("--external-status=".length).trim());
      continue;
    }
    if (arg.startsWith("--updated-file=")) {
      args.updatedFiles.push(arg.slice("--updated-file=".length).trim());
      continue;
    }
    if (arg.startsWith("--command=")) {
      args.commands.push(arg.slice("--command=".length).trim());
      continue;
    }
    if (arg.startsWith("--maintain=")) {
      args.maintain.push(arg.slice("--maintain=".length).trim());
      continue;
    }
    if (arg.startsWith("--raise=")) {
      args.raise.push(arg.slice("--raise=".length).trim());
      continue;
    }
    if (arg.startsWith("--hold=")) {
      args.hold.push(arg.slice("--hold=".length).trim());
      continue;
    }
    if (arg.startsWith("--lower=")) {
      args.lower.push(arg.slice("--lower=".length).trim());
      continue;
    }
    if (arg.startsWith("--next-priority=")) {
      args.nextPriorities.push(arg.slice("--next-priority=".length).trim());
      continue;
    }
    if (arg.startsWith("--note=")) {
      args.notes.push(arg.slice("--note=".length).trim());
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/create-weekly-monitoring-log.mjs --date=YYYY-MM-DD [options] [--write]

Required:
  --date=YYYY-MM-DD

Common options:
  --operator='Codex'
  --remote-run=Y|N
  --regenerated=Y|N
  --intro-note='이번 주는 baseline sync'
  --source-check='서울도시공간포털 결정고시/열람공고::Y::N::변화 없음'
  --change='잠실우성4차 / 잠실·송파::외부 회신 도착::송파구 회신::고시번호 확인::high::project-notes/09-tw2w7iwv.md'
  --life-summary='잠실/송파::변화 없음::장기 잠재 유지::잠실역-잠실나루 현장 입력'
  --expansion-summary='강동권::변화 없음::confirmed 비교 가능 유지::강동구 고시공고와 정보몽땅 교차 확인'
  --external-status='잠실우성4차::waiting_for_response::response_received_validate::record-high-blocking-response helper로 intake 반영'
  --updated-file='analysis/project-comparison-matrix.md'
  --command='node scripts/fetch-cleanup-projects.mjs'
  --maintain='잠실축 장기 잠재 유지'
  --raise='압구정 기반시설 조건 상향 검토'
  --hold='잠실우성4차 공사비 원문 확인 전 보류'
  --lower='없음'
  --next-priority='잠실우성4차 회신 여부 확인'
  --note='보도자료는 context로만 유지'
  --replace
  --write
  --refresh

Field formats:
  --source-check   source::checked::changed::memo
  --change         project_or_area::change_type::official_source::confirmed_value::impact::updated_files
  --life-summary   life_area::weekly_change::interpretation::next_action
  --expansion-summary zone_name::weekly_change::interpretation::next_action
  --external-status project::last_status::current_status::action

Behavior:
  - default mode is dry-run
  - source rows, life-area rows, external wait rows, command list are auto-filled from current artifacts
  - one markdown file is created per date: analysis/weekly-monitoring-log-YYYY-MM-DD.md
  - if the file already exists, --replace is required
  - --refresh runs weekly-monitoring-history + personal-research-home after write`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

function validateDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    throw new Error(`${label} must be YYYY-MM-DD`);
  }
}

function validateYn(value, label) {
  if (!VALID_YN.has(String(value || ""))) {
    throw new Error(`${label} must be Y or N`);
  }
}

function compact(value) {
  return String(value || "").trim();
}

function parseDelimited(raw, label, expectedLength) {
  const parts = String(raw || "").split("::").map((part) => part.trim());
  if (parts.length !== expectedLength) {
    throw new Error(`${label} must have ${expectedLength} fields separated by ::`);
  }
  return parts;
}

function isoWeekLabel(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${weekYear}-W${String(weekNo).padStart(2, "0")}`;
}

function mdTable(rows, fields) {
  return [
    `| ${fields.join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function unique(values) {
  return [...new Set(values.map(compact).filter(Boolean))];
}

function byName(rows, field) {
  return new Map(rows.map((row) => [compact(row[field]), row]).filter(([key]) => key));
}

function defaultLifeAreaRows(cockpitRows) {
  return unique(cockpitRows.map((row) => row.life_area)).map((lifeArea) => ({
    life_area: lifeArea,
    weekly_change: "",
    interpretation: "",
    next_action: "",
  }));
}

function defaultExpansionRows(expansionRows) {
  return unique((expansionRows || []).map((row) => row.zone_name)).map((zoneName) => {
    const matched = (expansionRows || []).find((row) => row.zone_name === zoneName) || {};
    return {
      zone_name: zoneName,
      weekly_change: "",
      interpretation: matched.current_state || "",
      next_action: matched.first_check_action || "",
    };
  });
}

function defaultExternalRows(filingRows) {
  return filingRows.map((row) => ({
    project_name: row.project_name,
    last_status: row.draft_status || row.response_status || row.filing_status || "",
    current_status: row.draft_status || row.response_status || row.filing_status || "",
    action: row.next_action || "",
  }));
}

function defaultCommands(runbookChecklist, remoteRun, regenerated) {
  const rows = runbookChecklist.checklistRows || [];
  const weeklyRows = rows
    .filter((row) => row.runbook_id === "weekly_primary_refresh")
    .sort((a, b) => Number(a.step || 0) - Number(b.step || 0));
  const commands = [];

  if (remoteRun === "Y") {
    commands.push(...weeklyRows.filter((row) => row.network_required === "Y").map((row) => row.command));
  }
  if (regenerated === "Y") {
    const localCommand = weeklyRows.find((row) => row.network_required === "N")?.command;
    if (localCommand) commands.push(localCommand);
  }
  return unique(commands);
}

function defaultNextPriorities(cockpitRows) {
  return cockpitRows
    .slice(0, 3)
    .map((row) => `${row.project_name}: ${row.first_check_action || row.weekly_question || ""}`)
    .filter((row) => compact(row));
}

function renderMarkdown({
  date,
  weekLabel,
  operator,
  remoteRun,
  regenerated,
  introNote,
  sourceRows,
  changeRows,
  lifeRows,
  expansionRows,
  externalRows,
  updatedFileRows,
  commandRows,
  conclusions,
  nextPriorities,
  notes,
}) {
  const introLine = introNote
    ? `이 문서는 ${date} 기준 주간 점검 로그다. ${introNote}`
    : `이 문서는 ${date} 기준 주간 점검 로그다. 공식 업데이트 실행 여부와 영향 사업장을 기록한다.`;

  const changeTableRows = changeRows.length
    ? changeRows.map((row) => [row.project_or_area, row.change_type, row.official_source, row.confirmed_value, row.impact, row.updated_files])
    : [["이번 주 기록 없음", "", "", "", "", ""]];

  const noteLines = notes.length ? notes : ["공식 원문이 없는 변화는 context 또는 watch로만 남긴다."];

  return `# 주간 모니터링 로그 ${date}

작성 기준: ${date} KST

${introLine}

## 주간 점검 헤더

| 항목 | 기록 |
| --- | --- |
| 점검 주간 | ${weekLabel} |
| 점검일 | ${date} |
| 점검자 | ${operator} |
| 실행 런북 | weekly_primary_refresh |
| 원격 수집 실행 여부 | ${remoteRun} |
| 산출물 재생성 여부 | ${regenerated} |
| 이번 주 핵심 변화 수 | ${changeRows.length} |

## 1차 공식 출처 점검

${mdTable(
    sourceRows.map((row) => [row.source, row.checked, row.changed, row.memo]),
    ["출처", "확인 여부", "변화 유무", "핵심 메모"],
  )}

## 핵심 변화 로그

${mdTable(changeTableRows, ["사업/생활권", "변화 유형", "공식 출처", "확인값", "영향도", "바로 수정한 파일"])}

## 생활권별 요약

${mdTable(
    lifeRows.map((row) => [row.life_area, row.weekly_change, row.interpretation, row.next_action]),
    ["생활권", "이번 주 변화", "해석", "다음 행동"],
  )}

## 확장 관심권 요약

${mdTable(
    expansionRows.map((row) => [row.zone_name, row.weekly_change, row.interpretation, row.next_action]),
    ["확장권", "이번 주 변화", "해석", "다음 행동"],
  )}

## 외부 회신 대기 3건 상태

${mdTable(
    externalRows.map((row) => [row.project_name, row.last_status, row.current_status, row.action]),
    ["사업", "지난주 상태", "이번 주 상태", "조치"],
  )}

## 이번 주 수정 파일 체크

${updatedFileRows.map((row) => `- [${row.checked ? "x" : " "}] \`${row.file}\``).join("\n")}

## 실행 명령 기록

\`\`\`bash
${commandRows.length ? commandRows.join("\n") : "# 원격 수집 또는 수동 확인에 사용한 명령/절차를 적는다."}
\`\`\`

## 이번 주 결론

- 유지: ${conclusions.maintain.join("; ")}
- 상향 검토: ${conclusions.raise.join("; ")}
- 보류: ${conclusions.hold.join("; ")}
- 하향 검토: ${conclusions.lower.join("; ")}

## 다음 주 우선 확인 대상

${nextPriorities.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## 메모

${noteLines.map((line) => `- ${line}`).join("\n")}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.date) throw new Error("--date is required");
  validateDate(args.date, "--date");
  validateYn(args.remoteRun, "--remote-run");
  validateYn(args.regenerated, "--regenerated");
  if (args.refresh && !args.write) throw new Error("--refresh requires --write");

  const cockpit = await readJson(COCKPIT_INPUT);
  const filingTracker = await readJson(FILING_TRACKER_INPUT);
  const runbookChecklist = await readJson(RUNBOOK_INPUT);
  const expansionCockpit = await readJson(EXPANSION_COCKPIT_INPUT);

  const cockpitRows = cockpit.rows || [];
  const filingRows = filingTracker.rows || [];
  const expansionRows = expansionCockpit.rows || [];
  const outFile = path.join(OUT_DIR, `weekly-monitoring-log-${args.date}.md`);
  const exists = await fileExists(outFile);
  if (exists && !args.replace) {
    throw new Error(`${outFile} already exists; use --replace to overwrite`);
  }
  if (!exists && args.replace) {
    throw new Error(`${outFile} does not exist; remove --replace to create it`);
  }

  const sourceRows = DEFAULT_SOURCE_ROWS.map((source) => ({
    source,
    checked: "",
    changed: "",
    memo: "",
  }));
  const sourceMap = byName(sourceRows, "source");
  for (const raw of args.sourceChecks) {
    const [source, checked, changed, memo] = parseDelimited(raw, "--source-check", 4);
    if (!sourceMap.has(source)) throw new Error(`Unknown source-check source: ${source}`);
    if (checked) validateYn(checked, `source-check checked for ${source}`);
    if (changed) validateYn(changed, `source-check changed for ${source}`);
    sourceMap.set(source, { source, checked, changed, memo });
  }

  const changeRows = args.changes.map((raw) => {
    const [projectOrArea, changeType, officialSource, confirmedValue, impact, updatedFiles] = parseDelimited(raw, "--change", 6);
    return {
      project_or_area: projectOrArea,
      change_type: changeType,
      official_source: officialSource,
      confirmed_value: confirmedValue,
      impact,
      updated_files: updatedFiles,
    };
  });

  const lifeRows = defaultLifeAreaRows(cockpitRows);
  const lifeMap = byName(lifeRows, "life_area");
  for (const raw of args.lifeSummaries) {
    const [lifeArea, weeklyChange, interpretation, nextAction] = parseDelimited(raw, "--life-summary", 4);
    if (!lifeMap.has(lifeArea)) throw new Error(`Unknown life-summary area: ${lifeArea}`);
    lifeMap.set(lifeArea, {
      life_area: lifeArea,
      weekly_change: weeklyChange,
      interpretation,
      next_action: nextAction,
    });
  }

  const expansionSummaryRows = defaultExpansionRows(expansionRows);
  const expansionMap = byName(expansionSummaryRows, "zone_name");
  for (const raw of args.expansionSummaries) {
    const [zoneName, weeklyChange, interpretation, nextAction] = parseDelimited(raw, "--expansion-summary", 4);
    if (!expansionMap.has(zoneName)) throw new Error(`Unknown expansion-summary zone: ${zoneName}`);
    expansionMap.set(zoneName, {
      zone_name: zoneName,
      weekly_change: weeklyChange,
      interpretation,
      next_action: nextAction,
    });
  }

  const externalRows = defaultExternalRows(filingRows);
  const externalMap = byName(externalRows, "project_name");
  for (const raw of args.externalStatuses) {
    const [projectName, lastStatus, currentStatus, action] = parseDelimited(raw, "--external-status", 4);
    const matchedRow =
      externalRows.find((row) => row.project_name === projectName) ||
      externalRows.find((row) => row.project_name.includes(projectName));
    if (!matchedRow) throw new Error(`Unknown external-status project: ${projectName}`);
    externalMap.set(matchedRow.project_name, {
      project_name: matchedRow.project_name,
      last_status: lastStatus,
      current_status: currentStatus,
      action,
    });
  }

  const updatedFileSet = new Set(unique(args.updatedFiles));
  const updatedFileRows = UPDATED_FILE_CHECKLIST.map((file) => ({
    file,
    checked: updatedFileSet.has(file),
  }));

  const commandRows = unique(args.commands.length ? args.commands : defaultCommands(runbookChecklist, args.remoteRun, args.regenerated));
  const maintain = unique(args.maintain);
  const raise = unique(args.raise);
  const hold = unique(args.hold);
  const lower = unique(args.lower);
  const nextPriorities = unique(args.nextPriorities.length ? args.nextPriorities : defaultNextPriorities(cockpitRows));
  const notes = unique(args.notes);
  const weekLabel = args.weekLabel || isoWeekLabel(args.date);

  const markdown = renderMarkdown({
    date: args.date,
    weekLabel,
    operator: args.operator || "Codex / user",
    remoteRun: args.remoteRun,
    regenerated: args.regenerated,
    introNote: args.introNote,
    sourceRows: [...sourceMap.values()],
    changeRows,
    lifeRows: [...lifeMap.values()],
    expansionRows: [...expansionMap.values()],
    externalRows: [...externalMap.values()],
    updatedFileRows,
    commandRows,
    conclusions: {
      maintain: maintain.length ? maintain : ["없음"],
      raise: raise.length ? raise : ["없음"],
      hold: hold.length ? hold : ["없음"],
      lower: lower.length ? lower : ["없음"],
    },
    nextPriorities: nextPriorities.length ? nextPriorities : ["우선 확인 대상 입력 필요"],
    notes,
  });

  if (args.write) {
    await writeFile(outFile, markdown);
    if (args.refresh) {
      await runCommand("node", ["scripts/generate-weekly-monitoring-history.mjs"]);
      await runCommand("node", ["scripts/generate-weekly-monitoring-comparison-board.mjs"]);
      await runCommand("node", ["scripts/generate-life-area-monitoring-board.mjs"]);
      await runCommand("node", ["scripts/generate-personal-research-home.mjs"]);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: args.write ? "write" : "dry_run",
        wrote: args.write,
        refreshed: args.write && args.refresh,
        file: outFile,
        week_label: weekLabel,
        remote_run: args.remoteRun,
        regenerated: args.regenerated,
        source_checks: [...sourceMap.values()],
        change_count: changeRows.length,
        life_areas: [...lifeMap.values()].map((row) => row.life_area),
        expansion_zones: [...expansionMap.values()].map((row) => row.zone_name),
        external_wait_projects: [...externalMap.values()].map((row) => row.project_name),
        checked_files: updatedFileRows.filter((row) => row.checked).map((row) => row.file),
        command_count: commandRows.length,
        next_priorities: nextPriorities.length ? nextPriorities : ["우선 확인 대상 입력 필요"],
        next_steps: args.write
          ? args.refresh
            ? ["analysis/weekly-monitoring-history.md", "analysis/weekly-monitoring-comparison-board.md", "analysis/life-area-monitoring-board.md", "analysis/personal-research-home.md", outFile]
            : ["node scripts/generate-weekly-monitoring-history.mjs", "node scripts/generate-weekly-monitoring-comparison-board.mjs", "node scripts/generate-life-area-monitoring-board.mjs", "node scripts/generate-personal-research-home.mjs", outFile]
          : ["검토 후 --write 추가", "--change / --life-summary / --source-check 보강", "필요하면 --refresh 추가"],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
