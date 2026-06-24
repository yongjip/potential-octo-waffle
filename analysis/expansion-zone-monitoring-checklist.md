# 확장 관심권 모니터링 체크리스트

작성 기준: 2026-06-24 KST

이 문서는 강동권과 약수동 주변 확장 관심권을 주간 점검 루프로 실제 실행할 때 쓰는 체크리스트다. 핵심 3생활권 주간 점검과 분리해서, 강동권은 단계 공백을 줄이고 약수권은 confirmed 기준값과 direct hit 탐색을 유지하는 데 초점을 둔다.

## 요약

- 권역 수: 2
- 체크리스트 단계: 8
- 강동권 단계: 3
- 약수권 단계: 3
- 수동 웹 점검 단계: 1

## 기준 권역

| 권역 | 현재 상태 | 이번 점검 초점 | 대표 사업 | 다음 점검일 | 가장 먼저 할 일 |
| --- | --- | --- | --- | --- | --- |
| 강동권 | confirmed 비교 가능 | 최신 단계 재확인 | 천호3구역; 신동아1·2차; 성내미주 | 2026-07-01 KST | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 |
| 약수동 주변 | confirmed 비교 가능 | 약수역 direct hit 탐색 | 신당8; 신당9; 금호14-1 | 2026-07-01 KST | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 |

## 실행 순서

| 순서 | 권역 | 유형 | 액션 | 명령/절차 | 확인 결과 |
| --- | --- | --- | --- | --- | --- |
| 1 | 공통 | read | 확장권 상위 비교판과 최신 확인 가이드를 먼저 연다. | 문서 확인 | 이번 주에 강동권 루프를 탈지, 약수권 루프를 탈지 결정 |
| 2 | 공통 | manual_web | official-update-runbook의 expansion_zone_latest_check 원격 단계를 따라 정비사업구역계 진입 페이지 검색까지 수동 확인한다. | 수동 검색: 강동구 고시공고, 중구 고시공고, 정비사업 정보몽땅 사업장검색/공개자료, 서울도시공간포털 정비사업구역계 진입 페이지(PMNU4030600001) 검색 + noticeCode 식별자 대조 -> 결과를 data/review/official-update-intake.json 또는 data/review/official-source-activation-intake.json에 기록 | 자치구 고시공고/정보몽땅/정비사업구역계 진입 페이지 최신 결과 |
| 3 | 강동권 | review | 강동권 추적 보드에서 최신 단계 공백 2건을 먼저 본다. | 문서 확인 | 천호3구역; 신동아1·2차; 성내미주 |
| 4 | 강동권 | decision | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 | 수동 판정 + intake 기록 | latest_stage_gap 해소 여부 |
| 5 | 강동권 | followup_local | 필요한 파일을 갱신한 뒤 재생성 체인을 돈다. | node scripts/generate-expansion-zone-monitoring-checklist.mjs -> node scripts/generate-expansion-zone-intake-seed-board.mjs -> node scripts/regenerate-research-artifacts.mjs | 확장권 최신 변화가 상위 비교판에 반영됨 |
| 6 | 약수동 주변 | review | 약수권 재대조 보드에서 confirmed 기준값 3건을 유지할지 먼저 본다. | 문서 확인 | 신당8; 신당9; 금호14-1 |
| 7 | 약수동 주변 | decision | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 | 수동 판정 + intake 기록 | direct hit 발생 여부 / confirmed 유지 여부 |
| 8 | 약수동 주변 | followup_local | 필요한 파일을 갱신한 뒤 재생성 체인을 돈다. | node scripts/generate-expansion-zone-monitoring-checklist.mjs -> node scripts/generate-expansion-zone-intake-seed-board.mjs -> node scripts/regenerate-research-artifacts.mjs | 확장권 최신 변화가 상위 비교판에 반영됨 |

## 권역별 먼저 열 파일

### 강동권

[expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)<br>[expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)<br>[expansion-official-latest-check-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-official-latest-check-audit.md)<br>[expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md)<br>[expansion-interest-zone-shortlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-shortlist.md)<br>[life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)<br>[life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)

