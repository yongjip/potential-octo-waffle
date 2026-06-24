# 서울 재개발·재건축 리서치 운영 노트

작성 기준: 2026-06-23 (Asia/Seoul)

## 목적

강남·잠실·구의 생활권의 재개발·재건축과 도시계획 변화를 공식 원문 기준으로 추적한다. 목표는 단기 매수 후보를 찍는 것이 아니라, 각 지역의 장기 가능성과 리스크를 같은 기준으로 비교할 수 있는 개인 리서치 체계를 만드는 것이다.

## 현재 산출물

- `seoul-redevelopment-watchlist.csv`: 초기 관심사업장 15개
- `data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.csv`: 공식 사업장 목록 125개
- `data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json`: 같은 목록의 구조화 원본
- `data/cleanup/snapshots/`: 정비사업 정보몽땅 사업장 목록의 실행 시점별 스냅샷
- `scripts/fetch-cleanup-projects.mjs`: 정비사업 정보몽땅 사업장 목록 재수집 스크립트
- `analysis/cleanup-snapshot-diff.md`: 직전/현재 스냅샷의 진행단계·공개자료 수·신규/삭제 사업장 변경 감시
- `analysis/cleanup-snapshot-diff.csv`: 같은 변경 감시 결과의 스프레드시트용 파일
- `scripts/generate-cleanup-snapshot-diff.mjs`: 정비사업 정보몽땅 스냅샷 변경 감시 생성 스크립트
- `data/cleanup/cleanup-board-latest-priority-candidates.csv`: 우선검토 후보 30개의 공지사항·조합입찰공고·분담금 목록 등 최신 공개 항목
- `analysis/cleanup-board-latest.md`: 공개자료 수 변화가 생겼을 때 먼저 확인할 사업장 게시판 최신 항목 요약
- `scripts/fetch-cleanup-board-latest.mjs`: 사업장 게시판 최신 공개 항목 수집 스크립트
- `analysis/cleanup-board-review-queue.md`: 공개 항목 512건을 리스크/진행 신호별로 분류한 P0/P1 검토 큐
- `analysis/cleanup-board-review-queue.csv`: 같은 검토 큐의 스프레드시트용 파일
- `scripts/generate-cleanup-board-review-queue.mjs`: 최신 공개 항목을 검토 큐로 분류하는 스크립트
- `analysis/project-risk-signal-summary.md`: 공식 근거·교통입지·공개항목 신호를 결합한 사업장별 리스크 요약
- `analysis/project-risk-signal-summary.csv`: 같은 사업장별 리스크 요약의 스프레드시트용 파일
- `scripts/generate-project-risk-signal-summary.mjs`: 사업장별 리스크 신호 요약 생성 스크립트
- `analysis/source-value-verification-queue.md`: 리스크 신호·공식 근거·원문 텍스트 상태를 결합한 원문 수치 검증 큐
- `analysis/source-value-verification-queue.csv`: 같은 원문 수치 검증 큐의 스프레드시트용 파일
- `scripts/generate-source-value-verification-queue.mjs`: 원문 수치 검증 큐 생성 스크립트
- `analysis/core-value-confirmation-ledger.md`: 후보 30개의 핵심 비교 수치를 필드 단위로 펼친 확인 상태 장부
- `analysis/core-value-confirmation-ledger.csv`: 같은 핵심 수치 확인 장부의 스프레드시트용 파일
- `scripts/generate-core-value-confirmation-ledger.mjs`: 핵심 수치 확인 장부 생성 스크립트
- `analysis/ocr-source-verification-packet.md`: OCR 검수 필요 수치를 원문 이미지 경로와 OCR 스니펫에 연결한 검수 패킷
- `analysis/ocr-source-verification-packet.csv`: 같은 OCR 원문 검수 패킷의 스프레드시트용 파일
- `scripts/generate-ocr-source-verification-packet.mjs`: OCR 원문 검수 패킷 생성 스크립트
- `analysis/ocr-source-review-triage.md`: OCR 패킷을 이미지 확인 후보, 값 불일치 후보, 직접 이미지 확인 대상으로 재분류한 검수표
- `analysis/ocr-source-review-triage.csv`: 같은 OCR 수치 검수 트리아지의 스프레드시트용 파일
- `scripts/generate-ocr-source-review-triage.mjs`: OCR 수치 검수 트리아지 생성 스크립트
- `analysis/ocr-image-review-decisions.md`: 원문 이미지 직접 판독 결과를 장부 상태로 넘기는 수동 결정 로그
- `analysis/ocr-image-review-decisions.csv`: 같은 OCR 이미지 수동 검수 결정의 스프레드시트용 파일
- `scripts/generate-ocr-image-review-decisions.mjs`: OCR 이미지 수동 검수 결정표 생성 스크립트
- `analysis/source-value-update-candidates.md`: OCR 이미지 수동 판독값을 비교용 구조화 수치 보정 후보로 정리한 작업표
- `analysis/source-value-update-candidates.csv`: 같은 원문 수치 보정 후보의 스프레드시트용 파일
- `scripts/generate-source-value-update-candidates.mjs`: 원문 수치 보정 후보 생성 스크립트
- `analysis/research-status-dashboard.md`: 후보 30개의 원문 검증 태스크, 핵심 수치 검토 항목, OCR/recordCode 병목, 생활권별 남은 작업량을 모은 상태판
- `analysis/research-status-dashboard.csv`: 같은 리서치 상태판의 스프레드시트용 파일
- `scripts/generate-research-status-dashboard.mjs`: 리서치 상태판 생성 스크립트
- `analysis/priority-redevelopment-candidates.md`: 생활권별 우선검토 후보 30개
- `analysis/priority-redevelopment-candidates.csv`: 후보 30개 작업용 CSV
- `scripts/rank-redevelopment-candidates.mjs`: 공식 목록을 우선순위 후보로 압축하는 스크립트
- `project-notes/README.md`: 우선검토 후보 30개의 사업별 메모 색인
- `project-notes/*.md`: 공식 원문·OCR 이미지 수동 판독·리스크 신호·교통입지·시장 데이터 키를 묶은 사업별 1페이지 메모 초안
- `scripts/generate-project-notes.mjs`: 후보 CSV와 공식 원문/리스크/교통/시장 산출물을 결합해 사업별 메모를 생성하는 스크립트
- `analysis/project-comparison-matrix.md`: 후보 30개의 단계·원문 커버리지·정보몽땅 단계 공개항목·OCR 이미지 수동 판독·시장 데이터 키 비교 문서
- `analysis/project-comparison-matrix.csv`: 후보 30개 비교 매트릭스
- `scripts/generate-project-comparison-matrix.mjs`: 비교 매트릭스 생성 스크립트
- `analysis/focus-area-strategy.md`: 생활권별 연구 가설, 병목, 우선 사업장, 현장 루트
- `analysis/focus-area-action-queue.csv`: 다음 작업 액션 큐
- `scripts/generate-focus-area-strategy.mjs`: 생활권별 전략 생성 스크립트
- `analysis/management-stage-fact-check.md`: 관리처분인가 사업의 사업개요 수치와 고시문 수치 대조
- `analysis/management-stage-fact-check.csv`: 같은 대조 결과의 스프레드시트용 파일
- `scripts/generate-management-stage-fact-check.mjs`: 관리처분 단계 원문 수치 대조 생성 스크립트
- `analysis/management-stage-value-resolution.md`: 관리처분인가 사업의 고시 시점·사업시행 공개항목·관리처분 공개항목 수치 해소표
- `analysis/management-stage-value-resolution.csv`: 같은 관리처분 수치 시점 해소표의 스프레드시트용 파일
- `scripts/generate-management-stage-value-resolution.mjs`: 관리처분 수치 시점 해소표 생성 스크립트
- `analysis/source-evidence-audit.md`: 후보 30개의 공식 근거 품질 등급, 원문 검증 병목, 다음 원문 확인 작업
- `analysis/source-evidence-audit.csv`: 같은 공식 근거 품질 감사표의 스프레드시트용 파일
- `scripts/generate-source-evidence-audit.mjs`: 공식 근거 품질 감사표 생성 스크립트
- `analysis/transport-location-context.md`: 후보 30개의 교통축, 생활권 변화, 현장 확인 포인트, 공식 출처 비교
- `analysis/transport-location-context.csv`: 같은 교통입지·생활권 컨텍스트의 스프레드시트용 파일
- `analysis/official-context-sources.csv`: 교통입지·생활권 가설 검증에 쓸 공식 출처 목록
- `scripts/generate-transport-location-context.mjs`: 교통입지·생활권 컨텍스트 생성 스크립트
- `analysis/official-update-registry.md`: 고시·공고, 서울시보, 정보몽땅, 자치구 공고, 정책/결재문서, 시장 데이터의 업데이트 확인 순서와 주기
- `analysis/official-update-registry.csv`: 같은 공식 업데이트 출처 레지스트리의 스프레드시트용 파일
- `scripts/generate-official-update-registry.mjs`: 공식 업데이트 출처 레지스트리 생성 스크립트
- `scripts/regenerate-research-artifacts.mjs`: 이미 받은 로컬 원천과 검수 로그로 분석 산출물 전체를 순서대로 재생성하는 오케스트레이터
- `data/cleanup/cafe-menu-links-priority-candidates.csv`: 후보 30개 사업장 내부 메뉴 링크
- `data/cleanup/cafe-menu-links-priority-candidates.json`: 같은 링크 목록의 구조화 원본
- `scripts/fetch-cafe-menu-links.mjs`: 사업장 내부 메뉴 링크 수집 스크립트
- `data/cleanup/project-summaries-priority-candidates.csv`: 후보 30개 사업개요 수치
- `data/cleanup/project-summaries-priority-candidates.json`: 같은 사업개요 수치의 구조화 원본
- `scripts/fetch-project-summaries.mjs`: 사업개요 수치 수집 스크립트
- `data/cleanup/management-stage-doc-links.csv`: 관리처분 단계 우선 대조 사업의 정보몽땅 공개항목·분담금 목록
- `data/cleanup/management-stage-doc-links.json`: 같은 결과의 구조화 원본
- `data/cleanup/management-stage-html/`: 정보몽땅 공개항목 HTML 스냅샷
- `scripts/fetch-management-stage-doc-links.mjs`: 사업시행·관리처분 공개항목 수집 스크립트
- `data/cleanup/gwangjin-stage-public-docs.csv`: 광진권 조합설립·추진위 공개항목에서 인가/승인일과 동의율을 추출한 결과
- `data/cleanup/gwangjin-stage-public-docs.json`: 같은 결과의 구조화 원본
- `data/cleanup/gwangjin-stage-html/`: 광진권 단계 공개항목 HTML 스냅샷
- `scripts/fetch-gwangjin-stage-public-docs.mjs`: 광진권 단계 공개항목 수집 스크립트
- `data/urban/urban-map-details-priority-candidates.csv`: 서울도시공간포털 지도·고시 매칭 결과
- `data/urban/urban-map-details-priority-candidates.json`: 같은 매칭 결과의 구조화 원본
- `scripts/fetch-urban-map-details.mjs`: 서울도시공간포털 지도·고시 매칭 스크립트
- `data/urban/representative-lot-map-candidates.csv`: 지도 URL 누락 후보의 대표지번 기반 recordCode 후보
- `scripts/fetch-representative-lot-map-candidates.mjs`: 대표지번/PNU/ArcGIS 겹침 검색으로 지도 URL 후보를 보강하는 스크립트
- `data/urban/map-missing-business-layer-details.csv`: 지도 recordCode가 없던 광진권 4건의 사업구역 레이어 보강 결과
- `data/urban/business-layer-notice-candidates.csv`: 사업구역 레이어 보강 4건의 결정고시 제목 검색 후보
- `data/urban/business-layer-notice-attachments.csv`: 사업구역 기반 고시 후보 원문 파일 저장 manifest
- `data/urban/original-notice-file-probes.csv`: 정정고시가 붙은 후보의 본고시 파일명 후보 확인 결과
- `data/urban/seoul-sibo-original-notice-sources.csv`: 서울시보에서 확보한 본고시 원문 소스 manifest
- `analysis/seoul-sibo-original-notice-fact-check.md`: 광장극동 본고시 제2026-249호 원문·OCR 수치 대조표
- `data/urban/gwangjin-gu-notice-candidates.csv`: 광진구청 신/구 고시공고에서 보강한 워커힐, 광장극동, 자양1의4 공식 공고 후보
- `data/urban/gwangjin-gu-notice-attachments.csv`: 광진구청 고시공고 첨부 원문 저장 manifest
- `data/urban/text/gwangjin-gu-notice-text-manifest.csv`: 광진구청 첨부 PDF/HWP/HWPX 텍스트 추출 상태
- `data/urban/text/gwangjin-gu-notice-key-fields.csv`: 광진구청 첨부의 정비계획·인가 키워드 문맥 후보
- `analysis/gwangjin-gu-notice-fact-check.md`: 광진구청 원문 수치·일자·범위 차이 대조표
- `analysis/map-missing-business-layer-review.md`: 사업구역 레이어 보강 4건의 해석과 후속 확인 과제
- `scripts/fetch-map-missing-business-layer-details.mjs`: 서울도시공간포털 사업구역 레이어와 `getList` API로 미매칭 후보를 보강하는 스크립트
- `scripts/fetch-business-layer-notice-candidates.mjs`: 사업구역명/사업명으로 결정고시 후보와 원문 파일을 보강하는 스크립트
- `scripts/probe-original-notice-files.mjs`: 정정고시가 붙은 후보의 본고시 파일명 후보를 공식 첨부 서버에서 확인하는 스크립트
- `scripts/extract_seoul_sibo_text.py`: 서울시보 PDF를 페이지 마커가 있는 텍스트로 추출하는 스크립트
- `scripts/ocr-seoul-sibo-page-range.mjs`: 서울시보 PDF 특정 페이지 범위를 OCR하는 스크립트
- `scripts/generate-seoul-sibo-original-notice-fact-check.mjs`: 서울시보 본고시 원문 대조표 생성 스크립트
- `scripts/fetch-gwangjin-gu-notice-candidates.mjs`: 광진구청 신/구 고시공고에서 자치구 공고와 첨부 원문을 보강하는 스크립트
- `scripts/generate-map-missing-business-layer-review.mjs`: 사업구역 레이어 보강 리뷰 문서 생성 스크립트
- `data/urban/urban-notice-details-priority-candidates.csv`: 매칭된 고시의 고시번호, 고시일, 소관, 원문 파일 URL
- `data/urban/urban-notice-attachments-priority-candidates.csv`: 고시 원문 파일과 결정도 이미지 링크, 로컬 저장 경로, SHA-256 해시
- `data/urban/files/`: 서울도시공간포털 고시 원문 PDF/HWP와 결정도 이미지 126개
- `scripts/fetch-urban-notice-details.mjs`: 서울도시공간포털 고시 상세·첨부 링크 수집 스크립트
- `data/urban/text/notice-text-manifest.csv`: 고시 원문 PDF/HWP 텍스트 추출 상태
- `data/urban/text/notice-key-fields.csv`: 면적, 용적률, 세대수, 기반시설, 공공기여 키워드 문맥 추출 결과
- `scripts/extract_urban_notice_text.py`: 로컬 고시 원문 텍스트 추출 스크립트
- `scripts/extract_hwp5_text.py`: LibreOffice 없이 HWP5 본문 텍스트를 직접 추출하는 보조 스크립트
- `scripts/extract_gwangjin_gu_notice_text.py`: 광진구청 PDF/HWP/HWPX 첨부 텍스트 추출 스크립트
- `analysis/source-text-extraction-audit.md`: 서울도시공간포털·광진구청 원문 PDF/HWP/HWPX 텍스트 추출 커버리지와 `soffice` 필요 여부 감사표
- `analysis/source-text-extraction-audit.csv`: 같은 원문 텍스트 추출 감사표의 스프레드시트용 파일
- `scripts/generate-source-text-extraction-audit.mjs`: 원문 텍스트 추출 감사표 생성 스크립트
- `analysis/hwp-conversion-audit.md`: HWP/HWPX 원문만 모은 자체 변환·OCR·차단 여부 감사표
- `scripts/generate-hwp-conversion-audit.mjs`: HWP/HWPX 변환 감사표 생성 스크립트
- `scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs`: 광진구청 이미지형 PDF OCR 스크립트
- `scripts/generate-gwangjin-gu-notice-fact-check.mjs`: 광진구청 원문 대조표 생성 스크립트
- `data/market/project-market-areas.csv`: 후보 30개의 실거래/R-ONE 수집 키와 시장권 매핑
- `data/market/official-market-data-sources.csv`: 공식 시장 데이터 출처와 접근 방식
- `scripts/generate-market-data-matrix.mjs`: 시장 데이터 연결 매트릭스 생성 스크립트
- `data/market/market-fetch-plan.csv`: 2024-01~2026-06 기준 실거래 API 호출 계획 690개
- `scripts/fetch-market-raw-data.mjs`: 국토교통부/서울 열린데이터광장 원자료 수집 스크립트
- `data/market/API_KEYS.md`: API 키 준비와 원자료 수집 실행 명령
- `korea-urban-planning-research-roadmap.md`: 전국·서울 도시계획 리서치 프레임
- `korea-real-estate-data-sources.md`: 부동산 데이터 출처와 수집 전략
- `korea-land-development-docs.md`: 국토 개발 문서 요약

