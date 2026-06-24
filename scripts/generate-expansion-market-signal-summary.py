#!/usr/bin/env python3

import csv
import json
from collections import Counter
from datetime import datetime
from pathlib import Path
from statistics import median
from zoneinfo import ZoneInfo

INPUT_SCOPE = Path("data/market/expansion-market-areas.json")
INPUT_TX = Path("data/market/transactions/expansion-manual-official-transactions-normalized.json")

OUT_MD = Path("analysis/expansion-market-signal-summary.md")
OUT_CSV = Path("analysis/expansion-market-signal-summary.csv")
OUT_JSON = Path("analysis/expansion-market-signal-summary.json")


def kst_date():
    return datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


UPDATED_AT = f"{kst_date()} KST"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


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


def to_number(value):
    text = str(value or "").replace(",", "").strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def fmt_number(value, digits=0):
    if value is None:
        return ""
    if digits == 0:
        return str(int(round(value)))
    return f"{value:.{digits}f}"


def unique(values):
    return list(dict.fromkeys(value for value in values if value))


def count_text(counter):
    return "; ".join(f"{key} {count}" for key, count in counter.most_common())


def tx_key(row):
    return "|".join(
        [
            row.get("lawd_cd", ""),
            row.get("deal_ymd", ""),
            row.get("legal_dong", ""),
            row.get("asset_name", ""),
            row.get("deal_amount", ""),
            row.get("deposit_amount", ""),
            row.get("monthly_rent", ""),
            row.get("area_sqm", ""),
            row.get("floor", ""),
        ]
    )


def dedupe(rows):
    seen = set()
    out = []
    for row in rows:
        key = tx_key(row)
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def matches_dong(tx_dong, scope_dong):
    dong = str(tx_dong or "").strip()
    scope = str(scope_dong or "").strip()
    if not dong or not scope:
        return False
    if dong == scope:
        return True
    if scope == "금호동" and dong in {"금호동1가", "금호동2가", "금호동3가", "금호동4가"}:
        return True
    return False


def summarize_transactions(rows):
    unique_rows = dedupe(rows)
    trade_rows = [row for row in unique_rows if (to_number(row.get("deal_amount")) or 0) > 0]
    rent_rows = [row for row in unique_rows if (to_number(row.get("deposit_amount")) or 0) > 0 or (to_number(row.get("monthly_rent")) or 0) > 0]
    deposit_rows = [row for row in rent_rows if (to_number(row.get("deposit_amount")) or 0) > 0]
    monthly_rows = [row for row in rent_rows if (to_number(row.get("monthly_rent")) or 0) > 0]

    trade_amounts = [to_number(row.get("deal_amount")) for row in trade_rows]
    trade_amounts = [value for value in trade_amounts if value is not None and value > 0]
    deposit_amounts = [to_number(row.get("deposit_amount")) for row in deposit_rows]
    deposit_amounts = [value for value in deposit_amounts if value is not None and value > 0]
    monthly_rents = [to_number(row.get("monthly_rent")) for row in monthly_rows]
    monthly_rents = [value for value in monthly_rents if value is not None and value > 0]

    price_per_sqm = []
    for row in trade_rows:
        amount = to_number(row.get("deal_amount"))
        area = to_number(row.get("area_sqm"))
        if amount is not None and area and area > 0:
            price_per_sqm.append(amount / area)

    months = sorted(unique(str(row.get("deal_ymd", ""))[:6] for row in unique_rows if row.get("deal_ymd")))
    years = Counter(str(row.get("deal_ymd", ""))[:4] for row in unique_rows if row.get("deal_ymd"))
    source_mix = Counter(str(row.get("source", "")).strip() for row in unique_rows if row.get("source"))
    asset_mix = Counter(str(row.get("asset_name", "")).strip() for row in unique_rows if row.get("asset_name"))
    latest = max((str(row.get("deal_ymd", "")) for row in unique_rows), default="")

    return {
        "unique_transactions": len(unique_rows),
        "trade_transactions": len(trade_rows),
        "rent_transactions": len(rent_rows),
        "tx_2025": years.get("2025", 0),
        "tx_2026_ytd": years.get("2026", 0),
        "latest_deal_ymd": latest,
        "month_span": f"{months[0]}~{months[-1]}" if months else "",
        "month_count": len(months),
        "median_trade_amount_manwon": fmt_number(median(trade_amounts) if trade_amounts else None),
        "median_trade_price_per_sqm_manwon": fmt_number(median(price_per_sqm) if price_per_sqm else None, 1),
        "median_rent_deposit_manwon": fmt_number(median(deposit_amounts) if deposit_amounts else None),
        "median_monthly_rent_manwon": fmt_number(median(monthly_rents) if monthly_rents else None),
        "source_mix": count_text(source_mix),
        "top_assets": "; ".join(f"{name} {count}" for name, count in asset_mix.most_common(3)),
    }


