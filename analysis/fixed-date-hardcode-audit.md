# 고정 날짜 하드코딩 감사

작성 기준: 2026-06-24 KST

이 문서는 생성 스크립트 안에 남아 있는 KST 날짜 하드코딩을 찾고, 현재 리서치 운영 문서에 얼마나 직접 영향을 주는지 우선순위로 정리한다. 이벤트 날짜나 공식 고시일이 아니라, 생성 시점에 따라 바뀌어야 하는 문서 날짜 하드코딩만 대상으로 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 하드코딩 스크립트 | 12 |
| 재생성 체인 연결 | 0 |
| 운영 가이드 직접 참조 | 0 |
| 개인 홈 직접 참조 | 0 |
| 현재 stale 출력 감지 | 6 |
| 우선순위 분포 | P2 12 |

## 우선 처리

_없음_

## 전체 목록

| 우선 | 스크립트 | 재생성 단계 | 유형 | 날짜 | 라인 | 출력 수 | stale 출력 | 가이드 | 홈 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P2 | scripts/probe-cleanup-process-pages.mjs | none | date_constant | 2026-06-23 KST | 14 | 3 | 1 | N | N |
| P2 | scripts/probe-gangnam-songpa-notices.mjs | none | literal_heading | 2026-06-23 KST | 381 | 4 | 1 | N | N |
| P2 | scripts/probe-gwangjin-original-notice-candidates.mjs | none | date_constant | 2026-06-23 KST | 11 | 3 | 1 | N | N |
| P2 | scripts/probe-hanyanggaro-official-source.mjs | none | date_constant | 2026-06-23 KST | 9 | 2 | 1 | N | N |
| P2 | scripts/probe-macheon-original-notice-candidates.mjs | none | date_constant | 2026-06-23 KST | 11 | 3 | 1 | N | N |
| P2 | scripts/probe-source-link-officials.mjs | none | date_constant | 2026-06-23 KST | 18 | 3 | 1 | N | N |
| P2 | scripts/fetch-cleanup-prtnelapse-stage-dates.mjs | none | literal_heading | 2026-06-23 KST | 216 | 3 | 0 | N | N |
| P2 | scripts/fetch-high-blocking-public-web-probe.mjs | none | date_constant | 2026-06-23 KST | 8 | 0 | 0 | N | N |
| P2 | scripts/fetch-r-one-statistics.mjs | none | date_constant | 2026-06-23 KST | 6 | 1 | 0 | N | N |
| P2 | scripts/fetch-rtms-manual-tasks.mjs | none | date_constant | 2026-06-23 KST | 14 | 0 | 0 | N | N |
| P2 | scripts/fetch-seoul-open-data-manual-tasks.mjs | none | date_constant | 2026-06-23 KST | 12 | 0 | 0 | N | N |
| P2 | scripts/sync-market-manual-download-intake.mjs | none | date_constant | 2026-06-23 KST | 8 | 0 | 0 | N | N |

## 읽는 법

- `P0`: 개인 홈 또는 현재 운영 가이드에서 직접 읽는 문서를 만들면서 regenerate 체인에도 연결된 스크립트
- `P1`: regenerate 체인에는 걸려 있거나 운영 문서 참조는 있지만 직접 핵심 허브는 아닌 스크립트
- `P2`: 보조 진단/탐침/일회성 보고서 성격이 강한 스크립트
- `stale 출력`은 출력 파일 앞부분에서 같은 날짜가 실제로 남아 있는 경우만 센다.
