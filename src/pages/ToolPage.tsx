import type { ReactNode } from 'react'
import { Seo, type OgType } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { FaqBlock } from '@/components/ui/FaqBlock'
import { InlineLinks } from '@/components/ui/Editorial'
import { breadcrumbSchema, faqSchema, webAppSchema } from '@/lib/schema'

export interface ToolPageProps {
  path: string
  name: string
  seoTitle: string
  description: string
  eyebrow: string
  title: string
  lead: string
  answer: string
  faqs: { q: string; a: string }[]
  sources?: { title: string; publisher: string; url: string; stand: string }[]
  links: { to: string; label: string }[]
  ogType?: OgType
  children: ReactNode
}

/** Gemeinsamer Rahmen für Rechner und Werkzeuge: Kopf, kurze Antwort, Werkzeug, FAQ, Quellen, Links */
export function ToolPage(p: ToolPageProps) {
  const trail = [
    { name: 'Startseite', path: '/' },
    { name: 'Ratgeber', path: '/ratgeber' },
    { name: p.name, path: p.path },
  ]
  return (
    <>
      <Seo
        title={p.seoTitle}
        description={p.description}
        path={p.path}
        ogType={p.ogType ?? 'tool'}
        schema={[webAppSchema({ name: p.name, description: p.description, path: p.path }), breadcrumbSchema(trail), faqSchema(p.faqs)]}
      />
      <PageHero trail={trail} eyebrow={p.eyebrow} title={p.title} lead={p.lead} />
      <Answer className="pt-20 sm:pt-28">{p.answer}</Answer>
      <section aria-label={p.name} className="section-tight">
        <div className="container-site">{p.children}</div>
      </section>
      <FaqBlock title="Fragen zum Werkzeug" id="tool-faq" items={p.faqs.map((f) => ({ title: f.q, content: f.a }))}>
        {p.sources && (
          <div className="mt-14">
            <h3 className="t-label">Quellen der Startwerte</h3>
            <ol className="mt-4 border-t border-line text-[0.9375rem]">
              {p.sources.map((s, i) => (
                <li key={s.url} className="flex gap-4 border-b border-line py-3">
                  <span className="t-label w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 text-ink-2 [overflow-wrap:anywhere]">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link">
                      {s.title}
                    </a>
                    , {s.publisher}. Stand: {s.stand}.
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </FaqBlock>
      <nav aria-labelledby="tool-more" className="container-site pb-24 lg:pb-36">
        <div className="grid-site gap-y-5 border-t border-line pt-6">
          <h2 id="tool-more" className="t-label col-span-12 lg:col-span-4">
            Passend dazu
          </h2>
          <InlineLinks className="col-span-12 lg:col-span-8" items={p.links} />
        </div>
      </nav>
    </>
  )
}
