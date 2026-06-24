# 공식 Context 검색 결과 보드

작성 기준: 2026-06-24 KST

이 문서는 `analysis/official-context-search-queue.md`를 실제로 검색한 결과를 검증한다. 검색 결과가 보도자료·결재문서이면 `context_only`로 유지하고, 고시·계획·교통대책 원문 후보만 원문 검증 intake로 보낸다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 결과 행 | 10 |
| 검색 큐 | 34 |
| 검색 완료 큐 | 10 |
| 미검색 큐 | 24 |
| 보완 필요 | 0 |
| verified original | 4 |
| context_only | 4 |

| 구분 | 값 |
| --- | --- |
| result_status | found_context 4; found_verified_original 4; not_found 2 |
| route | official_context_sources 4; source_verification_decision 4; no_change_log 2 |

## 입력 가이드

- `data/review/official-context-search-results-intake.README.md`: 허용 상태값, 상태별 필수 증거, 입력 순서를 정리한 가이드
- `data/review/official-context-search-results-intake-examples.json`: `found_context`, `found_original_candidate`, `found_verified_original`, `not_found` 복사용 예시

## 현재 결과

| 결과 ID | search_id | 출처 | 촉매 | 결과 | 증거 | 검증 | 이슈 | route | 기록 위치 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ctx-20260623-0001 | jamsil-mice-gbc-seoul_citybuild | seoul_citybuild | 잠실 MICE·국제교류복합지구 | found_context | context_only | inbox |  | official_context_sources | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| ctx-20260623-0002 | jamsil-mice-gbc-seoul_traffic | seoul_traffic | 잠실 MICE·국제교류복합지구 | found_context | context_only | inbox |  | official_context_sources | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| ctx-20260623-0003 | apgujeong-hangang-riverfront-seoul_citybuild | seoul_citybuild | 압구정·한강변관리·경관/높이/공공기여 | found_context | context_only | inbox |  | official_context_sources | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| ctx-20260623-0004 | dongseoul-terminal-gangbyeon-seoul_citybuild | seoul_citybuild | 동서울터미널·강변역·광역교통 | found_context | context_only | inbox |  | official_context_sources | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | context_only로 기록하고 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| ctx-20260623-0005 | dongseoul-terminal-gangbyeon-seoul_traffic | seoul_traffic | 동서울터미널·강변역·광역교통 | not_found | rejected | deferred |  | no_change_log | analysis/official-context-search-results-board.md | 검색 결과 없음으로 유지하고 다음 월간 scan에서 같은 search_id 재사용 |
| ctx-20260623-0006 | apgujeong-hangang-riverfront-seoul_traffic | seoul_traffic | 압구정·한강변관리·경관/높이/공공기여 | not_found | rejected | deferred |  | no_change_log | analysis/official-context-search-results-board.md | 검색 결과 없음으로 유지하고 다음 월간 scan에서 같은 search_id 재사용 |
| ctx-20260623-0007 | apgujeong-hangang-riverfront-seoul_urban | seoul_urban | 압구정·한강변관리·경관/높이/공공기여 | found_verified_original | verified_original | applied |  | source_verification_decision | data/review/source-verification-closure-decisions.json | 원문 URL, 첨부, 로컬 텍스트를 확인한 뒤 source verification 또는 official update intake에 반영 |
| ctx-20260623-0008 | guui-jayang-hangang-axis-seoul_urban | seoul_urban | 구의·자양 2/7호선·한강 접근축 | found_verified_original | verified_original | applied |  | source_verification_decision | data/review/source-verification-closure-decisions.json | 원문 URL, 첨부, 로컬 텍스트를 확인한 뒤 source verification 또는 official update intake에 반영 |
| ctx-20260623-0009 | seokchon-songpa-garak-backbone-seoul_urban | seoul_urban | 석촌·송파·가락 8/9호선 배후축 | found_verified_original | verified_original | applied |  | source_verification_decision | data/review/source-verification-closure-decisions.json | 원문 URL, 첨부, 로컬 텍스트를 확인한 뒤 source verification 또는 official update intake에 반영 |
| ctx-20260624-0001 | jamsil-mice-gbc-seoul_urban | seoul_urban | 잠실 MICE·국제교류복합지구 | found_verified_original | verified_original | applied |  | source_verification_decision | data/review/source-verification-closure-decisions.json | 원문 URL, 첨부, 로컬 텍스트를 확인한 뒤 source verification 또는 official update intake에 반영 |

