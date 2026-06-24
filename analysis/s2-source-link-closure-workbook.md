# S2 원문 링크 클로저 워크북

작성 기준: 2026-06-24 KST

이 문서는 source-verification-sprint-plan의 S2 recordCode·원문 URL 닫기 태스크를 사업장 단위로 펼친 워크북이다. 필드별 값 일치가 있더라도 본고시 원문 URL 또는 recordCode가 없으면 완료로 보지 않고, 로컬 텍스트·사업개요 보조근거·서울도시공간포털 후보를 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S2 대상 사업장 | 6 |
| P0 사업장 | 3 |
| P1 사업장 | 3 |
| 연결 대상 필드 | 14 |
| URL까지 닫힌 필드 | 0 |
| partial 필드 | 14 |
| 상태 분포 | official_summary_value_match_original_notice_pending 3; local_text_available_no_closure_rows 2; local_original_notice_text_url_pending 1 |
| 생활권 분포 | 구의/광진 4; 강남 1; 잠실/송파 1 |

## 사업장별 클로저

| 큐 | 우선 | 생활권 | 후보 | 사업장 | 필드 | partial | 상태 | 고시번호 | 검색/확인 대상 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | P0 | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 0 | 0 | local_text_available_no_closure_rows | 2025-278 | 확보된 로컬 텍스트의 고시번호·고시일을 추출해 recordCode 검색 키로 사용 | 로컬 원문 텍스트는 있으나 필드별 클로저가 없으므로 고시번호/일자 중심으로 후보행 생성 |
| 17 | P0 | 구의/광진 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 6 | 6 | official_summary_value_match_original_notice_pending |  | 정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색 | 값 일치는 유지하되 본고시 원문 미확보 상태를 pending으로 남김 |
| 18 | P0 | 구의/광진 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 5 | 5 | official_summary_value_match_original_notice_pending |  | 정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색 | 값 일치는 유지하되 본고시 원문 미확보 상태를 pending으로 남김 |
| 41 | P1 | 강남 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 2 | 2 | local_original_notice_text_url_pending | 2023-516 | 로컬 본고시 텍스트의 notice_no/date로 서울도시공간포털 recordCode 또는 다운로드 URL 검색 | URL/recordCode만 보강하면 partial을 Y 후보로 승격 |
| 42 | P1 | 구의/광진 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 1 | 1 | official_summary_value_match_original_notice_pending |  | 정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색 | 값 일치는 유지하되 본고시 원문 미확보 상태를 pending으로 남김 |
| 43 | P1 | 구의/광진 | 29 | 자양1의4구역 가로주택정비사업 | 0 | 0 | local_text_available_no_closure_rows |  | 확보된 로컬 텍스트의 고시번호·고시일을 추출해 recordCode 검색 키로 사용 | 로컬 원문 텍스트는 있으나 필드별 클로저가 없으므로 고시번호/일자 중심으로 후보행 생성 |

## 상세

### 15. 장미1,2,3차아파트 주택재건축정비사업 조합

- 상태: local_text_available_no_closure_rows
- 닫을 필드: 필드별 클로저 행 없음
- 기존 고시: 2025-278 
- 로컬 텍스트: data/urban/text/files/05-11000NTC202505290003-05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.txt
- 공식 사업개요 URL: 없음
- 원문/후보 경로: data/urban/files/05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.pdf
- 다음 확인: 확보된 로컬 텍스트의 고시번호·고시일을 추출해 recordCode 검색 키로 사용
- 메모: project-notes/05-jmapt1.md

### 17. 광장동 삼성1차아파트 소규모재건축정비사업

- 상태: official_summary_value_match_original_notice_pending
- 닫을 필드: 정비구역 면적:7,653(official_summary_value_match_original_notice_pending); 용적률:300(official_summary_value_match_original_notice_pending); 건폐율:20(official_summary_value_match_original_notice_pending); 층수:지상:40/지하:3(official_summary_value_match_original_notice_pending); 최고높이:0(official_summary_value_match_original_notice_pending); 총 세대수:185(official_summary_value_match_original_notice_pending)
- 기존 고시: 없음 
- 로컬 텍스트: 없음
- 공식 사업개요 URL: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry
- 원문/후보 경로: data/cleanup/project-summaries-priority-candidates.json
- 다음 확인: 정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색
- 메모: project-notes/23-j15171517.md

