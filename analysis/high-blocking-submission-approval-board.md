# High Blocking 제출 승인 보드

작성 기준: 2026-06-24 KST

이 문서는 공개 검색으로 닫히지 않은 3개 high blocking 병목을 실제 담당부서 문의 또는 정보공개청구로 넘기기 전에, 사용자가 제출 범위와 접수 후 기록 방식을 한 화면에서 승인할 수 있게 만든 보드다. 이 산출물은 외부 제출을 수행하지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 승인 필요 제출 | 0 |
| 광진구 대상 | 0 |
| 송파구 대상 | 0 |
| 현재 no_response | 0 |
| 공식 공개 검색 소진 | 0 |

## 승인 대상

_없음_

## 승인 질문

_없음_

## 접수 후 기록

_없음_

## 운영 원칙

1. 외부 제출은 사용자 승인 전에는 하지 않는다.
2. 제출 후 접수번호가 생기면 `node scripts/mark-high-blocking-filed.mjs --rank=NN --filed-at=YYYY-MM-DD --receipt=접수번호 --write`로 접수 필드를 먼저 기록한다. 접수번호가 없으면 `--note=...`를 사용한다.
3. 회신이 오면 원문 URL, 고시번호, 고시일, 첨부명, 기준일, 공개/비공개 사유 중 확인된 사실만 입력한다.
4. 입력 후 `node scripts/process-high-blocking-response-workflow.mjs`로 dry-run하고, append 가능한 decision을 검수한 뒤에만 `--write`를 실행한다.
