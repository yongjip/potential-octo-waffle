# 확장 관심권 최신 확인 가이드

작성 기준: 2026-06-24 KST

이 문서는 강동권과 약수동 주변 확장 관심권을 다음 주 점검 때 바로 다시 열 수 있게 만든 실전용 가이드다. 강동권은 최신 단계 공백 관리, 약수동 주변은 confirmed 기준값 유지와 direct hit 발굴을 분리해서 다룬다.

## 요약

- 권역 수: 2
- 상세 추적 행: 10
- 강동권 추적 사업: 7
- 약수권 기준선 사업: 3
- 강동권 최신 단계 공백 사업: 0
- 현재 기준값 바로 사용 가능한 행: 10

## 공통 원칙

1. 확장 관심권은 핵심 3생활권의 대체 점수판이 아니라 비교축 보강용이다.
2. `고시번호`, `고시일`, `원문 URL`, `공개항목 본문`, `첨부 원문`, `기준일`이 닫히기 전에는 단계 승격을 하지 않는다.
3. 강동권의 정비구역·촉진계획 변경 고시는 값 기준선으로만 쓰고, 최신 인허가 단계는 구청 고시공고와 정보몽땅으로 다시 닫는다.
4. 약수동 주변은 OCR 숫자보다 정식 표·원문 이미지를 우선한다. 충돌값은 폐기 규칙까지 같이 기록한다.

## 빠른 실행 순서

1. [life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)를 열어 핵심 3생활권과 확장 2권역을 같은 축으로 본다.
2. [expansion-zone-latest-check-guide.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-latest-check-guide.md)를 열어 강동권과 약수권 중 어느 루프를 탈지 고른다.
3. 강동권이면 [expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md), 약수권이면 [expansion-yaksu-ocr-recheck-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-yaksu-ocr-recheck-board.md)를 바로 연다.
4. [expansion-official-latest-check-audit.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-official-latest-check-audit.md)를 열어 진입 페이지 검색 결과와 `noticeCode` 직접 접근 차단 여부를 먼저 확인한다.
5. intake에 무엇을 새로 만들고 무엇을 기존 row로 재사용할지 애매하면 [expansion-zone-intake-seed-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-intake-seed-board.md)를 먼저 열어 source_id와 copy-ready JSON을 고른다.
6. 변화가 실제 신호인지 확인한 뒤 [expansion-interest-zone-shortlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-shortlist.md)와 [expansion-interest-zone-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-brief.md)를 먼저 고친다.
7. 마지막에 [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)와 [life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)를 갱신해 핵심 생활권 비교판에 반영한다.

## 1. 강동권

