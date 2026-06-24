#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/review/high-blocking-public-web-probe.json";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-public-web-probe.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-public-web-probe.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-public-web-probe.json");

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

function flattenObservation(row) {
  return {
    rank: row.rank,
    project_name: row.project_name,
    probe_date: row.probe_date,
    source_name: row.source_name,
    source_url: row.source_url,
    probe_type: row.probe_type,
    observed_values: Object.entries(row.observed_values || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("; "),
    notice_identifier_status: row.notice_identifier_status,
    public_notice_disclosure_status: row.public_notice_disclosure_status,
    resolution_effect: row.resolution_effect,
    remaining_gap: row.remaining_gap,
    next_action: row.next_action,
  };
}

function markdown({ rows, summary }) {
  return `# High Blocking 공식 웹 프로브

작성 기준: ${UPDATED_AT}

이 문서는 high blocking으로 남은 3개 사업장에 대해 비회원으로 접근 가능한 공식 웹 화면에서 무엇을 확인했고, 무엇이 여전히 담당부서/정보공개 확인 대상으로 남는지 기록한다. 웹 화면의 사업개요 값은 참고 근거를 강화하지만, 고시번호·고시일·인가 원문 URL·관리처분 별첨이 없으면 confirmed 승격 근거로 쓰지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 프로브 행 | ${summary.probe_count} |
| 대상 사업장 | ${summary.project_count} |
| 공식 요약 보강 | ${summary.summary_support_only_count} |
| 외부 확인 필요 확인 | ${summary.external_escalation_needed_count} |
| 해결 완료 | ${summary.resolved_count} |
| 효과 분포 | ${summary.resolution_effect_summary} |

## 프로브 결과

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "source_name", label: "공식 화면" },
  { key: "probe_type", label: "유형" },
  { key: "observed_values", label: "확인값" },
  { key: "public_notice_disclosure_status", label: "고시/별첨 공개상태" },
  { key: "resolution_effect", label: "효과" },
  { key: "remaining_gap", label: "남은 공백" },
  { key: "next_action", label: "다음 행동" },
])}

## 판정

- 광진구 2건은 정보몽땅 사업개요의 면적·건폐율·용적률·층수 등 요약값을 재확인했지만, 정보공개목록의 고시/공고 공개 건수가 0건이라 조합설립인가 고시번호·고시일·첨부 원문은 여전히 외부 확인 대상이다.
- 자양번영로3나길 총 세대수는 공급계획의 세부 칸만 보이고 계 필드가 비어 있어, 합산 후보를 확정값으로 승격하지 않는다.
- 잠실우성4차 관리처분 공사비는 비회원 공개 화면에서 값이 노출되지 않아, 관리처분계획 별첨 또는 공개 가능한 정비사업비 자료 확인이 필요하다.
`;
}

async function main() {
  const sourceRows = JSON.parse(await readFile(INPUT, "utf8"));
  const rows = sourceRows.map(flattenObservation);
  const effectCounts = countBy(rows, "resolution_effect");
  const summary = {
    generated_at: UPDATED_AT,
    probe_count: rows.length,
    project_count: new Set(rows.map((row) => row.rank)).size,
    summary_support_only_count: effectCounts.summary_support_only || 0,
    external_escalation_needed_count: effectCounts.confirms_external_escalation_needed || 0,
    resolved_count: effectCounts.resolved || 0,
    resolution_effect_counts: effectCounts,
    resolution_effect_summary: countText(effectCounts),
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, rows, sourceRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown({ rows, summary }));
  console.log(JSON.stringify({ probes: rows.length, projects: summary.project_count, output: "analysis/high-blocking-public-web-probe.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
