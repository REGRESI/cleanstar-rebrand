import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Download, Loader2 } from 'lucide-react'
import { Picture } from '@/components/ui/Picture'
import { WaterImage } from '@/features/water/WaterImage'
import { services, type Service } from '@/content/services'
import { cn } from '@/lib/cn'

/**
 * Leistungsübersicht als nummerierte Kapitel: großes Foto (mit Wasser-Effekt beim Überfahren, Desktop), Kurzsatz,
 * Leistungsverzeichnis als PDF (im Browser aus den Inhaltsdaten erzeugt) und Link zur Detailseite.
 * Links ein mitlaufender Kapitel-Index (Desktop), der aktuelle Eintrag ist hervorgehoben.
 */
export function ServiceChapters() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="section pt-0!" aria-label="Leistungen als Kapitel">
      <div className="container-site grid-site">
        <nav aria-label="Kapitel" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-28 space-y-1 border-l border-line">
            {services.map((s, i) => (
              <li key={s.slug}>
                <a
                  href={`#kapitel-${s.slug}`}
                  aria-current={active === i ? 'true' : undefined}
                  className={cn(
                    '-ml-px flex gap-4 border-l py-2 pl-5 text-[0.9375rem] transition-colors duration-300',
                    active === i ? 'border-blue text-ink' : 'border-transparent text-muted hover:text-ink',
                  )}
                >
                  <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {s.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="col-span-12 lg:col-span-9">
          {services.map((s, i) => (
            <Chapter key={s.slug} s={s} i={i} innerRef={(el) => void (refs.current[i] = el)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Chapter({ s, i, innerRef }: { s: Service; i: number; innerRef: (el: HTMLElement | null) => void }) {
  const [busy, setBusy] = useState(false)
  const pdf = async () => {
    setBusy(true)
    try {
      const { downloadScopePdf } = await import('@/features/services/scopePdf')
      await downloadScopePdf(s)
    } finally {
      setBusy(false)
    }
  }
  return (
    <article ref={innerRef} id={`kapitel-${s.slug}`} data-i={i} className="scroll-mt-28 border-t border-line pt-10 pb-20 first:border-t-0 first:pt-0 lg:pb-28" aria-labelledby={`kap-${s.slug}`}>
      <p className="font-medium tabular-nums text-[3rem] leading-none tracking-[-0.04em] text-blue sm:text-[4.5rem]" aria-hidden>
        {String(i + 1).padStart(2, '0')}
      </p>
      <h2 id={`kap-${s.slug}`} className="t-h1 mt-6">
        <Link to={`/leistungen/${s.slug}`} className="ulink">
          {s.name}
        </Link>
      </h2>
      <WaterImage id={s.image} className="mt-10">
        <Link to={`/leistungen/${s.slug}`} tabIndex={-1} aria-hidden className="block">
          <Picture id={s.image} reveal aspect="aspect-[4/3] sm:aspect-[16/9]" sizes="(min-width:1024px) 70vw, 100vw" />
        </Link>
      </WaterImage>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <p className="t-lead max-w-[48ch] text-ink" data-reveal>
          {s.short}
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <button type="button" onClick={pdf} disabled={busy} className="tlink text-ink disabled:opacity-60">
            {busy ? <Loader2 aria-hidden className="mr-2 size-4 animate-spin" /> : <Download aria-hidden className="mr-2 size-4" strokeWidth={1.75} />}
            Leistungsverzeichnis als PDF
          </button>
          <Link to={`/leistungen/${s.slug}`} className="tlink text-ink">
            Zur Leistung
            <ArrowUpRight aria-hidden className="ml-1.5 size-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </article>
  )
}
