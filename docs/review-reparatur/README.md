# Finale Runde: Vergleich mit den Referenzen

Je Gegenüberstellung oben die Referenzfolge (`docs/referenzen/`), darunter die eigene Folge bei 1440 px und 390 px
(Playwright, Software-Rendering, Scrollschritte wie in der Referenz). Bewertet nach: Timing, Ruhe, nie ein leerer
Bildschirm, keine Überschneidung, Inhalt sofort da.

| Variante | Bild | Ort |
| --- | --- | --- |
| A Kreis mit Titel | `vergleich-kreis-mit-titel.jpg` | Startseite nach dem Hero, Über uns vor dem Brief |
| B Pflanzen-Abschnitt | `vergleich-pflanzen.jpg` | Startseite nach den Ärgernissen, Qualitätsgarantie |
| C Horizontal-Scroll | `vergleich-horizontal-scroll.jpg` | Startseite, Leistungen |
| D Wolken | `vergleich-wolken.jpg` | Startseite vor dem Einzugsgebiet, Seite Einzugsgebiet am Anfang |
| E Bild zu Streifen, Footer | `vergleich-seitenende.jpg` | alle Seiten |
| Moment-Schrift | `vergleich-moment-schrift.jpg` | Startseite (A, B, D), Über uns, Qualitätsgarantie |
| Button-Roll | `vergleich-button-roll.jpg` | alle Buttons, Menüpunkte, Text-Links |
| „1“-Siegel | `vergleich-siegel.jpg` | Abschluss, Ablauf, Konfigurator |

## Durchgang 1

| Stelle | Befund | Behebung |
| --- | --- | --- |
| A, Übergang vom Hero | Zwei Bilder rutschten übereinander: Der Abschnitt schob sich schon über den noch gepinnten Hero | Bühne liegt genau auf dem Hero-Ende (gleiches Bild, gleiche Lage) und wird erst sichtbar, wenn sie dort steht |
| A, Fläche um den Kreis | Abschnitt hatte eine eigene Hintergrundfarbe und deckte den Hero ab | Nur der Kreis selbst trägt die Fläche, er legt den echten Inhalt frei |
| Moment-Schrift | Schreibschrift-Buchstabe stand allein in einer Zeile bzw. war unsichtbar (Maske mit Höhe 0) | Großbuchstabe und erstes Wort untrennbar, Maske in festen Maßen, Folgezeilen eingerückt, damit der Schwung darunter greift |
| Moment-Schrift | Während des Erscheinens kurz gelbe und rote Buchstaben (Browser überblendet einen berechneten Farbmix falsch) | Ruhefarbe je Buchstabe als feste Farbe, Leuchten über Textschein statt Helligkeitsfilter |
| Hero, Prüfpunkte | Beschriftungen lagen übereinander und unter Haken-Kreisen | Auf dem Bild nur Nummern; die Aufgaben als Liste links (Desktop) bzw. die aktuelle Aufgabe unter dem Satz (Handy) |
| „1“-Siegel | Ringtext mit Lücke bzw. ohne Abstand an der Naht | natürliche Textbreite gemessen, Abstand auf alle Zwischenräume einschließlich Naht verteilt |
| Seitenende | Auf dem Handy folgten zwei sehr ähnliche Büro-Fotos direkt aufeinander (Abschluss und Streifen) | Streifen zeigt das Team bei der Arbeit |

## Durchgang 2

| Stelle | Befund |
| --- | --- |
| A | Bild des Hero-Endes, Kreis steigt mit Titel und Kantensatz, Titel rutscht an seinen Platz, Satz und versetzte Bilder folgen. Kein leerer Bildschirm, nichts angeschnitten. Wie Referenz era/07. |
| B | Ruhige Fläche, mittige Moment-Überschrift, Pflanzen bewegen sich gegenläufig. Abweichung: Die Pflanze ist ein Topf von oben (Platzhalter), die Referenz zeigt freigestellte Blüten. Eck-Pflanzen stehen in OFFENE-PUNKTE.md. |
| C | Titel gleitet herein, Fotos kommen von rechts und wachsen, Fortschrittslinie mit 01 / 06. Auf dem Handy eine Leistung je Breite, flüssig im Test, daher kein Ersatz durch Wischen nötig. |
| D | Wolken lösen sich über dem Bild der Region auf, danach die Moment-Überschrift und die Orte mit Fahrzeit. Eine Orte-Linie (Höhenprofil) wie bei der Referenz gab es noch nicht; es bleibt die bestehende Darstellung. |
| E | Bild steht, der Navy-Footer schiebt sich hoch, oben bleibt ein Streifen. Große Telefonnummer mittig, Slogan aus Partikeln in mittlerer Größe, Spalten kompakt. |
| Moment-Schrift | Erscheint aus Schlieren, scharf, Farbe läuft von Himmelblau zu Navy-Blau. Auf 360 px wird kein Schwung abgeschnitten. |
| Button-Roll | Buchstaben rollen gestaffelt, Breite und Höhe bleiben fest, keine Streckung, keine Unschärfe. |
| Siegel | Ring geschlossen, gleichmäßig gesperrt, dreht langsam, hält beim Überfahren. Klein (Abschluss) nur Kreis mit „1“. |

## Übergangs-Test

`scripts/test-transitions.mjs`, 80-px-Schritte, Desktop 1440 × 900 und Handy 390 × 844, Startseite und zehn
Hauptseiten. Ergebnis siehe Bericht; Fehlerbilder landen in `fehler/` (leer, wenn alles grün ist).

Hinweise zur Messung: Text in eingeklappten Aufklappern und Text unter einer stehenden Bildfläche mit eigenem
Hintergrund (Prüfpunkt-Ansicht auf dem Handy) wird nicht gezeichnet bzw. ist verdeckt und zählt daher nicht.
