#!/usr/bin/env node

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "research-artifact-dependency-map.md");
const OUT_CSV = path.join(OUT_DIR, "research-artifact-dependency-map.csv");
const OUT_JSON = path.join(OUT_DIR, "research-artifact-dependency-map.json");

const REGENERATE_SCRIPT = "scripts/regenerate-research-artifacts.mjs";
const ANALYSIS_DIR = "analysis";

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]);
  return `${[fields.join(","), ...rows.map((row) => fields.map((field) => csvEscape(row[field])).join(","))].join("\n")}\n`;
}

function mdTable(rows, fields) {
  if (!rows.length) return "_없음_";
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

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

function compact(items, limit = 6) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function basenameNoExt(file) {
  return path.basename(file).replace(/\.(md|csv|json)$/i, "");
}

function phaseForStep(step) {
  const id = step.step_id;
  if (/market/.test(id)) return "시장 데이터";
  if (/cleanup|official-refresh|board-review/.test(id)) return "정보몽땅/공식 최신";
  if (/source|ocr|hwp|sibo|gwangjin|songpa|management|core|recordcode|map-missing|s[1-5]/.test(id)) return "원문 검증";
  if (/high-blocking|completion|goal/.test(id)) return "완료 병목";
  if (/fieldwork|transport|mobility/.test(id)) return "교통/현장";
  if (/catalyst|hypothesis|potential|risk|reassessment|strategy|deep-dive|due-diligence|next-moves|focus-area|personal|notes/.test(id)) return "비교/가설/운영";
  return "기타";
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  return value.rows || value.project_rows || value.projectRows || value.focus_rows || value.focusRows || [];
}

function parseSteps(source) {
  const matches = [...source.matchAll(/\{\s*id:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*command:\s*\[([^\]]+)\],?\s*\}/g)];
  return matches.map((match, index) => {
    const command = [...match[3].matchAll(/"([^"]+)"/g)].map((part) => part[1]);
    const step = {
      step_index: index + 1,
      step_id: match[1],
      description: match[2],
      command: command.join(" "),
      script: command.find((item) => item.startsWith("scripts/")) || "",
    };
    step.phase = phaseForStep(step);
    return step;
  });
}

function extractScriptIo(scriptText) {
  const inputs = [];
  const inputBlock = scriptText.match(/const\s+INPUTS\s*=\s*\{([\s\S]*?)\};/);
  if (inputBlock) {
    for (const match of inputBlock[1].matchAll(/"([^"]+\.(?:json|csv|md|txt|html|pdf|hwp|hwpx|png|jpg))"/g)) {
      inputs.push(match[1]);
    }
  }
  const outputs = [];
  for (const match of scriptText.matchAll(/const\s+OUT_[A-Z0-9_]+\s*=\s*(?:path\.join\([^,]+,\s*)?"([^"]+\.(?:md|csv|json|txt))"/g)) {
    outputs.push(match[1]);
  }
  for (const match of scriptText.matchAll(/output:\s*"([^"]+)"/g)) {
    if (/\{/.test(match[1])) continue;
    outputs.push(match[1]);
  }
  return { inputs: [...new Set(inputs)], outputs: [...new Set(outputs)] };
}

async function safeReadJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

function summarizeJson(file, data, outputToStep) {
  const summary = data?.summary || (data && typeof data === "object" && data.generated_at ? data : null);
  const declaredInputs = Array.isArray(summary?.inputs) ? summary.inputs : [];
  const declaredOutputs = Array.isArray(summary?.outputs) ? summary.outputs : [];
  const outputKeys = declaredOutputs.map((item) => basenameNoExt(item));
  const inferredStep = declaredOutputs.map((item) => outputToStep.get(item)).find(Boolean) || outputToStep.get(path.join("analysis", file)) || "";
  return {
    artifact_json: path.join("analysis", file),
    artifact_key: basenameNoExt(file),
    has_summary: summary ? "Y" : "N",
    generated_at: summary?.generated_at || data?.generated_at || "",
    row_count: rowsFrom(data).length || data?.projectRows?.length || data?.workflow_rows?.length || "",
    summary_keys: summary ? Object.keys(summary).slice(0, 12).join("; ") : "",
    declared_inputs: compact(declaredInputs, 8),
    declared_input_count: declaredInputs.length,
    declared_outputs: compact(declaredOutputs, 8),
    declared_output_count: declaredOutputs.length,
    output_keys: compact(outputKeys, 8),
    inferred_step: inferredStep,
  };
}

function buildEdges(artifactRows) {
  const produced = new Map();
  for (const row of artifactRows) {
    for (const output of String(row.declared_outputs || "").split(";").map((item) => item.trim()).filter(Boolean)) {
      produced.set(output, row.artifact_json);
    }
  }
  const edges = [];
  for (const row of artifactRows) {
    for (const input of String(row.declared_inputs || "").split(";").map((item) => item.trim()).filter(Boolean)) {
      edges.push({
        from: produced.get(input) || input,
        to: row.artifact_json,
        input,
        resolved_internal: produced.has(input) ? "Y" : "N",
      });
    }
  }
  return edges;
}

