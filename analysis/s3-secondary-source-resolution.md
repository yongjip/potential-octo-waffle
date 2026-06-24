# S3 2차 공식 출처 판정

작성 기준: 2026-06-23 KST

`source-verification-action-queue.md`의 S3 `pending_secondary_source` 및 `pending_ocr_image_review` 상위 11건을 수동 대조한 판정 로그다. 정보몽땅 사업개요의 현재값과 서울도시계획포털 고시 이미지의 정비계획/법적상한 값이 서로 다른 기준일 수 있으므로, 동일 수치로 강제 병합하지 않고 기준을 분리한다.

## 요약

| closure_id | 사업장 | 필드 | 판정 | 처리 |
| --- | --- | --- | --- | --- |
| S3-0014 | 대치쌍용2차 | 용적률 | 정보몽땅 299%, 2017-99 고시 법적상한 299.82% 이하 | confirmed, precision/basis split |
| S3-0015 | 대치쌍용2차 | 건폐율 | 정보몽땅 21%, 2017-99 고시 허용 건폐율 30% 이하 | confirmed, basis split |
| S3-0016 | 대치쌍용2차 | 층수 | 정보몽땅 지상35/지하3, 2017-99 고시 최고35층 및 110m 이하 | confirmed, partial direct notice |
| S3-0017 | 대치쌍용2차 | 최고높이 | 정보몽땅 111m, 2017-99 고시 110m 이하 | confirmed, basis split |
| S3-0019 | 대치쌍용2차 | 정비구역 면적 | 2017-99 고시 이미지에서 24,484.4㎡ 직접 확인 | confirmed |
| S3-0022 | 송파한양2차 | 최고높이 | 정보몽땅 사업개요 130m 확인, 제2024-178호는 가락아파트지구 상위계획 | confirmed, official summary |
| S3-0025 | 대림가락 | 용적률 | 정보몽땅 300%, 2021-551 고시 법적상한 299.98% 이하 | confirmed, precision/basis split |
| S3-0026 | 대림가락 | 건폐율 | 정보몽땅 21%, 2021-551 고시 허용 건폐율 50% 이하 | confirmed, basis split |
| S3-0027 | 대림가락 | 정비구역 면적 | 정보몽땅 34,284.1㎡, 2021-551 고시 정비구역 35,241.0㎡/획지1 34,043.8㎡ | confirmed, basis split |
| S3-0028 | 대림가락 | 층수 | 정보몽땅 지상35/지하2, 2021-551 고시 최고35층 및 129m 이하 | confirmed, partial direct notice |
| S3-0037 | 한양연립 | 총 세대수 | 2024-282는 오연결, 정보몽땅 사업개요 값 176세대를 보조 공식값으로 연결 | confirmed, official summary |

## 판정 근거

### 대치쌍용2차

- 제2017-99호 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC201707138200
- 로컬 텍스트: `data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt`
- 정보몽땅 사업개요: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=680900000567C51&stepSeCode=102&div=sumry

정보몽땅 사업개요는 현재 보강 수치로 정비구역 면적 24,484.4㎡, 건폐율 21%, 용적률 299%, 최고높이 111m, 층수 지상35/지하3, 총 세대수 490을 표시한다.

제2017-99호 고시 이미지는 정비구역 면적 24,484.4㎡를 직접 확인해 주며, 용적률은 정비계획 250.0% 이하와 예정 법적상한 299.82% 이하로 구분한다. 건폐율 30% 이하, 최고35층/110m 이하도 고시 기준이다. 따라서 정보몽땅 현재값과 고시 기준값을 같은 필드의 동일 의미로 덮어쓰지 않고, 현재 사업개요값과 정비계획 상한값을 분리해 기록한다.

### 송파한양2차

- 정보몽땅 사업개요: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000132y43&stepSeCode=102&div=sumry
- 상위계획 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202404180001
- 상위계획 로컬 텍스트: `data/urban/text/files/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시.txt`

송파한양2차 최고높이 130m는 정보몽땅 사업개요에서 확인되는 사업장 현재값이다. 제2024-178호는 가락아파트지구 개발기본계획 변경 고시로, 송파한양2차 직접 사업시행/건축계획 원문은 아니다. 따라서 130m는 공식 사업개요 보조값으로 유지하되, 직접 인가 고시나 사업시행계획서 확보 시 재대조한다.

### 대림가락

- 제2021-551호 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202111260001
- 로컬 텍스트: `data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt`
- 정보몽땅 사업개요: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=710900000854k71&stepSeCode=102&div=sumry

정보몽땅 사업개요는 현재 보강 수치로 정비구역 면적 34,284.1㎡, 건폐율 21%, 용적률 300%, 최고높이 129m, 층수 지상35/지하2, 총 세대수 786을 표시한다.

제2021-551호 고시 이미지는 법적상한용적률 299.98% 이하, 정비계획용적률 234.36% 이하, 건폐율 50% 이하, 최고35층 이하, 해발고도 129m 이하를 확인해 준다. 정비구역 면적은 35,241.0㎡ 및 획지1 34,043.8㎡로 표시되어 정보몽땅 사업개요의 34,284.1㎡와 기준이 다르다. 따라서 현재 사업개요값, 정비계획 상한값, 구역/획지 면적값을 분리해서 남긴다.

### 한양연립

- 정보몽땅 사업개요: https://cleanup.seoul.go.kr/cafe/mastr-cleanup-bsnsSumry/execute.do?cafeId=215900001126x73&stepSeCode=102&div=sumry
- 오연결 고시 URL: https://urban.seoul.go.kr/view/html/PMNU2040000000?noticeCode=11000NTC202407080004
- 오연결 로컬 텍스트: `data/urban/text/files/25-11000NTC202407080004-25-11000NTC202407080004-notice_file-서울특별시_제2024-282호_고시.txt`

제2024-282호는 구의·자양재정비촉진지구 자양1재정비촉진구역 변경 고시이며, 한양연립 일대 가로주택정비사업의 직접 세대수 원문으로 사용할 수 없다. 총 세대수 176은 한양연립 사업장 정보몽땅 사업개요에서 확인되는 공식 보조값으로 연결한다. 직접 인가 원문이 확보되면 정보몽땅 값과 재대조한다.
