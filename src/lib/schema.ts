import { company } from '@/content/company'
import { places as locations } from '@/content/places'
import { services } from '@/content/services'
import { pricing } from '@/content/pricing'
import type { Service } from '@/content/services'
import type { Faq } from '@/content/faq'

const url = (path: string) => company.siteUrl + (path === '/' ? '/' : path.replace(/\/?$/, '/'))

/**
 * Unternehmen als LocalBusiness. Hinweis: „CleaningService“ ist kein Typ von schema.org, deshalb
 * LocalBusiness + ProfessionalService, ergänzt um Wikidata „Gebäudereinigung“ als additionalType.
 */
export function localBusinessSchema() {
  const hours = company.openingHours
  const sameAs = [company.profiles.google, ...company.profiles.others].filter((u) => u.trim() !== '')
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    additionalType: 'https://www.wikidata.org/wiki/Q1229410',
    '@id': `${company.siteUrl}/#business`,
    name: company.name,
    legalName: company.legalName,
    alternateName: company.shortName,
    description:
      'CleanStar ist eine Reinigungsfirma aus Offenburg, die sich auf Büroreinigung für Unternehmen im Ortenaukreis spezialisiert hat. Feste Teams, fester Ansprechpartner, Ersatzkraft bei Ausfall.',
    url: `${company.siteUrl}/`,
    logo: `${company.siteUrl}/logo.png`,
    image: `${company.siteUrl}/og/start.png`,
    telephone: company.phone.international,
    email: company.email,
    priceRange: `${pricing.hourlyRateGrossMin}–${pricing.hourlyRateGrossMax} € pro Mitarbeiterstunde (brutto)`,
    currenciesAccepted: 'EUR',
    ...(company.vatId ? { vatID: company.vatId } : {}),
    ...(company.foundedYear ? { foundingDate: String(company.foundedYear) } : {}),
    foundingLocation: { '@type': 'Place', name: company.seat },
    founder: company.founders
      .filter((f) => f.name)
      .map((f) => ({ '@type': 'Person', name: f.name, jobTitle: f.role.replace('Gründer · ', 'Gründer, ') })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.zip,
      addressLocality: company.address.city,
      addressRegion: company.address.region,
      addressCountry: company.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: company.address.geo.lat, longitude: company.address.geo.lng },
    areaServed: [{ '@type': 'AdministrativeArea', name: 'Ortenaukreis' }, ...locations.map((l) => ({ '@type': 'City', name: l.name }))],
    // Keine festen Öffnungszeiten: rund um die Uhr erreichbar
    openingHoursSpecification: hours
      ? hours.map((h) => ({ '@type': 'OpeningHoursSpecification', description: `${h.days} ${h.hours}` }))
      : [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: company.phone.international,
      email: company.email,
      contactType: 'customer service',
      areaServed: 'DE',
      availableLanguage: 'German',
      hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    },
    knowsAbout: ['Büroreinigung', 'Unterhaltsreinigung', 'Gebäudereinigung', 'Fensterreinigung', 'Treppenhausreinigung', 'Hallenreinigung', 'Hygienereinigung'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Reinigungsleistungen für Unternehmen',
      itemListElement: services.map((sv) => ({
        '@type': 'Offer',
        url: url(`/leistungen/${sv.slug}`),
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          minPrice: pricing.hourlyRateGrossMin,
          maxPrice: pricing.hourlyRateGrossMax,
          priceCurrency: 'EUR',
          unitText: 'Mitarbeiterstunde',
          valueAddedTaxIncluded: true,
        },
        itemOffered: { '@type': 'Service', name: sv.name, description: sv.seoDescription },
      })),
    },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

/** Website mit Herausgeber (für alle Seiten über die Startseite) */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${company.siteUrl}/#website`,
    url: `${company.siteUrl}/`,
    name: company.name,
    inLanguage: 'de-DE',
    publisher: { '@id': `${company.siteUrl}/#business` },
  }
}

/** Ratgeber-Artikel */
export function articleSchema(a: { title: string; description: string; path: string; published: string; modified: string; author: string; authorRole: string; image: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    url: url(a.path),
    mainEntityOfPage: url(a.path),
    image: a.image,
    datePublished: a.published,
    dateModified: a.modified,
    inLanguage: 'de-DE',
    author: { '@type': 'Person', name: a.author, jobTitle: a.authorRole, worksFor: { '@id': `${company.siteUrl}/#business` } },
    publisher: { '@id': `${company.siteUrl}/#business` },
  }
}

/** Schritt-für-Schritt-Anleitung */
export function howToSchema(h: { name: string; description: string; path: string; steps: { name: string; text: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: h.name,
    description: h.description,
    url: url(h.path),
    step: h.steps.map((st, i) => ({ '@type': 'HowToStep', position: i + 1, name: st.name, text: st.text })),
  }
}

/** Werkzeug/Rechner auf der Website */
export function webAppSchema(a: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: a.name,
    description: a.description,
    url: url(a.path),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Browser',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR' },
    provider: { '@id': `${company.siteUrl}/#business` },
  }
}

export function serviceSchema(s: Service, path: string, areaName = 'Ortenaukreis') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.name,
    description: s.seoDescription,
    url: url(path),
    provider: { '@id': `${company.siteUrl}/#business` },
    areaServed: { '@type': 'AdministrativeArea', name: areaName },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Leistungsverzeichnis ${s.name}`,
      itemListElement: s.scope.map((g) => ({
        '@type': 'OfferCatalog',
        name: g.title,
        itemListElement: g.items.map((i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: i } })),
      })),
    },
  }
}

export function faqSchema(items: Pick<Faq, 'q' | 'a'>[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: url(t.path) })),
  }
}

export const absoluteUrl = url
