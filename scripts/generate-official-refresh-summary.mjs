#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "official-refresh-summary.json");
const OUT_CSV = path.join(OUT_DIR, "official-refresh-summary.csv");
const OUT_MD = path.join(OUT_DIR, "official-refresh-summary.md");

const INPUTS = {
  cleanupDiff: "analysis/cleanup-snapshot-diff.json",
  cleanupCurrent: "data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json",
  cleanupBoard: "data/cleanup/cleanup-board-latest-priority-candidates.json",
  urbanMap: "data/urban/urban-map-details-priority-candidates.json",
  urbanNotice: "data/urban/urban-notice-details-priority-candidates.json",
  urbanNoticeAttachments: "data/urban/urban-notice-attachments-priority-candidates.csv",
  districtNotice: "data/urban/gangnam-songpa-notice-candidates.json",
  districtNoticeAttachments: "data/urban/gangnam-songpa-notice-attachments.csv",
};

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "queue_type",
    "priority_rank",
    "focus_area",
    "district",
    "project_name",
    "signal",
    "detail",
    "signal_date",
    "source",
    "recommended_action",
    "url",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...dataRows] = rows;
  if (!headers) return [];
  return dataRows
    .filter((dataRow) => dataRow.some((value) => value !== ""))
    .map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""])));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(file) {
  try {
    return parseCsv(await readFile(file, "utf8"));
  } catch {
    return [];
  }
}

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function latestDate(row) {
  return row.registered_date || row.notice_date || row.deadline || "";
}

function byDateDesc(a, b) {
  const at = Date.parse(latestDate(a));
  const bt = Date.parse(latestDate(b));
  if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return bt - at;
  return String(b.item_id ?? "").localeCompare(String(a.item_id ?? ""));
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows) {
    const key = row[field] || "blank";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function firstNonEmpty(rows, field) {
  return rows.find((row) => row[field])?.[field] ?? "";
}

function projectKey(row) {
  return row.cafe_id || `${row.district}|${row.project_name}`;
}

function buildBoardSignals(changes, boardRows) {
  const changedKeys = new Set(changes.map(projectKey).filter(Boolean));
  const grouped = new Map();
  for (const row of boardRows) {
    const key = projectKey(row);
    if (!changedKeys.has(key) || !row.title) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  const signals = [];
  for (const rows of grouped.values()) {
    rows.sort(byDateDesc);
    for (const row of rows.slice(0, 3)) {
      signals.push({
        queue_type: "changed_project_latest_board_item",
        priority_rank: row.rank ?? "",
        focus_area: row.focus_area ?? "",
        district: row.district ?? "",
        project_name: row.project_name ?? "",
        signal: row.board_label || row.board_type || "정보몽땅 공개항목",
        detail: row.title ?? "",
        signal_date: latestDate(row),
        source: "정비사업 정보몽땅",
        recommended_action: "공개자료 수 증가분의 실제 문서 제목·첨부·일자를 확인",
        url: row.detail_url ?? row.official_project_url ?? "",
      });
    }
  }
  return signals.sort((a, b) => Number(a.priority_rank || 999) - Number(b.priority_rank || 999));
}

function buildChangeQueue(changes) {
  return changes
    .filter((change) => change.priority_rank || change.field === "current_stage")
    .map((change) => ({
      queue_type: "cleanup_snapshot_change",
      priority_rank: change.priority_rank ?? "",
      focus_area: change.focus_area ?? "",
      district: change.district ?? "",
      project_name: change.project_name ?? "",
      signal: change.field_label ?? change.field ?? "",
      detail: `${change.previous_value ?? ""} -> ${change.current_value ?? ""}${change.delta ? ` (${change.delta})` : ""}`,
      signal_date: change.current_collected_at ?? "",
      source: "정비사업 정보몽땅 사업장검색",
      recommended_action: change.recommended_action ?? "변경 항목 원문 확인",
      url: change.official_project_url ?? "",
    }));
}

function buildDistrictQueue(rows) {
  return rows
    .filter((row) => row.match_confidence === "high" || row.match_confidence === "medium")
    .slice()
    .sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1 };
      return (confidenceOrder[a.match_confidence] ?? 9) - (confidenceOrder[b.match_confidence] ?? 9)
        || Number(a.rank || 999) - Number(b.rank || 999);
    })
    .slice(0, 10)
    .map((row) => ({
      queue_type: "district_notice_probe",
      priority_rank: row.rank ?? "",
      focus_area: row.focus_area ?? "",
      district: row.district ?? "",
      project_name: row.project_name ?? "",
      signal: `${row.match_confidence} confidence`,
      detail: row.notice_title || row.review_note || "",
      signal_date: row.notice_date ?? "",
      source: row.source_name ?? "자치구 고시공고",
      recommended_action:
        row.match_confidence === "high"
          ? "첨부 원문을 텍스트 추출·핵심 수치 대조 체인에 연결"
          : "사업명·위치·면적을 대조한 뒤 고신뢰 후보로 승격 여부 판단",
      url: row.detail_url ?? "",
    }));
}

