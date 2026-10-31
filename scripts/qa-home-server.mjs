import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { extname, join, resolve, sep } from 'node:path'
const root = resolve(process.env.QA_ROOT || 'dist')
const types = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.json':'application/json', '.woff2':'font/woff2', '.webp':'image/webp', '.avif':'image/avif', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon', '.txt':'text/plain', '.pdf':'application/pdf', '.mp4':'video/mp4' }
const cache = new Map()
createServer((req,res) => {
  let file = resolve(root, '.' + decodeURI(new URL(req.url,'http://localhost').pathname))
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file,'index.html')
  let status = 200
  if (!existsSync(file)) { status = 404; file = join(root,'404.html') }
  if (!existsSync(file)) { res.writeHead(404); res.end('404'); return }
  const type = types[extname(file)] || 'application/octet-stream'
  const compressed = /text|javascript|json|svg/.test(type) && req.headers['accept-encoding']?.includes('gzip')
  const key = file + compressed
  let data = cache.get(key)
  if (!data) { data = readFileSync(file); if (compressed) data = gzipSync(data); cache.set(key,data) }
  res.writeHead(status, { 'Content-Type':type, 'Content-Length':data.length, ...(compressed ? { 'Content-Encoding':'gzip', Vary:'Accept-Encoding' } : {}) })
  res.end(data)
}).listen(Number(process.env.PORT || 4177),'127.0.0.1',() => console.log('QA server ready'))
