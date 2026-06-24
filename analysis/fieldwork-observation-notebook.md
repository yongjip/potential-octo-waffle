# 현장조사 Observation Notebook

작성 기준: 2026-06-24 KST

이 문서는 지하철 답사에서 무엇을 보고 어떤 형식으로 기록할지 정하는 노트북이다. 공식 원문으로 세운 교통·입지 가설을 현장에서 확인하고, 관찰값은 `data/review/fieldwork-observations.json`에 누적한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 생활권 | 3 |
| 답사 루트 | 8 |
| 사업장 | 30 |
| 입력된 관찰 | 0 |
| 관찰 입력 오류 | 0 |
| 관찰 입력 경고 | 0 |
| 방문 대기 | 30 |
| 후속 반영 가능 | 0 |

## 기록 순서

1. 방문 전 `official_before_visit`의 공식자료를 열어 구역계, 단계, 비용·기반시설 쟁점을 확인한다.
2. 현장에서는 역 출구부터 단지 경계까지 실제 보행시간, 횡단 대기, 대형도로/한강/하천 단절, 버스 환승, 출입구 위치를 같은 순서로 기록한다.
3. 가능하면 `node scripts/record-fieldwork-observation.mjs --rank=NN --visited-at=YYYY-MM-DD --station-exit='역명 N번 출구' --observed-signal='...' --interpretation='...' --confidence-change=flat --write --refresh`로 기록한다.
4. 수동 편집을 썼다면 관찰값을 `data/review/fieldwork-observations.json`에 추가한 뒤 이 노트북과 관련 실행 보드를 재생성해 `observed_followup_ready` 항목을 확인한다.
5. 같은 날 비교할 사업이 2건 이상이면 `analysis/focus-project-pair-comparison-board.md`와 `analysis/focus-project-pair-comparison-starter.md`를 열어 pair-comparison 메모를 남긴다.
6. 해석이 바뀐 경우 사업별 메모와 `analysis/transport-location-context.md`를 갱신한다.

## 루트별 방문 계획

| 생활권 | 루트 | 사업장 | 첫 사업 | 우선 | 기록됨 | 방문 전 공식자료 |
| --- | --- | --- | --- | --- | --- | --- |
| 잠실/송파 | 잠실역-잠실나루 한강축 | 4 | 9. 잠실우성4차 주택재건축정비사업조합 | 1475.7 | 0 | 사업시행계획서/관리처분계획서/최신 변경고시로 수치 시점 확정; 서울시 주택·도시계획 분야; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 구의/광진 | 강변-광나루 동서울터미널축 | 4 | 25. 한양연립 일대 가로주택정비사업 | 1370.5 | 0 | project-notes/25-hanyanggaro.md; analysis/hanyanggaro-stage-source-memo.md; analysis/gwangjin-gu-notice-fact-check.md; 서울시 주택·도시계획 분야; 서울시 교통 분야 |
| 강남 | 압구정 한강변 특별계획구역 | 5 | 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 1333.5 | 0 | analysis/apgujeong3-s1-public-item-fact-check.md; 서울시 주택·도시계획 분야; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 강남 | 대치 학군-개포 남부축 | 5 | 4. 은마아파트 재건축정비사업조합 | 1109.2 | 0 | 원문 스니펫을 읽고 확정 수치/조건으로 승격; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 잠실/송파 | 석촌-송파-가락 생활축 | 5 | 21. 가락삼익맨숀아파트 재건축정비사업 조합 | 1020.8 | 0 | analysis/grsamik-s1-public-item-fact-check.md; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 구의/광진 | 구의-자양-건대입구 한강축 | 5 | 13. 자양제7구역 주택재건축정비사업 조합 | 1008.4 | 0 | analysis/jayang7-s1-public-item-fact-check.md; 서울시 교통 분야; 서울시 주택·도시계획 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 잠실/송파 | 마천·거여 재정비축 | 1 | 20. 마천1재정비촉진구역 주택재개발정비사업조합 | 773.7 | 0 | 원문 스니펫을 읽고 확정 수치/조건으로 승격; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |
| 구의/광진 | 중곡 7호선 생활권 | 1 | 22. 중곡아파트 주택재건축정비사업조합 | 699.9 | 0 | 고시문 주택공급계획 또는 정보몽땅 사업개요 업데이트 확인; 서울시 교통 분야; 서울도시공간포털; 정비사업 정보몽땅 |

