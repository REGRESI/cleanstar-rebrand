import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCallbackRequest } from '@/features/callback/Callback'
import { company } from '@/content/company'
import { useQuote } from '@/features/configurator/QuoteContext'
import { scrollToId } from '@/lib/smooth-scroll'
import { useHeroVisible } from '@/lib/heroVisibility'
import { cn } from '@/lib/cn'

/** Leiste am unteren Rand auf dem Handy: Anrufen, Rückruf und Angebot (auf /partner: Partneranfrage). Rechteckig, mit Haarlinien, als milchiges Glas. */
export function MobileBar() {
  const { open, isOpen } = useQuote()
  const callback = useCallbackRequest()
  const partner = useLocation().pathname.startsWith('/partner')
  // Auf der Startseite erst nach dem Hero-Einstieg zeigen (kein doppelter Call-to-Action)
  const heroVisible = useHeroVisible()
  // Über dunklen Abschnitten dunkles Glas, sonst wirkt die helle Leiste dort grau
  const bar = useRef<HTMLDivElement>(null)
  const [dark, setDark] = useState(false)
  // Ohne Abfrage je Scroll-Frame (elementsFromPoint erzwingt Layout): ein IntersectionObserver beobachtet die dunklen
  // Abschnitte in einem schmalen Streifen auf Höhe der Leiste
  const { pathname } = useLocation()
  useEffect(() => {
    const under = new Set<Element>()
    let io: IntersectionObserver | null = null
    const setup = () => {
      io?.disconnect()
      under.clear()
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) under.add(e.target)
            else under.delete(e.target)
          }
          setDark(under.size > 0)
        },
        { rootMargin: `-${Math.max(0, window.innerHeight - 30)}px 0px -26px 0px` },
      )
      document.querySelectorAll('main .on-dark, footer .on-dark, footer.on-dark').forEach((n) => io!.observe(n))
    }
    // nach dem Aufbau der Seite (nachgeladene Abschnitte) einmal neu einsammeln
    setup()
    const t = window.setTimeout(setup, 1500)
    let rt = 0
    const onResize = () => {
      window.clearTimeout(rt)
      rt = window.setTimeout(setup, 300)
    }
    addEventListener('resize', onResize)
    return () => {
      io?.disconnect()
      window.clearTimeout(t)
      window.clearTimeout(rt)
      removeEventListener('resize', onResize)
    }
  }, [pathname])
  if (isOpen || callback.isOpen) return null
  return (
    <div
      ref={bar}
      data-dark={dark || undefined}
      aria-hidden={heroVisible || undefined}
      inert={heroVisible}
      style={heroVisible ? { transform: 'translate3d(0,100%,0)' } : undefined}
      className={cn(
        'glass mobile-bar fixed inset-x-0 [view-transition-name:mobile-bar] bottom-0 z-40 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] transition-[transform,opacity] duration-500 ease-cs lg:hidden',
        heroVisible && 'pointer-events-none opacity-0',
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
