import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Fact } from '@/components/ui/Todo'
import { company, fullAddress } from '@/content/company'
import { services } from '@/content/services'
import { locations } from '@/content/locations'

const companyLinks = [
  { label: 'Qualitätsgarantie', to: '/qualitaetsgarantie' },
  { label: 'So arbeiten wir', to: '/ablauf' },
  { label: 'Über uns', to: '/ueber-uns' },
  { label: 'Karriere', to: '/karriere' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Angebot anfragen', to: '/angebot' },
  { label: 'Kontakt', to: '/kontakt' },
  { label: 'Partner werden', to: '/partner' },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden border-t border-line bg-glacier pb-28 lg:pb-0">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="container-site relative pt-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo className="w-[170px]" />
            <p className="mt-6 max-w-sm text-muted">
              Büroreinigung für Unternehmen im Ortenaukreis. Mit festem Ansprechpartner, eingespieltem Team und einer Garantie, die im Alltag gilt.
            </p>
            <ul className="mt-8 space-y-3 text-[0.9375rem]">
              <li>
                <a href={company.phone.href} className="inline-flex items-center gap-3 font-semibold text-ink hover:text-blue">
                  <Phone aria-hidden className="size-4 text-blue" />
                  {company.phone.display}
                </a>
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
                <span>
                  <Fact
                    value={company.openingHours?.map((h) => `${h.days}: ${h.hours}`).join(' · ')}
                    fallback="Telefonisch erreichbar, gern auch per E-Mail"
                    todo="Öffnungszeiten in company.ts eintragen"
                  />
                </span>
              </li>
            </ul>
          </div>

          <nav aria-label="Leistungen" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Leistungen</h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/leistungen/${s.slug}`} className="text-muted transition hover:text-ink">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Unternehmen" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Unternehmen</h2>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-muted transition hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Einzugsgebiet" className="lg:col-span-4">
            <h2 className="text-sm font-semibold text-ink">
              <Link to="/einzugsgebiet" className="hover:text-blue">
                Einzugsgebiet Ortenaukreis
              </Link>
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[0.9375rem]">
              {locations.map((l) => (
                <li key={l.slug}>
                  <Link to={`/einzugsgebiet/${l.slug}`} className="text-muted transition hover:text-ink">
                    Büroreinigung {l.name.replace(' im Kinzigtal', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}, {company.seat}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link to="/impressum" className="hover:text-ink">
                Impressum
              </Link>
            </li>
            <li>
              <Link to="/datenschutz" className="hover:text-ink">
                Datenschutz
              </Link>
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
