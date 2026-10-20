import { ImageIcon } from 'lucide-react'
import previewImages from 'virtual:preview-images'
import { images, IMAGE_WIDTHS, type ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

const ratioClass: Record<string, string> = {
  '16:9': 'aspect-[16/9]',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '4:5': 'aspect-[4/5]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
  '21:9': 'aspect-[21/9]',
}

interface Props {
  id: ImageId
  className?: string
  /** Seitenverhältnis überschreiben (z. B. Kartenausschnitt) */
  ratio?: keyof typeof ratioClass
  sizes?: string
  priority?: boolean
  /** Platzhalter-Beschriftung ausblenden (z. B. in kleinen Karten) */
  compact?: boolean
  tone?: 'light' | 'dark'
  rounded?: string
}

/**
 * Responsives Bild (AVIF/WebP, lazy) oder, solange kein Foto vorliegt,
 * ein Platzhalter mit festem Seitenverhältnis und Beschriftung.
 */
export function Picture({ id, className, ratio, sizes = '100vw', priority, compact, tone = 'light', rounded = 'rounded-card' }: Props) {
  const spec = images[id]
  const aspect = ratioClass[ratio ?? spec.ratio]

  const objectPosition = spec.position ?? '50% 50%'

  // Vorschau-Datei: eingebettete, stark komprimierte WebP-Version
  const inlineSrc = __PREVIEW__ && spec.available ? previewImages[spec.file] : undefined
  if (inlineSrc) {
    return (
      <div className={cn('block overflow-hidden', aspect, rounded, className)}>
        <img src={inlineSrc} alt={spec.alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover" style={{ objectPosition }} />
      </div>
    )
  }

  if (spec.available && !__PREVIEW__) {
    const set = (ext: string) => IMAGE_WIDTHS.map((w) => `/images/${spec.file}-${w}.${ext} ${w}w`).join(', ')
    return (
      <picture className={cn('block overflow-hidden', aspect, rounded, className)}>
        <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
        <img
          src={`/images/${spec.file}-1024.webp`}
          alt={spec.alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="size-full object-cover"
          style={{ objectPosition }}
        />
      </picture>
    )
  }

  const dark = tone === 'dark'
  return (
    <div
      role="img"
      aria-label={`Platzhalter: ${spec.alt}`}
      className={cn(
        'relative isolate overflow-hidden',
        aspect,
        rounded,
        dark ? 'bg-ink-2 text-muted-dark ring-1 ring-white/10' : 'bg-glacier text-muted ring-1 ring-line',
        className,
      )}
    >
      <div aria-hidden className={cn('absolute inset-0 -z-10', dark ? 'bg-grid-dark' : 'bg-grid')} style={{ backgroundSize: '40px 40px' }} />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: dark
            ? 'radial-gradient(120% 80% at 80% 0%, rgb(31 94 255 / .25), transparent 60%), radial-gradient(80% 60% at 0% 100%, rgb(45 212 191 / .12), transparent 60%)'
            : 'radial-gradient(120% 80% at 85% 0%, rgb(31 94 255 / .14), transparent 60%), radial-gradient(80% 60% at 0% 100%, rgb(45 212 191 / .14), transparent 60%)',
        }}
      />
      <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <ImageIcon className="size-6 opacity-60" strokeWidth={1.5} />
        {!compact && (
          <p className="max-w-md font-mono text-[0.6875rem] leading-snug sm:text-xs">
            [BILD: {spec.label}]
            <br />
            <span className="opacity-70">{spec.file}</span>
          </p>
        )}
      </div>
    </div>
  )
}
