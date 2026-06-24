#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUTS = {
  shortlist: "analysis/expansion-interest-zone-shortlist.json",
  fetchInput: "data/urban/urban-notice-fetch-input-expansion-shortlist.json",
  noticeDetails: "data/urban/urban-notice-details-expansion-shortlist.json",
  attachments: "data/urban/urban-notice-attachments-expansion-shortlist.csv",
  textManifest: "data/urban/text/notice-text-manifest.json",
};

const OUT_MD = "analysis/expansion-urban-notice-collection-queue.md";
const OUT_JSON = "analysis/expansion-urban-notice-collection-queue.json";
const OUT_CSV = "analysis/expansion-urban-notice-collection-queue.csv";
const FETCH_COMMAND =
  "node scripts/fetch-urban-notice-details.mjs --input data/urban/urban-notice-fetch-input-expansion-shortlist.json --out-json data/urban/urban-notice-details-expansion-shortlist.json --out-csv data/urban/urban-notice-details-expansion-shortlist.csv --out-attachments-csv data/urban/urban-notice-attachments-expansion-shortlist.csv --file-dir data/urban/expansion-files --download";

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
  const [headers, ...body] = rows;
  if (!headers) return [];
  return body
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
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

async function main() {
  const shortlistDoc = await readJson(INPUTS.shortlist, { rows: [] });
  const fetchInputRows = await readJson(INPUTS.fetchInput, []);
  const noticeDetails = await readJson(INPUTS.noticeDetails, []);
  const attachments = await readCsv(INPUTS.attachments);
  const textManifestRows = await readJson(INPUTS.textManifest, []);

  const fetchInputByCode = new Map(fetchInputRows.map((row) => [row.urban_notice_code, row]));
  const detailByCode = new Map(noticeDetails.map((row) => [row.notice_code, row]));
  const attachmentsByCode = new Map();
  const textManifestByCode = new Map(
    textManifestRows
      .filter((row) => row.shortlist_id)
      .map((row) => [row.notice_code, row]),
  );
  for (const row of attachments) {
    const code = row.notice_code || "";
    if (!attachmentsByCode.has(code)) attachmentsByCode.set(code, []);
    attachmentsByCode.get(code).push(row);
  }

  const rows = (shortlistDoc.rows || []).map((row) => {
    const inputRow = fetchInputByCode.get(row.urban_notice_code) || {};
    const detailRow = detailByCode.get(row.urban_notice_code) || {};
    const textRow = textManifestByCode.get(row.urban_notice_code) || {};
    const codeAttachments = attachmentsByCode.get(row.urban_notice_code) || [];
    const noticeFiles = codeAttachments.filter((item) => item.attachment_type === "notice_file");
    const localNoticeFiles = noticeFiles.filter((item) => item.local_path);
    const localDrawings = codeAttachments.filter((item) => item.attachment_type === "drawing_image" && item.local_path);

    const textReady = Boolean(textRow.text_path);
    const textMissing = ["scanned_pdf_or_image_only", "failed", "missing_source_file"].includes(textRow.extraction_status || "");

    return {
      shortlist_id: row.shortlist_id,
      zone_name: row.zone_name,
      candidate_type: row.candidate_type,
      shortlist_priority: row.shortlist_priority,
      project_name: row.project_name,
      notice_no: row.notice_no,
      notice_date: row.notice_date,
      urban_notice_code: row.urban_notice_code || "",
      urban_notice_title: row.urban_notice_title || "",
      map_form_url: inputRow.urban_notice_url || "",
      detail_fetched: detailRow.notice_code ? "Y" : "",
      notice_file_linked: detailRow.notice_file_url ? "Y" : "",
      local_notice_file_count: localNoticeFiles.length,
      local_drawing_file_count: localDrawings.length,
      text_status: textRow.extraction_status || "",
      text_char_count: Number(textRow.text_char_count || 0),
      text_path: textRow.text_path || "",
      next_action: textReady
        ? "키필드 검토와 생활권 비교 보드로 이동"
        : textMissing
          ? "OCR 또는 이미지 검토 패킷으로 분기"
          : detailRow.notice_code
            ? localNoticeFiles.length
              ? "텍스트 추출과 값 검증 큐로 넘길 준비"
              : "첨부 manifest는 있으나 로컬 notice_file 저장 여부를 확인"
            : "네트워크 가능 시 확장 shortlist 전용 fetch 명령 실행",
    };
  });

  const summary = {
    generated_at: `${kstDate()} KST`,
    shortlist_count: rows.length,
    fetch_ready_count: rows.filter((row) => row.urban_notice_code).length,
    detail_fetched_count: rows.filter((row) => row.detail_fetched === "Y").length,
    notice_file_linked_count: rows.filter((row) => row.notice_file_linked === "Y").length,
    local_notice_file_count: rows.reduce((sum, row) => sum + Number(row.local_notice_file_count || 0), 0),
    local_drawing_file_count: rows.reduce((sum, row) => sum + Number(row.local_drawing_file_count || 0), 0),
    text_ready_count: rows.filter((row) => row.text_path).length,
    text_missing_count: rows.filter((row) => ["scanned_pdf_or_image_only", "failed", "missing_source_file"].includes(row.text_status)).length,
    fetch_command: FETCH_COMMAND,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };

  const md = `# 확장 관심권 서울도시공간포털 원문 수집 큐

작성 기준: ${summary.generated_at}

이 문서는 강동권·약수동 주변 shortlist를 서울도시공간포털 원문 수집 체계에 바로 태우기 위한 대기열이다. 핵심 생활권 30개와 달리 확장 후보는 map recordCode를 다시 찾지 않고, 확보한 \`noticeCode\`를 기준으로 고시 detail/첨부 수집부터 시작한다.

## 요약

- shortlist 행: ${summary.shortlist_count}
- fetch 준비 완료: ${summary.fetch_ready_count}
- detail 확보: ${summary.detail_fetched_count}
- notice_file 링크 확보: ${summary.notice_file_linked_count}
- 로컬 notice_file 저장: ${summary.local_notice_file_count}
- 로컬 drawing 저장: ${summary.local_drawing_file_count}
- 텍스트 확보: ${summary.text_ready_count}
- OCR/이미지 병목: ${summary.text_missing_count}

## 실행 명령

\`\`\`bash
${summary.fetch_command}
\`\`\`

## 수집 큐

${mdTable(rows, [
    { key: "zone_name", label: "권역" },
    { key: "shortlist_priority", label: "우선" },
    { key: "candidate_type", label: "유형" },
    { key: "project_name", label: "사업장" },
    { key: "notice_no", label: "고시번호" },
    { key: "notice_date", label: "고시일" },
    { key: "urban_notice_code", label: "noticeCode" },
    { key: "detail_fetched", label: "detail" },
    { key: "notice_file_linked", label: "notice_file" },
    { key: "local_notice_file_count", label: "로컬 원문" },
    { key: "text_status", label: "텍스트 상태" },
    { key: "text_char_count", label: "글자 수" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 운영 규칙

1. 확장 후보는 shortlist에서 확보한 \`noticeCode\`로 직접 수집한다.
2. \`detail_fetched\`가 비어 있으면 아직 네트워크 수집 전 상태다.
3. \`notice_file_linked=Y\`가 되어도 로컬 파일과 텍스트 추출 전에는 수치 확정 근거로 올리지 않는다.
4. \`text_status=extracted\`이면 키필드 검토로, \`scanned_pdf_or_image_only\`이면 OCR/이미지 검토로 바로 분기한다.
`;

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);
  console.log(JSON.stringify({ ready: summary.fetch_ready_count, fetched: summary.detail_fetched_count, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
