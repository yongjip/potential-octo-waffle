#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/yongjip/Projects/potential-octo-waffle";

const INPUTS = {
  expansionBrief: "analysis/expansion-interest-zone-brief.json",
  shortlist: "analysis/expansion-interest-zone-shortlist.json",
  gangdongWatch: "analysis/expansion-gangdong-stage-watch-board.json",
  yaksuOcr: "analysis/expansion-yaksu-ocr-recheck-board.json",
  latestCheckAudit: "analysis/expansion-official-latest-check-audit.json",
  activationIntake: "data/review/official-source-activation-intake.json",
  monitoringBoard: "analysis/life-area-monitoring-board.json",
};

const OUT_MD = "analysis/expansion-zone-latest-check-guide.md";
const OUT_JSON = "analysis/expansion-zone-latest-check-guide.json";
const OUT_CSV = "analysis/expansion-zone-latest-check-guide.csv";

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

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function webLink(label, url) {
  return `[${label}](${url})`;
}

function fileLink(relPath) {
  return `[${path.basename(relPath)}](${ROOT}/${relPath})`;
}

function findBy(rows, key, value) {
  return (rows || []).find((row) => String(row[key] || "").trim() === String(value || "").trim()) || {};
}

function splitSemi(text) {
  return String(text || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function compact(values, joiner = "; ") {
  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))].join(joiner);
}

function formatUrls(entry) {
  const urls = [entry.official_url, ...splitSemi(entry.supporting_urls)];
  const labels = [];
  for (const url of urls) {
    if (url.includes("gangdong.go.kr")) labels.push(webLink("강동구 고시공고", url));
    else if (url.includes("junggu.seoul.kr")) labels.push(webLink("중구 고시공고", url));
    else if (url.includes("urban.seoul.go.kr")) labels.push(webLink("서울도시공간포털", url));
    else if (url.includes("cleanup.seoul.go.kr")) labels.push(webLink("정비사업 정보몽땅", url));
    else labels.push(webLink(url, url));
  }
  return labels.join("<br>");
}

function buildZoneRecords(expansionBrief, monitoringBoard, activationIntake) {
  const monitoringRows = monitoringBoard.expansion_zone_rows || [];
  return (expansionBrief.rows || []).map((zone) => {
    const activation = activationIntake.find((entry) => {
      if (zone.zone_name === "강동권") return entry.source_id === "gangdong_district_notice";
      if (zone.zone_name === "약수동 주변") return entry.source_id === "jung_district_notice";
      return false;
    }) || {};
    const monitoring = findBy(monitoringRows, "zone_name", zone.zone_name);
    return {
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      core_reference: monitoring.core_reference || zone.relationship_to_core || "",
      current_state: monitoring.current_state || zone.current_system_status || "",
      operational_state: zone.operational_state || monitoring.stage_state || "",
      next_check_at: activation.next_check_at || "",
      search_keywords: activation.search_keywords || "",
      first_urls: formatUrls(activation),
      first_urls_plain: compact([activation.official_url, activation.supporting_urls]),
      current_baseline: compact([
        zone.current_system_status,
        zone.operational_state,
        monitoring.stage_state,
      ]),
      priority_action: monitoring.priority_action || zone.next_system_move || "",
      caution: zone.caution || monitoring.key_caution || "",
      activation_gap: zone.activation_gap || "",
      first_manual_runbook: zone.first_manual_runbook || "",
      update_files:
        zone.zone_name === "강동권"
          ? [
              "analysis/expansion-gangdong-stage-watch-board.md",
              "analysis/expansion-interest-zone-shortlist.md",
              "analysis/expansion-interest-zone-brief.md",
              "analysis/life-area-monitoring-board.md",
              "analysis/life-area-extended-comparison-board.md",
            ]
          : [
              "analysis/expansion-yaksu-ocr-recheck-board.md",
              "analysis/expansion-interest-zone-shortlist.md",
              "analysis/expansion-interest-zone-brief.md",
              "analysis/life-area-monitoring-board.md",
              "analysis/life-area-extended-comparison-board.md",
            ],
    };
  });
}

