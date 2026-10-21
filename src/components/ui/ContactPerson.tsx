import { Mail, Phone } from 'lucide-react'
import { Picture } from '@/components/ui/Picture'
import { company } from '@/content/company'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/** Ansprechpartner für Neukunden (company.newClientContact) */
export const newClientContact = () => company.founders[company.newClientContact] ?? company.founders[0]

/** Grüner Punkt mit „Jetzt erreichbar · 24/7“ */
export function AvailableNow({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-medium', dark ? 'text-white/75' : 'text-muted', className)}>
      <span aria-hidden className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-fresh opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2.5 rounded-full bg-fresh" />
      </span>
      Jetzt erreichbar · 24/7
    </span>
  )
}

/**
 * Karte „Ihr Ansprechpartner“: Foto, Name, Rolle, direkte Nummer und 24/7-Status.
 * Statt eines anonymen Formulars sieht der Kunde, mit wem er spricht.
 */
export function ContactPerson({ dark, compact, className, title = 'Ihr Ansprechpartner' }: { dark?: boolean; compact?: boolean; className?: string; title?: string }) {
  const p = newClientContact()
  const role = p.role.replace('Gründer · ', 'Gründer, ')
  return (
    <div className={cn('rounded-panel p-5 sm:p-6', dark ? 'bg-white/5 text-white ring-1 ring-white/10' : 'bg-white shadow-soft ring-1 ring-line', className)}>
      <div className="flex items-center gap-4">
        <span className="relative shrink-0">
          <span className="block size-16 overflow-hidden rounded-full ring-2 ring-white sm:size-[4.5rem]">
            <Picture id={p.image as ImageId} compact rounded="rounded-none" className="h-full w-full aspect-auto!" sizes="80px" />
          </span>
          <span aria-hidden className={cn('absolute right-0.5 bottom-0.5 size-3.5 rounded-full bg-fresh ring-2', dark ? 'ring-ink' : 'ring-white')} />
        </span>
        <span className="min-w-0">
          <span className={cn('block text-xs font-semibold tracking-[0.12em] uppercase', dark ? 'text-white/60' : 'text-blue-hover')}>{title}</span>
          <span className="mt-0.5 block text-lg font-semibold tracking-tight">{p.name}</span>
          <span className={cn('block text-sm leading-snug', dark ? 'text-white/70' : 'text-muted')}>{role}</span>
        </span>
      </div>
      <div className={cn('mt-5 flex flex-col gap-2', !compact && 'sm:flex-row')}>
        <a
          href={company.phone.href}
          className={cn(
            'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 font-semibold transition',
            dark ? 'bg-white text-ink hover:bg-glacier' : 'bg-blue text-white shadow-glow hover:bg-blue-hover',
          )}
        >
          <Phone aria-hidden className="size-4" />
          {company.phone.display}
        </a>
        {!compact && (
          <a
            href={`mailto:${company.email}`}
            className={cn(
              'flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold ring-1 transition',
              dark ? 'ring-white/20 hover:bg-white/10' : 'ring-line hover:ring-ink/25',
            )}
          >
            <Mail aria-hidden className="size-4" />
            E-Mail
          </a>
        )}
      </div>
      <AvailableNow dark={dark} className="mt-4" />
    </div>
  )
}
