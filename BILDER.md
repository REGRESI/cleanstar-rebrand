# Bildliste CleanStar-Website

Alle 24 Bilder, die die Website braucht. Bis ein Foto vorliegt, zeigt die Website einen beschrifteten Platzhalter im richtigen Seitenverhältnis.

## So bauen Sie ein Bild ein

1. Bild erzeugen bzw. fotografieren (Prompt und Maße siehe unten).
2. Als JPG oder PNG unter `bilder/<Dateiname>.jpg` ablegen (Dateiname exakt wie in der Tabelle).
3. `npm run images` ausführen. Daraus entstehen AVIF und WebP in den Breiten 640, 1024, 1600, 2400 px unter `public/images/`.
4. In `src/content/images.ts` beim Bild `available: true` setzen.
5. `npm run build` ausführen.

Hinweis: Die Einzeldatei-Vorschau (`preview/cleanstar-website.html`) bettet alle vorhandenen Fotos aus `bilder/` als stark komprimiertes WebP (1200 px) ein.

## Einheitlicher Look (an jeden Prompt anhängen)

> Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks

## Übersicht

| # | Dateiname | Format | Mindestgröße | Verwendet auf |
|---|---|---|---|---|
| 1 | `vorher-buero.jpg` | 16:9 | 1920 × 1080 px | Startseite (Vorher/Nachher), Büroreinigung |
| 2 | `nachher-buero.jpg` | 16:9 | 1920 × 1080 px | Startseite (Vorher/Nachher), Büroreinigung |
| 3 | `leistung-bueroreinigung.jpg` | 16:9 | 2400 × 1350 px | Büroreinigung (Hero), Leistungskarte Startseite und Leistungsübersicht |
| 4 | `bueroreinigung-detail.jpg` | 4:3 | 1600 × 1200 px | Büroreinigung |
| 5 | `leistung-unterhaltsreinigung.jpg` | 16:9 | 2400 × 1350 px | Unterhaltsreinigung (Hero), Leistungskarte |
| 6 | `leistung-fensterreinigung.jpg` | 16:9 | 2400 × 1350 px | Fensterreinigung (Hero), Leistungskarte |
| 7 | `leistung-treppenhausreinigung.jpg` | 16:9 | 2400 × 1350 px | Treppenhausreinigung (Hero), Leistungskarte |
| 8 | `leistung-hallenreinigung.jpg` | 16:9 | 2400 × 1350 px | Hallenreinigung (Hero), Leistungskarte |
| 9 | `leistung-hygienereinigung.jpg` | 16:9 | 2400 × 1350 px | Hygienereinigung (Hero), Leistungskarte |
| 10 | `gruender-1.jpg` | 4:5 | 1200 × 1500 px | Über uns, Startseite (Über-uns-Teaser) |
| 11 | `gruender-2.jpg` | 4:5 | 1200 × 1500 px | Über uns, Startseite (Über-uns-Teaser) |
| 12 | `gruender-3.jpg` | 4:5 | 1200 × 1500 px | Über uns (nur wenn drei Gründer in company.ts eingetragen sind) |
| 13 | `team-im-einsatz.jpg` | 16:9 | 2400 × 1350 px | Über uns, Karriere |
| 14 | `team-besprechung.jpg` | 4:3 | 1600 × 1200 px | Qualitätsgarantie |
| 15 | `buero-am-morgen.jpg` | 16:9 | 1600 × 900 px | Ablauf (Erster Monat) |
| 16 | `qualitaetskontrolle.jpg` | 16:9 | 2400 × 1350 px | Qualitätsgarantie |
| 17 | `objektbesichtigung.jpg` | 16:9 | 2400 × 1350 px | Ablauf |
| 18 | `karriere.jpg` | 16:9 | 2400 × 1350 px | Karriere |
| 19 | `region-ortenau.jpg` | 21:9 | 2560 × 1097 px | Einzugsgebiet |
| 20 | `kontakt.jpg` | 4:3 | 1600 × 1200 px | Kontakt |
| 21 | `partner-hero.jpg` | 16:9 | 2400 × 1350 px | Partnerprogramm (Hero) |
| 22 | `partner-gruender.jpg` | 4:3 | 1600 × 1200 px | Partnerprogramm (Weg Gründung) |
| 23 | `partner-bestand.jpg` | 4:3 | 1600 × 1200 px | Partnerprogramm (Weg bestehende Firma) |
| 24 | `partner-einarbeitung.jpg` | 16:9 | 2400 × 1350 px | Partnerprogramm (Modul Einarbeitung und Support) |

