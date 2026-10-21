/**
 * BILDER – Verzeichnis aller Bilder der Website.
 *
 * So tauschen Sie einen Platzhalter gegen ein echtes Foto:
 * 1. Foto als JPG/PNG unter `bilder/<file>.jpg` ablegen (Dateiname siehe `file`).
 * 2. `npm run images` ausführen. Das erzeugt AVIF + WebP in mehreren Größen unter public/images/.
 * 3. Hier bei dem Bild `available: true` setzen.
 *
 * Die Datei BILDER.md wird aus dieser Liste erzeugt (`npm run docs:bilder`).
 */

export type Ratio = '16:9' | '4:3' | '3:2' | '4:5' | '1:1' | '21:9' | '3:4'

export interface ImageSpec {
  /** Dateiname ohne Endung */
  file: string
  ratio: Ratio
  /** Mindestbreite der Vorlage in Pixeln */
  minWidth: number
  /** Alt-Text (Deutsch, beschreibend) */
  alt: string
  /** Beschriftung des Platzhalters */
  label: string
  /** Bild-Prompt (Englisch) für die Bildgenerierung */
  prompt: string
  /** true, sobald das echte Bild unter public/images liegt */
  available: boolean
  /** Bildausschnitt, wenn das Foto beschnitten wird (CSS object-position), z. B. '50% 30%' */
  position?: string
  /** Wo das Bild verwendet wird (nur zur Dokumentation) */
  usedOn: string
}

/** Einheitlicher Look für alle Bild-Prompts */
export const STYLE =
  'Photorealistic editorial photography, calm premium look, soft natural light with cool daylight tones and subtle blue accents, clean modern architecture, precise composition with lots of negative space, muted color palette (white, light grey, navy, hints of aqua), shot on full-frame camera, 35mm lens, f/2.8, high dynamic range, no text, no logos, no watermarks'

const img = (s: Omit<ImageSpec, 'available'> & { available?: boolean }): ImageSpec => ({ available: false, ...s })

