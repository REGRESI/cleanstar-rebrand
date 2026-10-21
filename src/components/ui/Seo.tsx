import { Helmet } from 'react-helmet-async'
import { company } from '@/content/company'
import { absoluteUrl } from '@/lib/schema'

/** Open-Graph-Bild je Seitentyp (public/og/*.png, erzeugt mit scripts/generate-og.mjs) */
export type OgType = 'start' | 'leistung' | 'standort' | 'ratgeber' | 'tool' | 'partner' | 'unternehmen'

interface SeoProps {
  title: string
  description: string
  path: string
  /** Strukturierte Daten (JSON-LD) */
  schema?: object[]
  noindex?: boolean
  /** Titel ohne Firmenzusatz verwenden */
  bare?: boolean
  ogType?: OgType
  /** Artikel (Ratgeber): Open Graph als article */
  article?: { published: string; modified: string; author: string }
}

/** Zusatz hinter jedem Titel. Gesamtlänge höchstens 60 Zeichen, Keyword vorn. */
export const TITLE_SUFFIX = ' | CleanStar Offenburg'

/** Meta-Description auf höchstens 160 Zeichen kürzen (an einer Wortgrenze, mit Punkt). */
export function clampDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…'
}

/** Ersten Titel wählen, der mit Zusatz höchstens 60 Zeichen lang ist */
export const fitTitle = (options: string[]) => options.find((t) => t.length + TITLE_SUFFIX.length <= 60) ?? options[options.length - 1]

/** Erste Beschreibung wählen, die höchstens 160 Zeichen lang ist */
export const fitDescription = (options: string[]) => options.find((t) => t.length <= 160) ?? clampDescription(options[options.length - 1])

/** Metadaten pro Seite: Title, Description, Canonical, Open Graph, Twitter, JSON-LD. */
export function Seo({ title, description, path, schema = [], noindex, bare, ogType = 'unternehmen', article }: SeoProps) {
  const full = bare ? title : `${title}${TITLE_SUFFIX}`
  const canonical = absoluteUrl(path)
  const og = `${company.siteUrl}/og/${ogType}.png`
  const desc = clampDescription(description)
  return (
    <Helmet>
      <html lang="de" />
      <title>{full}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content={company.name} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={og} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      {article && <meta property="article:published_time" content={article.published} />}
      {article && <meta property="article:modified_time" content={article.modified} />}
      {article && <meta property="article:author" content={article.author} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={og} />
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