## 공식 출처 우선순위

1. [정비사업 정보몽땅](https://cleanup.seoul.go.kr/cleanup/bsnssttus/lscrMainIndx.do)
   - 사업장검색
   - 자료공개 현황
   - 자치구별 운영현황
   - 고시/공고
   - 엑셀다운로드

2. [서울도시공간포털](https://urban.seoul.go.kr/view/new/main.html)
   - 열람공고
   - 결정고시
   - 지도서비스
   - 지구단위계획
   - 도시계획시설
   - 정비사업구역계
   - 고시문, 결정조서, 결정도, 시행지침

3. [서울시 주택·도시계획 분야](https://news.seoul.go.kr/citybuild/)
   - 신속통합기획
   - 모아주택·모아타운
   - 역세권 활성화
   - 국제교류복합지구
   - 도시정비형 재개발
   - 건축위원회·통합심의 결과

4. [서울 정보소통광장](https://opengov.seoul.go.kr/)
   - 결재문서
   - 위원회 회의정보
   - 정책연구자료
   - 건설사업정보

5. 시장 반응 확인
   - [서울부동산정보광장](https://land.seoul.go.kr/)
   - [국토교통부 실거래가 공개시스템](https://rt.molit.go.kr/)
   - [R-ONE 한국부동산원](https://www.reb.or.kr/r-one/main.do)

## 정비사업 정보몽땅 검색 코드

자치구 코드:

| 자치구 | 코드 |
| --- | --- |
| 광진구 | `11215` |
| 강남구 | `11680` |
| 송파구 | `11710` |

사업구분 코드:

| 사업구분 | 코드 |
| --- | --- |
| 재건축 | `100` |
| 재개발(주택정비형) | `101` |
| 재개발(도시정비형) | `102` |
| 가로주택정비 | `103` |
| 소규모재건축 | `104` |
| 지역주택 | `105` |
| 리모델링 | `106` |
| 소규모재개발 | `107` |

진행단계 코드:

| 단계 | 코드 |
| --- | --- |
| 정비계획 수립 | `110` |
| 재정비촉진지구수립 | `111` |
| 안전진단 | `120` |
| 정비구역지정 | `130` |
| 추진위원회승인 | `140` |
| 조합설립인가 | `150` |
| 주민대표회의구성통지 | `151` |
| 사업시행인가 | `160` |
| 관리처분인가 | `170` |
| 철거 | `180` |
| 착공 | `190` |
| 분양 | `200` |
| 준공인가 | `210` |
| 조합해산 | `220` |
| 조합청산 | `225` |
| 이전고시 | `230` |

## 리서치 판단 순서

1. `seoul-redevelopment-watchlist.csv`에서 사업장 하나를 고른다.
2. 정비사업 정보몽땅에서 사업장 페이지와 공개자료를 확인한다.
3. 서울도시공간포털에서 대표지번을 검색해 도시계획·고시정보·지구단위계획을 확인한다.
4. 서울시 주택/도시계획 분야에서 관련 정책 페이지나 심의 결과를 찾는다.
5. 서울부동산정보광장과 실거래가 공개시스템에서 최근 거래와 전세 흐름을 본다.
6. 현장 답사를 할 때는 역에서 걸어가며 보행 동선, 도로 단절, 상권, 학교, 한강 접근, 경사, 노후도를 기록한다.

## 자동 수집 실행

정비사업 정보몽땅의 사업장 목록은 다음 명령으로 다시 받을 수 있다.

```bash
node scripts/fetch-cleanup-projects.mjs
```

현재 스크립트 수집 범위:

| 생활권 | 자치구 | 코드 | 수집 건수 |
| --- | --- | --- | ---: |
| 강남 | 강남구 | `11680` | 48 |
| 잠실/송파 | 송파구 | `11710` | 59 |
| 구의/광진 | 광진구 | `11215` | 18 |

산출물:

- `data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.csv`
- `data/cleanup/cleanup-projects-gangnam-songpa-gwangjin.json`

주의할 점:

- `collected_at`은 UTC ISO 시각이다. 한국시간 기준일은 UTC 시각에 9시간을 더해 해석한다.
- 이 수집은 공식 목록 테이블의 현재 HTML 구조를 읽는다. 사이트 구조가 바뀌면 파서를 다시 확인해야 한다.
- 사업장별 공개자료는 추가 수집 대상이다. 서울도시공간포털 고시문과 결정도는 `fetch-urban-notice-details.mjs --download`로 로컬 보관한다.

## 우선검토 후보 생성

공식 목록 125개를 생활권별 후보 30개로 압축하려면 다음 명령을 실행한다.

```bash
node scripts/rank-redevelopment-candidates.mjs
```

산출물:

- `analysis/priority-redevelopment-candidates.md`
- `analysis/priority-redevelopment-candidates.csv`

현재 기준:

| 기준 | 설명 |
| --- | --- |
| 공식성 | 정비사업 정보몽땅의 단계, 사업유형, 공개자료 수를 기본값으로 사용 |
| 진행성 | 조합설립인가, 사업시행인가, 관리처분인가처럼 이력 추적 가치가 큰 단계를 높게 평가 |
| 생활권성 | 강남·잠실/송파·구의/광진을 균형 있게 각 10개씩 선별 |
| 입지 가설 | 대표지번의 동 단위로 역세권·한강축·MICE·동서울터미널 등 리서치 가설을 태그 |
| 제외 | 준공인가, 이전고시, 조합해산, 조합청산은 우선검토 후보에서 제외 |

주의할 점:

- 점수는 매수/투자 추천 점수가 아니라 리서치 우선순위다.
- 역세권과 교통 태그는 아직 공식 고시·교통계획 문서로 검증하기 전의 가설이다.
- 후보 CSV의 `official_project_url`에서 정비사업 정보몽땅 사업장 원문으로 바로 이동할 수 있다.
- 다음 단계에서는 후보 30개별 고시 URL, 지구단위계획 여부를 붙여야 한다.

## 사업별 메모 생성

후보 30개를 사업별 1페이지 메모로 펼치려면 다음 명령을 실행한다.

```bash
node scripts/generate-project-notes.mjs
```

산출물:

- `project-notes/README.md`
- `project-notes/01-jamsil5apt.md` 등 후보별 메모 30개

각 메모에는 다음 항목이 들어간다.

| 항목 | 목적 |
| --- | --- |
| 기본 정보 | 사업명, 대표지번, 현재단계, 다음 단계 가설, 공개자료 수 |
| 공식 원문 링크 | 정비사업 정보몽땅 사업장 URL, 서울도시공간포털 지도 URL, 고시 URL 자리 |
| 사업장별 리스크 신호 | 리스크 레벨, P0/P1 공개항목 수, 핵심 리스크 가설, 우선 공개항목 |
| 원문 수치 검증 큐 | OCR 검수, 수치 시점차, recordCode 연결, 비용·기반시설 원문 대조 |
| 핵심 수치 확인 장부 | 면적, 세대수, 용적률, 인가일 등 비교 수치의 확인 상태 |
| 관리처분 단계 수치 시점 해소 | 관리처분 사업의 고시/사업시행/관리처분 기준값 분리 |
| 교통입지·생활권 컨텍스트 | 교통축, 장기 입지 가설, 자율주행 민감도, 현장 확인 포인트 |
| 시장 데이터 연결 | 법정동/LAWD 코드, 실거래·R-ONE 수집 키, 첫 시장 질문 |
| 현재 해석 | 전략 태그, 다음 리서치 질문, 리스크 메모 |
| 원문 확인 체크리스트 | 고시문, 지구단위계획, 심의결과, 정보소통광장, 시장자료 확인 |
| 보강할 수치 | 구역면적, 세대수, 용적률, 권리산정기준일, 인가일 등 |

주의할 점:

- 이 스크립트는 같은 이름의 메모 파일을 덮어쓴다.
- 수동으로 보강한 메모는 별도 섹션이나 별도 파일에 보존한 뒤 재생성하는 편이 안전하다.
- 현재 메모는 공식 목록 기반 초안이며, 고시문과 지구단위계획 원문 확인 전까지는 가설 상태다.

## 로컬 분석 산출물 재생성

이미 받은 `data/` 원천과 수동 검수 로그만 기준으로 `analysis/`와 `project-notes/` 산출물을 다시 만들려면 다음 명령을 실행한다. 이 명령은 원격 웹사이트 재수집, OCR, 시장 데이터 API 호출을 하지 않는다.

```bash
node scripts/regenerate-research-artifacts.mjs
```

실행 순서만 확인하려면 `node scripts/regenerate-research-artifacts.mjs --dry-run`, 단계 목록만 보려면 `node scripts/regenerate-research-artifacts.mjs --list`를 쓴다. 원문 수집/OCR/API 호출까지 갱신할 때는 아래 수집 명령을 먼저 실행한 뒤 이 재생성 명령을 다시 실행한다.

## 사업장 내부 메뉴 링크 수집

우선검토 후보 30개의 정비사업 정보몽땅 사업장 페이지에서 사업개요, 추진경과, 정비계획, 조합설립인가, 사업시행계획서, 관리처분계획서 등 내부 메뉴 링크를 수집하려면 다음 명령을 실행한다.

```bash
node scripts/fetch-cafe-menu-links.mjs
node scripts/fetch-project-summaries.mjs
node scripts/fetch-representative-lot-map-candidates.mjs
node scripts/fetch-urban-map-details.mjs
node scripts/fetch-map-missing-business-layer-details.mjs
node scripts/fetch-urban-notice-details.mjs --download
node scripts/fetch-business-layer-notice-candidates.mjs --download
node scripts/probe-original-notice-files.mjs
node scripts/fetch-gwangjin-gu-notice-candidates.mjs --download
NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-scanned-notice-pdfs.mjs
NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-image-hwp-notices.mjs
/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_urban_notice_text.py
NODE_PATH=/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/ocr-gwangjin-gu-scanned-notice-pdfs.mjs
/Users/yongjip/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_gwangjin_gu_notice_text.py
node scripts/generate-gwangjin-gu-notice-fact-check.mjs
node scripts/generate-map-missing-business-layer-review.mjs
node scripts/generate-market-data-matrix.mjs
node scripts/fetch-market-raw-data.mjs --plan-only --from=202401 --to=202606
node scripts/fetch-management-stage-doc-links.mjs
node scripts/fetch-gwangjin-stage-public-docs.mjs
node scripts/generate-project-comparison-matrix.mjs
node scripts/generate-transport-location-context.mjs
node scripts/generate-source-text-extraction-audit.mjs
node scripts/generate-hwp-conversion-audit.mjs
node scripts/generate-management-stage-fact-check.mjs
node scripts/generate-management-stage-value-resolution.mjs
node scripts/generate-source-evidence-audit.mjs
node scripts/generate-cleanup-board-review-queue.mjs
node scripts/generate-project-risk-signal-summary.mjs
node scripts/generate-source-value-verification-queue.mjs
node scripts/generate-core-value-confirmation-ledger.mjs
node scripts/generate-ocr-source-verification-packet.mjs
node scripts/generate-ocr-source-review-triage.mjs
node scripts/generate-ocr-image-review-decisions.mjs
node scripts/generate-source-value-update-candidates.mjs
node scripts/generate-project-comparison-matrix.mjs
node scripts/generate-core-value-confirmation-ledger.mjs
node scripts/generate-focus-area-strategy.mjs
node scripts/generate-project-notes.mjs
```

산출물:

- `data/cleanup/cafe-menu-links-priority-candidates.csv`
- `data/cleanup/cafe-menu-links-priority-candidates.json`
- `data/cleanup/project-summaries-priority-candidates.csv`
- `data/cleanup/project-summaries-priority-candidates.json`
- `data/cleanup/management-stage-doc-links.csv`
- `data/cleanup/management-stage-doc-links.json`
- `data/cleanup/gwangjin-stage-public-docs.csv`
- `data/cleanup/gwangjin-stage-public-docs.json`
- `data/urban/urban-map-details-priority-candidates.csv`
- `data/urban/urban-map-details-priority-candidates.json`
- `data/urban/representative-lot-map-candidates.csv`
- `data/urban/map-missing-business-layer-details.csv`
- `data/urban/business-layer-notice-candidates.csv`
- `data/urban/business-layer-notice-attachments.csv`
- `analysis/map-missing-business-layer-review.md`
- `data/market/project-market-areas.csv`
- `data/market/market-fetch-plan.csv`
- `data/urban/representative-lot-map-candidates.json`
- `data/urban/urban-notice-details-priority-candidates.csv`
- `data/urban/urban-notice-details-priority-candidates.json`
- `data/urban/urban-notice-attachments-priority-candidates.csv`
- `data/market/project-market-areas.csv`
- `data/market/project-market-areas.json`
- `data/market/official-market-data-sources.csv`
- 내부 메뉴 링크가 반영된 `project-notes/*.md`

현재 수집 결과:

| 항목 | 값 |
| --- | ---: |
| 대상 사업장 | 30 |
| 내부 메뉴 링크 | 642 |
| 사업개요 수집 | 30 |
| 정비구역 면적 확보 | 30 |
| 용적률 확보 | 23 |
| 세대수 확보 | 9 |
| 서울도시공간포털 매칭 | 26 |
| 지도 URL 없음 | 4 |
| 대표지번 보강 추천 URL | 13 |
| 사업구역 레이어 보강 | 4 |
| 사업구역 기반 고시 후보 | 1 |
| 본고시 파일명 후보 probe | 8 |
| probe에서 본고시 PDF 확인 | 0 |
| 서울시보 본고시 원문 확인 | 1 |
| 고시 상세 수집 | 26 |
| 고시 코드 중복 제거 기준 | 23 |
| 고시 원문 파일 링크 | 26 |
| 결정도 이미지 링크 | 100 |
| 로컬 저장 첨부 | 126 |
| 다운로드 실패 | 0 |
| 로컬 첨부 용량 | 211MB |
| 고시 원문 텍스트 추출 성공 | 19 |
| OCR 텍스트 추출 성공 | 6 |
| HWP 이미지 OCR 텍스트 추출 성공 | 1 |
| 텍스트 확보 합계 | 26 |
| 전체 원문/첨부 텍스트 확보 | 40 / 40 |
| OCR 원문 대조 필요 | 9 |
| 짧은 서식/표지 확인 필요 | 5 |
| 스캔 PDF 또는 이미지형 PDF | 0 |
| HWP 직접 추출 저신뢰 | 0 |
| HWP 외부 변환 필요 | 0 |
| 공식 근거 품질 A/B/C/D/E | 3 / 23 / 2 / 2 / 0 |
| 원문 보강 병목 | 6 |
| 시장 데이터 연결 키 설계 | 30 |
| 교통입지·생활권 컨텍스트 | 30 |

활용 방법:

- `사업개요`와 `추진경과`는 사업 단계 흐름을 빠르게 파악할 때 먼저 본다.
- `정비계획 수립 및 구역지정`, `구역지정 결정 및 변경 결정에 따른 기본도면`은 도시계획 조건과 구역계를 확인할 때 본다.
- `조합설립인가`, `사업시행계획서(인가)`, `관리처분계획서(인가)`는 현재 단계와 다음 병목을 검증할 때 본다.
- `사업개요` 수치 중 세대수가 비어 있는 사업은 공식 사업개요의 주택공급계획 표가 아직 비어 있는 것으로 보고 고시문에서 재확인한다.
- 이 링크들은 정비사업 정보몽땅 안의 원문 입구이며, 서울도시공간포털 고시문 URL은 별도로 매칭해야 한다.
- 서울도시공간포털 매칭이 된 사업은 사업별 메모의 `고시/공고 URL`과 `서울도시공간포털 매칭` 섹션에서 고시 제목과 고시 코드를 확인한다.
- 매칭된 고시는 사업별 메모의 `고시 상세 원문` 섹션에서 고시번호, 고시일, 소관, 원문 파일 URL을 확인한다.
- 첨부 파일 전체 목록과 로컬 저장 경로, SHA-256 해시는 `data/urban/urban-notice-attachments-priority-candidates.csv`에서 확인한다.
- 현재 고시 원문/결정도 126개는 `data/urban/files/`에 저장되어 있다.
- 고시 원문 텍스트 추출 상태는 `data/urban/text/notice-text-manifest.csv`에서 확인한다.
- `notice-key-fields.csv`의 자동 추출 값은 1차 후보이므로 원문 스니펫과 대조해야 한다.
- `official_map_url_source`가 `representative_lot`인 사업은 대표지번 겹침 검색으로 찾은 fallback이므로 `representative_lot_map_confidence`와 구역명을 같이 확인한다.
- 지도 recordCode가 아직 없는 광진권 4개 사업은 `map-missing-business-layer-details.csv`의 사업구역 레이어 매칭값을 먼저 본다. 광장극동은 `business-layer-notice-candidates.csv`에서 고시 후보와 정정고시 원문 파일을 확보했고, 같은 공식 첨부 폴더의 본고시 파일명 후보에서는 PDF를 확인하지 못했지만 서울시보 제4146호에서 본고시 제2026-249호 원문을 확보했다. 나머지 3건은 결정고시 recordCode와 고시/인가 원문 연결이 후속 과제다.
- 시장 데이터는 `data/market/project-market-areas.csv`에서 법정동 코드, 실거래 지역코드, 단지/구역 키워드, R-ONE 지역/지표를 확인한다.
- API 키가 없을 때는 `data/market/market-fetch-plan.csv`로 수집 단위와 누락 환경변수를 먼저 확인한다.
- 서울 열린데이터광장과 공공데이터포털 키가 준비되면 `scripts/fetch-market-raw-data.mjs --fetch`로 원자료를 수집한다.
- R-ONE은 `Open API 목록`, `개발가이드`, `통계코드 검색`에서 통계코드를 확정한 뒤 가격지수·거래현황을 붙인다.
- 교통입지·생활권 가설은 `analysis/transport-location-context.csv`에서 확인하고, 사업별 메모의 `교통입지·생활권 컨텍스트` 섹션으로 들어간다.
- 현장 답사에서는 역 출구 기준 직선거리보다 횡단보도, 대형도로, 한강/탄천 단절, 단지 출입구 위치를 우선 기록한다.

## 사업별 1페이지 메모 템플릿

```text
사업명:
자치구/동:
대표지번:
가까운 역:
사업유형:
현재단계:
다음 단계:
공식 원문 URL:
고시번호/고시일:
세대수/면적/용적률:
핵심 장점:
핵심 리스크:
교통 변화:
생활권 변화:
최근 실거래/전세 메모:
현장 답사 메모:
다음 확인할 질문:
```

## 생활권별 처음 볼 질문

### 강남

- 사업 단계가 실제로 전진 중인가?
- 조합설립 이후 사업시행인가, 관리처분인가까지 병목이 무엇인가?
- 공사비와 분담금이 사업성을 얼마나 압박하는가?
- 이미 가격에 반영된 기대와 아직 반영되지 않은 행정 진척을 구분할 수 있는가?

### 잠실

- 잠실5단지, 잠실우성, 잠실우성4차의 단계 차이는 무엇인가?
- 잠실운동장·MICE·국제교류복합지구 일정과 민간 재건축 일정이 맞물리는가?
- 2·8·9호선과 한강축, 종합운동장 일대 변화가 생활권을 어떻게 바꾸는가?

### 구의·광진

- 광장극동, 워커힐, 자양 재개발 후보가 어느 단계에 있는가?
- 구의역·강변역·건대입구역·광나루역 생활권 중 어디가 실제로 좋아질 가능성이 큰가?
- 동서울터미널, 강변역 일대, 한강 접근성, 도로 단절이 가격과 주거 만족도에 어떻게 작용하는가?
- 초기 정비계획 단계 사업은 권리산정기준일과 구역계 변동 리스크가 있는가?

## 다음 자동화 후보

- 엑셀다운로드 결과 저장
- 사업장별 공개자료 목록 수집
- 지도 URL이 없는 후보의 대표지번 기반 서울도시공간포털 recordCode 보강
- OCR 텍스트가 붙은 PDF/HWP 원문을 이미지와 대조해 확정 수치로 승격
- `analysis/ocr-source-verification-packet.md`의 이미지 경로와 OCR 스니펫을 열어 대조 결과를 핵심 수치 장부에 반영
- `analysis/ocr-source-review-triage.md`의 `ocr_snippet_value_mismatch` 항목은 값 충돌 또는 기준시점 차이로 먼저 분리
- `analysis/ocr-image-review-decisions.md`의 `ocr_source_value_update_required`, `ocr_partial_confirmation_pending` 항목은 비교 매트릭스 원천 수치 또는 2차 출처 확인으로 후속 처리
- 500자 미만 짧은 서식/표지성 첨부 5개는 보조자료로만 쓰고, 본문 공고문·고시문과 매칭해 근거 등급을 조정
- 텍스트 확보 고시 26개를 기준으로 결정조서 수치 확정
- 서울 열린데이터광장/공공데이터포털 API 키 기반 원자료 수집 실행 및 엔드포인트 검증
- R-ONE 통계코드 확정 후 가격지수·거래현황 수집 스크립트 작성
- 실거래가 월별 수집 후 단계 변화 전후 거래량 비교
- 교통입지 컨텍스트를 실제 역 좌표, 보행거리, TOPIS/교통통계 데이터와 결합
