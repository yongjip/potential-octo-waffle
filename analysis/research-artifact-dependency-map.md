# 리서치 산출물 의존성 맵

작성 기준: 2026-06-24 KST

이 문서는 재생성 체인과 주요 JSON summary를 읽어 만든 운영용 의존성 맵이다. 어떤 파일을 고치면 어느 산출물이 영향을 받는지, 어떤 스크립트가 어떤 단계에 있는지 확인하는 용도다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 재생성 단계 | 160 |
| 분석 JSON | 155 |
| summary 보유 JSON | 116 |
| 선언 입력 edge | 330 |
| 내부 해소 edge | 160 |

## 분포

| 구분 | 값 |
| --- | --- |
| 단계 phase | 기타 51; 원문 검증 44; 시장 데이터 20; 완료 병목 20; 비교/가설/운영 17; 교통/현장 5; 정보몽땅/공식 최신 3 |
| summary 보유 | Y 116; N 39 |

## 핵심 산출물

| JSON | Rows | 입력 | 출력 | 단계 | 주요 입력 |
| --- | --- | --- | --- | --- | --- |
| analysis/catalyst-trigger-matrix.json | 36 | 5 | 3 | catalyst-trigger-matrix | analysis/public-development-catalyst-map.json; analysis/research-hypothesis-ledger.json; analysis/update-impact-ledger.json; analysis/project-evidence-binder.json; analysis/official-update-registry.json |
| analysis/focus-project-fieldwork-cockpit.json | 4 | 4 | 3 | focus-project-fieldwork-cockpit | analysis/focus-project-monitoring-board.json; analysis/fieldwork-observation-notebook.json; analysis/current-research-snapshot.json; data/review/fieldwork-observations-core-routes-starter.json |
| analysis/focus-project-monitoring-board.json | 4 | 2 | 3 | focus-project-monitoring-board | analysis/focus-project-monitoring-registry.json; analysis/current-research-snapshot.json |
| analysis/focus-project-pair-comparison-board.json |  | 2 | 5 | focus-project-pair-comparison-board | data/review/fieldwork-observations.json; data/review/focus-project-pair-comparisons.json |
| analysis/focus-project-weekly-monitoring-cockpit.json | 4 | 4 | 3 | focus-project-weekly-monitoring-cockpit | analysis/focus-project-monitoring-board.json; analysis/high-blocking-filing-tracker.json; analysis/official-update-runbook-checklist.json; analysis/current-research-snapshot.json |
| analysis/personal-research-home.json |  | 45 | 3 | personal-research-home | analysis/strategic-research-brief.json; analysis/focus-area-comparison-brief.json; analysis/focus-area-evidence-risk-heatmap.json; analysis/focus-area-decision-memo.json; analysis/focus-project-monitoring-board.json; analysis/focus-project-weekly-monitoring-cockpit.json; analysis/expansion-zone-weekly-monitoring-cockpit.json; analysis/focus-project-fieldwork-cockpit.json |
| analysis/project-due-diligence-board.json | 30 | 6 | 3 | project-due-diligence-board | analysis/project-comparison-matrix.json; analysis/research-next-moves.json; analysis/project-evidence-binder.json; analysis/fieldwork-route-planner.json; analysis/market-transaction-signal-summary.json; analysis/catalyst-trigger-matrix.json |
| analysis/project-evidence-binder.json | 30 | 7 | 3 | project-evidence-binder | analysis/project-comparison-matrix.json; analysis/source-evidence-audit.json; analysis/source-text-extraction-audit.json; analysis/core-value-confirmation-ledger.json; analysis/source-link-closure-board.json; analysis/research-hypothesis-ledger.json; analysis/research-completion-cockpit.json |
| analysis/research-goal-completion-audit.json | 11 | 6 | 3 | research-goal-completion-audit | analysis/research-system-readiness-audit.json; analysis/research-completion-cockpit.json; data/review/high-blocking-filing-outbox/manifest.json; analysis/high-blocking-intake-validation.json; analysis/hwp-conversion-audit.json; analysis/market-manual-normalization-audit.json |
| analysis/research-system-readiness-audit.json | 11 | 0 | 0 | research-system-readiness-audit |  |

## 재생성 단계

