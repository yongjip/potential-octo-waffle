# 서울·수도권 재개발/재건축 리서치

이 작업공간은 강남·잠실/송파·구의/광진을 핵심 생활권으로 두고, 강동권(천호·상일·고덕 축)과 약수동 주변을 확장 관심권으로 포함해 서울 재개발·재건축 및 도시계획 변화를 공식 원문 기반으로 조사한다. 목표는 핵심 생활권과 확장권에서 **관심 사업장, 진행단계, 교통입지, 리스크, 장기 가능성**을 같은 기준으로 비교 가능한 체계를 유지하는 것이다.

## 프로젝트 운영

- [INSTRUCTIONS.md](INSTRUCTIONS.md)
  - 에이전트가 가장 먼저 읽는 canonical instruction entrypoint다.
  - 영어를 기준 언어로 두고 evidence policy, generated-file policy, multi-agent workflow, open-data boundary를 고정한다.
- [KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)
  - 이 저장소를 한국 부동산, 한국 주식, 미국 주식으로 확장하는 개인 knowledge base의 목표와 데이터 계층을 정리한다.
  - 장기 open data 전환을 고려해 공개 후보와 비공개 기본값을 분리한다.
- [PROJECT_MANAGEMENT.md](PROJECT_MANAGEMENT.md)
  - 저장소 관리용 기본 명령, 운영 루틴, 파일 관리 규칙, `npm run doctor` 점검 범위를 정리한다.
  - 새 intake나 원천 자료 반영 후 어떤 순서로 재생성·검증할지 볼 때 먼저 연다.
- [MULTI_AGENT_WORKFLOW.md](MULTI_AGENT_WORKFLOW.md)
  - 여러 에이전트가 동시에 작업할 때 파일 범위 claim, 전체 재생성 lock, handoff, git scope 규칙을 고정한다.
  - `npm run agent:claim`, `npm run agent:release`, `npm run agent:status` 사용법을 정리한다.

## 비교 시작점

- [analysis/personal-research-home.md](analysis/personal-research-home.md)
  - 강남·잠실/송파·구의/광진 핵심 생활권과 강동권·약수동 주변 확장 관심권 리서치를 시작할 때 가장 먼저 여는 홈 화면이다.
  - 생활권별 시작점, 확장권 모니터링, 오늘 열 사업 메모, P0 완료 병목, 정보공개 접수 준비, 답사 루트, 업데이트 런북을 한 장으로 묶는다.
- [analysis/research-status-dashboard.md](analysis/research-status-dashboard.md)
  - 우선검토 후보 30개의 P0/P1 원문 검증 태스크, 핵심 수치 검토 항목, OCR/recordCode 병목, 생활권별 남은 작업량을 한눈에 본다.
  - 다음에 어느 사업장 원문을 먼저 열지 정하는 첫 상태판이다.
- [analysis/strategic-research-brief.md](analysis/strategic-research-brief.md)
  - 생활권별 큰 그림, 장기 관찰 후보, 이번 액션, 현장 루트, 재평가 감시 대상을 한 장으로 요약한다.
  - 여러 분석표를 보기 전에 현재 리서치 방향을 빠르게 잡는 시작 브리프다.
- [analysis/focus-area-comparison-brief.md](analysis/focus-area-comparison-brief.md)
  - 강남·잠실/송파·구의/광진을 같은 기준으로 비교해 생활권별 현재 관점, 판단 질문, 원문 병목, 현장 확인, 시장 보조 신호를 한 장에 묶는다.
  - 어느 생활권을 어떤 질문으로 계속 추적할지 정하는 상대 비교 브리프다.
- [analysis/life-area-extended-comparison-board.md](analysis/life-area-extended-comparison-board.md)
  - 핵심 생활권과 강동권·약수동 주변 확장 관심권을 같은 비교 축에 올려 본다.
  - 강동권은 최신 단계 재확인, 약수동 주변은 직접 후보 탐색 전까지 인접 비교군으로 유지하는 운영 경계를 확인한다.
- [analysis/expansion-interest-zone-brief.md](analysis/expansion-interest-zone-brief.md)
  - 강동권(상일·고덕축 포함)과 약수동 주변 확장권의 공식 원문, 시장 신호, 다음 탐색 후보를 요약한다.
  - 기존 30개 후보와 별도로 확장권을 본 후보군으로 승격할지 판단할 때 먼저 읽는다.
- [analysis/expansion-zone-weekly-monitoring-cockpit.md](analysis/expansion-zone-weekly-monitoring-cockpit.md)
  - 강동권·약수동 주변의 주간 최신 단계 확인과 direct hit 탐색을 실행 단위로 묶은 콕핏이다.
  - 강동구·중구 고시공고, 정보몽땅, 시장 데이터 보강을 어느 순서로 확인할지 정한다.
- [analysis/life-area-official-catalyst-brief.md](analysis/life-area-official-catalyst-brief.md)
  - 잠실 MICE, 압구정 한강변, 동서울터미널 같은 공공 촉매를 공식 페이지 기준으로 묶은 큰 그림 브리프다.
  - 생활권 상방 스토리를 과대해석하지 않고, 어디까지가 context이고 어디부터가 직접 원문 확인인지 구분할 때 먼저 읽는다.
- [analysis/life-area-market-reaction-brief.md](analysis/life-area-market-reaction-brief.md)
  - 강남·잠실/송파·구의/광진의 실거래·전월세·R-ONE 지표를 생활권 해석용으로 묶은 시장 반응 브리프다.
  - 시장 숫자를 원문보다 앞세우지 않고, 어디까지를 보조신호로 쓸지 정할 때 먼저 읽는다.
- [analysis/focus-project-evidence-triad-brief.md](analysis/focus-project-evidence-triad-brief.md)
  - 장미1,2,3차·잠실우성4차·압구정3·한양연립을 `원문 상태`, `공공 촉매`, `시장 반응` 세 면으로 같이 읽는 핵심 4개 사업 브리프다.
  - 개별 사업을 다시 볼 때 직접 근거와 보조근거를 한 장에서 분리해 읽는 시작점이다.
- [analysis/focus-project-live-input-cockpit.md](analysis/focus-project-live-input-cockpit.md)
  - 현장 관찰 0건과 회신 대기 3건을 실제 명령 기준으로 바로 처리하는 입력 전용 콕핏이다.
  - 답사 직후나 회신 수신 직후에 무엇을 어느 명령으로 기록할지 헷갈리지 않게 만드는 실행 표면이다.
- [analysis/life-area-subway-first-brief.md](analysis/life-area-subway-first-brief.md)
  - 지하철을 타고 강남·잠실/송파·구의/광진을 직접 비교할 때 먼저 읽는 1장짜리 브리프다.
  - 어느 역에서 내려 무엇을 보면 생활권 가설이 강화되거나 약해지는지 빠르게 잡는 시작점이다.
- [analysis/focus-project-pair-comparison-template.md](analysis/focus-project-pair-comparison-template.md)
  - 같은 날 두 사업을 보고 바로 비교 메모를 남기는 템플릿이다.
  - 잠실우성4차 vs 장미1,2,3차, 압구정3 vs 한양연립처럼 `왜 다르게 읽어야 하는지`를 한 장에 적을 때 쓴다.
- [analysis/focus-project-pair-comparison-starter.md](analysis/focus-project-pair-comparison-starter.md)
  - 같은 날 두 사업장을 걸은 직후 바로 채우는 짧은 비교 스타터다.
  - 현장 차이, 판단 변화, 바로 고칠 파일을 먼저 적고 생활권 판단 문서로 넘길 때 쓴다.
- [analysis/focus-project-pair-comparison-board.md](analysis/focus-project-pair-comparison-board.md)
  - 같은 날 두 사업 관찰이 실제 비교 메모로 이어질 준비가 됐는지 보는 보드다.
  - fieldwork 관찰 2건이 모였는지, 비교 메모가 draft/reviewed/applied 중 어디까지 갔는지 확인할 때 쓴다.
- [analysis/focus-area-evidence-risk-heatmap.md](analysis/focus-area-evidence-risk-heatmap.md)
  - 생활권별 장기 가능성을 공식 근거 품질, 원문 병목, 공식 회신 필요, very high 리스크와 함께 본다.
  - 평균 점수보다 검증 순서를 먼저 정하기 위한 heatmap이다.
- [analysis/research-system-readiness-audit.md](analysis/research-system-readiness-audit.md)
  - 공식 원천 수집, HWP/PDF 텍스트화, 사업장 비교, 핵심 수치 검증, 시장 데이터, 최신 업데이트 루틴을 goal 요구사항별로 감사한다.
  - 지금 연구에 사용할 수 있는 부분과 goal 완료로 보지 말아야 할 남은 병목을 분리한다.
- [analysis/llm-research-handoff-guide.md](analysis/llm-research-handoff-guide.md)
  - 성능이 낮은 LLM에게 줄 최소 파일 순서, 증거 등급, 답변 형식, 금지 규칙을 고정한다.
  - 공식 원문·보조 신호·추정·보류를 섞지 않게 하는 LLM용 작업 지시서다.
- [analysis/llm-error-correction-playbook.md](analysis/llm-error-correction-playbook.md)
  - LLM이 edge case나 self-correction을 만났을 때 오류 원인, 깨진 gate, 수정 경로, 재발 방지 규칙을 기록하는 기준이다.
  - OCR, 시점 충돌, 보조값 승격, 시장 신호 과대해석 같은 반복 오류를 분리해 다룬다.
- [analysis/research-goal-completion-audit.md](analysis/research-goal-completion-audit.md)
  - active goal을 완료로 선언할 수 있는지 readiness audit과 completion cockpit 기준으로 최종 판정한다.
  - `final_verdict`가 `complete`가 되기 전에는 goal 완료로 보지 않는다.
- [analysis/research-completion-cockpit.md](analysis/research-completion-cockpit.md)
  - goal 완료를 막는 시장 원자료, high-blocking 회신, 최종 재생성/완료감사 작업을 P0/P1 critical path로 묶는다.
  - 외부 자료를 넣은 뒤 어떤 파일을 수정하고 어떤 검증 명령을 실행할지 한 화면에서 본다.
- [analysis/high-blocking-submission-approval-board.md](analysis/high-blocking-submission-approval-board.md)
  - 남은 P0 3건을 담당부서 문의 또는 정보공개청구로 넘기기 전에 승인 질문, 제출 본문, 접수 후 intake 기록 필드를 한 화면에서 확인한다.
  - 외부 제출은 자동으로 하지 않으며, 승인 전 마지막 검토 보드로 사용한다.
- [analysis/official-refresh-summary.md](analysis/official-refresh-summary.md)
  - 정보몽땅, 서울도시공간포털, 강남·송파 자치구 고시공고 최신 수집 결과를 한 장으로 묶는다.
  - 주간 수집 직후 단계 변경, 공개자료 수 증가, 새 원문 후보, 다음 확인 액션을 먼저 판독하는 운영 요약이다.
- [analysis/official-source-freshness-ledger.md](analysis/official-source-freshness-ledger.md)
  - 공식 업데이트 출처별 로컬 산출물 존재 여부, 최신 갱신일, 수동/API 키 필요 상태, 다음 실행 런북을 점검한다.
  - 원격 사이트를 직접 호출하기 전 어떤 출처가 로컬 분석 가능한지와 어디를 수동 보강해야 하는지 확인하는 신선도 장부다.
- [analysis/project-comparison-matrix.md](analysis/project-comparison-matrix.md)
  - 우선검토 후보 30개의 진행단계, 공식 원문 커버리지, 정보몽땅 단계 공개항목, 로컬 고시 원문, 텍스트 추출 상태, OCR 이미지 수동 판독, 시장 데이터 수집 키를 한 표로 비교한다.
  - 강남·잠실/송파·구의/광진별 단계 분포와 다음 확인 작업을 함께 본다.
