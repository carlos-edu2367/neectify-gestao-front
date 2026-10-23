import { afterEach, describe, expect, it, vi } from 'vitest'

async function carregar() {
  vi.resetModules()
  return import('./client')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('falha alto no carregamento sem VITE_API_URL fora do modo mock', async () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('VITE_API_MOCK', '')
    await expect(carregar()).rejects.toThrow(/VITE_API_URL/)
  })

  it('aceita BASE vazia quando o mock esta ativo em dev', async () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('VITE_API_MOCK', '1')
    await expect(carregar()).resolves.toBeDefined()
  })

  it('corpo 200 que nao e JSON vira ApiError resposta_invalida', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.exemplo.test')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>oi</html>', { status: 200 })))
    const { apiFetch, ApiError } = await carregar()
    const erro = await apiFetch('/x').catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect(erro).toMatchObject({ status: 0, detail: 'resposta_invalida' })
  })
})
