#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";

const INPUTS = {
  gangdongWatch: "analysis/expansion-gangdong-stage-watch-board.json",
  yaksuOcr: "analysis/expansion-yaksu-ocr-recheck-board.json",
  shortlist: "analysis/expansion-interest-zone-shortlist.json",
  updateIntake: "data/review/official-update-intake.json",
  activationIntake: "data/review/official-source-activation-intake.json",
};

const OUT_MD = "analysis/expansion-zone-intake-seed-board.md";
const OUT_JSON = "analysis/expansion-zone-intake-seed-board.json";
const OUT_CSV = "analysis/expansion-zone-intake-seed-board.csv";

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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

function compact(values, joiner = "; ") {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].join(joiner);
}

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function findBy(rows, key, value) {
  return (rows || []).find((row) => String(row[key] || "").trim() === String(value || "").trim()) || {};
}

function buildGangdongCreateRows(gangdongWatch, activationBySource) {
  const source = activationBySource.get("gangdong_district_notice") || {};
  return (gangdongWatch.rows || [])
    .filter((row) => row.candidate_type === "direct_project")
    .map((row) => {
      const seedJson = {
        update_id: `upd-YYYYMMDD-gangdong_district_notice-${row.shortlist_id}`,
        discovered_at: "YYYY-MM-DD KST",
        source_id: "gangdong_district_notice",
        update_date: "YYYY-MM-DD",
        title: `강동구 고시공고/정보몽땅에서 ${row.project_name} 최신 단계 또는 신규 공개항목 확인`,
        official_url: source.official_url || "https://...",
        project_name: row.project_name,
        trigger_type: "district_notice",
        notice_no: row.notice_no || "신규 고시번호 또는 빈값",
        observed_change: `${row.latest_public_signal} 이후 최신 단계 또는 공개자료 재확인`,
        evidence_status: "unverified",
        decision_status: "inbox",
        notes: compact([
          `기준선 reference update_id=${row.tracked_update_id || "없음"}`,
          row.latest_stage_basis,
          row.map_form_url ? `noticeCode reference=${row.map_form_url}` : "",
          row.caution ? `주의: ${row.caution}` : "",
        ]),
      };
      return {
        zone_name: "강동권",
        seed_mode: "create_expansion_update_row",
        project_name: row.project_name,
        source_id: "gangdong_district_notice",
        trigger_type: "district_notice",
        existing_update_id: row.tracked_update_id || "",
        route: "expansion_zone_latest_check",
        target_file: "data/review/official-update-intake.json",
        reason: `${row.latest_stage_status_label}: ${row.latest_stage_basis}`,
        next_action: row.next_stage_refresh_action,
        official_url_hint: source.official_url || "",
        notice_no_hint: row.notice_no || "",
        seed_json: JSON.stringify(seedJson, null, 2),
      };
    });
}

function buildYaksuZoneCreateRow(yaksuRows, activationBySource) {
  const source = activationBySource.get("jung_district_notice") || {};
  const baselineSummary = (yaksuRows.rows || [])
    .map((row) => `${row.project_name}: ${row.confirmed_snapshot}`)
    .slice(0, 3)
    .join(" / ");
  const seedJson = {
    update_id: "upd-YYYYMMDD-jung_district_notice-yaksu-direct-hit",
    discovered_at: "YYYY-MM-DD KST",
    source_id: "jung_district_notice",
    update_date: "YYYY-MM-DD",
    title: "중구 고시공고에서 약수권 direct hit 또는 인접 대조군 변화 발견",
    official_url: source.official_url || "https://...",
    project_name: "약수 direct hit 또는 신당·금호 adjacent 변화",
    trigger_type: "district_notice",
    notice_no: "신규 고시번호 또는 빈값",
    observed_change: "약수 direct hit 여부와 신당8·신당9·금호14-1 기준선 변화 재확인",
    evidence_status: "unverified",
    decision_status: "inbox",
    notes: compact([
      "direct hit가 새로 닫히면 이 row를 만들고, 없으면 activation intake 또는 weekly log만 갱신",
      baselineSummary ? `adjacent baseline: ${baselineSummary}` : "",
    ]),
  };

  return {
    zone_name: "약수동 주변",
    seed_mode: "create_zone_search_row_when_direct_hit_found",
    project_name: "약수 direct hit 또는 신당·금호 adjacent 변화",
    source_id: "jung_district_notice",
    trigger_type: "district_notice",
    existing_update_id: "",
    route: "expansion_zone_latest_check",
    target_file: "data/review/official-update-intake.json",
    reason: "중구 고시공고 direct hit 탐색 결과는 아직 별도 official update row가 없다.",
    next_action: "약수역 direct hit가 생기면 새 row를 만들고, 없으면 adjacent 기준선 유지 여부만 activation/weekly log에 남긴다.",
    official_url_hint: source.official_url || "",
    notice_no_hint: "신규 고시번호 또는 빈값",
    seed_json: JSON.stringify(seedJson, null, 2),
  };
}