- [analysis/project-comparison-matrix.csv](analysis/project-comparison-matrix.csv)
  - 스프레드시트에서 필터링하기 위한 비교 매트릭스다.
- [analysis/market-api-readiness-audit.md](analysis/market-api-readiness-audit.md)
  - 실거래·전월세 API 호출 계획, 필요한 키, 원자료 파일 존재 여부, 정규화/사업장 매칭 산출물 상태를 점검한다.
  - API 키 투입 전후에 시장 데이터 병목이 어디인지 확인하는 상태판이다.
- [analysis/market-manual-import-readiness.md](analysis/market-manual-import-readiness.md)
  - API 키 없이 공식 사이트에서 내려받은 CSV/XLSX 원자료를 `data/market/manual-import/manifest.json` 기준으로 검수한다.
  - 파일 존재, 출처·기간·지역 메타데이터, 정규화 매핑 준비 여부를 확인한다.
- [analysis/market-manual-download-workbook.md](analysis/market-manual-download-workbook.md)
  - API 키 없이 공식 사이트에서 받을 시장 원자료를 70개 다운로드·필터 작업으로 압축한다.
  - 서울 열린데이터 신고년도·법정동 필터, 국토부 RTMS 1년 이내 자치구·유형 묶음, R-ONE 통계 묶음을 권장 파일명과 사업장 키워드에 연결한다.
- [analysis/market-manual-download-status.md](analysis/market-manual-download-status.md)
  - 70개 수동 다운로드 작업별 원자료 파일 존재, 다운로드 시점, 공식 페이지, 적용 필터를 점검한다.
  - 권장 파일명 그대로 `data/market/manual-import/files/`에 저장하면 자동 감지하고, 파일명이 다르면 `download-intake.json`으로 연결한다.
- [analysis/market-manual-ingest-manifest.md](analysis/market-manual-ingest-manifest.md)
  - 70개 작업별 파일 또는 출처별 manifest를 컬럼 감사/정규화 입력 manifest로 승격한다.
  - 작업별 파일이 하나라도 있으면 task-level 행을 우선 사용하고, 없으면 기존 4개 출처 manifest를 유지한다.
- [analysis/market-manual-column-audit.md](analysis/market-manual-column-audit.md)
  - `data/market/manual-import/ingest-manifest.json` 기준으로 수동 반입 CSV/XLSX의 컬럼명, 샘플 행 수, 계약일·단지명·면적 등 필수 필드 매칭 후보를 점검한다.
  - 원자료를 정규화하기 전 파일 구조가 분석 스키마로 넘어갈 수 있는지 확인한다.
- [analysis/market-manual-normalization-audit.md](analysis/market-manual-normalization-audit.md)
  - 수동 반입 원자료를 표준 거래/지표 스키마와 사업장 키워드 매칭 결과로 정규화할 수 있는지 점검한다.
  - 정규화 결과는 API 산출물을 덮어쓰지 않고 `manual-*` 파일로 따로 만든다.
- [analysis/market-transaction-signal-summary.md](analysis/market-transaction-signal-summary.md)
  - 서울 열린데이터광장 OA-21275와 국토교통부 RTMS 공식 자료제공 CSV를 2024~2026년 기준으로 내려받아 생활권·사업장별 1차 시장 신호로 집계한다.
  - 매칭은 법정동·단지명 키워드 기반이므로 개별 단지 확정 전에는 비교군 신호로만 사용한다.
- [analysis/cleanup-snapshot-diff.md](analysis/cleanup-snapshot-diff.md)
  - 정비사업 정보몽땅 강남구·송파구·광진구 사업장 목록의 직전/현재 스냅샷을 비교한다.
  - 단계 변경, 공개자료 수 변화, 신규/삭제 사업장을 다음 확인 큐로 분리한다.
- [analysis/official-refresh-summary.md](analysis/official-refresh-summary.md)
  - 최신 원격 수집 결과를 정보몽땅 변경, 게시판 최신 항목, 도시공간포털 원문, 자치구 고시공고 후보로 결합한다.
  - 공개자료 수가 늘어난 우선검토 후보와 원문 승격 후보를 먼저 판독한다.
- [analysis/cleanup-board-latest.md](analysis/cleanup-board-latest.md)
  - 우선검토 후보 30개의 공지사항, 조합입찰공고, 신속통합기획, 설계지침, 확정 사업비/분담금 목록을 최신순으로 요약한다.
  - 공개자료 수가 늘어난 사업장의 새 문서 후보를 먼저 확인하는 작업표다.
- [analysis/cleanup-board-review-queue.md](analysis/cleanup-board-review-queue.md)
  - 공개 항목 512건을 비용·분담금, 기반시설, 인가·고시, 이주·착공 전, 총회·협의체 신호로 분류한 검토 큐다.
  - P0/P1 항목을 사업별 리스크와 장기 가능성 메모에 반영할 때 사용한다.
- [analysis/project-risk-signal-summary.md](analysis/project-risk-signal-summary.md)
  - 후보 30개의 공식 근거, 교통입지, 정보몽땅 공개항목 리스크 신호를 사업장 단위로 합친 요약표다.
  - very_high/high 사업장을 먼저 현장 확인·원문 대조·사업별 메모 보강 대상으로 삼는다.
- [analysis/source-value-verification-queue.md](analysis/source-value-verification-queue.md)
  - 리스크 신호, 공식 근거 품질, 원문 텍스트 추출 상태를 결합해 어느 수치를 먼저 확정할지 정한 작업 큐다.
  - OCR 검수, 관리처분 수치 시점차, recordCode/원문 연결, 비용·기반시설 원문 대조를 P0/P1로 분리한다.
- [analysis/source-verification-sprint-plan.md](analysis/source-verification-sprint-plan.md)
  - 남은 P0/P1 원문 검증 60개를 S1 비용·기반시설, S2 recordCode/원문 URL, S3 OCR, S4 단계 충돌, S5 공란 보강으로 묶은 실행 패킷이다.
  - 매주 또는 수동 검증 때 어떤 원문을 먼저 열고 어떤 완료 기준으로 닫을지 확인한다.
- [analysis/s1-cost-infrastructure-workbook.md](analysis/s1-cost-infrastructure-workbook.md)
  - S1 비용·기반시설 대상 17개 사업장의 정보몽땅 공개항목, 고시 원문 스니펫, 닫아야 할 장부 필드를 한 행에 묶은 워크북이다.
  - 공사비·분담금·기반시설 신호를 원문 확인으로 확정/보류/충돌 처리할 때 먼저 연다.
- [analysis/s1-original-evidence-candidates.md](analysis/s1-original-evidence-candidates.md)
  - S1 로컬 원문에서 공공기여, 기반시설, 비용·분담금, 용적률 산정 수치 후보를 자동 추출한 표다.
  - 후보값은 확정값이 아니며, 공개항목 상세/첨부와 문맥 확인 후 장부·사업별 메모에 반영한다.
- [analysis/s1-evidence-review-board.md](analysis/s1-evidence-review-board.md)
  - S1 원문 수치 후보를 사업장·유형별 리뷰 묶음으로 압축한 보드다.
  - P0 공개항목과 연결된 비용·기반시설·공공기여 후보부터 confirmed/pending/conflict로 닫을 때 사용한다.
- [analysis/s2-source-link-closure-workbook.md](analysis/s2-source-link-closure-workbook.md)
  - S2 recordCode·원문 URL 닫기 대상 11개 사업장을 로컬 원문, 정보몽땅 보조근거, 원문 URL 확보 여부로 분리한 워크북이다.
  - 값 일치와 본고시 URL/recordCode 닫힘을 구분해 partial 항목을 confirmed/pending으로 처리할 때 사용한다.
- [analysis/s3-ocr-image-verification-workbook.md](analysis/s3-ocr-image-verification-workbook.md)
  - S3 OCR·이미지 검증 대상 8개 사업장을 수동 이미지 판정, 정밀도 보정, 부분확정, 원문 재연결 필요 상태로 분리한 워크북이다.
  - 이미지 판독값을 비교표에 반영하기 전에 기준값·상한값·후속 인가값을 나눌 때 사용한다.
- [analysis/s4-stage-conflict-resolution-workbook.md](analysis/s4-stage-conflict-resolution-workbook.md)
  - S4 사업시행·관리처분 시점 충돌 대상 2개 사업장을 시점별 분리, 공개항목 반영, 별첨/일자 보강 상태로 분리한 워크북이다.
  - 관리처분인가 단계의 수치를 단일 공식값으로 덮어쓰지 않고 고시·사업시행·관리처분 기준으로 나눌 때 사용한다.
- [analysis/s5-core-gap-fill-workbook.md](analysis/s5-core-gap-fill-workbook.md)
  - S5 핵심 공란 보강 대상 14개 사업장을 후보값 있는 공란, 후보 없는 공란, 원문 스니펫 승격, 단계상 미적용으로 분리한 워크북이다.
  - 결측처럼 보이는 필드를 실제 보강 후보와 단계상 보류값으로 나눠 장부를 닫을 때 사용한다.
- [analysis/source-verification-closure-ledger.md](analysis/source-verification-closure-ledger.md)
  - S1-S5 워크북의 남은 원문 검증 항목을 하나의 클로저 장부로 묶은 실행 목록이다.
  - 각 항목을 confirmed/pending/conflict/deferred 중 무엇으로 닫을지 결정할 때, P0/P1 우선순위와 열어야 할 출처를 같이 본다.
- [analysis/source-verification-decision-context-audit.md](analysis/source-verification-decision-context-audit.md)
  - 통합 클로저 장부에 붙은 decision이 현재 closure 문맥과 맞는지 점검한다.
  - `closure_id` 재배열이나 중복 decision 누적으로 생긴 오염을 먼저 분리할 때 연다.
- [analysis/source-verification-action-queue.md](analysis/source-verification-action-queue.md)
  - 클로저 장부 중 아직 확정값으로 쓰면 안 되는 pending/conflict 항목만 추린 실행 큐다.
  - 오늘 먼저 열 원문, 액션 유형, 닫는 기준을 상위 40건으로 압축해서 본다.
- [data/review/source-verification-closure-decisions.json](data/review/source-verification-closure-decisions.json)
  - 통합 클로저 장부에 적용되는 판정 로그다.
  - 장부를 다시 만들 때 이 파일을 읽어 기존 판정을 보존하므로, 수동 검증 결과는 이 파일에 누적한다.
- [analysis/core-value-confirmation-ledger.md](analysis/core-value-confirmation-ledger.md)
  - 후보 30개의 핵심 비교 수치를 필드 단위로 펼쳐 현재 값의 확인 상태를 관리한다.
  - 공란, OCR 검수 필요, 시점 충돌, 원문 연결 필요, fact-check 보고서 보유, 단계상 아직 적용 전을 구분한다.
  - 원문 링크 병목 중 정보몽땅 사업개요 등 공식 보조근거가 현재값과 직접 일치하는 항목을 별도 표시한다.
- [analysis/ocr-source-verification-packet.md](analysis/ocr-source-verification-packet.md)
  - `ocr_review_required` 수치를 OCR 텍스트 구간, 원문 이미지 경로, 주변 스니펫에 연결한다.
  - 원문 이미지와 OCR 숫자를 대조해 `confirmed_from_ocr_image`로 승격할 때 쓰는 작업 패킷이다.
- [analysis/ocr-source-review-triage.md](analysis/ocr-source-review-triage.md)
  - OCR 패킷을 이미지 확인 후보, 값 불일치 후보, 직접 이미지 확인 필요 항목으로 재분류한다.
  - 자양1의4처럼 OCR 원문 숫자와 장부 현재값이 다른 경우를 먼저 분리한다.
