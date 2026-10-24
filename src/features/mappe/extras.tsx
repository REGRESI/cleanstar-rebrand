import { useRef, type CSSProperties, type PointerEvent as RPointerEvent, type KeyboardEvent as RKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkle } from '@/components/ui/Sparkle'
import { zones, freqLabel } from '@/content/floorplan'
import { EASE_CS_ARRAY } from '@/lib/ease'
import { cn } from '@/lib/cn'
import { mappeAsset } from './assets'
import './hand.css'
import { PAGE_H, PAGE_W, PageImg, Sheet, useMappe, usePageState, type PageProps } from './core'

const h2 = 'text-[30px] leading-[1.08] font-medium tracking-[-0.03em]'
const body = 'text-[15px] leading-[1.55] text-ink-2'

/** Fotos von Pergament und Morgen-Seite liegen exakt übereinander (gleicher Ausschnitt, gleiche Stelle) */
const PHOTO: CSSProperties = { position: 'absolute', left: 56, top: 236, width: 488, height: 275 }

/* ------------------------------------------------------------------ Vorher und nachher: Einleitung (links) */
export function VorherIntro({ side, folio }: PageProps) {
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Am Abend und am Morgen</p>
      <h2 className="text-[40px] leading-[1.04] font-medium tracking-[-0.035em]">
        So sieht Ihr Büro am Abend aus.
        <span className="block text-ink-2">Und so am Morgen.</span>
      </h2>
      <p className={cn(body, 'mt-8 max-w-[36ch]')}>
        Gleicher Raum, gleicher Blickwinkel. Dazwischen liegt eine Nacht, in der unser Team die Arbeitsplätze, die Teeküche und die Sanitärräume reinigt.
      </p>
      <p data-hint className="t-meta mt-auto max-w-[30ch]">
        Auf der rechten Seite liegt ein Pergament. Blättern Sie es um.
      </p>
    </Sheet>
  )
}

