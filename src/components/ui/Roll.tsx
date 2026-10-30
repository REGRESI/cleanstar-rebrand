import { Fragment, type CSSProperties } from 'react'

/**
 * Text, der beim Überfahren und bei Tastatur-Fokus rollt (Referenz: ERA): Jeder Buchstabe rollt einzeln nach oben weg,
 * dieselbe Zeile rollt von unten nach, gestaffelt von links (22 ms je Buchstabe), dabei kurz leicht gestreckt.
 * Auf dem Handy rollt es beim Antippen einmal (Klasse is-roll, gesetzt in Layout.tsx), ohne die Aktion zu verzögern.
 * Der lesbare Text steht einmal im Dokument, beide sichtbaren Zeilen sind gezeichnet (aria-hidden).
 */
export function Roll({ text, className }: { text: string; className?: string }) {
  let i = 0
  const line = (
    <>
      {text.split(' ').map((w, k, arr) => (
        <Fragment key={k}>
          <span className="whitespace-nowrap">
            {Array.from(w).map((ch, j) => (
              <span key={j} className="roll-c" data-c={ch} style={{ '--i': i++ } as CSSProperties} />
            ))}
          </span>
          {k < arr.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
  return (
    <span className={className ? `roll ${className}` : 'roll'}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="roll-a">
        {line}
      </span>
      <span aria-hidden className="roll-b">
        {line}
      </span>
    </span>
  )
}