- [analysis/ocr-image-review-decisions.md](analysis/ocr-image-review-decisions.md)
  - OCR 트리아지 중 원문 이미지를 직접 확인한 수동 판정 로그다.
  - 가락1차현대 최고높이는 104.5m 정밀도 보정 필요, 대치쌍용2차 층수는 지상 최고35층만 부분확정으로 분리했다.
- [analysis/source-value-update-candidates.md](analysis/source-value-update-candidates.md)
  - 원문 이미지 판독값을 비교용 구조화 수치 보정 후보로 정리한다.
  - 비교 매트릭스의 `*_official` 값을 바로 덮어쓰지 않고 원문값, 권장 구조화값, 반영 방식을 분리한다.
- [analysis/source-link-repair-queue.md](analysis/source-link-repair-queue.md)
  - OCR 이미지 확인 후 남은 원문 연결 병목을 별도 작업표로 모은다.
  - 잘못 연결된 원문, recordCode/고시번호 연결 필요, 텍스트 추출 누락을 구분해 다음 검색·다운로드 대상을 정한다.
- [analysis/source-link-repair-candidates.md](analysis/source-link-repair-candidates.md)
  - 원문 연결 병목마다 이미 확보한 공식 후보 근거를 붙인다.
  - 정보몽땅 사업개요로 바로 값 대조가 가능한 항목과 새 고시/recordCode 검색이 필요한 항목을 분리한다.
- [analysis/source-link-closure-board.md](analysis/source-link-closure-board.md)
  - 원문 링크 후보를 값 일치, 원문 URL 확보, 로컬 본고시 텍스트 보유, 본고시/인가 원문 추가 필요로 나눠 닫힘 상태를 관리한다.
  - 값은 맞지만 본고시 원문 URL이나 recordCode가 남은 항목을 완료로 오인하지 않기 위한 보드다.
- [analysis/songpa-source-gap-audit.md](analysis/songpa-source-gap-audit.md)
  - 송파권 후보 10개의 서울도시공간포털 원문, 송파구청 고시공고 프로브, 정보몽땅 사업개요/공개항목, 기존 텍스트 상태를 한 표로 합친다.
  - 송파구청 검색 실패를 결론으로 두지 않고, 서울도시공간포털 recordCode·서울시보·정보몽땅 공개항목 중 다음 확인 경로를 고정한다.
- [analysis/songpa-value-review-packet.md](analysis/songpa-value-review-packet.md)
  - 송파권 후보 10개의 면적, 세대수, 용적률, 건폐율, 높이/층수, 기반시설, 공공기여를 원문 스니펫 단위로 검토한다.
  - 관리처분 단계의 시점차, 정보몽땅 보조값, 원문 스니펫 누락을 분리해 어떤 수치를 먼저 확정할지 정한다.
- [analysis/songpa-notice-value-corroboration.md](analysis/songpa-notice-value-corroboration.md)
  - 장미1,2,3차·송파한양2차·송파미성의 새로 연결된 원문을 직접 확정값, 상위계획 보조근거, 정의/시점 충돌로 분리한다.
  - 송파미성은 사업별 정비구역 지정고시로 승격 후보를 만들고, 장미·송파한양2차는 아파트지구 개발기본계획 문맥으로만 유지한다.
- [analysis/source-link-official-probe.md](analysis/source-link-official-probe.md)
  - P0 recordCode/고시 원문 미확인 사업장을 서울도시공간포털·광진구청에서 직접 검색한 결과다.
  - 원격 조회 산출물이므로 로컬 재생성 체인에는 넣지 않고 필요 시 별도 실행한다.
- [analysis/gangnam-songpa-notice-probe.md](analysis/gangnam-songpa-notice-probe.md)
  - 강남구청·송파구청 공식 고시공고에서 강남·송파 우선검토 후보의 사업명·단지명 키워드를 검색한 결과다.
  - 고신뢰 후보 첨부는 로컬 원문으로 내려받고, 중간 신뢰 후보는 사업명·위치·면적 대조 전까지 승격하지 않는다.
- [analysis/cleanup-process-page-probes.md](analysis/cleanup-process-page-probes.md)
  - 삼성1차·자양번영로3나길의 정보몽땅 공정별 페이지 18개를 직접 조회해 사업별 표/첨부 신호가 있는지 확인한다.
  - 공정 페이지가 공통 절차 안내인지, 실제 사업별 원문/첨부가 있는지 분리한다.
- [analysis/recordcode-dead-end-audit.md](analysis/recordcode-dead-end-audit.md)
  - 서울도시공간포털 사업구역 레이어는 확인됐지만 지도 `recordCode`/고시 원문이 자동 연결되지 않는 사업장을 모은다.
  - 저신뢰 공식 검색 후보와 실제 고신뢰 원문 후보를 분리해 수동 검색·담당부서 문의 대상을 정한다.
- [analysis/focus-area-strategy.md](analysis/focus-area-strategy.md)
  - 강남·잠실/송파·구의/광진 생활권별 연구 가설, 병목, 우선 사업장, 현장 루트를 정리한다.
- [analysis/long-term-potential-scorecard.md](analysis/long-term-potential-scorecard.md)
  - 입지, 단계, 규모, 공공 변화 동인, 공식 근거 품질을 분리해 장기 관찰 가설을 비교한다.
  - 점수와 확신도를 분리해 원문 병목이 있는 사업의 재평가 트리거를 관리한다.
- [analysis/focus-area-decision-memo.md](analysis/focus-area-decision-memo.md)
  - 강남·잠실/송파·구의/광진별 잠정 입장, 지지 근거, 승격 조건, 반증 조건, 다음 증거를 한 장으로 묶는다.
  - 관찰 유지, 조건부 관찰, 회신 병목 분리, 원문확정 보류를 구분해 생활권 가설을 과대해석하지 않게 한다.
- [analysis/research-session-playbook.md](analysis/research-session-playbook.md)
  - 15분 triage, P0 회신 처리, 주간 공식 갱신, 현장 답사, 새 업데이트 intake, 월간 시장/정책 점검을 세션별로 나눈다.
  - 각 세션의 먼저 열 파일, 명령/액션, 판정 gate, 멈출 조건, 갱신할 파일을 고정한다.
- [analysis/official-update-scenario-playbook.md](analysis/official-update-scenario-playbook.md)
  - 새 고시·공고·보도자료·시장자료를 발견했을 때 intake JSON 예시, 증거 상태, 라우팅 위치를 출처별로 고정한다.
  - context_only, 텍스트 추출 필요, high-blocking 회신 경로를 구분해 업데이트를 과대해석하지 않게 한다.
- [analysis/official-source-activation-checklist.md](analysis/official-source-activation-checklist.md)
  - 수동 알림 신청, 수동 월간 검색, API 키 연결이 필요한 공식 출처 7개를 별도 관리한다.
  - `data/review/official-source-activation-intake.json`에 신청/활성화 상태를 누적하고, 알림·API·context의 완료 gate를 분리한다.
- [analysis/official-source-activation-validation.md](analysis/official-source-activation-validation.md)
  - 공식 출처 활성화 intake의 오류/경고와 아직 기록하지 않은 출처를 분리해 보여주는 검증 보드다.
- [data/review/official-source-activation-intake.README.md](data/review/official-source-activation-intake.README.md)
  - 활성화 상태 입력 규칙, 허용 상태값, 실행 순서를 정리한 입력 가이드다.
- [data/review/official-source-activation-intake-examples.json](data/review/official-source-activation-intake-examples.json)
  - 활성화 대상 7개 출처에 대한 복사용 예시 행이다.
- [analysis/official-context-search-queue.md](analysis/official-context-search-queue.md)
  - 잠실 MICE, 압구정 한강변, 동서울터미널, 구의·자양축 등 공공 촉매별 월간 공식 검색어를 고정한다.
  - 서울시 주택·도시계획, 서울시 교통, 정보소통광장, 서울도시공간포털 검색 결과를 context_only와 원문 후보로 분리한다.
- [analysis/official-context-search-results-board.md](analysis/official-context-search-results-board.md)
  - 월간 context 검색 결과를 검증하고, 보도자료/결재문서는 context_only로, 원문 후보는 official-update/source-verification으로 라우팅한다.
  - `data/review/official-context-search-results-intake.json`에 검색 결과를 수동 입력한다.
- [data/review/official-context-search-results-intake.README.md](data/review/official-context-search-results-intake.README.md)
  - 공식 context 검색 결과 입력 규칙, 허용 상태값, 상태별 필수 증거를 정리한 가이드다.
- [data/review/official-context-search-results-intake-examples.json](data/review/official-context-search-results-intake-examples.json)
  - `found_context`, `found_original_candidate`, `found_verified_original`, `not_found` 복사용 예시 행이다.
- [analysis/official-context-impact-board.md](analysis/official-context-impact-board.md)
  - 공식 context 검색 결과가 어느 생활권·사업장 촉매에 연결되는지와 승격 금지 gate를 확인한다.
  - context_only는 현장답사·월간 모니터링 질문으로만 쓰고, 고시·계획·교통대책 원문 전에는 점수/단계 근거로 쓰지 않는다.
- [analysis/research-hypothesis-ledger.md](analysis/research-hypothesis-ledger.md)
  - 장기 가능성, 공공 개발 촉매, 리스크 신호, 딥다이브 질문, 재평가 런북을 사업별 가설 장부로 묶는다.
  - 각 사업장의 승격 조건과 반증 조건을 고정해 새 원문·현장 관찰·공공계획 업데이트가 들어왔을 때 가설을 어떻게 바꿀지 관리한다.
- [analysis/project-evidence-binder.md](analysis/project-evidence-binder.md)
  - 후보 30개 사업장별 공식 원천, 로컬 원문/텍스트, 원문 링크 병목, 핵심 수치 검증 상태, 먼저 열 파일을 묶는다.
  - 공식 원문 기반 딥다이브를 시작할 때 근거 파일을 찾는 바인더다.
- [analysis/project-due-diligence-board.md](analysis/project-due-diligence-board.md)
  - 사업장별 원문 상태, 다음 액션, 현장 루트, 공공 촉매, 시장 보조신호를 한 행으로 묶는다.
  - 실사점수는 투자 매력도가 아니라 지금 어떤 증거를 먼저 열어야 하는지 정하는 리서치 순서다.
- [analysis/research-artifact-dependency-map.md](analysis/research-artifact-dependency-map.md)
  - 재생성 단계, 주요 JSON summary, 선언된 입력·출력, 내부 의존 edge를 한 문서로 묶는다.
  - 입력 파일이나 decision 로그를 수정한 뒤 어떤 downstream 산출물을 확인해야 하는지 추적하는 운영 지도다.
- [analysis/update-impact-ledger.md](analysis/update-impact-ledger.md)
  - 새 원문, 공개항목, 현장 관찰, 공공계획, 시장 데이터가 들어왔을 때 어느 사업별 가설·메모·비교표·완료 병목에 영향을 주는지 연결한다.
  - 업데이트 발견 후 입력 파일, 먼저 읽을 산출물, 영향받는 산출물, 재생성 명령, 판정 gate를 한 행에서 확인한다.
- [analysis/research-next-moves.md](analysis/research-next-moves.md)
  - 장기 가능성, 리서치 상태, 원문 수치 장부, 검증 큐를 합쳐 이번에 먼저 볼 사업과 액션을 정한다.
  - 원문 확정, 비용/기반시설 대조, 현장 동선 확인, 정책/공공개발 모니터링, 정기 추적 트랙으로 나눠 실행 순서를 잡는다.
