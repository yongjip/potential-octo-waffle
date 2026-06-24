#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";

const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const OUT_DIR = "data/urban";
const ANALYSIS_DIR = "analysis";
const HTML_DIR = path.join(OUT_DIR, "district-notice-html");
const FILE_DIR = "data/urban/files";
const OUT_JSON = path.join(OUT_DIR, "gangnam-songpa-notice-candidates.json");
const OUT_CSV = path.join(OUT_DIR, "gangnam-songpa-notice-candidates.csv");
const OUT_ATTACHMENTS_CSV = path.join(OUT_DIR, "gangnam-songpa-notice-attachments.csv");
const OUT_MD = path.join(ANALYSIS_DIR, "gangnam-songpa-notice-probe.md");
const SHOULD_DOWNLOAD = process.argv.includes("--download");

const DISTRICTS = {
  강남구: {
    site_name: "강남구청 고시공고",
    base: "https://www.gangnam.go.kr",
    searchModes: [
      { id: "title", label: "제목", field: "BNI_MAIN_TITLE" },
      { id: "content", label: "내용", field: "BNI_MAIN_CONT" },
    ],
    searchUrl(keyword, mode) {
      return `${this.base}/notice/list.do?${new URLSearchParams({
        mid: "ID05_040201",
        gubunfield: "01",
        keyfield: mode.field,
        keyword,
      })}`;
    },
  },
  송파구: {
    site_name: "송파구청 고시공고",
    base: "https://www.songpa.go.kr",
    searchModes: [
      { id: "title", label: "제목", field: "SJ" },
      { id: "content", label: "내용", field: "CN" },
    ],
    searchUrl(keyword, mode) {
      return `${this.base}/www/selectGosiList.do?${new URLSearchParams({
        key: "2776",
        searchCnd: mode.field,
        searchKrwd: keyword,
      })}`;
    },
  },
};

