# High Blocking 문의 채널 레지스트리

작성 기준: 2026-06-24 KST

이 문서는 high blocking 잔여 원문 확인 패킷을 어느 공식 채널로 보낼지 고정한다. 여기의 채널 정보는 라우팅 근거이며, 사업 수치나 고시 정보를 확정하는 근거가 아니다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 채널 수 | 9 |
| 관할 수 | 3 |
| 대상 사업장 | 3 |
| 채널 유형 | civil_petition 3; staff_search 2; competent_status_page 1; department_page 1; disclosure_portal 1; system_helpdesk 1 |
| 관할 분포 | 광진구 5; 서울시/정보몽땅 2; 송파구 2 |

## 사용 규칙

- 이 레지스트리는 high blocking 잔여 원문 확인을 어디로 보낼지 정하는 채널 목록이다.
- 개별 담당자 이름과 직통 연락처는 연구 파일에 복사하지 않고, 공식 부서 안내·직원검색·민원창구 URL만 저장한다.
- 채널 자체는 값 확정 근거가 아니다. 회신·원문 URL·첨부 파일명·고시번호·고시일을 data/review/high-blocking-source-response-intake.json에 기록한 뒤 decision 초안으로 검증한다.
- 정보몽땅 시스템 조작/장애 문의와 개별 사업 내용 문의를 혼동하지 않는다. 공개 내용 자체는 해당 조합 또는 관할구청 담당부서 확인 대상으로 둔다.
- 광진구는 새올전자민원창구 첫 화면에서 상담민원 접수 및 조회가 국민신문고로 통합되었다고 안내한다.
- 광진구 공식 정보공개청구 페이지는 대한민국정보공개포털 바로가기를 제공하므로, 23·28번 건처럼 고시문·원문 문서를 요청할 때는 국민신문고 일반민원보다 정보공개청구 경로를 우선한다.

## 사업장별 채널 커버리지

| 순위 | 사업장 | 채널 수 | 우선 채널 |
| --- | --- | --- | --- |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 4 | 송파구 주택사업과 직원검색; 송파구 새올전자민원창구 |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 7 | 광진구 정보공개청구 바로가기; 광진구 주거사업과 부서 안내 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 7 | 광진구 정보공개청구 바로가기; 광진구 주거사업과 부서 안내 |

## 채널 목록

| ID | 관할 | 유형 | 채널 | 순서 | 대상 | 문의 범위 | 접수 힌트 | 공식 URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gwangjin_information_disclosure_portal | 광진구 | disclosure_portal | 광진구 정보공개청구 바로가기 | 1 | 23; 28 | 조합설립인가 고시문, 고시번호, 고시일, 원문/첨부 URL 등 공식 문서 원문 정보공개청구 | 광진구 정보공개청구 바로가기에서 대한민국정보공개포털(open.go.kr)로 진행한다. 문서 원문 요청은 이 경로를 우선 사용하고, 담당부서는 주거사업과 기준으로 적는다. | https://www.gwangjin.go.kr/portal/main/contents.do?menuNo=200107 |
| gwangjin_housing_redevelopment_department | 광진구 | department_page | 광진구 주거사업과 부서 안내 | 2 | 23; 28 | 조합설립인가 고시번호·고시일·원문 URL, 공개 URL 부재 시 열람/정보공개 대상 자료명 확인 | 부서 안내 페이지의 직원담당안내/업무검색에서 최신 담당업무를 확인한다. | https://www.gwangjin.go.kr/portal/bbs/B0000113/deptGdc.do?deptId=101591&menuNo=201015 |
| gwangjin_staff_search | 광진구 | staff_search | 광진구 업무검색 | 3 | 23; 28 | 주거사업과 부서 안내만으로 담당업무가 불명확할 때 정비사업·소규모주택정비·가로주택정비 업무 담당 경로 확인 | 업무검색에서 사업명 또는 정비사업 담당업무를 확인한 뒤 공식 민원/부서 경로로 문의한다. | https://www.gwangjin.go.kr/portal/member/user/searchEmpList.do?searchDeptId=100259&menuNo=200203 |
| songpa_housing_project_department | 송파구 | staff_search | 송파구 주택사업과 직원검색 | 1 | 9 | 관리처분계획인가 별첨, 공사비/총사업비 공개 가능 자료명, 정보몽땅 비회원 미공개 항목의 열람·정보공개 경로 확인 | 송파구 공식 사업별 페이지 잠실우성4차 항목에서 담당부서 주택사업과와 최종 수정일 2026-03-19를 먼저 확인하고, 직원검색 페이지에서 최신 담당업무를 확인한다. 연결이 안 되면 대표전화 02-2147-2000 또는 새올전자민원창구로 전환한다. | https://www.songpa.go.kr/www/selectEmpList.do?key=2356&deptCode=32303010000 |
| songpa_civil_petition_saeeol | 송파구 | civil_petition | 송파구 새올전자민원창구 | 2 | 9 | 부서 전화/직원검색으로 원문 자료명 또는 공개 가능 여부가 확인되지 않을 때 공식 민원으로 관리처분 별첨 확인 요청 | 민원 본문에는 사업명, 요청 자료명, 현재 공개화면에서 로그인 필요로 확인된 사실을 함께 적는다. | https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/emwp/cmmpotal/action/EmwpMainMgtAction.do? |
| gwangjin_civil_petition_guide | 광진구 | civil_petition | 광진구 민원신청방법 | 4 | 23; 28 | 담당부서 문의로 해결되지 않을 때 공식 민원신고 경로와 국민신문고 전환 기준 확인 | 민원신청방법 목록에서 국민신문고와 생활불편신고(새올전자민원창구 舊)를 함께 확인한다. 광진구 새올 본문 안내 기준 상담민원 접수는 국민신문고 또는 구 홈페이지 경로를 쓴다. | https://www.gwangjin.go.kr/portal/bbs/B0000090/list.do?menuNo=200032 |
| gwangjin_civil_petition_epeople | 광진구 | civil_petition | 국민신문고 | 5 | 23; 28 | 담당부서 민원 라우팅이나 일반 민원 제출이 필요할 때 공식 민원 제출 | 광진구 새올전자민원창구 본문 안내 기준 상담민원 접수 및 조회는 국민신문고로 통합되어 있다. 문서 원문 요청 자체는 정보공개청구 경로를 우선 검토한다. | https://www.epeople.go.kr/index.jsp |
| cleanup_helpdesk_disclosure | 서울시/정보몽땅 | system_helpdesk | 정비사업 정보몽땅 문의처 안내 | 6 | 9; 23; 28 | 정보몽땅 공개목록 0건, 비회원 로그인 필요, 계 필드 공란 등 공개화면 상태가 시스템 문제인지 공개 정책/권한 문제인지 확인 | 정보공개 시스템 조작·장애 문의: 02-2126-4674, 02-2126-4672. 예산회계 문의: 02-2126-4673. | https://cleanup.seoul.go.kr/cleanup/html/qacenterPopup.html |
| cleanup_competent_disclosure_status | 서울시/정보몽땅 | competent_status_page | 정비사업 정보몽땅 사업장 정보공개 담당자 현황 | 7 | 9; 23; 28 | 사업장별 홈페이지 관리감독 관할처, 공개 주체, 구청/조합/시청 역할 확인 | 자치구·사업장 선택 후 공식 화면에서 최신 관할처를 확인한다. | https://cleanup.seoul.go.kr/cleanup/bbs/competent.do |

