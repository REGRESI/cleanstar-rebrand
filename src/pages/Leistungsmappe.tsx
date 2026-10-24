import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Seo } from '@/components/ui/Seo'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { TextVersion } from '@/features/mappe/TextVersion'
import { tableFile } from '@/features/mappe/assets'
import { RecipientCtx } from '@/features/mappe/core'
import { defaultRecipient, recipientFromSearch, type Recipient } from '@/features/mappe/personal'
import type { MappeShared, NavState } from '@/features/mappe/shared'
import { breadcrumbSchema } from '@/lib/schema'
import { cn } from '@/lib/cn'

const Experience3D = lazy(() => import('@/features/mappe/Experience3D'))
const FlatBook = lazy(() => import('@/features/mappe/FlatBook'))
const RequestCard = lazy(() => import('@/features/mappe/RequestCard').then((m) => ({ default: m.RequestCard })))

const trail = [
  { name: 'Startseite', path: '/' },
  { name: 'Leistungsmappe', path: '/leistungsmappe' },
]

type Mode = '3d' | 'flat'

/** 3D nur auf großen Bildschirmen mit WebGL2, genug Leistung und ohne Wunsch nach reduzierter Bewegung */
function detectMode(): Mode {
  if (window.innerWidth < 768) return 'flat'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'flat'
  const nav = navigator as Navigator & { deviceMemory?: number }
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return 'flat'
  try {
    if (!document.createElement('canvas').getContext('webgl2')) return 'flat'
  } catch {
    return 'flat'
  }
  return '3d'
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 8h3l4-3v10l-4-3H3z" strokeLinejoin="round" />
      {on ? <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5.5a6.5 6.5 0 0 1 0 9" strokeLinecap="round" /> : <path d="M13.5 8l4 4m0-4l-4 4" strokeLinecap="round" />}
    </svg>
  )
}

