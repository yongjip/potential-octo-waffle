import test from "node:test";
import assert from "node:assert/strict";
import { chmod, link, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { accountStatus, initializeAccounts, loadPortalCredentials, parseCredentialEnv, PORTAL_KEYS, storeCredentials } from "./accounts.mjs";

const CLI = fileURLToPath(new URL("./accounts.mjs", import.meta.url));
async function fixture(action) {
  const dir = await mkdtemp(path.join(await realpath(os.tmpdir()), "complaints-accounts-"));
  try { await action(dir); }
  finally { await rm(dir, { recursive: true, force: true }); }
}
const envFile = dir => path.join(dir, "auth/.env");
const fakePassword = "fixture-only-'\"$`\\# password";

test("initialization is private, idempotent and does not claim a login", () => fixture(async dir => {
  const paths = await initializeAccounts(dir, os.hostname());
  assert.equal((await lstat(path.join(dir, "auth"))).mode & 0o777, 0o700);
  assert.equal((await lstat(paths.credentials)).mode & 0o777, 0o600);
  assert.equal((await lstat(paths.profile)).mode & 0o777, 0o600);
  const status = await accountStatus(dir);
  assert.equal(status.fully_unattended_submission_verified, false);
  assert.ok(Object.values(status.portals).every(p => !p.credentials_ready && p.browser_session === "not_verified"));
  await storeCredentials(dir, "epeople", "fixture-id", fakePassword);
  await initializeAccounts(dir, os.hostname());
  assert.deepEqual(await loadPortalCredentials(dir, "epeople"), { id: "fixture-id", password: fakePassword });
}));

test("parser preserves special characters without executing or expanding them", () => fixture(async dir => {
  await initializeAccounts(dir, os.hostname());
  await storeCredentials(dir, "seoul_eungdapso", "fixture-seoul", fakePassword);
  const values = parseCredentialEnv(await readFile(envFile(dir), "utf8"));
  assert.equal(values.COMPLAINTS_SEOUL_PASSWORD, fakePassword);
  assert.equal(values.COMPLAINTS_EPEOPLE_PASSWORD, "");
  await assert.rejects(storeCredentials(dir, "epeople", "fixture-id", "bad\npassword"), /control characters/);
}));

test("diagnostics and error output do not include credential values", () => fixture(async dir => {
  await initializeAccounts(dir, os.hostname());
  await storeCredentials(dir, "epeople", "fixture-private-id", fakePassword);
  const status = spawnSync(process.execPath, [CLI, "status", `--data-dir=${dir}`], { encoding: "utf8" });
  assert.equal(status.status, 0);
  assert.doesNotMatch(status.stdout + status.stderr, /fixture-private-id|fixture-only/);
  assert.equal(JSON.parse(status.stdout).portals.epeople.credentials_ready, true);
  const doctor = spawnSync(process.execPath, [CLI, "doctor", `--data-dir=${dir}`], { encoding: "utf8" });
  assert.equal(doctor.status, 2);
  const invalid = spawnSync(process.execPath, [CLI, "store", "--password=fixture-secret-argument"], { encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.doesNotMatch(invalid.stdout + invalid.stderr, /fixture-secret-argument/);
  const nonTTY = spawnSync(process.execPath, [CLI, "store", "--portal=epeople", `--data-dir=${dir}`], { encoding: "utf8", input: "fixture-secret-input\n" });
  assert.equal(nonTTY.status, 1);
  assert.doesNotMatch(nonTTY.stdout + nonTTY.stderr, /fixture-secret-input/);
}));

test("wrong execution host blocks reading or overwriting credentials", () => fixture(async dir => {
  await initializeAccounts(dir, "different-fixture-host.local");
  const before = await readFile(envFile(dir), "utf8");
  await assert.rejects(loadPortalCredentials(dir, "epeople"), /host does not match/);
  await assert.rejects(storeCredentials(dir, "epeople", "fixture-id", fakePassword), /host does not match/);
  assert.equal(await readFile(envFile(dir), "utf8"), before);
  await assert.rejects(initializeAccounts(dir, os.hostname()), /another host/);
}));

test("read and write reject permissive files, symlinks and hard links", () => fixture(async dir => {
  await initializeAccounts(dir, os.hostname());
  await chmod(envFile(dir), 0o644);
  await assert.rejects(accountStatus(dir), /permissions/);
  await assert.rejects(storeCredentials(dir, "epeople", "fixture-id", fakePassword), /permissions/);
  await chmod(envFile(dir), 0o600);
  const other = path.join(dir, "other-private-file");
  await link(envFile(dir), other);
  await assert.rejects(accountStatus(dir), /hard links/);
  await unlink(other);
  await unlink(envFile(dir));
  await writeFile(other, "fixture-only", { mode: 0o600 });
  await symlink(other, envFile(dir));
  await assert.rejects(accountStatus(dir), /symbolic links/);
  await assert.rejects(storeCredentials(dir, "epeople", "fixture-id", fakePassword), /symbolic links/);
  assert.equal(await readFile(other, "utf8"), "fixture-only");
}));

test("storage rejects symlinked directories and concurrent writers", () => fixture(async dir => {
  const real = path.join(dir, "real");
  const alias = path.join(dir, "alias");
  await mkdir(real, { mode: 0o700 });
  await symlink(real, alias);
  await assert.rejects(initializeAccounts(alias, os.hostname()), /symbolic links/);
  await initializeAccounts(real, os.hostname());
  await writeFile(path.join(real, "auth/.accounts.lock"), "fixture writer", { mode: 0o600 });
  await assert.rejects(storeCredentials(real, "epeople", "fixture-id", fakePassword), /locked/);
}));

test("malformed secret files fail without putting their content in errors", () => fixture(async dir => {
  await initializeAccounts(dir, os.hostname());
  const original = await readFile(envFile(dir), "utf8");
  for (const content of [original + "UNEXPECTED=\"fixture-private-value\"\n", original + 'COMPLAINTS_EPEOPLE_ID="duplicate"\n', original.replace('COMPLAINTS_EPEOPLE_ID=""', 'COMPLAINTS_EPEOPLE_ID=fixture-invalid-value')]) {
    await writeFile(envFile(dir), content, { mode: 0o600 });
    await assert.rejects(accountStatus(dir), error => {
      assert.doesNotMatch(error.message, /fixture-private-value|fixture-invalid-value|duplicate"/);
      return true;
    });
  }
  assert.throws(() => parseCredentialEnv(""), /missing required keys/);
  assert.equal(Object.values(PORTAL_KEYS).flat().length, 6);
}));

test("credentials inside Git require ignore rules and must remain untracked", () => fixture(async dir => {
  const init = spawnSync("git", ["init", "--quiet", dir], { stdio: "ignore" });
  assert.equal(init.status, 0);
  await assert.rejects(initializeAccounts(dir, os.hostname()), /ignored by Git/);
  await writeFile(path.join(dir, ".gitignore"), "auth/\n");
  await initializeAccounts(dir, os.hostname());
  assert.equal((await accountStatus(dir)).git_boundary, "ignored");
  const add = spawnSync("git", ["-C", dir, "add", "--force", "auth/.env"], { stdio: "ignore" });
  assert.equal(add.status, 0);
  await assert.rejects(accountStatus(dir), /not be tracked/);
}));
