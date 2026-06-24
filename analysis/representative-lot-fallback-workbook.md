# Representative Lot Fallback Workbook

작성 기준: 2026-06-24 KST

이 문서는 `representative_lot_fallback_only`로 남아 있는 사업만 따로 묶는다. 핵심은 `직접 고시 기준 현재 단계`와 `current business UQ120 식별자`를 섞지 않는 것이다. 즉, 정비구역/인가 단계는 이미 공식 원문으로 잠겼더라도, `presentSn`, `urban_data_reference_date`, `cleanup_site_url`가 비어 있으면 사업 레이어 current business는 아직 미확정으로 유지한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| fallback only 사업장 | 0 |
| presentSn 미확인 | 0 |
| 데이터 기준일 미확인 | 0 |
| 정보몽땅 연결 미확인 | 0 |
| 생활권 분포 |  |
| 감시 레벨 분포 |  |
| 현재 단계 분포 |  |
| 트리거 분포 |  |

## 사업장별 현황

_없음_

## 상세



## 판정 원칙

- `urban_record_code`, `urban_notice_code`는 정비구역/고시 식별자다. 이것만으로 `current business presentSn`가 있다고 간주하지 않는다.
- `UPIS_C_UQ120` 후보 단계가 direct notice와 같아도, `presentSn`와 `urban_data_reference_date`가 비어 있으면 `current business`로 승격하지 않는다.
- 따라서 이 워크북의 목적은 단계 상향이 아니라, `현재 단계는 direct notice로 유지`하면서 `UQ120 current business 식별자만 별도 클로저`로 빼는 데 있다.

