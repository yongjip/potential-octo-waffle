# 확장 관심권 Intake Seed 보드

작성 기준: 2026-06-24 KST

이 문서는 확장 관심권 점검 결과를 실제 intake row로 옮길 때 복붙 출발점을 바로 제공한다. 강동권은 새 `gangdong_district_notice` row를 만드는 쪽이 맞고, 약수권 adjacent 기준선은 기존 `seoul_urban_notice` row를 재사용하는 쪽이 provenance가 맞다.

## 요약

- 새로 만들 seed: 5
- 기존 row 재사용: 3
- 강동권 create seed: 4
- 약수권 direct hit용 create seed: 1
- 약수권 reuse 대상: 3

## 새로 만드는 seed

| 권역 | mode | 사업/질문 | source_id | 기준 reference | route | 왜 새 row인가 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 강동권 | create_expansion_update_row | 천호3구역 | gangdong_district_notice | upd-20260624-0101 | expansion_zone_latest_check | 단계 신호 확인: 2026-06-24 KST 정보몽땅 추진경과 HTML(cafeId 740900000167p85, bsnsPk 11740-900000167) 재확인 기준 선택된 아코디언은 일반분양승인이다. 다만 같은 본문에서 착공신고 섹션에 2026-05-31 [착공신고]와 감리업체명 `륜덕종합건설(주)`가 보이고, 관리처분인가 섹션에 2026-02-25 (변경)인가신청, 2026-04-09 (변경)인가가 보이며, 준공인가 섹션에는 2026-01-22 준공인가전 사용허가와 준공예정일자 2026-05-31이 함께 노출된다. 같은 날 강동구 고시공고 상세(게시글 56120)와 첨부 HWPX 원문, 강동구보 제1872호 PDF 20쪽을 대조한 결과 서울특별시 강동구 고시 제2026-22호는 (부분)준공인가를 2026-01-22 기준으로 고시했고, 서울특별시 강동구 고시 제2026-66호는 관리처분계획(경미한 변경)인가의 3차 변경 인가일을 2026-04-09로 적시한다. 최근 공개자료 첫 행은 2793번 '제103차 대의원회의 개최 공고'로 발생일/등록일/결재일이 모두 2026-06-24다. | 강동구 고시 제2026-22호와 제2026-66호를 천호3 latest-stage baseline으로 유지하고, 정보몽땅 본문에 보이는 `착공신고 2026-05-31`까지 병기한 채 selected 단계 표기 갱신 여부와 추가 준공/입주 공고를 다시 확인 |
| 강동권 | create_expansion_update_row | 상일동 빌라단지 통합 재건축 | gangdong_district_notice |  | expansion_zone_latest_check | 단계 신호 확인: 상일동 빌라단지 통합 재건축은 정비사업정보공개에서 추진위원회승인 단계가 확인되며, 현재 noticeCode/원문 매핑은 미확보 상태다. | 정비사업정보공개 상세 항목에서 noticeCode와 최신 원문/첨부 링크를 확보해 강동권 단계보드와 수치 보드에 정밀 반영 |
| 강동권 | create_expansion_update_row | 성내미주아파트 주택재건축정비사업 | gangdong_district_notice | upd-20260624-0102 | expansion_zone_latest_check | 단계 신호 확인: 2026-06-24 KST 정비사업 정보몽땅 사업장 상세(cafeId 740100000041G12)에서 현재단계가 이전고시로 표시됐다. 추진경과 타임라인에는 조합설립추진위원회승인 2005-06-27, 조합설립인가 2007-04-17, 착공신고 2011-12-06만 직접 표기되고 사업시행인가·관리처분인가·준공인가·이전고시 섹션은 비어 있다. 같은 날짜 정보공개 자료열람 `/service/opendata/othbcDocSumry/lscr.do?cafeId=740100000041G12&publicManage=103`와 live HTML을 대조한 결과, 청산위원회 운영구분의 대분류는 `공통사항(382)`, `청산(381)`이고 소분류는 `조합청산(222)` 1건만 반환된다. direct 공개 page `/service/opendata/othbcDocInput/lscrOpen.do?cafeId=740100000041G12&othbcIemSn=222&bsnsPk=11740-100000041`는 `등록된 공개자료가 없습니다.`를 표시하고, 추진경과 타임라인의 조합청산 섹션에는 2021-02-01 [조합청산] 한 줄만 보인다. 최근 공개자료 첫 행은 493번 '제77차 이사회의 회의록'으로 발생일 2016-10-27, 등록일 2016-12-27이며 최신 공개자료 상단 5건도 모두 2015~2016년 자료다. 같은 날 강동구 공식 통합검색을 `성내미주`, `성내미주 사업시행`, `성내미주 관리처분`, `성내미주 준공`, `성내미주 이전`으로 재검색한 결과, direct 사업 hit은 구보제1341호(작성일 2016-08-24, 본문에 '성내미주아파트 주택재건축정비사업 공사완료 고시'와 '성내미주아파트 주택재건축 정비구역 변경지정(경미한변경) 고시' 포함)와 구보제1235호(작성일 2014-09-23, 본문에 '성내미주아파트 주택재건축정비사업 사업시행(변경)인가 고시' 포함)까지만 확인된다. 추가로 `강동구 제2016-123호` 원문 첫머리는 서울특별시고시 제2006-202호, 강동구고시 제2008-34호, 서울특별시고시 제2010-264호, 서울특별시고시 제2012-342호, 강동구고시 제2013-59호, 강동구고시 제2016-109호를 모두 `변경지정 된 성내미주아파트 주택재건축정비구역`의 연쇄로 묶고 있어 현재 확보된 direct 공식 체인 안에서는 `이전고시`가 아니라 정비구역 지정/변경지정 계열로 읽는 편이 맞다. `강동구2016-109.PDF`, `강동구2013-59.PDF` 형태의 서울도시공간포털 아카이브 direct URL도 같은 날짜 기준 404였다. `이전고시`, `준공인가` direct hit은 강동구 공식 검색에서 새로 닫히지 않았다. | 강동구 direct latest hit이 2016/2014에 머무르는 상태와 청산위원회 공개 분류가 `조합청산(222) 1건 only + direct 공개 empty`인 상태를 baseline으로 같이 유지하고, 다음 점검에서는 정보몽땅 자료열람/최근 공개자료에서 이전고시·준공 또는 이전 관련 원문 식별자가 새로 생기는지 먼저 확인 |
| 강동권 | create_expansion_update_row | 신동아1·2차아파트 주택재건축 정비사업 | gangdong_district_notice | upd-20260624-0103 | expansion_zone_latest_check | 단계 신호 확인: 2026-06-24 KST 정보몽땅 추진경과 HTML(cafeId 740100001049T99, bsnsPk 11740-100001049) 재확인 기준 선택된 아코디언은 준공인가다. 같은 본문에서 준공인가 섹션에는 2024-06-27 준공인가전 사용허가, 2024-10-10 인가, 2024-10-16 인가고시와 공사완료일일자 2024-06-26이 노출된다. 관리처분인가 섹션의 마지막 visible 값은 2025-04-18 (변경)인가신청, 2025-04-24 (변경)인가다. 최근 공개자료 첫 행은 1728번 '선거관리위원회 구성(확정)공고-(임원)'로 발생일/등록일/결재일이 2026-06-19이며, 상단에는 2026년 5월 월별자금 입출금세부내역과 26년5월 공정확인서도 보인다. | 정보공개 자료열람에서 준공인가 이후 공개항목과 공사시행 월별공사진행사항을 읽고, 길동 43번지 generic 카드와 분리한 current-stage baseline을 유지 |
| 약수동 주변 | create_zone_search_row_when_direct_hit_found | 약수 direct hit 또는 신당·금호 adjacent 변화 | jung_district_notice |  | expansion_zone_latest_check | 중구 고시공고 direct hit 탐색 결과는 아직 별도 official update row가 없다. | 약수역 direct hit가 생기면 새 row를 만들고, 없으면 adjacent 기준선 유지 여부만 activation/weekly log에 남긴다. |

