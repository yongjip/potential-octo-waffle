# 공식 출처 신선도 장부

작성 기준: 2026-06-24 KST

이 문서는 공식 업데이트 출처별로 현재 로컬 산출물이 존재하는지, 얼마나 최근에 갱신됐는지, 다음에 어떤 런북을 실행해야 하는지 점검한다. 원격 사이트를 직접 호출하지 않고 로컬 파일 상태와 레지스트리 기준만 사용한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 출처 | 14 |
| 로컬 분석 가능 | 5 |
| 갱신 필요 | 0 |
| 수동/API 키 필요 | 9 |
| 로컬 산출물 없음 | 0 |

## 분포

| 구분 | 값 |
| --- | --- |
| 상태 | 수동 검토 필요 6; 로컬 분석 가능 5; API 키 필요 2; 수동 알림 신청 1 |
| 등급 | primary 4; primary_backstop 4; data 3; context 2; context_backstop 1 |
| 런북 | weekly_primary_refresh 5; monthly_market_data_refresh 3; monthly_context_scan 3; expansion_zone_latest_check 2; manual_subscription 1 |

## 먼저 처리할 출처

| ID | 등급 | 출처 | 상태 | 최신 로컬 | 경과일 | 런북 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seoul_open_data | data | 서울 열린데이터광장 | API 키 필요 | 2026-06-24 | 0 | monthly_market_data_refresh | 서울 실거래/생활이동/생활인구 데이터셋 ID 확정 후 API 키 연결 |
| molit_data_go_kr | data | 국토교통부 실거래/공공데이터포털 | API 키 필요 | 2026-06-23 | 1 | monthly_market_data_refresh | DATA_GO_KR_SERVICE_KEY 연결 후 2024-01~현재 강남/송파/광진 실거래 수집 |
| seoul_urban_alert | primary | 서울도시공간포털 알림서비스 | 수동 알림 신청 |  |  | manual_subscription | 강남구, 송파구, 광진구를 우선 신청하고 남는 2개 슬롯은 강동구·중구 또는 서초구/성동구에 배정 |
| gangdong_district_notice | primary_backstop | 강동구 고시공고 | 수동 검토 필요 | 2026-06-24 | 0 | expansion_zone_latest_check | 천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 강동구 고시공고와 정보몽땅 기준으로 같은 날짜에 다시 닫는다. |
| jung_district_notice | primary_backstop | 중구 고시공고 | 수동 검토 필요 | 2026-06-24 | 0 | expansion_zone_latest_check | 약수역 direct hit가 새로 생겼는지 중구 고시공고와 정보몽땅에서 확인하고, 없으면 신당8·신당9 기준선을 유지한다. |
| seoul_citybuild_news | context | 서울시 주택·도시계획 분야 | 수동 검토 필요 | 2026-06-24 | 0 | monthly_context_scan | 잠실 MICE/국제교류복합지구, 한강변 정책, 역세권 활성화 페이지를 별도 컨텍스트 소스로 분리 |
| seoul_traffic_news | context | 서울시 교통 분야 | 수동 검토 필요 | 2026-06-24 | 0 | monthly_context_scan | 광나루·강변·잠실·대치 생활권별 교통계획 원문 링크를 추가 |
| opengov | context_backstop | 서울 정보소통광장 | 수동 검토 필요 | 2026-06-24 | 0 | monthly_context_scan | 광장극동·워커힐·잠실MICE·압구정 관련 문서 검색 키워드 목록 작성 |
| r_one | data | 한국부동산원 R-ONE | 수동 검토 필요 | 2026-06-24 | 0 | monthly_market_data_refresh | 서울·동남권·광진구/송파구/강남구 비교 지표 코드 확정 |

## 핵심 공식 출처

| ID | 등급 | 출처 | 상태 | 최신 로컬 | 경과일 | 런북 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seoul_urban_alert | primary | 서울도시공간포털 알림서비스 | 수동 알림 신청 |  |  | manual_subscription | 강남구, 송파구, 광진구를 우선 신청하고 남는 2개 슬롯은 강동구·중구 또는 서초구/성동구에 배정 |
| gangdong_district_notice | primary_backstop | 강동구 고시공고 | 수동 검토 필요 | 2026-06-24 | 0 | expansion_zone_latest_check | 천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 강동구 고시공고와 정보몽땅 기준으로 같은 날짜에 다시 닫는다. |
| jung_district_notice | primary_backstop | 중구 고시공고 | 수동 검토 필요 | 2026-06-24 | 0 | expansion_zone_latest_check | 약수역 direct hit가 새로 생겼는지 중구 고시공고와 정보몽땅에서 확인하고, 없으면 신당8·신당9 기준선을 유지한다. |
| seoul_urban_notice | primary | 서울도시공간포털 결정고시/열람공고 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs |
| cleanup_project_status | primary | 정비사업 정보몽땅 사업장검색/자료공개 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs |
| cleanup_notice | primary | 정비사업 정보몽땅 고시/공고 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs |
| seoul_sibo | primary_backstop | 서울시보 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs |
| district_notice | primary_backstop | 자치구 고시공고 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs |

## 전체 출처 신선도

| ID | 등급 | 출처 | 상태 | 최신 로컬 | 경과일 | 런북 | 다음 액션 | 존재 | 누락 | 최신 산출물 | 먼저 읽을 산출물 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul_open_data | data | 서울 열린데이터광장 | API 키 필요 | 2026-06-24 | 0 | monthly_market_data_refresh | 서울 실거래/생활이동/생활인구 데이터셋 ID 확정 후 API 키 연결 | 2 | 0 | data/market/official-market-data-sources.csv | data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md |
| molit_data_go_kr | data | 국토교통부 실거래/공공데이터포털 | API 키 필요 | 2026-06-23 | 1 | monthly_market_data_refresh | DATA_GO_KR_SERVICE_KEY 연결 후 2024-01~현재 강남/송파/광진 실거래 수집 | 2 | 0 | data/market/market-fetch-plan.csv | data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md |
| seoul_urban_alert | primary | 서울도시공간포털 알림서비스 | 수동 알림 신청 |  |  | manual_subscription | 강남구, 송파구, 광진구를 우선 신청하고 남는 2개 슬롯은 강동구·중구 또는 서초구/성동구에 배정 | 0 | 0 |  |  |
| gangdong_district_notice | primary_backstop | 강동구 고시공고 | 수동 검토 필요 | 2026-06-24 | 0 | expansion_zone_latest_check | 천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 강동구 고시공고와 정보몽땅 기준으로 같은 날짜에 다시 닫는다. | 7 | 0 | analysis/official-update-registry.md | analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/life-area-monitoring-board.md |
| jung_district_notice | primary_backstop | 중구 고시공고 | 수동 검토 필요 | 2026-06-24 | 0 | expansion_zone_latest_check | 약수역 direct hit가 새로 생겼는지 중구 고시공고와 정보몽땅에서 확인하고, 없으면 신당8·신당9 기준선을 유지한다. | 7 | 0 | analysis/official-update-registry.md | analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/life-area-monitoring-board.md |
| seoul_citybuild_news | context | 서울시 주택·도시계획 분야 | 수동 검토 필요 | 2026-06-24 | 0 | monthly_context_scan | 잠실 MICE/국제교류복합지구, 한강변 정책, 역세권 활성화 페이지를 별도 컨텍스트 소스로 분리 | 2 | 0 | analysis/transport-location-context.csv | analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md |
| seoul_traffic_news | context | 서울시 교통 분야 | 수동 검토 필요 | 2026-06-24 | 0 | monthly_context_scan | 광나루·강변·잠실·대치 생활권별 교통계획 원문 링크를 추가 | 1 | 0 | analysis/transport-location-context.csv | analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md |
| opengov | context_backstop | 서울 정보소통광장 | 수동 검토 필요 | 2026-06-24 | 0 | monthly_context_scan | 광장극동·워커힐·잠실MICE·압구정 관련 문서 검색 키워드 목록 작성 | 1 | 0 | analysis/official-context-sources.csv | analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md |
| r_one | data | 한국부동산원 R-ONE | 수동 검토 필요 | 2026-06-24 | 0 | monthly_market_data_refresh | 서울·동남권·광진구/송파구/강남구 비교 지표 코드 확정 | 2 | 0 | data/market/official-market-data-sources.csv | data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md |
| seoul_urban_notice | primary | 서울도시공간포털 결정고시/열람공고 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs | 13 | 0 | analysis/core-value-confirmation-ledger.md | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md |
| cleanup_project_status | primary | 정비사업 정보몽땅 사업장검색/자료공개 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs | 17 | 0 | analysis/management-stage-value-resolution.md | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md |
| cleanup_notice | primary | 정비사업 정보몽땅 고시/공고 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs | 37 | 0 | analysis/project-risk-signal-summary.md | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md |
| seoul_sibo | primary_backstop | 서울시보 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs | 2 | 0 | analysis/seoul-sibo-original-notice-fact-check.md | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md |
| district_notice | primary_backstop | 자치구 고시공고 | 로컬 분석 가능 | 2026-06-24 | 0 | weekly_primary_refresh | node scripts/fetch-cleanup-projects.mjs 후 node scripts/regenerate-research-artifacts.mjs | 15 | 0 | analysis/core-value-confirmation-ledger.md | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md |

## 해석 원칙

- 이 장부는 로컬 산출물 기준 신선도 점검표다. 원격 사이트의 실제 최신 공고 존재 여부는 런북 실행 또는 수동 확인으로만 확정한다.
- 보도자료·정책 페이지·정보소통광장은 context로만 사용하고, 고시번호·고시일·결정조서·원문 URL 확인 전에는 사업 단계 확정 근거로 쓰지 않는다.
- API 키 필요 출처는 goal 완료 병목이 아니라 시장 반응 보강 병목이다. 사업 단계 판정은 공식 고시·인가 원문을 우선한다.
