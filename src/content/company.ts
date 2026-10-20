/**
 * FIRMENDATEN – zentrale Quelle für alle Fakten auf der Website.
 *
 * Regeln:
 * - Hier stehen nur bestätigte Fakten. Nichts erfinden.
 * - Fehlt ein Wert, steht er auf `null` und ist mit TODO markiert.
 *   Die Website zeigt dann einen neutralen Ersatztext. Solange
 *   `showTodoMarkers` auf true steht, erscheint zusätzlich ein gelber
 *   TODO-Hinweis, damit nichts vergessen wird.
 * - Telefonnummer, E-Mail usw. hier ändern, nicht in den Seiten.
 */

export type OpeningHours = { days: string; hours: string }[]

export interface Person {
  /** TODO: Name eintragen. null = Platzhalter wird angezeigt */
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
  showTodoMarkers: true,

  name: 'CleanStar Dienstleistungen',
  legalForm: 'GbR',
  legalName: 'CleanStar Dienstleistungen GbR',
  shortName: 'CleanStar',
  siteUrl: 'https://cleanstar-dienstleistungen.de',
  seat: 'Offenburg',
  serviceArea: 'Ortenaukreis',

  address: {
    // Quelle: strukturierte Daten der bisherigen Website (PLZ, Straße) und Branchenverzeichnisse (Hausnummer).
    // TODO: Hausnummer einmal gegen das bisherige Impressum prüfen.
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

  whatsapp: {
    /** WhatsApp-Link auf der Kontaktseite anzeigen */
    enabled: false,
    /** Nummer im internationalen Format ohne + und Leerzeichen */
    number: '491738512107',
  },

  /** TODO: Öffnungs- bzw. Erreichbarkeitszeiten konnten nicht von der alten Website gelesen werden. */
  openingHours: null as OpeningHours | null,

  /** TODO: Vertretungsberechtigte Gesellschafter laut Impressum eintragen (Vor- und Nachname). */
  partners: null as string[] | null,

  /** TODO: Umsatzsteuer-ID (falls vorhanden) */
  vatId: null as string | null,

  /** TODO: Jahre Erfahrung bzw. Gründungsjahr. null = wird nirgends angezeigt */
  foundedYear: null as number | null,
  yearsOfExperience: null as number | null,

  /** Versprechen aus dem Briefing (bestätigt) */
  promises: {
    responseHours: 24,
    offerHours: 48,
    freeInspection: true,
    fixedContact: true,
    replacementOnAbsence: true,
  },

  /** TODO: Frist für kostenlose Nachreinigung nach Reklamation, z. B. "24 Stunden" oder "zwei Werktagen" */
  complaintPeriod: null as string | null,

  /** TODO: Betriebshaftpflicht vorhanden? Nur true setzen, wenn bestätigt. Summen werden nicht genannt. */
  liabilityInsurance: null as boolean | null,

  booking: {
    /**
     * TODO: Cal.com-Link für die Objektbesichtigung, z. B. "https://cal.com/cleanstar/besichtigung".
     * Wird erst nach Klick und Einwilligung geladen (DSGVO).
     */
    calUrl: '' as string,
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
    accessKey: '' as string,
    /**
     * TODO: Bestätigungsmail an Kunden. Bei Web3Forms (Pro) bzw. Formspree (Autoresponse) im Dashboard
     * einrichten und dann hier auf true setzen. Erst dann verspricht die Website eine Kopie per E-Mail.
     */
    confirmationEmail: false,
  },

  /** Anzahl der Gründer-Porträts auf der Über-uns-Seite (2 oder 3) */
  /**
   * Gründer. Namen, Fotos und Freigabe der Texte fehlen noch (TODO).
   * Statements und Zuständigkeiten sind Entwürfe nach Absprache, bitte prüfen und dann draft: null setzen.
   */
  founders: [
    {
      name: null,
      role: 'Gründer · Finanzen und Neukunden',
      bio: 'Studiert Wirtschaftsmathematik und sorgt dafür, dass jedes Angebot nachvollziehbar kalkuliert ist und jede Rechnung stimmt.',
      focus: ['Kalkulation und Angebote', 'Buchhaltung und Rechnungen', 'Erstgespräche mit neuen Kunden'],
      statement: 'Ein Angebot muss man nachrechnen können. Bei uns sehen Sie, welche Stunden wir kalkulieren und warum. Dann gibt es später keine Überraschungen.',
      image: 'founder-1',
      draft: 'Name, Foto und Texte bitte freigeben',
    },
    {
      name: null,
      role: 'Gründer · Kunden und Teams',
      bio: 'Arbeitet hauptberuflich im Vertrieb und weiß, was Kunden von einem Dienstleister erwarten: dass er erreichbar ist und Wort hält.',
      focus: ['Betreuung unserer Kunden', 'Einsatzplanung der Teams', 'Mitarbeiter und Einarbeitung'],
      statement: 'Wenn ich Ihnen etwas zusage, dann gilt das. Und wenn etwas nicht passt, will ich es von Ihnen hören, bevor es ein Problem wird.',
      image: 'founder-2',
      draft: 'Name, Foto und Texte bitte freigeben',
    },
    {
      name: null,
      role: 'Gründer · Kunden und Qualität',
      bio: 'Ebenfalls hauptberuflich im Vertrieb. Hält den direkten Draht zu unseren Kunden und achtet darauf, dass die Qualität dauerhaft stimmt.',
      focus: ['Betreuung unserer Kunden', 'Qualitätskontrollen', 'Personal und Vertretungen'],
      statement: 'Sauber ist nicht, was am ersten Tag glänzt. Sauber ist, wenn es nach einem Jahr noch genauso aussieht.',
      image: 'founder-3',
      draft: 'Name, Foto und Texte bitte freigeben',
    },
  ] as Person[],

  /** Firmengeschichte. Nur Einträge mit confirmed: true erscheinen auf der Website. */
  timeline: [
    { year: 'TODO', title: 'Gründung in Offenburg', text: 'CleanStar Dienstleistungen wird als GbR in Offenburg gegründet.', confirmed: false },
    { year: 'TODO', title: 'Erste feste Büroobjekte', text: 'Die ersten Unternehmen vertrauen uns ihre Büroreinigung dauerhaft an.', confirmed: false },
    { year: 'TODO', title: 'Neuer Webauftritt', text: 'Klarere Abläufe, Angebot in 48 Stunden, Qualitätsgarantie schriftlich.', confirmed: false },
  ] as TimelineEntry[],
}

export type Company = typeof company

/** Ist ein Formular-Endpunkt eingetragen? Sonst Vorschau-Modus. */
export const formsConfigured = () => (company.forms.provider === 'web3forms' ? company.forms.accessKey.trim() !== '' : company.forms.endpoint.includes('formspree.io/f/'))

export const fullAddress = () => `${company.address.street}, ${company.address.zip} ${company.address.city}`
