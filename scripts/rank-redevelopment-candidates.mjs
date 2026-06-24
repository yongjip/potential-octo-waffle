#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json";
const OUT_DIR = "analysis";
const OUT_CSV = "priority-redevelopment-candidates.csv";
const OUT_MD = "priority-redevelopment-candidates.md";

const STAGE_SCORE = new Map([
  ["정비계획 수립", 16],
  ["안전진단", 14],
  ["안전진단(1차)", 14],
  ["정비구역지정", 20],
  ["추진위원회승인", 19],
  ["조합설립인가", 24],
  ["사업시행인가", 23],
  ["관리처분인가", 19],
  ["철거", 14],
  ["착공", 10],
  ["분양", 8],
  ["준공인가", 4],
  ["이전고시", 3],
  ["조합해산", 2],
  ["조합청산", 2],
  ["조합원 모집신고", 3],
  ["지구단위계획수립/건축심의/교통심의", 6],
  ["도시계획심의", 10],
  ["", 2],
]);

const TYPE_SCORE = new Map([
  ["재건축", 18],
  ["재개발(주택정비형)", 16],
  ["재개발(도시정비형)", 15],
  ["가로주택정비", 10],
  ["소규모재건축", 9],
  ["리모델링", 8],
  ["소규모재개발", 8],
  ["지역주택", 1],
]);

const DONG_PROFILE = {
  압구정동: {
    station: "압구정·압구정로데오권",
    livingScore: 24,
    tags: ["한강축", "강남북 연결", "대규모 재건축", "상급 주거지"],
    question: "한강변 경관·높이·공공기여 조건과 조합별 단계 차이를 같이 본다.",
  },
  대치동: {
    station: "대치·학여울·도곡권",
    livingScore: 23,
    tags: ["강남 학군", "노후 대단지", "3호선·수인분당선 접근"],
    question: "사업시행인가 이후 분담금·공사비와 학군 프리미엄의 균형을 본다.",
  },
  잠실동: {
    station: "잠실·종합운동장권",
    livingScore: 25,
    tags: ["2호선·8호선", "한강축", "잠실 MICE", "대규모 재건축"],
    question: "국제교류복합지구와 민간 재건축 일정의 결합 가능성을 본다.",
  },
  신천동: {
    station: "잠실나루·잠실권",
    livingScore: 23,
    tags: ["한강축", "잠실 MICE", "2호선 접근"],
    question: "잠실나루·한강축 입지와 주변 준공 사례의 가격 전이를 같이 본다.",
  },
  광장동: {
    station: "광나루·강변권",
    livingScore: 22,
    tags: ["한강축", "광진 동부 생활권", "5호선 접근", "한강 조망"],
    question: "신속통합기획·한강변 계획 조건과 강변역/동서울터미널 변화 연결성을 본다.",
  },
  구의동: {
    station: "구의·강변권",
    livingScore: 21,
    tags: ["2호선 접근", "강변역", "동서울터미널 영향권"],
    question: "소규모정비의 속도와 생활권 체감 개선 폭을 따로 본다.",
  },
  자양동: {
    station: "구의·건대입구·뚝섬유원지권",
    livingScore: 21,
    tags: ["2호선·7호선 접근", "한강 접근", "건대 상권", "구의 생활권"],
    question: "재개발 초기 단계의 구역계·권리산정기준일 리스크를 먼저 확인한다.",
  },
  청담동: {
    station: "청담·압구정로데오권",
    livingScore: 19,
    tags: ["한강축", "강남 고급 주거지"],
    question: "소규모 정비가 생활권 전체를 바꿀 정도인지, 개별 단지 개선인지 구분한다.",
  },
  삼성동: {
    station: "삼성·봉은사·종합운동장권",
    livingScore: 20,
    tags: ["국제교류복합지구", "9호선·2호선 접근"],
    question: "업무·MICE 개발과 주거 정비의 수혜 범위를 분리해 본다.",
  },
  개포동: {
    station: "개포동·대모산입구·구룡권",
    livingScore: 17,
    tags: ["강남 남부", "대규모 재건축 누적", "학군"],
    question: "이미 완료된 단지와 진행 중 단지의 가격·환경 차이를 비교한다.",
  },
  도곡동: {
    station: "도곡·매봉·양재권",
    livingScore: 18,
    tags: ["강남 학군", "3호선·수인분당선 접근"],
    question: "완료 임박 사업과 초기 사업을 분리해 추가 상승 여지를 본다.",
  },
  일원동: {
    station: "대청·일원권",
    livingScore: 15,
    tags: ["강남 남동부", "3호선 접근"],
    question: "강남 핵심축과의 거리 대비 가격·정비 속도의 보상을 본다.",
  },
  가락동: {
    station: "가락시장·경찰병원·오금권",
    livingScore: 16,
    tags: ["3호선·8호선 접근", "송파 남부"],
    question: "잠실 핵심권과 다른 수요층·가격대의 장단점을 본다.",
  },
  송파동: {
    station: "송파·석촌권",
    livingScore: 18,
    tags: ["8호선·9호선 접근", "잠실 배후"],
    question: "잠실 접근성과 독립 생활권 가치 중 어느 쪽이 큰지 본다.",
  },
  방이동: {
    station: "방이·올림픽공원권",
    livingScore: 17,
    tags: ["5호선·9호선 접근", "올림픽공원"],
    question: "대형 단지 재건축과 공원 인접성이 장기 수요를 얼마나 받치는지 본다.",
  },
  오금동: {
    station: "오금·방이권",
    livingScore: 14,
    tags: ["3호선·5호선 접근", "송파 동남부"],
    question: "소규모정비와 재건축 후보가 생활권 전체를 바꾸는지 확인한다.",
  },
  마천동: {
    station: "마천·거여권",
    livingScore: 15,
    tags: ["5호선 접근", "재정비촉진구역", "강남권 외곽 재개발"],
    question: "재개발 단계 진척과 위례·거여마천 생활권 개선을 같이 본다.",
  },
  거여동: {
    station: "거여·마천권",
    livingScore: 14,
    tags: ["5호선 접근", "송파 동남부"],
    question: "재정비 완료/진행 구역 간 주거환경 개선 속도 차이를 본다.",
  },
  문정동: {
    station: "문정·장지역권",
    livingScore: 16,
    tags: ["8호선 접근", "문정 업무지구"],
    question: "업무지구 배후수요와 재건축·리모델링 단계 차이를 같이 본다.",
  },
  풍납동: {
    station: "천호·강동구청·강변권",
    livingScore: 13,
    tags: ["한강축", "문화재 규제 가능성"],
    question: "풍납토성 등 규제와 한강 입지 장점을 같이 본다.",
  },
};