function buildGangdongRows(gangdongWatch) {
  return (gangdongWatch.rows || []).map((row) => ({
    zone_name: "강동권",
    project_name: row.project_name,
    candidate_type: row.candidate_type,
    priority: row.stage_watch_priority,
    notice_no: row.notice_no,
    notice_date: row.notice_date,
    current_signal: row.latest_public_signal,
    stage_status: row.latest_stage_status_label,
    stage_basis: row.latest_stage_basis,
    confirmed_value: row.value_snapshot,
    caution: row.caution,
    next_action: row.next_stage_refresh_action,
    public_entry_url: row.public_entry_url || "https://urban.seoul.go.kr/view/html/PMNU4030600001",
    noticecode_reference: row.noticecode_reference || row.urban_notice_code || "",
  }));
}

function buildYaksuRows(yaksuOcr, shortlist) {
  return (yaksuOcr.rows || []).map((row) => {
    const shortlistRow = findBy(shortlist.rows || [], "shortlist_id", row.shortlist_id);
    return {
      zone_name: "약수동 주변",
      project_name: row.project_name,
      candidate_type: shortlistRow.candidate_type || "adjacent_project",
      priority: shortlistRow.shortlist_priority || "",
      notice_no: shortlistRow.notice_no || "",
      notice_date: shortlistRow.notice_date || "",
      current_signal: row.stage_signal,
      stage_status: row.verification_state,
      stage_basis: row.confirmation_basis,
      confirmed_value: row.confirmed_snapshot,
      caution: row.rejected_or_reframed,
      next_action: shortlistRow.next_action || row.downstream_change,
      public_entry_url: shortlistRow.official_url || "https://urban.seoul.go.kr/view/html/PMNU4030600001",
      noticecode_reference: shortlistRow.urban_notice_code || "",
    };
  });
}

function summarize(zoneRecords, gangdongRows, yaksuRows) {
  const detailRows = [...gangdongRows, ...yaksuRows];
  return {
    generated_at: `${kstDate()} KST`,
    zone_count: zoneRecords.length,
    total_detail_rows: gangdongRows.length + yaksuRows.length,
    gangdong_watch_count: gangdongRows.length,
    yaksu_baseline_count: yaksuRows.length,
    confirmed_snapshot_count: detailRows.filter((row) => String(row.confirmed_value || "").trim()).length,
    latest_stage_gap_project_count: gangdongRows.filter((row) => row.stage_status === "최신 단계 공백").length,
    manual_loop_zone_count: zoneRecords.filter((row) => String(row.current_baseline).includes("수동")).length,
    inputs: Object.values(INPUTS),
    outputs: [OUT_MD, OUT_JSON, OUT_CSV],
  };
}

function renderZoneSection(zone, detailRows) {
  const isGangdong = zone.zone_name === "강동권";
  const title = isGangdong ? "1. 강동권" : "2. 약수동 주변";
  const changeSignals = isGangdong
    ? [
        "강동구 고시공고나 정비사업 정보몽땅에서 천호3구역, 신동아1·2차, 성내미주와 같은 공식 사업명으로 `조합설립`, `사업시행`, `관리처분` 단계 공개가 새로 확인될 때",
        "기존 고시번호 뒤에 같은 사업명의 새 `고시번호`, `고시일`, `첨부 원문`이 붙을 때",
        "정보몽땅 공개항목·조합입찰공고에서 기반시설, 이주, 철거, 착공 성격의 새 문서가 확인될 때",
      ]
    : [
        "중구 고시공고나 정비사업 정보몽땅에서 약수역 생활권 direct hit가 새로 확인되고 `사업명`, `고시번호`, `고시일`, `위치`가 닫힐 때",
        "신당8·신당9·금호14-1과 충돌하는 OCR 숫자가 아니라 정식 표·고시 원문 기준의 새 수치가 확인될 때",
        "약수역-청구역-신금호축 직접 사업장이 생겨 adjacent 대조군이 direct 비교 후보로 바뀔 때",
      ];
  const noiseSignals = isGangdong
    ? [
        "정비구역·촉진계획 `경미변경 고시` 하나만 보고 사업 전체 최신 단계를 올리는 것",
        "2016년·2020년 같은 오래된 고시를 다시 찾았다는 이유만으로 최신 변화로 처리하는 것",
        "`길동 43번지` 같은 generic 식별을 direct 사업장으로 바로 승격하는 것",
      ]
    : [
        "신당8 OCR 서술부의 `세대수 712`를 정식 표보다 우선해서 쓰는 것",
        "신당9 `181%`를 현재 비교값으로 다시 올리는 것",
        "성동구 금호14-1 인접 대조군을 약수권 direct hit처럼 취급하는 것",
      ];
  const updateFiles = zone.update_files.map((relPath) => `- ${fileLink(relPath)}`).join("\n");
  const quickTable = mdTable(
    [
      {
        current_state: zone.current_state,
        core_reference: zone.core_reference,
        next_check_at: zone.next_check_at,
        first_urls: zone.first_urls,
        current_baseline: zone.current_baseline,
        priority_action: zone.priority_action,
      },
    ],
    [
      { key: "current_state", label: "현재 상태" },
      { key: "core_reference", label: "핵심 연결" },
      { key: "next_check_at", label: "다음 점검일" },
      { key: "first_urls", label: "먼저 열 URL" },
      { key: "current_baseline", label: "현재 기준선" },
      { key: "priority_action", label: "가장 먼저 할 일" },
    ],
  );
  const detailTable = mdTable(
    detailRows,
    isGangdong
      ? [
          { key: "project_name", label: "사업" },
          { key: "priority", label: "우선" },
          { key: "current_signal", label: "현재 공개신호" },
          { key: "stage_status", label: "현재 해석" },
          { key: "confirmed_value", label: "지금 써도 되는 값" },
          { key: "next_action", label: "다음 재확인" },
        ]
      : [
          { key: "project_name", label: "사업" },
          { key: "candidate_type", label: "구분" },
          { key: "current_signal", label: "현재 공개신호" },
          { key: "confirmed_value", label: "confirmed 기준값" },
          { key: "caution", label: "폐기/정정 규칙" },
          { key: "next_action", label: "다음 재확인" },
        ],
  );
  return `## ${title}

${quickTable}

### 기준 사업

${detailTable}

### 변화로 인정할 신호

${changeSignals.map((item) => `- ${item}`).join("\n")}

### 노이즈로만 둘 신호

${noiseSignals.map((item) => `- ${item}`).join("\n")}

### 변화가 나오면 먼저 고칠 파일

${updateFiles}
`;
}

