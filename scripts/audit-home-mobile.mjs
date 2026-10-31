import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import { mkdirSync, writeFileSync } from 'node:fs'
mkdirSync('.lighthouse',{recursive:true})
mkdirSync('docs/review-uebergaenge',{recursive:true})
const browser = await chromium.launch({args:['--remote-debugging-port=9222','--no-sandbox','--disable-dev-shm-usage']})
try {
  const r = await lighthouse(process.env.B || 'http://127.0.0.1:4177', { port:9222, output:['json','html'], onlyCategories:['performance'], logLevel:'error' })
  writeFileSync('.lighthouse/mobile.json',r.report[0])
  writeFileSync('.lighthouse/mobile.html',r.report[1])
  const summary = { source:'Production build served with gzip; Lighthouse default Mobile simulation', score:r.lhr.categories.performance.score * 100, metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k => [k,{value:r.lhr.audits[k].numericValue,display:r.lhr.audits[k].displayValue}])) }
  writeFileSync('docs/review-uebergaenge/lighthouse-mobile.json',JSON.stringify(summary,null,2))
  console.log(JSON.stringify(summary,null,2))
  if (summary.score <= 90 || summary.metrics['cumulative-layout-shift'].value !== 0) process.exitCode = 1
} finally { await browser.close() }
