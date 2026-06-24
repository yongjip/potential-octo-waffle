# Domain: Korea Real Estate

작성 기준: 2026-06-24 KST

이 도메인은 현재 저장소의 active domain이다. 서울 재개발·재건축, 정비사업, 공식 고시/공고, 시장 거래 데이터를 다룬다.

## 현재 범위

| 범위 | 상태 | 위치 |
| --- | --- | --- |
| 서울 재개발·재건축 우선검토 후보 | active | `analysis/`, `project-notes/` |
| 공식 원문/고시/공고 | active | `data/urban`, `data/cleanup`, `data/review` |
| 실거래·전월세·R-ONE 시장 데이터 | active | `data/market`, `analysis/market-*` |
| 확장 관심권 | active | `analysis/expansion-*`, `analysis/life-area-*` |

## Entity 기준

현재 주요 entity는 정비사업 또는 관심 사업장이다.

필수 식별자:

- rank 또는 project_id.
- 사업명.
- 자치구/법정동.
- 사업유형.
- 단계와 기준일.
- 공식 출처 경로.

## Assertion 기준

확정 assertion은 다음 중 하나가 있어야 한다.

- 공식 고시/공고 원문.
- 공식 첨부 파일과 로컬 텍스트.
- 담당부서 또는 공식 회신.
- 공식 API/CSV와 수집 기준일.

정보몽땅 사업개요, 지도 레이어, 시장 거래 데이터, 보도자료는 보조 신호로 시작한다.

## 공개 후보

공개 후보:

- 출처 메타데이터.
- 정비사업별 공개 단계와 기준일.
- 공개 원천에서 정규화한 거래/전월세 집계.
- 원문 링크와 확인 상태.

공개 제외:

- 정보공개 접수번호와 개인 계정 상태.
- 회신 전문 중 공개 가능성이 불명확한 내용.
- 개인 장기 가능성 판단, 점수, 현장 메모 원문.

## LLM 진입점

- `analysis/current-research-operating-guide.md`
- `analysis/llm-research-handoff-guide.md`
- `analysis/residual-gap-interpretation-audit.md`
- 질문 대상 `project-notes/*.md`
