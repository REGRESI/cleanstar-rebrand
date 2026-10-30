import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { zones, freqLabel, shortTask, type Freq } from '@/content/floorplan'
import { replay } from '@/lib/replay'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Aufgaben-Wolke (Prinzip aus Shopify Editions „Begriffswolke“), Seite Büroreinigung:
 * Alle Aufgaben aus dem Muster-Leistungsverzeichnis (floorplan.ts) treiben als Wolke, in drei Größen, drei
 * Helligkeiten und drei Tiefenebenen (leichte Parallaxe mit der Maus). Überfahren bzw. Antippen macht einen Begriff
 * zur Navy-Pille, daneben eine kleine Karte mit Raum und Intervall. Beim Hineinscrollen tauchen die Begriffe aus der
 * Tiefe auf, beim Hinausscrollen sinken sie zurück (jedes Mal).
 * Die Aufgaben stehen zusätzlich als nach Räumen gegliederte Liste im HTML (für Screenreader immer, sichtbar über
 * „Als Liste anzeigen“). Reduzierte Bewegung: gleich die Liste.
 */
type Word = { label: string; full: string; where: string; freq: Freq; size: 0 | 1 | 2; tone: 0 | 1 | 2; depth: 0 | 1 | 2 }

// Gleiche Kurzform in mehreren Räumen: ein Begriff, Räume zusammengefasst
const WORDS: Word[] = (() => {
  const map = new Map<string, Word>()
  let i = 0
  for (const z of zones)
    for (const t of z.tasks) {
      const label = shortTask[t.task] ?? t.task
      const w = map.get(label)
      if (w) w.where += `, ${z.name}`
      else {
        // feste Verteilung der Größen, Helligkeiten und Tiefen (deterministisch, damit vorgerendert gleich)
        const h = (i * 7 + 3) % 9
        map.set(label, { label, full: t.task, where: z.name, freq: t.freq, size: (h % 3) as 0 | 1 | 2, tone: (((i * 5) >> 1) % 3) as 0 | 1 | 2, depth: (i % 3) as 0 | 1 | 2 })
        i++
      }
    }
  return [...map.values()]
})()

/**
 * Begriffe ohne Überschneidung verteilen (Spirale um die Mitte), Ergebnis in Prozent. sizes: Breite und Höhe je
 * Begriff (vorgerendert geschätzt, im Browser gemessen), gap: Mindestabstand.
 */
function layout(W: number, H: number, sizes: [number, number][], gap = 6) {
  const boxes: [number, number, number, number][] = []
  const res: { x: number; y: number }[] = new Array(WORDS.length)
  // große Begriffe zuerst in die Mitte
  const order = WORDS.map((_, i) => i).sort((a, b) => WORDS[b].size - WORDS[a].size || a - b)
  for (const idx of order) {
    const [bw, bh] = sizes[idx]
    let placed = false
    for (let s = 0; s < 4000 && !placed; s++) {
      const a = s * 0.37 + idx
      const r = s * 0.8
      const x = W / 2 + Math.cos(a) * r * (W / H) * 0.9 - bw / 2
      const y = H / 2 + Math.sin(a) * r * 0.62 - bh / 2
      if (x < 0 || y < 0 || x + bw > W || y + bh > H) continue
      if (boxes.some(([bx, by, w2, h2]) => x < bx + w2 + gap && x + bw + gap > bx && y < by + h2 + gap && y + bh + gap > by)) continue
      boxes.push([x, y, bw, bh])
      res[idx] = { x: (x / W) * 100, y: ((y + bh / 2) / H) * 100 }
      placed = true
    }
    // kein Platz auf der Spirale: erste freie Stelle im Raster
    for (let y = 0; y + bh <= H && !placed; y += 4)
      for (let x = 0; x + bw <= W && !placed; x += 4) {
        if (boxes.some(([bx, by, w2, h2]) => x < bx + w2 + gap && x + bw + gap > bx && y < by + h2 + gap && y + bh + gap > by)) continue
        boxes.push([x, y, bw, bh])
        res[idx] = { x: (x / W) * 100, y: ((y + bh / 2) / H) * 100 }
        placed = true
      }
    if (!placed) res[idx] = { x: 0, y: 100 }
  }
  return res
}
/** Handy: zeilenweise mit leichtem, festem Versatz (schmale Fläche, die Spirale ließe zu viele Lücken) */
function rows(W: number, H: number, sizes: [number, number][], gap = 8) {
  const res: { x: number; y: number }[] = new Array(WORDS.length)
  // feste Mischung der Reihenfolge, damit große und kleine Begriffe wechseln
  const order = WORDS.map((_, i) => i).sort((a, b) => ((a * 17) % 11) - ((b * 17) % 11) || a - b)
  const lines: { items: number[]; w: number; h: number }[] = []
  for (const idx of order) {
    const [bw, bh] = sizes[idx]
    const line = lines[lines.length - 1]
    if (line && line.w + gap + bw <= W) {
      line.items.push(idx)
      line.w += gap + bw
      line.h = Math.max(line.h, bh)
    } else lines.push({ items: [idx], w: bw, h: bh })
  }
  const total = lines.reduce((t, l) => t + l.h, 0)
  const vgap = Math.max(gap, (H - total) / (lines.length + 1))
  let y = vgap
  lines.forEach((l, li) => {
    // Zeile mittig, abwechselnd leicht versetzt
    const free = W - l.w
    let x = free / 2 + (li % 2 ? 1 : -1) * Math.min(free / 2, 14)
    for (const idx of l.items) {
      const [bw, bh] = sizes[idx]
      const dy = ((idx * 7) % 5) - 2
      res[idx] = { x: (Math.max(0, x) / W) * 100, y: ((y + l.h / 2 + dy) / H) * 100 }
      x += bw + gap
      void bh
    }
    y += l.h + vgap
  })
  return res
}
const estimate = (fs: [number, number, number]) => WORDS.map((w) => [w.label.length * fs[w.size] * 0.6 + fs[w.size] * 1.3, fs[w.size] * 2] as [number, number])
const DESK = layout(880, 620, estimate([14, 17, 23]))
const MOB = rows(350, 640, estimate([12, 14, 17]))