function markdown(summary, zoneRecords, gangdongRows, yaksuRows) {
  const gangdong = zoneRecords.find((row) => row.zone_name === "강동권");
  const yaksu = zoneRecords.find((row) => row.zone_name === "약수동 주변");

  return `# 확장 관심권 최신 확인 가이드

작성 기준: ${summary.generated_at}

이 문서는 강동권과 약수동 주변 확장 관심권을 다음 주 점검 때 바로 다시 열 수 있게 만든 실전용 가이드다. 강동권은 최신 단계 공백 관리, 약수동 주변은 confirmed 기준값 유지와 direct hit 발굴을 분리해서 다룬다.

## 요약

- 권역 수: ${summary.zone_count}
- 상세 추적 행: ${summary.total_detail_rows}
- 강동권 추적 사업: ${summary.gangdong_watch_count}
- 약수권 기준선 사업: ${summary.yaksu_baseline_count}
- 강동권 최신 단계 공백 사업: ${summary.latest_stage_gap_project_count}
- 현재 기준값 바로 사용 가능한 행: ${summary.confirmed_snapshot_count}

## 공통 원칙

1. 확장 관심권은 핵심 3생활권의 대체 점수판이 아니라 비교축 보강용이다.
2. \`고시번호\`, \`고시일\`, \`원문 URL\`, \`공개항목 본문\`, \`첨부 원문\`, \`기준일\`이 닫히기 전에는 단계 승격을 하지 않는다.
3. 강동권의 정비구역·촉진계획 변경 고시는 값 기준선으로만 쓰고, 최신 인허가 단계는 구청 고시공고와 정보몽땅으로 다시 닫는다.
4. 약수동 주변은 OCR 숫자보다 정식 표·원문 이미지를 우선한다. 충돌값은 폐기 규칙까지 같이 기록한다.

## 빠른 실행 순서

1. ${fileLink("analysis/life-area-extended-comparison-board.md")}를 열어 핵심 3생활권과 확장 2권역을 같은 축으로 본다.
2. ${fileLink("analysis/expansion-zone-latest-check-guide.md")}를 열어 강동권과 약수권 중 어느 루프를 탈지 고른다.
3. 강동권이면 ${fileLink("analysis/expansion-gangdong-stage-watch-board.md")}, 약수권이면 ${fileLink("analysis/expansion-yaksu-ocr-recheck-board.md")}를 바로 연다.
4. ${fileLink("analysis/expansion-official-latest-check-audit.md")}를 열어 진입 페이지 검색 결과와 \`noticeCode\` 직접 접근 차단 여부를 먼저 확인한다.
5. intake에 무엇을 새로 만들고 무엇을 기존 row로 재사용할지 애매하면 ${fileLink("analysis/expansion-zone-intake-seed-board.md")}를 먼저 열어 source_id와 copy-ready JSON을 고른다.
6. 변화가 실제 신호인지 확인한 뒤 ${fileLink("analysis/expansion-interest-zone-shortlist.md")}와 ${fileLink("analysis/expansion-interest-zone-brief.md")}를 먼저 고친다.
7. 마지막에 ${fileLink("analysis/life-area-monitoring-board.md")}와 ${fileLink("analysis/life-area-extended-comparison-board.md")}를 갱신해 핵심 생활권 비교판에 반영한다.

${renderZoneSection(gangdong, gangdongRows)}

${renderZoneSection(yaksu, yaksuRows)}

## 공통 기록 순서

1. 새 고시·공고·공개항목은 먼저 ${fileLink("data/review/official-source-activation-intake.json")} 또는 update intake에 기록한다.
2. create/reuse 판단이 서지 않으면 ${fileLink("analysis/expansion-zone-intake-seed-board.md")}에서 seed를 복사해 source_id와 기존 update_id 재사용 여부를 먼저 정한다.
3. 강동권 direct hit 변화는 ${fileLink("analysis/expansion-gangdong-stage-watch-board.md")}를 먼저 고친다.
4. 약수권 값 변화나 direct hit 보강은 ${fileLink("analysis/expansion-yaksu-ocr-recheck-board.md")}와 ${fileLink("analysis/expansion-interest-zone-shortlist.md")}를 먼저 고친다.
5. 그 다음 ${fileLink("analysis/life-area-monitoring-board.md")}와 ${fileLink("analysis/life-area-extended-comparison-board.md")}에 반영한다.
6. 주간 점검 로그에는 ${fileLink("analysis/weekly-monitoring-execution-log.md")}를 사용한다.

## 현재형 웹 확인 메모

- 서울도시공간포털 정비사업구역계 진입 페이지는 ${webLink("PMNU4030600001", "https://urban.seoul.go.kr/view/html/PMNU4030600001")}를 기준으로 쓴다.
- \`천호3구역\`은 위 진입 페이지 검색에서 \`총 1건\`이 확인된 현재형 신호다. 강동권 direct hit이 살아 있다는 뜻이다.
- \`약수역\`은 같은 진입 페이지 검색에서 \`총 0건\`이 확인됐다. 현재 direct hit이 안 보인다는 뜻이지, 영구 부재 판정은 아니다.
- \`https://urban.seoul.go.kr/view/ntfc/mapForm.pop?noticeCode=...\` 형태 URL은 standalone 공개 진입 URL로 쓰지 않는다. \`noticeCode\`는 식별자 참조로만 남기고, 실제 재확인은 진입 페이지 검색으로 다시 들어간다.
`;
}

