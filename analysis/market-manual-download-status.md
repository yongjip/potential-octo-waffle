# 시장 원자료 수동 다운로드 상태

작성 기준: 2026-06-24 KST

이 문서는 `analysis/market-manual-download-workbook.md`의 작업별로 실제 원자료 파일이 들어왔는지 점검한다. 권장 파일명 그대로 `data/market/manual-import/files/`에 저장하면 자동 감지하며, 파일명이 다르면 `data/market/manual-import/download-intake.json`에 `task_id`별 `local_path`를 채운다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 작업 | 70 |
| 파일 존재 | 70 |
| 컬럼 감사 후보 | 70 |
| 다운로드 대기 | 0 |
| 상태 분포 | file_ready_for_column_audit 70 |

## 상태표

| 작업 | 자료 | 자치구 | 법정동 | 시작 | 종료 | 파일 | 확장자 | 상태 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul-open-data-01 | 서울시 실거래 전체 원자료 | 강남구 | 개포동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-02 | 서울시 실거래 전체 원자료 | 강남구 | 개포동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-03 | 서울시 실거래 전체 원자료 | 강남구 | 개포동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-04 | 서울시 실거래 전체 원자료 | 강남구 | 대치동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-05 | 서울시 실거래 전체 원자료 | 강남구 | 대치동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-06 | 서울시 실거래 전체 원자료 | 강남구 | 대치동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-07 | 서울시 실거래 전체 원자료 | 강남구 | 압구정동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-08 | 서울시 실거래 전체 원자료 | 강남구 | 압구정동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-09 | 서울시 실거래 전체 원자료 | 강남구 | 압구정동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-10 | 서울시 실거래 전체 원자료 | 광진구 | 광장동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-11 | 서울시 실거래 전체 원자료 | 광진구 | 광장동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-12 | 서울시 실거래 전체 원자료 | 광진구 | 광장동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-13 | 서울시 실거래 전체 원자료 | 광진구 | 구의동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-14 | 서울시 실거래 전체 원자료 | 광진구 | 구의동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-15 | 서울시 실거래 전체 원자료 | 광진구 | 구의동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-16 | 서울시 실거래 전체 원자료 | 광진구 | 자양동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-17 | 서울시 실거래 전체 원자료 | 광진구 | 자양동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-18 | 서울시 실거래 전체 원자료 | 광진구 | 자양동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-19 | 서울시 실거래 전체 원자료 | 광진구 | 중곡동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-20 | 서울시 실거래 전체 원자료 | 광진구 | 중곡동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-21 | 서울시 실거래 전체 원자료 | 광진구 | 중곡동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-22 | 서울시 실거래 전체 원자료 | 송파구 | 마천동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-23 | 서울시 실거래 전체 원자료 | 송파구 | 마천동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-24 | 서울시 실거래 전체 원자료 | 송파구 | 마천동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-25 | 서울시 실거래 전체 원자료 | 송파구 | 문정동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-26 | 서울시 실거래 전체 원자료 | 송파구 | 문정동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-27 | 서울시 실거래 전체 원자료 | 송파구 | 문정동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-28 | 서울시 실거래 전체 원자료 | 송파구 | 방이동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-29 | 서울시 실거래 전체 원자료 | 송파구 | 방이동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-30 | 서울시 실거래 전체 원자료 | 송파구 | 방이동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-31 | 서울시 실거래 전체 원자료 | 송파구 | 송파동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-32 | 서울시 실거래 전체 원자료 | 송파구 | 송파동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-33 | 서울시 실거래 전체 원자료 | 송파구 | 송파동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-34 | 서울시 실거래 전체 원자료 | 송파구 | 신천동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-35 | 서울시 실거래 전체 원자료 | 송파구 | 신천동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-36 | 서울시 실거래 전체 원자료 | 송파구 | 신천동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-37 | 서울시 실거래 전체 원자료 | 송파구 | 잠실동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-38 | 서울시 실거래 전체 원자료 | 송파구 | 잠실동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| seoul-open-data-39 | 서울시 실거래 전체 원자료 | 송파구 | 잠실동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-01 | 국토부 아파트 전월세 | 강남구 | 압구정동; 대치동; 개포동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-02 | 국토부 아파트 전월세 | 강남구 | 압구정동; 대치동; 개포동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-03 | 국토부 아파트 전월세 | 강남구 | 압구정동; 대치동; 개포동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-04 | 국토부 아파트 전월세 | 광진구 | 자양동; 중곡동; 광장동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-05 | 국토부 아파트 전월세 | 광진구 | 자양동; 중곡동; 광장동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-06 | 국토부 아파트 전월세 | 광진구 | 자양동; 중곡동; 광장동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-07 | 국토부 아파트 전월세 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-08 | 국토부 아파트 전월세 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-rent-09 | 국토부 아파트 전월세 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-01 | 국토부 아파트 매매 | 강남구 | 압구정동; 대치동; 개포동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-02 | 국토부 아파트 매매 | 강남구 | 압구정동; 대치동; 개포동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-03 | 국토부 아파트 매매 | 강남구 | 압구정동; 대치동; 개포동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-04 | 국토부 아파트 매매 | 광진구 | 자양동; 중곡동; 광장동; 구의동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-05 | 국토부 아파트 매매 | 광진구 | 자양동; 중곡동; 광장동; 구의동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-06 | 국토부 아파트 매매 | 광진구 | 자양동; 중곡동; 광장동; 구의동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-07 | 국토부 아파트 매매 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동; 마천동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-08 | 국토부 아파트 매매 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동; 마천동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-apt-trade-09 | 국토부 아파트 매매 | 송파구 | 잠실동; 신천동; 문정동; 송파동; 방이동; 마천동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-rent-01 | 국토부 연립·다세대 전월세 | 광진구 | 구의동; 자양동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-rent-02 | 국토부 연립·다세대 전월세 | 광진구 | 구의동; 자양동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-rent-03 | 국토부 연립·다세대 전월세 | 광진구 | 구의동; 자양동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-rent-04 | 국토부 연립·다세대 전월세 | 송파구 | 마천동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-rent-05 | 국토부 연립·다세대 전월세 | 송파구 | 마천동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-rent-06 | 국토부 연립·다세대 전월세 | 송파구 | 마천동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-trade-01 | 국토부 연립·다세대 매매 | 광진구 | 구의동; 자양동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-trade-02 | 국토부 연립·다세대 매매 | 광진구 | 구의동; 자양동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-trade-03 | 국토부 연립·다세대 매매 | 광진구 | 구의동; 자양동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-trade-04 | 국토부 연립·다세대 매매 | 송파구 | 마천동 | 202401 | 202412 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-trade-05 | 국토부 연립·다세대 매매 | 송파구 | 마천동 | 202501 | 202512 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| molit-rowhouse-trade-06 | 국토부 연립·다세대 매매 | 송파구 | 마천동 | 202601 | 202606 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |
| r-one-statistics-01 | R-ONE 가격지수·거래현황 | 서울/권역/자치구 |  | 2024-01 | 2026-06 | Y | .csv | file_ready_for_column_audit | 컬럼 감사/정규화로 넘기기 전 source-level manifest 또는 task-level 반입 경로와 연결한다. |

