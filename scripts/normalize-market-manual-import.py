#!/usr/bin/env python3

import argparse
import csv
import importlib.util
import json
import re
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo

MANIFEST_INPUT = Path("data/market/manual-import/manifest.json")
INGEST_MANIFEST_INPUT = Path("data/market/manual-import/ingest-manifest.json")
MAPPING_INPUT = Path("data/market/manual-import/column-mapping.json")
PROJECT_AREAS_INPUT = Path("data/market/project-market-areas.json")
AUDIT_HELPER = Path("scripts/generate-market-manual-column-audit.py")

OUT_DIR = Path("data/market/transactions")
INDICATOR_OUT_DIR = Path("data/market/indicators")
ANALYSIS_DIR = Path("analysis")
OUT_TX_BASE = OUT_DIR / "manual-official-transactions-normalized"
OUT_MATCH_BASE = OUT_DIR / "manual-official-transactions-project-matches"
OUT_INDICATOR_BASE = INDICATOR_OUT_DIR / "manual-market-indicators-normalized"
OUT_AUDIT_MD = ANALYSIS_DIR / "market-manual-normalization-audit.md"
OUT_AUDIT_CSV = ANALYSIS_DIR / "market-manual-normalization-audit.csv"
OUT_AUDIT_JSON = ANALYSIS_DIR / "market-manual-normalization-audit.json"

def kst_date():
    return datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


UPDATED_AT = f"{kst_date()} KST"

TX_FIELDS = [
    "source",
    "source_label",
    "record_type",
    "manual_source_id",
    "lawd_cd",
    "deal_ymd",
    "legal_dong",
    "asset_name",
    "jibun",
    "deal_amount",
    "deposit_amount",
    "monthly_rent",
    "area_sqm",
    "floor",
    "build_year",
    "deal_year",
    "deal_month",
    "deal_day",
    "cancel_date",
    "manual_task_id",
    "ingest_scope",
    "download_filter",
    "raw_file",
]

INDICATOR_FIELDS = [
    "source",
    "source_label",
    "record_type",
    "manual_source_id",
    "region",
    "statistic_name",
    "reference_month",
    "metric_value",
    "unit",
    "change_rate",
    "manual_task_id",
    "ingest_scope",
    "download_filter",
    "raw_file",
]

MATCH_FIELDS = [
    "rank",
    "focus_area",
    "project_name",
    "current_stage",
    "notice_date",
    "target_complex_keywords",
    *TX_FIELDS,
]


