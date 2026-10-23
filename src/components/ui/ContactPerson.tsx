import { Picture } from '@/components/ui/Picture'
import { company } from '@/content/company'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'
import { CallbackButton } from '@/features/callback/Callback'

/** Ansprechpartner für Neukunden (company.newClientContact) */
export const newClientContact = () => company.founders[company.newClientContact] ?? company.founders[0]

/** Status „Jetzt erreichbar · 24/7“ in Monospace mit kleinem Punkt (funktionaler Zustand) */
export function AvailableNow({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[0.75rem]', dark ? 'text-muted-dark' : 'text-muted', className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      Jetzt erreichbar · 24/7
    </span>
  )
}

/**
 * „Ihr Ansprechpartner“: Porträt, Name, Rolle, direkte Nummer und 24/7-Status. Ohne Kasten.
 * Statt eines anonymen Formulars sieht der Kunde, mit wem er spricht.
 */
export function ContactPerson({ dark, compact, className, title = 'Ihr Ansprechpartner' }: { dark?: boolean; compact?: boolean; className?: string; title?: string }) {
  const p = newClientContact()
  const role = p.role.replace('Gründer · ', 'Gründer, ')
  return (
    <div className={cn('border-t pt-6', dark ? 'border-line-dark text-paper' : 'border-line text-ink', className)}>
      <p className="t-label">{title}</p>
      <div className="mt-5 flex items-start gap-5">
        <Picture id={p.image as ImageId} compact ratio="4:5" className="w-20 shrink-0 sm:w-24" sizes="96px" />
        <div className="min-w-0">
          <p className="text-xl font-medium tracking-[-0.02em]">{p.name}</p>
          <p className={cn('mt-1 text-[0.9375rem] leading-snug', dark ? 'text-muted-dark' : 'text-muted')}>{role}</p>
          <a href={company.phone.href} className="ulink mt-4 inline-block text-[1.375rem] font-medium tracking-[-0.02em]">
            {company.phone.display}
          </a>
          {!compact && (
            <a href={`mailto:${company.email}`} className={cn('ulink mt-1 block text-[0.9375rem] break-all', dark ? 'text-muted-dark hover:text-paper' : 'text-ink-2 hover:text-ink')}>
              {company.email}
            </a>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <AvailableNow dark={dark} />
        <CallbackButton dark={dark} />
      </div>
    </div>
  )
}
