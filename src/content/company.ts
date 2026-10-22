/**
 * FIRMENDATEN – zentrale Quelle für alle Fakten auf der Website.
 *
 * Regeln:
 * - Hier stehen nur bestätigte Fakten. Nichts erfinden.
 * - Fehlt ein Wert, steht er auf `null`. Die Website zeigt dann einen
 *   neutralen Ersatztext oder blendet die Stelle aus. Offene Punkte
 *   stehen in OFFENE-PUNKTE.md. Mit `showTodoMarkers: true` erscheinen
 *   zusätzlich gelbe Hinweise auf der Seite (nur zum Prüfen).
 * - Telefonnummer, E-Mail usw. hier ändern, nicht in den Seiten.
 */

export type OpeningHours = { days: string; hours: string }[]

export interface Person {
  /** null = Platzhalter wird angezeigt */
  name: string | null
  role: string
  /** Kurzes persönliches Statement (1–2 Sätze, in Ich-Form). null = Platzhalter */
  statement: string | null
  /** Ein Satz zur Person (Hintergrund, Rolle im Betrieb) */
  bio: string
  /** Wofür die Person zuständig ist */
  focus: string[]
  /** Bild-ID aus src/content/images.ts */
  image: string
  /** Hinweis, solange Texte nicht freigegeben sind (null = freigegeben) */
  draft: string | null
}

export interface TimelineEntry {
  year: string
  title: string
  text: string
  /** Nur bestätigte Einträge werden angezeigt */
  confirmed: boolean
}

