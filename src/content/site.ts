/**
 * SEITENTEXTE – Startseite, Ablauf, Garantie, Karriere und weitere Bausteine.
 * Texte können hier direkt geändert werden.
 */
import { company } from './company'

/**
 * Markenversprechen (Leitidee). Jede Zusage auf der Website ist der Beweis dafür:
 * fester Ansprechpartner, Ersatz bei Ausfall, eigene Kontrollen, erster Monat kündbar.
 */
export const brand = {
  promise: 'Sauber. Ohne dass Sie nachfragen müssen.',
  /** Mit festem Umbruch nach „Sauber.“ für große Satzspiegel */
  promiseSet: 'Sauber.\nOhne dass Sie nachfragen müssen.',
  /** Für große Satzspiegel: zwei Teile */
  promiseLead: 'Sauber.',
  promiseRest: 'Ohne dass Sie nachfragen müssen.',
}

export const navigation = [
  { label: 'Leistungen', to: '/leistungen' },
  { label: 'Qualitätsgarantie', to: '/qualitaetsgarantie' },
  { label: 'Ablauf', to: '/ablauf' },
  { label: 'Einzugsgebiet', to: '/einzugsgebiet' },
  { label: 'Über uns', to: '/ueber-uns' },
  { label: 'Kontakt', to: '/kontakt' },
]

