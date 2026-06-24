#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const FACT_CHECK_INPUT = "analysis/management-stage-fact-check.json";
const ORIGINAL_NOTICE_PROBES_INPUT = "data/urban/original-notice-file-probes.json";
const GWANGJIN_STAGE_DOCS_INPUT = "data/cleanup/gwangjin-stage-public-docs.json";
const GWANGJIN_GU_NOTICE_INPUT = "data/urban/gwangjin-gu-notice-candidates.json";
const GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT = "data/urban/gwangjin-gu-notice-attachments.csv";
const GANGNAM_SONGPA_NOTICE_INPUT = "data/urban/gangnam-songpa-notice-candidates.json";
const GANGNAM_SONGPA_NOTICE_ATTACHMENTS_INPUT = "data/urban/gangnam-songpa-notice-attachments.csv";
const SEOUL_SIBO_ORIGINAL_NOTICE_INPUT = "data/urban/seoul-sibo-original-notice-sources.json";
const OUT_DIR = "analysis";

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

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
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

function riskFlags(row, factCheck, probeSummary, stageDoc, guNoticeSummary, gangnamSongpaNoticeSummary, seoulSiboSource) {
  const flags = [];
  if (row.has_urban_map !== "Y") flags.push("지도 recordCode 미확보");
  if (row.urban_map_source === "representative_lot") flags.push("대표지번 fallback 지도");
  if (row.has_business_layer_match === "Y" && row.has_urban_map !== "Y") flags.push("사업구역 레이어만 매칭");
  if (row.business_layer_alignment_status === "representative_lot_fallback_only") flags.push("대표지번 fallback 사업 레이어");
  if (row.business_layer_alignment_status === "planning_layer_possible") flags.push("사업 레이어가 기획/다른 사업일 가능성");
  if (row.business_layer_alignment_status === "aligned_but_low_confidence") flags.push("사업 레이어 저신뢰");
  if (row.business_layer_alignment_status === "aligned_with_medium_confidence") flags.push("사업 레이어 medium 신뢰");
  if (row.business_layer_alignment_status === "stage_ahead_of_matrix") flags.push("사업 레이어 단계 선행");
  if (row.business_layer_alignment_status === "stage_mismatch" || row.business_layer_alignment_status === "type_mismatch") {
    flags.push("사업 레이어 정합성 재확인 필요");
  }
  if (stageDoc?.access_status === "public_table_extracted") flags.push("정보몽땅 단계 공개항목 확보");
  if (guNoticeSummary?.candidate_count) flags.push("광진구청 고시공고 후보 확보");
  if (guNoticeSummary?.attachment_count) flags.push("광진구청 첨부 원문 확보");
  if (row.has_gwangjin_gu_notice_text === "Y") flags.push("광진구청 첨부 텍스트 확보");
  if (Number(row.gwangjin_gu_notice_ocr_text_count || 0) > 0) flags.push("광진구청 PDF OCR 텍스트");
  if (gangnamSongpaNoticeSummary?.candidate_count) flags.push("강남·송파구청 고시공고 후보 확보");
  if (gangnamSongpaNoticeSummary?.attachment_count) flags.push("강남·송파구청 첨부 원문 확보");
  if (row.has_gangnam_songpa_notice_text === "Y") flags.push("강남·송파구청 첨부 텍스트 확보");
  if (row.has_business_notice_candidate === "Y") flags.push("사업구역 기반 고시 후보");
  if (String(row.business_notice_file_name || "").includes("정정")) flags.push("정정고시 파일");
  if (seoulSiboSource?.local_pdf) flags.push("서울시보 본고시 원문 확보");
  if (!seoulSiboSource?.local_pdf && probeSummary?.probe_count && !probeSummary.pdf_found) flags.push("본고시 파일명 후보 PDF 미확인");
  if (row.has_notice_detail !== "Y") flags.push("고시 상세 미확보");
  if (row.has_local_notice_file !== "Y") flags.push("로컬 원문 없음");
  if (row.text_coverage === "ocr_needed") flags.push("OCR 필요");
  if (row.notice_text_extraction_status === "ocr_extracted") flags.push("OCR 텍스트");
  if (row.notice_text_extraction_status === "hwp_ocr_extracted") flags.push("HWP 이미지 OCR 텍스트");
  if (row.text_coverage === "hwp_text_low_confidence" || row.text_coverage === "hwp_or_ocr_needed") flags.push("HWP/OCR 재확인 필요");
  if (row.text_coverage === "no_notice_text") flags.push("원문 텍스트 없음");
  if (row.has_area_snippet !== "Y") flags.push("면적 스니펫 없음");
  if (row.has_household_snippet !== "Y") flags.push("세대수 스니펫 없음");
  if (!row.total_households_official) flags.push("사업개요 세대수 공란");
  if (["정비계획 수립", "안전진단", "정비구역지정", "추진위원회승인"].includes(row.current_stage)) flags.push("초기 단계 변동성");
  if (
    factCheck &&
    [factCheck.area_status, factCheck.households_status, factCheck.far_legal_status, factCheck.coverage_status, factCheck.floor_status].includes(
      "source_time_diff_or_conflict",
    )
  ) {
    flags.push("수치 시점차/충돌");
  }
  return flags;
}

