# High Blocking 회신 후속 콕핏

작성 기준: 2026-06-24 KST

이 문서는 외부 회신 대기 3건을 다음 점검일 기준으로 다시 여는 실행판이다. 어디를 먼저 확인할지, 회신이 오면 어떤 helper와 workflow를 바로 돌릴지 한 화면에 묶는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 회신 대기 사업장 | 3 |
| 아직 no_response | 3 |
| 7일 내 점검 | 3 |
| 점검일 경과 | 0 |
| append 가능 decision | 0 |
| workflow 상태 | dry_run_completed |
| workflow appendable | 0 |
| completion cockpit P0 | 2 |

## 이번 점검 순서

| 우선점수 | 순위 | 사업장 | 다음 점검일 | 점검 포인트 | 남은 공백 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- |
| 109 | 9 | 잠실우성4차 주택재건축정비사업조합 | 2026-06-29 | 새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | 접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록 |
| 105 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 2026-06-29 | open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | 접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록 |
| 105 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 2026-06-29 | open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | 접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록 |

## 회신 도착 시 바로 실행

| 순위 | 사업장 | 회신 기록 helper | dry-run | write | 최종 재생성 |
| --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | node scripts/record-high-blocking-response.mjs --rank=9 --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='송파구 담당부서' --attachment-name='자료명' --evidence=https://... --response-note='회신 요약' --write | node scripts/process-high-blocking-response-workflow.mjs | node scripts/process-high-blocking-response-workflow.mjs --write | node scripts/regenerate-research-artifacts.mjs |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | node scripts/record-high-blocking-response.mjs --rank=23 --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write | node scripts/process-high-blocking-response-workflow.mjs | node scripts/process-high-blocking-response-workflow.mjs --write | node scripts/regenerate-research-artifacts.mjs |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | node scripts/record-high-blocking-response.mjs --rank=28 --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write | node scripts/process-high-blocking-response-workflow.mjs | node scripts/process-high-blocking-response-workflow.mjs --write | node scripts/regenerate-research-artifacts.mjs |

## 채널별 확인 위치

| 순위 | 사업장 | 접수 채널 | 접수번호 | 조회 URL | 회신 후 필드 |
| --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 송파구 새올전자민원창구 | 626590 | https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/caf/mwwd/action/CafMwWdInputAction.do | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.management_construction_cost; confirmed_values.management_total_project_cost; confirmed_values.management_cost_basis_date; evidence_files; response_note; follow_up_action |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 | 16913396 | https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 | 16913410 | https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action |

## 운영 메모

- 회신이 와도 확인된 범위만 기록한다. 고시번호, 고시일, 원문 URL, 첨부명, 자료명, 기준일 없는 값은 확정으로 올리지 않는다.
- 회신 기록 후에는 항상 `node scripts/process-high-blocking-response-workflow.mjs` dry-run을 먼저 본다.
- `ready_to_append`가 떠도 decision 내용이 맞는지 보고 `--write`를 실행한다.