## Bilder im Detail

### 1. vorher-buero

- **ID im Code:** `before-office`
- **Pfad:** `bilder/vorher-buero.jpg` → `public/images/vorher-buero-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 1920 × 1080 px
- **Verwendet auf:** Startseite (Vorher/Nachher), Büroreinigung
- **Inhalt:** VORHER: Arbeitsplatz am Abend, benutzte Tassen, Krümel, Fingerabdrücke, Staub, 16:9
- **Alt-Text:** Schreibtisch vor der Reinigung mit Kaffeetassen, Krümeln und Staub auf dem Monitor
- **Status:** vorhanden

**Prompt:**

```
Modern open-plan office desk in the evening after a workday, used coffee mugs, crumbs, sticky notes, fingerprints on the glass desk divider, light dust on the monitor stand, slightly dim warm overhead light, same camera position as the matching after-image, eye level, wide angle. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 2. nachher-buero

- **ID im Code:** `after-office`
- **Pfad:** `bilder/nachher-buero.jpg` → `public/images/nachher-buero-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 1920 × 1080 px
- **Verwendet auf:** Startseite (Vorher/Nachher), Büroreinigung
- **Inhalt:** NACHHER: derselbe Arbeitsplatz, identischer Bildausschnitt, makellos sauber, 16:9
- **Alt-Text:** Derselbe Schreibtisch nach der Reinigung, aufgeräumt, glänzende Oberflächen
- **Status:** vorhanden

**Prompt:**

```
The exact same modern open-plan office desk from the identical camera position, now spotless: clear desk surface, polished glass divider without fingerprints, dust-free monitor, chair neatly pushed in, bright clean morning daylight, fresh and calm atmosphere. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 3. leistung-bueroreinigung

- **ID im Code:** `svc-buero`
- **Pfad:** `bilder/leistung-bueroreinigung.jpg` → `public/images/leistung-bueroreinigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Büroreinigung (Hero), Leistungskarte Startseite und Leistungsübersicht
- **Inhalt:** Reinigungskraft wischt Schreibtisch in hellem Großraumbüro, Tageslicht, 16:9
- **Alt-Text:** CleanStar-Mitarbeiterin wischt mit Handschuhen und Mikrofasertuch einen Schreibtisch in einem hellen Großraumbüro
- **Status:** vorhanden

**Prompt:**

```
Cleaner in navy CleanStar uniform wiping a white desk with blue gloves and a microfiber cloth in a bright open-plan office at daytime, natural light through large windows, focused and calm. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 4. bueroreinigung-detail

- **ID im Code:** `svc-buero-detail`
- **Pfad:** `bilder/bueroreinigung-detail.jpg` → `public/images/bueroreinigung-detail-<breite>.avif|webp`
- **Seitenverhältnis:** 4:3
- **Mindestauflösung:** 1600 × 1200 px
- **Verwendet auf:** Büroreinigung
- **Inhalt:** Detail: Mikrofasertuch auf Tastatur und Telefon, Nahaufnahme, 4:3
- **Alt-Text:** Nahaufnahme: Hand im Handschuh reinigt eine Tastatur mit Mikrofasertuch, daneben ein Telefon
- **Status:** vorhanden

**Prompt:**

```
Close-up of a gloved hand with a blue microfiber cloth cleaning a keyboard and desk phone in a modern office, shallow depth of field, crisp detail, cool daylight. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:3.
```

