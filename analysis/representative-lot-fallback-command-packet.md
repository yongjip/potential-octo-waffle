# Representative Lot Fallback Command Packet

작성 기준: 2026-06-24 KST

이 문서는 fallback 6건을 Edge에서 대조한 직후 바로 입력할 수 있도록 rank별 copy-ready 명령을 모아 둔 패킷이다. 기본 날짜는 `today`를 사용하고, `--prefill-from-api`로 `presentSn/기준일/사업유형`을 자동 채운다. `confirmed_current_business` 명령은 `--auto-mark-applied`를 포함해 반영 점검까지 통과하면 `applied`까지 한 번에 닫는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 6 |
| same-stage 즉시 확인 | 6 |
| 충돌 재확인 | 0 |
| planning hold | 0 |
| stage-gap hold | 0 |

## 먼저 열 파일

1. [representative-lot-fallback-api-probe.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-api-probe.md)
2. [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md)
3. [representative-lot-fallback-finding-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-finding-board.md)
4. [representative-lot-fallback-apply-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-apply-audit.md)

## 한눈표

| 순위 | 사업장 | API 판정 | presentSn | 기준일 | 기록 명령 |
| --- | --- | --- | --- | --- | --- |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | strong_same_stage_candidate | 11680UQ120PS202603090002 | 2026-03-31 | node scripts/record-representative-lot-fallback-finding.mjs --rank=2 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied |
| 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | strong_same_stage_candidate | 11000UQ120PS202411014197 | 2026-03-31 | node scripts/record-representative-lot-fallback-finding.mjs --rank=10 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied |
| 11 | 압구정아파트지구 특별계획구역4 | strong_same_stage_candidate | 11000UQ120PS202411014198 | 2026-03-31 | node scripts/record-representative-lot-fallback-finding.mjs --rank=11 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied |
| 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | strong_same_stage_candidate | 11000UQ120PS202411014199 | 2026-03-31 | node scripts/record-representative-lot-fallback-finding.mjs --rank=12 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied |
| 26 | 자양한양아파트 재건축정비사업 | strong_same_stage_candidate | 11000UQ120PS202411014174 | 2026-03-31 | node scripts/record-representative-lot-fallback-finding.mjs --rank=26 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied |
| 30 | 자양4동 A구역 주택재개발사업 | strong_same_stage_candidate | 11000UQ120PS202601310048 | 2026-03-31 | node scripts/record-representative-lot-fallback-finding.mjs --rank=30 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied |

## 2. 압구정아파트지구 특별계획구역② 재건축정비사업조합

- API 판정: strong_same_stage_candidate
- 현재 단계: 조합설립인가
- 보드 상태: unreviewed
- 확인 후보명: 압구정아파트지구특별계획구역2
- presentSn: 11680UQ120PS202603090002
- 기준일: 2026-03-31
- 사업유형: 재건축(공동)
- 프로브 키: -
- dry-run:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=2 --checked-at=today --check-status=confirmed_current_business --prefill-from-api`
- write:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=2 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied`
- manual apply fallback:
  `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=2 --checked-at=today --write --refresh`

## 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합

- API 판정: strong_same_stage_candidate
- 현재 단계: 조합설립인가
- 보드 상태: unreviewed
- 확인 후보명: 압구정아파트지구특별계획구역3
- presentSn: 11000UQ120PS202411014197
- 기준일: 2026-03-31
- 사업유형: 재건축(공동)
- 프로브 키: -
- dry-run:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=10 --checked-at=today --check-status=confirmed_current_business --prefill-from-api`
- write:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=10 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied`
- manual apply fallback:
  `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=10 --checked-at=today --write --refresh`

## 11. 압구정아파트지구 특별계획구역4

- API 판정: strong_same_stage_candidate
- 현재 단계: 조합설립인가
- 보드 상태: unreviewed
- 확인 후보명: 압구정아파트지구특별계획구역4
- presentSn: 11000UQ120PS202411014198
- 기준일: 2026-03-31
- 사업유형: 재건축(공동)
- 프로브 키: -
- dry-run:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=11 --checked-at=today --check-status=confirmed_current_business --prefill-from-api`
- write:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=11 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied`
- manual apply fallback:
  `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=11 --checked-at=today --write --refresh`

## 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합

- API 판정: strong_same_stage_candidate
- 현재 단계: 조합설립인가
- 보드 상태: unreviewed
- 확인 후보명: 압구정아파트지구특별계획구역5
- presentSn: 11000UQ120PS202411014199
- 기준일: 2026-03-31
- 사업유형: 재건축(공동)
- 프로브 키: -
- dry-run:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=12 --checked-at=today --check-status=confirmed_current_business --prefill-from-api`
- write:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=12 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied`
- manual apply fallback:
  `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=12 --checked-at=today --write --refresh`

## 26. 자양한양아파트 재건축정비사업

- API 판정: strong_same_stage_candidate
- 현재 단계: 추진위원회승인
- 보드 상태: unreviewed
- 확인 후보명: 자양한양아파트
- presentSn: 11000UQ120PS202411014174
- 기준일: 2026-03-31
- 사업유형: 재건축(공동)
- 프로브 키: -
- dry-run:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=26 --checked-at=today --check-status=confirmed_current_business --prefill-from-api`
- write:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=26 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied`
- manual apply fallback:
  `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=26 --checked-at=today --write --refresh`

## 30. 자양4동 A구역 주택재개발사업

- API 판정: strong_same_stage_candidate
- 현재 단계: 정비구역지정
- 보드 상태: unreviewed
- 확인 후보명: 자양4동A구역주택재개발사업
- presentSn: 11000UQ120PS202601310048
- 기준일: 2026-03-31
- 사업유형: 재개발(주택정비형)
- 프로브 키: -
- dry-run:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=30 --checked-at=today --check-status=confirmed_current_business --prefill-from-api`
- write:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=30 --checked-at=today --check-status=confirmed_current_business --prefill-from-api --write --refresh --auto-mark-applied`
- manual apply fallback:
  `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=30 --checked-at=today --write --refresh`


