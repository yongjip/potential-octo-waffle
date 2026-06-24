#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_MD = path.join(OUT_DIR, "official-change-detection-board.md");
const OUT_CSV = path.join(OUT_DIR, "official-change-detection-board.csv");
const OUT_JSON = path.join(OUT_DIR, "official-change-detection-board.json");

const INPUTS = {
  registry: "analysis/official-update-registry.json",
  freshnessLedger: "analysis/official-source-freshness-ledger.json",
  runbookChecklist: "analysis/official-update-runbook-checklist.json",
  updateImpactLedger: "analysis/update-impact-ledger.json",
  catalystTriggerMatrix: "analysis/catalyst-trigger-matrix.json",
  completionCockpit: "analysis/research-completion-cockpit.json",
};

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

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function compact(items, limit = 5) {
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
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `${key} ${count}`)
    .join("; ");
}

function sourceRunbooks(sourceId, recommendedRunbook) {
  const mapping = {
    seoul_urban_notice: ["weekly_primary_refresh", "recordcode_bottleneck_probe", "text_extraction_and_hwp_qa"],
    cleanup_project_status: ["weekly_primary_refresh"],
    cleanup_notice: ["weekly_primary_refresh", "text_extraction_and_hwp_qa"],
    seoul_sibo: ["recordcode_bottleneck_probe", "text_extraction_and_hwp_qa"],
    district_notice: ["recordcode_bottleneck_probe", "text_extraction_and_hwp_qa", "high_blocking_public_web_probe"],
    gangdong_district_notice: ["expansion_zone_latest_check", "expansion_interest_zone_bootstrap"],
    jung_district_notice: ["expansion_zone_latest_check", "expansion_interest_zone_bootstrap"],
    seoul_citybuild_news: ["monthly_context_scan"],
    seoul_traffic_news: ["monthly_context_scan"],
    opengov: ["monthly_context_scan"],
    seoul_open_data: ["monthly_market_data_refresh"],
    molit_data_go_kr: ["monthly_market_data_refresh"],
    r_one: ["monthly_market_data_refresh"],
    seoul_urban_alert: ["manual_subscription", "weekly_primary_refresh"],
  };
  return compact([recommendedRunbook, ...(mapping[sourceId] || [])], 6).split("; ").filter(Boolean);
}

function detectionMode(row, source) {
  if (source.source_id === "seoul_urban_alert") return "수동 알림 수신 후 noticeCode/고시번호 기록";
  if (/api_key_needed/.test(row.freshness_status || source.automation_status || "")) return "API 키 연결 후 원자료 재수집";
  if (/manual/.test(row.freshness_status || source.automation_status || "")) return "수동 검색 후 context/원문 링크 기록";
  if (/cleanup/.test(source.source_id)) return "로컬 snapshot diff와 공개게시판 최신글 비교";
  if (/urban|sibo|district/.test(source.source_id)) return "고시번호·recordCode·첨부 원문 텍스트 추출 비교";
  return "정기 런북 실행 후 로컬 산출물 diff 확인";
}

function matchingProjects(sourceId, runbookIds, projectRows, completionRows) {
  const completionProjectNames = new Set(completionRows.map((row) => String(row.project_name || "").trim()).filter(Boolean));
  return projectRows.filter((row) => {
    const signal = `${row.signal_types || ""} ${row.runbook_id || ""} ${row.focus_area || ""}`;
    if (runbookIds.includes(row.runbook_id)) return true;
    if (sourceId === "seoul_urban_notice" && /recordcode|official_response|public_plan/.test(signal)) return true;
    if (sourceId === "district_notice" && /recordcode|official_response/.test(signal)) return true;
    if (sourceId === "seoul_sibo" && /recordcode|official_response/.test(signal)) return true;
    if (sourceId === "cleanup_project_status" && /weekly_status_refresh|schedule|risk/.test(signal)) return true;
    if (sourceId === "cleanup_notice" && /cost_infra|schedule|weekly_status_refresh/.test(signal)) return true;
    if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId) && /public_plan_or_transport_catalyst|fieldwork/.test(signal)) return true;
    if (sourceId === "seoul_urban_alert" && completionProjectNames.has(String(row.project_name || "").trim())) return true;
    return false;
  });
}

