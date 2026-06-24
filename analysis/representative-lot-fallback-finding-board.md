# Representative Lot Fallback Finding Board

작성 기준: 2026-06-24 KST

이 문서는 Edge 수동 확인으로 얻은 `presentSn` 결과를 intake로 남기고, 어떤 건이 비교 매트릭스 승격 준비 상태인지 확인하는 보드다. 공식 단계 자체는 direct notice를 기준으로 유지하고, 여기서는 current business 식별자 보강 여부만 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 0 |
| 입력된 finding | 6 |
| 미확인 | 0 |
| 승격 준비 | 0 |
| 보류 | 0 |
| 재확인 필요 | 0 |
| 적용 완료 | 0 |
| 입력 오류 | 6 |
| 입력 경고 | 0 |

## 기록 순서

1. [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md) 기준으로 Edge에서 `presentSn`, `데이터 기준일`, `사업유형`을 확인한다.
2. 가능하면 `node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied`로 기록한다.
2a. API strong candidate가 아니어도 `--prefill-from-api`는 후보 `presentSn/기준일/사업유형` 기본값과 보류 메모를 먼저 채우는 용도로 쓴다.
3. `confirmed_current_business`면 승격 준비로 두고, `stage_gap_hold`, `planning_layer_only`, `ambiguous_candidate`면 보류/재확인 사유를 남긴다.
4. 입력 후 이 보드에서 `ready_to_promote` 또는 `hold_*` 상태를 확인한다.
5. `confirmed_current_business` 결과는 `node scripts/generate-representative-lot-fallback-apply-audit.mjs`로 matrix/project-note 반영 여부를 점검한다.
6. `--auto-mark-applied`로 한 번에 닫히지 않았을 때만 `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh`로 `applied`를 마무리한다.

## 현재 큐

_없음_

## 승격 준비

_없음_

## 보류/재확인

_없음_

## 복붙용 helper

_없음_

## 입력 검증

| 등급 | 후보 | 사업장 | 확인일 | 필드 | 내용 | 조치 |
| --- | --- | --- | --- | --- | --- | --- |
| error | 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 2026-06-24 | rank | 알 수 없는 rank: 2 | fallback 6건 중 하나의 rank로 수정 |
| error | 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 2026-06-24 | rank | 알 수 없는 rank: 10 | fallback 6건 중 하나의 rank로 수정 |
| error | 11 | 압구정아파트지구 특별계획구역4 | 2026-06-24 | rank | 알 수 없는 rank: 11 | fallback 6건 중 하나의 rank로 수정 |
| error | 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 2026-06-24 | rank | 알 수 없는 rank: 12 | fallback 6건 중 하나의 rank로 수정 |
| error | 26 | 자양한양아파트 재건축정비사업 | 2026-06-24 | rank | 알 수 없는 rank: 26 | fallback 6건 중 하나의 rank로 수정 |
| error | 30 | 자양4동 A구역 주택재개발사업 | 2026-06-24 | rank | 알 수 없는 rank: 30 | fallback 6건 중 하나의 rank로 수정 |

