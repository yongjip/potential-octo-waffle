# 확장권 시장 반입 manifest

작성 기준: 2026-06-24 KST

이 문서는 확장권 latest-window 수동 다운로드 파일을 정규화 입력으로 넘기기 위한 task-level ingest manifest다. core 70개 수동 반입 manifest와 분리해서, 현재 내려받은 확장권 raw 파일만 별도 normalize 경로로 보낸다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 반입 행 | 30 |
| 파일 경로 설정 | 30 |
| downloaded_at 기록 | 30 |
| source 분포 | molit-rtms-apt-trade-rent-manual 12; molit-rtms-rowhouse-trade-rent-manual 12; seoul-open-data-real-estate-csv 6 |
| dong 분포 | 금호동 5; 길동 5; 성내동 5; 신당동 5; 옥수동 5; 천호동 5 |

## 반입 대상

| task | source ID | 자치구 | 법정동 | 시작 | 종료 | 파일 | downloaded_at | 대표 기준 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul-open-data-exp-market-gd-cheonho-202601 | seoul-open-data-real-estate-csv | 강동구 | 천호동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_강동구_천호동_202601_202606.csv | 2026-06-24T07:17:32.495Z | 확장권 baseline task seoul-open-data-exp-market-gd-cheonho-202601 |
| molit-apt-trade-exp-market-gd-cheonho-202601 | molit-rtms-apt-trade-rent-manual | 강동구 | 천호동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_강동구_천호동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-apt-trade-exp-market-gd-cheonho-202601 |
| molit-apt-rent-exp-market-gd-cheonho-202601 | molit-rtms-apt-trade-rent-manual | 강동구 | 천호동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_강동구_천호동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-apt-rent-exp-market-gd-cheonho-202601 |
| molit-rowhouse-trade-exp-market-gd-cheonho-202601 | molit-rtms-rowhouse-trade-rent-manual | 강동구 | 천호동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_강동구_천호동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-rowhouse-trade-exp-market-gd-cheonho-202601 |
| molit-rowhouse-rent-exp-market-gd-cheonho-202601 | molit-rtms-rowhouse-trade-rent-manual | 강동구 | 천호동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_강동구_천호동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-rowhouse-rent-exp-market-gd-cheonho-202601 |
| seoul-open-data-exp-market-gd-gildong-202601 | seoul-open-data-real-estate-csv | 강동구 | 길동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_강동구_길동_202601_202606.csv | 2026-06-24T07:17:32.495Z | 확장권 baseline task seoul-open-data-exp-market-gd-gildong-202601 |
| molit-apt-trade-exp-market-gd-gildong-202601 | molit-rtms-apt-trade-rent-manual | 강동구 | 길동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_강동구_길동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-apt-trade-exp-market-gd-gildong-202601 |
| molit-apt-rent-exp-market-gd-gildong-202601 | molit-rtms-apt-trade-rent-manual | 강동구 | 길동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_강동구_길동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-apt-rent-exp-market-gd-gildong-202601 |
| molit-rowhouse-trade-exp-market-gd-gildong-202601 | molit-rtms-rowhouse-trade-rent-manual | 강동구 | 길동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_강동구_길동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-rowhouse-trade-exp-market-gd-gildong-202601 |
| molit-rowhouse-rent-exp-market-gd-gildong-202601 | molit-rtms-rowhouse-trade-rent-manual | 강동구 | 길동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_강동구_길동_202601_202606.csv | 2026-06-24T07:17:52.652Z | 확장권 baseline task molit-rowhouse-rent-exp-market-gd-gildong-202601 |
| seoul-open-data-exp-market-gd-seongnae-202601 | seoul-open-data-real-estate-csv | 강동구 | 성내동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_강동구_성내동_202601_202606.csv | 2026-06-24T07:29:14.039Z | 확장권 baseline task seoul-open-data-exp-market-gd-seongnae-202601 |
| molit-apt-trade-exp-market-gd-seongnae-202601 | molit-rtms-apt-trade-rent-manual | 강동구 | 성내동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_강동구_성내동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-trade-exp-market-gd-seongnae-202601 |
| molit-apt-rent-exp-market-gd-seongnae-202601 | molit-rtms-apt-trade-rent-manual | 강동구 | 성내동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_강동구_성내동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-rent-exp-market-gd-seongnae-202601 |
| molit-rowhouse-trade-exp-market-gd-seongnae-202601 | molit-rtms-rowhouse-trade-rent-manual | 강동구 | 성내동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_강동구_성내동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-trade-exp-market-gd-seongnae-202601 |
| molit-rowhouse-rent-exp-market-gd-seongnae-202601 | molit-rtms-rowhouse-trade-rent-manual | 강동구 | 성내동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_강동구_성내동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-rent-exp-market-gd-seongnae-202601 |
| seoul-open-data-exp-market-ys-sindang-202601 | seoul-open-data-real-estate-csv | 중구 | 신당동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_중구_신당동_202601_202606.csv | 2026-06-24T07:29:14.039Z | 확장권 baseline task seoul-open-data-exp-market-ys-sindang-202601 |
| molit-apt-trade-exp-market-ys-sindang-202601 | molit-rtms-apt-trade-rent-manual | 중구 | 신당동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_중구_신당동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-trade-exp-market-ys-sindang-202601 |
| molit-apt-rent-exp-market-ys-sindang-202601 | molit-rtms-apt-trade-rent-manual | 중구 | 신당동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_중구_신당동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-rent-exp-market-ys-sindang-202601 |
| molit-rowhouse-trade-exp-market-ys-sindang-202601 | molit-rtms-rowhouse-trade-rent-manual | 중구 | 신당동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_중구_신당동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-trade-exp-market-ys-sindang-202601 |
| molit-rowhouse-rent-exp-market-ys-sindang-202601 | molit-rtms-rowhouse-trade-rent-manual | 중구 | 신당동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_중구_신당동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-rent-exp-market-ys-sindang-202601 |
| seoul-open-data-exp-market-ys-geumho-202601 | seoul-open-data-real-estate-csv | 성동구 | 금호동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_성동구_금호동_202601_202606.csv | 2026-06-24T07:29:14.039Z | 확장권 baseline task seoul-open-data-exp-market-ys-geumho-202601 |
| molit-apt-trade-exp-market-ys-geumho-202601 | molit-rtms-apt-trade-rent-manual | 성동구 | 금호동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_성동구_금호동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-trade-exp-market-ys-geumho-202601 |
| molit-apt-rent-exp-market-ys-geumho-202601 | molit-rtms-apt-trade-rent-manual | 성동구 | 금호동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_성동구_금호동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-rent-exp-market-ys-geumho-202601 |
| molit-rowhouse-trade-exp-market-ys-geumho-202601 | molit-rtms-rowhouse-trade-rent-manual | 성동구 | 금호동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_성동구_금호동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-trade-exp-market-ys-geumho-202601 |
| molit-rowhouse-rent-exp-market-ys-geumho-202601 | molit-rtms-rowhouse-trade-rent-manual | 성동구 | 금호동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_성동구_금호동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-rent-exp-market-ys-geumho-202601 |
| seoul-open-data-exp-market-ys-oksu-202601 | seoul-open-data-real-estate-csv | 성동구 | 옥수동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_성동구_옥수동_202601_202606.csv | 2026-06-24T07:29:14.039Z | 확장권 baseline task seoul-open-data-exp-market-ys-oksu-202601 |
| molit-apt-trade-exp-market-ys-oksu-202601 | molit-rtms-apt-trade-rent-manual | 성동구 | 옥수동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_성동구_옥수동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-trade-exp-market-ys-oksu-202601 |
| molit-apt-rent-exp-market-ys-oksu-202601 | molit-rtms-apt-trade-rent-manual | 성동구 | 옥수동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_성동구_옥수동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-apt-rent-exp-market-ys-oksu-202601 |
| molit-rowhouse-trade-exp-market-ys-oksu-202601 | molit-rtms-rowhouse-trade-rent-manual | 성동구 | 옥수동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_성동구_옥수동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-trade-exp-market-ys-oksu-202601 |
| molit-rowhouse-rent-exp-market-ys-oksu-202601 | molit-rtms-rowhouse-trade-rent-manual | 성동구 | 옥수동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_성동구_옥수동_202601_202606.csv | 2026-06-24T07:30:27.224Z | 확장권 baseline task molit-rowhouse-rent-exp-market-ys-oksu-202601 |

## 운영 규칙

1. 이 manifest는 `file_ready_for_review` 상태의 확장권 파일만 반입한다.
2. core ingest-manifest와 섞지 않고 `expansion-ingest-manifest.json`으로 따로 보관한다.
3. 다음 단계는 expansion 전용 normalized 산출물과 scope summary를 갱신하는 것이다.

