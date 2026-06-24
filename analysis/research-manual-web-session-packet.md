# 리서치 수동 웹 세션 패킷

작성 기준: 2026-06-24 KST

이 문서는 지금 당장 브라우저에서 열어볼 것과 날짜가 도래한 뒤 다시 열 포털 점검을 한 장으로 묶는다. 핵심 사업 3건, 확장 관심권 2권역, 대표지번 fallback 클로저 완료 상태, 외부 회신 3건을 따로 찾지 않고 바로 세션을 시작하는 용도다.

## 세션 분기

- 오늘 바로 열 수 있는 수동 웹 루프: 5건
- 핵심 사업 즉시 확인: 3건
- 확장 관심권 즉시 확인: 2건
- presentSn 클로저 즉시 확인: 0건
- 날짜 대기 외부 회신: 3건
- 다음 외부 회신 점검일: 2026-06-29

## 먼저 열 파일

1. [research-now-action-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-now-action-board.md): 오늘 바로 할 일과 날짜 대기선을 먼저 분리
2. [focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md): 핵심 사업 직접 URL과 변화 판정 기준
3. [official-web-query-registry.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-web-query-registry.md): 포털별 검색어, 기록 필드, 판정 gate를 한 행으로 보는 레지스트리
4. [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md): 강동권 latest stage와 약수권 direct hit 루프
5. [representative-lot-fallback-api-probe.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-api-probe.md): fallback 6건의 API strong candidate/hold를 먼저 보는 보드
6. [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md): Edge에서 fallback 6건의 presentSn를 직접 확인하는 순서
7. [representative-lot-fallback-finding-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-finding-board.md): fallback 6건의 확인 결과를 intake로 남긴 뒤 승격/보류 상태를 보는 보드
8. [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md): 외부 회신 점검일에 그대로 쓰는 조회 URL과 helper
9. [current-research-operating-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/current-research-operating-guide.md): 현재 전체 운영 상태와 반영 순서

## 지금 바로 열 수 있는 수동 웹 루프

| 구분 | 대상 | 생활권/레인 | 현재 상태 | 첫 확인 | 먼저 열 파일 |
| --- | --- | --- | --- | --- | --- |
| 핵심 사업 | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 강남 / 비용/기반시설 확인 | 조합설립인가; 조합설립인가; 상급지 프리미엄보다 공공기여·기반시설·높이 조건이 더 중요; 분담금/사업비 공개항목과 정비계획 조건 연결 정리 필요 | 추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인 | analysis/focus-project-latest-check-guide.md |
| 핵심 사업 | 25. 한양연립 일대 가로주택정비사업 | 구의/광진 / 원문/고시 확인 | 착공 공개신호 / 사업시행계획변경인가 직접 원문; 사업시행인가; 구의·광진에서 실제 원문 기반 판단이 가능한 대표 케이스; 조합설립/추진위 단계 일부 공백, 사업 레이어 선행 단계 확인 필요 | 추진경과와 자치구 고시공고를 먼저 비교해 단계 선행 여부 확인 | analysis/focus-project-latest-check-guide.md |
| 핵심 사업 | 5. 장미1,2,3차아파트 주택재건축정비사업 조합 | 잠실/송파 / 비용/기반시설 확인 | 조합설립인가; 조합설립인가; 잠실 대단지 장기 잠재 대표. 비용·기반시설 해석이 핵심; direct 고시 recordCode 미연결, 비용·기반시설 공개항목 대조 필요 | 추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인 | analysis/focus-project-latest-check-guide.md |
| 확장 관심권 | 강동권 | 잠실/송파 / 최신 단계 재확인 | confirmed 비교 가능; D-7; 기준 2026-07-01 KST | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 | analysis/expansion-zone-latest-check-guide.md |
| 확장 관심권 | 약수동 주변 | 별도 도심근접형 대조군 / direct hit 탐색 | confirmed 비교 가능; D-7; 기준 2026-07-01 KST | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 | analysis/expansion-zone-latest-check-guide.md |

### 즉시 확인 1. 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합

- 구분: 핵심 사업
- 상태: 조합설립인가; 조합설립인가; 상급지 프리미엄보다 공공기여·기반시설·높이 조건이 더 중요; 분담금/사업비 공개항목과 정비계획 조건 연결 정리 필요
- 먼저 열 파일: [focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md)
- 공식 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=apgujeong3)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680900000675S91&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=680900000675S91&bsnsPk=11680-900000675)
- 이번 확인
  추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인
- 변화로 인정할 신호
  지하차도, 소방설계, 환경영향평가, 시공자 선정 조합입찰공고의 실제 추가; 압구정아파트지구 관련 고시, 지구단위계획 변경, 공공기여 조건 변경; 정보몽땅 공개자료에서 분담금, 사업비, 기반시설 관련 새 첨부 확인
- 반영 경로
  변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist
