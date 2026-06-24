# 잔여 공란·보류 해석 감사

작성 기준: 2026-06-24 KST

이 문서는 핵심 수치 장부에 남은 공란·보류·부분확정 항목을 비교표에서 어떻게 해석할지 정한다. 목적은 값을 새로 확정하는 것이 아니라, 어떤 항목이 정상 보류이고 어떤 항목이 신규 원문이 나오면 다시 열릴 트리거인지 분리하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 잔여 필드 | 336 |
| 대상 사업장 | 30 |
| 높은 차단 | 16 |
| 중간 차단 | 44 |
| 낮음/비차단 | 276 |
| 해석 분포 | usable_with_source_caveat 115; stage_not_applicable 86; source_available_extract_later 81; manual_source_escalation 21; ocr_or_precision_review 21; context_only 7; source_basis_split 5 |

## 해석 클래스

| 해석 클래스 | 필드 | 높은 차단 | 중간 차단 | 비교표 사용 규칙 | 재개 트리거 |
| --- | --- | --- | --- | --- | --- |
| manual_source_escalation | 21 | 16 | 5 | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| usable_with_source_caveat | 115 | 0 | 27 | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| ocr_or_precision_review | 21 | 0 | 6 | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| source_basis_split | 5 | 0 | 5 | 단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다. | 같은 기준의 후속 원문 확보, 관리처분 별첨 확보 |
| source_available_extract_later | 81 | 0 | 1 | 원문 또는 후보 파일은 있으나 필드값을 확정하지 못했다. 공란으로 유지하되 다음 OCR/수동 판독 때 보강한다. | 원문 이미지 확대 판독, 키워드 스니펫 재추출, 후속 공개항목 |
| stage_not_applicable | 86 | 0 | 0 | 현재 단계에서는 해당 필드를 비교·점수화하지 않고, 사업시행/관리처분 등 다음 단계 공개 시 다시 연다. | 단계 변경, 공개항목 추가, 신규 인가고시 |
| context_only | 7 | 0 | 0 | 상위계획·보조공고 문맥으로만 사용하고 직접 사업 수치 확정에는 사용하지 않는다. | 직접 정비계획/사업시행/건축심의 원문 확보 |

## 사업별 잔여 해석

