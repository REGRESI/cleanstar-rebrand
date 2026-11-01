/* global window, getComputedStyle */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4188'],{stdio:'ignore'})
let browser
try {
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:4188');break}catch{await new Promise(r=>setTimeout(r,100))}}
 browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 for(const width of (process.env.WIDTHS || '390,1440').split(',').map(Number)) {
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
  await page.goto('http://127.0.0.1:4188',{waitUntil:'networkidle'});await page.waitForTimeout(2000)
  const jump=async y=>{await page.evaluate(y=>window.__lenis?window.__lenis.scrollTo(y,{immediate:true,force:true}):window.scrollTo(0,y),y);await page.waitForTimeout(180)}
  for(const selector of ['.area-heading-read','.plant-heading-read']) {
   const host=page.locator(selector).first()
   await host.evaluate(e=>e.scrollIntoView({block:'start'}));await page.waitForTimeout(1200)
   const box=await host.evaluate(e=>({y:e.getBoundingClientRect().top+window.scrollY,h:e.offsetHeight}))
   const heading=host.locator('.moment')
   for(let pass=0;pass<2;pass++) {
    await jump(box.y-1200);await jump(box.y)
    assert.equal(await heading.getAttribute('data-mo'),'on',`${width} ${selector} pass ${pass} at ${box.y}`)
    assert.equal(await heading.getAttribute('data-fast'),null)
    await page.waitForTimeout(4000)
    assert.equal(await heading.getAttribute('data-pen'),'done','original pen runs on every entrance')
    const before=await heading.boundingBox()
    await jump(box.y+100)
    const after=await heading.boundingBox()
    assert(Math.abs(before.y-after.y)<2,`${selector} reading copy stays steady: ${before.y} -> ${after.y}`)
    const duration=await heading.locator('.mo-c').first().evaluate(e=>getComputedStyle(e).animationDuration)
    assert.equal(duration,'0.95s','original wave timing restored')
    await jump(box.y+box.h+1000)
    assert.equal(await heading.getAttribute('data-mo'),'out')
    await jump(box.y)
    assert.equal(await heading.getAttribute('data-mo'),'on','reverse entrance replays')
   }
  }
  assert.deepEqual(errors,[])
  console.log(`${width}px: original pen, wave, repeated entrances and stable reading passed`)
  await page.close()
 }
}finally{await browser?.close();server.kill()}