- [analysis/fieldwork-route-planner.md](analysis/fieldwork-route-planner.md)
  - 우선검토 후보 30개를 지하철 답사 루트 8개로 묶고, 각 정지점의 현장 체크와 방문 전 열 공식 원문을 연결한다.
  - 잠실역-잠실나루, 석촌-가락, 압구정 한강변, 대치-개포, 구의-자양, 강변-광나루 축을 실제 이동 순서로 본다.
- [analysis/fieldwork-observation-notebook.md](analysis/fieldwork-observation-notebook.md)
  - 지하철 답사에서 기록할 보행시간, 횡단 대기, 도로/한강 단절, 환승, 사진 경로, 해석 변화를 사업장별로 구조화한다.
  - 실제 관찰값은 `data/review/fieldwork-observations.json`에 누적하고, 재생성 후 사업별 메모·교통입지 가설에 반영한다.
- [data/review/fieldwork-observations.README.md](data/review/fieldwork-observations.README.md)
  - 현장 답사 관찰값을 처음 입력할 때 쓰는 필드 규칙과 루트별 예시 파일 위치를 안내한다.
  - `data/review/fieldwork-observation-examples.json`에서 8개 루트별 복사용 예시를 확인한다.
- [analysis/autonomous-mobility-scenario.md](analysis/autonomous-mobility-scenario.md)
  - 자율주행 보편화 시 역세권 프리미엄, 도로 접근성 보완, 보행단절 리스크가 어떻게 다르게 읽히는지 후보 30개를 재분류한다.
  - 교통입지 확정값이 아니라 현장조사와 공식계획 재평가 우선순위를 정하는 시나리오 점검표다.
- [analysis/public-development-catalyst-map.md](analysis/public-development-catalyst-map.md)
  - 잠실 MICE, 압구정 한강변관리, 동서울터미널, 구의·자양 한강축 등 공공 개발 동인을 사업장 재평가 트리거와 연결한다.
  - 보도자료를 확정값으로 쓰지 않고, 어떤 공식 원문을 확인해야 하는지 출처 단위로 고정한다.
- [analysis/catalyst-trigger-matrix.md](analysis/catalyst-trigger-matrix.md)
  - 공공 개발·교통 촉매 업데이트가 들어왔을 때 사업장 가설을 상향, 하향, 원문 보강, 공식 회신 선행 중 어디에 둘지 판정한다.
  - 자율주행·교통 시나리오는 역세권 대체 여부가 아니라 보행 단절, 환승, 간선도로 접근성 민감도 점검에 사용한다.
- [analysis/focus-deep-dive-queue.md](analysis/focus-deep-dive-queue.md)
  - 진행단계, 장기 가능성, 리스크, 시장 거래 신호, 공공 촉매, 자율주행 시나리오, 다음 공식자료를 사업장별 한 행으로 묶는다.
  - 생활권별로 어떤 사업장을 먼저 딥다이브할지 정하는 실행 큐다.
- [analysis/focus-area-action-queue.csv](analysis/focus-area-action-queue.csv)
  - 다음에 처리할 OCR/HWP/지도보강/원문대조 액션 큐다.
- [analysis/gwangjin-gu-notice-fact-check.md](analysis/gwangjin-gu-notice-fact-check.md)
  - 광진구청 고시공고 원문에서 워커힐·광장극동·자양1의4의 면적, 공람/인가일, 용적률, 기반시설 조건을 대조한다.
  - 자양1의4는 OCR 원문 면적 8,473.82㎡와 정보몽땅/사업구역 레이어 8,419.91㎡ 충돌을 별도 검수 과제로 둔다.
- [analysis/seoul-sibo-original-notice-fact-check.md](analysis/seoul-sibo-original-notice-fact-check.md)
  - 서울시보 제4146호에서 광장극동 본고시 제2026-249호 원문을 확보하고, PDF 266-302쪽 OCR로 구역면적·세대수·용적률·공공기여를 대조한다.
- [analysis/management-stage-fact-check.md](analysis/management-stage-fact-check.md)
  - 관리처분인가 단계인 잠실우성4차와 가락삼익맨숀의 사업개요 수치와 고시문 수치를 대조한다.
  - 세대수·면적·층수처럼 시점 차이가 있는 값은 `source_time_diff_or_conflict`로 분리한다.
  - 정보몽땅 공개항목에서 사업시행인가일, 관리처분인가일, 일부 사업시행 세대수·관리처분 공사비를 보강한다.
- [analysis/management-stage-value-resolution.md](analysis/management-stage-value-resolution.md)
  - 관리처분인가 사업의 수치 차이를 고시 시점, 사업시행 공개항목, 관리처분 공개항목으로 나눠 기록한다.
  - 잠실우성4차와 가락삼익의 세대수·용적률·공사비·인가일을 덮어쓰지 않고 시점별 값으로 유지한다.
- [analysis/transport-location-context.md](analysis/transport-location-context.md)
  - 후보 30개의 교통축, 생활권 변화 동인, 현장 확인 포인트, 공식 검증 출처를 비교한다.
  - 자율주행 보편화 시나리오는 도로 접근성·환승·터미널 기능 민감도로 별도 기록한다.
- [analysis/source-text-extraction-audit.md](analysis/source-text-extraction-audit.md)
  - 서울도시공간포털·광진구청 PDF/HWP/HWPX 원문의 텍스트 추출 커버리지와 `soffice` 필요 여부를 감사한다.
  - OCR 기반 텍스트는 원문 이미지 대조가 필요한 P1 큐로 따로 표시한다.
- [analysis/hwp-conversion-audit.md](analysis/hwp-conversion-audit.md)
  - HWP/HWPX 원문만 따로 모아 자체 변환 경로, OCR 필요 여부, `soffice` 차단 여부를 감사한다.
  - 현재 HWP/HWPX 9건 모두 텍스트 확보, 변환 차단 0건, 이미지형 HWP OCR 대조 1건이다.
  - 새 HWP/HWPX 단건은 `python3 scripts/convert_hwp_document.py <원문> -o <텍스트> --diagnostics <진단.json>`으로 `soffice` 없이 먼저 진단한다.
- [analysis/official-update-registry.md](analysis/official-update-registry.md)
  - 최신 업데이트를 확인할 공식 출처, 확인 주기, 자동화 상태, 관련 스크립트를 한 표로 관리한다.
  - 고시·공고, 서울시보, 정비사업 정보몽땅, 자치구 공고, 정책/결재문서, 시장 데이터 출처를 우선순위별로 묶는다.
- [analysis/official-update-runbook.md](analysis/official-update-runbook.md)
  - 주간 점검, recordCode 병목, HWP/OCR 후처리, 시장 데이터 수집, 정책 컨텍스트 스캔을 실행 순서로 정리한다.
  - 원격 수집 명령, 후속 로컬 재생성, 먼저 읽을 산출물, 판정 규칙을 분리한다.
- [analysis/official-update-runbook-checklist.md](analysis/official-update-runbook-checklist.md)
  - 런북을 원격 호출, 로컬 처리, API 키 필요, 수동 갱신 단계로 펼친 드라이런 체크리스트다.
  - 주간/월간 점검 전에 어떤 명령부터 실행하고 어떤 산출물을 판독할지 확인한다.
- [analysis/official-change-detection-board.md](analysis/official-change-detection-board.md)
  - 출처별 업데이트 발견 시 감지 방식, 기록 위치, 판정 gate, 영향 산출물을 연결한다.
  - `official-update-registry`, `official-source-freshness-ledger`, `update-impact-ledger`, `catalyst-trigger-matrix`를 출처 기준으로 묶은 운영 보드다.
- [analysis/official-update-intake-board.md](analysis/official-update-intake-board.md)
  - `data/review/official-update-intake.json`에 수동 입력한 새 공식 업데이트를 검증하고 적절한 decision/intake 파일로 라우팅한다.
  - source_id, 사업장 순위, 증거 상태, 적용 상태 오류를 먼저 잡아 원문·정책·시장 업데이트가 섞이지 않게 한다.
- [analysis/official-update-source-verification-bridge.md](analysis/official-update-source-verification-bridge.md)
  - source verification 경로 공식 업데이트가 어떤 `closure_id`와 이미 연결됐는지, 같은 고시를 공유하는 연관 사업장까지 포함해 보여준다.
  - `official-update-intake`를 바로 `applied`로 올려도 되는지 확인할 때 먼저 본다.
- [data/review/official-update-intake.README.md](data/review/official-update-intake.README.md)
  - 새 공식 업데이트를 처음 기록하는 inbox의 필드 규칙과 예시를 둔다.
  - 실제 입력은 `data/review/official-update-intake.json`에 누적하고, 생성 스크립트는 이 파일을 덮어쓰지 않는다.
- [analysis/residual-gap-interpretation-audit.md](analysis/residual-gap-interpretation-audit.md)
  - 핵심 수치 장부에 남은 공란·보류·부분확정 항목을 비교표에서 어떻게 사용할지 분류한다.
  - 높은 차단, 중간 차단, 단계상 보류, 출처 주석 사용, 신규 원문 재개 트리거를 사업별로 나눈다.
- [analysis/high-blocking-source-escalation-packet.md](analysis/high-blocking-source-escalation-packet.md)
  - high blocking 잔여 원문 16건을 3개 사업장별 담당부서/정보몽땅 확인 패킷으로 묶는다.
  - 문의 제목·본문, 확인 필드, 첨부할 내부 근거, 회신 후 로컬 갱신 절차를 바로 실행 가능한 형태로 정리한다.
- [analysis/high-blocking-public-summary-boundary.md](analysis/high-blocking-public-summary-boundary.md)
  - high blocking 필드 중 정보몽땅 사업개요 등 공식 요약값으로 참고 가능한 항목과 본고시/인가 원문 없이는 확정 승격하면 안 되는 항목을 분리한다.
  - 서울도시공간포털 레이어와 정보몽땅 요약값이 충돌하는 경우 단일 대표값으로 병합하지 않도록 경계 판정을 남긴다.
- [analysis/high-blocking-public-web-probe.md](analysis/high-blocking-public-web-probe.md)
  - high blocking 3개 사업장의 비회원 공식 웹 화면에서 확인 가능한 값과 공개화면만으로 닫히지 않는 이유를 기록한다.
  - 정보몽땅 고시/공고 0건, 로그인 필요, 계 필드 공란 같은 외부 확인 필요 근거를 남긴다.
- [analysis/high-blocking-official-search-rerun.md](analysis/high-blocking-official-search-rerun.md)
  - 광진구청 재검색, 서울도시공간포털 결정고시 검색, 정보몽땅 공개화면 확인 결과를 high blocking 3개 사업장 단위로 묶는다.
  - 자양번영로3나길 대표 지번 검색어를 `자양동 588-22`로 보정한 뒤에도 원문 후보가 없는 상태와 외부 회신 필요 판정을 고정한다.
- [analysis/high-blocking-contact-channel-registry.md](analysis/high-blocking-contact-channel-registry.md)
  - high blocking 3개 사업장의 관할 부서, 민원창구, 정보몽땅 헬프데스크/담당자 현황 URL을 공식 채널 단위로 정리한다.
  - 개별 담당자 개인정보는 저장하지 않고, 회신을 받을 때 `data/review/high-blocking-source-response-intake.json`에 넣을 항목과 값 승격 경계를 고정한다.
- [analysis/high-blocking-info-disclosure-packet.md](analysis/high-blocking-info-disclosure-packet.md)
  - 담당부서/정보몽땅 회신으로 닫히지 않을 때 정보공개청구 또는 공식 민원으로 전환할 제목·본문·요청 자료명·intake 필드를 사업장별로 정리한다.
  - 공개 URL이 없거나 부분공개/비공개 회신이 온 경우에도 자료명, 보유부서, 사유, 후속 열람 경로를 구조화해 남기도록 한다.
