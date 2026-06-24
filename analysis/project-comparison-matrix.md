# 사업장 비교 매트릭스

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실·구의 생활권 우선검토 후보 30개를 같은 열로 비교하기 위한 파생 산출물이다. 정비사업 정보몽땅, 서울도시공간포털 고시, 광진구청 고시공고, 로컬 원문 파일, 텍스트 추출 상태, 시장 데이터 수집 키를 한 행에 모았다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 후보 사업장 | 30 |
| 서울도시공간포털 매칭 | 19 |
| 사업구역 레이어 보강 | 17 |
| 대표지번 fallback 수동 확정 | 6 |
| 사업구역 기반 고시 후보 | 4 |
| 서울시보 본고시 원문 확보 | 1 |
| 광진구청 고시공고 후보 | 4 |
| 광진구청 첨부 텍스트 확보 | 4 |
| 강남·송파구청 고시공고 후보 | 1 |
| 강남·송파구청 첨부 텍스트 확보 | 1 |
| 정보몽땅 단계 공개항목 보강 | 6 |
| 로컬 고시 원문 보관 | 26 |
| 원문 텍스트 추출 완료 | 28 |
| OCR 이미지 수동 검수 | 8 |
| 원문 수치 보정 후보 보유 사업장 | 5 |
| 공식 원문값 override 적용 | 13 |
| 시장 데이터 키 준비 | 30 |

## 단계 분포

| 단계 묶음 | 건수 |
| --- | --- |
| 조합 이후 | 18 |
| 사업시행 이후 | 6 |
| 구역 확정 | 2 |
| 이주/관리처분 | 2 |
| 조합 전 | 2 |

## 원문 텍스트 상태

| 상태 | 건수 |
| --- | --- |
| text_extracted | 28 |
| no_notice_text | 2 |

## 확인 우선순위

