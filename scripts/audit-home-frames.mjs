/* global window, requestAnimationFrame */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
const browser = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
const results=[]
try {
 for(const [device,viewport] of [['Desktop',{width:1440,height:900}],['Mobile',{width:390,height:844}]]) {
  const page=await browser.newPage({viewport,isMobile:device==='Mobile',hasTouch:device==='Mobile'})
  await page.goto(process.env.B || 'http://127.0.0.1:4177',{waitUntil:'networkidle'})
  await page.waitForTimeout(2500)
  for(const id of ['cost','problems-morning','team','founders','mappe']) {
   const top=await page.locator('[data-home-section="'+id+'"]').evaluate(e=>e.getBoundingClientRect().top+window.scrollY)
   await page.evaluate(y=>window.__lenis ? window.__lenis.scrollTo(y,{immediate:true,force:true}) : window.scrollTo(0,y),top-viewport.height)
   await page.waitForTimeout(600)
   const times=await page.evaluate(async ({top,height})=>{
    const times=[];let last=window.performance.now()
    for(let i=0;i<90;i++) { const now=await new Promise(requestAnimationFrame); if(i>5)times.push(now-last);last=now;const y=top-height+height*(i/89); if(window.__lenis)window.__lenis.scrollTo(y,{immediate:true,force:true});else window.scrollTo(0,y) }
    return times
   },{top,height:viewport.height})
   const sorted=[...times].sort((a,b)=>a-b)
   results.push({device,id,frames:times.length,fps:1000/(times.reduce((a,b)=>a+b,0)/times.length),p95Ms:sorted[Math.floor(sorted.length*.95)],over33Ms:times.filter(n=>n>33.4).length})
  }
  await page.close()
 }
}finally{await browser.close()}
mkdirSync('docs/review-uebergaenge',{recursive:true})
writeFileSync('docs/review-uebergaenge/frame-times.json',JSON.stringify({environment:'Headless CI with software WebGL, not a native-GPU device guarantee',results},null,2))
console.log(JSON.stringify(results,null,2))
