import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { ParticleSlogan } from '@/components/ui/ParticleSlogan'
import { Picture } from '@/components/ui/Picture'
import { Roll } from '@/components/ui/Roll'
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
 * Link in der Fußzeile (Navy): gedämpftes Hellblau, beim Überfahren Klarweiß mit Unterstrich, die aktuelle Seite
 * bleibt Klarweiß (aria-current="page" setzt NavLink selbst).
 */
function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => cn('ulink py-0.5 transition-colors duration-150 active:text-paper', isActive ? 'text-paper' : 'text-link-dark hover:text-paper')}
    >
      {children}
    </NavLink>
  )
}

function Column({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <nav aria-label={typeof title === 'string' ? title : undefined} className={cn('border-t border-line-dark pt-5', className)}>
      <h2 className="t-label">{title}</h2>
      <ul className="mt-4 space-y-2 text-[0.9375rem]">{children}</ul>
    </nav>
  )
}

/**
 * Seitenende (Referenz: ERA, era/06 und era/09), auf allen Seiten gleich: Ein letztes Foto füllt den Bildschirm und
 * wird beim Weiterscrollen zum Streifen am oberen Rand, darunter schiebt sich der Footer hoch. Der Footer ist die eine
 * dunkle Fläche am Seitenende (Marken-Navy): mittig klein das Logo-Symbol, darunter groß die Telefonnummer, klein
 * Adresse und Erreichbarkeit, dann der Slogan aus Lichtpartikeln in mittlerer Größe, die Linkspalten kompakt und
 * ganz unten die Rechtszeile.
 */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative">
      {/* Letztes Bild: steht, bis der Footer es zum Streifen zusammenschiebt */}
      <div className="ftr-run" aria-hidden>
        <div className="ftr-img photo sticky top-0 overflow-hidden">
          <Picture id="after-office" aspect="absolute inset-0 size-full" sizes="100vw" />
        </div>
      </div>

      <div className="ftr-body on-dark relative z-[1] bg-night pb-24 text-paper lg:pb-0">
        <div className="container-site">
          {/* Kontakt mittig: Symbol, große Telefonnummer, Adresse */}
          <div className="flex flex-col items-center pt-20 text-center lg:pt-28">
            <HomeLink label={`${company.name}, zur Startseite`} className="block text-paper">
              <Logo mono symbol className="w-11" />
            </HomeLink>
            <p className="t-label mt-10">Rufen Sie uns an</p>
            <a href={company.phone.href} className="ftr-phone mt-4 font-medium tabular-nums text-paper">
              <Roll text={company.phone.display} />
            </a>
            <p className="mt-6 text-[0.9375rem] text-muted-dark">
              {company.address.street}, {company.address.zip} {company.address.city} · 24/7 erreichbar
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <QuoteButton variant="link" className="text-paper">
                Kostenlose Besichtigung anfragen
              </QuoteButton>
              <CallbackButton dark />
              <a href={`mailto:${company.email}`} className="ulink text-[0.9375rem] text-link-dark hover:text-paper">
                {company.email}
              </a>
            </div>
            <ParticleSlogan text={brand.promiseSet} accentLast={1} textClassName="t-h1 text-center" className="mx-auto mt-20 w-full max-w-4xl lg:mt-28" />
          </div>

          {/* Links kompakt */}
          <div className="grid-site mt-20 gap-y-10 lg:mt-28">
            <Column title="Leistungen" className="col-span-6 md:col-span-3">
              {services.map((s) => (
                <li key={s.slug}>
                  <FooterLink to={`/leistungen/${s.slug}`}>{s.name}</FooterLink>
                </li>
              ))}
            </Column>
            <Column title="Unternehmen" className="col-span-6 md:col-span-3">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </Column>
            <Column title={'Wissen und\u00A0Werkzeuge'} className="col-span-6 md:col-span-3">
              {knowledgeLinks.map((l) => (
                <li key={l.to}>
                  <FooterLink to={l.to}>{l.label}</FooterLink>
                </li>
              ))}
            </Column>
            <Column title="Einzugsgebiet" className="col-span-6 md:col-span-3">
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

          <div className="mt-16 flex flex-col gap-4 border-t border-line-dark py-6 font-medium tabular-nums text-[0.8125rem] text-muted-dark sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {company.legalName}, {company.seat}
              {company.vatId ? ` · USt-ID ${company.vatId}` : ''}
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
                  <a href="/sitemap.xml" className="ulink py-0.5 text-link-dark hover:text-paper">
                    Sitemap
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
