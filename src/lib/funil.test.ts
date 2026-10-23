import { describe, expect, it } from 'vitest'
import type { LeadOut } from '../api/types'
import { agruparPorStatus, COLUNAS, diasParado, estaParado } from './funil'

function lead(over: Partial<LeadOut>): LeadOut {
  return {
    id: 'x',
    nome: 'N',
    empresa: null,
    email: 'a@b.c',
    whatsapp: '+55',
    categoria: 'site',
    segmento: 's',
    porte: 'solo',
    urgencia: 'meses',
    dor: 'd',
    status: 'novo',
    canal: 'direto',
    origem_pagina: '/',
    referrer: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    consentimento_marketing: false,
    created_at: '2026-10-01T00:00:00Z',
    status_atualizado_em: '2026-10-01T00:00:00Z',
    ...over,
  }
}

const AGORA = new Date('2026-10-23T14:59:00Z')

describe('agruparPorStatus', () => {
  it('tem as 5 chaves mesmo vazio', () => {
    const g = agruparPorStatus([])
    expect(Object.keys(g)).toEqual([...COLUNAS])
    for (const c of COLUNAS) expect(g[c]).toEqual([])
  })
  it('ordena do mais antigo para o mais recente dentro da coluna', () => {
    const a = lead({ id: 'a', status_atualizado_em: '2026-10-22T00:00:00Z' })
    const b = lead({ id: 'b', status_atualizado_em: '2026-10-10T00:00:00Z' })
    const c = lead({ id: 'c', status: 'proposta' })
    const g = agruparPorStatus([a, b, c])
    expect(g.novo.map((l) => l.id)).toEqual(['b', 'a'])
    expect(g.proposta.map((l) => l.id)).toEqual(['c'])
  })
})

describe('diasParado / estaParado', () => {
  it('usa piso em dias inteiros', () => {
    expect(diasParado('2026-10-20T15:00:00Z', AGORA)).toBe(2)
  })
  it('novo com 3 dias esta parado; com 2 nao; outro status nunca', () => {
    expect(estaParado(lead({ status_atualizado_em: '2026-10-20T14:00:00Z' }), AGORA)).toBe(true)
    expect(estaParado(lead({ status_atualizado_em: '2026-10-21T14:00:00Z' }), AGORA)).toBe(false)
    expect(
      estaParado(lead({ status: 'conversando', status_atualizado_em: '2026-10-13T14:00:00Z' }), AGORA),
    ).toBe(false)
  })
})
