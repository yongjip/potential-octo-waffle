#!/usr/bin/env python3

import csv
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from statistics import median
from zoneinfo import ZoneInfo

PROJECTS_INPUT = Path("data/market/project-market-areas.json")
TX_INPUT = Path("data/market/transactions/manual-official-transactions-normalized.csv")
MATCH_INPUT = Path("data/market/transactions/manual-official-transactions-project-matches.csv")
INDICATOR_INPUT = Path("data/market/indicators/manual-market-indicators-normalized.csv")

OUT_MD = Path("analysis/market-transaction-signal-summary.md")
OUT_CSV = Path("analysis/market-transaction-signal-summary.csv")
OUT_JSON = Path("analysis/market-transaction-signal-summary.json")

def kst_date():
    return datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


UPDATED_AT = f"{kst_date()} KST"


def read_csv(path):
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as fp:
        return list(csv.DictReader(fp))


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


def tx_key(row):
    return "|".join([
        row.get("lawd_cd", ""),
        row.get("deal_ymd", ""),
        row.get("legal_dong", ""),
        row.get("asset_name", ""),
        row.get("deal_amount", ""),
        row.get("area_sqm", ""),
        row.get("floor", ""),
    ])


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


def summarize_transactions(rows):
    unique = dedupe(rows)
    trade_rows = [row for row in unique if to_number(row.get("deal_amount"))]
    rent_rows = [row for row in unique if to_number(row.get("deposit_amount")) or to_number(row.get("monthly_rent"))]
    amounts = [to_number(row.get("deal_amount")) for row in trade_rows]
    amounts = [value for value in amounts if value is not None and value > 0]
    deposits = [to_number(row.get("deposit_amount")) for row in rent_rows]
    deposits = [value for value in deposits if value is not None and value > 0]
    pps = []
    for row in trade_rows:
        amount = to_number(row.get("deal_amount"))
        area = to_number(row.get("area_sqm"))
        if amount is not None and area and area > 0:
            pps.append(amount / area)
    year_counts = Counter(str(row.get("deal_ymd", ""))[:4] for row in unique if row.get("deal_ymd"))
    dong_counts = Counter(row.get("legal_dong", "") for row in unique if row.get("legal_dong"))
    latest = max((row.get("deal_ymd", "") for row in unique), default="")
    canceled = sum(1 for row in unique if row.get("cancel_date"))
    return {
        "matched_transactions": len(rows),
        "unique_transactions": len(unique),
        "trade_transactions": len(trade_rows),
        "rent_transactions": len(rent_rows),
        "tx_2024": year_counts.get("2024", 0),
        "tx_2025": year_counts.get("2025", 0),
        "tx_2026_ytd": year_counts.get("2026", 0),
        "latest_deal_ymd": latest,
        "median_trade_amount_manwon": fmt_number(median(amounts) if amounts else None),
        "median_trade_price_per_sqm_manwon": fmt_number(median(pps) if pps else None, 1),
        "median_rent_deposit_manwon": fmt_number(median(deposits) if deposits else None),
        "canceled_transactions": canceled,
        "top_dongs": "; ".join(f"{dong} {count}" for dong, count in dong_counts.most_common(3)),
    }


def review_note(project, summary):
    keywords = [item.strip() for item in str(project.get("target_complex_keywords", "")).split(";") if item.strip()]
    notes = []
    if summary["unique_transactions"] == 0:
        notes.append("서울시 매매 원자료 1차 매칭 없음")
    if any(len(keyword) <= 2 or keyword in ["자양", "잠실", "송파", "광장", "구의", "대치", "압구정", "개포"] for keyword in keywords):
        notes.append("동명/광역 단지명 키워드 포함: 개별 단지 확정 검수 필요")
    if summary["matched_transactions"] > summary["unique_transactions"]:
        notes.append("동일 거래가 복수 사업장 비교군에 연결될 수 있음")
    return "; ".join(notes) or "1차 매칭 결과 샘플 검수 필요"


