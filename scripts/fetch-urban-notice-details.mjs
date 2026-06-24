#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);

function option(name, fallback) {
  const withEquals = argv.find((arg) => arg.startsWith(`--${name}=`));
  if (withEquals) return withEquals.slice(name.length + 3);
  const index = argv.indexOf(`--${name}`);
  if (index >= 0) {
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) return next;
  }
  return fallback;
}

const INPUT = option("input", "data/urban/urban-map-details-priority-candidates.json");
const OUT_JSON = option("out-json", "data/urban/urban-notice-details-priority-candidates.json");
const OUT_CSV = option("out-csv", "data/urban/urban-notice-details-priority-candidates.csv");
const OUT_ATTACHMENTS_CSV = option("out-attachments-csv", "data/urban/urban-notice-attachments-priority-candidates.csv");
const FILE_DIR = option("file-dir", "data/urban/files");
const BASE = "https://urban.seoul.go.kr";
const SHOULD_DOWNLOAD = argv.includes("--download");

function dateOnly(value) {
  return String(value ?? "").split("T")[0] || "";
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function matchedNoticeRows(rows) {
  const byKey = new Map();
  for (const row of rows) {
    if (!row.urban_notice_code) continue;
    if (row.match_status && row.match_status !== "matched") continue;
    const key = String(row.rank || row.shortlist_id || row.project_name || row.urban_notice_code);
    if (!byKey.has(key)) byKey.set(key, row);
  }
  return [...byKey.values()].sort((a, b) =>
    String(a.rank || a.shortlist_id || a.project_name).localeCompare(String(b.rank || b.shortlist_id || b.project_name), "ko"),
  );
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
  const rawId = String(row.rank || row.shortlist_id || row.project_name || "00");
  const safeRank = /^\d+$/.test(rawId) ? rawId.padStart(2, "0") : rawId.replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-");
  const safeNotice = row.notice_code.replace(/[^A-Za-z0-9_-]/g, "");
  const ext = path.extname(attachment.name) || "";
  const baseName = path.basename(attachment.name, ext).replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-");
  return path.join(FILE_DIR, `${safeRank}-${safeNotice}-${attachment.type}-${baseName}${ext}`);
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

async function main() {
  const urbanRows = JSON.parse(await readFile(INPUT, "utf8"));
  const noticeRows = matchedNoticeRows(urbanRows);
  const noticeCache = new Map();
  const detailRows = [];
  const attachmentRows = [];

  for (const urbanRow of noticeRows) {
    if (!noticeCache.has(urbanRow.urban_notice_code)) {
      noticeCache.set(urbanRow.urban_notice_code, await fetchNotice(urbanRow.urban_notice_code));
    }
    const detail = noticeCache.get(urbanRow.urban_notice_code);
    const noticeFile = safeNoticeFile(detail);
    const drawingImages = safeDrawingImages(detail);
    const attachments = [noticeFile, ...drawingImages].filter(Boolean);

    const row = {
      rank: urbanRow.rank,
      shortlist_id: urbanRow.shortlist_id || "",
      focus_area: urbanRow.focus_area,
      district: urbanRow.district,
      project_name: urbanRow.project_name,
      cafe_id: urbanRow.cafe_id,
      current_stage: urbanRow.current_stage,
      urban_group: urbanRow.urban_group,
      urban_record_code: urbanRow.urban_record_code,
      notice_code: detail.noticeCode || urbanRow.urban_notice_code,
      notice_no: detail.noticeNo || "",
      notice_date: dateOnly(detail.noticeDate),
      notice_classify: detail.noticeClassifyNm?.cmnName || "",
      notice_title: compactText(detail.title || urbanRow.urban_notice_title),
      notice_content: compactText(detail.content),
      notice_subject: compactText(detail.subject),
      notice_site_name: detail.siteCd?.siteName || "",
      notice_organ_name: detail.organ?.insttName || "",
      notice_dept_name: detail.dept?.insttFullName || detail.dept?.insttName || "",
      plan_project_code: detail.projCode || detail.planPrjctPub?.projCode || "",
      plan_project_name: compactText(detail.planPrjctPub?.projName),
      plan_location: compactText(detail.planPrjctPub?.location),
      plan_decision_date: dateOnly(detail.planPrjctPub?.decisionDatetime),
      notice_file_name: noticeFile?.name || "",
      notice_file_url: noticeFile?.url || "",
      drawing_image_count: drawingImages.length,
      attachment_count: attachments.length,
      map_reg_info_url: `${BASE}/view/map/mapRegInfo.pop`,
      map_form_url: `${BASE}/view/ntfc/mapForm.pop?noticeCode=${encodeURIComponent(urbanRow.urban_notice_code)}`,
    };

    detailRows.push(row);

    for (const [index, attachment] of attachments.entries()) {
      let downloadResult = { local_path: "", byte_size: "", sha256: "", download_status: SHOULD_DOWNLOAD ? "not_attempted" : "", download_error: "" };
      if (SHOULD_DOWNLOAD) {
        downloadResult = await downloadAttachment(row, attachment);
      }
      attachmentRows.push({
        rank: row.rank,
        shortlist_id: row.shortlist_id || "",
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

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await mkdir(path.dirname(OUT_CSV), { recursive: true });
  await mkdir(path.dirname(OUT_ATTACHMENTS_CSV), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(detailRows, null, 2));
  await writeFile(OUT_CSV, toCsv(detailRows));
  await writeFile(OUT_ATTACHMENTS_CSV, toCsv(attachmentRows));

  console.log(
    JSON.stringify(
      {
        notices: detailRows.length,
        uniqueNoticeCodes: noticeCache.size,
        attachments: attachmentRows.length,
        noticeFiles: attachmentRows.filter((row) => row.attachment_type === "notice_file").length,
        drawingImages: attachmentRows.filter((row) => row.attachment_type === "drawing_image").length,
        downloaded: SHOULD_DOWNLOAD ? attachmentRows.filter((row) => row.local_path).length : 0,
        failed: SHOULD_DOWNLOAD ? attachmentRows.filter((row) => row.download_status === "failed").length : 0,
      },
      null,
      2,
    ),
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const fields = Object.keys(rows[0]);
  const lines = [fields.join(",")];
  for (const row of rows) {
    lines.push(fields.map((field) => csvEscape(row[field])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
