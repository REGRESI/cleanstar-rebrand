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

Siehe Abschnitt „Messwerte“ und Bericht: nach dem Neubau erneut aufgenommen, keine neuen Befunde an den geänderten Stellen.

## Lizenzprüfung Luftbild (LGL Baden-Württemberg)

Nicht möglich: Die Seiten des LGL (www.lgl-bw.de, opengeodata.lgl-bw.de) und GovData waren aus der Arbeitsumgebung nicht erreichbar (vom Netzwerk gesperrt). Ohne geprüfte Lizenz gibt es laut Vorgabe keinen Luftbild-Umschalter; die Karte zeigt nur das Gelände. Sobald die Domains freigegeben sind, lässt sich die Prüfung nachholen.

## Quellen der Karte

- Höhendaten: Terrain Tiles (Mapzen/Tilezen, AWS Open Data; SRTM, EU-DEM © Copernicus u. a.), Terrarium-Kodierung, Zoom 7 bis 12, selbst gehostet (`public/map/gelaende.pmtiles`, 24 MB, per Bereichsabruf nur benötigte Kacheln)
- Landbedeckung, Gewässer, Straßen, Grenzen: OpenStreetMap über Overture Maps (ODbL), Zoom 7 bis 13 (`public/map/ortenau.pmtiles`, 48 MB)
- Attribution in der Karte: OpenStreetMap-Mitwirkende, Overture Maps, Terrain Tiles
