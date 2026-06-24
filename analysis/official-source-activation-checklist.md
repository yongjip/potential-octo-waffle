# 공식 출처 활성화 체크리스트

작성 기준: 2026-06-24 KST

이 문서는 공식 출처 중 아직 수동 알림 신청, 수동 월간 검색, API 키 연결이 필요한 항목을 따로 뽑아 운영 상태를 관리한다. 값 확정은 여전히 공식 원문·회신·로컬 원자료가 있을 때만 한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 활성화 대상 출처 | 9 |
| planned | 7 |
| active | 2 |
| 보완 필요 | 0 |
| P0 병목 직결 출처 | 0 |
| 사업장 영향 출처 | 3 |
| intake 행 | 2 |

| 구분 | 값 |
| --- | --- |
| 유형 | manual_monitoring 5; api_key 2; manual_subscription 1; manual_market_monitoring 1 |
| 상태 | planned 7; active 2 |
| 신선도 | 수동 검토 필요 6; API 키 필요 2; 수동 알림 신청 1 |
| 영향 | 시장/운영 보조 6; 전체 사업장 영향 3 |

## 활성화 대상

| 우선 | 출처 | 출처명 | 유형 | 현재 상태 | 활성화 | 영향사업 | P0 | 촉매 | 이슈 | 첫 액션 | 명령/수동 단계 | 기록 범위 | 완료 gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 110 | seoul_urban_alert | 서울도시공간포털 알림서비스 | manual_subscription | 수동 알림 신청 | planned | 0 | 0 | 0 |  | 강남구·송파구·광진구 알림 신청 후 수신 noticeCode/고시번호를 official-update-intake에 기록 | 강남구, 송파구, 광진구를 우선 신청하고 남는 2개 슬롯은 강동구·중구 또는 서초구/성동구에 배정 | 관심 자치구 최대 5개구, 핵심 3개구+확장 관심권 2개구 후보 | 첫 알림을 수신했거나 신청 완료 화면/메모가 intake에 남아 있고, 알림 내용은 원문 확인 전까지 확정 근거로 쓰지 않음 |
| 103 | opengov | 서울 정보소통광장 | manual_monitoring | 수동 검토 필요 | planned | 30 | 0 | 23 |  | 월간 검색 키워드와 공식 URL을 official-context-sources 또는 official-update-intake에 기록 | analysis/official-context-sources.csv 수동 갱신 | 서울시 결재문서, 위원회 회의정보, 정책연구자료, 건설사업정보 | 검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음 |
| 102 | seoul_traffic_news | 서울시 교통 분야 | manual_monitoring | 수동 검토 필요 | planned | 30 | 0 | 36 |  | 월간 검색 키워드와 공식 URL을 official-context-sources 또는 official-update-intake에 기록 | analysis/official-context-sources.csv 수동 갱신 | 서울 교통정책, 지하철, 도로, 보행, TOPIS | 검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음 |
| 99 | seoul_citybuild_news | 서울시 주택·도시계획 분야 | manual_monitoring | 수동 검토 필요 | planned | 30 | 0 | 28 |  | 월간 검색 키워드와 공식 URL을 official-context-sources 또는 official-update-intake에 기록 | analysis/official-context-sources.csv 수동 갱신 | 서울시 정책, 지역발전, 도시계획·부동산 | 검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음 |
| 80 | gangdong_district_notice | 강동구 고시공고 | manual_monitoring | 수동 검토 필요 | active | 0 | 0 | 0 |  | 확장 관심권 최신 점검 결과와 direct hit/단계 재확인 메모를 activation intake에 기록 | 수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅 사업장검색/공개자료, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 | 강동권 확장 관심권 | 자치구 고시공고 최신 점검 메모가 intake에 남아 있고, 강동권은 최신 단계 재확인 여부, 약수권은 direct hit 발생 여부가 구분되어 있다. |
| 80 | jung_district_notice | 중구 고시공고 | manual_monitoring | 수동 검토 필요 | active | 0 | 0 | 0 |  | 확장 관심권 최신 점검 결과와 direct hit/단계 재확인 메모를 activation intake에 기록 | 수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅 사업장검색/공개자료, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 | 약수동 주변 확장 관심권 | 자치구 고시공고 최신 점검 메모가 intake에 남아 있고, 강동권은 최신 단계 재확인 여부, 약수권은 direct hit 발생 여부가 구분되어 있다. |
| 50 | molit_data_go_kr | 국토교통부 실거래/공공데이터포털 | api_key | API 키 필요 | planned | 0 | 0 | 0 |  | DATA_GO_KR_SERVICE_KEY를 환경변수로 연결하고 plan-only 뒤 실제 수집 실행 | DATA_GO_KR_SERVICE_KEY=... node scripts/fetch-market-raw-data.mjs --from=202401 --to=YYYYMM | 거래 원자료, 토지·건축물·공시지가 | 원자료 파일 또는 API 응답이 로컬에 보존되고 market normalization audit이 blockedSources 0으로 재생성됨 |
| 50 | seoul_open_data | 서울 열린데이터광장 | api_key | API 키 필요 | planned | 0 | 0 | 0 |  | API 키 또는 파일 다운로드 경로를 확보하고 원자료 파일을 data/market/manual-import에 보존 | 서울 실거래/생활이동/생활인구 데이터셋 ID 확정 후 API 키 연결 | 서울 공공데이터, 통계, 생활인구, 생활이동, 실거래 보조 데이터 | 원자료 파일 또는 API 응답이 로컬에 보존되고 market normalization audit이 blockedSources 0으로 재생성됨 |
| 45 | r_one | 한국부동산원 R-ONE | manual_market_monitoring | 수동 검토 필요 | planned | 0 | 0 | 0 |  | 지표 코드, 지역 범위, 수동 다운로드 경로를 activation intake에 기록하고 market refresh에 연결 | 서울·동남권·광진구/송파구/강남구 비교 지표 코드 확정 | 가격지수, 거래현황, 지가변동률, 시장 반응 | 지표 코드·지역 범위·다운로드 경로가 intake에 남아 있고, 첫 원자료 또는 수동 다운로드 작업이 market refresh 산출물에 반영됨 |