def load_audit_helper():
    spec = importlib.util.spec_from_file_location("market_manual_column_audit", AUDIT_HELPER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


AUDIT = load_audit_helper()


def csv_escape(value):
    text = "" if value is None else str(value)
    if any(ch in text for ch in [",", '"', "\n", "\r"]):
        return '"' + text.replace('"', '""') + '"'
    return text


def write_csv(path, rows, fields):
    lines = [",".join(fields)]
    for row in rows:
        lines.append(",".join(csv_escape(row.get(field, "")) for field in fields))
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def md_table(rows, fields):
    if not rows:
        return "_없음_"
    out = [
        "| " + " | ".join(label for _, label in fields) + " |",
        "| " + " | ".join("---" for _ in fields) + " |",
    ]
    for row in rows:
        out.append("| " + " | ".join(str(row.get(key, "")).replace("|", "/") for key, _ in fields) + " |")
    return "\n".join(out)


def normalize_number(value):
    text = str(value or "").replace(",", "").strip()
    if not text:
        return ""
    try:
        number = float(text)
    except ValueError:
        return text
    if number.is_integer():
        return str(int(number))
    return str(number)


def normalize_digits(value):
    return re.sub(r"\D+", "", str(value or ""))


def normalize_deal_date(value):
    digits = normalize_digits(value)
    if len(digits) >= 8:
        return digits[:8]
    if len(digits) >= 6:
        return digits[:6]
    return digits


def deal_ymd_from_parts(row):
    year = normalize_digits(row.get("deal_year", ""))
    month = normalize_digits(row.get("deal_month", ""))
    day = normalize_digits(row.get("deal_day", ""))
    if len(month) >= 6 and day:
        return f"{month[:6]}{day.zfill(2)[:2]}"
    if len(month) >= 6:
        return month[:6]
    if year and month and day:
        return f"{year[:4]}{month.zfill(2)[:2]}{day.zfill(2)[:2]}"
    if year and month:
        return f"{year[:4]}{month.zfill(2)[:2]}"
    return ""


def legal_dong_from_address(value):
    text = str(value or "")
    matches = re.findall(r"([가-힣0-9]+동)", text)
    return matches[-1] if matches else text.strip()


def parse_keywords(value):
    return [item.strip() for item in str(value or "").split(";") if item.strip()]


def contains(value, needle):
    return str(needle or "") in str(value or "")


def decode_csv_bytes(data):
    return AUDIT.decode_csv_bytes(data)


def sniff_delimiter(sample):
    return AUDIT.sniff_delimiter(sample)


def read_csv_records(path):
    text, _encoding = decode_csv_bytes(path.read_bytes())
    delimiter = sniff_delimiter(text[:4096])
    reader = csv.DictReader(text.splitlines(), delimiter=delimiter)
    return [{key.strip(): (value or "").strip() for key, value in row.items() if key is not None} for row in reader]


def cell_ref_to_col(ref):
    return AUDIT.cell_ref_to_col(ref)


def read_xlsx_records(path):
    ns = {
        "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
        "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
    }
    with zipfile.ZipFile(path) as zf:
        shared = []
        if "xl/sharedStrings.xml" in zf.namelist():
            root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si", ns):
                shared.append("".join(node.text or "" for node in item.findall(".//main:t", ns)))
        workbook = ET.fromstring(zf.read("xl/workbook.xml"))
        rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        rel_targets = {
            rel.attrib.get("Id"): rel.attrib.get("Target", "")
            for rel in rels.findall("pkgrel:Relationship", ns)
        }
        sheets = workbook.findall("main:sheets/main:sheet", ns)
        if not sheets:
            return []
        first = sheets[0]
        rel_id = first.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id", "")
        target = rel_targets.get(rel_id, "worksheets/sheet1.xml")
        sheet_path = "xl/" + target.lstrip("/")
        if sheet_path not in zf.namelist():
            sheet_path = "xl/worksheets/sheet1.xml"
        sheet = ET.fromstring(zf.read(sheet_path))
        table = []
        for row in sheet.findall(".//main:sheetData/main:row", ns):
            values = []
            for cell in row.findall("main:c", ns):
                col_index = cell_ref_to_col(cell.attrib.get("r", "A1"))
                while len(values) <= col_index:
                    values.append("")
                cell_type = cell.attrib.get("t", "")
                value_node = cell.find("main:v", ns)
                inline_node = cell.find("main:is/main:t", ns)
                value = ""
                if cell_type == "s" and value_node is not None:
                    try:
                        value = shared[int(value_node.text or "0")]
                    except (ValueError, IndexError):
                        value = value_node.text or ""
                elif cell_type == "inlineStr" and inline_node is not None:
                    value = inline_node.text or ""
                elif value_node is not None:
                    value = value_node.text or ""
                values[col_index] = value
            if any(str(value).strip() for value in values):
                table.append([str(value).strip() for value in values])
        if not table:
            return []
        header = table[0]
        records = []
        for values in table[1:]:
            record = {}
            for index, header_name in enumerate(header):
                if header_name:
                    record[header_name] = values[index] if index < len(values) else ""
            records.append(record)
        return records


def read_json_records(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data if all(isinstance(row, dict) for row in data) else []
    if isinstance(data, dict):
        for value in data.values():
            if isinstance(value, list) and all(isinstance(row, dict) for row in value):
                return value
    return []


def read_records(path):
    ext = path.suffix.lower()
    if ext in [".csv", ".txt", ".tsv"]:
        return read_csv_records(path)
    if ext == ".xlsx":
        return read_xlsx_records(path)
    if ext == ".json":
        return read_json_records(path)
    return []


def headers_from_records(records):
    headers = []
    seen = set()
    for row in records[:50]:
        for key in row.keys():
            if key not in seen:
                headers.append(key)
                seen.add(key)
    return headers


def resolve_mapping(headers, configured_map, output_table="transactions"):
    resolved = {}
    for field, configured in configured_map.items():
        if configured:
            resolved[field] = configured if configured in headers else ""
            continue
        matched, score = AUDIT.best_match(headers, field)
        if score >= 65:
            resolved[field] = matched
        else:
            resolved[field] = ""

    missing = []
    if output_table == "indicators":
        for field in ["region", "statistic_name", "reference_month", "metric_value"]:
            if not resolved.get(field):
                missing.append(field)
        return resolved, missing

    if not (resolved.get("legal_dong") or resolved.get("legal_dong_or_region")):
        missing.append("legal_dong")
    if not resolved.get("asset_name"):
        missing.append("asset_name")
    if not (resolved.get("deal_ymd") or resolved.get("contract_date") or resolved.get("deal_month")):
        missing.append("deal_ymd")
    if not (resolved.get("deal_amount") or resolved.get("price_or_deposit") or resolved.get("deposit_amount") or resolved.get("monthly_rent")):
        missing.append("deal_amount")
    if not resolved.get("area_sqm"):
        missing.append("area_sqm")
    return resolved, missing


def get_value(raw, mapping, field):
    column = mapping.get(field, "")
    if not column:
        return ""
    return str(raw.get(column, "") or "").strip()


def infer_lawd_cd(raw, mapping, config, manifest_row):
    lawd = get_value(raw, mapping, "lawd_cd")
    if lawd:
        return normalize_digits(lawd)[:5]
    district = get_value(raw, mapping, "district")
    if district:
        district_map = config.get("district_to_lawd_cd") or {}
        if district in district_map:
            return district_map[district]
        for district_name, lawd_cd in district_map.items():
            if district_name in district:
                return lawd_cd
    if manifest_row.get("lawd_cd"):
        return normalize_digits(manifest_row.get("lawd_cd", ""))[:5]
    if manifest_row.get("district"):
        return (config.get("district_to_lawd_cd") or {}).get(manifest_row.get("district", ""), "")
    return ""


def normalize_transaction(raw, mapping, config, path, manifest_row):
    deal_ymd = normalize_deal_date(get_value(raw, mapping, "deal_ymd") or get_value(raw, mapping, "contract_date"))
    parts = {
        "deal_year": get_value(raw, mapping, "deal_year"),
        "deal_month": get_value(raw, mapping, "deal_month"),
        "deal_day": get_value(raw, mapping, "deal_day"),
    }
    if not deal_ymd:
        deal_ymd = deal_ymd_from_parts(parts)
    derived_year = normalize_digits(parts["deal_year"]) or deal_ymd[:4]
    derived_month = normalize_digits(parts["deal_month"]) or deal_ymd[4:6]
    derived_day = normalize_digits(parts["deal_day"]) or deal_ymd[6:8]
    return {
        "source": config.get("source", ""),
        "source_label": config.get("source_label", ""),
        "record_type": config.get("record_type", ""),
        "manual_source_id": config.get("manual_source_id", ""),
        "lawd_cd": infer_lawd_cd(raw, mapping, config, manifest_row),
        "deal_ymd": deal_ymd,
        "legal_dong": legal_dong_from_address(get_value(raw, mapping, "legal_dong") or get_value(raw, mapping, "legal_dong_or_region") or manifest_row.get("dong", "")),
        "asset_name": get_value(raw, mapping, "asset_name"),
        "jibun": get_value(raw, mapping, "jibun"),
        "deal_amount": normalize_number(get_value(raw, mapping, "deal_amount") or get_value(raw, mapping, "price_or_deposit")),
        "deposit_amount": normalize_number(get_value(raw, mapping, "deposit_amount")),
        "monthly_rent": normalize_number(get_value(raw, mapping, "monthly_rent")),
        "area_sqm": normalize_number(get_value(raw, mapping, "area_sqm")),
        "floor": normalize_number(get_value(raw, mapping, "floor")),
        "build_year": get_value(raw, mapping, "build_year"),
        "deal_year": derived_year,
        "deal_month": derived_month[-2:] if len(derived_month) >= 6 else derived_month,
        "deal_day": derived_day,
        "cancel_date": normalize_deal_date(get_value(raw, mapping, "cancel_date")),
        "manual_task_id": manifest_row.get("task_id", ""),
        "ingest_scope": manifest_row.get("ingest_scope", ""),
        "download_filter": manifest_row.get("filter_applied", ""),
        "raw_file": str(path),
    }


def normalize_indicator(raw, mapping, config, path, manifest_row):
    return {
        "source": config.get("source", ""),
        "source_label": config.get("source_label", ""),
        "record_type": config.get("record_type", ""),
        "manual_source_id": config.get("manual_source_id", ""),
        "region": get_value(raw, mapping, "region"),
        "statistic_name": get_value(raw, mapping, "statistic_name"),
        "reference_month": normalize_deal_date(get_value(raw, mapping, "reference_month"))[:6],
        "metric_value": normalize_number(get_value(raw, mapping, "metric_value")),
        "unit": get_value(raw, mapping, "unit"),
        "change_rate": normalize_number(get_value(raw, mapping, "change_rate")),
        "manual_task_id": manifest_row.get("task_id", ""),
        "ingest_scope": manifest_row.get("ingest_scope", ""),
        "download_filter": manifest_row.get("filter_applied", ""),
        "raw_file": str(path),
    }


def match_transactions_to_projects(transactions, projects):
    matched = []
    for tx in transactions:
        for project in projects:
            if project.get("lawd_cd") != tx.get("lawd_cd"):
                continue
            dong = str(project.get("dong", "")).replace("동", "")
            if tx.get("legal_dong") and dong and dong not in tx.get("legal_dong", ""):
                continue
            keywords = parse_keywords(project.get("target_complex_keywords", ""))
            haystack = f"{tx.get('asset_name', '')} {tx.get('legal_dong', '')} {tx.get('jibun', '')}"
            if keywords and not any(contains(haystack, keyword) for keyword in keywords):
                continue
            matched.append({
                "rank": project.get("rank", ""),
                "focus_area": project.get("focus_area", ""),
                "project_name": project.get("project_name", ""),
                "current_stage": project.get("current_stage", ""),
                "notice_date": project.get("notice_date", ""),
                "target_complex_keywords": project.get("target_complex_keywords", ""),
                **tx,
            })
    return matched


def count_by(rows, field):
    result = {}
    for row in rows:
        key = row.get(field, "")
        result[key] = result.get(key, 0) + 1
    return result


def count_text(counts):
    return "; ".join(f"{key} {value}" for key, value in sorted(counts.items(), key=lambda item: (-item[1], item[0])))


def markdown(summary, source_rows):
    return f"""# 시장 수동 원자료 정규화 감사

작성 기준: {UPDATED_AT}

수동 다운로드 원자료를 표준 거래/지표 스키마로 옮길 수 있는지 확인하고, 매핑이 가능한 파일은 별도 `manual-*` 산출물로 정규화한다. API 수집 산출물인 `official-transactions-normalized.csv`는 덮어쓰지 않는다.

## 요약

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | {summary["manifest_count"]} |
| 읽은 원자료 행 | {summary["raw_rows"]} |
| 정규화 거래 행 | {summary["normalized_transactions"]} |
| 사업장 매칭 거래 행 | {summary["project_matched_transactions"]} |
| 정규화 지표 행 | {summary["normalized_indicators"]} |
| 대기/오류 출처 | {summary["blocked_source_count"]} |
| 상태 분포 | {summary["status_summary"]} |

## 출처별 처리

{md_table(source_rows, [
  ("manual_source_id", "ID"),
  ("output_table", "출력"),
  ("local_path", "파일"),
  ("raw_rows", "원자료 행"),
  ("normalized_rows", "정규화 행"),
  ("matched_rows", "매칭 행"),
  ("missing_mapping_fields", "누락 매핑"),
  ("normalization_status", "상태"),
  ("next_action", "다음 액션"),
])}

## 산출물

- `{OUT_TX_BASE}.csv/json`: 수동 반입 거래 정규화 결과
- `{OUT_MATCH_BASE}.csv/json`: 후보 사업장 키워드 1차 매칭 결과
- `{OUT_INDICATOR_BASE}.csv/json`: R-ONE 등 지역 지표 정규화 결과

## 운영 규칙

1. `manual-*` 산출물은 검토용이다. 사업장 매칭은 법정동·키워드 기반 1차 필터이므로 수동 검수가 필요하다.
2. API 수집 결과와 합치기 전에는 중복 기간·해제거래·정정거래를 별도로 확인한다.
3. 매핑이 부족하면 `data/market/manual-import/column-mapping.json`의 `column_map`을 채운 뒤 다시 실행한다.
"""

def parse_args():
    parser = argparse.ArgumentParser(description="Normalize manually-downloaded market data into structured transaction/indicator outputs.")
    parser.add_argument("--manifest-input", help="Path to manifest/ingest manifest JSON. Defaults to ingest-manifest.json when present, else manifest.json.")
    parser.add_argument("--mapping-input", default=str(MAPPING_INPUT), help="Path to column mapping JSON.")
    parser.add_argument("--project-areas-input", default=str(PROJECT_AREAS_INPUT), help="Path to project/market areas JSON for 1st-pass matching.")
    parser.add_argument("--out-tx-base", default=str(OUT_TX_BASE), help="Base path for normalized transaction csv/json outputs, without extension.")
    parser.add_argument("--out-match-base", default=str(OUT_MATCH_BASE), help="Base path for matched transaction csv/json outputs, without extension.")
    parser.add_argument("--out-indicator-base", default=str(OUT_INDICATOR_BASE), help="Base path for normalized indicator csv/json outputs, without extension.")
    parser.add_argument("--out-audit-md", default=str(OUT_AUDIT_MD), help="Markdown audit output path.")
    parser.add_argument("--out-audit-csv", default=str(OUT_AUDIT_CSV), help="CSV audit output path.")
    parser.add_argument("--out-audit-json", default=str(OUT_AUDIT_JSON), help="JSON audit output path.")
    return parser.parse_args()


def main():
    global MAPPING_INPUT, PROJECT_AREAS_INPUT, OUT_TX_BASE, OUT_MATCH_BASE, OUT_INDICATOR_BASE, OUT_AUDIT_MD, OUT_AUDIT_CSV, OUT_AUDIT_JSON, OUT_DIR, INDICATOR_OUT_DIR, ANALYSIS_DIR

    args = parse_args()
    manifest_input = Path(args.manifest_input) if args.manifest_input else (INGEST_MANIFEST_INPUT if INGEST_MANIFEST_INPUT.exists() else MANIFEST_INPUT)
    MAPPING_INPUT = Path(args.mapping_input)
    PROJECT_AREAS_INPUT = Path(args.project_areas_input)
    OUT_TX_BASE = Path(args.out_tx_base)
    OUT_MATCH_BASE = Path(args.out_match_base)
    OUT_INDICATOR_BASE = Path(args.out_indicator_base)
    OUT_AUDIT_MD = Path(args.out_audit_md)
    OUT_AUDIT_CSV = Path(args.out_audit_csv)
    OUT_AUDIT_JSON = Path(args.out_audit_json)
    OUT_DIR = OUT_TX_BASE.parent
    INDICATOR_OUT_DIR = OUT_INDICATOR_BASE.parent
    ANALYSIS_DIR = OUT_AUDIT_MD.parent

    manifest = json.loads(manifest_input.read_text(encoding="utf-8"))
    configs = {row["manual_source_id"]: row for row in json.loads(MAPPING_INPUT.read_text(encoding="utf-8"))}
    projects = json.loads(PROJECT_AREAS_INPUT.read_text(encoding="utf-8"))

    transactions = []
    indicators = []
    source_rows = []

    for manifest_row in manifest:
        source_id = manifest_row.get("manual_source_id", "")
        config = configs.get(source_id, {})
        local_path = manifest_row.get("local_path", "")
        path = Path(local_path) if local_path else None
        source_row = {
            "manual_source_id": source_id,
            "output_table": config.get("output_table", ""),
            "local_path": local_path,
            "task_id": manifest_row.get("task_id", ""),
            "ingest_scope": manifest_row.get("ingest_scope", ""),
            "raw_rows": 0,
            "normalized_rows": 0,
            "matched_rows": 0,
            "missing_mapping_fields": "",
            "normalization_status": "",
            "next_action": "",
        }
        if not config or not config.get("enabled", True):
            source_row.update({"normalization_status": "mapping_disabled", "next_action": "column-mapping.json에서 enabled를 확인"})
            source_rows.append(source_row)
            continue
        if not path:
            source_row.update({"normalization_status": "waiting_for_file", "next_action": "manifest local_path 입력"})
            source_rows.append(source_row)
            continue
        if not path.exists():
            source_row.update({"normalization_status": "file_not_found", "next_action": "manifest local_path 확인"})
            source_rows.append(source_row)
            continue
        records = read_records(path)
        headers = headers_from_records(records)
        resolved_map, missing = resolve_mapping(headers, config.get("column_map", {}), config.get("output_table", "transactions"))
        source_row["raw_rows"] = len(records)
        source_row["missing_mapping_fields"] = "; ".join(missing)
        if not records:
            source_row.update({"normalization_status": "no_rows", "next_action": "원자료 파일에 데이터 행이 있는지 확인"})
            source_rows.append(source_row)
            continue
        if missing:
            source_row.update({"normalization_status": "missing_required_mapping", "next_action": "column-mapping.json의 column_map을 수동 보강"})
            source_rows.append(source_row)
            continue
        if config.get("output_table") == "indicators":
            normalized = [normalize_indicator(record, resolved_map, config, path, manifest_row) for record in records]
            indicators.extend(normalized)
            source_row["normalized_rows"] = len(normalized)
        else:
            normalized = [normalize_transaction(record, resolved_map, config, path, manifest_row) for record in records]
            transactions.extend(normalized)
            source_row["normalized_rows"] = len(normalized)
            source_row["matched_rows"] = len(match_transactions_to_projects(normalized, projects))
        source_row.update({"normalization_status": "normalized", "next_action": "샘플 행과 사업장 매칭 결과 수동 검수"})
        source_rows.append(source_row)

    matched = match_transactions_to_projects(transactions, projects)
    ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    INDICATOR_OUT_DIR.mkdir(parents=True, exist_ok=True)

    if transactions:
        write_csv(OUT_TX_BASE.with_suffix(".csv"), transactions, TX_FIELDS)
        OUT_TX_BASE.with_suffix(".json").write_text(json.dumps(transactions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if matched:
        write_csv(OUT_MATCH_BASE.with_suffix(".csv"), matched, MATCH_FIELDS)
        OUT_MATCH_BASE.with_suffix(".json").write_text(json.dumps(matched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if indicators:
        write_csv(OUT_INDICATOR_BASE.with_suffix(".csv"), indicators, INDICATOR_FIELDS)
        OUT_INDICATOR_BASE.with_suffix(".json").write_text(json.dumps(indicators, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = count_by(source_rows, "normalization_status")
    summary = {
        "generated_at": UPDATED_AT,
        "manifest_count": len(manifest),
        "raw_rows": sum(row["raw_rows"] for row in source_rows),
        "normalized_transactions": len(transactions),
        "project_matched_transactions": len(matched),
        "normalized_indicators": len(indicators),
        "blocked_source_count": sum(1 for row in source_rows if row["normalization_status"] != "normalized"),
        "status_counts": counts,
        "status_summary": count_text(counts),
        "mapping_input": str(MAPPING_INPUT),
        "manifest_input": str(manifest_input),
    }
    OUT_AUDIT_JSON.write_text(json.dumps({"generated_at": UPDATED_AT, "summary": summary, "sourceRows": source_rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(OUT_AUDIT_CSV, source_rows, list(source_rows[0].keys()) if source_rows else [])
    OUT_AUDIT_MD.write_text(markdown(summary, source_rows), encoding="utf-8")
    print(json.dumps({
        "rawRows": summary["raw_rows"],
        "normalizedTransactions": summary["normalized_transactions"],
        "projectMatchedTransactions": summary["project_matched_transactions"],
        "normalizedIndicators": summary["normalized_indicators"],
        "blockedSources": summary["blocked_source_count"],
        "output": "analysis/market-manual-normalization-audit.{md,csv,json}",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
