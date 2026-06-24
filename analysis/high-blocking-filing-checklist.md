# High Blocking Filing Checklist

작성 기준: 2026-06-24 KST

이 문서는 high blocking 3개 사업장을 실제 접수 전후에 닫기 위한 체크리스트다. 외부 제출은 자동으로 하지 않으며, 접수·회신 결과는 `data/review/high-blocking-source-response-intake.json`에 기록한 뒤 dry-run으로 검증한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 3 |
| 접수 준비 | 0 |
| 회신 대기 | 3 |
| 회신 검증 필요 | 0 |
| decision 검수 가능 | 0 |
| intake 오류 | 0 |
| intake 경고 | 0 |

## 실행 순서

1. 아래 표에서 `checklist_status=ready_to_submit` 사업장을 고른다.
2. `outbox_file`의 제목·본문을 열고 사업명, 단계, 요청자료, 부분공개/비공개 요청 문구를 확인한다.
3. 담당부서 문의 또는 정보공개청구를 접수한다. 이 작업은 자동화하지 않는다.
4. 접수 직후 `node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write` 또는 접수번호가 없으면 `--note=...`로 `data/review/high-blocking-source-response-intake.json`를 갱신한다.
5. 회신이 오면 가능하면 `node scripts/record-high-blocking-response.mjs`로 `response_status`, 증거 URL/파일, 확인값, 자료명, 보유부서, 부분공개/비공개 사유를 기록한다.
6. `node scripts/process-high-blocking-response-workflow.mjs`로 dry-run한다.
7. append 가능한 decision이 의도와 맞을 때만 `node scripts/process-high-blocking-response-workflow.mjs --write`를 실행한다.

## 사업장별 체크리스트

| 순위 | 사업장 | 체크상태 | 우선채널 | 남은 공백 | 제출 파일 | 다음 단계 |
| --- | --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | waiting_for_response | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | data/review/high-blocking-filing-outbox/23-광장동-삼성1차아파트-소규모재건축정비사업.txt | 회신 도착 시 response_status와 증거값 입력 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | waiting_for_response | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | data/review/high-blocking-filing-outbox/28-자양번영로3나길-일대-가로주택정비사업.txt | 회신 도착 시 response_status와 증거값 입력 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | waiting_for_response | 송파구 새올전자민원창구 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | data/review/high-blocking-filing-outbox/09-잠실우성4차-주택재건축정비사업조합.txt | 회신 도착 시 response_status와 증거값 입력 |

## 접수 직후 기록 명령 예시

| 순위 | 사업장 | 기록 명령 |
| --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 |  |
| 28 | 자양번영로3나길 일대 가로주택정비사업 |  |
| 9 | 잠실우성4차 주택재건축정비사업조합 |  |

## Intake 기록 필드

| 순위 | 사업장 | 접수 직후 필드 | 회신 후 필드 | 승격 규칙 |
| --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | filing_status=filed_waiting_response; filed_at; filing_channel; filing_url; filing_receipt_no; filing_note | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | filing_status=filed_waiting_response; filed_at; filing_channel; filing_url; filing_receipt_no; filing_note | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |
| 9 | 잠실우성4차 주택재건축정비사업조합 | filing_status=filed_waiting_response; filed_at; filing_channel; filing_url; filing_receipt_no; filing_note | response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.management_construction_cost; confirmed_values.management_total_project_cost; confirmed_values.management_cost_basis_date; evidence_files; response_note; follow_up_action | 관리처분 공사비·총사업비 금액, 기준일, 자료명 또는 원문 URL이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

주의: 공식 요약값이나 전화 메모만으로 비교표 확정값을 덮어쓰지 않는다. 고시번호·고시일·원문 URL·자료명·기준일·증거파일 중 확인된 범위에 맞춰 confirmed, partial, unavailable, info_disclosure_required 중 하나로만 판정한다.
