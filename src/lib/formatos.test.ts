import { describe, expect, it } from 'vitest'
import { formatarBRL, formatarData, linkWhatsApp, ou, valorParaApi } from './formatos'

const nbsp = (s: string) => s.replace(/ /g, ' ')

describe('linkWhatsApp', () => {
  it('usa so os digitos', () => {
    expect(linkWhatsApp('+5562986359294')).toBe('https://wa.me/5562986359294')
  })
})

describe('valorParaApi', () => {
  it.each([
    ['4.500,00', '4500.00'],
    ['4500', '4500.00'],
    ['R$ 4.500', '4500.00'],
    ['4500,5', '4500.50'],
    ['4500.00', '4500.00'],
    ['  R$ 1.234.567,89 ', '1234567.89'],
  ])('%s -> %s', (entrada, saida) => {
    expect(valorParaApi(entrada)).toBe(saida)
  })

  it.each(['', '   ', 'abc', '-100', 'R$', '12,345,67', '1,2,3', '4500,123', '1e5'])('rejeita %j', (t) => {
    expect(valorParaApi(t)).toBeNull()
  })
})

describe('formatarBRL', () => {
  it('formata em reais', () => {
    expect(nbsp(formatarBRL('4500.00'))).toBe('R$ 4.500,00')
  })
})

describe('formatarData', () => {
  it('usa dd/MM/yyyy HH:mm em America/Sao_Paulo', () => {
    expect(formatarData('2026-10-23T15:30:00Z')).toBe('23/10/2026 12:30')
    expect(formatarData('2026-01-01T02:05:00Z')).toBe('31/12/2025 23:05')
  })
})

describe('ou', () => {
  it('troca nulo e vazio por travessao', () => {
    expect(ou(null)).toBe('—')
    expect(ou(undefined)).toBe('—')
    expect(ou('  ')).toBe('—')
    expect(ou('x')).toBe('x')
  })
})
