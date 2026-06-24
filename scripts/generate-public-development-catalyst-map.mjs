#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "public-development-catalyst-map.md");
const OUT_CSV = path.join(OUT_DIR, "public-development-catalyst-map.csv");
const OUT_JSON = path.join(OUT_DIR, "public-development-catalyst-map.json");

const TRANSPORT_INPUT = "analysis/transport-location-context.json";
const POTENTIAL_INPUT = "analysis/long-term-potential-scorecard.json";
const REASSESSMENT_INPUT = "analysis/reassessment-watchlist.json";
const AV_INPUT = "analysis/autonomous-mobility-scenario.json";
const REGISTRY_INPUT = "analysis/official-update-registry.json";

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

const CATALYSTS = [
  {
    catalyst_id: "jamsil-mice-gbc",
    catalyst_name: "잠실 MICE·국제교류복합지구",
    catalyst_type: "광역업무·전시·스포츠 거점",
    focus_areas: ["잠실/송파"],
    patterns: [/잠실 MICE/, /국제교류복합지구/, /종합운동장/],
    source_ids: ["seoul_citybuild_news", "seoul_urban_notice", "seoul_traffic_news", "opengov"],
    official_documents_to_check: "국제교류복합지구/잠실 MICE 관련 고시·계획·교통대책·심의/결재문서",
    interpretation_rule: "보도자료는 context로만 두고, 도시계획 결정·교통대책·사업 일정 원문이 확인될 때 재평가한다.",
  },
  {
    catalyst_id: "apgujeong-hangang-riverfront",
    catalyst_name: "압구정·한강변관리·경관/높이/공공기여",
    catalyst_type: "한강변 상급 주거지 도시계획 조건",
    focus_areas: ["강남"],
    patterns: [/압구정/, /한강변관리/, /한강변/, /경관/, /공공기여/],
    source_ids: ["seoul_citybuild_news", "seoul_urban_notice", "cleanup_project_status", "cleanup_notice"],
    official_documents_to_check: "한강변관리·경관·높이·공공기여 조건, 정비계획 변경, 지구단위계획 결정 원문",
    interpretation_rule: "입지 프리미엄보다 높이·기반시설·공공기여 조건과 조합별 단계 차이를 분리해서 본다.",
  },
  {
    catalyst_id: "dongseoul-terminal-gangbyeon",
    catalyst_name: "동서울터미널·강변역·광역교통",
    catalyst_type: "터미널/환승거점 재편",
    focus_areas: ["구의/광진"],
    patterns: [/동서울터미널/, /강변역/, /광역교통/, /터미널/],
    source_ids: ["seoul_citybuild_news", "seoul_traffic_news", "seoul_urban_notice", "opengov"],
    official_documents_to_check: "동서울터미널 사전협상·도시계획·교통처리계획·결재/심의자료",
    interpretation_rule: "공식 일정이 불확실하면 장기 옵션으로만 두고, 교통/보행환경 원문이 구체화될 때 우선 재평가한다.",
  },
  {
    catalyst_id: "guui-jayang-hangang-axis",
    catalyst_name: "구의·자양 2/7호선·한강 접근축",
    catalyst_type: "생활권 개선·한강 접근",
    focus_areas: ["구의/광진"],
    patterns: [/구의·건대입구/, /자양/, /건대입구/, /뚝섬유원지/, /한강 접근/],
    source_ids: ["seoul_urban_notice", "cleanup_project_status", "cleanup_notice", "district_notice"],
    official_documents_to_check: "정비구역계, 조합/사업시행 단계, 자치구 고시, 한강 접근·보행축 관련 계획",
    interpretation_rule: "소규모정비의 사업성 편차가 크므로, 한강 접근 가설보다 구역계·인가 원문과 도로폭 현장 확인을 먼저 둔다.",
  },
  {
    catalyst_id: "daechi-school-district",
    catalyst_name: "대치 학군·3호선·기존 생활 인프라",
    catalyst_type: "기존 수요 기반",
    focus_areas: ["강남"],
    patterns: [/대치/, /학군/, /학여울/, /도곡/, /학원가/],
    source_ids: ["seoul_traffic_news", "seoul_urban_notice", "cleanup_project_status", "cleanup_notice"],
    official_documents_to_check: "정비계획/사업시행계획, 교통·보행 변화, 공개항목 비용/분담금 자료",
    interpretation_rule: "신규 공공개발보다 비용·분담금·이주 가능성과 기존 학군 수요의 지속성을 분리한다.",
  },
  {
    catalyst_id: "seokchon-songpa-garak-backbone",
    catalyst_name: "석촌·송파·가락 8/9호선 배후축",
    catalyst_type: "잠실 배후 생활권",
    focus_areas: ["잠실/송파"],
    patterns: [/송파·석촌/, /가락/, /8\/9호선/, /석촌호수/, /송파대로/],
    source_ids: ["seoul_traffic_news", "seoul_urban_notice", "cleanup_project_status", "cleanup_notice"],
    official_documents_to_check: "사업시행/관리처분 원문, 8·9호선 접근/보행 환경, 송파권 고시공고",
    interpretation_rule: "잠실 핵심부 직접 수혜로 단정하지 말고, 역 접근·사업단계·비용 리스크를 각각 본다.",
  },
  {
    catalyst_id: "munjeong-jangji-business-axis",
    catalyst_name: "문정·장지 업무지구 배후축",
    catalyst_type: "업무지구 배후 주거",
    focus_areas: ["잠실/송파"],
    patterns: [/문정/, /장지/, /업무지구/, /법조/],
    source_ids: ["seoul_citybuild_news", "seoul_traffic_news", "seoul_urban_notice"],
    official_documents_to_check: "문정 업무지구·동남권 업무수요 관련 계획, 교통망·도로 접근 변화",
    interpretation_rule: "직주근접 수요와 재건축 단계가 함께 확인될 때만 장기 프리미엄을 올린다.",
  },
  {
    catalyst_id: "macheon-geoyeo-renewal",
    catalyst_name: "마천·거여 재정비축",
    catalyst_type: "재개발·재정비 생활권 개선",
    focus_areas: ["잠실/송파"],
    patterns: [/마천/, /거여/, /재정비촉진/, /재개발/],
    source_ids: ["seoul_urban_notice", "district_notice", "cleanup_project_status"],
    official_documents_to_check: "재정비촉진계획, 정비구역 변경, 조합/사업시행 단계, 권리관계와 도로계획 원문",
    interpretation_rule: "상급지 재건축과 같은 프레임을 쓰지 않고 권리관계·도로폭·사업속도를 중심으로 본다.",
  },
  {
    catalyst_id: "junggok-neighborhood-renewal",
    catalyst_name: "중곡 7호선 생활권 정비",
    catalyst_type: "생활권 개선형 정비",
    focus_areas: ["구의/광진"],
    patterns: [/중곡/, /군자/, /아차산/, /생활권 기본 체력/],
    source_ids: ["seoul_urban_notice", "district_notice", "cleanup_project_status", "cleanup_notice"],
    official_documents_to_check: "중곡권 정비계획·조합 단계·자치구 고시·생활권계획 원문",
    interpretation_rule: "대형 개발 동인보다 사업규모, 역 접근성, 도로폭, 생활편의 개선 여부를 확인한다.",
  },
];

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

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  return value.rows || [];
}

