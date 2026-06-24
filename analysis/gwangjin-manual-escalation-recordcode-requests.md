# 광진권 recordCode 수동 확인 요청 패킷

작성 기준: 2026-06-23 KST

서울도시공간포털 사업구역 레이어와 정비사업 정보몽땅 사업개요에서는 확인되지만, 서울도시공간포털 고시 API·광진구청 고시공고 검색·정보몽땅 공정 페이지 자동 수집에서 본고시 URL/recordCode가 확인되지 않은 사업장이다. 자동 검색을 반복하기보다 광진구 주거사업과 또는 정보몽땅 담당 창구에 원문 번호를 확인해야 한다.

## 대상

| 순위 | 사업 | 확인된 공식 보조근거 | 미확인 키 | 자동 검색 결론 |
| --- | --- | --- | --- | --- |
| 23 | 광장동 삼성1차아파트 소규모재건축정비사업 | 정보몽땅 조합설립인가 HTML; 서울도시공간포털 사업구역 레이어 | 조합설립인가/지형도면 고시번호, 고시일, recordCode, PDF URL | 직접 후보 0건. `소규모재건축` 저신뢰 후보는 모두 타 사업장 |
| 28 | 자양번영로3나길 일대 가로주택정비사업 | 정보몽땅 조합설립인가 HTML; 서울도시공간포털 사업구역 레이어 | 조합설립인가/지형도면 고시번호, 고시일, recordCode, PDF URL | 직접 후보 0건. `자양번영로` 후보는 리모델링주택조합 등 타 사업장 |

## 공식 보조근거

| 순위 | 항목 | 값 |
| --- | --- | --- |
| 23 | 정보몽땅 사업장 | https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=j15171517 |
| 23 | 정보몽땅 조합설립인가 | https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=215900000929v34&othbcIemSn=200 |
| 23 | 서울도시공간포털 presentSn | 11000UQ120PS202505310789 |
| 23 | 레이어 구역명/면적 | 광장동 삼성1차아파트 소규모재건축사업 / 7,653㎡ |
| 23 | 조합설립 인가일 | 2023-07-10 |
| 28 | 정보몽땅 사업장 | https://cleanup.seoul.go.kr/cafe/mainIndx.do?cafeUrl=jayang588-22 |
| 28 | 정보몽땅 조합설립인가 | https://cleanup.seoul.go.kr/service/opendata/cafeOthbc/vscrCafe.do?cafeId=215900001146M77&othbcIemSn=200 |
| 28 | 서울도시공간포털 presentSn | 11000UQ120PS202505310180 |
| 28 | 레이어 구역명/면적 | 자양번영로3나길 일대 가로주택정비사업 / 2,307.5㎡ |
| 28 | 조합설립 인가일 | 2023-11-15 |

## 확인 요청 문안

광진구 주거사업과에 아래 두 사업의 조합설립인가 또는 지형도면 고시 원문을 확인 요청한다.

1. 광장동 삼성1차아파트 소규모재건축정비사업
   - 위치: 광진구 광장동 561 일대
   - 정보몽땅 cafeId: 215900000929v34
   - 확인 필요: 조합설립인가/변경인가 고시번호, 고시일, 고시공고 URL, 첨부 PDF/HWP, 서울도시공간포털 noticeCode/recordCode

2. 자양번영로3나길 일대 가로주택정비사업
   - 위치: 광진구 자양동 588-22 외 일대
   - 정보몽땅 cafeId: 215900001146M77
   - 확인 필요: 조합설립인가/변경인가 고시번호, 고시일, 고시공고 URL, 첨부 PDF/HWP, 서울도시공간포털 noticeCode/recordCode

## 근거 산출물

- `analysis/gwangjin-original-notice-candidates.md`: 서울도시공간포털 직접 후보 0건
- `analysis/source-link-official-probe.md`: 공식 검색 저신뢰 후보 격리
- `analysis/recordcode-dead-end-audit.md`: 사업구역 레이어는 있으나 recordCode 미연결
- `data/cleanup/gwangjin-stage-public-docs.csv`: 정보몽땅 조합설립인가 표 추출
- `project-notes/23-j15171517.md`
- `project-notes/28-jayang588-22.md`