export const images = {
  'before-office': img({
    file: 'vorher-buero',
    available: true,
    ratio: '16:9',
    minWidth: 1920,
    alt: 'Schreibtisch vor der Reinigung mit Kaffeetassen, Krümeln und Staub auf dem Monitor',
    label: 'VORHER: Arbeitsplatz am Abend, benutzte Tassen, Krümel, Fingerabdrücke, Staub, 16:9',
    prompt:
      'Modern open-plan office desk in the evening after a workday, used coffee mugs, crumbs, sticky notes, fingerprints on the glass desk divider, light dust on the monitor stand, slightly dim warm overhead light, same camera position as the matching after-image, eye level, wide angle',
    usedOn: 'Startseite (Vorher/Nachher), Büroreinigung',
  }),
  'after-office': img({
    file: 'nachher-buero',
    available: true,
    ratio: '16:9',
    minWidth: 1920,
    alt: 'Derselbe Schreibtisch nach der Reinigung, aufgeräumt, glänzende Oberflächen',
    label: 'NACHHER: derselbe Arbeitsplatz, identischer Bildausschnitt, makellos sauber, 16:9',
    prompt:
      'The exact same modern open-plan office desk from the identical camera position, now spotless: clear desk surface, polished glass divider without fingerprints, dust-free monitor, chair neatly pushed in, bright clean morning daylight, fresh and calm atmosphere',
    usedOn: 'Startseite (Vorher/Nachher), Büroreinigung',
  }),
  'svc-buero': img({
    file: 'leistung-bueroreinigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'CleanStar-Mitarbeiterin wischt mit Handschuhen und Mikrofasertuch einen Schreibtisch in einem hellen Großraumbüro',
    label: 'Reinigungskraft wischt Schreibtisch in hellem Großraumbüro, Tageslicht, 16:9',
    prompt:
      'Cleaner in navy CleanStar uniform wiping a white desk with blue gloves and a microfiber cloth in a bright open-plan office at daytime, natural light through large windows, focused and calm',
    // Person steht links: Ausschnitt nach links oben, damit Gesicht und Hände mit dem Tuch bei jedem Format sichtbar bleiben
    position: '20% 20%',
    usedOn: 'Büroreinigung (Hero), Leistungskarte Startseite und Leistungsübersicht',
  }),
  'svc-buero-detail': img({
    file: 'bueroreinigung-detail',
    available: true,
    ratio: '4:3',
    minWidth: 1600,
    alt: 'Nahaufnahme: Hand im Handschuh reinigt eine Tastatur mit Mikrofasertuch, daneben ein Telefon',
    label: 'Detail: Mikrofasertuch auf Tastatur und Telefon, Nahaufnahme, 4:3',
    prompt: 'Close-up of a gloved hand with a blue microfiber cloth cleaning a keyboard and desk phone in a modern office, shallow depth of field, crisp detail, cool daylight',
    usedOn: 'Büroreinigung',
  }),
  'svc-unterhalt': img({
    file: 'leistung-unterhaltsreinigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Heller Empfangsbereich mit frisch gewischtem Steinboden, am Rand ein CleanStar-Reinigungswagen',
    label: 'Empfangsbereich eines Unternehmens, frisch gewischter Steinboden, Morgenlicht, 16:9',
    prompt:
      'Bright corporate reception area in the early morning, freshly mopped light stone floor with subtle reflections, cleaning trolley parked discreetly at the edge, nobody in focus, calm architectural composition',
    usedOn: 'Unterhaltsreinigung (Hero), Leistungskarte',
  }),
  'svc-fenster': img({
    file: 'leistung-fensterreinigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'CleanStar-Mitarbeiter reinigt eine große Bürofensterfront mit dem Abzieher',
    label: 'Fensterreinigung: Abzieher auf großer Glasfläche, streifenfrei, Gegenlicht, 16:9',
    prompt:
      'Window cleaner using a squeegee on a large floor-to-ceiling office window, streak-free glass, soft backlight, view to green hills in the distance, clean lines, from inside the office',
    usedOn: 'Fensterreinigung (Hero), Leistungskarte',
  }),
  'svc-treppenhaus': img({
    file: 'leistung-treppenhausreinigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Sauberes, helles Treppenhaus mit Edelstahlgeländer und großem Fenster',
    label: 'Helles Treppenhaus eines Geschäftshauses, sauberer Handlauf, Stufen von oben, 16:9',
    prompt:
      'Clean bright stairwell of a modern commercial building seen from above, polished concrete steps, gleaming stainless steel handrail, natural light from a tall window, geometric composition',
    usedOn: 'Treppenhausreinigung (Hero), Leistungskarte',
  }),
  'svc-halle': img({
    file: 'leistung-hallenreinigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'CleanStar-Mitarbeiter reinigt eine Lagerhalle mit der Aufsitz-Scheuersaugmaschine',
    label: 'Gewerbehalle, Scheuersaugmaschine auf sauberem Hallenboden, weite Perspektive, 16:9',
    prompt:
      'Large clean commercial warehouse hall with high ceilings, a ride-on floor scrubber leaving a glossy clean path on the grey epoxy floor, orderly shelving, cool daylight from skylights, wide perspective',
    usedOn: 'Hallenreinigung (Hero), Leistungskarte',
  }),
  'svc-hygiene': img({
    file: 'leistung-hygienereinigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Gereinigter Sanitärbereich in einem Bürogebäude mit Waschtisch, Spiegel und Papierspendern',
    label: 'Sanitärbereich im Büro, glänzende Armaturen, frisch gereinigt, kühles Licht, 16:9',
    prompt:
      'Spotless modern office restroom with white basins, gleaming chrome faucets, large mirror without streaks, neatly stocked paper dispensers, cool clean light, minimal architectural style',
    usedOn: 'Hygienereinigung (Hero), Leistungskarte',
  }),
  'founder-1': img({
    available: true,
    file: 'gruender-1',
    ratio: '4:5',
    minWidth: 1200,
    alt: 'Porträt eines Gründers von CleanStar im dunkelblauen Polo in einem hellen Büro',
    label: 'Porträt Gründer 1, Halbtotale, neutraler heller Hintergrund, freundlich, 4:5',
    prompt:
      'Real portrait photo of the founder (use the real person, not generated), half-body, standing in a bright modern office, navy polo shirt or shirt, friendly confident look into the camera, soft window light, light background',
    usedOn: 'Über uns, Startseite (Über-uns-Teaser)',
  }),
  'founder-2': img({
    available: true,
    file: 'gruender-2',
    ratio: '4:5',
    minWidth: 1200,
    alt: 'Porträt eines Gründers von CleanStar im dunkelblauen Polo vor hellem Hintergrund',
    label: 'Porträt Gründer 2, Halbtotale, neutraler heller Hintergrund, freundlich, 4:5',
    prompt:
      'Real portrait photo of the second founder (use the real person, not generated), half-body, same setting, light and styling as founder 1, friendly confident look into the camera',
    usedOn: 'Über uns, Startseite (Über-uns-Teaser)',
  }),
  'founder-3': img({
    available: true,
    file: 'gruender-3',
    ratio: '4:5',
    minWidth: 1200,
    alt: 'Porträt eines Gründers von CleanStar im dunkelblauen Polo, lächelnd, vor hellem Hintergrund',
    label: 'Porträt Gründer 3 (optional), gleicher Look wie Gründer 1 und 2, 4:5',
    prompt: 'Optional third founder portrait (real person), same setting, light and styling as founder 1 and 2',
    usedOn: 'Über uns (nur wenn drei Gründer in company.ts eingetragen sind)',
  }),
  'team-work': img({
    file: 'team-im-einsatz',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Zwei CleanStar-Mitarbeitende reinigen einen Büroflur: einer saugt, eine wischt eine Glastür',
    label: 'Team im Einsatz: zwei Reinigungskräfte in einheitlicher Kleidung im Büroflur, 16:9',
    prompt:
      'Two professional cleaners in matching navy uniforms working calmly in a bright office corridor, one vacuuming, one wiping a glass door, natural movement, seen from a distance, documentary style',
    usedOn: 'Über uns, Karriere',
  }),
  'team-briefing': img({
    file: 'team-besprechung',
    available: true,
    ratio: '4:3',
    minWidth: 1600,
    alt: 'Objektleitung von CleanStar bespricht mit zwei Mitarbeitenden eine Checkliste auf dem Tablet',
    label: 'Teambesprechung: Objektleitung zeigt Checkliste auf Tablet, 4:3',
    prompt: 'Cleaning team supervisor showing a checklist on a tablet to two team members in a modern office lobby, friendly and focused, natural light, hands and tablet in focus',
    usedOn: 'Qualitätsgarantie',
  }),
  'trial-clean': img({
    file: 'buero-am-morgen',
    available: true,
    ratio: '16:9',
    minWidth: 1600,
    alt: 'Aufgeräumtes, sauberes Großraumbüro im Morgenlicht, Schreibtische frei, Stühle ordentlich',
    label: 'Sauberes Büro am Morgen: leere, aufgeräumte Arbeitsplätze im Tageslicht, 16:9',
    prompt: 'Clean, tidy open-plan office in the morning, empty desks with monitors, chairs pushed in, bright daylight through large windows, calm and orderly',
    usedOn: 'Ablauf (Erster Monat)',
  }),
  'quality-check': img({
    file: 'qualitaetskontrolle',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Qualitätskontrolle: CleanStar-Objektleiterin prüft mit Tablet eine Schreibtischfläche',
    label: 'Qualitätskontrolle: Hand mit Tablet-Checkliste prüft Schreibtischkante, 16:9',
    prompt:
      'Quality inspection in a clean office: a hand holding a tablet with a checklist while another hand runs a white glove along a desk edge, crisp focus, cool light, calm and precise mood',
    usedOn: 'Qualitätsgarantie',
  }),
  inspection: img({
    file: 'objektbesichtigung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Objektbesichtigung: Begehung eines Büros mit Notizen zur Fläche',
    label: 'Objektbesichtigung: zwei Personen gehen durch leeres Büro, eine macht Notizen, 16:9',
    prompt:
      'Two professionals walking through an empty modern office during a site inspection, one taking notes on a clipboard, pointing at the floor area, bright daylight, architectural wide shot',
    usedOn: 'Ablauf',
  }),
  careers: img({
    file: 'karriere',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Zufriedene Mitarbeiterin von CleanStar mit Reinigungswagen im Büroflur',
    label: 'Karriere: Mitarbeiterin mit Reinigungswagen im Flur, freundlich, natürlich, 16:9',
    prompt:
      'Friendly cleaning staff member in a navy uniform with a well-organized cleaning trolley in a bright office corridor, natural relaxed smile, documentary style, respectful and dignified',
    usedOn: 'Karriere',
  }),
  region: img({
    file: 'region-ortenau',
    available: true,
    ratio: '21:9',
    minWidth: 2560,
    alt: 'Gewerbegebiet mit modernen Bürogebäuden vor den Hügeln des Schwarzwalds',
    label: 'Region: modernes Bürogebäude, im Hintergrund Schwarzwaldhügel und Weinberge, 21:9',
    prompt:
      'Modern low-rise office building in a small southern German town business park, vineyards and forested Black Forest hills in the background, late afternoon light, clear sky, wide panoramic composition',
    usedOn: 'Einzugsgebiet',
  }),
  contact: img({
    file: 'kontakt',
    available: true,
    ratio: '4:3',
    minWidth: 1600,
    alt: 'Telefon und Notizblock auf einem aufgeräumten Schreibtisch',
    label: 'Kontakt: aufgeräumter Schreibtisch mit Smartphone und Notizblock, Draufsicht, 4:3',
    prompt: 'Top-down view of a tidy light desk with a smartphone, a notebook with a pen and a cup of coffee, lots of negative space, soft daylight, minimal',
    usedOn: 'Kontakt',
  }),
  'partner-hero': img({
    file: 'partner-hero',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Zwei Unternehmer geben sich in einem hellen Besprechungsraum die Hand',
    label: 'Partner: zwei Unternehmer per Handschlag im hellen Besprechungsraum, Tablet und Unterlagen auf dem Tisch, 16:9',
    prompt:
      'Two business owners in their late thirties shaking hands in a bright modern office meeting room, one in a navy quarter-zip, the other in a light shirt, warm and confident atmosphere, tablet and documents on a white table, large windows, seen at a slight angle, faces natural and friendly',
    usedOn: 'Partnerprogramm (Hero)',
  }),
  'partner-founder': img({
    file: 'partner-gruender',
    available: true,
    ratio: '4:3',
    minWidth: 1600,
    alt: 'Gründer steht neben einem weißen Transporter und einem Reinigungswagen vor einem Bürogebäude',
    label: 'Partner Gründung: junger Unternehmer mit weißem Transporter und Reinigungswagen vor Bürogebäude, morgens, 4:3',
    prompt:
      'Young entrepreneur standing next to a clean white compact van and a neatly packed cleaning trolley in front of a modern office building in the morning, proud and calm, navy work jacket, documentary style, van without any branding',
    usedOn: 'Partnerprogramm (Weg Gründung)',
  }),
  'partner-existing': img({
    file: 'partner-bestand',
    available: true,
    ratio: '4:3',
    minWidth: 1600,
    alt: 'Inhaberin einer Reinigungsfirma prüft im Materiallager eine Checkliste auf dem Tablet',
    label: 'Partner bestehende Firma: Inhaber im aufgeräumten Materiallager mit Tablet-Checkliste, 4:3',
    prompt:
      'Owner of a small cleaning company in a tidy storage room with shelves of labeled cleaning supplies and microfiber cloths, reviewing a checklist on a tablet, organized and professional, soft daylight',
    usedOn: 'Partnerprogramm (Weg bestehende Firma)',
  }),
  'partner-onboarding': img({
    file: 'partner-einarbeitung',
    available: true,
    ratio: '16:9',
    minWidth: 2400,
    alt: 'Einarbeitung: Trainer erklärt drei neuen Partnern einen Ablauf am Bildschirm',
    label: 'Partner Einarbeitung: Trainer erklärt Ablauf am großen Bildschirm, drei Teilnehmende mit Notizbüchern, 16:9',
    prompt:
      'Onboarding session in a modern office: a trainer explains a cleaning process on a large screen showing simple abstract diagrams to three new partners sitting at a table with notebooks, engaged and focused, natural light',
    usedOn: 'Partnerprogramm (Modul Einarbeitung und Support)',
  }),
} satisfies Record<string, ImageSpec>

export type ImageId = keyof typeof images

/** Breiten, in denen `npm run images` Varianten erzeugt */
export const IMAGE_WIDTHS = [640, 1024, 1600, 2400] as const
