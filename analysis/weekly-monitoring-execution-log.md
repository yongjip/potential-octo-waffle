# 주간 모니터링 실행 로그

작성 기준: 2026-06-24 KST

이 문서는 `weekly_primary_refresh`를 실제로 돌릴 때 남기는 실행 로그 템플릿이다. 공식 업데이트가 있었는지, 어떤 사업이 영향을 받았는지, 어떤 산출물을 갱신했는지를 한 주 단위로 남긴다.

## 사용 순서

1. [공식 업데이트 실행 런북](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-update-runbook.md) 확인
2. [공식 업데이트 런북 체크리스트](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-update-runbook-checklist.md)로 단계 점검
3. 원격 수집 실행 또는 수동 점검
4. `node scripts/regenerate-research-artifacts.mjs` 실행
5. 가능하면 helper로 새 주 로그를 만든다.
6. 잠실/송파를 먼저 볼 주에는 [jamsil-songpa-weekly-monitoring-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/jamsil-songpa-weekly-monitoring-packet.md)를 먼저 연다.
7. 강남을 먼저 볼 주에는 [gangnam-apgujeong-weekly-monitoring-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/gangnam-apgujeong-weekly-monitoring-packet.md)를 먼저 연다.
8. 구의/광진을 먼저 볼 주에는 [guui-gwangjin-weekly-monitoring-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/guui-gwangjin-weekly-monitoring-packet.md)를 먼저 연다.
9. 확장 관심권까지 같이 볼 주에는 [expansion-zone-monitoring-checklist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-monitoring-checklist.md)를 열어 강동권과 약수권 점검을 분리한다.
10. 확장 관심권 intake를 건드릴 주에는 [expansion-zone-intake-seed-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-intake-seed-board.md)를 열어 새 row 생성인지 기존 row 재사용인지 먼저 정한다.

```bash
node scripts/create-weekly-monitoring-log.mjs \
  --date=YYYY-MM-DD \
  --remote-run=Y \
  --regenerated=Y \
  --source-check='서울도시공간포털 결정고시/열람공고::Y::N::변화 없음' \
  --life-summary='잠실/송파::변화 없음::장기 잠재 유지::잠실역-잠실나루 현장 입력' \
  --expansion-summary='강동권::변화 없음::confirmed 비교 가능 유지::강동구 고시공고와 정보몽땅 최신 문서일 교차 확인' \
  --next-priority='잠실우성4차 회신 여부 확인' \
  --write --refresh
```

11. helper를 쓰지 않을 때만 아래 로그 표를 수동으로 채운다.

현재 기준선 예시는 [weekly-monitoring-log-2026-06-24.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-log-2026-06-24.md)에서 본다.

helper 기본 동작:

- `analysis/focus-project-weekly-monitoring-cockpit.json`에서 생활권과 다음 주 우선 확인 대상을 채운다.
- `analysis/expansion-zone-weekly-monitoring-cockpit.json`에서 강동권·약수동 주변 기본 요약과 다음 액션을 채운다.
- `analysis/high-blocking-filing-tracker.json`에서 외부 회신 대기 3건 현재 상태를 채운다.
- `analysis/official-update-runbook-checklist.json`에서 `weekly_primary_refresh` 명령 기본값을 채운다.
- 확장 관심권을 같이 본 주에는 `analysis/expansion-zone-intake-seed-board.md` 기준으로 `gangdong_district_notice` create / `seoul_urban_notice` reuse / `jung_district_notice` direct hit create를 구분한다.
- `--refresh`를 붙이면 `analysis/weekly-monitoring-history.md`, `analysis/weekly-monitoring-comparison-board.md`, `analysis/life-area-monitoring-board.md`, `analysis/personal-research-home.md`를 같이 갱신한다.
- 기본은 dry-run이며, 같은 날짜 파일이 이미 있으면 `--replace`가 필요하다.

## 주간 점검 헤더

| 항목 | 기록 |
| --- | --- |
| 점검 주간 | YYYY-WW |
| 점검일 | YYYY-MM-DD |
| 점검자 | Codex / user |
| 실행 런북 | weekly_primary_refresh |
| 원격 수집 실행 여부 | Y / N |
| 산출물 재생성 여부 | Y / N |
| 이번 주 핵심 변화 수 |  |

## 1차 공식 출처 점검

| 출처 | 확인 여부 | 변화 유무 | 핵심 메모 |
| --- | --- | --- | --- |
| 서울도시공간포털 결정고시/열람공고 |  |  |  |
| 정비사업 정보몽땅 사업장검색/사업개요 |  |  |  |
| 정비사업 정보몽땅 고시/공고 |  |  |  |
| 정비사업 정보몽땅 조합입찰공고 |  |  |  |
| 자치구 고시공고 |  |  |  |
| 서울시보 |  |  |  |

## 핵심 변화 로그

| 사업/생활권 | 변화 유형 | 공식 출처 | 확인값 | 영향도 | 바로 수정한 파일 |
| --- | --- | --- | --- | --- | --- |
| 예: 잠실우성4차 / 잠실·송파 | 관리처분 공개항목 추가 | 정보몽땅 공개항목 | 공사비/정비사업비 첨부 여부 | high | project-notes/09-tw2w7iwv.md |

허용하는 변화 유형 예시:

- 단계 변경
- 공개자료 수 증가
- 새 고시번호/고시일 확인
- 새 첨부 원문 확보
- 조합입찰공고 신호 증가
- 비용/기반시설 신호 증가
- 외부 회신 도착

## 생활권별 요약

| 생활권 | 이번 주 변화 | 해석 | 다음 행동 |
| --- | --- | --- | --- |
| 강남 |  |  |  |
| 잠실/송파 |  |  |  |
| 구의/광진 |  |  |  |

## 확장 관심권 요약

| 확장권 | 이번 주 변화 | 해석 | 다음 행동 |
| --- | --- | --- | --- |
| 강동권 |  |  |  |
| 약수동 주변 |  |  |  |

## 외부 회신 대기 3건 상태

| 사업 | 지난주 상태 | 이번 주 상태 | 조치 |
| --- | --- | --- | --- |
| 잠실우성4차 |  |  |  |
| 광장동 삼성1차 |  |  |  |
| 자양번영로3나길 |  |  |  |

## 이번 주 수정 파일 체크

- [ ] `project-notes/*.md`
- [ ] `analysis/project-comparison-matrix.md`
- [ ] `analysis/research-status-dashboard.md`
- [ ] `analysis/reassessment-watchlist.md`
- [ ] `analysis/official-update-registry.md`
- [ ] `analysis/transport-location-context.md`

## 실행 명령 기록

```bash
# 원격 수집 또는 수동 확인에 사용한 명령/절차를 적는다.
node scripts/fetch-cleanup-projects.mjs
node scripts/fetch-project-summaries.mjs
node scripts/fetch-cleanup-board-latest.mjs
node scripts/fetch-urban-map-details.mjs
node scripts/fetch-urban-notice-details.mjs --download
node scripts/probe-gangnam-songpa-notices.mjs --download
node scripts/regenerate-research-artifacts.mjs
```

## 이번 주 결론

- 유지:
- 상향 검토:
- 보류:
- 하향 검토:

## 다음 주 우선 확인 대상

1. 
2. 
3. 

## 메모

- 공식 원문이 없는 변화는 `context` 또는 `watch`로만 남긴다.
- 시장 기사나 일반 뉴스는 여기서 확정 신호로 쓰지 않는다.
- 현장 답사 결과가 같이 들어온 주에는 `fieldwork_related`로 구분해 적는다.
