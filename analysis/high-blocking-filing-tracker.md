# High Blocking 접수/회신 Tracker

작성 기준: 2026-06-24 KST

이 문서는 high blocking 3개 사업장의 정보공개청구/공식 민원 접수 상태와 회신 반영 절차를 추적한다. 청구 본문 원문은 `analysis/high-blocking-info-disclosure-packet.md`에 있고, 이 파일은 접수 여부, 회신 intake, decision 승격 가능 여부만 운영 관점으로 압축한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 3 |
| 접수 또는 접수표시 필요 | 0 |
| 접수 후 회신 대기 | 3 |
| 후속 점검 필요 | 0 |
| 처리기한 임박/경과 | 0 |
| 회신 검증 필요 | 0 |
| decision append 가능 | 0 |
| 상태 분포 | filed_waiting_response 3 |

## 오늘 볼 순서

| 순위 | 사업장 | 접수상태 | 회신상태 | 우선채널 | 남은 공백 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | filed_waiting_response | no_response | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | 접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | filed_waiting_response | no_response | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | 접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | filed_waiting_response | no_response | 송파구 새올전자민원창구 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | 접수번호와 접수일을 유지하고 회신 도착 시 record-high-blocking-response helper로 상태/증거값 기록 |

## Intake에 추가로 적어두면 좋은 접수 필드

`data/review/high-blocking-source-response-intake.json`의 기존 스키마를 깨지 않고 아래 선택 필드를 행별로 추가할 수 있다.

| 필드 | 용도 |
| --- | --- |
| filing_status | ready_to_file, filed_waiting_response, response_received_validate 등 접수 운영 상태 |
| filed_at | 정보공개청구/공식 민원 접수일 |
| filing_channel | 실제 접수 또는 문의한 채널 |
| filing_url | 접수 또는 문의 URL |
| filing_receipt_no | 접수번호 |
| filing_note | 통화/문의/접수 과정 메모 |
| expected_response_by | 회신 예정일 또는 처리기한 |
| next_check_date | 다음으로 상태를 다시 확인할 날짜 |
| next_check_note | 다음 점검 때 확인할 포인트 |
| last_checked_at | 마지막으로 민원 상태를 확인한 날짜 |

## 회신 후 처리

1. 회신에서 원문 URL, 고시번호, 고시일, 자료명, 보유부서, 부분공개/비공개 사유 중 확인된 값을 가능하면 `node scripts/record-high-blocking-response.mjs`로 먼저 반영한다.
2. `node scripts/process-high-blocking-response-workflow.mjs`로 intake validation, decision draft, apply dry-run을 한 번에 확인한다.
3. `draft_status=ready_to_append`이고 workflow 로그가 예상과 맞을 때만 `node scripts/process-high-blocking-response-workflow.mjs --write`로 반영한다.
4. `--write` 실행은 전체 산출물 재생성까지 이어지며, 마지막에 completion audit을 확인한다.

## 접수 문안 바로가기

### 23. 광장동 삼성1차아파트 소규모재건축정비사업

| 항목 | 내용 |
| --- | --- |
| 접수상태 | filed_waiting_response |
| 대기상태 | waiting |
| 우선채널 | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 |
| URL | https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do |
| 접수일/번호 | 2026-06-23 / 16913396 |
| 처리기한/다음점검 | 미기록 / 2026-06-29 |
| 회신 입력 | data/review/high-blocking-source-response-intake.json |
| 승격 규칙 | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

제목:

```text
[정보공개청구] 광장동 삼성1차아파트 소규모재건축정비사업 조합설립인가 고시문 및 고시번호·고시일 공개 요청
```

본문:

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

### 28. 자양번영로3나길 일대 가로주택정비사업

| 항목 | 내용 |
| --- | --- |
| 접수상태 | filed_waiting_response |
| 대기상태 | waiting |
| 우선채널 | 대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기 |
| URL | https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do |
| 접수일/번호 | 2026-06-23 / 16913410 |
| 처리기한/다음점검 | 2026-07-06 / 2026-06-29 |
| 회신 입력 | data/review/high-blocking-source-response-intake.json |
| 승격 규칙 | 고시번호·고시일·원문 URL 또는 첨부명 중 하나 이상과 자료 보유/기준일이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

제목:

```text
[정보공개청구] 자양번영로3나길 일대 가로주택정비사업 조합설립인가 고시문 및 고시번호·고시일 공개 요청
```

본문:

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

### 9. 잠실우성4차 주택재건축정비사업조합

| 항목 | 내용 |
| --- | --- |
| 접수상태 | filed_waiting_response |
| 대기상태 | waiting |
| 우선채널 | 송파구 새올전자민원창구 |
| URL | https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/caf/mwwd/action/CafMwWdInputAction.do |
| 접수일/번호 | 2026-06-23 / 626590 |
| 처리기한/다음점검 | 미기록 / 2026-06-29 |
| 회신 입력 | data/review/high-blocking-source-response-intake.json |
| 승격 규칙 | 관리처분 공사비·총사업비 금액, 기준일, 자료명 또는 원문 URL이 회신에 들어 있을 때만 confirmed/partial decision 초안으로 승격한다. |

제목:

```text
[정보공개청구] 잠실우성4차 주택재건축정비사업조합 관리처분계획인가 고시문·별첨 및 공사비 기준자료 공개 요청
```

본문:

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

