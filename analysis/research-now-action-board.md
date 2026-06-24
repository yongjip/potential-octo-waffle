# Research Now Action Board

작성 기준: 2026-06-24 KST

이 문서는 지금 바로 진행할 수 있는 조사와 날짜까지 기다려야 하는 조사를 분리한 실행 보드다. 핵심은 대기선을 붙잡고 있지 말고, 로컬 비교·확장 재확인·원문 딥다이브 중 하나를 바로 고르는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 전체 레인 | 5 |
| 지금 바로 가능 | 3 |
| 선택 실행 가능 | 1 |
| 날짜 대기 | 1 |
| 로컬 우선 | 3 |
| 수동 웹 확인 | 1 |
| 외부 회신 다음 점검일 | 2026-06-29 |

## 지금 바로 할 일

| 우선 | 레인 | 모드 | 대상 | 현재 상태 | 지금 할 일 | 먼저 열 파일 | 멈출 조건 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 95 | 확장 관심권 | manual_web | 강동권 | confirmed 비교 가능; D-7; 기준 2026-07-01 KST | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 | analysis/expansion-zone-weekly-monitoring-cockpit.md | create seed 5건 / reuse 3건 기준으로 source_id와 update_id 재사용 여부가 정리됨 |
| 90 | 핵심 생활권 비교 | local | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 강남; 비용/기반시설 확인; 조합설립인가 | 추진경과와 공개항목/입찰공고에서 비용·기반시설 신호 확인 | analysis/focus-project-weekly-monitoring-cockpit.md | 첫 후보: 9. 잠실우성4차 주택재건축정비사업조합 / 현장·교통 딥다이브 |
| 82 | 원문 딥다이브 | local | 23. 광장동 삼성1차아파트 소규모재건축정비사업 | 구의/광진; 원문 확정; score 861 | 원문 수치 병목 정리; 우선 필드: 고시일:value_missing; 고시번호:value_missing; 추진위원회 승인일:value_missing; 열 자료: 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode 또는 자치구 고시 원문 연결 | project-notes/23-j15171517.md | 우선 원문 후보: 23. 광장동 삼성1차아파트 소규모재건축정비사업 / 단계·동의율은 정보몽땅 공개항목으로 확인, 결정고시 recordCode 또는 자치구 고시 원문 연결 |
| 70 | 현장 답사 준비 | local | data/review/fieldwork-observations.json | 현장 나갈 때만 실행 | 현장 동선, 환승, 한강·간선도로 단절, 실제 보행시간을 같은 형식으로 기록한다. | analysis/fieldwork-route-planner.md | 우선 루트: 역 접근, 한강/간선도로 단절, 환승/상권 혼잡이 입지 프리미엄을 실제로 뒷받침하는가. |

## 기다려야 하는 일

| 우선 | 레인 | 대상 | 현재 상태 | 오늘 처리 | 먼저 열 파일 | 다음 확인 힌트 |
| --- | --- | --- | --- | --- | --- | --- |
| 100 | 외부 회신 | 23. 광장동 삼성1차아파트 소규모재건축정비사업; 28. 자양번영로3나길 일대 가로주택정비사업; 9. 잠실우성4차 주택재건축정비사업조합 | no_response 3건 / 다음 점검 2026-06-29 / D-5 | 새 메일이나 알림이 없으면 오늘은 추가 제출 없이 대기하고, 2026-06-29에 next-check session packet으로 3건 상태를 재확인 | analysis/high-blocking-next-check-session-packet.md | node scripts/touch-high-blocking-followup.mjs --session-anchor-date=2026-06-29 --checked-at=2026-06-29 --write --refresh; 23. 광장동 삼성1차아파트 소규모재건축정비사업 -> node scripts/record-high-blocking-followup-check.mjs --rank=23 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 담당부서 회신 여부 확인' --write / 28. 자양번영로3나길 일대 가로주택정비사업 -> node scripts/record-high-blocking-followup-check.mjs --rank=28 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='open.go.kr 나의청구에서 처리상태, 보완요구, 처리기한 변경 여부 확인' --write / 9. 잠실우성4차 주택재건축정비사업조합 -> node scripts/record-high-blocking-followup-check.mjs --rank=9 --checked-at=2026-06-29 --check-status=no_change --observed-note='답변 게시 없음' --next-check-date=2026-07-02 --next-check-note='새올전자민원창구 나의민원조회에서 접수상태, 답변 게시 여부, 보완요구 여부 확인' --write |

## 운영 메모

- 외부 회신 3건은 이미 접수 상태이므로 2026-06-29 전에는 새 회신이 없으면 상태만 유지한다.
- 오늘 조사 시간을 쓰려면 `확장 관심권`, `핵심 생활권 비교`, `원문 딥다이브` 중 하나만 먼저 고른다.
- 새 공식 업데이트를 발견했을 때만 weekly/manual 웹 세션을 확장하고, 값 확정은 여전히 원문/회신 gate를 통과할 때만 허용한다.

