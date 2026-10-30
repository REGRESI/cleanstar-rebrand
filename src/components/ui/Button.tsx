import type { ReactNode, ComponentPropsWithoutRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Roll } from './Roll'

/**
 * primary: Markenblau, für die eine Hauptaktion pro Bildschirm
 * secondary / outline: 1-px-Rahmen, für zweite Aktionen (z. B. Telefon)
 * link: Textlink mit Pfeil und animiertem Unterstrich
 * light / outline-dark: auf dunklem Grund
 */
type Variant = 'primary' | 'secondary' | 'outline' | 'link' | 'ghost' | 'light' | 'outline-dark'
type Size = 'md' | 'lg' | 'sm'

const variants: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-outline',
  outline: 'btn btn-outline',
  ghost: 'btn btn-outline',
  light: 'btn btn-light',
  'outline-dark': 'btn btn-outline-dark',
  link: 'tlink text-left',
}
const sizes: Record<Size, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  arrow?: boolean
  icon?: ReactNode
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

/** Rechteckiger Button bzw. Textlink mit Pfeil. Text rollt beim Überfahren (Roll-System), kein Größensprung. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, arrow, icon, full, wrapClassName, ...rest } = props
  const isLink = variant === 'link'
  const content = (
    <>
      {icon}
      <span className="min-w-0">{typeof children === 'string' ? <Roll text={children} /> : children}</span>
      {(arrow || isLink) && <ArrowRight aria-hidden className="btn-arrow size-4 shrink-0" strokeWidth={1.75} />}
    </>
  )
  const cls = cn(variants[variant], !isLink && sizes[size], full && 'w-full', className)

  let el: ReactNode
  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as { to: string }
    el = (
      <Link to={to} className={cls} {...linkRest}>
        {content}
      </Link>
    )
  } else if ('href' in rest && rest.href !== undefined) {
    el = (
      <a className={cls} {...(rest as ComponentPropsWithoutRef<'a'>)}>
        {content}
      </a>
    )
  } else {
    const btnRest = rest as ComponentPropsWithoutRef<'button'>
    el = (
      <button type={btnRest.type ?? 'button'} className={cls} {...btnRest}>
        {content}
      </button>
    )
  }

  return <span className={full ? 'flex w-full' : cn('max-w-full', wrapClassName ?? 'inline-flex')}>{el}</span>
}
