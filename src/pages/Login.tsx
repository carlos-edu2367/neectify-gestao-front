import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { login } from '../api/auth'

// Formulario base; o fluxo completo (redirecionar com `voltar`, 429 etc.) vem na tarefa P2.
export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await login(email, senha)
      navigate('/funil', { replace: true })
    } catch (ex) {
      setErro(
        ex instanceof ApiError && ex.status === 401
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar. Tente de novo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  const campo =
    'mt-1 w-full rounded-md border border-line bg-ink-2 px-3 py-2.5 text-text placeholder:text-muted'

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-line bg-ink-2 p-6">
        <p className="font-display text-3xl font-black uppercase tracking-wide">Neectify</p>
        <p className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">Painel</p>
        <label className="block text-sm">
          E-mail
          <input
            className={campo}
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          Senha
          <input
            className={campo}
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        {erro && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="mt-5 w-full rounded-md bg-cyan px-3 py-2.5 font-semibold text-ink disabled:opacity-60"
        >
          Entrar
        </button>
      </form>
    </main>
  )
}
