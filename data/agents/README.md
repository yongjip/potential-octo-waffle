# Agent Coordination

작성 기준: 2026-06-24 KST

이 폴더는 여러 에이전트가 동시에 작업할 때 장기 기록을 남기는 위치다.

## 폴더

| 폴더 | 역할 |
| --- | --- |
| `handoffs/` | 에이전트별 작업 종료 메모. 파일 하나가 작업 하나다. |
| `claims/` | 장기 추적이 필요한 claim 기록이나 수동 조정 메모. 실시간 lock은 `.agent-locks/`에 둔다. |

실시간 충돌 방지 lock은 git에 올리지 않는다. 공유 작업공간에서는 `npm run agent:claim`, `npm run agent:release`, `npm run agent:status`를 사용한다.
