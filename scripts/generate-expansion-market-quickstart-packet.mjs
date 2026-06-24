#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const INPUT_PACKET = "analysis/expansion-market-first-download-packet.json";
const INPUT_STATUS = "analysis/expansion-market-download-status.json";
const OUT_MD = path.join(OUT_DIR, "expansion-market-quickstart-packet.md");
const OUT_CSV = path.join(OUT_DIR, "expansion-market-quickstart-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "expansion-market-quickstart-packet.json");

const TASKS_FILE = "analysis/expansion-market-first-download-packet.json";
const TASKS_KEY = "latestTaskRows";
const INTAKE_FILE = "data/market/manual-import/expansion-download-intake.json";
const FILE_DIR = "data/market/manual-import/files";
const QUICKSTART_PACKET_RANK_LIMIT = 2;
const SOURCE_ORDER = [
  "seoul-open-data",
  "molit-apt-trade",
  "molit-apt-rent",
  "molit-rowhouse-trade",
  "molit-rowhouse-rent",
];

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

function fileLink(relPath) {
  return `[${relPath}](${ROOT}/${relPath})`;
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
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

function buildCommand(script, flags) {
  return ["node", script, ...flags].join(" ");
}

function mainCommands(taskRows) {
  const seoulIds = taskRows.filter((row) => row.source === "seoul-open-data").map((row) => row.task_id);
  const rtmsIds = taskRows.filter((row) => row.source !== "seoul-open-data").map((row) => row.task_id);
  const years = [...new Set(taskRows.map((row) => String(row.coverage_from || "").slice(0, 4)).filter(Boolean))].sort();
  const commonFlags = [
    `--tasks-file=${TASKS_FILE}`,
    `--tasks-key=${TASKS_KEY}`,
    `--intake=${INTAKE_FILE}`,
    `--file-dir=${FILE_DIR}`,
    `--years=${years.join(",")}`,
  ];

  const commands = [];
  if (seoulIds.length) {
    commands.push({
      step: 1,
      label: "서울시 실거래 dry-run",
      kind: "dry_run",
      command: buildCommand("scripts/fetch-seoul-open-data-manual-tasks.mjs", [
        ...commonFlags,
        `--task-ids=${seoulIds.join(",")}`,
        "--dry-run",
      ]),
    });
    commands.push({
      step: 2,
      label: "서울시 실거래 실행",
      kind: "execute",
      command: buildCommand("scripts/fetch-seoul-open-data-manual-tasks.mjs", [
        ...commonFlags,
        `--task-ids=${seoulIds.join(",")}`,
      ]),
    });
  }
  if (rtmsIds.length) {
    commands.push({
      step: commands.length + 1,
      label: "국토부 RTMS dry-run",
      kind: "dry_run",
      command: buildCommand("scripts/fetch-rtms-manual-tasks.mjs", [
        ...commonFlags,
        `--task-ids=${rtmsIds.join(",")}`,
        "--dry-run",
      ]),
    });
    commands.push({
      step: commands.length + 1,
      label: "국토부 RTMS 실행",
      kind: "execute",
      command: buildCommand("scripts/fetch-rtms-manual-tasks.mjs", [
        ...commonFlags,
        `--task-ids=${rtmsIds.join(",")}`,
      ]),
    });
  }
  commands.push({
    step: commands.length + 1,
    label: "상태표 재생성",
    kind: "refresh",
    command: "node scripts/generate-expansion-market-download-session-packet.mjs",
  });
  return commands;
}

async function main() {
  const packet = await readJson(INPUT_PACKET);
  const status = await readJson(INPUT_STATUS);
  const latestTaskRows = packet.latestTaskRows || [];
  const statusRows = status.rows || [];

  const quickstartTasks = latestTaskRows
    .filter((row) => Number(row.packet_rank || 999) <= QUICKSTART_PACKET_RANK_LIMIT)
    .sort(
      (a, b) =>
        Number(a.packet_rank || 999) - Number(b.packet_rank || 999) ||
        SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source) ||
        a.source.localeCompare(b.source, "ko"),
    );
  const quickstartTaskIds = new Set(quickstartTasks.map((row) => row.task_id));
  const quickstartStatusRows = statusRows.filter((row) => quickstartTaskIds.has(row.task_id));

  const dongRows = (packet.packetRows || [])
    .filter((row) => Number(row.packet_rank || 999) <= QUICKSTART_PACKET_RANK_LIMIT)
    .map((row) => ({
      packet_rank: row.packet_rank,
      phase_label: row.phase_label,
      district: row.district,
      dong: row.dong,
      representative_projects: row.representative_projects,
      note: row.note,
    }));

  const commands = mainCommands(quickstartTasks);
  const summary = {
    generated_at: `${kstDate()} KST`,
    latest_window: packet.summary?.latest_window || "",
    quickstart_dong_count: dongRows.length,
    quickstart_task_count: quickstartTasks.length,
    file_present_count: quickstartStatusRows.filter((row) => row.file_exists === "Y").length,
    waiting_for_download_count: quickstartStatusRows.filter((row) => row.download_status === "waiting_for_download").length,
    ready_count: quickstartStatusRows.filter((row) => row.download_status === "file_ready_for_review").length,
    packet_rank_limit: QUICKSTART_PACKET_RANK_LIMIT,
    inputs: [INPUT_PACKET, INPUT_STATUS],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  const markdown = `# 확장권 시장 quickstart 패킷

작성 기준: ${summary.generated_at}

이 문서는 확장권 latest-window 30개 중 첫 세션에서 바로 닫을 10개 task만 따로 뽑은 실행 패킷이다. 범위는 packet rank 1~2, 즉 강동구 천호동과 길동이다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| latest window | ${summary.latest_window} |
| quickstart dong | ${summary.quickstart_dong_count} |
| quickstart task | ${summary.quickstart_task_count} |
| 파일 존재 | ${summary.file_present_count} |
| 다운로드 대기 | ${summary.waiting_for_download_count} |
| ready | ${summary.ready_count} |

## 먼저 열 파일

1. ${fileLink("analysis/expansion-market-download-session-packet.md")}
2. ${fileLink("analysis/expansion-market-download-status.md")}
3. ${fileLink("data/market/manual-import/expansion-download-intake.json")}
4. ${fileLink("analysis/expansion-market-first-download-packet.md")}

## 이번 세션 범위

${mdTable(dongRows, [
  { key: "packet_rank", label: "순서" },
  { key: "phase_label", label: "패킷" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "representative_projects", label: "대표 기준" },
  { key: "note", label: "주의" },
])}

## 작업 목록

${mdTable(
  quickstartTasks.map((row) => ({
    packet_rank: row.packet_rank,
    source: row.source,
    district: row.district,
    dong: row.dong,
    coverage: `${row.coverage_from}~${row.coverage_to}`,
    suggested_output_filename: row.suggested_output_filename,
    required_filter: row.required_filter,
  })),
  [
    { key: "packet_rank", label: "순서" },
    { key: "source", label: "source" },
    { key: "district", label: "자치구" },
    { key: "dong", label: "법정동" },
    { key: "coverage", label: "범위" },
    { key: "suggested_output_filename", label: "권장 파일명" },
    { key: "required_filter", label: "필터" },
  ],
)}

## 실행 명령

${commands
  .map(
    (row) => `### ${row.step}. ${row.label}

\`\`\`bash
${row.command}
\`\`\`
`,
  )
  .join("\n")}

## 세션 후 확인

1. ${fileLink("analysis/expansion-market-download-status.md")}에서 천호동/길동 10개 task 상태가 \`file_ready_for_review\` 또는 최소한 \`download_date_missing\`로 바뀌는지 확인한다.
2. 파일명이 다르면 ${fileLink("data/market/manual-import/expansion-download-intake.json")}에 \`local_path\`를 채운다.
3. 10개가 닫히면 성내동 5개를 다음 세션으로 넘긴다.
`;

  const csvRows = [
    ...quickstartTasks.map((row) => ({
      section: "task",
      step: row.packet_rank,
      label: `${row.district} ${row.dong} / ${row.source}`,
      status: quickstartStatusRows.find((item) => item.task_id === row.task_id)?.download_status || "unknown",
      file: row.suggested_output_filename,
      command: "",
      note: row.required_filter,
    })),
    ...commands.map((row) => ({
      section: "command",
      step: row.step,
      label: row.label,
      status: row.kind,
      file: "",
      command: row.command,
      note: "",
    })),
  ];

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, `${markdown}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, dong_rows: dongRows, task_rows: quickstartTasks, status_rows: quickstartStatusRows, command_rows: commands }, null, 2)}\n`);

  console.log(JSON.stringify({
    quickstart_dong_count: dongRows.length,
    quickstart_task_count: quickstartTasks.length,
    command_count: commands.length,
    output: "analysis/expansion-market-quickstart-packet.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
