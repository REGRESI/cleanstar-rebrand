import type { ReactNode } from 'react'
import { company } from '@/content/company'

/** Gelber Hinweis für fehlende Daten. Ausblendbar über company.showTodoMarkers. */
export function Todo({ children, title }: { children?: ReactNode; title?: string }) {
  if (!company.showTodoMarkers) return null
  return (
    <span className="todo-flag ml-1 align-middle" title={title}>
      TODO{children ? <>: {children}</> : null}
    </span>
  )
}

/** Zeigt einen Wert oder, falls null, einen Ersatztext plus TODO-Hinweis. */
export function Fact({ value, fallback, todo }: { value: ReactNode | null | undefined; fallback: ReactNode; todo: string }) {
  if (value !== null && value !== undefined && value !== '') return <>{value}</>
  return (
    <>
      {fallback}
      <Todo title={todo}>{todo}</Todo>
    </>
  )
}
