# 리서치 세션 플레이북

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실/송파·구의/광진 재개발·재건축 리서치를 실제 작업 세션으로 나누는 운영표다. 원격 수집이 필요한 세션은 명령과 판정 기준만 제시하며, 새 값은 공식 원문이나 회신 증거가 있을 때만 승격한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 세션 | 11 |
| 로컬 세션 | 6 |
| 원격/API/수동 검색 세션 | 5 |

| 구분 | 값 |
| --- | --- |
| 주기 | ad_hoc 3; monthly 2; anytime 1; weekly 1; weekly_or_on_signal 1; weekly_or_before_visit 1; same_day_after_fieldwork 1; on_signal 1 |
| 원격 여부 | N 6; Y/manual 3; Y 1; Y/API_or_manual 1 |

## 세션별 실행표

| 세션 | 시간 | 주기 | 트리거 | 목적 | 원격 | 먼저 열 파일 | 명령/액션 | 판정 gate | 멈출 조건 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-15M-TRIAGE | 15분 | anytime | 오늘 무엇을 열지 정할 때 | 생활권 잠정 입장과 오늘 열 사업을 확인하고 한 가지 작업만 고른다. | N | analysis/personal-research-home.md; analysis/focus-area-decision-memo.md; analysis/research-next-moves.md | node scripts/generate-research-session-playbook.mjs | 새 공식 증거가 없으면 점수나 가설을 바꾸지 않고 작업 대상을 하나만 고른다. | 첫 후보: 9. 잠실우성4차 주택재건축정비사업조합 / 현장·교통 딥다이브 |
| S-P0-FILING | 30-45분 | ad_hoc | P0 완료 병목 3건을 닫거나 정보공개 접수 준비를 할 때 | 잠실우성4차, 광장동 삼성1차, 자양번영로3나길 회신/정보공개 상태를 갱신한다. | N | analysis/high-blocking-next-check-session-packet.md; analysis/high-blocking-next-check-command-audit.md; analysis/high-blocking-followup-history.md; data/review/high-blocking-source-response-intake.README.md; analysis/high-blocking-filing-checklist.md; analysis/research-completion-cockpit.md; data/review/high-blocking-filing-outbox/README.md | 상태 재확인: node scripts/touch-high-blocking-followup.mjs --session-anchor-date=YYYY-MM-DD --checked-at=YYYY-MM-DD --write --refresh 또는 node scripts/record-high-blocking-followup-check.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=no_change --observed-note='...' --next-check-date=YYYY-MM-DD --next-check-note='...' --write -> 회신 후: node scripts/record-high-blocking-response.mjs --rank=NN --status=... --received-at=YYYY-MM-DD --responder='담당부서' --write -> node scripts/process-high-blocking-response-workflow.mjs | 회신 intake가 no_response를 벗어나고 ready_to_append 또는 정보공개/열람 보류 근거로 검증됨 | dry-run에서 intake error 0건과 ready_to_append 또는 명확한 보류 사유 확인 |
| S-WEEKLY-OFFICIAL | 45-90분 | weekly | 정기 점검일 또는 관심구 고시/공고 알림 수신 | 정보몽땅, 서울도시공간포털, 자치구 공고 변화를 수집하고 영향 사업장을 판정한다. | Y | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md; analysis/weekly-monitoring-comparison-board.md | node scripts/fetch-cleanup-projects.mjs -> node scripts/fetch-project-summaries.mjs -> node scripts/fetch-cafe-menu-links.mjs -> node scripts/fetch-cleanup-board-latest.mjs -> node scripts/fetch-urban-map-details.mjs -> node scripts/fetch-urban-notice-details.mjs --download -> node scripts/probe-gangnam-songpa-notices.mjs --download; node scripts/regenerate-research-artifacts.mjs -> node scripts/create-weekly-monitoring-log.mjs --date=YYYY-MM-DD --remote-run=Y --regenerated=Y --write --refresh | 단계 변경, 공개자료 수 증가, 새 고시번호, 새 첨부 원문이 있으면 사업별 메모와 원문 검증 큐를 먼저 갱신한다. | official-refresh-summary와 cleanup-snapshot-diff에서 단계 변경·새 고시·새 첨부 여부 확인 |
| S-EXPANSION-LATEST | 20-45분 | weekly_or_on_signal | 강동권·약수동 주변까지 같이 보거나 강동/중구 고시공고 변화가 보일 때 | 강동권 최신 단계 공백과 약수권 direct hit/adjacent baseline 변화를 분리해 기록하고 intake create/reuse를 결정한다. | Y/manual | analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md | 수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 -> node scripts/generate-expansion-zone-intake-seed-board.mjs -> node scripts/generate-official-update-intake-board.mjs | 강동권은 gangdong_district_notice 새 row를 만들고, 약수권은 신당8·신당9는 기존 seoul_urban_notice row를 재사용한다. 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수 direct hit가 없으면 jung_district_notice row는 만들지 않는다. | create seed 5건 / reuse 3건 기준으로 source_id와 update_id 재사용 여부가 정리됨 |
| S-FALLBACK-ID | 30-60분 | ad_hoc | 대표지번 fallback only 6건에서 current business presentSn를 직접 확인할 때 | recordCode 기준 현재 단계는 유지한 채 UQ120 current business 식별자와 데이터 기준일을 확인한다. | Y/manual | analysis/representative-lot-fallback-command-packet.md; analysis/representative-lot-fallback-api-probe.md; analysis/representative-lot-fallback-edge-session-packet.md; analysis/representative-lot-fallback-finding-board.md; analysis/representative-lot-fallback-apply-audit.md; analysis/representative-lot-fallback-identifier-closure-workbook.md; analysis/representative-lot-fallback-workbook.md; analysis/project-comparison-matrix.md | API 선행 확인: node scripts/fetch-representative-lot-fallback-api-probe.mjs -> node scripts/generate-representative-lot-fallback-api-probe.mjs -> unresolved면 Edge 수동 확인: recordCode popup -> 대표지번/PNU -> UQ120 후보 비교 -> node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied -> auto-mark가 닫히지 않은 confirmed_current_business만 node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh | same-stage UQ120 응답에서 presentSn, 데이터 기준일, 사업유형이 같이 보일 때만 current business 후보로 승격한다. stage-gap이면 보류를 유지한다. | 각 세션에서 최소 1건에 대해 presentSn 확정 또는 보류 사유 재확인을 남긴다. |
| S-FIELDWORK | 60-120분 | weekly_or_before_visit | 지하철 답사 전후 | 현장 동선, 환승, 한강·간선도로 단절, 실제 보행시간을 같은 형식으로 기록한다. | N | analysis/fieldwork-route-planner.md; analysis/fieldwork-observation-notebook.md; data/review/fieldwork-observations.README.md | 현장 관찰 후 node scripts/record-fieldwork-observation.mjs --rank=NN --visited-at=YYYY-MM-DD --station-exit='역명 N번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat --write --refresh 또는 수동 입력 -> node scripts/generate-fieldwork-observation-notebook.mjs | 사진/시간/동선 메모가 특정 사업장 rank와 연결될 때만 가설 확신도 변화 후보로 둔다. | 우선 루트: 역 접근, 한강/간선도로 단절, 환승/상권 혼잡이 입지 프리미엄을 실제로 뒷받침하는가. |
| S-PAIR-COMPARE | 15-30분 | same_day_after_fieldwork | 같은 날 핵심 사업 2건 이상을 걸은 직후 | 현장 관찰 2건을 생활권 판단에 쓰기 전에 같은 날 비교 메모로 구조화한다. | N | analysis/focus-project-pair-comparison-board.md; analysis/focus-project-pair-comparison-starter.md; analysis/life-area-comparison-worksheet.md | node scripts/record-focus-project-pair-comparison.mjs --pair-id=... --visited-at=YYYY-MM-DD --status=draft --fieldwork-delta='...' --judgment-shift='...' --not-closed-reason='...' --write --refresh | 같은 날 두 사업 관찰이 모두 fieldwork-observations에 있어야 하며, pair-comparison은 단계·수치 확정이 아니라 생활권 판단 보정으로만 사용한다. | 현재 ready_to_compare 0건 / recorded 0건 |
| S-NEW-UPDATE | 20-40분 | on_signal | 새 고시, 기사, 보도자료, 알림, 공고를 발견했을 때 | 새 업데이트를 공통 inbox에 넣고 source verification/context/market/high-blocking 중 어디로 보낼지 판정한다. | N | data/review/official-update-intake.README.md; analysis/official-update-intake-board.md; analysis/official-change-detection-board.md | node scripts/generate-official-update-intake-board.mjs | intake needs_fix 0건. applied는 verified_original 증거와 URL/첨부/로컬 텍스트 중 하나가 있을 때만 사용 | route와 target_file이 정해지고 source_id/rank/evidence_status 오류가 0건 |
| S-SOURCE-DEEPDIVE | 60-120분 | ad_hoc | 원문 확정 트랙 사업을 처리할 때 | 고시번호, 고시일, 원문 URL, 핵심 수치의 confirmed/pending/conflict 상태를 닫는다. | N | project-notes/23-j15171517.md; analysis/project-evidence-binder.md; analysis/representative-lot-fallback-workbook.md; analysis/representative-lot-fallback-identifier-closure-workbook.md; analysis/source-verification-closure-ledger.md | node scripts/generate-source-verification-action-queue.mjs -> node scripts/regenerate-research-artifacts.mjs | 공식 원문 텍스트나 공식 회신 근거가 없으면 pending으로 유지한다. | 우선 원문 후보: 23. 광장동 삼성1차아파트 소규모재건축정비사업 / 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode 또는 자치구 고시 원문 연결 |
| S-MONTHLY-CONTEXT | 45-90분 | monthly | 서울시 도시계획·교통 정책 발표 또는 월간 점검 | 잠실 MICE, 압구정 한강변, 동서울터미널, 교통계획 context를 고시·계획 원문과 분리해 관리한다. | Y/manual | analysis/official-context-sources.csv; analysis/public-development-catalyst-map.md; analysis/catalyst-trigger-matrix.md | 수동 검색: 서울시 주택·도시계획 분야, 서울시 교통 분야, 서울 정보소통광장 | 보도자료와 결재문서는 context로만 두고, 고시번호·결정조서·도면 원문을 확인하기 전에는 확정 신호로 승격하지 않는다. | 보도자료는 context_only로 남기고 고시·계획·교통대책 원문 연결 여부 기록 |
| S-MONTHLY-MARKET | 45-90분 | monthly | 실거래 최신월 또는 R-ONE 지표 갱신 | 시장 데이터는 사업단계 판단이 아니라 고시·인가 전후 반응 보조지표로만 갱신한다. | Y/API_or_manual | analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; analysis/market-transaction-signal-summary.md | node scripts/generate-market-data-matrix.mjs | 시장 데이터는 사업 단계 판정 근거가 아니라 반응 확인용이다. 고시·인가일 전후 6개월/12개월 거래량과 가격 방향만 별도 분석한다. | normalizedTransactions와 latest_deal_ymd가 갱신되고 사업장 비교표가 재생성됨 |

## 빠른 선택

- 15분만 있으면 `S-15M-TRIAGE`로 오늘 열 사업 하나를 고른다.
- 공식 회신이나 정보공개를 처리할 때는 `S-P0-FILING`만 실행한다.
- 새 고시·공고·보도자료를 발견하면 먼저 `S-NEW-UPDATE`에 넣고, 바로 가설을 바꾸지 않는다.
- 확장 관심권 점검은 `S-EXPANSION-LATEST`로 따로 돌리고, create/reuse 판단은 intake seed 보드 기준으로 맞춘다.
- 현장 답사 전후에는 `S-FIELDWORK`로 관찰값을 같은 스키마에 남긴다.
- 주간 점검은 `S-WEEKLY-OFFICIAL`이고, 원격 수집 뒤에는 항상 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.

## 운영 원칙

- 원격 수집 명령은 최신 확인용이다. 결과를 바로 확정값으로 쓰지 않고 원문/회신/로컬 텍스트 gate를 통과시킨다.
- 세션 하나가 끝나면 output_to_update에 적힌 파일만 갱신하고 전체 재생성으로 downstream 변화를 확인한다.
- P0 3건은 세션 플레이북의 예외가 아니라 `S-P0-FILING`으로만 닫는다.
