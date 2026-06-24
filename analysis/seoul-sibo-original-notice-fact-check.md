# 서울시보 본고시 원문 Fact Check - 광장극동

Generated: 2026-06-24 KST

## Summary

- 서울시보 제4146호 PDF에서 rank 27 광장극동아파트 재건축사업의 본고시, 서울특별시고시 제2026-249호를 확인했다.
- PDF 본문 텍스트 추출로 고시번호와 제목을 확인했고, 결정조서 표가 이미지 기반이라 PDF 266-302쪽을 OCR로 보완했다.
- 기존 매트릭스의 정비구역 면적, 층수, 높이, 용적률은 본고시와 대체로 일치한다. 다만 총세대수는 매트릭스 공란이므로 2,049세대로 보완 가능하다.
- 공공기여는 도로·소공원 외에 철도 및 연결녹지가 포함된 토지 기부채납 합계 7,770.20㎡, 순부담면적 7,414.10㎡가 본고시에서 확인된다.

## Source

| Source | Date | Notice | OCR Pages | OCR Success | Local PDF |
| --- | --- | --- | --- | --- | --- |
| 서울시보 제4146호 | 2026-04-30 | 2026-249 | 266-302 | 37 | data/urban/files/27-seoul-sibo-4146-20260430.pdf |

## Fact Table

| Category | Field | Official Value | Existing Value | Status | Page | Note |
| --- | --- | --- | --- | --- | --- | --- |
| 원문확인 | 본고시 원문 | 서울특별시고시 제2026-249호, 서울시보 제4146호, 2026-04-30 | 2026-249 / 2026-04-30 | match | PDF 266 | 서울시보 목차와 본문에서 고시번호·사업명이 확인됨. |
| 절차 | 도시계획 심의 | 2025년 제14차 도시계획 수권분과위원회 심의, 2025-12-24, 수정가결 |  | new_official_context | PDF 266 | 정비구역 지정 전 절차 맥락으로 보존. |
| 정비구역 | 정비구역 면적 | 79,417.2㎡ | 79,417.2 | match | PDF 266 OCR | 기존 매트릭스와 동일. 사업구역 레이어 면적 76,364㎡와는 레이어 범위 차이로 별도 관리. |
| 시행규모 | 기존/증가/계획 세대수 | 기존 1,344세대, 증가 705세대, 계획 2,049세대 |  | fills_missing_matrix_value | PDF 283 OCR | 정비사업 시행계획 표에서 확인. 기존 매트릭스의 총세대수 공란을 보완 가능. |
| 주택공급 | 주택공급계획 | 총 2,049세대, 분양 1,576세대, 공공 473세대 |  | new_official_context | PDF 277 OCR | 공공주택 비중과 일반분양 분석의 기준값. |
| 건축계획 | 층수/높이 | 지하 4층/지상 49층, 높이 155.7m 이하 | 지상:49/지하:4 / 156 | match_or_rounding | PDF 277 OCR | 매트릭스의 높이 156m는 소수점 반올림으로 봐도 무리 없음. |
| 개발밀도 | 용적률 체계 | 기준 210%, 허용 230%, 상한 250%, 예정 법적상한 300%, 추가완화 법적상한 339.50% | 340 | match_or_rounding | PDF 277·279 OCR | 기존 매트릭스 FAR 340%는 339.50% 반올림값으로 해석 가능. |
| 공공기여 | 토지 기부채납 면적 | 합계 7,770.20㎡, 도로 1,598.40㎡, 소공원 2,017.60㎡, 철도 24.80㎡, 연결녹지 4,129.40㎡ |  | new_official_context | PDF 278 OCR | 재공람공고의 도로·소공원 수치에 철도·연결녹지가 추가로 확인됨. |
| 공공기여 | 순부담면적 | 7,414.10㎡, 9.34% |  | new_official_context | PDF 278 OCR | 공공시설등 면적과 국공유지 차감 후 순부담 기준. |
| 사업성 | 추정비례율/총수입/총지출 | 추정비례율 100.94%, 총수입 약 3.729조원, 총지출 약 1.488조원 |  | new_official_context | PDF 267·268 OCR | 사업시행인가·관리처분 전 추산액이므로 투자 판단에는 민감도 항목으로만 사용. |
| 일정 | 사업시행 예정시기 기준 | 정비구역 지정 고시일로부터 4년 이내 범위 | 정비구역지정 | new_official_context | PDF 283 OCR | 실제 사업시행계획인가 신청일 예측이 아니라 법정 계획 기준. |

## Status Counts

- match: 2
- new_official_context: 6
- fills_missing_matrix_value: 1
- match_or_rounding: 2

## Interpretation

- 광장극동은 이제 구청 재공람/조합설립계획 공고뿐 아니라 서울시보 본고시까지 확보된 상태다.
- 투자·입지 리서치에서는 339.50%를 원문 기준 FAR로 저장하고, 화면 표시나 비교표에는 340% 반올림값을 병기하는 편이 좋다.
- 사업구역 레이어 면적 76,364㎡와 본고시 정비구역 면적 79,417.2㎡는 값이 다르다. 지도 레이어 분석에는 레이어 면적을, 고시 수치 비교에는 본고시 면적을 쓰는 식으로 구분해야 한다.
- 사업성 관련 추정비례율과 총수입·총지출은 본고시에 포함되어 있지만, 조합설립·사업시행인가·관리처분 과정에서 바뀔 수 있는 추산값으로만 취급한다.

## Reproduce

```bash
curl -L -f 'https://www.seoul.go.kr/func/seoulsibo/fileDownload.do?fileName=seoulsibo_20260429165724_02427.pdf' -o data/urban/files/27-seoul-sibo-4146-20260430.pdf
/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_seoul_sibo_text.py
NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-seoul-sibo-page-range.mjs --pdf=data/urban/files/27-seoul-sibo-4146-20260430.pdf --start=266 --end=302 --key=27-seoul-sibo-4146-20260430-2026-249 --dpi=180
node scripts/generate-seoul-sibo-original-notice-fact-check.mjs
```
