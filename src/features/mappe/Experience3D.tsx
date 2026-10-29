import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import * as THREE from 'three'
import { busFor, Scene3D, useBookControls, cornersToTransform, type SceneBus } from './Book3D'
import { SnapshotHost, type SnapshotApi } from './snapshots'
import { mappePages } from './pages'
import { Ctx, PAGE_H, PAGE_W, type Side } from './core'
import { GrundrissGross, WIDE_W } from './extras'
import { quadMatrix, quadToUnit } from './geometry'
import { personalCover } from './cover'
import { playPageTurn } from './sound'
import { BLOCK, SWIPE_MIN, type MappeShared, type NavState } from './shared'
import { cn } from '@/lib/cn'

/** Textur aus dem abfotografierten Canvas (scharf: Mipmaps und anisotrope Filterung) */
function toTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  return t
}

/** Erst fotografieren, wenn nichts blättert und die Bühne sichtbar ist; dann in einer Leerlaufphase des Browsers */
async function whenIdle(bus: SceneBus) {
  while (!bus.visible || bus.anims.size > 0 || bus.drag || Math.abs(bus.openTarget - bus.open) > 0.002 || Math.abs(bus.foldTarget - bus.fold) > 0.002)
    await new Promise((r) => setTimeout(r, 120))
  await new Promise((r) => ('requestIdleCallback' in window ? window.requestIdleCallback(r, { timeout: 600 }) : setTimeout(r, 0)))
}

function preview(canvas: HTMLCanvasElement) {
  const c = document.createElement('canvas')
  c.width = 264
  c.height = Math.round((264 * PAGE_H) / PAGE_W)
  c.getContext('2d')!.drawImage(canvas, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.82)
}

/** Großen Grundriss in die beiden Flügel teilen */
function halves(c: HTMLCanvasElement): [HTMLCanvasElement, HTMLCanvasElement] {
  return [0, 1].map((k) => {
    const h = document.createElement('canvas')
    h.width = c.width / 2
    h.height = c.height
    h.getContext('2d')!.drawImage(c, (k * c.width) / 2, 0, c.width / 2, c.height, 0, 0, c.width / 2, c.height)
    return h
  }) as [HTMLCanvasElement, HTMLCanvasElement]
}

const indexOf = (id: string) => mappePages.findIndex((p) => p.id === id)

/** Maus oder Trackpad (kein Finger) */
const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

/** Pfeil-Zeiger für vor und zurück (schwarz mit weißem Rand, auf hellem und dunklem Papier lesbar) */
const arrowCursor = (d: string, fallback: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='white' fill-opacity='0.92'/><path d='${d}' fill='none' stroke='%230b1220' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  ).replace(/%2523/g, '%23')}") 16 16, ${fallback}`
const CURSOR_NEXT = arrowCursor('M10 16h12m-5-5 5 5-5 5', 'e-resize')
const CURSOR_PREV = arrowCursor('M22 16H10m5-5-5 5 5 5', 'w-resize')

/** Umriss des aufgeschlagenen Buchs als Aussparung (evenodd) für die Abdunkel-Ebene */
function bookHull(l: [number, number][] | null, r: [number, number][] | null, w: [number, number][] | null) {
  // Nur eine Seite sichtbar (Anfang oder Ende): Die Innenseite des Einbands gehört trotzdem zum Buch
  const shift = (p: [number, number], dx: number): [number, number] => [p[0] + dx, p[1]]
  const pts =
    r && l
      ? [l[0], (w ?? r)[1], (w ?? r)[2], l[3]]
      : r
        ? [shift(r[0], r[0][0] - r[1][0]), (w ?? r)[1], (w ?? r)[2], shift(r[3], r[3][0] - r[2][0])]
        : l
          ? [l[0], shift(l[1], l[1][0] - l[0][0]), shift(l[2], l[2][0] - l[3][0]), l[3]]
          : null
  if (!pts) return null
  const m = 10
  const [a, b, c, d] = pts
  const poly = [
    [a[0] - m, a[1] - m],
    [b[0] + m, b[1] - m],
    [c[0] + m, c[1] + m],
    [d[0] - m, d[1] + m],
  ]
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')}, ${(poly[0][0]).toFixed(1)}px ${(poly[0][1]).toFixed(1)}px)`
}
const spreadOf = (i: number) => Math.floor((i + 1) / 2)

