# 시장 수동 원자료 정규화 감사

작성 기준: 2026-06-24 KST

수동 다운로드 원자료를 표준 거래/지표 스키마로 옮길 수 있는지 확인하고, 매핑이 가능한 파일은 별도 `manual-*` 산출물로 정규화한다. API 수집 산출물인 `official-transactions-normalized.csv`는 덮어쓰지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | 30 |
| 읽은 원자료 행 | 11530 |
| 정규화 거래 행 | 11530 |
| 사업장 매칭 거래 행 | 0 |
| 정규화 지표 행 | 0 |
| 대기/오류 출처 | 0 |
| 상태 분포 | normalized 30 |

## 출처별 처리

| ID | 출력 | 파일 | 원자료 행 | 정규화 행 | 매칭 행 | 누락 매핑 | 상태 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강동구_천호동_202601_202606.csv | 692 | 692 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_강동구_천호동_202601_202606.csv | 228 | 228 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_강동구_천호동_202601_202606.csv | 619 | 619 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_강동구_천호동_202601_202606.csv | 333 | 333 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_강동구_천호동_202601_202606.csv | 1172 | 1172 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강동구_길동_202601_202606.csv | 309 | 309 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_강동구_길동_202601_202606.csv | 199 | 199 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_강동구_길동_202601_202606.csv | 662 | 662 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_강동구_길동_202601_202606.csv | 78 | 78 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_강동구_길동_202601_202606.csv | 395 | 395 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강동구_성내동_202601_202606.csv | 429 | 429 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_강동구_성내동_202601_202606.csv | 173 | 173 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_강동구_성내동_202601_202606.csv | 501 | 501 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_강동구_성내동_202601_202606.csv | 194 | 194 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_강동구_성내동_202601_202606.csv | 923 | 923 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_중구_신당동_202601_202606.csv | 425 | 425 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_중구_신당동_202601_202606.csv | 224 | 224 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_중구_신당동_202601_202606.csv | 630 | 630 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_중구_신당동_202601_202606.csv | 150 | 150 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_중구_신당동_202601_202606.csv | 416 | 416 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_성동구_금호동_202601_202606.csv | 314 | 314 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_성동구_금호동_202601_202606.csv | 168 | 168 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_성동구_금호동_202601_202606.csv | 1118 | 1118 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_성동구_금호동_202601_202606.csv | 100 | 100 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_성동구_금호동_202601_202606.csv | 137 | 137 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_성동구_옥수동_202601_202606.csv | 146 | 146 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_성동구_옥수동_202601_202606.csv | 129 | 129 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_성동구_옥수동_202601_202606.csv | 648 | 648 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_성동구_옥수동_202601_202606.csv | 5 | 5 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_성동구_옥수동_202601_202606.csv | 13 | 13 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |

## 산출물

- `data/market/transactions/expansion-manual-official-transactions-normalized.csv/json`: 수동 반입 거래 정규화 결과
- `data/market/transactions/expansion-manual-official-transactions-project-matches.csv/json`: 후보 사업장 키워드 1차 매칭 결과
- `data/market/indicators/expansion-manual-market-indicators-normalized.csv/json`: R-ONE 등 지역 지표 정규화 결과

## 운영 규칙

1. `manual-*` 산출물은 검토용이다. 사업장 매칭은 법정동·키워드 기반 1차 필터이므로 수동 검수가 필요하다.
2. API 수집 결과와 합치기 전에는 중복 기간·해제거래·정정거래를 별도로 확인한다.
3. 매핑이 부족하면 `data/market/manual-import/column-mapping.json`의 `column_map`을 채운 뒤 다시 실행한다.
