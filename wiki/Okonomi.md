# Økonomi

[← Tilbake til forsiden](README.md)

Alle familier starter med **$60**. Hver måned skjer dette:

**Netto = inntekt − lønn**

## Inntekt
For hvert kvartal du eier:
- grunninntekten for kvartalstypen (se [Kartet](Kartet.md))
- + $1 hvis din lokale støtte er 4 eller mer
- + ekstra inntekt fra hver bygning som betaler deg (se [Bygninger og påvirkning](Bygninger-og-pavirkning.md))

## Lønn
Hver bande koster (muskler + innflytelse) ÷ 3, rundet opp, × 2 per måned.
Lønnsfaktoren styres av `PRIS.lonn` (nå 2) i `js/data.js`.

## Innkreving
Ordren **Kreve inn** gir straks penger:
- I eget kvartal: kvartalets grunninntekt + bandens innflytelse. Koster 1 lokal støtte.
- I en rivals kvartal: samme beløp tas fra rivalens kasse (så langt kassen rekker). Rivalen mister 1 støtte.

## Tom kasse
Går kassen under null etter at lønna er trukket, forlater den dyreste banden familien **uten å få lønn**. Lønna dens trekkes
derfor ikke. Dette gjentas til kassen er i balanse. Derfor kan kassen falle mindre enn netto skulle tilsi.

## Slik ser du økonomien
- **Forventet netto** øverst = inntekt + forventet innkreving − lønn.
- Kan ikke kassen dekke lønna, vises en rød advarsel øverst med antall bander som vil stikke.
- Trykk på *Kasse* eller *Forventet netto* for å se regnskapet: prognose for neste måned og hva som faktisk skjedde forrige
  måned (innleie, våpen, inntekt, innkreving, penger presset ut av rivaler, lønn og bander som stakk).
