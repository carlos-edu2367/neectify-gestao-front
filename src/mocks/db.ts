import type { LeadOut, NotaOut, ProjetoOut, Usuario } from '../api/types'

/** Banco em memoria usado pelo MSW (somente desenvolvimento e testes). */

export const MOCK_USER: Usuario = {
  id: '00000000-0000-4000-8000-000000000001',
  nome: 'Carlos',
  email: 'carlos@neectify.com',
}
export const MOCK_PASSWORD = 'senha-teste'

const DAY = 86_400_000
const now = Date.now()
const ago = (days: number) => new Date(now - days * DAY).toISOString()

const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

type Seed = Partial<LeadOut> &
  Pick<
    LeadOut,
    'nome' | 'email' | 'whatsapp' | 'categoria' | 'segmento' | 'porte' | 'urgencia' | 'dor' | 'status' | 'canal'
  >

function lead(n: number, criadoHa: number, atualizadoHa: number, s: Seed): LeadOut {
  return {
    id: uid(100 + n),
    empresa: null,
    origem_pagina: '/',
    referrer: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    consentimento_marketing: false,
    created_at: ago(criadoHa),
    status_atualizado_em: ago(atualizadoHa),
    ...s,
  }
}

export const seedLeads = (): LeadOut[] => [
  // parado: novo ha mais de 2 dias
  lead(1, 3.2, 3.2, {
    nome: 'Marcos Oliveira',
    empresa: 'Padaria Pão Quente',
    email: 'marcos@paoquente.com.br',
    whatsapp: '+5562991234567',
    categoria: 'site',
    segmento: 'Restaurante / alimentação',
    porte: 'ate10',
    urgencia: 'semanas',
    dor: 'Minha padaria não aparece no Google e os clientes perguntam o horário o dia todo no WhatsApp.',
    status: 'novo',
    canal: 'google',
    origem_pagina: '/servicos/site',
    referrer: 'https://www.google.com/',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'site-goiania',
    utm_term: 'site para padaria',
    consentimento_marketing: true,
  }),
  lead(2, 6, 1.5, {
    nome: 'Rogério Tavares',
    empresa: 'Tavares Construtora',
    email: 'rogerio@tavaresconstrutora.com.br',
    whatsapp: '+5562998765432',
    categoria: 'sistema',
    segmento: 'Construção e reforma',
    porte: '11a50',
    urgencia: 'meses',
    dor: 'Controlo as obras em planilha e perco o controle de materiais e prazos entre as equipes.',
    status: 'conversando',
    canal: 'meta',
    origem_pagina: '/servicos/sistema',
    referrer: 'https://l.instagram.com/',
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'sistema-obras',
    utm_content: 'video-planilha',
    consentimento_marketing: true,
  }),
  lead(3, 9, 2, {
    nome: 'Dra. Camila Nogueira',
    empresa: 'Clínica Camila Nogueira Estética',
    email: 'contato@camilanogueira.com.br',
    whatsapp: '+5562984561122',
    categoria: 'ia',
    segmento: 'Saúde e estética',
    porte: 'ate10',
    urgencia: 'semanas',
    dor: 'Perco agendamentos fora do horário comercial. Queria um atendimento automático no WhatsApp.',
    status: 'proposta',
    canal: 'indicacao',
    origem_pagina: '/servicos/ia',
    consentimento_marketing: true,
  }),
  // parado: novo ha mais de 2 dias
  lead(4, 4.5, 4.5, {
    nome: 'Edson Ferreira',
    empresa: 'Mercadinho Bom Preço',
    email: 'edson@mercadinhobompreco.com.br',
    whatsapp: '+5562993340011',
    categoria: 'automacao',
    segmento: 'Varejo / mercado',
    porte: 'ate10',
    urgencia: 'imediata',
    dor: 'Faço pedido de reposição a fornecedores na mão, toda semana, e esqueço itens.',
    status: 'novo',
    canal: 'direto',
    origem_pagina: '/',
  }),
  // sem empresa, sem UTM, sem referrer
  lead(5, 0.2, 0.2, {
    nome: 'Juliana Prado',
    empresa: null,
    email: 'juliana.prado@gmail.com',
    whatsapp: '+5562981112233',
    categoria: 'conversar',
    segmento: 'Outro',
    porte: 'solo',
    urgencia: 'pesquisando',
    dor: 'Trabalho sozinha com doces por encomenda e não sei por onde começar a organizar.',
    status: 'novo',
    canal: 'direto',
    origem_pagina: '/contato',
  }),
  lead(6, 21, 12, {
    nome: 'Fernanda Lima',
    empresa: 'Cantina da Fê',
    email: 'fe@cantinadafe.com.br',
    whatsapp: '+5562992223344',
    categoria: 'automacao',
    segmento: 'Restaurante / alimentação',
    porte: 'ate10',
    urgencia: 'semanas',
    dor: 'Pedidos chegam por WhatsApp, Instagram e telefone, e eu anoto tudo em caderno.',
    status: 'fechado',
    canal: 'google',
    origem_pagina: '/servicos/automacao',
    referrer: 'https://www.google.com/',
    utm_source: 'google',
    utm_medium: 'organic',
    consentimento_marketing: true,
  }),
  lead(7, 28, 20, {
    nome: 'Paulo Henrique Souza',
    empresa: 'PH Contabilidade',
    email: 'paulo@phcontabilidade.com.br',
    whatsapp: '+5562985550099',
    categoria: 'site',
    segmento: 'Serviços profissionais',
    porte: 'ate10',
    urgencia: 'meses',
    dor: 'Meu site atual é de 2015 e não funciona direito no celular.',
    status: 'perdido',
    canal: 'google',
    origem_pagina: '/servicos/site',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'site-goiania',
  }),
  lead(8, 14, 5, {
    nome: 'Ana Beatriz Cardoso',
    empresa: 'Móveis Cardoso',
    email: 'ana@moveiscardoso.com.br',
    whatsapp: '+5562996667788',
    categoria: 'sistema',
    segmento: 'Indústria',
    porte: '50mais',
    urgencia: 'meses',
    dor: 'Preciso integrar o estoque da fábrica com as lojas e emitir orçamentos mais rápido.',
    status: 'conversando',
    canal: 'indicacao',
    origem_pagina: '/servicos/sistema',
  }),
  lead(9, 0.6, 0.6, {
    nome: 'Thiago Moreira',
    empresa: 'Idiomas Moreira',
    email: 'thiago@idiomasmoreira.com.br',
    whatsapp: '+5562987776655',
    categoria: 'ia',
    segmento: 'Educação',
    porte: 'ate10',
    urgencia: 'semanas',
    dor: 'Quero responder dúvidas de matrícula automaticamente e não perder aluno novo.',
    status: 'novo',
    canal: 'meta',
    origem_pagina: '/servicos/ia',
    referrer: 'https://l.facebook.com/',
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'ia-atendimento',
    consentimento_marketing: true,
  }),
  lead(10, 35, 24, {
    nome: 'Valdir Santos',
    empresa: 'Auto Mecânica Santos',
    email: 'valdir@mecanicasantos.com.br',
    whatsapp: '+5562994448899',
    categoria: 'site',
    segmento: 'Serviços profissionais',
    porte: 'ate10',
    urgencia: 'imediata',
    dor: 'Quero um site simples com endereço, serviços e botão de WhatsApp.',
    status: 'fechado',
    canal: 'outro',
    origem_pagina: '/servicos/site',
    referrer: 'https://www.bing.com/',
  }),
  lead(11, 5, 1, {
    nome: 'Larissa Duarte',
    empresa: 'Duarte Moda Feminina',
    email: 'larissa@duartemoda.com.br',
    whatsapp: '+5562983332211',
    categoria: 'automacao',
    segmento: 'Varejo / mercado',
    porte: 'ate10',
    urgencia: 'semanas',
    dor: 'Preciso avisar clientes sobre novidades e acompanhar quem comprou sem fazer tudo manual.',
    status: 'proposta',
    canal: 'meta',
    origem_pagina: '/servicos/automacao',
    utm_source: 'instagram',
    utm_medium: 'paid_social',
    utm_campaign: 'automacao-varejo',
    consentimento_marketing: true,
  }),
  lead(12, 18, 10, {
    nome: 'Dr. Ricardo Almeida',
    empresa: 'Almeida Advocacia',
    email: 'ricardo@almeidaadvocacia.com.br',
    whatsapp: '+5562980001122',
    categoria: 'conversar',
    segmento: 'Serviços profissionais',
    porte: 'ate10',
    urgencia: 'pesquisando',
    dor: 'Ainda estou vendo o que faz sentido para o escritório.',
    status: 'perdido',
    canal: 'direto',
    origem_pagina: '/contato',
  }),
]