function compactText(value) {
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
  return compactText(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function normalize(value) {
  return String(value || "")
    .replace(/[①②③④⑤⑥⑦⑧⑨]/g, (char) => String("①②③④⑤⑥⑦⑧⑨".indexOf(char) + 1))
    .replace(/[^0-9A-Za-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.map(compactText).filter(Boolean))];
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return { url: response.url, text: await response.text() };
}

function absoluteUrl(base, href) {
  if (!href) return "";
  const clean = href.replaceAll("&amp;", "&");
  if (/^javascript:/i.test(clean)) return clean;
  try {
    return new URL(clean, base).toString();
  } catch {
    return clean;
  }
}

function keywordSeeds(row) {
  const text = `${row.project_name || ""} ${row.estimated_station_area || ""}`;
  const seeds = [row.project_name];
  if (text.includes("압구정")) {
    seeds.push("압구정", "압구정아파트지구");
    for (const match of text.matchAll(/특별계획구역\s*([0-9①②③④⑤⑥⑦⑧⑨]+)/g)) seeds.push(`특별계획구역${match[1]}`);
  }
  if (text.includes("은마")) seeds.push("은마");
  if (text.includes("대치우성")) seeds.push("대치우성", "우성1차");
  if (text.includes("대치쌍용1")) seeds.push("대치쌍용1", "쌍용1차", "대치쌍용");
  if (text.includes("대치쌍용2")) seeds.push("대치쌍용2", "쌍용2차", "대치쌍용");
  if (text.includes("개포주공6")) seeds.push("개포주공6", "개포주공", "개포6");
  if (text.includes("잠실5")) seeds.push("잠실5단지", "잠실주공5", "잠실5");
  if (text.includes("잠실우성4")) seeds.push("잠실우성4", "우성4차");
  if (text.includes("잠실우성")) seeds.push("잠실우성", "우성아파트");
  if (text.includes("장미")) seeds.push("장미", "장미1", "장미아파트");
  if (text.includes("송파한양2")) seeds.push("송파한양2", "한양2차", "송파 한양2차");
  if (text.includes("송파미성")) seeds.push("송파미성", "미성아파트");
  if (text.includes("가락1차현대")) seeds.push("가락1차현대", "가락현대");
  if (text.includes("가락삼익")) seeds.push("가락삼익", "삼익맨숀");
  if (text.includes("대림가락")) seeds.push("대림가락");
  if (text.includes("마천1")) seeds.push("마천1", "마천1재정비촉진구역");
  return unique(seeds).slice(0, 5);
}

function gangnamListRows(html, baseUrl) {
  const rows = [];
  const body = html.match(/<tbody[\s\S]*?<\/tbody>/i)?.[0] || "";
  for (const tr of body.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)) {
    const cells = [...tr[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);
    const link = tr[0].match(/<a\b[^>]*href=["']([^"']*\/notice\/view\.do[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link || cells.length < 5) continue;
    rows.push({
      board_notice_id: link[1].match(/not_ancmt_mgt_no=([^&]+)/)?.[1] || "",
      notice_no: stripTags(cells[1]),
      title: stripTags(link[2]),
      detail_url: absoluteUrl(baseUrl, link[1]),
      department: stripTags(cells[3]),
      notice_date: stripTags(cells[4]),
    });
  }
  return rows;
}

function songpaListRows(html, baseUrl) {
  const rows = [];
  const body = html.match(/<tbody[\s\S]*?<\/tbody>/i)?.[0] || "";
  for (const tr of body.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)) {
    const cells = [...tr[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => match[1]);
    const link = tr[0].match(/<a\b[^>]*href=["']([^"']*selectGosiData\.do[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!link || cells.length < 6) continue;
    rows.push({
      board_notice_id: link[1].match(/not_ancmt_mgt_no=([^&]+)/)?.[1] || "",
      notice_no: stripTags(cells[1]),
      title: stripTags(link[2]),
      detail_url: absoluteUrl(baseUrl, link[1]),
      department: stripTags(cells[3]),
      notice_date: stripTags(cells[4]),
      post_period: stripTags(cells[5]),
    });
  }
  return rows;
}

function listRows(district, html, baseUrl) {
  if (district === "강남구") return gangnamListRows(html, baseUrl);
  if (district === "송파구") return songpaListRows(html, baseUrl);
  return [];
}

function detailBody(district, html) {
  if (district === "강남구") {
    return stripTags(html.match(/<div class=["']post-content["'][^>]*>([\s\S]*?)<\/div>\s*<!--\s*첨부파일/i)?.[1] || "");
  }
  return stripTags(html.match(/<td\b[^>]*class=["'][^"']*bbs_content[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1] || "");
}

function detailFields(district, html) {
  if (district === "강남구") {
    return {
      content: detailBody(district, html),
      title: compactText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.split("|")[0] || ""),
    };
  }
  const field = (label) => {
    const regex = new RegExp(`<th[^>]*>${label}<\\/th>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, "i");
    return stripTags(html.match(regex)?.[1] || "");
  };
  return {
    content: detailBody(district, html),
    notice_class: field("공시공고구분"),
    notice_no: field("고시공고번호"),
    notice_date: field("등록일"),
    detail_department: field("담당부서"),
  };
}

function gangnamAttachments(html, baseUrl) {
  const rows = [];
  const box = html.match(/<div class=["']bbs-view-file["'][\s\S]*?<\/div>/i)?.[0] || "";
  for (const match of box.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    rows.push({
      attachment_name: stripTags(match[2]),
      attachment_url: absoluteUrl(baseUrl, match[1]),
    });
  }
  return rows;
}

function songpaAttachments(html, baseUrl) {
  const rows = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].replaceAll("&amp;", "&");
    const label = stripTags(match[2]);
    if (/gosiPreview|FileDown|gourl|\.hwp|\.hwpx|\.pdf|\.zip/i.test(`${href} ${label}`)) {
      const gourl = href.match(/gourl\(['"]([^'"]+)/i)?.[1];
      rows.push({
        attachment_name: label,
        attachment_url: gourl || absoluteUrl(baseUrl, href),
      });
    }
  }
  return rows;
}

function attachments(district, html, baseUrl) {
  if (district === "강남구") return gangnamAttachments(html, baseUrl);
  if (district === "송파구") return songpaAttachments(html, baseUrl);
  return [];
}

function tokenScore(row, candidate) {
  const title = normalize(candidate.notice_title);
  const content = normalize(candidate.notice_content);
  const haystack = `${title} ${content}`;
  const project = normalize(row.project_name);
  const exact = normalize(row.project_name)
    .replace(/주택재건축정비사업조합|재건축정비사업조합|주택재건축정비사업 조합|재건축정비사업|조합설립추진위원회|조합/g, "")
    .trim();
  let score = 0;
  if (exact && title.includes(exact)) score += 80;
  else if (exact && haystack.includes(exact)) score += 40;
  for (const seed of keywordSeeds(row)) {
    const token = normalize(seed);
    if (!token || token.length < 2 || token === project) continue;
    if (title.includes(token)) score += 35;
    else if (haystack.includes(token)) score += 10;
  }
  if (/재건축|정비사업|조합설립|추진위원|사업시행|관리처분|도시관리계획|지구단위계획|고시|공고/.test(candidate.notice_title)) score += 10;
  if (candidate.department && /재건축|주택사업|도시계획|건축/.test(candidate.department)) score += 8;
  return Math.min(score, 160);
}

function confidence(score) {
  if (score >= 80) return "high";
  if (score >= 45) return "medium";
  if (score > 0) return "low";
  return "none";
}

function sanitizeFileName(value) {
  return String(value || "file")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function localAttachmentPath(row, candidate, attachment, index) {
  const rank = String(row.rank).padStart(2, "0");
  const district = row.district === "강남구" ? "gangnam-gu" : "songpa-gu";
  const id = sanitizeFileName(candidate.board_notice_id || "notice");
  const ext = path.extname(attachment.attachment_name) || "";
  const base = sanitizeFileName(path.basename(attachment.attachment_name, ext) || `attachment-${index}`);
  return path.join(FILE_DIR, `${rank}-${district}-${id}-${index}-${base}${ext}`);
}

async function downloadAttachment(row, candidate, attachment, index) {
  if (!attachment.attachment_url || /^javascript:/i.test(attachment.attachment_url)) {
    return { local_path: "", byte_size: "", sha256: "", download_status: "unsupported_url", download_error: "" };
  }
  const localPath = localAttachmentPath(row, candidate, attachment, index);
  try {
    const existing = await stat(localPath);
    const buffer = await readFile(localPath);
    return {
      local_path: localPath,
      byte_size: existing.size,
      sha256: createHash("sha256").update(buffer).digest("hex"),
      download_status: "already_exists",
      download_error: "",
    };
  } catch {
    // Download below.
  }
  let buffer;
  try {
    buffer = await downloadBuffer(attachment.attachment_url);
  } catch (error) {
    return { local_path: "", byte_size: "", sha256: "", download_status: "failed", download_error: error.message };
  }
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, buffer);
  return {
    local_path: localPath,
    byte_size: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    download_status: "downloaded",
    download_error: "",
  };
}

function downloadBuffer(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "http:" ? http : https;
    const request = client.request(
      parsed,
      {
        headers: { "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)" },
        rejectUnauthorized: false,
      },
      (response) => {
        const location = response.headers.location;
        if ([301, 302, 303, 307, 308].includes(response.statusCode) && location && redirectCount < 5) {
          response.resume();
          resolve(downloadBuffer(new URL(location, parsed).toString(), redirectCount + 1));
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          response.resume();
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      },
    );
    request.on("error", reject);
    request.end();
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
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function mdTable(rows, fields) {
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

function markdown(rows, attachmentsRows) {
  const candidateRows = rows.filter((row) => row.search_status === "candidate");
  const highRows = candidateRows.filter((row) => row.match_confidence === "high");
  const mediumRows = candidateRows.filter((row) => row.match_confidence === "medium");
  const noRows = rows.filter((row) => row.search_status === "no_candidate");
  return `# 강남구·송파구 고시공고 프로브

작성 기준: 2026-06-23 KST

강남구청·송파구청 공식 고시공고 게시판에서 우선검토 후보의 사업명·단지명 키워드를 검색한 결과다. 이 산출물은 후보 확인용이며, 고신뢰 후보라도 원문 첨부와 사업명·위치·면적을 대조한 뒤 비교 매트릭스에 승격한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 검색 행 | ${rows.length} |
| 후보 행 | ${candidateRows.length} |
| high confidence | ${highRows.length} |
| medium confidence | ${mediumRows.length} |
| 후보 없음 | ${noRows.length} |
| 첨부 링크 | ${attachmentsRows.length} |
| 로컬 다운로드 | ${attachmentsRows.filter((row) => row.local_path).length} |

## 고신뢰 후보

${mdTable(highRows, [
  { key: "rank", label: "순위" },
  { key: "district", label: "구" },
  { key: "project_name", label: "사업" },
  { key: "search_keyword", label: "검색어" },
  { key: "search_mode", label: "검색유형" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "등록일" },
  { key: "notice_title", label: "제목" },
  { key: "department", label: "부서" },
  { key: "attachment_count", label: "첨부" },
])}

## 중간 신뢰 후보

${mdTable(mediumRows, [
  { key: "rank", label: "순위" },
  { key: "district", label: "구" },
  { key: "project_name", label: "사업" },
  { key: "search_keyword", label: "검색어" },
  { key: "search_mode", label: "검색유형" },
  { key: "match_score", label: "점수" },
  { key: "notice_no", label: "번호" },
  { key: "notice_date", label: "등록일" },
  { key: "notice_title", label: "제목" },
  { key: "department", label: "부서" },
  { key: "attachment_count", label: "첨부" },
])}

## 후보 없음

${mdTable(noRows, [
  { key: "rank", label: "순위" },
  { key: "district", label: "구" },
  { key: "project_name", label: "사업" },
  { key: "search_keyword", label: "검색어" },
  { key: "review_note", label: "메모" },
])}
`;
}

async function main() {
  const matrixRows = JSON.parse(await readFile(MATRIX_INPUT, "utf8"));
  const targets = matrixRows.filter((row) => ["강남구", "송파구"].includes(row.district));
  const rows = [];
  const attachmentRows = [];
  await mkdir(HTML_DIR, { recursive: true });

  for (const row of targets) {
    const config = DISTRICTS[row.district];
    const found = new Map();
    const keywords = keywordSeeds(row);
    const titleModes = config.searchModes.filter((mode) => mode.id === "title");
    const fallbackModes = config.searchModes.filter((mode) => mode.id !== "title");
    for (const modeGroup of [titleModes, fallbackModes]) {
      if (modeGroup === fallbackModes && found.size > 0) continue;
      for (const keyword of keywords) {
        for (const mode of modeGroup) {
          const searchUrl = config.searchUrl(keyword, mode);
          const search = await fetchText(searchUrl);
          const searchRows = listRows(row.district, search.text, search.url);
          for (const item of searchRows) {
            if (!item.board_notice_id || found.has(item.board_notice_id)) continue;
            found.set(item.board_notice_id, { ...item, search_keyword: keyword, search_mode: mode.label });
          }
        }
      }
    }

    const candidates = [];
    for (const item of found.values()) {
      const detail = await fetchText(item.detail_url);
      const htmlPath = path.join(HTML_DIR, `${String(row.rank).padStart(2, "0")}-${row.district}-${item.board_notice_id}.html`);
      await writeFile(htmlPath, detail.text);
      const fields = detailFields(row.district, detail.text);
      const candidateAttachments = attachments(row.district, detail.text, detail.url);
      const candidate = {
        rank: row.rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        search_keyword: item.search_keyword,
        search_mode: item.search_mode,
        search_status: "candidate",
        match_score: 0,
        match_confidence: "",
        source_name: config.site_name,
        board_notice_id: item.board_notice_id,
        notice_no: fields.notice_no || item.notice_no,
        notice_date: fields.notice_date || item.notice_date,
        notice_title: item.title || fields.title,
        department: fields.detail_department || item.department,
        detail_url: item.detail_url,
        local_html_path: htmlPath,
        notice_content: fields.content,
        attachment_count: candidateAttachments.length,
        review_note: "",
      };
      candidate.match_score = tokenScore(row, candidate);
      candidate.match_confidence = confidence(candidate.match_score);
      candidate.review_note =
        candidate.match_confidence === "high"
          ? "사업명/단지명 토큰이 자치구 고시공고 제목 또는 본문과 강하게 일치한다. 첨부 원문 대조 후 승격 후보"
          : "검색 후보이므로 제목·본문·첨부 원문에서 위치와 사업범위를 수동 확인해야 한다";
      if (candidate.match_score > 0) candidates.push(candidate);

      for (const [index, attachment] of candidateAttachments.entries()) {
        let downloadResult = { local_path: "", byte_size: "", sha256: "", download_status: SHOULD_DOWNLOAD ? "not_attempted" : "", download_error: "" };
        if (SHOULD_DOWNLOAD && candidate.match_confidence === "high") {
          downloadResult = await downloadAttachment(row, candidate, attachment, index + 1);
        }
        attachmentRows.push({
          rank: row.rank,
          focus_area: row.focus_area,
          district: row.district,
          project_name: row.project_name,
          board_notice_id: item.board_notice_id,
          notice_no: candidate.notice_no,
          notice_date: candidate.notice_date,
          notice_title: candidate.notice_title,
          attachment_index: index + 1,
          attachment_name: attachment.attachment_name,
          attachment_url: attachment.attachment_url,
          local_path: downloadResult.local_path,
          byte_size: downloadResult.byte_size,
          sha256: downloadResult.sha256,
          download_status: downloadResult.download_status,
          download_error: downloadResult.download_error,
        });
      }
    }

    candidates.sort((a, b) => b.match_score - a.match_score || String(b.notice_date).localeCompare(String(a.notice_date)));
    const kept = candidates.filter((candidate) => ["high", "medium"].includes(candidate.match_confidence)).slice(0, 5);
    if (kept.length) {
      rows.push(...kept);
    } else {
      rows.push({
        rank: row.rank,
        focus_area: row.focus_area,
        district: row.district,
        project_name: row.project_name,
        search_keyword: keywords.join("; "),
        search_mode: "제목; 내용 fallback",
        search_status: "no_candidate",
        match_score: 0,
        match_confidence: "none",
        source_name: config.site_name,
        board_notice_id: "",
        notice_no: "",
        notice_date: "",
        notice_title: "",
        department: "",
        detail_url: "",
        local_html_path: "",
        notice_content: "",
        attachment_count: 0,
        review_note: "강남구/송파구 고시공고 제목·내용 검색에서 고신뢰 후보가 확인되지 않음",
      });
    }
  }

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(ANALYSIS_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_ATTACHMENTS_CSV, toCsv(attachmentRows));
  await writeFile(OUT_MD, markdown(rows, attachmentRows));
  console.log(
    JSON.stringify(
      {
        targetProjects: targets.length,
        rows: rows.length,
        highConfidence: rows.filter((row) => row.match_confidence === "high").length,
        noCandidate: rows.filter((row) => row.search_status === "no_candidate").length,
        attachments: attachmentRows.length,
        downloaded: attachmentRows.filter((row) => row.local_path).length,
        output: "analysis/gangnam-songpa-notice-probe.md",
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
