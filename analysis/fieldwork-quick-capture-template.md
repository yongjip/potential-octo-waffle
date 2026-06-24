# 현장 입력 Quick Capture

작성 기준: 2026-06-24 KST

이 문서는 현장에 나가기 직전 또는 현장에서 바로 열어 `data/review/fieldwork-observations.json`에 붙일 입력 초안을 빠르게 만드는 용도다. 실제로 본 값만 넣고, 보지 않은 값은 비워둔다.

## 사용 순서

1. 아래에서 오늘 갈 루트 블록을 복사한다.
2. `visited_at`, `station_exit`, `walk_minutes`, `crossing_wait_minutes`, `barrier_level`, `observed_signal`, `interpretation`, `confidence_change`를 채운다.
3. 필요하면 `photo_refs`에 식별정보 없는 로컬 사진 경로만 넣는다.
4. `data/review/fieldwork-observations.json` 배열에 붙인다.
5. helper를 썼다면 `--write --refresh`로 노트북과 실행 보드까지 함께 갱신한다. 수동 편집을 썼다면 `node scripts/generate-fieldwork-observation-notebook.mjs`, `node scripts/generate-focus-project-fieldwork-cockpit.mjs`, `node scripts/generate-weekly-monitoring-comparison-board.mjs`, `node scripts/generate-life-area-monitoring-board.mjs`를 실행해 입력 상태를 반영한다.

helper를 쓰면 직접 JSON을 붙이지 않아도 된다.

```bash
node scripts/record-fieldwork-observation.mjs \
  --rank=NN \
  --visited-at=YYYY-MM-DD \
  --station-exit='역명 N번 출구' \
  --observed-signal='현장 관찰 신호' \
  --interpretation='가설에 주는 해석' \
  --confidence-change=flat \
  --write --refresh
```

## 입력 규칙

- `barrier_level`: `low`, `medium`, `high`
- `confidence_change`: `up`, `flat`, `down`
- 수치를 모르면 추정으로 쓰지 말고 빈 값으로 둔다.
- `observed_signal`은 현장 사실, `interpretation`은 그 사실이 기존 가설에 주는 영향만 적는다.
- 얼굴, 차량번호, 연락처가 보이는 사진 경로는 남기지 않는다.

## 잠실/송파

### 장미1,2,3차

```json
{
  "rank": "5",
  "project_name": "장미1,2,3차아파트 주택재건축정비사업 조합",
  "visited_at": "YYYY-MM-DD",
  "route_id": "songpa-jamsil-hangang",
  "route_name": "잠실역-잠실나루 한강축",
  "route_segment": "잠실역 -> 잠실나루역 방향 -> 장미1,2,3차 경계",
  "station_exit": "",
  "walk_minutes": "",
  "crossing_wait_minutes": "",
  "barrier_level": "",
  "bus_transfer_note": "",
  "boundary_condition": "올림픽대로, 한강 접근 단절, 잠실역 상권 연결 체감",
  "photo_refs": "",
  "observed_signal": "",
  "interpretation": "",
  "confidence_change": "",
  "follow_up_action": "project-notes/05-jmapt1.md; analysis/transport-location-context.md"
}
```

### 잠실우성4차

```json
{
  "rank": "9",
  "project_name": "잠실우성4차 주택재건축정비사업조합",
  "visited_at": "YYYY-MM-DD",
  "route_id": "songpa-jamsil-hangang",
  "route_name": "잠실역-잠실나루 한강축",
  "route_segment": "잠실역 -> 잠실우성4차 경계 -> 종합운동장 방향 보행부",
  "station_exit": "",
  "walk_minutes": "",
  "crossing_wait_minutes": "",
  "barrier_level": "",
  "bus_transfer_note": "",
  "boundary_condition": "간선도로, 행사 혼잡, 한강·탄천 단절 체감",
  "photo_refs": "",
  "observed_signal": "",
  "interpretation": "",
  "confidence_change": "",
  "follow_up_action": "project-notes/09-tw2w7iwv.md; analysis/transport-location-context.md"
}
```

## 강남

### 압구정3

```json
{
  "rank": "10",
  "project_name": "압구정아파트지구 특별계획구역③ 재건축정비사업 조합",
  "visited_at": "YYYY-MM-DD",
  "route_id": "gangnam-apgujeong-hangang",
  "route_name": "압구정 한강변 특별계획구역",
  "route_segment": "압구정역 -> 특별계획구역③ 외곽 -> 압구정로데오역 -> 한강 접근부",
  "station_exit": "",
  "walk_minutes": "",
  "crossing_wait_minutes": "",
  "barrier_level": "",
  "bus_transfer_note": "",
  "boundary_condition": "압구정로 혼잡, 한강변 접근, 대로 단절 체감",
  "photo_refs": "",
  "observed_signal": "",
  "interpretation": "",
  "confidence_change": "",
  "follow_up_action": "project-notes/10-apgujeong3.md; analysis/focus-area-comparison-brief.md; analysis/transport-location-context.md"
}
```

## 구의/광진

### 한양연립

```json
{
  "rank": "25",
  "project_name": "한양연립 일대 가로주택정비사업",
  "visited_at": "YYYY-MM-DD",
  "route_id": "gwangjin-gangbyeon-gwangnaru",
  "route_name": "강변-광나루 동서울터미널축",
  "route_segment": "강변역 -> 동서울터미널 보행부 -> 한양연립 경계 -> 광나루역 방향",
  "station_exit": "",
  "walk_minutes": "",
  "crossing_wait_minutes": "",
  "barrier_level": "",
  "bus_transfer_note": "",
  "boundary_condition": "터미널 혼잡, 큰 도로 단절, 한강 접근 체감",
  "photo_refs": "",
  "observed_signal": "",
  "interpretation": "",
  "confidence_change": "",
  "follow_up_action": "project-notes/25-hanyanggaro.md; project-notes/24-walkerhill1.md; analysis/transport-location-context.md"
}
```

## 현장 후 바로 확인할 파일

- [현장조사 Observation Notebook](/Users/yongjip/Projects/potential-octo-waffle/analysis/fieldwork-observation-notebook.md)
- [핵심 4개 사업 주간 비교 보드](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-comparison-board.md)
- [생활권 모니터링 보드](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)
- [생활권 현장 체크리스트](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-fieldwork-checklist.md)
- [교통입지 컨텍스트](/Users/yongjip/Projects/potential-octo-waffle/analysis/transport-location-context.md)
