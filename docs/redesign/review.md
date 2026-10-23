# Art-Director-Review Redesign

Grundlage: Ganzseiten-Screenshots auf 1440 px und 390 px von Start, Leistungen, Büroreinigung, Qualitätsgarantie, Ablauf, Über uns, Kontakt, Einzugsgebiet sowie auf 1440 px von FAQ, Partner, Ratgeber, Fakten, Impressum, Karriere, Angebot, Reinigungs-Check, Angebots-Vergleich, Standortseite Kehl, Styleguide und 404.

## Durchgang 1

| Nr. | Seite | Befund | Maßnahme | Status |
| --- | --- | --- | --- | --- |
| 1 | Start, Hero | Die Mono-Zeile „Büroreinigung in Offenburg und im Ortenaukreis“ steht mit 80 % Deckkraft auf dem Foto und ist kaum lesbar. | Volle Deckkraft, 14 px mobil und 15 px ab Desktop. | behoben |
| 2 | Start, Abschluss | Das Label im Abschlussblock zeigte noch die alte Formulierung. | Label „Der erste Schritt“ aus `site.ts`, neu gebaut. | behoben |
| 3 | Unterseiten ohne Hero-Bild (Über uns, Leistungen, FAQ, Fakten, 404) | Zwischen Einleitung und erster Sektion entsteht ein Loch von etwa 250 px, weil der Hero unten und die Folgesektion oben polstern. Wirkt wie ein fehlendes Bild. | Hero ohne Bild nur noch mit kleinem Abschluss, den Abstand übernimmt die Folgesektion. | behoben |
| 4 | FAQ | Nach Punkt 3 lag die Liste zu dicht an der Einleitung, weil die Sektion oben keinen Abstand hatte. | Eigener oberer Abstand für die Fragenliste. | behoben |
| 5 | Karriere, Kurzbewerbung | Überschrift „In 2 Minuten beworben.“ in der schmalen 4-Spalten-Zone in H2-Größe, das Wort „beworben“ läuft aus dem Bild. | Gleiche Größe wie die anderen Überschriften in schmalen Spalten (H3). | behoben |
| 6 | Über uns, Gründer | Im Ganzseiten-Screenshot fehlten zwei Porträts und das Zitatbild. | Geprüft mit gezieltem Scrollen: Die Bilder laden und decken sich korrekt auf, es war nur das Lazy Loading im Screenshot. | kein Fehler |
| 7 | Büroreinigung, Vorher/Nachher | Im Screenshot leer. | Gleiche Ursache wie Nr. 6, Regler geprüft. | kein Fehler |
| 8 | Footer | Das große Logo steht farbig auf dem hellen Grund und ist der einzige große Farbfleck außer dem Button. | Bewusst so gelassen: Das Logo bleibt unverändert, eine einfarbige Variante wäre ein Eingriff ins Markenzeichen. | Entscheidung |
| 9 | Alle Seiten mobil | Die feste Leiste unten (Anrufen, Rückruf, Angebot) erscheint im Ganzseiten-Screenshot mitten im Bild. | Darstellungsartefakt des Screenshots, im Browser korrekt unten fixiert. | kein Fehler |
| 10 | Einzugsgebiet | Karte ohne Leuchten, nur Tinte und Blau, Ortsliste mit Mono-Fahrzeiten. Ortsnamen der kleinen Orte erst beim Überfahren. | Passt zum Konzept, keine Änderung. | in Ordnung |
| 11 | Qualitätsgarantie | Fortschritt „00 / 08“ und Nummerierung sitzen, Reklamationsablauf dunkel abgesetzt. | Keine Änderung. | in Ordnung |
| 12 | Ablauf | Große Ziffern mit Linie statt Slider, Wechsel-Rechner eingebettet. | Keine Änderung. | in Ordnung |
