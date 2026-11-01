// Exercise the actual hook with a deterministic animation clock and decoded frames.
// Browser integration remains covered by test-home-reading and test:home.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/components/home/useHeroSequence.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
for (const count of [90, 120]) {
  const effects = [], requests = [], draws = [], timers = new Map(), rafs = new Map()
  let id = 0, trigger, decoded, intersection
  const bitmap = { width: 1280, height: 720 }
  const modules = {
    react: { useRef: value => ({ current: value }), useState: value => [value === false ? true : value, () => {}], useEffect: effect => effects.push(effect) },
    'virtual:hero-frames': { default: { keys: [{ progress: 0.37, name: 'feierabend' }] } },
    '@/lib/gsap': { ScrollTrigger: { create: options => { trigger = options; return { kill() {} } }, sort() {}, refresh() {} } },
    '@/lib/idle': { onIdle: () => () => {} },
    './useFrameSequence': { useFrameSequence: (_urls, _enabled, cb) => { decoded = cb; return { frame: index => { requests.push(index); return { img: bitmap } }, progress: 1, failed: false } } },
  }
  const context = {
    exports: {}, require: name => { assert(name in modules, name); return modules[name] },
    window: { scrollY: 100, innerHeight: 844, addEventListener() {}, removeEventListener() {}, clearTimeout: n => timers.delete(n), setTimeout: cb => { timers.set(++id, cb); return id } },
    requestAnimationFrame: cb => { rafs.set(++id, cb); return id }, cancelAnimationFrame: n => rafs.delete(n),
    IntersectionObserver: class { constructor(cb) { intersection = cb } observe() {} disconnect() {} },
  }
  vm.runInNewContext(compiled, context)
  const cv = { width: 1280, height: 720, getContext: () => ({ drawImage: () => draws.push(1) }) }
  context.exports.useHeroSequence({ enabled: true, urls: Array.from({ length: count }, (_, i) => String(i)), section: { current: {} }, pin: { current: {} }, canvas: { current: cv }, lengthVh: 4.6, play: 1 })
  const cleanups = effects.map(effect => effect())
  const flush = () => { const queued = [...rafs.values()]; rafs.clear(); queued.forEach(cb => cb()); assert.equal(rafs.size, 0, 'no independent smoothing loop') }
  flush()
  // Rapid reversal must request the new position on the very next display frame.
  for (const progress of [0.2, 0.8, 0.4, 0.1, 0.36, 0.9, 0]) {
    trigger.onUpdate({ progress }); flush()
    assert.equal(requests.at(-1), Math.round(progress * (count - 1)))
  }
  trigger.onUpdate({ progress: 0.36 }); flush()
  for (const cb of timers.values()) cb()
  decoded(); flush()
  assert.equal(requests.at(-1), Math.round(0.36 * (count - 1)), 'idle keyframe must not change scroll position')
  trigger.onUpdate({ progress: 0.2 }); trigger.onUpdate({ progress: 0.6 })
  assert.equal(rafs.size, 1, 'coalesce scroll updates into one draw')
  flush(); assert.equal(requests.at(-1), Math.round(0.6 * (count - 1)))
  intersection([{ isIntersecting: false }]); const before = requests.length
  trigger.onUpdate({ progress: 0.3 }); flush(); assert.equal(requests.length, before)
  intersection([{ isIntersecting: true }]); flush()
  assert.equal(requests.at(-1), Math.round(0.3 * (count - 1)))
  cleanups.forEach(cleanup => cleanup?.())
  console.log(`${count} frames: reversal, idle, coalescing and visibility passed`)
}
