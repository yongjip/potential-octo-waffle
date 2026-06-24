#!/usr/bin/env node

import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const FILE_DIR = "data/market/manual-import/files";
const INTAKE_FILE = "data/market/manual-import/expansion-download-intake.json";
const PACKET_INPUT = "analysis/expansion-market-first-download-packet.json";

const OUT_DIR = "analysis";
const OUT_PACKET_MD = path.join(OUT_DIR, "expansion-market-download-session-packet.md");
const OUT_PACKET_CSV = path.join(OUT_DIR, "expansion-market-download-session-packet.csv");
const OUT_PACKET_JSON = path.join(OUT_DIR, "expansion-market-download-session-packet.json");
const OUT_STATUS_MD = path.join(OUT_DIR, "expansion-market-download-status.md");
const OUT_STATUS_CSV = path.join(OUT_DIR, "expansion-market-download-status.csv");
const OUT_STATUS_JSON = path.join(OUT_DIR, "expansion-market-download-status.json");

const SOURCE_PAGE = {
  "seoul-open-data": "https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do",
  "molit-apt-trade": "https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=",
  "molit-apt-rent": "https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=",
  "molit-rowhouse-trade": "https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=",
  "molit-rowhouse-rent": "https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=",
};

const SOURCE_LABEL = {
  "seoul-open-data": "서울 열린데이터광장 OA-21275",
  "molit-apt-trade": "국토부 실거래가 공개시스템 자료제공",
  "molit-apt-rent": "국토부 실거래가 공개시스템 자료제공",
  "molit-rowhouse-trade": "국토부 실거래가 공개시스템 자료제공",
  "molit-rowhouse-rent": "국토부 실거래가 공개시스템 자료제공",
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

function fileLink(relPath) {
  return `[${relPath}](${ROOT}/${relPath})`;
}

function webLink(label, url) {
  return `[${label}](${url})`;
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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function fileInfo(file) {
  if (!file) return { exists: "N", bytes: 0, ext: "" };
  try {
    await access(file);
    const info = await stat(file);
    return { exists: "Y", bytes: info.size, ext: path.extname(file).toLowerCase() };
  } catch (error) {
    if (error.code === "ENOENT") return { exists: "N", bytes: 0, ext: path.extname(file).toLowerCase() };
    throw error;
  }
}

function byTaskId(rows) {
  return new Map((rows || []).map((row) => [row.task_id, row]));
}

function templateRow(task, existing = {}) {
  const localPath = existing.local_path || "";
  return {
    task_id: task.task_id,
    suggested_output_filename: task.suggested_output_filename || "",
    local_path: localPath,
    downloaded_at: existing.downloaded_at || "",
    source_page_or_url: existing.source_page_or_url || SOURCE_PAGE[task.source] || "",
    filter_applied: existing.filter_applied || task.required_filter || "",
    operator_note: existing.operator_note || "",
    source: task.source || "",
    source_kind: task.source_kind || "",
    district: task.district || "",
    dong: task.dong || "",
    coverage_from: task.coverage_from || "",
    coverage_to: task.coverage_to || "",
    project_names: task.representative_projects || "",
    packet_rank: task.packet_rank || "",
    phase_label: task.phase_label || "",
  };
}

function compact(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].join("; ");
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "").trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function statusFor(row, info, inferredPath) {
  const chosenPath = row.local_path || (info.exists === "Y" ? inferredPath : "");
  if (!chosenPath) return "waiting_for_download";
  if (info.exists !== "Y") return "local_path_missing";
  if (!row.downloaded_at) return "download_date_missing";
  return "file_ready_for_review";
}

function nextAction(status) {
  if (status === "waiting_for_download") return "공식 페이지에서 원자료를 내려받아 권장 파일명으로 files/에 저장하거나 local_path를 채운다.";
  if (status === "local_path_missing") return "local_path 또는 권장 파일명이 실제 파일을 가리키는지 확인한다.";
  if (status === "download_date_missing") return "expansion-download-intake.json에 downloaded_at을 기록한다.";
  return "status 확인 후 반입 manifest/정규화 경로로 넘길 준비를 한다.";
}

async function main() {
  const packet = await readJson(PACKET_INPUT, { summary: {}, packetRows: [], latestTaskRows: [], backfillRows: [] });
  const existingIntake = await readJson(INTAKE_FILE, { rows: [] });
  const existingByTask = byTaskId(existingIntake.rows || []);
  const tasks = packet.latestTaskRows || [];

  const intakeRows = tasks.map((task) => templateRow(task, existingByTask.get(task.task_id)));
  const orphanRows = (existingIntake.rows || []).filter((row) => row.task_id && !tasks.some((task) => task.task_id === row.task_id));
  const intakePayload = {
    updated_at: `${kstDate()} KST`,
    notes: [
      "확장권 최신 window 30개 task 전용 수동 다운로드 intake다.",
      "권장 파일명 그대로 data/market/manual-import/files/에 저장하면 local_path를 비워도 status generator가 파일을 감지한다.",
      "downloaded_at, source_page_or_url, filter_applied, operator_note를 task_id별로 채워 최신분 수집 이력을 남긴다.",
      "core 70개 download-intake.json과 섞지 않고 확장권 latest-window 30개만 별도 관리한다.",
    ],
    rows: intakeRows,
    orphan_rows: orphanRows,
  };

  const statusRows = [];
  for (const row of intakeRows) {
    const inferredPath = path.join(FILE_DIR, row.suggested_output_filename);
    const chosenPath = row.local_path || inferredPath;
    const info = await fileInfo(chosenPath);
    const status = statusFor(row, info, inferredPath);
    statusRows.push({
      task_id: row.task_id,
      packet_rank: row.packet_rank,
      phase_label: row.phase_label,
      source: row.source,
      source_kind: row.source_kind,
      district: row.district,
      dong: row.dong,
      coverage_from: row.coverage_from,
      coverage_to: row.coverage_to,
      suggested_output_filename: row.suggested_output_filename,
      local_path: row.local_path || (info.exists === "Y" ? inferredPath : ""),
      file_exists: info.exists,
      file_bytes: info.bytes,
      downloaded_at: row.downloaded_at,
      source_page_or_url: row.source_page_or_url,
      filter_applied: row.filter_applied,
      download_status: status,
      next_action: nextAction(status),
      operator_note: row.operator_note,
    });
  }

  const summary = {
    generated_at: `${kstDate()} KST`,
    latest_window: packet.summary?.latest_window || "",
    intake_rows: intakeRows.length,
    orphan_rows: orphanRows.length,
    file_present_count: statusRows.filter((row) => row.file_exists === "Y").length,
    waiting_for_download_count: statusRows.filter((row) => row.download_status === "waiting_for_download").length,
    ready_count: statusRows.filter((row) => row.download_status === "file_ready_for_review").length,
    status_summary: countText(countBy(statusRows, "download_status")),
    phase_summary: packet.summary?.phase_summary || "",
    inputs: [PACKET_INPUT, INTAKE_FILE],
    outputs: [OUT_PACKET_MD, OUT_PACKET_CSV, OUT_PACKET_JSON, OUT_STATUS_MD, OUT_STATUS_CSV, OUT_STATUS_JSON, INTAKE_FILE],
  };

  const packetRows = packet.packetRows || [];
  const markdownPacket = `# 확장권 시장 다운로드 세션 패킷

작성 기준: ${summary.generated_at}

이 문서는 확장권 latest-window 30개 task를 실제 수동 다운로드 세션에서 바로 처리하기 위한 패킷이다. core 70개 시장 intake와 분리해서, 강동권 direct baseline 15개를 먼저 받고 그 다음 약수권 adjacent 10개, 마지막으로 옥수 edge 5개를 처리한다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 최신 window | ${summary.latest_window} |
| intake row | ${summary.intake_rows} |
| 파일 존재 | ${summary.file_present_count} |
| 다운로드 대기 | ${summary.waiting_for_download_count} |
| ready | ${summary.ready_count} |
| phase 분포 | ${summary.phase_summary} |

## 먼저 열 파일

1. ${fileLink("analysis/expansion-market-first-download-packet.md")}
2. ${fileLink("analysis/expansion-market-scope-workbook.md")}
3. ${fileLink("data/market/manual-import/expansion-download-intake.json")}
4. ${fileLink("analysis/expansion-market-download-status.md")}
5. ${fileLink("analysis/life-area-market-reaction-brief.md")}

## 세션 순서

1. 강동권 direct baseline 3개 dong부터 처리한다.
2. 각 dong마다 서울시 실거래 1개 + RTMS 4개를 같은 자리에서 저장한다.
3. 파일명은 packet의 suggested filename을 그대로 쓴다.
4. 파일명이 다르면 ${fileLink("data/market/manual-import/expansion-download-intake.json")}에 local_path를 기록한다.
5. latest-window 30개를 닫은 뒤에만 2024~2025 backfill로 내려간다.

## packet 기준 dong 순서

${mdTable(packetRows, [
  { key: "packet_rank", label: "순서" },
  { key: "phase_label", label: "패킷" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "representative_projects", label: "대표 기준" },
])}

## source entry points

- ${webLink(SOURCE_LABEL["seoul-open-data"], SOURCE_PAGE["seoul-open-data"])}
- ${webLink(SOURCE_LABEL["molit-apt-trade"], SOURCE_PAGE["molit-apt-trade"])}

## dong별 체크포인트

${packetRows
  .map(
    (row) => `### ${row.packet_rank}. ${row.district} ${row.dong}

- 패킷: ${row.phase_label}
- 대표 기준: ${row.representative_projects}
- 이번 세션 source 순서: ${row.source_order}
- 파일명
  ${row.suggested_filenames}
- 확인 질문
  ${row.first_question}
- 주의
  ${row.note}
`,
  )
  .join("\n")}

## 세션 후 반영

1. ${fileLink("analysis/expansion-market-download-status.md")}를 다시 생성해 파일 감지 여부를 확인한다.
2. 최신분 30개가 다 닫히면 backfill은 ${fileLink("analysis/expansion-market-first-download-packet.md")}의 규칙을 따른다.
3. 수치가 들어와도 사업 단계 판정은 ${fileLink("analysis/expansion-zone-weekly-monitoring-cockpit.md")}와 분리해서 읽는다.
`;

  const markdownStatus = `# 확장권 시장 다운로드 상태

작성 기준: ${summary.generated_at}

이 문서는 확장권 latest-window 30개 task가 실제로 내려받혔는지 점검한다. core market download status와 분리해서 강동권·약수권 확장 수집만 따로 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| task | ${summary.intake_rows} |
| 파일 존재 | ${summary.file_present_count} |
| 다운로드 대기 | ${summary.waiting_for_download_count} |
| ready | ${summary.ready_count} |
| 상태 분포 | ${summary.status_summary} |

## 상태표

${mdTable(statusRows, [
  { key: "packet_rank", label: "순서" },
  { key: "source", label: "source" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "coverage_from", label: "시작" },
  { key: "coverage_to", label: "종료" },
  { key: "file_exists", label: "파일" },
  { key: "download_status", label: "상태" },
  { key: "next_action", label: "다음 액션" },
])}

## 파일 경로

${mdTable(statusRows, [
  { key: "task_id", label: "task" },
  { key: "suggested_output_filename", label: "권장 파일명" },
  { key: "local_path", label: "감지/입력 경로" },
  { key: "source_page_or_url", label: "공식 페이지" },
  { key: "filter_applied", label: "필터" },
])}
`;

  const packetJson = { summary, packet_rows: packetRows, latest_task_rows: tasks, status_rows: statusRows };

  const csvRows = [
    ...packetRows.map((row) => ({
      section: "packet",
      item: `${row.packet_rank}. ${row.district} ${row.dong}`,
      priority: row.phase_label,
      file: "analysis/expansion-market-download-session-packet.md",
      action: row.source_order,
      note: row.note,
    })),
    ...statusRows.map((row) => ({
      section: "status",
      item: `${row.district} ${row.dong} / ${row.source}`,
      priority: row.download_status,
      file: row.suggested_output_filename,
      action: row.filter_applied,
      note: row.next_action,
    })),
  ];

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(INTAKE_FILE), { recursive: true });
  await writeFile(INTAKE_FILE, `${JSON.stringify(intakePayload, null, 2)}\n`);
  await writeFile(OUT_PACKET_JSON, `${JSON.stringify(packetJson, null, 2)}\n`);
  await writeFile(OUT_PACKET_CSV, toCsv(csvRows));
  await writeFile(OUT_PACKET_MD, `${markdownPacket}\n`);
  await writeFile(OUT_STATUS_JSON, `${JSON.stringify({ summary, rows: statusRows }, null, 2)}\n`);
  await writeFile(OUT_STATUS_CSV, toCsv(statusRows));
  await writeFile(OUT_STATUS_MD, `${markdownStatus}\n`);

  console.log(
    JSON.stringify(
      {
        intake_rows: intakeRows.length,
        status_rows: statusRows.length,
        file_present: summary.file_present_count,
        output: "analysis/expansion-market-download-session-packet.{md,csv,json}; analysis/expansion-market-download-status.{md,csv,json}; data/market/manual-import/expansion-download-intake.json",
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
