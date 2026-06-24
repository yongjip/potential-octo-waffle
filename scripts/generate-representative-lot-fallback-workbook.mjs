#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "representative-lot-fallback-workbook.md");
const OUT_CSV = path.join(OUT_DIR, "representative-lot-fallback-workbook.csv");
const OUT_JSON = path.join(OUT_DIR, "representative-lot-fallback-workbook.json");

const INPUTS = {
  matrix: "analysis/project-comparison-matrix.json",
  representativeLotCandidates: "data/urban/representative-lot-map-candidates.csv",
  urbanMapDetails: "data/urban/urban-map-details-priority-candidates.json",
  reassessmentWatchlist: "analysis/reassessment-watchlist.json",
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

function compact(values, limit = 5) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].slice(0, limit);
}

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || "").trim();
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

function normalizeNoticeNo(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d+$/.test(text) ? text : "";
}

function groupBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(row);
    return acc;
  }, new Map());
}

function stageOrder(stage) {
  return {
    "정비계획 수립": 1,
    안전진단: 1,
    정비구역지정: 2,
    추진위원회승인: 3,
    조합설립인가: 4,
    사업시행인가: 5,
    관리처분인가: 6,
    착공: 7,
    분양: 8,
  }[stage] || 99;
}

function chooseFallbackCandidate(rows, layerName) {
  return rows
    .filter((row) => row.layer_name === layerName)
    .sort((left, right) => {
      const leftRank = Number(left.recommendation_rank || 9999);
      const rightRank = Number(right.recommendation_rank || 9999);
      if (leftRank !== rightRank) return leftRank - rightRank;
      return Number(right.layer_score || 0) - Number(left.layer_score || 0);
    })[0];
}

function buildRows({ matrix, representativeLotCandidates, urbanMapDetails, reassessmentWatchlist }) {
  const repByRank = groupBy(representativeLotCandidates, (row) => String(row.rank || ""));
  const watchByRank = Object.fromEntries((reassessmentWatchlist || []).map((row) => [String(row.rank), row]));
  const urbanByRank = Object.fromEntries((urbanMapDetails || []).map((row) => [String(row.rank), row]));

  return matrix
    .filter((row) => row.business_layer_alignment_status === "representative_lot_fallback_only")
    .map((row) => {
      const rank = String(row.rank);
      const repRows = repByRank.get(rank) || [];
      const uq120 = chooseFallbackCandidate(repRows, "UPIS_C_UQ120") || {};
      const bestMap = chooseFallbackCandidate(repRows, "UPIS_C_UQ181") || {};
      const watch = watchByRank[rank] || {};
      const urban = urbanByRank[rank] || {};
      const sourcesToOpen = compact([
        row.project_note,
        row.text_path,
        urban.official_map_url,
        row.stage_date_override_review,
        watch.first_outputs_to_read,
      ]).join("; ");

      return {
        watch_rank: Number(watch.watch_rank || 999),
        rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        current_stage: row.current_stage,
        watch_level: watch.watch_level || "",
        track: watch.track || "",
        trigger_type: watch.trigger_type || "",
        direct_notice_no: normalizeNoticeNo(row.notice_no),
        direct_notice_date: row.notice_date || "",
        direct_notice_title: row.notice_title || "",
        urban_record_code: urban.urban_record_code || bestMap.record_code || "",
        urban_notice_code: urban.urban_notice_code || bestMap.notice_code || "",
        urban_map_url: urban.official_map_url || bestMap.recommended_map_url || "",
        representative_lot_confidence: urban.representative_lot_map_confidence || bestMap.confidence || "",
        uq120_layer_name: uq120.layer_name || "",
        uq120_zone_name: uq120.zone_name || row.business_layer_zone_name || "",
        uq120_candidate_stage: uq120.current_stage || row.business_layer_stage || "",
        uq120_candidate_confidence: uq120.confidence || row.business_layer_match_confidence || "",
        uq120_candidate_tokens: uq120.matched_token_count || "",
        uq120_candidate_score: uq120.layer_score || "",
        present_sn_status: row.business_present_sn ? "present" : "missing",
        data_reference_date_status: row.business_layer_data_reference_date ? "present" : "missing",
        cleanup_link_status: row.business_layer_cleanup_url ? "present" : "missing",
        unresolved_reason: row.business_layer_alignment_note || "",
        next_action: row.next_action || watch.next_action || "",
        runbook_id: watch.runbook_id || "",
        route: watch.fieldwork_route || "",
        project_note: row.project_note || "",
        sources_to_open: sourcesToOpen,
      };
    })
    .sort((left, right) => {
      const watchDelta = left.watch_rank - right.watch_rank;
      if (watchDelta !== 0) return watchDelta;
      const stageDelta = stageOrder(left.current_stage) - stageOrder(right.current_stage);
      if (stageDelta !== 0) return stageDelta;
      return Number(left.rank) - Number(right.rank);
    });
}

