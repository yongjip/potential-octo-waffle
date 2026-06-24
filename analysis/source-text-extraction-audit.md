# 원문 텍스트 추출 감사

작성 기준: 2026-06-24 KST

서울도시공간포털 고시 원문과 자치구 고시공고 첨부의 텍스트 추출 상태를 합쳐 본 감사표다. 목적은 HWP/HWPX/PDF 원문을 공식 근거로 쓸 수 있는지, 그리고 LibreOffice `soffice` 없이 처리 가능한 범위를 확인하는 것이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 원문/첨부 파일 | 60 |
| 텍스트 확보 | 60 |
| 미해결 추출 | 0 |
| soffice 필요 상태 | 0 |
| PDF | 46 |
| HWP | 5 |
| HWPX | 4 |
| OCR 원문 대조 필요 | 10 |
| OCR 이미지 재대조 완료 | 3 |
| 짧은 서식/표지 확인 필요 | 5 |

## 출처별 커버리지

| 출처 | 파일 | 텍스트 확보 | 미해결 | soffice 필요 | PDF | HWP | HWPX | 추출 방식 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 서울도시공간포털 고시 원문 | 40 | 40 | 0 | 0 | 36 | 4 | 0 | pdf_text_layer 26; pdf_ocr 10; hwp5_body_stream 3; hwp_binaries_ocr 1 |
| 강남·송파구청 고시공고 첨부 | 1 | 1 | 0 | 0 | 1 | 0 | 0 | pdf_text_layer 1 |
| 광진구청 고시공고 첨부 | 19 | 19 | 0 | 0 | 9 | 1 | 4 | pdf_text_layer 7; html_preserved_text 5; hwpx_zip_xml 4; pdf_ocr 2; hwp5_body_stream 1 |

## 추출 방식별

| 추출 방식 | 건수 |
| --- | --- |
| pdf_text_layer | 34 |
| pdf_ocr | 12 |
| html_preserved_text | 5 |
| hwp5_body_stream | 4 |
| hwpx_zip_xml | 4 |
| hwp_binaries_ocr | 1 |

## 검토 우선순위

| 우선순위 | 건수 |
| --- | --- |
| P3_text_layer | 39 |
| P1_ocr_verify | 10 |
| P2_short_form | 5 |
| P2_hwp_direct_check | 3 |
| P3_ocr_rechecked | 3 |

## 텍스트 품질 플래그

| 품질 플래그 | 건수 |
| --- | --- |
| text_layer | 32 |
| pdf_image_ocr_verify | 9 |
| html_preserved_text | 5 |
| short_form_or_cover_page | 5 |
| hwp5_direct_body_stream | 3 |
| pdf_image_ocr_rechecked | 3 |
| hwpx_xml_text | 2 |
| hwp_image_ocr_verify | 1 |

## 미해결 항목

현재 미해결 추출 항목은 없다.

## 원문 대조 큐

