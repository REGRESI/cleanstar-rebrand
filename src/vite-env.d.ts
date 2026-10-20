/// <reference types="vite/client" />

declare const __PREVIEW__: boolean

declare module 'virtual:downloads' {
  const downloads: Record<'checklist' | 'partnerInfo', { href: string; file: string }>
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
    still: Record<'aussen-d' | 'aussen-m' | 'morgen-d' | 'morgen-m', string>
    /** true in der Vorschau-Datei (alles eingebettet) */
    inline: boolean
  }
  export default hero
}
