# 핵심 사업 실전 입력 콕핏

작성 기준: 2026-06-24 KST

이 문서는 핵심 4개 사업 현장 입력과 high blocking 3건 회신 반영을 바로 실행하기 위한 입력 전용 콕핏이다. 긴 설명보다 `지금 어떤 파일이 비어 있는지`, `어떤 명령을 복붙하면 되는지`, `입력 후 무엇을 다시 봐야 하는지`를 바로 보여준다.

## 현재 상태

| 입력면 | 현재 상태 | 근거 | 지금 필요한 것 |
| --- | --- | --- | --- |
| 현장 관찰 | 0건 | `data/review/fieldwork-observations.json = []` | 핵심 4개 사업 중 최소 1건 실제 답사 입력 |
| high blocking 회신 | 3건 모두 회신 전 | 접수번호 16913396, 16913410, 626590 / `response_status=no_response` | 회신 도착 시 intake 기록 후 workflow dry-run |
| 핵심 사업 읽기 표면 | 운영 가능 | 핵심 4선, 삼면 브리프, 모니터링 보드 연결 완료 | 실제 입력이 들어와야 비교 체계가 더 단단해짐 |

## 1. 현장 입력 바로 실행

원칙:

- `observed_signal`은 현장에서 본 사실만 적는다.
- `interpretation`은 그 사실이 기존 가설을 유지/보류/재검토하게 만드는 이유만 적는다.
- 확실하지 않은 시간·대기시간은 비우거나 짧게 메모로 남기고 추정값을 억지로 넣지 않는다.

### 장미1,2,3차

```bash
node scripts/record-fieldwork-observation.mjs \
  --rank=5 \
  --visited-at=YYYY-MM-DD \
  --station-exit='잠실역 또는 잠실나루역 N번 출구' \
  --route-segment='잠실역 -> 잠실나루역 방향 -> 장미1,2,3차 경계' \
  --boundary-condition='올림픽대로, 한강 접근 단절, 잠실역 상권 연결 체감' \
  --observed-signal='예: 잠실나루역 접근은 짧지만 올림픽대로와 한강 접근 단절이 예상보다 큼' \
  --interpretation='예: 잠실 핵심축 상방은 유지되지만 보행 단절과 대단지 혼잡 리스크를 더 크게 봐야 함' \
  --confidence-change=flat \
  --write --refresh
```

### 잠실우성4차

```bash
node scripts/record-fieldwork-observation.mjs \
  --rank=9 \
  --visited-at=YYYY-MM-DD \
  --station-exit='잠실역 N번 출구' \
  --route-segment='잠실역 -> 잠실우성4차 경계 -> 종합운동장 방향 보행부' \
  --boundary-condition='간선도로, 행사 혼잡, 한강·탄천 단절 체감' \
  --observed-signal='예: 행사 집객 시간대에는 환승 동선과 단지 접근이 예상보다 혼잡함' \
  --interpretation='예: 관리처분 이후 속도 프리미엄은 유지되지만 현장 혼잡 리스크는 더 크게 반영해야 함' \
  --confidence-change=flat \
  --write --refresh
```

### 압구정3

```bash
node scripts/record-fieldwork-observation.mjs \
  --rank=10 \
  --visited-at=YYYY-MM-DD \
  --station-exit='압구정역 또는 압구정로데오역 N번 출구' \
  --route-segment='압구정역 -> 특별계획구역③ 외곽 -> 압구정로데오역 -> 한강 접근부' \
  --boundary-condition='압구정로 혼잡, 한강변 접근, 대로 단절 체감' \
  --observed-signal='예: 한강 접근은 강하지만 압구정로 횡단과 차량 혼잡이 체감상 큼' \
  --interpretation='예: 상급지 프리미엄은 유지되지만 공공기여·교통부담 조건을 더 무겁게 읽어야 함' \
  --confidence-change=flat \
  --write --refresh
```

### 한양연립

```bash
node scripts/record-fieldwork-observation.mjs \
  --rank=25 \
  --visited-at=YYYY-MM-DD \
  --station-exit='강변역 N번 출구' \
  --route-segment='강변역 -> 동서울터미널 보행부 -> 한양연립 경계 -> 광나루역 방향' \
  --boundary-condition='터미널 혼잡, 큰 도로 단절, 한강 접근 체감' \
  --observed-signal='예: 강변역 환승은 편하지만 터미널 혼잡과 대로 단절이 예상보다 큼' \
  --interpretation='예: 입지 보완 효과는 있으나 소규모정비 약점을 완전히 덮지는 못함' \
  --confidence-change=flat \
  --write --refresh
```