function mdTable(headers, rows) {
  if (!rows.length) return "_해당 항목 없음_\n";
  const headerLine = `| ${headers.map((header) => header.label).join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${headers.map((header) => String(row[header.key] ?? "").replaceAll("\n", " ").replaceAll("|", "\\|")).join(" | ")} |`);
  return `${[headerLine, separator, ...body].join("\n")}\n`;
}

function renderMarkdown(summary, queueRows) {
  const priorityChanges = summary.cleanup.priority_changes;
  const boardSignals = queueRows.filter((row) => row.queue_type === "changed_project_latest_board_item");
  const districtSignals = queueRows.filter((row) => row.queue_type === "district_notice_probe");
  return `# 공식 최신 수집 요약

작성 기준: ${summary.generated_at}

이 문서는 네트워크 수집 직후 로컬 원자료를 한 번에 판독하기 위한 운영 요약이다. 원격 수집 자체는 하지 않고, 이미 내려받은 정보몽땅·서울도시공간포털·자치구 고시공고 산출물을 결합한다.

## 요약

| 항목 | 값 |
| --- | --- |
| 정보몽땅 현재 사업장 수 | ${summary.cleanup.current_count} |
| 직전 스냅샷 | ${summary.cleanup.previous_snapshot || "없음"} |
| 전체 변경 | ${summary.cleanup.change_count} |
| 단계 변경 | ${summary.cleanup.stage_change_count} |
| 공개자료 수 변경 | ${summary.cleanup.public_doc_change_count} |
| 우선검토 후보 변경 | ${summary.cleanup.priority_change_count} |
| 최신 게시판 공개항목 행 | ${summary.cleanup_board.rows} |
| 서울도시공간포털 지도 매칭 | ${summary.urban_map.matched}/${summary.urban_map.rows} |
| 서울도시공간포털 고시 원문 | ${summary.urban_notice.rows}건, 첨부 ${summary.urban_notice.attachment_rows}개 |
| 강남·송파 자치구 프로브 | ${summary.district_notice.rows}건, high ${summary.district_notice.high_confidence}, medium ${summary.district_notice.medium_confidence}, no candidate ${summary.district_notice.no_candidate} |
| 수동/외부 병목 | 시장 원자료 파일과 high blocking 공식 회신은 별도 보류 |

## 우선검토 변경

${mdTable(
    [
      { key: "priority_rank", label: "순위" },
      { key: "focus_area", label: "생활권" },
      { key: "project_name", label: "사업장" },
      { key: "detail", label: "변경" },
      { key: "recommended_action", label: "다음 확인" },
    ],
    buildChangeQueue(priorityChanges),
  )}

## 변경 사업장 최신 공개항목

${mdTable(
    [
      { key: "priority_rank", label: "순위" },
      { key: "project_name", label: "사업장" },
      { key: "signal", label: "게시판" },
      { key: "detail", label: "제목" },
      { key: "signal_date", label: "일자" },
    ],
    boardSignals.slice(0, 15),
  )}

## 자치구 고시공고 후보

${mdTable(
    [
      { key: "priority_rank", label: "순위" },
      { key: "project_name", label: "사업장" },
      { key: "signal", label: "신뢰도" },
      { key: "detail", label: "후보 제목" },
      { key: "recommended_action", label: "처리" },
    ],
    districtSignals,
  )}

## 판독 메모

- 이번 정보몽땅 스냅샷에서는 사업 단계 변화가 없고, 공개자료 수 증가가 전부다.
- 공개자료 수 증가 사업은 실제 새 문서 제목이 무엇인지 사업장 게시판에서 확인해야 한다. 목록 수 증가만으로 인허가 진행을 단정하지 않는다.
- 서울도시공간포털 원문 첨부는 내려받은 상태지만, high blocking 필드는 담당부서/정보몽땅 회신 전까지 확정값으로 승격하지 않는다.
- 강남·송파 자치구 프로브의 medium 후보는 주변 시설·금연구역처럼 사업 원문이 아닌 결과가 섞여 있어 원문 대조 전까지 보조 후보로만 둔다.

## 입력

${Object.values(INPUTS).map((file) => `- \`${file}\``).join("\n")}
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const cleanupDiff = await readJson(INPUTS.cleanupDiff, {});
  const cleanupCurrent = await readJson(INPUTS.cleanupCurrent, []);
  const cleanupBoard = await readJson(INPUTS.cleanupBoard, []);
  const urbanMap = await readJson(INPUTS.urbanMap, []);
  const urbanNotice = await readJson(INPUTS.urbanNotice, []);
  const urbanNoticeAttachments = await readCsv(INPUTS.urbanNoticeAttachments);
  const districtNotice = await readJson(INPUTS.districtNotice, []);
  const districtNoticeAttachments = await readCsv(INPUTS.districtNoticeAttachments);

  const changes = Array.isArray(cleanupDiff.changes) ? cleanupDiff.changes : [];
  const priorityChanges = changes.filter((change) => change.priority_rank);
  const queueRows = [
    ...buildChangeQueue(priorityChanges),
    ...buildBoardSignals(priorityChanges, cleanupBoard),
    ...buildDistrictQueue(districtNotice),
  ];

  const summary = {
    generated_at: new Date().toISOString(),
    inputs: INPUTS,
    cleanup: {
      current_count: cleanupDiff.current_count ?? cleanupCurrent.length,
      previous_count: cleanupDiff.previous_count ?? "",
      change_count: cleanupDiff.change_count ?? changes.length,
      previous_snapshot: cleanupDiff.previous_snapshot ?? "",
      previous_collected_at: cleanupDiff.previous_collected_at ?? "",
      current_collected_at: cleanupDiff.current_collected_at ?? firstNonEmpty(cleanupCurrent, "collected_at"),
      stage_change_count: changes.filter((change) => change.field === "current_stage").length,
      public_doc_change_count: changes.filter((change) => change.field === "public_doc_count").length,
      priority_change_count: priorityChanges.length,
      priority_changes: priorityChanges,
      change_type_counts: countBy(changes, "change_type"),
    },
    cleanup_board: {
      rows: cleanupBoard.length,
      collected_at: firstNonEmpty(cleanupBoard, "collected_at"),
      changed_project_latest_item_count: queueRows.filter((row) => row.queue_type === "changed_project_latest_board_item").length,
    },
    urban_map: {
      rows: urbanMap.length,
      matched: urbanMap.filter((row) => row.match_status === "matched").length,
      missing: urbanMap.filter((row) => row.match_status !== "matched").length,
      groups: countBy(urbanMap, "urban_group"),
    },
    urban_notice: {
      rows: urbanNotice.length,
      unique_notice_codes: new Set(urbanNotice.map((row) => row.notice_code).filter(Boolean)).size,
      attachment_count_from_notice_rows: urbanNotice.reduce((sum, row) => sum + num(row.attachment_count), 0),
      attachment_rows: urbanNoticeAttachments.length,
      downloaded_attachment_rows: urbanNoticeAttachments.filter((row) => ["downloaded", "already_exists"].includes(row.download_status)).length,
      drawing_image_rows: urbanNoticeAttachments.filter((row) => row.attachment_type === "drawing_image").length,
    },
    district_notice: {
      rows: districtNotice.length,
      high_confidence: districtNotice.filter((row) => row.match_confidence === "high").length,
      medium_confidence: districtNotice.filter((row) => row.match_confidence === "medium").length,
      no_candidate: districtNotice.filter((row) => row.search_status === "no_candidate").length,
      attachment_rows: districtNoticeAttachments.length,
      downloaded_attachment_rows: districtNoticeAttachments.filter((row) => ["downloaded", "already_exists"].includes(row.download_status)).length,
    },
    action_queue_count: queueRows.length,
    action_queue: queueRows,
  };

  await writeFile(OUT_JSON, `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(queueRows));
  await writeFile(OUT_MD, renderMarkdown(summary, queueRows));
  console.log(`Wrote ${OUT_MD}, ${OUT_CSV}, ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
