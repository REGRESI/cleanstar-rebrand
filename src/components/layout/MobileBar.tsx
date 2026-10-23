import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCallbackRequest } from '@/features/callback/Callback'
import { company } from '@/content/company'
import { useQuote } from '@/features/configurator/QuoteContext'
import { scrollToId } from '@/lib/smooth-scroll'
import { useHeroVisible } from '@/lib/heroVisibility'
import { cn } from '@/lib/cn'

/** Leiste am unteren Rand auf dem Handy: Anrufen, Rückruf und Angebot (auf /partner: Partneranfrage). Rechteckig, mit Haarlinien. */
export function MobileBar() {
  const { open, isOpen } = useQuote()
  const callback = useCallbackRequest()
  const partner = useLocation().pathname.startsWith('/partner')
  // Auf der Startseite erst nach dem Hero-Einstieg zeigen (kein doppelter Call-to-Action)
  const heroVisible = useHeroVisible()
  if (isOpen || callback.isOpen) return null
  return (
    <div
      aria-hidden={heroVisible || undefined}
      inert={heroVisible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] transition-[transform,opacity] duration-500 ease-cs lg:hidden',
        heroVisible && 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      <div className="flex h-14 divide-x divide-line">
        <a href={company.phone.href} className="flex flex-1 items-center justify-center text-[0.9375rem] font-medium text-ink active:bg-surface">
          Anrufen
        </a>
        <button
          type="button"
          onClick={callback.open}
          aria-label="Rückruf anfordern"
          className="flex flex-1 items-center justify-center text-[0.9375rem] font-medium text-ink active:bg-surface"
        >
          Rückruf
        </button>
        <Link
          to={partner ? '/partner' : '/angebot'}
          onClick={(e) => {
            e.preventDefault()
            if (partner) scrollToId('bewerbung')
            else open()
          }}
          className="flex flex-[1.4] items-center justify-center gap-2 bg-blue text-[0.9375rem] font-medium text-paper active:bg-blue-hover"
        >
          {partner ? 'Partneranfrage' : 'Angebot'}
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  )
}
