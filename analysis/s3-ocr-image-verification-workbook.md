# S3 OCR·이미지 수치 검증 워크북

작성 기준: 2026-06-24 KST

`source-verification-sprint-plan`의 S3 OCR 대상 사업장을 장부 필드, OCR 텍스트, 원문 이미지 수동 판정 로그와 연결한 실행 보드다. 이 문서는 새 값을 자동 확정하지 않고, 이미 확인된 이미지 판독값과 아직 2차 원문이 필요한 필드를 분리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| S3 사업장 | 6 |
| P0 사업장 | 2 |
| P1 사업장 | 4 |
| OCR 관련 장부 필드 | 31 |
| 수동 이미지 판정 필드 | 30 |
| 원문 이미지 확인/확정 | 3 |
| 정밀도/값 보정 필요 | 4 |
| 부분확정·2차 출처 필요 | 13 |
| 원문 재연결 필요 | 6 |
| OCR 텍스트 원문 | 8 |
| OCR 이미지 파일 | 101 |

## 상태별

| 상태 | 사업장 |
| --- | --- |
| source_value_update_required | 3 |
| needs_relinked_original_notice | 2 |
| partial_confirmation_needs_secondary_source | 1 |

## 사업장 실행 보드

| 큐 | 우선 | 생활권 | 후보 | 사업장 | 필드 | 확정 | 보정 | 부분/2차 | 재연결 | OCR 원문 | 이미지 | S3 상태 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | P0 | 잠실/송파 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 6 | 1 | 2 | 2 | 0 | 1 | 20 | source_value_update_required | 원문 이미지 판독값을 보정 후보에 반영하고 기준값/상한값 필드를 분리 |
| 13 | P0 | 잠실/송파 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 6 | 0 | 0 | 0 | 5 | 1 | 2 | needs_relinked_original_notice | 현재 이미지가 장부값 기준시점과 맞지 않는 필드를 먼저 원문/recordCode로 재연결 |
| 33 | P1 | 강남 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 6 | 1 | 1 | 4 | 0 | 1 | 8 | source_value_update_required | 원문 이미지 판독값을 보정 후보에 반영하고 기준값/상한값 필드를 분리 |
| 35 | P1 | 잠실/송파 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 6 | 0 | 0 | 2 | 1 | 2 | 48 | needs_relinked_original_notice | 현재 이미지가 장부값 기준시점과 맞지 않는 필드를 먼저 원문/recordCode로 재연결 |
| 36 | P1 | 잠실/송파 | 19 | 대림가락아파트 재건축정비사업조합 | 6 | 1 | 1 | 4 | 0 | 1 | 21 | source_value_update_required | 원문 이미지 판독값을 보정 후보에 반영하고 기준값/상한값 필드를 분리 |
| 37 | P1 | 구의/광진 | 29 | 자양1의4구역 가로주택정비사업 | 1 | 0 | 0 | 1 | 0 | 2 | 2 | partial_confirmation_needs_secondary_source | 이미지에서 확인된 요소와 미확인 요소를 나눠 사업시행계획·사업개요로 2차 확인 |

## 필드별 검증 행

