import logoSvg from '@/assets/brand/logo.svg?raw'
import { cn } from '@/lib/cn'

const inner = logoSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

/** Original-Logo von CleanStar als sauberes SVG nachgebaut (Design unverändert). */
export function Logo({ className, title = 'CleanStar Dienstleistungen' }: { className?: string; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="96 400 830 216"
      role="img"
      aria-label={title}
      className={cn('block h-auto', className)}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
