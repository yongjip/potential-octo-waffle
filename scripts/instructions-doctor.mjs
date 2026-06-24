#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileExists, formatCount, isExternalLink, readJson, stripMarkdownAnchor } from "./lib/project-utils.mjs";

const REQUIRED_FILES = [
  "INSTRUCTIONS.md",
  "instructions/evidence-policy.md",
  "instructions/agent-workflow.md",
  "instructions/self-correction.md",
];

function markdownLinks(text) {
  const links = [];
  const regex = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(text))) {
    const raw = match[1].trim();
    links.push({ target: raw.replace(/^<|>$/g, ""), index: match.index });
  }
  return links;
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

async function checkMarkdownLinks(files, errors) {
  let checked = 0;
  for (const file of files) {
    if (!(await fileExists(file))) continue;
    const text = await readFile(file, "utf8");
    for (const link of markdownLinks(text)) {
      const withoutAnchor = stripMarkdownAnchor(link.target);
      if (!withoutAnchor || isExternalLink(link.target)) continue;
      checked += 1;
      const resolved = path.normalize(path.join(path.dirname(file), decodeURI(withoutAnchor)));
      if (!(await fileExists(resolved))) errors.push(`broken markdown link: ${file}:${lineNumber(text, link.index)} -> ${link.target}`);
    }
  }
  return checked;
}

async function main() {
  const errors = [];
  const warnings = [];

  for (const file of REQUIRED_FILES) {
    if (!(await fileExists(file))) errors.push(`missing instruction file: ${file}`);
  }

  const registry = await readJson("knowledge/domain-registry.json").catch((error) => {
    errors.push(`invalid domain registry: ${error.message}`);
    return { domains: [] };
  });

  const domainPromptFiles = [];
  for (const domain of registry.domains || []) {
    const prompt = `instructions/domain-prompts/${domain.domain_id}.md`;
    domainPromptFiles.push(prompt);
    if (!(await fileExists(prompt))) errors.push(`missing domain prompt for ${domain.domain_id}: ${prompt}`);
    if (domain.primary_readme && !(await fileExists(domain.primary_readme))) errors.push(`missing domain README for ${domain.domain_id}: ${domain.primary_readme}`);
  }

  const filesToScan = [...REQUIRED_FILES, ...domainPromptFiles];
  const linksChecked = await checkMarkdownLinks(filesToScan, errors);

  const instructionsText = await readFile("INSTRUCTIONS.md", "utf8").catch(() => "");
  if (!instructionsText.includes("Canonical language: English")) warnings.push("INSTRUCTIONS.md should state canonical language policy");
  if (!instructionsText.includes("structure-confirmation mode")) warnings.push("INSTRUCTIONS.md should state structure-confirmation mode");

  console.log("Instructions doctor");
  console.log(formatCount("required files", REQUIRED_FILES.length));
  console.log(formatCount("domain prompts", domainPromptFiles.length));
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