function buildYaksuBaselineRows(yaksuRows, shortlistRows, intakeById) {
  const createRows = [];
  const reuseRows = [];

  for (const row of yaksuRows.rows || []) {
    const shortlist = findBy(shortlistRows, "shortlist_id", row.shortlist_id);
    const intake = intakeById.get(shortlist.tracked_update_id) || {};
    if (shortlist.tracked_update_id && intake.update_id) {
      reuseRows.push({
        zone_name: "약수동 주변",
        seed_mode: "reuse_existing_seoul_urban_row",
        project_name: row.project_name,
        source_id: intake.source_id || "seoul_urban_notice",
        trigger_type: intake.trigger_type || "official_notice",
        existing_update_id: shortlist.tracked_update_id || "",
        route: "source_verification_decision",
        target_file: "data/review/official-update-intake.json",
        reason: "이미 서울도시공간포털 고시 row가 tracked_update_id로 존재하므로, baseline refresh는 기존 row를 재사용하는 편이 provenance가 맞다.",
        next_action: shortlist.next_action || row.downstream_change,
        official_url_hint: intake.official_url || shortlist.official_url || "",
        notice_no_hint: intake.notice_no || shortlist.notice_no || "",
        seed_json: "",
      });
      continue;
    }

    const seedJson = {
      update_id: `upd-YYYYMMDD-seoul_urban_notice-${row.shortlist_id}`,
      discovered_at: "YYYY-MM-DD KST",
      source_id: "seoul_urban_notice",
      update_date: "YYYY-MM-DD",
      title: `${row.project_name} baseline refresh 또는 원문 보강`,
      official_url: shortlist.official_url || "https://...",
      project_name: row.project_name,
      trigger_type: "official_notice",
      notice_no: shortlist.notice_no || "고시번호 또는 빈값",
      observed_change: `${row.stage_signal} 기준선 refresh 또는 원문 보강`,
      evidence_status: "unverified",
      decision_status: "inbox",
      notes: compact([
        "약수권 adjacent baseline용 seoul_urban_notice row",
        row.confirmed_snapshot,
        row.rejected_or_reframed ? `주의: ${row.rejected_or_reframed}` : "",
      ]),
    };

    createRows.push({
      zone_name: "약수동 주변",
      seed_mode: "create_adjacent_urban_baseline_row",
      project_name: row.project_name,
      source_id: "seoul_urban_notice",
      trigger_type: "official_notice",
      existing_update_id: "",
      route: "source_verification_decision",
      target_file: "data/review/official-update-intake.json",
      reason: "현재 tracked_update_id가 없으므로, adjacent baseline을 유지하려면 seoul_urban_notice row를 새로 만들어 provenance를 닫아야 한다.",
      next_action: shortlist.next_action || row.downstream_change,
      official_url_hint: shortlist.official_url || "",
      notice_no_hint: shortlist.notice_no || "",
      seed_json: JSON.stringify(seedJson, null, 2),
    });
  }

  return { createRows, reuseRows };
}

function summarize(createRows, reuseRows) {
  return {
    generated_at: `${kstDate()} KST`,
    create_row_count: createRows.length,
    reuse_row_count: reuseRows.length,
    gangdong_create_count: createRows.filter((row) => row.zone_name === "강동권").length,
    yaksu_create_count: createRows.filter((row) => row.zone_name === "약수동 주변").length,
    yaksu_reuse_count: reuseRows.filter((row) => row.zone_name === "약수동 주변").length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };
}

