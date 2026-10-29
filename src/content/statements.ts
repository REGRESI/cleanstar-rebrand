/**
 * Kernsätze der Unterseiten im Färbe-Effekt (ScrubStatement) und Problem/Lösung-Zeilen im Wisch-Effekt.
 * Nur Aussagen, die an anderer Stelle der Website belegt sind (Ablauf, Garantie, Leistungsverzeichnis, Fahrzeiten).
 * Bildmarken in eckigen Klammern verweisen auf die Kacheln in public/images/scrub/.
 */
import { places } from '@/content/places'

export const TILES = {
  buero: { alt: 'Gereinigter Schreibtisch im Büro' },
  morgen: { alt: 'Aufgeräumtes Büro am Morgen' },
  unterhalt: { alt: 'Gepflegter Praxisempfang' },
  fenster: { alt: 'Fensterreinigung mit dem Abzieher' },
  treppe: { alt: 'Sauberes Treppenhaus' },
  halle: { alt: 'Gereinigte Halle' },
  hygiene: { alt: 'Sauberer Sanitärbereich' },
  check: { alt: 'Qualitätskontrolle mit Checkliste' },
  besichtigung: { alt: 'Objektbesichtigung vor Ort' },
  einsatz: { alt: 'Reinigungsteam im Einsatz' },
  region: { alt: 'Landschaft im Ortenaukreis' },
  karriere: { alt: 'Mitarbeiterin bei der Arbeit' },
  partner: { alt: 'Gründer einer Partnerfirma' },
  besprechung: { alt: 'Besprechung im Team' },
  nachher: { alt: 'Sauberes Büro nach der Reinigung' },
  feierabend: { alt: 'Großraumbüro am Abend nach Feierabend' },
  schluessel: { alt: 'Büroschlüssel am Lederanhänger' },
  kaffee: { alt: 'Kaffee am Morgen' },
} as const
export type TileId = keyof typeof TILES

export type Statement = { text: string; final?: string; label: string }

export const statements = {
  leistungen: {
    label: 'Unser Grundsatz',
    text: 'Ob Büro [buero], Fenster oder Treppenhaus: ein Team und ein Ansprechpartner für alles. Was gereinigt wird, steht im Leistungsverzeichnis [check].',
    final: 'Schwarz auf weiß, bevor wir anfangen.',
  },
  garantie: {
    label: 'Unsere Zusage',
    text: 'Wir kontrollieren selbst, regelmäßig und nach Checkliste [check]. Fehlt doch etwas, reicht ein Anruf.',
    final: 'Die Nachreinigung kostet Sie nichts.',
  },
  ablauf: {
    label: 'Der Ablauf in einem Satz',
    text: 'Sie zeigen uns die Räume [besichtigung]. Innerhalb von 48 Stunden haben Sie das Angebot mit Leistungsverzeichnis. Dann kommt Ihr festes Team [einsatz],',
    final: 'zu den Zeiten, die Sie festlegen.',
  },
  einzugsgebiet: {
    label: 'Unser Einzugsgebiet',
    text: `Von Offenburg aus [region] reinigen wir in ${places.length} Orten im Ortenaukreis.`,
    final: 'Kurze Wege, feste Teams.',
  },
  karriere: {
    label: 'Arbeiten bei CleanStar',
    text: 'Feste Objekte [einsatz], planbare Zeiten und kurze Wege zur Leitung [karriere].',
    final: 'Beworben in zwei Minuten, ohne Lebenslauf.',
  },
  partner: {
    label: 'Das Partnerprogramm',
    text: 'Die Abläufe, die wir in Offenburg täglich einsetzen [check], für Ihren Betrieb in Ihrer Region [partner].',
    final: 'Mit Marke, Vorlagen und eigener Regionalseite.',
  },
  faq: {
    label: 'Häufige Fragen',
    text: 'Kosten, Vertrag, Ablauf und Organisation [besprechung]: Hier stehen die Antworten, die Geschäftsführer am häufigsten brauchen.',
    final: 'Alles andere klären wir am Telefon, rund um die Uhr.',
  },
} satisfies Record<string, Statement>

/** Kernsatz je Leistungsseite (aus der Kurzbeschreibung der Leistung, mit Bild) */
export const serviceStatements: Record<string, Statement> = {
  bueroreinigung: { label: 'Büroreinigung in einem Satz', text: 'Sie kommen morgens in ein sauberes Büro [morgen].', final: 'Jeden Tag, nach festem Plan, mit demselben Team.' },
  unterhaltsreinigung: {
    label: 'Unterhaltsreinigung in einem Satz',
    text: 'Praxis, Kanzlei oder Verwaltung [unterhalt] bleiben dauerhaft gepflegt,',
    final: 'ohne dass Sie daran denken müssen.',
  },
  fensterreinigung: {
    label: 'Fensterreinigung in einem Satz',
    text: 'Klare Sicht [fenster] und ein Eingang, der Besucher überzeugt.',
    final: 'Innen und außen, inklusive Rahmen.',
  },
  treppenhausreinigung: {
    label: 'Treppenhausreinigung in einem Satz',
    text: 'Der erste Eindruck stimmt [treppe]: gepflegter Eingang, saubere Treppen,',
    final: 'glänzende Handläufe.',
  },
  hallenreinigung: { label: 'Hallenreinigung in einem Satz', text: 'Sichere, saubere Wege in Lager und Produktion [halle].', final: 'Mit Maschinen, die zu Ihrer Fläche passen.' },
  hygienereinigung: {
    label: 'Hygienereinigung in einem Satz',
    text: 'Sanitär und Küchen [hygiene], auf die sich Ihr Team verlassen kann.',
    final: 'Gründlich gereinigt und desinfiziert.',
  },
}

/** Wisch-Effekt (Problem wird weggewischt, Lösung färbt sich ein) */
export const wipes = {
  bueroreinigung: {
    eyebrow: 'Vorher, nachher',
    headline: 'Was sich ändert, wenn die Büroreinigung einfach läuft.',
    lead: 'Drei Situationen aus dem Büroalltag und wie sie bei uns geregelt sind.',
    items: [
      { problem: 'Montagmorgen: Mülleimer voll, Teeküche verklebt.', solution: 'Gereinigt nach festem Plan, bevor Ihr Team ins Büro kommt.' },
      { problem: 'Niemand weiß genau, was eigentlich gereinigt wird.', solution: 'Das Leistungsverzeichnis hält jeden Raum und jedes Intervall fest.' },
      { problem: 'Die Reinigungskraft ist im Urlaub, das Büro bleibt liegen.', solution: 'Eine eingewiesene Vertretung übernimmt, ohne dass Sie etwas organisieren.' },
    ],
  },
  garantie: {
    eyebrow: 'Ohne und mit Garantie',
    headline: 'Was eine Garantie im Alltag bedeutet.',
    lead: 'Drei Dinge, die bei vielen Reinigungsfirmen offen bleiben. Bei uns stehen sie fest.',
    items: [
      { problem: 'Reklamationen versanden in einer Warteschleife.', solution: 'Ihr fester Ansprechpartner nimmt sie auf und kümmert sich selbst.' },
      { problem: 'Mängel fallen erst auf, wenn Kunden sie sehen.', solution: 'Wir prüfen vorher, regelmäßig und nach Checkliste.' },
      { problem: 'Nachbessern kostet extra.', solution: 'Fehlt etwas, reinigen wir kostenlos nach.' },
    ],
  },
}
