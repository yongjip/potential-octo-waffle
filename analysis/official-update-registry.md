# 공식 업데이트 출처 레지스트리

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실·구의 생활권 재개발·재건축 리서치에서 “무엇이 업데이트되면 어디서 먼저 확인할지”를 고정한 작업표다. 자동화된 스크립트가 있는 출처와 아직 수동 확인이 필요한 출처를 분리한다.
핵심 생활권 외에 강동권과 약수동 주변은 확장 관심권으로 따로 표기해, 아직 자동화되지 않은 자치구 채널도 운영 레지스트리에 포함한다.

## 현재 커버리지

| 항목 | 값 |
| --- | --- |
| 우선검토 후보 | 30 |
| 확장 관심권 | 2 |
| 확장 관심권 자치구 채널 | 2 |
| 서울도시공간포털 고시/지도 매칭 | 19 |
| 사업구역 레이어 보강 | 17 |
| 서울시보 본고시 원문 확보 | 1 |
| 광진구청 고시공고 텍스트 확보 | 4 |
| 정보몽땅 단계 공개항목 보강 | 6 |
| 공식 근거 C-D-E 병목 | 4 |
| 시장 데이터 API 키 대기 | 30 |

## 출처 등급

| 등급 | 출처 수 |
| --- | --- |
| primary | 4 |
| primary_backstop | 4 |
| context | 2 |
| context_backstop | 1 |
| data | 3 |

## 업데이트 레지스트리

| ID | 등급 | 출처 | 업데이트 신호 | 확인 주기 | 자동화 상태 | 스크립트 | 다음 보강 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| seoul_urban_notice | primary | 서울도시공간포털 결정고시/열람공고 | 정비구역 지정, 정비계획 변경, 지구단위계획 결정, 도시계획시설 결정, 열람공고 | weekly; 관심구 고시 알림은 daily 후보 | implemented_for_30_candidates | scripts/fetch-urban-map-details.mjs; scripts/fetch-urban-notice-details.mjs; scripts/extract_urban_notice_text.py; scripts/generate-source-text-extraction-audit.mjs; scripts/generate-hwp-conversion-audit.mjs; scripts/generate-source-value-verification-queue.mjs; scripts/generate-core-value-confirmation-ledger.mjs; scripts/generate-ocr-source-verification-packet.mjs; scripts/generate-ocr-source-review-triage.mjs; scripts/generate-ocr-image-review-decisions.mjs; scripts/generate-source-value-update-candidates.mjs; scripts/generate-management-stage-value-resolution.mjs | analysis/source-value-update-candidates.md와 analysis/core-value-confirmation-ledger.md의 ocr/source_link/value_missing 행부터 confirmed/pending/conflict 상태로 승격 |
| seoul_urban_alert | primary | 서울도시공간포털 알림서비스 | 도시계획 결정 및 열람공고 알림 | push; 수동 신청 후 상시 | manual_subscription |  | 실제 알림 수신 후 noticeCode 또는 고시번호를 레지스트리에 수동 기록 |
| cleanup_project_status | primary | 정비사업 정보몽땅 사업장검색/자료공개 | 진행단계 변경, 공개자료 수 변화, 사업개요 수치 변화, 사업시행/관리처분 공개항목 | weekly | snapshot_diff_implemented_for_focus_districts | scripts/fetch-cleanup-projects.mjs; scripts/generate-cleanup-snapshot-diff.mjs; scripts/generate-official-refresh-summary.mjs; scripts/fetch-project-summaries.mjs; scripts/fetch-management-stage-doc-links.mjs; scripts/fetch-gwangjin-stage-public-docs.mjs; scripts/generate-management-stage-value-resolution.mjs | 주 1회 재수집 후 analysis/official-refresh-summary.md와 analysis/cleanup-snapshot-diff.md에서 단계·공개자료 수 변화 확인 |
| cleanup_notice | primary | 정비사업 정보몽땅 고시/공고 | 고시/공고, 조합입찰공고, 공지사항 | weekly; 관심 사업장 daily 후보 | latest_board_items_implemented_for_30_candidates | scripts/fetch-cafe-menu-links.mjs; scripts/fetch-cleanup-board-latest.mjs; scripts/generate-cleanup-board-review-queue.mjs; scripts/generate-project-risk-signal-summary.mjs | analysis/project-risk-signal-summary.md의 very_high/high 사업장을 사업별 메모와 현장 확인 큐에 반영 |
| seoul_sibo | primary_backstop | 서울시보 | 서울특별시고시, 자치구고시, 정정, 공고 원문 PDF | weekly Thursday; 공휴일 다음날 가능 | implemented_for_geukdong_backfill | scripts/extract_seoul_sibo_text.py; scripts/ocr-seoul-sibo-page-range.mjs; scripts/generate-seoul-sibo-original-notice-fact-check.mjs | 서울시보 최신 권호 목차에서 강남/송파/광진 키워드 자동 검색 |
| district_notice | primary_backstop | 자치구 고시공고 | 조합설립인가, 추진위승인, 공람공고, 정정공고, 도시관리계획 열람 | weekly; 병목 사업은 ad hoc | implemented_for_gwangjin_text_and_gangnam_songpa_probe | scripts/fetch-gwangjin-gu-notice-candidates.mjs; scripts/probe-gangnam-songpa-notices.mjs; scripts/extract_gwangjin_gu_notice_text.py; scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs; scripts/generate-source-text-extraction-audit.mjs; scripts/generate-hwp-conversion-audit.mjs; scripts/generate-source-value-verification-queue.mjs; scripts/generate-core-value-confirmation-ledger.mjs; scripts/generate-ocr-source-verification-packet.mjs; scripts/generate-ocr-source-review-triage.mjs; scripts/generate-ocr-image-review-decisions.mjs; scripts/generate-source-value-update-candidates.mjs | 강남구/송파구 고신뢰 후보를 텍스트 추출·수치 대조 체인에 연결하고, 송파구 제목 검색 누락 사업은 내용 검색으로 보강 |
| gangdong_district_notice | primary_backstop | 강동구 고시공고 | 재개발·재건축 조합설립인가, 추진위승인, 정비계획 열람공고, 지구단위계획·도시관리계획 공고 | weekly; 강동권 최신 단계 재확인 루프 | manual_expansion_latest_check |  | 천호3구역·신동아1·2차·성내미주의 최신 단계 공개 여부를 강동구 고시공고와 정보몽땅 기준으로 같은 날짜에 다시 닫는다. |
| jung_district_notice | primary_backstop | 중구 고시공고 | 재개발·재건축 조합설립인가, 정비계획 열람공고, 경관·보존 관련 도시관리계획 공고 | weekly; 약수권 direct hit 탐색 루프 | manual_expansion_latest_check |  | 약수역 direct hit가 새로 생겼는지 중구 고시공고와 정보몽땅에서 확인하고, 없으면 신당8·신당9 기준선을 유지한다. |
| seoul_citybuild_news | context | 서울시 주택·도시계획 분야 | 주요업무계획, 도시계획·부동산 소식, 국제교류복합지구, 한강변관리기본계획, 사전협상 | weekly | manual |  | 잠실 MICE/국제교류복합지구, 한강변 정책, 역세권 활성화 페이지를 별도 컨텍스트 소스로 분리 |
| seoul_traffic_news | context | 서울시 교통 분야 | 도시철도망, 버스/환승, 도로·보행 정책, 교통통계 | monthly; 대형 교통계획 발표 시 ad hoc | manual_context | scripts/generate-transport-location-context.mjs | 광나루·강변·잠실·대치 생활권별 교통계획 원문 링크를 추가 |
| opengov | context_backstop | 서울 정보소통광장 | 심의 전후 결재문서, 위원회 회의정보, 사업 백서, 건설사업정보 | monthly; 심의 이슈 발생 시 ad hoc | manual |  | 광장극동·워커힐·잠실MICE·압구정 관련 문서 검색 키워드 목록 작성 |
| seoul_open_data | data | 서울 열린데이터광장 | 새 데이터, 통계소식, 공지사항, API/파일 갱신 | monthly | plan_ready_api_key_needed | scripts/generate-market-data-matrix.mjs; scripts/fetch-market-raw-data.mjs | 서울 실거래/생활이동/생활인구 데이터셋 ID 확정 후 API 키 연결 |
| molit_data_go_kr | data | 국토교통부 실거래/공공데이터포털 | 월별 실거래, 정정·해제거래, 건축물대장/공시지가 갱신 | monthly; 최신월은 재수집 | api_key_needed | scripts/fetch-market-raw-data.mjs | DATA_GO_KR_SERVICE_KEY 연결 후 2024-01~현재 강남/송파/광진 실거래 수집 |
| r_one | data | 한국부동산원 R-ONE | 월별 가격지수/거래현황 공표 | monthly | manual_or_api_pending |  | 서울·동남권·광진구/송파구/강남구 비교 지표 코드 확정 |

