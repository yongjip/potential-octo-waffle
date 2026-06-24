# LLM 리서치 핸드오프 가이드

작성 기준: 2026-06-24 KST

이 문서는 성능이 낮은 LLM도 서울 재개발·재건축 리서치 산출물을 안정적으로 읽고 답하도록 만드는 최소 작업 지시서다. 목표는 좋은 답을 많이 쓰는 것이 아니라, 공식 원문·보조 신호·추정·보류를 섞지 않게 하는 것이다.

## 프로젝트 요약

이 저장소는 강남, 잠실/송파, 구의/광진을 핵심 생활권으로 두고 강동권과 약수동 주변을 확장 관심권으로 추적한다. 중심 질문은 어떤 사업장이 장기 관찰 가치가 있는지, 어떤 공식 원문 병목 때문에 아직 확정하면 안 되는지, 새 고시·공고·회신·시장 데이터가 들어왔을 때 판단이 어떻게 바뀌는지다.

자료는 세 층으로 나뉜다.

| 층 | 위치 | 역할 |
| --- | --- | --- |
| 원천/입력 | `data/`, `project-notes/`, 일부 루트 문서 | 공식 원문, 수동 intake, 사업별 메모 |
| 분석 산출물 | `analysis/*.md`, `analysis/*.json`, `analysis/*.csv` | 비교표, 감사표, 큐, 플레이북 |
| 실행 스크립트 | `scripts/` | 수집, 정규화, 분석 산출물 재생성 |

## 먼저 읽을 최소 파일

저성능 LLM에는 한 번에 많은 파일을 주지 않는다. 아래 순서에서 필요한 만큼만 읽힌다.

| 목적 | 먼저 읽을 파일 | 같이 읽을 파일 |
| --- | --- | --- |
| 현재 상태 파악 | `analysis/current-research-operating-guide.md` | `analysis/personal-research-home.md` |
| 오늘 할 일 선택 | `analysis/research-now-action-board.md` | `analysis/research-session-playbook.md` |
| 사업장 비교 | `analysis/project-comparison-matrix.md` | 해당 `project-notes/*.md` |
| 근거 품질 확인 | `analysis/project-evidence-binder.md` | `analysis/core-value-confirmation-ledger.md` |
| 보류/공란 해석 | `analysis/residual-gap-interpretation-audit.md` | `analysis/source-verification-closure-ledger.md` |
| 새 공식 업데이트 처리 | `data/review/official-update-intake.README.md` | `analysis/official-update-intake-board.md` |
| 외부 회신 처리 | `data/review/high-blocking-source-response-intake.README.md` | `analysis/high-blocking-response-followup-cockpit.md` |
| 확장 관심권 점검 | `analysis/expansion-zone-weekly-monitoring-cockpit.md` | `analysis/life-area-extended-comparison-board.md` |
| 시장 데이터 해석 | `analysis/market-transaction-signal-summary.md` | `analysis/life-area-market-reaction-brief.md` |

## 증거 등급

LLM은 아래 순서를 어기면 안 된다.

1. 공식 원문: 고시, 공고, 첨부 원문, 공식 회신, 공식 API/공식 CSV.
2. 공식 보조 화면: 정보몽땅 사업개요, 단계 공개항목, 서울도시공간포털 레이어, 자치구 검색 결과.
3. 로컬 추출물: PDF/HWP/HWPX/OCR 텍스트, 수동 판독 로그.
4. 분석 산출물: 비교표, 점수표, 리스크 신호, 시장 반응 브리프.
5. 추정/가설: 생활권 해석, 장기 가능성, 현장 관찰, 정책 context.

확정값으로 쓸 수 있는 조건은 `공식 원문 또는 공식 회신 + 기준일 + 출처 경로`가 같이 있는 경우다. 시장 데이터, 보도자료, 검색 결과, 사업개요 보조값만으로는 사업 단계·권리관계·공사비를 확정하지 않는다.

## 답변 규칙

- 날짜는 항상 절대 날짜로 쓴다. `오늘`, `이번 주`, `최근`만 쓰지 않는다.
- 사업 단계와 수치는 기준일을 붙인다.
- 값이 충돌하면 하나로 합치지 말고 `고시 기준`, `사업시행 기준`, `관리처분 기준`, `사업개요 기준`으로 분리한다.
- `context_only`, `stage_not_applicable`, `manual_source_escalation`, `ocr_or_precision_review`, `source_basis_split` 상태는 그대로 보존한다.
- `P0/P1이 0`이어도 goal 완료로 쓰지 않는다. 완료 여부는 `analysis/research-goal-completion-audit.md`의 `final_verdict`를 따른다.
- 새 자료를 발견했으면 바로 결론을 바꾸지 말고 intake 위치와 검증 gate를 먼저 제안한다.

