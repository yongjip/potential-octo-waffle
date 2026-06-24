# HWP/HWPX 변환 감사

작성 기준: 2026-06-24 KST

서울도시공간포털과 광진구청에서 받은 HWP/HWPX 원문만 따로 모은 변환 감사표다. 목적은 한글 파일 처리에서 LibreOffice `soffice`에 막힌 항목이 있는지, 자체 추출기로 신뢰 가능한 텍스트를 확보했는지 확인하는 것이다. 새 파일 단건 진단은 `python3 scripts/convert_hwp_document.py <파일> -o <텍스트> --diagnostics <진단.json>`으로 처리한다.

## 요약

| 항목 | 값 |
| --- | ---: |
| HWP/HWPX 파일 | 9 |
| HWP | 5 |
| HWPX | 4 |
| 텍스트 확보 | 9 |
| 자체 텍스트 준비 | 5 |
| OCR 이미지 대조 필요 | 1 |
| 변환 차단/미해결 | 0 |

## 변환 경로별

| 변환 경로 | 건수 |
| --- | --- |
| hwp5_body_stream_direct | 4 |
| hwpx_zip_xml_direct | 4 |
| hwp_bindata_image_ocr | 1 |

## 검토 상태별

| 검토 상태 | 건수 |
| --- | --- |
| native_text_ready | 5 |
| short_text_review | 3 |
| ocr_image_review | 1 |

## 차단/미해결 항목

현재 HWP/HWPX 변환 차단 또는 미해결 항목은 없다.

## 검토 큐

| 검토 상태 | 출처 | 후보 | 사업장 | 형식 | 변환 경로 | 글자 수 | 텍스트 경로 | HWP 이미지 | OCR 텍스트 | 다음 액션 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ocr_image_review | 서울도시공간포털 고시 원문 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | hwp | hwp_bindata_image_ocr | 16152 | data/urban/text/files/14-11000NTC201804262948-14-11000NTC201804262948-notice_file-서울특별시2017-431.txt | 20 | data/urban/text/ocr/files/14-11000NTC201804262948-14-11000NTC201804262948-notice_file-서울특별시2017-431.txt | OCR 텍스트를 원문 이미지와 대조한 뒤 핵심 수치 장부에 반영한다. |
| short_text_review | 광진구청 고시공고 첨부 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | hwp | hwp5_body_stream_direct | 192 | data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |  |  | 짧은 서식/표지성 문서인지 확인하고 필요한 본문 첨부를 추가로 찾는다. |
| short_text_review | 광진구청 고시공고 첨부 | 27 | 광장극동아파트 재건축사업 (신속통합기획) | hwpx | hwpx_zip_xml_direct | 195 | data/urban/text/gwangjin-gu/files/27-B0000378-15811-2-27-B0000378-15811-gwangjin-gu-2-2-재공람의견서_광장극동아파트-재건축사업.txt |  |  | 짧은 서식/표지성 문서인지 확인하고 필요한 본문 첨부를 추가로 찾는다. |
| short_text_review | 광진구청 고시공고 첨부 | 29 | 자양1의4구역 가로주택정비사업 | hwpx | hwpx_zip_xml_direct | 187 | data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt |  |  | 짧은 서식/표지성 문서인지 확인하고 필요한 본문 첨부를 추가로 찾는다. |

## 전체 HWP/HWPX 파일

