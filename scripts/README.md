# Scripts

작성 기준: 2026-06-24 KST

이 폴더는 공식 원천 수집, 수동 intake 반영, 분석 산출물 재생성, 프로젝트 관리 점검 스크립트를 둔다.

## 관리용 스크립트

| 파일 | 역할 |
| --- | --- |
| `agent-coordinator.mjs` | 공유 작업공간에서 에이전트별 scope lock을 claim/release/status로 관리한다. |
| `instructions-doctor.mjs` | canonical instruction files와 domain prompt 파일, Markdown 링크를 점검한다. |
| `kb-doctor.mjs` | knowledge base 도메인 레지스트리, 도메인 README, KB 스키마 파일을 점검한다. |
| `project-doctor.mjs` | 핵심 문서 존재, JSON 파싱, 주요 Markdown 링크, 핵심 산출물 짝 존재 여부를 점검한다. |
| `lib/project-utils.mjs` | 관리 스크립트에서 공유하는 파일 존재 확인, JSON 읽기, 파일 순회, 링크 판정 유틸이다. |
| `regenerate-research-artifacts.mjs` | 전체 분석 산출물을 정해진 순서로 재생성한다. |

## 실행

루트에서 실행한다.

```bash
npm run instructions:doctor
npm run kb:doctor
npm run doctor
npm run regenerate
```

새 관리용 스크립트는 외부 npm 의존성을 추가하지 않는 것을 기본값으로 둔다. 반복되는 파일 처리 로직은 `scripts/lib/project-utils.mjs`에 먼저 넣는다.
