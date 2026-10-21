#!/usr/bin/env python3
"""Kopierer sidene i wiki/ til en utsjekket GitHub-wiki.

Wiki-fanen bruker lenker uten .md, og forsiden heter Home. Skriptet gjør om
lenkene og lager en sidemeny (_Sidebar.md).

Bruk:  python3 tools/synk-wiki.py <mappe med utsjekket wiki>
"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "wiki"
dst = Path(sys.argv[1])
repo_url = "https://github.com/otorseth/Prohibition"

for old in dst.glob("*.md"):
    old.unlink()

names = []
for f in sorted(src.glob("*.md")):
    t = f.read_text(encoding="utf-8")
    t = t.replace("](README.md)", "](Home)")
    t = re.sub(r"\]\(([A-Za-z\-]+)\.md\)", r"](\1)", t)
    t = t.replace("](../CLAUDE.md)", f"]({repo_url}/blob/main/CLAUDE.md)")
    t = t.replace("[← Tilbake til forsiden](Home)\n\n", "")
    out = "Home.md" if f.name == "README.md" else f.name
    (dst / out).write_text(t, encoding="utf-8")
    names.append(out)

# Sidemenyen følger rekkefølgen på forsiden
home = (src / "README.md").read_text(encoding="utf-8")
links = re.findall(r"\[([^\]]+)\]\(([A-Za-z\-]+)\.md\)", home)
lines = ["**[Forbudstid](Home)**", ""] + [f"- [{text}]({page})" for text, page in links]
lines += ["", f"[Spillets kode på GitHub]({repo_url})"]
(dst / "_Sidebar.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Kopierte", len(names), "sider")
