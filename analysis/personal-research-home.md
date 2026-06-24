# 개인 리서치 홈

작성 기준: 2026-06-24 KST

이 문서는 강남·잠실/송파·구의/광진 재개발·재건축 리서치를 시작할 때 가장 먼저 여는 홈 화면이다. 투자 추천이 아니라, 공식 원문·현장 답사·시장 신호·업데이트 감시를 어떤 순서로 볼지 정리한다.

## 현재 판정

| 항목 | 값 |
| --- | ---: |
| goal 완료 판정 | not_complete |
| 생활권 | 3 |
| 확장 관심권 | 2 |
| 확장 후보 seed | 6 |
| 확장 shortlist | 10 |
| 확장 원문 fetch 대기 | 7 |
| 확장 원문 detail 확보 | 7 |
| 확장 이번 주 점검 | 2 |
| 강동 latest_stage_gap | 0 |
| 확장 direct hit 확인 | 1 |
| 확장 direct hit 미확인 | 1 |
| popup 직접 접근 차단 | 2 |
| 대표지번 fallback only | 0 |
| fallback 미확인 | 0 |
| fallback 승격 대기 | 0 |
| 통합 비교 spine | 15 |
| 오늘 열 항목 | 9 |
| P0 완료 병목 | 2 |
| 정보공개/공식 민원 접수 준비 | 0 |
| 외부 회신 대기 | 3 |
| 외부 회신 다음 점검일 | 2026-06-29 |
| 우선 답사 루트 | 6 |
| 같은 날 비교 준비 | 0 |
| 기록된 비교 메모 | 0 |

현재 운영 판단은 단순하다. 외부 회신 3건은 이미 접수돼 있으므로 2026-06-29 전에는 새 응답이 오지 않는 한 추가 제출보다 대기 관리가 우선이다. 대신 바로 움직일 수 있는 일은 확장 관심권 최신 단계 재확인, 핵심 생활권 비교, 현장 답사 메모 보강이다. 브라우저를 열고 바로 움직일 때는 `analysis/research-manual-web-session-packet.md`, `analysis/representative-lot-fallback-edge-session-packet.md`, `analysis/representative-lot-fallback-finding-board.md`, `analysis/official-web-query-registry.md`를 같이 보면 된다. 확장권 시장 범위를 분리 운영하려면 `analysis/expansion-market-scope-workbook.md`, 정규화 커버 상태를 보려면 `analysis/expansion-market-normalized-summary.md`, 실제 가격·전월세 시그널을 읽으려면 `analysis/expansion-market-signal-summary.md`, 핵심/확장 5축을 한 표로 비교하려면 `analysis/life-area-market-baseline-board.md`, 실제 수집 순서를 보려면 `analysis/expansion-market-first-download-packet.md`, 첫 세션 10개만 바로 닫으려면 `analysis/expansion-market-quickstart-packet.md`, 세션 단위로 전체 latest-window를 받으려면 `analysis/expansion-market-download-session-packet.md`를 먼저 연다.

## 먼저 열 파일

