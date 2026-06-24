#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { FOCUS_PROJECT_PAIRS } from "./lib/focus-project-pairs.mjs";

const OUT_DIR = "analysis";
const REVIEW_DIR = "data/review";
const OUT_MD = path.join(OUT_DIR, "focus-project-pair-comparison-board.md");
const OUT_CSV = path.join(OUT_DIR, "focus-project-pair-comparison-board.csv");
const OUT_JSON = path.join(OUT_DIR, "focus-project-pair-comparison-board.json");
const OUT_README = path.join(REVIEW_DIR, "focus-project-pair-comparisons.README.md");
const OUT_EXAMPLES = path.join(REVIEW_DIR, "focus-project-pair-comparison-examples.json");

const OBSERVATIONS_INPUT = "data/review/fieldwork-observations.json";
const PAIR_INPUT = "data/review/focus-project-pair-comparisons.json";

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

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== null) return fallback;
    throw error;
  }
}

function compact(value, limit = 120) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

function byRankMulti(rows) {
  return rows.reduce((acc, row) => {
    const key = String(row.rank || "");
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function byPairIdMulti(rows) {
  return rows.reduce((acc, row) => {
    const key = String(row.pair_id || "");
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function latestDate(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value)))]
    .sort((a, b) => b.localeCompare(a))[0] || "";
}

function latestRowByDate(rows, visitedAt) {
  const matched = rows.filter((row) => String(row.visited_at || "") === String(visitedAt || ""));
  return matched[matched.length - 1] || {};
}

function latestRow(rows) {
  return [...rows].sort((a, b) => String(b.visited_at || "").localeCompare(String(a.visited_at || "")))[0] || {};
}

function buildPairRows(observationRows, pairRows) {
  const observationsByRank = byRankMulti(observationRows);
  const pairRowsById = byPairIdMulti(pairRows);

  return FOCUS_PROJECT_PAIRS.map((pair) => {
    const obsA = observationsByRank[pair.rank_a] || [];
    const obsB = observationsByRank[pair.rank_b] || [];
    const sameDates = [...new Set(obsA.map((row) => row.visited_at).filter(Boolean))].filter((date) =>
      obsB.some((row) => String(row.visited_at || "") === String(date)),
    );
    const latestSameDay = latestDate(sameDates);
    const latestA = latestSameDay ? latestRowByDate(obsA, latestSameDay) : latestRow(obsA);
    const latestB = latestSameDay ? latestRowByDate(obsB, latestSameDay) : latestRow(obsB);
    const comparisonRows = pairRowsById[pair.pair_id] || [];
    const latestComparison =
      (latestSameDay && [...comparisonRows].reverse().find((row) => String(row.visited_at || "") === latestSameDay)) ||
      latestRow(comparisonRows);

    let comparisonStatus = "not_started";
    if (latestComparison?.comparison_status) comparisonStatus = latestComparison.comparison_status;
    else if (latestSameDay) comparisonStatus = "ready_to_compare";
    else if (obsA.length || obsB.length) comparisonStatus = "await_second_observation";

    let nextAction = "두 사업 모두 아직 현장 입력 전";
    if (comparisonStatus === "ready_to_compare") {
      nextAction = `node scripts/record-focus-project-pair-comparison.mjs --pair-id=${pair.pair_id} --visited-at=${latestSameDay} --status=draft ...`;
    } else if (comparisonStatus === "await_second_observation") {
      nextAction = `${obsA.length ? pair.short_b : pair.short_a} 현장 입력 추가`;
    } else if (comparisonStatus === "draft" || comparisonStatus === "reviewed") {
      nextAction = latestComparison.follow_up_action || pair.default_follow_up_action;
    } else if (comparisonStatus === "applied") {
      nextAction = "생활권 판단 문서 반영 여부만 점검";
    }

    return {
      pair_id: pair.pair_id,
      pair_name: pair.pair_name,
      lane: pair.lane,
      life_area: pair.life_area,
      rank_a: pair.rank_a,
      rank_b: pair.rank_b,
      latest_same_day: latestSameDay,
      comparison_status: comparisonStatus,
      pair_question: pair.pair_question,
      observed_signal_a: compact(latestA.observed_signal || ""),
      observed_signal_b: compact(latestB.observed_signal || ""),
      interpretation_a: compact(latestA.interpretation || ""),
      interpretation_b: compact(latestB.interpretation || ""),
      judgment_shift: compact(latestComparison.judgment_shift || ""),
      not_closed_reason: compact(latestComparison.not_closed_reason || ""),
      follow_up_action: latestComparison.follow_up_action || pair.default_follow_up_action,
      next_action: nextAction,
    };
  });
}

function buildRecordedRows(pairRows) {
  return [...pairRows]
    .sort((a, b) => `${b.visited_at || ""}:${b.pair_id || ""}`.localeCompare(`${a.visited_at || ""}:${a.pair_id || ""}`))
    .map((row) => ({
      pair_id: row.pair_id || "",
      pair_name: row.pair_name || "",
      visited_at: row.visited_at || "",
      comparison_status: row.comparison_status || "",
      risk_heavier_side: compact(row.risk_heavier_side || ""),
      stronger_edge: compact(row.stronger_edge || ""),
      judgment_shift: compact(row.judgment_shift || ""),
      not_closed_reason: compact(row.not_closed_reason || ""),
      follow_up_action: row.follow_up_action || "",
    }));
}

function summary(pairRows, recordedRows) {
  return {
    generated_at: `${kstDate()} KST`,
    pair_count: pairRows.length,
    ready_to_compare_count: pairRows.filter((row) => row.comparison_status === "ready_to_compare").length,
    await_second_observation_count: pairRows.filter((row) => row.comparison_status === "await_second_observation").length,
    recorded_comparison_count: recordedRows.length,
    applied_count: recordedRows.filter((row) => row.comparison_status === "applied").length,
    inputs: [OBSERVATIONS_INPUT, PAIR_INPUT],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON, OUT_README, OUT_EXAMPLES],
  };
}

function exampleRows() {
  return FOCUS_PROJECT_PAIRS.map((pair) => ({
    pair_id: pair.pair_id,
    pair_name: pair.pair_name,
    visited_at: "YYYY-MM-DD",
    rank_a: pair.rank_a,
    rank_b: pair.rank_b,
    comparison_status: "draft|reviewed|applied",
    same_day_route: pair.same_day_route,
    official_state_delta: "예: 잠실우성4차는 관리처분 공사비 회신 대기, 장미1,2,3차는 recordCode 미연결",
    fieldwork_delta: "예: 한쪽은 환승 혼잡이 컸고 다른 한쪽은 한강 접근 체감이 더 좋았음",
    risk_heavier_side: `${pair.short_a || "사업A"}::무거웠던 리스크`,
    stronger_edge: `${pair.short_b || "사업B"}::강하게 남은 장점`,
    judgment_shift: "예: 기존 단계 프리미엄 가설은 유지하되 보행 단절 리스크를 더 크게 본다.",
    not_closed_reason: "예: 비용·기반시설 원문 또는 외부 회신이 아직 닫히지 않음",
    follow_up_action: pair.default_follow_up_action,
    memo_path: "analysis/focus-project-pair-comparison-starter.md",
    notes: "생활권 판단 문장 수정 전의 짧은 비교 메모",
  }));
}

function markdown(summaryRow, pairRows, recordedRows) {
  return `# 핵심 사업 쌍 비교 보드

작성 기준: ${summaryRow.generated_at}

이 문서는 같은 날 두 사업장을 본 뒤 비교 메모를 남길 준비가 되었는지, 이미 기록된 비교 메모가 무엇인지 한 화면에서 확인하는 보드다. \`fieldwork-observations\`가 사실 기록이라면, 이 보드는 \`같은 날 두 사업을 어떻게 다르게 읽었는가\`를 추적한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 비교 조합 | ${summaryRow.pair_count} |
| 바로 비교 가능 | ${summaryRow.ready_to_compare_count} |
| 한쪽 관찰만 있음 | ${summaryRow.await_second_observation_count} |
| 기록된 비교 메모 | ${summaryRow.recorded_comparison_count} |
| 생활권 판단 반영 완료 | ${summaryRow.applied_count} |

## 같은 날 비교 준비 상태

${mdTable(pairRows, [
    { key: "pair_name", label: "조합" },
    { key: "comparison_status", label: "상태" },
    { key: "latest_same_day", label: "같은 날 관찰" },
    { key: "pair_question", label: "핵심 질문" },
    { key: "judgment_shift", label: "기록된 판단 변화" },
    { key: "next_action", label: "다음 행동" },
  ])}

## 최근 관찰 차이

${mdTable(pairRows, [
    { key: "pair_name", label: "조합" },
    { key: "observed_signal_a", label: "A 관찰 신호" },
    { key: "observed_signal_b", label: "B 관찰 신호" },
    { key: "interpretation_a", label: "A 해석" },
    { key: "interpretation_b", label: "B 해석" },
  ])}

## 기록된 비교 메모

${mdTable(recordedRows, [
    { key: "visited_at", label: "비교일" },
    { key: "pair_name", label: "조합" },
    { key: "comparison_status", label: "상태" },
    { key: "risk_heavier_side", label: "더 무거운 리스크" },
    { key: "stronger_edge", label: "더 강한 장점" },
    { key: "judgment_shift", label: "판단 변화" },
    { key: "not_closed_reason", label: "아직 못 닫는 이유" },
  ])}

## 기록 규칙

- 같은 날 두 사업 모두 \`fieldwork-observations.json\`에 들어가 있어야 pair-comparison 기록을 남긴다.
- \`draft\`는 비교 메모를 막 적은 상태, \`reviewed\`는 생활권 판단 문장 수정 전 검토 상태, \`applied\`는 생활권 판단 문서 반영까지 끝낸 상태다.
- 비교 메모는 \`누가 더 좋다\`보다 \`어느 리스크가 실제로 더 무거웠는가\`를 먼저 적는다.
- 비교 메모를 쓴 뒤에는 [analysis/life-area-comparison-worksheet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-comparison-worksheet.md)와 [analysis/focus-area-decision-memo.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-area-decision-memo.md)를 같이 본다.
`;
}

function readme(summaryRow) {
  return `# Focus Project Pair Comparisons Intake

작성 기준: ${summaryRow.generated_at}

\`data/review/focus-project-pair-comparisons.json\`은 같은 날 두 핵심 사업장을 보고 남긴 비교 메모를 누적하는 수동 입력 파일이다. 관찰 사실은 \`fieldwork-observations.json\`에 남기고, 여기에는 \`판단 변화\`, \`더 무거운 리스크\`, \`아직 못 닫는 이유\`를 적는다. 생성 스크립트는 실제 intake JSON을 덮어쓰지 않고 읽기만 한다.

## 관련 산출물

- \`analysis/focus-project-pair-comparison-board.md\`: 같은 날 비교 준비 상태와 기록된 비교 메모를 확인하는 보드
- \`analysis/focus-project-pair-comparison-starter.md\`: 답사 직후 바로 복붙하는 짧은 메모 스타터
- \`data/review/focus-project-pair-comparison-examples.json\`: 복사용 예시 행

## 입력 절차

1. 먼저 \`data/review/fieldwork-observations.json\`에 같은 날 두 사업 관찰을 기록한다.
2. \`data/review/focus-project-pair-comparison-examples.json\`에서 가장 가까운 조합을 복사하거나 \`node scripts/record-focus-project-pair-comparison.mjs --help\`를 본다.
3. 가능하면 \`node scripts/record-focus-project-pair-comparison.mjs --pair-id=songpa-09-05 --visited-at=YYYY-MM-DD --status=draft --fieldwork-delta='...' --judgment-shift='...' --not-closed-reason='...' --write --refresh\`로 기록한다.
4. 수동 편집을 썼다면 \`comparison_status\`, \`fieldwork_delta\`, \`judgment_shift\`, \`not_closed_reason\`을 실제 값으로 바꾼다.
5. \`node scripts/generate-focus-project-pair-comparison-board.mjs\`를 실행해 보드를 갱신하고, 이후 \`analysis/life-area-comparison-worksheet.md\`, \`analysis/focus-area-decision-memo.md\`에 반영한다.

## 허용 상태값

- \`draft\`
- \`reviewed\`
- \`applied\`

## 운영 규칙

- 같은 날 비교 메모는 공식 원문을 대체하지 않는다.
- 현장 인상만으로 사업 단계나 수치를 바꾸지 않는다.
- 비교 메모가 \`applied\`가 되기 전에는 생활권 결론이 바뀌었다고 간주하지 않는다.
`;
}

async function main() {
  const observationRows = await readJson(OBSERVATIONS_INPUT, []);
  const pairIntakeRows = await readJson(PAIR_INPUT, []);

  const pairRows = buildPairRows(observationRows, pairIntakeRows);
  const recordedRows = buildRecordedRows(pairIntakeRows);
  const summaryRow = summary(pairRows, recordedRows);
  const payload = { summary: summaryRow, pairRows, recordedRows };

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(recordedRows));
  await writeFile(OUT_MD, markdown(summaryRow, pairRows, recordedRows));
  await writeFile(OUT_README, readme(summaryRow));
  await writeFile(OUT_EXAMPLES, `${JSON.stringify(exampleRows(), null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        ready: summaryRow.ready_to_compare_count,
        recorded: summaryRow.recorded_comparison_count,
        output: "analysis/focus-project-pair-comparison-board.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