function matchingCatalysts(sourceId, catalysts) {
  const sourceText = {
    seoul_citybuild_news: /MICE|국제교류|동서울|한강|사전협상|도시계획|광진|잠실|압구정|대치/,
    seoul_traffic_news: /교통|환승|역|도시철도|보행|도로|강변|잠실|광나루/,
    opengov: /심의|결재|위원회|사전협상|MICE|동서울|한강|도시계획/,
    seoul_urban_notice: /고시|계획|도시|정비|지구단위|시설/,
    district_notice: /고시|공고|정비|조합|인가/,
    seoul_sibo: /고시|공고|정비|도시/,
  }[sourceId];
  if (!sourceText) return [];
  return catalysts.filter((row) => sourceText.test(`${row.catalyst_name || ""} ${row.promotion_trigger || ""} ${row.proof_gate || ""}`));
}

function commandFor(sourceId, runbookId, runbooks) {
  const sourceCommands = {
    seoul_urban_notice: "node scripts/fetch-urban-map-details.mjs -> node scripts/fetch-urban-notice-details.mjs --download",
    cleanup_project_status: "node scripts/fetch-cleanup-projects.mjs -> node scripts/fetch-project-summaries.mjs",
    cleanup_notice: "node scripts/fetch-cafe-menu-links.mjs -> node scripts/fetch-cleanup-board-latest.mjs",
    seoul_sibo: "서울시보 최신 권호 수동 검색 -> scripts/extract_seoul_sibo_text.py 또는 scripts/ocr-seoul-sibo-page-range.mjs",
    district_notice: "node scripts/fetch-gwangjin-gu-notice-candidates.mjs -> node scripts/probe-gangnam-songpa-notices.mjs --download",
    gangdong_district_notice: "수동 검색: 강동구 고시공고 -> 천호3구역·신동아1·2차·성내미주 최신 단계 확인 -> 결과를 official-update-intake 또는 activation intake에 기록",
    jung_district_notice: "수동 검색: 중구 고시공고 -> 약수역 direct hit 여부와 신당·청구 인접 비교군 확인 -> 결과를 official-update-intake 또는 activation intake에 기록",
    seoul_citybuild_news: "수동 검색: 서울시 주택·도시계획 분야",
    seoul_traffic_news: "수동 검색: 서울시 교통 분야",
    opengov: "수동 검색: 서울 정보소통광장",
    seoul_urban_alert: "서울도시공간포털 알림서비스 수동 신청 후 수신 noticeCode 기록",
    seoul_open_data: "node scripts/generate-market-data-matrix.mjs -> API 키 연결 후 수집",
    molit_data_go_kr: "DATA_GO_KR_SERVICE_KEY 연결 후 node scripts/fetch-market-raw-data.mjs",
    r_one: "R-ONE 지표 코드 수동 확정 후 data/market intake 갱신",
  };
  if (sourceCommands[sourceId]) return sourceCommands[sourceId];
  const row = runbooks.find((item) => item.runbook_id === runbookId);
  if (!row) return "node scripts/regenerate-research-artifacts.mjs";
  const networkStep = runbooks.find((item) => item.runbook_id === runbookId && item.status === "network_required");
  return networkStep?.command || row.command || row.trigger || "node scripts/regenerate-research-artifacts.mjs";
}

function decisionGate(sourceId, projects, catalysts) {
  if (["district_notice", "seoul_sibo", "seoul_urban_notice"].includes(sourceId)) {
    return "고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격";
  }
  if (["gangdong_district_notice", "jung_district_notice"].includes(sourceId)) {
    return "확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다.";
  }
  if (["cleanup_project_status", "cleanup_notice"].includes(sourceId)) {
    return "단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신";
  }
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId)) {
    return "보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격";
  }
  if (sourceId === "seoul_urban_alert") return "알림 수신 내용은 검색 출발점이다. 원문 고시/공고를 열기 전에는 확정 근거로 쓰지 않음";
  if (/data_go|open_data|r_one/.test(sourceId)) return "시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용";
  return projects.length || catalysts.length ? "영향받는 사업장 메모와 가설 장부를 재생성한 뒤 승격/보류/하향 판정" : "정기 추적 유지";
}

function intakeTarget(sourceId) {
  if (sourceId === "seoul_urban_alert") return "analysis/official-update-registry.md 또는 수동 알림 메모";
  if (["district_notice", "seoul_sibo", "seoul_urban_notice"].includes(sourceId)) return "data/review/source-verification-closure-decisions.json";
  if (["gangdong_district_notice", "jung_district_notice"].includes(sourceId)) return "data/review/official-source-activation-intake.json 또는 data/review/official-update-intake.json";
  if (["cleanup_project_status", "cleanup_notice"].includes(sourceId)) return "원격 수집 산출물과 project-notes/*.md";
  if (["seoul_citybuild_news", "seoul_traffic_news", "opengov"].includes(sourceId)) return "analysis/official-context-sources.csv";
  if (/data_go|open_data|r_one/.test(sourceId)) return "data/market/ 원자료 및 normalization 산출물";
  return "analysis/update-impact-ledger.md";
}