1. `analysis/current-research-operating-guide.md`: 지금 시점 기준 운영 상태, 시작 순서, 생활권별 해석, 외부 회신 대기 항목
2. `analysis/research-now-action-board.md`: 오늘 바로 할 일, 수동 웹 확인, 날짜 대기선을 분리한 한 장짜리 실행 보드
3. `analysis/representative-lot-fallback-edge-session-packet.md`: fallback 6건의 recordCode popup -> 대표지번/PNU -> UQ120 후보 확인 순서를 바로 여는 세션 패킷
4. `analysis/representative-lot-fallback-finding-board.md`: fallback 6건의 확인 결과를 승격/보류 상태로 보는 보드
5. `analysis/life-area-core-project-one-page.md`: 장미1,2,3차·압구정3·잠실우성4차·한양연립을 한 장으로 비교
6. `analysis/current-research-snapshot.md`: 핵심 3생활권, 확장 2권역, 핵심 사업 4개의 현재 판단을 한 번에 보는 스냅샷
5. `analysis/core-expansion-research-spine.md`: 핵심 생활권 anchor와 확장 관심권 7건을 한 판에서 비교하는 spine
6. `analysis/life-area-extended-comparison-board.md`: 핵심 3생활권과 확장 2권역을 같은 문장 구조로 비교하는 상위 보드
7. `analysis/life-area-market-reaction-brief.md`: 핵심 3생활권 시장 신호와 확장권 baseline 커버를 같은 규칙으로 읽는 generated 브리프
8. `analysis/expansion-zone-weekly-monitoring-cockpit.md`: 강동권 단계 신호 확인과 약수권 direct hit 루프를 한 장으로 보는 확장 주간 실행판
9. `analysis/expansion-official-latest-check-audit.md`: 서울도시공간포털 정비사업구역계 진입 페이지 검색 결과와 popup 직접 접근 차단 여부를 먼저 확인하는 감사표
10. `analysis/expansion-zone-latest-check-guide.md`: 강동권은 단계 공백, 약수권은 confirmed 기준값 유지 관점에서 보는 실전 최신 확인 가이드
11. `analysis/expansion-zone-monitoring-checklist.md`: 강동권/약수권 주간 최신 점검을 그대로 따라가는 실행 체크리스트
12. `analysis/expansion-zone-intake-seed-board.md`: 강동권 새 row 생성 seed와 약수권 기존 row 재사용 기준을 바로 복붙하는 intake 출발 보드
13. `analysis/expansion-market-scope-workbook.md`: 강동권·약수동 주변의 시장 법정동 scope, source/window 구조, 분리 운영 원칙
14. `analysis/expansion-market-normalized-summary.md`: 확장 6개 scope에 latest-window 정규화 거래가 모두 들어왔는지 보는 행·source 요약
15. `analysis/expansion-market-signal-summary.md`: 강동권·약수권 2권역과 6개 법정동의 매매·전월세 중위값과 최근성을 읽는 시그널 요약
16. `analysis/life-area-market-baseline-board.md`: 핵심 3생활권 full-chain과 확장 2권역 latest-window baseline을 같은 표에서 읽는 시장 기준 비교 보드
17. `analysis/expansion-market-first-download-packet.md`: 확장권 시장 90개 raw task를 최신 window 우선 묶음으로 압축한 실행 패킷
18. `analysis/expansion-market-quickstart-packet.md`: 천호동·길동 10개 task부터 바로 닫는 first-session 패킷
19. `analysis/expansion-market-download-session-packet.md`: 확장권 latest-window 30개를 세션 단위로 바로 처리하는 다운로드 패킷
20. `analysis/expansion-market-download-status.md`: 확장권 latest-window 30개 파일 존재와 intake 기록 상태
21. `data/market/manual-import/expansion-download-intake.json`: 확장권 latest-window 30개 task의 copy-ready intake 템플릿
22. `analysis/expansion-interest-zone-brief.md`: 강동권·약수동 주변의 공식 채널, 비교축, 편입 조건
23. `analysis/expansion-interest-zone-candidate-brief.md`: 강동권·약수동 주변 검색 seed, 공식 채널, 승격 gate
24. `analysis/expansion-interest-zone-shortlist.md`: 공식 카드에서 사업명·고시번호·고시일이 확인된 확장 관심권 shortlist
25. `analysis/expansion-urban-notice-collection-queue.md`: 확장 shortlist를 서울도시공간포털 원문 수집기로 바로 태우는 실행 큐
26. `analysis/expansion-urban-notice-review-board.md`: 강동권 4건과 약수권 3건을 모두 confirmed snapshot 기준으로 묶은 원문 리뷰 보드
27. `analysis/expansion-yaksu-ocr-recheck-board.md`: 약수권 3건의 OCR 잠정값을 원문 이미지 기준으로 닫은 재대조 근거 보드
28. `analysis/expansion-gangdong-stage-watch-board.md`: 강동권 4건의 최신 공개 단계 신호와 재확인 우선순위를 묶은 추적 보드
29. `analysis/focus-project-monitoring-board.md`: 핵심 4개 사업의 점검 우선순위, 외부 회신 대기, 먼저 열 URL
30. `analysis/focus-project-weekly-monitoring-cockpit.md`: 핵심 4개 사업의 주간 점검 순서, 외부 회신 대기, 주간 런북 연결
31. `analysis/focus-project-fieldwork-cockpit.md`: 핵심 4개 사업의 답사 순서, 방문 전 원문, 현장 체크, 후속 반영 파일
32. `analysis/focus-project-latest-check-guide.md`: 핵심 4개 사업의 직접 공식 URL, 변화 판정 기준, 반영 파일
33. `analysis/focus-project-monitoring-registry.json`: 핵심 4개 사업 직접 URL, 변화 신호, 반영 파일의 구조화 레지스트리
34. `analysis/life-area-fieldwork-checklist.md`: 강남·잠실/송파·구의/광진 핵심 답사 루트별 바로 쓰는 체크리스트
35. `analysis/fieldwork-quick-capture-template.md`: 현장에서 바로 복붙할 핵심 4개 사업 JSON 입력 초안
36. `analysis/focus-project-pair-comparison-board.md`: 같은 날 두 사업 관찰이 비교 메모로 이어질 준비가 됐는지와 기록된 비교 메모를 확인하는 보드
37. `data/review/focus-project-pair-comparisons.README.md`: 같은 날 사업 쌍 비교 메모 입력 규칙
38. `analysis/life-area-comparison-worksheet.md`: 강남·잠실/송파·구의/광진을 같은 질문으로 비교하는 작업면
39. `analysis/weekly-monitoring-execution-log.md`: 주간 공식 업데이트 점검을 실제 로그 형식으로 기록
40. `analysis/weekly-monitoring-history.md`: 누적 주간 로그 타임라인, 최근 변화, 외부 회신 대기 추적
41. `analysis/weekly-monitoring-comparison-board.md`: 핵심 4개 사업 기준선, 최근 주간 로그 상태, 외부 회신/현장 병목 비교
42. `analysis/life-area-monitoring-board.md`: 핵심 3생활권의 현재 입장과 함께 강동권·약수동 주변 확장 관심권 상태까지 같이 보는 실행 보드
43. `analysis/weekly-monitoring-log-2026-06-24.md`: 현재 기준선 주간 로그
44. `analysis/strategic-research-brief.md`: 생활권별 큰 그림과 첫 액션
45. `analysis/focus-area-comparison-brief.md`: 강남·잠실/송파·구의/광진 상대 비교
46. `analysis/focus-area-evidence-risk-heatmap.md`: 생활권별 공식 근거 품질·원문 병목·리스크를 같은 행에서 비교
47. `analysis/focus-area-decision-memo.md`: 생활권별 잠정 결론, 승격 조건, 반증 조건, 다음 증거
48. `analysis/research-session-playbook.md`: 15분/주간/현장답사/새 업데이트/월간 세션별 실행 순서
49. `analysis/research-hypothesis-ledger.md`: 사업별 가설, 승격 조건, 반증 조건
50. `analysis/project-evidence-binder.md`: 사업장별 공식 원천, 로컬 원문, 텍스트 추출, 먼저 열 파일
51. `analysis/project-due-diligence-board.md`: 사업별 원문·현장·시장·공공촉매를 한 행으로 묶은 실사 순서표
52. `analysis/catalyst-trigger-matrix.md`: 공공 개발·교통 촉매 업데이트가 가설을 올릴지 낮출지 판정
53. `analysis/official-change-detection-board.md`: 공식 출처 변경 신호가 어느 사업장·가설·산출물에 영향을 주는지 출처 기준으로 확인
54. `analysis/official-update-intake-board.md`: 새 공식 업데이트를 수동 inbox에 넣었을 때 어느 decision/intake 파일로 보낼지 검증
55. `analysis/official-update-source-verification-bridge.md`: source verification 경로 update가 어떤 closure_id와 연관되고 applied 승격 가능한지 확인
56. `analysis/official-update-scenario-playbook.md`: 새 고시·공고·보도자료·시장자료 발견 시 intake JSON 예시와 라우팅 gate 확인
57. `analysis/update-impact-ledger.md`: 새 원문·현장 관찰·공공계획 업데이트가 어느 산출물에 영향을 주는지 확인
58. `analysis/research-artifact-dependency-map.md`: 입력 파일과 생성 산출물의 의존 관계 확인
59. `analysis/fixed-date-hardcode-audit.md`: 생성 문서 날짜 고정이 남은 스크립트와 stale 출력 우선순위 확인
60. `analysis/official-source-freshness-ledger.md`: 공식 출처별 로컬 신선도와 다음 갱신 런북
61. `analysis/official-source-activation-checklist.md`: 수동 알림 신청, 수동 월간 검색, API 키 연결 상태와 완료 gate
62. `analysis/official-source-activation-validation.md`: 공식 출처 활성화 입력 검증과 미기록 출처 확인
63. `data/review/official-source-activation-intake.README.md`: 공식 출처 활성화 상태 입력 규칙
64. `data/review/official-source-activation-intake-examples.json`: 공식 출처 활성화 상태 복사용 예시
65. `analysis/official-context-search-queue.md`: 월간 context scan 때 촉매별로 검색할 공식 출처·검색어·기록 위치
66. `analysis/official-context-search-results-board.md`: 월간 context 검색 결과를 not_found/context_only/원문 후보로 검증
67. `data/review/official-context-search-results-intake.README.md`: 공식 context 검색 결과 입력 규칙, 허용 상태, 증거 조건
68. `data/review/official-context-search-results-intake-examples.json`: context 검색 결과 복사용 예시 행
69. `analysis/official-context-impact-board.md`: context_only 결과가 어느 사업장에 연결되는지와 승격 금지 gate 확인
70. `analysis/research-next-moves.md`: 이번 액션 후보 전체 목록
71. `analysis/research-completion-cockpit.md`: goal 완료를 막는 P0/P1 병목
72. `project-notes/README.md`: 사업별 1페이지 메모 색인
73. `analysis/fieldwork-observation-notebook.md`: 지하철 답사 관찰값 기록 양식
74. `data/review/fieldwork-observations.README.md`: 현장 관찰값 입력 규칙과 루트별 복사용 예시
75. `analysis/high-blocking-submission-approval-board.md`: 외부 제출 전 승인 질문, 제출 본문, 접수 후 기록 필드 확인
76. `analysis/high-blocking-filing-checklist.md`: 공식 회신/정보공개가 필요한 3건 접수 전후 체크
77. `analysis/high-blocking-response-followup-cockpit.md`: 회신 대기 3건의 다음 점검일, helper, dry-run, write 순서를 한 장으로 묶은 실행판
78. `analysis/high-blocking-next-check-session-packet.md`: 다음 점검일에 3건 조회 URL, no response 기록 helper, 회신 반영 helper를 그대로 쓰는 세션 패킷
79. `analysis/high-blocking-next-check-command-audit.md`: 세션 패킷 helper의 checked-at/next-check-date가 실제로 앞으로 가는지 감사
80. `analysis/high-blocking-followup-history.md`: 외부 회신 대기 3건의 실제 점검 이력과 최신 포털 상태
81. `data/review/high-blocking-source-response-intake.README.md`: high blocking intake 원본의 상태값, helper, 운영 규칙
82. `analysis/research-manual-web-session-packet.md`: 핵심·확장·외부 회신 수동 웹 세션을 한 장으로 묶은 즉시 실행 패킷
83. `analysis/official-web-query-registry.md`: 포털별 검색어, 기록 필드, 판정 gate를 한 행으로 묶은 공식 웹 검색 레지스트리

