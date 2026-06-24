# 핵심 수치 확인 장부

작성 기준: 2026-06-24 KST

이 문서는 후보 30개의 핵심 비교 수치를 필드 단위로 펼쳐 현재 값의 확인 상태를 기록한 장부다. 값 자체를 새로 확정하지 않고, 비교 매트릭스에 들어간 수치가 원문 기준으로 어떤 검수 단계에 있는지 구분한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 필드 행 | 420 |
| 후보 사업장 | 30 |
| 즉시 검수 필요 | 124 |
| 공란 필드 | 88 |
| 단계상 아직 적용 전 | 86 |
| OCR 검수 필요 | 1 |
| 시점 충돌 정리 필요 | 0 |
| 관리처분 해소표로 해소 | 11 |
| 시점별 값 분리 유지 | 4 |
| 관리처분 후속 보강 | 1 |
| OCR 원문값 보정 필요 | 4 |
| OCR 부분확정/2차출처 필요 | 13 |
| 원문 이미지 기반 공란 보강 필요 | 3 |
| 원문 이미지로 확인 | 9 |
| 송파 원문 직접확정 | 12 |
| 공식 사업별 페이지 단계일자 확인 | 39 |
| 송파 원문 보조근거 | 4 |
| 송파 원문 정의/시점 분리 필요 | 1 |
| 원문 링크 병목 중 공식 보조근거 직접 일치 | 14 |
| OCR 값 불일치 후보 | 0 |
| OCR 직접 이미지 확인 | 1 |
| OCR 이미지 확인 후보 | 0 |

## 상태별

| 확인 상태 | 필드 수 |
| --- | --- |
| value_missing | 88 |
| not_yet_applicable | 86 |
| structured_value_needs_manual_confirmation | 78 |
| official_stage_date_confirmed | 39 |
| snippet_candidate_needs_manual_confirmation | 30 |
| fact_check_report_available | 13 |
| ocr_partial_confirmation_pending | 13 |
| source_link_required | 13 |
| confirmed_from_original_notice | 12 |
| resolved_by_management_stage_report | 11 |
| confirmed_from_ocr_image | 9 |
| no_source_text | 7 |
| auxiliary_notice_context_only | 4 |
| ocr_source_value_update_required | 4 |
| source_date_split_required | 4 |
| partial_original_notice_confirmation | 3 |
| source_value_fill_missing_required | 3 |
| management_stage_followup_needed | 1 |
| ocr_review_required | 1 |
| source_definition_split_required | 1 |

## 필드별

| 필드 | 행 수 |
| --- | --- |
| 건폐율 | 30 |
| 고시번호 | 30 |
| 고시일 | 30 |
| 관리처분 공사비 | 30 |
| 관리처분인가일 | 30 |
| 단계 공개 동의율 | 30 |
| 사업시행인가일 | 30 |
| 용적률 | 30 |
| 정비구역 면적 | 30 |
| 조합설립인가일 | 30 |
| 총 세대수 | 30 |
| 최고높이 | 30 |
| 추진위원회 승인일 | 30 |
| 층수 | 30 |

## OCR 트리아지별

| OCR 검수 상태 | 필드 수 |
| --- | --- |
| poor_ocr_direct_image_required | 1 |

## 원문 링크 보조근거

