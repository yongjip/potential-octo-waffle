# S4 사업시행·관리처분 시점 충돌 해소 워크북

작성 기준: 2026-06-24 KST

`source-verification-sprint-plan`의 S4 대상 사업장을 관리처분 대조표, 시점 해소표, 핵심 수치 장부와 연결한 실행 보드다. 이 문서는 관리처분인가 단계의 수치 차이를 오류로 바로 덮어쓰지 않고, 고시 시점·사업시행 공개항목·관리처분 공개항목으로 분리해 기록하기 위한 작업표다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S4 사업장 | 2 |
| S4 필드 | 18 |
| 해소/반영 가능 필드 | 11 |
| 시점별 분리 기록 필요 | 4 |
| 관리처분 별첨/인가고시 보강 필요 | 1 |
| 단계일자 공란 보강 필요 | 0 |
| 관리처분 대조 원문 | 2 |

## 액션별

| 액션 | 필드 |
| --- | --- |
| record_resolved_value | 11 |
| record_values_by_source_date | 4 |
| manual_stage_review | 2 |
| fetch_management_attachment | 1 |

## 사업장 실행 보드

| 큐 | 우선 | 생활권 | 후보 | 사업장 | 필드 | 반영 | 시점분리 | 별첨보강 | 일자보강 | S4 상태 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | P0 | 잠실/송파 | 9 | 잠실우성4차 주택재건축정비사업조합 | 9 | 4 | 3 | 1 | 0 | management_attachment_needed | 관리처분 별첨/인가 고시에서 누락 공사비·분담금 값을 먼저 확인 |
| 9 | P0 | 잠실/송파 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 9 | 7 | 1 | 0 | 0 | recordable_with_source_date_split | 사업개요·고시·사업시행·관리처분 값을 시점별 열로 분리해 기록 |

## 필드별 해소 행

| 큐 | 우선 | 후보 | 사업장 | 필드 | 사업개요값 | 고시값 | 공개항목값 | 장부 상태 | 액션 | 기록 방식 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | 25 | 30 |  | source_date_split_required | record_values_by_source_date | 고시문 후보값과 사업개요 값 차이를 시점차로 유지 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분 공사비 |  |  |  | management_stage_followup_needed | fetch_management_attachment | 관리처분 별첨 또는 조합 공개표에서 공사비 보강 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가일 |  |  | 2025-12-31 | resolved_by_management_stage_report | record_resolved_value | 공개항목 기준 관리처분인가일로 기록 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행인가일 |  |  | 2023-08-31 | resolved_by_management_stage_report | record_resolved_value | 공개항목 기준 사업시행인가일로 기록 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 용적률 | 300 | 299.7 |  | resolved_by_management_stage_report | record_resolved_value | 정비계획 법적상한은 고시문 기준값으로 유지 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | 31,961.1 | 31630.5 |  | source_date_split_required | record_values_by_source_date | 사업개요 현재값과 정비구역 지정 고시 값을 별도 열로 유지 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 조합설립인가일 |  |  |  | official_stage_date_confirmed | manual_stage_review | 공식 단계 출처에서 확인된 단계일자를 비교표와 사업별 메모에 반영 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | 732 | 916 |  | source_date_split_required | record_values_by_source_date | 사업개요와 고시문 세대수 차이를 시점차로 두고 최신 인가 원문 확인 |
| 8 | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 층수 | 지상:32/지하:4 | 32 |  | resolved_by_management_stage_report | record_resolved_value | 층수는 고시문과 사업개요가 같은 방향으로 확인됨 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 건폐율 | 24 | 50 | 18.67% | resolved_by_management_stage_report | record_resolved_value | 사업시행 공개항목 건폐율을 최신 사업계획 수치로 별도 기록 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분 공사비 |  |  | 689,150,000,000 | resolved_by_management_stage_report | record_resolved_value | 관리처분 공개항목 공사비로 기록하고 단위 원 유지 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가일 |  |  | 2025-10-15 | resolved_by_management_stage_report | record_resolved_value | 공개항목 기준 관리처분인가일로 기록 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 사업시행인가일 |  |  | 2023-11-13 | resolved_by_management_stage_report | record_resolved_value | 공개항목 기준 사업시행인가일로 기록 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 용적률 | 300 | 299.98 | 299.975% | resolved_by_management_stage_report | record_resolved_value | 정비계획 법적상한과 사업시행 용적률을 구분해 기록 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 정비구역 면적 | 59,721.7 | 59721.63 |  | resolved_by_management_stage_report | record_resolved_value | 구역면적은 사업개요와 고시문이 같은 값으로 취급 가능 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 조합설립인가일 |  |  |  | official_stage_date_confirmed | manual_stage_review | 공식 단계 출처에서 확인된 단계일자를 비교표와 사업별 메모에 반영 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 총 세대수 | 1,358 | 1,570 | 1,531세대 | resolved_by_management_stage_report | record_resolved_value | 정비구역 고시 세대수, 사업시행 세대수, 사업개요 세대수를 시점별로 분리 |
| 9 | P0 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 층수 | 지상:30/지하:3 | 31 |  | source_date_split_required | record_values_by_source_date | 최고층 후보와 사업개요 층수를 별도 기록하고 최신 사업시행 원문 확인 |

## 사용법

1. `record_values_by_source_date`는 비교표에서 단일 공식값으로 덮어쓰지 말고 고시·사업시행·관리처분 기준 열을 분리한다.
2. `record_resolved_value`는 이미 공개항목 또는 고시값으로 해소된 항목이므로 사업별 메모와 비교표 주석에 반영한다.
3. `fetch_management_attachment`와 `fill_missing_stage_date`는 S4 완료 전 남은 원문 확인 작업으로 둔다.
