import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function RequireAuth() {
  const { gestor, carregando } = useAuth()
  const loc = useLocation()
  if (carregando) {
    return (
      <p role="status" className="grid min-h-screen place-items-center font-mono text-xs uppercase tracking-widest text-muted">
        Carregando
      </p>
    )
  }
  if (!gestor) {
    const voltar = encodeURIComponent(loc.pathname + loc.search)
    return <Navigate to={`/login?voltar=${voltar}`} replace />
  }
  return <Outlet />
}