| 장부 | 상태 | 큐 | 후보 | 사업장 | 필드 | 현재 값 | 보조근거 | 보조근거 값 | 일치 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | source_link_required | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비구역 면적 | 7,653 | 정보몽땅 사업개요 | 7,653 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 27 | source_link_required | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 용적률 | 300 | 정보몽땅 사업개요 | 300 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 28 | source_link_required | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 정비구역 면적 | 2,307.5 | 정보몽땅 사업개요 | 2,307.5 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 29 | source_link_required | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 용적률 | 295 | 정보몽땅 사업개요 | 295 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 30 | source_link_required | P1 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 정비구역 면적 | 16,437.1 | 정보몽땅 사업개요 | 16,437.1 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 31 | source_link_required | P1 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 고시번호 | 2023-516 | 로컬 고시 텍스트 | 2023-516 | exact | 현재 큐에 연결된 로컬 고시 텍스트의 파일명 또는 본문에서 고시번호/고시일이 현재값과 일치한다. recordCode 또는 원문 URL 보강은 계속 필요하다. |
| 33 | source_link_required | P1 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 정비구역 면적 | 89,878 | 정보몽땅 사업개요 | 89,878 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 328 | no_source_text | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 건폐율 | 20 | 정보몽땅 사업개요 | 20 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 329 | no_source_text | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 층수 | 지상:40/지하:3 | 정보몽땅 사업개요 | 지상:40/지하:3 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 330 | no_source_text | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 최고높이 | 0 | 정보몽땅 사업개요 | 0 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 331 | no_source_text | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 총 세대수 | 185 | 정보몽땅 사업개요 | 185 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 332 | no_source_text | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 건폐율 | 23 | 정보몽땅 사업개요 | 23 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 333 | no_source_text | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 층수 | 지상:20/지하:3 | 정보몽땅 사업개요 | 지상:20/지하:3 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |
| 334 | no_source_text | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 최고높이 | 58 | 정보몽땅 사업개요 | 58 | exact | 정보몽땅 사업개요의 구조화 값이 현재값과 일치한다. |

## 상위 확인 대상