- 같이 열 산출물
- [official-refresh-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-refresh-summary.md)
- [cleanup-snapshot-diff.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/cleanup-snapshot-diff.md)
- [cleanup-board-review-queue.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/cleanup-board-review-queue.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- 결과 기록 helper
  필요 시 관련 intake/helper 사용

### 즉시 확인 2. 25. 한양연립 일대 가로주택정비사업

- 구분: 핵심 사업
- 상태: 착공 공개신호 / 사업시행계획변경인가 직접 원문; 사업시행인가; 구의·광진에서 실제 원문 기반 판단이 가능한 대표 케이스; 조합설립/추진위 단계 일부 공백, 사업 레이어 선행 단계 확인 필요
- 먼저 열 파일: [focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md)
- 공식 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=hanyanggaro)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001126x73&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=215900001126x73&bsnsPk=11215-900001126)
- 이번 확인
  추진경과와 자치구 고시공고를 먼저 비교해 단계 선행 여부 확인
- 변화로 인정할 신호
  광진구청 고시공고에서 착공, 준공, 사용승인 관련 새 공고 확인; 정비사업 정보몽땅 추진경과의 착공신고 2024-02-15 또는 입주자 모집 공고 2024-05-31 값 변경; 동서울터미널, 강변역 사전협상, 도시계획, 교통처리계획이 공식 원문으로 구체화됨
- 반영 경로
  변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist
