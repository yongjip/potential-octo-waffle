#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "reassessment-watchlist.md");
const OUT_CSV = path.join(OUT_DIR, "reassessment-watchlist.csv");
const OUT_JSON = path.join(OUT_DIR, "reassessment-watchlist.json");

const NEXT_MOVES_INPUT = "analysis/research-next-moves.json";
const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";
const FIELDWORK_INPUT = "analysis/fieldwork-route-planner.json";
const REGISTRY_INPUT = "analysis/official-update-registry.json";
const RUNBOOK_INPUT = "analysis/official-update-runbook.json";
const LEDGER_INPUT = "analysis/core-value-confirmation-ledger.json";

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

const SOURCE_LABELS = {
  seoul_urban_notice: "서울도시공간포털",
  cleanup_project_status: "정보몽땅 사업장",
  cleanup_notice: "정보몽땅 공개항목",
  district_notice: "자치구 고시공고",
  seoul_sibo: "서울시보",
  seoul_citybuild_news: "서울 도시계획",
  seoul_traffic_news: "서울 교통",
  opengov: "정보소통광장",
  molit_data_go_kr: "국토부/공공데이터",
  r_one: "R-ONE",
};

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

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank || ""), row]).filter(([rank]) => rank));
}

function byId(rows, key = "source_id") {
  return Object.fromEntries(rows.map((row) => [row[key], row]).filter(([id]) => id));
}

