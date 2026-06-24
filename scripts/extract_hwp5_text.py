#!/usr/bin/env python3

import argparse
import struct
import sys
import zlib
from pathlib import Path

FREESECT = 0xFFFFFFFF
ENDOFCHAIN = 0xFFFFFFFE
FATSECT = 0xFFFFFFFD
DIFSECT = 0xFFFFFFFC
NOSTREAM = 0xFFFFFFFF
MINI_STREAM_CUTOFF = 4096


class CfbReader:
    def __init__(self, path):
        self.path = Path(path)
        self.data = self.path.read_bytes()
        if self.data[:8] != b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1":
            raise ValueError("not a Compound File Binary container")
        self.sector_size = 1 << struct.unpack_from("<H", self.data, 30)[0]
        self.mini_sector_size = 1 << struct.unpack_from("<H", self.data, 32)[0]
        self.first_dir_sector = struct.unpack_from("<I", self.data, 48)[0]
        self.mini_cutoff = struct.unpack_from("<I", self.data, 56)[0] or MINI_STREAM_CUTOFF
        self.first_mini_fat_sector = struct.unpack_from("<I", self.data, 60)[0]
        self.num_mini_fat_sectors = struct.unpack_from("<I", self.data, 64)[0]
        self.first_difat_sector = struct.unpack_from("<I", self.data, 68)[0]
        self.num_difat_sectors = struct.unpack_from("<I", self.data, 72)[0]
        self.fat = self._load_fat()
        self.entries = self._load_directory()
        self.root_entry = next((entry for entry in self.entries if entry["type"] == 5), None)
        self.mini_fat = self._load_mini_fat()
        self.root_mini_stream = (
            self._read_regular_stream(self.root_entry["start_sector"], self.root_entry["size"]) if self.root_entry else b""
        )
        self.streams = self._build_stream_index()

    def _sector_offset(self, sector):
        return (sector + 1) * self.sector_size

    def _sector_bytes(self, sector):
        offset = self._sector_offset(sector)
        return self.data[offset : offset + self.sector_size]

    def _sector_chain(self, start, table=None):
        if start in (FREESECT, ENDOFCHAIN, NOSTREAM):
            return []
        table = table or self.fat
        chain = []
        seen = set()
        sector = start
        while sector not in (FREESECT, ENDOFCHAIN, NOSTREAM):
            if sector in seen:
                raise ValueError("sector chain loop detected")
            if sector >= len(table):
                raise ValueError("sector index outside FAT")
            seen.add(sector)
            chain.append(sector)
            sector = table[sector]
        return chain

    def _load_fat(self):
        difat = list(struct.unpack_from("<109I", self.data, 76))
        next_difat = self.first_difat_sector
        for _ in range(self.num_difat_sectors):
            if next_difat in (FREESECT, ENDOFCHAIN, NOSTREAM):
                break
            raw = self._sector_bytes(next_difat)
            entries = list(struct.unpack_from(f"<{self.sector_size // 4}I", raw, 0))
            difat.extend(entries[:-1])
            next_difat = entries[-1]
        fat_sector_ids = [sector for sector in difat if sector not in (FREESECT, ENDOFCHAIN, FATSECT, DIFSECT, NOSTREAM)]
        fat = []
        for sector in fat_sector_ids:
            raw = self._sector_bytes(sector)
            fat.extend(struct.unpack_from(f"<{self.sector_size // 4}I", raw, 0))
        return fat

    def _read_regular_stream(self, start, size=None):
        chunks = [self._sector_bytes(sector) for sector in self._sector_chain(start)]
        data = b"".join(chunks)
        return data[:size] if size is not None else data

    def _load_mini_fat(self):
        if self.first_mini_fat_sector in (FREESECT, ENDOFCHAIN, NOSTREAM) or self.num_mini_fat_sectors == 0:
            return []
        raw = b"".join(self._sector_bytes(sector) for sector in self._sector_chain(self.first_mini_fat_sector))
        count = len(raw) // 4
        return list(struct.unpack_from(f"<{count}I", raw, 0))

    def _read_mini_stream(self, start, size):
        if not self.mini_fat or start in (FREESECT, ENDOFCHAIN, NOSTREAM):
            return b""
        chunks = []
        seen = set()
        sector = start
        while sector not in (FREESECT, ENDOFCHAIN, NOSTREAM):
            if sector in seen:
                raise ValueError("mini sector chain loop detected")
            if sector >= len(self.mini_fat):
                raise ValueError("mini sector index outside mini FAT")
            seen.add(sector)
            offset = sector * self.mini_sector_size
            chunks.append(self.root_mini_stream[offset : offset + self.mini_sector_size])
            sector = self.mini_fat[sector]
        return b"".join(chunks)[:size]

    def _load_directory(self):
        raw = self._read_regular_stream(self.first_dir_sector)
        entries = []
        for offset in range(0, len(raw), 128):
            item = raw[offset : offset + 128]
            if len(item) < 128:
                continue
            name_len = struct.unpack_from("<H", item, 64)[0]
            name_bytes = item[: max(0, name_len - 2)]
            name = name_bytes.decode("utf-16le", errors="ignore")
            object_type = item[66]
            if not name or object_type == 0:
                entries.append({"name": name, "type": object_type, "child": NOSTREAM, "left": NOSTREAM, "right": NOSTREAM})
                continue
            entries.append(
                {
                    "name": name,
                    "type": object_type,
                    "left": struct.unpack_from("<I", item, 68)[0],
                    "right": struct.unpack_from("<I", item, 72)[0],
                    "child": struct.unpack_from("<I", item, 76)[0],
                    "start_sector": struct.unpack_from("<I", item, 116)[0],
                    "size": struct.unpack_from("<Q", item, 120)[0],
                }
            )
        return entries

    def _sibling_tree(self, index):
        if index in (FREESECT, ENDOFCHAIN, NOSTREAM) or index >= len(self.entries):
            return []
        entry = self.entries[index]
        return self._sibling_tree(entry.get("left", NOSTREAM)) + [index] + self._sibling_tree(entry.get("right", NOSTREAM))

    def _build_stream_index(self):
        streams = {}

        def walk_storage(index, parent):
            if index in (FREESECT, ENDOFCHAIN, NOSTREAM) or index >= len(self.entries):
                return
            storage = self.entries[index]
            for child_index in self._sibling_tree(storage.get("child", NOSTREAM)):
                child = self.entries[child_index]
                child_path = f"{parent}/{child['name']}" if parent else child["name"]
                if child["type"] == 1:
                    walk_storage(child_index, child_path)
                elif child["type"] == 2:
                    streams[child_path] = child

        root_index = next((idx for idx, entry in enumerate(self.entries) if entry.get("type") == 5), None)
        if root_index is not None:
            walk_storage(root_index, "")
        return streams

    def read_stream(self, name):
        entry = self.streams[name]
        size = entry["size"]
        if size < self.mini_cutoff:
            return self._read_mini_stream(entry["start_sector"], size)
        return self._read_regular_stream(entry["start_sector"], size)

    def list_streams(self):
        return sorted(self.streams)