### 5. leistung-unterhaltsreinigung

- **ID im Code:** `svc-unterhalt`
- **Pfad:** `bilder/leistung-unterhaltsreinigung.jpg` → `public/images/leistung-unterhaltsreinigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Unterhaltsreinigung (Hero), Leistungskarte
- **Inhalt:** Empfangsbereich eines Unternehmens, frisch gewischter Steinboden, Morgenlicht, 16:9
- **Alt-Text:** Heller Empfangsbereich mit frisch gewischtem Steinboden, am Rand ein CleanStar-Reinigungswagen
- **Status:** vorhanden

**Prompt:**

```
Bright corporate reception area in the early morning, freshly mopped light stone floor with subtle reflections, cleaning trolley parked discreetly at the edge, nobody in focus, calm architectural composition. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 6. leistung-fensterreinigung

- **ID im Code:** `svc-fenster`
- **Pfad:** `bilder/leistung-fensterreinigung.jpg` → `public/images/leistung-fensterreinigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Fensterreinigung (Hero), Leistungskarte
- **Inhalt:** Fensterreinigung: Abzieher auf großer Glasfläche, streifenfrei, Gegenlicht, 16:9
- **Alt-Text:** CleanStar-Mitarbeiter reinigt eine große Bürofensterfront mit dem Abzieher
- **Status:** vorhanden

**Prompt:**

```
Window cleaner using a squeegee on a large floor-to-ceiling office window, streak-free glass, soft backlight, view to green hills in the distance, clean lines, from inside the office. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 7. leistung-treppenhausreinigung

- **ID im Code:** `svc-treppenhaus`
- **Pfad:** `bilder/leistung-treppenhausreinigung.jpg` → `public/images/leistung-treppenhausreinigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Treppenhausreinigung (Hero), Leistungskarte
- **Inhalt:** Helles Treppenhaus eines Geschäftshauses, sauberer Handlauf, Stufen von oben, 16:9
- **Alt-Text:** Sauberes, helles Treppenhaus mit Edelstahlgeländer und großem Fenster
- **Status:** vorhanden

**Prompt:**

```
Clean bright stairwell of a modern commercial building seen from above, polished concrete steps, gleaming stainless steel handrail, natural light from a tall window, geometric composition. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 8. leistung-hallenreinigung

- **ID im Code:** `svc-halle`
- **Pfad:** `bilder/leistung-hallenreinigung.jpg` → `public/images/leistung-hallenreinigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Hallenreinigung (Hero), Leistungskarte
- **Inhalt:** Gewerbehalle, Scheuersaugmaschine auf sauberem Hallenboden, weite Perspektive, 16:9
- **Alt-Text:** CleanStar-Mitarbeiter reinigt eine Lagerhalle mit der Aufsitz-Scheuersaugmaschine
- **Status:** vorhanden

**Prompt:**

```
Large clean commercial warehouse hall with high ceilings, a ride-on floor scrubber leaving a glossy clean path on the grey epoxy floor, orderly shelving, cool daylight from skylights, wide perspective. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 9. leistung-hygienereinigung

- **ID im Code:** `svc-hygiene`
- **Pfad:** `bilder/leistung-hygienereinigung.jpg` → `public/images/leistung-hygienereinigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Hygienereinigung (Hero), Leistungskarte
- **Inhalt:** Sanitärbereich im Büro, glänzende Armaturen, frisch gereinigt, kühles Licht, 16:9
- **Alt-Text:** Gereinigter Sanitärbereich in einem Bürogebäude mit Waschtisch, Spiegel und Papierspendern
- **Status:** vorhanden

**Prompt:**

```
Spotless modern office restroom with white basins, gleaming chrome faucets, large mirror without streaks, neatly stocked paper dispensers, cool clean light, minimal architectural style. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 10. gruender-1

