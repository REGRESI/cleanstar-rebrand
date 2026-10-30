import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { partnerModules } from '@/content/partner'
import { Picture } from '@/components/ui/Picture'
import { Todo } from '@/components/ui/Todo'
import { cn } from '@/lib/cn'
import { EASE_CS_ARRAY } from '@/lib/ease'

/** Baukasten der Partner-Module als nummerierte Zeilen mit Haarlinien. Jedes Modul klappt auf. Abschaltbar in partner.ts (enabled). */
export function ModuleGrid() {
  const modules = partnerModules.filter((m) => m.enabled)
  const [open, setOpen] = useState<string | null>(modules[0]?.id ?? null)
  return (
    <ul className="border-b border-line">
      {modules.map((m, i) => {
        const isOpen = open === m.id
        return (
          <li key={m.id} className="border-t border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`modul-${m.id}`}
              onClick={() => setOpen(isOpen ? null : m.id)}
              className="grid w-full grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 py-7 text-left lg:grid-cols-12 lg:gap-x-8"
            >
              <span className="t-label col-span-2 lg:col-span-3 lg:pt-2">Modul {String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0 lg:col-span-8">
                <span className="block text-[1.5rem] leading-[1.2] font-medium tracking-[-0.02em] sm:text-[1.75rem]">{m.title}</span>
                <span className="mt-2 block text-ink-2">{m.summary}</span>
              </span>
              <span aria-hidden className="relative mt-3 block size-3.5 shrink-0 lg:col-span-1 lg:justify-self-end">
                <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                <span className={cn('absolute inset-y-0 left-1/2 w-px bg-current transition-transform duration-500 ease-cs', isOpen && 'scale-y-0')} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`modul-${m.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_CS_ARRAY }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-8 pb-10 lg:grid-cols-12 lg:gap-x-8">
                    <ul className="border-t border-line lg:col-span-5 lg:col-start-4">
                      {m.items.map((it) => (
                        <li key={it} className="border-b border-line py-3 text-ink">
                          {it}
                        </li>
                      ))}
                    </ul>
                    {m.todo && (
                      <p className="lg:col-span-8 lg:col-start-4">
                        <Todo title={m.todo}>{m.todo}</Todo>
                      </p>
                    )}
                    {m.image && (
                      <div className="lg:col-span-3 lg:col-start-10">
                        <Picture id={m.image} ratio="4:5" sizes="(min-width:1024px) 25vw, 100vw" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}
