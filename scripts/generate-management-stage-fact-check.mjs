#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const SUMMARIES_INPUT = "data/cleanup/project-summaries-priority-candidates.json";
const URBAN_DETAILS_INPUT = "data/urban/urban-map-details-priority-candidates.json";
const NOTICE_DETAILS_INPUT = "data/urban/urban-notice-details-priority-candidates.json";
const TEXT_MANIFEST_INPUT = "data/urban/text/notice-text-manifest.json";
const KEY_FIELDS_INPUT = "data/urban/text/notice-key-fields.json";
const MANAGEMENT_DOCS_INPUT = "data/cleanup/management-stage-doc-links.json";
const OUT_DIR = "analysis";
const UPDATED_AT = `${kstDate()} KST`;

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

function byRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank), row]));
}

function numeric(value) {
  const text = String(value ?? "").replaceAll(",", "");
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = match.slice(1).find((item) => item !== undefined && item !== "");
    if (value) return value;
  }
  return "";
}

function extractLineValue(text, includes, valuePattern, reject = []) {
  const lines = String(text ?? "").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!includes.every((needle) => line.includes(needle))) continue;
    if (reject.some((needle) => line.includes(needle))) continue;
    const match = line.match(valuePattern);
    if (match) return match[1];
  }
  return "";
}

function extractNoticeFacts(text, keyFields) {
  const compact = normalizeText(text);
  const households =
    firstMatch(compact, [
      /주택재건축\s*계획\s*:\s*([\d,]+)\s*세대/,
      /주택공급계획\s*:\s*([\d,]+)\s*세대/,
      /계\s+([\d,]+)\s+100\.0\s+(?:소형주택|주택의 규모)/,
    ]) || "";
  const plannedFar =
    extractLineValue(text, ["정비계획용적률"], /(\d+(?:\.\d+)?)%/) ||
    extractLineValue(text, ["상한용적률"], /(\d+(?:\.\d+)?)%/, ["법적", "예정법적"]) ||
    "";
  const legalFar =
    firstMatch(compact, [
      /예정법적상한용적률[^\d]*(\d+(?:\.\d+)?)%/,
      /법적상한용적률[^\d]*(\d+(?:\.\d+)?)%/,
      /법적상한\s+(\d+(?:\.\d+)?)%/,
    ]) || "";
  const maxFloor =
    firstMatch(compact, [/최고층수\((\d+)층\)/, /최고(\d+)층/, /최고층수\s*(\d+)층/]) || "";
  const maxHeight =
    firstMatch(compact, [/해발고도\s*(\d+(?:\.\d+)?m이하)/, /높이\(m\)[^0-9]*(\d+(?:\.\d+)?)/]) || "";
  const coverage =
    firstMatch(keyFields?.building_coverage_ratio_snippets || "", [
      /공동주택[^|]{0,120}?\s(\d+(?:\.\d+)?)\s+248/,
      /제3종일반주거지역\s+(\d+(?:\.\d+)?)%?\s*이하/,
    ]) || "";

  return {
    notice_households: households,
    notice_planned_far_pct: plannedFar,
    notice_legal_far_pct: legalFar,
    notice_max_floor: maxFloor,
    notice_max_height: maxHeight,
    notice_building_coverage_pct: coverage,
    notice_area_snippet: keyFields?.district_area_snippets || "",
    notice_households_snippet: keyFields?.households_snippets || "",
    notice_far_snippet: keyFields?.floor_area_ratio_snippets || "",
    notice_height_snippet: keyFields?.height_floors_snippets || "",
    notice_infrastructure_snippet: keyFields?.infrastructure_snippets || "",
    notice_public_contribution_snippet: keyFields?.public_contribution_snippets || "",
  };
}

function compareNumbers(primary, secondary, tolerance = 0.5) {
  const a = numeric(primary);
  const b = numeric(secondary);
  if (a === null || b === null) return "needs_manual_review";
  return Math.abs(a - b) <= tolerance ? "confirmed_match" : "source_time_diff_or_conflict";
}

function compareArea(primary, secondary) {
  const a = numeric(primary);
  const b = numeric(secondary);
  if (a === null || b === null) return "needs_manual_review";
  const tolerance = Math.max(1, a * 0.0005);
  return Math.abs(a - b) <= tolerance ? "confirmed_match" : "source_time_diff_or_conflict";
}