def is_compressed_hwp(cfb):
    try:
        header = cfb.read_stream("FileHeader")
    except KeyError:
        return False
    if not header.startswith(b"HWP Document File"):
        raise ValueError("not an HWP5 document")
    flags = struct.unpack_from("<I", header, 36)[0]
    return bool(flags & 1)


def maybe_decompress(raw, compressed):
    if not compressed:
        return raw
    for wbits in (-15, 15):
        try:
            return zlib.decompress(raw, wbits)
        except zlib.error:
            continue
    return raw


def clean_text(text):
    text = text.replace("\r", "\n")
    text = "".join(char if (char == "\n" or char == "\t" or ord(char) >= 32) else " " for char in text)
    text = text.replace("\u000b", "\n")
    lines = []
    for line in text.splitlines():
        line = " ".join(line.split())
        if line:
            lines.append(line)
    return "\n".join(lines)


def extract_records_text(section):
    offset = 0
    pieces = []
    while offset + 4 <= len(section):
        header = struct.unpack_from("<I", section, offset)[0]
        offset += 4
        tag_id = header & 0x3FF
        size = (header >> 20) & 0xFFF
        if size == 0xFFF:
            if offset + 4 > len(section):
                break
            size = struct.unpack_from("<I", section, offset)[0]
            offset += 4
        payload = section[offset : offset + size]
        offset += size
        if tag_id == 67 and payload:
            pieces.append(payload.decode("utf-16le", errors="ignore"))
    return clean_text("\n".join(pieces))


def extract_hwp5_text(path):
    cfb = CfbReader(path)
    compressed = is_compressed_hwp(cfb)
    section_names = [
        name
        for name in cfb.list_streams()
        if name.startswith("BodyText/Section") and name.rsplit("Section", 1)[-1].isdigit()
    ]
    section_names.sort(key=lambda item: int(item.rsplit("Section", 1)[-1]))
    texts = []
    for name in section_names:
        raw = cfb.read_stream(name)
        data = maybe_decompress(raw, compressed)
        text = extract_records_text(data)
        if text:
            texts.append(text)
    return "\n\n".join(texts).strip()


def main():
    parser = argparse.ArgumentParser(description="Extract plain text from HWP5 without LibreOffice.")
    parser.add_argument("input", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()
    text = extract_hwp5_text(args.input)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()
