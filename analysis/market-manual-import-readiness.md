# 시장 원자료 수동 반입 준비도

작성 기준: 2026-06-24 KST

API 키가 없어도 공식 사이트에서 내려받은 CSV/XLSX 원자료를 추적하기 위한 manifest 감사표다. 이 문서는 파일을 정규화하지 않고, 수동 원자료가 공식 출처·기간·지역·파일 경로까지 갖춰졌는지 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | 4 |
| 파일 존재 | 0 |
| 정규화 매핑 준비 | 0 |
| 다운로드 대기 | 4 |
| 대상 사업장 | 30 |
| 상태 분포 | waiting_for_manual_download 4 |

## 수동 반입 체크리스트

1. 공식 페이지에서 원자료를 내려받는다.
2. `analysis/market-manual-download-workbook.md`에서 대상 지역·기간·키워드와 권장 파일명을 확인한다.
3. 원본 파일을 `data/market/manual-import/files/`에 둔다.
4. `data/market/manual-import/manifest.json`의 `local_path`, `downloaded_at`, `coverage_from`, `coverage_to`, `download_url_or_page`를 채운다.
5. 이 스크립트를 다시 실행한다.
6. `python3 scripts/generate-market-manual-column-audit.py`로 컬럼명과 필수 필드 매칭 후보를 확인한다.
7. 상태가 `ready_for_normalization_mapping`이고 컬럼 감사가 통과하면 정규화 스크립트로 넘긴다.

## 출처별 상태

| ID | 제공기관 | 자료 | 파일 | 존재 | 확장자 | 시작 | 종료 | 상태 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul-open-data-real-estate-csv | 서울특별시 | 서울시 부동산 실거래가 정보 |  | N |  | 2024-01 | 2026-06 | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |
| molit-rtms-apt-trade-rent-manual | 국토교통부 | 아파트 매매·전월세 실거래 원자료 |  | N |  | 2024-01 | 2026-06 | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |
| molit-rtms-rowhouse-trade-rent-manual | 국토교통부 | 연립·다세대 매매·전월세 실거래 원자료 |  | N |  | 2024-01 | 2026-06 | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |
| r-one-price-and-volume-statistics | 한국부동산원 | R-ONE 주택가격동향·공동주택 실거래가격지수·거래현황 |  | N |  | 2024-01 | 2026-06 | waiting_for_manual_download | 공식 페이지에서 원자료를 내려받아 data/market/manual-import/files/ 아래에 저장하고 manifest local_path를 채운다. |

## 공식 다운로드 페이지

| ID | 공식 페이지 | 필요 컬럼 |
| --- | --- | --- |
| seoul-open-data-real-estate-csv | https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do | 자치구, 법정동, 건물명 또는 단지명, 계약/신고일, 거래금액, 면적 |
| molit-rtms-apt-trade-rent-manual | https://rt.molit.go.kr/ | 지역/법정동, 단지명, 계약년월일, 거래/보증금/월세, 전용면적, 층, 건축년도 |
| molit-rtms-rowhouse-trade-rent-manual | https://rt.molit.go.kr/ | 지역/법정동, 건물명, 계약년월일, 거래/보증금/월세, 전용면적, 층, 건축년도 |
| r-one-price-and-volume-statistics | https://www.reb.or.kr/r-one/main.do | 지역, 통계명, 기준월, 지수/증감률/거래량 |