| 우선순위 | 출처 | 후보 | 사업장 | 형식 | 추출 방식 | 품질 | 글자 수 | 텍스트 경로 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 7 | 대치쌍용2차아파트 주택재건축정비사업조합 | pdf | pdf_ocr | pdf_image_ocr_verify | 6285 | data/urban/text/files/07-11000NTC201707138200-07-11000NTC201707138200-notice_file-강남구2017-99.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | hwp | hwp_binaries_ocr | hwp_image_ocr_verify | 16152 | data/urban/text/files/14-11000NTC201804262948-14-11000NTC201804262948-notice_file-서울특별시2017-431.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 16 | 가락1차현대아파트 재건축정비사업 조합 | pdf | pdf_ocr | pdf_image_ocr_verify | 12363 | data/urban/text/files/16-11000NTC202105100001-16-11000NTC202105100001-notice_file-송파구_2021-88호_고시.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 17 | 송파한양2차아파트 재건축정비사업 조합 | pdf | pdf_ocr | pdf_image_ocr_verify | 33847 | data/urban/text/files/17-11000NTC202506170006-17-11000NTC202506170006-business-notice_file-서울특별시_제2025-239호_고시.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 17 | 송파한양2차아파트 재건축정비사업 조합 | pdf | pdf_ocr | pdf_image_ocr_verify | 6110 | data/urban/text/files/17-11000NTC202404180001-17-11000NTC202404180001-notice_file-서울특별시_제2024-178호_고시.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 19 | 대림가락아파트 재건축정비사업조합 | pdf | pdf_ocr | pdf_image_ocr_verify | 15504 | data/urban/text/files/19-11000NTC202111260001-19-11000NTC202111260001-notice_file-서울특별시_2021-551호_고시.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 20 | 마천1재정비촉진구역 주택재개발정비사업조합 | pdf | pdf_ocr | pdf_image_ocr_verify | 982 | data/urban/text/files/20-11000NTC197312011134-20-11000NTC197312011134-notice_file-건설부470.txt |
| P1_ocr_verify | 서울도시공간포털 고시 원문 | 25 | 한양연립 일대 가로주택정비사업 | pdf | pdf_ocr | pdf_image_ocr_verify | 25773 | data/urban/text/files/25-11000NTC202407080004-25-11000NTC202407080004-notice_file-서울특별시_제2024-282호_고시.txt |
| P1_ocr_verify | 광진구청 고시공고 첨부 | 29 | 자양1의4구역 가로주택정비사업 | pdf | pdf_ocr | pdf_image_ocr_verify | 682 | data/urban/text/gwangjin-gu/files/29-B0000003-6357990-1-29-B0000003-6357990-gwangjin-gu-1-직인날인-조합설립-변경-인가-공고문.txt |
| P1_ocr_verify | 광진구청 고시공고 첨부 | 29 | 자양1의4구역 가로주택정비사업 | pdf | pdf_ocr | pdf_image_ocr_verify | 779 | data/urban/text/gwangjin-gu/files/29-B0000003-6353195-1-29-B0000003-6353195-gwangjin-gu-1-공람공고문-안.txt |
| P2_hwp_direct_check | 서울도시공간포털 고시 원문 | 3 | 잠실우성아파트 재건축정비사업조합 | hwp | hwp5_body_stream | hwp5_direct_body_stream | 6025 | data/urban/text/files/03-11000NTC201512177681-03-11000NTC201512177681-notice_file-서울특별시2015-401.txt |
| P2_hwp_direct_check | 서울도시공간포털 고시 원문 | 13 | 자양제7구역 주택재건축정비사업 조합 | hwp | hwp5_body_stream | hwp5_direct_body_stream | 8122 | data/urban/text/files/13-11000NTC201808300002-13-11000NTC201808300002-notice_file-서울특별시2018-268.txt |
| P2_hwp_direct_check | 서울도시공간포털 고시 원문 | 22 | 중곡아파트 주택재건축정비사업조합 | hwp | hwp5_body_stream | hwp5_direct_body_stream | 5035 | data/urban/text/files/22-11000NTC201411137333-22-11000NTC201411137333-notice_file-서울특별시2014-382.txt |
| P2_short_form | 광진구청 고시공고 첨부 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | pdf | pdf_text_layer | short_form_or_cover_page | 224 | data/urban/text/gwangjin-gu/files/24-B0000378-16413-1-24-B0000378-16413-gwangjin-gu-1-붙임2-주민의견제출서.txt |
| P2_short_form | 광진구청 고시공고 첨부 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | pdf | pdf_text_layer | short_form_or_cover_page | 46 | data/urban/text/gwangjin-gu/files/24-B0000378-16413-3-24-B0000378-16413-gwangjin-gu-3-공고문.txt |
| P2_short_form | 광진구청 고시공고 첨부 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | hwp | hwp5_body_stream | short_form_or_cover_page | 192 | data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |
| P2_short_form | 광진구청 고시공고 첨부 | 27 | 광장극동아파트 재건축사업 (신속통합기획) | hwpx | hwpx_zip_xml | short_form_or_cover_page | 195 | data/urban/text/gwangjin-gu/files/27-B0000378-15811-2-27-B0000378-15811-gwangjin-gu-2-2-재공람의견서_광장극동아파트-재건축사업.txt |
| P2_short_form | 광진구청 고시공고 첨부 | 29 | 자양1의4구역 가로주택정비사업 | hwpx | hwpx_zip_xml | short_form_or_cover_page | 187 | data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt |

## OCR 재대조 완료

| 출처 | 사업장 | 형식 | 추출 방식 | 품질 | 글자 수 | 텍스트 경로 |
| --- | --- | --- | --- | --- | --- | --- |
| 서울도시공간포털 고시 원문 | 금호 제14-1 주택재개발 정비사업 | pdf | pdf_ocr | pdf_image_ocr_rechecked | 10339 | data/urban/text/files/exp-short-ys-geumho14-1-11200NTC202302270005-exp-short-ys-geumho14-1-11200NTC202302270005-notice_file-성동구_2023-13호_고시.txt |
| 서울도시공간포털 고시 원문 | 신당 제8구역 주택재개발정비사업 | pdf | pdf_ocr | pdf_image_ocr_rechecked | 15654 | data/urban/text/files/exp-short-ys-sindang8-11140NTC202302130001-exp-short-ys-sindang8-11140NTC202302130001-notice_file-중구_2023-6호_고시.txt |
| 서울도시공간포털 고시 원문 | 신당 제9주택재개발정비구역 | pdf | pdf_ocr | pdf_image_ocr_rechecked | 10298 | data/urban/text/files/exp-short-ys-sindang9-11140NTC202109170002-exp-short-ys-sindang9-11140NTC202109170002-notice_file-중구_2021-102호_고시.txt |

## 해석

1. 현재 manifest 기준으로 `soffice_required=Y`인 항목은 없다.
2. HWP5 본문 스트림은 `scripts/extract_hwp5_text.py`로 직접 추출하고, 이미지형 HWP는 BinData 이미지 OCR 결과를 사용한다.
3. HWPX는 zip 내부 XML을 직접 읽어 추출한다.
4. `P1_ocr_verify`는 아직 이미지 대조가 남은 OCR 큐다.
5. `P3_ocr_rechecked`는 OCR 텍스트를 원문 이미지와 대조해 비교 매트릭스에 올릴 수 있는 상태로 닫힌 항목이다.