function evidenceGrade(row, flags) {
  if (
    row.has_notice_detail === "Y" &&
    row.has_local_notice_file === "Y" &&
    row.text_coverage === "text_extracted" &&
    row.has_area_snippet === "Y" &&
    row.has_infrastructure_snippet === "Y" &&
    !flags.includes("지도 recordCode 미확보") &&
    !flags.includes("대표지번 fallback 지도") &&
    !flags.includes("OCR 텍스트") &&
    !flags.includes("HWP 이미지 OCR 텍스트") &&
    !flags.includes("본고시 파일명 후보 PDF 미확인") &&
    !flags.includes("수치 시점차/충돌") &&
    !flags.includes("사업개요 세대수 공란") &&
    !flags.includes("초기 단계 변동성")
  ) {
    return "A";
  }
  if (row.has_notice_detail === "Y" && row.has_local_notice_file === "Y" && row.text_coverage === "text_extracted") {
    return "B";
  }
  if (row.has_notice_detail === "Y" && row.has_local_notice_file === "Y") {
    return "C";
  }
  if (flags.includes("광진구청 첨부 원문 확보")) {
    return "C";
  }
  if (flags.includes("광진구청 첨부 텍스트 확보")) {
    return "C";
  }
  if (flags.includes("강남·송파구청 첨부 원문 확보")) {
    return "C";
  }
  if (flags.includes("강남·송파구청 첨부 텍스트 확보")) {
    return "C";
  }
  if (row.has_business_layer_match === "Y" || row.has_cleanup_url === "Y") {
    return "D";
  }
  return "E";
}

