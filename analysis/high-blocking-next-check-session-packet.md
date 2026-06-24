# High Blocking 다음 점검 세션 패킷

작성 기준: 2026-06-24 KST
세션 기준일: 2026-06-29

이 문서는 외부 회신 대기 3건을 다음 점검일에 실제로 다시 열 때 쓰는 운영 패킷이다. 조회 URL, 접수번호, no response 기록 helper, 회신 반영 helper, workflow 순서를 한 번에 묶는다.

## 세션 요약

| 항목 | 값 |
| --- | ---: |
| 세션 기준일 | 2026-06-29 |
| 점검 대상 | 3 |
| 현재 no_response | 3 |
| 처리기한 명시 행 | 1 |
| workflow 상태 | dry_run_completed |
| workflow appendable | 0 |

## 세션 단축 명령

- 전체 no_response 일괄 기록:
  `node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh`
- 개별 행을 더 자세히 남기려면 아래 `record-high-blocking-followup-check` 명령을 그대로 사용한다.

## 먼저 열 파일

1. [high-blocking-response-followup-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-followup-cockpit.md): 우선순위와 helper 전체 보기
2. [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md): 접수번호, 다음 점검일, 남은 공백 확인
3. [high-blocking-followup-history.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-followup-history.md): 이전 점검일에 무엇을 확인했는지 이력 확인
4. [high-blocking-followup-check-log.README.md](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-followup-check-log.README.md): 점검 로그 helper와 check_status 규칙
5. [high-blocking-response-intake-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-intake-guide.md): response_status 규칙과 필수 필드 확인
6. [high-blocking-source-response-intake.README.md](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-source-response-intake.README.md): intake 원본의 상태값·입력 절차 확인
7. [high-blocking-source-response-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-source-response-intake.json): 실제 입력 파일

## 세션 순서

1. 아래 3개 조회 URL을 열고 접수상태, 보완요구, 답변 게시 여부를 확인한다.
2. 회신이 없으면 먼저 `touch-high-blocking-followup` batch helper로 공통 `no_change`를 한 번에 처리하고, 개별 메모가 필요하면 `record-high-blocking-followup-check` helper로 덮어쓴다.
3. 회신이 있으면 `record-high-blocking-response` helper로 확인된 식별자와 증거만 기록한다.
4. 입력 후 항상 `process-high-blocking-response-workflow` dry-run을 먼저 본다.
5. `appendable`이 1건 이상이고 draft 내용이 맞을 때만 `--write`와 전체 재생성을 실행한다.

## 점검 대상

| 순위 | 사업장 | 접수번호 | 다음 점검일 | 처리기한 | 이번 확인 포인트 | 남은 공백 |
| --- | --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 626590 | 2026-06-29 |  | 새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 16913396 | 2026-06-29 |  | open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 16913410 | 2026-06-29 | 2026-07-06 | open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL |

## 회신 없음일 때

| 순위 | 사업장 | 조회 URL | 상태 재확인 기록 helper |
| --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/caf/mwwd/action/CafMwWdInputAction.do | node scripts/record-high-blocking-followup-check.mjs --rank=9 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인' --write |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do | node scripts/record-high-blocking-followup-check.mjs --rank=23 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인' --write |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do | node scripts/record-high-blocking-followup-check.mjs --rank=28 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인' --write |

보완요구나 처리기한 변경이 보이면 `record-high-blocking-followup-check`에 `--check-status=supplement_requested|deadline_changed`, `--expected-response-by`, `--filing-note`를 같이 넣는다. 기존 메모를 살리고 덧붙이려면 `--append-filing-note`를 사용한다.

## 회신 도착 시

| 순위 | 사업장 | status 사용 규칙 | 회신 기록 helper | 기록 필드 |
| --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | confirmed/partial는 관리처분 공사비·총사업비·기준일·자료명 중 확인된 범위로만 사용 | node scripts/record-high-blocking-response.mjs --rank=9 --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='송파구 담당부서' --attachment-name='자료명' --evidence=https://... --response-note='회신 요약' --write | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.management_construction_cost; confirmed_values.management_total_project_cost; confirmed_values.management_cost_basis_date; evidence_files; response_note; follow_up_action |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용 | node scripts/record-high-blocking-response.mjs --rank=23 --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용 | node scripts/record-high-blocking-response.mjs --rank=28 --status=confirmed/partial/unavailable/info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action |

## Workflow

| 순위 | 사업장 | dry-run | write | 최종 재생성 | 승격 gate |
| --- | --- | --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | node scripts/process-high-blocking-response-workflow.mjs | node scripts/process-high-blocking-response-workflow.mjs --write | node scripts/regenerate-research-artifacts.mjs | 관리처분 공사비·총사업비 금액, 기준일, 자료명 또는 원문 URL이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | node scripts/process-high-blocking-response-workflow.mjs | node scripts/process-high-blocking-response-workflow.mjs --write | node scripts/regenerate-research-artifacts.mjs | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | node scripts/process-high-blocking-response-workflow.mjs | node scripts/process-high-blocking-response-workflow.mjs --write | node scripts/regenerate-research-artifacts.mjs | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

## 운영 메모

- 고시번호, 고시일, 원문 URL, 첨부명, 기준일 없는 값은 확정값으로 올리지 않는다.
- 잠실우성4차는 공사비·총사업비·기준일 또는 자료명 쪽이 핵심이고, 광진구 2건은 조합설립인가 고시 식별자와 원문 URL이 핵심이다.
- 이 패킷은 점검 세션용이다. 회신 근거 자체는 [high-blocking-source-response-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/high-blocking-source-response-intake.json)와 [high-blocking-response-decision-drafts.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-decision-drafts.md)에서 최종 검증한다.

