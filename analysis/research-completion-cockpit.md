# 리서치 Completion Cockpit

작성 기준: 2026-06-24 KST

이 문서는 goal 완료를 막는 남은 필수 증거를 하나의 실행 보드로 묶는다. 이미 읽을 수 있는 비교표와 전략 브리프를 재정의하지 않고, 완료 판정에 필요한 원자료·회신·최종 감사 증거만 추린다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 열린 작업 | 6 |
| P0 | 2 |
| P1 | 3 |
| 시장 데이터 작업 | 0 |
| 원문 회신 작업 | 5 |
| 상태 분포 | filed_waiting_response 3; final_regeneration_current 1; high_blocking_fields_unclosed 1; official_response_waiting 1 |

## P0 Critical Path

| ID | 영역 | 상태 | 필요 증거 | 다음 행동 | 완료 게이트 |
| --- | --- | --- | --- | --- | --- |
| SRC-01 | source_value_verification | official_response_waiting | 회신 대기 3건, append 가능 0건 | analysis/high-blocking-source-escalation-packet.md의 담당부서/정보몽땅 문의 본문으로 3개 사업장 회신을 확보하고, node scripts/process-high-blocking-response-workflow.mjs dry-run 검토 후 --write로 반영한다. | 회신 intake가 no_response를 벗어나고 ready_to_append 또는 정보공개/열람 보류 근거로 검증됨 |
| SRC-03 | source_value_verification | high_blocking_fields_unclosed | 3개 사업장 21개 필드 중 high blocking 16개 | 회신 또는 정보공개 결과를 process-high-blocking-response-workflow dry-run으로 검증하고 --write로 반영한 뒤 completion audit을 확인한다. | research-system-readiness-audit에서 high blocking 외부 회신 대기가 사라지고 completion_boundary가 ready 계열로 이동 |

## 전체 작업 보드

| ID | 우선 | 영역 | 상태 | 열 파일 | 입력/수정 | 검증 명령 |
| --- | --- | --- | --- | --- | --- | --- |
| SRC-01 | P0 | source_value_verification | official_response_waiting | analysis/high-blocking-source-escalation-packet.md | data/review/high-blocking-source-response-intake.json | node scripts/process-high-blocking-response-workflow.mjs |
| SRC-03 | P0 | source_value_verification | high_blocking_fields_unclosed | analysis/high-blocking-source-escalation-packet.md | data/review/source-verification-closure-decisions.json | node scripts/regenerate-research-artifacts.mjs |
| SRC-P09 | P1 | source_value_verification | filed_waiting_response | analysis/high-blocking-filing-checklist.md | data/review/high-blocking-source-response-intake.json | node scripts/process-high-blocking-response-workflow.mjs |
| SRC-P23 | P1 | source_value_verification | filed_waiting_response | analysis/high-blocking-filing-checklist.md | data/review/high-blocking-source-response-intake.json | node scripts/process-high-blocking-response-workflow.mjs |
| SRC-P28 | P1 | source_value_verification | filed_waiting_response | analysis/high-blocking-filing-checklist.md | data/review/high-blocking-source-response-intake.json | node scripts/process-high-blocking-response-workflow.mjs |
| AUD-01 | P2 | completion_boundary | final_regeneration_current | scripts/regenerate-research-artifacts.mjs | analysis/research-system-readiness-audit.md | node scripts/regenerate-research-artifacts.mjs |

## 완료 판정 규칙

- 시장 데이터는 원자료 파일 또는 API 수집 결과가 실제로 존재하고, 컬럼 감사·정규화·사업장 매칭이 실행된 뒤에만 완료 증거로 본다.
- high blocking 원문은 담당부서/정보몽땅 회신, 정보공개청구 결과, 방문열람 보류 사유 중 하나가 intake와 decision 장부에 남아야 완료 증거로 본다.
- 모든 입력 반영 후 `node scripts/regenerate-research-artifacts.mjs`를 실행하고 `analysis/research-system-readiness-audit.md`에서 완료 보류 계열이 사라져야 goal complete 후보로 본다.
