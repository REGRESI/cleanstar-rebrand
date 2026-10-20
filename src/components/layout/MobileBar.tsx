import { Link, useLocation } from 'react-router-dom'
import { Phone, Sparkles } from 'lucide-react'
import { company } from '@/content/company'
import { useQuote } from '@/features/configurator/QuoteContext'
import { scrollToId } from '@/lib/smooth-scroll'
import { useHeroVisible } from '@/lib/heroVisibility'
import { cn } from '@/lib/cn'

/** Dezente Leiste am unteren Rand auf dem Handy: Anrufen und Angebot (auf /partner: Partneranfrage). */
export function MobileBar() {
  const { open, isOpen } = useQuote()
  const partner = useLocation().pathname.startsWith('/partner')
  // Auf der Startseite erst nach dem Hero-Einstieg zeigen (kein doppelter Call-to-Action)
  const heroVisible = useHeroVisible()
  if (isOpen) return null
  return (
    <div
      aria-hidden={heroVisible || undefined}
      inert={heroVisible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-500 ease-out lg:hidden',
        heroVisible && 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      <div className="glass mx-auto flex max-w-md gap-2 rounded-full p-1.5 shadow-lift ring-1 ring-line">
        <a href={company.phone.href} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[0.9375rem] font-semibold text-ink active:bg-ink/5">
          <Phone aria-hidden className="size-4 text-blue" />
          Anrufen
        </a>
        <Link
          to={partner ? '/partner' : '/angebot'}
          onClick={(e) => {
            e.preventDefault()
            if (partner) scrollToId('bewerbung')
            else open()
          }}
          className="flex h-12 flex-[1.3] items-center justify-center gap-2 rounded-full bg-blue text-[0.9375rem] font-semibold text-white active:bg-blue-hover"
        >
          <Sparkles aria-hidden className="size-4" />
          {partner ? 'Partneranfrage' : 'Angebot'}
        </Link>
      </div>
    </div>
  )
}
