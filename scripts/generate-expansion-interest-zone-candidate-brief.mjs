#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/research/expansion-interest-zone-candidates.json";
const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "expansion-interest-zone-candidate-brief.json");
const OUT_CSV = path.join(OUT_DIR, "expansion-interest-zone-candidate-brief.csv");
const OUT_MD = path.join(OUT_DIR, "expansion-interest-zone-candidate-brief.md");

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function main() {
  const candidates = JSON.parse(await readFile(INPUT, "utf8"));
  const rows = candidates.map((candidate) => ({
    candidate_id: candidate.candidate_id,
    zone_id: candidate.zone_id,
    zone_name: candidate.zone_name,
    candidate_name: candidate.candidate_name,
    candidate_class: candidate.candidate_class,
    priority: candidate.priority,
    search_scope: candidate.search_scope,
    why_this_seed: candidate.why_this_seed,
    comparison_to_core: candidate.comparison_to_core,
    search_keywords: candidate.search_keywords,
    first_official_channels: candidate.first_official_channels,
    first_official_urls: candidate.first_official_urls,
    bootstrap_status: candidate.bootstrap_status,
    latest_check_at: candidate.latest_check_at || "",
    latest_check_channel: candidate.latest_check_channel || "",
    latest_check_url: candidate.latest_check_url || "",
    latest_hit_status: candidate.latest_hit_status || "",
    latest_search_query: candidate.latest_search_query || "",
    latest_hit_summary: candidate.latest_hit_summary || "",
    latest_next_step: candidate.latest_next_step || "",
    promotion_gate: candidate.promotion_gate,
    next_record_target: candidate.next_record_target,
    caution: candidate.caution,
  }));

  const summary = {
    generated_at: `${kstDate()} KST`,
    seeds: rows.length,
    zones: [...new Set(rows.map((row) => row.zone_name))].length,
    bootstrap_status_mix: countBy(rows, "bootstrap_status"),
    class_mix: countBy(rows, "candidate_class"),
    latest_hit_status_mix: countBy(rows, "latest_hit_status"),
  };

  const grouped = [...new Set(rows.map((row) => row.zone_name))].map((zoneName) => ({
    zone_name: zoneName,
    rows: rows.filter((row) => row.zone_name === zoneName),
  }));

  const md = `# 확장 관심권 후보 사업장 브리프

작성 기준: ${summary.generated_at}

이 문서는 강동권과 약수동 주변을 아직 공식 사업장으로 확정하기 전 단계에서, 어떤 검색 seed를 먼저 공식 원문 채널에 태울지 정리한 작업표다. 여기 적힌 항목은 \`search_seed_only\` 상태이며, 고시번호·고시일·원문 URL·공식 사업명 확인 전까지 비교표 사업장으로 승격하지 않는다.

## 요약

- 후보 seed: ${summary.seeds}
- 권역 수: ${summary.zones}
- 상태 분포: ${summary.bootstrap_status_mix.map((row) => `${row.name} ${row.count}`).join("; ")}
- 분류 분포: ${summary.class_mix.map((row) => `${row.name} ${row.count}`).join("; ")}
- 최근 공식 hit 분포: ${summary.latest_hit_status_mix.map((row) => `${row.name} ${row.count}`).join("; ")}

## 권역별 seed

${grouped
  .map(
    (group) => `### ${group.zone_name}

${mdTable(group.rows, [
      { key: "priority", label: "우선" },
      { key: "candidate_name", label: "후보 seed" },
      { key: "candidate_class", label: "분류" },
      { key: "search_scope", label: "검색 범위" },
      { key: "search_keywords", label: "검색 키워드" },
      { key: "first_official_channels", label: "먼저 볼 공식 채널" },
      { key: "first_official_urls", label: "공식 URL" },
      { key: "promotion_gate", label: "승격 gate" },
    ])}

#### 최근 공식 포털 확인

${mdTable(group.rows, [
      { key: "candidate_name", label: "후보 seed" },
      { key: "latest_hit_status", label: "상태" },
      { key: "latest_check_at", label: "최근 확인" },
      { key: "latest_search_query", label: "조회 키워드" },
      { key: "latest_hit_summary", label: "확인된 공식 hit" },
      { key: "latest_next_step", label: "다음 단계" },
    ])}`,
  )
  .join("\n\n")}

## 운영 원칙

1. 이 문서는 공식 사업장 목록이 아니라 검색 seed 목록이다.
2. 자치구 고시공고, 서울도시공간포털, 정비사업 정보몽땅 중 하나에서 공식 사업명이나 고시 식별자가 잡히기 전에는 \`search_seed_only\`로 유지한다.
3. seed 결과는 \`data/review/official-source-activation-intake.json\` 또는 \`data/review/official-update-intake.json\`에 먼저 기록하고, 공식 원문이 확보되면 기존 source verification 루프로 보낸다.
4. 약수-옥수/한남 경계축 같은 비교군은 사업장 후보가 아니라 규제·보행 context 축이므로 project 표와 직접 합치지 않는다.
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(
    JSON.stringify(
      {
        seeds: rows.length,
        output: "analysis/expansion-interest-zone-candidate-brief.{md,csv,json}",
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
