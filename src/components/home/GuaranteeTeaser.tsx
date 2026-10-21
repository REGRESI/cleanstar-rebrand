import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RevealText } from '@/components/ui/RevealText'
import { home } from '@/content/site'

export function GuaranteeTeaser() {
  return (
    <section className="on-dark relative overflow-hidden bg-ink py-28 text-white sm:py-40" aria-labelledby="guarantee-title">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[48rem] -translate-x-1/2 -translate-y-1/2 [background:radial-gradient(closest-side,rgb(31_94_255/0.4),transparent)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fresh/60 to-transparent" />
      <div className="container-site relative text-center">
        <span aria-hidden className="mx-auto mb-8 grid size-16 place-items-center rounded-2xl bg-white/5 text-fresh ring-1 ring-white/10" data-reveal>
          <ShieldCheck className="size-8" strokeWidth={1.5} />
        </span>
        <p className="eyebrow mb-6 justify-center" data-reveal>
          {home.guarantee.eyebrow}
        </p>
        <RevealText
          as="h2"
          id="guarantee-title"
          text={home.guarantee.statement}
          className="mx-auto max-w-5xl text-[2rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        />
        <p className="lead mx-auto mt-8 max-w-2xl" data-reveal>
          {home.guarantee.text}
        </p>
        <div className="mt-10 flex justify-center" data-reveal>
          <Button to="/qualitaetsgarantie" variant="light" size="lg" arrow>
            So funktioniert die Garantie
          </Button>
        </div>
      </div>
    </section>
  )
}
