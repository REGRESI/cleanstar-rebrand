import type { ComponentProps } from 'react'
import { AnimatedText } from './AnimatedText'

/** Überschrift im Text-System (Modus „headline“), alter Name für bestehende Aufrufe. */
export function RevealText(props: Omit<ComponentProps<typeof AnimatedText>, 'mode'>) {
  return <AnimatedText mode="headline" {...props} />
}
