import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../components/Toast'
import { apiFetch } from './client'
import type {
  Categoria,
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

export const leadKey = (id: string) => ['lead', id] as const

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: leadKey(id ?? ''),
    queryFn: () => getLead(id as string),
    enabled: !!id,
    retry: false,
  })
}

export function useAdicionarNota(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (texto: string) => addNota(id, texto),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKey(id) }),
  })
}

export function useConverterProjeto(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ProjetoCreate) => converterEmProjeto(id, body),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: leadKey(id) })
      void qc.invalidateQueries({ queryKey: ['leads'] })
      void qc.invalidateQueries({ queryKey: ['projetos'] })
    },
  })
}

export interface FiltrosLeads {
  categoria?: Categoria
  q?: string
}

/** Carrega ate 200 leads (paginacao real fora de escopo). */
export function useLeads(filtros: FiltrosLeads) {
  const { categoria, q } = filtros
  return useQuery({
    queryKey: ['leads', { categoria: categoria ?? null, q: q ?? '' }],
    queryFn: () => listLeads({ limit: 200, categoria, q }),
    placeholderData: keepPreviousData,
  })
}

/** Mudanca de status com update otimista; em erro restaura o cache e avisa. */
export function useMudarStatus() {
  const qc = useQueryClient()
  const { aviso } = useToast()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateLeadStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['leads'] })
      await qc.cancelQueries({ queryKey: leadKey(id) })
      const anteriores = qc.getQueriesData<LeadsPage>({ queryKey: ['leads'] })
      const detalhe = qc.getQueryData<LeadDetail>(leadKey(id))
      if (detalhe) qc.setQueryData<LeadDetail>(leadKey(id), { ...detalhe, status })
      const agora = new Date().toISOString()
      qc.setQueriesData<LeadsPage>({ queryKey: ['leads'] }, (page) =>
        page
          ? {
              ...page,
              items: page.items.map((l) =>
                l.id === id ? { ...l, status, status_atualizado_em: agora } : l,
              ),
            }
          : page,
      )
      return { anteriores, detalhe, id }
    },
    onError: (_erro, _vars, ctx) => {
      for (const [key, data] of ctx?.anteriores ?? []) qc.setQueryData(key, data)
      if (ctx?.detalhe) qc.setQueryData(leadKey(ctx.id), ctx.detalhe)
      aviso('Não foi possível mover o lead. Tente de novo.')
    },
    onSettled: (_d, _e, { id }) => {
      void qc.invalidateQueries({ queryKey: leadKey(id) })
      return qc.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