| 큐 | 우선 | 후보 | 사업장 | 필드 | 장부값 | 장부 상태 | 이미지 판정 | 이미지 원문값 | 이미지 | 권장 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 용적률 | 299 | ocr_source_value_update_required | source_value_precision_mismatch | 법적상한용적률 299.20% 이하 / 정비계획 234.09% 이하 | data/urban/text/ocr/images/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시/page-05.png | floor_area_ratio_pct_official은 299.20으로 정밀도 보정하거나 정비계획 234.09%와 법적상한 299.20%를 별도 필드로 분리 |
| 12 | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 최고높이 | 104 | ocr_source_value_update_required | source_value_precision_mismatch | 해발고도 104.5m 이하 / 최고22층 이하 | data/urban/text/ocr/images/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시/page-05.png | max_height_m_official은 104.5로 정밀도 보정하거나 별도 source_value_precise에 104.5m 이하를 기록 |
| 12 | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 건폐율 | 24 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 건폐율 50% 이하 | data/urban/text/ocr/images/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시/page-05.png | building_coverage_ratio_pct_official 24는 바로 확정하지 말고 계획상 건폐율 50% 이하와 사업개요/인가 기준 건폐율을 분리 확인 |
| 12 | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 층수 | 지상:21/지하:미확인 | ocr_partial_confirmation_pending | partial_confirmation_needs_secondary_source | 해발고도 104.5m 이하 / 최고22층 이하 | data/urban/text/ocr/images/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시/page-05.png | floors_official은 지상 최고22층 확인으로 표시하고 지하층은 사업시행계획서 또는 다른 원문에서 2차 확인 |
| 12 | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 총 세대수 | 842 | source_value_fill_missing_required | source_value_fills_missing_matrix_value | 총 942세대 | data/urban/text/ocr/images/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시/page-05.png | total_households_official 공란 보강 후보로 942세대를 기록하고 사업시행인가 또는 정보몽땅 사업개요와 2차 대조 |
| 12 | P0 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 정비구역 면적 | 33,953.7 | confirmed_from_ocr_image | source_value_confirmed_from_image | 정비구역 면적 33,953.7㎡ / 토지이용계획 합계 33,953.7㎡ | data/urban/text/ocr/images/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시/page-02.png | district_area_sqm_official은 원문 이미지 기준 33,953.7㎡로 확인됨 |
| 13 | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 총 세대수 | 3,113 | ocr_review_required |  |  | data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-1.png | OCR 매칭 실패. 원문 이미지를 직접 확대 확인하거나 재OCR/원본 PDF 재처리 |
| 13 | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 건폐율 | 50 | source_link_required | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 | data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-2.png | 마천1의 건폐율은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 13 | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 정비구역 면적 | 159,816.7 | source_link_required | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시의 광역 구역 면적 | data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-1.png | 마천1의 현 정비구역 면적은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 13 | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 용적률 | 277.88 | source_link_required | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 | data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-1.png | 마천1의 용적률은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 13 | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 층수 | 지상:49/지하:미확인 | source_link_required | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 | data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-1.png | 마천1의 층수는 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 13 | P0 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 최고높이 | 160 | source_link_required | source_image_not_suitable_for_current_value | 1982년 건설부 도시계획 입안 고시 이미지 | data/urban/text/ocr/images/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470/page-1.png | 마천1의 높이 기준은 별도 재정비촉진계획/정비계획 변경 원문에서 다시 연결 |
| 33 | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 용적률 | 299 | ocr_source_value_update_required | source_value_precision_mismatch | 정비계획용적률 250.0% 이하 / 예정 법적상한용적률 299.82% 이하 | data/urban/text/ocr/images/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99/page-4.png | floor_area_ratio_pct_official은 법적상한 299.82% 이하로 정밀도 보정하거나 기준용적률 250.0%와 병기 |
| 33 | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 건폐율 | 21 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 건폐율 30% 이하 | data/urban/text/ocr/images/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99/page-4.png | building_coverage_ratio_pct 21은 실제 건축계획 또는 사업시행계획 원문에서 2차 확인하고, 정비계획 허용 건폐율 30% 이하와 병기 |
| 33 | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 층수 | 지상:35/지하:3 | ocr_partial_confirmation_pending | partial_confirmation_needs_secondary_source | 최고35층 / 110m 이하 | data/urban/text/ocr/images/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99/page-4.png | floors_official은 지상 최고35층 확인으로 표시하고 지하3층은 사업시행계획서 또는 다른 원문에서 2차 확인 |
| 33 | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 최고높이 | 111 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 최고35층 / 110m 이하 | data/urban/text/ocr/images/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99/page-4.png | max_height_m 111은 별도 건축심의/사업시행계획 원문에서 2차 확인하고, 2017 정비계획 원문값 110m 이하와 병기 |
| 33 | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 총 세대수 | 490 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 주택공급계획 변경 합계 560세대 | data/urban/text/ocr/images/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99/page-4.png | total_households 490은 이후 사업시행계획/분양승인 등 다른 원문에서 2차 확인하고, 2017 정비계획 원문값 560세대와 병기 |
| 33 | P1 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | 정비구역 면적 | 24,484.4 | confirmed_from_ocr_image | source_value_confirmed_from_image | 정비구역 면적 변경후 24,484.4㎡ | data/urban/text/ocr/images/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99/page-4.png | district_area_sqm_official 24,484.4㎡ 확정 |
| 35 | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 건폐율 | 30 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 제3종일반주거지역 50% 이하 | data/urban/text/ocr/images/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시/page-04.png | building_coverage_ratio_pct 30%는 사업시행계획 또는 별도 정비계획 원문에서 2차 확인 |
| 35 | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 층수 | 지상:29/지하:미확인 | ocr_partial_confirmation_pending | partial_confirmation_needs_secondary_source | 96m 이하 / 29층 이하 | data/urban/text/ocr/images/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시/page-07.png | floors_official은 지상 최고29층 확인으로 표시하고 지하층은 사업시행계획서 또는 후속 인가 원문에서 2차 확인 |
| 35 | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 총 세대수 | 1,346 | source_value_fill_missing_required | source_value_fills_missing_matrix_value | 총 1,346세대(공공주택 254세대 포함) | data/urban/text/ocr/images/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시/page-07.png | total_households_official 공란을 직접 고시 1,346세대로 보강하고, 공공주택 254세대 포함 문구를 display_values에 병기 |
| 35 | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 최고높이 | 96 | source_link_required | source_image_not_suitable_for_current_value | 가락아파트지구 용도지구 및 개발기본계획 변경 고시 이미지 | data/urban/text/ocr/images/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시/page-07.png; data/urban/text/ocr/images/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시/page-01.png | 송파한양2차 최고높이 130m는 별도 건축심의/정비계획 원문에서 다시 연결 |
| 35 | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 용적률 | 230 | partial_original_notice_confirmation |  |  | data/urban/text/ocr/images/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시/page-04.png | floor_area_ratio_pct_official 230% 이하 확정 |
| 35 | P1 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 정비구역 면적 | 62,370.3 | auxiliary_notice_context_only |  |  | data/urban/text/ocr/images/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시/page-07.png; data/urban/text/ocr/images/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시/page-04.png | 송파한양2차 정비구역 면적은 별도 정비계획/조합설립인가 원문에서 다시 연결 |
| 36 | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 용적률 | 300 | ocr_source_value_update_required | source_value_precision_mismatch | 법적상한용적률 299.98% 이하 / 정비계획 234.36% 이하 | data/urban/text/ocr/images/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시/page-04.png | floor_area_ratio_pct_official은 법적상한 299.98% 이하로 정밀도 보정하거나 정비계획 234.36%와 법적상한을 별도 필드로 분리 |
| 36 | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 건폐율 | 21 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 건폐율 50% 이하 | data/urban/text/ocr/images/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시/page-11.png | building_coverage_ratio_pct 21은 실제 건축계획 또는 사업시행계획 원문에서 2차 확인하고, 정비계획 허용 건폐율 50% 이하와 병기 |
| 36 | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 정비구역 면적 | 34,284.1 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 정비구역 35,241.0㎡ / 획지1 34,043.8㎡ | data/urban/text/ocr/images/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시/page-01.png | district_area_sqm 34,284.1은 별도 사업개요 또는 후속 인가 원문에서 2차 확인하고, 2021 정비계획 원문값과 분리 |
| 36 | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 층수 | 지상:35/지하:2 | ocr_partial_confirmation_pending | partial_confirmation_needs_secondary_source | 해발고도 129m 이하 / 최고35층 이하 | data/urban/text/ocr/images/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시/page-04.png | floors_official은 지상 최고35층 확인으로 표시하고 지하2층은 사업시행계획서 또는 건축심의 원문에서 2차 확인 |
| 36 | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 총 세대수 | 786 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 주택공급계획 925세대 | data/urban/text/ocr/images/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시/page-04.png | total_households 786은 후속 사업시행계획 또는 정보몽땅 사업개요에서 2차 확인하고, 2021 정비계획 원문값 925세대와 병기 |
| 36 | P1 | 19 | 대림가락아파트 재건축정비사업조합 | 최고높이 | 129 | confirmed_from_ocr_image | source_value_confirmed_from_image | 해발고도 129m 이하 / 최고35층 이하 | data/urban/text/ocr/images/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시/page-12.png | max_height_m_official 129m 이하 확정 |
| 37 | P1 | 29 | 자양1의4구역 가로주택정비사업 | 정비구역 면적 | 8,419.91 | ocr_partial_confirmation_pending | source_value_basis_mismatch_needs_secondary_source | 조합설립 변경인가 공고 구역면적 8,473.82㎡ | data/urban/text/gwangjin-gu/ocr/images/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안/page-1.png; data/urban/text/gwangjin-gu/ocr/images/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문/page-1.png | district_area_sqm 8,419.91은 이전 사업개요 또는 다른 원문에서 2차 확인하고, 2025 변경인가 공고 원문값 8,473.82㎡와 병기 |

## 사용법

1. `needs_relinked_original_notice`는 OCR 이미지가 현재 장부값의 원문으로 부적합하므로 S2/S5 원문 연결 작업으로 보낸다.
2. `source_value_update_required`는 이미지 원문값을 구조화 보정 후보에 반영하되, 상한용적률·정비계획용적률처럼 기준이 다른 숫자는 필드를 분리한다.
3. `partial_confirmation_needs_secondary_source`는 이미지에서 확인된 구성요소와 미확인 구성요소를 나눠 사업시행계획서, 정보몽땅 사업개요, 후속 고시 원문으로 2차 확인한다.