- **ID im Code:** `founder-1`
- **Pfad:** `bilder/gruender-1.jpg` → `public/images/gruender-1-<breite>.avif|webp`
- **Seitenverhältnis:** 4:5
- **Mindestauflösung:** 1200 × 1500 px
- **Verwendet auf:** Über uns, Startseite (Über-uns-Teaser)
- **Inhalt:** Porträt Gründer 1, Halbtotale, neutraler heller Hintergrund, freundlich, 4:5
- **Alt-Text:** Porträt eines Gründers von CleanStar im dunkelblauen Polo in einem hellen Büro
- **Status:** vorhanden

**Prompt:**

```
Real portrait photo of the founder (use the real person, not generated), half-body, standing in a bright modern office, navy polo shirt or shirt, friendly confident look into the camera, soft window light, light background. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:5.
```

### 11. gruender-2

- **ID im Code:** `founder-2`
- **Pfad:** `bilder/gruender-2.jpg` → `public/images/gruender-2-<breite>.avif|webp`
- **Seitenverhältnis:** 4:5
- **Mindestauflösung:** 1200 × 1500 px
- **Verwendet auf:** Über uns, Startseite (Über-uns-Teaser)
- **Inhalt:** Porträt Gründer 2, Halbtotale, neutraler heller Hintergrund, freundlich, 4:5
- **Alt-Text:** Porträt eines Gründers von CleanStar im dunkelblauen Polo vor hellem Hintergrund
- **Status:** vorhanden

**Prompt:**

```
Real portrait photo of the second founder (use the real person, not generated), half-body, same setting, light and styling as founder 1, friendly confident look into the camera. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:5.
```

### 12. gruender-3

- **ID im Code:** `founder-3`
- **Pfad:** `bilder/gruender-3.jpg` → `public/images/gruender-3-<breite>.avif|webp`
- **Seitenverhältnis:** 4:5
- **Mindestauflösung:** 1200 × 1500 px
- **Verwendet auf:** Über uns (nur wenn drei Gründer in company.ts eingetragen sind)
- **Inhalt:** Porträt Gründer 3 (optional), gleicher Look wie Gründer 1 und 2, 4:5
- **Alt-Text:** Porträt eines Gründers von CleanStar im dunkelblauen Polo, lächelnd, vor hellem Hintergrund
- **Status:** vorhanden

**Prompt:**

```
Optional third founder portrait (real person), same setting, light and styling as founder 1 and 2. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:5.
```

### 13. team-im-einsatz

- **ID im Code:** `team-work`
- **Pfad:** `bilder/team-im-einsatz.jpg` → `public/images/team-im-einsatz-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Über uns, Karriere
- **Inhalt:** Team im Einsatz: zwei Reinigungskräfte in einheitlicher Kleidung im Büroflur, 16:9
- **Alt-Text:** Zwei CleanStar-Mitarbeitende reinigen einen Büroflur: einer saugt, eine wischt eine Glastür
- **Status:** vorhanden

**Prompt:**

```
Two professional cleaners in matching navy uniforms working calmly in a bright office corridor, one vacuuming, one wiping a glass door, natural movement, seen from a distance, documentary style. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 14. team-besprechung

- **ID im Code:** `team-briefing`
- **Pfad:** `bilder/team-besprechung.jpg` → `public/images/team-besprechung-<breite>.avif|webp`
- **Seitenverhältnis:** 4:3
- **Mindestauflösung:** 1600 × 1200 px
- **Verwendet auf:** Qualitätsgarantie
- **Inhalt:** Teambesprechung: Objektleitung zeigt Checkliste auf Tablet, 4:3
- **Alt-Text:** Objektleitung von CleanStar bespricht mit zwei Mitarbeitenden eine Checkliste auf dem Tablet
- **Status:** vorhanden

**Prompt:**

```
Cleaning team supervisor showing a checklist on a tablet to two team members in a modern office lobby, friendly and focused, natural light, hands and tablet in focus. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:3.
```

### 15. buero-am-morgen

