import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Seo, type OgType } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { Answer } from '@/components/ui/Answer'
import { Accordion } from '@/components/ui/Accordion'
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
      <Answer className="pt-12 sm:pt-16">{p.answer}</Answer>
      <section aria-label={p.name} className="py-12 sm:py-16">
        <div className="container-site">{p.children}</div>
      </section>
      <section aria-labelledby="tool-faq" className="bg-glacier py-20 sm:py-24">
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="tool-faq" className="heading-2">
              Fragen
            </h2>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={p.faqs.map((f) => ({ title: f.q, content: f.a }))} />
            {p.sources && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold tracking-tight">Quellen der Startwerte</h3>
                <ol className="mt-3 space-y-2 text-sm text-muted">
                  {p.sources.map((s, i) => (
                    <li key={s.url} className="flex gap-3">
                      <span className="w-7 shrink-0 text-right tabular-nums">{i + 1}.</span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline underline-offset-4 hover:text-blue-hover">
                          {s.title}
                        </a>
                        , {s.publisher}. Stand: {s.stand}.
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>
      <section aria-labelledby="tool-more" className="py-16 sm:py-20">
        <div className="container-site">
          <h2 id="tool-more" className="text-xl font-semibold tracking-tight">
            Passend dazu
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {p.links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft"
                >
                  {l.label}
                  <ArrowUpRight aria-hidden className="size-4 text-blue" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
