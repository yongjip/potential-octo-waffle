# 현재 리서치 운영 가이드

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실/송파·구의/광진 핵심 생활권과 강동권·약수동 주변 확장 관심권을 지금 시점에서 어떻게 같이 굴릴지 정리한 현재형 운영 문서다. 투자 추천이 아니라, 공식 원문이 어디까지 정리됐는지와 다음 판단을 어떤 순서로 할지 고정한다.

## 지금 상태

| 항목 | 현재 상태 |
| --- | --- |
| goal 완료 판정 | not_complete |
| research status dashboard P0 / P1 | 0 / 0 |
| 핵심 검토 항목 | 110 |
| 핵심 사업 외부 회신 대기 | 1 |
| 확장 관심권 이번 주 점검 | 2 |
| 강동 latest_stage_gap | 0 |
| 약수 confirmed baseline | 3 |
| 확장 direct hit 확인 | 1 |
| 확장 direct hit 미확인 | 1 |
| popup 직접 접근 차단 | 2 |
| 대표지번 fallback only | 0 |
| fallback presentSn 클로저 | 0 |
| fallback finding 입력 | 6 |
| fallback 승격 준비 | 0 |
| fallback applied 가능 | 0 |
| fallback applied 검증완료 | 0 |
| completion cockpit P0 / P1 | 2 / 3 |
| 외부 회신 filed waiting | 3 |
| 7일 내 다음 점검 | 3 |
| 외부 회신 다음 점검일 | 2026-06-29 |

현재 기준으로 로컬 비교 체계는 운영 가능하다. 핵심 3생활권은 공식 원문·공개항목·OCR 판독·자치구 고시공고를 묶어 읽을 수 있고, 확장 관심권도 강동권은 `stage signal verified 후속 확인`, 약수권은 `confirmed baseline` 관점으로 분리 운영된다.

확장 관심권의 현재형 웹 기준도 분명해졌다. 2026-06-24 KST 확인 기준으로 서울도시공간포털 정비사업구역계 진입 페이지 `PMNU4030600001` 검색에서 강동권 `천호3구역`은 `총 1건`, 약수권 `약수역`은 `총 0건`이었다. 따라서 강동권은 direct hit을 현재형 신호로 유지하고, 약수권은 adjacent 기준선을 유지한다. `mapForm.pop?noticeCode=...`는 식별자 참조만 허용하고 단독 공개 진입 URL로는 쓰지 않는다.

다만 goal 완료는 아직 아니다. 남은 P0는 외부 회신 3건과 그에 딸린 high-blocking 16개 필드다. 따라서 지금은 `핵심 생활권 비교`, `확장 관심권 주간 재확인`, `외부 회신 점검`을 분리해서 굴려야 한다.

같이 봐야 하는 별도 묶음도 있다. `representative_lot_fallback_only` 0건은 직접 고시 기준 단계는 잠겼지만 current business UQ120 식별자가 안 잠긴 케이스다. 이 묶음은 [representative-lot-fallback-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-workbook.md)에서 따로 추적한다.

직접 확인에 들어갈 때는 [representative-lot-fallback-identifier-closure-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-identifier-closure-workbook.md)를 같이 연다. 여기에는 각 사업의 대표지번, PNU, 1순위 UQ120 후보명, 대체 후보명, `same-stage` 여부와 `presentSn` 채택 조건이 정리돼 있다.

브라우저 세션은 [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md) 기준으로 바로 시작한다. 이 패킷은 Edge에서 열 URL, 프로브 키, 채택/제외 조건, 갱신 대상 파일까지 한 번에 묶는다.

확인 결과는 [representative-lot-fallback-finding-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-finding-board.md)에서 따로 관리한다. 이 보드는 `presentSn` 확인값을 intake로 남긴 뒤 `ready_to_promote`, `hold_by_stage_gap`, `retry_needed` 같은 상태로 나눠 보여준다.

`pending_apply`를 실제로 닫을 때는 [representative-lot-fallback-apply-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-apply-audit.md)를 바로 본다. 기본 경로는 `record-representative-lot-fallback-finding.mjs --prefill-from-api --write --refresh --auto-mark-applied`로 finding을 남기고 자동 반영까지 한 번에 시도하는 것이다. 여기서 auto-mark가 닫히지 않은 confirmed finding만 `ready_to_mark_applied`로 남기고, 그때만 `mark-representative-lot-fallback-finding-applied.mjs`로 `applied`로 승격한다.

## 지금 기준 레인 분리

| 레인 | 지금 상태 | 대상 | 현재 요약 | 오늘 할 일 | 먼저 열 파일 |
| --- | --- | --- | --- | --- | --- |
| 외부 회신 | 지금은 대기 유지 | 23. 광장동 삼성1차아파트 소규모재건축정비사업; 28. 자양번영로3나길 일대 가로주택정비사업; 9. 잠실우성4차 주택재건축정비사업조합 | no_response 3건 / 다음 점검 2026-06-29 / D-5 | 새 메일이나 알림이 없으면 오늘은 추가 제출 없이 대기하고, 2026-06-29에 next-check session packet으로 3건 상태를 재확인 | analysis/high-blocking-next-check-session-packet.md |
| 확장 관심권 | 지금 바로 가능 | 강동권 | confirmed 비교 가능; D-7; 기준 2026-07-01 KST | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 | analysis/expansion-zone-weekly-monitoring-cockpit.md |
| 핵심 생활권 비교 | 지금 바로 가능 | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 강남; 비용/기반시설 확인; 조합설립인가 | 추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인 | analysis/focus-project-weekly-monitoring-cockpit.md |