## 우선 기록 대상

| 순위 | 생활권 | 루트 | 사업 | 우선 | 상태 | 현장 체크 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 잠실/송파 | 잠실역-잠실나루 한강축 | 잠실우성4차 주택재건축정비사업조합 | 1475.7 | ready_to_visit | 잠실역 환승 동선; 종합운동장 방향 보행; 한강/탄천 단절; 단지 출입구와 간선도로 접속; 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절 | project-notes/09-tw2w7iwv.md |
| 25 | 구의/광진 | 강변-광나루 동서울터미널축 | 한양연립 일대 가로주택정비사업 | 1370.5 | ready_to_visit | 강변역 환승; 동서울터미널 보행환경; 구의동 내부 도로폭; 한강 접근; 터미널/강변역 혼잡; 큰 도로와 한강 접근 단절 | project-notes/25-hanyanggaro.md |
| 1 | 잠실/송파 | 잠실역-잠실나루 한강축 | 잠실5단지아파트 주택재건축정비사업조합 | 1364.7 | ready_to_visit | 잠실역 환승 동선; 종합운동장 방향 보행; 한강/탄천 단절; 단지 출입구와 간선도로 접속; 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절 | project-notes/01-jamsil5apt.md |
| 10 | 강남 | 압구정 한강변 특별계획구역 | 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | 1333.5 | ready_to_visit | 압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감; 한강변 경관/높이 규제; 조합별 사업속도 차이 | project-notes/10-apgujeong3.md |
| 5 | 잠실/송파 | 잠실역-잠실나루 한강축 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 1314 | ready_to_visit | 잠실나루역 보행; 한강공원 접근; 올림픽대로 단절; 잠실역 상권 연결; 잠실역까지 실제 보행거리; 올림픽대로/한강 접근 단절 | project-notes/05-jmapt1.md |
| 3 | 잠실/송파 | 잠실역-잠실나루 한강축 | 잠실우성아파트 재건축정비사업조합 | 1301.7 | ready_to_visit | 잠실역 환승 동선; 종합운동장 방향 보행; 한강/탄천 단절; 단지 출입구와 간선도로 접속; 행사·상업 집객에 따른 혼잡; 한강·탄천·대형도로 단절 | project-notes/03-q1qk5nf6.md |
| 2 | 강남 | 압구정 한강변 특별계획구역 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 1285.2 | ready_to_visit | 압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감; 한강변 경관/높이 규제; 조합별 사업속도 차이 | project-notes/02-apgujeong2.md |
| 11 | 강남 | 압구정 한강변 특별계획구역 | 압구정아파트지구 특별계획구역4 | 1244.4 | ready_to_visit | 압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감; 한강변 경관/높이 규제; 조합별 사업속도 차이 | project-notes/11-apgujeong4.md |
| 15 | 강남 | 압구정 한강변 특별계획구역 | 압구정한양7차아파트 재건축정비사업조합 | 1198.2 | ready_to_visit | 압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감; 한강변 경관/높이 규제; 조합별 사업속도 차이 | project-notes/15-hanyang7.md |
| 12 | 강남 | 압구정 한강변 특별계획구역 | 압구정아파트지구 특별계획구역5 재건축정비사업조합 | 1197.3 | ready_to_visit | 압구정역/압구정로데오역 접근; 한강변 단지 경계; 압구정로 혼잡; 성수/강북 연결감; 한강변 경관/높이 규제; 조합별 사업속도 차이 | project-notes/12-apgujeong5.md |
| 4 | 강남 | 대치 학군-개포 남부축 | 은마아파트 재건축정비사업조합 | 1109.2 | ready_to_visit | 대치역/학여울역/도곡역 접근; 학원가 혼잡; 양재천 접근; 단지별 출입구; 학원가/학교 주변 혼잡; 대치권 가격 선반영 | project-notes/04-the-eunma.md |
| 27 | 구의/광진 | 강변-광나루 동서울터미널축 | 광장극동아파트 재건축사업 (신속통합기획) | 1064.4 | ready_to_visit | 광나루역 접근; 강변역 연결; 한강공원 접근; 구역계와 단지 경계 확인; 5호선 단일 접근성; 강변북로/한강 단절 | project-notes/27-kukdong-reborn.md |
| 6 | 강남 | 대치 학군-개포 남부축 | 대치우성1차아파트 재건축정비사업조합 | 1051.7 | ready_to_visit | 대치역/학여울역/도곡역 접근; 학원가 혼잡; 양재천 접근; 단지별 출입구; 학원가/학교 주변 혼잡; 대치권 가격 선반영 | project-notes/06-woosung1.md |
| 8 | 강남 | 대치 학군-개포 남부축 | 대치쌍용1차아파트 주택재건축정비사업조합 | 1034 | ready_to_visit | 대치역/학여울역/도곡역 접근; 학원가 혼잡; 양재천 접근; 단지별 출입구; 학원가/학교 주변 혼잡; 대치권 가격 선반영 | project-notes/08-ssang1.md |
| 7 | 강남 | 대치 학군-개포 남부축 | 대치쌍용2차아파트 주택재건축정비사업조합 | 1028.3 | ready_to_visit | 대치역/학여울역/도곡역 접근; 학원가 혼잡; 양재천 접근; 단지별 출입구; 학원가/학교 주변 혼잡; 대치권 가격 선반영 | project-notes/07-ssang2.md |

