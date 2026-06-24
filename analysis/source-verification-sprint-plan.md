# 원문 검증 실행 패킷

작성 기준: 2026-06-24 KST

이 문서는 P0/P1 원문 수치 검증 큐를 실제 실행 묶음으로 압축한 작업 패킷이다. 목표는 사업별 비교표와 메모의 수치 근거를 확정/보류/충돌로 분리하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| P0/P1 태스크 | 47 |
| P0 | 18 |
| P1 | 29 |
| 대상 사업장 | 27 |
| 실행 스프린트 | 5 |
| 원문 URL 미완료 후보 | 20 |

## 스프린트

| 스프린트 | 이름 | 우선순위 | 태스크 | 사업장 | 먼저 볼 사업 | 장부 병목 | 링크 병목 | 완료 기준 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 비용·기반시설 원문 대조 | P0 11; P1 6 | 17 | 17 | 2. 압구정아파트지구 특별계획구역② 재건축정비사업조합; 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합; 4. 은마아파트 재건축정비사업조합; 1. 잠실5단지아파트 주택재건축정비사업조합; 5. 장미1,2,3차아파트 주택재건축정비사업 조합 | structured_value_needs_manual_confirmation 61; not_yet_applicable 49; value_missing 41; official_stage_date_confirmed 28; snippet_candidate_needs_manual_confirmation 27; confirmed_from_original_notice 8 | value_not_corroborated 1 | 공개항목 제목만 남기지 않고 원문/첨부/고시 결정조서 근거를 사업별 메모에 confirmed, pending, conflict로 표시 |
| S2 | recordCode·원문 URL 닫기 | P0 3; P1 3 | 6 | 6 | 5. 장미1,2,3차아파트 주택재건축정비사업 조합; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 28. 자양번영로3나길 일대 가로주택정비사업; 15. 압구정한양7차아파트 재건축정비사업조합; 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | value_missing 36; not_yet_applicable 19; no_source_text 7; source_link_required 7; official_stage_date_confirmed 5; fact_check_report_available 4 | official_summary_value_match_original_notice_pending 13; local_original_notice_text_url_pending 1 | source-link-closure-board의 closure_ready가 Y이거나 원문 URL/recordCode 미확보 사유가 명확히 기록됨 |
| S3 | OCR·이미지 수치 검증 | P1 4; P0 2 | 6 | 6 | 16. 가락1차현대아파트 재건축정비사업 조합; 20. 마천1재정비촉진구역 주택재개발정비사업조합; 7. 대치쌍용2차아파트 주택재건축정비사업조합; 17. 송파한양2차아파트 재건축정비사업 조합; 19. 대림가락아파트 재건축정비사업조합 | value_missing 19; not_yet_applicable 16; ocr_partial_confirmation_pending 13; structured_value_needs_manual_confirmation 9; official_stage_date_confirmed 6; source_link_required 6 | value_not_corroborated 6 | OCR 관련 장부 상태가 confirmed_from_ocr_image, ocr_source_value_update_required, ocr_partial_confirmation_pending 중 하나로 분리됨 |
| S4 | 사업시행·관리처분 시점 충돌 해소 | P0 2 | 2 | 2 | 9. 잠실우성4차 주택재건축정비사업조합; 21. 가락삼익맨숀아파트 재건축정비사업 조합 | resolved_by_management_stage_report 11; structured_value_needs_manual_confirmation 6; official_stage_date_confirmed 4; source_date_split_required 4; value_missing 2; management_stage_followup_needed 1 |  | 고시 시점 값, 사업시행 공개항목, 관리처분 공개항목을 별도 값으로 유지하거나 최신 적용값을 명시 |
| S5 | 핵심 공란 보강 | P1 16 | 16 | 14 | 1. 잠실5단지아파트 주택재건축정비사업조합; 2. 압구정아파트지구 특별계획구역② 재건축정비사업조합; 3. 잠실우성아파트 재건축정비사업조합; 4. 은마아파트 재건축정비사업조합; 5. 장미1,2,3차아파트 주택재건축정비사업 조합 | structured_value_needs_manual_confirmation 50; official_stage_date_confirmed 36; not_yet_applicable 34; snippet_candidate_needs_manual_confirmation 23; value_missing 14; resolved_by_management_stage_report 11 | value_not_corroborated 5 | 공란 필드가 원문값, 공식 보조값, 단계상 미적용, 미공개 중 하나로 분류됨 |