## 파일 경로

| 작업 | 권장 파일명 | 감지/입력 경로 | 공식 페이지 | 필터 |
| --- | --- | --- | --- | --- |
| seoul-open-data-01 | seoul-open-data_강남구_개포동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_강남구_개포동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=강남구; 법정동=개포동; 건물명/단지명 키워드=개포; 주공; 디에이치; 래미안; 자이 |
| seoul-open-data-02 | seoul-open-data_강남구_개포동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_강남구_개포동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=강남구; 법정동=개포동; 건물명/단지명 키워드=개포; 주공; 디에이치; 래미안; 자이 |
| seoul-open-data-03 | seoul-open-data_강남구_개포동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_강남구_개포동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=강남구; 법정동=개포동; 건물명/단지명 키워드=개포; 주공; 디에이치; 래미안; 자이 |
| seoul-open-data-04 | seoul-open-data_강남구_대치동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_강남구_대치동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=강남구; 법정동=대치동; 건물명/단지명 키워드=은마; 우성; 쌍용; 대치 |
| seoul-open-data-05 | seoul-open-data_강남구_대치동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_강남구_대치동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=강남구; 법정동=대치동; 건물명/단지명 키워드=은마; 우성; 쌍용; 대치 |
| seoul-open-data-06 | seoul-open-data_강남구_대치동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_강남구_대치동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=강남구; 법정동=대치동; 건물명/단지명 키워드=은마; 우성; 쌍용; 대치 |
| seoul-open-data-07 | seoul-open-data_강남구_압구정동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=강남구; 법정동=압구정동; 건물명/단지명 키워드=압구정; 현대; 한양; 미성; 신현대 |
| seoul-open-data-08 | seoul-open-data_강남구_압구정동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=강남구; 법정동=압구정동; 건물명/단지명 키워드=압구정; 현대; 한양; 미성; 신현대 |
| seoul-open-data-09 | seoul-open-data_강남구_압구정동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_강남구_압구정동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=강남구; 법정동=압구정동; 건물명/단지명 키워드=압구정; 현대; 한양; 미성; 신현대 |
| seoul-open-data-10 | seoul-open-data_광진구_광장동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_광진구_광장동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=광진구; 법정동=광장동; 건물명/단지명 키워드=광장; 극동; 워커힐; 삼성 |
| seoul-open-data-11 | seoul-open-data_광진구_광장동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_광진구_광장동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=광진구; 법정동=광장동; 건물명/단지명 키워드=광장; 극동; 워커힐; 삼성 |
| seoul-open-data-12 | seoul-open-data_광진구_광장동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_광진구_광장동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=광진구; 법정동=광장동; 건물명/단지명 키워드=광장; 극동; 워커힐; 삼성 |
| seoul-open-data-13 | seoul-open-data_광진구_구의동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_광진구_구의동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=광진구; 법정동=구의동; 건물명/단지명 키워드=구의; 한양; 강변 |
| seoul-open-data-14 | seoul-open-data_광진구_구의동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_광진구_구의동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=광진구; 법정동=구의동; 건물명/단지명 키워드=구의; 한양; 강변 |
| seoul-open-data-15 | seoul-open-data_광진구_구의동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_광진구_구의동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=광진구; 법정동=구의동; 건물명/단지명 키워드=구의; 한양; 강변 |
| seoul-open-data-16 | seoul-open-data_광진구_자양동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_광진구_자양동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=광진구; 법정동=자양동; 건물명/단지명 키워드=자양; 한양; 자양7; 자양4 |
| seoul-open-data-17 | seoul-open-data_광진구_자양동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_광진구_자양동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=광진구; 법정동=자양동; 건물명/단지명 키워드=자양; 한양; 자양7; 자양4 |
| seoul-open-data-18 | seoul-open-data_광진구_자양동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_광진구_자양동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=광진구; 법정동=자양동; 건물명/단지명 키워드=자양; 한양; 자양7; 자양4 |
| seoul-open-data-19 | seoul-open-data_광진구_중곡동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=광진구; 법정동=중곡동; 건물명/단지명 키워드=중곡; 중곡아파트 |
| seoul-open-data-20 | seoul-open-data_광진구_중곡동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=광진구; 법정동=중곡동; 건물명/단지명 키워드=중곡; 중곡아파트 |
| seoul-open-data-21 | seoul-open-data_광진구_중곡동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_광진구_중곡동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=광진구; 법정동=중곡동; 건물명/단지명 키워드=중곡; 중곡아파트 |
| seoul-open-data-22 | seoul-open-data_송파구_마천동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_송파구_마천동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=송파구; 법정동=마천동; 건물명/단지명 키워드=마천; 거여; 재정비촉진 |
| seoul-open-data-23 | seoul-open-data_송파구_마천동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_송파구_마천동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=송파구; 법정동=마천동; 건물명/단지명 키워드=마천; 거여; 재정비촉진 |
| seoul-open-data-24 | seoul-open-data_송파구_마천동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_송파구_마천동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=송파구; 법정동=마천동; 건물명/단지명 키워드=마천; 거여; 재정비촉진 |
| seoul-open-data-25 | seoul-open-data_송파구_문정동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_송파구_문정동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=송파구; 법정동=문정동; 건물명/단지명 키워드=가락; 현대; 문정 |
| seoul-open-data-26 | seoul-open-data_송파구_문정동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_송파구_문정동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=송파구; 법정동=문정동; 건물명/단지명 키워드=가락; 현대; 문정 |
| seoul-open-data-27 | seoul-open-data_송파구_문정동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_송파구_문정동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=송파구; 법정동=문정동; 건물명/단지명 키워드=가락; 현대; 문정 |
| seoul-open-data-28 | seoul-open-data_송파구_방이동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_송파구_방이동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=송파구; 법정동=방이동; 건물명/단지명 키워드=대림; 가락; 방이 |
| seoul-open-data-29 | seoul-open-data_송파구_방이동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_송파구_방이동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=송파구; 법정동=방이동; 건물명/단지명 키워드=대림; 가락; 방이 |
| seoul-open-data-30 | seoul-open-data_송파구_방이동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_송파구_방이동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=송파구; 법정동=방이동; 건물명/단지명 키워드=대림; 가락; 방이 |
| seoul-open-data-31 | seoul-open-data_송파구_송파동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_송파구_송파동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=송파구; 법정동=송파동; 건물명/단지명 키워드=송파; 한양; 미성; 가락삼익; 삼익 |
| seoul-open-data-32 | seoul-open-data_송파구_송파동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_송파구_송파동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=송파구; 법정동=송파동; 건물명/단지명 키워드=송파; 한양; 미성; 가락삼익; 삼익 |
| seoul-open-data-33 | seoul-open-data_송파구_송파동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_송파구_송파동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=송파구; 법정동=송파동; 건물명/단지명 키워드=송파; 한양; 미성; 가락삼익; 삼익 |
| seoul-open-data-34 | seoul-open-data_송파구_신천동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_송파구_신천동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=송파구; 법정동=신천동; 건물명/단지명 키워드=장미; 파크리오; 진주; 미성; 크로바 |
| seoul-open-data-35 | seoul-open-data_송파구_신천동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_송파구_신천동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=송파구; 법정동=신천동; 건물명/단지명 키워드=장미; 파크리오; 진주; 미성; 크로바 |
| seoul-open-data-36 | seoul-open-data_송파구_신천동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_송파구_신천동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=송파구; 법정동=신천동; 건물명/단지명 키워드=장미; 파크리오; 진주; 미성; 크로바 |
| seoul-open-data-37 | seoul-open-data_송파구_잠실동_202401_202412.csv | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202401_202412.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2024; 자치구=송파구; 법정동=잠실동; 건물명/단지명 키워드=잠실; 주공; 우성; 엘스; 리센츠; 트리지움 |
| seoul-open-data-38 | seoul-open-data_송파구_잠실동_202501_202512.csv | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202501_202512.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2025; 자치구=송파구; 법정동=잠실동; 건물명/단지명 키워드=잠실; 주공; 우성; 엘스; 리센츠; 트리지움 |
| seoul-open-data-39 | seoul-open-data_송파구_잠실동_202601_202606.csv | data/market/manual-import/files/seoul-open-data_송파구_잠실동_202601_202606.csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 신고년도=2026; 자치구=송파구; 법정동=잠실동; 건물명/단지명 키워드=잠실; 주공; 우성; 엘스; 리센츠; 트리지움 |
| molit-apt-rent-01 | molit-apt-rent_강남구_압구정동-대치동-개포동_202401_202412.csv | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11680; 계약년월=202401~202412; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-02 | molit-apt-rent_강남구_압구정동-대치동-개포동_202501_202512.csv | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11680; 계약년월=202501~202512; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-03 | molit-apt-rent_강남구_압구정동-대치동-개포동_202601_202606.csv | data/market/manual-import/files/molit-apt-rent_강남구_압구정동-대치동-개포동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11680; 계약년월=202601~202606; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-04 | molit-apt-rent_광진구_자양동-중곡동-광장동_202401_202412.csv | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11215; 계약년월=202401~202412; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-05 | molit-apt-rent_광진구_자양동-중곡동-광장동_202501_202512.csv | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11215; 계약년월=202501~202512; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-06 | molit-apt-rent_광진구_자양동-중곡동-광장동_202601_202606.csv | data/market/manual-import/files/molit-apt-rent_광진구_자양동-중곡동-광장동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11215; 계약년월=202601~202606; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-07 | molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202401_202412.csv | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11710; 계약년월=202401~202412; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-08 | molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202501_202512.csv | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11710; 계약년월=202501~202512; 자료유형=국토부 아파트 전월세 |
| molit-apt-rent-09 | molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202601_202606.csv | data/market/manual-import/files/molit-apt-rent_송파구_잠실동-신천동-문정동-송파동-방이동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11710; 계약년월=202601~202606; 자료유형=국토부 아파트 전월세 |
| molit-apt-trade-01 | molit-apt-trade_강남구_압구정동-대치동-개포동_202401_202412.csv | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11680; 계약년월=202401~202412; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-02 | molit-apt-trade_강남구_압구정동-대치동-개포동_202501_202512.csv | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11680; 계약년월=202501~202512; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-03 | molit-apt-trade_강남구_압구정동-대치동-개포동_202601_202606.csv | data/market/manual-import/files/molit-apt-trade_강남구_압구정동-대치동-개포동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11680; 계약년월=202601~202606; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-04 | molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202401_202412.csv | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11215; 계약년월=202401~202412; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-05 | molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202501_202512.csv | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11215; 계약년월=202501~202512; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-06 | molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202601_202606.csv | data/market/manual-import/files/molit-apt-trade_광진구_자양동-중곡동-광장동-구의동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11215; 계약년월=202601~202606; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-07 | molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202401_202412.csv | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11710; 계약년월=202401~202412; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-08 | molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202501_202512.csv | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11710; 계약년월=202501~202512; 자료유형=국토부 아파트 매매 |
| molit-apt-trade-09 | molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202601_202606.csv | data/market/manual-import/files/molit-apt-trade_송파구_잠실동-신천동-문정동-송파동-방이동-마천동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11710; 계약년월=202601~202606; 자료유형=국토부 아파트 매매 |
| molit-rowhouse-rent-01 | molit-rowhouse-rent_광진구_구의동-자양동_202401_202412.csv | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11215; 계약년월=202401~202412; 자료유형=국토부 연립·다세대 전월세 |
| molit-rowhouse-rent-02 | molit-rowhouse-rent_광진구_구의동-자양동_202501_202512.csv | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11215; 계약년월=202501~202512; 자료유형=국토부 연립·다세대 전월세 |
| molit-rowhouse-rent-03 | molit-rowhouse-rent_광진구_구의동-자양동_202601_202606.csv | data/market/manual-import/files/molit-rowhouse-rent_광진구_구의동-자양동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11215; 계약년월=202601~202606; 자료유형=국토부 연립·다세대 전월세 |
| molit-rowhouse-rent-04 | molit-rowhouse-rent_송파구_마천동_202401_202412.csv | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11710; 계약년월=202401~202412; 자료유형=국토부 연립·다세대 전월세 |
| molit-rowhouse-rent-05 | molit-rowhouse-rent_송파구_마천동_202501_202512.csv | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11710; 계약년월=202501~202512; 자료유형=국토부 연립·다세대 전월세 |
| molit-rowhouse-rent-06 | molit-rowhouse-rent_송파구_마천동_202601_202606.csv | data/market/manual-import/files/molit-rowhouse-rent_송파구_마천동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11710; 계약년월=202601~202606; 자료유형=국토부 연립·다세대 전월세 |
| molit-rowhouse-trade-01 | molit-rowhouse-trade_광진구_구의동-자양동_202401_202412.csv | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11215; 계약년월=202401~202412; 자료유형=국토부 연립·다세대 매매 |
| molit-rowhouse-trade-02 | molit-rowhouse-trade_광진구_구의동-자양동_202501_202512.csv | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11215; 계약년월=202501~202512; 자료유형=국토부 연립·다세대 매매 |
| molit-rowhouse-trade-03 | molit-rowhouse-trade_광진구_구의동-자양동_202601_202606.csv | data/market/manual-import/files/molit-rowhouse-trade_광진구_구의동-자양동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11215; 계약년월=202601~202606; 자료유형=국토부 연립·다세대 매매 |
| molit-rowhouse-trade-04 | molit-rowhouse-trade_송파구_마천동_202401_202412.csv | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202401_202412.csv | https://rt.molit.go.kr/ | 계약년도=2024; LAWD_CD=11710; 계약년월=202401~202412; 자료유형=국토부 연립·다세대 매매 |
| molit-rowhouse-trade-05 | molit-rowhouse-trade_송파구_마천동_202501_202512.csv | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202501_202512.csv | https://rt.molit.go.kr/ | 계약년도=2025; LAWD_CD=11710; 계약년월=202501~202512; 자료유형=국토부 연립·다세대 매매 |
| molit-rowhouse-trade-06 | molit-rowhouse-trade_송파구_마천동_202601_202606.csv | data/market/manual-import/files/molit-rowhouse-trade_송파구_마천동_202601_202606.csv | https://rt.molit.go.kr/ | 계약년도=2026; LAWD_CD=11710; 계약년월=202601~202606; 자료유형=국토부 연립·다세대 매매 |
| r-one-statistics-01 | r-one-statistics_서울-권역-자치구_2024-01_2026-06.xlsx | data/market/manual-import/files/r-one-statistics_서울-권역-자치구_2024-01_2026-06.csv | https://www.reb.or.kr/r-one/main.do | Open API STATBL_ID=A_2024_00045,A_2024_00050,A_2024_00176,A_2024_00546,A_2024_00903; 지역=서울/동북권/동남권/광진구/강남구/송파구; 기준월=202401~202606 |

## 운영 규칙

1. 이 상태표는 작업별 파일 존재 확인용이다. 정규화로 넘기기 전에는 source-level `manifest.json` 또는 후속 task-level 반입 경로와 연결해야 한다.
2. `download_date_missing`은 파일은 감지했지만 다운로드 시점을 기록하지 않은 상태다.
3. 원자료 파일 내용은 이 문서에 저장하지 않는다. 파일명, 크기, 확장자, 필터 메타데이터만 기록한다.
