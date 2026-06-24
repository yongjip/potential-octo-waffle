#!/usr/bin/env python3

import csv
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree

from extract_hwp5_text import extract_hwp5_text


def ensure_bundled_python_site_packages():
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/lib/python3.12/site-packages"
    if bundled.exists():
        bundled_text = str(bundled)
        if bundled_text not in sys.path:
            sys.path.insert(0, bundled_text)


try:
    import pdfplumber
except Exception as exc:  # pragma: no cover - reported in manifest.
    ensure_bundled_python_site_packages()
    try:
        import pdfplumber
    except Exception as retry_exc:  # pragma: no cover - reported in manifest.
        pdfplumber = None
        PDF_IMPORT_ERROR = f"{exc}; bundled retry failed: {retry_exc}"
    else:
        PDF_IMPORT_ERROR = ""
else:
    PDF_IMPORT_ERROR = ""


ROOT = Path(__file__).resolve().parents[1]
ATTACHMENTS_CSV = ROOT / "data/urban/gwangjin-gu-notice-attachments.csv"
OUT_DIR = ROOT / "data/urban/text"
TEXT_DIR = OUT_DIR / "gwangjin-gu/files"
OCR_TEXT_DIR = OUT_DIR / "gwangjin-gu/ocr/files"
MANIFEST_CSV = OUT_DIR / "gwangjin-gu-notice-text-manifest.csv"
MANIFEST_JSON = OUT_DIR / "gwangjin-gu-notice-text-manifest.json"
KEY_FIELDS_CSV = OUT_DIR / "gwangjin-gu-notice-key-fields.csv"
KEY_FIELDS_JSON = OUT_DIR / "gwangjin-gu-notice-key-fields.json"


FIELD_PATTERNS = {
    "district_area": ["정비구역", "구역면적", "면적"],
    "floor_area_ratio": ["용적률"],
    "building_coverage_ratio": ["건폐율"],
    "households": ["세대", "세대수", "공동주택"],
    "right_calculation_date": ["권리산정기준일", "권리 산정 기준일"],
    "height_floors": ["층수", "높이", "최고층수"],
    "infrastructure": ["정비기반시설", "도시계획시설", "도로", "공원", "공공공지"],
    "public_contribution": ["공공기여", "기부채납", "공공시설"],
    "land_use": ["토지이용계획", "용도지역", "용도지구"],
    "approval": ["인가", "승인", "조합설립", "추진위원회"],
    "public_inspection": ["공람", "열람", "주민의견", "의견제출"],
}


