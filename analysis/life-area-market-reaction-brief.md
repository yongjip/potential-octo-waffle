# 생활권 시장 반응 브리프

작성 기준: 2026-06-24 KST

이 문서는 핵심 3생활권과 확장 2권역을 시장 데이터 기준으로 어디까지 같은 판에서 읽을 수 있는지 정리한 generated 브리프다. 공식 원문이 직접 근거이고, 시장 데이터는 그 위에 얹는 보조신호라는 원칙을 유지한다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 핵심 생활권 시장 커버 | 3 / 3 |
| 확장 관심권 시장 커버 | 2 / 2 |
| 확장 관심권 부분 커버 | 0 |
| 확장 관심권 시장 공백 | 0 |
| 확장 관심권 후보 법정동 | 6 |
| 현재 시장 manifest 법정동 | 13 |
| 정규화 거래/전월세 행 | 108161 |
| 최신 계약일 | 20260619 |
| 확장권 중복제거 거래 행 | 10999 |
| 확장권 최신 계약일 | 20260618 |

핵심 3생활권은 이미 시장 보조신호를 붙여 읽을 수 있다. 확장 관심권도 이제 `analysis/expansion-market-normalized-summary.md` 기준으로 latest-window baseline 거래가 모두 들어온 상태다. 다만 이 값은 아직 latest-window 중심 baseline이며, backfill과 단계 재확인을 분리해서 읽어야 한다.

## 핵심 생활권 시장 읽기

| 생활권 | 중복제거 행 | 매매 | 전월세 | 중위 매매 ㎡당(만원) | 최신 계약일 | 현재 입장 |
| --- | --- | --- | --- | --- | --- | --- |
| 강남 | 23070 | 7185 | 15885 | 3509.6 | 20260616 | 조건 해석 우선 |
| 잠실/송파 | 35681 | 16961 | 18720 | 1998.8 | 20260619 | 장기 잠재 강함, 리스크 분리 필요 |
| 구의/광진 | 31728 | 15230 | 16498 | 1457.3 | 20260619 | 원문·단계 확정 우선 |

### 핵심 생활권 해석 원칙

- 강남: 가격 강도 자체보다 비용·공공기여·이주 부담을 감내할 수 있는지 읽는 보조신호다.
- 잠실/송파: 거래층은 가장 두껍지만 잠실 핵심축과 송파 배후축을 분리해서 봐야 한다.
- 구의/광진: 생활권 거래층이 넓다는 사실은 후보 유지 근거가 될 수 있지만, 원문 병목을 덮지는 못한다.

## 확장 관심권 시장 baseline 상태

| 확장권 | 시장 상태 | 필요 법정동 | 현재 manifest | 정규화 거래 행 | 현재 운영 상태 |
| --- | --- | --- | --- | --- | --- |
| 강동권 | covered | 천호동, 성내동, 길동 | 천호동, 성내동, 길동 | 6907 | confirmed 비교 가능 |
| 약수동 주변 | covered | 신당동, 금호동, 옥수동 | 신당동, 금호동, 옥수동 | 4623 | confirmed 비교 가능 |

## 확장 관심권 시장 시그널

| 확장권 | 중복제거 행 | 매매 | 전월세 | 중위 매매 ㎡당(만원) | 중위 보증금(만원) | 중위 월세(만원) | 최신 계약일 | 현재 운영 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 강동권 | 6611 | 2551 | 4060 | 1016.2 | 17000 | 48 | 20260615 | confirmed 비교 가능 |
| 약수동 주변 | 4388 | 1617 | 2771 | 1965.6 | 50000 | 130 | 20260618 | confirmed 비교 가능 |

### 왜 아직 core 비교점수에 바로 섞으면 안 되는가

- 강동권: 잠실 동측 연장축 direct hit 여부를 보려면 천호·성내·길동 거래 비교군이 필요하다.
- 약수동 주변: 약수역 생활권은 신당·금호·옥수의 경사형 도심-강남 중간축 비교군이 필요하다.
- 현재 확장권 정규화 거래는 천호동, 성내동, 길동; 신당동, 금호동, 옥수동까지 모두 들어 있다. 다만 latest-window 중심 baseline이라 장기 추세와 project-level 가격 해석을 바로 확정하면 과대해석이 된다.

## 확장 관심권 다음 수집 단계

| 확장권 | 현재 공백 | 다음 시장 작업 |
| --- | --- | --- |
| 강동권 | 서울도시공간포털 shortlist·원문 비교값·단계 추적 보드까지는 연결됐지만, 강동구 고시공고와 정보몽땅 최신 단계 재확인은 아직 수동 루프로 남아 있다. | latest-window baseline이 모두 들어왔다. backfill과 해석 규칙 분리를 유지하면서 stage recheck와 함께 읽는다. |
| 약수동 주변 | adjacent 3건의 원문 비교값과 이미지 재대조는 닫혔지만, 중구 고시공고와 약수권 direct hit 자동 루프는 아직 없다. | latest-window baseline이 모두 들어왔다. backfill과 해석 규칙 분리를 유지하면서 stage recheck와 함께 읽는다. |

## 지금 읽는 순서

1. 핵심 생활권 시장 신호는 [analysis/market-transaction-signal-summary.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/market-transaction-signal-summary.md)에서 확인한다.
2. 핵심/확장 통합 비교 문장은 [analysis/life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)를 기준으로 유지한다.
3. 강동권·약수권은 [analysis/expansion-zone-weekly-monitoring-cockpit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-weekly-monitoring-cockpit.md)와 [analysis/expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)를 먼저 본다.
4. 확장권 법정동을 시장 scope에 붙일 때는 `analysis/expansion-market-scope-workbook.md`와 `data/market/expansion-market-areas.json`를 먼저 갱신하고, 그다음 core chain 병합 여부를 판단한다.

## 해석 경계

1. 시장 데이터는 공식 원문이 아니다. 단계, 고시번호, 고시일, 공사비, 분담금, 기준일을 대체하지 못한다.
2. 확장권 시장 baseline 커버는 `핵심 생활권과 동일 조건`이라는 뜻이 아니다. latest-window 중심 baseline과 공식 단계 재확인을 분리해서 읽어야 한다.
3. 강동권은 latest stage gap이 남아 있으므로, 시장 숫자가 들어와도 단계 재확인보다 앞설 수 없다.
4. 약수권은 adjacent baseline 운영 상태라서, direct hit 후보가 생기기 전까지는 시장 데이터가 들어와도 보조 축으로만 읽는다.
