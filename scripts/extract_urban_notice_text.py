#!/usr/bin/env python3

import csv
import hashlib
import json
import os
import re
import shutil
import subprocess
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
ATTACHMENTS_CSVS = [
    ROOT / "data/urban/urban-notice-attachments-priority-candidates.csv",
    ROOT / "data/urban/urban-notice-attachments-expansion-shortlist.csv",
    ROOT / "data/urban/business-layer-notice-attachments.csv",
    ROOT / "data/urban/gangnam-songpa-notice-attachments.csv",
]
CANDIDATES_CSV = ROOT / "analysis/priority-redevelopment-candidates.csv"
FILES_DIR = ROOT / "data/urban/files"
OUT_DIR = ROOT / "data/urban/text"
TEXT_DIR = OUT_DIR / "files"
OCR_TEXT_DIR = OUT_DIR / "ocr/files"
TMP_DIR = OUT_DIR / "tmp"
MANIFEST_CSV = OUT_DIR / "notice-text-manifest.csv"
MANIFEST_JSON = OUT_DIR / "notice-text-manifest.json"
KEY_FIELDS_CSV = OUT_DIR / "notice-key-fields.csv"
KEY_FIELDS_JSON = OUT_DIR / "notice-key-fields.json"
TRY_HWP_SOFFICE = "--try-hwp-soffice" in sys.argv


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
}

MIN_PDF_TEXT_CHARS = 200


def read_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def parse_rank_filter(argv):
    for arg in argv:
        if arg.startswith("--rank="):
            return {item.strip() for item in arg.split("=", 1)[1].split(",") if item.strip()}
    return None


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


def by_rank(rows):
    return {str(row.get("rank", "")): row for row in rows if row.get("rank")}


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_stem(row):
    notice = re.sub(r"[^A-Za-z0-9_-]+", "", row.get("notice_code") or row.get("board_notice_id") or "notice")
    rank = str(row.get("rank", "")).zfill(2) if str(row.get("rank", "")).strip() else ""
    shortlist = row.get("shortlist_id", "")
    id_part = rank or re.sub(r"[^\w가-힣._-]+", "-", shortlist) or "00"
    name = Path(row.get("local_path", "notice")).stem
    name = re.sub(r"[^\w가-힣._-]+", "-", name)
    return f"{id_part}-{notice}-{name}"


def is_notice_attachment(row):
    local_path = row.get("local_path", "")
    if not local_path:
        return False
    if row.get("attachment_type"):
        return row.get("attachment_type") == "notice_file"
    name = row.get("attachment_name", "") or local_path
    return Path(name).suffix.lower() in {".pdf", ".hwp", ".hwpx"}


def parse_notice_no_from_name(name):
    match = re.search(r"(?:제)?(\d{4}-\d+)\s*호", name)
    return match.group(1) if match else ""


def orphan_notice_files(existing_source_files):
    if not FILES_DIR.exists() or not CANDIDATES_CSV.exists():
        return []

    candidates = by_rank(read_csv(CANDIDATES_CSV))
    rows = []
    pattern = re.compile(r"^(?P<rank>\d{2})-(?P<notice_code>[^-]+)-notice_file-(?P<name>.+)$")
    for local_path in sorted(FILES_DIR.iterdir()):
        if not local_path.is_file() or local_path.suffix.lower() not in {".pdf", ".hwp", ".hwpx"}:
            continue
        relative_path = str(local_path.relative_to(ROOT))
        if relative_path in existing_source_files:
            continue
        match = pattern.match(local_path.name)
        if not match:
            continue
        rank = str(int(match.group("rank")))
        candidate = candidates.get(rank, {})
        if not candidate:
            continue
        rows.append(
            {
                "rank": rank,
                "focus_area": candidate.get("focus_area", ""),
                "district": candidate.get("district", ""),
                "project_name": candidate.get("project_name", ""),
                "notice_code": match.group("notice_code"),
                "notice_no": parse_notice_no_from_name(match.group("name")),
                "notice_date": "",
                "attachment_index": "orphan",
                "attachment_type": "notice_file",
                "attachment_name": match.group("name"),
                "attachment_path": "",
                "attachment_url": "",
                "local_path": relative_path,
                "byte_size": str(local_path.stat().st_size),
                "sha256": sha256_file(local_path),
                "download_status": "local_orphan_recovered",
                "download_error": "",
            }
        )
    return rows


def extract_pdf(path):
    if pdfplumber is None:
        return "", 0, f"pdfplumber import failed: {PDF_IMPORT_ERROR}"

    pages = []
    with pdfplumber.open(str(path)) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")
    return "\n\n".join(pages).strip(), len(pages), ""


