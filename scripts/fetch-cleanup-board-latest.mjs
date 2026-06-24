#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const OUT_DIR = "data/cleanup";
const OUT_JSON = path.join(OUT_DIR, "cleanup-board-latest-priority-candidates.json");
const OUT_CSV = path.join(OUT_DIR, "cleanup-board-latest-priority-candidates.csv");
const OUT_MD = "analysis/cleanup-board-latest.md";
const BASE = "https://cleanup.seoul.go.kr";

const BOARD_LABELS = new Map([
  ["공지사항", { board_type: "notice", priority: "medium" }],
  ["조합입찰공고", { board_type: "bid", priority: "high" }],
  ["신속통합기획", { board_type: "fast_track", priority: "medium" }],
  ["설계지침", { board_type: "design_guideline", priority: "medium" }],
  ["확정된 사업비 및 분담금 목록", { board_type: "cost_share", priority: "high" }],
]);

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return decodeHtml(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  );
}

function attr(tag, name) {
  const match = String(tag ?? "").match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function absoluteUrl(href) {
  const clean = decodeHtml(href);
  if (!clean || clean === "#n" || clean.startsWith("javascript:")) return "";
  return new URL(clean, BASE).toString();
}

function extractDetailUrl(rowHtml) {
  const links = [];
  const regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(rowHtml))) {
    const href = attr(match[1], "href");
    const url = absoluteUrl(href);
    const label = stripTags(match[2]);
    if (!url) continue;
    links.push({ url, label });
  }
  return links.find((link) => /\/(vscr|vscrGnrl)\.do\b/i.test(link.url))?.url || links[0]?.url || "";
}

function extractTables(html) {
  const tables = [];
  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;
  while ((tableMatch = tableRegex.exec(html))) {
    const rows = [];
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(tableMatch[1]))) {
      const rowHtml = rowMatch[1];
      const cells = [];
      const cellRegex = /<(t[hd])\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml))) {
        cells.push({
          kind: cellMatch[1].toLowerCase(),
          text: stripTags(cellMatch[2]),
          html: cellMatch[2],
        });
      }
      if (cells.length > 0) rows.push({ cells, rowHtml, detail_url: extractDetailUrl(rowHtml) });
    }
    tables.push(rows);
  }
  return tables;
}

function totalCount(html, rows) {
  const text = stripTags(html);
  const match = text.match(/전체\s*([0-9,]+)\s*건이\s*검색되었습니다/);
  if (match) return Number(match[1].replace(/,/g, ""));
  return rows.length;
}

function isHeader(row) {
  return row.cells.some((cell) => cell.kind === "th") || row.cells.some((cell) => ["번호", "제목", "등록일", "일시"].includes(cell.text));
}

function dataRowsFromFirstTable(html) {
  const table = extractTables(html)[0] ?? [];
  return table.filter((row) => !isHeader(row));
}

function nonEmpty(value) {
  return String(value ?? "").trim();
}

function itemIdFromUrl(url) {
  if (!url) return "";
  const parsed = new URL(url);
  return parsed.searchParams.get("nttSn") || parsed.searchParams.get("othbcListSn") || parsed.searchParams.get("wctSn") || "";
}

function parseNoticeLike(html, boardType) {
  const rows = dataRowsFromFirstTable(html);
  return rows
    .map((row) => {
      const cells = row.cells.map((cell) => cell.text);
      if (cells.length < 4) return null;
      const titleIndex = cells.length >= 6 ? 2 : 1;
      const registerIndex = cells.length >= 6 ? 3 : 2;
      const dateIndex = cells.length >= 6 ? 4 : 3;
      const viewIndex = cells.length >= 6 ? 5 : 4;
      const title = nonEmpty(cells[titleIndex]);
      if (!title || title === "등록된 게시물이 없습니다.") return null;
      return {
        board_type: boardType,
        item_no: nonEmpty(cells[0]),
        category: cells.length >= 6 ? nonEmpty(cells[1]) : "",
        title,
        author_or_org: nonEmpty(cells[registerIndex]),
        notice_date: "",
        registered_date: nonEmpty(cells[dateIndex]),
        deadline: "",
        view_count: nonEmpty(cells[viewIndex]),
        detail_url: row.detail_url,
        item_id: itemIdFromUrl(row.detail_url),
      };
    })
    .filter(Boolean);
}

