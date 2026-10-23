/**
 * BEWEISE – Objekte, die wir betreuen, und Stimmen von Kunden.
 *
 * Regeln:
 * - Nur echte Einträge. Nichts erfinden, nichts ausschmücken.
 * - Objekte anonymisiert: Branche, Fläche, Ort, Intervall, seit wann. Keine Firmennamen ohne Freigabe.
 * - Zitate nur mit schriftlicher Freigabe des Kunden (Name, Funktion und Firma inklusive).
 * - Der Abschnitt erscheint auf der Startseite erst, wenn `enabled: true` gesetzt ist UND mindestens ein Eintrag vorliegt.
 *
 * Beispiel für ein Objekt (nicht echt, nur Format):
 *   { sector: 'Steuerkanzlei', area: '420 m²', place: 'Offenburg', interval: '3 × pro Woche, abends', since: '2025' }
 * Beispiel für ein Zitat (nicht echt, nur Format):
 *   { quote: '…', name: 'Vorname Nachname', role: 'Geschäftsführerin', company: 'Firma GmbH', approved: true }
 */

export interface ProofObject {
  /** Branche, z. B. „Steuerkanzlei“ */
  sector: string
  /** Fläche mit Einheit, z. B. „420 m²“ */
  area: string
  /** Ort im Einzugsgebiet */
  place: string
  /** Reinigungsintervall, z. B. „3 × pro Woche, abends“ */
  interval: string
  /** Seit wann, z. B. „2025“ */
  since: string
}

export interface ProofQuote {
  quote: string
  name: string
  role: string
  company: string
  /** Schriftliche Freigabe liegt vor. Ohne Freigabe wird das Zitat nicht gezeigt. */
  approved: boolean
}

export const proof = {
  enabled: false,
  objects: [] as ProofObject[],
  quotes: [] as ProofQuote[],
  /** Kundenlogos, nur mit Freigabe (Dateien unter public/kunden/). */
  logos: [] as { name: string; src: string }[],
}

/** Freigegebene Zitate */
export const approvedQuotes = () => proof.quotes.filter((q) => q.approved)

/** Erscheint der Abschnitt? */
export const hasProof = () => proof.enabled && (proof.objects.length > 0 || approvedQuotes().length > 0)
