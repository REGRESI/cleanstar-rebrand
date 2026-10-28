import { useEffect, useMemo, useState } from 'react'
import { Seo } from '@/components/ui/Seo'
import { TextField } from '@/features/forms/fields'
import { company } from '@/content/company'
import { cleanName, mappeLink, MAX_NAME } from '@/features/mappe/personal'

/** QR-Code als SVG-Pfad (scharf in jeder Größe, auch beim Drucken) */
function useQrPath(text: string) {
  const [qr, setQr] = useState<{ d: string; n: number } | null>(null)
  useEffect(() => {
    let alive = true
    import('qrcode-generator').then(({ default: qrcode }) => {
      const q = qrcode(0, 'M')
      q.addData(text)
      q.make()
      const n = q.getModuleCount()
      let d = ''
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
      if (alive) setQr({ d, n })
    })
    return () => {
      alive = false
    }
  }, [text])
  return qr
}

/**
 * Intern (nicht verlinkt, noindex): Link zu einer personalisierten Leistungsmappe erzeugen.
 * Firmenname erscheint auf Einband, Innen-Titel und im PDF; der Ansprechpartner auf der Kontaktseite.
 */
export default function MappeLink() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState(company.newClientContact)
  const [copied, setCopied] = useState(false)
  const clean = cleanName(name)
  const link = useMemo(() => mappeLink({ company: clean, contact }), [clean, contact])
  const qr = useQrPath(link)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = link
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  const downloadQr = () => {
    if (!qr) return
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${qr.n + 8} ${qr.n + 8}" width="1024" height="1024" shape-rendering="crispEdges"><rect x="-4" y="-4" width="${qr.n + 8}" height="${qr.n + 8}" fill="#fff"/><path d="${qr.d}" fill="#0a1a33"/></svg>`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    a.download = `Leistungsmappe-QR${clean ? '-' + clean.replace(/[^\p{L}\p{N}]+/gu, '-') : ''}.svg`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <Seo title="Link zur persönlichen Leistungsmappe" description="Interne Seite: Link zu einer personalisierten Leistungsmappe erzeugen." path="/mappe-link" noindex />
      <section className="section pt-32 lg:pt-40">
        <div className="container-site grid-site gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label mb-4">Intern</p>
            <h1 className="text-[2.25rem] leading-[1.05] font-medium tracking-[-0.03em] lg:text-[3rem]">Persönliche Leistungsmappe</h1>
            <p className="mt-5 max-w-[46ch] text-ink-2">
              Der Firmenname steht danach auf dem Einband, auf dem Innen-Titel und im PDF. Die gewählte Person erscheint auf der Kontaktseite und auf dem Notizzettel.
            </p>
            <div className="mt-10 space-y-6">
              <TextField
                label="Firmenname"
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Müller GmbH"
                hint={`${clean.length} von ${MAX_NAME} Zeichen. Nur Text, keine Sonderzeichen außer & . , - ' / ( ) +`}
              />
              <fieldset>
                <legend className="mb-3 text-[0.9375rem] font-medium">Ansprechpartner bei uns</legend>
                <div className="flex flex-wrap gap-2">
                  {company.founders.map((f, i) => (
                    <label key={i} className="cursor-pointer">
                      <input type="radio" name="contact" className="sr-only" checked={contact === i} onChange={() => setContact(i)} />
                      <span className="choice">{(f.name ?? '').split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="t-label">Link</p>
            <p className="mt-3 border border-line bg-surface p-4 font-medium break-all" data-mappe-link>
              {link}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={copy} className="btn btn-primary btn-sm" aria-live="polite">
                {copied ? 'Kopiert' : 'Link kopieren'}
              </button>
              <a href={link.replace(company.siteUrl, '')} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
                Mappe ansehen
              </a>
            </div>
            <p className="t-label mt-10">QR-Code</p>
            <div className="mt-3 w-[220px] bg-white p-3">
              {qr ? (
                <svg viewBox={`0 0 ${qr.n} ${qr.n}`} className="block size-full" shapeRendering="crispEdges" role="img" aria-label={`QR-Code: ${link}`}>
                  <path d={qr.d} fill="#0a1a33" />
                </svg>
              ) : (
                <div className="aspect-square" />
              )}
            </div>
            <button type="button" onClick={downloadQr} className="btn btn-outline btn-sm mt-4" disabled={!qr}>
              QR-Code als SVG speichern
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
