# 송파권 원문 연결 병목 감사

작성 기준: 2026-06-24 KST

송파권 후보 10개를 대상으로 서울도시공간포털 원문, 송파구청 고시공고 프로브, 정보몽땅 사업개요/공개항목, 기존 원문 텍스트 상태를 한 줄로 합친 작업표다. 목적은 “송파구청에서 안 나온다”를 결론으로 두지 않고, 다음에 어디를 검색해야 하는지 고정하는 것이다.

## 병목 유형

| 병목 | 건수 |
| --- | --- |
| stage_value_reconciliation | 3 |
| official_notice_text_ready | 7 |

## 우선 처리표

| 순위 | 사업 | 단계 | 근거 | 도시공간 | 텍스트 | 송파구청 | 정보몽땅 직접값 | 단계공개 | 병목 | 다음 교차확인 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가 | B | Y | text_extracted | no_candidate | 0 | 2 | stage_value_reconciliation | 관리처분/사업시행 공개항목과 기존 고시문 수치의 시점 차이를 analysis/management-stage-value-resolution.md에서 확정 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 사업시행인가 | B | Y | text_extracted | no_candidate | 0 | 0 | stage_value_reconciliation | 관리처분/사업시행 공개항목과 기존 고시문 수치의 시점 차이를 analysis/management-stage-value-resolution.md에서 확정 |
| 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가 | B | Y | text_extracted | no_candidate | 0 | 4 | stage_value_reconciliation | 관리처분/사업시행 공개항목과 기존 고시문 수치의 시점 차이를 analysis/management-stage-value-resolution.md에서 확정 |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 조합설립인가 | A | Y | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |
| 3 | 잠실우성아파트 재건축정비사업조합 | 조합설립인가 | B | Y | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |
| 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 조합설립인가 | B | N | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |
| 17 | 송파한양2차아파트 재건축정비사업 조합 | 조합설립인가 | B | N | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |
| 18 | 송파미성아파트 재건축정비사업조합 | 조합설립인가 | B | N | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |
| 19 | 대림가락아파트 재건축정비사업조합 | 조합설립인가 | B | Y | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 조합설립인가 | B | Y | text_extracted | no_candidate | 0 | 0 | official_notice_text_ready | notice-key-fields 스니펫과 원문 PDF/HWP를 대조해 면적·세대수·용적률 확정 후보를 만든다 |

## 검색 키워드 큐

| 순위 | 사업 | 검색어 | 보조값 필드 | 위치 | 현재 근거 링크 |
| --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 잠실우성4차 주택재건축정비사업조합; 잠실우성4차아파트; 서울 송파구 잠실본동 320번지 일대; 서울특별시고시 제2017-239호 |  | 서울 송파구 잠실본동 320번지 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000108s28&stepSeCode=102&div=sumry |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 가락1차현대아파트 재건축정비사업 조합; 가락1차현대아파트 주택재건축사업; 송파구 동남로 160 (문정동 3번지) 일대; 서울특별시고시 제2021-88호 |  | 송파구 동남로 160 (문정동 3번지) 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000689x43&stepSeCode=102&div=sumry |
| 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 가락삼익맨숀아파트 재건축정비사업 조합; 가락삼익맨숀아파트 재건축정비사업; 송파구 송파동 166번지 일대; 서울특별시고시 제2020-111호 |  | 송파구 송파동 166번지 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000676r36&stepSeCode=102&div=sumry |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 잠실5단지아파트 주택재건축정비사업조합; 잠실주공5단지주택재건축정비사업; 서울시 송파구 잠실동 27번지 일대; 서울특별시고시 제2024-432호 |  | 서울시 송파구 잠실동 27번지 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710100002002Y42&stepSeCode=102&div=sumry |
| 3 | 잠실우성아파트 재건축정비사업조합 | 잠실우성아파트 재건축정비사업조합; 우성아파트 주택재건축정비사업구역; 잠실동 101-1번지 일원 일대; 서울특별시고시 제2015-401호 |  | 잠실동 101-1번지 일원 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710100002006X76&stepSeCode=102&div=sumry |
| 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 장미1,2,3차아파트 주택재건축정비사업 조합; 장미123차아파트 주택재건축정비사업; 송파구 신천동 7번지 11번지 일대; 서울특별시고시 제2025-278호 |  | 송파구 신천동 7번지 11번지 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000615u63&stepSeCode=102&div=sumry |
| 17 | 송파한양2차아파트 재건축정비사업 조합 | 송파한양2차아파트 재건축정비사업 조합; 송파한양2차아파트 주택재건축정비사업조합설립추진위원회; 송파구 가락로192(송파동) 송파한양2차아파트 일대; 서울특별시고시 제2025-239호 | 최고높이 | 송파구 가락로192(송파동) 송파한양2차아파트 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000132y43&stepSeCode=102&div=sumry |
| 18 | 송파미성아파트 재건축정비사업조합 | 송파미성아파트 재건축정비사업조합; 송파미성아파트재건축정비사업; 송파구 송파동 161 일대; 서울특별시고시 제2021-146호 |  | 송파구 송파동 161 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000815V40&stepSeCode=102&div=sumry |
| 19 | 대림가락아파트 재건축정비사업조합 | 대림가락아파트 재건축정비사업조합; 대림가락아파트 재건축정비구역; 송파구 방이동 217 일대; 서울특별시고시 제2021-551호 |  | 송파구 방이동 217 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000854k71&stepSeCode=102&div=sumry |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 마천1재정비촉진구역 주택재개발정비사업조합; 마천1재정비촉진구역 주택재개발정비사업; 송파구 마천동 194-1 일대; 서울특별시고시 제2026-298호 | 건폐율; 정비구역 면적; 용적률; 층수; 최고높이 | 송파구 마천동 194-1 일대 | https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000742i64&stepSeCode=102&div=sumry |

## 해석

1. `cleanup_summary_only_recordcode_missing`은 정보몽땅 사업개요 값은 있으나 고시 recordCode 또는 본고시 원문이 아직 약한 상태다.
2. `stage_value_reconciliation`은 원문은 있으나 관리처분/사업시행 공개항목과 고시문 수치의 시점 차이를 풀어야 한다.
3. `official_notice_text_ready`는 원문 텍스트가 이미 있으므로 새 검색보다 스니펫 대조와 수치 확정이 우선이다.
4. `recordcode_and_notice_missing`은 서울도시공간포털 지도, 서울시보, 송파구청 키워드 변형 검색을 모두 재시도해야 한다.
