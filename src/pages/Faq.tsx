import { useState } from 'react'
import { ScrubStatement } from '@/components/ui/ScrubStatement'
import { statements } from '@/content/statements'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { answers } from '@/content/answers'
import { Answer } from '@/components/ui/Answer'
import { Accordion } from '@/components/ui/Accordion'
import { Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { faqs, type Faq as FaqItem } from '@/content/faq'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'
import { Roll } from '@/components/ui/Roll'

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
      <ScrubStatement {...statements.faq} id="statement-title" className="pt-6 pb-0 sm:pt-8 lg:pt-12" />
      <section className="pt-12 pb-24 lg:pt-16 lg:pb-40">
        <div className="container-site grid-site gap-y-10">
          {/* Kategorien als Chips über der Liste, daneben die Suche */}
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-10 lg:col-start-2 lg:flex-row lg:items-end lg:justify-between">
            <div role="group" aria-label="Kategorien" className="flex flex-wrap gap-2">
              {(['Alle', ...categories] as const).map((c) => (
                <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className="chip">
                  <Roll text={c} />
                </button>
              ))}
            </div>
            <label className="block w-full lg:max-w-xs">
              <span className="t-label mb-1 block">Fragen durchsuchen</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchbegriff" className="field" />
            </label>
          </div>
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
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
      <Answer question={answers.faq.question}>
        {answers.faq.text}
      </Answer>
      <FinalCta />
    </>
  )
}
