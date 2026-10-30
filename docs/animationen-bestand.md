# Animationen und Text-Effekte: Bestand vor dem Feinschliff aus drei Referenzen

Stand vor dieser Runde (Commit 73c8601). Ziel: Am Ende gibt es nur noch die Systeme aus dem Prompt
(Hero „Staub und Plan“, ein Text-System mit drei Modi, rollende Buttons und Links, runder Button,
Haus-Fenster-Intro, Kreis-Übergang, versetzte Karten, Karten-Karussell, Prüfpunkt-Ansicht, Kostenrechner,
FAQ-Chips). Spalte „Ergebnis“ zeigt, was daraus geworden ist.

Nicht betroffen, weil Bedienung bzw. eigenes Werkzeug und kein Effekt: Leistungsmappe (3D-Buch), Karte des
Einzugsgebiets (Vogelflug), Grundriss, Konfigurator, Formulare, Dialoge, Menüs (Öffnen und Schließen),
Seitenwechsel, Signatur-Szene unter `/labor/nacht` (bleibt unverändert und ausgeschaltet).

## Text-Effekte

| Effekt | Datei | Wo | Ergebnis |
| --- | --- | --- | --- |
| Überschrift Zeile für Zeile aus der Maske (Scroll) | `RevealText.tsx`, `useScrollReveals.ts` | alle H1 und H2 | umgestellt auf AnimatedText „headline“ |
| Überschrift sofort aus der Maske (Seitenkopf) | `RevealText.tsx` (`immediate`), CSS `reveal-now` | Seitenköpfe | umgestellt auf AnimatedText „headline“ (sofort) |
| Färbe-Effekt Buchstabe für Buchstabe, gepinnt | `ScrollStory.tsx` | Startseite nach dem Hero | entfernt (der neue Hero erzählt dasselbe) |
| Färbe-Effekt für Überschriften (`scrub`) | `ScrubText.tsx`, `SectionHeading` | einzelne H2 | umgestellt auf „headline“ |
| Kernsatz mit Bildkacheln | `ScrubStatement.tsx`, `content/statements.ts` | Unterseiten | umgestellt auf AnimatedText „paragraph“ |
| Wisch-Zeilen „Problem weg, Lösung da“ | `ProblemSolution.tsx`, CSS `wipe-l`, `strike` | Startseite, Büroreinigung, Garantie | entfernt, ruhige Liste |
| Brief-Unterschrift schreibt sich | `FounderLetter.tsx`, CSS `letter-sign` | Über uns | entfernt |
| Menüpunkt färbt sich beim Antippen | `Header.tsx`, CSS `menu-l` | Vollbild-Menü | umgestellt auf Text-Roll |
| Slogan aus Partikeln | `ParticleSlogan.tsx` | Footer | umgestellt auf „headline“ |
| Zähler 01, 02, 03 zählt hoch | `CountUp.tsx` | Ablauf | entfernt (Zahl steht) |

## Scroll-Szenen und Übergänge

| Effekt | Datei | Wo | Ergebnis |
| --- | --- | --- | --- |
| Hero als Scroll-Video mit Schritt-Anzeige | `Hero.tsx`, `useHeroSequence.ts` | Startseite | ersetzt durch Hero „Staub und Plan“ (Frame-Sequenz bleibt als Anfang und als Ersatz ohne WebGL2) |
| Handy-Sequenz als 16:9-Karte mit drei Schritten | `HeroMobileSequence.tsx` | Startseite Handy | entfernt (ein Hero für alle Breiten) |
| Umschalter Abend/Morgen mit Lichtkante | `Hero.tsx` (`DayLayer`), CSS `day-wipe` | Startseite | entfernt |
| Scharfe Standbilder an Schlüsselmomenten | `KeyOverlays.tsx` | Hero | bleibt im Frame-Teil des Heros |
| Glanz-Stern | `Sparkle.tsx` | Hero, Garantie, Footer, Problem-Liste | nur noch im Hero (Morgen) |
| Scroll-Stopper „Der Wisch“ | `WipeScene.tsx` | Leistungen | entfernt |
| Scroll-Stopper „Die Nacht-Uhr“ | `NightClock.tsx` | Ablauf | entfernt, ruhige Liste |
| Scroll-Stopper „Prüfliste mit Siegel“ | `GuaranteeChecks.tsx` | Qualitätsgarantie | entfernt, ruhige Liste |
| Scroll-Stopper „Gründer rücken zusammen“, Schwarzweiß zu Farbe | `FoundersScene.tsx` | Startseite, Über uns | ersetzt durch ruhige Gründer-Reihe mit Ring-Puls |
| Vorhang zwischen hellen und dunklen Abschnitten | `lib/curtains.ts` | alle Seiten (Desktop) | ersetzt durch den Kreis-Übergang (Startseite drei, Unterseite höchstens einer) |
| Bildband mit Parallaxe und Ken Burns | `ImageBand.tsx` | Startseite, viele Unterseiten | Bewegung entfernt, Bild steht |
| Collage aus drei Ebenen mit Parallaxe | `Collage.tsx` | Leistungen, Karriere, Über uns | umgestellt auf versetzte Karten |
| Wasser-Effekt beim Überfahren (WebGL) | `features/water` | Leistungen, Startseite | entfernt |
| Kapitel-Index mit Hervorhebung | `ServiceChapters.tsx` | Leistungen | Hervorhebung bleibt (Orientierung), Wasser entfernt |
| Partner-Ablauf: Zeilen decken sich auf | CSS `row-reveal` | Partner, Ablauf | entfernt |
| Lichtreflexion im Glas der Kopfzeile | CSS `glass-glint` | Kopfzeile | entfernt |
| Absätze blenden ein (`data-reveal`) | `useScrollReveals.ts` | überall | entfernt (Text steht, Überschriften tragen die Bewegung) |
| Bilder decken sich von unten auf (`data-reveal-img`, `img-up-now`) | `Picture.tsx` | überall | entfernt |
| Haarlinie zeichnet sich (`data-reveal-rule`) | `SectionHeading.tsx` u. a. | überall | entfernt |
| Einblenden im Seitenkopf (`fade-up-now`) | `PageHero.tsx`, `Hero.tsx` | Seitenköpfe | entfernt (Überschrift trägt die Bewegung) |
| Preloader „0 % sauber“, Vorhang nach oben | `index.html` | erster Besuch | ersetzt durch Haus-Fenster-Intro |
| Balken der Kostenaufschlüsselung wachsen | `CostTeaser.tsx` | Startseite | Teil des Kostenrechners (dunkle Karte) |

## Buttons und Links

| Effekt | Datei | Ergebnis |
| --- | --- | --- |
| Unterstrich zieht sich zurück und zeichnet neu (`tlink`) | CSS | bleibt, Teil des Link-Systems |
| Unterstrich erscheint beim Überfahren (`ulink`, `navlink`) | CSS | umgestellt: Unterstrich rechts raus, links rein |
| Pfeil rückt 3 px nach rechts | CSS | bleibt |
| Button-Hintergrund dunkler beim Überfahren | CSS | umgestellt: Text rollt, Hintergrund leicht heller |
