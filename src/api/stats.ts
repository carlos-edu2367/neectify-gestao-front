import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { apiFetch } from './client'
import type { Stats } from './types'

export type Periodo = 30 | 90 | 180

export const getStats = (dias: number = 90) => apiFetch<Stats>(`/v1/stats?dias=${dias}`)

export function useStats(dias: Periodo = 90) {
  return useQuery({
    queryKey: ['stats', dias],
    queryFn: () => getStats(dias),
    placeholderData: keepPreviousData,
  })
}
