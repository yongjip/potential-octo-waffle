#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CANDIDATES_INPUT = "analysis/priority-redevelopment-candidates.csv";
const SUMMARIES_INPUT = "data/cleanup/project-summaries-priority-candidates.json";
const URBAN_DETAILS_INPUT = "data/urban/urban-map-details-priority-candidates.json";
const NOTICE_DETAILS_INPUT = "data/urban/urban-notice-details-priority-candidates.json";
const OUT_DIR = "data/market";

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

const DISTRICT_CODES = {
  강남구: { lawd_cd: "11680", r_one_region: "서울 강남구" },
  송파구: { lawd_cd: "11710", r_one_region: "서울 송파구" },
  광진구: { lawd_cd: "11215", r_one_region: "서울 광진구" },
};

const DONG_CODES = {
  "강남구:개포동": "11680103",
  "강남구:대치동": "11680106",
  "강남구:압구정동": "11680110",
  "송파구:잠실동": "11710101",
  "송파구:신천동": "11710102",
  "송파구:송파동": "11710104",
  "송파구:문정동": "11710108",
  "송파구:방이동": "11710111",
  "송파구:마천동": "11710114",
  "광진구:중곡동": "11215101",
  "광진구:구의동": "11215103",
  "광진구:광장동": "11215104",
  "광진구:자양동": "11215105",
};

const DONG_MARKET_PROFILE = {
  압구정동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["압구정", "현대", "한양", "미성", "신현대"],
    peer_keywords: ["압구정동", "청담동", "신사동", "한강변"],
    r_one_regions: ["서울 강남구", "서울 동남권", "서울"],
    notes: "압구정은 특별계획구역별 단지명이 다르므로 서울 실거래 원자료에서 단지명 키워드로 1차 필터링 후 구역별 단지를 수동 확정한다.",
  },
  대치동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["은마", "우성", "쌍용", "대치"],
    peer_keywords: ["대치동", "도곡동", "개포동", "학여울"],
    r_one_regions: ["서울 강남구", "서울 동남권", "서울"],
    notes: "대치동은 학군·역세권 프리미엄이 커서 같은 강남구 안에서도 대치/도곡/개포 비교군을 분리한다.",
  },
  개포동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["개포", "주공", "디에이치", "래미안", "자이"],
    peer_keywords: ["개포동", "대치동", "일원동"],
    r_one_regions: ["서울 강남구", "서울 동남권", "서울"],
    notes: "완료 단지와 진행 단지를 나눠 비교해야 하므로 거래 후속 분석에서 준공연도 필터를 둔다.",
  },
  잠실동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["잠실", "주공", "우성", "엘스", "리센츠", "트리지움"],
    peer_keywords: ["잠실동", "신천동", "종합운동장", "잠실 MICE"],
    r_one_regions: ["서울 송파구", "서울 동남권", "서울"],
    notes: "잠실은 재건축 대상과 이미 준공된 대단지를 함께 봐야 기대 반영 정도를 비교할 수 있다.",
  },
  신천동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["장미", "파크리오", "진주", "미성", "크로바"],
    peer_keywords: ["신천동", "잠실동", "잠실나루", "한강"],
    r_one_regions: ["서울 송파구", "서울 동남권", "서울"],
    notes: "신천동은 잠실나루·한강축 입지와 주변 준공 단지 가격 전이를 함께 본다.",
  },
  송파동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["송파", "한양", "미성", "가락삼익", "삼익"],
    peer_keywords: ["송파동", "석촌동", "가락동", "잠실동"],
    r_one_regions: ["서울 송파구", "서울 동남권", "서울"],
    notes: "송파동은 잠실 접근성과 독립 생활권 가격대를 분리해 본다.",
  },
  문정동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["가락", "현대", "문정"],
    peer_keywords: ["문정동", "장지동", "가락동"],
    r_one_regions: ["서울 송파구", "서울 동남권", "서울"],
    notes: "문정 업무지구 배후수요와 재건축 단계 변화를 연결한다.",
  },
  방이동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["대림", "가락", "방이"],
    peer_keywords: ["방이동", "오금동", "올림픽공원"],
    r_one_regions: ["서울 송파구", "서울 동남권", "서울"],
    notes: "올림픽공원 접근성을 가격 방어 변수로 따로 본다.",
  },
  마천동: {
    transaction_scope: "법정동+재개발권역",
    target_keywords: ["마천", "거여", "재정비촉진"],
    peer_keywords: ["마천동", "거여동", "위례"],
    r_one_regions: ["서울 송파구", "서울 동남권", "서울"],
    notes: "아파트 실거래뿐 아니라 연립/다세대와 분양권/입주권 데이터도 필요하다.",
  },
  중곡동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["중곡", "중곡아파트"],
    peer_keywords: ["중곡동", "군자", "아차산"],
    r_one_regions: ["서울 광진구", "서울 동북권", "서울"],
    notes: "광진구 안에서도 자양/구의와 가격대가 다르므로 독립 비교군으로 둔다.",
  },
  광장동: {
    transaction_scope: "단지명+법정동",
    target_keywords: ["광장", "극동", "워커힐", "삼성"],
    peer_keywords: ["광장동", "구의동", "강변", "광나루"],
    r_one_regions: ["서울 광진구", "서울 동북권", "서울"],
    notes: "한강 조망, 광나루역, 강변역 접근성을 구분하고 대단지/소규모정비를 분리한다.",
  },
  구의동: {
    transaction_scope: "법정동+소규모정비",
    target_keywords: ["구의", "한양", "강변"],
    peer_keywords: ["구의동", "광장동", "자양동", "동서울터미널"],
    r_one_regions: ["서울 광진구", "서울 동북권", "서울"],
    notes: "동서울터미널·강변역 변화와 소규모정비 속도를 같이 본다.",
  },
  자양동: {
    transaction_scope: "단지명+법정동+연립/다세대",
    target_keywords: ["자양", "한양", "자양7", "자양4"],
    peer_keywords: ["자양동", "구의동", "건대입구", "뚝섬유원지"],
    r_one_regions: ["서울 광진구", "서울 동북권", "서울"],
    notes: "재개발·가로주택·재건축이 섞여 있어 아파트와 연립/다세대 실거래를 같이 봐야 한다.",
  },
};

