# 확장권 시장 1차 다운로드 패킷

작성 기준: 2026-06-24 KST

이 문서는 [analysis/expansion-market-scope-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-scope-workbook.md)의 90개 raw task를 바로 실행 가능한 최신 window 우선 패킷으로 압축한 generated 실행표다. 원칙은 단순하다. 강동권 direct baseline을 먼저, 약수권 adjacent baseline을 다음, 옥수 edge context는 마지막에 둔다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 최신 window | 202606 |
| packet row | 6 |
| 최신 window raw task | 30 |
| 1차 direct 최신분 | 3 |
| 2차 adjacent 최신분 | 2 |
| 3차 edge 최신분 | 1 |

현재는 확장권 거래 데이터가 0행이므로, 제일 먼저 닫아야 할 것은 최신 window 202601~202606 baseline이다. 바로 2024~2025부터 거꾸로 다 받지 말고, 최신 6개월분으로 direct/adjacent 반응 유무를 먼저 확인한 뒤 backfill로 내려가는 편이 맞다.

## 패킷 순서

| 순서 | 패킷 | 권역 | 자치구 | 법정동 | 역할 | latest task | 대표 기준 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1차 direct 최신분 | 강동권 | 강동구 | 천호동 | direct_baseline | 5 | 천호3구역 |
| 2 | 1차 direct 최신분 | 강동권 | 강동구 | 길동 | direct_baseline | 5 | 신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역 |
| 3 | 1차 direct 최신분 | 강동권 | 강동구 | 성내동 | direct_baseline | 5 | 성내미주아파트 주택재건축정비사업 |
| 4 | 2차 adjacent 최신분 | 약수동 주변 | 중구 | 신당동 | adjacent_baseline | 5 | 신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역 |
| 5 | 2차 adjacent 최신분 | 약수동 주변 | 성동구 | 금호동 | adjacent_corridor_baseline | 5 | 금호 제14-1 주택재개발 정비사업 |
| 6 | 3차 edge 최신분 | 약수동 주변 | 성동구 | 옥수동 | edge_context_baseline | 5 | 약수-옥수/한남 경계축 context |

## 순서 해석

- 1차는 강동권 천호동-성내동-길동이다. 잠실/송파 동측 연장축과 직접 맞닿아 있어 네 생활권 연구 질문과 가장 가깝다.
- 2차는 약수권 신당동-금호동이다. direct hit는 없지만 adjacent baseline으로 충분히 의미가 있다.
- 3차는 옥수동이다. 아직 project 후보가 아니라 edge context이므로 최신분만 확인하고 보류할 수 있다.

## packet 상세

### 1. 강동구 천호동 (1차 direct 최신분)

- 권역/역할: 강동권 / direct_baseline
- 대표 기준: 천호3구역
- shortlist: 천호3구역
- 최신 window: 202601~202606
- source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 제안 파일명: seoul-open-data_강동구_천호동_202601_202606.csv; molit-apt-trade_강동구_천호동_202601_202606.csv; molit-apt-rent_강동구_천호동_202601_202606.csv; molit-rowhouse-trade_강동구_천호동_202601_202606.csv; molit-rowhouse-rent_강동구_천호동_202601_202606.csv
- 현재 상태: not_in_core_manifest; 정규화 거래 3044행
- 이번에 확인할 질문: 잠실/송파 동측 연장축으로 볼 때 천호동 거래량과 가격 방향이 같은 시기 잠실축과 얼마나 다르게 움직이는가? direct hit 후보 천호3구역 고시 전후 6개월/12개월 baseline 변화가 있는가?
- 주의: dong-level baseline만 먼저 확보
- 수집 후 다음 단계: 수집 후 dong-level 거래량/가격 방향만 먼저 보고, 사업장 단계 해석과 분리 유지

### 2. 강동구 길동 (1차 direct 최신분)

