#!/usr/bin/env python3

import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree

from extract_hwp5_text import CfbReader, extract_hwp5_text, is_compressed_hwp, maybe_decompress


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}


def normalize_text(text):
    text = text.replace("\x00", " ")
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def count_hangul(text):
    return sum(1 for char in text if "\uac00" <= char <= "\ud7a3")


def xml_local_name(tag):
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def extract_hwpx_text(path):
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
    return normalize_text("\n".join(pieces)), xml_names


def safe_name(name):
    return re.sub(r"[^A-Za-z0-9가-힣._-]+", "-", name).strip("-") or "bindata"


def inspect_hwp(path):
    cfb = CfbReader(path)
    compressed = is_compressed_hwp(cfb)
    streams = cfb.list_streams()
    body_streams = sorted(
        name for name in streams if name.startswith("BodyText/Section") and name.rsplit("Section", 1)[-1].isdigit()
    )
    bindata_streams = [name for name in streams if name.startswith("BinData/")]
    image_streams = [name for name in bindata_streams if Path(name).suffix.lower() in IMAGE_EXTS]
    return cfb, {
        "container": "hwp5_cfb",
        "compressed": compressed,
        "stream_count": len(streams),
        "body_section_count": len(body_streams),
        "bindata_count": len(bindata_streams),
        "image_bindata_count": len(image_streams),
        "image_bindata_streams": image_streams,
    }


def extract_hwp_images(cfb, compressed, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    seen_by_hash = {}
    for stream_name in cfb.list_streams():
        if not stream_name.startswith("BinData/"):
            continue
        ext = Path(stream_name).suffix.lower()
        if ext not in IMAGE_EXTS:
            continue
        raw = maybe_decompress(cfb.read_stream(stream_name), compressed)
        digest = hashlib.sha256(raw).hexdigest()
        duplicate_of = seen_by_hash.get(digest, "")
        output_path = out_dir / f"{len(rows) + 1:03d}-{safe_name(Path(stream_name).name)}"
        output_path.write_bytes(raw)
        rows.append(
            {
                "stream_name": stream_name,
                "output_path": str(output_path),
                "byte_size": len(raw),
                "sha256": digest,
                "duplicate_of": duplicate_of,
            }
        )
        seen_by_hash.setdefault(digest, str(output_path))
    return rows


def convert_hwp(path, min_hangul, extract_images_dir):
    diagnostics = {
        "input": str(path),
        "source_ext": path.suffix.lower().lstrip("."),
        "status": "",
        "conversion_path": "",
        "text_char_count": 0,
        "hangul_char_count": 0,
        "error": "",
    }
    cfb, hwp_info = inspect_hwp(path)
    diagnostics.update(hwp_info)
    try:
        text = normalize_text(extract_hwp5_text(path))
    except Exception as exc:
        text = ""
        diagnostics["error"] = f"direct HWP5 extraction failed: {exc}"

    diagnostics["text_char_count"] = len(text)
    diagnostics["hangul_char_count"] = count_hangul(text)
    if text and diagnostics["hangul_char_count"] >= min_hangul:
        diagnostics["status"] = "text_extracted"
        diagnostics["conversion_path"] = "hwp5_body_stream_direct"
    elif text and hwp_info["image_bindata_count"] > 0:
        diagnostics["status"] = "image_hwp_ocr_needed"
        diagnostics["conversion_path"] = "hwp_body_low_confidence_bindata_image_candidate"
        diagnostics["error"] = f"Hangul count below threshold: {diagnostics['hangul_char_count']} < {min_hangul}; image BinData exists."
    elif text:
        diagnostics["status"] = "low_confidence_text_extracted"
        diagnostics["conversion_path"] = "hwp5_body_stream_low_confidence"
        diagnostics["error"] = f"Hangul count below threshold: {diagnostics['hangul_char_count']} < {min_hangul}"
    elif hwp_info["image_bindata_count"] > 0:
        diagnostics["status"] = "image_hwp_ocr_needed"
        diagnostics["conversion_path"] = "hwp_bindata_image_candidate"
        diagnostics["error"] = diagnostics["error"] or "No body text extracted; image BinData exists."
    else:
        diagnostics["status"] = "text_unresolved"
        diagnostics["conversion_path"] = "unsupported_or_empty_hwp_body"
        diagnostics["error"] = diagnostics["error"] or "No body text or image BinData found."

    if extract_images_dir:
        image_rows = extract_hwp_images(cfb, hwp_info["compressed"], extract_images_dir)
        diagnostics["extracted_image_count"] = len(image_rows)
        diagnostics["extracted_image_manifest"] = str(extract_images_dir / "bindata-manifest.json")
        (extract_images_dir / "bindata-manifest.json").write_text(
            json.dumps(image_rows, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return text, diagnostics


def convert_hwpx(path):
    text, xml_names = extract_hwpx_text(path)
    diagnostics = {
        "input": str(path),
        "source_ext": "hwpx",
        "container": "hwpx_zip",
        "xml_count": len(xml_names),
        "text_char_count": len(text),
        "hangul_char_count": count_hangul(text),
        "status": "text_extracted" if text else "text_unresolved",
        "conversion_path": "hwpx_zip_xml_direct" if text else "hwpx_zip_xml_empty",
        "error": "" if text else "HWPX XML parsed but no text was found.",
    }
    return text, diagnostics


def main():
    parser = argparse.ArgumentParser(
        description="Convert HWP/HWPX to plain text with local parsers and emit conversion diagnostics."
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", type=Path, help="Write extracted UTF-8 text to this path.")
    parser.add_argument("--diagnostics", type=Path, help="Write conversion diagnostics JSON to this path.")
    parser.add_argument("--extract-images-dir", type=Path, help="For HWP5, extract image BinData streams here.")
    parser.add_argument("--min-hangul", type=int, default=50, help="Minimum Hangul characters for confident HWP body text.")
    parser.add_argument(
        "--allow-low-confidence",
        action="store_true",
        help="Exit 0 even when only low-confidence text or image-only diagnostics are produced.",
    )
    args = parser.parse_args()

    path = args.input
    if not path.exists() or not path.is_file():
        raise SystemExit(f"Input file does not exist: {path}")

    ext = path.suffix.lower()
    if ext == ".hwp":
        text, diagnostics = convert_hwp(path, args.min_hangul, args.extract_images_dir)
    elif ext == ".hwpx":
        text, diagnostics = convert_hwpx(path)
    else:
        raise SystemExit(f"Unsupported extension: {ext}. Expected .hwp or .hwpx")

    if args.output and text:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + "\n", encoding="utf-8")
    elif text:
        sys.stdout.write(text + "\n")

    if args.diagnostics:
        args.diagnostics.parent.mkdir(parents=True, exist_ok=True)
        args.diagnostics.write_text(json.dumps(diagnostics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        print(json.dumps(diagnostics, ensure_ascii=False, indent=2), file=sys.stderr)

    if diagnostics["status"] != "text_extracted" and not args.allow_low_confidence:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
