import { apiFetch } from './client'
import type { ProjetoOut, ProjetoPatch } from './types'

export const listProjetos = () => apiFetch<{ items: ProjetoOut[] }>('/v1/projetos')

export const updateProjeto = (id: string, patch: ProjetoPatch) =>
  apiFetch<ProjetoOut>(`/v1/projetos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
