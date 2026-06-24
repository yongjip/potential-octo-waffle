#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const OUT_DIR = "analysis";

const SOURCES = {
  walkerhillPlanNotice: "data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt",
  walkerhillEnv: "data/urban/text/gwangjin-gu/files/24-B0000378-16413-2-24-B0000378-16413-gwangjin-gu-2-붙임1-워커힐아파트-일대-도시관리계획수립-전략환경영향평가-항목-범위-등의-결정내용.txt",
  hanyangNotice: "data/urban/text/gwangjin-gu/html/25-B0000003-6186353.txt",
  hanyangConstructionOverview: "data/urban/text/gwangjin-hanyanggaro/25-B0000003-6209808-gwangjin-gu-hanyanggaro-construction-overview.txt",
  hanyangSafetyResult: "data/urban/text/gwangjin-hanyanggaro/25-B0000003-6213254-gwangjin-gu-hanyanggaro-safety-result.txt",
  hanyangStageMemo: "analysis/hanyanggaro-stage-source-memo.md",
  hanyangOcrReview: "analysis/ocr-image-review-decisions.md",
  geukdongReopen: "data/urban/text/gwangjin-gu/files/27-B0000378-15811-1-27-B0000378-15811-gwangjin-gu-1-1-재공람공고문_광장극동아파트-재건축사업.txt",
  geukdongUnionPlan: "data/urban/text/gwangjin-gu/files/27-B0000378-15155-1-27-B0000378-15155-gwangjin-gu-1-조합설립계획-공고문_광장극동.txt",
  jayangApprovalChange: "data/urban/text/gwangjin-gu/files/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문.txt",
  jayangInspection: "data/urban/text/gwangjin-gu/files/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안.txt",
  jayangOpinionForm: "data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt",
};

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const FACT_SPECS = [
  {
    rank: "24",
    category: "공람/열람",
    field: "지구단위계획 열람기간",
    official_value: "2026.04.23~2026.05.07",
    source_key: "walkerhillPlanNotice",
    anchor: "열람기간 : 2026.04.23",
    compare_field: "",
    status: "new_official_context",
    note: "추진위 승인과 별개인 도시관리계획/지구단위계획 열람공고.",
  },
  {
    rank: "24",
    category: "도시관리계획",
    field: "지구단위계획구역 면적",
    official_value: "120,076㎡",
    source_key: "walkerhillPlanNotice",
    anchor: "120,076",
    compare_field: "district_area_sqm_official",
    status: "source_time_diff_or_scope_diff",
    note: "정보몽땅 사업개요 면적은 정비사업 면적, 광진구청 공고는 지구단위계획구역 면적으로 범위가 다름.",
  },
  {
    rank: "24",
    category: "현황",
    field: "기존 세대수/동수/층수",
    official_value: "576세대, 15개동, 12~13층",
    source_key: "walkerhillEnv",
    anchor: "세대 수 576세대",
    compare_field: "",
    status: "new_official_context",
    note: "장래 공급계획이 아니라 기존 워커힐아파트 현황.",
  },
  {
    rank: "24",
    category: "현황",
    field: "기존 단지 면적/용적률/건폐율",
    official_value: "110,718㎡, 용적률 97%, 건폐율 8.3%",
    source_key: "walkerhillEnv",
    anchor: "면적 110,718",
    compare_field: "",
    status: "new_official_context",
    note: "환경평가 결정내용의 건축물 현황 표 기준.",
  },
  {
    rank: "24",
    category: "기반시설/공공기여",
    field: "도로·공원 기부채납 후보",
    official_value: "도로 5,599㎡, 공원 6,004㎡, 합계 11,603㎡",
    source_key: "walkerhillEnv",
    anchor: "도로 5,599",
    compare_field: "",
    status: "new_official_context",
    note: "세부개발계획/정비계획 수립 시 재산정 가능.",
  },
  {
    rank: "24",
    category: "개발밀도",
    field: "용적률 기준/허용/상한",
    official_value: "제2종 190/210/250%, 자연녹지 50/150/200%",
    source_key: "walkerhillEnv",
    anchor: "기준/허용/상한 용적률 : 190%",
    compare_field: "",
    status: "new_official_context",
    note: "용도지역별 지구단위계획 기준. 실제 정비계획 수치와 구분 필요.",
  },
  {
    rank: "25",
    category: "인가",
    field: "사업시행계획변경인가일",
    official_value: "2023.12.05",
    source_key: "hanyangStageMemo",
    anchor: "사업시행계획변경인가일",
    compare_field: "project_approval_date_public",
    status: "match",
    note: "광진구 제2023-115호 첨부 PDF 이미지 판독 기준 최신 변경인가일.",
    snippet_override: "사업시행계획변경인가일 2023-12-05는 광진구 제2023-115호 첨부 PDF 이미지 판독 기준 최신 변경인가일이다.",
  },
  {
    rank: "25",
    category: "고시",
    field: "고시번호",
    official_value: "2023-115",
    source_key: "hanyangNotice",
    anchor: "공고번호 제2023-115호",
    compare_field: "notice_no",
    status: "match",
    note: "광진구청 본문 기준 대표 직접 원문 식별값.",
  },
  {
    rank: "25",
    category: "고시",
    field: "고시일",
    official_value: "2023.12.07",
    source_key: "hanyangNotice",
    anchor: "2023 년 12 월 7 일",
    compare_field: "notice_date",
    status: "match",
    note: "광진구청 본문 기준 대표 직접 원문 고시일.",
  },
  {
    rank: "25",
    category: "규모",
    field: "대지면적",
    official_value: "9,877.80㎡",
    source_key: "hanyangConstructionOverview",
    anchor: "대지 면적 9,877.80",
    compare_field: "district_area_sqm_official",
    status: "match",
    note: "2024 안전점검 공사개요가 변경인가 2차 기준 대지면적을 직접 표시한다.",
  },
  {
    rank: "25",
    category: "규모",
    field: "건폐율",
    official_value: "31.62%",
    source_key: "hanyangConstructionOverview",
    anchor: "건폐 / 용적율 31.62% / 248.70%",
    compare_field: "building_coverage_ratio_pct_official",
    status: "match",
    note: "광진구 공사개요와 비교 매트릭스 공식값이 일치한다.",
  },
  {
    rank: "25",
    category: "규모",
    field: "용적률",
    official_value: "248.70%",
    source_key: "hanyangConstructionOverview",
    anchor: "건폐 / 용적율 31.62% / 248.70%",
    compare_field: "floor_area_ratio_pct_official",
    status: "match",
    note: "광진구 공사개요와 비교 매트릭스 공식값이 일치한다.",
  },
  {
    rank: "25",
    category: "규모",
    field: "층수/동수",
    official_value: "지하 2층 / 지상 10-15층, 4개동",
    source_key: "hanyangConstructionOverview",
    anchor: "규 모 지하 2층 / 지상 10-15층, 4개동",
    compare_field: "floors_official",
    status: "match_with_extra_detail",
    note: "비교 매트릭스는 층수 범위를 유지하고, 공사개요는 4개동 정보까지 함께 제공한다.",
  },
  {
    rank: "25",
    category: "규모",
    field: "총 세대수",
    official_value: "215세대",
    source_key: "hanyangConstructionOverview",
    anchor: "세 대 수 총 215세대",
    compare_field: "total_households_official",
    status: "match",
    note: "정보몽땅 176은 분양세대수 오인값으로 보고 총 세대수는 215로 유지한다.",
  },
  {
    rank: "25",
    category: "규모",
    field: "최고높이",
    official_value: "43.25m",
    source_key: "hanyangOcrReview",
    anchor: "최고높이 열에 43.25가 직접 보인다.",
    compare_field: "max_height_m_official",
    status: "match",
    note: "광진구 제2023-115호 첨부 PDF 이미지 판독값 기준으로 43.25m를 유지한다.",
  },
  {
    rank: "25",
    category: "고시",
    field: "안전점검 결과 고시번호/고시일",
    official_value: "2024-449 / 2024.04.09",
    source_key: "hanyangSafetyResult",
    anchor: "서울특별시 광진구 공고 제2024-449호",
    compare_field: "",
    status: "new_official_context",
    note: "2024 안전점검 수행기관 지정 결과 공고가 한양연립 현장 신축공사 기준으로 공개된다.",
    snippet_override:
      "서울특별시 광진구 공고 제2024-449호 / 건설공사 안전점검 수행기관 지정 결과 / 2024. 4. 9.",
  },
  {
    rank: "25",
    category: "시공",
    field: "시공사",
    official_value: "㈜HDC현대산업개발",
    source_key: "hanyangSafetyResult",
    anchor: "2. 시공사:",
    compare_field: "",
    status: "new_official_context",
    note: "안전점검 결과 공고 rendered PDF visual review 기준 시공사가 직접 적시된다.",
    snippet_override: "2. 시공사: ㈜HDC현대산업개발",
  },
  {
    rank: "25",
    category: "시공",
    field: "안전점검 수행기관 선정업체",
    official_value: "한국종합안전(주)",
    source_key: "hanyangSafetyResult",
    anchor: "안전점검 수행기관 선정 업체:",
    compare_field: "",
    status: "new_official_context",
    note: "안전점검 수행기관 지정 결과 공고 rendered PDF visual review 기준 1위 선정업체가 직접 보인다.",
    snippet_override: "3. 안전점검 수행기관 평가 결과 - 안전점검 수행기관 선정 업체: 한국종합안전(주)",
  },
  {
    rank: "27",
    category: "공람/열람",
    field: "정비구역 지정안 재공람기간",
    official_value: "2026.03.10~2026.04.09",
    source_key: "geukdongReopen",
    anchor: "재공람기간 : 2026년 3월 10일",
    compare_field: "",
    status: "new_official_context",
    note: "도시계획위원회 심의 결과 반영 후 재공람.",
  },
  {
    rank: "27",
    category: "정비구역",
    field: "정비구역 면적",
    official_value: "79,417.2㎡",
    source_key: "geukdongReopen",
    anchor: "79,417.2",
    compare_field: "district_area_sqm_official",
    status: "match",
    note: "정보몽땅 사업개요 면적과 일치.",
  },
  {
    rank: "27",
    category: "기반시설",
    field: "도로·소공원 면적",
    official_value: "도로 1,598.4㎡, 소공원 2,017.6㎡",
    source_key: "geukdongReopen",
    anchor: "도로 1,598.4",
    compare_field: "",
    status: "new_official_context",
    note: "재공람공고 토지이용계획/기반시설 후보.",
  },
  {
    rank: "27",
    category: "조합설립계획",
    field: "조합설립계획 면적/토지등소유자",
    official_value: "79,200.2㎡, 토지등소유자 1,348인",
    source_key: "geukdongUnionPlan",
    anchor: "면 적: 79,200.2",
    compare_field: "district_area_sqm_official",
    status: "source_time_diff_or_scope_diff",
    note: "조합설립계획 공고 면적은 재공람 정비구역 면적 79,417.2㎡와 다르므로 시점/범위 확인 필요.",
  },
  {
    rank: "27",
    category: "건축계획",
    field: "건폐율/용적률/층수/세대수",
    official_value: "건폐율 14.76%, 용적률 333.91%, 지하4층/지상49층, 2,049세대",
    source_key: "geukdongUnionPlan",
    anchor: "14.76% / 333.91%",
    compare_field: "floor_area_ratio_pct_official",
    status: "match_or_rounding",
    note: "정보몽땅 사업개요 FAR 340%와는 반올림/시점 차이 가능. 정비계획 본고시 원문으로 확정 필요.",
  },
  {
    rank: "27",
    category: "조합설립절차",
    field: "조합설립 일정",
    official_value: "2025.11~2026.07 예정",
    source_key: "geukdongUnionPlan",
    anchor: "조합설립기간 : 2025. 11.",
    compare_field: "",
    status: "new_official_context",
    note: "동의서 징구 진행 상황에 따라 변동 가능.",
  },
  {
    rank: "29",
    category: "공람/열람",
    field: "조합설립 변경인가 공람기간",
    official_value: "2025.03.13~2025.03.28",
    source_key: "jayangOpinionForm",
    anchor: "2025. 03. 13.",
    compare_field: "",
    status: "new_official_context",
    note: "의견서 서식과 공람공고 OCR이 같은 기간을 지시.",
  },
  {
    rank: "29",
    category: "인가",
    field: "조합설립인가일",
    official_value: "2024.06.12",
    source_key: "jayangApprovalChange",
    anchor: "조합설립인가일: 2024.6.12",
    compare_field: "",
    status: "new_official_context",
    note: "변경인가 전 최초 조합설립인가일.",
    snippet_override: "조합설립인가일: 2024.6.12. / 조합설립(변경)인가일: 2025.4.1.",
  },
  {
    rank: "29",
    category: "인가",
    field: "조합설립 변경인가일",
    official_value: "2025.04.01",
    source_key: "jayangApprovalChange",
    anchor: "조합설립(변경)인가일: 2025.4.1",
    compare_field: "union_approval_date_public",
    status: "match",
    note: "정보몽땅 공개항목의 인가일과 일치.",
    snippet_override: "조합설립인가일: 2024.6.12. / 조합설립(변경)인가일: 2025.4.1.",
  },
  {
    rank: "29",
    category: "정비구역",
    field: "구역면적",
    official_value: "8,473.82㎡",
    source_key: "jayangApprovalChange",
    anchor: "구역면적: 8,473.82",
    compare_field: "district_area_sqm_official",
    status: "needs_image_check_conflict",
    note: "OCR 공고문과 공람공고는 8,473.82로 읽히지만 정보몽땅/사업구역 레이어는 8,419.91. PDF 이미지 원문 확인 필요.",
    snippet_override: "조합설립인가 사항: 위치 광진구 자양4동 249-2 일대, 구역면적 8,473.82㎡로 OCR 추출.",
  },
  {
    rank: "29",
    category: "변경사항",
    field: "조합설립 변경인가 내용",
    official_value: "조합정관 변경, 조합원 권리변동, 사무실 주소 변경",
    source_key: "jayangApprovalChange",
    anchor: "변경사향",
    compare_field: "",
    status: "new_official_context",
    note: "주소 자체는 리서치 산출물에서 제외하고 변경 사유만 보존.",
    snippet_override: "변경사항: 조합정관 변경, 경미한 변경으로 조합원 권리변동 및 사무실 주소 변경.",
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
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function normalizeNumber(value) {
  const text = String(value ?? "").replaceAll(",", "").trim();
  if (!text) return "";
  const match = text.match(/\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

function sanitizeSnippet(value) {
  return String(value ?? "")
    .replace(/0\d{1,2}-\d{3,4}-\d{4}/g, "[연락처 생략]")
    .replace(/☎\s*\[연락처 생략\]/g, "[연락처 생략]")
    .replace(/@\s*\d{2,3}-\d{3,4}-\d{4}/g, "[연락처 생략]")
    .replace(/@\S{0,8}0\d{1,2}-?(?:\d{0,4})?/g, "[연락처 생략]")
    .replace(/서울특별시 광진구 [^,)\n]{2,30}(?:로|길)\s*\d+(?:[^,\n)]{0,25})?/g, "[주소 생략]")
    .replace(/아차산로\s*400(?:,\s*광진구청\s*\d+층)?/g, "[주소 생략]")
    .replace(/소재지:\s*\[주소 생략\](?:,\s*[^,.]+)?/g, "소재지: [주소 생략]")
    .replace(/사무실 주소 변경:\s*\(기존\)\s*\[주소 생략\](?:,\s*[^()]+)?\s*\(변경\)\s*\[주소 생략\](?:,\s*[^.]+)?/g, "사무실 주소 변경: [주소 생략]")
    .replace(/\s+/g, " ")
    .trim();
}

function lineWindow(text, anchor, before = 1, after = 2) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(anchor));
  if (index < 0) return { line: "", snippet: "" };
  const line = lines[index];
  if (line.length > 360) {
    const anchorIndex = line.indexOf(anchor);
    const start = Math.max(0, anchorIndex - 140);
    const end = Math.min(line.length, anchorIndex + anchor.length + 180);
    return {
      line: String(index + 1),
      snippet: sanitizeSnippet(line.slice(start, end)),
    };
  }
  const start = Math.max(0, index - before);
  const end = Math.min(lines.length, index + after + 1);
  return {
    line: String(index + 1),
    snippet: sanitizeSnippet(lines.slice(start, end).join(" ")),
  };
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const matrixByRank = Object.fromEntries(matrixRows.map((row) => [String(row.rank), row]));
  const sourceTexts = {};
  for (const [key, file] of Object.entries(SOURCES)) {
    sourceTexts[key] = await readFile(file, "utf8");
  }

  const rows = FACT_SPECS.map((spec) => {
    const matrix = matrixByRank[spec.rank] || {};
    const sourceFile = SOURCES[spec.source_key];
    const source = spec.snippet_override
      ? { line: lineWindow(sourceTexts[spec.source_key], spec.anchor).line, snippet: sanitizeSnippet(spec.snippet_override) }
      : lineWindow(sourceTexts[spec.source_key], spec.anchor);
    const matrixValue = spec.compare_field ? matrix[spec.compare_field] || "" : "";
    return {
      rank: spec.rank,
      focus_area: matrix.focus_area || "구의/광진",
      project_name: matrix.project_name || "",
      current_stage: matrix.current_stage || "",
      category: spec.category,
      field: spec.field,
      official_value: spec.official_value,
      matrix_field: spec.compare_field,
      matrix_value: matrixValue,
      normalized_official_hint: normalizeNumber(spec.official_value),
      normalized_matrix_value: normalizeNumber(matrixValue),
      status: spec.status,
      note: spec.note,
      source_file: sourceFile,
      source_line: source.line,
      source_snippet: source.snippet,
    };
  });

  const summaryConfig = {
    "24": {
      key_takeaway: "추진위 단계와 별도로 지구단위계획/전략환경영향평가 원문에서 구역계·공공기여 조건이 드러남. 정비계획 수치와 구분해야 한다.",
      next_action: "정비계획 수립 이후 세대수·용적률 확정값이 나올 때까지 지구단위계획 조건을 별도 시나리오로 관리",
    },
    "25": {
      key_takeaway:
        "광진구 제2023-115호, 2024 안전점검 공사개요, 예정공정표, 안전점검 결과 공고를 함께 보면 사업시행 변경인가 골격과 핵심 수치, 공사기간/착공 마일스톤, 시공사까지 잠긴다. 다만 정보몽땅 추진경과와 사업구역 레이어는 `착공` 선행 신호를 공개하므로 단계 불일치를 따로 관리해야 한다.",
      next_action: "서울도시공간포털 recordCode, 정보몽땅 추진경과의 착공신고 공개 신호, 광진구 직접 원문 축을 함께 대조해 현재단계를 재판정",
    },
    "27": {
      key_takeaway: "구청 재공람·조합설립계획 공고와 서울시보 본고시 제2026-249호를 함께 대조해야 한다.",
      next_action: "analysis/seoul-sibo-original-notice-fact-check.md 기준으로 재공람안·조합설립계획·정정고시와 수치 차이 대조",
    },
    "29": {
      key_takeaway: "조합설립 변경인가일은 정보몽땅과 일치하나, 구역면적은 OCR 원문과 기존 사업개요 사이에 충돌이 있어 이미지 원문 검수가 필요하다.",
      next_action: "OCR PDF 이미지에서 구역면적 8,473.82㎡ 여부를 육안 검수하고 정보몽땅 8,419.91㎡와 시점/범위 차이를 확인",
    },
  };

  const projectSummary = ["24", "25", "27", "29"].map((rank) => {
    const projectRows = rows.filter((row) => row.rank === rank);
    const matrix = matrixByRank[rank] || {};
    const config = summaryConfig[rank] || {};
    return {
      rank,
      project_name: matrix.project_name || "",
      current_stage: matrix.current_stage || "",
      key_takeaway: config.key_takeaway || "",
      conflict_count: projectRows.filter((row) => row.status.includes("conflict") || row.status.includes("scope_diff")).length,
      matched_count: projectRows.filter((row) => String(row.status).startsWith("match")).length,
      new_context_count: projectRows.filter((row) => row.status === "new_official_context").length,
      next_action: config.next_action || "",
    };
  });

const markdown = `# 광진구청 원문 수치 대조

작성 기준: ${kstDate()} KST

이 문서는 광진구청 고시공고 첨부 텍스트를 사업별 리서치 판단에 쓸 수 있도록 1차로 대조한 결과다. 연락처와 사무소 주소는 산출물에서 제외하거나 마스킹했다. 투자 판단용 확정값이 아니라 공식 원문 기반 fact-check 큐다.

## 사업별 결론

${mdTable(projectSummary, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "key_takeaway", label: "핵심 해석" },
  { key: "conflict_count", label: "충돌/범위차" },
  { key: "matched_count", label: "일치" },
  { key: "new_context_count", label: "신규 맥락" },
  { key: "next_action", label: "다음 작업" },
])}

## 대조표

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "category", label: "분류" },
  { key: "field", label: "항목" },
  { key: "official_value", label: "원문값" },
  { key: "matrix_field", label: "비교 열" },
  { key: "matrix_value", label: "기존값" },
  { key: "status", label: "상태" },
  { key: "note", label: "해석" },
])}

## 원문 근거 스니펫

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "field", label: "항목" },
  { key: "source_file", label: "원문 텍스트" },
  { key: "source_line", label: "줄" },
  { key: "source_snippet", label: "스니펫" },
])}

## 주의

- 워커힐의 120,076㎡는 지구단위계획구역 면적이고, 정보몽땅 사업개요 면적 89,878㎡와 같은 항목으로 비교하면 안 된다.
- 한양연립은 서울시 제2024-282호가 아니라 광진구 제2023-115호와 2024-372 공사개요·예정공정표, 2024-449 안전점검 결과 공고를 직접 근거로 쓴다. 정보몽땅 구조화 176세대·43m·32%·249%는 직접 원문보다 우선하지 않는다.
- 한양연립의 \`사업시행인가\` 직접 원문과 \`착공 신고 필 2024-02-15\` 공개 진행경과, \`예정공정표\`/\`안전점검 결과\` 공고는 같은 단계값으로 섞지 않는다. 직접 착공신고 원문 확보 전까지는 단계 불일치 상태를 명시적으로 유지한다.
- 광장극동의 79,200.2㎡와 79,417.2㎡는 조합설립계획 공고와 재공람공고 간 차이다. 서울시보 본고시 제2026-249호 기준값은 \`analysis/seoul-sibo-original-notice-fact-check.md\`에서 별도 관리한다.
- 자양1의4의 8,473.82㎡는 OCR PDF에서 추출한 값이다. 정보몽땅/사업구역 레이어의 8,419.91㎡와 충돌하므로 PDF 이미지 확인 전 확정하지 않는다.
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "gwangjin-gu-notice-fact-check.json"), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "gwangjin-gu-notice-fact-check.csv"), toCsv(rows));
  await writeFile(path.join(OUT_DIR, "gwangjin-gu-notice-fact-check.md"), markdown);

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        projects: projectSummary.length,
        conflicts: rows.filter((row) => row.status.includes("conflict") || row.status.includes("scope_diff")).length,
        output: "analysis/gwangjin-gu-notice-fact-check.{md,csv,json}",
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