- **ID im Code:** `trial-clean`
- **Pfad:** `bilder/buero-am-morgen.jpg` → `public/images/buero-am-morgen-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 1600 × 900 px
- **Verwendet auf:** Ablauf (Erster Monat)
- **Inhalt:** Sauberes Büro am Morgen: leere, aufgeräumte Arbeitsplätze im Tageslicht, 16:9
- **Alt-Text:** Aufgeräumtes, sauberes Großraumbüro im Morgenlicht, Schreibtische frei, Stühle ordentlich
- **Status:** vorhanden

**Prompt:**

```
Clean, tidy open-plan office in the morning, empty desks with monitors, chairs pushed in, bright daylight through large windows, calm and orderly. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 16. qualitaetskontrolle

- **ID im Code:** `quality-check`
- **Pfad:** `bilder/qualitaetskontrolle.jpg` → `public/images/qualitaetskontrolle-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Qualitätsgarantie
- **Inhalt:** Qualitätskontrolle: Hand mit Tablet-Checkliste prüft Schreibtischkante, 16:9
- **Alt-Text:** Qualitätskontrolle: CleanStar-Objektleiterin prüft mit Tablet eine Schreibtischfläche
- **Status:** vorhanden

**Prompt:**

```
Quality inspection in a clean office: a hand holding a tablet with a checklist while another hand runs a white glove along a desk edge, crisp focus, cool light, calm and precise mood. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 17. objektbesichtigung

- **ID im Code:** `inspection`
- **Pfad:** `bilder/objektbesichtigung.jpg` → `public/images/objektbesichtigung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Ablauf
- **Inhalt:** Objektbesichtigung: zwei Personen gehen durch leeres Büro, eine macht Notizen, 16:9
- **Alt-Text:** Objektbesichtigung: Begehung eines Büros mit Notizen zur Fläche
- **Status:** vorhanden

**Prompt:**

```
Two professionals walking through an empty modern office during a site inspection, one taking notes on a clipboard, pointing at the floor area, bright daylight, architectural wide shot. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 18. karriere

- **ID im Code:** `careers`
- **Pfad:** `bilder/karriere.jpg` → `public/images/karriere-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Karriere
- **Inhalt:** Karriere: Mitarbeiterin mit Reinigungswagen im Flur, freundlich, natürlich, 16:9
- **Alt-Text:** Zufriedene Mitarbeiterin von CleanStar mit Reinigungswagen im Büroflur
- **Status:** vorhanden

**Prompt:**

```
Friendly cleaning staff member in a navy uniform with a well-organized cleaning trolley in a bright office corridor, natural relaxed smile, documentary style, respectful and dignified. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 19. region-ortenau

- **ID im Code:** `region`
- **Pfad:** `bilder/region-ortenau.jpg` → `public/images/region-ortenau-<breite>.avif|webp`
- **Seitenverhältnis:** 21:9
- **Mindestauflösung:** 2560 × 1097 px
- **Verwendet auf:** Einzugsgebiet
- **Inhalt:** Region: modernes Bürogebäude, im Hintergrund Schwarzwaldhügel und Weinberge, 21:9
- **Alt-Text:** Gewerbegebiet mit modernen Bürogebäuden vor den Hügeln des Schwarzwalds
- **Status:** vorhanden

**Prompt:**

```
Modern low-rise office building in a small southern German town business park, vineyards and forested Black Forest hills in the background, late afternoon light, clear sky, wide panoramic composition. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 21:9.
```

### 20. kontakt

- **ID im Code:** `contact`
- **Pfad:** `bilder/kontakt.jpg` → `public/images/kontakt-<breite>.avif|webp`
- **Seitenverhältnis:** 4:3
- **Mindestauflösung:** 1600 × 1200 px
- **Verwendet auf:** Kontakt
- **Inhalt:** Kontakt: aufgeräumter Schreibtisch mit Smartphone und Notizblock, Draufsicht, 4:3
- **Alt-Text:** Telefon und Notizblock auf einem aufgeräumten Schreibtisch
- **Status:** vorhanden

