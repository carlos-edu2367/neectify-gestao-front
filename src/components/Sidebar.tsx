import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'

const ITENS = [
  { to: '/funil', label: 'Funil' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projetos', label: 'Projetos' },
]

const base = 'flex items-center rounded-md px-3 py-2 text-sm'

/** Navegacao: barra lateral no desktop (>= md), barra inferior no celular. */
export function Sidebar() {
  const navigate = useNavigate()

  async function sair() {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    `${base} max-md:flex-1 max-md:justify-center max-md:py-3 ${
      isActive ? 'bg-white/[.06] text-cyan' : 'text-muted hover:text-text'
    }`

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-ink-2 md:inset-y-0 md:right-auto md:w-52 md:flex-col md:gap-1 md:border-t-0 md:border-r md:p-3"
    >
      <p className="hidden px-3 pb-4 pt-2 font-display text-2xl font-black uppercase tracking-wide md:block">
        Neectify
      </p>
      {ITENS.map((i) => (
        <NavLink key={i.to} to={i.to} className={link}>
          {i.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={sair}
        className={`${base} text-muted hover:text-text max-md:flex-1 max-md:justify-center max-md:py-3 md:mt-auto`}
      >
        Sair
      </button>
    </nav>
  )
}