| 순위 | 생활권 | 사업 | 단계 | 원문 상태 | 단계공개 | OCR 수동판정 | 수치보정 | 공식값 override | 다음 작업 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 잠실/송파 | 잠실5단지아파트 주택재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  |  | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 2 | 강남 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  | apply_original_notice_total_units | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 3 | 잠실/송파 | 잠실우성아파트 재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  |  | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 4 | 강남 | 은마아파트 재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  | apply_original_notice_total_units_and_height_correction | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 5 | 잠실/송파 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 조합설립인가 | text_extracted | N |  |  |  | 사업구역 레이어는 매칭됨, 고시 recordCode·인가 원문 수동 확인 |
| 6 | 강남 | 대치우성1차아파트 재건축정비사업조합 | 사업시행인가 | text_extracted | N |  |  | apply_notice_household_and_summary_notice_split_values | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 7 | 강남 | 대치쌍용2차아파트 주택재건축정비사업조합 | 사업시행인가 | text_extracted | N | partial_confirmation_needs_secondary_source; source_value_confirmed_from_image; source_value_precision_mismatch; source_value_basis_mismatch_needs_secondary_source | partial_source_confirmation; source_value_update_recommended |  | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 8 | 강남 | 대치쌍용1차아파트 주택재건축정비사업조합 | 사업시행인가 | text_extracted | N |  |  |  | 보강 고시 원문 텍스트 대조 후 recordCode 확정/승격 |
| 9 | 잠실/송파 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가 | text_extracted | Y |  |  |  | 사업시행·관리처분 공개항목 수치와 고시문/원문 수치 대조 |
| 10 | 강남 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 조합설립인가 | text_extracted | N |  |  | apply_cleanup_summary_total_units | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 11 | 강남 | 압구정아파트지구 특별계획구역4 | 조합설립인가 | text_extracted | N |  |  |  | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 12 | 강남 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  |  | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 13 | 구의/광진 | 자양제7구역 주택재건축정비사업 조합 | 조합설립인가 | text_extracted | N |  |  | apply_original_notice_and_cleanup_total_units | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 14 | 강남 | 개포주공6,7단지아파트 재건축정비사업조합 | 사업시행인가 | text_extracted | N | source_value_confirmed_from_image |  | apply_latest_gangnam_minor_change_notice_values | 강남·송파구청 첨부 텍스트의 사업명·위치·면적을 기존 고시/사업개요와 대조 |
| 15 | 강남 | 압구정한양7차아파트 재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  |  | presentSn 후보는 보조 식별자로 두고, direct 고시·정보몽땅 연결 또는 추가 공식 링크로 current business 여부 확인 |
| 16 | 잠실/송파 | 가락1차현대아파트 재건축정비사업 조합 | 사업시행인가 | text_extracted | N | source_value_precision_mismatch; source_value_confirmed_from_image; source_value_basis_mismatch_needs_secondary_source; source_value_fills_missing_matrix_value; partial_confirmation_needs_secondary_source | source_value_update_recommended; partial_source_confirmation; fill_missing_from_source_image | apply_latest_songpa_official_project_page_values | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 17 | 잠실/송파 | 송파한양2차아파트 재건축정비사업 조합 | 조합설립인가 | text_extracted | N | source_value_confirmed_from_image; source_value_basis_mismatch_needs_secondary_source; source_value_fills_missing_matrix_value; partial_confirmation_needs_secondary_source; source_image_not_suitable_for_current_value | partial_source_confirmation | apply_direct_original_notice_values | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 18 | 잠실/송파 | 송파미성아파트 재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  | apply_original_notice_key_and_total_units | 보강 고시 원문 텍스트 대조 후 recordCode 확정/승격 |
| 19 | 잠실/송파 | 대림가락아파트 재건축정비사업조합 | 조합설립인가 | text_extracted | N | source_value_basis_mismatch_needs_secondary_source; source_value_precision_mismatch; partial_confirmation_needs_secondary_source; source_value_confirmed_from_image | partial_source_confirmation; source_value_update_recommended |  | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | 조합설립인가 | text_extracted | N | source_image_not_suitable_for_current_value |  | apply_latest_original_notice_values | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 21 | 잠실/송파 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가 | text_extracted | Y |  |  | apply_latest_songpa_official_project_page_values | 사업시행·관리처분 공개항목 수치와 고시문/원문 수치 대조 |
| 22 | 구의/광진 | 중곡아파트 주택재건축정비사업조합 | 조합설립인가 | text_extracted | N |  |  |  | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | 조합설립인가 | no_notice_text | Y |  |  |  | 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode·인가 원문 연결 |
| 24 | 구의/광진 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 추진위원회승인 | text_extracted | Y |  |  |  | 광진구청 첨부 텍스트의 인가·계획 수치와 정보몽땅 단계 공개항목 대조 |
| 25 | 구의/광진 | 한양연립 일대 가로주택정비사업 | 착공 공개신호 / 사업시행계획변경인가 직접 원문 | text_extracted | N | source_value_confirmed_from_image; source_value_precision_mismatch |  | apply_latest_gwangjin_implementation_change_and_construction_overview | 광진구 공사개요·예정공정표와 정보몽땅 착공신고 공개 신호를 함께 대조해 현재단계를 재판정 |
| 27 | 구의/광진 | 광장극동아파트 재건축사업 (신속통합기획) | 정비구역지정 | text_extracted | N |  |  |  | analysis/seoul-sibo-original-notice-fact-check.md 기준으로 총세대수·공공기여·용적률 수치 승격 |
| 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | 조합설립인가 | no_notice_text | Y |  |  |  | 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode·인가 원문 연결 |
| 29 | 구의/광진 | 자양1의4구역 가로주택정비사업 | 조합설립인가 | text_extracted | Y | manual_review_record_only; source_value_basis_mismatch_needs_secondary_source | partial_source_confirmation |  | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |

## 잠실/송파

- 후보: 10개
- 단계 분포: 조합 이후 7, 이주/관리처분 2, 사업시행 이후 1
- 원문 텍스트 상태: text_extracted 10
- 우선 확인: 4개