## 기존 row 재사용

| 권역 | 사업 | 재사용 update_id | source_id | route | 재사용 이유 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- |
| 약수동 주변 | 신당 제8구역 주택재개발정비사업 | upd-20260624-0104 | seoul_urban_notice | source_verification_decision | 이미 서울도시공간포털 고시 row가 tracked_update_id로 존재하므로, baseline refresh는 기존 row를 재사용하는 편이 provenance가 맞다. | 중구 고시공고·정보몽땅·현장 답사에서 약수역 생활권 겹침 정도를 먼저 검증 |
| 약수동 주변 | 신당 제9주택재개발정비구역 | upd-20260624-0105 | seoul_urban_notice | source_verification_decision | 이미 서울도시공간포털 고시 row가 tracked_update_id로 존재하므로, baseline refresh는 기존 row를 재사용하는 편이 provenance가 맞다. | 신당 제8과 함께 현장 동선과 중구 공고문을 나란히 확인 |
| 약수동 주변 | 금호 제14-1 주택재개발 정비사업 | upd-20260624-0106 | seoul_urban_notice | source_verification_decision | 이미 서울도시공간포털 고시 row가 tracked_update_id로 존재하므로, baseline refresh는 기존 row를 재사용하는 편이 provenance가 맞다. | 중구측 청구 생활권 자료와 분리 보관하고, direct hit 발생 시 비교 기준으로만 사용 |

