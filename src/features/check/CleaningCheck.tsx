import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { checkQuestions, checkResult } from '@/content/check'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { useReducedMotion } from '@/lib/env'
import { EASE_CS_ARRAY } from '@/lib/ease'

/** Punktzahl typografisch: große Zahl, Label in Monospace, dünne Linie für den Anteil */
function Score({ percent }: { percent: number }) {
  const reduced = useReducedMotion()
  return (
    <div className="w-full max-w-xs shrink-0">
      <p className="t-num">{percent}</p>
      <p className="t-label mt-3">von 100 Punkten</p>
      <span className="mt-4 block h-px bg-line">
        <motion.span
          className="block h-px origin-left bg-ink"
          initial={{ scaleX: reduced ? percent / 100 : 0 }}
          animate={{ scaleX: percent / 100 }}
          transition={{ duration: 1.2, ease: EASE_CS_ARRAY, delay: 0.2 }}
        />
      </span>
    </div>
  )
}

/**
 * Selbsttest mit acht Fragen, eine Frage pro Bildschirm.
 * Alles läuft im Browser. Es wird nichts gespeichert oder gesendet.
 */
export function CleaningCheck() {
  const [answers, setAnswers] = useState<number[]>([])
  const [dir, setDir] = useState(1)
  const top = useRef<HTMLDivElement>(null)
  const step = answers.length
  const done = step >= checkQuestions.length
  const total = checkQuestions.length * 2
  const score = answers.reduce((a, b) => a + b, 0)
  const percent = Math.round((score / total) * 100)

  useEffect(() => {
    if (step > 0) top.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [step])

  const answer = (points: number) => {
    setDir(1)
    setAnswers((a) => [...a, points])
  }
  const back = () => {
    setDir(-1)
    setAnswers((a) => a.slice(0, -1))
  }

  // Drei Hinweise: die Fragen mit den wenigsten Punkten zuerst
  const hints = checkQuestions
    .map((q, i) => ({ ...q.hint, points: answers[i] ?? 2, i }))
    .sort((a, b) => a.points - b.points || a.i - b.i)
    .slice(0, 3)
  const result = checkResult(percent)

  return (
    <div ref={top} className="scroll-mt-28 border-t border-line">
      {!done && (
        <div className="pt-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.8125rem] tabular-nums">
              {String(step + 1).padStart(2, '0')} / {String(checkQuestions.length).padStart(2, '0')}
            </span>
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="inline-flex min-h-10 items-center gap-2 text-[0.9375rem] text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft aria-hidden className="size-4" strokeWidth={1.75} />
                Zurück
              </button>
            )}
          </div>
          <div className="mt-3 h-px bg-line" aria-hidden>
            <motion.div className="h-px bg-ink" animate={{ width: `${(step / checkQuestions.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE_CS_ARRAY }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        {!done ? (
          <motion.fieldset
            key={step}
            initial={{ opacity: 0, x: dir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -30 }}
            transition={{ duration: 0.35, ease: EASE_CS_ARRAY }}
            className="py-10 sm:py-14"
          >
            <legend className="sr-only">{checkQuestions[step].q}</legend>
            <p aria-hidden className="t-h3 max-w-[24ch] text-balance">
              {checkQuestions[step].q}
            </p>
            <div className="mt-10 border-t border-line">
              {checkQuestions[step].answers.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => answer(a.points)}
                  className="group flex min-h-16 w-full items-center justify-between gap-4 border-b border-line py-5 text-left text-[1.25rem] tracking-[-0.01em] text-ink transition-colors hover:text-blue"
                >
                  {a.label}
                  <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform duration-500 ease-cs group-hover:translate-x-1" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </motion.fieldset>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-10 sm:py-14"
            role="status"
          >
            <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-end sm:gap-16">
              <Score percent={percent} />
              <div>
                <p className="t-label">Ihre Auswertung</p>
                <h2 className="t-h3 mt-3">{result.title}</h2>
                <p className="measure mt-4 text-ink-2">{result.text}</p>
              </div>
            </div>
            <h3 className="t-label mt-16">Drei Punkte, die wir Ihnen mitgeben</h3>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
              {hints.map((h, i) => (
                <li key={h.title} className="border-t border-line pt-5">
                  <p className="t-label">{String(i + 1).padStart(2, '0')}</p>
                  <p className="mt-4 text-[1.25rem] font-medium tracking-[-0.015em]">{h.title}</p>
                  <p className="mt-2 text-ink-2">{h.text}</p>
                </li>
              ))}
            </ul>
            <div className="on-dark mt-16 bg-night p-6 text-paper sm:p-10">
              <p className="t-h3">Kostenlose Besichtigung, erster Monat ohne Risiko.</p>
              <p className="mt-3 text-muted-dark">
                Wir sehen uns Ihr Büro an und schicken Ihnen in 48 Stunden ein schriftliches Angebot. Im ersten Monat können Sie jederzeit kündigen.
              </p>
              <div className="btn-row mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                <QuoteButton size="lg" arrow>
                  Kostenlose Besichtigung anfragen
                </QuoteButton>
                <RiskFreeSeal dark />
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-[0.75rem] text-muted">Ihre Antworten bleiben in Ihrem Browser. Es wird nichts gespeichert oder gesendet.</span>
              <button type="button" onClick={() => setAnswers([])} className="ulink self-start py-1 text-[0.9375rem] text-ink sm:self-auto">
                Test neu starten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
