# High Blocking 정보공개청구 패킷

작성 기준: 2026-06-24 KST

이 문서는 공개 검색과 일반 문의만으로 닫히지 않은 high blocking 원문 병목을 정보공개청구 또는 공식 민원으로 전환하기 위한 실행 패킷이다. 목적은 추정값을 채우는 것이 아니라, 확정값 승격에 필요한 원문 식별자·자료명·공개/비공개 사유를 구조화해서 받는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 3 |
| 정보공개 전환 준비 | 0 |
| 관할 분포 | 광진구 2; 송파구 1 |
| 단계 분포 | 조합설립인가 2; 관리처분인가 1 |

## 전환 기준

1. 담당부서 또는 정보몽땅 회신으로 고시번호·고시일·원문 URL·자료명이 확인되면 정보공개청구 없이 `node scripts/record-high-blocking-response.mjs` 또는 `high-blocking-source-response-intake.json`으로 반영한다.
2. 회신이 없거나 공개 URL이 없다는 답변이면 아래 청구 본문을 사용해 정보공개청구/공식 민원으로 전환한다.
3. 회신에서 개인정보나 비공개 대상 내용이 섞여 있으면 사업 수치·자료명·고시정보만 intake에 기록한다.
4. 회신 자체는 자동 확정 근거가 아니다. `node scripts/generate-high-blocking-response-decision-drafts.mjs`로 검증해 `ready_to_append`인 경우만 decision 로그에 붙인다.

## 사업별 요약

| 순위 | 사업장 | 청구/문의 대상 | 우선 채널 | 공개 검색 결론 | 남은 공백 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 광진구청 주거사업과 또는 정보공개청구 접수부서 | 광진구 정보공개청구 바로가기 | 공식 공개 검색은 현재 소진. 조합설립인가 고시번호·고시일·첨부 원문은 담당부서/정보공개 회신 필요 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | filed_waiting_response |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 광진구청 주거사업과 또는 정보공개청구 접수부서 | 광진구 정보공개청구 바로가기 | 공식 공개 검색은 현재 소진. 조합설립인가 고시번호·고시일·첨부 원문은 담당부서/정보공개 회신 필요 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | filed_waiting_response |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 송파구청 주택사업과 또는 정보공개청구 접수부서 | 송파구 주택사업과 직원검색 | 관리처분 공사비는 비회원 공개 화면에서 미노출이라 송파구/정보몽땅 회신 또는 정보공개청구가 필요 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | filed_waiting_response |

## 청구 본문

### 23. 광장동 삼성1차아파트 소규모재건축정비사업

| 항목 | 내용 |
| --- | --- |
| 접수 대상 | 광진구청 주거사업과 또는 정보공개청구 접수부서 |
| 우선 채널 | 광진구 정보공개청구 바로가기 |
| 공식 URL | https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107 |
| 보조 채널 | 광진구 주거사업과 부서 안내; 광진구 업무검색; 광진구 민원신청방법; 국민신문고; 정비사업 정보몽땅 문의처 안내; 정비사업 정보몽땅 사업장 정보공개 담당자 현황 |
| 클로저 | S2-0002 |
| 회신 입력 | data/review/high-blocking-source-response-intake.json |
| 값 승격 규칙 | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

청구 제목:

```text
[정보공개청구] 광장동 삼성1차아파트 소규모재건축정비사업 조합설립인가 고시문 및 고시번호·고시일 공개 요청
```

청구 내용:

```text
안녕하세요.

광장동 삼성1차아파트 소규모재건축정비사업의 조합설립인가 관련 공식 자료 확인을 요청드립니다.

사업명: 광장동 삼성1차아파트 소규모재건축정비사업
관할/단계: 광진구 / 조합설립인가

확인 요청 자료
1. 조합설립인가 고시문 또는 인가 관련 공고문 원문
2. 조합설립인가 고시번호, 고시일, 인가일, 원문/첨부 URL
3. 고시문 또는 첨부에 포함된 정비구역 면적, 용적률, 건폐율, 층수, 최고높이, 총 세대수 등 사업개요 수치의 기준일
4. 전자파일 공개가 어려운 경우 자료명, 보유부서, 공개/부분공개/비공개 사유

현재 공개화면에서는 조합설립인가 신청일·인가일 일부만 확인되고, 고시번호·고시일·원문 URL은 확인되지 않아 문의드립니다.

가능하면 전자파일, 공개 URL, 고시번호·고시일, 자료명, 기준일을 함께 알려주시기 바랍니다. 비공개 대상이 있으면 공개 가능한 부분, 비공개 사유, 방문열람 가능 여부를 구분해 회신 부탁드립니다.

감사합니다.
```

회신 후 채울 intake 필드:

```text
response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action
```

### 28. 자양번영로3나길 일대 가로주택정비사업