## Copy-ready JSON

아래 JSON은 실제 입력 형식이다. `official_url`, `notice_no`, `update_date`는 그날 확인한 실제 값으로 바꾼다.

### 천호3구역

```json
{
  "update_id": "upd-YYYYMMDD-gangdong_district_notice-exp-short-gd-cheonho3",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "gangdong_district_notice",
  "update_date": "YYYY-MM-DD",
  "title": "강동구 고시공고/정보몽땅에서 천호3구역 최신 단계 또는 신규 공개항목 확인",
  "official_url": "https://www.gangdong.go.kr/",
  "project_name": "천호3구역",
  "trigger_type": "district_notice",
  "notice_no": "강동구 제2025-194호",
  "observed_change": "정비사업 정보몽땅 selected 단계는 일반분양승인으로 남아 있지만, 같은 추진경과 본문에는 `착공신고 2026-05-31`, 관리처분계획(경미한 변경)인가 2026-04-15(고시 제2026-66호, 3차 변경 인가일 2026-04-09), (부분)준공인가 2026-01-28(고시 제2026-22호, 준공인가일 2026-01-22)가 함께 보인다. 이후 최신 단계 또는 공개자료 재확인",
  "evidence_status": "unverified",
  "decision_status": "inbox",
  "notes": "기준선 reference update_id=upd-20260624-0101; 2026-06-24 KST 정보몽땅 추진경과 HTML(cafeId 740900000167p85, bsnsPk 11740-900000167) 재확인 기준 선택된 아코디언은 일반분양승인이다. 다만 같은 본문에서 착공신고 섹션에 2026-05-31 [착공신고]와 감리업체명 `륜덕종합건설(주)`가 보이고, 관리처분인가 섹션에 2026-02-25 (변경)인가신청, 2026-04-09 (변경)인가가 보이며, 준공인가 섹션에는 2026-01-22 준공인가전 사용허가와 준공예정일자 2026-05-31이 함께 노출된다. 같은 날 강동구 고시공고 상세(게시글 56120)와 첨부 HWPX 원문, 강동구보 제1872호 PDF 20쪽을 대조한 결과 서울특별시 강동구 고시 제2026-22호는 (부분)준공인가를 2026-01-22 기준으로 고시했고, 서울특별시 강동구 고시 제2026-66호는 관리처분계획(경미한 변경)인가의 3차 변경 인가일을 2026-04-09로 적시한다. 최근 공개자료 첫 행은 2793번 '제103차 대의원회의 개최 공고'로 발생일/등록일/결재일이 모두 2026-06-24다.; 주의: 2026-01-22와 2026-04-09 후행 신호는 공식 공고로 닫혔고, 정보몽땅 본문에는 2026-05-31 착공신고도 직접 노출된다. 다만 selected 단계가 여전히 일반분양승인으로 남아 있으므로, 천호3 최신 라벨은 당분간 `selected 단계 + 후행 공식 공고 병기` 방식으로 유지한다.; 촉진계획 경미변경 고시라 최근 사업 단계 전체를 단독으로 확정하지는 않는다."
}
```

