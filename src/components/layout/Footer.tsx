import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { company, fullAddress } from '@/content/company'
import { services } from '@/content/services'
import { places, shortName } from '@/content/places'
import { CallbackButton } from '@/features/callback/Callback'

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
 * Link in der Fußzeile: sofortige Rückmeldung beim Tippen (Markenblau, leichte Fläche) und dauerhafte
 * Hervorhebung der aktuellen Seite (aria-current="page" setzt NavLink selbst).
 */
function FooterLink({ to, children, strong }: { to: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          '-mx-2 inline-block rounded-lg px-2 py-0.5 transition-colors duration-150',
          'hover:text-ink focus-visible:bg-blue-soft/60 focus-visible:text-blue-hover active:bg-blue-soft active:text-blue-hover',
          isActive ? 'bg-blue-soft/50 font-semibold text-blue-hover' : strong ? 'text-ink' : 'text-muted',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden border-t border-line bg-glacier pb-28 lg:pb-0">
      <div className="container-site relative pt-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <HomeLink label={`${company.name}, zur Startseite`} className="inline-block">
              <Logo className="w-[170px]" />
            </HomeLink>
            <p className="mt-6 max-w-sm text-muted">
              Büroreinigung für Unternehmen im Ortenaukreis. Mit festem Ansprechpartner, eingespieltem Team und einer Garantie, die im Alltag gilt.
            </p>
            <ul className="mt-8 space-y-3 text-[0.9375rem]">
              <li>
                <a href={company.phone.href} className="inline-flex items-center gap-3 font-semibold text-ink hover:text-blue">
                  <Phone aria-hidden className="size-4 text-blue" />
                  {company.phone.display}
                </a>
                <CallbackButton className="ml-7 min-h-9" />
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="inline-flex items-center gap-3 text-ink hover:text-blue">
                  <Mail aria-hidden className="size-4 text-blue" />
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-ink">
                <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-blue" />
                <address className="not-italic">{fullAddress()}</address>
              </li>
              <li className="flex items-start gap-3 text-ink">
                <Clock aria-hidden className="mt-1 size-4 shrink-0 text-blue" />
                <span>{company.availability}, telefonisch und per E-Mail</span>
              </li>
            </ul>
          </div>

          <nav aria-label="Leistungen" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Leistungen</h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {services.map((s) => (
                <li key={s.slug}>
                  <FooterLink to={`/leistungen/${s.slug}`}>{s.name}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Unternehmen" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Unternehmen</h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Ratgeber und Werkzeuge" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Wissen und Werkzeuge</h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {knowledgeLinks.map((l) => (
                <li key={l.to}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Einzugsgebiet" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">
              <FooterLink to="/einzugsgebiet" strong>
                Einzugsgebiet
              </FooterLink>
            </h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
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
                <FooterLink to="/einzugsgebiet" strong>
                  Alle {places.length} Orte
                </FooterLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
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
                <a href="/sitemap.xml" className="hover:text-ink">
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
