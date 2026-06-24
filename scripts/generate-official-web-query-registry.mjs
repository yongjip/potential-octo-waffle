#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";
const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-web-query-registry.md");
const OUT_JSON = path.join(OUT_DIR, "official-web-query-registry.json");
const OUT_CSV = path.join(OUT_DIR, "official-web-query-registry.csv");

const INPUTS = {
  focusRegistry: "analysis/focus-project-monitoring-registry.json",
  officialChangeBoard: "analysis/official-change-detection-board.json",
  activationIntake: "data/review/official-source-activation-intake.json",
  highBlockingNextCheck: "analysis/high-blocking-next-check-session-packet.json",
  highBlockingChannels: "analysis/high-blocking-contact-channel-registry.json",
  fallbackEdgePacket: "analysis/representative-lot-fallback-edge-session-packet.json",
};

const CONTEXT_SOURCE_URLS = {
  seoul_citybuild_news: ["https://news.seoul.go.kr/citybuild/"],
  seoul_traffic_news: ["https://news.seoul.go.kr/traffic/"],
  opengov: ["https://opengov.seoul.go.kr/"],
};

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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function webLink(label, url) {
  return `[${label}](${url})`;
}

function splitSemi(text) {
  return String(text || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniq(values) {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function truncate(text, max = 220) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}...`;
}

function sourceRowMap(rows) {
  return new Map((rows || []).map((row) => [row.source_id, row]));
}

function baseProjectQueries(projectName) {
  const cleaned = String(projectName || "")
    .replace(/\s*주택재건축정비사업조합/g, "")
    .replace(/\s*주택재건축정비사업 조합/g, "")
    .replace(/\s*주택재개발정비사업/g, "")
    .replace(/\s*일대 가로주택정비사업/g, "")
    .replace(/\s*재건축정비사업 조합/g, "")
    .replace(/\s*조합$/g, "")
    .trim();
  return uniq([projectName, cleaned, `${cleaned} 정비`, `${cleaned} 고시`]).join("; ");
}

function projectOfficialUrls(project) {
  return Object.entries(project.official_urls || {})
    .filter(([, url]) => typeof url === "string" && url.trim())
    .map(([label, url]) => `${label}: ${url}`);
}

function combineDetectionUnits(rows, extras = []) {
  const units = rows.flatMap((row) => splitSemi(String(row?.detection_unit || "").replaceAll(",", ";")));
  return uniq([...units, ...extras]).join("; ");
}

function combineDecisionGates(values) {
  return uniq(values.map((value) => truncate(value, 200))).join(" / ");
}

function renderUrlList(text) {
  const items = splitSemi(text);
  if (!items.length) return "- 없음";
  return items
    .map((item) => {
      const labelled = /^([^:]+):\s*(https?:\/\/\S+)$/.exec(item);
      if (labelled) return `- ${webLink(labelled[1].trim(), labelled[2].trim())}`;
      const plain = /^(https?:\/\/\S+)$/.exec(item);
      if (plain) return `- ${webLink(plain[1], plain[1])}`;
      return `- ${item}`;
    })
    .join("\n");
}

function renderFileList(text, limit = 5) {
  const items = splitSemi(text).slice(0, limit);
  if (!items.length) return "- 없음";
  return items
    .map((item) => {
      if (item.startsWith("analysis/") || item.startsWith("project-notes/") || item.startsWith("data/")) return `- ${fileLink(item)}`;
      return `- ${item}`;
    })
    .join("\n");
}

function buildCoreRows(focusRegistry, sourceMap) {
  const cleanupStatus = sourceMap.get("cleanup_project_status");
  const cleanupNotice = sourceMap.get("cleanup_notice");
  const urbanNotice = sourceMap.get("seoul_urban_notice");
  const districtNotice = sourceMap.get("district_notice");

  return (focusRegistry.projects || []).map((project) => {
    const sources = [cleanupStatus, cleanupNotice, urbanNotice, districtNotice].filter(Boolean);
    const extraFields = project.official_urls?.district_page ? ["담당부서", "최종 수정일"] : [];
    const updateTargets = uniq([
      ...(project.update_targets || []),
      "analysis/weekly-monitoring-execution-log.md",
    ]);
    return {
      category: "핵심 사업",
      target: `${project.rank}. ${project.name}`,
      route_purpose: project.track,
      current_state: `${project.life_area} / ${project.stage} / ${project.core_read}`,
      official_channels: "정비사업 정보몽땅; 서울도시공간포털; 자치구 고시공고/사업별 페이지",
      official_entry_urls: projectOfficialUrls(project).join("; "),
      search_keywords: baseProjectQueries(project.name),
      capture_fields: combineDetectionUnits(sources, extraFields),
      decision_gate: combineDecisionGates([
        focusRegistry.common_rules?.[0],
        cleanupStatus?.decision_gate,
        urbanNotice?.decision_gate,
      ]),
      first_record_target: `project-notes/${String(project.rank).padStart(2, "0")}-${project.slug.toLowerCase()}.md; analysis/weekly-monitoring-execution-log.md`,
      first_outputs_to_update: updateTargets.join("; "),
      next_action_or_helper: "analysis/focus-project-latest-check-guide.md -> node scripts/regenerate-research-artifacts.mjs",
      priority_score: 90 + Number(project.rank === 9 ? 10 : 0),
    };
  });
}

function buildExpansionRows(activationIntake, sourceMap) {
  return (activationIntake || []).map((entry, index) => {
    const source = sourceMap.get(entry.source_id);
    const zoneName = entry.source_id === "gangdong_district_notice" ? "강동권" : "약수동 주변";
    const outputs =
      entry.source_id === "gangdong_district_notice"
        ? [
            "analysis/expansion-zone-latest-check-guide.md",
            "analysis/expansion-zone-intake-seed-board.md",
            "analysis/expansion-gangdong-stage-watch-board.md",
            "analysis/life-area-monitoring-board.md",
          ]
        : [
            "analysis/expansion-zone-latest-check-guide.md",
            "analysis/expansion-zone-intake-seed-board.md",
            "analysis/expansion-yaksu-ocr-recheck-board.md",
            "analysis/life-area-monitoring-board.md",
          ];
    return {
      category: "확장 관심권",
      target: zoneName,
      route_purpose: "latest stage / direct hit 재확인",
      current_state: `${entry.activation_channel} / 다음 점검 ${entry.next_check_at} / ${truncate(entry.notes, 140)}`,
      official_channels: `${entry.activation_channel}; 서울도시공간포털; 정비사업 정보몽땅`,
      official_entry_urls: uniq([entry.official_url, ...splitSemi(entry.supporting_urls)]).join("; "),
      search_keywords: entry.search_keywords,
      capture_fields: combineDetectionUnits([source], ["사업명", "고시번호", "고시일", "위치", "최신 단계 공개 여부"]),
      decision_gate: combineDecisionGates([source?.decision_gate, "공식 사업명·고시번호·고시일 또는 정보몽땅 사업장명이 확인될 때만 project 후보나 단계 근거로 승격"]),
      first_record_target: `${entry.next_record_target || "data/review/official-source-activation-intake.json"}; data/review/official-update-intake.json`,
      first_outputs_to_update: outputs.join("; "),
      next_action_or_helper: source?.first_command_or_action || "수동 검색 후 intake 기록 -> node scripts/regenerate-research-artifacts.mjs",
      priority_score: 80 - index,
    };
  });
}

function buildHighBlockingRows(nextCheckPacket, channelRegistry) {
  const batchCommand = nextCheckPacket.summary?.batch_touch_command || "";
  return (nextCheckPacket.rows || []).map((row) => {
    const channels = (channelRegistry.rows || [])
      .filter((channel) => (channel.project_ranks || []).includes(String(row.rank)))
      .sort((a, b) => Number(a.route_priority || 0) - Number(b.route_priority || 0));
    const officialUrls = uniq([row.filing_url, ...channels.slice(0, 3).map((channel) => channel.official_url)]).join("; ");
    return {
      category: "외부 회신",
      target: `${row.rank}. ${row.project_name}`,
      route_purpose: "회신 확인 / 원문 식별정보 확보",
      current_state: `${row.district} / ${row.current_stage} / ${row.response_status} / 다음 점검 ${row.next_check_date}`,
      official_channels: uniq([row.filing_channel, ...channels.slice(0, 3).map((channel) => channel.channel_name)]).join("; "),
      official_entry_urls: officialUrls,
      search_keywords: `${row.project_name}; ${row.district} 정비사업; ${row.remaining_gap}`,
      capture_fields: row.response_record_fields,
      decision_gate: combineDecisionGates([row.promotion_rule, row.response_status_rule]),
      first_record_target: uniq(channels.map((channel) => channel.response_intake_file).filter(Boolean)).join("; ") || "data/review/high-blocking-source-response-intake.json",
      first_outputs_to_update: "analysis/high-blocking-filing-tracker.md; analysis/high-blocking-response-decision-drafts.md; analysis/project-comparison-matrix.md; analysis/research-completion-cockpit.md",
      next_action_or_helper: batchCommand
        ? `${batchCommand} -> 필요 시 ${row.touch_followup_command} -> ${row.workflow_dry_run}`
        : `${row.touch_followup_command} -> ${row.workflow_dry_run}`,
      priority_score: 70 + Number(row.priority_score || 0) / 1000,
    };
  });
}

function buildFallbackIdentifierRows(fallbackEdgePacket) {
  return (fallbackEdgePacket.rows || []).map((row) => ({
    category: "식별자 클로저",
    target: row.target,
    route_purpose: "current business presentSn 식별",
    current_state: `${row.area_or_lane} / ${row.status}`,
    official_channels: "서울도시공간포털 메인; recordCode popup; 도시공간포털 고시",
    official_entry_urls: row.official_urls,
    search_keywords: row.probe_key,
    capture_fields: "presentSn; urban_data_reference_date; urban_business_type; cleanup_site_url; propel_history",
    decision_gate: `${row.accept_gate} / ${row.reject_gate}`,
    first_record_target: uniq([
      "analysis/representative-lot-fallback-workbook.md",
      "analysis/representative-lot-fallback-identifier-closure-workbook.md",
      ...splitSemi(row.output_route).filter((item) => item.startsWith("project-notes/")),
    ]).join("; "),
    first_outputs_to_update: row.output_route,
    next_action_or_helper: row.helper_or_next,
    priority_score: Number(row.priority_score || 0),
  }));
}

function buildContextRows(sourceMap) {
  return ["seoul_citybuild_news", "seoul_traffic_news", "opengov"].map((sourceId, index) => {
    const source = sourceMap.get(sourceId);
    return {
      category: "도시계획 context",
      target: source.source_name,
      route_purpose: source.primary_runbook,
      current_state: `${source.freshness_status} / ${source.check_cadence}`,
      official_channels: source.source_name,
      official_entry_urls: (CONTEXT_SOURCE_URLS[sourceId] || []).join("; "),
      search_keywords: source.top_catalysts,
      capture_fields: source.detection_unit,
      decision_gate: source.decision_gate,
      first_record_target: source.intake_target,
      first_outputs_to_update: splitSemi(source.affected_outputs).slice(0, 5).join("; "),
      next_action_or_helper: source.first_command_or_action,
      priority_score: 50 - index,
    };
  });
}

function summarize(rows) {
  return {
    generated_at: `${kstDate()} KST`,
    row_count: rows.length,
    core_count: rows.filter((row) => row.category === "핵심 사업").length,
    expansion_count: rows.filter((row) => row.category === "확장 관심권").length,
    identifier_closure_count: rows.filter((row) => row.category === "식별자 클로저").length,
    high_blocking_count: rows.filter((row) => row.category === "외부 회신").length,
    context_count: rows.filter((row) => row.category === "도시계획 context").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };
}

function markdown(summary, rows) {
  return `# 공식 웹 검색 레지스트리

작성 기준: ${summary.generated_at}

이 문서는 서울 재개발·재건축 및 도시계획 리서치에서 실제 브라우저 세션에 쓰는 공식 포털 경로를 한 레지스트리로 묶는다. 각 행은 어디를 열고, 어떤 키워드로 찾고, 어떤 필드를 기록하고, 어느 gate를 통과해야 확정값으로 쓸 수 있는지 보여준다.

## 요약

- 전체 경로: ${summary.row_count}
- 핵심 사업: ${summary.core_count}
- 확장 관심권: ${summary.expansion_count}
- 식별자 클로저: ${summary.identifier_closure_count}
- 외부 회신: ${summary.high_blocking_count}
- 도시계획 context: ${summary.context_count}

## 먼저 열 파일

1. ${fileLink("analysis/research-manual-web-session-packet.md")}: 오늘 바로 열 수 있는 세션 분기
2. ${fileLink("analysis/focus-project-latest-check-guide.md")}: 핵심 사업 직접 URL과 live recheck 기준
3. ${fileLink("analysis/expansion-zone-latest-check-guide.md")}: 강동권·약수권 확장 루프
4. ${fileLink("analysis/representative-lot-fallback-edge-session-packet.md")}: fallback 6건의 presentSn 수동 확인 패킷
5. ${fileLink("analysis/high-blocking-next-check-session-packet.md")}: 외부 회신 점검 helper와 조회 URL
6. ${fileLink("analysis/official-change-detection-board.md")}: 출처별 detection unit과 판정 gate

## 경로 한눈표

${mdTable(rows, [
    { key: "category", label: "구분" },
    { key: "target", label: "대상" },
    { key: "route_purpose", label: "목적" },
    { key: "current_state", label: "현재 상태" },
    { key: "search_keywords", label: "검색어/쿼리" },
    { key: "first_record_target", label: "첫 기록 위치" },
  ])}

${rows
    .map(
      (row, index) => `## 경로 ${index + 1}. ${row.target}

- 구분: ${row.category}
- 목적: ${row.route_purpose}
- 현재 상태: ${row.current_state}
- 공식 채널: ${row.official_channels}
- 진입 URL
${renderUrlList(row.official_entry_urls)}
- 검색어/쿼리
  ${row.search_keywords}
- 기록 필드
  ${row.capture_fields}
- 판정 gate
  ${row.decision_gate}
- 첫 기록 위치
${renderFileList(row.first_record_target, 4)}
- 먼저 갱신할 산출물
${renderFileList(row.first_outputs_to_update, 6)}
- 다음 액션/helper
  ${row.next_action_or_helper}
`,
    )
    .join("\n")}

## 운영 원칙

- 이 레지스트리는 공식 포털 검색 경로와 기록 규칙을 고정하는 문서다. 값 확정은 각 gate를 통과한 원문·회신 기준으로만 한다.
- \`고시번호\`, \`고시일\`, \`원문 URL\`, \`첨부 원문\`, \`공개항목 본문\`, \`기준일\`이 확인되지 않으면 단계나 수치를 확정하지 않는다.
- context 출처는 도시계획·교통 촉매를 읽기 위한 보조 루트다. 사업 단계나 비용 수치를 직접 확정하는 데 쓰지 않는다.
- 세션 종료 후에는 관련 메모나 intake를 먼저 갱신하고 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
`;
}

async function main() {
  const [focusRegistry, officialChangeBoard, activationIntake, highBlockingNextCheck, highBlockingChannels, fallbackEdgePacket] = await Promise.all([
    readJson(INPUTS.focusRegistry),
    readJson(INPUTS.officialChangeBoard),
    readJson(INPUTS.activationIntake),
    readJson(INPUTS.highBlockingNextCheck),
    readJson(INPUTS.highBlockingChannels),
    readJson(INPUTS.fallbackEdgePacket),
  ]);

  const sourceMap = sourceRowMap(officialChangeBoard.rows || []);
  const rows = [
    ...buildCoreRows(focusRegistry, sourceMap),
    ...buildExpansionRows(activationIntake, sourceMap),
    ...buildFallbackIdentifierRows(fallbackEdgePacket),
    ...buildHighBlockingRows(highBlockingNextCheck, highBlockingChannels),
    ...buildContextRows(sourceMap),
  ].sort((a, b) => Number(b.priority_score || 0) - Number(a.priority_score || 0) || a.target.localeCompare(b.target, "ko"));

  const summary = summarize(rows);
  const csvRows = rows.map(({ priority_score, ...row }) => row);
  const payload = { summary, rows: csvRows };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_MD, `${markdown(summary, rows)}\n`);

  console.log(
    JSON.stringify(
      {
        row_count: summary.row_count,
        categories: {
          core: summary.core_count,
          expansion: summary.expansion_count,
          identifier_closure: summary.identifier_closure_count,
          high_blocking: summary.high_blocking_count,
          context: summary.context_count,
        },
        output: "analysis/official-web-query-registry.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