## 생활권별 시작점

| 생활권 | 판단 질문 | 먼저 볼 사업 | 트랙 | 답사 루트 | 업데이트 런북 |
| --- | --- | --- | --- | --- | --- |
| 강남 | 상급 입지 프리미엄이 조합별 속도 차이와 비용/공공기여 리스크를 이길 만큼 확실한가. | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 비용/기반시설 대조 | 압구정 한강변 특별계획구역 | recordcode_bottleneck_probe |
| 잠실/송파 | 잠실 핵심축의 공공개발 기대가 실제 구역계·기반시설·이주기 비용 리스크를 보상하는가. | 5. 장미1,2,3차아파트 주택재건축정비사업 조합 | 비용/기반시설 대조 | 잠실역-잠실나루 한강축 | weekly_primary_refresh |
| 구의/광진 | 2·7호선과 한강/터미널 변화 가능성이 소규모정비의 사업성 편차와 원문 불확실성을 보완하는가. | 23. 광장동 삼성1차아파트 소규모재건축정비사업 | 원문 확정 | 강변-광나루 동서울터미널축 | recordcode_bottleneck_probe |

## 오늘 열 9개

| 구분 | 생활권 | 순위 | 사업 | 트랙 | 점수 | 열 파일 | 먼저 열 공식자료 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 이번 액션 | 구의/광진 | 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 원문 확정 | 861 | project-notes/23-j15171517.md | 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode 또는 자치구 고시 원문 연결 |
| 이번 액션 | 잠실/송파 | 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 비용/기반시설 대조 | 855 | project-notes/05-jmapt1.md | analysis/jamsil-jangmi-s1-public-item-fact-check.md |
| 이번 액션 | 잠실/송파 | 1 | 잠실5단지아파트 주택재건축정비사업조합 | 비용/기반시설 대조 | 844 | project-notes/01-jamsil5apt.md | analysis/jamsil5-s1-public-item-fact-check.md |
| 이번 액션 | 강남 | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 비용/기반시설 대조 | 821.5 | project-notes/10-apgujeong3.md | analysis/apgujeong3-s1-public-item-fact-check.md |
| 이번 액션 | 구의/광진 | 28 | 자양번영로3나길 일대 가로주택정비사업 | 원문 확정 | 820.5 | project-notes/28-jayang588-22.md | 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode 또는 자치구 고시 원문 연결 |
| 이번 액션 | 강남 | 15 | 압구정한양7차아파트 재건축정비사업조합 | 원문 확정 | 774 | project-notes/15-hanyang7.md | presentSn 후보는 보조로 두고, direct 고시·정보몽땅 연결 또는 추가 공식 링크로 current business 여부 확인 |
| 딥다이브 | 잠실/송파 | 9 | 잠실우성4차 주택재건축정비사업조합 | 현장·교통 딥다이브 | 371.5 | project-notes/09-tw2w7iwv.md | 사업시행계획서/관리처분계획서/최신 변경고시로 수치 시점 확정 |
| 딥다이브 | 잠실/송파 | 3 | 잠실우성아파트 재건축정비사업조합 | 비용·기반시설 딥다이브 | 369.6 | project-notes/03-q1qk5nf6.md | analysis/jamsil-woosung-s1-public-item-fact-check.md |
| 딥다이브 | 강남 | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 비용·기반시설 딥다이브 | 336.2 | project-notes/02-apgujeong2.md | analysis/apgujeong2-s1-public-item-fact-check.md |

