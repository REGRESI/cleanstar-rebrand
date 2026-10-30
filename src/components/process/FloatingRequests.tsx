import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { requests, requestReply } from '@/content/requests'
import { ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/**
 * Schwebende Anliegen (Prinzip aus Shopify Editions „schwebende Karten“), Seite Ablauf, „Ein Ansprechpartner für
 * alles“: Viele blasse, leicht unscharfe Nachrichten-Karten schweben in verschiedenen Tiefen. Beim Scrollen (und am
 * Desktop beim Überfahren) wird jeweils eine scharf, kommt nach vorn, und darunter erscheint die Antwort mit Haken.
 * Inhalte sind Beispiele (content/requests.ts, als Entwurf markiert). Reduzierte Bewegung: drei Karten mit Antworten.
 */
// Lage je Karte in der Kartenfläche (Prozent) und Tiefe (0 vorn, 2 hinten); so verteilt, dass sich Karten kaum decken
const SPOTS: { x: number; y: number; z: 0 | 1 | 2 }[] = [
  { x: 4, y: 2, z: 1 },
  { x: 54, y: 6, z: 2 },
  { x: 28, y: 22, z: 0 },
  { x: 60, y: 34, z: 1 },
  { x: 0, y: 46, z: 2 },
  { x: 36, y: 58, z: 1 },
  { x: 62, y: 72, z: 0 },
  { x: 10, y: 80, z: 1 },
]

export function FloatingRequests() {
  const run = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState(0)
  const [still, setStill] = useState(false)
  const hover = useRef<number | null>(null)

  useEffect(() => {
    const el = run.current
    if (!el) return
    if (prefersReducedMotion() || !document.documentElement.classList.contains('js-motion')) {
      setStill(true)
      return
    }
    const n = requests.length
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        if (hover.current !== null) return
        setFocus(Math.min(n - 1, Math.floor(s.progress * n)))
      },
    })
    return () => st.kill()
  }, [])

  if (still)
    return (
      <section className="section" aria-labelledby="requests-title">
        <div className="container-site">
          <Heading />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {requests.slice(0, 3).map((r) => (
              <li key={r} className="fr-card is-focus static">
                <Message text={r} reply />
              </li>
            ))}
          </ul>
        </div>
      </section>
    )

  return (
    <section className="relative bg-surface" aria-labelledby="requests-title">
      <div ref={run} className="fr-run">
        <div className="fr-stage">
          <div className="container-site grid-site h-full content-center gap-y-6 pt-20 pb-6 lg:items-center lg:pt-24 lg:pb-10">
            <div className="col-span-12 lg:col-span-4">
              <Heading />
            </div>
            <ul className="fr-field col-span-12 lg:col-span-8" aria-label="Beispiele für typische Anfragen">
              {requests.map((r, i) => {
                const s = SPOTS[i % SPOTS.length]
                const on = i === focus
                return (
                  <li
                    key={r}
                    className={cn('fr-card', on && 'is-focus')}
                    data-z={s.z}
                    style={{ '--x': `${s.x}%`, top: `${s.y}%`, '--fl': `${8 + (i % 4) * 1.6}s` } as CSSProperties}
                    aria-current={on || undefined}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== 'mouse') return
                      hover.current = i
                      setFocus(i)
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType === 'mouse') hover.current = null
                    }}
                  >
                    <Message text={r} reply={on} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Heading() {
  return (
    <>
      <p className="t-label">Beispiele für typische Anfragen</p>
      <h2 id="requests-title" className="t-h2 mt-5 max-w-[14ch]">
        Ein Ansprechpartner für alles.
      </h2>
      <p className="mt-6 max-w-[34ch] text-ink-2">Ob Termin, Schlüssel oder Nachfüllen: Sie schreiben oder rufen an, und wir kümmern uns darum.</p>
    </>
  )
}

function Message({ text, reply }: { text: string; reply?: boolean }) {
  return (
    <>
      <p className="text-[0.9375rem] leading-[1.4] text-ink">{text}</p>
      <div className="fr-reply" aria-hidden={!reply}>
        <p className="flex items-center gap-2 text-[0.875rem] font-medium text-ink">
          <span className="grid size-5 place-items-center rounded-full bg-blue text-white">
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          </span>
          {requestReply.text}
        </p>
        <p className="mt-1 pl-7 text-[0.8125rem] text-muted">{requestReply.from}</p>
      </div>
    </>
  )
}
