# Leistungsmappe: Art-Director-Review

Geprüft an einer Playwright-Bildfolge (Desktop 1440 × 900: geschlossen, Öffnen, Umblättern, alle Doppelseiten, Inhaltsverzeichnis-Sprung; Smartphone 390 px: Wischen durch die ersten Seiten) und am erzeugten PDF. Hinweis zur Messung: Der Testbrowser rechnet WebGL in Software (etwa 3,5 Bilder pro Sekunde). Zeiten aus der Bildfolge sind deshalb gedehnt; bewertet wurden Bildwirkung, Ablauf und Übergänge, nicht die Geschwindigkeit.

## Durchgang 1

Erster Eindruck: Die Szene trägt. Ruhiger heller Tisch, marineblaue Mappe, Seiten im Stil der Website. Der Wechsel von Textur zu echter HTML-Seite ist im Stand nicht zu sehen.

| Befund                                                                                                                 | Gewicht | Maßnahme                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| Die Kamera fuhr beim Öffnen **zurück** statt heran. Das geschlossene Buch füllte das Bild, die Deko war angeschnitten. | hoch    | Kamera neu: geschlossen der ganze Schreibtisch mit Deko, beim Öffnen weiche Fahrt an die Doppelseite. |
| Kaffeetasse, Schlüssel und Visitenkarte am Bildrand abgeschnitten.                                                     | hoch    | durch die neue Kamera vollständig im Bild, an natürlichen Plätzen.                                    |
| Logo auf dem Einband wirkte wie grauer Aufdruck, nicht geprägt.                                                        | mittel  | Blindprägung: Fläche bleibt Leinen (nur aufgehellt), Licht- und Schattenkante.                        |
| Kaum Perspektive, das Buch wirkte wie ein flaches Rechteck.                                                            | mittel  | Grundneigung 9° → 12°, die Buchstärke ist an der Unterkante sichtbar.                                 |
| Bewegungen hingen an der Bildrate: bei wenig Bildern pro Sekunde zog sich das Öffnen, die HTML-Seiten erschienen spät. | hoch    | Dämpfung zeitbasiert (gleiche Dauer bei 30, 60 und 120 Hz).                                           |
| Das Abfotografieren der Seiten (Texturen) lief auch während des Blätterns und belegte kurz den Hauptthread.            | hoch    | Fotografiert wird nur in Ruhephasen; Blättern und Öffnen bleiben ungestört.                           |
| HTML-Seiten erst nach geladenen Texturen sichtbar.                                                                     | mittel  | Die echten Seiten liegen auf, sobald die Doppelseite still liegt, unabhängig von den Texturen.        |
| Smartphone: Logo in der Kopfzeile auf null Breite, Buch zu hoch (lief unter den Hinweis).                              | hoch    | feste Logobreite; Buch passt sich der verfügbaren Höhe an.                                            |
| Smartphone: Haus-Symbol im Logo fehlte, sobald das erste Logo der Seite verborgen war (doppelte Verlaufs-IDs).         | mittel  | jedes Logo bekommt eigene Verlaufs-IDs (wirkt auf der ganzen Website).                                |
| Smartphone: leere Innenseite des Einbands kostete ein Tippen ohne Inhalt.                                              | niedrig | im Hochformat entfällt sie, nach dem Einband folgt direkt der Titel.                                  |
| „So läuft es ab“: Fußnote klebte an der Schrittliste.                                                                  | niedrig | mehr Abstand.                                                                                         |

## Durchgang 2

Nach den Korrekturen: Öffnen, Blättern und Sprung über das Inhaltsverzeichnis (Konditionen) laufen sauber. Gegengeprüft am PDF.

| Befund                                                                                                      | Gewicht | Maßnahme                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| PDF: Inhaltsverzeichnis leer (die Seite las die Kapitel aus dem Blätter-Kontext, den es im PDF nicht gibt). | hoch    | Kapitel kommen direkt aus der Seitenliste.                                                                                                |
| PDF und Blätter-Texturen: Schieberegler als blaue Standardpunkte ohne Spur.                                 | mittel  | Regler selbst gezeichnet (Spur, Füllung, eckiger Knopf); das Eingabefeld liegt unsichtbar darüber. HTML, Textur und PDF sehen gleich aus. |
| PDF: Hinweise wie „Fahren Sie über einen Punkt“ ergeben auf Papier keinen Sinn.                             | niedrig | im PDF ausgeblendet.                                                                                                                      |
| Oben links auf dem Tisch fehlt die Pflanze.                                                                 | mittel  | bewusst offen: ohne Foto nicht glaubwürdig nachzubauen. Siehe OFFENE-PUNKTE.md.                                                           |
| Smartphone: Fließtext der Seiten ist verkleinert klein.                                                     | mittel  | bewusst so belassen (gleiche Seiten wie am Desktop). „Als Text lesen“ und das PDF stehen direkt darunter.                                 |

## Messwerte

- Startseite Lighthouse mobil: Performance 93 bis 94 in drei Läufen (vorher 93), Barrierefreiheit, Best Practices und SEO je 100. Die 3D-Bausteine werden auf der Startseite nicht geladen.
- /leistungsmappe: Barrierefreiheit, Best Practices, SEO je 100. Performance 77 (mobil, flache Mappe mit Seitenbildern).
- Szene gesamt: 3D-Code 255 KB (gzip), Bilder und Video 1,1 MB. Deutlich unter 4 MB.

## Nachtrag: Navigationstest

Der Navigationstest fand auf /leistungsmappe am Desktop Links in der Fußzeile, die direkt nach dem Laden nicht reagierten. Ursache: Das Abfotografieren der Seiten belegte den Hauptthread auch dann, wenn die Bühne gar nicht im Bild war. Jetzt ruhen Rendern und Abfotografieren, solange die Bühne nicht sichtbar ist, und fotografiert wird nur in Leerlaufphasen des Browsers. Danach liefen alle 70 Seitenwechsel dieser Seite fehlerfrei. Der Test selbst überspringt das mobile Menü auf Seiten ohne Kopfzeile.

Abschluss-Screenshots: `docs/leistungsmappe/screens/`.
