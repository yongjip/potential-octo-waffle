# 리서치 체계 준비도 감사

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실/송파·구의/광진 핵심 생활권과 강동권·약수동 주변 확장 관심권을 포함한 재개발·재건축 리서치 goal을 요구사항 단위로 감사한 결과다. 기존 분석 산출물이 무엇을 충족하는지, 그리고 무엇 때문에 아직 goal을 완료로 보지 말아야 하는지 분리한다.

## 요약

| 항목 | 값 |
| --- | --- |
| 감사 요구사항 | 11개 |
| 사용 가능 계열 | 9개 |
| 완료 보류 계열 | 2개 |
| P0 병목 | 2개 |
| P1 병목 | 0개 |
| 상태 분포 | ready 5; active_verification_needed 2; operator_ready 2; ready_with_uncertainty_flags 1; substantially_ready 1 |

## 요구사항별 감사

| ID | 요구사항 | 준비도 | 현재 증거 | 남은 공백 | 다음 행동 | 우선순위 |
| --- | --- | --- | --- | --- | --- | --- |
| official_source_collection | 공식 원천 수집 기반 | 대체로 준비됨 | 정보몽땅 강남·송파·광진 125건, 우선검토 30건, 생활권 분포 강남 10; 구의/광진 10; 잠실/송파 10, 공식 근거 A/B 26건 | 근거 C/D 4건과 recordCode/고시 원문 연결 병목은 남아 있음 | C/D 근거 사업장을 source-link-repair 계열 산출물로 먼저 보정 | P0 |
| source_text_and_hwp_pipeline | PDF/HWP/HWPX 원문 텍스트화 | 준비됨 | 원문 텍스트 60/60건, 텍스트 상태 extracted 47; ocr_extracted 12; hwp_ocr_extracted 1, HWP/HWPX 9/9건, HWP 상태 extracted 8; hwp_ocr_extracted 1, soffice 필요 0건 | OCR 이미지 확인/짧은 본문 검토 큐: P3_text_layer 39; P1_ocr_verify 10; P2_short_form 5; P2_hwp_direct_check 3; P3_ocr_rechecked 3; HWP 검토 큐: native_text_ready 5; short_text_review 3; ocr_image_review 1 | OCR 기반 수치는 이미지 판독 로그로 확정하고, HWP 변환은 현재 자체 추출 경로를 유지 | P1 |
| project_comparison_surface | 사업장 비교 표면 | 준비됨 | 우선검토 30건, 사업별 메모 30건, 리서치 상태 30건, 현재 readiness watch 16; ready_for_periodic_monitoring 14 | 비교 표는 준비됐지만, 값 확정성이 낮은 필드는 핵심 수치 장부 상태를 같이 봐야 함 | project-comparison-matrix에서 후보를 고른 뒤 project-notes와 core-value-confirmation-ledger를 같이 확인 | P1 |
| expansion_interest_zone_comparison | 확장 관심권 비교·모니터링 | 체크리스트 운영 준비됨 | 확장 비교 spine 15행(core 5, expansion 10, zone 2), 생활권 확장 비교 5행(core 3, expansion 2), 확장 주간 cockpit zone 2개·due 2개·latest stage gap 0개, 모니터링 보드 확장권 2개·값 confirmed 1개 | 강동권은 latest stage gap 0개로 최신 단계 재확인이 아직 수동 루프에 남아 있고, 약수동 주변은 원문 비교값은 닫혔지만 direct hit 신규 탐색 자동 루프가 없다. 즉 비교 축은 운영 가능하지만, 확장권 최신 단계 승격은 공식 포털 재확인 뒤에만 허용해야 한다. | expansion-zone-weekly-monitoring-cockpit와 life-area-extended-comparison-board를 같이 열어 강동권 최신 단계 재확인, 약수권 direct hit 탐색, 비교표 반영 순서로 주간 루프를 운영 | P2 |
| source_value_verification | 핵심 수치 원문 검증 | 검증 작업 진행 필요 | 핵심 필드 420개, P0 73개, P1 80개, 실행 패킷 47개/5스프린트(P0 18, P1 29), S1 워크북 17개 사업장·공개항목 61개·원문 스니펫 75개, S1 원문 수치 후보 137개·리뷰 묶음 48개, S2 클로저 사업장 6개·필드 14개, S3 OCR 사업장 6개·필드 31개·수동판정 30개, S4 시점충돌 사업장 2개·필드 18개, S5 공란보강 사업장 14개·필드 138개, 통합 클로저 253건(open 0, 판정 confirmed 218; deferred 35, 실행 큐 0건/P0 0건, 추가 원문/검색 5, 확정 검토 155), 공식 보조근거 직접 일치 14개, 원문 URL 닫힘 0개, 상태 분포 value_missing 88; not_yet_applicable 86; structured_value_needs_manual_confirmation 78; official_stage_date_confirmed 39; snippet_candidate_needs_manual_confirmation 30; fact_check_report_available 13; ocr_partial_confirmation_pending 13 | 상태판 기준 P0 0개, P1 0개, 핵심 검토 항목 110개, 다음 액션의 원문 병목 76개. 통합 클로저 판정은 open 0건, confirmed 218건, pending 0건, conflict 0건, deferred 35건이다. 실행 큐는 0건이며 pending/conflict/open 클로저는 없음. 잔여 공란·보류 해석은 336개 필드에 대해 작성됐고, high blocking 16개, medium 44개다. high blocking 확인 패킷은 3개 사업장·21개 필드(high 16)로 준비됐다. 공식 문의 채널은 3개 사업장·9개 채널로 정리했지만, 채널 자체는 값 확정 근거가 아니며 회신 intake가 필요하다. 공식 요약값 경계표는 참고 가능 요약값 8개, 공식 출처 간 충돌/시점차 4개, 레이어 후보 보류 1개, 고시번호·고시일 필요 4개, 관리처분 별첨 필요 1개로 분리한다. 공식 웹 프로브는 5건이며, 공개화면만으로 해결되지 않아 외부 확인 필요로 재분류한 근거 3건을 남긴다. 공식 검색 재실행 감사는 3개 사업장을 다시 묶었고, 광진구청 no_candidate 2건, 서울도시공간포털 no_candidate 2건, 외부 회신 필요 3건으로 판정한다. 정보공개청구 패킷은 3개 사업장 중 0개가 담당부서 회신 불가 시 바로 접수 가능한 상태이고, 접수 tracker는 접수 필요 0건, 제출 준비 outbox는 3개 파일이다. intake 검증은 error 0건, warning 0건이다. 회신 decision 초안은 append 가능 0개, 회신 대기 3개, intake 보완 0개다. 해석 분포: usable_with_source_caveat 115; stage_not_applicable 86; source_available_extract_later 81; manual_source_escalation 21; ocr_or_precision_review 21; context_only 7; source_basis_split 5. 원문 링크 후보 직접값 매칭 14개(P0 11개), 로컬 본고시 URL 보강 1개, 사업개요 보조근거의 본고시 원문 필요 13개 | high-blocking-source-escalation-packet의 사업별 문의 패킷으로 관할 자치구/정보몽땅 확인을 진행하고, 나머지 잔여 항목은 해석 클래스에 따라 비교표 주석으로 유지 | P0 |
| transport_and_fieldwork | 교통입지·현장 답사 체계 | 준비됨 | 지하철 답사 대상 30건, route_id 8개, 액션 트랙 비용/기반시설 대조 14; 원문 확정 7; 정기 추적 6; 현장 동선 확인 2; 정책/공공개발 모니터링 1 | 현장 사진/체감 동선/혼잡도 기록은 아직 별도 실측 데이터로 쌓이지 않음 | fieldwork-route-planner의 route_question과 onsite_checks를 현장 메모로 채우기 | P2 |
| risk_and_long_term_potential | 리스크·장기 가능성 비교 | 불확실성 표시 후 사용 가능 | 장기 가설과 다음 액션 30건, immediate watch 4건, watch 분포 normal 13; high 7; periodic 6; immediate 4 | 상방 가설은 원문 확정성과 정책/교통 업데이트에 민감하므로 확신도 격차를 계속 표시해야 함 | strategic-research-brief의 top action과 reassessment-watchlist의 immediate 항목부터 재평가 | P1 |
| latest_update_monitoring | 최신 업데이트 확인 루틴 | 체크리스트 운영 준비됨 | 공식 업데이트 출처 14개, 실행 런북 11개, 체크리스트 단계 58개, 체크리스트 상태 local_ready 33; network_required 21; manual 3; api_key_required 1, 자동화 상태 manual 2; manual_expansion_latest_check 2; api_key_needed 1; implemented_for_30_candidates 1; implemented_for_geukdong_backfill 1 | 상시 자동 모니터링/구독은 아직 만들지 않았지만, 원격 호출·API 키·수동 갱신 단계는 체크리스트로 분리됨. 수동 또는 스크립트 실행 대기 출처 8개 | 주간 점검 전 official-update-runbook-checklist를 열어 network_required 단계와 followup_local 단계를 순서대로 실행하고 regenerate-research-artifacts로 로컬 산출물 갱신 | P2 |
| market_data_collection | 부동산 실거래·전월세 시장 데이터 | 준비됨 | 공식 수동 다운로드 70/70개, 정규화 거래/전월세 108161행, 사업장 매칭 277066행, R-ONE 지표 824행 | 서울 열린데이터광장 OA-21275와 국토교통부 RTMS 공식 CSV는 반입·정규화됐다. 남은 공백은 R-ONE 지역 가격지수·거래현황 0개 작업과 개별 사업장 키워드 매칭 검수다. API 키 감사는 여전히 missing_env:SEOUL_OPEN_DATA_KEY 390; missing_env:DATA_GO_KR_SERVICE_KEY 300로 남지만, 현재 1차 분석은 수동 공식 원자료 70개 파일과 정규화 거래 108161행으로 수행 가능하다. 수동 다운로드 워크북은 70개 작업(서울 열린데이터 39, 국토부 RTMS 30, R-ONE 1)이며, 작업별 상태는 file_ready_for_column_audit 70다. 반입 manifest는 70개 행, 컬럼 감사는 파싱 가능 파일 70개·매핑 준비 70개다. | analysis/market-transaction-signal-summary.md로 1차 시장 신호를 보고, R-ONE은 별도 지표 보강으로 처리한다. 개별 사업장 판단 전에는 거래 샘플의 단지명/법정동 매칭을 수동 검수한다. | P2 |
| reader_handoff_and_index | 읽기 시작점·재생성 체계 | 준비됨 | README 색인, analysis 색인, 사업별 메모 30건, 로컬 재생성 스크립트 체인 보유 | 새 원격 수집과 OCR 실행은 재생성 체인 밖의 수동 단계로 남아 있음 | 원격 수집 후에는 로컬 regenerate 명령으로 파생 산출물을 한 번에 갱신 | P2 |
| completion_boundary | goal 완료 판정 기준 | 검증 작업 진행 필요 | 리서치 체계는 운영 가능하지만, high blocking 잔여 원문 확인은 아직 남아 있음 | 현재 상태를 goal 완료로 보려면 high blocking 잔여 원문 16건에 대한 외부 회신 또는 정보공개/열람 보류 근거가 필요함. completion cockpit은 열린 작업 6개, P0 2개, P1 3개로 집계한다. | research-completion-cockpit의 P0 critical path를 처리한 뒤 이 감사표를 goal audit 체크리스트로 사용하고 blocked 항목이 사라질 때까지 완료 처리 보류 | P0 |

