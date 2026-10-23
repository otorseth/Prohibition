#!/usr/bin/env python3
"""Lager en zip-fil som kan deles: én HTML-fil med all kode og stil, pluss bilder og musikk.

Bruk:  python3 tools/lag-zip.py <utmappe>
Lager <utmappe>/Forbudstid.zip med mappen Forbudstid/ inni.
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "build"
stage = out_dir / "Forbudstid"
if stage.exists():
    shutil.rmtree(stage)
stage.mkdir(parents=True)

html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "css" / "style.css").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + css + "</style>")
html = re.sub(
    r'<script src="(js/[^"]+)"></script>',
    lambda m: "<script>\n" + (root / m.group(1)).read_text(encoding="utf-8") + "</script>",
    html,
)
html = html.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
# Våpenlydene legges inn i HTML-fila, fordi nettleseren ikke kan hente lydfiler fra disk med fetch
import base64, json
lyd = {f.stem: "data:audio/mpeg;base64," + base64.b64encode(f.read_bytes()).decode() for f in sorted((root / "lyd").glob("*.mp3"))}
html = html.replace("<script>", "<script>window.LYD_DATA=" + json.dumps(lyd) + ";</script>\n<script>", 1)
assert 'src="js/' not in html and "css/style.css" not in html
(stage / "Forbudstid.html").write_text(html, encoding="utf-8")

shutil.copy(root / "musikk.mp3", stage / "musikk.mp3")
shutil.copytree(root / "img", stage / "img")
shutil.copytree(root / "video", stage / "video")
(stage / "LES-MEG.txt").write_text(
    """FORBUDSTID
==========
Turbasert mafiastrategi i 1920-tallets Lakeport.

Slik starter du:
1. Pakk ut hele zip-filen (ikke åpne filene direkte inne i zip-en).
2. Dobbeltklikk på Forbudstid.html. Spillet åpnes i nettleseren.
3. Mappene img og video og filen musikk.mp3 må ligge ved siden av Forbudstid.html.

Tips:
- Musikken starter når du klikker første gang i spillet.
- Spillet lagres automatisk i nettleseren du bruker.
- Trykk «Regler» øverst for å lese reglene.
- Med internett får spillet sine egne skrifttyper. Uten internett brukes vanlige skrifttyper, men alt virker.
""",
    encoding="utf-8",
)

zip_path = out_dir / "Forbudstid.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(stage.rglob("*")):
        z.write(f, f.relative_to(out_dir))
print("Skrev", zip_path)