| 순위 | 사업 | 단계 | 면적 | 세대 | 용적률 | 동의율 | 확인 우선 | 다음 작업 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 조합설립인가 | 358,077 | 6,491 | 323 | 100% | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 3 | 잠실우성아파트 재건축정비사업조합 | 조합설립인가 | 120,354.2 |  | 300 | 98.76% | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 조합설립인가 | 343,266.7 |  |  | 94.10 | high | 사업구역 레이어는 매칭됨, 고시 recordCode·인가 원문 수동 확인 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가 | 31,961.1 | 732 | 300 |  | very_high | 사업시행·관리처분 공개항목 수치와 고시문/원문 수치 대조 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 사업시행인가 | 33,953.7 | 842 | 299 |  | high | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 17 | 송파한양2차아파트 재건축정비사업 조합 | 조합설립인가 | 62,370.3 | 1,346 | 230 |  | notice_candidate_review | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 18 | 송파미성아파트 재건축정비사업조합 | 조합설립인가 | 28,959.7 | 810 | 295 |  | notice_candidate_review | 보강 고시 원문 텍스트 대조 후 recordCode 확정/승격 |
| 19 | 대림가락아파트 재건축정비사업조합 | 조합설립인가 | 34,284.1 | 786 | 300 |  | high | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 조합설립인가 | 159,816.7 | 3,113 | 277.88 | 81.46% | high | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가 | 59,715.7 | 1,485 | 300 | 99.57% | very_high | 사업시행·관리처분 공개항목 수치와 고시문/원문 수치 대조 |

## 강남

- 후보: 10개
- 단계 분포: 조합 이후 6, 사업시행 이후 4
- 원문 텍스트 상태: text_extracted 10
- 우선 확인: 1개

| 순위 | 사업 | 단계 | 면적 | 세대 | 용적률 | 동의율 | 확인 우선 | 다음 작업 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 조합설립인가 | 172,588.2 | 2,571 | 230 | 92.45% | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 4 | 은마아파트 재건축정비사업조합 | 조합설립인가 | 243,552.6 | 5,778 | 300 | 96.35 | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 6 | 대치우성1차아파트 재건축정비사업조합 | 사업시행인가 | 28,793 | 725 | 300 | 100 | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 사업시행인가 | 24,484.4 | 490 | 299 |  | high | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 사업시행인가 | 47,659 |  | 300 |  | notice_candidate_review | 보강 고시 원문 텍스트 대조 후 recordCode 확정/승격 |
| 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 조합설립인가 | 400,633.2 | 5,175 | 300 | 96.53 | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 11 | 압구정아파트지구 특별계획구역4 | 조합설립인가 | 118,859.6 |  | 300 |  | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 조합설립인가 | 789.87 |  |  |  | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 사업시행인가 | 116,682.3 | 2,698 | 299.98 | 97.78 | district_text_review | 강남·송파구청 첨부 텍스트의 사업명·위치·면적을 기존 고시/사업개요와 대조 |
| 15 | 압구정한양7차아파트 재건축정비사업조합 | 조합설립인가 | 16,437.1 |  |  |  | high | presentSn 후보는 보조 식별자로 두고, direct 고시·정보몽땅 연결 또는 추가 공식 링크로 current business 여부 확인 |

## 구의/광진

- 후보: 10개
- 단계 분포: 조합 이후 5, 구역 확정 2, 조합 전 2, 사업시행 이후 1
- 원문 텍스트 상태: text_extracted 8, no_notice_text 2
- 우선 확인: 2개

