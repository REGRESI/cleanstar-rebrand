import { useParams } from 'react-router-dom'
import { company } from '@/content/company'
import { getGuide, guides } from '@/content/ratgeber'
import { Seo } from '@/components/ui/Seo'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Accordion } from '@/components/ui/Accordion'
import { Markdown, headings } from '@/features/guide/Markdown'
import { GuideCard, GuideCtaBox, GuideDownload, GuideMeta, ShareButtons, formatDate } from '@/features/guide/GuideParts'
import { absoluteUrl, articleSchema, breadcrumbSchema, faqSchema, howToSchema } from '@/lib/schema'
import { noOrphan } from '@/lib/format'
import NotFound from './NotFound'

export default function GuideArticle() {
  const { slug = '' } = useParams()
  const g = getGuide(slug)
  if (!g) return <NotFound />
  const author = company.founders[g.author]
  const path = `/ratgeber/${g.slug}`
  const trail = [
    { name: 'Startseite', path: '/' },
    { name: 'Ratgeber', path: '/ratgeber' },
    { name: g.title.split(':')[0], path },
  ]
  const toc = headings(g.body)
  const related = g.related.map((s) => guides.find((x) => x.slug === s)).filter((x) => !!x)
  const url = absoluteUrl(path)

  return (
    <>
      <Seo
        title={g.seoTitle}
        description={g.description}
        path={path}
        ogType="ratgeber"
        article={{ published: g.published, modified: g.modified, author: author.name ?? company.name }}
        schema={[
          articleSchema({
            title: g.title,
            description: g.description,
            path,
            published: g.published,
            modified: g.modified,
            author: author.name ?? company.name,
            authorRole: author.role.replace('Gründer · ', 'Gründer, '),
            image: `${company.siteUrl}/og/ratgeber.png`,
          }),
          breadcrumbSchema(trail),
          faqSchema(g.faqs),
          ...(g.howTo ? [howToSchema({ name: g.howTo.name, description: g.description, path, steps: g.howTo.steps })] : []),
        ]}
      />
      <header className="bg-paper pt-28 pb-14 sm:pt-36 lg:pt-44 lg:pb-20">
        <div className="container-site">
          <Breadcrumbs trail={trail} />
          <div className="grid-site gap-y-10">
            <div className="col-span-12 lg:col-span-10">
              <p className="t-label mb-6">{g.category === 'gruender' ? 'Ratgeber für Gründer' : 'Ratgeber für Unternehmen'}</p>
              <h1 className="t-h1 max-w-[22ch] text-[clamp(1.75rem,0.75rem+4.4vw,4.75rem)]">{noOrphan(g.title, 14)}</h1>
            </div>
            <div className="col-span-12 border-t border-line pt-6">
              <GuideMeta g={g} author={author} />
            </div>
          </div>
        </div>
      </header>

      <div className="container-site grid-site pb-24 lg:pb-36">
        <aside className="col-span-12 lg:col-span-3">
          <nav aria-labelledby="toc-title" className="border-t border-line pt-5 lg:sticky lg:top-28">
            <h2 id="toc-title" className="t-label">
              Inhalt
            </h2>
            <ol className="mt-4 space-y-2 text-[0.9375rem]">
              {[...toc, { id: 'fragen', text: 'Häufige Fragen' }, { id: 'quellen', text: 'Quellen' }].map((h, i) => (
                <li key={h.id} className="flex gap-3">
                  <span className="w-7 shrink-0 font-mono text-[0.75rem] leading-[1.6rem] text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <a href={`#${h.id}`} className="ulink text-ink-2 hover:text-ink">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="col-span-12 mt-14 lg:col-span-7 lg:col-start-5 lg:mt-0">
          <p data-answer className="t-lead measure">
            {g.answer}
          </p>

          <article className="measure mt-4 text-[1.125rem] leading-[1.65] text-ink">
            <Markdown source={g.body} />
          </article>

          {g.download && <GuideDownload id={g.download} />}

          <section aria-labelledby="fragen" className="mt-20">
            <h2 id="fragen" className="t-h3 scroll-mt-28">
              Häufige Fragen
            </h2>
            <div className="mt-8">
              <Accordion items={g.faqs.map((f) => ({ title: f.q, content: f.a }))} />
            </div>
          </section>

          <section aria-labelledby="quellen" className="mt-20">
            <h2 id="quellen" className="t-label scroll-mt-28">
              Quellen
            </h2>
            <ol className="mt-4 border-t border-line text-[0.9375rem]">
              {g.sources.map((s, i) => (
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
            <p className="mt-6 font-mono text-[0.75rem] leading-relaxed text-muted">
              Veröffentlicht am {formatDate(g.published)}, zuletzt geprüft am {formatDate(g.modified)}. Dieser Artikel dient der allgemeinen Information und ersetzt keine Rechts-
              oder Steuerberatung.
            </p>
          </section>

          <div className="mt-12 border-t border-line pt-6">
            <ShareButtons title={g.title} url={url} />
          </div>

          <div className="mt-16">
            <GuideCtaBox type={g.cta} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="pb-24 lg:pb-36">
          <div className="container-site">
            <h2 id="related-title" className="t-label">
              Weiterlesen
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-x-8 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <GuideCard g={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