## 먼저 처리할 20개

| 큐 | 우선 | 스프린트 | 후보 | 사업장 | 작업 | 확인 필드 | 먼저 열 자료 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | P0 | S1 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 2 | P0 | S1 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 3 | P0 | S1 | 4 | 은마아파트 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 4 | P0 | S1 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 5 | P0 | S1 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 6 | P0 | S1 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 7 | P0 | S1 | 3 | 잠실우성아파트 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 8 | P0 | S4 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행/관리처분 수치 시점차 확정 | 사업시행인가일; 관리처분인가일; 총세대수; 용적률; 공사비/분담금 관련 공개항목 | analysis/management-stage-fact-check.md; project-notes |
| 9 | P0 | S4 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 사업시행/관리처분 수치 시점차 확정 | 사업시행인가일; 관리처분인가일; 총세대수; 용적률; 공사비/분담금 관련 공개항목 | analysis/management-stage-fact-check.md; project-notes |
| 10 | P0 | S1 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 11 | P0 | S1 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 12 | P0 | S3 | 16 | 가락1차현대아파트 재건축정비사업 조합 | OCR 원문 수치 대조 | area; far; households; infrastructure; public_contribution | data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| 13 | P0 | S3 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | OCR 원문 수치 대조 | area; far; households | data/urban/text/files/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470.txt |
| 14 | P0 | S1 | 13 | 자양제7구역 주택재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 15 | P0 | S2 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | recordCode·고시 원문 연결 | recordCode; noticeCode; 고시번호; 고시일; 구역명; 면적 | 서울도시공간포털 지도; 자치구 고시공고; analysis/source-evidence-audit.md |
| 16 | P0 | S1 | 26 | 자양한양아파트 재건축정비사업 | 비용·기반시설 공개항목 원문 대조 | 공공기여; 정비기반시설; 도로/공원/전력; 공사비; 분담금; 임대주택 매각금액 | analysis/cleanup-board-review-queue.md; 정비사업 정보몽땅 공개항목; 고시 결정조서 |
| 17 | P0 | S2 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | recordCode·고시 원문 연결 | recordCode; noticeCode; 고시번호; 고시일; 구역명; 면적 | 서울도시공간포털 지도; 자치구 고시공고; analysis/source-evidence-audit.md |
| 18 | P0 | S2 | 28 | 자양번영로3나길 일대 가로주택정비사업 | recordCode·고시 원문 연결 | recordCode; noticeCode; 고시번호; 고시일; 구역명; 면적 | 서울도시공간포털 지도; 자치구 고시공고; analysis/source-evidence-audit.md |
| 19 | P1 | S5 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | area; far; households; infrastructure; public_contribution | data/urban/text/files/01-11710NTC202409230003-01-11710NTC202409230003-notice_file-서울특별시_제2024-432호_고시.txt |
| 20 | P1 | S5 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | area; far; households; infrastructure; public_contribution | data/urban/text/files/02-11000NTC202504070006-02-11000NTC202504070006-notice_file-서울특별시_제2025-136호_고시.txt |

## 전체 P0/P1 태스크

