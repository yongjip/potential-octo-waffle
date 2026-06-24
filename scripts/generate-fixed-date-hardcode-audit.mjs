#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "fixed-date-hardcode-audit.md");
const OUT_CSV = path.join(OUT_DIR, "fixed-date-hardcode-audit.csv");
const OUT_JSON = path.join(OUT_DIR, "fixed-date-hardcode-audit.json");

const SCRIPTS_DIR = "scripts";
const REGENERATE_SCRIPT = "scripts/regenerate-research-artifacts.mjs";
const OPERATING_GUIDE = "analysis/current-research-operating-guide.md";
const PERSONAL_HOME = "analysis/personal-research-home.md";

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

function compact(items, limit = 6) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      const key = row[field] || "미분류";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function lineNumberFor(text, index) {
  return text.slice(0, index).split("\n").length;
}

function extractDirMap(scriptText) {
  const dirMap = {};
  for (const match of scriptText.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]+)";/g)) {
    dirMap[match[1]] = match[2];
  }
  return dirMap;
}

function extractOutputs(scriptText) {
  const dirMap = extractDirMap(scriptText);
  const outputs = new Set();

  for (const match of scriptText.matchAll(/const\s+OUT_[A-Z0-9_]+\s*=\s*path\.join\(\s*([A-Z_][A-Z0-9_]*)\s*,\s*"([^"]+\.(?:md|csv|json|txt))"\s*\)/g)) {
    const base = dirMap[match[1]];
    if (base) outputs.add(path.join(base, match[2]));
  }

  for (const match of scriptText.matchAll(/writeFile\(\s*path\.join\(\s*([A-Z_][A-Z0-9_]*)\s*,\s*"([^"]+\.(?:md|csv|json|txt))"\s*\)/g)) {
    const base = dirMap[match[1]];
    if (base) outputs.add(path.join(base, match[2]));
  }

  for (const match of scriptText.matchAll(/const\s+OUT_[A-Z0-9_]+\s*=\s*"([^"]+\.(?:md|csv|json|txt))";/g)) {
    outputs.add(match[1]);
  }

  return [...outputs].sort();
}

function extractHits(scriptText) {
  const hits = [];
  const patterns = [
    {
      kind: "date_constant",
      regex: /(?:const|let|var)?\s*((?:[A-Z_][A-Z0-9_]*_)?(?:UPDATED_AT|DECIDED_AT|GENERATED_AT|REVIEWED_AT|PROBE_DATE))\s*=\s*"(\d{4}-\d{2}-\d{2} KST)"/g,
      snippet: (match) => `${match[1]}=${match[2]}`,
    },
    {
      kind: "literal_heading",
      regex: /(작성 기준|검토일|Generated):\s*(\d{4}-\d{2}-\d{2} KST)/g,
      snippet: (match) => `${match[1]}: ${match[2]}`,
    },
  ];

  for (const pattern of patterns) {
    for (const match of scriptText.matchAll(pattern.regex)) {
      hits.push({
        kind: pattern.kind,
        literal_date: match[2],
        line: lineNumberFor(scriptText, match.index ?? 0),
        snippet: pattern.snippet(match),
      });
    }
  }

  return hits;
}

function parseRegenerateSteps(scriptText) {
  return new Map(
    [...scriptText.matchAll(/\{\s*id:\s*"([^"]+)",[\s\S]*?command:\s*\["(?:node|python3?)",\s*"([^"]+)"\]/g)].map((match) => [match[2], match[1]]),
  );
}

async function safeRead(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return "";
  }
}

function priorityFor({ referencedByGuide, referencedByHome, regenerateStepId }) {
  if ((referencedByGuide || referencedByHome) && regenerateStepId) return "P0";
  if (referencedByGuide || referencedByHome || regenerateStepId) return "P1";
  return "P2";
}

function nextActionFor(priority) {
  if (priority === "P0") return "고정 날짜를 KST 계산식으로 바꾸고 핵심 운영 문서를 즉시 재생성";
  if (priority === "P1") return "고정 날짜를 KST 계산식으로 바꾸고 다음 regenerate run에 포함";
  return "진단/보조 스크립트 성격을 확인한 뒤 필요 시 고정 날짜 제거";
}

async function rowForScript(scriptFile, regenerateSteps, operatingGuideText, personalHomeText) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptFile);
  const scriptText = await readFile(scriptPath, "utf8");
  const hits = extractHits(scriptText);
  if (!hits.length) return null;

  const outputs = extractOutputs(scriptText);
  const referencedByGuide = outputs.some((output) => operatingGuideText.includes(output));
  const referencedByHome = outputs.some((output) => personalHomeText.includes(output));
  const regenerateStepId = regenerateSteps.get(scriptPath) || "";
  const outputStatuses = [];

  for (const output of outputs) {
    const head = (await safeRead(output)).slice(0, 2000);
    const headMatches = hits.some((hit) => head.includes(hit.literal_date));
    outputStatuses.push({
      output,
      headMatches,
    });
  }

  const priority = priorityFor({ referencedByGuide, referencedByHome, regenerateStepId });

  return {
    priority,
    script: scriptPath,
    regenerate_step_id: regenerateStepId || "none",
    hit_count: hits.length,
    hit_kinds: compact(hits.map((hit) => hit.kind), 4),
    literal_dates: compact(hits.map((hit) => hit.literal_date), 4),
    hit_lines: compact(hits.map((hit) => hit.line), 8),
    snippets: compact(hits.map((hit) => hit.snippet), 4),
    output_count: outputs.length,
    outputs: compact(outputs, 8),
    stale_output_count: outputStatuses.filter((row) => row.headMatches).length,
    stale_outputs: compact(outputStatuses.filter((row) => row.headMatches).map((row) => row.output), 8),
    operating_guide_ref: referencedByGuide ? "Y" : "N",
    personal_home_ref: referencedByHome ? "Y" : "N",
    next_action: nextActionFor(priority),
  };
}

