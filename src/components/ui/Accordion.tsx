import { useId, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface AccordionItem {
  title: ReactNode
  content: ReactNode
}

/** Barrierefreies Accordion (Button + Region, Tastatur über native Buttons). */
export function Accordion({
  items,
  className,
  dark,
  defaultOpen = -1,
  headingLevel = 'h3',
}: {
  items: AccordionItem[]
  className?: string
  dark?: boolean
  defaultOpen?: number
  /** Überschriftenebene der Fragen (für eine korrekte Gliederung) */
  headingLevel?: 'h2' | 'h3'
}) {
  const H = headingLevel
  const [open, setOpen] = useState<number>(defaultOpen)
  const uid = useId()
  return (
    <div className={cn('divide-y', dark ? 'divide-white/10 border-y border-white/10' : 'divide-line border-y border-line', className)}>
      {items.map((it, i) => {
        const isOpen = open === i
        const bid = `${uid}-b${i}`
        const pid = `${uid}-p${i}`
        return (
          <div key={i}>
            <H className="m-0">
              <button
                id={bid}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={cn(
                  'flex w-full items-start justify-between gap-6 py-5 text-left text-base font-medium transition-colors sm:text-lg',
                  dark ? 'text-white hover:text-fresh' : 'text-ink hover:text-blue',
                )}
              >
                <span className="min-w-0">{it.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ring-1 transition-transform duration-300',
                    dark ? 'ring-white/20' : 'ring-line',
                    isOpen && 'rotate-45 bg-blue text-white ring-blue',
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </H>
            <motion.div
              id={pid}
              role="region"
              aria-labelledby={bid}
              inert={!isOpen}
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
              style={{ height: isOpen ? 'auto' : 0 }}
            >
              <div className={cn('pr-12 pb-6 leading-relaxed', dark ? 'text-muted-dark' : 'text-muted')}>{it.content}</div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