- [analysis/high-blocking-filing-tracker.md](analysis/high-blocking-filing-tracker.md)
  - high blocking 3개 사업장의 정보공개청구/공식 민원 접수 상태, 회신 intake, decision 승격 절차를 한 화면에서 추적한다.
  - 접수 후에는 `data/review/high-blocking-source-response-intake.json`에 접수번호·회신값을 넣고 `node scripts/process-high-blocking-response-workflow.mjs`로 dry-run한다.
- [analysis/high-blocking-intake-validation.md](analysis/high-blocking-intake-validation.md)
  - high blocking 회신 intake의 상태값, 필수 필드, 증거 URL/파일 경로, decision 승격 준비 상태를 검증한다.
  - 실제 회신을 넣은 뒤 error 0건을 확인하고 decision dry-run을 본다.
- [analysis/high-blocking-response-intake-guide.md](analysis/high-blocking-response-intake-guide.md)
  - 회신 유형별 `response_status` 선택 기준과 사업장별 입력 예시를 정리한다.
  - 실제 intake 파일을 오염시키지 않도록 예시는 `data/review/high-blocking-response-intake-examples.json`에 따로 둔다.
- [data/review/high-blocking-filing-outbox/README.md](data/review/high-blocking-filing-outbox/README.md)
  - high blocking 3개 사업장의 정보공개청구/공식 민원 제출 준비 파일을 사업장별 `.txt`로 나눈 outbox다.
  - 접수 후 접수번호와 회신 내용을 intake에 기록하는 절차를 함께 둔다.
- [analysis/high-blocking-filing-checklist.md](analysis/high-blocking-filing-checklist.md)
  - high blocking 3개 사업장을 실제 접수 전후에 닫기 위한 체크리스트다.
  - 제출 전 확인, 접수 직후 intake 기록 필드, 회신 후 decision 승격 규칙을 한 화면에서 본다.
- [analysis/high-blocking-response-decision-drafts.md](analysis/high-blocking-response-decision-drafts.md)
  - `data/review/high-blocking-source-response-intake.json`에 입력한 담당부서/정보몽땅 회신을 source-verification decision 초안으로 검증한다.
  - append 가능, 회신 대기, intake 보완 필요 상태를 나눠 원본 decision 파일을 직접 수정하기 전 검수한다.
- [analysis/high-blocking-response-workflow-run.md](analysis/high-blocking-response-workflow-run.md)
  - high blocking 회신 intake 검증, decision 초안 생성, decision dry-run/apply, 선택적 전체 재생성까지 한 번에 실행한 최신 workflow 로그다.
  - 기본은 dry-run이고, 검수 후 `node scripts/process-high-blocking-response-workflow.mjs --write`로 decision 장부에 append한다.
- [analysis/reassessment-watchlist.md](analysis/reassessment-watchlist.md)
  - 장기 가능성 가설을 다시 열어야 하는 사업별 업데이트 신호, 공식 출처, 실행 런북을 연결한다.
  - 새 고시·공개항목·OCR 판독·정책/교통 문서가 나왔을 때 어떤 사업별 메모와 점수카드를 다시 볼지 정한다.
- [project-notes/README.md](project-notes/README.md)
  - 사업별 1페이지 메모로 들어가는 색인이다.

## 시작 파일

1. [seoul-redevelopment-research-playbook.md](seoul-redevelopment-research-playbook.md)
   - 공식 출처 우선순위
   - 정비사업 정보몽땅 검색 코드
   - 사업별 메모 템플릿
   - 강남·잠실·구의 생활권별 질문

2. [seoul-redevelopment-watchlist.csv](seoul-redevelopment-watchlist.csv)
   - 초기 관심사업장 15개
   - 강남 5개, 잠실/송파 5개, 구의/광진 5개
   - 정비사업 정보몽땅에서 확인한 진행단계와 공개자료 수 포함

3. [data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.csv](data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.csv)
   - 정비사업 정보몽땅에서 자동 수집한 강남구·송파구·광진구 사업장 목록
   - 2026-06-23 KST 기준 총 125개: 강남구 48개, 송파구 59개, 광진구 18개
   - 재건축, 재개발, 가로주택정비, 소규모재건축, 리모델링 등 포함

4. [scripts/fetch-cleanup-projects.mjs](scripts/fetch-cleanup-projects.mjs)
   - 정비사업 정보몽땅 사업장 목록을 다시 수집하는 Node.js 스크립트
   - 실행: `node scripts/fetch-cleanup-projects.mjs`
   - 산출물: `data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.{csv,json}`
   - 실행 시 기존/신규 목록을 `data/cleanup/snapshots/`에 보존

5. [analysis/cleanup-snapshot-diff.md](analysis/cleanup-snapshot-diff.md)
   - 정비사업 정보몽땅 최신 수집분과 직전 스냅샷의 단계·공개자료 수·신규/삭제 사업장 변화 감시
   - 2026-06-23 KST 재수집 기준 변경 0건

6. [scripts/generate-cleanup-snapshot-diff.mjs](scripts/generate-cleanup-snapshot-diff.mjs)
   - 정비사업 정보몽땅 스냅샷 변경 감시 문서/CSV/JSON을 생성하는 스크립트
   - 실행: `node scripts/generate-cleanup-snapshot-diff.mjs`

7. [analysis/cleanup-board-latest.md](analysis/cleanup-board-latest.md)
   - 우선검토 후보 30개 사업장의 정보몽땅 내부 게시판 최신 공개 항목
   - 30개 사업장, 150개 게시판, 공개 항목 512건 수집

8. [data/cleanup/cleanup-board-latest-priority-candidates.csv](data/cleanup/cleanup-board-latest-priority-candidates.csv)
   - 게시판 유형, 제목, 공고일/등록일, 마감일, 상세 URL을 필터링하기 위한 CSV

9. [scripts/fetch-cleanup-board-latest.mjs](scripts/fetch-cleanup-board-latest.mjs)
   - 우선검토 후보의 공지사항·조합입찰공고·분담금 목록 등 최신 공개 항목을 수집하는 스크립트
   - 실행: `node scripts/fetch-cleanup-board-latest.mjs`

10. [analysis/cleanup-board-review-queue.md](analysis/cleanup-board-review-queue.md)
   - 정보몽땅 공개 항목 512건의 제목 기반 신호 분류와 우선 검토 큐
   - 압구정 기반시설/공공기여 용역, 잠실·가락 이주비/HUG, 광진권 추정분담금 같은 항목을 우선 표시

11. [scripts/generate-cleanup-board-review-queue.mjs](scripts/generate-cleanup-board-review-queue.mjs)
   - 최신 공개 항목을 리스크/진행 신호별 검토 큐로 분류하는 스크립트
   - 실행: `node scripts/generate-cleanup-board-review-queue.mjs`

12. [analysis/project-risk-signal-summary.md](analysis/project-risk-signal-summary.md)
   - 후보 30개의 단계·공식 근거·교통입지·공개항목 P0/P1 신호를 사업장별로 합친 리스크 요약
   - 압구정·잠실·가락·개포·광진권의 very_high/high 사업장을 우선 확인 대상으로 표시

13. [scripts/generate-project-risk-signal-summary.mjs](scripts/generate-project-risk-signal-summary.mjs)
   - 비교 매트릭스, 교통입지 컨텍스트, 공개항목 검토 큐를 결합해 사업장별 리스크 신호 요약을 생성하는 스크립트
   - 실행: `node scripts/generate-project-risk-signal-summary.mjs`

14. [analysis/source-value-verification-queue.md](analysis/source-value-verification-queue.md)
   - 사업장별 리스크 신호, 공식 근거 감사, 원문 텍스트 추출 상태를 결합한 원문 수치 검증 작업 큐
   - 비용·기반시설, OCR 검수, 관리처분 수치 시점차, recordCode 연결을 우선순위별로 분리

15. [scripts/generate-source-value-verification-queue.mjs](scripts/generate-source-value-verification-queue.mjs)
   - 원문 수치 검증 큐를 생성하는 스크립트
   - 실행: `node scripts/generate-source-value-verification-queue.mjs`
   - 실행 패킷 생성: `node scripts/generate-source-verification-sprint-plan.mjs`
   - S1 비용·기반시설 워크북 생성: `node scripts/generate-s1-cost-infrastructure-workbook.mjs`
   - S1 원문 수치 후보 추출: `node scripts/generate-s1-original-evidence-candidates.mjs`
   - S1 원문 증거 리뷰 보드 생성: `node scripts/generate-s1-evidence-review-board.mjs`
   - S2 원문 링크 클로저 워크북 생성: `node scripts/generate-s2-source-link-closure-workbook.mjs`
   - S3 OCR·이미지 수치 검증 워크북 생성: `node scripts/generate-s3-ocr-image-verification-workbook.mjs`
   - S4 사업시행·관리처분 시점 충돌 해소 워크북 생성: `node scripts/generate-s4-stage-conflict-resolution-workbook.mjs`
   - S5 핵심 공란 보강 워크북 생성: `node scripts/generate-s5-core-gap-fill-workbook.mjs`

16. [analysis/core-value-confirmation-ledger.md](analysis/core-value-confirmation-ledger.md)
   - 후보 30개의 고시번호, 면적, 세대수, 용적률, 인가일 등 핵심 값을 필드 단위로 펼친 확인 상태 장부
   - 각 값의 상태를 공란/OCR검수/원문값보정필요/부분확정/시점충돌/원문연결필요/수동확정대기로 구분

17. [scripts/generate-core-value-confirmation-ledger.mjs](scripts/generate-core-value-confirmation-ledger.mjs)
   - 핵심 수치 확인 장부를 생성하는 스크립트
   - 실행: `node scripts/generate-core-value-confirmation-ledger.mjs`
   - OCR 검수 후속 생성: `node scripts/generate-ocr-source-verification-packet.mjs` 후 `node scripts/generate-ocr-source-review-triage.mjs`, 수동 이미지 검수 후 `node scripts/generate-ocr-image-review-decisions.mjs`, 보정 후보 생성은 `node scripts/generate-source-value-update-candidates.mjs`, 원문 연결 병목 큐는 `node scripts/generate-source-link-repair-queue.mjs`, 병목별 확보 후보 근거는 `node scripts/generate-source-link-repair-candidates.mjs`
   - 원격 공식 검색 프로브: `node scripts/probe-source-link-officials.mjs`
   - 정보몽땅 공정 페이지 프로브: `node scripts/probe-cleanup-process-pages.mjs`
   - recordCode 미연결 감사: `node scripts/generate-recordcode-dead-end-audit.mjs`

18. [analysis/priority-redevelopment-candidates.md](analysis/priority-redevelopment-candidates.md)
   - 공식 목록 125개에서 뽑은 우선검토 후보 30개
   - 강남 10개, 잠실/송파 10개, 구의/광진 10개
   - 단계, 사업유형, 공개자료 수, 생활권 가설을 기준으로 정렬

19. [analysis/priority-redevelopment-candidates.csv](analysis/priority-redevelopment-candidates.csv)
   - 후보 30개의 점수, 등급, 추정 역세권, 리스크 메모, 다음 질문
   - 정비사업 정보몽땅 사업장 URL과 서울도시공간포털 지도 URL 포함
   - 스프레드시트에서 필터링하기 위한 작업용 파일

20. [scripts/rank-redevelopment-candidates.mjs](scripts/rank-redevelopment-candidates.mjs)
   - 공식 목록을 리서치 우선순위로 압축하는 스코어링 스크립트
   - 실행: `node scripts/rank-redevelopment-candidates.mjs`