## 미검색 상위 큐

| 우선 | search_id | 출처 | 촉매 | 생활권 | 검색어 | 판정 gate |
| --- | --- | --- | --- | --- | --- | --- |
| 392 | apgujeong-hangang-riverfront-opengov | opengov | 압구정·한강변관리·경관/높이/공공기여 | 강남 | 압구정; 한강변관리; 경관; 높이; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 386 | dongseoul-terminal-gangbyeon-seoul_urban | seoul_urban | 동서울터미널·강변역·광역교통 | 구의/광진 | 동서울터미널; 강변역; 사전협상; 교통처리계획; 서울도시공간포털 고시 서울도시공간포털 | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 362 | jamsil-mice-gbc-opengov | opengov | 잠실 MICE·국제교류복합지구 | 잠실/송파 | 잠실 MICE; 국제교류복합지구; 종합운동장; 잠실 스포츠·MICE; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 356 | dongseoul-terminal-gangbyeon-opengov | opengov | 동서울터미널·강변역·광역교통 | 구의/광진 | 동서울터미널; 강변역; 사전협상; 교통처리계획; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 343 | daechi-school-district-seoul_urban | seoul_urban | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 서울도시공간포털 고시 서울도시공간포털 | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 319 | guui-jayang-hangang-axis-opengov | opengov | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 319 | guui-jayang-hangang-axis-seoul_citybuild | seoul_citybuild | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 서울시 도시계획 서울시 주택·도시계획 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 319 | guui-jayang-hangang-axis-seoul_traffic | seoul_traffic | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 서울시 교통 서울시 교통 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 313 | daechi-school-district-opengov | opengov | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 313 | daechi-school-district-seoul_citybuild | seoul_citybuild | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 서울시 도시계획 서울시 주택·도시계획 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 313 | daechi-school-district-seoul_traffic | seoul_traffic | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 서울시 교통 서울시 교통 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 287 | macheon-geoyeo-renewal-seoul_urban | seoul_urban | 마천·거여 재정비축 | 잠실/송파 | 마천; 거여; 재정비촉진; 도로계획; 서울도시공간포털 고시 서울도시공간포털 | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 280 | seokchon-songpa-garak-backbone-opengov | opengov | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 280 | seokchon-songpa-garak-backbone-seoul_citybuild | seoul_citybuild | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 서울시 도시계획 서울시 주택·도시계획 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 280 | seokchon-songpa-garak-backbone-seoul_traffic | seoul_traffic | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 서울시 교통 서울시 교통 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 273 | munjeong-jangji-business-axis-opengov | opengov | 문정·장지 업무지구 배후축 | 잠실/송파 | 문정; 장지; 업무지구; 교통; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 273 | munjeong-jangji-business-axis-seoul_citybuild | seoul_citybuild | 문정·장지 업무지구 배후축 | 잠실/송파 | 문정; 장지; 업무지구; 교통; 서울시 도시계획 서울시 주택·도시계획 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 273 | munjeong-jangji-business-axis-seoul_traffic | seoul_traffic | 문정·장지 업무지구 배후축 | 잠실/송파 | 문정; 장지; 업무지구; 교통; 서울시 교통 서울시 교통 분야 | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 264 | junggok-neighborhood-renewal-seoul_urban | seoul_urban | 중곡 7호선 생활권 정비 | 구의/광진 | 중곡; 7호선; 생활권계획; 정비계획; 서울도시공간포털 고시 서울도시공간포털 | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 257 | macheon-geoyeo-renewal-opengov | opengov | 마천·거여 재정비축 | 잠실/송파 | 마천; 거여; 재정비촉진; 도로계획; 정보소통광장 결재문서 서울 정보소통광장 | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |

## 운영 원칙

- `not_found`는 결론 변경 근거가 아니다. 다음 월간 scan에서 같은 search_id를 다시 확인한다.
- `context_only`는 가설 참고 신호일 뿐 사업 단계·수치 확정 근거가 아니다.
- `verified_original`은 원문 URL만으로 쓰지 않고, 첨부 경로 또는 로컬 텍스트 경로가 있어야 한다.
- 결과를 반영한 뒤에는 `node scripts/regenerate-research-artifacts.mjs`를 실행하고 `analysis/catalyst-trigger-matrix.md`를 확인한다.
