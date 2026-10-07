#!/usr/bin/env node

// Local credential storage only. This module never signs in or sends a petition.
import { constants, lstatSync } from "node:fs";
import { lstat, mkdir, open, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const PORTAL_KEYS = Object.freeze({
  epeople: ["COMPLAINTS_EPEOPLE_ID", "COMPLAINTS_EPEOPLE_PASSWORD"],
  open_go_kr: ["COMPLAINTS_OPEN_GO_ID", "COMPLAINTS_OPEN_GO_PASSWORD"],
  seoul_eungdapso: ["COMPLAINTS_SEOUL_ID", "COMPLAINTS_SEOUL_PASSWORD"],
});
const KEYS = Object.values(PORTAL_KEYS).flat();
const UID = os.userInfo().uid;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function locations(dataDir) {
  const directory = path.resolve(dataDir);
  const authDir = path.join(directory, "auth");
  return { directory, authDir, envFile: path.join(authDir, ".env"), profileFile: path.join(authDir, "runtime.json") };
}

async function privateNode(file, directory = false) {
  const info = await lstat(file);
  requireValue(!info.isSymbolicLink() && (directory ? info.isDirectory() : info.isFile()), "Private storage must use ordinary files and directories, without symbolic links");
  requireValue(UID === undefined || info.uid === UID, "Private storage belongs to a different user");
  requireValue((info.mode & 0o777) === (directory ? 0o700 : 0o600), "Private storage permissions must be 700 for directories and 600 for files");
  if (!directory) requireValue(info.nlink === 1, "Private files must not have additional hard links");
  return info;
}

// Check every component to reject a symlink in the user-controlled storage path.
// macOS system aliases (/tmp, /var) may be resolved by the caller before using --data-dir.
async function noSymlinkComponents(file) {
  let current = path.parse(file).root;
  for (const part of file.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    let info;
    try { info = await lstat(current); }
    catch (error) { if (error.code === "ENOENT") return; throw error; }
    requireValue(!info.isSymbolicLink(), "Resolve system aliases and remove symbolic links from the private storage path");
  }
}

function gitBoundary(file) {
  const cwd = path.dirname(file);
  const repo = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  requireValue(!repo.error, "Git is required to verify that private storage is excluded");
  if (repo.status !== 0) {
    let current = cwd;
    while (true) {
      let info;
      try { info = lstatSync(path.join(current, ".git")); }
      catch (error) { if (error.code !== "ENOENT") throw new Error("Cannot verify the repository boundary"); }
      requireValue(!info, "Cannot verify the repository boundary");
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return "outside_git";
  }
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", file], { cwd, stdio: "ignore" });
  requireValue(tracked.status === 1, "Private storage must not be tracked by Git");
  const ignored = spawnSync("git", ["check-ignore", "--quiet", "--", file], { cwd, stdio: "ignore" });
  requireValue(ignored.status === 0, "Private storage inside a repository must be ignored by Git");
  return "ignored";
}

async function checkDirectories(files) {
  await noSymlinkComponents(files.authDir);
  await privateNode(files.directory, true);
  await privateNode(files.authDir, true);
  gitBoundary(files.envFile);
  gitBoundary(files.profileFile);
}

async function privateRead(file) {
  await privateNode(file);
  const handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const info = await handle.stat();
    requireValue(info.isFile() && info.nlink === 1 && (info.mode & 0o777) === 0o600 && (UID === undefined || info.uid === UID), "Unsafe private file");
    requireValue(info.size <= 64 * 1024, "Private configuration exceeds the supported size");
    return await handle.readFile("utf8");
  } finally { await handle.close(); }
}

function credentialValue(value) {
  requireValue(typeof value === "string" && value.length <= 4096 && !/[\u0000-\u001f\u007f-\u009f]/u.test(value), "Credentials must be strings without line breaks or control characters");
  return value;
}

// This file uses JSON-quoted strings. It is data, not a shell script.
// Do not source it: $, backticks and backslashes must remain literal.
export function parseCredentialEnv(text) {
  const result = Object.fromEntries(KEYS.map(key => [key, ""]));
  const seen = new Set();
  for (const line of text.split(/\r?\n/u)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const match = /^([A-Z_]+)=(.*)$/u.exec(line);
    requireValue(match && KEYS.includes(match[1]) && !seen.has(match[1]), "Credential file contains an unknown key, duplicate key or invalid line");
    let value;
    try { value = JSON.parse(match[2]); }
    catch { throw new Error("Credential values must be JSON-quoted strings"); }
    result[match[1]] = credentialValue(value);
    seen.add(match[1]);
  }
  requireValue(seen.size === KEYS.length, "Credential file is missing required keys");
  return result;
}

function serializeEnv(values) {
  return "# Private local credentials. Never source, print, commit or upload this file.\n"
    + KEYS.map(key => `${key}=${JSON.stringify(credentialValue(values[key]))}`).join("\n") + "\n";
}

async function withLock(files, action) {
  const lockPath = path.join(files.authDir, ".accounts.lock");
  let lock;
  try { lock = await open(lockPath, "wx", 0o600); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("Account storage is locked; inspect the existing writer before removing its lock");
    throw error;
  }
  try { return await action(); }
  finally { await lock.close(); await unlink(lockPath); }
}

async function atomicWrite(file, text) {
  try { await privateNode(file); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const temporary = `${file}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(text, "utf8");
    await handle.sync();
    await handle.close();
    // Recheck the target immediately before replacing it.
    try { await privateNode(file); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    await rename(temporary, file);
  } finally {
    await handle.close().catch(() => {});
    await unlink(temporary).catch(error => { if (error.code !== "ENOENT") throw error; });
  }
}

function validateProfile(profile) {
  requireValue(profile && profile.version === 1 && typeof profile.expected_hostname === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,252}$/u.test(profile.expected_hostname), "Invalid account runtime profile");
  requireValue(profile.execution === "connected_mac" && profile.browser === "edge", "This runtime profile supports a connected Mac and Edge");
  requireValue(Array.isArray(profile.portals) && profile.portals.length === 3 && new Set(profile.portals).size === 3 && profile.portals.every(portal => Object.hasOwn(PORTAL_KEYS, portal)), "Runtime profile must contain the three supported portals");
  requireValue(profile.session_state === "not_verified", "A stored credential must not be represented as a verified browser session");
  return profile;
}

export async function initializeAccounts(dataDir, expectedHostname) {
  const profile = validateProfile({ version: 1, expected_hostname: expectedHostname, execution: "connected_mac", browser: "edge", portals: Object.keys(PORTAL_KEYS), session_state: "not_verified" });
  const files = locations(dataDir);
  await noSymlinkComponents(files.authDir);
  await mkdir(files.directory, { recursive: true, mode: 0o700 });
  await mkdir(files.authDir, { mode: 0o700 }).catch(error => { if (error.code !== "EEXIST") throw error; });
  await checkDirectories(files);
  return withLock(files, async () => {
    let existing;
    try { existing = validateProfile(JSON.parse(await privateRead(files.profileFile))); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    requireValue(!existing || existing.expected_hostname === expectedHostname, "Existing runtime belongs to another host; do not retarget a credential store silently");
    if (!existing) await atomicWrite(files.profileFile, `${JSON.stringify(profile, null, 2)}\n`);
    try { parseCredentialEnv(await privateRead(files.envFile)); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      await atomicWrite(files.envFile, serializeEnv(Object.fromEntries(KEYS.map(key => [key, ""]))));
    }
    return { profile: files.profileFile, credentials: files.envFile, existing: Boolean(existing) };
  });
}

async function loadPrivate(dataDir) {
  const files = locations(dataDir);
  await checkDirectories(files);
  let profile;
  try { profile = validateProfile(JSON.parse(await privateRead(files.profileFile))); }
  catch (error) {
    if (error instanceof SyntaxError) throw new Error("Invalid runtime JSON");
    throw error;
  }
  requireValue(profile.expected_hostname === os.hostname(), "Execution host does not match the configured Mac; credentials were not loaded");
  return { files, profile, values: parseCredentialEnv(await privateRead(files.envFile)) };
}

export async function storeCredentials(dataDir, portal, id, password) {
  requireValue(Object.hasOwn(PORTAL_KEYS, portal), "Unknown portal");
  credentialValue(id);
  credentialValue(password);
  requireValue(id.trim().length > 0 && id === id.trim() && password.length > 0, "Enter a nonempty login ID and password");
  const files = locations(dataDir);
  await checkDirectories(files);
  return withLock(files, async () => {
    const { values } = await loadPrivate(dataDir);
    const [idKey, passwordKey] = PORTAL_KEYS[portal];
    values[idKey] = id;
    values[passwordKey] = password;
    await atomicWrite(files.envFile, serializeEnv(values));
    return "credentials_stored_session_not_verified";
  });
}

// Use only inside a supported credential adapter. Never print this return value.
// A loaded credential is not a verified account, login or filing.
export async function loadPortalCredentials(dataDir, portal) {
  requireValue(Object.hasOwn(PORTAL_KEYS, portal), "Unknown portal");
  const { values } = await loadPrivate(dataDir);
  const [idKey, passwordKey] = PORTAL_KEYS[portal];
  requireValue(values[idKey] && values[passwordKey], "Portal credentials are not stored yet");
  return { id: values[idKey], password: values[passwordKey] };
}

export async function accountStatus(dataDir) {
  const { files, profile, values } = await loadPrivate(dataDir);
  return {
    execution_host_matches: true,
    execution: profile.execution,
    browser: profile.browser,
    credentials_path: files.envFile,
    credential_file_mode: "600",
    storage_directory_mode: "700",
    git_boundary: gitBoundary(files.envFile),
    portals: Object.fromEntries(Object.entries(PORTAL_KEYS).map(([portal, [idKey, passwordKey]]) => [portal, {
      id_stored: Boolean(values[idKey]),
      password_stored: Boolean(values[passwordKey]),
      credentials_ready: Boolean(values[idKey] && values[passwordKey]),
      browser_session: "not_verified",
      portal_automation: "not_connected",
    }])),
    fully_unattended_submission_verified: false,
  };
}

async function hiddenInput(label) {
  requireValue(process.stdin.isTTY && process.stdout.isTTY && typeof process.stdin.setRawMode === "function", "Run store in your own interactive terminal; do not enter credentials in chat or command arguments");
  process.stdout.write(label);
  const previousRaw = process.stdin.isRaw;
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let input = "";
    function finish(error) {
      process.stdin.off("data", onData);
      process.stdin.off("end", onEnd);
      process.stdin.off("error", onError);
      process.stdin.setRawMode(Boolean(previousRaw));
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error); else resolve(input);
    }
    function onData(chunk) {
      for (const char of chunk) {
        if (char === "\u0003") { finish(new Error("Credential entry cancelled; no changes saved")); return; }
        if (char === "\r" || char === "\n") { finish(); return; }
        if (char === "\u007f" || char === "\b") input = Array.from(input).slice(0, -1).join("");
        else if (char === "\u0015") input = "";
        else {
          if (/[\u0000-\u001f\u007f-\u009f]/u.test(char) || input.length >= 4096) { finish(new Error("Unsupported credential input; no changes saved")); return; }
          input += char;
        }
      }
    }
    function onEnd() { finish(new Error("Credential entry ended; no changes saved")); }
    function onError() { finish(new Error("Credential entry failed; no changes saved")); }
    process.stdin.on("data", onData);
    process.stdin.once("end", onEnd);
    process.stdin.once("error", onError);
  });
}

async function main() {
  const [command = "help", ...args] = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    const match = /^--(data-dir|host|portal)=(.+)$/u.exec(arg);
    requireValue(match && !Object.hasOwn(options, match[1]), "Unsupported or duplicate option; credential values are never accepted as arguments");
    options[match[1]] = match[2];
  }
  const dataDir = path.resolve(options["data-dir"] ?? path.join(ROOT, "data/complaints"));
  if (command === "help") {
    console.log("accounts.mjs init --host=YOUR_MAC_HOSTNAME | store --portal=all|epeople|open_go_kr|seoul_eungdapso | status | doctor\nOptional: --data-dir=/absolute/private/path\nStore prompts hide both values. This tool does not create accounts, sign in, transfer secrets or submit complaints.");
    return;
  }
  requireValue(["init", "store", "status", "doctor"].includes(command), "Unknown command");
  requireValue(!options.host || command === "init", "--host is accepted only for init");
  requireValue(!options.portal || command === "store", "--portal is accepted only for store");
  if (command === "init") {
    requireValue(options.host, "Specify the user-selected Mac hostname with --host");
    console.log(JSON.stringify(await initializeAccounts(dataDir, options.host), null, 2));
  } else if (command === "store") {
    requireValue(options.portal === "all" || Object.hasOwn(PORTAL_KEYS, options.portal), "Specify a supported portal or all with --portal");
    await loadPrivate(dataDir);
    for (const portal of options.portal === "all" ? Object.keys(PORTAL_KEYS) : [options.portal]) {
      console.log(`Portal: ${portal}`);
      const id = await hiddenInput("Login ID (hidden): ");
      const password = await hiddenInput("Existing password (hidden): ");
      const confirmation = await hiddenInput("Repeat existing password (hidden): ");
      requireValue(password === confirmation, "Password confirmation differs; this portal was not saved");
      console.log(await storeCredentials(dataDir, portal, id, password));
    }
  } else {
    const status = await accountStatus(dataDir);
    console.log(JSON.stringify(status, null, 2));
    if (command === "doctor" && Object.values(status.portals).some(portal => !portal.credentials_ready)) process.exitCode = 2;
  }
}

if (typeof process !== "undefined" && process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    // File contents and credentials must not appear in diagnostics.
    console.error(error.code ? "Private account storage is unavailable; check initialization and permissions" : error.message);
    process.exitCode = 1;
  });
}
