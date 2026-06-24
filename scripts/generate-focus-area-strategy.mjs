#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
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

const FOCUS_PROFILES = {
  강남: {
    thesis:
      "압구정 한강변 대규모 재건축과 대치 학군권 재건축이 동시에 진행되는 축이다. 이미 기대가 많이 반영된 상급지라 행정 단계보다 공공기여, 높이, 분담금, 사업시행인가 이후 비용 변수가 핵심이다.",
    watch_variables: ["한강변 높이/경관", "공공기여와 기반시설", "사업시행인가 이후 공사비", "학군 프리미엄", "대체 신축 대단지 가격"],
    first_deep_dive: ["압구정아파트지구 특별계획구역②", "은마아파트", "대치우성1차"],
    fieldwork_route: "압구정역/압구정로데오역 -> 한강변 단지 경계 -> 대치역/학여울역 -> 은마·우성·쌍용 축",
  },
  "잠실/송파": {
    thesis:
      "잠실5단지와 잠실·신천 한강축, 송파동·가락동 재건축, 마천 재개발이 같은 자치구 안에서 다른 속도로 움직인다. 잠실 MICE·종합운동장·한강축 기대와 관리처분/이주 리스크를 분리해서 봐야 한다.",
    watch_variables: ["잠실 MICE/국제교류복합지구", "2·8·9호선 접근성", "한강축", "관리처분/이주 전세 압력", "송파동·가락동 가격 전이"],
    first_deep_dive: ["잠실5단지", "잠실우성4차", "가락삼익맨숀"],
    fieldwork_route: "잠실역 -> 잠실5단지 -> 잠실나루/장미 -> 석촌·송파동 -> 가락삼익/가락현대",
  },
  "구의/광진": {
    thesis:
      "광진은 자양·구의·광장·중곡이 서로 다른 정비 유형으로 움직인다. 강변/구의/건대입구/광나루 생활권과 동서울터미널 변화 가능성은 좋지만, 공식 지도·고시 매칭과 원문 커버리지가 아직 낮아 기초 확인이 선행되어야 한다.",
    watch_variables: ["동서울터미널/강변역 변화", "한강 접근성과 도로 단절", "소규모정비 속도", "자양 재개발 구역계", "광장동 대단지/소규모정비 구분"],
    first_deep_dive: ["자양한양아파트", "자양4동 A구역", "광장극동"],
    fieldwork_route: "구의역 -> 강변역/동서울터미널 -> 자양동 -> 건대입구 -> 광나루/광장동",
  },
};

