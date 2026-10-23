import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { Shell } from './components/Shell'
import { Funil } from './pages/Funil'
import { Login } from './pages/Login'

function Placeholder({ titulo }: { titulo: string }) {
  return <h1 className="font-mono text-xs uppercase tracking-widest text-muted">{titulo}</h1>
}

// As telas reais entram nas tarefas P3 a P5.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/funil" replace />} />
          <Route path="/funil" element={<Funil />} />
          <Route path="/leads/:id" element={<Funil />} />
          <Route path="/dashboard" element={<Placeholder titulo="Dashboard" />} />
          <Route path="/projetos" element={<Placeholder titulo="Projetos" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/funil" replace />} />
    </Routes>
  )
}
