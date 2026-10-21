import { Link } from 'react-router-dom'
import { ArrowUpRight, Calculator, ClipboardCheck, Scale, CalendarClock } from 'lucide-react'
import { guideCategories, guides } from '@/content/ratgeber'
import { Seo } from '@/components/ui/Seo'
import { PageHero } from '@/components/ui/PageHero'
import { GuideCard } from '@/features/guide/GuideParts'
import { FinalCta } from '@/components/home/FinalCta'
import { breadcrumbSchema } from '@/lib/schema'
import { absoluteUrl } from '@/lib/schema'

const trail = [
  { name: 'Start', path: '/' },
  { name: 'Ratgeber', path: '/ratgeber' },
]

const tools = [
  { to: '/angebote-vergleichen', icon: Scale, title: 'Angebots-Vergleich', text: 'Bis zu drei Angebote auf einheitliche Werte umrechnen.' },
  { to: '/wechsel-rechner', icon: CalendarClock, title: 'Wechsel-Rechner', text: 'Kündigungstermin und frühesten Wechsel berechnen.' },
  { to: '/reinigungsfirma-kalkulieren', icon: Calculator, title: 'Kalkulationsrechner für Gründer', text: 'Nötigen Stundensatz und Deckungsbeitrag berechnen.' },
  { to: '/reinigungs-check', icon: ClipboardCheck, title: 'Reinigungs-Check', text: 'Wie gut ist Ihre aktuelle Reinigung? Zwei Minuten.' },
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

      {guideCategories.map((c) => (
        <section key={c.id} id={c.id} aria-labelledby={`cat-${c.id}`} className="scroll-mt-24 py-16 sm:py-20">
          <div className="container-site">
            <div className="max-w-3xl">
              <h2 id={`cat-${c.id}`} className="heading-2">
                {c.label}
              </h2>
              <p className="lead mt-4">{c.text}</p>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides
                .filter((g) => g.category === c.id)
                .map((g) => (
                  <li key={g.slug}>
                    <GuideCard g={g} />
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ))}

      <section aria-labelledby="tools-title" className="bg-glacier py-20 sm:py-24">
        <div className="container-site">
          <h2 id="tools-title" className="heading-2">
            Rechner und Werkzeuge
          </h2>
          <p className="lead mt-4 max-w-2xl">Kostenlos, ohne Anmeldung. Ihre Eingaben bleiben in Ihrem Browser.</p>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className="group flex h-full flex-col rounded-card bg-white p-6 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30 active:ring-blue"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-glacier text-blue">
                    <t.icon aria-hidden className="size-5" />
                  </span>
                  <span className="mt-4 font-semibold tracking-tight text-ink">{t.title}</span>
                  <span className="mt-1 flex-1 text-sm text-muted">{t.text}</span>
                  <ArrowUpRight aria-hidden className="mt-4 size-4 text-blue" />
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
