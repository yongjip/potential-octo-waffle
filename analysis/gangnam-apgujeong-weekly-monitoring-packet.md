# 강남·압구정 주간 점검 패킷

작성 기준: 2026-06-24 KST

이 문서는 강남 생활권을 한 주에 한 번 점검할 때 바로 실행하는 패킷이다. 핵심 대상은 `압구정3`이며, `압구정 2·3·4·5구역 재건축` 서울시 아카이브와 압구정아파트지구 관련 공식 고시·공개항목을 같이 본다.

## 목적

- 강남 생활권에서 `입지 프리미엄`이 아니라 `공공기여·높이·기반시설 조건`이 실제로 더 무거워졌는지 확인한다.
- 압구정3의 `단계 기준선`, `입찰공고 신호`, `아파트지구 단위 조건 변화`를 한 번에 다시 본다.
- 변화가 있으면 어느 파일부터 고칠지 바로 결정한다.

## 이 패킷이 다루는 범위

| 구분 | 대상 | 현재 기준선 |
| --- | --- | --- |
| 생활권 context | 서울시 압구정 2·3·4·5구역 재건축 아카이브 | 수정일 `2026-03-25`, 압구정3 정비구역 지정고시 타임라인 `2026-01-22` |
| 대표 사업 | 압구정3 | 조합설립인가, 최신 변경인가 `2026-02-12`, 동의율 `96.53` |
| 공개경계 | 압구정3 `item 200` / `item 202·203·210·213·379` | direct `2026-05-06`, `item 200 목록=1건`, `item 202·203·210·213·379=0건` |
| 조건 해석 | 압구정아파트지구 고시, 지하차도/소방설계/환경영향평가/시공자 선정 공고 | 단계 변화보다는 조건·집행 신호를 읽는 구간 |

## 실행 모드

### A. 수동 15분 점검

1. 서울시 압구정 아카이브 수정일 확인
2. 압구정3 정보몽땅 추진경과 확인
3. 압구정3 `item 200` 직접 공개화면과 `item 200` 목록화면 확인
4. 압구정3 `item 202·203·210·213·379` 목록화면 확인
5. 압구정3 조합입찰공고 최신 3~5건 확인
6. 새 변화가 없으면 `no material change`로 주간 로그에 남김

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

1. [강남구 압구정 2,3,4,5구역 재건축](https://news.seoul.go.kr/citybuild/archives/531576)
2. [압구정3 서울도시공간포털 고시](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202312010004)

### 압구정3

1. [사업장](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=apgujeong3)
2. [사업개요](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680900000675S91&stepSeCode=102&div=sumry)
3. [추진경과](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=680900000675S91&bsnsPk=11680-900000675)
4. [조합입찰공고](https://cleanup.seoul.go.kr/assc/bidpblanc/lscr.do?cafeId=680900000675S91)
5. [서울도시공간포털 고시](https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202312010004)

## 2. 기준선 값

이 값은 `2026-06-24` 기준 로컬 메모와 공식 페이지 실확인 기준선이다.

| 대상 | 기준선 값 |
| --- | --- |
| 압구정 아카이브 | 담당부서 `도시공간본부 신속통합기획과`, 수정일 `2026-03-25` |
| 압구정3 타임라인 | 정비구역 지정고시 `2026-01-22` |
| 압구정3 단계 | 현재단계 `조합설립인가` |
| 압구정3 추진경과 | 최신 변경인가 `2026-02-12`, 동의율 `96.53` |
| 압구정3 공개항목 item 200 direct | 신청 `2025-12-24`, 처리 `2026-05-06`, 동의율 `96.77`, `조합임원 변경 : 7인->11인` |
| 압구정3 공개항목 item 200 list | `전체 1건`, visible row dates `2021-04-19 / 2021-05-04 / 2023-08-21`, 상세/첨부 로그인 차단 |
| 압구정3 공개항목 item 202·203·210·213·379 | 모두 `전체 0건`, `등록된 공개자료가 없습니다.` |
| 압구정3 조합입찰공고 | `시공자 선정을 위한 재입찰 공고 2026-04-10`, `총회 홍보요원 모집 공고 2026-05-05`, `지하차도 설계 용역 공고 2025-12-30` 확인 유지 |
| 압구정3 고시 | 고시번호 `2023-516`, 고시일 `2023-11-23` |

## 3. 변화 판정표

| 대상 | 변화로 인정 | 노이즈 처리 |
| --- | --- | --- |
| 압구정 아카이브 | 수정일 변경 + 압구정3 관련 새 지정고시/조건 링크 추가 | 설명문 문구만 소폭 수정 |
| 압구정3 추진경과 | 사업시행인가/관리처분인가 세부 날짜 등장, 변경인가 값 변화 | 조합설립인가 구간 반복 확인 |
| 압구정3 공개항목 | `item 200` direct 처리일/동의율 변화, `item 200` 목록 건수 증가, `item 202·210·213` 실문서 등장 | `item 202·203·210·213·379=0건` 재확인만 반복 |
| 압구정3 조합입찰공고 | 지하차도, 소방설계, 환경영향평가, 시공자 선정, 공공기여/기반시설 관련 새 공고 추가 | 단순 총회 공지, 일반 홍보, 상급지 기사 |
| 압구정아파트지구 고시 | 새 고시번호, 조건 변경, 공공기여·교통처리 계획 조정 | 아파트지구 수치를 압구정3 개별 확정값으로 곧바로 덮어쓰기 |

## 4. 사업별 체크 질문

### 압구정3

- 최신 변화가 `단계 상승`인지, 아니면 `조건 해석을 더 무겁게 만드는 집행 신호`인지
- 시공자 선정, 지하차도, 소방설계, 환경영향평가 공고가 실제 속도 신호인지 비용 신호인지
- 아파트지구 단위 고시의 조건 변화가 압구정3 장기 가설을 깎는지 유지하는지

## 5. 반영 순서

### 변화 없음

1. `analysis/weekly-monitoring-execution-log.md`
2. 필요하면 `analysis/weekly-monitoring-log-YYYY-MM-DD.md`

추천 문구:

- `강남: no material change. 압구정 아카이브 수정일 2026-03-25 유지, 압구정3 조합설립인가와 최신 변경인가 2026-02-12 기준선 유지`

### 변화 있음

1. 사업별 메모
   - `project-notes/10-apgujeong3.md`
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
| 강남 | 변화 없음/있음 | 압구정 아카이브와 압구정3 재확인 | 생활권 큰 그림 유지/재조정 | 다음 행동 |
```

예시:

```md
| 강남 | 변화 없음 | 압구정 아카이브 `2026-03-25`, 압구정3 `조합설립인가`, 최신 변경인가 `2026-02-12`, 동의율 `96.53` 유지 | 강남은 입지보다 조건 해석 우선이라는 결론 유지 | 압구정3 현장 체감 입력, 기반시설·시공자 선정 신호 계속 감시 |
```

## 7. 이 패킷 다음에 볼 문서

1. [analysis/life-area-source-map-and-monitoring-routine.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-source-map-and-monitoring-routine.md)
2. [analysis/focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md)
3. [analysis/life-area-latest-official-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-latest-official-check-guide.md)

## 지금 기준 다음 액션

1. 압구정3 현장 체감 입력
2. `item 200` 목록 건수와 `item 202·203·210·213·379` 공개경계 변화 여부 확인
3. 시공자 선정·기반시설 관련 조합입찰공고 증가 여부 확인
4. 압구정아파트지구 단위 조건 변경 여부 확인
