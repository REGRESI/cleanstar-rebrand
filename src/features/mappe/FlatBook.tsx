import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js'
import { mappePages } from './pages'
import { Ctx, PAGE_H, PAGE_W, type Side } from './core'
import { playPageTurn } from './sound'
import { Logo } from '@/components/ui/Logo'

type Slot = { kind: 'cover' | 'inner' | 'back' } | { kind: 'page'; index: number }

/**
 * Flache Leistungsmappe (Smartphone, schwache Geräte, reduzierte Bewegung): dieselben Seiten, Blättern per Wischen
 * oder Tippen. Im Hochformat eine Seite, im Querformat die Doppelseite.
 */
export default function FlatBook({ sound, onReady }: { sound: boolean; onReady: () => void }) {
  const n = mappePages.length
  // Einband, Innenseite des Einbands, Seiten, ggf. leere Innenseite, Rückseite des Einbands
  // Im Hochformat (Smartphone) ohne Innenseiten des Einbands: Jedes Tippen zeigt sofort Inhalt
  const [portrait] = useState(() => typeof window !== 'undefined' && window.innerWidth < 480)
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
  const [hoverService, setHoverService] = useState<number | null>(null)
  const flip = useRef<PageFlip | null>(null)
  const soundRef = useRef(sound)
  soundRef.current = sound

  // Seiten-Elemente von Hand anlegen (StPageFlip verschiebt sie im DOM), React rendert per Portal hinein
  useEffect(() => {
    const root = host.current!
    const nodes = slots.map((s) => {
      const d = document.createElement('div')
      d.className = 'mappe-flat-page'
      if (s.kind !== 'page') d.dataset.density = 'hard'
      // Schieberegler bedienen, ohne umzublättern
      const stop = (e: Event) => (e.target as HTMLElement).closest('input, [data-interactive]') && e.stopPropagation()
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
      flippingTime: 700,
      mobileScrollSupport: true,
      showPageCorners: true,
    })
    pf.loadFromHTML(nodes)
    flip.current = pf
    const measure = () => setScale(pf.getBoundsRect().pageWidth / PAGE_W)
    const mark = () => {
      const cur = pf.getCurrentPageIndex()
      const seen: Record<number, boolean> = {}
      for (const k of [cur - 1, cur, cur + 1]) {
        const s = slots[k]
        if (s?.kind === 'page') seen[s.index] = true
      }
      setPlayed((p) => ({ ...p, ...seen }))
    }
    pf.on('flip', () => {
      mark()
      if (soundRef.current) playPageTurn()
    })
    pf.on('changeOrientation', measure)
    pf.on('init', measure)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root.parentElement!)
    onReady()
    return () => {
      ro.disconnect()
      pf.destroy()
      flip.current = null
      setEls([])
    }
  }, [slots, onReady])

  const ctx = useMemo(
    () => ({
      jump: (i: number) => flip.current?.flip(i + (portrait ? 1 : 2)),
      previews: {},
      hoverService,
      setHoverService,
      indexOf: (id: string) => mappePages.findIndex((p) => p.id === id),
    }),
    [hoverService, portrait],
  )

  return (
    <Ctx.Provider value={ctx}>
      <div className="relative mx-auto size-full max-w-[1200px]">
        <div ref={host} className="mappe-flat size-full touch-pan-y" />
      </div>
      {els.map((el, k) => {
        const s = slots[k]
        const inner =
          s.kind === 'page' ? (
            (() => {
              const P = mappePages[s.index]
              const side: Side = s.index % 2 === 0 ? 'right' : 'left'
              const opp = side === 'left' ? mappePages[s.index + 1]?.opposite : undefined
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
            <Board kind={s.kind} />
          )
        return createPortal(
          <div className="absolute top-0 left-0 origin-top-left" style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})` }}>
            {inner}
          </div>,
          el,
          String(k),
        )
      })}
    </Ctx.Provider>
  )
}

/** Buchdecke flach: Leinen in Marineblau, außen mit geprägtem Logo */
function Board({ kind }: { kind: 'cover' | 'inner' | 'back' }) {
  if (kind === 'cover') return <img src="/mappe/cover.webp" alt="" className="block size-full object-cover" draggable={false} />
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