function nextEvidenceAction(row, flags) {
  if (flags.includes("서울시보 본고시 원문 확보")) return "analysis/seoul-sibo-original-notice-fact-check.md 기준으로 본고시 수치와 재공람·정정고시 수치 대조";
  if (flags.includes("본고시 파일명 후보 PDF 미확인")) return "서울시보 원문/LURIS/정보몽땅 공개자료에서 본고시 원문 확보";
  if (flags.includes("광진구청 첨부 텍스트 확보")) return "analysis/gwangjin-gu-notice-fact-check.md 기준으로 원문 수치·정보몽땅 단계 공개항목 대조";
  if (flags.includes("광진구청 첨부 원문 확보")) return "광진구청 첨부 PDF/HWPX 텍스트 추출 후 인가·계획 수치 대조";
  if (flags.includes("강남·송파구청 첨부 텍스트 확보")) return "analysis/gangnam-songpa-notice-probe.md 기준으로 원문 사업명·위치·면적을 기존 고시/사업개요와 대조";
  if (flags.includes("강남·송파구청 첨부 원문 확보")) return "강남·송파구청 첨부 PDF/HWP/HWPX 텍스트 추출 후 사업명·위치·면적 대조";
  if (flags.includes("사업 레이어가 기획/다른 사업일 가능성")) return "현재 presentSn가 신속통합기획/다른 사업 레이어인지 확인하고, 재건축 현재 사업 식별자는 별도로 찾기";
  if (flags.includes("대표지번 fallback 사업 레이어")) return "대표지번 매칭 후보만 있으므로 current business presentSn·기준일은 별도 확인";
  if (flags.includes("사업 레이어 정합성 재확인 필요")) return "사업 레이어 유형·단계와 현재 사업 단계가 왜 다른지 확인하고 current business presentSn인지 재판정";
  if (flags.includes("사업 레이어 단계 선행")) return "사업 레이어 단계 선행이 최신 공식 단계 반영인지, 비교표 단계가 늦은지 확인";
  if (flags.includes("사업 레이어 저신뢰")) return "presentSn 후보는 보조로 두고, direct 고시·정보몽땅 연결 또는 추가 공식 링크로 current business 여부 확인";
  if (flags.includes("사업 레이어 medium 신뢰")) return "presentSn 후보를 current business 보조 식별자로 유지하되 direct 고시·recordCode 연결로 닫기";
  if (
    flags.includes("지도 recordCode 미확보") &&
    flags.includes("사업구역 레이어만 매칭") &&
    flags.includes("정보몽땅 단계 공개항목 확보")
  ) {
    return "단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode 또는 자치구 고시 원문 연결";
  }
  if (flags.includes("지도 recordCode 미확보") && flags.includes("사업구역 레이어만 매칭")) return "결정고시 recordCode 또는 인가 원문 수동 확인";
  if (flags.includes("OCR 필요")) return "스캔 PDF OCR 후 key-fields 재생성";
  if (flags.includes("OCR 텍스트")) return "OCR 텍스트 스니펫을 원문 이미지와 대조해 확정 수치 승격";
  if (flags.includes("HWP 이미지 OCR 텍스트")) return "HWP 이미지 OCR 스니펫을 원문 이미지와 대조해 확정 수치 승격";
  if (flags.includes("HWP/OCR 재확인 필요")) return "HWP 원문 수동 검수 또는 별도 변환기로 재추출";
  if (flags.includes("수치 시점차/충돌")) return "사업시행계획서/관리처분계획서/최신 변경고시로 수치 시점 확정";
  if (flags.includes("대표지번 fallback 지도")) return "서울도시공간포털 지도 팝업에서 recordCode와 구역명 재확인";
  if (flags.includes("사업개요 세대수 공란")) return "고시문 주택공급계획 또는 정보몽땅 사업개요 업데이트 확인";
  if (row.text_coverage === "text_extracted") return "원문 스니펫을 읽고 확정 수치/조건으로 승격";
  return row.next_action || "공식 원문 추가 확인";
}

