#!/usr/bin/env python3

import argparse
import hashlib
import json
import re
from pathlib import Path

from extract_hwp5_text import CfbReader, is_compressed_hwp, maybe_decompress


def safe_name(name):
    return re.sub(r"[^A-Za-z0-9가-힣._-]+", "-", name).strip("-") or "bindata"


def extract_images(input_path, out_dir):
    cfb = CfbReader(input_path)
    compressed = is_compressed_hwp(cfb)
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    seen_by_hash = {}
    for stream_name in cfb.list_streams():
        if not stream_name.startswith("BinData/"):
            continue
        raw = maybe_decompress(cfb.read_stream(stream_name), compressed)
        digest = hashlib.sha256(raw).hexdigest()
        ext = Path(stream_name).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".bmp", ".gif"}:
            continue
        duplicate_of = seen_by_hash.get(digest, "")
        file_name = f"{len(rows) + 1:03d}-{safe_name(Path(stream_name).name)}"
        output_path = out_dir / file_name
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


def main():
    parser = argparse.ArgumentParser(description="Extract image BinData streams from an HWP5 file.")
    parser.add_argument("input", type=Path)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--manifest", type=Path)
    args = parser.parse_args()
    rows = extract_images(args.input, args.out_dir)
    if args.manifest:
        args.manifest.parent.mkdir(parents=True, exist_ok=True)
        args.manifest.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"images": len(rows), "out_dir": str(args.out_dir)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
