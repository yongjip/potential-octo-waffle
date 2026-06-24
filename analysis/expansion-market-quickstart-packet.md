# 확장권 시장 quickstart 패킷

작성 기준: 2026-06-24 KST

이 문서는 확장권 latest-window 30개 중 첫 세션에서 바로 닫을 10개 task만 따로 뽑은 실행 패킷이다. 범위는 packet rank 1~2, 즉 강동구 천호동과 길동이다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| latest window | 202606 |
| quickstart dong | 2 |
| quickstart task | 10 |
| 파일 존재 | 10 |
| 다운로드 대기 | 0 |
| ready | 10 |

## 먼저 열 파일

1. [analysis/expansion-market-download-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-session-packet.md)
2. [analysis/expansion-market-download-status.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-status.md)
3. [data/market/manual-import/expansion-download-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/market/manual-import/expansion-download-intake.json)
4. [analysis/expansion-market-first-download-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-first-download-packet.md)

## 이번 세션 범위

| 순서 | 패킷 | 자치구 | 법정동 | 대표 기준 | 주의 |
| --- | --- | --- | --- | --- | --- |
| 1 | 1차 direct 최신분 | 강동구 | 천호동 | 천호3구역 | dong-level baseline만 먼저 확보 |
| 2 | 1차 direct 최신분 | 강동구 | 길동 | 신동아1·2차아파트 주택재건축 정비사업; 길동 신동아3차아파트 주택재건축 정비구역 | 신동아1·2차와 길동 43번지 generic 카드를 구분 |

## 작업 목록

| 순서 | source | 자치구 | 법정동 | 범위 | 권장 파일명 | 필터 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | seoul-open-data | 강동구 | 천호동 | 202601~202606 | seoul-open-data_강동구_천호동_202601_202606.csv | 신고년도=2026; 자치구=강동구; 법정동 필터=법정동=천호동 |
| 1 | molit-apt-trade | 강동구 | 천호동 | 202601~202606 | molit-apt-trade_강동구_천호동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=천호동 |
| 1 | molit-apt-rent | 강동구 | 천호동 | 202601~202606 | molit-apt-rent_강동구_천호동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=천호동 |
| 1 | molit-rowhouse-trade | 강동구 | 천호동 | 202601~202606 | molit-rowhouse-trade_강동구_천호동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=천호동 |
| 1 | molit-rowhouse-rent | 강동구 | 천호동 | 202601~202606 | molit-rowhouse-rent_강동구_천호동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=천호동 |
| 2 | seoul-open-data | 강동구 | 길동 | 202601~202606 | seoul-open-data_강동구_길동_202601_202606.csv | 신고년도=2026; 자치구=강동구; 법정동 필터=법정동=길동 |
| 2 | molit-apt-trade | 강동구 | 길동 | 202601~202606 | molit-apt-trade_강동구_길동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=길동 |
| 2 | molit-apt-rent | 강동구 | 길동 | 202601~202606 | molit-apt-rent_강동구_길동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=길동 |
| 2 | molit-rowhouse-trade | 강동구 | 길동 | 202601~202606 | molit-rowhouse-trade_강동구_길동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=길동 |
| 2 | molit-rowhouse-rent | 강동구 | 길동 | 202601~202606 | molit-rowhouse-rent_강동구_길동_202601_202606.csv | LAWD_CD=11740; 계약년월=202601~202606; 법정동 baseline=길동 |

## 실행 명령

### 1. 서울시 실거래 dry-run

```bash
node scripts/fetch-seoul-open-data-manual-tasks.mjs --tasks-file=analysis/expansion-market-first-download-packet.json --tasks-key=latestTaskRows --intake=data/market/manual-import/expansion-download-intake.json --file-dir=data/market/manual-import/files --years=2026 --task-ids=seoul-open-data-exp-market-gd-cheonho-202601,seoul-open-data-exp-market-gd-gildong-202601 --dry-run
```

### 2. 서울시 실거래 실행

```bash
node scripts/fetch-seoul-open-data-manual-tasks.mjs --tasks-file=analysis/expansion-market-first-download-packet.json --tasks-key=latestTaskRows --intake=data/market/manual-import/expansion-download-intake.json --file-dir=data/market/manual-import/files --years=2026 --task-ids=seoul-open-data-exp-market-gd-cheonho-202601,seoul-open-data-exp-market-gd-gildong-202601
```

### 3. 국토부 RTMS dry-run

```bash
node scripts/fetch-rtms-manual-tasks.mjs --tasks-file=analysis/expansion-market-first-download-packet.json --tasks-key=latestTaskRows --intake=data/market/manual-import/expansion-download-intake.json --file-dir=data/market/manual-import/files --years=2026 --task-ids=molit-apt-trade-exp-market-gd-cheonho-202601,molit-apt-rent-exp-market-gd-cheonho-202601,molit-rowhouse-trade-exp-market-gd-cheonho-202601,molit-rowhouse-rent-exp-market-gd-cheonho-202601,molit-apt-trade-exp-market-gd-gildong-202601,molit-apt-rent-exp-market-gd-gildong-202601,molit-rowhouse-trade-exp-market-gd-gildong-202601,molit-rowhouse-rent-exp-market-gd-gildong-202601 --dry-run
```

### 4. 국토부 RTMS 실행

```bash
node scripts/fetch-rtms-manual-tasks.mjs --tasks-file=analysis/expansion-market-first-download-packet.json --tasks-key=latestTaskRows --intake=data/market/manual-import/expansion-download-intake.json --file-dir=data/market/manual-import/files --years=2026 --task-ids=molit-apt-trade-exp-market-gd-cheonho-202601,molit-apt-rent-exp-market-gd-cheonho-202601,molit-rowhouse-trade-exp-market-gd-cheonho-202601,molit-rowhouse-rent-exp-market-gd-cheonho-202601,molit-apt-trade-exp-market-gd-gildong-202601,molit-apt-rent-exp-market-gd-gildong-202601,molit-rowhouse-trade-exp-market-gd-gildong-202601,molit-rowhouse-rent-exp-market-gd-gildong-202601
```

### 5. 상태표 재생성

```bash
node scripts/generate-expansion-market-download-session-packet.mjs
```


## 세션 후 확인

1. [analysis/expansion-market-download-status.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-status.md)에서 천호동/길동 10개 task 상태가 `file_ready_for_review` 또는 최소한 `download_date_missing`로 바뀌는지 확인한다.
2. 파일명이 다르면 [data/market/manual-import/expansion-download-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/market/manual-import/expansion-download-intake.json)에 `local_path`를 채운다.
3. 10개가 닫히면 성내동 5개를 다음 세션으로 넘긴다.

