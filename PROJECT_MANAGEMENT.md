# Project Management

작성 기준: 2026-06-24 KST

이 문서는 저장소를 운영할 때 쓰는 최소 명령과 관리 규칙이다. 리서치 내용 판단은 `analysis/current-research-operating-guide.md`와 `analysis/llm-research-handoff-guide.md`를 따르고, 저장소 상태 점검은 여기의 명령을 쓴다.

## 기본 명령

| 목적 | 명령 |
| --- | --- |
| 변경 파일 확인 | `npm run status` |
| 에이전트 lock 확인 | `npm run agent:status` |
| 작업 범위 claim | `npm run agent:claim -- --agent=이름 --task=작업 --scope=파일또는범위` |
| 작업 범위 release | `npm run agent:release -- --agent=이름 --task=작업` |
| 핵심 문서/JSON/링크 점검 | `npm run doctor` |
| instruction 계층 점검 | `npm run instructions:doctor` |
| KB 도메인 레지스트리 점검 | `npm run kb:doctor` |
| 전체 분석 산출물 재생성 | `npm run regenerate` |
| 생성 스크립트 날짜 하드코딩 감사 | `npm run audit:dates` |
| 주간 로그 작성 옵션 확인 | `npm run weekly-log` |

`npm install`은 필요 없다. 현재 관리 스크립트는 Node 표준 라이브러리만 사용한다.

## 관리 파일

| 파일 | 역할 |
| --- | --- |
| `.gitignore` | 로컬 IDE, 캐시, 임시 파일, 비밀값을 제외한다. 리서치 원자료는 기본적으로 추적 대상으로 둔다. |
| `.editorconfig` | Markdown, CSV, JS, Python의 줄바꿈과 들여쓰기 기본값을 맞춘다. |
| `package.json` | 반복 관리 명령을 `npm run ...` 형태로 고정한다. |
| `INSTRUCTIONS.md` | 모든 에이전트가 먼저 읽는 canonical instruction entrypoint다. |
| `instructions/` | evidence, workflow, self-correction, domain prompt 규칙을 둔다. |
| `KNOWLEDGE_BASE.md` | 개인 knowledge base의 도메인, 데이터 계층, open data 방향을 정리한다. |
| `MULTI_AGENT_WORKFLOW.md` | 여러 에이전트가 동시에 작업할 때의 claim, regenerate, handoff 규칙을 고정한다. |
| `scripts/README.md` | 관리용 스크립트와 공통 유틸 위치를 설명한다. |

## 운영 루틴

1. 작업 시작 전 `npm run status`로 예상하지 못한 변경을 본다.
2. 여러 에이전트가 같이 일하면 `npm run agent:status`로 기존 lock을 확인하고 작업 범위를 claim한다.
3. 원천 입력이나 intake를 수정한다.
4. 파생 산출물이 필요한 변경이면 `global:regenerate`를 claim한 뒤 `npm run regenerate`를 실행한다.
5. 구조나 지침을 바꿨다면 `npm run instructions:doctor`와 `npm run kb:doctor`를 먼저 실행한다.
6. `npm run doctor`로 JSON 파싱과 주요 문서 링크를 점검한다.
7. 결론을 남길 때는 확정값, 보류, 보조 신호를 분리한다.
8. 작업 종료 후 handoff를 남기고 agent lock을 release한다.

## 파일 관리 규칙

- `analysis/*.md`, `analysis/*.csv`, `analysis/*.json` 중 다수는 generated 산출물이다. 가능하면 입력 파일이나 intake를 고치고 재생성한다.
- 수동 운영 문서는 generated 체인과 충돌하지 않게 별도 파일로 둔다. 예: `analysis/llm-research-handoff-guide.md`.
- 외부 회신, 새 공식 업데이트, 현장 관찰은 대응 README가 있는 `data/review/*intake*` 계열에 먼저 남긴다.
- 임시 파일은 `tmp/`에 둔다. 장기 보관할 원자료는 `data/` 아래에 출처와 기준일이 드러나게 둔다.
- 구조 확정 단계에서는 현재 `analysis/`, `data/`, `project-notes/` 파일을 이동하지 않는다.

## Doctor가 보는 것

`scripts/project-doctor.mjs`는 다음을 확인한다.

- 핵심 운영 문서 존재 여부
- 주요 JSON 파일 전체 파싱 가능 여부
- README와 LLM 핸드오프 문서의 로컬 Markdown 링크 존재 여부
- 핵심 산출물의 `.md/.csv/.json` 짝 존재 여부
- instruction 계층은 별도 `scripts/instructions-doctor.mjs`가 domain prompt와 link를 점검한다.

오류가 있으면 exit code 1로 끝난다. 경고는 바로 수정하지 않아도 되지만, 주간 정리 때 닫는 것을 원칙으로 한다.
