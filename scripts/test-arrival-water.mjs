/* global window, document, MutationObserver, getComputedStyle */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4196'],{stdio:'ignore'})
let browser
try {
 for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:4196');break}catch{await new Promise(r=>setTimeout(r,100))}}
 browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 for(const height of (process.env.STRUCTURE_ONLY ? [] : [740,844])) {
  const p=await browser.newPage({viewport:{width:390,height},isMobile:true,hasTouch:true})
  await p.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
  await p.goto('http://127.0.0.1:4196',{waitUntil:'networkidle'});await p.waitForTimeout(1200)
  await p.evaluate(()=>{
   const title=document.querySelector('#arrive-title');window.arrivalRuns=0
   new MutationObserver(records=>{for(const r of records)if(r.attributeName==='data-pen'&&title.getAttribute('data-pen')==='run'&&r.oldValue!=='run')window.arrivalRuns++}).observe(title,{attributes:true,attributeFilter:['data-pen'],attributeOldValue:true})
  })
  const run=p.locator('.arrive-run')
  const start=await run.evaluate(e=>e.getBoundingClientRect().top+window.scrollY)
  await p.evaluate(y=>{window.__lenis?.scrollTo(y-180,{immediate:true,force:true});window.scrollTo(0,y-180)},start);await p.waitForTimeout(150)
  let held=false
  for(let i=0;i<50;i++){await p.mouse.wheel(0,70);await p.waitForTimeout(70);if(await p.locator('#arrive-title').evaluate(e=>e.hasAttribute('data-heading-active'))){held=true;break}}
  assert(held,'arrival holds once it has settled')
  assert((await p.locator('#arrive-title').boundingBox()).y>=100,'title does not need a correction into the circle')
  // Mobile browser chrome changes the viewport while the title is running.
  await p.setViewportSize({width:390,height:height-12});await p.waitForTimeout(100);await p.setViewportSize({width:390,height})
  await p.waitForFunction(()=>!document.querySelector('#arrive-title').hasAttribute('data-heading-active'),{timeout:7500})
  assert.equal(await p.locator('#arrive-title').getAttribute('data-pen'),'done')
  for(let i=0;i<16;i++){await p.mouse.wheel(0,95);await p.waitForTimeout(70)}
  assert.equal(await p.evaluate(()=>window.arrivalRuns),1,'one pen animation per forward visit, including viewport changes')
  assert.equal(await p.locator('#arrive-title').evaluate(e=>e.hasAttribute('data-heading-active')),false,'no renewed lock after completion')
  // Leaving the whole scene and coming back really must replay it.
  await p.locator('[data-services-stage]').evaluate(e=>{const y=e.getBoundingClientRect().top+window.scrollY+250;window.__lenis?.scrollTo(y,{immediate:true,force:true});window.scrollTo(0,y)});await p.waitForTimeout(200)
  let reverse=false
  for(let i=0;i<35;i++){await p.mouse.wheel(0,-85);await p.waitForTimeout(70);if(await p.locator('#arrive-title').evaluate(e=>e.hasAttribute('data-heading-active'))){reverse=true;break}}
  assert(reverse,'a genuine return visit replays the heading')
  await p.waitForFunction(()=>!document.querySelector('#arrive-title').hasAttribute('data-heading-active'),{timeout:7500})
  assert.equal(await p.evaluate(()=>window.arrivalRuns),2,'exactly one further animation on return')
  await p.keyboard.press('Escape')
  const morning=p.locator('[data-home-internal="morning"]')
  await morning.evaluate(e=>{const y=e.getBoundingClientRect().top+window.scrollY;window.__lenis?.scrollTo(y,{immediate:true,force:true});window.scrollTo(0,y)});await p.waitForTimeout(200)
  assert.equal(await morning.locator('.pr-stage').evaluate(e=>getComputedStyle(e).position),'relative')
  assert((await morning.boundingBox()).height<=height+2,'morning has no extra scroll runway')
  assert.equal(await morning.locator('.pr-word').evaluate(e=>getComputedStyle(e).opacity),'1')
  const y=await p.evaluate(()=>window.scrollY);await p.mouse.wheel(0,200);await p.waitForTimeout(300)
  assert(await p.evaluate(()=>window.scrollY)>y+100,'morning lets scrolling continue immediately')
  assert.equal(await p.evaluate(()=>document.documentElement.hasAttribute('data-heading-hold')),false)
  const water=p.locator('.chapter-cost .water-seam')
  await water.evaluate(e=>{const y=e.getBoundingClientRect().top+window.scrollY-500;window.__lenis?.scrollTo(y,{immediate:true,force:true});window.scrollTo(0,y)});await p.waitForTimeout(200)
  const before=await water.locator('.water-body').getAttribute('d')
  await p.mouse.wheel(0,200);await p.waitForTimeout(250)
  const after=await water.locator('.water-body').getAttribute('d')
  assert.notEqual(before,after,'water shape follows page scrolling')
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false)
  await p.screenshot({path:`/tmp/cleanstar-water-${height}.png`})
  console.log(`${height}px mobile: single entrance, viewport resize, return replay, free morning and scroll-shaped water passed`)
  await p.close()
 }
 for(const [width,reduced] of [[1440,false],[390,true]]) {
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:reduced?'reduce':'no-preference'})
  await p.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
  await p.goto('http://127.0.0.1:4196',{waitUntil:'networkidle'});await p.waitForTimeout(1200)
  const morning=p.locator('[data-home-internal="morning"]')
  assert.equal(await morning.locator('.pr-stage').evaluate(e=>getComputedStyle(e).position),'relative')
  assert((await morning.boundingBox()).height<=902,'morning has one viewport without a runway')
  assert.equal(await p.locator('[data-home-section="problems-morning"]').evaluate(e=>e.classList.contains('ht-hold')),false)
  assert.equal(await p.locator('[data-home-section="team"]').evaluate(e=>e.classList.contains('ht-incoming')),false)
  const water=p.locator('.chapter-cost .water-seam')
  await water.evaluate(e=>{const y=e.getBoundingClientRect().top+window.scrollY-500;window.__lenis?.scrollTo(y,{immediate:true,force:true});window.scrollTo(0,y)});await p.waitForTimeout(200)
  const before=await water.locator('.water-body').getAttribute('d')
  await p.mouse.wheel(0,180);await p.waitForTimeout(400)
  const after=await water.locator('.water-body').getAttribute('d')
  if(reduced)assert.equal(before,after,'reduced motion keeps water still')
  else assert.notEqual(before,after,'desktop water follows scrolling')
  assert.equal(await p.evaluate(()=>document.documentElement.hasAttribute('data-heading-hold')),false)
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false)
  await p.screenshot({path:`/tmp/cleanstar-water-${width}-reduced-${reduced}.png`})
  console.log(`${width}px reduced=${reduced}: free morning, no overlapping team entrance, water and overflow passed`)
  await p.close()
 }
}finally{await browser?.close();server.kill()}
