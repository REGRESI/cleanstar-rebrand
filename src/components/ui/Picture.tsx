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

export type PictureRatio = keyof typeof ratioClass

interface Props {
  id: ImageId
  className?: string
  /** Seitenverhältnis des Slots (überschreibt das Verhältnis aus images.ts) */
  ratio?: PictureRatio
  /** Responsive Seitenverhältnis-Klassen, z. B. 'aspect-[4/3] sm:aspect-[21/9]' (überschreibt ratio) */
  aspect?: string
  sizes?: string
  priority?: boolean
  /** Platzhalter-Beschriftung ausblenden (z. B. in kleinen Slots) */
  compact?: boolean
  tone?: 'light' | 'dark'
  /** Rundung: Standard keine; höchstens 4 px */
  rounded?: string
  /** Aufdecken beim Scrollen (clip-path von unten) */
  reveal?: boolean | 'now'
}

/**
 * Bild-Slot mit festem Seitenverhältnis: responsives Foto (AVIF/WebP, lazy) mit einheitlicher Farbbehandlung,
 * oder, solange kein Foto vorliegt, ein schlichter Platzhalter. Ein echtes Foto wird nur ausgetauscht (siehe BILDER.md).
 */
export function Picture({ id, className, ratio, aspect: aspectOverride, sizes = '100vw', priority, compact, tone = 'light', rounded = 'rounded-none', reveal }: Props) {
  const spec = images[id]
  const aspect = aspectOverride ?? ratioClass[ratio ?? spec.ratio]
  const objectPosition = spec.position ?? '50% 50%'
  // 'now': deckt sich sofort per CSS auf (Seitenkopf, LCP); true: beim Scrollen
  // Aufdecken entfernt (Feinschliff 3: nur noch die Systeme des Text- und Übergangs-Systems); Eigenschaft bleibt erlaubt
  void reveal
  const revealCls = undefined
  const dataAttrs = {}

  // Maße fürs HTML (gegen Layoutverschiebungen): Seitenverhältnis des Fotos, die Darstellung bestimmt weiter CSS
  const [rw, rh] = (ratio && ratio in ratioClass ? ratio : spec.ratio).split(':').map(Number)
  const dims = { width: 1024, height: Math.round((1024 * rh) / rw) }
  let media
  // Vorschau-Datei: eingebettete, stark komprimierte WebP-Version
  const inlineSrc = __PREVIEW__ && spec.available ? previewImages[spec.file] : undefined
  if (inlineSrc) {
    media = (
      <div className={cn('photo block overflow-hidden', aspect, rounded, revealCls, className)} {...dataAttrs}>
        <img src={inlineSrc} alt={spec.alt} {...dims} loading={priority ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover" style={{ objectPosition }} />
      </div>
    )
  } else if (spec.available && !__PREVIEW__) {
    const set = (ext: string) => IMAGE_WIDTHS.map((w) => `${import.meta.env.BASE_URL}images/${spec.file}-${w}.${ext} ${w}w`).join(', ')
    media = (
      <picture className={cn('photo block overflow-hidden bg-surface', aspect, rounded, revealCls, className)} {...dataAttrs}>
        <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
        <img
          src={`${import.meta.env.BASE_URL}images/${spec.file}-1024.webp`}
          alt={spec.alt}
          {...dims}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="size-full object-cover"
          style={{ objectPosition }}
        />
      </picture>
    )
  } else {
    const dark = tone === 'dark'
    media = (
      <div
        role="img"
        aria-label={`Platzhalter: ${spec.alt}`}
        className={cn('relative overflow-hidden', aspect, rounded, dark ? 'bg-night-2 text-muted-dark' : 'bg-surface text-muted', revealCls, className)}
        {...dataAttrs}
      >
        {!compact && (
          <p aria-hidden className="absolute inset-x-0 bottom-0 p-4 font-medium tabular-nums text-[0.6875rem] leading-snug sm:text-xs">
            Bild: {spec.label}
          </p>
        )}
      </div>
    )
  }

  return media
}

/** URL eines Bildes als WebP (z. B. für die PDF-Zusammenfassung). null, solange kein Foto vorliegt. */
export function imageUrl(id: ImageId, width: (typeof IMAGE_WIDTHS)[number] = 640): string | null {
  const spec = images[id]
  if (!spec.available) return null
  if (__PREVIEW__) return previewImages[spec.file] ?? null
  return `${import.meta.env.BASE_URL}images/${spec.file}-${width}.webp`
}