function byRank(rows) {
  return new Map(rows.map((row) => [String(row.rank), row]));
}

function bySourceId(rows) {
  return new Map(rows.map((row) => [row.source_id, row]));
}

function splitList(text) {
  return String(text || "")
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function catalystMatches(row, potential, reassessment, av) {
  const text = [
    row.focus_area,
    row.estimated_station_area,
    row.mobility_axis,
    row.urban_change_drivers,
    row.long_term_thesis,
    row.mobility_risks,
    row.next_transport_action,
    potential.upside_watch,
    potential.revisit_trigger,
    reassessment.reassessment_reason,
    reassessment.trigger_type,
    av.scenario_label,
    av.scenario_thesis,
  ].join(" ");
  return CATALYSTS.filter((catalyst) => {
    if (catalyst.focus_areas && !catalyst.focus_areas.includes(row.focus_area)) return false;
    return catalyst.patterns.some((pattern) => pattern.test(text));
  });
}

function priorityScore(row, potential, reassessment, av, catalyst) {
  let score =
    Number(potential.long_term_potential_score || 0) * 18 +
    Number(potential.external_driver_score || 0) * 10 +
    Number(row.location_context_score || 0) * 8 +
    Number(av.av_upside_score || 0) * 4 +
    Number(av.transit_durability_score || 0) * 3;
  if (reassessment.watch_level === "immediate") score += 20;
  if (reassessment.watch_level === "high") score += 10;
  if (/MICE|국제교류|압구정|동서울/.test(catalyst.catalyst_name)) score += 8;
  if (Number(potential.confidence_score || 0) < 4) score -= 12;
  return round(score);
}

function sourceSummary(catalyst, sourceById) {
  return catalyst.source_ids
    .map((id) => {
      const source = sourceById.get(id);
      return source ? `${source.source_name}(${source.automation_status || "manual"})` : id;
    })
    .join("; ");
}

function sourceUrls(catalyst, sourceById) {
  return catalyst.source_ids
    .map((id) => sourceById.get(id)?.url)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join("; ");
}

function buildRows({ transportRows, potentialByRank, reassessmentByRank, avByRank, sourceById }) {
  const rows = [];
  for (const row of transportRows) {
    const rank = String(row.rank);
    const potential = potentialByRank.get(rank) || {};
    const reassessment = reassessmentByRank.get(rank) || {};
    const av = avByRank.get(rank) || {};
    for (const catalyst of catalystMatches(row, potential, reassessment, av)) {
      rows.push({
        catalyst_id: catalyst.catalyst_id,
        catalyst_name: catalyst.catalyst_name,
        catalyst_type: catalyst.catalyst_type,
        rank,
        focus_area: row.focus_area,
        district: row.district,
        dong: row.dong,
        project_name: row.project_name,
        current_stage: row.current_stage,
        mobility_axis: row.mobility_axis,
        long_term_potential_score: potential.long_term_potential_score || "",
        confidence_score: potential.confidence_score || "",
        av_scenario_label: av.scenario_label || "",
        watch_level: reassessment.watch_level || "",
        trigger_type: reassessment.trigger_type || "",
        catalyst_priority_score: priorityScore(row, potential, reassessment, av, catalyst),
        official_documents_to_check: catalyst.official_documents_to_check,
        official_sources: sourceSummary(catalyst, sourceById),
        official_source_urls: sourceUrls(catalyst, sourceById),
        interpretation_rule: catalyst.interpretation_rule,
        next_action: reassessment.next_action || row.next_transport_action || "",
        project_note: potential.project_note || row.project_note || "",
      });
    }
  }
  return rows.sort((a, b) => b.catalyst_priority_score - a.catalyst_priority_score || Number(a.rank) - Number(b.rank));
}

function catalystSummary(rows) {
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row.catalyst_id) || [];
    group.push(row);
    groups.set(row.catalyst_id, group);
  }
  return [...groups.entries()]
    .map(([catalyst_id, items]) => {
      const first = items[0];
      const avgPotential = round(items.reduce((sum, row) => sum + Number(row.long_term_potential_score || 0), 0) / items.length);
      const avgConfidence = round(items.reduce((sum, row) => sum + Number(row.confidence_score || 0), 0) / items.length);
      const top = [...items].sort((a, b) => b.catalyst_priority_score - a.catalyst_priority_score)[0];
      const focusMix = Object.entries(
        items.reduce((acc, row) => {
          acc[row.focus_area] = (acc[row.focus_area] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([focus, count]) => `${focus} ${count}`)
        .join("; ");
      return {
        catalyst_id,
        catalyst_name: first.catalyst_name,
        catalyst_type: first.catalyst_type,
        linked_projects: items.length,
        avg_potential: avgPotential,
        avg_confidence: avgConfidence,
        top_project: `${top.rank}. ${top.project_name}`,
        top_priority_score: top.catalyst_priority_score,
        focus_mix: focusMix,
        official_documents_to_check: first.official_documents_to_check,
        interpretation_rule: first.interpretation_rule,
      };
    })
    .sort((a, b) => b.top_priority_score - a.top_priority_score);
}

function focusSummary(rows) {
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row.focus_area) || [];
    group.push(row);
    groups.set(row.focus_area, group);
  }
  return [...groups.entries()]
    .map(([focus_area, items]) => {
      const catalysts = Object.entries(
        items.reduce((acc, row) => {
          acc[row.catalyst_name] = (acc[row.catalyst_name] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `${name} ${count}`)
        .slice(0, 4)
        .join("; ");
      const top = [...items].sort((a, b) => b.catalyst_priority_score - a.catalyst_priority_score)[0];
      return {
        focus_area,
        catalyst_links: items.length,
        unique_projects: new Set(items.map((row) => row.rank)).size,
        top_project: `${top.rank}. ${top.project_name}`,
        top_catalyst: top.catalyst_name,
        top_priority_score: top.catalyst_priority_score,
        catalyst_mix: catalysts,
      };
    })
    .sort((a, b) => b.top_priority_score - a.top_priority_score);
}

function markdown(summary, rows, catalystRows, focusRows) {
  const topRows = rows.slice(0, 20);
  return `# 공공 개발 촉매 맵

작성 기준: ${UPDATED_AT}

이 문서는 후보 30개 사업장을 잠실 MICE, 한강변관리, 동서울터미널, 구의·자양 한강축, 대치 학군, 송파 8/9호선 배후축 같은 공공 개발 동인과 연결한다. 촉매는 투자 판단의 확정값이 아니라, 어떤 공식 원문이 업데이트되면 어느 사업장을 다시 평가할지 정하는 감시 단위다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 촉매 유형 | ${summary.catalyst_count} |
| 사업장-촉매 연결 | ${summary.link_count} |
| 연결된 사업장 | ${summary.project_count} |
| 즉시/높음 감시 연결 | ${summary.high_watch_link_count} |
| 평균 촉매 우선점수 | ${summary.avg_catalyst_priority_score} |

## 생활권별 공공 촉매

${mdTable(focusRows, [
    { key: "focus_area", label: "생활권" },
    { key: "unique_projects", label: "사업장" },
    { key: "catalyst_links", label: "연결" },
    { key: "top_project", label: "대표 사업" },
    { key: "top_catalyst", label: "대표 촉매" },
    { key: "top_priority_score", label: "우선점수" },
    { key: "catalyst_mix", label: "촉매 분포" },
  ])}

## 촉매별 해석

${mdTable(catalystRows, [
    { key: "catalyst_name", label: "공공 촉매" },
    { key: "catalyst_type", label: "유형" },
    { key: "linked_projects", label: "사업장" },
    { key: "top_project", label: "대표 사업" },
    { key: "avg_potential", label: "평균 잠재" },
    { key: "avg_confidence", label: "평균 확신" },
    { key: "official_documents_to_check", label: "확인 원문" },
    { key: "interpretation_rule", label: "해석 규칙" },
  ])}

## 우선 확인 연결 Top 20

${mdTable(topRows, [
    { key: "catalyst_priority_score", label: "점수" },
    { key: "catalyst_name", label: "공공 촉매" },
    { key: "focus_area", label: "생활권" },
    { key: "rank", label: "순위" },
    { key: "project_name", label: "사업장" },
    { key: "current_stage", label: "단계" },
    { key: "watch_level", label: "감시" },
    { key: "av_scenario_label", label: "AV 시나리오" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 전체 연결

${mdTable(rows, [
    { key: "catalyst_name", label: "공공 촉매" },
    { key: "rank", label: "순위" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "mobility_axis", label: "교통축" },
    { key: "official_sources", label: "공식 출처" },
    { key: "project_note", label: "메모" },
  ])}
`;
}

async function main() {
  const [transportRows, potentialRows, reassessmentRows, avData, registryRows] = await Promise.all([
    readJson(TRANSPORT_INPUT),
    readJson(POTENTIAL_INPUT),
    readJson(REASSESSMENT_INPUT),
    readJson(AV_INPUT),
    readJson(REGISTRY_INPUT),
  ]);
  const rows = buildRows({
    transportRows: rowsFrom(transportRows),
    potentialByRank: byRank(rowsFrom(potentialRows)),
    reassessmentByRank: byRank(rowsFrom(reassessmentRows)),
    avByRank: byRank(rowsFrom(avData)),
    sourceById: bySourceId(rowsFrom(registryRows)),
  });
  const catalystRows = catalystSummary(rows);
  const focusRows = focusSummary(rows);
  const summary = {
    generated_at: UPDATED_AT,
    catalyst_count: catalystRows.length,
    link_count: rows.length,
    project_count: new Set(rows.map((row) => row.rank)).size,
    high_watch_link_count: rows.filter((row) => ["immediate", "high"].includes(row.watch_level)).length,
    avg_catalyst_priority_score: round(rows.reduce((sum, row) => sum + row.catalyst_priority_score, 0) / rows.length),
    inputs: [TRANSPORT_INPUT, POTENTIAL_INPUT, REASSESSMENT_INPUT, AV_INPUT, REGISTRY_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, catalyst_rows: catalystRows, focus_rows: focusRows, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows, catalystRows, focusRows));
  console.log(JSON.stringify({ catalysts: summary.catalyst_count, links: summary.link_count, output: "analysis/public-development-catalyst-map.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
