import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(filePath) {
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text);
}

export async function walkFiles(rootDir, options = {}) {
  const {
    extensions = undefined,
    ignoreDirs = new Set([".git", "node_modules", ".idea", ".venv", "venv", "__pycache__"]),
  } = options;
  const out = [];

  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) await visit(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (extensions && !extensions.has(path.extname(entry.name))) continue;
      out.push(fullPath);
    }
  }

  if (await fileExists(rootDir)) {
    const rootStat = await stat(rootDir);
    if (rootStat.isDirectory()) await visit(rootDir);
  }

  return out.sort();
}

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export function stripMarkdownAnchor(linkTarget) {
  return linkTarget.split("#")[0];
}

export function isExternalLink(linkTarget) {
  return /^(https?:|mailto:|tel:|#)/i.test(linkTarget);
}

export function formatCount(label, count) {
  return `${label}: ${count}`;
}
