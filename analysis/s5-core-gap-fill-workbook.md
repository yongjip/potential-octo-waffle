# S5 핵심 공란 보강 워크북

작성 기준: 2026-06-24 KST

`source-verification-sprint-plan`의 S5 대상 사업장을 핵심 수치 공란, 원문 스니펫 승격, 구조화 값 수동확인, 단계상 미적용 값으로 나눈 실행 보드다. 공란을 무조건 결측으로 보지 않고, 이미 후보 출처가 있는 항목과 추가 검색이 필요한 항목을 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S5 태스크 | 16 |
| S5 사업장 | 14 |
| S5 필드 | 138 |
| 후보값 있는 공란 | 7 |
| 후보 없는 공란 | 8 |
| 원문 스니펫/구조화값 수동확인 | 73 |
| 단계상 미적용 | 34 |
| 시점별 분리 필요 | 4 |

## 액션별

| 액션 | 필드 |
| --- | --- |
| confirm_structured_value | 50 |
| defer_stage_not_applicable | 34 |
| promote_notice_snippet | 23 |
| already_resolved | 11 |
| missing_no_candidate | 8 |
| fill_from_candidate_source | 6 |
| record_by_source_date | 4 |
| apply_fill_candidate_after_second_check | 1 |
| manual_gap_review | 1 |

## 사업장 실행 보드

| 첫 큐 | 생활권 | 후보 | 사업장 | 필드 | 후보보강 | 후보없음 | 스니펫 | 구조확인 | 단계보류 | S5 상태 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | 잠실/송파 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 11 | 0 | 0 | 3 | 5 | 3 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |
| 20 | 강남 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 11 | 0 | 0 | 3 | 5 | 3 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |
| 21 | 잠실/송파 | 3 | 잠실우성아파트 재건축정비사업조합 | 11 | 1 | 0 | 2 | 5 | 3 | candidate_fill_ready | 후보 출처의 값·단위·기준시점을 확인해 공란 보강 |
| 22 | 강남 | 4 | 은마아파트 재건축정비사업조합 | 11 | 0 | 0 | 3 | 5 | 3 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |
| 23 | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 8 | 4 | 1 | 0 | 0 | 3 | candidate_search_needed | 후보값 없는 공란부터 공식 원문·정보몽땅 사업개요·자치구 공고에서 추가 검색 |
| 25 | 잠실/송파 | 9 | 잠실우성4차 주택재건축정비사업조합 | 12 | 1 | 1 | 0 | 3 | 0 | candidate_search_needed | 후보값 없는 공란부터 공식 원문·정보몽땅 사업개요·자치구 공고에서 추가 검색 |
| 26 | 강남 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 11 | 0 | 0 | 3 | 5 | 3 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |
| 27 | 구의/광진 | 13 | 자양제7구역 주택재건축정비사업 조합 | 14 | 0 | 3 | 3 | 5 | 3 | candidate_search_needed | 후보값 없는 공란부터 공식 원문·정보몽땅 사업개요·자치구 공고에서 추가 검색 |
| 28 | 강남 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 3 | 0 | 0 | 0 | 0 | 2 | stage_deferred | 현재 단계상 아직 발생 전인 값은 보류 사유로 기록 |
| 29 | 잠실/송파 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 6 | 0 | 1 | 0 | 2 | 2 | candidate_search_needed | 후보값 없는 공란부터 공식 원문·정보몽땅 사업개요·자치구 공고에서 추가 검색 |
| 30 | 잠실/송파 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 11 | 0 | 0 | 0 | 3 | 0 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |
| 31 | 구의/광진 | 26 | 자양한양아파트 재건축정비사업 | 14 | 0 | 2 | 3 | 5 | 4 | candidate_search_needed | 후보값 없는 공란부터 공식 원문·정보몽땅 사업개요·자치구 공고에서 추가 검색 |
| 32 | 잠실/송파 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 5 | 0 | 0 | 0 | 2 | 3 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |
| 45 | 강남 | 6 | 대치우성1차아파트 재건축정비사업조합 | 10 | 0 | 0 | 3 | 5 | 2 | manual_confirmation_needed | 구조화 값과 원문 스니펫을 대조해 confirmed/pending/conflict 판정 |