### 상일동 빌라단지 통합 재건축

```json
{
  "update_id": "upd-YYYYMMDD-gangdong_district_notice-exp-short-gd-sangilvilla",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "gangdong_district_notice",
  "update_date": "YYYY-MM-DD",
  "title": "강동구 고시공고/정보몽땅에서 상일동 빌라단지 통합 재건축 최신 단계 또는 신규 공개항목 확인",
  "official_url": "https://www.gangdong.go.kr/",
  "project_name": "상일동 빌라단지 통합 재건축",
  "trigger_type": "district_notice",
  "notice_no": "신규 고시번호 또는 빈값",
  "observed_change": "정비사업정보공개 기준 추진위원회 승인 단계 관측 이후 최신 단계 또는 공개자료 재확인",
  "evidence_status": "unverified",
  "decision_status": "inbox",
  "notes": "기준선 reference update_id=없음; 상일동 빌라단지 통합 재건축은 정비사업정보공개에서 추진위원회승인 단계가 확인되며, 현재 noticeCode/원문 매핑은 미확보 상태다.; 주의: noticeCode가 없어 서울도시공간포털 연동이 되지 않아 단계 해석과 고시 시점 비교의 확신도는 낮다.; noticeCode 미확보로 단계·원문 추적이 아직 약하고, 공개수치 확신도가 낮다."
}
```

### 성내미주아파트 주택재건축정비사업

