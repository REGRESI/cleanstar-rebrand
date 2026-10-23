import { useId, useState, type ReactNode } from 'react'
import { noOrphan } from '@/lib/format'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'

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
    <div className={cn('divide-y', dark ? 'divide-line-dark border-y border-line-dark' : 'divide-line border-y border-line', className)}>
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
                className={cn('group flex w-full items-start justify-between gap-6 py-6 text-left text-lg leading-snug font-medium tracking-[-0.015em] sm:text-xl', dark ? 'text-paper' : 'text-ink')}
              >
                <span className="min-w-0">{typeof it.title === 'string' ? noOrphan(it.title, 22) : it.title}</span>
                {/* Plus aus zwei Haarlinien, wird beim Öffnen zum Minus */}
                <span aria-hidden className="relative mt-2.5 block size-3.5 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                  <span className={cn('absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-500 ease-cs', isOpen && 'scale-y-0')} />
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
              transition={{ duration: 0.45, ease: EASE_CS_ARRAY }}
              className="overflow-hidden"
              style={{ height: isOpen ? 'auto' : 0 }}
            >
              <div className={cn('measure pr-10 pb-7 text-[1.0625rem] leading-relaxed', dark ? 'text-muted-dark' : 'text-ink-2')}>{it.content}</div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
