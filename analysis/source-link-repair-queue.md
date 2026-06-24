# 원문 링크 보정 큐

작성 기준: 2026-06-24 KST

핵심 수치 장부에서 `source_link_required` 또는 `no_source_text` 상태인 필드를 모은 작업표다. OCR 이미지 확인은 끝났지만, 원문이 다른 사업장에 연결되었거나 recordCode/고시번호/텍스트 경로가 빠져 비교표 신뢰도를 낮추는 항목을 다음 검색 대상으로 정리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 링크 보정 항목 | 20 |
| 대상 사업장 | 6 |
| P0 | 16 |
| P1 | 4 |
| P2 | 0 |

## 유형별

| 유형 | 건수 |
| --- | --- |
| recordcode_notice_link_required | 7 |
| source_text_missing | 7 |
| wrong_source_image | 6 |

## 사업장별

| 사업장 | 건수 |
| --- | --- |
| 광장동 삼성1차아파트 소규모재건축정비사업 | 6 |
| 마천1재정비촉진구역 주택재개발정비사업조합 | 5 |
| 자양번영로3나길 일대 가로주택정비사업 | 5 |
| 압구정한양7차아파트 재건축정비사업조합 | 2 |
| 송파한양2차아파트 재건축정비사업 조합 | 1 |
| 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 1 |

## 보정 큐

| 순번 | 우선 | 후보 | 생활권 | 사업장 | 필드 | 현재값 | 유형 | 현재 연결 원문값 | 다음 액션 | 현재 열 자료 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | P0 | 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | 건폐율 | 50 | wrong_source_image | 1982년 건설부 도시계획 입안 고시 이미지 | 현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색 | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 2 | P0 | 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | 정비구역 면적 | 159,816.7 | wrong_source_image | 1982년 건설부 도시계획 입안 고시의 광역 구역 면적 | 현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색 | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 3 | P0 | 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | 용적률 | 277.88 | wrong_source_image | 1982년 건설부 도시계획 입안 고시 이미지 | 현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색 | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 4 | P0 | 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | 층수 | 지상:49/지하:미확인 | wrong_source_image | 1982년 건설부 도시계획 입안 고시 이미지 | 현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색 | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 5 | P0 | 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | 최고높이 | 160 | wrong_source_image | 1982년 건설부 도시계획 입안 고시 이미지 | 현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색 | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 6 | P0 | 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비구역 면적 | 7,653 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 7 | P0 | 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 용적률 | 300 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 8 | P0 | 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | 정비구역 면적 | 2,307.5 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 9 | P0 | 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | 용적률 | 295 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 10 | P0 | 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 건폐율 | 20 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 11 | P0 | 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 층수 | 지상:40/지하:3 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 12 | P0 | 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 최고높이 | 0 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 13 | P0 | 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 총 세대수 | 185 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 14 | P0 | 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | 건폐율 | 23 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 15 | P0 | 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | 층수 | 지상:20/지하:3 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 16 | P0 | 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | 최고높이 | 58 | source_text_missing |  | 원문 첨부 파일을 다시 내려받아 PDF/HWP/HWPX 텍스트 추출 또는 이미지 OCR 경로를 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 17 | P1 | 17 | 잠실/송파 | 송파한양2차아파트 재건축정비사업 조합 | 최고높이 | 96 | wrong_source_image | 가락아파트지구 용도지구 및 개발기본계획 변경 고시 이미지 | 현재 연결 원문을 직접 근거에서 제외하고 사업명·위치·필드명으로 서울도시공간포털/자치구 고시공고 원문을 재검색 | analysis/ocr-image-review-decisions.md; data/urban/text/files/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시.txt |
| 18 | P1 | 15 | 강남 | 압구정한양7차아파트 재건축정비사업조합 | 정비구역 면적 | 16,437.1 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680100003000s45&stepSeCode=102&div=sumry; data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 19 | P1 | 15 | 강남 | 압구정한양7차아파트 재건축정비사업조합 | 고시번호 | 2023-516 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 20 | P1 | 24 | 구의/광진 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 정비구역 면적 | 89,878 | recordcode_notice_link_required |  | recordCode·noticeCode·고시번호를 확정하고 본고시 원문 파일 경로를 비교 매트릭스에 연결 | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001363i54&stepSeCode=101&div=sumry; data/urban/text/gwangjin-gu/files/24-B0000378-16413-1-24-B0000378-16413-gwangjin-gu-1-붙임2-주민의견제출서.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-2-24-B0000378-16413-gwangjin-gu-2-붙임1-워커힐아파트-일대-도시관리계획수립-전략환경영향평가-항목-범위-등의-결정내용.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-3-24-B0000378-16413-gwangjin-gu-3-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |

## 사용법

1. `wrong_source_image`는 현재 연결 원문을 비교 근거에서 제외하고 동일 사업명/위치로 원문을 다시 찾는다.
2. `recordcode_notice_link_required`는 서울도시공간포털 recordCode/noticeCode 또는 자치구 공고 URL을 먼저 확정한다.
3. `source_text_missing`은 첨부 원문 다운로드와 텍스트 추출 경로부터 복구한다.
4. 원문을 찾으면 비교 매트릭스의 출처 경로를 보강하고 `core-value-confirmation-ledger`를 재생성한다.
