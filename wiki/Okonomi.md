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
Går kassen under null, forlater den dyreste banden familien, til kassen er i balanse.
