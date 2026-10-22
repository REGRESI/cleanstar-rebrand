import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react'
import { checkQuestions, checkResult } from '@/content/check'
import { QuoteButton } from '@/features/configurator/QuoteLink'
import { Button } from '@/components/ui/Button'
import { RiskFreeSeal } from '@/components/ui/RiskFreeSeal'
import { useReducedMotion } from '@/lib/env'
import { cn } from '@/lib/cn'

/** Ring-Grafik mit Punktzahl in Prozent */
function ScoreRing({ percent }: { percent: number }) {
  const reduced = useReducedMotion()
  const r = 52
  const c = 2 * Math.PI * r
  const color = percent >= 80 ? 'var(--color-fresh)' : percent >= 50 ? 'var(--color-blue)' : '#f59e0b'
  return (
    <div className="relative size-40 shrink-0 sm:size-44">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-glacier-2)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? c * (1 - percent / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - percent / 100) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <span>
          <span className="block text-4xl font-semibold tracking-tight tabular-nums">{percent}</span>
          <span className="block text-xs text-muted">von 100 Punkten</span>
        </span>
      </div>
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
    <div ref={top} className="scroll-mt-28 overflow-hidden rounded-panel bg-white shadow-lift ring-1 ring-line">
      {!done && (
        <div className="border-b border-line px-6 pt-6 pb-5 sm:px-10">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold tabular-nums">
              Frage {step + 1} von {checkQuestions.length}
            </span>
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 font-medium text-muted transition hover:bg-ink/5 hover:text-ink"
              >
                <ArrowLeft aria-hidden className="size-4" />
                Zurück
              </button>
            )}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-glacier-2" aria-hidden>
            <motion.div className="h-full rounded-full bg-blue" animate={{ width: `${(step / checkQuestions.length) * 100}%` }} transition={{ duration: 0.4 }} />
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 py-8 sm:px-10 sm:py-12"
          >
            <legend className="sr-only">{checkQuestions[step].q}</legend>
            <p aria-hidden className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {checkQuestions[step].q}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3">
              {checkQuestions[step].answers.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => answer(a.points)}
                  className="group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl bg-glacier px-5 py-4 text-left text-lg font-medium text-ink ring-1 ring-transparent transition hover:bg-white hover:ring-blue/40 focus-visible:ring-blue"
                >
                  {a.label}
                  <span aria-hidden className="size-5 shrink-0 rounded-full ring-2 ring-ink/20 transition group-hover:ring-blue" />
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
            className="px-6 py-8 sm:px-10 sm:py-12"
            role="status"
          >
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
              <ScoreRing percent={percent} />
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-blue-hover uppercase">Ihre Auswertung</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{result.title}</h2>
                <p className="mt-3 max-w-xl leading-relaxed text-muted">{result.text}</p>
              </div>
            </div>
            <h3 className="mt-10 text-lg font-semibold">Drei Punkte, die wir Ihnen mitgeben</h3>
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {hints.map((h) => (
                <li key={h.title} className={cn('rounded-card p-5 ring-1', h.points < 2 ? 'bg-glacier ring-blue/15' : 'bg-white ring-line')}>
                  <Lightbulb aria-hidden className="size-5 text-blue" />
                  <p className="mt-3 font-semibold">{h.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-panel bg-ink p-6 text-white sm:p-8">
              <p className="text-2xl font-semibold tracking-tight">Kostenlose Besichtigung, erster Monat ohne Risiko.</p>
              <p className="mt-2 text-white/70">
                Wir sehen uns Ihr Büro an und schicken Ihnen in 48 Stunden ein schriftliches Angebot. Im ersten Monat können Sie jederzeit kündigen.
              </p>
              <div className="btn-row mt-6 flex flex-wrap items-center gap-3">
                <QuoteButton size="lg" arrow>
                  Kostenlose Besichtigung anfragen
                </QuoteButton>
                <RiskFreeSeal dark />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden className="size-4 text-fresh-ink" />
                Ihre Antworten bleiben in Ihrem Browser. Es wird nichts gespeichert oder gesendet.
              </span>
              <Button variant="ghost" size="sm" onClick={() => setAnswers([])} icon={<RotateCcw aria-hidden className="size-4" />}>
                Test neu starten
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
