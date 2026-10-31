/* global window, document, getComputedStyle, requestAnimationFrame */
// Regression: real reading time and native touch gestures, not only jumps to screenshots.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'

const B = process.env.B || 'http://127.0.0.1:4180'
const out = 'docs/review-uebergaenge/scrollkorrektur'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const results = []
try {
  for (const mobile of [false, true]) {
    const device = mobile ? 'Mobile' : 'Desktop'
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => sessionStorage.setItem('cs-pl', '1'))
    await page.goto(B, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    const jump = async y => {
      await page.evaluate(y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y), y)
      await page.waitForTimeout(250)
    }
    const top = id => page.locator(`[data-home-section="${id}"]`).evaluate(e => e.getBoundingClientRect().top + window.scrollY)
    const vh = await page.locator('.ht-viewport').evaluate(e => e.offsetHeight)
    const problems = await top('problems-morning')
    for (const [i, fraction] of [0.2, 0.5, 0.8].entries()) {
      await jump(problems - vh * (1 - fraction))
      const cost = await page.locator('[data-home-section="cost"] > .ht-plane').evaluate(e => ({ opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform, filter: getComputedStyle(e).filter }))
      assert.equal(cost.opacity, '1', `${device}: calculator must remain opaque`)
      assert.equal(cost.transform, 'none', `${device}: calculator must stay in normal flow`)
      assert.equal(cost.filter, 'none', `${device}: calculator must remain sharp`)
      await page.screenshot({ path: `${out}/${device}-kosten-${i + 1}.jpg`, type: 'jpeg' })
    }
    const team = await top('team')
    await jump(team)
    // The house trigger must be initialized before checking its reading interval.
    await jump(await top('founders') - vh * 0.5)
    await jump(team)
    const founders = await top('founders')
    const readingDistance = founders - vh - team
    assert(readingDistance >= vh - 2, `${device}: at least one full viewport of reading before the house (${readingDistance}px)`)
    for (const [i, fraction] of [0, 0.5, 0.95].entries()) {
      await jump(team + readingDistance * fraction)
      const state = await page.evaluate(() => {
        const heading = document.querySelector('#team-moment')
        const visual = heading.querySelector('.moment-v')
        const rect = heading.getBoundingClientRect()
        return { top: rect.top, bottom: rect.bottom, opacity: getComputedStyle(visual).opacity, state: heading.dataset.mo, house: Number(document.querySelector('[data-home-section="founders"]').dataset.progress || 0) }
      })
      assert.equal(state.house, 0, `${device}: house must wait until reading ends`)
      assert.equal(state.state, 'done', `${device}: heading must already be readable`)
      assert.equal(state.opacity, '1')
      assert(state.top > 0 && state.bottom < vh, `${device}: full heading remains in view`)
      await page.screenshot({ path: `${out}/${device}-team-lesen-${i + 1}.jpg`, type: 'jpeg' })
    }
    let touch = null
    let touchFrameTimes = null
    if (mobile) {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'decorations must not widen the mobile layout viewport')
      assert.equal(await page.evaluate(() => window.__lenis?.options.syncTouch ?? false), false, 'touch momentum must stay native')
      assert.equal(await page.locator('.plant[data-gl]').count(), 0, 'no continuously rendered plant canvases on touch')
      await jump(team + 10)
      const headingBeforeTouch = await page.locator('#team-moment').boundingBox()
      const session = await page.context().newCDPSession(page)
      await page.evaluate(() => {
        window.touchSamples = []
        window.touchTimes = []
        window.touchSampling = true
        const sample = time => { window.touchSamples.push(window.scrollY); window.touchTimes.push(time); if (window.touchSampling) requestAnimationFrame(sample) }
        requestAnimationFrame(sample)
      })
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 660 }] })
      for (let i = 1; i <= 15; i++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 660 - i * 20 }] })
        await page.waitForTimeout(30)
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await page.waitForTimeout(100)
      touch = await page.evaluate(() => { window.touchSampling = false; return window.touchSamples })
      touchFrameTimes = await page.evaluate(() => window.touchTimes.slice(1).map((t, i) => t - window.touchTimes[i]))
      writeFileSync(`${out}/touch-trace.json`, JSON.stringify({positions:touch, frameTimes:touchFrameTimes}))
      assert(touch.at(-1) - touch[0] > 100, 'real touch gesture must move the page')
      assert(touch.every((y, i) => i === 0 || y >= touch[i - 1] - 1), 'forward touch gesture must not jump backwards')
      const headingAfterTouch = await page.locator('#team-moment').boundingBox()
      writeFileSync(`${out}/touch-heading.json`, JSON.stringify({before:headingBeforeTouch,after:headingAfterTouch}))
      assert(Math.abs(headingAfterTouch.y - headingBeforeTouch.y) < 2, 'team text must remain still during its reading interval')
      const house = await page.locator('[data-home-section="founders"]').getAttribute('data-progress')
      assert.equal(Number(house || 0), 0, 'house stays out while swiping through the reading interval')
      await page.screenshot({ path: `${out}/Mobile-team-nach-wischen.jpg`, type: 'jpeg' })
      await jump(founders - vh * 0.5)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, 'the growing house must not widen the viewport either')
      await page.screenshot({ path: `${out}/Mobile-haus-mitte.jpg`, type: 'jpeg' })
      await session.detach()
    }
    assert.deepEqual(errors, [])
    results.push({ device, readingDistance, viewport: vh, touch, touchFrameTimes, errors })
    await page.close()
  }
} finally {
  await browser.close()
}
writeFileSync(`${out}/lesezeit-touch.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results.map(({ device, readingDistance, viewport, touch, errors }) => ({ device, readingDistance, viewport, touchFrames: touch?.length, errors })), null, 2))
