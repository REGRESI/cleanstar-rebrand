import { Link, useLocation } from 'react-router-dom'
import { Phone, PhoneIncoming, Sparkles } from 'lucide-react'
import { useCallbackRequest } from '@/features/callback/Callback'
import { company } from '@/content/company'
import { useQuote } from '@/features/configurator/QuoteContext'
import { scrollToId } from '@/lib/smooth-scroll'
import { useHeroVisible } from '@/lib/heroVisibility'
import { cn } from '@/lib/cn'

/** Dezente Leiste am unteren Rand auf dem Handy: Anrufen, Rückruf und Angebot (auf /partner: Partneranfrage). */
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
        'fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-500 ease-out lg:hidden',
        heroVisible && 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      <div className="glass mx-auto flex max-w-md gap-2 rounded-full p-1.5 shadow-lift ring-1 ring-line">
        <a
          href={company.phone.href}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-ink active:bg-blue-soft min-[380px]:text-[0.9375rem]"
        >
          <Phone aria-hidden className="size-4 shrink-0 text-blue" />
          Anrufen
        </a>
        <button
          type="button"
          onClick={callback.open}
          aria-label="Rückruf anfordern"
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-ink active:bg-blue-soft min-[380px]:text-[0.9375rem]"
        >
          <PhoneIncoming aria-hidden className="size-4 shrink-0 text-blue" />
          Rückruf
        </button>
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