## 장기 관찰 상위

| 순위 | 생활권 | 사업 | 단계 | 잠재 | 확신 | 상방 신호 | 리스크 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 잠실/송파 | 잠실5단지아파트 주택재건축정비사업조합 | 조합설립인가 | 8.9 | 8.9 | 잠실 MICE·국제교류복합지구 일정과 정비사업 단계 동조; 한강 접근·경관·보행축 원문과 현장 동선 개선 | 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절; 이주기 전세 압력 |
| 5 | 잠실/송파 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 조합설립인가 | 8.5 | 7.9 | 잠실 MICE·국제교류복합지구 일정과 정비사업 단계 동조; 한강 접근·경관·보행축 원문과 현장 동선 개선 | 잠실역까지 실제 보행거리; 올림픽대로/한강 접근 단절; 대단지 이주기 혼잡 |
| 10 | 강남 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 조합설립인가 | 8.2 | 7.9 | 한강 접근·경관·보행축 원문과 현장 동선 개선 | 한강변 경관/높이 규제; 압구정로 혼잡; 조합별 사업속도 차이 |
| 9 | 잠실/송파 | 잠실우성4차 주택재건축정비사업조합 | 관리처분인가 | 8.1 | 9 | 잠실 MICE·국제교류복합지구 일정과 정비사업 단계 동조; 한강 접근·경관·보행축 원문과 현장 동선 개선; 대치 학군 수요와 사업시행 이후 비용 안정 | 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절; 이주기 전세 압력 |
| 3 | 잠실/송파 | 잠실우성아파트 재건축정비사업조합 | 조합설립인가 | 7.7 | 7.9 | 잠실 MICE·국제교류복합지구 일정과 정비사업 단계 동조; 한강 접근·경관·보행축 원문과 현장 동선 개선; 대치 학군 수요와 사업시행 이후 비용 안정 | 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절; 이주기 전세 압력 |
| 2 | 강남 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 조합설립인가 | 7.4 | 7.9 | 한강 접근·경관·보행축 원문과 현장 동선 개선 | 한강변 경관/높이 규제; 압구정로 혼잡; 조합별 사업속도 차이 |
| 25 | 구의/광진 | 한양연립 일대 가로주택정비사업 | 사업시행인가 | 7.3 | 7.9 | 한강 접근·경관·보행축 원문과 현장 동선 개선; 동서울터미널/강변역 도시계획·사전협상 구체화; 관리처분 이후 이주·착공 전환 | 핵심 수치 공란 3건; 터미널/강변역 혼잡; 큰 도로와 한강 접근 단절; 공식 일정 불확실성 |
| 4 | 강남 | 은마아파트 재건축정비사업조합 | 조합설립인가 | 7.2 | 8.9 | 대치 학군 수요와 사업시행 이후 비용 안정 | 학원가/학교 주변 혼잡; 대치권 가격 선반영; 단지별 역 접근 차이 |

