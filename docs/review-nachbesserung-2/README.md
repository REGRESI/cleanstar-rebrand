# Review Nachbesserung 2

Je Punkt ein Vergleichsbild: oben die Referenz aus `docs/referenzen/`, darunter CleanStar (Desktop 1440 × 900, Handy
390 × 844). Je Punkt zwei Durchgänge; ein Element geht nur live, wenn im Vergleich keine deutliche Qualitätslücke bleibt.

| Punkt | Element | Seite | Bild | Live |
| --- | --- | --- | --- | --- |
| 2 | Papier-Reveal | Startseite nach den Ärgernissen, Leistungen vor dem Portal | `2-papier-reveal.jpg`, `2-papier-kante-vergroessert.jpg` | ja |
| 3 | Wolken-Übergang | Startseite und Einzugsgebiet, vor der Karte | `3-wolken-uebergang.jpg` | ja (ohne Landschaftsfoto, siehe unten) |
| 4 | Pflanzen-Abschnitt | Startseite | `4-pflanzen-abschnitt.jpg` | ja |
| 5 | Raum-Karten | Qualitätsgarantie | `5-raum-karten.jpg` | ja |
| 6 | Moment-Schrift mit Füller | alle Moment-Überschriften | `6-fueller-*.jpg` | ja |
| 7 | Ablauf-Linie mit Komet | Startseite, Ablauf | `7-linie-komet.jpg` | ja |

## 2 Papier-Reveal (Referenz `shopify/07-papier-reveal`, `detail-kante-*`)

- **Durchgang 1:** Der helle Ärgernis-Abschnitt ist das Blatt. Es schiebt sich nach oben weg, das Morgen-Büro steht fest
  darunter, danach steigt „Am Morgen“ auf. Die alte Abzieher-Kante ist entfernt. Funde: An der Kante war eine feine
  Nahtlinie zu sehen, auf Leistungen schimmerte der Abschnitt durch, und die Rissform war im Vergleich zu flach
  (Amplitude rund ein Drittel der Referenz), der Faserrand zu schmal.
- **Durchgang 2:** Schatten nach oben abgeschnitten und 3 px Überlappung (keine Naht), Blatt mit eigener Papierfläche.
  Die Kante hat jetzt sieben Rausch-Oktaven mit großen Bögen wie in der Referenz, einen breiteren, dichten weißen
  Faserrand mit einzelnen Fasern und einen weichen Schatten. In der 100-%-Vergrößerung neben `detail-kante-*`
  besteht sie. Am Handy ist die Kante schmaler skaliert (feiner). Die Schreibschrift-Zeile hat mehr Abstand zum Wort.

## 3 Wolken-Übergang (Referenz `era/13-wolken-uebergang`)

- **Durchgang 1:** Nebel-über-Gebäude-Abschnitt und alle Nebel-Overlays entfernt. Drei Wolkenebenen aus dem
  hochgeladenen Wolkenbild steigen auf. Funde: Die Wolken deckten nicht ganz ab, wirkten unten wie Nebel (harte
  Unterkante), am Handy lagen sie falsch.
- **Durchgang 2:** Ebenen neu gesetzt (je Breite eigene Positionen), Ausblenden erst am Ende, weiche Maske unten. Die
  Wolken steigen auf, decken die Karte ab und ziehen in Ebenen mit unterschiedlicher Geschwindigkeit nach oben weg. Die
  Moment-Überschrift bleibt darüber lesbar. Ein scharfes Landschaftsfoto ohne Gebäude im Vordergrund fehlt; die Wolken
  geben deshalb direkt die Geländekarte frei (Blick von oben). Bildprompt in OFFENE-PUNKTE.md.

## 4 Pflanzen-Abschnitt (Referenz `era/03`)

- **Durchgang 1:** Efeutute oben rechts (rund ein Viertel der Breite), kleinere Pflanze unten links, Parallaxe, leichtes
  Wiegen. Funde: Die untere Pflanze war kaum zu sehen, am Handy lag die obere über der Überschrift.
- **Durchgang 2:** Untere Pflanze größer, weniger Parallaxe; am Handy obere Pflanze weiter nach oben. Die Bilder werden
  nicht hochgerechnet (1536 bzw. 1312 px, Hinweis in OFFENE-PUNKTE.md).

## 5 Raum-Karten (Qualitätsgarantie)

- **Durchgang 1:** Stapel fächert beim Darüberfahren auf, Karte hebt und neigt sich zur Maus. Klick: Karte fliegt in die
  Mitte, wird größer und dreht sich um (vorne Name, Linien-Symbol, Intervall; hinten Checkliste, Haken setzen sich
  nacheinander). Zweiter Klick oder Escape legt sie zurück. Ziehen und Werfen mit Feder, „Stapel neu mischen“. Funde:
  Texte der Karten darunter schienen durch.
- **Durchgang 2:** Karten deckend, Tastatur (Pfeile wechseln, Enter dreht), am Handy Wischen und Tippen, HTML-Liste aller
  Inhalte für Screenreader, reduzierte Bewegung als Raster. Mappe-Objekte weggelassen (nicht hochwertig genug).

## 6 Moment-Schrift mit Füller-Effekt

- **Durchgang 1:** Handgesetzte Mittellinien je Buchstabe in natürlicher Schreibrichtung, Strich-Masken-Reveal,
  langsamer in Kurven und an Strichanfängen, 1,2 bis 1,6 s, kleine Federspitze. Fund: Das erste Skelett hatte falsche
  Verzweigungen (Lücken in U und G).
- **Durchgang 2:** Knoten über die Kreuzungszahl bestimmt, alle 24 Großbuchstaben in großer Darstellung geprüft
  (`6-fueller-alle-buchstaben.jpg`, Abdeckung jeweils mindestens 99,4 %). Die Überschrift bleibt lesbar, bis sie das
  obere Viertel erreicht. Die Worte setzen ein, wenn der Füller zur Hälfte durch ist, und der Effekt startet etwas
  früher, damit beim Scrollen keine leere Fläche entsteht.

## 7 Ablauf-Linie mit Komet (Referenz `terminal/04-linie-komet`)

- **Durchgang 1:** Grundlinie 1,5 px graublau mit runden 90-Grad-Kurven, leuchtender Punkt mit Halo und Schweif,
  scrollgesteuert, Linie dahinter blau gefüllt, Puls im Stillstand, Box füllt sich mit Funkeln. Fund: Die Linie lief
  durch Text.
- **Durchgang 2:** Schleifen in die Lücken zwischen den Boxen verlegt, seitlich ausschwingend; am Handy links mit
  kleineren Kurven.