| 순위 | 생활권 | 사업장 | 상태 | 잔여 | 높은 차단 | 중간 차단 | 해석 요약 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 23 | 구의/광진 | 광장동 삼성1차아파트 소규모재건축정비사업 | watch | 12 | 8 | 1 | manual_source_escalation 9; stage_not_applicable 3 | project-notes/23-j15171517.md |
| 28 | 구의/광진 | 자양번영로3나길 일대 가로주택정비사업 | watch | 14 | 7 | 4 | manual_source_escalation 11; stage_not_applicable 3 | project-notes/28-jayang588-22.md |
| 9 | 잠실/송파 | 잠실우성4차 주택재건축정비사업조합 | ready_for_periodic_monitoring | 9 | 1 | 3 | source_basis_split 3; usable_with_source_caveat 3; source_available_extract_later 2; manual_source_escalation 1 | project-notes/09-tw2w7iwv.md |
| 20 | 잠실/송파 | 마천1재정비촉진구역 주택재개발정비사업조합 | ready_for_periodic_monitoring | 11 | 0 | 6 | usable_with_source_caveat 7; stage_not_applicable 3; ocr_or_precision_review 1 | project-notes/20-macheon-1.md |
| 16 | 잠실/송파 | 가락1차현대아파트 재건축정비사업 조합 | ready_for_periodic_monitoring | 10 | 0 | 5 | ocr_or_precision_review 5; stage_not_applicable 2; usable_with_source_caveat 2; source_available_extract_later 1 | project-notes/16-hyundai.md |
| 1 | 잠실/송파 | 잠실5단지아파트 주택재건축정비사업조합 | ready_for_periodic_monitoring | 11 | 0 | 3 | usable_with_source_caveat 8; stage_not_applicable 3 | project-notes/01-jamsil5apt.md |
| 2 | 강남 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | ready_for_periodic_monitoring | 11 | 0 | 3 | usable_with_source_caveat 8; stage_not_applicable 3 | project-notes/02-apgujeong2.md |
| 3 | 잠실/송파 | 잠실우성아파트 재건축정비사업조합 | ready_for_periodic_monitoring | 11 | 0 | 3 | usable_with_source_caveat 7; stage_not_applicable 3; source_available_extract_later 1 | project-notes/03-q1qk5nf6.md |
| 4 | 강남 | 은마아파트 재건축정비사업조합 | ready_for_periodic_monitoring | 11 | 0 | 3 | usable_with_source_caveat 8; stage_not_applicable 3 | project-notes/04-the-eunma.md |
| 10 | 강남 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | ready_for_periodic_monitoring | 11 | 0 | 3 | usable_with_source_caveat 8; stage_not_applicable 3 | project-notes/10-apgujeong3.md |
| 13 | 구의/광진 | 자양제7구역 주택재건축정비사업 조합 | ready_for_periodic_monitoring | 14 | 0 | 3 | usable_with_source_caveat 8; source_available_extract_later 3; stage_not_applicable 3 | project-notes/13-jayang7.md |
| 26 | 구의/광진 | 자양한양아파트 재건축정비사업 | ready_for_periodic_monitoring | 14 | 0 | 3 | usable_with_source_caveat 8; stage_not_applicable 4; source_available_extract_later 2 | project-notes/26-jyhy2024.md |
| 21 | 잠실/송파 | 가락삼익맨숀아파트 재건축정비사업 조합 | ready_for_periodic_monitoring | 4 | 0 | 2 | usable_with_source_caveat 3; source_basis_split 1 | project-notes/21-grsamik.md |
| 5 | 잠실/송파 | 장미1,2,3차아파트 주택재건축정비사업 조합 | ready_for_periodic_monitoring | 11 | 0 | 1 | source_available_extract_later 5; context_only 3; stage_not_applicable 3 | project-notes/05-jmapt1.md |
| 18 | 잠실/송파 | 송파미성아파트 재건축정비사업조합 | watch | 10 | 0 | 1 | source_available_extract_later 3; stage_not_applicable 3; context_only 1; ocr_or_precision_review 1; source_basis_split 1 | project-notes/18-songpams.md |
| 6 | 강남 | 대치우성1차아파트 재건축정비사업조합 | ready_for_periodic_monitoring | 10 | 0 | 0 | usable_with_source_caveat 8; stage_not_applicable 2 | project-notes/06-woosung1.md |
| 7 | 강남 | 대치쌍용2차아파트 주택재건축정비사업조합 | watch | 13 | 0 | 0 | ocr_or_precision_review 5; source_available_extract_later 4; stage_not_applicable 2; usable_with_source_caveat 2 | project-notes/07-ssang2.md |
| 8 | 강남 | 대치쌍용1차아파트 주택재건축정비사업조합 | watch | 14 | 0 | 0 | usable_with_source_caveat 7; source_available_extract_later 5; stage_not_applicable 2 | project-notes/08-ssang1.md |
| 11 | 강남 | 압구정아파트지구 특별계획구역4 | watch | 14 | 0 | 0 | usable_with_source_caveat 7; source_available_extract_later 4; stage_not_applicable 3 | project-notes/11-apgujeong4.md |
| 12 | 강남 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | watch | 14 | 0 | 0 | source_available_extract_later 8; stage_not_applicable 3; usable_with_source_caveat 3 | project-notes/12-apgujeong5.md |
| 14 | 강남 | 개포주공6,7단지아파트 재건축정비사업조합 | ready_for_periodic_monitoring | 3 | 0 | 0 | stage_not_applicable 2; context_only 1 | project-notes/14-gaepo6_7.md |
| 15 | 강남 | 압구정한양7차아파트 재건축정비사업조합 | watch | 14 | 0 | 0 | source_available_extract_later 9; stage_not_applicable 3; usable_with_source_caveat 2 | project-notes/15-hanyang7.md |
| 17 | 잠실/송파 | 송파한양2차아파트 재건축정비사업 조합 | watch | 13 | 0 | 0 | ocr_or_precision_review 3; source_available_extract_later 3; stage_not_applicable 3; context_only 2; usable_with_source_caveat 2 | project-notes/17-songpa2.md |
| 19 | 잠실/송파 | 대림가락아파트 재건축정비사업조합 | watch | 13 | 0 | 0 | ocr_or_precision_review 5; source_available_extract_later 3; stage_not_applicable 3; usable_with_source_caveat 2 | project-notes/19-daelim.md |
| 22 | 구의/광진 | 중곡아파트 주택재건축정비사업조합 | watch | 14 | 0 | 0 | usable_with_source_caveat 7; source_available_extract_later 4; stage_not_applicable 3 | project-notes/22-junggokapt.md |
| 24 | 구의/광진 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | watch | 12 | 0 | 0 | source_available_extract_later 7; stage_not_applicable 4; usable_with_source_caveat 1 | project-notes/24-walkerhill1.md |
| 25 | 구의/광진 | 한양연립 일대 가로주택정비사업 | watch | 5 | 0 | 0 | source_available_extract_later 3; stage_not_applicable 2 | project-notes/25-hanyanggaro.md |
| 27 | 구의/광진 | 광장극동아파트 재건축사업 (신속통합기획) | watch | 7 | 0 | 0 | stage_not_applicable 6; source_available_extract_later 1 | project-notes/27-kukdong-reborn.md |
| 29 | 구의/광진 | 자양1의4구역 가로주택정비사업 | watch | 12 | 0 | 0 | source_available_extract_later 8; stage_not_applicable 3; ocr_or_precision_review 1 | project-notes/29-jayang104.md |
| 30 | 구의/광진 | 자양4동 A구역 주택재개발사업 | watch | 14 | 0 | 0 | stage_not_applicable 6; source_available_extract_later 5; usable_with_source_caveat 3 | project-notes/30-jayangdong.md |

## 우선 확인 필드