function buildRows(matrixRows, factRows, probeRows, stageDocRows, guNoticeRows, guAttachmentRows, gangnamSongpaNoticeRows, gangnamSongpaAttachmentRows, seoulSiboRows) {
  const factByRank = byRank(factRows);
  const stageDocByRank = byRank(stageDocRows);
  const guNoticeSummaryByRank = guNoticeRows.reduce((acc, row) => {
    const key = String(row.rank);
    if (!acc[key]) acc[key] = { candidate_count: 0, attachment_count: 0 };
    if (row.search_status === "candidate" && row.match_confidence === "high") acc[key].candidate_count += 1;
    return acc;
  }, {});
  for (const row of guAttachmentRows) {
    const key = String(row.rank);
    if (!guNoticeSummaryByRank[key]) guNoticeSummaryByRank[key] = { candidate_count: 0, attachment_count: 0 };
    if (row.local_path) guNoticeSummaryByRank[key].attachment_count += 1;
  }
  const gangnamSongpaNoticeSummaryByRank = gangnamSongpaNoticeRows.reduce((acc, row) => {
    const key = String(row.rank);
    if (!acc[key]) acc[key] = { candidate_count: 0, attachment_count: 0 };
    if (row.search_status === "candidate" && row.match_confidence === "high") acc[key].candidate_count += 1;
    return acc;
  }, {});
  for (const row of gangnamSongpaAttachmentRows) {
    const key = String(row.rank);
    if (!gangnamSongpaNoticeSummaryByRank[key]) gangnamSongpaNoticeSummaryByRank[key] = { candidate_count: 0, attachment_count: 0 };
    if (row.local_path) gangnamSongpaNoticeSummaryByRank[key].attachment_count += 1;
  }
  const probeByRank = probeRows.reduce((acc, row) => {
    const key = String(row.rank);
    if (!acc[key]) acc[key] = { probe_count: 0, pdf_found: 0 };
    acc[key].probe_count += 1;
    if (row.looks_like_pdf === "Y") acc[key].pdf_found += 1;
    return acc;
  }, {});
  const seoulSiboByRank = Object.fromEntries(seoulSiboRows.map((row) => [String(row.project_rank), row]));

  return matrixRows.map((row) => {
    const flags = riskFlags(
      row,
      factByRank[String(row.rank)],
      probeByRank[String(row.rank)],
      stageDocByRank[String(row.rank)],
      guNoticeSummaryByRank[String(row.rank)],
      gangnamSongpaNoticeSummaryByRank[String(row.rank)],
      seoulSiboByRank[String(row.rank)],
    );
    return {
      rank: row.rank,
      priority_tier: row.priority_tier,
      focus_area: row.focus_area,
      district: row.district,
      dong: row.dong,
      project_name: row.project_name,
      current_stage: row.current_stage,
      evidence_grade: evidenceGrade(row, flags),
      source_coverage_score: row.source_coverage_score,
      has_cleanup_url: row.has_cleanup_url,
      has_urban_map: row.has_urban_map,
      urban_map_source: row.urban_map_source,
      has_business_layer_match: row.has_business_layer_match,
      has_business_notice_candidate: row.has_business_notice_candidate,
      has_seoul_sibo_original_notice: row.has_seoul_sibo_original_notice || "N",
      seoul_sibo_original_notice_no: row.seoul_sibo_original_notice_no || "",
      has_notice_detail: row.has_notice_detail,
      has_local_notice_file: row.has_local_notice_file,
      text_coverage: row.text_coverage,
      notice_text_extraction_status: row.notice_text_extraction_status || "",
      has_gwangjin_gu_notice_text: row.has_gwangjin_gu_notice_text || "N",
      gwangjin_gu_notice_text_coverage: row.gwangjin_gu_notice_text_coverage || "",
      gwangjin_gu_notice_text_count: row.gwangjin_gu_notice_text_count || 0,
      gwangjin_gu_notice_ocr_text_count: row.gwangjin_gu_notice_ocr_text_count || 0,
      has_gangnam_songpa_notice_text: row.has_gangnam_songpa_notice_text || "N",
      gangnam_songpa_notice_text_coverage: row.gangnam_songpa_notice_text_coverage || "",
      gangnam_songpa_notice_text_count: row.gangnam_songpa_notice_text_count || 0,
      gangnam_songpa_notice_ocr_text_count: row.gangnam_songpa_notice_ocr_text_count || 0,
      notice_no: row.notice_no,
      notice_date: row.notice_date,
      fact_check_priority: row.fact_check_priority,
      stage_public_doc_status: stageDocByRank[String(row.rank)]?.access_status || "",
      stage_public_approval_date: stageDocByRank[String(row.rank)]?.approval_date || "",
      stage_public_consent_rate: stageDocByRank[String(row.rank)]?.consent_rate_pct || "",
      gwangjin_gu_notice_candidate_count:
        guNoticeSummaryByRank[String(row.rank)]?.candidate_count || Number(row.gwangjin_gu_notice_candidate_count || 0),
      gwangjin_gu_notice_attachment_count:
        guNoticeSummaryByRank[String(row.rank)]?.attachment_count || Number(row.gwangjin_gu_notice_attachment_count || 0),
      gangnam_songpa_notice_candidate_count:
        gangnamSongpaNoticeSummaryByRank[String(row.rank)]?.candidate_count || Number(row.gangnam_songpa_notice_candidate_count || 0),
      gangnam_songpa_notice_attachment_count:
        gangnamSongpaNoticeSummaryByRank[String(row.rank)]?.attachment_count || Number(row.gangnam_songpa_notice_attachment_count || 0),
      risk_flags: flags.join("; "),
      next_evidence_action: nextEvidenceAction(row, flags),
      project_note: row.project_note,
    };
  });
}

function summaryRows(rows) {
  const grades = ["A", "B", "C", "D", "E"];
  return grades.map((grade) => ({
    evidence_grade: grade,
    count: rows.filter((row) => row.evidence_grade === grade).length,
  }));
}

