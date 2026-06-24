#!/usr/bin/env python3

import csv
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

INPUTS = {
    "snapshot": "analysis/current-research-snapshot.json",
    "extended_board": "analysis/life-area-extended-comparison-board.json",
    "core_market_summary": "analysis/market-transaction-signal-summary.json",
    "expansion_signal_summary": "analysis/expansion-market-signal-summary.json",
}

OUT_MD = Path("analysis/life-area-market-baseline-board.md")
OUT_CSV = Path("analysis/life-area-market-baseline-board.csv")
OUT_JSON = Path("analysis/life-area-market-baseline-board.json")


def kst_date():
    return datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


UPDATED_AT = f"{kst_date()} KST"


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_csv(path, rows):
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fields = list(rows[0].keys())
    with path.open("w", encoding="utf-8", newline="") as fp:
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


def find_by(rows, key, value):
    for row in rows:
        if str(row.get(key, "")).strip() == str(value).strip():
            return row
    return {}


def parse_float(value):
    text = str(value or "").replace(",", "").strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def build_core_rows(snapshot, extended_rows, market_rows):
    rows = []
    for item in snapshot.get("life_areas", []):
        name = item["name"]
        extended = find_by(extended_rows, "area_name", name)
        market = find_by(market_rows, "focus_area", name)
        rows.append({
            "area_name": name,
            "area_role": "핵심 생활권",
            "market_evidence_tier": "core_full_chain",
            "market_scope_window": "2024-01~2026-06 full chain",
            "current_stance": item.get("current_stance", ""),
            "official_evidence_status": item.get("official_evidence_status", ""),
            "stage_read": extended.get("stage_read", ""),
            "transit_read": extended.get("transit_read", item.get("fieldwork_route", "")),
            "unique_transactions": market.get("unique_transactions", 0),
            "trade_transactions": market.get("trade_transactions", 0),
            "rent_transactions": market.get("rent_transactions", 0),
            "median_trade_price_per_sqm_manwon": market.get("median_trade_price_per_sqm_manwon", ""),
            "median_rent_deposit_manwon": market.get("median_rent_deposit_manwon", ""),
            "median_monthly_rent_manwon": "",
            "latest_deal_ymd": market.get("latest_deal_ymd", ""),
            "compare_read": item.get("one_line_conclusion", ""),
            "reading_rule": "핵심 생활권 시장신호는 full-chain 보조축이다. 공식 원문과 현장 메모를 이미 같이 붙여 읽는다.",
            "sort_group": 0,
            "sort_value": parse_float(market.get("unique_transactions")) or 0.0,
        })
    return rows


def build_expansion_rows(snapshot, extended_rows, signal_rows):
    rows = []
    for item in snapshot.get("expansion_zones", []):
        name = item["name"]
        extended = find_by(extended_rows, "area_name", name)
        signal = find_by(signal_rows, "zone_name", name)
        rows.append({
            "area_name": name,
            "area_role": "확장 관심권",
            "market_evidence_tier": "latest_window_baseline",
            "market_scope_window": signal.get("month_span", "2025-11~2026-06 latest-window"),
            "current_stance": item.get("current_stance", ""),
            "official_evidence_status": item.get("official_evidence_status", ""),
            "stage_read": extended.get("stage_read", ""),
            "transit_read": extended.get("transit_read", item.get("fieldwork_route", "")),
            "unique_transactions": signal.get("unique_transactions", 0),
            "trade_transactions": signal.get("trade_transactions", 0),
            "rent_transactions": signal.get("rent_transactions", 0),
            "median_trade_price_per_sqm_manwon": signal.get("median_trade_price_per_sqm_manwon", ""),
            "median_rent_deposit_manwon": signal.get("median_rent_deposit_manwon", ""),
            "median_monthly_rent_manwon": signal.get("median_monthly_rent_manwon", ""),
            "latest_deal_ymd": signal.get("latest_deal_ymd", ""),
            "compare_read": item.get("one_line_conclusion", ""),
            "reading_rule": "확장권 시장신호는 latest-window baseline이다. core와 같은 확신도로 점수화하지 않고 단계 재확인과 분리한다.",
            "sort_group": 1,
            "sort_value": parse_float(signal.get("unique_transactions")) or 0.0,
        })
    return rows


def top_row(rows, field):
    filtered = [row for row in rows if parse_float(row.get(field)) is not None]
    if not filtered:
        return {}
    return max(filtered, key=lambda row: parse_float(row.get(field)) or 0.0)


