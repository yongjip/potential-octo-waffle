#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-context-search-queue.md");
const OUT_CSV = path.join(OUT_DIR, "official-context-search-queue.csv");
const OUT_JSON = path.join(OUT_DIR, "official-context-search-queue.json");

const INPUTS = {
  catalystMap: "analysis/public-development-catalyst-map.json",
  catalystTriggerMatrix: "analysis/catalyst-trigger-matrix.json",
  sourceActivationChecklist: "analysis/official-source-activation-checklist.json",
  contextSources: "analysis/official-context-sources.csv",
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers = [], ...body] = rows.filter((items) => items.some((item) => item !== ""));
  return body.map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ""])));
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

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function compact(items, limit = 5) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function sourceKeysForCatalyst(row) {
  const name = `${row.catalyst_name || ""} ${row.official_documents_to_check || ""}`;
  const keys = new Set(["seoul_citybuild", "opengov"]);
  if (/교통|환승|역|도로|보행|MICE|터미널|강변|잠실/.test(name)) keys.add("seoul_traffic");
  if (/고시|결정|지구단위|정비계획|구역|도시계획/.test(name)) keys.add("seoul_urban");
  return [...keys];
}

function queryTerms(row, sourceKey) {
  const catalyst = row.catalyst_name || "";
  const focus = row.focus_area || "";
  const termsByCatalyst = {
    "잠실 MICE·국제교류복합지구": ["잠실 MICE", "국제교류복합지구", "종합운동장", "잠실 스포츠·MICE", "교통대책"],
    "압구정·한강변관리·경관/높이/공공기여": ["압구정", "한강변관리", "경관", "높이", "공공기여", "특별계획구역"],
    "동서울터미널·강변역·광역교통": ["동서울터미널", "강변역", "사전협상", "교통처리계획", "광역교통"],
    "구의·자양 2/7호선·한강 접근축": ["구의", "자양", "한강 접근", "보행축", "2호선", "7호선"],
    "대치 학군·3호선·기존 생활 인프라": ["대치", "학여울", "3호선", "교통", "정비계획"],
    "석촌·송파·가락 8/9호선 배후축": ["석촌", "송파", "가락", "8호선", "9호선", "보행"],
    "문정·장지 업무지구 배후축": ["문정", "장지", "업무지구", "교통", "동남권"],
    "마천·거여 재정비축": ["마천", "거여", "재정비촉진", "도로계획", "정비구역"],
    "중곡 7호선 생활권 정비": ["중곡", "7호선", "생활권계획", "정비계획", "광진구"],
  };
  const base = termsByCatalyst[catalyst] || [catalyst, focus].filter(Boolean);
  const suffix = {
    seoul_citybuild: "서울시 도시계획",
    seoul_traffic: "서울시 교통",
    opengov: "정보소통광장 결재문서",
    seoul_urban: "서울도시공간포털 고시",
  }[sourceKey] || "";
  return compact([...base.slice(0, 4), suffix], 6);
}

function targetFileFor(sourceKey) {
  if (sourceKey === "seoul_urban") return "data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json";
  if (sourceKey === "opengov") return "analysis/official-context-sources.csv 또는 data/review/official-update-intake.json";
  return "analysis/official-context-sources.csv";
}

function evidenceStatusFor(sourceKey) {
  if (sourceKey === "seoul_urban") return "needs_text_extraction 또는 verified_original";
  return "context_only";
}

function decisionGateFor(sourceKey) {
  if (sourceKey === "seoul_urban") return "고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격";
  if (sourceKey === "opengov") return "결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격";
  return "보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류";
}

function buildRows({ catalystRows, triggerRows, activationRows, contextSources }) {
  const sourceByKey = new Map(contextSources.map((row) => [row.source_key, row]));
  const activationBySourceName = new Map(activationRows.map((row) => [row.source_name, row]));
  const triggerByCatalyst = new Map();
  for (const row of triggerRows) {
    if (!triggerByCatalyst.has(row.catalyst_name)) triggerByCatalyst.set(row.catalyst_name, []);
    triggerByCatalyst.get(row.catalyst_name).push(row);
  }

  const catalystSummaries = [...new Map(catalystRows.map((row) => [row.catalyst_id, row])).values()];
  return catalystSummaries
    .flatMap((row) =>
      sourceKeysForCatalyst(row).map((sourceKey) => {
        const source = sourceByKey.get(sourceKey) || {};
        const triggers = triggerByCatalyst.get(row.catalyst_name) || [];
        const priority = Math.round(
          Number(row.catalyst_priority_score || 0) +
            Math.max(0, ...triggers.map((item) => Number(item.trigger_priority || 0))) / 5 +
            (sourceKey === "seoul_urban" ? 30 : 0),
        );
        const topTriggers = [...triggers].sort((a, b) => Number(b.trigger_priority || 0) - Number(a.trigger_priority || 0)).slice(0, 4);
        const activation = activationBySourceName.get(source.title) || {};
        return {
          search_id: `${row.catalyst_id}-${sourceKey}`,
          priority,
          source_key: sourceKey,
          source_title: source.title || sourceKey,
          source_url: source.url || "",
          activation_status: activation.activation_status || "",
          catalyst_name: row.catalyst_name,
          focus_area: row.focus_area,
          query_terms: queryTerms(row, sourceKey),
          suggested_query: `${queryTerms(row, sourceKey)} ${source.title || ""}`.trim(),
          trigger_projects: compact(topTriggers.map((item) => `${item.rank}. ${item.project_name}`), 4),
          signal_classes: compact(topTriggers.map((item) => item.signal_class), 4),
          official_documents_to_check: row.official_documents_to_check,
          target_record_file: targetFileFor(sourceKey),
          evidence_status_default: evidenceStatusFor(sourceKey),
          decision_gate: decisionGateFor(sourceKey),
          first_outputs_to_check: "analysis/catalyst-trigger-matrix.md; analysis/research-hypothesis-ledger.md; analysis/official-update-intake-board.md",
          affected_outputs: compact(topTriggers.flatMap((item) => String(item.affected_outputs || "").split(";")), 6),
        };
      }),
    )
    .sort((a, b) => b.priority - a.priority || a.source_key.localeCompare(b.source_key));
}