## 먼저 열 파일

1. [personal-research-home.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/personal-research-home.md): 전체 진입점과 오늘 열 항목
2. [research-now-action-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-now-action-board.md): 오늘 바로 할 일과 날짜 대기선을 한 장으로 분리한 실행 보드
3. [research-manual-web-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-manual-web-session-packet.md): 핵심·확장·외부 회신 수동 웹 확인 진입점을 한 장으로 묶은 세션 패킷
4. [official-web-query-registry.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-web-query-registry.md): 포털별 검색어, 기록 필드, 판정 gate를 한 행으로 묶은 검색 레지스트리
5. [current-research-snapshot.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/current-research-snapshot.md): 핵심 3생활권·확장 2권역·핵심 4개 사업 현재 판단
6. [focus-project-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-weekly-monitoring-cockpit.md): 핵심 4개 사업의 이번 주 우선순위와 외부 회신 대기
7. [expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md): 강동권 단계 신호 확인과 약수권 direct hit 루프
8. [expansion-official-latest-check-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-official-latest-check-audit.md): 정비사업구역계 진입 페이지 검색 결과와 popup 직접 접근 차단 여부를 먼저 확인
9. [representative-lot-fallback-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-workbook.md): 대표지번 fallback만 남은 6건의 direct notice 단계와 current business 미확정 사유를 한 장으로 보는 워크북
10. [representative-lot-fallback-identifier-closure-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-identifier-closure-workbook.md): 대표지번 fallback 6건의 PNU, UQ120 후보명, presentSn 채택 조건을 바로 보는 클로저 워크북
11. [representative-lot-fallback-command-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-command-packet.md): today 기준 fallback 6건 copy-ready 기록 명령 패킷
12. [representative-lot-fallback-api-probe.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-api-probe.md): fallback 6건에 대해 API 기준 strong candidate와 hold를 먼저 보는 보드
13. [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md): Edge 브라우저에서 fallback 6건의 presentSn를 직접 확인할 때 쓰는 세션 패킷
14. [representative-lot-fallback-finding-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-finding-board.md): Edge 확인 결과를 intake로 남기고 승격/보류 상태를 보는 보드
15. [representative-lot-fallback-apply-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-apply-audit.md): confirmed finding이 matrix/project-note에 반영됐는지 보고 applied로 닫는 감사표
16. [life-area-market-reaction-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-market-reaction-brief.md): 핵심 3생활권 시장 신호와 확장권 baseline 커버를 같은 규칙으로 읽는 generated 브리프
16. [expansion-market-scope-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-scope-workbook.md): 강동권·약수권 법정동 시장 scope를 core chain과 분리해 운영하는 워크북
17. [expansion-market-normalized-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-normalized-summary.md): 확장 6개 scope에 latest-window 정규화 거래가 모두 들어왔는지 보는 행·source 요약
18. [expansion-market-signal-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-signal-summary.md): 강동권·약수권 2권역과 6개 법정동의 매매·전월세 중위값과 최근성을 읽는 시그널 요약
19. [life-area-market-baseline-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-market-baseline-board.md): 핵심 3생활권 full-chain과 확장 2권역 latest-window baseline을 같은 표에서 읽는 시장 기준 비교 보드
20. [expansion-market-first-download-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-first-download-packet.md): 확장권 시장 90개 raw task를 최신 window 우선 패킷으로 압축한 실행표
21. [expansion-market-download-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-session-packet.md): 확장권 latest-window 30개 수집을 바로 시작하는 세션 패킷
22. [expansion-market-quickstart-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-quickstart-packet.md): 천호동·길동 10개 task만 먼저 닫는 first-session quickstart 패킷
23. [expansion-market-download-status.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-market-download-status.md): 확장권 latest-window 30개 파일 존재와 intake 기록 상태
24. [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md): 핵심 생활권과 확장 관심권을 같은 판에서 비교
25. [high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md): 외부 회신 3건의 접수번호·다음 점검일
26. [high-blocking-response-followup-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-followup-cockpit.md): 회신 도착 시 helper·dry-run·write 순서를 그대로 따라가는 실행판
27. [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md): 다음 점검일에 조회 URL과 no response/response helper를 바로 쓰는 세션 패킷
28. [high-blocking-next-check-command-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-command-audit.md): 세션 패킷 helper의 checked-at/next-check-date가 실제로 앞으로 가는지 감사
29. [high-blocking-followup-history.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-followup-history.md): 실제 점검일에 무엇을 확인했고 어떤 상태 변화가 있었는지 누적 이력 확인
30. [research-completion-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-completion-cockpit.md): goal 완료를 막는 P0/P1 병목
31. [research-session-playbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/research-session-playbook.md): 15분/주간/현장/확장 세션별 실행 순서

