import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

interface ToastValue {
  aviso: (mensagem: string) => void
}

const ToastContext = createContext<ToastValue | null>(null)

const DURACAO_MS = 6000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const aviso = useCallback((m: string) => {
    setMensagem(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMensagem(null), DURACAO_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const value = useMemo(() => ({ aviso }), [aviso])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
        {mensagem && (
          <div
            role="alert"
            className="pointer-events-auto flex items-center gap-3 rounded-md border border-danger/50 bg-ink-2 px-4 py-2.5 text-sm shadow-lg"
          >
            <span>{mensagem}</span>
            <button
              type="button"
              onClick={() => setMensagem(null)}
              aria-label="Fechar aviso"
              className="font-mono text-xs text-muted hover:text-text"
            >
              x
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast fora do ToastProvider')
  return ctx
}
