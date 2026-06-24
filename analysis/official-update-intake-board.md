# 공식 업데이트 Intake 보드

작성 기준: 2026-06-24 KST

이 문서는 `data/review/official-update-intake.json`에 수동으로 적은 새 공식 업데이트를 검증하고, 어느 decision/intake 파일로 옮겨야 하는지 라우팅한다. source verification 경로는 `analysis/official-update-source-verification-bridge.md`를 같이 읽어 candidate `closure_id`와 applied 승격 가능 여부를 확인한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| intake 행 | 16 |
| 입력 템플릿 출처 | 14 |
| 보완 필요 | 0 |
| inbox | 0 |
| triaged | 4 |
| applied | 12 |

## 분포

| 구분 | 값 |
| --- | --- |
| route | source_verification_decision 9; project_note_and_risk_review 3; high_blocking_response_intake 2; expansion_zone_latest_check 2 |
| evidence | verified_original 12; unverified 4 |
| status | applied 12; triaged 4 |

## 현재 Intake

| ID | 출처 | 순위 | 사업 | 고시번호 | noticeCode | 제목 | 증거 | 상태 | bridge | 권장 상태 | closure_id | 이슈 | route | 기록 위치 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| upd-20260623-0001 | seoul_urban_notice | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 2023-516 |  | 도시관리계획(용도지구 : 아파트지구) 및 압구정아파트지구 개발기본계획 결정(변경) 및 지형도면 고시 | verified_original | applied | reflected_with_related_projects | applied | S1-0036; S1-0035; S2-0004 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260623-0002 | seoul_urban_notice | 26 | 자양한양아파트 재건축정비사업 | 2024-267 |  | 도시·주거환경정비 기본계획 변경(경미한 사항) 및 자양동 695일대 (자양한양아파트) 주택재건축 정비계획 결정, 정비구역 지정 및 지형도면 고시 | verified_original | applied | reflected | applied | S1-0031; S1-0032; S1-0033; S1-0034; S5-0109; S5-0110; S5-0111; S5-0112; S5-0113; S5-0114; S5-0115; S5-0116; S5-0117; S5-0118; S5-0119; S5-0120; S5-0121; S5-0122 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260623-0003 | seoul_urban_notice | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 2020-111 |  | 가락삼익맨숀아파트 주택재건축사업 정비계획(경미한변경) 지구단위계획 결정(변경) 및 지형도면 고시 | verified_original | applied | reflected | applied | S1-0028; S1-0029; S1-0030; S5-0098; S5-0099; S5-0100; S5-0101; S5-0102; S5-0103; S5-0104; S5-0105; S5-0106; S5-0107; S5-0108; S4-0010; S4-0011; S4-0012; S4-0013; S4-0014; S4-0015; S4-0016; S4-0017; S4-0018 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0001 | seoul_urban_notice | 9 | 잠실우성4차 주택재건축정비사업조합 | 2021-671 |  | 잠실 종합운동장 도시관리계획 변경 결정 및 도시계획시설(체육시설) 세부시설 조성계획 결정 및 지형도면 고시 | verified_original | applied | reflected | applied | S4-0001; S4-0002; S4-0003; S4-0004; S4-0005; S4-0006; S4-0007; S4-0008; S4-0009; S5-0052; S5-0053; S5-0054; S5-0055; S5-0056; S5-0057; S5-0058; S5-0059; S5-0060; S5-0061; S5-0062; S5-0063 |  | high_blocking_response_intake | data/review/high-blocking-source-response-intake.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0002 | seoul_urban_notice | 9 | 잠실우성4차 주택재건축정비사업조합 | 2026-49 |  | 도시관리계획[국제교류복합지구(코엑스~잠실종합운동장 일대) 지구단위계획 및 한국종합무역센타 특별계획구역 세부개발계획] 결정(변경) 및 지형도면 고시 | unverified | triaged | reflected | applied | S4-0001; S4-0002; S4-0003; S4-0004; S4-0005; S4-0006; S4-0007; S4-0008; S4-0009; S5-0052; S5-0053; S5-0054; S5-0055; S5-0056; S5-0057; S5-0058; S5-0059; S5-0060; S5-0061; S5-0062; S5-0063 |  | high_blocking_response_intake | data/review/high-blocking-source-response-intake.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0101 | seoul_urban_notice |  | 천호3구역 | 강동구 제2025-194호 | 11740NTC202511180006 | 천호 재정비촉진지구 재정비촉진계획(천호3재정비촉진구역) (경미한)변경결정 및 지형도면 고시 | verified_original | applied | reflected | applied | SX-0001; SX-0002 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0102 | seoul_urban_notice |  | 성내미주아파트 주택재건축정비사업 | 강동구 제2016-123호 | 11000NTC201608247852 | 성내미주아파트 주택재건축 정비구역 변경지정(경미한 변경)고시 | verified_original | applied | reflected | applied | SX-0003; SX-0004 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0103 | seoul_urban_notice |  | 신동아1·2차아파트 주택재건축 정비사업 | 강동구 제2025-48호 | 11740NTC202504220008 | 길동 신동아1·2차아파트 주택재건축 정비구역(계획) 경미한 변경 지정 고시 | verified_original | applied | reflected | applied | SX-0005; SX-0006 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0201 | cleanup_project_status |  | 천호3 주택재건축정비사업조합 |  |  | 정비사업 정보몽땅 사업장검색 강동구 천호3 / 천호3 주택재건축정비사업조합 | unverified | triaged |  |  |  |  | project_note_and_risk_review | project-notes/*.md; analysis/project-risk-signal-summary.md | 단계·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영 |
| upd-20260624-0204 | gangdong_district_notice |  | 천호3 주택재건축정비사업조합 | 서울특별시 강동구 고시 제2026-22호 |  | 천호재정비촉진지구 천호3촉진구역 주택재건축정비사업 (부분)준공인가 고시 | verified_original | applied | no_candidate_found | applied |  |  | expansion_zone_latest_check | analysis/expansion-gangdong-stage-watch-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json | project_rank, noticeCode, notice_no 기준으로 source verification closure 수동 매핑 |
| upd-20260624-0205 | gangdong_district_notice |  | 천호3 주택재건축정비사업조합 | 서울특별시 강동구 고시 제2026-66호 |  | 천호재정비촉진지구 천호3촉진구역 주택재건축정비사업 관리처분계획(경미한 변경)인가 고시 | verified_original | applied | no_candidate_found | applied |  |  | expansion_zone_latest_check | analysis/expansion-gangdong-stage-watch-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json | project_rank, noticeCode, notice_no 기준으로 source verification closure 수동 매핑 |
| upd-20260624-0202 | cleanup_project_status |  | 길동신동아1,2차아파트 주택재건축정비사업조합 |  |  | 정비사업 정보몽땅 사업장검색 강동구 신동아1 / 길동신동아1,2차아파트 주택재건축정비사업조합 | unverified | triaged |  |  |  |  | project_note_and_risk_review | project-notes/*.md; analysis/project-risk-signal-summary.md | 단계·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영 |
| upd-20260624-0203 | cleanup_project_status |  | 성내미주아파트 주택재건축정비사업조합 |  |  | 정비사업 정보몽땅 사업장검색 강동구 성내미주 / 성내미주아파트 주택재건축정비사업조합 | unverified | triaged |  |  |  |  | project_note_and_risk_review | project-notes/*.md; analysis/project-risk-signal-summary.md | 단계·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영 |
| upd-20260624-0104 | seoul_urban_notice |  | 신당 제8구역 주택재개발정비사업 | 중구 제2023-6호 | 11140NTC202302130001 | 신당제8주택재개발정비구역 재개발사업 정비구역 변경(경미한 사항)결정 및 지형도면 고시 | verified_original | applied | reflected | applied | SX-0007; SX-0008 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0105 | seoul_urban_notice |  | 신당 제9주택재개발정비구역 | 중구 제2021-102호 | 11140NTC202109170002 | 신당제9주택재개발정비구역 재개발사업 정비계획 결정(변경)(경미한 사항) 및 지형도면 고시 | verified_original | applied | reflected | applied | SX-0009; SX-0010 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0106 | seoul_urban_notice |  | 금호 제14-1 주택재개발 정비사업 | 성동구 제2023-13호 | 11200NTC202302270005 | 금호제14-1구역 주택재개발 정비구역지정(경미한 변경) 결정 및 지형도면 고시 | verified_original | applied | reflected | applied | SX-0011; SX-0012 |  | source_verification_decision | data/review/source-verification-closure-decisions.json | official-update-intake 행을 applied로 올리고 재생성 |

## 입력 템플릿

| 출처 | 출처명 | ID 예시 | trigger_type | 최소 필드 | 첫 기록 위치 | 첫 액션 | 판정 gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seoul_urban_notice | 서울도시공간포털 결정고시/열람공고 | upd-YYYYMMDD-seoul_urban_notice | official_notice | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/review/source-verification-closure-decisions.json | node scripts/fetch-urban-map-details.mjs -> node scripts/fetch-urban-notice-details.mjs --download | 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격 |
| district_notice | 자치구 고시공고 | upd-YYYYMMDD-district_notice | district_notice | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/review/source-verification-closure-decisions.json | node scripts/fetch-gwangjin-gu-notice-candidates.mjs -> node scripts/probe-gangnam-songpa-notices.mjs --download | 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격 |
| seoul_sibo | 서울시보 | upd-YYYYMMDD-seoul_sibo | official_notice | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/review/source-verification-closure-decisions.json | 서울시보 최신 권호 수동 검색 -> scripts/extract_seoul_sibo_text.py 또는 scripts/ocr-seoul-sibo-page-range.mjs | 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격 |
| seoul_traffic_news | 서울시 교통 분야 | upd-YYYYMMDD-seoul_traffic_news | transport_context | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | analysis/official-context-sources.csv | 수동 검색: 서울시 교통 분야 | 보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격 |
| seoul_citybuild_news | 서울시 주택·도시계획 분야 | upd-YYYYMMDD-seoul_citybuild_news | policy_context | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | analysis/official-context-sources.csv | 수동 검색: 서울시 주택·도시계획 분야 | 보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격 |
| opengov | 서울 정보소통광장 | upd-YYYYMMDD-opengov | policy_context | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | analysis/official-context-sources.csv | 수동 검색: 서울 정보소통광장 | 보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격 |
| cleanup_notice | 정비사업 정보몽땅 고시/공고 | upd-YYYYMMDD-cleanup_notice | cleanup_board | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | 원격 수집 산출물과 project-notes/*.md | node scripts/fetch-cafe-menu-links.mjs -> node scripts/fetch-cleanup-board-latest.mjs | 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 |
| cleanup_project_status | 정비사업 정보몽땅 사업장검색/자료공개 | upd-YYYYMMDD-cleanup_project_status | cleanup_stage | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | 원격 수집 산출물과 project-notes/*.md | node scripts/fetch-cleanup-projects.mjs -> node scripts/fetch-project-summaries.mjs | 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 |
| seoul_urban_alert | 서울도시공간포털 알림서비스 | upd-YYYYMMDD-seoul_urban_alert | official_notice | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | analysis/official-update-registry.md 또는 수동 알림 메모 | 서울도시공간포털 알림서비스 수동 신청 후 수신 noticeCode 기록 | 알림 수신 내용은 검색 출발점이다. 원문 고시/공고를 열기 전에는 확정 근거로 쓰지 않음 |
| gangdong_district_notice | 강동구 고시공고 | upd-YYYYMMDD-gangdong_district_notice | district_notice | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/review/official-source-activation-intake.json 또는 data/review/official-update-intake.json | 수동 검색: 강동구 고시공고 -> 천호3구역·신동아1·2차·성내미주 최신 단계 확인 -> 결과를 official-update-intake 또는 activation intake에 기록 | 확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다. |
| jung_district_notice | 중구 고시공고 | upd-YYYYMMDD-jung_district_notice | district_notice | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/review/official-source-activation-intake.json 또는 data/review/official-update-intake.json | 수동 검색: 중구 고시공고 -> 약수역 direct hit 여부와 신당·청구 인접 비교군 확인 -> 결과를 official-update-intake 또는 activation intake에 기록 | 확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다. |
| molit_data_go_kr | 국토교통부 실거래/공공데이터포털 | upd-YYYYMMDD-molit_data_go_kr | market_data | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/market/ 원자료 및 normalization 산출물 | DATA_GO_KR_SERVICE_KEY 연결 후 node scripts/fetch-market-raw-data.mjs | 시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용 |
| r_one | 한국부동산원 R-ONE | upd-YYYYMMDD-r_one | market_data | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/market/ 원자료 및 normalization 산출물 | R-ONE 지표 코드 수동 확정 후 data/market intake 갱신 | 시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용 |
| seoul_open_data | 서울 열린데이터광장 | upd-YYYYMMDD-seoul_open_data | market_data | update_id; discovered_at; source_id; title; official_url 또는 attachment_paths; evidence_status; decision_status | data/market/ 원자료 및 normalization 산출물 | node scripts/generate-market-data-matrix.mjs -> API 키 연결 후 수집 | 시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용 |

## 사용 순서

1. 새 업데이트를 발견하면 `data/review/official-update-intake.json`에 한 행을 추가한다.
2. `node scripts/generate-official-update-intake-board.mjs`를 실행해 source_id, rank, 증거 상태 오류를 확인한다.
3. route가 `source_verification_decision`이면 먼저 `analysis/official-update-source-verification-bridge.md`에서 candidate `closure_id`와 권장 상태를 확인한다.
4. route가 `expansion_zone_latest_check`이면 강동권/약수권 보드에 먼저 적고, 원문 또는 direct hit 확보 전까지는 source verification이나 high-blocking으로 올리지 않는다.
5. 그 외 route는 안내한 target 파일에 검증 결과를 옮기거나, bridge가 `applied`를 권장하면 intake 상태를 올린다.
6. `node scripts/regenerate-research-artifacts.mjs`를 실행하고 `analysis/update-impact-ledger.md`, `analysis/project-due-diligence-board.md`, `analysis/research-goal-completion-audit.md`를 확인한다.

## 판정 원칙

- `context_only`는 가설 참고 신호일 뿐 확정 근거가 아니다.
- `applied`는 `verified_original` 증거와 원문 URL, 첨부, 로컬 텍스트 중 하나가 있을 때만 쓴다.
- 완료 병목 3건과 연결되는 업데이트는 `high_blocking_response_intake`로 먼저 보낸다.
- `gangdong_district_notice`, `jung_district_notice`는 확장 관심권 운영 루프다. direct hit 또는 원문 확보 전까지는 `expansion_zone_latest_check`에 둔다.