const SOURCE_ROWS = [
  {
    source_id: "seoul-open-data-real-estate-trade",
    source_name: "서울시 부동산 실거래가 정보",
    provider: "서울특별시",
    official_url: "https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do",
    data_grain: "거래 건",
    geography_key: "자치구, 법정동, 지번코드",
    time_key: "신고년도",
    access_type: "서울 열린데이터광장 Open API/Sheet/CSV",
    requires_key: "서울 열린데이터광장 API 키 필요",
    update_frequency: "매일 1회",
    use_for: "서울 실거래 원자료 1차 확인, 자치구/법정동/건물명 필터링",
    status: "metadata_verified",
  },
  {
    source_id: "molit-rtms-apt-trade",
    source_name: "국토교통부 아파트 매매 실거래자료",
    provider: "국토교통부",
    official_url: "https://www.data.go.kr/",
    data_grain: "지역코드 x 계약년월 x 거래 건",
    geography_key: "LAWD_CD",
    time_key: "DEAL_YMD",
    access_type: "공공데이터포털 OpenAPI",
    requires_key: "공공데이터포털 서비스키 필요",
    update_frequency: "수시/월별 재수집 필요",
    use_for: "아파트 매매 가격·거래량 분석",
    status: "api_key_required",
  },
  {
    source_id: "molit-rtms-apt-rent",
    source_name: "국토교통부 아파트 전월세 실거래자료",
    provider: "국토교통부",
    official_url: "https://www.data.go.kr/",
    data_grain: "지역코드 x 계약년월 x 거래 건",
    geography_key: "LAWD_CD",
    time_key: "DEAL_YMD",
    access_type: "공공데이터포털 OpenAPI",
    requires_key: "공공데이터포털 서비스키 필요",
    update_frequency: "수시/월별 재수집 필요",
    use_for: "전세가율, 전월세 수급, 이주 전후 전세 압력 분석",
    status: "api_key_required",
  },
  {
    source_id: "molit-rtms-rowhouse-trade-rent",
    source_name: "국토교통부 연립/다세대 매매·전월세 실거래자료",
    provider: "국토교통부",
    official_url: "https://www.data.go.kr/",
    data_grain: "지역코드 x 계약년월 x 거래 건",
    geography_key: "LAWD_CD",
    time_key: "DEAL_YMD",
    access_type: "공공데이터포털 OpenAPI",
    requires_key: "공공데이터포털 서비스키 필요",
    update_frequency: "수시/월별 재수집 필요",
    use_for: "자양·구의·마천 등 재개발/소규모정비권역 시장 반응 분석",
    status: "api_key_required",
  },
  {
    source_id: "r-one-statistics",
    source_name: "한국부동산원 R-ONE 부동산통계",
    provider: "한국부동산원",
    official_url: "https://www.reb.or.kr/r-one/main.do",
    data_grain: "지역 x 월/분기 통계",
    geography_key: "R-ONE 지역코드/통계코드",
    time_key: "공표월",
    access_type: "R-ONE 통계자료받기/Open API/마이크로데이터",
    requires_key: "Open API는 인증키 발급 필요",
    update_frequency: "통계별 월별/분기별",
    use_for: "주택가격동향, 공동주택 실거래가격지수, 거래현황, 지가변동률",
    status: "metadata_verified",
  },
];

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

