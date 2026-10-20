/**
 * Statische Hero-Grafik: isometrisches Bürogebäude als Linienzeichnung.
 * Wird angezeigt, bevor die 3D-Szene geladen ist, bei reduzierter Bewegung
 * und auf Geräten ohne WebGL.
 */
export function HeroPoster({ className }: { className?: string }) {
  // Isometrische Projektion
  const iso = (x: number, y: number, z: number) => [300 + (x - z) * 0.866 * 26, 330 + (x + z) * 0.5 * 26 - y * 26] as const
  const pt = (x: number, y: number, z: number) => iso(x, y, z).join(',')
  const W = 8
  const D = 6
  const floors = 5
  const fh = 1.6
  const H = floors * fh

  const faceFront = [pt(0, 0, D), pt(W, 0, D), pt(W, H, D), pt(0, H, D)].join(' ')
  const faceSide = [pt(W, 0, D), pt(W, 0, 0), pt(W, H, 0), pt(W, H, D)].join(' ')
  const roof = [pt(0, H, D), pt(W, H, D), pt(W, H, 0), pt(0, H, 0)].join(' ')

  const lines: string[] = []
  for (let f = 1; f < floors; f++) {
    const y = f * fh
    lines.push(`M${pt(0, y, D)} L${pt(W, y, D)} L${pt(W, y, 0)}`)
  }
  for (let i = 1; i < 8; i++) lines.push(`M${pt(i, 0, D)} L${pt(i, H, D)}`)
  for (let i = 1; i < 6; i++) lines.push(`M${pt(W, 0, i)} L${pt(W, H, i)}`)

  // „saubere“ Etage hervorgehoben
  const lit = [pt(0, fh, D), pt(W, fh, D), pt(W, fh * 2, D), pt(0, fh * 2, D)].join(' ')
  const litSide = [pt(W, fh, D), pt(W, fh, 0), pt(W, fh * 2, 0), pt(W, fh * 2, D)].join(' ')
  const ground = [pt(-3, 0, D + 4), pt(W + 4, 0, D + 4), pt(W + 4, 0, -3), pt(-3, 0, -3)].join(' ')
  const [sx, sy] = iso(W + 0.4, fh * 2 + 0.7, D + 0.3)

  return (
    <svg viewBox="0 0 600 520" className={className} aria-hidden fill="none">
      <defs>
        <linearGradient id="hp-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6eefb" />
        </linearGradient>
        <linearGradient id="hp-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbe6ff" />
          <stop offset="1" stopColor="#c7d6f5" />
        </linearGradient>
        <linearGradient id="hp-lit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1f5eff" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="hp-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={ground} fill="#eef4fc" stroke="#d6e1f1" />
      <polygon points={faceFront} fill="url(#hp-front)" stroke="#13223b" strokeOpacity="0.5" />
      <polygon points={faceSide} fill="url(#hp-side)" stroke="#13223b" strokeOpacity="0.5" />
      <polygon points={roof} fill="#f7f9fd" stroke="#13223b" strokeOpacity="0.5" />
      <polygon points={lit} fill="url(#hp-lit)" />
      <polygon points={litSide} fill="url(#hp-lit)" opacity="0.7" />
      <path d={lines.join(' ')} stroke="#13223b" strokeOpacity="0.28" strokeWidth="1" />
      <circle cx={sx} cy={sy} r="70" fill="url(#hp-glow)" />
      <path
        d={`M${sx} ${sy - 26} C${sx + 3} ${sy - 6} ${sx + 6} ${sy - 3} ${sx + 26} ${sy} C${sx + 6} ${sy + 3} ${sx + 3} ${sy + 6} ${sx} ${sy + 26} C${sx - 3} ${sy + 6} ${sx - 6} ${sy + 3} ${sx - 26} ${sy} C${sx - 6} ${sy - 3} ${sx - 3} ${sy - 6} ${sx} ${sy - 26}Z`}
        fill="#1f5eff"
      />
    </svg>
  )
}
