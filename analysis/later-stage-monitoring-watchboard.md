# 후행 단계 모니터링 워치보드

작성 기준: 2026-06-24 KST

이 문서는 `관리처분인가`, `준공인가`, `이전고시`, `청산`처럼 후행 단계에 들어간 핵심·확장 사업장을 같은 판정 규칙으로 묶어 보는 보드다. 값 비교판과 별개로, `현재 단계 신호`, `direct official original`, `공개자료 구조`, `외부 회신 필요 여부`를 한 장에 고정한다.

기본 판정 규칙은 [later-stage-official-search-patterns.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/later-stage-official-search-patterns.md)를 따른다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 5 |
| direct 후행 원문 닫힘 | 1 |
| selected 단계와 후행 공고 병기 | 2 |
| public stage value available | 1 |
| public stage value missing | 1 |
| public disclosure exhausted | 1 |

## 상태 정의

| 상태 | 의미 | 대표 사업 |
| --- | --- | --- |
| direct_later_stage_verified | 후행 단계 원문이 direct official hit로 닫혔다. | 천호3구역 |
| selected_plus_later_notice | selected 단계는 다르거나 앞서 있지만, 후행 공식 공고가 따로 닫혀 병기 운용이 필요하다. | 천호3구역; 신동아1·2차 |
| selected_signal_only | selected 단계 표시는 있으나 direct 후행 원문은 아직 따로 안 닫혔다. | 성내미주 |
| public_stage_value_available | 관리처분/준공 공개항목에서 날짜나 비용값을 직접 확보했다. | 가락삼익맨숀 |
| public_stage_value_missing | 단계일자는 있으나 핵심 값이나 별첨 원문이 비회원 공개 경로에서 빠져 있다. | 잠실우성4차 |
| public_disclosure_exhausted | selected 단계는 보이지만 공개자료 구조와 direct original이 더 이상 안 닫힌다. | 성내미주 |
| external_response_pending | 공개 경로에서 안 닫히는 필드를 외부 회신으로 보강 중이다. | 잠실우성4차 |

## 사업장별 현재 판정

| 사업장 | 생활권 | 현재 단계 신호 | 현재 상태 | direct official closure | 공개자료 구조 | 남은 공백 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 천호3구역 | 강동권 | 정보몽땅 selected 단계는 일반분양승인. 같은 추진경과 본문에 `착공신고 2026-05-31`, 2026-04-09 관리처분(변경)인가, 2026-01-22 준공인가전 사용허가가 함께 보인다. | `direct_later_stage_verified`; `selected_plus_later_notice` | 강동구 고시 제2026-22호 `(부분)준공인가`, 강동구 고시 제2026-66호 `관리처분계획(경미한 변경)인가` 확보 | 최근 공개자료 첫 행 2026-06-24 | 정보몽땅 selected 단계 표기 갱신 여부 | selected 단계가 실제로 준공/입주 쪽으로 바뀌는지와 `착공신고 2026-05-31` 이후 추가 준공·입주 공고가 생기는지 확인 |
| 성내미주아파트 주택재건축정비사업 | 강동권 | 정보몽땅 selected 단계 `이전고시` | `public_disclosure_exhausted`; `selected_signal_only` | 강동구 direct 최신 hit은 `구보제1341호(2016-08-24)` 공사완료 고시·정비구역 변경지정, `구보제1235호(2014-09-23)` 사업시행(변경)인가까지 | 청산위원회 `조합청산(222)` 1건, direct 공개 page는 `등록된 공개자료가 없습니다.` | `이전고시` direct original 미확보 | 정보몽땅 최근 공개자료와 자료열람에 이전/준공 관련 식별자가 새로 생기는지 우선 확인 |
| 신동아1·2차아파트 주택재건축 정비사업 | 강동권 | 정보몽땅 selected 단계 `준공인가` | `selected_plus_later_notice` | 공개 추진경과에 2024-10-10 준공인가, 2024-10-16 인가고시와 2025-04-24 관리처분(변경)인가 visible 값 확보 | 최근 공개자료 상단에 2026년 5월 공정확인서, 자금 입출금 내역 존재 | 준공 이후 direct official latest를 별도 더 닫았는지 미확인 | 준공 이후 공개항목과 월별 공정/자금 자료를 유지하면서 direct official 추가 공고 존재 여부 재확인 |
| 잠실우성4차 주택재건축정비사업조합 | 잠실/송파 | 정보몽땅 공개항목 기준 관리처분인가일 `2025-12-31`, 고시일 `2026-01-08` | `public_stage_value_missing`; `external_response_pending` | 관리처분 인가일 자체는 공개항목 `213`과 송파구 공식 사업별 페이지로 닫힘 | 비회원 공개 경로에서는 `기타 자세한 사항은 별첨 참조`만 보이고 공사비·정비사업비·별첨 원문 미노출 | 관리처분 공사비, 총사업비, 기준일, 별첨 원문 | 송파구 새올전자민원창구 접수번호 `626590` 회신 확인 후 공사비/총사업비/기준일/자료명 기준으로만 승격 |
| 가락삼익맨숀아파트 재건축정비사업 조합 | 잠실/송파 | 정보몽땅 공개항목 기준 관리처분인가일 `2025-10-15`, 고시일 `2025-10-23` | `public_stage_value_available` | 관리처분 공개항목 `210`, `213`으로 날짜와 공사비 확보 | `정비사업비 추산액 및 조합원 부담규모 및 시기` 공개항목에서 공사비 `689,150,000,000원` 확인 | 최신 변경고시 이후 세대수·층수 같은 source_date_split 값 관리 | 최신 송파구청 페이지 현황값과 사업시행/관리처분 공개항목 시점값을 분리 유지 |

## 판독 메모

- 천호3구역은 `selected 단계 + 후행 공식 공고 병기`의 대표 사례다.
- 성내미주는 `selected 단계는 이전고시지만 public disclosure route가 사실상 소진된 경우`의 대표 사례다.
- 잠실우성4차는 후행 단계 날짜는 닫혔지만 핵심 비용값이 빠진 `public_stage_value_missing` 사례다.
- 가락삼익맨숀은 관리처분 단계 비용값까지 public item에서 확보된 `public_stage_value_available` 사례다.

## 같이 열 파일

- [later-stage-official-search-patterns.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/later-stage-official-search-patterns.md)
- [expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md)
- [management-stage-value-resolution.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/management-stage-value-resolution.md)
- [songpa-official-project-page-fact-check.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/songpa-official-project-page-fact-check.md)
- [high-blocking-next-check-session-packet.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/high-blocking-next-check-session-packet.md)