const FOCUS_SCORE = new Map([
  ["강남", 14],
  ["잠실/송파", 15],
  ["구의/광진", 15],
]);

const COMPLETION_STAGES = new Set(["준공인가", "이전고시", "조합해산", "조합청산"]);

function numberFromText(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function dongFromLot(value) {
  return (String(value ?? "").match(/^\S+/) ?? [""])[0];
}

function docScore(publicDocCount) {
  const count = numberFromText(publicDocCount);
  if (count >= 3000) return 20;
  if (count >= 1500) return 18;
  if (count >= 700) return 15;
  if (count >= 200) return 11;
  if (count >= 50) return 7;
  if (count > 0) return 3;
  return 0;
}

function stageScore(stage) {
  return STAGE_SCORE.get(stage) ?? 5;
}

function typeScore(type) {
  return TYPE_SCORE.get(type) ?? 5;
}

function profileFor(row) {
  const dong = dongFromLot(row.representative_lot);
  return DONG_PROFILE[dong] ?? {
    station: `${dong || "미확인"}권`,
    livingScore: 10,
    tags: ["추가 확인 필요"],
    question: "대표지번 기준 역세권과 도시계획 조건을 먼저 확인한다.",
  };
}

function riskNotes(row) {
  const notes = [];
  const count = numberFromText(row.public_doc_count);
  if (["정비계획 수립", "안전진단", "안전진단(1차)", "추진위원회승인", "정비구역지정"].includes(row.current_stage)) {
    notes.push("초기 단계라 구역계·동의율·일정 변동 가능성");
  }
  if (["사업시행인가", "관리처분인가"].includes(row.current_stage)) {
    notes.push("공사비·분담금·이주 일정 확인 필요");
  }
  if (["착공", "분양", "준공인가", "이전고시", "조합해산", "조합청산"].includes(row.current_stage)) {
    notes.push("미래 개발 모멘텀보다 완료/정산 사례 분석에 적합");
  }
  if (row.project_type === "지역주택") notes.push("지역주택조합은 사업 안정성 별도 검증 필요");
  if (row.project_type === "리모델링") notes.push("재건축과 사업성·규제·상품성이 다름");
  if (count === 0) notes.push("공개자료가 없어 공식 원문 추가 확인 필요");
  if (count > 1500) notes.push("공개자료가 많아 단계 이력 추적 가치 높음");
  return notes.join("; ");
}

function priorityTier(score) {
  if (score >= 85) return "S";
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  return "C";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "rank",
    "priority_tier",
    "score",
    "focus_area",
    "district",
    "dong",
    "project_name",
    "project_type",
    "representative_lot",
    "current_stage",
    "public_doc_count",
    "estimated_station_area",
    "strategic_tags",
    "next_research_question",
    "risk_notes",
    "cafe_id",
    "official_project_url",
    "official_map_url",
    "source_url",
    "collected_at",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function mdTable(rows) {
  const lines = [
    "| 순위 | 등급 | 점수 | 생활권 | 사업명 | 단계 | 추정 역세권/생활권 | 다음 질문 |",
    "| ---: | --- | ---: | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.rank} | ${row.priority_tier} | ${row.score} | ${row.focus_area} | ${row.project_name} | ${row.current_stage || "미확인"} | ${row.estimated_station_area} | ${row.next_research_question} |`,
    );
  }
  return lines.join("\n");
}

function scoreRow(row) {
  const profile = profileFor(row);
  const score =
    stageScore(row.current_stage) +
    typeScore(row.project_type) +
    docScore(row.public_doc_count) +
    (FOCUS_SCORE.get(row.focus_area) ?? 8) +
    profile.livingScore;
  return {
    ...row,
    score,
    dong: dongFromLot(row.representative_lot),
    priority_tier: priorityTier(score),
    estimated_station_area: profile.station,
    strategic_tags: profile.tags.join("; "),
    next_research_question: profile.question,
    risk_notes: riskNotes(row),
  };
}

function selectBalanced(rows, limitPerFocus = 10) {
  const selected = [];
  for (const focusArea of ["강남", "잠실/송파", "구의/광진"]) {
    selected.push(...rows.filter((row) => row.focus_area === focusArea).slice(0, limitPerFocus));
  }
  return selected.sort((a, b) => b.score - a.score || numberFromText(b.public_doc_count) - numberFromText(a.public_doc_count));
}

function kstDateTime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute} KST`;
}

async function main() {
  const rows = JSON.parse(await readFile(INPUT, "utf8"));
  const ranked = rows
    .map(scoreRow)
    .filter((row) => !COMPLETION_STAGES.has(row.current_stage))
    .sort((a, b) => b.score - a.score || numberFromText(b.public_doc_count) - numberFromText(a.public_doc_count));
  const selected = selectBalanced(ranked, 10).map((row, index) => ({ ...row, rank: index + 1 }));

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(selected));
  await writeFile(
    path.join(OUT_DIR, OUT_MD),
    `# 서울 재개발·재건축 우선검토 후보\n\n` +
      `작성 기준: ${kstDateTime()}, 정비사업 정보몽땅 수집 데이터 기반\n\n` +
      `## 선별 기준\n\n` +
      `이 목록은 투자 추천이 아니라 리서치 우선순위다. 정비사업 정보몽땅 공식 목록에서 확인 가능한 현재단계, 사업유형, 공개자료 수에 사용자의 생활권 관심도와 대표지번 동 단위의 교통·입지 추정 태그를 더해 1차로 정렬했다.\n\n` +
      `- 원천 데이터: \`${INPUT}\`\n` +
      `- 제외: 준공인가, 이전고시, 조합해산, 조합청산 단계\n` +
      `- 균형 조건: 강남, 잠실/송파, 구의/광진에서 각 10개씩 선별\n` +
      `- 교통·입지 태그는 공식 원문 검증 전의 리서치 가설이다.\n` +
      `- CSV 파일에는 정비사업 정보몽땅 사업장 URL과 서울도시공간포털 지도 URL을 포함했다.\n\n` +
      `## 후보 30개\n\n` +
      `${mdTable(selected)}\n\n` +
      `## 다음 확인 순서\n\n` +
      `1. 정비사업 정보몽땅 사업장 페이지에서 최근 공개자료와 총회/인가 문서를 확인한다.\n` +
      `2. 서울도시공간포털에서 대표지번의 지구단위계획, 결정고시, 정비구역계를 확인한다.\n` +
      `3. 서울시 주택·도시계획 분야와 정보소통광장에서 심의 결과와 결재문서를 찾는다.\n` +
      `4. 실거래가, 서울부동산정보광장, R-ONE으로 단계 변화 전후의 거래량·가격·전세 흐름을 본다.\n`,
  );

  const counts = selected.reduce((acc, row) => {
    acc[row.focus_area] = (acc[row.focus_area] ?? 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ inputRows: rows.length, rankedRows: ranked.length, selectedRows: selected.length, counts }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
