/**
 * PARTNERPROGRAMM – alle Texte, Module, Regionen, FAQ und Schalter für /partner.
 *
 * Rechtlicher Rahmen (bitte beibehalten):
 * - Keine Umsatz-, Gewinn- oder Verdienstversprechen, keine Beispielrechnungen.
 * - Keine erfundenen Partnerzahlen, Standorte oder Partnerstimmen.
 * - Anfragen sind unverbindlich. Verbindlich ist erst ein schriftlicher Partnervertrag.
 *
 * `todo` = Punkt ist noch nicht bestätigt. Auf der Website erscheint ein gelber Hinweis,
 * solange company.showTodoMarkers auf true steht.
 */
import type { ImageId } from './images'

export type PartnerWay = 'bestand' | 'gruendung'
export type RegionStatus = 'stammgebiet' | 'gesucht' | 'vergeben'

/* ------------------------------------------------------------------ */
/* Schalter                                                            */
/* ------------------------------------------------------------------ */
export const partnerFlags = {
  /** Konditionen (Gebühren, Laufzeit, Gebietsschutz) anzeigen. Erst einschalten, wenn alles rechtlich geprüft ist. */
  showConditions: false,
  /** Zusätzlich eine Deutschland-Ansicht (Bundesländer) in der Regionen-Karte anbieten */
  showGermany: true,
  /** Partnerstimmen anzeigen (nur echte Zitate mit Einverständnis) */
  showTestimonials: false,
}

/* ------------------------------------------------------------------ */
/* Seite                                                               */
/* ------------------------------------------------------------------ */
export const partnerPage = {
  seoTitle: 'Partnerprogramm Reinigungsfirma',
  seoDescription:
    'Werden Sie CleanStar-Partner: für Reinigungsfirmen und Gründer in ganz Deutschland. Erprobte Abläufe für Büroreinigung, Qualitätssystem und Einarbeitung.',
  hero: {
    eyebrow: 'Partnerprogramm',
    headline: 'Werden Sie CleanStar-Partner in Ihrer Region.',
    sub: 'Für Reinigungsfirmen, die professioneller auftreten und mehr Geschäftskunden gewinnen wollen. Und für Gründer, die nicht bei null anfangen möchten. Mit den Abläufen, die wir in Offenburg täglich einsetzen.',
    note: 'Ihre Anfrage ist unverbindlich. Verbindlich ist erst ein schriftlicher Partnervertrag.',
  },
  problems: {
    eyebrow: 'Warum ein Partnersystem',
    headline: 'Viele kleine Reinigungsfirmen arbeiten gut. Und verkaufen sich unter Wert.',
    lead: 'Die Probleme sind fast immer dieselben. Ein System löst sie nicht über Nacht, aber es nimmt Ihnen das Erfinden ab.',
    items: [
      {
        problem: 'Kunden werden über den Preis gewonnen, nicht über Qualität.',
        solution: 'Ein klarer Auftritt mit Qualitätsgarantie und festem Ablauf, der Geschäftskunden überzeugt, bevor über den Preis gesprochen wird.',
      },
      {
        problem: 'Kein professioneller Auftritt.',
        solution: 'Marke, Vorlagen und eine eigene Regionalseite auf der CleanStar-Website. Einheitlich und wiedererkennbar.',
      },
      {
        problem: 'Angebote entstehen aus dem Bauch heraus.',
        solution: 'Objektbesichtigung nach Checkliste und Kalkulation auf Stundenbasis. Nachvollziehbar für Sie und für den Kunden.',
      },
      {
        problem: 'Qualitätskontrolle passiert, wenn sich jemand beschwert.',
        solution: 'Checklisten, regelmäßige Kontrollen und ein fester Reklamationsprozess. Qualität wird messbar.',
      },
      {
        problem: 'Alles hängt am Inhaber.',
        solution: 'Dokumentierte Abläufe für Einsatzplanung, Schlüssel und Vertretung. Damit der Betrieb auch läuft, wenn Sie nicht vor Ort sind.',
      },
    ],
  },
  expectations: {
    eyebrow: 'Was wir erwarten',
    headline: 'Ein Partnersystem funktioniert nur, wenn alle denselben Anspruch haben.',
    lead: 'Wir sagen offen, was wir von Partnern erwarten. Das spart beiden Seiten Zeit.',
    items: [
      { title: 'Qualitätsanspruch', text: 'Sie wollen nicht die günstigste, sondern eine verlässliche Reinigung anbieten.' },
      { title: 'CleanStar-Standards', text: 'Sie arbeiten nach den gemeinsamen Abläufen und tragen die Qualitätsgarantie gegenüber Ihren Kunden mit.' },
      { title: 'Fokus auf Geschäftskunden', text: 'Schwerpunkt ist die Büro- und Unterhaltsreinigung für Unternehmen, nicht die Privatwohnung.' },
      { title: 'Unternehmerische Verantwortung', text: 'Sie führen Ihren Betrieb selbstständig, mit eigenem Team und eigener Kundenbeziehung.' },
      { title: 'Gewerbe und Versicherung', text: 'Gewerbeanmeldung und eine passende Betriebshaftpflicht sind Voraussetzung.' },
    ],
  },
  closing: {
    eyebrow: 'Nächster Schritt',
    headline: 'Lernen wir uns kennen.',
    text: 'Ein erstes Gespräch kostet Sie nichts und verpflichtet zu nichts. Wir hören zu, beantworten Ihre Fragen und sagen Ihnen ehrlich, ob wir zusammenpassen.',
  },
  conditionsFallback: 'Die Konditionen besprechen wir transparent im persönlichen Gespräch.',
  legalNote:
    'Alle Angaben auf dieser Seite beschreiben das geplante Partnerprogramm und sind unverbindlich. Verbindliche Rechte und Pflichten ergeben sich ausschließlich aus einem schriftlichen Partnervertrag. Vor Vertragsschluss erhalten Sie alle Informationen, die Sie für Ihre Entscheidung brauchen.',
}

