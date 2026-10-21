import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, FileText } from 'lucide-react'
import { zones, planIntervals, freqLabel, type PlanInterval, type Freq } from '@/content/floorplan'
import { cn } from '@/lib/cn'

const LINE = 'var(--color-line)'
const INK = 'rgb(15 23 42 / 0.22)'

/** Möbel und Einbauten als dezente Linien (rein dekorativ) */
function Furniture() {
  const desk = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="52" height="30" rx="3" />
      <circle cx={x + 26} cy={y + 42} r="7" />
    </g>
  )
  return (
    <g fill="none" stroke={INK} strokeWidth="1.5" pointerEvents="none">
      {/* Arbeitsplätze: zwei Reihen Schreibtische */}
      {[60, 140, 220, 300].flatMap((x) => [desk(x, 60), desk(x, 170)])}
      {/* Besprechung: Tisch mit Stühlen */}
      <rect x="540" y="70" width="160" height="56" rx="10" />
      {[560, 600, 640, 680].map((x) => (
        <g key={x}>
          <circle cx={x} cy="58" r="7" />
          <circle cx={x} cy="138" r="7" />
        </g>
      ))}
      {/* Teeküche: Zeile und Tisch */}
      <rect x="470" y="190" width="150" height="20" rx="2" />
      <circle cx="600" cy="240" r="14" />
      {/* Sanitär: Kabinen und Waschbecken */}
      <path d="M680 190v50M730 190v50" />
      <ellipse cx="655" cy="215" rx="9" ry="12" />
      <ellipse cx="705" cy="215" rx="9" ry="12" />
      <ellipse cx="755" cy="215" rx="9" ry="12" />
      <rect x="712" y="252" width="58" height="14" rx="3" />
      {/* Empfang: Theke und Sitzgruppe */}
      <path d="M60 380h120a20 20 0 0 1 20 20v10" />
      <rect x="230" y="420" width="60" height="26" rx="8" />
      {/* Einzelbüros: Trennwand und zwei Tische */}
      <path d="M470 350v130" />
      {desk(355, 380)}
      {desk(520, 380)}
      {/* Treppenhaus: Stufen */}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M640 ${370 + i * 12}h55`} />
      ))}
      <path d="M720 365v100" />
    </g>
  )
}

const badge: Record<Freq, string> = {
  visit: 'bg-blue text-white',
  weekly: 'bg-blue/10 text-blue-hover',
  monthly: 'bg-glacier-2 text-ink',
  request: 'bg-white text-muted ring-1 ring-line',
}

/**
 * Interaktiver Büro-Grundriss: Bereich antippen, Leistungen mit Intervall sehen.
 * Der Umschalter oben passt die Häufigkeiten an das gewählte Reinigungsintervall an.
 */
export function FloorPlan() {
  const [active, setActive] = useState(zones[0].id)
  const [interval, setPlanInterval] = useState<PlanInterval>('taeglich')
  const zone = zones.find((z) => z.id === active) ?? zones[0]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <div role="radiogroup" aria-label="Reinigungsintervall" className="inline-flex w-full rounded-full bg-glacier p-1 sm:w-auto">
          {planIntervals.map((i) => (
            <button
              key={i.id}
              type="button"
              role="radio"
              aria-checked={interval === i.id}
              onClick={() => setPlanInterval(i.id)}
              className={cn(
                'min-h-10 flex-1 rounded-full px-4 text-sm font-semibold transition sm:flex-none',
                interval === i.id ? 'bg-white text-ink shadow-soft' : 'text-muted hover:text-ink',
              )}
            >
              {i.label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-panel bg-white p-3 ring-1 ring-line sm:p-5">
          <svg viewBox="0 0 800 500" className="h-auto w-full" role="group" aria-label="Grundriss eines Büros. Wählen Sie einen Bereich.">
            {zones.map((z) => {
              const [x, y, w, h] = z.rect
              const on = z.id === active
              return (
                <g
                  key={z.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={z.name}
                  onClick={() => setActive(z.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActive(z.id)
                    }
                  }}
                  className="group cursor-pointer outline-none"
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={on ? 'rgb(31 94 255 / 0.12)' : '#fff'}
                    stroke={on ? 'var(--color-blue)' : LINE}
                    strokeWidth={on ? 3 : 2}
                    className="transition-[fill] duration-300 group-hover:fill-[rgb(31_94_255/0.06)] group-focus-visible:stroke-[var(--color-blue)]"
                  />
                </g>
              )
            })}
            <Furniture />
            {/* Außenwand */}
            <rect x="20" y="20" width="760" height="460" fill="none" stroke="var(--color-ink)" strokeWidth="4" pointerEvents="none" />
            {/* Beschriftung */}
            {zones.map((z) => {
              const [x, y, w, h] = z.rect
              const on = z.id === active
              const label = z.id === 'flur' ? { x: x + w / 2, y: y + h / 2 + 6 } : { x: x + 12, y: y + h - 12 }
              return (
                <text
                  key={z.id}
                  x={label.x}
                  y={label.y}
                  textAnchor={z.id === 'flur' ? 'middle' : 'start'}
                  fontSize="17"
                  fontWeight="600"
                  fill={on ? 'var(--color-blue)' : 'var(--color-ink)'}
                  pointerEvents="none"
                >
                  {z.name}
                </text>
              )
            })}
          </svg>
        </div>

        {/* Bereiche als Chips (zusätzlich zum Grundriss, gut zu treffen auf dem Handy) */}
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Bereiche">
          {zones.map((z) => (
            <li key={z.id}>
              <button
                type="button"
                onClick={() => setActive(z.id)}
                aria-pressed={z.id === active}
                className={cn(
                  'min-h-10 rounded-full px-4 text-sm font-medium ring-1 transition',
                  z.id === active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink ring-line hover:ring-ink/25',
                )}
              >
                {z.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-panel bg-white p-6 shadow-soft ring-1 ring-line sm:p-8 lg:sticky lg:top-28" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={zone.id + interval} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <p className="text-xs font-semibold tracking-[0.12em] text-blue-hover uppercase">Leistungen im Bereich</p>
              <h3 className="mt-1.5 text-2xl font-semibold tracking-tight">{zone.name}</h3>
              <ul className="mt-6 space-y-3.5">
                {zone.tasks.map((t) => (
                  <li key={t.task} className="flex items-start gap-3">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-fresh-ink" strokeWidth={3} />
                    <span className="min-w-0 flex-1 text-ink/90">{t.task}</span>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', badge[t.freq])}>{freqLabel(t.freq, interval)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          <p className="mt-8 flex gap-3 border-t border-line pt-5 text-sm text-ink">
            <FileText aria-hidden className="mt-0.5 size-5 shrink-0 text-blue" />
            <span>
              <strong className="font-semibold">Dieses Leistungsverzeichnis bekommen Sie für Ihr Objekt schriftlich.</strong>{' '}
              <span className="text-muted">Das hier ist unser Standard. Nach der Besichtigung passen wir es Raum für Raum an.</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
