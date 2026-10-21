import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { PhoneIncoming } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

const CallbackForm = lazy(() => import('./CallbackForm'))

interface Ctx {
  isOpen: boolean
  open: () => void
  close: () => void
}
const CallbackCtx = createContext<Ctx>({ isOpen: false, open: () => {}, close: () => {} })

/** Rückruf-Fenster, das von überall geöffnet werden kann (neben jedem „Anrufen“). */
export function CallbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close])
  return (
    <CallbackCtx.Provider value={value}>
      {children}
      <Modal open={isOpen} onClose={close} title="Rückruf anfordern">
        <Suspense fallback={<div className="grid h-80 place-items-center text-muted">Wird geladen …</div>}>
          <CallbackForm onDone={close} />
        </Suspense>
      </Modal>
    </CallbackCtx.Provider>
  )
}

export const useCallbackRequest = () => useContext(CallbackCtx)

/** Link-Button „Rückruf anfordern“ */
export function CallbackButton({ className, dark, label = 'Rückruf anfordern' }: { className?: string; dark?: boolean; label?: string }) {
  const { open } = useCallbackRequest()
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold underline-offset-4 transition hover:underline active:opacity-70',
        dark ? 'text-white' : 'text-blue-hover',
        className,
      )}
    >
      <PhoneIncoming aria-hidden className="size-4" />
      {label}
    </button>
  )
}
