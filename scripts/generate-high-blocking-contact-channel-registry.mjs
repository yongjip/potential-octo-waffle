#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/review/high-blocking-contact-channel-registry.json";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-contact-channel-registry.md");
const OUT_CSV = path.join(OUT_DIR, "high-blocking-contact-channel-registry.csv");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-contact-channel-registry.json");

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

function flattenChannel(row) {
  return {
    channel_id: row.channel_id,
    jurisdiction: row.jurisdiction,
    channel_type: row.channel_type,
    channel_name: row.channel_name,
    route_priority: row.route_priority,
    project_ranks: (row.project_ranks || []).join("; "),
    project_names: (row.project_names || []).join("; "),
    official_url: row.official_url,
    request_scope: row.request_scope,
    public_contact_hint: row.public_contact_hint,
    privacy_rule: row.privacy_rule,
    value_promotion_rule: row.value_promotion_rule,
    response_intake_file: row.response_intake_file,
    decision_draft_output: row.decision_draft_output,
    official_page_evidence: row.official_page_evidence,
  };
}

function projectCoverage(rows) {
  const byRank = new Map();
  for (const row of rows) {
    for (const rank of row.project_ranks || []) {
      const current = byRank.get(rank) || {
        rank,
        project_name: "",
        channel_count: 0,
        primary_channels: [],
      };
      current.project_name = row.project_names?.[row.project_ranks.indexOf(rank)] || current.project_name;
      current.channel_count += 1;
      if (Number(row.route_priority) <= 2) current.primary_channels.push(row.channel_name);
      byRank.set(rank, current);
    }
  }
  return [...byRank.values()].sort((a, b) => Number(a.rank) - Number(b.rank));
}

function markdown({ rows, flatRows, summary, usageRules, coverageRows }) {
  return `# High Blocking 문의 채널 레지스트리

작성 기준: ${UPDATED_AT}

이 문서는 high blocking 잔여 원문 확인 패킷을 어느 공식 채널로 보낼지 고정한다. 여기의 채널 정보는 라우팅 근거이며, 사업 수치나 고시 정보를 확정하는 근거가 아니다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 채널 수 | ${summary.channel_count} |
| 관할 수 | ${summary.jurisdiction_count} |
| 대상 사업장 | ${summary.project_count} |
| 채널 유형 | ${summary.channel_type_summary} |
| 관할 분포 | ${summary.jurisdiction_summary} |

## 사용 규칙

${usageRules.map((rule) => `- ${rule}`).join("\n")}

## 사업장별 채널 커버리지

${mdTable(
  coverageRows.map((row) => ({
    ...row,
    primary_channels: row.primary_channels.join("; "),
  })),
  [
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "channel_count", label: "채널 수" },
    { key: "primary_channels", label: "우선 채널" },
  ],
)}

## 채널 목록

${mdTable(flatRows, [
  { key: "channel_id", label: "ID" },
  { key: "jurisdiction", label: "관할" },
  { key: "channel_type", label: "유형" },
  { key: "channel_name", label: "채널" },
  { key: "route_priority", label: "순서" },
  { key: "project_ranks", label: "대상" },
  { key: "request_scope", label: "문의 범위" },
  { key: "public_contact_hint", label: "접수 힌트" },
  { key: "official_url", label: "공식 URL" },
])}

## 값 승격 경계

${mdTable(flatRows, [
  { key: "channel_id", label: "ID" },
  { key: "privacy_rule", label: "개인정보/저장 규칙" },
  { key: "value_promotion_rule", label: "값 승격 규칙" },
  { key: "response_intake_file", label: "회신 입력" },
  { key: "decision_draft_output", label: "decision 초안" },
])}
`;
}

async function main() {
  const source = JSON.parse(await readFile(INPUT, "utf8"));
  const rows = source.channels || [];
  const flatRows = rows.map(flattenChannel);
  const jurisdictionCounts = countBy(rows, "jurisdiction");
  const channelTypeCounts = countBy(rows, "channel_type");
  const coverageRows = projectCoverage(rows);
  const summary = {
    generated_at: UPDATED_AT,
    channel_count: rows.length,
    jurisdiction_count: Object.keys(jurisdictionCounts).length,
    project_count: coverageRows.length,
    jurisdiction_counts: jurisdictionCounts,
    channel_type_counts: channelTypeCounts,
    jurisdiction_summary: countText(jurisdictionCounts),
    channel_type_summary: countText(channelTypeCounts),
    output: [OUT_MD, OUT_CSV, OUT_JSON],
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ generated_at: UPDATED_AT, summary, usage_rules: source.usage_rules || [], rows, flatRows, coverageRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(flatRows));
  await writeFile(OUT_MD, markdown({ rows, flatRows, summary, usageRules: source.usage_rules || [], coverageRows }));
  console.log(JSON.stringify({ channels: rows.length, projects: coverageRows.length, output: "analysis/high-blocking-contact-channel-registry.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
