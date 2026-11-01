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
  for(const width of (process.env.WIDTHS || '390,430,1440').split(',').map(Number)) for(const reduced of [false,true]) {
    const page=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768,reducedMotion:reduced?'reduce':'no-preference'})
    const errors=[];page.on('pageerror',e=>errors.push(e.message))
    await page.addInitScript(()=>sessionStorage.setItem('cs-pl','1'))
    await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(2000)
    const service=page.locator('[data-services-stage]')
    const count=await service.locator('[data-panel]').count();assert.equal(count,6)
    if(width<768){
      const list=service.locator('ol')
      await list.evaluate(e=>e.scrollIntoView({block:'center'}));await page.waitForTimeout(500)
      const initial=await list.boundingBox()
      for(const i of [0,1,2,3,4,5,2,0]){
        await list.evaluate((e,i)=>{const card=e.querySelector('[data-panel]');e.scrollLeft=i*(card.offsetWidth+16)},i)
        await page.waitForTimeout(250)
        const card=service.locator('[data-panel]').nth(i)
        assert.equal(await card.evaluate(e=>getComputedStyle(e).transform),'none','native cards never transform')
        assert.equal(await card.evaluate(e=>e.inert),false)
        const r=await card.boundingBox()
        assert(Math.abs(r.y-initial.y)<2,'horizontal movement never shifts card height')
        assert(r.x>=0&&r.x+r.width<=width+1,`native card ${i} fits: ${JSON.stringify(r)}`)
      }
      assert(await list.evaluate(e=>e.scrollWidth>e.clientWidth),'cards form a native horizontal rail')
      const before=await page.evaluate(()=>window.scrollY)
      const cdp=await page.context().newCDPSession(page)
      const touchY=Math.max(120,Math.min(750,initial.y+120))
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width-70,y:touchY}]})
      for(let k=1;k<=10;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width-70-k*22,y:touchY}]});await page.waitForTimeout(20)}
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
      await page.waitForTimeout(400)
      assert(await list.evaluate(e=>e.scrollLeft)>50,'native touch swipes the cards')

      await page.mouse.wheel(250,0);await page.waitForTimeout(350)
      assert(Math.abs(await page.evaluate(()=>window.scrollY)-before)<2,'horizontal input does not move page vertically')
      await page.screenshot({path:`/tmp/native-services-${width}.png`})
    }
    await page.locator('#area-title').evaluate(e=>e.scrollIntoView({block:'center'}));await page.waitForTimeout(2000)
    const heading=await page.locator('#area-title').evaluate(e=>({out:e.style.getPropertyValue('--out'),visible:getComputedStyle(e.querySelector('.moment-v')).opacity}))
    assert.equal(heading.visible,'1');assert(!heading.out||Number(heading.out)===0)
    const path=page.locator('.steps-fill');assert.equal(await path.count(),1)
    assert((await path.getAttribute('d')).includes(' C '),'smooth cubic spine')
    assert((await page.evaluate(()=>document.documentElement.scrollWidth))<=width,'no horizontal overflow')
    assert.deepEqual(errors,[])
    console.log(`${width}px reduced=${reduced}: cards, heading, spine and overflow passed`)
    await page.close()
  }
}finally{await browser?.close();server?.kill()}
