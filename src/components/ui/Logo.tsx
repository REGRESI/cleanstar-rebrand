import { useId } from 'react'
import logoSvg from '@/assets/brand/logo.svg?raw'
import { cn } from '@/lib/cn'

const inner = logoSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

/**
 * Ein-Farb-Variante: Alle Flächen und Linien in der Textfarbe (currentColor), Form unverändert.
 * Die weiße Freistellung um die Sterne nimmt die Hintergrundfarbe des Papiers an.
 */
const innerMono = inner
  .replace(/<defs>[\s\S]*?<\/defs>/, '')
  .replace(/url\(#cs[AB]\)/g, 'currentColor')
  .replace(/"#0[0-9A-F]{5}"/gi, '"currentColor"')
  .replace(/stroke="#fff"/g, 'style="stroke:var(--color-paper)"')

/** Original-Logo von CleanStar als sauberes SVG nachgebaut (Design unverändert). */
export function Logo({ className, title = 'CleanStar Dienstleistungen', mono, symbol }: { className?: string; title?: string; mono?: boolean; symbol?: boolean }) {
  // Eindeutige Verlaufs-IDs je Logo: Sonst fehlt das Symbol, wenn das erste Logo der Seite verborgen ist
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const html = mono ? innerMono : inner.replace(/cs([AB])\b/g, `cs$1${uid}`)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={symbol ? '96 400 216 216' : '96 400 830 216'}
      role="img"
      aria-label={title}
      className={cn('block h-auto', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
