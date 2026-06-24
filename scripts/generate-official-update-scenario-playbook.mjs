#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-update-scenario-playbook.md");
const OUT_CSV = path.join(OUT_DIR, "official-update-scenario-playbook.csv");
const OUT_JSON = path.join(OUT_DIR, "official-update-scenario-playbook.json");

const INPUTS = {
  changeBoard: "analysis/official-change-detection-board.json",
  intakeBoard: "analysis/official-update-intake-board.json",
  updateImpactLedger: "analysis/update-impact-ledger.json",
  projectMatrix: "analysis/project-comparison-matrix.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
};

const EXPANSION_SOURCE_CONFIG = {
  gangdong_district_notice: {
    trigger_type: "district_notice",
    evidence_status: "unverified",
    title: "강동구 고시공고에서 확장 관심권 최신 단계 후보를 발견한 경우",
    route: "expansion_zone_latest_check",
    target_file:
      "analysis/expansion-gangdong-stage-watch-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json",
    required_next_step:
      "천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 같은 날짜 기준으로 다시 닫고, 원문 확보 시 official-update-intake/source verification로 승격",
    sample_project_name: "천호3구역 / 신동아1·2차 / 성내미주",
    focus_area: "강동권",
  },
  jung_district_notice: {
    trigger_type: "district_notice",
    evidence_status: "unverified",
    title: "중구 고시공고에서 약수권 direct hit 또는 인접 대조군 변화를 발견한 경우",
    route: "expansion_zone_latest_check",
    target_file:
      "analysis/expansion-yaksu-ocr-recheck-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json",
    required_next_step:
      "약수권 direct hit 여부와 신당·금호 인접 대조군 변화를 같은 날짜 기준으로 다시 닫고, 원문 확보 시 official-update-intake/source verification로 승격",
    sample_project_name: "신당 제8구역 / 신당 제9구역 / 금호 제14-1",
    focus_area: "약수동 주변",
  },
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

const UPDATED_AT = `${kstDate()} KST`;

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const fields = Object.keys(rows[0]).filter((field) => field !== "sample_intake_json");
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

function rowsFrom(value, key = "rows") {
  if (Array.isArray(value)) return value;
  return value[key] || value.rows || [];
}

function compact(items, limit = 5) {
  return [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))].slice(0, limit).join("; ");
}

function triggerTypeForSource(sourceId) {
  if (EXPANSION_SOURCE_CONFIG[sourceId]) return EXPANSION_SOURCE_CONFIG[sourceId].trigger_type;
  if (sourceId === "cleanup_project_status") return "cleanup_stage";
  if (sourceId === "cleanup_notice") return "cleanup_board";
  if (sourceId === "district_notice") return "district_notice";
  if (["seoul_citybuild_news", "opengov"].includes(sourceId)) return "policy_context";
  if (sourceId === "seoul_traffic_news") return "transport_context";
  if (["seoul_open_data", "molit_data_go_kr", "r_one"].includes(sourceId)) return "market_data";
  if (sourceId === "seoul_urban_alert") return "official_notice";
  return "official_notice";
}

function evidenceStatusFor(sourceId) {
  if (EXPANSION_SOURCE_CONFIG[sourceId]) return EXPANSION_SOURCE_CONFIG[sourceId].evidence_status;
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId)) return "context_only";
  if (["molit_data_go_kr", "r_one", "seoul_open_data"].includes(sourceId)) return "unverified";
  if (["seoul_urban_notice", "district_notice", "seoul_sibo"].includes(sourceId)) return "needs_text_extraction";
  return "unverified";
}

