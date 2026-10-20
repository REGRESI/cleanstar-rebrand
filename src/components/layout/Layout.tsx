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
import { scrollToTop, startSmoothScroll, stopSmoothScroll } from '@/lib/smooth-scroll'
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
  const { pathname } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    first.current = false
    ;(window as Window & { __csReady?: boolean }).__csReady = true
    const cancel = prefersReducedMotion() ? () => {} : onIdle(() => startSmoothScroll(), 2500)
    return () => {
      cancel()
      stopSmoothScroll()
    }
  }, [])

  useEffect(() => {
    if (first.current) return
    scrollToTop()
    // Fokus für Screenreader auf den Hauptinhalt setzen
    document.getElementById('main')?.focus({ preventScroll: true })
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [pathname])

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
