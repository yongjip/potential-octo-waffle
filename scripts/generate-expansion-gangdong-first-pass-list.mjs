#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SHORTLIST_INPUT = "analysis/expansion-interest-zone-shortlist.json";
const CANDIDATE_PROBE_INPUT = "analysis/expansion-gangdong-notice-candidates.json";
const QUEUE_INPUT = "analysis/expansion-urban-notice-collection-queue.json";

const OUT_JSON = "analysis/expansion-gangdong-first-pass-collection-list.json";
const OUT_CSV = "analysis/expansion-gangdong-first-pass-collection-list.csv";
const OUT_MD = "analysis/expansion-gangdong-first-pass-collection-list.md";

const TARGET_IDS = ["exp-short-gd-sangilvilla", "exp-short-gd-gokang1", "exp-short-gd-gd1207"];

const BASE_COMMANDS = [
  "node scripts/probe-expansion-gangdong-notice-candidates.mjs",
  "node scripts/generate-expansion-urban-notice-fetch-input.mjs",
  "node scripts/fetch-urban-notice-details.mjs --input data/urban/urban-notice-fetch-input-expansion-shortlist.json --out-json data/urban/urban-notice-details-expansion-shortlist.json --out-csv data/urban/urban-notice-details-expansion-shortlist.csv --out-attachments-csv data/urban/urban-notice-attachments-expansion-shortlist.csv --file-dir data/urban/expansion-files --download",
  "node scripts/generate-expansion-urban-notice-collection-queue.mjs",
  "node scripts/generate-expansion-urban-notice-review-board.mjs",
];

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()) + " KST";
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

async function readJson(file, fallback = []) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function byId(rows) {
  return new Map((rows || []).map((row) => [String(row.shortlist_id || row.id || ""), row]));
}

async function main() {
  const shortlistDoc = await readJson(SHORTLIST_INPUT, { rows: [] });
  const shortlistRows = shortlistDoc.rows || [];
  const probeRows = await readJson(CANDIDATE_PROBE_INPUT, []);
  const queueDoc = await readJson(QUEUE_INPUT, { rows: [] });

  const shortlistById = byId(shortlistRows);
  const queueById = byId(queueDoc.rows || []);
  const probeById = new Map();
  for (const row of probeRows) {
    const id = String(row.shortlist_id || "");
    if (!id) continue;
    if (!probeById.has(id)) probeById.set(id, []);
    probeById.get(id).push(row);
  }

  const targetRows = TARGET_IDS
    .map((id) => shortlistById.get(id))
    .filter(Boolean)
    .map((row, index) => {
      const probe = probeById.get(row.shortlist_id) || [];
      const queue = queueById.get(row.shortlist_id) || {};
      const bestProbe = probe.sort((a, b) => b.match_score - a.match_score)[0] || null;

      const hasNoticeCode = Boolean(String(row.urban_notice_code || "").trim());
      const status = hasNoticeCode
        ? queue.detail_fetched === "Y"
          ? "notice_ready_for_review"
          : "matched_notice_not_fetched"
        : bestProbe
          ? "probe_candidate_found_no_linked_code"
          : "probe_needed_manual_check";

      return {
        target_rank: index + 1,
        shortlist_id: row.shortlist_id,
        project_name: row.project_name || "",
        location: row.location || "",
        shortlist_notice_no: row.notice_no || "",
        shortlist_notice_date: row.notice_date || "",
        shortlist_notice_code: row.urban_notice_code || "",
        shortlist_notice_url: row.urban_notice_code ? `https://urban.seoul.go.kr/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(row.urban_notice_code)}` : "",
        probe_candidate_count: probe.length,
        best_probe_code: bestProbe?.notice_code || "",
        best_probe_no: bestProbe?.notice_no || "",
        best_probe_date: bestProbe?.notice_date || "",
        best_probe_url: bestProbe?.official_url || "",
        best_probe_confidence: bestProbe?.match_confidence || "",
        status,
        recommended_action: hasNoticeCode
          ? "수집 큐/리뷰 보드 재생성 후 텍스트 검토"
          : bestProbe
            ? "정밀 수동 확인 후 noticeCode 1개만 shortlist에 반영"
            : "정비사업정보공개 검색어/공고 연계 채널로 noticeCode 재탐색",
        first_command: hasNoticeCode
          ? `node scripts/fetch-urban-notice-details.mjs --input data/urban/urban-notice-fetch-input-expansion-shortlist.json --out-json data/urban/urban-notice-details-expansion-shortlist.json --out-csv data/urban/urban-notice-details-expansion-shortlist.csv --out-attachments-csv data/urban/urban-notice-attachments-expansion-shortlist.csv --file-dir data/urban/expansion-files --download`
          : "node scripts/probe-expansion-gangdong-notice-candidates.mjs",
      };
    });

  const summary = {
    generated_at: kstDate(),
    scope: "expansion_gangdong_3_targets",
    matched_notice_code_count: targetRows.filter((row) => row.shortlist_notice_code).length,
    probe_candidate_count: targetRows.reduce((sum, row) => sum + Number(row.probe_candidate_count || 0), 0),
    ready_notice_count: targetRows.filter((row) => row.status === "notice_ready_for_review").length,
    pending_manual_count: targetRows.filter((row) => row.status.startsWith("probe_needed") || row.status.startsWith("probe_candidate")).length,
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
    base_commands: BASE_COMMANDS,
  };

  const rows = targetRows.map((row) => ({ ...row }));

  const md = `# 강동권 확장 후보 1차 수집 실행 목록 (고덕축)\n\n작성 기준: ${summary.generated_at}\n\n## 요약\n\n- 대상: ${rows.length}개\n- noticeCode 확정: ${summary.matched_notice_code_count}개\n- probe 후보 총계: ${summary.probe_candidate_count}개\n- 즉시 리뷰 준비: ${summary.ready_notice_count}개\n- 수동 보강 필요: ${summary.pending_manual_count}개\n\n## 우선 실행 명령\n\n${BASE_COMMANDS.map((command) => `- \`${command}\``).join("\n")}\n\n## 후보별 실행 상태\n\n${mdTable(rows, [
    { key: "target_rank", label: "순번" },
    { key: "project_name", label: "사업장" },
    { key: "location", label: "위치" },
    { key: "shortlist_notice_code", label: "shortlist_noticeCode" },
    { key: "best_probe_code", label: "probe_noticeCode" },
    { key: "status", label: "상태" },
    { key: "recommended_action", label: "권장 액션" },
  ])}\n\n## 링크/경로\n\n- 큐/리뷰: \`analysis/expansion-urban-notice-collection-queue.md\`, \`analysis/expansion-urban-notice-review-board.md\`\n- 입력 파일: \`data/urban/urban-notice-fetch-input-expansion-shortlist.json\`\n- 상세 산출물: \`data/urban/urban-notice-details-expansion-shortlist.json\`\n- 탐색 산출물: \`analysis/expansion-gangdong-notice-candidates.md\`\n\n`;

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, `${md}\n`);

  console.log(
    JSON.stringify(
      {
        rows: rows.length,
        matched_notice_code_count: summary.matched_notice_code_count,
        manual_check_required: summary.pending_manual_count,
        output: [OUT_JSON, OUT_CSV, OUT_MD],
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
