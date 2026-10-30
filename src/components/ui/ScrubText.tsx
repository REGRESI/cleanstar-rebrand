import type { ReactNode } from 'react'
import { AnimatedText } from './AnimatedText'

/**
 * Alter Färbe-Effekt, jetzt Teil des Text-Systems: Überschriften laufen als „headline“ (einmalige Farbwelle),
 * Absätze als „paragraph“ (an die Scrollposition gekoppelt).
 */
export function ScrubText({
  as = 'p',
  text,
  className,
  id,
  onComplete,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  text: string
  className?: string
  id?: string
  onComplete?: () => void
  children?: ReactNode
}) {
  return (
    <AnimatedText as={as} mode={as === 'p' ? 'paragraph' : 'headline'} text={text} className={className} id={id} onDone={onComplete}>
      {children}
    </AnimatedText>
  )
}
