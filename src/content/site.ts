/**
 * SEITENTEXTE – Startseite, Ablauf, Garantie, Karriere und weitere Bausteine.
 * Texte können hier direkt geändert werden.
 */
import { company } from './company'

export const navigation = [
  { label: 'Leistungen', to: '/leistungen' },
  { label: 'Qualitätsgarantie', to: '/qualitaetsgarantie' },
  { label: 'Ablauf', to: '/ablauf' },
  { label: 'Einzugsgebiet', to: '/einzugsgebiet' },
  { label: 'Über uns', to: '/ueber-uns' },
  { label: 'Kontakt', to: '/kontakt' },
]

export const home = {
  seoTitle: 'Büroreinigung in Offenburg und im Ortenaukreis',
  seoDescription:
    'CleanStar Dienstleistungen aus Offenburg: Büroreinigung für Unternehmen im Ortenaukreis. Fester Ansprechpartner, Ersatzkraft bei Ausfall, Qualitätsgarantie. Kostenlose Besichtigung, Angebot in 48 Stunden.',
  hero: {
    eyebrow: 'Büroreinigung im Ortenaukreis',
    headline: 'Saubere Büros. Jeden Tag. Ohne dass Sie sich darum kümmern müssen.',
    sub: 'Fester Ansprechpartner, eingespieltes Team, Ersatzkraft bei Ausfall. Wir sehen uns Ihr Objekt kostenlos an und schicken Ihnen in 48 Stunden ein Angebot.',
    scrollHint: 'Scrollen Sie, um durch das Büro zu gehen',
    sceneSteps: ['Ihr Büro am Abend', 'Wir kommen, wenn Sie gehen', 'Am Morgen: makellos'],
  },
  problems: {
    eyebrow: 'Das kennen Sie vielleicht',
    headline: 'Typischer Ärger mit Reinigungsfirmen. Und wie wir ihn abstellen.',
    items: [
      {
        problem: 'Die Reinigung kommt, wann sie will.',
        solution: 'Feste Tage, feste Zeitfenster, schriftlich vereinbart. Sie wissen immer, wann wir da sind.',
      },
      {
        problem: 'Jede Woche ein anderes Gesicht.',
        solution: 'Ein festes Team für Ihr Objekt. Ersatzkräfte sind eingewiesen, bevor sie einspringen.',
      },
      {
        problem: 'Niemand geht ans Telefon.',
        solution: 'Ein fester Ansprechpartner mit direkter Nummer. Antwort innerhalb von 24 Stunden, meist schneller.',
      },
      {
        problem: 'Am Anfang top, nach drei Monaten lässt es nach.',
        solution: 'Regelmäßige Qualitätskontrollen mit Checkliste. Und wenn doch etwas fehlt: kostenlose Nachreinigung.',
      },
    ],
  },
  guarantee: {
    eyebrow: 'Qualitätsgarantie',
    statement: 'Wenn etwas nicht passt, reinigen wir nach. Kostenlos, schnell und ohne Diskussion.',
    text: 'Und wir finden heraus, warum es passiert ist, damit es nicht wieder vorkommt. So sieht Verlässlichkeit für uns aus.',
  },
  about: {
    eyebrow: 'Über uns',
    headline: 'Ein Betrieb aus Offenburg. Keine Zentrale, kein Callcenter.',
    text: 'Hinter CleanStar stehen Menschen, die Sie persönlich kennenlernen. Wir übernehmen Verantwortung für jedes Objekt, das wir reinigen, und sind direkt erreichbar, wenn Sie uns brauchen.',
    todo: 'Persönliches Statement und Namen der Gründer in company.ts eintragen.',
  },
  finalCta: {
    eyebrow: 'In 60 Sekunden zum Angebot',
    headline: 'Erzählen Sie uns kurz von Ihrem Objekt. Den Rest übernehmen wir.',
    text: 'Ein paar Klicks, dann melden wir uns innerhalb von 24 Stunden. Die Besichtigung ist kostenlos, das Angebot kommt in 48 Stunden.',
  },
}

/** Vertrauensleiste. Nur echte, bestätigte Werte. */
export const trustFacts = [
  { value: company.promises.responseHours, suffix: ' h', label: 'Antwortzeit auf Ihre Anfrage', countUp: true },
  { value: company.promises.offerHours, suffix: ' h', label: 'bis zum schriftlichen Angebot', countUp: true },
  { value: 1, suffix: '', label: 'fester Ansprechpartner für Ihr Objekt', countUp: true },
  { text: 'Ortenau', label: 'Sitz in Offenburg, im ganzen Kreis vor Ort' },
  ...(company.yearsOfExperience ? [{ value: company.yearsOfExperience, suffix: '', label: 'Jahre Erfahrung', countUp: true }] : []),
] as { value?: number; suffix?: string; text?: string; label: string; countUp?: boolean }[]