| 순위 | 사업 | 단계 | 면적 | 세대 | 용적률 | 동의율 | 확인 우선 | 다음 작업 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 13 | 자양제7구역 주택재건축정비사업 조합 | 조합설립인가 | 44,658.5 | 917 | 247 |  | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 22 | 중곡아파트 주택재건축정비사업조합 | 조합설립인가 | 10,262.3 |  | 250 |  | high | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 조합설립인가 | 7,653 | 185 | 300 | 91.23% | notice_record_needed | 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode·인가 원문 연결 |
| 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 추진위원회승인 | 89,878 |  |  | 56.22% | gu_text_review | 광진구청 첨부 텍스트의 인가·계획 수치와 정보몽땅 단계 공개항목 대조 |
| 25 | 한양연립 일대 가로주택정비사업 | 착공 공개신호 / 사업시행계획변경인가 직접 원문 | 9,877.80 | 215 | 248.70 |  | gu_text_review | 광진구 공사개요·예정공정표와 정보몽땅 착공신고 공개 신호를 함께 대조해 현재단계를 재판정 |
| 26 | 자양한양아파트 재건축정비사업 | 추진위원회승인 | 40,179.2 | 859 | 293.77 |  | normal | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |
| 27 | 광장극동아파트 재건축사업 (신속통합기획) | 정비구역지정 | 79,417.2 |  | 340 |  | original_notice_fact_checked | analysis/seoul-sibo-original-notice-fact-check.md 기준으로 총세대수·공공기여·용적률 수치 승격 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 조합설립인가 | 2,307.5 |  | 295 | 86.6 | notice_record_needed | 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode·인가 원문 연결 |
| 29 | 자양1의4구역 가로주택정비사업 | 조합설립인가 | 8,419.91 |  |  | 85.0% | gu_text_review | OCR 이미지 수동 판독값을 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리 |
| 30 | 자양4동 A구역 주택재개발사업 | 정비구역지정 | 139,130 |  |  |  | normal | notice-key-fields 스니펫과 PDF 원문을 대조해 확정 수치 승격 |


## 사용 방법

- 확정 비교 수치는 `project-comparison-matrix.csv`의 `*_official` 열을 우선 사용한다.
- `notice-key-fields.csv`에서 온 값은 자동 스니펫 후보이므로 원문 파일과 대조하기 전에는 확정값으로 쓰지 않는다.
- `fact_check_priority=convert_first`는 OCR 또는 HWP 변환이 먼저 필요하다.
- `fact_check_priority=map_match_first`는 서울도시공간포털 recordCode 수동 확인이 먼저 필요하다.
- `fact_check_priority=notice_record_needed`는 사업구역 레이어는 매칭됐지만 결정고시 recordCode와 인가 원문을 별도로 찾아야 한다.
- `has_business_layer_manual_confirmation=Y`는 Edge/UQ120 수동 확인으로 current business presentSn와 데이터 기준일을 채운 케이스다.
- `fact_check_priority=notice_candidate_review`는 사업구역 기반 고시 후보와 원문 파일이 발견됐으므로 원문 수치 대조 후 확정 고시로 승격한다.
- `fact_check_priority=gu_notice_review`는 서울도시공간포털 recordCode는 없지만 광진구청 고시공고 원문 후보와 첨부를 확보했다는 뜻이다.
- `fact_check_priority=gu_text_review`는 광진구청 첨부 텍스트까지 확보했으므로 고시/인가 수치 대조가 다음 단계라는 뜻이다.
- `fact_check_priority=district_notice_review` 또는 `district_text_review`는 강남·송파 자치구 고시공고 고신뢰 후보를 원문 대조 대상으로 분리했다는 뜻이다.
- `has_gangnam_songpa_notice_candidate=Y`는 강남구청·송파구청 고시공고에서 고신뢰 후보를 확보했다는 뜻이며, 원문 수치 대조 전에는 기존 서울도시공간포털 값을 덮어쓰지 않는다.
- `has_stage_public_docs=Y`는 정보몽땅 공개항목에서 사업시행·관리처분·조합설립·추진위 관련 공개표를 별도 확보했다는 뜻이다.
- `manual_ocr_review_count>0`은 원문 이미지를 직접 열어 구조화값과 원문값의 차이 또는 부분확정 상태를 기록했다는 뜻이다.
- `source_value_update_candidate_count>0`은 수동 이미지 판독을 바탕으로 비교용 구조화 수치의 보정 후보를 만들었다는 뜻이다.
- `value_override_status`는 더 최신이거나 더 직접적인 공식 원문이 확인되어 비교표의 공식값 열을 재생성 시점에 보정했다는 뜻이다.
