#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  projectMatrix: "analysis/project-comparison-matrix.json",
  potential: "analysis/long-term-potential-scorecard.json",
  risk: "analysis/project-risk-signal-summary.json",
  transport: "analysis/transport-location-context.json",
  expansionReview: "analysis/expansion-urban-notice-review-board.json",
  expansionShortlist: "analysis/expansion-interest-zone-shortlist.json",
};

const OUT_MD = "analysis/core-expansion-research-spine.md";
const OUT_JSON = "analysis/core-expansion-research-spine.json";
const OUT_CSV = "analysis/core-expansion-research-spine.csv";

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

function compact(value, limit = 140) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function byKey(rows, key) {
  return new Map(rows.map((row) => [String(row[key] ?? ""), row]));
}

function numeric(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function evidenceStateFromCore(row) {
  if (row.text_coverage === "text_extracted") return "원문+텍스트";
  if (row.text_coverage === "no_notice_text") return "공개단계만";
  return row.text_coverage || "미분류";
}

function evidenceStateFromExpansion(row) {
  if (row.verification_state === "confirmed_snapshot" && row.text_status === "ocr_extracted") return "원문+이미지 재대조";
  if (row.verification_state === "confirmed_snapshot" && row.text_status === "extracted") return "원문+텍스트";
  if (row.text_status === "ocr_extracted") return "원문+OCR 잠정값";
  if (row.text_status === "extracted") return "원문+텍스트";
  return row.text_status || "미분류";
}

function stageRank(value) {
  const order = {
    "정비계획 수립": 1,
    "정비구역지정": 2,
    "추진위원회승인": 3,
    "조합설립인가": 4,
    "사업시행인가": 5,
    "관리처분인가": 6,
    착공: 7,
    분양: 8,
  };
  return order[value] || 0;
}

function buildCoreAnchorRows({ matrixRows, potentialRows, riskRows, transportRows }) {
  const matrixByRank = byKey(matrixRows, "rank");
  const riskByRank = byKey(riskRows, "rank");
  const transportByRank = byKey(transportRows, "rank");

  const potentialByFocus = rowsFrom(potentialRows).reduce((acc, row) => {
    const key = row.focus_area || "미분류";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  const matrixByFocus = matrixRows.reduce((acc, row) => {
    const key = row.focus_area || "미분류";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  const focusAreas = ["강남", "잠실/송파", "구의/광진"];
  const out = [];

  for (const focusArea of focusAreas) {
    const potentialCandidates = (potentialByFocus[focusArea] || []).slice().sort((left, right) => {
      const delta = numeric(right.long_term_potential_score) - numeric(left.long_term_potential_score);
      if (delta) return delta;
      return numeric(left.rank) - numeric(right.rank);
    });
    const topPotential = potentialCandidates[0];
    if (topPotential) {
      const matrix = matrixByRank.get(String(topPotential.rank)) || {};
      const risk = riskByRank.get(String(topPotential.rank)) || {};
      const transport = transportByRank.get(String(topPotential.rank)) || {};
      out.push({
        scope: "core_anchor",
        area_group: focusArea,
        anchor_role: "top_potential",
        anchor_label: "장기 잠재 대표",
        reference_id: String(topPotential.rank),
        project_name: matrix.project_name || topPotential.project_name || "",
        current_stage_or_signal: matrix.current_stage_display || matrix.current_stage || topPotential.current_stage || "",
        stage_bucket: matrix.stage_bucket || "",
        official_notice_no: matrix.notice_no || "",
        official_notice_date: matrix.notice_date || "",
        official_value_snapshot: [
          matrix.district_area_sqm_official ? `면적 ${matrix.district_area_sqm_official}㎡` : "",
          matrix.total_households_official ? `세대 ${matrix.total_households_official}` : "",
          matrix.floor_area_ratio_pct_official ? `용적률 ${matrix.floor_area_ratio_pct_official}%` : "",
        ].filter(Boolean).join(", "),
        transit_axis: transport.mobility_axis || topPotential.mobility_axis || matrix.estimated_station_area || "",
        transit_lines_or_drivers: transport.primary_lines || transport.urban_change_drivers || matrix.strategic_tags || "",
        evidence_state: evidenceStateFromCore(matrix),
        confidence_or_grade: `${topPotential.evidence_grade || "-"} / 잠재 ${topPotential.long_term_potential_score || "-"} / 확신 ${topPotential.confidence_score || "-"}`,
        risk_or_caution: risk.mobility_risks || topPotential.downside_watch || matrix.risk_notes || "",
        long_term_view: transport.long_term_thesis || topPotential.long_term_thesis || matrix.next_research_question || "",
        comparison_hook: matrix.next_research_question || "",
        next_action: risk.next_action || matrix.next_action || "",
        source_path: topPotential.project_note || matrix.project_note || "",
      });
    }

    const stageCandidates = (matrixByFocus[focusArea] || []).slice().sort((left, right) => {
      const stageDelta = stageRank(right.current_stage) - stageRank(left.current_stage);
      if (stageDelta) return stageDelta;
      const coverageDelta = numeric(right.source_coverage_score) - numeric(left.source_coverage_score);
      if (coverageDelta) return coverageDelta;
      return numeric(left.rank) - numeric(right.rank);
    });
    const topPotentialRank = String(topPotential?.rank || "");
    const bestStageCandidate = stageCandidates[0];
    let stageAnchor = null;
    if (bestStageCandidate) {
      if (String(bestStageCandidate.rank) === topPotentialRank) {
        const sameStageRankCandidate = stageCandidates.find(
          (row) => String(row.rank) !== topPotentialRank && stageRank(row.current_stage) === stageRank(bestStageCandidate.current_stage),
        );
        stageAnchor = sameStageRankCandidate || bestStageCandidate;
      } else {
        stageAnchor = bestStageCandidate;
      }
    }
    if (stageAnchor) {
      const duplicate = out.find((row) => row.scope === "core_anchor" && row.reference_id === String(stageAnchor.rank));
      if (duplicate) {
        duplicate.anchor_role = "top_potential+stage_anchor";
        duplicate.anchor_label = "장기 잠재 대표 + 진행 단계 anchor";
      } else {
        const potential = potentialCandidates.find((row) => String(row.rank) === String(stageAnchor.rank)) || {};
        const risk = riskByRank.get(String(stageAnchor.rank)) || {};
        const transport = transportByRank.get(String(stageAnchor.rank)) || {};
        out.push({
          scope: "core_anchor",
          area_group: focusArea,
          anchor_role: "stage_anchor",
          anchor_label: "진행 단계 anchor",
          reference_id: String(stageAnchor.rank),
          project_name: stageAnchor.project_name || "",
          current_stage_or_signal: stageAnchor.current_stage_display || stageAnchor.current_stage || "",
          stage_bucket: stageAnchor.stage_bucket || "",
          official_notice_no: stageAnchor.notice_no || "",
          official_notice_date: stageAnchor.notice_date || "",
          official_value_snapshot: [
            stageAnchor.district_area_sqm_official ? `면적 ${stageAnchor.district_area_sqm_official}㎡` : "",
            stageAnchor.total_households_official ? `세대 ${stageAnchor.total_households_official}` : "",
            stageAnchor.floor_area_ratio_pct_official ? `용적률 ${stageAnchor.floor_area_ratio_pct_official}%` : "",
          ].filter(Boolean).join(", "),
          transit_axis: transport.mobility_axis || stageAnchor.estimated_station_area || "",
          transit_lines_or_drivers: transport.primary_lines || transport.urban_change_drivers || stageAnchor.strategic_tags || "",
          evidence_state: evidenceStateFromCore(stageAnchor),
          confidence_or_grade: `${potential.evidence_grade || "-"} / 잠재 ${potential.long_term_potential_score || "-"} / 확신 ${potential.confidence_score || "-"}`,
          risk_or_caution: risk.mobility_risks || potential.downside_watch || stageAnchor.risk_notes || "",
          long_term_view: transport.long_term_thesis || potential.long_term_thesis || stageAnchor.next_research_question || "",
          comparison_hook: stageAnchor.next_research_question || "",
          next_action: risk.next_action || stageAnchor.next_action || "",
          source_path: potential.project_note || stageAnchor.project_note || "",
        });
      }
    }
  }

  return out.sort((left, right) => {
    const order = ["강남", "잠실/송파", "구의/광진"];
    const areaDelta = order.indexOf(left.area_group) - order.indexOf(right.area_group);
    if (areaDelta) return areaDelta;
    if (left.anchor_role.includes("top_potential") && !right.anchor_role.includes("top_potential")) return -1;
    if (!left.anchor_role.includes("top_potential") && right.anchor_role.includes("top_potential")) return 1;
    return numeric(left.reference_id) - numeric(right.reference_id);
  });
}

function closestCoreReference(zoneName) {
  if (zoneName === "강동권") return "잠실/송파";
  if (zoneName === "약수동 주변") return "별도 도심근접형 대조군";
  return "";
}

function zoneQuestion(zoneName) {
  if (zoneName === "강동권") return "잠실 동측 연장축에서 대단지 잠실축보다 중간 체급 재건축이 더 현실적인 대안이 되는가.";
  if (zoneName === "약수동 주변") return "강남·잠실과 다른 도심 경사 생활권이 장기 대안축으로 성립하는가.";
  return "";
}

function buildExpansionRows({ shortlistRows, reviewRows }) {
  const shortlistById = byKey(shortlistRows, "shortlist_id");
  return reviewRows.map((row) => {
    const shortlist = shortlistById.get(String(row.shortlist_id)) || {};
    return {
      scope: "expansion_watch",
      area_group: row.zone_name || "",
      anchor_role: row.candidate_type || "",
      anchor_label:
        row.candidate_type === "direct_project" ? "direct 후보" :
        row.candidate_type === "adjacent_project" ? "adjacent 후보" :
        "context 후보",
      reference_id: row.shortlist_id || "",
      project_name: row.project_name || "",
      current_stage_or_signal: row.stage_signal || "",
      stage_bucket: shortlist.corridor_bucket || "",
      official_notice_no: row.notice_no || "",
      official_notice_date: row.notice_date || "",
      official_value_snapshot: row.value_snapshot || "",
      transit_axis: shortlist.transit_positioning || shortlist.corridor_bucket || "",
      transit_lines_or_drivers: shortlist.fit_reason || "",
      evidence_state: evidenceStateFromExpansion(row),
      confidence_or_grade: `${row.shortlist_priority || ""}${row.verification_state ? ` / ${row.verification_state}` : ""}`,
      risk_or_caution: row.caution || shortlist.main_risk || "",
      long_term_view: row.comparison_use || shortlist.next_gate || "",
      comparison_hook: zoneQuestion(row.zone_name),
      next_action: row.next_action || shortlist.next_action || "",
      source_path: row.text_path || "",
      closest_core_reference: closestCoreReference(row.zone_name),
      verification_state: row.verification_state || "",
    };
  });
}

async function main() {
  const [matrixInput, potentialInput, riskInput, transportInput, expansionReviewInput, expansionShortlistInput] = await Promise.all([
    readJson(INPUTS.projectMatrix),
    readJson(INPUTS.potential),
    readJson(INPUTS.risk),
    readJson(INPUTS.transport),
    readJson(INPUTS.expansionReview),
    readJson(INPUTS.expansionShortlist),
  ]);

  const coreRows = buildCoreAnchorRows({
    matrixRows: rowsFrom(matrixInput),
    potentialRows: rowsFrom(potentialInput),
    riskRows: rowsFrom(riskInput),
    transportRows: rowsFrom(transportInput),
  });
  const expansionRows = buildExpansionRows({
    shortlistRows: rowsFrom(expansionShortlistInput),
    reviewRows: rowsFrom(expansionReviewInput),
  });
  const rows = [...coreRows, ...expansionRows];

  const summary = {
    generated_at: `${kstDate()} KST`,
    core_anchor_count: coreRows.length,
    expansion_watch_count: expansionRows.length,
    total_rows: rows.length,
    core_focus_areas: [...new Set(coreRows.map((row) => row.area_group))].length,
    expansion_zones: [...new Set(expansionRows.map((row) => row.area_group))].length,
    expansion_direct_like_count: expansionRows.filter((row) => ["direct_project", "context_project"].includes(row.anchor_role)).length,
    expansion_adjacent_count: expansionRows.filter((row) => row.anchor_role === "adjacent_project").length,
    expansion_ocr_caution_count: expansionRows.filter((row) => row.evidence_state === "원문+OCR 잠정값").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };

  const bridgeRows = [
    {
      zone_name: "강동권",
      closest_core_reference: "잠실/송파",
      why_compare: "잠실 동측 연장축, 5·8호선 생활권, 가족형 주거 대체축 여부를 같은 질문으로 볼 수 있다.",
      question: zoneQuestion("강동권"),
    },
    {
      zone_name: "약수동 주변",
      closest_core_reference: "별도 도심근접형 대조군",
      why_compare: "강남·잠실·구의 축과 다른 도심 경사형 재개발이므로 직접 대응보다 새로운 생활권 가설로 읽는 편이 정확하다.",
      question: zoneQuestion("약수동 주변"),
    },
  ];
  const readingRule3 = summary.expansion_ocr_caution_count > 0
    ? "남아 있는 OCR 잠정값은 확정값으로 승격하지 않는다."
    : "이번 기준에서는 약수권까지 confirmed snapshot 기준으로 비교한다.";

  const md = `# 핵심·확장 리서치 스파인

작성 기준: ${summary.generated_at}

이 문서는 핵심 생활권 3개와 확장 관심권 2개를 한 판에서 계속 비교하기 위한 spine이다. 전체 30개 후보 대장을 다시 읽기 전에, 실제로 반복 점검할 core anchor와 expansion watch를 공식 원문 기준으로 묶는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 핵심 anchor | ${summary.core_anchor_count} |
| 확장 watch | ${summary.expansion_watch_count} |
| 총 spine 행 | ${summary.total_rows} |
| 핵심 생활권 | ${summary.core_focus_areas} |
| 확장 권역 | ${summary.expansion_zones} |
| 확장 direct/context | ${summary.expansion_direct_like_count} |
| 확장 adjacent | ${summary.expansion_adjacent_count} |
| OCR 잠정값 주의 | ${summary.expansion_ocr_caution_count} |

## 핵심 anchor

${mdTable(coreRows, [
    { key: "area_group", label: "생활권" },
    { key: "anchor_label", label: "역할" },
    { key: "project_name", label: "사업" },
    { key: "current_stage_or_signal", label: "단계" },
    { key: "official_value_snapshot", label: "공식값 요약" },
    { key: "transit_axis", label: "교통축" },
    { key: "confidence_or_grade", label: "근거/잠재" },
    { key: "risk_or_caution", label: "핵심 리스크" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 확장 watch

${mdTable(expansionRows, [
    { key: "area_group", label: "확장권" },
    { key: "anchor_label", label: "유형" },
    { key: "project_name", label: "사업" },
    { key: "current_stage_or_signal", label: "공식 신호" },
    { key: "verification_state", label: "검증상태" },
    { key: "official_value_snapshot", label: "원문 비교값" },
    { key: "transit_axis", label: "교통입지" },
    { key: "closest_core_reference", label: "비교 기준" },
    { key: "risk_or_caution", label: "주의" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 확장권 질문

${mdTable(bridgeRows, [
    { key: "zone_name", label: "확장권" },
    { key: "closest_core_reference", label: "가까운 core 기준" },
    { key: "why_compare", label: "왜 같이 보나" },
    { key: "question", label: "판단 질문" },
  ])}

## 읽는 순서

1. 핵심 생활권은 이 문서의 핵심 anchor에서 top potential과 stage anchor를 같이 본다.
2. 확장 관심권은 확장 watch에서 direct/context와 adjacent를 분리해 읽는다.
3. ${readingRule3}
4. 상세 수치와 전체 30개 후보는 [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)로 내려가고, 확장 원문은 [analysis/expansion-urban-notice-review-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-urban-notice-review-board.md)에서 다시 확인한다.
`;

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, core_rows: coreRows, expansion_rows: expansionRows, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);

  console.log(JSON.stringify({ coreAnchors: coreRows.length, expansionWatch: expansionRows.length, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
