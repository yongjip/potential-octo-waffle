#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  fileExists,
  formatCount,
  isExternalLink,
  readJson,
  stripMarkdownAnchor,
  toPosix,
  walkFiles,
} from "./lib/project-utils.mjs";

const REQUIRED_FILES = [
  "README.md",
  "INSTRUCTIONS.md",
  "analysis/README.md",
  "KNOWLEDGE_BASE.md",
  "knowledge/README.md",
  "knowledge/domain-registry.json",
  "knowledge/open-data-governance.md",
  "PROJECT_MANAGEMENT.md",
  "MULTI_AGENT_WORKFLOW.md",
  "data/agents/README.md",
  "analysis/current-research-operating-guide.md",
  "analysis/llm-research-handoff-guide.md",
  "analysis/llm-error-correction-playbook.md",
  "analysis/research-session-playbook.md",
  "analysis/research-goal-completion-audit.md",
  "scripts/agent-coordinator.mjs",
  "scripts/instructions-doctor.mjs",
  "scripts/kb-doctor.mjs",
  "scripts/regenerate-research-artifacts.mjs",
];

const KEY_TRIPLETS = [
  "analysis/project-comparison-matrix",
  "analysis/research-status-dashboard",
  "analysis/current-research-operating-guide",
  "analysis/research-session-playbook",
  "analysis/research-completion-cockpit",
  "analysis/research-goal-completion-audit",
  "analysis/project-evidence-binder",
  "analysis/core-value-confirmation-ledger",
];

const LINK_SCAN_FILES = [
  "README.md",
  "INSTRUCTIONS.md",
  "instructions/evidence-policy.md",
  "instructions/agent-workflow.md",
  "instructions/self-correction.md",
  "KNOWLEDGE_BASE.md",
  "knowledge/README.md",
  "knowledge/open-data-governance.md",
  "analysis/README.md",
  "PROJECT_MANAGEMENT.md",
  "MULTI_AGENT_WORKFLOW.md",
  "data/agents/README.md",
  "analysis/llm-research-handoff-guide.md",
  "analysis/llm-error-correction-playbook.md",
  "scripts/README.md",
];

function markdownLinks(text) {
  const links = [];
  const regex = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text))) {
    const raw = match[1].trim();
    const target = raw.replace(/^<|>$/g, "");
    links.push({ target, index: match.index });
  }
  return links;
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

async function checkRequiredFiles(errors) {
  for (const file of REQUIRED_FILES) {
    if (!(await fileExists(file))) errors.push(`missing required file: ${file}`);
  }
}

async function checkTriplets(warnings) {
  for (const base of KEY_TRIPLETS) {
    for (const ext of [".md", ".csv", ".json"]) {
      const file = `${base}${ext}`;
      if (!(await fileExists(file))) warnings.push(`missing expected generated pair: ${file}`);
    }
  }
}

async function checkJson(errors) {
  const jsonFiles = [
    ...(await walkFiles("analysis", { extensions: new Set([".json"]) })),
    ...(await walkFiles("data", { extensions: new Set([".json"]) })),
  ];
  let parsed = 0;
  for (const file of jsonFiles) {
    try {
      await readJson(file);
      parsed += 1;
    } catch (error) {
      errors.push(`invalid JSON: ${toPosix(file)} (${error.message})`);
    }
  }
  return parsed;
}

function isReviewGatedDataPath(filePath) {
  const normalized = toPosix(path.normalize(filePath));
  return normalized.startsWith("data/") && !normalized.startsWith("data/agents/");
}

async function checkMarkdownLinks(errors, warnings) {
  let checked = 0;
  for (const file of LINK_SCAN_FILES) {
    if (!(await fileExists(file))) continue;
    const text = await readFile(file, "utf8");
    const links = markdownLinks(text);
    const baseDir = path.dirname(file);
    for (const link of links) {
      const withoutAnchor = stripMarkdownAnchor(link.target);
      if (!withoutAnchor || isExternalLink(link.target)) continue;
      const decoded = decodeURI(withoutAnchor);
      const resolved = path.normalize(path.join(baseDir, decoded));
      checked += 1;
      if (!(await fileExists(resolved))) {
        if (isReviewGatedDataPath(resolved)) {
          warnings.push(`review-gated data link not present in checkout: ${file}:${lineNumber(text, link.index)} -> ${link.target}`);
          continue;
        }
        errors.push(`broken markdown link: ${file}:${lineNumber(text, link.index)} -> ${link.target}`);
      }
    }
  }
  return checked;
}

async function main() {
  const errors = [];
  const warnings = [];

  await checkRequiredFiles(errors);
  await checkTriplets(warnings);
  const jsonParsed = await checkJson(errors);
  const linksChecked = await checkMarkdownLinks(errors, warnings);

  console.log("Project doctor");
  console.log(formatCount("required files", REQUIRED_FILES.length));
  console.log(formatCount("json parsed", jsonParsed));
  console.log(formatCount("markdown links checked", linksChecked));
  console.log(formatCount("warnings", warnings.length));
  console.log(formatCount("errors", errors.length));

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length) {
    console.error("\nErrors:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