## 낮은 성능 LLM용 작업 프롬프트

아래 블록을 그대로 붙여도 된다.

```text
너는 서울 재개발·재건축 리서치 보조자다.

규칙:
1. 공식 원문/공식 회신이 없으면 확정값이라고 쓰지 않는다.
2. 시장 데이터와 보도자료는 보조 신호다. 사업 단계, 권리관계, 공사비 확정 근거로 쓰지 않는다.
3. 날짜는 YYYY-MM-DD로 쓴다.
4. 값이 충돌하면 병합하지 않고 기준 시점별로 나눈다.
5. 모르면 추정하지 말고 어떤 파일을 더 봐야 하는지 말한다.
6. 답변 끝에 "확정", "보류", "추가 확인"을 분리해 쓴다.

먼저 읽을 파일:
- analysis/current-research-operating-guide.md
- analysis/residual-gap-interpretation-audit.md
- 사용자가 묻는 사업장의 project-notes 파일
- 필요하면 analysis/project-evidence-binder.md
```

## 표준 출력 형식

사업장이나 생활권 질문에는 아래 형식을 우선 쓴다.

```text
요약:
- 한 문장으로 현재 판단.

확정:
- 공식 원문 또는 공식 회신으로 확인된 것만.

보류:
- 원문, 회신, OCR, 시점 충돌 때문에 아직 확정하지 않을 것.

보조 신호:
- 시장 데이터, 공개항목, 정책 context, 현장 관찰.

다음 확인:
- 열 파일 또는 intake 위치.
```

## 작업별 절차

| 작업 | 절차 | 멈출 조건 |
| --- | --- | --- |
| 사업장 한 곳 요약 | `project-notes` -> `project-evidence-binder` -> `core-value-confirmation-ledger` -> `residual-gap` | high blocking 또는 manual_source_escalation 필드 발견 |
| 두 사업 비교 | 각 사업의 확정값만 비교 -> 보류 필드 분리 -> 시장/입지 보조 신호 추가 | 기준일이나 단계가 다르면 단일 순위화 중지 |
| 새 고시/공고 반영 | `official-update-intake.README` 기준으로 intake -> `official-update-intake-board` 라우팅 -> 재생성 | URL, 첨부명, 기준일 중 하나라도 없으면 pending |
| 외부 회신 반영 | `high-blocking-source-response-intake.README` 기준으로 intake -> decision draft -> regenerate | 회신 본문이 값 확정 근거인지 불명확하면 보류 |
| OCR 값 보정 | `ocr-source-review-triage` -> 원문 이미지 판독 로그 -> `source-value-update-candidates` | 이미지 판독 로그가 없으면 자동 보정 금지 |
| 확장 관심권 점검 | 강동 direct hit와 약수 adjacent baseline 분리 -> latest check audit 확인 | 약수 direct hit가 없으면 direct 후보 승격 금지 |

## 재생성 원칙

분석 산출물은 수동으로 일부만 고치면 서로 어긋날 수 있다. 입력 파일이나 intake를 고친 뒤에는 원칙적으로 다음 명령을 실행한다.

```bash
node scripts/regenerate-research-artifacts.mjs
```

원격 수집이 필요한 명령은 세션 플레이북의 해당 세션에서만 실행한다. 원격 결과는 확정값이 아니라 검증 후보로 먼저 둔다.

## LLM이 하지 말아야 할 일

- 원문이 없는 수치를 보기 좋게 채우지 않는다.
- 같은 이름의 사업을 동일 사업으로 단정하지 않는다.
- `mapForm.pop?noticeCode=...` 같은 팝업 URL을 단독 공개 원문 URL로 승격하지 않는다.
- `representative_lot_fallback`을 current business 확정으로 오인하지 않는다.
- OCR 텍스트의 숫자를 원문 이미지 판독 없이 확정값으로 쓰지 않는다.
- generated 문서의 일부 행만 고치고 재생성 없이 완료로 말하지 않는다.
- 투자 추천, 매수/매도 결론, 가격 전망을 확정적으로 쓰지 않는다.

## 컨텍스트 예산

저성능 LLM에는 한 번에 3~5개 파일만 준다.

| 예산 | 넣을 내용 |
| --- | --- |
| 아주 작음 | 이 문서 + 질문 대상 `project-notes` 1개 + `residual-gap` 관련 행 |
| 보통 | 위 항목 + `project-evidence-binder` 관련 행 + `project-comparison-matrix` 관련 행 |
| 큼 | 위 항목 + `core-value-confirmation-ledger` 관련 행 + 세션 플레이북 일부 |

많은 파일을 넣어야 하면 먼저 관련 행만 추출한다. 전체 README와 전체 분석 폴더 목록을 한 번에 넣지 않는다.
