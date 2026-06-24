#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MENU_LINKS_INPUT = "data/cleanup/cafe-menu-links-priority-candidates.json";
const OUT_DIR = "data/cleanup";
const HTML_DIR = "prtnelapse-stage-html";
const OUT_JSON = "prtnelapse-stage-dates.json";
const OUT_CSV = "prtnelapse-stage-dates.csv";
const OUT_MD = "prtnelapse-stage-dates.md";

function parseArgs(argv) {
  const args = { ranks: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--ranks") {
      args.ranks = String(argv[++i] || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/fetch-cleanup-prtnelapse-stage-dates.mjs --ranks=1,2,3,4,5");
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return args;
}

function decodeHtml(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#034;", '"')
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
    "official_url",
    "local_html_path",
    "promotion_committee_application_date",
    "promotion_committee_approval_date",
    "union_approval_application_date",
    "union_approval_date",
    "stage_consent_rate_pct",
    "promotion_event_count",
    "union_event_count",
    "summary_note",
    "captured_at",
  ];
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

function selectedProjects(menuRows, targetRanks) {
  const byRank = new Map();
  for (const row of menuRows) {
    if (row.label !== "추진경과") continue;
    const rank = String(row.rank || "");
    if (targetRanks.length && !targetRanks.includes(rank)) continue;
    byRank.set(rank, {
      rank,
      focus_area: row.focus_area || "",
      district: row.district || "",
      project_name: row.project_name || "",
      cafe_id: row.cafe_id || "",
      cafe_internal_id: row.cafe_internal_id || "",
      bsns_pk: row.bsns_pk || "",
      official_url: row.url || "",
    });
  }
  return [...byRank.values()].sort((a, b) => Number(a.rank) - Number(b.rank));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.text();
}

function parseDate(raw) {
  const compact = stripTags(raw).replace(/\s+/g, "");
  const match = compact.match(/(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function parseEvents(blockHtml) {
  const events = [];
  const eventRegex = /<li\b[\s\S]*?<h3\s+class=["']tit["'][^>]*>([\s\S]*?)<\/h3>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = eventRegex.exec(blockHtml))) {
    const date = parseDate(match[1]);
    const text = stripTags(match[2]);
    if (!date || !text) continue;
    const consent = text.match(/동의율\s*:\s*([0-9.]+%?)/)?.[1] || "";
    events.push({
      date,
      raw_text: text,
      event_type: text.match(/\[([^\]]+)\]/)?.[1] || "",
      consent_rate_pct: consent,
    });
  }
  return events;
}

function parseSections(html) {
  const sections = [];
  const sectionRegex = /<li\s+class=["']foldings-li[^"']*["'][\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<ul\s+class=["']check-list01["'][^>]*>([\s\S]*?)<\/ul>[\s\S]*?<\/li>/gi;
  let match;
  while ((match = sectionRegex.exec(html))) {
    const label = stripTags(match[1]);
    const events = parseEvents(match[2]);
    if (label || events.length) sections.push({ label, events });
  }
  return sections;
}

function isApprovalEvent(event, keyword) {
  if (!event.raw_text.includes(keyword)) return false;
  if (/신청/.test(event.raw_text)) return false;
  return true;
}

function firstDate(events, keyword) {
  return events.find((event) => isApprovalEvent(event, keyword))?.date || "";
}

function latestConsent(events) {
  return [...events].reverse().find((event) => event.consent_rate_pct)?.consent_rate_pct || "";
}

function summarizeProject(project, html, localPath) {
  const sections = parseSections(html);
  const promotion = sections.find((section) => /추진위원회/.test(section.label)) || { label: "", events: [] };
  const union =
    sections.find((section) => /조합설립인가/.test(section.label)) ||
    sections.find((section) => /^조합설립$/.test(section.label)) ||
    sections.find((section) => /조합설립/.test(section.label) && !/추진위원회/.test(section.label)) ||
    { label: "", events: [] };
  const promotionApplication = promotion.events.find((event) => /신청/.test(event.raw_text))?.date || "";
  const unionApplication = union.events.find((event) => /신청/.test(event.raw_text))?.date || "";
  const promotionApproval = firstDate(promotion.events, "승인");
  const unionApproval = firstDate(union.events, "인가");
  const stageConsent = latestConsent(union.events) || latestConsent(promotion.events);
  return {
    rank: project.rank,
    focus_area: project.focus_area,
    district: project.district,
    project_name: project.project_name,
    cafe_id: project.cafe_id,
    official_url: project.official_url,
    local_html_path: localPath,
    promotion_committee_application_date: promotionApplication,
    promotion_committee_approval_date: promotionApproval,
    union_approval_application_date: unionApplication,
    union_approval_date: unionApproval,
    stage_consent_rate_pct: stageConsent,
    promotion_section_label: promotion.label,
    union_section_label: union.label,
    promotion_event_count: String(promotion.events.length),
    union_event_count: String(union.events.length),
    promotion_events: promotion.events,
    union_events: union.events,
    summary_note:
      promotionApproval || unionApproval || stageConsent
        ? "정보몽땅 추진경과 아코디언에서 단계일자·동의율 추출"
        : "추진경과 HTML은 확보했으나 단계일자·동의율 자동 추출 실패",
    captured_at: new Date().toISOString(),
  };
}

function markdown(rows) {
  return `# 정보몽땅 추진경과 단계일자 추출

작성 기준: 2026-06-23 KST

추진경과 공개 HTML에서 추진위원회 승인일, 조합설립인가일, 단계 동의율을 추출했다.

${mdTable(rows, [
  { key: "rank", label: "후보" },
  { key: "project_name", label: "사업장" },
  { key: "promotion_committee_approval_date", label: "추진위 승인" },
  { key: "union_approval_date", label: "조합설립인가" },
  { key: "stage_consent_rate_pct", label: "동의율" },
  { key: "official_url", label: "공식 URL" },
  { key: "local_html_path", label: "로컬 HTML" },
])}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const menuRows = JSON.parse(await readFile(MENU_LINKS_INPUT, "utf8"));
  const projects = selectedProjects(menuRows, args.ranks);
  await mkdir(path.join(OUT_DIR, HTML_DIR), { recursive: true });

  const rows = [];
  for (const project of projects) {
    const html = await fetchText(project.official_url);
    const localPath = path.join(OUT_DIR, HTML_DIR, `${project.rank}-${project.cafe_internal_id}-prtnelapse.html`);
    await writeFile(localPath, html);
    rows.push(summarizeProject(project, html, localPath));
  }

  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  await writeFile(path.join(OUT_DIR, OUT_MD), markdown(rows));
  console.log(JSON.stringify({ projects: projects.length, output: `data/cleanup/${OUT_JSON}`, rows }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
