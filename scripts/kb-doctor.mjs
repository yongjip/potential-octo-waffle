#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileExists, formatCount, readJson } from "./lib/project-utils.mjs";

const REQUIRED_FILES = [
  "KNOWLEDGE_BASE.md",
  "knowledge/README.md",
  "knowledge/domain-registry.json",
  "knowledge/open-data-governance.md",
  "knowledge/schemas/source-record.schema.json",
  "knowledge/schemas/entity-record.schema.json",
  "knowledge/schemas/observation-record.schema.json",
  "knowledge/schemas/assertion-record.schema.json",
  "knowledge/schemas/analysis-record.schema.json",
  "knowledge/schemas/decision-record.schema.json",
  "knowledge/schemas/correction-record.schema.json",
  "knowledge/migration/korea-real-estate-legacy-map.md",
  "knowledge/samples/source-record.sample.jsonl",
  "knowledge/samples/entity-record.sample.jsonl",
  "knowledge/samples/assertion-record.sample.jsonl",
  "knowledge/samples/correction-record.sample.jsonl",
  "knowledge/templates/domain-readme.md",
  "knowledge/templates/source-record.example.json",
];

const SCHEMA_FILES = [
  "knowledge/schemas/source-record.schema.json",
  "knowledge/schemas/entity-record.schema.json",
  "knowledge/schemas/observation-record.schema.json",
  "knowledge/schemas/assertion-record.schema.json",
  "knowledge/schemas/analysis-record.schema.json",
  "knowledge/schemas/decision-record.schema.json",
  "knowledge/schemas/correction-record.schema.json",
];

const SAMPLE_JSONL_FILES = [
  {
    file: "knowledge/samples/source-record.sample.jsonl",
    expectedRecordType: "source_record",
    minimumRows: 1,
  },
  {
    file: "knowledge/samples/entity-record.sample.jsonl",
    expectedRecordType: "entity_record",
    minimumRows: 1,
  },
  {
    file: "knowledge/samples/assertion-record.sample.jsonl",
    expectedRecordType: "assertion_record",
    minimumRows: 3,
  },
  {
    file: "knowledge/samples/correction-record.sample.jsonl",
    expectedRecordType: "correction_record",
    minimumRows: 1,
  },
];

const REQUIRED_RECORD_FIELDS = ["id", "domain_id", "record_type", "status", "basis_date", "observed_at", "source_id", "visibility", "agent", "created_at"];
const ALLOWED_STATUSES = new Set(["confirmed", "pending", "conflict", "deferred", "context_only", "rejected"]);
const ALLOWED_VISIBILITY = new Set(["public_candidate", "private", "restricted", "unknown_license"]);

async function readJsonl(file, errors) {
  const text = await readFile(file, "utf8").catch((error) => {
    errors.push(`cannot read JSONL ${file}: ${error.message}`);
    return "";
  });
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    try {
      rows.push(JSON.parse(line));
    } catch (error) {
      errors.push(`invalid JSONL ${file}:${index + 1} (${error.message})`);
    }
  }
  return rows;
}

function validateSampleRow(row, file, index, expectedRecordType, errors) {
  for (const field of REQUIRED_RECORD_FIELDS) {
    if (row[field] === undefined || row[field] === "") errors.push(`sample ${file}:${index + 1} missing ${field}`);
  }
  if (row.record_type !== expectedRecordType) errors.push(`sample ${file}:${index + 1} expected record_type=${expectedRecordType}`);
  if (row.status && !ALLOWED_STATUSES.has(row.status)) errors.push(`sample ${file}:${index + 1} invalid status=${row.status}`);
  if (row.visibility && !ALLOWED_VISIBILITY.has(row.visibility)) errors.push(`sample ${file}:${index + 1} invalid visibility=${row.visibility}`);
}

async function main() {
  const errors = [];
  const warnings = [];

  for (const file of REQUIRED_FILES) {
    if (!(await fileExists(file))) errors.push(`missing required KB file: ${file}`);
  }

  const registry = await readJson("knowledge/domain-registry.json").catch((error) => {
    errors.push(`invalid domain registry: ${error.message}`);
    return { domains: [] };
  });

  if (!Array.isArray(registry.domains)) {
    errors.push("domain registry must contain domains array");
  } else {
    const seen = new Set();
    for (const domain of registry.domains) {
      if (!domain.domain_id) errors.push("domain without domain_id");
      if (seen.has(domain.domain_id)) errors.push(`duplicate domain_id: ${domain.domain_id}`);
      seen.add(domain.domain_id);
      if (!domain.primary_readme) errors.push(`domain ${domain.domain_id} missing primary_readme`);
      if (domain.primary_readme && !(await fileExists(domain.primary_readme))) {
        errors.push(`domain ${domain.domain_id} primary_readme missing: ${domain.primary_readme}`);
      }
      for (const entrypoint of domain.llm_entrypoints || []) {
        if (!(await fileExists(entrypoint))) warnings.push(`domain ${domain.domain_id} llm entrypoint missing: ${entrypoint}`);
      }
    }
  }

  for (const file of SCHEMA_FILES) {
    await readJson(file).catch((error) => errors.push(`invalid schema JSON ${file}: ${error.message}`));
  }

  let sampleRows = 0;
  for (const sample of SAMPLE_JSONL_FILES) {
    const rows = await readJsonl(sample.file, errors);
    sampleRows += rows.length;
    if (rows.length < sample.minimumRows) errors.push(`sample ${sample.file} expected at least ${sample.minimumRows} rows`);
    rows.forEach((row, index) => validateSampleRow(row, sample.file, index, sample.expectedRecordType, errors));
  }

  const kbReadme = await readFile("KNOWLEDGE_BASE.md", "utf8").catch(() => "");
  if (!kbReadme.includes("open data")) warnings.push("KNOWLEDGE_BASE.md does not mention open data");

  console.log("KB doctor");
  console.log(formatCount("required files", REQUIRED_FILES.length));
  console.log(formatCount("domains", Array.isArray(registry.domains) ? registry.domains.length : 0));
  console.log(formatCount("schemas", SCHEMA_FILES.length));
  console.log(formatCount("sample rows", sampleRows));
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
