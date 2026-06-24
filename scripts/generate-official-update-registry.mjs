#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "analysis";
const OUT_JSON = path.join(OUT_DIR, "official-update-registry.json");
const OUT_CSV = path.join(OUT_DIR, "official-update-registry.csv");
const OUT_MD = path.join(OUT_DIR, "official-update-registry.md");
const OUT_RUNBOOK_JSON = path.join(OUT_DIR, "official-update-runbook.json");
const OUT_RUNBOOK_CSV = path.join(OUT_DIR, "official-update-runbook.csv");
const OUT_RUNBOOK_MD = path.join(OUT_DIR, "official-update-runbook.md");
const MATRIX_INPUT = "analysis/project-comparison-matrix.json";
const SOURCE_AUDIT_INPUT = "analysis/source-evidence-audit.json";
const EXPANSION_ZONE_COUNT = 2;

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

const SOURCES = [
  {
    source_id: "seoul_urban_notice",
    tier: "primary",
    source_name: "서울도시공간포털 결정고시/열람공고",
    url: "https://urban.seoul.go.kr/",
    area_scope: "서울 전체, 강남구/송파구/광진구 우선",
    update_signal: "정비구역 지정, 정비계획 변경, 지구단위계획 결정, 도시계획시설 결정, 열람공고",
    monitor_unit: "noticeCode, recordCode, 고시번호, 고시일, 구역명",
    check_cadence: "weekly; 관심구 고시 알림은 daily 후보",
    current_local_artifacts: "analysis/official-refresh-summary.md; data/urban/urban-map-details-priority-candidates.csv; data/urban/urban-notice-details-priority-candidates.csv; data/urban/files/; analysis/source-text-extraction-audit.md; analysis/hwp-conversion-audit.md; analysis/source-value-verification-queue.md; analysis/core-value-confirmation-ledger.md; analysis/ocr-source-verification-packet.md; analysis/ocr-source-review-triage.md; analysis/ocr-image-review-decisions.md; analysis/source-value-update-candidates.md; analysis/management-stage-value-resolution.md",
    implemented_scripts: "scripts/fetch-urban-map-details.mjs; scripts/fetch-urban-notice-details.mjs; scripts/extract_urban_notice_text.py; scripts/generate-source-text-extraction-audit.mjs; scripts/generate-hwp-conversion-audit.mjs; scripts/generate-source-value-verification-queue.mjs; scripts/generate-core-value-confirmation-ledger.mjs; scripts/generate-ocr-source-verification-packet.mjs; scripts/generate-ocr-source-review-triage.mjs; scripts/generate-ocr-image-review-decisions.mjs; scripts/generate-source-value-update-candidates.mjs; scripts/generate-management-stage-value-resolution.mjs",
    automation_status: "implemented_for_30_candidates",
    manual_step: "지도서비스 recordCode가 비어 있는 사업은 사업구역 레이어, 대표지번, 고시명 검색을 함께 확인",
    priority_for_focus_area: "very_high",
    next_action: "analysis/source-value-update-candidates.md와 analysis/core-value-confirmation-ledger.md의 ocr/source_link/value_missing 행부터 confirmed/pending/conflict 상태로 승격",
  },
  {
    source_id: "seoul_urban_alert",
    tier: "primary",
    source_name: "서울도시공간포털 알림서비스",
    url: "https://urban.seoul.go.kr/",
    area_scope: "관심 자치구 최대 5개구, 핵심 3개구+확장 관심권 2개구 후보",
    update_signal: "도시계획 결정 및 열람공고 알림",
    monitor_unit: "자치구, 휴대전화 알림",
    check_cadence: "push; 수동 신청 후 상시",
    current_local_artifacts: "",
    implemented_scripts: "",
    automation_status: "manual_subscription",
    manual_step: "강남구, 송파구, 광진구를 우선 신청하고 남는 2개 슬롯은 강동구·중구 또는 서초구/성동구에 배정",
    priority_for_focus_area: "high",
    next_action: "실제 알림 수신 후 noticeCode 또는 고시번호를 레지스트리에 수동 기록",
  },
  {
    source_id: "cleanup_project_status",
    tier: "primary",
    source_name: "정비사업 정보몽땅 사업장검색/자료공개",
    url: "https://cleanup.seoul.go.kr/",
    area_scope: "강남구, 송파구, 광진구",
    update_signal: "진행단계 변경, 공개자료 수 변화, 사업개요 수치 변화, 사업시행/관리처분 공개항목",
    monitor_unit: "cafeUrl, cafeId, 사업장명, 현재단계, 공개자료 수",
    check_cadence: "weekly",
    current_local_artifacts: "data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.csv; data/cleanup/snapshots/; analysis/cleanup-snapshot-diff.md; analysis/official-refresh-summary.md; data/cleanup/project-summaries-priority-candidates.csv; data/cleanup/*stage*; analysis/management-stage-value-resolution.md",
    implemented_scripts: "scripts/fetch-cleanup-projects.mjs; scripts/generate-cleanup-snapshot-diff.mjs; scripts/generate-official-refresh-summary.mjs; scripts/fetch-project-summaries.mjs; scripts/fetch-management-stage-doc-links.mjs; scripts/fetch-gwangjin-stage-public-docs.mjs; scripts/generate-management-stage-value-resolution.mjs",
    automation_status: "snapshot_diff_implemented_for_focus_districts",
    manual_step: "비공개·로그인 자료는 수집하지 않고 공개표 수치만 사용",
    priority_for_focus_area: "very_high",
    next_action: "주 1회 재수집 후 analysis/official-refresh-summary.md와 analysis/cleanup-snapshot-diff.md에서 단계·공개자료 수 변화 확인",
  },
  {
    source_id: "cleanup_notice",
    tier: "primary",
    source_name: "정비사업 정보몽땅 고시/공고",
    url: "https://cleanup.seoul.go.kr/",
    area_scope: "사업장별 및 서울 전체",
    update_signal: "고시/공고, 조합입찰공고, 공지사항",
    monitor_unit: "사업장, 게시글 제목, 등록일, 첨부파일",
    check_cadence: "weekly; 관심 사업장 daily 후보",
    current_local_artifacts: "analysis/official-refresh-summary.md; data/cleanup/cafe-menu-links-priority-candidates.csv; data/cleanup/cleanup-board-latest-priority-candidates.csv; analysis/cleanup-board-latest.md; analysis/cleanup-board-review-queue.md; analysis/project-risk-signal-summary.md; project-notes/*.md",
    implemented_scripts: "scripts/fetch-cafe-menu-links.mjs; scripts/fetch-cleanup-board-latest.mjs; scripts/generate-cleanup-board-review-queue.mjs; scripts/generate-project-risk-signal-summary.mjs",
    automation_status: "latest_board_items_implemented_for_30_candidates",
    manual_step: "개인별 분담금 조회나 로그인 자료는 수집하지 않고 공개 게시판 목록명·일자만 사용",
    priority_for_focus_area: "high",
    next_action: "analysis/project-risk-signal-summary.md의 very_high/high 사업장을 사업별 메모와 현장 확인 큐에 반영",
  },
  {
    source_id: "seoul_sibo",
    tier: "primary_backstop",
    source_name: "서울시보",
    url: "https://www.seoul.go.kr/func/seoulsibo/list.do",
    area_scope: "서울시 고시/공고 전체",
    update_signal: "서울특별시고시, 자치구고시, 정정, 공고 원문 PDF",
    monitor_unit: "권호, 발행일, 고시번호, 제목, PDF",
    check_cadence: "weekly Thursday; 공휴일 다음날 가능",
    current_local_artifacts: "data/urban/seoul-sibo-original-notice-sources.csv; analysis/seoul-sibo-original-notice-fact-check.md",
    implemented_scripts: "scripts/extract_seoul_sibo_text.py; scripts/ocr-seoul-sibo-page-range.mjs; scripts/generate-seoul-sibo-original-notice-fact-check.mjs",
    automation_status: "implemented_for_geukdong_backfill",
    manual_step: "도시공간포털 첨부 폴더에서 본고시가 누락될 때 고시번호/사업명으로 시보 권호를 검색",
    priority_for_focus_area: "high",
    next_action: "서울시보 최신 권호 목차에서 강남/송파/광진 키워드 자동 검색",
  },
  {
    source_id: "district_notice",
    tier: "primary_backstop",
    source_name: "자치구 고시공고",
    url: "https://www.gwangjin.go.kr/; https://www.gangnam.go.kr/notice/list.do?mid=ID05_040201; https://www.songpa.go.kr/www/selectGosiList.do?key=2776",
    area_scope: "광진구 텍스트 대조 구현; 강남구/송파구 후보 프로브 구현",
    update_signal: "조합설립인가, 추진위승인, 공람공고, 정정공고, 도시관리계획 열람",
    monitor_unit: "자치구 게시판 ID, 공고번호, 등록일, 첨부파일",
    check_cadence: "weekly; 병목 사업은 ad hoc",
    current_local_artifacts: "analysis/official-refresh-summary.md; data/urban/gwangjin-gu-notice-candidates.csv; data/urban/gwangjin-gu-notice-attachments.csv; data/urban/gangnam-songpa-notice-candidates.csv; data/urban/gangnam-songpa-notice-attachments.csv; analysis/gwangjin-gu-notice-fact-check.md; analysis/gangnam-songpa-notice-probe.md; analysis/source-text-extraction-audit.md; analysis/hwp-conversion-audit.md; analysis/source-value-verification-queue.md; analysis/core-value-confirmation-ledger.md; analysis/ocr-source-verification-packet.md; analysis/ocr-source-review-triage.md; analysis/ocr-image-review-decisions.md; analysis/source-value-update-candidates.md",
    implemented_scripts: "scripts/fetch-gwangjin-gu-notice-candidates.mjs; scripts/probe-gangnam-songpa-notices.mjs; scripts/extract_gwangjin_gu_notice_text.py; scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs; scripts/generate-source-text-extraction-audit.mjs; scripts/generate-hwp-conversion-audit.mjs; scripts/generate-source-value-verification-queue.mjs; scripts/generate-core-value-confirmation-ledger.mjs; scripts/generate-ocr-source-verification-packet.mjs; scripts/generate-ocr-source-review-triage.mjs; scripts/generate-ocr-image-review-decisions.mjs; scripts/generate-source-value-update-candidates.mjs",
    automation_status: "implemented_for_gwangjin_text_and_gangnam_songpa_probe",
    manual_step: "강남구/송파구 후보는 고신뢰 첨부만 다운로드하고, 중간 신뢰 후보는 사업명·위치·면적을 원문 대조한 뒤 승격",
    priority_for_focus_area: "high",
    next_action: "강남구/송파구 고신뢰 후보를 텍스트 추출·수치 대조 체인에 연결하고, 송파구 제목 검색 누락 사업은 내용 검색으로 보강",
  },
  {
    source_id: "gangdong_district_notice",
    tier: "primary_backstop",
    source_name: "강동구 고시공고",
    url: "https://www.gangdong.go.kr/",
    area_scope: "강동권 확장 관심권",
    update_signal: "재개발·재건축 조합설립인가, 추진위승인, 정비계획 열람공고, 지구단위계획·도시관리계획 공고",
    monitor_unit: "게시글 제목, 공고번호, 등록일, 첨부파일, 키워드",
    check_cadence: "weekly; 강동권 최신 단계 재확인 루프",
    current_local_artifacts:
      "analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-interest-zone-shortlist.md; analysis/official-update-registry.md",
    implemented_scripts: "",
    automation_status: "manual_expansion_latest_check",
    manual_step: "강동구 고시공고 검색 결과를 천호3구역·신동아1·2차·성내미주 중심으로 재확인하고 서울도시공간포털/정보몽땅 최신 단계와 교차 확인",
    priority_for_focus_area: "medium",
    next_action: "천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 강동구 고시공고와 정보몽땅 기준으로 같은 날짜에 다시 닫는다.",
  },
  {
    source_id: "jung_district_notice",
    tier: "primary_backstop",
    source_name: "중구 고시공고",
    url: "https://www.junggu.seoul.kr/",
    area_scope: "약수동 주변 확장 관심권",
    update_signal: "재개발·재건축 조합설립인가, 정비계획 열람공고, 경관·보존 관련 도시관리계획 공고",
    monitor_unit: "게시글 제목, 공고번호, 등록일, 첨부파일, 키워드",
    check_cadence: "weekly; 약수권 direct hit 탐색 루프",
    current_local_artifacts:
      "analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/expansion-interest-zone-shortlist.md; analysis/official-update-registry.md",
    implemented_scripts: "",
    automation_status: "manual_expansion_latest_check",
    manual_step: "중구 고시공고 검색 결과를 약수역 direct hit 후보와 신당·청구 인접 비교군으로 분리해 서울도시공간포털/정보몽땅과 교차 확인",
    priority_for_focus_area: "medium",
    next_action: "약수역 direct hit가 새로 생겼는지 중구 고시공고와 정보몽땅에서 확인하고, 없으면 신당8·신당9 기준선을 유지한다.",
  },
  {
    source_id: "seoul_citybuild_news",
    tier: "context",
    source_name: "서울시 주택·도시계획 분야",
    url: "https://news.seoul.go.kr/citybuild/",
    area_scope: "서울시 정책, 지역발전, 도시계획·부동산",
    update_signal: "주요업무계획, 도시계획·부동산 소식, 국제교류복합지구, 한강변관리기본계획, 사전협상",
    monitor_unit: "게시글, 보도자료, 사업 페이지",
    check_cadence: "weekly",
    current_local_artifacts: "analysis/transport-location-context.csv; korea-urban-planning-research-roadmap.md",
    implemented_scripts: "",
    automation_status: "manual",
    manual_step: "보도자료는 확정 신호가 아니므로 고시/공고와 대조",
    priority_for_focus_area: "medium",
    next_action: "잠실 MICE/국제교류복합지구, 한강변 정책, 역세권 활성화 페이지를 별도 컨텍스트 소스로 분리",
  },
  {
    source_id: "seoul_traffic_news",
    tier: "context",
    source_name: "서울시 교통 분야",
    url: "https://news.seoul.go.kr/traffic/",
    area_scope: "서울 교통정책, 지하철, 도로, 보행, TOPIS",
    update_signal: "도시철도망, 버스/환승, 도로·보행 정책, 교통통계",
    monitor_unit: "게시글, 보도자료, 계획명, 노선명",
    check_cadence: "monthly; 대형 교통계획 발표 시 ad hoc",
    current_local_artifacts: "analysis/transport-location-context.csv",
    implemented_scripts: "scripts/generate-transport-location-context.mjs",
    automation_status: "manual_context",
    manual_step: "입지 점수보다 노선/도로 단절, 환승, 역 출구 동선을 현장 확인과 결합",
    priority_for_focus_area: "medium",
    next_action: "광나루·강변·잠실·대치 생활권별 교통계획 원문 링크를 추가",
  },
  {
    source_id: "opengov",
    tier: "context_backstop",
    source_name: "서울 정보소통광장",
    url: "https://opengov.seoul.go.kr/",
    area_scope: "서울시 결재문서, 위원회 회의정보, 정책연구자료, 건설사업정보",
    update_signal: "심의 전후 결재문서, 위원회 회의정보, 사업 백서, 건설사업정보",
    monitor_unit: "문서 제목, 생산일, 부서, 사업명",
    check_cadence: "monthly; 심의 이슈 발생 시 ad hoc",
    current_local_artifacts: "analysis/official-context-sources.csv",
    implemented_scripts: "",
    automation_status: "manual",
    manual_step: "고시문만으로 쟁점이 안 보일 때 회의정보와 결재문서 검색",
    priority_for_focus_area: "medium",
    next_action: "광장극동·워커힐·잠실MICE·압구정 관련 문서 검색 키워드 목록 작성",
  },
  {
    source_id: "seoul_open_data",
    tier: "data",
    source_name: "서울 열린데이터광장",
    url: "https://data.seoul.go.kr/",
    area_scope: "서울 공공데이터, 통계, 생활인구, 생활이동, 실거래 보조 데이터",
    update_signal: "새 데이터, 통계소식, 공지사항, API/파일 갱신",
    monitor_unit: "dataset ID, update date, API endpoint",
    check_cadence: "monthly",
    current_local_artifacts: "data/market/official-market-data-sources.csv; data/market/market-fetch-plan.csv",
    implemented_scripts: "scripts/generate-market-data-matrix.mjs; scripts/fetch-market-raw-data.mjs",
    automation_status: "plan_ready_api_key_needed",
    manual_step: "API 키 준비 전에는 수집 계획과 데이터셋 ID만 관리",
    priority_for_focus_area: "medium",
    next_action: "서울 실거래/생활이동/생활인구 데이터셋 ID 확정 후 API 키 연결",
  },
  {
    source_id: "molit_data_go_kr",
    tier: "data",
    source_name: "국토교통부 실거래/공공데이터포털",
    url: "https://www.data.go.kr/",
    area_scope: "거래 원자료, 토지·건축물·공시지가",
    update_signal: "월별 실거래, 정정·해제거래, 건축물대장/공시지가 갱신",
    monitor_unit: "serviceKey, LAWD_CD, 계약년월, 데이터 유형",
    check_cadence: "monthly; 최신월은 재수집",
    current_local_artifacts: "data/market/market-fetch-plan.csv; data/market/API_KEYS.md",
    implemented_scripts: "scripts/fetch-market-raw-data.mjs",
    automation_status: "api_key_needed",
    manual_step: "API 활용신청 후 원본 XML/JSON을 보존하고 정정월 재수집 정책 적용",
    priority_for_focus_area: "medium",
    next_action: "DATA_GO_KR_SERVICE_KEY 연결 후 2024-01~현재 강남/송파/광진 실거래 수집",
  },
  {
    source_id: "r_one",
    tier: "data",
    source_name: "한국부동산원 R-ONE",
    url: "https://www.reb.or.kr/r-one/main.do",
    area_scope: "가격지수, 거래현황, 지가변동률, 시장 반응",
    update_signal: "월별 가격지수/거래현황 공표",
    monitor_unit: "지역, 지표, 공표월",
    check_cadence: "monthly",
    current_local_artifacts: "data/market/official-market-data-sources.csv; data/market/project-market-areas.csv",
    implemented_scripts: "",
    automation_status: "manual_or_api_pending",
    manual_step: "R-ONE API 또는 웹 다운로드 경로 확인 후 코드/지표명을 고정",
    priority_for_focus_area: "medium",
    next_action: "서울·동남권·광진구/송파구/강남구 비교 지표 코드 확정",
  },
];

