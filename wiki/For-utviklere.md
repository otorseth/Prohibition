# For utviklere

[← Tilbake til forsiden](README.md)

Spillet er ren HTML, CSS og JavaScript uten byggesteg. Åpne `index.html` i en nettleser.
Se også [`CLAUDE.md`](../CLAUDE.md), som AI-verktøy leser automatisk.

## Filer
| Fil | Innhold |
|---|---|
| `index.html` | Markup og rekkefølgen skriptene lastes i |
| `css/style.css` | All stil |
| `js/data.js` | Tall og tabeller: kvartalstyper, bygninger, våpen, prisfaktorer |
| `js/state.js` | Spilltilstanden, nytt spill, økonomi, tåke |
| `js/ai.js` | Datamotstanderne |
| `js/turn.js` | Turoppgjøret |
| `js/events.js` | Hendelsesfeltet |
| `js/save.js` | Lagring og oppgradering av gamle lagringer |
| `js/ui.js` | Toppfelt, kart-ruter og sidepanel |
| `js/city.js` | Bykartet ovenfra |
| `js/fight-scene.js` | Kampscene, figurer og portretter |
| `js/audio.js` | Musikk og lydeffekter |
| `js/main.js` | Klikk og oppstart, lastes sist |
| `tools/lag-artifact.py` | Lager siden som publiseres som Claude-artifact |

## Lagring
Spillet lagres automatisk i nettleseren (`localStorage`). Lagringsformatet har et versjonsnummer `S.v`.
Endres formatet, økes nummeret og `migrate()` i `save.js` får et nytt steg, slik at pågående spill virker videre.

| Versjon | Endring |
|---|---|
| 2 | Bander uten ordre skilles fra *Hel* |
| 3 | Helse doblet til 20 |
| 4 | Tre hovedtyper kvartaler med bygninger |
| 5 | Tåke over kartet |

## Justere balansen
De fleste tallene ligger i `js/data.js`: inntekt og motstand (`TYPES`), bygninger (`BK`), våpen (`WEAP`) og
prisfaktorene `PRIS.vapen` og `PRIS.lonn`. Husk å oppdatere wikien når tallene endres.