function markdown(rows) {
  const highFriction = rows.filter((row) => ["C", "D", "E"].includes(row.evidence_grade) || row.risk_flags.includes("수치 시점차/충돌"));
  const byFocus = Object.entries(
    rows.reduce((acc, row) => {
      if (!acc[row.focus_area]) acc[row.focus_area] = { total: 0, a: 0, b: 0, cde: 0 };
      acc[row.focus_area].total += 1;
      if (row.evidence_grade === "A") acc[row.focus_area].a += 1;
      else if (row.evidence_grade === "B") acc[row.focus_area].b += 1;
      else acc[row.focus_area].cde += 1;
      return acc;
    }, {}),
  ).map(([focus_area, values]) => ({ focus_area, ...values }));

  return `# 공식 근거 품질 감사

작성 기준: ${kstDate()} KST

이 문서는 30개 후보를 비교할 때 어떤 사업이 바로 해석 가능하고, 어떤 사업이 먼저 원문 보강이 필요한지 구분하기 위한 감사표다. 등급은 투자 매력도가 아니라 공식 근거 품질이다.

## 등급 기준

- A: 고시 상세, 로컬 원문, 텍스트 추출, 핵심 스니펫이 있고 지도 recordCode 리스크가 낮음
- B: 고시 원문과 텍스트는 있으나 일부 스니펫/대표지번 fallback/초기단계 등 보강 필요
- C: 자치구 원문/텍스트 또는 고시 원문은 있으나 recordCode·OCR 검수·수치 대조 등 검증 병목 있음
- D: 정보몽땅 또는 사업구역 레이어는 있으나 고시 recordCode/원문 연결이 부족
- E: 공식 원문 연결이 거의 없는 상태

## 요약

${mdTable(summaryRows(rows), [
  { key: "evidence_grade", label: "근거 등급" },
  { key: "count", label: "건수" },
])}

## 생활권별 상태

${mdTable(byFocus, [
  { key: "focus_area", label: "생활권" },
  { key: "total", label: "후보" },
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "cde", label: "C-D-E" },
])}

## 먼저 풀 병목

${mdTable(highFriction, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "evidence_grade", label: "등급" },
  { key: "text_coverage", label: "텍스트" },
  { key: "risk_flags", label: "리스크 플래그" },
  { key: "next_evidence_action", label: "다음 원문 확인" },
])}

## 전체 감사표

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "evidence_grade", label: "근거 등급" },
  { key: "has_urban_map", label: "지도" },
  { key: "has_notice_detail", label: "고시" },
  { key: "text_coverage", label: "텍스트" },
  { key: "risk_flags", label: "리스크 플래그" },
  { key: "next_evidence_action", label: "다음 원문 확인" },
])}
`;
}

async function optionalJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return [];
  }
}

async function optionalCsv(file) {
  try {
    return parseCsv(await readFile(file, "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const factRows = await optionalJson(FACT_CHECK_INPUT);
  const probeRows = await optionalJson(ORIGINAL_NOTICE_PROBES_INPUT);
  const stageDocRows = await optionalJson(GWANGJIN_STAGE_DOCS_INPUT);
  const guNoticeRows = await optionalJson(GWANGJIN_GU_NOTICE_INPUT);
  const guAttachmentRows = await optionalCsv(GWANGJIN_GU_NOTICE_ATTACHMENTS_INPUT);
  const gangnamSongpaNoticeRows = await optionalJson(GANGNAM_SONGPA_NOTICE_INPUT);
  const gangnamSongpaAttachmentRows = await optionalCsv(GANGNAM_SONGPA_NOTICE_ATTACHMENTS_INPUT);
  const seoulSiboRows = await optionalJson(SEOUL_SIBO_ORIGINAL_NOTICE_INPUT);
  const rows = buildRows(
    matrixRows,
    factRows,
    probeRows,
    stageDocRows,
    guNoticeRows,
    guAttachmentRows,
    gangnamSongpaNoticeRows,
    gangnamSongpaAttachmentRows,
    seoulSiboRows,
  ).sort((a, b) => Number(a.rank) - Number(b.rank));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "source-evidence-audit.json"), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "source-evidence-audit.csv"), toCsv(rows));
  await writeFile(path.join(OUT_DIR, "source-evidence-audit.md"), markdown(rows));

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        grades: Object.fromEntries(summaryRows(rows).map((row) => [row.evidence_grade, row.count])),
        highFriction: rows.filter((row) => ["C", "D", "E"].includes(row.evidence_grade) || row.risk_flags.includes("수치 시점차/충돌"))
          .length,
        output: "analysis/source-evidence-audit.{md,csv,json}",
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