## 값 승격 경계

| ID | 개인정보/저장 규칙 | 값 승격 규칙 | 회신 입력 | decision 초안 |
| --- | --- | --- | --- | --- |
| gwangjin_information_disclosure_portal | 정보공개청구 회신 원문에 개인정보가 있으면 필요한 출처·자료명·고시정보만 요약해 intake에 기록한다. | 정보공개청구 회신에 고시번호, 고시일, 원문 URL, 첨부명, 보유부서, 공개/부분공개/비공개 사유가 들어올 때만 confirmed 또는 partial 판단 근거로 사용한다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| gwangjin_housing_redevelopment_department | 직원담당안내에 개별 성명·전화번호가 표시될 수 있으므로 이 레지스트리에는 URL만 저장한다. | 부서 회신에 고시번호, 고시일, 원문/첨부 URL 또는 열람 자료명이 포함될 때만 response intake에 입력한다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| gwangjin_staff_search | 개별 담당자 정보는 링크 대상 공식 페이지에서만 확인하고 연구 파일에 복사하지 않는다. | 업무검색 결과만으로 수치를 확정하지 않는다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| songpa_housing_project_department | 직원검색에 개별 성명·전화번호가 표시될 수 있으므로 이 레지스트리에는 부서 URL과 대표 경로만 저장한다. | 관리처분 공사비는 별첨/공식 회신/공개자료명 확인 전까지 확정값으로 승격하지 않는다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| songpa_civil_petition_saeeol | 민원 회신 원문은 개인정보가 있으면 필요한 출처·자료명·고시정보만 요약해 intake에 기록한다. | 민원 회신이 정보공개청구 또는 방문열람 필요라고 답하면 info_disclosure_required 상태로 기록한다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| gwangjin_civil_petition_guide | 민원신청방법 페이지는 경로 안내용이므로 담당자 개인 연락처나 민원 내용 자체를 이 문서에 저장하지 않는다. | 민원신청방법 목록은 라우팅 근거일 뿐 값 확정 근거가 아니다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| gwangjin_civil_petition_epeople | 민원 회신 원문에 개인정보가 있으면 필요한 출처·자료명·고시정보만 요약해 intake에 기록한다. | 민원 회신이 정보공개청구 또는 방문열람 필요라고 답하면 info_disclosure_required 상태로 기록한다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| cleanup_helpdesk_disclosure | 시스템 헬프데스크는 공개화면 접근·기능 확인용이며, 개별 사업 수치 확인의 최종 담당 경로로 쓰지 않는다. | 헬프데스크 답변은 공개경로/권한상태 확인으로만 사용하고 사업 수치 confirmed 근거로 쓰지 않는다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
| cleanup_competent_disclosure_status | 담당자명·연락처 항목이 페이지에 있을 수 있으나 연구 파일에는 관할처 확인 URL만 저장한다. | 담당자 현황은 문의 라우팅 근거일 뿐 수치 확정 근거가 아니다. | data/review/high-blocking-source-response-intake.json | analysis/high-blocking-response-decision-drafts.md |