## P0 완료 병목

| ID | 상태 | 열 파일 | 입력 | 필요 증거 | 다음 행동 |
| --- | --- | --- | --- | --- | --- |
| SRC-01 | official_response_waiting | analysis/high-blocking-source-escalation-packet.md | data/review/high-blocking-source-response-intake.json | 회신 대기 3건, append 가능 0건 | analysis/high-blocking-source-escalation-packet.md의 담당부서/정보몽땅 문의 본문으로 3개 사업장 회신을 확보하고, node scripts/process-high-blocking-response-workflow.mjs dry-run 검토 후 --write로 반영한다. |
| SRC-03 | high_blocking_fields_unclosed | analysis/high-blocking-source-escalation-packet.md | data/review/source-verification-closure-decisions.json | 3개 사업장 21개 필드 중 high blocking 16개 | 회신 또는 정보공개 결과를 process-high-blocking-response-workflow dry-run으로 검증하고 --write로 반영한 뒤 completion audit을 확인한다. |

## 정보공개/공식 민원 접수 준비

| 순위 | 사업 | 상태 | 남은 공백 | 제출 파일 | 접수 명령 | 다음 단계 |
| --- | --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | waiting_for_response | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | data/review/high-blocking-filing-outbox/23-광장동-삼성1차아파트-소규모재건축정비사업.txt |  | 회신 도착 시 response_status와 증거값 입력 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | waiting_for_response | 조합설립인가 고시번호, 고시일, 원문/첨부 URL | data/review/high-blocking-filing-outbox/28-자양번영로3나길-일대-가로주택정비사업.txt |  | 회신 도착 시 response_status와 증거값 입력 |
| 9 | 잠실우성4차 주택재건축정비사업조합 | waiting_for_response | 관리처분계획 별첨 또는 공개 가능한 공사비/정비사업비 원문 | data/review/high-blocking-filing-outbox/09-잠실우성4차-주택재건축정비사업조합.txt |  | 회신 도착 시 response_status와 증거값 입력 |

