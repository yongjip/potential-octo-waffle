#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const BOARD_INPUT = "data/cleanup/cleanup-board-latest-priority-candidates.json";
const OUT_JSON = "analysis/cleanup-board-review-queue.json";
const OUT_CSV = "analysis/cleanup-board-review-queue.csv";
const OUT_MD = "analysis/cleanup-board-review-queue.md";
const REFERENCE_DATE = "2026-06-23";

const SIGNAL_RULES = [
  {
    tag: "cost_pressure",
    group: "비용·분담금",
    weight: 28,
    patterns: ["분담금", "사업비", "공사비", "공사원가", "추정분담금", "부담금"],
    why: "조합원 부담, 사업성, 지연 리스크를 직접 흔드는 신호",
    action: "사업별 메모의 공사비·분담금 리스크와 관리처분/사업시행 수치 대조",
  },
  {
    tag: "planning_notice",
    group: "인가·고시",
    weight: 27,
    patterns: ["정비계획", "정비구역", "구역 지정", "구역지정", "지구단위", "고시", "정정"],
    why: "법정 계획과 구역 조건이 바뀌는 1차 신호",
    action: "서울도시공간포털/서울시보/자치구 고시 원문과 제목·고시일을 대조",
  },
  {
    tag: "infrastructure",
    group: "기반시설",
    weight: 24,
    patterns: ["기반시설", "도로", "공원", "지하차도", "보행교", "환기구", "통신구", "전력", "공공청사", "국공유지", "저류", "방류", "공공디자인"],
    why: "공공기여, 설계 난이도, 인허가 일정, 장기 입지 개선을 동시에 보여주는 신호",
    action: "교통입지 컨텍스트와 공공기여/기반시설 원문 수치를 함께 확인",
  },
  {
    tag: "execution_procurement",
    group: "시공·용역",
    weight: 22,
    patterns: ["시공자", "건설사업관리", "CM", "설계업체", "용역업체", "업체 선정", "입찰", "재입찰"],
    why: "사업이 실무 집행 단계로 움직이는 신호이며 비용 변동과 연결됨",
    action: "입찰 목적, 마감일, 반복 공고 여부를 보고 일정·비용 리스크를 기록",
  },
  {
    tag: "preconstruction",
    group: "이주·착공 전",
    weight: 20,
    patterns: ["이주", "명도", "철거", "석면", "범죄예방", "수목", "벌목", "착공"],
    why: "착공 전 준비와 현장 전환 가능성을 보여주는 신호",
    action: "관리처분 이후 이주·철거·착공 일정과 현장 리스크를 분리해 기록",
  },
  {
    tag: "design_review",
    group: "설계·심의",
    weight: 16,
    patterns: ["설계", "심의", "BF", "장애물없는", "재해영향", "환경영향", "교통영향", "감정평가"],
    why: "계획 변경, 심의 보완, 인허가 지연 가능성을 보여주는 신호",
    action: "고시 원문 및 심의/결재문서 검색 키워드에 추가",
  },
  {
    tag: "governance",
    group: "총회·협의체",
    weight: 12,
    patterns: ["총회", "대의원회", "주민협의체", "주민설명회", "설명회", "소위원회", "동의서"],
    why: "조합 의사결정과 동의율, 주민 수용성의 변화를 보여주는 신호",
    action: "회의/총회 결과가 단계 변경이나 계획 변경으로 이어졌는지 후속 공고 확인",
  },
  {
    tag: "finance_admin",
    group: "재무·행정",
    weight: 10,
    patterns: ["세무", "회계", "HUG", "보증", "융자", "자금수지", "정관"],
    why: "사업비 조달, 운영 투명성, 재무관리 리스크를 보조적으로 보여주는 신호",
    action: "분담금/사업비 자료와 같이 보되 단독 신호로 과대해석하지 않음",
  },
  {
    tag: "low_signal_admin",
    group: "일반 행정",
    weight: 3,
    patterns: ["직원", "채용", "홍보", "교육", "아카데미", "가입 안내"],
    why: "운영 활동 신호이나 개발 조건 변화와의 직접성은 낮음",
    action: "총회·시공자 선정 등 다른 신호와 결합될 때만 검토",
  },
];

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "queue_rank",
    "review_priority",
    "signal_score",
    "signal_group",
    "signal_tags",
    "focus_area",
    "rank",
    "project_name",
    "board_label",
    "item_date",
    "days_old",
    "title",
    "why_it_matters",
    "recommended_action",
    "detail_url",
    "board_url",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function normalizeDate(value) {
  const text = String(value ?? "");
  const match = text.match(/(20\d{2})[.-](\d{1,2})[.-](\d{1,2})/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function daysBetween(dateText) {
  const normalized = normalizeDate(dateText);
  if (!normalized) return "";
  const base = Date.parse(`${REFERENCE_DATE}T00:00:00Z`);
  const then = Date.parse(`${normalized}T00:00:00Z`);
  if (!Number.isFinite(base) || !Number.isFinite(then)) return "";
  return Math.round((base - then) / 86400000);
}

function recencyScore(daysOld) {
  if (daysOld === "" || daysOld < 0) return 0;
  if (daysOld <= 30) return 30;
  if (daysOld <= 90) return 18;
  if (daysOld <= 180) return 10;
  if (daysOld <= 365) return 5;
  return 0;
}

function boardScore(row) {
  if (row.board_type === "bid") return 18;
  if (row.board_type === "cost_share") return 20;
  if (row.board_type === "notice") return 10;
  return 6;
}

function priorityRankScore(rank) {
  const value = Number(rank);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, 31 - value) / 2;
}

function matchSignals(title) {
  const text = String(title ?? "").toLowerCase();
  return SIGNAL_RULES.filter((rule) => rule.patterns.some((pattern) => text.includes(pattern.toLowerCase())));
}

function classifyPriority(score) {
  if (score >= 70) return "P0";
  if (score >= 55) return "P1";
  if (score >= 40) return "P2";
  return "P3";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function classifyRow(row) {
  const itemDate = normalizeDate(row.notice_date) || normalizeDate(row.registered_date);
  const daysOld = daysBetween(itemDate);
  const signals = matchSignals(row.title);
  const signalWeight = signals.reduce((sum, rule) => sum + rule.weight, 0);
  const score = Math.round(signalWeight + boardScore(row) + recencyScore(daysOld) + priorityRankScore(row.rank));
  return {
    signal_score: score,
    review_priority: classifyPriority(score),
    signal_group: unique(signals.map((rule) => rule.group)).join("; ") || "기타",
    signal_tags: unique(signals.map((rule) => rule.tag)).join("; ") || "uncategorized",
    why_it_matters: unique(signals.map((rule) => rule.why)).join("; ") || "공개 항목이지만 개발 조건 변화와의 직접 신호는 낮음",
    recommended_action: unique(signals.map((rule) => rule.action)).join("; ") || "다른 단계 변경 신호와 결합될 때 확인",
    item_date: itemDate,
    days_old: daysOld,
  };
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      acc[row[field] || ""] = (acc[row[field] || ""] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function markdown(rows) {
  const p0 = rows.filter((row) => row.review_priority === "P0");
  const p1 = rows.filter((row) => row.review_priority === "P1");
  const byFocus = countBy(rows, "focus_area");
  const byGroup = countBy(rows, "signal_group").sort((a, b) => b.count - a.count);
  const topRows = rows.slice(0, 50);
  return `# 정보몽땅 공개 항목 검토 큐

작성 기준: ${new Date().toISOString()}

이 문서는 우선검토 후보 30개의 정보몽땅 게시판 최신 항목을 제목 기반으로 분류해, 공사비·분담금·기반시설·인가/고시·시공/용역 같은 실질 신호를 먼저 읽기 위한 작업 큐다.

## 요약

| 항목 | 값 |
| --- | --- |
| 검토 대상 공개 항목 | ${rows.length} |
| P0 즉시 검토 | ${p0.length} |
| P1 우선 검토 | ${p1.length} |
| 기준일 | ${REFERENCE_DATE} |

## 생활권별 큐

${mdTable(byFocus, [
  { key: "name", label: "생활권" },
  { key: "count", label: "항목 수" },
])}

## 신호 그룹별 큐

${mdTable(byGroup, [
  { key: "name", label: "신호 그룹" },
  { key: "count", label: "항목 수" },
])}

## 우선 검토 항목

${mdTable(topRows, [
  { key: "queue_rank", label: "큐" },
  { key: "review_priority", label: "우선" },
  { key: "signal_score", label: "점수" },
  { key: "focus_area", label: "생활권" },
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "signal_group", label: "신호" },
  { key: "board_label", label: "게시판" },
  { key: "item_date", label: "일자" },
  { key: "title", label: "제목" },
  { key: "recommended_action", label: "다음 확인" },
])}

## 운영 규칙

1. P0/P1 항목은 사업별 메모에 반영할지 먼저 판단한다.
2. 비용·분담금, 기반시설, 인가·고시는 고시 원문과 비교 매트릭스 수치 대조로 연결한다.
3. 조합입찰공고는 같은 항목의 반복 공고, 재입찰, 마감일을 함께 본다.
4. 일반 채용·홍보 항목은 총회, 시공자 선정, 이주 같은 신호와 연결될 때만 우선순위를 올린다.
`;
}

async function main() {
  const boardRows = JSON.parse(await readFile(BOARD_INPUT, "utf8"));
  const rows = boardRows
    .filter((row) => row.fetch_status === "ok" && row.title)
    .map((row) => ({
      focus_area: row.focus_area,
      rank: row.rank,
      project_name: row.project_name,
      board_label: row.board_label,
      board_type: row.board_type,
      title: row.title,
      detail_url: row.detail_url,
      board_url: row.board_url,
      ...classifyRow(row),
    }))
    .sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return (
        (priorityOrder[a.review_priority] ?? 9) - (priorityOrder[b.review_priority] ?? 9) ||
        b.signal_score - a.signal_score ||
        String(b.item_date).localeCompare(String(a.item_date)) ||
        Number(a.rank) - Number(b.rank)
      );
    })
    .map((row, index) => ({ queue_rank: index + 1, ...row }));

  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        p0: rows.filter((row) => row.review_priority === "P0").length,
        p1: rows.filter((row) => row.review_priority === "P1").length,
        output: "analysis/cleanup-board-review-queue.{md,csv,json}",
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