function projectMarketType(row) {
  if (row.project_type.includes("재개발")) return "redevelopment";
  if (row.project_type.includes("가로주택")) return "small-block";
  if (row.project_type.includes("소규모")) return "small-reconstruction";
  return "apartment-reconstruction";
}

function preferredAssetTypes(row) {
  const type = projectMarketType(row);
  if (type === "redevelopment") return "apartment,rowhouse_multifamily,land,assignment_rights";
  if (type === "small-block") return "apartment,rowhouse_multifamily,land";
  return "apartment,apt_rent";
}

function stageEventFocus(stage) {
  if (["정비계획 수립", "정비구역지정", "추진위원회승인"].includes(stage)) return "designation_window";
  if (stage === "조합설립인가") return "union_approval_window";
  if (stage === "사업시행인가") return "implementation_approval_window";
  if (stage === "관리처분인가") return "relocation_price_window";
  return "stage_change_window";
}

function compactList(values) {
  return values.filter(Boolean).join("; ");
}

function rowsByRank(rows) {
  return Object.fromEntries(rows.map((row) => [String(row.rank), row]));
}

function sourceStatus(row) {
  const missing = [];
  if (!row.lawd_cd) missing.push("lawd_cd");
  if (!row.emd_cd) missing.push("emd_cd");
  return missing.length ? `missing:${missing.join("|")}` : "ready_for_api_key";
}

function representativeLotNoticeIsUnrelated(row, urban, notice) {
  const source = `${urban?.official_map_url_source || row.official_map_url_source || ""} ${row.official_map_url || ""}`;
  const projectText = `${row.project_name || ""} ${row.project_type || ""}`;
  const text = `${notice?.notice_title || ""} ${notice?.notice_content || ""} ${urban?.urban_notice_title || ""} ${urban?.representative_lot_zone_name || ""} ${urban?.urban_zone_name || ""} ${urban?.urban_description || ""}`;
  const landReadjustmentNotice = /환지|토지구획정리/.test(text) && !/환지|토지구획정리/.test(projectText);
  return landReadjustmentNotice || (source.includes("representative_lot") && /환지|토지구획정리/.test(text));
}

