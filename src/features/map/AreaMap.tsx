import { useState } from 'react'
import { Link, useHref, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { hq, places as locations, shortName, type Place as Location } from '@/content/places'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'

/**
 * Eigene SVG-Karte des Ortenaukreises (schematisch, ohne externe Kartendienste, DSGVO-freundlich).
 * Orte kommen aus src/content/locations.ts und verlinken auf die Standortseiten.
 */

// Einfache Projektion: Längen-/Breitengrad → SVG-Koordinaten
const LNG0 = 7.6
const LAT0 = 48.76
const K = 1000
const COS = Math.cos((48.45 * Math.PI) / 180)
const proj = (lat: number, lng: number) => [(lng - LNG0) * K * COS, (LAT0 - lat) * K] as const

// Schematischer Umriss des Ortenaukreises (vereinfacht)
const OUTLINE: [number, number][] = [
  [48.735, 7.99],
  [48.7, 8.09],
  [48.64, 8.17],
  [48.56, 8.22],
  [48.49, 8.26],
  [48.42, 8.32],
  [48.35, 8.38],
  [48.27, 8.37],
  [48.19, 8.3],
  [48.13, 8.2],
  [48.15, 8.08],
  [48.19, 7.95],
  [48.24, 7.8],
  [48.3, 7.72],
  [48.38, 7.72],
  [48.46, 7.76],
  [48.55, 7.79],
  [48.62, 7.85],
  [48.69, 7.92],
]
const RHINE: [number, number][] = [
  [48.76, 7.95],
  [48.69, 7.89],
  [48.62, 7.82],
  [48.56, 7.77],
  [48.47, 7.735],
  [48.38, 7.69],
  [48.3, 7.68],
  [48.22, 7.72],
  [48.13, 7.68],
]
const toPath = (pts: [number, number][], close = true) =>
  pts
    .map(
      ([la, ln], i) =>
        `${i ? 'L' : 'M'}${proj(la, ln)
          .map((v) => v.toFixed(1))
          .join(' ')}`,
    )
    .join(' ') + (close ? 'Z' : '')

const [HX, HY] = proj(hq.lat, hq.lng)

/** Position der Ortsnamen, damit sich Beschriftungen nicht überlappen */
const LABEL: Record<string, 'l' | 'r' | 't' | 'tl'> = {
  kehl: 'l',
  willstaett: 'l',
  appenweier: 't',
  schutterwald: 'tl',
  neuried: 'l',
  hohberg: 'l',
  friesenheim: 'l',
  lahr: 'l',
}
const labelAttrs = (slug: string, x: number, y: number) => {
  const pos = LABEL[slug] ?? 'r'
  if (pos === 'l') return { x: x - 14, y: y + 4, textAnchor: 'end' as const }
  if (pos === 't') return { x, y: y - 14, textAnchor: 'middle' as const }
  if (pos === 'tl') return { x: x - 10, y: y - 10, textAnchor: 'end' as const }
  return { x: x + 14, y: y + 4, textAnchor: 'start' as const }
}
const VB = { x: -20, y: -10, w: 560, h: 660 }

export function AreaMap({ className, compact }: { className?: string; compact?: boolean }) {
  const [active, setActive] = useState<Location | null>(null)
  const navigate = useNavigate()
  const root = useHref('/')
  const href = (path: string) => (root.startsWith('#') ? `#${path}` : path)
  const others = locations.filter((l) => l.slug !== 'offenburg')

  return (
    <div className={cn('grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12 lg:items-start', className)}>
      <div className="relative lg:col-span-7">
        <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="h-auto w-full" role="group" aria-label="Karte des Einzugsgebiets im Ortenaukreis">
          <path d={toPath(RHINE, false)} fill="none" stroke="var(--color-blue)" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            x={proj(48.42, 7.66)[0]}
            y={proj(48.42, 7.66)[1]}
            fontSize="11"
            fill="var(--color-muted)"
            transform={`rotate(-70 ${proj(48.42, 7.66).join(' ')})`}
            letterSpacing="2"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Rhein
          </text>
          <path d={toPath(OUTLINE)} fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.6" strokeWidth="1" />
          <text x={proj(48.3, 8.2)[0]} y={proj(48.3, 8.2)[1]} fontSize="11" fill="var(--color-muted)" letterSpacing="2" style={{ fontFamily: 'var(--font-mono)' }}>
            Schwarzwald
          </text>

          {/* Verbindungslinie zum aktiven Ort */}
          {active && active.slug !== 'offenburg' && (
            <motion.line
              key={active.slug}
              x1={HX}
              y1={HY}
              x2={proj(active.lat, active.lng)[0]}
              y2={proj(active.lat, active.lng)[1]}
              stroke="var(--color-blue)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: EASE_CS_ARRAY }}
            />
          )}

          {others.map((l) => {
            const [x, y] = proj(l.lat, l.lng)
            const on = active?.slug === l.slug
            return (
              <a
                key={l.slug}
                href={href(`/einzugsgebiet/${l.slug}`)}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/einzugsgebiet/${l.slug}`)
                }}
                onMouseEnter={() => setActive(l)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(l)}
                onBlur={() => setActive(null)}
                aria-label={`${l.name}: ca. ${l.minutes} Minuten von Offenburg`}
                className="cursor-pointer outline-none [&:focus-visible_circle.ring]:stroke-blue"
              >
                <circle cx={x} cy={y} r="16" fill="transparent" />
                <circle className="ring" cx={x} cy={y} r={on ? 9 : 0} fill="none" stroke="var(--color-blue)" strokeWidth="1" style={{ transition: 'r .3s' }} />
                <circle cx={x} cy={y} r={on ? 4.5 : l.major ? 4 : 3} fill={on ? 'var(--color-blue)' : 'var(--color-ink)'} style={{ transition: 'r .3s' }} />
                {/* Beschriftung nur für größere Orte (sonst zu eng), kleinere beim Darüberfahren */}
                {!compact && (l.major || on) && (
                  <text {...labelAttrs(l.slug, x, y)} fontSize="13" fontWeight="500" fill={on ? 'var(--color-blue)' : 'var(--color-ink)'}>
                    {shortName(l)}
                  </text>
                )}
              </a>
            )
          })}

          {/* Offenburg */}
          <a
            href={href('/einzugsgebiet/offenburg')}
            onClick={(e) => {
              e.preventDefault()
              navigate('/einzugsgebiet/offenburg')
            }}
            aria-label="Offenburg, unser Sitz"
            onMouseEnter={() => setActive(locations[0])}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(locations[0])}
            onBlur={() => setActive(null)}
            className="cursor-pointer outline-none"
          >
            <circle cx={HX} cy={HY} r="14" fill="none" stroke="var(--color-blue)" strokeWidth="1" />
            <circle cx={HX} cy={HY} r="7" fill="var(--color-blue)" />
            <text x={HX - 20} y={HY - 16} textAnchor="end" fontSize="15" fontWeight="500" fill="var(--color-ink)">
              Offenburg
            </text>
          </a>
        </svg>
        <p className="caption">Schematische Darstellung. Fahrzeiten sind ungefähre Richtwerte mit dem Auto.</p>

        {/* Tooltip */}
        <div aria-live="polite" className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6">
          {active && (
            <motion.div key={active.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE_CS_ARRAY }} className="border-l border-ink bg-paper py-1 pl-3">
              <p className="text-[1.125rem] font-medium text-ink">{active.name}</p>
              <p className="mt-0.5 font-mono text-[0.75rem] text-muted">
                {active.minutes === 0 ? 'Unser Sitz' : `ca. ${active.minutes} Min. von Offenburg`}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 lg:col-start-9">
        <p className="t-label mb-4">{locations.length} Orte · Fahrzeit ab Offenburg</p>
        <ul className="grid grid-cols-1 gap-x-8 border-t border-line min-[440px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {locations.map((l) => (
            <li key={l.slug} className="border-b border-line">
              <Link
                to={`/einzugsgebiet/${l.slug}`}
                onMouseEnter={() => setActive(l)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(l)}
                onBlur={() => setActive(null)}
                className={cn('flex items-baseline justify-between gap-x-3 py-2.5 text-[0.9375rem] transition-colors', active?.slug === l.slug ? 'text-blue' : 'text-ink')}
              >
                <span>{shortName(l)}</span>
                <span className={cn('shrink-0 font-mono text-[0.75rem] tabular-nums', active?.slug === l.slug ? 'text-blue' : 'text-muted')}>
                  {l.minutes === 0 ? 'Sitz' : `${l.minutes} Min.`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
