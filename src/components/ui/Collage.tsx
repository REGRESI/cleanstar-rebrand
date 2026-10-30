import type { ReactNode } from 'react'
import { Picture } from './Picture'
import { OffsetCards } from './OffsetCards'
import type { ImageId } from '@/content/images'

/**
 * Bildgruppe als versetzte Karten (siehe OffsetCards): leicht überlappend, schieben sich beim Scrollen ruhig
 * übereinander. Eine Karte kann statt eines Fotos einen Video-Loop zeigen.
 */
type Layer = { id: ImageId } | { node: ReactNode }
const RATIOS = ['aspect-[4/3]', 'aspect-[4/5]', 'aspect-[1/1]']

export function Collage({ layers, className }: { layers: Layer[]; className?: string }) {
  return (
    <OffsetCards
      overlap
      className={className}
      items={layers.map((l, i) => ({
        key: String(i),
        node: 'id' in l ? <Picture id={l.id} aspect={RATIOS[i % 3]} sizes="(min-width:1024px) 24vw, 70vw" /> : <div className={RATIOS[i % 3]}>{l.node}</div>,
      }))}
    />
  )
}
