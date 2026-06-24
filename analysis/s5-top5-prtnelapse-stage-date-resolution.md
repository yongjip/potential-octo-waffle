# 상위 5개 조합설립 단계일자 보강

작성 기준: 2026-06-23 KST

## 결론

정보몽땅 `추진경과` 공식 HTML을 내려받아 잠실5, 압구정2, 잠실우성, 은마, 장미의 추진위원회 승인일, 조합설립인가일, 최신 공개 동의율을 확인했다. `S5-0001`부터 `S5-0061`까지 남아 있던 상위 5개 사업장의 단계일자 공란은 `stage-date-overrides`로 보강한다.

## 수집 원문

- 구조화 결과: `data/cleanup/prtnelapse-stage-dates.json`
- 요약표: `data/cleanup/prtnelapse-stage-dates.md`
- 원문 HTML:
  - `data/cleanup/prtnelapse-stage-html/1-710100002002Y42-prtnelapse.html`
  - `data/cleanup/prtnelapse-stage-html/2-680900000762A92-prtnelapse.html`
  - `data/cleanup/prtnelapse-stage-html/3-710100002006X76-prtnelapse.html`
  - `data/cleanup/prtnelapse-stage-html/4-680100002017E89-prtnelapse.html`
  - `data/cleanup/prtnelapse-stage-html/5-710900000615u63-prtnelapse.html`

## 확정값

| 후보 | 사업장 | 추진위 승인일 | 조합설립인가일 | 최신 공개 동의율 | 공식 URL |
| --- | --- | --- | --- | --- | --- |
| 1 | 잠실5단지아파트 주택재건축정비사업조합 | 2003-12-29 | 2013-12-19 | 100% | https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710100002002Y42&bsnsPk=11710-100002002 |
| 2 | 압구정아파트지구 특별계획구역② 재건축정비사업조합 | 2020-11-06 | 2021-04-12 | 92.45% | https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=680900000762A92&bsnsPk=11680-900000762 |
| 3 | 잠실우성아파트 재건축정비사업조합 | 2006-10-04 | 2021-06-11 | 98.76% | https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710100002006X76&bsnsPk=11710-100002006 |
| 4 | 은마아파트 재건축정비사업조합 | 2003-12-31 | 2023-09-26 | 96.35 | https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=680100002017E89&bsnsPk=11680-100002017 |
| 5 | 장미1,2,3차아파트 주택재건축정비사업 조합 | 2016-06-28 | 2020-03-24 | 94.10 | https://cleanup.seoul.go.kr/cafe/mainIndx/cleanup-prtnelapse/vscr.do?cafeId=710900000615u63&bsnsPk=11710-900000615 |

## 판정 기준

`조합설립인가일`은 조합설립인가 섹션에서 최초 `[(변경)인가]` 이벤트를 사용했다. `stage_consent_rate_pct_public`은 같은 조합설립인가 섹션에서 공개된 최신 동의율을 사용했다. `추진위원회 승인일`은 조합설립추진위원회승인 섹션에서 최초 `[(변경)승인]` 이벤트를 사용했다.

잠실5처럼 최신 변경인가 동의율이 여러 차례 갱신된 사업장은 비교표에 최신 공개 동의율을 넣고, 최초 조합설립인가 동의율은 원문 HTML과 구조화 결과에 남긴다.