def summary_from_rows(rows):
    top_volume = top_row(rows, "unique_transactions")
    top_ppsm = top_row(rows, "median_trade_price_per_sqm_manwon")
    top_deposit = top_row(rows, "median_rent_deposit_manwon")
    latest_date = max((str(row.get("latest_deal_ymd", "")) for row in rows), default="")
    return {
        "generated_at": UPDATED_AT,
        "row_count": len(rows),
        "core_count": sum(1 for row in rows if row["area_role"] == "핵심 생활권"),
        "expansion_count": sum(1 for row in rows if row["area_role"] == "확장 관심권"),
        "top_volume_area": top_volume.get("area_name", ""),
        "top_volume_transactions": top_volume.get("unique_transactions", ""),
        "top_ppsm_area": top_ppsm.get("area_name", ""),
        "top_ppsm_value": top_ppsm.get("median_trade_price_per_sqm_manwon", ""),
        "top_deposit_area": top_deposit.get("area_name", ""),
        "top_deposit_value": top_deposit.get("median_rent_deposit_manwon", ""),
        "latest_deal_ymd": latest_date,
        "inputs": list(INPUTS.values()),
        "outputs": [str(OUT_MD), str(OUT_CSV), str(OUT_JSON)],
    }


def main():
    snapshot = read_json(INPUTS["snapshot"])
    extended_board = read_json(INPUTS["extended_board"])
    core_market_summary = read_json(INPUTS["core_market_summary"])
    expansion_signal_summary = read_json(INPUTS["expansion_signal_summary"])

    extended_rows = extended_board.get("rows", [])
    core_market_rows = core_market_summary.get("focusRows", [])
    expansion_signal_rows = expansion_signal_summary.get("zone_rows", [])

    rows = build_core_rows(snapshot, extended_rows, core_market_rows) + build_expansion_rows(snapshot, extended_rows, expansion_signal_rows)
    rows.sort(key=lambda row: (row["sort_group"], -(parse_float(row.get("unique_transactions")) or 0.0), row["area_name"]))

    summary = summary_from_rows(rows)

    json_rows = [{key: value for key, value in row.items() if key not in {"sort_group", "sort_value"}} for row in rows]
    csv_rows = json_rows

    OUT_JSON.write_text(
        json.dumps({"summary": summary, "rows": json_rows}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_csv(OUT_CSV, csv_rows)
    OUT_MD.write_text(
        f"""# 생활권 시장 기준 비교 보드

작성 기준: {UPDATED_AT}

이 문서는 핵심 3생활권과 확장 2권역을 시장 데이터 축으로만 다시 세워 읽는 generated 보드다. 핵심 생활권은 `2024-01~2026-06 full chain`, 확장권은 `2025-11~2026-06 latest-window baseline`이라는 근거 차이를 그대로 드러낸다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 전체 행 | {summary["row_count"]} |
| 핵심 생활권 | {summary["core_count"]} |
| 확장 관심권 | {summary["expansion_count"]} |
| 거래층 최상위 | {summary["top_volume_area"]} / {summary["top_volume_transactions"]} |
| 중위 매매 ㎡당 최상위 | {summary["top_ppsm_area"]} / {summary["top_ppsm_value"]}만원 |
| 중위 보증금 최상위 | {summary["top_deposit_area"]} / {summary["top_deposit_value"]}만원 |
| 최신 계약일 | {summary["latest_deal_ymd"]} |

## 시장 기준 비교

{md_table(json_rows, [
    ("area_role", "구분"),
    ("area_name", "권역"),
    ("market_evidence_tier", "시장 근거 급"),
    ("market_scope_window", "범위"),
    ("unique_transactions", "중복제거 행"),
    ("trade_transactions", "매매"),
    ("rent_transactions", "전월세"),
    ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
    ("median_rent_deposit_manwon", "중위 보증금(만원)"),
    ("median_monthly_rent_manwon", "중위 월세(만원)"),
    ("latest_deal_ymd", "최신 계약일"),
    ("official_evidence_status", "공식근거"),
    ("current_stance", "현재 입장"),
])}

## 읽는 규칙

{md_table(json_rows, [
    ("area_name", "권역"),
    ("stage_read", "진행단계 읽기"),
    ("transit_read", "교통입지 읽기"),
    ("compare_read", "시장 비교 한 줄"),
    ("reading_rule", "시장 해석 규칙"),
])}

## 해석 경계

1. 강남·잠실/송파·구의/광진은 full-chain 보조신호라서 공식 원문·현장 루트와 같이 읽는다.
2. 강동권·약수동 주변은 latest-window baseline이므로, core와 같은 점수 체계로 곧바로 합치지 않는다.
3. 강동권은 단계 재확인 공백이 남아 있어 시장 거래층이 두꺼워도 인허가 최신성보다 앞설 수 없다.
4. 약수동 주변은 direct hit가 아니라 adjacent/edge baseline이 섞여 있으므로 장기 대안축 reference로만 읽는다.
""",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "rows": len(json_rows),
                "top_volume_area": summary["top_volume_area"],
                "output": "analysis/life-area-market-baseline-board.{md,csv,json}",
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
