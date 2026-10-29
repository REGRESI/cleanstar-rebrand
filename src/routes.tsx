import type { RouteRecord } from 'vite-react-ssg'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import { services } from '@/content/services'
import { pagePlaces } from '@/content/places'

const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await loader()).default })

/**
 * Alle Seiten der Website. Dieselbe Liste wird für den Live-Build (vorgerendert)
 * und für die Vorschau-Datei (Hash-Routing) verwendet.
 */
export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <Layout />,
    entry: 'src/components/layout/Layout.tsx',
    children: [
      { index: true, Component: Home, entry: 'src/pages/Home.tsx' },
      { path: 'leistungen', lazy: page(() => import('@/pages/Services')) },
      {
        path: 'leistungen/:slug',
        lazy: page(() => import('@/pages/ServiceDetail')),
        getStaticPaths: () => services.map((s) => `leistungen/${s.slug}`),
      },
      { path: 'qualitaetsgarantie', lazy: page(() => import('@/pages/Guarantee')) },
      { path: 'ablauf', lazy: page(() => import('@/pages/Process')) },
      { path: 'ueber-uns', lazy: page(() => import('@/pages/About')) },
      { path: 'einzugsgebiet', lazy: page(() => import('@/pages/Area')) },
      {
        path: 'einzugsgebiet/:ort',
        lazy: page(() => import('@/pages/Location')),
        getStaticPaths: () => pagePlaces.map((l) => `einzugsgebiet/${l.slug}`),
      },
      {
        path: 'bueroreinigung/:ort',
        lazy: page(() => import('@/pages/OfficeCity')),
        // Daten erst beim Build laden, damit sie nicht im Haupt-Bundle landen
        getStaticPaths: async () => (await import('@/content/officeCities')).officeCities.map((c) => `bueroreinigung/${c.slug}`),
      },
      { path: 'ratgeber', lazy: page(() => import('@/pages/Guides')) },
      {
        path: 'ratgeber/:slug',
        lazy: page(() => import('@/pages/GuideArticle')),
        getStaticPaths: async () => (await import('@/content/ratgeber')).guides.map((g) => `ratgeber/${g.slug}`),
      },
      { path: 'angebote-vergleichen', lazy: page(() => import('@/pages/OfferComparePage')) },
      { path: 'wechsel-rechner', lazy: page(() => import('@/pages/SwitchPage')) },
      { path: 'reinigungsfirma-kalkulieren', lazy: page(() => import('@/pages/FounderCalcPage')) },
      { path: 'fakten', lazy: page(() => import('@/pages/Facts')) },
      { path: 'angebot', lazy: page(() => import('@/pages/Quote')) },
      { path: 'karriere', lazy: page(() => import('@/pages/Careers')) },
      { path: 'partner', lazy: page(() => import('@/pages/Partner')) },
      { path: 'faq', lazy: page(() => import('@/pages/Faq')) },
      { path: 'reinigungs-check', lazy: page(() => import('@/pages/CleaningCheckPage')) },
      { path: 'leistungsmappe', lazy: page(() => import('@/pages/Leistungsmappe')) },
      { path: 'kontakt', lazy: page(() => import('@/pages/Contact')) },
      { path: 'impressum', lazy: page(() => import('@/pages/Imprint')) },
      { path: 'datenschutz', lazy: page(() => import('@/pages/Privacy')) },
      // Interne Übersicht des Design-Systems (noindex, nicht verlinkt, nicht in der Sitemap)
      { path: 'mappe-link', lazy: page(() => import('@/pages/MappeLink')) },
      { path: 'styleguide', lazy: page(() => import('@/pages/Styleguide')) },
      { path: 'labor/nacht', lazy: page(() => import('@/pages/LabNight')) },
      { path: '404', lazy: page(() => import('@/pages/NotFound')) },
      { path: '*', lazy: page(() => import('@/pages/NotFound')) },
    ],
  },
]
