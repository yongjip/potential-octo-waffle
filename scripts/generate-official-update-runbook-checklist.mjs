#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/official-update-runbook.json";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-update-runbook-checklist.md");
const OUT_CSV = path.join(OUT_DIR, "official-update-runbook-checklist.csv");
const OUT_JSON = path.join(OUT_DIR, "official-update-runbook-checklist.json");
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

function parseArgs(argv) {
  const args = {
    runbookIds: [],
    cadence: "",
    to: "",
  };
  for (const arg of argv) {
    if (arg.startsWith("--runbook=")) {
      args.runbookIds = arg
        .slice("--runbook=".length)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--cadence=")) {
      args.cadence = arg.slice("--cadence=".length);
    } else if (arg.startsWith("--to=")) {
      args.to = arg.slice("--to=".length);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/generate-official-update-runbook-checklist.mjs [options]

Creates a runnable dry-run checklist from analysis/official-update-runbook.json.
It does not fetch remote websites or call APIs.

Options:
  --runbook=<ids>   Comma-separated runbook ids to include
  --cadence=<name>  Include only a cadence such as weekly, monthly, ad_hoc
  --to=<YYYYMM>     Replace YYYYMM placeholders in displayed commands
  -h, --help        Show this help
`);
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

function splitCommands(text) {
  return String(text || "")
    .split(/\s*->\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function replacePlaceholders(command, args) {
  if (!args.to) return command;
  return command.replaceAll("YYYYMM", args.to);
}

function commandStatus({ command, networkRequired }) {
  if (/DATA_GO_KR_SERVICE_KEY|SEOUL_OPEN_DATA_KEY|RONE_API_KEY/.test(command)) return "api_key_required";
  if (networkRequired === "Y") return "network_required";
  if (/수동 검색|수동 확인|수동 발송|수동 갱신/.test(command)) return "manual";
  return "local_ready";
}

function commandNote({ command, networkRequired }) {
  const notes = [];
  if (networkRequired === "Y") notes.push("원격 호출");
  if (/--download/.test(command)) notes.push("첨부 다운로드 가능");
  if (/DATA_GO_KR_SERVICE_KEY|SEOUL_OPEN_DATA_KEY|RONE_API_KEY/.test(command)) notes.push("API 키 필요");
  if (/regenerate-research-artifacts/.test(command)) notes.push("로컬 산출물 재생성");
  if (/수동 검색|수동 확인|수동 발송|수동 갱신/.test(command)) notes.push("수동 확인");
  return notes.join("; ");
}

function buildChecklist(runbooks, args) {
  const rows = [];
  for (const runbook of runbooks) {
    const remoteCommands = splitCommands(runbook.command_sequence);
    const localCommands = splitCommands(runbook.followup_local_command);
    let step = 1;
    for (const command of remoteCommands) {
      const displayed = replacePlaceholders(command, args);
      rows.push({
        runbook_id: runbook.runbook_id,
        cadence: runbook.cadence,
        trigger: runbook.trigger,
        phase: runbook.network_required === "Y" ? "remote_collection" : "local_processing",
        step: step++,
        network_required: runbook.network_required,
        status: commandStatus({ command: displayed, networkRequired: runbook.network_required }),
        command: displayed,
        note: commandNote({ command: displayed, networkRequired: runbook.network_required }),
        first_outputs_to_read: runbook.first_outputs_to_read,
        decision_rule: runbook.decision_rule,
      });
    }
    for (const command of localCommands) {
      const displayed = replacePlaceholders(command, args);
      rows.push({
        runbook_id: runbook.runbook_id,
        cadence: runbook.cadence,
        trigger: runbook.trigger,
        phase: "followup_local",
        step: step++,
        network_required: "N",
        status: commandStatus({ command: displayed, networkRequired: "N" }),
        command: displayed,
        note: commandNote({ command: displayed, networkRequired: "N" }),
        first_outputs_to_read: runbook.first_outputs_to_read,
        decision_rule: runbook.decision_rule,
      });
    }
  }
  return rows;
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}

function markdown({ selectedRunbooks, checklistRows, args }) {
  const statusCounts = countBy(checklistRows, "status");
  const phaseCounts = countBy(checklistRows, "phase");
  const runbookRows = selectedRunbooks.map((runbook) => ({
    runbook_id: runbook.runbook_id,
    cadence: runbook.cadence,
    network_required: runbook.network_required,
    trigger: runbook.trigger,
    first_outputs_to_read: runbook.first_outputs_to_read,
  }));

  return `# 공식 업데이트 런북 체크리스트

작성 기준: ${UPDATED_AT}

이 문서는 \`analysis/official-update-runbook.json\`을 실행 가능한 드라이런 체크리스트로 펼친 것이다. 원격 웹사이트 호출이나 API 호출은 여기서 실행하지 않고, 원격/로컬/키 필요 단계를 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 선택 런북 | ${selectedRunbooks.length} |
| 체크리스트 단계 | ${checklistRows.length} |
| 상태 분포 | ${countText(statusCounts)} |
| 단계 분포 | ${countText(phaseCounts)} |
| YYYYMM 치환 | ${args.to || "미지정"} |

## 선택 런북

${mdTable(runbookRows, [
  { key: "runbook_id", label: "런북" },
  { key: "cadence", label: "주기" },
  { key: "network_required", label: "원격" },
  { key: "trigger", label: "트리거" },
  { key: "first_outputs_to_read", label: "먼저 읽을 산출물" },
])}

## 실행 체크리스트

${mdTable(checklistRows, [
  { key: "runbook_id", label: "런북" },
  { key: "phase", label: "단계" },
  { key: "step", label: "순서" },
  { key: "status", label: "상태" },
  { key: "network_required", label: "원격" },
  { key: "command", label: "명령" },
  { key: "note", label: "메모" },
])}

## 판정 규칙

${mdTable(
  selectedRunbooks.map((runbook) => ({
    runbook_id: runbook.runbook_id,
    first_outputs_to_read: runbook.first_outputs_to_read,
    decision_rule: runbook.decision_rule,
  })),
  [
    { key: "runbook_id", label: "런북" },
    { key: "first_outputs_to_read", label: "먼저 읽을 산출물" },
    { key: "decision_rule", label: "판정 규칙" },
  ],
)}

## 사용 예

\`\`\`bash
node scripts/generate-official-update-runbook-checklist.mjs --cadence=weekly
node scripts/generate-official-update-runbook-checklist.mjs --runbook=monthly_market_data_refresh --to=202606
\`\`\`
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runbooks = JSON.parse(await readFile(INPUT, "utf8"));
  const selectedRunbooks = runbooks.filter((runbook) => {
    if (args.runbookIds.length && !args.runbookIds.includes(runbook.runbook_id)) return false;
    if (args.cadence && runbook.cadence !== args.cadence) return false;
    return true;
  });
  if (args.runbookIds.length) {
    const known = new Set(runbooks.map((runbook) => runbook.runbook_id));
    const unknown = args.runbookIds.filter((id) => !known.has(id));
    if (unknown.length) throw new Error(`Unknown runbook id(s): ${unknown.join(", ")}`);
  }
  const checklistRows = buildChecklist(selectedRunbooks, args);
  const summary = {
    generated_at: UPDATED_AT,
    selected_runbooks: selectedRunbooks.length,
    checklist_steps: checklistRows.length,
    status_counts: countBy(checklistRows, "status"),
    phase_counts: countBy(checklistRows, "phase"),
    args,
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, selectedRunbooks, checklistRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(checklistRows));
  await writeFile(OUT_MD, markdown({ selectedRunbooks, checklistRows, args }));
  console.log(
    JSON.stringify(
      {
        selectedRunbooks: summary.selected_runbooks,
        checklistSteps: summary.checklist_steps,
        statusCounts: summary.status_counts,
        output: "analysis/official-update-runbook-checklist.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
