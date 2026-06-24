#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "expansion-official-latest-check-audit.md");
const OUT_CSV = path.join(OUT_DIR, "expansion-official-latest-check-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "expansion-official-latest-check-audit.json");

const INPUTS = {
  intake: "data/review/expansion-official-latest-check-intake.json",
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

const GENERATED_AT = `${kstDate()} KST`;

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

function summarize(rows) {
  return {
    generated_at: GENERATED_AT,
    row_count: rows.length,
    verified_result_count: rows.filter((row) => row.status === "verified_result").length,
    verified_no_result_count: rows.filter((row) => row.status === "verified_no_result").length,
    blocked_direct_popup_count: rows.filter((row) => row.status === "blocked_direct_popup").length,
    gangdong_rows: rows.filter((row) => row.zone_name === "강동권").length,
    yaksu_rows: rows.filter((row) => row.zone_name === "약수동 주변").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# 확장 관심권 공식 최신 확인 감사표

작성 기준: ${summary.generated_at}

이 문서는 강동권/약수권 확장 관심권을 공식 웹에서 직접 다시 확인한 결과를 기록한다. 목표는 현재형 direct hit 여부와 서울도시공간포털 접근 방식을 분리해서 남기는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 확인 행 | ${summary.row_count} |
| 검색 결과 확인 | ${summary.verified_result_count} |
| 검색 0건 확인 | ${summary.verified_no_result_count} |
| popup 직접접근 차단 | ${summary.blocked_direct_popup_count} |
| 강동권 행 | ${summary.gangdong_rows} |
| 약수권 행 | ${summary.yaksu_rows} |

## 확인 결과

${mdTable(rows, [
    { key: "observed_at", label: "확인시각" },
    { key: "zone_name", label: "권역" },
    { key: "search_term", label: "검색/식별자" },
    { key: "status", label: "상태" },
    { key: "result_count", label: "결과수" },
    { key: "finding", label: "확인 사실" },
    { key: "decision_impact", label: "의미" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 운영 규칙

- 서울도시공간포털 정비사업구역계의 \`PMNU4030600001\` 진입 페이지 검색 결과는 현재형 공개 신호 확인에 쓴다.
- \`mapForm.pop?noticeCode=...\`는 식별자 확인용으로는 쓸 수 있지만, 단독 공개 진입 URL로는 쓰지 않는다.
- 약수권에서 \`약수역\` 검색 0건은 현재 확인 시점 기준 direct hit 미확인이라는 뜻이며, adjacent 기준선 자체를 뒤집는 근거로는 쓰지 않는다.
`;
}

async function main() {
  const rows = await readJson(INPUTS.intake);
  const summary = summarize(rows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);

  console.log(JSON.stringify({ rows: rows.length, output: "analysis/expansion-official-latest-check-audit.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
