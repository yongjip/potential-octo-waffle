# Domain: US Stocks

작성 기준: 2026-06-24 KST

이 도메인은 미국 상장주식, ETF, SEC filings, 재무제표, 가격 데이터를 다루기 위한 planned domain이다.

## 목표

- SEC filing 기반 factual layer를 만든다.
- ticker 변경, CIK, 상장시장, share class를 안정적으로 추적한다.
- 가격/재무/공시/개인 thesis를 분리한다.
- 공개 가능한 데이터셋은 라이선스와 재배포 조건을 먼저 확인한다.

## Entity 후보

| Entity | 예시 필드 |
| --- | --- |
| issuer | cik, legal_name, sic, fiscal_year_end |
| security | ticker, exchange, cusip_optional, share_class |
| filing | accession_number, form_type, filed_at, period_end |
| fact | taxonomy, concept, unit, value, period_start, period_end |
| price_observation | date, open, high, low, close, volume, adjusted_flag |
| thesis_note | private_status, hypothesis, evidence, next_check |

## 출처 후보

| 출처 유형 | 용도 | 공개 데이터 주의 |
| --- | --- | --- |
| SEC EDGAR | filings, company facts | 출처/수집일/CIK 유지 |
| 회사 IR | earnings release, presentation | 원문 링크 중심 |
| 거래소/참조 데이터 | listing, ticker metadata | 라이선스 확인 |
| 가격 데이터 | 일봉/거래량 | 공급자 라이선스 확인 전 공개 금지 |

## LLM 규칙

- 투자 추천을 하지 않는다.
- filing form, filed date, period end를 분리한다.
- non-GAAP 수치와 GAAP 수치를 섞지 않는다.
- ticker만으로 issuer를 확정하지 않고 CIK 또는 공식 식별자를 확인한다.