def extract_with_soffice(path, out_stem):
    if not TRY_HWP_SOFFICE:
        return "", 0, "HWP conversion skipped. Re-run with --try-hwp-soffice only after LibreOffice dependencies are fixed."
    soffice = shutil.which("soffice")
    if not soffice:
        bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/bin/soffice"
        soffice = str(bundled) if bundled.exists() else ""
    if not soffice:
        return "", 0, "soffice not found"

    TMP_DIR.mkdir(parents=True, exist_ok=True)
    work_dir = TMP_DIR / out_stem
    if work_dir.exists():
        shutil.rmtree(work_dir)
    work_dir.mkdir(parents=True, exist_ok=True)

    copied = work_dir / path.name
    shutil.copy2(path, copied)
    command = [
        soffice,
        "--headless",
        "--convert-to",
        "txt:Text",
        "--outdir",
        str(work_dir),
        str(copied),
    ]
    env = os.environ.copy()
    bundled_lib = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/lib"
    env["DYLD_LIBRARY_PATH"] = f"{bundled_lib}:{env.get('DYLD_LIBRARY_PATH', '')}"
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=90, env=env)
    txt_files = sorted(work_dir.glob("*.txt"))
    if result.returncode != 0 or not txt_files:
        message = " ".join([result.stdout.strip(), result.stderr.strip()]).strip()
        return "", 0, message or f"soffice conversion failed with code {result.returncode}"
    return txt_files[0].read_text(encoding="utf-8", errors="replace").strip(), 0, ""


def extract_hwp(path, out_stem):
    try:
        text = extract_hwp5_text(path)
    except Exception as exc:
        direct_error = f"direct HWP5 extraction failed: {exc}"
    else:
        hangul_count = sum(1 for char in text if "\uac00" <= char <= "\ud7a3")
        if text and hangul_count >= 50:
            return text, 0, ""
        direct_error = "direct HWP5 extraction produced low-confidence text; may be image-only HWP or unsupported controls"

    converted_text, page_count, soffice_error = extract_with_soffice(path, out_stem)
    if converted_text:
        return converted_text, page_count, ""
    if TRY_HWP_SOFFICE:
        return "", page_count, f"{direct_error}; soffice fallback failed: {soffice_error}"
    return "", page_count, direct_error


def normalize_text(text):
    text = text.replace("\x00", " ")
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def low_confidence_pdf_text(text):
    return len(normalize_text(text)) < MIN_PDF_TEXT_CHARS


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
        "shortlist_id": row.get("shortlist_id", ""),
        "rank": row.get("rank", ""),
        "focus_area": row.get("focus_area", ""),
        "district": row.get("district", ""),
        "project_name": row.get("project_name", ""),
        "notice_code": row.get("notice_code") or row.get("board_notice_id", ""),
        "notice_no": row.get("notice_no", ""),
        "notice_date": row.get("notice_date", ""),
        "text_path": manifest_row.get("text_path", ""),
        "extraction_status": manifest_row.get("extraction_status", ""),
    }
    for field, keywords in FIELD_PATTERNS.items():
        snippets = context_snippets(text, keywords)
        out[f"{field}_values"] = first_numbers(snippets)
        out[f"{field}_snippets"] = " || ".join(snippets)
    return out