export const processSteps = [
  {
    title: 'Anfrage',
    duration: 'ca. 1 Minute',
    text: 'Über den Konfigurator, per Telefon oder E-Mail. Wir melden uns innerhalb von 24 Stunden.',
  },
  {
    title: 'Objektbesichtigung',
    duration: 'vor Ort, zum Wunschtermin',
    text: 'Wir sehen uns Ihre Räume an, fragen nach Ihren Abläufen und klären Zugang und Zeiten. Kostenlos.',
  },
  {
    title: 'Angebot in 48 h',
    duration: 'innerhalb von 48 Stunden',
    text: 'Sie erhalten ein schriftliches Angebot mit Leistungsverzeichnis, Intervallen und klaren Preisen.',
  },
  {
    title: 'Probereinigung',
    duration: 'nach Absprache',
    text: 'Bevor es regulär losgeht, reinigen wir einmal zur Probe. Sie sehen das Ergebnis und geben uns Feedback.',
  },
  {
    title: 'Fester Start',
    duration: 'zum Wunschtermin',
    text: 'Ihr festes Team beginnt. Schlüsselübergabe und Ansprechpartner sind dokumentiert.',
  },
  {
    title: 'Qualitätskontrolle',
    duration: 'regelmäßig',
    text: 'Wir prüfen das Ergebnis selbst mit Checklisten und stimmen uns regelmäßig mit Ihnen ab.',
  },
]

/** Prüfpunkte der Qualitätsgarantie */
export const guaranteePoints = [
  {
    title: 'Kostenlose Nachreinigung',
    text: 'Passt etwas nicht, melden Sie es Ihrem Ansprechpartner. Wir reinigen kostenlos nach, innerhalb der vereinbarten Frist.',
    usesComplaintPeriod: true,
  },
  {
    title: 'Regelmäßige Qualitätskontrollen',
    text: 'Unsere Objektleitung prüft die Arbeit vor Ort anhand einer Checkliste, die auf Ihr Leistungsverzeichnis abgestimmt ist. Nicht erst, wenn Sie sich beschweren.',
  },
  {
    title: 'Fester Ansprechpartner',
    text: 'Eine Person, die Ihr Objekt kennt und direkt erreichbar ist. Antwort innerhalb von 24 Stunden.',
  },
  {
    title: 'Vertretung bei Ausfall',
    text: 'Fällt jemand aus, übernimmt eine eingewiesene Ersatzkraft. Ihre Reinigung findet statt, ohne dass Sie sich kümmern müssen.',
  },
  {
    title: 'Schlüssel- und Zugangsmanagement',
    text: 'Schlüsselübergaben werden protokolliert. Zugang hat nur das feste Team. Alarmanlagen und Schließzeiten sind dokumentiert.',
  },
  {
    title: 'Verschwiegenheit und Diskretion',
    text: 'Unterlagen bleiben, wo sie liegen. Was wir in Ihren Räumen sehen, bleibt dort.',
  },
  {
    title: 'Mittel und Nachhaltigkeit',
    text: 'Wir dosieren genau, setzen Mittel passend zur Oberfläche ein und vermeiden unnötige Chemie. Mikrofasertücher waschen wir und verwenden sie wieder.',
    todo: 'Nachhaltigkeitsaussagen (Mikrofaser, Dosierung, Produkte) bitte bestätigen.',
  },
]

export const complaintSteps = [
  { title: 'Sie melden sich', text: 'Per Telefon oder E-Mail bei Ihrem festen Ansprechpartner. Ein Foto hilft, ist aber kein Muss.' },
  { title: 'Wir bestätigen', text: 'Sie bekommen eine Rückmeldung, wann nachgereinigt wird.' },
  { title: 'Wir reinigen nach', text: 'Kostenlos und innerhalb der vereinbarten Frist.' },
  { title: 'Wir klären die Ursache', text: 'Mit dem Team und im Leistungsverzeichnis, damit es nicht wieder vorkommt.' },
]

