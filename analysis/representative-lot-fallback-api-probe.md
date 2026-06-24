# Representative Lot Fallback API Probe

작성 기준: 2026-06-24 KST

이 문서는 fallback 6건에 대해 Edge 수동 확인 전에 API 기준으로 `presentSn`, `데이터 기준일`, `사업유형`, `진행단계`가 잡히는지 먼저 본다. 여기서 strong 후보가 잡혀도 비교표에 바로 반영하지는 않고, Edge 또는 공식 화면 대조 후 `record-representative-lot-fallback-finding`으로 기록한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 6 |
| strong same-stage 후보 | 6 |
| stage-gap hold | 0 |
| planning hold | 0 |
| manual confirm 필요 | 0 |
| presentSn 없는 feature | 0 |
| weak candidate | 0 |

## 먼저 열 파일

1. [representative-lot-fallback-edge-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-edge-session-packet.md)
2. [representative-lot-fallback-identifier-closure-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-identifier-closure-workbook.md)
3. [representative-lot-fallback-finding-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-finding-board.md)
4. [representative-lot-fallback-apply-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-apply-audit.md)

## 운영 규칙

1. `strong_same_stage_candidate`면 Edge에서 값만 대조하고 `confirmed_current_business` 입력 후보로 본다.
2. `stage_gap_hold`면 direct notice보다 단계가 앞선 후보이므로 current business로 올리지 않는다.
3. `planning_hold`면 planning 레이어만 보이는 것으로 보고 채택 금지를 유지한다.
4. `feature_without_present_sn` 또는 `needs_manual_confirmation`이면 브라우저 확인이 여전히 필요하다.

## 한눈표

| 순위 | 사업장 | 관계 | API 판정 | 상위 후보 | presentSn | 진행단계 | 기준일 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | same_stage_candidate | strong_same_stage_candidate | 압구정아파트지구특별계획구역2 | 11680UQ120PS202603090002 | 조합설립인가 | 2026-03-31 |
| 10 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | same_stage_candidate | strong_same_stage_candidate | 압구정아파트지구특별계획구역3 | 11000UQ120PS202411014197 | 조합설립인가 | 2026-03-31 |
| 11 | 압구정아파트지구 특별계획구역4 | same_stage_candidate | strong_same_stage_candidate | 압구정아파트지구특별계획구역4 | 11000UQ120PS202411014198 | 조합설립인가 | 2026-03-31 |
| 12 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | same_stage_candidate | strong_same_stage_candidate | 압구정아파트지구특별계획구역5 | 11000UQ120PS202411014199 | 조합설립인가 | 2026-03-31 |
| 26 | 자양한양아파트 재건축정비사업 | same_stage_candidate | strong_same_stage_candidate | 자양한양아파트 | 11000UQ120PS202411014174 | 추진위구성 | 2026-03-31 |
| 30 | 자양4동 A구역 주택재개발사업 | stage_gap_candidate | strong_same_stage_candidate | 자양4동A구역주택재개발사업 | 11000UQ120PS202601310048 | 구역지정 | 2026-03-31 |

## 2. 압구정아파트지구 특별계획구역② 재건축정비사업조합

- API 판정: strong_same_stage_candidate
- 대표지번/프로브 키: -
- 브라우저 순서: -
- 상위 후보: 압구정아파트지구특별계획구역2
- presentSn: 11680UQ120PS202603090002
- 단계: 조합설립인가
- 사업유형: 재건축(공동)
- 데이터 기준일: 2026-03-31
- 정보몽땅/공개 링크: -
- 후보 미리보기: 압구정아파트지구특별계획구역2 / 조합설립인가 / 11680UQ120PS202603090002 / strong_same_stage_candidate; 압구정2 / 기획완료 / 11680UQ120PS202603090001 / planning_hold
- 해석: API 기준으로 same-stage 후보가 잡혔다. manual confirm만 남았다.
- 다음 액션: API 값과 Edge 화면을 대조해 confirmed_current_business로 기록
- 기록 helper:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=2 --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh`

## 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합

- API 판정: strong_same_stage_candidate
- 대표지번/프로브 키: -
- 브라우저 순서: -
- 상위 후보: 압구정아파트지구특별계획구역3
- presentSn: 11000UQ120PS202411014197
- 단계: 조합설립인가
- 사업유형: 재건축(공동)
- 데이터 기준일: 2026-03-31
- 정보몽땅/공개 링크: https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeId=680900000675S91
- 후보 미리보기: 압구정아파트지구특별계획구역3 / 조합설립인가 / 11000UQ120PS202411014197 / strong_same_stage_candidate; 압구정3 / 기획완료 / 11000UQ120PS202407010876 / planning_hold
- 해석: API 기준으로 same-stage 후보가 잡혔다. manual confirm만 남았다.
- 다음 액션: API 값과 Edge 화면을 대조해 confirmed_current_business로 기록
- 기록 helper:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=10 --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh`

