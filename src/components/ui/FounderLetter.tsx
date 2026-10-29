import { useEffect, useRef, useState } from 'react'
import { ScrubText } from '@/components/ui/ScrubText'
import { Todo } from '@/components/ui/Todo'
import { founderLetter } from '@/content/letter'
import { company } from '@/content/company'
import '@/features/mappe/hand.css'

/**
 * „Ein Brief von uns“ (Über uns): kurzer Brief der drei Gründer auf einer Papierfläche, große ruhige Schrift,
 * Absatz für Absatz im Färbe-Effekt. Darunter die Namen in Handschrift, die sich beim Erscheinen von links nach rechts
 * „schreiben“ (clip-path). Echte Unterschriften fehlen noch (OFFENE-PUNKTE.md); der Text ist als Entwurf markiert.
 */
export function FounderLetter() {
  const sign = useRef<HTMLDivElement>(null)
  const [write, setWrite] = useState(false)
  useEffect(() => {
    const el = sign.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setWrite(true), io.disconnect()), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const names = company.founders.map((f) => f.name).filter(Boolean) as string[]

  return (
    <section className="section bg-surface" aria-labelledby="letter-title">
      <div className="container-site">
        <div className="mx-auto max-w-[46rem] border border-line bg-paper px-6 py-12 sm:px-14 sm:py-16 lg:px-20 lg:py-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="letter-title" className="t-label">
              Ein Brief von uns
            </h2>
            {founderLetter.draft && <Todo title="Brieftext ist ein Entwurf und muss von den Gründern freigegeben werden">Entwurf</Todo>}
          </div>
          <p className="mt-10 text-[1.25rem] leading-[1.5] text-ink sm:text-[1.5rem]">{founderLetter.salutation}</p>
          {founderLetter.paragraphs.map((t, i) => (
            <ScrubText key={i} as="p" text={t} start="top 85%" end="top 45%" className="mt-6 text-[1.25rem] leading-[1.5] tracking-[-0.01em] sm:text-[1.5rem]" />
          ))}
          <p className="mt-6 text-[1.25rem] leading-[1.5] text-ink sm:text-[1.5rem]">{founderLetter.closing}</p>

          <div ref={sign} className="mt-14 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3">
            {names.map((n, i) => (
              <div key={n}>
                <p
                  aria-hidden
                  className="letter-sign text-[2rem] leading-none text-ink"
                  data-on={write || undefined}
                  style={{ fontFamily: 'Caveat, cursive', fontWeight: 500, ['--sd' as string]: `${i * 0.45}s` }}
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
