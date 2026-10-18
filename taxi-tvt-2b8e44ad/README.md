# TVT-quiz Krijger: een nieuwe vragenset toevoegen

De app (`index.html`) laadt bij het openen `questions.json`, die naast de app staat.
Je voegt een nieuwe set toe door alleen `questions.json` aan te passen. De app hoeft niet opnieuw gebouwd te worden.

## Stappen
1. Open `questions.json`.
2. Voeg aan het einde van de lijst `"sets"` een nieuw object toe:
```json
{ "id": "set-02", "naam": "Set 2 – extra Rennen-casussen", "datum": "2026-11-01",
  "vragen": [ { ...vraag... }, { ...vraag... } ] }
```
3. Geef elke vraag een **uniek** `id`, bijvoorbeeld `s2-t3-r01` (set 2, tak 3, rennen, nr 01). Gebruik bestaande id's nooit opnieuw, want de voortgang hangt aan het id.
4. Pas `"bijgewerkt"` aan, en commit en push. Binnen ±1 minuut staat de nieuwe set live (GitHub Pages).
   De melding "Bank op" verdwijnt dan vanzelf, omdat er nieuwe, nog niet geziene vragen zijn.

## Velden van een vraag
| veld | verplicht | betekenis |
|---|---|---|
| `id` | ja | uniek, bv. `s2-t1-l07` |
| `tak` | ja | 1 Papieren & BCT/CDT · 2 Verkeer · 3 Werktijden · 4 Rit & route · 5 Ongeval · 6 Passagiers · 7 Conflict |
| `niveau` | ja | `kruipen` · `lopen` · `rennen` |
| `et` | ja | CBR-eindterm, bv. `"ET 2.5"` |
| `type` | ja | `mc` · `multi` · `num` · `order` |
| `q` | ja | vraagtekst |
| `opts` | ja | antwoordopties (bij `num` weglaten; bij `order` in de **juiste volgorde**, de app schudt ze zelf) |
| `ok` | ja | `mc`: index (0 = eerste optie) · `multi`: lijst van indexen · `num`: getal · `order`: `[0,1,2,…]` |
| `why` | ja | uitleg van het goede antwoord |
| `wrong` | aanbevolen | per optie waarom die fout is (eliminatie-check). Zelfde lengte als `opts`; bij de goede optie `""` |
| `bron` | ja | bron, bv. `"Arbeidstijdenbesluit vervoer art. 2.5:1"` (geen verzonnen getallen!) |
| `hint`, `simpel`, `kern` | optioneel | alleen voor Kruipen: hint, makkelijker geformuleerde vraag, en `kern` (woorden die gemarkeerd worden) |
| `unit` | optioneel | eenheid bij `num`, bv. `"uur"` |

## Let op
- Na het pushen geldt alleen `questions.json`. In `index.html` zit nog een kopie van set 1, die de app alleen gebruikt als het bestand niet geladen kan worden (offline of `file://`).
- Controleer de JSON vóór je pusht: `python3 -m json.tool questions.json > /dev/null`.
- Voeg `takken` of `examen` alleen toe als die ook echt veranderen.
- Deze pagina staat bewust nergens gelinkt en heeft `noindex`.

## Hoofdrekenen (set-reken-01)
- Tab **🧮 Rekenen**: 50 ritprijssommen (Kruipen 15 · Lopen 20 · Rennen 15), timer 60 / 45 / 30 s per som, goed binnen ± € 0,01 (komma of punt mag). Foute sommen gaan in de gewone foutenbak.
- Extra velden per som: `reken: true` (houdt de som uit gewone rondes en het TVT-examen), `kort` (rekentruc, getoond na antwoorden), `inputs` (invoer). `unit` is `€`, `km` of `min`.
- Bron tarieven: Regeling maximumtarief taxivervoer art. 1a, tarieven 2026 (Stcrt. 2025, 41618). Bij nieuwe tarieven (1 jan) de sommen opnieuw genereren.
