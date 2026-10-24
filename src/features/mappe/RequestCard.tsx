import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { submitForm } from '@/features/forms/submit'
import { TextField, PrivacyCheckbox, Honeypot } from '@/features/forms/fields'
import { EASE_CS_ARRAY } from '@/lib/ease'
import { cleanName } from './personal'

type Phase = 'out' | 'form' | 'sending' | 'sent' | 'back'

/**
 * Anfragekarte aus dem Einsteckfach: Die Karte gleitet aus dem Fach zur Mitte, dreht sich zur Betrachterin
 * und ist auf der Rückseite ein kurzes Formular. Nach dem Senden steckt sie sich mit Bestätigung wieder ins Fach.
 */
export function RequestCard({ from, company, onClose }: { from: DOMRect; company: string; onClose: (sent: boolean) => void }) {
  const [phase, setPhase] = useState<Phase>('out')
  const [error, setError] = useState<string | null>(null)
  const [privacyError, setPrivacyError] = useState<string | undefined>()
  const first = useRef<HTMLInputElement>(null)
  const sentRef = useRef(false)
  const vw = window.innerWidth
  const vh = window.innerHeight
  const W = Math.min(460, vw - 32)
  const H = Math.min(620, vh - 40)
  const center = { left: (vw - W) / 2, top: (vh - H) / 2, width: W, height: H, rotate: 0 }
  const pocket = { left: from.left, top: from.top, width: from.width, height: from.height, rotate: -2.5 }
  const flipped = phase === 'form' || phase === 'sending'
  const home = phase === 'back'

  useEffect(() => {
    const t = window.setTimeout(() => setPhase((p) => (p === 'out' ? 'form' : p)), 620)
    return () => window.clearTimeout(t)
  }, [])
  useEffect(() => {
    if (phase === 'form') window.setTimeout(() => first.current?.focus(), 450)
  }, [phase])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && phase !== 'sending' && setPhase('back')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (!f.get('privacy')) return setPrivacyError('Bitte stimmen Sie der Datenverarbeitung zu.')
    setPrivacyError(undefined)
    setPhase('sending')
    const firm = cleanName(String(f.get('firma') ?? ''))
    const r = await submitForm({
      subject: `Besichtigung (Leistungsmappe)${firm ? ': ' + firm : ''}`,
      name: String(f.get('name') ?? ''),
      botcheck: String(f.get('botcheck') ?? ''),
      lines: [
        ['Name', String(f.get('name') ?? '')],
        ['Firma', firm],
        ['Telefon', String(f.get('telefon') ?? '')],
        ['Wunschtermin', String(f.get('termin') ?? '')],
        ['Quelle', 'Anfragekarte in der Leistungsmappe'],
      ],
    })
    if (!r.ok) {
      setError('Das hat leider nicht geklappt. Bitte rufen Sie uns an oder versuchen Sie es gleich noch einmal.')
      return setPhase('form')
    }
    sentRef.current = true
    setPhase('sent')
    window.setTimeout(() => setPhase('back'), 1600)
  }

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Kostenlose Besichtigung anfragen">
      <motion.div
        className="absolute inset-0 bg-night/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: home ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => phase === 'form' && setPhase('back')}
      />
      <motion.div
        className="absolute [perspective:1600px]"
        initial={pocket}
        animate={home ? pocket : center}
        transition={{ duration: 0.75, ease: EASE_CS_ARRAY }}
        onAnimationComplete={() => home && onClose(sentRef.current)}
      >
        <motion.div
          className="relative size-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped || phase === 'sent' ? 180 : 0 }}
          transition={{ duration: 0.7, ease: EASE_CS_ARRAY }}
        >
          {/* Vorderseite: wie im Fach */}
          <div className="absolute inset-0 bg-[#fbfaf6] p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] [backface-visibility:hidden]">
            <span className="t-label block text-blue">Anfragekarte</span>
            <span className="mt-2 block text-[26px] leading-tight font-medium tracking-[-0.02em] text-ink">Kostenlose Besichtigung</span>
          </div>
          {/* Rückseite: das Formular */}
          <div className="absolute inset-0 overflow-y-auto bg-[#fbfaf6] p-6 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
            <AnimatePresence mode="wait">
              {phase === 'sent' ? (
                <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col justify-center">
                  <p className="t-label text-blue">Gesendet</p>
                  <p className="mt-2 text-[28px] leading-tight font-medium tracking-[-0.02em]">Danke. Wir melden uns innerhalb von 24 Stunden.</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={send} className="relative flex flex-col gap-4" noValidate={false}>
                  <div className="flex items-baseline justify-between">
                    <p className="t-label text-blue">Kostenlose Besichtigung</p>
                    <button type="button" onClick={() => setPhase('back')} className="t-label text-ink hover:text-blue">
                      Zurückstecken
                    </button>
                  </div>
                  <TextField ref={first} label="Name" name="name" required autoComplete="name" />
                  <TextField label="Firma" name="firma" defaultValue={company} autoComplete="organization" maxLength={60} optional />
                  <TextField label="Telefon" name="telefon" type="tel" required autoComplete="tel" />
                  <TextField label="Wunschtermin" name="termin" type="date" optional min={new Date().toISOString().slice(0, 10)} />
                  <PrivacyCheckbox name="privacy" value="ja" error={privacyError} />
                  <Honeypot name="botcheck" />
                  {error && (
                    <p role="alert" className="text-[0.875rem] text-danger">
                      {error}
                    </p>
                  )}
                  <button type="submit" disabled={phase === 'sending'} className="btn btn-primary mt-1 w-full">
                    {phase === 'sending' ? 'Wird gesendet …' : 'Anfrage senden'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
