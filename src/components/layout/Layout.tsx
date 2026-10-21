import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileBar } from './MobileBar'
import { Cursor } from './Cursor'
import { Modal } from '@/components/ui/Modal'
import { QuoteProvider, useQuote } from '@/features/configurator/QuoteContext'
import { CallbackProvider } from '@/features/callback/Callback'
import { useScrollReveals } from '@/lib/useScrollReveals'
import { prefersReducedMotion } from '@/lib/env'
import { jumpTo, scrollToElement, startSmoothScroll, stopSmoothScroll } from '@/lib/smooth-scroll'
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
  const navType = useNavigationType()
  const first = useRef(true)
  const initialNav = useRef(true)

  useEffect(() => {
    first.current = false
    ;(window as Window & { __csReady?: boolean }).__csReady = true
    const cancel = prefersReducedMotion() ? () => {} : onIdle(() => startSmoothScroll(), 2500)
    // iOS zeigt :active-Stile (Rückmeldung beim Tippen) nur, wenn ein touchstart-Listener existiert
    const noop = () => {}
    document.addEventListener('touchstart', noop, { passive: true })
    return () => {
      document.removeEventListener('touchstart', noop)
      cancel()
      stopSmoothScroll()
    }
  }, [])

  // Browser soll die Scrollposition nicht selbst wiederherstellen, das übernimmt der Seitenwechsel unten
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  // Letzte Scrollposition je Verlaufseintrag (für Zurück/Vor im Browser)
  const positions = useRef(new Map<string, number>())
  const currentKey = useRef(key)
  useEffect(() => {
    const save = () => positions.current.set(currentKey.current, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  // Seitenwechsel: immer ganz nach oben (auch beim erneuten Klick auf dieselbe Seite).
  // Ausnahmen: Links mit Anker (#) springen zum Anker; Zurück/Vor stellt die gemerkte Position dieser Seite wieder her.
  // Läuft als Layout-Effekt, also nachdem die neue Seite gerendert ist, aber bevor sie zu sehen ist.
  useLayoutEffect(() => {
    currentKey.current = key
    const initial = initialNav.current
    initialNav.current = false
    if (initial && !hash) return

    // Reste der alten Seite: ScrollTrigger, deren Element nicht mehr im Dokument ist, samt Pin-Spacer entfernen,
    // und die gemerkten Scrollpositionen von ScrollTrigger löschen (sonst stellt refresh() die alte Position wieder her).
    ScrollTrigger.getAll().forEach((t) => {
      const el = t.trigger as Element | undefined
      if (el && !el.isConnected) t.kill(true)
    })
    ScrollTrigger.clearScrollMemory('manual')

    let raf = 0
    let timer = 0
    const timers: number[] = []
    const cleanup = () => {
      cancelAnimationFrame(raf)
      window.clearInterval(timer)
      timers.forEach((t) => window.clearTimeout(t))
      stopGuard()
    }

    // Schutz: Verschiebt sich die Seite kurz nach dem Wechsel ohne Zutun des Besuchers (späte Layout-Änderungen,
    // ScrollTrigger-Refresh, Schwung einer Wisch-Bewegung), wird die Zielposition wiederhergestellt.
    let target = 0
    let userMoved = false
    const onInput = () => (userMoved = true)
    const onScroll = () => {
      if (!userMoved && Math.abs(window.scrollY - target) > 2) jumpTo(target)
    }
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    function stopGuard() {
      inputs.forEach((e) => window.removeEventListener(e, onInput))
      window.removeEventListener('scroll', onScroll)
    }
    const guard = (ms: number) => {
      inputs.forEach((e) => window.addEventListener(e, onInput, { passive: true }))
      window.addEventListener('scroll', onScroll, { passive: true })
      timers.push(window.setTimeout(stopGuard, ms))
    }

    if (hash) {
      let tries = 0
      const id = decodeURIComponent(hash.slice(1))
      timer = window.setInterval(() => {
        const el = document.getElementById(id)
        if (!el && ++tries < 30) return
        window.clearInterval(timer)
        if (!el) return
        ScrollTrigger.refresh()
        scrollToElement(el)
      }, 50)
      return cleanup
    }

    const saved = navType === 'POP' ? positions.current.get(key) : undefined
    target = saved ?? 0
    jumpTo(target)
    if (!saved) {
      // Fokus für Screenreader auf den Hauptinhalt setzen
      document.getElementById('main')?.focus({ preventScroll: true })
    }
    // Nach dem Refresh (neue Seitenhöhe, neue Trigger) noch einmal setzen
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        jumpTo(target)
      })
    })
    if (saved) {
      // Die Seite baut sich noch auf: Position nachführen, bis sie erreichbar ist
      ;[150, 400, 800].forEach((ms) => timers.push(window.setTimeout(() => !userMoved && jumpTo(target), ms)))
    }
    guard(1600)
    return cleanup
  }, [key, pathname, hash, navType])

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
      <CallbackProvider>
        <Shell />
      </CallbackProvider>
    </QuoteProvider>
  )
}