- 같이 열 산출물
- [official-refresh-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-refresh-summary.md)
- [cleanup-snapshot-diff.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/cleanup-snapshot-diff.md)
- [cleanup-board-review-queue.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/cleanup-board-review-queue.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- 결과 기록 helper
  필요 시 관련 intake/helper 사용

### 즉시 확인 3. 5. 장미1,2,3차아파트 주택재건축정비사업 조합

- 구분: 핵심 사업
- 상태: 조합설립인가; 조합설립인가; 잠실 대단지 장기 잠재 대표. 비용·기반시설 해석이 핵심; direct 고시 recordCode 미연결, 비용·기반시설 공개항목 대조 필요
- 먼저 열 파일: [focus-project-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-latest-check-guide.md)
- 공식 URL
- [cleanup_main](https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=jmapt1)
- [cleanup_summary](https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000615u63&stepSeCode=102&div=sumry)
- [cleanup_progress](https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000615u63&bsnsPk=11710-900000615)
- 이번 확인
  추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인
- 변화로 인정할 신호
  추진경과 또는 item 200의 최신 변경인가 신청일, 인가일, 동의율 변경; 조합입찰공고에 도로설계, 지하안전, 우수박스 이설, 재해영향평가 공고 추가; 사업시행계획서(인가) 또는 관리처분계획서(인가) 메뉴에 실제 문서 추가
- 반영 경로
  변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist
- 같이 열 산출물
- [official-refresh-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-refresh-summary.md)
- [cleanup-snapshot-diff.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/cleanup-snapshot-diff.md)
- [cleanup-board-review-queue.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/cleanup-board-review-queue.md)
- [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)
- 결과 기록 helper
  필요 시 관련 intake/helper 사용

### 즉시 확인 4. 강동권

- 구분: 확장 관심권
- 상태: confirmed 비교 가능; D-7; 기준 2026-07-01 KST
- 먼저 열 파일: [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)
- 공식 URL
- [강동구](https://www.gangdong.go.kr/)
- [서울도시공간포털](https://urban.seoul.go.kr/view/new/main.html)
- [정비사업 정보몽땅](https://cleanup.seoul.go.kr/)
- 이번 확인
  정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인
- 변화로 인정할 신호
  서울도시공간포털 shortlist·원문 비교값·단계 추적 보드까지는 연결됐지만, 강동구 고시공고와 정보몽땅 최신 단계 재확인은 아직 수동 루프로 남아 있다.; 기반시설 비용분담과 세대 구성을 생활권 비교 보드에 옮기고 강동구 고시공고 최신 단계와 교차 확인; 사업 단계 최신성은 강동구 고시공고·정보몽땅으로 갱신하고, 면적/세대수는 장기 비교 기준값으로 보관
- 반영 경로
  official-update-intake -> expansion-gangdong-stage-watch-board -> expansion-zone-intake-seed-board -> regenerate-research-artifacts
- 같이 열 산출물
- [expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)
- [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)
- [expansion-official-latest-check-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-official-latest-check-audit.md)
- [expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md)
- 결과 기록 helper
  필요 시 관련 intake/helper 사용

### 즉시 확인 5. 약수동 주변

- 구분: 확장 관심권
- 상태: confirmed 비교 가능; D-7; 기준 2026-07-01 KST
- 먼저 열 파일: [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)
- 공식 URL
- [중구](https://www.junggu.seoul.kr/index.html)
- [서울도시공간포털](https://urban.seoul.go.kr/view/new/main.html)
- [정비사업 정보몽땅](https://cleanup.seoul.go.kr/)
- 이번 확인
  약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영
- 변화로 인정할 신호
  adjacent 3건의 원문 비교값과 이미지 재대조는 닫혔지만, 중구 고시공고와 약수권 direct hit 자동 루프는 아직 없다.; direct hit 신규 여부 확인; 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영
- 반영 경로
  official-update-intake -> expansion-yaksu-ocr-recheck-board -> expansion-zone-intake-seed-board -> regenerate-research-artifacts
- 같이 열 산출물
- [expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)
- [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)
- [expansion-official-latest-check-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-official-latest-check-audit.md)
- [expansion-yaksu-ocr-recheck-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-yaksu-ocr-recheck-board.md)
- 결과 기록 helper
  필요 시 관련 intake/helper 사용


## 날짜 도래 후 다시 열 포털 점검

| 대상 | 접수번호 | 다음 점검일 | 이번 확인 포인트 | 먼저 열 파일 |
| --- | --- | --- | --- | --- |
| 9. 잠실우성4차 주택재건축정비사업조합 | 626590 | 2026-06-29 | 새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인 | analysis/high-blocking-next-check-session-packet.md |
| 23. 광장동 삼성1차아파트 소규모재건축정비사업 | 16913396 | 2026-06-29 | open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인 | analysis/high-blocking-next-check-session-packet.md |
| 28. 자양번영로3나길 일대 가로주택정비사업 | 16913410 | 2026-06-29 | open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인 | analysis/high-blocking-next-check-session-packet.md |

### 대기 점검 1. 9. 잠실우성4차 주택재건축정비사업조합

- 상태: no_response; 다음 점검 2026-06-29
- 조회 URL
- [송파구 새올전자민원창구](https://songpa.eminwon.seoul.kr/emwp/gov/mogaha/ntis/web/caf/mwwd/action/CafMwWdInputAction.do)
- 이번 점검
  새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인
- 남은 공백
  관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문
- 회신 없을 때 반영
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh -> 필요 시 node scripts/record-high-blocking-followup-check.mjs --rank=9 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인' --write -> node scripts/process-high-blocking-response-workflow.mjs
- 회신 도착 시 helper
  node scripts/record-high-blocking-response.mjs --rank=9 --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='송파구 담당부서' --attachment-name='자료명' --evidence=https://... --response-note='회신 요약' --write
- 같이 열 산출물
- [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md)
- [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [high-blocking-response-followup-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-followup-cockpit.md)

### 대기 점검 2. 23. 광장동 삼성1차아파트 소규모재건축정비사업

- 상태: no_response; 다음 점검 2026-06-29
- 조회 URL
- [대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기](https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do)
- 이번 점검
  open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인
- 남은 공백
  조합설립인가 고시번호, 고시일, 원문/첨부 URL
- 회신 없을 때 반영
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh -> 필요 시 node scripts/record-high-blocking-followup-check.mjs --rank=23 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인' --write -> node scripts/process-high-blocking-response-workflow.mjs
- 회신 도착 시 helper
  node scripts/record-high-blocking-response.mjs --rank=23 --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write
- 같이 열 산출물
- [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md)
- [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [high-blocking-response-followup-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-followup-cockpit.md)

### 대기 점검 3. 28. 자양번영로3나길 일대 가로주택정비사업

- 상태: no_response; 다음 점검 2026-06-29
- 조회 URL
- [대한민국정보공개포털(open.go.kr) via 광진구 정보공개청구 바로가기](https://www.open.go.kr/rqestMlrd/rqestDtls/reqstDocList.do)
- 이번 점검
  open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인
- 남은 공백
  조합설립인가 고시번호, 고시일, 원문/첨부 URL
- 회신 없을 때 반영
  node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh -> 필요 시 node scripts/record-high-blocking-followup-check.mjs --rank=28 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인' --write -> node scripts/process-high-blocking-response-workflow.mjs
- 회신 도착 시 helper
  node scripts/record-high-blocking-response.mjs --rank=28 --status=confirmed|partial|unavailable|info_disclosure_required --received-at=YYYY-MM-DD --responder='광진구 담당부서' --notice-no='고시번호' --notice-date=YYYY-MM-DD --official-url=https://... --evidence=https://... --response-note='회신 요약' --write
- 같이 열 산출물
- [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md)
- [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [high-blocking-response-followup-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-followup-cockpit.md)


## 운영 원칙

- 공식 원문, 고시번호, 고시일, 원문 URL, 첨부명, 기준일 없는 값은 확정값으로 올리지 않는다.
- 강동권은 값 confirmed와 최신 단계 판정을 분리하고, 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로 유지한다.
- 잠실우성4차, 광장동 삼성1차, 자양번영로3나길은 2026-06-29 전에는 새 회신이 없으면 추가 제출보다 상태 추적이 우선이다.
- 수동 웹 세션 후에는 관련 intake나 보드를 먼저 갱신하고 마지막에 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.