21. [project-notes/README.md](project-notes/README.md)
   - 우선검토 후보 30개의 사업별 1페이지 메모 초안
   - 공식 사업장 URL, 단계, 원문 추출 상태, OCR 이미지 수동 판독, 사업장별 리스크 신호, 교통입지, 시장 데이터 키, 원문 확인 체크리스트 포함

22. [scripts/generate-project-notes.mjs](scripts/generate-project-notes.mjs)
   - 후보 CSV와 공식 원문/리스크/교통/시장 산출물을 결합해 `project-notes/` 메모 파일을 재생성하는 스크립트
   - 실행: `node scripts/generate-project-notes.mjs`

전체 로컬 분석 산출물을 같은 순서로 다시 만들 때는 [scripts/regenerate-research-artifacts.mjs](scripts/regenerate-research-artifacts.mjs)를 쓴다. 이 명령은 원격 웹사이트 재수집, OCR, 시장 데이터 API 호출 없이 이미 받은 `data/` 원천과 검수 로그를 기준으로 `analysis/`와 `project-notes/` 산출물을 재생성한다.

```bash
node scripts/regenerate-research-artifacts.mjs
node scripts/regenerate-research-artifacts.mjs --dry-run
node scripts/regenerate-research-artifacts.mjs --list
```

23. [data/cleanup/cafe-menu-links-priority-candidates.csv](data/cleanup/cafe-menu-links-priority-candidates.csv)
   - 우선검토 후보 30개의 정비사업 정보몽땅 사업장 내부 메뉴 링크
   - 사업개요, 추진경과, 정비계획, 조합설립인가, 사업시행계획서, 관리처분계획서 등 포함

24. [scripts/fetch-cafe-menu-links.mjs](scripts/fetch-cafe-menu-links.mjs)
   - 후보 30개의 공식 사업장 페이지에서 내부 메뉴 링크를 수집하는 스크립트
   - 실행: `node scripts/fetch-cafe-menu-links.mjs`

25. [data/cleanup/project-summaries-priority-candidates.csv](data/cleanup/project-summaries-priority-candidates.csv)
   - 후보 30개의 정비사업 정보몽땅 사업개요 수치
   - 정비구역 면적, 조합원 수, 용도지역, 대지면적, 용적률, 층수, 세대수 등

26. [scripts/fetch-project-summaries.mjs](scripts/fetch-project-summaries.mjs)
   - 후보 30개의 `사업개요` 페이지에서 공식 수치를 수집하는 스크립트
   - 실행: `node scripts/fetch-project-summaries.mjs`

27. [data/cleanup/management-stage-doc-links.csv](data/cleanup/management-stage-doc-links.csv)
   - 잠실우성4차와 가락삼익맨숀의 정보몽땅 공개항목, 분담금 목록, 공식 URL, HTML 스냅샷 경로
   - 개인별 조회 데이터는 수집하지 않고 공개 목록명·일자와 공개표 수치만 보존

28. [scripts/fetch-management-stage-doc-links.mjs](scripts/fetch-management-stage-doc-links.mjs)
   - 관리처분 단계 수치 대조에 필요한 정보몽땅 공개항목 HTML을 수집하는 스크립트
   - 실행: `node scripts/fetch-management-stage-doc-links.mjs`

29. [data/cleanup/gwangjin-stage-public-docs.csv](data/cleanup/gwangjin-stage-public-docs.csv)
   - 광진권 고시 recordCode 병목 사업의 조합설립·추진위 공개항목
   - 인가/승인일, 토지등소유자 수, 동의자 수, 동의율을 구조화

30. [scripts/fetch-gwangjin-stage-public-docs.mjs](scripts/fetch-gwangjin-stage-public-docs.mjs)
   - 광진권 단계 공개항목 HTML을 수집하는 스크립트
   - 실행: `node scripts/fetch-gwangjin-stage-public-docs.mjs`

31. [data/urban/urban-map-details-priority-candidates.csv](data/urban/urban-map-details-priority-candidates.csv)
   - 후보 30개의 서울도시공간포털 지도·고시 매칭 결과
   - 정비사업 정보몽땅 지도 URL과 대표지번 기반 보강 URL을 함께 사용
   - 현재 26개는 고시 제목, 고시 코드, 고시 URL, 구역명, 면적 포함

32. [scripts/fetch-urban-map-details.mjs](scripts/fetch-urban-map-details.mjs)
   - 서울도시공간포털 지도 팝업과 `getList` API에서 고시·구역 정보를 수집하는 스크립트
   - 실행: `node scripts/fetch-urban-map-details.mjs`

33. [data/urban/representative-lot-map-candidates.csv](data/urban/representative-lot-map-candidates.csv)
   - 지도 URL이 없던 후보의 대표지번을 PNU로 변환한 뒤 서울도시공간포털 ArcGIS 레이어에서 recordCode 후보를 찾은 결과
   - 현재 지도 URL 누락 17개 중 13개에 high/medium 신뢰도 추천 URL 확보

34. [scripts/fetch-representative-lot-map-candidates.mjs](scripts/fetch-representative-lot-map-candidates.mjs)
   - 서울도시공간포털 법정동 API, 필지 도형 레이어, 정비사업/지구단위계획 레이어를 이용해 대표지번 기반 지도 후보를 수집하는 스크립트
   - 실행: `node scripts/fetch-representative-lot-map-candidates.mjs`

35. [data/urban/map-missing-business-layer-details.csv](data/urban/map-missing-business-layer-details.csv)
   - 지도 recordCode가 없던 광진권 4건의 서울도시공간포털 사업구역 레이어 보강 결과
   - 사업구역은 high confidence로 매칭됐지만 결정고시 recordCode와 고시/인가 원문 연결이 후속 과제

36. [analysis/map-missing-business-layer-review.md](analysis/map-missing-business-layer-review.md)
   - 사업구역 레이어 보강 4건의 해석, 포털 진행단계, 면적/세대수/FAR 보강값, 다음 확인 과제
   - 광장극동은 사업구역 기반 고시 후보와 정정고시 원문 파일을 확보했고, 같은 첨부 폴더의 본고시 파일명 후보 8건에서는 PDF 미확인이나 서울시보 제4146호에서 본고시 원문을 확보
   - 광진구청 고시공고 검색으로 워커힐, 광장극동, 자양1의4 관련 공고와 첨부 원문 추가 확보
   - 광장극동 서울시보 본고시 대조표: [analysis/seoul-sibo-original-notice-fact-check.md](analysis/seoul-sibo-original-notice-fact-check.md)
   - 광진구청 원문 수치 대조표: [analysis/gwangjin-gu-notice-fact-check.md](analysis/gwangjin-gu-notice-fact-check.md)
   - 삼성1차는 고시/인가 원문 확인 필요
   - 관련 데이터: `data/urban/business-layer-notice-candidates.csv`, `data/urban/business-layer-notice-attachments.csv`, `data/urban/original-notice-file-probes.csv`, `data/urban/gwangjin-gu-notice-candidates.csv`, `data/urban/gwangjin-gu-notice-attachments.csv`
   - 재수집: `node scripts/fetch-business-layer-notice-candidates.mjs --download`
   - 광진구청 고시공고 재수집: `node scripts/fetch-gwangjin-gu-notice-candidates.mjs --download`
   - 광진구청 첨부 OCR/추출: `NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs` 후 `/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_gwangjin_gu_notice_text.py`
   - 본고시 파일명 후보 확인: `node scripts/probe-original-notice-files.mjs`
   - 서울시보 본고시 OCR: `NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-seoul-sibo-page-range.mjs --pdf=data/urban/files/27-seoul-sibo-4146-20260430.pdf --start=266 --end=302 --key=27-seoul-sibo-4146-20260430-2026-249 --dpi=180`

37. [data/urban/urban-notice-details-priority-candidates.csv](data/urban/urban-notice-details-priority-candidates.csv)
   - 서울도시공간포털 고시 상세 API에서 수집한 고시번호, 고시일, 고시유형, 소관, 원문 파일 URL
   - 현재 매칭 사업장 26개를 고시 원문 파일(PDF/HWP)과 연결, 고시 코드 기준으로는 23개

38. [data/urban/urban-notice-attachments-priority-candidates.csv](data/urban/urban-notice-attachments-priority-candidates.csv)
   - 고시 원문 파일과 결정도 이미지 링크 목록
   - 현재 지도 기반 원문 파일 25건, 결정도 이미지 100건
   - 사업구역 기반 보강 원문 파일 1건은 `data/urban/business-layer-notice-attachments.csv`에 별도 기록
   - `local_path`, `byte_size`, `sha256`, `download_status`로 로컬 보관 상태 추적

39. [data/urban/files](data/urban/files)
   - 서울도시공간포털에서 내려받은 고시 원문 PDF/HWP와 결정도 이미지 126개
   - 현재 211MB, 다운로드 실패 0건

40. [data/urban/text/README.md](data/urban/text/README.md)
   - 고시 원문 PDF/HWP 텍스트 추출 상태와 키워드 추출 결과
   - 현재 고시 원문 26개 중 PDF/HWP 텍스트 추출 19개, PDF OCR 6개, HWP 이미지 OCR 1개로 텍스트 확보 합계 26개
   - 이미지형 PDF OCR 재생성: `NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-scanned-notice-pdfs.mjs`
   - 이미지형 HWP OCR 재생성: `NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-image-hwp-notices.mjs`
   - 광진구청 첨부 텍스트: PDF/HWP/HWPX 14개 중 직접 추출 12개, OCR 2개로 텍스트 확보 14개
   - `notice-key-fields.csv`에서 면적, 용적률, 세대수, 기반시설, 공공기여 관련 원문 스니펫 확인

41. [analysis/source-evidence-audit.md](analysis/source-evidence-audit.md)
   - 후보 30개의 공식 근거 품질 등급, 리스크 플래그, 다음 원문 확인 작업
   - 현재 등급 분포: A 3건, B 23건, C 2건, D 2건, E 0건
   - 원문 보강 병목 6건을 먼저 처리할 후보로 분리
   - 재생성: `node scripts/generate-source-evidence-audit.mjs`

42. [analysis/management-stage-value-resolution.md](analysis/management-stage-value-resolution.md)
   - 잠실우성4차와 가락삼익의 관리처분 단계 수치 차이를 고시 시점·사업시행 공개항목·관리처분 공개항목으로 분리
   - 실행: `node scripts/generate-management-stage-value-resolution.mjs`

43. [scripts/extract_urban_notice_text.py](scripts/extract_urban_notice_text.py)
   - 로컬 고시 원문에서 텍스트와 1차 정비계획 키워드 문맥을 추출하는 스크립트
   - 실행: `/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_urban_notice_text.py`
   - HWP는 `scripts/extract_hwp5_text.py`의 직접 HWP5 본문 추출을 먼저 사용하고, `--try-hwp-soffice`를 명시한 경우에만 LibreOffice fallback을 시도

44. [scripts/extract_hwp5_text.py](scripts/extract_hwp5_text.py)
   - LibreOffice 없이 HWP5 OLE 컨테이너의 `BodyText/Section*` 스트림에서 본문 텍스트를 추출하는 보조 스크립트
   - 실행: `python3 scripts/extract_hwp5_text.py data/urban/files/example.HWP -o /tmp/example.txt`

45. [scripts/convert_hwp_document.py](scripts/convert_hwp_document.py)
   - 새로 받은 HWP/HWPX 단건을 `soffice` 없이 텍스트화하고 변환 경로, 글자 수, HWP BinData 이미지 존재 여부를 JSON으로 진단
   - 실행: `python3 scripts/convert_hwp_document.py data/urban/files/example.HWP -o /tmp/example.txt --diagnostics /tmp/example-diagnostics.json`
   - 이미지형 HWP는 `--extract-images-dir /tmp/example-images --allow-low-confidence`로 BinData 이미지와 manifest를 추출

