#!/usr/bin/env node

import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";

const STEPS = [
  {
    id: "seoul-sibo-fact-check",
    description: "서울시보 본고시 OCR 대조표 재생성",
    command: ["node", "scripts/generate-seoul-sibo-original-notice-fact-check.mjs"],
  },
  {
    id: "gwangjin-gu-fact-check",
    description: "광진구청 원문 대조표 재생성",
    command: ["node", "scripts/generate-gwangjin-gu-notice-fact-check.mjs"],
  },
  {
    id: "market-matrix",
    description: "시장 데이터 연결 매트릭스 재생성",
    command: ["node", "scripts/generate-market-data-matrix.mjs"],
  },
  {
    id: "market-manual-import-readiness",
    description: "시장 원자료 수동 반입 준비도 재생성",
    command: ["node", "scripts/generate-market-manual-import-readiness.mjs"],
  },
  {
    id: "market-manual-download-workbook",
    description: "시장 원자료 수동 다운로드 워크북 재생성",
    command: ["node", "scripts/generate-market-manual-download-workbook.mjs"],
  },
  {
    id: "market-manual-download-status",
    description: "시장 원자료 수동 다운로드 작업별 상태 재생성",
    command: ["node", "scripts/generate-market-manual-download-status.mjs"],
  },
  {
    id: "market-manual-ingest-manifest",
    description: "시장 수동 원자료 반입 manifest 재생성",
    command: ["node", "scripts/generate-market-manual-ingest-manifest.mjs"],
  },
  {
    id: "market-manual-column-audit",
    description: "시장 수동 원자료 컬럼 감사표 재생성",
    command: ["python3", "scripts/generate-market-manual-column-audit.py"],
  },
  {
    id: "market-manual-normalization-audit",
    description: "시장 수동 원자료 정규화 감사표 재생성",
    command: ["python3", "scripts/normalize-market-manual-import.py"],
  },
  {
    id: "market-transaction-signal-summary",
    description: "서울시 실거래 생활권·사업장 시장 신호 요약 재생성",
    command: ["python3", "scripts/generate-market-transaction-signal-summary.py"],
  },
  {
    id: "market-api-readiness-audit",
    description: "시장 데이터 API 준비도 감사표 재생성",
    command: ["node", "scripts/generate-market-api-readiness-audit.mjs"],
  },
  {
    id: "cleanup-snapshot-diff",
    description: "정보몽땅 스냅샷 변경 감시표 재생성",
    command: ["node", "scripts/generate-cleanup-snapshot-diff.mjs"],
  },
  {
    id: "official-refresh-summary",
    description: "공식 최신 수집 운영 요약 재생성",
    command: ["node", "scripts/generate-official-refresh-summary.mjs"],
  },
  {
    id: "cleanup-board-review-queue",
    description: "정보몽땅 공개항목 검토 큐 재생성",
    command: ["node", "scripts/generate-cleanup-board-review-queue.mjs"],
  },
  {
    id: "project-comparison-matrix-initial",
    description: "비교 매트릭스 1차 재생성",
    command: ["node", "scripts/generate-project-comparison-matrix.mjs"],
  },
  {
    id: "transport-context",
    description: "교통입지·생활권 컨텍스트 재생성",
    command: ["node", "scripts/generate-transport-location-context.mjs"],
  },
  {
    id: "source-text-audit",
    description: "원문 텍스트 추출 감사표 재생성",
    command: ["node", "scripts/generate-source-text-extraction-audit.mjs"],
  },
  {
    id: "hwp-conversion-audit",
    description: "HWP/HWPX 변환 감사표 재생성",
    command: ["node", "scripts/generate-hwp-conversion-audit.mjs"],
  },
  {
    id: "management-stage-fact-check",
    description: "관리처분 단계 원문 수치 대조표 재생성",
    command: ["node", "scripts/generate-management-stage-fact-check.mjs"],
  },
  {
    id: "management-stage-value-resolution",
    description: "관리처분 수치 시점 해소표 재생성",
    command: ["node", "scripts/generate-management-stage-value-resolution.mjs"],
  },
  {
    id: "source-evidence-audit",
    description: "공식 근거 품질 감사표 재생성",
    command: ["node", "scripts/generate-source-evidence-audit.mjs"],
  },
  {
    id: "project-risk-signal-summary",
    description: "사업장별 리스크 신호 요약 재생성",
    command: ["node", "scripts/generate-project-risk-signal-summary.mjs"],
  },
  {
    id: "source-value-verification-queue",
    description: "원문 수치 검증 큐 재생성",
    command: ["node", "scripts/generate-source-value-verification-queue.mjs"],
  },
  {
    id: "core-ledger-before-ocr",
    description: "핵심 수치 장부 1차 재생성",
    command: ["node", "scripts/generate-core-value-confirmation-ledger.mjs"],
  },
  {
    id: "ocr-source-packet",
    description: "OCR 원문 검수 패킷 재생성",
    command: ["node", "scripts/generate-ocr-source-verification-packet.mjs"],
  },
  {
    id: "ocr-source-triage",
    description: "OCR 수치 검수 트리아지 재생성",
    command: ["node", "scripts/generate-ocr-source-review-triage.mjs"],
  },
  {
    id: "ocr-image-decisions",
    description: "OCR 이미지 수동 검수 결정표 재생성",
    command: ["node", "scripts/generate-ocr-image-review-decisions.mjs"],
  },
  {
    id: "source-value-update-candidates",
    description: "원문 수치 보정 후보 재생성",
    command: ["node", "scripts/generate-source-value-update-candidates.mjs"],
  },
  {
    id: "project-comparison-matrix-final",
    description: "보정 후보 반영 비교 매트릭스 재생성",
    command: ["node", "scripts/generate-project-comparison-matrix.mjs"],
  },
  {
    id: "songpa-notice-value-corroboration",
    description: "송파권 원문 수치 확정성 판정 재생성",
    command: ["node", "scripts/generate-songpa-notice-value-corroboration.mjs"],
  },
  {
    id: "core-ledger-final",
    description: "OCR 트리아지·수동판정 반영 핵심 수치 장부 재생성",
    command: ["node", "scripts/generate-core-value-confirmation-ledger.mjs"],
  },
  {
    id: "source-link-repair-queue",
    description: "원문 링크 보정 큐 재생성",
    command: ["node", "scripts/generate-source-link-repair-queue.mjs"],
  },
  {
    id: "source-link-repair-candidates",
    description: "원문 링크 보정 후보 근거 재생성",
    command: ["node", "scripts/generate-source-link-repair-candidates.mjs"],
  },
  {
    id: "source-link-closure-board",
    description: "원문 링크 클로저 보드 재생성",
    command: ["node", "scripts/generate-source-link-closure-board.mjs"],
  },
  {
    id: "core-ledger-after-source-link-candidates",
    description: "원문 링크 보조근거 반영 핵심 수치 장부 재생성",
    command: ["node", "scripts/generate-core-value-confirmation-ledger.mjs"],
  },
  {
    id: "songpa-source-gap-audit",
    description: "송파권 원문 연결 병목 감사표 재생성",
    command: ["node", "scripts/generate-songpa-source-gap-audit.mjs"],
  },
  {
    id: "songpa-value-review-packet",
    description: "송파권 원문 수치 검토 패킷 재생성",
    command: ["node", "scripts/generate-songpa-value-review-packet.mjs"],
  },
  {
    id: "research-status-dashboard",
    description: "생활권·사업장별 리서치 상태판 재생성",
    command: ["node", "scripts/generate-research-status-dashboard.mjs"],
  },
  {
    id: "source-verification-sprint-plan",
    description: "P0/P1 원문 검증 실행 패킷 재생성",
    command: ["node", "scripts/generate-source-verification-sprint-plan.mjs"],
  },
  {
    id: "s1-cost-infrastructure-workbook",
    description: "S1 비용·기반시설 원문 대조 워크북 재생성",
    command: ["node", "scripts/generate-s1-cost-infrastructure-workbook.mjs"],
  },
  {
    id: "s1-public-item-fact-check-memos",
    description: "S1 공개항목 점검 메모 재생성",
    command: ["node", "scripts/generate-s1-public-item-fact-check-memos.mjs"],
  },
  {
    id: "s1-original-evidence-candidates",
    description: "S1 원문 수치 후보 추출표 재생성",
    command: ["node", "scripts/generate-s1-original-evidence-candidates.mjs"],
  },
  {
    id: "s1-evidence-review-board",
    description: "S1 원문 증거 리뷰 보드 재생성",
    command: ["node", "scripts/generate-s1-evidence-review-board.mjs"],
  },
  {
    id: "s2-source-link-closure-workbook",
    description: "S2 원문 링크 클로저 워크북 재생성",
    command: ["node", "scripts/generate-s2-source-link-closure-workbook.mjs"],
  },
  {
    id: "s3-ocr-image-verification-workbook",
    description: "S3 OCR·이미지 수치 검증 워크북 재생성",
    command: ["node", "scripts/generate-s3-ocr-image-verification-workbook.mjs"],
  },
  {
    id: "s4-stage-conflict-resolution-workbook",
    description: "S4 사업시행·관리처분 시점 충돌 해소 워크북 재생성",
    command: ["node", "scripts/generate-s4-stage-conflict-resolution-workbook.mjs"],
  },
  {
    id: "s5-core-gap-fill-workbook",
    description: "S5 핵심 공란 보강 워크북 재생성",
    command: ["node", "scripts/generate-s5-core-gap-fill-workbook.mjs"],
  },
  {
    id: "source-verification-closure-ledger",
    description: "S1-S5 원문 검증 통합 클로저 장부 재생성",
    command: ["node", "scripts/generate-source-verification-closure-ledger.mjs"],
  },
  {
    id: "source-verification-decision-context-audit",
    description: "원문 검증 장부의 decision 문맥 불일치 감사표 재생성",
    command: ["node", "scripts/generate-source-verification-decision-context-audit.mjs"],
  },
  {
    id: "source-verification-action-queue",
    description: "원문 검증 pending/conflict 실행 큐 재생성",
    command: ["node", "scripts/generate-source-verification-action-queue.mjs"],
  },
  {
    id: "research-status-dashboard-refresh",
    description: "원문 검증 실행 큐 반영 상태판 재생성",
    command: ["node", "scripts/generate-research-status-dashboard.mjs"],
  },
  {
    id: "source-verification-sprint-plan-refresh",
    description: "원문 검증 실행 큐 반영 실행 패킷 재생성",
    command: ["node", "scripts/generate-source-verification-sprint-plan.mjs"],
  },
  {
    id: "research-completion-cockpit-refresh",
    description: "원문 검증 실행 큐 반영 완료 병목 보드 재생성",
    command: ["node", "scripts/generate-research-completion-cockpit.mjs"],
  },
  {
    id: "research-next-moves-refresh",
    description: "원문 검증 실행 큐 반영 다음 액션 보드 재생성",
    command: ["node", "scripts/generate-research-next-moves.mjs"],
  },
  {
    id: "focus-area-strategy-refresh",
    description: "원문 검증 실행 큐 반영 생활권 전략/액션 큐 재생성",
    command: ["node", "scripts/generate-focus-area-strategy.mjs"],
  },
  {
    id: "focus-deep-dive-queue-refresh",
    description: "원문 검증 실행 큐 반영 딥다이브 큐 재생성",
    command: ["node", "scripts/generate-focus-deep-dive-queue.mjs"],
  },
  {
    id: "residual-gap-interpretation-audit",
    description: "잔여 공란·보류 해석 감사표 재생성",
    command: ["node", "scripts/generate-residual-gap-interpretation-audit.mjs"],
  },
  {
    id: "high-blocking-source-escalation-packet",
    description: "high blocking 잔여 원문 확인 패킷 재생성",
    command: ["node", "scripts/generate-high-blocking-source-escalation-packet.mjs"],
  },
  {
    id: "high-blocking-public-summary-boundary",
    description: "high blocking 공식 요약값 사용 경계표 재생성",
    command: ["node", "scripts/generate-high-blocking-public-summary-boundary.mjs"],
  },
  {
    id: "high-blocking-public-web-probe",
    description: "high blocking 공식 웹 공개화면 프로브 재생성",
    command: ["node", "scripts/generate-high-blocking-public-web-probe.mjs"],
  },
  {
    id: "high-blocking-official-search-rerun",
    description: "high blocking 공식 검색 재실행 감사표 재생성",
    command: ["node", "scripts/generate-high-blocking-official-search-rerun.mjs"],
  },
  {
    id: "high-blocking-contact-channel-registry",
    description: "high blocking 공식 문의 채널 레지스트리 재생성",
    command: ["node", "scripts/generate-high-blocking-contact-channel-registry.mjs"],
  },
  {
    id: "high-blocking-info-disclosure-packet",
    description: "high blocking 정보공개청구 패킷 재생성",
    command: ["node", "scripts/generate-high-blocking-info-disclosure-packet.mjs"],
  },
  {
    id: "high-blocking-response-decision-drafts",
    description: "high blocking 외부 회신 decision 초안 재생성",
    command: ["node", "scripts/generate-high-blocking-response-decision-drafts.mjs"],
  },
  {
    id: "high-blocking-response-workflow-run",
    description: "high blocking 외부 회신 workflow dry-run 보고서 재생성",
    command: ["node", "scripts/process-high-blocking-response-workflow.mjs"],
  },
  {
    id: "high-blocking-filing-tracker",
    description: "high blocking 정보공개 접수/회신 tracker 재생성",
    command: ["node", "scripts/generate-high-blocking-filing-tracker.mjs"],
  },
  {
    id: "high-blocking-intake-validation",
    description: "high blocking 회신 intake 검증표 재생성",
    command: ["node", "scripts/generate-high-blocking-intake-validation.mjs"],
  },
  {
    id: "high-blocking-response-intake-guide",
    description: "high blocking 회신 intake 입력 가이드 재생성",
    command: ["node", "scripts/generate-high-blocking-response-intake-guide.mjs"],
  },
  {
    id: "high-blocking-filing-outbox",
    description: "high blocking 정보공개 제출 준비 파일 생성",
    command: ["node", "scripts/generate-high-blocking-filing-outbox.mjs"],
  },
  {
    id: "high-blocking-filing-checklist",
    description: "high blocking 정보공개 접수 전후 체크리스트 재생성",
    command: ["node", "scripts/generate-high-blocking-filing-checklist.mjs"],
  },
  {
    id: "high-blocking-response-followup-cockpit",
    description: "high blocking 외부 회신 후속 점검 콕핏 재생성",
    command: ["node", "scripts/generate-high-blocking-response-followup-cockpit.mjs"],
  },
  {
    id: "high-blocking-next-check-session-packet",
    description: "high blocking 다음 점검 세션 패킷 재생성",
    command: ["node", "scripts/generate-high-blocking-next-check-session-packet.mjs"],
  },
  {
    id: "high-blocking-next-check-command-audit",
    description: "high blocking 다음 점검 helper 날짜 규칙 감사표 재생성",
    command: ["node", "scripts/generate-high-blocking-next-check-command-audit.mjs"],
  },
  {
    id: "high-blocking-followup-history",
    description: "high blocking 후속 점검 이력 보드 재생성",
    command: ["node", "scripts/generate-high-blocking-followup-history.mjs"],
  },
  {
    id: "high-blocking-submission-approval-board",
    description: "high blocking 외부 제출 전 사용자 승인 보드 재생성",
    command: ["node", "scripts/generate-high-blocking-submission-approval-board.mjs"],
  },
  {
    id: "research-completion-cockpit",
    description: "goal 완료 병목 통합 실행 보드 재생성",
    command: ["node", "scripts/generate-research-completion-cockpit.mjs"],
  },
  {
    id: "long-term-potential-scorecard",
    description: "장기 가능성 점수카드 재생성",
    command: ["node", "scripts/generate-long-term-potential-scorecard.mjs"],
  },
  {
    id: "research-next-moves",
    description: "다음 리서치 액션 보드 재생성",
    command: ["node", "scripts/generate-research-next-moves.mjs"],
  },
  {
    id: "fieldwork-route-planner",
    description: "지하철 현장 조사 루트 플래너 재생성",
    command: ["node", "scripts/generate-fieldwork-route-planner.mjs"],
  },
  {
    id: "fieldwork-observation-notebook",
    description: "지하철 현장 관찰 노트북 재생성",
    command: ["node", "scripts/generate-fieldwork-observation-notebook.mjs"],
  },
  {
    id: "focus-project-fieldwork-cockpit",
    description: "핵심 4개 사업 현장조사 콕핏 재생성",
    command: ["node", "scripts/generate-focus-project-fieldwork-cockpit.mjs"],
  },
  {
    id: "focus-project-pair-comparison-board",
    description: "핵심 사업 쌍 비교 준비/기록 보드 재생성",
    command: ["node", "scripts/generate-focus-project-pair-comparison-board.mjs"],
  },
  {
    id: "autonomous-mobility-scenario",
    description: "자율주행 보편화 교통입지 시나리오 점검표 재생성",
    command: ["node", "scripts/generate-autonomous-mobility-scenario.mjs"],
  },
  {
    id: "focus-area-strategy",
    description: "생활권별 전략/액션 큐 재생성",
    command: ["node", "scripts/generate-focus-area-strategy.mjs"],
  },
  {
    id: "map-missing-review",
    description: "사업구역 레이어 보강 리뷰 재생성",
    command: ["node", "scripts/generate-map-missing-business-layer-review.mjs"],
  },
  {
    id: "recordcode-dead-end-audit",
    description: "recordCode 미연결 감사표 재생성",
    command: ["node", "scripts/generate-recordcode-dead-end-audit.mjs"],
  },
  {
    id: "official-update-registry",
    description: "공식 업데이트 출처 레지스트리 재생성",
    command: ["node", "scripts/generate-official-update-registry.mjs"],
  },
  {
    id: "official-update-runbook-checklist",
    description: "공식 업데이트 런북 실행 체크리스트 재생성",
    command: ["node", "scripts/generate-official-update-runbook-checklist.mjs"],
  },
  {
    id: "official-source-freshness-ledger",
    description: "공식 출처별 로컬 신선도 장부 재생성",
    command: ["node", "scripts/generate-official-source-freshness-ledger.mjs"],
  },
  {
    id: "official-source-activation-checklist",
    description: "수동/API 공식 출처 활성화 체크리스트 재생성",
    command: ["node", "scripts/generate-official-source-activation-checklist.mjs"],
  },
  {
    id: "official-source-activation-validation",
    description: "수동/API 공식 출처 활성화 검증 보드 재생성",
    command: ["node", "scripts/generate-official-source-activation-validation.mjs"],
  },
  {
    id: "expansion-interest-zone-brief",
    description: "확장 관심권 브리프 재생성",
    command: ["node", "scripts/generate-expansion-interest-zone-brief.mjs"],
  },
  {
    id: "expansion-interest-zone-candidate-brief",
    description: "확장 관심권 후보 사업장 브리프 재생성",
    command: ["node", "scripts/generate-expansion-interest-zone-candidate-brief.mjs"],
  },
  {
    id: "expansion-interest-zone-shortlist",
    description: "확장 관심권 공식 hit shortlist 재생성",
    command: ["node", "scripts/generate-expansion-interest-zone-shortlist.mjs"],
  },
  {
    id: "expansion-urban-notice-fetch-input",
    description: "확장 관심권 서울도시공간포털 fetch 입력 재생성",
    command: ["node", "scripts/generate-expansion-urban-notice-fetch-input.mjs"],
  },
  {
    id: "expansion-urban-notice-collection-queue",
    description: "확장 관심권 서울도시공간포털 원문 수집 큐 재생성",
    command: ["node", "scripts/generate-expansion-urban-notice-collection-queue.mjs"],
  },
  {
    id: "expansion-urban-notice-review-board",
    description: "확장 관심권 원문 리뷰 보드 재생성",
    command: ["node", "scripts/generate-expansion-urban-notice-review-board.mjs"],
  },
  {
    id: "expansion-yaksu-ocr-recheck-board",
    description: "약수권 OCR 재대조 보드 재생성",
    command: ["node", "scripts/generate-expansion-yaksu-ocr-recheck-board.mjs"],
  },
  {
    id: "expansion-gangdong-stage-watch-board",
    description: "강동권 최신 단계 추적 보드 재생성",
    command: ["node", "scripts/generate-expansion-gangdong-stage-watch-board.mjs"],
  },
  {
    id: "core-expansion-research-spine",
    description: "핵심 생활권 anchor와 확장 관심권 spine 재생성",
    command: ["node", "scripts/generate-core-expansion-research-spine.mjs"],
  },
  {
    id: "life-area-extended-comparison-board",
    description: "핵심 3생활권과 확장 2권역 통합 비교 보드 재생성",
    command: ["node", "scripts/generate-life-area-extended-comparison-board.mjs"],
  },
  {
    id: "expansion-zone-latest-check-guide",
    description: "강동권·약수동 주변 최신 확인 가이드 재생성",
    command: ["node", "scripts/generate-expansion-zone-latest-check-guide.mjs"],
  },
  {
    id: "expansion-zone-monitoring-checklist",
    description: "강동권·약수동 주변 모니터링 체크리스트 재생성",
    command: ["node", "scripts/generate-expansion-zone-monitoring-checklist.mjs"],
  },
  {
    id: "expansion-zone-weekly-monitoring-cockpit",
    description: "강동권·약수동 주변 주간 모니터링 콕핏 재생성",
    command: ["node", "scripts/generate-expansion-zone-weekly-monitoring-cockpit.mjs"],
  },
  {
    id: "expansion-zone-intake-seed-board",
    description: "확장 관심권 intake seed 보드 재생성",
    command: ["node", "scripts/generate-expansion-zone-intake-seed-board.mjs"],
  },
  {
    id: "expansion-official-latest-check-audit",
    description: "확장 관심권 공식 최신 확인 감사표 재생성",
    command: ["node", "scripts/generate-expansion-official-latest-check-audit.mjs"],
  },
  {
    id: "reassessment-watchlist",
    description: "장기 가설 재평가 감시표 재생성",
    command: ["node", "scripts/generate-reassessment-watchlist.mjs"],
  },
  {
    id: "representative-lot-fallback-workbook",
    description: "대표지번 fallback current business 식별자 워크북 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-workbook.mjs"],
  },
  {
    id: "representative-lot-fallback-identifier-closure-workbook",
    description: "대표지번 fallback current business presentSn 클로저 워크북 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-identifier-closure-workbook.mjs"],
  },
  {
    id: "representative-lot-fallback-api-probe",
    description: "대표지번 fallback API probe 리포트 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-api-probe.mjs"],
  },
  {
    id: "representative-lot-fallback-command-packet",
    description: "대표지번 fallback copy-ready 명령 패킷 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-command-packet.mjs"],
  },
  {
    id: "representative-lot-fallback-edge-session-packet",
    description: "대표지번 fallback Edge 수동 확인 세션 패킷 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-edge-session-packet.mjs"],
  },
  {
    id: "representative-lot-fallback-finding-board",
    description: "대표지번 fallback Edge 확인 결과 보드 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-finding-board.mjs"],
  },
  {
    id: "public-development-catalyst-map",
    description: "공공 개발 촉매와 사업장 재평가 연결표 재생성",
    command: ["node", "scripts/generate-public-development-catalyst-map.mjs"],
  },
  {
    id: "focus-deep-dive-queue",
    description: "생활권별 사업장 딥다이브 큐 재생성",
    command: ["node", "scripts/generate-focus-deep-dive-queue.mjs"],
  },
  {
    id: "research-hypothesis-ledger",
    description: "사업별 리서치 가설 장부 재생성",
    command: ["node", "scripts/generate-research-hypothesis-ledger.mjs"],
  },
  {
    id: "project-evidence-binder",
    description: "사업장별 공식 근거 바인더 재생성",
    command: ["node", "scripts/generate-project-evidence-binder.mjs"],
  },
  {
    id: "update-impact-ledger",
    description: "새 원문·현장 관찰 업데이트 영향 장부 재생성",
    command: ["node", "scripts/generate-update-impact-ledger.mjs"],
  },
  {
    id: "catalyst-trigger-matrix",
    description: "공공 촉매별 가설 재평가 트리거 매트릭스 재생성",
    command: ["node", "scripts/generate-catalyst-trigger-matrix.mjs"],
  },
  {
    id: "official-context-search-queue",
    description: "공식 context 월간 검색 큐 재생성",
    command: ["node", "scripts/generate-official-context-search-queue.mjs"],
  },
  {
    id: "official-context-search-results-board",
    description: "공식 context 검색 결과 검증 보드 재생성",
    command: ["node", "scripts/generate-official-context-search-results-board.mjs"],
  },
  {
    id: "official-context-impact-board",
    description: "공식 context 검색 결과의 사업장 영향 보드 재생성",
    command: ["node", "scripts/generate-official-context-impact-board.mjs"],
  },
  {
    id: "official-change-detection-board",
    description: "공식 출처 변경 감지 보드 재생성",
    command: ["node", "scripts/generate-official-change-detection-board.mjs"],
  },
  {
    id: "official-update-source-verification-bridge",
    description: "공식 업데이트와 source verification closure 연결 브리지 재생성",
    command: ["node", "scripts/generate-official-update-source-verification-bridge.mjs"],
  },
  {
    id: "official-update-intake-board",
    description: "공식 업데이트 수동 intake 라우팅 보드 재생성",
    command: ["node", "scripts/generate-official-update-intake-board.mjs"],
  },
  {
    id: "official-update-scenario-playbook",
    description: "공식 업데이트 시나리오별 intake 예시와 라우팅 플레이북 재생성",
    command: ["node", "scripts/generate-official-update-scenario-playbook.mjs"],
  },
  {
    id: "focus-project-monitoring-board",
    description: "핵심 4개 사업 최신 점검 보드 재생성",
    command: ["node", "scripts/generate-focus-project-monitoring-board.mjs"],
  },
  {
    id: "focus-project-weekly-monitoring-cockpit",
    description: "핵심 4개 사업 주간 모니터링 콕핏 재생성",
    command: ["node", "scripts/generate-focus-project-weekly-monitoring-cockpit.mjs"],
  },
  {
    id: "weekly-monitoring-history",
    description: "주간 모니터링 로그 히스토리 인덱스 재생성",
    command: ["node", "scripts/generate-weekly-monitoring-history.mjs"],
  },
  {
    id: "weekly-monitoring-comparison-board",
    description: "주간 모니터링 비교 보드 재생성",
    command: ["node", "scripts/generate-weekly-monitoring-comparison-board.mjs"],
  },
  {
    id: "life-area-monitoring-board",
    description: "생활권 모니터링 보드 재생성",
    command: ["node", "scripts/generate-life-area-monitoring-board.mjs"],
  },
  {
    id: "project-due-diligence-board",
    description: "사업장별 통합 실사 보드 재생성",
    command: ["node", "scripts/generate-project-due-diligence-board.mjs"],
  },
  {
    id: "focus-area-evidence-risk-heatmap",
    description: "생활권별 공식 근거·리스크 heatmap 재생성",
    command: ["node", "scripts/generate-focus-area-evidence-risk-heatmap.mjs"],
  },
  {
    id: "research-artifact-dependency-map",
    description: "리서치 산출물 의존성 맵 재생성",
    command: ["node", "scripts/generate-research-artifact-dependency-map.mjs"],
  },
  {
    id: "fixed-date-hardcode-audit",
    description: "생성 문서 날짜 고정 하드코딩 감사표 재생성",
    command: ["node", "scripts/generate-fixed-date-hardcode-audit.mjs"],
  },
  {
    id: "strategic-research-brief",
    description: "생활권별 전략 리서치 브리프 재생성",
    command: ["node", "scripts/generate-strategic-research-brief.mjs"],
  },
  {
    id: "focus-area-comparison-brief",
    description: "생활권별 상대 비교 브리프 재생성",
    command: ["node", "scripts/generate-focus-area-comparison-brief.mjs"],
  },
  {
    id: "expansion-project-market-areas",
    description: "확장권 시장 project-area 입력 재생성",
    command: ["node", "scripts/generate-expansion-project-market-areas.mjs"],
  },
  {
    id: "expansion-market-ingest-manifest",
    description: "확장권 시장 task-level 반입 manifest 재생성",
    command: ["node", "scripts/generate-expansion-market-ingest-manifest.mjs"],
  },
  {
    id: "expansion-market-manual-normalization",
    description: "확장권 시장 수동 원자료 정규화 재생성",
    command: [
      "python3",
      "scripts/normalize-market-manual-import.py",
      "--manifest-input",
      "data/market/manual-import/expansion-ingest-manifest.json",
      "--project-areas-input",
      "data/market/expansion-project-market-areas.json",
      "--out-tx-base",
      "data/market/transactions/expansion-manual-official-transactions-normalized",
      "--out-match-base",
      "data/market/transactions/expansion-manual-official-transactions-project-matches",
      "--out-indicator-base",
      "data/market/indicators/expansion-manual-market-indicators-normalized",
      "--out-audit-md",
      "analysis/expansion-market-manual-normalization-audit.md",
      "--out-audit-csv",
      "analysis/expansion-market-manual-normalization-audit.csv",
      "--out-audit-json",
      "analysis/expansion-market-manual-normalization-audit.json",
    ],
  },
  {
    id: "expansion-market-normalized-summary",
    description: "확장권 시장 정규화 요약 재생성",
    command: ["node", "scripts/generate-expansion-market-normalized-summary.mjs"],
  },
  {
    id: "expansion-market-signal-summary",
    description: "확장권 시장 시그널 요약 재생성",
    command: ["python3", "scripts/generate-expansion-market-signal-summary.py"],
  },
  {
    id: "life-area-market-baseline-board",
    description: "핵심·확장 생활권 시장 기준 비교 보드 재생성",
    command: ["python3", "scripts/generate-life-area-market-baseline-board.py"],
  },
  {
    id: "life-area-extended-comparison-board-refresh",
    description: "확장권 시장 시그널 반영 통합 비교 보드 재생성",
    command: ["node", "scripts/generate-life-area-extended-comparison-board.mjs"],
  },
  {
    id: "life-area-market-reaction-brief",
    description: "핵심·확장 생활권 시장 반응 브리프 재생성",
    command: ["python3", "scripts/generate-life-area-market-reaction-brief.py"],
  },
  {
    id: "expansion-market-scope-workbook",
    description: "확장권 시장 scope/workbook 재생성",
    command: ["node", "scripts/generate-expansion-market-scope-workbook.mjs"],
  },
  {
    id: "expansion-market-first-download-packet",
    description: "확장권 시장 1차 다운로드 패킷 재생성",
    command: ["node", "scripts/generate-expansion-market-first-download-packet.mjs"],
  },
  {
    id: "expansion-market-download-session-packet",
    description: "확장권 시장 다운로드 세션 패킷/상태 재생성",
    command: ["node", "scripts/generate-expansion-market-download-session-packet.mjs"],
  },
  {
    id: "expansion-market-quickstart-packet",
    description: "확장권 시장 first-session quickstart 패킷 재생성",
    command: ["node", "scripts/generate-expansion-market-quickstart-packet.mjs"],
  },
  {
    id: "focus-area-decision-memo",
    description: "생활권별 잠정 결론·반증 조건 메모 재생성",
    command: ["node", "scripts/generate-focus-area-decision-memo.mjs"],
  },
  {
    id: "project-notes",
    description: "사업별 1페이지 메모 재생성",
    command: ["node", "scripts/generate-project-notes.mjs"],
  },
  {
    id: "representative-lot-fallback-apply-audit",
    description: "대표지번 fallback matrix/project-note 적용 감사표 재생성",
    command: ["node", "scripts/generate-representative-lot-fallback-apply-audit.mjs"],
  },
  {
    id: "current-research-operating-guide",
    description: "현재 리서치 운영 가이드 재생성",
    command: ["node", "scripts/generate-current-research-operating-guide.mjs"],
  },
  {
    id: "personal-research-home",
    description: "개인 리서치 홈 재생성",
    command: ["node", "scripts/generate-personal-research-home.mjs"],
  },
  {
    id: "research-session-playbook",
    description: "리서치 작업 세션 플레이북 재생성",
    command: ["node", "scripts/generate-research-session-playbook.mjs"],
  },
  {
    id: "research-now-action-board",
    description: "지금 가능한 조사 실행 보드 재생성",
    command: ["node", "scripts/generate-research-now-action-board.mjs"],
  },
  {
    id: "research-manual-web-session-packet",
    description: "수동 웹 확인 세션 패킷 재생성",
    command: ["node", "scripts/generate-research-manual-web-session-packet.mjs"],
  },
  {
    id: "official-web-query-registry",
    description: "공식 웹 검색 레지스트리 재생성",
    command: ["node", "scripts/generate-official-web-query-registry.mjs"],
  },
  {
    id: "research-system-readiness-audit",
    description: "리서치 goal 요구사항별 준비도 감사표 재생성",
    command: ["node", "scripts/generate-research-system-readiness-audit.mjs"],
  },
  {
    id: "research-goal-completion-audit",
    description: "리서치 goal 완료 판정 감사표 재생성",
    command: ["node", "scripts/generate-research-goal-completion-audit.mjs"],
  },
];