## 답사 루트

| 루트 | 생활권 | 첫 사업 | 우선 | 현장 체크 | 방문 전 공식자료 |
| --- | --- | --- | --- | --- | --- |
| 잠실역-잠실나루 한강축 | 잠실/송파 | 9. 잠실우성4차 주택재건축정비사업조합 | 1475.7 | 잠실역 환승 동선; 종합운동장 방향 보행; 한강/탄천 단절; 단지 출입구와 간선도로 접속; 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절 | 사업시행계획서/관리처분계획서/최신 변경고시로 수치 시점 확정; 서울시 주택·도시계획 분야; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 강변-광나루 동서울터미널축 | 구의/광진 | 25. 한양연립 일대 가로주택정비사업 | 1370.5 | 강변역 환승; 동서울터미널 보행환경; 구의동 내부 도로폭; 한강 접근; 터미널/강변역 혼잡; 큰 도로와 한강 접근 단절 | project-notes/25-hanyanggaro.md; analysis/hanyanggaro-stage-source-memo.md; analysis/gwangjin-gu-notice-fact-check.md; 서울시 주택·도시계획 분야; 서울시 교통 분야 |
| 압구정 한강변 특별계획구역 | 강남 | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 1333.5 | 압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감; 한강변 경관/높이 규제; 조합별 사업속도 차이 | analysis/apgujeong3-s1-public-item-fact-check.md; 서울시 주택·도시계획 분야; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 대치 학군-개포 남부축 | 강남 | 4. 은마아파트 재건축정비사업조합 | 1109.2 | 대치역/학여울역/도곡역 접근; 학원가 혼잡; 양재천 접근; 단지별 출입구; 학원가/학교 주변 혼잡; 대치권 가격 선반영 | 원문 스니펫을 읽고 확정 수치/조건으로 승격; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 석촌-송파-가락 생활축 | 잠실/송파 | 21. 가락삼익맨숀아파트 재건축정비사업 조합 | 1020.8 | 석촌역/송파역 접근; 송파대로 횡단; 석촌호수 접근; 잠실역까지 실제 이동시간; 잠실 핵심부 대비 역세권 강도 차이; 상업/관광 혼잡 | analysis/grsamik-s1-public-item-fact-check.md; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 구의-자양-건대입구 한강축 | 구의/광진 | 13. 자양제7구역 주택재건축정비사업 조합 | 1008.4 | 구의역/건대입구역 접근; 뚝섬유원지 연결; 자양동 내부 도로폭; 건대 상권 영향; 한강/뚝섬 접근의 도로 단절; 상권 혼잡 | analysis/jayang7-s1-public-item-fact-check.md; 서울시 교통 분야; 서울시 주택·도시계획 분야; 서울도시공간포털; 정비사업 정보몽땅 |

