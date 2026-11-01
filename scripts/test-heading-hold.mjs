/* global window, document */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4190'],{stdio:'ignore'})
let browser
try{
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:4190');break}catch{await new Promise(r=>setTimeout(r,100))}}
 browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 for(const mobile of (process.env.MOBILE_ONLY ? [true] : [true,false])){
  const p=await browser.newPage({viewport:{width:mobile?390:1440,height:900},isMobile:mobile,hasTouch:mobile})
  await p.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
  await p.goto('http://127.0.0.1:4190',{waitUntil:'networkidle'});await p.waitForTimeout(1800)
  await p.locator('.area-heading-read').evaluate(e=>e.scrollIntoView())
  await p.waitForFunction(()=>document.documentElement.hasAttribute('data-heading-hold'),{timeout:4000})
  const rect=await p.locator('#area-title').boundingBox();assert(rect.y>=90&&rect.y<=900*.4,'heading holds in upper viewport')
  const y=await p.evaluate(()=>window.scrollY)
  await p.mouse.wheel(0,500);await p.waitForTimeout(200)
  assert(Math.abs(await p.evaluate(()=>window.scrollY)-y)<2,'wheel must stay still during heading animation')
  if(mobile){
   const cdp=await p.context().newCDPSession(p)
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650}]})
   for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:650-i*25}]});await p.waitForTimeout(20)}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
   assert(Math.abs(await p.evaluate(()=>window.scrollY)-y)<2,'native touch must stay still during heading animation')
  }
  await p.waitForFunction(()=>!document.documentElement.hasAttribute('data-heading-hold'),{timeout:7500})
  const pen=await p.locator('#area-title').getAttribute('data-pen');assert.equal(pen,'done')
  await p.mouse.wheel(0,300);await p.waitForTimeout(700)
  assert(await p.evaluate(()=>window.scrollY)>y+20,'scroll released after animation')
  // Re-enter from below and verify immediate keyboard escape.
  await p.locator('[data-home-section="cta"]').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(200)
  await p.locator('.area-heading-read').evaluate(e=>e.scrollIntoView());await p.waitForFunction(()=>document.documentElement.hasAttribute('data-heading-hold'),{timeout:4000})
  await p.keyboard.press('Escape');await p.waitForTimeout(100)
  assert.equal(await p.evaluate(()=>document.documentElement.hasAttribute('data-heading-hold')),false)
  await p.emulateMedia({reducedMotion:'reduce'});await p.reload({waitUntil:'networkidle'});await p.locator('#area-title').evaluate(e=>e.scrollIntoView());await p.waitForTimeout(300)
  assert.equal(await p.evaluate(()=>document.documentElement.hasAttribute('data-heading-hold')),false)
  console.log(`${mobile?'Mobile':'Desktop'}: holds, releases on completion, Escape and reduced motion passed`)
  await p.close()
 }
}finally{await browser?.close();server.kill()}
