#!/usr/bin/env python3

from pathlib import Path
import argparse
import json

import pdfplumber


DEFAULT_PDF = Path("data/urban/files/27-seoul-sibo-4146-20260430.pdf")
DEFAULT_OUT = Path("data/urban/text/seoul-sibo-4146-20260430.txt")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract page-marked text from a Seoul Sibo PDF.")
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    empty_pages = []

    with pdfplumber.open(args.pdf) as pdf, args.out.open("w", encoding="utf-8") as out:
        for index, page in enumerate(pdf.pages, start=1):
            text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            if not text.strip():
                empty_pages.append(index)
            out.write(f"\n\n===== PAGE {index} =====\n")
            out.write(text)
            out.write("\n")

    print(
        json.dumps(
            {
                "pdf": str(args.pdf),
                "out": str(args.out),
                "pages": index if "index" in locals() else 0,
                "empty_pages": len(empty_pages),
                "empty_sample": empty_pages[:20],
                "bytes": args.out.stat().st_size,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
