#!/usr/bin/env python3

import csv
import json
from collections import Counter
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = "/Users/yongjip/Projects/potential-octo-waffle"
OUT_MD = Path("analysis/life-area-market-reaction-brief.md")
OUT_CSV = Path("analysis/life-area-market-reaction-brief.csv")
OUT_JSON = Path("analysis/life-area-market-reaction-brief.json")

INPUTS = {
    "market_summary": "analysis/market-transaction-signal-summary.json",
    "focus_comparison": "analysis/focus-area-comparison-brief.json",
    "life_area_extended": "analysis/life-area-extended-comparison-board.json",
    "expansion_brief": "analysis/expansion-interest-zone-brief.json",
    "project_market_areas": "data/market/project-market-areas.json",
    "normalized_transactions": "data/market/transactions/manual-official-transactions-normalized.csv",
    "expansion_normalized_summary": "analysis/expansion-market-normalized-summary.json",
    "expansion_signal_summary": "analysis/expansion-market-signal-summary.json",
}

EXPANSION_ZONE_MARKET_SCOPE = [
    {
        "zone_name": "강동권",
        "core_reference": "잠실/송파",
        "candidate_dongs": ["천호동", "성내동", "길동"],
        "market_reason": "잠실 동측 연장축 direct hit 여부를 보려면 천호·성내·길동 거래 비교군이 필요하다.",
        "next_market_step": "analysis/expansion-market-scope-workbook.md와 data/market/expansion-market-areas.json 기준으로 천호동·성내동·길동 baseline 수집 범위를 먼저 닫고, 이후 core market chain 편입 여부를 판단",
    },
    {
        "zone_name": "약수동 주변",
        "core_reference": "별도 도심근접형 대조군",
        "candidate_dongs": ["신당동", "금호동", "옥수동"],
        "market_reason": "약수역 생활권은 신당·금호·옥수의 경사형 도심-강남 중간축 비교군이 필요하다.",
        "next_market_step": "analysis/expansion-market-scope-workbook.md와 data/market/expansion-market-areas.json 기준으로 신당동·금호동·옥수동 baseline 수집 범위를 먼저 닫고, 이후 core market chain 편입 여부를 판단",
    },
]


def kst_date():
    return datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


UPDATED_AT = f"{kst_date()} KST"


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def read_csv(path):
    with Path(path).open(encoding="utf-8") as fp:
        return list(csv.DictReader(fp))