function markdown(summary, createRows, reuseRows) {
  return `# 확장 관심권 Intake Seed 보드

작성 기준: ${summary.generated_at}

이 문서는 확장 관심권 점검 결과를 실제 intake row로 옮길 때 복붙 출발점을 바로 제공한다. 강동권은 새 \`gangdong_district_notice\` row를 만드는 쪽이 맞고, 약수권 adjacent 기준선은 기존 \`seoul_urban_notice\` row를 재사용하는 쪽이 provenance가 맞다.

## 요약

- 새로 만들 seed: ${summary.create_row_count}
- 기존 row 재사용: ${summary.reuse_row_count}
- 강동권 create seed: ${summary.gangdong_create_count}
- 약수권 direct hit용 create seed: ${summary.yaksu_create_count}
- 약수권 reuse 대상: ${summary.yaksu_reuse_count}

## 새로 만드는 seed

${mdTable(createRows, [
    { key: "zone_name", label: "권역" },
    { key: "seed_mode", label: "mode" },
    { key: "project_name", label: "사업/질문" },
    { key: "source_id", label: "source_id" },
    { key: "existing_update_id", label: "기준 reference" },
    { key: "route", label: "route" },
    { key: "reason", label: "왜 새 row인가" },
    { key: "next_action", label: "다음 액션" },
  ])}

## 기존 row 재사용

${mdTable(reuseRows, [
    { key: "zone_name", label: "권역" },
    { key: "project_name", label: "사업" },
    { key: "existing_update_id", label: "재사용 update_id" },
    { key: "source_id", label: "source_id" },
    { key: "route", label: "route" },
    { key: "reason", label: "재사용 이유" },
    { key: "next_action", label: "다음 액션" },
  ])}

## Copy-ready JSON

아래 JSON은 실제 입력 형식이다. \`official_url\`, \`notice_no\`, \`update_date\`는 그날 확인한 실제 값으로 바꾼다.

${createRows
    .map(
      (row) => `### ${row.project_name}

\`\`\`json
${row.seed_json}
\`\`\`
`,
    )
    .join("\n")}
## 운영 원칙

1. 강동권에서 새 단계·공개자료를 찾으면 ${fileLink("data/review/official-update-intake.json")}에 \`gangdong_district_notice\` row를 새로 만든다.
2. 약수권에서 \`신당8·신당9·금호14-1\` baseline만 다시 읽은 경우에는 기존 \`seoul_urban_notice\` row를 재사용한다.
3. 약수권에서 실제 \`약수 direct hit\`가 새로 생겼을 때만 \`jung_district_notice\` 새 row를 만든다.
4. 새 row를 넣은 뒤에는 ${fileLink("analysis/official-update-intake-board.md")}와 ${fileLink("analysis/official-update-scenario-playbook.md")}를 다시 생성해 route를 확인한다.
5. 점검 메모만 있고 새 공식 update가 없으면 ${fileLink("data/review/official-source-activation-intake.json")} 또는 ${fileLink("analysis/weekly-monitoring-execution-log.md")}에 남긴다.
`;
}

async function main() {
  const [gangdongWatch, yaksuOcr, shortlistDoc, updateIntake, activationIntake] = await Promise.all([
    readJson(INPUTS.gangdongWatch),
    readJson(INPUTS.yaksuOcr),
    readJson(INPUTS.shortlist),
    readJson(INPUTS.updateIntake),
    readJson(INPUTS.activationIntake),
  ]);

  const shortlistRows = shortlistDoc.rows || [];
  const intakeById = new Map(updateIntake.map((row) => [row.update_id, row]));
  const activationBySource = new Map(activationIntake.map((row) => [row.source_id, row]));
  const yaksuBaseline = buildYaksuBaselineRows(yaksuOcr, shortlistRows, intakeById);

  const createRows = [
    ...buildGangdongCreateRows(gangdongWatch, activationBySource),
    ...yaksuBaseline.createRows,
    buildYaksuZoneCreateRow(yaksuOcr, activationBySource),
  ];
  const reuseRows = yaksuBaseline.reuseRows;
  const summary = summarize(createRows, reuseRows);
  const csvRows = [...createRows, ...reuseRows].map((row) => ({ ...row, seed_json: row.seed_json ? row.seed_json.replaceAll("\n", "\\n") : "" }));

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, create_rows: createRows, reuse_rows: reuseRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(csvRows));
  await writeFile(OUT_MD, `${markdown(summary, createRows, reuseRows)}\n`);
  console.log(JSON.stringify({ create_rows: createRows.length, reuse_rows: reuseRows.length, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
