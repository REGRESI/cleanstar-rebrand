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
    eyebrow: 'Büroreinigung in Offenburg und der Ortenau',
    headline: 'Büroreinigung, auf die Verlass ist.',
    sub: 'Feste Teams. Fester Ansprechpartner. Ersatz bei Ausfall.',
    cta: 'Kostenlose Besichtigung',
    /** Untertitel zum Scroll-Video: Flug ins Gebäude, Feierabend und Reinigung, Morgen */
    sceneSteps: ['Scrollen Sie, um durch das Büro zu gehen', 'Wir kommen, wenn Sie gehen', 'Am Morgen: makellos'],
    imageAlt: 'Bürogebäude in der Abenddämmerung vor bewaldeten Hügeln',
    imageAltMorning: 'Aufgeräumtes, sauberes Großraumbüro am Morgen',
    /** Handy: Sequenz als Karte mit Überschrift und drei Schritten */
    sequenceTitle: 'Ihr Büro über Nacht',
    sequenceSteps: [
      { title: 'Feierabend', text: 'Ihr Team geht nach Hause.' },
      { title: 'Reinigung', text: 'Wir kommen, wenn Sie gehen.' },
      { title: 'Am Morgen makellos', text: 'Alles bereit, bevor der Erste kommt.' },
    ],
  },
  problems: {
    eyebrow: 'Was Sie nicht mehr erleben werden',
    headline: 'Sie haben Wichtigeres zu tun, als Ihrer Reinigungsfirma hinterherzutelefonieren.',
    lead: 'Vier Ärgernisse, die fast jeder Geschäftsführer kennt. Bei uns sind sie von Anfang an geregelt, schriftlich und überprüfbar.',
    items: [
      {
        problem: 'Die Reinigung kommt, wann sie will.',
        solution: 'Feste Tage und Zeitfenster, schriftlich vereinbart. Sie wissen jederzeit, wann wir bei Ihnen sind.',
      },
      {
        problem: 'Jede Woche ein anderes Gesicht.',
        solution: 'Ihr Objekt hat ein festes Team. Wer einspringt, ist vorher eingewiesen und kennt Ihre Räume.',
      },
      {
        problem: 'Niemand geht ans Telefon.',
        solution: 'Sie haben einen Namen und eine direkte Nummer. Rückmeldung innerhalb von 24 Stunden.',
      },
      {
        problem: 'Nach drei Monaten lässt die Qualität nach.',
        solution: 'Wir kontrollieren selbst nach Checkliste. Fehlt doch etwas, reinigen wir kostenlos nach.',
      },
    ],
  },
  services: {
    eyebrow: 'Leistungen',
    headline: 'Wir reinigen Büros. Und zwar richtig.',
    lead: 'Büroreinigung ist unser Kern. Fenster, Treppenhaus, Halle und Hygiene kommen dazu, wenn Sie sie brauchen. Mit demselben Team und demselben Ansprechpartner.',
  },
  guarantee: {
    eyebrow: 'Qualitätsgarantie',
    statement: 'Passt etwas nicht, reinigen wir nach. Kostenlos und ohne Diskussion.',
    text: 'Danach klären wir mit dem Team die Ursache, damit es kein zweites Mal passiert. Das ist kein Werbeversprechen, sondern unser fester Ablauf.',
  },
  process: {
    eyebrow: 'So arbeiten wir zusammen',
    headline: 'Sechs Schritte. Ihr Aufwand: ein Termin.',
  },
  beforeAfter: {
    eyebrow: 'Vorher / Nachher',
    headline: 'Der Unterschied zeigt sich am Morgen danach.',
    lead: 'Derselbe Arbeitsplatz, abends nach Feierabend und morgens nach unserem Einsatz. So soll es bei Ihnen jeden Tag aussehen.',
  },
  about: {
    eyebrow: 'Über uns',
    headline: 'Drei Gründer aus Offenburg. Alle drei erreichbar.',
    text: 'Bei CleanStar sprechen Sie mit den Menschen, die entscheiden. Kein Callcenter, keine Zentrale in einer anderen Stadt. Wer bei uns anruft, erreicht jemanden, der sein Wort hält.',
  },
  finalCta: {
    eyebrow: 'In 60 Sekunden zur Anfrage',
    headline: 'Ein Gespräch. Eine Besichtigung. Ein klares Angebot.',
    text: 'Sagen Sie uns kurz, was gereinigt werden soll. Wir melden uns innerhalb von 24 Stunden, sehen uns Ihre Räume kostenlos an und schicken Ihnen in 48 Stunden ein schriftliches Angebot.',
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
  { title: 'Sie sagen Bescheid', text: 'Per Telefon oder E-Mail an Ihren festen Ansprechpartner. Ein Foto hilft, ist aber kein Muss.' },
  { title: 'Wir melden uns', text: 'Sie erfahren, wann nachgereinigt wird. Sie müssen nicht nachhaken.' },
  { title: 'Wir reinigen nach', text: 'Kostenlos und innerhalb der vereinbarten Frist.' },
  { title: 'Wir stellen ab, was dahintersteckt', text: 'Wir klären die Ursache mit dem Team und passen, falls nötig, den Ablauf an. Damit es kein zweites Mal vorkommt.' },
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
