# Representative Lot Fallback Identifier Closure Workbook

작성 기준: 2026-06-24 KST

이 문서는 `representative_lot_fallback_only` 6건에 대해 `presentSn`를 닫기 위한 수동/API 확인용 워크북이다. 직접 고시 기준 단계는 이미 잠겨 있으므로, 여기서는 `대표지번 / PNU / UQ120 후보명 / 채택 조건`만 분리해서 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 0 |
| same-stage candidate | 0 |
| stage-gap candidate | 0 |
| UQ120 복수 후보 | 0 |
| probe relation 분포 |  |
| 생활권 분포 |  |

## 판정 규칙

- `presentSn`는 `same-stage UQ120` 응답과 `데이터 기준일`이 같이 잡힐 때만 current business로 올린다.
- `정비계획 수립`처럼 direct notice보다 앞 단계만 보이면 후보로는 남기되 현재 사업 식별자로 확정하지 않는다.
- `신속통합기획`, `기획완료`, 다른 특별계획구역 이름이 섞이면 같은 필지라도 별도 레이어로 본다.

## 사업장별 식별자 클로저 큐

_없음_

## 수동/API 프로브 계획

_없음_

## 참고

- 로컬 helper: `scripts/fetch-map-missing-business-layer-details.mjs`
- 먼저 열 파일: `analysis/representative-lot-fallback-workbook.md`, `project-notes/*.md`, 직접 고시 `urban_map_url`
- 확인 후 갱신 대상: `analysis/project-comparison-matrix.md`, `analysis/representative-lot-fallback-workbook.md`, 각 `project-note`