function parseBid(html) {
  return dataRowsFromFirstTable(html)
    .map((row) => {
      const cells = row.cells.map((cell) => cell.text);
      if (cells.length < 7) return null;
      const title = nonEmpty(cells[2]);
      if (!title) return null;
      return {
        board_type: "bid",
        item_no: nonEmpty(cells[0]),
        category: "",
        title,
        author_or_org: nonEmpty(cells[1]),
        notice_date: nonEmpty(cells[3]),
        registered_date: nonEmpty(cells[4]),
        deadline: nonEmpty(cells[5]),
        view_count: nonEmpty(cells[6]),
        detail_url: row.detail_url,
        item_id: itemIdFromUrl(row.detail_url),
      };
    })
    .filter(Boolean);
}

function parseCostShare(html) {
  return dataRowsFromFirstTable(html)
    .map((row) => {
      const cells = row.cells.map((cell) => cell.text);
      if (cells.length < 3) return null;
      const title = nonEmpty(cells[1]);
      if (!title) return null;
      return {
        board_type: "cost_share",
        item_no: nonEmpty(cells[0]),
        category: "",
        title,
        author_or_org: "",
        notice_date: "",
        registered_date: nonEmpty(cells[2]),
        deadline: "",
        view_count: "",
        detail_url: row.detail_url,
        item_id: itemIdFromUrl(row.detail_url),
      };
    })
    .filter(Boolean);
}

function parseBoard(html, boardType) {
  if (boardType === "bid") return parseBid(html);
  if (boardType === "cost_share") return parseCostShare(html);
  return parseNoticeLike(html, boardType);
}

