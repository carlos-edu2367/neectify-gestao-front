export type Categoria = 'site' | 'automacao' | 'ia' | 'sistema' | 'conversar'
export type Porte = 'solo' | 'ate10' | '11a50' | '50mais'
export type Urgencia = 'imediata' | 'semanas' | 'meses' | 'pesquisando'
export type LeadStatus = 'novo' | 'conversando' | 'proposta' | 'fechado' | 'perdido'
export type ProjetoStatus = 'planejamento' | 'andamento' | 'revisao' | 'entregue' | 'pausado'
export type FormaPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'BOLETO'
export type Canal = 'google' | 'meta' | 'indicacao' | 'direto' | 'outro'

export interface NotaOut {
  id: string
  texto: string
  created_at: string
}

export interface ProjetoOut {
  id: string
  lead_id: string
  lead_nome: string
  titulo: string
  /** decimal em string, ex.: "4500.00" */
  valor: string
  forma_pagamento: FormaPagamento
  status: ProjetoStatus
  planejamento: string | null
  ultima_atualizacao: string | null
  created_at: string
  updated_at: string
}

export interface LeadOut {
  id: string
  nome: string
  empresa: string | null
  email: string
  whatsapp: string
  categoria: Categoria
  segmento: string
  porte: Porte
  urgencia: Urgencia
  dor: string
  status: LeadStatus
  canal: Canal
  origem_pagina: string
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  consentimento_marketing: boolean
  created_at: string
  status_atualizado_em: string
}

export interface LeadDetail extends LeadOut {
  notas: NotaOut[]
  projeto: ProjetoOut | null
}

export interface LeadsPage {
  items: LeadOut[]
  total: number
}

export interface Usuario {
  id: string
  nome: string
  email: string
}

export interface Stats {
  leads_por_semana: { semana: string; total: number }[]
  por_categoria: Record<Categoria, number>
  por_canal: Record<Canal, number>
  taxa_fechamento: number
  parados: number
}

export interface LeadsQuery {
  status?: LeadStatus
  categoria?: Categoria
  q?: string
  page?: number
  limit?: number
}

export interface ProjetoPatch {
  status?: ProjetoStatus
  planejamento?: string
  ultima_atualizacao?: string
  valor?: string
  titulo?: string
}

export interface ProjetoCreate {
  titulo: string
  valor: string
  forma_pagamento: FormaPagamento
}
