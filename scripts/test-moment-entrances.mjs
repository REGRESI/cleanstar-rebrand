/* global window, document */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4194'],{stdio:'ignore'})
let browser
try {
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:4194');break}catch{await new Promise(r=>setTimeout(r,100))}}
 browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
 await p.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
 await p.goto('http://127.0.0.1:4194',{waitUntil:'networkidle'});await p.waitForTimeout(1800)
 for(const selector of ['#arrive-title','.plant-moment h2','[aria-label="Karte des Einzugsgebiets im Ortenaukreis"]']) {
  const el=p.locator(selector).first()
  await p.keyboard.press('Escape')
  await p.evaluate(sel=>{const e=document.querySelector(sel);const host=e.closest('.arrive-run,.plant-heading-read')||e;window.scrollTo(0,host.getBoundingClientRect().top+window.scrollY-700)},selector)
  await p.waitForTimeout(150)
  let held=false
  for(let i=0;i<65;i++){
   await p.mouse.wheel(0,100);await p.waitForTimeout(65)
   if(await el.evaluate(e=>e.hasAttribute('data-heading-active'))){held=true;break}
  }
  assert(held,`${selector} forward entrance holds`)
  const rect=await el.boundingBox();assert(rect.y>=70&&rect.y<844*.45,`${selector} upper reading position: ${rect.y}`)
  const y=await p.evaluate(()=>window.scrollY);const began=Date.now()
  while(await el.evaluate(e=>e.hasAttribute('data-heading-active'))){
   await p.mouse.wheel(0,200);await p.waitForTimeout(80)
   if(await el.evaluate(e=>e.hasAttribute('data-heading-active')))assert(Math.abs(await p.evaluate(()=>window.scrollY)-y)<2,'hold does not twitch')
   assert(Date.now()-began<7000,'hold releases')
  }
  if(selector.includes('h2')||selector.includes('title'))assert.equal(await el.getAttribute('data-pen'),'done','original heading completes before release')
  console.log(`${selector}: forward hold stable, upper position, actual completion and release passed`)
 }
 await p.close()
}finally{await browser?.close();server.kill()}
