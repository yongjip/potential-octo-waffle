#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "expansion-market-first-download-packet.md");
const OUT_CSV = path.join(OUT_DIR, "expansion-market-first-download-packet.csv");
const OUT_JSON = path.join(OUT_DIR, "expansion-market-first-download-packet.json");

const INPUT = "analysis/expansion-market-scope-workbook.json";

const SOURCE_ORDER = [
  "seoul-open-data",
  "molit-apt-trade",
  "molit-apt-rent",
  "molit-rowhouse-trade",
  "molit-rowhouse-rent",
];

const SOURCE_LABELS = {
  "seoul-open-data": "서울시 실거래",
  "molit-apt-trade": "국토부 아파트 매매",
  "molit-apt-rent": "국토부 아파트 전월세",
  "molit-rowhouse-trade": "국토부 연립·다세대 매매",
  "molit-rowhouse-rent": "국토부 연립·다세대 전월세",
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function compact(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].join("; ");
}

function priorityValue(text) {
  if (text === "high") return 3;
  if (text === "medium") return 2;
  if (text === "low") return 1;
  return 0;
}

function marketRoleValue(text) {
  if (text === "direct_baseline") return 4;
  if (text === "adjacent_baseline") return 3;
  if (text === "adjacent_corridor_baseline") return 2;
  if (text === "edge_context_baseline") return 1;
  return 0;
}

function phaseForScope(scope) {
  if (scope.market_role === "direct_baseline") return "phase_1_direct_latest_window";
  if (scope.market_role === "adjacent_baseline" || scope.market_role === "adjacent_corridor_baseline") {
    return "phase_2_adjacent_latest_window";
  }
  return "phase_3_edge_latest_window";
}

function phaseLabel(phase) {
  if (phase === "phase_1_direct_latest_window") return "1차 direct 최신분";
  if (phase === "phase_2_adjacent_latest_window") return "2차 adjacent 최신분";
  if (phase === "phase_3_edge_latest_window") return "3차 edge 최신분";
  return phase;
}

function noteForScope(scope) {
  if (scope.dong === "금호동") return "금호동1가~4가 포함 여부를 수동 확인";
  if (scope.dong === "옥수동") return "edge context 비교군으로만 유지";
  if (scope.dong === "길동") return "신동아1·2차와 길동 43번지 generic 카드를 구분";
  return "dong-level baseline만 먼저 확보";
}

function detailForScope(scope, latestRows) {
  const filenames = SOURCE_ORDER.map((source) => latestRows.find((row) => row.source === source)?.suggested_output_filename || "")
    .filter(Boolean);
  return {
    source_order: SOURCE_ORDER.map((source) => SOURCE_LABELS[source]).join(" -> "),
    suggested_filenames: compact(filenames),
    raw_task_count: latestRows.length,
    latest_window: compact(latestRows.map((row) => `${row.coverage_from}~${row.coverage_to}`)),
  };
}

