# Nachbesserung 1: Vergleichsbilder und Selbstbewertung

Aufnahmen mit Playwright (Chromium, Software-Rendering). Vorher = Stand e92974d (finale Runde), nachher = dieser Stand.
Referenzen aus `docs/referenzen/era/`.

| Bild | Inhalt | Bewertung |
| --- | --- | --- |
| `vergleich-button-roll.jpg` | Referenz era/10, vorher und nachher je 8 Bilder während des Rolls bei 2-facher Pixeldichte (0 bis 560 ms, fest angehaltene Animation), dazu Ruhe- und Endzustand | Kein Bild zeigt abgeschnittene Umlaut-Punkte oder Unterlängen, kein Zucken, keine Unschärfe. Ruhe- und Endzustand sind deckungsgleich (echter Text mit Kerning), die Breite bleibt in jedem Bild gleich. |
| `vergleich-moment-schrift.jpg` | „Wir kommen, wenn Sie gehen.“ vorher und nachher auf 1440, 1024, 768 und 390 px, dazu die übrigen Moment-Überschriften | Vorher kreuzte der Schwung des W die Wörter „ir kommen“ und berührte „wenn“. Nachher läuft der Schwung frei oberhalb aus, „ir kommen“ beginnt rechts von ihm, die zweite Zeile ist bündig darunter eingerückt. |
| `vergleich-bildpaare.jpg` | Referenz era/08, Bildpaar unter dem Moment vorher und nachher | Großes Bild 48 %, kleines 34 % der Inhaltsbreite, höhenversetzt und überlappend, das kleine schiebt sich beim Scrollen über das große. Handy: großes Bild volle Breite, kleines 60 % rechts versetzt. Satz und Bilder kommen schon, während der Kreis wächst. |
| `vergleich-ablauf.jpg` | Ablauf vorher (ohne Bewegung) und nachher bei 15, 50, 95 und zurück auf 40 % | Linie zeichnet sich, erreichte Kästchen füllen sich blau mit weißer Zahl, Stern funkelt, Titel mit Farbwelle; aktueller Schritt kräftig, kommende blass, rückwärts beim Hochscrollen. Desktop: Überschrift links steht. |
| `vergleich-vogelflug.jpg` | Referenz era/05, Flug auf Desktop und Handy (Zeitlupe, da Software-Rendering) | Wolkenschichten und Durchflug durch eine dichte Wolke, Wolkenschatten, Anfahrtslinie von Offenburg, Fahrzeit läuft mit („ca.“), Ankunft mit pulsierender Markierung, Stern und Ortsname in der Moment-Schrift, darunter Fahrzeit und gefragte Leistungen. |

## Durchgang 1

| Stelle | Befund | Behebung |
| --- | --- | --- |
| Button-Roll | Einzelbuchstaben in Ruhe zerstörten das Kerning, feste Höhe schnitt Umlaut-Punkte ab | In Ruhe echter Text; gezeichnete Kopie nur während des Rolls an den gemessenen Buchstabenpositionen, Rahmen mit 0,15 em Luft oben und unten, ganzzahlige Rollstrecke |
| Moment-Schrift | Schwung des W kreuzte die Serifenbuchstaben | Tintenfläche jedes Großbuchstabens zeilenweise vermessen; Text beginnt rechts vom Schwung in Höhe der Serifenbuchstaben, mindestens 0,08 em Luft; zweite Zeile eingerückt |
| Bildpaar | Zu klein, links ausgerichtet, rechte Hälfte leer | Gruppe mittig, Bilder 3 : 2, Größe auch nach freier Höhe |
| Handy, Bildpaar | Kleines Bild unter der Handy-Leiste | Inhalt beginnt höher, Raster ohne gestreckte Zeilen |
| Ablauf | Alle Kästchen zu früh gefüllt; stehende Überschrift verschwand am Ende | Lage der Kästchen relativ zur Liste gemessen; Ein- und Ausblenden der Überschrift am ganzen Abschnitt |
| Vogelflug, Handy | Fahrzeit unter dem Quellenhinweis, Ankunftskarte oben abgeschnitten, Karte nicht ganz im Bild | Fahrzeit oben links, Karte unter die Markierung, Karte vor dem Flug ganz ins Bild |

## Durchgang 2

| Stelle | Befund |
| --- | --- |
| Button-Roll | Ruhe, Ablauf und Ende sauber; Ablauf wie Referenz (gestaffelt von links, zweite Zeile rollt nach). |
| Moment-Schrift | Pixelprüfung im Übergangs-Test ohne Treffer auf allen geprüften Seiten (Desktop und Handy). |
| Bildpaare | Wie Referenz era/08: zwei Größen, versetzt, das kleine überlappt. |
| Ablauf | Rückwärts geprüft (95 % → 40 %): Kästchen 04 bis 06 wieder blass, Linie kürzer. |
| Vogelflug | Gesamtdauer etwa 3,5 s (Flug 2,7 s Desktop bzw. 2,3 s Handy, Ankunft 1 s), Escape oder Klick springt direkt zur Ortsseite, reduzierte Bewegung ohne Flug. |

## Neue Prüfungen im Übergangs-Test

- Moment-Überschriften: Großbuchstabe und übrige Buchstaben getrennt gezeichnet, Tinte des Großbuchstabens um 0,08 em
  verbreitert; gemeinsame Pixel gelten als Überschneidung.
- Leere Fläche (Desktop): Bildschirm in 32 × 20 Kacheln; leer ist eine Kachel, wenn sie einfarbig ist und kein Inhalt
  näher als zwei Kacheln (etwa 90 px) liegt. Über 40 % leere Fläche gelten als Fehler. Folgen zwei Abschnitte mit
  derselben Fläche aufeinander, beginnt der zweite mit kleinerem Abstand (sonst addierten sich beide Innenabstände).
