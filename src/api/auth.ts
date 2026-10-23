import { apiFetch } from './client'
import type { Usuario } from './types'

export const login = (email: string, senha: string) =>
  apiFetch<void>('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) })

export const logout = () => apiFetch<void>('/v1/auth/logout', { method: 'POST' })

export const me = () => apiFetch<Usuario>('/v1/auth/me')
