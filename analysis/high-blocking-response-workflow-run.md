# High Blocking Response Workflow Run

작성 기준: 2026-06-24 KST

이 문서는 `data/review/high-blocking-source-response-intake.json`에 회신을 입력한 뒤 decision 반영까지 이어지는 후처리 workflow 실행 결과다. 기본 실행은 dry-run이며, `--write`가 있을 때만 decision 장부를 수정한다.

## 요약

| 항목 | 값 |
| --- | --- |
| mode | dry_run |
| status | dry_run_completed |
| validation_errors | 0 |
| appendable_decisions | 0 |
| wrote_decisions | false |
| regenerated | false |

## Steps

| step | exit | ms | command | output |
| --- | ---: | ---: | --- | --- |
| intake-validation | 0 | 90 | node scripts/generate-high-blocking-intake-validation.mjs | { "issues": 0, "errors": 0, "warnings": 0, "output": "analysis/high-blocking-intake-validation.{md,csv,json}" } |
| intake-guide | 0 | 88 | node scripts/generate-high-blocking-response-intake-guide.mjs | { "rows": 3, "examples": 3, "output": "analysis/high-blocking-response-intake-guide.{md,json}" } |
| decision-drafts | 0 | 89 | node scripts/generate-high-blocking-response-decision-drafts.mjs | { "ready_to_append": 0, "waiting_for_response": 3, "needs_intake_fix": 0, "output": "analysis/high-blocking-response-decision-drafts.{md,json}" } |
| apply-dry-run | 0 | 74 | node scripts/apply-high-blocking-response-decisions.mjs | { "mode": "dry_run", "readyDrafts": 0, "appendable": 0, "duplicates": 0, "decisionsBefore": 290, "decisionsAfter": 290, "wrote": false, "draftInput": "analysis/high-blocking-respo... |

## Next

아직 append 가능한 회신이 없다. 외부 회신을 intake에 보강한다.
