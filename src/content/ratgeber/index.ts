/**
 * RATGEBER – Artikel für Unternehmen und Gründer unter /ratgeber/<slug>.
 * Regeln: klare Antwort im ersten Absatz, Fakten mit Quelle und Stand, nichts Unbelegtes.
 * Neue Artikel: Datei anlegen und hier in die Liste aufnehmen.
 */
import type { Guide, GuideCategory } from './types'
import kosten from './bueroreinigung-kosten'
import wechseln from './reinigungsfirma-wechseln'
import lv from './leistungsverzeichnis-bueroreinigung'
import arten from './unterhaltsreinigung-grundreinigung-sonderreinigung'
import gute from './gute-reinigungsfirma-erkennen'
import hygiene from './hygiene-im-buero'
import gruenden from './reinigungsfirma-gruenden'
import kunden from './erste-kunden-reinigungsfirma'
import kalkulieren from './reinigungsfirma-kalkulieren'
import franchise from './franchise-oder-allein-starten'

export type { Guide, GuideCategory, GuideCta } from './types'

export const guides: Guide[] = [kosten, wechseln, lv, arten, gute, hygiene, gruenden, kunden, kalkulieren, franchise]

export const guideCategories: { id: GuideCategory; label: string; text: string }[] = [
  { id: 'unternehmen', label: 'Für Unternehmen', text: 'Kosten, Verträge, Qualität und Hygiene: Wissen für Geschäftsführer und Office-Verantwortliche.' },
  { id: 'gruender', label: 'Für Gründer', text: 'Gründung, Kalkulation und Kundengewinnung: Wissen für alle, die eine Reinigungsfirma aufbauen, deutschlandweit.' },
]

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug)

/** Wörter im Artikel (Antwort, Text und FAQ) */
export const wordCount = (g: Guide) => [g.answer, g.body, ...g.faqs.flatMap((f) => [f.q, f.a])].join(' ').split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length

/** Lesedauer in Minuten (rund 200 Wörter pro Minute) */
export const readingMinutes = (g: Guide) => Math.max(1, Math.round(wordCount(g) / 200))