## 영향 큰 출처

| 우선 | 출처 | 출처명 | 상위 영향 사업 | 연결 촉매 | 완료 gate |
| --- | --- | --- | --- | --- | --- |
| 103 | opengov | 서울 정보소통광장 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 29. 자양1의4구역 가로주택정비사업; 28. 자양번영로3나길 일대 가로주택정비사업; 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여 | 검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음 |
| 102 | seoul_traffic_news | 서울시 교통 분야 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 29. 자양1의4구역 가로주택정비사업; 28. 자양번영로3나길 일대 가로주택정비사업; 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여 | 검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음 |
| 99 | seoul_citybuild_news | 서울시 주택·도시계획 분야 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 29. 자양1의4구역 가로주택정비사업; 28. 자양번영로3나길 일대 가로주택정비사업; 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여 | 검색 결과가 context_only인지 verified_original인지 분리되어 있고, 고시/계획 원문 연결 전에는 가설 승격 없음 |

## 입력 파일

`data/review/official-source-activation-intake.json`에 수동 상태를 누적한다. API 키나 비밀번호는 기록하지 않고, 신청 상태·출처·다음 확인일만 적는다.

- 복사용 예시: `data/review/official-source-activation-intake-examples.json`
- 입력 가이드: `data/review/official-source-activation-intake.README.md`
- 검증 보드: `analysis/official-source-activation-validation.md`

## 운영 원칙

- 알림 수신은 검색 출발점이다. 고시번호·고시일·원문 URL·첨부명 확인 전에는 확정 근거가 아니다.
- 보도자료·정보소통광장·교통 정책은 `context_only`로 기록하고, 고시·계획·교통대책 원문 연결 전까지 가설 승격을 보류한다.
- 시장 데이터 API는 사업 단계 판정 근거가 아니라 고시·인가 전후 시장 반응을 확인하는 보조 신호다.
- 활성화 상태를 바꾼 뒤에는 이 체크리스트와 `node scripts/regenerate-research-artifacts.mjs`를 다시 실행한다.