| 출처 | 후보 | 사업장 | 형식 | 변환 경로 | 검토 상태 | 글자 수 | 원문 | 텍스트 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 서울도시공간포털 고시 원문 | 3 | 잠실우성아파트 재건축정비사업조합 | hwp | hwp5_body_stream_direct | native_text_ready | 6025 | data/urban/files/03-11000NTC201512177681-notice_file-서울특별시2015-401.HWP | data/urban/text/files/03-11000NTC201512177681-03-11000NTC201512177681-notice_file-서울특별시2015-401.txt |
| 서울도시공간포털 고시 원문 | 13 | 자양제7구역 주택재건축정비사업 조합 | hwp | hwp5_body_stream_direct | native_text_ready | 8122 | data/urban/files/13-11000NTC201808300002-notice_file-서울특별시2018-268.HWP | data/urban/text/files/13-11000NTC201808300002-13-11000NTC201808300002-notice_file-서울특별시2018-268.txt |
| 서울도시공간포털 고시 원문 | 14 | 개포주공6,7단지아파트 재건축정비사업조합 | hwp | hwp_bindata_image_ocr | ocr_image_review | 16152 | data/urban/files/14-11000NTC201804262948-notice_file-서울특별시2017-431.HWP | data/urban/text/files/14-11000NTC201804262948-14-11000NTC201804262948-notice_file-서울특별시2017-431.txt |
| 서울도시공간포털 고시 원문 | 22 | 중곡아파트 주택재건축정비사업조합 | hwp | hwp5_body_stream_direct | native_text_ready | 5035 | data/urban/files/22-11000NTC201411137333-notice_file-서울특별시2014-382.HWP | data/urban/text/files/22-11000NTC201411137333-22-11000NTC201411137333-notice_file-서울특별시2014-382.txt |
| 광진구청 고시공고 첨부 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | hwpx | hwpx_zip_xml_direct | native_text_ready | 965 | data/urban/files/24-B0000378-16096-gwangjin-gu-1-공고문.hwpx | data/urban/text/gwangjin-gu/files/24-B0000378-16096-1-24-B0000378-16096-gwangjin-gu-1-공고문.txt |
| 광진구청 고시공고 첨부 | 24 | 워커힐아파트1단지 재건축정비사업 조합설립추진위원회 | hwp | hwp5_body_stream_direct | short_text_review | 192 | data/urban/files/24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.hwp | data/urban/text/gwangjin-gu/files/24-B0000378-16096-2-24-B0000378-16096-gwangjin-gu-2-공람의견서-서식.txt |
| 광진구청 고시공고 첨부 | 27 | 광장극동아파트 재건축사업 (신속통합기획) | hwpx | hwpx_zip_xml_direct | native_text_ready | 3268 | data/urban/files/27-B0000378-15155-gwangjin-gu-1-조합설립계획-공고문_광장극동.hwpx | data/urban/text/gwangjin-gu/files/27-B0000378-15155-1-27-B0000378-15155-gwangjin-gu-1-조합설립계획-공고문_광장극동.txt |
| 광진구청 고시공고 첨부 | 27 | 광장극동아파트 재건축사업 (신속통합기획) | hwpx | hwpx_zip_xml_direct | short_text_review | 195 | data/urban/files/27-B0000378-15811-gwangjin-gu-2-2-재공람의견서_광장극동아파트-재건축사업.hwpx | data/urban/text/gwangjin-gu/files/27-B0000378-15811-2-27-B0000378-15811-gwangjin-gu-2-2-재공람의견서_광장극동아파트-재건축사업.txt |
| 광진구청 고시공고 첨부 | 29 | 자양1의4구역 가로주택정비사업 | hwpx | hwpx_zip_xml_direct | short_text_review | 187 | data/urban/files/29-B0000003-6353195-gwangjin-gu-2-공람의견서.hwpx | data/urban/text/gwangjin-gu/files/29-B0000003-6353195-2-29-B0000003-6353195-gwangjin-gu-2-공람의견서.txt |

## 해석

1. `hwp5_body_stream_direct`는 `scripts/extract_hwp5_text.py`가 HWP5 OLE/CFB 컨테이너의 `BodyText/Section*` 스트림을 직접 읽은 결과다.
2. `hwp_bindata_image_ocr`는 본문 스트림이 비어 있거나 저신뢰인 이미지형 HWP에서 `BinData` 이미지를 추출해 OCR한 결과다.
3. `hwpx_zip_xml_direct`는 HWPX zip 내부 XML 문단을 직접 읽은 결과다.
4. `scripts/convert_hwp_document.py`는 HWP5 본문 직접 추출, HWPX XML 직접 추출, 이미지형 HWP BinData 진단/추출을 단건으로 실행하는 로컬 변환 CLI다.
5. 이 감사표에서 변환 차단 항목이 0이면, 현재 원문 세트는 `soffice` 없이도 리서치용 텍스트 추출 단계가 통과된 상태로 본다.