46. [scripts/extract_gwangjin_gu_notice_text.py](scripts/extract_gwangjin_gu_notice_text.py)
   - 광진구청 고시공고 첨부 PDF/HWP/HWPX에서 텍스트와 키워드 문맥을 추출
   - HWPX는 LibreOffice 없이 zip 내부 XML을 직접 읽음
   - 실행: `/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_gwangjin_gu_notice_text.py`

47. [analysis/source-text-extraction-audit.md](analysis/source-text-extraction-audit.md)
   - 서울도시공간포털·광진구청 원문 PDF/HWP/HWPX의 텍스트 확보 상태와 추출 방식을 한 표로 감사
   - 현재 `soffice` 필요 항목, 미해결 추출 실패, OCR 원문 대조 큐, 짧은 서식/표지성 텍스트를 분리
   - 현황: 원문/첨부 40개 중 텍스트 확보 40개, `soffice` 필요 0개, OCR 대조 9개, 짧은 서식/표지 확인 5개

48. [analysis/hwp-conversion-audit.md](analysis/hwp-conversion-audit.md)
   - HWP/HWPX 원문만 따로 모아 자체 변환 경로와 미해결 변환 여부를 감사
   - 현황: HWP/HWPX 9개 중 텍스트 확보 9개, `soffice` 차단 0개, 이미지형 HWP OCR 대조 1개

49. [scripts/generate-source-text-extraction-audit.mjs](scripts/generate-source-text-extraction-audit.mjs)
   - 원문 텍스트 manifest 2종을 합쳐 추출 커버리지와 텍스트 품질 플래그 감사표를 생성하는 스크립트
   - 실행: `node scripts/generate-source-text-extraction-audit.mjs`

50. [scripts/generate-hwp-conversion-audit.mjs](scripts/generate-hwp-conversion-audit.mjs)
   - 원문 텍스트 manifest와 HWP OCR manifest를 합쳐 HWP/HWPX 전용 변환 감사표를 생성
   - 실행: `node scripts/generate-hwp-conversion-audit.mjs`

51. [scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs](scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs)
   - 광진구청 첨부 중 이미지형 PDF를 Tesseract OCR로 텍스트화
   - 실행: `NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs`

52. [scripts/generate-gwangjin-gu-notice-fact-check.mjs](scripts/generate-gwangjin-gu-notice-fact-check.mjs)
   - 광진구청 첨부 텍스트에서 사업별 핵심 수치·일자·범위 차이를 대조
   - 실행: `node scripts/generate-gwangjin-gu-notice-fact-check.mjs`

53. [analysis/transport-location-context.md](analysis/transport-location-context.md)
   - 후보 30개의 교통입지·생활권 컨텍스트 비교표
   - 교통축, 노선/수단, 변화 동인, 현장 확인, 공식 출처, 다음 확인 작업 포함

54. [analysis/autonomous-mobility-scenario.md](analysis/autonomous-mobility-scenario.md)
   - 자율주행 보편화 시나리오에서 역세권 지속성, 도로 접근성 보완, 보행단절 현장 확인 우선순위를 후보 30개에 부여
   - 관련 데이터: `analysis/autonomous-mobility-scenario.csv`, `analysis/autonomous-mobility-scenario.json`

55. [scripts/generate-autonomous-mobility-scenario.mjs](scripts/generate-autonomous-mobility-scenario.mjs)
   - 교통입지 컨텍스트, 장기 가능성 점수카드, 현장 루트를 결합해 자율주행 보편화 시나리오 점검표를 생성
   - 실행: `node scripts/generate-autonomous-mobility-scenario.mjs`

56. [analysis/public-development-catalyst-map.md](analysis/public-development-catalyst-map.md)
   - 잠실 MICE·국제교류복합지구, 압구정 한강변관리, 동서울터미널, 구의·자양 한강축 등 공공 개발 동인을 후보 사업장과 연결
   - 관련 데이터: `analysis/public-development-catalyst-map.csv`, `analysis/public-development-catalyst-map.json`

57. [scripts/generate-public-development-catalyst-map.mjs](scripts/generate-public-development-catalyst-map.mjs)
   - 교통입지 컨텍스트, 장기 가능성 점수카드, 재평가 감시표, 공식 업데이트 레지스트리를 결합해 공공 촉매 맵 생성
   - 실행: `node scripts/generate-public-development-catalyst-map.mjs`

58. [analysis/focus-deep-dive-queue.md](analysis/focus-deep-dive-queue.md)
   - 사업장별 진행단계, 장기 가능성, 리스크, 시장 거래 신호, 공공 촉매, 자율주행 시나리오, 다음 공식자료를 한 행으로 묶은 딥다이브 큐
   - 관련 데이터: `analysis/focus-deep-dive-queue.csv`, `analysis/focus-deep-dive-queue.json`

59. [scripts/generate-focus-deep-dive-queue.mjs](scripts/generate-focus-deep-dive-queue.mjs)
   - 비교 매트릭스, 장기 가능성, 다음 액션, 리스크, 시장 신호, 공공 촉매, AV 시나리오를 결합해 딥다이브 큐 생성
   - 실행: `node scripts/generate-focus-deep-dive-queue.mjs`

60. [analysis/official-context-sources.csv](analysis/official-context-sources.csv)
   - 교통입지·생활권 검증에 쓸 공식 출처 목록
   - 서울시 교통 분야, 서울시 주택·도시계획 분야, 서울도시공간포털, 정비사업 정보몽땅, 서울 정보소통광장

61. [analysis/official-update-registry.md](analysis/official-update-registry.md)
   - 공식 업데이트 출처별 확인 주기, 권역 관련성, 자동화 상태, 산출물 연결 관계
   - 서울 재개발·재건축 변경 신호를 어디서 먼저 확인할지 정하는 운영용 레지스트리

62. [analysis/official-update-runbook.md](analysis/official-update-runbook.md)
   - 최신 정보 확인 시 실행할 주간/월간/ad hoc 명령 순서와 판독 산출물
   - 관련 데이터: `analysis/official-update-runbook.csv`, `analysis/official-update-runbook.json`

63. [analysis/official-update-runbook-checklist.md](analysis/official-update-runbook-checklist.md)
   - 공식 업데이트 런북을 원격/로컬/API 키 필요 단계로 펼친 실행 체크리스트
   - 관련 데이터: `analysis/official-update-runbook-checklist.csv`, `analysis/official-update-runbook-checklist.json`

64. [analysis/official-refresh-summary.md](analysis/official-refresh-summary.md)
   - 주간 공식 수집 결과를 변경 큐와 최신 공개항목 큐로 압축한 운영 요약
   - 관련 데이터: `analysis/official-refresh-summary.csv`, `analysis/official-refresh-summary.json`

65. [analysis/residual-gap-interpretation-audit.md](analysis/residual-gap-interpretation-audit.md)
   - 잔여 공란·보류·부분확정 필드의 비교표 사용 규칙과 재개 트리거
   - 관련 데이터: `analysis/residual-gap-interpretation-audit.csv`, `analysis/residual-gap-interpretation-audit.json`

66. [analysis/high-blocking-source-escalation-packet.md](analysis/high-blocking-source-escalation-packet.md)
   - high blocking 잔여 원문을 관할 자치구/정보몽땅 확인 요청 단위로 묶은 실행 패킷
   - 관련 데이터: `analysis/high-blocking-source-escalation-packet.csv`, `analysis/high-blocking-source-escalation-packet.json`

67. [scripts/generate-high-blocking-source-escalation-packet.mjs](scripts/generate-high-blocking-source-escalation-packet.mjs)
   - 잔여 해석 감사표의 `manual_source_escalation` 항목을 사업장별 문의 제목·본문·필드 확인표로 변환
   - 실행: `node scripts/generate-high-blocking-source-escalation-packet.mjs`

68. [analysis/high-blocking-public-summary-boundary.md](analysis/high-blocking-public-summary-boundary.md)
   - high blocking 공식 요약값을 참고값, 공식 출처 충돌, 고시번호 필요, 관리처분 별첨 필요로 분리
   - 관련 데이터: `analysis/high-blocking-public-summary-boundary.csv`, `analysis/high-blocking-public-summary-boundary.json`

69. [analysis/high-blocking-public-web-probe.md](analysis/high-blocking-public-web-probe.md)
   - high blocking 3개 사업장의 비회원 공식 웹 화면 확인 결과와 공개화면만으로 닫히지 않는 이유를 기록
   - 관련 데이터: `analysis/high-blocking-public-web-probe.csv`, `analysis/high-blocking-public-web-probe.json`

70. [scripts/generate-high-blocking-public-web-probe.mjs](scripts/generate-high-blocking-public-web-probe.mjs)
   - `data/review/high-blocking-public-web-probe.json`을 읽어 공식 웹 프로브 산출물을 생성
   - 실행: `node scripts/generate-high-blocking-public-web-probe.mjs`
   - 후속 재실행 감사: [analysis/high-blocking-official-search-rerun.md](analysis/high-blocking-official-search-rerun.md), [scripts/generate-high-blocking-official-search-rerun.mjs](scripts/generate-high-blocking-official-search-rerun.mjs)

71. [scripts/fetch-high-blocking-public-web-probe.mjs](scripts/fetch-high-blocking-public-web-probe.mjs)
   - high blocking 3개 사업장의 정보몽땅 공식 웹 화면을 재조회하고 입력 JSON을 갱신
   - 실행: `node scripts/fetch-high-blocking-public-web-probe.mjs`
   - HTML 캐시: `data/urban/high-blocking-public-web-probe-html/`

72. [analysis/high-blocking-info-disclosure-packet.md](analysis/high-blocking-info-disclosure-packet.md)
   - 공개 검색/일반 문의로 닫히지 않는 high blocking 원문 병목을 정보공개청구 또는 공식 민원 본문으로 전환
   - 관련 데이터: `analysis/high-blocking-info-disclosure-packet.csv`, `analysis/high-blocking-info-disclosure-packet.json`

73. [scripts/generate-high-blocking-info-disclosure-packet.mjs](scripts/generate-high-blocking-info-disclosure-packet.mjs)
   - 원문 확인 패킷, 문의 채널, 공식 검색 재실행 결과, 회신 intake를 합쳐 정보공개청구 실행 패킷을 생성
   - 실행: `node scripts/generate-high-blocking-info-disclosure-packet.mjs`

74. [data/review/high-blocking-source-response-intake.json](data/review/high-blocking-source-response-intake.json)
   - 담당부서/정보몽땅 회신을 입력하는 템플릿
   - `response_status`, 고시번호, 고시일, 원문 URL, 확인값, 회신 메모를 채운 뒤 decision 초안을 생성
   - 입력 후 [analysis/high-blocking-intake-validation.md](analysis/high-blocking-intake-validation.md)에서 오류 0건을 확인

75. [analysis/high-blocking-response-decision-drafts.md](analysis/high-blocking-response-decision-drafts.md)
   - 회신 intake를 `source-verification-closure-decisions.json`에 붙일 수 있는 decision 초안으로 검증
   - 관련 데이터: `analysis/high-blocking-response-decision-drafts.json`, `analysis/high-blocking-intake-validation.json`

76. [scripts/generate-high-blocking-response-decision-drafts.mjs](scripts/generate-high-blocking-response-decision-drafts.mjs)
   - high blocking 외부 회신 intake를 검증하고 append 가능한 decision JSON 초안을 생성
   - 실행: `node scripts/generate-high-blocking-response-decision-drafts.mjs`