| 현재 상태 | 핵심 연결 | 다음 점검일 | 먼저 열 URL | 현재 기준선 | 가장 먼저 할 일 |
| --- | --- | --- | --- | --- | --- |
| confirmed 비교 가능 | 잠실/송파 | 2026-07-01 KST | [강동구 고시공고](https://www.gangdong.go.kr/)<br>[서울도시공간포털](https://urban.seoul.go.kr/view/new/main.html)<br>[정비사업 정보몽땅](https://cleanup.seoul.go.kr/) | 원문 비교값 운영 가능, 단계 신호 확인; shortlist 7건, confirmed snapshot 6건, stage verified 5건, context 1건; latest_stage_gap 0; stale 1; context 1 | 정보몽땅 사업장 상세 공개자료의 최근 문서일과 강동구 고시공고 최신 문서일을 같은 날짜 기준으로 교차 확인 |

### 기준 사업

| 사업 | 우선 | 현재 공개신호 | 현재 해석 | 지금 써도 되는 값 | 다음 재확인 |
| --- | --- | --- | --- | --- | --- |
| 천호3구역 | medium | 정비사업 정보몽땅 selected 단계는 일반분양승인으로 남아 있지만, 같은 추진경과 본문에는 `착공신고 2026-05-31`, 관리처분계획(경미한 변경)인가 2026-04-15(고시 제2026-66호, 3차 변경 인가일 2026-04-09), (부분)준공인가 2026-01-28(고시 제2026-22호, 준공인가일 2026-01-22)가 함께 보인다. | 단계 신호 확인 | 정비구역 22,952.9㎡, 계획용적률 226.22%, 법정상한 250%, 건폐율 30% 이하, 최고 78m/25층, 총 535세대, 기반시설 순부담 1,552.2㎡(11.84%) | 강동구 고시 제2026-22호와 제2026-66호를 천호3 latest-stage baseline으로 유지하고, 정보몽땅 본문에 보이는 `착공신고 2026-05-31`까지 병기한 채 selected 단계 표기 갱신 여부와 추가 준공/입주 공고를 다시 확인 |
| 상일동 빌라단지 통합 재건축 | medium | 정비사업정보공개 기준 추진위원회 승인 단계 관측 | 단계 신호 확인 | 정비구역 82,640㎡, 용적률 250%, 최고 29층, 분양 1,367세대/임대 146세대 후보 | 정비사업정보공개 상세 항목에서 noticeCode와 최신 원문/첨부 링크를 확보해 강동권 단계보드와 수치 보드에 정밀 반영 |
| 성내미주아파트 주택재건축정비사업 | medium | 정비사업 정보몽땅 사업 진행단계는 이전고시로 표시되지만, 청산위원회 정보공개 자료열람의 실제 공개 분류는 `조합청산(222)` 1건뿐이고 direct page는 `등록된 공개자료가 없습니다.` 상태다. 강동구 공식 검색에서 직접 잡히는 최신 성내미주 hit은 여전히 구보제1341호(2016-08-24, 공사완료 고시·정비구역 변경지정)와 구보제1235호(2014-09-23, 사업시행(변경)인가)까지다. | 단계 신호 확인 | 정비구역 18,414.3㎡, 정비계획 용적률 249.92%, 법정상한 291.05%, 건폐율 30%, 총 482세대 | 강동구 direct latest hit이 2016/2014에 머무르는 상태와 청산위원회 공개 분류가 `조합청산(222) 1건 only + direct 공개 empty`인 상태를 baseline으로 같이 유지하고, 다음 점검에서는 정보몽땅 자료열람/최근 공개자료에서 이전고시·준공 또는 이전 관련 원문 식별자가 새로 생기는지 먼저 확인 |
| 신동아1·2차아파트 주택재건축 정비사업 | medium | 정비사업 정보몽땅 사업 진행단계: 길동신동아1,2차아파트 주택재건축정비사업조합 / 준공인가 | 단계 신호 확인 | 정비구역 46,267.7㎡, 획지 39,246.1㎡, 정비기반시설 6,898.6㎡, 정비계획 용적률 243.39%, 법정상한 290.95%, 건폐율 20% 이하, 99m/33층 이하, 총 1,299세대 | 정보공개 자료열람에서 준공인가 이후 공개항목과 공사시행 월별공사진행사항을 읽고, 길동 43번지 generic 카드와 분리한 current-stage baseline을 유지 |
| 고덕강일1역세권 재개발사업 | medium | 정비사업정보공개 기준 정비계획 수립 상태 | 오래된 고시만 확인 | 공개 수치 미공개 | 정비계획 수립의 계획서·승인일자·추가 공개자료를 확보해 noticeCode 부재 리스크를 해소하고 단계 상태를 재분류 |
| 고덕대우아파트 소규모재건축사업 | medium | 정비사업정보공개 기준 조합설립인가 단계 | 단계 신호 확인 | 정비구역 면적 6,462.9㎡, 용적률 300%, 최고 29층, 분양 190세대/임대 146세대 후보 | 조합설립인가 후 단계 승인(사업시행·관리처분) 문서가 확인되면 재건축 비교축 및 리스크 항목을 업데이트 |
| 주택재건축정비구역 | low | 신동아3차 정비구역(계획) 경미한 변경 지정 고시 | 보조 비교축 | 정비구역 12,264.5㎡, 정비계획 용적률 288.38%, 법정상한 290%, 건폐율 30% 이하, 21층 이하(71m 이하), 총 366세대 | 길동 43번지 필지와 신동아3차 정식 사업명으로 구청 공고와 정보몽땅을 다시 매칭 |

### 변화로 인정할 신호

- 강동구 고시공고나 정비사업 정보몽땅에서 천호3구역, 신동아1·2차, 성내미주와 같은 공식 사업명으로 `조합설립`, `사업시행`, `관리처분` 단계 공개가 새로 확인될 때
- 기존 고시번호 뒤에 같은 사업명의 새 `고시번호`, `고시일`, `첨부 원문`이 붙을 때
- 정보몽땅 공개항목·조합입찰공고에서 기반시설, 이주, 철거, 착공 성격의 새 문서가 확인될 때

### 노이즈로만 둘 신호

- 정비구역·촉진계획 `경미변경 고시` 하나만 보고 사업 전체 최신 단계를 올리는 것
- 2016년·2020년 같은 오래된 고시를 다시 찾았다는 이유만으로 최신 변화로 처리하는 것
- `길동 43번지` 같은 generic 식별을 direct 사업장으로 바로 승격하는 것

### 변화가 나오면 먼저 고칠 파일

- [expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md)
- [expansion-interest-zone-shortlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-shortlist.md)
- [expansion-interest-zone-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-brief.md)
- [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)
- [life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)


## 2. 약수동 주변

| 현재 상태 | 핵심 연결 | 다음 점검일 | 먼저 열 URL | 현재 기준선 | 가장 먼저 할 일 |
| --- | --- | --- | --- | --- | --- |
| confirmed 비교 가능 | 별도 도심근접형 대조군 | 2026-07-01 KST | [중구 고시공고](https://www.junggu.seoul.kr/index.html)<br>[서울도시공간포털](https://urban.seoul.go.kr/view/new/main.html)<br>[정비사업 정보몽땅](https://cleanup.seoul.go.kr/) | 원문 비교값 운영 가능, 이미지 재대조까지 완료; adjacent 3건, confirmed snapshot 3건, 이미지 재대조 완료 3건; 원문+이미지 재대조 완료 | 약수권 비교표에 1,215세대/임대 183세대 구조와 기부채납 10.81%를 반영하고, 생활권 대조에서는 서술부 OCR 숫자를 폐기; 약수권 비교표에 7층/28m, 334세대, 환산부지면적 967.39㎡를 공식 확정값으로 반영 |

### 기준 사업

| 사업 | 구분 | 현재 공개신호 | confirmed 기준값 | 폐기/정정 규칙 | 다음 재확인 |
| --- | --- | --- | --- | --- | --- |
| 신당 제8구역 주택재개발정비사업 | adjacent_project | 정비구역 변경(경미한 사항) 결정 및 지형도면 고시 | 정비구역 58,651.3㎡, 택지(공동주택) 45,184.0㎡, 정비계획 용적률 248.64%, 공공청사 1,306㎡, 총 기부채납 10.81%, 총 1,215세대/임대 183세대 | 환경관리계획 OCR 서술부의 '개발밀도 및 세대수 712'는 정식 표와 충돌해 폐기 | 중구 고시공고·정보몽땅·현장 답사에서 약수역 생활권 겹침 정도를 먼저 검증 |
| 신당 제9주택재개발정비구역 | adjacent_project | 정비계획 결정(변경)(경미한 사항) 및 지형도면 고시 | 정비구역 18,651㎡, 획지1 17,559㎡, 건폐율 60% 이하, 정비계획 상한용적률 182%, 7층/28m 이하, 주택공급 334세대, 공공시설 환산부지면적 967.39㎡ | 기정 181%는 변경 비교값이 아니라 이전 값이므로 별도 보관 | 신당 제8과 함께 현장 동선과 중구 공고문을 나란히 확인 |
| 금호 제14-1 주택재개발 정비사업 | adjacent_project | 정비구역지정(경미한 변경) 결정 및 지형도면 고시 | 연면적 15,500㎡, 구역면적 5,144.70㎡, 택지 4,043.60㎡, 건폐율 28%, 개발가능용적률 238.67% 이하(설계 232.25%), 최고 16층 이하, 주택공급 108세대, 공공시설부지 제공 424.7㎡ | 15,500㎡는 구역면적이 아니라 연면적이라는 점을 명시적으로 정정 | 중구측 청구 생활권 자료와 분리 보관하고, direct hit 발생 시 비교 기준으로만 사용 |

### 변화로 인정할 신호

- 중구 고시공고나 정비사업 정보몽땅에서 약수역 생활권 direct hit가 새로 확인되고 `사업명`, `고시번호`, `고시일`, `위치`가 닫힐 때
- 신당8·신당9·금호14-1과 충돌하는 OCR 숫자가 아니라 정식 표·고시 원문 기준의 새 수치가 확인될 때
- 약수역-청구역-신금호축 직접 사업장이 생겨 adjacent 대조군이 direct 비교 후보로 바뀔 때

### 노이즈로만 둘 신호

- 신당8 OCR 서술부의 `세대수 712`를 정식 표보다 우선해서 쓰는 것
- 신당9 `181%`를 현재 비교값으로 다시 올리는 것
- 성동구 금호14-1 인접 대조군을 약수권 direct hit처럼 취급하는 것

### 변화가 나오면 먼저 고칠 파일

- [expansion-yaksu-ocr-recheck-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-yaksu-ocr-recheck-board.md)
- [expansion-interest-zone-shortlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-shortlist.md)
- [expansion-interest-zone-brief.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-brief.md)
- [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)
- [life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)


## 공통 기록 순서

1. 새 고시·공고·공개항목은 먼저 [official-source-activation-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-source-activation-intake.json) 또는 update intake에 기록한다.
2. create/reuse 판단이 서지 않으면 [expansion-zone-intake-seed-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-zone-intake-seed-board.md)에서 seed를 복사해 source_id와 기존 update_id 재사용 여부를 먼저 정한다.
3. 강동권 direct hit 변화는 [expansion-gangdong-stage-watch-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-gangdong-stage-watch-board.md)를 먼저 고친다.
4. 약수권 값 변화나 direct hit 보강은 [expansion-yaksu-ocr-recheck-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-yaksu-ocr-recheck-board.md)와 [expansion-interest-zone-shortlist.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/expansion-interest-zone-shortlist.md)를 먼저 고친다.
5. 그 다음 [life-area-monitoring-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-monitoring-board.md)와 [life-area-extended-comparison-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/life-area-extended-comparison-board.md)에 반영한다.
6. 주간 점검 로그에는 [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)를 사용한다.

## 현재형 웹 확인 메모

- 서울도시공간포털 정비사업구역계 진입 페이지는 [PMNU4030600001](https://urban.seoul.go.kr/view/html/PMNU4030600001)를 기준으로 쓴다.
- `천호3구역`은 위 진입 페이지 검색에서 `총 1건`이 확인된 현재형 신호다. 강동권 direct hit이 살아 있다는 뜻이다.
- `약수역`은 같은 진입 페이지 검색에서 `총 0건`이 확인됐다. 현재 direct hit이 안 보인다는 뜻이지, 영구 부재 판정은 아니다.
- `https://urban.seoul.go.kr/view/ntfc/mapForm.pop?noticeCode=...` 형태 URL은 standalone 공개 진입 URL로 쓰지 않는다. `noticeCode`는 식별자 참조로만 남기고, 실제 재확인은 진입 페이지 검색으로 다시 들어간다.