async function fetchBoard(menuRow) {
  const meta = BOARD_LABELS.get(menuRow.label);
  const response = await fetch(menuRow.url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${menuRow.rank} ${menuRow.label}`);
  const parsedItems = parseBoard(html, meta.board_type);
  const count = totalCount(html, parsedItems);
  const collectedAt = new Date().toISOString();
  if (parsedItems.length === 0) {
    return [
      {
        rank: menuRow.rank,
        focus_area: menuRow.focus_area,
        district: menuRow.district,
        project_name: menuRow.project_name,
        cafe_id: menuRow.cafe_id,
        cafe_internal_id: menuRow.cafe_internal_id,
        bsns_pk: menuRow.bsns_pk,
        board_label: menuRow.label,
        board_type: meta.board_type,
        board_priority: meta.priority,
        board_total_count: count,
        item_no: "",
        category: "",
        title: "",
        author_or_org: "",
        notice_date: "",
        registered_date: "",
        deadline: "",
        view_count: "",
        detail_url: "",
        item_id: "",
        board_url: menuRow.url,
        official_project_url: menuRow.official_project_url,
        collected_at: collectedAt,
        fetch_status: "ok_no_items",
      },
    ];
  }
  return parsedItems.slice(0, 10).map((item) => ({
    rank: menuRow.rank,
    focus_area: menuRow.focus_area,
    district: menuRow.district,
    project_name: menuRow.project_name,
    cafe_id: menuRow.cafe_id,
    cafe_internal_id: menuRow.cafe_internal_id,
    bsns_pk: menuRow.bsns_pk,
    board_label: menuRow.label,
    board_type: meta.board_type,
    board_priority: meta.priority,
    board_total_count: count,
    ...item,
    board_url: menuRow.url,
    official_project_url: menuRow.official_project_url,
    collected_at: collectedAt,
    fetch_status: "ok",
  }));
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const fields = [
    "rank",
    "focus_area",
    "district",
    "project_name",
    "cafe_id",
    "board_label",
    "board_type",
    "board_priority",
    "board_total_count",
    "item_no",
    "category",
    "title",
    "author_or_org",
    "notice_date",
    "registered_date",
    "deadline",
    "view_count",
    "detail_url",
    "item_id",
    "board_url",
    "official_project_url",
    "collected_at",
    "fetch_status",
  ];
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      acc[row[field] || ""] = (acc[row[field] || ""] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
}

function normalizeDate(value) {
  const text = String(value ?? "");
  const match = text.match(/(20\d{2})[.-](\d{1,2})[.-](\d{1,2})/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function latestDate(row) {
  return normalizeDate(row.notice_date) || normalizeDate(row.registered_date) || "";
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
  const itemRows = rows.filter((row) => row.fetch_status === "ok" && row.title);
  const nonEmptyBoards = rows.filter((row) => Number(row.board_total_count) > 0);
  const recent = [...itemRows]
    .sort((a, b) => latestDate(b).localeCompare(latestDate(a)) || Number(a.rank) - Number(b.rank))
    .slice(0, 40);
  return `# 정비사업 정보몽땅 사업장 게시판 최신 항목

작성 기준: ${new Date().toISOString()}

이 문서는 우선검토 후보 30개 사업장의 정보몽땅 내부 게시판 중 공지사항, 조합입찰공고, 신속통합기획, 설계지침, 확정된 사업비 및 분담금 목록의 최신 공개 항목을 수집한 결과다. 개인별 분담금 조회나 로그인 자료는 수집하지 않는다.

## 요약

| 항목 | 값 |
| --- | --- |
| 대상 사업장 | ${new Set(rows.map((row) => row.rank)).size} |
| 대상 게시판 | ${new Set(rows.map((row) => `${row.rank}|${row.board_label}`)).size} |
| 공개 항목 행 | ${itemRows.length} |
| 항목 있는 게시판 | ${new Set(nonEmptyBoards.map((row) => `${row.rank}|${row.board_label}`)).size} |
| 빈 게시판/항목 없음 행 | ${rows.filter((row) => row.fetch_status === "ok_no_items").length} |

## 게시판 유형별 행 수

${mdTable(countBy(rows, "board_label"), [
  { key: "name", label: "게시판" },
  { key: "count", label: "행 수" },
])}

## 최근 공개 항목

${mdTable(recent, [
  { key: "rank", label: "후보순위" },
  { key: "focus_area", label: "생활권" },
  { key: "project_name", label: "사업장" },
  { key: "board_label", label: "게시판" },
  { key: "title", label: "제목" },
  { key: "notice_date", label: "공고일" },
  { key: "registered_date", label: "등록/일시" },
  { key: "deadline", label: "마감" },
  { key: "detail_url", label: "상세 URL" },
])}

## 운영 규칙

1. 스냅샷 diff에서 공개자료 수가 증가한 사업장은 이 파일에서 같은 사업장의 최근 항목을 먼저 확인한다.
2. 조합입찰공고는 공사비, 설계, CM, 이주, 기반시설 같은 비용·일정 신호를 우선 검토한다.
3. 공지사항은 시청/구청/조합 공지 구분과 등록일을 함께 본다.
4. 사업비 및 분담금 목록은 공개된 목록명과 일시만 기록하고 개인별 조회 데이터는 수집하지 않는다.
`;
}

async function main() {
  const menuRows = JSON.parse(await readFile(MENU_LINKS_INPUT, "utf8"));
  const boardLinks = menuRows
    .filter((row) => BOARD_LABELS.has(row.label) && row.url)
    .sort((a, b) => Number(a.rank) - Number(b.rank) || a.label.localeCompare(b.label, "ko"));
  const rows = [];
  for (const link of boardLinks) rows.push(...(await fetchBoard(link)));
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_MD, markdown(rows));
  console.log(
    JSON.stringify(
      {
        projects: new Set(rows.map((row) => row.rank)).size,
        boards: new Set(rows.map((row) => `${row.rank}|${row.board_label}`)).size,
        rows: rows.length,
        items: rows.filter((row) => row.fetch_status === "ok" && row.title).length,
        output: "data/cleanup/cleanup-board-latest-priority-candidates.{csv,json}; analysis/cleanup-board-latest.md",
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