function groupByRank(rows) {
  return rows.reduce((acc, row) => {
    const rank = String(row.rank || "");
    if (!rank) return acc;
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(row);
    return acc;
  }, {});
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function compact(items, limit = 4) {
  return uniq(items).slice(0, limit).join("; ");
}

function splitList(text) {
  return String(text || "")
    .split(/\s*;\s*|\s*\/\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sourceIdsFor(row, potential, ledgerRows) {
  const text = [
    row.next_task_type,
    row.recommended_move,
    row.first_source_to_open,
    row.business_layer_stage,
    row.business_layer_alignment_status,
    row.business_layer_alignment_note,
    row.upside_watch,
    row.downside_watch,
    row.revisit_trigger,
    potential.long_term_thesis,
  ].join(" ");
  const ids = [];
  if (/recordCode|고시|정비계획|결정조서|구역|원문|source_link|공람/.test(text)) ids.push("seoul_urban_notice", "district_notice", "seoul_sibo");
  if (/정보몽땅|공개항목|사업개요|단계|관리처분|사업시행|공개자료|착공|철거|이주완료|단계 불일치/.test(text)) ids.push("cleanup_project_status", "cleanup_notice");
  if (/비용|분담금|공사비|기반시설|공공기여|이주비|HUG|임대주택/.test(text)) ids.push("cleanup_notice", "cleanup_project_status", "seoul_urban_notice");
  if (/OCR|HWP|PDF|텍스트|이미지/.test(text)) ids.push("seoul_urban_notice", "district_notice");
  if (/MICE|국제교류|종합운동장|한강변|경관|압구정|역세권|도시계획/.test(text)) ids.push("seoul_citybuild_news", "seoul_urban_notice", "opengov");
  if (/동서울터미널|강변역|터미널|교통|지하철|환승|도로|보행/.test(text)) ids.push("seoul_traffic_news", "seoul_citybuild_news", "opengov");
  if (/시장|실거래|가격|거래량|R-ONE/.test(text)) ids.push("molit_data_go_kr", "r_one");
  if (ledgerRows.some((item) => item.verification_status === "source_link_required" || item.verification_status === "no_source_text")) {
    ids.push("seoul_urban_notice", "district_notice");
  }
  return uniq(ids).slice(0, 5);
}

function runbookFor(row, sourceIds, trigger) {
  if (sourceIds.includes("molit_data_go_kr") || sourceIds.includes("r_one")) return "monthly_market_data_refresh";
  if (trigger === "비용·기반시설 신호" || trigger === "단계·시점 수치 해소" || trigger === "단계 불일치 해소") return "weekly_primary_refresh";
  if (trigger === "정책·교통 컨텍스트") return "monthly_context_scan";
  if (trigger === "고시/recordCode 확보") return "recordcode_bottleneck_probe";
  if (row.next_task_type === "verify_ocr_numbers" || /OCR|HWP|PDF|이미지/.test(row.recommended_move || "")) return "ocr_value_resolution";
  if (row.next_task_type === "connect_recordcode_original_notice" || sourceIds.includes("district_notice")) return "recordcode_bottleneck_probe";
  if (sourceIds.includes("seoul_citybuild_news") || sourceIds.includes("seoul_traffic_news") || sourceIds.includes("opengov")) return "monthly_context_scan";
  return "weekly_primary_refresh";
}

function triggerType(row, potential, ledgerRows) {
  if (row.business_layer_alignment_status === "stage_ahead_of_matrix") {
    return "단계 불일치 해소";
  }
  if (row.next_task_type === "connect_recordcode_original_notice" || ledgerRows.some((item) => item.verification_status === "source_link_required")) {
    return "고시/recordCode 확보";
  }
  if (row.next_task_type === "resolve_stage_value_conflict" || /관리처분|사업시행|시점/.test(row.recommended_move || "")) {
    return "단계·시점 수치 해소";
  }
  if (row.next_task_type === "verify_ocr_numbers" || /OCR|이미지|HWP/.test(row.recommended_move || "")) {
    return "OCR/HWP 원문 판독";
  }
  if (row.next_task_type === "crosscheck_cost_infrastructure") {
    return "비용·기반시설 신호";
  }
  if (/비용|분담금|기반시설|공공기여|HUG|이주비/.test(`${row.recommended_move || ""} ${row.downside_watch || ""}`)) {
    return "비용·기반시설 신호";
  }
  if (/MICE|국제교류|동서울터미널|한강변|경관|교통/.test(`${potential.upside_watch || ""} ${potential.revisit_trigger || ""}`)) {
    return "정책·교통 컨텍스트";
  }
  return "정기 상태 변화";
}

function watchLevel(row, potential, ledgerRows) {
  if (Number(row.p0_tasks || 0) > 0 || Number(row.source_blockers || 0) >= 7) return "immediate";
  if (row.business_layer_alignment_status === "stage_ahead_of_matrix") return "high";
  if (Number(row.confidence_gap || 0) >= 1.5 || Number(potential.long_term_potential_score || 0) >= 8) return "high";
  if (Number(row.p1_tasks || 0) > 0 || ledgerRows.some((item) => item.verification_status === "value_missing")) return "normal";
  return "periodic";
}

function reassessmentReason(row, potential, fieldwork) {
  return compact([
    row.business_layer_alignment_status === "stage_ahead_of_matrix" ? `공개 진행단계 선행 신호: ${row.business_layer_stage || "후속 단계"}` : "",
    row.revisit_trigger,
    Number(row.confidence_gap || 0) > 0 ? `장기잠재-확신도 격차 ${row.confidence_gap}` : "",
    Number(row.source_blockers || 0) > 0 ? `원문 병목 ${row.source_blockers}건` : "",
    fieldwork?.route_name ? `현장 루트: ${fieldwork.route_name}` : "",
  ]);
}

function buildRows({ nextRows, potentialByRank, fieldworkByRank, registryById, runbookById, ledgerByRank }) {
  return nextRows
    .map((row) => {
      const rank = String(row.rank);
      const potential = potentialByRank[rank] || {};
      const fieldwork = fieldworkByRank[rank] || {};
      const ledgerRows = ledgerByRank[rank] || [];
      const sourceIds = sourceIdsFor(row, potential, ledgerRows);
      const trigger = triggerType(row, potential, ledgerRows);
      const runbookId = runbookFor(row, sourceIds, trigger);
      const sources = sourceIds.map((id) => registryById[id]).filter(Boolean);
      const runbook = runbookById[runbookId] || {};
      const level = watchLevel(row, potential, ledgerRows);
      return {
        rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        current_stage: row.current_stage,
        business_layer_stage: row.business_layer_stage || "",
        business_layer_alignment_status: row.business_layer_alignment_status || "",
        business_layer_alignment_note: row.business_layer_alignment_note || "",
        watch_level: level,
        trigger_type: trigger,
        track: row.track,
        long_term_potential_score: row.long_term_potential_score,
        confidence_score: row.confidence_score,
        confidence_gap: row.confidence_gap,
        source_blockers: row.source_blockers,
        p0_tasks: row.p0_tasks,
        p1_tasks: row.p1_tasks,
        reassessment_reason: reassessmentReason(row, potential, fieldwork),
        update_sources: sourceIds.map((id) => SOURCE_LABELS[id] || id).join("; "),
        update_signals: compact(sources.map((source) => source.update_signal), 3),
        check_cadence: compact(sources.map((source) => source.check_cadence), 3),
        runbook_id: runbookId,
        runbook_trigger: runbook.trigger || "",
        first_outputs_to_read: runbook.first_outputs_to_read || "",
        decision_rule: runbook.decision_rule || "",
        next_action: row.recommended_move,
        fieldwork_route: fieldwork.route_name || "",
        project_note: row.project_note || potential.project_note || "",
        sort_score: (
          { immediate: 4000, high: 3000, normal: 2000, periodic: 1000 }[level] +
          Number(row.move_score || 0) +
          Number(row.long_term_potential_score || 0) * 20 +
          Number(row.confidence_gap || 0) * 30
        ),
      };
    })
    .sort((a, b) => b.sort_score - a.sort_score || Number(a.rank) - Number(b.rank))
    .map((row, index) => {
      const { sort_score, ...rest } = row;
      return { watch_rank: index + 1, ...rest };
    });
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "";
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countTable(rows, field) {
  return Object.entries(countBy(rows, field))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function focusSummary(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.focus_area]) acc[row.focus_area] = [];
    acc[row.focus_area].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([focus_area, items]) => {
    const top = items[0];
    return {
      focus_area,
      projects: items.length,
      immediate: items.filter((row) => row.watch_level === "immediate").length,
      high: items.filter((row) => row.watch_level === "high").length,
      normal: items.filter((row) => row.watch_level === "normal").length,
      first_project: `${top.rank}. ${top.project_name}`,
      first_trigger: top.trigger_type,
      first_sources: top.update_sources,
    };
  });
}

function markdown(rows) {
  const top = rows.slice(0, 15);
  return `# 재평가 감시표

작성 기준: ${UPDATED_AT}

이 문서는 장기 가능성 점수카드와 다음 리서치 액션 보드를 공식 업데이트 출처 레지스트리에 연결한 사업별 감시표다. 새 고시, 공개자료, 정책/교통 문서, 시장 데이터가 나왔을 때 어떤 사업의 가설을 다시 열어야 하는지 정한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | ${rows.length} |
| immediate | ${rows.filter((row) => row.watch_level === "immediate").length} |
| high | ${rows.filter((row) => row.watch_level === "high").length} |
| normal | ${rows.filter((row) => row.watch_level === "normal").length} |
| periodic | ${rows.filter((row) => row.watch_level === "periodic").length} |

## 생활권별

${mdTable(focusSummary(rows), [
  { key: "focus_area", label: "생활권" },
  { key: "projects", label: "사업장" },
  { key: "immediate", label: "즉시" },
  { key: "high", label: "높음" },
  { key: "normal", label: "보통" },
  { key: "first_project", label: "첫 감시 사업" },
  { key: "first_trigger", label: "첫 트리거" },
  { key: "first_sources", label: "주요 출처" },
])}

## 트리거 유형

${mdTable(countTable(rows, "trigger_type"), [
  { key: "name", label: "트리거" },
  { key: "count", label: "사업장" },
])}

## 상위 감시 대상

${mdTable(top, [
  { key: "watch_rank", label: "감시" },
  { key: "watch_level", label: "레벨" },
  { key: "rank", label: "후보" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "trigger_type", label: "트리거" },
  { key: "long_term_potential_score", label: "장기잠재" },
  { key: "confidence_score", label: "확신도" },
  { key: "source_blockers", label: "원문병목" },
  { key: "update_sources", label: "확인 출처" },
  { key: "runbook_id", label: "런북" },
])}

## 전체 감시표

${mdTable(rows, [
  { key: "watch_rank", label: "감시" },
  { key: "watch_level", label: "레벨" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업" },
  { key: "track", label: "현재 트랙" },
  { key: "reassessment_reason", label: "재평가 이유" },
  { key: "update_signals", label: "업데이트 신호" },
  { key: "check_cadence", label: "확인 주기" },
  { key: "first_outputs_to_read", label: "먼저 읽을 산출물" },
  { key: "decision_rule", label: "판정 규칙" },
  { key: "project_note", label: "메모" },
])}

## 사용법

1. \`immediate\`는 원문 병목이나 P0가 가설 판단을 막는 사업이다. 고시/공개항목/원문 판독부터 처리한다.
2. \`high\`는 장기잠재가 높거나 확신도 격차가 큰 사업이다. 업데이트가 있으면 점수카드와 사업별 메모를 다시 본다.
3. \`runbook_id\`에 맞춰 원격 수집 또는 수동 검색을 실행한 뒤 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
4. 정책·교통 문서는 context이고, 고시번호·결정조서·인가 원문 확인 전까지 확정 신호로 승격하지 않는다.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const [nextRows, potentialRows, fieldworkRows, registryRows, runbookRows, ledgerRows] = await Promise.all([
    readJson(NEXT_MOVES_INPUT),
    readJson(POTENTIAL_INPUT),
    readJson(FIELDWORK_INPUT),
    readJson(REGISTRY_INPUT),
    readJson(RUNBOOK_INPUT),
    readJson(LEDGER_INPUT),
  ]);
  const rows = buildRows({
    nextRows,
    potentialByRank: byRank(potentialRows),
    fieldworkByRank: byRank(fieldworkRows),
    registryById: byId(registryRows),
    runbookById: byId(runbookRows, "runbook_id"),
    ledgerByRank: groupByRank(ledgerRows),
  });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(rows), "utf8");
  console.log(JSON.stringify({
    rows: rows.length,
    levels: countBy(rows, "watch_level"),
    triggers: countBy(rows, "trigger_type"),
    output: "analysis/reassessment-watchlist.{md,csv,json}",
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
