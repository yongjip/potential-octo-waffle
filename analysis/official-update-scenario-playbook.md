# 공식 업데이트 시나리오 플레이북

작성 기준: 2026-06-24 KST

이 문서는 새 공식 업데이트를 발견했을 때 `data/review/official-update-intake.json`에 어떤 형태로 적고, 어느 검증 장부로 넘길지 시나리오별로 고정한다. 원격 사이트를 직접 호출하지 않고 현재 변경 감지 보드와 intake 라우팅 규칙만 사용한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 시나리오 | 14 |
| 라우팅 가능 | 14 |
| 완료 병목 직결 | 4 |
| context_only | 3 |
| 텍스트 추출 필요 | 3 |

| 구분 | 값 |
| --- | --- |
| route | high_blocking_response_intake 4; official_context_source 3; market_manual_or_api_intake 3; project_note_and_risk_review 2; expansion_zone_latest_check 2 |
| evidence | unverified 8; needs_text_extraction 3; context_only 3 |

## 시나리오별 처리표

| 출처 | 상황 | 예시 순위 | 예시 사업 | trigger | 증거상태 | route | 기록 위치 | 판정 gate | 다음 검증 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seoul_urban_notice | 관심구 정비계획/도시관리계획 고시가 새로 뜬 경우 | 28 | 자양번영로3나길 일대 가로주택정비사업 | official_notice | needs_text_extraction | high_blocking_response_intake | data/review/high-blocking-source-response-intake.json | 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격 | process-high-blocking-response-workflow dry-run에서 ready_to_append 또는 보류 사유 확인 |
| district_notice | 자치구 조합설립인가·정비계획 공고 후보를 발견한 경우 | 28 | 자양번영로3나길 일대 가로주택정비사업 | district_notice | needs_text_extraction | high_blocking_response_intake | data/review/high-blocking-source-response-intake.json | 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격 | process-high-blocking-response-workflow dry-run에서 ready_to_append 또는 보류 사유 확인 |
| seoul_sibo | 서울시보에서 고시번호와 PDF 원문을 찾은 경우 | 28 | 자양번영로3나길 일대 가로주택정비사업 | official_notice | needs_text_extraction | high_blocking_response_intake | data/review/high-blocking-source-response-intake.json | 고시번호·고시일·원문 URL·첨부 파일명·결정조서/도면 텍스트가 확인될 때만 사업 수치나 단계 근거로 승격 | process-high-blocking-response-workflow dry-run에서 ready_to_append 또는 보류 사유 확인 |
| seoul_traffic_news | 교통계획·환승·도로·보행 정책 업데이트를 발견한 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | transport_context | context_only | official_context_source | analysis/official-context-sources.csv | 보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격 | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| seoul_citybuild_news | 서울시 도시계획·주택 보도자료나 업무계획이 나온 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | policy_context | context_only | official_context_source | analysis/official-context-sources.csv | 보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격 | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| opengov | 정보소통광장 결재문서나 위원회 자료를 발견한 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | policy_context | context_only | official_context_source | analysis/official-context-sources.csv | 보도자료·결재문서는 context로만 두고, 고시·계획 원문 또는 교통대책 문서가 연결될 때 가설 승격 | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| cleanup_notice | 정보몽땅 공고/입찰/총회 공개항목이 추가된 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | cleanup_board | unverified | project_note_and_risk_review | project-notes/*.md; analysis/project-risk-signal-summary.md | 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 | 단계 변경·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영 |
| cleanup_project_status | 정보몽땅 사업 단계나 공개자료 수가 바뀐 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | cleanup_stage | unverified | project_note_and_risk_review | project-notes/*.md; analysis/project-risk-signal-summary.md | 단계 변경·공개자료 수 증가·새 입찰/총회 공고가 확인되면 원문 파일과 사업별 메모를 먼저 갱신 | 단계 변경·공개자료 수·입찰/총회 공고 변화를 사업별 메모와 리스크 큐에 반영 |
| seoul_urban_alert | 서울도시공간포털 알림서비스에서 noticeCode를 받은 경우 | 28 | 자양번영로3나길 일대 가로주택정비사업 | official_notice | unverified | high_blocking_response_intake | data/review/high-blocking-source-response-intake.json | 알림 수신 내용은 검색 출발점이다. 원문 고시/공고를 열기 전에는 확정 근거로 쓰지 않음 | process-high-blocking-response-workflow dry-run에서 ready_to_append 또는 보류 사유 확인 |
| gangdong_district_notice | 강동구 고시공고에서 확장 관심권 최신 단계 후보를 발견한 경우 |  | 천호3구역 / 신동아1·2차 / 성내미주 | district_notice | unverified | expansion_zone_latest_check | analysis/expansion-gangdong-stage-watch-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json | 확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다. | 천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 같은 날짜 기준으로 다시 닫고, 원문 확보 시 official-update-intake/source verification로 승격 |
| jung_district_notice | 중구 고시공고에서 약수권 direct hit 또는 인접 대조군 변화를 발견한 경우 |  | 신당 제8구역 / 신당 제9구역 / 금호 제14-1 | district_notice | unverified | expansion_zone_latest_check | analysis/expansion-yaksu-ocr-recheck-board.md; data/review/official-update-intake.json; data/review/official-source-activation-intake.json | 확장 관심권 운영 출처다. 강동권은 최신 단계 공개 여부를 다시 닫고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로만 유지한다. | 약수권 direct hit 여부와 신당·금호 인접 대조군 변화를 같은 날짜 기준으로 다시 닫고, 원문 확보 시 official-update-intake/source verification로 승격 |
| molit_data_go_kr | 국토부 실거래 원자료 최신월을 받는 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | market_data | unverified | market_manual_or_api_intake | data/market/manual-import/download-intake.json 또는 data/market/manual-import/files/ | 시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용 | 원자료 파일을 보존하고 normalization audit 재생성 후 시장 보조 신호로만 사용 |
| r_one | R-ONE 월간 지표가 갱신된 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | market_data | unverified | market_manual_or_api_intake | data/market/manual-import/download-intake.json 또는 data/market/manual-import/files/ | 시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용 | 원자료 파일을 보존하고 normalization audit 재생성 후 시장 보조 신호로만 사용 |
| seoul_open_data | 서울 열린데이터광장 파일/API가 갱신된 경우 | 15 | 압구정한양7차아파트 재건축정비사업조합 | market_data | unverified | market_manual_or_api_intake | data/market/manual-import/download-intake.json 또는 data/market/manual-import/files/ | 시장·통계 데이터는 사업 단계 판정이 아니라 반응 보조 지표로만 사용 | 원자료 파일을 보존하고 normalization audit 재생성 후 시장 보조 신호로만 사용 |

## Intake JSON 예시

아래 예시는 실제 값이 아니라 입력 형식이다. `official_url`, `attachment_paths`, `local_text_paths`는 실제 공식 URL과 로컬 원문 경로로 교체한다.

### seoul_urban_notice

```json
{
  "update_id": "upd-YYYYMMDD-seoul_urban_notice",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "seoul_urban_notice",
  "trigger_type": "official_notice",
  "project_rank": "28",
  "project_name": "자양번영로3나길 일대 가로주택정비사업",
  "title": "관심구 정비계획/도시관리계획 고시가 새로 뜬 경우",
  "official_url": "https://...",
  "notice_no": "고시/공고번호 입력",
  "attachment_paths": "data/.../원문파일 또는 빈값",
  "local_text_paths": "data/.../extracted.txt",
  "evidence_status": "needs_text_extraction",
  "decision_status": "inbox",
  "observed_change": "정비구역 지정, 정비계획 변경, 지구단위계획 결정, 도시계획시설 결정, 열람공고",
  "notes": "원문 확인 전에는 확정값으로 승격하지 않음"
}
```

### district_notice

```json
{
  "update_id": "upd-YYYYMMDD-district_notice",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "district_notice",
  "trigger_type": "district_notice",
  "project_rank": "28",
  "project_name": "자양번영로3나길 일대 가로주택정비사업",
  "title": "자치구 조합설립인가·정비계획 공고 후보를 발견한 경우",
  "official_url": "https://...",
  "notice_no": "고시/공고번호 입력",
  "attachment_paths": "data/.../원문파일 또는 빈값",
  "local_text_paths": "data/.../extracted.txt",
  "evidence_status": "needs_text_extraction",
  "decision_status": "inbox",
  "observed_change": "조합설립인가, 추진위승인, 공람공고, 정정공고, 도시관리계획 열람",
  "notes": "원문 확인 전에는 확정값으로 승격하지 않음"
}
```

### seoul_sibo

```json
{
  "update_id": "upd-YYYYMMDD-seoul_sibo",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "seoul_sibo",
  "trigger_type": "official_notice",
  "project_rank": "28",
  "project_name": "자양번영로3나길 일대 가로주택정비사업",
  "title": "서울시보에서 고시번호와 PDF 원문을 찾은 경우",
  "official_url": "https://...",
  "notice_no": "고시/공고번호 입력",
  "attachment_paths": "data/.../원문파일 또는 빈값",
  "local_text_paths": "data/.../extracted.txt",
  "evidence_status": "needs_text_extraction",
  "decision_status": "inbox",
  "observed_change": "서울특별시고시, 자치구고시, 정정, 공고 원문 PDF",
  "notes": "원문 확인 전에는 확정값으로 승격하지 않음"
}
```

### seoul_traffic_news

```json
{
  "update_id": "upd-YYYYMMDD-seoul_traffic_news",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "seoul_traffic_news",
  "trigger_type": "transport_context",
  "project_rank": "15",
  "project_name": "압구정한양7차아파트 재건축정비사업조합",
  "title": "교통계획·환승·도로·보행 정책 업데이트를 발견한 경우",
  "official_url": "https://...",
  "attachment_paths": "data/.../원문파일 또는 빈값",
  "evidence_status": "context_only",
  "decision_status": "inbox",
  "observed_change": "도시철도망, 버스/환승, 도로·보행 정책, 교통통계",
  "notes": "원문 확인 전에는 확정값으로 승격하지 않음"
}
```

### seoul_citybuild_news

```json
{
  "update_id": "upd-YYYYMMDD-seoul_citybuild_news",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "seoul_citybuild_news",
  "trigger_type": "policy_context",
  "project_rank": "15",
  "project_name": "압구정한양7차아파트 재건축정비사업조합",
  "title": "서울시 도시계획·주택 보도자료나 업무계획이 나온 경우",
  "official_url": "https://...",
  "attachment_paths": "data/.../원문파일 또는 빈값",
  "evidence_status": "context_only",
  "decision_status": "inbox",
  "observed_change": "주요업무계획, 도시계획·부동산 소식, 국제교류복합지구, 한강변관리기본계획, 사전협상",
  "notes": "원문 확인 전에는 확정값으로 승격하지 않음"
}
```

## 운영 원칙

- `context_only`는 생활권 가설 참고 신호일 뿐 단계·수치 확정 근거가 아니다.
- `needs_text_extraction`은 원문 URL이나 첨부를 확보해도 본문 텍스트와 숫자를 대조하기 전까지 확정하지 않는다.
- 완료 병목 3건과 연결되는 업데이트는 일반 source decision보다 `high_blocking_source_response_intake.json`을 먼저 갱신한다.
- `gangdong_district_notice`, `jung_district_notice`는 확장 관심권 운영 루프다. direct hit 또는 원문 확보 전까지는 `expansion_zone_latest_check` 경로에 둔다.
- intake를 수정한 뒤에는 `node scripts/generate-official-update-intake-board.mjs`로 검증하고, 마지막에 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.
