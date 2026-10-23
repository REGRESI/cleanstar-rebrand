import { useId, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { partnerWays, type PartnerWay } from '@/content/partner'
import { Picture } from '@/components/ui/Picture'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'

const ORDER: PartnerWay[] = ['bestand', 'gruendung']

/** Umschalter zwischen den zwei Wegen (rechteckige Segmente). Die Auswahl wird an das Bewerbungsformular weitergegeben. */
export function WaysToggle({ way, onChange, onApply }: { way: PartnerWay; onChange: (w: PartnerWay) => void; onApply: () => void }) {
  const uid = useId()
  const w = partnerWays[way]
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = ORDER[(ORDER.indexOf(way) + 1) % ORDER.length]
    onChange(next)
    document.getElementById(`${uid}-tab-${next}`)?.focus()
  }
  return (
    <div>
      <div role="tablist" aria-label="Ihr Weg zum Partner" className="grid grid-cols-1 shadow-[inset_0_0_0_1px_var(--color-line-strong)] sm:inline-grid sm:grid-cols-2" onKeyDown={onKey}>
        {ORDER.map((id, i) => {
          const on = id === way
          return (
            <button
              key={id}
              id={`${uid}-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(id)}
              className={cn('flex items-baseline gap-4 px-5 py-4 text-left text-[1.0625rem] transition-colors duration-300', on ? 'bg-ink text-paper' : 'text-ink hover:bg-surface')}
            >
              <span className={cn('font-mono text-[0.75rem]', on ? 'text-paper/70' : 'text-muted')}>{String(i + 1).padStart(2, '0')}</span>
              {partnerWays[id].label}
            </button>
          )
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${way}`} className="mt-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={way}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE_CS_ARRAY }}
            className="grid-site gap-y-10 lg:items-end"
          >
            <div className="col-span-12 lg:col-span-5">
              <Picture id={w.image} ratio="4:5" sizes="(min-width:1024px) 40vw, 100vw" />
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <h3 className="t-h3">{w.headline}</h3>
              <p className="t-lead mt-5">{w.text}</p>
              <ol className="mt-8 border-t border-line">
                {w.benefits.map((b, i) => (
                  <li key={b} className="flex gap-5 border-b border-line py-3.5">
                    <span className="t-label w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    {b}
                  </li>
                ))}
              </ol>
              <button type="button" onClick={onApply} className="btn btn-primary mt-10">
                Als „{w.short}“ anfragen
                <ArrowRight aria-hidden className="btn-arrow size-4" strokeWidth={1.75} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
