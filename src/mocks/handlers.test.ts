import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { apiFetch, ApiError } from '../api/client'
import type { LeadDetail, LeadsPage, ProjetoOut, Stats } from '../api/types'
import { resetDb } from './db'
import { handlers } from './handlers'

const server = setupServer(...handlers)
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
  // Node exige URL absoluta
  const orig = globalThis.fetch
  globalThis.fetch = (i, init) => orig(typeof i === 'string' && i.startsWith('/') ? `http://mock.local${i}` : i, init)
})
afterAll(() => server.close())
beforeEach(async () => {
  resetDb()
  await apiFetch('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'carlos@neectify.com', senha: 'senha-teste' }) })
})

describe('mock da API', () => {
  it('rejeita credenciais invalidas', async () => {
    await expect(
      apiFetch('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: 'x@y.com', senha: 'no' }) }),
    ).rejects.toMatchObject({ status: 401, detail: 'credenciais_invalidas' })
  })

  it('lista 12 leads, filtra por q e status', async () => {
    const all = await apiFetch<LeadsPage>('/v1/leads')
    expect(all.total).toBe(12)
    const q = await apiFetch<LeadsPage>('/v1/leads?q=padaria')
    expect(q.items.length).toBeGreaterThan(0)
    const novos = await apiFetch<LeadsPage>('/v1/leads?status=novo')
    expect(novos.items.every((l) => l.status === 'novo')).toBe(true)
  })

  it('exige header do painel (403)', async () => {
    await expect(apiFetch('/v1/leads', { headers: { 'X-Neectify-Client': 'outro' } })).rejects.toBeInstanceOf(ApiError)
  })

  it('converte lead em projeto e responde 409 na segunda vez', async () => {
    const { items } = await apiFetch<LeadsPage>('/v1/leads?status=novo')
    const id = items[0].id
    const body = JSON.stringify({ titulo: 'Site novo', valor: '4500', forma_pagamento: 'PIX' })
    const p = await apiFetch<ProjetoOut>(`/v1/leads/${id}/projeto`, { method: 'POST', body })
    expect(p.valor).toBe('4500.00')
    const d = await apiFetch<LeadDetail>(`/v1/leads/${id}`)
    expect(d.status).toBe('fechado')
    await expect(apiFetch(`/v1/leads/${id}/projeto`, { method: 'POST', body })).rejects.toMatchObject({
      status: 409,
      detail: 'lead_ja_tem_projeto',
    })
  })

  it('stats: 2 parados, semanas contiguas', async () => {
    const s = await apiFetch<Stats>('/v1/stats?dias=90')
    expect(s.parados).toBe(2)
    expect(s.leads_por_semana.length).toBeGreaterThan(10)
    expect(s.leads_por_semana.reduce((a, w) => a + w.total, 0)).toBe(12)
    expect(s.taxa_fechamento).toBeCloseTo(2 / 4)
  })
})
