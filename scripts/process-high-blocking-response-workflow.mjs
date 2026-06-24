#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "high-blocking-response-workflow-run.md");
const OUT_JSON = path.join(OUT_DIR, "high-blocking-response-workflow-run.json");

function kstDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const UPDATED_AT = `${kstDate()} KST`;

function parseArgs(argv) {
  return {
    write: argv.includes("--write"),
    regenerate: argv.includes("--regenerate") || argv.includes("--write"),
    help: argv.includes("--help") || argv.includes("-h"),
  };
}

function printHelp() {
  console.log(`Usage: node scripts/process-high-blocking-response-workflow.mjs [--write] [--regenerate]

Default mode is safe dry-run:
  1. validate high-blocking response intake
  2. regenerate intake guide
  3. generate decision drafts
  4. run apply-high-blocking-response-decisions dry-run
  5. write workflow report

Recommended intake helpers:
  node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write
  node scripts/record-high-blocking-response.mjs --rank=NN --status=... --received-at=YYYY-MM-DD --responder='담당부서' --write

Options:
  --write       append applyable decisions, but only when validation has zero errors
  --regenerate run full research artifact regeneration after a successful write`);
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(command, args, { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({
        command: [command, ...args].join(" "),
        exit_code: code,
        duration_ms: Date.now() - startedAt,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        parsed_stdout: parseJson(stdout),
      });
    });
  });
}

function parseJson(text) {
  const value = String(text || "").trim();
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function runStep(steps, id, command, args) {
  const result = await runCommand(command, args);
  steps.push({ id, ...result });
  return result;
}

function hasValidationErrors(step) {
  return Number(step?.parsed_stdout?.errors || 0) > 0;
}

function appendableCount(step) {
  return Number(step?.parsed_stdout?.appendable || 0);
}

function markdown(report) {
  const rows = report.steps
    .map(
      (step) =>
        `| ${step.id} | ${step.exit_code} | ${step.duration_ms} | ${String(step.command).replaceAll("|", "/")} | ${compact(step.stdout || step.stderr, 180)} |`,
    )
    .join("\n");
  return `# High Blocking Response Workflow Run

작성 기준: ${UPDATED_AT}

이 문서는 \`data/review/high-blocking-source-response-intake.json\`에 회신을 입력한 뒤 decision 반영까지 이어지는 후처리 workflow 실행 결과다. 기본 실행은 dry-run이며, \`--write\`가 있을 때만 decision 장부를 수정한다.

## 요약

| 항목 | 값 |
| --- | --- |
| mode | ${report.mode} |
| status | ${report.status} |
| validation_errors | ${report.validation_errors} |
| appendable_decisions | ${report.appendable_decisions} |
| wrote_decisions | ${report.wrote_decisions} |
| regenerated | ${report.regenerated} |

## Steps

| step | exit | ms | command | output |
| --- | ---: | ---: | --- | --- |
${rows || "| 없음 |  |  |  |  |"}

## Next

${report.next_action}
`;
}

function compact(value, limit) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}...`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const steps = [];
  const validation = await runStep(steps, "intake-validation", "node", ["scripts/generate-high-blocking-intake-validation.mjs"]);
  await runStep(steps, "intake-guide", "node", ["scripts/generate-high-blocking-response-intake-guide.mjs"]);
  await runStep(steps, "decision-drafts", "node", ["scripts/generate-high-blocking-response-decision-drafts.mjs"]);
  const dryRun = await runStep(steps, "apply-dry-run", "node", ["scripts/apply-high-blocking-response-decisions.mjs"]);

  let writeStep = null;
  let regenerateStep = null;
  const validationErrors = hasValidationErrors(validation);
  const appendable = appendableCount(dryRun);
  if (args.write && !validationErrors && appendable > 0) {
    writeStep = await runStep(steps, "apply-write", "node", ["scripts/apply-high-blocking-response-decisions.mjs", "--write"]);
    if (args.regenerate && writeStep.exit_code === 0) {
      regenerateStep = await runStep(steps, "regenerate", "node", ["scripts/regenerate-research-artifacts.mjs"]);
    }
  }

  const failed = steps.find((step) => step.exit_code !== 0);
  const status = failed
    ? "failed"
    : validationErrors
      ? "validation_failed"
      : args.write && appendable > 0
        ? "write_completed"
        : "dry_run_completed";
  const nextAction = failed
    ? `실패 step ${failed.id}의 stderr/stdout을 확인한다.`
    : validationErrors
      ? "analysis/high-blocking-intake-validation.md의 error를 먼저 0으로 만든다."
      : appendable > 0 && !args.write
        ? "decision 초안이 append 가능하면 --write로 다시 실행한다."
        : appendable > 0
          ? "write 반영 후 research-goal-completion-audit의 final_verdict를 확인한다."
          : "아직 append 가능한 회신이 없다. 외부 회신을 intake에 보강한다.";

  const report = {
    generated_at: UPDATED_AT,
    mode: args.write ? "write" : "dry_run",
    status,
    validation_errors: Number(validation.parsed_stdout?.errors || 0),
    appendable_decisions: appendable,
    wrote_decisions: Boolean(writeStep?.parsed_stdout?.wrote),
    regenerated: Boolean(regenerateStep && regenerateStep.exit_code === 0),
    next_action: nextAction,
    steps,
    outputs: [OUT_MD, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(report));
  console.log(JSON.stringify({ status: report.status, appendable: report.appendable_decisions, wrote: report.wrote_decisions, output: "analysis/high-blocking-response-workflow-run.{md,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
