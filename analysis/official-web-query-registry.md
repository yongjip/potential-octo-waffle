# 공식 웹 검색 레지스트리

작성 기준: 2026-06-24 KST

이 문서는 서울 재개발·재건축 및 도시계획 리서치에서 실제 브라우저 세션에 쓰는 공식 포털 경로를 한 레지스트리로 묶는다. 각 행은 어디를 열고, 어떤 키워드로 찾고, 어떤 필드를 기록하고, 어느 gate를 통과해야 확정값으로 쓸 수 있는지 보여준다.

## 요약

- 전체 경로: 12
- 핵심 사업: 4
- 확장 관심권: 2
- 식별자 클로저: 0
- 외부 회신: 3
- 도시계획 context: 3

## 먼저 열 파일

1. [research-manual-web-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-manual-web-session-packet.md): 오늘 바로 열 수 있는 세션 분기
2. [focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md): 핵심 사업 직접 URL과 live recheck 기준
3. [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md): 강동권·약수권 확장 루프
4. [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md): fallback 6건의 presentSn 수동 확인 패킷
5. [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md): 외부 회신 점검 helper와 조회 URL
6. [official-change-detection-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-change-detection-board.md): 출처별 detection unit과 판정 gate

## 경로 한눈표

| 구분 | 대상 | 목적 | 현재 상태 | 검색어/쿼리 | 첫 기록 위치 |
| --- | --- | --- | --- | --- | --- |
| 핵심 사업 | 9. 잠실우성4차 주택재건축정비사업조합 | 공식 회신 선행 | 잠실/송파 / 관리처분인가 / 잠실축에서 가장 앞선 단계라 이주·철거·착공 전환 리스크를 보기 좋다. | 잠실우성4차 주택재건축정비사업조합; 잠실우성4차; 잠실우성4차 정비; 잠실우성4차 고시 | project-notes/09-tw2w7iwv.md; analysis/weekly-monitoring-execution-log.md |
| 핵심 사업 | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 비용/기반시설 대조 | 강남 / 조합설립인가 / 입지보다 공공기여·기반시설·높이 조건 해석이 우선이다. | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합; 압구정아파트지구 특별계획구역③; 압구정아파트지구 특별계획구역③ 정비; 압구정아파트지구 특별계획구역③ 고시 | project-notes/10-apgujeong3.md; analysis/weekly-monitoring-execution-log.md |
| 핵심 사업 | 25. 한양연립 일대 가로주택정비사업 | 원문 검증 우선 | 구의/광진 / 착공 공개신호 / 사업시행계획변경인가 직접 원문 / 구의·광진에서 착공 공개신호와 사업시행계획변경인가 직접 원문을 같이 읽을 수 있는 대표 케이스다. | 한양연립 일대 가로주택정비사업; 한양연립; 한양연립 정비; 한양연립 고시 | project-notes/25-hanyanggaro.md; analysis/weekly-monitoring-execution-log.md |
| 핵심 사업 | 5. 장미1,2,3차아파트 주택재건축정비사업 조합 | 비용/기반시설 대조 | 잠실/송파 / 조합설립인가 / 장기 잠재는 높지만 비용·기반시설 부담 해석이 남아 있다. | 장미1,2,3차아파트 주택재건축정비사업 조합; 장미1,2,3차아파트; 장미1,2,3차아파트 정비; 장미1,2,3차아파트 고시 | project-notes/05-jmapt1.md; analysis/weekly-monitoring-execution-log.md |
| 확장 관심권 | 강동권 | latest stage / direct hit 재확인 | 강동구 고시공고 / 다음 점검 2026-07-01 KST / 2026-06-24 KST 기준 강동권 수동 감시 루프를 운영 상태로 전환. 서울도시공간포털 정비사업구역계(PMNU4030600001) 검색에서 천호3구역 direct hit 1건을 다시 확인했고, noticeCode direct popup은 차단되... | 천호동 재개발; 천호동 가로주택; 성내동 소규모재건축; 길동 재건축; 강동구 고시공고 정비 | data/review/official-source-activation-intake.json; data/review/official-update-intake.json |
| 확장 관심권 | 약수동 주변 | latest stage / direct hit 재확인 | 중구 고시공고 / 다음 점검 2026-07-01 KST / 2026-06-24 KST 기준 약수권 수동 감시 루프를 운영 상태로 전환. 서울도시공간포털 정비사업구역계(PMNU4030600001) 검색에서 약수역 direct hit 0건을 다시 확인했고 adjacent baseline 유지로 판정했다. not... | 약수동 정비; 약수역 가로주택; 신당동 재건축; 청구역 정비; 중구 고시공고 정비 | data/review/official-source-activation-intake.json; data/review/official-update-intake.json |
| 외부 회신 | 9. 잠실우성4차 주택재건축정비사업조합 | 회신 확인 / 원문 식별정보 확보 | 송파구 / 관리처분인가 / no_response / 다음 점검 2026-06-29 | 잠실우성4차 주택재건축정비사업조합; 송파구 정비사업; 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | data/review/high-blocking-source-response-intake.json |
| 외부 회신 | 23. 광장동 삼성1차아파트 소규모재건축정비사업 | 회신 확인 / 원문 식별정보 확보 | 광진구 / 조합설립인가 / no_response / 다음 점검 2026-06-29 | 광장동 삼성1차아파트 소규모재건축정비사업; 광진구 정비사업; 조합설립인가 고시번호, 고시일, 원문/첨부 URL | data/review/high-blocking-source-response-intake.json |
| 외부 회신 | 28. 자양번영로3나길 일대 가로주택정비사업 | 회신 확인 / 원문 식별정보 확보 | 광진구 / 조합설립인가 / no_response / 다음 점검 2026-06-29 | 자양번영로3나길 일대 가로주택정비사업; 광진구 정비사업; 조합설립인가 고시번호, 고시일, 원문/첨부 URL | data/review/high-blocking-source-response-intake.json |
| 도시계획 context | 서울시 주택·도시계획 분야 | monthly_context_scan | 수동 검토 필요 / weekly | 잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여 | analysis/official-context-sources.csv |
| 도시계획 context | 서울시 교통 분야 | monthly_context_scan | 수동 검토 필요 / monthly; 대형 교통계획 발표 시 ad hoc | 잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여 | analysis/official-context-sources.csv |
| 도시계획 context | 서울 정보소통광장 | monthly_context_scan | 수동 검토 필요 / monthly; 심의 이슈 발생 시 ad hoc | 잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여 | analysis/official-context-sources.csv |

