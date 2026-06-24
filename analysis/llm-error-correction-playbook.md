# LLM 오류 교정 플레이북

작성 기준: 2026-06-24 KST

이 문서는 LLM이 재개발·재건축 리서치 중 edge case를 만나거나 self-correction을 수행할 때, 왜 문제가 생겼는지와 다음에 어떻게 예방할지 기록하는 기준이다.

## 기본 원칙

오류를 발견하면 먼저 결론을 고치지 않는다. 잘못된 claim, 사용한 근거, 깨진 gate, 올바른 상태값을 분리한 뒤 수정한다.

```text
1. 의심 claim을 한 문장으로 적는다.
2. claim이 의존한 파일과 행/섹션을 적는다.
3. 공식 원문, 보조 신호, OCR, 시장 데이터, 추정 중 무엇을 섞었는지 확인한다.
4. 올바른 상태를 confirmed/pending/conflict/deferred/context_only 중 하나로 둔다.
5. 필요한 intake 또는 재생성 명령을 적는다.
6. 같은 유형을 막을 예방 규칙을 남긴다.
```

## 오류 기록 템플릿

```text
오류 ID:
발견일:
대상 사업/생활권:
잘못된 claim:
문제가 된 근거:
왜 문제인가:
올바른 해석:
수정한 파일:
재생성/검증 명령:
재발 방지 규칙:
남은 보류:
```

## 자주 생기는 문제

| 유형 | 왜 생기는가 | 증상 | 예방 |
| --- | --- | --- | --- |
| 보조값의 확정값 승격 | 정보몽땅 사업개요나 요약표가 보기 쉽게 정리돼 있어 원문처럼 보임 | 고시번호/고시일/첨부 URL 없이 수치가 확정으로 쓰임 | 확정값에는 공식 원문 또는 회신, 기준일, 출처 경로를 요구 |
| 기준 시점 병합 | 사업시행, 관리처분, 정비계획, 사업개요 값이 같은 필드명으로 등장 | 용적률·세대수·면적이 하나의 대표값으로 합쳐짐 | `source_basis_split`이면 기준별 병기 |
| OCR 숫자 오판 | 스캔 품질, 표 병합, 자리수, 단위가 불안정함 | 층수/높이/면적 숫자가 실제 이미지와 다름 | OCR 값은 `ocr-image-review-decisions` 없이는 보정 후보로만 사용 |
| 단계 최신성 오판 | 과거 고시 원문은 확인됐지만 현재 사업 단계는 별도 화면에 있음 | 과거 단계 원문을 현재 단계로 단정 | selected stage와 latest/current business를 분리 |
| 동일명 사업 혼동 | 동, 단지명, 구역명, 조합명이 비슷함 | 다른 사업의 고시번호나 면적이 붙음 | rank, 자치구, 법정동, 대표지번, PNU, presentSn를 같이 확인 |
| 팝업/식별자 URL 과신 | 포털 내부 URL이 세션/파라미터 의존적임 | `mapForm.pop` 링크를 공개 원문 URL로 기록 | noticeCode는 식별자로 두고 공개 진입 페이지나 첨부 원문을 별도 확보 |
| 시장 신호 과대해석 | 거래 데이터가 정량적이라 결론처럼 보임 | 실거래 반응으로 사업성 또는 단계 확정 | 시장 데이터는 반응/보조 신호로만 사용 |
| goal 완료 오판 | P0/P1 실행 큐가 0이면 완료처럼 보임 | high blocking 회신 대기 중인데 완료 선언 | 완료는 `research-goal-completion-audit`의 final verdict만 따른다 |
| 날짜 stale | 생성 문서와 실제 확인일이 다름 | `최근`, `오늘`이 과거 산출물 날짜를 가리킴 | 답변에는 절대 날짜와 문서 작성 기준을 같이 쓴다 |
| generated 문서 수동 수정 | 파생 산출물을 직접 고치면 다음 재생성 때 덮임 | README/분석표 간 불일치 | 입력/intake를 고치고 regenerate를 실행 |

## Self-correction 루틴

LLM이 답변 중 오류 가능성을 발견하면 아래 순서로 멈춘다.

1. Claim freeze: 지금 쓰려던 결론을 임시 중지한다.
2. Evidence split: 근거를 `official_original`, `official_summary`, `local_extraction`, `market_signal`, `hypothesis`로 분류한다.
3. Gate check: 확정 조건을 통과했는지 확인한다.
4. Conflict check: 같은 필드에 다른 기준일이나 단계가 있는지 확인한다.
5. Status assign: `confirmed`, `pending`, `conflict`, `deferred`, `context_only` 중 하나를 붙인다.
6. Minimal patch: 필요한 입력 파일 또는 문서만 수정한다.
7. Regenerate: 파생 산출물은 `node scripts/regenerate-research-artifacts.mjs`로 맞춘다.
8. Audit note: 오류 기록 템플릿으로 원인과 예방 규칙을 남긴다.

