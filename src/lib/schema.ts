import { company } from '@/content/company'
import { locations } from '@/content/locations'
import type { Service } from '@/content/services'
import type { Faq } from '@/content/faq'

const url = (path: string) => company.siteUrl + (path === '/' ? '/' : path.replace(/\/?$/, '/'))

export function localBusinessSchema() {
  const hours = company.openingHours
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    additionalType: 'https://www.wikidata.org/wiki/Q1229410',
    '@id': `${company.siteUrl}/#business`,
    name: company.name,
    legalName: company.legalName,
    url: company.siteUrl,
    logo: `${company.siteUrl}/logo.png`,
    image: `${company.siteUrl}/og-image.png`,
    telephone: company.phone.international,
    email: company.email,
    priceRange: '€€',
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
    ...(hours ? { openingHours: hours.map((h) => `${h.days} ${h.hours}`) } : {}),
    ...(company.foundedYear ? { foundingDate: String(company.foundedYear) } : {}),
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
