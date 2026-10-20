import type { ReactNode, MouseEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useQuote } from './QuoteContext'

interface Props {
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-dark'
  className?: string
  arrow?: boolean
  full?: boolean
  icon?: ReactNode
  wrapClassName?: string
}

/** Link zu /angebot, der per JavaScript das Konfigurator-Modal öffnet. */
export function QuoteButton({ children = 'Kostenloses Angebot', ...props }: Props) {
  const { open } = useQuote()
  return (
    <Button
      to="/angebot"
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        open()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