**Prompt:**

```
Top-down view of a tidy light desk with a smartphone, a notebook with a pen and a cup of coffee, lots of negative space, soft daylight, minimal. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:3.
```

### 21. partner-hero

- **ID im Code:** `partner-hero`
- **Pfad:** `bilder/partner-hero.jpg` → `public/images/partner-hero-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Partnerprogramm (Hero)
- **Inhalt:** Partner: zwei Unternehmer per Handschlag im hellen Besprechungsraum, Tablet und Unterlagen auf dem Tisch, 16:9
- **Alt-Text:** Zwei Unternehmer geben sich in einem hellen Besprechungsraum die Hand
- **Status:** vorhanden

**Prompt:**

```
Two business owners in their late thirties shaking hands in a bright modern office meeting room, one in a navy quarter-zip, the other in a light shirt, warm and confident atmosphere, tablet and documents on a white table, large windows, seen at a slight angle, faces natural and friendly. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

### 22. partner-gruender

- **ID im Code:** `partner-founder`
- **Pfad:** `bilder/partner-gruender.jpg` → `public/images/partner-gruender-<breite>.avif|webp`
- **Seitenverhältnis:** 4:3
- **Mindestauflösung:** 1600 × 1200 px
- **Verwendet auf:** Partnerprogramm (Weg Gründung)
- **Inhalt:** Partner Gründung: junger Unternehmer mit weißem Transporter und Reinigungswagen vor Bürogebäude, morgens, 4:3
- **Alt-Text:** Gründer steht neben einem weißen Transporter und einem Reinigungswagen vor einem Bürogebäude
- **Status:** vorhanden

**Prompt:**

```
Young entrepreneur standing next to a clean white compact van and a neatly packed cleaning trolley in front of a modern office building in the morning, proud and calm, navy work jacket, documentary style, van without any branding. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:3.
```

### 23. partner-bestand

- **ID im Code:** `partner-existing`
- **Pfad:** `bilder/partner-bestand.jpg` → `public/images/partner-bestand-<breite>.avif|webp`
- **Seitenverhältnis:** 4:3
- **Mindestauflösung:** 1600 × 1200 px
- **Verwendet auf:** Partnerprogramm (Weg bestehende Firma)
- **Inhalt:** Partner bestehende Firma: Inhaber im aufgeräumten Materiallager mit Tablet-Checkliste, 4:3
- **Alt-Text:** Inhaberin einer Reinigungsfirma prüft im Materiallager eine Checkliste auf dem Tablet
- **Status:** vorhanden

**Prompt:**

```
Owner of a small cleaning company in a tidy storage room with shelves of labeled cleaning supplies and microfiber cloths, reviewing a checklist on a tablet, organized and professional, soft daylight. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 4:3.
```

### 24. partner-einarbeitung

- **ID im Code:** `partner-onboarding`
- **Pfad:** `bilder/partner-einarbeitung.jpg` → `public/images/partner-einarbeitung-<breite>.avif|webp`
- **Seitenverhältnis:** 16:9
- **Mindestauflösung:** 2400 × 1350 px
- **Verwendet auf:** Partnerprogramm (Modul Einarbeitung und Support)
- **Inhalt:** Partner Einarbeitung: Trainer erklärt Ablauf am großen Bildschirm, drei Teilnehmende mit Notizbüchern, 16:9
- **Alt-Text:** Einarbeitung: Trainer erklärt drei neuen Partnern einen Ablauf am Bildschirm
- **Status:** vorhanden

**Prompt:**

```
Onboarding session in a modern office: a trainer explains a cleaning process on a large screen showing simple abstract diagrams to three new partners sitting at a table with notebooks, engaged and focused, natural light. Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks. Aspect ratio 16:9.
```

## Bereits vorhanden (automatisch erzeugt)

