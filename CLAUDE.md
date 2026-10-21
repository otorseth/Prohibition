# Forbudstid – instruksjoner for videre arbeid

Turbasert mafiastrategi (inspirert av Chaos Overlord) som kjører rett i nettleseren.
Eieren koder ikke selv og bygger spillet med vibekoding, så hold svar korte og på norsk.

## Struktur
- `index.html` – markup og rekkefølgen skriptene lastes i
- `css/style.css` – all stil (mørk art-deco, farger som CSS-variabler øverst)
- `js/` – vanlige skript (ingen bygging/moduler). De deler globalt scope og lastes i denne rekkefølgen:
  `data` → `state` → `ai` → `turn` → `events` → `save` → `ui` → `city` → `fight-scene` → `audio` → `main`
  - `data.js` konstanter: kvartalstyper, bygninger (`BK`), våpen (`WEAP`), familier, hjelpefunksjoner
  - `state.js` spilltilstand `S` og `ui`, nytt spill, økonomi, påvirkning
  - `ai.js` datamotstanderne
  - `turn.js` turoppgjøret (flytt → angrep → ta kontroll → påvirk → innkreving/helbredelse → økonomi)
  - `events.js` hendelsesfeltet nederst
  - `save.js` lagring i `localStorage` og `migrate()` for gamle lagringer
  - `ui.js` toppfelt, kart-ruter, sidepanel, bandekort
  - `city.js` bykartet ovenfra (canvas)
  - `fight-scene.js` kampanimasjon, figurer og portretter
  - `audio.js` musikk og lydeffekter (Web Audio)
  - `main.js` klikk-håndtering og oppstart – må lastes sist
- `musikk.mp3` – bakgrunnsmusikk
- `tools/lag-artifact.py` – lager sidefilen som publiseres som Claude-artifact

## Regler for endringer
- All tekst i spillet er på norsk.
- Endres formatet på lagret spill (`S`), øk `S.v` i `newGame()` og legg til et steg i `migrate()` så pågående spill fungerer videre.
- Hold tallverdier (priser, styrke, inntekt) i `data.js`.
- Test etter endringer: `node --check js/*.js`, og spill noen runder i en hodeløs nettleser (Playwright/Chromium er installert) uten feil i konsollen.

## Wiki
`wiki/` inneholder spillerveiledning og regler (markdown, forside `wiki/README.md`).
Når regler eller tall endres, oppdater tilhørende wiki-side i samme commit.

## Publisere spillet
Spillet publiseres som artifact med `tools/lag-artifact.py <sidefil>` og disse filene ved siden av:
`css/style.css`, alle `js/*.js` og `musikk.mp3`.

## Git
Hver endring committes med en kort norsk beskrivelse og pushes til `main` på GitHub (`otorseth/Prohibition`).
