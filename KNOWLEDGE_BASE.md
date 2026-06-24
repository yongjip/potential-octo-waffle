# Personal Knowledge Base

작성 기준: 2026-06-24 KST

이 저장소는 서울 재개발·재건축 리서치에서 시작했지만, 장기적으로 한국 부동산, 한국 주식, 미국 주식, 거시/정책 데이터를 함께 다루는 개인 knowledge base로 확장한다.

## 목표

- 공식 출처와 수동 판단을 분리한다.
- LLM이 낮은 성능이어도 출처, 기준일, 확정/보류 상태를 잃지 않게 한다.
- 여러 에이전트가 동시에 도메인별 작업을 해도 충돌을 줄인다.
- 공개 가능한 데이터와 개인 판단/메모를 처음부터 분리한다.

## 핵심 진입점

| 파일 | 역할 |
| --- | --- |
| `INSTRUCTIONS.md` | 모든 에이전트가 먼저 읽는 canonical instruction entrypoint |
| `instructions/evidence-policy.md` | source, observation, assertion, analysis, decision 분리 규칙 |
| `instructions/agent-workflow.md` | multi-agent claim/release/handoff/regenerate 규칙 |
| `instructions/self-correction.md` | broken gate와 correction record 기준 |
| `knowledge/README.md` | KB 전체 구조와 데이터 계층 |
| `knowledge/domain-registry.json` | 도메인 목록, 상태, 주요 경로, 공개 가능성 |
| `knowledge/open-data-governance.md` | 장기 open data 공개 기준과 제외 기준 |
| `analysis/llm-research-handoff-guide.md` | LLM에게 줄 최소 작업 지시서 |
| `MULTI_AGENT_WORKFLOW.md` | 여러 에이전트 동시 작업 규칙 |

## 도메인

| 도메인 | 상태 | 현재 위치 |
| --- | --- | --- |
| 한국 부동산 | active | `data/`, `analysis/`, `project-notes/` |
| 한국 주식 | planned | `knowledge/domains/korea-stocks/` |
| 미국 주식 | planned | `knowledge/domains/us-stocks/` |

## 데이터 계층

| 계층 | 의미 | 공개 가능성 |
| --- | --- | --- |
| source | 공식 원천, 원문 링크, 수집 메타데이터 | 출처 라이선스 확인 후 가능 |
| raw | 원본 파일, 원문 스냅샷 | 재배포 허용 여부 확인 필요 |
| normalized | 표준 컬럼으로 정리한 행 | 대체로 공개 후보 |
| assertion | 특정 날짜 기준으로 확인한 사실 | 출처와 함께 공개 후보 |
| analysis | 점수, 해석, 장기 가설 | 개인 판단은 비공개 기본값 |
| decision | 투자/관찰/보류 판단 | 비공개 기본값 |

## 운영 규칙

- 금융·부동산 판단은 추천이 아니라 리서치 기록으로 남긴다.
- 날짜가 있는 데이터는 반드시 기준일을 남긴다.
- 공식 원천과 모델 해석은 같은 필드에 섞지 않는다.
- 공개 가능한 데이터는 개인 메모, 계정 정보, 비공개 회신, 민감한 위치/연락처와 분리한다.
- 새 도메인을 추가할 때는 `knowledge/domain-registry.json`과 해당 `knowledge/domains/*/README.md`를 먼저 만든다.
- 새 에이전트 작업은 `INSTRUCTIONS.md`를 먼저 읽고 도메인별 prompt로 내려간다.
- 새 observation/assertion/decision/correction 기록은 장기적으로 append-only JSONL을 선호한다. 기존 JSON 배열은 별도 승인 전까지 변환하지 않는다.