export default function Leistungsmappe() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [ready, setReady] = useState(false)
  const [sound, setSound] = useState(false)
  const [opened, setOpened] = useState(false)
  const [pdf, setPdf] = useState<number | null>(null)
  const [nav, setNav] = useState<NavState | null>(null)
  const onReady = useCallback(() => setReady(true), [])
  const onNav = useCallback((n: NavState) => {
    setNav(n)
    if (n.label !== 'Einband') setOpened(true)
  }, [])

  // Personalisierte Mappe: ?fuer=Firma&an=Vorname (bereinigt, nur Text)
  const { search } = useLocation()
  const [recipient, setRecipient] = useState<Recipient>(defaultRecipient)
  useEffect(() => setRecipient(recipientFromSearch(search)), [search])

  // Gemeinsamer Zustand der Seiten (Uhrzeit, Regler, Intervall, Grundriss), für echte Seite, Textur und PDF gleich
  const [pageState, setPageState] = useState<Record<string, unknown>>({})
  const [version, setVersion] = useState(0)
  const setState = useCallback((key: string, value: unknown) => {
    setPageState((s) => (s[key] === value ? s : { ...s, [key]: value }))
    setVersion((v) => v + 1)
  }, [])

  // Anfragekarte aus dem Einsteckfach
  const [request, setRequest] = useState<DOMRect | null>(null)
  const openRequest = useCallback((from: DOMRect) => setRequest(from), [])
  const shared = useMemo<MappeShared>(() => ({ recipient, state: pageState, setState, version, openRequest }), [recipient, pageState, setState, version, openRequest])

  // Einband der flachen Mappe: mit persönlicher Prägung
  const [coverUrl, setCoverUrl] = useState('/mappe/cover.webp')
  const coverFor = useRef('')
  useEffect(() => {
    if (mode !== 'flat' || !recipient.company || coverFor.current === recipient.company) return
    coverFor.current = recipient.company
    import('@/features/mappe/cover').then(({ personalCover }) => personalCover(recipient.company).then((c) => setCoverUrl(c.toDataURL('image/jpeg', 0.9))))
  }, [mode, recipient.company])

  useEffect(() => {
    setMode(detectMode())
    const mq = window.matchMedia('(min-width: 768px)')
    const on = () => setMode(detectMode())
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const downloadPdf = async () => {
    if (pdf !== null) return
    setPdf(0)
    try {
      const { downloadMappePdf } = await import('@/features/mappe/pdf')
      await downloadMappePdf((p) => setPdf(p), recipient)
    } finally {
      setPdf(null)
    }
  }

  const portrait = mode === 'flat'
  return (
    <>
      <Seo
        title="Leistungsmappe zum Blättern"
        description="Die Leistungsmappe von CleanStar: Team, Leistungen, Ablauf, Qualitätsgarantie, Konditionen und Einzugsgebiet. Zum Blättern, als PDF oder als Text."
        path="/leistungsmappe"
        schema={[breadcrumbSchema(trail)]}
      />
      <h1 className="sr-only">Leistungsmappe von CleanStar</h1>
      <section
        data-tone="dark"
        className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-[#3b3833] bg-cover bg-center text-paper"
        style={{ backgroundImage: `url(${tableFile(portrait)})` }}
        aria-label="Leistungsmappe zum Blättern"
      >
        {/* Licht von oben links, zum Rand hin etwas dunkler; darüber feines Filmkorn (die Fläche wirkt wie fotografiert, nicht hochskaliert) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(120%_90%_at_25%_10%,transparent_40%,rgba(0,0,0,0.28))]" />
        <div aria-hidden className="mappe-grain pointer-events-none absolute inset-0 z-[1]" />

        <RecipientCtx.Provider value={recipient}>
          <Suspense fallback={null}>
            {mode === '3d' && <Experience3D sound={sound} onReady={onReady} onNav={onNav} shared={shared} />}
            {mode === 'flat' && (
              <div className="absolute inset-x-4 top-20 bottom-40 z-[2] sm:top-24">
                <FlatBook sound={sound} onReady={onReady} onNav={onNav} shared={shared} coverUrl={coverUrl} />
              </div>
            )}
            {request && (
              <RequestCard
                from={request}
                company={recipient.company}
                onClose={(sent) => {
                  setRequest(null)
                  if (sent) setState('request.sent', true)
                }}
              />
            )}
          </Suspense>
        </RecipientCtx.Provider>

        {/* Kopfzeile über der Szene */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 [&>*]:pointer-events-auto">
          <HomeLink label="CleanStar Dienstleistungen, zur Startseite" className="rounded-sm bg-paper/92 px-3 py-2 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur">
            <Logo className="w-[104px] sm:w-[124px]" />
          </HomeLink>
          <QuoteButton size="sm">Besichtigung anfragen</QuoteButton>
        </div>

        {/* Hinweis und Bedienung */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-5 sm:pb-7 [&>*]:pointer-events-auto">
          {!opened && (
            <p className="t-meta text-center text-paper/85" data-mappe-counter-hint>
              {recipient.company ? `Ihre Leistungsmappe, erstellt für ${recipient.company}. ` : 'Unsere Leistungsmappe. '}
              {mode === 'flat' ? 'Zum Blättern wischen oder die Pfeile nutzen.' : 'Zum Blättern klicken.'}
            </p>
          )}
          {nav && (opened || mode === 'flat') && (
            // Seitenzahl, auf dem Smartphone mit Pfeilen (am Desktop stehen die Pfeile neben dem Buch)
            <div className="flex items-center gap-3">
              {mode === 'flat' && (
                <button
                  type="button"
                  onClick={nav.prev}
                  disabled={!nav.canPrev}
                  aria-label="Zurückblättern"
                  className="grid size-10 place-items-center rounded-full bg-paper/85 text-ink disabled:opacity-30"
                  data-mappe-prev
                >
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M12.5 4.5 7 10l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <p className="t-meta min-w-[5.5rem] text-center text-paper tabular-nums" aria-live="polite" data-mappe-counter>
                {nav.label}
              </p>
              {mode === 'flat' && (
                <button
                  type="button"
                  onClick={nav.next}
                  disabled={!nav.canNext}
                  aria-label="Weiterblättern"
                  className="grid size-10 place-items-center rounded-full bg-paper/85 text-ink disabled:opacity-30"
                  data-mappe-next
                >
                  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M7.5 4.5 13 10l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className={cn('flex flex-wrap items-center justify-center gap-2 transition-opacity duration-500', ready ? 'opacity-100' : 'opacity-0')}>
            <button type="button" onClick={downloadPdf} className="btn btn-light btn-sm" aria-busy={pdf !== null}>
              {pdf === null ? 'Als PDF laden' : `PDF wird erstellt … ${Math.round(pdf * 100)} %`}
            </button>
            <a href="#als-text" className="btn btn-outline-dark btn-sm">
              Als Text lesen
            </a>
            <button
              type="button"
              onClick={() => setSound((s) => !s)}
              aria-pressed={sound}
              aria-label={sound ? 'Papiergeräusch aus' : 'Papiergeräusch an'}
              className="btn btn-outline-dark btn-sm aspect-square px-0"
            >
              <SoundIcon on={sound} />
            </button>
          </div>
        </div>
      </section>

      <section id="als-text" className="section scroll-mt-8">
        <div className="container-site">
          <p className="t-label mb-4">Leistungsmappe als Text</p>
          <TextVersion />
        </div>
      </section>
    </>
  )
}
