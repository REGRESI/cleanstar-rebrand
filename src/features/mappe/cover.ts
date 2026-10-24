/**
 * Einband mit persönlicher Prägung: „Leistungsmappe für Müller GmbH“ unter dem Logo, als Blindprägung wie das Logo
 * (Licht- und Schattenkante, Fläche nur aufgehellt). Liefert ein Canvas für Textur und flache Mappe.
 */
export async function personalCover(company: string): Promise<HTMLCanvasElement> {
  const img = new Image()
  img.src = '/mappe/cover.webp'
  await img.decode()
  const W = img.naturalWidth
  const H = img.naturalHeight
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  if (!company) return c
  await document.fonts?.load(`500 40px "Instrument Sans"`).catch(() => {})

  const emboss = (text: string, y: number, size: number, tracking = 0) => {
    ctx.font = `500 ${size}px "Instrument Sans", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    // Text bei Bedarf verkleinern, damit er auf den Einband passt
    let s = size
    const max = W * 0.74
    while (ctx.measureText(text).width + tracking * text.length > max && s > 18) {
      s -= 2
      ctx.font = `500 ${s}px "Instrument Sans", system-ui, sans-serif`
    }
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${tracking}px`
    const draw = (dx: number, dy: number, color: string, op: GlobalCompositeOperation, alpha: number) => {
      ctx.globalCompositeOperation = op
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.fillText(text, W / 2 + dx, y + dy)
    }
    draw(2, 3, '#03050a', 'multiply', 0.7)
    draw(-1.5, -1.5, '#aab3c2', 'screen', 0.38)
    draw(0, 0, '#2c3850', 'screen', 1)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }
  emboss('LEISTUNGSMAPPE FÜR', H * 0.6, 26, 5)
  emboss(company, H * 0.6 + 62, 44)
  return c
}