function toMarketRow(row, summary, urban, notice) {
  const profile = DONG_MARKET_PROFILE[row.dong] ?? {
    transaction_scope: "법정동",
    target_keywords: [row.dong],
    peer_keywords: [row.dong],
    r_one_regions: [DISTRICT_CODES[row.district]?.r_one_region || "서울"],
    notes: "동 단위 기본 매핑. 단지명 키워드는 수동 보강 필요.",
  };
  const district = DISTRICT_CODES[row.district] ?? {};
  const emdCd = DONG_CODES[`${row.district}:${row.dong}`] ?? "";
  const marketType = projectMarketType(row);
  const unrelatedRepresentativeLotNotice = representativeLotNoticeIsUnrelated(row, urban, notice);
  const effectiveMapUrl = unrelatedRepresentativeLotNotice ? "" : urban?.official_map_url || row.official_map_url || "";

  return {
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    lawd_cd: district.lawd_cd || "",
    dong: row.dong,
    emd_cd: emdCd,
    representative_lot: row.representative_lot,
    project_name: row.project_name,
    project_type: row.project_type,
    market_type: marketType,
    current_stage: row.current_stage,
    stage_event_focus: stageEventFocus(row.current_stage),
    official_project_url: row.official_project_url,
    official_map_url: effectiveMapUrl,
    official_map_url_source: unrelatedRepresentativeLotNotice ? "" : urban?.official_map_url_source || "",
    notice_no: unrelatedRepresentativeLotNotice ? "" : notice?.notice_no || "",
    notice_date: unrelatedRepresentativeLotNotice ? "" : notice?.notice_date || "",
    notice_title: unrelatedRepresentativeLotNotice ? "" : notice?.notice_title || urban?.urban_notice_title || "",
    district_area_sqm: summary?.district_area_sqm || "",
    total_households: summary?.total_households || "",
    floor_area_ratio_pct: summary?.floor_area_ratio_pct || "",
    transaction_scope: profile.transaction_scope,
    preferred_asset_types: preferredAssetTypes(row),
    target_complex_keywords: compactList(profile.target_keywords),
    peer_area_keywords: compactList(profile.peer_keywords),
    seoul_open_data_filter: `자치구=${row.district};법정동=${row.dong};건물명 in (${profile.target_keywords.join("|")})`,
    molit_rtms_query_keys: `LAWD_CD=${district.lawd_cd || ""};DEAL_YMD=YYYYMM`,
    r_one_regions: compactList(profile.r_one_regions),
    r_one_indicators: "전국주택가격동향_아파트매매;전국주택가격동향_아파트전세;공동주택실거래가격지수;부동산거래현황_아파트매매;지가변동률",
    first_market_questions: marketQuestions(row, marketType),
    data_quality_notes: profile.notes,
    market_data_status: sourceStatus({ lawd_cd: district.lawd_cd, emd_cd: emdCd }),
  };
}

function marketQuestions(row, marketType) {
  const questions = [];
  questions.push("고시일/인가일 전후 6개월과 12개월의 거래량 변화가 있는가?");
  questions.push("같은 자치구 R-ONE 가격지수와 대상 법정동 실거래가의 방향이 다른가?");
  if (marketType === "redevelopment" || marketType === "small-block") {
    questions.push("아파트뿐 아니라 연립/다세대와 토지 거래가 먼저 반응하는가?");
  } else {
    questions.push("대상 단지와 주변 준공 대단지의 가격 격차가 줄어드는가?");
  }
  if (["사업시행인가", "관리처분인가"].includes(row.current_stage)) {
    questions.push("이주·공사비·분담금 이슈가 전세와 매매 거래량에 반영되는가?");
  }
  return questions.join(" ");
}

