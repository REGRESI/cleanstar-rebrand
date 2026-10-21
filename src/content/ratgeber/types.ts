export type GuideCategory = 'unternehmen' | 'gruender'

/** Was am Ende des Artikels angeboten wird */
export type GuideCta = 'angebot' | 'partner' | 'kalkulation' | 'vergleich' | 'wechsel' | 'check'

export interface GuideSource {
  title: string
  publisher: string
  url: string
  /** Stand bzw. Abrufdatum */
  stand: string
}

export interface Guide {
  slug: string
  /** H1 */
  title: string
  /** Title-Tag ohne Zusatz, höchstens 39 Zeichen, Keyword vorn */
  seoTitle: string
  /** Meta-Description, 140 bis 160 Zeichen */
  description: string
  category: GuideCategory
  /** Index in company.founders */
  author: 0 | 1 | 2
  published: string
  modified: string
  /** Klare Antwort im ersten Absatz, ohne Kontext verständlich */
  answer: string
  /** Artikeltext (Markdown, siehe features/guide/Markdown.tsx) */
  body: string
  faqs: { q: string; a: string }[]
  sources: GuideSource[]
  /** Schritt-für-Schritt-Anleitung für strukturierte Daten (HowTo) */
  howTo?: { name: string; steps: { name: string; text: string }[] }
  cta: GuideCta
  related: string[]
  /** Passender Download am Artikelende */
  download?: 'serviceList' | 'checklist'
}
