# 공식 업데이트 -> Source Verification 브리지

작성 기준: 2026-06-24 KST

이 문서는 `official-update-intake`에 들어온 공식 고시/공고가 실제 `source-verification-closure-ledger`와 `source-verification-closure-decisions` 어디에 이미 반영됐는지 연결한다. 같은 사업 rank 직접 매칭뿐 아니라, 같은 `noticeCode` 또는 `고시번호`를 공유하는 연관 사업장도 같이 보여준다.

## 요약

| 항목 | 값 |
| --- | ---: |
| source verification 대상 update | 13 |
| candidate closure 행 | 98 |
| applied 승격 후보 | 13 |
| 수동 review 필요 | 0 |
| 후속 추적 남음 | 0 |
| 연관 사업장 포함 update | 1 |
| decision context 불일치 | 0 |

| 구분 | 값 |
| --- | --- |
| bridge_status | reflected 10; no_candidate_found 2; reflected_with_related_projects 1 |
| closure_status | confirmed 92; deferred 6 |

## update별 적용 상태

| update_id | 순위 | 사업 | 고시번호 | noticeCode | 현재 상태 | 권장 상태 | candidate | target closure | pending | 연관 순위 | bridge | closure_id | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| upd-20260623-0001 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 2023-516 | 11000NTC202312010004 | applied | applied | 3 | confirmed 1 | 0 | 11; 15 | reflected_with_related_projects | S1-0036; S1-0035; S2-0004 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260623-0002 | 26 | 자양한양아파트 재건축정비사업 | 2024-267 | 11215NTC202406040002 | applied | applied | 18 | confirmed 14; deferred 4 | 0 |  | reflected | S1-0031; S1-0032; S1-0033; S1-0034; S5-0109; S5-0110; S5-0111; S5-0112; S5-0113; S5-0114; S5-0115; S5-0116; S5-0117; S5-0118; S5-0119; S5-0120; S5-0121; S5-0122 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260623-0003 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 2020-111 | 11710NTC202010230006 | applied | applied | 23 | confirmed 23 | 0 |  | reflected | S1-0028; S1-0029; S1-0030; S5-0098; S5-0099; S5-0100; S5-0101; S5-0102; S5-0103; S5-0104; S5-0105; S5-0106; S5-0107; S5-0108; S4-0010; S4-0011; S4-0012; S4-0013; S4-0014; S4-0015; S4-0016; S4-0017; S4-0018 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0001 | 9 | 잠실우성4차 주택재건축정비사업조합 | 2021-671 | 11000NTC202302220005 | applied | applied | 21 | confirmed 20; deferred 1 | 0 |  | reflected | S4-0001; S4-0002; S4-0003; S4-0004; S4-0005; S4-0006; S4-0007; S4-0008; S4-0009; S5-0052; S5-0053; S5-0054; S5-0055; S5-0056; S5-0057; S5-0058; S5-0059; S5-0060; S5-0061; S5-0062; S5-0063 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0002 | 9 | 잠실우성4차 주택재건축정비사업조합 | 2026-49 | 11000NTC202501230002 | triaged | applied | 21 | confirmed 20; deferred 1 | 0 |  | reflected | S4-0001; S4-0002; S4-0003; S4-0004; S4-0005; S4-0006; S4-0007; S4-0008; S4-0009; S5-0052; S5-0053; S5-0054; S5-0055; S5-0056; S5-0057; S5-0058; S5-0059; S5-0060; S5-0061; S5-0062; S5-0063 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0101 |  | 천호3구역 | 2025-194 | 11740NTC202511180006 | applied | applied | 2 | confirmed 2 | 0 |  | reflected | SX-0001; SX-0002 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0102 |  | 성내미주아파트 주택재건축정비사업 | 2016-123 | 11000NTC201608247852 | applied | applied | 2 | confirmed 2 | 0 |  | reflected | SX-0003; SX-0004 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0103 |  | 신동아1·2차아파트 주택재건축 정비사업 | 2025-48 | 11740NTC202504220008 | applied | applied | 2 | confirmed 2 | 0 |  | reflected | SX-0005; SX-0006 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0204 |  | 천호3 주택재건축정비사업조합 | 2026-22 |  | applied | applied | 0 |  | 0 |  | no_candidate_found |  | project_rank, noticeCode, notice_no 기준으로 source verification closure 수동 매핑 |
| upd-20260624-0205 |  | 천호3 주택재건축정비사업조합 | 2026-66 |  | applied | applied | 0 |  | 0 |  | no_candidate_found |  | project_rank, noticeCode, notice_no 기준으로 source verification closure 수동 매핑 |
| upd-20260624-0104 |  | 신당 제8구역 주택재개발정비사업 | 2023-6 | 11140NTC202302130001 | applied | applied | 2 | confirmed 2 | 0 |  | reflected | SX-0007; SX-0008 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0105 |  | 신당 제9주택재개발정비구역 | 2021-102 | 11140NTC202109170002 | applied | applied | 2 | confirmed 2 | 0 |  | reflected | SX-0009; SX-0010 | official-update-intake 행을 applied로 올리고 재생성 |
| upd-20260624-0106 |  | 금호 제14-1 주택재개발 정비사업 | 2023-13 | 11200NTC202302270005 | applied | applied | 2 | confirmed 2 | 0 |  | reflected | SX-0011; SX-0012 | official-update-intake 행을 applied로 올리고 재생성 |

