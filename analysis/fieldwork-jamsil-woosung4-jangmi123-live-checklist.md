# 현장 체크리스트: 잠실우성4차 · 장미1,2,3차

작성 기준: 2026-06-24 KST

이 문서는 `잠실우성4차`와 `장미1,2,3차`를 같은 날 바로 비교하기 위한 현장용 체크리스트다. [1차 비교 메모](/Users/yongjip/Projects/potential-octo-waffle/analysis/first-pass-comparison-jamsil-woosung4-jangmi123.md)의 데스크 판단을 실제 보행 체감으로 검증하는 용도다.

## 오늘 답사의 목적

1. `단계 프리미엄`이 실제 생활 체감에서 얼마나 힘이 있는지 본다.
2. `잠실역 환승축`과 `잠실나루·한강축`의 차이를 분리해서 본다.
3. `행사·상업 혼잡`, `한강·탄천·올림픽대로 단절`, `단지 경계 접근성`이 어떤 사업에 더 무거운 리스크인지 기록한다.

## 출발 전 3분 체크

- [ ] [잠실우성4차 메모](/Users/yongjip/Projects/potential-octo-waffle/project-notes/09-tw2w7iwv.md)에서 `관리처분인가 2025-12-31`, `인가고시 2026-01-08`, 공사비 회신 대기를 다시 본다.
- [ ] [장미1,2,3차 메모](/Users/yongjip/Projects/potential-octo-waffle/project-notes/05-jmapt1.md)에서 `조합설립인가 2020-03-24`, `최신 변경인가 2025-11-03`, 기반시설 입찰 신호를 다시 본다.
- [ ] [잠실축 1차 비교 메모](/Users/yongjip/Projects/potential-octo-waffle/analysis/first-pass-comparison-jamsil-woosung4-jangmi123.md)의 `현재 결론`과 `보류 항목`을 다시 본다.
- [ ] [핵심 사업 쌍 비교 스타터](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-starter.md)에서 `잠실우성4차 vs 장미1,2,3차` 블록을 복사해 둔다.

## 추천 동선

`잠실역 -> 잠실우성4차 경계 -> 종합운동장 방향 보행부 -> 잠실역 복귀 또는 연결 이동 -> 잠실나루역 방향 -> 장미1,2,3차 경계 -> 한강 접근부`

가능하면 다음 순서로 끊는다.

1. `잠실역 출구 -> 잠실우성4차`
2. `잠실우성4차 경계 -> 종합운동장 방향`
3. `잠실역 또는 연결 동선 -> 장미1,2,3차`
4. `장미1,2,3차 -> 잠실나루역`
5. `장미1,2,3차 -> 한강 접근부`

## 구간별 질문

### 1. 잠실역 -> 잠실우성4차

- 잠실역 환승 강도가 실제 장점인지 피로도인지
- 역 출구에서 단지 경계까지 끊기는 지점이 있는지
- 상권·행사 인파가 생활권 체감에 어느 정도 부담인지

기록할 값:

- `station_exit`
- `walk_minutes`
- `crossing_wait_minutes`
- `crowd_level`
- `observed_signal`

### 2. 잠실우성4차 경계 -> 종합운동장 방향

- 간선도로, 탄천, 대형 보행 단절이 얼마나 큰지
- `관리처분 이후 단계 선행`이 현장 체감상 설득력 있는지
- 종합운동장·MICE 축과의 방향성이 체감되는지

기록할 값:

- `barrier_level`
- `route_segment`
- `observed_signal`
- `interpretation`

### 3. 잠실역/연결 동선 -> 장미1,2,3차

- 장미는 `잠실역 생활권`보다 `잠실나루 생활권`이 더 맞는지
- 실제 보행이 잠실역 중심인지 잠실나루역 중심인지
- 대단지 외곽 체감이 단절보다 우세한지

기록할 값:

- `walk_minutes`
- `crossing_wait_minutes`
- `route_segment`
- `observed_signal`

### 4. 장미1,2,3차 -> 잠실나루역

- 잠실나루역 접근성이 장미의 핵심 장점으로 느껴지는지
- 역 접근이 잠실역보다 덜 피로한지
- 생활권의 조용함/분리감이 장점인지 단점인지

기록할 값:

- `station_exit`
- `walk_minutes`
- `crowd_level`
- `confidence_change`

### 5. 장미1,2,3차 -> 한강 접근부

- 한강 접근이 실제 프리미엄인지, 올림픽대로 단절이 더 강한지
- 보행 연결감이 실제로 좋다고 말할 수 있는지
- 공공계획 기대와 무관하게 일상 동선 가치가 있는지

기록할 값:

- `barrier_level`
- `crossing_wait_minutes`
- `observed_signal`
- `interpretation`

## 두 사업을 바로 비교할 항목

| 항목 | 잠실우성4차 | 장미1,2,3차 | 현장 후 판단 |
| --- | --- | --- | --- |
| 역 접근 체감 | 잠실역 중심 | 잠실역 vs 잠실나루역 중 무엇이 더 중심인지 |  |
| 환승 피로도 | 높음 가능성 | 상대적으로 낮을 가능성 |  |
| 큰 도로/하천 단절 | 탄천·간선도로 | 올림픽대로·한강 접근 단절 |  |
| 상권/행사 혼잡 | 높음 가능성 | 상대적으로 분리된 축 가능성 |  |
| 단계 프리미엄 설득력 | 관리처분 선행 | 조합설립 단계 |  |
| 장기 잠재 체감 | MICE·종합운동장 방향 | 한강·잠실나루·잠실 배후 |  |

## 현장 후 바로 채울 한 줄

- 잠실우성4차가 더 강하게 남은 점:
- 장미1,2,3차가 더 강하게 남은 점:
- 현장에서 더 무거웠던 리스크:
- 기존 `잠실/송파 1순위` 판단을 바꿀 정도인지:

## 입력 순서

1. `data/review/fieldwork-observations.json`에 `rank=9`, `rank=5` 각각 입력
2. [analysis/focus-project-pair-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-board.md) 기준으로 same-day memo 작성
3. [analysis/life-area-comparison-worksheet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-comparison-worksheet.md)의 `같은 날 쌍 비교에서 가장 흔들린 판단` 갱신
4. 필요한 경우 [analysis/first-pass-comparison-jamsil-woosung4-jangmi123.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/first-pass-comparison-jamsil-woosung4-jangmi123.md) 결론 문장 수정

## 답사 후 고칠 파일

- [project-notes/09-tw2w7iwv.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/09-tw2w7iwv.md)
- [project-notes/05-jmapt1.md](/Users/yongjip/Projects/potential-octo-waffle/project-notes/05-jmapt1.md)
- [analysis/first-pass-comparison-jamsil-woosung4-jangmi123.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/first-pass-comparison-jamsil-woosung4-jangmi123.md)
- [analysis/life-area-comparison-worksheet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-comparison-worksheet.md)
- [analysis/transport-location-context.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/transport-location-context.md)

## 주의

- `잠실우성4차가 단계가 앞서니까 무조건 낫다`고 쓰지 않는다.
- `장미1,2,3차가 한강에 가깝다`는 말만으로 프리미엄을 확정하지 않는다.
- 현장 인상은 공식 원문을 대체하지 않는다. 원문과 충돌하면 `보류 메모`로 남긴다.