def main():
    scope_rows = read_json(INPUT_SCOPE)
    tx_rows = read_json(INPUT_TX)

    dong_rows = []
    zone_buckets = {}

    for scope in scope_rows:
        matched = [
            row
            for row in tx_rows
            if str(row.get("lawd_cd", "")) == str(scope.get("lawd_cd", ""))
            and matches_dong(row.get("legal_dong"), scope.get("dong"))
        ]
        summary = summarize_transactions(matched)
        dong_rows.append(
            {
                "row_type": "dong",
                "zone_name": scope.get("zone_name", ""),
                "district": scope.get("district", ""),
                "dong": scope.get("dong", ""),
                "market_role": scope.get("market_role", ""),
                "representative_projects": scope.get("representative_projects", ""),
                **summary,
                "reading_note": scope.get("data_quality_notes", ""),
            }
        )
        zone_name = scope.get("zone_name", "")
        bucket = zone_buckets.setdefault(zone_name, {"scope_rows": [], "tx_rows": []})
        bucket["scope_rows"].append(scope)
        bucket["tx_rows"].extend(matched)

    zone_rows = []
    for zone_name, bucket in zone_buckets.items():
        summary = summarize_transactions(bucket["tx_rows"])
        scopes = bucket["scope_rows"]
        zone_rows.append(
            {
                "row_type": "zone",
                "zone_name": zone_name,
                "districts": "; ".join(unique(scope.get("district", "") for scope in scopes)),
                "candidate_dongs": "; ".join(scope.get("dong", "") for scope in scopes),
                "market_roles": "; ".join(unique(scope.get("market_role", "") for scope in scopes)),
                "representative_projects": "; ".join(unique(scope.get("representative_projects", "") for scope in scopes)),
                **summary,
                "reading_note": "latest-window baseline은 모두 들어왔지만, 공식 단계 재확인과 backfill 해석은 분리한다.",
            }
        )

    zone_rows.sort(key=lambda row: row["zone_name"])
    dong_rows.sort(key=lambda row: (row["zone_name"], row["district"], row["dong"]))

    all_summary = summarize_transactions(tx_rows)
    summary = {
        "generated_at": UPDATED_AT,
        "scope_count": len(dong_rows),
        "zone_count": len(zone_rows),
        "normalized_transaction_rows": len(tx_rows),
        "unique_transactions": all_summary["unique_transactions"],
        "trade_transactions": all_summary["trade_transactions"],
        "rent_transactions": all_summary["rent_transactions"],
        "latest_deal_ymd": all_summary["latest_deal_ymd"],
        "month_span": all_summary["month_span"],
        "month_count": all_summary["month_count"],
        "coverage_note": "확장권 latest-window baseline은 2025-11부터 2026-06까지 8개월 범위다. core chain 편입 전에는 권역/법정동 비교용으로만 읽는다.",
        "inputs": [str(INPUT_SCOPE), str(INPUT_TX)],
        "outputs": [str(OUT_MD), str(OUT_CSV), str(OUT_JSON)],
    }

    csv_rows = []
    for row in zone_rows:
        csv_rows.append(
            {
                "section": "zone",
                "zone_name": row.get("zone_name", ""),
                "district_or_districts": row.get("districts", ""),
                "dong_or_candidate_dongs": row.get("candidate_dongs", ""),
                "market_role_or_roles": row.get("market_roles", ""),
                "unique_transactions": row.get("unique_transactions", ""),
                "trade_transactions": row.get("trade_transactions", ""),
                "rent_transactions": row.get("rent_transactions", ""),
                "tx_2025": row.get("tx_2025", ""),
                "tx_2026_ytd": row.get("tx_2026_ytd", ""),
                "median_trade_amount_manwon": row.get("median_trade_amount_manwon", ""),
                "median_trade_price_per_sqm_manwon": row.get("median_trade_price_per_sqm_manwon", ""),
                "median_rent_deposit_manwon": row.get("median_rent_deposit_manwon", ""),
                "median_monthly_rent_manwon": row.get("median_monthly_rent_manwon", ""),
                "latest_deal_ymd": row.get("latest_deal_ymd", ""),
                "representative_projects": row.get("representative_projects", ""),
                "reading_note": row.get("reading_note", ""),
            }
        )
    for row in dong_rows:
        csv_rows.append(
            {
                "section": "dong",
                "zone_name": row.get("zone_name", ""),
                "district_or_districts": row.get("district", ""),
                "dong_or_candidate_dongs": row.get("dong", ""),
                "market_role_or_roles": row.get("market_role", ""),
                "unique_transactions": row.get("unique_transactions", ""),
                "trade_transactions": row.get("trade_transactions", ""),
                "rent_transactions": row.get("rent_transactions", ""),
                "tx_2025": row.get("tx_2025", ""),
                "tx_2026_ytd": row.get("tx_2026_ytd", ""),
                "median_trade_amount_manwon": row.get("median_trade_amount_manwon", ""),
                "median_trade_price_per_sqm_manwon": row.get("median_trade_price_per_sqm_manwon", ""),
                "median_rent_deposit_manwon": row.get("median_rent_deposit_manwon", ""),
                "median_monthly_rent_manwon": row.get("median_monthly_rent_manwon", ""),
                "latest_deal_ymd": row.get("latest_deal_ymd", ""),
                "representative_projects": row.get("representative_projects", ""),
                "reading_note": row.get("reading_note", ""),
            }
        )

    OUT_JSON.write_text(
        json.dumps(
            {
                "generated_at": UPDATED_AT,
                "summary": summary,
                "zone_rows": zone_rows,
                "dong_rows": dong_rows,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    write_csv(OUT_CSV, csv_rows)
    OUT_MD.write_text(
        f"""# 확장권 시장 시그널 요약

작성 기준: {UPDATED_AT}

확장권 latest-window 정규화 거래를 강동권·약수동 주변 2권역과 6개 법정동 baseline으로 다시 요약한다. 이 문서는 단순 파일 존재 확인이 아니라, 실제로 어떤 거래층과 가격대가 들어왔는지 읽기 위한 시그널 보드다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 권역 | {summary["zone_count"]} |
| 법정동 scope | {summary["scope_count"]} |
| 정규화 거래 행 | {summary["normalized_transaction_rows"]} |
| 중복 제거 거래 행 | {summary["unique_transactions"]} |
| 매매 | {summary["trade_transactions"]} |
| 전월세 | {summary["rent_transactions"]} |
| 기간 | {summary["month_span"]} |
| 최신 계약일 | {summary["latest_deal_ymd"]} |

{summary["coverage_note"]}

## 권역별 시그널

{md_table(zone_rows, [
    ("zone_name", "권역"),
    ("candidate_dongs", "법정동"),
    ("unique_transactions", "중복제거 행"),
    ("trade_transactions", "매매"),
    ("rent_transactions", "전월세"),
    ("median_trade_amount_manwon", "중위 매매가(만원)"),
    ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
    ("median_rent_deposit_manwon", "중위 보증금(만원)"),
    ("median_monthly_rent_manwon", "중위 월세(만원)"),
    ("latest_deal_ymd", "최신 계약일"),
])}

## 법정동별 시그널

{md_table(dong_rows, [
    ("zone_name", "권역"),
    ("dong", "법정동"),
    ("market_role", "역할"),
    ("unique_transactions", "중복제거 행"),
    ("trade_transactions", "매매"),
    ("rent_transactions", "전월세"),
    ("tx_2025", "2025"),
    ("tx_2026_ytd", "2026YTD"),
    ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
    ("median_rent_deposit_manwon", "중위 보증금(만원)"),
    ("median_monthly_rent_manwon", "중위 월세(만원)"),
    ("latest_deal_ymd", "최신 계약일"),
])}

## 읽는 규칙

1. 강동권은 잠실/송파 동측 연장축 baseline이다. 값이 들어와도 최신 단계 재확인 전에는 핵심 생활권과 같은 확신도로 점수화하지 않는다.
2. 약수동 주변은 direct hit가 아니라 adjacent/edge baseline이 섞여 있다. 특히 옥수동은 context edge로만 읽고 project-level 가격 해석으로 바로 넘어가지 않는다.
3. 금호동은 금호동1가~4가를 포함한 묶음이므로 exact one-dong처럼 과신하지 않는다.
4. 이 표의 중위값은 latest-window 기준 reference line이다. backfill과 고시 전후 비교는 별도 시계열 작업으로 분리한다.
""",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "zones": len(zone_rows),
                "dongs": len(dong_rows),
                "unique_transactions": summary["unique_transactions"],
                "output": "analysis/expansion-market-signal-summary.{md,csv,json}",
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