## candidate closure 상세

| update_id | match | closure_id | 순위 | 사업 | 필드 | closure | decision | ctx | 근거 | decision_id | resolved | 후속 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| upd-20260623-0001 | direct+evidence | S1-0036 | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 기반시설 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no | svc-20260624-0069 |  | 기반시설 공개항목은 scope signal로 유지하고, 개별 사업 수치 갱신은 후속 직접 고시나 공식 사업개요로만 반영 |
| upd-20260623-0001 | related_notice | S1-0035 | 11 | 압구정아파트지구 특별계획구역4 | 기반시설 | confirmed | confirmed | Y | notice_code; notice_no | svc-20260624-0068 |  | 기반시설 공개항목은 scope signal로 유지하고, 개별 사업 수치 갱신은 후속 직접 고시나 공식 사업개요로만 반영 |
| upd-20260623-0001 | related_notice | S2-0004 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 2 fields | confirmed | confirmed | Y | notice_code; notice_no | svc-20260624-0085 |  | presentSn 11680UQ120PS202605200002는 보조 식별자로 유지하되, direct map recordCode가 확인되면 별도로 승격 |
| upd-20260623-0002 | direct+evidence | S1-0031 | 26 | 자양한양아파트 재건축정비사업 | 비용·분담금 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0031 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0002 | direct+evidence | S1-0032 | 26 | 자양한양아파트 재건축정비사업 | 기반시설 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0032 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0002 | direct+evidence | S1-0033 | 26 | 자양한양아파트 재건축정비사업 | 공공기여·기부채납 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0033 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0002 | direct+evidence | S1-0034 | 26 | 자양한양아파트 재건축정비사업 | 용적률·비율 산정 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0034 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0002 | direct+evidence | S5-0109 | 26 | 자양한양아파트 재건축정비사업 | 추진위원회 승인일 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0224 |  | 향후 정보몽땅 화면이나 자치구 공고에서 승인일이 공개되면 단계 이력값으로 보강 |
| upd-20260623-0002 | direct+evidence | S5-0110 | 26 | 자양한양아파트 재건축정비사업 | 단계 공개 동의율 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0225 |  | 향후 정보몽땅 화면이나 자치구 공고에서 동의율이 공개되면 단계 이력값으로 보강 |
| upd-20260623-0002 | direct+evidence | S5-0111 | 26 | 자양한양아파트 재건축정비사업 | 건폐율 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0226 |  | 비교표 display_values에 공동주택 50% 이하와 정보몽땅 24%를 병기 |
| upd-20260623-0002 | direct+evidence | S5-0112 | 26 | 자양한양아파트 재건축정비사업 | 층수 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0227 |  | 비교표 display_values에 최고 40층 이하와 정보몽땅 지상35/지하3을 병기 |
| upd-20260623-0002 | direct+evidence | S5-0113 | 26 | 자양한양아파트 재건축정비사업 | 최고높이 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0228 |  | 비교표 display_values에 121m 이하와 정보몽땅 35m를 병기 |
| upd-20260623-0002 | direct+evidence | S5-0114 | 26 | 자양한양아파트 재건축정비사업 | 고시일 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0229 |  | confirmed 유지 |
| upd-20260623-0002 | direct+evidence | S5-0115 | 26 | 자양한양아파트 재건축정비사업 | 고시번호 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0230 |  | confirmed 유지 |
| upd-20260623-0002 | direct+evidence | S5-0116 | 26 | 자양한양아파트 재건축정비사업 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0231 |  | confirmed 유지 |
| upd-20260623-0002 | direct+evidence | S5-0117 | 26 | 자양한양아파트 재건축정비사업 | 용적률 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0232 |  | 비교표 display_values에 293.77% 이하 / 241.42% 이하 / 300.0%를 병기 |
| upd-20260623-0002 | direct+evidence | S5-0118 | 26 | 자양한양아파트 재건축정비사업 | 총 세대수 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0233 |  | confirmed 유지 |
| upd-20260623-0002 | direct+evidence | S5-0119 | 26 | 자양한양아파트 재건축정비사업 | 관리처분인가일 | deferred | deferred | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0234 |  | 단계 변경 감시표에서 해당 사업장 단계가 바뀌면 다시 열기 |
| upd-20260623-0002 | direct+evidence | S5-0120 | 26 | 자양한양아파트 재건축정비사업 | 관리처분 공사비 | deferred | deferred | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0235 |  | 단계 변경 감시표에서 해당 사업장 단계가 바뀌면 다시 열기 |
| upd-20260623-0002 | direct+evidence | S5-0121 | 26 | 자양한양아파트 재건축정비사업 | 사업시행인가일 | deferred | deferred | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0236 |  | 단계 변경 감시표에서 해당 사업장 단계가 바뀌면 다시 열기 |
| upd-20260623-0002 | direct+evidence | S5-0122 | 26 | 자양한양아파트 재건축정비사업 | 조합설립인가일 | deferred | deferred | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0237 |  | 단계 변경 감시표에서 해당 사업장 단계가 바뀌면 다시 열기 |
| upd-20260623-0003 | direct+evidence | S1-0028 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 기반시설 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0028 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0003 | direct+evidence | S1-0029 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 공공기여·기부채납 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0029 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0003 | direct+evidence | S1-0030 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 용적률·비율 산정 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0030 |  | confirmed 항목은 사업별 메모와 S1 리뷰 보드에 원문 컨텍스트 확보 상태를 유지 |
| upd-20260623-0003 | direct+evidence | S5-0098 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 층수 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0213 |  | 대표값은 사업개요 층수를 유지하고 2020 고시 최고층 후보 31층은 시점별 참고값으로 병기 |
| upd-20260623-0003 | direct+evidence | S5-0099 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 건폐율 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0214 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0100 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0215 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0101 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 용적률 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0216 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0102 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가일 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0217 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0103 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분 공사비 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0218 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0104 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 사업시행인가일 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0219 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0105 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 총 세대수 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0220 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0106 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 최고높이 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0221 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0107 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 고시일 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0222 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct+evidence | S5-0108 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 고시번호 | confirmed | confirmed | Y | rank; project_name; notice_code; notice_no; path | svc-20260624-0223 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0010 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 건폐율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0059 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0011 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분 공사비 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0060 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0012 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 관리처분인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0061 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0013 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 사업시행인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0062 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0014 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 용적률 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0063 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0015 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0064 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0016 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 조합설립인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0065 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0017 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 총 세대수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0066 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260623-0003 | direct | S4-0018 | 21 | 가락삼익맨숀아파트 재건축정비사업 조합 | 층수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0067 |  | 비교표 대표값은 사업개요 층수를 유지하고 2020 고시 최고층 후보 31층은 시점별 원문값으로 병기 |
| upd-20260624-0001 | direct | S4-0001 | 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0050 |  | 비교표 대표값은 사업개요 현재값을 유지하고 2017 고시값 30%는 시점별 원문값으로 병기 |
| upd-20260624-0001 | direct | S4-0002 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분 공사비 | deferred | deferred | Y | rank; project_name | svc-20260624-0051 |  | 송파구 새올전자민원창구 접수번호 626590 회신 도착 시 고시번호·고시일·별첨·공사비 기준일을 intake에 기록하고 그때 decision을 재개 |
| upd-20260624-0001 | direct | S4-0003 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0052 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S4-0004 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0053 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S4-0005 | 9 | 잠실우성4차 주택재건축정비사업조합 | 용적률 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0172 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S4-0006 | 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0055 |  | 비교표 대표값은 사업개요 현재값을 유지하고 2017 고시 면적은 시점별 원문값으로 병기 |
| upd-20260624-0001 | direct | S4-0007 | 9 | 잠실우성4차 주택재건축정비사업조합 | 조합설립인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0056 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S4-0008 | 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0169 |  | 대표값은 사업개요 732세대를 유지하고 고시 916세대는 시점별 참고값으로 병기 |
| upd-20260624-0001 | direct | S4-0009 | 9 | 잠실우성4차 주택재건축정비사업조합 | 층수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0058 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S5-0052 | 9 | 잠실우성4차 주택재건축정비사업조합 | 추진위원회 승인일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0167 |  | confirmed 값 2009-12-07은 사업별 메모와 비교표에 반영하고, 최초 승인일 분리가 필요할 때만 별도 원인가 공문을 추가 확인 |
| upd-20260624-0001 | direct | S5-0053 | 9 | 잠실우성4차 주택재건축정비사업조합 | 단계 공개 동의율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0168 |  | confirmed 값 97.9695%를 사업시행인가 기준값으로 유지하고, 관리처분 단계 동의율은 별도 공개 전까지 추가 추정하지 않음 |
| upd-20260624-0001 | direct | S5-0054 | 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0288 |  | 대표값은 사업개요 732세대를 유지하고 고시 916세대는 시점별 참고값으로 병기 |
| upd-20260624-0001 | direct | S5-0055 | 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0170 |  | 대표값은 사업개요 25%를 유지하고 2017 고시 30%는 시점별 참고값으로 병기 |
| upd-20260624-0001 | direct | S5-0056 | 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0171 |  | 대표값은 사업개요 31,961.1㎡를 유지하고 2017 고시 31,630.5㎡는 시점별 참고값으로 병기 |
| upd-20260624-0001 | direct | S5-0057 | 9 | 잠실우성4차 주택재건축정비사업조합 | 용적률 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0289 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S5-0058 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0173 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S5-0059 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0174 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S5-0060 | 9 | 잠실우성4차 주택재건축정비사업조합 | 층수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0175 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0001 | direct | S5-0061 | 9 | 잠실우성4차 주택재건축정비사업조합 | 최고높이 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0176 |  | 대표값은 사업개요 100m를 유지하고 2017 고시 101m 이하는 시점별 참고값으로 병기 |
| upd-20260624-0001 | direct | S5-0062 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0177 |  | confirmed 고시일은 비교표 현재값으로 유지하고, 원문 본문 날짜 줄 재추출은 필요 시만 수행 |
| upd-20260624-0001 | direct | S5-0063 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시번호 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0178 |  | confirmed 고시번호는 비교표 현재값으로 유지하고, 서울도시공간포털 noticeCode와 함께 사업별 메모에 연결 상태를 유지 |
| upd-20260624-0002 | direct | S4-0001 | 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0050 |  | 비교표 대표값은 사업개요 현재값을 유지하고 2017 고시값 30%는 시점별 원문값으로 병기 |
| upd-20260624-0002 | direct | S4-0002 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분 공사비 | deferred | deferred | Y | rank; project_name | svc-20260624-0051 |  | 송파구 새올전자민원창구 접수번호 626590 회신 도착 시 고시번호·고시일·별첨·공사비 기준일을 intake에 기록하고 그때 decision을 재개 |
| upd-20260624-0002 | direct | S4-0003 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0052 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S4-0004 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0053 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S4-0005 | 9 | 잠실우성4차 주택재건축정비사업조합 | 용적률 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0172 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S4-0006 | 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0055 |  | 비교표 대표값은 사업개요 현재값을 유지하고 2017 고시 면적은 시점별 원문값으로 병기 |
| upd-20260624-0002 | direct | S4-0007 | 9 | 잠실우성4차 주택재건축정비사업조합 | 조합설립인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0056 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S4-0008 | 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0169 |  | 대표값은 사업개요 732세대를 유지하고 고시 916세대는 시점별 참고값으로 병기 |
| upd-20260624-0002 | direct | S4-0009 | 9 | 잠실우성4차 주택재건축정비사업조합 | 층수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0058 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S5-0052 | 9 | 잠실우성4차 주택재건축정비사업조합 | 추진위원회 승인일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0167 |  | confirmed 값 2009-12-07은 사업별 메모와 비교표에 반영하고, 최초 승인일 분리가 필요할 때만 별도 원인가 공문을 추가 확인 |
| upd-20260624-0002 | direct | S5-0053 | 9 | 잠실우성4차 주택재건축정비사업조합 | 단계 공개 동의율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0168 |  | confirmed 값 97.9695%를 사업시행인가 기준값으로 유지하고, 관리처분 단계 동의율은 별도 공개 전까지 추가 추정하지 않음 |
| upd-20260624-0002 | direct | S5-0054 | 9 | 잠실우성4차 주택재건축정비사업조합 | 총 세대수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0288 |  | 대표값은 사업개요 732세대를 유지하고 고시 916세대는 시점별 참고값으로 병기 |
| upd-20260624-0002 | direct | S5-0055 | 9 | 잠실우성4차 주택재건축정비사업조합 | 건폐율 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0170 |  | 대표값은 사업개요 25%를 유지하고 2017 고시 30%는 시점별 참고값으로 병기 |
| upd-20260624-0002 | direct | S5-0056 | 9 | 잠실우성4차 주택재건축정비사업조합 | 정비구역 면적 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0171 |  | 대표값은 사업개요 31,961.1㎡를 유지하고 2017 고시 31,630.5㎡는 시점별 참고값으로 병기 |
| upd-20260624-0002 | direct | S5-0057 | 9 | 잠실우성4차 주택재건축정비사업조합 | 용적률 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0289 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S5-0058 | 9 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0173 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S5-0059 | 9 | 잠실우성4차 주택재건축정비사업조합 | 사업시행인가일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0174 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S5-0060 | 9 | 잠실우성4차 주택재건축정비사업조합 | 층수 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0175 |  | confirmed 항목은 핵심 수치 장부/사업별 메모에 반영 여부를 점검 |
| upd-20260624-0002 | direct | S5-0061 | 9 | 잠실우성4차 주택재건축정비사업조합 | 최고높이 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0176 |  | 대표값은 사업개요 100m를 유지하고 2017 고시 101m 이하는 시점별 참고값으로 병기 |
| upd-20260624-0002 | direct | S5-0062 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시일 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0177 |  | confirmed 고시일은 비교표 현재값으로 유지하고, 원문 본문 날짜 줄 재추출은 필요 시만 수행 |
| upd-20260624-0002 | direct | S5-0063 | 9 | 잠실우성4차 주택재건축정비사업조합 | 고시번호 | confirmed | confirmed | Y | rank; project_name | svc-20260624-0178 |  | confirmed 고시번호는 비교표 현재값으로 유지하고, 서울도시공간포털 noticeCode와 함께 사업별 메모에 연결 상태를 유지 |
| upd-20260624-0101 | direct+evidence | SX-0001 |  | 천호3구역 | 고시일 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0276 |  | 확정 고시일을 expansion intake와 강동권 단계 보드에서 유지 |
| upd-20260624-0101 | direct+evidence | SX-0002 |  | 천호3구역 | 고시번호 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0277 |  | 확정 고시번호를 expansion intake와 강동권 단계 보드에서 유지 |
| upd-20260624-0102 | direct+evidence | SX-0003 |  | 성내미주아파트 주택재건축정비사업 | 고시일 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0278 |  | 확정 고시일을 expansion intake와 강동권 단계 보드에서 유지 |
| upd-20260624-0102 | direct+evidence | SX-0004 |  | 성내미주아파트 주택재건축정비사업 | 고시번호 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0279 |  | 확정 고시번호를 expansion intake와 강동권 단계 보드에서 유지 |
| upd-20260624-0103 | direct+evidence | SX-0005 |  | 신동아1·2차아파트 주택재건축 정비사업 | 고시일 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0280 |  | 확정 고시일을 expansion intake와 강동권 단계 보드에서 유지 |
| upd-20260624-0103 | direct+evidence | SX-0006 |  | 신동아1·2차아파트 주택재건축 정비사업 | 고시번호 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0281 |  | 확정 고시번호를 expansion intake와 강동권 단계 보드에서 유지 |
| upd-20260624-0104 | direct+evidence | SX-0007 |  | 신당 제8구역 주택재개발정비사업 | 고시일 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0282 |  | 확정 고시일을 expansion intake와 약수권 보드에서 유지 |
| upd-20260624-0104 | direct+evidence | SX-0008 |  | 신당 제8구역 주택재개발정비사업 | 고시번호 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0283 |  | 확정 고시번호를 expansion intake와 약수권 보드에서 유지 |
| upd-20260624-0105 | direct+evidence | SX-0009 |  | 신당 제9주택재개발정비구역 | 고시일 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0284 |  | 확정 고시일을 expansion intake와 약수권 보드에서 유지 |
| upd-20260624-0105 | direct+evidence | SX-0010 |  | 신당 제9주택재개발정비구역 | 고시번호 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0285 |  | 확정 고시번호를 expansion intake와 약수권 보드에서 유지 |
| upd-20260624-0106 | direct+evidence | SX-0011 |  | 금호 제14-1 주택재개발 정비사업 | 고시일 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0286 |  | 확정 고시일을 expansion intake와 약수권 보드에서 유지 |
| upd-20260624-0106 | direct+evidence | SX-0012 |  | 금호 제14-1 주택재개발 정비사업 | 고시번호 | confirmed | confirmed | Y | project_name; notice_code; notice_no; path; official_url | svc-20260624-0287 |  | 확정 고시번호를 expansion intake와 약수권 보드에서 유지 |

## 운영 원칙

- `direct`는 같은 `project_rank` 또는 같은 사업명 매칭이다.
- `related_notice`는 다른 rank라도 같은 `noticeCode`, `고시번호`, 원문 경로, 공식 URL을 공유하는 경우다.
- `suggested_decision_status=applied`는 해당 update의 원문이 이미 closure 장부/최신 decision evidence에 반영됐다는 뜻이다.
- `reflected_with_followups`는 최신 고시 연결은 확인됐고 intake는 applied로 둘 수 있지만, 일부 필드가 아직 `pending`이라 source verification 후속 검토가 남은 경우다.
- `manual_review_needed`는 candidate가 없거나, `open/conflict`가 섞였거나, 현재 장부 상태만으로 applied 승격이 안전하지 않은 경우다.
