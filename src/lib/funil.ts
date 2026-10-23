import type { LeadOut, LeadStatus } from '../api/types'

export const COLUNAS: LeadStatus[] = ['novo', 'conversando', 'proposta', 'fechado', 'perdido']

const DIA_MS = 86_400_000

/** Agrupa por status; em cada coluna o que esta esfriando (atualizado ha mais tempo) vem primeiro. */
export function agruparPorStatus(leads: LeadOut[]): Record<LeadStatus, LeadOut[]> {
  const grupos: Record<LeadStatus, LeadOut[]> = {
    novo: [],
    conversando: [],
    proposta: [],
    fechado: [],
    perdido: [],
  }
  for (const l of leads) grupos[l.status].push(l)
  for (const c of COLUNAS) {
    grupos[c].sort(
      (a, b) => new Date(a.status_atualizado_em).getTime() - new Date(b.status_atualizado_em).getTime(),
    )
  }
  return grupos
}

/** Dias inteiros (piso) desde a ultima mudanca de status. */
export function diasParado(statusAtualizadoEm: string, agora: Date): number {
  const diff = agora.getTime() - new Date(statusAtualizadoEm).getTime()
  return Math.max(0, Math.floor(diff / DIA_MS))
}

export function estaParado(lead: LeadOut, agora: Date): boolean {
  return lead.status === 'novo' && diasParado(lead.status_atualizado_em, agora) > 2
}