def read_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_json(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_stem(row):
    rank = str(row.get("rank", "")).zfill(2)
    board = re.sub(r"[^A-Za-z0-9_-]+", "", row.get("board_id", "board"))
    notice_id = re.sub(r"[^A-Za-z0-9_-]+", "", row.get("board_notice_id", "notice"))
    attachment_index = re.sub(r"[^A-Za-z0-9_-]+", "", row.get("attachment_index", "0"))
    name = Path(row.get("local_path", "attachment")).stem
    name = re.sub(r"[^\w가-힣._-]+", "-", name).strip("-")
    return f"{rank}-{board}-{notice_id}-{attachment_index}-{name}"


def normalize_text(text):
    text = text.replace("\x00", " ")
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf(path):
    if pdfplumber is None:
        return "", 0, f"pdfplumber import failed: {PDF_IMPORT_ERROR}"

    pages = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
    return "\n\n".join(pages).strip(), len(pages), ""


def xml_local_name(tag):
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def extract_hwpx(path):
    pieces = []
    xml_names = []
    with zipfile.ZipFile(path) as archive:
        for name in sorted(archive.namelist()):
            lower = name.lower()
            if not lower.endswith(".xml"):
                continue
            if not (
                lower.startswith("contents/")
                or lower.startswith("sections/")
                or lower.startswith("bindata/")
                or "section" in lower
            ):
                continue
            xml_names.append(name)
            try:
                root = ElementTree.fromstring(archive.read(name))
            except ElementTree.ParseError:
                continue
            paragraph = []
            for element in root.iter():
                local = xml_local_name(element.tag)
                if local in {"t", "text"} and element.text:
                    paragraph.append(element.text)
                elif local in {"lineBreak", "br"}:
                    paragraph.append("\n")
                elif local in {"p", "tbl", "tr"} and paragraph:
                    pieces.append("".join(paragraph))
                    paragraph = []
            if paragraph:
                pieces.append("".join(paragraph))
    text = normalize_text("\n".join(pieces))
    if not xml_names:
        return "", 0, "HWPX container has no parseable XML files"
    if not text:
        return "", 0, f"HWPX XML parsed but no text found: {len(xml_names)} xml files"
    return text, 0, ""


def extract_hwp(path):
    try:
        text = extract_hwp5_text(path)
    except Exception as exc:
        return "", 0, f"direct HWP5 extraction failed: {exc}"
    hangul_count = sum(1 for char in text if "\uac00" <= char <= "\ud7a3")
    if text and hangul_count >= 20:
        return text, 0, ""
    return "", 0, "direct HWP5 extraction produced low-confidence text"


def context_snippets(text, keywords, radius=90, limit=5):
    compact = re.sub(r"\s+", " ", text)
    snippets = []
    seen = set()
    for keyword in keywords:
        for match in re.finditer(re.escape(keyword), compact):
            start = max(0, match.start() - radius)
            end = min(len(compact), match.end() + radius)
            snippet = compact[start:end].strip()
            if snippet in seen:
                continue
            seen.add(snippet)
            snippets.append(snippet)
            if len(snippets) >= limit:
                return snippets
    return snippets


def first_numbers(snippets):
    joined = " ".join(snippets)
    matches = re.findall(r"(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(㎡|m2|%|세대|층|호)?", joined)
    values = []
    for number, unit in matches[:8]:
        values.append(f"{number}{unit}")
    return "; ".join(values)


def key_field_row(row, manifest_row, text):
    out = {
        "rank": row.get("rank", ""),
        "focus_area": row.get("focus_area", ""),
        "district": row.get("district", ""),
        "project_name": row.get("project_name", ""),
        "board_id": row.get("board_id", ""),
        "board_notice_id": row.get("board_notice_id", ""),
        "notice_title": row.get("notice_title", ""),
        "attachment_index": row.get("attachment_index", ""),
        "attachment_name": row.get("attachment_name", ""),
        "text_path": manifest_row.get("text_path", ""),
        "extraction_status": manifest_row.get("extraction_status", ""),
    }
    for field, keywords in FIELD_PATTERNS.items():
        snippets = context_snippets(text, keywords)
        out[f"{field}_values"] = first_numbers(snippets)
        out[f"{field}_snippets"] = " || ".join(snippets)
    return out


def extract_attachment(row):
    local_path = ROOT / row.get("local_path", "")
    out_stem = safe_stem(row)
    text_path = TEXT_DIR / f"{out_stem}.txt"
    ext = local_path.suffix.lower()
    manifest = {
        "rank": row.get("rank", ""),
        "focus_area": row.get("focus_area", ""),
        "district": row.get("district", ""),
        "project_name": row.get("project_name", ""),
        "board_id": row.get("board_id", ""),
        "board_notice_id": row.get("board_notice_id", ""),
        "notice_title": row.get("notice_title", ""),
        "attachment_index": row.get("attachment_index", ""),
        "attachment_name": row.get("attachment_name", ""),
        "source_file": row.get("local_path", ""),
        "source_ext": ext.lstrip("."),
        "source_sha256": row.get("sha256", "") or (sha256_file(local_path) if local_path.exists() else ""),
        "text_path": "",
        "page_count": "",
        "text_char_count": 0,
        "extraction_status": "",
        "extraction_error": "",
    }

    if not local_path.exists():
        manifest["extraction_status"] = "missing_source_file"
        manifest["extraction_error"] = "local_path does not exist"
        return manifest, ""

    try:
        ocr_used = False
        if ext == ".pdf":
            text, page_count, error = extract_pdf(local_path)
            status = "extracted"
            if not text:
                ocr_text_path = OCR_TEXT_DIR / f"{out_stem}.txt"
                if ocr_text_path.exists():
                    text = ocr_text_path.read_text(encoding="utf-8", errors="replace")
                    error = ""
                    status = "ocr_extracted"
                    ocr_used = True
                else:
                    status = "scanned_pdf_or_image_only"
        elif ext == ".hwpx":
            text, page_count, error = extract_hwpx(local_path)
            status = "extracted"
        elif ext == ".hwp":
            text, page_count, error = extract_hwp(local_path)
            status = "extracted"
            if not text:
                status = "hwp_text_low_confidence"
        else:
            text, page_count, error = "", 0, f"unsupported extension: {ext}"
            status = "failed"
    except Exception as exc:
        text, page_count, error, status = "", 0, str(exc), "failed"

    text = normalize_text(text)
    manifest["page_count"] = page_count or ""
    manifest["text_char_count"] = len(text)
    if text:
        TEXT_DIR.mkdir(parents=True, exist_ok=True)
        text_path.write_text(text, encoding="utf-8")
        manifest["text_path"] = str(text_path.relative_to(ROOT))
        manifest["extraction_status"] = "ocr_extracted" if ocr_used else status
    else:
        manifest["extraction_status"] = status
        manifest["extraction_error"] = error or "empty extracted text"
    return manifest, text


def main():
    if not ATTACHMENTS_CSV.exists():
        raise SystemExit(f"missing input: {ATTACHMENTS_CSV.relative_to(ROOT)}")

    rows = [row for row in read_csv(ATTACHMENTS_CSV) if row.get("local_path")]
    manifest_rows = []
    key_rows = []
    for row in rows:
        manifest, text = extract_attachment(row)
        manifest_rows.append(manifest)
        key_rows.append(key_field_row(row, manifest, text))

    write_csv(MANIFEST_CSV, manifest_rows)
    write_json(MANIFEST_JSON, manifest_rows)
    write_csv(KEY_FIELDS_CSV, key_rows)
    write_json(KEY_FIELDS_JSON, key_rows)

    summary = {
        "attachments": len(rows),
        "extracted": sum(1 for row in manifest_rows if row["extraction_status"] == "extracted"),
        "ocr_extracted": sum(1 for row in manifest_rows if row["extraction_status"] == "ocr_extracted"),
        "scanned_pdf_or_image_only": sum(1 for row in manifest_rows if row["extraction_status"] == "scanned_pdf_or_image_only"),
        "hwp_text_low_confidence": sum(1 for row in manifest_rows if row["extraction_status"] == "hwp_text_low_confidence"),
        "failed": sum(1 for row in manifest_rows if row["extraction_status"] == "failed"),
        "missing_source_file": sum(1 for row in manifest_rows if row["extraction_status"] == "missing_source_file"),
        "text_dir": str(TEXT_DIR.relative_to(ROOT)),
        "manifest": str(MANIFEST_CSV.relative_to(ROOT)),
        "key_fields": str(KEY_FIELDS_CSV.relative_to(ROOT)),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    sys.exit(main())