## 권역별 현재 해석

| 구분 | 대상 | 현재 상태 | 핵심 질문/판정 | 다음 액션 | 답사/참조 축 |
| --- | --- | --- | --- | --- | --- |
| 핵심 생활권 | 강남 | 조건 해석 우선 | 상급 입지 프리미엄이 비용/공공기여 리스크를 이길 만큼 확실한가 | 압구정3 비용·기반시설 공개항목과 현장 체감 연결 | 압구정 한강변 특별계획구역 |
| 핵심 생활권 | 잠실/송파 | 장기 잠재 강함, 리스크 분리 필요 | 잠실 핵심축의 공공개발 기대가 비용·이주·혼잡을 보상하는가 | 장미1,2,3차 현장 메모와 잠실우성4차 외부 회신 반영 | 잠실역-잠실나루 한강축 |
| 핵심 생활권 | 구의/광진 | 원문·단계 확정 우선 | 2·7호선과 한강/터미널 변화 가능성이 사업성 편차를 보완하는가 | 한양연립 현장 메모와 삼성1차/자양번영로3나길 회신 대기 관리 | 강변-광나루 동서울터미널축 |
| 확장 관심권 | 강동권 | 잠실/송파 동측 연장축 비교 | 잠실 동측 연장축에서 중간 체급 재건축이 대안축으로 성립하는가 | 천호3구역, 신동아1·2차, 성내미주의 최신 공개 단계를 강동구 고시공고·정보몽땅으로 다시 닫는다. | 천호역-강동역-길동역 축 |
| 확장 관심권 | 약수동 주변 | 도심근접형 대조군 유지 | 도심 경사형 재개발이 강남·잠실과 다른 장기 대안축으로 성립하는가 | 신당8·신당9·금호14-1의 confirmed snapshot만 유지하고, 약수 direct hit가 생기면 adjacent에서 direct 후보로 승격한다. | 약수역-버티고개-신금호 축 |
| 확장 실행상태 | 강동권 | confirmed 비교 가능 |  | 기반시설 비용분담과 세대 구성을 생활권 비교 보드에 옮기고 강동구 고시공고 최신 단계와 교차 확인; 사업 단계 최신성은 강동구 고시공고·정보몽땅으로 갱신하고, 면적/세대수는 장기 비교 기준값으로 보관 | 잠실/송파 |
| 확장 실행상태 | 약수동 주변 | confirmed 비교 가능 | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 | 별도 도심근접형 대조군 |

## 이번 주 실행 순서

| 레인 | 대상 | 현재 상태 | 첫 확인 | 반영 경로 |
| --- | --- | --- | --- | --- |
| 핵심 사업 | 9. 잠실우성4차 주택재건축정비사업조합 | filed_waiting_response; waiting; receipt 626590 | 접수번호 626590 유지, 회신 도착 여부 확인 후 intake 입력 | 회신 없음: high-blocking-filing-tracker -> 회신 도착: response-intake -> decision draft -> 전체 재생성 |
| 핵심 사업 | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | none | 추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인 | 변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist |
| 핵심 사업 | 25. 한양연립 일대 가로주택정비사업 | none | 추진경과와 자치구 고시공고를 먼저 비교해 단계 선행 여부 확인 | 변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist |
| 핵심 사업 | 5. 장미1,2,3차아파트 주택재건축정비사업 조합 | none | 추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인 | 변화 확인: project-notes -> project-comparison-matrix -> reassessment-watchlist |
| 확장 관심권 | 강동권 | confirmed 비교 가능 / D-7 | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 | official-update-intake -> expansion-gangdong-stage-watch-board -> expansion-zone-intake-seed-board -> regenerate-research-artifacts |
| 확장 관심권 | 약수동 주변 | confirmed 비교 가능 / D-7 | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 | official-update-intake -> expansion-yaksu-ocr-recheck-board -> expansion-zone-intake-seed-board -> regenerate-research-artifacts |

## 외부 회신 대기

| 순위 | 사업 | 접수번호 | 다음 점검일 | 다음 점검 | 남은 공백 |
| --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 16913396 | 2026-06-29 | open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 16913410 | 2026-06-29 | open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인 | 조합설립인가 고시번호, 고시일, 원문/첨부 URL |
| 9 | 잠실우성4차 주택재건축정비사업조합 | 626590 | 2026-06-29 | 새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인 | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 |

## 운영 원칙

- 공식 원문, 고시번호, 고시일, 원문 URL, 첨부명, 기준일이 없으면 확정값으로 승격하지 않는다.
- 강동권은 값 confirmed와 최신 단계 판정을 분리한다. 약수권은 direct hit가 생기기 전까지 adjacent 대조군으로 유지한다.
- 시장 데이터와 정책 보도자료는 context다. 개별 사업 단계·권리관계·공사비 확정 근거로 쓰지 않는다.
- 새 회신이나 원문이 들어오면 intake를 먼저 남기고, 관련 보드 수정 후 `node scripts/regenerate-research-artifacts.mjs`로 전체 산출물을 다시 맞춘다.