## 우선 처리 필드

| 큐 | 우선 | 후보 | 사업장 | 필드 | 장부 상태 | 액션 | 후보값 | 후보 출처 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 22 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:70/지하:4 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 280 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2024-09-05 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2024-432 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 358,077 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 323 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 6,491 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 16 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:35/지하:3 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 110 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2025-03-13 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2025-136 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 172,588.2 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 230 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 2,571 | project_comparison_matrix | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 23 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:49/지하:4 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 105 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2015-12-17 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2015-401 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 120,354.2 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 300 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 18 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:35/지하:3 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 118,400 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2023-02-16 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2023-51 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 243,552.6 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 300 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 5,778 | project_comparison_matrix | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 고시일 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 건폐율 | value_missing | fill_from_candidate_source | 6; 1; 4; 2; 2; 1; 60%; 2 | notice_key_field_snippet | 후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강 |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 층수 | value_missing | fill_from_candidate_source | 8; 4; 1; 4층; 2; 7층; 3; 5 | notice_key_field_snippet | 후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강 |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 최고높이 | value_missing | fill_from_candidate_source | 8; 4; 1; 4층; 2; 7층; 3; 5 | notice_key_field_snippet | 후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강 |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 총 세대수 | value_missing | fill_from_candidate_source | 7; 1; 1; 1; 2; 4층; 2; 7층 | notice_key_field_snippet | 후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강 |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 추진위원회 승인일 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 단계 공개 동의율 | value_missing | fill_from_candidate_source | 97.9695% | management_stage_public_doc | 후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강 |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 100 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2017-07-06 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2017-239 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 50 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:65/지하:3 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 250 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2026-06-23 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 정보몽땅 사업개요 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 400,633.2 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 300 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 5,175 | project_comparison_matrix | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 추진위원회 승인일 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 단계 공개 동의율 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 조합설립인가일 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 22 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:25/지하:2 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 75 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2018-08-30 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2018-268 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 44,658.5 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 247 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 874 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 총 세대수 | source_value_fill_missing_required | apply_fill_candidate_after_second_check | 총 942세대 | ocr_image_update_candidate | 후보값을 원문 또는 사업개요로 2차 대조한 뒤 공란 보강 |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 단계 공개 동의율 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2021-04-29 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2021-88 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 125 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2020-10-08 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2020-111 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 추진위원회 승인일 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 단계 공개 동의율 | value_missing | missing_no_candidate |  |  | 현재 로컬 후보가 없으므로 공식 원문/정보몽땅/자치구 공고를 추가 검색 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 24 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:35/지하:3 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 35 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2024-05-30 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2024-267 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 40,179.2 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 294 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 859 | project_comparison_matrix | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2026-05-28 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2026-298 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 38 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 총 세대수 | value_missing | fill_from_candidate_source | 1.26; 105; 35층; 2; 1,000; 50; 250; 5층 | notice_key_field_snippet | 후보 출처를 열어 값·기준시점·단위를 확인한 뒤 공란 보강 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | confirm_structured_value | 2 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | confirm_structured_value | 지상:35/지하:4 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | confirm_structured_value | 109 | cleanup_project_summary | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 고시일 | structured_value_needs_manual_confirmation | confirm_structured_value | 2018-12-06 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 고시번호 | structured_value_needs_manual_confirmation | confirm_structured_value | 2018-399 | project_comparison_matrix | 이미 구조화된 값이 원문과 같은지 확인하고 confirmed 처리 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 정비구역 면적 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 28,793 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 용적률 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 300 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 총 세대수 | snippet_candidate_needs_manual_confirmation | promote_notice_snippet | 626 | cleanup_project_summary | 원문 스니펫의 숫자·단위·행 제목을 확인해 confirmed/pending/conflict 결정 |

