/* global window */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
const B = process.env.B || 'http://localhost:4177'
const pass = process.env.PASS || '1'
const out = `docs/review-uebergaenge/durchgang-${pass}`
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
const results = []
for (const [device, viewport] of [['Desktop',{width:1440,height:900}],['Mobile',{width:390,height:844}]]) {
  const context = await browser.newContext({viewport, reducedMotion:'no-preference',isMobile:device==='Mobile',hasTouch:device==='Mobile'})
  await context.addInitScript(() => {
    sessionStorage.setItem('cs-pl','1')
    window.__reviewCLS = 0
    window.__reviewShiftSources = []
    new PerformanceObserver(list => { for(const e of list.getEntries()) if(!e.hadRecentInput) { window.__reviewCLS += e.value; window.__reviewShiftSources.push({value:e.value,sources:e.sources.map(s=>s.node?.className)}) } }).observe({type:'layout-shift',buffered:true})
  })
  const page = await context.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto(B,{waitUntil:'networkidle'})
  await page.waitForTimeout(3500)
  const sections = await page.locator('[data-home-transitions] > [data-home-section]').evaluateAll(es=>es.map(e=>({id:e.dataset.homeSection,type:e.dataset.transition,top:e.getBoundingClientRect().top+window.scrollY,h:e.offsetHeight})))
  for(const s of sections.filter(s=>['card-stack','flow-color','light-edge','logo-house','growing-window'].includes(s.type))) {
    const frames=[]
    for(const [i,p] of [0,.25,.5,.75,1].entries()) {
      await page.evaluate(y=>{ if(window.__lenis) window.__lenis.scrollTo(y,{immediate:true,force:true}); else window.scrollTo(0,y) },await page.locator(`[data-home-section="${s.id}"]`).evaluate(e=>e.getBoundingClientRect().top+window.scrollY)-viewport.height+p*viewport.height)
      await page.waitForTimeout(220)
      const file=`${device}-${s.id}-${String(i+1).padStart(2,'0')}.jpg`
      const bytes=await page.screenshot({type:'jpeg',quality:80})
      await sharp(bytes).resize({width:device==='Mobile'?390:720}).toFile(`${out}/${file}`)
      frames.push(await sharp(bytes).resize({width:device==='Mobile'?390:720}).toBuffer())
    }
    const meta=await sharp(frames[0]).metadata()
    await sharp({create:{width:meta.width*frames.length,height:meta.height,channels:3,background:'#ffffff'}}).composite(frames.map((input,i)=>({input,left:i*meta.width,top:0}))).jpeg({quality:85}).toFile(`${out}/${device}-${s.id}-folge.jpg`)
  }
  results.push({device,sections,cls:await page.evaluate(()=>window.__reviewCLS),shifts:await page.evaluate(()=>window.__reviewShiftSources),errors})
  await context.close()
}
await browser.close()
writeFileSync(`${out}/messung.json`,JSON.stringify(results,null,2))
console.log(JSON.stringify(results.map(({device,cls,errors})=>({device,cls,errors}))))
