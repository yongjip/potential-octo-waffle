# 확장권 시장 다운로드 세션 패킷

작성 기준: 2026-06-24 KST

이 문서는 확장권 latest-window 30개 task를 실제 수동 다운로드 세션에서 바로 처리하기 위한 패킷이다. core 70개 시장 intake와 분리해서, 강동권 direct baseline 15개를 먼저 받고 그 다음 약수권 adjacent 10개, 마지막으로 옥수 edge 5개를 처리한다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 최신 window | 202606 |
| intake row | 30 |
| 파일 존재 | 30 |
| 다운로드 대기 | 0 |
| ready | 30 |
| phase 분포 | 1차 direct 최신분 3; 2차 adjacent 최신분 2; 3차 edge 최신분 1 |

## 먼저 열 파일

1. [analysis/expansion-market-first-download-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-first-download-packet.md)
2. [analysis/expansion-market-scope-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-scope-workbook.md)
3. [data/market/manual-import/expansion-download-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/market/manual-import/expansion-download-intake.json)
4. [analysis/expansion-market-download-status.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-status.md)
5. [analysis/life-area-market-reaction-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-market-reaction-brief.md)

## 세션 순서

1. 강동권 direct baseline 3개 dong부터 처리한다.
2. 각 dong마다 서울시 실거래 1개 + RTMS 4개를 같은 자리에서 저장한다.
3. 파일명은 packet의 suggested filename을 그대로 쓴다.
4. 파일명이 다르면 [data/market/manual-import/expansion-download-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/market/manual-import/expansion-download-intake.json)에 local_path를 기록한다.
5. latest-window 30개를 닫은 뒤에만 2024~2025 backfill로 내려간다.

## packet 기준 dong 순서

| 순서 | 패킷 | 자치구 | 법정동 | 대표 기준 |
| --- | --- | --- | --- | --- |
| 1 | 1차 direct 최신분 | 강동구 | 천호동 | 천호3구역 |
| 2 | 1차 direct 최신분 | 강동구 | 길동 | 신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역 |
| 3 | 1차 direct 최신분 | 강동구 | 성내동 | 성내미주아파트 주택재건축정비사업 |
| 4 | 2차 adjacent 최신분 | 중구 | 신당동 | 신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역 |
| 5 | 2차 adjacent 최신분 | 성동구 | 금호동 | 금호 제14-1 주택재개발 정비사업 |
| 6 | 3차 edge 최신분 | 성동구 | 옥수동 | 약수-옥수/한남 경계축 context |

## source entry points

- [서울 열린데이터광장 OA-21275](https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do)
- [국토부 실거래가 공개시스템 자료제공](https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=)

## dong별 체크포인트

### 1. 강동구 천호동

- 패킷: 1차 direct 최신분
- 대표 기준: 천호3구역
- 이번 세션 source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 파일명
  seoul-open-data_강동구_천호동_202601_202606.csv; molit-apt-trade_강동구_천호동_202601_202606.csv; molit-apt-rent_강동구_천호동_202601_202606.csv; molit-rowhouse-trade_강동구_천호동_202601_202606.csv; molit-rowhouse-rent_강동구_천호동_202601_202606.csv
- 확인 질문
  잠실/송파 동측 연장축으로 볼 때 천호동 거래량과 가격 방향이 같은 시기 잠실축과 얼마나 다르게 움직이는가? direct hit 후보 천호3구역 고시 전후 6개월/12개월 baseline 변화가 있는가?
- 주의
  dong-level baseline만 먼저 확보

### 2. 강동구 길동

- 패킷: 1차 direct 최신분
- 대표 기준: 신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역
- 이번 세션 source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 파일명
  seoul-open-data_강동구_길동_202601_202606.csv; molit-apt-trade_강동구_길동_202601_202606.csv; molit-apt-rent_강동구_길동_202601_202606.csv; molit-rowhouse-trade_강동구_길동_202601_202606.csv; molit-rowhouse-rent_강동구_길동_202601_202606.csv
- 확인 질문
  길동역-굽은다리역 배후의 거래층이 잠실 핵심축보다 낮은 체급에서도 안정적으로 유지되는가? 신동아1·2차 최신 고시 시점 전후 baseline에 거래량 변화가 있는가?
