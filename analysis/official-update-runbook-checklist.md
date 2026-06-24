# 공식 업데이트 런북 체크리스트

작성 기준: 2026-06-24 KST

이 문서는 `analysis/official-update-runbook.json`을 실행 가능한 드라이런 체크리스트로 펼친 것이다. 원격 웹사이트 호출이나 API 호출은 여기서 실행하지 않고, 원격/로컬/키 필요 단계를 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 선택 런북 | 11 |
| 체크리스트 단계 | 58 |
| 상태 분포 | local_ready 33; network_required 21; manual 3; api_key_required 1 |
| 단계 분포 | followup_local 23; remote_collection 22; local_processing 13 |
| YYYYMM 치환 | 미지정 |

## 선택 런북

| 런북 | 주기 | 원격 | 트리거 | 먼저 읽을 산출물 |
| --- | --- | --- | --- | --- |
| weekly_primary_refresh | weekly | Y | 정기 점검일 또는 관심구 고시/공고 알림 수신 | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md |
| expansion_interest_zone_bootstrap | weekly | Y | 강동권·약수동 주변을 확장 관심권으로 운영 체계에 붙일 때 | analysis/expansion-interest-zone-brief.md; analysis/expansion-interest-zone-candidate-brief.md; analysis/official-source-activation-checklist.md; analysis/official-change-detection-board.md; analysis/official-update-intake-board.md |
| expansion_zone_latest_check | weekly | Y | 강동권·약수동 주변 확장 관심권의 최신 단계/직접 hit를 정기 재확인할 때 | analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/life-area-monitoring-board.md |
| recordcode_bottleneck_probe | ad_hoc | Y | research-status-dashboard 또는 recordcode-dead-end-audit에서 P0 recordCode/고시 병목 확인 | analysis/recordcode-dead-end-audit.md; analysis/source-link-official-probe.md; analysis/map-missing-business-layer-review.md |
| high_blocking_public_web_probe | ad_hoc | Y | high-blocking-source-escalation-packet의 3개 사업장 외부 문의 전후 공개화면 재확인 | analysis/high-blocking-public-web-probe.md; analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-public-summary-boundary.md; analysis/high-blocking-source-escalation-packet.md |
| high_blocking_filing_submission | ad_hoc | N | 사용자 승인 후 high blocking 3건을 실제 담당부서 문의 또는 정보공개청구로 접수할 때 | analysis/high-blocking-submission-approval-board.md; analysis/high-blocking-filing-checklist.md; data/review/high-blocking-filing-outbox/README.md; analysis/high-blocking-filing-tracker.md |
| high_blocking_contact_escalation | ad_hoc | N | high-blocking-public-web-probe에서 외부 확인 필요가 남거나 담당부서/정보몽땅 회신을 받은 경우 | analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-source-escalation-packet.md; analysis/high-blocking-response-intake-guide.md; analysis/high-blocking-response-decision-drafts.md; analysis/research-system-readiness-audit.md |
| text_extraction_and_hwp_qa | after_new_files | N | 새 PDF/HWP/HWPX 원문 또는 첨부 파일 확보 | analysis/source-text-extraction-audit.md; analysis/hwp-conversion-audit.md; analysis/core-value-confirmation-ledger.md |
| ocr_value_resolution | after_text_audit | N | source-text-extraction-audit 또는 core ledger에서 OCR 숫자/부분확정 항목 확인 | analysis/ocr-source-verification-packet.md; analysis/ocr-source-review-triage.md; analysis/ocr-image-review-decisions.md; analysis/source-value-update-candidates.md |
| monthly_market_data_refresh | monthly | Y | 실거래 최신월 공표 또는 API 키 연결 완료 | data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md |
| monthly_context_scan | monthly | Y | 서울시 도시계획·교통 정책 발표, 심의 이슈, 대형 사업 보도자료 | analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md |

## 실행 체크리스트

