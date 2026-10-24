import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js'
import { mappePages } from './pages'
import { Ctx, PAGE_H, PAGE_W, type Side } from './core'
import { GrundrissVollbild } from './extras'
import { playPageTurn } from './sound'
import { BLOCK, type MappeShared, type NavState } from './shared'
import { Logo } from '@/components/ui/Logo'
import { EASE_CS_ARRAY } from '@/lib/ease'

type Slot = { kind: 'cover' | 'inner' | 'back' } | { kind: 'page'; index: number }

const indexOf = (id: string) => mappePages.findIndex((p) => p.id === id)

/**
 * Flache Leistungsmappe (Smartphone, schwache Geräte, reduzierte Bewegung): dieselben Seiten, Blättern per Wischen,
 * an den Ecken oder mit den Pfeilen. Im Hochformat eine Seite, im Querformat die Doppelseite.
 */
export default function FlatBook({
  sound,
  onReady,
  onNav,
  shared,
  coverUrl,
}: {
  sound: boolean
  onReady: () => void
  onNav: (n: NavState) => void
  shared: MappeShared
  coverUrl: string
}) {
  const n = mappePages.length
  // Im Hochformat (Smartphone) ohne Innenseiten des Einbands: Jedes Blättern zeigt sofort Inhalt
  const [portrait] = useState(() => typeof window !== 'undefined' && window.innerWidth < 480)
  const offset = portrait ? 1 : 2
  const slots = useMemo<Slot[]>(
    () => [
      { kind: 'cover' },
      ...(portrait ? [] : [{ kind: 'inner' as const }]),
      ...mappePages.map((_, index) => ({ kind: 'page' as const, index })),
      ...(!portrait && n % 2 === 0 ? [{ kind: 'inner' as const }] : []),
      { kind: 'back' },
    ],
    [n, portrait],
  )
  const host = useRef<HTMLDivElement>(null)
  const [els, setEls] = useState<HTMLDivElement[]>([])
  const [played, setPlayed] = useState<Record<number, boolean>>({})
  const [scale, setScale] = useState(0.5)
  const [bounds, setBounds] = useState<{ left: number; top: number; pageWidth: number; height: number } | null>(null)
  const [hoverService, setHoverService] = useState<number | null>(null)
  const [current, setCurrent] = useState(0)
  const [foldOpen, setFoldOpen] = useState(false)
  const [swing, setSwing] = useState(0)
  const flip = useRef<PageFlip | null>(null)
  const pending = useRef<(() => void)[]>([])
  const backRef = useRef<((f: PageFlip) => void) | null>(null)
  const soundRef = useRef(sound)
  soundRef.current = sound

  // Seiten-Elemente von Hand anlegen (StPageFlip verschiebt sie im DOM), React rendert per Portal hinein
  useEffect(() => {
    const root = host.current!
    const nodes = slots.map((s) => {
      const d = document.createElement('div')
      d.className = 'mappe-flat-page'
      if (s.kind !== 'page') d.dataset.density = 'hard'
      // Sperrzonen: Auf Bedienelementen beginnt nie ein Umblättern
      const stop = (e: Event) => {
        if ((e.target as HTMLElement).closest(BLOCK)) e.stopPropagation()
      }
      d.addEventListener('mousedown', stop)
      d.addEventListener('touchstart', stop, { passive: true })
      root.appendChild(d)
      return d
    })
    setEls(nodes)
    const pf = new PageFlip(root, {
      width: PAGE_W,
      height: PAGE_H,
      size: 'stretch',
      minWidth: 240,
      maxWidth: PAGE_W,
      minHeight: 336,
      maxHeight: PAGE_H,
      showCover: true,
      usePortrait: true,
      maxShadowOpacity: 0.35,
      flippingTime: 650,
      mobileScrollSupport: true,
      showPageCorners: true,
      // Tippen blättert nur an den Ecken; in der Seitenmitte nie
      disableFlipByClick: true,
      swipeDistance: 24,
    })
    pf.loadFromHTML(nodes)
    flip.current = pf
    const measure = () => {
      const b = pf.getBoundsRect()
      setScale(b.pageWidth / PAGE_W)
      setBounds({ left: b.left, top: b.top, pageWidth: b.pageWidth, height: b.height })
    }
    const mark = () => {
      const cur = pf.getCurrentPageIndex()
      setCurrent(cur)
      const seen: Record<number, boolean> = {}
      for (const k of [cur - 1, cur, cur + 1]) {
        const s = slots[k]
        if (s?.kind === 'page') seen[s.index] = true
      }
      setPlayed((p) => ({ ...p, ...seen }))
    }
    pf.on('flip', () => {
      mark()
      setFoldOpen(false)
      setSwing((x) => x + 1)
      if (soundRef.current) playPageTurn()
    })
    // Gepufferte Befehle nach dem Blättern ausführen
    pf.on('changeState', (e) => {
      if (e.data === 'read') window.setTimeout(() => pending.current.shift()?.(), 30)
    })
    // flipPrev klickt intern an den linken Rand; „Blättern per Klick nur an den Ecken“ würde das verwerfen.
    // Für diesen einen Aufruf deshalb kurz freigeben.
    const back = (f: PageFlip) => {
      const st = f.getSettings()
      st.disableFlipByClick = false
      f.flipPrev('bottom')
      st.disableFlipByClick = true
    }
    backRef.current = back
    // Zurückwischen: StPageFlip erkennt im Hochformat nur das Wischen nach links. Nach rechts (überwiegend waagerecht,
    // nicht auf Bedienelementen) blättern wir selbst zurück, falls die Bibliothek nicht reagiert hat.
    let t0: { x: number; y: number; t: number; idx: number; blocked: boolean } | null = null
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      t0 = { x: t.clientX, y: t.clientY, t: e.timeStamp, idx: pf.getCurrentPageIndex(), blocked: !!(e.target as HTMLElement).closest(BLOCK) }
    }
    const onEnd = (e: TouchEvent) => {
      const s0 = t0
      t0 = null
      const t = e.changedTouches[0]
      if (!s0 || s0.blocked || !t) return
      const dx = t.clientX - s0.x
      const dy = t.clientY - s0.y
      if (dx > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && e.timeStamp - s0.t < 700)
        window.setTimeout(() => {
          if (pf.getCurrentPageIndex() === s0.idx && pf.getState() === 'read') back(pf)
        }, 60)
    }
    // Bewegung nach rechts nicht an StPageFlip weitergeben (sonst beginnt sie eine Falte nach vorn und blockiert sich)
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t0 || t0.blocked || !t) return
      const dx = t.clientX - t0.x
      if (dx > 6 && Math.abs(dx) > Math.abs(t.clientY - t0.y)) e.stopPropagation()
    }
    root.addEventListener('touchmove', onMove, { passive: true, capture: true })
    root.addEventListener('touchstart', onStart, { passive: true, capture: true })
    root.addEventListener('touchend', onEnd, { passive: true, capture: true })
    pf.on('changeOrientation', measure)
    pf.on('init', measure)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root.parentElement!)
    onReady()
    return () => {
      root.removeEventListener('touchstart', onStart, { capture: true })
      root.removeEventListener('touchmove', onMove, { capture: true })
      root.removeEventListener('touchend', onEnd, { capture: true })
      ro.disconnect()
      pf.destroy()
      flip.current = null
      setEls([])
    }
  }, [slots, onReady])

  const busy = () => {
    const st = flip.current?.getState()
    return st !== undefined && st !== 'read'
  }
  const queue = useCallback((f: () => void) => {
    if (busy()) pending.current.push(f)
    else f()
  }, [])
  const prev = useCallback(() => queue(() => flip.current && backRef.current?.(flip.current)), [queue])
  const next = useCallback(() => queue(() => flip.current?.flipNext('bottom')), [queue])
  const jump = useCallback((i: number) => queue(() => flip.current?.flip(i + offset, 'bottom')), [queue, offset])

  // Seitenzahl für die Bedienleiste
  useEffect(() => {
    const lastSlot = slots.length - 1
    // Seitenzahl der rechten bzw. einzigen sichtbaren Seite
    const s = slots[portrait ? current : current + 1]
    const label = current === 0 ? 'Einband' : current >= lastSlot ? 'Rückseite' : s?.kind === 'page' ? `${s.index + 1} / ${n}` : `${n} / ${n}`
    onNav({ label, canPrev: current > 0, canNext: current < lastSlot, prev, next })
  }, [current, slots, n, portrait, prev, next, onNav])

  const openRequest = useCallback(() => {
    const card = document.querySelector('.mappe-flat [data-request-card]') as HTMLElement | null
    shared.openRequest(card?.getBoundingClientRect() ?? new DOMRect(window.innerWidth / 2 - 150, window.innerHeight / 2 - 90, 300, 180))
  }, [shared])

  const ctx = useMemo(
    () => ({
      jump,
      previews: {},
      hoverService,
      setHoverService,
      indexOf,
      state: shared.state,
      setState: shared.setState,
      foldOpen,
      setFold: setFoldOpen,
      openRequest,
      is3d: false,
    }),
    [jump, hoverService, shared.state, shared.setState, foldOpen, openRequest],
  )

  return (
    <Ctx.Provider value={ctx}>
      <div className="relative mx-auto size-full max-w-[1200px]">
        <div ref={host} className="mappe-flat size-full touch-pan-y" />
        {/* Lesebändchen: hängt unten aus der Mappe, Tippen blättert zu den Konditionen */}
        {bounds && (
          <button
            type="button"
            onClick={() => jump(indexOf('konditionen'))}
            aria-label="Lesebändchen: zu den Konditionen"
            className="absolute z-[3] w-4 origin-top"
            // Im Hochformat rechnet StPageFlip links eine unsichtbare Seite mit: sichtbar ist die rechte
            style={{ left: bounds.left + bounds.pageWidth * (portrait ? 1.22 : 1.07), top: bounds.top + bounds.height - 6, height: portrait ? 26 : 44 }}
          >
            <motion.span
              key={swing}
              aria-hidden
              className="block h-full w-full bg-[#1b2a4a] shadow-[1px_2px_3px_rgba(0,0,0,0.25)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]"
              initial={{ rotate: swing ? 7 : 0 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 6 }}
              style={{ transformOrigin: 'top center' }}
            />
          </button>
        )}
      </div>
      {els.map((el, k) => {
        const s = slots[k]
        const inner =
          s.kind === 'page' ? (
            (() => {
              const P = mappePages[s.index]
              const side: Side = s.index % 2 === 0 ? 'right' : 'left'
              const opp = !portrait && side === 'left' ? mappePages[s.index + 1]?.opposite : undefined
              return (
                <>
                  <P.Component play={!!played[s.index]} side={side} folio={s.index + 1} />
                  {opp && (
                    <div className="pointer-events-none absolute inset-0">
                      {(() => {
                        const O = opp
                        return <O />
                      })()}
                    </div>
                  )}
                </>
              )
            })()
          ) : (
            <Board kind={s.kind} coverUrl={coverUrl} />
          )
        return createPortal(
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})` }}>
            {inner}
          </div>,
          el,
          String(k),
        )
      })}
      {/* Ausklappseite als Vollbild */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {foldOpen && (
              <motion.div
                className="fixed inset-0 z-[110] overflow-y-auto bg-[#f5f2eb]"
                initial={{ clipPath: 'inset(0 0 0 100%)' }}
                animate={{ clipPath: 'inset(0 0 0 0%)' }}
                exit={{ clipPath: 'inset(0 0 0 100%)' }}
                transition={{ duration: 0.6, ease: EASE_CS_ARRAY }}
                role="dialog"
                aria-modal="true"
                aria-label="Grundriss, ausgeklappt"
              >
                <Ctx.Provider value={ctx}>
                  <GrundrissVollbild onClose={() => setFoldOpen(false)} />
                </Ctx.Provider>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </Ctx.Provider>
  )
}

/** Buchdecke flach: Leinen in Marineblau, außen mit geprägtem Logo (und persönlicher Prägung) */
function Board({ kind, coverUrl }: { kind: 'cover' | 'inner' | 'back'; coverUrl: string }) {
  if (kind === 'cover') return <img src={coverUrl} alt="" className="block size-full object-cover" draggable={false} />
  return (
    <div className="relative size-full" style={{ backgroundImage: `url(/mappe/leinen.webp)`, backgroundSize: '192px', backgroundColor: '#1d2a44' }}>
      {kind === 'back' && (
        <div className="absolute inset-x-0 bottom-16 flex justify-center opacity-40">
          <Logo mono className="h-6 w-auto text-[#c9d0dc]" />
        </div>
      )}
    </div>
  )
}