- 이번 점검 초점: 최신 단계 재확인
- 이번 점검 규칙: 강동권은 값 confirmed와 최신 단계 재확인을 분리하고 gangdong_district_notice 새 row를 만든다. 약수권은 confirmed snapshot 3건을 유지하되, 신당8·신당9는 기존 seoul_urban_notice row를 재사용하고 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수역 direct hit가 생기기 전에는 adjacent 대조군으로만 읽는다.
- activation 상태: active
- 메모: 2026-06-24 KST 기준 강동권 수동 감시 루프를 운영 상태로 전환. 서울도시공간포털 정비사업구역계(PMNU4030600001) 검색에서 천호3구역 direct hit 1건을 다시 확인했고, noticeCode direct popup은 차단되어 진입 페이지+식별자 병행 방식으로 유지한다. 같은 날짜 강동구 공식 검색 재확인 기준 천호3는 2026-01-28/2026-04-15 공식 공고까지 닫혔지만, 성내미주는 direct 최신 hit이 구보제1341호(2016-08-24)와 구보제1235호(2014-09-23)에 머물고 `이전고시`, `준공인가` direct hit은 새로 확인되지 않았다. 추가로 정보몽땅 청산위원회 자료열람 live JSON/HTML 기준 성내미주의 대분류는 `공통사항(382)`, `청산(381)`이고 실제 소분류는 `조합청산(222)` 1건뿐이며 direct 공개 page는 `등록된 공개자료가 없습니다.` 상태다. 최신 단계 기준선과 재확인 우선순위는 analysis/expansion-gangdong-stage-watch-board.md 및 analysis/expansion-official-latest-check-audit.md 기준으로 관리한다. 다음 점검은 강동구 고시공고 최신 공고일과 정보몽땅 공개자료 최근 문서일, 그리고 `조합청산(222)` 공개자료 등록 여부를 교차 확인.

### 약수동 주변

[expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)<br>[expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)<br>[expansion-official-latest-check-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-official-latest-check-audit.md)<br>[expansion-yaksu-ocr-recheck-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-yaksu-ocr-recheck-board.md)<br>[expansion-interest-zone-shortlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-shortlist.md)<br>[life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)<br>[life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)

- 이번 점검 초점: 약수역 direct hit 탐색
- 이번 점검 규칙: 강동권은 값 confirmed와 최신 단계 재확인을 분리하고 gangdong_district_notice 새 row를 만든다. 약수권은 confirmed snapshot 3건을 유지하되, 신당8·신당9는 기존 seoul_urban_notice row를 재사용하고 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수역 direct hit가 생기기 전에는 adjacent 대조군으로만 읽는다.
- activation 상태: active
- 메모: 2026-06-24 KST 기준 약수권 수동 감시 루프를 운영 상태로 전환. 서울도시공간포털 정비사업구역계(PMNU4030600001) 검색에서 약수역 direct hit 0건을 다시 확인했고 adjacent baseline 유지로 판정했다. noticeCode direct popup은 차단되어 진입 페이지+식별자 병행 방식으로 유지한다. 현재 기준선과 재탐색 규칙은 analysis/expansion-yaksu-ocr-recheck-board.md 및 analysis/expansion-official-latest-check-audit.md 기준으로 관리한다. 다음 점검은 중구 고시공고와 정보몽땅에서 약수역 생활권 direct hit 발생 여부를 재확인.


## 기록 규칙

1. 수동 검색 결과는 `data/review/official-source-activation-intake.json` 또는 `official-update-intake`에 먼저 남긴다.
2. 강동권 변화는 `expansion-gangdong-stage-watch-board`를 먼저 고친다.
3. 약수권 변화는 `expansion-yaksu-ocr-recheck-board`와 `expansion-interest-zone-shortlist`를 먼저 고친다.
4. 마지막에 `node scripts/regenerate-research-artifacts.mjs`로 상위 비교판을 갱신한다.