/**
 * Die Leistungsmappe in 3D: Schreibtisch, Buch, Blättern. Liegt eine Doppelseite still, liegen darüber die echten
 * HTML-Seiten (klickbar, scharf), perspektivisch exakt auf der Seitenfläche. Beim Blättern sind es wieder Texturen.
 */
export default function Experience3D({ sound, onReady, onNav, shared }: { sound: boolean; onReady: () => void; onNav: (n: NavState) => void; shared: MappeShared }) {
  const n = mappePages.length
  const bus = useMemo(() => {
    const b = busFor(n)
    mappePages.forEach((p, i) => p.light && b.light.add(Math.floor(i / 2) + 1))
    b.foldSpread = spreadOf(indexOf('grundriss'))
    return b
  }, [n])
  const snap = useRef<SnapshotApi>(null)
  const [played, setPlayed] = useState<Record<number, boolean>>({})
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [loaded, setLoaded] = useState(0)
  const [hoverService, setHoverService] = useState<number | null>(null)
  const [still, setStill] = useState(false)
  const [inView, setInView] = useState(true)
  const [foldOpen, setFoldOpen] = useState(false)
  const [wideOn, setWideOn] = useState(false)
  const [hoverZone, setHoverZone] = useState<Side | null>(null)
  const foldOpenRef = useRef(false)
  foldOpenRef.current = foldOpen
  const dim = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const soundRef = useRef(sound)
  soundRef.current = sound
  const onTurn = useCallback(() => {
    if (soundRef.current) playPageTurn()
  }, [])
  const { spread, goTo, step, drag, maxSpread, spreadRef } = useBookControls(bus, n, onTurn)
  const leftEl = useRef<HTMLDivElement>(null)
  const rightEl = useRef<HTMLDivElement>(null)
  const wideEl = useRef<HTMLDivElement>(null)
  const prevBtn = useRef<HTMLButtonElement>(null)
  const nextBtn = useRef<HTMLButtonElement>(null)
  const geom = useRef<{ left: [number, number][] | null; right: [number, number][] | null }>({ left: null, right: null })
  const pr = Math.min(2, Math.max(1.25, (typeof window !== 'undefined' ? window.devicePixelRatio : 1) * 1.05))

  // Seitenzahl und Pfeile für die Bedienleiste
  useEffect(() => {
    const folio = Math.min(2 * spread + 1, n)
    onNav({
      label: spread < 0 ? 'Einband' : `${folio} / ${n}`,
      canPrev: spread >= 0,
      canNext: spread < maxSpread,
      prev: () => step(-1),
      next: () => step(1),
    })
  }, [spread, n, maxSpread, step, onNav])

  // Ausklappseite schließt, sobald die Doppelseite wechselt
  useEffect(() => {
    if (spread !== bus.foldSpread) setFoldOpen(false)
  }, [spread, bus])
  const setFold = useCallback(
    (open: boolean) => {
      if (open && spreadRef.current !== bus.foldSpread) return
      bus.foldTarget = open ? 1 : 0
      setFoldOpen(open)
    },
    [bus, spreadRef],
  )

  // Lesebändchen: direkt zu den Konditionen
  useEffect(() => {
    bus.onRibbon = () => goTo(spreadOf(indexOf('konditionen')))
    return () => {
      bus.onRibbon = undefined
    }
  }, [bus, goTo])

  // Einband (persönlich geprägt, falls ein Firmenname mitkommt)
  useEffect(() => {
    let alive = true
    personalCover(shared.recipient.company)
      .then((c) => {
        if (!alive) return
        const t = new THREE.CanvasTexture(c)
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 8
        bus.coverTex?.dispose()
        bus.coverTex = t
        setLoaded((x) => x + 1)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [bus, shared.recipient.company])

  // Seitentexturen: zuerst die ersten Seiten, den Rest ruhig im Hintergrund
  useEffect(() => {
    let alive = true
    ;(async () => {
      await document.fonts?.ready
      for (let i = 0; i < n; i++) {
        await whenIdle(bus)
        if (!alive || !snap.current) return
        const c = await snap.current.capture(i, pr)
        bus.textures[i]?.dispose()
        bus.textures[i] = toTexture(c)
        setPreviews((p) => ({ ...p, [i]: preview(c) }))
        setLoaded((x) => x + 1)
        // nach dem Grundriss gleich die Klappflügel
        if (mappePages[i].id === 'grundriss') {
          const [a, b] = halves(await snap.current.captureWide(pr))
          bus.foldTex = [toTexture(a), toTexture(b)]
        }
      }
    })().catch(() => {})
    return () => {
      alive = false
    }
  }, [bus, n, pr])

  const ready = loaded >= 4
  useEffect(() => {
    if (ready) onReady()
  }, [ready, onReady])

  // Gesehene Seiten bleiben im Endzustand; ihre Textur wird im Endzustand neu fotografiert (unsichtbarer Wechsel)
  const left = spread > 0 ? 2 * spread - 1 : -1
  const right = spread >= 0 && 2 * spread < n ? 2 * spread : -1
  useEffect(() => {
    if (!still || spread < 0) return
    const fresh = [left, right].filter((i) => i >= 0 && !played[i])
    if (!fresh.length) return
    setPlayed((p) => ({ ...p, ...Object.fromEntries(fresh.map((i) => [i, true])) }))
  }, [still, spread, left, right, played])
  const recapture = useCallback(
    async (ids: number[], withWide = false) => {
      for (const i of ids) {
        await whenIdle(bus)
        if (!snap.current) return
        const t = toTexture(await snap.current.capture(i, pr))
        t.userData.final = true
        bus.textures[i]?.dispose()
        bus.textures[i] = t
      }
      if (withWide && snap.current) {
        await whenIdle(bus)
        const [a, b] = halves(await snap.current.captureWide(pr))
        bus.foldTex.forEach((t) => t?.dispose())
        bus.foldTex = [toTexture(a), toTexture(b)]
      }
    },
    [bus, pr],
  )
  useEffect(() => {
    const ids = Object.keys(played)
      .map(Number)
      .filter((i) => !bus.textures[i]?.userData.final)
    if (!ids.length) return
    const t = window.setTimeout(() => void recapture(ids).catch(() => {}), 50)
    return () => window.clearTimeout(t)
  }, [played, bus, recapture])
  // Nach Bedienung (Uhr, Regler, Intervall, Grundriss): sichtbare Seiten neu fotografieren, damit die Textur beim Blättern stimmt
  const visibleRef = useRef({ left, right, spread })
  visibleRef.current = { left, right, spread }
  useEffect(() => {
    if (!shared.version) return
    const t = window.setTimeout(() => {
      const v = visibleRef.current
      void recapture(
        [v.left, v.right].filter((i) => i >= 0),
        v.spread === bus.foldSpread,
      ).catch(() => {})
    }, 500)
    return () => window.clearTimeout(t)
  }, [shared.version, recapture, bus])

  // Ecken der Seiten → Transform der HTML-Seiten und Lage der Pfeile (direkt am DOM, ohne Rendern)
  useEffect(() => {
    let wasStill = false
    let wasWide = false
    bus.onCorners = (l, r, s, w) => {
      geom.current = { left: l, right: r }
      if (leftEl.current && l) leftEl.current.style.transform = cornersToTransform(l)
      if (rightEl.current && r) rightEl.current.style.transform = cornersToTransform(r)
      if (wideEl.current && w) wideEl.current.style.transform = quadMatrix(WIDE_W, PAGE_H, w)
      // Pfeile links und rechts neben dem Buch
      const xs = [...(l ?? []), ...(r ?? []), ...(w ?? [])].map((p) => p[0])
      const ys = [...(l ?? []), ...(r ?? [])].map((p) => p[1])
      const cx = window.innerWidth / 2
      const cy = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : window.innerHeight / 2
      let minX = xs.length ? Math.min(...xs) : cx - 250
      const maxX = xs.length ? Math.max(...xs) : cx + 250
      if (!l && r) minX = r[0][0] - (r[1][0] - r[0][0])
      if (prevBtn.current) prevBtn.current.style.transform = `translate(${Math.max(12, minX - 64)}px, ${cy - 22}px)`
      if (nextBtn.current) nextBtn.current.style.transform = `translate(${Math.min(window.innerWidth - 56, maxX + 20)}px, ${cy - 22}px)`
      // Lesemodus: Tisch und Deko treten zurück (abgedunkelt, unscharf), ausgespart bleibt nur das Buch
      if (dim.current) {
        const e = bus.open * bus.open * (3 - 2 * bus.open)
        const hull = bookHull(l, r, w)
        dim.current.style.opacity = hull ? String(e) : '0'
        if (hull) dim.current.style.clipPath = hull
      }
      if (s !== wasStill) {
        wasStill = s
        setStill(s)
      }
      if (!!w !== wasWide) {
        wasWide = !!w
        setWideOn(!!w)
      }
    }
    return () => {
      bus.onCorners = undefined
    }
  }, [bus])

  // Außerhalb des Bildes (Textfassung, Fußzeile) ruhen Rendern und Abfotografieren
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      bus.visible = e.isIntersecting
      setInView(e.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [bus])

  // Mausrad und Trackpad (waagerecht wie senkrecht) blättern im aufgeschlagenen Buch. Eine Schwelle sammelt die
  // Bewegung, danach ruht das Rad kurz, damit eine Geste nie mehrere Seiten auf einmal springt.
  // Am Anfang bzw. Ende des Buchs scrollt das Rad wie gewohnt die Seite weiter.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let sum = 0
    let lockUntil = 0
    let lastT = 0
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || spreadRef.current < 0 || foldOpenRef.current) return
      if ((e.target as HTMLElement)?.closest?.('[data-scrollable], textarea, select')) return
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      const dir = d > 0 ? 1 : -1
      if (dir > 0 ? spreadRef.current >= maxSpread : spreadRef.current <= 0) return
      e.preventDefault()
      const now = performance.now()
      if (now < lockUntil) return
      // nach einer Pause oder bei Richtungswechsel neu sammeln
      if (now - lastT > 450 || (sum !== 0 && Math.sign(sum) !== dir)) sum = 0
      lastT = now
      sum += e.deltaMode === 1 ? d * 16 : d
      if (Math.abs(sum) >= 70) {
        sum = 0
        lockUntil = now + 650
        step(dir)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [step, spreadRef, maxSpread])

  // Pfeiltasten (nicht, solange ein Eingabefeld oder die Uhr den Fokus hat)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea, select, [role="slider"], [contenteditable], [role="dialog"]')) return
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  /**
   * Geste auf einer Seite: Tippen ist kein Wischen. Erst ab 12 px überwiegend waagerechter Bewegung folgt die Seite
   * dem Finger bzw. der Maus. Beim Loslassen entscheiden Weg oder Tempo. Ein Tippen blättert nur am Außenrand.
   */
  const onPagePointerDown = (side: Side, e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || foldOpen) return
    const target = e.target as HTMLElement
    if (target.closest(BLOCK)) return
    const g = geom.current[side]
    if (!g) return
    const pageW = Math.abs(g[1][0] - g[0][0]) || 400
    const x0 = e.clientX
    const y0 = e.clientY
    // Am Desktop (Maus, Trackpad) blättert ein Klick auf die ganze Buchhälfte, mit dem Finger nur der Außenrand
    const inZone = finePointer() || zoneAt(side, e.clientX, e.clientY)
    let active = false
    let cancelled = false
    const samples: [number, number][] = [[x0, e.timeStamp]]
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0
      const dy = ev.clientY - y0
      if (!active && !cancelled) {
        if (Math.abs(dy) > SWIPE_MIN && Math.abs(dy) > Math.abs(dx)) cancelled = true
        else if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.2) {
          const ok = side === 'right' ? dx < 0 && spreadRef.current < maxSpread : dx > 0 && spreadRef.current > 0
          if (!ok || bus.anims.size > 0) cancelled = true
          else active = true
        }
      }
      if (!active) return
      samples.push([ev.clientX, ev.timeStamp])
      if (samples.length > 6) samples.shift()
      const p = side === 'right' ? Math.max(0, Math.min(1, -dx / (2 * pageW))) : 1 - Math.max(0, Math.min(1, dx / (2 * pageW)))
      drag(side, p)
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (active) {
        const [a, b] = [samples[0], samples[samples.length - 1]]
        const vx = b[1] > a[1] ? (b[0] - a[0]) / (b[1] - a[1]) : 0
        drag(side, null, vx)
      } else if (!cancelled && inZone && Math.hypot(ev.clientX - x0, ev.clientY - y0) < SWIPE_MIN) {
        step(side === 'right' ? 1 : -1)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  /** Randzone außen (12 % der Seitenbreite): aus der Zeigerposition auf der Seite berechnet, Bedienelemente haben Vorrang */
  const zoneAt = (side: Side, x: number, y: number) => {
    const g = geom.current[side]
    if (!g) return false
    const [u, v] = quadToUnit(g, x, y)
    if (v < 0 || v > 1) return false
    return side === 'right' ? u > 0.88 && u <= 1 : u < 0.12 && u >= 0
  }
  const onPageHover = (side: Side, e: RPointerEvent<HTMLDivElement>) => {
    const canTurn = side === 'right' ? spreadRef.current < maxSpread : spreadRef.current > 0
    const free = canTurn && !foldOpen && !(e.target as HTMLElement).closest(BLOCK)
    const edge = free && zoneAt(side, e.clientX, e.clientY)
    const on = free && (finePointer() || edge)
    e.currentTarget.style.cursor = on ? (side === 'right' ? CURSOR_NEXT : CURSOR_PREV) : ''
    // Die Ecke hebt sich nur am Außenrand an
    const z = edge ? side : hoverZone === side ? null : hoverZone
    if (z !== hoverZone) setHoverZone(z)
  }

  const openRequest = useCallback(() => {
    const card = rightEl.current?.querySelector('[data-request-card]') as HTMLElement | null
    shared.openRequest(card?.getBoundingClientRect() ?? new DOMRect(window.innerWidth / 2 - 150, window.innerHeight / 2 - 90, 300, 180))
  }, [shared])

  const ctx = useMemo(
    () => ({
      jump: (i: number) => goTo(spreadOf(i)),
      previews,
      hoverService,
      setHoverService,
      indexOf,
      state: shared.state,
      setState: shared.setState,
      foldOpen,
      setFold,
      openRequest,
      is3d: true,
    }),
    [goTo, previews, hoverService, shared.state, shared.setState, foldOpen, setFold, openRequest],
  )

  const overlayOn = still && spread >= 0
  const slot = (i: number, side: Side, ref: React.RefObject<HTMLDivElement | null>) => {
    const Page = i >= 0 ? mappePages[i] : null
    const showHtml = overlayOn && Page && !Page.textureOnly
    const opp = side === 'left' && right >= 0 ? mappePages[right].opposite : side === 'right' && left >= 0 ? mappePages[left].opposite : undefined
    const canTurn = side === 'right' ? spread < maxSpread : spread > 0
    return (
      <div
        ref={ref}
        data-page-slot={side}
        className={cn('absolute top-0 left-0 origin-top-left select-none', overlayOn && Page ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
        style={{ width: PAGE_W, height: PAGE_H, transition: 'opacity 200ms' }}
        onPointerDown={(e) => onPagePointerDown(side, e)}
        onPointerMove={(e) => onPageHover(side, e)}
        onPointerLeave={() => hoverZone === side && setHoverZone(null)}
      >
        {showHtml && (
          <>
            <Page.Component play={!!played[i]} side={side} folio={i + 1} />
            {opp && (
              <div className="pointer-events-none absolute inset-0">
                {(() => {
                  const O = opp
                  return <O />
                })()}
              </div>
            )}
          </>
        )}
        {overlayOn && Page && canTurn && !foldOpen && (
          // Am Außenrand hebt sich die Ecke leicht an
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute bottom-0 transition-[width,height] duration-300 ease-cs',
              side === 'right' ? 'right-0' : 'left-0',
              hoverZone === side ? 'size-12' : 'size-0',
            )}
            style={{
              background: `url(/mappe/shade/ecke-${side === 'right' ? 'r' : 'l'}.png) 0 0 / 100% 100% no-repeat`,
              boxShadow: side === 'right' ? '-3px -3px 8px -4px rgba(30,25,15,0.35)' : '3px -3px 8px -4px rgba(30,25,15,0.35)',
            }}
          />
        )}
      </div>
    )
  }

  const arrow =
    'pointer-events-auto absolute top-0 left-0 grid size-11 place-items-center rounded-full bg-paper/85 text-ink shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] backdrop-blur transition-opacity duration-300 hover:bg-paper disabled:pointer-events-none disabled:opacity-0'
  return (
    <Ctx.Provider value={ctx}>
      {/* Aufgeschlagen gehört das Mausrad dem Buch (Lenis lässt es dann in Ruhe) */}
      <div ref={stage} className="absolute inset-0" data-lenis-prevent-wheel={spread >= 0 || undefined}>
        <Scene3D bus={bus} active={inView} onOpen={() => goTo(spreadRef.current < 0 ? 0 : spreadRef.current)} />
        <div ref={dim} aria-hidden className="mappe-dim pointer-events-none absolute inset-0" style={{ opacity: 0 }} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {slot(left, 'left', leftEl)}
          {slot(right, 'right', rightEl)}
          <div
            ref={wideEl}
            data-page-slot="wide"
            className={cn(
              'absolute top-0 left-0 origin-top-left transition-opacity duration-200',
              wideOn && overlayOn ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={{ width: WIDE_W, height: PAGE_H }}
          >
            {wideOn && overlayOn && <GrundrissGross />}
          </div>
        </div>
        <button ref={prevBtn} type="button" onClick={() => step(-1)} disabled={spread < 0} className={arrow} aria-label="Zurückblättern" data-mappe-prev>
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button ref={nextBtn} type="button" onClick={() => step(1)} disabled={spread >= maxSpread} className={arrow} aria-label="Weiterblättern" data-mappe-next>
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* Schließen: zurück in die Tisch-Ansicht */}
        <button
          type="button"
          onClick={() => goTo(-1)}
          className={cn(
            'pointer-events-auto absolute top-24 right-4 flex h-11 items-center gap-2 rounded-full bg-paper/90 pr-4 pl-3 text-[0.875rem] font-medium text-ink shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] backdrop-blur transition-opacity duration-300 hover:bg-paper sm:right-8',
            spread >= 0 ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          aria-hidden={spread < 0 || undefined}
          tabIndex={spread < 0 ? -1 : 0}
          data-mappe-close
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
          </svg>
          Buch schließen
        </button>
        {!ready && (
          <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <span className="t-meta text-paper/85">Mappe wird vorbereitet</span>
            <span className="block h-px w-40 bg-paper/30">
              <span className="block h-px origin-left bg-paper transition-transform duration-500 ease-cs" style={{ transform: `scaleX(${Math.min(1, loaded / 4)})` }} />
            </span>
          </div>
        )}
      </div>
      <SnapshotHost ref={snap} played={played} />
    </Ctx.Provider>
  )
}
