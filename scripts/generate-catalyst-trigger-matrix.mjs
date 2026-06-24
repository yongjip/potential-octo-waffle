#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "catalyst-trigger-matrix.md");
const OUT_CSV = path.join(OUT_DIR, "catalyst-trigger-matrix.csv");
const OUT_JSON = path.join(OUT_DIR, "catalyst-trigger-matrix.json");

const INPUTS = {
  catalysts: "analysis/public-development-catalyst-map.json",
  hypothesisLedger: "analysis/research-hypothesis-ledger.json",
  updateImpactLedger: "analysis/update-impact-ledger.json",
  evidenceBinder: "analysis/project-evidence-binder.json",
  officialUpdateRegistry: "analysis/official-update-registry.json",
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

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function compact(items, limit = 4) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function compactParts(items, limit = 5) {
  return compact(
    items.flatMap((item) =>
      String(item || "")
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
    limit,
  );
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

function sourceById(registryRows) {
  return new Map(registryRows.map((row) => [row.source_id || row.id || row.ID, row]));
}

function updateByRank(projectRows) {
  return new Map(projectRows.map((row) => [String(row.rank), row]));
}

function signalClass({ catalyst, hypothesis, evidence, update }) {
  if (evidence?.binder_status === "official_response_needed") return "공식 회신 선행";
  if (evidence?.binder_status === "source_link_bottleneck" || hypothesis?.hypothesis_status === "source_blocked_hypothesis") {
    return "원문 보강 우선";
  }
  if (/immediate|high/.test(String(catalyst.watch_level || "")) || Number(catalyst.catalyst_priority_score || 0) >= 300) {
    return "가설 재평가";
  }
  if (/cost_infra_or_schedule_risk/.test(update?.signal_types || "")) return "리스크 재점검";
  return "정기 모니터링";
}

function positiveTrigger(catalyst, hypothesis) {
  const docs = catalyst.official_documents_to_check || hypothesis.catalyst_documents || "공식 계획·고시·교통대책 원문";
  if (/압구정|한강변관리/.test(catalyst.catalyst_name)) {
    return `한강변 높이·경관·공공기여·기반시설 조건이 원문상 감내 가능한 수준으로 확인`;
  }
  if (/동서울터미널|강변역|광역교통/.test(catalyst.catalyst_name)) {
    return `동서울터미널·강변역 관련 ${docs}에서 일정, 보행/환승, 교통처리계획이 구체화`;
  }
  if (/MICE|국제교류/.test(catalyst.catalyst_name)) {
    return `잠실 MICE·국제교류복합지구 ${docs}에서 일정, 교통대책, 보행축 개선이 확정`;
  }
  if (/대치/.test(catalyst.catalyst_name)) {
    return "사업비·분담금·이주 일정이 기존 학군/생활 인프라 프리미엄을 훼손하지 않는 것으로 확인";
  }
  if (/8\/9호선|문정|장지|구의|자양|중곡/.test(catalyst.catalyst_name)) {
    return "역 접근, 생활권 연결, 보행축 개선이 공식 원문과 현장 관찰 양쪽에서 확인";
  }
  return `${docs}가 보도자료가 아니라 고시·계획·첨부 원문으로 확인`;
}

function negativeTrigger(catalyst, hypothesis) {
  const downside = hypothesis.downside_watch || hypothesis.risk_hypothesis || "";
  if (/압구정|한강변관리/.test(catalyst.catalyst_name)) return "높이·경관·공공기여·기반시설 조건이 사업성 또는 조합 속도에 부담으로 확인";
  if (/동서울터미널|강변역|광역교통/.test(catalyst.catalyst_name)) return "터미널/강변역 일정 지연, 교통처리 불확실, 보행 단절 심화가 원문이나 현장에서 확인";
  if (/MICE|국제교류/.test(catalyst.catalyst_name)) return "행사·상업 집객 혼잡, 한강·탄천·대형도로 단절, 이주기 전세 압력이 커지는 신호 확인";
  if (/대치/.test(catalyst.catalyst_name)) return "비용·분담금·이주 리스크가 학군 수요 프리미엄보다 크게 보이는 공개항목 확인";
  return downside || "공식 원문에서 일정 지연, 비용 증가, 기반시설 부담, 단계 정체가 확인";
}

function proofGate({ catalyst, hypothesis, evidence }) {
  const gates = [];
  if (evidence?.binder_status === "official_response_needed") {
    gates.push("담당부서 회신 또는 정보공개 회신에 자료명·기준일·원문 URL/첨부명이 포함");
  }
  if (evidence?.binder_status === "source_link_bottleneck" || hypothesis.source_blockers > 0) {
    gates.push("고시번호·고시일·원문 URL 또는 로컬 원문 텍스트 연결");
  }
  gates.push(catalyst.official_documents_to_check || "공식 원문");
  gates.push("사업별 메모와 비교표 재생성 후 가설 장부 변화 확인");
  return compact(gates, 4);
}

function firstSources(catalyst, update, evidence) {
  return compactParts([
    evidence?.first_files_to_open,
    update?.first_triage_files,
    catalyst.official_documents_to_check,
  ], 5);
}

function triggerPriority({ catalyst, hypothesis, evidence, signal_class }) {
  let score = Number(catalyst.catalyst_priority_score || 0);
  if (signal_class === "공식 회신 선행") score += 80;
  if (signal_class === "원문 보강 우선") score += 50;
  if (["immediate", "high"].includes(catalyst.watch_level)) score += 30;
  if (hypothesis.hypothesis_status === "source_blocked_hypothesis") score += 25;
  if (evidence?.binder_status === "ocr_or_partial_value_review") score += 10;
  return Math.round(score * 10) / 10;
}

function buildRows({ catalystRows, hypothesisByRank, updateByRankMap, evidenceByRank }) {
  return catalystRows
    .map((catalyst) => {
      const rank = String(catalyst.rank);
      const hypothesis = hypothesisByRank.get(rank) || {};
      const update = updateByRankMap.get(rank) || {};
      const evidence = evidenceByRank.get(rank) || {};
      const signal_class = signalClass({ catalyst, hypothesis, evidence, update });
      const row = {
        catalyst_id: catalyst.catalyst_id,
        catalyst_name: catalyst.catalyst_name,
        focus_area: catalyst.focus_area,
        rank,
        project_name: catalyst.project_name,
        current_stage: catalyst.current_stage,
        watch_level: catalyst.watch_level,
        signal_class,
        trigger_priority: triggerPriority({ catalyst, hypothesis, evidence, signal_class }),
        av_scenario: catalyst.av_scenario_label,
        binder_status: evidence.binder_status_label || "",
        hypothesis_status: hypothesis.hypothesis_status_label || "",
        promotion_trigger: positiveTrigger(catalyst, hypothesis),
        downgrade_trigger: negativeTrigger(catalyst, hypothesis),
        proof_gate: proofGate({ catalyst, hypothesis, evidence }),
        first_sources: firstSources(catalyst, update, evidence),
        decision_rule: hypothesis.decision_rule || catalyst.interpretation_rule || "",
        affected_outputs: compactParts([update.affected_outputs, "analysis/research-hypothesis-ledger.md", "analysis/focus-area-comparison-brief.md"], 5),
        regenerate_command: "node scripts/regenerate-research-artifacts.mjs",
        project_note: catalyst.project_note || hypothesis.project_note || "",
      };
      return row;
    })
    .sort((a, b) => b.trigger_priority - a.trigger_priority || Number(a.rank) - Number(b.rank));
}

function summarize(rows, catalystSummary, registryRows) {
  return {
    generated_at: UPDATED_AT,
    trigger_count: rows.length,
    catalyst_count: catalystSummary.catalyst_count || catalystSummary.catalysts || new Set(rows.map((row) => row.catalyst_id)).size,
    project_count: new Set(rows.map((row) => row.rank)).size,
    official_response_first_count: rows.filter((row) => row.signal_class === "공식 회신 선행").length,
    source_repair_first_count: rows.filter((row) => row.signal_class === "원문 보강 우선").length,
    hypothesis_reassessment_count: rows.filter((row) => row.signal_class === "가설 재평가").length,
    signal_class_mix: countBy(rows, "signal_class"),
    focus_mix: countBy(rows, "focus_area"),
    registry_source_count: registryRows.length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const fields = [
    { key: "trigger_priority", label: "우선" },
    { key: "catalyst_name", label: "촉매" },
    { key: "focus_area", label: "생활권" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "signal_class", label: "판정" },
    { key: "promotion_trigger", label: "상향 신호" },
    { key: "downgrade_trigger", label: "하향 신호" },
    { key: "proof_gate", label: "증거 gate" },
  ];
  const topRows = rows.slice(0, 20);
  const responseRows = rows.filter((row) => row.signal_class === "공식 회신 선행");
  const byCatalyst = Object.values(
    rows.reduce((acc, row) => {
      const key = row.catalyst_name;
      const bucket = acc[key] || {
        catalyst_name: row.catalyst_name,
        trigger_count: 0,
        top_project: "",
        signal_mix: {},
        max_priority: 0,
        first_sources: "",
      };
      bucket.trigger_count += 1;
      bucket.max_priority = Math.max(bucket.max_priority, Number(row.trigger_priority || 0));
      if (!bucket.top_project || Number(row.trigger_priority || 0) === bucket.max_priority) bucket.top_project = `${row.rank}. ${row.project_name}`;
      bucket.signal_mix[row.signal_class] = (bucket.signal_mix[row.signal_class] || 0) + 1;
      bucket.first_sources = bucket.first_sources || row.first_sources;
      acc[key] = bucket;
      return acc;
    }, {}),
  )
    .map((row) => ({
      ...row,
      signal_mix: Object.entries(row.signal_mix)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => `${key} ${count}`)
        .join("; "),
    }))
    .sort((a, b) => b.max_priority - a.max_priority);

  return `# 공공 촉매 트리거 매트릭스

작성 기준: ${UPDATED_AT}

이 문서는 잠실 MICE, 압구정 한강변, 동서울터미널, 구의·자양 한강축 같은 공공 개발 촉매가 업데이트됐을 때 어느 사업장 가설을 올릴지, 낮출지, 또는 원문 보강으로만 둘지 판정하는 작업표다. 촉매는 투자 판단이 아니라 재평가를 시작하는 신호다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 트리거 연결 | ${summary.trigger_count} |
| 촉매 | ${summary.catalyst_count} |
| 연결 사업장 | ${summary.project_count} |
| 공식 회신 선행 | ${summary.official_response_first_count} |
| 원문 보강 우선 | ${summary.source_repair_first_count} |
| 가설 재평가 | ${summary.hypothesis_reassessment_count} |

## 분포

| 구분 | 값 |
| --- | --- |
| 판정 | ${summary.signal_class_mix} |
| 생활권 | ${summary.focus_mix} |

## 촉매별 시작점

${mdTable(byCatalyst, [
    { key: "catalyst_name", label: "촉매" },
    { key: "trigger_count", label: "연결" },
    { key: "top_project", label: "대표 사업" },
    { key: "max_priority", label: "최대 우선" },
    { key: "signal_mix", label: "판정 분포" },
    { key: "first_sources", label: "먼저 열 자료" },
  ])}

## 우선 트리거 Top 20

${mdTable(topRows, fields)}

## 공식 회신 선행 트리거

${mdTable(responseRows, [
    { key: "catalyst_name", label: "촉매" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "binder_status", label: "근거 상태" },
    { key: "proof_gate", label: "증거 gate" },
    { key: "first_sources", label: "먼저 열 자료" },
  ])}

## 전체 트리거

${mdTable(rows, [
    ...fields,
    { key: "av_scenario", label: "AV/교통 시나리오" },
    { key: "first_sources", label: "먼저 열 자료" },
    { key: "affected_outputs", label: "영향 산출물" },
  ])}

## 운영 원칙

- 공공 촉매 업데이트는 보도자료만으로 가설을 승격하지 않는다. 고시, 계획, 교통대책, 심의/결재 원문이 연결돼야 한다.
- 공식 회신 선행 사업은 회신 intake가 들어오기 전까지 상향/하향 신호를 판단하지 않고 원문 확보 상태로 둔다.
- 자율주행·교통 시나리오는 역세권 가치의 대체가 아니라 보행 단절, 환승, 간선도로 접근성의 민감도 점검에 사용한다.
- 트리거 반영 후에는 입력 decision 또는 intake를 먼저 수정하고 전체 재생성 후 가설 장부와 생활권 비교 브리프를 확인한다.
`;
}

async function main() {
  const [catalystData, hypothesisData, updateData, evidenceData, registryData] = await Promise.all([
    readJson(INPUTS.catalysts),
    readJson(INPUTS.hypothesisLedger),
    readJson(INPUTS.updateImpactLedger),
    readJson(INPUTS.evidenceBinder),
    readJson(INPUTS.officialUpdateRegistry),
  ]);

  const catalystRows = rowsFrom(catalystData);
  const hypothesisByRank = byRank(rowsFrom(hypothesisData));
  const updateByRankMap = updateByRank(updateData.project_rows || []);
  const evidenceByRank = byRank(rowsFrom(evidenceData));
  const registryRows = rowsFrom(registryData);
  sourceById(registryRows);

  const rows = buildRows({ catalystRows, hypothesisByRank, updateByRankMap, evidenceByRank });
  const summary = summarize(rows, catalystData.summary || {}, registryRows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown(summary, rows));
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);

  console.log(JSON.stringify({ rows: rows.length, officialResponseFirst: summary.official_response_first_count, output: "analysis/catalyst-trigger-matrix.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