/** Inhalt der Morgen-Seite (auch als Durchsicht unter dem Pergament in der flachen Mappe und im PDF) */
function MorgenInner({ side, folio, play }: PageProps) {
  return (
    <div className="relative" style={{ width: PAGE_W, height: PAGE_H }}>
      <Sheet side={side} folio={folio}>
        <p className="t-label mb-5">Am Morgen, 7:00 Uhr</p>
        <h2 className={h2}>Und so am Morgen.</h2>
        <div className="mt-auto">
          <p className={cn(body, 'max-w-[38ch]')}>Freie Schreibtische, saubere Teeküche, frische Sanitärräume. Ihr Team kommt in ein Büro, an dem nichts mehr zu tun ist.</p>
        </div>
      </Sheet>
      <div style={PHOTO} className="overflow-hidden">
        <PageImg id="after-office" width={1024} />
      </div>
      <span className="absolute" style={{ left: PHOTO.left as number, top: (PHOTO.top as number) - 26 }}>
        <Sparkle play={play} delay={0.5} className="size-5" />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ Pergament, Vorderseite (rechts, über der Morgen-Seite) */
/** Papier wie Transparentpapier: milchig, leicht faserig, darunter scheint die nächste Seite durch */
const vellum: CSSProperties = {
  background:
    'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%), repeating-linear-gradient(97deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 7px), rgba(244,241,234,0.64)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35), inset 0 0 60px rgba(255,255,255,0.18)',
}

export function PergamentVorne({ side, folio }: PageProps) {
  const { is3d } = useMappe()
  return (
    <div className="relative overflow-hidden" style={{ width: PAGE_W, height: PAGE_H }}>
      {/* In der flachen Mappe und im PDF fehlt die echte Durchsicht: Die Seite darunter wird mitgezeichnet */}
      {!is3d && <MorgenInner side={side} folio={folio + 2} play={false} />}
      <div className="absolute inset-0" style={vellum} />
      <div style={{ ...PHOTO, opacity: 0.86, mixBlendMode: 'multiply' }} className="overflow-hidden">
        <PageImg id="before-office" width={1024} />
      </div>
      <p className="t-label absolute text-ink" style={{ right: 56, top: (PHOTO.top as number) + (PHOTO.height as number) + 18 }}>
        Am Abend, 18:30 Uhr
      </p>
      <p data-hint className="t-meta absolute text-ink" style={{ right: 56, bottom: 48 }}>
        Pergament umblättern
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Pergament, Rückseite (links, über der Einleitung) */
export function PergamentHinten({ side, folio }: PageProps) {
  const { is3d } = useMappe()
  return (
    <div className="relative overflow-hidden" style={{ width: PAGE_W, height: PAGE_H }}>
      {!is3d && <VorherIntro side={side} folio={folio - 2} play={false} />}
      <div className="absolute inset-0" style={vellum} />
      {/* Von hinten gesehen: das Bild spiegelverkehrt und blasser */}
      <div style={{ ...PHOTO, opacity: 0.38, mixBlendMode: 'multiply', transform: 'scaleX(-1)' }} className="overflow-hidden">
        <PageImg id="before-office" width={640} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Morgen (rechts, unter dem Pergament) */
export function Morgen(props: PageProps) {
  return <MorgenInner {...props} />
}

/* ------------------------------------------------------------------ Nacht-Uhr (links) */
export const NIGHT_START = 18 * 60 // 18:00
export const NIGHT_MIN = 30 // 18:30
export const NIGHT_MAX = 13 * 60 // 07:00 am Folgetag
export const nightEvents = [
  { at: 30, time: '18:30', title: 'Feierabend', text: 'Das Büro leert sich.' },
  { at: 75, time: '19:15', title: 'Unser Team kommt', text: 'Schlüssel und Alarm nach Protokoll.' },
  { at: 120, time: '20:00', title: 'Arbeitsplätze und Teeküche', text: 'Flächen, Papierkörbe, Böden, Spüle und Geräte.' },
  { at: 180, time: '21:00', title: 'Sanitär', text: 'WCs, Waschbecken, Spiegel, Verbrauchsmaterial.' },
  { at: 225, time: '21:45', title: 'Kontrolle nach Checkliste', text: 'Alarm an, abgeschlossen.' },
  { at: 780, time: '7:00', title: 'Ihr Team kommt', text: 'In ein sauberes Büro.' },
] as const

export const clockText = (m: number) => {
  const t = (NIGHT_START + m) % (24 * 60)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}
const eventAt = (m: number) => [...nightEvents].reverse().find((e) => m >= e.at) ?? nightEvents[0]

export function Uhr({ side, folio }: PageProps) {
  const [m, setM] = usePageState('uhr.min', NIGHT_MIN)
  const svg = useRef<SVGSVGElement>(null)
  const last = useRef<number | null>(null)
  const set = (v: number) => setM(Math.max(NIGHT_MIN, Math.min(NIGHT_MAX, Math.round(v / 5) * 5)))
  const total = NIGHT_START + m
  const hourA = (((total / 60) % 12) / 12) * 360
  const minA = ((total % 60) / 60) * 360
  // Zeiger ziehen: Winkel zur Stundenstellung, fortlaufend über 12 Uhr hinaus
  const angleOf = (e: RPointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI
    return (a + 360) % 360
  }
  const down = (e: RPointerEvent<SVGSVGElement>) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = angleOf(e)
  }
  const move = (e: RPointerEvent<SVGSVGElement>) => {
    if (last.current === null) return
    const a = angleOf(e)
    let d = a - last.current
    if (d > 180) d -= 360
    if (d < -180) d += 360
    last.current = a
    set(m + (d / 30) * 60)
  }
  const up = () => (last.current = null)
  const key = (e: RKeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(m + 15)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(m - 15)
    else return
    e.preventDefault()
    e.stopPropagation()
  }
  const ev = eventAt(m)
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Was passiert, während Sie schlafen</p>
      <h2 className={h2}>Ziehen Sie den Zeiger von 18 bis 7 Uhr.</h2>
      <div className="relative mt-8 flex flex-1 items-center justify-center">
        <svg
          ref={svg}
          data-interactive
          viewBox="0 0 400 400"
          className="w-[380px] cursor-grab touch-none outline-none select-none focus-visible:ring-2 focus-visible:ring-blue/40 active:cursor-grabbing"
          role="slider"
          tabIndex={0}
          aria-label="Uhrzeit in der Nacht"
          aria-valuemin={NIGHT_MIN}
          aria-valuemax={NIGHT_MAX}
          aria-valuenow={m}
          aria-valuetext={`${clockText(m)} Uhr: ${ev.title}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key}
        >
          <circle cx="200" cy="200" r="186" fill="#fbfaf6" stroke="var(--color-ink)" strokeOpacity="0.85" strokeWidth="2" />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2
            const long = i % 5 === 0
            const r1 = long ? 160 : 170
            return (
              <line
                key={i}
                x1={200 + Math.sin(a) * r1}
                y1={200 - Math.cos(a) * r1}
                x2={200 + Math.sin(a) * 178}
                y2={200 - Math.cos(a) * 178}
                stroke="var(--color-ink)"
                strokeOpacity={long ? 0.75 : 0.25}
                strokeWidth={long ? 2.5 : 1}
              />
            )
          })}
          {[12, 3, 6, 9].map((n, i) => {
            const a = (i / 4) * Math.PI * 2
            return (
              <text
                key={n}
                x={200 + Math.sin(a) * 134}
                y={200 - Math.cos(a) * 134 + 8}
                textAnchor="middle"
                fontSize="24"
                fontWeight="500"
                fill="var(--color-ink)"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {n}
              </text>
            )
          })}
          {/* Marken der Stationen auf dem Zifferblatt */}
          {nightEvents.map((e) => {
            const a = ((((NIGHT_START + e.at) / 60) % 12) / 12) * Math.PI * 2
            const on = m >= e.at
            return (
              <circle
                key={e.at}
                cx={200 + Math.sin(a) * 150}
                cy={200 - Math.cos(a) * 150}
                r="5"
                fill={on ? 'var(--color-blue)' : '#fbfaf6'}
                stroke="var(--color-blue)"
                strokeWidth="1.5"
              />
            )
          })}
          <line
            x1="200"
            y1="200"
            x2={200 + Math.sin((hourA * Math.PI) / 180) * 92}
            y2={200 - Math.cos((hourA * Math.PI) / 180) * 92}
            stroke="var(--color-ink)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <line
            x1="200"
            y1="200"
            x2={200 + Math.sin((minA * Math.PI) / 180) * 140}
            y2={200 - Math.cos((minA * Math.PI) / 180) * 140}
            stroke="var(--color-ink)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="200" cy="200" r="9" fill="var(--color-blue)" />
        </svg>
      </div>
      <p className="mt-4 text-center text-[44px] leading-none font-medium tracking-[-0.03em] tabular-nums">{clockText(m)}</p>
      <p className="t-meta mt-2 text-center">Beispielablauf. Die Zeiten richten sich nach Ihrem Objekt.</p>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ Ablauf der Nacht (rechts, folgt der Uhr) */
const nightPhoto = (m: number) => (m < 75 ? 'feierabend' : m < 226 ? 'reinigung' : 'morgen')

export function Nachtablauf({ side, folio }: PageProps) {
  const [m] = usePageState('uhr.min', NIGHT_MIN)
  const ev = eventAt(m)
  const shot = nightPhoto(m)
  // Zwischen Abschluss und Morgen: Das Büro ruht im Dunkeln
  const dark = m > 225 && m < NIGHT_MAX ? Math.min(1, (m - 225) / 60) : 0
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Ablauf der Nacht</p>
      <div className="relative aspect-[16/9] overflow-hidden bg-night">
        {(['feierabend', 'reinigung', 'morgen'] as const).map((k) => {
          const a = mappeAsset(`nacht-${k}`)
          return a ? (
            <img
              key={k}
              src={a.file}
              alt=""
              draggable={false}
              decoding="sync"
              className="photo absolute inset-0 size-full object-cover transition-opacity duration-700 ease-cs"
              style={{ opacity: shot === k ? 1 : 0 }}
            />
          ) : null
        })}
        <div className="absolute inset-0 bg-[#060912] transition-opacity duration-700" style={{ opacity: dark * 0.62 }} />
      </div>
      <div className="mt-6 min-h-[118px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={ev.at} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: EASE_CS_ARRAY }}>
            <p className="t-label text-blue tabular-nums">{ev.time} Uhr</p>
            <p className="mt-2 text-[26px] leading-tight font-medium tracking-[-0.025em]">{ev.title}</p>
            <p className={cn(body, 'mt-1')}>{ev.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <ol className="mt-auto border-t border-line">
        {nightEvents.map((e) => (
          <li key={e.at} className={cn('flex gap-4 border-b border-line py-[6px] text-[13px] transition-colors duration-300', ev.at === e.at ? 'text-ink' : 'text-muted')}>
            <span className="w-11 shrink-0 font-medium tabular-nums">{e.time}</span>
            <span className={cn(ev.at === e.at && 'font-medium')}>{e.title}</span>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ Notizen (links, vor dem Einsteckfach) */
export function Notizen({ side, folio }: PageProps) {
  return (
    <Sheet side={side} folio={folio} label="Notizen">
      <p className="t-label mb-5">Notizen</p>
      <p className={cn(body, 'max-w-[34ch] text-[14px]')}>Platz für Ihre Fragen zur Besichtigung. Wir gehen sie vor Ort gemeinsam durch.</p>
      <div aria-hidden className="mt-8 flex-1" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 33px, rgba(14,16,19,0.13) 33px 34px)' }} />
    </Sheet>
  )
}

/* ------------------------------------------------------------------ Einsteckfach (innen auf dem hinteren Einband, rechts) */
export function Einsteckfach() {
  const { openRequest } = useMappe()
  const [sent] = usePageState('request.sent', false)
  return (
    <div
      className="relative overflow-hidden text-paper"
      style={{ width: PAGE_W, height: PAGE_H, backgroundColor: '#1d2a44', backgroundImage: 'url(/mappe/leinen.webp)', backgroundSize: '192px' }}
    >
      {/* Vorsatz: helles Papier, mit schmalem Leinenrand */}
      <div className="absolute inset-[18px] bg-[#efeae0]" style={{ boxShadow: 'inset 0 0 40px rgba(60,45,20,0.12)' }} />
      <p className="t-label absolute top-[64px] left-[64px] text-ink">Für Ihre Anfrage</p>
      <p className="absolute top-[94px] left-[64px] max-w-[30ch] text-[24px] leading-tight font-medium tracking-[-0.02em] text-ink">
        Eine Karte liegt bereit. Ziehen Sie sie heraus.
      </p>
      {/* Karte, die oben aus dem Fach schaut */}
      <button
        type="button"
        data-request-card
        onClick={openRequest}
        className="group absolute left-[96px] top-[300px] h-[250px] w-[408px] -rotate-[2.5deg] text-left transition-transform duration-500 ease-cs hover:-translate-y-6"
        aria-label={sent ? 'Anfrage gesendet' : 'Karte herausziehen: kostenlose Besichtigung anfragen'}
      >
        <span className="absolute inset-0 bg-[#fbfaf6] shadow-[0_2px_6px_rgba(30,25,15,0.18)]" />
        <span className="relative block p-6">
          <span className="t-label block text-blue">{sent ? 'Gesendet' : 'Anfragekarte'}</span>
          <span className="mt-2 block text-[26px] leading-tight font-medium tracking-[-0.02em] text-ink">{sent ? 'Danke. Wir melden uns.' : 'Kostenlose Besichtigung'}</span>
        </span>
      </button>
      {/* Fach: Leinen, mit Naht, vor der Karte */}
      <div
        className="pointer-events-none absolute right-[18px] bottom-[18px] left-[18px] h-[360px]"
        style={{ backgroundColor: '#1a253d', backgroundImage: 'url(/mappe/leinen.webp)', backgroundSize: '192px', boxShadow: '0 -10px 18px -10px rgba(0,0,0,0.45)' }}
      >
        <div className="absolute inset-[10px] border border-dashed border-[#c9d0dc]/35" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#2a3756]" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Ausklappseite: Lasche am Grundriss */
export function FoldTab() {
  const { setFold, foldOpen } = useMappe()
  return (
    <button
      type="button"
      data-hint
      onClick={() => setFold(!foldOpen)}
      className="absolute top-[150px] right-[-56px] flex h-[160px] w-[34px] items-center justify-center bg-[#ece7dc] text-ink shadow-[-4px_0_10px_-6px_rgba(30,25,15,0.4)] transition-colors hover:bg-[#e3ddd0]"
      aria-label={foldOpen ? 'Grundriss einklappen' : 'Grundriss ausklappen'}
    >
      <span className="rotate-90 text-[12px] font-medium whitespace-nowrap uppercase tracking-[0.06em]">{foldOpen ? 'Einklappen' : 'Ausklappen'}</span>
    </button>
  )
}

/** Ausgeklappter Grundriss: groß und interaktiv, zwei Seitenbreiten (1200 × 840) */
export const WIDE_W = PAGE_W * 2
export function GrundrissGross() {
  const [zone, setZone] = usePageState('plan.zone', zones[0].id)
  const { setFold } = useMappe()
  const z = zones.find((x) => x.id === zone) ?? zones[0]
  return (
    <div className="relative overflow-hidden bg-[#f5f2eb] text-ink" style={{ width: WIDE_W, height: PAGE_H }}>
      {/* Knickkanten */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[rgba(40,30,15,0.12)] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[600px] w-px bg-[rgba(40,30,15,0.08)]" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[560px] w-10 bg-gradient-to-r from-transparent to-[rgba(40,30,15,0.06)]" />
      <div className="flex items-baseline justify-between px-14 pt-14">
        <p className="t-label">Grundriss, ausgeklappt</p>
        <button type="button" onClick={() => setFold(false)} className="t-label text-ink hover:text-blue">
          Einklappen
        </button>
      </div>
      <svg data-interactive viewBox="0 0 800 500" className="mx-auto mt-8 block w-[1060px]" role="group" aria-label="Grundriss eines Büros, groß">
        {zones.map((r) => {
          const [x, y, w, hh] = r.rect
          const on = r.id === zone
          return (
            <g
              key={r.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={r.name}
              onMouseEnter={() => setZone(r.id)}
              onFocus={() => setZone(r.id)}
              onClick={() => setZone(r.id)}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x + 2}
                y={y + 2}
                width={w - 4}
                height={hh - 4}
                fill={on ? 'rgb(26 79 224 / 0.12)' : '#f5f2eb'}
                stroke={on ? 'var(--color-blue)' : 'rgb(14 16 19 / 0.35)'}
                strokeWidth={on ? 2 : 1}
                style={{ transition: 'fill .4s, stroke .4s' }}
              />
              <text x={x + 12} y={y + 24} fontSize="15" fontWeight="500" fill={on ? 'var(--color-blue)' : 'var(--color-ink)'} style={{ fontFamily: 'var(--font-sans)' }}>
                {r.name}
              </text>
              <text x={x + 12} y={y + 42} fontSize="11" fill="var(--color-muted, #6b6f76)" style={{ fontFamily: 'var(--font-sans)' }}>
                {r.tasks.length} Aufgaben
              </text>
            </g>
          )
        })}
      </svg>
      <p className="t-meta absolute bottom-12 left-14">
        {z.name}: {z.tasks.map((t) => `${t.task} (${freqLabel(t.freq, '3x')})`)[0]}
        {z.tasks.length > 1 ? ` und ${z.tasks.length - 1} weitere, links aufgeführt` : ''}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Notizzettel auf der Kontaktseite */
export function Notizzettel({ name }: { name: string }) {
  return (
    <div className="group absolute top-[300px] right-[-6px] w-[214px] rotate-[3deg] transition-transform duration-500 ease-cs hover:rotate-[1.5deg]">
      <div
        className="relative px-5 pt-6 pb-5 shadow-[0_10px_18px_-10px_rgba(30,25,15,0.45),0_1px_2px_rgba(30,25,15,0.18)]"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(120,100,40,0.035) 0 1px, transparent 1px 3px), linear-gradient(160deg, #fff6c8, #f8eaa6)',
        }}
      >
        {/* Klebestreifen */}
        <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-white/55 shadow-[0_1px_2px_rgba(0,0,0,0.08)]" />
        <p className="text-[25px] leading-[1.12] text-[#24304a]" style={{ fontFamily: 'var(--font-hand)' }}>
          Rufen Sie mich einfach an. Ich nehme mir Zeit.
        </p>
        <p className="mt-2 text-right text-[27px] leading-none text-[#24304a]" style={{ fontFamily: 'var(--font-hand)' }}>
          {name}
        </p>
        {/* Ecke hebt sich beim Überfahren */}
        <span
          aria-hidden
          className="absolute right-0 bottom-0 size-0 transition-[width,height] duration-500 ease-cs group-hover:size-7"
          style={{ background: 'linear-gradient(135deg, #f8eaa6 0%, #f8eaa6 48%, #d9cb86 50%, rgba(40,30,10,0.18) 52%, transparent 70%)' }}
        />
      </div>
    </div>
  )
}

/** Ausklappseite auf dem Smartphone: der Grundriss als Vollbild, darunter die Aufgaben des gewählten Raums */
export function GrundrissVollbild({ onClose }: { onClose: () => void }) {
  const [zone, setZone] = usePageState('plan.zone', zones[0].id)
  const z = zones.find((x) => x.id === zone) ?? zones[0]
  return (
    <div className="mx-auto max-w-[720px] px-4 pt-5 pb-10 text-ink">
      <div className="flex items-baseline justify-between">
        <p className="t-label">Grundriss, ausgeklappt</p>
        <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
          Einklappen
        </button>
      </div>
      <p className="mt-5 text-[26px] leading-tight font-medium tracking-[-0.025em]">Was wird bei Ihnen gereinigt?</p>
      <svg viewBox="0 0 800 500" className="mt-5 w-full" role="group" aria-label="Grundriss eines Büros">
        {zones.map((r) => {
          const [x, y, w, hh] = r.rect
          const on = r.id === zone
          return (
            <g
              key={r.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={r.name}
              onClick={() => setZone(r.id)}
              onFocus={() => setZone(r.id)}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x + 2}
                y={y + 2}
                width={w - 4}
                height={hh - 4}
                fill={on ? 'rgb(26 79 224 / 0.12)' : '#f5f2eb'}
                stroke={on ? 'var(--color-blue)' : 'rgb(14 16 19 / 0.35)'}
                strokeWidth={on ? 3 : 1.5}
              />
              <text x={x + 12} y={y + 32} fontSize="24" fontWeight="500" fill={on ? 'var(--color-blue)' : 'var(--color-ink)'} style={{ fontFamily: 'var(--font-sans)' }}>
                {r.name}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-6 text-[19px] font-medium">{z.name}</p>
      <ul className="mt-2 border-t border-line">
        {z.tasks.map((t) => (
          <li key={t.task} className="flex justify-between gap-4 border-b border-line py-2 text-[15px] leading-snug">
            <span>{t.task}</span>
            <span className="t-meta shrink-0">{freqLabel(t.freq, '3x')}</span>
          </li>
        ))}
      </ul>
      <p className="t-meta mt-3">Beispiel bei Reinigung 3× pro Woche. Im Angebot passen wir alles an Ihr Objekt an.</p>
    </div>
  )
}