| 장부 | 상태 | 리스크 | 후보 | 사업장 | 필드 | 현재 값 | OCR 상태 | OCR 대체값 | 수동 OCR | 이미지 원문값 | 보조근거 | 다음 확인 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ocr_review_required | very_high | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 총 세대수 | 3,113 | poor_ocr_direct_image_required |  |  |  |  | OCR 매칭 실패. 원문 이미지를 직접 확대 확인하거나 재OCR/원본 PDF 재처리 |
| 2 | ocr_source_value_update_required | very_high | 16 | 가락1차현대아파트 재건축정비사업 조합 | 용적률 | 299 |  |  | source_value_precision_mismatch | 법적상한용적률 299.20% 이하 / 정비계획 234.09% 이하 |  | floor_area_ratio_pct_official은 299.20으로 정밀도 보정하거나 정비계획 234.09%와 법적상한 299.20%를 별도 필드로 분리 |
| 3 | ocr_source_value_update_required | very_high | 16 | 가락1차현대아파트 재건축정비사업 조합 | 최고높이 | 104 |  |  | source_value_precision_mismatch | 해발고도 104.5m 이하 / 최고22층 이하 |  | max_height_m_official은 104.5로 정밀도 보정하거나 별도 source_value_precise에 104.5m 이하를 기록 |
| 4 | ocr_partial_confirmation_pending | very_high | 16 | 가락1차현대아파트 재건축정비사업 조합 | 건폐율 | 24 |  |  | source_value_basis_mismatch_needs_secondary_source | 건폐율 50% 이하 |  | building_coverage_ratio_pct_official 24는 바로 확정하지 말고 계획상 건폐율 50% 이하와 사업개요/인가 기준 건폐율을 분리 확인 |
| 5 | ocr_partial_confirmation_pending | very_high | 16 | 가락1차현대아파트 재건축정비사업 조합 | 층수 | 지상:21/지하:미확인 |  |  | partial_confirmation_needs_secondary_source | 해발고도 104.5m 이하 / 최고22층 이하 |  | floors_official은 지상 최고22층 확인으로 표시하고 지하층은 사업시행계획서 또는 다른 원문에서 2차 확인 |
| 6 | source_value_fill_missing_required | very_high | 16 | 가락1차현대아파트 재건축정비사업 조합 | 총 세대수 | 842 |  |  | source_value_fills_missing_matrix_value | 총 942세대 |  | total_households_official 공란 보강 후보로 942세대를 기록하고 사업시행인가 또는 정보몽땅 사업개요와 2차 대조 |
| 7 | ocr_source_value_update_required | high | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 용적률 | 299 |  |  | source_value_precision_mismatch | 정비계획용적률 250.0% 이하 / 예정 법적상한용적률 299.82% 이하 |  | floor_area_ratio_pct_official은 법적상한 299.82% 이하로 정밀도 보정하거나 기준용적률 250.0%와 병기 |
| 8 | ocr_source_value_update_required | high | 19 | 대림가락아파트 재건축정비사업조합 | 용적률 | 300 |  |  | source_value_precision_mismatch | 법적상한용적률 299.98% 이하 / 정비계획 234.36% 이하 |  | floor_area_ratio_pct_official은 법적상한 299.98% 이하로 정밀도 보정하거나 정비계획 234.36%와 법적상한을 별도 필드로 분리 |
| 9 | ocr_partial_confirmation_pending | high | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 건폐율 | 21 |  |  | source_value_basis_mismatch_needs_secondary_source | 건폐율 30% 이하 |  | building_coverage_ratio_pct 21은 실제 건축계획 또는 사업시행계획 원문에서 2차 확인하고, 정비계획 허용 건폐율 30% 이하와 병기 |
| 10 | ocr_partial_confirmation_pending | high | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 층수 | 지상:35/지하:3 |  |  | partial_confirmation_needs_secondary_source | 최고35층 / 110m 이하 |  | floors_official은 지상 최고35층 확인으로 표시하고 지하3층은 사업시행계획서 또는 다른 원문에서 2차 확인 |
| 11 | ocr_partial_confirmation_pending | high | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 최고높이 | 111 |  |  | source_value_basis_mismatch_needs_secondary_source | 최고35층 / 110m 이하 |  | max_height_m 111은 별도 건축심의/사업시행계획 원문에서 2차 확인하고, 2017 정비계획 원문값 110m 이하와 병기 |
| 12 | ocr_partial_confirmation_pending | high | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 총 세대수 | 490 |  |  | source_value_basis_mismatch_needs_secondary_source | 주택공급계획 변경 합계 560세대 |  | total_households 490은 이후 사업시행계획/분양승인 등 다른 원문에서 2차 확인하고, 2017 정비계획 원문값 560세대와 병기 |
| 13 | ocr_partial_confirmation_pending | high | 17 | 송파한양2차아파트 재건축정비사업 조합 | 건폐율 | 30 |  |  | source_value_basis_mismatch_needs_secondary_source | 제3종일반주거지역 50% 이하 |  | building_coverage_ratio_pct 30%는 사업시행계획 또는 별도 정비계획 원문에서 2차 확인 |
| 14 | ocr_partial_confirmation_pending | high | 17 | 송파한양2차아파트 재건축정비사업 조합 | 층수 | 지상:29/지하:미확인 |  |  | partial_confirmation_needs_secondary_source | 96m 이하 / 29층 이하 |  | floors_official은 지상 최고29층 확인으로 표시하고 지하층은 사업시행계획서 또는 후속 인가 원문에서 2차 확인 |
| 15 | ocr_partial_confirmation_pending | high | 19 | 대림가락아파트 재건축정비사업조합 | 건폐율 | 21 |  |  | source_value_basis_mismatch_needs_secondary_source | 건폐율 50% 이하 |  | building_coverage_ratio_pct 21은 실제 건축계획 또는 사업시행계획 원문에서 2차 확인하고, 정비계획 허용 건폐율 50% 이하와 병기 |
| 16 | ocr_partial_confirmation_pending | high | 19 | 대림가락아파트 재건축정비사업조합 | 정비구역 면적 | 34,284.1 |  |  | source_value_basis_mismatch_needs_secondary_source | 정비구역 35,241.0㎡ / 획지1 34,043.8㎡ |  | district_area_sqm 34,284.1은 별도 사업개요 또는 후속 인가 원문에서 2차 확인하고, 2021 정비계획 원문값과 분리 |
| 17 | ocr_partial_confirmation_pending | high | 19 | 대림가락아파트 재건축정비사업조합 | 층수 | 지상:35/지하:2 |  |  | partial_confirmation_needs_secondary_source | 해발고도 129m 이하 / 최고35층 이하 |  | floors_official은 지상 최고35층 확인으로 표시하고 지하2층은 사업시행계획서 또는 건축심의 원문에서 2차 확인 |
| 18 | ocr_partial_confirmation_pending | high | 19 | 대림가락아파트 재건축정비사업조합 | 총 세대수 | 786 |  |  | source_value_basis_mismatch_needs_secondary_source | 주택공급계획 925세대 |  | total_households 786은 후속 사업시행계획 또는 정보몽땅 사업개요에서 2차 확인하고, 2021 정비계획 원문값 925세대와 병기 |
| 19 | source_link_required | very_high | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 건폐율 | 50 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | 마천1의 건폐율은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 20 | source_link_required | very_high | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 정비구역 면적 | 159,816.7 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시의 광역 구역 면적 |  | 마천1의 현 정비구역 면적은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 21 | source_link_required | very_high | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 용적률 | 277.88 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | 마천1의 용적률은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 22 | source_link_required | very_high | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 층수 | 지상:49/지하:미확인 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | 마천1의 층수는 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 23 | source_link_required | very_high | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 최고높이 | 160 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | 마천1의 높이 기준은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 24 | ocr_partial_confirmation_pending | high | 29 | 자양1의4구역 가로주택정비사업 | 정비구역 면적 | 8,419.91 |  |  | source_value_basis_mismatch_needs_secondary_source | 조합설립 변경인가 공고 구역면적 8,473.82㎡ |  | district_area_sqm 8,419.91은 이전 사업개요 또는 다른 원문에서 2차 확인하고, 2025 변경인가 공고 원문값 8,473.82㎡와 병기 |
| 25 | source_value_fill_missing_required | high | 17 | 송파한양2차아파트 재건축정비사업 조합 | 총 세대수 | 1,346 |  |  | source_value_fills_missing_matrix_value | 총 1,346세대(공공주택 254세대 포함) |  | total_households_official 공란을 직접 고시 1,346세대로 보강하고, 공공주택 254세대 포함 문구를 display_values에 병기 |
| 26 | source_link_required | high | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비구역 면적 | 7,653 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 27 | source_link_required | high | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 용적률 | 300 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 28 | source_link_required | high | 28 | 자양번영로3나길 일대 가로주택정비사업 | 정비구역 면적 | 2,307.5 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 29 | source_link_required | high | 28 | 자양번영로3나길 일대 가로주택정비사업 | 용적률 | 295 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 30 | source_link_required | high | 15 | 압구정한양7차아파트 재건축정비사업조합 | 정비구역 면적 | 16,437.1 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 31 | source_link_required | high | 15 | 압구정한양7차아파트 재건축정비사업조합 | 고시번호 | 2023-516 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 32 | source_link_required | high | 17 | 송파한양2차아파트 재건축정비사업 조합 | 최고높이 | 96 |  |  | source_image_not_suitable_for_current_value | 가락아파트지구 용도지구 및 개발기본계획 변경 고시 이미지 |  | 송파한양2차 최고높이 130m는 별도 건축심의/정비계획 원문에서 다시 연결 |
| 33 | source_link_required | high | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 정비구역 면적 | 89,878 |  |  |  |  | official_summary_exact_match_pending_original_notice | recordCode, noticeCode, 고시번호, 원문 파일 연결을 먼저 확정 |
| 34 | source_value_fill_missing_required | watch | 18 | 송파미성아파트 재건축정비사업조합 | 총 세대수 | 810 |  |  |  |  |  | 현재 공란인 총 세대수의 원문 확인 후보로 기록하되 건축위원회 최종 결정 가능성 주석 유지 |
| 35 | management_stage_followup_needed | very_high | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분 공사비 |  |  |  |  |  |  | 관리처분 별첨 또는 조합 공개표에서 공사비 보강 / 정보몽땅 공개항목의 별첨 원문, 최신 변경고시, 관리처분 인가 고시 원문 |
| 36 | value_missing | very_high | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 고시일 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 37 | value_missing | very_high | 3 | 잠실우성아파트 재건축정비사업조합 | 총 세대수 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 38 | value_missing | very_high | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 건폐율 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 39 | value_missing | very_high | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 층수 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 40 | value_missing | very_high | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 최고높이 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 41 | value_missing | very_high | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 총 세대수 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 42 | value_missing | high | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 고시일 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 43 | value_missing | high | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 고시번호 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 44 | value_missing | high | 28 | 자양번영로3나길 일대 가로주택정비사업 | 고시일 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 45 | value_missing | high | 28 | 자양번영로3나길 일대 가로주택정비사업 | 고시번호 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 46 | value_missing | very_high | 9 | 잠실우성4차 주택재건축정비사업조합 | 추진위원회 승인일 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 47 | value_missing | very_high | 9 | 잠실우성4차 주택재건축정비사업조합 | 단계 공개 동의율 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 48 | value_missing | very_high | 13 | 자양제7구역 주택재건축정비사업 조합 | 추진위원회 승인일 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 49 | value_missing | very_high | 13 | 자양제7구역 주택재건축정비사업 조합 | 단계 공개 동의율 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |
| 50 | value_missing | very_high | 13 | 자양제7구역 주택재건축정비사업 조합 | 조합설립인가일 |  |  |  |  |  |  | 공식 원문 또는 정보몽땅 공개항목에서 값을 보강하거나 미공개 사유를 기록 |

