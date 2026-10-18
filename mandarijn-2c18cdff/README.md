# Mandarijn · Krijger (Chinees-LVS-stijl)

Quiz-app voor Mandarijn op basis van Easy Steps to Chinese 1 (轻松学中文) + KINETIX-materiaal.
Zelfde motor als de TVT-quiz (Kruipen/Lopen/Rennen, foutenbak +1/+3/+7/+14 dagen, proeftoets, Leren met 8 vormen, "bank op → nieuwe set"),
in de layout van Chinees-LVS (donker, terracotta, Noto Serif SC, kaarten, zijbalk op desktop, onderbalk op mobiel). Leerlingkiezer: Krijger, Lotus, Tijger, Ster, Welp (eigen voortgang per leerling, alleen lokaal in de browser).

## Nieuwe set toevoegen
Alleen `questions.json` aanpassen: voeg aan `"sets"` een object toe `{ "id": "set-02", "naam": "...", "datum": "JJJJ-MM-DD", "vragen": [ ... ] }`.
Elke vraag een uniek `id` (voortgang hangt aan het id). Daarna commit + push; GitHub Pages zet het binnen ±1 minuut live.

## Velden van een vraag
| veld | betekenis |
|---|---|
| `id` | uniek |
| `tak` | 1 Betekenis · 2 Klank · 3 Schrift · 4 Streken · 5 Zinnen · 6 Grammatica |
| `niveau` | `kruipen` · `lopen` · `rennen` |
| `type` | `mc` · `num` · `order` |
| `q` | vraagtekst · `hz` groot teken/zin · `py` + `pyt` pinyin (alleen zichtbaar bij Kruipen en in de uitleg) |
| `opts`, `ok` | opties en index van het goede antwoord (`order`: opties in de goede volgorde, `ok` = [0,1,…], `alt` = andere goede volgordes als tekst) |
| `optPy` | pinyin onder hanzi-opties (alleen Kruipen) |
| `svg` | `{c, hl}`: opties als streek-plaatjes (Make Me a Hanzi-data in `streken`) |
| `why`, `wrong`, `bron`, `et`, `les` | uitleg, eliminatie-check per optie, bron, onderwerp, les |
| `hint`, `pic`, `strokeHint`, `say` | Kruipen-hulp: hint, plaatje, genummerde streken, uitspraak (browser-spraak zh-CN) |

Build-bron: `/workspace/mandarijn-build/` op de box (`gen.py`, `content.py`, `template.html`). Pagina staat nergens gelinkt en heeft `noindex`.
