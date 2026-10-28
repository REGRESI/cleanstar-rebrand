/// <reference types="vite/client" />

declare const __PREVIEW__: boolean
/** true im GitHub-Pages-Vorschau-Build (PAGES=1): Basis /cleanstar-rebrand/, Passwort-Sperre, noindex */
declare const __PAGES__: boolean

declare module 'virtual:downloads' {
  const downloads: Record<'checklist' | 'partnerInfo' | 'serviceList', { href: string; file: string; size: number }>
  export default downloads
}

declare module 'virtual:preview-images' {
  const images: Record<string, string>
  export default images
}

declare module 'virtual:hero-frames' {
  const hero: {
    desktop: string[]
    mobile: string[]
    still: Record<'aussen-d' | 'aussen-m' | 'morgen-d' | 'morgen-m', string> & { 'aussen-m-lq'?: string }
    /** Schlüsselmomente: Position in der Sequenz (0 … 1) und Standbild für Desktop (d) und Handy (m, null = d verwenden) */
    keys: { name: string; progress: number; d: string; m: string | null }[]
    /** true in der Vorschau-Datei (alles eingebettet) */
    inline: boolean
  }
  export default hero
}