async function main() {
  const [expansionBrief, shortlist, gangdongWatch, yaksuOcr, latestCheckAudit, activationIntake, monitoringBoard] = await Promise.all([
    readJson(INPUTS.expansionBrief),
    readJson(INPUTS.shortlist),
    readJson(INPUTS.gangdongWatch),
    readJson(INPUTS.yaksuOcr),
    readJson(INPUTS.latestCheckAudit),
    readJson(INPUTS.activationIntake),
    readJson(INPUTS.monitoringBoard),
  ]);

  void latestCheckAudit;

  const zoneRecords = buildZoneRecords(expansionBrief, monitoringBoard, activationIntake);
  const gangdongRows = buildGangdongRows(gangdongWatch);
  const yaksuRows = buildYaksuRows(yaksuOcr, shortlist);
  const summary = summarize(zoneRecords, gangdongRows, yaksuRows);
  const detailRows = [...gangdongRows, ...yaksuRows];

  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify({ summary, zones: zoneRecords, detail_rows: detailRows }, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(detailRows));
  await writeFile(OUT_MD, `${markdown(summary, zoneRecords, gangdongRows, yaksuRows)}\n`);
  console.log(JSON.stringify({ zones: zoneRecords.length, detail_rows: detailRows.length, output: [OUT_MD, OUT_JSON, OUT_CSV] }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
