# Gepinnte Abschnitte (Scroll-Stopper)

Erzeugt mit `scripts/inventory-pins.mjs` (Build von `dist`, Chromium, Desktop 1440 × 900 und iPhone 13). Gezählt werden
Bühnen mit `position: sticky`, die mindestens 80 % des Bildschirms füllen und mindestens 10 % der Bildschirmhöhe stehen
bleiben, sowie GSAP-Pins. Haltestrecke in `svh` (Weg, auf dem die Bühne steht, während die Seite weiterscrollt).
Mitlaufende Seitenspalten und klebende Überschriften neben weiterlaufendem Inhalt sind keine Scroll-Stopper.

Regeln (Prüfung mit `CHECK=1 node scripts/inventory-pins.mjs`):

- Mobile höchstens 3 gepinnte Abschnitte je Seite, je höchstens 150 svh.
- Desktop höchstens 5 je Seite, je höchstens 200 svh.
- Feste Höhen in `svh`; der einzige GSAP-Pin (Hero) hat `anticipatePin: 1` und `invalidateOnRefresh: true`; keine
  verschachtelten Pins, keine Pins in Elementen mit `transform`.
- `ScrollTrigger.refresh()` einmal nach dem Laden von Bildern und Schriften; spätere Höhenänderungen nur in einer
  Scrollpause (`src/lib/useScrollReveals.ts`).

Ergebnis: alle Seiten halten die Regeln ein.

Änderungen in dieser Runde:

| Abschnitt | vorher | jetzt |
| --- | --- | --- |
| Hero (Startseite, GSAP-Pin) | 460 vh | Desktop 200 svh, Mobile 150 svh |
| Leistungen waagerecht (Startseite, Desktop) | 691 svh | 200 svh (Fahrt etwas schneller) |
| Haltestrecken der Übergänge Leistungen → Kosten, Ort → Mappe, Mappe → Antwort (Desktop) | je 100 svh | im Fluss (Kartenkante), keine Haltestrecke |
| Lese-Strecken „Ihr festes Team“ und „Unser Zuhause“ (Mobile) | 110 bzw. 80 svh | im Fluss |
| Papier-Reveal Leistungen (Mobile) | 160 svh | 150 svh |
| Schwebende Anliegen, Ablauf (Mobile) | 160 svh | 140 svh |
| Scroll-Sperre an Überschriften (`headingGate`) | bis 6,5 s gesperrt | entfernt |

## Bestand

| Seite | Gerät | Abschnitt | Art | Haltestrecke (svh) |
| --- | --- | --- | --- | --- |
| / | Desktop | arrive-title (.arrive-stage.sticky) | sticky | 80 |
| / | Desktop | services-title (.sticky.top-0) | sticky | 200 |
| / | Desktop | team (.ht-plane) | sticky | 200 |
| / | Desktop | footer (.ftr-img.photo) | sticky | 80 |
| / | Desktop | hero-title (.hero-pin.relative) | GSAP-Pin | 200 |
| /leistungen/ | Desktop | standard-title (.pr-stage) | sticky | 160 |
| /leistungen/ | Desktop | footer (.ftr-img.photo) | sticky | 80 |
| /leistungen/bueroreinigung/ | Desktop | section (.chapter-stage) | sticky | 120 |
| /ablauf/ | Desktop | requests-title (.fr-stage) | sticky | 160 |
| /ablauf/ | Desktop | footer (.ftr-img.photo) | sticky | 80 |
| /einzugsgebiet/ | Desktop | footer (.ftr-img.photo) | sticky | 80 |
| /ueber-uns/ | Desktop | about-moment (.arrive-stage.sticky) | sticky | 80 |
| /kontakt/ | Desktop | footer (.ftr-img.photo) | sticky | 80 |
| / | Mobile | arrive-title (.arrive-stage.sticky) | sticky | 80 |
| / | Mobile | footer (.ftr-img.photo) | sticky | 80 |
| / | Mobile | hero-title (.hero-pin.relative) | GSAP-Pin | 150 |
| /leistungen/ | Mobile | standard-title (.pr-stage) | sticky | 150 |
| /leistungen/ | Mobile | footer (.ftr-img.photo) | sticky | 80 |
| /leistungen/bueroreinigung/ | Mobile | section (.chapter-stage) | sticky | 120 |
| /ablauf/ | Mobile | requests-title (.fr-stage) | sticky | 140 |
| /ablauf/ | Mobile | footer (.ftr-img.photo) | sticky | 80 |
| /einzugsgebiet/ | Mobile | footer (.ftr-img.photo) | sticky | 80 |
| /ueber-uns/ | Mobile | about-moment (.arrive-stage.sticky) | sticky | 80 |
| /kontakt/ | Mobile | footer (.ftr-img.photo) | sticky | 80 |