## 업데이트 런북

| 런북 | 주기 | 원격 | 트리거 | 먼저 읽을 산출물 | 판정 규칙 |
| --- | --- | --- | --- | --- | --- |
| weekly_primary_refresh | weekly | Y | 정기 점검일 또는 관심구 고시/공고 알림 수신 | analysis/official-refresh-summary.md; analysis/cleanup-snapshot-diff.md; analysis/cleanup-board-review-queue.md; analysis/project-comparison-matrix.md; analysis/research-status-dashboard.md | 단계 변경, 공개자료 수 증가, 새 고시번호, 새 첨부 원문이 있으면 사업별 메모와 원문 검증 큐를 먼저 갱신한다. |
| expansion_zone_latest_check | weekly | Y | 강동권·약수동 주변 확장 관심권의 최신 단계/직접 hit를 정기 재확인할 때 | analysis/expansion-zone-weekly-monitoring-cockpit.md; analysis/expansion-zone-latest-check-guide.md; analysis/expansion-zone-monitoring-checklist.md; analysis/expansion-zone-intake-seed-board.md; analysis/expansion-gangdong-stage-watch-board.md; analysis/expansion-yaksu-ocr-recheck-board.md; analysis/life-area-monitoring-board.md | 강동권은 값 confirmed와 최신 단계 재확인을 분리하고 gangdong_district_notice 새 row를 만든다. 약수권은 confirmed snapshot 3건을 유지하되, 신당8·신당9는 기존 seoul_urban_notice row를 재사용하고 금호14-1은 tracked_update_id가 없으면 seoul_urban_notice baseline row를 새로 만든다. 약수역 direct hit가 생기기 전에는 adjacent 대조군으로만 읽는다. |
| high_blocking_filing_submission | ad_hoc | N | 사용자 승인 후 high blocking 3건을 실제 담당부서 문의 또는 정보공개청구로 접수할 때 | analysis/high-blocking-submission-approval-board.md; analysis/high-blocking-filing-checklist.md; data/review/high-blocking-filing-outbox/README.md; analysis/high-blocking-filing-tracker.md | 접수번호가 있으면 receipt로, 없으면 filing_note로 접수 흔적을 남긴 뒤 filed_waiting_response로 올린다. 회신 전에는 confirmed/partial로 승격하지 않는다. |
| high_blocking_contact_escalation | ad_hoc | N | high-blocking-public-web-probe에서 외부 확인 필요가 남거나 담당부서/정보몽땅 회신을 받은 경우 | analysis/high-blocking-contact-channel-registry.md; analysis/high-blocking-source-escalation-packet.md; analysis/high-blocking-response-intake-guide.md; analysis/high-blocking-response-decision-drafts.md; analysis/research-system-readiness-audit.md | 공식 채널 URL은 라우팅 근거일 뿐 값 확정 근거가 아니다. 회신에 고시번호·고시일·원문 URL·별첨명 또는 정보공개 필요 사유가 있을 때만 intake에 기록한다. |
| monthly_market_data_refresh | monthly | Y | 실거래 최신월 공표 또는 API 키 연결 완료 | data/market/README.md; analysis/market-manual-download-workbook.md; analysis/market-manual-download-status.md; data/market/market-fetch-plan.csv; data/market/project-market-areas.csv; analysis/transport-location-context.md | 시장 데이터는 사업 단계 판정 근거가 아니라 반응 확인용이다. 고시·인가일 전후 6개월/12개월 거래량과 가격 방향만 별도 분석한다. |
| monthly_context_scan | monthly | Y | 서울시 도시계획·교통 정책 발표, 심의 이슈, 대형 사업 보도자료 | analysis/official-context-sources.csv; analysis/transport-location-context.md; analysis/focus-area-strategy.md | 보도자료와 결재문서는 context로만 두고, 고시번호·결정조서·도면 원문을 확인하기 전에는 확정 신호로 승격하지 않는다. |

## 운영 원칙

- 공식 원문, 고시번호, 고시일, 원문 URL, 자료명, 기준일이 확인되기 전에는 확정값으로 승격하지 않는다.
- 시장 신호는 사업 단계 판정 근거가 아니라 반응 확인용 비교군으로만 쓴다.
- 현장 답사는 역 출구, 단지 경계, 한강·간선도로 단절, 버스 환승, 실제 보행시간을 같은 형식으로 기록한다.
- 새 회신이나 원문이 들어오면 가능하면 `node scripts/record-high-blocking-response.mjs` 또는 `node scripts/mark-high-blocking-filed.mjs`로 반영한 뒤 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.
