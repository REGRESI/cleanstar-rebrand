import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Seo } from '@/components/ui/Seo'
import { Logo } from '@/components/ui/Logo'
import { HomeLink } from '@/components/ui/HomeLink'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { TextVersion } from '@/features/mappe/TextVersion'
import { tableFile } from '@/features/mappe/assets'
import { breadcrumbSchema } from '@/lib/schema'
import { cn } from '@/lib/cn'

const Experience3D = lazy(() => import('@/features/mappe/Experience3D'))
const FlatBook = lazy(() => import('@/features/mappe/FlatBook'))

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
  const onReady = useCallback(() => setReady(true), [])
  const onSpread = useCallback((s: number) => {
    if (s >= 0) setOpened(true)
  }, [])

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
      await downloadMappePdf((p) => setPdf(p))
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
        {/* Licht von oben links, zum Rand hin etwas dunkler */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(120%_90%_at_25%_10%,transparent_40%,rgba(0,0,0,0.28))]" />

        <Suspense fallback={null}>
          {mode === '3d' && <Experience3D sound={sound} onReady={onReady} onSpread={onSpread} />}
          {mode === 'flat' && (
            <div className="absolute inset-x-4 top-20 bottom-32 z-[2] sm:top-24">
              <FlatBook sound={sound} onReady={onReady} />
            </div>
          )}
        </Suspense>

        {/* Kopfzeile über der Szene */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 [&>*]:pointer-events-auto">
          <HomeLink label="CleanStar Dienstleistungen, zur Startseite" className="rounded-sm bg-paper/92 px-3 py-2 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.5)] backdrop-blur">
            <Logo className="w-[104px] sm:w-[124px]" />
          </HomeLink>
          <QuoteButton size="sm">Besichtigung anfragen</QuoteButton>
        </div>

        {/* Hinweis und Bedienung */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-5 sm:pb-7 [&>*]:pointer-events-auto">
          <p className={cn('t-meta text-paper/85 transition-opacity duration-700', opened && mode === '3d' ? 'opacity-0' : 'opacity-100')}>
            Unsere Leistungsmappe. {mode === 'flat' ? 'Zum Blättern wischen oder tippen.' : 'Zum Blättern klicken.'}
          </p>
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