export function TaskCloud() {
  const box = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [asList, setAsList] = useState(false)
  const [pos, setPos] = useState<{ desk: { x: number; y: number }[]; mob: { x: number; y: number }[] }>({ desk: DESK, mob: MOB })

  // Im Browser mit den gemessenen Breiten neu verteilen (die Wolke ist dabei noch unsichtbar)
  useLayoutEffect(() => {
    const el = box.current
    if (!el || asList) return
    const field = [...el.querySelectorAll<HTMLElement>('.tc-field')].find((f) => f.offsetParent !== null)
    if (!field) return
    const run = () => {
      const sizes = [...field.querySelectorAll<HTMLElement>('.tc-pill')].map((p) => [p.offsetWidth + 2, p.offsetHeight + 2] as [number, number])
      const mob = field.classList.contains('md:hidden')
      const next = (mob ? rows : layout)(field.clientWidth, field.clientHeight, sizes, mob ? 8 : 6)
      setPos((cur) => (mob ? { ...cur, mob: next } : { ...cur, desk: next }))
    }
    run()
    // nach dem Laden der Schrift stimmen die Breiten erst genau
    document.fonts?.ready.then(run)
  }, [asList])

  useEffect(() => {
    const el = box.current
    if (!el) return
    if (prefersReducedMotion()) {
      setAsList(true)
      return
    }
    const off = replay(el, () => el.setAttribute('data-on', ''), () => el.removeAttribute('data-on'), { start: 'top 80%', end: 'bottom 15%' })
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
      el.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
    }
    if (fine) el.addEventListener('pointermove', move)
    return () => {
      off()
      el.removeEventListener('pointermove', move)
    }
  }, [])

  const cloud = (pos: { x: number; y: number }[], cls: string) => (
    <div aria-hidden className={cn('tc-field', cls)}>
      {WORDS.map((w, i) => {
        const on = active === i
        return (
          <span
            key={w.label}
            className={cn('tc-word', on && 'is-on')}
            data-size={w.size}
            data-tone={w.tone}
            data-depth={w.depth}
            style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%`, '--d': `${(i % 9) * 0.06}s`, '--fl': `${7 + (i % 5) * 1.7}s` } as CSSProperties}
            onPointerEnter={(e) => e.pointerType !== 'touch' && setActive(i)}
            onPointerLeave={(e) => e.pointerType !== 'touch' && setActive((a) => (a === i ? null : a))}
            onClick={() => setActive((a) => (a === i ? null : i))}
          >
            <span className="tc-pill">{w.label}</span>
            {on && (
              <span className="tc-card">
                <span className="block font-medium text-ink">{w.where}</span>
                <span className="block text-muted">{freqLabel(w.freq, 'taeglich')}</span>
              </span>
            )}
          </span>
        )
      })}
    </div>
  )

  return (
    <section className="section" aria-labelledby="tasks-title">
      <div className="container-site grid-site gap-y-10 lg:items-center">
        <div className="col-span-12 lg:col-span-4">
          <p className="t-label">Leistungsverzeichnis</p>
          <h2 id="tasks-title" className="t-h2 mt-5 max-w-[14ch]">
            Was wir in Ihrem Büro erledigen.
          </h2>
          <p className="mt-6 max-w-[34ch] text-ink-2">Fahren Sie über einen Begriff oder tippen Sie ihn an: Sie sehen, in welchem Raum und wie oft. Das Intervall bezieht sich auf eine tägliche Reinigung.</p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <a href="#scope-title" className="tlink">
              Zum Muster-Leistungsverzeichnis
            </a>
            <button type="button" className="tlink text-[0.9375rem]" aria-expanded={asList} onClick={() => setAsList((v) => !v)}>
              {asList ? 'Als Wolke anzeigen' : 'Als Liste anzeigen'}
            </button>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <div ref={box} className={cn('tc', asList && 'is-list')}>
            {!asList && cloud(pos.desk, 'max-md:hidden')}
            {!asList && cloud(pos.mob, 'md:hidden')}
            {/* Dieselben Aufgaben nach Räumen (Screenreader immer, sichtbar als Liste) */}
            <div className={asList ? 'tc-list' : 'sr-only'}>
              {zones.map((z) => (
                <div key={z.id}>
                  <h3 className="t-label">{z.name}</h3>
                  <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-ink-2">
                    {z.tasks.map((t) => (
                      <li key={t.task}>
                        {t.task} <span className="text-muted">· {freqLabel(t.freq, 'taeglich')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
