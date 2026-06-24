# 후행 단계 공식 원문 탐색 패턴

작성 기준: 2026-06-24 KST

이 문서는 `이전고시`, `준공인가`, `관리처분인가 이후 변경`, `청산`처럼 후행 단계에 들어간 정비사업의 공식 원문을 찾을 때 공통으로 적용할 판독 규칙을 고정한다. 핵심은 `현재 단계 신호`와 `직접 공식 원문 클로저`를 분리하는 것이다.

## 결론

- `정비사업 정보몽땅`의 selected 단계는 현재 상태를 읽는 신호로 쓸 수 있지만, 그 자체가 원문 확보를 뜻하지는 않는다.
- `서울도시공간포털 mapForm.pop?noticeCode=...`는 식별자 참조로만 쓰고, 단독 공개 진입 URL로는 쓰지 않는다.
- 후행 단계 원문은 먼저 자치구 공식 고시공고 direct hit를 찾고, 그다음 정보몽땅 공개자료 구조와 추진경과, 마지막으로 기존 고시 원문의 `과거 고시 체인 문구`를 읽어 성격을 분류한다.
- 최신 단계가 `이전고시`로 보이더라도, 공개자료 구조가 `조합청산(222)`만 있고 direct page가 `등록된 공개자료가 없습니다.`이면 현재 공개 경로에서는 direct original이 닫히지 않은 상태로 유지한다.

## 우선 판정 규칙

| 규칙 | 어떻게 읽는가 | 지금 사례 |
| --- | --- | --- |
| selected stage와 원문 확보를 분리 | `현재 단계: 이전고시`는 단계 신호다. direct official original이 따로 있어야 확정 근거가 된다. | 성내미주 |
| `mapForm.pop`는 식별자 참조 | noticeCode는 원문 후보를 가리키는 식별자일 수 있지만, 단독 공개 URL로 그대로 채택하지 않는다. | 한양연립, 성내미주 |
| 나중 고시의 과거 고시 나열은 분류가 먼저 | 열거된 과거 고시가 `정비구역 지정/변경지정` 체인인지, `관리처분` 체인인지, `준공/이전` 체인인지 본문 문구로 분류한다. | 성내미주 |
| 공개자료 구조가 비어 있으면 공개 경로 소진으로 본다 | `청산위원회 -> 조합청산(222)`만 있고 0건이면 public disclosure route는 당장 더 못 닫는다고 본다. | 성내미주 |
| 최신 확정은 direct official hit 우선 | 자치구 고시공고나 구보 원문이 직접 잡히면 그 날짜와 번호를 최신성 기준으로 둔다. | 천호3구역 |

## 탐색 순서

| 순서 | 확인처 | 확인 포인트 | 채택 기준 | 보류 기준 |
| --- | --- | --- | --- | --- |
| 1 | 자치구 공식 고시공고 / 구보 | 사업명, 단계명, 고시번호, 고시일, 첨부 | 제목과 본문이 사업·단계를 직접 닫음 | 검색 0건, 무관 문서만 존재 |
| 2 | 서울도시공간포털 정비사업구역계 / noticeCode | direct hit 여부, noticeCode 식별자, 과거 제목 | direct hit이 현재 사업과 단계에 맞음 | `mapForm.pop` 식별자만 있고 공개 진입이 안 됨 |
| 3 | 정비사업 정보몽땅 사업장 상세 | selected 단계, 최근 공개자료, 추진경과 | 현재 단계 신호와 공개 구조 파악 | 단계만 있고 원문/첨부가 없음 |
| 4 | 정보공개 자료열람 구조 | 대분류, 소분류, direct 공개 page 문서 수 | 공개 소분류와 실제 문서 존재 확인 | 소분류 1건뿐이거나 `등록된 공개자료가 없습니다.` |
| 5 | 이미 확보한 공식 원문 본문 | 과거 고시 인용 문구, 체인 성격 | 후행 단계를 직접 가리키는 문구 확보 | 사실상 `정비구역 지정/변경지정` 같은 다른 체인으로 묶임 |
| 6 | 추정 archive path / 부가 경로 | PDF/HWP direct path 존재 여부 | 실제 응답과 파일 확보 | 404 또는 접근 차단 |