def summarize_indicators(indicator_rows):
    latest = {}
    for row in indicator_rows:
        key = (row.get("region", ""), row.get("statistic_name", ""))
        month = row.get("reference_month", "")
        if not month:
            continue
        if key not in latest or month > latest[key].get("reference_month", ""):
            latest[key] = row
    rows = []
    for (region, statistic_name), row in sorted(latest.items()):
        rows.append({
            "region": region,
            "statistic_name": statistic_name,
            "reference_month": row.get("reference_month", ""),
            "metric_value": row.get("metric_value", ""),
            "unit": row.get("unit", ""),
            "change_rate": row.get("change_rate", ""),
        })
    return rows


def main():
    projects = json.loads(PROJECTS_INPUT.read_text(encoding="utf-8"))
    tx_rows = read_csv(TX_INPUT)
    match_rows = read_csv(MATCH_INPUT)
    indicator_rows_raw = read_csv(INDICATOR_INPUT)
    indicator_rows = summarize_indicators(indicator_rows_raw)

    matches_by_rank = defaultdict(list)
    for row in match_rows:
        matches_by_rank[str(row.get("rank", ""))].append(row)

    project_rows = []
    for project in projects:
        rank = str(project.get("rank", ""))
        summary = summarize_transactions(matches_by_rank.get(rank, []))
        project_rows.append({
            "row_type": "project",
            "focus_area": project.get("focus_area", ""),
            "rank": rank,
            "project_name": project.get("project_name", ""),
            "district": project.get("district", ""),
            "dong": project.get("dong", ""),
            "current_stage": project.get("current_stage", ""),
            **summary,
            "review_note": review_note(project, summary),
        })

    focus_rows = []
    for focus_area in sorted({project.get("focus_area", "") for project in projects}):
        rows = [row for row in match_rows if row.get("focus_area") == focus_area]
        summary = summarize_transactions(rows)
        focus_rows.append({
            "row_type": "focus_area",
            "focus_area": focus_area,
            "rank": "",
            "project_name": "생활권 합계",
            "district": "",
            "dong": "",
            "current_stage": "",
            **summary,
            "review_note": "사업장 키워드 매칭을 생활권 단위로 중복 제거해 집계",
        })

    rows = focus_rows + sorted(project_rows, key=lambda row: int(row["rank"] or 0))
    summary = {
        "generated_at": UPDATED_AT,
        "official_source": "서울 열린데이터광장 OA-21275 및 국토교통부 실거래가 공개시스템 조건별 자료제공",
        "normalized_transactions": len(tx_rows),
        "normalized_indicators": len(indicator_rows_raw),
        "project_match_rows": len(match_rows),
        "project_count": len(projects),
        "project_with_match_count": sum(1 for row in project_rows if row["unique_transactions"] > 0),
        "focus_area_count": len(focus_rows),
        "latest_deal_ymd": max((row.get("deal_ymd", "") for row in tx_rows), default=""),
        "latest_indicator_month": max((row.get("reference_month", "") for row in indicator_rows_raw), default=""),
        "coverage_note": "2024-01부터 2026-06까지 서울시 매매 실거래, 국토교통부 RTMS 아파트·연립다세대 매매/전월세, 한국부동산원 R-ONE 가격지수·거래현황 지표를 대상 법정동/자치구/권역으로 분할한 1차 분석이다.",
    }

    OUT_JSON.write_text(json.dumps({"generated_at": UPDATED_AT, "summary": summary, "focusRows": focus_rows, "projectRows": project_rows, "indicatorRows": indicator_rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(OUT_CSV, rows)
    OUT_MD.write_text(f"""# 서울시 실거래 시장 신호 요약

작성 기준: {UPDATED_AT}

서울 열린데이터광장 OA-21275 `서울시 부동산 실거래가 정보`와 국토교통부 실거래가 공개시스템 조건별 자료제공 CSV를 2024~2026년 범위로 내려받아 강남·잠실/송파·구의/광진 대상 법정동으로 분할한 1차 시장 신호다. 이 문서는 투자 판단이 아니라 공식 원자료가 분석 체계에 연결됐는지 확인하고, 다음 수동 검수 대상을 좁히기 위한 요약이다.

## 요약

| 항목 | 값 |
| --- | ---: |
| 정규화 거래/전월세 행 | {summary["normalized_transactions"]} |
| 정규화 R-ONE 지표 행 | {summary["normalized_indicators"]} |
| 사업장 매칭 행 | {summary["project_match_rows"]} |
| 대상 사업장 | {summary["project_count"]} |
| 매칭 있는 사업장 | {summary["project_with_match_count"]} |
| 생활권 | {summary["focus_area_count"]} |
| 최신 계약일 | {summary["latest_deal_ymd"]} |
| 최신 R-ONE 기준월 | {summary["latest_indicator_month"]} |

## R-ONE 최신 지표

{md_table(indicator_rows, [
  ("region", "지역"),
  ("statistic_name", "지표"),
  ("reference_month", "기준월"),
  ("metric_value", "값"),
  ("unit", "단위"),
  ("change_rate", "변동률"),
])}

## 생활권 요약

{md_table(focus_rows, [
  ("focus_area", "생활권"),
  ("unique_transactions", "중복제거 행"),
  ("trade_transactions", "매매"),
  ("rent_transactions", "전월세"),
  ("tx_2024", "2024"),
  ("tx_2025", "2025"),
  ("tx_2026_ytd", "2026YTD"),
  ("median_trade_amount_manwon", "중위 매매가(만원)"),
  ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
  ("median_rent_deposit_manwon", "중위 보증금(만원)"),
  ("top_dongs", "주요 법정동"),
])}

## 사업장 1차 매칭

{md_table(sorted(project_rows, key=lambda row: int(row["rank"] or 0)), [
  ("rank", "순위"),
  ("focus_area", "생활권"),
  ("project_name", "사업장"),
  ("current_stage", "단계"),
  ("unique_transactions", "중복제거 행"),
  ("trade_transactions", "매매"),
  ("rent_transactions", "전월세"),
  ("tx_2024", "2024"),
  ("tx_2025", "2025"),
  ("tx_2026_ytd", "2026YTD"),
  ("median_trade_price_per_sqm_manwon", "중위 매매 ㎡당(만원)"),
  ("latest_deal_ymd", "최신 계약일"),
  ("review_note", "검수 메모"),
])}

## 해석 경계

1. 사업장 매칭은 법정동과 단지명/권역 키워드 기반 1차 필터다. 같은 법정동의 준공 단지와 정비 대상 단지가 섞일 수 있어 개별 거래 샘플 검수가 필요하다.
2. 전월세 행은 보증금/월세를 별도 필드로 보존한다. 매매 중위가와 전월세 보증금 중위값은 서로 다른 지표이므로 단일 가격 순위로 합치지 않는다.
3. `취소일`이 있는 거래는 표에 포함했지만 취소 거래 제거 여부는 후속 분석 옵션으로 분리해야 한다.
4. R-ONE 지표는 자치구·권역·서울 단위의 방향성 확인용이다. 법정동·단지별 거래 샘플과 단위가 다르므로 사업장 가격으로 직접 해석하지 않는다.
5. 최신성 기준은 서울 열린데이터광장 공식 데이터셋 페이지의 갱신일 2026-06-22, RTMS/R-ONE 다운로드 실행 시점, 그리고 현재 로컬 다운로드 파일이다.
""", encoding="utf-8")

    print(json.dumps({
        "normalizedTransactions": summary["normalized_transactions"],
        "projectMatches": summary["project_match_rows"],
        "projectWithMatch": summary["project_with_match_count"],
        "output": "analysis/market-transaction-signal-summary.{md,csv,json}",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
