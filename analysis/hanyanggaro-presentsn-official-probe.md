# 한양연립 presentSn 공식 프로브

작성 기준: 2026-06-24 KST

목적은 `한양연립 일대 가로주택정비사업`의 서울도시공간포털 사업구역 레이어 식별자 `presentSn=11000UQ120PS202505310169`가 `recordCode` 또는 직접 고시 원문으로 닫히는지 확인하는 것이다.

## 확인 결과

| 항목 | 확인값 | 해석 |
| --- | --- | --- |
| 팝업 URL | `https://urban.seoul.go.kr/view/map/mapPopup.html?presentSn=11000UQ120PS202505310169` | 사업구역 레이어 식별자는 열린다 |
| 서버 렌더링 `paramMap` | `{"presentSn":"11000UQ120PS202505310169"}` | `presentSn`는 서버에 전달된다 |
| hidden `layerCode` | `UQ181` | 정비사업 레이어는 맞다 |
| hidden `recordCode` | 빈 값 | 팝업 렌더링 시점에 결정고시 `recordCode`는 채워지지 않는다 |
| hidden `search` | `C` | 일반 `C` 검색 흐름으로 렌더링된다 |
| `mapPopup.js` 동작 | `recordCode`를 읽어 `moveMap({ title: layerCode, wtnnsn: recordCode, search })` 호출 | 클라이언트도 빈 `recordCode`를 그대로 넘긴다 |
| `mapPilji.js` API 파라미터 | `getList.json`에 `recordCode`, `recordCodeH`, `presentSn`, `restrictN`, `dgmNmYd` 전송 | 이론상 `presentSn` 보조 조회는 가능하다 |
| 실시간 `getList.json` 응답 | `fcmtrWtnnc=[]`, `dstplanWtnnc=[]`, `ubplfcWtnnc=[]`, `bsnsList=[]`, `garo=null`, `block=null` | `presentSn`만으로는 정비사업 원문 식별값이나 고시 연결이 반환되지 않았다 |

## 결론

1. `presentSn` 팝업은 `recordCode`를 서버에서 채워주지 않았다.
2. 프런트 JS도 빈 `recordCode`를 그대로 사용하므로, 팝업 경로만으로는 결정고시 원문을 닫을 수 없다.
3. `presentSn`만 넣은 `api/map/pilji/getList.json` 실시간 호출도 빈 배열을 반환했다.
4. 따라서 `presentSn=11000UQ120PS202505310169`는 현재 사업구역 레이어를 가리키는 보조 식별자로는 쓸 수 있지만, `recordCode`의 대체값으로 승격하면 안 된다.

## 실무 처리

- `recordCode` 확보 경로는 계속 `서울도시공간포털 direct recordCode`, `광진구 고시공고 직접 원문`, `정보몽땅/자치구 회신`으로 분리한다.
- 한양연립의 현재 병목은 단순 `recordCode` 미확보가 아니라, `사업시행인가 직접 원문`과 `착공 공개 신호`를 어떤 기준으로 단계 판정에 반영할지다.
- 다음 액션은 `presentSn` 재시도보다 `광진구 공사개요·예정공정표·안전점검 결과`와 `정보몽땅 착공 신고 필` 공개 신호를 함께 읽어 단계 메모를 고정하는 쪽이 우선이다.
