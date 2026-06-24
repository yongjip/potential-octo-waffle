# 구의·광진 주간 점검 패킷

작성 기준: 2026-06-24 KST

이 문서는 구의·광진 생활권을 먼저 볼 주에 여는 실행판이다. 동서울터미널 변화 기대를 생활권 `context`로 보고, 한양연립의 `사업시행계획변경인가 직접 원문`과 `착공 공개신호`를 함께 확인한다.

## 목적

1. 동서울터미널·강변역 변화가 실제 생활권 판단에 영향을 줄 정도로 공식화됐는지 본다.
2. 한양연립의 현재 단계를 `사업시행계획변경인가 직접 원문`과 `착공 공개신호` 이중 라벨로 읽어 주간 오독을 막는다.
3. 구의·광진 생활권에서 무엇이 아직 기대이고 무엇이 이미 공식값인지 빠르게 다시 고정한다.

## 이번 패킷에서 보는 범위

| 구분 | 기준선 |
| --- | --- |
| 생활권 context | 동서울터미널 현대화사업 사전협상 페이지 수정일 `2026-04-17` 유지 여부 |
| 대표 사업 primary | 한양연립 일대 가로주택정비사업 |
| 보조 병목 사업 | 삼성1차 `item 200=3건`, 자양번영로3나길 `item 200=5건`, 두 사업 모두 `item 202/203/210/213/379=0건` |
| 단계 해석 규칙 | 대표 라벨은 `착공 공개신호 / 사업시행계획변경인가 직접 원문`; 직접 착공신고 원문 전까지 이중 라벨 유지 |
| 이번 주 목표 | 이중 라벨이 유지되는지, 직접 착공신고 원문으로 더 닫힐 수 있는지 확인 |

## 확인 모드

### A. 수동 15분 점검

1. 동서울터미널 사전협상 페이지 수정일과 타임라인을 본다.
2. 한양연립 정보몽땅 사업장, 추진경과, 조합입찰공고를 본다.
3. 광진구 제2023-115호, 제2024-372호, 제2024-449호가 그대로 열리는지 확인한다.
4. 삼성1차·자양번영로3나길 `item 200` 목록 건수와 `item 202/213` 실문서 추가 여부를 확인한다.
5. `직접 원문 기준 단계`와 `선행 신호`가 이번 주에도 분리 유지인지 적는다.

### B. 전체 refresh

1. `weekly_primary_refresh` 체인 실행
2. `node scripts/regenerate-research-artifacts.mjs`
3. 이 패킷 기준으로 구의·광진 관련 변화만 먼저 판정

## 먼저 열 공식 페이지