## 사례 1: positive signal은 있으나 direct entry는 식별자만 있는 경우

`analysis/s3-hanyanggaro-official-source-search.md`에는 서울도시공간포털 과거 검색 결과로 아래 2건이 남아 있다.

- `한양연립주택재건축정비사업 이전고시` (`2005-03-07`, noticeCode `11000NTC200503077823`)
- `유한?한양연립주택재건축 정비사업조합 이전고시` (`2009-03-26`, noticeCode `11000NTC200903263081`)

이 값은 `이전고시` 문자열이 official search result 안에 존재한다는 점에서는 유효하다. 다만 이 둘은 현 `한양연립 일대 가로주택정비사업`과 동일 사업으로 바로 승격하지 않았고, `mapForm.pop`만으로는 direct public original을 닫지 않았다. 따라서 현재 운영에서는 `과거 재건축 후보 식별자` 수준으로만 둔다.

## 사례 2: 단계 신호는 `이전고시`지만 direct original은 아직 미확보인 경우

성내미주는 2026-06-24 KST 기준으로 `정비사업 정보몽땅` 사업장 상세에서 selected 단계가 `이전고시`다. 그러나 같은 날짜 확보 기준으로 공개자료 구조는 아래와 같았다.

- 대분류: `공통사항(382)`, `청산(381)`
- 소분류: `조합청산(222)` 1건
- direct 공개 page: `등록된 공개자료가 없습니다.`

또한 `추진경과` HTML에는 `이전고시` 섹션 이름은 있으나 visible dated item이 직접 드러나지 않았다. 강동구 direct 공식 최신 hit도 `구보제1341호` (`2016-08-24`, 공사완료 고시·정비구역 변경지정)와 `구보제1235호` (`2014-09-23`, 사업시행(변경)인가)까지만 닫혔다.

추가로 `강동구 제2016-123호` 첫머리는 과거 고시 연쇄를 `변경지정 된 성내미주아파트 주택재건축정비구역`으로 묶고 있어, 현재 확보된 direct 체인은 `이전고시`가 아니라 `정비구역 지정/변경지정` 계열로 읽는 편이 맞다. 따라서 현재 판정은 `이전고시 signal verified / original not secured`다.

## 판독 메모

- `준공인가`, `부분준공인가`, `관리처분계획인가(변경)`는 후행 단계라도 direct official 제목이 바로 최신성 근거가 될 수 있다.
- `청산`, `이전고시`는 정보몽땅 selected 단계가 먼저 보이고 direct original이 늦게 닫히는 경우가 있다.
- 사업장 상세의 `최근 공개자료` 상단 문서들이 모두 과거 연도에 머물러 있으면, selected 단계와 public disclosure freshness를 분리해서 적는다.
- direct original이 안 닫힌 상태에서 숫자나 단계를 비교표 확정값으로 밀어 넣지 않는다.

## 기록할 때 남길 필드

1. 확인 시각
2. 사업명
3. 단계 신호 출처와 표시값
4. direct official hit 여부
5. 고시번호 / 고시일 / 제목 / 첨부명
6. 공개자료 구조와 문서 수
7. 체인 문구 해석
8. `signal verified`, `direct hit verified`, `original not secured`, `public disclosure exhausted` 중 현재 상태

## 연결 문서

- [current-research-operating-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/current-research-operating-guide.md)
- [official-update-runbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-update-runbook.md)
- [s3-hanyanggaro-official-source-search.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/s3-hanyanggaro-official-source-search.md)
- [seongnaemiju-official-chain-note.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/seongnaemiju-official-chain-note.md)