- 주의
  신동아1·2차와 길동 43번지 generic 카드를 구분

### 3. 강동구 성내동

- 패킷: 1차 direct 최신분
- 대표 기준: 성내미주아파트 주택재건축정비사업
- 이번 세션 source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 파일명
  seoul-open-data_강동구_성내동_202601_202606.csv; molit-apt-trade_강동구_성내동_202601_202606.csv; molit-apt-rent_강동구_성내동_202601_202606.csv; molit-rowhouse-trade_강동구_성내동_202601_202606.csv; molit-rowhouse-rent_강동구_성내동_202601_202606.csv
- 확인 질문
  올림픽공원 북측-성내동 내부 생활권이 잠실 배후축과 다른 가격 체급으로 움직이는가? 성내미주 기준 재건축 직접 hit가 장기 baseline과 얼마나 괴리되는가?
- 주의
  dong-level baseline만 먼저 확보

### 4. 중구 신당동

- 패킷: 2차 adjacent 최신분
- 대표 기준: 신당 제8구역 주택재개발정비사업; 신당 제9주택재개발정비구역
- 이번 세션 source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 파일명
  seoul-open-data_중구_신당동_202601_202606.csv; molit-apt-trade_중구_신당동_202601_202606.csv; molit-apt-rent_중구_신당동_202601_202606.csv; molit-rowhouse-trade_중구_신당동_202601_202606.csv; molit-rowhouse-rent_중구_신당동_202601_202606.csv
- 확인 질문
  약수역 direct hit가 없는 상태에서 신당동 baseline이 약수-버티고개 경사 생활권의 대조군으로 충분한가? 신당8·9의 고시 기준값 전후에 거래 방향 변화가 있는가?
- 주의
  dong-level baseline만 먼저 확보

### 5. 성동구 금호동

- 패킷: 2차 adjacent 최신분
- 대표 기준: 금호 제14-1 주택재개발 정비사업
- 이번 세션 source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 파일명
  seoul-open-data_성동구_금호동_202601_202606.csv; molit-apt-trade_성동구_금호동_202601_202606.csv; molit-apt-rent_성동구_금호동_202601_202606.csv; molit-rowhouse-trade_성동구_금호동_202601_202606.csv; molit-rowhouse-rent_성동구_금호동_202601_202606.csv
- 확인 질문
  청구역-신금호 연결축을 약수권 보조 corridor로 읽을 때 금호 생활권 거래층은 얼마나 두꺼운가? 금호14-1 기준값은 약수권 direct 후보 부재를 보완하는 대조군으로 충분한가?
- 주의
  금호동1가~4가 포함 여부를 수동 확인

### 6. 성동구 옥수동

- 패킷: 3차 edge 최신분
- 대표 기준: 약수-옥수/한남 경계축 context
- 이번 세션 source 순서: 서울시 실거래 -> 국토부 아파트 매매 -> 국토부 아파트 전월세 -> 국토부 연립·다세대 매매 -> 국토부 연립·다세대 전월세
- 파일명
  seoul-open-data_성동구_옥수동_202601_202606.csv; molit-apt-trade_성동구_옥수동_202601_202606.csv; molit-apt-rent_성동구_옥수동_202601_202606.csv; molit-rowhouse-trade_성동구_옥수동_202601_202606.csv; molit-rowhouse-rent_성동구_옥수동_202601_202606.csv
- 확인 질문
  약수-옥수 경계축이 경사·보행·규제 차이 때문에 신당/금호와 다른 시장 반응을 보이는가? direct 사업장 부재 상태에서 edge context baseline으로 유지할 가치가 있는가?
- 주의
  edge context 비교군으로만 유지


## 세션 후 반영

1. [analysis/expansion-market-download-status.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-status.md)를 다시 생성해 파일 감지 여부를 확인한다.
2. 최신분 30개가 다 닫히면 backfill은 [analysis/expansion-market-first-download-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-first-download-packet.md)의 규칙을 따른다.
3. 수치가 들어와도 사업 단계 판정은 [analysis/expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)와 분리해서 읽는다.

