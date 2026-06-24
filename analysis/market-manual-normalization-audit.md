# 시장 수동 원자료 정규화 감사

작성 기준: 2026-06-24 KST

수동 다운로드 원자료를 표준 거래/지표 스키마로 옮길 수 있는지 확인하고, 매핑이 가능한 파일은 별도 `manual-*` 산출물로 정규화한다. API 수집 산출물인 `official-transactions-normalized.csv`는 덮어쓰지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | 70 |
| 읽은 원자료 행 | 108985 |
| 정규화 거래 행 | 108161 |
| 사업장 매칭 거래 행 | 277066 |
| 정규화 지표 행 | 824 |
| 대기/오류 출처 | 0 |
| 상태 분포 | normalized 70 |

## 출처별 처리

| ID | 출력 | 파일 | 원자료 행 | 정규화 행 | 매칭 행 | 누락 매핑 | 상태 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_개포동_202401_202412.csv | 779 | 779 | 779 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_개포동_202501_202512.csv | 870 | 870 | 870 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_개포동_202601_202606.csv | 393 | 393 | 393 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_대치동_202401_202412.csv | 583 | 583 | 2332 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_대치동_202501_202512.csv | 710 | 710 | 2840 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_대치동_202601_202606.csv | 264 | 264 | 1056 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202401_202412.csv | 295 | 295 | 1475 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202501_202512.csv | 293 | 293 | 1465 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202601_202606.csv | 92 | 92 | 460 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_광장동_202401_202412.csv | 479 | 479 | 1437 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_광장동_202501_202512.csv | 713 | 713 | 2139 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_광장동_202601_202606.csv | 127 | 127 | 381 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_구의동_202401_202412.csv | 664 | 664 | 664 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_구의동_202501_202512.csv | 1200 | 1200 | 1200 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_구의동_202601_202606.csv | 682 | 682 | 682 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_자양동_202401_202412.csv | 1315 | 1315 | 6575 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_자양동_202501_202512.csv | 1691 | 1691 | 8455 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_자양동_202601_202606.csv | 573 | 573 | 2865 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202401_202412.csv | 503 | 503 | 503 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202501_202512.csv | 795 | 795 | 795 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202601_202606.csv | 683 | 683 | 683 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_마천동_202401_202412.csv | 150 | 150 | 150 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_마천동_202501_202512.csv | 363 | 363 | 363 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_마천동_202601_202606.csv | 271 | 271 | 271 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_문정동_202401_202412.csv | 952 | 952 | 952 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_문정동_202501_202512.csv | 1256 | 1256 | 1256 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_문정동_202601_202606.csv | 646 | 646 | 646 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_방이동_202401_202412.csv | 729 | 729 | 729 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_방이동_202501_202512.csv | 699 | 699 | 699 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_방이동_202601_202606.csv | 425 | 425 | 425 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_송파동_202401_202412.csv | 413 | 413 | 1239 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_송파동_202501_202512.csv | 580 | 580 | 1740 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_송파동_202601_202606.csv | 319 | 319 | 957 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_신천동_202401_202412.csv | 477 | 477 | 441 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_신천동_202501_202512.csv | 585 | 585 | 433 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_신천동_202601_202606.csv | 259 | 259 | 156 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202401_202412.csv | 847 | 847 | 2541 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202501_202512.csv | 1445 | 1445 | 4335 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| seoul-open-data-real-estate-csv | transactions | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202601_202606.csv | 686 | 686 | 2058 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202401_202412.csv | 9040 | 9040 | 23548 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202501_202512.csv | 9487 | 9487 | 26818 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202601_202606.csv | 2967 | 2967 | 8886 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202401_202412.csv | 2839 | 2839 | 11289 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202501_202512.csv | 3793 | 3793 | 15519 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202601_202606.csv | 1297 | 1297 | 5157 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202401_202412.csv | 10067 | 10067 | 20043 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202501_202512.csv | 10311 | 10311 | 20796 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202601_202606.csv | 4013 | 4013 | 7954 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202401_202412.csv | 1418 | 1418 | 4163 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202501_202512.csv | 1511 | 1511 | 4307 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202601_202606.csv | 485 | 485 | 1349 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202401_202412.csv | 1199 | 1199 | 3935 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202501_202512.csv | 2064 | 2064 | 6786 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202601_202606.csv | 507 | 507 | 1339 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202401_202412.csv | 2348 | 2348 | 4295 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202501_202512.csv | 2908 | 2908 | 5572 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-apt-trade-rent-manual | transactions | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202601_202606.csv | 1163 | 1163 | 2116 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202401_202412.csv | 4318 | 4318 | 13602 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202501_202512.csv | 4199 | 4199 | 13307 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202601_202606.csv | 2134 | 2134 | 6926 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202401_202412.csv | 758 | 758 | 758 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202501_202512.csv | 600 | 600 | 600 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202601_202606.csv | 310 | 310 | 310 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202401_202412.csv | 1021 | 1021 | 3669 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202501_202512.csv | 1363 | 1363 | 4095 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202601_202606.csv | 675 | 675 | 1927 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202401_202412.csv | 104 | 104 | 104 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202501_202512.csv | 278 | 278 | 278 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| molit-rtms-rowhouse-trade-rent-manual | transactions | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202601_202606.csv | 178 | 178 | 178 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |
| r-one-price-and-volume-statistics | indicators | data/market/manual-import/files/r-one-statistics_서울-권역-자치구_2024-01_2026-06.csv | 824 | 824 | 0 |  | normalized | 샘플 행과 사업장 매칭 결과 수동 검수 |

## 산출물

- `data/market/transactions/manual-official-transactions-normalized.csv/json`: 수동 반입 거래 정규화 결과
- `data/market/transactions/manual-official-transactions-project-matches.csv/json`: 후보 사업장 키워드 1차 매칭 결과
- `data/market/indicators/manual-market-indicators-normalized.csv/json`: R-ONE 등 지역 지표 정규화 결과

## 운영 규칙

1. `manual-*` 산출물은 검토용이다. 사업장 매칭은 법정동·키워드 기반 1차 필터이므로 수동 검수가 필요하다.
2. API 수집 결과와 합치기 전에는 중복 기간·해제거래·정정거래를 별도로 확인한다.
3. 매핑이 부족하면 `data/market/manual-import/column-mapping.json`의 `column_map`을 채운 뒤 다시 실행한다.
