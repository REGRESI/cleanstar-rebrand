import { Helmet } from 'react-helmet-async'
import { company } from '@/content/company'
import { absoluteUrl } from '@/lib/schema'

interface SeoProps {
  title: string
  description: string
  path: string
  /** Strukturierte Daten (JSON-LD) */
  schema?: object[]
  noindex?: boolean
  /** Titel ohne Firmenzusatz verwenden */
  bare?: boolean
}

/** Metadaten pro Seite: Title, Description, Canonical, Open Graph, Twitter, JSON-LD. */
export function Seo({ title, description, path, schema = [], noindex, bare }: SeoProps) {
  const full = bare ? title : `${title} | ${company.name}`
  const canonical = absoluteUrl(path)
  const og = `${company.siteUrl}/og-image.png`
  return (
    <Helmet>
      <html lang="de" />
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content={company.name} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={og} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={og} />
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