function compactSnippet(value, maxLength = 220) {
  const text = normalizeText(value).replaceAll("|", "/");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}...`;
}

function docsForRank(docRows, rank) {
  return docRows.filter((row) => String(row.rank) === String(rank));
}

function docByItem(rows, itemNo) {
  return rows.find((row) => String(row.item_no) === String(itemNo) && row.access_status === "public_table_extracted") || {};
}

function publicListItems(rows) {
  return rows
    .filter((row) => row.source_type === "정보몽땅_분담금목록")
    .map((row) => `${row.document_title}(${row.notice_date})`)
    .join("; ");
}

function sourceNote(row) {
  if (row.area_status === "confirmed_match" && row.households_status === "source_time_diff_or_conflict") {
    return "구역면적은 대체로 일치하지만 세대수는 사업개요와 고시문 시점이 달라 관리처분/사업시행 자료 재확인이 필요";
  }
  if (row.area_status === "source_time_diff_or_conflict") {
    return "사업개요와 도시공간포털 고시 면적이 달라 최신 변경고시 또는 관리처분 자료 대조 필요";
  }
  return "원문 후보 수치를 PDF와 대조한 뒤 확정값으로 승격 가능";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  return `${lines.join("\n")}\n`;
}

function mdTable(rows, fields) {
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function buildRows(matrixRows, summaries, urbanDetails, noticeDetails, manifests, keyFields, managementDocs) {
  const summariesByRank = byRank(summaries);
  const urbanByRank = byRank(urbanDetails);
  const noticeByRank = byRank(noticeDetails);
  const manifestByRank = byRank(manifests);
  const keyFieldsByRank = byRank(keyFields);
  const targets = matrixRows
    .filter((row) => row.current_stage === "관리처분인가" && row.fact_check_priority === "very_high" && row.text_coverage === "text_extracted")
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  return Promise.all(
    targets.map(async (matrix) => {
      const rank = String(matrix.rank);
      const summary = summariesByRank[rank] || {};
      const urban = urbanByRank[rank] || {};
      const notice = noticeByRank[rank] || {};
      const manifest =
        manifests.find(
          (row) =>
            String(row.rank) === rank &&
            String(row.notice_no || "") === String(matrix.notice_no || ""),
        ) || manifestByRank[rank] || {};
      const keyField =
        keyFields.find(
          (row) =>
            String(row.rank) === rank &&
            String(row.notice_no || "") === String(matrix.notice_no || ""),
        ) || keyFieldsByRank[rank] || {};
      const docs = docsForRank(managementDocs, rank);
      const projectApproval = docByItem(docs, "202");
      const projectOverview = docByItem(docs, "203");
      const costEstimate = docByItem(docs, "210");
      const managementApproval = docByItem(docs, "213");
      const noticeTextPath = matrix.text_path || manifest.text_path || "";
      const noticeText = noticeTextPath ? await readFile(noticeTextPath, "utf8") : "";
      const facts = extractNoticeFacts(noticeText, keyField);

      const row = {
        rank,
        focus_area: matrix.focus_area,
        project_name: matrix.project_name,
        current_stage: matrix.current_stage,
        official_summary_url: summary.summary_url || "",
        project_note: matrix.project_note || "",
        notice_no: notice.notice_no || matrix.notice_no || "",
        notice_date: notice.notice_date || matrix.notice_date || "",
        notice_title: notice.notice_title || matrix.notice_title || "",
        notice_text_path: noticeTextPath,
        summary_area_sqm: summary.district_area_sqm || matrix.district_area_sqm_official || "",
        urban_area_after_sqm: urban.urban_area_after || matrix.urban_area_after_sqm || "",
        summary_total_households: summary.total_households || matrix.total_households_official || "",
        notice_total_households_candidate: facts.notice_households,
        summary_floor_area_ratio_pct: summary.floor_area_ratio_pct || matrix.floor_area_ratio_pct_official || "",
        notice_planned_far_pct: facts.notice_planned_far_pct,
        notice_legal_far_pct: facts.notice_legal_far_pct,
        summary_building_coverage_pct: summary.building_coverage_ratio_pct || matrix.building_coverage_ratio_pct_official || "",
        notice_building_coverage_pct_candidate: facts.notice_building_coverage_pct,
        summary_max_height_m: summary.max_height_m || matrix.max_height_m_official || "",
        notice_max_height_candidate: facts.notice_max_height,
        summary_floors: summary.floors || matrix.floors_official || "",
        notice_max_floor_candidate: facts.notice_max_floor,
        project_approval_application_date: projectApproval.application_date || "",
        project_approval_date: projectApproval.approval_date || "",
        project_approval_notice_date: projectApproval.notice_date || "",
        project_overview_business_date: projectOverview.business_enforcement_date || "",
        project_overview_total_units: projectOverview.total_units || "",
        project_overview_sale_units: projectOverview.sale_units || "",
        project_overview_rental_units: projectOverview.rental_units || "",
        project_overview_far_pct: projectOverview.floor_area_ratio || "",
        project_overview_coverage_pct: projectOverview.building_coverage_ratio || "",
        management_approval_application_date: managementApproval.application_date || "",
        management_approval_date: managementApproval.approval_date || costEstimate.approval_date || "",
        management_approval_notice_date: managementApproval.notice_date || "",
        management_construction_cost: costEstimate.construction_cost || "",
        management_public_rows: docs.filter((doc) => doc.access_status === "public_table_extracted").length,
        management_placeholder_rows: docs.filter((doc) => doc.access_status === "no_public_table_placeholder").length,
        wct_public_items: publicListItems(docs),
        area_status: compareArea(summary.district_area_sqm || matrix.district_area_sqm_official, urban.urban_area_after || matrix.urban_area_after_sqm),
        households_status: compareNumbers(summary.total_households || matrix.total_households_official, facts.notice_households, 0),
        far_legal_status: compareNumbers(summary.floor_area_ratio_pct || matrix.floor_area_ratio_pct_official, facts.notice_legal_far_pct, 0.5),
        coverage_status: compareNumbers(summary.building_coverage_ratio_pct || matrix.building_coverage_ratio_pct_official, facts.notice_building_coverage_pct, 0.5),
        floor_status: compareNumbers((summary.floors || "").match(/지상:(\d+)/)?.[1] || "", facts.notice_max_floor, 0),
        review_note: "",
        next_source_to_check: "정보몽땅 공개항목의 별첨 원문, 최신 변경고시, 관리처분 인가 고시 원문",
        infrastructure_snippet: compactSnippet(facts.notice_infrastructure_snippet),
        public_contribution_snippet: compactSnippet(facts.notice_public_contribution_snippet),
        household_snippet: compactSnippet(facts.notice_households_snippet),
        far_snippet: compactSnippet(facts.notice_far_snippet),
      };
      row.review_note = sourceNote(row);
      return row;
    }),
  );
}

function markdown(rows) {
  const conflictRows = rows.filter((row) =>
    [row.area_status, row.households_status, row.coverage_status, row.floor_status].includes("source_time_diff_or_conflict"),
  );
  const sections = rows
    .map(
      (row) => `## ${row.rank}. ${row.project_name}

