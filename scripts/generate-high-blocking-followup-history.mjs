#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-followup-history.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-followup-history.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-followup-history.json");

const INPUTS = {
  log: "data/review/high-blocking-followup-check-log.json",
  filingTracker: "analysis/high-blocking-filing-tracker.json",
  sessionPacket: "analysis/high-blocking-next-check-session-packet.json",
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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function latestByRank(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = String(row.rank || "");
    const previous = map.get(key);
    if (!previous || String(row.checked_at || "").localeCompare(String(previous.checked_at || "")) > 0) {
      map.set(key, row);
    }
  }
  return map;
}

function buildHistoryRows(logRows) {
  return [...(logRows || [])].sort(
    (a, b) =>
      String(b.checked_at || "").localeCompare(String(a.checked_at || "")) ||
      Number(a.rank || 0) - Number(b.rank || 0),
  );
}

function statusCounts(rows) {
  const counts = {};
  for (const row of rows) {
    const key = String(row.check_status || "unknown");
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function buildLatestRows(trackerRows, latestMap) {
  return (trackerRows || []).map((row) => {
    const latest = latestMap.get(String(row.rank)) || {};
    return {
      rank: row.rank,
      project_name: row.project_name,
      filing_receipt_no: row.filing_receipt_no,
      current_response_status: row.response_status,
      next_check_date: row.next_check_date,
      latest_checked_at: latest.checked_at || "",
      latest_check_status: latest.check_status || "no_log_yet",
      portal_status: latest.portal_status || "",
      observed_note: latest.observed_note || "",
      follow_up_action: latest.follow_up_action || row.next_action || "",
    };
  });
}

function summary(historyRows, latestRows, sessionPacket) {
  const counts = statusCounts(historyRows);
  return {
    generated_at: `${kstDate()} KST`,
    log_count: historyRows.length,
    projects_with_log_count: latestRows.filter((row) => row.latest_checked_at).length,
    projects_without_log_count: latestRows.filter((row) => !row.latest_checked_at).length,
    no_change_count: counts.no_change || 0,
    response_posted_count: counts.response_posted || 0,
    supplement_requested_count: counts.supplement_requested || 0,
    deadline_changed_count: counts.deadline_changed || 0,
    portal_issue_count: counts.portal_issue || 0,
    session_anchor_date: sessionPacket.summary?.session_anchor_date || "",
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summaryRow, latestRows, historyRows) {
  return `# High Blocking Follow-up History

작성 기준: ${summaryRow.generated_at}

이 문서는 외부 회신 대기 3건을 실제로 다시 확인한 이력을 누적한다. 점검일, 포털 상태, 보완요구/처리기한 변경, 회신 게시 여부를 남기고 다음 helper 실행 경로를 바로 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 누적 점검 로그 | ${summaryRow.log_count} |
| 로그 있는 사업장 | ${summaryRow.projects_with_log_count} |
| 아직 로그 없음 | ${summaryRow.projects_without_log_count} |
| no_change | ${summaryRow.no_change_count} |
| response_posted | ${summaryRow.response_posted_count} |
| supplement_requested | ${summaryRow.supplement_requested_count} |
| deadline_changed | ${summaryRow.deadline_changed_count} |
| portal_issue | ${summaryRow.portal_issue_count} |
| 현재 세션 기준일 | ${summaryRow.session_anchor_date || "미정"} |

## 사업장별 최신 상태

${mdTable(latestRows, [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "filing_receipt_no", label: "접수번호" },
    { key: "latest_checked_at", label: "마지막 점검일" },
    { key: "latest_check_status", label: "점검 상태" },
    { key: "portal_status", label: "포털 상태" },
    { key: "next_check_date", label: "다음 점검일" },
    { key: "follow_up_action", label: "다음 액션" },
  ])}

## 누적 점검 로그

${mdTable(historyRows, [
    { key: "checked_at", label: "점검일" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "check_status", label: "점검 상태" },
    { key: "portal_status", label: "포털 상태" },
    { key: "observed_note", label: "확인 메모" },
    { key: "next_check_date", label: "다음 점검일" },
    { key: "follow_up_action", label: "다음 액션" },
  ])}

## 운영 메모

- 회신이 실제 게시됐으면 이력만 남기지 말고 \`record-high-blocking-response\` helper로 intake를 바로 갱신한다.
- 보완요구나 처리기한 변경이 있으면 \`expected_response_by\`, \`next_check_date\`, \`filing_note\`를 같이 갱신한다.
- 이 문서가 비어 있으면 아직 점검 로그를 남기지 않은 상태다. 이 경우 \`analysis/high-blocking-next-check-session-packet.md\`와 \`record-high-blocking-followup-check\` helper를 먼저 사용한다.
`;
}

async function main() {
  const [logRows, filingTracker, sessionPacket] = await Promise.all([
    readJson(INPUTS.log, []),
    readJson(INPUTS.filingTracker),
    readJson(INPUTS.sessionPacket, { summary: {}, rows: [] }),
  ]);

  const historyRows = buildHistoryRows(logRows);
  const latestRows = buildLatestRows(filingTracker.rows || [], latestByRank(historyRows));
  const summaryRow = summary(historyRows, latestRows, sessionPacket);
  const payload = { summary: summaryRow, latest_rows: latestRows, history_rows: historyRows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(historyRows));
  await writeFile(OUT_MD, `${markdown(summaryRow, latestRows, historyRows)}\n`);

  console.log(
    JSON.stringify(
      {
        logs: historyRows.length,
        latest_projects: latestRows.length,
        output: "analysis/high-blocking-followup-history.{md,csv,json}",
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
