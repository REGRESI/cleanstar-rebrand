# Review Shopify-Runde

Je Element ein Vergleichsbild: oben sechs Bilder der Shopify-Sequenz (`docs/referenzen/shopify/`), darunter sechs
Scroll-Stände von CleanStar am Desktop (1440 × 900) und am Handy (390 × 844). Übernommen wird das Prinzip, nicht der
Look: keine Gemälde, kein gerissenes Papier, kein Lila. Jedes Element hat genau einen Platz.

| Element | Seite | Bild | Live |
| --- | --- | --- | --- |
| Abzieher-Kante | Startseite, Ende der Ärgernisse | `s1-abzieher-kante.jpg` | ja |
| Funken-Portal | Leistungen | `s2-funken-portal.jpg` (aus /labor/portal) | nein, Schalter aus |
| Aufgaben-Wolke | Büroreinigung | `s3-aufgaben-wolke.jpg` | ja |
| Fächer der Raum-Karten | Qualitätsgarantie | `s4-faecher-raum-karten.jpg` | ja |
| Schwebende Anliegen | Ablauf | `s5-schwebende-anliegen.jpg` | ja |
| Kapitel-Wort | Leistungs-Unterseiten | `s6-kapitel-wort.jpg` | ja |

## Durchgang 1

- **Abzieher-Kante:** Die schräge, gerade Kante mit Wasserfilm, Glanzpunkten und Tropfen ersetzt die Papierkante der
  Referenz. Sie gibt den nächsten Abschnitt frei und läuft über rund 80 vh. Text liegt nie unter der Kante.
- **Funken-Portal:** Stern, Funkenwolke und wachsender Kreis funktionieren, auch rückwärts. Im wachsenden Kreis springen
  aber die Tische, weil Vorher- und Nachher-Foto nicht deckungsgleich sind. Das erreicht das Niveau der Referenz nicht,
  deshalb bleibt das Portal aus. Siehe OFFENE-PUNKTE.md.
- **Aufgaben-Wolke:** Drei Größen, drei Helligkeiten, drei Tiefen. Die Navy-Pille mit Karte zeigt Raum und Intervall.
  Im ersten Stand war die Wolke am Handy zu dicht (Zeilen statt Spirale behoben) und es gab Überschneidungen (Breiten
  werden jetzt im Browser gemessen).
- **Fächer der Raum-Karten:** Fächer am unteren Rand, dann hebt sich jede Karte in die Mitte, zum Schluss acht Karten
  in zwei Reihen mit Stempel. Die Endreihen beginnen unter der Überschrift (gemessen, nicht geschätzt). Am Handy lag die
  Visitenkarte zu nah an der Überschrift; jetzt bleibt am Handy nur der Schlüssel.
- **Schwebende Anliegen:** Blasse, unscharfe Karten, der Fokus wandert beim Scrollen und mit der Maus. Antwort mit Haken
  „Wir kümmern uns darum.“, gekennzeichnet als „Beispiele für typische Anfragen“.
- **Kapitel-Wort:** Das Wort steigt riesig über dem Foto auf und wird zur Seitenüberschrift. Im ersten Stand wuchs es
  nicht (H1 in Blockbreite) und überdeckte den Kernsatz; beides behoben.

## Durchgang 2

- **Kapitel-Wort:** Lighthouse zeigte auf der Seite Büroreinigung zeitweise eine Layout-Verschiebung von 0,35. Ursache:
  Das eingebettete CSS enthielt die Regeln des Bewegungsmodus nicht, das volle Stylesheet kam erst nach dem ersten Bild.
  Behoben, die Verschiebung ist weg (sechs gedrosselte Läufe ohne Verschiebung).
- **Aufgaben-Wolke:** Sie entsteht jetzt erst im Browser und nur für die passende Breite (rund 250 Elemente weniger im
  HTML). Die Liste nach Räumen bleibt im HTML für Screenreader und Suchmaschinen.
- **Fächer, Anliegen, Abzieher-Kante:** Rückwärts geprüft, gleiche Zwischenstände wie vorwärts.
- **Portal:** Bleibt aus. Die Technik ist fertig; mit einem deckungsgleichen Bildpaar genügt der Schalter.
