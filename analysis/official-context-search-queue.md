# 공식 Context 검색 큐

작성 기준: 2026-06-24 KST

이 문서는 월간 context scan 때 서울시 주택·도시계획, 서울시 교통, 서울 정보소통광장, 서울도시공간포털에서 무엇을 검색할지 촉매별로 고정한다. 보도자료와 결재문서는 기본적으로 `context_only`이며, 원문 고시·계획·교통대책과 연결될 때만 사업장 가설을 승격한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 검색 큐 | 34 |
| 촉매 | 9 |
| 출처 | 4 |
| context_only 기본 | 26 |
| 원문 후보 가능 | 8 |

| 구분 | 값 |
| --- | --- |
| 출처 | opengov 9; seoul_citybuild 9; seoul_urban 8; seoul_traffic 8 |
| 생활권 | 잠실/송파 15; 구의/광진 11; 강남 8 |

## 우선 검색 큐

| 우선 | 출처 | 촉매 | 생활권 | 검색어 | 연결 사업 | 기본 증거 | 기록 위치 | 판정 gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 422 | seoul_urban | 압구정·한강변관리·경관/높이/공공기여 | 강남 | 압구정; 한강변관리; 경관; 높이; 서울도시공간포털 고시 서울도시공간포털 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 11. 압구정아파트지구 특별계획구역4; 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 392 | opengov | 압구정·한강변관리·경관/높이/공공기여 | 강남 | 압구정; 한강변관리; 경관; 높이; 정보소통광장 결재문서 서울 정보소통광장 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 11. 압구정아파트지구 특별계획구역4; 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 392 | seoul_citybuild | 압구정·한강변관리·경관/높이/공공기여 | 강남 | 압구정; 한강변관리; 경관; 높이; 서울시 도시계획 서울시 주택·도시계획 분야 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 11. 압구정아파트지구 특별계획구역4; 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 392 | seoul_traffic | 압구정·한강변관리·경관/높이/공공기여 | 강남 | 압구정; 한강변관리; 경관; 높이; 서울시 교통 서울시 교통 분야 | 15. 압구정한양7차아파트 재건축정비사업조합; 12. 압구정아파트지구 특별계획구역5 재건축정비사업조합; 11. 압구정아파트지구 특별계획구역4; 10. 압구정아파트지구 특별계획구역③ 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 392 | seoul_urban | 잠실 MICE·국제교류복합지구 | 잠실/송파 | 잠실 MICE; 국제교류복합지구; 종합운동장; 잠실 스포츠·MICE; 서울도시공간포털 고시 서울도시공간포털 | 9. 잠실우성4차 주택재건축정비사업조합; 1. 잠실5단지아파트 주택재건축정비사업조합; 5. 장미1,2,3차아파트 주택재건축정비사업 조합; 3. 잠실우성아파트 재건축정비사업조합 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 386 | seoul_urban | 동서울터미널·강변역·광역교통 | 구의/광진 | 동서울터미널; 강변역; 사전협상; 교통처리계획; 서울도시공간포털 고시 서울도시공간포털 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 25. 한양연립 일대 가로주택정비사업; 27. 광장극동아파트 재건축사업 (신속통합기획) | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 362 | opengov | 잠실 MICE·국제교류복합지구 | 잠실/송파 | 잠실 MICE; 국제교류복합지구; 종합운동장; 잠실 스포츠·MICE; 정보소통광장 결재문서 서울 정보소통광장 | 9. 잠실우성4차 주택재건축정비사업조합; 1. 잠실5단지아파트 주택재건축정비사업조합; 5. 장미1,2,3차아파트 주택재건축정비사업 조합; 3. 잠실우성아파트 재건축정비사업조합 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 362 | seoul_citybuild | 잠실 MICE·국제교류복합지구 | 잠실/송파 | 잠실 MICE; 국제교류복합지구; 종합운동장; 잠실 스포츠·MICE; 서울시 도시계획 서울시 주택·도시계획 분야 | 9. 잠실우성4차 주택재건축정비사업조합; 1. 잠실5단지아파트 주택재건축정비사업조합; 5. 장미1,2,3차아파트 주택재건축정비사업 조합; 3. 잠실우성아파트 재건축정비사업조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 362 | seoul_traffic | 잠실 MICE·국제교류복합지구 | 잠실/송파 | 잠실 MICE; 국제교류복합지구; 종합운동장; 잠실 스포츠·MICE; 서울시 교통 서울시 교통 분야 | 9. 잠실우성4차 주택재건축정비사업조합; 1. 잠실5단지아파트 주택재건축정비사업조합; 5. 장미1,2,3차아파트 주택재건축정비사업 조합; 3. 잠실우성아파트 재건축정비사업조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 356 | opengov | 동서울터미널·강변역·광역교통 | 구의/광진 | 동서울터미널; 강변역; 사전협상; 교통처리계획; 정보소통광장 결재문서 서울 정보소통광장 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 25. 한양연립 일대 가로주택정비사업; 27. 광장극동아파트 재건축사업 (신속통합기획) | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 356 | seoul_citybuild | 동서울터미널·강변역·광역교통 | 구의/광진 | 동서울터미널; 강변역; 사전협상; 교통처리계획; 서울시 도시계획 서울시 주택·도시계획 분야 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 25. 한양연립 일대 가로주택정비사업; 27. 광장극동아파트 재건축사업 (신속통합기획) | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 356 | seoul_traffic | 동서울터미널·강변역·광역교통 | 구의/광진 | 동서울터미널; 강변역; 사전협상; 교통처리계획; 서울시 교통 서울시 교통 분야 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 25. 한양연립 일대 가로주택정비사업; 27. 광장극동아파트 재건축사업 (신속통합기획) | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 349 | seoul_urban | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 서울도시공간포털 고시 서울도시공간포털 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 29. 자양1의4구역 가로주택정비사업; 25. 한양연립 일대 가로주택정비사업 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 343 | seoul_urban | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 서울도시공간포털 고시 서울도시공간포털 | 7. 대치쌍용2차아파트 주택재건축정비사업조합; 8. 대치쌍용1차아파트 주택재건축정비사업조합; 4. 은마아파트 재건축정비사업조합; 6. 대치우성1차아파트 재건축정비사업조합 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 319 | opengov | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 정보소통광장 결재문서 서울 정보소통광장 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 29. 자양1의4구역 가로주택정비사업; 25. 한양연립 일대 가로주택정비사업 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 319 | seoul_citybuild | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 서울시 도시계획 서울시 주택·도시계획 분야 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 29. 자양1의4구역 가로주택정비사업; 25. 한양연립 일대 가로주택정비사업 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 319 | seoul_traffic | 구의·자양 2/7호선·한강 접근축 | 구의/광진 | 구의; 자양; 한강 접근; 보행축; 서울시 교통 서울시 교통 분야 | 24. 워커힐아파트1단지 재건축정비사업 조합설립추진위원회; 23. 광장동 삼성1차아파트 소규모재건축정비사업; 29. 자양1의4구역 가로주택정비사업; 25. 한양연립 일대 가로주택정비사업 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 313 | opengov | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 정보소통광장 결재문서 서울 정보소통광장 | 7. 대치쌍용2차아파트 주택재건축정비사업조합; 8. 대치쌍용1차아파트 주택재건축정비사업조합; 4. 은마아파트 재건축정비사업조합; 6. 대치우성1차아파트 재건축정비사업조합 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 313 | seoul_citybuild | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 서울시 도시계획 서울시 주택·도시계획 분야 | 7. 대치쌍용2차아파트 주택재건축정비사업조합; 8. 대치쌍용1차아파트 주택재건축정비사업조합; 4. 은마아파트 재건축정비사업조합; 6. 대치우성1차아파트 재건축정비사업조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 313 | seoul_traffic | 대치 학군·3호선·기존 생활 인프라 | 강남 | 대치; 학여울; 3호선; 교통; 서울시 교통 서울시 교통 분야 | 7. 대치쌍용2차아파트 주택재건축정비사업조합; 8. 대치쌍용1차아파트 주택재건축정비사업조합; 4. 은마아파트 재건축정비사업조합; 6. 대치우성1차아파트 재건축정비사업조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 310 | seoul_urban | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 서울도시공간포털 고시 서울도시공간포털 | 18. 송파미성아파트 재건축정비사업조합; 17. 송파한양2차아파트 재건축정비사업 조합; 19. 대림가락아파트 재건축정비사업조합; 21. 가락삼익맨숀아파트 재건축정비사업 조합 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 287 | seoul_urban | 마천·거여 재정비축 | 잠실/송파 | 마천; 거여; 재정비촉진; 도로계획; 서울도시공간포털 고시 서울도시공간포털 | 20. 마천1재정비촉진구역 주택재개발정비사업조합 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 280 | opengov | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 정보소통광장 결재문서 서울 정보소통광장 | 18. 송파미성아파트 재건축정비사업조합; 17. 송파한양2차아파트 재건축정비사업 조합; 19. 대림가락아파트 재건축정비사업조합; 21. 가락삼익맨숀아파트 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 280 | seoul_citybuild | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 서울시 도시계획 서울시 주택·도시계획 분야 | 18. 송파미성아파트 재건축정비사업조합; 17. 송파한양2차아파트 재건축정비사업 조합; 19. 대림가락아파트 재건축정비사업조합; 21. 가락삼익맨숀아파트 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 280 | seoul_traffic | 석촌·송파·가락 8/9호선 배후축 | 잠실/송파 | 석촌; 송파; 가락; 8호선; 서울시 교통 서울시 교통 분야 | 18. 송파미성아파트 재건축정비사업조합; 17. 송파한양2차아파트 재건축정비사업 조합; 19. 대림가락아파트 재건축정비사업조합; 21. 가락삼익맨숀아파트 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 273 | opengov | 문정·장지 업무지구 배후축 | 잠실/송파 | 문정; 장지; 업무지구; 교통; 정보소통광장 결재문서 서울 정보소통광장 | 16. 가락1차현대아파트 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |
| 273 | seoul_citybuild | 문정·장지 업무지구 배후축 | 잠실/송파 | 문정; 장지; 업무지구; 교통; 서울시 도시계획 서울시 주택·도시계획 분야 | 16. 가락1차현대아파트 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 273 | seoul_traffic | 문정·장지 업무지구 배후축 | 잠실/송파 | 문정; 장지; 업무지구; 교통; 서울시 교통 서울시 교통 분야 | 16. 가락1차현대아파트 재건축정비사업 조합 | context_only | analysis/official-context-sources.csv | 보도자료는 context_only이며, 고시·계획·교통대책 원문 연결 전까지 가설 승격 보류 |
| 264 | seoul_urban | 중곡 7호선 생활권 정비 | 구의/광진 | 중곡; 7호선; 생활권계획; 정비계획; 서울도시공간포털 고시 서울도시공간포털 | 22. 중곡아파트 주택재건축정비사업조합 | needs_text_extraction 또는 verified_original | data/review/source-verification-closure-decisions.json 또는 data/review/official-update-intake.json | 고시번호·고시일·원문 URL·첨부명·결정조서 텍스트가 확인될 때만 수치/단계 근거로 승격 |
| 257 | opengov | 마천·거여 재정비축 | 잠실/송파 | 마천; 거여; 재정비촉진; 도로계획; 정보소통광장 결재문서 서울 정보소통광장 | 20. 마천1재정비촉진구역 주택재개발정비사업조합 | context_only | analysis/official-context-sources.csv 또는 data/review/official-update-intake.json | 결재문서·회의자료는 context_only이며, 고시·계획 원문 또는 교통대책 원문과 연결될 때만 가설 승격 |

## 사용 순서

1. `priority`가 높은 행부터 해당 공식 출처에서 검색한다.
2. 보도자료·결재문서이면 `analysis/official-context-sources.csv` 또는 `data/review/official-update-intake.json`에 `context_only`로 기록한다.
3. 고시번호·고시일·원문 URL·첨부명이 확인되면 source verification 또는 official update intake로 보낸다.
4. 기록 후 `node scripts/regenerate-research-artifacts.mjs`를 실행하고 `analysis/catalyst-trigger-matrix.md`와 생활권 비교 브리프를 확인한다.

## 운영 원칙

- 공공 촉매는 재평가를 시작하는 신호이지 확정 결론이 아니다.
- 같은 촉매라도 high-blocking 사업은 공식 회신/정보공개 gate를 먼저 통과해야 한다.
- 검색 결과가 없으면 결론을 바꾸지 않고 다음 월간 scan에서 같은 큐를 재사용한다.
