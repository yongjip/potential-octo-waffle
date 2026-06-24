# High Blocking 회신 Decision 초안

작성 기준: 2026-06-24 KST

이 문서는 `data/review/high-blocking-source-response-intake.json`에 입력한 담당부서/정보몽땅 회신을 `source-verification-closure-decisions.json`에 append 가능한 decision 초안으로 바꾸는 검증 결과다. 이 스크립트는 원본 decision 파일을 직접 수정하지 않는다.

## 사용 절차

1. `analysis/high-blocking-source-escalation-packet.md`의 문의 패킷으로 회신을 받는다.
2. 회신 내용을 가능하면 `node scripts/record-high-blocking-response.mjs`로, 필요하면 `data/review/high-blocking-source-response-intake.json`에 직접 입력한다.
3. `node scripts/generate-high-blocking-response-decision-drafts.mjs`를 실행한다.
4. 아래 상태가 `ready_to_append`인 초안만 `data/review/source-verification-closure-decisions.json` 뒤에 추가한다.
5. `node scripts/regenerate-research-artifacts.mjs`를 실행해 장부와 readiness audit을 갱신한다.

## Intake 상태

| 순위 | 사업장 | 클로저 | 회신 상태 | 초안 상태 | 보완 필요 | 초안 ID |
| --- | --- | --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | S2-0002 | no_response | waiting_for_response |  |  |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | S2-0003 | no_response | waiting_for_response |  |  |
| 9 | 잠실우성4차 주택재건축정비사업조합 | S4-0002 | no_response | waiting_for_response |  |  |

## Append 가능한 Decision 초안

```json
[]
```
