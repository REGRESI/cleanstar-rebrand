import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { busFor, Scene3D, useBookControls, cornersToTransform, type SceneBus } from './Book3D'
import { SnapshotHost, type SnapshotApi } from './snapshots'
import { mappePages } from './pages'
import { Ctx, PAGE_H, PAGE_W, type Side } from './core'
import { playPageTurn } from './sound'
import { cn } from '@/lib/cn'

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], [role="radio"], [data-interactive]'

/** Textur aus dem abfotografierten Canvas (scharf: Mipmaps und anisotrope Filterung) */
function toTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  return t
}

/** Erst fotografieren, wenn nichts blättert: Das Abfotografieren belegt kurz den Hauptthread und soll keine Bewegung stören */
async function whenIdle(bus: SceneBus) {
  while (bus.anims.size > 0 || bus.drag || Math.abs(bus.openTarget - bus.open) > 0.002) await new Promise((r) => setTimeout(r, 120))
}

function preview(canvas: HTMLCanvasElement) {
  const c = document.createElement('canvas')
  c.width = 264
  c.height = Math.round((264 * PAGE_H) / PAGE_W)
  c.getContext('2d')!.drawImage(canvas, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.82)
}

/**
 * Die Leistungsmappe in 3D: Schreibtisch, Buch, Blättern. Liegt eine Doppelseite still, liegen darüber die echten
 * HTML-Seiten (klickbar, scharf), perspektivisch exakt auf der Seitenfläche. Beim Blättern sind es wieder Texturen.
 */
