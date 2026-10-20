import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Phone, X, ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { navigation } from '@/content/site'
import { services } from '@/content/services'
import { company } from '@/content/company'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { cn } from '@/lib/cn'
import { lockScroll } from '@/lib/smooth-scroll'

export function Header() {
  const [compact, setCompact] = useState(false)
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenu(false), [pathname])

  useEffect(() => {
    lockScroll(menu)
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menu])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={cn('transition-[padding] duration-500 ease-out', compact ? 'pt-2 sm:pt-3' : 'pt-3 sm:pt-5')}>
        <div className="container-site">
          <div
            className={cn(
              'flex items-center justify-between gap-4 rounded-full pr-2 pl-5 transition-all duration-500 ease-out sm:pl-6',
              compact ? 'glass h-14 shadow-soft ring-1 ring-line sm:h-16' : 'h-16 bg-white/60 ring-1 ring-white/40 backdrop-blur-md sm:h-[4.5rem]',
            )}
          >
            <Link to="/" aria-label={`${company.name}, zur Startseite`} className="shrink-0">
              <Logo className={cn('transition-all duration-500', compact ? 'w-[118px] sm:w-[132px]' : 'w-[128px] sm:w-[150px]')} />
            </Link>

            <nav aria-label="Hauptnavigation" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'relative rounded-full px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors xl:px-3.5 xl:text-[0.9375rem]',
                          isActive ? 'text-ink' : 'text-ink/70 hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="nav-pill"
                              className="absolute inset-0 -z-10 rounded-full bg-glacier"
                              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                            />
                          )}
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Link to="/partner" className="hidden rounded-full px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap text-muted transition hover:text-ink xl:inline-flex">
                Partner werden
              </Link>
              <a
                href={company.phone.href}
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-ink transition hover:bg-ink/5 2xl:inline-flex"
                data-cursor="link"
              >
                <Phone aria-hidden className="size-4 text-blue" />
                {company.phone.display}
              </a>
              <QuoteButton size="sm" wrapClassName="hidden sm:inline-flex" className="sm:h-11 sm:px-5">
                Kostenloses Angebot
              </QuoteButton>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full bg-ink text-white lg:hidden"
                aria-expanded={menu}
                aria-controls="mobile-menu"
                aria-label={menu ? 'Menü schließen' : 'Menü öffnen'}
                onClick={() => setMenu((m) => !m)}
              >
                {menu ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            data-lenis-prevent
            className="fixed inset-0 -z-10 overflow-y-auto bg-white px-5 pt-24 pb-32 lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav aria-label="Mobile Navigation">
              <ul className="divide-y divide-line border-b border-line">
                {[{ label: 'Startseite', to: '/' }, ...navigation, { label: 'Karriere', to: '/karriere' }, { label: 'FAQ', to: '/faq' }].map((item, i) => (
                  <motion.li key={item.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i + 0.05 }}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => cn('flex items-center justify-between py-4 text-2xl font-semibold tracking-tight', isActive ? 'text-blue' : 'text-ink')}
                    >
                      {item.label}
                      <ArrowUpRight aria-hidden className="size-5 opacity-40" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <p className="mt-8 mb-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Leistungen</p>
              <ul className="grid grid-cols-2 gap-2">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/leistungen/${s.slug}`} className="block rounded-xl bg-glacier px-3 py-3 text-sm font-medium text-ink">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <a href={company.phone.href} className="mt-8 flex items-center gap-3 text-lg font-semibold text-ink">
                <span className="grid size-11 place-items-center rounded-full bg-blue text-white">
                  <Phone aria-hidden className="size-5" />
                </span>
                {company.phone.display}
              </a>
              <Link to="/partner" className="mt-10 inline-block text-sm text-muted underline underline-offset-4">
                Partner werden: Partnerprogramm für Reinigungsfirmen
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
