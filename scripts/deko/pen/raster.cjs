const { chromium } = require('playwright')
const fs = require('fs')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1600, height: 1600 } })
  await p.goto('http://127.0.0.1:5199/', { waitUntil: 'domcontentloaded' })
  const res = await p.evaluate(async () => {
    const f = new FontFace('PenTest', 'url(/src/assets/fonts/pinyon-script-caps.woff2)')
    await f.load(); document.fonts.add(f)
    const out = {}
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWZ') {
      const c = document.createElement('canvas'); c.width = 1400; c.height = 1300
      const g = c.getContext('2d'); g.font = '600px PenTest'; g.fillStyle = '#000'; g.textBaseline = 'alphabetic'
      g.fillText(ch, 300, 900)
      out[ch] = { png: c.toDataURL('image/png'), adv: g.measureText(ch).width / 600 }
    }
    return out
  })
  for (const [ch, v] of Object.entries(res)) fs.writeFileSync(`${process.argv[2]}/${ch}.png`, Buffer.from(v.png.split(',')[1], 'base64'))
  fs.writeFileSync(`${process.argv[2]}/adv.json`, JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.adv]))))
  await b.close()
})()
