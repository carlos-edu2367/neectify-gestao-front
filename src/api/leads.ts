import { apiFetch } from './client'
import type {
  LeadDetail,
  LeadOut,
  LeadStatus,
  LeadsPage,
  LeadsQuery,
  NotaOut,
  ProjetoCreate,
  ProjetoOut,
} from './types'

export function listLeads(query: LeadsQuery = {}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') p.set(k, String(v))
  }
  const qs = p.toString()
  return apiFetch<LeadsPage>(`/v1/leads${qs ? `?${qs}` : ''}`)
}

export const getLead = (id: string) => apiFetch<LeadDetail>(`/v1/leads/${id}`)

export const updateLeadStatus = (id: string, status: LeadStatus) =>
  apiFetch<LeadOut>(`/v1/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })

export const addNota = (id: string, texto: string) =>
  apiFetch<NotaOut>(`/v1/leads/${id}/notas`, { method: 'POST', body: JSON.stringify({ texto }) })

export const converterEmProjeto = (id: string, body: ProjetoCreate) =>
  apiFetch<ProjetoOut>(`/v1/leads/${id}/projeto`, { method: 'POST', body: JSON.stringify(body) })