function markdownSummary(marketRows) {
  const counts = marketRows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc.byDistrict[row.district] = (acc.byDistrict[row.district] || 0) + 1;
      acc.byMarketType[row.market_type] = (acc.byMarketType[row.market_type] || 0) + 1;
      if (row.market_data_status === "ready_for_api_key") acc.ready += 1;
      return acc;
    },
    { total: 0, ready: 0, byDistrict: {}, byMarketType: {} },
  );

  return `# 시장 데이터 연결 매트릭스

작성 기준: ${kstDate()} KST

## 목적

우선검토 후보 30개를 실거래가, 서울부동산정보광장, R-ONE 통계와 연결하기 위한 작업용 매트릭스다. 현재 단계에서는 원자료를 내려받기 전, 어떤 법정동·단지명·지역지표를 조회할지 공식 키를 먼저 정리했다.

## 현재 상태

| 항목 | 값 |
| --- | ---: |
| 사업장 | ${counts.total} |
| API 키 준비 후 바로 수집 가능한 행 | ${counts.ready} |
| 강남구 | ${counts.byDistrict["강남구"] || 0} |
| 송파구 | ${counts.byDistrict["송파구"] || 0} |
| 광진구 | ${counts.byDistrict["광진구"] || 0} |
| 아파트 재건축형 | ${counts.byMarketType["apartment-reconstruction"] || 0} |
| 재개발형 | ${counts.byMarketType.redevelopment || 0} |
| 소규모정비형 | ${(counts.byMarketType["small-block"] || 0) + (counts.byMarketType["small-reconstruction"] || 0)} |

## 파일

- \`project-market-areas.csv\`: 사업장별 법정동 코드, 실거래 필터, R-ONE 지역/지표, 1차 질문
- \`project-market-areas.json\`: 같은 내용의 구조화 원본
- \`official-market-data-sources.csv\`: 공식 시장 데이터 출처와 접근 방식
- \`market-fetch-plan.csv\`: \`fetch-market-raw-data.mjs\`가 생성하는 API 호출 계획
- \`market-fetch-diagnostics.md\`: API 키 투입 전후의 수집 가능 여부와 스모크 테스트 명령
- \`API_KEYS.md\`: 서울 열린데이터광장/공공데이터포털/R-ONE 키 준비와 실행 명령
- \`manual-import/manifest.json\`: API 키 없이 공식 사이트에서 내려받은 CSV/XLSX 원자료를 추적하는 수동 반입 manifest
- \`manual-import/download-intake.json\`: 70개 수동 다운로드/필터 작업별 파일 경로와 필터 메타데이터를 기록하는 intake
- \`manual-import/column-mapping.json\`: 수동 원자료 컬럼을 표준 거래/지표 필드로 옮기는 매핑 템플릿
- \`../../analysis/market-manual-import-readiness.md\`: 수동 반입 파일 존재, 기간, 출처 메타데이터 준비도 감사표
- \`../../analysis/market-manual-download-workbook.md\`: API 계획 690개를 공식 수동 다운로드·필터 작업 70개로 압축한 실행 워크북
- \`../../analysis/market-manual-download-status.md\`: 70개 작업별 원자료 파일 존재, 다운로드 시점, 필터 메타데이터 점검표
- \`../../analysis/market-manual-column-audit.md\`: 수동 반입 CSV/XLSX의 컬럼명, 샘플 행 수, 필수 필드 매칭 준비도 감사표
- \`../../analysis/market-manual-normalization-audit.md\`: 수동 원자료를 \`manual-*\` 거래/지표 산출물로 정규화할 수 있는지 점검한 감사표
- \`../../analysis/market-transaction-signal-summary.md\`: 서울시 공식 매매 실거래 원자료를 생활권·사업장별 1차 시장 신호로 집계한 요약표

## 수집 순서

1. 서울 열린데이터광장 API 키와 공공데이터포털 서비스키를 준비한다.
2. 키 없이 먼저 \`node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606\`으로 수집 계획을 갱신한다.
3. \`node scripts/fetch-market-raw-data.mjs --diagnose --from=202401 --to=202606\`으로 키 누락/스모크 테스트 범위를 확인한다.
4. \`node scripts/generate-market-manual-download-workbook.mjs\`로 어떤 지역·기간·키워드 묶음을 받아야 하는지 작업표를 갱신한다.
5. \`node scripts/sync-market-manual-download-intake.mjs\`로 워크북의 70개 작업을 \`download-intake.json\`에 동기화한다.
6. 서울시 매매 실거래는 \`node scripts/fetch-seoul-open-data-manual-tasks.mjs\`로 공식 Sheet CSV를 연도별 다운로드한 뒤 대상 법정동 파일로 자동 분할한다.
7. 국토부 RTMS 아파트·연립다세대 매매/전월세는 \`node scripts/fetch-rtms-manual-tasks.mjs\`로 조건별 자료제공 CSV를 내려받아 대상 법정동 파일로 자동 분할한다.
8. R-ONE 가격지수·거래현황은 \`node scripts/fetch-r-one-statistics.mjs\`로 공식 Open API 표 데이터를 서울·권역·자치구 CSV로 자동 수집한다.
9. \`node scripts/generate-market-manual-download-status.mjs\`로 70개 작업별 파일 존재와 다운로드 메타데이터를 점검한다.
10. \`node scripts/generate-market-manual-ingest-manifest.mjs\`로 작업별 파일을 컬럼 감사 입력으로 승격한다.
11. \`python3 scripts/generate-market-manual-column-audit.py\`로 컬럼명과 필수 필드 매칭 후보를 점검한다.
12. 필요한 경우 \`data/market/manual-import/column-mapping.json\`을 보강한 뒤 \`python3 scripts/normalize-market-manual-import.py\`로 수동 원자료를 정규화한다.
13. \`python3 scripts/generate-market-transaction-signal-summary.py\`로 생활권·사업장별 시장 신호와 R-ONE 지표 요약을 갱신한다.
14. 공공데이터포털 키를 넣고 국토교통부 OpenAPI 원자료를 1개월 스모크부터 수집해 RTMS 수동 파일과 대조할 수 있다.
15. 고시일·인가일 전후 6개월/12개월의 거래량, 평균·중위 가격, 전세 흐름을 비교한다.

## 주의

- 이 파일은 투자 판단이 아니라 리서치 키 설계다.
- 공공데이터포털 실거래 API는 서비스키가 필요하다.
- 서울 열린데이터광장 실거래 데이터는 매일 갱신되므로 최신월은 정정·해제거래 반영을 고려해 재수집해야 한다.
- 서울 열린데이터광장 Sheet Open API는 페이지 단위 제한이 있으므로 처음에는 \`--max-pages\`를 낮게 둔다.
- R-ONE 통계는 원자료 실거래와 단위가 다르므로 가격지수/거래현황의 방향성 확인에 우선 사용한다.
`;
}

