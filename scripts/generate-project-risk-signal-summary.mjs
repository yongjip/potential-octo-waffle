#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const TRANSPORT_INPUT = "analysis/transport-location-context.csv";
const BOARD_QUEUE_INPUT = "analysis/cleanup-board-review-queue.json";
const OUT_JSON = "analysis/project-risk-signal-summary.json";
const OUT_CSV = "analysis/project-risk-signal-summary.csv";
const OUT_MD = "analysis/project-risk-signal-summary.md";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...dataRows] = rows;
  if (!headers) return [];
  return dataRows
    .filter((dataRow) => dataRow.some((value) => value !== ""))
    .map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""])));
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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function shortTitle(value, length = 64) {
  const text = String(value ?? "");
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function numeric(value) {
  const text = String(value ?? "").replaceAll(",", "");
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function queueByRank(rows) {
  const byRank = new Map();
  for (const row of rows) {
    const key = String(row.rank);
    if (!byRank.has(key)) byRank.set(key, []);
    byRank.get(key).push(row);
  }
  return byRank;
}

function transportByRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function countPriority(items, priority) {
  return items.filter((item) => item.review_priority === priority).length;
}

function riskLevel(row, items) {
  const p0 = countPriority(items, "P0");
  const p1 = countPriority(items, "P1");
  if (row.fact_check_priority === "very_high" || p0 >= 3) return "very_high";
  if (["notice_record_needed", "gu_text_review", "original_notice_fact_checked"].includes(row.fact_check_priority) || p0 > 0 || p1 >= 3) {
    return "high";
  }
  if (p1 > 0 || row.fact_check_priority === "high") return "medium";
  return "watch";
}

function signalGroups(items) {
  return unique(
    items
      .filter((item) => ["P0", "P1"].includes(item.review_priority))
      .flatMap((item) => String(item.signal_group || "").split(";").map((part) => part.trim())),
  ).join("; ");
}

function topItems(items) {
  return items
    .filter((item) => ["P0", "P1"].includes(item.review_priority))
    .slice(0, 3)
    .map((item) => `${item.review_priority} ${item.item_date || "미상"} ${shortTitle(item.title, 70)}`)
    .join(" / ");
}

function keyRiskHypothesis(row, transport, items) {
  const groups = signalGroups(items);
  if (groups.includes("비용·분담금") && groups.includes("기반시설")) {
    return "공공기여·기반시설 조건이 비용/분담금 리스크와 직접 연결되는 사업";
  }
  if (groups.includes("이주·착공 전")) return "관리처분 이후 이주·철거·착공 전환 리스크 확인 필요";
  if (groups.includes("인가·고시")) return "정비계획/고시 변경 신호를 원문과 대조해야 하는 사업";
  if (groups.includes("기반시설")) return "도로·공원·전력·공공시설 등 기반시설 조건이 장기 입지 판단의 핵심";
  if (row.fact_check_priority === "notice_record_needed") return "사업구역 레이어와 단계 정보는 있으나 결정고시 recordCode 연결이 병목";
  if (row.fact_check_priority === "original_notice_fact_checked") return "본고시 원문은 확보됐고 수치 승격/정정고시 대조가 다음 병목";
  if (transport?.mobility_risks) return transport.mobility_risks;
  return row.risk_notes || "공개항목과 공식 원문을 주기적으로 대조";
}

function nextAction(row, transport, items) {
  const groups = signalGroups(items);
  if (groups.includes("비용·분담금")) return "분담금/사업비 공개 항목과 고시 원문 수치, 사업별 메모의 비용 리스크를 대조";
  if (groups.includes("기반시설")) return "기반시설 입찰 제목을 결정조서·공공기여·교통입지 컨텍스트와 연결";
  if (groups.includes("이주·착공 전")) return "이주비/HUG/명도/범죄예방 항목을 관리처분 일정과 연결";
  if (row.fact_check_priority === "notice_record_needed") return "서울도시공간포털 recordCode 또는 자치구 인가 원문을 추가 확인";
  if (row.fact_check_priority === "original_notice_fact_checked") return "서울시보 본고시 수치를 비교 매트릭스 확정 수치로 승격";
  return transport?.next_transport_action || row.next_action;
}

function sortRows(rows) {
  const levelOrder = { very_high: 0, high: 1, medium: 2, watch: 3 };
  return rows.sort(
    (a, b) =>
      (levelOrder[a.risk_signal_level] ?? 9) - (levelOrder[b.risk_signal_level] ?? 9) ||
      Number(b.p0_count) - Number(a.p0_count) ||
      Number(b.p1_count) - Number(a.p1_count) ||
      Number(a.rank) - Number(b.rank),
  );
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
      acc[row[field] || ""] = (acc[row[field] || ""] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
}

function markdown(rows) {
  const top = rows.slice(0, 40);
  const byLevel = countBy(rows, "risk_signal_level");
  const byFocus = countBy(rows, "focus_area");
  return `# 사업장별 리스크 신호 요약

작성 기준: ${new Date().toISOString()}

이 문서는 우선검토 후보 30개를 사업장 단위로 비교하기 위해 공식 원문 커버리지, 정보몽땅 공개 항목 검토 큐, 교통입지 컨텍스트를 결합한 요약표다. 투자 판단이 아니라 리서치 우선순위를 정하기 위한 작업 큐다.

## 요약

| 항목 | 값 |
| --- | --- |
| 대상 사업장 | ${rows.length} |
| P0 공개항목 보유 사업장 | ${rows.filter((row) => Number(row.p0_count) > 0).length} |
| P1 이상 공개항목 보유 사업장 | ${rows.filter((row) => Number(row.p0_count) + Number(row.p1_count) > 0).length} |

## 리스크 레벨

${mdTable(byLevel, [
  { key: "name", label: "레벨" },
  { key: "count", label: "사업장 수" },
])}

## 생활권별

${mdTable(byFocus, [
  { key: "name", label: "생활권" },
  { key: "count", label: "사업장 수" },
])}

## 우선 비교 사업장

${mdTable(top, [
  { key: "risk_signal_level", label: "레벨" },
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "current_stage", label: "단계" },
  { key: "p0_count", label: "P0" },
  { key: "p1_count", label: "P1" },
  { key: "signal_groups", label: "신호" },
  { key: "location_context_score", label: "입지" },
  { key: "key_risk_hypothesis", label: "핵심 가설" },
  { key: "next_action", label: "다음 확인" },
])}

## 사용법

1. \`very_high\`와 \`high\`는 사업별 메모에 먼저 반영한다.
2. P0/P1 신호가 비용·분담금 또는 기반시설이면 고시 원문, 결정조서, 교통입지 컨텍스트를 같이 본다.
3. 이주·착공 전 신호는 관리처분인가 사업의 일정 리스크로 따로 추적한다.
4. 광진권처럼 recordCode나 원문 연결이 병목인 사업은 리스크 신호보다 공식 근거 보강을 먼저 처리한다.
`;
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const transportRows = parseCsv(await readFile(TRANSPORT_INPUT, "utf8"));
  const boardQueueRows = JSON.parse(await readFile(BOARD_QUEUE_INPUT, "utf8"));
  const transport = transportByRank(transportRows);
  const boardQueue = queueByRank(boardQueueRows);

  const rows = sortRows(
    matrixRows.map((row) => {
      const rank = String(row.rank);
      const items = boardQueue.get(rank) ?? [];
      const transportRow = transport.get(rank) ?? {};
      const p0Count = countPriority(items, "P0");
      const p1Count = countPriority(items, "P1");
      return {
        rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        current_stage: row.current_stage,
        stage_bucket: row.stage_bucket,
        fact_check_priority: row.fact_check_priority,
        source_coverage_score: row.source_coverage_score,
        text_coverage: row.text_coverage,
        location_context_score: transportRow.location_context_score ?? "",
        mobility_axis: transportRow.mobility_axis ?? "",
        mobility_risks: transportRow.mobility_risks ?? "",
        long_term_thesis: transportRow.long_term_thesis ?? "",
        p0_count: p0Count,
        p1_count: p1Count,
        p2_count: countPriority(items, "P2"),
        p3_count: countPriority(items, "P3"),
        top_signal_score: items[0]?.signal_score ?? "",
        signal_groups: signalGroups(items),
        top_public_items: topItems(items),
        risk_signal_level: riskLevel(row, items),
        key_risk_hypothesis: keyRiskHypothesis(row, transportRow, items),
        next_action: nextAction(row, transportRow, items),
        project_note: row.project_note,
      };
    }),
  );

  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        very_high: rows.filter((row) => row.risk_signal_level === "very_high").length,
        high: rows.filter((row) => row.risk_signal_level === "high").length,
        output: "analysis/project-risk-signal-summary.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