- 권역/역할: 강동권 / direct_baseline
- 대표 기준: 신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역
- shortlist: 신동아1·2차아파트 주택재건축 정비사업; 주택재건축정비구역
- 최신 window: 202601~202606
- source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 제안 파일명: seoul-open-data_강동구_길동_202601_202606.csv; molit-apt-trade_강동구_길동_202601_202606.csv; molit-apt-rent_강동구_길동_202601_202606.csv; molit-rowhouse-trade_강동구_길동_202601_202606.csv; molit-rowhouse-rent_강동구_길동_202601_202606.csv
- 현재 상태: not_in_core_manifest; 정규화 거래 1643행
- 이번에 확인할 질문: 길동역-굽은다리역 배후의 거래층이 잠실 핵심축보다 낮은 체급에서도 안정적으로 유지되는가? 신동아1·2차 최신 고시 시점 전후 baseline에 거래량 변화가 있는가?
- 주의: 신동아1·2차와 길동 43번지 generic 카드를 구분
- 수집 후 다음 단계: 수집 후 dong-level 거래량/가격 방향만 먼저 보고, 사업장 단계 해석과 분리 유지

### 3. 강동구 성내동 (1차 direct 최신분)

- 권역/역할: 강동권 / direct_baseline
- 대표 기준: 성내미주아파트 주택재건축정비사업
- shortlist: 성내미주아파트 주택재건축정비사업
- 최신 window: 202601~202606
- source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 제안 파일명: seoul-open-data_강동구_성내동_202601_202606.csv; molit-apt-trade_강동구_성내동_202601_202606.csv; molit-apt-rent_강동구_성내동_202601_202606.csv; molit-rowhouse-trade_강동구_성내동_202601_202606.csv; molit-rowhouse-rent_강동구_성내동_202601_202606.csv
- 현재 상태: not_in_core_manifest; 정규화 거래 2220행
- 이번에 확인할 질문: 올림픽공원 북측-성내동 내부 생활권이 잠실 배후축과 다른 가격 체급으로 움직이는가? 성내미주 기준 재건축 직접 hit가 장기 baseline과 얼마나 괴리되는가?
- 주의: dong-level baseline만 먼저 확보
- 수집 후 다음 단계: 수집 후 dong-level 거래량/가격 방향만 먼저 보고, 사업장 단계 해석과 분리 유지

### 4. 중구 신당동 (2차 adjacent 최신분)

- 권역/역할: 약수동 주변 / adjacent_baseline
- 대표 기준: 신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역
- shortlist: 신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역
- 최신 window: 202601~202606
- source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 제안 파일명: seoul-open-data_중구_신당동_202601_202606.csv; molit-apt-trade_중구_신당동_202601_202606.csv; molit-apt-rent_중구_신당동_202601_202606.csv; molit-rowhouse-trade_중구_신당동_202601_202606.csv; molit-rowhouse-rent_중구_신당동_202601_202606.csv
- 현재 상태: not_in_core_manifest; 정규화 거래 1845행
- 이번에 확인할 질문: 약수역 direct hit가 없는 상태에서 신당동 baseline이 약수-버티고개 경사 생활권의 대조군으로 충분한가? 신당8·9의 고시 기준값 전후에 거래 방향 변화가 있는가?
- 주의: dong-level baseline만 먼저 확보
- 수집 후 다음 단계: 수집 후 dong-level 거래량/가격 방향만 먼저 보고, 사업장 단계 해석과 분리 유지

### 5. 성동구 금호동 (2차 adjacent 최신분)

