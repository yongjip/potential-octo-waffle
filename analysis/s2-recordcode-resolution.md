# S2 본고시 URL·recordCode 정리

작성 기준: 2026-06-23 KST

`source-verification-action-queue.md`의 상위 5건인 S2 본고시 URL·recordCode 확보 항목을 수동 대조한 판정 로그다. 핵심은 `noticeCode`가 살아 있는지뿐 아니라, 해당 고시가 사업별 직접 정비계획/인가 원문인지 또는 상위계획 보조근거인지 분리하는 것이다.

## 요약

| closure_id | 사업장 | 판정 | 핵심 근거 |
| --- | --- | --- | --- |
| S2-0004 | 대치쌍용1차아파트 주택재건축정비사업조합 | confirmed | 서울도시공간포털 `noticeCode=11000NTC202512190003` URL 200 확인. 로컬 원문 제목이 대치쌍용1차 정비계획 결정 및 정비구역 지정 변경 고시다. |
| S2-0005 | 압구정한양7차아파트 재건축정비사업조합 | confirmed | 서울도시공간포털 `noticeCode=11000NTC202312010004` URL 200 확인. 원문은 압구정아파트지구 개발기본계획 변경 고시로, 한양5·7·8차가 포함된 상위계획 근거로만 사용한다. |
| S2-0006 | 송파한양2차아파트 재건축정비사업 조합 | deferred | `noticeCode=11000NTC202404180001` URL 200이나 원문 제목은 가락아파트지구 개발기본계획 변경 고시다. 송파한양2차 직접 정비구역/사업시행 원문은 자동 검색·로컬 원문에서 미확보다. |
| S2-0007 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | deferred | 현재 공식 상태는 추진위 승인 및 지구단위계획 결정안 열람/전략환경영향평가 공개 단계다. 서울도시공간포털 사업구역 레이어에는 `presentSn`만 있고 결정고시 `WTNNC_SN/NTFC_SN`이 없다. |
| S2-0010 | 한양연립 일대 가로주택정비사업 | deferred | `noticeCode=11000NTC202407080004` URL 200이나 원문은 구의·자양재정비촉진지구 자양1재정비촉진구역 변경 고시다. 한양연립 가로주택 직접 인가/고시 원문은 미확보다. |

## 세부 판정

### S2-0004 대치쌍용1차

- 공식 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202512190003
- recordCode/noticeCode: `11000NTC202512190003`
- 고시번호: 서울특별시고시 제2025-644호
- 고시일: 2025-11-20
- 로컬 텍스트: `data/urban/text/files/08-11000NTC202512190003-08-11000NTC202512190003-notice_file-서울특별시_제2025-644호_고시.txt`

로컬 원문 제목은 “대치쌍용1차아파트 재건축사업 정비계획 결정 및 정비구역 지정(변경), 지구단위계획구역 및 지구단위계획 결정(변경) 및 지형도면 고시”다. 따라서 본고시 URL·recordCode 확보 항목은 confirmed로 닫는다.

### S2-0005 압구정한양7차

- 공식 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202312010004
- recordCode/noticeCode: `11000NTC202312010004`
- 고시번호: 서울특별시고시 제2023-516호
- 고시일: 2023-11-23
- 로컬 텍스트: `data/urban/text/files/15-11000NTC202312010004-15-11000NTC202312010004-notice_file-서울특별시_제2023-516호_고시.txt`

원문은 압구정아파트지구 개발기본계획 변경 고시이며 주택용지 표에 한양5·7·8차가 포함된다. 이 URL은 공식 상위계획 근거로 연결하되, 한양7차 조합의 사업시행/관리처분 수치 직접 원문으로 승격하지 않는다.

### S2-0006 송파한양2차

- 상위계획 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202404180001
- noticeCode: `11000NTC202404180001`
- 고시번호: 서울특별시고시 제2024-178호
- 고시일: 2024-04-04
- 로컬 텍스트: `data/urban/text/files/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시.txt`

해당 원문은 가락아파트지구 개발기본계획 변경 고시다. `analysis/songpa-notice-value-corroboration.md`도 송파한양2차 고시번호 연결을 `auxiliary_plan_notice_connected`로 판정했다. 직접 원문은 추후 송파구/정보몽땅 사업시행·건축심의·조합설립 인가 문서에서 재검색한다.

### S2-0007 워커힐1단지

- 정보몽땅 사업개요: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001363i54&stepSeCode=101&div=sumry
- 광진구 열람공고: https://www.gwangjin.go.kr/portal/bbs/B0000378/view.do?notAncmtMgtNo=16096&menuNo=200192&menuNo=200192&noticeType=&searchCnd=&searchWrd=%EC%9B%8C%EC%BB%A4%ED%9E%90%EC%95%84%ED%8C%8C%ED%8A%B8&pageIndex=1
- 광진구 전략환경영향평가 공개: https://www.gwangjin.go.kr/portal/bbs/B0000378/view.do?notAncmtMgtNo=16413&menuNo=200192&menuNo=200192&noticeType=&searchCnd=&searchWrd=%EC%9B%8C%EC%BB%A4%ED%9E%90%EC%95%84%ED%8C%8C%ED%8A%B8&pageIndex=1
- 로컬 텍스트: `data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt`

광진구 공고 제2026-574호는 워커힐아파트 일원 지구단위계획구역 120,076㎡ 결정안을 열람 공고한다. 사업구역 레이어는 워커힐아파트 면적 89,954㎡, 추진위구성, 기준일 2026-03-31을 표시하나 결정고시 번호는 없다. 최종 결정고시가 아닌 사전 열람/환경평가 단계이므로 본고시 recordCode 확보는 단계 변경까지 deferred로 둔다.

### S2-0010 한양연립 일대 가로주택정비사업

- 오연결 상위계획 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202407080004
- noticeCode: `11000NTC202407080004`
- 고시번호: 서울특별시고시 제2024-282호
- 고시일: 2024-06-07
- 정보몽땅 사업개요: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001126x73&stepSeCode=102&div=sumry
- 로컬 텍스트: `data/urban/text/files/25-11000NTC202407080004-25-11000NTC202407080004-notice_file-서울특별시_제2024-282호_고시.txt`

2024-282 원문은 구의·자양재정비촉진지구 자양1재정비촉진구역 변경 고시다. 한양연립 일대 가로주택정비사업의 면적·용적률·건폐율·층수·세대수 직접 원문으로 쓰면 안 된다. 직접 인가/고시 원문은 정보몽땅 사업시행계획서 공개항목 또는 광진구 소규모주택정비 인가 공고에서 별도 확보해야 한다.