export const company = {
  /** Gelbe TODO-Hinweise auf der Website anzeigen (vor dem Livegang auf false setzen) */
  showTodoMarkers: false,

  name: 'CleanStar Dienstleistungen',
  legalForm: 'GbR',
  legalName: 'CleanStar Dienstleistungen GbR',
  shortName: 'CleanStar',
  siteUrl: 'https://www.cleanstar-dienstleistungen.de',
  seat: 'Offenburg',
  serviceArea: 'Ortenaukreis',

  address: {
    // Bestätigt
    street: 'Prinz-Eugen-Str. 80',
    zip: '77654',
    city: 'Offenburg',
    region: 'Baden-Württemberg',
    country: 'DE',
    /** Ungefähre Koordinaten von Offenburg (für strukturierte Daten) */
    geo: { lat: 48.4708, lng: 7.9408 },
  },

  phone: {
    display: '0173 8512107',
    href: 'tel:+491738512107',
    international: '+49 173 8512107',
  },
  email: 'info@cleanstar-dienstleistungen.de',

  /**
   * Profile auf anderen Plattformen (für strukturierte Daten „sameAs“). Leer = wird weggelassen.
   * TODO: Link zum Google-Unternehmensprofil eintragen, sobald es eingerichtet ist (SEO-TODO-EXTERN.md).
   */
  profiles: {
    google: '' as string,
    others: [] as string[],
  },

  whatsapp: {
    /** WhatsApp-Link auf der Kontaktseite anzeigen */
    enabled: false,
    /** Nummer im internationalen Format ohne + und Leerzeichen */
    number: '491738512107',
  },

  /** Keine festen Öffnungszeiten (kein Ladengeschäft). Wir sind rund um die Uhr erreichbar. */
  availability: '24/7 erreichbar',
  /** Feste Öffnungszeiten, falls es einmal welche gibt. null = es wird „24/7 erreichbar“ gezeigt */
  openingHours: null as OpeningHours | null,

  /** Vertretungsberechtigte Gesellschafter (Impressum) */
  partners: ['Nico Schütterle', 'Lino Resham', 'Eknoor Singh'] as string[] | null,

  /** Umsatzsteuer-ID */
  vatId: 'DE452202787' as string | null,

  /** Gründungsjahr: nur Impressum, Timeline und strukturierte Daten, kein Werbeargument */
  foundedYear: 2024 as number | null,
  /** Erfahrung des Teams in der Reinigung (länger als die Firma besteht). Angezeigt als „über 6 Jahre“ */
  yearsOfExperience: 6 as number | null,

  /** Versprechen aus dem Briefing (bestätigt) */
  promises: {
    responseHours: 24,
    offerHours: 48,
    freeInspection: true,
    fixedContact: true,
    replacementOnAbsence: true,
  },

  /** Frist für kostenlose Nachreinigung, z. B. "24 Stunden". Offen: null = die Website sagt neutral „kurzfristig“ */
  complaintPeriod: null as string | null,

  /** Betriebshaftpflicht vorhanden (bestätigt). Summen werden nicht genannt. */
  liabilityInsurance: true as boolean | null,

  /** Vertragsbedingungen (bestätigt) */
  contract: {
    /** Kurzform für Siegel und Hinweise */
    riskFree: 'Erster Monat jederzeit kündbar',
    firstMonth: 'Im ersten Monat können Sie jederzeit kündigen, ohne Kündigungsfrist.',
    afterwards: 'Danach gilt eine Kündigungsfrist von einem Monat zum Ende des Folgemonats.',
    /** Probereinigung nur nach Absprache, nicht im Standardablauf */
    trialOnRequest: true,
  },

  booking: {
    /** Cal.com-Link für die Objektbesichtigung. Wird erst nach Klick und Einwilligung geladen (DSGVO). */
    calUrl: 'https://cal.com/eknoor-singh-x9pw3a/30min' as string,
  },

  forms: {
    /**
     * Formularversand ohne eigenen Server.
     * Web3Forms: kostenlosen Access Key auf https://web3forms.com mit info@… anlegen und unten eintragen.
     * Alternativ Formspree: endpoint auf "https://formspree.io/f/XXXX" setzen und accessKey leer lassen.
     * Solange beides leer ist, laufen alle Formulare im Vorschau-Modus (nichts wird gesendet).
     */
    provider: 'web3forms' as 'web3forms' | 'formspree',
    endpoint: 'https://api.web3forms.com/submit',
    accessKey: '389573f3-426d-4fb2-92ee-5731ff047ecc' as string,
    /**
     * TODO: Bestätigungsmail an Kunden. Bei Web3Forms (Pro) bzw. Formspree (Autoresponse) im Dashboard
     * einrichten und dann hier auf true setzen. Erst dann verspricht die Website eine Kopie per E-Mail.
     */
    confirmationEmail: false,
  },

  /** Gründer (Namen, Rollen und Texte freigegeben). Reihenfolge = Reihenfolge der Porträts gruender-1 bis -3 */
  founders: [
    {
      name: 'Nico Schütterle',
      role: 'Gründer · Finanzen, Kalkulation und Neukunden',
      bio: 'Studiert Wirtschaftsmathematik an der Universität Mannheim und verantwortet alles, was mit Zahlen zu tun hat: Kalkulation, Angebote, Buchhaltung und Rechnungen. Führt die Erstgespräche mit neuen Kunden.',
      focus: ['Kalkulation und Angebote', 'Buchhaltung und Rechnungen', 'Erstgespräche und Neukunden'],
      statement: 'Keine Überraschungen auf der Rechnung. Was im Angebot steht, zahlen Sie. Nicht mehr.',
      image: 'founder-1',
      draft: null,
    },
    {
      name: 'Lino Resham',
      role: 'Gründer · Kundenbetreuung und Qualität',
      bio: 'Hauptberuflich im Vertrieb und es gewohnt, Kunden langfristig zu betreuen. Ist Ihr Ansprechpartner im laufenden Betrieb und führt die regelmäßigen Qualitätskontrollen durch.',
      focus: ['Feste Ansprechperson für Kunden', 'Qualitätskontrollen vor Ort', 'Reklamationen'],
      statement: 'Vertrauen entsteht nicht im ersten Gespräch, sondern an jedem Morgen, an dem Ihr Büro einfach sauber ist.',
      image: 'founder-2',
      draft: null,
    },
    {
      name: 'Eknoor Singh',
      role: 'Gründer · Team und Einsatzplanung',
      bio: 'Hauptberuflich im Vertrieb und bei CleanStar verantwortlich für das Team: Auswahl und Einarbeitung der Mitarbeiter, Einsatzplanung und Vertretung bei Ausfall.',
      focus: ['Personal und Einarbeitung', 'Einsatz- und Vertretungsplanung', 'Schlüssel- und Zugangsmanagement'],
      statement: 'Gute Reinigung steht und fällt mit dem Team. Unsere Leute kennen Ihr Objekt, und wenn jemand ausfällt, ist trotzdem jemand da.',
      image: 'founder-3',
      draft: null,
    },
  ] as Person[],

  /** Ansprechpartner für Neukunden (Index in founders): Karte „Ihr Ansprechpartner“ */
  newClientContact: 0,

  /** Firmengeschichte. Nur Einträge mit confirmed: true erscheinen auf der Website. */
  timeline: [
    {
      year: '2024',
      title: 'Gründung in Offenburg',
      text: 'Nico Schütterle, Lino Resham und Eknoor Singh gründen CleanStar Dienstleistungen als GbR. Das Team bringt über 6 Jahre Erfahrung in der Reinigung mit.',
      confirmed: true,
    },
    { year: 'TODO', title: 'Erste feste Büroobjekte', text: 'Die ersten Unternehmen vertrauen uns ihre Büroreinigung dauerhaft an.', confirmed: false },
  ] as TimelineEntry[],
}

export type Company = typeof company

/** Ist ein Formular-Endpunkt eingetragen? Sonst Vorschau-Modus. */
export const formsConfigured = () => (company.forms.provider === 'web3forms' ? company.forms.accessKey.trim() !== '' : company.forms.endpoint.includes('formspree.io/f/'))

export const fullAddress = () => `${company.address.street}, ${company.address.zip} ${company.address.city}`