function countBy(rows, field) {
  return rows.reduce((acc, row) => {
    const key = row[field] || "미확인";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function entriesText(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([name, count]) => `${name} ${count}`)
    .join(", ");
}

function numeric(value) {
  const text = String(value ?? "").replaceAll(",", "");
  const match = text.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function readinessScore(row) {
  let score = 0;
  score += Number(row.stage_order || 0) * 2;
  score += numeric(row.score) / 20;
  score += row.text_coverage === "text_extracted" ? 4 : 0;
  score += row.has_urban_map === "Y" ? 2 : 0;
  score += row.has_local_notice_file === "Y" ? 2 : 0;
  score += row.current_stage === "관리처분인가" ? 3 : 0;
  score += row.current_stage === "사업시행인가" ? 2 : 0;
  score += row.current_stage === "정비계획 수립" ? 1 : 0;
  if (row.fact_check_priority === "map_match_first") score -= 4;
  if (row.fact_check_priority === "convert_first") score -= 2;
  return Math.round(score * 10) / 10;
}

function bottlenecks(rows) {
  const items = [];
  const mapMissing = rows.filter((row) => row.fact_check_priority === "map_match_first");
  const noticeCandidateReview = rows.filter((row) => row.fact_check_priority === "notice_candidate_review");
  const guNoticeReview = rows.filter((row) => row.fact_check_priority === "gu_notice_review");
  const noticeRecordNeeded = rows.filter((row) => row.fact_check_priority === "notice_record_needed");
  const ocr = rows.filter((row) => row.text_coverage === "ocr_needed");
  const hwp = rows.filter((row) => row.text_coverage === "hwp_conversion_needed");
  const hwpLowConfidence = rows.filter((row) => row.text_coverage === "hwp_or_ocr_needed");
  const noHouseholds = rows.filter((row) => !row.total_households_official);
  const stagePublicDocs = rows.filter((row) => row.has_stage_public_docs === "Y");
  if (mapMissing.length) items.push(`서울도시공간포털 지도/고시 미매칭 ${mapMissing.length}개`);
  if (noticeCandidateReview.length) items.push(`사업구역 기반 고시 후보 원문 대조 ${noticeCandidateReview.length}개`);
  if (guNoticeReview.length) items.push(`광진구청 고시공고 원문 대조 ${guNoticeReview.length}개`);
  if (noticeRecordNeeded.length) items.push(`사업구역 레이어 매칭 후 고시 recordCode 확인 ${noticeRecordNeeded.length}개`);
  if (stagePublicDocs.length && noticeRecordNeeded.length) items.push(`정보몽땅 단계 공개항목 보강 ${stagePublicDocs.length}개, 고시 원문 연결은 별도`);
  if (ocr.length) items.push(`스캔 PDF OCR 필요 ${ocr.length}개`);
  if (hwp.length) items.push(`HWP 외부 변환 필요 ${hwp.length}개`);
  if (hwpLowConfidence.length) items.push(`HWP 직접 추출 저신뢰 ${hwpLowConfidence.length}개`);
  if (noHouseholds.length) items.push(`공식 세대수 공란 ${noHouseholds.length}개`);
  return items.length ? items : ["공식 원문 커버리지 양호, 수치 대조 단계"];
}

function topProjects(rows, limit = 5) {
  return [...rows]
    .map((row) => ({ ...row, readiness_score: readinessScore(row) }))
    .sort((a, b) => b.readiness_score - a.readiness_score || Number(a.rank) - Number(b.rank))
    .slice(0, limit);
}

function actionQueue(rows) {
  return [...rows]
    .map((row) => ({ ...row, readiness_score: readinessScore(row) }))
    .sort((a, b) => {
      const priority = {
        very_high: 1,
        original_notice_fact_checked: 2,
        district_text_review: 3,
        gu_text_review: 4,
        notice_candidate_review: 5,
        gu_notice_review: 6,
        notice_record_needed: 7,
        map_match_first: 8,
        convert_first: 9,
        high: 10,
        normal: 11,
      };
      return (
        (priority[a.fact_check_priority] || 99) - (priority[b.fact_check_priority] || 99) ||
        Number(b.readiness_score || 0) - Number(a.readiness_score || 0) ||
        Number(a.rank) - Number(b.rank)
      );
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

function strategyRows(matrixRows) {
  const focusNames = [...new Set(matrixRows.map((row) => row.focus_area))];
  return focusNames.map((focus) => {
    const rows = matrixRows.filter((row) => row.focus_area === focus);
    const profile = FOCUS_PROFILES[focus] || {
      thesis: "공식 원문 기준으로 단계와 시장 변수를 함께 확인한다.",
      watch_variables: [],
      first_deep_dive: [],
      fieldwork_route: "",
    };
    const top = topProjects(rows, 3);
    const queue = actionQueue(rows);
    return {
      focus_area: focus,
      candidate_count: rows.length,
      thesis: profile.thesis,
      watch_variables: profile.watch_variables.join("; "),
      first_deep_dive_projects: top.map((row) => `${row.rank}.${shortName(row.project_name)}`).join("; "),
      fieldwork_route: profile.fieldwork_route,
      stage_mix: entriesText(countBy(rows, "stage_bucket")),
      text_coverage_mix: entriesText(countBy(rows, "text_coverage")),
      official_coverage_avg: Math.round((rows.reduce((sum, row) => sum + Number(row.source_coverage_score || 0), 0) / rows.length) * 10) / 10,
      bottlenecks: bottlenecks(rows).join("; "),
      first_action: queue[0]?.next_action || "",
      first_action_project: queue[0] ? `${queue[0].rank}.${shortName(queue[0].project_name)}` : "",
      market_next_step: "API 키 준비 후 market-fetch-plan 기준 실거래 수집",
    };
  });
}

function shortName(value) {
  return String(value)
    .replace(/ 주택재건축정비사업조합| 재건축정비사업조합| 주택재개발정비사업조합| 조합설립추진위원회| 재건축정비사업| 주택재건축정비사업 조합| 주택재건축정비사업/g, "")
    .trim();
}

function markdown(rows, matrixRows) {
  const queue = actionQueue(matrixRows).slice(0, 12);
  const focusSections = rows
    .map((row) => {
      const focusRows = matrixRows.filter((item) => item.focus_area === row.focus_area);
      const top = topProjects(focusRows, 5);
      return `## ${row.focus_area}

${row.thesis}

- 후보: ${row.candidate_count}개
- 단계 구성: ${row.stage_mix}
- 원문 상태: ${row.text_coverage_mix}
- 병목: ${row.bottlenecks}
- 현장 루트: ${row.fieldwork_route}

### 먼저 볼 사업

${mdTable(top, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업" },
  { key: "current_stage", label: "단계" },
  { key: "readiness_score", label: "준비도" },
  { key: "fact_check_priority", label: "확인 우선" },
  { key: "next_action", label: "다음 작업" },
])}
`;
    })
    .join("\n");

  return `# 생활권별 리서치 전략

작성 기준: ${kstDate()} KST

이 문서는 \`analysis/project-comparison-matrix.csv\`를 생활권 단위로 해석한 작업 노트다. 사업별 확정 수치가 아니라, 어떤 생활권과 사업을 어떤 순서로 검증할지 정하는 운영 문서다.

## 한눈에 보기

${mdTable(rows, [
  { key: "focus_area", label: "생활권" },
  { key: "candidate_count", label: "후보" },
  { key: "stage_mix", label: "단계 구성" },
  { key: "text_coverage_mix", label: "원문 상태" },
  { key: "bottlenecks", label: "병목" },
  { key: "first_action_project", label: "첫 작업" },
])}

## 전체 액션 큐

${mdTable(queue, [
  { key: "rank", label: "순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업" },
  { key: "fact_check_priority", label: "우선도" },
  { key: "next_action", label: "다음 작업" },
])}

${focusSections}

## 운영 원칙

- 강남은 원문 텍스트 커버리지가 높으므로 공공기여, 높이, 용적률, 세대수 후보를 원문 대조로 확정하는 데 우선순위를 둔다.
- 잠실/송파는 관리처분인가 사업과 잠실 MICE/한강축 사업을 분리해 본다. 관리처분 단계는 이주·전세·공사비 리스크를 먼저 본다.
- 구의/광진은 투자 가설보다 공식 매칭 보강이 먼저다. 사업구역 레이어 보강 4건의 고시 recordCode/인가 원문 연결과 OCR 텍스트 원문 대조를 끝내야 비교 신뢰도가 올라간다.
- 모든 시장 판단은 실거래 API 키 수집 전까지 방향성 가설로만 둔다.
`;
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const rows = strategyRows(matrixRows);
  const queueRows = actionQueue(matrixRows).map((row, index) => ({
    queue_rank: index + 1,
    rank: row.rank,
    focus_area: row.focus_area,
    project_name: row.project_name,
    current_stage: row.current_stage,
    fact_check_priority: row.fact_check_priority,
    text_coverage: row.text_coverage,
    next_action: row.next_action,
    project_note: row.project_note,
  }));

  await writeFile(path.join(OUT_DIR, "focus-area-strategy.csv"), toCsv(rows));
  await writeFile(path.join(OUT_DIR, "focus-area-action-queue.csv"), toCsv(queueRows));
  await writeFile(path.join(OUT_DIR, "focus-area-strategy.json"), JSON.stringify(rows, null, 2));
  await writeFile(path.join(OUT_DIR, "focus-area-strategy.md"), markdown(rows, matrixRows));

  console.log(
    JSON.stringify(
      {
        focusAreas: rows.length,
        actionRows: queueRows.length,
        output: "analysis/focus-area-strategy.{md,csv,json}",
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
