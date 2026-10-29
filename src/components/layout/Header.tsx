import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { Picture } from '@/components/ui/Picture'
import { Button } from '@/components/ui/Button'
import { AvailableNow, newClientContact } from '@/components/ui/ContactPerson'
import { navigation } from '@/content/site'
import { company } from '@/content/company'
import { services } from '@/content/services'
import type { ImageId } from '@/content/images'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { useQuote } from '@/features/configurator/QuoteContext'
import { cn } from '@/lib/cn'
import { lockScroll } from '@/lib/smooth-scroll'
import { EASE_CS_ARRAY } from '@/lib/ease'
import { prefersReducedMotion } from '@/lib/env'

const mobileSecondary = [
  { label: 'Ratgeber', to: '/ratgeber' },
  { label: 'Karriere', to: '/karriere' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Partner werden', to: '/partner' },
]

/** Hintergrundfoto je Menüpunkt (Vollbild-Menü, beim Überfahren) */
const navImage: Record<string, ImageId> = {
  '/leistungen': 'svc-buero',
  '/qualitaetsgarantie': 'quality-check',
  '/ablauf': 'inspection',
  '/einzugsgebiet': 'region',
  '/ueber-uns': 'team-work',
  '/kontakt': 'contact',
}

// Büroreinigung als Schwerpunkt zuerst
const megaServices = [...services].sort((a, b) => Number(b.slug === 'bueroreinigung') - Number(a.slug === 'bueroreinigung'))

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Kopfzeile über die volle Breite: Klarweiß, Haarlinie unten, Logo links, Navigation als Text mit wanderndem Unterstrich
 * (Überfahren und aktive Seite), rechts ein Button. Beim Scrollen nach unten blendet sie aus, nach oben wieder ein.
 *
 * Desktop: „Leistungen“ öffnet ein Mega-Menü über die volle Breite (links die Leistungen groß, rechts das passende
 * Foto mit kurzem Satz, unten Leistungsmappe und Besichtigung). Öffnet mit ruhigem Aufklappen, Einträge gestaffelt.
 * Mobil: Vollbild-Menü auf Navy, öffnet sich als Kreis aus dem Menü-Button. Escape schließt, der Fokus bleibt im Menü
 * und kehrt danach zum Button zurück, die Seite darunter scrollt nicht.
 */
export function Header() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState(false)
  const [mega, setMega] = useState(false)
  const { pathname, key } = useLocation()
  const last = useRef(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        setScrolled(y > 24)
        // Lichtreflexion im Glas wandert langsam mit der Scrollposition (nur transform)
        bar.current?.style.setProperty('--glint', `${(y * 0.35) % (window.innerWidth + 400)}px`)
        const d = y - last.current
        if (y < 96) setHidden(false)
        else if (d > 6) setHidden(true)
        else if (d < -6) setHidden(false)
        last.current = y
      })
    }
    last.current = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Nach jedem Seitenwechsel sichtbar und Menüs zu
  useEffect(() => {
    setMenu(false)
    setMega(false)
    setHidden(false)
  }, [pathname, key])

  // Beim Ausblenden der Leiste schließt auch das Mega-Menü
  useEffect(() => {
    if (hidden) setMega(false)
  }, [hidden])

  const dark = menu
  return (
    // Nur die Leiste wird verschoben: Ein transformierter <header> wäre Bezugsrahmen für das feste Vollbild-Menü
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 [view-transition-name:site-header]">
      <div
        ref={bar}
        className={cn(
          'pointer-events-auto relative z-20 border-b transition-[transform,background-color,border-color] duration-500 ease-cs focus-within:translate-y-0',
          dark ? 'border-line-dark bg-night text-paper' : 'border-line bg-paper',
          scrolled && !menu && !mega && 'glass',
          hidden && !menu && '-translate-y-full',
        )}
        onPointerLeave={(e) => e.pointerType === 'mouse' && megaHover.closeSoon()}
      >
        {scrolled && !menu && !mega && (
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="glass-glint" />
          </span>
        )}
        <div className="container-site relative flex h-16 items-center justify-between gap-6 lg:h-[4.75rem]">
          <HomeLink label={`${company.name}, zur Startseite`} className="shrink-0" onNavigate={() => setMenu(false)}>
            <Logo mono={dark} className={cn('w-[124px] lg:w-[142px]', dark && 'text-paper')} />
          </HomeLink>

          <DesktopNav mega={mega} setMega={setMega} />

          <div className="flex items-center gap-5">
            <a href={company.phone.href} className="ulink hidden py-1 font-medium tabular-nums text-[0.8125rem] whitespace-nowrap text-ink 2xl:inline-block">
              {company.phone.display}
            </a>
            <Link to="/partner" className="ulink hidden py-1 text-[0.875rem] whitespace-nowrap text-muted hover:text-ink xl:inline-block">
              Partner werden
            </Link>
            <QuoteButton size="sm" wrapClassName="hidden sm:inline-flex">
              Kostenloses Angebot
            </QuoteButton>
            <MenuButton open={menu} onToggle={() => setMenu((m) => !m)} />
          </div>
        </div>
      </div>

      <AnimatePresence>{mega && <MegaMenu key="mega" onClose={() => setMega(false)} />}</AnimatePresence>
      <AnimatePresence>{menu && <MobileMenu key="menu" onClose={() => setMenu(false)} />}</AnimatePresence>
    </header>
  )
}

