import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Sidebar } from './Sidebar'

export function Shell() {
  const { gestor } = useAuth()
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="p-4 pb-20 md:ml-52 md:p-6 md:pb-6">
        <p className="mb-3 text-right font-mono text-xs text-muted" data-testid="gestor-nome">
          {gestor?.nome}
        </p>
        <Outlet />
      </main>
    </div>
  )
}