def write_csv(path, rows):
    if not rows:
        Path(path).write_text("", encoding="utf-8")
        return
    fields = list(rows[0].keys())
    with Path(path).open("w", encoding="utf-8", newline="") as fp:
        writer = csv.DictWriter(fp, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def md_table(rows, fields):
    if not rows:
        return "_없음_"
    lines = [
        "| " + " | ".join(label for _, label in fields) + " |",
        "| " + " | ".join("---" for _ in fields) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(str(row.get(key, "")).replace("|", "/") for key, _ in fields) + " |")
    return "\n".join(lines)


def file_link(rel_path):
    return f"[{rel_path}]({ROOT}/{rel_path})"


def count_text(values):
    if not values:
        return ""
    return "; ".join(str(value) for value in values if str(value).strip())


def main():
    market_summary = read_json(INPUTS["market_summary"])
    focus_comparison = read_json(INPUTS["focus_comparison"])
    life_area_extended = read_json(INPUTS["life_area_extended"])
    expansion_brief = read_json(INPUTS["expansion_brief"])
    project_market_areas = read_json(INPUTS["project_market_areas"])
    normalized_transactions = read_csv(INPUTS["normalized_transactions"])
    expansion_normalized_summary = read_json(INPUTS["expansion_normalized_summary"])
    expansion_signal_summary = read_json(INPUTS["expansion_signal_summary"])

    focus_rows = {row["focus_area"]: row for row in market_summary.get("focusRows", [])}
    comparison_rows = {row["focus_area"]: row for row in focus_comparison.get("rows", [])}
    extended_rows = {row["area_name"]: row for row in life_area_extended.get("rows", [])}
    expansion_rows = {row["zone_name"]: row for row in expansion_brief.get("rows", [])}
    expansion_market_rows = {row["dong"]: row for row in expansion_normalized_summary.get("rows", [])}
    expansion_signal_rows = {row["zone_name"]: row for row in expansion_signal_summary.get("zone_rows", [])}

    covered_market_dongs = {row.get("dong", "") for row in project_market_areas if row.get("dong")}
    tx_dong_counts = Counter(row.get("legal_dong", "") for row in normalized_transactions if row.get("legal_dong"))

    core_rows = []
    for focus_area in ["강남", "잠실/송파", "구의/광진"]:
        market_row = focus_rows.get(focus_area, {})
        comparison_row = comparison_rows.get(focus_area, {})
        extended_row = extended_rows.get(focus_area, {})
        core_rows.append({
            "row_type": "core_life_area",
            "name": focus_area,
            "market_scope_status": "covered",
            "unique_transactions": market_row.get("unique_transactions", 0),
            "trade_transactions": market_row.get("trade_transactions", 0),
            "rent_transactions": market_row.get("rent_transactions", 0),
            "median_trade_price_per_sqm_manwon": market_row.get("median_trade_price_per_sqm_manwon", ""),
            "latest_deal_ymd": market_row.get("latest_deal_ymd", ""),
            "current_stance": extended_row.get("current_stance", ""),
            "reading_rule": comparison_row.get("first_principle", ""),
        })

    expansion_zone_rows = []
    for zone in EXPANSION_ZONE_MARKET_SCOPE:
        zone_name = zone["zone_name"]
        candidate_dongs = zone["candidate_dongs"]
        covered_dongs = [dong for dong in candidate_dongs if (expansion_market_rows.get(dong, {}) or {}).get("normalized_transaction_rows", 0)]
        tx_rows_present = sum(int((expansion_market_rows.get(dong, {}) or {}).get("normalized_transaction_rows", 0)) for dong in candidate_dongs)
        coverage_status = "covered" if len(covered_dongs) == len(candidate_dongs) else "partial" if covered_dongs else "uncovered"
        extended_row = extended_rows.get(zone_name, {})
        brief_row = expansion_rows.get(zone_name, {})
        remaining_dongs = [dong for dong in candidate_dongs if dong not in covered_dongs]
        if coverage_status == "covered":
            next_market_step = "latest-window baseline이 모두 들어왔다. backfill과 해석 규칙 분리를 유지하면서 stage recheck와 함께 읽는다."
        elif coverage_status == "partial":
            next_market_step = f"{', '.join(covered_dongs)} latest-window는 정규화 완료, 남은 {', '.join(remaining_dongs)} latest-window 수집과 backfill을 분리해서 닫는다."
        else:
            next_market_step = zone["next_market_step"]
        expansion_zone_rows.append({
            "row_type": "expansion_zone",
            "name": zone_name,
            "core_reference": zone["core_reference"],
            "market_scope_status": coverage_status,
            "candidate_dongs": ", ".join(candidate_dongs),
            "covered_manifest_dongs": ", ".join(covered_dongs) if covered_dongs else "없음",
            "tx_rows_present": tx_rows_present,
            "current_state": extended_row.get("current_stance", brief_row.get("current_system_status", "")),
            "activation_gap": brief_row.get("activation_gap", ""),
            "market_reason": zone["market_reason"],
            "next_market_step": next_market_step,
            "unique_transactions": (expansion_signal_rows.get(zone_name, {}) or {}).get("unique_transactions", 0),
            "trade_transactions": (expansion_signal_rows.get(zone_name, {}) or {}).get("trade_transactions", 0),
            "rent_transactions": (expansion_signal_rows.get(zone_name, {}) or {}).get("rent_transactions", 0),
            "median_trade_price_per_sqm_manwon": (expansion_signal_rows.get(zone_name, {}) or {}).get("median_trade_price_per_sqm_manwon", ""),
            "median_rent_deposit_manwon": (expansion_signal_rows.get(zone_name, {}) or {}).get("median_rent_deposit_manwon", ""),
            "median_monthly_rent_manwon": (expansion_signal_rows.get(zone_name, {}) or {}).get("median_monthly_rent_manwon", ""),
            "latest_deal_ymd": (expansion_signal_rows.get(zone_name, {}) or {}).get("latest_deal_ymd", ""),
            "market_signal_read": (
                f"중복제거 {(expansion_signal_rows.get(zone_name, {}) or {}).get('unique_transactions', 0)} / "
                f"중위 매매 ㎡당 {(expansion_signal_rows.get(zone_name, {}) or {}).get('median_trade_price_per_sqm_manwon', '')}만원 / "
                f"중위 보증금 {(expansion_signal_rows.get(zone_name, {}) or {}).get('median_rent_deposit_manwon', '')}만원 / "
                f"최신 {(expansion_signal_rows.get(zone_name, {}) or {}).get('latest_deal_ymd', '')}"
            ),
        })

    rows = core_rows + expansion_zone_rows

    summary = {
        "generated_at": UPDATED_AT,
        "core_life_area_count": len(core_rows),
        "core_market_covered_count": sum(1 for row in core_rows if row["market_scope_status"] == "covered"),
        "expansion_zone_count": len(expansion_zone_rows),
        "expansion_market_covered_count": sum(1 for row in expansion_zone_rows if row["market_scope_status"] == "covered"),
        "expansion_market_partial_count": sum(1 for row in expansion_zone_rows if row["market_scope_status"] == "partial"),
        "expansion_market_uncovered_count": sum(1 for row in expansion_zone_rows if row["market_scope_status"] == "uncovered"),
        "expansion_candidate_dong_count": sum(len(zone["candidate_dongs"]) for zone in EXPANSION_ZONE_MARKET_SCOPE),
        "market_manifest_dong_count": len(covered_market_dongs),
        "normalized_transaction_rows": market_summary.get("summary", {}).get("normalized_transactions", 0),
        "latest_deal_ymd": market_summary.get("summary", {}).get("latest_deal_ymd", ""),
        "expansion_signal_unique_transactions": expansion_signal_summary.get("summary", {}).get("unique_transactions", 0),
        "expansion_signal_latest_deal_ymd": expansion_signal_summary.get("summary", {}).get("latest_deal_ymd", ""),
        "inputs": list(INPUTS.values()),
        "outputs": [str(OUT_MD), str(OUT_CSV), str(OUT_JSON)],
    }
    if summary["expansion_market_uncovered_count"] == 0 and summary["expansion_market_partial_count"] == 0:
        expansion_intro = "확장 관심권도 이제 `analysis/expansion-market-normalized-summary.md` 기준으로 latest-window baseline 거래가 모두 들어온 상태다. 다만 이 값은 아직 latest-window 중심 baseline이며, backfill과 단계 재확인을 분리해서 읽어야 한다."
        expansion_caution = f"현재 확장권 정규화 거래는 {count_text([row['covered_manifest_dongs'] for row in expansion_zone_rows if row['covered_manifest_dongs'] != '없음'])}까지 모두 들어 있다. 다만 latest-window 중심 baseline이라 장기 추세와 project-level 가격 해석을 바로 확정하면 과대해석이 된다."
    elif summary["expansion_market_partial_count"] > 0:
        expansion_intro = "확장 관심권은 이제 `analysis/expansion-market-normalized-summary.md` 기준으로 강동권 일부와 약수권 공백을 구분해서 읽을 수 있다. 현재는 일부 dong latest-window만 정규화됐으므로 확장권 시장 비교는 부분 커버 상태로만 취급해야 한다."
        expansion_caution = f"현재 확장권 정규화 거래는 {count_text([row['covered_manifest_dongs'] for row in expansion_zone_rows if row['covered_manifest_dongs'] != '없음'])}까지만 들어 있다. 남은 법정동 공백을 무시하면 공식 원문보다 약한 근거를 과대해석하게 된다."
    else:
        expansion_intro = "확장 관심권은 아직 core chain 밖이다. 공식 원문·교통입지·리스크·단계 재확인을 먼저 닫고, 시장 데이터는 범위가 들어온 뒤에만 보조 신호로 읽는다."
        expansion_caution = f"현재 확장권 정규화 거래 파일에는 {count_text([row['candidate_dongs'] for row in expansion_zone_rows])}이 들어 있지 않다. 따라서 `0행` 상태에서 가격·거래량 비교를 시작하면 공식 원문보다 약한 근거를 과대해석하게 된다."

    csv_rows = []
    for row in core_rows:
        csv_rows.append({
            "section": "core_life_area",
            "name": row["name"],
            "market_scope_status": row["market_scope_status"],
            "unique_transactions": row["unique_transactions"],
            "trade_transactions": row["trade_transactions"],
            "rent_transactions": row["rent_transactions"],
            "median_trade_price_per_sqm_manwon": row["median_trade_price_per_sqm_manwon"],
            "latest_deal_ymd": row["latest_deal_ymd"],
            "note": row["reading_rule"],
        })
    for row in expansion_zone_rows:
        csv_rows.append({
            "section": "expansion_zone",
            "name": row["name"],
            "market_scope_status": row["market_scope_status"],
            "unique_transactions": row["tx_rows_present"],
            "trade_transactions": "",
            "rent_transactions": "",
            "median_trade_price_per_sqm_manwon": row["median_trade_price_per_sqm_manwon"],
            "latest_deal_ymd": row["latest_deal_ymd"],
            "note": row["market_signal_read"],
        })

    OUT_JSON.write_text(
        json.dumps(
            {
                "generated_at": UPDATED_AT,
                "summary": summary,
                "core_rows": core_rows,
                "expansion_zone_rows": expansion_zone_rows,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    write_csv(OUT_CSV, csv_rows)
    OUT_MD.write_text(
        f"""# 생활권 시장 반응 브리프

작성 기준: {UPDATED_AT}

이 문서는 핵심 3생활권과 확장 2권역을 시장 데이터 기준으로 어디까지 같은 판에서 읽을 수 있는지 정리한 generated 브리프다. 공식 원문이 직접 근거이고, 시장 데이터는 그 위에 얹는 보조신호라는 원칙을 유지한다.

## 한눈 요약

| 항목 | 값 |
| --- | ---: |
| 핵심 생활권 시장 커버 | {summary["core_market_covered_count"]} / {summary["core_life_area_count"]} |
| 확장 관심권 시장 커버 | {summary["expansion_market_covered_count"]} / {summary["expansion_zone_count"]} |
| 확장 관심권 부분 커버 | {summary["expansion_market_partial_count"]} |
| 확장 관심권 시장 공백 | {summary["expansion_market_uncovered_count"]} |
| 확장 관심권 후보 법정동 | {summary["expansion_candidate_dong_count"]} |
| 현재 시장 manifest 법정동 | {summary["market_manifest_dong_count"]} |
| 정규화 거래/전월세 행 | {summary["normalized_transaction_rows"]} |
| 최신 계약일 | {summary["latest_deal_ymd"]} |
| 확장권 중복제거 거래 행 | {summary["expansion_signal_unique_transactions"]} |
| 확장권 최신 계약일 | {summary["expansion_signal_latest_deal_ymd"]} |

핵심 3생활권은 이미 시장 보조신호를 붙여 읽을 수 있다. {expansion_intro}

## 핵심 생활권 시장 읽기

{md_table(core_rows, [
    ("name", "생활권"),
    ("unique_transactions", "중복제거 행"),
    ("trade_transactions", "매매"),
    ("rent_transactions", "전월세"),
    ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
    ("latest_deal_ymd", "최신 계약일"),
    ("current_stance", "현재 입장"),
])}

### 핵심 생활권 해석 원칙

- 강남: 가격 강도 자체보다 비용·공공기여·이주 부담을 감내할 수 있는지 읽는 보조신호다.
- 잠실/송파: 거래층은 가장 두껍지만 잠실 핵심축과 송파 배후축을 분리해서 봐야 한다.
- 구의/광진: 생활권 거래층이 넓다는 사실은 후보 유지 근거가 될 수 있지만, 원문 병목을 덮지는 못한다.

## 확장 관심권 시장 baseline 상태

{md_table(expansion_zone_rows, [
    ("name", "확장권"),
    ("market_scope_status", "시장 상태"),
    ("candidate_dongs", "필요 법정동"),
    ("covered_manifest_dongs", "현재 manifest"),
    ("tx_rows_present", "정규화 거래 행"),
    ("current_state", "현재 운영 상태"),
])}

## 확장 관심권 시장 시그널

{md_table(expansion_zone_rows, [
    ("name", "확장권"),
    ("unique_transactions", "중복제거 행"),
    ("trade_transactions", "매매"),
    ("rent_transactions", "전월세"),
    ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
    ("median_rent_deposit_manwon", "중위 보증금(만원)"),
    ("median_monthly_rent_manwon", "중위 월세(만원)"),
    ("latest_deal_ymd", "최신 계약일"),
    ("current_state", "현재 운영 상태"),
])}

### 왜 아직 core 비교점수에 바로 섞으면 안 되는가

- 강동권: {expansion_zone_rows[0]["market_reason"]}
- 약수동 주변: {expansion_zone_rows[1]["market_reason"]}
- {expansion_caution}

## 확장 관심권 다음 수집 단계

{md_table(expansion_zone_rows, [
    ("name", "확장권"),
    ("activation_gap", "현재 공백"),
    ("next_market_step", "다음 시장 작업"),
])}

## 지금 읽는 순서

1. 핵심 생활권 시장 신호는 {file_link("analysis/market-transaction-signal-summary.md")}에서 확인한다.
2. 핵심/확장 통합 비교 문장은 {file_link("analysis/life-area-extended-comparison-board.md")}를 기준으로 유지한다.
3. 강동권·약수권은 {file_link("analysis/expansion-zone-weekly-monitoring-cockpit.md")}와 {file_link("analysis/expansion-zone-latest-check-guide.md")}를 먼저 본다.
4. 확장권 법정동을 시장 scope에 붙일 때는 `analysis/expansion-market-scope-workbook.md`와 `data/market/expansion-market-areas.json`를 먼저 갱신하고, 그다음 core chain 병합 여부를 판단한다.

## 해석 경계

1. 시장 데이터는 공식 원문이 아니다. 단계, 고시번호, 고시일, 공사비, 분담금, 기준일을 대체하지 못한다.
2. 확장권 시장 baseline 커버는 `핵심 생활권과 동일 조건`이라는 뜻이 아니다. latest-window 중심 baseline과 공식 단계 재확인을 분리해서 읽어야 한다.
3. 강동권은 latest stage gap이 남아 있으므로, 시장 숫자가 들어와도 단계 재확인보다 앞설 수 없다.
4. 약수권은 adjacent baseline 운영 상태라서, direct hit 후보가 생기기 전까지는 시장 데이터가 들어와도 보조 축으로만 읽는다.
""",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "coreCovered": summary["core_market_covered_count"],
                "expansionCovered": summary["expansion_market_covered_count"],
                "expansionUncovered": summary["expansion_market_uncovered_count"],
                "output": "analysis/life-area-market-reaction-brief.{md,csv,json}",
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