const RUNBOOK = [
  {
    runbook_id: "weekly_primary_refresh",
    cadence: "weekly",
    trigger: "정기 점검일 또는 관심구 고시/공고 알림 수신",
    scope: "강남구, 송파구, 광진구 후보 30개",
    network_required: "Y",
    command_sequence:
      "node scripts/fetch-cleanup-projects.mjs -> node scripts/fetch-project-summaries.mjs -> node scripts/fetch-cafe-menu-links.mjs -> node scripts/fetch-cleanup-board-latest.mjs -> node scripts/fetch-urban-map-details.mjs -> node scripts/fetch-urban-notice-details.mjs --download -> node scripts/probe-gangnam-songpa-notices.mjs --download",
    followup_local_command: "node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md",
    decision_rule: "단계 변경, 공개자료 수 증가, 새 고시번호, 새 첨부 원문이 있으면 사업별 메모와 원문 검증 큐를 먼저 갱신한다.",
  },
  {
    runbook_id: "expansion_interest_zone_bootstrap",
    cadence: "weekly",
    trigger: "강동권·약수동 주변을 확장 관심권으로 운영 체계에 붙일 때",
    scope: "강동구 고시공고, 중구 고시공고, 서울도시공간포털 알림 슬롯, 확장 관심권 브리프",
    network_required: "Y",
    command_sequence:
      "수동 검색: 강동구 고시공고, 중구 고시공고, 서울도시공간포털 알림서비스 신청 범위 검토 -> 결과를 data/review/official-source-activation-intake.json 또는 data/review/official-update-intake.json에 기록",
    followup_local_command:
      "node scripts/generate-official-source-activation-checklist.mjs -> node scripts/generate-official-source-activation-validation.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/expansion-interest-zone-brief.md; analysis/expansion-interest-zone-candidate-brief.md; analysis/official-source-activation-checklist.md; analysis/official-change-detection-board.md; analysis/official-update-intake-board.md",
    decision_rule: "강동구·중구 고시공고 페이지는 라우팅 출처다. 고시번호·고시일·원문 URL·첨부명이 확인되기 전에는 사업 단계나 수치 근거로 승격하지 않는다.",
  },
  {
    runbook_id: "expansion_zone_latest_check",
    cadence: "weekly",
    trigger: "강동권·약수동 주변 확장 관심권의 최신 단계/직접 hit를 정기 재확인할 때",
    scope: "강동권 4건 최신 단계 재확인, 약수권 3건 confirmed 기준값 유지, 약수역 direct hit 탐색",
    network_required: "Y",
    command_sequence:
      "수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅 사업장검색/공개자료, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 -> 결과를 data/review/official-update-intake.json 또는 data/review/official-source-activation-intake.json에 기록",
    followup_local_command:
      "node scripts/generate-expansion-zone-monitoring-checklist.mjs -> node scripts/generate-expansion-zone-intake-seed-board.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/life-area-monitoring-board.md",
    decision_rule:
      "강동권은 값 confirmed와 최신 단계 재확인을 분리하고 gangdong_district_notice 새 row를 만든다. 약수권은 confirmed snapshot 3건을 유지하되, 신당8·신당9는 기존 seoul_urban_notice row를 재사용하고 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수역 direct hit가 생기기 전에는 adjacent 대조군으로만 읽는다.",
  },
  {
    runbook_id: "recordcode_bottleneck_probe",
    cadence: "ad_hoc",
    trigger: "research-status-dashboard 또는 recordcode-dead-end-audit에서 P0 recordCode/고시 병목 확인",
    scope: "recordCode 미연결 사업장, 특히 삼성1차·자양번영로3나길",
    network_required: "Y",
    command_sequence:
      "node scripts/fetch-representative-lot-map-candidates.mjs -> node scripts/fetch-map-missing-business-layer-details.mjs -> node scripts/fetch-business-layer-notice-candidates.mjs -> node scripts/fetch-gwangjin-gu-notice-candidates.mjs -> node scripts/probe-gangnam-songpa-notices.mjs --download -> node scripts/probe-source-link-officials.mjs",
    followup_local_command:
      "node scripts/generate-map-missing-business-layer-review.mjs -> node scripts/generate-recordcode-dead-end-audit.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/recordcode-dead-end-audit.md; analysis/source-link-official-probe.md; analysis/map-missing-business-layer-review.md",
    decision_rule: "고신뢰 후보만 원문 후보로 승격한다. 토지구획정리·환지 등 과거 일반 구역은 현 정비사업 고시로 쓰지 않는다.",
  },
  {
    runbook_id: "high_blocking_public_web_probe",
    cadence: "ad_hoc",
    trigger: "high-blocking-source-escalation-packet의 3개 사업장 외부 문의 전후 공개화면 재확인",
    scope: "광장동 삼성1차, 자양번영로3나길, 잠실우성4차 high blocking 필드",
    network_required: "Y",
    command_sequence: "node scripts/fetch-high-blocking-public-web-probe.mjs",
    followup_local_command:
      "node scripts/generate-high-blocking-public-web-probe.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/high-blocking-public-web-probe.md; analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-public-summary-boundary.md; analysis/high-blocking-source-escalation-packet.md",
    decision_rule: "공식 공개화면에서 고시/공고 0건, 로그인 필요, 계 필드 공란이면 confirmed 승격하지 않고 담당부서/정보공개 확인 경로로 유지한다.",
  },
  {
    runbook_id: "high_blocking_filing_submission",
    cadence: "ad_hoc",
    trigger: "사용자 승인 후 high blocking 3건을 실제 담당부서 문의 또는 정보공개청구로 접수할 때",
    scope: "광장동 삼성1차, 자양번영로3나길, 잠실우성4차 제출·접수기록",
    network_required: "N",
    command_sequence:
      "수동 승인 확인: analysis/high-blocking-submission-approval-board.md -> 수동 제출: data/review/high-blocking-filing-outbox/*.txt 사용 -> 접수 기록: node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write",
    followup_local_command: "node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/high-blocking-submission-approval-board.md; analysis/high-blocking-filing-checklist.md; data/review/high-blocking-filing-outbox/README.md; analysis/high-blocking-filing-tracker.md",
    decision_rule:
      "접수번호가 있으면 receipt로, 없으면 filing_note로 접수 흔적을 남긴 뒤 filed_waiting_response로 올린다. 회신 전에는 confirmed/partial로 승격하지 않는다.",
  },
  {
    runbook_id: "high_blocking_contact_escalation",
    cadence: "ad_hoc",
    trigger: "high-blocking-public-web-probe에서 외부 확인 필요가 남거나 담당부서/정보몽땅 회신을 받은 경우",
    scope: "광장동 삼성1차, 자양번영로3나길, 잠실우성4차 high blocking 필드",
    network_required: "N",
    command_sequence:
      "수동 확인: analysis/high-blocking-contact-channel-registry.md의 우선 채널 선택 -> 수동 발송: analysis/high-blocking-source-escalation-packet.md의 사업별 문의 본문 사용 -> 회신 기록: node scripts/record-high-blocking-response.mjs --rank=NN --status=... --received-at=YYYY-MM-DD --responder='담당부서' --write",
    followup_local_command:
      "node scripts/generate-high-blocking-response-decision-drafts.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-source-escalation-packet.md; analysis/high-blocking-response-intake-guide.md; analysis/high-blocking-response-decision-drafts.md; analysis/research-system-readiness-audit.md",
    decision_rule: "공식 채널 URL은 라우팅 근거일 뿐 값 확정 근거가 아니다. 회신에 고시번호·고시일·원문 URL·별첨명 또는 정보공개 필요 사유가 있을 때만 intake에 기록한다.",
  },
  {
    runbook_id: "text_extraction_and_hwp_qa",
    cadence: "after_new_files",
    trigger: "새 PDF/HWP/HWPX 원문 또는 첨부 파일 확보",
    scope: "data/urban/files 및 data/urban/text",
    network_required: "N",
    command_sequence:
      "/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_urban_notice_text.py -> node scripts/generate-source-text-extraction-audit.mjs -> node scripts/generate-hwp-conversion-audit.mjs",
    followup_local_command:
      "node scripts/generate-source-value-verification-queue.mjs -> node scripts/generate-core-value-confirmation-ledger.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/source-text-extraction-audit.md; analysis/hwp-conversion-audit.md; analysis/core-value-confirmation-ledger.md",
    decision_rule: "텍스트 추출이 되지 않은 파일은 OCR 또는 HWP 직접 파서 경로로 분리하고, 숫자 확정은 원문 이미지/텍스트 근거가 있을 때만 승격한다.",
  },
  {
    runbook_id: "ocr_value_resolution",
    cadence: "after_text_audit",
    trigger: "source-text-extraction-audit 또는 core ledger에서 OCR 숫자/부분확정 항목 확인",
    scope: "스캔 PDF, 이미지형 HWP, OCR 보정 후보",
    network_required: "N",
    command_sequence:
      "node scripts/generate-ocr-source-verification-packet.mjs -> node scripts/generate-ocr-source-review-triage.mjs -> node scripts/generate-ocr-image-review-decisions.mjs -> node scripts/generate-source-value-update-candidates.mjs",
    followup_local_command: "node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/ocr-source-verification-packet.md; analysis/ocr-source-review-triage.md; analysis/ocr-image-review-decisions.md; analysis/source-value-update-candidates.md",
    decision_rule: "OCR 값은 자동 반영하지 않고 confirmed_from_ocr_image, partial_confirmation_pending, source_value_update_recommended로 분리한다.",
  },
  {
    runbook_id: "monthly_market_data_refresh",
    cadence: "monthly",
    trigger: "실거래 최신월 공표 또는 API 키 연결 완료",
    scope: "강남구·송파구·광진구 실거래, R-ONE 지표",
    network_required: "Y",
    command_sequence:
      "node scripts/generate-market-data-matrix.mjs -> node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=YYYYMM -> DATA_GO_KR_SERVICE_KEY=... node scripts/fetch-market-raw-data.mjs --from=202401 --to=YYYYMM",
    followup_local_command: "node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md",
    decision_rule: "시장 데이터는 사업 단계 판정 근거가 아니라 반응 확인용이다. 고시·인가일 전후 6개월/12개월 거래량과 가격 방향만 별도 분석한다.",
  },
  {
    runbook_id: "monthly_context_scan",
    cadence: "monthly",
    trigger: "서울시 도시계획·교통 정책 발표, 심의 이슈, 대형 사업 보도자료",
    scope: "잠실 MICE, 동서울터미널, 한강변, 압구정·대치·광진 생활권",
    network_required: "Y",
    command_sequence:
      "수동 검색: 서울시 주택·도시계획 분야, 서울시 교통 분야, 서울 정보소통광장",
    followup_local_command:
      "analysis/official-context-sources.csv 수동 갱신 -> node scripts/generate-transport-location-context.mjs -> node scripts/regenerate-research-artifacts.mjs",
    first_outputs_to_read:
      "analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md",
    decision_rule: "보도자료와 결재문서는 context로만 두고, 고시번호·결정조서·도면 원문을 확인하기 전에는 확정 신호로 승격하지 않는다.",
  },
];

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
  return [
    `| ${fields.map((field) => field.label).join(" | ")} |`,
    `| ${fields.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${fields.map((field) => String(row[field.key] ?? "").replaceAll("|", "/")).join(" | ")} |`),
  ].join("\n");
}

