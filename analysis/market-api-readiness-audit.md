# 시장 데이터 API 준비도 감사

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실/송파·구의/광진 후보 30개를 실거래·전월세·서울시 실거래 원자료로 연결하기 위한 API 준비 상태를 점검한다. 키가 없는 상태에서도 어떤 쿼리가 막혀 있고, 키를 넣으면 어떤 명령을 실행해야 하는지 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 시장 매핑 사업장 | 30 |
| API 호출 계획 | 690 |
| 수집 가능 계획 | 0 |
| 키 누락 계획 | 690 |
| 원자료 파일 | 0 |
| 정규화 거래 파일 | N |
| 사업장 매칭 거래 파일 | N |
| 시장 원자료 수집 완료 여부 | blocked_or_not_fetched |

## 수집 진단

| 항목 | 값 |
| --- | ---: |
| 진단 생성 | 2026-06-23T05:29:11.300Z |
| 선택 사업장 | 30 |
| 조회 월 | 30 |
| API 계획 | 690 |
| 수집 가능 계획 | 0 |
| 키 누락 계획 | 690 |
| DATA_GO_KR_SERVICE_KEY | missing |
| SEOUL_OPEN_DATA_KEY | missing |

추천 스모크 테스트:

| 테스트 | 명령 |
| --- | --- |
| 국토부 아파트 매매 1개월 스모크 | DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade --ranks=1 --from=202606 --to=202606 --max-pages=1 |
| 국토부 연립/다세대 1개월 스모크 | DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-rowhouse-trade,molit-rowhouse-rent --ranks=25,28 --from=202606 --to=202606 --max-pages=1 |
| 서울 열린데이터 1개월 스모크 | SEOUL_OPEN_DATA_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=seoul-open-data --ranks=1 --from=202606 --to=202606 --max-pages=1 |
| 전체 계획 갱신 | node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606 |


## 수동 다운로드 반입 경로

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | 4 |
| 파일 존재 | 0 |
| 정규화 매핑 준비 | 0 |
| 다운로드 대기 | 4 |
| 컬럼 감사 파싱 가능 파일 | 70 |
| 컬럼 감사 매핑 준비 | 70 |
| 컬럼 감사 상태 분포 | ready_for_normalization_mapping 70 |
| 수동 정규화 거래 행 | 108161 |
| 수동 사업장 매칭 행 | 277066 |
| 수동 지표 행 | 824 |
| 수동 정규화 상태 분포 | normalized 70 |
| 상태 분포 | waiting_for_manual_download 4 |

| ID | 기관 | 자료 | 파일 | 상태 | 다음 액션 |
| --- | --- | --- | --- | --- | --- |
| seoul-open-data-real-estate-csv | 서울특별시 | 서울시 부동산 실거래가 정보 |  | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |
| molit-rtms-apt-trade-rent-manual | 국토교통부 | 아파트 매매·전월세 실거래 원자료 |  | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |
| molit-rtms-rowhouse-trade-rent-manual | 국토교통부 | 연립·다세대 매매·전월세 실거래 원자료 |  | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |
| r-one-price-and-volume-statistics | 한국부동산원 | R-ONE 주택가격동향·공동주택 실거래가격지수·거래현황 |  | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |

### 수동 원자료 컬럼 감사

| ID | 파서 | 컬럼 | 샘플행 | 누락 필드 | 상태 |
| --- | --- | --- | --- | --- | --- |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| seoul-open-data-real-estate-csv | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-apt-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 21 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| molit-rtms-rowhouse-trade-rent-manual | csv | 20 | 50 |  | ready_for_normalization_mapping |
| r-one-price-and-volume-statistics | csv | 16 | 50 |  | ready_for_normalization_mapping |

### 수동 원자료 정규화 감사

| ID | 출력 | 원자료 행 | 정규화 행 | 매칭 행 | 누락 매핑 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| seoul-open-data-real-estate-csv | transactions | 779 | 779 | 779 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 870 | 870 | 870 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 393 | 393 | 393 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 583 | 583 | 2332 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 710 | 710 | 2840 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 264 | 264 | 1056 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 295 | 295 | 1475 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 293 | 293 | 1465 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 92 | 92 | 460 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 479 | 479 | 1437 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 713 | 713 | 2139 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 127 | 127 | 381 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 664 | 664 | 664 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 1200 | 1200 | 1200 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 682 | 682 | 682 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 1315 | 1315 | 6575 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 1691 | 1691 | 8455 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 573 | 573 | 2865 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 503 | 503 | 503 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 795 | 795 | 795 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 683 | 683 | 683 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 150 | 150 | 150 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 363 | 363 | 363 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 271 | 271 | 271 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 952 | 952 | 952 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 1256 | 1256 | 1256 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 646 | 646 | 646 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 729 | 729 | 729 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 699 | 699 | 699 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 425 | 425 | 425 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 413 | 413 | 1239 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 580 | 580 | 1740 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 319 | 319 | 957 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 477 | 477 | 441 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 585 | 585 | 433 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 259 | 259 | 156 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 847 | 847 | 2541 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 1445 | 1445 | 4335 |  | normalized |
| seoul-open-data-real-estate-csv | transactions | 686 | 686 | 2058 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 9040 | 9040 | 23548 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 9487 | 9487 | 26818 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 2967 | 2967 | 8886 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 2839 | 2839 | 11289 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 3793 | 3793 | 15519 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 1297 | 1297 | 5157 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 10067 | 10067 | 20043 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 10311 | 10311 | 20796 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 4013 | 4013 | 7954 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 1418 | 1418 | 4163 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 1511 | 1511 | 4307 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 485 | 485 | 1349 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 1199 | 1199 | 3935 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 2064 | 2064 | 6786 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 507 | 507 | 1339 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 2348 | 2348 | 4295 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 2908 | 2908 | 5572 |  | normalized |
| molit-rtms-apt-trade-rent-manual | transactions | 1163 | 1163 | 2116 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 4318 | 4318 | 13602 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 4199 | 4199 | 13307 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 2134 | 2134 | 6926 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 758 | 758 | 758 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 600 | 600 | 600 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 310 | 310 | 310 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 1021 | 1021 | 3669 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 1363 | 1363 | 4095 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 675 | 675 | 1927 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 104 | 104 | 104 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 278 | 278 | 278 |  | normalized |
| molit-rtms-rowhouse-trade-rent-manual | transactions | 178 | 178 | 178 |  | normalized |
| r-one-price-and-volume-statistics | indicators | 824 | 824 | 0 |  | normalized |