function buildRows({ registry, freshnessRows, runbookChecklist, updateImpactLedger, catalystRows, completionRows }) {
  const freshnessById = new Map(freshnessRows.map((row) => [row.source_id, row]));
  const runbookRows = runbookChecklist.checklistRows || [];
  const projectRows = updateImpactLedger.project_rows || [];

  return registry
    .map((source) => {
      const fresh = freshnessById.get(source.source_id) || {};
      const runbooks = sourceRunbooks(source.source_id, fresh.recommended_runbook);
      const projects = matchingProjects(source.source_id, runbooks, projectRows, completionRows);
      const catalysts = matchingCatalysts(source.source_id, catalystRows);
      const canCloseHighBlocking = ["seoul_urban_notice", "district_notice", "seoul_sibo", "cleanup_project_status", "cleanup_notice", "seoul_urban_alert"].includes(
        source.source_id,
      );
      const highBlockingProjects = canCloseHighBlocking ? projects.filter((row) => row.completion_task || /high_blocking/.test(row.runbook_id || "")) : [];
      const topProjects = [...projects]
        .sort((a, b) => Number(b.update_priority_score || 0) - Number(a.update_priority_score || 0))
        .slice(0, 5);
      const topCatalysts = [...catalysts]
        .sort((a, b) => Number(b.trigger_priority || 0) - Number(a.trigger_priority || 0))
        .slice(0, 4);
      const primaryRunbook = runbooks[0] || fresh.recommended_runbook || "";
      const affectedOutputs = compact(
        [
          ...topProjects.flatMap((row) => String(row.affected_outputs || "").split(";")),
          ...topCatalysts.flatMap((row) => String(row.affected_outputs || "").split(";")),
          fresh.first_outputs_to_read,
        ],
        8,
      );
      const source_relevance_score =
        projects.length * 10 +
        catalysts.length * 8 +
        highBlockingProjects.length * 40 +
        (source.tier === "primary" ? 30 : 0) +
        (source.tier === "primary_backstop" ? 20 : 0) +
        (/manual|api_key/.test(fresh.freshness_status || "") ? 5 : 0);

      return {
        source_id: source.source_id,
        tier: source.tier,
        source_name: source.source_name,
        freshness_status: fresh.freshness_status_label || fresh.freshness_status || "",
        check_cadence: source.check_cadence,
        detection_mode: detectionMode(fresh, source),
        change_signal: source.update_signal,
        detection_unit: source.monitor_unit,
        primary_runbook: primaryRunbook,
        first_command_or_action: commandFor(source.source_id, primaryRunbook, runbookRows),
        first_outputs_to_read: fresh.first_outputs_to_read || source.current_local_artifacts,
        impacted_project_count: projects.length,
        high_blocking_project_count: highBlockingProjects.length,
        top_impacted_projects: compact(topProjects.map((row) => `${row.rank}. ${row.project_name}`), 5),
        catalyst_trigger_count: catalysts.length,
        top_catalysts: compact(topCatalysts.map((row) => row.catalyst_name), 4),
        intake_target: intakeTarget(source.source_id),
        decision_gate: decisionGate(source.source_id, projects, catalysts),
        affected_outputs: affectedOutputs,
        next_action: fresh.next_action || source.next_action,
        source_relevance_score,
      };
    })
    .sort((a, b) => b.source_relevance_score - a.source_relevance_score || a.source_id.localeCompare(b.source_id));
}

function summarize(rows) {
  return {
    generated_at: `${kstDate()} KST`,
    source_count: rows.length,
    primary_source_count: rows.filter((row) => ["primary", "primary_backstop"].includes(row.tier)).length,
    high_blocking_sensitive_source_count: rows.filter((row) => row.high_blocking_project_count > 0).length,
    catalyst_sensitive_source_count: rows.filter((row) => row.catalyst_trigger_count > 0).length,
    impacted_project_source_count: rows.filter((row) => row.impacted_project_count > 0).length,
    manual_or_key_source_count: rows.filter((row) => /수동|API|manual|key/.test(row.freshness_status)).length,
    freshness_mix: countBy(rows, "freshness_status"),
    tier_mix: countBy(rows, "tier"),
    runbook_mix: countBy(rows, "primary_runbook"),
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_CSV, OUT_JSON],
  };
}