function markdown(summary, rows) {
  const topRows = rows.filter((row) => row.priority !== "P2").slice(0, 20);
  return `# 고정 날짜 하드코딩 감사

작성 기준: ${summary.generated_at}

이 문서는 생성 스크립트 안에 남아 있는 KST 날짜 하드코딩을 찾고, 현재 리서치 운영 문서에 얼마나 직접 영향을 주는지 우선순위로 정리한다. 이벤트 날짜나 공식 고시일이 아니라, 생성 시점에 따라 바뀌어야 하는 문서 날짜 하드코딩만 대상으로 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 하드코딩 스크립트 | ${summary.script_count} |
| 재생성 체인 연결 | ${summary.regenerate_connected_count} |
| 운영 가이드 직접 참조 | ${summary.operating_guide_ref_count} |
| 개인 홈 직접 참조 | ${summary.personal_home_ref_count} |
| 현재 stale 출력 감지 | ${summary.stale_output_count} |
| 우선순위 분포 | ${summary.priority_mix} |

## 우선 처리

${mdTable(topRows, [
    { key: "priority", label: "우선" },
    { key: "script", label: "스크립트" },
    { key: "regenerate_step_id", label: "재생성 단계" },
    { key: "hit_count", label: "히트" },
    { key: "outputs", label: "출력" },
    { key: "stale_output_count", label: "stale 출력" },
    { key: "operating_guide_ref", label: "가이드" },
    { key: "personal_home_ref", label: "홈" },
    { key: "next_action", label: "다음 행동" },
  ])}

## 전체 목록

${mdTable(rows, [
    { key: "priority", label: "우선" },
    { key: "script", label: "스크립트" },
    { key: "regenerate_step_id", label: "재생성 단계" },
    { key: "hit_kinds", label: "유형" },
    { key: "literal_dates", label: "날짜" },
    { key: "hit_lines", label: "라인" },
    { key: "output_count", label: "출력 수" },
    { key: "stale_output_count", label: "stale 출력" },
    { key: "operating_guide_ref", label: "가이드" },
    { key: "personal_home_ref", label: "홈" },
  ])}

## 읽는 법

- \`P0\`: 개인 홈 또는 현재 운영 가이드에서 직접 읽는 문서를 만들면서 regenerate 체인에도 연결된 스크립트
- \`P1\`: regenerate 체인에는 걸려 있거나 운영 문서 참조는 있지만 직접 핵심 허브는 아닌 스크립트
- \`P2\`: 보조 진단/탐침/일회성 보고서 성격이 강한 스크립트
- \`stale 출력\`은 출력 파일 앞부분에서 같은 날짜가 실제로 남아 있는 경우만 센다.
`;
}

async function main() {
  const [scriptFiles, regenerateText, operatingGuideText, personalHomeText] = await Promise.all([
    readdir(SCRIPTS_DIR),
    readFile(REGENERATE_SCRIPT, "utf8"),
    safeRead(OPERATING_GUIDE),
    safeRead(PERSONAL_HOME),
  ]);

  const regenerateSteps = parseRegenerateSteps(regenerateText);
  const rows = (
    await Promise.all(
      scriptFiles
        .filter((file) => /\.(mjs|js|py)$/i.test(file))
        .sort()
        .map((file) => rowForScript(file, regenerateSteps, operatingGuideText, personalHomeText)),
    )
  )
    .filter(Boolean)
    .sort((a, b) =>
      a.priority.localeCompare(b.priority) ||
      (b.operating_guide_ref + b.personal_home_ref).localeCompare(a.operating_guide_ref + a.personal_home_ref) ||
      b.stale_output_count - a.stale_output_count ||
      a.script.localeCompare(b.script),
    );

  const summary = {
    generated_at: `${kstDate()} KST`,
    script_count: rows.length,
    regenerate_connected_count: rows.filter((row) => row.regenerate_step_id !== "none").length,
    operating_guide_ref_count: rows.filter((row) => row.operating_guide_ref === "Y").length,
    personal_home_ref_count: rows.filter((row) => row.personal_home_ref === "Y").length,
    stale_output_count: rows.reduce((sum, row) => sum + Number(row.stale_output_count || 0), 0),
    priority_counts: {
      P0: rows.filter((row) => row.priority === "P0").length,
      P1: rows.filter((row) => row.priority === "P1").length,
      P2: rows.filter((row) => row.priority === "P2").length,
    },
    priority_mix: countBy(rows, "priority"),
    inputs: [SCRIPTS_DIR, REGENERATE_SCRIPT, OPERATING_GUIDE, PERSONAL_HOME],
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`, "utf8");
  await writeFile(OUT_CSV, toCsv(rows), "utf8");
  await writeFile(OUT_MD, markdown(summary, rows), "utf8");
  console.log(JSON.stringify({ scripts: summary.script_count, p0: summary.priority_counts.P0, output: "analysis/fixed-date-hardcode-audit.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
