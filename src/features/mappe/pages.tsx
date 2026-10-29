import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { Sparkle } from '@/components/ui/Sparkle'
import { brand, home, trustFacts, guaranteePoints } from '@/content/site'
import { company, fullAddress } from '@/content/company'
import { services } from '@/content/services'
import { zones, planIntervals, freqLabel, type PlanInterval } from '@/content/floorplan'
import { places, hq, shortName } from '@/content/places'
import { pricing, monthlyRange } from '@/content/pricing'
import { approvedQuotes, hasProof, proof } from '@/content/proof'
import { proj, OUTLINE, RHINE, toPath, VB } from '@/features/map/schematic'
import { CallbackButton } from '@/features/callback/Callback'
import { formatEuroRange } from '@/lib/format'
import { EASE_CS_ARRAY } from '@/lib/ease'
import { cn } from '@/lib/cn'
import type { ImageId } from '@/content/images'
import { PageImg, Sheet, useCount, useMappe, usePageState, useRecipient, useStagger, type PageProps } from './core'
import { Einsteckfach, FoldTab, Morgen, Notizen, Notizzettel, Nachtablauf, PergamentHinten, PergamentVorne, Uhr, VorherIntro } from './extras'
import { downloadVCard } from './vcard'

const h1 = 'text-[44px] leading-[1.02] font-medium tracking-[-0.035em]'
const h2 = 'text-[30px] leading-[1.08] font-medium tracking-[-0.03em]'
const body = 'text-[15px] leading-[1.55] text-ink-2'

