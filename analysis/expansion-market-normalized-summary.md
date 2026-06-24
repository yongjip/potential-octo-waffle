# 확장권 시장 정규화 요약

작성 기준: 2026-06-24 KST

확장권 latest-window 수동 다운로드 파일을 정규화한 뒤, dong-level baseline별로 실제 몇 행이 들어왔는지 요약한다. 확장권 latest-window 30개 수동 다운로드 파일이 모두 정규화돼 6개 scope에 값이 들어온 상태다.

## 요약

| 항목 | 값 |
| --- | ---: |
| scope | 6 |
| 정규화 거래 행 | 11530 |
| project match 행 | 0 |
| 값이 들어온 scope | 6 |
| source 분포 | molit-rtms-apt-manual 5299; molit-rtms-rowhouse-manual 3916; seoul-open-data-manual 2315 |

## scope별 상태

| 권역 | 자치구 | 법정동 | 정규화 거래 행 | project match | source 분포 | 월 범위 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 강동권 | 강동구 | 천호동 | 3044 | 0 | molit-rtms-rowhouse-manual 1505; molit-rtms-apt-manual 847; seoul-open-data-manual 692 | 202512~202606 | latest_window_normalized_present |
| 강동권 | 강동구 | 성내동 | 2220 | 0 | molit-rtms-rowhouse-manual 1117; molit-rtms-apt-manual 674; seoul-open-data-manual 429 | 202511~202606 | latest_window_normalized_present |
| 강동권 | 강동구 | 길동 | 1643 | 0 | molit-rtms-apt-manual 861; molit-rtms-rowhouse-manual 473; seoul-open-data-manual 309 | 202512~202606 | latest_window_normalized_present |
| 약수동 주변 | 중구 | 신당동 | 1845 | 0 | molit-rtms-apt-manual 854; molit-rtms-rowhouse-manual 566; seoul-open-data-manual 425 | 202511~202606 | latest_window_normalized_present |
| 약수동 주변 | 성동구 | 금호동 | 1837 | 0 | molit-rtms-apt-manual 1286; seoul-open-data-manual 314; molit-rtms-rowhouse-manual 237 | 202512~202606 | latest_window_normalized_present |
| 약수동 주변 | 성동구 | 옥수동 | 941 | 0 | molit-rtms-apt-manual 777; seoul-open-data-manual 146; molit-rtms-rowhouse-manual 18 | 202512~202606 | latest_window_normalized_present |
