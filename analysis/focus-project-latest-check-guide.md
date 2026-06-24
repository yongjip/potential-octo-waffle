# 핵심 사업 최신 확인 가이드

작성 기준: 2026-06-24 KST

이 문서는 장미1,2,3차, 잠실우성4차, 압구정3, 한양연립 4개 사업의 최신 공식 업데이트를 가장 빠르게 확인하는 실전용 가이드다. 각 사업마다 무엇을 먼저 열고, 어떤 변화를 실제 신호로 인정하고, 변화가 나오면 어느 파일을 고쳐야 하는지 한 번에 보게 만든다.

## 공통 원칙

1. 확정 신호는 `고시번호`, `고시일`, `원문 URL`, `공개항목 본문`, `첨부 원문`, `기준일`이 있는 경우만 쓴다.
2. `조합입찰공고`, `공지사항`, `총회 공고`는 즉시 결론이 아니라 `속도`, `비용`, `기반시설`, `이주` 신호로만 읽는다.
3. 정책 기사, 홍보자료, 일반 뉴스는 `context`로만 두고 바로 점수나 단계 판단을 바꾸지 않는다.
4. 새 변화가 있으면 먼저 사업 메모를 고치고, 그 다음 비교표와 감시표를 갱신한다.

## 빠른 실행 순서

1. [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)를 연다.
2. 아래 4개 사업 중 하나를 골라 `사업장 -> 사업개요 -> 추진경과 -> 공개항목/게시판 -> 고시 원문` 순서로 본다.
3. 변화가 실제 신호인지 확인한다.
4. 변화가 맞으면 해당 `project-notes/*.md`와 [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)를 먼저 갱신한다.
5. 마지막에 [reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)와 [official-update-registry.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-update-registry.md)에 반영한다.

## 1. 장미1,2,3차