## 2. 회신 반영 바로 실행

회신 원칙:

- `confirmed` 또는 `partial`은 고시번호, 고시일, 원문 URL, 첨부명, 자료명 중 확인된 식별자가 있어야 한다.
- 식별자 없이 “공개 불가”, “정보공개청구 필요”만 오면 `info_disclosure_required` 또는 `unavailable`로 기록한다.
- 회신 입력 직후에는 바로 확정하지 말고 workflow dry-run을 먼저 본다.

### 23. 광장동 삼성1차아파트 소규모재건축정비사업

- 현재 접수번호: `16913396`
- 현재 상태: `filed_waiting_response / no_response`

confirmed 또는 partial 예시:

```bash
node scripts/record-high-blocking-response.mjs \
  --rank=23 \
  --status=partial \
  --received-at=YYYY-MM-DD \
  --responder='광진구 담당부서' \
  --attachment-name='조합설립인가 고시문 또는 자료명' \
  --evidence=https://... \
  --response-note='고시번호 또는 자료명 일부만 확인됨' \
  --write
```

### 28. 자양번영로3나길 일대 가로주택정비사업

- 현재 접수번호: `16913410`
- 현재 상태: `filed_waiting_response / no_response`

confirmed 또는 partial 예시:

```bash
node scripts/record-high-blocking-response.mjs \
  --rank=28 \
  --status=partial \
  --received-at=YYYY-MM-DD \
  --responder='광진구 담당부서' \
  --attachment-name='조합설립인가 고시문 또는 자료명' \
  --evidence=https://... \
  --response-note='고시번호 또는 자료명 일부만 확인됨' \
  --write
```

### 9. 잠실우성4차 주택재건축정비사업조합

- 현재 접수번호: `626590`
- 현재 상태: `filed_waiting_response / no_response`

confirmed 또는 partial 예시:

```bash
node scripts/record-high-blocking-response.mjs \
  --rank=9 \
  --status=partial \
  --received-at=YYYY-MM-DD \
  --responder='송파구 담당부서' \
  --attachment-name='관리처분계획인가 별첨 또는 공사비 기준자료명' \
  --evidence=https://... \
  --response-note='공사비 또는 기준일 일부만 확인됨' \
  --write
```

정보공개 또는 방문열람 필요 회신 예시:

```bash
node scripts/record-high-blocking-response.mjs \
  --rank=9 \
  --status=info_disclosure_required \
  --received-at=YYYY-MM-DD \
  --responder='송파구 담당부서' \
  --response-note='전자공개 불가, 정보공개청구 또는 방문열람 필요' \
  --write
```

## 3. 회신 입력 후 바로 실행

```bash
node scripts/process-high-blocking-response-workflow.mjs
```

dry-run 결과가 의도와 맞을 때만:

```bash
node scripts/process-high-blocking-response-workflow.mjs --write
```

## 4. 입력 후 다시 볼 파일

현장 입력 후:

- [analysis/fieldwork-observation-notebook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/fieldwork-observation-notebook.md)
- [analysis/focus-project-pair-comparison-template.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-template.md)
- [analysis/focus-project-pair-comparison-starter.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-starter.md)
- [analysis/focus-project-pair-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-pair-comparison-board.md)
- [analysis/focus-project-fieldwork-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/focus-project-fieldwork-cockpit.md)
- [analysis/weekly-monitoring-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-comparison-board.md)
- [analysis/life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)

회신 입력 후:

- [analysis/high-blocking-filing-tracker.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-tracker.md)
- [analysis/high-blocking-response-intake-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-response-intake-guide.md)
- [analysis/high-blocking-filing-checklist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-filing-checklist.md)
- [analysis/project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md)

## 5. 최소 권장 실행 순서

1. 장미1,2,3차 또는 잠실우성4차 현장 입력 1건부터 넣는다.
2. 같은 날 압구정3 또는 한양연립을 넣어 생활권 간 체감 차이를 한 번 만든다.
3. 같은 날 관찰 2건이 들어오면 `focus-project-pair-comparison-starter`에서 해당 조합 메모를 바로 채운다.
4. pair-comparison을 구조화로 남기려면 `record-focus-project-pair-comparison.mjs --pair-id=... --visited-at=YYYY-MM-DD --status=draft --fieldwork-delta='...' --judgment-shift='...' --not-closed-reason='...' --write --refresh`를 실행한다.
5. 회신이 들어오면 해당 rank에만 먼저 `record-high-blocking-response`를 실행한다.
6. workflow dry-run으로 decision 초안을 확인한 뒤에만 `--write`로 반영한다.
