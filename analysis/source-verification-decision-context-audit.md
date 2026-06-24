# Source Verification Decision Context Audit

작성 기준: 2026-06-24 KST

이 문서는 `source-verification-closure-ledger`에 붙은 decision이 현재 장부 문맥과 맞는지 점검한다. 핵심 목적은 closure_id 재배열이나 중복 decision 누적으로 생긴 오염을 분리하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 감사 행 | 0 |
| context fallback 복구 | 0 |
| unresolved mismatch | 0 |
| no decision | 0 |
| duplicate closure_id | 25 |

| 구분 | 값 |
| --- | --- |
| decision_context_status | 입력 없음 |
| decision_match_mode | 입력 없음 |

## 우선 확인 상위 120건

_없음_

## 해석 원칙

- `closure_id_mismatch_recovered`: 같은 프로젝트/필드 문맥 decision은 찾았지만 현재 closure_id가 옛 decision과 어긋남.
- `closure_id_mismatch_unresolved`: 같은 closure_id decision은 있으나 현재 프로젝트/필드와 맞는 decision을 못 찾음.
- `closure_id_missing_recovered`: 현재 closure_id에는 decision이 없지만 같은 문맥 decision을 찾아 복구함.
- `no_decision`: decision 로그 자체가 아직 없음.