## 즉시 검수 필요

| 장부 | 상태 | 큐 | 후보 | 사업장 | 필드 | 현재 값 | OCR 상태 | OCR 대체값 | 수동 OCR | 이미지 원문값 | 보조근거 | 열어볼 원문/파일 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ocr_review_required | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 총 세대수 | 3,113 | poor_ocr_direct_image_required |  |  |  |  | analysis/ocr-source-review-triage.md; data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-1.png; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 2 | ocr_source_value_update_required | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 용적률 | 299 |  |  | source_value_precision_mismatch | 법적상한용적률 299.20% 이하 / 정비계획 234.09% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 3 | ocr_source_value_update_required | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 최고높이 | 104 |  |  | source_value_precision_mismatch | 해발고도 104.5m 이하 / 최고22층 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 4 | ocr_partial_confirmation_pending | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 건폐율 | 24 |  |  | source_value_basis_mismatch_needs_secondary_source | 건폐율 50% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 5 | ocr_partial_confirmation_pending | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 층수 | 지상:21/지하:미확인 |  |  | partial_confirmation_needs_secondary_source | 해발고도 104.5m 이하 / 최고22층 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 6 | source_value_fill_missing_required | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 총 세대수 | 842 |  |  | source_value_fills_missing_matrix_value | 총 942세대 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 7 | ocr_source_value_update_required | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 용적률 | 299 |  |  | source_value_precision_mismatch | 정비계획용적률 250.0% 이하 / 예정 법적상한용적률 299.82% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 8 | ocr_source_value_update_required | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 용적률 | 300 |  |  | source_value_precision_mismatch | 법적상한용적률 299.98% 이하 / 정비계획 234.36% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt |
| 9 | ocr_partial_confirmation_pending | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 건폐율 | 21 |  |  | source_value_basis_mismatch_needs_secondary_source | 건폐율 30% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 10 | ocr_partial_confirmation_pending | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 층수 | 지상:35/지하:3 |  |  | partial_confirmation_needs_secondary_source | 최고35층 / 110m 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 11 | ocr_partial_confirmation_pending | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 최고높이 | 111 |  |  | source_value_basis_mismatch_needs_secondary_source | 최고35층 / 110m 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 12 | ocr_partial_confirmation_pending | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 총 세대수 | 490 |  |  | source_value_basis_mismatch_needs_secondary_source | 주택공급계획 변경 합계 560세대 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 13 | ocr_partial_confirmation_pending | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 건폐율 | 30 |  |  | source_value_basis_mismatch_needs_secondary_source | 제3종일반주거지역 50% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시.txt |
| 14 | ocr_partial_confirmation_pending | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 층수 | 지상:29/지하:미확인 |  |  | partial_confirmation_needs_secondary_source | 96m 이하 / 29층 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시.txt |
| 15 | ocr_partial_confirmation_pending | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 건폐율 | 21 |  |  | source_value_basis_mismatch_needs_secondary_source | 건폐율 50% 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt |
| 16 | ocr_partial_confirmation_pending | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 정비구역 면적 | 34,284.1 |  |  | source_value_basis_mismatch_needs_secondary_source | 정비구역 35,241.0㎡ / 획지1 34,043.8㎡ |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt |
| 17 | ocr_partial_confirmation_pending | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 층수 | 지상:35/지하:2 |  |  | partial_confirmation_needs_secondary_source | 해발고도 129m 이하 / 최고35층 이하 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt |
| 18 | ocr_partial_confirmation_pending | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 총 세대수 | 786 |  |  | source_value_basis_mismatch_needs_secondary_source | 주택공급계획 925세대 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt |
| 19 | source_link_required | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 건폐율 | 50 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 20 | source_link_required | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 정비구역 면적 | 159,816.7 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시의 광역 구역 면적 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 21 | source_link_required | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 용적률 | 277.88 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 22 | source_link_required | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 층수 | 지상:49/지하:미확인 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 23 | source_link_required | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 최고높이 | 160 |  |  | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/20-11000NTC202606080004-20-11000NTC202606080004-notice_file-서울특별시_제2026-298호_고시문.txt |
| 24 | ocr_partial_confirmation_pending | P1 | 29 | 자양1의4구역 가로주택정비사업 | 정비구역 면적 | 8,419.91 |  |  | source_value_basis_mismatch_needs_secondary_source | 조합설립 변경인가 공고 구역면적 8,473.82㎡ |  | analysis/ocr-image-review-decisions.md; data/urban/text/gwangjin-gu/files/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt |
| 25 | source_value_fill_missing_required | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 총 세대수 | 1,346 |  |  | source_value_fills_missing_matrix_value | 총 1,346세대(공공주택 254세대 포함) |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시.txt |
| 26 | source_link_required | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비구역 면적 | 7,653 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 27 | source_link_required | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 용적률 | 300 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900000929v34&stepSeCode=102&div=sumry |
| 28 | source_link_required | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 정비구역 면적 | 2,307.5 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 29 | source_link_required | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 용적률 | 295 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001146M77&stepSeCode=102&div=sumry |
| 30 | source_link_required | P1 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 정비구역 면적 | 16,437.1 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680100003000s45&stepSeCode=102&div=sumry; data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 31 | source_link_required | P1 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 고시번호 | 2023-516 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 32 | source_link_required | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 최고높이 | 96 |  |  | source_image_not_suitable_for_current_value | 가락아파트지구 용도지구 및 개발기본계획 변경 고시 이미지 |  | analysis/ocr-image-review-decisions.md; data/urban/text/files/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시.txt |
| 33 | source_link_required | P1 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 정비구역 면적 | 89,878 |  |  |  |  | official_summary_exact_match_pending_original_notice | analysis/source-link-repair-candidates.md; data/cleanup/project-summaries-priority-candidates.json; https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001363i54&stepSeCode=101&div=sumry; data/urban/text/gwangjin-gu/files/24-B0000378-16413-1-24-B0000378-16413-gwangjin-gu-1-붙임2-주민의견제출서.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-2-24-B0000378-16413-gwangjin-gu-2-붙임1-워커힐아파트-일대-도시관리계획수립-전략환경영향평가-항목-범위-등의-결정내용.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-3-24-B0000378-16413-gwangjin-gu-3-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |
| 34 | source_value_fill_missing_required |  | 18 | 송파미성아파트 재건축정비사업조합 | 총 세대수 | 810 |  |  |  |  |  | analysis/songpa-notice-value-corroboration.md; data/urban/text/files/18-11710NTC202104230008-18-11710NTC202104230008-notice_file-서울특별시_2021-146호_고시.txt |
| 35 | management_stage_followup_needed | P0 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분 공사비 |  |  |  |  |  |  | analysis/management-stage-value-resolution.md; analysis/management-stage-fact-check.md; data/urban/text/files/09-11000NTC201707068193-09-11000NTC201707068193-notice_file-서울특별시2017-239.txt |
| 36 | value_missing | P0 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 고시일 |  |  |  |  |  |  | data/urban/text/files/05-11000NTC202505290003-05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.txt |
| 37 | value_missing | P1 | 3 | 잠실우성아파트 재건축정비사업조합 | 총 세대수 |  |  |  |  |  |  | data/urban/text/files/03-11000NTC201512177681-03-11000NTC201512177681-notice_file-서울특별시2015-401.txt |
| 38 | value_missing | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 건폐율 |  |  |  |  |  |  | data/urban/text/files/05-11000NTC202505290003-05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.txt |
| 39 | value_missing | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 층수 |  |  |  |  |  |  | data/urban/text/files/05-11000NTC202505290003-05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.txt |
| 40 | value_missing | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 최고높이 |  |  |  |  |  |  | data/urban/text/files/05-11000NTC202505290003-05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.txt |
| 41 | value_missing | P1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 총 세대수 |  |  |  |  |  |  | data/urban/text/files/05-11000NTC202505290003-05-11000NTC202505290003-notice_file-서울특별시_제2025-278호_고시.txt |
| 42 | value_missing | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 고시일 |  |  |  |  |  |  |  |
| 43 | value_missing | P0 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 고시번호 |  |  |  |  |  |  |  |
| 44 | value_missing | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 고시일 |  |  |  |  |  |  |  |
| 45 | value_missing | P0 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 고시번호 |  |  |  |  |  |  |  |
| 46 | value_missing |  | 9 | 잠실우성4차 주택재건축정비사업조합 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/09-11000NTC201707068193-09-11000NTC201707068193-notice_file-서울특별시2017-239.txt |
| 47 | value_missing |  | 9 | 잠실우성4차 주택재건축정비사업조합 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/09-11000NTC201707068193-09-11000NTC201707068193-notice_file-서울특별시2017-239.txt |
| 48 | value_missing |  | 13 | 자양제7구역 주택재건축정비사업 조합 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/13-11000NTC201808300002-13-11000NTC201808300002-notice_file-서울특별시2018-268.txt |
| 49 | value_missing |  | 13 | 자양제7구역 주택재건축정비사업 조합 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/13-11000NTC201808300002-13-11000NTC201808300002-notice_file-서울특별시2018-268.txt |
| 50 | value_missing |  | 13 | 자양제7구역 주택재건축정비사업 조합 | 조합설립인가일 |  |  |  |  |  |  | data/urban/text/files/13-11000NTC201808300002-13-11000NTC201808300002-notice_file-서울특별시2018-268.txt |
| 51 | value_missing | P1 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 고시일 |  |  |  |  |  |  | data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 52 | value_missing |  | 16 | 가락1차현대아파트 재건축정비사업 조합 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 53 | value_missing | P1 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 고시일 |  |  |  |  |  |  | data/urban/text/gwangjin-gu/files/24-B0000378-16413-1-24-B0000378-16413-gwangjin-gu-1-붙임2-주민의견제출서.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-2-24-B0000378-16413-gwangjin-gu-2-붙임1-워커힐아파트-일대-도시관리계획수립-전략환경영향평가-항목-범위-등의-결정내용.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-3-24-B0000378-16413-gwangjin-gu-3-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |
| 54 | value_missing | P1 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | 고시번호 |  |  |  |  |  |  | data/urban/text/gwangjin-gu/files/24-B0000378-16413-1-24-B0000378-16413-gwangjin-gu-1-붙임2-주민의견제출서.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-2-24-B0000378-16413-gwangjin-gu-2-붙임1-워커힐아파트-일대-도시관리계획수립-전략환경영향평가-항목-범위-등의-결정내용.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16413-3-24-B0000378-16413-gwangjin-gu-3-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt; data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |
| 55 | value_missing |  | 26 | 자양한양아파트 재건축정비사업 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/26-11215NTC202406040002-26-11215NTC202406040002-notice_file-서울특별시_제2024-267호_고시.txt |
| 56 | value_missing |  | 26 | 자양한양아파트 재건축정비사업 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/26-11215NTC202406040002-26-11215NTC202406040002-notice_file-서울특별시_제2024-267호_고시.txt |
| 57 | value_missing | P1 | 29 | 자양1의4구역 가로주택정비사업 | 고시일 |  |  |  |  |  |  | data/urban/text/gwangjin-gu/files/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt |
| 58 | value_missing | P1 | 29 | 자양1의4구역 가로주택정비사업 | 고시번호 |  |  |  |  |  |  | data/urban/text/gwangjin-gu/files/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안.txt; data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt |
| 59 | value_missing |  | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 사업시행인가일 |  |  |  |  |  |  | data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 60 | value_missing |  | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 61 | value_missing |  | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 62 | value_missing |  | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 조합설립인가일 |  |  |  |  |  |  | data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| 63 | value_missing |  | 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 사업시행인가일 |  |  |  |  |  |  | data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt |
| 64 | value_missing |  | 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt |
| 65 | value_missing |  | 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt |
| 66 | value_missing | P3 | 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 총 세대수 |  |  |  |  |  |  | data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt |
| 67 | value_missing |  | 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 조합설립인가일 |  |  |  |  |  |  | data/urban/text/files/08-11680NTC202112010001-08-11680NTC202112010001-business-notice_file-강남구_2021-203호_고시.txt |
| 68 | value_missing |  | 11 | 압구정아파트지구 특별계획구역4 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 69 | value_missing |  | 11 | 압구정아파트지구 특별계획구역4 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 70 | value_missing | P3 | 11 | 압구정아파트지구 특별계획구역4 | 총 세대수 |  |  |  |  |  |  | data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 71 | value_missing |  | 11 | 압구정아파트지구 특별계획구역4 | 조합설립인가일 |  |  |  |  |  |  | data/urban/text/files/11-11000NTC202312010004-11-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 72 | value_missing | P3 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 건폐율 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 73 | value_missing | P3 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 용적률 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 74 | value_missing | P3 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 층수 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 75 | value_missing | P3 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 최고높이 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 76 | value_missing |  | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 추진위원회 승인일 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 77 | value_missing |  | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 단계 공개 동의율 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 78 | value_missing | P3 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 총 세대수 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 79 | value_missing |  | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 조합설립인가일 |  |  |  |  |  |  | data/urban/text/files/12-11000NTC202312010004-12-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |
| 80 | value_missing | P3 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 건폐율 |  |  |  |  |  |  | data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt |

## 사용법

1. `conflict_needs_resolution`, `management_stage_followup_needed`, `source_definition_split_required`, `ocr_source_value_update_required`, `ocr_partial_confirmation_pending`, `source_value_fill_missing_required`, `ocr_review_required`, `source_link_required`, `value_missing` 순으로 처리한다.
2. `resolved_by_management_stage_report`는 `analysis/management-stage-value-resolution.md`의 해소 근거를 사업별 메모와 비교표에 반영한다.
3. `source_date_split_required`는 고시 시점 값과 사업시행/관리처분 단계 값을 별도 열로 유지한다.
4. `ocr_review_required`는 `ocr_review_status`를 보고 `ocr_snippet_value_mismatch`와 직접 이미지 확인 항목을 먼저 분리한다.
5. `confirmed_from_ocr_image`, `ocr_source_value_update_required`, `ocr_partial_confirmation_pending`, `source_value_fill_missing_required`는 `analysis/ocr-image-review-decisions.md`의 수동 이미지 판독 결과를 반영한다.
6. `confirmed_from_original_notice`, `source_definition_split_required`, `auxiliary_notice_context_only`는 `analysis/songpa-notice-value-corroboration.md`의 사업별 원문 확정성 판정을 먼저 읽는다.
7. 처리 후 사업별 메모와 비교 매트릭스에 `confirmed`, `pending`, `conflict` 같은 상태 메모를 남긴다.
8. `fact_check_report_available`은 이미 별도 fact-check 문서가 있으므로 그 문서를 읽어 확정 수치 승격 여부를 결정한다.
9. `official_summary_exact_match_pending_original_notice`는 정보몽땅 사업개요 같은 공식 보조근거가 현재값과 일치한다는 뜻이다. 본고시 원문 연결이 필요한 상태 자체는 유지한다.
10. 이 장부는 자동 상태 분류이므로, 최종 확정은 원문 이미지/PDF/HWP와 문맥 대조 후 한다.