- 단계: ${row.current_stage}
- 고시: ${row.notice_no} / ${row.notice_date} / ${row.notice_title}
- 원문 텍스트: \`${row.notice_text_path}\`
- 사업 메모: \`${row.project_note}\`
- 판정 메모: ${row.review_note}

### 수치 대조

${mdTable([row], [
  { key: "summary_area_sqm", label: "사업개요 면적" },
  { key: "urban_area_after_sqm", label: "도시공간포털 면적" },
  { key: "area_status", label: "면적 판정" },
  { key: "summary_total_households", label: "사업개요 세대수" },
  { key: "notice_total_households_candidate", label: "고시문 세대수 후보" },
  { key: "households_status", label: "세대수 판정" },
])}

${mdTable([row], [
  { key: "summary_floor_area_ratio_pct", label: "사업개요 용적률" },
  { key: "notice_planned_far_pct", label: "고시문 계획/상한 용적률" },
  { key: "notice_legal_far_pct", label: "고시문 법적상한" },
  { key: "far_legal_status", label: "법적상한 판정" },
  { key: "summary_floors", label: "사업개요 층수" },
  { key: "notice_max_floor_candidate", label: "고시문 최고층 후보" },
  { key: "floor_status", label: "층수 판정" },
])}

### 정보몽땅 공개항목 보강

${mdTable([row], [
  { key: "project_approval_date", label: "사업시행인가일" },
  { key: "project_approval_notice_date", label: "사업시행 고시일" },
  { key: "management_approval_date", label: "관리처분인가일" },
  { key: "management_approval_notice_date", label: "관리처분 고시일" },
  { key: "management_public_rows", label: "공개표 추출" },
  { key: "management_placeholder_rows", label: "표 미공개 항목" },
])}

${mdTable([row], [
  { key: "project_overview_total_units", label: "사업시행 총세대" },
  { key: "project_overview_sale_units", label: "사업시행 분양" },
  { key: "project_overview_rental_units", label: "사업시행 임대" },
  { key: "project_overview_far_pct", label: "사업시행 용적률" },
  { key: "project_overview_coverage_pct", label: "사업시행 건폐율" },
  { key: "management_construction_cost", label: "관리처분 공사비" },
])}

분담금 목록 공개항목: ${row.wct_public_items || "공개 목록 미확인"}

### 원문 스니펫

- 세대수: ${row.household_snippet}
- 용적률: ${row.far_snippet}
- 기반시설: ${row.infrastructure_snippet}
- 공공기여: ${row.public_contribution_snippet}

다음 확인 원문: ${row.next_source_to_check}
`,
    )
    .join("\n");

  return `# 관리처분 단계 원문 수치 대조

작성 기준: ${UPDATED_AT}

이 문서는 \`analysis/focus-area-action-queue.csv\`에서 우선순위가 가장 높은 관리처분인가 사업 중 고시문 텍스트가 추출된 사업을 대상으로, 정비사업 정보몽땅 사업개요와 서울도시공간포털 고시문 숫자를 대조한 결과다.

주의: 관리처분인가 단계 사업은 정비구역 지정/변경 고시 이후 사업시행계획, 관리처분계획, 설계 변경을 거치면서 세대수·건폐율·층수가 달라질 수 있다. 따라서 아래의 \`source_time_diff_or_conflict\`는 곧바로 오류라는 뜻이 아니라, 최신 인가 문서로 재확인해야 하는 수치라는 뜻이다.

## 요약

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "notice_date", label: "고시일" },
  { key: "summary_total_households", label: "사업개요 세대수" },
  { key: "notice_total_households_candidate", label: "고시문 세대수" },
  { key: "households_status", label: "세대수 판정" },
  { key: "summary_area_sqm", label: "사업개요 면적" },
  { key: "urban_area_after_sqm", label: "도시공간포털 면적" },
  { key: "area_status", label: "면적 판정" },
])}

## 바로 할 일

${conflictRows
  .map((row) => `- ${row.rank}. ${row.project_name}: ${row.next_source_to_check}`)
  .join("\n")}

${sections}
`;
}

async function main() {
  const [matrixRows, summaries, urbanDetails, noticeDetails, manifests, keyFields] = await Promise.all([
    readFile(MATRIX_INPUT, "utf8").then(JSON.parse),
    readFile(SUMMARIES_INPUT, "utf8").then(JSON.parse),
    readFile(URBAN_DETAILS_INPUT, "utf8").then(JSON.parse),
    readFile(NOTICE_DETAILS_INPUT, "utf8").then(JSON.parse),
    readFile(TEXT_MANIFEST_INPUT, "utf8").then(JSON.parse),
    readFile(KEY_FIELDS_INPUT, "utf8").then(JSON.parse),
  ]);
  let managementDocs = [];
  try {
    managementDocs = JSON.parse(await readFile(MANAGEMENT_DOCS_INPUT, "utf8"));
  } catch {
    managementDocs = [];
  }

  const rows = await buildRows(matrixRows, summaries, urbanDetails, noticeDetails, manifests, keyFields, managementDocs);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "management-stage-fact-check.json"), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "management-stage-fact-check.csv"), toCsv(rows));
  await writeFile(path.join(OUT_DIR, "management-stage-fact-check.md"), markdown(rows));
  console.log(`Wrote ${rows.length} management-stage fact-check rows`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
