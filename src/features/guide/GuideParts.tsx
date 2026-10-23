import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import downloads from 'virtual:downloads'
import { company, type Person } from '@/content/company'
import type { Guide, GuideCta } from '@/content/ratgeber'
import { readingMinutes } from '@/content/ratgeber'
import { Picture } from '@/components/ui/Picture'
import type { ImageId } from '@/content/images'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { checkQuestions } from '@/content/check'

export const formatDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

/** Autor, Datum und Lesedauer */
export function GuideMeta({ g, author }: { g: Guide; author: Person }) {
  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
      <span className="flex items-end gap-4">
        <Picture id={author.image as ImageId} compact ratio="4:5" className="w-12 shrink-0" sizes="48px" />
        <span>
          <span className="block font-medium text-ink">{author.name}</span>
          <span className="t-label block">{author.role.replace('Gründer · ', 'Gründer, ')}</span>
        </span>
      </span>
      <span className="t-label">
        <time dateTime={g.modified}>{formatDate(g.modified)}</time> · {readingMinutes(g)}
        {'\u00A0'}Min. Lesezeit
      </span>
    </div>
  )
}

/** Teilen ohne Skripte von Drittanbietern: einfache Textlinks, auf dem Handy das System-Teilen-Menü */
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const [native, setNative] = useState(false)
  useEffect(() => setNative(typeof navigator !== 'undefined' && 'share' in navigator), [])
  const enc = encodeURIComponent
  const cls = 'ulink py-1 text-[0.9375rem] text-ink'
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
      <span className="t-label">Artikel teilen</span>
      {native && (
        <button type="button" className={cls} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          Teilen
        </button>
      )}
      <a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a className={cls} href={`https://wa.me/?text=${enc(title + ' ' + url)}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className={cls} href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}>
        E-Mail
      </a>
      <button
        type="button"
        className={cls}
        onClick={() => {
          navigator.clipboard?.writeText(url).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
          })
        }}
      >
        <span aria-live="polite">{copied ? 'Kopiert' : 'Link kopieren'}</span>
      </button>
    </div>
  )
}

const ctas: Record<GuideCta, { title: string; text: string; to?: string; label: string; quote?: boolean }> = {
  angebot: {
    title: 'Sie suchen eine Reinigungsfirma im Ortenaukreis?',
    text: `Wir besichtigen Ihr Büro kostenlos und schicken Ihnen innerhalb von ${company.promises.offerHours} Stunden ein Angebot mit Leistungsverzeichnis. Im ersten Monat können Sie jederzeit kündigen.`,
    label: 'Kostenloses Angebot',
    quote: true,
  },
  check: {
    title: 'Wie gut ist Ihre aktuelle Reinigung?',
    text: `${checkQuestions.length} kurze Fragen, zwei Minuten, eine ehrliche Auswertung mit konkreten Hinweisen. Ohne Anmeldung.`,
    to: '/reinigungs-check',
    label: 'Zum Reinigungs-Check',
  },
  vergleich: {
    title: 'Mehrere Angebote auf dem Tisch?',
    text: 'Unser Angebots-Vergleich rechnet bis zu drei Angebote auf einheitliche Werte um und zeigt neutral, wo die Unterschiede liegen.',
    to: '/angebote-vergleichen',
    label: 'Angebote vergleichen',
  },
  wechsel: {
    title: 'Ab wann können Sie wechseln?',
    text: 'Der Wechsel-Rechner zeigt Ihnen den spätesten Kündigungstermin und den frühesten Wechseltermin, mit Vorlage für die Kündigung.',
    to: '/wechsel-rechner',
    label: 'Zum Wechsel-Rechner',
  },
  kalkulation: {
    title: 'Rechnen Sie mit Ihren eigenen Zahlen.',
    text: 'Der Kalkulationsrechner für Gründer zeigt den nötigen Stundensatz und den Deckungsbeitrag. Beispielrechnung, keine Prognose.',
    to: '/reinigungsfirma-kalkulieren',
    label: 'Zum Kalkulationsrechner',
  },
  partner: {
    title: 'Nicht alles allein aufbauen?',
    text: 'Mit dem CleanStar-Partnerprogramm nutzen Reinigungsfirmen in ganz Deutschland unsere erprobten Abläufe, Vorlagen und Werkzeuge. Konditionen klären wir im persönlichen Gespräch.',
    to: '/partner',
    label: 'Partnerprogramm ansehen',
  },
}

export function GuideCtaBox({ type }: { type: GuideCta }) {
  const c = ctas[type]
  return (
    <aside className="on-dark bg-night p-7 text-paper sm:p-12">
      <p className="t-label">Nächster Schritt</p>
      <h2 className="t-h3 mt-4 max-w-[20ch]">{c.title}</h2>
      <p className="measure mt-4 text-muted-dark">{c.text}</p>
      <div className="mt-8">
        {c.quote ? (
          <QuoteButton size="lg" arrow>
            {c.label}
          </QuoteButton>
        ) : (
          <Button to={c.to!} size="lg" arrow>
            {c.label}
          </Button>
        )}
      </div>
    </aside>
  )
}

export function GuideDownload({ id }: { id: 'serviceList' | 'checklist' }) {
  const d = downloads[id]
  const label = id === 'serviceList' ? 'Muster: Was wird wie oft gereinigt?' : 'Checkliste: Woran Sie eine gute Büroreinigung erkennen'
  return (
    <a href={d.href} download={d.file} className="group mt-12 flex items-start gap-4 border-y border-line py-5">
      <span className="min-w-0 flex-1">
        <span className="t-label block">Download · PDF, kostenlos, ohne Anmeldung</span>
        <span className="ulink mt-2 inline-block text-[1.25rem] font-medium tracking-[-0.015em]">{label}</span>
      </span>
      <ArrowDown aria-hidden className="mt-1 size-5 shrink-0 transition-transform duration-500 ease-cs group-hover:translate-y-0.5" strokeWidth={1.5} />
    </a>
  )
}

/** Artikel als editoriale Zeile (Übersicht und „Weiterlesen“) */
export function GuideCard({ g }: { g: Guide }) {
  return (
    <Link to={`/ratgeber/${g.slug}`} className="group grid h-full grid-cols-[1fr_auto] gap-x-6 border-t border-line pt-6 pb-8">
      <span className="t-label col-span-2">
        {g.category === 'gruender' ? 'Für Gründer' : 'Für Unternehmen'} · {readingMinutes(g)}
        {'\u00A0'}Min.
      </span>
      <span className="mt-4 text-[1.375rem] leading-[1.2] font-medium tracking-[-0.02em] text-ink sm:text-[1.5rem]">
        <span className="ulink">{g.title}</span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="mt-5 size-5 shrink-0 transition-transform duration-500 ease-cs group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.5}
      />
      <span className="col-span-2 mt-3 line-clamp-3 text-ink-2">{g.answer}</span>
    </Link>
  )
}