```json
{
  "update_id": "upd-YYYYMMDD-gangdong_district_notice-exp-short-gd-seongnaemiju",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "gangdong_district_notice",
  "update_date": "YYYY-MM-DD",
  "title": "강동구 고시공고/정보몽땅에서 성내미주아파트 주택재건축정비사업 최신 단계 또는 신규 공개항목 확인",
  "official_url": "https://www.gangdong.go.kr/",
  "project_name": "성내미주아파트 주택재건축정비사업",
  "trigger_type": "district_notice",
  "notice_no": "강동구 제2016-123호",
  "observed_change": "정비사업 정보몽땅 사업 진행단계는 이전고시로 표시되지만, 청산위원회 정보공개 자료열람의 실제 공개 분류는 `조합청산(222)` 1건뿐이고 direct page는 `등록된 공개자료가 없습니다.` 상태다. 강동구 공식 검색에서 직접 잡히는 최신 성내미주 hit은 여전히 구보제1341호(2016-08-24, 공사완료 고시·정비구역 변경지정)와 구보제1235호(2014-09-23, 사업시행(변경)인가)까지다. 이후 최신 단계 또는 공개자료 재확인",
  "evidence_status": "unverified",
  "decision_status": "inbox",
  "notes": "기준선 reference update_id=upd-20260624-0102; 2026-06-24 KST 정비사업 정보몽땅 사업장 상세(cafeId 740100000041G12)에서 현재단계가 이전고시로 표시됐다. 추진경과 타임라인에는 조합설립추진위원회승인 2005-06-27, 조합설립인가 2007-04-17, 착공신고 2011-12-06만 직접 표기되고 사업시행인가·관리처분인가·준공인가·이전고시 섹션은 비어 있다. 같은 날짜 정보공개 자료열람 `/service/opendata/othbcDocSumry/lscr.do?cafeId=740100000041G12&publicManage=103`와 live HTML을 대조한 결과, 청산위원회 운영구분의 대분류는 `공통사항(382)`, `청산(381)`이고 소분류는 `조합청산(222)` 1건만 반환된다. direct 공개 page `/service/opendata/othbcDocInput/lscrOpen.do?cafeId=740100000041G12&othbcIemSn=222&bsnsPk=11740-100000041`는 `등록된 공개자료가 없습니다.`를 표시하고, 추진경과 타임라인의 조합청산 섹션에는 2021-02-01 [조합청산] 한 줄만 보인다. 최근 공개자료 첫 행은 493번 '제77차 이사회의 회의록'으로 발생일 2016-10-27, 등록일 2016-12-27이며 최신 공개자료 상단 5건도 모두 2015~2016년 자료다. 같은 날 강동구 공식 통합검색을 `성내미주`, `성내미주 사업시행`, `성내미주 관리처분`, `성내미주 준공`, `성내미주 이전`으로 재검색한 결과, direct 사업 hit은 구보제1341호(작성일 2016-08-24, 본문에 '성내미주아파트 주택재건축정비사업 공사완료 고시'와 '성내미주아파트 주택재건축 정비구역 변경지정(경미한변경) 고시' 포함)와 구보제1235호(작성일 2014-09-23, 본문에 '성내미주아파트 주택재건축정비사업 사업시행(변경)인가 고시' 포함)까지만 확인된다. 추가로 `강동구 제2016-123호` 원문 첫머리는 서울특별시고시 제2006-202호, 강동구고시 제2008-34호, 서울특별시고시 제2010-264호, 서울특별시고시 제2012-342호, 강동구고시 제2013-59호, 강동구고시 제2016-109호를 모두 `변경지정 된 성내미주아파트 주택재건축정비구역`의 연쇄로 묶고 있어 현재 확보된 direct 공식 체인 안에서는 `이전고시`가 아니라 정비구역 지정/변경지정 계열로 읽는 편이 맞다. `강동구2016-109.PDF`, `강동구2013-59.PDF` 형태의 서울도시공간포털 아카이브 direct URL도 같은 날짜 기준 404였다. `이전고시`, `준공인가` direct hit은 강동구 공식 검색에서 새로 닫히지 않았다.; 주의: 강동구 direct 최신 공고 공백은 여전히 남아 있다. 따라서 현재 단계 해석은 정보몽땅 이전고시 신호를 우선 사용하되, 구청 고시공고 기준으로는 2016년 공사완료 이후 direct 공식 원문이 새로 닫히지 않았다는 점, 2016-123 원문이 과거 연쇄 고시를 정비구역 지정/변경지정 체인으로만 묶고 있다는 점, 그리고 청산위원회 공개자료는 `조합청산(222)` 1건 only지만 direct 열람이 비어 있다는 점을 같이 표시해야 한다.; 2016년 고시라 현재 단계와 최근 공개자료는 별도 최신 확인이 필요하다."
}
```

### 신동아1·2차아파트 주택재건축 정비사업

```json
{
  "update_id": "upd-YYYYMMDD-gangdong_district_notice-exp-short-gd-sindonga12",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "gangdong_district_notice",
  "update_date": "YYYY-MM-DD",
  "title": "강동구 고시공고/정보몽땅에서 신동아1·2차아파트 주택재건축 정비사업 최신 단계 또는 신규 공개항목 확인",
  "official_url": "https://www.gangdong.go.kr/",
  "project_name": "신동아1·2차아파트 주택재건축 정비사업",
  "trigger_type": "district_notice",
  "notice_no": "강동구 제2025-48호",
  "observed_change": "정비사업 정보몽땅 사업 진행단계: 길동신동아1,2차아파트 주택재건축정비사업조합 / 준공인가 이후 최신 단계 또는 공개자료 재확인",
  "evidence_status": "unverified",
  "decision_status": "inbox",
  "notes": "기준선 reference update_id=upd-20260624-0103; 2026-06-24 KST 정보몽땅 추진경과 HTML(cafeId 740100001049T99, bsnsPk 11740-100001049) 재확인 기준 선택된 아코디언은 준공인가다. 같은 본문에서 준공인가 섹션에는 2024-06-27 준공인가전 사용허가, 2024-10-10 인가, 2024-10-16 인가고시와 공사완료일일자 2024-06-26이 노출된다. 관리처분인가 섹션의 마지막 visible 값은 2025-04-18 (변경)인가신청, 2025-04-24 (변경)인가다. 최근 공개자료 첫 행은 1728번 '선거관리위원회 구성(확정)공고-(임원)'로 발생일/등록일/결재일이 2026-06-19이며, 상단에는 2026년 5월 월별자금 입출금세부내역과 26년5월 공정확인서도 보인다.; 주의: 2025-04-02 계획변경 고시는 baseline으로 남기고, 현재 단계 해석은 정보몽땅 준공인가 신호를 우선 사용한다.; 경미변경 고시이므로 최신 인허가 단계보다 정비계획 수치 기준으로 읽어야 한다."
}
```

