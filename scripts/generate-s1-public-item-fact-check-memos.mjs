#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "analysis/s1-cost-infrastructure-workbook.json";
const EVIDENCE_INPUT = "analysis/s1-original-evidence-candidates.json";
const REVIEW_INPUT = "analysis/s1-evidence-review-board.json";
const OUT_DIR = "analysis";
const INDEX_JSON = path.join(OUT_DIR, "s1-public-item-fact-check-memos.json");
const INDEX_CSV = path.join(OUT_DIR, "s1-public-item-fact-check-memos.csv");
const INDEX_MD = path.join(OUT_DIR, "s1-public-item-fact-check-memos.md");

const TARGETS = {
  "8": { slug: "ssang1", label: "대치쌍용1차" },
  "11": { slug: "apgujeong4", label: "압구정4" },
  "14": { slug: "gaepo6_7", label: "개포6,7" },
  "17": { slug: "songpa2", label: "송파한양2차" },
  "30": { slug: "jayangdong", label: "자양4동 A구역" },
};

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

function readRows(input) {
  if (Array.isArray(input)) return input;
  return input?.rows || [];
}

function readJson(file) {
  return readFile(file, "utf8").then((text) => JSON.parse(text));
}

function splitItems(value) {
  return String(value || "")
    .split(" / ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function valueOrUnknown(value) {
  const text = String(value || "").trim();
  return text || "미확인";
}

function compactList(items, limit = 3) {
  return [...new Set(items.filter(Boolean))].slice(0, limit).join("; ");
}

function topItemsMarkdown(row) {
  const items = splitItems(row.top_public_items);
  if (!items.length) return "- 공개항목 요약 미확인";
  return items.map((item) => `- ${item}`).join("\n");
}

function groupedEvidenceMarkdown(rows) {
  if (!rows.length) return "_확보된 원문 증거 후보 없음_";
  return rows
    .map((group) => {
      const lines = group.items
        .slice(0, 3)
        .map((item) => {
          if (String(item.source_path || "").includes("analysis/ocr-image-review-decisions.md")) {
            return `- \`${item.source_path}:${item.source_line || "?"}\` 혼합 OCR 결정표 항목. 이 파일에서 관련 이미지 경로와 수동 판정 메모를 다시 열어 현재 사업 기준으로 재확인한다.`;
          }
          return `- \`${item.source_path}:${item.source_line || "?"}\` ${item.snippet}`;
        })
        .join("\n");
      return `### ${group.category_label}\n\n${lines}`;
    })
    .join("\n\n");
}

function hasForeignProjectName(snippet, currentRank, allProjectNames) {
  const text = String(snippet || "");
  return allProjectNames.some(({ rank, project_name }) => String(rank) !== String(currentRank) && project_name && text.includes(project_name));
}

function reviewSummary(reviewRows) {
  if (!reviewRows.length) {
    return {
      review_status: "review_input_missing",
      next_review_action: "S1 리뷰 보드에 아직 연결되지 않아 워크북과 원문 경로부터 직접 확인",
      categories: "",
    };
  }
  return {
    review_status: compactList(reviewRows.map((row) => row.review_status), 2),
    next_review_action: compactList(reviewRows.map((row) => row.next_review_action), 2),
    categories: compactList(reviewRows.map((row) => row.category_label), 4),
  };
}

function writeMemo(row, meta, evidenceGroups, reviewRows) {
  const topUrls = splitItems(row.top_public_item_urls);
  const itemRows = splitItems(row.top_public_items).map((item, index) => ({
    item,
    url: topUrls[index] || "",
  }));
  const review = reviewSummary(reviewRows);

  return `# ${meta.label} S1 공개항목 원문 점검 메모

작성 기준: ${kstDate()} KST

## 문서 성격

이 문서는 \`analysis/s1-cost-infrastructure-workbook.json\`의 해당 사업장 행을 사람이 바로 읽고 다음 확인 작업으로 이어가기 쉽게 정리한 1차 점검 메모다. 이미 상세 팩트체크 문서가 있는 사업장과 달리, 이 문서는 공개항목 제목·원문 경로·장부 체크 포인트를 한 곳에 모은 시작점이다. 확정 수치 승격 전에는 공식 원문 본문과 첨부를 다시 대조한다.

## 대상

- 사업장: ${row.project_name}
- 현재 단계: ${row.current_stage}
- 우선순위: ${row.priority}
- 공개항목 수 / P0 수: ${row.public_item_count} / ${row.p0_public_item_count}
- 리스크 / 근거등급: ${row.risk_signal_level} / ${row.evidence_grade}
- 사업 메모: \`${row.project_note}\`
- 원문 열기 자료: \`${row.notice_source_to_open}\`

## 현재 점검 상태

| 항목 | 값 |
| --- | --- |
| 리뷰 상태 | ${valueOrUnknown(review.review_status)} |
| 점검 카테고리 | ${valueOrUnknown(review.categories)} |
| 다음 리뷰 액션 | ${valueOrUnknown(review.next_review_action)} |

## 우선 공개 신호

${topItemsMarkdown(row)}

## 공개항목 상세 URL

${mdTable(itemRows, [
  { key: "item", label: "공개항목" },
  { key: "url", label: "상세 URL" },
])}

## 장부 점검 포인트

| 항목 | 값 |
| --- | --- |
| 장부 체크 수 | ${valueOrUnknown(row.ledger_check_count)} |
| 장부 상태 요약 | ${valueOrUnknown(row.ledger_status_summary)} |
| 우선 닫을 필드 | ${valueOrUnknown(row.ledger_fields_to_close)} |
| 추천 순서 | ${valueOrUnknown(row.recommended_execution_order)} |
| 완료 체크 | ${valueOrUnknown(row.completion_check)} |

## 카테고리별 원문 증거 후보

${groupedEvidenceMarkdown(evidenceGroups)}

## 원문 대조 해석 메모

- 이 사업장은 현재 \`${row.notice_source_to_open}\` 경로를 먼저 열어 공개항목 제목과 고시/요약 텍스트가 같은 문맥을 가리키는지 확인한다.
- 비용·분담금·기반시설·공공기여 수치는 \`${row.ledger_fields_to_close}\` 범위 안에서만 검토하고, 직접 본문 또는 첨부가 없으면 비교표 확정값으로 올리지 않는다.
- 공개항목 제목만으로는 최종 단계나 확정 사업비를 단정하지 않는다. 조합설립·사업시행·관리처분 등 현재 단계에 맞는 공개 가능 범위인지 먼저 구분한다.

## 사용 제한

- 이 문서는 자동 추출된 시작 문서이므로, 위 스니펫은 공식 원문 대조의 출발점으로만 쓴다.
- 장부 상태가 \`structured_value_needs_manual_confirmation\`, \`snippet_candidate_needs_manual_confirmation\`, \`value_missing\`, \`ocr_partial_confirmation_pending\`이면 확정값 승격 전 수동 대조가 필요하다.
- 개별 사업의 관리처분 공사비·최종 분담금·확정 사업비는 현재 단계와 공개 경로가 맞을 때만 별도로 승격한다.

## 다음 반영 위치

- \`${row.project_note}\`
- \`analysis/research-next-moves.md\`
- \`analysis/strategic-research-brief.md\`
- 필요 시 \`analysis/s1-evidence-review-board.md\`
`;
}

function markdown(rows) {
  return `# S1 공개항목 점검 메모 인덱스

작성 기준: ${kstDate()} KST

이 문서는 비용·기반시설 대조 트랙 중 아직 상세 팩트체크 문서가 없던 사업장에 대해, S1 워크북 기반 1차 점검 메모를 만든 결과다.

${mdTable(rows, [
  { key: "rank", label: "순위" },
  { key: "project_name", label: "사업장" },
  { key: "priority", label: "우선순위" },
  { key: "public_item_count", label: "공개항목 수" },
  { key: "p0_public_item_count", label: "P0 수" },
  { key: "memo_path", label: "메모 경로" },
  { key: "notice_source_to_open", label: "먼저 열 원문" },
])}
`;
}

async function main() {
  const [input, evidenceInput, reviewInput] = await Promise.all([
    readJson(INPUT),
    readJson(EVIDENCE_INPUT),
    readJson(REVIEW_INPUT),
  ]);
  const workbookRows = readRows(input);
  const evidenceRows = readRows(evidenceInput);
  const reviewRows = readRows(reviewInput);
  const rows = workbookRows
    .filter((row) => TARGETS[String(row.rank || "")])
    .map((row) => {
      const meta = TARGETS[String(row.rank)];
      const memoPath = path.join(OUT_DIR, `${meta.slug}-s1-public-item-fact-check.md`);
      return {
        ...row,
        memo_path: memoPath,
        memo_label: meta.label,
      };
    })
    .sort((a, b) => Number(a.rank) - Number(b.rank));

  await mkdir(OUT_DIR, { recursive: true });

  for (const row of rows) {
    const meta = TARGETS[String(row.rank)];
    const groupedEvidence = evidenceRows
      .filter((item) => String(item.rank || "") === String(row.rank))
      .filter((item) => !hasForeignProjectName(item.snippet, row.rank, workbookRows))
      .reduce((acc, item) => {
        const key = item.category_label || item.category || "기타";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    const evidenceGroups = Object.entries(groupedEvidence)
      .map(([category_label, items]) => ({
        category_label,
        items: items
          .slice()
          .sort((a, b) => Number(a.candidate_rank || 9999) - Number(b.candidate_rank || 9999)),
      }))
      .sort((a, b) => a.category_label.localeCompare(b.category_label));
    const rowReviewRows = reviewRows
      .filter((item) => String(item.rank || "") === String(row.rank))
      .sort((a, b) => Number(a.review_rank || 9999) - Number(b.review_rank || 9999));
    await writeFile(row.memo_path, writeMemo(row, meta, evidenceGroups, rowReviewRows), "utf8");
  }

  const indexRows = rows.map((row) => ({
    rank: row.rank,
    project_name: row.project_name,
    priority: row.priority,
    public_item_count: row.public_item_count,
    p0_public_item_count: row.p0_public_item_count,
    memo_path: row.memo_path,
    notice_source_to_open: row.notice_source_to_open,
  }));

  await writeFile(INDEX_JSON, `${JSON.stringify({ generated_at: kstDate(), rows: indexRows }, null, 2)}\n`, "utf8");
  await writeFile(INDEX_CSV, toCsv(indexRows), "utf8");
  await writeFile(INDEX_MD, markdown(indexRows), "utf8");

  console.log(
    JSON.stringify({
      rows: indexRows.length,
      output: [
        "analysis/s1-public-item-fact-check-memos.{md,csv,json}",
        ...indexRows.map((row) => row.memo_path),
      ],
    }, null, 2),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