// Öffnen und Schließen des Mega-Menüs mit kurzer Verzögerung: Der Weg vom Menüpunkt ins Panel schließt es nicht
const megaHover = {
  timer: 0,
  set: (() => {}) as (v: boolean) => void,
  cancel() {
    window.clearTimeout(this.timer)
  },
  openSoon() {
    this.cancel()
    this.timer = window.setTimeout(() => this.set(true), 90)
  },
  closeSoon() {
    this.cancel()
    this.timer = window.setTimeout(() => this.set(false), 220)
  },
}

/* ---------------------------------------------------------------------------------------------------------------
 * Desktop-Navigation mit Unterstrich und Mega-Menü-Auslöser
 * ------------------------------------------------------------------------------------------------------------- */

function DesktopNav({ mega, setMega }: { mega: boolean; setMega: (v: boolean) => void }) {
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    megaHover.set = setMega
    return () => megaHover.cancel()
  }, [setMega])
  // Escape schließt und gibt den Fokus an den Auslöser zurück
  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMega(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mega, setMega])

  return (
    <nav aria-label="Hauptnavigation" className="hidden lg:block">
      <ul className="flex items-center gap-7 xl:gap-9">
        {navigation.map((item) =>
          item.to === '/leistungen' ? (
            <li key={item.to} className="flex items-center gap-1" onPointerEnter={(e) => e.pointerType === 'mouse' && megaHover.openSoon()}>
              <NavLink to={item.to} className={cn('navlink py-1 text-[0.9375rem] whitespace-nowrap text-ink', mega && 'is-open')}>
                {item.label}
              </NavLink>
              <button
                ref={toggle}
                type="button"
                className="-mr-1 grid size-7 place-items-center text-muted hover:text-ink"
                aria-expanded={mega}
                aria-controls="mega-menu"
                aria-label={mega ? 'Leistungsmenü schließen' : 'Leistungsmenü öffnen'}
                onClick={() => setMega(!mega)}
              >
                <ChevronDown aria-hidden className={cn('size-4 transition-transform duration-300 ease-cs', mega && 'rotate-180')} strokeWidth={1.75} />
              </button>
            </li>
          ) : (
            <li key={item.to} onPointerEnter={(e) => e.pointerType === 'mouse' && mega && megaHover.closeSoon()}>
              <NavLink to={item.to} className="navlink py-1 text-[0.9375rem] whitespace-nowrap text-ink">
                {item.label}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}

/* ---------------------------------------------------------------------------------------------------------------
 * Mega-Menü „Leistungen“ (Desktop)
 * ------------------------------------------------------------------------------------------------------------- */

function MegaMenu({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(0)
  const { open } = useQuote()
  const reduced = prefersReducedMotion()
  const item = (i: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE_CS_ARRAY, delay: 0.12 + i * 0.045 },
  })
  return (
    <>
      {/* Seite darunter leicht abgedunkelt; Überfahren schließt */}
      <motion.div
        aria-hidden
        className="pointer-events-auto fixed inset-x-0 top-[4.75rem] bottom-0 hidden bg-ink/25 lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onPointerEnter={() => megaHover.closeSoon()}
        onClick={onClose}
      />
      <motion.div
        id="mega-menu"
        className="pointer-events-auto absolute inset-x-0 top-full z-10 hidden border-b border-line bg-paper lg:block"
        initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
        animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
        exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.55, ease: EASE_CS_ARRAY }}
        onPointerEnter={() => megaHover.cancel()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && megaHover.closeSoon()}
      >
        <div className="container-site grid-site gap-y-10 pt-12 pb-10">
          <div className="col-span-6">
            <p className="t-label">Leistungen</p>
            <ul className="mt-6 border-t border-line">
              {megaServices.map((s, i) => (
                <motion.li key={s.slug} {...item(i)} className="border-b border-line">
                  <Link
                    to={`/leistungen/${s.slug}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={cn(
                      'group flex items-baseline justify-between gap-6 py-3.5 text-[1.75rem] leading-[1.15] font-medium tracking-[-0.03em] transition-colors duration-300 xl:text-[2rem]',
                      active === i ? 'text-ink' : 'text-muted',
                    )}
                  >
                    <span className="flex items-baseline gap-4">
                      {s.name}
                      {s.slug === 'bueroreinigung' && <span className="t-label text-blue">Schwerpunkt</span>}
                    </span>
                    <ArrowRight
                      aria-hidden
                      className={cn('size-5 shrink-0 self-center transition-all duration-500 ease-cs', active === i ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0')}
                      strokeWidth={1.5}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div {...item(2)} className="col-span-5 col-start-8">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
              {megaServices.map((s, i) => (
                <div key={s.slug} className={cn('absolute inset-0 transition-opacity duration-700 ease-cs', active === i ? 'opacity-100' : 'opacity-0')} aria-hidden={active !== i}>
                  <Picture
                    id={s.image}
                    ratio="4:3"
                    sizes="36vw"
                    className={cn('size-full transition-transform duration-[1400ms] ease-cs', active === i ? 'scale-100' : 'scale-[1.04]')}
                  />
                </div>
              ))}
            </div>
            <p className="mt-5 min-h-[3.2em] max-w-[44ch] text-ink-2" aria-live="polite">
              {megaServices[active].short}
            </p>
          </motion.div>
          <motion.div {...item(megaServices.length)} className="col-span-12 flex items-center justify-between gap-8 border-t border-line pt-6">
            <Link to="/leistungen" className="tlink">
              Alle Leistungen im Überblick <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
            </Link>
            <div className="flex items-center gap-8">
              <Link to="/leistungsmappe" className="ulink text-[0.9375rem] text-ink">
                Leistungsmappe ansehen
              </Link>
              <Button
                size="sm"
                arrow
                to="/angebot"
                onClick={(e: ReactMouseEvent<HTMLAnchorElement>) => {
                  if (e.metaKey || e.ctrlKey) return
                  e.preventDefault()
                  onClose()
                  open()
                }}
              >
                Kostenlose Besichtigung
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

/* ---------------------------------------------------------------------------------------------------------------
 * Menü-Button und Vollbild-Menü (Handy, Tablet)
 * ------------------------------------------------------------------------------------------------------------- */

// Mittelpunkt des Menü-Buttons: Von hier öffnet sich das Menü als Kreis
let origin = { x: 0, y: 0 }

function MenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  // Nach dem Schließen den Fokus zurückgeben
  const was = useRef(open)
  useEffect(() => {
    if (was.current && !open) ref.current?.focus({ preventScroll: true })
    was.current = open
  }, [open])
  return (
    <button
      ref={ref}
      id="menu-button"
      type="button"
      className={cn('-mr-2 flex h-11 items-center gap-3 px-2 text-[0.9375rem] font-medium lg:hidden', open ? 'text-paper' : 'text-ink')}
      aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
      aria-expanded={open}
      aria-controls="mobile-menu"
      onClick={() => {
        const r = ref.current?.getBoundingClientRect()
        if (r) origin = { x: r.left + r.width - 18, y: r.top + r.height / 2 }
        onToggle()
      }}
    >
      {/* Beide Wörter liegen in derselben Rasterzelle: Der Button ist so breit wie das längere Wort, nichts wird abgeschnitten */}
      <span className="inline-grid h-[1.25em] overflow-hidden text-right leading-[1.25]">
        <span className={cn('[grid-area:1/1] transition-transform duration-500 ease-cs', open && '-translate-y-full')}>Menü</span>
        <span aria-hidden className={cn('[grid-area:1/1] translate-y-full transition-transform duration-500 ease-cs', open && 'translate-y-0')}>
          Schließen
        </span>
      </span>
      {/* Drei Linien werden zum Kreuz: die mittlere verschwindet, die äußeren drehen sich */}
      <span aria-hidden className="relative block h-3.5 w-5">
        <span className={cn('absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-cs', open && 'translate-y-[7px] rotate-45')} />
        <span className={cn('absolute inset-x-0 top-[7px] h-px bg-current transition-[opacity,transform] duration-300 ease-cs', open && 'scale-x-0 opacity-0')} />
        <span className={cn('absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-cs', open && '-translate-y-[6px] -rotate-45')} />
      </span>
    </button>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { open } = useQuote()
  const reduced = prefersReducedMotion()
  const [hover, setHover] = useState<string | null>(null)
  const [tapped, setTapped] = useState<string | null>(null)
  const contact = newClientContact()

  // Seite sperren, Escape schließt, Fokus bleibt im Menü (inklusive Schließen-Button in der Kopfzeile)
  useEffect(() => {
    lockScroll(true)
    const first = ref.current?.querySelector<HTMLElement>('a[href]')
    first?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !ref.current) return
      const button = document.getElementById('menu-button')
      const items = [...(button ? [button] : []), ...Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE))]
      const i = items.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        items[items.length - 1]?.focus()
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault()
        items[0]?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [onClose])

  const at = `${origin.x}px ${origin.y}px`
  // Tippen: Der Punkt färbt sich Buchstabe für Buchstabe ein, dann Seitenwechsel
  const go = (e: ReactMouseEvent<HTMLAnchorElement>, to: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || reduced) return
    e.preventDefault()
    setTapped(to)
    window.setTimeout(() => navigate(to), 320)
  }

  return (
    <motion.div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
      data-lenis-prevent
      className="on-dark pointer-events-auto fixed inset-0 z-10 flex flex-col overflow-y-auto bg-night pt-16 text-paper lg:hidden"
      initial={reduced ? { opacity: 0 } : { clipPath: `circle(0px at ${at})` }}
      animate={reduced ? { opacity: 1 } : { clipPath: `circle(150% at ${at})` }}
      exit={reduced ? { opacity: 0 } : { clipPath: `circle(0px at ${at})` }}
      transition={{ duration: reduced ? 0.2 : 0.7, ease: EASE_CS_ARRAY }}
    >
      {/* Passendes Foto dezent im Hintergrund, solange ein Punkt überfahren wird (Zeigergeräte) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Object.entries(navImage).map(([to, id]) => (
          <div key={to} className={cn('absolute inset-0 transition-opacity duration-700 ease-cs', hover === to ? 'opacity-25' : 'opacity-0')}>
            {hover === to && <Picture id={id} ratio="4:5" sizes="100vw" className="size-full" aspect="h-full" />}
          </div>
        ))}
      </div>

      <nav aria-label="Mobile Navigation" className="container-site relative flex flex-1 flex-col pt-6 pb-8">
        <ul className="border-t border-line-dark">
          {navigation.map((item, i) => (
            <li key={item.to} className="overflow-hidden border-b border-line-dark">
              <motion.div initial={reduced ? false : { y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE_CS_ARRAY, delay: 0.18 + 0.05 * i }}>
                <NavLink
                  to={item.to}
                  onClick={(e) => go(e, item.to)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(item.to)}
                  onPointerLeave={() => setHover(null)}
                  className={({ isActive }) =>
                    cn(
                      'menu-item block py-3.5 text-[2.125rem] leading-[1.08] font-medium tracking-[-0.035em] min-[400px]:text-[2.5rem]',
                      isActive ? 'text-blue-on-dark' : 'text-paper',
                      tapped === item.to && 'is-tapped',
                    )
                  }
                >
                  {Array.from(item.label).map((ch, k) => (
                    <span key={k} className="menu-l" style={{ '--i': k } as CSSProperties}>
                      {ch}
                    </span>
                  ))}
                </NavLink>
              </motion.div>
            </li>
          ))}
        </ul>
        <motion.ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
          {mobileSecondary.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className={({ isActive }) => cn('ulink py-1 text-[0.9375rem]', isActive ? 'text-paper' : 'text-link-dark')}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </motion.ul>

        {/* Kontaktkarte: Ansprechpartner mit Foto, erreichbar rund um die Uhr */}
        <motion.div
          className="mt-auto pt-10"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CS_ARRAY, delay: 0.55 }}
        >
          <div className="border-t border-line-dark pt-6">
            <div className="flex items-center gap-4">
              <Picture id={contact.image as ImageId} compact ratio="1:1" className="w-14 shrink-0" sizes="56px" />
              <div className="min-w-0">
                <p className="text-[1.125rem] font-medium tracking-[-0.02em]">{contact.name}</p>
                <AvailableNow dark className="mt-1" />
              </div>
            </div>
            <a href={company.phone.href} className="ulink mt-5 inline-block text-[1.75rem] font-medium tabular-nums tracking-[-0.03em] text-paper">
              {company.phone.display}
            </a>
            <div className="mt-6">
              <Button
                full
                size="lg"
                arrow
                to="/angebot"
                onClick={(e: ReactMouseEvent<HTMLAnchorElement>) => {
                  if (e.metaKey || e.ctrlKey) return
                  e.preventDefault()
                  onClose()
                  open()
                }}
              >
                Kostenlose Besichtigung
              </Button>
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.div>
  )
}
