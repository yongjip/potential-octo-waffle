# 강동권 확장 후보 1차 수집 실행 목록 (고덕축)

작성 기준: 2026-06-24 KST

## 요약

- 대상: 3개
- noticeCode 확정: 1개
- probe 후보 총계: 1개
- 즉시 리뷰 준비: 1개
- 수동 보강 필요: 2개

## 우선 실행 명령

- `node scripts/probe-expansion-gangdong-notice-candidates.mjs`
- `node scripts/generate-expansion-urban-notice-fetch-input.mjs`
- `node scripts/fetch-urban-notice-details.mjs --input data/urban/urban-notice-fetch-input-expansion-shortlist.json --out-json data/urban/urban-notice-details-expansion-shortlist.json --out-csv data/urban/urban-notice-details-expansion-shortlist.csv --out-attachments-csv data/urban/urban-notice-attachments-expansion-shortlist.csv --file-dir data/urban/expansion-files --download`
- `node scripts/generate-expansion-urban-notice-collection-queue.mjs`
- `node scripts/generate-expansion-urban-notice-review-board.mjs`

## 후보별 실행 상태

| 순번 | 사업장 | 위치 | shortlist_noticeCode | probe_noticeCode | 상태 | 권장 액션 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 상일동 빌라단지 통합 재건축 | 강동구 상일동 174 일대 |  |  | probe_needed_manual_check | 정비사업정보공개 검색어/공고 연계 채널로 noticeCode 재탐색 |
| 2 | 고덕강일1역세권 재개발사업 | 강동구 고덕동 294 일대 | 11740NTC202403190003 | 11740NTC202403190003 | notice_ready_for_review | 수집 큐/리뷰 보드 재생성 후 텍스트 검토 |
| 3 | 고덕대우아파트 소규모재건축사업 | 강동구 고덕동 470 일대 |  |  | probe_needed_manual_check | 정비사업정보공개 검색어/공고 연계 채널로 noticeCode 재탐색 |

## 링크/경로

- 큐/리뷰: `analysis/expansion-urban-notice-collection-queue.md`, `analysis/expansion-urban-notice-review-board.md`
- 입력 파일: `data/urban/urban-notice-fetch-input-expansion-shortlist.json`
- 상세 산출물: `data/urban/urban-notice-details-expansion-shortlist.json`
- 탐색 산출물: `analysis/expansion-gangdong-notice-candidates.md`


