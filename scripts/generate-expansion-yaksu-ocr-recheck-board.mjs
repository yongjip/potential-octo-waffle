#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  reviewSeeds: "data/research/expansion-urban-notice-review-seeds.json",
};

const OUT_MD = "analysis/expansion-yaksu-ocr-recheck-board.md";
const OUT_JSON = "analysis/expansion-yaksu-ocr-recheck-board.json";
const OUT_CSV = "analysis/expansion-yaksu-ocr-recheck-board.csv";

const RECHECK_ROWS = [
  {
    shortlist_id: "exp-short-ys-sindang8",
    project_name: "신당 제8구역 주택재개발정비사업",
    decisive_pages: "page-05, page-06, page-07",
    confirmation_basis: "가구·횡지/용적률/임대주택 계획표를 원문 이미지 기준으로 재대조",
    confirmed_snapshot: "정비구역 58,651.3㎡, 택지(공동주택) 45,184.0㎡, 정비계획 용적률 248.64%, 공공청사 1,306㎡, 총 기부채납 10.81%, 총 1,215세대/임대 183세대",
    rejected_or_reframed: "환경관리계획 OCR 서술부의 '개발밀도 및 세대수 712'는 정식 표와 충돌해 폐기",
    downstream_change: "약수권 비교값을 confirmed로 승격하고 세대수는 712 대신 1,215/183 구조를 사용",
    evidence_paths: [
      "data/urban/text/ocr/images/exp-short-ys-sindang8-11140NTC202302130001-exp-short-ys-sindang8-11140NTC202302130001-notice_file-중구_2023-6호_고시/page-05.png",
      "data/urban/text/ocr/images/exp-short-ys-sindang8-11140NTC202302130001-exp-short-ys-sindang8-11140NTC202302130001-notice_file-중구_2023-6호_고시/page-06.png",
      "data/urban/text/ocr/images/exp-short-ys-sindang8-11140NTC202302130001-exp-short-ys-sindang8-11140NTC202302130001-notice_file-중구_2023-6호_고시/page-07.png",
    ],
  },
  {
    shortlist_id: "exp-short-ys-sindang9",
    project_name: "신당 제9주택재개발정비구역",
    decisive_pages: "page-06, page-07",
    confirmation_basis: "건축시설계획/용적률 계획/시행계획 표를 원문 이미지 기준으로 재대조",
    confirmed_snapshot: "정비구역 18,651㎡, 획지1 17,559㎡, 건폐율 60% 이하, 정비계획 상한용적률 182%, 7층/28m 이하, 주택공급 334세대, 공공시설 환산부지면적 967.39㎡",
    rejected_or_reframed: "기정 181%는 변경 비교값이 아니라 이전 값이므로 별도 보관",
    downstream_change: "약수권 저층 고도제한 비교축을 confirmed로 승격",
    evidence_paths: [
      "data/urban/text/ocr/images/exp-short-ys-sindang9-11140NTC202109170002-exp-short-ys-sindang9-11140NTC202109170002-notice_file-중구_2021-102호_고시/page-06.png",
      "data/urban/text/ocr/images/exp-short-ys-sindang9-11140NTC202109170002-exp-short-ys-sindang9-11140NTC202109170002-notice_file-중구_2021-102호_고시/page-07.png",
    ],
  },
  {
    shortlist_id: "exp-short-ys-geumho14-1",
    project_name: "금호 제14-1 주택재개발 정비사업",
    decisive_pages: "page-05, page-06",
    confirmation_basis: "개발가능용적률 산정표와 건축시설계획 표를 원문 이미지 기준으로 재대조",
    confirmed_snapshot: "연면적 15,500㎡, 구역면적 5,144.70㎡, 택지 4,043.60㎡, 건폐율 28%, 개발가능용적률 238.67% 이하(설계 232.25%), 최고 16층 이하, 주택공급 108세대, 공공시설부지 제공 424.7㎡",
    rejected_or_reframed: "15,500㎡는 구역면적이 아니라 연면적이라는 점을 명시적으로 정정",
    downstream_change: "소형 재개발 비교값을 confirmed로 승격하고 면적 라벨 혼선을 제거",
    evidence_paths: [
      "data/urban/text/ocr/images/exp-short-ys-geumho14-1-11200NTC202302270005-exp-short-ys-geumho14-1-11200NTC202302270005-notice_file-성동구_2023-13호_고시/page-05.png",
      "data/urban/text/ocr/images/exp-short-ys-geumho14-1-11200NTC202302270005-exp-short-ys-geumho14-1-11200NTC202302270005-notice_file-성동구_2023-13호_고시/page-06.png",
    ],
  },
];

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function main() {
  const reviewSeeds = await readJson(INPUTS.reviewSeeds);
  const seedById = new Map(reviewSeeds.map((row) => [row.shortlist_id, row]));

  const rows = RECHECK_ROWS.map((row) => {
    const seed = seedById.get(row.shortlist_id) || {};
    return {
      shortlist_id: row.shortlist_id,
      zone_name: "약수동 주변",
      project_name: row.project_name,
      stage_signal: seed.stage_signal || "",
      verification_state: seed.verification_state || "",
      decisive_pages: row.decisive_pages,
      confirmation_basis: row.confirmation_basis,
      confirmed_snapshot: row.confirmed_snapshot,
      rejected_or_reframed: row.rejected_or_reframed,
      downstream_change: row.downstream_change,
      evidence_paths: row.evidence_paths.join(" ; "),
    };
  });

  const summary = {
    generated_at: `${kstDate()} KST`,
    row_count: rows.length,
    confirmed_snapshot_count: rows.filter((row) => row.verification_state === "confirmed_snapshot").length,
    remaining_pending_count: rows.filter((row) => row.verification_state !== "confirmed_snapshot").length,
    conflict_resolved_count: rows.filter((row) => row.rejected_or_reframed).length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };

  const md = `# 약수권 OCR 재대조 보드

작성 기준: ${summary.generated_at}

이 문서는 약수동 주변 3건의 OCR 잠정값을 원문 이미지 기준으로 다시 읽어, 실제 비교값으로 승격할 수 있는지 닫는 보드다.

## 요약

- 대상 행: ${summary.row_count}
- confirmed 승격: ${summary.confirmed_snapshot_count}
- 남은 pending: ${summary.remaining_pending_count}
- 충돌/정정 기록: ${summary.conflict_resolved_count}

## 재대조 결과

${mdTable(rows, [
    { key: "project_name", label: "사업" },
    { key: "stage_signal", label: "공식 신호" },
    { key: "verification_state", label: "최종 상태" },
    { key: "decisive_pages", label: "결정적 페이지" },
    { key: "confirmed_snapshot", label: "확정 비교값" },
    { key: "rejected_or_reframed", label: "버리거나 정정한 값" },
    { key: "downstream_change", label: "반영 결과" },
  ])}

## 판정 원칙

1. OCR 서술 문장보다 표·조서의 정식 수치를 우선 채택한다.
2. 기정값과 변경값이 함께 있으면 생활권 비교에는 변경값만 올린다.
3. 라벨이 불명확했던 수치는 구역면적, 택지면적, 연면적을 분리해 다시 기록한다.
`;

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(JSON.stringify({ rows: rows.length, confirmed: summary.confirmed_snapshot_count, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
