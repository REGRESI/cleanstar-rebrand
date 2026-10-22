import { useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
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
      <header className="bg-glacier pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="container-site max-w-4xl">
          <Breadcrumbs trail={trail} />
          <p className="eyebrow mb-5">{g.category === 'gruender' ? 'Ratgeber für Gründer' : 'Ratgeber für Unternehmen'}</p>
          <h1 className="text-[clamp(1.5rem,7.2vw,2.25rem)] leading-[1.12] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]">{noOrphan(g.title, 22)}</h1>
          <div className="mt-8">
            <GuideMeta g={g} author={author} />
          </div>
        </div>
      </header>

      <div className="container-site max-w-4xl py-12 sm:py-16">
        <p data-answer className="border-l-4 border-blue pl-5 text-lg leading-relaxed font-medium text-ink sm:text-xl">
          {g.answer}
        </p>

        <nav aria-labelledby="toc-title" className="mt-10 rounded-card bg-white p-6 ring-1 ring-line sm:p-7">
          <h2 id="toc-title" className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-muted uppercase">
            <BookOpen aria-hidden className="size-4" />
            Inhalt
          </h2>
          <ol className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {[...toc, { id: 'fragen', text: 'Häufige Fragen' }, { id: 'quellen', text: 'Quellen' }].map((h, i) => (
              <li key={h.id} className="flex gap-2 text-[0.9375rem]">
                <span className="w-7 shrink-0 text-right text-muted tabular-nums">{i + 1}.</span>
                <a href={`#${h.id}`} className="text-ink underline-offset-4 hover:text-blue-hover hover:underline">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="text-[1.0625rem] leading-relaxed text-ink/85">
          <Markdown source={g.body} />
        </article>

        {g.download && <GuideDownload id={g.download} />}

        <section aria-labelledby="fragen" className="mt-16">
          <h2 id="fragen" className="scroll-mt-28 text-2xl font-semibold tracking-tight sm:text-3xl">
            Häufige Fragen
          </h2>
          <div className="mt-6">
            <Accordion items={g.faqs.map((f) => ({ title: f.q, content: f.a }))} />
          </div>
        </section>

        <section aria-labelledby="quellen" className="mt-16">
          <h2 id="quellen" className="scroll-mt-28 text-xl font-semibold tracking-tight">
            Quellen
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-muted">
            {g.sources.map((s, i) => (
              <li key={s.url} className="flex gap-3">
                <span className="w-7 shrink-0 text-right tabular-nums">{i + 1}.</span>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-line underline-offset-4 hover:text-blue-hover">
                    {s.title}
                  </a>
                  , {s.publisher}. Stand: {s.stand}.
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs leading-relaxed text-muted">
            Veröffentlicht am {formatDate(g.published)}, zuletzt geprüft am {formatDate(g.modified)}. Dieser Artikel dient der allgemeinen Information und ersetzt keine Rechts-
            oder Steuerberatung.
          </p>
        </section>

        <div className="mt-12 border-t border-line pt-8">
          <ShareButtons title={g.title} url={url} />
        </div>

        <div className="mt-14">
          <GuideCtaBox type={g.cta} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="bg-glacier py-20 sm:py-24">
          <div className="container-site">
            <h2 id="related-title" className="heading-3">
              Weiterlesen
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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
