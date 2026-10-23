import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../components/Toast'
import { apiFetch } from './client'
import type { ProjetoOut, ProjetoPatch } from './types'

export const listProjetos = () => apiFetch<{ items: ProjetoOut[] }>('/v1/projetos')

export const updateProjeto = (id: string, patch: ProjetoPatch) =>
  apiFetch<ProjetoOut>(`/v1/projetos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })

export function useProjetos() {
  return useQuery({ queryKey: ['projetos'], queryFn: listProjetos })
}

/** PATCH parcial; ao concluir substitui o projeto no cache da lista e do lead. */
export function useAtualizarProjeto(id: string) {
  const qc = useQueryClient()
  const { aviso } = useToast()
  return useMutation({
    mutationFn: (patch: ProjetoPatch) => updateProjeto(id, patch),
    onSuccess: (novo) => {
      qc.setQueryData<{ items: ProjetoOut[] }>(['projetos'], (d) =>
        d ? { ...d, items: d.items.map((p) => (p.id === novo.id ? novo : p)) } : d,
      )
      void qc.invalidateQueries({ queryKey: ['lead', novo.lead_id] })
    },
    onError: () => aviso('Não foi possível salvar o projeto. Tente de novo.'),
  })
}
