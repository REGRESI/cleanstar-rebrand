/* global window, document, getComputedStyle */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4192'],{stdio:'ignore'})
let browser
try {
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:4192');break}catch{await new Promise(r=>setTimeout(r,100))}}
 browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 for(const width of [320,390,430,1440]) {
  const p=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'})
  await p.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
  await p.goto('http://127.0.0.1:4192',{waitUntil:'networkidle'})
  const slider=p.locator('.chapter-cost input[type=range]').first()
  await slider.focus();await p.keyboard.press('Home')
  for(let i=0;i<10;i++)await p.keyboard.press('ArrowRight')
  assert.equal(await slider.inputValue(),'6')
  const before=await slider.boundingBox()
  await p.keyboard.press('ArrowRight');assert.equal(await slider.inputValue(),'6.5')
  const after=await slider.boundingBox();assert(Math.abs(before.y-after.y)<1,'decimal hour must not move slider')
  await p.keyboard.press('End');await p.locator('.chapter-cost input[type=range]').nth(1).focus();await p.keyboard.press('End')
  const amounts=await p.locator('.cost-total .rollnum').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth,height:e.getBoundingClientRect().height,font:parseFloat(getComputedStyle(e).fontSize)})))
  for(const a of amounts){assert(a.scroll<=a.width+1,'amount stays whole');assert(a.height<a.font*1.5,'amount stays on one line')}
  assert.equal(await p.locator('.svh-cost-bridge').count(),0)
  const details=p.locator('.map-locations')
  assert.equal(await details.evaluate(e=>e.open),width>=1024)
  if(width<1024)await details.locator('summary').click()
  await details.locator('input').fill('Offenburg');assert.equal(await details.locator('li').count(),1)
  await details.locator('input').fill('xyznotfound');assert.equal(await details.locator('li').count(),0)
  await details.locator('input').fill('')
  const decoration=await p.locator('.ps-problem-text').first().evaluate(e=>getComputedStyle(e).textDecorationLine)
  assert(decoration.includes('line-through'))
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)
  assert.equal(overflow,false,`no document overflow at ${width}`)
  if(width===390) {
   for(const [selector,name] of [['[data-services-stage]','services'],['.chapter-cost','calculator'],['.answer-section','facts']]) {
    await p.locator(selector).first().evaluate(e=>e.scrollIntoView())
    await p.screenshot({path:`/tmp/cleanstar-${name}-new.png`})
   }
  }
  console.log(`${width}px: decimal stability, whole amounts, compact searchable locations, strike-through and overflow passed`)
  if(width===1440) {
   await p.emulateMedia({reducedMotion:'no-preference'});await p.reload({waitUntil:'networkidle'});await p.waitForTimeout(1200)
   await p.locator('#answer-title').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(400)
   assert.equal(await p.locator('[data-home-section="answer"]').evaluate(e=>e.classList.contains('ht-hold')),false,'facts do not park underneath the final CTA')
   assert.equal(await p.locator('[data-home-section="cta"]').getAttribute('data-transition'),'flow-color')
   const answer=await p.locator('.answer-section').boundingBox();const cta=await p.locator('[data-home-section="cta"]').boundingBox()
   assert(cta.y>=answer.y+answer.height-2,'final CTA follows facts without overlap')
   await p.screenshot({path:'/tmp/cleanstar-facts-desktop-final.png'})
   console.log('Desktop: facts and final CTA stay in document flow without overlap')
  }
  await p.close()
 }
}finally{await browser?.close();server.kill()}
