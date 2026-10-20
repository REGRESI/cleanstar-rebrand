import { useState } from 'react'
import { Link, useHref, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { hq, locations, type Location } from '@/content/locations'
import { cn } from '@/lib/cn'

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
    <div className={cn('grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center', className)}>
      <div className="relative lg:col-span-7">
        <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="h-auto w-full" role="group" aria-label="Karte des Einzugsgebiets im Ortenaukreis">
          <defs>
            <linearGradient id="map-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#e6eefb" />
            </linearGradient>
            <radialGradient id="map-hq" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#1f5eff" stopOpacity="0.22" />
              <stop offset="1" stopColor="#1f5eff" stopOpacity="0" />
            </radialGradient>
            <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="#0a1628" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="url(#map-grid)" />
          <path d={toPath(RHINE, false)} fill="none" stroke="#9cc7f0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <text x={proj(48.42, 7.66)[0]} y={proj(48.42, 7.66)[1]} fontSize="13" fill="#5b6b82" transform={`rotate(-70 ${proj(48.42, 7.66).join(' ')})`} letterSpacing="3">
            RHEIN
          </text>
          <path d={toPath(OUTLINE)} fill="url(#map-fill)" stroke="#1f5eff" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="5 4" />
          <text x={proj(48.3, 8.2)[0]} y={proj(48.3, 8.2)[1]} fontSize="12" fill="#5b6b82" letterSpacing="3" opacity="0.8">
            SCHWARZWALD
          </text>
          <circle cx={HX} cy={HY} r="140" fill="url(#map-hq)" />
          <circle cx={HX} cy={HY} r="95" fill="none" stroke="#1f5eff" strokeOpacity="0.12" />
          <circle cx={HX} cy={HY} r="190" fill="none" stroke="#1f5eff" strokeOpacity="0.08" />

          {/* Verbindungslinie zum aktiven Ort */}
          {active && active.slug !== 'offenburg' && (
            <motion.line
              key={active.slug}
              x1={HX}
              y1={HY}
              x2={proj(active.lat, active.lng)[0]}
              y2={proj(active.lat, active.lng)[1]}
              stroke="#2dd4bf"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
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
                aria-label={`${l.name}: ca. ${l.minutes} Minuten von Offenburg`}
                className="cursor-pointer outline-none [&:focus-visible_circle.ring]:stroke-blue"
              >
                <circle cx={x} cy={y} r="16" fill="transparent" />
                <circle
                  className="ring"
                  cx={x}
                  cy={y}
                  r={on ? 10 : 7}
                  fill="#fff"
                  stroke={on ? '#1f5eff' : '#0a1628'}
                  strokeOpacity={on ? 1 : 0.35}
                  strokeWidth="2"
                  style={{ transition: 'r .25s' }}
                />
                <circle cx={x} cy={y} r={on ? 4.5 : 3} fill={on ? '#1f5eff' : '#0a1628'} style={{ transition: 'r .25s' }} />
                {!compact && (
                  <text {...labelAttrs(l.slug, x, y)} fontSize="13" fontWeight={on ? 600 : 500} fill={on ? '#1f5eff' : '#0a1628'}>
                    {l.name.replace(' im Kinzigtal', '')}
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
            <circle cx={HX} cy={HY} r="22" fill="#1f5eff" opacity="0.15">
              <animate attributeName="r" values="14;30;14" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={HX} cy={HY} r="13" fill="#1f5eff" stroke="#fff" strokeWidth="3" />
            <path
              d={`M${HX} ${HY - 7} C${HX + 1} ${HY - 2} ${HX + 2} ${HY - 1} ${HX + 7} ${HY} C${HX + 2} ${HY + 1} ${HX + 1} ${HY + 2} ${HX} ${HY + 7} C${HX - 1} ${HY + 2} ${HX - 2} ${HY + 1} ${HX - 7} ${HY} C${HX - 2} ${HY - 1} ${HX - 1} ${HY - 2} ${HX} ${HY - 7}Z`}
              fill="#fff"
            />
            <text x={HX - 20} y={HY - 16} textAnchor="end" fontSize="15" fontWeight="700" fill="#0a1628">
              Offenburg
            </text>
          </a>
        </svg>
        <p className="mt-2 text-xs text-muted">Schematische Darstellung. Fahrzeiten sind ungefähre Richtwerte mit dem Auto.</p>

        {/* Tooltip */}
        <div aria-live="polite" className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6">
          {active && (
            <motion.div key={active.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl px-4 py-3 shadow-lift ring-1 ring-line">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <MapPin aria-hidden className="size-4 text-blue" />
                {active.name}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <Clock aria-hidden className="size-4 text-fresh-ink" />
                {active.minutes === 0 ? 'Unser Sitz' : `ca. ${active.minutes} Min. von Offenburg`}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {locations.map((l) => (
            <li key={l.slug}>
              <Link
                to={`/einzugsgebiet/${l.slug}`}
                onMouseEnter={() => setActive(l)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(l)}
                onBlur={() => setActive(null)}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-sm ring-1 transition-colors',
                  active?.slug === l.slug ? 'bg-blue text-white ring-blue' : 'bg-white text-ink ring-line hover:ring-blue/40',
                )}
              >
                <span className="truncate font-medium">{l.name.replace(' im Kinzigtal', '')}</span>
                <span className={cn('shrink-0 tabular-nums', active?.slug === l.slug ? 'text-white/80' : 'text-muted')}>{l.minutes === 0 ? 'Sitz' : `${l.minutes}′`}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