| 항목 | 내용 |
| --- | --- |
| 접수 대상 | 광진구청 주거사업과 또는 정보공개청구 접수부서 |
| 우선 채널 | 광진구 정보공개청구 바로가기 |
| 공식 URL | https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107 |
| 보조 채널 | 광진구 주거사업과 부서 안내; 광진구 업무검색; 광진구 민원신청방법; 국민신문고; 정비사업 정보몽땅 문의처 안내; 정비사업 정보몽땅 사업장 정보공개 담당자 현황 |
| 클로저 | S2-0003 |
| 회신 입력 | data/review/high-blocking-source-response-intake.json |
| 값 승격 규칙 | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

청구 제목:

```text
[정보공개청구] 자양번영로3나길 일대 가로주택정비사업 조합설립인가 고시문 및 고시번호·고시일 공개 요청
```

청구 내용:

```text
안녕하세요.

자양번영로3나길 일대 가로주택정비사업의 조합설립인가 관련 공식 자료 확인을 요청드립니다.

사업명: 자양번영로3나길 일대 가로주택정비사업
관할/단계: 광진구 / 조합설립인가

확인 요청 자료
1. 조합설립인가 고시문 또는 인가 관련 공고문 원문
2. 조합설립인가 고시번호, 고시일, 인가일, 원문/첨부 URL
3. 고시문 또는 첨부에 포함된 정비구역 면적, 용적률, 건폐율, 층수, 최고높이, 총 세대수 등 사업개요 수치의 기준일
4. 전자파일 공개가 어려운 경우 자료명, 보유부서, 공개/부분공개/비공개 사유

현재 공개화면에서는 조합설립인가 신청일·인가일 일부만 확인되고, 고시번호·고시일·원문 URL은 확인되지 않아 문의드립니다.

가능하면 전자파일, 공개 URL, 고시번호·고시일, 자료명, 기준일을 함께 알려주시기 바랍니다. 비공개 대상이 있으면 공개 가능한 부분, 비공개 사유, 방문열람 가능 여부를 구분해 회신 부탁드립니다.

감사합니다.
```

회신 후 채울 intake 필드:

```text
response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.district_area_sqm; confirmed_values.floor_area_ratio_pct; confirmed_values.building_coverage_ratio_pct; confirmed_values.floors; confirmed_values.max_height_m; confirmed_values.total_households; confirmed_values.union_approval_date; evidence_files; response_note; follow_up_action
```

### 9. 잠실우성4차 주택재건축정비사업조합

| 항목 | 내용 |
| --- | --- |
| 접수 대상 | 송파구청 주택사업과 또는 정보공개청구 접수부서 |
| 우선 채널 | 송파구 주택사업과 직원검색 |
| 공식 URL | https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000 |
| 보조 채널 | 송파구 새올전자민원창구; 정비사업 정보몽땅 문의처 안내; 정비사업 정보몽땅 사업장 정보공개 담당자 현황 |
| 클로저 | S4-0002 |
| 회신 입력 | data/review/high-blocking-source-response-intake.json |
| 값 승격 규칙 | 관리처분 공사비·총사업비 금액, 기준일, 자료명 또는 원문 URL이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

청구 제목:

```text
[정보공개청구] 잠실우성4차 주택재건축정비사업조합 관리처분계획인가 고시문·별첨 및 공사비 기준자료 공개 요청
```

청구 내용:

```text
안녕하세요.

잠실우성4차 주택재건축정비사업조합의 관리처분계획인가 관련 공식 자료 확인을 요청드립니다.

사업명: 잠실우성4차 주택재건축정비사업조합
관할/단계: 송파구 / 관리처분인가

확인 요청 자료
1. 관리처분계획인가 고시문 원문 또는 고시번호·고시일
2. 관리처분계획인가 별첨 중 총 공사비, 정비사업비, 공사비 추산액 또는 해당 금액의 기준일이 포함된 공개 가능 자료
3. 위 자료가 정보몽땅 비회원 공개화면에서 열람되지 않는 경우 공개 가능 경로, 방문열람 가능 여부, 담당 부서명
4. 전자파일 공개가 어려운 경우 자료명, 보유부서, 공개/부분공개/비공개 사유

현재 공개화면에서는 관리처분 관련 인가일·고시일 일부만 확인되고, 공사비·정비사업비 수치 및 별첨 원문은 확인되지 않아 문의드립니다.

가능하면 전자파일, 공개 URL, 고시번호·고시일, 자료명, 기준일을 함께 알려주시기 바랍니다. 비공개 대상이 있으면 공개 가능한 부분, 비공개 사유, 방문열람 가능 여부를 구분해 회신 부탁드립니다.

감사합니다.
```

회신 후 채울 intake 필드:

```text
response_status; response_received_at; responder; official_notice_no; official_notice_date; official_url; attachment_name; confirmed_values.management_construction_cost; confirmed_values.management_total_project_cost; confirmed_values.management_cost_basis_date; evidence_files; response_note; follow_up_action
```

