/// <reference types="vite/client" />

declare const __PREVIEW__: boolean

declare module 'virtual:downloads' {
  const downloads: Record<'checklist', { href: string; file: string }>
  export default downloads
}
