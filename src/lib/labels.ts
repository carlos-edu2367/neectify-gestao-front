import type {
  Canal,
  Categoria,
  FormaPagamento,
  LeadStatus,
  Porte,
  ProjetoStatus,
  Urgencia,
} from '../api/types'

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  site: 'Site e presença digital',
  automacao: 'Automação de processos',
  ia: 'IA no meu negócio',
  sistema: 'Sistema sob medida',
  conversar: 'Ainda não sei, quero conversar',
}

export const PORTE_LABEL: Record<Porte, string> = {
  solo: 'Só eu',
  ate10: 'Até 10 pessoas',
  '11a50': '11 a 50 pessoas',
  '50mais': 'Mais de 50 pessoas',
}

export const URGENCIA_LABEL: Record<Urgencia, string> = {
  imediata: 'Pra ontem',
  semanas: 'Próximas semanas',
  meses: 'Próximos meses',
  pesquisando: 'Só pesquisando',
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: 'Novo',
  conversando: 'Conversando',
  proposta: 'Proposta enviada',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

export const PROJETO_STATUS_LABEL: Record<ProjetoStatus, string> = {
  planejamento: 'Em planejamento',
  andamento: 'Em andamento',
  revisao: 'Em revisão',
  entregue: 'Entregue',
  pausado: 'Pausado',
}

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  PIX: 'PIX',
  CREDITO: 'Crédito',
  DEBITO: 'Débito',
  BOLETO: 'Boleto',
}

export const CANAL_LABEL: Record<Canal, string> = {
  google: 'Google',
  meta: 'Meta',
  indicacao: 'Indicação',
  direto: 'Direto',
  outro: 'Outro',
}

export const LEAD_STATUS_ORDER: LeadStatus[] = ['novo', 'conversando', 'proposta', 'fechado', 'perdido']

/** Estilo de tag por categoria (consumido por components/Tag em tarefas seguintes). */
export interface TagStyle {
  color: string
  background: string
  border: string
}

export const CATEGORIA_TAG: Record<Categoria, TagStyle> = {
  site: { color: '#2EE6F0', background: 'rgba(46,230,240,.12)', border: 'rgba(46,230,240,.35)' },
  automacao: { color: '#B79CFF', background: 'rgba(124,77,255,.16)', border: 'rgba(124,77,255,.45)' },
  ia: {
    color: '#EDEDF3',
    background: 'linear-gradient(90deg,rgba(46,230,240,.22),rgba(124,77,255,.28))',
    border: 'rgba(124,77,255,.45)',
  },
  sistema: { color: '#9A9AAE', background: 'transparent', border: '#9A9AAE' },
  conversar: { color: '#EDEDF3', background: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.08)' },
}
