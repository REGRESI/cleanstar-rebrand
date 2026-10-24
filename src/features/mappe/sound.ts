/**
 * Leises Papiergeräusch beim Umblättern, ohne Audiodatei: kurzes, gefiltertes Rauschen mit weicher Hüllkurve.
 * Standardmäßig aus; wird erst nach Klick auf das Lautsprecher-Symbol erzeugt.
 */
let ctx: AudioContext | null = null

export function playPageTurn(volume = 0.16) {
  ctx ??= new AudioContext()
  const ac = ctx
  if (ac.state === 'suspended') void ac.resume()
  const dur = 0.42
  const buf = ac.createBuffer(1, Math.round(ac.sampleRate * dur), ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length
    // Rascheln: Rauschen mit unregelmäßiger Körnung, am Anfang und Ende leiser
    data[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(t * 38 + Math.random())) * Math.sin(Math.PI * Math.pow(t, 0.7))
  }
  const src = ac.createBufferSource()
  src.buffer = buf
  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.setValueAtTime(2400, ac.currentTime)
  band.frequency.linearRampToValueAtTime(1300, ac.currentTime + dur)
  band.Q.value = 0.7
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0, ac.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.06)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur)
  src.connect(band).connect(gain).connect(ac.destination)
  src.start()
}
