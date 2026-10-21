import { useState } from 'react'
import { Search } from 'lucide-react'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Accordion } from '@/components/ui/Accordion'
import { Todo } from '@/components/ui/Todo'
import { FinalCta } from '@/components/home/FinalCta'
import { faqs, type Faq as FaqItem } from '@/content/faq'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'
import { cn } from '@/lib/cn'

const trail = [
  { name: 'Start', path: '/' },
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
        title="FAQ: Häufige Fragen zur Büroreinigung"
        description="Antworten auf häufige Fragen: Kosten, Vertragslaufzeit, Kündigung, Schlüssel, Versicherung, Reinigungsmittel, Ausfälle, Zeiten und Probereinigung."
        path="/faq"
        schema={[faqSchema(faqs.filter((f) => !f.todo)), breadcrumbSchema(trail)]}
      />
      <PageHero
        trail={trail}
        eyebrow="FAQ"
        title="Was Geschäftsführer uns vorher fragen."
        lead="Alles, was Sie vor der Zusammenarbeit wissen möchten. Ihre Frage ist nicht dabei? Rufen Sie uns an oder schreiben Sie uns."
      />
      <section className="py-20 sm:py-28">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="space-y-6 lg:sticky lg:top-32">
              <label className="relative block">
                <span className="sr-only">Fragen durchsuchen</span>
                <Search aria-hidden className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Suchen …"
                  className="w-full rounded-full bg-white py-3 pr-4 pl-11 ring-1 ring-line focus:ring-2 focus:ring-blue focus:outline-none"
                />
              </label>
              <nav aria-label="Kategorien">
                <ul className="flex flex-wrap gap-2 lg:flex-col">
                  {(['Alle', ...categories] as const).map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        aria-pressed={cat === c}
                        onClick={() => setCat(c)}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition lg:w-full lg:text-left',
                          cat === c ? 'bg-ink text-white' : 'bg-glacier text-ink hover:bg-glacier-2',
                        )}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          <div className="lg:col-span-9">
            {list.length === 0 ? (
              <p className="text-muted">Keine passende Frage gefunden. Rufen Sie uns gern an.</p>
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