async function optionalJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return [];
  }
}

function countBy(rows, field) {
  return Object.entries(
    rows.reduce((acc, row) => {
      acc[row[field]] = (acc[row[field]] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));
}

function deriveCurrentMetrics(matrixRows, sourceAuditRows) {
  return [
    { metric: "우선검토 후보", value: matrixRows.length },
    { metric: "확장 관심권", value: EXPANSION_ZONE_COUNT },
    { metric: "확장 관심권 자치구 채널", value: SOURCES.filter((row) => ["gangdong_district_notice", "jung_district_notice"].includes(row.source_id)).length },
    { metric: "서울도시공간포털 고시/지도 매칭", value: matrixRows.filter((row) => row.has_urban_map === "Y").length },
    { metric: "사업구역 레이어 보강", value: matrixRows.filter((row) => row.has_business_layer_match === "Y").length },
    { metric: "서울시보 본고시 원문 확보", value: matrixRows.filter((row) => row.has_seoul_sibo_original_notice === "Y").length },
    { metric: "광진구청 고시공고 텍스트 확보", value: matrixRows.filter((row) => row.has_gwangjin_gu_notice_text === "Y").length },
    { metric: "정보몽땅 단계 공개항목 보강", value: matrixRows.filter((row) => row.has_stage_public_docs === "Y").length },
    { metric: "공식 근거 C-D-E 병목", value: sourceAuditRows.filter((row) => ["C", "D", "E"].includes(row.evidence_grade)).length },
    { metric: "시장 데이터 API 키 대기", value: matrixRows.filter((row) => row.market_data_status === "ready_for_api_key").length },
  ];
}

function markdown(rows, matrixRows, sourceAuditRows) {
  const metrics = deriveCurrentMetrics(matrixRows, sourceAuditRows);
  return `# 공식 업데이트 출처 레지스트리

작성 기준: ${UPDATED_AT}

이 문서는 강남·잠실·구의 생활권 재개발·재건축 리서치에서 “무엇이 업데이트되면 어디서 먼저 확인할지”를 고정한 작업표다. 자동화된 스크립트가 있는 출처와 아직 수동 확인이 필요한 출처를 분리한다.
핵심 생활권 외에 강동권과 약수동 주변은 확장 관심권으로 따로 표기해, 아직 자동화되지 않은 자치구 채널도 운영 레지스트리에 포함한다.

## 현재 커버리지

${mdTable(metrics, [
  { key: "metric", label: "항목" },
  { key: "value", label: "값" },
])}

## 출처 등급

${mdTable(countBy(rows, "tier"), [
  { key: "name", label: "등급" },
  { key: "count", label: "출처 수" },
])}

## 업데이트 레지스트리

${mdTable(rows, [
  { key: "source_id", label: "ID" },
  { key: "tier", label: "등급" },
  { key: "source_name", label: "출처" },
  { key: "update_signal", label: "업데이트 신호" },
  { key: "check_cadence", label: "확인 주기" },
  { key: "automation_status", label: "자동화 상태" },
  { key: "implemented_scripts", label: "스크립트" },
  { key: "next_action", label: "다음 보강" },
])}

## 운영 순서

1. 고시/공고 신호는 서울도시공간포털, 정비사업 정보몽땅, 자치구 고시공고, 서울시보 순서로 확인한다.
2. 단계 변경 신호는 정비사업 정보몽땅 사업장검색과 사업장별 공개자료 수 diff로 먼저 잡는다.
3. 보도자료와 정책 페이지는 확정 신호가 아니므로 고시번호, 고시일, 결정조서, 결정도 원문으로 승격하기 전까지는 context로만 둔다.
4. 실거래와 가격지수는 시장 반응 확인용이다. 사업 단계 판단에는 쓰지 않는다.
5. 강동권·약수동 주변은 먼저 확장 관심권 브리프와 activation intake에 남기고, 후보 사업장과 원문 URL이 생기면 기존 비교 체계로 편입한다.
6. 새 신호가 발견되면 사업별 메모, 비교 매트릭스, 공식 근거 감사표 순서로 반영한다.

## 다음 자동화 후보

- 서울도시공간포털 결정고시 최신분 검색을 후보 30개 밖의 신규 사업까지 확장한다.
- 정비사업 정보몽땅 스냅샷 diff 결과에서 공개자료 수가 증가한 사업장의 새 문서 제목·일자를 수집한다.
- 서울시보 최신 권호 목차에서 강남구, 송파구, 광진구, 압구정, 잠실, 광장, 구의, 자양 키워드를 자동 검색한다.
- 강남구·송파구 고시공고 프로브의 고신뢰 첨부를 텍스트 추출·수치 대조 체인에 연결한다.
`;
}

function runbookMarkdown(rows) {
  return `# 공식 업데이트 실행 런북

작성 기준: ${UPDATED_AT}

최신 정보가 생겼을 때 어떤 수집 명령을 먼저 실행하고 어떤 분석 산출물을 읽을지 고정한 운영표다. 원격 호출이 필요한 단계와 로컬 재생성 단계를 분리해, 주간 점검과 병목 해소 작업을 반복 가능하게 만든다.

## 실행 큐

${mdTable(rows, [
  { key: "runbook_id", label: "ID" },
  { key: "cadence", label: "주기" },
  { key: "trigger", label: "트리거" },
  { key: "scope", label: "범위" },
  { key: "network_required", label: "원격" },
  { key: "command_sequence", label: "수집/처리 명령" },
  { key: "followup_local_command", label: "후속 로컬 재생성" },
])}

## 판독 순서

${mdTable(rows, [
  { key: "runbook_id", label: "ID" },
  { key: "first_outputs_to_read", label: "먼저 읽을 산출물" },
  { key: "decision_rule", label: "판정 규칙" },
])}

## 체크리스트 생성

원격 호출을 바로 실행하기 전에 런북을 단계별 드라이런 체크리스트로 펼친다.

\`\`\`bash
node scripts/generate-official-update-runbook-checklist.mjs --cadence=weekly
node scripts/generate-official-update-runbook-checklist.mjs --runbook=monthly_market_data_refresh --to=202606
\`\`\`

산출물은 \`analysis/official-update-runbook-checklist.md\`에서 확인한다.

## 운영 원칙

1. 원격 수집을 실행한 뒤에는 항상 \`node scripts/regenerate-research-artifacts.mjs\`로 로컬 분석 산출물을 맞춘다.
2. 고시·인가·도면 원문은 확정 근거이고, 보도자료·정책 페이지·시장 데이터는 context 또는 반응 확인용이다.
3. 새 파일이 생기면 텍스트 추출 감사와 HWP/HWPX 감사부터 확인한다.
4. 저신뢰 후보는 비교 매트릭스에 직접 승격하지 않고 별도 감사표에 남긴다.
`;
}

async function main() {
  const matrixRows = await optionalJson(MATRIX_INPUT);
  const sourceAuditRows = await optionalJson(SOURCE_AUDIT_INPUT);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(SOURCES, null, 2)}\n`);
  await writeFile(OUT_CSV, toCsv(SOURCES));
  await writeFile(OUT_MD, markdown(SOURCES, matrixRows, sourceAuditRows));
  await writeFile(OUT_RUNBOOK_JSON, `${JSON.stringify(RUNBOOK, null, 2)}\n`);
  await writeFile(OUT_RUNBOOK_CSV, toCsv(RUNBOOK));
  await writeFile(OUT_RUNBOOK_MD, runbookMarkdown(RUNBOOK));
  console.log(
    JSON.stringify(
      {
        rows: SOURCES.length,
        runbookRows: RUNBOOK.length,
        tiers: Object.fromEntries(countBy(SOURCES, "tier").map((row) => [row.name, row.count])),
        output: "analysis/official-update-registry.{md,csv,json}; analysis/official-update-runbook.{md,csv,json}",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
