# 원문 검증 실행 큐

작성 기준: 2026-06-24 KST

통합 클로저 장부에서 아직 확정값으로 쓰면 안 되는 `pending/conflict/open` 항목만 추린 실행 큐다. 이 문서는 오늘 어떤 원문을 열고, 어떤 기준으로 판정 로그를 갱신해야 하는지에 집중한다.

## 요약

| 항목 | 값 |
| --- | --- |
| 실행 항목 | 0건 |
| 관련 사업장 | 0개 |
| P0/P1 | 0/0 |
| pending/conflict/open | 0/0/0 |
| 액션 유형 |  |
| 생활권 |  |
| 첫 타깃 유형 |  |

## 오늘 먼저 처리할 40건

_없음_

## 사업장 묶음

_없음_

## 사용법

1. `오늘 먼저 처리할 40건`에서 순번이 낮은 항목부터 원문을 연다.
2. 판정 결과는 `data/review/source-verification-closure-decisions.json`의 해당 `closure_id`에 반영한다.
3. confirmed로 바꾼 값은 비교표·핵심 장부·사업별 메모 반영 여부를 확인한다.
4. conflict는 값 정의나 시점을 분리해서 남기고, pending은 어떤 공식 원문이 더 필요한지 적는다.
5. 수정 후 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.