## 출처별 준비도

| 출처 | 필요 키 | 현재 키 | 계획 | 수집가능 | 키누락 | 원자료 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| molit-apt-rent | DATA_GO_KR_SERVICE_KEY | N | 90 | 0 | 90 | 0 | blocked_missing_key |
| molit-apt-trade | DATA_GO_KR_SERVICE_KEY | N | 90 | 0 | 90 | 0 | blocked_missing_key |
| molit-rowhouse-rent | DATA_GO_KR_SERVICE_KEY | N | 60 | 0 | 60 | 0 | blocked_missing_key |
| molit-rowhouse-trade | DATA_GO_KR_SERVICE_KEY | N | 60 | 0 | 60 | 0 | blocked_missing_key |
| seoul-open-data | SEOUL_OPEN_DATA_KEY | N | 390 | 0 | 390 | 0 | blocked_missing_key |

## 생활권별 계획

| 생활권 | 사업장 | API 계획 | 출처 | 상태 |
| --- | --- | --- | --- | --- |
| 강남 | 10 | 150 | seoul-open-data 90; molit-apt-rent 30; molit-apt-trade 30 | missing_env:SEOUL_OPEN_DATA_KEY 90; missing_env:DATA_GO_KR_SERVICE_KEY 60 |
| 구의/광진 | 10 | 240 | seoul-open-data 120; molit-apt-rent 30; molit-apt-trade 30; molit-rowhouse-rent 30; molit-rowhouse-trade 30 | missing_env:DATA_GO_KR_SERVICE_KEY 120; missing_env:SEOUL_OPEN_DATA_KEY 120 |
| 잠실/송파 | 10 | 300 | seoul-open-data 180; molit-apt-rent 30; molit-apt-trade 30; molit-rowhouse-rent 30; molit-rowhouse-trade 30 | missing_env:SEOUL_OPEN_DATA_KEY 180; missing_env:DATA_GO_KR_SERVICE_KEY 120 |

## 산출물 확인

| 파일 | 존재 | 바이트 | 용도 |
| --- | --- | --- | --- |
| data/market/market-fetch-plan.json | Y | 231392 | API 호출 계획 |
| data/market/project-market-areas.json | Y | 64304 | 사업장별 시장 조회 키 |
| data/market/market-fetch-diagnostics.md | Y | 3617 | 키 상태와 스모크 테스트 진단 |
| data/market/market-fetch-diagnostics.json | Y | 11137 | 수집 진단 구조화 원본 |
| analysis/market-manual-import-readiness.md | Y | 3498 | 수동 다운로드 반입 준비도 |
| analysis/market-manual-column-audit.md | Y | 36055 | 수동 원자료 컬럼 감사 |
| analysis/market-manual-normalization-audit.md | Y | 18343 | 수동 원자료 정규화 감사 |
| data/market/manual-import/manifest.json | Y | 2906 | 수동 원자료 manifest |
| data/market/manual-import/column-mapping.json | Y | 4247 | 수동 원자료 컬럼 매핑 |
| data/market/transactions/official-transactions-normalized.csv | N | 0 | 정규화 거래 원자료 |
| data/market/transactions/official-transactions-project-matches.csv | N | 0 | 사업장 키워드 매칭 거래 |
| data/market/transactions/manual-official-transactions-normalized.csv | Y | 50896037 | 수동 반입 거래 정규화 결과 |
| data/market/transactions/manual-official-transactions-project-matches.csv | Y | 167036697 | 수동 반입 거래 사업장 매칭 |
| data/market/indicators/manual-market-indicators-normalized.csv | Y | 422100 | 수동 반입 지역 지표 정규화 결과 |
| data/market/market-fetch-summary.json | N | 0 | 최근 원격 수집 요약 |

## 실행 명령

키 없이 계획만 갱신:

```bash
node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606
```

공공데이터포털 키로 국토부 실거래 수집:

```bash
DATA_GO_KR_SERVICE_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade,molit-apt-rent,molit-rowhouse-trade,molit-rowhouse-rent --from=202401 --to=202606
```

서울 열린데이터광장 키로 서울시 실거래 수집:

```bash
SEOUL_OPEN_DATA_KEY="..." node scripts/fetch-market-raw-data.mjs --fetch --sources=seoul-open-data --from=202601 --to=202606 --max-pages=5
```

## 판정

- `blocked_missing_key`: 환경변수가 없어 실제 원자료 호출 전이다.
- `fetch_ready`: 현재 프로세스에 키가 있어 원격 호출 가능 상태다.
- `raw_data_present`: 적어도 하나 이상의 원자료 응답 파일이 존재한다.
- 시장 원자료가 생긴 뒤에는 `official-transactions-normalized.csv`와 `official-transactions-project-matches.csv`의 행 수를 보고 단지명 키워드를 보정한다.
