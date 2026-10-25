# Scroll-Stopper: Art-Director-Review

Je Seite höchstens ein Scroll-Stopper. Alle nutzen dieselbe Technik (`src/lib/scrollScene.ts`): Der Abschnitt bleibt per CSS sticky stehen, der Fortschritt folgt der Scrollposition (ScrollTrigger mit scrub 0,6). Übergänge laufen mit der Bewegungskurve der Website (`--ease-cs`). Ohne JavaScript oder bei reduzierter Bewegung zeigt das CSS sofort den Endzustand. Auf Bildschirmen unter 620 px Höhe steht der Abschnitt nicht, sondern läuft beim Durchscrollen ab. Der Text steht immer vollständig im HTML.

| Seite             | Mechanik                                                                                         | Scrollweg Desktop / Handy |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------- |
| Startseite        | Scroll-Text färbt sich Wort für Wort, Bildkacheln im Text                                        | 230 / 160 svh             |
| Leistungen        | „Der Wisch“: Abzieher legt das Foto hinter beschlagenem Glas frei                                | 170 / 110 svh             |
| Ablauf            | „Die Nacht-Uhr“: Uhr läuft von 18:00 bis 7:00, Foto und Zeile wechseln synchron (Beispielablauf) | 230 / 150 svh             |
| Qualitätsgarantie | Acht Haken zeichnen sich nacheinander, Zähler läuft mit, am Ende landet das Siegel „Geprüft“     | 230 / 170 svh             |
| Über uns          | Gründerporträts rücken zusammen, darunter färbt sich die Aussage Wort für Wort                   | 170 / 120 svh             |

Einzugsgebiet, Kontakt, Angebot, Formulare, Impressum und Datenschutz: kein Scroll-Stopper.

## Befunde und Maßnahmen

| Befund                                                                                                               | Maßnahme                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startseite: Satzzeichen nach einem Bild konnte allein in die nächste Zeile rutschen („Schlüssel [Bild]“ / „,“).      | Wort davor, Bild und Satzzeichen stehen in einem gemeinsamen, nicht umbrechenden Span. Geprüft auf 320, 375, 390, 1440 und 1920 px.                        |
| Qualitätsgarantie: Die bisherige Liste mit Zähler und klebender Fortschrittszeile hätte den neuen Effekt verdoppelt. | Umgebaut statt ergänzt: eine gepinnte Liste mit Haken, Zähler und Siegel. Die Funkel-Sterne je Punkt sind entfallen, es funkelt nur noch einmal am Siegel. |
| Qualitätsgarantie, Handy: Liste, Erläuterung und Siegel waren höher als der Bildschirm (793 px bei 664 px).          | Zeilen enger, Überschrift kleiner. Jetzt 664 px bei 390 × 664.                                                                                             |
| Nacht-Uhr, Handy: 719 px bei 664 px.                                                                                 | Uhr kleiner, Foto flacher, auf dem Handy steht nur die aktuelle Zeile (alle liegen übereinander).                                                          |
| Nacht-Uhr: Noch nicht erreichte Zeilen waren zu blass zum Mitlesen.                                                  | Grundhelligkeit angehoben.                                                                                                                                 |
| Über uns: Porträts und Gründerkarten zeigten dieselben Bilder zweimal untereinander.                                 | Porträts nur noch im Scroll-Stopper, die Karten darunter sind reine Textkarten.                                                                            |
| Leistungen und Ablauf: Je ein Bildband (Parallax) stand an derselben Stelle.                                         | Durch den Scroll-Stopper ersetzt, damit die Seite nicht überladen wirkt.                                                                                   |

## Gesamteindruck

Jede Seite hat genau eine Stelle, an der sie innehält. Die übrigen Effekte bleiben leise (Einblenden, Linien). Die Abläufe sind langsam genug zum Mitlesen. Wer zügig scrollt, verpasst nichts: Der Endzustand ist nach dem Abschnitt immer vollständig sichtbar.