### 18. 자양번영로3나길 일대 가로주택정비사업

- 상태: official_summary_value_match_original_notice_pending
- 닫을 필드: 정비구역 면적:2,307.5(official_summary_value_match_original_notice_pending); 용적률:295(official_summary_value_match_original_notice_pending); 건폐율:23(official_summary_value_match_original_notice_pending); 층수:지상:20/지하:3(official_summary_value_match_original_notice_pending); 최고높이:58(official_summary_value_match_original_notice_pending)
- 기존 고시: 없음 
- 로컬 텍스트: 없음
- 공식 사업개요 URL: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry
- 원문/후보 경로: data/cleanup/project-summaries-priority-candidates.json
- 다음 확인: 정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색
- 메모: project-notes/28-jayang588-22.md

### 41. 압구정한양7차아파트 재건축정비사업조합

- 상태: local_original_notice_text_url_pending
- 닫을 필드: 정비구역 면적:16,437.1(official_summary_value_match_original_notice_pending); 고시번호:2023-516(local_original_notice_text_url_pending)
- 기존 고시: 2023-516 
- 로컬 텍스트: data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt
- 공식 사업개요 URL: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680100003000s45&stepSeCode=102&div=sumry
- 원문/후보 경로: data/urban/files/15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.pdf; data/cleanup/project-summaries-priority-candidates.json; data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt
- 다음 확인: 로컬 본고시 텍스트의 notice_no/date로 서울도시공간포털 recordCode 또는 다운로드 URL 검색
- 메모: project-notes/15-hanyang7.md

### 42. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회

- 상태: official_summary_value_match_original_notice_pending
- 닫을 필드: 정비구역 면적:89,878(official_summary_value_match_original_notice_pending)
- 기존 고시: 없음 
- 로컬 텍스트: data/urban/text/gwangjin-gu/files/24-B0000378-16413-1-24-B0000378-16413-gwangjin-gu-1-붙임2-주민의견제출서.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-2-24-B0000378-16413-gwangjin-gu-2-붙임1-워커힐아파트-일대-도시관리계획수립-전략환경영향평가-항목-범위-등의-결정내용.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-3-24-B0000378-16413-gwangjin-gu-3-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt
- 공식 사업개요 URL: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001363i54&stepSeCode=101&div=sumry
- 원문/후보 경로: data/cleanup/project-summaries-priority-candidates.json
- 다음 확인: 정보몽땅 사업개요 URL은 보조근거로 두고 서울도시공간포털/서울시보/자치구 본고시 원문 검색
- 메모: project-notes/24-walkerhill1.md

### 43. 자양1의4구역 가로주택정비사업

- 상태: local_text_available_no_closure_rows
- 닫을 필드: 필드별 클로저 행 없음
- 기존 고시: 없음 
- 로컬 텍스트: data/urban/text/gwangjin-gu/files/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt
- 공식 사업개요 URL: 없음
- 원문/후보 경로: 없음
- 다음 확인: 확보된 로컬 텍스트의 고시번호·고시일을 추출해 recordCode 검색 키로 사용
- 메모: project-notes/29-jayang104.md


## 사용법

1. partial 필드가 있는 사업장은 값 일치 근거와 본고시 원문 URL을 분리해 확인한다.
2. local_original_notice_text_url_pending은 로컬 텍스트의 고시번호/고시일로 서울도시공간포털 recordCode 또는 서울시보 URL을 찾는다.
3. official_summary_value_match_original_notice_pending은 정보몽땅 사업개요를 보조근거로 유지하되 본고시 원문 확보 전까지 confirmed로 닫지 않는다.