## 남은 병목

| 영역 | 상태 | 병목 | 처리 방법 |
| --- | --- | --- | --- |
| 핵심 수치 원문 검증 | 검증 작업 진행 필요 | 상태판 기준 P0 0개, P1 0개, 핵심 검토 항목 110개, 다음 액션의 원문 병목 76개. 통합 클로저 판정은 open 0건, confirmed 218건, pending 0건, conflict 0건, deferred 35건이다. 실행 큐는 0건이며 pending/conflict/open 클로저는 없음. 잔여 공란·보류 해석은 336개 필드에 대해 작성됐고, high blocking 16개, medium 44개다. high blocking 확인 패킷은 3개 사업장·21개 필드(high 16)로 준비됐다. 공식 문의 채널은 3개 사업장·9개 채널로 정리했지만, 채널 자체는 값 확정 근거가 아니며 회신 intake가 필요하다. 공식 요약값 경계표는 참고 가능 요약값 8개, 공식 출처 간 충돌/시점차 4개, 레이어 후보 보류 1개, 고시번호·고시일 필요 4개, 관리처분 별첨 필요 1개로 분리한다. 공식 웹 프로브는 5건이며, 공개화면만으로 해결되지 않아 외부 확인 필요로 재분류한 근거 3건을 남긴다. 공식 검색 재실행 감사는 3개 사업장을 다시 묶었고, 광진구청 no_candidate 2건, 서울도시공간포털 no_candidate 2건, 외부 회신 필요 3건으로 판정한다. 정보공개청구 패킷은 3개 사업장 중 0개가 담당부서 회신 불가 시 바로 접수 가능한 상태이고, 접수 tracker는 접수 필요 0건, 제출 준비 outbox는 3개 파일이다. intake 검증은 error 0건, warning 0건이다. 회신 decision 초안은 append 가능 0개, 회신 대기 3개, intake 보완 0개다. 해석 분포: usable_with_source_caveat 115; stage_not_applicable 86; source_available_extract_later 81; manual_source_escalation 21; ocr_or_precision_review 21; context_only 7; source_basis_split 5. 원문 링크 후보 직접값 매칭 14개(P0 11개), 로컬 본고시 URL 보강 1개, 사업개요 보조근거의 본고시 원문 필요 13개 | high-blocking-source-escalation-packet의 사업별 문의 패킷으로 관할 자치구/정보몽땅 확인을 진행하고, 나머지 잔여 항목은 해석 클래스에 따라 비교표 주석으로 유지 |
| goal 완료 판정 기준 | 검증 작업 진행 필요 | 현재 상태를 goal 완료로 보려면 high blocking 잔여 원문 16건에 대한 외부 회신 또는 정보공개/열람 보류 근거가 필요함. completion cockpit은 열린 작업 6개, P0 2개, P1 3개로 집계한다. | research-completion-cockpit의 P0 critical path를 처리한 뒤 이 감사표를 goal audit 체크리스트로 사용하고 blocked 항목이 사라질 때까지 완료 처리 보류 |

## 완료로 보지 않는 이유

- 시장 데이터는 현재 범위의 비교 체계를 직접 막지 않는다.
- 원문 검증 실행 큐는 0건이지만 핵심 수치 장부에는 공란·보류·추가 원문 검색 항목이 남아 있다. 비교표는 읽을 수 있지만 모든 수치를 확정값으로 간주하면 안 된다.
- HWP/HWPX 변환은 현재 차단 없이 처리되지만, OCR 이미지 기반 수치는 원문 이미지 판독 로그와 함께만 확정해야 한다.

## 먼저 열 파일

- `analysis/strategic-research-brief.md`: 큰 그림과 이번 액션
- `analysis/research-status-dashboard.md`: 사업장별 남은 검증 작업
- `analysis/core-value-confirmation-ledger.md`: 필드 단위 원문 확정 상태
- `analysis/residual-gap-interpretation-audit.md`: 잔여 공란·보류 필드의 비교표 사용 규칙
- `analysis/reassessment-watchlist.md`: 업데이트 발생 시 재평가할 사업장
- `analysis/official-update-runbook-checklist.md`: 주간/월간 업데이트 점검 실행 단계
- `data/market/API_KEYS.md`: 시장 데이터 API 키 준비 절차
