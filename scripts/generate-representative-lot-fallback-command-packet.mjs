#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-command-packet.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-command-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-command-packet.json");

const INPUTS = {
  apiProbe: "analysis/representative-lot-fallback-api-probe.json",
  findingBoard: "analysis/representative-lot-fallback-finding-board.json",
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

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function recommendedCheckStatus(apiVerdict) {
  if (apiVerdict === "strong_same_stage_candidate") return "confirmed_current_business";
  if (apiVerdict === "needs_manual_confirmation") return "ambiguous_candidate";
  if (apiVerdict === "planning_hold") return "planning_layer_only";
  if (apiVerdict === "stage_gap_hold") return "stage_gap_hold";
  return "...";
}

function priorityRank(apiVerdict) {
  return {
    strong_same_stage_candidate: 4,
    needs_manual_confirmation: 3,
    stage_gap_hold: 2,
    planning_hold: 1,
  }[apiVerdict] ?? 0;
}

function buildWriteCommand(rank, checkStatus) {
  const autoFlag = checkStatus === "confirmed_current_business" ? " --auto-mark-applied" : "";
  return `node scripts/record-representative-lot-fallback-finding.mjs --rank=${rank} --checked-at=today --check-status=${checkStatus} --prefill-from-api --write --refresh${autoFlag}`;
}

function buildRows(apiProbe, findingBoard) {
  const apiRows = apiProbe.rows || [];
  const findingByRank = Object.fromEntries((findingBoard.rows || []).map((row) => [String(row.rank || ""), row]));
  return apiRows
    .map((row) => {
      const board = findingByRank[String(row.rank || "")] || {};
      const checkStatus = recommendedCheckStatus(row.api_verdict);
      return {
        rank: row.rank,
        project_name: row.project_name,
        api_verdict: row.api_verdict,
        current_stage: row.current_stage,
        board_status: board.board_status || "",
        present_sn: row.top_present_sn || "",
        data_reference_date: row.top_data_reference_date || "",
        business_type: row.top_business_type || "",
        verified_zone_name: row.top_candidate_name || "",
        probe_key: row.browser_probe_key || "",
        dry_run_command: `node scripts/record-representative-lot-fallback-finding.mjs --rank=${row.rank} --checked-at=today --check-status=${checkStatus} --prefill-from-api`,
        write_command: buildWriteCommand(row.rank, checkStatus),
        manual_apply_command:
          checkStatus === "confirmed_current_business"
            ? `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=${row.rank} --checked-at=today --write --refresh`
            : "",
      };
    })
    .sort((left, right) => priorityRank(right.api_verdict) - priorityRank(left.api_verdict) || Number(left.rank || 9999) - Number(right.rank || 9999));
}

function buildSummary(rows) {
  return {
    generated_at: `${kstDate()} KST`,
    project_count: rows.length,
    strong_same_stage_candidate_count: rows.filter((row) => row.api_verdict === "strong_same_stage_candidate").length,
    needs_manual_confirmation_count: rows.filter((row) => row.api_verdict === "needs_manual_confirmation").length,
    planning_hold_count: rows.filter((row) => row.api_verdict === "planning_hold").length,
    stage_gap_hold_count: rows.filter((row) => row.api_verdict === "stage_gap_hold").length,
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
    inputs: Object.values(INPUTS),
  };
}

function markdown(summary, rows) {
  return `# Representative Lot Fallback Command Packet

작성 기준: ${summary.generated_at}

이 문서는 fallback 6건을 Edge에서 대조한 직후 바로 입력할 수 있도록 rank별 copy-ready 명령을 모아 둔 패킷이다. 기본 날짜는 \`today\`를 사용하고, \`--prefill-from-api\`로 \`presentSn/기준일/사업유형\`을 자동 채운다. \`confirmed_current_business\` 명령은 \`--auto-mark-applied\`를 포함해 반영 점검까지 통과하면 \`applied\`까지 한 번에 닫는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${summary.project_count} |
| same-stage 즉시 확인 | ${summary.strong_same_stage_candidate_count} |
| 충돌 재확인 | ${summary.needs_manual_confirmation_count} |
| planning hold | ${summary.planning_hold_count} |
| stage-gap hold | ${summary.stage_gap_hold_count} |

## 먼저 열 파일

1. ${fileLink("analysis/representative-lot-fallback-api-probe.md")}
2. ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")}
3. ${fileLink("analysis/representative-lot-fallback-finding-board.md")}
4. ${fileLink("analysis/representative-lot-fallback-apply-audit.md")}

## 한눈표

${mdTable(rows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "api_verdict", label: "API 판정" },
    { key: "present_sn", label: "presentSn" },
    { key: "data_reference_date", label: "기준일" },
    { key: "write_command", label: "기록 명령" },
  ])}

${rows
    .map(
      (row) => `## ${row.rank}. ${row.project_name}

- API 판정: ${row.api_verdict}
- 현재 단계: ${row.current_stage}
- 보드 상태: ${row.board_status || "unreviewed"}
- 확인 후보명: ${row.verified_zone_name || "-"}
- presentSn: ${row.present_sn || "-"}
- 기준일: ${row.data_reference_date || "-"}
- 사업유형: ${row.business_type || "-"}
- 프로브 키: ${row.probe_key || "-"}
- dry-run:
  \`${row.dry_run_command}\`
- write:
  \`${row.write_command}\`
- manual apply fallback:
  \`${row.manual_apply_command || "-"}\`
`,
    )
    .join("\n")}
`;
}

async function main() {
  const [apiProbe, findingBoard] = await Promise.all([
    readJson(INPUTS.apiProbe, { rows: [] }),
    readJson(INPUTS.findingBoard, { rows: [] }),
  ]);
  const rows = buildRows(apiProbe, findingBoard);
  const summary = buildSummary(rows);
  const payload = { generated_at: summary.generated_at, summary, rows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);

  console.log(JSON.stringify({ generated_at: summary.generated_at, rows: rows.length, output: OUT_JSON }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