function markdown(summary, stepRows, artifactRows, edges) {
  const criticalArtifacts = [
    "personal-research-home.json",
    "focus-project-monitoring-board.json",
    "focus-project-weekly-monitoring-cockpit.json",
    "focus-project-fieldwork-cockpit.json",
    "focus-project-pair-comparison-board.json",
    "project-due-diligence-board.json",
    "project-evidence-binder.json",
    "catalyst-trigger-matrix.json",
    "research-goal-completion-audit.json",
    "research-system-readiness-audit.json",
  ];
  const criticalRows = artifactRows.filter((row) => criticalArtifacts.includes(path.basename(row.artifact_json)));
  return `# 리서치 산출물 의존성 맵

작성 기준: ${summary.generated_at}

이 문서는 재생성 체인과 주요 JSON summary를 읽어 만든 운영용 의존성 맵이다. 어떤 파일을 고치면 어느 산출물이 영향을 받는지, 어떤 스크립트가 어떤 단계에 있는지 확인하는 용도다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 재생성 단계 | ${summary.step_count} |
| 분석 JSON | ${summary.analysis_json_count} |
| summary 보유 JSON | ${summary.summary_json_count} |
| 선언 입력 edge | ${summary.declared_input_edges} |
| 내부 해소 edge | ${summary.resolved_internal_edges} |

## 분포

| 구분 | 값 |
| --- | --- |
| 단계 phase | ${summary.phase_mix} |
| summary 보유 | ${summary.summary_mix} |

## 핵심 산출물

${mdTable(criticalRows, [
    { key: "artifact_json", label: "JSON" },
    { key: "row_count", label: "Rows" },
    { key: "declared_input_count", label: "입력" },
    { key: "declared_output_count", label: "출력" },
    { key: "inferred_step", label: "단계" },
    { key: "declared_inputs", label: "주요 입력" },
  ])}

## 재생성 단계

${mdTable(stepRows, [
    { key: "step_index", label: "#" },
    { key: "phase", label: "Phase" },
    { key: "step_id", label: "Step" },
    { key: "description", label: "설명" },
    { key: "script", label: "Script" },
    { key: "script_inputs", label: "스크립트 입력" },
    { key: "script_outputs", label: "스크립트 출력" },
  ])}

## Summary 산출물

${mdTable(artifactRows.filter((row) => row.has_summary === "Y"), [
    { key: "artifact_json", label: "JSON" },
    { key: "generated_at", label: "생성기준" },
    { key: "row_count", label: "Rows" },
    { key: "declared_input_count", label: "입력" },
    { key: "declared_output_count", label: "출력" },
    { key: "inferred_step", label: "단계" },
  ])}

## 내부 입력 Edge 샘플

${mdTable(edges.filter((edge) => edge.resolved_internal === "Y").slice(0, 80), [
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "input", label: "Input" },
  ])}

## 운영 원칙

- 새 생성 스크립트는 가능하면 JSON summary에 \`inputs\`와 \`outputs\`를 넣는다.
- 입력 파일을 바꾸면 이 맵에서 downstream 산출물을 확인한 뒤 전체 재생성을 실행한다.
- 이 맵은 재생성 체계를 설명하는 보조 산출물이며, 공식 원문 값 자체를 확정하지 않는다.
`;
}

async function main() {
  const regenerateSource = await readFile(REGENERATE_SCRIPT, "utf8");
  const steps = parseSteps(regenerateSource);

  const stepRows = [];
  for (const step of steps) {
    let io = { inputs: [], outputs: [] };
    if (step.script) {
      try {
        io = extractScriptIo(await readFile(step.script, "utf8"));
      } catch {
        io = { inputs: [], outputs: [] };
      }
    }
    stepRows.push({
      ...step,
      script_inputs: compact(io.inputs, 8),
      script_input_count: io.inputs.length,
      script_outputs: compact(io.outputs, 8),
      script_output_count: io.outputs.length,
    });
  }

  const outputToStep = new Map();
  for (const row of stepRows) {
    for (const output of String(row.script_outputs || "").split(";").map((item) => item.trim()).filter(Boolean)) {
      outputToStep.set(output, row.step_id);
      outputToStep.set(path.join("analysis", path.basename(output)), row.step_id);
    }
  }

  const jsonFiles = (await readdir(ANALYSIS_DIR)).filter((file) => file.endsWith(".json")).sort();
  const artifactRows = [];
  for (const file of jsonFiles) {
    const data = await safeReadJson(path.join(ANALYSIS_DIR, file));
    if (!data) continue;
    artifactRows.push(summarizeJson(file, data, outputToStep));
  }
  const edges = buildEdges(artifactRows);

  const summary = {
    generated_at: `${kstDate()} KST`,
    step_count: stepRows.length,
    analysis_json_count: artifactRows.length,
    summary_json_count: artifactRows.filter((row) => row.has_summary === "Y").length,
    declared_input_edges: edges.length,
    resolved_internal_edges: edges.filter((edge) => edge.resolved_internal === "Y").length,
    phase_mix: countBy(stepRows, "phase"),
    summary_mix: countBy(artifactRows, "has_summary"),
    inputs: [REGENERATE_SCRIPT, "analysis/*.json"],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_MD, markdown(summary, stepRows, artifactRows, edges));
  await writeFile(OUT_CSV, toCsv(artifactRows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, stepRows, artifactRows, edges }, null, 2)}\n`);

  console.log(JSON.stringify({ steps: summary.step_count, artifacts: summary.analysis_json_count, edges: summary.declared_input_edges, output: "analysis/research-artifact-dependency-map.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