/* ------------------------------------------------------------------ 1 Innen-Titel */
function Titel({ play, side, folio }: PageProps) {
  const lines = brand.promiseSet.split('\n')
  const recipient = useRecipient()
  return (
    <Sheet side={side} folio={folio} label="Ausgabe 2026">
      <div className="relative mt-6 w-[260px]">
        <Logo className="w-full" />
        <span className="absolute -top-3 left-[66px]">
          <Sparkle play={play} delay={1.6} className="size-5" />
        </span>
      </div>
      <div className="mt-auto">
        <p className="t-label mb-6">Unsere Leistungsmappe</p>
        <h2 className="text-[64px] leading-[0.98] font-medium tracking-[-0.045em]">
          {lines.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <span
                className="block transition-[transform,opacity] duration-[900ms] ease-cs"
                style={{ transform: play ? 'none' : 'translateY(105%)', opacity: play ? 1 : 0, transitionDelay: `${0.25 + i * 0.22}s` }}
              >
                {l}
              </span>
            </span>
          ))}
        </h2>
        <p className={cn(body, 'mt-8 max-w-[34ch]')}>
          Büroreinigung in {company.seat} und im {company.serviceArea}. Alles Wichtige auf einen Blick, zum Blättern und Weitergeben.
        </p>
        {recipient.company && (
          <p className="mt-8 border-t border-line pt-4 text-[15px]">
            <span className="t-label mr-3">Erstellt für</span>
            <span className="font-medium">{recipient.company}</span>
          </p>
        )}
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 2 Inhaltsverzeichnis */
const tocEntries: { id: string; title: string }[] = [
  { id: 'wer', title: 'Wer wir sind' },
  { id: 'gruender', title: 'Die Gründer' },
  { id: 'leistungen', title: 'Leistungen' },
  { id: 'buero', title: 'Büroreinigung im Detail' },
  { id: 'grundriss', title: 'Was wird bei Ihnen gereinigt?' },
  { id: 'vorher', title: 'Am Abend und am Morgen' },
  { id: 'uhr', title: 'Was passiert, während Sie schlafen' },
  { id: 'ablauf', title: 'So läuft es ab' },
  { id: 'garantie', title: 'Qualitätsgarantie' },
  { id: 'referenzen', title: 'Referenzen' },
  { id: 'konditionen', title: 'Konditionen' },
  { id: 'gebiet', title: 'Einzugsgebiet' },
  { id: 'kontakt', title: 'Kontakt' },
]
function Inhalt({ side, folio }: PageProps) {
  const { jump, previews } = useMappe()
  const [hover, setHover] = useState<number | null>(null)
  // direkt aus der Seitenliste (auch im PDF, das ohne Blätter-Kontext rendert)
  const indexOf = (id: string) => mappePages.findIndex((p) => p.id === id)
  const entries = tocEntries.filter((e) => indexOf(e.id) >= 0)
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Inhalt</p>
      <h2 className={h2}>Was Sie in dieser Mappe finden.</h2>
      <ol className="mt-10 border-t border-line">
        {entries.map((e) => {
          const idx = indexOf(e.id)
          return (
            <li key={e.id} className="border-b border-line">
              <button
                type="button"
                data-toc={e.id}
                onClick={() => jump(idx)}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(idx)}
                onBlur={() => setHover(null)}
                className="group flex w-full items-baseline justify-between gap-6 py-[11px] text-left"
              >
                <span className="text-[17px] font-medium tracking-[-0.01em] transition-colors duration-300 group-hover:text-blue">{e.title}</span>
                <span className="t-meta tabular-nums transition-colors duration-300 group-hover:text-blue">{String(idx + 1).padStart(2, '0')}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {/* Vorschau der Zielseite, klein wie eine Seite im Daumenkino */}
      <AnimatePresence>
        {hover !== null && previews[hover] && (
          <motion.img
            key={hover}
            src={previews[hover]}
            alt=""
            initial={{ opacity: 0, y: 8, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.35, ease: EASE_CS_ARRAY }}
            className="pointer-events-none absolute right-0 bottom-2 w-[132px] shadow-[0_10px_24px_-8px_rgba(30,25,15,0.35),0_1px_2px_rgba(30,25,15,0.2)]"
          />
        )}
      </AnimatePresence>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 3 Wer wir sind */
function Stat({ f, play, delay }: { f: (typeof trustFacts)[number]; play: boolean; delay: number }) {
  const v = useCount(f.value ?? 0, play, delay)
  return (
    <div className="border-t border-line pt-4">
      <p className="text-[46px] leading-none font-medium tracking-[-0.04em] tabular-nums">
        {f.prefix && <span className="mr-1.5 align-top text-[16px] tracking-normal">{f.prefix.trim()}</span>}
        {f.value !== undefined ? Math.round(v) : f.text}
        {f.suffix && <span className="text-[30px]">{f.suffix.replace(' ', ' ')}</span>}
      </p>
      <p className="t-meta mt-3 max-w-[18ch]">{f.label}</p>
    </div>
  )
}
function Wer({ play, side, folio }: PageProps) {
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Wer wir sind</p>
      <h2 className={h2}>{home.promise.statement}</h2>
      <p className={cn(body, 'mt-6')}>{home.about.text}</p>
      <div className="mt-auto grid grid-cols-2 gap-x-8 gap-y-8">
        {trustFacts.slice(0, 4).map((f, i) => (
          <Stat key={i} f={f} play={play} delay={150 * i} />
        ))}
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 4 Die Gründer */
function Gruender({ side, folio }: PageProps) {
  const founders = company.founders.slice(0, 3)
  const [hover, setHover] = useState<number | null>(null)
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">{home.about.eyebrow}</p>
      <h2 className={h2}>{home.about.headline}</h2>
      <ul className="mt-9 grid grid-cols-3 gap-5">
        {founders.map((f, i) => (
          <li key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            {/* Foto auf Papier: hebt sich beim Überfahren leicht, der Schatten wächst */}
            <div
              className="aspect-[4/5] overflow-hidden bg-surface transition-[transform,box-shadow] duration-500 ease-cs"
              style={{
                transform: hover === i ? 'translateY(-6px) rotate(-0.6deg)' : 'none',
                boxShadow: hover === i ? '0 18px 30px -12px rgba(30,25,15,0.45), 0 2px 4px rgba(30,25,15,0.15)' : '0 1px 2px rgba(30,25,15,0.18)',
              }}
            >
              <PageImg id={f.image as ImageId} />
            </div>
            <p className="mt-4 text-[17px] leading-tight font-medium tracking-[-0.015em]">{f.name}</p>
            <p className="t-meta mt-1 leading-snug">{f.role.replace('Gründer · ', '')}</p>
          </li>
        ))}
      </ul>
      <div className="relative mt-7 min-h-[150px] flex-1">
        <AnimatePresence mode="wait">
          {hover !== null && founders[hover]?.statement ? (
            <motion.blockquote
              key={hover}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: EASE_CS_ARRAY }}
              className="text-[20px] leading-[1.3] font-medium tracking-[-0.02em]"
            >
              „{founders[hover].statement}“<footer className="t-meta mt-3">{founders[hover].name}</footer>
            </motion.blockquote>
          ) : (
            <motion.ul key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid grid-cols-3 gap-5">
              {founders.map((f, i) => (
                <li key={i}>
                  <p className="t-label mb-2">Zuständig für</p>
                  {f.focus.map((x) => (
                    <p key={x} className="border-b border-line py-1.5 text-[13px] leading-snug text-ink-2">
                      {x}
                    </p>
                  ))}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 5 Leistungen (Foto erscheint auf der Gegenseite) */
function Leistungen({ side, folio }: PageProps) {
  const { setHoverService, hoverService } = useMappe()
  useEffect(() => () => setHoverService(null), [setHoverService])
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">{home.services.eyebrow}</p>
      <h2 className={h2}>{home.services.headline}</h2>
      <ol className="mt-9 border-t border-line">
        {services.map((s, i) => (
          <li key={s.slug} className="border-b border-line" onMouseEnter={() => setHoverService(i)} onMouseLeave={() => setHoverService(null)}>
            <div className="grid grid-cols-[32px_1fr] gap-x-3 py-[13px]">
              <span className={cn('t-label pt-1 transition-colors duration-300', hoverService === i && 'text-blue')}>{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="block text-[19px] leading-tight font-medium tracking-[-0.02em]">{s.name}</span>
                <span className="mt-1 block text-[13.5px] leading-snug text-ink-2">{s.short}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Sheet>
  )
}
/** Liegt auf der Gegenseite: Foto der überfahrenen Leistung wie ein loser Abzug auf dem Papier */
function LeistungenFoto() {
  const { hoverService } = useMappe()
  const s = hoverService !== null ? services[hoverService] : null
  return (
    <AnimatePresence>
      {s && (
        <motion.div
          key={s.slug}
          initial={{ opacity: 0, y: 14, rotate: 1.8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, rotate: -1.2, scale: 1 }}
          exit={{ opacity: 0, y: 6, rotate: 0 }}
          transition={{ duration: 0.45, ease: EASE_CS_ARRAY }}
          className="pointer-events-none absolute top-[150px] left-1/2 w-[420px] -translate-x-1/2 bg-[#fbfaf6] p-3 pb-8 shadow-[0_24px_40px_-16px_rgba(30,25,15,0.5),0_2px_6px_rgba(30,25,15,0.15)]"
        >
          <div className="aspect-[4/3] overflow-hidden">
            <PageImg id={s.image} width={1024} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ 6 Büroreinigung im Detail */
const detailZones = ['arbeitsplaetze', 'teekueche', 'sanitaer']
function Buero({ play, side, folio }: PageProps) {
  const svc = services[0]
  const [interval, setInterval] = usePageState<PlanInterval>('buero.interval', '3x')
  const groups = useMemo(() => {
    const tasks = zones.filter((z) => detailZones.includes(z.id)).flatMap((z) => z.tasks.map((t) => ({ ...t, zone: z.name })))
    const order = ['visit', 'weekly', 'monthly', 'request'] as const
    const map = new Map<string, { label: string; items: typeof tasks }>()
    for (const f of order)
      for (const t of tasks.filter((x) => x.freq === f)) {
        const label = freqLabel(t.freq, interval)
        if (!map.has(label)) map.set(label, { label, items: [] })
        map.get(label)!.items.push(t)
      }
    return [...map.values()]
  }, [interval])
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Büroreinigung im Detail</p>
      <h2 className={h2}>{svc.short}</h2>
      <div data-interactive className="mt-6 flex items-center gap-1 self-start border border-line-strong p-1" role="radiogroup" aria-label="Reinigungsintervall">
        {planIntervals.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={interval === p.id}
            onClick={() => setInterval(p.id)}
            className={cn('px-3 py-1.5 text-[13px] font-medium transition-colors duration-300', interval === p.id ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink')}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-6 min-h-0 flex-1 overflow-hidden">
        <motion.div layout className="space-y-4">
          {groups.map((g) => (
            <motion.section layout key={g.label} transition={{ duration: 0.5, ease: EASE_CS_ARRAY }}>
              <motion.p layout="position" className="t-label mb-1.5 text-ink">
                {g.label}
              </motion.p>
              {g.items.map((t) => (
                <motion.p
                  layout="position"
                  key={t.zone + t.task}
                  transition={{ duration: 0.5, ease: EASE_CS_ARRAY }}
                  className="flex justify-between gap-4 border-b border-line py-[5px] text-[13px] leading-snug"
                  initial={false}
                  animate={{ opacity: play ? 1 : 1 }}
                >
                  <span>{t.task}</span>
                  <span className="t-meta shrink-0 text-[12px]">{t.zone}</span>
                </motion.p>
              ))}
            </motion.section>
          ))}
        </motion.div>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 7 Grundriss */
function Grundriss({ side, folio }: PageProps) {
  const [zone, setZone] = usePageState('plan.zone', zones[0].id)
  const z = zones.find((x) => x.id === zone) ?? zones[0]
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Raum für Raum</p>
      <h2 className={h2}>Was wird bei Ihnen gereinigt?</h2>
      <svg data-interactive viewBox="0 0 800 500" className="mt-7 w-full" role="group" aria-label="Grundriss eines Büros">
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
                strokeWidth={on ? 2.5 : 1.5}
                style={{ transition: 'fill .4s, stroke .4s' }}
              />
              <text
                x={x + 14}
                y={y + 30}
                fontSize="19"
                fontWeight="500"
                fill={on ? 'var(--color-blue)' : 'var(--color-ink)'}
                style={{ fontFamily: 'var(--font-sans)', transition: 'fill .4s' }}
              >
                {r.name}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-6 min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={z.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE_CS_ARRAY }}>
            <p className="text-[17px] font-medium">{z.name}</p>
            <ul className="mt-2 border-t border-line">
              {z.tasks.map((t) => (
                <li key={t.task} className="flex justify-between gap-4 border-b border-line py-[5px] text-[13px] leading-snug">
                  <span>{t.task}</span>
                  <span className="t-meta shrink-0 text-[12px]">{freqLabel(t.freq, '3x')}</span>
                </li>
              ))}
            </ul>
            <p className="t-meta mt-2 text-[12px]">Beispiel bei Reinigung 3× pro Woche. Im Angebot passen wir alles an Ihr Objekt an.</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <FoldTab />
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 8 So läuft es ab (Video) */
const stepAt = [0, 2.6, 7.4]
function Ablauf({ play, side, folio, snapshot }: PageProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!play) {
      v.pause()
      v.currentTime = 0
      setStep(0)
      return
    }
    v.play().catch(() => {})
    const onTime = () => setStep(v.currentTime >= stepAt[2] ? 2 : v.currentTime >= stepAt[1] ? 1 : 0)
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [play])
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">So läuft es ab</p>
      <h2 className={h2}>{home.hero.sequenceTitle}.</h2>
      <div className="relative mt-7 aspect-[16/9] overflow-hidden bg-night">
        <img src="/mappe/nacht-poster.webp" alt="" width={960} height={540} draggable={false} className="photo absolute inset-0 size-full object-cover" />
        {!snapshot && <video ref={ref} src="/mappe/nacht.mp4" muted playsInline loop preload="none" aria-hidden className="photo absolute inset-0 size-full object-cover" />}
      </div>
      <ol className="mt-6 border-t border-line">
        {home.hero.sequenceSteps.map((s, i) => (
          <li key={s.title} aria-current={play && step === i ? 'step' : undefined} className="relative grid grid-cols-[32px_1fr] border-b border-line py-3">
            <span className={cn('t-label pt-1 transition-colors duration-500', play && step === i && 'text-blue')}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className={cn('block text-[17px] font-medium transition-colors duration-500', play && step === i ? 'text-ink' : 'text-ink-2')}>{s.title}</span>
              <span className="block text-[13.5px] text-ink-2">{s.text}</span>
            </span>
            <span aria-hidden className="absolute bottom-[-1px] left-0 h-px bg-ink transition-[width] duration-700 ease-cs" style={{ width: play && step === i ? '100%' : '0%' }} />
          </li>
        ))}
      </ol>
      <p className={cn(body, 'mt-auto pt-5 text-[13.5px]')}>
        Davor: Anfrage, kostenlose Besichtigung, Angebot in {company.promises.offerHours}&nbsp;Stunden und ein fester Start mit Ihrem Team.
      </p>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 9 Qualitätsgarantie */
function Garantie({ play, side, folio }: PageProps) {
  const done = useStagger(guaranteePoints.length, play, 280, 450)
  const [hover, setHover] = useState<number | null>(null)
  const detail = hover !== null ? guaranteePoints[hover] : null
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Qualitätsgarantie</p>
      <h2 className={h2}>Acht Zusagen, an denen Sie uns messen können.</h2>
      <ol className="mt-7 border-t border-line">
        {guaranteePoints.map((p, i) => {
          const on = i < done
          return (
            <li key={p.title} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="flex items-center gap-3 border-b border-line py-[9px]">
              <span
                aria-hidden
                className={cn('grid size-[18px] shrink-0 place-items-center border transition-colors duration-300', on ? 'border-ink bg-ink text-paper' : 'border-line-strong')}
              >
                <svg viewBox="0 0 12 12" className="size-[10px]">
                  <path
                    d="M2 6.5 5 9l5-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeDasharray="14"
                    strokeDashoffset={on ? 0 : 14}
                    style={{ transition: 'stroke-dashoffset .4s ease .05s' }}
                  />
                </svg>
              </span>
              <span className={cn('relative text-[15.5px] font-medium tracking-[-0.01em] transition-colors duration-300', hover === i && 'text-blue')}>
                {p.title}
                <span className="relative inline-block w-0">
                  <Sparkle play={on} className="absolute bottom-[0.25em] left-[0.35em] size-[0.7em]" />
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      <p className="t-meta mt-4 tabular-nums">
        {String(done).padStart(2, '0')} / {String(guaranteePoints.length).padStart(2, '0')} geprüft
      </p>
      <div className="mt-auto min-h-[96px]">
        <AnimatePresence mode="wait">
          {detail && (
            <motion.p
              key={detail.title}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(body, 'text-[13.5px]')}
            >
              {detail.text}
            </motion.p>
          )}
          {!detail && (
            <motion.p key="hint" data-hint initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="t-meta">
              Fahren Sie über einen Punkt, um die Erklärung zu lesen.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ Referenzen (nur mit freigegebenen Einträgen) */
function Referenzen({ side, folio }: PageProps) {
  const quotes = approvedQuotes()
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Referenzen</p>
      <h2 className={h2}>Was Kunden über uns sagen.</h2>
      <div className="mt-8 space-y-7">
        {quotes.slice(0, 3).map((q, i) => (
          <blockquote key={i} className="border-t border-line pt-4">
            <p className="text-[17px] leading-snug font-medium">„{q.quote}“</p>
            <footer className="t-meta mt-2">
              {q.name}, {q.role}, {q.company}
            </footer>
          </blockquote>
        ))}
        {proof.objects.slice(0, 4).map((o, i) => (
          <p key={'o' + i} className="border-t border-line pt-3 text-[14px]">
            {o.sector}, {o.area}, {o.place} · {o.interval} · seit {o.since}
          </p>
        ))}
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 10 Konditionen (Mini-Rechner) */
function Konditionen({ side, folio }: PageProps) {
  const [hours, setHours] = usePageState('konditionen.hours', 6)
  const [staff, setStaff] = usePageState('konditionen.staff', 1)
  const r = monthlyRange(staff, hours, 1)
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Konditionen</p>
      <h2 className={h2}>Klare Preise. Klare Bedingungen.</h2>
      <p className="mt-6 text-[40px] leading-none font-medium tracking-[-0.04em] tabular-nums">
        {pricing.hourlyRateGrossMin} bis {pricing.hourlyRateGrossMax}&nbsp;€
      </p>
      <p className="t-meta mt-2">brutto pro Mitarbeiterstunde</p>
      <ul className="mt-6 border-t border-line text-[14px]">
        {[company.contract.firstMonth, company.contract.afterwards, company.liabilityInsurance ? 'Betriebshaftpflichtversichert. Den Nachweis senden wir Ihnen auf Anfrage.' : null]
          .filter(Boolean)
          .map((t) => (
            <li key={t} className="border-b border-line py-2.5 leading-snug">
              {t}
            </li>
          ))}
      </ul>
      <div className="mt-auto bg-[#ece7dc] p-5">
        <p className="t-label text-ink">Unverbindlich rechnen</p>
        <label className="mt-4 block">
          <span className="flex justify-between text-[13px]">
            <span>Stunden pro Woche</span>
            <span className="tabular-nums">{hours}&nbsp;h</span>
          </span>
          <PaperRange min={2} max={40} value={hours} onChange={setHours} />
        </label>
        <label className="mt-2 block">
          <span className="flex justify-between text-[13px]">
            <span>Anzahl Reinigungskräfte</span>
            <span className="tabular-nums">{staff}</span>
          </span>
          <PaperRange min={1} max={4} value={staff} onChange={setStaff} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-line pt-3">
          <p>
            <span className="t-meta block">pro Monat netto</span>
            <span className="text-[17px] font-medium tabular-nums">{formatEuroRange(r.netMin, r.netMax)}</span>
          </p>
          <p>
            <span className="t-meta block">pro Monat brutto</span>
            <span className="text-[17px] font-medium tabular-nums">{formatEuroRange(r.grossMin, r.grossMax)}</span>
          </p>
        </div>
      </div>
    </Sheet>
  )
}

/** Schieberegler, selbst gezeichnet: sieht in HTML, Textur und PDF gleich aus (das Eingabefeld liegt unsichtbar darüber) */
function PaperRange({ min, max, value, onChange }: { min: number; max: number; value: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <span data-interactive className="relative mt-1 block h-5">
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
      <span aria-hidden className="absolute top-1/2 left-0 h-px bg-ink" style={{ width: `${pct}%` }} />
      <span aria-hidden className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 bg-ink" style={{ left: `${pct}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </span>
  )
}

/* ------------------------------------------------------------------ 11 Einzugsgebiet */
function Gebiet({ side, folio }: PageProps) {
  const [hover, setHover] = useState<string | null>(null)
  const h = places.find((p) => p.slug === hover)
  const [HX, HY] = proj(hq.lat, hq.lng)
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Einzugsgebiet</p>
      <h2 className={h2}>Im ganzen {company.serviceArea} zuhause.</h2>
      <div className="relative mt-4 min-h-0 flex-1">
        <svg data-interactive viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="mx-auto h-full max-h-[520px] w-auto" role="group" aria-label="Karte des Einzugsgebiets">
          <path d={toPath(RHINE, false)} fill="none" stroke="var(--color-blue)" strokeOpacity="0.5" strokeWidth="2" />
          <path d={toPath(OUTLINE)} fill="#ece7dc" stroke="var(--color-ink)" strokeOpacity="0.5" strokeWidth="1" />
          {h && h.slug !== 'offenburg' && <line x1={HX} y1={HY} x2={proj(h.lat, h.lng)[0]} y2={proj(h.lat, h.lng)[1]} stroke="var(--color-blue)" strokeWidth="1.5" />}
          {places
            .filter((p) => p.slug !== 'offenburg')
            .map((p) => {
              const [x, y] = proj(p.lat, p.lng)
              const on = hover === p.slug
              return (
                <g key={p.slug} onMouseEnter={() => setHover(p.slug)} onMouseLeave={() => setHover(null)} onClick={() => setHover(p.slug)} className="cursor-pointer">
                  <circle cx={x} cy={y} r="14" fill="transparent" />
                  <circle cx={x} cy={y} r={on ? 5.5 : p.major ? 4.5 : 3.2} fill={on ? 'var(--color-blue)' : 'var(--color-ink)'} style={{ transition: 'r .3s, fill .3s' }} />
                </g>
              )
            })}
          <circle cx={HX} cy={HY} r="14" fill="none" stroke="var(--color-blue)" />
          <circle cx={HX} cy={HY} r="7" fill="var(--color-blue)" />
          <text x={HX - 20} y={HY - 16} textAnchor="end" fontSize="17" fontWeight="500" fill="var(--color-ink)" style={{ fontFamily: 'var(--font-sans)' }}>
            Offenburg
          </text>
        </svg>
        <div className="absolute top-2 left-0 min-h-[52px]">
          <AnimatePresence mode="wait">
            {h ? (
              <motion.div
                key={h.slug}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-l border-ink pl-3"
              >
                <p className="text-[17px] font-medium">{shortName(h)}</p>
                <p className="t-meta">ca. {h.minutes}&nbsp;Min. ab Offenburg</p>
              </motion.div>
            ) : (
              <motion.p key="hint" data-hint initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="t-meta max-w-[22ch]">
                {places.length} Orte. Fahren Sie über einen Ort für die Fahrzeit.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 12 Kontakt */
function Kontakt({ side, folio }: PageProps) {
  const recipient = useRecipient()
  const p = company.founders[recipient.contact] ?? company.founders[0]
  return (
    <Sheet side={side} folio={folio}>
      <p className="t-label mb-5">Kontakt</p>
      <h2 className={h1}>Sprechen wir über Ihr Objekt.</h2>
      <div className="mt-10 flex items-start gap-5">
        <div className="aspect-[4/5] w-[112px] shrink-0 overflow-hidden bg-surface shadow-[0_1px_2px_rgba(30,25,15,0.18)]">
          <PageImg id={p.image as ImageId} />
        </div>
        <div>
          <p className="t-label">Ihr Ansprechpartner</p>
          <p className="mt-2 text-[20px] font-medium tracking-[-0.015em]">{p.name}</p>
          <p className="t-meta mt-1">{p.role.replace('Gründer · ', '')}</p>
          <p className="t-meta mt-3 inline-flex items-center gap-2 text-ink">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/40 [animation-iteration-count:2]" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            Jetzt erreichbar, {company.availability.replace(' erreichbar', '')}
          </p>
        </div>
      </div>
      <p className="mt-8 text-[30px] font-medium tracking-[-0.03em] tabular-nums">{company.phone.display}</p>
      <p className="t-meta mt-1">{company.email}</p>
      <Notizzettel name={(p.name ?? '').split(' ')[0]} />
      <div className="mt-auto flex flex-wrap gap-3">
        <a href={company.phone.href} className="btn btn-primary btn-sm">
          Anrufen
        </a>
        <CallbackButton className="btn btn-outline btn-sm" label="Rückruf anfordern" />
        <a href="/kontakt#besichtigung" className="btn btn-outline btn-sm">
          Besichtigung buchen
        </a>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ 13 Rückseite */
function Rueckseite({ side, folio }: PageProps) {
  const [saved, setSaved] = useState(false)
  return (
    <Sheet side={side} folio={folio} label="Impressum">
      <div className="mt-6 w-[220px]">
        <Logo className="w-full" />
      </div>
      <dl className="mt-10 grid grid-cols-[110px_1fr] gap-y-2 text-[14px]">
        <dt className="t-meta">Firma</dt>
        <dd>{company.legalName}</dd>
        <dt className="t-meta">Adresse</dt>
        <dd>{fullAddress()}</dd>
        <dt className="t-meta">Telefon</dt>
        <dd className="tabular-nums">{company.phone.display}</dd>
        <dt className="t-meta">E-Mail</dt>
        <dd>{company.email}</dd>
        {company.vatId && (
          <>
            <dt className="t-meta">USt-ID</dt>
            <dd className="tabular-nums">{company.vatId}</dd>
          </>
        )}
      </dl>
      <button
        type="button"
        onClick={() => {
          downloadVCard()
          setSaved(true)
        }}
        className="group mt-auto self-start text-left"
        aria-label="Visitenkarte als Kontakt speichern (vCard)"
      >
        <img
          src="/mappe/visitenkarte.webp"
          width={1024}
          height={751}
          alt=""
          draggable={false}
          className="w-[300px] transition-transform duration-500 ease-cs group-hover:-translate-y-1 group-hover:-rotate-1"
        />
        <span data-hint className="t-meta mt-2 block">
          {saved ? 'Kontakt gespeichert' : 'Klicken: Kontakt als vCard speichern'}
        </span>
      </button>
    </Sheet>
  )
}

/** Alle Seiten der Mappe in Reihenfolge. `opposite`: Inhalt, der auf der Gegenseite liegt (über deren Inhalt). */
export interface MappePage {
  id: string
  title: string
  Component: ComponentType<PageProps>
  opposite?: ComponentType
  /** Nur als Textur (durchscheinendes Pergament): keine HTML-Seite darüber */
  textureOnly?: boolean
  /** Ohne Papierhintergrund fotografieren (Durchsicht) */
  transparent?: boolean
  /** Blatt aus leichtem Papier (Pergament) */
  light?: boolean
}

const pages: MappePage[] = [
  { id: 'titel', title: 'Innen-Titel', Component: Titel },
  { id: 'inhalt', title: 'Inhalt', Component: Inhalt },
  { id: 'wer', title: 'Wer wir sind', Component: Wer },
  { id: 'gruender', title: 'Die Gründer', Component: Gruender },
  { id: 'leistungen', title: 'Leistungen', Component: Leistungen, opposite: LeistungenFoto },
  { id: 'buero', title: 'Büroreinigung im Detail', Component: Buero },
  { id: 'grundriss', title: 'Was wird bei Ihnen gereinigt?', Component: Grundriss },
  // Doppelseite mit Pergament: links die Einleitung, rechts das Pergament über dem Morgen-Foto
  { id: 'vorher', title: 'Am Abend und am Morgen', Component: VorherIntro },
  { id: 'pergament', title: 'Pergament: das Büro am Abend', Component: PergamentVorne, textureOnly: true, light: true },
  { id: 'pergament-rueck', title: 'Pergament, Rückseite', Component: PergamentHinten, textureOnly: true, light: true },
  { id: 'morgen', title: 'Das Büro am Morgen', Component: Morgen },
  { id: 'uhr', title: 'Was passiert, während Sie schlafen', Component: Uhr },
  { id: 'nacht', title: 'Ablauf der Nacht', Component: Nachtablauf },
  { id: 'ablauf', title: 'So läuft es ab', Component: Ablauf },
  { id: 'garantie', title: 'Qualitätsgarantie', Component: Garantie },
  ...(hasProof() ? [{ id: 'referenzen', title: 'Referenzen', Component: Referenzen }] : []),
  { id: 'konditionen', title: 'Konditionen', Component: Konditionen },
  { id: 'gebiet', title: 'Einzugsgebiet', Component: Gebiet },
  { id: 'kontakt', title: 'Kontakt', Component: Kontakt },
  { id: 'rueckseite', title: 'Rückseite', Component: Rueckseite },
]
// Das Einsteckfach liegt innen auf dem hinteren Einband, also immer rechts: davor bei Bedarf eine Notizseite
if (pages.length % 2 === 1) pages.push({ id: 'notizen', title: 'Notizen', Component: Notizen })
pages.push({ id: 'einsteckfach', title: 'Einsteckfach: Besichtigung anfragen', Component: Einsteckfach })

export const mappePages: MappePage[] = pages
