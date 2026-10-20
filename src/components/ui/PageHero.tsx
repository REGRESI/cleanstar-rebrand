import type { ReactNode } from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { RevealText } from './RevealText'
import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/** Kopfbereich für Unterseiten: Brotkrumen, H1, Einleitung, optional Bild. */
export function PageHero({
  trail,
  eyebrow,
  title,
  lead,
  actions,
  image,
  dark,
  children,
}: {
  trail: { name: string; path: string }[]
  eyebrow?: string
  title: string
  lead?: ReactNode
  actions?: ReactNode
  image?: ImageId
  dark?: boolean
  children?: ReactNode
}) {
  return (
    <section className={cn('relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24', dark ? 'on-dark bg-ink text-white' : 'bg-glacier')}>
      <div aria-hidden className={cn('absolute -top-40 -right-40 size-[40rem] rounded-full blur-[120px]', dark ? 'bg-blue/30' : 'bg-blue/[0.05]')} />
      <div className="container-site relative">
        <Breadcrumbs trail={trail} dark={dark} />
        <div className={cn('grid gap-12', image && 'lg:grid-cols-12 lg:items-center')}>
          <div className={cn(image ? 'lg:col-span-6' : 'max-w-4xl')}>
            {eyebrow && (
              <p className="eyebrow fade-up-now mb-5" style={{ ['--d' as string]: '0s' }}>
                {eyebrow}
              </p>
            )}
            <RevealText as="h1" text={title} immediate className="heading-1" />
            {lead && (
              <div className="lead fade-up-now mt-6 max-w-2xl" style={{ ['--d' as string]: '0.4s' }}>
                {lead}
              </div>
            )}
            {actions && (
              <div className="fade-up-now mt-8 flex flex-col gap-3 sm:flex-row" style={{ ['--d' as string]: '0.55s' }}>
                {actions}
              </div>
            )}
            {children}
          </div>
          {image && (
            <div className="lg:col-span-6">
              <Picture id={image} priority sizes="(min-width:1024px) 50vw, 100vw" tone={dark ? 'dark' : 'light'} rounded="rounded-panel" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
