import { useRef, type CSSProperties } from 'react'
import { EASE_CS } from '@/lib/ease'
import { span, useScrollScene } from '@/lib/scrollScene'

/**
 * Ablauf, Scroll-Stopper „Die Nacht-Uhr“: Links läuft eine schlichte Uhr beim Scrollen von 18:00 bis 7:00, rechts
 * wechseln synchron Foto und Zeile. Die Uhrzeiten sind ein Beispielablauf und so gekennzeichnet.
 * Ohne Bewegung: Uhr auf 7:00, Morgenfoto, alle Zeilen als Liste.
 */

/** Minuten ab 18:00 */
const lines = [
  { at: 30, time: '18:30', text: 'Ihr Team geht.' },
  { at: 75, time: '19:15', text: 'Wir kommen, Schlüssel und Alarm nach Protokoll.' },
  { at: 225, time: '21:45', text: 'Kontrolle nach Checkliste, alles abgeschlossen.' },
  { at: 780, time: '7:00', text: 'Ihr Büro ist bereit.' },
]
// Scrollfortschritt → Uhrzeit: an jeder Zeile wird die Uhr langsamer (Bewegungskurve der Website je Abschnitt)
const KEYS: [number, number][] = [
  [0, 0],
  [0.14, 30],
  [0.36, 75],
  [0.6, 225],
  [0.88, 780],
]
function minutesAt(t: number) {
  for (let i = 1; i < KEYS.length; i++) {
    const [t1, m1] = KEYS[i]
    const [t0, m0] = KEYS[i - 1]
    if (t <= t1) return m0 + (m1 - m0) * EASE_CS(span(t, t0, t1))
  }
  return KEYS[KEYS.length - 1][1]
}
const END = 780

const photos = [
  { src: '/mappe/nacht-reinigung.webp', alt: 'Reinigung am Abend in einem Büro mit gedimmtem Licht' },
  { src: '/mappe/nacht-feierabend.webp', alt: 'Büro nach Feierabend, die Arbeitsplätze sind leer' },
  { src: '/mappe/nacht-morgen.webp', alt: 'Sauberes Büro am Morgen im ersten Tageslicht' },
]

const hands = (m: number) => {
  const total = 18 * 60 + m
  return { hour: ((total / 60) % 12) * 30, minute: (total % 60) * 6 }
}
const fmt = (m: number) => {
  const total = Math.round((18 * 60 + m) / 5) * 5
  return `${Math.floor(total / 60) % 24}:${String(total % 60).padStart(2, '0')}`
}

export function NightClock() {
  const outer = useRef<HTMLElement>(null)
  const end = hands(END)

  useScrollScene(outer, (t) => {
    const root = outer.current
    if (!root) return
    const m = minutesAt(t)
    const h = hands(m)
    root.querySelector('[data-hour]')?.setAttribute('transform', `rotate(${h.hour.toFixed(2)} 100 100)`)
    root.querySelector('[data-minute]')?.setAttribute('transform', `rotate(${h.minute.toFixed(2)} 100 100)`)
    const read = root.querySelector('[data-read]')
    const txt = fmt(m)
    if (read && read.textContent !== txt) read.textContent = txt
    // Fotos: Feierabend bis kurz nach 19 Uhr, dann Reinigung, gegen Morgen das helle Büro
    const ph = root.querySelectorAll<HTMLElement>('[data-ph]')
    ph[0]?.style.setProperty('--o', '1')
    ph[1]?.style.setProperty('--o', (1 - span(m, 50, 80)).toFixed(3))
    ph[2]?.style.setProperty('--o', span(m, 620, 760).toFixed(3))
    // Zeilen: erreicht = hell, aktuell = einzige sichtbare auf dem Handy
    let cur = 0
    lines.forEach((l, i) => {
      if (m >= l.at - 4) cur = i
    })
    root.querySelectorAll<HTMLElement>('.night-lines li').forEach((li, i) => {
      li.style.setProperty('--a', m >= lines[i].at - 4 ? '1' : '0')
      li.style.setProperty('--cur', i === cur ? '1' : '0')
    })
  })

  return (
    <section
      ref={outer}
      className="scene on-dark bg-night text-paper"
      style={{ '--scene-run': '230svh', '--scene-run-m': '150svh' } as CSSProperties}
      aria-labelledby="night-title"
    >
      <div className="scene-stage">
        <div className="night-stage container-site grid-site w-full items-center gap-y-6 md:gap-y-10">
          <div className="col-span-12 md:col-span-5">
            <p className="t-label mb-3 md:mb-5">Beispielablauf</p>
            <h2 id="night-title" className="t-h3 max-w-[16ch]">
              Eine Nacht in Ihrem Büro.
            </h2>
            <div className="mt-4 flex items-center gap-6 md:mt-10 md:block">
              <svg viewBox="0 0 200 200" className="night-clock shrink-0" role="img" aria-label="Uhr, die im Beispielablauf von 18 Uhr bis 7 Uhr morgens läuft">
                <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" />
                {Array.from({ length: 12 }, (_, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1={i % 3 === 0 ? 10 : 12}
                    x2="100"
                    y2={i % 3 === 0 ? 24 : 19}
                    stroke="currentColor"
                    strokeOpacity={i % 3 === 0 ? 0.85 : 0.4}
                    strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                    strokeLinecap="round"
                    transform={`rotate(${i * 30} 100 100)`}
                  />
                ))}
                <line data-hour x1="100" y1="106" x2="100" y2="54" stroke="currentColor" strokeWidth="5" strokeLinecap="round" transform={`rotate(${end.hour} 100 100)`} />
                <line data-minute x1="100" y1="110" x2="100" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${end.minute} 100 100)`} />
                <circle cx="100" cy="100" r="4.5" className="fill-[var(--color-blue-on-dark)]" />
              </svg>
              <p aria-hidden className="font-medium tabular-nums text-[2.25rem] leading-none tracking-[-0.04em] md:mt-6 md:text-[3rem]" data-read>
                7:00
              </p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-7">
            <div className="night-photos">
              {photos.map((p, i) => (
                <img key={p.src} data-ph={i} src={p.src} alt={p.alt} width={1200} height={676} loading="lazy" decoding="async" />
              ))}
            </div>
            <ol className="night-lines mt-4 border-t border-line-dark md:mt-8">
              {lines.map((l) => (
                <li key={l.time} className="flex gap-5 border-b border-line-dark py-3 md:py-3.5">
                  <time className="w-14 shrink-0 font-medium tabular-nums text-blue-on-dark">{l.time}</time>
                  <span>{l.text}</span>
                </li>
              ))}
            </ol>
            <p className="t-meta mt-2 text-muted-dark md:mt-5">Uhrzeiten als Beispiel. Ihre Einsatzzeiten legen wir gemeinsam fest.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
