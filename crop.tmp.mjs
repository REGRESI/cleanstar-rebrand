import sharp from 'sharp'
const [,, file, top, height, out, width] = process.argv
const img = sharp(file)
const m = await img.metadata()
const h = Math.min(+height, m.height - +top)
await sharp(file).extract({ left: 0, top: +top, width: m.width, height: h }).resize({ width: +(width || m.width) }).jpeg({ quality: 70 }).toFile(out)
console.log(m.width, m.height)
