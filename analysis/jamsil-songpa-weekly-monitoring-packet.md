# 잠실·송파 주간 점검 패킷

작성 기준: 2026-06-24 KST

이 문서는 잠실/송파 생활권을 한 주에 한 번 점검할 때 바로 실행하는 패킷이다. `잠실5단지`, `장미1,2,3차`, `잠실우성4차` 3개 사업과 잠실 MICE·국제교류복합지구 context를 같이 본다.

## 목적

- 잠실축의 `공공 촉매`, `사업 단계`, `비용·기반시설 리스크`를 한 번에 다시 확인한다.
- 잠실/송파 생활권 결론이 바뀔 만한 변화만 골라낸다.
- 변화가 있으면 어느 파일부터 고칠지 바로 결정한다.

## 이 패킷이 다루는 범위

| 구분 | 대상 | 현재 기준선 |
| --- | --- | --- |
| 생활권 context | 잠실 MICE, 국제교류복합지구, 탄천동로 통제 | 큰 그림 유지, 개별 사업 확정 근거 아님 |
| 대표 사업 1 | 잠실5단지 | 조합설립인가, 원문 병목 8건 |
| 대표 사업 2 | 장미1,2,3차 | 조합설립인가, direct notice/recordCode 미연결 |
| 대표 사업 3 | 잠실우성4차 | 관리처분인가, 공사비·정비사업비 외부 회신 대기 |

## 실행 모드

### A. 수동 15분 점검

이 모드는 원격 수집 스크립트를 돌리지 않고 공식 페이지와 핵심 메모만 빠르게 다시 확인할 때 쓴다.

1. 생활권 context 3개 페이지 수정일 확인
2. 잠실5단지, 장미1,2,3차, 잠실우성4차 사업장/추진경과 확인
3. 잠실우성4차 송파구 공식 사업별 페이지 확인
4. 새 변화가 없으면 `no material change`로 주간 로그에 남김

### B. 원격 전체 refresh

이 모드는 `weekly_primary_refresh`를 실제로 돌릴 때 쓴다.

```bash
node scripts/fetch-cleanup-projects.mjs
node scripts/fetch-project-summaries.mjs
node scripts/fetch-cafe-menu-links.mjs
node scripts/fetch-cleanup-board-latest.mjs
node scripts/fetch-urban-map-details.mjs
node scripts/fetch-urban-notice-details.mjs --download
node scripts/probe-gangnam-songpa-notices.mjs --download
node scripts/regenerate-research-artifacts.mjs
```

그 뒤 `analysis/official-refresh-summary.md`, `analysis/cleanup-snapshot-diff.md`, `analysis/cleanup-board-review-queue.md`를 읽고 아래 판정표에 맞춰 반영한다.

## 1. 먼저 열 페이지

### 생활권 context

