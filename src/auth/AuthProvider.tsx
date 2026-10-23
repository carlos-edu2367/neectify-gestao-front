import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login, logout, me } from '../api/auth'
import type { Usuario } from '../api/types'

interface AuthValue {
  gestor: Usuario | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
  /** Limpa a sessao local (usado quando qualquer chamada devolve 401). */
  expirar: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [gestor, setGestor] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true
    me()
      .then((u) => vivo && setGestor(u))
      .catch(() => vivo && setGestor(null))
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [])

  const entrar = useCallback(async (email: string, senha: string) => {
    await login(email, senha)
    setGestor(await me())
  }, [])

  const sair = useCallback(async () => {
    try {
      await logout()
    } catch (e) {
      // O cookie pode continuar valido no servidor; o estado local e limpo de qualquer forma.
      console.error('Falha ao encerrar a sessao no servidor', e)
    } finally {
      setGestor(null)
    }
  }, [])

  const expirar = useCallback(() => setGestor(null), [])

  const value = useMemo(
    () => ({ gestor, carregando, entrar, sair, expirar }),
    [gestor, carregando, entrar, sair, expirar],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
