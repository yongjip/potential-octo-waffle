#!/usr/bin/env python3

import csv
import json
import re
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo

OUT_DIR = Path("analysis")
OUT_MD = OUT_DIR / "market-manual-column-audit.md"
OUT_CSV = OUT_DIR / "market-manual-column-audit.csv"
OUT_JSON = OUT_DIR / "market-manual-column-audit.json"

MANIFEST_INPUT = Path("data/market/manual-import/manifest.json")
INGEST_MANIFEST_INPUT = Path("data/market/manual-import/ingest-manifest.json")
def kst_date():
    return datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")


UPDATED_AT = f"{kst_date()} KST"

MAX_SAMPLE_ROWS = 50
MAX_COLUMNS_IN_MD = 18

REQUIRED_FIELDS = {
    "seoul-open-data-real-estate-csv": [
        "district",
        "legal_dong",
        "building_name",
        "contract_date",
        "transaction_amount",
        "exclusive_area_sqm",
    ],
    "molit-rtms-apt-trade-rent-manual": [
        "legal_dong_or_region",
        "building_name",
        "contract_date",
        "price_or_deposit",
        "exclusive_area_sqm",
    ],
    "molit-rtms-rowhouse-trade-rent-manual": [
        "legal_dong_or_region",
        "building_name",
        "contract_date",
        "price_or_deposit",
        "exclusive_area_sqm",
    ],
    "r-one-price-and-volume-statistics": [
        "region",
        "statistic_name",
        "reference_month",
        "metric_value",
    ],
}

ALIASES = {
    "district": ["자치구", "시군구", "구", "지역구", "sgg", "sigungu", "district"],
    "legal_dong": ["법정동", "법정동명", "동", "읍면동", "dong", "umd", "법정동코드"],
    "legal_dong_or_region": ["지역", "시군구", "법정동", "법정동명", "동", "읍면동", "region", "dong", "umd"],
    "building_name": ["건물명", "단지명", "아파트", "아파트명", "연립다세대", "주택명", "complex", "building", "apt"],
    "contract_date": ["계약일", "계약년월일", "계약년월", "거래일", "신고일", "dealymd", "deal_ymd", "dealdate", "date"],
    "transaction_amount": ["거래금액", "거래가액", "매매가", "실거래가", "거래가격", "물건금액", "물건금액만원", "amount", "price"],
    "price_or_deposit": ["거래금액", "거래가액", "매매가", "보증금", "전세금", "월세금", "월세", "amount", "price", "deposit", "rent"],
    "exclusive_area_sqm": ["전용면적", "전용면적㎡", "면적", "계약면적", "area", "excluusear", "exclusive"],
    "floor": ["층", "해당층", "floor"],
    "built_year": ["건축년도", "건축연도", "준공년도", "buildyear", "built"],
    "region": ["지역", "지역명", "권역", "시도", "시군구", "region"],
    "statistic_name": ["통계명", "지표", "항목", "분류", "series", "statistic", "indicator"],
    "reference_month": ["기준월", "기준년월", "시점", "년월", "date", "month", "period"],
    "metric_value": ["값", "지수", "증감률", "거래량", "수치", "value", "index", "volume"],
}


def normalize(text):
    return re.sub(r"[\s_()\[\]{}./\\\-·:]+", "", str(text or "").lower())


def csv_escape(value):
    text = "" if value is None else str(value)
    if any(ch in text for ch in [",", '"', "\n", "\r"]):
        return '"' + text.replace('"', '""') + '"'
    return text


def write_csv(path, rows):
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fields = list(rows[0].keys())
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


def decode_csv_bytes(data):
    for encoding in ["utf-8-sig", "utf-8", "cp949", "euc-kr"]:
        try:
            return data.decode(encoding), encoding
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace"), "utf-8-replace"


def sniff_delimiter(sample):
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        return dialect.delimiter
    except csv.Error:
        return "\t" if sample.count("\t") > sample.count(",") else ","


def trim_table(rows):
    clean_rows = []
    for row in rows:
        cells = [str(cell or "").strip() for cell in row]
        if any(cells):
            clean_rows.append(cells)
        if len(clean_rows) >= MAX_SAMPLE_ROWS + 1:
            break
    if not clean_rows:
        return [], []
    header = clean_rows[0]
    width = max(len(header), max((len(row) for row in clean_rows[1:]), default=0))
    header = header + [""] * (width - len(header))
    sample_rows = [(row + [""] * (width - len(row)))[:width] for row in clean_rows[1:]]
    return header, sample_rows


def read_csv_preview(path):
    text, encoding = decode_csv_bytes(path.read_bytes())
    delimiter = sniff_delimiter(text[:4096])
    reader = csv.reader(text.splitlines(), delimiter=delimiter)
    header, sample_rows = trim_table(reader)
    return {
        "status": "parsed",
        "parser": "csv",
        "encoding": encoding,
        "delimiter": "\\t" if delimiter == "\t" else delimiter,
        "sheet_name": "",
        "headers": header,
        "sample_rows": sample_rows,
    }


