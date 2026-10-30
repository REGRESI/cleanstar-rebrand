import type { ReactNode } from 'react'
import { Breadcrumbs } from './Breadcrumbs'
import { RevealText } from './RevealText'
import { Picture, type PictureRatio } from './Picture'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/**
 * Kopfbereich für Unterseiten: Brotkrumen, große H1 über das Raster, Einleitung versetzt rechts,
 * optional ein Bild über die volle Breite in festem Seitenverhältnis (deckt sich von unten auf).
 */
export function PageHero({
  trail,
  eyebrow,
  title,
  lead,
  actions,
  image,
  imageRatio = '21:9',
  dark,
  children,
}: {
  trail: { name: string; path: string }[]
  eyebrow?: string
  title: string
  lead?: ReactNode
  actions?: ReactNode
  image?: ImageId
  /** Seitenverhältnis des Bildes ab Tablet (Handy: 4:3) */
  imageRatio?: PictureRatio
  dark?: boolean
  children?: ReactNode
}) {
  return (
    <section
      data-tone-end={image ? 'image' : undefined}
      className={cn('relative pt-28 sm:pt-36 lg:pt-44', image ? 'pb-0' : 'pb-4 sm:pb-6 lg:pb-0', dark ? 'on-dark bg-night text-paper' : 'bg-paper')}
    >
      <div className="container-site">
        <Breadcrumbs trail={trail} dark={dark} />
        <div className="grid-site gap-y-8 lg:gap-y-12">
          <div className="col-span-12 lg:col-span-7">
            {eyebrow && (
              <p className="t-label mb-6 lg:mb-8">
                {eyebrow}
              </p>
            )}
            <RevealText as="h1" text={title} immediate className="t-h1 max-w-[18ch]" />
          </div>
          {(lead || actions || children) && (
            <div className="col-span-12 md:col-span-9 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end">
              {lead && (
                <div className={cn('t-lead', dark ? 'text-paper' : 'text-ink')}>
                  {lead}
                </div>
              )}
              {actions && (
                <div className="btn-row mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
                  {actions}
                </div>
              )}
              {children}
            </div>
          )}
        </div>
      </div>
      {image && (
        <div className="container-site mt-16 sm:mt-20 lg:mt-20">
          <Picture
            id={image}
            priority
            reveal="now"
            sizes="(min-width:1600px) 1472px, 100vw"
            tone={dark ? 'dark' : 'light'}
            aspect={cn('aspect-[4/3]', imageRatio === '21:9' ? 'sm:aspect-[21/9]' : imageRatio === '3:2' ? 'sm:aspect-[3/2]' : 'sm:aspect-[16/9]')}
          />
        </div>
      )}
    </section>
  )
}
