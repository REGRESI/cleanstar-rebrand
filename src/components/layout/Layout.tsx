import { lazy, Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBar } from './MobileBar'
import { Cursor } from './Cursor'
import { Modal } from '@/components/ui/Modal'
import { QuoteProvider, useQuote } from '@/features/configurator/QuoteContext'
import { useScrollReveals } from '@/lib/useScrollReveals'
import { prefersReducedMotion } from '@/lib/env'
import { scrollToElement, scrollToTop, startSmoothScroll, stopSmoothScroll } from '@/lib/smooth-scroll'
import { ScrollTrigger } from '@/lib/gsap'
import { onIdle } from '@/lib/idle'

const Configurator = lazy(() => import('@/features/configurator/Configurator'))

function QuoteModal() {
  const { isOpen, close } = useQuote()
  return (
    <Modal open={isOpen} onClose={close} title="Angebot anfragen" wide>
      <Suspense fallback={<div className="grid h-96 place-items-center text-muted">Konfigurator wird geladen …</div>}>
        <Configurator variant="modal" onDone={close} />
      </Suspense>
    </Modal>
  )
}

function Shell() {
  const { pathname, hash, key } = useLocation()
  const first = useRef(true)
  const initialNav = useRef(true)

  useEffect(() => {
    first.current = false
    ;(window as Window & { __csReady?: boolean }).__csReady = true
    const cancel = prefersReducedMotion() ? () => {} : onIdle(() => startSmoothScroll(), 2500)
    return () => {
      cancel()
      stopSmoothScroll()
    }
  }, [])

  // Browser soll die Scrollposition nicht selbst wiederherstellen, das übernimmt der Seitenwechsel unten
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  // Seitenwechsel: immer sofort ganz nach oben (auch beim erneuten Klick auf dieselbe Seite).
  // Ausnahme: Links mit Anker (#) springen zum Anker, sobald er gerendert ist.
  useEffect(() => {
    const initial = initialNav.current
    initialNav.current = false
    if (initial) {
      if (!hash) return
    } else if (!hash) {
      scrollToTop(true)
      // Fokus für Screenreader auf den Hauptinhalt setzen
      document.getElementById('main')?.focus({ preventScroll: true })
    }
    let raf = 0
    let tries = 0
    const refresh = () => (raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => ScrollTrigger.refresh()))))
    if (!hash) {
      refresh()
      return () => cancelAnimationFrame(raf)
    }
    const id = decodeURIComponent(hash.slice(1))
    const timer = window.setInterval(() => {
      const el = document.getElementById(id)
      if (!el && ++tries < 30) return
      window.clearInterval(timer)
      if (!el) return
      ScrollTrigger.refresh()
      scrollToElement(el)
    }, 50)
    return () => {
      window.clearInterval(timer)
      cancelAnimationFrame(raf)
    }
  }, [key, pathname, hash])

  useScrollReveals(pathname)

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-full bg-ink px-5 py-3 font-semibold text-white focus:translate-y-0"
      >
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <motion.div
          key={pathname}
          initial={first.current || prefersReducedMotion() ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <MobileBar />
      <QuoteModal />
      <Cursor />
    </>
  )
}

export function Layout() {
  return (
    <QuoteProvider>
      <Shell />
    </QuoteProvider>
  )
}