async function main() {
  const candidates = parseCsv(await readFile(CANDIDATES_INPUT, "utf8"));
  const summaries = rowsByRank(JSON.parse(await readFile(SUMMARIES_INPUT, "utf8")));
  const urbanDetails = rowsByRank(JSON.parse(await readFile(URBAN_DETAILS_INPUT, "utf8")));
  const noticeDetails = rowsByRank(JSON.parse(await readFile(NOTICE_DETAILS_INPUT, "utf8")));
  const marketRows = candidates.map((row) =>
    toMarketRow(row, summaries[row.rank], urbanDetails[row.rank], noticeDetails[row.rank]),
  );

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "project-market-areas.csv"), toCsv(marketRows));
  await writeFile(path.join(OUT_DIR, "project-market-areas.json"), JSON.stringify(marketRows, null, 2));
  await writeFile(path.join(OUT_DIR, "official-market-data-sources.csv"), toCsv(SOURCE_ROWS));
  await writeFile(path.join(OUT_DIR, "README.md"), markdownSummary(marketRows));

  console.log(
    JSON.stringify(
      {
        rows: marketRows.length,
        readyForApiKey: marketRows.filter((row) => row.market_data_status === "ready_for_api_key").length,
        outputDir: OUT_DIR,
      },
      null,
      2,
    ),
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) {
    lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
