#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const OUT_DIR = "analysis";

const OFFICIAL_SOURCES = {
  seoul_traffic: {
    title: "서울시 교통 분야",
    url: "https://news.seoul.go.kr/traffic/",
    use: "지하철, 교통통계, 보행, TOPIS, 도시철도망 보도자료 확인",
  },
  seoul_citybuild: {
    title: "서울시 주택·도시계획 분야",
    url: "https://news.seoul.go.kr/citybuild/",
    use: "국제교류복합지구, 한강변관리기본계획, 생활권계획, 역세권활성화 확인",
  },
  seoul_urban: {
    title: "서울도시공간포털",
    url: "https://urban.seoul.go.kr/",
    use: "도시계획 결정고시, 지구단위계획, 정비구역계, 도시계획시설 확인",
  },
  cleanup: {
    title: "정비사업 정보몽땅",
    url: "https://cleanup.seoul.go.kr/",
    use: "정비사업 진행단계, 사업개요, 공개자료, 관리처분/사업시행 자료 확인",
  },
  opengov: {
    title: "서울 정보소통광장",
    url: "https://opengov.seoul.go.kr/",
    use: "심의자료, 결재문서, 위원회 회의정보 확인",
  },
};

const AREA_PROFILES = [
  {
    test: /잠실·종합운동장권/,
    mobility_axis: "잠실역·종합운동장 환승축",
    primary_lines: "2호선; 8호선; 9호선 영향권",
    urban_change_drivers: "국제교류복합지구; 잠실 MICE; 종합운동장 일대; 한강축",
    long_term_thesis:
      "동남권 광역업무·전시·스포츠 거점과 대단지 재건축이 결합되는 축이다. 역 접근성보다 공공개발 일정과 민간 정비사업 이주/착공 타이밍을 분리해서 봐야 한다.",
    mobility_risks: "행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절; 이주기 전세 압력",
    av_sensitivity: "자율주행 보편화 시 간선도로 접근성은 보완되지만, 대형 환승역·업무거점 프리미엄은 계속 핵심 변수",
    fieldwork_checks: "잠실역 환승 동선; 종합운동장 방향 보행; 한강/탄천 단절; 단지 출입구와 간선도로 접속",
    source_keys: ["seoul_citybuild", "seoul_traffic", "seoul_urban", "cleanup"],
    score: 10,
  },
  {
    test: /잠실나루·잠실권/,
    mobility_axis: "잠실나루·잠실 한강축",
    primary_lines: "2호선; 8호선 접근",
    urban_change_drivers: "한강축; 잠실 MICE 배후; 잠실역 생활권",
    long_term_thesis:
      "잠실 핵심 생활권의 배후축이다. 한강 접근성과 잠실역 접근성은 강점이지만, 단지별 구역계와 도로 단절을 현장 확인해야 한다.",
    mobility_risks: "잠실역까지 실제 보행거리; 올림픽대로/한강 접근 단절; 대단지 이주기 혼잡",
    av_sensitivity: "자율주행은 강변 도로 접근성을 보완할 수 있으나, 한강 보행 접근성과 지하철 접근성 차이는 남는다",
    fieldwork_checks: "잠실나루역 보행; 한강공원 접근; 올림픽대로 단절; 잠실역 상권 연결",
    source_keys: ["seoul_citybuild", "seoul_traffic", "seoul_urban"],
    score: 8,
  },
  {
    test: /송파·석촌권/,
    mobility_axis: "송파·석촌 8/9호선 배후축",
    primary_lines: "8호선; 9호선 접근",
    urban_change_drivers: "잠실 배후 주거지; 석촌호수 생활권; 송파대로 축",
    long_term_thesis:
      "잠실 핵심부보다 가격 기대는 낮지만, 8·9호선 접근과 송파대로 생활권을 통해 재건축 진척의 파급을 받을 수 있다.",
    mobility_risks: "잠실 핵심부 대비 역세권 강도 차이; 상업/관광 혼잡; 단지별 도로 접속",
    av_sensitivity: "차량 접근성 개선보다 8·9호선과 잠실 핵심부 보행/버스 연결 품질이 중요",
    fieldwork_checks: "석촌역/송파역 접근; 송파대로 횡단; 석촌호수 접근; 잠실역까지 실제 이동시간",
    source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
    score: 7,
  },
  {
    test: /문정·장지역권/,
    mobility_axis: "문정·장지 8호선 업무지구축",
    primary_lines: "8호선 접근",
    urban_change_drivers: "문정 업무지구; 동남권 법조·업무 수요; 장지·위례 연계",
    long_term_thesis:
      "잠실 핵심축보다는 업무지구 배후 주거 성격이 강하다. 직주근접 수요와 재건축 속도를 함께 봐야 한다.",
    mobility_risks: "잠실/강남 핵심 업무지 접근의 환승 의존; 업무지구 수요의 가격 반영 여부",
    av_sensitivity: "자율주행은 동남권 도로 접근성을 높일 수 있어 업무지구 배후 입지에는 보완적",
    fieldwork_checks: "문정역/장지역 접근; 문정 업무지구 보행; 동부간선/송파대로 접속",
    source_keys: ["seoul_traffic", "seoul_citybuild", "seoul_urban"],
    score: 6,
  },
  {
    test: /방이·올림픽공원권/,
    mobility_axis: "방이·올림픽공원 5/9호선축",
    primary_lines: "5호선; 9호선 접근",
    urban_change_drivers: "올림픽공원; 잠실 동측 배후; 9호선 접근",
    long_term_thesis:
      "공원 인접성과 5·9호선 접근이 장점이다. 잠실 MICE 직접 수혜보다는 생활환경과 배후 수요를 분리해서 본다.",
    mobility_risks: "역까지의 실제 거리; 공원 주변 도로 단절; 행사일 혼잡",
    av_sensitivity: "자율주행보다 공원 접근성과 9호선 접근성이 장기 프리미엄의 핵심",
    fieldwork_checks: "올림픽공원역/방이역 접근; 공원 경계부 보행; 잠실까지 버스/지하철 동선",
    source_keys: ["seoul_traffic", "seoul_urban"],
    score: 7,
  },
  {
    test: /마천·거여권/,
    mobility_axis: "마천·거여 5호선 재정비축",
    primary_lines: "5호선 접근",
    urban_change_drivers: "마천 재정비촉진구역; 거여·마천 노후 주거지 정비",
    long_term_thesis:
      "상급지 재건축과 다른 재개발 성격이다. 교통 프리미엄보다 정비구역 확정도, 권리관계, 공급 물량과 사업속도가 중요하다.",
    mobility_risks: "강남 핵심부 접근 시간; 언덕/도로폭/생활편의 격차; 재정비구역 장기 지연",
    av_sensitivity: "자율주행은 외곽 접근성을 일부 보완하지만, 지하철 중심 통근과 정비사업 단계가 더 큰 변수",
    fieldwork_checks: "마천역 접근; 구역 경계; 경사와 도로폭; 위례/거여 연결",
    source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
    score: 5,
  },
  {
    test: /압구정·압구정로데오권/,
    mobility_axis: "압구정 한강변·강남북 연결축",
    primary_lines: "3호선; 수인분당선 접근",
    urban_change_drivers: "한강변관리; 압구정아파트지구; 강남북 연결; 상급 주거지",
    long_term_thesis:
      "서울 최상급 한강변 재건축 축이다. 교통보다 한강변 경관, 높이, 공공기여, 조합별 단계 차이가 가치와 리스크를 가른다.",
    mobility_risks: "한강변 경관/높이 규제; 압구정로 혼잡; 조합별 사업속도 차이",
    av_sensitivity: "자율주행이 도로혼잡을 완화해도 한강변 희소성과 도시계획 조건이 더 큰 변수",
    fieldwork_checks: "압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감",
    source_keys: ["seoul_citybuild", "seoul_traffic", "seoul_urban", "cleanup"],
    score: 10,
  },
  {
    test: /대치·학여울·도곡권/,
    mobility_axis: "대치·학여울 학군·3호선축",
    primary_lines: "3호선; 수인분당선 접근",
    urban_change_drivers: "강남 학군; 노후 대단지 재건축; 양재천/도곡 생활권",
    long_term_thesis:
      "학군과 기존 생활 인프라가 강한 축이다. 교통개선 호재보다 재건축 단계, 분담금, 이주 가능성, 대체 신축 공급을 봐야 한다.",
    mobility_risks: "학원가/학교 주변 혼잡; 대치권 가격 선반영; 단지별 역 접근 차이",
    av_sensitivity: "자율주행은 통학·학원 이동을 보완할 수 있으나, 학군 접근성과 기존 수요 기반이 핵심",
    fieldwork_checks: "대치역/학여울역/도곡역 접근; 학원가 혼잡; 양재천 접근; 단지별 출입구",
    source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
    score: 8,
  },
  {
    test: /개포동·대모산입구·구룡권/,
    mobility_axis: "개포·대모산입구 강남 남부축",
    primary_lines: "수인분당선; 3호선 연계",
    urban_change_drivers: "개포 재건축 누적; 강남 남부 주거지; 녹지 접근",
    long_term_thesis:
      "개포 일대 신축 누적 효과와 녹지 접근성이 강점이다. 추가 정비사업은 주변 신축 가격과 공급 물량을 함께 비교해야 한다.",
    mobility_risks: "강남 핵심 업무지까지 환승/버스 의존; 주변 신축 공급과 비교; HWP 이미지 OCR 수치 대조 필요",
    av_sensitivity: "자율주행은 강남 남부 도로 접근성을 보완할 수 있어 역세권 약점을 일부 줄일 수 있다",
    fieldwork_checks: "대모산입구/구룡역 접근; 녹지 접근; 주변 신축 단지 가격대; 양재대로 접속",
    source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
    score: 7,
  },
  {
    test: /구의·건대입구·뚝섬유원지권/,
    mobility_axis: "구의·건대입구 2/7호선·한강축",
    primary_lines: "2호선; 7호선 접근",
    urban_change_drivers: "건대입구 상권; 한강 접근; 구의 생활권; 자양 정비",
    long_term_thesis:
      "강남·잠실보다 덜 완성된 생활권이지만, 2·7호선과 한강 접근을 동시에 가진 축이다. 자양·구의 정비사업의 구역계와 속도가 핵심이다.",
    mobility_risks: "한강/뚝섬 접근의 도로 단절; 상권 혼잡; 소규모정비의 사업성 편차",
    av_sensitivity: "자율주행은 강변북로 접근성을 높일 수 있으나, 2·7호선 환승성과 한강 보행 접근이 계속 중요",
    fieldwork_checks: "구의역/건대입구역 접근; 뚝섬유원지 연결; 자양동 내부 도로폭; 건대 상권 영향",
    source_keys: ["seoul_traffic", "seoul_citybuild", "seoul_urban", "cleanup"],
    score: 7,
  },
  {
    test: /구의·강변권/,
    mobility_axis: "구의·강변 동서울터미널축",
    primary_lines: "2호선 접근; 버스터미널 광역교통",
    urban_change_drivers: "강변역; 동서울터미널 현대화 가능성; 한강·광진 생활권",
    long_term_thesis:
      "동서울터미널과 강변역 일대 변화가 광진 동부의 생활권 위상을 바꿀 수 있다. 공식 도시계획/사전협상 자료 확인이 먼저다.",
    mobility_risks: "터미널/강변역 혼잡; 큰 도로와 한강 접근 단절; 공식 일정 불확실성",
    av_sensitivity: "자율주행·광역버스 고도화가 터미널 입지 가치를 바꿀 수 있어 시나리오 민감도가 높다",
    fieldwork_checks: "강변역 환승; 동서울터미널 보행환경; 구의동 내부 도로폭; 한강 접근",
    source_keys: ["seoul_citybuild", "seoul_traffic", "seoul_urban", "opengov"],
    score: 8,
  },
  {
    test: /광나루·강변권/,
    mobility_axis: "광나루·강변 한강 동부축",
    primary_lines: "5호선; 2호선 연계",
    urban_change_drivers: "한강 조망; 광진 동부 생활권; 강변역/동서울터미널 영향",
    long_term_thesis:
      "한강 조망과 광나루 생활권이 강점이지만, 공식 지도·고시 매칭이 부족한 사업이 있어 기초 검증이 먼저다.",
    mobility_risks: "5호선 단일 접근성; 강변북로/한강 단절; 구역계와 고시/인가 원문 연결 확인 필요",
    av_sensitivity: "자율주행은 강변북로 접근성을 높일 수 있으나, 역 접근성과 한강 단절 해소 여부가 더 중요",
    fieldwork_checks: "광나루역 접근; 강변역 연결; 한강공원 접근; 구역계와 단지 경계 확인",
    source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
    score: 6,
  },
  {
    test: /중곡동권/,
    mobility_axis: "중곡 7호선 생활권",
    primary_lines: "7호선 접근",
    urban_change_drivers: "중곡 노후 주거지 정비; 군자·아차산 생활권",
    long_term_thesis:
      "대형 개발축보다 생활권 개선형 정비에 가깝다. 사업성, 조합 단계, 주변 공급과 역 접근성을 차분히 봐야 한다.",
    mobility_risks: "대형 업무·상업 거점과의 거리; 도로폭/노후도; 사업규모 한계",
    av_sensitivity: "자율주행 효과는 제한적이고 7호선 접근성과 주거환경 개선이 핵심",
    fieldwork_checks: "중곡역/군자역 접근; 도로폭; 생활편의; 주변 정비사업 유무",
    source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
    score: 5,
  },
];

