import { Picture } from './Picture'
import type { ImageId } from '@/content/images'
import { cn } from '@/lib/cn'

/** Gründerporträt als Karte mit weichem Schatten (ohne eigenen Effekt). */
export function FounderPortrait({ id, sizes, className }: { id: ImageId; order?: number; sizes: string; className?: string }) {
  return (
    <div className={cn('card-shadow overflow-hidden rounded-[10px]', className)}>
      <Picture id={id} ratio="4:5" sizes={sizes} />
    </div>
  )
}
