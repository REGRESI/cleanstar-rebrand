import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { guideCategories, guides } from '@/content/ratgeber'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { GuideCard } from '@/features/guide/GuideParts'
import { FinalCta } from '@/components/home/FinalCta'
import { breadcrumbSchema } from '@/lib/schema'
import { absoluteUrl } from '@/lib/schema'

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Ratgeber', path: '/ratgeber' },
]

const tools = [
  { to: '/angebote-vergleichen', title: 'Angebots-Vergleich', text: 'Bis zu drei Angebote auf einheitliche Werte umrechnen.' },
  { to: '/wechsel-rechner', title: 'Wechsel-Rechner', text: 'Kündigungstermin und frühesten Wechsel berechnen.' },
  { to: '/reinigungsfirma-kalkulieren', title: 'Kalkulationsrechner für Gründer', text: 'Nötigen Stundensatz und Deckungsbeitrag berechnen.' },
  { to: '/reinigungs-check', title: 'Reinigungs-Check', text: 'Wie gut ist Ihre aktuelle Reinigung? Zwei Minuten.' },
]

export default function Guides() {
  return (
    <>
      <Seo
        title="Ratgeber Büroreinigung & Gründung"
        description="Ratgeber von CleanStar: Kosten der Büroreinigung, Leistungsverzeichnis, Hygiene, Wechsel der Reinigungsfirma und Gründung einer Reinigungsfirma, mit Quellen."
        path="/ratgeber"
        ogType="ratgeber"
        schema={[
          breadcrumbSchema(trail),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Ratgeber Reinigung',
            url: absoluteUrl('/ratgeber'),
            hasPart: guides.map((g) => ({ '@type': 'Article', headline: g.title, url: absoluteUrl(`/ratgeber/${g.slug}`) })),
          },
        ]}
      />
      <PageHero
        trail={trail}
        eyebrow="Ratgeber"
        title="Wissen rund um Reinigung, klar erklärt."
        lead="Was kostet Büroreinigung, was gehört ins Leistungsverzeichnis, wie wechseln Sie ohne Lücke, und wie gründen Sie eine Reinigungsfirma? Unsere Artikel geben klare Antworten, mit Rechenwegen und Quellen."
      />

      {guideCategories.map((c, ci) => (
        <section key={c.id} id={c.id} aria-labelledby={`cat-${c.id}`} className="section scroll-mt-24 pt-0!">
          <div className="container-site">
            <SectionHeading
              layout="rail"
              index={String(ci + 1).padStart(2, '0')}
              eyebrow={c.id === 'gruender' ? 'Für Gründer' : 'Für Unternehmen'}
              title={c.label}
              text={c.text}
              id={`cat-${c.id}`}
            />
            <ul className="mt-14 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
              {guides
                .filter((g) => g.category === c.id)
                .map((g) => (
                  <li key={g.slug} data-reveal>
                    <GuideCard g={g} />
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ))}

      <section aria-labelledby="tools-title" className="on-dark section bg-night text-paper">
        <div className="container-site">
          <SectionHeading
            layout="rail"
            index={String(guideCategories.length + 1).padStart(2, '0')}
            eyebrow="Werkzeuge"
            title={'Rechner und\u00A0Werkzeuge'}
            text="Kostenlos, ohne Anmeldung. Ihre Eingaben bleiben in Ihrem Browser."
            id="tools-title"
          />
          <ul className="mt-14 border-b border-line-dark lg:mt-20">
            {tools.map((t, i) => (
              <li key={t.to} className="border-t border-line-dark">
                <Link to={t.to} className="group grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-x-4 py-6 lg:grid-cols-12 lg:gap-x-8" data-reveal>
                  <span className="t-label lg:col-span-3">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 lg:col-span-8">
                    <span className="ulink text-[1.25rem] font-medium min-[400px]:text-[1.5rem] tracking-[-0.02em]">{t.title}</span>
                    <span className="mt-1 block text-muted-dark">{t.text}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-5 self-center transition-transform duration-500 ease-cs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 lg:col-span-1 lg:justify-self-end"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta />
    </>
  )
}