def cell_ref_to_col(ref):
    letters = "".join(ch for ch in ref if ch.isalpha())
    number = 0
    for char in letters:
        number = number * 26 + (ord(char.upper()) - ord("A") + 1)
    return max(number - 1, 0)


def read_xlsx_preview(path):
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
            return {"status": "no_sheet", "parser": "xlsx", "headers": [], "sample_rows": [], "sheet_name": ""}
        first = sheets[0]
        sheet_name = first.attrib.get("name", "")
        rel_id = first.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id", "")
        target = rel_targets.get(rel_id, "worksheets/sheet1.xml")
        sheet_path = "xl/" + target.lstrip("/")
        if sheet_path not in zf.namelist():
            sheet_path = "xl/worksheets/sheet1.xml"
        sheet = ET.fromstring(zf.read(sheet_path))
        table_rows = []
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
            table_rows.append(values)
            if len(table_rows) >= MAX_SAMPLE_ROWS + 1:
                break
        header, sample_rows = trim_table(table_rows)
        return {
            "status": "parsed",
            "parser": "xlsx",
            "encoding": "",
            "delimiter": "",
            "sheet_name": sheet_name,
            "headers": header,
            "sample_rows": sample_rows,
        }


def read_json_preview(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        records = data
    elif isinstance(data, dict):
        records = next((value for value in data.values() if isinstance(value, list)), [])
    else:
        records = []
    if not records or not isinstance(records[0], dict):
        return {"status": "no_tabular_records", "parser": "json", "headers": [], "sample_rows": [], "sheet_name": ""}
    headers = list(records[0].keys())
    sample_rows = [[record.get(header, "") for header in headers] for record in records[:MAX_SAMPLE_ROWS]]
    return {"status": "parsed", "parser": "json", "headers": headers, "sample_rows": sample_rows, "sheet_name": ""}


def read_preview(path):
    ext = path.suffix.lower()
    if ext in [".csv", ".txt", ".tsv"]:
        return read_csv_preview(path)
    if ext == ".xlsx":
        return read_xlsx_preview(path)
    if ext == ".json":
        return read_json_preview(path)
    if ext == ".xls":
        return {"status": "unsupported_legacy_xls", "parser": "none", "headers": [], "sample_rows": [], "sheet_name": ""}
    return {"status": "unsupported_extension", "parser": "none", "headers": [], "sample_rows": [], "sheet_name": ""}


def best_match(headers, semantic_field):
    normalized_headers = [(header, normalize(header)) for header in headers]
    aliases = [normalize(alias) for alias in ALIASES.get(semantic_field, [semantic_field])]
    best = ("", 0)
    for header, normalized_header in normalized_headers:
        if not normalized_header:
            continue
        score = 0
        for alias in aliases:
            if normalized_header == alias:
                score = max(score, 100)
            elif alias and alias in normalized_header:
                score = max(score, 85)
            elif normalized_header and normalized_header in alias:
                score = max(score, 65)
        if score > best[1]:
            best = (header, score)
    return best


def audit_manifest_row(row):
    local_path = row.get("local_path", "")
    path = Path(local_path) if local_path else None
    source_id = row.get("manual_source_id", "")
    required = REQUIRED_FIELDS.get(source_id, [])
    base = {
        "manual_source_id": source_id,
        "provider": row.get("provider", ""),
        "source_name": row.get("source_name", ""),
        "local_path": local_path,
        "file_ext": path.suffix.lower() if path else "",
        "parser": "",
        "sheet_name": "",
        "encoding": "",
        "delimiter": "",
        "header_count": 0,
        "sample_row_count": 0,
        "detected_columns": "",
        "matched_required_fields": "",
        "missing_required_fields": "",
        "normalization_readiness": "",
        "next_action": "",
    }
    if not path:
        return {**base, "normalization_readiness": "waiting_for_file", "next_action": "manifest local_path를 채운 뒤 다시 실행"}
    if not path.exists():
        return {**base, "normalization_readiness": "file_not_found", "next_action": "local_path가 실제 파일을 가리키는지 확인"}

    preview = read_preview(path)
    headers = preview.get("headers", [])
    sample_rows = preview.get("sample_rows", [])
    matches = []
    missing = []
    for field in required:
        matched_header, score = best_match(headers, field)
        if score >= 65:
            matches.append(f"{field}->{matched_header}({score})")
        else:
            missing.append(field)

    if preview["status"] != "parsed":
        readiness = preview["status"]
        next_action = "CSV/XLSX/JSON으로 내려받거나 변환한 뒤 manifest를 갱신"
    elif not headers:
        readiness = "no_header_detected"
        next_action = "첫 행이 컬럼명인지 확인하고 원자료를 정리"
    elif missing:
        readiness = "needs_required_column_mapping"
        next_action = "누락 필드를 원자료 컬럼에 수동 매핑하거나 다른 다운로드 옵션으로 재다운로드"
    else:
        readiness = "ready_for_normalization_mapping"
        next_action = "컬럼 매핑을 확정한 뒤 정규화 스크립트로 넘김"

    return {
        **base,
        "parser": preview.get("parser", ""),
        "sheet_name": preview.get("sheet_name", ""),
        "encoding": preview.get("encoding", ""),
        "delimiter": preview.get("delimiter", ""),
        "header_count": len(headers),
        "sample_row_count": len(sample_rows),
        "detected_columns": "; ".join(headers[:MAX_COLUMNS_IN_MD]),
        "matched_required_fields": "; ".join(matches),
        "missing_required_fields": "; ".join(missing),
        "normalization_readiness": readiness,
        "next_action": next_action,
    }


def markdown(summary, rows):
    return f"""# 시장 수동 원자료 컬럼 감사

작성 기준: {UPDATED_AT}

공식 사이트에서 CSV/XLSX 원자료를 내려받은 뒤, 정규화 전에 컬럼명과 필수 필드 매칭 가능성을 점검하는 감사표다. 이 문서는 원자료 값을 변환하지 않고, 파일 구조가 `official-transactions-normalized.csv` 스키마로 넘어갈 준비가 되었는지만 본다.

## 요약

| 항목 | 값 |
| --- | ---: |
| manifest 항목 | {summary["manifest_count"]} |
| 파일 대기 | {summary["waiting_for_file_count"]} |
| 파싱 가능 파일 | {summary["parsed_file_count"]} |
| 정규화 매핑 준비 | {summary["ready_for_mapping_count"]} |
| 필수 컬럼 매핑 필요 | {summary["needs_mapping_count"]} |
| 상태 분포 | {summary["readiness_summary"]} |

## 출처별 컬럼 진단

{md_table(rows, [
  ("manual_source_id", "ID"),
  ("source_name", "자료"),
  ("local_path", "파일"),
  ("parser", "파서"),
  ("header_count", "컬럼"),
  ("sample_row_count", "샘플행"),
  ("matched_required_fields", "매칭 필드"),
  ("missing_required_fields", "누락 필드"),
  ("normalization_readiness", "상태"),
  ("next_action", "다음 액션"),
])}

## 운영 규칙

1. `ready_for_normalization_mapping`은 자동 정규화 완료가 아니라 컬럼 매핑 검토가 가능하다는 뜻이다.
2. `needs_required_column_mapping`은 파일은 읽혔지만 계약일·단지명·면적 등 필수 필드 후보가 부족한 상태다.
3. `.xls` 구형 파일은 자동 파싱하지 않는다. 공식 페이지에서 CSV/XLSX로 다시 내려받거나 별도 변환 후 manifest를 갱신한다.
4. 원자료 행 값은 이 감사표에 저장하지 않고, 컬럼명과 샘플 행 수만 기록한다.
"""


def count_by(rows, field):
    result = {}
    for row in rows:
        key = row.get(field, "")
        result[key] = result.get(key, 0) + 1
    return result


def count_text(counts):
    return "; ".join(f"{key} {value}" for key, value in sorted(counts.items(), key=lambda item: (-item[1], item[0])))


def main():
    manifest_input = INGEST_MANIFEST_INPUT if INGEST_MANIFEST_INPUT.exists() else MANIFEST_INPUT
    manifest = json.loads(manifest_input.read_text(encoding="utf-8"))
    rows = [audit_manifest_row(row) for row in manifest]
    counts = count_by(rows, "normalization_readiness")
    summary = {
        "generated_at": UPDATED_AT,
        "manifest_count": len(rows),
        "waiting_for_file_count": sum(1 for row in rows if row["normalization_readiness"] in ["waiting_for_file", "file_not_found"]),
        "parsed_file_count": sum(1 for row in rows if row["parser"] in ["csv", "xlsx", "json"]),
        "ready_for_mapping_count": sum(1 for row in rows if row["normalization_readiness"] == "ready_for_normalization_mapping"),
        "needs_mapping_count": sum(1 for row in rows if row["normalization_readiness"] == "needs_required_column_mapping"),
        "readiness_counts": counts,
        "readiness_summary": count_text(counts),
        "manifest_input": str(manifest_input),
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"generated_at": UPDATED_AT, "summary": summary, "rows": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(OUT_CSV, rows)
    OUT_MD.write_text(markdown(summary, rows), encoding="utf-8")
    print(json.dumps({
        "manifestRows": len(rows),
        "parsedFiles": summary["parsed_file_count"],
        "readyForMapping": summary["ready_for_mapping_count"],
        "waitingForFile": summary["waiting_for_file_count"],
        "output": "analysis/market-manual-column-audit.{md,csv,json}",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
