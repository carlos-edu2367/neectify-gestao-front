import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from './AuthProvider'

/**
 * Qualquer 401 vindo de consulta ou mutacao leva ao /login, preservando a rota de volta.
 * (O QueryClient fica em main.tsx; aqui apenas assinamos os caches.)
 */
export function SessaoExpirada() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { expirar } = useAuth()

  useEffect(() => {
    const aoErro = (error: unknown) => {
      if (!(error instanceof ApiError) || error.status !== 401) return
      expirar()
      const atual = window.location.pathname + window.location.search
      if (window.location.pathname === '/login') return
      navigate(`/login?voltar=${encodeURIComponent(atual)}`, { replace: true })
    }
    const u1 = qc.getQueryCache().subscribe((e) => {
      if (e.type === 'updated' && e.action.type === 'error') aoErro(e.action.error)
    })
    const u2 = qc.getMutationCache().subscribe((e) => {
      if (e.type === 'updated' && e.action.type === 'error') aoErro(e.action.error)
    })
    return () => {
      u1()
      u2()
    }
  }, [qc, navigate, expirar])

  return null
}