function markdown(summary, rows) {
  const priorityRows = rows.filter((row) => row.tier === "primary" || row.tier === "primary_backstop" || row.high_blocking_project_count > 0).slice(0, 10);
  const fields = [
    { key: "source_id", label: "출처 ID" },
    { key: "source_name", label: "출처" },
    { key: "freshness_status", label: "상태" },
    { key: "check_cadence", label: "주기" },
    { key: "impacted_project_count", label: "영향 사업" },
    { key: "high_blocking_project_count", label: "완료 병목" },
    { key: "catalyst_trigger_count", label: "촉매" },
    { key: "primary_runbook", label: "첫 런북" },
    { key: "decision_gate", label: "판정 gate" },
  ];

  return `# 공식 출처 변경 감지 보드

작성 기준: ${summary.generated_at}

이 문서는 공식 출처에서 업데이트가 발견됐을 때 어느 단위로 감지하고, 어떤 파일을 먼저 열고, 어떤 사업장·가설·산출물을 다시 판단할지 출처 기준으로 묶는다. 원격 사이트를 직접 호출하지 않고 현재 로컬 레지스트리와 파생 장부만 사용한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 감시 출처 | ${summary.source_count} |
| 핵심 공식/백스톱 출처 | ${summary.primary_source_count} |
| 완료 병목 관련 출처 | ${summary.high_blocking_sensitive_source_count} |
| 공공 촉매 관련 출처 | ${summary.catalyst_sensitive_source_count} |
| 사업장 영향 출처 | ${summary.impacted_project_source_count} |
| 수동/API 키 필요 출처 | ${summary.manual_or_key_source_count} |

## 분포

| 구분 | 값 |
| --- | --- |
| 상태 | ${summary.freshness_mix} |
| 등급 | ${summary.tier_mix} |
| 첫 런북 | ${summary.runbook_mix} |

## 우선 감시 출처

${mdTable(priorityRows, fields)}

## 전체 변경 감지 보드

${mdTable(rows, [
    ...fields,
    { key: "detection_mode", label: "감지 방식" },
    { key: "detection_unit", label: "감지 단위" },
    { key: "change_signal", label: "변경 신호" },
    { key: "first_command_or_action", label: "첫 명령/액션" },
    { key: "first_outputs_to_read", label: "먼저 열 파일" },
    { key: "top_impacted_projects", label: "주요 사업" },
    { key: "top_catalysts", label: "주요 촉매" },
    { key: "intake_target", label: "기록 위치" },
    { key: "affected_outputs", label: "영향 산출물" },
  ])}

## 운영 원칙

- 변경 신호는 검색 시작점이다. 고시번호, 고시일, 원문 URL, 첨부명, 결정조서/도면 텍스트가 확인되기 전에는 사업 단계나 수치 근거로 승격하지 않는다.
- 정보몽땅 공개자료 수, 입찰공고, 총회 공고는 리스크 신호다. 사업시행·관리처분 수치 확정은 원문 파일 또는 공식 회신으로 닫는다.
- 보도자료, 정보소통광장, 교통 정책 문서는 context다. 가설 승격은 도시계획 결정·교통대책·심의자료 원문과 연결될 때만 한다.
- 시장 데이터는 개발 가능성 판단의 보조 신호다. 공식 고시·인가 원문보다 우선하지 않는다.
`;
}

async function main() {
  const [registry, freshnessLedger, runbookChecklist, updateImpactLedger, catalystTriggerMatrix, completionCockpit] = await Promise.all(
    Object.values(INPUTS).map((file) => readJson(file)),
  );
  const rows = buildRows({
    registry,
    freshnessRows: freshnessLedger.rows || [],
    runbookChecklist,
    updateImpactLedger,
    catalystRows: catalystTriggerMatrix.rows || [],
    completionRows: completionCockpit.rows || [],
  });
  const summary = summarize(rows);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_CSV, toCsv(rows));
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`);
  await writeFile(OUT_MD, markdown(summary, rows));
  console.log(JSON.stringify({ sources: rows.length, highBlockingSources: summary.high_blocking_sensitive_source_count, output: "analysis/official-change-detection-board.{md,csv,json}" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
