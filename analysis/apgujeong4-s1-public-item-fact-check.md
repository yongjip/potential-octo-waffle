# 압구정4 S1 공개항목 원문 점검 메모

작성 기준: 2026-06-24 KST

## 문서 성격

이 문서는 `analysis/s1-cost-infrastructure-workbook.json`의 해당 사업장 행을 사람이 바로 읽고 다음 확인 작업으로 이어가기 쉽게 정리한 1차 점검 메모다. 이미 상세 팩트체크 문서가 있는 사업장과 달리, 이 문서는 공개항목 제목·원문 경로·장부 체크 포인트를 한 곳에 모은 시작점이다. 확정 수치 승격 전에는 공식 원문 본문과 첨부를 다시 대조한다.

## 대상

- 사업장: 압구정아파트지구 특별계획구역4
- 현재 단계: 조합설립인가
- 우선순위: P1
- 공개항목 수 / P0 수: 2 / 1
- 리스크 / 근거등급: high / B
- 사업 메모: `project-notes/11-apgujeong4.md`
- 원문 열기 자료: `data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt`

## 현재 점검 상태

| 항목 | 값 |
| --- | --- |
| 리뷰 상태 | ready_with_p0_public_item |
| 점검 카테고리 | 기반시설 |
| 다음 리뷰 액션 | 기반시설 후보를 P0 공개항목 상세/첨부와 대조하고 장부·메모에 confirmed/pending/conflict 기록 |

## 우선 공개 신호

- P0 2026-06-11 정비기반시설 도로 복개구조물 설계용역 선정 입찰공고
- P2 2025-03-11 2025년 민간공사원가자문 서비스 안내

## 공개항목 상세 URL

| 공개항목 | 상세 URL |
| --- | --- |
| P0 2026-06-11 정비기반시설 도로 복개구조물 설계용역 선정 입찰공고 | https://cleanup.seoul.go.kr/assc/bidpblanc/vscr.do?cafeId=680900000684g10&cpage=1&searchCode=&searchValue=&signguCd=&othbcListSn=1043559 |
| P2 2025-03-11 2025년 민간공사원가자문 서비스 안내 | https://cleanup.seoul.go.kr/assc/bbs-use/vscrGnrl.do?cafeId=680900000684g10&bbsSn=5773&cpage=1&searchCode=&searchValue=&streSttusCode=0&nttSn=156553&menuId=100 |

## 장부 점검 포인트

| 항목 | 값 |
| --- | --- |
| 장부 체크 수 | 7 |
| 장부 상태 요약 | structured_value_needs_manual_confirmation 4; not_yet_applicable 1; snippet_candidate_needs_manual_confirmation 1; value_missing 1 |
| 우선 닫을 필드 | 건폐율:50(structured_value_needs_manual_confirmation); 용적률:300(structured_value_needs_manual_confirmation); 최고높이:250(structured_value_needs_manual_confirmation); 층수:지상:69/지하:3(structured_value_needs_manual_confirmation); 정비구역 면적:118,859.6(snippet_candidate_needs_manual_confirmation); 총 세대수:공란(value_missing); 관리처분 공사비:공란(not_yet_applicable) |
| 추천 순서 | 1 공개항목 상세/첨부 확인 -> 2 고시 원문 스니펫 대조 -> 3 장부 필드 상태 갱신 |
| 완료 체크 | 상위 공개항목의 첨부/상세 URL 열람 여부 기록; 고시 원문 스니펫과 공개항목 제목 신호의 일치/불일치 표시; 장부 필드를 confirmed, pending, conflict, not_applicable 중 하나로 분류 |

## 카테고리별 원문 증거 후보

### 기반시설

- `data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt:310` 번호 공원, 녹지 및 도로 중복결정 압구정동 422 6,732.2 (공원① : 3,300.4㎡
- `data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt:313` 기정 ① 유수지 유수시설 - 일원(신사공원 일원) (4,725.4) 녹지① : 2,006.8㎡ 중로2-109 : 1,425.0㎡)
- `data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt:74` 시설 공원용지 75,449.6 6.6 19,539.0 2.3 감) 55,910.6 용지

## 원문 대조 해석 메모

- 이 사업장은 현재 `data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt` 경로를 먼저 열어 공개항목 제목과 고시/요약 텍스트가 같은 문맥을 가리키는지 확인한다.
- 비용·분담금·기반시설·공공기여 수치는 `건폐율:50(structured_value_needs_manual_confirmation); 용적률:300(structured_value_needs_manual_confirmation); 최고높이:250(structured_value_needs_manual_confirmation); 층수:지상:69/지하:3(structured_value_needs_manual_confirmation); 정비구역 면적:118,859.6(snippet_candidate_needs_manual_confirmation); 총 세대수:공란(value_missing); 관리처분 공사비:공란(not_yet_applicable)` 범위 안에서만 검토하고, 직접 본문 또는 첨부가 없으면 비교표 확정값으로 올리지 않는다.
- 공개항목 제목만으로는 최종 단계나 확정 사업비를 단정하지 않는다. 조합설립·사업시행·관리처분 등 현재 단계에 맞는 공개 가능 범위인지 먼저 구분한다.

## 사용 제한

- 이 문서는 자동 추출된 시작 문서이므로, 위 스니펫은 공식 원문 대조의 출발점으로만 쓴다.
- 장부 상태가 `structured_value_needs_manual_confirmation`, `snippet_candidate_needs_manual_confirmation`, `value_missing`, `ocr_partial_confirmation_pending`이면 확정값 승격 전 수동 대조가 필요하다.
- 개별 사업의 관리처분 공사비·최종 분담금·확정 사업비는 현재 단계와 공개 경로가 맞을 때만 별도로 승격한다.

## 다음 반영 위치

- `project-notes/11-apgujeong4.md`
- `analysis/research-next-moves.md`
- `analysis/strategic-research-brief.md`
- 필요 시 `analysis/s1-evidence-review-board.md`