77. [scripts/process-high-blocking-response-workflow.mjs](scripts/process-high-blocking-response-workflow.mjs)
   - high blocking 회신 intake 검증, guide/draft 재생성, decision dry-run/apply, 선택적 전체 재생성을 묶은 후처리 스크립트
   - 실행: `node scripts/process-high-blocking-response-workflow.mjs`
   - 검수 후 반영: `node scripts/process-high-blocking-response-workflow.mjs --write`
   - 로그: `analysis/high-blocking-response-workflow-run.md`, `analysis/high-blocking-response-workflow-run.json`

78. [analysis/research-completion-cockpit.md](analysis/research-completion-cockpit.md)
   - goal 완료를 막는 남은 필수 증거를 P0/P1 실행 보드로 통합
   - 관련 데이터: `analysis/research-completion-cockpit.csv`, `analysis/research-completion-cockpit.json`

79. [scripts/generate-research-completion-cockpit.mjs](scripts/generate-research-completion-cockpit.mjs)
   - 시장 원자료 상태, high blocking 회신/정보공개 패킷, 최종 재생성 게이트를 합쳐 completion cockpit을 생성
   - 실행: `node scripts/generate-research-completion-cockpit.mjs`

80. [scripts/generate-official-update-registry.mjs](scripts/generate-official-update-registry.mjs)
   - 공식 업데이트 출처 레지스트리와 실행 런북을 생성하는 스크립트
   - 실행: `node scripts/generate-official-update-registry.mjs`

81. [scripts/generate-transport-location-context.mjs](scripts/generate-transport-location-context.mjs)
   - 비교 매트릭스에 교통축·생활권 변화·현장 확인 포인트를 붙이는 스크립트
   - 실행: `node scripts/generate-transport-location-context.mjs`

82. [scripts/fetch-urban-notice-details.mjs](scripts/fetch-urban-notice-details.mjs)
   - 서울도시공간포털 `ntfc/getNtfcDt.json`에서 고시 상세와 첨부 링크를 수집하는 스크립트
   - 실행: `node scripts/fetch-urban-notice-details.mjs`
   - 실제 파일까지 저장하려면: `node scripts/fetch-urban-notice-details.mjs --download`

83. [data/market/project-market-areas.csv](data/market/project-market-areas.csv)
   - 후보 30개의 법정동 코드, 실거래 지역코드, 서울 열린데이터 필터, R-ONE 지역/지표 매핑
   - API 키 준비 후 실거래/R-ONE 수집을 시작하기 위한 작업용 테이블

84. [data/market/official-market-data-sources.csv](data/market/official-market-data-sources.csv)
   - 서울 열린데이터광장, 국토교통부 실거래 OpenAPI, R-ONE 통계의 접근 방식과 수집 목적

85. [scripts/generate-market-data-matrix.mjs](scripts/generate-market-data-matrix.mjs)
   - 사업장별 시장 데이터 연결 매트릭스를 생성하는 스크립트
   - 실행: `node scripts/generate-market-data-matrix.mjs`

86. [data/market/market-fetch-plan.csv](data/market/market-fetch-plan.csv)
   - 2024-01~2026-06 기준으로 생성한 실거래 API 호출 계획
   - 현재 총 690개 호출 단위: 국토교통부 300개, 서울 열린데이터광장 390개
   - API 키가 없으면 `missing_env:*` 상태로 남고, 키 준비 후 같은 스크립트로 수집

87. [scripts/fetch-market-raw-data.mjs](scripts/fetch-market-raw-data.mjs)
   - `project-market-areas.json` 기준으로 국토교통부/서울 열린데이터광장 원자료를 수집하는 스크립트
   - 계획표 생성: `node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606`
   - 키 준비 후 수집: `DATA_GO_KR_SERVICE_KEY=... node scripts/fetch-market-raw-data.mjs --fetch --sources=molit-apt-trade,molit-apt-rent --from=202401 --to=202606`

88. [data/market/API_KEYS.md](data/market/API_KEYS.md)
   - 서울 열린데이터광장, 공공데이터포털, R-ONE 키 준비와 실행 명령
   - 호출 실패 시 확인해야 할 엔드포인트/서비스명 조정 포인트 포함

89. [data/market/manual-import/manifest.json](data/market/manual-import/manifest.json)
   - 공식 사이트에서 수동으로 내려받은 시장 원자료 파일 경로, 출처, 기간, 지역 범위를 기록하는 manifest
   - 키 없이 원자료를 먼저 확보할 때 `local_path`, `downloaded_at`, `coverage_from/to`를 채운다.
   - 70개 작업별 파일 경로는 `data/market/manual-import/download-intake.json`에 기록하며, `node scripts/sync-market-manual-download-intake.mjs`로 워크북 기준 행을 보강한다.
   - 서울시 매매 실거래는 `node scripts/fetch-seoul-open-data-manual-tasks.mjs`로 OA-21275 공식 Sheet CSV를 내려받아 작업별 파일로 자동 분할할 수 있다.
   - 국토부 RTMS 아파트·연립다세대 매매/전월세는 `node scripts/fetch-rtms-manual-tasks.mjs`로 조건별 자료제공 CSV를 내려받아 작업별 파일로 자동 분할할 수 있다.
   - R-ONE 가격지수·거래현황은 `node scripts/fetch-r-one-statistics.mjs`로 공식 Open API 표 데이터를 서울·권역·자치구 지표 CSV로 자동 수집할 수 있다.

90. [data/market/manual-import/column-mapping.json](data/market/manual-import/column-mapping.json)
   - 수동 원자료 컬럼명을 표준 거래/지표 필드로 연결하는 매핑 템플릿
   - 자동 컬럼 추정이 부족하면 `column_map`을 채운 뒤 정규화 스크립트를 다시 실행

91. [analysis/market-manual-import-readiness.md](analysis/market-manual-import-readiness.md)
   - 수동 다운로드 원자료의 파일 존재와 메타데이터 준비 상태를 감사
   - 관련 데이터: `analysis/market-manual-import-readiness.csv`, `analysis/market-manual-import-readiness.json`

92. [scripts/generate-market-manual-import-readiness.mjs](scripts/generate-market-manual-import-readiness.mjs)
   - `data/market/manual-import/manifest.json`을 읽어 수동 반입 준비도 산출물을 생성
   - 실행: `node scripts/generate-market-manual-import-readiness.mjs`

93. [analysis/market-manual-ingest-manifest.md](analysis/market-manual-ingest-manifest.md)
   - 작업별 다운로드 상태와 출처별 manifest를 결합해 정규화 입력 manifest를 생성
   - 관련 데이터: `analysis/market-manual-ingest-manifest.csv`, `analysis/market-manual-ingest-manifest.json`, `data/market/manual-import/ingest-manifest.json`

94. [scripts/generate-market-manual-ingest-manifest.mjs](scripts/generate-market-manual-ingest-manifest.mjs)
   - 권장 파일명 또는 `download-intake.json`으로 감지된 70개 작업별 파일을 반입 manifest로 승격
   - 실행: `node scripts/generate-market-manual-ingest-manifest.mjs`
   - 작업표가 바뀐 뒤에는 먼저 `node scripts/sync-market-manual-download-intake.mjs`를 실행해 intake 행을 동기화한다.

95. [analysis/market-manual-column-audit.md](analysis/market-manual-column-audit.md)
   - 수동 다운로드 CSV/XLSX의 컬럼명과 필수 필드 매칭 준비도를 감사
   - 관련 데이터: `analysis/market-manual-column-audit.csv`, `analysis/market-manual-column-audit.json`

96. [scripts/generate-market-manual-column-audit.py](scripts/generate-market-manual-column-audit.py)
   - `data/market/manual-import/ingest-manifest.json`의 파일을 읽어 CSV/XLSX/JSON 컬럼 진단을 수행
   - 실행: `python3 scripts/generate-market-manual-column-audit.py`

97. [analysis/market-manual-normalization-audit.md](analysis/market-manual-normalization-audit.md)
   - 수동 원자료를 표준 거래/지표 스키마로 옮기고 사업장 키워드 매칭 가능 여부를 감사
   - 관련 데이터: `analysis/market-manual-normalization-audit.csv`, `analysis/market-manual-normalization-audit.json`

98. [scripts/normalize-market-manual-import.py](scripts/normalize-market-manual-import.py)
   - `ingest-manifest.json`과 `column-mapping.json`을 읽어 `manual-*` 정규화 거래/지표 산출물을 생성
   - 실행: `python3 scripts/normalize-market-manual-import.py`
   - 후속 시장 신호 요약: `python3 scripts/generate-market-transaction-signal-summary.py`

99. [korea-urban-planning-research-roadmap.md](korea-urban-planning-research-roadmap.md)
   - 전국·서울 도시계획 리서치 큰 그림
   - 지역 가능성 평가 프레임
   - 최신 업데이트 확인 순서

100. [korea-real-estate-data-sources.md](korea-real-estate-data-sources.md)
   - 실거래, R-ONE, KOSIS, 공시지가, 건축물대장, 공간정보 출처
   - 개발계획·사업 진행상황 데이터 수집 경로

101. [korea-land-development-docs.md](korea-land-development-docs.md)
   - 국토종합계획, 교통망 계획, 국토 개발 관련 법령 요약

## 현재 리서치 범위

- 강남: 압구정, 대치, 은마, 우성·쌍용 등 핵심 재건축
- 잠실/송파: 잠실5단지, 잠실우성, 잠실우성4차, 신천동 재건축 완료/진행 사례
- 구의/광진: 광장극동, 워커힐, 구의동 가로주택, 자양 재개발·재건축
- 강동권: 천호3구역·성내미주·신동아1,2차·상일동 빌라단지 통합재건축·고덕강일1역세권·고덕대우아파트의 단계 추적과 수치 보드 연동
- 약수동 주변: 신당1·9구역, 금호14-1(중개선) 등 adjacent 후보의 원문 비교군 유지

- 상태(2026-06-24 기준)
  - 강동권 shortlist 7건 중 3건(상일동 빌라단지 통합재건축, 고덕강일1역세권, 고덕대우아파트 소규모재건축)은 noticeCode 미보유로 서울도시공간포털 공공문서 자동 연결이 미완료.
  - noticeCode 보유 7건은 `analysis/expansion-urban-notice-collection-queue.md`의 상세 텍스트까지 확보돼 비교 축은 동작 중.
  - 확장권 3개 수치 확인이 막힌 구간(정비사업정보공개)은 53개 공개구분 페이지 모두 doc_count=0이고 일부 페이지가 인증회원 전용 응답을 반환해 현재 공식 원문 열람이 제한됨.

## 다음 작업 후보

1. `data/review/high-blocking-filing-outbox/`의 3개 제출 파일로 공식 민원/정보공개청구를 접수하고, 회신을 `data/review/high-blocking-source-response-intake.json`에 입력한 뒤 `node scripts/process-high-blocking-response-workflow.mjs`로 dry-run한다.
2. OCR 텍스트가 붙은 PDF/HWP 원문은 이미지와 스니펫을 대조해 확정 수치로 승격한다.
3. 강동권 확장권에서는 `analysis/expansion-gangdong-stage-watch-board.md` 기준으로 상일동·고덕권 단계표를 주간 기준 업데이트하고, noticeCode 미보유 항목의 공식 채널 보완 경로를 찾는다.
4. 시장 데이터는 서울 열린데이터광장, 국토부 RTMS, R-ONE 자동 수집 스크립트로 갱신하고, 공공데이터포털 키가 준비되면 API 수집 결과와 수동 공식 파일을 대조한다.
5. 압구정·잠실·광장/자양을 먼저 골라 공식 원문 기반 딥다이브를 만든다.
6. `analysis/transport-location-context.csv`의 현장 확인 항목을 따라 역 접근, 도로 단절, 한강 접근, 터미널/업무지구 영향을 기록한다.
