#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const INPUT = "data/urban/map-missing-business-layer-details.json";
const OUT_DIR = "data/urban";
const OUT_JSON = "business-layer-notice-candidates.json";
const OUT_CSV = "business-layer-notice-candidates.csv";
const OUT_ATTACHMENTS_CSV = "business-layer-notice-attachments.csv";
const FILE_DIR = "data/urban/files";
const BASE = "https://urban.seoul.go.kr";
const SHOULD_DOWNLOAD = process.argv.includes("--download");

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function dateOnly(value) {
  return String(value ?? "").split("T")[0] || "";
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

function searchKeywords(row) {
  const zone = row.layer_zone_name || row.urban_business_name || row.project_name;
  const text = `${row.project_name || ""} ${row.layer_zone_name || ""} ${row.urban_business_name || ""}`;
  const specific = [];
  if (text.includes("삼성1차")) specific.push("광장동 삼성1차", "삼성1차", "삼성1차아파트");
  if (text.includes("워커힐")) specific.push("워커힐", "워커힐아파트");
  if (text.includes("광장극동")) specific.push("광장극동", "광장극동아파트");
  if (text.includes("자양1의4")) specific.push("자양1의4", "자양1의4구역", "자양1-4", "자양1의 4");
  return unique([
    zone,
    row.urban_business_name,
    ...specific,
  ]);
}

function tokenScore(row, notice) {
  const title = normalize(notice.title);
  const content = normalize(notice.content);
  const haystack = `${title} ${content}`;
  const exactNames = unique([row.layer_zone_name, row.urban_business_name]);
  let score = 0;
  for (const name of exactNames) {
    const normalizedName = normalize(name);
    if (normalizedName && title.includes(normalizedName)) score += 80;
    else if (normalizedName && haystack.includes(normalizedName)) score += 40;
  }
  const text = `${row.project_name || ""} ${row.layer_zone_name || ""} ${row.urban_business_name || ""}`;
  const tokens = [];
  if (text.includes("삼성1차")) tokens.push("삼성1차", "삼성1차아파트");
  if (text.includes("워커힐")) tokens.push("워커힐", "워커힐아파트");
  if (text.includes("광장극동")) tokens.push("광장극동", "광장극동아파트");
  if (text.includes("자양1의4")) tokens.push("자양1의4", "자양1의4구역", "자양1 4");
  for (const token of tokens) {
    if (title.includes(normalize(token))) score += 35;
    else if (haystack.includes(token)) score += 8;
  }
  if (row.dong && haystack.includes(normalize(row.dong))) score += 10;
  if (row.representative_lot && haystack.includes(normalize(row.representative_lot).replace(" ", ""))) score += 20;
  return score;
}

function confidence(score) {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  if (score > 0) return "low";
  return "none";
}

function fileUrl(filePath, fileName) {
  if (!filePath || !fileName) return "";
  return `${BASE}/${String(filePath).replace(/^\/+/, "")}/${encodeURIComponent(fileName)}`;
}

function safeNoticeFile(detail) {
  const file = detail?.tnNtfcImage;
  if (!file || typeof file !== "object" || !file.aImageName || !file.aImagePath) return null;
  return {
    type: "notice_file",
    name: file.aImageName,
    path: file.aImagePath,
    url: fileUrl(file.aImagePath, file.aImageName),
  };
}

function safeDrawingImages(detail) {
  if (!Array.isArray(detail?.tnDrwImage)) return [];
  return detail.tnDrwImage
    .filter((item) => item?.dImageName && item?.dImagePath)
    .map((item) => ({
      type: "drawing_image",
      name: item.dImageName,
      path: item.dImagePath,
      url: fileUrl(item.dImagePath, item.dImageName),
    }));
}

async function searchNotices(keyword) {
  const body = {
    pageNo: 1,
    pageSize: 20,
    keywordList: [keyword],
    pubSiteCode: "",
    organCode: "",
    bgnDate: "",
    endDate: "",
    srchType: "title",
    noticeCode: "",
  };
  const response = await fetch(`${BASE}/ntfc/getNtfcList.json`, {
    method: "POST",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ntfc search ${keyword}`);
  return response.json();
}

async function fetchNotice(noticeCode) {
  const response = await fetch(`${BASE}/ntfc/getNtfcDt.json`, {
    method: "POST",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
    },
    body: JSON.stringify({ noticeCode }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} notice ${noticeCode}`);
  return response.json();
}

function localFilePath(row, attachment) {
  const safeRank = String(row.rank).padStart(2, "0");
  const safeNotice = String(row.notice_code || "notice").replace(/[^A-Za-z0-9_-]/g, "");
  const ext = path.extname(attachment.name) || "";
  const baseName = path.basename(attachment.name, ext).replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-");
  return path.join(FILE_DIR, `${safeRank}-${safeNotice}-business-${attachment.type}-${baseName}${ext}`);
}

async function downloadAttachment(row, attachment) {
  if (!attachment.url) return { local_path: "", byte_size: "", sha256: "", download_status: "missing_url", download_error: "" };
  const outPath = localFilePath(row, attachment);
  try {
    const existing = await stat(outPath);
    const existingBuffer = await readFile(outPath);
    return {
      local_path: outPath,
      byte_size: existing.size,
      sha256: createHash("sha256").update(existingBuffer).digest("hex"),
      download_status: "already_exists",
      download_error: "",
    };
  } catch {
    // Continue to download when the file is not present.
  }

  const response = await fetch(attachment.url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; personal-research/1.0)" },
  });
  if (!response.ok) {
    return {
      local_path: "",
      byte_size: "",
      sha256: "",
      download_status: "failed",
      download_error: `HTTP ${response.status}`,
    };
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
  return {
    local_path: outPath,
    byte_size: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    download_status: "downloaded",
    download_error: "",
  };
}

function safeDetail(row, keyword, detail, score) {
  const noticeFile = safeNoticeFile(detail);
  const drawingImages = safeDrawingImages(detail);
  return {
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    dong: row.dong,
    project_name: row.project_name,
    present_sn: row.present_sn,
    layer_zone_name: row.layer_zone_name,
    urban_business_name: row.urban_business_name,
    search_keyword: keyword,
    search_status: "candidate",
    match_score: score,
    match_confidence: confidence(score),
    notice_code: detail.noticeCode || "",
    notice_no: detail.noticeNo || "",
    notice_date: dateOnly(detail.noticeDate),
    notice_organ_name: detail.organ?.insttName || "",
    notice_dept_name: detail.dept?.insttFullName || detail.dept?.insttName || "",
    notice_classify: detail.noticeClassifyNm?.cmnName || "",
    notice_title: compactText(detail.title),
    notice_content: compactText(detail.content),
    notice_subject: compactText(detail.subject),
    notice_file_name: noticeFile?.name || "",
    notice_file_url: noticeFile?.url || "",
    drawing_image_count: drawingImages.length,
    attachment_count: [noticeFile, ...drawingImages].filter(Boolean).length,
    map_form_url: detail.noticeCode ? `${BASE}/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(detail.noticeCode)}` : "",
    review_note:
      score >= 50
        ? "사업명/구역명 토큰이 고시 제목 또는 내용과 강하게 일치한다. 원문 대조 후 확정 고시로 승격 가능"
        : "검색 후보이므로 사업명, 위치, 구역면적을 원문으로 대조해야 한다",
  };
}

function emptyRow(row, keywords) {
  return {
    rank: row.rank,
    focus_area: row.focus_area,
    district: row.district,
    dong: row.dong,
    project_name: row.project_name,
    present_sn: row.present_sn,
    layer_zone_name: row.layer_zone_name,
    urban_business_name: row.urban_business_name,
    search_keyword: keywords.join("; "),
    search_status: "no_candidate",
    match_score: 0,
    match_confidence: "none",
    notice_code: "",
    notice_no: "",
    notice_date: "",
    notice_organ_name: "",
    notice_dept_name: "",
    notice_classify: "",
    notice_title: "",
    notice_content: "",
    notice_subject: "",
    notice_file_name: "",
    notice_file_url: "",
    drawing_image_count: 0,
    attachment_count: 0,
    map_form_url: "",
    review_note: "서울도시공간포털 결정고시 제목 검색에서는 사업명/구역명 후보가 확인되지 않음",
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  return `${lines.join("\n")}\n`;
}

async function buildRows(inputRows) {
  const noticeDetails = new Map();
  const rows = [];
  const attachments = [];

  for (const inputRow of inputRows) {
    const keywords = searchKeywords(inputRow);
    const found = new Map();
    for (const keyword of keywords) {
      const search = await searchNotices(keyword);
      for (const item of search.content || []) {
        if (!item.noticeCode || found.has(item.noticeCode)) continue;
        found.set(item.noticeCode, keyword);
      }
    }

    const candidates = [];
    for (const [noticeCode, keyword] of found.entries()) {
      if (!noticeDetails.has(noticeCode)) noticeDetails.set(noticeCode, await fetchNotice(noticeCode));
      const detail = noticeDetails.get(noticeCode);
      const score = tokenScore(inputRow, detail);
      if (score <= 0) continue;
      candidates.push(safeDetail(inputRow, keyword, detail, score));
    }

    candidates.sort((a, b) => b.match_score - a.match_score || String(b.notice_date).localeCompare(String(a.notice_date)));
    const kept = candidates.filter((candidate) => candidate.match_confidence === "high").slice(0, 3);
    if (!kept.length) {
      rows.push(emptyRow(inputRow, keywords));
      continue;
    }
    rows.push(...kept);

    for (const row of kept) {
      const detail = noticeDetails.get(row.notice_code);
      const noticeFile = safeNoticeFile(detail);
      const drawingImages = safeDrawingImages(detail);
      for (const [index, attachment] of [noticeFile, ...drawingImages].filter(Boolean).entries()) {
        let downloadResult = { local_path: "", byte_size: "", sha256: "", download_status: SHOULD_DOWNLOAD ? "not_attempted" : "", download_error: "" };
        if (SHOULD_DOWNLOAD) downloadResult = await downloadAttachment(row, attachment);
        attachments.push({
          rank: row.rank,
          focus_area: row.focus_area,
          district: row.district,
          project_name: row.project_name,
          notice_code: row.notice_code,
          notice_no: row.notice_no,
          notice_date: row.notice_date,
          attachment_index: index + 1,
          attachment_type: attachment.type,
          attachment_name: attachment.name,
          attachment_path: attachment.path,
          attachment_url: attachment.url,
          local_path: downloadResult.local_path,
          byte_size: downloadResult.byte_size,
          sha256: downloadResult.sha256,
          download_status: downloadResult.download_status,
          download_error: downloadResult.download_error,
        });
      }
    }
  }

  return { rows, attachments };
}

async function main() {
  const inputRows = JSON.parse(await readFile(INPUT, "utf8"));
  const { rows, attachments } = await buildRows(inputRows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, OUT_JSON), `${JSON.stringify(rows, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, OUT_CSV), toCsv(rows));
  await writeFile(path.join(OUT_DIR, OUT_ATTACHMENTS_CSV), toCsv(attachments));
  console.log(
    JSON.stringify(
      {
        inputRows: inputRows.length,
        candidateRows: rows.filter((row) => row.search_status === "candidate").length,
        highConfidence: rows.filter((row) => row.match_confidence === "high").length,
        noCandidate: rows.filter((row) => row.search_status === "no_candidate").length,
        attachments: attachments.length,
        downloaded: SHOULD_DOWNLOAD ? attachments.filter((row) => row.local_path).length : 0,
        output: `data/urban/${OUT_JSON}`,
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