const DEFAULT_PROFILE = {
  mobility_axis: "생활권 추가 확인 필요",
  primary_lines: "공식 교통망 원문 확인 필요",
  urban_change_drivers: "정비사업 단계; 생활권계획; 도시계획 고시",
  long_term_thesis: "현재 후보 태그만으로는 교통입지 가설이 약하므로 공식 교통망과 현장 동선을 먼저 확인한다.",
  mobility_risks: "역 접근성, 도로 단절, 생활편의, 공식 계획 확정도 미확인",
  av_sensitivity: "자율주행 영향은 도로 접근성 개선 가능성으로 별도 시나리오 처리",
  fieldwork_checks: "가장 가까운 역; 간선도로 횡단; 버스 환승; 보행환경; 생활편의",
  source_keys: ["seoul_traffic", "seoul_urban", "cleanup"],
  score: 3,
};

function profileFor(row) {
  return AREA_PROFILES.find((profile) => profile.test.test(row.estimated_station_area || "")) || DEFAULT_PROFILE;
}

function parseLineCount(primaryLines) {
  const matches = String(primaryLines).match(/\d+호선|수인분당선|버스터미널|광역교통/g);
  return matches ? new Set(matches).size : 0;
}

function sourceList(keys) {
  return keys.map((key) => `${OFFICIAL_SOURCES[key].title}: ${OFFICIAL_SOURCES[key].url}`).join("; ");
}

