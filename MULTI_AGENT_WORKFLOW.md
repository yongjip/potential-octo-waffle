# Multi-Agent Workflow

작성 기준: 2026-06-24 KST

이 문서는 여러 에이전트가 같은 리서치 저장소에서 동시에 작업할 때 충돌을 줄이는 운영 규칙이다. 핵심은 작업 범위를 먼저 claim하고, generated 산출물 재생성은 한 번에 한 에이전트만 맡고, 완료 후 handoff를 남기는 것이다.

## 기본 원칙

- Every agent reads `INSTRUCTIONS.md` before domain-specific files.
- 한 에이전트는 한 번에 하나의 명확한 task만 맡는다.
- 작업 전 파일 범위를 claim한다.
- `analysis/*.md`, `analysis/*.csv`, `analysis/*.json` generated 산출물은 가능한 직접 수정하지 않는다.
- 원천 입력, intake, 수동 운영 문서만 직접 수정한다.
- `npm run regenerate`는 `global:regenerate` scope를 claim한 에이전트만 실행한다.
- 같은 JSON 배열 파일을 여러 에이전트가 동시에 직접 편집하지 않는다. 가능한 helper script나 per-task intake를 사용한다.
- 완료 전 `npm run doctor`를 실행하고 결과를 handoff에 남긴다.

## 작업 시작

공유 작업공간에서 시작할 때:

```bash
npm run agent:status
npm run agent:claim -- --agent=agent-name --task=short-task-name --scope=path/or/scope --scope=global:regenerate
```

예시:

```bash
npm run agent:claim -- --agent=codex-a --task=update-llm-docs --scope=analysis/llm-research-handoff-guide.md
npm run agent:claim -- --agent=codex-b --task=market-intake --scope=data/market/manual-import/
npm run agent:claim -- --agent=codex-c --task=regenerate --scope=global:regenerate
```

claim은 `.agent-locks/`에 생성되며 git에는 올라가지 않는다. 같은 공유 작업공간에서 실시간 충돌을 막기 위한 로컬 lock이다.

## 작업 종료

작업이 끝나면 handoff를 남긴 뒤 lock을 해제한다.

```bash
npm run doctor
npm run instructions:doctor
npm run kb:doctor
npm run agent:release -- --agent=agent-name --task=short-task-name
```

handoff는 `data/agents/handoffs/`에 별도 파일로 둔다. 하나의 공용 로그 파일에 여러 에이전트가 동시에 append하지 않는다.

## Scope 규칙

| Scope | 의미 | 동시 작업 가능 여부 |
| --- | --- | --- |
| `analysis/llm-research-handoff-guide.md` | 단일 수동 문서 | 같은 파일은 1명만 |
| `data/review/official-update-intake.json` | 공용 intake JSON | 1명만 |
| `project-notes/10-apgujeong3.md` | 단일 사업 메모 | 같은 사업은 1명만 |
| `data/market/manual-import/` | 시장 원자료 폴더 | 하위 파일이 다르면 가능하나 대표 scope owner를 둔다 |
| `global:regenerate` | 전체 재생성 | 항상 1명만 |
| `global:git` | stage/commit/push | 항상 1명만 |

## Generated 산출물 규칙

여러 에이전트가 동시에 generated 산출물을 직접 수정하면 거의 반드시 충돌한다.

권장 경로:

1. 각 에이전트가 자기 입력 파일만 수정한다.
2. 재생성 담당 에이전트가 `global:regenerate`를 claim한다.
3. 재생성 담당자가 `npm run regenerate`를 실행한다.
4. 전체가 `npm run doctor`로 검증한다.

## Branch 전략

같은 작업공간에서 동시에 파일을 쓰는 경우에는 lock을 쓴다. 독립 실험이나 큰 변경은 에이전트별 branch/worktree가 더 안전하다.

권장 branch 이름:

```text
codex/agent-<short-task>
```

동시 작업 중 commit/push를 맡은 에이전트는 `global:git` scope를 claim한다.

## Handoff 템플릿

`data/agents/handoffs/YYYYMMDD-HHMM-agent-task.md` 형식으로 저장한다.

```text
# Agent Handoff

agent:
task:
started_at:
finished_at:
claimed_scopes:

changed_files:
- path:

commands_run:
- command:
  result:

decisions:
- 

blocked_or_deferred:
- 

next_agent_should:
- 
```

## 충돌이 났을 때

1. 새 작업을 중지하고 `npm run agent:status`를 본다.
2. 같은 scope를 누가 잡고 있는지 확인한다.
3. generated 파일 충돌이면 입력 변경만 남기고 재생성 담당자에게 넘긴다.
4. JSON intake 충돌이면 두 입력을 별도 항목으로 분리하고 `update_id`, `checked_at`, `agent` 같은 식별자를 명확히 한다.
5. 해결 후 handoff에 원인과 예방 규칙을 남긴다.