| 항목 | 내용 |
| --- | --- |
| 현재 단계 | 조합설립인가 |
| 핵심 해석 | 장기 잠재는 높지만 비용·기반시설 부담 해석이 남아 있다. |
| 가장 먼저 열 URL | 사업장: [cleanup main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=jmapt1) |
| 그 다음 URL | 사업개요: [summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000615u63&stepSeCode=102&div=sumry) |
| 단계 확인 URL | 추진경과: [progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000615u63&bsnsPk=11710-900000615) |
| 공개항목 직링크 | 조합설립 공개항목 item 200: [public item](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000615u63&othbcIemSn=200) |
| 공개목록 직링크 | item 200 목록: [list 200](https://cleanup.seoul.go.kr/service/opendata/othbcDocInput/lscrOpen.do?cafeId=710900000615u63&othbcIemSn=200&bsnsPk=11710-900000615) / item 202 목록: [list 202](https://cleanup.seoul.go.kr/service/opendata/othbcDocInput/lscrOpen.do?cafeId=710900000615u63&othbcIemSn=202&bsnsPk=11710-900000615) / item 213 목록: [list 213](https://cleanup.seoul.go.kr/service/opendata/othbcDocInput/lscrOpen.do?cafeId=710900000615u63&othbcIemSn=213&bsnsPk=11710-900000615) |
| 게시판 URL | 조합입찰공고: [bid board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710900000615u63) |
| 보조 URL | 확정된 사업비 및 분담금 목록: [cost board](https://cleanup.seoul.go.kr/assc/bbs-use/lscrWctList.do?cafeId=710900000615u63) |
| known gap | 서울도시공간포털 direct notice URL 미확인, direct recordCode 미연결, item 200 상세/첨부는 비회원 로그인 차단 |

### 2026-06-24 live recheck

- 정보몽땅 추진경과 최신 조합 변경인가는 `2025-11-03`, 동의율은 `94.10`으로 다시 확인됐다.
- item 200 직접 공개화면은 신청일 `2025-10-22`, 인가일 `2025-11-03`, 동의율 `94.10`, `주요변경내역=첨부파일 참조`까지만 보여 준다.
- item 200 목록화면은 `전체 18건`이며, `2020-03-24 조합정관`부터 `2025-11-03 조합설립(변경)인가서`까지 공개 이력이 잡힌다.
- item 200 각 제목 링크는 비회원 기준 `로그인 정보가 없으므로, 열람권한이 없습니다.` alert로 막힌다.
- item 202, item 203, item 210, item 213, item 379 목록화면은 모두 `전체 0건`, `등록된 공개자료가 없습니다.`를 반환한다.
- 즉, 이번 재확인 기준으로는 `조합설립인가` 해석을 유지한다.

### 변화로 인정할 신호

- 추진경과 또는 item 200의 최신 변경인가 신청일/인가일/동의율이 바뀜
- item 200 목록 건수가 `18건`에서 늘거나 최신 발생일이 `2025-11-03` 이후로 갱신됨
- 조합입찰공고에서 도로설계, 지하안전, 우수박스 이설, 재해영향평가 같은 기반시설성 공고가 추가됨
- 사업시행계획서(인가) 또는 관리처분계획서(인가) 메뉴에 실제 문서가 새로 붙음

### 노이즈로만 둘 신호

- 단순 공지, 일정 안내, 총회 일반 공지
- item 202/203/210/213/379 `0건` 상태를 다시 확인한 것만으로는 변화로 보지 않는다.
- 직접 원문 없이 2025-278 고시 텍스트의 숫자만 자동 추출된 값

### 변화가 나오면 먼저 고칠 파일

- [project-notes/05-jmapt1.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/05-jmapt1.md)
- [analysis/songpa-notice-value-corroboration.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/songpa-notice-value-corroboration.md)
- [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)

## 2. 잠실우성4차

| 항목 | 내용 |
| --- | --- |
| 현재 단계 | 관리처분인가 |
| 핵심 해석 | 잠실축에서 가장 앞선 단계라 이주·철거·착공 전환 리스크를 보기 좋다. |
| 가장 먼저 열 URL | 사업장: [cleanup main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=Tw2w7Iwv) |
| 그 다음 URL | 사업개요: [summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000108s28&stepSeCode=102&div=sumry) |
| 단계 확인 URL | 추진경과: [progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000108s28&bsnsPk=11710-900000108) |
| 고시 원문 URL | [서울도시공간포털 고시](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC201707068193) |
| 지도 URL | [map popup](https://urban.seoul.go.kr/view/map/mapPopup.html?recordCode=11000AGZ201711290445) |
| 게시판 URL | 조합입찰공고: [bid board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710900000108s28) |
| 보조 URL | 송파구 공식 사업별 페이지: [songpa page](https://www.songpa.go.kr/www/contents.do?key=5794) |
| known gap | 관리처분 공사비·정비사업비 원문은 비회원 공개화면 미노출, 외부 회신 대기 |

### 2026-06-24 live recheck

- 송파구 공식 사업별 페이지는 `관리처분계획인가 2025.12.31.`을 유지하고 `최고층수 지상32층, 아파트 7개동 825세대(임대 93세대 포함)`를 표시한다.
- 같은 페이지의 담당부서는 `주택사업과`, 전화번호는 `02-2147-2880`, 최종 수정일은 `2026-03-19`다.
- 정보몽땅 추진경과는 `관리처분인가 신청 2025-09-05`, `인가 2025-12-31`, `인가고시 2026-01-08`을 그대로 공개한다.

### 변화로 인정할 신호

- 추진경과 또는 송파구 공식 사업별 페이지의 단계일자 변경
- 관리처분 이후 `이주비`, `명도`, `범죄예방`, `철거`, `착공` 성격의 조합입찰공고 추가
- 담당부서 또는 정보공개 회신으로 공사비·총사업비·기준일·자료명이 들어옴

### 노이즈로만 둘 신호

- item 213 화면에 있는 `별첨 참조` 문구만 반복 확인한 결과
- 분담금 게시판에서 비회원이 열지 못하는 페이지 존재 자체

### 변화가 나오면 먼저 고칠 파일

- [project-notes/09-tw2w7iwv.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/09-tw2w7iwv.md)
- [analysis/management-stage-value-resolution.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/management-stage-value-resolution.md)
- [analysis/high-blocking-filing-checklist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-checklist.md)
- [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)

## 3. 압구정3

| 항목 | 내용 |
| --- | --- |
| 현재 단계 | 조합설립인가 |
| 핵심 해석 | 입지보다 공공기여·기반시설·높이 조건 해석이 우선이다. |
| 가장 먼저 열 URL | 사업장: [cleanup main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=apgujeong3) |
| 그 다음 URL | 사업개요: [summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680900000675S91&stepSeCode=102&div=sumry) |
| 단계 확인 URL | 추진경과: [progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=680900000675S91&bsnsPk=11680-900000675) |
| 공개항목 직링크 | item 200 direct: [public item](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=680900000675S91&othbcIemSn=200) |
| 공개목록 직링크 | item 200 목록: [list 200](https://cleanup.seoul.go.kr/service/opendata/othbcDocInput/lscrOpen.do?kindSelect=3&cafeId=680900000675S91&othbcIemSn=200&bsnsPk=11680-900000675&procSttusTypeCode=S&omiProcSttusTypeCode=S) / item 202 목록: [list 202](https://cleanup.seoul.go.kr/service/opendata/othbcDocInput/lscrOpen.do?kindSelect=3&cafeId=680900000675S91&othbcIemSn=202&bsnsPk=11680-900000675&procSttusTypeCode=S&omiProcSttusTypeCode=S) / item 213 목록: [list 213](https://cleanup.seoul.go.kr/service/opendata/othbcDocInput/lscrOpen.do?kindSelect=3&cafeId=680900000675S91&othbcIemSn=213&bsnsPk=11680-900000675&procSttusTypeCode=S&omiProcSttusTypeCode=S) |
| 고시 원문 URL | [서울도시공간포털 고시](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202312010004) |
| 지도 URL | [map popup](https://urban.seoul.go.kr/view/map/mapPopup.html?recordCode=11000AGZ202312010001) |
| 게시판 URL | 조합입찰공고: [bid board](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=680900000675S91) |
| 보조 URL | 서울시 주택·도시계획 분야: [citybuild](https://news.seoul.go.kr/citybuild/) |
| known gap | `item 200` 상세/첨부는 비회원 로그인 차단, 비용·분담금 확정값보다 아파트지구 단위 조건 문맥이 먼저 잡혀 있는 상태 |

### 2026-06-24 live recheck

- 정보몽땅 추진경과 최신 조합 변경인가는 `2026-02-12`, 동의율은 `96.53`으로 다시 확인됐다.
- `item 200` 직접 공개화면은 `조합설립(경미한) 변경 신고 처리 알림` 기준 신청 `2025-12-24`, 처리 `2026-05-06`, 동의율 `96.77`, `조합임원 변경 : 7인->11인`을 노출한다.
- `item 200` 목록화면은 `전체 1건`이며, visible row dates는 `2021-04-19 / 2021-05-04 / 2023-08-21`이다.
- `item 200` 제목 링크는 비회원 기준 `로그인 정보가 없으므로, 열람권한이 없습니다.` alert로 막힌다.
- `item 202`, `item 203`, `item 210`, `item 213`, `item 379` 목록화면은 모두 `전체 0건`, `등록된 공개자료가 없습니다.`를 반환한다.
- `사업시행인가`, `관리처분인가`는 여전히 섹션만 있고 공개된 세부 날짜는 없다.
- 즉, 이번 재확인 기준으로는 `조합설립인가` 해석과 `사업시행 전` 리스크 읽기를 유지한다. `2026-05-06` direct 화면은 같은 단계 내부의 later public-change signal로만 둔다.

### 변화로 인정할 신호

- 지하차도, 소방설계, 환경영향평가, 시공자 선정 같은 조합입찰공고의 실제 추가
- 압구정아파트지구 관련 고시·지구단위계획 변경·공공기여 조건 변경
- 정보몽땅 추진경과 latest 변경인가 값 변화, `item 200` direct 처리일/동의율 변화
- 정보몽땅 공개자료에서 분담금/사업비/기반시설 관련 새 첨부 확인, `item 200` 목록 건수 증가, `item 202/210/213` 실문서 등장

### 노이즈로만 둘 신호

- 단순 상급지 기사, 가격 기사
- `item 200` direct later signal 하나만 보고 `사업시행인가`나 `관리처분인가`로 단계 승격
- 아파트지구 전체 고시의 수치를 압구정3 단지 개별 확정값으로 오독하는 경우

### 변화가 나오면 먼저 고칠 파일

- [project-notes/10-apgujeong3.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/10-apgujeong3.md)
- [analysis/apgujeong3-s1-public-item-fact-check.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/apgujeong3-s1-public-item-fact-check.md)
- [analysis/focus-area-comparison-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-area-comparison-brief.md)
- [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)

## 4. 한양연립

| 항목 | 내용 |
| --- | --- |
| 현재 단계 | 착공 공개신호 / 사업시행계획변경인가 직접 원문 |
| 핵심 해석 | 구의·광진에서 원문과 생활권 가설을 같이 읽을 수 있는 대표 케이스다. |
| 가장 먼저 열 URL | 사업장: [cleanup main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=hanyanggaro) |
| 그 다음 URL | 사업개요: [summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001126x73&stepSeCode=102&div=sumry) |
| 단계 확인 URL | 추진경과: [progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=215900001126x73&bsnsPk=11215-900001126) |
| 직접 고시 URL | [광진구 제2023-115호](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6186353&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1) |
| 보조 고시 URL | [사업시행계획인가(정정)](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6031295&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1) |
| 공람 URL | [사업시행계획변경인가 공람공고](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6171163&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1) |
| 착공 보강 URL | [광진구 제2024-372호](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6209808&menuNo=201848&searchCnd=3&searchWrd=%EA%B5%AC%EC%9D%98%EB%8F%99+592-39&deptId=101591&pSiteId=portal&pageIndex=1) |
| 보조 URL | 서울시 주택·도시계획 분야: [citybuild](https://news.seoul.go.kr/citybuild/) |
| known gap | 서울도시공간포털 direct notice recordCode는 미확인, 사업구역 레이어는 착공으로 더 앞서 표시됨 |

### 2026-06-24 live recheck

- 광진구 고시공고 상세는 `광진구 제2023-115호`, `한양연립 일대 가로주택정비사업 사업시행계획변경인가 고시`, 공고시작일 `2023-12-07`과 PDF 첨부를 그대로 공개한다.
- 광진구 `제2024-372호`는 `건설공사 안전점검 수행기관 지정 모집공고(구의동 592-39)`, 공고시작일 `2024-03-25`, 첨부 `1-1. 공사개요.pdf`, `1-2. 예정공정표.pdf`를 그대로 공개한다.
- `1-2. 예정공정표.pdf`는 `작성일 2024-02-16`, `공사기간 2024-02-26 ~ 2026-08-25`, 마일스톤 `착공`을 직접 보여준다.
- 정보몽땅 추진경과는 `이주완료 2023-08-01`, `철거신고 2023-11-01`, `착공신고 2024-02-15`, `입주자 모집 공고 2024-05-31`를 공개한다.
- 따라서 이번 재확인 기준 대표 라벨은 `착공 공개신호 / 사업시행계획변경인가 직접 원문`이다. 직접 `착공신고` 원문 식별정보 전까지는 이중 라벨을 유지하고, 한 줄짜리 단일 단계로 과장하지 않는다.

### 변화로 인정할 신호

- 광진구청 고시공고에서 사업시행/관리처분/착공 관련 새 공고 확인
- 정비사업 정보몽땅 추진경과에 `착공신고` 이후 후속 직접 단계 신호나 새 날짜가 추가됨
- 동서울터미널·강변역 사전협상/도시계획/교통처리계획이 공식 원문으로 구체화됨

### 노이즈로만 둘 신호

- 서울시 제2024-282호를 한양연립 직접 원문으로 사용하는 것
- 동서울터미널 기대 기사만 있고 실제 원문 일정이 없는 경우

### 변화가 나오면 먼저 고칠 파일

- [project-notes/25-hanyanggaro.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/25-hanyanggaro.md)
- [analysis/gwangjin-gu-notice-fact-check.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/gwangjin-gu-notice-fact-check.md)
- [analysis/transport-location-context.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/transport-location-context.md)
- [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)

## 공통 context 출처

| 주제 | 공식 출처 | URL | 어떻게 쓸지 |
| --- | --- | --- | --- |
| 잠실 MICE·국제교류복합지구 | 서울시 주택·도시계획 분야 | https://news.seoul.go.kr/citybuild/ | 잠실축 사업의 장기 촉매. 보도자료만으로 확정하지 않고 고시·계획·교통대책 원문이 붙을 때만 승격 |
| 압구정·한강변관리 | 서울시 주택·도시계획 분야 | https://news.seoul.go.kr/citybuild/ | 압구정3 공공기여·경관·높이 조건 문맥 확인 |
| 동서울터미널·강변역 | 서울시 주택·도시계획 분야 | https://news.seoul.go.kr/citybuild/ | 한양연립과 광진 동부축 장기 촉매 문맥 확인 |
| 교통·보행 정책 | 서울시 교통 분야 | https://news.seoul.go.kr/traffic/ | 환승, 도로, 보행축, 광역교통 정책 변화 확인 |

## 기록 순서

1. 사업별 변화는 해당 `project-notes/*.md`에 먼저 적는다.
2. 비교 판단이 바뀌면 [current-research-snapshot.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/current-research-snapshot.md)와 [life-area-comparison-worksheet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-comparison-worksheet.md)를 수정한다.
3. 주간 로그는 [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)에 남긴다.
4. 외부 회신이 들어오면 [high-blocking-filing-checklist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-checklist.md)와 `data/review/high-blocking-source-response-intake.json`부터 반영한다.