## 11. 압구정아파트지구 특별계획구역4

- API 판정: strong_same_stage_candidate
- 대표지번/프로브 키: -
- 브라우저 순서: -
- 상위 후보: 압구정아파트지구특별계획구역4
- presentSn: 11000UQ120PS202411014198
- 단계: 조합설립인가
- 사업유형: 재건축(공동)
- 데이터 기준일: 2026-03-31
- 정보몽땅/공개 링크: https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=apgujeong4
- 후보 미리보기: 압구정아파트지구특별계획구역4 / 조합설립인가 / 11000UQ120PS202411014198 / strong_same_stage_candidate; 압구정4 / 기획완료 / 11000UQ120PS202407010877 / planning_hold
- 해석: API 기준으로 same-stage 후보가 잡혔다. manual confirm만 남았다.
- 다음 액션: API 값과 Edge 화면을 대조해 confirmed_current_business로 기록
- 기록 helper:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=11 --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh`

## 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합

- API 판정: strong_same_stage_candidate
- 대표지번/프로브 키: -
- 브라우저 순서: -
- 상위 후보: 압구정아파트지구특별계획구역5
- presentSn: 11000UQ120PS202411014199
- 단계: 조합설립인가
- 사업유형: 재건축(공동)
- 데이터 기준일: 2026-03-31
- 정보몽땅/공개 링크: https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=apgujeong5
- 후보 미리보기: 압구정아파트지구특별계획구역5 / 조합설립인가 / 11000UQ120PS202411014199 / strong_same_stage_candidate; 압구정아파트지구특별계획구역4 / 조합설립인가 / 11000UQ120PS202411014198 / strong_same_stage_candidate; 압구정4 / 기획완료 / 11000UQ120PS202407010877 / planning_hold
- 해석: API 기준으로 same-stage 후보가 잡혔다. manual confirm만 남았다.
- 다음 액션: API 값과 Edge 화면을 대조해 confirmed_current_business로 기록
- 기록 helper:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=12 --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh`

## 26. 자양한양아파트 재건축정비사업

- API 판정: strong_same_stage_candidate
- 대표지번/프로브 키: -
- 브라우저 순서: -
- 상위 후보: 자양한양아파트
- presentSn: 11000UQ120PS202411014174
- 단계: 추진위구성
- 사업유형: 재건축(공동)
- 데이터 기준일: 2026-03-31
- 정보몽땅/공개 링크: -
- 후보 미리보기: 자양한양아파트 / 추진위구성 / 11000UQ120PS202411014174 / strong_same_stage_candidate
- 해석: API 기준으로 same-stage 후보가 잡혔다. manual confirm만 남았다.
- 다음 액션: API 값과 Edge 화면을 대조해 confirmed_current_business로 기록
- 기록 helper:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=26 --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh`

## 30. 자양4동 A구역 주택재개발사업

- API 판정: strong_same_stage_candidate
- 대표지번/프로브 키: -
- 브라우저 순서: -
- 상위 후보: 자양4동A구역주택재개발사업
- presentSn: 11000UQ120PS202601310048
- 단계: 구역지정
- 사업유형: 재개발(주택정비형)
- 데이터 기준일: 2026-03-31
- 정보몽땅/공개 링크: -
- 후보 미리보기: 자양4동A구역주택재개발사업 / 구역지정 / 11000UQ120PS202601310048 / strong_same_stage_candidate; 자양4동통합구역 / 기획완료 / 11000UQ120PS202407010917 / planning_hold
- 해석: 기존 static candidate는 stage-gap이었지만, live API에서 same-stage exact 후보가 planning 대안보다 우세해 current business 후보로 승격했다. manual confirm만 남았다.
- 다음 액션: API 값과 Edge 화면을 대조해 confirmed_current_business로 기록
- 기록 helper:
  `node scripts/record-representative-lot-fallback-finding.mjs --rank=30 --checked-at=YYYY-MM-DD --check-status=confirmed_current_business|stage_gap_hold|planning_layer_only|no_present_sn_found|ambiguous_candidate|candidate_rejected --write --refresh`

