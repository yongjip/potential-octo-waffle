# High Blocking Response Intake Guide

작성 기준: 2026-06-24 KST

이 문서는 담당부서/정보몽땅/정보공개청구 회신을 `data/review/high-blocking-source-response-intake.json`에 입력할 때 쓰는 상태값과 예시를 정리한다. 가능하면 `node scripts/record-high-blocking-response.mjs` helper를 사용하고, 실제 intake 파일은 예시를 복사해 덮어쓰지 말고 해당 사업장 행의 확인된 필드만 수정한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 3 |
| 현재 intake 행 | 3 |
| intake 오류 | 0 |
| intake 경고 | 0 |

## Response Status 선택 기준

| 상태 | 사용 조건 | 최소 필드 | decision 결과 |
| --- | --- | --- | --- |
| no_response | 아직 회신이 없고 접수도 하지 않았거나, 접수 전 준비 상태 | rank, project_name, response_status | waiting_for_response |
| confirmed | 고시번호·고시일·원문 URL·자료명 또는 관리처분 비용 자료명이 회신으로 확인됨 | response_received_at, responder, official_notice_no/date/url 또는 attachment_name, evidence_files 또는 official_url | ready_to_append 가능 |
| partial | 일부 식별자나 자료명은 확인됐지만 모든 값이 확정되지는 않음 | response_received_at, responder, 확인된 식별자 1개 이상, evidence_files 또는 official_url | pending decision 초안 |
| unavailable | 기관이 해당 자료를 보유하지 않거나 공개 가능한 원문이 없다고 회신 | response_received_at, responder, response_note | deferred decision 초안 |
| info_disclosure_required | 일반 문의로는 불가하고 정보공개청구/방문열람/부분공개 절차가 필요하다는 회신 | response_received_at, responder, response_note | deferred decision 초안 |

## 사업장별 입력 기준

| 순위 | 사업장 | 남은 공백 | 입력 기준 |
| --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | confirmed/partial는 고시번호·고시일·원문 URL·첨부명 중 확인된 범위로만 사용 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | confirmed/partial는 관리처분 공사비·총사업비·기준일·자료명 중 확인된 범위로만 사용 |

## Helper 명령 예시

| 시나리오 | 명령 |
| --- | --- |
| 조합설립인가형 confirmed (23/28) | node scripts/record-high-blocking-response.mjs --rank=23 --status=confirmed --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='광진구 고시 제YYYY-N호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --value=union_approval_date=YYYY-MM-DD --write |
| 조합설립인가형 partial (23/28) | node scripts/record-high-blocking-response.mjs --rank=23 --status=partial --received-at=YYYY-MM-DD --responder='광진구 담당부서' --attachment-name='자료명 또는 고시번호만 확인됨' --evidence=https://... --response-note='일부 식별자만 확인됨' --value=union_approval_date=YYYY-MM-DD --write |
| 관리처분형 confirmed (9) | node scripts/record-high-blocking-response.mjs --rank=9 --status=confirmed --received-at=YYYY-MM-DD --responder='송파구 담당부서' --attachment-name='관리처분계획인가 별첨 또는 공사비 기준자료명' --evidence=https://... --value=management_construction_cost=숫자와단위 --value=management_cost_basis_date=YYYY-MM-DD --write |
| 자료 미보유 또는 정보공개청구 필요 | node scripts/record-high-blocking-response.mjs --rank=23 --status=info_disclosure_required --received-at=YYYY-MM-DD --responder='담당부서' --response-note='정보공개청구 또는 방문열람 필요' --write |

## 예시 JSON

