import { useRef, useState, type CSSProperties } from 'react'
import { Sparkle } from '@/components/ui/Sparkle'
import { Todo } from '@/components/ui/Todo'
import { guaranteePoints } from '@/content/site'
import { company } from '@/content/company'
import { spanEase, useScrollScene } from '@/lib/scrollScene'

/**
 * Qualitätsgarantie, Scroll-Stopper: Die Prüfpunkte stehen als Liste, beim Scrollen setzt sich nacheinander je ein Haken
 * (der Strich zeichnet sich), der Zähler läuft mit. Nach dem letzten Punkt landet das Siegel „Geprüft“ wie ein Stempel.
 * Die Erläuterung des aktuellen Punkts steht daneben (Handy: darunter). Ohne Bewegung: alles abgehakt, Texte in der Liste.
 */

const n = guaranteePoints.length
const count = ['Sieben', 'Acht', 'Neun'][n - 7] ?? String(n)

function Seal({ className, done }: { className: string; done: boolean }) {
  return (
    <div aria-hidden data-seal className={className}>
      <Sparkle play={done} delay={0.25} className="absolute -top-[0.4em] -right-[0.2em] z-10 size-[2.2em]" />
      <div className="gp-seal">
        <span className="text-center">
          <span className="block text-[1.6em] leading-none font-medium tracking-[-0.03em]">Geprüft</span>
          <span className="mt-[0.45em] block font-medium tabular-nums text-[0.62em] tracking-[0.02em]">
            {n} von {n}
          </span>
        </span>
      </div>
    </div>
  )
}

export function GuaranteeChecks() {
  const outer = useRef<HTMLElement>(null)
  const [done, setDone] = useState(false)
  const finished = useRef(false)

  useScrollScene(outer, (t) => {
    const root = outer.current
    if (!root) return
    const items = root.querySelectorAll<HTMLElement>('.gp-item')
    let checked = 0
    let cur = 0
    items.forEach((li, i) => {
      // Haken nacheinander zwischen 6 % und 80 % des Scrollwegs
      const a = 0.06 + i * (0.74 / n)
      const c = spanEase(t, a, a + 0.07)
      li.style.setProperty('--c', c.toFixed(3))
      if (c >= 0.98) checked++
      if (c > 0.02) cur = i
    })
    items.forEach((li, i) => li.style.setProperty('--cur', i === cur ? '1' : '0'))
    const counter = root.querySelector('[data-count]')
    if (counter && counter.textContent !== String(checked)) counter.textContent = String(checked)
    const on = t > 0.86
    root.querySelectorAll('[data-seal]').forEach((s) => s.toggleAttribute('data-on', on))
    if (on && !finished.current) {
      finished.current = true
      setDone(true)
    }
  })

  return (
    <section ref={outer} className="scene" style={{ '--scene-run': '230svh', '--scene-run-m': '170svh' } as CSSProperties} aria-labelledby="points-title">
      <div className="scene-stage">
        <div className="gp-stage container-site w-full">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="t-label mb-3 lg:mb-5">Unsere Prüfpunkte</p>
              <h2 id="points-title" className="t-h3 max-w-[22ch]">
                {count} Zusagen, an denen Sie uns messen können.
              </h2>
            </div>
            <Seal done={done} className="gp-seal-m relative mt-1 shrink-0 text-[0.62rem]" />
          </div>
          <p aria-hidden className="mt-3 font-medium tabular-nums text-[1.125rem] leading-none tracking-[-0.02em] lg:mt-10 lg:text-[2.25rem]">
            <span data-count>{n}</span> von {n} <span className="text-muted">geprüft</span>
          </p>
          <div className="gp-list mt-2 lg:mt-7">
            <ol className="border-t border-line">
              {guaranteePoints.map((p) => (
                <li key={p.title} className="gp-item grid grid-cols-[1.375rem_1fr] items-start gap-x-4 border-b border-line py-2.5 lg:grid-cols-[1.625rem_1fr] lg:py-3.5">
                  <svg viewBox="0 0 24 24" className="gp-check mt-[0.1em] size-[1.375rem] lg:size-[1.625rem]" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="11" strokeWidth="1.25" />
                    <path d="M7 12.4 10.4 15.8 17 8.6" pathLength={1} stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="min-w-0">
                    <h3 className="text-[1rem] leading-[1.3] font-medium tracking-[-0.015em] sm:text-[1.125rem] lg:text-[1.375rem]">{p.title}</h3>
                    <p className="gp-text measure mt-2 text-ink-2 max-lg:text-[0.9375rem] lg:text-[1.25rem] lg:leading-[1.45]">
                      {p.usesComplaintPeriod && company.complaintPeriod
                        ? `Passt etwas nicht, melden Sie es Ihrem Ansprechpartner. Wir reinigen kostenlos nach, innerhalb von ${company.complaintPeriod}.`
                        : p.text}
                      {p.todo && <Todo title={p.todo}>{p.todo}</Todo>}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Seal done={done} className="gp-seal-d absolute right-0 bottom-0 text-[1rem]" />
          </div>
        </div>
      </div>
    </section>
  )
}
