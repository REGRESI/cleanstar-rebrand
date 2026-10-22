import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calculator, Check, Clock, FileDown, Link2, Mail, Scale, Share2, Sparkles, Users } from 'lucide-react'
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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
      <span className="flex items-center gap-3">
        <span className="block size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
          <Picture id={author.image as ImageId} compact rounded="rounded-none" className="h-full w-full aspect-auto!" sizes="44px" />
        </span>
        <span>
          <span className="block font-semibold text-ink">{author.name}</span>
          <span className="block text-xs">{author.role.replace('Gründer · ', 'Gründer, ')}</span>
        </span>
      </span>
      <span>
        <time dateTime={g.modified}>{formatDate(g.modified)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock aria-hidden className="size-4" />
        {readingMinutes(g)} Min. Lesezeit
      </span>
    </div>
  )
}

/** Teilen ohne Skripte von Drittanbietern: einfache Links, auf dem Handy das System-Teilen-Menü */
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const [native, setNative] = useState(false)
  useEffect(() => setNative(typeof navigator !== 'undefined' && 'share' in navigator), [])
  const enc = encodeURIComponent
  const cls =
    'inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-ink">Artikel teilen:</span>
      {native && (
        <button type="button" className={cls} onClick={() => navigator.share({ title, url }).catch(() => {})}>
          <Share2 aria-hidden className="size-4 text-blue" />
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
        <Mail aria-hidden className="size-4 text-blue" />
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
        {copied ? <Check aria-hidden className="size-4 text-fresh-ink" /> : <Link2 aria-hidden className="size-4 text-blue" />}
        <span aria-live="polite">{copied ? 'Kopiert' : 'Link kopieren'}</span>
      </button>
    </div>
  )
}

const ctas: Record<GuideCta, { icon: typeof Sparkles; title: string; text: string; to?: string; label: string; quote?: boolean }> = {
  angebot: {
    icon: Sparkles,
    title: 'Sie suchen eine Reinigungsfirma im Ortenaukreis?',
    text: `Wir besichtigen Ihr Büro kostenlos und schicken Ihnen innerhalb von ${company.promises.offerHours} Stunden ein Angebot mit Leistungsverzeichnis. Im ersten Monat können Sie jederzeit kündigen.`,
    label: 'Kostenloses Angebot',
    quote: true,
  },
  check: {
    icon: Check,
    title: 'Wie gut ist Ihre aktuelle Reinigung?',
    text: `${checkQuestions.length} kurze Fragen, zwei Minuten, eine ehrliche Auswertung mit konkreten Hinweisen. Ohne Anmeldung.`,
    to: '/reinigungs-check',
    label: 'Zum Reinigungs-Check',
  },
  vergleich: {
    icon: Scale,
    title: 'Mehrere Angebote auf dem Tisch?',
    text: 'Unser Angebots-Vergleich rechnet bis zu drei Angebote auf einheitliche Werte um und zeigt neutral, wo die Unterschiede liegen.',
    to: '/angebote-vergleichen',
    label: 'Angebote vergleichen',
  },
  wechsel: {
    icon: Calculator,
    title: 'Ab wann können Sie wechseln?',
    text: 'Der Wechsel-Rechner zeigt Ihnen den spätesten Kündigungstermin und den frühesten Wechseltermin, mit Vorlage für die Kündigung.',
    to: '/wechsel-rechner',
    label: 'Zum Wechsel-Rechner',
  },
  kalkulation: {
    icon: Calculator,
    title: 'Rechnen Sie mit Ihren eigenen Zahlen.',
    text: 'Der Kalkulationsrechner für Gründer zeigt den nötigen Stundensatz und den Deckungsbeitrag. Beispielrechnung, keine Prognose.',
    to: '/reinigungsfirma-kalkulieren',
    label: 'Zum Kalkulationsrechner',
  },
  partner: {
    icon: Users,
    title: 'Nicht alles allein aufbauen?',
    text: 'Mit dem CleanStar-Partnerprogramm nutzen Reinigungsfirmen in ganz Deutschland unsere erprobten Abläufe, Vorlagen und Werkzeuge. Konditionen klären wir im persönlichen Gespräch.',
    to: '/partner',
    label: 'Partnerprogramm ansehen',
  },
}

export function GuideCtaBox({ type }: { type: GuideCta }) {
  const c = ctas[type]
  return (
    <aside className="on-dark relative overflow-hidden rounded-panel bg-ink p-7 text-white sm:p-10">
      <div aria-hidden className="absolute -top-32 -right-32 size-80 [background:radial-gradient(closest-side,rgb(31_94_255/0.5),transparent)]" />
      <div className="relative">
        <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-fresh">
          <c.icon aria-hidden className="size-5" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h2>
        <p className="mt-3 max-w-xl text-white/75">{c.text}</p>
        <div className="mt-7">
          {c.quote ? (
            <QuoteButton variant="light" size="lg" arrow>
              {c.label}
            </QuoteButton>
          ) : (
            <Button to={c.to!} variant="light" size="lg" arrow>
              {c.label}
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}

export function GuideDownload({ id }: { id: 'serviceList' | 'checklist' }) {
  const d = downloads[id]
  const label = id === 'serviceList' ? 'Muster-Leistungsverzeichnis Büroreinigung' : 'Checkliste: Woran Sie eine gute Büroreinigung erkennen'
  return (
    <a
      href={d.href}
      download={d.file}
      className="group mt-10 flex items-center gap-4 rounded-card bg-glacier p-5 ring-1 ring-line transition hover:ring-blue/40 active:bg-blue-soft sm:p-6"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue text-white">
        <FileDown aria-hidden className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-sm text-muted">PDF, kostenlos, ohne Anmeldung</span>
      </span>
      <ArrowRight aria-hidden className="size-5 shrink-0 text-blue transition group-hover:translate-x-0.5" />
    </a>
  )
}

/** Kachel für die Übersicht und „Weiterlesen“ */
export function GuideCard({ g }: { g: Guide }) {
  return (
    <Link
      to={`/ratgeber/${g.slug}`}
      className="group flex h-full flex-col rounded-card bg-white p-6 ring-1 ring-line transition hover:shadow-soft hover:ring-blue/30 active:ring-blue sm:p-7"
    >
      <span className="text-xs font-semibold tracking-[0.12em] text-blue-hover uppercase">{g.category === 'gruender' ? 'Für Gründer' : 'Für Unternehmen'}</span>
      <span className="mt-3 text-lg leading-snug font-semibold tracking-tight text-ink">{g.title}</span>
      <span className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{g.answer}</span>
      <span className="mt-5 flex items-center justify-between text-sm">
        <span className="text-muted">{readingMinutes(g)} Min. Lesezeit</span>
        <span className="inline-flex items-center gap-1 font-semibold text-blue-hover">
          Lesen <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  )
}