| 순위 | 사업장 | 필드 | 장부 상태 | 해석 | 차단 | 사용 규칙 | 재개 트리거 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분 공사비 | management_stage_followup_needed | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비구역 면적 | source_link_required | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 용적률 | source_link_required | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 고시일 | value_missing | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 고시번호 | value_missing | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 건폐율 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 층수 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 최고높이 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 총 세대수 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 정비구역 면적 | source_link_required | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 용적률 | source_link_required | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 고시일 | value_missing | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 고시번호 | value_missing | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 건폐율 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 층수 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 최고높이 | no_source_text | manual_source_escalation | high | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 3 | 잠실우성아파트 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 3 | 잠실우성아파트 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 3 | 잠실우성아파트 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 4 | 은마아파트 재건축정비사업조합 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 4 | 은마아파트 재건축정비사업조합 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 4 | 은마아파트 재건축정비사업조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 고시일 | value_missing | source_available_extract_later | medium | 원문 또는 후보 파일은 있으나 필드값을 확정하지 못했다. 공란으로 유지하되 다음 OCR/수동 판독 때 보강한다. | 원문 이미지 확대 판독, 키워드 스니펫 재추출, 후속 공개항목 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | source_date_split_required | source_basis_split | medium | 단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다. | 같은 기준의 후속 원문 확보, 관리처분 별첨 확보 |
| 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 13 | 자양제7구역 주택재건축정비사업 조합 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 13 | 자양제7구역 주택재건축정비사업 조합 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 13 | 자양제7구역 주택재건축정비사업 조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 용적률 | ocr_source_value_update_required | ocr_or_precision_review | medium | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 최고높이 | ocr_source_value_update_required | ocr_or_precision_review | medium | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 건폐율 | ocr_partial_confirmation_pending | ocr_or_precision_review | medium | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 층수 | ocr_partial_confirmation_pending | ocr_or_precision_review | medium | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| 16 | 가락1차현대아파트 재건축정비사업 조합 | 총 세대수 | source_value_fill_missing_required | ocr_or_precision_review | medium | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 총 세대수 | ocr_review_required | ocr_or_precision_review | medium | OCR·이미지 판독값은 원문 이미지 판독 로그와 함께만 보정 후보로 사용한다. 자동으로 비교표를 덮어쓰지 않는다. | 원문 이미지 수동 판독, 재OCR, 2차 원문 확인 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 건폐율 | source_link_required | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 정비구역 면적 | source_link_required | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 용적률 | source_link_required | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 층수 | source_link_required | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | 최고높이 | source_link_required | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 층수 | source_date_split_required | source_basis_split | medium | 단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다. | 같은 기준의 후속 원문 확보, 관리처분 별첨 확보 |
| 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 26 | 자양한양아파트 재건축정비사업 | 건폐율 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 26 | 자양한양아파트 재건축정비사업 | 층수 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 26 | 자양한양아파트 재건축정비사업 | 최고높이 | structured_value_needs_manual_confirmation | usable_with_source_caveat | medium | 정보몽땅/로컬 텍스트/스니펫이 현재값을 뒷받침하면 비교에는 사용할 수 있으나, 본고시 원문 URL 또는 직접 값 대조 상태를 함께 표시한다. | recordCode·noticeCode 연결, 본고시 원문 URL 보강 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | source_date_split_required | source_basis_split | medium | 단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다. | 같은 기준의 후속 원문 확보, 관리처분 별첨 확보 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | source_date_split_required | source_basis_split | medium | 단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다. | 같은 기준의 후속 원문 확보, 관리처분 별첨 확보 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 총 세대수 | value_missing | manual_source_escalation | medium | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 18 | 송파미성아파트 재건축정비사업조합 | 건폐율 | source_definition_split_required | source_basis_split | medium | 단일 대표값으로 병합하지 않는다. 고시 시점·사업시행·관리처분·사업개요 값을 별도 기준으로 병기한다. | 같은 기준의 후속 원문 확보, 관리처분 별첨 확보 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 추진위원회 승인일 | value_missing | manual_source_escalation | medium | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 추진위원회 승인일 | value_missing | manual_source_escalation | medium | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 단계 공개 동의율 | structured_value_needs_manual_confirmation | manual_source_escalation | medium | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 조합설립인가일 | structured_value_needs_manual_confirmation | manual_source_escalation | medium | 구조화 보조근거는 참고만 하고 본고시 원문·고시번호·담당부서 확인 전에는 확정값으로 쓰지 않는다. | 자치구/정보몽땅 담당 창구 확인, 신규 고시 게시 |

## 운영 규칙

1. `stage_not_applicable`은 현재 단계 비교에서 제외하고, 단계 변경 시 다시 연다.
2. `source_basis_split`은 하나의 대표값으로 병합하지 않고 기준 시점별로 병기한다.
3. `usable_with_source_caveat`은 비교에는 사용할 수 있지만 본고시 URL·recordCode 보강 상태를 함께 표시한다.
4. `manual_source_escalation`과 `missing_no_public_source`는 신규 고시, 담당부서 확인, 정보공개 등 외부 신호가 있어야 확정값으로 승격한다.
5. `ocr_or_precision_review`는 원문 이미지 판독 로그 없이 자동 보정하지 않는다.
