import { apiFetch } from './client'
import type { Stats } from './types'

export const getStats = (dias = 90) => apiFetch<Stats>(`/v1/stats?dias=${dias}`)
