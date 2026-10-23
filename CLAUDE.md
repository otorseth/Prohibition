# Forbudstid – instruksjoner for videre arbeid

Turbasert mafiastrategi (inspirert av Chaos Overlord) som kjører rett i nettleseren.
Eieren koder ikke selv og bygger spillet med vibekoding, så hold svar korte og på norsk.

## Struktur
- `index.html` – markup og rekkefølgen skriptene lastes i
- `css/style.css` – all stil (mørk art-deco, farger som CSS-variabler øverst)
- `js/` – vanlige skript (ingen bygging/moduler). De deler globalt scope og lastes i denne rekkefølgen:
  `data` → `state` → `ai` → `turn` → `events` → `save` → `ui` → `city` → `fight-scene` → `audio` → `ending` → `main`
  - `data.js` konstanter: kvartalstyper, bygninger (`BK`), våpen (`WEAP`), familier, hjelpefunksjoner
  - `state.js` spilltilstand `S` og `ui`, nytt spill, økonomi, påvirkning, sjefens navn (`S.boss`, `bossName()`; kallenavn i `BOSSNICK` i `data.js`)
  - `ai.js` datamotstanderne
  - `turn.js` turoppgjøret (flytt → angrep → ta kontroll → påvirk → innkreving/helbredelse → økonomi)
  - `events.js` rundens hendelser: pop-up etter hver tur (listen ligger også i Rapport)
  - `save.js` lagring i `localStorage` og `migrate()` for gamle lagringer
  - `ui.js` toppfelt, kart-ruter, sidepanel, bandekort
  - `city.js` bykartet ovenfra (canvas)
  - `fight-scene.js` kampanimasjon (bakgrunner, riggede figurer med invers kinematikk, effekter) og portretter
  - `audio.js` musikk og lydeffekter (Web Audio)
  - `ending.js` avslutning: video (seier eller tap) og avisforside med statistikk; ved tap en dødsannonse (`S.st`). Forhåndsvis med `#seier` eller `#tap` i adressen
  - `main.js` klikk-håndtering og oppstart – må lastes sist
- `img/tiles/` – Noir-bilder av kvartalene (ett per type, laget i Midjourney, 320×320 JPG)
- `img/bld/` – Noir-portretter av hver bygningstype, filnavn = nøkkelen i `BK` (192×192 JPG)
- `img/bg/` – kampbakgrunner sett fra siden, én per kvartalstype (1280 bred JPG). Bakkelinjen per bilde står i `BG_GROUND` i `fight-scene.js`
- `video/seier.*` og `video/tap.*` (webm + mp4) – videoer (Midjourney, uten lyd) som spilles før avisforsiden
- `img/fig/*.png` – utklippsfigurer i kampene (Midjourney, Muybridge-stil, ser mot høyre): `gangster`, `sjef`, `frakk`. Ledd og klippeformer står i `FIGV` i `fight-scene.js`; varianter låner bein fra `gangster`. Bakgrunn fjernet med `rembg`
- `img/grav.jpg` – gravsteinsbildet i dødsannonsen
- `musikk.mp3` – bakgrunnsmusikk
- `tools/lag-artifact.py` – lager sidefilen som publiseres som Claude-artifact

## Regler for endringer
- All tekst i spillet er på norsk.
- Endres formatet på lagret spill (`S`), øk `S.v` i `newGame()` og legg til et steg i `migrate()` så pågående spill fungerer videre.
- Hold tallverdier (priser, styrke, inntekt) i `data.js`.
- Test etter endringer: `node --check js/*.js`, og spill noen runder i en hodeløs nettleser (Playwright/Chromium er installert) uten feil i konsollen.

## Wiki
`wiki/` inneholder spillerveiledning og regler (markdown, forside `wiki/README.md`). En GitHub-jobb (`.github/workflows/wiki.yml` + `tools/synk-wiki.py`) kopierer den automatisk til Wiki-fanen ved push til `main`.
Når regler eller tall endres, oppdater tilhørende wiki-side i samme commit.

## Publisere spillet
Spillet publiseres som artifact med `tools/lag-artifact.py <sidefil>` og disse filene ved siden av:
`css/style.css`, alle `js/*.js`, `img/tiles/*.jpg`, `img/bld/*.jpg`, `img/bg/*.jpg`, `img/fig/*.png`, `img/grav.jpg`, `video/*.webm`, `video/*.mp4` og `musikk.mp3`.

## Git
Hver endring committes med en kort norsk beskrivelse og pushes til `main` på GitHub (`otorseth/Prohibition`).

## Dele spillet som zip
`python3 tools/lag-zip.py <utmappe>` lager `Forbudstid.zip` med én samlet HTML-fil, `img/` og `musikk.mp3`.