```json
[
  {
    "rank": "23",
    "project_name": "광장동 삼성1차아파트 소규모재건축정비사업",
    "no_response": {
      "rank": "23",
      "project_name": "광장동 삼성1차아파트 소규모재건축정비사업",
      "response_status": "no_response",
      "response_received_at": "",
      "responder": "",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "",
      "response_note": "",
      "follow_up_action": "",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "confirmed": {
      "rank": "23",
      "project_name": "광장동 삼성1차아파트 소규모재건축정비사업",
      "response_status": "confirmed",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "예: 광진구 고시 제YYYY-N호",
      "official_notice_date": "YYYY-MM-DD",
      "official_url": "https://...",
      "attachment_name": "조합설립인가 고시문 또는 인가 관련 공고문",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "YYYY-MM-DD",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "data/review/evidence/example-response.pdf 또는 https://...",
      "response_note": "회신에서 확인된 자료명·보유부서·공개 범위를 개인정보 없이 요약",
      "follow_up_action": "node scripts/process-high-blocking-response-workflow.mjs",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "partial": {
      "rank": "23",
      "project_name": "광장동 삼성1차아파트 소규모재건축정비사업",
      "response_status": "partial",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "예: 광진구 고시 제YYYY-N호",
      "official_notice_date": "YYYY-MM-DD",
      "official_url": "",
      "attachment_name": "자료명 또는 고시번호만 확인됨",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "YYYY-MM-DD",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "data/review/evidence/example-response.pdf 또는 https://...",
      "response_note": "일부 식별자만 확인됨. 미확인 값과 추가 요청 경로를 구분해 기록",
      "follow_up_action": "node scripts/process-high-blocking-response-workflow.mjs",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "unavailable": {
      "rank": "23",
      "project_name": "광장동 삼성1차아파트 소규모재건축정비사업",
      "response_status": "unavailable",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "",
      "response_note": "자료 미보유, 공개 원문 없음, 보존기간 경과 등 기관 회신 내용을 그대로 요약",
      "follow_up_action": "deferred decision으로 남기고 비교표에는 원문 미확인 주석 유지",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "info_disclosure_required": {
      "rank": "23",
      "project_name": "광장동 삼성1차아파트 소규모재건축정비사업",
      "response_status": "info_disclosure_required",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "",
      "response_note": "정보공개청구, 방문열람, 부분공개 절차 필요. 접수 경로와 보유부서 기록",
      "follow_up_action": "outbox 파일로 정보공개청구 접수 후 filing_status=filed_waiting_response 기록",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    }
  },
  {
    "rank": "28",
    "project_name": "자양번영로3나길 일대 가로주택정비사업",
    "no_response": {
      "rank": "28",
      "project_name": "자양번영로3나길 일대 가로주택정비사업",
      "response_status": "no_response",
      "response_received_at": "",
      "responder": "",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "",
      "response_note": "",
      "follow_up_action": "",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "confirmed": {
      "rank": "28",
      "project_name": "자양번영로3나길 일대 가로주택정비사업",
      "response_status": "confirmed",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "예: 광진구 고시 제YYYY-N호",
      "official_notice_date": "YYYY-MM-DD",
      "official_url": "https://...",
      "attachment_name": "조합설립인가 고시문 또는 인가 관련 공고문",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "YYYY-MM-DD",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "data/review/evidence/example-response.pdf 또는 https://...",
      "response_note": "회신에서 확인된 자료명·보유부서·공개 범위를 개인정보 없이 요약",
      "follow_up_action": "node scripts/process-high-blocking-response-workflow.mjs",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "partial": {
      "rank": "28",
      "project_name": "자양번영로3나길 일대 가로주택정비사업",
      "response_status": "partial",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "예: 광진구 고시 제YYYY-N호",
      "official_notice_date": "YYYY-MM-DD",
      "official_url": "",
      "attachment_name": "자료명 또는 고시번호만 확인됨",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "YYYY-MM-DD",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "data/review/evidence/example-response.pdf 또는 https://...",
      "response_note": "일부 식별자만 확인됨. 미확인 값과 추가 요청 경로를 구분해 기록",
      "follow_up_action": "node scripts/process-high-blocking-response-workflow.mjs",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "unavailable": {
      "rank": "28",
      "project_name": "자양번영로3나길 일대 가로주택정비사업",
      "response_status": "unavailable",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "",
      "response_note": "자료 미보유, 공개 원문 없음, 보존기간 경과 등 기관 회신 내용을 그대로 요약",
      "follow_up_action": "deferred decision으로 남기고 비교표에는 원문 미확인 주석 유지",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "info_disclosure_required": {
      "rank": "28",
      "project_name": "자양번영로3나길 일대 가로주택정비사업",
      "response_status": "info_disclosure_required",
      "response_received_at": "YYYY-MM-DD",
      "responder": "광진구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "district_area_sqm": "",
        "floor_area_ratio_pct": "",
        "building_coverage_ratio_pct": "",
        "floors": "",
        "max_height_m": "",
        "total_households": "",
        "stage_consent_rate_pct": "",
        "union_approval_date": "",
        "promotion_committee_approval_date": ""
      },
      "evidence_files": "",
      "response_note": "정보공개청구, 방문열람, 부분공개 절차 필요. 접수 경로와 보유부서 기록",
      "follow_up_action": "outbox 파일로 정보공개청구 접수 후 filing_status=filed_waiting_response 기록",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "광진구 정보공개청구 바로가기",
      "filing_url": "https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107",
      "filing_receipt_no": "",
      "filing_note": ""
    }
  },
  {
    "rank": "9",
    "project_name": "잠실우성4차 주택재건축정비사업조합",
    "no_response": {
      "rank": "9",
      "project_name": "잠실우성4차 주택재건축정비사업조합",
      "response_status": "no_response",
      "response_received_at": "",
      "responder": "",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "management_construction_cost": "",
        "management_total_project_cost": "",
        "management_cost_basis_date": ""
      },
      "evidence_files": "",
      "response_note": "",
      "follow_up_action": "",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "송파구 주택사업과 직원검색",
      "filing_url": "https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "confirmed": {
      "rank": "9",
      "project_name": "잠실우성4차 주택재건축정비사업조합",
      "response_status": "confirmed",
      "response_received_at": "YYYY-MM-DD",
      "responder": "송파구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "관리처분계획인가 별첨 또는 공사비 기준자료명",
      "confirmed_values": {
        "management_construction_cost": "숫자와 단위",
        "management_total_project_cost": "",
        "management_cost_basis_date": "YYYY-MM-DD 또는 자료 기준일"
      },
      "evidence_files": "data/review/evidence/example-response.pdf 또는 https://...",
      "response_note": "회신에서 확인된 자료명·보유부서·공개 범위를 개인정보 없이 요약",
      "follow_up_action": "node scripts/process-high-blocking-response-workflow.mjs",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "송파구 주택사업과 직원검색",
      "filing_url": "https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "partial": {
      "rank": "9",
      "project_name": "잠실우성4차 주택재건축정비사업조합",
      "response_status": "partial",
      "response_received_at": "YYYY-MM-DD",
      "responder": "송파구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "자료명만 확인됐고 금액은 비공개/열람 필요",
      "confirmed_values": {
        "management_construction_cost": "",
        "management_total_project_cost": "",
        "management_cost_basis_date": "YYYY-MM-DD 또는 자료 기준일"
      },
      "evidence_files": "data/review/evidence/example-response.pdf 또는 https://...",
      "response_note": "일부 식별자만 확인됨. 미확인 값과 추가 요청 경로를 구분해 기록",
      "follow_up_action": "node scripts/process-high-blocking-response-workflow.mjs",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "송파구 주택사업과 직원검색",
      "filing_url": "https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "unavailable": {
      "rank": "9",
      "project_name": "잠실우성4차 주택재건축정비사업조합",
      "response_status": "unavailable",
      "response_received_at": "YYYY-MM-DD",
      "responder": "송파구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "management_construction_cost": "",
        "management_total_project_cost": "",
        "management_cost_basis_date": ""
      },
      "evidence_files": "",
      "response_note": "자료 미보유, 공개 원문 없음, 보존기간 경과 등 기관 회신 내용을 그대로 요약",
      "follow_up_action": "deferred decision으로 남기고 비교표에는 원문 미확인 주석 유지",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "송파구 주택사업과 직원검색",
      "filing_url": "https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000",
      "filing_receipt_no": "",
      "filing_note": ""
    },
    "info_disclosure_required": {
      "rank": "9",
      "project_name": "잠실우성4차 주택재건축정비사업조합",
      "response_status": "info_disclosure_required",
      "response_received_at": "YYYY-MM-DD",
      "responder": "송파구 담당부서",
      "official_notice_no": "",
      "official_notice_date": "",
      "official_url": "",
      "attachment_name": "",
      "confirmed_values": {
        "management_construction_cost": "",
        "management_total_project_cost": "",
        "management_cost_basis_date": ""
      },
      "evidence_files": "",
      "response_note": "정보공개청구, 방문열람, 부분공개 절차 필요. 접수 경로와 보유부서 기록",
      "follow_up_action": "outbox 파일로 정보공개청구 접수 후 filing_status=filed_waiting_response 기록",
      "filing_status": "ready_to_file",
      "filed_at": "",
      "filing_channel": "송파구 주택사업과 직원검색",
      "filing_url": "https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000",
      "filing_receipt_no": "",
      "filing_note": ""
    }
  }
]
```
