// StPageFlip liefert keine Typen mit: nur das, was die flache Leistungsmappe nutzt
declare module 'page-flip/dist/js/page-flip.module.js' {
  export class PageFlip {
    constructor(el: HTMLElement, settings: Record<string, number | string | boolean>)
    loadFromHTML(items: HTMLElement[]): void
    on(event: 'flip' | 'changeOrientation' | 'changeState' | 'init', cb: (e: { data: unknown }) => void): this
    getCurrentPageIndex(): number
    getSettings(): { disableFlipByClick: boolean }
    getState(): 'user_fold' | 'fold_corner' | 'flipping' | 'read'
    getOrientation(): 'portrait' | 'landscape'
    getBoundsRect(): { pageWidth: number; height: number; width: number; left: number; top: number }
    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    flip(page: number, corner?: 'top' | 'bottom'): void
    turnToPage(page: number): void
    destroy(): void
  }
}
