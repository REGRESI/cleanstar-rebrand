import { useEffect, useState } from 'react'
import hero from 'virtual:hero-frames'
import { cn } from '@/lib/cn'

/** Scharfe Standbilder der Schlüsselmomente, weich über die Sequenz geblendet, wenn man dort stehen bleibt. */
export function KeyOverlays({ activeKey, variant }: { activeKey: string | null; variant: 'd' | 'm' }) {
  const [ready, setReady] = useState<Record<string, boolean>>({})
  // Erst laden, wenn ein Schlüsselmoment zum ersten Mal erreicht wird (nicht alle großen Standbilder vorab)
  const [seen, setSeen] = useState<string[]>([])
  useEffect(() => {
    if (activeKey && !seen.includes(activeKey)) setSeen((s) => [...s, activeKey])
  }, [activeKey, seen])
  return (
    <>
      {hero.keys
        .filter((k) => seen.includes(k.name))
        .map((k) => (
          <img
            key={`${k.name}-${variant}`}
            src={variant === 'm' ? (k.m ?? k.d) : k.d}
            alt=""
            aria-hidden
            width={1918}
            height={1080}
            decoding="async"
            onLoad={() => setReady((r) => ({ ...r, [k.name]: true }))}
            className={cn(
              'pointer-events-none absolute inset-0 size-full object-cover transition-opacity ease-out',
              activeKey === k.name && ready[k.name] ? 'opacity-100 duration-500' : 'opacity-0 duration-200',
            )}
          />
        ))}
    </>
  )
}
