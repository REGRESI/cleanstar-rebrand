import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, ClipboardList, Megaphone, Plus, Sparkles, Users, LifeBuoy } from 'lucide-react'
import { partnerModules, type PartnerModule } from '@/content/partner'
import { Picture } from '@/components/ui/Picture'
import { Todo } from '@/components/ui/Todo'
import { cn } from '@/lib/cn'

const ICONS: Record<PartnerModule['icon'], typeof Sparkles> = {
  brand: Sparkles,
  sales: Megaphone,
  quality: BadgeCheck,
  organisation: ClipboardList,
  people: Users,
  support: LifeBuoy,
}

/** Baukasten der Partner-Module. Jedes Modul klappt auf. Abschaltbar in partner.ts (enabled). */
export function ModuleGrid() {
  const modules = partnerModules.filter((m) => m.enabled)
  const [open, setOpen] = useState<string | null>(modules[0]?.id ?? null)
  return (
    <ul className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((m, i) => {
        const I = ICONS[m.icon]
        const isOpen = open === m.id
        return (
          <li key={m.id} data-reveal className={cn(m.image && isOpen && 'md:col-span-2 lg:col-span-3')}>
            <div
              className={cn(
                'overflow-hidden rounded-card ring-1 transition-shadow duration-500',
                isOpen ? 'bg-white shadow-lift ring-blue/20' : 'bg-white ring-line hover:shadow-soft',
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`modul-${m.id}`}
                onClick={() => setOpen(isOpen ? null : m.id)}
                className="flex w-full items-start gap-4 p-6 text-left sm:p-7"
              >
                <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl transition-colors', isOpen ? 'bg-blue text-white' : 'bg-glacier text-blue')}>
                  <I aria-hidden className="size-6" strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold tracking-[0.12em] text-muted uppercase">Modul {String(i + 1).padStart(2, '0')}</span>
                  <span className="mt-1 block text-xl font-semibold tracking-tight">{m.title}</span>
                  <span className="mt-1 block text-sm text-muted">{m.summary}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-line transition-transform duration-300',
                    isOpen && 'rotate-45 bg-ink text-white ring-ink',
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`modul-${m.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className={cn('px-6 pb-7 sm:px-7', m.image && 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center')}>
                      <div>
                        <ul className="space-y-2.5 border-t border-line pt-5">
                          {m.items.map((it) => (
                            <li key={it} className="flex items-start gap-3 text-ink/85">
                              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-fresh" />
                              {it}
                            </li>
                          ))}
                        </ul>
                        {m.todo && (
                          <p className="mt-4">
                            <Todo title={m.todo}>{m.todo}</Todo>
                          </p>
                        )}
                      </div>
                      {m.image && <Picture id={m.image} sizes="(min-width:1024px) 40vw, 100vw" />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