export const seedProjetos = (): ProjetoOut[] => [
  {
    id: uid(201),
    lead_id: uid(106),
    lead_nome: 'Fernanda Lima',
    titulo: 'Automação de pedidos da Cantina da Fê',
    valor: '4500.00',
    forma_pagamento: 'PIX',
    status: 'andamento',
    planejamento: 'Centralizar pedidos de WhatsApp e Instagram em um painel único.',
    ultima_atualizacao: 'Integração com WhatsApp concluída; falta o painel da cozinha.',
    created_at: ago(12),
    updated_at: ago(2),
  },
  {
    id: uid(202),
    lead_id: uid(110),
    lead_nome: 'Valdir Santos',
    titulo: 'Site institucional Auto Mecânica Santos',
    valor: '2200.00',
    forma_pagamento: 'CREDITO',
    status: 'revisao',
    planejamento: null,
    ultima_atualizacao: 'Aguardando fotos da oficina.',
    created_at: ago(24),
    updated_at: ago(4),
  },
]

export const seedNotas = (): Record<string, NotaOut[]> => ({
  [uid(102)]: [
    { id: uid(301), texto: 'Ligou pedindo prazo; quer reunião na quinta.', created_at: ago(1.5) },
    { id: uid(302), texto: 'Primeiro contato por WhatsApp feito.', created_at: ago(5) },
  ],
  [uid(103)]: [{ id: uid(303), texto: 'Proposta de chatbot enviada por e-mail.', created_at: ago(2) }],
})

export interface MockDb {
  leads: LeadOut[]
  projetos: ProjetoOut[]
  notas: Record<string, NotaOut[]>
  /** quando true, rotas autenticadas respondem 401 mesmo com cookie */
  sessionExpired: boolean
  /** status HTTP a forcar na proxima chamada de PATCH /v1/leads/:id (teste de falha) */
  failNextLeadPatch: number | null
  seq: number
}

export const db: MockDb = {
  leads: seedLeads(),
  projetos: seedProjetos(),
  notas: seedNotas(),
  sessionExpired: false,
  failNextLeadPatch: null,
  seq: 1000,
}

export function nextId(): string {
  db.seq += 1
  return uid(db.seq)
}

export function resetDb() {
  db.leads = seedLeads()
  db.projetos = seedProjetos()
  db.notas = seedNotas()
  db.sessionExpired = false
  db.failNextLeadPatch = null
}