- `public/og-image.png` (1200 × 630, Vorschaubild für Social Media, aus Logo erzeugt; kann durch ein Foto ersetzt werden)
- `public/favicon.svg`, `public/favicon.ico`, `public/favicon-48/96/192/512.png`, `public/apple-touch-icon.png` (erzeugt mit `node scripts/generate-favicons.mjs`), `public/logo.png` (erzeugt mit `node scripts/generate-assets.mjs`)

Gründerporträts bitte als echte Fotos der Gründer verwenden, nicht generieren.

## Shot-Liste für das Fotoshooting

Das neue Design zeigt jedes Bild in einem festen Rahmen mit festem Seitenverhältnis. Das Bild wird mittig beschnitten, deshalb gehört das Wichtige in die Bildmitte, mit Luft an allen Rändern. Alle Fotos bekommen auf der Website dieselbe leichte Farbbehandlung (etwas weniger Sättigung, minimal wärmer). Bitte neutral belichten und nicht stark nachbearbeiten.

### Allgemein

- Echte Räume, echte Menschen aus dem Team, keine gestellten Lächelmotive.
- Arbeitskleidung mit CleanStar-Logo, saubere Hände und Handschuhe.
- Natürliches Tageslicht oder ruhiges Abendlicht, keine Blitzreflexe auf Glas.
- Keine erkennbaren Kundendaten, Bildschirme oder Firmennamen Dritter im Bild.
- Pro Motiv bitte quer und hoch fotografieren, damit Desktop und Handy aus einer Aufnahme bedient werden können.

### Rahmen und Motive

| Rahmen | Seitenverhältnis | Wo | Motiv | Hinweis zum Beschnitt |
|---|---|---|---|---|
| Seitenkopf Unterseite | 21:9 ab Tablet, 4:3 auf dem Handy | Leistungen, Leistungsseiten, Qualitätsgarantie, Ablauf, Kontakt, Karriere, Partner | Eine Szene pro Seite: Reinigung im Büro, Fensterfront, Treppenhaus, Halle, Sanitär, Besichtigung mit Kunde, Kontrollgang mit Checkliste | Person oder Handlung im mittleren Drittel, oben und unten je ein Viertel Luft |
| Kernleistung Startseite | 21:9 Desktop, 3:2 Tablet, 4:5 Handy | Startseite, Leistungen | Büroreinigung am frühen Morgen, ein Teammitglied an einem Arbeitsplatz | Motiv genau mittig, weil von 21:9 bis 4:5 beschnitten wird |
| Leistungsliste Vorschau | frei im Rahmen, Hochformat | Startseite, Leistungen (beim Überfahren) | Je Leistung ein ruhiges Detailbild | Hochformat, Motiv mittig |
| Porträt | 4:5 | Über uns, Startseite, Kontakt, Ratgeber-Autor | Gründer einzeln vor ruhigem, hellem Hintergrund, Brusthöhe, Blick in die Kamera | Kopf im oberen Drittel, Schultern vollständig |
| Detail hoch | 4:5 | Büroreinigung, Qualitätsgarantie, Ablauf, Einzugsgebiet, Karriere, Partner | Detail einer Handlung: Tuch auf Tischfläche, Checkliste, Schlüsselübergabe, Teambesprechung, Gebäude in der Region | Hochformat, Hände oder Gegenstand mittig |
| Team breit | 3:2 | Über uns | Zwei bis drei Personen bei der Arbeit im Flur oder Büro | Personen im mittleren Bereich, Boden sichtbar |
| Vorher und Nachher | 16:9 | Büroreinigung | Derselbe Arbeitsplatz vorher und nachher, Stativ, gleiche Position und gleiches Licht | Kamera darf sich zwischen den Aufnahmen nicht bewegen |

### Zusätzlich gewünscht (sobald Freigaben vorliegen)

- Gebäude von Kunden, die einer Nennung zugestimmt haben, für den Bereich Belege (`src/content/proof.ts`).
- Ein Foto vom Sitz in der Prinz-Eugen-Straße für die Kontaktseite.