## 경로 1. 9. 잠실우성4차 주택재건축정비사업조합

- 구분: 핵심 사업
- 목적: 공식 회신 선행
- 현재 상태: 잠실/송파 / 관리처분인가 / 잠실축에서 가장 앞선 단계라 이주·철거·착공 전환 리스크를 보기 좋다.
- 공식 채널: 정비사업 정보몽땅; 서울도시공간포털; 자치구 고시공고/사업별 페이지
- 진입 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=Tw2w7Iwv)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000108s28&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000108s28&bsnsPk=11710-900000108)
- [cleanup_public_item_202_pattern](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000108s28&othbcIemSn=202)
- [cleanup_public_item_213_pattern](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000108s28&othbcIemSn=213)
- [cleanup_bid_board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710900000108s28)
- [cleanup_cost_board](https://cleanup.seoul.go.kr/assc/bbs-use/lscrWctList.do?cafeId=710900000108s28)
- [urban_notice](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC201707068193)
- [urban_map](https://urban.seoul.go.kr/view/map/mapPopup.html?recordCode=11000AGZ201711290445)
- [district_page](https://www.songpa.go.kr/www/contents.do?key=5794)
- 검색어/쿼리
  잠실우성4차 주택재건축정비사업조합; 잠실우성4차; 잠실우성4차 정비; 잠실우성4차 고시
- 기록 필드
  cafeUrl; cafeId; 사업장명; 현재단계; 공개자료 수; 사업장; 게시글 제목; 등록일; 첨부파일; noticeCode; recordCode; 고시번호; 고시일; 구역명; 자치구 게시판 ID; 공고번호; 담당부서; 최종 수정일
- 판정 gate
  고시번호, 고시일, 원문 URL, 공개항목 본문, 첨부 원문, 기준일이 있는 경우만 확정 신호로 사용한다. / 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 / 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격
- 첫 기록 위치
- [09-tw2w7iwv.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/09-tw2w7iwv.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 먼저 갱신할 산출물
- [09-tw2w7iwv.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/09-tw2w7iwv.md)
- [management-stage-value-resolution.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/management-stage-value-resolution.md)
- [high-blocking-filing-checklist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-checklist.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 다음 액션/helper
  analysis/focus-project-latest-check-guide.md -> node scripts/regenerate-research-artifacts.mjs

## 경로 2. 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합

- 구분: 핵심 사업
- 목적: 비용/기반시설 대조
- 현재 상태: 강남 / 조합설립인가 / 입지보다 공공기여·기반시설·높이 조건 해석이 우선이다.
- 공식 채널: 정비사업 정보몽땅; 서울도시공간포털; 자치구 고시공고/사업별 페이지
- 진입 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=apgujeong3)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680900000675S91&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=680900000675S91&bsnsPk=11680-900000675)
- [cleanup_bid_board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=680900000675S91)
- [cleanup_cost_board](https://cleanup.seoul.go.kr/assc/bbs-use/lscrWctList.do?cafeId=680900000675S91)
- [urban_notice](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202312010004)
- [urban_map](https://urban.seoul.go.kr/view/map/mapPopup.html?recordCode=11000AGZ202312010001)
- 검색어/쿼리
  압구정아파트지구 특별계획구역③ 재건축정비사업 조합; 압구정아파트지구 특별계획구역③; 압구정아파트지구 특별계획구역③ 정비; 압구정아파트지구 특별계획구역③ 고시
- 기록 필드
  cafeUrl; cafeId; 사업장명; 현재단계; 공개자료 수; 사업장; 게시글 제목; 등록일; 첨부파일; noticeCode; recordCode; 고시번호; 고시일; 구역명; 자치구 게시판 ID; 공고번호
- 판정 gate
  고시번호, 고시일, 원문 URL, 공개항목 본문, 첨부 원문, 기준일이 있는 경우만 확정 신호로 사용한다. / 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 / 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격
- 첫 기록 위치
- [10-apgujeong3.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/10-apgujeong3.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 먼저 갱신할 산출물
- [10-apgujeong3.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/10-apgujeong3.md)
- [apgujeong3-s1-public-item-fact-check.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/apgujeong3-s1-public-item-fact-check.md)
- [focus-area-comparison-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-area-comparison-brief.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 다음 액션/helper
  analysis/focus-project-latest-check-guide.md -> node scripts/regenerate-research-artifacts.mjs

## 경로 3. 25. 한양연립 일대 가로주택정비사업

- 구분: 핵심 사업
- 목적: 원문 검증 우선
- 현재 상태: 구의/광진 / 착공 공개신호 / 사업시행계획변경인가 직접 원문 / 구의·광진에서 착공 공개신호와 사업시행계획변경인가 직접 원문을 같이 읽을 수 있는 대표 케이스다.
- 공식 채널: 정비사업 정보몽땅; 서울도시공간포털; 자치구 고시공고/사업별 페이지
- 진입 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=hanyanggaro)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001126x73&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=215900001126x73&bsnsPk=11215-900001126)
- [cleanup_bid_board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=215900001126x73)
- [cleanup_cost_board](https://cleanup.seoul.go.kr/assc/bbs-use/lscrWctList.do?cafeId=215900001126x73)
- [gwangjin_notice_search](https://www.gwangjin.go.kr/portal/bbs/B0000003/list.do?menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1)
- [gwangjin_notice_main](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6186353&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1)
- [gwangjin_notice_correction](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6031295&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1)
- [gwangjin_notice_public_review](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6171163&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1)
- 검색어/쿼리
  한양연립 일대 가로주택정비사업; 한양연립; 한양연립 정비; 한양연립 고시
- 기록 필드
  cafeUrl; cafeId; 사업장명; 현재단계; 공개자료 수; 사업장; 게시글 제목; 등록일; 첨부파일; noticeCode; recordCode; 고시번호; 고시일; 구역명; 자치구 게시판 ID; 공고번호
- 판정 gate
  고시번호, 고시일, 원문 URL, 공개항목 본문, 첨부 원문, 기준일이 있는 경우만 확정 신호로 사용한다. / 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 / 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격
- 첫 기록 위치
- [25-hanyanggaro.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/25-hanyanggaro.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 먼저 갱신할 산출물
- [25-hanyanggaro.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/25-hanyanggaro.md)
- [gwangjin-gu-notice-fact-check.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/gwangjin-gu-notice-fact-check.md)
- [transport-location-context.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/transport-location-context.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 다음 액션/helper
  analysis/focus-project-latest-check-guide.md -> node scripts/regenerate-research-artifacts.mjs

## 경로 4. 5. 장미1,2,3차아파트 주택재건축정비사업 조합

- 구분: 핵심 사업
- 목적: 비용/기반시설 대조
- 현재 상태: 잠실/송파 / 조합설립인가 / 장기 잠재는 높지만 비용·기반시설 부담 해석이 남아 있다.
- 공식 채널: 정비사업 정보몽땅; 서울도시공간포털; 자치구 고시공고/사업별 페이지
- 진입 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=jmapt1)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000615u63&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000615u63&bsnsPk=11710-900000615)
- [cleanup_public_item_200](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000615u63&othbcIemSn=200)
- [cleanup_bid_board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710900000615u63)
- [cleanup_cost_board](https://cleanup.seoul.go.kr/assc/bbs-use/lscrWctList.do?cafeId=710900000615u63)
- 검색어/쿼리
  장미1,2,3차아파트 주택재건축정비사업 조합; 장미1,2,3차아파트; 장미1,2,3차아파트 정비; 장미1,2,3차아파트 고시
- 기록 필드
  cafeUrl; cafeId; 사업장명; 현재단계; 공개자료 수; 사업장; 게시글 제목; 등록일; 첨부파일; noticeCode; recordCode; 고시번호; 고시일; 구역명; 자치구 게시판 ID; 공고번호
- 판정 gate
  고시번호, 고시일, 원문 URL, 공개항목 본문, 첨부 원문, 기준일이 있는 경우만 확정 신호로 사용한다. / 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 / 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격
- 첫 기록 위치
- [05-jmapt1.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/05-jmapt1.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 먼저 갱신할 산출물
- [05-jmapt1.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/05-jmapt1.md)
- [songpa-notice-value-corroboration.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/songpa-notice-value-corroboration.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)
- 다음 액션/helper
  analysis/focus-project-latest-check-guide.md -> node scripts/regenerate-research-artifacts.mjs

## 경로 5. 강동권

- 구분: 확장 관심권
- 목적: latest stage / direct hit 재확인
- 현재 상태: 강동구 고시공고 / 다음 점검 2026-07-01 KST / 2026-06-24 KST 기준 강동권 수동 감시 루프를 운영 상태로 전환. 서울도시공간포털 정비사업구역계(PMNU4030600001) 검색에서 천호3구역 direct hit 1건을 다시 확인했고, noticeCode direct popup은 차단되...
- 공식 채널: 강동구 고시공고; 서울도시공간포털; 정비사업 정보몽땅
- 진입 URL
- [https://www.gangdong.go.kr/](https://www.gangdong.go.kr/)
- [https://urban.seoul.go.kr/view/new/main.html](https://urban.seoul.go.kr/view/new/main.html)
- [https://cleanup.seoul.go.kr/](https://cleanup.seoul.go.kr/)
- 검색어/쿼리
  천호동 재개발; 천호동 가로주택; 성내동 소규모재건축; 길동 재건축; 강동구 고시공고 정비
- 기록 필드
  게시글 제목; 공고번호; 등록일; 첨부파일; 키워드; 사업명; 고시번호; 고시일; 위치; 최신 단계 공개 여부
- 판정 gate
  확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다. / 공식 사업명·고시번호·고시일 또는 정보몽땅 사업장명이 확인될 때만 project 후보나 단계 근거로 승격
- 첫 기록 위치
- [official-source-activation-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-source-activation-intake.json)
- [official-update-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-update-intake.json)
- 먼저 갱신할 산출물
- [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)
- [expansion-zone-intake-seed-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-intake-seed-board.md)
- [expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md)
- [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)
- 다음 액션/helper
  수동 검색: 강동구 고시공고 -> 천호3구역·신동아1·2차·성내미주 최신 단계 확인 -> 결과를 official-update-intake 또는 activation intake에 기록

## 경로 6. 약수동 주변

- 구분: 확장 관심권
- 목적: latest stage / direct hit 재확인
- 현재 상태: 중구 고시공고 / 다음 점검 2026-07-01 KST / 2026-06-24 KST 기준 약수권 수동 감시 루프를 운영 상태로 전환. 서울도시공간포털 정비사업구역계(PMNU4030600001) 검색에서 약수역 direct hit 0건을 다시 확인했고 adjacent baseline 유지로 판정했다. not...
- 공식 채널: 중구 고시공고; 서울도시공간포털; 정비사업 정보몽땅
- 진입 URL
- [https://www.junggu.seoul.kr/index.html](https://www.junggu.seoul.kr/index.html)
- [https://urban.seoul.go.kr/view/new/main.html](https://urban.seoul.go.kr/view/new/main.html)
- [https://cleanup.seoul.go.kr/](https://cleanup.seoul.go.kr/)
- 검색어/쿼리
  약수동 정비; 약수역 가로주택; 신당동 재건축; 청구역 정비; 중구 고시공고 정비
- 기록 필드
  게시글 제목; 공고번호; 등록일; 첨부파일; 키워드; 사업명; 고시번호; 고시일; 위치; 최신 단계 공개 여부
- 판정 gate
  확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다. / 공식 사업명·고시번호·고시일 또는 정보몽땅 사업장명이 확인될 때만 project 후보나 단계 근거로 승격
- 첫 기록 위치
- [official-source-activation-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-source-activation-intake.json)
- [official-update-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-update-intake.json)
- 먼저 갱신할 산출물
- [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)
- [expansion-zone-intake-seed-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-intake-seed-board.md)
- [expansion-yaksu-ocr-recheck-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-yaksu-ocr-recheck-board.md)
- [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)
- 다음 액션/helper
  수동 검색: 중구 고시공고 -> 약수역 direct hit 여부와 신당·청구 인접 비교군 확인 -> 결과를 official-update-intake 또는 activation intake에 기록

## 경로 7. 9. 잠실우성4차 주택재건축정비사업조합

- 구분: 외부 회신
- 목적: 회신 확인 / 원문 식별정보 확보
- 현재 상태: 송파구 / 관리처분인가 / no_response / 다음 점검 2026-06-29
- 공식 채널: 송파구 새올전자민원창구; 송파구 주택사업과 직원검색; 정비사업 정보몽땅 문의처 안내
- 진입 URL
- [https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/caf/mwwd/action/CafMwWdInputAction.do](https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/caf/mwwd/action/CafMwWdInputAction.do)
- [https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000](https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000)
- [https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/emwp/cmmpotal/action/EmwpMainMgtAction.do?](https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/emwp/cmmpotal/action/EmwpMainMgtAction.do?)
- [https://cleanup.seoul.go.kr/cleanup/html/qacenterPopup.html](https://cleanup.seoul.go.kr/cleanup/html/qacenterPopup.html)
- 검색어/쿼리
  잠실우성4차 주택재건축정비사업조합; 송파구 정비사업; 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문
- 기록 필드
  response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.management_construction_cost; confirmed_values.management_total_project_cost; confirmed_values.management_cost_basis_date; evidence_files; response_note; follow_up_action
- 판정 gate
  관리처분 공사비·총사업비 금액, 기준일, 자료명 또는 원문 URL이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. / confirmed/partial는 관리처분 공사비·총사업비·기준일·자료명 중 확인된 범위로만 사용
- 첫 기록 위치
- [high-blocking-source-response-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-source-response-intake.json)
- 먼저 갱신할 산출물
- [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [high-blocking-response-decision-drafts.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-decision-drafts.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [research-completion-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-completion-cockpit.md)
- 다음 액션/helper
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh -> 필요 시 node scripts/record-high-blocking-followup-check.mjs --rank=9 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인' --write -> node scripts/process-high-blocking-response-workflow.mjs

## 경로 8. 23. 광장동 삼성1차아파트 소규모재건축정비사업

- 구분: 외부 회신
- 목적: 회신 확인 / 원문 식별정보 확보
- 현재 상태: 광진구 / 조합설립인가 / no_response / 다음 점검 2026-06-29
- 공식 채널: 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기; 광진구 정보공개청구 바로가기; 광진구 주거사업과 부서 안내; 광진구 업무검색
- 진입 URL
- [https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do](https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do)
- [https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107](https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107)
- [https://www.gwangjin.go.kr/portal/bbs/B0000113/deptGdc.do?deptId=101591&menuNo=201015](https://www.gwangjin.go.kr/portal/bbs/B0000113/deptGdc.do?deptId=101591&menuNo=201015)
- [https://www.gwangjin.go.kr/portal/member/user/searchEmpList.do?searchDeptId=100259&menuNo=200203](https://www.gwangjin.go.kr/portal/member/user/searchEmpList.do?searchDeptId=100259&menuNo=200203)
- 검색어/쿼리
  광장동 삼성1차아파트 소규모재건축정비사업; 광진구 정비사업; 조합설립인가 고시번호, 고시일, 원문/첨부 URL
- 기록 필드
  response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action
- 판정 gate
  고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. / confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용
- 첫 기록 위치
- [high-blocking-source-response-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-source-response-intake.json)
- 먼저 갱신할 산출물
- [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [high-blocking-response-decision-drafts.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-decision-drafts.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [research-completion-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-completion-cockpit.md)
- 다음 액션/helper
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh -> 필요 시 node scripts/record-high-blocking-followup-check.mjs --rank=23 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인' --write -> node scripts/process-high-blocking-response-workflow.mjs

## 경로 9. 28. 자양번영로3나길 일대 가로주택정비사업

- 구분: 외부 회신
- 목적: 회신 확인 / 원문 식별정보 확보
- 현재 상태: 광진구 / 조합설립인가 / no_response / 다음 점검 2026-06-29
- 공식 채널: 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기; 광진구 정보공개청구 바로가기; 광진구 주거사업과 부서 안내; 광진구 업무검색
- 진입 URL
- [https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do](https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do)
- [https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107](https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107)
- [https://www.gwangjin.go.kr/portal/bbs/B0000113/deptGdc.do?deptId=101591&menuNo=201015](https://www.gwangjin.go.kr/portal/bbs/B0000113/deptGdc.do?deptId=101591&menuNo=201015)
- [https://www.gwangjin.go.kr/portal/member/user/searchEmpList.do?searchDeptId=100259&menuNo=200203](https://www.gwangjin.go.kr/portal/member/user/searchEmpList.do?searchDeptId=100259&menuNo=200203)
- 검색어/쿼리
  자양번영로3나길 일대 가로주택정비사업; 광진구 정비사업; 조합설립인가 고시번호, 고시일, 원문/첨부 URL
- 기록 필드
  response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action
- 판정 gate
  고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. / confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용
- 첫 기록 위치
- [high-blocking-source-response-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-source-response-intake.json)
- 먼저 갱신할 산출물
- [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [high-blocking-response-decision-drafts.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-decision-drafts.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [research-completion-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-completion-cockpit.md)
- 다음 액션/helper
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh -> 필요 시 node scripts/record-high-blocking-followup-check.mjs --rank=28 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인' --write -> node scripts/process-high-blocking-response-workflow.mjs

## 경로 10. 서울시 주택·도시계획 분야

- 구분: 도시계획 context
- 목적: monthly_context_scan
- 현재 상태: 수동 검토 필요 / weekly
- 공식 채널: 서울시 주택·도시계획 분야
- 진입 URL
- [https://news.seoul.go.kr/citybuild/](https://news.seoul.go.kr/citybuild/)
- 검색어/쿼리
  잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여
- 기록 필드
  게시글, 보도자료, 사업 페이지
- 판정 gate
  보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격
- 첫 기록 위치
- [official-context-sources.csv](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-context-sources.csv)
- 먼저 갱신할 산출물
- [15-hanyang7.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/15-hanyang7.md)
- [research-hypothesis-ledger.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-hypothesis-ledger.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [fieldwork-observation-notebook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/fieldwork-observation-notebook.md)
- 다음 액션/helper
  수동 검색: 서울시 주택·도시계획 분야

## 경로 11. 서울시 교통 분야

- 구분: 도시계획 context
- 목적: monthly_context_scan
- 현재 상태: 수동 검토 필요 / monthly; 대형 교통계획 발표 시 ad hoc
- 공식 채널: 서울시 교통 분야
- 진입 URL
- [https://news.seoul.go.kr/traffic/](https://news.seoul.go.kr/traffic/)
- 검색어/쿼리
  잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여
- 기록 필드
  게시글, 보도자료, 계획명, 노선명
- 판정 gate
  보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격
- 첫 기록 위치
- [official-context-sources.csv](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-context-sources.csv)
- 먼저 갱신할 산출물
- [15-hanyang7.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/15-hanyang7.md)
- [research-hypothesis-ledger.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-hypothesis-ledger.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [fieldwork-observation-notebook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/fieldwork-observation-notebook.md)
- 다음 액션/helper
  수동 검색: 서울시 교통 분야

## 경로 12. 서울 정보소통광장

- 구분: 도시계획 context
- 목적: monthly_context_scan
- 현재 상태: 수동 검토 필요 / monthly; 심의 이슈 발생 시 ad hoc
- 공식 채널: 서울 정보소통광장
- 진입 URL
- [https://opengov.seoul.go.kr/](https://opengov.seoul.go.kr/)
- 검색어/쿼리
  잠실 MICE·국제교류복합지구; 압구정·한강변관리·경관/높이/공공기여
- 기록 필드
  문서 제목, 생산일, 부서, 사업명
- 판정 gate
  보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격
- 첫 기록 위치
- [official-context-sources.csv](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-context-sources.csv)
- 먼저 갱신할 산출물
- [15-hanyang7.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/15-hanyang7.md)
- [research-hypothesis-ledger.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-hypothesis-ledger.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
- [fieldwork-observation-notebook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/fieldwork-observation-notebook.md)
- 다음 액션/helper
  수동 검색: 서울 정보소통광장


## 운영 원칙

- 이 레지스트리는 공식 포털 검색 경로와 기록 규칙을 고정하는 문서다. 값 확정은 각 gate를 통과한 원문·회신 기준으로만 한다.
- `고시번호`, `고시일`, `원문 URL`, `첨부 원문`, `공개항목 본문`, `기준일`이 확인되지 않으면 단계나 수치를 확정하지 않는다.
- context 출처는 도시계획·교통 촉매를 읽기 위한 보조 루트다. 사업 단계나 비용 수치를 직접 확정하는 데 쓰지 않는다.
- 세션 종료 후에는 관련 메모나 intake를 먼저 갱신하고 마지막에 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.

