import { useMemo, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { bwRegions, germanyRegions, partnerFlags, regionStatusLabel, type Region } from '@/content/partner'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'

/**
 * Schematische Wabenkarte (eigene SVG, keine externen Kartendienste).
 * Jede Wabe ist ein Stadt- oder Landkreis, grob nach seiner Lage angeordnet.
 * Klick auf eine freie Region übergibt sie an das Bewerbungsformular.
 */
const R = 30
const W = Math.sqrt(3) * R

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90)
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  })
  return `M${pts.join('L')}Z`
}

type View = 'bw' | 'de'

export function RegionMap({ onSelect }: { onSelect: (regionName: string) => void }) {
  const [view, setView] = useState<View>('bw')
  const [active, setActive] = useState<Region | null>(null)
  const regions = view === 'bw' ? bwRegions : germanyRegions

  const layout = useMemo(() => {
    const pos = regions.map((reg) => ({ reg, x: (reg.col + (reg.row % 2 ? 0.5 : 0)) * W, y: reg.row * 1.5 * R }))
    const minX = Math.min(...pos.map((p) => p.x)) - W / 2 - 4
    const maxX = Math.max(...pos.map((p) => p.x)) + W / 2 + 4
    const maxY = Math.max(...pos.map((p) => p.y)) + R + 4
    return { pos, vb: `${minX} ${-R - 4} ${maxX - minX} ${maxY + R + 4}` }
  }, [regions])

  const label = (reg: Region) => (view === 'de' ? `${reg.name}, Bundesland` : `${reg.name}, ${reg.type}`)
  const status = (reg: Region) => (view === 'de' && reg.id === 'bw' ? 'Ortenaukreis: Stammgebiet. Weitere Kreise: Partner gesucht' : regionStatusLabel[reg.status])
  const selectable = (reg: Region) => reg.status === 'gesucht' || (view === 'de' && reg.id === 'bw')
  const choose = (reg: Region) => {
    if (!selectable(reg)) {
      setActive(reg)
      return
    }
    onSelect(reg.name)
  }
  const onKey = (e: KeyboardEvent, reg: Region) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(reg)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12 lg:items-center">
      <div className="relative lg:col-span-7">
        {partnerFlags.showGermany && (
          <div role="tablist" aria-label="Kartenansicht" className="mb-6 inline-flex shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
            {(
              [
                ['bw', 'Baden-Württemberg'],
                ['de', 'Deutschland'],
              ] as const
            ).map(([id, l]) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                type="button"
                onClick={() => {
                  setView(id)
                  setActive(null)
                }}
                className={cn('px-4 py-2.5 text-[0.9375rem] transition-colors', view === id ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink')}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.svg
            key={view}
            viewBox={layout.vb}
            className="mx-auto h-auto w-full max-w-[34rem]"
            role="group"
            aria-label={view === 'bw' ? 'Karte der Stadt- und Landkreise in Baden-Württemberg' : 'Karte der Bundesländer'}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE_CS_ARRAY }}
          >
            <defs>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-ink)" strokeOpacity="0.3" strokeWidth="1.5" />
              </pattern>
            </defs>
            {layout.pos.map(({ reg, x, y }) => {
              const on = active?.id === reg.id
              const home = reg.status === 'stammgebiet' && view === 'bw'
              const partly = reg.status === 'stammgebiet' && view === 'de'
              const taken = reg.status === 'vergeben'
              return (
                <g
                  key={reg.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${label(reg)}: ${status(reg)}${selectable(reg) ? '. Für diese Region anfragen' : ''}`}
                  aria-disabled={!selectable(reg) || undefined}
                  onClick={() => choose(reg)}
                  onKeyDown={(e) => onKey(e, reg)}
                  onMouseEnter={() => setActive(reg)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(reg)}
                  onBlur={() => setActive(null)}
                  className={cn('outline-none', selectable(reg) ? 'cursor-pointer' : 'cursor-default')}
                >
                  <path
                    d={hexPath(x, y, R - 2)}
                    fill={home || partly ? 'var(--color-blue)' : taken ? 'url(#hatch)' : on ? 'var(--color-ink)' : 'var(--color-paper)'}
                    fillOpacity={home ? 1 : partly ? (on ? 0.4 : 0.22) : taken ? 1 : on ? 1 : 1}
                    stroke={home ? 'var(--color-blue)' : 'var(--color-ink)'}
                    strokeOpacity={home || partly || on ? 1 : 0.3}
                    strokeWidth={1}
                    style={{ transition: 'fill .2s, stroke .2s' }}
                  />
                  {home ? (
                    <path
                      d={`M${x} ${y - 11} C${x + 1.5} ${y - 3} ${x + 3} ${y - 1.5} ${x + 11} ${y} C${x + 3} ${y + 1.5} ${x + 1.5} ${y + 3} ${x} ${y + 11} C${x - 1.5} ${y + 3} ${x - 3} ${y + 1.5} ${x - 11} ${y} C${x - 3} ${y - 1.5} ${x - 1.5} ${y - 3} ${x} ${y - 11}Z`}
                      fill="var(--color-paper)"
                    />
                  ) : (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize={reg.short.length > 3 ? 9.5 : 11}
                      fontWeight={500}
                      fill={on ? 'var(--color-paper)' : 'var(--color-ink)'}
                      fillOpacity={taken ? 0.5 : 0.8}
                      style={{ pointerEvents: 'none' }}
                    >
                      {reg.short}
                    </text>
                  )}
                  {reg.type === 'Stadtkreis' && view === 'bw' && <circle cx={x} cy={y - 13} r="2" fill={on ? 'var(--color-paper)' : 'var(--color-ink)'} fillOpacity="0.6" />}
                </g>
              )
            })}
          </motion.svg>
        </AnimatePresence>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.75rem] text-muted" aria-label="Legende">
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 bg-blue" />
            CleanStar-Stammgebiet
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 bg-paper ring-1 ring-ink/40" />
            Partner gesucht
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 bg-[repeating-linear-gradient(45deg,rgb(14_16_19/0.3)_0_1.5px,transparent_1.5px_5px)] ring-1 ring-ink/40" />
            Bereits vergeben
          </li>
          {view === 'bw' && (
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-ink/60" />
              Stadtkreis
            </li>
          )}
        </ul>
        <p className="caption">Schematische Darstellung, Waben grob nach Lage angeordnet.</p>
      </div>

      <div className="lg:col-span-4 lg:col-start-9">
        <div className="min-h-48 border-t border-line pt-6" aria-live="polite">
          {active ? (
            <>
              <p className="t-label">{view === 'de' ? 'Bundesland' : active.type}</p>
              <p className="t-h3 mt-3">{active.name}</p>
              <p className={cn('mt-2 font-medium', active.status === 'stammgebiet' ? 'text-blue' : active.status === 'vergeben' ? 'text-muted' : 'text-ink')}>
                {status(active)}
              </p>
              {selectable(active) && <p className="mt-4 text-[0.9375rem] text-ink-2">Klicken oder Enter drücken, um direkt für diese Region anzufragen.</p>}
            </>
          ) : (
            <>
              <p className="t-h3">Wählen Sie Ihre Region.</p>
              <p className="mt-3 text-ink-2">
                Der Ortenaukreis ist unser Stammgebiet. Für alle anderen Kreise suchen wir Partner. Ein Klick auf Ihre Region übernimmt sie direkt in die Anfrage.
              </p>
            </>
          )}
        </div>
        <label className="mt-10 block">
          <span className="field-label mb-1">Oder aus der Liste wählen</span>
          <select
            className="field block"
            defaultValue=""
            onChange={(e) => e.target.value && onSelect(e.target.value)}
          >
            <option value="">Region auswählen …</option>
            {[...bwRegions]
              .filter((x) => x.status === 'gesucht')
              .sort((a, b) => a.name.localeCompare(b.name, 'de'))
              .map((x) => (
                <option key={x.id} value={x.name}>
                  {x.name}
                </option>
              ))}
            <option value="Außerhalb von Baden-Württemberg">Außerhalb von Baden-Württemberg</option>
          </select>
        </label>
        <button type="button" onClick={() => onSelect('')} className="tlink mt-8 text-[0.9375rem]">
          Region später angeben
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