function routeFor(sourceId, projectRank, completionRanks) {
  if (EXPANSION_SOURCE_CONFIG[sourceId]) {
    return {
      route: EXPANSION_SOURCE_CONFIG[sourceId].route,
      target_file: EXPANSION_SOURCE_CONFIG[sourceId].target_file,
      required_next_step: EXPANSION_SOURCE_CONFIG[sourceId].required_next_step,
    };
  }
  if (projectRank && completionRanks.has(String(Number(projectRank)))) {
    return {
      route: "high_blocking_response_intake",
      target_file: "data/review/high-blocking-source-response-intake.json",
      required_next_step: "process-high-blocking-response-workflow dry-run에서 ready_to_append 또는 보류 사유 확인",
    };
  }
  if (["seoul_urban_notice", "district_notice", "seoul_sibo"].includes(sourceId)) {
    return {
      route: "source_verification_decision",
      target_file: "data/review/source-verification-closure-decisions.json",
      required_next_step: "고시번호·고시일·원문 URL·첨부명·본문 텍스트를 대조하고 confirmed/pending/conflict 판정",
    };
  }
  if (["cleanup_project_status", "cleanup_notice"].includes(sourceId)) {
    return {
      route: "project_note_and_risk_review",
      target_file: "project-notes/*.md; analysis/project-risk-signal-summary.md",
      required_next_step: "단계 변경·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영",
    };
  }
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId)) {
    return {
      route: "official_context_source",
      target_file: "analysis/official-context-sources.csv",
      required_next_step: "context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류",
    };
  }
  if (["seoul_open_data", "molit_data_go_kr", "r_one"].includes(sourceId)) {
    return {
      route: "market_manual_or_api_intake",
      target_file: "data/market/manual-import/download-intake.json 또는 data/market/manual-import/files/",
      required_next_step: "원자료 파일을 보존하고 normalization audit 재생성 후 시장 보조 신호로만 사용",
    };
  }
  return {
    route: "manual_triage",
    target_file: "data/review/official-update-intake.json",
    required_next_step: "source_id, title, official_url, evidence_status를 보완하고 intake board를 재생성",
  };
}

function sourceScenarioTitle(row) {
  if (EXPANSION_SOURCE_CONFIG[row.source_id]) return EXPANSION_SOURCE_CONFIG[row.source_id].title;
  const titles = {
    seoul_urban_notice: "관심구 정비계획/도시관리계획 고시가 새로 뜬 경우",
    district_notice: "자치구 조합설립인가·정비계획 공고 후보를 발견한 경우",
    seoul_sibo: "서울시보에서 고시번호와 PDF 원문을 찾은 경우",
    cleanup_project_status: "정보몽땅 사업 단계나 공개자료 수가 바뀐 경우",
    cleanup_notice: "정보몽땅 공고/입찰/총회 공개항목이 추가된 경우",
    seoul_citybuild_news: "서울시 도시계획·주택 보도자료나 업무계획이 나온 경우",
    seoul_traffic_news: "교통계획·환승·도로·보행 정책 업데이트를 발견한 경우",
    opengov: "정보소통광장 결재문서나 위원회 자료를 발견한 경우",
    seoul_urban_alert: "서울도시공간포털 알림서비스에서 noticeCode를 받은 경우",
    molit_data_go_kr: "국토부 실거래 원자료 최신월을 받는 경우",
    r_one: "R-ONE 월간 지표가 갱신된 경우",
    seoul_open_data: "서울 열린데이터광장 파일/API가 갱신된 경우",
  };
  return titles[row.source_id] || `${row.source_name} 업데이트 발견`;
}

