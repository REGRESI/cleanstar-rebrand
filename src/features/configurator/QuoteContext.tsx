import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ObjectType = 'buero' | 'praxis' | 'gewerbe' | 'sonstiges'

interface QuoteCtx {
  isOpen: boolean
  /** optional: Objektart vorauswählen */
  prefill: ObjectType | null
  open: (prefill?: ObjectType) => void
  close: () => void
}

const Ctx = createContext<QuoteCtx>({ isOpen: false, prefill: null, open: () => {}, close: () => {} })

/** Steuert das Konfigurator-Modal, das von überall geöffnet werden kann. */
export function QuoteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [prefill, setPrefill] = useState<ObjectType | null>(null)
  const open = useCallback((p?: ObjectType) => {
    setPrefill(p ?? null)
    setOpen(true)
  }, [])
  const close = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ isOpen, prefill, open, close }), [isOpen, prefill, open, close])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useQuote = () => useContext(Ctx)