function summarize(rows) {
  return {
    generated_at: UPDATED_AT,
    search_count: rows.length,
    catalyst_count: new Set(rows.map((row) => row.catalyst_name)).size,
    source_count: new Set(rows.map((row) => row.source_key)).size,
    context_only_count: rows.filter((row) => row.evidence_status_default === "context_only").length,
    original_candidate_count: rows.filter((row) => row.evidence_status_default !== "context_only").length,
    source_mix: countBy(rows, "source_key"),
    focus_mix: countBy(rows, "focus_area"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  return `# 공식 Context 검색 큐

작성 기준: ${UPDATED_AT}

이 문서는 월간 context scan 때 서울시 주택·도시계획, 서울시 교통, 서울 정보소통광장, 서울도시공간포털에서 무엇을 검색할지 촉매별로 고정한다. 보도자료와 결재문서는 기본적으로 \`context_only\`이며, 원문 고시·계획·교통대책과 연결될 때만 사업장 가설을 승격한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 검색 큐 | ${summary.search_count} |
| 촉매 | ${summary.catalyst_count} |
| 출처 | ${summary.source_count} |
| context_only 기본 | ${summary.context_only_count} |
| 원문 후보 가능 | ${summary.original_candidate_count} |

| 구분 | 값 |
| --- | --- |
| 출처 | ${summary.source_mix} |
| 생활권 | ${summary.focus_mix} |

## 우선 검색 큐

${mdTable(rows.slice(0, 30), [
    { key: "priority", label: "우선" },
    { key: "source_key", label: "출처" },
    { key: "catalyst_name", label: "촉매" },
    { key: "focus_area", label: "생활권" },
    { key: "suggested_query", label: "검색어" },
    { key: "trigger_projects", label: "연결 사업" },
    { key: "evidence_status_default", label: "기본 증거" },
    { key: "target_record_file", label: "기록 위치" },
    { key: "decision_gate", label: "판정 gate" },
  ])}

## 사용 순서

1. \`priority\`가 높은 행부터 해당 공식 출처에서 검색한다.
2. 보도자료·결재문서이면 \`analysis/official-context-sources.csv\` 또는 \`data/review/official-update-intake.json\`에 \`context_only\`로 기록한다.
3. 고시번호·고시일·원문 URL·첨부명이 확인되면 source verification 또는 official update intake로 보낸다.
4. 기록 후 \`node scripts/regenerate-research-artifacts.mjs\`를 실행하고 \`analysis/catalyst-trigger-matrix.md\`와 생활권 비교 브리프를 확인한다.

## 운영 원칙

- 공공 촉매는 재평가를 시작하는 신호이지 확정 결론이 아니다.
- 같은 촉매라도 high-blocking 사업은 공식 회신/정보공개 gate를 먼저 통과해야 한다.
- 검색 결과가 없으면 결론을 바꾸지 않고 다음 월간 scan에서 같은 큐를 재사용한다.
`;
}

async function main() {
  const [catalystMap, triggerMatrix, activationChecklist, contextCsv] = await Promise.all([
    readJson(INPUTS.catalystMap),
    readJson(INPUTS.catalystTriggerMatrix),
    readJson(INPUTS.sourceActivationChecklist),
    readFile(INPUTS.contextSources, "utf8"),
  ]);
  const rows = buildRows({
    catalystRows: rowsFrom(catalystMap),
    triggerRows: rowsFrom(triggerMatrix),
    activationRows: rowsFrom(activationChecklist),
    contextSources: parseCsv(contextCsv),
  });
  const summary = summarize(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ searches: rows.length, output: "analysis/official-context-search-queue.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