1. [잠실 스포츠·MICE 복합공간 조성 민간투자사업 추진](https://news.seoul.go.kr/citybuild/archives/44587)
2. [국제교류복합지구 개요](https://news.seoul.go.kr/citybuild/archives/67165)
3. [봉은교와 탄천동로 전면 통제에 따른 우회도로 안내](https://news.seoul.go.kr/traffic/archives/516624)

### 잠실5단지

1. [사업장](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=jamsil5apt)
2. [사업개요](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710100002002Y42&stepSeCode=102&div=sumry)
3. [추진경과](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710100002002Y42&bsnsPk=11710-100002002)
4. [고시 원문](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11710NTC202409230003)
5. [조합입찰공고](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710100002002Y42)
6. [확정된 사업비 및 분담금 목록](https://cleanup.seoul.go.kr/assc/bbs-use/lscrWctList.do?cafeId=710100002002Y42)

### 장미1,2,3차

1. [사업장](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=jmapt1)
2. [사업개요](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000615u63&stepSeCode=102&div=sumry)
3. [추진경과](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000615u63&bsnsPk=11710-900000615)
4. [조합설립 공개항목 item 200](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000615u63&othbcIemSn=200)
5. [조합입찰공고](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710900000615u63)

### 잠실우성4차

1. [사업장](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=Tw2w7Iwv)
2. [사업개요](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000108s28&stepSeCode=102&div=sumry)
3. [추진경과](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000108s28&bsnsPk=11710-900000108)
4. [관리처분 공개항목 item 213](https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=710900000108s28&othbcIemSn=213)
5. [송파구 공식 사업별 페이지](https://www.songpa.go.kr/www/contents.do?key=5794)
6. [조합입찰공고](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=710900000108s28)

## 2. 기준선 값

이 값은 `2026-06-24` 기준 로컬 메모와 공식 페이지 실확인 기준선이다.

| 대상 | 기준선 값 |
| --- | --- |
| 잠실 MICE | 수정일 `2026-04-02` |
| 국제교류복합지구 | 수정일 `2026-05-04` |
| 탄천동로 통제 | 수정일 `2026-04-01` |
| 잠실5단지 | 현재단계 `조합설립인가`, 고시번호 `2024-432`, 고시일 `2024-09-05` |
| 장미1,2,3차 | 현재단계 `조합설립인가`, 최신 변경인가 `2025-11-03`, 동의율 `94.10`, `item 200 목록 18건`, `item 202/203/210/213/379 = 0건` |
| 잠실우성4차 | 현재단계 `관리처분인가`, 신청 `2025-09-05`, 인가 `2025-12-31`, 인가고시 `2026-01-08`, 송파구 페이지 최종 수정일 `2026-03-19` |

## 3. 변화 판정표

| 대상 | 변화로 인정 | 노이즈 처리 |
| --- | --- | --- |
| 잠실 MICE / 국제교류복합지구 | 수정일 변경 + 후속 고시/교통대책/첨부 원문 추가 | 설명문 문구만 소폭 수정 |
| 잠실5단지 | 새 고시번호, 추진경과 단계 변경, 사업비/분담금 관련 새 공개항목, 기반시설성 입찰공고 추가 | 기사, 일반 공지, 로그인 막힌 팝업 존재 자체 |
| 장미1,2,3차 | 추진경과 변경인가 값 변경, `item 200` 목록 건수 증가 또는 새 발생일 추가, 사업시행/관리처분 메뉴 실제 문서 추가, 기반시설성 입찰공고 추가 | `2025-278` 상위 규칙 반복, `장미아파트` 성동구 false positive, 서울시보 `장미1,2,3차`/`장미123차`/`신천동 7` 제목 무검색, `4주구` 후보와 HWP 첨부 시각 확인까지 해도 direct notice 없는 상태 반복 확인, `item 202/203/210/213/379 = 0건` 반복 확인 |
| 잠실우성4차 | 송파구 페이지 단계 변화, 추진경과 단계일자 변화, 철거/착공/이주 관련 공고 추가, 회신 도착 | item 213의 `별첨 참조` 문구만 반복 확인 |

## 4. 사업별 체크 질문

### 잠실5단지

- 정비계획 변경 이후 공공기여·기반시설 부담 해석이 더 무거워졌는가
- 사업비/분담금 관련 새 공개항목이 붙었는가
- 잠실 MICE 축과의 연결이 `context`가 아니라 새 `primary`로 강화됐는가

### 장미1,2,3차

- 조합설립인가 이후 실제 다음 단계 문서가 열렸는가
- 기반시설 신호가 더 늘었는가
- direct notice/recordCode 병목을 해소할 공식 흔적이 새로 생겼는가
- 새 흔적이 생겼더라도 `장미아파트` 성동구 false positive, 서울시보 제목 무검색 상태, `잠실아파트지구 4주구` 상위 고시, `4주구` HWP 도면을 direct notice로 잘못 올리지 않았는가

### 잠실우성4차

- 관리처분 이후 실제 이주·철거·착공 전환 신호가 붙었는가
- 공사비/정비사업비 회신이 도착했는가
- 송파구 공식 페이지와 정보몽땅 날짜가 어긋나기 시작했는가

## 5. 반영 순서

### 변화 없음

1. `analysis/weekly-monitoring-execution-log.md`
2. 필요하면 `analysis/weekly-monitoring-log-YYYY-MM-DD.md`

추천 문구:

- `잠실/송파: no material change. 잠실 MICE·국제교류복합지구 context 유지, 잠실5/장미/잠실우성4차 단계 기준선 유지`

### 변화 있음

1. 사업별 메모
   - `project-notes/01-jamsil5apt.md`
   - `project-notes/05-jmapt1.md`
   - `project-notes/09-tw2w7iwv.md`
2. 비교/감시 문서
   - `analysis/life-area-comparison-worksheet.md`
   - `analysis/life-area-monitoring-board.md`
   - `analysis/focus-project-weekly-monitoring-cockpit.md`
3. 로그/레지스트리
   - `analysis/weekly-monitoring-execution-log.md`
   - `analysis/weekly-monitoring-history.md`
   - `analysis/official-update-registry.md`

## 6. 주간 로그 복붙 템플릿

```md
| 잠실/송파 | 변화 없음/있음 | 잠실 MICE·국제교류복합지구·탄천동로 통제, 잠실5, 장미1,2,3차, 잠실우성4차 재확인 | 생활권 큰 그림 유지/재조정 | 다음 행동 |
```

예시:

```md
| 잠실/송파 | 변화 없음 | 잠실 MICE `2026-04-02`, 국제교류복합지구 `2026-05-04`, 잠실5 `조합설립인가`, 장미 `조합설립인가`, 잠실우성4차 `관리처분인가` 유지 | 잠실축 장기 잠재 유지, 비용·이주·기반시설 리스크 분리 해석 유지 | 잠실우성4차 회신 여부 확인, 장미 direct notice 병목 추적 |
```

## 7. 이 패킷 다음에 볼 문서

1. [analysis/life-area-source-map-and-monitoring-routine.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-source-map-and-monitoring-routine.md)
2. [analysis/focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md)
3. [analysis/life-area-latest-official-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-latest-official-check-guide.md)
4. [analysis/jamsil-songpa-packet-manual-check-2026-06-24.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/jamsil-songpa-packet-manual-check-2026-06-24.md)
5. [analysis/weekly-monitoring-log-2026-06-24.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-log-2026-06-24.md)

## 지금 기준 다음 액션

1. 잠실우성4차 회신 도착 여부 확인
2. 장미1,2,3차 direct notice/recordCode 병목 유지 여부 확인
3. 잠실5단지의 비용·분담금/기반시설 공개 신호 증가 여부 확인