## 관찰 반영 대기

_없음_

## 관찰 입력 검증

_없음_

## 같은 날 쌍 비교 후속

- 같은 날 두 사업 관찰이 들어왔는지는 [analysis/focus-project-pair-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-board.md)에서 먼저 확인한다.
- 잠실역-잠실나루 한강축에서 `잠실우성4차`와 `장미1,2,3차`를 같은 날 걸었으면 `단계 선행`과 `보행/한강 체감`을 분리해 적는다.
- 압구정 한강변 특별계획구역과 강변-광나루 동서울터미널축을 같은 날 걸었으면 `상급지 희소성`과 `강변 접근 실용성`을 분리해 적는다.
- pair-comparison 메모는 [analysis/focus-project-pair-comparison-starter.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-starter.md)에서 짧게 적고, 필요하면 `record-focus-project-pair-comparison` helper로 intake에 남긴다.

## Intake 필드

| 필드 | 의미 |
| --- | --- |
| rank | 우선검토 후보 순위 |
| visited_at | 방문일 |
| route_segment | 실제 이동 구간 |
| station_exit | 출발 역/출구 |
| walk_minutes | 역 출구에서 단지 경계까지 체감/측정 보행 시간 |
| crossing_wait_minutes | 주요 횡단·신호 대기 시간 |
| barrier_level | low, medium, high 중 하나 |
| bus_transfer_note | 버스/환승 보완 가능성 |
| boundary_condition | 단지 경계, 도로, 하천, 한강 접근 단절 |
| photo_refs | 로컬 사진 경로 또는 파일명 |
| observed_signal | 원문 가설과 비교한 관찰 신호 |
| interpretation | 사업별 장기 가설에 미치는 해석 |
| confidence_change | up, flat, down 중 하나 |
| follow_up_action | 수정할 사업별 메모나 분석 파일 |

주의: 현장 사진과 메모에는 얼굴, 차량번호, 연락처 등 직접 식별 가능한 정보는 남기지 않는다.
