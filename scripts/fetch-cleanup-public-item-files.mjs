#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://cleanup.seoul.go.kr";

function parseArgs(argv) {
  const args = {
    cafeId: "",
    project: "",
    items: [],
    outRoot: "data/cleanup/files",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--cafe-id") args.cafeId = argv[++i] || "";
    else if (arg === "--project") args.project = argv[++i] || "";
    else if (arg === "--out-root") args.outRoot = argv[++i] || args.outRoot;
    else if (arg === "--item") {
      const raw = argv[++i] || "";
      const [id, slug = id] = raw.split("=");
      if (id) args.items.push({ id, slug });
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!args.cafeId) throw new Error("--cafe-id is required");
  if (!args.project) throw new Error("--project is required");
  if (args.items.length === 0) throw new Error("at least one --item id=slug is required");
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/fetch-cleanup-public-item-files.mjs \\
    --cafe-id 680900000688Q62 \\
    --project gaepo6_7 \\
    --item 1000139=hug-loan-guarantee
`);
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value) {
  return decodeEntities(String(value || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(text, regex) {
  return text.match(regex)?.[1]?.trim() || "";
}

function hiddenValue(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return firstMatch(html, new RegExp(`name=["']${escaped}["'][^>]*value=["']([^"']*)`, "i"));
}

function safeName(name) {
  return String(name || "file")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadExistingManifest(pathname) {
  try {
    return JSON.parse(await readFile(pathname, "utf8"));
  } catch {
    return { generated_at: "", items: [] };
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": "Mozilla/5.0 Codex research collector",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

async function fetchJson(url, options = {}) {
  const text = await fetchText(url, options);
  return JSON.parse(text);
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 Codex research collector" },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function detailUrl(cafeId, othbcListSn) {
  const params = new URLSearchParams({
    cafeId,
    cpage: "1",
    searchCode: "",
    searchValue: "",
    signguCd: "",
    othbcListSn,
  });
  return `${BASE}/assc/bidpblanc/vscr.do?${params.toString()}`;
}

function fileUrl(file) {
  const params = new URLSearchParams({
    filePath: file.FILE_PATH,
    fileName: file.FILE_ID,
    saveAs: file.FILE_NM,
  });
  return `${BASE}/service/opendata/transfer-atchmnFl/fileDownLoad.do?${params.toString()}`;
}

function extractDetail(html) {
  return {
    title: stripHtml(firstMatch(html, /<h3[^>]*class=["']b-tit["'][^>]*>([\s\S]*?)<\/h3>/i)),
    registered_at: firstMatch(html, /등록일\s*:\s*([0-9-]+)/),
    notice_date: stripHtml(firstMatch(html, /<span>\s*공고일자\s*:\s*<\/span>\s*([\s\S]*?)<\/div>/i)),
    bid_deadline: stripHtml(firstMatch(html, /<span>\s*입찰마감일시\s*:\s*<\/span>\s*([\s\S]*?)<\/div>/i)),
    organization: stripHtml(firstMatch(html, /추진위원회\/조합명\s*:\s*([^<]+)/)),
    folder_id: hiddenValue(html, "folderId"),
    attachment_sn: hiddenValue(html, "atchmnflSn"),
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const projectDir = path.join(args.outRoot, args.project);
  await mkdir(projectDir, { recursive: true });
  const manifestPath = path.join(projectDir, "manifest.json");
  const existing = await loadExistingManifest(manifestPath);
  const manifest = {
    generated_at: new Date().toISOString(),
    source: "cleanup.seoul.go.kr assc/bidpblanc public item attachments",
    cafe_id: args.cafeId,
    project: args.project,
    items: existing.items || [],
  };
  const byId = new Map(manifest.items.map((item) => [String(item.othbcListSn), item]));

  for (const item of args.items) {
    const url = detailUrl(args.cafeId, item.id);
    const html = await fetchText(url);
    const detail = extractDetail(html);
    if (!detail.folder_id || !detail.attachment_sn) {
      throw new Error(`missing attachment inputs for ${item.id}`);
    }

    const form = new URLSearchParams({
      folderId: detail.folder_id,
      atchmnflSn: detail.attachment_sn,
    });
    const attachmentResponse = await fetchJson(`${BASE}/service/opendata/transfer-atchmnFl/ajaxAtchmnFlList.do`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: form,
    });
    const attachList = attachmentResponse.attachList || [];
    const itemDir = path.join(projectDir, `${item.id}-${item.slug}`);
    await mkdir(itemDir, { recursive: true });
    await writeFile(path.join(itemDir, "detail.html"), html, "utf8");

    const files = [];
    for (const file of attachList) {
      const filename = safeName(file.FILE_NM);
      const outPath = path.join(itemDir, filename);
      const buffer = await fetchBuffer(fileUrl(file));
      await writeFile(outPath, buffer);
      files.push({
        file_name: file.FILE_NM,
        file_size: file.FILE_SIZE,
        file_date: file.FILE_DATE,
        file_id: file.FILE_ID,
        file_path: file.FILE_PATH,
        local_path: outPath,
        download_url: fileUrl(file),
      });
    }

    const record = {
      othbcListSn: item.id,
      slug: item.slug,
      detail_url: url,
      ...detail,
      attachment_count: files.length,
      local_dir: itemDir,
      local_html_path: path.join(itemDir, "detail.html"),
      files,
    };
    byId.set(String(item.id), record);
    console.log(`${item.id}: ${detail.title} (${files.length} files)`);
  }

  manifest.items = Array.from(byId.values()).sort((a, b) => String(a.othbcListSn).localeCompare(String(b.othbcListSn)));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`manifest: ${manifestPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
