import { useId, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Building2, Check, Rocket } from 'lucide-react'
import { partnerWays, type PartnerWay } from '@/content/partner'
import { Picture } from '@/components/ui/Picture'
import { cn } from '@/lib/cn'

const ORDER: PartnerWay[] = ['bestand', 'gruendung']
const ICON = { bestand: Building2, gruendung: Rocket }

/** Umschalter zwischen den zwei Wegen. Die Auswahl wird an das Bewerbungsformular weitergegeben. */
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
      <div role="tablist" aria-label="Ihr Weg zum Partner" className="grid grid-cols-1 gap-2 rounded-[1.75rem] bg-glacier p-1.5 sm:inline-grid sm:grid-cols-2" onKeyDown={onKey}>
        {ORDER.map((id) => {
          const I = ICON[id]
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
              className={cn(
                'relative flex items-center gap-3 rounded-[1.4rem] px-5 py-4 text-left text-[0.9375rem] font-semibold transition-colors',
                on ? 'text-white' : 'text-ink hover:bg-white/70',
              )}
            >
              {on && (
                <motion.span layoutId={`${uid}-pill`} className="absolute inset-0 -z-0 rounded-[1.4rem] bg-ink" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
              )}
              <I aria-hidden className={cn('relative size-5', on ? 'text-fresh' : 'text-blue')} />
              <span className="relative">{partnerWays[id].label}</span>
            </button>
          )
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${way}`} className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={way}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center"
          >
            <Picture id={w.image} sizes="(min-width:1024px) 45vw, 100vw" />
            <div>
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{w.headline}</h3>
              <p className="mt-4 text-lg leading-relaxed text-muted">{w.text}</p>
              <ul className="mt-6 space-y-3">
                {w.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-fresh/15 text-fresh-ink">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="font-medium">{b}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onApply}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-blue px-6 font-semibold text-white shadow-glow transition hover:bg-blue-hover"
              >
                Als „{w.short}“ anfragen
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