function sourceTitles(keys) {
  return keys.map((key) => OFFICIAL_SOURCES[key].title).join("; ");
}

function sourceRows() {
  return Object.entries(OFFICIAL_SOURCES).map(([source_key, source]) => ({
    source_key,
    title: source.title,
    url: source.url,
    use: source.use,
  }));
}

function contextScore(row, profile) {
  let score = profile.score;
  const tags = `${row.strategic_tags || ""} ${profile.urban_change_drivers}`;
  if (tags.includes("한강")) score += 0.5;
  if (tags.includes("MICE") || tags.includes("국제교류복합지구")) score += 1;
  if (tags.includes("동서울터미널")) score += 1;
  if (tags.includes("대규모 재건축")) score += 0.5;
  if (row.current_stage === "관리처분인가") score += 0.5;
  if (row.fact_check_priority === "map_match_first") score -= 1;
  if (row.text_coverage === "no_notice_text") score -= 0.5;
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function longTermThesis(row, profile) {
  if (row.fact_check_priority !== "notice_record_needed") return profile.long_term_thesis;
  return profile.long_term_thesis.replace(
    "공식 지도·고시 매칭이 부족한 사업이 있어 기초 검증이 먼저다.",
    "사업구역 레이어는 확인됐지만 고시/인가 원문 연결이 필요한 사업이 있어 기초 검증이 먼저다.",
  );
}

function mobilityRisks(row, profile) {
  if (row.fact_check_priority !== "notice_record_needed") return profile.mobility_risks;
  return profile.mobility_risks.replace("구역계와 고시/인가 원문 연결 확인 필요", "사업구역 레이어 확인, 고시 recordCode/인가 원문 미연결");
}

function nextTransportAction(row) {
  if (row.fact_check_priority === "notice_candidate_review") return "보강 고시 원문에서 기반시설·도로 조건을 대조한 뒤 현장 동선 확인";
  if (row.fact_check_priority === "notice_record_needed") return "사업구역 레이어 확인값을 기준으로 고시/인가 원문 연결 후 역/도로 단절 확인";
  if (row.fact_check_priority === "map_match_first") return "서울도시공간포털 지도/고시 recordCode 후보 확정 후 역/도로 단절 확인";
  if (row.text_coverage === "ocr_needed" || row.text_coverage === "hwp_or_ocr_needed") return "원문 OCR/수동확인 후 교통·기반시설 결정조서 확인";
  if (row.notice_text_extraction_status === "ocr_extracted" || row.notice_text_extraction_status === "hwp_ocr_extracted") {
    return "OCR 텍스트를 원문 이미지와 대조한 뒤 교통·기반시설 결정조서 확인";
  }
  if ((row.strategic_tags || "").includes("잠실 MICE")) return "국제교류복합지구·잠실 MICE 일정과 사업단계 타임라인 대조";
  if ((row.strategic_tags || "").includes("한강")) return "한강변관리·경관·보행 접근 원문과 현장 동선 대조";
  if ((row.strategic_tags || "").includes("동서울터미널")) return "동서울터미널/강변역 관련 도시계획·사전협상 자료 확인";
  return "공식 교통/도시계획 출처에서 생활권 변화 가설 확인";
}

function buildRows(matrixRows) {
  return matrixRows.map((row) => {
    const profile = profileFor(row);
    const sourceKeys = profile.source_keys;
    return {
      rank: row.rank,
      focus_area: row.focus_area,
      district: row.district,
      dong: row.dong,
      project_name: row.project_name,
      current_stage: row.current_stage,
      estimated_station_area: row.estimated_station_area,
      mobility_axis: profile.mobility_axis,
      primary_lines: profile.primary_lines,
      line_or_mode_count: parseLineCount(profile.primary_lines),
      urban_change_drivers: profile.urban_change_drivers,
      long_term_thesis: longTermThesis(row, profile),
      mobility_risks: mobilityRisks(row, profile),
      autonomous_vehicle_sensitivity: profile.av_sensitivity,
      fieldwork_checks: profile.fieldwork_checks,
      official_sources_to_check: sourceTitles(sourceKeys),
      official_source_urls: sourceList(sourceKeys),
      location_context_score: contextScore(row, profile),
      next_transport_action: nextTransportAction(row),
      source_coverage_score: row.source_coverage_score,
      fact_check_priority: row.fact_check_priority,
      project_note: row.project_note,
    };
  });
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

function groupBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "미확인";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function focusSummary(rows) {
  return Object.entries(groupBy(rows, "focus_area")).map(([focus_area, items]) => {
    const top = [...items].sort((a, b) => b.location_context_score - a.location_context_score || Number(a.rank) - Number(b.rank))[0];
    const axes = [...new Set(items.map((item) => item.mobility_axis))].join("; ");
    const average = Math.round((items.reduce((sum, item) => sum + item.location_context_score, 0) / items.length) * 10) / 10;
    return {
      focus_area,
      project_count: items.length,
      average_location_context_score: average,
      mobility_axes: axes,
      first_project: `${top.rank}. ${top.project_name}`,
      first_transport_action: top.next_transport_action,
    };
  });
}

function markdown(rows, sources) {
  const topRows = [...rows].sort((a, b) => b.location_context_score - a.location_context_score || Number(a.rank) - Number(b.rank)).slice(0, 12);
  const sourceTable = mdTable(sources, [
    { key: "title", label: "공식 출처" },
    { key: "use", label: "확인 용도" },
    { key: "url", label: "URL" },
  ]);

  const focusSections = Object.entries(groupBy(rows, "focus_area"))
    .map(([focus, items]) => {
      const sorted = [...items].sort((a, b) => b.location_context_score - a.location_context_score || Number(a.rank) - Number(b.rank));
      return `## ${focus}

${mdTable(sorted, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "estimated_station_area", label: "역/생활권" },
  { key: "mobility_axis", label: "교통축" },
  { key: "primary_lines", label: "노선/수단" },
  { key: "location_context_score", label: "입지맥락" },
  { key: "next_transport_action", label: "다음 확인" },
])}
`;
    })
    .join("\n");

  return `# 교통입지·생활권 컨텍스트 매트릭스

작성 기준: ${kstDate()} KST

이 문서는 우선검토 후보 30개를 교통축, 생활권 변화, 현장 확인 포인트, 공식 검증 출처로 묶은 파생 산출물이다. 역까지의 실제 거리 계산이나 투자 점수가 아니라, 어떤 교통·생활권 가설을 어떤 공식 원문으로 확인할지 정하는 작업표다.

## 공식 출처

${sourceTable}

## 생활권 요약

${mdTable(focusSummary(rows), [
  { key: "focus_area", label: "생활권" },
  { key: "project_count", label: "후보" },
  { key: "average_location_context_score", label: "평균 입지맥락" },
  { key: "mobility_axes", label: "주요 교통축" },
  { key: "first_project", label: "먼저 볼 사업" },
  { key: "first_transport_action", label: "첫 확인 작업" },
])}

## 우선 확인 후보

${mdTable(topRows, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "mobility_axis", label: "교통축" },
  { key: "urban_change_drivers", label: "변화 동인" },
  { key: "location_context_score", label: "입지맥락" },
  { key: "next_transport_action", label: "다음 확인" },
])}

${focusSections}

## 해석 원칙

- 지하철 접근성은 현재 생활권의 기본 체력이고, MICE·동서울터미널·한강변관리 같은 공공 프로젝트는 장기 변화 변수다.
- 자율주행 보편화 시나리오는 역세권 가치를 대체하기보다 도로 접근성, 주차, 환승, 터미널 기능의 민감도를 바꾸는 보조 변수로 둔다.
- 지도 미매칭 또는 고시 원문 미연결 사업은 입지 가설보다 구역계, 고시 recordCode, 인가 원문 매칭이 먼저다.
- 현장 답사에서는 역 출구 기준 직선거리보다 횡단보도, 대형도로, 한강/탄천 단절, 단지 출입구 위치를 우선 기록한다.
`;
}

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

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const rows = buildRows(matrixRows);
  const sources = sourceRows();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "transport-location-context.json"), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "transport-location-context.csv"), toCsv(rows));
  await writeFile(path.join(OUT_DIR, "transport-location-context.md"), markdown(rows, sources));
  await writeFile(path.join(OUT_DIR, "official-context-sources.csv"), toCsv(sources));
  console.log(JSON.stringify({ rows: rows.length, sources: sources.length, output: "analysis/transport-location-context.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
