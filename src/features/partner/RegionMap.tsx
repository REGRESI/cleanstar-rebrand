import { useMemo, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { bwRegions, germanyRegions, partnerFlags, regionStatusLabel, type Region } from '@/content/partner'
import { cn } from '@/lib/cn'

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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
      <div className="relative lg:col-span-7">
        {partnerFlags.showGermany && (
          <div role="tablist" aria-label="Kartenansicht" className="mb-6 inline-flex rounded-full bg-glacier p-1">
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
                className={cn('rounded-full px-4 py-2 text-sm font-medium transition', view === id ? 'bg-white text-ink shadow-soft' : 'text-muted hover:text-ink')}
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
            transition={{ duration: 0.35 }}
          >
            <defs>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#5b6b82" strokeOpacity="0.35" strokeWidth="2" />
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
                    fill={home || partly ? '#1f5eff' : taken ? 'url(#hatch)' : on ? '#2dd4bf' : '#ffffff'}
                    fillOpacity={home ? 1 : partly ? (on ? 0.4 : 0.22) : taken ? 1 : on ? 0.3 : 1}
                    stroke={home ? '#1f5eff' : on ? '#0f766e' : '#1f5eff'}
                    strokeOpacity={home || partly || on ? 1 : 0.28}
                    strokeWidth={on ? 2.5 : 1.5}
                    style={{ transition: 'fill .2s, stroke .2s' }}
                  />
                  {home ? (
                    <path
                      d={`M${x} ${y - 11} C${x + 1.5} ${y - 3} ${x + 3} ${y - 1.5} ${x + 11} ${y} C${x + 3} ${y + 1.5} ${x + 1.5} ${y + 3} ${x} ${y + 11} C${x - 1.5} ${y + 3} ${x - 3} ${y + 1.5} ${x - 11} ${y} C${x - 3} ${y - 1.5} ${x - 1.5} ${y - 3} ${x} ${y - 11}Z`}
                      fill="#fff"
                    />
                  ) : (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize={reg.short.length > 3 ? 9.5 : 11}
                      fontWeight={600}
                      fill={home ? '#fff' : '#0a1628'}
                      fillOpacity={taken ? 0.5 : 0.8}
                      style={{ pointerEvents: 'none' }}
                    >
                      {reg.short}
                    </text>
                  )}
                  {reg.type === 'Stadtkreis' && view === 'bw' && <circle cx={x} cy={y - 13} r="2" fill="#1f5eff" fillOpacity="0.5" />}
                </g>
              )
            })}
          </motion.svg>
        </AnimatePresence>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted" aria-label="Legende">
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-sm bg-blue" />
            CleanStar-Stammgebiet
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-sm bg-white ring-1 ring-blue/40" />
            Partner gesucht
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-sm bg-[repeating-linear-gradient(45deg,#c3cbd6_0_2px,transparent_2px_5px)] ring-1 ring-line" />
            Bereits vergeben
          </li>
          {view === 'bw' && (
            <li className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-blue/60" />
              Stadtkreis
            </li>
          )}
        </ul>
        <p className="mt-3 text-center text-xs text-muted">Schematische Darstellung, Waben grob nach Lage angeordnet.</p>
      </div>

      <div className="lg:col-span-5">
        <div className="min-h-44 rounded-card bg-glacier p-6 sm:p-8" aria-live="polite">
          {active ? (
            <>
              <p className="flex items-center gap-2 text-sm text-muted">
                <MapPin aria-hidden className="size-4 text-blue" />
                {view === 'de' ? 'Bundesland' : active.type}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{active.name}</p>
              <p className={cn('mt-2 font-medium', active.status === 'stammgebiet' ? 'text-blue' : active.status === 'vergeben' ? 'text-muted' : 'text-fresh-ink')}>
                {status(active)}
              </p>
              {selectable(active) && <p className="mt-4 text-sm text-muted">Klicken oder Enter drücken, um direkt für diese Region anzufragen.</p>}
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold tracking-tight">Wählen Sie Ihre Region.</p>
              <p className="mt-3 text-muted">
                Der Ortenaukreis ist unser Stammgebiet. Für alle anderen Kreise suchen wir Partner. Ein Klick auf Ihre Region übernimmt sie direkt in die Anfrage.
              </p>
            </>
          )}
        </div>
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Oder aus der Liste wählen</span>
          <select
            className="block w-full rounded-xl border-0 bg-white px-4 py-3.5 text-base shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_2px_var(--color-blue)] focus:outline-none"
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
        <button type="button" onClick={() => onSelect('')} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue">
          Region später angeben
          <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  )
}