## 운영 순서

1. 고시/공고 신호는 서울도시공간포털, 정비사업 정보몽땅, 자치구 고시공고, 서울시보 순서로 확인한다.
2. 단계 변경 신호는 정비사업 정보몽땅 사업장검색과 사업장별 공개자료 수 diff로 먼저 잡는다.
3. 보도자료와 정책 페이지는 확정 신호가 아니므로 고시번호, 고시일, 결정조서, 결정도 원문으로 승격하기 전까지는 context로만 둔다.
4. 실거래와 가격지수는 시장 반응 확인용이다. 사업 단계 판단에는 쓰지 않는다.
5. 강동권·약수동 주변은 먼저 확장 관심권 브리프와 activation intake에 남기고, 후보 사업장과 원문 URL이 생기면 기존 비교 체계로 편입한다.
6. 새 신호가 발견되면 사업별 메모, 비교 매트릭스, 공식 근거 감사표 순서로 반영한다.

## 다음 자동화 후보

- 서울도시공간포털 결정고시 최신분 검색을 후보 30개 밖의 신규 사업까지 확장한다.
- 정비사업 정보몽땅 스냅샷 diff 결과에서 공개자료 수가 증가한 사업장의 새 문서 제목·일자를 수집한다.
- 서울시보 최신 권호 목차에서 강남구, 송파구, 광진구, 압구정, 잠실, 광장, 구의, 자양 키워드를 자동 검색한다.
- 강남구·송파구 고시공고 프로브의 고신뢰 첨부를 텍스트 추출·수치 대조 체인에 연결한다.