1. [동서울터미널 현대화사업 사전협상](https://news.seoul.go.kr/citybuild/archives/537004)
2. [한양연립 정보몽땅 사업장](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=hanyanggaro)
3. [한양연립 추진경과](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=215900001126x73&bsnsPk=11215-900001126)
4. [한양연립 조합입찰공고](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=215900001126x73)
5. [광진구 제2023-115호 직접 고시](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6186353&menuNo=201848&searchCnd=3&searchWrd=%ED%95%9C%EC%96%91%EC%97%B0%EB%A6%BD&deptId=101591&pSiteId=portal&pageIndex=1)
6. [광진구 제2024-372호 공사개요/예정공정표 맥락](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6209808&menuNo=201848&searchCnd=3&searchWrd=%EA%B5%AC%EC%9D%98%EB%8F%99+592-39&deptId=101591&pSiteId=portal&pageIndex=1)
7. [광진구 제2024-449호 안전점검 결과](https://www.gwangjin.go.kr/portal/bbs/B0000003/view.do?nttId=6213254&menuNo=201848&searchCnd=3&searchWrd=%EA%B5%AC%EC%9D%98%EB%8F%99+592-39&deptId=101591&pSiteId=portal&pageIndex=1)

## 현재 기준선

| 항목 | 공식값 / 상태 | 해석 |
| --- | --- | --- |
| 동서울터미널 페이지 수정일 | `2026-04-17` | 생활권 기대축은 유지되지만 개별 사업 단계 확정 신호는 아님 |
| 동서울터미널 타임라인 | `2025.09 도시건축공동위원회 심의(수정가결)`, `2025.11 도시관리계획 결정 고시` | 생활권 context로 중요하지만 한양연립 단계값과 직접 결합하지 않음 |
| 한양연립 직접 고시 축 | 광진구 `제2023-115호`, 고시일 `2023-12-07` | direct 원문 축은 `사업시행계획변경인가` |
| 한양연립 후속 공사 맥락 | 광진구 `제2024-372호`, `제2024-449호` | 착공 전후 현장 진행 신호와 공사개요는 보강되지만 direct 착공 원문과 동일하지 않음 |
| 정보몽땅 진행경과 | `이주완료 2023-08-01`, `철거신고 2023-11-01`, `착공신고 2024-02-15`, `입주자 모집 공고 2024-05-31` | `착공 공개신호`로 관리 |
| 사업 레이어/예정공정표 신호 | 사업 레이어 `착공`, 예정공정 `2024-02-26 ~ 2026-08-25` | 단계 상향 후보이지만 direct 착공 원문 전까지 보류 |
| 한양연립 핵심 수치 | 총 `215`, 분양 `176`, 임대 `39`, 최고높이 `43.25m`, 용적률 `248.70%`, 건폐율 `31.62%` | 직접 원문 대조 가능한 공식값 |
| 삼성1차 공개경계 | `item 200=3건`, 신청 `2023-07-04`, 인가 `2023-07-10`, 동의율 `91.23%`, `item 202/203/210/213/379=0건` | 조합설립 요약표와 이력 목록은 열리지만 상세/첨부와 다음 단계 문서는 비회원 경로에서 막힘 |
| 자양번영로3나길 공개경계 | `item 200=5건`, 신청 `2021-11-01`, 인가 `2023-11-15`, 동의율 `86.6`, `item 202/203/210/213/379=0건` | 조합설립 요약표와 이력 목록은 열리지만 상세/첨부와 다음 단계 문서는 비회원 경로에서 막힘 |

## 변화로 인정할 신호

| 신호 | 이번 주 변화로 인정 | 노이즈 |
| --- | --- | --- |
| 동서울터미널 | 수정일 변경, 새 도시관리계획 고시, 교통처리계획/심의 문서 추가 | 일반 설명 문구 수정만 있는 경우 |
| 한양연립 단계 | 직접 `착공신고` 원문·식별정보 추가, 추진경과 후속 날짜 추가 | 정보몽땅 문구 순서만 바뀐 경우 |
| 한양연립 수치 | 새 첨부 원문에서 세대수/용적률/공사기간 기준일 변경 | OCR 반올림 차이, 요약문 순서 차이 |
| 광진구 생활권 | 광장극동, 워커힐1단지, 자양축 direct notice 추가 | 기사, 블로그, 민간 재가공 자료 |
| 삼성1차/자양번영로3나길 | `item 200` 목록 건수 증가, `item 202/213` 실문서 생성, 고시번호·고시일 회신 도착 | `item 202/203/210/213/379 = 0건` 상태 재확인만 한 경우 |

## 한양연립 판정 질문

1. 이번 주에도 `착공 공개신호 / 사업시행계획변경인가 직접 원문` 이중 라벨이 유지되는가
2. direct 착공 원문 또는 관리처분 원문이 새로 붙었는가
3. 동서울터미널 후속 문서가 실제 보행·교통체감 재평가를 부를 만큼 구체화됐는가
4. 구의·광진 생활권을 다시 올릴 정도의 새 공식 근거가 생겼는가

## 반영 순서

1. [project-notes/25-hanyanggaro.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/25-hanyanggaro.md)
2. [analysis/gwangjin-gu-notice-fact-check.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/gwangjin-gu-notice-fact-check.md)
3. [analysis/transport-location-context.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/transport-location-context.md)
4. [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
5. [analysis/reassessment-watchlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/reassessment-watchlist.md)
6. [analysis/weekly-monitoring-log-2026-06-24.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-log-2026-06-24.md) 또는 새 주 로그

## 주간 로그 한 줄 템플릿

`구의·광진 / no material change / 동서울터미널 수정일 유지, 한양연립 착공 공개신호와 사업시행계획변경인가 직접 원문 병기 유지 / 기대보다 원문·단계 확정 우선`

## 다음 확인 포인트

1. 한양연립 direct 착공 원문 존재 여부
2. 동서울터미널 후속 도시관리계획·교통처리계획 문서
3. 광장동 삼성1차, 자양번영로3나길 외부 회신 도착 여부와 `item 200` 목록 증가 여부
