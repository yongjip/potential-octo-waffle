#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/research/expansion-interest-zone-shortlist.json";
const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "expansion-interest-zone-shortlist.json");
const OUT_CSV = path.join(OUT_DIR, "expansion-interest-zone-shortlist.csv");
const OUT_MD = path.join(OUT_DIR, "expansion-interest-zone-shortlist.md");

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
  const shortlist = JSON.parse(await readFile(INPUT, "utf8"));
  const rows = shortlist.map((row) => ({
    shortlist_id: row.shortlist_id,
    zone_id: row.zone_id,
    zone_name: row.zone_name,
    seed_ref: row.seed_ref,
    corridor_bucket: row.corridor_bucket,
    candidate_type: row.candidate_type,
    shortlist_priority: row.shortlist_priority,
    project_name: row.project_name,
    location: row.location,
    notice_no: row.notice_no,
    notice_date: row.notice_date,
    urban_notice_code: row.urban_notice_code || "",
    urban_notice_title: row.urban_notice_title || "",
    notice_org: row.notice_org,
    official_channel: row.official_channel,
    official_url: row.official_url,
    tracked_update_id: row.tracked_update_id || "",
    evidence_status: row.evidence_status,
    fit_reason: row.fit_reason,
    transit_positioning: row.transit_positioning,
    promotion_readiness: row.promotion_readiness,
    main_risk: row.main_risk,
    next_gate: row.next_gate,
    next_action: row.next_action,
  }));

  const summary = {
    generated_at: `${kstDate()} KST`,
    shortlist_count: rows.length,
    zone_count: [...new Set(rows.map((row) => row.zone_name))].length,
    type_mix: countBy(rows, "candidate_type"),
    readiness_mix: countBy(rows, "promotion_readiness"),
    priority_mix: countBy(rows, "shortlist_priority"),
  };

  const grouped = [...new Set(rows.map((row) => row.zone_name))].map((zoneName) => ({
    zone_name: zoneName,
    rows: rows.filter((row) => row.zone_name === zoneName),
  }));

  const md = `# 확장 관심권 공식 hit shortlist

작성 기준: ${summary.generated_at}

이 문서는 확장 관심권 후보 seed 가운데 서울도시공간포털 정비사업구역계 카드에서 공식 사업명, 고시번호, 고시일이 확인된 행만 따로 모은 shortlist다. 핵심 생활권 비교표에 바로 합치는 용도가 아니라, direct 후보와 adjacent 후보를 분리하고 다음 원문 확보 순서를 정하는 작업면이다.

## 요약

- shortlist 행: ${summary.shortlist_count}
- 권역 수: ${summary.zone_count}
- 후보 유형: ${summary.type_mix.map((row) => `${row.name} ${row.count}`).join("; ")}
- 승격 준비도: ${summary.readiness_mix.map((row) => `${row.name} ${row.count}`).join("; ")}
- 우선도: ${summary.priority_mix.map((row) => `${row.name} ${row.count}`).join("; ")}

## 권역별 shortlist

${grouped
  .map(
    (group) => `### ${group.zone_name}

${mdTable(group.rows, [
      { key: "shortlist_priority", label: "우선" },
      { key: "candidate_type", label: "유형" },
      { key: "project_name", label: "사업장" },
      { key: "notice_no", label: "고시번호" },
      { key: "notice_date", label: "고시일" },
      { key: "location", label: "위치" },
      { key: "transit_positioning", label: "교통/생활권 포지션" },
      { key: "promotion_readiness", label: "승격 준비도" },
      { key: "main_risk", label: "핵심 리스크" },
    ])}

#### 다음 원문 확보 순서

${mdTable(group.rows, [
      { key: "project_name", label: "사업장" },
      { key: "tracked_update_id", label: "intake ID" },
      { key: "urban_notice_code", label: "noticeCode" },
      { key: "urban_notice_title", label: "실제 고시 제목" },
      { key: "fit_reason", label: "왜 남겼는가" },
      { key: "next_gate", label: "승격 gate" },
      { key: "next_action", label: "다음 행동" },
    ])}`,
  )
  .join("\n\n")}

## 운영 규칙

1. 이 shortlist는 공식 카드 확인 목록이지, 확정 투자 후보 목록이 아니다.
2. \`notice_card_verified\`는 고시번호·고시일·사업명 카드 확인만 뜻한다. 원문 첨부, 상세 단계, 비용 수치, 정보몽땅 자료는 별도 확보가 필요하다.
3. \`direct_project\`는 확장 관심권과 바로 맞닿는 후보, \`adjacent_project\`는 인접 비교군, \`context_project\`는 보조 검증용이다.
4. 핵심 생활권 비교 체계에 올리기 전에는 자치구 고시공고나 정보몽땅에서 같은 사업장을 다시 확인하고, 필요하면 현장 답사로 역접근·경사·간선도로 단절을 검증한다.
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(
    JSON.stringify(
      {
        shortlist: rows.length,
        output: "analysis/expansion-interest-zone-shortlist.{md,csv,json}",
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