| # | Phase | Step | 설명 | Script | 스크립트 입력 | 스크립트 출력 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 원문 검증 | seoul-sibo-fact-check | 서울시보 본고시 OCR 대조표 재생성 | scripts/generate-seoul-sibo-original-notice-fact-check.mjs |  |  |
| 2 | 원문 검증 | gwangjin-gu-fact-check | 광진구청 원문 대조표 재생성 | scripts/generate-gwangjin-gu-notice-fact-check.mjs |  |  |
| 3 | 시장 데이터 | market-matrix | 시장 데이터 연결 매트릭스 재생성 | scripts/generate-market-data-matrix.mjs |  |  |
| 4 | 시장 데이터 | market-manual-import-readiness | 시장 원자료 수동 반입 준비도 재생성 | scripts/generate-market-manual-import-readiness.mjs |  | market-manual-import-readiness.md; market-manual-import-readiness.csv; market-manual-import-readiness.json |
| 5 | 시장 데이터 | market-manual-download-workbook | 시장 원자료 수동 다운로드 워크북 재생성 | scripts/generate-market-manual-download-workbook.mjs |  | market-manual-download-workbook.md; market-manual-download-workbook.csv; market-manual-download-workbook.json |
| 6 | 시장 데이터 | market-manual-download-status | 시장 원자료 수동 다운로드 작업별 상태 재생성 | scripts/generate-market-manual-download-status.mjs |  | market-manual-download-status.md; market-manual-download-status.csv; market-manual-download-status.json |
| 7 | 시장 데이터 | market-manual-ingest-manifest | 시장 수동 원자료 반입 manifest 재생성 | scripts/generate-market-manual-ingest-manifest.mjs |  | ingest-manifest.json; ingest-manifest.csv; analysis/market-manual-ingest-manifest.md; analysis/market-manual-ingest-manifest.csv; analysis/market-manual-ingest-manifest.json; data/market/manual-import/ingest-manifest.json |
| 8 | 시장 데이터 | market-manual-column-audit | 시장 수동 원자료 컬럼 감사표 재생성 | scripts/generate-market-manual-column-audit.py |  |  |
| 9 | 시장 데이터 | market-manual-normalization-audit | 시장 수동 원자료 정규화 감사표 재생성 | scripts/normalize-market-manual-import.py |  |  |
| 10 | 시장 데이터 | market-transaction-signal-summary | 서울시 실거래 생활권·사업장 시장 신호 요약 재생성 | scripts/generate-market-transaction-signal-summary.py |  |  |
| 11 | 시장 데이터 | market-api-readiness-audit | 시장 데이터 API 준비도 감사표 재생성 | scripts/generate-market-api-readiness-audit.mjs |  | market-api-readiness-audit.md; market-api-readiness-audit.csv; market-api-readiness-audit.json |
| 12 | 정보몽땅/공식 최신 | cleanup-snapshot-diff | 정보몽땅 스냅샷 변경 감시표 재생성 | scripts/generate-cleanup-snapshot-diff.mjs |  | analysis/cleanup-snapshot-diff.json; analysis/cleanup-snapshot-diff.csv; analysis/cleanup-snapshot-diff.md |
| 13 | 정보몽땅/공식 최신 | official-refresh-summary | 공식 최신 수집 운영 요약 재생성 | scripts/generate-official-refresh-summary.mjs | analysis/cleanup-snapshot-diff.json; data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json; data/cleanup/cleanup-board-latest-priority-candidates.json; data/urban/urban-map-details-priority-candidates.json; data/urban/urban-notice-details-priority-candidates.json; data/urban/urban-notice-attachments-priority-candidates.csv; data/urban/gangnam-songpa-notice-candidates.json; data/urban/gangnam-songpa-notice-attachments.csv | official-refresh-summary.json; official-refresh-summary.csv; official-refresh-summary.md |
| 14 | 정보몽땅/공식 최신 | cleanup-board-review-queue | 정보몽땅 공개항목 검토 큐 재생성 | scripts/generate-cleanup-board-review-queue.mjs |  | analysis/cleanup-board-review-queue.json; analysis/cleanup-board-review-queue.csv; analysis/cleanup-board-review-queue.md |
| 15 | 기타 | project-comparison-matrix-initial | 비교 매트릭스 1차 재생성 | scripts/generate-project-comparison-matrix.mjs |  |  |
| 16 | 교통/현장 | transport-context | 교통입지·생활권 컨텍스트 재생성 | scripts/generate-transport-location-context.mjs |  |  |
| 17 | 원문 검증 | source-text-audit | 원문 텍스트 추출 감사표 재생성 | scripts/generate-source-text-extraction-audit.mjs |  | source-text-extraction-audit.md; source-text-extraction-audit.csv; source-text-extraction-audit.json |
| 18 | 원문 검증 | hwp-conversion-audit | HWP/HWPX 변환 감사표 재생성 | scripts/generate-hwp-conversion-audit.mjs |  | hwp-conversion-audit.md; hwp-conversion-audit.csv; hwp-conversion-audit.json |
| 19 | 원문 검증 | management-stage-fact-check | 관리처분 단계 원문 수치 대조표 재생성 | scripts/generate-management-stage-fact-check.mjs |  |  |
| 20 | 원문 검증 | management-stage-value-resolution | 관리처분 수치 시점 해소표 재생성 | scripts/generate-management-stage-value-resolution.mjs |  | management-stage-value-resolution.md; management-stage-value-resolution.csv; management-stage-value-resolution.json |
| 21 | 원문 검증 | source-evidence-audit | 공식 근거 품질 감사표 재생성 | scripts/generate-source-evidence-audit.mjs |  |  |
| 22 | 비교/가설/운영 | project-risk-signal-summary | 사업장별 리스크 신호 요약 재생성 | scripts/generate-project-risk-signal-summary.mjs |  | analysis/project-risk-signal-summary.json; analysis/project-risk-signal-summary.csv; analysis/project-risk-signal-summary.md |
| 23 | 원문 검증 | source-value-verification-queue | 원문 수치 검증 큐 재생성 | scripts/generate-source-value-verification-queue.mjs |  | source-value-verification-queue.md; source-value-verification-queue.csv; source-value-verification-queue.json; 비교 매트릭스의 시점별 수치 주석과 사업별 메모 보강; OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시; 고시 원문 또는 자치구 원문 URL/로컬 파일 연결; 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결; 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 24 | 원문 검증 | core-ledger-before-ocr | 핵심 수치 장부 1차 재생성 | scripts/generate-core-value-confirmation-ledger.mjs |  | core-value-confirmation-ledger.md; core-value-confirmation-ledger.csv; core-value-confirmation-ledger.json |
| 25 | 원문 검증 | ocr-source-packet | OCR 원문 검수 패킷 재생성 | scripts/generate-ocr-source-verification-packet.mjs |  | ocr-source-verification-packet.md; ocr-source-verification-packet.csv; ocr-source-verification-packet.json |
| 26 | 원문 검증 | ocr-source-triage | OCR 수치 검수 트리아지 재생성 | scripts/generate-ocr-source-review-triage.mjs |  | ocr-source-review-triage.md; ocr-source-review-triage.csv; ocr-source-review-triage.json |
| 27 | 원문 검증 | ocr-image-decisions | OCR 이미지 수동 검수 결정표 재생성 | scripts/generate-ocr-image-review-decisions.mjs |  | ocr-image-review-decisions.md; ocr-image-review-decisions.csv; ocr-image-review-decisions.json |
| 28 | 원문 검증 | source-value-update-candidates | 원문 수치 보정 후보 재생성 | scripts/generate-source-value-update-candidates.mjs |  | source-value-update-candidates.md; source-value-update-candidates.csv; source-value-update-candidates.json |
| 29 | 기타 | project-comparison-matrix-final | 보정 후보 반영 비교 매트릭스 재생성 | scripts/generate-project-comparison-matrix.mjs |  |  |
| 30 | 원문 검증 | songpa-notice-value-corroboration | 송파권 원문 수치 확정성 판정 재생성 | scripts/generate-songpa-notice-value-corroboration.mjs |  | songpa-notice-value-corroboration.md; songpa-notice-value-corroboration.csv; songpa-notice-value-corroboration.json |
| 31 | 원문 검증 | core-ledger-final | OCR 트리아지·수동판정 반영 핵심 수치 장부 재생성 | scripts/generate-core-value-confirmation-ledger.mjs |  | core-value-confirmation-ledger.md; core-value-confirmation-ledger.csv; core-value-confirmation-ledger.json |
| 32 | 원문 검증 | source-link-repair-queue | 원문 링크 보정 큐 재생성 | scripts/generate-source-link-repair-queue.mjs |  | source-link-repair-queue.md; source-link-repair-queue.csv; source-link-repair-queue.json |
| 33 | 원문 검증 | source-link-repair-candidates | 원문 링크 보정 후보 근거 재생성 | scripts/generate-source-link-repair-candidates.mjs |  | source-link-repair-candidates.md; source-link-repair-candidates.csv; source-link-repair-candidates.json |
| 34 | 원문 검증 | source-link-closure-board | 원문 링크 클로저 보드 재생성 | scripts/generate-source-link-closure-board.mjs |  | source-link-closure-board.md; source-link-closure-board.csv; source-link-closure-board.json |
| 35 | 원문 검증 | core-ledger-after-source-link-candidates | 원문 링크 보조근거 반영 핵심 수치 장부 재생성 | scripts/generate-core-value-confirmation-ledger.mjs |  | core-value-confirmation-ledger.md; core-value-confirmation-ledger.csv; core-value-confirmation-ledger.json |
| 36 | 원문 검증 | songpa-source-gap-audit | 송파권 원문 연결 병목 감사표 재생성 | scripts/generate-songpa-source-gap-audit.mjs |  | songpa-source-gap-audit.json; songpa-source-gap-audit.csv; songpa-source-gap-audit.md |
| 37 | 원문 검증 | songpa-value-review-packet | 송파권 원문 수치 검토 패킷 재생성 | scripts/generate-songpa-value-review-packet.mjs |  | songpa-value-review-packet.json; songpa-value-review-packet.csv; songpa-value-review-packet.md |
| 38 | 기타 | research-status-dashboard | 생활권·사업장별 리서치 상태판 재생성 | scripts/generate-research-status-dashboard.mjs |  | research-status-dashboard.md; research-status-dashboard.csv; research-status-dashboard.json |
| 39 | 원문 검증 | source-verification-sprint-plan | P0/P1 원문 검증 실행 패킷 재생성 | scripts/generate-source-verification-sprint-plan.mjs |  | source-verification-sprint-plan.md; source-verification-sprint-plan.csv; source-verification-sprint-plan.json |
| 40 | 원문 검증 | s1-cost-infrastructure-workbook | S1 비용·기반시설 원문 대조 워크북 재생성 | scripts/generate-s1-cost-infrastructure-workbook.mjs | analysis/source-verification-sprint-plan.json; analysis/cleanup-board-review-queue.json; analysis/project-comparison-matrix.json; analysis/core-value-confirmation-ledger.json; analysis/source-evidence-audit.json | s1-cost-infrastructure-workbook.md; s1-cost-infrastructure-workbook.csv; s1-cost-infrastructure-workbook.json |
| 41 | 원문 검증 | s1-public-item-fact-check-memos | S1 공개항목 점검 메모 재생성 | scripts/generate-s1-public-item-fact-check-memos.mjs |  |  |
| 42 | 원문 검증 | s1-original-evidence-candidates | S1 원문 수치 후보 추출표 재생성 | scripts/generate-s1-original-evidence-candidates.mjs | analysis/s1-cost-infrastructure-workbook.json | s1-original-evidence-candidates.md; s1-original-evidence-candidates.csv; s1-original-evidence-candidates.json |
| 43 | 원문 검증 | s1-evidence-review-board | S1 원문 증거 리뷰 보드 재생성 | scripts/generate-s1-evidence-review-board.mjs | analysis/s1-cost-infrastructure-workbook.json; analysis/s1-original-evidence-candidates.json | s1-evidence-review-board.md; s1-evidence-review-board.csv; s1-evidence-review-board.json |
| 44 | 원문 검증 | s2-source-link-closure-workbook | S2 원문 링크 클로저 워크북 재생성 | scripts/generate-s2-source-link-closure-workbook.mjs | analysis/source-verification-sprint-plan.json; analysis/source-link-closure-board.json; analysis/source-link-repair-candidates.json; analysis/project-comparison-matrix.json | s2-source-link-closure-workbook.md; s2-source-link-closure-workbook.csv; s2-source-link-closure-workbook.json |
| 45 | 원문 검증 | s3-ocr-image-verification-workbook | S3 OCR·이미지 수치 검증 워크북 재생성 | scripts/generate-s3-ocr-image-verification-workbook.mjs | analysis/source-verification-sprint-plan.json; analysis/core-value-confirmation-ledger.json; analysis/source-text-extraction-audit.json; analysis/ocr-image-review-decisions.json | s3-ocr-image-verification-workbook.md; s3-ocr-image-verification-workbook.csv; s3-ocr-image-verification-workbook.json |
| 46 | 원문 검증 | s4-stage-conflict-resolution-workbook | S4 사업시행·관리처분 시점 충돌 해소 워크북 재생성 | scripts/generate-s4-stage-conflict-resolution-workbook.mjs | analysis/source-verification-sprint-plan.json; analysis/management-stage-fact-check.json; analysis/management-stage-value-resolution.json; analysis/core-value-confirmation-ledger.json | s4-stage-conflict-resolution-workbook.md; s4-stage-conflict-resolution-workbook.csv; s4-stage-conflict-resolution-workbook.json |
| 47 | 원문 검증 | s5-core-gap-fill-workbook | S5 핵심 공란 보강 워크북 재생성 | scripts/generate-s5-core-gap-fill-workbook.mjs | analysis/source-verification-sprint-plan.json; analysis/core-value-confirmation-ledger.json; analysis/project-comparison-matrix.json; data/cleanup/project-summaries-priority-candidates.json; data/urban/text/notice-key-fields.json; analysis/source-value-update-candidates.json; analysis/source-link-repair-candidates.json; data/cleanup/management-stage-doc-links.json | s5-core-gap-fill-workbook.md; s5-core-gap-fill-workbook.csv; s5-core-gap-fill-workbook.json |
| 48 | 원문 검증 | source-verification-closure-ledger | S1-S5 원문 검증 통합 클로저 장부 재생성 | scripts/generate-source-verification-closure-ledger.mjs | analysis/s1-evidence-review-board.json; analysis/s2-source-link-closure-workbook.json; analysis/s3-ocr-image-verification-workbook.json; analysis/s4-stage-conflict-resolution-workbook.json; analysis/s5-core-gap-fill-workbook.json; data/review/expansion-source-metadata-closure-seeds.json; data/review/source-verification-closure-decisions.json | source-verification-closure-ledger.md; source-verification-closure-ledger.csv; source-verification-closure-ledger.json |
| 49 | 원문 검증 | source-verification-decision-context-audit | 원문 검증 장부의 decision 문맥 불일치 감사표 재생성 | scripts/generate-source-verification-decision-context-audit.mjs | analysis/source-verification-closure-ledger.json; data/review/source-verification-closure-decisions.json | source-verification-decision-context-audit.md; source-verification-decision-context-audit.csv; source-verification-decision-context-audit.json |
| 50 | 원문 검증 | source-verification-action-queue | 원문 검증 pending/conflict 실행 큐 재생성 | scripts/generate-source-verification-action-queue.mjs | analysis/source-verification-closure-ledger.json; data/review/source-verification-closure-decisions.json; analysis/songpa-notice-value-corroboration.json; analysis/project-comparison-matrix.json | source-verification-action-queue.md; source-verification-action-queue.csv; source-verification-action-queue.json |
| 51 | 기타 | research-status-dashboard-refresh | 원문 검증 실행 큐 반영 상태판 재생성 | scripts/generate-research-status-dashboard.mjs |  | research-status-dashboard.md; research-status-dashboard.csv; research-status-dashboard.json |
| 52 | 원문 검증 | source-verification-sprint-plan-refresh | 원문 검증 실행 큐 반영 실행 패킷 재생성 | scripts/generate-source-verification-sprint-plan.mjs |  | source-verification-sprint-plan.md; source-verification-sprint-plan.csv; source-verification-sprint-plan.json |
| 53 | 완료 병목 | research-completion-cockpit-refresh | 원문 검증 실행 큐 반영 완료 병목 보드 재생성 | scripts/generate-research-completion-cockpit.mjs | analysis/market-manual-download-workbook.json; analysis/market-manual-download-status.json; analysis/market-manual-ingest-manifest.json; analysis/market-manual-column-audit.json; analysis/market-manual-normalization-audit.json; analysis/market-api-readiness-audit.json; analysis/high-blocking-source-escalation-packet.json; analysis/high-blocking-info-disclosure-packet.json | research-completion-cockpit.md; research-completion-cockpit.csv; research-completion-cockpit.json |
| 54 | 비교/가설/운영 | research-next-moves-refresh | 원문 검증 실행 큐 반영 다음 액션 보드 재생성 | scripts/generate-research-next-moves.mjs |  | research-next-moves.md; research-next-moves.csv; research-next-moves.json |
| 55 | 비교/가설/운영 | focus-area-strategy-refresh | 원문 검증 실행 큐 반영 생활권 전략/액션 큐 재생성 | scripts/generate-focus-area-strategy.mjs |  |  |
| 56 | 비교/가설/운영 | focus-deep-dive-queue-refresh | 원문 검증 실행 큐 반영 딥다이브 큐 재생성 | scripts/generate-focus-deep-dive-queue.mjs |  | focus-deep-dive-queue.md; focus-deep-dive-queue.csv; focus-deep-dive-queue.json |
| 57 | 기타 | residual-gap-interpretation-audit | 잔여 공란·보류 해석 감사표 재생성 | scripts/generate-residual-gap-interpretation-audit.mjs |  | residual-gap-interpretation-audit.md; residual-gap-interpretation-audit.csv; residual-gap-interpretation-audit.json |
| 58 | 원문 검증 | high-blocking-source-escalation-packet | high blocking 잔여 원문 확인 패킷 재생성 | scripts/generate-high-blocking-source-escalation-packet.mjs |  | high-blocking-source-escalation-packet.md; high-blocking-source-escalation-packet.csv; high-blocking-source-escalation-packet.json |
| 59 | 완료 병목 | high-blocking-public-summary-boundary | high blocking 공식 요약값 사용 경계표 재생성 | scripts/generate-high-blocking-public-summary-boundary.mjs | analysis/high-blocking-source-escalation-packet.json; analysis/source-link-repair-candidates.json; data/urban/map-missing-business-layer-details.csv | high-blocking-public-summary-boundary.md; high-blocking-public-summary-boundary.csv; high-blocking-public-summary-boundary.json |
| 60 | 완료 병목 | high-blocking-public-web-probe | high blocking 공식 웹 공개화면 프로브 재생성 | scripts/generate-high-blocking-public-web-probe.mjs |  | high-blocking-public-web-probe.md; high-blocking-public-web-probe.csv; high-blocking-public-web-probe.json |
| 61 | 완료 병목 | high-blocking-official-search-rerun | high blocking 공식 검색 재실행 감사표 재생성 | scripts/generate-high-blocking-official-search-rerun.mjs |  | high-blocking-official-search-rerun.md; high-blocking-official-search-rerun.csv; high-blocking-official-search-rerun.json |
| 62 | 완료 병목 | high-blocking-contact-channel-registry | high blocking 공식 문의 채널 레지스트리 재생성 | scripts/generate-high-blocking-contact-channel-registry.mjs |  | high-blocking-contact-channel-registry.md; high-blocking-contact-channel-registry.csv; high-blocking-contact-channel-registry.json |
| 63 | 완료 병목 | high-blocking-info-disclosure-packet | high blocking 정보공개청구 패킷 재생성 | scripts/generate-high-blocking-info-disclosure-packet.mjs |  | high-blocking-info-disclosure-packet.md; high-blocking-info-disclosure-packet.csv; high-blocking-info-disclosure-packet.json |
| 64 | 완료 병목 | high-blocking-response-decision-drafts | high blocking 외부 회신 decision 초안 재생성 | scripts/generate-high-blocking-response-decision-drafts.mjs |  | high-blocking-response-decision-drafts.md; high-blocking-response-decision-drafts.json |
| 65 | 완료 병목 | high-blocking-response-workflow-run | high blocking 외부 회신 workflow dry-run 보고서 재생성 | scripts/process-high-blocking-response-workflow.mjs |  | high-blocking-response-workflow-run.md; high-blocking-response-workflow-run.json |
| 66 | 완료 병목 | high-blocking-filing-tracker | high blocking 정보공개 접수/회신 tracker 재생성 | scripts/generate-high-blocking-filing-tracker.mjs |  | high-blocking-filing-tracker.md; high-blocking-filing-tracker.csv; high-blocking-filing-tracker.json |
| 67 | 완료 병목 | high-blocking-intake-validation | high blocking 회신 intake 검증표 재생성 | scripts/generate-high-blocking-intake-validation.mjs |  | high-blocking-intake-validation.md; high-blocking-intake-validation.csv; high-blocking-intake-validation.json |
| 68 | 완료 병목 | high-blocking-response-intake-guide | high blocking 회신 intake 입력 가이드 재생성 | scripts/generate-high-blocking-response-intake-guide.mjs |  | high-blocking-response-intake-guide.md; high-blocking-response-intake-guide.json; high-blocking-response-intake-examples.json |
| 69 | 완료 병목 | high-blocking-filing-outbox | high blocking 정보공개 제출 준비 파일 생성 | scripts/generate-high-blocking-filing-outbox.mjs |  | README.md; manifest.json |
| 70 | 완료 병목 | high-blocking-filing-checklist | high blocking 정보공개 접수 전후 체크리스트 재생성 | scripts/generate-high-blocking-filing-checklist.mjs |  | high-blocking-filing-checklist.md; high-blocking-filing-checklist.csv; high-blocking-filing-checklist.json |
| 71 | 완료 병목 | high-blocking-response-followup-cockpit | high blocking 외부 회신 후속 점검 콕핏 재생성 | scripts/generate-high-blocking-response-followup-cockpit.mjs | analysis/high-blocking-filing-tracker.json; analysis/high-blocking-filing-checklist.json; analysis/high-blocking-response-intake-guide.json; analysis/high-blocking-response-decision-drafts.json; analysis/high-blocking-response-workflow-run.json; analysis/research-completion-cockpit.json | high-blocking-response-followup-cockpit.md; high-blocking-response-followup-cockpit.csv; high-blocking-response-followup-cockpit.json |
| 72 | 완료 병목 | high-blocking-next-check-session-packet | high blocking 다음 점검 세션 패킷 재생성 | scripts/generate-high-blocking-next-check-session-packet.mjs | analysis/high-blocking-filing-tracker.json; analysis/high-blocking-filing-checklist.json; analysis/high-blocking-response-intake-guide.json; analysis/high-blocking-response-followup-cockpit.json; analysis/high-blocking-response-workflow-run.json | high-blocking-next-check-session-packet.md; high-blocking-next-check-session-packet.csv; high-blocking-next-check-session-packet.json |
| 73 | 완료 병목 | high-blocking-next-check-command-audit | high blocking 다음 점검 helper 날짜 규칙 감사표 재생성 | scripts/generate-high-blocking-next-check-command-audit.mjs | analysis/high-blocking-next-check-session-packet.json; analysis/high-blocking-filing-tracker.json | high-blocking-next-check-command-audit.md; high-blocking-next-check-command-audit.csv; high-blocking-next-check-command-audit.json |
| 74 | 완료 병목 | high-blocking-followup-history | high blocking 후속 점검 이력 보드 재생성 | scripts/generate-high-blocking-followup-history.mjs | data/review/high-blocking-followup-check-log.json; analysis/high-blocking-filing-tracker.json; analysis/high-blocking-next-check-session-packet.json | high-blocking-followup-history.md; high-blocking-followup-history.csv; high-blocking-followup-history.json |
| 75 | 완료 병목 | high-blocking-submission-approval-board | high blocking 외부 제출 전 사용자 승인 보드 재생성 | scripts/generate-high-blocking-submission-approval-board.mjs |  | high-blocking-submission-approval-board.md; high-blocking-submission-approval-board.csv; high-blocking-submission-approval-board.json |
| 76 | 완료 병목 | research-completion-cockpit | goal 완료 병목 통합 실행 보드 재생성 | scripts/generate-research-completion-cockpit.mjs | analysis/market-manual-download-workbook.json; analysis/market-manual-download-status.json; analysis/market-manual-ingest-manifest.json; analysis/market-manual-column-audit.json; analysis/market-manual-normalization-audit.json; analysis/market-api-readiness-audit.json; analysis/high-blocking-source-escalation-packet.json; analysis/high-blocking-info-disclosure-packet.json | research-completion-cockpit.md; research-completion-cockpit.csv; research-completion-cockpit.json |
| 77 | 원문 검증 | long-term-potential-scorecard | 장기 가능성 점수카드 재생성 | scripts/generate-long-term-potential-scorecard.mjs |  | long-term-potential-scorecard.md; long-term-potential-scorecard.csv; long-term-potential-scorecard.json |
| 78 | 비교/가설/운영 | research-next-moves | 다음 리서치 액션 보드 재생성 | scripts/generate-research-next-moves.mjs |  | research-next-moves.md; research-next-moves.csv; research-next-moves.json |
| 79 | 교통/현장 | fieldwork-route-planner | 지하철 현장 조사 루트 플래너 재생성 | scripts/generate-fieldwork-route-planner.mjs |  | fieldwork-route-planner.md; fieldwork-route-planner.csv; fieldwork-route-planner.json |
| 80 | 교통/현장 | fieldwork-observation-notebook | 지하철 현장 관찰 노트북 재생성 | scripts/generate-fieldwork-observation-notebook.mjs |  | fieldwork-observation-notebook.md; fieldwork-observation-notebook.csv; fieldwork-observation-notebook.json; fieldwork-observations.README.md; fieldwork-observation-examples.json |
| 81 | 교통/현장 | focus-project-fieldwork-cockpit | 핵심 4개 사업 현장조사 콕핏 재생성 | scripts/generate-focus-project-fieldwork-cockpit.mjs | analysis/focus-project-monitoring-board.json; analysis/fieldwork-observation-notebook.json; analysis/current-research-snapshot.json; data/review/fieldwork-observations-core-routes-starter.json | focus-project-fieldwork-cockpit.md; focus-project-fieldwork-cockpit.csv; focus-project-fieldwork-cockpit.json |
| 82 | 기타 | focus-project-pair-comparison-board | 핵심 사업 쌍 비교 준비/기록 보드 재생성 | scripts/generate-focus-project-pair-comparison-board.mjs |  | focus-project-pair-comparison-board.md; focus-project-pair-comparison-board.csv; focus-project-pair-comparison-board.json; focus-project-pair-comparisons.README.md; focus-project-pair-comparison-examples.json |
| 83 | 교통/현장 | autonomous-mobility-scenario | 자율주행 보편화 교통입지 시나리오 점검표 재생성 | scripts/generate-autonomous-mobility-scenario.mjs |  | autonomous-mobility-scenario.md; autonomous-mobility-scenario.csv; autonomous-mobility-scenario.json |
| 84 | 비교/가설/운영 | focus-area-strategy | 생활권별 전략/액션 큐 재생성 | scripts/generate-focus-area-strategy.mjs |  |  |
| 85 | 원문 검증 | map-missing-review | 사업구역 레이어 보강 리뷰 재생성 | scripts/generate-map-missing-business-layer-review.mjs |  | analysis/map-missing-business-layer-review.md |
| 86 | 원문 검증 | recordcode-dead-end-audit | recordCode 미연결 감사표 재생성 | scripts/generate-recordcode-dead-end-audit.mjs |  | recordcode-dead-end-audit.md; recordcode-dead-end-audit.csv; recordcode-dead-end-audit.json |
| 87 | 기타 | official-update-registry | 공식 업데이트 출처 레지스트리 재생성 | scripts/generate-official-update-registry.mjs |  | official-update-registry.json; official-update-registry.csv; official-update-registry.md; official-update-runbook.json; official-update-runbook.csv; official-update-runbook.md |
| 88 | 기타 | official-update-runbook-checklist | 공식 업데이트 런북 실행 체크리스트 재생성 | scripts/generate-official-update-runbook-checklist.mjs |  | official-update-runbook-checklist.md; official-update-runbook-checklist.csv; official-update-runbook-checklist.json |
| 89 | 원문 검증 | official-source-freshness-ledger | 공식 출처별 로컬 신선도 장부 재생성 | scripts/generate-official-source-freshness-ledger.mjs |  | official-source-freshness-ledger.md; official-source-freshness-ledger.csv; official-source-freshness-ledger.json |
| 90 | 원문 검증 | official-source-activation-checklist | 수동/API 공식 출처 활성화 체크리스트 재생성 | scripts/generate-official-source-activation-checklist.mjs | analysis/official-source-freshness-ledger.json; analysis/official-update-runbook-checklist.json; analysis/official-change-detection-board.json; data/review/official-source-activation-intake.json | official-source-activation-checklist.md; official-source-activation-checklist.csv; official-source-activation-checklist.json; official-source-activation-intake.README.md; official-source-activation-intake-examples.json |
| 91 | 원문 검증 | official-source-activation-validation | 수동/API 공식 출처 활성화 검증 보드 재생성 | scripts/generate-official-source-activation-validation.mjs | analysis/official-source-activation-checklist.json; data/review/official-source-activation-intake.json | official-source-activation-validation.md; official-source-activation-validation.csv; official-source-activation-validation.json |
| 92 | 기타 | expansion-interest-zone-brief | 확장 관심권 브리프 재생성 | scripts/generate-expansion-interest-zone-brief.mjs |  | expansion-interest-zone-brief.json; expansion-interest-zone-brief.csv; expansion-interest-zone-brief.md |
| 93 | 기타 | expansion-interest-zone-candidate-brief | 확장 관심권 후보 사업장 브리프 재생성 | scripts/generate-expansion-interest-zone-candidate-brief.mjs |  | expansion-interest-zone-candidate-brief.json; expansion-interest-zone-candidate-brief.csv; expansion-interest-zone-candidate-brief.md |
| 94 | 기타 | expansion-interest-zone-shortlist | 확장 관심권 공식 hit shortlist 재생성 | scripts/generate-expansion-interest-zone-shortlist.mjs |  | expansion-interest-zone-shortlist.json; expansion-interest-zone-shortlist.csv; expansion-interest-zone-shortlist.md |
| 95 | 기타 | expansion-urban-notice-fetch-input | 확장 관심권 서울도시공간포털 fetch 입력 재생성 | scripts/generate-expansion-urban-notice-fetch-input.mjs |  | data/urban/urban-notice-fetch-input-expansion-shortlist.json; data/urban/urban-notice-fetch-input-expansion-shortlist.csv |
| 96 | 기타 | expansion-urban-notice-collection-queue | 확장 관심권 서울도시공간포털 원문 수집 큐 재생성 | scripts/generate-expansion-urban-notice-collection-queue.mjs | analysis/expansion-interest-zone-shortlist.json; data/urban/urban-notice-fetch-input-expansion-shortlist.json; data/urban/urban-notice-details-expansion-shortlist.json; data/urban/urban-notice-attachments-expansion-shortlist.csv; data/urban/text/notice-text-manifest.json | analysis/expansion-urban-notice-collection-queue.md; analysis/expansion-urban-notice-collection-queue.json; analysis/expansion-urban-notice-collection-queue.csv |
| 97 | 기타 | expansion-urban-notice-review-board | 확장 관심권 원문 리뷰 보드 재생성 | scripts/generate-expansion-urban-notice-review-board.mjs | analysis/expansion-interest-zone-shortlist.json; analysis/expansion-urban-notice-collection-queue.json; data/research/expansion-urban-notice-review-seeds.json | analysis/expansion-urban-notice-review-board.md; analysis/expansion-urban-notice-review-board.json; analysis/expansion-urban-notice-review-board.csv |
| 98 | 원문 검증 | expansion-yaksu-ocr-recheck-board | 약수권 OCR 재대조 보드 재생성 | scripts/generate-expansion-yaksu-ocr-recheck-board.mjs | data/research/expansion-urban-notice-review-seeds.json | analysis/expansion-yaksu-ocr-recheck-board.md; analysis/expansion-yaksu-ocr-recheck-board.json; analysis/expansion-yaksu-ocr-recheck-board.csv |
| 99 | 기타 | expansion-gangdong-stage-watch-board | 강동권 최신 단계 추적 보드 재생성 | scripts/generate-expansion-gangdong-stage-watch-board.mjs | analysis/expansion-interest-zone-shortlist.json; analysis/expansion-urban-notice-collection-queue.json; analysis/expansion-urban-notice-review-board.json; data/review/official-update-intake.json; data/research/expansion-gangdong-stage-watch-seeds.json | analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-gangdong-stage-watch-board.json; analysis/expansion-gangdong-stage-watch-board.csv |
| 100 | 원문 검증 | core-expansion-research-spine | 핵심 생활권 anchor와 확장 관심권 spine 재생성 | scripts/generate-core-expansion-research-spine.mjs | analysis/project-comparison-matrix.json; analysis/long-term-potential-scorecard.json; analysis/project-risk-signal-summary.json; analysis/transport-location-context.json; analysis/expansion-urban-notice-review-board.json; analysis/expansion-interest-zone-shortlist.json | analysis/core-expansion-research-spine.md; analysis/core-expansion-research-spine.json; analysis/core-expansion-research-spine.csv |
| 101 | 기타 | life-area-extended-comparison-board | 핵심 3생활권과 확장 2권역 통합 비교 보드 재생성 | scripts/generate-life-area-extended-comparison-board.mjs | analysis/current-research-snapshot.json; analysis/focus-area-comparison-brief.json; analysis/focus-area-decision-memo.json; analysis/focus-area-evidence-risk-heatmap.json; analysis/core-expansion-research-spine.json; analysis/expansion-interest-zone-brief.json; analysis/life-area-monitoring-board.json; analysis/market-transaction-signal-summary.json | analysis/life-area-extended-comparison-board.md; analysis/life-area-extended-comparison-board.json; analysis/life-area-extended-comparison-board.csv |
| 102 | 기타 | expansion-zone-latest-check-guide | 강동권·약수동 주변 최신 확인 가이드 재생성 | scripts/generate-expansion-zone-latest-check-guide.mjs | analysis/expansion-interest-zone-brief.json; analysis/expansion-interest-zone-shortlist.json; analysis/expansion-gangdong-stage-watch-board.json; analysis/expansion-yaksu-ocr-recheck-board.json; analysis/expansion-official-latest-check-audit.json; data/review/official-source-activation-intake.json; analysis/life-area-monitoring-board.json | analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-latest-check-guide.json; analysis/expansion-zone-latest-check-guide.csv |
| 103 | 기타 | expansion-zone-monitoring-checklist | 강동권·약수동 주변 모니터링 체크리스트 재생성 | scripts/generate-expansion-zone-monitoring-checklist.mjs | analysis/expansion-zone-latest-check-guide.json; analysis/official-update-runbook.json; data/review/official-source-activation-intake.json; analysis/life-area-monitoring-board.json | analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-monitoring-checklist.json; analysis/expansion-zone-monitoring-checklist.csv |
| 104 | 기타 | expansion-zone-weekly-monitoring-cockpit | 강동권·약수동 주변 주간 모니터링 콕핏 재생성 | scripts/generate-expansion-zone-weekly-monitoring-cockpit.mjs | analysis/expansion-zone-latest-check-guide.json; analysis/expansion-zone-monitoring-checklist.json; analysis/official-update-runbook-checklist.json; analysis/life-area-monitoring-board.json | expansion-zone-weekly-monitoring-cockpit.md; expansion-zone-weekly-monitoring-cockpit.csv; expansion-zone-weekly-monitoring-cockpit.json |
| 105 | 기타 | expansion-zone-intake-seed-board | 확장 관심권 intake seed 보드 재생성 | scripts/generate-expansion-zone-intake-seed-board.mjs | analysis/expansion-gangdong-stage-watch-board.json; analysis/expansion-yaksu-ocr-recheck-board.json; analysis/expansion-interest-zone-shortlist.json; data/review/official-update-intake.json; data/review/official-source-activation-intake.json | analysis/expansion-zone-intake-seed-board.md; analysis/expansion-zone-intake-seed-board.json; analysis/expansion-zone-intake-seed-board.csv |
| 106 | 기타 | expansion-official-latest-check-audit | 확장 관심권 공식 최신 확인 감사표 재생성 | scripts/generate-expansion-official-latest-check-audit.mjs | data/review/expansion-official-latest-check-intake.json | expansion-official-latest-check-audit.md; expansion-official-latest-check-audit.csv; expansion-official-latest-check-audit.json |
| 107 | 비교/가설/운영 | reassessment-watchlist | 장기 가설 재평가 감시표 재생성 | scripts/generate-reassessment-watchlist.mjs |  | reassessment-watchlist.md; reassessment-watchlist.csv; reassessment-watchlist.json |
| 108 | 기타 | representative-lot-fallback-workbook | 대표지번 fallback current business 식별자 워크북 재생성 | scripts/generate-representative-lot-fallback-workbook.mjs | analysis/project-comparison-matrix.json; data/urban/representative-lot-map-candidates.csv; data/urban/urban-map-details-priority-candidates.json; analysis/reassessment-watchlist.json | representative-lot-fallback-workbook.md; representative-lot-fallback-workbook.csv; representative-lot-fallback-workbook.json |
| 109 | 기타 | representative-lot-fallback-identifier-closure-workbook | 대표지번 fallback current business presentSn 클로저 워크북 재생성 | scripts/generate-representative-lot-fallback-identifier-closure-workbook.mjs | analysis/representative-lot-fallback-workbook.json; data/urban/representative-lot-map-candidates.csv | representative-lot-fallback-identifier-closure-workbook.md; representative-lot-fallback-identifier-closure-workbook.csv; representative-lot-fallback-identifier-closure-workbook.json |
| 110 | 기타 | representative-lot-fallback-api-probe | 대표지번 fallback API probe 리포트 재생성 | scripts/generate-representative-lot-fallback-api-probe.mjs | data/urban/representative-lot-fallback-api-probe.json; analysis/representative-lot-fallback-identifier-closure-workbook.json | representative-lot-fallback-api-probe.md; representative-lot-fallback-api-probe.csv; representative-lot-fallback-api-probe.json |
| 111 | 기타 | representative-lot-fallback-command-packet | 대표지번 fallback copy-ready 명령 패킷 재생성 | scripts/generate-representative-lot-fallback-command-packet.mjs | analysis/representative-lot-fallback-api-probe.json; analysis/representative-lot-fallback-finding-board.json | representative-lot-fallback-command-packet.md; representative-lot-fallback-command-packet.csv; representative-lot-fallback-command-packet.json |
| 112 | 기타 | representative-lot-fallback-edge-session-packet | 대표지번 fallback Edge 수동 확인 세션 패킷 재생성 | scripts/generate-representative-lot-fallback-edge-session-packet.mjs | analysis/representative-lot-fallback-identifier-closure-workbook.json; analysis/representative-lot-fallback-api-probe.json | representative-lot-fallback-edge-session-packet.md; representative-lot-fallback-edge-session-packet.csv; representative-lot-fallback-edge-session-packet.json |
| 113 | 기타 | representative-lot-fallback-finding-board | 대표지번 fallback Edge 확인 결과 보드 재생성 | scripts/generate-representative-lot-fallback-finding-board.mjs |  | representative-lot-fallback-finding-board.md; representative-lot-fallback-finding-board.csv; representative-lot-fallback-finding-board.json; representative-lot-fallback-browser-findings.README.md; representative-lot-fallback-browser-finding-examples.json |
| 114 | 비교/가설/운영 | public-development-catalyst-map | 공공 개발 촉매와 사업장 재평가 연결표 재생성 | scripts/generate-public-development-catalyst-map.mjs |  | public-development-catalyst-map.md; public-development-catalyst-map.csv; public-development-catalyst-map.json |
| 115 | 비교/가설/운영 | focus-deep-dive-queue | 생활권별 사업장 딥다이브 큐 재생성 | scripts/generate-focus-deep-dive-queue.mjs |  | focus-deep-dive-queue.md; focus-deep-dive-queue.csv; focus-deep-dive-queue.json |
| 116 | 비교/가설/운영 | research-hypothesis-ledger | 사업별 리서치 가설 장부 재생성 | scripts/generate-research-hypothesis-ledger.mjs | analysis/long-term-potential-scorecard.json; analysis/public-development-catalyst-map.json; analysis/project-risk-signal-summary.json; analysis/reassessment-watchlist.json; analysis/focus-deep-dive-queue.json | research-hypothesis-ledger.md; research-hypothesis-ledger.csv; research-hypothesis-ledger.json |
| 117 | 기타 | project-evidence-binder | 사업장별 공식 근거 바인더 재생성 | scripts/generate-project-evidence-binder.mjs | analysis/project-comparison-matrix.json; analysis/source-evidence-audit.json; analysis/source-text-extraction-audit.json; analysis/core-value-confirmation-ledger.json; analysis/source-link-closure-board.json; analysis/research-hypothesis-ledger.json; analysis/research-completion-cockpit.json | project-evidence-binder.md; project-evidence-binder.csv; project-evidence-binder.json |
| 118 | 기타 | update-impact-ledger | 새 원문·현장 관찰 업데이트 영향 장부 재생성 | scripts/generate-update-impact-ledger.mjs | analysis/research-hypothesis-ledger.json; analysis/fieldwork-observation-notebook.json; analysis/research-completion-cockpit.json; analysis/official-update-runbook-checklist.json; analysis/focus-project-pair-comparison-board.json | update-impact-ledger.md; update-impact-ledger.csv; update-impact-ledger.json |
| 119 | 비교/가설/운영 | catalyst-trigger-matrix | 공공 촉매별 가설 재평가 트리거 매트릭스 재생성 | scripts/generate-catalyst-trigger-matrix.mjs | analysis/public-development-catalyst-map.json; analysis/research-hypothesis-ledger.json; analysis/update-impact-ledger.json; analysis/project-evidence-binder.json; analysis/official-update-registry.json | catalyst-trigger-matrix.md; catalyst-trigger-matrix.csv; catalyst-trigger-matrix.json |
| 120 | 기타 | official-context-search-queue | 공식 context 월간 검색 큐 재생성 | scripts/generate-official-context-search-queue.mjs | analysis/public-development-catalyst-map.json; analysis/catalyst-trigger-matrix.json; analysis/official-source-activation-checklist.json; analysis/official-context-sources.csv | official-context-search-queue.md; official-context-search-queue.csv; official-context-search-queue.json |
| 121 | 기타 | official-context-search-results-board | 공식 context 검색 결과 검증 보드 재생성 | scripts/generate-official-context-search-results-board.mjs | analysis/official-context-search-queue.json; data/review/official-context-search-results-intake.json | official-context-search-results-board.md; official-context-search-results-board.csv; official-context-search-results-board.json; official-context-search-results-intake.README.md; official-context-search-results-intake-examples.json |
| 122 | 기타 | official-context-impact-board | 공식 context 검색 결과의 사업장 영향 보드 재생성 | scripts/generate-official-context-impact-board.mjs | analysis/official-context-search-results-board.json; analysis/catalyst-trigger-matrix.json; analysis/public-development-catalyst-map.json; analysis/research-hypothesis-ledger.json | official-context-impact-board.md; official-context-impact-board.csv; official-context-impact-board.json |
| 123 | 기타 | official-change-detection-board | 공식 출처 변경 감지 보드 재생성 | scripts/generate-official-change-detection-board.mjs | analysis/official-update-registry.json; analysis/official-source-freshness-ledger.json; analysis/official-update-runbook-checklist.json; analysis/update-impact-ledger.json; analysis/catalyst-trigger-matrix.json; analysis/research-completion-cockpit.json | official-change-detection-board.md; official-change-detection-board.csv; official-change-detection-board.json |
| 124 | 원문 검증 | official-update-source-verification-bridge | 공식 업데이트와 source verification closure 연결 브리지 재생성 | scripts/generate-official-update-source-verification-bridge.mjs | data/review/official-update-intake.json; analysis/source-verification-closure-ledger.json; data/review/source-verification-closure-decisions.json; analysis/update-impact-ledger.json | official-update-source-verification-bridge.md; official-update-source-verification-bridge.csv; official-update-source-verification-bridge.json |
| 125 | 기타 | official-update-intake-board | 공식 업데이트 수동 intake 라우팅 보드 재생성 | scripts/generate-official-update-intake-board.mjs | data/review/official-update-intake.json; analysis/official-update-registry.json; analysis/official-change-detection-board.json; analysis/project-comparison-matrix.json; analysis/research-completion-cockpit.json; analysis/official-update-source-verification-bridge.json | official-update-intake-board.md; official-update-intake-board.csv; official-update-intake-board.json; official-update-intake.README.md; official-update-intake-examples.json |
| 126 | 기타 | official-update-scenario-playbook | 공식 업데이트 시나리오별 intake 예시와 라우팅 플레이북 재생성 | scripts/generate-official-update-scenario-playbook.mjs | analysis/official-change-detection-board.json; analysis/official-update-intake-board.json; analysis/update-impact-ledger.json; analysis/project-comparison-matrix.json; analysis/research-completion-cockpit.json | official-update-scenario-playbook.md; official-update-scenario-playbook.csv; official-update-scenario-playbook.json |
| 127 | 기타 | focus-project-monitoring-board | 핵심 4개 사업 최신 점검 보드 재생성 | scripts/generate-focus-project-monitoring-board.mjs | analysis/focus-project-monitoring-registry.json; analysis/current-research-snapshot.json | focus-project-monitoring-board.md; focus-project-monitoring-board.csv; focus-project-monitoring-board.json |
| 128 | 기타 | focus-project-weekly-monitoring-cockpit | 핵심 4개 사업 주간 모니터링 콕핏 재생성 | scripts/generate-focus-project-weekly-monitoring-cockpit.mjs | analysis/focus-project-monitoring-board.json; analysis/high-blocking-filing-tracker.json; analysis/official-update-runbook-checklist.json; analysis/current-research-snapshot.json | focus-project-weekly-monitoring-cockpit.md; focus-project-weekly-monitoring-cockpit.csv; focus-project-weekly-monitoring-cockpit.json |
| 129 | 기타 | weekly-monitoring-history | 주간 모니터링 로그 히스토리 인덱스 재생성 | scripts/generate-weekly-monitoring-history.mjs |  | weekly-monitoring-history.md; weekly-monitoring-history.csv; weekly-monitoring-history.json |
| 130 | 기타 | weekly-monitoring-comparison-board | 주간 모니터링 비교 보드 재생성 | scripts/generate-weekly-monitoring-comparison-board.mjs | analysis/weekly-monitoring-history.json; analysis/focus-project-weekly-monitoring-cockpit.json; analysis/focus-project-fieldwork-cockpit.json; analysis/current-research-snapshot.json | weekly-monitoring-comparison-board.md; weekly-monitoring-comparison-board.csv; weekly-monitoring-comparison-board.json |
| 131 | 기타 | life-area-monitoring-board | 생활권 모니터링 보드 재생성 | scripts/generate-life-area-monitoring-board.mjs | analysis/current-research-snapshot.json; analysis/focus-area-comparison-brief.json; analysis/focus-area-decision-memo.json; analysis/focus-area-evidence-risk-heatmap.json; analysis/weekly-monitoring-comparison-board.json; analysis/weekly-monitoring-history.json; analysis/core-expansion-research-spine.json; analysis/expansion-gangdong-stage-watch-board.json | life-area-monitoring-board.md; life-area-monitoring-board.csv; life-area-monitoring-board.json |
| 132 | 비교/가설/운영 | project-due-diligence-board | 사업장별 통합 실사 보드 재생성 | scripts/generate-project-due-diligence-board.mjs | analysis/project-comparison-matrix.json; analysis/research-next-moves.json; analysis/project-evidence-binder.json; analysis/fieldwork-route-planner.json; analysis/market-transaction-signal-summary.json; analysis/catalyst-trigger-matrix.json | project-due-diligence-board.md; project-due-diligence-board.csv; project-due-diligence-board.json |
| 133 | 비교/가설/운영 | focus-area-evidence-risk-heatmap | 생활권별 공식 근거·리스크 heatmap 재생성 | scripts/generate-focus-area-evidence-risk-heatmap.mjs | analysis/long-term-potential-scorecard.json; analysis/project-due-diligence-board.json; analysis/source-evidence-audit.json; analysis/project-risk-signal-summary.json; analysis/research-hypothesis-ledger.json; analysis/research-completion-cockpit.json | focus-area-evidence-risk-heatmap.md; focus-area-evidence-risk-heatmap.csv; focus-area-evidence-risk-heatmap.json |
| 134 | 기타 | research-artifact-dependency-map | 리서치 산출물 의존성 맵 재생성 | scripts/generate-research-artifact-dependency-map.mjs |  | research-artifact-dependency-map.md; research-artifact-dependency-map.csv; research-artifact-dependency-map.json |
| 135 | 기타 | fixed-date-hardcode-audit | 생성 문서 날짜 고정 하드코딩 감사표 재생성 | scripts/generate-fixed-date-hardcode-audit.mjs |  | fixed-date-hardcode-audit.md; fixed-date-hardcode-audit.csv; fixed-date-hardcode-audit.json |
| 136 | 기타 | strategic-research-brief | 생활권별 전략 리서치 브리프 재생성 | scripts/generate-strategic-research-brief.mjs |  | strategic-research-brief.md; strategic-research-brief.csv; strategic-research-brief.json |
| 137 | 비교/가설/운영 | focus-area-comparison-brief | 생활권별 상대 비교 브리프 재생성 | scripts/generate-focus-area-comparison-brief.mjs | analysis/strategic-research-brief.json; analysis/focus-area-strategy.json; analysis/long-term-potential-scorecard.json; analysis/research-hypothesis-ledger.json; analysis/fieldwork-route-planner.json; analysis/market-transaction-signal-summary.json; analysis/official-source-freshness-ledger.json | focus-area-comparison-brief.md; focus-area-comparison-brief.csv; focus-area-comparison-brief.json |
| 138 | 시장 데이터 | expansion-project-market-areas | 확장권 시장 project-area 입력 재생성 | scripts/generate-expansion-project-market-areas.mjs |  | data/market/expansion-project-market-areas.json; data/market/expansion-project-market-areas.csv; analysis/expansion-project-market-areas.md; analysis/expansion-project-market-areas.csv; analysis/expansion-project-market-areas.json |
| 139 | 시장 데이터 | expansion-market-ingest-manifest | 확장권 시장 task-level 반입 manifest 재생성 | scripts/generate-expansion-market-ingest-manifest.mjs |  | expansion-ingest-manifest.json; expansion-ingest-manifest.csv; analysis/expansion-market-ingest-manifest.md; analysis/expansion-market-ingest-manifest.csv; analysis/expansion-market-ingest-manifest.json |
| 140 | 시장 데이터 | expansion-market-manual-normalization | 확장권 시장 수동 원자료 정규화 재생성 | scripts/normalize-market-manual-import.py |  |  |
| 141 | 시장 데이터 | expansion-market-normalized-summary | 확장권 시장 정규화 요약 재생성 | scripts/generate-expansion-market-normalized-summary.mjs |  | analysis/expansion-market-normalized-summary.md; analysis/expansion-market-normalized-summary.csv; analysis/expansion-market-normalized-summary.json |
| 142 | 시장 데이터 | expansion-market-signal-summary | 확장권 시장 시그널 요약 재생성 | scripts/generate-expansion-market-signal-summary.py |  |  |
| 143 | 시장 데이터 | life-area-market-baseline-board | 핵심·확장 생활권 시장 기준 비교 보드 재생성 | scripts/generate-life-area-market-baseline-board.py |  |  |
| 144 | 기타 | life-area-extended-comparison-board-refresh | 확장권 시장 시그널 반영 통합 비교 보드 재생성 | scripts/generate-life-area-extended-comparison-board.mjs | analysis/current-research-snapshot.json; analysis/focus-area-comparison-brief.json; analysis/focus-area-decision-memo.json; analysis/focus-area-evidence-risk-heatmap.json; analysis/core-expansion-research-spine.json; analysis/expansion-interest-zone-brief.json; analysis/life-area-monitoring-board.json; analysis/market-transaction-signal-summary.json | analysis/life-area-extended-comparison-board.md; analysis/life-area-extended-comparison-board.json; analysis/life-area-extended-comparison-board.csv |
| 145 | 시장 데이터 | life-area-market-reaction-brief | 핵심·확장 생활권 시장 반응 브리프 재생성 | scripts/generate-life-area-market-reaction-brief.py |  |  |
| 146 | 시장 데이터 | expansion-market-scope-workbook | 확장권 시장 scope/workbook 재생성 | scripts/generate-expansion-market-scope-workbook.mjs | analysis/expansion-interest-zone-brief.json; analysis/expansion-interest-zone-shortlist.json; data/research/expansion-interest-zone-candidates.json; data/market/project-market-areas.json; analysis/market-manual-download-workbook.json; data/market/transactions/manual-official-transactions-normalized.csv; data/market/transactions/expansion-manual-official-transactions-normalized.csv | expansion-market-scope-workbook.md; expansion-market-scope-workbook.csv; expansion-market-scope-workbook.json; expansion-market-areas.json; expansion-market-areas.csv |
| 147 | 시장 데이터 | expansion-market-first-download-packet | 확장권 시장 1차 다운로드 패킷 재생성 | scripts/generate-expansion-market-first-download-packet.mjs |  | expansion-market-first-download-packet.md; expansion-market-first-download-packet.csv; expansion-market-first-download-packet.json |
| 148 | 시장 데이터 | expansion-market-download-session-packet | 확장권 시장 다운로드 세션 패킷/상태 재생성 | scripts/generate-expansion-market-download-session-packet.mjs |  | expansion-market-download-session-packet.md; expansion-market-download-session-packet.csv; expansion-market-download-session-packet.json; expansion-market-download-status.md; expansion-market-download-status.csv; expansion-market-download-status.json |
| 149 | 시장 데이터 | expansion-market-quickstart-packet | 확장권 시장 first-session quickstart 패킷 재생성 | scripts/generate-expansion-market-quickstart-packet.mjs |  | expansion-market-quickstart-packet.md; expansion-market-quickstart-packet.csv; expansion-market-quickstart-packet.json |
| 150 | 비교/가설/운영 | focus-area-decision-memo | 생활권별 잠정 결론·반증 조건 메모 재생성 | scripts/generate-focus-area-decision-memo.mjs | analysis/focus-area-comparison-brief.json; analysis/strategic-research-brief.json; analysis/research-hypothesis-ledger.json; analysis/project-due-diligence-board.json; analysis/research-completion-cockpit.json; analysis/official-change-detection-board.json | focus-area-decision-memo.md; focus-area-decision-memo.csv; focus-area-decision-memo.json |
| 151 | 비교/가설/운영 | project-notes | 사업별 1페이지 메모 재생성 | scripts/generate-project-notes.mjs |  |  |
| 152 | 기타 | representative-lot-fallback-apply-audit | 대표지번 fallback matrix/project-note 적용 감사표 재생성 | scripts/generate-representative-lot-fallback-apply-audit.mjs |  | representative-lot-fallback-apply-audit.md; representative-lot-fallback-apply-audit.csv; representative-lot-fallback-apply-audit.json |
| 153 | 기타 | current-research-operating-guide | 현재 리서치 운영 가이드 재생성 | scripts/generate-current-research-operating-guide.mjs | analysis/research-status-dashboard.json; analysis/current-research-snapshot.json; analysis/focus-project-weekly-monitoring-cockpit.json; analysis/expansion-zone-weekly-monitoring-cockpit.json; analysis/expansion-official-latest-check-audit.json; analysis/life-area-monitoring-board.json; analysis/research-completion-cockpit.json; analysis/research-goal-completion-audit.json | current-research-operating-guide.md; current-research-operating-guide.json; current-research-operating-guide.csv |
| 154 | 비교/가설/운영 | personal-research-home | 개인 리서치 홈 재생성 | scripts/generate-personal-research-home.mjs | analysis/strategic-research-brief.json; analysis/focus-area-comparison-brief.json; analysis/focus-area-evidence-risk-heatmap.json; analysis/focus-area-decision-memo.json; analysis/focus-project-monitoring-board.json; analysis/focus-project-weekly-monitoring-cockpit.json; analysis/expansion-zone-weekly-monitoring-cockpit.json; analysis/focus-project-fieldwork-cockpit.json | personal-research-home.md; personal-research-home.csv; personal-research-home.json |
| 155 | 기타 | research-session-playbook | 리서치 작업 세션 플레이북 재생성 | scripts/generate-research-session-playbook.mjs | analysis/personal-research-home.json; analysis/focus-area-decision-memo.json; analysis/project-due-diligence-board.json; analysis/research-completion-cockpit.json; analysis/official-update-runbook-checklist.json; analysis/official-change-detection-board.json; analysis/official-update-intake-board.json; analysis/expansion-zone-intake-seed-board.json | research-session-playbook.md; research-session-playbook.csv; research-session-playbook.json |
| 156 | 기타 | research-now-action-board | 지금 가능한 조사 실행 보드 재생성 | scripts/generate-research-now-action-board.mjs | analysis/current-research-operating-guide.json; analysis/personal-research-home.json; analysis/research-session-playbook.json; analysis/high-blocking-filing-tracker.json; analysis/high-blocking-next-check-session-packet.json; analysis/focus-project-weekly-monitoring-cockpit.json; analysis/expansion-zone-weekly-monitoring-cockpit.json; analysis/representative-lot-fallback-finding-board.json | research-now-action-board.md; research-now-action-board.csv; research-now-action-board.json |
| 157 | 기타 | research-manual-web-session-packet | 수동 웹 확인 세션 패킷 재생성 | scripts/generate-research-manual-web-session-packet.mjs | analysis/research-now-action-board.json; analysis/focus-project-weekly-monitoring-cockpit.json; analysis/expansion-zone-weekly-monitoring-cockpit.json; analysis/high-blocking-next-check-session-packet.json; analysis/representative-lot-fallback-edge-session-packet.json; analysis/representative-lot-fallback-finding-board.json | research-manual-web-session-packet.md; research-manual-web-session-packet.csv; research-manual-web-session-packet.json |
| 158 | 기타 | official-web-query-registry | 공식 웹 검색 레지스트리 재생성 | scripts/generate-official-web-query-registry.mjs | analysis/focus-project-monitoring-registry.json; analysis/official-change-detection-board.json; data/review/official-source-activation-intake.json; analysis/high-blocking-next-check-session-packet.json; analysis/high-blocking-contact-channel-registry.json; analysis/representative-lot-fallback-edge-session-packet.json | official-web-query-registry.md; official-web-query-registry.json; official-web-query-registry.csv |
| 159 | 기타 | research-system-readiness-audit | 리서치 goal 요구사항별 준비도 감사표 재생성 | scripts/generate-research-system-readiness-audit.mjs | analysis/project-comparison-matrix.json; analysis/source-evidence-audit.json; analysis/research-status-dashboard.json; analysis/official-update-registry.json; analysis/official-update-runbook.json; analysis/official-update-runbook-checklist.json; analysis/hwp-conversion-audit.json; analysis/source-text-extraction-audit.json | research-system-readiness-audit.md; research-system-readiness-audit.csv; research-system-readiness-audit.json |
| 160 | 완료 병목 | research-goal-completion-audit | 리서치 goal 완료 판정 감사표 재생성 | scripts/generate-research-goal-completion-audit.mjs | analysis/research-system-readiness-audit.json; analysis/research-completion-cockpit.json; data/review/high-blocking-filing-outbox/manifest.json; analysis/high-blocking-intake-validation.json; analysis/hwp-conversion-audit.json; analysis/market-manual-normalization-audit.json | research-goal-completion-audit.md; research-goal-completion-audit.csv; research-goal-completion-audit.json |

