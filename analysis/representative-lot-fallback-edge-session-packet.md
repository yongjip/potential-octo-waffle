# Representative Lot Fallback Edge Session Packet

작성 기준: 2026-06-24 KST

이 문서는 Edge 브라우저에서 `representative_lot_fallback_only` 6건의 `presentSn`를 직접 확인할 때 바로 쓰는 실행 패킷이다. 목표는 현재 단계를 다시 판정하는 것이 아니라, 같은 필지의 UQ120 후보 중 어느 항목이 current business인지 식별하는 것이다.

## 세션 요약

- 대상 사업장: 0
- same-stage candidate: 0
- stage-gap candidate: 0
- API strong same-stage: 0
- API stage-gap hold: 0
- 공통 확인값: `presentSn`, `데이터 기준일`, `사업유형`, `정보몽땅 연결 URL`

## 먼저 열 파일

1. [representative-lot-fallback-command-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-command-packet.md): today 기준 copy-ready 기록 명령, confirmed_current_business면 auto-mark까지 포함
2. [representative-lot-fallback-api-probe.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-api-probe.md): API 기준 strong candidate와 hold 후보를 먼저 확인
3. [representative-lot-fallback-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-workbook.md): direct notice 기준 현재 단계와 보류 사유
4. [representative-lot-fallback-identifier-closure-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-identifier-closure-workbook.md): 대표지번, PNU, UQ120 후보명, 채택 규칙
5. [project-comparison-matrix.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/project-comparison-matrix.md): 현재 정합성 상태와 다음 액션
6. [current-research-operating-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/current-research-operating-guide.md): 전체 운영 우선순위
7. [representative-lot-fallback-finding-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-finding-board.md): 확인 결과 기록 상태와 승격/보류 보드

## 확인 순서

1. 먼저 `node scripts/fetch-representative-lot-fallback-api-probe.mjs`와 `node scripts/generate-representative-lot-fallback-api-probe.mjs`를 실행해 strong same-stage 후보가 있는지 본다.
2. `recordCode popup`을 열어 direct notice 기준 사업과 구역을 다시 고정한다.
3. 같은 위치에서 대표지번/PNU 기준 UQ120 후보를 찾는다.
4. `presentSn`, `데이터 기준일`, `사업유형`이 같이 보이면 채택 조건과 비교한다.
5. `same-stage`면 current business 후보로 승격 검토, `stage-gap`면 보류 이유를 유지한다.
6. 가능하면 `node scripts/record-representative-lot-fallback-finding.mjs --rank=NN --checked-at=YYYY-MM-DD --check-status=... --prefill-from-api --write --refresh --auto-mark-applied`로 결과를 먼저 남긴다.
7. auto-mark가 닫히지 않은 confirmed_current_business만 `node scripts/mark-representative-lot-fallback-finding-applied.mjs --rank=NN --checked-at=YYYY-MM-DD --write --refresh`로 마무리한다.
8. 확인 후 [representative-lot-fallback-workbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/representative-lot-fallback-workbook.md)와 각 사업 메모를 갱신하고 전체 재생성을 돌린다.

## 대상 한눈표

_없음_



## 운영 원칙

- `presentSn` 하나만 보여도 바로 current business로 확정하지 않는다. `데이터 기준일`과 `사업유형`을 같이 본다.
- `stage-gap candidate`는 같은 필지 후보라도 direct notice보다 앞 단계면 보류를 유지한다.
- 확인값이 없거나 planning 계열만 보이면 기존 `representative_lot_fallback_only` 상태를 그대로 둔다.
- 세션 종료 후에는 관련 보드를 먼저 갱신하고 마지막에 `node scripts/regenerate-research-artifacts.mjs`를 실행한다.

