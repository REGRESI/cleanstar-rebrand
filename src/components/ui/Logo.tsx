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
export function Logo({ className, title = 'CleanStar Dienstleistungen', mono }: { className?: string; title?: string; mono?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="96 400 830 216"
      role="img"
      aria-label={title}
      className={cn('block h-auto', className)}
      dangerouslySetInnerHTML={{ __html: mono ? innerMono : inner }}
    />
  )
}
