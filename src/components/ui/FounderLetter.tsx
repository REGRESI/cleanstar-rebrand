import { Todo } from '@/components/ui/Todo'
import { founderLetter } from '@/content/letter'
import { company } from '@/content/company'
import '@/features/mappe/hand.css'

/**
 * „Ein Brief von uns“ (Über uns): kurzer Brief der drei Gründer als Karte mit weichem Schatten, große ruhige Schrift,
 * darunter die Namen in Handschrift. Echte Unterschriften fehlen noch (OFFENE-PUNKTE.md); der Text ist als Entwurf markiert.
 */
export function FounderLetter() {
  const names = company.founders.map((f) => f.name).filter(Boolean) as string[]

  return (
    <section className="section bg-surface" aria-labelledby="letter-title">
      <div className="container-site">
        <div className="card-shadow mx-auto max-w-[46rem] rounded-[10px] bg-paper px-6 py-12 sm:px-14 sm:py-16 lg:px-20 lg:py-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="letter-title" className="t-label">
              Ein Brief von uns
            </h2>
            {founderLetter.draft && <Todo title="Brieftext ist ein Entwurf und muss von den Gründern freigegeben werden">Entwurf</Todo>}
          </div>
          <p className="mt-10 text-[1.25rem] leading-[1.5] text-ink sm:text-[1.5rem]">{founderLetter.salutation}</p>
          {founderLetter.paragraphs.map((t, i) => (
            <p key={i} className="mt-6 text-[1.25rem] leading-[1.5] tracking-[-0.01em] text-ink sm:text-[1.5rem]">
              {t}
            </p>
          ))}
          <p className="mt-6 text-[1.25rem] leading-[1.5] text-ink sm:text-[1.5rem]">{founderLetter.closing}</p>

          <div className="mt-14 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {names.map((n, i) => (
              <div key={n}>
                <p
                  aria-hidden
                  className="text-[2rem] leading-none text-ink"
                  style={{ fontFamily: 'Caveat, cursive', fontWeight: 500 }}
                >
                  {n.split(' ')[0]}
                </p>
                <p className="mt-3 text-[0.9375rem] font-medium text-ink">{n}</p>
                <p className="text-[0.875rem] text-ink-2">{company.founders[i].role.replace(/^Gründer · /, '')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