## Edge case별 판정

| Edge case | 확인 파일 | 올바른 처리 |
| --- | --- | --- |
| `manual_source_escalation` | `analysis/residual-gap-interpretation-audit.md` | 자치구/정보몽땅 회신 또는 본고시 원문 전까지 확정 금지 |
| `source_basis_split` | `analysis/residual-gap-interpretation-audit.md`, `analysis/management-stage-value-resolution.md` | 기준별로 병기하고 대표값으로 병합하지 않음 |
| OCR 보정 후보 | `analysis/ocr-source-review-triage.md`, `analysis/ocr-image-review-decisions.md` | 원문 이미지 판독 로그가 있을 때만 보정 후보 승격 |
| 대표지번 fallback | `analysis/representative-lot-fallback-workbook.md`, `analysis/representative-lot-fallback-identifier-closure-workbook.md` | current business presentSn가 same-stage로 확인되기 전까지 보류 |
| 강동권 direct hit | `analysis/expansion-zone-weekly-monitoring-cockpit.md` | direct hit은 최신 단계 확인 루프에 태우고 값 confirmed와 분리 |
| 약수권 adjacent baseline | `analysis/life-area-extended-comparison-board.md` | direct hit가 없으면 adjacent 대조군으로 유지 |
| 외부 회신 도착 | `data/review/high-blocking-source-response-intake.README.md` | 회신 원문을 intake에 남기고 decision draft를 거친 뒤 반영 |
| 새 보도자료 | `analysis/official-update-scenario-playbook.md` | context_only로 시작하고 고시/계획 원문 연결 전에는 확정 금지 |
| 시장 원자료 갱신 | `analysis/market-manual-normalization-audit.md`, `analysis/market-transaction-signal-summary.md` | 사업장 매칭을 검수하고 보조 신호로만 해석 |
| goal 완료 질문 | `analysis/research-goal-completion-audit.md` | final verdict가 complete가 아니면 완료로 말하지 않음 |

## 원인 분석 문장 예시

좋은 원인 분석은 모델 탓으로 끝내지 않고 깨진 규칙을 적는다.

| 나쁜 기록 | 좋은 기록 |
| --- | --- |
| LLM이 헷갈렸다. | 정보몽땅 사업개요 값을 공식 원문값으로 승격했고, 고시번호/고시일 gate를 확인하지 않았다. |
| OCR이 틀렸다. | OCR 텍스트의 숫자를 원문 이미지 판독 로그 없이 구조화 값으로 덮어썼다. |
| 최신 정보가 아니었다. | 문서 작성 기준일 2026-06-24와 답변 기준일을 분리하지 않았고, 최신 단계 확인 루프를 실행하지 않았다. |
| 사업을 잘못 봤다. | 조합명 유사성을 기준으로 매칭했고 rank, 법정동, 대표지번, presentSn 대조를 생략했다. |

## 수정 우선순위

| 우선순위 | 조건 | 처리 |
| --- | --- | --- |
| P0 | 확정값, 사업 단계, 고시번호, 공사비, 세대수 같은 핵심 필드가 잘못됨 | 즉시 보류 상태로 되돌리고 원문/회신 gate를 재확인 |
| P1 | 비교표, 점수, 생활권 결론에 영향을 줌 | 관련 사업 메모와 비교 산출물 재생성 |
| P2 | 링크, 설명, 문서 색인, context 문장 오류 | 다음 정리 시 수정하되 결론에는 반영 금지 |

## 예방 체크리스트

답변 또는 문서 수정 전 마지막으로 확인한다.

- 확정값마다 출처와 기준일이 있는가.
- 보류 상태값을 임의로 평문 요약으로 없애지 않았는가.
- OCR, 시장 데이터, 보도자료를 직접 원문처럼 쓰지 않았는가.
- 같은 필드에 다른 기준 시점이 있으면 병기했는가.
- 새 입력을 넣었다면 intake와 재생성 경로를 적었는가.
- 완료 판정은 completion audit을 확인했는가.

## 저성능 LLM용 교정 프롬프트

```text
답변을 고치기 전에 다음 표를 먼저 작성해라.

| claim | 근거 파일 | 근거 등급 | 통과한 gate | 실패한 gate | 수정 상태 |

근거 등급은 official_original, official_summary, local_extraction, market_signal, hypothesis 중 하나만 쓴다.
official_original 또는 공식 회신이 없으면 confirmed라고 쓰지 않는다.
실패한 gate가 있으면 결론을 보류로 낮추고, 어떤 파일을 열어야 하는지 적는다.
```
