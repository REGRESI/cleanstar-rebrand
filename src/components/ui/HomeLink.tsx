import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { scrollToTop } from '@/lib/smooth-scroll'

/**
 * Link zur Startseite (Logo in Kopf- und Fußzeile). Auf der Startseite selbst: weich nach ganz oben scrollen.
 * Von anderen Seiten: normaler Seitenwechsel, der Layout-Wechsel setzt dann sofort nach oben.
 */
export function HomeLink({ children, className, label, onNavigate }: { children: ReactNode; className?: string; label: string; onNavigate?: () => void }) {
  const { pathname, hash } = useLocation()
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    onNavigate?.()
    if (pathname === '/' && !hash) {
      e.preventDefault()
      scrollToTop(false)
    }
  }
  return (
    <Link to="/" aria-label={label} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