export default function Experience3D({ sound, onReady, onSpread }: { sound: boolean; onReady: () => void; onSpread?: (s: number) => void }) {
  const n = mappePages.length
  const bus = useMemo(() => busFor(n), [n])
  const snap = useRef<SnapshotApi>(null)
  const [played, setPlayed] = useState<Record<number, boolean>>({})
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [loaded, setLoaded] = useState(0)
  const [hoverService, setHoverService] = useState<number | null>(null)
  const [still, setStill] = useState(false)
  const soundRef = useRef(sound)
  soundRef.current = sound
  const onTurn = useCallback(() => {
    if (soundRef.current) playPageTurn()
  }, [])
  const { spread, goTo, drag, maxSpread, spreadRef } = useBookControls(bus, n, onTurn)
  const leftEl = useRef<HTMLDivElement>(null)
  const rightEl = useRef<HTMLDivElement>(null)
  const geom = useRef<{ left: [number, number][] | null; right: [number, number][] | null }>({ left: null, right: null })
  const pr = Math.min(2, Math.max(1.25, (typeof window !== 'undefined' ? window.devicePixelRatio : 1) * 1.05))

  useEffect(() => {
    onSpread?.(spread)
  }, [spread, onSpread])

  // Einband und Seitentexturen laden: zuerst Einband und die ersten Seiten, den Rest ruhig im Hintergrund
  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load('/mappe/cover.webp', (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      bus.coverTex = t
      if (alive) setLoaded((x) => x + 1)
    })
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
        // dem Browser Luft lassen, damit nichts ruckelt
        await new Promise((r) => setTimeout(r, i < 3 ? 0 : 60))
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

  // Gesehene Seiten bleiben im Endzustand; ihre Textur wird im Endzustand neu fotografiert (unsichtbarer Wechsel beim nächsten Blättern)
  const left = spread > 0 ? 2 * spread - 1 : -1
  const right = spread >= 0 && 2 * spread < n ? 2 * spread : -1
  useEffect(() => {
    if (!still || spread < 0) return
    const fresh = [left, right].filter((i) => i >= 0 && !played[i])
    if (!fresh.length) return
    setPlayed((p) => ({ ...p, ...Object.fromEntries(fresh.map((i) => [i, true])) }))
  }, [still, spread, left, right, played])
  useEffect(() => {
    const ids = Object.keys(played).map(Number)
    let alive = true
    ;(async () => {
      await new Promise((r) => setTimeout(r, 50))
      for (const i of ids) {
        if (!alive || !snap.current || bus.textures[i]?.userData.final) continue
        await whenIdle(bus)
        if (!alive || !snap.current) return
        const c = await snap.current.capture(i, pr)
        const t = toTexture(c)
        t.userData.final = true
        bus.textures[i]?.dispose()
        bus.textures[i] = t
      }
    })().catch(() => {})
    return () => {
      alive = false
    }
  }, [played, bus, pr])

  // Ecken der Seiten → Transform der HTML-Seiten (direkt am DOM, ohne Rendern)
  useEffect(() => {
    let wasStill = false
    bus.onCorners = (l, r, s) => {
      geom.current = { left: l, right: r }
      if (leftEl.current && l) leftEl.current.style.transform = cornersToTransform(l)
      if (rightEl.current && r) rightEl.current.style.transform = cornersToTransform(r)
      if (s !== wasStill) {
        wasStill = s
        setStill(s)
      }
    }
    return () => {
      bus.onCorners = undefined
    }
  }, [bus])

  // Pfeiltasten
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') goTo(spreadRef.current + 1)
      if (e.key === 'ArrowLeft') goTo(spreadRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, spreadRef])

  // Ziehen an der Seitenecke
  const startDrag = (side: Side, e: React.PointerEvent) => {
    const g = geom.current[side]
    if (!g) return
    e.preventDefault()
    const spineX = side === 'right' ? (g[0][0] + g[3][0]) / 2 : (g[1][0] + g[2][0]) / 2
    const outerX = side === 'right' ? (g[1][0] + g[2][0]) / 2 : (g[0][0] + g[3][0]) / 2
    const pageW = Math.abs(outerX - spineX)
    const move = (ev: PointerEvent) => {
      const d = (ev.clientX - spineX) / pageW // +1 außen rechts, -1 außen links
      const p = side === 'right' ? (1 - d) / 2 : (1 - d) / 2
      drag(side, Math.max(0, Math.min(1, p)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      drag(side, null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    drag(side, side === 'right' ? 0.02 : 0.98)
  }

  const ctx = useMemo(
    () => ({
      jump: (i: number) => goTo(Math.floor((i + 1) / 2)),
      previews,
      hoverService,
      setHoverService,
      indexOf: (id: string) => mappePages.findIndex((p) => p.id === id),
    }),
    [goTo, previews, hoverService],
  )

  const overlayOn = still && spread >= 0
  const slot = (i: number, side: Side, ref: React.RefObject<HTMLDivElement | null>) => {
    const Page = i >= 0 ? mappePages[i] : null
    const opp = side === 'left' && right >= 0 ? mappePages[right].opposite : side === 'right' && left >= 0 ? mappePages[left].opposite : undefined
    const canTurn = side === 'right' ? spread < maxSpread : spread > 0
    return (
      <div
        ref={ref}
        className={cn('absolute top-0 left-0 origin-top-left transition-opacity duration-200', overlayOn && Page ? 'opacity-100' : 'pointer-events-none opacity-0')}
        style={{ width: PAGE_W, height: PAGE_H }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(INTERACTIVE)) return
          goTo(spread + (side === 'right' ? 1 : -1))
        }}
      >
        {overlayOn && Page && (
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
            {canTurn && (
              <div
                data-interactive
                role="button"
                aria-label={side === 'right' ? 'Weiterblättern' : 'Zurückblättern'}
                onPointerDown={(e) => startDrag(side, e)}
                onClick={() => goTo(spread + (side === 'right' ? 1 : -1))}
                className={cn('group/corner absolute bottom-0 size-24 cursor-grab touch-none', side === 'right' ? 'right-0' : 'left-0')}
              >
                {/* Eselsohr: Die Ecke hebt sich beim Überfahren leicht an */}
                <span
                  aria-hidden
                  className={cn('absolute bottom-0 size-0 transition-[width,height] duration-300 ease-cs group-hover/corner:size-11', side === 'right' ? 'right-0' : 'left-0')}
                  style={{
                    background:
                      side === 'right'
                        ? 'linear-gradient(135deg, #f5f2eb 0%, #f5f2eb 45%, #e4ded2 50%, rgba(40,30,15,0.18) 51%, transparent 75%)'
                        : 'linear-gradient(225deg, #f5f2eb 0%, #f5f2eb 45%, #e4ded2 50%, rgba(40,30,15,0.18) 51%, transparent 75%)',
                    boxShadow: '0 0 0 0 transparent',
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <Ctx.Provider value={ctx}>
      <div className="absolute inset-0">
        <Scene3D bus={bus} onOpen={() => goTo(spreadRef.current < 0 ? 0 : spreadRef.current)} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden [&>*]:pointer-events-auto">
          {slot(left, 'left', leftEl)}
          {slot(right, 'right', rightEl)}
        </div>
        {!ready && (
          <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <span className="t-meta">Mappe wird vorbereitet</span>
            <span className="block h-px w-40 bg-line">
              <span className="block h-px origin-left bg-ink transition-transform duration-500 ease-cs" style={{ transform: `scaleX(${Math.min(1, loaded / 4)})` }} />
            </span>
          </div>
        )}
      </div>
      <SnapshotHost ref={snap} played={played} />
    </Ctx.Provider>
  )
}
