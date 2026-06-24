# Knowledge Base

작성 기준: 2026-06-24 KST

이 폴더는 개인 knowledge base의 도메인 설계, 스키마, 공개 데이터 정책을 담는다. 실제 원자료와 분석 산출물은 기존 위치를 유지한다.

## 현재 구조

```text
knowledge/
  README.md
  domain-registry.json
  open-data-governance.md
  domains/
    korea-real-estate/
    korea-stocks/
    us-stocks/
  schemas/
  templates/
```

## 저장소 내 역할 분리

| 위치 | 역할 |
| --- | --- |
| `INSTRUCTIONS.md` | 에이전트가 먼저 읽는 canonical instruction entrypoint |
| `instructions/` | evidence policy, workflow, self-correction, domain prompts |
| `knowledge/` | 도메인 정의, 스키마, 공개 기준 |
| `data/` | 원천 자료, 수동 intake, 정규화 데이터 |
| `analysis/` | 파생 분석, 감사표, 실행 보드 |
| `project-notes/` | 개별 entity/사업장 메모 |
| `scripts/` | 수집, 정규화, 검증, 재생성 |

## KB 단위

| 단위 | 설명 | 예시 |
| --- | --- | --- |
| domain | 큰 지식 영역 | `korea-real-estate`, `korea-stocks`, `us-stocks` |
| source | 데이터 출처 | 서울시, 국토교통부, 거래소, SEC |
| dataset | 같은 스키마의 데이터 묶음 | 실거래 CSV, 공시 filing, 가격 일봉 |
| entity | 관찰 대상 | 정비사업, 종목, ETF, 지수 |
| observation | 특정 시점의 관측값 | 2026-06-24 기준 단계, 2025 사업보고서 매출 |
| assertion | 출처로 확인한 사실 | 고시번호, 상장시장, 재무 수치 |
| analysis | 계산/해석 | 리스크 점수, 밸류에이션, 모멘텀 |
| decision | 개인 판단 | 관찰 유지, 보류, 추가 확인 |

## 도메인 추가 절차

1. `knowledge/domain-registry.json`에 도메인을 추가한다.
2. `knowledge/domains/<domain>/README.md`를 만든다.
3. source, entity, observation, assertion의 기준 필드를 정한다.
4. 공개 가능 데이터와 비공개 메모의 경계를 정한다.
5. 필요한 intake와 doctor 검증을 추가한다.
6. `instructions/domain-prompts/<domain>.md`를 추가한다.

## LLM 사용 규칙

- LLM에는 도메인 README, 관련 source registry, 질문 대상 entity 메모, assertion/observation 일부만 준다.
- 전체 `data/`나 전체 `analysis/`를 한 번에 주지 않는다.
- 답변에는 `확정`, `보류`, `보조 신호`, `다음 확인`을 분리한다.
- 금융 도메인에서는 가격 전망이나 매수/매도 판단을 확정적으로 쓰지 않는다.
