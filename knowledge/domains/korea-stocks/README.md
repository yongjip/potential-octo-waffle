# Domain: Korea Stocks

작성 기준: 2026-06-24 KST

이 도메인은 한국 상장주식, ETF, 지수, 공시, 재무제표, 거래 데이터를 다루기 위한 planned domain이다.

## 목표

- 상장사별 공식 공시와 재무 데이터를 기준일별로 축적한다.
- 가격 데이터와 재무/공시 데이터를 분리한다.
- 개인 관심/관찰 판단은 factual data와 분리한다.
- 공개 가능한 정규화 데이터셋 후보를 처음부터 라이선스 기준으로 관리한다.

## Entity 후보

| Entity | 예시 필드 |
| --- | --- |
| security | ticker, isin, market, listing_date, name |
| company | legal_name, corp_code, sector, fiscal_year_end |
| filing | filing_id, filing_type, filed_at, period_end |
| financial_statement | period, currency, unit, account, value |
| price_observation | date, open, high, low, close, volume, adjusted_flag |
| thesis_note | private_status, hypothesis, evidence, next_check |

## 출처 후보

실제 수집 전에는 출처별 이용약관과 재배포 가능 범위를 확인한다.

| 출처 유형 | 용도 | 공개 데이터 주의 |
| --- | --- | --- |
| 공식 공시 | 사업보고서, 분기보고서, 주요사항보고서 | 원문 링크와 추출 필드 분리 |
| 거래소/공식 통계 | 상장정보, 지수, 거래 통계 | 재배포 조건 확인 |
| 회사 IR | 실적발표, 프레젠테이션 | 원문 재배포보다 링크/메타데이터 우선 |
| 가격 데이터 | 일봉/분봉/수정주가 | 공급자 라이선스 확인 전 공개 금지 |

## LLM 규칙

- 투자 추천을 하지 않는다.
- 가격 데이터 기준일을 반드시 표시한다.
- 재무 수치는 회계기간, 연결/별도, 단위, 통화를 같이 쓴다.
- 공시 원문과 개인 해석을 분리한다.