export const values = [
  { title: 'Verlässlich', text: 'Wir sind da, wann wir es zugesagt haben. Und wenn etwas dazwischenkommt, sagen wir es Ihnen vorher.' },
  { title: 'Gründlich', text: 'Auch dort, wo niemand hinsieht. Sauberkeit zeigt sich in den Ecken.' },
  { title: 'Diskret', text: 'Ihre Räume, Ihre Unterlagen, Ihre Angelegenheiten. Wir sehen nichts und erzählen nichts.' },
  { title: 'Fair', text: 'Ehrliche Angebote statt Lockpreise. Und faire Bedingungen für unser Team.' },
]

export const careers = {
  seoTitle: 'Karriere: Jobs in der Reinigung in Offenburg',
  seoDescription: 'Jobs bei CleanStar Dienstleistungen in Offenburg und im Ortenaukreis. Feste Objekte, planbare Zeiten, ein Team, das zusammenhält. Bewerbung in 2 Minuten.',
  headline: 'Arbeiten bei CleanStar. Planbar, fair, im Team.',
  intro:
    'Gute Reinigung braucht gute Leute. Wir suchen Menschen, die sorgfältig arbeiten und sich auf ein verlässliches Team freuen. Die Bewerbung dauert zwei Minuten, Lebenslauf brauchen Sie keinen.',
  benefits: [
    { title: 'Feste Objekte', text: 'Sie wissen, wo Sie arbeiten. Kein ständiges Springen zwischen fremden Gebäuden.' },
    { title: 'Planbare Zeiten', text: 'Feste Einsatzzeiten, frühzeitig abgestimmt. Gut vereinbar mit Familie oder Zweitjob.' },
    { title: 'Gute Einarbeitung', text: 'Sie werden im Objekt eingearbeitet und wissen genau, was zu tun ist.' },
    { title: 'Direkter Draht', text: 'Kurze Wege zur Leitung. Probleme werden gelöst, nicht verschoben.' },
  ],
  benefitsTodo: 'Konkrete Leistungen (Bezahlung, Zuschläge, Arbeitskleidung, Fahrtkosten) nur ergänzen, wenn bestätigt.',
}

/** Offene Stellen. `enabled: false` blendet eine Stelle aus. */
export const jobs = [
  {
    enabled: true,
    title: 'Reinigungskraft (m/w/d) für Büroobjekte',
    type: 'Minijob, Teilzeit',
    location: 'Offenburg und Umgebung',
    times: 'Früh morgens oder abends, nach Absprache',
    tasks: ['Reinigung von Büros, Küchen und Sanitärbereichen', 'Arbeiten nach festem Leistungsverzeichnis', 'Sorgfältiger Umgang mit Schlüsseln und Kundeneigentum'],
    profile: ['Zuverlässigkeit und Sorgfalt', 'Grundkenntnisse Deutsch für Absprachen', 'Erfahrung in der Reinigung ist schön, aber kein Muss'],
    todo: 'Stelle bestätigen, Stundenumfang und Vergütung ergänzen.',
  },
  {
    enabled: true,
    title: 'Objektleitung / Vorarbeiter (m/w/d)',
    type: 'Teilzeit oder Vollzeit',
    location: 'Ortenaukreis',
    times: 'Flexibel, mit Führerschein',
    tasks: ['Einarbeitung und Einsatzplanung des Teams', 'Qualitätskontrollen mit Checklisten', 'Ansprechpartner für Kunden vor Ort'],
    profile: ['Erfahrung in der Gebäudereinigung', 'Führerschein Klasse B', 'Freundliches, klares Auftreten'],
    todo: 'Stelle bestätigen oder auf enabled: false setzen.',
  },
]

/**
 * Testimonials – nur echte Kundenstimmen mit Einverständnis eintragen.
 * Standardmäßig ausgeblendet (enabled: false).
 */
export const testimonials = {
  enabled: false,
  items: [
    { quote: '[PLATZHALTER: echtes Kundenzitat]', name: '[Name]', role: '[Funktion, Unternehmen, Ort]' },
    { quote: '[PLATZHALTER: echtes Kundenzitat]', name: '[Name]', role: '[Funktion, Unternehmen, Ort]' },
    { quote: '[PLATZHALTER: echtes Kundenzitat]', name: '[Name]', role: '[Funktion, Unternehmen, Ort]' },
  ],
}

/** Kundenlogos – nur mit Freigabe der Kunden. Standardmäßig ausgeblendet. */
export const clientLogos = {
  enabled: false,
  items: [] as { name: string; src: string }[],
}