/* ------------------------------------------------------------------ */
/* Zwei Wege                                                           */
/* ------------------------------------------------------------------ */
export const partnerWays: Record<PartnerWay, { label: string; short: string; headline: string; text: string; image: ImageId; benefits: string[] }> = {
  bestand: {
    label: 'Ich habe bereits eine Reinigungsfirma',
    short: 'Bestehende Firma',
    headline: 'Mehr Geschäftskunden. Mit einem System, das bereits funktioniert.',
    text: 'Sie haben Kunden, Mitarbeitende und Erfahrung. Was oft fehlt, sind ein Auftritt, der bei Unternehmen überzeugt, und Abläufe, die nicht nur im Kopf des Inhabers existieren. Genau da setzt das Partnerprogramm an.',
    image: 'partner-existing',
    benefits: [
      'Professioneller Auftritt gegenüber Geschäftskunden',
      'Erprobte Abläufe von der Besichtigung bis zur Qualitätskontrolle',
      'Kalkulation auf Stundenbasis statt Schätzung',
      'Austausch mit CleanStar und weiteren Partnern',
    ],
  },
  gruendung: {
    label: 'Ich möchte eine Reinigungsfirma gründen',
    short: 'Gründung',
    headline: 'Selbstständig werden. Ohne bei null anzufangen.',
    text: 'Sie wollen ein eigenes Unternehmen aufbauen und suchen einen Rahmen, der Ihnen Fehler erspart, die andere schon gemacht haben. Wir geben Ihnen Abläufe, Vorlagen und eine Einarbeitung mit. Den Betrieb führen Sie selbst.',
    image: 'partner-founder',
    benefits: [
      'Einarbeitung in Abläufe, Kalkulation und Vertrieb',
      'Vorlagen für Angebote, Verträge und Personalsuche',
      'Fester Ansprechpartner in der Startphase',
      'Eine Marke, die Sie nicht selbst aufbauen müssen',
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Module: Was Partner bekommen                                        */
/* ------------------------------------------------------------------ */
export interface PartnerModule {
  id: string
  enabled: boolean
  title: string
  summary: string
  items: string[]
  icon: 'brand' | 'sales' | 'quality' | 'organisation' | 'people' | 'support'
  image?: ImageId
  /** Hinweis, solange der Punkt nicht bestätigt ist */
  todo?: string
}

export const partnerModules: PartnerModule[] = [
  {
    id: 'marke',
    enabled: true,
    icon: 'brand',
    title: 'Marke und Auftritt',
    summary: 'Ein Auftritt, der bei Geschäftskunden vom ersten Tag an Vertrauen schafft.',
    items: ['Name und Logo von CleanStar', 'Einheitliche Arbeitskleidung', 'Vorlagen für Angebote und Rechnungen', 'Eigene Regionalseite auf unserer Website'],
  },
  {
    id: 'vertrieb',
    enabled: true,
    icon: 'sales',
    title: 'Vertrieb',
    summary: 'Vom ersten Kontakt bis zum unterschriebenen Auftrag.',
    items: ['Ablauf der Objektbesichtigung', 'Kalkulation auf Stundenbasis', 'Angebotsvorlagen mit Leistungsverzeichnis', 'Gesprächsleitfaden für Geschäftskunden'],
  },
  {
    id: 'qualitaet',
    enabled: true,
    icon: 'quality',
    title: 'Qualität',
    summary: 'Unsere Checklisten, Qualitätskontrollen und Qualitätsgarantie gelten 1:1 auch für Partner.',
    items: ['Checklisten je Leistung und Objekt', 'Regelmäßige Qualitätskontrollen', 'Fester Ablauf bei Reklamationen', 'Die CleanStar-Qualitätsgarantie für Ihre Kunden'],
  },
  {
    id: 'organisation',
    enabled: true,
    icon: 'support',
    title: 'Organisation, Personal, Einarbeitung',
    summary: 'Sie stehen nicht allein da.',
    items: [
      'Persönliche Einarbeitung direkt bei Ihnen vor Ort oder bei uns in Offenburg, ganz wie es Ihnen passt',
      'Einsatzplanung, Schlüsselmanagement und Vertretungsregelung',
      'Danach ein fester Ansprechpartner bei CleanStar',
      'Regelmäßiger Austausch',
    ],
    image: 'partner-onboarding',
  },
]

/* ------------------------------------------------------------------ */
/* Ablauf                                                              */
/* ------------------------------------------------------------------ */
export const partnerSteps = [
  { title: 'Unverbindliche Anfrage', duration: 'ca. 2 Minuten', text: 'Über das Formular auf dieser Seite oder telefonisch. Wir melden uns persönlich bei Ihnen.' },
  { title: 'Erstgespräch', duration: 'telefonisch oder per Video', text: 'Wir lernen uns kennen, beantworten Ihre Fragen und erklären das Partnerprogramm.' },
  { title: 'Kennenlernen in Offenburg', duration: 'vor Ort', text: 'Sie sehen, wie wir arbeiten, und lernen das Team und die Abläufe kennen.' },
  { title: 'Prüfung', duration: 'Region und Voraussetzungen', text: 'Gemeinsam prüfen wir Ihre Region, Ihre Voraussetzungen und ob die Zusammenarbeit für beide Seiten passt.' },
  { title: 'Partnervertrag', duration: 'schriftlich', text: 'Erst jetzt wird es verbindlich. Sie erhalten alle Unterlagen vorab und haben Zeit, sie prüfen zu lassen.' },
  { title: 'Einarbeitung', duration: 'bei Ihnen oder in Offenburg', text: 'Abläufe, Kalkulation, Qualitätssystem und Vertrieb, Schritt für Schritt. Wo, entscheiden Sie.' },
  { title: 'Start in Ihrer Region', duration: 'mit Begleitung', text: 'Sie starten mit festem Ansprechpartner an Ihrer Seite.' },
]

/* ------------------------------------------------------------------ */
/* Konditionen (nur sichtbar bei showConditions: true)                 */
/* ------------------------------------------------------------------ */
export const partnerConditions = [
  // Konditionen eintragen und anwaltlich prüfen lassen, dann partnerFlags.showConditions auf true (siehe OFFENE-PUNKTE.md)
  { label: 'Einstiegsgebühr', value: null as string | null },
  { label: 'Laufende Gebühr', value: null as string | null },
  { label: 'Vertragslaufzeit', value: null as string | null },
  { label: 'Gebietsschutz', value: null as string | null },
]

/* ------------------------------------------------------------------ */
/* Bewerbungsformular: Auswahllisten                                   */
/* ------------------------------------------------------------------ */
export const partnerFormOptions = {
  employees: ['nur ich', '1 bis 5', '6 bis 20', 'mehr als 20'],
  businessShare: ['unter 25 %', '25 bis 50 %', '50 bis 75 %', 'über 75 %'],
  start: ['sofort', 'in 3 Monaten', 'in 6 Monaten', 'später'],
  mode: ['hauptberuflich', 'nebenberuflich', 'noch offen'],
  /** Nur eine grobe Selbsteinschätzung der Interessenten, keine Angabe zu Kosten des Partnerprogramms */
  investment: ['unter 10.000 €', '10.000 bis 25.000 €', '25.000 bis 50.000 €', 'über 50.000 €', 'Möchte ich lieber im Gespräch klären'],
  callback: ['vormittags', 'mittags', 'nachmittags', 'abends', 'egal'],
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
export const partnerFaqs: { q: string; a: string; todo?: string }[] = [
  {
    q: 'Was kostet der Einstieg?',
    a: 'Die Konditionen besprechen wir transparent im persönlichen Gespräch. Bevor Sie etwas unterschreiben, liegen Ihnen alle Kosten schriftlich vor.',
  },
  {
    q: 'Brauche ich Erfahrung in der Reinigungsbranche?',
    a: 'Erfahrung hilft, ist aber nicht in jedem Fall Voraussetzung. Wichtiger sind unternehmerisches Denken, Organisationstalent und ein hoher Qualitätsanspruch. Was Ihnen fachlich fehlt, ist Teil der Einarbeitung.',
  },
  {
    q: 'Muss ich meinen bisherigen Firmennamen aufgeben?',
    a: 'Das klären wir im Gespräch. Wie der Auftritt unter der Marke CleanStar aussieht, regelt der Partnervertrag.',
  },
  {
    q: 'Gibt es Gebietsschutz?',
    a: 'Ob und in welchem Umfang es einen Gebietsschutz gibt, legen wir im Partnervertrag fest. Auf der Karte sehen Sie, welche Regionen noch frei sind.',
  },
  {
    q: 'Wie lange läuft ein Partnervertrag?',
    a: 'Die Laufzeit steht im Partnervertrag. Sie erhalten ihn vorab und haben ausreichend Zeit, ihn in Ruhe prüfen zu lassen.',
  },
  {
    q: 'Wie viel Startkapital brauche ich?',
    a: 'Das hängt davon ab, ob Sie bereits eine Firma haben oder neu gründen, und von Ihrer Region. Wir sprechen das im Erstgespräch offen durch. Im Formular können Sie optional angeben, welchen Rahmen Sie sich vorstellen.',
  },
  {
    q: 'Wer gewinnt die Kunden in meiner Region?',
    a: 'Die Kundengewinnung vor Ort liegt in Ihrer Verantwortung als Unternehmer. Wir unterstützen Sie mit Auftritt, Vorlagen und Gesprächsleitfaden. Ob Anfragen über die CleanStar-Website an Partner weitergegeben werden, regelt der Partnervertrag.',
  },
  {
    q: 'Was passiert mit meinen bestehenden Kunden?',
    a: 'Ihre bestehenden Kunden bleiben Ihre Kunden. Wie Sie sie in das CleanStar-System überführen, besprechen wir gemeinsam.',
  },
  {
    q: 'Wie läuft die Einarbeitung ab?',
    a: 'Persönlich, direkt bei Ihnen vor Ort oder bei uns in Offenburg, ganz wie es Ihnen passt. Sie lernen Objektbesichtigung, Kalkulation, Einsatzplanung, Qualitätskontrolle und Reklamation kennen. Danach haben Sie einen festen Ansprechpartner und wir tauschen uns regelmäßig aus.',
  },
  {
    q: 'Kann ich nebenberuflich starten?',
    a: 'Das kommt auf Ihre Situation an. Sprechen Sie uns an. Wir sagen Ihnen ehrlich, ob ein nebenberuflicher Start in Ihrem Fall sinnvoll ist.',
  },
  {
    q: 'Ist meine Anfrage verbindlich?',
    a: 'Nein. Anfrage, Erstgespräch und Kennenlernen sind unverbindlich. Verbindlich ist erst ein schriftlicher Partnervertrag.',
  },
]

/* ------------------------------------------------------------------ */
/* Partnerstimmen (nur echte, mit Einverständnis)                      */
/* ------------------------------------------------------------------ */
export const partnerTestimonials = [{ quote: '[PLATZHALTER: echtes Zitat eines Partners]', name: '[Name]', role: '[Firma, Region]' }]

/* ------------------------------------------------------------------ */
/* Regionen                                                            */
/* ------------------------------------------------------------------ */
/**
 * Stadt- und Landkreise in Baden-Württemberg als schematische Wabenkarte.
 * col/row: Position im Wabenraster (ungerade Reihen sind um eine halbe Wabe versetzt).
 * status: 'stammgebiet' | 'gesucht' | 'vergeben'. Zum Vergeben einer Region einfach den Status ändern.
 */
export interface Region {
  id: string
  name: string
  short: string
  type: 'Landkreis' | 'Stadtkreis'
  col: number
  row: number
  status: RegionStatus
}

const r = (id: string, name: string, short: string, type: Region['type'], col: number, row: number, status: RegionStatus = 'gesucht'): Region => ({
  id,
  name,
  short,
  type,
  col,
  row,
  status,
})

export const bwRegions: Region[] = [
  r('mannheim', 'Mannheim', 'MA', 'Stadtkreis', 2, 0),
  r('heidelberg', 'Heidelberg', 'HD', 'Stadtkreis', 3, 0),
  r('neckar-odenwald', 'Neckar-Odenwald-Kreis', 'NOK', 'Landkreis', 4, 0),
  r('main-tauber', 'Main-Tauber-Kreis', 'TBB', 'Landkreis', 5, 0),
  r('karlsruhe-stadt', 'Karlsruhe', 'KA', 'Stadtkreis', 1, 1),
  r('rhein-neckar', 'Rhein-Neckar-Kreis', 'RNK', 'Landkreis', 2, 1),
  r('heilbronn-stadt', 'Heilbronn', 'HN', 'Stadtkreis', 3, 1),
  r('heilbronn', 'Landkreis Heilbronn', 'LHN', 'Landkreis', 4, 1),
  r('hohenlohe', 'Hohenlohekreis', 'KÜN', 'Landkreis', 5, 1),
  r('karlsruhe', 'Landkreis Karlsruhe', 'LKA', 'Landkreis', 1, 2),
  r('enzkreis', 'Enzkreis', 'ENZ', 'Landkreis', 2, 2),
  r('ludwigsburg', 'Landkreis Ludwigsburg', 'LB', 'Landkreis', 3, 2),
  r('rems-murr', 'Rems-Murr-Kreis', 'WN', 'Landkreis', 4, 2),
  r('schwaebisch-hall', 'Landkreis Schwäbisch Hall', 'SHA', 'Landkreis', 5, 2),
  r('rastatt', 'Landkreis Rastatt', 'RA', 'Landkreis', 0, 3),
  r('pforzheim', 'Pforzheim', 'PF', 'Stadtkreis', 1, 3),
  r('boeblingen', 'Landkreis Böblingen', 'BB', 'Landkreis', 2, 3),
  r('stuttgart', 'Stuttgart', 'S', 'Stadtkreis', 3, 3),
  r('ostalb', 'Ostalbkreis', 'AA', 'Landkreis', 4, 3),
  r('baden-baden', 'Baden-Baden', 'BAD', 'Stadtkreis', 0, 4),
  r('calw', 'Landkreis Calw', 'CW', 'Landkreis', 1, 4),
  r('tuebingen', 'Landkreis Tübingen', 'TÜ', 'Landkreis', 2, 4),
  r('esslingen', 'Landkreis Esslingen', 'ES', 'Landkreis', 3, 4),
  r('goeppingen', 'Landkreis Göppingen', 'GP', 'Landkreis', 4, 4),
  r('heidenheim', 'Landkreis Heidenheim', 'HDH', 'Landkreis', 5, 4),
  r('ortenau', 'Ortenaukreis', 'OG', 'Landkreis', 0, 5, 'stammgebiet'),
  r('freudenstadt', 'Landkreis Freudenstadt', 'FDS', 'Landkreis', 1, 5),
  r('reutlingen', 'Landkreis Reutlingen', 'RT', 'Landkreis', 2, 5),
  r('alb-donau', 'Alb-Donau-Kreis', 'UL', 'Landkreis', 3, 5),
  r('ulm', 'Ulm', 'ULM', 'Stadtkreis', 4, 5),
  r('emmendingen', 'Landkreis Emmendingen', 'EM', 'Landkreis', 0, 6),
  r('rottweil', 'Landkreis Rottweil', 'RW', 'Landkreis', 1, 6),
  r('zollernalb', 'Zollernalbkreis', 'BL', 'Landkreis', 2, 6),
  r('sigmaringen', 'Landkreis Sigmaringen', 'SIG', 'Landkreis', 3, 6),
  r('biberach', 'Landkreis Biberach', 'BC', 'Landkreis', 4, 6),
  r('freiburg', 'Freiburg im Breisgau', 'FR', 'Stadtkreis', -1, 7),
  r('breisgau-hochschwarzwald', 'Breisgau-Hochschwarzwald', 'BHS', 'Landkreis', 0, 7),
  r('schwarzwald-baar', 'Schwarzwald-Baar-Kreis', 'VS', 'Landkreis', 1, 7),
  r('tuttlingen', 'Landkreis Tuttlingen', 'TUT', 'Landkreis', 2, 7),
  r('ravensburg', 'Landkreis Ravensburg', 'RV', 'Landkreis', 3, 7),
  r('loerrach', 'Landkreis Lörrach', 'LÖ', 'Landkreis', 0, 8),
  r('waldshut', 'Landkreis Waldshut', 'WT', 'Landkreis', 1, 8),
  r('konstanz', 'Landkreis Konstanz', 'KN', 'Landkreis', 2, 8),
  r('bodensee', 'Bodenseekreis', 'FN', 'Landkreis', 3, 8),
]

/** Bundesländer für die Deutschland-Ansicht (schematisch) */
export const germanyRegions: Region[] = [
  r('sh', 'Schleswig-Holstein', 'SH', 'Landkreis', 3, 0),
  r('hb', 'Bremen', 'HB', 'Landkreis', 2, 1),
  r('hh', 'Hamburg', 'HH', 'Landkreis', 3, 1),
  r('mv', 'Mecklenburg-Vorpommern', 'MV', 'Landkreis', 4, 1),
  r('nw', 'Nordrhein-Westfalen', 'NRW', 'Landkreis', 1, 2),
  r('ni', 'Niedersachsen', 'NI', 'Landkreis', 2, 2),
  r('st', 'Sachsen-Anhalt', 'ST', 'Landkreis', 3, 2),
  r('bb', 'Brandenburg', 'BB', 'Landkreis', 4, 2),
  r('be', 'Berlin', 'BE', 'Landkreis', 5, 2),
  r('rp', 'Rheinland-Pfalz', 'RP', 'Landkreis', 1, 3),
  r('he', 'Hessen', 'HE', 'Landkreis', 2, 3),
  r('th', 'Thüringen', 'TH', 'Landkreis', 3, 3),
  r('sn', 'Sachsen', 'SN', 'Landkreis', 4, 3),
  r('sl', 'Saarland', 'SL', 'Landkreis', 1, 4),
  r('bw', 'Baden-Württemberg', 'BW', 'Landkreis', 2, 4, 'stammgebiet'),
  r('by', 'Bayern', 'BY', 'Landkreis', 3, 4),
]

export const regionStatusLabel: Record<RegionStatus, string> = {
  stammgebiet: 'CleanStar-Stammgebiet',
  gesucht: 'Partner gesucht',
  vergeben: 'Bereits vergeben',
}
