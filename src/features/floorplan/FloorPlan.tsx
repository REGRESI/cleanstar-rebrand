import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { zones, planIntervals, freqLabel, type PlanInterval, type Freq } from '@/content/floorplan'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'
import { Segments } from '@/features/tools/ui'

const LINE = 'var(--color-line)'
const INK = 'rgb(14 16 19 / 0.24)'

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

/** Häufigkeit in Monospace: häufig = dunkel, selten = gedämpft (keine farbigen Pillen) */
const freqCls: Record<Freq, string> = {
  visit: 'text-ink',
  weekly: 'text-ink',
  monthly: 'text-muted',
  request: 'text-muted',
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
        <fieldset>
          <legend className="t-label mb-3">Reinigungsintervall</legend>
          <Segments name="plan-interval" value={interval} onChange={setPlanInterval} options={planIntervals} className="sm:max-w-md" />
        </fieldset>

        <div className="mt-6 border-y border-line py-4 sm:py-6">
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
                    fill={on ? 'rgb(26 79 224 / 0.1)' : 'var(--color-paper)'}
                    stroke={on ? 'var(--color-blue)' : LINE}
                    strokeWidth={on ? 2.5 : 1.5}
                    className="transition-[fill] duration-300 group-hover:fill-[rgb(14_16_19/0.04)] group-focus-visible:stroke-[var(--color-blue)]"
                  />
                </g>
              )
            })}
            <Furniture />
            {/* Außenwand */}
            <rect x="20" y="20" width="760" height="460" fill="none" stroke="var(--color-ink)" strokeWidth="3" pointerEvents="none" />
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
                  fontSize="16"
                  fontWeight="500"
                  fill={on ? 'var(--color-blue)' : 'var(--color-ink)'}
                  pointerEvents="none"
                >
                  {z.name}
                </text>
              )
            })}
          </svg>
        </div>

        {/* Bereiche als Textauswahl (zusätzlich zum Grundriss, gut zu treffen auf dem Handy) */}
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1" aria-label="Bereiche">
          {zones.map((z) => (
            <li key={z.id}>
              <button
                type="button"
                onClick={() => setActive(z.id)}
                aria-pressed={z.id === active}
                className={cn('ulink min-h-10 text-[0.9375rem] transition-colors', z.id === active ? 'bg-[length:100%_1px] text-ink' : 'text-muted hover:text-ink')}
              >
                {z.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={zone.id + interval}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE_CS_ARRAY }}
            >
              <p className="t-label">Leistungen im Bereich</p>
              <h3 className="t-h3 mt-3">{zone.name}</h3>
              <ul className="mt-6 border-t border-line">
                {zone.tasks.map((t) => (
                  <li key={t.task} className="grid grid-cols-1 gap-x-4 gap-y-1 border-b border-line py-3 min-[400px]:grid-cols-[minmax(0,1fr)_auto]">
                    <span className="text-ink">{t.task}</span>
                    <span className={cn('font-mono text-[0.8125rem] whitespace-nowrap min-[400px]:pt-0.5 min-[400px]:text-right', freqCls[t.freq])}>
                      {freqLabel(t.freq, interval)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          <p className="mt-8 text-[0.9375rem] text-ink-2">
            <span className="font-medium text-ink">Dieses Leistungsverzeichnis bekommen Sie für Ihr Objekt schriftlich.</span> Das hier ist unser Standard. Nach der Besichtigung
            passen wir es Raum für Raum an.
          </p>
        </div>
      </div>
    </div>
  )
}
