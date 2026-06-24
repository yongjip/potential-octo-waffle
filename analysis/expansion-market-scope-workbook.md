# 확장권 시장 scope 워크북

작성 기준: 2026-06-24 KST

이 문서는 강동권과 약수동 주변을 core market chain에 바로 합치지 않고, 별도 시장 scope로 먼저 닫기 위한 generated workbook이다. 공식 원문과 최신 단계 판정이 우선이고, 여기의 시장 범위는 생활권 baseline 비교를 위한 보조 장치다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 권역 | 2 |
| 법정동 scope | 6 |
| shortlist 연결 scope | 5 |
| context-only scope | 1 |
| 현재 core manifest 법정동 | 13 |
| 확장권이 이미 core manifest에 들어간 수 | 0 |
| 확장권 정규화 거래 행 | 11530 |
| 제안 download task | 90 |
| 최신 window | 202606 |
| 최신 window task | 30 |

현재 상태는 분명하다. 확장권 6개 법정동 scope는 모두 latest-window 정규화 거래가 들어온 상태지만, 아직 core manifest에는 편입하지 않았다. 따라서 바로 생활권 점수화로 합치지 말고, [analysis/expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)와 [analysis/expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)로 공식 단계·원문을 먼저 관리하면서, 시장 시그널은 분리 scope baseline으로만 읽는 것이 맞다.

## 법정동 scope

| 권역 | 자치구 | 법정동 | 역할 | 대표 기준 | shortlist | 현재 core manifest | 정규화 거래 행 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 강동권 | 강동구 | 천호동 | direct_baseline | 천호3구역 | 1 | not_in_core_manifest | 3044 |
| 강동권 | 강동구 | 성내동 | direct_baseline | 성내미주아파트 주택재건축정비사업 | 1 | not_in_core_manifest | 2220 |
| 강동권 | 강동구 | 길동 | direct_baseline | 신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역 | 2 | not_in_core_manifest | 1643 |
| 약수동 주변 | 중구 | 신당동 | adjacent_baseline | 신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역 | 2 | not_in_core_manifest | 1845 |
| 약수동 주변 | 성동구 | 금호동 | adjacent_corridor_baseline | 금호 제14-1 주택재개발 정비사업 | 1 | not_in_core_manifest | 1837 |
| 약수동 주변 | 성동구 | 옥수동 | edge_context_baseline | 약수-옥수/한남 경계축 context | 0 | not_in_core_manifest | 941 |

## source/window 요약

| source | 공식 출처 | task | 자치구 | 법정동 | 기간 |
| --- | --- | --- | --- | --- | --- |
| seoul-open-data | 서울시 실거래 전체 원자료 | 18 | 강동구; 중구; 성동구 | 천호동; 성내동; 길동; 신당동; 금호동; 옥수동 | 202401~202412; 202501~202512; 202601~202606 |
| molit-apt-trade | 국토부 아파트 매매 | 18 | 강동구; 중구; 성동구 | 천호동; 성내동; 길동; 신당동; 금호동; 옥수동 | 202401~202412; 202501~202512; 202601~202606 |
| molit-apt-rent | 국토부 아파트 전월세 | 18 | 강동구; 중구; 성동구 | 천호동; 성내동; 길동; 신당동; 금호동; 옥수동 | 202401~202412; 202501~202512; 202601~202606 |
| molit-rowhouse-trade | 국토부 연립·다세대 매매 | 18 | 강동구; 중구; 성동구 | 천호동; 성내동; 길동; 신당동; 금호동; 옥수동 | 202401~202412; 202501~202512; 202601~202606 |
| molit-rowhouse-rent | 국토부 연립·다세대 전월세 | 18 | 강동구; 중구; 성동구 | 천호동; 성내동; 길동; 신당동; 금호동; 옥수동 | 202401~202412; 202501~202512; 202601~202606 |

## 해석 규칙

- 천호동·성내동·길동은 강동권 direct baseline이다. 잠실/송파 동측 연장축 비교용이지, 개별 사업장 가격을 확정하는 자료가 아니다.
- 신당동·금호동·옥수동은 약수권 adjacent 또는 edge baseline이다. 약수 direct hit가 없는 상태에서는 대조군으로만 읽는다.
- 금호동은 실거래 원자료에서 금호동1가~4가로 갈라질 수 있으므로 exact dong처럼 가정하지 않는다.
- 옥수동은 아직 official shortlist direct hit가 아니라 context edge다. 수치가 들어와도 규제·보행 비교군으로만 유지한다.

## 다음 순서

1. [analysis/expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)와 [analysis/expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)로 공식 단계 공백을 먼저 관리한다.
2. 시장 원자료는 [analysis/market-manual-download-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/market-manual-download-workbook.md)와 분리해서 이 workbook 기준으로만 모은다.
3. latest-window 정규화가 끝났으므로 [analysis/expansion-market-normalized-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-normalized-summary.md)와 [analysis/expansion-market-signal-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-signal-summary.md)를 함께 보면서 권역·법정동 baseline을 읽는다.
4. core chain 편입 전에는 [analysis/life-area-market-reaction-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-market-reaction-brief.md)의 확장권 상태를 분리 scope baseline 커버 완료로만 읽고, 공식 단계 재확인과 backfill 해석을 분리한다.