## 전체 필드

| 큐 | 우선 | 후보 | 사업장 | 필드 | 현재값 | 장부 상태 | 후보값 | 후보 출처 | 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 건폐율 | 22 | structured_value_needs_manual_confirmation | 22 | cleanup_project_summary | confirm_structured_value |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 층수 | 지상:70/지하:4 | structured_value_needs_manual_confirmation | 지상:70/지하:4 | cleanup_project_summary | confirm_structured_value |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 최고높이 | 280 | structured_value_needs_manual_confirmation | 280 | cleanup_project_summary | confirm_structured_value |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 고시일 | 2024-09-05 | structured_value_needs_manual_confirmation | 2024-09-05 | project_comparison_matrix | confirm_structured_value |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 고시번호 | 2024-432 | structured_value_needs_manual_confirmation | 2024-432 | project_comparison_matrix | confirm_structured_value |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 정비구역 면적 | 358,077 | snippet_candidate_needs_manual_confirmation | 358,077 | cleanup_project_summary | promote_notice_snippet |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 용적률 | 323 | snippet_candidate_needs_manual_confirmation | 323 | cleanup_project_summary | promote_notice_snippet |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 총 세대수 | 6,491 | snippet_candidate_needs_manual_confirmation | 6,491 | cleanup_project_summary | promote_notice_snippet |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 19 | P1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 건폐율 | 16 | structured_value_needs_manual_confirmation | 16 | cleanup_project_summary | confirm_structured_value |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 층수 | 지상:35/지하:3 | structured_value_needs_manual_confirmation | 지상:35/지하:3 | cleanup_project_summary | confirm_structured_value |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 최고높이 | 110 | structured_value_needs_manual_confirmation | 110 | cleanup_project_summary | confirm_structured_value |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 고시일 | 2025-03-13 | structured_value_needs_manual_confirmation | 2025-03-13 | project_comparison_matrix | confirm_structured_value |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 고시번호 | 2025-136 | structured_value_needs_manual_confirmation | 2025-136 | project_comparison_matrix | confirm_structured_value |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 정비구역 면적 | 172,588.2 | snippet_candidate_needs_manual_confirmation | 172,588.2 | cleanup_project_summary | promote_notice_snippet |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 용적률 | 230 | snippet_candidate_needs_manual_confirmation | 230 | cleanup_project_summary | promote_notice_snippet |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 총 세대수 | 2,571 | snippet_candidate_needs_manual_confirmation | 2,571 | project_comparison_matrix | promote_notice_snippet |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 20 | P1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 건폐율 | 23 | structured_value_needs_manual_confirmation | 23 | cleanup_project_summary | confirm_structured_value |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 층수 | 지상:49/지하:4 | structured_value_needs_manual_confirmation | 지상:49/지하:4 | cleanup_project_summary | confirm_structured_value |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 최고높이 | 105 | structured_value_needs_manual_confirmation | 105 | cleanup_project_summary | confirm_structured_value |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 고시일 | 2015-12-17 | structured_value_needs_manual_confirmation | 2015-12-17 | project_comparison_matrix | confirm_structured_value |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 고시번호 | 2015-401 | structured_value_needs_manual_confirmation | 2015-401 | project_comparison_matrix | confirm_structured_value |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 정비구역 면적 | 120,354.2 | snippet_candidate_needs_manual_confirmation | 120,354.2 | cleanup_project_summary | promote_notice_snippet |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 용적률 | 300 | snippet_candidate_needs_manual_confirmation | 300 | cleanup_project_summary | promote_notice_snippet |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 21 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 건폐율 | 18 | structured_value_needs_manual_confirmation | 18 | cleanup_project_summary | confirm_structured_value |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 층수 | 지상:35/지하:3 | structured_value_needs_manual_confirmation | 지상:35/지하:3 | cleanup_project_summary | confirm_structured_value |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 최고높이 | 118.4 | structured_value_needs_manual_confirmation | 118,400 | cleanup_project_summary | confirm_structured_value |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 고시일 | 2023-02-16 | structured_value_needs_manual_confirmation | 2023-02-16 | project_comparison_matrix | confirm_structured_value |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 고시번호 | 2023-51 | structured_value_needs_manual_confirmation | 2023-51 | project_comparison_matrix | confirm_structured_value |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 정비구역 면적 | 243,552.6 | snippet_candidate_needs_manual_confirmation | 243,552.6 | cleanup_project_summary | promote_notice_snippet |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 용적률 | 300 | snippet_candidate_needs_manual_confirmation | 300 | cleanup_project_summary | promote_notice_snippet |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 총 세대수 | 5,778 | snippet_candidate_needs_manual_confirmation | 5,778 | project_comparison_matrix | promote_notice_snippet |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 22 | P1 | 4 | 은마아파트 재건축정비사업조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 고시일 |  | value_missing |  |  | missing_no_candidate |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 건폐율 |  | value_missing | 6; 1; 4; 2; 2; 1; 60%; 2 | notice_key_field_snippet | fill_from_candidate_source |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 층수 |  | value_missing | 8; 4; 1; 4층; 2; 7층; 3; 5 | notice_key_field_snippet | fill_from_candidate_source |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 최고높이 |  | value_missing | 8; 4; 1; 4층; 2; 7층; 3; 5 | notice_key_field_snippet | fill_from_candidate_source |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 총 세대수 |  | value_missing | 7; 1; 1; 1; 2; 4층; 2; 7층 | notice_key_field_snippet | fill_from_candidate_source |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 23 | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 추진위원회 승인일 |  | value_missing |  |  | missing_no_candidate |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 단계 공개 동의율 |  | value_missing | 97.9695% | management_stage_public_doc | fill_from_candidate_source |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | 732 | source_date_split_required | 732 | cleanup_project_summary | record_by_source_date |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | 25 | source_date_split_required | 25 | cleanup_project_summary | record_by_source_date |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | 31,961.1 | source_date_split_required | 31,961.1 | cleanup_project_summary | record_by_source_date |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 용적률 | 300 | resolved_by_management_stage_report | 300 | cleanup_project_summary | already_resolved |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가일 | 2025-12-31 | resolved_by_management_stage_report | 2025-12-31 | management_stage_public_doc | already_resolved |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행인가일 | 2023-08-31 | resolved_by_management_stage_report | 2023-08-31 | management_stage_public_doc | already_resolved |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 층수 | 지상:32/지하:4 | resolved_by_management_stage_report | 지상:32/지하:4 | cleanup_project_summary | already_resolved |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 최고높이 | 100 | structured_value_needs_manual_confirmation | 100 | cleanup_project_summary | confirm_structured_value |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시일 | 2017-07-06 | structured_value_needs_manual_confirmation | 2017-07-06 | project_comparison_matrix | confirm_structured_value |
| 25 | P1 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시번호 | 2017-239 | structured_value_needs_manual_confirmation | 2017-239 | project_comparison_matrix | confirm_structured_value |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 건폐율 | 50 | structured_value_needs_manual_confirmation | 50 | cleanup_project_summary | confirm_structured_value |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 층수 | 지상:65/지하:3 | structured_value_needs_manual_confirmation | 지상:65/지하:3 | cleanup_project_summary | confirm_structured_value |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 최고높이 | 250 | structured_value_needs_manual_confirmation | 250 | cleanup_project_summary | confirm_structured_value |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 고시일 | 2026-06-23 | structured_value_needs_manual_confirmation | 2026-06-23 | project_comparison_matrix | confirm_structured_value |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 고시번호 | 정보몽땅 사업개요 | structured_value_needs_manual_confirmation | 정보몽땅 사업개요 | project_comparison_matrix | confirm_structured_value |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 정비구역 면적 | 400,633.2 | snippet_candidate_needs_manual_confirmation | 400,633.2 | cleanup_project_summary | promote_notice_snippet |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 용적률 | 300 | snippet_candidate_needs_manual_confirmation | 300 | cleanup_project_summary | promote_notice_snippet |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 총 세대수 | 5,175 | snippet_candidate_needs_manual_confirmation | 5,175 | project_comparison_matrix | promote_notice_snippet |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 26 | P1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 추진위원회 승인일 |  | value_missing |  |  | missing_no_candidate |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 단계 공개 동의율 |  | value_missing |  |  | missing_no_candidate |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 조합설립인가일 |  | value_missing |  |  | missing_no_candidate |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 건폐율 | 22 | structured_value_needs_manual_confirmation | 22 | cleanup_project_summary | confirm_structured_value |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 층수 | 지상:25/지하:2 | structured_value_needs_manual_confirmation | 지상:25/지하:2 | cleanup_project_summary | confirm_structured_value |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 최고높이 | 75 | structured_value_needs_manual_confirmation | 75 | cleanup_project_summary | confirm_structured_value |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 고시일 | 2018-08-30 | structured_value_needs_manual_confirmation | 2018-08-30 | project_comparison_matrix | confirm_structured_value |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 고시번호 | 2018-268 | structured_value_needs_manual_confirmation | 2018-268 | project_comparison_matrix | confirm_structured_value |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 정비구역 면적 | 44,658.5 | snippet_candidate_needs_manual_confirmation | 44,658.5 | cleanup_project_summary | promote_notice_snippet |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 용적률 | 247 | snippet_candidate_needs_manual_confirmation | 247 | cleanup_project_summary | promote_notice_snippet |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 총 세대수 | 917 | snippet_candidate_needs_manual_confirmation | 874 | cleanup_project_summary | promote_notice_snippet |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 27 | P1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 28 | P1 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 총 세대수 | 2,698 | confirmed_from_original_notice | 2,698 | project_comparison_matrix | manual_gap_review |
| 28 | P1 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 28 | P1 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 총 세대수 | 842 | source_value_fill_missing_required | 총 942세대 | ocr_image_update_candidate | apply_fill_candidate_after_second_check |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 단계 공개 동의율 |  | value_missing |  |  | missing_no_candidate |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 고시일 | 2021-04-29 | structured_value_needs_manual_confirmation | 2021-04-29 | project_comparison_matrix | confirm_structured_value |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 고시번호 | 2021-88 | structured_value_needs_manual_confirmation | 2021-88 | project_comparison_matrix | confirm_structured_value |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 29 | P1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 층수 | 지상:29/지하:4 | source_date_split_required | 지상:30/지하:3 | cleanup_project_summary | record_by_source_date |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 건폐율 | 24 | resolved_by_management_stage_report | 24 | cleanup_project_summary | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 정비구역 면적 | 59,715.7 | resolved_by_management_stage_report | 59,721.7 | cleanup_project_summary | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 용적률 | 300 | resolved_by_management_stage_report | 300 | cleanup_project_summary | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가일 | 2025-10-15 | resolved_by_management_stage_report | 2025-10-15 | management_stage_public_doc | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분 공사비 | 689,150,000,000 | resolved_by_management_stage_report | 689,150,000,000 | management_stage_public_doc | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 사업시행인가일 | 2023-11-13 | resolved_by_management_stage_report | 2023-11-13 | management_stage_public_doc | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 총 세대수 | 1,485 | resolved_by_management_stage_report | 1,358 | cleanup_project_summary | already_resolved |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 최고높이 | 125 | structured_value_needs_manual_confirmation | 125 | cleanup_project_summary | confirm_structured_value |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 고시일 | 2020-10-08 | structured_value_needs_manual_confirmation | 2020-10-08 | project_comparison_matrix | confirm_structured_value |
| 30 | P1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 고시번호 | 2020-111 | structured_value_needs_manual_confirmation | 2020-111 | project_comparison_matrix | confirm_structured_value |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 추진위원회 승인일 |  | value_missing |  |  | missing_no_candidate |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 단계 공개 동의율 |  | value_missing |  |  | missing_no_candidate |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 건폐율 | 50 | structured_value_needs_manual_confirmation | 24 | cleanup_project_summary | confirm_structured_value |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 층수 | 지상:40/지하:미확인 | structured_value_needs_manual_confirmation | 지상:35/지하:3 | cleanup_project_summary | confirm_structured_value |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 최고높이 | 121 | structured_value_needs_manual_confirmation | 35 | cleanup_project_summary | confirm_structured_value |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 고시일 | 2024-05-30 | structured_value_needs_manual_confirmation | 2024-05-30 | project_comparison_matrix | confirm_structured_value |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 고시번호 | 2024-267 | structured_value_needs_manual_confirmation | 2024-267 | project_comparison_matrix | confirm_structured_value |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 정비구역 면적 | 40,179.2 | snippet_candidate_needs_manual_confirmation | 40,179.2 | cleanup_project_summary | promote_notice_snippet |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 용적률 | 293.77 | snippet_candidate_needs_manual_confirmation | 294 | cleanup_project_summary | promote_notice_snippet |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 총 세대수 | 859 | snippet_candidate_needs_manual_confirmation | 859 | project_comparison_matrix | promote_notice_snippet |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 31 | P1 | 26 | 자양한양아파트 재건축정비사업 | 조합설립인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 고시일 | 2026-05-28 | structured_value_needs_manual_confirmation | 2026-05-28 | project_comparison_matrix | confirm_structured_value |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 고시번호 | 2026-298 | structured_value_needs_manual_confirmation | 2026-298 | project_comparison_matrix | confirm_structured_value |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 32 | P1 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 사업시행인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 38 | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 총 세대수 |  | value_missing | 1.26; 105; 35층; 2; 1,000; 50; 250; 5층 | notice_key_field_snippet | fill_from_candidate_source |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 건폐율 | 50 | structured_value_needs_manual_confirmation | 2 | cleanup_project_summary | confirm_structured_value |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 층수 | 지상:35/지하:4 | structured_value_needs_manual_confirmation | 지상:35/지하:4 | cleanup_project_summary | confirm_structured_value |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 최고높이 | 109 | structured_value_needs_manual_confirmation | 109 | cleanup_project_summary | confirm_structured_value |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 고시일 | 2018-12-06 | structured_value_needs_manual_confirmation | 2018-12-06 | project_comparison_matrix | confirm_structured_value |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 고시번호 | 2018-399 | structured_value_needs_manual_confirmation | 2018-399 | project_comparison_matrix | confirm_structured_value |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 정비구역 면적 | 28,793 | snippet_candidate_needs_manual_confirmation | 28,793 | cleanup_project_summary | promote_notice_snippet |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 용적률 | 300 | snippet_candidate_needs_manual_confirmation | 300 | cleanup_project_summary | promote_notice_snippet |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 총 세대수 | 725 | snippet_candidate_needs_manual_confirmation | 626 | cleanup_project_summary | promote_notice_snippet |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 관리처분인가일 |  | not_yet_applicable |  |  | defer_stage_not_applicable |
| 45 | P1 | 6 | 대치우성1차아파트 재건축정비사업조합 | 관리처분 공사비 |  | not_yet_applicable |  |  | defer_stage_not_applicable |

## 사용법

1. `fill_from_candidate_source`는 후보 출처를 열어 값·기준시점·단위가 맞는지 확인한 뒤 장부와 비교표 공란을 보강한다.
2. `missing_no_candidate`는 현재 로컬 데이터만으로는 닫지 말고 공식 원문, 정보몽땅 사업개요, 자치구 공고를 추가 검색한다.
3. `defer_stage_not_applicable`은 결측이 아니라 단계상 아직 발생 전인 값으로 보류 사유를 기록한다.