function pickProject(row, impactRows, projectByRank, completionRanks) {
  if (EXPANSION_SOURCE_CONFIG[row.source_id]) {
    return {
      rank: "",
      project_name: EXPANSION_SOURCE_CONFIG[row.source_id].sample_project_name,
      focus_area: EXPANSION_SOURCE_CONFIG[row.source_id].focus_area,
    };
  }
  const sourceText = `${row.source_id} ${row.top_impacted_projects || ""} ${row.high_blocking_project_count || ""}`;
  const highBlocking = impactRows.find((item) => completionRanks.has(String(Number(item.rank))) && /official_response|recordcode|high_blocking/.test(item.signal_types || item.runbook_id || ""));
  if (/district|sibo|urban/.test(sourceText) && highBlocking) return projectByRank.get(String(Number(highBlocking.rank))) || highBlocking;
  const firstRank = String(row.top_impacted_projects || "").match(/^(\d+)\./)?.[1];
  if (firstRank && projectByRank.has(String(Number(firstRank)))) return projectByRank.get(String(Number(firstRank)));
  const impact = impactRows.find((item) => String(row.top_impacted_projects || "").includes(`${item.rank}.`)) || impactRows[0];
  return impact ? projectByRank.get(String(Number(impact.rank))) || impact : {};
}

function buildRows({ changeRows, intakeTemplates, impactRows, projectRows, completionRows }) {
  const projectByRank = new Map(projectRows.map((row) => [String(Number(row.rank)), row]));
  const completionRanks = new Set(
    completionRows
      .map((row) => String(row.task_id || "").match(/SRC-P(\d+)/)?.[1])
      .filter(Boolean)
      .map((rank) => String(Number(rank))),
  );
  const templateBySource = new Map(intakeTemplates.map((row) => [row.source_id, row]));

  return changeRows.map((row) => {
    const project = pickProject(row, impactRows, projectByRank, completionRanks);
    const rank = project.rank ? String(Number(project.rank)) : "";
    const route = routeFor(row.source_id, rank, completionRanks);
    const evidenceStatus = evidenceStatusFor(row.source_id);
    const triggerType = triggerTypeForSource(row.source_id);
    const sampleIntake = {
      update_id: `upd-YYYYMMDD-${row.source_id}`,
      discovered_at: "YYYY-MM-DD KST",
      source_id: row.source_id,
      trigger_type: triggerType,
      project_rank: rank || undefined,
      project_name: project.project_name || undefined,
      title: sourceScenarioTitle(row),
      official_url: "https://...",
      notice_no: row.source_id.includes("notice") || row.source_id === "seoul_sibo" ? "고시/공고번호 입력" : undefined,
      attachment_paths: "data/.../원문파일 또는 빈값",
      local_text_paths: evidenceStatus === "needs_text_extraction" ? "data/.../extracted.txt" : undefined,
      evidence_status: evidenceStatus,
      decision_status: "inbox",
      observed_change: row.change_signal,
      notes: "원문 확인 전에는 확정값으로 승격하지 않음",
    };
    Object.keys(sampleIntake).forEach((key) => sampleIntake[key] === undefined && delete sampleIntake[key]);

    return {
      source_id: row.source_id,
      source_name: row.source_name,
      scenario: sourceScenarioTitle(row),
      trigger_type: triggerType,
      sample_project_rank: rank,
      sample_project_name: project.project_name || "",
      focus_area: project.focus_area || "",
      evidence_status: evidenceStatus,
      decision_status: "inbox",
      route: route.route,
      target_file: route.target_file,
      first_files: compact([row.first_outputs_to_read, templateBySource.get(row.source_id)?.first_route, project.project_note], 4),
      first_action: templateBySource.get(row.source_id)?.first_action || row.first_command_or_action || row.next_action,
      decision_gate: row.decision_gate,
      required_next_step: route.required_next_step,
      affected_outputs: row.affected_outputs,
      sample_intake_json: JSON.stringify(sampleIntake, null, 2),
    };
  });
}