| 런북 | 단계 | 순서 | 상태 | 원격 | 명령 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| weekly_primary_refresh | remote_collection | 1 | network_required | Y | node scripts/fetch-cleanup-projects.mjs | 원격 호출 |
| weekly_primary_refresh | remote_collection | 2 | network_required | Y | node scripts/fetch-project-summaries.mjs | 원격 호출 |
| weekly_primary_refresh | remote_collection | 3 | network_required | Y | node scripts/fetch-cafe-menu-links.mjs | 원격 호출 |
| weekly_primary_refresh | remote_collection | 4 | network_required | Y | node scripts/fetch-cleanup-board-latest.mjs | 원격 호출 |
| weekly_primary_refresh | remote_collection | 5 | network_required | Y | node scripts/fetch-urban-map-details.mjs | 원격 호출 |
| weekly_primary_refresh | remote_collection | 6 | network_required | Y | node scripts/fetch-urban-notice-details.mjs --download | 원격 호출; 첨부 다운로드 가능 |
| weekly_primary_refresh | remote_collection | 7 | network_required | Y | node scripts/probe-gangnam-songpa-notices.mjs --download | 원격 호출; 첨부 다운로드 가능 |
| weekly_primary_refresh | followup_local | 8 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| expansion_interest_zone_bootstrap | remote_collection | 1 | network_required | Y | 수동 검색: 강동구 고시공고, 중구 고시공고, 서울도시공간포털 알림서비스 신청 범위 검토 | 원격 호출; 수동 확인 |
| expansion_interest_zone_bootstrap | remote_collection | 2 | network_required | Y | 결과를 data/review/official-source-activation-intake.json 또는 data/review/official-update-intake.json에 기록 | 원격 호출 |
| expansion_interest_zone_bootstrap | followup_local | 3 | local_ready | N | node scripts/generate-official-source-activation-checklist.mjs |  |
| expansion_interest_zone_bootstrap | followup_local | 4 | local_ready | N | node scripts/generate-official-source-activation-validation.mjs |  |
| expansion_interest_zone_bootstrap | followup_local | 5 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| expansion_zone_latest_check | remote_collection | 1 | network_required | Y | 수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅 사업장검색/공개자료, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 | 원격 호출; 수동 확인 |
| expansion_zone_latest_check | remote_collection | 2 | network_required | Y | 결과를 data/review/official-update-intake.json 또는 data/review/official-source-activation-intake.json에 기록 | 원격 호출 |
| expansion_zone_latest_check | followup_local | 3 | local_ready | N | node scripts/generate-expansion-zone-monitoring-checklist.mjs |  |
| expansion_zone_latest_check | followup_local | 4 | local_ready | N | node scripts/generate-expansion-zone-intake-seed-board.mjs |  |
| expansion_zone_latest_check | followup_local | 5 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| recordcode_bottleneck_probe | remote_collection | 1 | network_required | Y | node scripts/fetch-representative-lot-map-candidates.mjs | 원격 호출 |
| recordcode_bottleneck_probe | remote_collection | 2 | network_required | Y | node scripts/fetch-map-missing-business-layer-details.mjs | 원격 호출 |
| recordcode_bottleneck_probe | remote_collection | 3 | network_required | Y | node scripts/fetch-business-layer-notice-candidates.mjs | 원격 호출 |
| recordcode_bottleneck_probe | remote_collection | 4 | network_required | Y | node scripts/fetch-gwangjin-gu-notice-candidates.mjs | 원격 호출 |
| recordcode_bottleneck_probe | remote_collection | 5 | network_required | Y | node scripts/probe-gangnam-songpa-notices.mjs --download | 원격 호출; 첨부 다운로드 가능 |
| recordcode_bottleneck_probe | remote_collection | 6 | network_required | Y | node scripts/probe-source-link-officials.mjs | 원격 호출 |
| recordcode_bottleneck_probe | followup_local | 7 | local_ready | N | node scripts/generate-map-missing-business-layer-review.mjs |  |
| recordcode_bottleneck_probe | followup_local | 8 | local_ready | N | node scripts/generate-recordcode-dead-end-audit.mjs |  |
| recordcode_bottleneck_probe | followup_local | 9 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| high_blocking_public_web_probe | remote_collection | 1 | network_required | Y | node scripts/fetch-high-blocking-public-web-probe.mjs | 원격 호출 |
| high_blocking_public_web_probe | followup_local | 2 | local_ready | N | node scripts/generate-high-blocking-public-web-probe.mjs |  |
| high_blocking_public_web_probe | followup_local | 3 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| high_blocking_filing_submission | local_processing | 1 | local_ready | N | 수동 승인 확인: analysis/high-blocking-submission-approval-board.md |  |
| high_blocking_filing_submission | local_processing | 2 | local_ready | N | 수동 제출: data/review/high-blocking-filing-outbox/*.txt 사용 |  |
| high_blocking_filing_submission | local_processing | 3 | local_ready | N | 접수 기록: node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write |  |
| high_blocking_filing_submission | followup_local | 4 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| high_blocking_contact_escalation | local_processing | 1 | manual | N | 수동 확인: analysis/high-blocking-contact-channel-registry.md의 우선 채널 선택 | 수동 확인 |
| high_blocking_contact_escalation | local_processing | 2 | manual | N | 수동 발송: analysis/high-blocking-source-escalation-packet.md의 사업별 문의 본문 사용 | 수동 확인 |
| high_blocking_contact_escalation | local_processing | 3 | local_ready | N | 회신 기록: node scripts/record-high-blocking-response.mjs --rank=NN --status=... --received-at=YYYY-MM-DD --responder='담당부서' --write |  |
| high_blocking_contact_escalation | followup_local | 4 | local_ready | N | node scripts/generate-high-blocking-response-decision-drafts.mjs |  |
| high_blocking_contact_escalation | followup_local | 5 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| text_extraction_and_hwp_qa | local_processing | 1 | local_ready | N | /Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_urban_notice_text.py |  |
| text_extraction_and_hwp_qa | local_processing | 2 | local_ready | N | node scripts/generate-source-text-extraction-audit.mjs |  |
| text_extraction_and_hwp_qa | local_processing | 3 | local_ready | N | node scripts/generate-hwp-conversion-audit.mjs |  |
| text_extraction_and_hwp_qa | followup_local | 4 | local_ready | N | node scripts/generate-source-value-verification-queue.mjs |  |
| text_extraction_and_hwp_qa | followup_local | 5 | local_ready | N | node scripts/generate-core-value-confirmation-ledger.mjs |  |
| text_extraction_and_hwp_qa | followup_local | 6 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| ocr_value_resolution | local_processing | 1 | local_ready | N | node scripts/generate-ocr-source-verification-packet.mjs |  |
| ocr_value_resolution | local_processing | 2 | local_ready | N | node scripts/generate-ocr-source-review-triage.mjs |  |
| ocr_value_resolution | local_processing | 3 | local_ready | N | node scripts/generate-ocr-image-review-decisions.mjs |  |
| ocr_value_resolution | local_processing | 4 | local_ready | N | node scripts/generate-source-value-update-candidates.mjs |  |
| ocr_value_resolution | followup_local | 5 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| monthly_market_data_refresh | remote_collection | 1 | network_required | Y | node scripts/generate-market-data-matrix.mjs | 원격 호출 |
| monthly_market_data_refresh | remote_collection | 2 | network_required | Y | node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=YYYYMM | 원격 호출 |
| monthly_market_data_refresh | remote_collection | 3 | api_key_required | Y | DATA_GO_KR_SERVICE_KEY=... node scripts/fetch-market-raw-data.mjs --from=202401 --to=YYYYMM | 원격 호출; API 키 필요 |
| monthly_market_data_refresh | followup_local | 4 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |
| monthly_context_scan | remote_collection | 1 | network_required | Y | 수동 검색: 서울시 주택·도시계획 분야, 서울시 교통 분야, 서울 정보소통광장 | 원격 호출; 수동 확인 |
| monthly_context_scan | followup_local | 2 | manual | N | analysis/official-context-sources.csv 수동 갱신 | 수동 확인 |
| monthly_context_scan | followup_local | 3 | local_ready | N | node scripts/generate-transport-location-context.mjs |  |
| monthly_context_scan | followup_local | 4 | local_ready | N | node scripts/regenerate-research-artifacts.mjs | 로컬 산출물 재생성 |

## 판정 규칙

| 런북 | 먼저 읽을 산출물 | 판정 규칙 |
| --- | --- | --- |
| weekly_primary_refresh | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md | 단계 변경, 공개자료 수 증가, 새 고시번호, 새 첨부 원문이 있으면 사업별 메모와 원문 검증 큐를 먼저 갱신한다. |
| expansion_interest_zone_bootstrap | analysis/expansion-interest-zone-brief.md; analysis/expansion-interest-zone-candidate-brief.md; analysis/official-source-activation-checklist.md; analysis/official-change-detection-board.md; analysis/official-update-intake-board.md | 강동구·중구 고시공고 페이지는 라우팅 출처다. 고시번호·고시일·원문 URL·첨부명이 확인되기 전에는 사업 단계나 수치 근거로 승격하지 않는다. |
| expansion_zone_latest_check | analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/life-area-monitoring-board.md | 강동권은 값 confirmed와 최신 단계 재확인을 분리하고 gangdong_district_notice 새 row를 만든다. 약수권은 confirmed snapshot 3건을 유지하되, 신당8·신당9는 기존 seoul_urban_notice row를 재사용하고 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수역 direct hit가 생기기 전에는 adjacent 대조군으로만 읽는다. |
| recordcode_bottleneck_probe | analysis/recordcode-dead-end-audit.md; analysis/source-link-official-probe.md; analysis/map-missing-business-layer-review.md | 고신뢰 후보만 원문 후보로 승격한다. 토지구획정리·환지 등 과거 일반 구역은 현 정비사업 고시로 쓰지 않는다. |
| high_blocking_public_web_probe | analysis/high-blocking-public-web-probe.md; analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-public-summary-boundary.md; analysis/high-blocking-source-escalation-packet.md | 공식 공개화면에서 고시/공고 0건, 로그인 필요, 계 필드 공란이면 confirmed 승격하지 않고 담당부서/정보공개 확인 경로로 유지한다. |
| high_blocking_filing_submission | analysis/high-blocking-submission-approval-board.md; analysis/high-blocking-filing-checklist.md; data/review/high-blocking-filing-outbox/README.md; analysis/high-blocking-filing-tracker.md | 접수번호가 있으면 receipt로, 없으면 filing_note로 접수 흔적을 남긴 뒤 filed_waiting_response로 올린다. 회신 전에는 confirmed/partial로 승격하지 않는다. |
| high_blocking_contact_escalation | analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-source-escalation-packet.md; analysis/high-blocking-response-intake-guide.md; analysis/high-blocking-response-decision-drafts.md; analysis/research-system-readiness-audit.md | 공식 채널 URL은 라우팅 근거일 뿐 값 확정 근거가 아니다. 회신에 고시번호·고시일·원문 URL·별첨명 또는 정보공개 필요 사유가 있을 때만 intake에 기록한다. |
| text_extraction_and_hwp_qa | analysis/source-text-extraction-audit.md; analysis/hwp-conversion-audit.md; analysis/core-value-confirmation-ledger.md | 텍스트 추출이 되지 않은 파일은 OCR 또는 HWP 직접 파서 경로로 분리하고, 숫자 확정은 원문 이미지/텍스트 근거가 있을 때만 승격한다. |
| ocr_value_resolution | analysis/ocr-source-verification-packet.md; analysis/ocr-source-review-triage.md; analysis/ocr-image-review-decisions.md; analysis/source-value-update-candidates.md | OCR 값은 자동 반영하지 않고 confirmed_from_ocr_image, partial_confirmation_pending, source_value_update_recommended로 분리한다. |
| monthly_market_data_refresh | data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md | 시장 데이터는 사업 단계 판정 근거가 아니라 반응 확인용이다. 고시·인가일 전후 6개월/12개월 거래량과 가격 방향만 별도 분석한다. |
| monthly_context_scan | analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md | 보도자료와 결재문서는 context로만 두고, 고시번호·결정조서·도면 원문을 확인하기 전에는 확정 신호로 승격하지 않는다. |

## 사용 예

```bash
node scripts/generate-official-update-runbook-checklist.mjs --cadence=weekly
node scripts/generate-official-update-runbook-checklist.mjs --runbook=monthly_market_data_refresh --to=202606
```
