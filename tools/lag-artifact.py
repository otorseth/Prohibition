#!/usr/bin/env python3
"""Lager sidefilen som publiseres som Claude-artifact.

Artifact-siden får sin egen <html>/<head>/<body>-ramme ved publisering, så den
publiserte filen skal bare inneholde tittel, meta-tagger, lenker og innholdet i
<body>. Skriptet henter dette fra index.html. CSS-, JS- og lydfilene publiseres
som egne filer ved siden av siden.

Bruk:  python3 tools/lag-artifact.py <utfil>
"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")

head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)

# Rammen legger selv til charset og viewport, så de hoppes over her
head_lines = [
    line for line in head.strip().splitlines()
    if 'charset=' not in line and 'name="viewport"' not in line
]

out = "\n".join(head_lines) + "\n" + body.strip() + "\n"
target = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "build" / "artifact.html"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(out, encoding="utf-8")
print(f"Skrev {target}")
