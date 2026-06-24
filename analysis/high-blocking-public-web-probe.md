# High Blocking 공식 웹 프로브

작성 기준: 2026-06-24 KST

이 문서는 high blocking으로 남은 3개 사업장에 대해 비회원으로 접근 가능한 공식 웹 화면에서 무엇을 확인했고, 무엇이 여전히 담당부서/정보공개 확인 대상으로 남는지 기록한다. 웹 화면의 사업개요 값은 참고 근거를 강화하지만, 고시번호·고시일·인가 원문 URL·관리처분 별첨이 없으면 confirmed 승격 근거로 쓰지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 프로브 행 | 5 |
| 대상 사업장 | 3 |
| 공식 요약 보강 | 2 |
| 외부 확인 필요 확인 | 3 |
| 해결 완료 | 0 |
| 효과 분포 | confirms_external_escalation_needed 3; summary_support_only 2 |

## 프로브 결과

| 순위 | 사업장 | 공식 화면 | 유형 | 확인값 | 고시/별첨 공개상태 | 효과 | 남은 공백 | 다음 행동 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비사업 정보몽땅 사업개요 | official_summary_page | district_area_sqm=7,653; building_coverage_ratio_pct=20; floor_area_ratio_pct=300; max_height_m=0; floors=지상:40/지하:3; total_households_context=분양 공급계획 108+73+4=185 |  | summary_support_only | 고시번호, 고시일, 원문/첨부 URL은 사업개요 화면에서 확인되지 않는다. | 광진구 주거사업과 또는 정보몽땅 담당 창구에서 조합설립인가 고시번호·고시일·첨부 원문을 확인한다. |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정비사업 정보몽땅 정보공개목록 | official_disclosure_list | project_stage=조합설립인가; notice_disclosure_category=고시/공고 기타; notice_disclosure_total=0; notice_request_total=0 | 고시/공고 처리완료 0건 | confirms_external_escalation_needed | 비회원 공개 정보공개목록의 고시/공고 항목에 공개 완료 자료가 없다. | 공개목록이 0건이므로 담당부서 확인 또는 정보공개청구 경로로 남긴다. |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 정비사업 정보몽땅 사업개요 | official_summary_page | district_area_sqm=2,307.5; building_coverage_ratio_pct=23; floor_area_ratio_pct=295; max_height_m=58; floors=지상:20/지하:3; visible_supply_counts_context=분양/임대 세부 26+25+13. 계 필드는 공개 화면에서 빈 값 |  | summary_support_only | 고시번호, 고시일, 원문/첨부 URL은 사업개요 화면에서 확인되지 않는다. 총 세대수는 계 필드가 공란이라 합산 후보로만 취급한다. | 광진구 주거사업과 또는 정보몽땅 담당 창구에서 조합설립인가 고시번호·고시일·첨부 원문과 총 세대수 기준을 확인한다. |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 정비사업 정보몽땅 정보공개목록 | official_disclosure_list | project_stage=조합설립인가; notice_disclosure_category=고시/공고 기타; notice_disclosure_total=0; notice_request_total=0 | 고시/공고 처리완료 0건 | confirms_external_escalation_needed | 비회원 공개 정보공개목록의 고시/공고 항목에 공개 완료 자료가 없다. | 공개목록이 0건이므로 담당부서 확인 또는 정보공개청구 경로로 남긴다. |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 정비사업 정보몽땅 공개항목 비회원 접근 확인 | official_disclosure_detail | unauthenticated_access_message=권한이 없습니다. 먼저 로그인을 해주세요; management_construction_cost= | 비회원 호출에서 관리처분 공사비 값 미노출 | confirms_external_escalation_needed | 관리처분계획 별첨 또는 공개 가능한 정비사업비/공사비 추산액은 비회원 공개 화면에서 확인되지 않는다. | 송파구 주택사업과, 정보몽땅 공개항목 열람 권한, 또는 정보공개청구로 관리처분 공사비 기준 자료를 확인한다. |

## 판정

- 광진구 2건은 정보몽땅 사업개요의 면적·건폐율·용적률·층수 등 요약값을 재확인했지만, 정보공개목록의 고시/공고 공개 건수가 0건이라 조합설립인가 고시번호·고시일·첨부 원문은 여전히 외부 확인 대상이다.
- 자양번영로3나길 총 세대수는 공급계획의 세부 칸만 보이고 계 필드가 비어 있어, 합산 후보를 확정값으로 승격하지 않는다.
- 잠실우성4차 관리처분 공사비는 비회원 공개 화면에서 값이 노출되지 않아, 관리처분계획 별첨 또는 공개 가능한 정비사업비 자료 확인이 필요하다.