## Summary 산출물

| JSON | 생성기준 | Rows | 입력 | 출력 | 단계 |
| --- | --- | --- | --- | --- | --- |
| analysis/autonomous-mobility-scenario.json | 2026-06-24 KST | 30 | 4 | 3 | autonomous-mobility-scenario |
| analysis/catalyst-trigger-matrix.json | 2026-06-24 KST | 36 | 5 | 3 | catalyst-trigger-matrix |
| analysis/cleanup-snapshot-diff.json | 2026-06-24T13:12:48.822Z |  | 0 | 0 | cleanup-snapshot-diff |
| analysis/core-expansion-research-spine.json | 2026-06-24 KST | 15 | 6 | 3 | core-expansion-research-spine |
| analysis/current-research-operating-guide.json | 2026-06-24 KST |  | 13 | 3 | current-research-operating-guide |
| analysis/expansion-gangdong-first-pass-collection-list.json | 2026-06-24 KST | 3 | 0 | 3 |  |
| analysis/expansion-gangdong-stage-watch-board.json | 2026-06-24 KST | 7 | 5 | 3 | expansion-gangdong-stage-watch-board |
| analysis/expansion-interest-zone-brief.json | 2026-06-24 KST | 2 | 0 | 0 | expansion-interest-zone-brief |
| analysis/expansion-interest-zone-candidate-brief.json | 2026-06-24 KST | 6 | 0 | 0 | expansion-interest-zone-candidate-brief |
| analysis/expansion-interest-zone-shortlist.json | 2026-06-24 KST | 10 | 0 | 0 | expansion-interest-zone-shortlist |
| analysis/expansion-market-download-session-packet.json | 2026-06-24 KST |  | 2 | 7 | expansion-market-download-session-packet |
| analysis/expansion-market-download-status.json | 2026-06-24 KST | 30 | 2 | 7 | expansion-market-download-session-packet |
| analysis/expansion-market-first-download-packet.json | 2026-06-24 KST |  | 1 | 3 | expansion-market-first-download-packet |
| analysis/expansion-market-ingest-manifest.json | 2026-06-24 KST | 30 | 0 | 0 | expansion-market-ingest-manifest |
| analysis/expansion-market-manual-normalization-audit.json | 2026-06-24 KST |  | 0 | 0 |  |
| analysis/expansion-market-normalized-summary.json | 2026-06-24 KST | 6 | 3 | 3 | expansion-market-normalized-summary |
| analysis/expansion-market-quickstart-packet.json | 2026-06-24 KST |  | 2 | 3 | expansion-market-quickstart-packet |
| analysis/expansion-market-scope-workbook.json | 2026-06-24 KST |  | 7 | 5 | expansion-market-scope-workbook |
| analysis/expansion-market-signal-summary.json | 2026-06-24 KST |  | 2 | 3 |  |
| analysis/expansion-official-latest-check-audit.json | 2026-06-24 KST | 4 | 1 | 3 | expansion-official-latest-check-audit |
| analysis/expansion-project-market-areas.json | 2026-06-24 KST | 6 | 0 | 0 | expansion-project-market-areas |
| analysis/expansion-urban-notice-collection-queue.json | 2026-06-24 KST | 10 | 5 | 3 | expansion-urban-notice-collection-queue |
| analysis/expansion-urban-notice-review-board.json | 2026-06-24 KST | 10 | 3 | 3 | expansion-urban-notice-review-board |
| analysis/expansion-yaksu-ocr-recheck-board.json | 2026-06-24 KST | 3 | 1 | 3 | expansion-yaksu-ocr-recheck-board |
| analysis/expansion-zone-intake-seed-board.json | 2026-06-24 KST |  | 5 | 3 | expansion-zone-intake-seed-board |
| analysis/expansion-zone-latest-check-guide.json | 2026-06-24 KST |  | 7 | 3 | expansion-zone-latest-check-guide |
| analysis/expansion-zone-monitoring-checklist.json | 2026-06-24 KST |  | 4 | 3 | expansion-zone-monitoring-checklist |
| analysis/expansion-zone-weekly-monitoring-cockpit.json | 2026-06-24 KST | 2 | 4 | 3 | expansion-zone-weekly-monitoring-cockpit |
| analysis/fieldwork-observation-notebook.json | 2026-06-24 KST | 30 | 2 | 5 | fieldwork-observation-notebook |
| analysis/fixed-date-hardcode-audit.json | 2026-06-24 KST | 12 | 4 | 3 | fixed-date-hardcode-audit |
| analysis/focus-area-comparison-brief.json | 2026-06-24 KST | 3 | 7 | 3 | focus-area-comparison-brief |
| analysis/focus-area-decision-memo.json | 2026-06-24 KST | 12 | 6 | 3 | focus-area-decision-memo |
| analysis/focus-area-evidence-risk-heatmap.json | 2026-06-24 KST | 30 | 6 | 3 | focus-area-evidence-risk-heatmap |
| analysis/focus-deep-dive-queue.json | 2026-06-24 KST | 30 | 7 | 3 | focus-deep-dive-queue |
| analysis/focus-project-fieldwork-cockpit.json | 2026-06-24 KST | 4 | 4 | 3 | focus-project-fieldwork-cockpit |
| analysis/focus-project-monitoring-board.json | 2026-06-24 KST | 4 | 2 | 3 | focus-project-monitoring-board |
| analysis/focus-project-pair-comparison-board.json | 2026-06-24 KST |  | 2 | 5 | focus-project-pair-comparison-board |
| analysis/focus-project-weekly-monitoring-cockpit.json | 2026-06-24 KST | 4 | 4 | 3 | focus-project-weekly-monitoring-cockpit |
| analysis/high-blocking-contact-channel-registry.json | 2026-06-24 KST | 9 | 0 | 0 | high-blocking-contact-channel-registry |
| analysis/high-blocking-filing-checklist.json | 2026-06-24 KST | 3 | 4 | 3 | high-blocking-filing-checklist |
| analysis/high-blocking-filing-tracker.json | 2026-06-24 KST | 3 | 3 | 3 | high-blocking-filing-tracker |
| analysis/high-blocking-followup-history.json | 2026-06-24 KST |  | 3 | 3 | high-blocking-followup-history |
| analysis/high-blocking-info-disclosure-packet.json | 2026-06-24 KST | 3 | 4 | 0 | high-blocking-info-disclosure-packet |
| analysis/high-blocking-intake-validation.json | 2026-06-24 KST |  | 3 | 3 | high-blocking-intake-validation |
| analysis/high-blocking-next-check-command-audit.json | 2026-06-24 KST | 3 | 2 | 3 | high-blocking-next-check-command-audit |
| analysis/high-blocking-next-check-session-packet.json | 2026-06-24 KST | 3 | 5 | 3 | high-blocking-next-check-session-packet |
| analysis/high-blocking-official-search-rerun.json | 2026-06-24 KST | 3 | 4 | 3 | high-blocking-official-search-rerun |
| analysis/high-blocking-public-summary-boundary.json | 2026-06-24 KST | 21 | 0 | 0 | high-blocking-public-summary-boundary |
| analysis/high-blocking-public-web-probe.json | 2026-06-24 KST | 5 | 0 | 0 | high-blocking-public-web-probe |
| analysis/high-blocking-response-decision-drafts.json | 2026-06-24 KST | 3 | 0 | 2 | high-blocking-response-decision-drafts |
| analysis/high-blocking-response-followup-cockpit.json | 2026-06-24 KST | 3 | 6 | 3 | high-blocking-response-followup-cockpit |
| analysis/high-blocking-response-intake-guide.json | 2026-06-24 KST | 3 | 3 | 3 | high-blocking-response-intake-guide |
| analysis/high-blocking-response-workflow-run.json | 2026-06-24 KST |  | 0 | 2 | high-blocking-response-workflow-run |
| analysis/high-blocking-source-escalation-packet.json | 2026-06-24 KST |  | 0 | 3 | high-blocking-source-escalation-packet |
| analysis/high-blocking-submission-approval-board.json | 2026-06-24 KST |  | 4 | 3 | high-blocking-submission-approval-board |
| analysis/life-area-extended-comparison-board.json | 2026-06-24 KST | 5 | 9 | 3 | life-area-extended-comparison-board-refresh |
| analysis/life-area-market-baseline-board.json | 2026-06-24 KST | 5 | 4 | 3 |  |
| analysis/life-area-market-reaction-brief.json | 2026-06-24 KST |  | 8 | 3 |  |
| analysis/life-area-monitoring-board.json | 2026-06-24 KST | 3 | 8 | 3 | life-area-monitoring-board |
| analysis/market-api-readiness-audit.json | 2026-06-24 KST | 3 | 0 | 0 | market-api-readiness-audit |
| analysis/market-manual-column-audit.json | 2026-06-24 KST | 70 | 0 | 0 |  |
| analysis/market-manual-download-status.json | 2026-06-24 KST | 70 | 0 | 0 | market-manual-download-status |
| analysis/market-manual-download-workbook.json | 2026-06-24 KST | 70 | 0 | 0 | market-manual-download-workbook |
| analysis/market-manual-import-readiness.json | 2026-06-24 KST | 4 | 0 | 0 | market-manual-import-readiness |
| analysis/market-manual-ingest-manifest.json | 2026-06-24 KST | 70 | 0 | 0 | market-manual-ingest-manifest |
| analysis/market-manual-normalization-audit.json | 2026-06-24 KST |  | 0 | 0 |  |
| analysis/market-transaction-signal-summary.json | 2026-06-24 KST | 30 | 0 | 0 |  |
| analysis/official-change-detection-board.json | 2026-06-24 KST | 14 | 6 | 3 | official-change-detection-board |
| analysis/official-context-impact-board.json | 2026-06-24 KST | 52 | 4 | 3 | official-context-impact-board |
| analysis/official-context-search-queue.json | 2026-06-24 KST | 34 | 4 | 3 | official-context-search-queue |
| analysis/official-context-search-results-board.json | 2026-06-24 KST | 10 | 2 | 5 | official-context-search-results-board |
| analysis/official-refresh-summary.json | 2026-06-24T13:12:48.920Z |  | 0 | 0 | official-refresh-summary |
| analysis/official-source-activation-checklist.json | 2026-06-24 KST | 9 | 4 | 5 | official-source-activation-checklist |
| analysis/official-source-activation-validation.json | 2026-06-24 KST | 9 | 2 | 3 | official-source-activation-validation |
| analysis/official-source-freshness-ledger.json | 2026-06-24 KST | 14 | 3 | 3 | official-source-freshness-ledger |
| analysis/official-update-intake-board.json | 2026-06-24 KST | 16 | 6 | 5 | official-update-intake-board |
| analysis/official-update-runbook-checklist.json | 2026-06-24 KST |  | 0 | 0 | official-update-runbook-checklist |
| analysis/official-update-scenario-playbook.json | 2026-06-24 KST | 14 | 5 | 3 | official-update-scenario-playbook |
| analysis/official-update-source-verification-bridge.json | 2026-06-24 KST |  | 4 | 3 | official-update-source-verification-bridge |
| analysis/official-web-query-registry.json | 2026-06-24 KST | 12 | 6 | 3 | official-web-query-registry |
| analysis/personal-research-home.json | 2026-06-24 KST |  | 45 | 3 | personal-research-home |
| analysis/project-due-diligence-board.json | 2026-06-24 KST | 30 | 6 | 3 | project-due-diligence-board |
| analysis/project-evidence-binder.json | 2026-06-24 KST | 30 | 7 | 3 | project-evidence-binder |
| analysis/public-development-catalyst-map.json | 2026-06-24 KST | 36 | 5 | 3 | public-development-catalyst-map |
| analysis/representative-lot-fallback-api-probe.json | 2026-06-24 KST | 6 | 2 | 3 | representative-lot-fallback-api-probe |
| analysis/representative-lot-fallback-apply-audit.json | 2026-06-24 KST |  | 3 | 3 | representative-lot-fallback-apply-audit |
| analysis/representative-lot-fallback-command-packet.json | 2026-06-24 KST | 6 | 2 | 3 | representative-lot-fallback-command-packet |
| analysis/representative-lot-fallback-edge-session-packet.json | 2026-06-24 KST |  | 2 | 3 | representative-lot-fallback-edge-session-packet |
| analysis/representative-lot-fallback-finding-board.json | 2026-06-24 KST |  | 3 | 5 | representative-lot-fallback-finding-board |
| analysis/representative-lot-fallback-identifier-closure-workbook.json | 2026-06-24 KST |  | 0 | 0 | representative-lot-fallback-identifier-closure-workbook |
| analysis/representative-lot-fallback-workbook.json | 2026-06-24 KST |  | 0 | 0 | representative-lot-fallback-workbook |
| analysis/research-artifact-dependency-map.json | 2026-06-24 KST |  | 2 | 3 | research-artifact-dependency-map |
| analysis/research-completion-cockpit.json | 2026-06-24 KST | 6 | 14 | 0 | research-completion-cockpit |
| analysis/research-goal-completion-audit.json | 2026-06-24 KST | 11 | 6 | 3 | research-goal-completion-audit |
| analysis/research-hypothesis-ledger.json | 2026-06-24 KST | 30 | 5 | 3 | research-hypothesis-ledger |
| analysis/research-manual-web-session-packet.json | 2026-06-24 KST |  | 6 | 3 | research-manual-web-session-packet |
| analysis/research-now-action-board.json | 2026-06-24 KST | 5 | 9 | 3 | research-now-action-board |
| analysis/research-session-playbook.json | 2026-06-24 KST | 11 | 9 | 3 | research-session-playbook |
| analysis/research-system-readiness-audit.json | 2026-06-24 KST | 11 | 0 | 0 | research-system-readiness-audit |
| analysis/residual-gap-interpretation-audit.json | 2026-06-24 KST | 336 | 0 | 0 | residual-gap-interpretation-audit |
| analysis/s1-cost-infrastructure-workbook.json | 2026-06-24 KST | 17 | 0 | 0 | s1-cost-infrastructure-workbook |
| analysis/s1-evidence-review-board.json | 2026-06-24 KST | 48 | 0 | 0 | s1-evidence-review-board |
| analysis/s1-original-evidence-candidates.json | 2026-06-24 KST | 137 | 0 | 0 | s1-original-evidence-candidates |
| analysis/s1-public-item-fact-check-memos.json | 2026-06-24 | 5 | 0 | 0 |  |
| analysis/s2-source-link-closure-workbook.json | 2026-06-24 KST | 6 | 0 | 0 | s2-source-link-closure-workbook |
| analysis/s3-ocr-image-verification-workbook.json | 2026-06-24 KST | 6 | 0 | 0 | s3-ocr-image-verification-workbook |
| analysis/s4-stage-conflict-resolution-workbook.json | 2026-06-24 KST | 2 | 0 | 0 | s4-stage-conflict-resolution-workbook |
| analysis/s5-core-gap-fill-workbook.json | 2026-06-24 KST | 14 | 0 | 0 | s5-core-gap-fill-workbook |
| analysis/source-verification-action-queue.json | 2026-06-24 KST |  | 0 | 0 | source-verification-action-queue |
| analysis/source-verification-closure-ledger.json | 2026-06-24 KST | 253 | 0 | 0 | source-verification-closure-ledger |
| analysis/source-verification-decision-context-audit.json | 2026-06-24 KST |  | 2 | 3 | source-verification-decision-context-audit |
| analysis/source-verification-sprint-plan.json | 2026-06-24 KST |  | 0 | 0 | source-verification-sprint-plan-refresh |
| analysis/strategic-research-brief.json | 2026-06-24 KST | 3 | 0 | 0 | strategic-research-brief |
| analysis/update-impact-ledger.json | 2026-06-24 KST | 30 | 5 | 3 | update-impact-ledger |
| analysis/weekly-monitoring-comparison-board.json | 2026-06-24 KST | 4 | 4 | 3 | weekly-monitoring-comparison-board |
| analysis/weekly-monitoring-history.json | 2026-06-24 KST | 2 | 2 | 3 | weekly-monitoring-history |