async function main() {
  const workbook = await readJson(INPUT);
  const summary = workbook.summary || {};
  const scopeRows = workbook.scopeRows || [];
  const downloadRows = workbook.downloadRows || [];
  const latestWindow = summary.latest_window || "";

  const latestRows = downloadRows.filter((row) => row.coverage_to === latestWindow);
  const latestByScope = new Map();
  for (const row of latestRows) {
    const list = latestByScope.get(row.scope_ref) || [];
    list.push(row);
    latestByScope.set(row.scope_ref, list);
  }

  const packetRows = scopeRows
    .map((scope) => {
      const scopeLatestRows = (latestByScope.get(scope.scope_id) || []).sort(
        (a, b) => SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source),
      );
      const detail = detailForScope(scope, scopeLatestRows);
      const phase = phaseForScope(scope);
      const score =
        marketRoleValue(scope.market_role) * 100 +
        priorityValue(scope.candidate_priority) * 10 +
        Number(scope.shortlist_count || 0);
      return {
        packet_rank: 0,
        phase,
        phase_label: phaseLabel(phase),
        priority_score: score,
        zone_name: scope.zone_name,
        district: scope.district,
        dong: scope.dong,
        market_role: scope.market_role,
        candidate_priority: scope.candidate_priority,
        shortlist_count: scope.shortlist_count,
        representative_projects: scope.representative_projects,
        shortlist_project_names: scope.shortlist_project_names,
        shortlist_notice_refs: scope.shortlist_notice_refs,
        latest_window: detail.latest_window,
        raw_task_count: detail.raw_task_count,
        source_order: detail.source_order,
        suggested_filenames: detail.suggested_filenames,
        current_state: `${scope.current_manifest_coverage}; 정규화 거래 ${scope.normalized_transaction_rows}행`,
        first_question: scope.first_market_questions,
        note: noteForScope(scope),
        after_download_next_step:
          scope.market_role === "edge_context_baseline"
            ? "수치가 들어와도 direct/adjacent 승격 없이 context edge 비교군으로만 유지"
            : "수집 후 dong-level 거래량/가격 방향만 먼저 보고, 사업장 단계 해석과 분리 유지",
      };
    })
    .sort((a, b) => Number(b.priority_score || 0) - Number(a.priority_score || 0) || a.dong.localeCompare(b.dong, "ko"))
    .map((row, index) => ({ ...row, packet_rank: index + 1 }));

  const backfillRows = packetRows.map((row) => ({
    packet_rank: row.packet_rank,
    phase_label: row.phase_label,
    zone_name: row.zone_name,
    district: row.district,
    dong: row.dong,
    backfill_windows: "202401~202412; 202501~202512",
    backfill_raw_task_count: 10,
    rule: row.phase === "phase_3_edge_latest_window" ? "latest window 확인 후에도 필요할 때만 backfill" : "최신분 확인 후 historic backfill 진행",
  }));

  const latestTaskRows = latestRows
    .sort((a, b) => {
      const packetA = packetRows.find((row) => row.dong === a.dong && row.district === a.district);
      const packetB = packetRows.find((row) => row.dong === b.dong && row.district === b.district);
      const rankA = Number(packetA?.packet_rank || 999);
      const rankB = Number(packetB?.packet_rank || 999);
      if (rankA !== rankB) return rankA - rankB;
      return SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source);
    })
    .map((row) => ({
      packet_rank: packetRows.find((packet) => packet.dong === row.dong && packet.district === row.district)?.packet_rank || "",
      phase_label: packetRows.find((packet) => packet.dong === row.dong && packet.district === row.district)?.phase_label || "",
      task_id: row.task_id,
      source: row.source,
      source_kind: row.source_kind,
      district: row.district,
      dong: row.dong,
      lawd_cd: row.lawd_cd,
      representative_projects: row.representative_projects,
      coverage: `${row.coverage_from}~${row.coverage_to}`,
      coverage_from: row.coverage_from,
      coverage_to: row.coverage_to,
      suggested_output_filename: row.suggested_output_filename,
      required_filter: row.required_filter,
      note: row.note,
    }));

  const phaseCounts = packetRows.reduce((acc, row) => {
    acc[row.phase_label] = (acc[row.phase_label] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    summary: {
      generated_at: `${kstDate()} KST`,
      latest_window: latestWindow,
      packet_row_count: packetRows.length,
      latest_raw_task_count: latestRows.length,
      phase_summary: Object.entries(phaseCounts)
        .map(([label, count]) => `${label} ${count}`)
        .join("; "),
      phase_1_scope_count: packetRows.filter((row) => row.phase === "phase_1_direct_latest_window").length,
      phase_2_scope_count: packetRows.filter((row) => row.phase === "phase_2_adjacent_latest_window").length,
      phase_3_scope_count: packetRows.filter((row) => row.phase === "phase_3_edge_latest_window").length,
      inputs: [INPUT],
      outputs: [OUT_MD, OUT_CSV, OUT_JSON],
    },
    packetRows,
    latestTaskRows,
    backfillRows,
  };

  const csvRows = [
    ...packetRows.map((row) => ({
      section: "packet",
      item: `${row.packet_rank}. ${row.district} ${row.dong}`,
      priority: row.phase_label,
      file: "analysis/expansion-market-first-download-packet.md",
      action: row.source_order,
      note: row.note,
    })),
    ...latestTaskRows.map((row) => ({
      section: "latest_task",
      item: `${row.district} ${row.dong} / ${row.source}`,
      priority: row.phase_label,
      file: row.suggested_output_filename,
      action: row.required_filter,
      note: row.note,
    })),
  ];

  const md = `# 확장권 시장 1차 다운로드 패킷

작성 기준: ${payload.summary.generated_at}

이 문서는 ${fileLink("analysis/expansion-market-scope-workbook.md")}의 90개 raw task를 바로 실행 가능한 최신 window 우선 패킷으로 압축한 generated 실행표다. 원칙은 단순하다. 강동권 direct baseline을 먼저, 약수권 adjacent baseline을 다음, 옥수 edge context는 마지막에 둔다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 최신 window | ${payload.summary.latest_window} |
| packet row | ${payload.summary.packet_row_count} |
| 최신 window raw task | ${payload.summary.latest_raw_task_count} |
| 1차 direct 최신분 | ${payload.summary.phase_1_scope_count} |
| 2차 adjacent 최신분 | ${payload.summary.phase_2_scope_count} |
| 3차 edge 최신분 | ${payload.summary.phase_3_scope_count} |

현재는 확장권 거래 데이터가 0행이므로, 제일 먼저 닫아야 할 것은 최신 window 202601~202606 baseline이다. 바로 2024~2025부터 거꾸로 다 받지 말고, 최신 6개월분으로 direct/adjacent 반응 유무를 먼저 확인한 뒤 backfill로 내려가는 편이 맞다.

## 패킷 순서

${mdTable(packetRows, [
  { key: "packet_rank", label: "순서" },
  { key: "phase_label", label: "패킷" },
  { key: "zone_name", label: "권역" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "market_role", label: "역할" },
  { key: "raw_task_count", label: "latest task" },
  { key: "representative_projects", label: "대표 기준" },
])}

## 순서 해석

- 1차는 강동권 천호동-성내동-길동이다. 잠실/송파 동측 연장축과 직접 맞닿아 있어 네 생활권 연구 질문과 가장 가깝다.
- 2차는 약수권 신당동-금호동이다. direct hit는 없지만 adjacent baseline으로 충분히 의미가 있다.
- 3차는 옥수동이다. 아직 project 후보가 아니라 edge context이므로 최신분만 확인하고 보류할 수 있다.

## packet 상세

${packetRows
  .map(
    (row) => `### ${row.packet_rank}. ${row.district} ${row.dong} (${row.phase_label})

- 권역/역할: ${row.zone_name} / ${row.market_role}
- 대표 기준: ${row.representative_projects}
- shortlist: ${row.shortlist_project_names || "없음"}
- 최신 window: ${row.latest_window}
- source 순서: ${row.source_order}
- 제안 파일명: ${row.suggested_filenames}
- 현재 상태: ${row.current_state}
- 이번에 확인할 질문: ${row.first_question}
- 주의: ${row.note}
- 수집 후 다음 단계: ${row.after_download_next_step}
`,
  )
  .join("\n")}

## 최신 window raw task

${mdTable(latestTaskRows, [
  { key: "packet_rank", label: "순서" },
  { key: "source", label: "source" },
  { key: "district", label: "자치구" },
  { key: "dong", label: "법정동" },
  { key: "coverage", label: "기간" },
  { key: "suggested_output_filename", label: "파일명" },
])}

## backfill 규칙

${mdTable(backfillRows, [
  { key: "packet_rank", label: "순서" },
  { key: "dong", label: "법정동" },
  { key: "backfill_windows", label: "후속 기간" },
  { key: "backfill_raw_task_count", label: "후속 task" },
  { key: "rule", label: "규칙" },
])}

## 같이 열 파일

1. ${fileLink("analysis/expansion-market-scope-workbook.md")}
2. ${fileLink("analysis/life-area-market-reaction-brief.md")}
3. ${fileLink("analysis/expansion-zone-weekly-monitoring-cockpit.md")}
4. ${fileLink("analysis/current-research-operating-guide.md")}
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_MD, `${md}\n`);

  console.log(
    JSON.stringify(
      {
        packet_rows: packetRows.length,
        latest_raw_tasks: latestRows.length,
        output: "analysis/expansion-market-first-download-packet.{md,csv,json}",
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