export const home = {
  /** Kurze, direkte Antwort unter dem Hero (für Besucher, Suchmaschinen und KI-Systeme) */
  answer:
    'CleanStar ist eine Reinigungsfirma aus Offenburg, die sich auf Büroreinigung für Unternehmen im Ortenaukreis spezialisiert hat. Wir arbeiten mit festen Teams, einem festen Ansprechpartner und einer Ersatzkraft bei Ausfall und rechnen nach Stunden ab.',
  seoTitle: 'Büroreinigung Offenburg & Ortenaukreis',
  seoDescription: 'Reinigungsfirma aus Offenburg für Büroreinigung im Ortenaukreis: festes Team, fester Ansprechpartner, Ersatz bei Ausfall und Angebot in 48 Stunden.',
  hero: {
    /** Kleine Zeile, Teil der H1 (Keyword für Google) */
    kicker: 'Büroreinigung in Offenburg und im Ortenaukreis',
    /** Große Zeile der H1: das Markenversprechen */
    headline: 'Sauber.\nOhne dass Sie nachfragen müssen.',
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
  /** Die drei Versprechen in einem Satz: der Beweis für die Leitidee */
  promise: {
    eyebrow: 'Das Versprechen',
    statement: 'Ein festes Team, das Ihr Büro kennt. Ein Ansprechpartner, der erreichbar ist. Ersatz, wenn jemand ausfällt.',
    lead: 'Darum müssen Sie bei uns nicht nachfragen, nicht kontrollieren und sich nicht beschweren. Und weil Sie das erst sehen sollen, bevor Sie sich binden, ist der erste Monat jederzeit kündbar.',
  },
  problems: {
    eyebrow: 'Das kennen Sie vielleicht',
    headline: 'Ihrer Reinigungsfirma hinterhertelefonieren? Das ist nicht Ihr Job.',
    lead: 'Vier Ärgernisse, die fast jeder Geschäftsführer kennt. Bei uns sind sie von Anfang an geregelt, schriftlich und überprüfbar. So müssen Sie nicht nachhaken.',
    items: [
      {
        problem: 'Die Reinigungskraft kommt, wann sie will.',
        solution: 'Feste Zeiten, die wir mit Ihnen vereinbaren. Und an die wir uns halten.',
      },
      {
        problem: 'Jede Woche ein anderes Gesicht in unseren Räumen.',
        solution: 'Dieselben Gesichter, Abend für Abend. Bei Urlaub oder Krankheit übernimmt eine eingewiesene Vertretung.',
      },
      {
        problem: 'Bei Problemen erreicht man niemanden.',
        solution: 'Ein fester Ansprechpartner mit direkter Nummer, rund um die Uhr erreichbar.',
      },
      {
        problem: 'Nach drei Monaten lässt die Qualität nach.',
        solution: 'Wir kontrollieren selbst nach Checkliste. Fehlt doch etwas, reinigen wir kurzfristig und kostenlos nach.',
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
  /** Vorher/Nachher-Slider (Seite Büroreinigung) */
  beforeAfter: {
    eyebrow: 'Vorher / Nachher',
    headline: 'Der Unterschied zeigt sich am Morgen danach.',
    lead: 'Derselbe Arbeitsplatz, abends nach Feierabend und morgens nach unserem Einsatz. So soll es bei Ihnen jeden Tag aussehen.',
  },
  about: {
    eyebrow: 'Die Gründer',
    headline: 'Drei Gründer. Drei Gesichter, die Sie kennenlernen.',
    text: 'Bei CleanStar sprechen Sie mit den Menschen, die entscheiden. Kein Callcenter, keine Zentrale in einer anderen Stadt. Jeder von uns hat seinen Bereich, und wer bei uns anruft, erreicht jemanden, der sein Wort hält.',
    /** Ein Satz für die Startseite */
    short: 'Bei CleanStar sprechen Sie mit den Menschen, die entscheiden. Kein Callcenter, keine Zentrale in einer anderen Stadt.',
  },
  area: {
    eyebrow: 'Einzugsgebiet',
    headline: 'Zuhause im Ortenaukreis. Schnell vor Ort.',
  },
  proof: {
    eyebrow: 'Beweise',
    headlineObjects: 'Objekte, die wir betreuen.',
    headlineQuotes: 'Was Kunden sagen.',
  },
  /** Werkzeuge erscheinen auf der Startseite nur als eine Zeile mit Links */
  tools: {
    label: 'Werkzeuge für Ihre Entscheidung',
    links: [
      { label: 'Angebote vergleichen', to: '/angebote-vergleichen' },
      { label: 'Wechsel-Rechner', to: '/wechsel-rechner' },
      { label: 'Selbsttest', to: '/reinigungs-check' },
      { label: 'Grundriss', to: '/leistungen/bueroreinigung#grundriss' },
      { label: 'Jahresplan', to: '/leistungen/bueroreinigung#jahresplan' },
      { label: 'Gründer-Rechner', to: '/reinigungsfirma-kalkulieren' },
      { label: 'Leistungsmappe', to: '/leistungsmappe' },
      { label: 'Ratgeber', to: '/ratgeber' },
    ],
  },
  finalCta: {
    eyebrow: 'Der erste Schritt',
    headline: 'Ein Gespräch. Eine Besichtigung. Ein klares Angebot.',
    text: 'Sagen Sie uns kurz, was gereinigt werden soll. Wir melden uns innerhalb von 24 Stunden, sehen uns Ihre Räume kostenlos an und schicken Ihnen in 48 Stunden ein schriftliches Angebot. Und im ersten Monat können Sie jederzeit kündigen.',
  },
}

/** Vertrauensleiste. Nur echte, bestätigte Werte. */
export const trustFacts = [
  { value: company.promises.responseHours, suffix: ' h', label: 'Antwortzeit auf Ihre Anfrage', countUp: true },
  { value: company.promises.offerHours, suffix: ' h', label: 'bis zum schriftlichen Angebot', countUp: true },
  ...(company.yearsOfExperience ? [{ prefix: 'über ', value: company.yearsOfExperience, suffix: '', label: 'Jahre Erfahrung in der Reinigung', countUp: true }] : []),
  { value: 1, suffix: '', label: 'fester Ansprechpartner für Ihr Objekt', countUp: true },
] as { prefix?: string; value?: number; suffix?: string; text?: string; label: string; countUp?: boolean }[]

export const processSteps = [
  {
    title: 'Anfrage',
    duration: 'ca. 1 Minute',
    text: 'Über den Konfigurator, per Telefon oder E-Mail. Wir melden uns innerhalb von 24 Stunden.',
  },
  {
    title: 'Objektbesichtigung',
    duration: 'vor Ort, zum Wunschtermin',
    text: 'Wir sehen uns Ihre Räume an, fragen nach Ihren Abläufen und klären Zugang und Zeiten. Kostenlos.',
  },
  {
    title: 'Angebot in 48 h',
    duration: 'innerhalb von 48 Stunden',
    text: 'Sie erhalten ein schriftliches Angebot mit Leistungsverzeichnis, Intervallen und klaren Preisen.',
  },
  {
    title: 'Fester Start',
    duration: 'zum Wunschtermin',
    text: 'Ihr festes Team beginnt. Schlüsselübergabe und Ansprechpartner sind dokumentiert.',
  },
  {
    title: 'Erster Monat',
    duration: 'ohne Risiko',
    text: 'Sie testen uns ohne Risiko. Im ersten Monat können Sie jederzeit kündigen, ganz ohne Frist.',
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
    title: 'Erster Monat jederzeit kündbar',
    text: 'Sie gehen kein Risiko ein. Überzeugt Sie unsere Arbeit im ersten Monat nicht, kündigen Sie ohne Frist. Danach gilt eine Kündigungsfrist von einem Monat zum Ende des Folgemonats.',
  },
  {
    title: 'Kostenlose Nachreinigung',
    text: 'Passt etwas nicht, melden Sie es Ihrem Ansprechpartner. Wir kommen kurzfristig und reinigen kostenlos nach.',
    usesComplaintPeriod: true,
  },
  {
    title: 'Regelmäßige Qualitätskontrollen',
    text: 'Wir prüfen die Arbeit selbst vor Ort, anhand einer Checkliste, die auf Ihr Leistungsverzeichnis abgestimmt ist. Nicht erst, wenn Sie sich beschweren.',
  },
  {
    title: 'Fester Ansprechpartner',
    text: 'Eine Person, die Ihr Objekt kennt und direkt erreichbar ist. Rund um die Uhr, Antwort innerhalb von 24 Stunden.',
  },
  {
    title: 'Vertretung bei Ausfall',
    text: 'Fällt jemand aus, übernimmt eine eingewiesene Ersatzkraft. Ihre Reinigung findet statt, ohne dass Sie sich kümmern müssen.',
  },
  {
    title: 'Schlüssel und Zugänge',
    text: 'Schlüsselübergaben werden protokolliert. Zugang hat nur das feste Team. Alarmanlagen und Schließzeiten sind dokumentiert.',
  },
  {
    title: 'Verschwiegenheit und Diskretion',
    text: 'Unterlagen bleiben, wo sie liegen. Was wir in Ihren Räumen sehen, bleibt dort.',
  },
  {
    title: 'Mit Betriebshaftpflicht',
    text: 'Geht trotz aller Sorgfalt einmal etwas zu Bruch, sind Sie abgesichert. Den Nachweis senden wir Ihnen auf Anfrage.',
  },
] as { title: string; text: string; usesComplaintPeriod?: boolean; todo?: string }[]

/** Reklamation in drei Schritten. Ohne eingetragene Frist heißt es neutral „kurzfristig“. */
export const complaintSteps = [
  { title: 'Sie melden es', text: 'Ein Anruf oder eine E-Mail an Ihren festen Ansprechpartner genügt. Ein Foto hilft, ist aber kein Muss.' },
  {
    title: company.complaintPeriod ? `Wir kommen innerhalb von ${company.complaintPeriod}` : 'Wir sind kurzfristig da',
    text: 'Sie erfahren sofort, wann nachgereinigt wird. Nachhaken müssen Sie nicht.',
  },
  {
    title: 'Nachreinigung kostenlos',
    text: 'Wir reinigen nach und Sie bekommen eine Bestätigung. Danach klären wir mit dem Team die Ursache, damit es nicht wieder vorkommt.',
  },
]

export const values = [
  { title: 'Verlässlich', text: 'Wir sind da, wann wir es zugesagt haben. Und wenn etwas dazwischenkommt, sagen wir es Ihnen vorher.' },
  { title: 'Gründlich', text: 'Auch dort, wo niemand hinsieht. Sauberkeit zeigt sich in den Ecken.' },
  { title: 'Diskret', text: 'Ihre Räume, Ihre Unterlagen, Ihre Angelegenheiten. Wir sehen nichts und erzählen nichts.' },
  { title: 'Fair', text: 'Ehrliche Angebote statt Lockpreise. Und faire Bedingungen für unser Team.' },
]

export const careers = {
  seoTitle: 'Jobs Reinigung Offenburg: Karriere',
  seoDescription: 'Jobs bei CleanStar in Offenburg und im Ortenaukreis: feste Objekte, planbare Zeiten und ein Team, das zusammenhält. Bewerbung in 2 Minuten, auch per Telefon.',
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
