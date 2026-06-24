#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT_SCOPE = "data/market/expansion-market-areas.json";
const INPUT_TX = "data/market/transactions/expansion-manual-official-transactions-normalized.json";
const INPUT_MATCH = "data/market/transactions/expansion-manual-official-transactions-project-matches.json";
const OUT_MD = "analysis/expansion-market-normalized-summary.md";
const OUT_CSV = "analysis/expansion-market-normalized-summary.csv";
const OUT_JSON = "analysis/expansion-market-normalized-summary.json";

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

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
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

function matchesDong(txDong, scopeDong) {
  const dong = String(txDong || "").trim();
  const scope = String(scopeDong || "").trim();
  if (!dong || !scope) return false;
  if (dong === scope) return true;
  if (scope === "금호동" && /^금호동[1-4]가$/.test(dong)) return true;
  return false;
}

async function main() {
  const [scopeRows, transactions, matches] = await Promise.all([
    readJson(INPUT_SCOPE, []),
    readJson(INPUT_TX, []),
    readJson(INPUT_MATCH, []),
  ]);

  const scopeSummaryRows = scopeRows.map((scope) => {
    const txRows = transactions.filter((row) => row.lawd_cd === scope.lawd_cd && matchesDong(row.legal_dong, scope.dong));
    const matchRows = matches.filter((row) => row.lawd_cd === scope.lawd_cd && matchesDong(row.legal_dong, scope.dong));
    const sourceMix = countText(countBy(txRows, "source"));
    const months = unique(txRows.map((row) => String(row.deal_ymd || "").slice(0, 6))).sort();
    return {
      zone_name: scope.zone_name,
      district: scope.district,
      dong: scope.dong,
      representative_projects: scope.representative_projects,
      normalized_transaction_rows: txRows.length,
      project_match_rows: matchRows.length,
      source_mix: sourceMix,
      month_span: months.length ? `${months[0]}~${months[months.length - 1]}` : "",
      month_count: months.length,
      latest_window_rows: txRows.filter((row) => String(row.deal_ymd || "").startsWith("2026")).length,
      status: txRows.length ? "latest_window_normalized_present" : "not_yet_normalized",
    };
  });

  const summary = {
    generated_at: `${kstDate()} KST`,
    scope_count: scopeRows.length,
    normalized_transaction_rows: transactions.length,
    project_match_rows: matches.length,
    scopes_with_rows: scopeSummaryRows.filter((row) => row.normalized_transaction_rows > 0).length,
    source_summary: countText(countBy(transactions, "source")),
    dong_summary: countText(countBy(scopeSummaryRows.filter((row) => row.normalized_transaction_rows > 0), "dong")),
    inputs: [INPUT_SCOPE, INPUT_TX, INPUT_MATCH],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
  const introLine =
    summary.scopes_with_rows === summary.scope_count
      ? "확장권 latest-window 30개 수동 다운로드 파일이 모두 정규화돼 6개 scope에 값이 들어온 상태다."
      : `현재는 ${scopeSummaryRows.filter((row) => row.normalized_transaction_rows > 0).map((row) => row.dong).join("·")} 범위까지만 반영된 상태다.`;

  await mkdir(path.dirname(OUT_MD), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows: scopeSummaryRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(scopeSummaryRows));
  await writeFile(
    OUT_MD,
    `# 확장권 시장 정규화 요약

작성 기준: ${summary.generated_at}

확장권 latest-window 수동 다운로드 파일을 정규화한 뒤, dong-level baseline별로 실제 몇 행이 들어왔는지 요약한다. ${introLine}

## 요약

| 항목 | 값 |
| --- | ---: |
| scope | ${summary.scope_count} |
| 정규화 거래 행 | ${summary.normalized_transaction_rows} |
| project match 행 | ${summary.project_match_rows} |
| 값이 들어온 scope | ${summary.scopes_with_rows} |
| source 분포 | ${summary.source_summary} |

## scope별 상태

${mdTable(scopeSummaryRows, [
      { key: "zone_name", label: "권역" },
      { key: "district", label: "자치구" },
      { key: "dong", label: "법정동" },
      { key: "normalized_transaction_rows", label: "정규화 거래 행" },
      { key: "project_match_rows", label: "project match" },
      { key: "source_mix", label: "source 분포" },
      { key: "month_span", label: "월 범위" },
      { key: "status", label: "상태" },
    ])}
`,
  );
  console.log(JSON.stringify({
    normalized_transaction_rows: transactions.length,
    scopes_with_rows: summary.scopes_with_rows,
    output: "analysis/expansion-market-normalized-summary.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
