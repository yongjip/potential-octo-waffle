# 공식 출처 활성화 검증 보드

작성 기준: 2026-06-24 KST

이 문서는 `data/review/official-source-activation-intake.json`의 수동 입력값을 검증한다. 활성화 자체가 안 된 출처와, 입력은 했지만 상태/날짜/메모가 부족한 출처를 분리해 보여준다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 활성화 대상 출처 | 9 |
| intake 행 | 2 |
| 추적 중 | 2 |
| 미기록 | 7 |
| orphan | 0 |
| 오류 | 0 |
| 경고 | 0 |
| active/submitted/blocked | 2/0/0 |

| 구분 | 값 |
| --- | --- |
| 상태 | untracked 7; active 2 |
| 유형 | manual_monitoring 5; api_key 2; manual_subscription 1; manual_market_monitoring 1 |
| 추적 | no 7; yes 2 |

## 현재 상태

| 우선 | 출처 | 유형 | 상태 | 추적 | 다음 확인일 | 이슈수 | 권장 필드 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 110 | seoul_urban_alert | manual_subscription | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |
| 103 | opengov | manual_monitoring | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |
| 102 | seoul_traffic_news | manual_monitoring | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |
| 99 | seoul_citybuild_news | manual_monitoring | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |
| 80 | gangdong_district_notice | manual_monitoring | active | yes | 2026-07-01 KST | 0 | coverage, next_check_at, credential_or_subscription_note | 확장 관심권 최신 점검 결과와 direct hit/단계 재확인 메모를 activation intake에 기록 |
| 80 | jung_district_notice | manual_monitoring | active | yes | 2026-07-01 KST | 0 | coverage, next_check_at, credential_or_subscription_note | 확장 관심권 최신 점검 결과와 direct hit/단계 재확인 메모를 activation intake에 기록 |
| 50 | molit_data_go_kr | api_key | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |
| 50 | seoul_open_data | api_key | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |
| 45 | r_one | manual_market_monitoring | untracked | no |  | 0 | source_id, activation_status, next_check_at | examples JSON에서 해당 출처 예시를 복사해 intake에 추가 |

## 검증 이슈

_없음_

## 판정 규칙

- `untracked`는 오류가 아니다. 아직 intake에 기록하지 않은 상태다.
- `active`는 `activated_at`이 있어야 한다.
- `submitted`와 `active`는 보통 `next_check_at`과 `activation_channel`을 함께 남긴다.
- 시장 데이터/API 항목은 키 값이 아니라 환경변수명, 승인 상태, 호출 범위만 기록한다.