## 내부 입력 Edge 샘플

| From | To | Input |
| --- | --- | --- |
| analysis/public-development-catalyst-map.json | analysis/catalyst-trigger-matrix.json | analysis/public-development-catalyst-map.json |
| analysis/research-hypothesis-ledger.json | analysis/catalyst-trigger-matrix.json | analysis/research-hypothesis-ledger.json |
| analysis/update-impact-ledger.json | analysis/catalyst-trigger-matrix.json | analysis/update-impact-ledger.json |
| analysis/project-evidence-binder.json | analysis/catalyst-trigger-matrix.json | analysis/project-evidence-binder.json |
| analysis/expansion-urban-notice-review-board.json | analysis/core-expansion-research-spine.json | analysis/expansion-urban-notice-review-board.json |
| analysis/focus-project-weekly-monitoring-cockpit.json | analysis/current-research-operating-guide.json | analysis/focus-project-weekly-monitoring-cockpit.json |
| analysis/expansion-zone-weekly-monitoring-cockpit.json | analysis/current-research-operating-guide.json | analysis/expansion-zone-weekly-monitoring-cockpit.json |
| analysis/expansion-official-latest-check-audit.json | analysis/current-research-operating-guide.json | analysis/expansion-official-latest-check-audit.json |
| analysis/life-area-monitoring-board.json | analysis/current-research-operating-guide.json | analysis/life-area-monitoring-board.json |
| analysis/research-goal-completion-audit.json | analysis/current-research-operating-guide.json | analysis/research-goal-completion-audit.json |
| analysis/expansion-urban-notice-collection-queue.json | analysis/expansion-gangdong-stage-watch-board.json | analysis/expansion-urban-notice-collection-queue.json |
| analysis/expansion-urban-notice-review-board.json | analysis/expansion-gangdong-stage-watch-board.json | analysis/expansion-urban-notice-review-board.json |
| analysis/expansion-market-first-download-packet.json | analysis/expansion-market-download-session-packet.json | analysis/expansion-market-first-download-packet.json |
| analysis/expansion-market-download-status.json | analysis/expansion-market-download-session-packet.json | data/market/manual-import/expansion-download-intake.json |
| analysis/expansion-market-first-download-packet.json | analysis/expansion-market-download-status.json | analysis/expansion-market-first-download-packet.json |
| analysis/expansion-market-download-status.json | analysis/expansion-market-download-status.json | data/market/manual-import/expansion-download-intake.json |
| analysis/expansion-market-scope-workbook.json | analysis/expansion-market-first-download-packet.json | analysis/expansion-market-scope-workbook.json |
| analysis/expansion-market-scope-workbook.json | analysis/expansion-market-normalized-summary.json | data/market/expansion-market-areas.json |
| analysis/expansion-market-first-download-packet.json | analysis/expansion-market-quickstart-packet.json | analysis/expansion-market-first-download-packet.json |
| analysis/expansion-market-download-status.json | analysis/expansion-market-quickstart-packet.json | analysis/expansion-market-download-status.json |
| analysis/expansion-market-scope-workbook.json | analysis/expansion-market-signal-summary.json | data/market/expansion-market-areas.json |
| analysis/expansion-urban-notice-collection-queue.json | analysis/expansion-urban-notice-review-board.json | analysis/expansion-urban-notice-collection-queue.json |
| analysis/expansion-gangdong-stage-watch-board.json | analysis/expansion-zone-intake-seed-board.json | analysis/expansion-gangdong-stage-watch-board.json |
| analysis/expansion-yaksu-ocr-recheck-board.json | analysis/expansion-zone-intake-seed-board.json | analysis/expansion-yaksu-ocr-recheck-board.json |
| analysis/expansion-gangdong-stage-watch-board.json | analysis/expansion-zone-latest-check-guide.json | analysis/expansion-gangdong-stage-watch-board.json |
| analysis/expansion-yaksu-ocr-recheck-board.json | analysis/expansion-zone-latest-check-guide.json | analysis/expansion-yaksu-ocr-recheck-board.json |
| analysis/expansion-official-latest-check-audit.json | analysis/expansion-zone-latest-check-guide.json | analysis/expansion-official-latest-check-audit.json |
| analysis/life-area-monitoring-board.json | analysis/expansion-zone-latest-check-guide.json | analysis/life-area-monitoring-board.json |
| analysis/expansion-zone-latest-check-guide.json | analysis/expansion-zone-monitoring-checklist.json | analysis/expansion-zone-latest-check-guide.json |
| analysis/life-area-monitoring-board.json | analysis/expansion-zone-monitoring-checklist.json | analysis/life-area-monitoring-board.json |
| analysis/expansion-zone-latest-check-guide.json | analysis/expansion-zone-weekly-monitoring-cockpit.json | analysis/expansion-zone-latest-check-guide.json |
| analysis/expansion-zone-monitoring-checklist.json | analysis/expansion-zone-weekly-monitoring-cockpit.json | analysis/expansion-zone-monitoring-checklist.json |
| analysis/life-area-monitoring-board.json | analysis/expansion-zone-weekly-monitoring-cockpit.json | analysis/life-area-monitoring-board.json |
| analysis/current-research-operating-guide.json | analysis/fixed-date-hardcode-audit.json | analysis/current-research-operating-guide.md |
| analysis/personal-research-home.json | analysis/fixed-date-hardcode-audit.json | analysis/personal-research-home.md |
| analysis/research-hypothesis-ledger.json | analysis/focus-area-comparison-brief.json | analysis/research-hypothesis-ledger.json |
| analysis/official-source-freshness-ledger.json | analysis/focus-area-comparison-brief.json | analysis/official-source-freshness-ledger.json |
| analysis/focus-area-comparison-brief.json | analysis/focus-area-decision-memo.json | analysis/focus-area-comparison-brief.json |
| analysis/research-hypothesis-ledger.json | analysis/focus-area-decision-memo.json | analysis/research-hypothesis-ledger.json |
| analysis/project-due-diligence-board.json | analysis/focus-area-decision-memo.json | analysis/project-due-diligence-board.json |
| analysis/official-change-detection-board.json | analysis/focus-area-decision-memo.json | analysis/official-change-detection-board.json |
| analysis/project-due-diligence-board.json | analysis/focus-area-evidence-risk-heatmap.json | analysis/project-due-diligence-board.json |
| analysis/research-hypothesis-ledger.json | analysis/focus-area-evidence-risk-heatmap.json | analysis/research-hypothesis-ledger.json |
| analysis/public-development-catalyst-map.json | analysis/focus-deep-dive-queue.json | analysis/public-development-catalyst-map.json |
| analysis/autonomous-mobility-scenario.json | analysis/focus-deep-dive-queue.json | analysis/autonomous-mobility-scenario.json |
| analysis/focus-project-monitoring-board.json | analysis/focus-project-fieldwork-cockpit.json | analysis/focus-project-monitoring-board.json |
| analysis/fieldwork-observation-notebook.json | analysis/focus-project-fieldwork-cockpit.json | analysis/fieldwork-observation-notebook.json |
| analysis/focus-project-monitoring-board.json | analysis/focus-project-weekly-monitoring-cockpit.json | analysis/focus-project-monitoring-board.json |
| analysis/high-blocking-filing-tracker.json | analysis/focus-project-weekly-monitoring-cockpit.json | analysis/high-blocking-filing-tracker.json |
| analysis/high-blocking-filing-tracker.json | analysis/high-blocking-filing-checklist.json | analysis/high-blocking-filing-tracker.json |
| analysis/high-blocking-intake-validation.json | analysis/high-blocking-filing-checklist.json | analysis/high-blocking-intake-validation.json |
| analysis/high-blocking-response-decision-drafts.json | analysis/high-blocking-filing-tracker.json | analysis/high-blocking-response-decision-drafts.json |
| analysis/high-blocking-filing-tracker.json | analysis/high-blocking-followup-history.json | analysis/high-blocking-filing-tracker.json |
| analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-followup-history.json | analysis/high-blocking-next-check-session-packet.json |
| analysis/high-blocking-source-escalation-packet.json | analysis/high-blocking-info-disclosure-packet.json | analysis/high-blocking-source-escalation-packet.json |
| analysis/high-blocking-official-search-rerun.json | analysis/high-blocking-info-disclosure-packet.json | analysis/high-blocking-official-search-rerun.json |
| analysis/high-blocking-response-decision-drafts.json | analysis/high-blocking-intake-validation.json | analysis/high-blocking-response-decision-drafts.json |
| analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-next-check-command-audit.json | analysis/high-blocking-next-check-session-packet.json |
| analysis/high-blocking-filing-tracker.json | analysis/high-blocking-next-check-command-audit.json | analysis/high-blocking-filing-tracker.json |
| analysis/high-blocking-filing-tracker.json | analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-filing-tracker.json |
| analysis/high-blocking-filing-checklist.json | analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-filing-checklist.json |
| analysis/high-blocking-response-intake-guide.json | analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-response-intake-guide.json |
| analysis/high-blocking-response-followup-cockpit.json | analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-response-followup-cockpit.json |
| analysis/high-blocking-response-workflow-run.json | analysis/high-blocking-next-check-session-packet.json | analysis/high-blocking-response-workflow-run.json |
| analysis/high-blocking-filing-tracker.json | analysis/high-blocking-response-followup-cockpit.json | analysis/high-blocking-filing-tracker.json |
| analysis/high-blocking-filing-checklist.json | analysis/high-blocking-response-followup-cockpit.json | analysis/high-blocking-filing-checklist.json |
| analysis/high-blocking-response-intake-guide.json | analysis/high-blocking-response-followup-cockpit.json | analysis/high-blocking-response-intake-guide.json |
| analysis/high-blocking-response-decision-drafts.json | analysis/high-blocking-response-followup-cockpit.json | analysis/high-blocking-response-decision-drafts.json |
| analysis/high-blocking-response-workflow-run.json | analysis/high-blocking-response-followup-cockpit.json | analysis/high-blocking-response-workflow-run.json |
| analysis/high-blocking-intake-validation.json | analysis/high-blocking-response-intake-guide.json | analysis/high-blocking-intake-validation.json |
| analysis/high-blocking-filing-checklist.json | analysis/high-blocking-submission-approval-board.json | analysis/high-blocking-filing-checklist.json |
| analysis/high-blocking-official-search-rerun.json | analysis/high-blocking-submission-approval-board.json | analysis/high-blocking-official-search-rerun.json |
| analysis/focus-area-comparison-brief.json | analysis/life-area-extended-comparison-board.json | analysis/focus-area-comparison-brief.json |
| analysis/focus-area-decision-memo.json | analysis/life-area-extended-comparison-board.json | analysis/focus-area-decision-memo.json |
| analysis/focus-area-evidence-risk-heatmap.json | analysis/life-area-extended-comparison-board.json | analysis/focus-area-evidence-risk-heatmap.json |
| analysis/core-expansion-research-spine.json | analysis/life-area-extended-comparison-board.json | analysis/core-expansion-research-spine.json |
| analysis/life-area-monitoring-board.json | analysis/life-area-extended-comparison-board.json | analysis/life-area-monitoring-board.json |
| analysis/life-area-extended-comparison-board.json | analysis/life-area-market-baseline-board.json | analysis/life-area-extended-comparison-board.json |
| analysis/expansion-market-signal-summary.json | analysis/life-area-market-baseline-board.json | analysis/expansion-market-signal-summary.json |
| analysis/focus-area-comparison-brief.json | analysis/life-area-market-reaction-brief.json | analysis/focus-area-comparison-brief.json |

## 운영 원칙

- 새 생성 스크립트는 가능하면 JSON summary에 `inputs`와 `outputs`를 넣는다.
- 입력 파일을 바꾸면 이 맵에서 downstream 산출물을 확인한 뒤 전체 재생성을 실행한다.
- 이 맵은 재생성 체계를 설명하는 보조 산출물이며, 공식 원문 값 자체를 확정하지 않는다.
