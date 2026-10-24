import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { RevealText } from '@/components/ui/RevealText'
import { company } from '@/content/company'
import { services } from '@/content/services'
import { places, shortName } from '@/content/places'
import { brand } from '@/content/site'
import { CallbackButton } from '@/features/callback/Callback'
import { QuoteButton } from '@/features/configurator/QuoteLink'

const knowledgeLinks = [
  { label: 'Ratgeber', to: '/ratgeber' },
  { label: 'Angebote vergleichen', to: '/angebote-vergleichen' },
  { label: 'Wechsel-Rechner', to: '/wechsel-rechner' },
  { label: 'Reinigungs-Check', to: '/reinigungs-check' },
  { label: 'Kalkulation für Gründer', to: '/reinigungsfirma-kalkulieren' },
  { label: 'CleanStar auf einen Blick', to: '/fakten' },
]

/** Kombiseiten „Büroreinigung [Ort]“ (siehe content/officeCities.ts) */
const officeCitySlugs = ['offenburg', 'lahr', 'kehl', 'achern', 'oberkirch']

const companyLinks = [
  { label: 'Qualitätsgarantie', to: '/qualitaetsgarantie' },
  { label: 'So arbeiten wir', to: '/ablauf' },
  { label: 'Über uns', to: '/ueber-uns' },
  { label: 'Karriere', to: '/karriere' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Unterlagen für Einkauf', to: '/kontakt#unterlagen' },
  { label: 'Angebot anfragen', to: '/angebot' },
  { label: 'Kontakt', to: '/kontakt' },
  { label: 'Partner werden', to: '/partner' },
]

/**
 * Link in der Fußzeile: Unterstrich beim Überfahren, sofortige Rückmeldung beim Tippen (Markenblau)
 * und dauerhafte Hervorhebung der aktuellen Seite (aria-current="page" setzt NavLink selbst).
 */
function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => cn('ulink py-0.5 transition-colors duration-150 active:text-blue', isActive ? 'text-ink' : 'text-muted hover:text-ink')}>
      {children}
    </NavLink>
  )
}

function Column({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <nav aria-label={typeof title === 'string' ? title : undefined} className={cn('border-t border-line pt-5', className)}>
      <h2 className="t-label">{title}</h2>
      <ul className="mt-5 space-y-2.5 text-[0.9375rem]">{children}</ul>
    </nav>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative border-t border-line bg-paper pb-24 lg:pb-0">
      <div className="container-site">
        <div className="grid-site gap-y-12 pt-20 lg:pt-28">
          <div className="col-span-12 border-t border-line pt-5 md:col-span-6 lg:col-span-4">
            <h2 className="t-label">Kontakt</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={company.phone.href} className="ulink text-[1.375rem] font-medium tracking-[-0.02em] text-ink">
                  {company.phone.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="ulink text-[0.9375rem] break-all text-ink">
                  {company.email}
                </a>
              </li>
              <li>
                <CallbackButton />
              </li>
            </ul>
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 font-medium tabular-nums text-[0.8125rem] text-muted">
              <dt>Adresse</dt>
              <dd>
                <address className="not-italic">
                  {company.address.street}
                  <br />
                  {company.address.zip} {company.address.city}
                </address>
              </dd>
              <dt>Erreichbar</dt>
              <dd>24/7, Telefon und E-Mail</dd>
              {company.vatId && (
                <>
                  <dt>USt-ID</dt>
                  <dd>{company.vatId}</dd>
                </>
              )}
            </dl>
          </div>

          <Column title="Leistungen" className="col-span-12 min-[400px]:col-span-6 md:col-span-3 lg:col-span-2">
            {services.map((s) => (
              <li key={s.slug}>
                <FooterLink to={`/leistungen/${s.slug}`}>{s.name}</FooterLink>
              </li>
            ))}
          </Column>

          <Column title="Unternehmen" className="col-span-12 min-[400px]:col-span-6 md:col-span-3 lg:col-span-2">
            {companyLinks.map((l) => (
              <li key={l.to}>
                <FooterLink to={l.to}>{l.label}</FooterLink>
              </li>
            ))}
          </Column>

          <Column title={'Wissen und\u00A0Werkzeuge'} className="col-span-12 min-[400px]:col-span-6 md:col-span-3 lg:col-span-2">
            {knowledgeLinks.map((l) => (
              <li key={l.to}>
                <FooterLink to={l.to}>{l.label}</FooterLink>
              </li>
            ))}
          </Column>

          <Column title="Einzugsgebiet" className="col-span-12 min-[400px]:col-span-6 md:col-span-3 lg:col-span-2">
            {places
              .filter((l) => l.major)
              .map((l) => (
                <li key={l.slug}>
                  {officeCitySlugs.includes(l.slug) ? (
                    <FooterLink to={`/bueroreinigung/${l.slug}`}>Büroreinigung {shortName(l)}</FooterLink>
                  ) : (
                    <FooterLink to={`/einzugsgebiet/${l.slug}`}>Reinigungsfirma {shortName(l)}</FooterLink>
                  )}
                </li>
              ))}
            <li>
              <FooterLink to="/einzugsgebiet">Alle {places.length} Orte</FooterLink>
            </li>
          </Column>
        </div>

        {/* Schluss: die Leitidee in der Display-Schrift, darunter das Logo groß und einfarbig */}
        <div className="mt-24 grid-site gap-y-10 border-t border-line pt-16 lg:mt-36 lg:pt-24">
          <RevealText as="p" text={brand.promiseSet} className="t-display col-span-12" />
          <div className="col-span-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10" data-reveal>
            <QuoteButton variant="link" className="text-lg">
              Kostenlose Besichtigung anfragen
            </QuoteButton>
            <a href={company.phone.href} className="ulink self-start font-medium tabular-nums text-[0.9375rem] text-ink sm:self-auto">
              {company.phone.display} · {company.availability}
            </a>
          </div>
        </div>
        <div className="mt-16 lg:mt-24">
          <HomeLink label={`${company.name}, zur Startseite`} className="block text-ink">
            <Logo mono className="w-full max-w-[64rem]" />
          </HomeLink>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line py-6 font-medium tabular-nums text-[0.8125rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}, {company.seat}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <FooterLink to="/impressum">Impressum</FooterLink>
            </li>
            <li>
              <FooterLink to="/datenschutz">Datenschutz</FooterLink>
            </li>
            {!__PREVIEW__ && (
              <li>
                <a href="/sitemap.xml" className="ulink py-0.5 hover:text-ink">
                  Sitemap
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </footer>
  )
}