### 약수 direct hit 또는 신당·금호 adjacent 변화

```json
{
  "update_id": "upd-YYYYMMDD-jung_district_notice-yaksu-direct-hit",
  "discovered_at": "YYYY-MM-DD KST",
  "source_id": "jung_district_notice",
  "update_date": "YYYY-MM-DD",
  "title": "중구 고시공고에서 약수권 direct hit 또는 인접 대조군 변화 발견",
  "official_url": "https://www.junggu.seoul.kr/index.html",
  "project_name": "약수 direct hit 또는 신당·금호 adjacent 변화",
  "trigger_type": "district_notice",
  "notice_no": "신규 고시번호 또는 빈값",
  "observed_change": "약수 direct hit 여부와 신당8·신당9·금호14-1 기준선 변화 재확인",
  "evidence_status": "unverified",
  "decision_status": "inbox",
  "notes": "direct hit가 새로 닫히면 이 row를 만들고, 없으면 activation intake 또는 weekly log만 갱신; adjacent baseline: 신당 제8구역 주택재개발정비사업: 정비구역 58,651.3㎡, 택지(공동주택) 45,184.0㎡, 정비계획 용적률 248.64%, 공공청사 1,306㎡, 총 기부채납 10.81%, 총 1,215세대/임대 183세대 / 신당 제9주택재개발정비구역: 정비구역 18,651㎡, 획지1 17,559㎡, 건폐율 60% 이하, 정비계획 상한용적률 182%, 7층/28m 이하, 주택공급 334세대, 공공시설 환산부지면적 967.39㎡ / 금호 제14-1 주택재개발 정비사업: 연면적 15,500㎡, 구역면적 5,144.70㎡, 택지 4,043.60㎡, 건폐율 28%, 개발가능용적률 238.67% 이하(설계 232.25%), 최고 16층 이하, 주택공급 108세대, 공공시설부지 제공 424.7㎡"
}
```

## 운영 원칙

1. 강동권에서 새 단계·공개자료를 찾으면 [official-update-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-update-intake.json)에 `gangdong_district_notice` row를 새로 만든다.
2. 약수권에서 `신당8·신당9·금호14-1` baseline만 다시 읽은 경우에는 기존 `seoul_urban_notice` row를 재사용한다.
3. 약수권에서 실제 `약수 direct hit`가 새로 생겼을 때만 `jung_district_notice` 새 row를 만든다.
4. 새 row를 넣은 뒤에는 [official-update-intake-board.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-update-intake-board.md)와 [official-update-scenario-playbook.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/official-update-scenario-playbook.md)를 다시 생성해 route를 확인한다.
5. 점검 메모만 있고 새 공식 update가 없으면 [official-source-activation-intake.json](/Users/yongjip/Projects/potential-octo-waffle/data/review/official-source-activation-intake.json) 또는 [weekly-monitoring-execution-log.md](/Users/yongjip/Projects/potential-octo-waffle/analysis/weekly-monitoring-execution-log.md)에 남긴다.