| 큐 | 우선 | 스프린트 | 유형 | 생활권 | 후보 | 사업장 | 작업 | 장부 상태 | 링크 상태 | 산출물 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | P0 | S1 | crosscheck_cost_infrastructure | 강남 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 2 | P0 | S1 | crosscheck_cost_infrastructure | 강남 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 3 | P0 | S1 | crosscheck_cost_infrastructure | 강남 | 4 | 은마아파트 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 4 | P0 | S1 | crosscheck_cost_infrastructure | 잠실/송파 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 5 | P0 | S1 | crosscheck_cost_infrastructure | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | value_missing 5; auxiliary_notice_context_only 3; not_yet_applicable 3; official_stage_date_confirmed 3 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 6 | P0 | S1 | crosscheck_cost_infrastructure | 잠실/송파 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | official_stage_date_confirmed 3; not_yet_applicable 2; ocr_partial_confirmation_pending 2; ocr_source_value_update_required 2; structured_value_needs_manual_confirmation 2; confirmed_from_ocr_image 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 7 | P0 | S1 | crosscheck_cost_infrastructure | 잠실/송파 | 3 | 잠실우성아파트 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 2; value_missing 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 8 | P0 | S4 | resolve_stage_value_conflict | 잠실/송파 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행/관리처분 수치 시점차 확정 | resolved_by_management_stage_report 4; source_date_split_required 3; structured_value_needs_manual_confirmation 3; value_missing 2; management_stage_followup_needed 1; official_stage_date_confirmed 1 |  | 비교 매트릭스의 시점별 수치 주석과 사업별 메모 보강 |
| 9 | P0 | S4 | resolve_stage_value_conflict | 잠실/송파 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 사업시행/관리처분 수치 시점차 확정 | resolved_by_management_stage_report 7; official_stage_date_confirmed 3; structured_value_needs_manual_confirmation 3; source_date_split_required 1 |  | 비교 매트릭스의 시점별 수치 주석과 사업별 메모 보강 |
| 10 | P0 | S1 | crosscheck_cost_infrastructure | 강남 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | confirmed_from_original_notice 7; official_stage_date_confirmed 4; not_yet_applicable 2; partial_original_notice_confirmation 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 11 | P0 | S1 | crosscheck_cost_infrastructure | 잠실/송파 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | resolved_by_management_stage_report 7; official_stage_date_confirmed 3; structured_value_needs_manual_confirmation 3; source_date_split_required 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 12 | P0 | S3 | verify_ocr_numbers | 잠실/송파 | 16 | 가락1차현대아파트 재건축정비사업 조합 | OCR 원문 수치 대조 | official_stage_date_confirmed 3; not_yet_applicable 2; ocr_partial_confirmation_pending 2; ocr_source_value_update_required 2; structured_value_needs_manual_confirmation 2; confirmed_from_ocr_image 1 |  | OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시 |
| 13 | P0 | S3 | verify_ocr_numbers | 잠실/송파 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | OCR 원문 수치 대조 | source_link_required 5; not_yet_applicable 3; official_stage_date_confirmed 3; structured_value_needs_manual_confirmation 2; ocr_review_required 1 | value_not_corroborated 5 | OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시 |
| 14 | P0 | S1 | crosscheck_cost_infrastructure | 구의/광진 | 13 | 자양제7구역 주택재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; snippet_candidate_needs_manual_confirmation 3; value_missing 3 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 15 | P0 | S2 | connect_recordcode_original_notice | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | recordCode·고시 원문 연결 | value_missing 5; auxiliary_notice_context_only 3; not_yet_applicable 3; official_stage_date_confirmed 3 |  | 고시 원문 또는 자치구 원문 URL/로컬 파일 연결 |
| 16 | P0 | S1 | crosscheck_cost_infrastructure | 구의/광진 | 26 | 자양한양아파트 재건축정비사업 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; not_yet_applicable 4; snippet_candidate_needs_manual_confirmation 3; value_missing 2 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 17 | P0 | S2 | connect_recordcode_original_notice | 구의/광진 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | recordCode·고시 원문 연결 | no_source_text 4; not_yet_applicable 3; value_missing 3; official_stage_date_confirmed 2; source_link_required 2 | official_summary_value_match_original_notice_pending 6 | 고시 원문 또는 자치구 원문 URL/로컬 파일 연결 |
| 18 | P0 | S2 | connect_recordcode_original_notice | 구의/광진 | 28 | 자양번영로3나길 일대 가로주택정비사업 | recordCode·고시 원문 연결 | value_missing 4; no_source_text 3; not_yet_applicable 3; source_link_required 2; structured_value_needs_manual_confirmation 2 | official_summary_value_match_original_notice_pending 5 | 고시 원문 또는 자치구 원문 URL/로컬 파일 연결 |
| 19 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 20 | P1 | S5 | promote_snippets_to_confirmed_values | 강남 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 21 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 3 | 잠실우성아파트 재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 2; value_missing 1 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 22 | P1 | S5 | promote_snippets_to_confirmed_values | 강남 | 4 | 은마아파트 재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 23 | P1 | S5 | fill_missing_core_fields | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 비교 핵심 수치 공란 보강 | value_missing 5; auxiliary_notice_context_only 3; not_yet_applicable 3; official_stage_date_confirmed 3 |  | 공란 수치의 원문 기반 보강 또는 미공개 사유 기록 |
| 24 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 원문 스니펫 확정 수치 승격 | value_missing 5; auxiliary_notice_context_only 3; not_yet_applicable 3; official_stage_date_confirmed 3 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 25 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 9 | 잠실우성4차 주택재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | resolved_by_management_stage_report 4; source_date_split_required 3; structured_value_needs_manual_confirmation 3; value_missing 2; management_stage_followup_needed 1; official_stage_date_confirmed 1 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 26 | P1 | S5 | promote_snippets_to_confirmed_values | 강남 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 3 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 27 | P1 | S5 | promote_snippets_to_confirmed_values | 구의/광진 | 13 | 자양제7구역 주택재건축정비사업 조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; snippet_candidate_needs_manual_confirmation 3; value_missing 3 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 28 | P1 | S5 | promote_snippets_to_confirmed_values | 강남 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | confirmed_from_original_notice 7; official_stage_date_confirmed 4; not_yet_applicable 2; partial_original_notice_confirmation 1 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 29 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 16 | 가락1차현대아파트 재건축정비사업 조합 | 원문 스니펫 확정 수치 승격 | official_stage_date_confirmed 3; not_yet_applicable 2; ocr_partial_confirmation_pending 2; ocr_source_value_update_required 2; structured_value_needs_manual_confirmation 2; confirmed_from_ocr_image 1 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 30 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 원문 스니펫 확정 수치 승격 | resolved_by_management_stage_report 7; official_stage_date_confirmed 3; structured_value_needs_manual_confirmation 3; source_date_split_required 1 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 31 | P1 | S5 | promote_snippets_to_confirmed_values | 구의/광진 | 26 | 자양한양아파트 재건축정비사업 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; not_yet_applicable 4; snippet_candidate_needs_manual_confirmation 3; value_missing 2 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 32 | P1 | S5 | promote_snippets_to_confirmed_values | 잠실/송파 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 원문 스니펫 확정 수치 승격 | source_link_required 5; not_yet_applicable 3; official_stage_date_confirmed 3; structured_value_needs_manual_confirmation 2; ocr_review_required 1 | value_not_corroborated 5 | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 38 | P1 | S5 | fill_missing_core_fields | 잠실/송파 | 3 | 잠실우성아파트 재건축정비사업조합 | 비교 핵심 수치 공란 보강 | structured_value_needs_manual_confirmation 5; not_yet_applicable 3; official_stage_date_confirmed 3; snippet_candidate_needs_manual_confirmation 2; value_missing 1 |  | 공란 수치의 원문 기반 보강 또는 미공개 사유 기록 |
| 33 | P1 | S3 | verify_ocr_numbers | 강남 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | OCR 원문 수치 대조 | ocr_partial_confirmation_pending 4; value_missing 4; not_yet_applicable 2; structured_value_needs_manual_confirmation 2; confirmed_from_ocr_image 1; ocr_source_value_update_required 1 |  | OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시 |
| 34 | P1 | S1 | crosscheck_cost_infrastructure | 강남 | 11 | 압구정아파트지구 특별계획구역4 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 6; value_missing 4; not_yet_applicable 3; snippet_candidate_needs_manual_confirmation 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 35 | P1 | S3 | verify_ocr_numbers | 잠실/송파 | 17 | 송파한양2차아파트 재건축정비사업 조합 | OCR 원문 수치 대조 | not_yet_applicable 3; value_missing 3; ocr_partial_confirmation_pending 2; auxiliary_notice_context_only 1; confirmed_from_original_notice 1; partial_original_notice_confirmation 1 | value_not_corroborated 1 | OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시 |
| 36 | P1 | S3 | verify_ocr_numbers | 잠실/송파 | 19 | 대림가락아파트 재건축정비사업조합 | OCR 원문 수치 대조 | ocr_partial_confirmation_pending 4; not_yet_applicable 3; value_missing 3; structured_value_needs_manual_confirmation 2; confirmed_from_ocr_image 1; ocr_source_value_update_required 1 |  | OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시 |
| 37 | P1 | S3 | verify_ocr_numbers | 구의/광진 | 29 | 자양1의4구역 가로주택정비사업 | OCR 원문 수치 대조 | value_missing 8; not_yet_applicable 3; fact_check_report_available 2; ocr_partial_confirmation_pending 1 |  | OCR 스니펫을 원문 이미지와 대조하고 확정/보류 필드 표시 |
| 39 | P1 | S1 | crosscheck_cost_infrastructure | 강남 | 8 | 대치쌍용1차아파트 주택재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; value_missing 5; not_yet_applicable 2; snippet_candidate_needs_manual_confirmation 2 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 40 | P1 | S1 | crosscheck_cost_infrastructure | 강남 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | value_missing 8; not_yet_applicable 3; structured_value_needs_manual_confirmation 2; snippet_candidate_needs_manual_confirmation 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 41 | P1 | S2 | connect_recordcode_original_notice | 강남 | 15 | 압구정한양7차아파트 재건축정비사업조합 | recordCode·고시 원문 연결 | value_missing 9; not_yet_applicable 3; source_link_required 2 | local_original_notice_text_url_pending 1; official_summary_value_match_original_notice_pending 1 | 고시 원문 또는 자치구 원문 URL/로컬 파일 연결 |
| 42 | P1 | S2 | connect_recordcode_original_notice | 구의/광진 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | recordCode·고시 원문 연결 | value_missing 7; not_yet_applicable 4; fact_check_report_available 2; source_link_required 1 | official_summary_value_match_original_notice_pending 1 | 고시 원문 또는 자치구 원문 URL/로컬 파일 연결 |
| 43 | P1 | S2 | connect_recordcode_original_notice | 구의/광진 | 29 | 자양1의4구역 가로주택정비사업 | recordCode·고시 원문 연결 | value_missing 8; not_yet_applicable 3; fact_check_report_available 2; ocr_partial_confirmation_pending 1 |  | 고시 원문 또는 자치구 원문 URL/로컬 파일 연결 |
| 44 | P1 | S1 | crosscheck_cost_infrastructure | 잠실/송파 | 17 | 송파한양2차아파트 재건축정비사업 조합 | 비용·기반시설 공개항목 원문 대조 | not_yet_applicable 3; value_missing 3; ocr_partial_confirmation_pending 2; auxiliary_notice_context_only 1; confirmed_from_original_notice 1; partial_original_notice_confirmation 1 | value_not_corroborated 1 | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 45 | P1 | S5 | promote_snippets_to_confirmed_values | 강남 | 6 | 대치우성1차아파트 재건축정비사업조합 | 원문 스니펫 확정 수치 승격 | structured_value_needs_manual_confirmation 5; official_stage_date_confirmed 4; snippet_candidate_needs_manual_confirmation 3; not_yet_applicable 2 |  | 구역면적·세대수·용적률·공공기여 수치의 confirmed/pending 표시 |
| 46 | P1 | S1 | crosscheck_cost_infrastructure | 구의/광진 | 22 | 중곡아파트 주택재건축정비사업조합 | 비용·기반시설 공개항목 원문 대조 | structured_value_needs_manual_confirmation 5; value_missing 4; not_yet_applicable 3; snippet_candidate_needs_manual_confirmation 2 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |
| 47 | P1 | S1 | crosscheck_cost_infrastructure | 구의/광진 | 30 | 자양4동 A구역 주택재개발사업 | 비용·기반시설 공개항목 원문 대조 | not_yet_applicable 6; value_missing 5; structured_value_needs_manual_confirmation 2; snippet_candidate_needs_manual_confirmation 1 |  | 사업별 메모의 비용/기반시설 리스크를 원문 수치와 연결 |

## 사용법

1. S1 비용·기반시설은 장기 리스크 가설을 가장 많이 바꾸므로 P0부터 처리한다.
2. S2 recordCode·원문 URL은 source-link-closure-board.md에서 closure_ready != Y인 항목을 닫는다.
3. S3 OCR은 이미지 판독 로그와 원문 텍스트를 대조해 확정/보정/부분확정으로만 남긴다.
4. S4 단계 충돌은 고시 시점과 사업시행/관리처분 공개항목을 같은 값으로 덮어쓰지 않는다.
5. S5 공란/스니펫은 확정값이 없으면 미공개/단계상 미적용 사유를 남긴다.