- 권역/역할: 약수동 주변 / adjacent_corridor_baseline
- 대표 기준: 금호 제14-1 주택재개발 정비사업
- shortlist: 금호 제14-1 주택재개발 정비사업
- 최신 window: 202601~202606
- source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 제안 파일명: seoul-open-data_성동구_금호동_202601_202606.csv; molit-apt-trade_성동구_금호동_202601_202606.csv; molit-apt-rent_성동구_금호동_202601_202606.csv; molit-rowhouse-trade_성동구_금호동_202601_202606.csv; molit-rowhouse-rent_성동구_금호동_202601_202606.csv
- 현재 상태: not_in_core_manifest; 정규화 거래 1837행
- 이번에 확인할 질문: 청구역-신금호 연결축을 약수권 보조 corridor로 읽을 때 금호 생활권 거래층은 얼마나 두꺼운가? 금호14-1 기준값은 약수권 direct 후보 부재를 보완하는 대조군으로 충분한가?
- 주의: 금호동1가~4가 포함 여부를 수동 확인
- 수집 후 다음 단계: 수집 후 dong-level 거래량/가격 방향만 먼저 보고, 사업장 단계 해석과 분리 유지

### 6. 성동구 옥수동 (3차 edge 최신분)

- 권역/역할: 약수동 주변 / edge_context_baseline
- 대표 기준: 약수-옥수/한남 경계축 context
- shortlist: 없음
- 최신 window: 202601~202606
- source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 제안 파일명: seoul-open-data_성동구_옥수동_202601_202606.csv; molit-apt-trade_성동구_옥수동_202601_202606.csv; molit-apt-rent_성동구_옥수동_202601_202606.csv; molit-rowhouse-trade_성동구_옥수동_202601_202606.csv; molit-rowhouse-rent_성동구_옥수동_202601_202606.csv
- 현재 상태: not_in_core_manifest; 정규화 거래 941행
- 이번에 확인할 질문: 약수-옥수 경계축이 경사·보행·규제 차이 때문에 신당/금호와 다른 시장 반응을 보이는가? direct 사업장 부재 상태에서 edge context baseline으로 유지할 가치가 있는가?
- 주의: edge context 비교군으로만 유지
- 수집 후 다음 단계: 수치가 들어와도 direct/adjacent 승격 없이 context edge 비교군으로만 유지


## 최신 window raw task

