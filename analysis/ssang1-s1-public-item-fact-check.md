# 대치쌍용1차 S1 공개항목 원문 점검 메모

작성 기준: 2026-06-24 KST

## 문서 성격

이 문서는 `analysis/s1-cost-infrastructure-workbook.json`의 해당 사업장 행을 사람이 바로 읽고 다음 확인 작업으로 이어가기 쉽게 정리한 1차 점검 메모다. 이미 상세 팩트체크 문서가 있는 사업장과 달리, 이 문서는 공개항목 제목·원문 경로·장부 체크 포인트를 한 곳에 모은 시작점이다. 확정 수치 승격 전에는 공식 원문 본문과 첨부를 다시 대조한다.

## 대상

- 사업장: 대치쌍용1차아파트 주택재건축정비사업조합
- 현재 단계: 사업시행인가
- 우선순위: P1
- 공개항목 수 / P0 수: 2 / 0
- 리스크 / 근거등급: high / B
- 사업 메모: `project-notes/08-ssang1.md`
- 원문 열기 자료: `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt`

## 현재 점검 상태

| 항목 | 값 |
| --- | --- |
| 리뷰 상태 | ready_with_public_item |
| 점검 카테고리 | 기반시설; 공공기여·기부채납; 용적률·비율 산정 |
| 다음 리뷰 액션 | 기반시설 후보를 공개항목 상세와 대조하되 후속 공고가 P0인지 재평가; 공공기여·기부채납 후보를 공개항목 상세와 대조하되 후속 공고가 P0인지 재평가 |

## 우선 공개 신호

- P1 2018-05-04 사업시행계획 수립을 위한 추정사업비/개략적 분담금 산출
- P2 2025-03-11 2025년 민간공사원가자문 서비스 안내

## 공개항목 상세 URL

| 공개항목 | 상세 URL |
| --- | --- |
| P1 2018-05-04 사업시행계획 수립을 위한 추정사업비/개략적 분담금 산출 | https://cleanup.seoul.go.kr/assc/bbs-use/vscrGnrl.do?cafeId=680900000566y01&bbsSn=5273&cpage=1&searchCode=&searchValue=&streSttusCode=0&nttSn=156448&menuId=100 |
| P2 2025-03-11 2025년 민간공사원가자문 서비스 안내 |  |

## 장부 점검 포인트

| 항목 | 값 |
| --- | --- |
| 장부 체크 수 | 7 |
| 장부 상태 요약 | structured_value_needs_manual_confirmation 3; snippet_candidate_needs_manual_confirmation 2; not_yet_applicable 1; value_missing 1 |
| 우선 닫을 필드 | 건폐율:17(structured_value_needs_manual_confirmation); 최고높이:110(structured_value_needs_manual_confirmation); 층수:지상:35/지하:3(structured_value_needs_manual_confirmation); 용적률:300(snippet_candidate_needs_manual_confirmation); 정비구역 면적:47,659(snippet_candidate_needs_manual_confirmation); 총 세대수:공란(value_missing); 관리처분 공사비:공란(not_yet_applicable) |
| 추천 순서 | 1 고시 원문 스니펫 확인 -> 2 관련 공개항목 추가 검색 -> 3 장부 필드 상태 갱신 |
| 완료 체크 | 상위 공개항목의 첨부/상세 URL 열람 여부 기록; 고시 원문 스니펫과 공개항목 제목 신호의 일치/불일치 표시; 장부 필드를 confirmed, pending, conflict, not_applicable 중 하나로 분류 |

## 카테고리별 원문 증거 후보

### 공공기여·기부채납

- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:205` 제공면적 = 4,090.00㎡ + 59.67㎡ - 0㎡ = 4,149.67㎡ (순부담) ※ 구역내 국공유지 398㎡는 주민이 매입 후 어린이집부지로 기부채납 하므로 제하지 않음 구 분 인센티브(용적률) 비 고
- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:42` 소 계 4,090.0 - 4,090.0 ∙ 기반시설 조성 및 부지제공 : 4,149.67㎡(순부담 8.71%) - 공원, 도로 : 3,692㎡
- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:200` 토지용 기정 47,659.0㎡ 43,569..0㎡ 4,090.0㎡ 398.0㎡ (건축물기부채납을 계획

### 기반시설

- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:43` : 4,149.67㎡(순부담 8.71%) - 공원, 도로 : 3,692㎡ 기부 도 로 792.0 - 792.0
- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:203` 토지면적 환산) 공공시설부지 (계획 정비기반시설 면적 + 공공시설설치비용 환산면적) - 계획 정비기반시설 내 국공유지 제공면적 = 4,090.00㎡ + 59.67㎡ - 0㎡ = 4,149.67㎡
- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:77` 서고 325호 기정 공원 소공원 대치동66번지 2,900.0 - 2,900.0 공원선 변경 (13. 10. 04)

### 용적률·비율 산정

- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:137` •용적률 완화 (도시 및 주거환경정비법 제54조) - 정비계획용적률(250.00%) → 예정법적상한용적률 (299.90%) - 309 -
- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:177` •용적률 완화 (도시 및 주거환경정비법 제54조) - 정비계획용적률(250.00%) → 예정법적상한용적률 (299.90%) •영동대로변: 건축한계선 3m
- `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt:226` ￿ 총 제공면적 = 공공시설 등 부지 제공 면적 + 시설설치비용 환산 면적 법적상한 ∙ 법적상한용적률 = 299.90% 용적률 - 법적상한용적률 적용대상으로 도시계획위원회 심의 시 결정된 예정법적상한용적률은 건축위원회 심의를 통해 확정예정

## 원문 대조 해석 메모

- 이 사업장은 현재 `data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt` 경로를 먼저 열어 공개항목 제목과 고시/요약 텍스트가 같은 문맥을 가리키는지 확인한다.
- 비용·분담금·기반시설·공공기여 수치는 `건폐율:17(structured_value_needs_manual_confirmation); 최고높이:110(structured_value_needs_manual_confirmation); 층수:지상:35/지하:3(structured_value_needs_manual_confirmation); 용적률:300(snippet_candidate_needs_manual_confirmation); 정비구역 면적:47,659(snippet_candidate_needs_manual_confirmation); 총 세대수:공란(value_missing); 관리처분 공사비:공란(not_yet_applicable)` 범위 안에서만 검토하고, 직접 본문 또는 첨부가 없으면 비교표 확정값으로 올리지 않는다.
- 공개항목 제목만으로는 최종 단계나 확정 사업비를 단정하지 않는다. 조합설립·사업시행·관리처분 등 현재 단계에 맞는 공개 가능 범위인지 먼저 구분한다.

## 사용 제한

- 이 문서는 자동 추출된 시작 문서이므로, 위 스니펫은 공식 원문 대조의 출발점으로만 쓴다.
- 장부 상태가 `structured_value_needs_manual_confirmation`, `snippet_candidate_needs_manual_confirmation`, `value_missing`, `ocr_partial_confirmation_pending`이면 확정값 승격 전 수동 대조가 필요하다.
- 개별 사업의 관리처분 공사비·최종 분담금·확정 사업비는 현재 단계와 공개 경로가 맞을 때만 별도로 승격한다.

## 다음 반영 위치

- `project-notes/08-ssang1.md`
- `analysis/research-next-moves.md`
- `analysis/strategic-research-brief.md`
- 필요 시 `analysis/s1-evidence-review-board.md`
