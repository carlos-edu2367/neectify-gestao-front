import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  me: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.c', nome: 'A' }),
}))

import { AuthProvider, useAuth } from './AuthProvider'

describe('AuthProvider limpa o cache', () => {
  function montar() {
    const qc = new QueryClient()
    qc.setQueryData(['leads'], [{ id: 1, nome: 'PII' }])
    const ref: { current?: ReturnType<typeof useAuth> } = {}
    function Captura() {
      const a = useAuth()
      useEffect(() => {
        ref.current = a
      })
      return null
    }
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <Captura />
        </AuthProvider>
      </QueryClientProvider>,
    )
    return { qc, auth: () => ref.current! }
  }

  it('sair() esvazia o QueryClient', async () => {
    const { qc, auth } = montar()
    await waitFor(() => expect(auth().carregando).toBe(false))
    await act(async () => {
      await auth().sair()
    })
    expect(qc.getQueryData(['leads'])).toBeUndefined()
  })

  it('expirar() (401) esvazia o QueryClient', async () => {
    const { qc, auth } = montar()
    await waitFor(() => expect(auth().carregando).toBe(false))
    act(() => auth().expirar())
    expect(qc.getQueryData(['leads'])).toBeUndefined()
  })
})