| 순서 | source | 자치구 | 법정동 | 기간 | 파일명 |
| --- | --- | --- | --- | --- | --- |
| 1 | seoul-open-data | 강동구 | 천호동 | 202601~202606 | seoul-open-data_강동구_천호동_202601_202606.csv |
| 1 | molit-apt-trade | 강동구 | 천호동 | 202601~202606 | molit-apt-trade_강동구_천호동_202601_202606.csv |
| 1 | molit-apt-rent | 강동구 | 천호동 | 202601~202606 | molit-apt-rent_강동구_천호동_202601_202606.csv |
| 1 | molit-rowhouse-trade | 강동구 | 천호동 | 202601~202606 | molit-rowhouse-trade_강동구_천호동_202601_202606.csv |
| 1 | molit-rowhouse-rent | 강동구 | 천호동 | 202601~202606 | molit-rowhouse-rent_강동구_천호동_202601_202606.csv |
| 2 | seoul-open-data | 강동구 | 길동 | 202601~202606 | seoul-open-data_강동구_길동_202601_202606.csv |
| 2 | molit-apt-trade | 강동구 | 길동 | 202601~202606 | molit-apt-trade_강동구_길동_202601_202606.csv |
| 2 | molit-apt-rent | 강동구 | 길동 | 202601~202606 | molit-apt-rent_강동구_길동_202601_202606.csv |
| 2 | molit-rowhouse-trade | 강동구 | 길동 | 202601~202606 | molit-rowhouse-trade_강동구_길동_202601_202606.csv |
| 2 | molit-rowhouse-rent | 강동구 | 길동 | 202601~202606 | molit-rowhouse-rent_강동구_길동_202601_202606.csv |
| 3 | seoul-open-data | 강동구 | 성내동 | 202601~202606 | seoul-open-data_강동구_성내동_202601_202606.csv |
| 3 | molit-apt-trade | 강동구 | 성내동 | 202601~202606 | molit-apt-trade_강동구_성내동_202601_202606.csv |
| 3 | molit-apt-rent | 강동구 | 성내동 | 202601~202606 | molit-apt-rent_강동구_성내동_202601_202606.csv |
| 3 | molit-rowhouse-trade | 강동구 | 성내동 | 202601~202606 | molit-rowhouse-trade_강동구_성내동_202601_202606.csv |
| 3 | molit-rowhouse-rent | 강동구 | 성내동 | 202601~202606 | molit-rowhouse-rent_강동구_성내동_202601_202606.csv |
| 4 | seoul-open-data | 중구 | 신당동 | 202601~202606 | seoul-open-data_중구_신당동_202601_202606.csv |
| 4 | molit-apt-trade | 중구 | 신당동 | 202601~202606 | molit-apt-trade_중구_신당동_202601_202606.csv |
| 4 | molit-apt-rent | 중구 | 신당동 | 202601~202606 | molit-apt-rent_중구_신당동_202601_202606.csv |
| 4 | molit-rowhouse-trade | 중구 | 신당동 | 202601~202606 | molit-rowhouse-trade_중구_신당동_202601_202606.csv |
| 4 | molit-rowhouse-rent | 중구 | 신당동 | 202601~202606 | molit-rowhouse-rent_중구_신당동_202601_202606.csv |
| 5 | seoul-open-data | 성동구 | 금호동 | 202601~202606 | seoul-open-data_성동구_금호동_202601_202606.csv |
| 5 | molit-apt-trade | 성동구 | 금호동 | 202601~202606 | molit-apt-trade_성동구_금호동_202601_202606.csv |
| 5 | molit-apt-rent | 성동구 | 금호동 | 202601~202606 | molit-apt-rent_성동구_금호동_202601_202606.csv |
| 5 | molit-rowhouse-trade | 성동구 | 금호동 | 202601~202606 | molit-rowhouse-trade_성동구_금호동_202601_202606.csv |
| 5 | molit-rowhouse-rent | 성동구 | 금호동 | 202601~202606 | molit-rowhouse-rent_성동구_금호동_202601_202606.csv |
| 6 | seoul-open-data | 성동구 | 옥수동 | 202601~202606 | seoul-open-data_성동구_옥수동_202601_202606.csv |
| 6 | molit-apt-trade | 성동구 | 옥수동 | 202601~202606 | molit-apt-trade_성동구_옥수동_202601_202606.csv |
| 6 | molit-apt-rent | 성동구 | 옥수동 | 202601~202606 | molit-apt-rent_성동구_옥수동_202601_202606.csv |
| 6 | molit-rowhouse-trade | 성동구 | 옥수동 | 202601~202606 | molit-rowhouse-trade_성동구_옥수동_202601_202606.csv |
| 6 | molit-rowhouse-rent | 성동구 | 옥수동 | 202601~202606 | molit-rowhouse-rent_성동구_옥수동_202601_202606.csv |

## backfill 규칙

| 순서 | 법정동 | 후속 기간 | 후속 task | 규칙 |
| --- | --- | --- | --- | --- |
| 1 | 천호동 | 202401~202412; 202501~202512 | 10 | 최신분 확인 후 historic backfill 진행 |
| 2 | 길동 | 202401~202412; 202501~202512 | 10 | 최신분 확인 후 historic backfill 진행 |
| 3 | 성내동 | 202401~202412; 202501~202512 | 10 | 최신분 확인 후 historic backfill 진행 |
| 4 | 신당동 | 202401~202412; 202501~202512 | 10 | 최신분 확인 후 historic backfill 진행 |
| 5 | 금호동 | 202401~202412; 202501~202512 | 10 | 최신분 확인 후 historic backfill 진행 |
| 6 | 옥수동 | 202401~202412; 202501~202512 | 10 | latest window 확인 후에도 필요할 때만 backfill |

## 같이 열 파일

1. [analysis/expansion-market-scope-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-scope-workbook.md)
2. [analysis/life-area-market-reaction-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-market-reaction-brief.md)
3. [analysis/expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)
4. [analysis/current-research-operating-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/current-research-operating-guide.md)

