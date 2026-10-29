import { useState } from 'react'
import { Picture } from '@/components/ui/Picture'
import { ways, useOfficeWay } from '@/features/office/officeWay'
import { cn } from '@/lib/cn'

/**
 * „Welches Büro betreuen wir für Sie?“ direkt nach dem Färbe-Text: drei große, nummerierte Wege, schlicht typografisch
 * mit Haarlinien. Beim Überfahren (Desktop) erscheint das passende Foto. Ein Klick wählt den Weg; die Startseite
 * stellt danach passende Leistungen voran, der Abschluss nennt einen passenden Satz, und der Konfigurator startet
 * mit einer passenden Objektgröße. Erneuter Klick hebt die Wahl auf.
 */
export function OfficeWays() {
  const [way, setWay] = useOfficeWay()
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? (way ? ways.findIndex((w) => w.id === way.id) : 0)

  return (
    <section className="section" aria-labelledby="ways-title">
      <div className="container-site">
        <div className="grid-site gap-y-6">
          <p className="t-label col-span-12 lg:col-span-3 lg:pt-3" data-reveal>
            Ihr Büro
          </p>
          <div className="col-span-12 lg:col-span-9">
            <h2 id="ways-title" className="t-h1 max-w-[18ch]" data-reveal>
              Welches Büro betreuen wir für Sie?
            </h2>
            <p className="t-lead mt-6 max-w-[52ch] text-ink-2" data-reveal>
              Wählen Sie, was am ehesten passt. Wir zeigen Ihnen dann die passenden Leistungen zuerst.
            </p>
          </div>
        </div>

        <div className="grid-site mt-14 lg:mt-20">
          <ul className="col-span-12 border-b border-line lg:col-span-8" onMouseLeave={() => setHover(null)}>
            {ways.map((w, i) => {
              const on = way?.id === w.id
              return (
                <li key={w.id} className="relative border-t border-line">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setWay(on ? null : w.id)}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    className="group grid w-full grid-cols-[3rem_1fr] items-baseline gap-x-4 py-8 text-left sm:grid-cols-[5rem_1fr_auto] sm:py-10"
                    data-reveal
                  >
                    <span className={cn('font-medium tabular-nums text-[1.75rem] leading-none tracking-[-0.03em] transition-colors duration-300 sm:text-[2.5rem]', on ? 'text-blue' : 'text-muted group-hover:text-ink')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="t-h3 block text-ink">{w.title}</span>
                      <span className="mt-3 block max-w-[52ch] text-ink-2">{w.text}</span>
                    </span>
                    <span className={cn('col-start-2 mt-4 text-[0.875rem] font-medium sm:col-start-3 sm:mt-0 sm:self-center', on ? 'text-blue' : 'text-muted')}>
                      {on ? 'Ausgewählt · aufheben' : 'Auswählen'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28 pl-8">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {ways.map((w, i) => (
                  <div key={w.id} aria-hidden className={cn('absolute inset-0 transition-opacity duration-700 ease-cs', shown === i ? 'opacity-100' : 'opacity-0')}>
                    <Picture id={w.image} compact aspect="h-full w-full" sizes="30vw" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-[0.875rem] text-muted" aria-live="polite">
          {way ? `Ausgewählt: ${way.title}. Die Leistungen weiter unten stehen in passender Reihenfolge.` : 'Ihre Wahl gilt nur für diesen Besuch und lässt sich jederzeit ändern.'}
        </p>
      </div>
    </section>
  )
}
