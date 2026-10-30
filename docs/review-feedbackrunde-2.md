# Review Feedback-Runde 2

Art-Director-Durchgang über alle geänderten Stellen bei 1440 × 900 und 390 × 844: Footer und Abschluss, Menü, Einzugsgebiet, Text-Effekte, Siegel, Gründer, Abstände. Zusätzlich automatisch geprüft: Abfolge heller und dunkler Abschnitte vor dem Footer auf 19 Seiten.

## Durchgang 1

| Stelle | Befund | Behebung |
| --- | --- | --- |
| Footer-Slogan (Partikel) | Formung sauber, Schrift deckungsgleich mit dem echten Text, Übergang ohne Sprung. Wirkte bei 3.200 Partikeln etwas licht | Desktop 4.200, schwache Geräte 2.200, Handy 1.700, schwache Handys 1.000 |
| Startseite: Werkzeuge-Zeile | Klebte nach dem nun dunklen Mappen-Abschnitt direkt an der Kante | eigener Abstand oben und unten (wie ein knapper Abschnitt) |
| Abschluss über dem Footer | auf allen Seiten jetzt hell, Footer Navy, klarer Wechsel | Partner: dunkler Abschluss, dann ein schmaler heller Streifen mit Rechtshinweis, dann Footer. Wirkte wie ein Sandwich; Abschluss hell, Hinweis in den Abschluss verlegt, „Auf einen Blick“ davor dunkel |
| Rhythmus vor dem Abschluss | Seiten mit drei hellen Abschnitten in Folge (Ortsseiten, Büroreinigung Offenburg, Über uns, Leistungen, Büroreinigung, Ratgeber) | je ein Abschnitt davor auf Navy: „Auf einen Blick“ bzw. „Das ist immer dabei“, „In Ihrer Nähe“, „Rechner und Werkzeuge“; Startseite: Leistungsmappe |
| Menü-Button (Handy) | „Schließen“ abgeschnitten („Schlie“) | beide Wörter in derselben Rasterzelle, Breite des längeren Worts |
| Mega-Menü | Unterstrich, Fotowechsel, gestaffeltes Einblenden, Escape mit Fokus zurück: in Ordnung | – |
| Vollbild-Menü | Kreis öffnet aus dem Button, Färbe-Effekt beim Antippen sichtbar, Fokus bleibt im Menü (20 × Tab geprüft), Escape gibt Fokus an den Button zurück, Seite gesperrt, Seitenwechsel landet oben | – |
| Qualitätsgarantie | drei Text-Effekte (Kernsatz, Wisch-Zeilen, gefärbte Reklamations-Überschrift) | Färbung der Reklamations-Überschrift entfernt (höchstens zwei je Seite) |
| Einzugsgebiet | Relief, Wald, Felder und Rheinebene klar erkennbar, Vogelflug in Kurve über das Gelände | – |
| Abstand über „Kurz beantwortet“ (Startseite) | vorher 4 bis 5 rem, jetzt wie zwischen allen Abschnitten (6 bis 12 rem je nach Breite); ebenso Einzugsgebiet und Partner | – |

## Durchgang 2

Nach dem Neubau erneut aufgenommen (1440 und 390 px). Neue Befunde:

| Stelle | Befund | Behebung |
| --- | --- | --- |
| Partner | dunkler Abschluss, darunter schmaler heller Streifen mit Rechtshinweis, dann Navy-Footer | Abschluss hell, Hinweis darin, „Auf einen Blick“ davor auf Navy |
| Einzugsgebiet auf Geräten ohne Grafikhardware | 3D-Gelände zu langsam, Seitenwechsel nach dem Vogelflug verzögert | dort nur Schummerung, 3D-Gelände bleibt auf allen Geräten mit Grafikhardware |
| Zurück/Vor unter Last | Position einer Seite konnte im kurzen Moment zwischen Adresswechsel und Seitenaufbau unter dem falschen Verlaufseintrag gespeichert werden | Positionen werden nur gespeichert, wenn Verlauf und angezeigte Seite übereinstimmen |
| Startseite Lighthouse | in einem von zwei Läufen CLS 0,104: Hero-Text sprang, wenn die Webschrift nach dem ersten Bild kam | Ersatzschrift mit angeglichenen Maßen (size-adjust und Höhen aus den echten Metriken von Instrument Sans) |

## Messwerte

- Navigationstest: 5284 von 5284 Prüfungen bestanden (alle Seiten der Sitemap, Desktop und Handy)
- Mappen-Test: Desktop 80 von 80, Handy 67 von 67 (zweimal; ein einzelner Wisch-Aussetzer in einem dritten Lauf, ohne Änderung an der Mappe)
- Neuladen-Test: 40 von 40
- Lighthouse mobil Startseite: 91, 92, 91 (CLS 0 in allen drei Läufen), Barrierefreiheit, Best Practices, SEO je 100
- Lighthouse mobil Einzugsgebiet: 93 und 94, Rest je 100

## Lizenzprüfung Luftbild (LGL Baden-Württemberg)

Nicht möglich: Die Seiten des LGL (www.lgl-bw.de, opengeodata.lgl-bw.de) und GovData waren aus der Arbeitsumgebung nicht erreichbar (vom Netzwerk gesperrt). Ohne geprüfte Lizenz gibt es laut Vorgabe keinen Luftbild-Umschalter; die Karte zeigt nur das Gelände. Sobald die Domains freigegeben sind, lässt sich die Prüfung nachholen.

## Quellen der Karte

- Höhendaten: Terrain Tiles (Mapzen/Tilezen, AWS Open Data; SRTM, EU-DEM © Copernicus u. a.), Terrarium-Kodierung, Zoom 7 bis 12, selbst gehostet (`public/map/gelaende.pmtiles`, 24 MB, per Bereichsabruf nur benötigte Kacheln)
- Landbedeckung, Gewässer, Straßen, Grenzen: OpenStreetMap über Overture Maps (ODbL), Zoom 7 bis 13 (`public/map/ortenau.pmtiles`, 48 MB)
- Attribution in der Karte: OpenStreetMap-Mitwirkende, Overture Maps, Terrain Tiles
