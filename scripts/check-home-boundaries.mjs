/* global window, innerHeight */
// Fast boundary, reversal, Reduced Motion and no-JS checks; complements the 80px screenshot scan.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
const browser = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const B = process.env.B || 'http://127.0.0.1:4177'
let failures=[]
const metrics=[]
for(const mobile of [false,true]) for(const reduced of [false,true]) {
 const p=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:reduced?'reduce':'no-preference'})
 const errs=[]
 p.on('pageerror',e=>errs.push(e.message))
 await p.addInitScript(()=>{ sessionStorage.setItem('cs-pl','1');window.shifts=[];new PerformanceObserver(l=>l.getEntries().filter(e=>!e.hadRecentInput).forEach(e=>window.shifts.push({value:e.value,sources:e.sources.map(s=>s.node?.className)}))).observe({type:'layout-shift',buffered:true}) })
 await p.goto(B,{waitUntil:'networkidle'});await p.waitForTimeout(3000)
 const blocks=await p.locator('[data-home-transitions] > [data-home-section]').evaluateAll(es=>es.map(e=>e.dataset.homeSection))
 for(const id of blocks.slice(1)) {
   const node=p.locator(`[data-home-section="${id}"]`)
   if(!(await node.getAttribute('data-transition'))) failures.push(`Missing ${id}`)
   for(const k of [0,.25,.5,.75,1,.5,0]) {
    await node.evaluate((e,k)=>{const y=e.getBoundingClientRect().top+window.scrollY-innerHeight*(1-k);if(window.__lenis)window.__lenis.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y)},k)
    await p.waitForTimeout(40)
    if(reduced) {
      const style=await node.locator(':scope > .ht-plane').getAttribute('style')
      if(/clip-path|translate3d/.test(style||'')) failures.push(`Reduced motion: ${id}`)
    }
   }
 }
 const footer=await p.locator('footer[data-home-section="footer"]').getAttribute('data-transition')
 if(footer!=='image-to-stripe') failures.push('footer missing')
 metrics.push({mobile,reduced,errors:errs,cls:await p.evaluate(()=>window.shifts.reduce((a,e)=>a+e.value,0)),shifts:await p.evaluate(()=>window.shifts)})
 failures.push(...errs)
 await p.close()
}
for(const mobile of [false,true]){
const p=await browser.newPage({javaScriptEnabled:false,viewport:mobile?{width:390,height:844}:{width:1440,height:900}})
await p.goto(B);if(!(await p.locator('h1').first().isVisible()))failures.push('No-JS h1')
if(await p.locator('[data-home-transitions] section').count()<12)failures.push('No-JS sections')
await p.close()
}
await browser.close()
mkdirSync('docs/review-uebergaenge',{recursive:true})
writeFileSync('docs/review-uebergaenge/boundary-check.json',JSON.stringify({failures,metrics},null,2))
console.log(JSON.stringify({failures,metrics:metrics.map(m=>({mobile:m.mobile,reduced:m.reduced,errors:m.errors,cls:m.cls}))},null,2))
if(failures.length)process.exit(1)
