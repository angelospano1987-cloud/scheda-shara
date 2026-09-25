"""Estrae la tabella della scheda da SCHEDA ALLENAMENTO.docx in tests/scheda-word.json.

Il test tests/scheda.test.mjs confronta quel file con DEFAULT_DAYS di core.js: se il trainer cambia la scheda,
si aggiorna il Word, si rilancia questo script e il test dice cosa non coincide piu'.

Uso:  python tools/estrai_scheda_word.py [percorso del .docx]
Esito: 0 scritto · 1 docx illeggibile o tabella non trovata.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

DEFAULT_DOCX = Path.home() / "Dropbox" / "PROGETTI CLAUDE" / "SHARA" / "SCHEDA ALLENAMENTO.docx"
OUT = Path(__file__).resolve().parent.parent / "tests" / "scheda-word.json"
DAYS = ("Lunedì", "Mercoledì", "Venerdì")


def text_of(fragment: str) -> str:
    return re.sub(r"\s+", " ", "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", fragment))).strip()


def extract(docx: Path) -> dict[str, list[dict[str, str]]]:
    xml = zipfile.ZipFile(docx).read("word/document.xml").decode("utf-8")
    body = xml.split("<w:body>", 1)[1]
    out: dict[str, list[dict[str, str]]] = {}
    day: str | None = None
    for block in re.findall(r"(<w:tbl>.*?</w:tbl>|<w:p[ >].*?</w:p>)", body, re.S):
        if block.startswith("<w:tbl>"):
            for tr in re.findall(r"<w:tr[ >].*?</w:tr>", block, re.S):
                cells = [text_of(tc) for tc in re.findall(r"<w:tc>.*?</w:tc>", tr, re.S)]
                if len(cells) >= 3 and cells[0] and cells[0] != "Esercizio":
                    if day is None:
                        raise ValueError("tabella trovata prima del nome del giorno")
                    out.setdefault(day, []).append({"esercizio": cells[0], "serie_rip": cells[1], "recupero": cells[2]})
        elif text_of(block) in DAYS:
            day = text_of(block)
    return out


def main() -> int:
    docx = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_DOCX
    try:
        data = extract(docx)
    except (OSError, KeyError, zipfile.BadZipFile, ValueError) as e:
        print(f"ERRORE: {docx} non leggibile: {e}", file=sys.stderr)
        return 1
    if set(data) != set(DAYS):
        print(f"ERRORE: giorni trovati {sorted(data)}, attesi {list(DAYS)}", file=sys.stderr)
        return 1
    payload = {"fonte": docx.name, "sha256": hashlib.sha256(docx.read_bytes()).hexdigest(), "giorni": data}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"scritto {OUT} · " + " · ".join(f"{d} {len(v)}" for d, v in data.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