function summarize(rows) {
  const countBy = (field) =>
    Object.entries(
      rows.reduce((acc, row) => {
        const key = row[field] || "미분류";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `${key} ${count}`)
      .join("; ");

  return {
    generated_at: UPDATED_AT,
    scenario_count: rows.length,
    routed_scenario_count: rows.filter((row) => row.route !== "manual_triage").length,
    high_blocking_scenario_count: rows.filter((row) => row.route === "high_blocking_response_intake").length,
    context_only_scenario_count: rows.filter((row) => row.evidence_status === "context_only").length,
    needs_text_extraction_count: rows.filter((row) => row.evidence_status === "needs_text_extraction").length,
    route_mix: countBy("route"),
    evidence_mix: countBy("evidence_status"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const sampleRows = rows.slice(0, 5);
  return `# 공식 업데이트 시나리오 플레이북

작성 기준: ${UPDATED_AT}

이 문서는 새 공식 업데이트를 발견했을 때 \`data/review/official-update-intake.json\`에 어떤 형태로 적고, 어느 검증 장부로 넘길지 시나리오별로 고정한다. 원격 사이트를 직접 호출하지 않고 현재 변경 감지 보드와 intake 라우팅 규칙만 사용한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 시나리오 | ${summary.scenario_count} |
| 라우팅 가능 | ${summary.routed_scenario_count} |
| 완료 병목 직결 | ${summary.high_blocking_scenario_count} |
| context_only | ${summary.context_only_scenario_count} |
| 텍스트 추출 필요 | ${summary.needs_text_extraction_count} |

| 구분 | 값 |
| --- | --- |
| route | ${summary.route_mix} |
| evidence | ${summary.evidence_mix} |

## 시나리오별 처리표

${mdTable(rows, [
    { key: "source_id", label: "출처" },
    { key: "scenario", label: "상황" },
    { key: "sample_project_rank", label: "예시 순위" },
    { key: "sample_project_name", label: "예시 사업" },
    { key: "trigger_type", label: "trigger" },
    { key: "evidence_status", label: "증거상태" },
    { key: "route", label: "route" },
    { key: "target_file", label: "기록 위치" },
    { key: "decision_gate", label: "판정 gate" },
    { key: "required_next_step", label: "다음 검증" },
  ])}

## Intake JSON 예시

아래 예시는 실제 값이 아니라 입력 형식이다. \`official_url\`, \`attachment_paths\`, \`local_text_paths\`는 실제 공식 URL과 로컬 원문 경로로 교체한다.

${sampleRows
    .map(
      (row) => `### ${row.source_id}

\`\`\`json
${row.sample_intake_json}
\`\`\`
`,
    )
    .join("\n")}
## 운영 원칙

- \`context_only\`는 생활권 가설 참고 신호일 뿐 단계·수치 확정 근거가 아니다.
- \`needs_text_extraction\`은 원문 URL이나 첨부를 확보해도 본문 텍스트와 숫자를 대조하기 전까지 확정하지 않는다.
- 완료 병목 3건과 연결되는 업데이트는 일반 source decision보다 \`high_blocking_source_response_intake.json\`을 먼저 갱신한다.
- \`gangdong_district_notice\`, \`jung_district_notice\`는 확장 관심권 운영 루프다. direct hit 또는 원문 확보 전까지는 \`expansion_zone_latest_check\` 경로에 둔다.
- intake를 수정한 뒤에는 \`node scripts/generate-official-update-intake-board.mjs\`로 검증하고, 마지막에 \`node scripts/regenerate-research-artifacts.mjs\`를 실행한다.
`;
}

async function main() {
  const [changeBoard, intakeBoard, updateImpactLedger, projectMatrix, completionCockpit] = await Promise.all([
    readJson(INPUTS.changeBoard),
    readJson(INPUTS.intakeBoard),
    readJson(INPUTS.updateImpactLedger),
    readJson(INPUTS.projectMatrix),
    readJson(INPUTS.completionCockpit),
  ]);
  const rows = buildRows({
    changeRows: rowsFrom(changeBoard),
    intakeTemplates: intakeBoard.templateRows || [],
    impactRows: updateImpactLedger.project_rows || [],
    projectRows: rowsFrom(projectMatrix),
    completionRows: rowsFrom(completionCockpit),
  });
  const summary = summarize(rows);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ scenarios: rows.length, output: "analysis/official-update-scenario-playbook.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
