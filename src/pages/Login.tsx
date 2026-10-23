import { useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthProvider'

/** Aceita apenas caminhos internos (evita open redirect). */
function destino(voltar: string | null) {
  return voltar && voltar.startsWith('/') && !voltar.startsWith('//') && !voltar.startsWith('/login')
    ? voltar
    : '/funil'
}

function mensagem(ex: unknown) {
  if (ex instanceof ApiError) {
    if (ex.status === 401) return 'E-mail ou senha incorretos.'
    if (ex.status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
    if (ex.status === 0) return 'Sem conexão. Verifique a internet e tente de novo.'
  }
  return 'Não foi possível entrar. Tente de novo.'
}

export function Login() {
  const { gestor, carregando, entrar } = useAuth()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const alvo = destino(params.get('voltar'))

  if (!carregando && gestor) return <Navigate to={alvo} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await entrar(email, senha) // ao definir o gestor, o <Navigate> acima leva ao destino
    } catch (ex) {
      setErro(mensagem(ex))
      setEnviando(false)
    }
  }

  const campo =
    'mt-1.5 block w-full rounded-md border border-line bg-ink px-3 py-2.5 text-base text-text outline-none focus:border-cyan'

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-line bg-ink-2 p-6 sm:p-8">
        <p className="bg-[image:var(--grad)] bg-clip-text font-display text-4xl font-black leading-none tracking-tight text-transparent">
          neectify
        </p>
        <p className="mb-7 mt-1 font-mono text-xs uppercase tracking-widest text-muted">Painel</p>
        <label className="block text-sm text-muted">
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
        <label className="mt-4 block text-sm text-muted">
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
          <p role="alert" className="mt-4 text-sm text-danger">
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-md bg-cyan px-3 py-2.5 font-semibold text-ink disabled:opacity-60"
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
