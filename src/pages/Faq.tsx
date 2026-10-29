import { useState } from 'react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { answers } from '@/content/answers'
import { Answer } from '@/components/ui/Answer'
import { Accordion } from '@/components/ui/Accordion'
import { Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { faqs, type Faq as FaqItem } from '@/content/faq'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'
import { cn } from '@/lib/cn'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'FAQ', path: '/faq' },
]
const categories = Array.from(new Set(faqs.map((f) => f.category))) as FaqItem['category'][]

export default function Faq() {
  const [cat, setCat] = useState<FaqItem['category'] | 'Alle'>('Alle')
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const list = faqs.filter((f) => (cat === 'Alle' || f.category === cat) && (!term || (f.q + f.a).toLowerCase().includes(term)))

  return (
    <>
      <Seo
        title="FAQ Büroreinigung: Häufige Fragen"
        description="Antworten auf häufige Fragen zur Büroreinigung: Kosten, Vertragslaufzeit, Kündigung, Schlüssel, Versicherung, Reinigungsmittel, Ausfälle und Reinigungszeiten."
        path="/faq"
        schema={[faqSchema(faqs.filter((f) => !f.todo)), breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="FAQ"
        title="Was Geschäftsführer uns vorher fragen."
        lead="Alles, was Sie vor der Zusammenarbeit wissen möchten. Ihre Frage ist nicht dabei? Rufen Sie uns an oder schreiben Sie uns."
      />
      <Answer question={answers.faq.question} bottom="pb-16 sm:pb-20 lg:pb-24">
        {answers.faq.text}
      </Answer>
      <section className="pt-12 pb-24 lg:pt-16 lg:pb-40">
        <div className="container-site grid-site gap-y-12">
          <aside className="col-span-12 lg:col-span-3">
            <div className="space-y-10 lg:sticky lg:top-28">
              <label className="block">
                <span className="t-label mb-1 block">Fragen durchsuchen</span>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchbegriff" className="field" />
              </label>
              <nav aria-label="Kategorien">
                <p className="t-label mb-3">Kategorien</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-1 lg:flex-col">
                  {(['Alle', ...categories] as const).map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        aria-pressed={cat === c}
                        onClick={() => setCat(c)}
                        className={cn('ulink py-1.5 text-left text-[1rem] transition-colors', cat === c ? 'bg-[length:100%_1px] text-ink' : 'text-muted hover:text-ink')}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            {list.length === 0 ? (
              <p className="border-t border-line pt-6 text-ink-2">Keine passende Frage gefunden. Rufen Sie uns gern an.</p>
            ) : (
              <Accordion
                headingLevel="h2"
                key={cat + term}
                items={list.map((f) => ({
                  title: f.q,
                  content: (
                    <>
                      {f.a}
                      {f.todo && <Todo title={f.todo}>{f.todo}</Todo>}
                    </>
                  ),
                }))}
              />
            )}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