function buildSummary(rows) {
  return {
    generated_at: UPDATED_AT,
    project_count: rows.length,
    focus_area_counts: countBy(rows, "focus_area"),
    watch_level_counts: countBy(rows, "watch_level"),
    current_stage_counts: countBy(rows, "current_stage"),
    trigger_type_counts: countBy(rows, "trigger_type"),
    present_sn_missing_count: rows.filter((row) => row.present_sn_status === "missing").length,
    data_reference_date_missing_count: rows.filter((row) => row.data_reference_date_status === "missing").length,
    cleanup_link_missing_count: rows.filter((row) => row.cleanup_link_status === "missing").length,
  };
}

function markdown(rows, summary) {
  return `# Representative Lot Fallback Workbook

작성 기준: ${UPDATED_AT}

이 문서는 \`representative_lot_fallback_only\`로 남아 있는 사업만 따로 묶는다. 핵심은 \`직접 고시 기준 현재 단계\`와 \`current business UQ120 식별자\`를 섞지 않는 것이다. 즉, 정비구역/인가 단계는 이미 공식 원문으로 잠겼더라도, \`presentSn\`, \`urban_data_reference_date\`, \`cleanup_site_url\`가 비어 있으면 사업 레이어 current business는 아직 미확정으로 유지한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| fallback only 사업장 | ${summary.project_count} |
| presentSn 미확인 | ${summary.present_sn_missing_count} |
| 데이터 기준일 미확인 | ${summary.data_reference_date_missing_count} |
| 정보몽땅 연결 미확인 | ${summary.cleanup_link_missing_count} |
| 생활권 분포 | ${countText(summary.focus_area_counts)} |
| 감시 레벨 분포 | ${countText(summary.watch_level_counts)} |
| 현재 단계 분포 | ${countText(summary.current_stage_counts)} |
| 트리거 분포 | ${countText(summary.trigger_type_counts)} |

## 사업장별 현황

${mdTable(rows, [
    { key: "watch_rank", label: "감시순위" },
    { key: "rank", label: "후보" },
    { key: "focus_area", label: "생활권" },
    { key: "project_name", label: "사업장" },
    { key: "current_stage", label: "직접 고시 단계" },
    { key: "uq120_candidate_stage", label: "UQ120 후보 단계" },
    { key: "direct_notice_no", label: "직접 고시번호" },
    { key: "urban_record_code", label: "정비구역 recordCode" },
    { key: "present_sn_status", label: "presentSn" },
    { key: "data_reference_date_status", label: "기준일" },
    { key: "cleanup_link_status", label: "정보몽땅 연결" },
    { key: "next_action", label: "다음 작업" },
  ])}

## 상세

${rows
  .map(
    (row) => `### ${row.watch_rank}. ${row.project_name}

- 생활권/감시: ${row.focus_area} / ${row.watch_level || "미확인"} / ${row.track || "미확인"}
- 직접 잠긴 단계: ${row.current_stage} (${row.direct_notice_no || "고시번호 미확인"} / ${row.direct_notice_date || "고시일 미확인"})
- 정비구역 식별자: recordCode ${row.urban_record_code || "미확인"}, noticeCode ${row.urban_notice_code || "미확인"}
- 대표지번 후보: ${row.uq120_layer_name || "미확인"} / ${row.uq120_zone_name || "미확인"} / 단계 ${row.uq120_candidate_stage || "미확인"} / 신뢰도 ${row.uq120_candidate_confidence || "미확인"}
- current business 미확정 사유: ${row.unresolved_reason || "미확인"}
- 아직 비어 있는 것: presentSn ${row.present_sn_status}, 기준일 ${row.data_reference_date_status}, 정보몽땅 연결 ${row.cleanup_link_status}
- 다음 작업: ${row.next_action || "미확인"}
- 먼저 열 자료: ${row.sources_to_open || "미확인"}
`,
  )
  .join("\n")}

## 판정 원칙

- \`urban_record_code\`, \`urban_notice_code\`는 정비구역/고시 식별자다. 이것만으로 \`current business presentSn\`가 있다고 간주하지 않는다.
- \`UPIS_C_UQ120\` 후보 단계가 direct notice와 같아도, \`presentSn\`와 \`urban_data_reference_date\`가 비어 있으면 \`current business\`로 승격하지 않는다.
- 따라서 이 워크북의 목적은 단계 상향이 아니라, \`현재 단계는 direct notice로 유지\`하면서 \`UQ120 current business 식별자만 별도 클로저\`로 빼는 데 있다.
`;
}

async function main() {
  const matrix = await readJson(INPUTS.matrix);
  const representativeLotCandidates = parseCsv(await readFile(INPUTS.representativeLotCandidates, "utf8"));
  const urbanMapDetails = await readJson(INPUTS.urbanMapDetails);
  const reassessmentWatchlist = await readJson(INPUTS.reassessmentWatchlist);

  const rows = buildRows({ matrix, representativeLotCandidates, urbanMapDetails, reassessmentWatchlist });
  const summary = buildSummary(rows);
  const payload = { generated_at: UPDATED_AT, summary, rows, inputs: INPUTS };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${markdown(rows, summary)}\n`);

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        presentSnMissing: summary.present_sn_missing_count,
        focusAreas: summary.focus_area_counts,
        output: "analysis/representative-lot-fallback-workbook.{md,csv,json}",
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