function parseArgs(argv) {
  const args = {
    dryRun: false,
    list: false,
    from: "",
    to: "",
    only: "",
  };
  for (const arg of argv) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--list") args.list = true;
    else if (arg.startsWith("--from=")) args.from = arg.slice("--from=".length);
    else if (arg.startsWith("--to=")) args.to = arg.slice("--to=".length);
    else if (arg.startsWith("--only=")) args.only = arg.slice("--only=".length);
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/regenerate-research-artifacts.mjs [options]

Regenerates local analysis artifacts from already-collected source data.
It intentionally does not fetch remote websites, call OCR, or require API keys.

Options:
  --list          Print step ids and exit
  --dry-run       Print commands without running them
  --from=<id>     Start at a step id
  --to=<id>       Stop after a step id
  --only=<ids>    Run comma-separated step ids only
  -h, --help      Show this help
`);
}

function selectedSteps(args) {
  if (args.only) {
    const ids = new Set(args.only.split(",").map((item) => item.trim()).filter(Boolean));
    const unknown = [...ids].filter((id) => !STEPS.some((step) => step.id === id));
    if (unknown.length) throw new Error(`Unknown --only step id(s): ${unknown.join(", ")}`);
    return STEPS.filter((step) => ids.has(step.id));
  }

  let start = 0;
  let end = STEPS.length - 1;
  if (args.from) {
    start = STEPS.findIndex((step) => step.id === args.from);
    if (start < 0) throw new Error(`Unknown --from step id: ${args.from}`);
  }
  if (args.to) {
    end = STEPS.findIndex((step) => step.id === args.to);
    if (end < 0) throw new Error(`Unknown --to step id: ${args.to}`);
  }
  if (start > end) throw new Error(`Invalid range: --from=${args.from} comes after --to=${args.to}`);
  return STEPS.slice(start, end + 1);
}

function runStep(step, index, total) {
  return new Promise((resolve, reject) => {
    const label = `[${index + 1}/${total}] ${step.id}`;
    console.log(`${label} - ${step.description}`);
    console.log(`$ ${step.command.join(" ")}`);
    const started = performance.now();
    const child = spawn(step.command[0], step.command.slice(1), {
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      const elapsed = ((performance.now() - started) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`${label} completed in ${elapsed}s\n`);
        resolve();
      } else {
        reject(new Error(`${step.id} failed with ${signal ? `signal ${signal}` : `exit code ${code}`}`));
      }
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) {
    for (const [index, step] of STEPS.entries()) {
      console.log(`${String(index + 1).padStart(2, "0")} ${step.id} - ${step.command.join(" ")}`);
    }
    return;
  }

  const steps = selectedSteps(args);
  if (args.dryRun) {
    for (const [index, step] of steps.entries()) {
      console.log(`${String(index + 1).padStart(2, "0")} ${step.id}: ${step.command.join(" ")}`);
    }
    return;
  }

  const started = performance.now();
  for (const [index, step] of steps.entries()) {
    await runStep(step, index, steps.length);
  }
  const elapsed = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`Regenerated ${steps.length} research artifact step(s) in ${elapsed}s.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
