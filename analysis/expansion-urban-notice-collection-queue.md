# 확장 관심권 서울도시공간포털 원문 수집 큐

작성 기준: 2026-06-24 KST

이 문서는 강동권·약수동 주변 shortlist를 서울도시공간포털 원문 수집 체계에 바로 태우기 위한 대기열이다. 핵심 생활권 30개와 달리 확장 후보는 map recordCode를 다시 찾지 않고, 확보한 `noticeCode`를 기준으로 고시 detail/첨부 수집부터 시작한다.

## 요약

- shortlist 행: 10
- fetch 준비 완료: 7
- detail 확보: 7
- notice_file 링크 확보: 7
- 로컬 notice_file 저장: 7
- 로컬 drawing 저장: 20
- 텍스트 확보: 7
- OCR/이미지 병목: 0

## 실행 명령

```bash
node scripts/fetch-urban-notice-details.mjs --input data/urban/urban-notice-fetch-input-expansion-shortlist.json --out-json data/urban/urban-notice-details-expansion-shortlist.json --out-csv data/urban/urban-notice-details-expansion-shortlist.csv --out-attachments-csv data/urban/urban-notice-attachments-expansion-shortlist.csv --file-dir data/urban/expansion-files --download
```

## 수집 큐

| 권역 | 우선 | 유형 | 사업장 | 고시번호 | 고시일 | noticeCode | detail | notice_file | 로컬 원문 | 텍스트 상태 | 글자 수 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 강동권 | high | direct_project | 천호3구역 | 강동구 제2025-194호 | 2025-11-19 | 11740NTC202511180006 | Y | Y | 1 | extracted | 9063 | 키필드 검토와 생활권 비교 보드로 이동 |
| 강동권 | medium | direct_project | 성내미주아파트 주택재건축정비사업 | 강동구 제2016-123호 | 2016-08-24 | 11000NTC201608247852 | Y | Y | 1 | extracted | 3090 | 키필드 검토와 생활권 비교 보드로 이동 |
| 강동권 | medium | direct_project | 신동아1·2차아파트 주택재건축 정비사업 | 강동구 제2025-48호 | 2025-04-02 | 11740NTC202504220008 | Y | Y | 1 | extracted | 4824 | 키필드 검토와 생활권 비교 보드로 이동 |
| 강동권 | high | direct_project | 상일동 빌라단지 통합 재건축 |  |  |  |  |  | 0 |  | 0 | 네트워크 가능 시 확장 shortlist 전용 fetch 명령 실행 |
| 강동권 | low | adjacent_project | 고덕강일1역세권 재개발사업 |  |  |  |  |  | 0 |  | 0 | 네트워크 가능 시 확장 shortlist 전용 fetch 명령 실행 |
| 강동권 | low | adjacent_project | 고덕대우아파트 소규모재건축사업 |  |  |  |  |  | 0 |  | 0 | 네트워크 가능 시 확장 shortlist 전용 fetch 명령 실행 |
| 강동권 | low | context_project | 주택재건축정비구역 | 강동구 제2020-55호 | 2020-04-01 | 11000NTC202004280008 | Y | Y | 1 | extracted | 4785 | 키필드 검토와 생활권 비교 보드로 이동 |
| 약수동 주변 | high | adjacent_project | 신당 제8구역 주택재개발정비사업 | 중구 제2023-6호 | 2023-01-18 | 11140NTC202302130001 | Y | Y | 1 | ocr_extracted | 15654 | 키필드 검토와 생활권 비교 보드로 이동 |
| 약수동 주변 | medium | adjacent_project | 신당 제9주택재개발정비구역 | 중구 제2021-102호 | 2021-09-01 | 11140NTC202109170002 | Y | Y | 1 | ocr_extracted | 10298 | 키필드 검토와 생활권 비교 보드로 이동 |
| 약수동 주변 | medium | adjacent_project | 금호 제14-1 주택재개발 정비사업 | 성동구 제2023-13호 | 2023-02-09 | 11200NTC202302270005 | Y | Y | 1 | ocr_extracted | 10339 | 키필드 검토와 생활권 비교 보드로 이동 |

## 운영 규칙

1. 확장 후보는 shortlist에서 확보한 `noticeCode`로 직접 수집한다.
2. `detail_fetched`가 비어 있으면 아직 네트워크 수집 전 상태다.
3. `notice_file_linked=Y`가 되어도 로컬 파일과 텍스트 추출 전에는 수치 확정 근거로 올리지 않는다.
4. `text_status=extracted`이면 키필드 검토로, `scanned_pdf_or_image_only`이면 OCR/이미지 검토로 바로 분기한다.

