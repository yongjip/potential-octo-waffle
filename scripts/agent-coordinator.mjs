#!/usr/bin/env node

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileExists } from "./lib/project-utils.mjs";

const LOCK_DIR = ".agent-locks";
const DEFAULT_TTL_MINUTES = 240;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const args = {
    command: command || "status",
    agent: "",
    task: "",
    scopes: [],
    ttlMinutes: DEFAULT_TTL_MINUTES,
    force: false,
    json: false,
  };

  for (const arg of rest) {
    if (arg === "--force") {
      args.force = true;
      continue;
    }
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg.startsWith("--agent=")) {
      args.agent = arg.slice("--agent=".length).trim();
      continue;
    }
    if (arg.startsWith("--task=")) {
      args.task = arg.slice("--task=".length).trim();
      continue;
    }
    if (arg.startsWith("--scope=")) {
      args.scopes.push(normalizeScope(arg.slice("--scope=".length).trim()));
      continue;
    }
    if (arg.startsWith("--ttl-minutes=")) {
      args.ttlMinutes = Number(arg.slice("--ttl-minutes=".length));
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function normalizeScope(scope) {
  return scope.replaceAll("\\", "/").replace(/\/+$/, "") || "global:unspecified";
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "agent";
}

function scopeLockPath(scope) {
  const hash = crypto.createHash("sha1").update(scope).digest("hex").slice(0, 10);
  return path.join(LOCK_DIR, `${slug(scope)}-${hash}.json`);
}

function nowIso() {
  return new Date().toISOString();
}

function expiresAtIso(ttlMinutes) {
  return new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
}

function isExpired(lock) {
  return lock.expires_at && Date.parse(lock.expires_at) < Date.now();
}

function isGlobalScope(scope) {
  return scope.startsWith("global:");
}

function scopesConflict(left, right) {
  if (left === right) return true;
  if (isGlobalScope(left) || isGlobalScope(right)) return false;
  return left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

async function ensureLockDir() {
  await mkdir(LOCK_DIR, { recursive: true });
}

async function readLock(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function listLocks() {
  if (!(await fileExists(LOCK_DIR))) return [];
  const entries = await readdir(LOCK_DIR, { withFileTypes: true });
  const locks = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const file = path.join(LOCK_DIR, entry.name);
    try {
      locks.push({ file, ...(await readLock(file)) });
    } catch (error) {
      locks.push({ file, scope: "(unreadable)", error: error.message });
    }
  }
  return locks.sort((a, b) => String(a.scope).localeCompare(String(b.scope)));
}

async function claim(args) {
  if (!args.agent) throw new Error("--agent is required");
  if (!args.task) throw new Error("--task is required");
  if (!args.scopes.length) throw new Error("--scope is required at least once");
  if (!Number.isFinite(args.ttlMinutes) || args.ttlMinutes <= 0) throw new Error("--ttl-minutes must be positive");

  await ensureLockDir();
  const claimed = [];
  try {
    const existingLocks = await listLocks();
    for (const scope of args.scopes) {
      const file = scopeLockPath(scope);
      const lock = {
        scope,
        agent: args.agent,
        task: args.task,
        claimed_at: nowIso(),
        expires_at: expiresAtIso(args.ttlMinutes),
        ttl_minutes: args.ttlMinutes,
      };

      for (const existing of existingLocks) {
        if (existing.error || isExpired(existing)) continue;
        if (!scopesConflict(scope, existing.scope)) continue;
        const sameLockFile = existing.file === file;
        if (!args.force || !sameLockFile) {
          throw new Error(`scope conflicts with active claim: ${scope} conflicts with ${existing.scope} by ${existing.agent} (${existing.task}), expires ${existing.expires_at}`);
        }
      }

      if (await fileExists(file)) await rm(file, { force: true });

      await writeFile(file, `${JSON.stringify(lock, null, 2)}\n`, { flag: constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY });
      claimed.push(file);
    }
  } catch (error) {
    for (const file of claimed) await rm(file, { force: true });
    throw error;
  }

  console.log(`claimed ${args.scopes.length} scope(s) for ${args.agent}/${args.task}`);
  for (const scope of args.scopes) console.log(`- ${scope}`);
}

async function release(args) {
  if (!args.agent) throw new Error("--agent is required");
  const locks = await listLocks();
  const matches = locks.filter((lock) => {
    if (lock.agent !== args.agent) return false;
    if (args.task && lock.task !== args.task) return false;
    if (args.scopes.length && !args.scopes.includes(lock.scope)) return false;
    return true;
  });

  if (!matches.length) {
    console.log("no matching locks");
    return;
  }

  for (const lock of matches) await rm(lock.file, { force: true });
  console.log(`released ${matches.length} lock(s)`);
  for (const lock of matches) console.log(`- ${lock.scope}`);
}

async function status(args) {
  const locks = await listLocks();
  if (args.json) {
    console.log(JSON.stringify({ locks }, null, 2));
    return;
  }
  if (!locks.length) {
    console.log("no active agent locks");
    return;
  }
  console.log("| Scope | Agent | Task | Claimed | Expires | State |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (const lock of locks) {
    const state = lock.error ? `error: ${lock.error}` : isExpired(lock) ? "expired" : "active";
    console.log(`| ${lock.scope} | ${lock.agent || ""} | ${lock.task || ""} | ${lock.claimed_at || ""} | ${lock.expires_at || ""} | ${state} |`);
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/agent-coordinator.mjs status [--json]
  node scripts/agent-coordinator.mjs claim --agent=name --task=task --scope=path [--scope=global:regenerate] [--ttl-minutes=240] [--force]
  node scripts/agent-coordinator.mjs release --agent=name [--task=task] [--scope=path]
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "help" || args.command === "--help" || args.command === "-h") {
    printHelp();
    return;
  }
  if (args.command === "claim") return claim(args);
  if (args.command === "release") return release(args);
  if (args.command === "status") return status(args);
  throw new Error(`Unknown command: ${args.command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
