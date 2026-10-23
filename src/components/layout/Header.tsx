import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { navigation } from '@/content/site'
import { company } from '@/content/company'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { cn } from '@/lib/cn'
import { lockScroll } from '@/lib/smooth-scroll'
import { EASE_CS_ARRAY } from '@/lib/ease'

const mobileNav = [{ label: 'Startseite', to: '/' }, ...navigation]
const mobileSecondary = [
  { label: 'Ratgeber', to: '/ratgeber' },
  { label: 'Karriere', to: '/karriere' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Partner werden', to: '/partner' },
]

/**
 * Kopfzeile über die volle Breite: Off-White, Haarlinie unten, Logo links, Navigation als Text, rechts ein Button.
 * Beim Scrollen nach unten blendet sie aus, beim Scrollen nach oben wieder ein. Aktive Seite: Unterstrich.
 */
export function Header() {
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  const { pathname, key } = useLocation()
  const last = useRef(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
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

  // Nach jedem Seitenwechsel sichtbar und Menü zu
  useEffect(() => {
    setMenu(false)
    setHidden(false)
  }, [pathname, key])

  useEffect(() => {
    lockScroll(menu)
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menu])

  return (
    // Nur die Leiste wird verschoben: Ein transformierter <header> wäre Bezugsrahmen für das feste Vollbild-Menü
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'pointer-events-auto relative z-10 border-b border-line bg-paper transition-transform duration-500 ease-cs focus-within:translate-y-0',
          hidden && !menu && '-translate-y-full',
        )}
      >
        <div className="container-site flex h-16 items-center justify-between gap-6 lg:h-[4.75rem]">
          <HomeLink label={`${company.name}, zur Startseite`} className="shrink-0" onNavigate={() => setMenu(false)}>
            <Logo className="w-[124px] lg:w-[142px]" />
          </HomeLink>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-7 xl:gap-9">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className="ulink py-1 text-[0.9375rem] whitespace-nowrap text-ink">
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <a href={company.phone.href} className="ulink hidden py-1 font-mono text-[0.8125rem] whitespace-nowrap text-ink 2xl:inline-block">
              {company.phone.display}
            </a>
            <Link to="/partner" className="ulink hidden py-1 text-[0.875rem] whitespace-nowrap text-muted hover:text-ink xl:inline-block">
              Partner werden
            </Link>
            <QuoteButton size="sm" wrapClassName="hidden sm:inline-flex">
              Kostenloses Angebot
            </QuoteButton>
            <button
              type="button"
              className="-mr-2 flex h-11 items-center gap-3 px-2 text-[0.9375rem] font-medium text-ink lg:hidden"
              aria-label={menu ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              onClick={() => setMenu((m) => !m)}
            >
              <span>{menu ? 'Schließen' : 'Menü'}</span>
              <span aria-hidden className="relative block h-3 w-5">
                <span className={cn('absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300', menu && 'translate-y-1.5 rotate-45')} />
                <span className={cn('absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300', menu && '-translate-y-1.5 -rotate-45')} />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            data-lenis-prevent
            className="pointer-events-auto fixed inset-0 flex flex-col overflow-y-auto bg-paper pt-16 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_CS_ARRAY }}
          >
            <nav aria-label="Mobile Navigation" className="container-site flex flex-1 flex-col pt-6 pb-8">
              <ul className="border-t border-line">
                {mobileNav.map((item, i) => (
                  <li key={item.to} className="overflow-hidden border-b border-line">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: EASE_CS_ARRAY, delay: 0.04 * i + 0.05 }}>
                      <NavLink to={item.to} end={item.to === '/'} className="group flex items-baseline gap-4 py-3.5">
                        {({ isActive }) => (
                          <>
                            <span className="t-label w-7 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                            <span className={cn('text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] min-[400px]:text-[2.375rem]', isActive ? 'text-blue' : 'text-ink')}>
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {mobileSecondary.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="ulink py-1 text-[0.9375rem] text-muted">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                <p className="t-label">{company.availability}</p>
                <a href={company.phone.href} className="mt-1 block text-[1.75rem] font-medium tracking-[-0.03em] text-ink">
                  {company.phone.display}
                </a>
                <div className="mt-6">
                  <QuoteButton full size="lg" arrow>
                    Kostenloses Angebot
                  </QuoteButton>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
