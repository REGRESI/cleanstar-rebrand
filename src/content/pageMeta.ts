/**
 * Autor und Datumsangaben für Werkzeuge und die Fakten-Seite (sichtbar als „Zuletzt aktualisiert“ und im Schema).
 * author = Index in company.founders. Beim inhaltlichen Ändern einer Seite bitte `modified` anpassen.
 */
export interface PageMeta {
  author: number
  published: string
  modified: string
}

export const pageMeta: Record<string, PageMeta> = {
  '/angebote-vergleichen': { author: 0, published: '2026-10-21', modified: '2026-10-29' },
  '/wechsel-rechner': { author: 1, published: '2026-10-21', modified: '2026-10-29' },
  '/reinigungsfirma-kalkulieren': { author: 0, published: '2026-10-21', modified: '2026-10-29' },
  '/reinigungs-check': { author: 1, published: '2026-10-21', modified: '2026-10-29' },
  '/fakten': { author: 0, published: '2026-10-21', modified: '2026-10-29' },
}