def extract_notice_file(row):
    source_file = row.get("local_path", "")
    local_path = ROOT / source_file if source_file else Path()
    out_stem = safe_stem(row)
    text_path = TEXT_DIR / f"{out_stem}.txt"
    ext = local_path.suffix.lower()
    manifest = {
        "shortlist_id": row.get("shortlist_id", ""),
        "rank": row.get("rank", ""),
        "focus_area": row.get("focus_area", ""),
        "district": row.get("district", ""),
        "project_name": row.get("project_name", ""),
        "notice_code": row.get("notice_code") or row.get("board_notice_id", ""),
        "notice_no": row.get("notice_no", ""),
        "notice_date": row.get("notice_date", ""),
        "source_file": source_file,
        "source_ext": ext.lstrip("."),
        "source_sha256": row.get("sha256", "") or (sha256_file(local_path) if local_path.exists() and local_path.is_file() else ""),
        "text_path": "",
        "page_count": "",
        "text_char_count": 0,
        "extraction_status": "",
        "extraction_error": "",
    }

    if not source_file:
        manifest["extraction_status"] = "missing_source_file"
        manifest["extraction_error"] = "local_path is empty"
        return manifest, ""

    if not local_path.exists():
        manifest["extraction_status"] = "missing_source_file"
        manifest["extraction_error"] = "local_path does not exist"
        return manifest, ""

    if not local_path.is_file():
        manifest["extraction_status"] = "missing_source_file"
        manifest["extraction_error"] = "local_path is not a file"
        return manifest, ""

    ocr_used = False
    try:
        if ext == ".pdf":
            text, page_count, error = extract_pdf(local_path)
            ocr_text_path = OCR_TEXT_DIR / f"{out_stem}.txt"
            if text and low_confidence_pdf_text(text):
                text = ""
                error = "low_confidence_pdf_text"
            if not text and ocr_text_path.exists():
                text = ocr_text_path.read_text(encoding="utf-8", errors="replace")
                error = ""
                ocr_used = True
        elif ext == ".hwp":
            text, page_count, error = extract_hwp(local_path, out_stem)
            if not text:
                ocr_text_path = OCR_TEXT_DIR / f"{out_stem}.txt"
                if ocr_text_path.exists():
                    text = ocr_text_path.read_text(encoding="utf-8", errors="replace")
                    error = ""
                    ocr_used = True
        elif ext == ".hwpx":
            text, page_count, error = extract_hwpx(local_path)
        else:
            text, page_count, error = "", 0, f"unsupported extension: {ext}"
    except Exception as exc:
        text, page_count, error = "", 0, str(exc)

    text = normalize_text(text)
    manifest["page_count"] = page_count or ""
    manifest["text_char_count"] = len(text)
    if text:
        TEXT_DIR.mkdir(parents=True, exist_ok=True)
        text_path.write_text(text, encoding="utf-8")
        manifest["text_path"] = str(text_path.relative_to(ROOT))
        if ocr_used and ext == ".hwp":
            manifest["extraction_status"] = "hwp_ocr_extracted"
        else:
            manifest["extraction_status"] = "ocr_extracted" if ocr_used else "extracted"
    else:
        if ext == ".pdf" and (error in {"empty extracted text", "low_confidence_pdf_text"} or not error):
            manifest["extraction_status"] = "scanned_pdf_or_image_only"
        elif ext == ".hwp":
            if "low-confidence" in error:
                manifest["extraction_status"] = "hwp_text_low_confidence"
            else:
                manifest["extraction_status"] = "hwp_pending_external_conversion" if not TRY_HWP_SOFFICE else "hwp_conversion_failed"
        elif ext == ".hwpx":
            manifest["extraction_status"] = "hwpx_text_empty_or_unparsed"
        else:
            manifest["extraction_status"] = "failed"
        manifest["extraction_error"] = error or "empty extracted text"
    return manifest, text


def main():
    rank_filter = parse_rank_filter(sys.argv[1:])
    notice_files = []
    for attachments_csv in ATTACHMENTS_CSVS:
        if attachments_csv.exists():
            notice_files.extend(row for row in read_csv(attachments_csv) if is_notice_attachment(row))
    existing_source_files = {row.get("local_path", "") for row in notice_files if row.get("local_path")}
    notice_files.extend(orphan_notice_files(existing_source_files))
    if rank_filter is not None:
        notice_files = [row for row in notice_files if str(row.get("rank", "")).strip() in rank_filter]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest_rows = []
    key_rows = []

    for row in notice_files:
        manifest, text = extract_notice_file(row)
        manifest_rows.append(manifest)
        key_rows.append(key_field_row(row, manifest, text))

    write_csv(MANIFEST_CSV, manifest_rows)
    write_json(MANIFEST_JSON, manifest_rows)
    write_csv(KEY_FIELDS_CSV, key_rows)
    write_json(KEY_FIELDS_JSON, key_rows)

    summary = {
        "notice_files": len(notice_files),
        "extracted": sum(1 for row in manifest_rows if row["extraction_status"] == "extracted"),
        "ocr_extracted": sum(1 for row in manifest_rows if row["extraction_status"] == "ocr_extracted"),
        "hwp_ocr_extracted": sum(1 for row in manifest_rows if row["extraction_status"] == "hwp_ocr_extracted"),
        "scanned_pdf_or_image_only": sum(1 for row in manifest_rows if row["extraction_status"] == "scanned_pdf_or_image_only"),
        "hwp_text_low_confidence": sum(1 for row in manifest_rows if row["extraction_status"] == "hwp_text_low_confidence"),
        "hwp_pending_external_conversion": sum(1 for row in manifest_rows if row["extraction_status"] == "hwp_pending_external_conversion"),
        "hwp_conversion_failed": sum(1 for row in manifest_rows if row["extraction_status"] == "hwp_conversion_failed"),
        "hwpx_text_empty_or_unparsed": sum(1 for row in manifest_rows if row["extraction_status"] == "hwpx_text_empty_or_unparsed"),
        "failed": sum(1 for row in manifest_rows if row["extraction_status"] == "failed"),
        "missing_source_file": sum(1 for row in manifest_rows if row["extraction_status"] == "missing_source_file"),
        "text_dir": str(TEXT_DIR.relative_to(ROOT)),
        "manifest": str(MANIFEST_CSV.relative_to(ROOT)),
        "key_fields": str(KEY_FIELDS_CSV.relative_to(ROOT)),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
