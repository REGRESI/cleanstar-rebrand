/* global window, document, getComputedStyle */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
const url = process.env.B || 'http://127.0.0.1:4186'
const server = process.env.B ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4186'], { stdio: 'ignore' })
let browser
try {
  if(server) for(let i=0;i<100;i++){try{await fetch(url);break}catch{await new Promise(r=>setTimeout(r,100))}}
  browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
  for(const width of [390,430,1440]) for(const reduced of [false,true]) {
    const page=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768,reducedMotion:reduced?'reduce':'no-preference'})
    const errors=[];page.on('pageerror',e=>errors.push(e.message))
    await page.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
    await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(2000)
    const service=page.locator('[data-services-stage]')
    const count=await service.locator('[data-panel]').count();assert.equal(count,6)
    if(width<768&&!reduced){
      const run=await service.locator(':scope > div').evaluate(e=>({top:e.getBoundingClientRect().top+window.scrollY,height:e.offsetHeight,stage:e.firstElementChild.offsetHeight}))
      for(const i of [0,1,2,3,4,5,2,0]){
        await page.evaluate(y=>window.__lenis?window.__lenis.scrollTo(y,{immediate:true,force:true}):window.scrollTo(0,y),run.top+(run.height-run.stage)*i/5)
        await page.waitForTimeout(180)
        const card=service.locator('[data-panel]').nth(i)
        assert.equal(await card.evaluate(e=>e.inert),false,`card ${i} reachable`)
        const r=await card.boundingBox();assert(r.x>=0&&r.x+r.width<=width+1&&r.y+r.height<=900,`card ${i} fits`);const text=await card.locator('.svh-text').boundingBox();assert(text.y+text.height<850,`card ${i} copy fits above mobile bar`)
      }
      await page.screenshot({path:`/tmp/light-thread-${width}.png`})
    }
    await page.locator('#area-title').evaluate(e=>e.scrollIntoView({block:'center'}));await page.waitForTimeout(2000)
    const heading=await page.locator('#area-title').evaluate(e=>({out:e.style.getPropertyValue('--out'),visible:getComputedStyle(e.querySelector('.moment-v')).opacity}))
    assert.equal(heading.visible,'1');assert(!heading.out||Number(heading.out)===0)
    const path=page.locator('.steps-fill');assert.equal(await path.count(),1)
    assert((await path.getAttribute('d')).includes(' C '),'smooth cubic spine')
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width)
    assert.deepEqual(errors,[])
    console.log(`${width}px reduced=${reduced}: cards, heading, spine and overflow passed`)
    await page.close()
  }
}finally{await browser?.close();server?.kill()}
