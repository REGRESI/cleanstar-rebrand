import { Picture } from './Picture'
import { LoopVideo } from './LoopVideo'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/**
 * Randloses Bildband über die volle Breite (21:9, auf dem Handy 4:3) als ruhiger Taktwechsel zwischen Textabschnitten.
 * Steht still (keine Parallaxe, kein Heranfahren). Mit loop zeigt es statt des Fotos einen stummen Video-Loop.
 */
export function ImageBand({ id, loop, className }: { id: ImageId; loop?: 'wischen' | 'wagen'; className?: string }) {
  return (
    <figure className={cn('relative', className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-surface sm:aspect-[21/9]">
        {loop ? <LoopVideo name={loop} className="size-full" /> : <Picture id={id} aspect="size-full" sizes="100vw" />}
      </div>
    </figure>
  )
}
