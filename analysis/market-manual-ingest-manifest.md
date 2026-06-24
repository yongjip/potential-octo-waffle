# 시장 원자료 수동 반입 manifest

작성 기준: 2026-06-24 KST

이 문서는 4개 출처 단위 `manifest.json`과 70개 작업 단위 다운로드 상태를 합쳐 컬럼 감사/정규화가 실제로 읽을 반입 manifest를 만든다. 작업별 권장 파일명으로 저장된 파일이 있으면 task-level 행을 우선 사용하고, 아직 작업별 파일이 없으면 기존 source-level manifest를 그대로 유지한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 반입 행 | 70 |
| 작업별 파일 행 | 70 |
| 출처 manifest 행 | 0 |
| 파일 경로 설정 | 70 |
| downloaded_at 누락 | 0 |
| 범위 분포 | download_task 70 |

## 반입 대상

| 반입 ID | 범위 | 작업 | 자료 | 자치구 | 법정동 | 시작 | 종료 | 파일 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| task-seoul-open-data-01 | download_task | seoul-open-data-01 | 서울시 실거래 전체 원자료 | 강남구 | 개포동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_강남구_개포동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-02 | download_task | seoul-open-data-02 | 서울시 실거래 전체 원자료 | 강남구 | 개포동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_강남구_개포동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-03 | download_task | seoul-open-data-03 | 서울시 실거래 전체 원자료 | 강남구 | 개포동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_강남구_개포동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-04 | download_task | seoul-open-data-04 | 서울시 실거래 전체 원자료 | 강남구 | 대치동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_강남구_대치동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-05 | download_task | seoul-open-data-05 | 서울시 실거래 전체 원자료 | 강남구 | 대치동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_강남구_대치동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-06 | download_task | seoul-open-data-06 | 서울시 실거래 전체 원자료 | 강남구 | 대치동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_강남구_대치동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-07 | download_task | seoul-open-data-07 | 서울시 실거래 전체 원자료 | 강남구 | 압구정동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-08 | download_task | seoul-open-data-08 | 서울시 실거래 전체 원자료 | 강남구 | 압구정동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-09 | download_task | seoul-open-data-09 | 서울시 실거래 전체 원자료 | 강남구 | 압구정동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-10 | download_task | seoul-open-data-10 | 서울시 실거래 전체 원자료 | 광진구 | 광장동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_광진구_광장동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-11 | download_task | seoul-open-data-11 | 서울시 실거래 전체 원자료 | 광진구 | 광장동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_광진구_광장동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-12 | download_task | seoul-open-data-12 | 서울시 실거래 전체 원자료 | 광진구 | 광장동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_광진구_광장동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-13 | download_task | seoul-open-data-13 | 서울시 실거래 전체 원자료 | 광진구 | 구의동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_광진구_구의동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-14 | download_task | seoul-open-data-14 | 서울시 실거래 전체 원자료 | 광진구 | 구의동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_광진구_구의동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-15 | download_task | seoul-open-data-15 | 서울시 실거래 전체 원자료 | 광진구 | 구의동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_광진구_구의동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-16 | download_task | seoul-open-data-16 | 서울시 실거래 전체 원자료 | 광진구 | 자양동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_광진구_자양동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-17 | download_task | seoul-open-data-17 | 서울시 실거래 전체 원자료 | 광진구 | 자양동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_광진구_자양동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-18 | download_task | seoul-open-data-18 | 서울시 실거래 전체 원자료 | 광진구 | 자양동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_광진구_자양동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-19 | download_task | seoul-open-data-19 | 서울시 실거래 전체 원자료 | 광진구 | 중곡동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-20 | download_task | seoul-open-data-20 | 서울시 실거래 전체 원자료 | 광진구 | 중곡동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-21 | download_task | seoul-open-data-21 | 서울시 실거래 전체 원자료 | 광진구 | 중곡동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-22 | download_task | seoul-open-data-22 | 서울시 실거래 전체 원자료 | 송파구 | 마천동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_송파구_마천동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-23 | download_task | seoul-open-data-23 | 서울시 실거래 전체 원자료 | 송파구 | 마천동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_송파구_마천동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-24 | download_task | seoul-open-data-24 | 서울시 실거래 전체 원자료 | 송파구 | 마천동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_송파구_마천동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-25 | download_task | seoul-open-data-25 | 서울시 실거래 전체 원자료 | 송파구 | 문정동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_송파구_문정동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-26 | download_task | seoul-open-data-26 | 서울시 실거래 전체 원자료 | 송파구 | 문정동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_송파구_문정동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-27 | download_task | seoul-open-data-27 | 서울시 실거래 전체 원자료 | 송파구 | 문정동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_송파구_문정동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-28 | download_task | seoul-open-data-28 | 서울시 실거래 전체 원자료 | 송파구 | 방이동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_송파구_방이동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-29 | download_task | seoul-open-data-29 | 서울시 실거래 전체 원자료 | 송파구 | 방이동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_송파구_방이동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-30 | download_task | seoul-open-data-30 | 서울시 실거래 전체 원자료 | 송파구 | 방이동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_송파구_방이동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-31 | download_task | seoul-open-data-31 | 서울시 실거래 전체 원자료 | 송파구 | 송파동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_송파구_송파동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-32 | download_task | seoul-open-data-32 | 서울시 실거래 전체 원자료 | 송파구 | 송파동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_송파구_송파동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-33 | download_task | seoul-open-data-33 | 서울시 실거래 전체 원자료 | 송파구 | 송파동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_송파구_송파동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-34 | download_task | seoul-open-data-34 | 서울시 실거래 전체 원자료 | 송파구 | 신천동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_송파구_신천동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-35 | download_task | seoul-open-data-35 | 서울시 실거래 전체 원자료 | 송파구 | 신천동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_송파구_신천동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-36 | download_task | seoul-open-data-36 | 서울시 실거래 전체 원자료 | 송파구 | 신천동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_송파구_신천동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-37 | download_task | seoul-open-data-37 | 서울시 실거래 전체 원자료 | 송파구 | 잠실동 | 202401 | 202412 | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-38 | download_task | seoul-open-data-38 | 서울시 실거래 전체 원자료 | 송파구 | 잠실동 | 202501 | 202512 | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-seoul-open-data-39 | download_task | seoul-open-data-39 | 서울시 실거래 전체 원자료 | 송파구 | 잠실동 | 202601 | 202606 | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-01 | download_task | molit-apt-rent-01 | 국토부 아파트 전월세 | 강남구 | 압구정동; 대치동; 개포동 | 202401 | 202412 | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-02 | download_task | molit-apt-rent-02 | 국토부 아파트 전월세 | 강남구 | 압구정동; 대치동; 개포동 | 202501 | 202512 | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-03 | download_task | molit-apt-rent-03 | 국토부 아파트 전월세 | 강남구 | 압구정동; 대치동; 개포동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-04 | download_task | molit-apt-rent-04 | 국토부 아파트 전월세 | 광진구 | 자양동; 중곡동; 광장동 | 202401 | 202412 | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-05 | download_task | molit-apt-rent-05 | 국토부 아파트 전월세 | 광진구 | 자양동; 중곡동; 광장동 | 202501 | 202512 | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-06 | download_task | molit-apt-rent-06 | 국토부 아파트 전월세 | 광진구 | 자양동; 중곡동; 광장동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-07 | download_task | molit-apt-rent-07 | 국토부 아파트 전월세 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동 | 202401 | 202412 | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-08 | download_task | molit-apt-rent-08 | 국토부 아파트 전월세 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동 | 202501 | 202512 | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-rent-09 | download_task | molit-apt-rent-09 | 국토부 아파트 전월세 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-01 | download_task | molit-apt-trade-01 | 국토부 아파트 매매 | 강남구 | 압구정동; 대치동; 개포동 | 202401 | 202412 | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-02 | download_task | molit-apt-trade-02 | 국토부 아파트 매매 | 강남구 | 압구정동; 대치동; 개포동 | 202501 | 202512 | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-03 | download_task | molit-apt-trade-03 | 국토부 아파트 매매 | 강남구 | 압구정동; 대치동; 개포동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-04 | download_task | molit-apt-trade-04 | 국토부 아파트 매매 | 광진구 | 자양동; 중곡동; 광장동; 구의동 | 202401 | 202412 | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-05 | download_task | molit-apt-trade-05 | 국토부 아파트 매매 | 광진구 | 자양동; 중곡동; 광장동; 구의동 | 202501 | 202512 | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-06 | download_task | molit-apt-trade-06 | 국토부 아파트 매매 | 광진구 | 자양동; 중곡동; 광장동; 구의동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-07 | download_task | molit-apt-trade-07 | 국토부 아파트 매매 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동; 마천동 | 202401 | 202412 | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-08 | download_task | molit-apt-trade-08 | 국토부 아파트 매매 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동; 마천동 | 202501 | 202512 | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-apt-trade-09 | download_task | molit-apt-trade-09 | 국토부 아파트 매매 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동; 마천동 | 202601 | 202606 | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-rent-01 | download_task | molit-rowhouse-rent-01 | 국토부 연립·다세대 전월세 | 광진구 | 구의동; 자양동 | 202401 | 202412 | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-rent-02 | download_task | molit-rowhouse-rent-02 | 국토부 연립·다세대 전월세 | 광진구 | 구의동; 자양동 | 202501 | 202512 | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-rent-03 | download_task | molit-rowhouse-rent-03 | 국토부 연립·다세대 전월세 | 광진구 | 구의동; 자양동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-rent-04 | download_task | molit-rowhouse-rent-04 | 국토부 연립·다세대 전월세 | 송파구 | 마천동 | 202401 | 202412 | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-rent-05 | download_task | molit-rowhouse-rent-05 | 국토부 연립·다세대 전월세 | 송파구 | 마천동 | 202501 | 202512 | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-rent-06 | download_task | molit-rowhouse-rent-06 | 국토부 연립·다세대 전월세 | 송파구 | 마천동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-trade-01 | download_task | molit-rowhouse-trade-01 | 국토부 연립·다세대 매매 | 광진구 | 구의동; 자양동 | 202401 | 202412 | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-trade-02 | download_task | molit-rowhouse-trade-02 | 국토부 연립·다세대 매매 | 광진구 | 구의동; 자양동 | 202501 | 202512 | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-trade-03 | download_task | molit-rowhouse-trade-03 | 국토부 연립·다세대 매매 | 광진구 | 구의동; 자양동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-trade-04 | download_task | molit-rowhouse-trade-04 | 국토부 연립·다세대 매매 | 송파구 | 마천동 | 202401 | 202412 | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202401_202412.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-trade-05 | download_task | molit-rowhouse-trade-05 | 국토부 연립·다세대 매매 | 송파구 | 마천동 | 202501 | 202512 | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202501_202512.csv | 작업별 다운로드 파일 자동 승격 |
| task-molit-rowhouse-trade-06 | download_task | molit-rowhouse-trade-06 | 국토부 연립·다세대 매매 | 송파구 | 마천동 | 202601 | 202606 | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202601_202606.csv | 작업별 다운로드 파일 자동 승격 |
| task-r-one-statistics-01 | download_task | r-one-statistics-01 | R-ONE 가격지수·거래현황 | 서울/권역/자치구 |  | 2024-01 | 2026-06 | data/market/manual-import/files/r-one-statistics_서울-권역-자치구_2024-01_2026-06.csv | 작업별 다운로드 파일 자동 승격 |

## 운영 규칙

1. `download_task` 행이 하나라도 있으면 컬럼 감사와 정규화는 작업별 파일을 읽는다.
2. 작업별 파일이 아직 없으면 기존 4개 출처 단위 manifest를 읽는다.
3. `downloaded_at` 누락은 정규화를 막지는 않지만, 최신성 추적을 위해 보완해야 한다.
