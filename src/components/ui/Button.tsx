import { useRef, type ReactNode, type MouseEvent, type ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useFinePointer, useReducedMotion } from '@/lib/env'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-dark'
type Size = 'md' | 'lg' | 'sm'

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,border-color] duration-300 ease-out disabled:pointer-events-none disabled:opacity-50'
const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white shadow-glow hover:bg-blue-hover',
  secondary: 'bg-white text-ink ring-1 ring-line ring-inset hover:ring-ink/25 shadow-soft',
  ghost: 'text-ink hover:bg-ink/5',
  light: 'bg-white text-ink hover:bg-glacier',
  'outline-dark': 'text-white ring-1 ring-white/25 ring-inset hover:bg-white/10',
}
const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[0.9375rem]',
  lg: 'h-14 px-7 text-base',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  arrow?: boolean
  icon?: ReactNode
  magnetic?: boolean
  /** volle Breite */
  full?: boolean
  /** Klassen für den äußeren Wrapper (z. B. responsive Sichtbarkeit) */
  wrapClassName?: string
}

type ButtonProps = CommonProps &
  (
    | ({ to: string; href?: never } & Omit<ComponentPropsWithoutRef<typeof Link>, 'to' | 'className' | 'children'>)
    | ({ href: string; to?: never } & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>)
    | ({ to?: never; href?: never } & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>)
  )

/** Button mit dezentem Magnet-Effekt (nur Desktop, nur ohne reduzierte Bewegung). */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, arrow, icon, magnetic = true, full, wrapClassName, ...rest } = props
  const wrap = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const active = magnetic && fine && !reduced
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 })

  const onMove = (e: MouseEvent) => {
    if (!active || !wrap.current) return
    const r = wrap.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  const content = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
    </>
  )
  const cls = cn(base, variants[variant], sizes[size], full && 'w-full', className)

  let el: ReactNode
  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as { to: string }
    el = (
      <Link to={to} className={cls} data-cursor="link" {...linkRest}>
        {content}
      </Link>
    )
  } else if ('href' in rest && rest.href !== undefined) {
    el = (
      <a className={cls} data-cursor="link" {...(rest as ComponentPropsWithoutRef<'a'>)}>
        {content}
      </a>
    )
  } else {
    const btnRest = rest as ComponentPropsWithoutRef<'button'>
    el = (
      <button type={btnRest.type ?? 'button'} className={cls} data-cursor="link" {...btnRest}>
        {content}
      </button>
    )
  }

  return (
    <motion.span ref={wrap} className={full ? 'flex w-full' : (wrapClassName ?? 'inline-flex')} style={active ? { x, y } : undefined} onMouseMove={onMove} onMouseLeave={onLeave}>
      {el}
    </motion.span>
  )
}
